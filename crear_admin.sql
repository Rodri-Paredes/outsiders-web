-- ====================================================================================================
-- CREAR USUARIO ADMINISTRADOR
-- ====================================================================================================

-- Opción 1: Si ya te registraste en http://localhost:3001/auth
-- Ejecuta esto para convertir tu cuenta en ADMIN:

UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';

-- Verifica que se actualizó correctamente:
SELECT id, email, name, role FROM public.users WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';

-- ====================================================================================================

-- Opción 2: Crear usuario ADMIN directamente
-- (Solo si NO quieres usar Supabase Auth y prefieres crear un usuario directo)

-- IMPORTANTE: Esta opción requiere que primero crees el usuario en Supabase Auth Dashboard
-- 1. Ve a Supabase Dashboard → Authentication → Users
-- 2. Haz clic en "Add user" → "Create new user"
-- 3. Ingresa email y contraseña
-- 4. Copia el ID del usuario creado
-- 5. Ejecuta esto reemplazando los valores:

-- INSERT INTO public.users (id, email, name, role)
-- VALUES (
--   'UUID_DEL_USUARIO_CREADO',  -- ID del usuario de auth.users
--   'admin@outsiders.com',       -- Tu email
--   'Administrador',             -- Tu nombre
--   'ADMIN'                      -- Rol
-- );

-- ====================================================================================================

-- Verificar usuarios existentes:
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.branch_id,
  b.name as branch_name
FROM public.users u
LEFT JOIN public.branches b ON b.id = u.branch_id
ORDER BY u.created_at DESC;

-- Ver todos los roles disponibles:
SELECT * FROM pg_enum WHERE enumtypid = 'user_role'::regtype;
