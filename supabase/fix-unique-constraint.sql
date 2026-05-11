-- Eliminar la constraint antigua que NO permite múltiples turnos
ALTER TABLE business_hours
DROP CONSTRAINT IF EXISTS unique_business_day;

-- Eliminar cualquier otra constraint similar
ALTER TABLE business_hours
DROP CONSTRAINT IF EXISTS business_hours_business_id_day_of_week_key;

-- Crear la nueva constraint que SÍ permite múltiples turnos
-- (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'business_hours_business_day_shift_unique'
    ) THEN
        ALTER TABLE business_hours
        ADD CONSTRAINT business_hours_business_day_shift_unique
        UNIQUE (business_id, day_of_week, shift_number);
    END IF;
END $$;

-- Verificar las constraints actuales
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'business_hours'::regclass
  AND contype = 'u'  -- solo unique constraints
ORDER BY conname;
