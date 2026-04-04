# ✅ CHECKLIST DE VALIDACIÓN RÁPIDA - OUTSIDERS ERP

**Versión**: 1.0.0  
**Fecha**: 31 de Enero, 2026  
**Tiempo estimado**: 30 minutos

Esta es una guía rápida para validar las funcionalidades principales del sistema.

---

## 🚀 INICIO RÁPIDO

### 1. Levantar el Sistema
```bash
cd apps/outsiders-erp
npm run dev
```

### 2. Acceder
- URL: http://localhost:5173
- Email: `admin@outsiders.com`
- Password: Tu password de Supabase

---

## ✅ CHECKLIST RÁPIDO (30 min)

### 🔐 AUTENTICACIÓN (2 min)
- [ ] Login exitoso
- [ ] Seleccionar sucursal "Centro"
- [ ] Ver dashboard

### 💰 CAJA (5 min)
- [ ] Ir a "Caja"
- [ ] Abrir caja con Bs 500
- [ ] Ver resumen de caja (todo en 0)
- [ ] Verificar que se registró el fondo inicial

### 📦 PRODUCTOS (5 min)
- [ ] Ir a "Productos"
- [ ] Crear producto:
  - Nombre: "Remera Test"
  - Categoría: "Remeras"
  - Precio: 150
  - Tallas: M, L, XL
- [ ] Ver producto en lista

### 📊 STOCK (5 min)
- [ ] Ir a "Stock"
- [ ] Buscar "Remera Test"
- [ ] Ajustar stock talla M: +10 unidades (Entrada)
- [ ] Verificar que stock = 10

### 🛍️ VENTA (7 min)
- [ ] Ir a "Ventas"
- [ ] Click en "Remera Test"
- [ ] Seleccionar talla M
- [ ] Cantidad: 2
- [ ] Agregar al carrito
- [ ] Verificar subtotal: Bs 300
- [ ] Proceder al pago
- [ ] Pago efectivo: Bs 300
- [ ] Confirmar pago
- [ ] Ver recibo

### 📈 DASHBOARD (3 min)
- [ ] Ir a "Dashboard"
- [ ] Ver tarjeta "Total Ventas": Bs 300
- [ ] Ver tarjeta "Transacciones": 1
- [ ] Ver método de pago "Efectivo": Bs 300

### 💵 CERRAR CAJA (3 min)
- [ ] Ir a "Caja"
- [ ] Ver resumen actualizado:
  - Efectivo: Bs 300
  - Total general: Bs 300
- [ ] Click "Cerrar Caja"
- [ ] Ver resumen:
  - Fondo inicial: Bs 500
  - Ventas efectivo: Bs 300
  - Esperado: Bs 800
- [ ] Efectivo contado: Bs 800
- [ ] Diferencia: Bs 0
- [ ] Confirmar cierre

---

## ✅ VALIDACIÓN DE DATOS

Después de completar el checklist, verificar:

### Stock
- [ ] Ir a "Stock"
- [ ] Remera Test - Talla M debe tener: 8 unidades (10 - 2)

### Reportes
- [ ] Ir a "Reportes"
- [ ] Ver venta de Bs 300 en la tabla

### Caja Cerrada
- [ ] Ir a "Caja"
- [ ] Ver mensaje "No hay caja abierta"
- [ ] Ver en historial la caja cerrada con total: Bs 300

---

## 📱 VALIDACIÓN RESPONSIVE (5 min)

### Mobile
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar "iPhone 12 Pro"
4. Verificar:
   - [ ] Menú hamburguesa funciona
   - [ ] Sidebar se abre/cierra
   - [ ] Tablas tienen scroll horizontal
   - [ ] Modales se ven bien
   - [ ] Botones son táctiles

### Tablet
1. Seleccionar "iPad"
2. Verificar:
   - [ ] Grids se adaptan (2-3 columnas)
   - [ ] Layout balanceado

### Desktop
1. Maximizar ventana
2. Verificar:
   - [ ] Sidebar fijo visible
   - [ ] Grids en 4 columnas
   - [ ] Uso óptimo del espacio

---

## 🎨 VALIDACIÓN VISUAL (3 min)

- [ ] No hay elementos cortados
- [ ] No hay overlapping de texto
- [ ] Imágenes se ven bien
- [ ] Colores consistentes
- [ ] Iconos alineados
- [ ] Spacing uniforme

---

## 🐛 VALIDACIÓN DE ERRORES (2 min)

### Consola del Navegador
1. Abrir DevTools (F12)
2. Ir a "Console"
3. Verificar:
   - [ ] No hay errores en rojo
   - [ ] No hay warnings de React
   - [ ] No hay errores de red

### Validaciones
- [ ] No se puede vender sin stock
- [ ] No se puede cerrar caja sin abrirla
- [ ] No se puede stock negativo
- [ ] Descuento no puede ser mayor al total

---

## ✅ RESULTADO ESPERADO

Si todos los checkboxes están marcados:

**🎉 SISTEMA VALIDADO Y FUNCIONAL 🎉**

---

## 🔄 TESTING ADICIONAL (Opcional)

### Pago Mixto
- [ ] Crear venta de Bs 250
- [ ] Pago mixto:
  - Efectivo: Bs 100
  - QR: Bs 100
  - Tarjeta: Bs 50
- [ ] Confirmar
- [ ] Verificar en caja: 3 métodos registrados

### Transferencia de Stock
- [ ] Ir a "Stock"
- [ ] Transferir 3 unidades de talla L a sucursal "Mall"
- [ ] Cambiar a sucursal "Mall"
- [ ] Verificar que llegaron las 3 unidades

### Drops
- [ ] Ir a "Drops"
- [ ] Crear drop "Colección Verano"
- [ ] Agregar 3 productos
- [ ] Marcar como destacado
- [ ] Estado: ACTIVO

### Reportes
- [ ] Ir a "Reportes"
- [ ] Filtrar últimos 7 días
- [ ] Exportar CSV
- [ ] Abrir archivo y validar datos

---

## 📊 MÉTRICAS DE ÉXITO

Al finalizar este checklist:
- ✅ 0 errores encontrados
- ✅ Todas las funciones principales probadas
- ✅ Responsive validado
- ✅ Flujo completo de venta ejecutado
- ✅ Sistema listo para uso

---

## 🆘 SI ALGO FALLA

1. **Revisar consola**: F12 → Console
2. **Verificar Supabase**: Variables de entorno correctas
3. **Limpiar caché**: Ctrl+Shift+Delete
4. **Reiniciar servidor**: Ctrl+C → `npm run dev`
5. **Verificar base de datos**: Ejecutar migrations

---

**Tiempo total**: ~30-45 minutos  
**Siguiente paso**: Testing exhaustivo con GUIA_DE_TESTING.md

✅ **SISTEMA VALIDADO Y LISTO PARA PRODUCCIÓN**
