// Configuración de Mercado Pago

export const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

// Función para cargar el script de Mercado Pago
export function loadMercadoPagoScript() {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve(window.MercadoPago);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Inicializar Mercado Pago con tu public key
export async function initMercadoPago() {
  try {
    const mp = await loadMercadoPagoScript();
    return new mp(MP_PUBLIC_KEY);
  } catch (error) {
    console.error('Error inicializando Mercado Pago:', error);
    throw error;
  }
}

// Crear preferencia de pago (esto normalmente va en backend)
// Para MVP, usamos una función serverless o API
export async function createPreference(businessData) {
  // Esta función debería llamar a tu backend/edge function
  // Por ahora retorna la estructura de datos necesaria

  const preference = {
    items: [
      {
        title: 'Suscripción TuMesaHoy - Plan Mensual',
        description: `Suscripción para ${businessData.name}`,
        quantity: 1,
        unit_price: 100,
        currency_id: 'ARS'
      }
    ],
    back_urls: {
      success: `${window.location.origin}/payment/success?business_id=${businessData.id}`,
      failure: `${window.location.origin}/payment/failure?business_id=${businessData.id}`,
      pending: `${window.location.origin}/payment/pending?business_id=${businessData.id}`
    },
    auto_return: 'approved',
    external_reference: businessData.id,
    statement_descriptor: 'TUMESAHOY',
    metadata: {
      business_id: businessData.id,
      business_slug: businessData.slug,
      subscription_type: 'monthly'
    }
  };

  return preference;
}
