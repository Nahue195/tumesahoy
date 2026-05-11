-- ========================================
-- Script para agregar tabla de TURNOS (Shifts)
-- ========================================
-- Este script agrega la funcionalidad de turnos configurables
-- para que cada negocio pueda personalizar sus horarios de reserva
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- TABLA: business_shifts (Turnos del Negocio)
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
CREATE INDEX idx_business_shifts_business_id ON public.business_shifts(business_id);
CREATE INDEX idx_business_shifts_display_order ON public.business_shifts(display_order);
CREATE INDEX idx_business_shifts_is_active ON public.business_shifts(is_active);

-- ========================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ========================================
CREATE TRIGGER update_business_shifts_updated_at
BEFORE UPDATE ON public.business_shifts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
ALTER TABLE public.business_shifts ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública (cualquiera puede ver los turnos de negocios activos)
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

-- Policy: Lectura privada (dueños ven todos sus turnos, activos o no)
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

-- Policy: Insert (solo dueños pueden crear turnos)
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

-- Policy: Update (solo dueños pueden actualizar turnos)
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

-- Policy: Delete (solo dueños pueden eliminar turnos)
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
-- DATOS INICIALES (Ejemplo para testing)
-- ========================================
-- Nota: Comentado por defecto. Descomenta y modifica el business_id para crear turnos de ejemplo
/*
INSERT INTO public.business_shifts (business_id, name, icon, start_time, end_time, available_times, display_order) VALUES
  ('TU-BUSINESS-ID-AQUI', 'Almuerzo', '☀️', '12:00', '16:00', ARRAY['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'], 0),
  ('TU-BUSINESS-ID-AQUI', 'Cena', '🌙', '20:00', '23:30', ARRAY['20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'], 1);
*/

-- ========================================
-- COMENTARIOS
-- ========================================
COMMENT ON TABLE public.business_shifts IS 'Turnos configurables para reservas de cada negocio';
COMMENT ON COLUMN public.business_shifts.name IS 'Nombre del turno (Almuerzo, Cena, Merienda, etc.)';
COMMENT ON COLUMN public.business_shifts.icon IS 'Emoji o icono para mostrar en la UI';
COMMENT ON COLUMN public.business_shifts.available_times IS 'Array de horarios disponibles en formato HH:MM';
