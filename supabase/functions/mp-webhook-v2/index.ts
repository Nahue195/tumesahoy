// Webhook actualizado para manejar SUSCRIPCIONES AUTOMÁTICAS de Mercado Pago
// Maneja: payment, subscription_preapproval, subscription_authorized_payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validar firma del webhook
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')
    const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET')

    const bodyText = await req.text()
    let notification

    try {
      notification = JSON.parse(bodyText)
    } catch (e) {
      throw new Error('Body del webhook inválido')
    }

    // Validar firma — OBLIGATORIO
    if (!MP_WEBHOOK_SECRET) {
      console.error('❌ MP_WEBHOOK_SECRET no configurado')
      return new Response(JSON.stringify({ error: 'Configuración del servidor incompleta' }), {
        headers: corsHeaders,
        status: 500,
      })
    }

    if (!xSignature || !xRequestId) {
      console.error('❌ Headers de firma ausentes')
      return new Response(JSON.stringify({ error: 'Webhook no autorizado' }), {
        headers: corsHeaders,
        status: 401,
      })
    }

    const signatureParts = xSignature.split(',')
    let ts = ''
    let hash = ''

    for (const part of signatureParts) {
      const [key, value] = part.split('=')
      if (key === 'ts') ts = value
      if (key === 'v1') hash = value
    }

    if (!ts || !hash) {
      return new Response(JSON.stringify({ error: 'Formato de firma inválido' }), {
        headers: corsHeaders,
        status: 401,
      })
    }

    const dataId = notification.data?.id || notification.id
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

    const encoder = new TextEncoder()
    const sigKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(MP_WEBHOOK_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', sigKey, encoder.encode(manifest))
    const hashArray = Array.from(new Uint8Array(signature))
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (calculatedHash !== hash) {
      console.error('❌ Firma del webhook no coincide')
      return new Response(JSON.stringify({ error: 'Firma inválida' }), {
        headers: corsHeaders,
        status: 401,
      })
    }

    console.log('✅ Firma del webhook validada')

    // Cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) {
      throw new Error('Configuración del servidor incompleta')
    }

    console.log('📩 Webhook recibido - Tipo:', notification.type, 'ID:', notification.data?.id || notification.id)

    // Guardar webhook en log
    await supabase.from('webhook_logs').insert({
      webhook_type: 'mercadopago',
      event_type: notification.type,
      resource_id: notification.data?.id || notification.id,
      payload: notification,
      status: 'received'
    })

    // CASO 1: EVENTO DE PAGO (pago único o primer pago de suscripción)
    if (notification.type === 'payment') {
      const paymentId = notification.data?.id || notification.id
      if (!paymentId) throw new Error('Payment ID no encontrado')

      console.log(`🔍 Consultando pago: ${paymentId}`)

      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!paymentResponse.ok) {
        throw new Error('Error consultando pago desde MP')
      }

      const payment = await paymentResponse.json()
      console.log('💰 Pago:', payment.id, 'Status:', payment.status, 'Amount:', payment.transaction_amount)

      const businessId = payment.external_reference || payment.metadata?.business_id
      if (!businessId) throw new Error('Business ID no encontrado')

      // Guardar o actualizar pago en la tabla payments
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('mercadopago_payment_id', paymentId.toString())
        .single()

      if (existingPayment) {
        await supabase
          .from('payments')
          .update({
            status: payment.status,
            payment_method: payment.payment_method_id,
            payment_type: payment.payment_type_id,
            payer_email: payment.payer?.email,
            payer_name: payment.payer?.first_name ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim() : null,
            metadata: payment,
            updated_at: new Date().toISOString()
          })
          .eq('mercadopago_payment_id', paymentId.toString())
      } else {
        await supabase
          .from('payments')
          .insert({
            business_id: businessId,
            mercadopago_payment_id: paymentId.toString(),
            mercadopago_subscription_id: payment.metadata?.subscription_id || null,
            amount: payment.transaction_amount,
            currency: payment.currency_id || 'ARS',
            status: payment.status,
            payment_method: payment.payment_method_id,
            payment_type: payment.payment_type_id,
            description: payment.description,
            payer_email: payment.payer?.email,
            payer_name: payment.payer?.first_name ? `${payment.payer.first_name} ${payment.payer.last_name || ''}`.trim() : null,
            metadata: payment
          })
      }

      // Si el pago fue aprobado, llamar a la función de Supabase
      if (payment.status === 'approved') {
        console.log(`✅ Pago aprobado - Procesando...`)

        const { error: processError } = await supabase.rpc('process_payment_success', {
          p_business_id: businessId,
          p_payment_id: paymentId.toString(),
          p_subscription_id: payment.metadata?.subscription_id || null
        })

        if (processError) {
          console.error('❌ Error procesando pago:', processError)
          throw processError
        }

        console.log(`🎉 Negocio activado exitosamente`)

        // Actualizar log de webhook
        await supabase
          .from('webhook_logs')
          .update({ status: 'processed', processed_at: new Date().toISOString() })
          .eq('resource_id', paymentId.toString())
      } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
        console.log(`❌ Pago ${payment.status}`)

        await supabase
          .from('businesses')
          .update({
            subscription_status: 'inactive',
            is_active: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', businessId)
      }
    }

    // CASO 2: EVENTO DE SUSCRIPCIÓN (subscription_preapproval)
    else if (notification.type === 'subscription_preapproval' || notification.type === 'subscription_authorized_payment') {
      const subscriptionId = notification.data?.id
      if (!subscriptionId) throw new Error('Subscription ID no encontrado')

      console.log(`🔍 Consultando suscripción: ${subscriptionId}`)

      const subResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${subscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!subResponse.ok) {
        throw new Error('Error consultando suscripción desde MP')
      }

      const subscription = await subResponse.json()
      console.log('📋 Suscripción:', subscription.id, 'Status:', subscription.status)

      const businessId = subscription.external_reference || subscription.metadata?.business_id
      if (!businessId) throw new Error('Business ID no encontrado en suscripción')

      // Actualizar el negocio con el subscription_id
      await supabase
        .from('businesses')
        .update({
          mercadopago_subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      // Si la suscripción fue autorizada/aprobada
      if (subscription.status === 'authorized' || subscription.status === 'approved') {
        console.log(`✅ Suscripción ${subscription.status}`)

        // Si hay un último pago asociado, procesarlo
        if (subscription.last_modified_date || subscription.date_created) {
          // La suscripción está activa, el negocio debería estar activo
          await supabase
            .from('businesses')
            .update({
              subscription_status: 'active',
              is_active: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', businessId)
        }
      } else if (subscription.status === 'cancelled' || subscription.status === 'paused') {
        console.log(`❌ Suscripción ${subscription.status}`)

        // IMPORTANTE: NO desactivar inmediatamente, solo actualizar el status
        // El negocio sigue activo hasta que expire el período de gracia
        // (cancelled_at y subscription_expires_at ya fueron configurados por cancel-subscription)
        await supabase
          .from('businesses')
          .update({
            subscription_status: 'cancelled',
            // NO cambiar is_active aquí, respeta el período de gracia
            updated_at: new Date().toISOString()
          })
          .eq('id', businessId)
      }

      // Actualizar log de webhook
      await supabase
        .from('webhook_logs')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('resource_id', subscriptionId)
    }

    // CASO 3: Otros tipos de notificación
    else {
      console.log(`ℹ️ Tipo de notificación ignorado: ${notification.type}`)

      await supabase
        .from('webhook_logs')
        .update({ status: 'ignored' })
        .eq('resource_id', notification.data?.id || notification.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook procesado exitosamente',
        type: notification.type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error procesando webhook:', error)

    return new Response(
      JSON.stringify({
        error: error.message,
        note: 'Error logged but returning 200 to avoid retries'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
