-- =====================================================
-- SISTEMA DE RESERVAS SIN DURACIÓN
-- Una reserva = mesa ocupada todo el día
-- =====================================================

-- 1. Actualizar función get_table_type_availability
-- Ahora ignora la hora y cuenta reservas por día
CREATE OR REPLACE FUNCTION get_table_type_availability(
  p_business_id UUID,
  p_table_type_id UUID,
  p_date DATE,
  p_time TIME  -- Se mantiene el parámetro pero se ignora
)
RETURNS TABLE(
  total_capacity INTEGER,
  available_capacity INTEGER,
  is_shared BOOLEAN,
  used_capacity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Total de mesas de este tipo
    (SELECT COUNT(*)::INTEGER FROM tables
     WHERE business_id = p_business_id
     AND table_type_id = p_table_type_id
     AND is_active = true) as total_capacity,

    -- Mesas disponibles = total - reservas del día (pending o confirmed)
    (SELECT COUNT(*)::INTEGER FROM tables
     WHERE business_id = p_business_id
     AND table_type_id = p_table_type_id
     AND is_active = true) -
    (SELECT COUNT(*)::INTEGER FROM reservations
     WHERE business_id = p_business_id
     AND preferred_table_type_id = p_table_type_id
     AND reservation_date = p_date
     AND status IN ('pending', 'confirmed')) as available_capacity,

    false as is_shared,  -- No hay mesas compartidas en este modelo

    (SELECT COUNT(*)::INTEGER FROM reservations
     WHERE business_id = p_business_id
     AND preferred_table_type_id = p_table_type_id
     AND reservation_date = p_date
     AND status IN ('pending', 'confirmed')) as used_capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Actualizar trigger de validación de disponibilidad
-- Valida por día en vez de por hora
CREATE OR REPLACE FUNCTION validate_reservation_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_total_tables INTEGER;
  v_existing_reservations INTEGER;
BEGIN
  -- Solo validar si tiene tipo de mesa preferido
  IF NEW.preferred_table_type_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Contar mesas del tipo seleccionado
  SELECT COUNT(*) INTO v_total_tables
  FROM tables
  WHERE business_id = NEW.business_id
  AND table_type_id = NEW.preferred_table_type_id
  AND is_active = true;

  -- Si no hay mesas configuradas, permitir (gestión manual)
  IF v_total_tables = 0 THEN
    RETURN NEW;
  END IF;

  -- Contar reservas existentes para ESE DÍA (ignorar hora)
  SELECT COUNT(*) INTO v_existing_reservations
  FROM reservations
  WHERE business_id = NEW.business_id
  AND preferred_table_type_id = NEW.preferred_table_type_id
  AND reservation_date = NEW.reservation_date
  AND status IN ('pending', 'confirmed')
  AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Validar disponibilidad
  IF v_existing_reservations >= v_total_tables THEN
    RAISE EXCEPTION 'No hay mesas disponibles para este día. Ya hay % reserva(s) y solo hay % mesa(s) de este tipo.',
      v_existing_reservations, v_total_tables;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asegurarse de que el trigger esté creado
DROP TRIGGER IF EXISTS check_reservation_availability ON reservations;
CREATE TRIGGER check_reservation_availability
  BEFORE INSERT OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION validate_reservation_availability();

-- 3. Actualizar función get_available_tables_by_type
-- Valida solo por día, ignora duración
CREATE OR REPLACE FUNCTION get_available_tables_by_type(
  p_business_id UUID,
  p_table_type_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration_minutes INTEGER DEFAULT 120  -- Se ignora pero se mantiene por compatibilidad
)
RETURNS TABLE(
  table_id UUID,
  table_number TEXT,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as table_id,
    t.table_number,
    NOT EXISTS (
      SELECT 1 FROM reservations r
      WHERE r.business_id = p_business_id
      AND r.assigned_table_id = t.id
      AND r.reservation_date = p_date
      AND r.status IN ('pending', 'confirmed')
    ) as is_available
  FROM tables t
  WHERE t.business_id = p_business_id
  AND t.table_type_id = p_table_type_id
  AND t.is_active = true
  ORDER BY t.table_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- 1. Ejecutar este script completo en Supabase SQL Editor
-- 2. Verificar que no haya errores
-- 3. Probar creando una reserva y verificando la validación
-- =====================================================
