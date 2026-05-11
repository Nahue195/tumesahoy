// Script para testear el webhook de Mercado Pago manualmente
// Ejecutar con: node test-webhook.js

const WEBHOOK_URL = 'https://dcagmqhokjcvvilvyigp.supabase.co/functions/v1/mp-webhook';
const PAYMENT_ID = '136353762491'; // ID real del pago de MP
const BUSINESS_ID = 'b6f198b9-edd8-4c5f-b4db-cef431356020';

// Simular la notificación que Mercado Pago envía
const notification = {
  action: 'payment.created',
  api_version: 'v1',
  data: {
    id: PAYMENT_ID
  },
  date_created: new Date().toISOString(),
  id: Math.floor(Math.random() * 1000000),
  live_mode: false,
  type: 'payment',
  user_id: '123456'
};

console.log('🔄 Testeando webhook...\n');
console.log('URL:', WEBHOOK_URL);
console.log('Payload:', JSON.stringify(notification, null, 2));
console.log('\n---\n');

fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(notification)
})
  .then(response => {
    console.log('✅ Status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('📦 Respuesta del webhook:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n✅ Webhook ejecutado. Ahora verificá en Supabase:');
    console.log('   1. Table Editor > businesses');
    console.log('   2. Buscá el negocio:', BUSINESS_ID);
    console.log('   3. Verificá que is_active = true y subscription_status = active');
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
