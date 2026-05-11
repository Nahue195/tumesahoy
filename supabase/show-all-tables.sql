-- Mostrar TODAS las tablas del schema public
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Mostrar TODAS las columnas de business_hours (usando pg_attribute)
SELECT
    a.attname AS column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type
FROM
    pg_catalog.pg_attribute a
WHERE
    a.attrelid = 'business_hours'::regclass
    AND a.attnum > 0
    AND NOT a.attisdropped
ORDER BY a.attnum;
