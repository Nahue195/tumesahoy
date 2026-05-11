// Supabase Edge Function para recibir notificaciones de Mercado Pago (IPN/Webhooks)
// Este endpoint procesa las notificaciones automáticas de cambios en el estado de los pagos

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// NOTA: El webhook viene de Mercado Pago, no del navegador
// No necesita CORS estricto, pero lo mantenemos para evitar errores
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // OK para webhooks server-to-server
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature, x-request-id',
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // SECURITY: Validar firma del webhook de Mercado Pago
    const xSignature = req.headers.get('x-signature')
    const xRequestId = req.headers.get('x-request-id')

    // Mercado Pago envía el webhook secret para validación
    const MP_WEBHOOK_SECRET = Deno.env.get('MP_WEBHOOK_SECRET')

    if (!MP_WEBHOOK_SECRET) {
      console.error('⚠️ MP_WEBHOOK_SECRET no configurado - webhooks sin validación de firma')
    }

    // Leer el body como texto para validar firma
    const bodyText = await req.text()
    let notification

    try {
      notification = JSON.parse(bodyText)
    } catch (e) {
      throw new Error('Body del webhook inválido')
    }

    // SECURITY: Validar firma si está configurado el secret
    if (MP_WEBHOOK_SECRET && xSignature && xRequestId) {
      // Extraer ts y hash de x-signature (formato: "ts=123456,v1=hash")
      const signatureParts = xSignature.split(',')
      let ts = ''
      let hash = ''

      for (const part of signatureParts) {
        const [key, value] = part.split('=')
        if (key === 'ts') ts = value
        if (key === 'v1') hash = value
      }

      if (!ts || !hash) {
        throw new Error('Firma del webhook inválida - formato incorrecto')
      }

      // Construir el string para validar: id + request-id + ts
      const dataId = notification.data?.id || notification.id
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

      // Calcular HMAC-SHA256
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(MP_WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )

      const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(manifest)
      )

      // Convertir a hex
      const hashArray = Array.from(new Uint8Array(signature))
      const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Comparar firmas
      if (calculatedHash !== hash) {
        console.error('❌ Firma del webhook inválida - posible ataque')
        throw new Error('Firma del webhook no coincide')
      }

      console.log('✅ Firma del webhook validada correctamente')
    } else if (!MP_WEBHOOK_SECRET) {
      console.warn('⚠️ Webhook recibido SIN validación de firma - configurar MP_WEBHOOK_SECRET')
    }

    // Crear cliente de Supabase con service role key (tiene permisos completos)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Access Token de Mercado Pago
    const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

    if (!MP_ACCESS_TOKEN) {
      throw new Error('Configuración del servidor incompleta')
    }

    // SECURITY: No loguear datos sensibles completos del webhook
    console.log('📩 Webhook recibido - Tipo:', notification.type, 'ID:', notification.data?.id || notification.id)

    // Mercado Pago envía diferentes tipos de notificaciones
    // Nos interesan las de tipo "payment"
    if (notification.type !== 'payment') {
      console.log(`ℹ️ Tipo de notificación ignorado: ${notification.type}`)
      return new Response(
        JSON.stringify({ message: 'Notification type ignored' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Extraer el ID del pago
    const paymentId = notification.data?.id || notification.id

    if (!paymentId) {
      throw new Error('Payment ID no encontrado en la notificación')
    }

    console.log(`🔍 Consultando información del pago: ${paymentId}`)

    // Consultar la información completa del pago desde la API de Mercado Pago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!paymentResponse.ok) {
      const error = await paymentResponse.json()
      throw new Error(`Error consultando pago: ${JSON.stringify(error)}`)
    }

    const payment = await paymentResponse.json()

    // SECURITY: No loguear información completa del pago
    console.log('💰 Pago consultado - ID:', payment.id, 'Status:', payment.status)

    // Extraer información relevante
    const businessId = payment.external_reference || payment.metadata?.business_id
    const status = payment.status // approved, pending, rejected, cancelled, refunded, etc.
    const statusDetail = payment.status_detail

    if (!businessId) {
      throw new Error('Business ID no encontrado en el pago')
    }

    console.log(`🏪 Business ID: ${businessId}, Status: ${status}`)

    // Registrar o actualizar el pago en la base de datos
    const { data: existingPayment, error: checkError } = await supabase
      .from('payments')
      .select('id')
      .eq('mp_payment_id', paymentId.toString())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error verificando pago existente:', checkError)
    }

    if (existingPayment) {
      // Actualizar pago existente
      console.log(`📝 Actualizando pago existente: ${existingPayment.id}`)
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: status,
          status_detail: statusDetail,
          paid_at: payment.date_approved || null,
          payment_type: payment.payment_type_id,
          payment_method: payment.payment_method_id,
          updated_at: new Date().toISOString()
        })
        .eq('mp_payment_id', paymentId.toString())

      if (updateError) {
        console.error('❌ Error actualizando pago:', updateError)
      }
    } else {
      // Crear nuevo registro de pago
      console.log(`➕ Creando nuevo registro de pago`)
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          business_id: businessId,
          mp_payment_id: paymentId.toString(),
          mp_preference_id: payment.preference_id,
          status: status,
          status_detail: statusDetail,
          amount: payment.transaction_amount,
          currency: payment.currency_id,
          payment_type: payment.payment_type_id,
          payment_method: payment.payment_method_id,
          description: payment.description,
          paid_at: payment.date_approved || null
        })

      if (insertError) {
        console.error('❌ Error insertando pago:', insertError)
      }
    }

    // Si el pago fue aprobado, activar el negocio
    if (status === 'approved') {
      console.log(`✅ Pago aprobado - Activando negocio ${businessId}`)

      const { error: businessError } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'active',
          is_active: true,
          is_accepting_reservations: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)

      if (businessError) {
        console.error('❌ Error activando negocio:', businessError)
        throw businessError
      }

      // Crear o actualizar registro de suscripción
      const { data: existingSubscription, error: subCheckError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('business_id', businessId)
        .single()

      if (subCheckError && subCheckError.code !== 'PGRST116') {
        console.error('Error verificando suscripción:', subCheckError)
      }

      const now = new Date()
      const nextBilling = new Date(now)
      nextBilling.setMonth(nextBilling.getMonth() + 1) // Próximo mes

      if (existingSubscription) {
        // Actualizar suscripción existente
        console.log(`📝 Actualizando suscripción existente`)
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            last_payment_date: payment.date_approved,
            next_billing_date: nextBilling.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('business_id', businessId)
      } else {
        // Crear nueva suscripción
        console.log(`➕ Creando nueva suscripción`)
        await supabase
          .from('subscriptions')
          .insert({
            business_id: businessId,
            mp_subscription_id: payment.id.toString(),
            mp_payer_id: payment.payer?.id?.toString(),
            status: 'active',
            start_date: now.toISOString(),
            next_billing_date: nextBilling.toISOString(),
            last_payment_date: payment.date_approved,
            amount: payment.transaction_amount,
            currency: payment.currency_id,
            payment_method: payment.payment_method_id
          })
      }

      console.log(`🎉 Negocio activado exitosamente`)
    }
    // Si el pago fue rechazado o cancelado
    else if (status === 'rejected' || status === 'cancelled') {
      console.log(`❌ Pago ${status} - Manteniendo negocio inactivo`)

      // Opcional: actualizar estado del negocio a inactivo si estaba activo
      await supabase
        .from('businesses')
        .update({
          subscription_status: 'inactive',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', businessId)
    }

    // Responder a Mercado Pago con 200 OK
    // Es importante responder rápido para que MP no reintente el webhook
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook procesado exitosamente',
        payment_id: paymentId,
        status: status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error procesando webhook:', error)

    // Aún en caso de error, respondemos 200 a MP para evitar reintentos infinitos
    // Pero loggeamos el error para investigación
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
