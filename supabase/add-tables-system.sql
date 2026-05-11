-- ========================================
-- TuMesaHoy - Sistema de Gestión de Mesas
-- ========================================
-- Este script agrega el sistema completo de gestión de mesas con mapa visual
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega TODO este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- TABLA: table_types (Tipos de Mesa)
-- ========================================
CREATE TABLE IF NOT EXISTS public.table_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Información del tipo
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🪑',
  color VARCHAR(7) DEFAULT '#FF6B35',

  -- Capacidad y características
  min_capacity INTEGER NOT NULL DEFAULT 1,
  max_capacity INTEGER NOT NULL DEFAULT 4,

  -- Orden y estado
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_capacity CHECK (max_capacity >= min_capacity AND min_capacity > 0)
);

CREATE INDEX idx_table_types_business_id ON public.table_types(business_id);
CREATE INDEX idx_table_types_is_active ON public.table_types(is_active);

-- ========================================
-- TABLA: tables (Mesas Físicas)
-- ========================================
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  table_type_id UUID NOT NULL REFERENCES public.table_types(id) ON DELETE CASCADE,

  -- Identificación
  table_number VARCHAR(50) NOT NULL,
  table_name VARCHAR(100),

  -- Posición en el mapa (coordenadas relativas 0-1000)
  position_x INTEGER NOT NULL DEFAULT 500,
  position_y INTEGER NOT NULL DEFAULT 500,

  -- Dimensiones visuales (para el canvas)
  width INTEGER DEFAULT 80,
  height INTEGER DEFAULT 80,
  rotation INTEGER DEFAULT 0,
  shape VARCHAR(20) DEFAULT 'circle',

  -- Estado
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_position CHECK (position_x >= 0 AND position_x <= 1000 AND position_y >= 0 AND position_y <= 1000),
  CONSTRAINT valid_dimensions CHECK (width > 0 AND height > 0),
  CONSTRAINT valid_rotation CHECK (rotation >= 0 AND rotation < 360),
  CONSTRAINT unique_table_number UNIQUE (business_id, table_number)
);

CREATE INDEX idx_tables_business_id ON public.tables(business_id);
CREATE INDEX idx_tables_table_type_id ON public.tables(table_type_id);
CREATE INDEX idx_tables_is_active ON public.tables(is_active);

-- ========================================
-- TABLA: floor_plans (Planos del Local)
-- ========================================
CREATE TABLE IF NOT EXISTS public.floor_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Imagen del plano
  image_url TEXT,

  -- Dimensiones del canvas (para mantener proporciones)
  canvas_width INTEGER DEFAULT 1000,
  canvas_height INTEGER DEFAULT 600,

  -- Configuración visual
  background_color VARCHAR(7) DEFAULT '#F8F9FA',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_floor_plan_per_business UNIQUE (business_id)
);

CREATE INDEX idx_floor_plans_business_id ON public.floor_plans(business_id);

-- ========================================
-- MODIFICAR TABLA: reservations
-- ========================================
-- Agregar campos para tipo preferido y mesa asignada
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS preferred_table_type_id UUID REFERENCES public.table_types(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_preferred_table_type ON public.reservations(preferred_table_type_id);
CREATE INDEX IF NOT EXISTS idx_reservations_assigned_table ON public.reservations(assigned_table_id);

-- ========================================
-- FUNCIÓN: get_available_tables_by_type
-- ========================================
-- Obtiene mesas disponibles de un tipo específico en una fecha/hora
CREATE OR REPLACE FUNCTION get_available_tables_by_type(
  p_business_id UUID,
  p_table_type_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER DEFAULT 120
)
RETURNS TABLE (
  table_id UUID,
  table_number VARCHAR,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as table_id,
    t.table_number,
    NOT EXISTS (
      SELECT 1
      FROM public.reservations r
      WHERE r.assigned_table_id = t.id
        AND r.reservation_date = p_date
        AND r.status IN ('pending', 'confirmed')
        AND (
          -- Verificar solapamiento de horarios
          -- Caso 1: Reserva existente empieza durante la nueva
          (r.reservation_time <= p_time AND
           r.reservation_time + (p_duration_minutes || ' minutes')::INTERVAL > p_time)
          OR
          -- Caso 2: Nueva reserva empieza durante la existente
          (p_time <= r.reservation_time AND
           p_time + (p_duration_minutes || ' minutes')::INTERVAL > r.reservation_time)
        )
    ) as is_available
  FROM public.tables t
  WHERE t.business_id = p_business_id
    AND t.table_type_id = p_table_type_id
    AND t.is_active = true
  ORDER BY t.table_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGERS: updated_at automático
-- ========================================
-- Aplicar trigger a las nuevas tablas
CREATE TRIGGER update_table_types_updated_at BEFORE UPDATE ON public.table_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_floor_plans_updated_at BEFORE UPDATE ON public.floor_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE public.table_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_plans ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- POLICIES: table_types
-- ----------------------------------------

-- Lectura pública (negocios activos)
CREATE POLICY "table_types_public_read"
  ON public.table_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = table_types.business_id AND is_active = true
    )
  );

-- Lectura dueño (todos los negocios)
CREATE POLICY "table_types_owner_read"
  ON public.table_types FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = table_types.business_id AND user_id = auth.uid()
    )
  );

-- CRUD dueño
CREATE POLICY "table_types_owner_insert"
  ON public.table_types FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = table_types.business_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "table_types_owner_update"
  ON public.table_types FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = table_types.business_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "table_types_owner_delete"
  ON public.table_types FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = table_types.business_id AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: tables
-- ----------------------------------------

-- Lectura pública (solo para negocios activos - necesario para el mapa público)
CREATE POLICY "tables_public_read"
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = tables.business_id AND is_active = true
    )
  );

-- Lectura dueño
CREATE POLICY "tables_owner_read"
  ON public.tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = tables.business_id AND user_id = auth.uid()
    )
  );

-- CRUD dueño
CREATE POLICY "tables_owner_insert"
  ON public.tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = tables.business_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "tables_owner_update"
  ON public.tables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = tables.business_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "tables_owner_delete"
  ON public.tables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = tables.business_id AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: floor_plans
-- ----------------------------------------

-- Lectura pública
CREATE POLICY "floor_plans_public_read"
  ON public.floor_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = floor_plans.business_id AND is_active = true
    )
  );

-- CRUD dueño
CREATE POLICY "floor_plans_owner_all"
  ON public.floor_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = floor_plans.business_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = floor_plans.business_id AND user_id = auth.uid()
    )
  );

-- ========================================
-- COMENTARIOS EN LAS TABLAS (Documentación)
-- ========================================

COMMENT ON TABLE public.table_types IS 'Tipos de mesa configurables por cada negocio (común, comunitaria, barra, etc.)';
COMMENT ON TABLE public.tables IS 'Mesas físicas con posición en el mapa del local';
COMMENT ON TABLE public.floor_plans IS 'Planos visuales de los locales con imagen de fondo';

COMMENT ON COLUMN public.reservations.preferred_table_type_id IS 'Tipo de mesa preferido por el cliente';
COMMENT ON COLUMN public.reservations.assigned_table_id IS 'Mesa específica asignada por el admin';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- Si llegaste hasta aquí sin errores, el sistema de mesas está listo! ✅
--
-- Próximos pasos:
-- 1. Verificar en Supabase Dashboard que las tablas se crearon
-- 2. Instalar react-draggable: npm install react-draggable
-- 3. Crear los componentes según el plan
-- ========================================
