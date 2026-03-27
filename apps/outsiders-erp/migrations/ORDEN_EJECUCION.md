# 🚀 Instrucciones de Migración - Orden de Ejecución

## ⚠️ IMPORTANTE: Ejecutar en este orden exacto

### 1️⃣ Primera Migración: Fix SKU Constraint
**Archivo:** `20260213_fix_sku_constraint.sql`

```sql
-- Ejecuta este primero
```

Esta migración permite tener múltiples productos sin SKU.

---

### 2️⃣ Segunda Migración: Add Item Discount
**Archivo:** `20260213_add_item_discount_to_sale_items.sql`

```sql
-- Ejecuta este segundo
```

Esta migración agrega el campo `item_discount` a la tabla `sale_items` y actualiza la función `create_complete_sale`.

---

### 3️⃣ Tercera Migración: Customer Phone (Ya aplicada)
**Archivo:** `20260213_add_customer_phone_to_sales.sql`

Si aún no la aplicaste, ejecútala después de las dos anteriores.

---

## 📋 Pasos para aplicar:

### Desde Supabase Dashboard:

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Abre **SQL Editor**
3. **Ejecuta en orden:**
   - Copia `20260213_fix_sku_constraint.sql` → Run
   - Copia `20260213_add_item_discount_to_sale_items.sql` → Run
   - Copia `20260213_add_customer_phone_to_sales.sql` → Run (si no lo hiciste)

---

## ✅ Después de las migraciones:

1. **Reinicia la aplicación** (refresca el navegador)
2. **Haz una nueva venta** con descuentos
3. El comprobante ahora mostrará:
   - ✅ Descuento individual por producto (debajo del nombre)
   - ✅ Total de descuentos por prenda
   - ✅ Descuento adicional (si lo hay)
   - ✅ Total correcto

---

## 🔍 Verificar que todo funciona:

```sql
-- Verificar que item_discount existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'sale_items' AND column_name = 'item_discount';

-- Verificar una venta con descuento
SELECT si.*, pv.size, p.name 
FROM sale_items si
JOIN product_variants pv ON si.variant_id = pv.id
JOIN products p ON pv.product_id = p.id
WHERE si.item_discount > 0
LIMIT 5;
```

---

## ⚠️ Nota importante:

Las **ventas anteriores** no mostrarán descuentos individuales porque se crearon antes de la migración. Solo las **nuevas ventas** después de aplicar las migraciones tendrán descuentos guardados correctamente.
