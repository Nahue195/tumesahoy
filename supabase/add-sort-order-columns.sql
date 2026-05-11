-- ============================================
-- AGREGAR COLUMNAS sort_order A LAS TABLAS DE MENÚ
-- ============================================

-- Agregar columna sort_order a menu_categories
ALTER TABLE menu_categories
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Agregar columna sort_order a menu_items
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Actualizar los valores de sort_order existentes para menu_categories
-- (asignar números secuenciales basados en created_at)
WITH numbered_categories AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY business_id ORDER BY created_at) as new_order
  FROM menu_categories
)
UPDATE menu_categories mc
SET sort_order = nc.new_order
FROM numbered_categories nc
WHERE mc.id = nc.id;

-- Actualizar los valores de sort_order existentes para menu_items
-- (asignar números secuenciales basados en created_at, agrupados por categoría)
WITH numbered_items AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) as new_order
  FROM menu_items
)
UPDATE menu_items mi
SET sort_order = ni.new_order
FROM numbered_items ni
WHERE mi.id = ni.id;

-- Hacer que sort_order sea NOT NULL con valor por defecto
ALTER TABLE menu_categories
ALTER COLUMN sort_order SET NOT NULL,
ALTER COLUMN sort_order SET DEFAULT 0;

ALTER TABLE menu_items
ALTER COLUMN sort_order SET NOT NULL,
ALTER COLUMN sort_order SET DEFAULT 0;

-- Verificar que las columnas se agregaron correctamente
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('menu_categories', 'menu_items')
  AND column_name = 'sort_order';
