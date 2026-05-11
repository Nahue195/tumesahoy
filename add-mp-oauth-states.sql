-- Tabla para tokens de estado del OAuth de MercadoPago
-- Reemplaza el patrón inseguro de pasar el JWT del usuario en el parámetro state de la URL

CREATE TABLE IF NOT EXISTS public.mp_oauth_states (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  used        BOOLEAN     NOT NULL DEFAULT false
);

-- RLS: los usuarios solo pueden insertar sus propios estados
ALTER TABLE public.mp_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_insert_own_state" ON public.mp_oauth_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden ver sus propios estados (opcional, no estrictamente necesario)
CREATE POLICY "users_select_own_state" ON public.mp_oauth_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- La Edge Function usa service_role key que bypasea RLS para leer y actualizar

-- Índice para limpiar estados expirados fácilmente
CREATE INDEX IF NOT EXISTS idx_mp_oauth_states_expires_at
  ON public.mp_oauth_states (expires_at);
