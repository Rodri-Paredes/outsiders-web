# Instrucciones para aplicar la migración de item_discount

## 📋 Descripción
Esta migración agrega el campo `item_discount` a la tabla `sale_items` para almacenar los descuentos individuales aplicados a cada producto en una venta.

## 🚀 Pasos para aplicar la migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Accede a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `migrations/20260213_add_item_discount_to_sale_items.sql`
4. Copia todo el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** para ejecutar la migración

### Opción 2: Desde CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
cd outsiders-erp
supabase db push migrations/20260213_add_item_discount_to_sale_items.sql
```

## ✅ Verificación

Después de ejecutar la migración, verifica que se aplicó correctamente:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'sale_items' 
AND column_name = 'item_discount';

-- Verificar que la función fue actualizada
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'create_complete_sale';
```

## 📝 Cambios realizados

### Base de Datos:
1. ✅ Agregada columna `item_discount` a la tabla `sale_items` con valor por defecto 0
2. ✅ Actualizada función `create_complete_sale` para:
   - Aceptar `item_discount` en cada item del array
   - Calcular el total considerando descuentos individuales
   - Guardar el descuento individual en cada `sale_item`

### Código TypeScript:
3. ✅ Actualizado tipo `SaleItem` en `types.ts` para incluir `item_discount`
4. ✅ Actualizado `salesService.ts` para enviar descuentos individuales
5. ✅ Actualizado `PaymentModal.tsx` para incluir `item_discount` al crear ventas
6. ✅ Actualizado `DashboardPage.tsx` para mostrar precios con descuentos aplicados
7. ✅ Actualizado `ReportsPage.tsx` y `reportService.ts` para incluir descuentos en reportes
8. ✅ Actualizado `SaleReceipt.tsx` para mostrar descuentos individuales en el comprobante

## 🎯 Resultado

Ahora el sistema maneja correctamente los descuentos en todos los lugares:

### ✅ Carrito
- Descuento individual por prenda
- Descuento adicional global
- Cálculo correcto de totales

### ✅ Comprobante de Venta
- Muestra descuento individual por producto
- Muestra total de descuentos por prenda
- Muestra descuento adicional si existe
- Total calculado correctamente

### ✅ Dashboard
- Tabla "Detalle de Ventas Recientes" muestra:
  - Precio unitario
  - Subtotal (precio × cantidad)
  - Subtotal con descuento aplicado (si tiene descuento)

### ✅ Reportes
- Exportación CSV incluye:
  - `Subtotal Item`: precio × cantidad
  - `Descuento Item`: descuento individual aplicado
  - `Total Item`: subtotal - descuento individual
  - `Descuento Adicional`: descuento global de la venta

## 🔄 Compatibilidad

- Las ventas antiguas (sin `item_discount`) se actualizan automáticamente con valor 0
- El sistema funciona correctamente con ventas nuevas y antiguas
- No se requiere migración de datos adicional
