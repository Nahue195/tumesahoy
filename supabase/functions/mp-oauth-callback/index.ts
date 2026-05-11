// Edge Function: OAuth callback de MercadoPago
// MP redirige aquí con ?code=...&state={businessSlug}:{stateId}
// Verifica el state contra la tabla mp_oauth_states (sin JWT en URL)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const mpError = url.searchParams.get('error')

  const frontendUrl = (Deno.env.get('FRONTEND_URL') || 'https://tumesahoy.com').replace(/\/$/, '')

  if (mpError) {
    console.error('Error OAuth de MP:', mpError)
    return Response.redirect(`${frontendUrl}/?mp_error=access_denied`, 302)
  }

  if (!code || !state) {
    return Response.redirect(`${frontendUrl}/?mp_error=missing_params`, 302)
  }

  // state = "businessSlug:stateId"
  const colonIdx = state.indexOf(':')
  if (colonIdx === -1) {
    return Response.redirect(`${frontendUrl}/?mp_error=invalid_state`, 302)
  }

  const businessSlug = state.substring(0, colonIdx)
  const stateId = state.substring(colonIdx + 1)
  const redirectBase = `${frontendUrl}/admin/${businessSlug}`

  if (!businessSlug || !stateId) {
    return Response.redirect(`${frontendUrl}/?mp_error=invalid_state`, 302)
  }

  try {
    const MP_APP_ID = Deno.env.get('MP_APP_ID')
    const MP_APP_SECRET = Deno.env.get('MP_APP_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseFunctionsUrl = Deno.env.get('SUPABASE_FUNCTIONS_URL') ||
      `${supabaseUrl}/functions/v1`

    if (!MP_APP_ID || !MP_APP_SECRET) {
      console.error('Faltan MP_APP_ID o MP_APP_SECRET en secrets')
      return Response.redirect(`${redirectBase}?mp_error=server_config`, 302)
    }

    // Usar service_role para leer y marcar el state (bypasea RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar el state token contra la DB
    const { data: stateRecord, error: stateError } = await supabase
      .from('mp_oauth_states')
      .select('business_id, user_id, expires_at, used')
      .eq('id', stateId)
      .single()

    if (stateError || !stateRecord) {
      console.error('State token no encontrado:', stateId)
      return Response.redirect(`${frontendUrl}/?mp_error=invalid_state`, 302)
    }

    if (stateRecord.used) {
      console.error('State token ya fue utilizado:', stateId)
      return Response.redirect(`${frontendUrl}/?mp_error=state_already_used`, 302)
    }

    if (new Date(stateRecord.expires_at) < new Date()) {
      console.error('State token expirado:', stateId)
      return Response.redirect(`${frontendUrl}/?mp_error=state_expired`, 302)
    }

    // Marcar el state como usado (previene replay attacks)
    await supabase
      .from('mp_oauth_states')
      .update({ used: true })
      .eq('id', stateId)

    const businessId = stateRecord.business_id

    // Verificar que el negocio pertenece al usuario que inició el OAuth
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', stateRecord.user_id)
      .single()

    if (businessError || !business) {
      console.error('El usuario no es dueño del negocio:', businessId)
      return Response.redirect(`${frontendUrl}/?mp_error=forbidden`, 302)
    }

    // Intercambiar el code por el access token del restaurante
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: MP_APP_ID,
        client_secret: MP_APP_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${supabaseFunctionsUrl}/mp-oauth-callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error('Error obteniendo token de MP:', JSON.stringify(tokenData))
      return Response.redirect(`${redirectBase}?mp_error=token_failed`, 302)
    }

    const { access_token, refresh_token, user_id, expires_in } = tokenData
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // Guardar el token en la DB (propiedad verificada arriba via stateRecord.user_id)
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        mp_seller_access_token: access_token,
        mp_seller_refresh_token: refresh_token,
        mp_seller_user_id: user_id?.toString(),
        mp_seller_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .eq('user_id', stateRecord.user_id)

    if (updateError) {
      console.error('Error guardando token en DB:', updateError)
      return Response.redirect(`${redirectBase}?mp_error=db_failed`, 302)
    }

    console.log('Cuenta de MP conectada para negocio:', businessId)
    return Response.redirect(`${redirectBase}?mp_connected=true`, 302)

  } catch (error) {
    console.error('Error inesperado en mp-oauth-callback:', error)
    return Response.redirect(`${redirectBase}?mp_error=unexpected`, 302)
  }
})
