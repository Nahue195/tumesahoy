// Supabase Edge Function - Cancelar Suscripción de Mercado Pago
// Cancela la suscripción automática y actualiza el negocio

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://tumesahoy.com',
  'https://www.tumesahoy.com',
  'https://tumesahoy.vercel.app',
  Deno.env.get('FRONTEND_URL')
].filter(Boolean)

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isLocalhost = origin?.startsWith('http://localhost:') || origin?.startsWith('http://127.0.0.1:')
  const isAllowedProduction = origin && ALLOWED_ORIGINS.includes(origin)
  const allowedOrigin = isLocalhost || isAllowedProduction ? origin : 'http://localhost:5173'

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessId, userToken } = await req.json()

    // SECURITY: Validar credenciales
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    if (!userToken) {
      throw new Error('No autorizado - falta token de usuario')
    }

    // Crear cliente con Service Role para consultar sin RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Validar el JWT del usuario
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${userToken}` } }
    })

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      console.error('Error validando usuario:', userError)
      throw new Error('No autorizado - token de usuario inválido')
    }

    console.log('✅ Usuario validado:', user.email)

    // Verificar que el negocio existe y pertenece al usuario
    const { data: businessData, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, slug, mercadopago_subscription_id, subscription_status, user_id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (businessError || !businessData) {
      console.error('Error buscando negocio:', businessError)
      throw new Error('No autorizado - negocio no encontrado o no pertenece al usuario')
    }

    console.log('✅ Negocio validado:', businessData.name)

    // Si tiene suscripción recurrente en MP, cancelarla primero
    if (businessData.mercadopago_subscription_id) {
      const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
      if (!MP_ACCESS_TOKEN) {
        throw new Error('Configuración del servidor incompleta')
      }

      const subscriptionId = businessData.mercadopago_subscription_id
      console.log(`🚫 Cancelando suscripción recurrente en MP: ${subscriptionId}`)

      const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          status: 'cancelled'
        })
      })

      const subscription = await response.json()
      console.log('📨 MP Response status:', response.status)
      console.log('📨 MP Response:', JSON.stringify(subscription, null, 2))

      if (!response.ok) {
        console.error('❌ Error cancelando suscripción en MP - Status:', response.status)
        console.error('Error details:', JSON.stringify(subscription, null, 2))
        throw new Error(subscription.message || subscription.error || 'Error al cancelar suscripción en Mercado Pago')
      }

      console.log('✅ Suscripción cancelada exitosamente en Mercado Pago')
    } else {
      // Negocio activado por pago único (sin suscripción recurrente en MP)
      // Solo se cancela en la base de datos
      console.log('ℹ️ Negocio sin suscripción recurrente - cancelando solo en DB')
    }

    // Calcular fecha de vencimiento (30 días desde hoy)
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 30)

    // Actualizar el negocio en la base de datos
    // IMPORTANTE: El negocio sigue activo hasta la fecha de vencimiento
    const { error: updateError } = await supabaseAdmin
      .from('businesses')
      .update({
        subscription_status: 'cancelled',
        // is_active sigue en true hasta que expire el período pagado
        is_active: true,
        cancelled_at: new Date().toISOString(),
        subscription_expires_at: expirationDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('⚠️ Error actualizando negocio en DB:', updateError)
      throw new Error('Error actualizando el estado del negocio')
    }

    console.log('✅ Negocio actualizado - sigue activo hasta:', expirationDate.toISOString())

    // Responder con éxito
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Suscripción cancelada exitosamente',
        subscription_status: 'cancelled'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error en cancel-subscription:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Revisa los logs de la función para más información'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
