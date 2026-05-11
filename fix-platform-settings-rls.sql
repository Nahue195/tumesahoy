-- Fix: RLS en platform_settings para permitir acceso al superadmin
-- La policy anterior USING(false) bloqueaba TODO incluyendo las queries del superadmin

-- Eliminar policy anterior que bloqueaba todo
DROP POLICY IF EXISTS "Solo service role" ON public.platform_settings;

-- SELECT: solo el superadmin puede leer
CREATE POLICY "superadmin_select" ON public.platform_settings
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'cre8nahue@gmail.com');

-- INSERT/UPDATE/DELETE: solo el superadmin puede escribir
CREATE POLICY "superadmin_modify" ON public.platform_settings
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'cre8nahue@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'cre8nahue@gmail.com');

-- Asegurarse de que RLS esté habilitado (ya debería estarlo)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
