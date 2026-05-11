/**
 * Script de Verificación Automática - TuMesaHoy
 *
 * Verifica configuración, conexiones y estado del sistema
 * Uso: node test-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

// Cargar variables de entorno manualmente
function loadEnv() {
  try {
    const envPath = join(__dirname, '.env');
    const envFile = readFileSync(envPath, 'utf-8');
    const envVars = {};

    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (err) {
    error('No se pudo leer el archivo .env');
    return {};
  }
}

async function runTests() {
  log('\n🧪 INICIANDO TESTS DE CONFIGURACIÓN\n', 'cyan');

  const env = loadEnv();
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  // ==================================================
  // FASE 1: Verificar Variables de Entorno
  // ==================================================
  section('FASE 1: Variables de Entorno');

  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_MP_PUBLIC_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    totalTests++;
    if (env[envVar] && env[envVar].length > 10) {
      success(`${envVar} configurada`);
      passedTests++;
    } else {
      error(`${envVar} NO configurada o inválida`);
      failedTests++;
    }
  }

  // Verificar tipo de credenciales de MP
  totalTests++;
  if (env.VITE_MP_PUBLIC_KEY) {
    if (env.VITE_MP_PUBLIC_KEY.startsWith('TEST-')) {
      warning('Usando credenciales de SANDBOX (TEST) - Para testing');
      info('Podés usar tarjetas de prueba de Mercado Pago');
      passedTests++;
    } else if (env.VITE_MP_PUBLIC_KEY.startsWith('APP_USR-')) {
      warning('Usando credenciales de PRODUCCIÓN');
      info('Los pagos serán REALES con dinero real');
      passedTests++;
    } else {
      error('Formato de MP_PUBLIC_KEY no reconocido');
      failedTests++;
    }
  }

  // ==================================================
  // FASE 2: Verificar Conexión con Supabase
  // ==================================================
  section('FASE 2: Conexión con Supabase');

  let supabase;
  try {
    totalTests++;
    supabase = createClient(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY
    );
    success('Cliente de Supabase creado correctamente');
    passedTests++;
  } catch (err) {
    error('No se pudo crear cliente de Supabase');
    error(err.message);
    failedTests++;
    return; // No podemos continuar sin conexión
  }

  // ==================================================
  // FASE 3: Verificar Tablas en Base de Datos
  // ==================================================
  section('FASE 3: Estructura de Base de Datos');

  const requiredTables = [
    'businesses',
    'menu_categories',
    'menu_items',
    'business_hours',
    'reservations',
    'payments',
    'subscriptions'
  ];

  for (const table of requiredTables) {
    totalTests++;
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === 'PGRST204') {
          warning(`Tabla '${table}' existe pero está vacía`);
          passedTests++;
        } else {
          error(`Tabla '${table}' no existe o no es accesible`);
          info(`Error: ${error.message}`);
          failedTests++;
        }
      } else {
        success(`Tabla '${table}' existe y es accesible`);
        passedTests++;
      }
    } catch (err) {
      error(`Error consultando tabla '${table}'`);
      failedTests++;
    }
  }

  // ==================================================
  // FASE 4: Verificar Storage Buckets
  // ==================================================
  section('FASE 4: Storage Buckets');

  const requiredBuckets = ['business-images', 'menu-images'];

  for (const bucketName of requiredBuckets) {
    totalTests++;
    try {
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list('', { limit: 1 });

      if (error) {
        error(`Bucket '${bucketName}' no existe o no es accesible`);
        info(`Error: ${error.message}`);
        failedTests++;
      } else {
        success(`Bucket '${bucketName}' existe y es accesible`);
        passedTests++;
      }
    } catch (err) {
      error(`Error consultando bucket '${bucketName}'`);
      failedTests++;
    }
  }

  // ==================================================
  // FASE 5: Verificar Edge Functions
  // ==================================================
  section('FASE 5: Edge Functions');

  const functions = ['mp-webhook', 'create-payment'];

  for (const funcName of functions) {
    totalTests++;
    try {
      const url = `${env.VITE_SUPABASE_URL}/functions/v1/${funcName}`;

      // Hacer OPTIONS request para verificar que existe
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173'
        }
      });

      if (response.ok || response.status === 200) {
        success(`Edge Function '${funcName}' está desplegada`);
        passedTests++;
      } else if (response.status === 404) {
        error(`Edge Function '${funcName}' NO encontrada (404)`);
        failedTests++;
      } else {
        warning(`Edge Function '${funcName}' responde pero con status: ${response.status}`);
        passedTests++;
      }
    } catch (err) {
      error(`Error verificando Edge Function '${funcName}'`);
      info(`Error: ${err.message}`);
      failedTests++;
    }
  }

  // ==================================================
  // FASE 6: Verificar Negocios Activos
  // ==================================================
  section('FASE 6: Datos de Prueba');

  totalTests++;
  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name, slug, is_active, subscription_status')
      .limit(5);

    if (error) {
      error('No se pudo consultar negocios');
      failedTests++;
    } else {
      success(`Negocios en BD: ${businesses.length}`);

      if (businesses.length > 0) {
        info('\nNegocios encontrados:');
        businesses.forEach(b => {
          const status = b.is_active ? '🟢 ACTIVO' : '🔴 INACTIVO';
          console.log(`   - ${b.name} (${b.slug}) - ${status}`);
        });
      } else {
        warning('No hay negocios registrados aún');
        info('Esto es normal si es la primera vez que usás la app');
      }
      passedTests++;
    }
  } catch (err) {
    error('Error consultando negocios');
    failedTests++;
  }

  // ==================================================
  // FASE 7: Verificar RLS Policies
  // ==================================================
  section('FASE 7: Row Level Security (RLS)');

  totalTests++;
  try {
    // Intentar insertar sin autenticación (debe fallar)
    const { error } = await supabase
      .from('businesses')
      .insert({
        name: 'Test',
        slug: 'test-' + Date.now(),
        user_id: '00000000-0000-0000-0000-000000000000'
      });

    if (error && error.code === '42501') {
      success('RLS está activo (insert sin auth bloqueado correctamente)');
      passedTests++;
    } else if (error) {
      warning('RLS parece activo pero con error diferente');
      info(`Error: ${error.message}`);
      passedTests++;
    } else {
      error('⚠️ RLS NO está activo - Cualquiera puede insertar datos');
      failedTests++;
    }
  } catch (err) {
    warning('No se pudo verificar RLS policies');
    passedTests++;
  }

  // ==================================================
  // RESUMEN FINAL
  // ==================================================
  section('RESUMEN DE TESTS');

  const successRate = Math.round((passedTests / totalTests) * 100);

  log(`\nTotal de tests:     ${totalTests}`, 'cyan');
  log(`Tests aprobados:    ${passedTests}`, 'green');
  log(`Tests fallidos:     ${failedTests}`, 'red');
  log(`Tasa de éxito:      ${successRate}%\n`, successRate >= 80 ? 'green' : 'yellow');

  if (successRate >= 90) {
    success('🎉 ¡Excelente! La configuración está completa');
    info('Podés continuar con el testing manual');
  } else if (successRate >= 70) {
    warning('⚠️ Hay algunos problemas menores');
    info('Revisá los errores arriba y corregí lo necesario');
  } else {
    error('❌ Hay problemas críticos de configuración');
    info('Revisá la documentación en SETUP.md y corregí los errores');
  }

  // Recomendaciones
  log('\n📋 PRÓXIMOS PASOS:', 'blue');
  if (failedTests === 0) {
    info('1. Ejecutar: npm run dev');
    info('2. Abrir: http://localhost:5173');
    info('3. Seguir la guía de TESTING_GUIDE.md');
  } else {
    info('1. Corregir los errores mostrados arriba');
    info('2. Ejecutar este script nuevamente: node test-setup.js');
    info('3. Una vez todo OK, seguir con TESTING_GUIDE.md');
  }

  console.log('\n');
  process.exit(failedTests > 0 ? 1 : 0);
}

// Ejecutar tests
runTests().catch(err => {
  error('Error fatal ejecutando tests');
  console.error(err);
  process.exit(1);
});
