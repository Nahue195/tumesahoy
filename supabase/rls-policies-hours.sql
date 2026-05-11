-- ============================================
-- POLÍTICAS RLS PARA business_hours
-- ============================================

-- Habilitar RLS en la tabla
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own business hours" ON business_hours;
DROP POLICY IF EXISTS "Users can insert their own business hours" ON business_hours;
DROP POLICY IF EXISTS "Users can update their own business hours" ON business_hours;
DROP POLICY IF EXISTS "Users can delete their own business hours" ON business_hours;
DROP POLICY IF EXISTS "Anyone can view business hours" ON business_hours;

-- SELECT: Usuarios pueden ver horarios de sus propios negocios
CREATE POLICY "Users can view their own business hours"
ON business_hours
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Usuarios pueden crear horarios en sus propios negocios
CREATE POLICY "Users can insert their own business hours"
ON business_hours
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: Usuarios pueden actualizar horarios de sus propios negocios
CREATE POLICY "Users can update their own business hours"
ON business_hours
FOR UPDATE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- DELETE: Usuarios pueden eliminar horarios de sus propios negocios
CREATE POLICY "Users can delete their own business hours"
ON business_hours
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- Permitir a TODOS ver horarios de negocios activos (para clientes)
CREATE POLICY "Anyone can view business hours"
ON business_hours
FOR SELECT
TO anon, authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE is_active = true
  )
);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'business_hours'
ORDER BY policyname;
