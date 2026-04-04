# ORDEN DE EJECUCIÓN DE MIGRACIONES - CORRECCIÓN DEL FLUJO DE STOCK
## Fecha: 2026-03-01

---

## ⚠️ IMPORTANTE: EJECUTAR EN ORDEN

Estas migraciones deben ejecutarse **EN ORDEN SECUENCIAL** para corregir los problemas críticos del flujo de stock.

---

## 📋 ORDEN DE EJECUCIÓN

### 1. Función Transaccional para Transferencias
**Archivo:** `20260301_add_transfer_stock_atomic.sql`  
**Propósito:** Crear función atómica para transferencias seguras  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** < 1 segundo  

```sql
-- Ejecutar en Supabase SQL Editor:
\i 20260301_add_transfer_stock_atomic.sql
```

**Qué hace:**
- Crea función `transfer_stock_atomic()`
- Garantiza que origen y destino se actualicen en una sola transacción
- Si cualquier operación falla, toda la transferencia revierte
- Incluye bloqueo de filas para evitar race conditions

**Validación:**
```sql
-- Verificar que la función existe:
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'transfer_stock_atomic';
```

---

### 2. Tabla de Auditoría de Stock
**Archivo:** `20260301_create_stock_movements_table.sql`  
**Propósito:** Crear sistema de auditoría para rastrear movimientos  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** < 1 segundo  

```sql
-- Ejecutar en Supabase SQL Editor:
\i 20260301_create_stock_movements_table.sql
```

**Qué hace:**
- Crea tabla `stock_movements`
- Crea índices para optimizar consultas
- Configura RLS (Row Level Security)
- Crea vista `stock_movements_detailed`

**Validación:**
```sql
-- Verificar que la tabla existe:
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'stock_movements';

-- Verificar índices:
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'stock_movements';
```

---

### 3. Triggers de Auditoría Automática
**Archivo:** `20260301_add_stock_audit_triggers.sql`  
**Propósito:** Registrar automáticamente todos los movimientos de stock  
**Prioridad:** 🔴 CRÍTICA  
**Tiempo estimado:** < 1 segundo  
**Depende de:** Migración #1 y #2  

```sql
-- Ejecutar en Supabase SQL Editor:
\i 20260301_add_stock_audit_triggers.sql
```

**Qué hace:**
- Crea función `register_stock_movement()`
- Crea trigger `trigger_audit_stock_changes` en tabla `stock`
- Actualiza función `update_stock_with_audit()`
- Actualiza función `transfer_stock_atomic()` para usar auditoría
- Actualiza trigger de ventas para registrar auditoría

**Validación:**
```sql
-- Verificar triggers:
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'stock'::regclass;

-- Verificar funciones de auditoría:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'register_stock_movement',
  'update_stock_with_audit',
  'trigger_update_stock_on_sale'
);
```

---

## 🧪 TESTING POST-MIGRACIÓN

### Test 1: Transferencia Atómica
```sql
-- Preparar datos de prueba
INSERT INTO stock (variant_id, branch_id, quantity)
VALUES 
  ('variant-test-1', 'branch-1', 100),
  ('variant-test-1', 'branch-2', 50);

-- Ejecutar transferencia
SELECT transfer_stock_atomic(
  'variant-test-1',
  'branch-1',
  'branch-2',
  10,
  'Test de transferencia'
);

-- Verificar stock actualizado
SELECT * FROM stock 
WHERE variant_id = 'variant-test-1';

-- Verificar auditoría registrada
SELECT * FROM stock_movements_detailed
WHERE variant_id = 'variant-test-1'
ORDER BY created_at DESC
LIMIT 2;
```

**Resultado esperado:**
- Stock en branch-1: 90 (100 - 10)
- Stock en branch-2: 60 (50 + 10)
- 2 registros en stock_movements con el mismo `related_transfer_id`

---

### Test 2: Auditoría en Ajustes
```sql
-- Actualizar stock manualmente
PERFORM update_stock_with_audit(
  'variant-test-1',
  'branch-1',
  5,
  'AJUSTE_ENTRADA',
  'Entrada de mercadería',
  'Compra a proveedor XYZ',
  NULL,
  NULL
);

-- Verificar auditoría
SELECT * FROM stock_movements_detailed
WHERE variant_id = 'variant-test-1'
  AND movement_type = 'AJUSTE_ENTRADA';
```

**Resultado esperado:**
- 1 registro en stock_movements con todos los detalles

---

### Test 3: Rollback en Transferencia Fallida
```sql
-- Intentar transferir más stock del disponible
SELECT transfer_stock_atomic(
  'variant-test-1',
  'branch-1',
  'branch-2',
  1000,  -- Más de lo disponible
  'Este debe fallar'
);
```

**Resultado esperado:**
- Error: "Stock insuficiente en sucursal..."
- Stock NO cambia en ninguna sucursal
- NO se crea registro en stock_movements (transacción revertida)

---

## 🔄 ROLLBACK (SI NECESARIO)

### Si necesitas revertir las migraciones:

```sql
-- PASO 1: Eliminar triggers
DROP TRIGGER IF EXISTS trigger_audit_stock_changes ON stock;
DROP TRIGGER IF EXISTS after_sale_item_insert_update_stock ON sale_items;

-- PASO 2: Eliminar funciones nuevas
DROP FUNCTION IF EXISTS register_stock_movement();
DROP FUNCTION IF EXISTS update_stock_with_audit(uuid, uuid, integer, text, text, text, uuid, uuid);
DROP FUNCTION IF EXISTS transfer_stock_atomic(uuid, uuid, uuid, integer, text);

-- PASO 3: Restaurar función de ventas original
-- (ver migración 20251221_complete_business_logic.sql)

-- PASO 4: Eliminar vista
DROP VIEW IF EXISTS stock_movements_detailed;

-- PASO 5: Eliminar tabla de auditoría
DROP TABLE IF EXISTS stock_movements CASCADE;

-- PASO 6: Restaurar funciones originales si es necesario
-- (ver migraciones anteriores)
```

⚠️ **ADVERTENCIA:** 
- El rollback eliminará TODO el historial de movimientos
- Solo hacer rollback en caso de emergencia
- Considera hacer backup de `stock_movements` antes de rollback

---

## 📊 MONITOREO POST-MIGRACIÓN

### Queries útiles para monitorear:

```sql
-- 1. Resumen de movimientos por tipo
SELECT 
  movement_type,
  COUNT(*) as cantidad,
  SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END) as total_entradas,
  SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END) as total_salidas
FROM stock_movements
WHERE created_at >= CURRENT_DATE
GROUP BY movement_type
ORDER BY cantidad DESC;

-- 2. Transferencias del día con detalles
SELECT 
  related_transfer_id,
  product_name,
  variant_size,
  branch_name,
  movement_type,
  quantity,
  notes,
  user_name,
  created_at
FROM stock_movements_detailed
WHERE movement_type IN ('TRANSFERENCIA_SALIDA', 'TRANSFERENCIA_ENTRADA')
  AND created_at >= CURRENT_DATE
ORDER BY related_transfer_id, created_at;

-- 3. Movimientos sospechosos (grandes cambios)
SELECT 
  product_name,
  variant_size,
  branch_name,
  movement_type,
  quantity,
  previous_quantity,
  new_quantity,
  user_name,
  created_at
FROM stock_movements_detailed
WHERE ABS(quantity) > 50  -- Ajustar threshold según necesidad
  AND movement_type NOT IN ('INICIALIZACION', 'VENTA')
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;

-- 4. Actividad por usuario
SELECT 
  user_name,
  movement_type,
  COUNT(*) as operaciones,
  SUM(ABS(quantity)) as unidades_movidas
FROM stock_movements_detailed
WHERE created_at >= CURRENT_DATE
GROUP BY user_name, movement_type
ORDER BY operaciones DESC;
```

---

## ✅ CHECKLIST DE VALIDACIÓN

Después de ejecutar las migraciones, verificar:

- [ ] Función `transfer_stock_atomic` existe
- [ ] Tabla `stock_movements` creada con todos los índices
- [ ] Vista `stock_movements_detailed` funciona
- [ ] Trigger `trigger_audit_stock_changes` activo en tabla `stock`
- [ ] Trigger de ventas actualizado para usar auditoría
- [ ] RLS configurado correctamente en `stock_movements`
- [ ] Test de transferencia exitosa pasa
- [ ] Test de rollback de transferencia pasa
- [ ] Frontend actualizado (`stockService.ts` y `TransferStockModal.tsx`)
- [ ] No hay errores en logs de Supabase
- [ ] Queries de monitoreo funcionan correctamente

---

## 📞 SOPORTE

Si tienes problemas durante la migración:

1. **Revisar logs de Supabase:**
   - Dashboard → Database → Query Editor → Query History
   - Buscar mensajes de error específicos

2. **Verificar permisos:**
   ```sql
   -- Verificar que el usuario tenga permisos
   SELECT usename, usesuper, usecreatedb 
   FROM pg_user 
   WHERE usename = current_user;
   ```

3. **Rollback parcial si es necesario:**
   - Ejecutar solo PASO 1 y PASO 2 del rollback
   - Mantener la tabla de auditoría pero sin triggers
   - Permite debugging sin perder datos

4. **Contactar a soporte técnico con:**
   - Mensaje de error completo
   - Query que falló
   - Resultado de queries de validación

---

**Documentado por:** GitHub Copilot  
**Fecha:** 2026-03-01  
**Versión:** 1.0  
