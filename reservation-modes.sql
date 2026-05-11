  -- ============================================
  -- Sistema de Modos de Reserva Configurables
  -- ============================================
  -- Permite a cada negocio elegir:
  -- - 'no_turnover': Una reserva = mesa ocupada todo el día
  -- - 'with_duration': Múltiples reservas por día con duración fija

  -- 1. Agregar campos a la tabla businesses
  -- ----------------------------------------
  ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS reservation_mode VARCHAR(20) DEFAULT 'no_turnover'
    CHECK (reservation_mode IN ('no_turnover', 'with_duration'));

  ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS default_reservation_duration INTEGER DEFAULT 120
    CHECK (default_reservation_duration >= 30 AND default_reservation_duration <= 480);

  -- Agregar comentarios para documentación
  COMMENT ON COLUMN public.businesses.reservation_mode IS 'Modo de reserva: no_turnover (mesa ocupada todo el día) o with_duration (múltiples reservas con duración)';
  COMMENT ON COLUMN public.businesses.default_reservation_duration IS 'Duración predeterminada de cada reserva en minutos (solo aplica en modo with_duration)';


  -- 2. Actualizar función get_table_type_availability
  -- -------------------------------------------------
  -- Esta función ahora considera el modo de reserva del negocio

  CREATE OR REPLACE FUNCTION get_table_type_availability(
    p_business_id UUID,
    p_table_type_id UUID,
    p_date DATE,
    p_time TIME
  )
  RETURNS TABLE (
    total_capacity INTEGER,
    used_capacity INTEGER,
    available_capacity INTEGER,
    is_shared BOOLEAN
  ) AS $$
  DECLARE
    v_is_shared BOOLEAN;
    v_total INTEGER;
    v_used INTEGER;
    v_reservation_mode VARCHAR(20);
    v_duration_minutes INTEGER;
    v_time_start TIME;
    v_time_end TIME;
  BEGIN
    -- Obtener modo de reserva del negocio
    SELECT
      COALESCE(b.reservation_mode, 'no_turnover'),
      COALESCE(b.default_reservation_duration, 120)
    INTO v_reservation_mode, v_duration_minutes
    FROM businesses b
    WHERE b.id = p_business_id;

    -- Obtener info del tipo de mesa
    SELECT tt.is_shared
    INTO v_is_shared
    FROM table_types tt
    WHERE tt.id = p_table_type_id AND tt.business_id = p_business_id;

    IF NOT FOUND THEN
      RETURN QUERY SELECT 0, 0, 0, FALSE;
      RETURN;
    END IF;

    -- Calcular capacidad total
    IF v_is_shared THEN
      -- Para mesas compartidas: suma de capacidades máximas
      SELECT COALESCE(SUM(t.capacity), 0)
      INTO v_total
      FROM tables t
      WHERE t.business_id = p_business_id
        AND t.table_type_id = p_table_type_id
        AND t.is_active = TRUE;
    ELSE
      -- Para mesas normales: cuenta de mesas
      SELECT COUNT(*)::INTEGER
      INTO v_total
      FROM tables t
      WHERE t.business_id = p_business_id
        AND t.table_type_id = p_table_type_id
        AND t.is_active = TRUE;
    END IF;

    -- Calcular capacidad usada según el modo de reserva
    IF v_reservation_mode = 'no_turnover' THEN
      -- MODO SIN RECAMBIO: Una reserva ocupa todo el día
      IF v_is_shared THEN
        -- Sumar personas de todas las reservas del día
        SELECT COALESCE(SUM(r.number_of_people), 0)
        INTO v_used
        FROM reservations r
        WHERE r.business_id = p_business_id
          AND r.preferred_table_type_id = p_table_type_id
          AND r.reservation_date = p_date
          AND r.status IN ('pending', 'confirmed');
      ELSE
        -- Contar reservas del día
        SELECT COUNT(*)::INTEGER
        INTO v_used
        FROM reservations r
        WHERE r.business_id = p_business_id
          AND r.preferred_table_type_id = p_table_type_id
          AND r.reservation_date = p_date
          AND r.status IN ('pending', 'confirmed');
      END IF;
    ELSE
      -- MODO CON DURACIÓN: Verificar solapamiento de horarios
      v_time_start := p_time;
      v_time_end := p_time + (v_duration_minutes * INTERVAL '1 minute');

      IF v_is_shared THEN
        -- Sumar personas de reservas que se solapan con el horario
        SELECT COALESCE(SUM(r.number_of_people), 0)
        INTO v_used
        FROM reservations r
        WHERE r.business_id = p_business_id
          AND r.preferred_table_type_id = p_table_type_id
          AND r.reservation_date = p_date
          AND r.status IN ('pending', 'confirmed')
          -- Verificar solapamiento de horarios
          AND (
            -- La nueva reserva empieza durante una existente
            (p_time >= r.reservation_time AND p_time < (r.reservation_time + (v_duration_minutes * INTERVAL '1 minute')))
            OR
            -- La nueva reserva termina durante una existente
            (v_time_end > r.reservation_time AND v_time_end <= (r.reservation_time + (v_duration_minutes * INTERVAL '1 minute')))
            OR
            -- La nueva reserva contiene completamente a una existente
            (p_time <= r.reservation_time AND v_time_end >= (r.reservation_time + (v_duration_minutes * INTERVAL '1 minute')))
          );
      ELSE
        -- Contar mesas ocupadas que se solapan con el horario
        SELECT COUNT(*)::INTEGER
        INTO v_used
        FROM reservations r
        WHERE r.business_id = p_business_id
          AND r.preferred_table_type_id = p_table_type_id
          AND r.reservation_date = p_date
          AND r.status IN ('pending', 'confirmed')
          -- Verificar solapamiento de horarios
          AND (
            (p_time >= r.reservation_time AND p_time < (r.reservation_time + (v_duration_minutes * INTERVAL '1 minute')))
            OR
            (v_time_end > r.reservation_time AND v_time_end <= (r.reservation_time + (v_duration_minutes * INTERVAL '1 minute')))
            OR
            (p_time <= r.reservation_time AND v_time_end >= (r.reservation_time + (v_duration_minutes * INTERVAL '1 minute')))
          );
      END IF;
    END IF;

    RETURN QUERY SELECT
      v_total,
      v_used,
      GREATEST(v_total - v_used, 0),
      v_is_shared;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;


  -- 3. Actualizar función validate_reservation_availability
  -- -------------------------------------------------------
  -- Trigger que valida antes de insertar una reserva

  CREATE OR REPLACE FUNCTION validate_reservation_availability()
  RETURNS TRIGGER AS $$
  DECLARE
    v_available_capacity INTEGER;
    v_is_shared BOOLEAN;
    v_reservation_mode VARCHAR(20);
    v_duration_minutes INTEGER;
  BEGIN
    -- Solo validar si hay un tipo de mesa seleccionado
    IF NEW.preferred_table_type_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Obtener modo de reserva del negocio
    SELECT
      COALESCE(b.reservation_mode, 'no_turnover'),
      COALESCE(b.default_reservation_duration, 120)
    INTO v_reservation_mode, v_duration_minutes
    FROM businesses b
    WHERE b.id = NEW.business_id;

    -- Obtener disponibilidad usando la función actualizada
    SELECT
      available_capacity,
      is_shared
    INTO v_available_capacity, v_is_shared
    FROM get_table_type_availability(
      NEW.business_id,
      NEW.preferred_table_type_id,
      NEW.reservation_date,
      NEW.reservation_time
    );

    -- Validar disponibilidad
    IF v_is_shared THEN
      -- Para mesas compartidas: verificar que hay suficientes lugares
      IF v_available_capacity < NEW.number_of_people THEN
        IF v_reservation_mode = 'no_turnover' THEN
          RAISE EXCEPTION 'No hay suficientes lugares disponibles para este día. Disponibles: %, Solicitados: %',
            v_available_capacity, NEW.number_of_people;
        ELSE
          RAISE EXCEPTION 'No hay suficientes lugares disponibles para este horario. Disponibles: %, Solicitados: %',
            v_available_capacity, NEW.number_of_people;
        END IF;
      END IF;
    ELSE
      -- Para mesas normales: verificar que hay al menos 1 mesa
      IF v_available_capacity < 1 THEN
        IF v_reservation_mode = 'no_turnover' THEN
          RAISE EXCEPTION 'No hay mesas disponibles para este día';
        ELSE
          RAISE EXCEPTION 'No hay mesas disponibles para este horario';
        END IF;
      END IF;
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Asegurar que el trigger existe
  DROP TRIGGER IF EXISTS check_reservation_availability ON reservations;
  CREATE TRIGGER check_reservation_availability
    BEFORE INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION validate_reservation_availability();


  -- 4. Función auxiliar para obtener info del modo de reserva
  -- ---------------------------------------------------------
  CREATE OR REPLACE FUNCTION get_business_reservation_mode(p_business_id UUID)
  RETURNS TABLE (
    reservation_mode VARCHAR(20),
    default_reservation_duration INTEGER
  ) AS $$
  BEGIN
    RETURN QUERY
    SELECT
      COALESCE(b.reservation_mode, 'no_turnover')::VARCHAR(20),
      COALESCE(b.default_reservation_duration, 120)
    FROM businesses b
    WHERE b.id = p_business_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;


  -- 5. Otorgar permisos necesarios
  -- -----------------------------
  GRANT EXECUTE ON FUNCTION get_table_type_availability(UUID, UUID, DATE, TIME) TO anon, authenticated;
  GRANT EXECUTE ON FUNCTION get_business_reservation_mode(UUID) TO anon, authenticated;


  -- 6. Migración: Establecer valores por defecto para negocios existentes
  -- ---------------------------------------------------------------------
  UPDATE businesses
  SET
    reservation_mode = 'no_turnover',
    default_reservation_duration = 120
  WHERE reservation_mode IS NULL;
