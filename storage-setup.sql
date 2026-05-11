-- ========================================
-- TuMesaHoy - Configuración de Storage
-- ========================================
-- Este script crea los buckets y configura las políticas de Storage
-- para imágenes de negocios y menú
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Pega este código completo
-- 3. Ejecuta (RUN)
-- ========================================

-- ========================================
-- CREAR BUCKETS (Si no existen)
-- ========================================

-- Bucket para imágenes de negocios (logos, portadas, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-images', 'business-images', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para imágenes de menú
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- POLÍTICAS PARA: business-images
-- ========================================

-- Política 1: Lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Public read access for business images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-images');

-- Política 2: Upload para usuarios autenticados
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-images');

-- Política 3: Update para usuarios autenticados
CREATE POLICY "Authenticated users can update business images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-images')
WITH CHECK (bucket_id = 'business-images');

-- Política 4: Delete para usuarios autenticados
CREATE POLICY "Authenticated users can delete business images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-images');

-- ========================================
-- POLÍTICAS PARA: menu-images
-- ========================================

-- Política 1: Lectura pública (cualquiera puede ver las imágenes)
CREATE POLICY "Public read access for menu images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Política 2: Upload para usuarios autenticados
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Política 3: Update para usuarios autenticados
CREATE POLICY "Authenticated users can update menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Política 4: Delete para usuarios autenticados
CREATE POLICY "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver buckets creados
SELECT id, name, public FROM storage.buckets WHERE id IN ('business-images', 'menu-images');

-- Ver políticas de storage
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- ========================================
-- FIN
-- ========================================
-- Si todo salió bien, deberías ver:
-- - 2 buckets (business-images, menu-images)
-- - 8 políticas (4 por cada bucket)
-- ========================================
