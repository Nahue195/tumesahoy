// Script de diagnóstico para verificar la conexión con Supabase
// Ejecutar con: node test-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 DIAGNÓSTICO DE SUPABASE\n');
console.log('URL:', supabaseUrl ? '✓ Configurada' : '✗ NO configurada');
console.log('Key:', supabaseKey ? '✓ Configurada' : '✗ NO configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Variables de entorno no configuradas');
  console.log('\nAsegurate de tener un archivo .env con:');
  console.log('VITE_SUPABASE_URL=tu-url');
  console.log('VITE_SUPABASE_ANON_KEY=tu-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n📡 Verificando conexión...\n');

  try {
    // Test 1: Verificar tabla businesses
    console.log('1️⃣ Testeando tabla "businesses"...');
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, slug')
      .limit(5);

    if (businessError) {
      console.error('   ❌ ERROR:', businessError.message);
    } else {
      console.log('   ✓ Tabla existe');
      console.log('   ✓ Negocios encontrados:', businesses.length);
      if (businesses.length > 0) {
        console.log('   Ejemplo:', businesses[0].name);
      }
    }

    // Test 2: Verificar campos nuevos
    console.log('\n2️⃣ Verificando campos nuevos en "businesses"...');
    const { data: businessWithNewFields, error: fieldsError } = await supabase
      .from('businesses')
      .select('cover_image_url, logo_url, is_accepting_reservations, whatsapp_number')
      .limit(1);

    if (fieldsError) {
      console.error('   ❌ ERROR:', fieldsError.message);
      console.log('   ⚠️  Probablemente no ejecutaste el SQL actualizado');
    } else {
      console.log('   ✓ Campos nuevos existen');
    }

    // Test 3: Verificar tabla reservations
    console.log('\n3️⃣ Testeando tabla "reservations"...');
    const { data: reservations, error: reservError } = await supabase
      .from('reservations')
      .select('id')
      .limit(1);

    if (reservError) {
      console.error('   ❌ ERROR:', reservError.message);
      console.log('   ⚠️  Tabla no existe - ejecutá el SQL actualizado');
    } else {
      console.log('   ✓ Tabla existe');
    }

    // Test 4: Verificar tabla business_hours
    console.log('\n4️⃣ Testeando tabla "business_hours"...');
    const { data: hours, error: hoursError } = await supabase
      .from('business_hours')
      .select('id')
      .limit(1);

    if (hoursError) {
      console.error('   ❌ ERROR:', hoursError.message);
      console.log('   ⚠️  Tabla no existe - ejecutá el SQL actualizado');
    } else {
      console.log('   ✓ Tabla existe');
    }

    // Test 5: Verificar tabla menu_categories
    console.log('\n5️⃣ Testeando tabla "menu_categories"...');
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('id, name')
      .limit(5);

    if (catError) {
      console.error('   ❌ ERROR:', catError.message);
    } else {
      console.log('   ✓ Tabla existe');
      console.log('   ✓ Categorías encontradas:', categories.length);
    }

    // Test 6: Verificar tabla menu_items
    console.log('\n6️⃣ Testeando tabla "menu_items"...');
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select('id, name, image_url')
      .limit(5);

    if (itemsError) {
      console.error('   ❌ ERROR:', itemsError.message);
    } else {
      console.log('   ✓ Tabla existe');
      console.log('   ✓ Items encontrados:', items.length);
    }

    console.log('\n✅ DIAGNÓSTICO COMPLETO\n');
    console.log('Si ves errores arriba, ejecutá el archivo supabase-setup.sql en tu Supabase Dashboard\n');

  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error.message);
  }
}

testConnection();
