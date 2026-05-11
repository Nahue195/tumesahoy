# 🚀 Guía de Configuración - TuMesaHoy

Esta guía te ayudará a configurar completamente la aplicación TuMesaHoy desde cero.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración de Supabase](#configuración-de-supabase)
3. [Configuración de Mercado Pago](#configuración-de-mercado-pago)
4. [Variables de Entorno](#variables-de-entorno)
5. [Instalación Local](#instalación-local)
6. [Deployment](#deployment)
7. [Testing](#testing)

---

## 📦 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase (gratuita)
- Cuenta de Mercado Pago (vendedor)
- Git instalado

---

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto

1. Ir a [https://supabase.com](https://supabase.com)
2. Crear nueva organización (si no tienes)
3. Crear nuevo proyecto
   - Nombre: `tumesahoy`
   - Password: (anotar para uso futuro)
   - Región: South America (sao-paulo) o la más cercana

### 2. Ejecutar Scripts SQL

Ve a **SQL Editor** en el dashboard de Supabase y ejecuta los siguientes scripts **en orden**:

#### A. Schema Principal
```bash
# Archivo: supabase-setup.sql
```
Copia y pega todo el contenido del archivo `supabase-setup.sql` y ejecuta.

#### B. Sistema de Suscripciones
```bash
# Archivo: supabase-subscriptions.sql
```
Copia y pega todo el contenido del archivo `supabase-subscriptions.sql` y ejecuta.

#### C. Fix del Campo people_count
```bash
# Archivo: fix-reservations-people-count.sql
```
Ejecuta este script para renombrar `number_of_people` a `people_count`.

### 3. Configurar Storage Buckets

1. Ir a **Storage** en el dashboard
2. Crear dos buckets públicos:

**Bucket 1: business-images**
- Nombre: `business-images`
- Público: ✅ Activado
- Allowed MIME types: `image/*`
- Max file size: 5 MB

**Bucket 2: menu-images**
- Nombre: `menu-images`
- Público: ✅ Activado
- Allowed MIME types: `image/*`
- Max file size: 5 MB

### 4. Obtener Credenciales

1. Ir a **Settings > API**
2. Copiar:
   - **Project URL**: `VITE_SUPABASE_URL`
   - **anon public key**: `VITE_SUPABASE_ANON_KEY`
   - **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` (para Edge Functions)

---

## 💳 Configuración de Mercado Pago

### 1. Crear Cuenta de Vendedor

1. Ir a [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. Crear cuenta o iniciar sesión
3. Ir a **Tus aplicaciones**
4. Crear nueva aplicación
   - Nombre: `TuMesaHoy`
   - Tipo: Pagos online y QR

### 2. Obtener Credenciales de Producción

1. Dentro de tu aplicación, ir a **Credenciales de Producción**
2. Copiar:
   - **Public Key**: `VITE_MP_PUBLIC_KEY`
   - **Access Token**: `MP_ACCESS_TOKEN`

### 3. Configurar Webhooks (IPN)

1. En tu aplicación de Mercado Pago, ir a **Webhooks**
2. Agregar nueva URL:
   ```
   https://[TU_PROJECT_REF].supabase.co/functions/v1/mp-webhook
   ```
3. Eventos a escuchar:
   - ✅ Pagos
   - ✅ Reembolsos
4. Guardar

**Nota:** Reemplaza `[TU_PROJECT_REF]` con el ID de tu proyecto de Supabase.

---

## ⚙️ Variables de Entorno

### Frontend (.env)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Supabase
VITE_SUPABASE_URL=https://[TU_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Mercado Pago
VITE_MP_PUBLIC_KEY=tu_public_key_aqui
```

### Edge Functions (Supabase Dashboard)

Ve a **Settings > Edge Functions > Secrets** y agrega:

```bash
MP_ACCESS_TOKEN=tu_access_token_aqui
SUPABASE_URL=https://[TU_PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

---

## 💻 Instalación Local

### 1. Clonar el Repositorio

```bash
git clone [url-del-repo]
cd TuMesaHoy
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia `.env.example` a `.env` y completa con tus credenciales:

```bash
cp .env.example .env
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🚀 Deployment de Edge Functions

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login en Supabase

```bash
supabase login
```

### 3. Link con tu Proyecto

```bash
supabase link --project-ref [TU_PROJECT_REF]
```

### 4. Deploy de Edge Functions

```bash
# Deploy función create-payment
supabase functions deploy create-payment

# Deploy función mp-webhook
supabase functions deploy mp-webhook
```

### 5. Verificar Deployment

```bash
supabase functions list
```

---

## 🌐 Deployment Frontend

### Opción A: Vercel (Recomendado)

1. Instalar Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Configurar variables de entorno en Vercel Dashboard
4. Agregar las mismas variables del archivo `.env`

### Opción B: Netlify

1. Conectar repositorio en Netlify Dashboard
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno

---

## 🧪 Testing

### Flujo Completo de Testing

#### 1. Test de Registro
```bash
# Navegar a /signup
# Crear cuenta con email de prueba
# Verificar redirección a /register
```

#### 2. Test de Creación de Negocio
```bash
# Completar formulario de registro
# Verificar generación de slug único
# Verificar redirección a /payment
```

#### 3. Test de Pago (Sandbox)

**Para usar modo sandbox de Mercado Pago:**

1. Ir a Mercado Pago Developers
2. Usar **credenciales de prueba** en lugar de producción
3. Usar tarjetas de prueba:

```
VISA aprobada: 4509 9535 6623 3704
Código: 123
Fecha: 11/25
DNI: 12345678
```

4. Verificar:
   - ✅ Redirección correcta después de pago
   - ✅ Negocio se activa en la base de datos
   - ✅ Webhook recibe notificación

#### 4. Test de Panel Admin
```bash
# Login con cuenta creada
# Verificar acceso a /admin/[slug]
# Test crear categorías de menú
# Test crear items de menú
# Test subir imágenes
# Test configurar horarios
```

#### 5. Test de Página Pública
```bash
# Navegar a /negocio/[slug]
# Verificar visualización de menú
# Test crear reserva
# Verificar en panel admin
```

#### 6. Test de Reservas
```bash
# Crear reserva desde página pública
# Verificar aparece en admin
# Test cambiar estado (confirmar, cancelar, completar)
# Test enlace directo a WhatsApp
```

---

## 🔍 Verificación de Configuración

### Checklist Completo

**Supabase:**
- ✅ Proyecto creado
- ✅ Scripts SQL ejecutados
- ✅ Buckets de storage creados
- ✅ Credenciales copiadas
- ✅ Edge Functions desplegadas
- ✅ Secrets configurados

**Mercado Pago:**
- ✅ Aplicación creada
- ✅ Credenciales obtenidas
- ✅ Webhook configurado
- ✅ Modo sandbox testeado

**Aplicación:**
- ✅ Variables de entorno configuradas
- ✅ Dependencias instaladas
- ✅ Build exitoso
- ✅ Deployment completado

---

## 🐛 Troubleshooting

### Error: "MP_ACCESS_TOKEN no configurado"
**Solución:** Agregar secret en Supabase Edge Functions

### Error: "Failed to fetch"
**Solución:** Verificar CORS en Edge Functions y que las URLs sean correctas

### Error: RLS Policy Violation
**Solución:** Verificar que las políticas RLS estén creadas correctamente

### Reservas no se crean
**Solución:** Ejecutar `fix-reservations-people-count.sql` para unificar campo

### Imágenes no se suben
**Solución:** Verificar que los buckets sean públicos y con los MIME types correctos

---

## 📞 Soporte

Si tenés problemas con la configuración, contactá por:
- Email: soporte@tumesahoy.com
- WhatsApp: +54 9 11 XXXX-XXXX

---

## 📄 Licencia

Todos los derechos reservados © 2025 TuMesaHoy
