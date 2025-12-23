-- ====================================================================================================
-- CONFIGURACIÓN INICIAL - Usuario Admin para Outsiders ERP
-- ====================================================================================================
-- Ejecuta este script DESPUÉS de ejecutar el schema principal
-- y DESPUÉS de crear el usuario en Authentication de Supabase
-- ====================================================================================================

-- 1. Verificar que el usuario existe en auth.users
-- (Debes crear primero el usuario en Authentication > Users del dashboard)

-- 2. Insertar perfil de administrador
INSERT INTO users (id, name, email, role, branch_id) 
VALUES (
  '77732dc1-f8e7-47b2-acea-cda2bbe0b6d4',
  'Administrador',
  'admin@outsiders.com',
  'admin',
  NULL  -- NULL para que el admin pueda acceder a todas las sucursales
)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 3. Verificar que el usuario se creó correctamente
SELECT 
  id,
  name,
  email,
  role,
  branch_id,
  created_at
FROM users
WHERE id = '77732dc1-f8e7-47b2-acea-cda2bbe0b6d4';

-- 4. Verificar sucursales creadas
SELECT id, name, address FROM branches;

-- ====================================================================================================
-- RESULTADO ESPERADO:
-- - 1 usuario admin creado
-- - 3 sucursales disponibles (Centro, Mall, Express)
-- ====================================================================================================
