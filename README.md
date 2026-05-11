# 🍽️ TuMesaHoy

> Plataforma SaaS completa para gestión de negocios gastronómicos con sistema de reservas, menú digital y pagos integrados.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![License](https://img.shields.io/badge/license-proprietary-red.svg)

---

## 🚀 Características Principales

### Para Negocios
- 📱 **Página web personalizada** con dominio propio (`/negocio/tu-slug`)
- 🍽️ **Menú digital** con imágenes, categorías y precios
- 📅 **Sistema de reservas** en tiempo real
- 📊 **Panel de administración** completo con analytics
- ⏰ **Gestión de horarios** de atención
- 📱 **Código QR** descargable para compartir
- 💬 **Integración con WhatsApp** directa
- 🖼️ **Galería de imágenes** para productos

### Para Clientes
- 🔍 **Búsqueda y filtrado** de negocios
- 📖 **Visualización de menú** con fotos
- 🎫 **Reservas fáciles** sin registro
- 📍 **Mapa y ubicación** del negocio
- ⏰ **Horarios de atención** actualizados

### Técnicas
- ⚡ **Performance optimizada** con code splitting
- 🔐 **Seguridad** con Row Level Security (RLS)
- 💳 **Pagos seguros** con Mercado Pago
- 🔄 **Actualizaciones en tiempo real** con Supabase Realtime
- 📱 **Responsive design** mobile-first
- 🎨 **UI moderna** con Tailwind CSS y Framer Motion

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool y dev server
- **React Router 7** - Enrutamiento
- **TailwindCSS** - Estilos
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos
- **QRCode.react** - Generación de QR

### Backend & Servicios
- **Supabase** - BaaS (Auth, Database, Storage)
- **PostgreSQL** - Base de datos
- **Supabase Edge Functions** - Serverless functions (Deno)
- **Mercado Pago** - Procesamiento de pagos

---

## 📦 Estructura del Proyecto

```
TuMesaHoy/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── AdminAnalyticsSection.jsx
│   │   ├── AdminHoursSection.jsx
│   │   ├── AdminMenuSection.jsx
│   │   ├── AdminReservationsSection.jsx
│   │   ├── Footer.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── Navbar.jsx
│   ├── pages/              # Páginas de la app
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignUpPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── StoresPage.jsx
│   │   ├── BusinessPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── PaymentPage.jsx
│   │   ├── PaymentSuccessPage.jsx
│   │   ├── PaymentPendingPage.jsx
│   │   └── PaymentFailurePage.jsx
│   ├── lib/                # Configuraciones y utilidades
│   │   ├── supabaseClient.js
│   │   └── mercadoPago.js
│   ├── data/               # Datos mock (desarrollo)
│   ├── App.jsx             # Componente raíz
│   ├── index.css           # Estilos globales
│   └── main.jsx            # Entry point
├── supabase/
│   └── functions/          # Edge Functions
│       ├── create-payment/
│       └── mp-webhook/
├── public/                 # Assets estáticos
├── supabase-setup.sql      # Schema principal
├── supabase-subscriptions.sql  # Sistema de pagos
├── fix-*.sql              # Scripts de migración
├── SETUP.md               # Guía de configuración completa
├── package.json
├── vite.config.js
├── tailwind.config.cjs
└── .env.example
```

---

## 🏁 Quick Start

### 1. Clonar y configurar

```bash
# Clonar repositorio
git clone [url-del-repo]
cd TuMesaHoy

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### 2. Configurar Supabase

Seguí la guía completa en [`SETUP.md`](./SETUP.md) para:
- Crear proyecto en Supabase
- Ejecutar scripts SQL
- Configurar storage buckets
- Desplegar Edge Functions

### 3. Iniciar desarrollo

```bash
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🗄️ Base de Datos

### Tablas Principales

```sql
businesses           # Negocios registrados
  ├── menu_categories     # Categorías del menú
  │   └── menu_items      # Items del menú
  ├── business_hours      # Horarios de atención
  ├── reservations        # Reservas de clientes
  ├── subscriptions       # Suscripciones activas
  └── payments           # Historial de pagos
```

### Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:
- ✅ Los clientes pueden ver negocios activos
- ✅ Los clientes pueden crear reservas
- ✅ Los dueños solo ven/modifican sus propios datos
- ✅ Las suscripciones solo las maneja el service role

---

## 💳 Sistema de Pagos

### Flujo de Pago

1. **Usuario registra negocio** → `subscription_status: 'inactive'`
2. **Redirección a PaymentPage** → Crea preferencia en MP
3. **Usuario paga en Mercado Pago** → Webhook notifica
4. **Edge Function procesa webhook** → Activa negocio
5. **Negocio activado** → `subscription_status: 'active'`

### Webhooks

- **URL**: `https://[project-ref].supabase.co/functions/v1/mp-webhook`
- **Eventos**: `payment`
- **Handler**: `supabase/functions/mp-webhook/index.ts`

---

## 🧪 Testing

### Modo Desarrollo (Sandbox MP)

```bash
# Usar credenciales de prueba de Mercado Pago
# Tarjeta de prueba aprobada:
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
```

### Test Checklist

- [ ] Registro de usuario
- [ ] Creación de negocio
- [ ] Flujo de pago completo
- [ ] Activación de negocio
- [ ] CRUD de menú
- [ ] Configuración de horarios
- [ ] Creación de reservas
- [ ] Gestión de reservas (admin)
- [ ] Generación de QR
- [ ] Página pública del negocio

---

## 📚 Rutas de la Aplicación

### Públicas
```
/                    → Landing page
/stores             → Lista de negocios
/negocio/:slug      → Página pública del negocio
/login              → Inicio de sesión
/signup             → Registro de usuario
```

### Privadas (Requieren autenticación)
```
/register           → Registrar negocio
/payment            → Procesar pago
/payment/success    → Pago exitoso
/payment/pending    → Pago pendiente
/payment/failure    → Pago fallido
/admin/:slug        → Panel de administración
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en Vercel Dashboard
```

### Edge Functions (Supabase)

```bash
# Instalar Supabase CLI
npm i -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref [TU_PROJECT_REF]

# Deploy funciones
supabase functions deploy create-payment
supabase functions deploy mp-webhook
```

---

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Ejecutar ESLint
```

---

## 📊 Métricas y Analytics

El panel de administración incluye:

- 📈 **Total de reservas** (pendientes, confirmadas, completadas, canceladas)
- 👥 **Total de personas** atendidas
- ⏰ **Horarios más populares** para reservas
- 🍽️ **Estadísticas del menú** (categorías, items)
- 📊 **Tasa de conversión** de reservas
- 🔔 **Actividad reciente**

---

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "MP_ACCESS_TOKEN no configurado"**
- Solución: Configurar secret en Supabase Edge Functions

**Error: RLS Policy Violation**
- Solución: Verificar que los scripts SQL se ejecutaron correctamente

**Reservas no se guardan**
- Solución: Ejecutar `fix-reservations-people-count.sql`

**Imágenes no se suben**
- Solución: Verificar que los buckets sean públicos

Más información en [`SETUP.md`](./SETUP.md)

---

## 🤝 Contribución

Este es un proyecto privado. Para reportar bugs o sugerir mejoras, contactar al equipo de desarrollo.

---

## 📄 Licencia

© 2025 TuMesaHoy. Todos los derechos reservados.

Este software es propietario y confidencial. No está permitida su distribución, copia o uso sin autorización explícita.

---

## 👥 Equipo

Desarrollado con ❤️ para digitalizar negocios gastronómicos en Argentina.

---

## 📞 Soporte

- 📧 Email: soporte@tumesahoy.com
- 💬 WhatsApp: +54 9 11 XXXX-XXXX
- 🌐 Web: https://tumesahoy.com

---

**¿Listo para digitalizar tu negocio? 🚀**
