# 🧪 GUÍA DE TESTING - ERP OUTSIDERS

**Sistema:** ERP Mono-empresa Multi-sucursal  
**Fecha:** 21 de Diciembre, 2025  
**Estado:** Sistema completo - Listo para testing

---

## 📋 CHECKLIST DE PRUEBAS PREVIAS AL TESTING

### 1️⃣ **Verificar Migraciones Aplicadas**

```sql
-- Ejecutar en Supabase SQL Editor
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_complete_sale',
    'update_stock',
    'register_sale_movement',
    'open_cash_register',
    'close_cash_register'
  )
ORDER BY routine_name;
```

**Resultado esperado:** 5 funciones

### 2️⃣ **Verificar Triggers Activos**

```sql
-- Ejecutar en Supabase SQL Editor
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'after_sale_item_insert_update_stock',
    'after_sale_insert_register_cash'
  );
```

**Resultado esperado:** 2 triggers

---

## 🧪 PLAN DE PRUEBAS - PASO A PASO

### **FASE 1: CONFIGURACIÓN INICIAL** ⚙️

#### Paso 1.1: Crear Sucursal de Prueba
```
1. Login al sistema
2. Ir a configuración
3. Crear sucursal: "Sucursal Prueba - Centro"
4. Verificar que aparezca en el listado
```

#### Paso 1.2: Crear Productos de Prueba
```
1. Ir a Productos
2. Crear 3 productos:
   - Producto A: Remera Básica - Bs 150.00 - Categoría: REMERAS
   - Producto B: Jean Classic - Bs 350.00 - Categoría: JEANS  
   - Producto C: Buzo Hoodie - Bs 280.00 - Categoría: BUZOS
3. Para cada producto crear variantes:
   - Tallas: S, M, L, XL
4. Verificar que se crearon correctamente
```

#### Paso 1.3: Cargar Stock Inicial
```
1. Ir a Stock
2. Para cada producto/talla, usar "Ajustar Stock"
3. Agregar:
   - Remera S: +10 unidades
   - Remera M: +15 unidades
   - Remera L: +20 unidades
   - Remera XL: +5 unidades
   - Jean M: +8 unidades
   - Jean L: +12 unidades
   - Buzo M: +10 unidades
   - Buzo L: +15 unidades
4. Verificar que las cantidades se actualizaron
```

---

### **FASE 2: TESTING DE CAJA** 💰

#### Paso 2.1: Abrir Caja
```
1. Ir a Caja
2. Click en "Abrir Caja"
3. Ingresar fondo inicial: Bs 500.00
4. Agregar nota: "Apertura de prueba"
5. Confirmar

✅ Verificar:
- La caja aparece con estado ABIERTA
- Monto inicial: Bs 500.00
- Movimiento de apertura registrado
```

#### Paso 2.2: Verificar No Se Puede Abrir Dos Cajas
```
1. Intentar abrir otra caja
2. Debe mostrar error: "Ya existe una caja abierta"

✅ Validación correcta de caja única
```

---

### **FASE 3: TESTING DE VENTAS - CASOS BÁSICOS** 🛒

#### Caso 3.1: Venta Simple - Efectivo
```
1. Ir a Ventas
2. Agregar al carrito:
   - Remera Básica, Talla M, Cantidad: 2
3. Click en "Proceder al Pago"
4. Seleccionar método: EFECTIVO
5. Monto recibido: Bs 500.00
6. Confirmar venta

✅ Verificar:
- Venta creada exitosamente
- Cambio calculado: Bs 200.00 (500 - 300)
- Comprobante generado
- Stock descontado automáticamente:
  * Remera M: de 15 → 13 unidades
- Movimiento de caja registrado:
  * Tipo: INGRESO
  * Método: EFECTIVO
  * Monto: Bs 300.00
```

#### Caso 3.2: Venta Simple - QR
```
1. Agregar al carrito:
   - Jean Classic, Talla L, Cantidad: 1
2. Proceder al pago
3. Seleccionar método: QR
4. Confirmar venta (Bs 350.00)

✅ Verificar:
- Venta creada exitosamente
- Stock Jean L: de 12 → 11 unidades
- Movimiento de caja:
  * Método: QR
  * Monto: Bs 350.00
```

#### Caso 3.3: Venta Múltiple - Tarjeta
```
1. Agregar al carrito:
   - Remera Básica, Talla S, Cantidad: 3
   - Buzo Hoodie, Talla L, Cantidad: 2
2. Total esperado: (150×3) + (280×2) = Bs 1010.00
3. Proceder al pago
4. Seleccionar método: TARJETA
5. Confirmar venta

✅ Verificar:
- Total correcto: Bs 1010.00
- Stock actualizado:
  * Remera S: de 10 → 7
  * Buzo L: de 15 → 13
- Movimiento de caja:
  * Método: TARJETA
  * Monto: Bs 1010.00
```

---

### **FASE 4: TESTING DE VENTAS - CASOS AVANZADOS** 🎯

#### Caso 4.1: Venta con Descuento
```
1. Agregar al carrito:
   - Remera Básica, Talla M, Cantidad: 5
2. Subtotal: Bs 750.00
3. Aplicar descuento: Bs 50.00
4. Total: Bs 700.00
5. Pagar con EFECTIVO, Bs 1000.00
6. Confirmar

✅ Verificar:
- Descuento aplicado correctamente
- Total: Bs 700.00
- Cambio: Bs 300.00
- Stock descontado: 5 unidades
- Movimiento de caja: Bs 700.00
```

#### Caso 4.2: Pago Mixto
```
1. Agregar al carrito:
   - Jean Classic, Talla M, Cantidad: 2
2. Total: Bs 700.00
3. Proceder al pago
4. Seleccionar método: MIXTO
5. Distribuir pago:
   - Efectivo: Bs 300.00
   - QR: Bs 200.00
   - Tarjeta: Bs 200.00
6. Confirmar (debe sumar exactamente Bs 700.00)

✅ Verificar:
- Venta creada con payment_type: MIXTO
- payment_details contiene los 3 montos
- 3 movimientos de caja creados:
  * EFECTIVO: Bs 300.00
  * QR: Bs 200.00
  * TARJETA: Bs 200.00
- Stock descontado: 2 unidades Jean M
```

#### Caso 4.3: Validación - Pago Mixto Incorrecto
```
1. Agregar producto por Bs 500.00
2. Seleccionar MIXTO
3. Ingresar:
   - Efectivo: Bs 200.00
   - QR: Bs 100.00
   - Tarjeta: Bs 100.00
4. Intentar confirmar

❌ Debe mostrar error:
"Los montos del pago mixto no suman el total"

✅ Validación funcionando
```

---

### **FASE 5: TESTING DE VALIDACIONES** ⚠️

#### Caso 5.1: Venta Sin Caja Abierta
```
1. Cerrar la caja actual
2. Intentar hacer una venta
3. Agregar productos al carrito
4. Proceder al pago
5. Confirmar

❌ Debe mostrar error:
"No hay una caja abierta. Por favor, abre la caja antes de realizar ventas."

✅ Validación de caja funcionando
```

#### Caso 5.2: Venta Con Stock Insuficiente
```
1. Abrir caja nuevamente
2. Agregar al carrito:
   - Remera XL, Cantidad: 10 (solo hay 5 en stock)
3. Proceder al pago
4. Intentar confirmar

❌ Debe mostrar error:
"Stock insuficiente para completar la venta"

✅ Validación de stock funcionando
- Stock NO descontado
- Venta NO creada
- Caja NO registra movimiento
```

#### Caso 5.3: Efectivo Insuficiente
```
1. Agregar producto por Bs 300.00
2. Seleccionar EFECTIVO
3. Ingresar monto recibido: Bs 200.00
4. Intentar confirmar

❌ Debe mostrar error:
"El monto recibido es insuficiente"

✅ Validación en frontend
```

---

### **FASE 6: TESTING DE STOCK** 📦

#### Caso 6.1: Ajuste Manual - Agregar
```
1. Ir a Stock
2. Buscar Remera M (debe tener algunas unidades restantes)
3. Click en "Ajustar"
4. Cantidad: +20
5. Motivo: "Reposición de inventario"
6. Confirmar

✅ Verificar:
- Stock aumentó en 20 unidades
- Ajuste registrado en historial
```

#### Caso 6.2: Ajuste Manual - Restar
```
1. Buscar Buzo M
2. Click en "Ajustar"
3. Cantidad: -3
4. Motivo: "Productos dañados"
5. Confirmar

✅ Verificar:
- Stock disminuyó en 3 unidades
- Ajuste registrado
```

#### Caso 6.3: Transferencia Entre Sucursales
```
Prerequisito: Crear segunda sucursal "Sucursal Norte"

1. Ir a Stock
2. Seleccionar Jean L
3. Click en "Transferir"
4. Sucursal destino: Sucursal Norte
5. Cantidad: 5
6. Confirmar

✅ Verificar:
- Stock en Centro: -5 unidades
- Stock en Norte: +5 unidades
- Transferencia registrada
```

#### Caso 6.4: Stock Bajo
```
1. Activar filtro "Solo stock bajo"
2. Verificar que muestra productos con < 5 unidades
3. Icono de alerta visible en productos críticos

✅ Sistema de alertas funcionando
```

---

### **FASE 7: TESTING DE CAJA - CIERRE** 💵

#### Caso 7.1: Cierre de Caja Correcto
```
Prerequisito: Haber realizado varias ventas en diferentes métodos

1. Ir a Caja
2. Click en "Cerrar Caja"
3. Sistema muestra montos esperados:
   - Efectivo esperado: (calculado automáticamente)
   - QR esperado: (calculado)
   - Tarjeta esperado: (calculado)
   - Total esperado: (calculado)
4. Ingresar monto real en efectivo: (mismo que esperado)
5. Agregar nota: "Cierre sin diferencias"
6. Confirmar

✅ Verificar:
- Caja cerrada con status CERRADA
- Diferencia en efectivo: Bs 0.00
- Totales calculados correctamente
- No se puede hacer más ventas hasta abrir nueva caja
```

#### Caso 7.2: Cierre con Faltante
```
1. Abrir nueva caja con Bs 500.00
2. Realizar venta por Bs 300.00 en efectivo
3. Cerrar caja
4. Efectivo esperado: Bs 800.00
5. Ingresar monto real: Bs 750.00
6. Confirmar

✅ Verificar:
- Diferencia: -Bs 50.00 (faltante)
- Registro de diferencia en caja
- Alerta visible de faltante
```

#### Caso 7.3: Cierre con Sobrante
```
1. Abrir nueva caja
2. Realizar ventas
3. Al cerrar, ingresar monto mayor al esperado
4. Ej: Esperado Bs 1000.00, Real Bs 1050.00

✅ Verificar:
- Diferencia: +Bs 50.00 (sobrante)
- Registro de diferencia
```

---

### **FASE 8: TESTING DE REPORTES** 📊

#### Caso 8.1: Dashboard - KPIs
```
1. Ir a Dashboard
2. Seleccionar rango: Hoy
3. Verificar métricas:
   - Total de ventas (debe coincidir con ventas realizadas)
   - Cantidad de transacciones (contar ventas del día)
   - Ticket promedio (total / cantidad)
   - Productos vendidos (suma de quantities)

✅ Todos los números deben ser coherentes
```

#### Caso 8.2: Ventas por Método de Pago
```
1. En Dashboard, ver gráfico de métodos de pago
2. Verificar que coincida con ventas realizadas:
   - Efectivo: (sumar ventas en efectivo)
   - QR: (sumar ventas QR)
   - Tarjeta: (sumar ventas tarjeta)
   - Mixto: (sumar cada componente)

✅ Totales correctos por método
```

#### Caso 8.3: Top Productos
```
1. Ver sección "Top Productos Vendidos"
2. Verificar que muestre productos con más unidades vendidas
3. Ordenados de mayor a menor

✅ Ranking correcto
```

---

## 🔍 TESTING DE BASE DE DATOS DIRECTA

### Query 1: Verificar Triggers Ejecutados

```sql
-- Ver ventas con sus movimientos de caja
SELECT 
  s.id as sale_id,
  s.total as sale_total,
  s.payment_type,
  COUNT(cm.id) as cash_movements_count,
  SUM(cm.amount) as cash_total
FROM sales s
LEFT JOIN cash_movements cm ON cm.reference_id = s.id AND cm.reference_type = 'SALE'
WHERE s.created_at > now() - interval '1 day'
GROUP BY s.id, s.total, s.payment_type
ORDER BY s.created_at DESC;
```

**Verificar:**
- Cada venta tiene movimientos de caja correspondientes
- Los totales coinciden
- Pagos mixtos tienen múltiples movimientos

### Query 2: Verificar Stock Descontado

```sql
-- Comparar stock antes/después de ventas
SELECT 
  pv.size,
  p.name,
  s.quantity as current_stock,
  COALESCE(SUM(si.quantity), 0) as total_sold
FROM stock s
JOIN product_variants pv ON s.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
LEFT JOIN sale_items si ON si.variant_id = pv.id
GROUP BY pv.size, p.name, s.quantity
ORDER BY p.name, pv.size;
```

**Verificar:**
- Stock actual = Stock inicial - Total vendido

### Query 3: Verificar Transaccionalidad

```sql
-- Verificar que todas las ventas tienen items y movimientos
SELECT 
  'Ventas sin items' as issue,
  COUNT(*) as count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
WHERE si.id IS NULL

UNION ALL

SELECT 
  'Ventas sin movimientos de caja' as issue,
  COUNT(*) as count
FROM sales s
LEFT JOIN cash_movements cm ON s.id = cm.reference_id AND cm.reference_type = 'SALE'
WHERE cm.id IS NULL;
```

**Resultado esperado:** count = 0 para ambos

---

## 📝 CHECKLIST DE VALIDACIÓN FINAL

### Funcionalidades Core ✅
- [ ] Apertura de caja funcionando
- [ ] Ventas con todos los métodos de pago
- [ ] Descuento automático de stock
- [ ] Registro automático en caja
- [ ] Validación de stock insuficiente
- [ ] Validación de caja cerrada
- [ ] Pagos mixtos correctos
- [ ] Cierre de caja con arqueo
- [ ] Ajuste manual de stock
- [ ] Transferencias entre sucursales
- [ ] Reportes con datos correctos

### Validaciones ✅
- [ ] No se puede vender sin caja abierta
- [ ] No se puede vender con stock insuficiente
- [ ] No se puede abrir dos cajas simultáneamente
- [ ] Pagos mixtos deben sumar el total exacto
- [ ] Efectivo recibido debe ser mayor o igual al total

### Triggers Automáticos ✅
- [ ] Stock se descuenta automáticamente al crear venta
- [ ] Movimientos de caja se registran automáticamente
- [ ] No hay duplicación de descuentos
- [ ] No hay duplicación de movimientos

### Integridad de Datos ✅
- [ ] Todas las ventas tienen items
- [ ] Todas las ventas tienen movimientos de caja
- [ ] Los totales coinciden entre ventas y caja
- [ ] El stock es consistente con las ventas

---

## 🐛 REPORTE DE BUGS

Si encuentras algún problema durante el testing, documéntalo así:

```markdown
### Bug #[número]
- **Severidad:** Crítica / Alta / Media / Baja
- **Módulo:** Ventas / Stock / Caja / Productos / Reportes
- **Descripción:** [Qué pasó]
- **Pasos para reproducir:**
  1. [Paso 1]
  2. [Paso 2]
  3. [Resultado obtenido]
- **Resultado esperado:** [Qué debería pasar]
- **Capturas:** [Si es posible]
```

---

## ✅ CRITERIOS DE ACEPTACIÓN

El sistema pasa el testing si:

1. ✅ **Todas las ventas crean movimientos de caja automáticamente**
2. ✅ **Todo el stock se descuenta correctamente**
3. ✅ **No hay duplicación de operaciones**
4. ✅ **Todas las validaciones funcionan**
5. ✅ **Los reportes muestran datos correctos**
6. ✅ **La caja cuadra al cierre**
7. ✅ **No hay errores en la consola del navegador**
8. ✅ **No hay errores en logs de Supabase**

---

## 🎯 MÉTRICAS DE ÉXITO

Después del testing completo, verificar:

- **0 errores críticos** en producción
- **100% de ventas** con movimientos de caja registrados
- **100% de ventas** con stock descontado correctamente
- **0 duplicaciones** de operaciones
- **Caja cuadra** en el 95% de los cierres (permitir errores humanos de conteo)

---

**Happy Testing! 🚀**

Si todos los casos pasan, el sistema está **LISTO PARA PRODUCCIÓN** ✅
