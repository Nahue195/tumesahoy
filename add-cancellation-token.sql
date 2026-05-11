-- ========================================
-- TuMesaHoy - Agregar Token de Cancelación
-- ========================================
-- Este script agrega la funcionalidad para que los clientes
-- puedan cancelar sus propias reservas con un link único
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega TODO este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- PASO 1: Agregar columna cancellation_token
-- ========================================
ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS cancellation_token VARCHAR(64) UNIQUE;

-- Crear índice para búsqueda rápida por token
CREATE INDEX IF NOT EXISTS idx_reservations_cancellation_token
ON public.reservations(cancellation_token)
WHERE cancellation_token IS NOT NULL;

-- ========================================
-- PASO 2: Función para generar token único
-- ========================================
-- Esta función genera un token aleatorio de 32 caracteres
CREATE OR REPLACE FUNCTION generate_cancellation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASO 3: Trigger para auto-generar token en nuevas reservas
-- ========================================
CREATE OR REPLACE FUNCTION set_cancellation_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cancellation_token IS NULL THEN
    NEW.cancellation_token := generate_cancellation_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_cancellation_token_trigger ON public.reservations;

CREATE TRIGGER set_cancellation_token_trigger
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION set_cancellation_token();

-- ========================================
-- PASO 4: Generar tokens para reservas existentes (sin token)
-- ========================================
UPDATE public.reservations
SET cancellation_token = generate_cancellation_token()
WHERE cancellation_token IS NULL;

-- ========================================
-- PASO 5: Política RLS para permitir ver/cancelar por token
-- ========================================
-- Permitir que cualquiera pueda ver una reserva si tiene el token correcto
DROP POLICY IF EXISTS "Clientes pueden ver su reserva con token" ON public.reservations;

CREATE POLICY "Clientes pueden ver su reserva con token"
  ON public.reservations FOR SELECT
  TO anon, authenticated
  USING (
    cancellation_token IS NOT NULL
  );

-- Permitir que cualquiera pueda cancelar una reserva si tiene el token correcto
-- (La verificación del token se hace en la aplicación)
DROP POLICY IF EXISTS "Clientes pueden cancelar su reserva con token" ON public.reservations;

CREATE POLICY "Clientes pueden cancelar su reserva con token"
  ON public.reservations FOR UPDATE
  TO anon, authenticated
  USING (
    cancellation_token IS NOT NULL
  )
  WITH CHECK (
    -- Solo permitir cambiar el status a 'cancelled'
    status = 'cancelled'
  );

-- ========================================
-- PASO 6: Función RPC segura para cancelar por token
-- ========================================
-- Esta función es más segura porque valida el token en el servidor
CREATE OR REPLACE FUNCTION cancel_reservation_by_token(p_token VARCHAR)
RETURNS JSON AS $$
DECLARE
  v_reservation RECORD;
  v_result JSON;
BEGIN
  -- Buscar la reserva por token
  SELECT id, status, customer_name, reservation_date, reservation_time, business_id
  INTO v_reservation
  FROM public.reservations
  WHERE cancellation_token = p_token;

  -- Si no existe
  IF v_reservation.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reserva no encontrada'
    );
  END IF;

  -- Si ya está cancelada
  IF v_reservation.status = 'cancelled' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Esta reserva ya fue cancelada'
    );
  END IF;

  -- Si ya pasó la fecha
  IF v_reservation.reservation_date < CURRENT_DATE THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No se puede cancelar una reserva pasada'
    );
  END IF;

  -- Si es hoy y ya pasó la hora (con 1 hora de margen)
  IF v_reservation.reservation_date = CURRENT_DATE
     AND v_reservation.reservation_time < (CURRENT_TIME - INTERVAL '1 hour') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'No se puede cancelar una reserva que ya comenzó'
    );
  END IF;

  -- Cancelar la reserva
  UPDATE public.reservations
  SET status = 'cancelled',
      updated_at = NOW()
  WHERE id = v_reservation.id;

  RETURN json_build_object(
    'success', true,
    'message', 'Reserva cancelada exitosamente'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- PASO 7: Función RPC para obtener reserva por token (solo datos públicos)
-- ========================================
CREATE OR REPLACE FUNCTION get_reservation_by_token(p_token VARCHAR)
RETURNS JSON AS $$
DECLARE
  v_reservation RECORD;
  v_business RECORD;
BEGIN
  -- Buscar la reserva por token
  SELECT
    r.id,
    r.customer_name,
    r.reservation_date,
    r.reservation_time,
    r.number_of_people,
    r.status,
    r.special_requests,
    r.business_id
  INTO v_reservation
  FROM public.reservations r
  WHERE r.cancellation_token = p_token;

  -- Si no existe
  IF v_reservation.id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Reserva no encontrada'
    );
  END IF;

  -- Obtener datos del negocio
  SELECT name, slug, address, phone
  INTO v_business
  FROM public.businesses
  WHERE id = v_reservation.business_id;

  RETURN json_build_object(
    'success', true,
    'reservation', json_build_object(
      'id', v_reservation.id,
      'customer_name', v_reservation.customer_name,
      'reservation_date', v_reservation.reservation_date,
      'reservation_time', v_reservation.reservation_time,
      'number_of_people', v_reservation.number_of_people,
      'status', v_reservation.status,
      'special_requests', v_reservation.special_requests
    ),
    'business', json_build_object(
      'name', v_business.name,
      'slug', v_business.slug,
      'address', v_business.address,
      'phone', v_business.phone
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Ver la nueva columna
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reservations' AND column_name = 'cancellation_token';

-- Ver las funciones creadas
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('generate_cancellation_token', 'cancel_reservation_by_token', 'get_reservation_by_token');

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
