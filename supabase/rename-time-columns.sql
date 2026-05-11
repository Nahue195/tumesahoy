-- Renombrar las columnas de tiempo para que coincidan con el código
ALTER TABLE business_hours
RENAME COLUMN open_time TO opens_at;

ALTER TABLE business_hours
RENAME COLUMN close_time TO closes_at;

-- Verificar que se renombraron correctamente
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'business_hours'
  AND column_name IN ('opens_at', 'closes_at', 'open_time', 'close_time')
ORDER BY column_name;
