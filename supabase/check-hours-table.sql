-- Ver la estructura completa de business_hours
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'business_hours'
ORDER BY ordinal_position;

-- Ver si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'business_hours'
) as table_exists;

-- Ver algunos datos de ejemplo si existen
SELECT * FROM business_hours LIMIT 3;
