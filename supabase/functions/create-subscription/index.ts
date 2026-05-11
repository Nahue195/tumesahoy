// Supabase Edge Function - Crear Suscripción Automática en Mercado Pago
// Sistema de suscripciones recurrentes con cobro automático mensual

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://tumesahoy.com',
  'https://www.tumesahoy.com',
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
    const { businessId, businessName, businessSlug, payerEmail, userToken } = await req.json()

    // SECURITY: Usar Service Role Key para queries sin RLS
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
      .select('id, name, slug, email, user_id')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (businessError || !businessData) {
      console.error('Error buscando negocio:', businessError)
      throw new Error('No autorizado - negocio no encontrado o no pertenece al usuario')
    }

    console.log('✅ Negocio validado:', businessData.name)

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) {
      throw new Error('Configuración del servidor incompleta')
    }

    // Leer precio mensual desde platform_settings
    const { data: priceSetting } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'subscription_monthly_price')
      .single()

    const monthlyAmount = parseFloat(priceSetting?.value || '100')

    console.log(`💳 Creando suscripción para ${businessName} - Monto: $${monthlyAmount} ARS`)
    console.log('🔗 Origin:', origin)
    console.log('🔗 Back URL:', origin ? `${origin}/admin/${businessSlug}` : `http://localhost:5173/admin/${businessSlug}`)

    // Crear suscripción automática (Preapproval)
    const subscriptionData = {
      // Información básica
      reason: `Suscripción TuMesaHoy - ${businessName}`,
      payer_email: payerEmail, // Email de la cuenta de Mercado Pago del usuario

      // Configuración de recurrencia automática
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: monthlyAmount,
        currency_id: 'ARS',
        // Cobro inmediato al suscribirse (sin período de prueba adicional)
        free_trial: null
      },

      // URLs de retorno - usar dominio de producción (localhost no es válido en MP)
      back_url: `https://www.tumesahoy.com/admin/${businessSlug}`,

      // Metadata para identificar el negocio
      external_reference: businessId,
      metadata: {
        business_id: businessId,
        business_slug: businessSlug,
        business_name: businessName
      },

      // Estado inicial
      status: 'pending' // El usuario debe autorizar la suscripción
    }

    console.log('📤 Enviando request a Mercado Pago...')
    console.log('📦 Subscription data:', JSON.stringify(subscriptionData, null, 2))

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(subscriptionData)
    })

    const subscription = await response.json()
    console.log('📨 MP Response status:', response.status)
    console.log('📨 MP Response:', JSON.stringify(subscription, null, 2))

    if (!response.ok) {
      console.error('❌ Error creando suscripción - Status:', response.status)
      console.error('Error details:', JSON.stringify(subscription, null, 2))
      throw new Error(subscription.message || subscription.error || 'Error al crear suscripción en Mercado Pago')
    }

    console.log('✅ Suscripción creada exitosamente:', subscription.id)

    // Guardar el subscription_id en la base de datos
    const { error: updateError } = await supabaseAdmin
      .from('businesses')
      .update({
        mercadopago_subscription_id: subscription.id,
        subscription_status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)

    if (updateError) {
      console.error('⚠️ Error guardando subscription_id en DB:', updateError)
      // No fallar la request, ya que la suscripción se creó exitosamente en MP
    }

    // Responder con los datos necesarios para redirigir al usuario
    return new Response(
      JSON.stringify({
        subscription_id: subscription.id,
        init_point: subscription.init_point, // URL checkout de Mercado Pago
        status: subscription.status,
        amount: monthlyAmount,
        frequency: 'monthly'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error en create-subscription:', error)
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
