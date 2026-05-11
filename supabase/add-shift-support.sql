-- ============================================
-- AGREGAR SOPORTE PARA MÚLTIPLES TURNOS POR DÍA
-- ============================================

-- Agregar columna shift_number para identificar turnos (1 = primer turno, 2 = segundo turno, etc.)
ALTER TABLE business_hours
ADD COLUMN IF NOT EXISTS shift_number INTEGER DEFAULT 1;

-- Actualizar registros existentes para que tengan shift_number = 1
UPDATE business_hours
SET shift_number = 1
WHERE shift_number IS NULL;

-- Hacer que shift_number sea NOT NULL
ALTER TABLE business_hours
ALTER COLUMN shift_number SET NOT NULL,
ALTER COLUMN shift_number SET DEFAULT 1;

-- Eliminar la constraint única antigua si existe
-- (esto permite múltiples turnos por día)
ALTER TABLE business_hours
DROP CONSTRAINT IF EXISTS business_hours_business_id_day_of_week_key;

-- Crear nueva constraint única que incluye shift_number
-- (un negocio puede tener múltiples turnos por día, pero cada turno debe ser único)
ALTER TABLE business_hours
DROP CONSTRAINT IF EXISTS business_hours_business_day_shift_unique;

ALTER TABLE business_hours
ADD CONSTRAINT business_hours_business_day_shift_unique
UNIQUE (business_id, day_of_week, shift_number);

-- Verificar la estructura de la tabla
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'business_hours'
ORDER BY ordinal_position;

-- Verificar las constraints
SELECT
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'business_hours'::regclass;
