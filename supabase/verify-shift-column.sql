-- Verificar si la columna shift_number existe en business_hours
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'business_hours'
ORDER BY ordinal_position;

-- Ver algunos registros de ejemplo
SELECT * FROM business_hours LIMIT 5;
