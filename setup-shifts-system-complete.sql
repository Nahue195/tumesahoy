-- ========================================
-- TuMesaHoy - Sistema Completo de Turnos por Día
-- ========================================
-- Este script crea todo el sistema de turnos configurable
-- Ejecuta este script UNA SOLA VEZ en Supabase
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega TODO este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- PASO 1: Crear tabla business_shifts (si no existe)
-- ========================================
CREATE TABLE IF NOT EXISTS public.business_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Información del turno
  name VARCHAR(100) NOT NULL, -- Ej: "Almuerzo", "Cena", "Merienda", "Happy Hour"
  icon VARCHAR(50) DEFAULT '🍽️', -- Emoji o icono: ☀️, 🌙, ☕, 🍺, etc.

  -- Rango horario del turno
  start_time TIME NOT NULL, -- Ej: 12:00
  end_time TIME NOT NULL,   -- Ej: 16:00

  -- Horarios disponibles dentro del turno (array de strings)
  -- Ej: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30']
  available_times TEXT[] NOT NULL,

  -- Orden de visualización
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Índices para business_shifts
CREATE INDEX IF NOT EXISTS idx_business_shifts_business_id ON public.business_shifts(business_id);
CREATE INDEX IF NOT EXISTS idx_business_shifts_display_order ON public.business_shifts(display_order);
CREATE INDEX IF NOT EXISTS idx_business_shifts_is_active ON public.business_shifts(is_active);

-- ========================================
-- PASO 2: Crear tabla business_day_shifts (relación día-turno)
-- ========================================
CREATE TABLE IF NOT EXISTS public.business_day_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  shift_id UUID NOT NULL REFERENCES public.business_shifts(id) ON DELETE CASCADE,

  -- Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),

  -- Estado del turno para este día
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Un turno solo puede estar una vez por día por negocio
  CONSTRAINT unique_business_day_shift UNIQUE (business_id, day_of_week, shift_id)
);

-- Índices para business_day_shifts
CREATE INDEX IF NOT EXISTS idx_business_day_shifts_business_id ON public.business_day_shifts(business_id);
CREATE INDEX IF NOT EXISTS idx_business_day_shifts_shift_id ON public.business_day_shifts(shift_id);
CREATE INDEX IF NOT EXISTS idx_business_day_shifts_day_of_week ON public.business_day_shifts(day_of_week);
CREATE INDEX IF NOT EXISTS idx_business_day_shifts_is_active ON public.business_day_shifts(is_active);

-- ========================================
-- PASO 3: Triggers para updated_at
-- ========================================
-- Crear triggers solo si no existen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_shifts_updated_at'
  ) THEN
    CREATE TRIGGER update_business_shifts_updated_at
    BEFORE UPDATE ON public.business_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_business_day_shifts_updated_at'
  ) THEN
    CREATE TRIGGER update_business_day_shifts_updated_at
    BEFORE UPDATE ON public.business_day_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ========================================
-- PASO 4: Habilitar RLS
-- ========================================
ALTER TABLE public.business_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_day_shifts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 5: Políticas RLS para business_shifts
-- ========================================

-- Lectura pública (cualquiera puede ver los turnos de negocios activos)
DROP POLICY IF EXISTS "business_shifts_public_read" ON public.business_shifts;
CREATE POLICY "business_shifts_public_read"
  ON public.business_shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_shifts.business_id
      AND is_active = true
    )
  );

-- Lectura privada (dueños ven todos sus turnos, activos o no)
DROP POLICY IF EXISTS "business_shifts_owner_read" ON public.business_shifts;
CREATE POLICY "business_shifts_owner_read"
  ON public.business_shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- Insert (solo dueños pueden crear turnos)
DROP POLICY IF EXISTS "business_shifts_owner_insert" ON public.business_shifts;
CREATE POLICY "business_shifts_owner_insert"
  ON public.business_shifts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- Update (solo dueños pueden actualizar turnos)
DROP POLICY IF EXISTS "business_shifts_owner_update" ON public.business_shifts;
CREATE POLICY "business_shifts_owner_update"
  ON public.business_shifts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- Delete (solo dueños pueden eliminar turnos)
DROP POLICY IF EXISTS "business_shifts_owner_delete" ON public.business_shifts;
CREATE POLICY "business_shifts_owner_delete"
  ON public.business_shifts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- ========================================
-- PASO 6: Políticas RLS para business_day_shifts
-- ========================================

-- Lectura pública (cualquiera puede ver los turnos activos de negocios activos)
DROP POLICY IF EXISTS "business_day_shifts_public_read" ON public.business_day_shifts;
CREATE POLICY "business_day_shifts_public_read"
  ON public.business_day_shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_day_shifts.business_id
      AND is_active = true
    )
  );

-- Lectura privada (dueños ven toda su configuración)
DROP POLICY IF EXISTS "business_day_shifts_owner_read" ON public.business_day_shifts;
CREATE POLICY "business_day_shifts_owner_read"
  ON public.business_day_shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_day_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- Insert (solo dueños pueden crear configuraciones)
DROP POLICY IF EXISTS "business_day_shifts_owner_insert" ON public.business_day_shifts;
CREATE POLICY "business_day_shifts_owner_insert"
  ON public.business_day_shifts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_day_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- Update (solo dueños pueden actualizar configuraciones)
DROP POLICY IF EXISTS "business_day_shifts_owner_update" ON public.business_day_shifts;
CREATE POLICY "business_day_shifts_owner_update"
  ON public.business_day_shifts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_day_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- Delete (solo dueños pueden eliminar configuraciones)
DROP POLICY IF EXISTS "business_day_shifts_owner_delete" ON public.business_day_shifts;
CREATE POLICY "business_day_shifts_owner_delete"
  ON public.business_day_shifts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_day_shifts.business_id
      AND user_id = auth.uid()
    )
  );

-- ========================================
-- PASO 7: Función helper para habilitar turno en todos los días
-- ========================================
CREATE OR REPLACE FUNCTION enable_shift_for_all_days(
  p_business_id UUID,
  p_shift_id UUID
)
RETURNS void AS $$
BEGIN
  -- Insertar el turno para todos los días (0-6)
  INSERT INTO public.business_day_shifts (business_id, shift_id, day_of_week, is_active)
  SELECT p_business_id, p_shift_id, day_num, true
  FROM generate_series(0, 6) AS day_num
  ON CONFLICT (business_id, day_of_week, shift_id)
  DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASO 8: Comentarios de documentación
-- ========================================
COMMENT ON TABLE public.business_shifts IS 'Turnos configurables para reservas de cada negocio (Almuerzo, Cena, etc.)';
COMMENT ON COLUMN public.business_shifts.name IS 'Nombre del turno (Almuerzo, Cena, Merienda, etc.)';
COMMENT ON COLUMN public.business_shifts.icon IS 'Emoji o icono para mostrar en la UI';
COMMENT ON COLUMN public.business_shifts.available_times IS 'Array de horarios disponibles en formato HH:MM';

COMMENT ON TABLE public.business_day_shifts IS 'Relación entre días de la semana y turnos habilitados para cada negocio';
COMMENT ON COLUMN public.business_day_shifts.day_of_week IS 'Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)';
COMMENT ON COLUMN public.business_day_shifts.is_active IS 'Si este turno está habilitado para este día específico';

COMMENT ON FUNCTION enable_shift_for_all_days IS 'Helper function para habilitar un turno en todos los días de la semana';

-- ========================================
-- PASO 9: Verificación (opcional)
-- ========================================
-- Descomentar estas líneas para verificar que todo se creó correctamente

-- SELECT 'business_shifts' as table_name, count(*) as rows FROM public.business_shifts
-- UNION ALL
-- SELECT 'business_day_shifts', count(*) FROM public.business_day_shifts;

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- ✅ Si llegaste hasta aquí sin errores, el sistema de turnos está listo!
--
-- Próximos pasos:
-- 1. Recarga tu aplicación
-- 2. Ve al panel de Admin
-- 3. Busca la sección "Gestión de Turnos de Reserva"
-- 4. Crea tu primer turno
-- 5. Configura los días habilitados
--
-- 📖 Consulta TURNOS_POR_DIA_GUIA.md para más información
-- ========================================
