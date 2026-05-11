// Edge Function: Crear preferencia de pago de seña
// Usa el access token del restaurante para que el dinero vaya a su cuenta MP

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://tumesahoy.com',
  'https://www.tumesahoy.com',
  'https://tumesahoy.vercel.app',
  Deno.env.get('FRONTEND_URL'),
].filter(Boolean)

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isLocalhost = origin?.startsWith('http://localhost:') || origin?.startsWith('http://127.0.0.1:')
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin)
  const allowedOrigin = isLocalhost || isAllowed ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

async function refreshMpToken(supabase: any, refreshToken: string, businessId: string): Promise<string> {
  const MP_APP_ID = Deno.env.get('MP_APP_ID')
  const MP_APP_SECRET = Deno.env.get('MP_APP_SECRET')

  if (!MP_APP_ID || !MP_APP_SECRET) {
    throw new Error('Faltan credenciales MP_APP_ID/MP_APP_SECRET para refrescar el token')
  }

  const response = await fetch('https://api.mercadopago.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: MP_APP_ID,
      client_secret: MP_APP_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Error refrescando token MP: ${err.message || response.status}`)
  }

  const { access_token, refresh_token, expires_in } = await response.json()
  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

  await supabase
    .from('businesses')
    .update({
      mp_seller_access_token: access_token,
      mp_seller_refresh_token: refresh_token,
      mp_seller_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', businessId)

  console.log('🔄 Token MP refrescado para negocio:', businessId)
  return access_token
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessId, reservationId, customerEmail, customerName, depositAmount, businessSlug } = await req.json()

    if (!businessId || !reservationId || !depositAmount) {
      throw new Error('Faltan parámetros requeridos')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener el access token del restaurante
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('name, mp_seller_access_token, mp_seller_refresh_token, mp_seller_token_expires_at')
      .eq('id', businessId)
      .single()

    if (businessError || !business) {
      throw new Error('Negocio no encontrado')
    }

    if (!business.mp_seller_access_token) {
      throw new Error('El negocio no tiene MercadoPago conectado')
    }

    // Refrescar token si está vencido o vence en menos de 24hs
    let sellerToken = business.mp_seller_access_token
    if (business.mp_seller_token_expires_at) {
      const expiresAt = new Date(business.mp_seller_token_expires_at)
      const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      if (expiresAt < oneDayFromNow) {
        if (!business.mp_seller_refresh_token) {
          throw new Error('El token de MercadoPago del negocio está vencido. El dueño debe reconectar su cuenta.')
        }
        sellerToken = await refreshMpToken(supabase, business.mp_seller_refresh_token, businessId)
      }
    }

    // Leer % de comisión desde la tabla platform_settings
    const { data: feeSetting } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'marketplace_fee_percent')
      .single()

    const feePercent = parseFloat(feeSetting?.value || '0')
    const marketplaceFee = feePercent > 0
      ? Math.round(depositAmount * (feePercent / 100) * 100) / 100
      : 0

    console.log(`💰 Comisión TuMesaHoy: ${feePercent}% = $${marketplaceFee} ARS`)

    const frontendUrl = (Deno.env.get('FRONTEND_URL') || 'https://tumesahoy.com').replace(/\/$/, '')

    const preference = {
      items: [
        {
          title: `Seña - Reserva en ${business.name}`,
          description: `Depósito para garantizar tu reserva`,
          quantity: 1,
          unit_price: depositAmount,
          currency_id: 'ARS',
        },
      ],
      payer: {
        name: customerName || '',
        email: customerEmail || 'cliente@tumesahoy.com',
      },
      back_urls: {
        success: `${frontendUrl}/reserva/seña-exitosa?reservation_id=${reservationId}&slug=${businessSlug}`,
        failure: `${frontendUrl}/reserva/seña-fallida?reservation_id=${reservationId}&slug=${businessSlug}`,
        pending: `${frontendUrl}/reserva/seña-pendiente?reservation_id=${reservationId}&slug=${businessSlug}`,
      },
      auto_return: 'approved',
      external_reference: reservationId,
      statement_descriptor: 'TUMESAHOY',
      ...(marketplaceFee > 0 && { marketplace_fee: marketplaceFee }),
      metadata: {
        type: 'deposit',
        reservation_id: reservationId,
        business_id: businessId,
        commission_amount: marketplaceFee,
        fee_percent: feePercent,
      },
    }

    console.log(`💳 Creando preferencia de seña para reserva ${reservationId} - $${depositAmount} ARS`)

    // Guardar la comisión esperada en la reserva
    await supabase
      .from('reservations')
      .update({ commission_amount: marketplaceFee })
      .eq('id', reservationId)

    // Crear preferencia usando el token del RESTAURANTE
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify(preference),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Error creando preferencia en MP:', data)
      throw new Error(data.message || 'Error al crear preferencia de pago en MercadoPago')
    }

    console.log('✅ Preferencia creada:', data.id)

    return new Response(
      JSON.stringify({ init_point: data.init_point, preference_id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('❌ Error en create-deposit:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
