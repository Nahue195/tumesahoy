// Edge Function: Confirmar pago de seña
// Se llama desde la página de éxito para verificar el pago con MP y activar la reserva

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reservationId, paymentId } = await req.json()

    if (!reservationId || !paymentId) {
      throw new Error('Faltan parámetros requeridos')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener la reserva y el access token del restaurante
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select(`
        id, deposit_status, business_id,
        businesses!inner(mp_seller_access_token)
      `)
      .eq('id', reservationId)
      .single()

    if (resError || !reservation) {
      throw new Error('Reserva no encontrada')
    }

    if (reservation.deposit_status === 'paid') {
      return new Response(
        JSON.stringify({ success: true, message: 'Seña ya confirmada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const sellerToken = reservation.businesses?.mp_seller_access_token
    if (!sellerToken) {
      throw new Error('Token del restaurante no encontrado')
    }

    // Verificar el pago directamente con la API de MP usando el token del restaurante
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${sellerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const payment = await paymentResponse.json()

    if (!paymentResponse.ok) {
      throw new Error('Error verificando pago con MercadoPago')
    }

    console.log(`💰 Pago ${paymentId} - Status: ${payment.status}`)

    if (payment.status === 'approved') {
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          deposit_status: 'paid',
          deposit_payment_id: paymentId.toString(),
          deposit_amount: payment.transaction_amount,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)

      if (updateError) {
        throw new Error('Error actualizando reserva en la base de datos')
      }

      console.log(`✅ Seña confirmada para reserva ${reservationId}`)

      // Enviar email de confirmación (no bloqueante)
      const supabaseFunctionsUrl = Deno.env.get('SUPABASE_FUNCTIONS_URL') ||
        `${Deno.env.get('SUPABASE_URL')}/functions/v1`
      fetch(`${supabaseFunctionsUrl}/notify-reservation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({ event: 'deposit_confirmed', reservationId }),
      }).catch((e) => console.warn('⚠️ Error enviando notificación de seña:', e))

      return new Response(
        JSON.stringify({ success: true, status: 'approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (payment.status === 'pending' || payment.status === 'in_process') {
      await supabase
        .from('reservations')
        .update({ deposit_status: 'pending', deposit_payment_id: paymentId.toString() })
        .eq('id', reservationId)

      return new Response(
        JSON.stringify({ success: true, status: 'pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Pago rechazado o fallido
    await supabase
      .from('reservations')
      .update({ deposit_status: 'failed' })
      .eq('id', reservationId)

    return new Response(
      JSON.stringify({ success: false, status: payment.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('❌ Error en confirm-deposit:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
