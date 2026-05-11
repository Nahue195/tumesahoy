-- ========================================
-- Script para agregar tabla de relación TURNOS POR DÍA
-- ========================================
-- Este script agrega la funcionalidad de habilitar/deshabilitar
-- turnos específicos por día de la semana
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- TABLA: business_day_shifts (Turnos habilitados por día)
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
CREATE INDEX idx_business_day_shifts_business_id ON public.business_day_shifts(business_id);
CREATE INDEX idx_business_day_shifts_shift_id ON public.business_day_shifts(shift_id);
CREATE INDEX idx_business_day_shifts_day_of_week ON public.business_day_shifts(day_of_week);
CREATE INDEX idx_business_day_shifts_is_active ON public.business_day_shifts(is_active);

-- ========================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ========================================
CREATE TRIGGER update_business_day_shifts_updated_at
BEFORE UPDATE ON public.business_day_shifts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.business_day_shifts ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública (cualquiera puede ver los turnos activos de negocios activos)
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

-- Policy: Lectura privada (dueños ven toda su configuración)
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

-- Policy: Insert (solo dueños pueden crear configuraciones)
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

-- Policy: Update (solo dueños pueden actualizar configuraciones)
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

-- Policy: Delete (solo dueños pueden eliminar configuraciones)
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
-- FUNCIÓN HELPER: Habilitar un turno para todos los días
-- ========================================
-- Esta función es útil para inicializar la configuración
-- cuando se crea un nuevo turno
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
-- COMENTARIOS
-- ========================================
COMMENT ON TABLE public.business_day_shifts IS 'Relación entre días de la semana y turnos habilitados para cada negocio';
COMMENT ON COLUMN public.business_day_shifts.day_of_week IS 'Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)';
COMMENT ON COLUMN public.business_day_shifts.is_active IS 'Si este turno está habilitado para este día específico';
COMMENT ON FUNCTION enable_shift_for_all_days IS 'Helper function para habilitar un turno en todos los días de la semana';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- ¡Tabla de relación creada exitosamente! ✅
-- Próximos pasos:
-- 1. Modificar AdminHoursSection para gestionar esta tabla
-- 2. Modificar BusinessPage para filtrar turnos por día
-- ========================================
