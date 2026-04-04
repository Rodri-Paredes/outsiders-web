# ANÁLISIS COMPLETO DEL FLUJO DE STOCK - OUTSIDERS ERP
## Fecha: 2026-03-01

---

## 📊 RESUMEN EJECUTIVO

He realizado una revisión exhaustiva de todo el flujo de stock en el sistema. El flujo está **FUNCIONAL** pero tiene **PROBLEMAS CRÍTICOS** que podrían causar inconsistencias de datos.

### Estado General: ⚠️ FUNCIONAL CON PROBLEMAS CRÍTICOS

---

## ✅ PUNTOS FUERTES IDENTIFICADOS

### 1. Estructura de Base de Datos Sólida
- ✅ Tabla `stock` correctamente definida con constraint UNIQUE(variant_id, branch_id)
- ✅ Check constraint para prevenir stock negativo: `CHECK (quantity >= 0)`
- ✅ Foreign keys apropiados con CASCADE en deletes
- ✅ RLS (Row Level Security) implementado correctamente

### 2. Función update_stock Robusta
- ✅ Valida que el stock no quede negativo antes de actualizar
- ✅ Usa UPSERT (INSERT ... ON CONFLICT) para manejar registros nuevos
- ✅ Inicializa automáticamente en 0 si no existe registro previo
- ✅ Maneja transacciones atómicas

### 3. Integración con Ventas Automática
- ✅ Trigger `after_sale_item_insert_update_stock` descuenta stock automáticamente
- ✅ Función `create_complete_sale` valida stock ANTES de crear la venta
- ✅ Todo el flujo de venta es transaccional
- ✅ No hay doble descuento de stock (problema antiguo ya corregido)

### 4. UI de Stock Completa
- ✅ Página de stock con filtros y búsqueda
- ✅ Modal de ajuste de stock con 3 tipos: ADD, SUBTRACT, SET
- ✅ Modal de transferencia entre sucursales
- ✅ Indicadores visuales de stock bajo
- ✅ Validaciones en el frontend antes de enviar

### 5. Servicio de Stock Completo
- ✅ Métodos bien documentados
- ✅ Manejo de errores apropiado
- ✅ Métodos: getStockByBranch, getStockByVariant, updateStock, transferStock, setStock, initializeStock

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### ⛔ PROBLEMA #1: Transferencias NO son Transaccionales (CRÍTICO)
**Archivo:** `src/services/stockService.ts` líneas 134-173

**Problema:**
```typescript
async transferStock(variantId, fromBranchId, toBranchId, quantity) {
  // Verificar stock disponible en origen
  const stockOrigen = await this.getStockByVariant(variantId, fromBranchId);
  
  // Restar del origen (llamada 1 - puede fallar)
  await this.updateStock(variantId, fromBranchId, -quantity);
  
  // Sumar al destino (llamada 2 - SI ESTO FALLA, ya se restó del origen!)
  await this.updateStock(variantId, toBranchId, quantity);
}
```

**Impacto:**
- ❌ Si la segunda llamada falla, el stock desaparece del sistema
- ❌ No hay rollback automático
- ❌ Posible pérdida de inventario
- ❌ Datos inconsistentes entre sucursales

**Solución Requerida:**
Crear una función de base de datos `transfer_stock_atomic` que haga ambas operaciones en una sola transacción.

---

### ⛔ PROBLEMA #2: Falta Sistema de Auditoría (CRÍTICO)
**Impacto en:** Todo el sistema de stock

**Problema:**
- ❌ No existe tabla `stock_movements` o `stock_history`
- ❌ No se registra quién hizo los ajustes
- ❌ No se registra el motivo de los ajustes
- ❌ No se registra la fecha/hora de los cambios
- ❌ Imposible auditar o rastrear cambios en el inventario

**Lo que se pierde:**
- Historial de transferencias entre sucursales
- Razón de ajustes de inventario (notas del usuario)
- Quién realizó cada operación
- Detección de mermas o robos
- Reconciliación de inventarios

**Solución Requerida:**
Crear tabla `stock_movements` con campos:
- id, variant_id, branch_id, movement_type, quantity
- previous_quantity, new_quantity, reason, notes
- user_id, created_at

---

### ⚠️ PROBLEMA #3: Campo "notes" en Transferencias No Se Guarda
**Archivo:** `src/components/stock/TransferStockModal.tsx` línea 23

**Problema:**
```typescript
const [notes, setNotes] = useState(''); // Se captura pero NO se usa

await stockService.transferStock(
  stockItem.variant_id,
  stockItem.branch_id,
  targetBranchId,
  quantity
  // ❌ notes NO se pasa como parámetro
);
```

**Impacto:**
- ❌ Usuario escribe notas pero se pierden
- ❌ No hay registro del propósito de la transferencia
- ❌ Mala experiencia de usuario

---

### ⚠️ PROBLEMA #4: Race Condition en setStock
**Archivo:** `src/services/stockService.ts` líneas 103-127

**Problema:**
```typescript
async setStock(variantId, branchId, newQuantity) {
  // PASO 1: Leer stock actual
  const currentStock = await this.getStockByVariant(variantId, branchId);
  
  // PASO 2: Calcular diferencia
  const difference = newQuantity - (currentStock?.quantity || 0);
  
  // PASO 3: Actualizar con la diferencia
  await supabase.rpc('update_stock', { p_quantity: difference });
}
```

**Escenario de Race Condition:**
1. Usuario A lee stock actual: 10
2. Usuario B lee stock actual: 10
3. Usuario A establece nuevo stock en 15 (diferencia +5)
4. Usuario B establece nuevo stock en 20 (diferencia +10, pero basado en lectura antigua)
5. Resultado final: 20 ❌ (debería ser 25 o el último valor real)

**Solución:**
La función de DB debería aceptar el valor absoluto directamente, no una diferencia.

---

### ⚠️ PROBLEMA #5: Validación de Stock en Ajustes Insuficiente
**Archivo:** `src/components/stock/AdjustStockModal.tsx` líneas 69-76

**Problema:**
```typescript
if (adjustmentType === 'SUBTRACT' && quantity > stockItem.quantity) {
  Toast.error('No puedes restar más de lo disponible');
  return;
}
```

**Escenario Problemático:**
1. Modal abre con stock actual: 10
2. Mientras el usuario llena el formulario, se realiza una venta que baja el stock a 5
3. Usuario intenta restar 8 (que originalmente era válido)
4. Validación del frontend pasa (porque stockItem.quantity todavía es 10)
5. La base de datos rechaza la operación ✅ (la función sí valida)
6. Usuario ve error genérico

**Mejor Práctica:**
- Revalidar stock en el backend antes de aplicar ajustes
- Mostrar mensaje de error específico cuando el stock cambió
- Considerar agregar un campo "expected_current_quantity" para detectar cambios

---

### 🔵 PROBLEMA #6: Falta Función DB para Transferencias
**Contexto:** No existe una función `transfer_stock` en el schema principal

**Problema:**
- ❌ Las transferencias se hacen con 2 llamadas HTTP separadas desde el frontend
- ❌ Mayor latencia de red
- ❌ Mayor probabilidad de fallo
- ❌ No se puede hacer rollback fácilmente

**Nota:** Existe una función `transfer_stock` en `frontend/supabase/funciones-erp.sql` pero:
- ❌ No está en las migraciones del ERP
- ❌ Usa un modelo diferente con `stock_movements` que no existe
- ❌ Inconsistencia entre frontend y ERP

---

## 📝 FLUJOS DOCUMENTADOS

### Flujo 1: Venta (CORRECTO ✅)
```
1. Usuario crea venta en frontend
2. Frontend llama: salesService.createSale()
3. Service llama RPC: create_complete_sale()
4. Función DB valida:
   - Usuario autenticado ✅
   - Caja abierta ✅
   - Stock disponible ANTES de crear venta ✅
5. Función DB crea registro en tabla `sales`
6. Función DB crea registros en `sale_items`
7. Trigger automático: after_sale_item_insert_update_stock
8. Trigger llama: trigger_update_stock_on_sale()
9. Función llama: update_stock() con cantidad negativa
10. Stock se descuenta atómicamente ✅
11. Trigger de caja registra movimiento ✅
```

**Análisis:** Este flujo está PERFECTO. Es transaccional, atómico, y con validaciones apropiadas.

---

### Flujo 2: Ajuste de Stock (FUNCIONAL ⚠️)
```
1. Usuario abre modal de ajuste
2. Selecciona tipo: ADD / SUBTRACT / SET
3. Frontend valida cantidad (pueden haber race conditions)
4. Frontend llama: stockService.updateStock()
5. Service llama RPC: update_stock()
6. Función DB valida stock no negativo ✅
7. Función DB hace UPSERT ✅
8. ❌ NO se registra la razón del ajuste
9. ❌ NO se registra quién hizo el ajuste
10. ❌ NO se guarda historial
```

**Análisis:** Funcional pero sin auditoría. Problema de seguridad y compliance.

---

### Flujo 3: Transferencia Entre Sucursales (PROBLEMÁTICO ⛔)
```
1. Usuario abre modal de transferencia
2. Selecciona sucursal destino y cantidad
3. Frontend valida (pero puede tener datos desactualizados)
4. Frontend llama: stockService.transferStock()
5. Service hace: getStockByVariant() - Llamada HTTP #1
6. Service valida stock disponible
7. Service llama: updateStock(origen, -cantidad) - Llamada HTTP #2
   ⚠️ SI ESTO FALLA AQUÍ, todo revierte ✅
8. Service llama: updateStock(destino, +cantidad) - Llamada HTTP #3
   ⛔ SI ESTO FALLA AQUÍ, stock ya se restó del origen! ❌
9. ❌ Las "notes" del usuario se pierden
10. ❌ NO se registra el historial de la transferencia
```

**Análisis:** Flujo NO transaccional. Riesgo de pérdida de inventario.

---

### Flujo 4: Inicialización de Stock en Productos Nuevos (CORRECTO ✅)
```
1. Usuario crea/edita producto con tallas
2. Frontend llama: stockService.initializeStock() por cada talla
3. Service hace INSERT directo en tabla `stock`
4. Si ya existe (por UNIQUE constraint), lanza error
5. Frontend maneja error llamando setStock() en su lugar ✅
```

**Análisis:** Funcional con manejo de errores apropiado.

---

## 🔧 RECOMENDACIONES PRIORITARIAS

### 🔴 PRIORIDAD 1: Crear Función Transaccional para Transferencias
**Archivo a crear:** `migrations/20260301_add_transfer_stock_function.sql`

```sql
CREATE OR REPLACE FUNCTION transfer_stock_atomic(
  p_variant_id uuid,
  p_from_branch_id uuid,
  p_to_branch_id uuid,
  p_quantity integer,
  p_notes text DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_from_stock integer;
  v_user_id uuid;
BEGIN
  -- Validar usuario
  SELECT id INTO v_user_id FROM users WHERE id = auth.uid();
  
  -- Validar que las sucursales sean diferentes
  IF p_from_branch_id = p_to_branch_id THEN
    RAISE EXCEPTION 'No se puede transferir a la misma sucursal';
  END IF;
  
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
  END IF;
  
  -- Obtener stock origen (con FOR UPDATE para bloquear la fila)
  SELECT quantity INTO v_from_stock
  FROM stock
  WHERE variant_id = p_variant_id AND branch_id = p_from_branch_id
  FOR UPDATE;
  
  -- Validar stock disponible
  IF v_from_stock IS NULL OR v_from_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente en origen. Disponible: %, Requerido: %', 
      COALESCE(v_from_stock, 0), p_quantity;
  END IF;
  
  -- Restar del origen (dentro de la misma transacción)
  PERFORM update_stock(p_variant_id, p_from_branch_id, -p_quantity);
  
  -- Sumar al destino (dentro de la misma transacción)
  PERFORM update_stock(p_variant_id, p_to_branch_id, p_quantity);
  
  -- TODO: Registrar en stock_movements cuando exista la tabla
  
  RETURN jsonb_build_object(
    'success', true,
    'variant_id', p_variant_id,
    'from_branch_id', p_from_branch_id,
    'to_branch_id', p_to_branch_id,
    'quantity', p_quantity,
    'notes', p_notes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 🔴 PRIORIDAD 2: Crear Sistema de Auditoría de Stock
**Archivos a crear:**
1. `migrations/20260301_create_stock_movements_table.sql`
2. `migrations/20260301_add_stock_audit_triggers.sql`

**Tabla stock_movements:**
```sql
CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id),
  branch_id uuid NOT NULL REFERENCES branches(id),
  movement_type text NOT NULL CHECK (
    movement_type IN ('VENTA', 'AJUSTE_ENTRADA', 'AJUSTE_SALIDA', 
                      'TRANSFERENCIA_SALIDA', 'TRANSFERENCIA_ENTRADA',
                      'INICIALIZACION', 'CORRECCION')
  ),
  quantity integer NOT NULL,
  previous_quantity integer NOT NULL,
  new_quantity integer NOT NULL,
  reason text,
  notes text,
  user_id uuid REFERENCES users(id),
  related_sale_id uuid REFERENCES sales(id),
  related_transfer_id uuid, -- Para vincular origen/destino en transferencias
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX idx_stock_movements_branch ON stock_movements(branch_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX idx_stock_movements_user ON stock_movements(user_id);
```

---

### 🟡 PRIORIDAD 3: Actualizar stockService para Usar Nueva Función
**Archivo:** `src/services/stockService.ts`

```typescript
async transferStock(
  variantId: string,
  fromBranchId: string,
  toBranchId: string,
  quantity: number,
  notes?: string // AGREGAR parámetro notes
) {
  try {
    // Llamar a la función transaccional de la base de datos
    const { data, error } = await supabase.rpc('transfer_stock_atomic', {
      p_variant_id: variantId,
      p_from_branch_id: fromBranchId,
      p_to_branch_id: toBranchId,
      p_quantity: quantity,
      p_notes: notes || null
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error transferring stock:', error);
    throw error;
  }
}
```

---

### 🟡 PRIORIDAD 4: Actualizar TransferStockModal
**Archivo:** `src/components/stock/TransferStockModal.tsx`

```typescript
// Línea 53 - MODIFICAR para pasar notes:
await stockService.transferStock(
  stockItem.variant_id,
  stockItem.branch_id,
  targetBranchId,
  quantity,
  notes // AGREGAR este parámetro
);
```

---

### 🟢 PRIORIDAD 5: Agregar Validación Optimista en Ajustes
**Archivo:** `src/components/stock/AdjustStockModal.tsx`

Agregar validación de "expected quantity" para detectar race conditions:

```typescript
try {
  await stockService.updateStockWithValidation(
    stockItem.variant_id,
    stockItem.branch_id,
    adjustmentQuantity,
    stockItem.quantity // Expected current quantity
  );
} catch (error: any) {
  if (error.message?.includes('cantidad esperada no coincide')) {
    Toast.error('El stock cambió desde que abriste este modal. Por favor recarga la página.');
  } else {
    Toast.error('Error al actualizar stock');
  }
}
```

---

### 🟢 PRIORIDAD 6: Crear Vista de Historial de Stock
**Nueva página:** `src/pages/StockHistoryPage.tsx`

Mostrar todo el historial de movimientos de stock con:
- Filtros por producto, sucursal, fecha, tipo de movimiento
- Exportación a Excel
- Gráficos de tendencias
- Alertas de movimientos sospechosos

---

## 📊 MÉTRICAS DE CALIDAD DEL CÓDIGO

| Aspecto | Calificación | Comentario |
|---------|--------------|------------|
| Estructura de BD | 9/10 ⭐⭐⭐⭐⭐ | Excelente diseño, constraints apropiados |
| Transaccionalidad | 6/10 ⚠️ | Ventas OK, transferencias problemáticas |
| Validaciones | 8/10 ⭐⭐⭐⭐ | Buenas validaciones pero con gaps |
| Auditoría | 2/10 ❌ | Casi inexistente, crítico mejorar |
| UI/UX | 8/10 ⭐⭐⭐⭐ | Interfaz clara y funcional |
| Manejo de Errores | 7/10 ⚠️ | Aceptable pero mejorable |
| Documentación | 7/10 ⚠️ | Código documentado, falta docs de sistema |

**Calificación Global: 6.7/10** - Funcional pero con problemas críticos que resolver

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

1. **HOY:** Crear función `transfer_stock_atomic` y actualizar el servicio
2. **HOY:** Actualizar `TransferStockModal` para pasar las notas
3. **MAÑANA:** Crear tabla `stock_movements` y triggers de auditoría
4. **ESTA SEMANA:** Implementar validación optimista en ajustes
5. **PRÓXIMA SEMANA:** Crear página de historial de stock

---

## 📌 CONCLUSIÓN

El sistema de stock está **FUNCIONAL** y puede usarse en producción, pero tiene **RIESGOS IMPORTANTES**:

### ✅ Puede usarse para:
- Ventas (flujo perfecto)
- Ajustes de stock (funcional)
- Consultas de inventario
- Alertas de stock bajo

### ⛔ No recomendado para:
- Transferencias entre sucursales (hasta implementar función transaccional)
- Auditorías de inventario (falta historial)
- Reconciliación con proveedores
- Detección de mermas/robos

### 🔧 Debe corregirse ANTES de producción:
1. Función transaccional para transferencias
2. Sistema de auditoría/historial
3. Validaciones de race conditions

---

**Analista:** GitHub Copilot  
**Fecha:** 2026-03-01  
**Versión del Documento:** 1.0  
