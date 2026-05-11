-- ========================================
-- TuMesaHoy - Script de Configuración Completa de Base de Datos
-- ========================================
-- Este script crea todas las tablas, políticas RLS, funciones y triggers
-- necesarios para TuMesaHoy en Supabase
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega TODO este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- TABLA: businesses (Negocios/Restaurantes)
-- ========================================
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información básica
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,

  -- Categoría y ubicación
  category VARCHAR(100) DEFAULT 'restaurant',
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),

  -- Redes sociales
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  whatsapp VARCHAR(50),

  -- Estado del negocio
  is_active BOOLEAN DEFAULT false,
  is_accepting_reservations BOOLEAN DEFAULT false,
  subscription_status VARCHAR(50) DEFAULT 'inactive',

  -- Mercado Pago
  mercadopago_subscription_id VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trial', 'past_due'))
);

-- Índices para businesses
CREATE INDEX idx_businesses_user_id ON public.businesses(user_id);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);
CREATE INDEX idx_businesses_is_active ON public.businesses(is_active);
CREATE INDEX idx_businesses_category ON public.businesses(category);

-- ========================================
-- TABLA: menu_categories (Categorías del Menú)
-- ========================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para menu_categories
CREATE INDEX idx_menu_categories_business_id ON public.menu_categories(business_id);
CREATE INDEX idx_menu_categories_display_order ON public.menu_categories(display_order);

-- ========================================
-- TABLA: menu_items (Items del Menú)
-- ========================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,

  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Etiquetas (vegetariano, vegano, sin gluten, etc.)
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para menu_items
CREATE INDEX idx_menu_items_business_id ON public.menu_items(business_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_is_available ON public.menu_items(is_available);

-- ========================================
-- TABLA: business_hours (Horarios de Atención)
-- ========================================
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_business_day UNIQUE (business_id, day_of_week)
);

-- Índice para business_hours
CREATE INDEX idx_business_hours_business_id ON public.business_hours(business_id);

-- ========================================
-- TABLA: reservations (Reservas)
-- ========================================
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Información del cliente
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),

  -- Detalles de la reserva
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  number_of_people INTEGER NOT NULL CHECK (number_of_people > 0),
  special_requests TEXT,

  -- Estado de la reserva
  status VARCHAR(50) DEFAULT 'pending',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_reservation_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show'))
);

-- Índices para reservations
CREATE INDEX idx_reservations_business_id ON public.reservations(business_id);
CREATE INDEX idx_reservations_date ON public.reservations(reservation_date);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_created_at ON public.reservations(created_at DESC);

-- ========================================
-- TABLA: payments (Pagos)
-- ========================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- IDs de Mercado Pago
  mercadopago_payment_id VARCHAR(255) UNIQUE NOT NULL,
  mercadopago_subscription_id VARCHAR(255),

  -- Información del pago
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(100),
  payment_type VARCHAR(100),
  description TEXT,

  -- Información del pagador
  payer_email VARCHAR(255),
  payer_name VARCHAR(255),

  -- Metadata completa de Mercado Pago (JSONB para consultas flexibles)
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para payments
CREATE INDEX idx_payments_business_id ON public.payments(business_id);
CREATE INDEX idx_payments_mercadopago_payment_id ON public.payments(mercadopago_payment_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- ========================================
-- TABLA: subscriptions (Suscripciones)
-- ========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- IDs de Mercado Pago
  mercadopago_subscription_id VARCHAR(255),
  mercadopago_payer_id VARCHAR(255),

  -- Estado de la suscripción
  status VARCHAR(50) DEFAULT 'active',

  -- Fechas importantes
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,

  -- Detalles financieros
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ARS',
  payment_method VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'cancelled', 'paused', 'pending'))
);

-- Índices para subscriptions
CREATE INDEX idx_subscriptions_business_id ON public.subscriptions(business_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);

-- ========================================
-- TABLA: webhook_logs (Logs de Webhooks para debugging)
-- ========================================
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  webhook_type VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'received',

  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_webhook_status CHECK (status IN ('received', 'processed', 'error', 'ignored'))
);

-- Índices para webhook_logs
CREATE INDEX idx_webhook_logs_webhook_type ON public.webhook_logs(webhook_type);
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_resource_id ON public.webhook_logs(resource_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- ========================================
-- TRIGGERS: updated_at automático
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON public.business_hours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCIÓN: process_payment_success
-- ========================================
-- Función llamada por el webhook cuando un pago es exitoso
CREATE OR REPLACE FUNCTION process_payment_success(
  p_business_id UUID,
  p_payment_id VARCHAR,
  p_subscription_id VARCHAR DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_next_billing_date TIMESTAMPTZ;
BEGIN
  -- Calcular próxima fecha de facturación (30 días desde ahora)
  v_next_billing_date := NOW() + INTERVAL '30 days';

  -- Activar el negocio
  UPDATE public.businesses
  SET
    subscription_status = 'active',
    is_active = true,
    is_accepting_reservations = true,
    mercadopago_subscription_id = COALESCE(p_subscription_id, mercadopago_subscription_id),
    updated_at = NOW()
  WHERE id = p_business_id;

  -- Actualizar o crear suscripción
  INSERT INTO public.subscriptions (
    business_id,
    mercadopago_subscription_id,
    status,
    start_date,
    next_billing_date,
    last_payment_date,
    amount,
    currency
  )
  VALUES (
    p_business_id,
    p_subscription_id,
    'active',
    NOW(),
    v_next_billing_date,
    NOW(),
    1.00, -- Precio de testing
    'ARS'
  )
  ON CONFLICT (business_id)
  DO UPDATE SET
    status = 'active',
    last_payment_date = NOW(),
    next_billing_date = v_next_billing_date,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- POLICIES: businesses
-- ----------------------------------------

-- Los usuarios pueden ver negocios activos
CREATE POLICY "Cualquiera puede ver negocios activos"
  ON public.businesses FOR SELECT
  USING (is_active = true);

-- Los usuarios pueden ver sus propios negocios (incluso inactivos)
CREATE POLICY "Usuarios pueden ver sus propios negocios"
  ON public.businesses FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios negocios
CREATE POLICY "Usuarios pueden crear negocios"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar solo sus propios negocios
CREATE POLICY "Usuarios pueden actualizar sus propios negocios"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar solo sus propios negocios
CREATE POLICY "Usuarios pueden eliminar sus propios negocios"
  ON public.businesses FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------
-- POLICIES: menu_categories
-- ----------------------------------------

-- Cualquiera puede ver categorías de negocios activos
CREATE POLICY "Cualquiera puede ver categorías de negocios activos"
  ON public.menu_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_categories.business_id
      AND is_active = true
    )
  );

-- Los dueños pueden ver categorías de sus negocios
CREATE POLICY "Dueños pueden ver categorías de sus negocios"
  ON public.menu_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_categories.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden crear categorías en sus negocios
CREATE POLICY "Dueños pueden crear categorías"
  ON public.menu_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_categories.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden actualizar categorías de sus negocios
CREATE POLICY "Dueños pueden actualizar categorías"
  ON public.menu_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_categories.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden eliminar categorías de sus negocios
CREATE POLICY "Dueños pueden eliminar categorías"
  ON public.menu_categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_categories.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: menu_items
-- ----------------------------------------

-- Cualquiera puede ver items de negocios activos
CREATE POLICY "Cualquiera puede ver items de negocios activos"
  ON public.menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_items.business_id
      AND is_active = true
    )
  );

-- Los dueños pueden ver items de sus negocios
CREATE POLICY "Dueños pueden ver items de sus negocios"
  ON public.menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_items.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden crear items en sus negocios
CREATE POLICY "Dueños pueden crear items"
  ON public.menu_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_items.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden actualizar items de sus negocios
CREATE POLICY "Dueños pueden actualizar items"
  ON public.menu_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_items.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden eliminar items de sus negocios
CREATE POLICY "Dueños pueden eliminar items"
  ON public.menu_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = menu_items.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: business_hours
-- ----------------------------------------

-- Cualquiera puede ver horarios de negocios activos
CREATE POLICY "Cualquiera puede ver horarios de negocios activos"
  ON public.business_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_hours.business_id
      AND is_active = true
    )
  );

-- Los dueños pueden gestionar horarios de sus negocios
CREATE POLICY "Dueños pueden ver horarios de sus negocios"
  ON public.business_hours FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_hours.business_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden crear horarios"
  ON public.business_hours FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_hours.business_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden actualizar horarios"
  ON public.business_hours FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_hours.business_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden eliminar horarios"
  ON public.business_hours FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_hours.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: reservations
-- ----------------------------------------

-- Cualquiera puede crear reservas en negocios activos
CREATE POLICY "Cualquiera puede crear reservas en negocios activos"
  ON public.reservations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND is_active = true
      AND is_accepting_reservations = true
    )
  );

-- Los dueños pueden ver reservas de sus negocios
CREATE POLICY "Dueños pueden ver reservas de sus negocios"
  ON public.reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden actualizar reservas de sus negocios
CREATE POLICY "Dueños pueden actualizar reservas"
  ON public.reservations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: payments
-- ----------------------------------------

-- Solo los dueños pueden ver pagos de sus negocios
CREATE POLICY "Dueños pueden ver pagos de sus negocios"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = payments.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: subscriptions
-- ----------------------------------------

-- Solo los dueños pueden ver suscripciones de sus negocios
CREATE POLICY "Dueños pueden ver suscripciones de sus negocios"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = subscriptions.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- POLICIES: webhook_logs
-- ----------------------------------------

-- Solo administradores pueden ver logs de webhooks (ningún usuario regular)
-- Esta tabla es solo para debugging interno
CREATE POLICY "Solo service role puede acceder a webhook_logs"
  ON public.webhook_logs FOR ALL
  USING (false);

-- ========================================
-- COMENTARIOS EN LAS TABLAS (Documentación)
-- ========================================

COMMENT ON TABLE public.businesses IS 'Negocios/Restaurantes registrados en la plataforma';
COMMENT ON TABLE public.menu_categories IS 'Categorías del menú de cada negocio';
COMMENT ON TABLE public.menu_items IS 'Items/platos del menú';
COMMENT ON TABLE public.business_hours IS 'Horarios de atención por día de la semana';
COMMENT ON TABLE public.reservations IS 'Reservas de clientes';
COMMENT ON TABLE public.payments IS 'Historial de pagos de suscripciones';
COMMENT ON TABLE public.subscriptions IS 'Suscripciones activas/históricas';
COMMENT ON TABLE public.webhook_logs IS 'Logs de webhooks recibidos (debugging)';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- Si llegaste hasta aquí sin errores, ¡la base de datos está lista! ✅
-- Próximos pasos:
-- 1. Configurar Storage buckets (ver GUIA_CONFIGURACION_SUPABASE.md)
-- 2. Desplegar Edge Functions
-- 3. Configurar secrets
-- ========================================
