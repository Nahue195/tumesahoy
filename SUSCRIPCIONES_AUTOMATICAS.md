# 💳 Sistema de Suscripciones Automáticas - TuMesaHoy

## 🎯 ¿Qué es y por qué es mejor?

Has cambiado el sistema de **pagos únicos** a **suscripciones automáticas recurrentes**. Esto es MUCHO más profesional y conveniente.

### Ventajas para tu negocio:
✅ **Ingresos recurrentes automáticos** - No necesitas perseguir a los clientes cada mes
✅ **Menor tasa de cancelación** - Inercia a favor (el cliente debe cancelar activamente)
✅ **Mejor experiencia de usuario** - El cliente no re-ingresa datos cada mes
✅ **Menos fricción** - No hay recordatorios mensuales molestos
✅ **Cobros automáticos** - Mercado Pago maneja todo
✅ **Reintentos automáticos** - Si falla un pago, MP reintenta
✅ **Más profesional** - Es el estándar de SaaS moderno

---

## 🔄 Cómo Funciona el Flujo

### Para el cliente (dueño del negocio):

```
1. Registra su negocio
   ↓
2. Es redirigido a /payment
   ↓
3. Ve la página de suscripción mensual ($1 ARS en testing, $70.000 en producción)
   ↓
4. Hace clic en "Suscribirme con Mercado Pago"
   ↓
5. Es redirigido a Mercado Pago para:
   - Ingresar datos de tarjeta
   - AUTORIZAR la suscripción (no solo pagar una vez)
   ↓
6. Mercado Pago guarda el método de pago
   ↓
7. Se hace el PRIMER COBRO inmediatamente ($1 o $70.000)
   ↓
8. Webhook notifica a tu sistema
   ↓
9. El negocio se ACTIVA (is_active = true, subscription_status = 'active')
   ↓
10. Cada mes, Mercado Pago cobra AUTOMÁTICAMENTE
    ↓
11. El cliente puede CANCELAR desde su panel admin cuando quiera
```

### Para Mercado Pago (automático):

```
Día 1: Cliente autoriza suscripción → Primer cobro
Día 30: Cobro automático del mes 2
Día 60: Cobro automático del mes 3
...
Hasta que el cliente cancele
```

---

## 📁 Archivos Modificados

### 1. **`supabase/functions/create-subscription/index.ts`** ✅
- Edge Function que crea suscripciones en Mercado Pago
- Usa la API `/preapproval` de Mercado Pago
- Configuración: `auto_recurring` con `frequency: 1 month`
- Monto dinámico: $1 ARS (testing) / $70.000 ARS (producción)
- Validación de seguridad: verifica que el usuario sea dueño del negocio

### 2. **`src/pages/PaymentPage.jsx`** ✅
- Actualizado para llamar a `create-subscription` en lugar de `create-payment`
- UI mejorada con:
  - Título: "Suscripción Mensual"
  - Precio: "$1 por mes (prueba)"
  - Info box explicando que es automática y cancelable
  - Botón: "Suscribirme con Mercado Pago"

### 3. **`supabase/functions/mp-webhook-v2/index.ts`** ✅ (Ya existía)
- Ya preparado para manejar eventos de suscripciones
- Maneja 3 tipos de eventos:
  - `payment` - Cada cobro individual (primer pago y renovaciones)
  - `subscription_preapproval` - Cuando se crea/cancela la suscripción
  - `subscription_authorized_payment` - Cuando se autoriza un nuevo cobro

---

## 🔧 Configuración Necesaria

### Paso 1: Configurar Mercado Pago para Suscripciones

Las suscripciones en Mercado Pago funcionan **automáticamente** con el mismo Access Token que usas para pagos normales. **No necesitas hacer nada especial en el dashboard de Mercado Pago**.

Sin embargo, hay algunas cosas a tener en cuenta:

#### Verificar que tu cuenta tenga habilitadas las suscripciones:

1. Ve a **Mercado Pago Developers** > **Tus aplicaciones**
2. Selecciona tu aplicación
3. Verifica que en **"Productos"** esté habilitado:
   - ✅ **Checkout Pro**
   - ✅ **Suscripciones** (a veces aparece como "Pagos recurrentes")

Si no ves "Suscripciones", **no te preocupes**, generalmente está habilitado por defecto para todas las cuentas de Argentina.

### Paso 2: Configurar Webhooks

**IMPORTANTE**: Debes configurar webhooks para recibir notificaciones de los cobros mensuales.

1. Ve a **Mercado Pago** > **Tus integraciones** > **Webhooks**
2. Configura la URL: `https://TU_PROJECT_REF.supabase.co/functions/v1/mp-webhook-v2`
3. **CRÍTICO**: Selecciona TODOS estos eventos:
   - ✅ `payment` - Notifica cada pago (primer cobro y renovaciones)
   - ✅ `subscription_preapproval` - Notifica cuando se crea/cancela suscripción
   - ✅ `subscription_authorized_payment` - Notifica cobros autorizados

4. Copia el **Secret** del webhook
5. Configura el secret en Supabase:
   ```bash
   supabase secrets set MP_WEBHOOK_SECRET=tu_webhook_secret
   ```

### Paso 3: Desplegar las Edge Functions

```bash
# Asegúrate de estar logueado en Supabase CLI
supabase login

# Linkea tu proyecto
supabase link --project-ref TU_PROJECT_REF

# Despliega las funciones actualizadas
supabase functions deploy create-subscription
supabase functions deploy mp-webhook-v2

# Verifica que los secrets estén configurados
supabase secrets list
```

**Secrets necesarios**:
```
SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJ...tu_anon_key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu_service_role_key...
MP_ACCESS_TOKEN=TEST-xxxxx... (tus credenciales de Mercado Pago)
MP_WEBHOOK_SECRET=tu_webhook_secret
FRONTEND_URL=http://localhost:5173 (en dev) o https://tumesahoy.com (en prod)
```

### Paso 4: Crear archivo .env

Si aún no lo hiciste, crea el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_anon_key...
VITE_MP_PUBLIC_KEY=TEST-xxxxx... (tu Public Key de Mercado Pago)
```

---

## 🧪 Testing con Tarjetas de Prueba

Para probar las suscripciones en modo sandbox (TEST), usa estas tarjetas:

### Tarjetas de Prueba Argentina:

**Aprobada automáticamente:**
```
Número: 5031 7557 3453 0604
Vencimiento: 11/25
CVV: 123
Nombre: APRO (cualquier nombre)
DNI: 12345678
```

**Rechazada (fondos insuficientes):**
```
Número: 5031 4332 1540 6351
Vencimiento: 11/25
CVV: 123
```

Más tarjetas: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

### Simular renovaciones mensuales:

En modo TEST, **no es posible** adelantar el tiempo para probar renovaciones automáticas. Sin embargo, puedes:

1. Crear una suscripción con tarjeta de prueba
2. Ver en los logs de Supabase que el webhook recibe el evento
3. Verificar que el negocio se activa

En **producción**, las renovaciones ocurren automáticamente cada 30 días.

---

## 🔍 Debugging y Logs

### Ver logs de Edge Functions:

1. Ve a **Supabase Dashboard** > **Edge Functions**
2. Selecciona la función (`create-subscription` o `mp-webhook-v2`)
3. Click en **"Logs"**
4. Verás todos los console.log() y errores

### Ver webhooks recibidos:

1. Ve a **Supabase Dashboard** > **Table Editor**
2. Selecciona la tabla `webhook_logs`
3. Verás todos los eventos recibidos de Mercado Pago

### Ver suscripciones en la base de datos:

```sql
-- Ver negocios con suscripción
SELECT
  name,
  slug,
  subscription_status,
  mercadopago_subscription_id,
  is_active
FROM businesses
WHERE mercadopago_subscription_id IS NOT NULL;

-- Ver pagos recibidos
SELECT
  b.name,
  p.amount,
  p.status,
  p.payment_method,
  p.created_at
FROM payments p
JOIN businesses b ON p.business_id = b.id
ORDER BY p.created_at DESC;

-- Ver logs de webhooks
SELECT
  event_type,
  resource_id,
  status,
  created_at
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎛️ Panel de Administración (Futuro)

Para que los clientes puedan **cancelar** su suscripción desde el panel admin, necesitarás crear:

### Componente: `AdminSubscriptionSection.jsx`

Características:
- Mostrar estado de la suscripción (active, cancelled, etc.)
- Mostrar próxima fecha de cobro
- Mostrar método de pago guardado (últimos 4 dígitos)
- Botón "Cancelar suscripción"
- Historial de pagos

### Edge Function: `cancel-subscription`

```typescript
// Llamar a la API de Mercado Pago para cancelar
PUT https://api.mercadopago.com/preapproval/{subscription_id}
Body: { "status": "cancelled" }
```

---

## 📊 Estados de Suscripción

### Estados en la tabla `businesses`:

- `pending` - Suscripción creada pero aún no autorizada por el cliente
- `active` - Suscripción activa, negocio funcionando
- `cancelled` - Cliente canceló la suscripción
- `inactive` - Falló un pago y no se pudo reintentar

### Estados en Mercado Pago:

- `pending` - Esperando autorización del cliente
- `authorized` - Cliente autorizó, puede cobrar
- `paused` - Suscripción pausada
- `cancelled` - Cancelada por el cliente
- `finished` - Finalizada (llegó a fecha de fin)

---

## 💰 Precios

### Modo Testing (TEST):
- **$1 ARS por mes** - Para hacer pruebas sin costo

### Modo Producción (PROD):
- **$70.000 ARS por mes** - Precio real

El código detecta automáticamente el modo según el Access Token:
```typescript
const isTesting = MP_ACCESS_TOKEN.startsWith('TEST-')
const monthlyAmount = isTesting ? 1 : 70000
```

---

## ✅ Checklist de Implementación

```
Código:
✅ Edge Function create-subscription creada
✅ PaymentPage actualizada para usar suscripciones
✅ Webhook mp-webhook-v2 maneja eventos de suscripción
✅ UI actualizada con info de renovación automática

Configuración Mercado Pago:
□ Cuenta de Mercado Pago creada con email empresarial
□ Aplicación creada en Developers Panel
□ Credenciales TEST obtenidas
□ Webhooks configurados (payment, subscription_*)
□ Webhook secret obtenido

Configuración Supabase:
□ Base de datos configurada
□ Storage buckets creados con policies
□ Edge Functions desplegadas
□ Secrets configurados (SUPABASE_*, MP_*, FRONTEND_URL)

Testing:
□ Archivo .env configurado con credenciales TEST
□ npm install ejecutado
□ npm run dev funciona
□ Flujo de suscripción probado con tarjeta de prueba
□ Webhook recibido correctamente
□ Negocio activado después del pago

Producción (próximamente):
□ Cambiar a credenciales de producción
□ Actualizar precio a $70.000 (ya está automático)
□ Agregar botón de cancelación en admin panel
□ Configurar emails de notificación de cobros
```

---

## 🚀 Próximos Pasos

1. **Terminar configuración de Storage policies** (instrucciones en GUIA_CONFIGURACION_COMPLETA.md)
2. **Configurar Mercado Pago** con cuenta empresarial
3. **Desplegar Edge Functions** con supabase CLI
4. **Probar flujo completo** con tarjeta de prueba
5. **Implementar panel de cancelación** (próxima funcionalidad)
6. **Cambiar a producción** cuando todo funcione

---

## 📞 Recursos

- [Documentación Mercado Pago Suscripciones](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration)
- [API Preapproval (Suscripciones)](https://www.mercadopago.com.ar/developers/es/reference/subscriptions/_preapproval/post)
- [Webhooks Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [Tarjetas de Prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

---

**¡El sistema de suscripciones está listo! 🎉**

Ahora solo necesitas configurar Mercado Pago, desplegar las funciones y probar.
