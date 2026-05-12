-- Permitir que usuarios anónimos listen archivos del bucket 'web'
-- Esto es necesario para mostrar las fotos de las tiendas en la web pública
-- Ejecutar en: Supabase Dashboard > SQL Editor

CREATE POLICY "Public can list web bucket"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'web');
