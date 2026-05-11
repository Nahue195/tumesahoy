-- ============================================
-- POLÍTICAS RLS PARA MENU_CATEGORIES Y MENU_ITEMS
-- ============================================

-- Habilitar RLS en las tablas (si no está ya habilitado)
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA menu_categories
-- ============================================

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Users can view their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can insert their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can update their own menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Users can delete their own menu categories" ON menu_categories;

-- SELECT: Usuarios pueden ver categorías de sus propios negocios
CREATE POLICY "Users can view their own menu categories"
ON menu_categories
FOR SELECT
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- INSERT: Usuarios pueden crear categorías en sus propios negocios
CREATE POLICY "Users can insert their own menu categories"
ON menu_categories
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- UPDATE: Usuarios pueden actualizar categorías de sus propios negocios
CREATE POLICY "Users can update their own menu categories"
ON menu_categories
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

-- DELETE: Usuarios pueden eliminar categorías de sus propios negocios
CREATE POLICY "Users can delete their own menu categories"
ON menu_categories
FOR DELETE
TO authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- POLÍTICAS PARA menu_items
-- ============================================

-- Eliminar políticas existentes si existen (para evitar duplicados)
DROP POLICY IF EXISTS "Users can view their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can update their own menu items" ON menu_items;
DROP POLICY IF EXISTS "Users can delete their own menu items" ON menu_items;

-- SELECT: Usuarios pueden ver items de sus propios negocios
CREATE POLICY "Users can view their own menu items"
ON menu_items
FOR SELECT
TO authenticated
USING (
  category_id IN (
    SELECT mc.id FROM menu_categories mc
    INNER JOIN businesses b ON mc.business_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

-- INSERT: Usuarios pueden crear items en sus propios negocios
CREATE POLICY "Users can insert their own menu items"
ON menu_items
FOR INSERT
TO authenticated
WITH CHECK (
  category_id IN (
    SELECT mc.id FROM menu_categories mc
    INNER JOIN businesses b ON mc.business_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

-- UPDATE: Usuarios pueden actualizar items de sus propios negocios
CREATE POLICY "Users can update their own menu items"
ON menu_items
FOR UPDATE
TO authenticated
USING (
  category_id IN (
    SELECT mc.id FROM menu_categories mc
    INNER JOIN businesses b ON mc.business_id = b.id
    WHERE b.user_id = auth.uid()
  )
)
WITH CHECK (
  category_id IN (
    SELECT mc.id FROM menu_categories mc
    INNER JOIN businesses b ON mc.business_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

-- DELETE: Usuarios pueden eliminar items de sus propios negocios
CREATE POLICY "Users can delete their own menu items"
ON menu_items
FOR DELETE
TO authenticated
USING (
  category_id IN (
    SELECT mc.id FROM menu_categories mc
    INNER JOIN businesses b ON mc.business_id = b.id
    WHERE b.user_id = auth.uid()
  )
);

-- ============================================
-- POLÍTICAS PÚBLICAS PARA VISUALIZACIÓN
-- (Para que los clientes puedan ver el menú público)
-- ============================================

-- Eliminar políticas públicas existentes si existen
DROP POLICY IF EXISTS "Anyone can view menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;

-- Permitir a TODOS (incluso usuarios no autenticados) ver categorías de negocios activos
CREATE POLICY "Anyone can view menu categories"
ON menu_categories
FOR SELECT
TO anon, authenticated
USING (
  business_id IN (
    SELECT id FROM businesses
    WHERE is_active = true
  )
);

-- Permitir a TODOS (incluso usuarios no autenticados) ver items de negocios activos
CREATE POLICY "Anyone can view menu items"
ON menu_items
FOR SELECT
TO anon, authenticated
USING (
  category_id IN (
    SELECT mc.id FROM menu_categories mc
    INNER JOIN businesses b ON mc.business_id = b.id
    WHERE b.is_active = true
  )
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('menu_categories', 'menu_items')
ORDER BY tablename, policyname;
