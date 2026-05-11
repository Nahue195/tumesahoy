// OAuth callback de MercadoPago para conectar la cuenta del restaurante
// MP redirige aquí con ?code=...&state={businessSlug}:{stateId}
// Verifica el state contra la tabla mp_oauth_states (sin JWT en URL)

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    console.error('Error en OAuth de MP:', error);
    return res.redirect('/?mp_error=access_denied');
  }

  if (!code || !state) {
    return res.redirect('/?mp_error=missing_params');
  }

  // state = "businessSlug:stateId"
  const colonIdx = state.indexOf(':');
  if (colonIdx === -1) {
    return res.redirect('/?mp_error=invalid_state');
  }

  const businessSlug = state.substring(0, colonIdx);
  const stateId = state.substring(colonIdx + 1);
  const redirectBase = `/admin/${businessSlug}`;

  if (!businessSlug || !stateId) {
    return res.redirect('/?mp_error=invalid_state');
  }

  try {
    const MP_APP_ID = process.env.MP_APP_ID;
    const MP_APP_SECRET = process.env.MP_APP_SECRET;
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!MP_APP_ID || !MP_APP_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Configuración incompleta del servidor');
    }

    // Usar service_role para leer y marcar el state (bypasea RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Verificar el state token contra la DB
    const { data: stateRecord, error: stateError } = await supabase
      .from('mp_oauth_states')
      .select('business_id, user_id, expires_at, used')
      .eq('id', stateId)
      .single();

    if (stateError || !stateRecord) {
      console.error('State token no encontrado:', stateId);
      return res.redirect('/?mp_error=invalid_state');
    }

    if (stateRecord.used) {
      console.error('State token ya fue utilizado:', stateId);
      return res.redirect('/?mp_error=state_already_used');
    }

    if (new Date(stateRecord.expires_at) < new Date()) {
      console.error('State token expirado:', stateId);
      return res.redirect('/?mp_error=state_expired');
    }

    // Marcar el state como usado (previene replay attacks)
    await supabase
      .from('mp_oauth_states')
      .update({ used: true })
      .eq('id', stateId);

    const businessId = stateRecord.business_id;

    // Verificar que el negocio pertenece al usuario que inició el OAuth
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', stateRecord.user_id)
      .single();

    if (businessError || !business) {
      console.error('El usuario no es dueño del negocio:', businessId);
      return res.redirect('/?mp_error=forbidden');
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
        redirect_uri: `${process.env.FRONTEND_URL || 'https://tumesahoy.vercel.app'}/api/mp-oauth-callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Error obteniendo token de MP:', tokenData);
      return res.redirect(`${redirectBase}?mp_error=token_failed`);
    }

    const { access_token, refresh_token, user_id, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Guardar el token en la DB (propiedad verificada arriba)
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
      .eq('user_id', stateRecord.user_id);

    if (updateError) {
      console.error('Error guardando token en DB:', updateError);
      return res.redirect(`${redirectBase}?mp_error=db_failed`);
    }

    return res.redirect(`${redirectBase}?mp_connected=true`);

  } catch (err) {
    console.error('Error en mp-oauth-callback:', err);
    return res.redirect(`${redirectBase}?mp_error=unexpected`);
  }
}
