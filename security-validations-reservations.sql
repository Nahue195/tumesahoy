-- ========================================
-- TuMesaHoy - Validaciones de Seguridad para Reservations
-- ========================================
-- Este script agrega validaciones a nivel de base de datos para
-- prevenir datos maliciosos y ataques de spam
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega TODO este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- PASO 1: Agregar CHECK CONSTRAINTS para validar datos
-- ========================================

-- Validar longitud máxima del nombre (previene datos excesivos)
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_customer_name_length;

ALTER TABLE public.reservations
ADD CONSTRAINT check_customer_name_length
CHECK (
  LENGTH(customer_name) >= 2 AND
  LENGTH(customer_name) <= 100
);

-- Validar formato básico del teléfono (solo números, espacios, +, -, paréntesis)
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_customer_phone_format;

ALTER TABLE public.reservations
ADD CONSTRAINT check_customer_phone_format
CHECK (
  customer_phone ~ '^[\d\s\+\-\(\)]+$' AND
  LENGTH(customer_phone) >= 8 AND
  LENGTH(customer_phone) <= 30
);

-- Validar formato de email (si se proporciona)
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_customer_email_format;

ALTER TABLE public.reservations
ADD CONSTRAINT check_customer_email_format
CHECK (
  customer_email IS NULL OR
  customer_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
);

-- Validar cantidad de personas (rango razonable: 1-50)
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_number_of_people_range;

-- Primero eliminamos el constraint existente si hay
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS reservations_number_of_people_check;

ALTER TABLE public.reservations
ADD CONSTRAINT check_number_of_people_range
CHECK (
  number_of_people >= 1 AND
  number_of_people <= 50
);

-- Validar longitud de special_requests (previene spam de texto largo)
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_special_requests_length;

ALTER TABLE public.reservations
ADD CONSTRAINT check_special_requests_length
CHECK (
  special_requests IS NULL OR
  LENGTH(special_requests) <= 500
);

-- Validar que la fecha no sea muy en el pasado ni muy en el futuro
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS check_reservation_date_range;

ALTER TABLE public.reservations
ADD CONSTRAINT check_reservation_date_range
CHECK (
  reservation_date >= CURRENT_DATE - INTERVAL '1 day' AND
  reservation_date <= CURRENT_DATE + INTERVAL '365 days'
);

-- ========================================
-- PASO 2: Función de Rate Limiting
-- ========================================
-- Previene spam de reservas desde la misma IP/teléfono

CREATE OR REPLACE FUNCTION check_reservation_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_recent_count INTEGER;
  v_rate_limit INTEGER := 5; -- Máximo 5 reservas por teléfono en 1 hora
  v_time_window INTERVAL := '1 hour';
BEGIN
  -- Contar reservas recientes del mismo teléfono
  SELECT COUNT(*)
  INTO v_recent_count
  FROM public.reservations
  WHERE customer_phone = NEW.customer_phone
    AND created_at > NOW() - v_time_window;

  -- Si excede el límite, rechazar
  IF v_recent_count >= v_rate_limit THEN
    RAISE EXCEPTION 'Demasiadas reservas en poco tiempo. Por favor esperá un momento antes de intentar nuevamente.'
      USING HINT = 'rate_limit_exceeded';
  END IF;

  -- También verificar por email si se proporciona
  IF NEW.customer_email IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_recent_count
    FROM public.reservations
    WHERE customer_email = NEW.customer_email
      AND created_at > NOW() - v_time_window;

    IF v_recent_count >= v_rate_limit THEN
      RAISE EXCEPTION 'Demasiadas reservas en poco tiempo. Por favor esperá un momento antes de intentar nuevamente.'
        USING HINT = 'rate_limit_exceeded';
    END IF;
  END IF;

  -- Límite adicional: máximo 3 reservas pendientes por teléfono para el mismo negocio
  SELECT COUNT(*)
  INTO v_recent_count
  FROM public.reservations
  WHERE customer_phone = NEW.customer_phone
    AND business_id = NEW.business_id
    AND status IN ('pending', 'confirmed')
    AND reservation_date >= CURRENT_DATE;

  IF v_recent_count >= 3 THEN
    RAISE EXCEPTION 'Ya tenés reservas pendientes en este establecimiento. Por favor cancelá o esperá a que se completen antes de hacer nuevas reservas.'
      USING HINT = 'too_many_pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger de rate limiting
DROP TRIGGER IF EXISTS check_reservation_rate_limit_trigger ON public.reservations;

CREATE TRIGGER check_reservation_rate_limit_trigger
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION check_reservation_rate_limit();

-- ========================================
-- PASO 3: Función para sanitizar datos
-- ========================================
-- Limpia espacios extras y caracteres peligrosos

CREATE OR REPLACE FUNCTION sanitize_reservation_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpiar espacios extras del nombre
  NEW.customer_name := TRIM(REGEXP_REPLACE(NEW.customer_name, '\s+', ' ', 'g'));

  -- Limpiar espacios extras del teléfono
  NEW.customer_phone := TRIM(NEW.customer_phone);

  -- Limpiar email (lowercase y trim)
  IF NEW.customer_email IS NOT NULL THEN
    NEW.customer_email := LOWER(TRIM(NEW.customer_email));
  END IF;

  -- Limpiar special_requests
  IF NEW.special_requests IS NOT NULL THEN
    NEW.special_requests := TRIM(NEW.special_requests);
    -- Si queda vacío después de trim, ponerlo en NULL
    IF NEW.special_requests = '' THEN
      NEW.special_requests := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger de sanitización (debe ejecutarse ANTES del rate limit)
DROP TRIGGER IF EXISTS sanitize_reservation_data_trigger ON public.reservations;

CREATE TRIGGER sanitize_reservation_data_trigger
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION sanitize_reservation_data();

-- ========================================
-- PASO 4: Índice para mejorar performance del rate limiting
-- ========================================
-- Crea un índice para que las consultas de rate limiting sean rápidas

CREATE INDEX IF NOT EXISTS idx_reservations_phone_created
ON public.reservations(customer_phone, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reservations_email_created
ON public.reservations(customer_email, created_at DESC)
WHERE customer_email IS NOT NULL;

-- ========================================
-- PASO 5: Verificación
-- ========================================

-- Ver todos los constraints de la tabla reservations
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.reservations'::regclass
ORDER BY conname;

-- Ver todos los triggers de la tabla reservations
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'reservations'
ORDER BY action_timing, trigger_name;

-- ========================================
-- RESUMEN DE SEGURIDAD IMPLEMENTADA
-- ========================================
--
-- CHECK CONSTRAINTS:
-- 1. customer_name: 2-100 caracteres
-- 2. customer_phone: 8-30 caracteres, solo dígitos/espacios/+/-/()
-- 3. customer_email: formato válido de email (si se proporciona)
-- 4. number_of_people: entre 1 y 50
-- 5. special_requests: máximo 500 caracteres
-- 6. reservation_date: no más de 1 día en el pasado, no más de 1 año en el futuro
--
-- RATE LIMITING:
-- 1. Máximo 5 reservas por teléfono en 1 hora
-- 2. Máximo 5 reservas por email en 1 hora
-- 3. Máximo 3 reservas pendientes por teléfono en el mismo negocio
--
-- SANITIZACIÓN:
-- 1. Trim y normalización de espacios en nombre
-- 2. Trim de teléfono
-- 3. Lowercase y trim de email
-- 4. Trim de special_requests (NULL si queda vacío)
--
-- ========================================
-- FIN DEL SCRIPT
-- ========================================
