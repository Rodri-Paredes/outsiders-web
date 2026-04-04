# 🚀 COMANDOS RÁPIDOS - OUTSIDERS ERP

## 📦 Instalación Inicial

```powershell
# Instalar todas las dependencias
npm install

# Verificar versiones
node --version
npm --version
```

---

## 🔧 Desarrollo

```powershell
# Iniciar servidor de desarrollo (puerto 3000)
npm run dev

# Iniciar en modo verbose (para debug)
npm run dev -- --debug

# Limpiar caché y reiniciar
Remove-Item -Recurse -Force node_modules\.vite ; npm run dev
```

---

## 🏗️ Build y Preview

```powershell
# Compilar para producción
npm run build

# Preview del build de producción
npm run preview

# Build + Preview en un solo comando
npm run build ; npm run preview
```

---

## ✅ Verificación y Linting

```powershell
# Verificar errores de TypeScript
npx tsc --noEmit

# Ejecutar linter
npm run lint

# Arreglar errores de linting automáticamente
npx eslint . --ext ts,tsx --fix
```

---

## 📁 Gestión de Archivos

```powershell
# Ver estructura del proyecto
Get-ChildItem -Recurse -Directory | Select-Object FullName

# Contar líneas de código
(Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css | Get-Content).Count

# Buscar en archivos
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "palabra-a-buscar"
```

---

## 🗄️ Supabase

```powershell
# Instalar Supabase CLI (opcional, para migraciones locales)
npm install -g supabase

# Inicializar Supabase local
supabase init

# Crear nueva migración
supabase migration new nombre_migracion

# Aplicar migraciones
supabase db push
```

---

## 🔑 Variables de Entorno

```powershell
# Crear .env desde template
Copy-Item .env.example .env

# Ver variables de entorno (sin mostrar valores)
Get-Content .env | ForEach-Object { $_.Split('=')[0] }

# Verificar que .env existe y tiene contenido
Test-Path .env ; Get-Content .env
```

---

## 🧹 Limpieza

```powershell
# Limpiar node_modules
Remove-Item -Recurse -Force node_modules

# Limpiar dist
Remove-Item -Recurse -Force dist

# Limpiar todo y reinstalar
Remove-Item -Recurse -Force node_modules,dist ; npm install

# Limpiar caché de npm
npm cache clean --force
```

---

## 📊 Análisis del Proyecto

```powershell
# Ver tamaño del build
Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum

# Listar dependencias instaladas
npm list --depth=0

# Ver dependencias desactualizadas
npm outdated

# Actualizar dependencias (con cuidado)
npm update
```

---

## 🐛 Debugging

```powershell
# Iniciar con inspector de Chrome
npm run dev -- --inspect

# Ver logs detallados
npm run dev -- --debug --force

# Limpiar puerto 3000 si está ocupado (Windows)
netstat -ano | findstr :3000
# Luego usar el PID para matar el proceso:
taskkill /PID <número-del-pid> /F
```

---

## 🔐 Git (Control de Versiones)

```powershell
# Inicializar repositorio
git init

# Ver estado
git status

# Agregar todos los archivos
git add .

# Commit
git commit -m "feat: descripción del cambio"

# Ver historial
git log --oneline

# Crear rama nueva
git checkout -b feature/nombre-feature

# Volver a main
git checkout main
```

---

## 📝 Scripts Personalizados Útiles

```powershell
# Crear componente nuevo rápidamente
function New-Component {
    param($name)
    $dir = "src/components/$name"
    New-Item -ItemType Directory -Path $dir -Force
    New-Item -ItemType File -Path "$dir/$name.tsx"
    Write-Host "Componente $name creado en $dir"
}

# Uso: New-Component MiComponente

# Ver peso de carpetas del proyecto
Get-ChildItem | ForEach-Object {
    $size = (Get-ChildItem $_ -Recurse -ErrorAction SilentlyContinue | 
             Measure-Object -Property Length -Sum).Sum / 1MB
    [PSCustomObject]@{
        Folder = $_.Name
        'Size (MB)' = [math]::Round($size, 2)
    }
} | Sort-Object 'Size (MB)' -Descending
```

---

## 🎯 Flujo de Trabajo Recomendado

### Día a día:
```powershell
# 1. Actualizar código
git pull

# 2. Instalar/actualizar dependencias si hay cambios
npm install

# 3. Iniciar desarrollo
npm run dev

# 4. Antes de hacer commit
npm run lint
npx tsc --noEmit

# 5. Commit y push
git add .
git commit -m "feat: descripción"
git push
```

### Antes de deploy:
```powershell
# 1. Build de producción
npm run build

# 2. Probar el build
npm run preview

# 3. Verificar tamaño del bundle
Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum

# 4. Deploy (según tu plataforma)
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
```

---

## 🔥 Comandos de Emergencia

```powershell
# Si el proyecto no inicia:
Remove-Item -Recurse -Force node_modules,.vite,dist
npm install
npm run dev

# Si hay errores de TypeScript raros:
Remove-Item -Recurse -Force node_modules/@types
npm install

# Si Vite no detecta cambios:
# 1. Cerrar Vite (Ctrl+C)
# 2. Ejecutar:
Remove-Item -Recurse -Force node_modules\.vite
npm run dev

# Si el puerto 3000 está ocupado:
$process = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
npm run dev
```

---

## 💡 Tips y Trucos

```powershell
# Abrir VS Code en el proyecto
code .

# Abrir en navegador específico
Start-Process "http://localhost:3000" -FilePath "chrome"

# Ver logs en tiempo real (si tienes logging)
Get-Content logs/app.log -Wait -Tail 50

# Buscar TODOs en el código
Get-ChildItem -Recurse -Include *.tsx,*.ts | Select-String "TODO|FIXME|HACK"
```

---

## 📚 Recursos Útiles

- **Documentación Vite**: https://vitejs.dev
- **Documentación React**: https://react.dev
- **Documentación Supabase**: https://supabase.com/docs
- **Documentación Tailwind**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev

---

**Pro Tip:** Guarda estos comandos en un archivo `.ps1` para ejecutarlos fácilmente! 🚀
