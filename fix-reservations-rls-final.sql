-- ========================================
-- TuMesaHoy - Políticas RLS para Reservations
-- ========================================
-- Este script configura las políticas de seguridad correctas
-- para la tabla reservations siguiendo el patrón del proyecto
--
-- INSTRUCCIONES:
-- 1. Ve a Supabase Dashboard > SQL Editor
-- 2. Crea una nueva query
-- 3. Pega TODO este contenido
-- 4. Ejecuta el script (RUN)
-- ========================================

-- ========================================
-- PASO 1: Eliminar TODAS las políticas existentes
-- ========================================
DROP POLICY IF EXISTS "allow_all_operations" ON public.reservations;
DROP POLICY IF EXISTS "allow_public_insert" ON public.reservations;
DROP POLICY IF EXISTS "public_can_insert_reservations" ON public.reservations;
DROP POLICY IF EXISTS "anon_can_insert" ON public.reservations;
DROP POLICY IF EXISTS "public_insert_reservations" ON public.reservations;
DROP POLICY IF EXISTS "allow_owners_select" ON public.reservations;
DROP POLICY IF EXISTS "allow_owners_update" ON public.reservations;
DROP POLICY IF EXISTS "allow_owners_delete" ON public.reservations;
DROP POLICY IF EXISTS "owners_can_view_reservations" ON public.reservations;
DROP POLICY IF EXISTS "owners_can_update_reservations" ON public.reservations;
DROP POLICY IF EXISTS "owners_can_delete_reservations" ON public.reservations;
DROP POLICY IF EXISTS "public_can_create_reservations" ON public.reservations;
DROP POLICY IF EXISTS "Cualquiera puede crear reservas en negocios activos" ON public.reservations;
DROP POLICY IF EXISTS "Dueños pueden ver reservas de sus negocios" ON public.reservations;
DROP POLICY IF EXISTS "Dueños pueden actualizar reservas" ON public.reservations;

-- ========================================
-- PASO 2: Crear políticas siguiendo el patrón del proyecto
-- ========================================

-- ----------------------------------------
-- INSERT: Cualquiera puede crear reservas en negocios activos
-- ----------------------------------------
-- Permite que usuarios anónimos (sin login) y autenticados
-- creen reservas SOLO en negocios que estén:
-- 1. Activos (is_active = true)
-- 2. Aceptando reservas (is_accepting_reservations = true)
CREATE POLICY "Cualquiera puede crear reservas en negocios activos"
  ON public.reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND is_active = true
      AND is_accepting_reservations = true
    )
  );

-- ----------------------------------------
-- SELECT: Los dueños pueden ver reservas de sus negocios
-- ----------------------------------------
-- Solo los usuarios autenticados que sean dueños del negocio
-- pueden ver las reservas de ese negocio
CREATE POLICY "Dueños pueden ver reservas de sus negocios"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- UPDATE: Los dueños pueden actualizar reservas de sus negocios
-- ----------------------------------------
-- Solo los dueños pueden actualizar (cambiar estado, asignar mesa, etc.)
-- las reservas de sus negocios
CREATE POLICY "Dueños pueden actualizar reservas"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = reservations.business_id
      AND user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- DELETE: Los dueños pueden eliminar reservas de sus negocios
-- ----------------------------------------
-- Solo los dueños pueden eliminar reservas de sus negocios
CREATE POLICY "Dueños pueden eliminar reservas"
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
-- PASO 3: Verificación
-- ========================================
-- Verificar que las políticas se crearon correctamente
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
WHERE tablename = 'reservations'
ORDER BY cmd, policyname;

-- ========================================
-- PASO 4: Verificar que RLS está habilitado
-- ========================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'reservations';

-- ========================================
-- RESUMEN DE SEGURIDAD
-- ========================================
-- ✅ INSERT: Usuarios anónimos y autenticados pueden crear reservas
--           SOLO en negocios activos que acepten reservas
--
-- ✅ SELECT: SOLO los dueños autenticados pueden ver reservas de sus negocios
--           (privacidad total - nadie puede espiar reservas ajenas)
--
-- ✅ UPDATE: SOLO los dueños autenticados pueden modificar reservas de sus negocios
--           (cambiar estado, asignar mesa, etc.)
--
-- ✅ DELETE: SOLO los dueños autenticados pueden eliminar reservas de sus negocios
--
-- 🔒 PRIVACIDAD: Los clientes NO pueden ver sus propias reservas después de crearlas
--                (esto es intencional - las reservas son privadas del negocio)
--                Si querés que los clientes puedan ver sus reservas, agregá
--                customer_user_id a la tabla y creá una política adicional
-- ========================================
-- FIN DEL SCRIPT
-- ========================================
