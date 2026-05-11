-- RPC server-side para activar un negocio cuando tiene suscripción válida
-- Reemplaza el update directo desde el cliente en AdminPage.jsx
-- SECURITY DEFINER corre con permisos del propietario de la función,
-- pero la lógica interna verifica auth.uid() = user_id antes de modificar

CREATE OR REPLACE FUNCTION activate_business_if_subscribed(p_business_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business businesses%ROWTYPE;
BEGIN
  -- Obtener el negocio verificando que pertenece al usuario autenticado
  SELECT * INTO v_business
  FROM businesses
  WHERE id = p_business_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('activated', false, 'reason', 'not_found');
  END IF;

  -- Solo activar si tiene un ID de suscripción de MP registrado
  IF v_business.mercadopago_subscription_id IS NULL THEN
    RETURN jsonb_build_object('activated', false, 'reason', 'no_subscription_id');
  END IF;

  -- No reactivar suscripciones canceladas
  IF v_business.subscription_status = 'cancelled' THEN
    RETURN jsonb_build_object('activated', false, 'reason', 'subscription_cancelled');
  END IF;

  -- Si ya está activo, no hay nada que hacer
  IF v_business.is_active AND v_business.subscription_status = 'active' THEN
    RETURN jsonb_build_object('activated', false, 'reason', 'already_active');
  END IF;

  -- Activar el negocio
  UPDATE businesses
  SET
    subscription_status      = 'active',
    is_active                = true,
    is_accepting_reservations = true
  WHERE id = p_business_id
    AND user_id = auth.uid();

  RETURN jsonb_build_object('activated', true);
END;
$$;

-- Solo usuarios autenticados pueden llamar esta función
REVOKE ALL ON FUNCTION activate_business_if_subscribed(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION activate_business_if_subscribed(UUID) TO authenticated;
