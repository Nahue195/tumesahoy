// Proxy público para webhooks de Mercado Pago
// Recibe webhooks de MP y los reenvía a Supabase Edge Function con autenticación

// Deshabilitar el body parser de Vercel para preservar el body raw exacto
// (necesario para que la validación de firma HMAC funcione correctamente)
export const config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Configuración de Supabase incompleta');
    }

    const supabaseWebhookUrl = `${SUPABASE_URL}/functions/v1/mp-webhook-v2`;

    const response = await fetch(supabaseWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        // Reenviar headers de MP para que la validación de firma funcione
        'x-signature': req.headers['x-signature'] || '',
        'x-request-id': req.headers['x-request-id'] || '',
      },
      body: rawBody, // Body original sin re-parsear
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: 'Webhook procesado correctamente',
      supabaseResponse: data,
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);

    return res.status(200).json({
      success: false,
      error: error.message,
      note: 'Error logged but returning 200 to avoid MP retries',
    });
  }
}
