-- Tabla de configuración global de la plataforma
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Valor inicial del % de comisión
INSERT INTO public.platform_settings (key, value)
VALUES ('marketplace_fee_percent', '10')
ON CONFLICT (key) DO NOTHING;

-- Columna para trackear la comisión en cada reserva
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS commission_amount numeric(10,2) DEFAULT 0;

-- RLS: solo service role puede leer/escribir platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Solo service role" ON public.platform_settings
  USING (false);
