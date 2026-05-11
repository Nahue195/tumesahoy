// Supabase Edge Function para crear preferencia de pago en Mercado Pago

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SECURITY: Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
  'https://tumesahoy.com',
  'https://www.tumesahoy.com',
  Deno.env.get('FRONTEND_URL') // Permitir configurar URL desde env
].filter(Boolean)

function getCorsHeaders(origin: string | null): Record<string, string> {
  // SECURITY: En desarrollo, permitir cualquier localhost
  // En producción, solo dominios específicos
  const isLocalhost = origin?.startsWith('http://localhost:') || origin?.startsWith('http://127.0.0.1:')
  const isAllowedProduction = origin && ALLOWED_ORIGINS.includes(origin)

  const allowedOrigin = isLocalhost || isAllowedProduction
    ? origin
    : 'http://localhost:5173' // Fallback en dev

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessId, businessName, businessSlug } = await req.json()

    // SECURITY: Crear cliente de Supabase para validar autenticación
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      throw new Error('No autorizado - falta token de autenticación')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // SECURITY: Verificar que el usuario autenticado es el dueño del negocio
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error('No autorizado - token inválido')
    }

    // SECURITY: Verificar propiedad del negocio antes de crear pago
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .single()

    if (businessError || !businessData) {
      throw new Error('No autorizado - negocio no encontrado o no pertenece al usuario')
    }

    // Access Token de Mercado Pago (desde variables de entorno)
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

    if (!MP_ACCESS_TOKEN) {
      throw new Error('Configuración del servidor incompleta')
    }

    // Crear preferencia de pago
    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'http://localhost:5173'

    const preferenceData = {
      items: [
        {
          title: 'Suscripción TuMesaHoy - Plan Mensual',
          description: `Suscripción para ${businessName}`,
          quantity: 1,
          unit_price: 120000,
          currency_id: 'ARS'
        }
      ],
      back_urls: {
        success: `${origin}/admin/${businessSlug}`,
        failure: `${origin}/payment/failure?business_id=${businessId}`,
        pending: `${origin}/payment/pending?business_id=${businessId}`
      },
      external_reference: businessId,
      statement_descriptor: 'TUMESAHOY',
      metadata: {
        business_id: businessId,
        business_slug: businessSlug,
        subscription_type: 'monthly'
      },
      notification_url: `${supabaseUrl}/functions/v1/mp-webhook`
    }

    // SECURITY: No loguear datos sensibles de pago en producción
    console.log('Creando preferencia de pago para business:', businessId)

    // Llamar a la API de Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preferenceData)
    })

    const preference = await response.json()

    if (!response.ok) {
      // SECURITY: No exponer detalles completos del error de MP
      console.error('Error creando preferencia de pago - Status:', response.status)
      throw new Error('Error al crear preferencia de pago')
    }

    console.log('Preferencia de pago creada exitosamente - ID:', preference.id)

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point, // URL para redirigir al checkout
        sandbox_init_point: preference.sandbox_init_point
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
