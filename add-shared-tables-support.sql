-- ============================================
-- Soporte para Mesas Compartidas (Comunitarias)
-- ============================================
-- Permite que algunos tipos de mesa cuenten por PERSONAS en lugar de por MESAS
-- Ejemplo: Mesa Comunitaria de 14 lugares = 14 personas pueden reservar

-- 1. Agregar campo is_shared a table_types
-- -----------------------------------------
ALTER TABLE public.table_types
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.table_types.is_shared IS
'Si es true, la disponibilidad se cuenta por personas (lugares). Si es false, se cuenta por cantidad de mesas.';

-- 2. Agregar campo capacity a tables
-- ----------------------------------
ALTER TABLE public.tables
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 4;

COMMENT ON COLUMN public.tables.capacity IS
'Capacidad de personas que caben en esta mesa específica. Importante para mesas compartidas.';

-- 3. Actualizar constraint de capacity
ALTER TABLE public.tables
DROP CONSTRAINT IF EXISTS valid_table_capacity;

ALTER TABLE public.tables
ADD CONSTRAINT valid_table_capacity CHECK (capacity > 0 AND capacity <= 50);

-- 4. Migración: Establecer capacity basado en max_capacity del tipo
-- -----------------------------------------------------------------
UPDATE public.tables t
SET capacity = (
  SELECT tt.max_capacity
  FROM public.table_types tt
  WHERE tt.id = t.table_type_id
)
WHERE t.capacity IS NULL OR t.capacity = 4;

-- 5. Actualizar función get_table_type_availability (ya existe en reservation-modes.sql)
-- Esta función ya maneja is_shared correctamente

-- ============================================
-- EJEMPLO DE CONFIGURACIÓN:
-- ============================================
--
-- TIPOS DE MESA:
-- | Nombre      | is_shared | min | max | Descripción                           |
-- |-------------|-----------|-----|-----|---------------------------------------|
-- | Común       | false     | 1   | 3   | Mesas estándar                        |
-- | Comunitaria | true      | 1   | 14  | Mesa grande compartida (suma personas)|
-- | Privada     | false     | 1   | 2   | Mesas íntimas                         |
-- | Tablón      | false     | 4   | 6   | Mesa grande para grupos               |
-- | Sillón      | false     | 1   | 2   | Sillones cómodos                      |
--
-- MESAS:
-- | Tipo        | Mesa # | capacity | Comportamiento en modo SIN RECAMBIO   |
-- |-------------|--------|----------|---------------------------------------|
-- | Común       | 1,2,3  | 3 c/u    | 3 reservas/día (1 por mesa)           |
-- | Comunitaria | 1      | 14       | Hasta 14 personas/día (van sumando)   |
-- | Privada     | 1,2    | 2 c/u    | 2 reservas/día (1 por mesa)           |
-- | Tablón      | 1      | 6        | 1 reserva/día                         |
-- | Sillón      | 1,2    | 2 c/u    | 2 reservas/día (1 por mesa)           |
--
-- ============================================
