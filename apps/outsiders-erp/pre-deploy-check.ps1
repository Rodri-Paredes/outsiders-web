# ===============================================
# SCRIPT DE PRE-DEPLOY - Outsiders ERP
# ===============================================
# Este script verifica que todo esté listo antes de subir a producción
# Ejecutar desde: outsiders-erp/
# ===============================================

Write-Host ""
Write-Host "🚀 ============================================" -ForegroundColor Cyan
Write-Host "🚀   PRE-DEPLOY CHECK - OUTSIDERS ERP      " -ForegroundColor Cyan
Write-Host "🚀 ============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# ===============================================
# 1. VERIFICAR NODE Y NPM
# ===============================================
Write-Host "📦 Verificando Node.js y npm..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "   ✅ Node: $nodeVersion" -ForegroundColor Green
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js o npm no están instalados" -ForegroundColor Red
    $ErrorCount++
}

Write-Host ""

# ===============================================
# 2. VERIFICAR DEPENDENCIAS
# ===============================================
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  node_modules no existe - ejecutando npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error instalando dependencias" -ForegroundColor Red
        $ErrorCount++
    }
}

Write-Host ""

# ===============================================
# 3. VERIFICAR VARIABLES DE ENTORNO
# ===============================================
Write-Host "🔐 Verificando variables de entorno..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "   ✅ Archivo .env existe" -ForegroundColor Green
    
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "   ✅ VITE_SUPABASE_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "   ❌ VITE_SUPABASE_URL no configurada" -ForegroundColor Red
        $ErrorCount++
    }
    
    if ($envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "   ✅ VITE_SUPABASE_ANON_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "   ❌ VITE_SUPABASE_ANON_KEY no configurada" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ⚠️  Archivo .env no existe (normal si usas variables de entorno de plataforma)" -ForegroundColor Yellow
    Write-Host "   ℹ️  Asegúrate de configurar las variables en Netlify/Vercel" -ForegroundColor Cyan
}

Write-Host ""

# ===============================================
# 4. LINTING
# ===============================================
Write-Host "🔍 Ejecutando ESLint..." -ForegroundColor Yellow

npm run lint 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ESLint: Sin errores" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ESLint: Hay warnings (revisar pero no bloquea deploy)" -ForegroundColor Yellow
}

Write-Host ""

# ===============================================
# 5. TYPE CHECKING
# ===============================================
Write-Host "📝 Verificando tipos TypeScript..." -ForegroundColor Yellow

npx tsc --noEmit 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ TypeScript: Sin errores de tipos" -ForegroundColor Green
} else {
    Write-Host "   ❌ TypeScript: Hay errores de tipos" -ForegroundColor Red
    Write-Host "   ℹ️  Ejecuta: npx tsc --noEmit" -ForegroundColor Cyan
    $ErrorCount++
}

Write-Host ""

# ===============================================
# 6. BUILD DE PRODUCCIÓN
# ===============================================
Write-Host "🏗️  Ejecutando build de producción..." -ForegroundColor Yellow

# Limpiar dist anterior
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Build: Exitoso" -ForegroundColor Green
    
    # Verificar tamaño del bundle
    if (Test-Path "dist") {
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        $distSizeFormatted = [math]::Round($distSize, 2)
        Write-Host "   📊 Tamaño del bundle: $distSizeFormatted MB" -ForegroundColor Cyan
        
        if ($distSize -lt 5) {
            Write-Host "   ✅ Tamaño del bundle es óptimo (< 5 MB)" -ForegroundColor Green
        } elseif ($distSize -lt 10) {
            Write-Host "   ⚠️  Tamaño del bundle es aceptable pero grande (< 10 MB)" -ForegroundColor Yellow
        } else {
            Write-Host "   ⚠️  Tamaño del bundle es muy grande (> 10 MB)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ❌ Build: Falló" -ForegroundColor Red
    Write-Host "   ℹ️  Ejecuta: npm run build" -ForegroundColor Cyan
    $ErrorCount++
}

Write-Host ""

# ===============================================
# 7. VERIFICAR ARCHIVOS CRÍTICOS
# ===============================================
Write-Host "📁 Verificando estructura de archivos..." -ForegroundColor Yellow

$criticalFiles = @(
    "src/main.tsx",
    "src/App.tsx",
    "src/lib/supabase.ts",
    "index.html",
    "package.json",
    "vite.config.ts"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file no existe" -ForegroundColor Red
        $allFilesExist = $false
        $ErrorCount++
    }
}

Write-Host ""

# ===============================================
# 8. VERIFICAR CONFIGURACIONES DE DEPLOY
# ===============================================
Write-Host "🚀 Verificando configuraciones de deploy..." -ForegroundColor Yellow

if (Test-Path "netlify.toml") {
    Write-Host "   ✅ netlify.toml existe" -ForegroundColor Green
}

if (Test-Path "vercel.json") {
    Write-Host "   ✅ vercel.json existe" -ForegroundColor Green
}

if (-not (Test-Path "netlify.toml") -and -not (Test-Path "vercel.json")) {
    Write-Host "   ⚠️  No hay configuración de Netlify ni Vercel" -ForegroundColor Yellow
    Write-Host "   ℹ️  Asegúrate de configurar en la plataforma" -ForegroundColor Cyan
}

Write-Host ""

# ===============================================
# 9. RESUMEN FINAL
# ===============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "✅ ¡TODO LISTO PARA PRODUCCIÓN!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Subir los cambios a Git" -ForegroundColor White
    Write-Host "2. Hacer push a la rama principal" -ForegroundColor White
    Write-Host "3. Configurar variables de entorno en Netlify/Vercel:" -ForegroundColor White
    Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
    Write-Host "4. Deploy automático o manual según configuración" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Ver: CHECKLIST_PRODUCCION.md para más detalles" -ForegroundColor Cyan
} else {
    Write-Host "❌ ERRORES ENCONTRADOS: $ErrorCount" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Corrige los errores antes de deployar" -ForegroundColor Yellow
    Write-Host "📚 Ver logs arriba para más detalles" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Retornar código de salida apropiado
exit $ErrorCount
