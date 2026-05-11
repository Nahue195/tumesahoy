-- ========================================
-- Fix: Permitir turnos que cruzan medianoche
-- ========================================
-- Este script elimina el constraint que impide turnos
-- como 20:00 - 00:00 (cena que cruza medianoche)
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- Eliminar el constraint antiguo que no permite cruce de medianoche
ALTER TABLE public.business_shifts
DROP CONSTRAINT IF EXISTS valid_time_range;

-- Crear un constraint más flexible que solo valida que los tiempos sean válidos
-- pero no requiere que end_time > start_time (para permitir cruces de medianoche)
ALTER TABLE public.business_shifts
ADD CONSTRAINT valid_time_format CHECK (
  start_time IS NOT NULL AND end_time IS NOT NULL
);

-- ========================================
-- COMENTARIO
-- ========================================
COMMENT ON CONSTRAINT valid_time_format ON public.business_shifts IS
'Valida que start_time y end_time existan. Permite turnos que cruzan medianoche (ej: 20:00 a 00:00)';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- ✅ Ahora podés crear turnos como:
--    - Cena: 20:00 - 00:00
--    - Madrugada: 22:00 - 02:00
--    - Noche: 18:00 - 01:00
-- ========================================
