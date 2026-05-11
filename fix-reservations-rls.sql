-- ========================================
-- Fix: Políticas RLS para Reservations
-- ========================================
-- Este script arregla las políticas de seguridad para permitir
-- que usuarios NO autenticados puedan crear reservas
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- Eliminar políticas antiguas que puedan estar causando conflictos
DROP POLICY IF EXISTS "Cualquiera puede crear reservas en negocios activos" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reservations;

-- Crear política que permite a CUALQUIERA (incluso no autenticados) crear reservas
-- siempre que el negocio esté activo y aceptando reservas
CREATE POLICY "public_can_create_reservations"
  ON public.reservations FOR INSERT
  TO public, anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND is_active = true
      AND is_accepting_reservations = true
    )
  );

-- Los dueños pueden ver reservas de sus negocios (mantener esta política)
DROP POLICY IF EXISTS "Dueños pueden ver reservas de sus negocios" ON public.reservations;
CREATE POLICY "owners_can_view_reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden actualizar reservas de sus negocios
DROP POLICY IF EXISTS "Dueños pueden actualizar reservas" ON public.reservations;
CREATE POLICY "owners_can_update_reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- Los dueños pueden eliminar reservas de sus negocios
DROP POLICY IF EXISTS "owners_can_delete_reservations" ON public.reservations;
CREATE POLICY "owners_can_delete_reservations"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Ejecuta esto para ver todas las políticas de la tabla reservations
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reservations';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
-- ✅ Ahora cualquier persona (incluso sin login) puede crear reservas
--    en negocios que estén activos y aceptando reservas.
-- ========================================
