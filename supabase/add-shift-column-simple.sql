-- Script simple para agregar shift_number a business_hours

-- Paso 1: Agregar la columna
ALTER TABLE business_hours ADD COLUMN shift_number INTEGER;

-- Paso 2: Actualizar registros existentes
UPDATE business_hours SET shift_number = 1 WHERE shift_number IS NULL;

-- Paso 3: Hacer que sea NOT NULL con default 1
ALTER TABLE business_hours ALTER COLUMN shift_number SET NOT NULL;
ALTER TABLE business_hours ALTER COLUMN shift_number SET DEFAULT 1;

-- Paso 4: Verificar que se agregó
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'business_hours'
AND column_name = 'shift_number';
