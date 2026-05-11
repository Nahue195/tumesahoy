-- Trigger para limitar 1 negocio por usuario autenticado.
-- El service role (Supabase SQL editor / inserciones manuales) bypasea este límite
-- porque auth.uid() devuelve NULL cuando no hay contexto de usuario autenticado.

CREATE OR REPLACE FUNCTION check_business_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Si no hay usuario autenticado (service role / SQL manual), permitir siempre
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Si el usuario ya tiene un negocio, bloquear
  IF (SELECT COUNT(*) FROM businesses WHERE user_id = NEW.user_id) >= 1 THEN
    RAISE EXCEPTION 'Solo se permite un negocio por cuenta.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si ya existe (para poder re-ejecutar el script)
DROP TRIGGER IF EXISTS enforce_one_business_per_user ON businesses;

CREATE TRIGGER enforce_one_business_per_user
BEFORE INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION check_business_limit();
