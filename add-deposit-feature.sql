-- ============================================
-- FEATURE: Seña online (depósito al reservar)
-- ============================================

-- Configuración de seña y OAuth de MP en el negocio
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS requires_deposit boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS deposit_type text DEFAULT 'fixed' CHECK (deposit_type IN ('fixed', 'per_person')),
  ADD COLUMN IF NOT EXISTS deposit_refundable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS deposit_cancellation_hours integer DEFAULT 24,
  ADD COLUMN IF NOT EXISTS mp_seller_access_token text,
  ADD COLUMN IF NOT EXISTS mp_seller_refresh_token text,
  ADD COLUMN IF NOT EXISTS mp_seller_user_id text,
  ADD COLUMN IF NOT EXISTS mp_seller_token_expires_at timestamptz;

-- Estado del depósito en cada reserva
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS deposit_status text DEFAULT 'not_required'
    CHECK (deposit_status IN ('not_required', 'pending', 'paid', 'refunded', 'failed')),
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS deposit_payment_id text;
