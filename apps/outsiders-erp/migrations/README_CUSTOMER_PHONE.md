# Instrucciones para aplicar la migración de customer_phone

## 📋 Descripción
Esta migración agrega el campo `customer_phone` a la tabla `sales` para almacenar el número de celular del cliente de manera opcional.

## 🚀 Pasos para aplicar la migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Accede a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `migrations/20260213_add_customer_phone_to_sales.sql`
4. Copia todo el contenido del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** para ejecutar la migración

### Opción 2: Desde CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
cd outsiders-erp
supabase db push migrations/20260213_add_customer_phone_to_sales.sql
```

## ✅ Verificación

Después de ejecutar la migración, verifica que se aplicó correctamente:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sales' 
AND column_name = 'customer_phone';

-- Verificar que la función fue actualizada
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'create_complete_sale';
```

## 📝 Cambios realizados

1. ✅ Agregada columna `customer_phone` a la tabla `sales`
2. ✅ Actualizada función `create_complete_sale` para aceptar el parámetro `p_customer_phone`
3. ✅ Actualizado el código TypeScript:
   - Tipos en `types.ts`
   - Servicio en `salesService.ts`
   - Componente `PaymentModal.tsx` con input para capturar el celular

## 🎯 Resultado

Ahora cuando se realice una venta, el usuario podrá ingresar opcionalmente el número de celular del cliente, que se guardará en la base de datos junto con la información de la venta.
