# 💳 Guía: Cómo Probar con Pagos REALES en MercadoPago

## ⚠️ IMPORTANTE

Esta guía es para hacer **pagos reales con dinero real**. Asegurate de estar listo para esto antes de continuar.

---

## 📋 Prerequisitos

1. **Cuenta de MercadoPago verificada** (no puede ser de prueba)
2. **Aplicación en modo PRODUCCIÓN** (no sandbox)
3. **Access Token de PRODUCCIÓN**
4. **Webhooks configurados en PRODUCCIÓN**

---

## 🔑 Paso 1: Obtener Credenciales de PRODUCCIÓN

### 1.1 Ir al Panel de Desarrolladores

1. Ve a: https://www.mercadopago.com.ar/developers/panel/app
2. Seleccioná tu aplicación
3. Ir a **"Credenciales"**

### 1.2 Obtener Access Token de PRODUCCIÓN

**MUY IMPORTANTE:**
- En la parte superior, cambiá de **"Credenciales de prueba"** a **"Credenciales de producción"**
- Copiá el **Access Token de producción**

```
Production Access Token:
APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 1.3 Obtener Public Key de PRODUCCIÓN

- Copiá también el **Public Key de producción** (para el frontend)

```
Production Public Key:
APP_USR-XXXXXXXX-XXXXXX-XX-XXXXXXXXXXXX
```

---

## 🔐 Paso 2: Configurar Variables de Entorno

### 2.1 Backend (Supabase Secrets)

Configurá los secretos en Supabase con las credenciales de **PRODUCCIÓN**:

```bash
cd C:\TuMesaHoy\TuMesaHoy

# Access Token de PRODUCCIÓN
supabase secrets set MP_ACCESS_TOKEN="APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Public Key de PRODUCCIÓN
supabase secrets set MP_PUBLIC_KEY="APP_USR-XXXXXXXX-XXXXXX-XX-XXXXXXXXXXXX"

# Webhook Secret (mismo para test y prod)
supabase secrets set MP_WEBHOOK_SECRET="tu_webhook_secret_aqui"

# Frontend URL
supabase secrets set FRONTEND_URL="https://tumesahoy.com"

# Verificar que se guardaron
supabase secrets list
```

### 2.2 Frontend (.env o .env.local)

Actualizá tu archivo `.env` o `.env.local`:

```env
# PRODUCCIÓN - MercadoPago
VITE_MP_PUBLIC_KEY=APP_USR-XXXXXXXX-XXXXXX-XX-XXXXXXXXXXXX
VITE_MP_ACCESS_TOKEN=APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

---

## 🌐 Paso 3: Configurar Webhook de PRODUCCIÓN

### 3.1 Ir a Webhooks

1. Ve a: https://www.mercadopago.com.ar/developers/panel/app
2. Seleccioná tu aplicación
3. Ir a **"Webhooks"**

### 3.2 Agregar URL de Webhook

**URL del Webhook:**
```
https://[tu-proyecto].supabase.co/functions/v1/mp-webhook-v2
```

**Eventos a suscribir:**
- ✅ `payment` (pagos)
- ✅ `subscription_preapproval` (suscripciones)
- ✅ `subscription_authorized_payment` (cobros automáticos)

### 3.3 Configurar Webhook Secret

1. Copiá el **Webhook Secret** que te da MercadoPago
2. Guardalo en Supabase Secrets (ya lo hiciste en el paso 2.1)

---

## 🚀 Paso 4: Desplegar Edge Functions

```bash
cd C:\TuMesaHoy\TuMesaHoy

# Desplegar create-subscription
supabase functions deploy create-subscription --no-verify-jwt

# Desplegar webhook
supabase functions deploy mp-webhook-v2 --no-verify-jwt

# Verificar
supabase functions list
```

---

## 💰 Paso 5: Probar Flujo de Pago REAL

### 5.1 Crear Negocio con Trial

1. Ir a `/signup` y crear cuenta nueva
2. Ir a `/register` y crear negocio
3. Verificar en Supabase que se creó con `subscription_status = 'trial'`

### 5.2 Simular Fin de Trial (Opcional)

Si querés probar inmediatamente sin esperar 30 días:

```sql
-- En Supabase SQL Editor
UPDATE businesses
SET trial_end_date = NOW() + INTERVAL '1 day'
WHERE id = '[tu-business-id]';
```

### 5.3 Acceder al Panel Admin

1. Ir a `/admin/[tu-slug]`
2. Deberías ver el banner "Tenés X días gratis restantes"

### 5.4 Ir a Suscribirse

1. Click en "Suscribirse Ahora"
2. Ir a `/subscribe?business_id=[id]`
3. Click en "Activar Suscripción con MercadoPago"

### 5.5 Completar Pago en MercadoPago

**IMPORTANTE: Este será un pago REAL**

1. Serás redirigido a MercadoPago
2. Usá una tarjeta REAL (será cobrada)
3. Completá el proceso de pago
4. MercadoPago procesará el pago y creará la suscripción

**Precio:** $70.000 ARS (cobro mensual automático)

### 5.6 Verificar Pago

Después de completar el pago:

1. **En tu email:** Deberías recibir confirmación de MercadoPago
2. **En tu cuenta de MP:** El pago aparecerá en tu historial
3. **En Supabase:**

```sql
-- Verificar negocio
SELECT id, name, subscription_status, mercadopago_subscription_id
FROM businesses
WHERE id = '[tu-business-id]';

-- Debería mostrar:
-- subscription_status = 'active'
-- mercadopago_subscription_id = 'xxxxxxxx'

-- Verificar pago
SELECT *
FROM payments
WHERE business_id = '[tu-business-id]'
ORDER BY created_at DESC;
```

---

## 🔍 Paso 6: Verificar Webhook

### 6.1 Ver Logs del Webhook

```bash
# Ver logs en tiempo real
supabase functions logs mp-webhook-v2 --follow

# Ver últimos logs
supabase functions logs mp-webhook-v2
```

### 6.2 Verificar en Supabase

```sql
-- Ver logs de webhooks recibidos
SELECT *
FROM webhook_logs
ORDER BY created_at DESC
LIMIT 10;
```

Deberías ver:
- Un evento `payment` con status `approved`
- Un evento `subscription_preapproval` con status `authorized`

---

## 🔁 Paso 7: Probar Cobro Mensual Automático

El primer cobro es inmediato. Los siguientes cobros serán automáticos cada mes.

### 7.1 Esperar al Próximo Cobro

MercadoPago cobrará automáticamente cada mes en la misma fecha.

**Ejemplo:**
- Primer cobro: 18 de Diciembre 2024
- Segundo cobro: 18 de Enero 2025
- Tercer cobro: 18 de Febrero 2025

### 7.2 Simular Próximo Cobro (Para Testing)

Si querés probar antes, podés:

1. Ir a tu cuenta de MercadoPago
2. Panel > Suscripciones
3. Seleccionar la suscripción
4. "Cobrar ahora" (si está disponible)

**NOTA:** Esto hará un cobro REAL adicional.

---

## ❌ Paso 8: Probar Cancelación de Suscripción

### 8.1 Desde el Panel Admin

1. Ir a `/admin/[tu-slug]`
2. Tab "⚙️ Configuración"
3. Scroll a "Información de Suscripción"
4. Click en "Cancelar Suscripción"
5. Confirmar

### 8.2 Verificar Cancelación

```sql
-- En Supabase
SELECT id, name, subscription_status, is_active
FROM businesses
WHERE id = '[tu-business-id]';

-- Debería mostrar:
-- subscription_status = 'cancelled'
-- is_active = false
```

### 8.3 Verificar en MercadoPago

1. Ir a: https://www.mercadopago.com.ar/subscriptions
2. La suscripción debería aparecer como "Cancelada"

---

## 🧪 Diferencias entre PRUEBA y PRODUCCIÓN

| Aspecto | Modo PRUEBA | Modo PRODUCCIÓN |
|---------|-------------|-----------------|
| Access Token | `TEST-XXXXXX-XXXXXX-XXXXX` | `APP_USR-XXXXXX-XXXXXX-XXXXX` |
| Tarjetas | Tarjetas de prueba | Tarjetas REALES |
| Dinero | Simulado | REAL |
| Webhooks | URL de prueba | URL de producción |
| Cobros | No se cobra | SE COBRA REALMENTE |

---

## 💡 Consejos

1. **Probá primero con tarjetas de prueba** en modo sandbox
2. **Verificá TODAS las credenciales** antes de ir a producción
3. **Configurá bien los webhooks** o los pagos no se procesarán
4. **Monitoreá los logs** de los Edge Functions
5. **Guardá las credenciales de forma segura** (nunca en el código)

---

## 🆘 Troubleshooting

### Problema: No se procesa el pago

**Solución:**
1. Verificar que el webhook esté configurado correctamente
2. Ver logs: `supabase functions logs mp-webhook-v2`
3. Verificar tabla `webhook_logs` en Supabase

### Problema: Suscripción no se activa

**Solución:**
```sql
-- Activar manualmente
UPDATE businesses
SET subscription_status = 'active',
    is_active = true
WHERE id = '[tu-business-id]';
```

### Problema: Error en Edge Function

**Solución:**
1. Ver logs detallados
2. Verificar que las credenciales estén configuradas
3. `supabase secrets list`

---

## 📊 Monitoreo de Pagos en Producción

### Dashboard de MercadoPago

https://www.mercadopago.com.ar/movements

Aquí podés ver:
- Todos los pagos recibidos
- Suscripciones activas
- Cobros automáticos programados
- Disputas o rechazos

### Supabase Dashboard

```sql
-- Ver todos los pagos
SELECT
  b.name AS negocio,
  p.amount,
  p.status,
  p.created_at,
  p.payer_email
FROM payments p
JOIN businesses b ON p.business_id = b.id
ORDER BY p.created_at DESC;

-- Ver suscripciones activas
SELECT
  name,
  subscription_status,
  trial_end_date,
  mercadopago_subscription_id
FROM businesses
WHERE subscription_status = 'active';
```

---

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Access Token de PRODUCCIÓN configurado en Supabase
- [ ] Public Key de PRODUCCIÓN configurado en frontend
- [ ] Webhook configurado con URL de producción
- [ ] Webhook Secret configurado en Supabase
- [ ] Edge Functions desplegadas
- [ ] Probado en modo test primero
- [ ] Monitoreando logs en tiempo real
- [ ] Base de datos respaldada

---

## 🎯 Resultado Esperado

Con esta configuración:

✅ Usuario se suscribe → **Pago REAL de $70.000 ARS**
✅ Cada mes → **Cobro automático de $70.000 ARS**
✅ Webhook → **Activa negocio automáticamente**
✅ Si falla pago → **MP reintenta 3 veces**
✅ Si no paga → **Negocio se desactiva**

**¡Todo automatizado con dinero real!** 🚀💰
