# 🚀 Guía Completa de Configuración - TuMesaHoy

Esta guía te llevará paso a paso para configurar **TuMesaHoy** desde cero con cuentas profesionales nuevas de Supabase y Mercado Pago.

---

## 📋 Índice

1. [Crear Cuenta Supabase Empresarial](#1-crear-cuenta-supabase-empresarial)
2. [Configurar Proyecto en Supabase](#2-configurar-proyecto-en-supabase)
3. [Configurar Base de Datos](#3-configurar-base-de-datos)
4. [Configurar Storage (Imágenes)](#4-configurar-storage)
5. [Crear Cuenta Mercado Pago Empresarial](#5-crear-cuenta-mercado-pago-empresarial)
6. [Configurar Aplicación en Mercado Pago](#6-configurar-aplicación-en-mercado-pago)
7. [Desplegar Edge Functions](#7-desplegar-edge-functions)
8. [Configurar Webhooks de Mercado Pago](#8-configurar-webhooks)
9. [Configurar Variables de Entorno](#9-configurar-variables-de-entorno)
10. [Pruebas Finales](#10-pruebas-finales)

---

## 1. Crear Cuenta Supabase Empresarial

### Paso 1.1: Registrarse en Supabase

1. Ve a **https://supabase.com**
2. Haz clic en **"Start your project"**
3. **IMPORTANTE**: Usa el **email empresarial** de TuMesaHoy (ej: `contacto@tumesahoy.com`)
4. Puedes registrarte con:
   - Email + Contraseña (recomendado)
   - GitHub
   - Google

### Paso 1.2: Verificar Email

1. Revisa el email empresarial
2. Haz clic en el link de verificación
3. Completa tu perfil si es necesario

---

## 2. Configurar Proyecto en Supabase

### Paso 2.1: Crear Nuevo Proyecto

1. En el dashboard de Supabase, haz clic en **"New project"**
2. Completa los datos:
   - **Organization**: Crea una nueva organización llamada "TuMesaHoy" (o usa la existente)
   - **Project Name**: `tumesahoy-production` (o `tumesahoy-dev` si es para desarrollo)
   - **Database Password**: Genera una contraseña FUERTE (guárdala en un lugar seguro)
   - **Region**: `South America (São Paulo)` (la más cercana a Argentina)
   - **Pricing Plan**: Free (puedes upgradear después)

3. Haz clic en **"Create new project"**
4. **Espera 2-3 minutos** mientras Supabase crea tu proyecto

### Paso 2.2: Anotar Credenciales

Una vez creado el proyecto, ve a **Settings > API**

Anota estas credenciales (las necesitarás después):

```
Project URL: https://TU_PROJECT_REF.supabase.co
anon (public) key: eyJ...tu_anon_key_de_supabase...
service_role key: eyJ...tu_service_role_key_de_supabase... (¡NUNCA compartir!)
```

> ⚠️ **NUNCA compartas el `service_role` key públicamente**

---

## 3. Configurar Base de Datos

### Paso 3.1: Ejecutar Script SQL

1. En el proyecto de Supabase, ve a **SQL Editor** (ícono de base de datos en la sidebar)
2. Haz clic en **"New query"**
3. Abre el archivo `database-setup.sql` de este repositorio
4. **Copia TODO el contenido** del archivo
5. **Pega** en el editor SQL de Supabase
6. Haz clic en **"RUN"** (abajo a la derecha)

**Resultado esperado:**
```
Success. No rows returned
```

### Paso 3.2: Verificar Tablas Creadas

1. Ve a **Table Editor** en la sidebar
2. Deberías ver estas tablas:
   - ✅ `businesses`
   - ✅ `menu_categories`
   - ✅ `menu_items`
   - ✅ `business_hours`
   - ✅ `reservations`
   - ✅ `payments`
   - ✅ `subscriptions`
   - ✅ `webhook_logs`

### Paso 3.3: Verificar RLS (Row Level Security)

1. En **Table Editor**, selecciona cualquier tabla (ej: `businesses`)
2. Ve a la pestaña **"RLS policies"**
3. Deberías ver varias políticas activas con nombres descriptivos

---

## 4. Configurar Storage

### Paso 4.1: Crear Bucket para Imágenes de Negocios

1. Ve a **Storage** en la sidebar
2. Haz clic en **"Create a new bucket"**
3. Completa:
   - **Name**: `business-images`
   - **Public bucket**: ✅ **Activar** (las imágenes deben ser públicas)
4. Haz clic en **"Create bucket"**

### Paso 4.2: Configurar Políticas de Storage para business-images

1. Selecciona el bucket `business-images`
2. Ve a **"Policies"**
3. Haz clic en **"New policy"** > **"For full customization"**
4. Crea la siguiente política:

**Policy 1: Permitir lectura pública**
```sql
Policy name: Public read access
Allowed operation: SELECT
Target roles: public

Policy definition:
true
```

**Policy 2: Permitir upload a usuarios autenticados**
```sql
Policy name: Authenticated users can upload
Allowed operation: INSERT
Target roles: authenticated

Policy definition:
true
```

**Policy 3: Permitir actualizar/eliminar solo propias imágenes**
```sql
Policy name: Users can update their own images
Allowed operation: UPDATE, DELETE
Target roles: authenticated

Policy definition:
(bucket_id = 'business-images')
```

### Paso 4.3: Crear Bucket para Imágenes de Menú

Repite el proceso anterior pero con:
- **Name**: `menu-images`
- **Public bucket**: ✅ **Activar**
- Mismas políticas que `business-images`

---

## 5. Crear Cuenta Mercado Pago Empresarial

### Paso 5.1: Registrarse en Mercado Pago

1. Ve a **https://www.mercadopago.com.ar**
2. Haz clic en **"Crear cuenta"**
3. **IMPORTANTE**: Usa el **email empresarial** de TuMesaHoy
4. Completa el registro:
   - Tipo de cuenta: **"Vendedor"**
   - Tipo de persona: **"Empresa"** (si tienes CUIT) o **"Persona física"**
   - Completa tus datos fiscales

### Paso 5.2: Verificar Cuenta

1. Verifica tu email
2. Completa la verificación de identidad si es requerida
3. Vincula una cuenta bancaria o medio de pago

---

## 6. Configurar Aplicación en Mercado Pago

### Paso 6.1: Crear Aplicación

1. Ve a **https://www.mercadopago.com.ar/developers/panel**
2. Inicia sesión con la cuenta empresarial
3. Ve a **"Tus aplicaciones"** > **"Crear aplicación"**
4. Completa:
   - **Nombre de la aplicación**: `TuMesaHoy Production` (o `TuMesaHoy Dev`)
   - **Producto**: Selecciona **"Pagos online"**
   - **Modelo de integración**: **"Checkout Pro"**
5. Haz clic en **"Crear aplicación"**

### Paso 6.2: Obtener Credenciales

#### Para DESARROLLO (Testing):

1. En tu aplicación, ve a **"Credenciales de prueba"**
2. Anota:
   ```
   Public Key (TEST): TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Access Token (TEST): TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

#### Para PRODUCCIÓN:

1. Ve a **"Credenciales de producción"**
2. Activa tu cuenta (si aún no lo hiciste)
3. Anota:
   ```
   Public Key (PROD): APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Access Token (PROD): APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

> ⚠️ **NUNCA compartas el Access Token públicamente**

### Paso 6.3: Configurar URLs de Redirección

1. En tu aplicación de Mercado Pago, ve a **"Datos básicos"**
2. En **"URLs de redirección"**, agrega:
   - Para desarrollo:
     ```
     http://localhost:5173/payment/success
     http://localhost:5173/payment/failure
     http://localhost:5173/payment/pending
     http://localhost:5173/admin/*
     ```
   - Para producción:
     ```
     https://tumesahoy.com/payment/success
     https://tumesahoy.com/payment/failure
     https://tumesahoy.com/payment/pending
     https://tumesahoy.com/admin/*
     ```

---

## 7. Desplegar Edge Functions

### Paso 7.1: Instalar Supabase CLI

Si aún no tienes Supabase CLI instalado:

**Windows (PowerShell como Admin):**
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**O usa npm:**
```bash
npm install -g supabase
```

### Paso 7.2: Iniciar Sesión en Supabase CLI

```bash
supabase login
```

Sigue las instrucciones para autenticarte.

### Paso 7.3: Linkear el Proyecto

```bash
supabase link --project-ref TU_PROJECT_REF
```

> **¿Dónde encuentro el Project Ref?**
> En Supabase Dashboard > Settings > General > Reference ID

### Paso 7.4: Desplegar Todas las Edge Functions

```bash
# Desplegar create-payment
supabase functions deploy create-payment

# Desplegar mp-webhook
supabase functions deploy mp-webhook

# Desplegar mp-webhook-v2
supabase functions deploy mp-webhook-v2

# Desplegar create-subscription (si lo tienes)
supabase functions deploy create-subscription
```

**Resultado esperado:**
```
✓ Deployed function create-payment to https://xxxxx.supabase.co/functions/v1/create-payment
```

### Paso 7.5: Configurar Secrets de Edge Functions

Ahora necesitas configurar las variables de entorno secretas que usan las Edge Functions:

```bash
# SUPABASE_URL (tu URL del proyecto)
supabase secrets set SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# SUPABASE_ANON_KEY (tu anon key)
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# SUPABASE_SERVICE_ROLE_KEY (tu service role key)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# MP_ACCESS_TOKEN (tu access token de Mercado Pago)
# Para testing:
supabase secrets set MP_ACCESS_TOKEN=TEST-xxxxxxxx...
# Para producción:
supabase secrets set MP_ACCESS_TOKEN=APP_USR-xxxxxxxx...

# FRONTEND_URL (URL de tu frontend en producción)
supabase secrets set FRONTEND_URL=https://tumesahoy.com
```

### Paso 7.6: Verificar Secrets Configurados

```bash
supabase secrets list
```

Deberías ver:
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
MP_ACCESS_TOKEN
FRONTEND_URL
```

---

## 8. Configurar Webhooks

### Paso 8.1: Obtener URL del Webhook

Tu URL de webhook es:
```
https://TU_PROJECT_REF.supabase.co/functions/v1/mp-webhook-v2
```

Ejemplo:
```
https://abcdefghijklmnop.supabase.co/functions/v1/mp-webhook-v2
```

### Paso 8.2: Configurar Webhook en Mercado Pago

1. Ve a **Mercado Pago Developers** > **Tus integraciones**
2. Selecciona tu aplicación
3. Ve a **"Webhooks"** (en el menú lateral)
4. Haz clic en **"Configurar webhooks"**
5. Selecciona **"Notificaciones IPN"**
6. Completa:
   - **URL de producción**: `https://TU_PROJECT_REF.supabase.co/functions/v1/mp-webhook-v2`
   - **Eventos a notificar**: Selecciona:
     - ✅ `payment` (Pagos)
     - ✅ `subscription_preapproval` (Suscripciones)
     - ✅ `subscription_authorized_payment` (Cobros automáticos)

7. Haz clic en **"Guardar"**

### Paso 8.3: Obtener Webhook Secret

1. En la configuración de webhooks, copia el **"Secret"**
2. Configura el secret en Supabase:

```bash
supabase secrets set MP_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

### Paso 8.4: Probar el Webhook

Mercado Pago tiene una herramienta de testing:

1. En la configuración de webhooks, haz clic en **"Probar webhook"**
2. Mercado Pago enviará un evento de prueba
3. Ve a **Supabase Dashboard > Functions > mp-webhook-v2 > Logs**
4. Deberías ver el log de la prueba

---

## 9. Configurar Variables de Entorno

### Paso 9.1: Crear Archivo .env Local

En la raíz del proyecto, crea un archivo `.env`:

```bash
# Windows
copy .env.example .env

# O crea manualmente
```

### Paso 9.2: Completar Variables de Entorno

Abre `.env` y completa con tus credenciales:

```env
# ========================================
# TuMesaHoy - Variables de Entorno
# ========================================

# ------------------
# SUPABASE
# ------------------
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ------------------
# MERCADO PAGO
# ------------------
# Para desarrollo (Testing):
VITE_MP_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Para producción:
# VITE_MP_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

> ⚠️ **IMPORTANTE**: El archivo `.env` NO debe commitearse a Git (ya está en `.gitignore`)

---

## 10. Pruebas Finales

### Paso 10.1: Instalar Dependencias

```bash
npm install
```

### Paso 10.2: Levantar Servidor de Desarrollo

```bash
npm run dev
```

Deberías ver:
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Paso 10.3: Verificar Conexión a Supabase

1. Abre **http://localhost:5173**
2. Abre las **DevTools** (F12)
3. Ve a la pestaña **Console**
4. No deberías ver errores de conexión a Supabase

### Paso 10.4: Probar Registro de Usuario

1. Ve a **http://localhost:5173/signup**
2. Regístrate con un email de prueba
3. Verifica que:
   - El registro funciona
   - Recibes el email de verificación
   - Puedes iniciar sesión

### Paso 10.5: Probar Creación de Negocio

1. Inicia sesión
2. Ve a **http://localhost:5173/register**
3. Completa el formulario de creación de negocio
4. Verifica en **Supabase > Table Editor > businesses** que se creó el negocio

### Paso 10.6: Probar Sistema de Pagos (Modo Sandbox)

1. Después de crear un negocio, deberías ser redirigido a `/payment`
2. Haz clic en **"Continuar al pago"**
3. Serás redirigido a Mercado Pago
4. Usa **tarjetas de prueba**: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

**Tarjetas de prueba Argentina:**
- **Tarjeta aprobada**: `5031 7557 3453 0604` / Vencimiento: `11/25` / CVV: `123`
- **Tarjeta rechazada**: `5031 4332 1540 6351` / Vencimiento: `11/25` / CVV: `123`

5. Completa el pago con una tarjeta de prueba aprobada
6. Verifica que:
   - Eres redirigido de vuelta a tu app
   - El negocio se activa (`is_active = true`)
   - Se crea un registro en la tabla `payments`

### Paso 10.7: Verificar Webhooks

1. Después del pago de prueba, ve a **Supabase > Functions > mp-webhook-v2 > Logs**
2. Deberías ver logs del webhook procesado
3. También puedes ver en **Table Editor > webhook_logs** los eventos recibidos

### Paso 10.8: Probar Panel Administrativo

1. Ve a **http://localhost:5173/admin/tu-slug**
2. Verifica que puedes:
   - Ver el dashboard
   - Crear categorías de menú
   - Agregar items al menú
   - Subir imágenes
   - Configurar horarios
   - Ver reservas

### Paso 10.9: Probar Página Pública y Reservas

1. Ve a **http://localhost:5173/stores**
2. Busca tu negocio
3. Haz clic para ver la página pública
4. Verifica que:
   - Se muestra el menú correctamente
   - Los horarios aparecen
   - El formulario de reserva funciona
   - Las reservas se guardan en la base de datos

---

## ✅ Checklist Final

Antes de ir a producción, verifica:

### Supabase:
- ✅ Proyecto creado con cuenta empresarial
- ✅ Base de datos configurada (8 tablas)
- ✅ RLS policies activadas en todas las tablas
- ✅ Storage buckets creados (`business-images`, `menu-images`)
- ✅ Edge Functions desplegadas
- ✅ Secrets configurados

### Mercado Pago:
- ✅ Cuenta empresarial creada
- ✅ Aplicación creada
- ✅ Credenciales de producción obtenidas
- ✅ URLs de redirección configuradas
- ✅ Webhook configurado
- ✅ Webhook secret configurado

### Aplicación:
- ✅ Archivo `.env` configurado
- ✅ Dependencias instaladas
- ✅ Servidor de desarrollo funciona
- ✅ Registro de usuario funciona
- ✅ Creación de negocio funciona
- ✅ Sistema de pagos funciona (sandbox)
- ✅ Webhooks funcionan
- ✅ Panel admin funciona
- ✅ Página pública funciona
- ✅ Sistema de reservas funciona

---

## 🚀 Próximos Pasos: Deployment a Producción

Una vez que todo funcione en desarrollo:

1. **Cambiar a credenciales de producción**:
   - En `.env`, usar credenciales de producción de Mercado Pago
   - Actualizar secrets en Supabase con `MP_ACCESS_TOKEN` de producción

2. **Build de producción**:
   ```bash
   npm run build
   ```

3. **Deploy del frontend**:
   - Vercel: `vercel deploy --prod`
   - Netlify: `netlify deploy --prod`
   - O cualquier plataforma que uses

4. **Actualizar URLs**:
   - En Mercado Pago, actualizar URLs de redirección con tu dominio
   - En Supabase secrets, actualizar `FRONTEND_URL`

5. **Monitoreo**:
   - Monitorear logs de Edge Functions
   - Monitorear webhooks de Mercado Pago
   - Configurar alertas

---

## 📞 Soporte

Si encuentras problemas:
- Revisa los logs de Supabase Functions
- Revisa la tabla `webhook_logs`
- Revisa la consola del navegador
- Verifica las credenciales en el archivo `.env`

---

**¡Listo! 🎉 Tu plataforma TuMesaHoy está configurada y lista para funcionar.**
