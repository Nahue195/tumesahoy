-- ========================================
-- Validación de Disponibilidad de Mesas
-- ========================================
-- Este script agrega una función de validación que impide
-- crear reservas cuando ya no hay mesas disponibles
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- FUNCIÓN: Validar disponibilidad antes de reserva
-- ========================================
CREATE OR REPLACE FUNCTION validate_reservation_availability()
RETURNS TRIGGER AS $$
DECLARE
  v_total_tables INTEGER;
  v_existing_reservations INTEGER;
  v_available_tables INTEGER;
BEGIN
  -- Contar cuántas mesas hay del tipo seleccionado (o todas si no hay tipo)
  IF NEW.preferred_table_type_id IS NOT NULL THEN
    -- Contar mesas del tipo específico
    SELECT COUNT(*)
    INTO v_total_tables
    FROM public.tables
    WHERE business_id = NEW.business_id
      AND table_type_id = NEW.preferred_table_type_id
      AND is_active = true;
  ELSE
    -- Contar todas las mesas del negocio
    SELECT COUNT(*)
    INTO v_total_tables
    FROM public.tables
    WHERE business_id = NEW.business_id
      AND is_active = true;
  END IF;

  -- Si no hay mesas configuradas, permitir la reserva (gestión manual)
  IF v_total_tables = 0 THEN
    RETURN NEW;
  END IF;

  -- Contar reservas existentes para el mismo día/hora
  IF NEW.preferred_table_type_id IS NOT NULL THEN
    -- Solo contar reservas del mismo tipo de mesa
    SELECT COUNT(*)
    INTO v_existing_reservations
    FROM public.reservations
    WHERE business_id = NEW.business_id
      AND reservation_date = NEW.reservation_date
      AND reservation_time = NEW.reservation_time
      AND preferred_table_type_id = NEW.preferred_table_type_id
      AND status IN ('pending', 'confirmed')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID); -- Excluir la reserva actual si es UPDATE
  ELSE
    -- Contar todas las reservas sin importar tipo
    SELECT COUNT(*)
    INTO v_existing_reservations
    FROM public.reservations
    WHERE business_id = NEW.business_id
      AND reservation_date = NEW.reservation_date
      AND reservation_time = NEW.reservation_time
      AND status IN ('pending', 'confirmed')
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
  END IF;

  -- Calcular mesas disponibles
  v_available_tables := v_total_tables - v_existing_reservations;

  -- Si no hay mesas disponibles, rechazar la reserva
  IF v_available_tables <= 0 THEN
    RAISE EXCEPTION 'No hay mesas disponibles para este horario. Por favor seleccioná otro horario.';
  END IF;

  -- Si hay mesas disponibles, permitir la reserva
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGER: Ejecutar validación antes de INSERT
-- ========================================
DROP TRIGGER IF EXISTS validate_reservation_before_insert ON public.reservations;

CREATE TRIGGER validate_reservation_before_insert
BEFORE INSERT ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION validate_reservation_availability();

-- ========================================
-- COMENTARIOS
-- ========================================
COMMENT ON FUNCTION validate_reservation_availability() IS
'Valida que haya mesas disponibles antes de crear una reserva.
Impide overbooking comparando reservas existentes vs mesas disponibles.';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- ✅ Ahora la base de datos rechazará automáticamente reservas
--    cuando ya no haya mesas disponibles, incluso si dos personas
--    intentan reservar al mismo tiempo (race condition).
--
-- Próximos pasos:
-- 1. Probar crear múltiples reservas para el mismo horario
-- 2. Verificar que se bloquee cuando se alcanza el límite
-- ========================================
