-- ====================================================================================================
-- CREAR USUARIO ADMIN
-- ====================================================================================================
-- Ejecuta este script DESPUÉS de haber creado tu cuenta en la aplicación
-- Reemplaza 'TU_EMAIL@example.com' con el email que usaste para registrarte
-- ====================================================================================================

-- PASO 1: Verificar que tu usuario existe en auth.users
-- ====================================================================================================

SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'TU_EMAIL@example.com';  -- CAMBIA ESTO

-- Si ves tu usuario, continúa con el siguiente paso
-- Si no ves nada, primero debes registrarte en la aplicación

-- ====================================================================================================
-- PASO 2: Verificar que el perfil se creó en public.users
-- ====================================================================================================

SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM public.users
WHERE email = 'TU_EMAIL@example.com';  -- CAMBIA ESTO

-- Deberías ver tu perfil con role = 'USER'

-- ====================================================================================================
-- PASO 3: Actualizar tu rol a ADMIN
-- ====================================================================================================

UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'TU_EMAIL@example.com';  -- CAMBIA ESTO

-- ====================================================================================================
-- PASO 4: Verificar que el cambio se aplicó correctamente
-- ====================================================================================================

SELECT 
  id,
  email,
  name,
  role,
  branch_id
FROM public.users
WHERE email = 'TU_EMAIL@example.com';  -- CAMBIA ESTO

-- Deberías ver role = 'ADMIN'

-- ====================================================================================================
-- PASO 5: (Opcional) Asignar una sucursal al usuario admin
-- ====================================================================================================

-- Primero, ver qué sucursales hay disponibles
SELECT id, name FROM public.branches;

-- Luego, asignar la sucursal (reemplaza el UUID con el id de tu sucursal)
UPDATE public.users
SET branch_id = (SELECT id FROM public.branches LIMIT 1)
WHERE email = 'TU_EMAIL@example.com';  -- CAMBIA ESTO

-- ====================================================================================================
-- VERIFICACIÓN FINAL
-- ====================================================================================================

SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  b.name as branch_name,
  u.created_at
FROM public.users u
LEFT JOIN public.branches b ON u.branch_id = b.id
WHERE u.email = 'TU_EMAIL@example.com';  -- CAMBIA ESTO

-- ¡Listo! Ahora tu usuario tiene permisos de ADMIN
