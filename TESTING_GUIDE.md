# 🧪 Guía Completa de Testing - TuMesaHoy

Esta guía te llevará paso a paso por todo el flujo de la aplicación para verificar que funcione correctamente.

---

## 📋 Pre-requisitos

Antes de empezar, verificá que tengas:

- ✅ Node.js 18+ instalado
- ✅ Variables de entorno configuradas (`.env`)
- ✅ Supabase Edge Functions desplegadas
- ✅ Cuenta de Mercado Pago configurada
- ✅ Base de datos con tablas creadas

---

## 🚀 FASE 1: Verificación Inicial (5 minutos)

### 1.1 Verificar Dependencias

```bash
# Instalar dependencias si no lo hiciste
npm install

# Verificar que no haya errores
npm run lint
```

### 1.2 Iniciar Servidor de Desarrollo

```bash
npm run dev
```

**✅ Verificar:**
- El servidor inicia en `http://localhost:5173`
- No hay errores en la consola
- La terminal muestra "ready in XXXms"

### 1.3 Verificar Conexión con Supabase

Abrí el navegador y la consola de desarrollo (F12), luego ve a:
```
http://localhost:5173
```

**✅ Verificar:**
- La página carga sin errores 404
- No hay errores de CORS en la consola
- No hay errores de "SUPABASE_URL is undefined"

---

## 👤 FASE 2: Testing de Autenticación (10 minutos)

### 2.1 Crear Cuenta Nueva

1. **Ir a**: `http://localhost:5173/signup`

2. **Completar formulario:**
   - Email: `test@tumesahoy.com` (o cualquier email de prueba)
   - Contraseña: `Test123456!`
   - Confirmar contraseña: `Test123456!`

3. **Click en "Registrarse"**

**✅ Verificar:**
- Se redirige a `/register` (página de registro de negocio)
- Aparece un mensaje de bienvenida o formulario de negocio
- No hay errores en consola

**❌ Si falla:**
- Revisar consola del navegador
- Verificar que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén en `.env`
- Verificar que la tabla `auth.users` exista en Supabase

### 2.2 Cerrar Sesión y Login

1. **Cerrar sesión** (botón en navbar si está implementado)
2. **Ir a**: `http://localhost:5173/login`
3. **Completar:**
   - Email: `test@tumesahoy.com`
   - Contraseña: `Test123456!`

**✅ Verificar:**
- Se inicia sesión correctamente
- Se redirige al dashboard o home
- El navbar muestra que estás logueado

---

## 🏪 FASE 3: Testing de Registro de Negocio (15 minutos)

### 3.1 Crear Nuevo Negocio

1. **Ir a**: `http://localhost:5173/register`

2. **Completar formulario:**
   ```
   Nombre del negocio: La Parrilla de Test
   Categoría: Parrilla
   Nombre del dueño: Juan Pérez
   Email: contacto@parrilladetest.com
   Teléfono: +54 9 11 1234-5678
   Dirección: Av. Corrientes 1234, CABA
   Descripción: La mejor parrilla para testing de TuMesaHoy
   ```

3. **Click en "Registrar Negocio"**

**✅ Verificar:**
- Se genera un slug automático (ej: "la-parrilla-de-test")
- Se redirige a `/payment` con el business_id en la URL
- El negocio se crea en la base de datos con `is_active: false`

**🔍 Verificar en Base de Datos (Opcional):**

Podés verificar en Supabase Dashboard > Table Editor > businesses:
- El negocio aparece con `subscription_status: 'inactive'`
- El `is_active` es `false`
- El `user_id` coincide con tu usuario

### 3.2 Probar Generación de Slug

Intentá crear otro negocio con el mismo nombre:

**✅ Verificar:**
- Se genera un slug único (ej: "la-parrilla-de-test-1")
- No hay errores de duplicación

---

## 💳 FASE 4: Testing de Pagos (20 minutos)

### 4.1 Crear Preferencia de Pago

Deberías estar en: `http://localhost:5173/payment?business_id=XXX`

**✅ Verificar:**
- Se muestra un botón de "Pagar con Mercado Pago"
- El botón tiene el logo de MP
- Al hacer click, te redirige al checkout de Mercado Pago

**❌ Si falla:**
- Abrir consola del navegador
- Buscar errores de red (pestaña Network)
- Verificar que la Edge Function `create-payment` esté desplegada
- Verificar que `MP_ACCESS_TOKEN` esté configurado en Supabase

### 4.2 Completar Pago con Tarjeta de Prueba

#### 🔴 IMPORTANTE: Modo Sandbox vs Producción

**Estás usando credenciales de PRODUCCIÓN** (`APP_USR-...`). Esto significa:

**Opción A: Testing en PRODUCCIÓN (real)**
- Vas a tener que hacer un pago REAL con dinero real
- El monto es de **$5 ARS** (según el código)
- Usar tu tarjeta real para probar

**Opción B: Cambiar a SANDBOX (recomendado para testing)**

1. Ir a: https://www.mercadopago.com.ar/developers
2. Ir a: **Tus aplicaciones** > Tu app
3. Cambiar a **"Credenciales de Prueba"**
4. Copiar la **Public Key de TEST**
5. Actualizar `.env`:
   ```bash
   VITE_MP_PUBLIC_KEY=TEST-xxxxx-xxxxxx-xxxxx
   ```
6. Actualizar secret en Supabase:
   ```bash
   # Ir a Supabase Dashboard > Edge Functions > Secrets
   # Actualizar MP_ACCESS_TOKEN con el Access Token de TEST
   ```

#### Tarjetas de Prueba (Solo para SANDBOX):

```
✅ VISA APROBADA:
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Nombre: APRO
DNI: 12345678

❌ VISA RECHAZADA:
Número: 4074 0003 2927 3010
CVV: 123
Vencimiento: 11/25
Nombre: OTHE
DNI: 12345678

⏳ VISA PENDIENTE:
Número: 4009 1753 8923 0001
CVV: 123
Vencimiento: 11/25
Nombre: CALL
DNI: 12345678
```

### 4.3 Completar el Pago

1. **En el checkout de Mercado Pago:**
   - Completar datos de la tarjeta
   - Completar datos personales
   - Click en "Pagar"

2. **Esperar redirección**

**✅ Verificar:**
- Mercado Pago procesa el pago
- Te redirige a `/admin/[slug]` (si fue aprobado)
- O te redirige a `/payment/failure` (si fue rechazado)
- O te redirige a `/payment/pending` (si quedó pendiente)

### 4.4 Verificar Activación del Negocio

**✅ Verificar en Base de Datos:**

1. Ir a: Supabase Dashboard > Table Editor > **businesses**
2. Buscar tu negocio
3. Verificar:
   - `is_active: true` ✅
   - `subscription_status: 'active'` ✅
   - `is_accepting_reservations: true` ✅

4. Ir a: Table Editor > **payments**
5. Verificar:
   - Existe un registro con tu `mp_payment_id`
   - `status: 'approved'`
   - `amount: 5` (o el monto configurado)

**🔍 Verificar Webhook:**

1. Ir a: Supabase Dashboard > Edge Functions > Logs
2. Buscar logs de `mp-webhook`
3. Verificar:
   - "✅ Firma del webhook validada correctamente"
   - "✅ Pago aprobado - Activando negocio"
   - "🎉 Negocio activado exitosamente"

---

## 🎛️ FASE 5: Testing del Panel de Administración (30 minutos)

### 5.1 Acceder al Panel

**Ir a**: `http://localhost:5173/admin/la-parrilla-de-test`

**✅ Verificar:**
- Carga el panel de administración
- Ves las tabs: Analytics, Menú, Horarios, Reservas, Configuración
- No hay errores en consola

### 5.2 Testing de MENÚ

#### A. Crear Categoría

1. **Ir a tab "Menú"**
2. **Click en "Agregar Categoría"**
3. **Completar:**
   - Nombre: "Entradas"
4. **Guardar**

**✅ Verificar:**
- La categoría aparece en la lista
- Se puede expandir/colapsar

#### B. Crear Items de Menú

1. **Dentro de "Entradas", click en "Agregar Item"**
2. **Completar:**
   ```
   Nombre: Empanadas de Carne
   Descripción: Empanadas criollas caseras
   Precio: 2500
   ```
3. **Subir imagen** (opcional)
4. **Guardar**

**✅ Verificar:**
- El item aparece en la categoría
- El precio se formatea correctamente ($2.500 ARS)
- La imagen se sube y se muestra (si la subiste)
- Se puede editar y eliminar

#### C. Crear más items

Creá al menos 3 items más para tener contenido:

```
Categoría: Entradas
- Provoleta
- Chorizo Criollo

Categoría: Carnes (crear nueva)
- Bife de Chorizo
- Asado de Tira
- Vacío

Categoría: Bebidas (crear nueva)
- Coca Cola
- Agua Mineral
- Vino de la Casa
```

**✅ Verificar:**
- Todas las categorías e items se muestran correctamente
- Se pueden reordenar (si está implementado el drag & drop)
- Las imágenes se muestran en Supabase Storage

### 5.3 Testing de HORARIOS

1. **Ir a tab "Horarios"**
2. **Configurar horarios:**

   ```
   Lunes: 12:00 - 15:00 y 19:00 - 23:00
   Martes: Cerrado ❌
   Miércoles a Domingo: 12:00 - 15:00 y 19:00 - 00:00
   ```

3. **Guardar cambios**

**✅ Verificar:**
- Los horarios se guardan correctamente
- Los días cerrados se marcan como "Cerrado"
- Los cambios persisten al recargar la página

### 5.4 Testing de ANALYTICS

1. **Ir a tab "Analytics"**

**✅ Verificar:**
- Se muestran las métricas:
  - Total de reservas: 0 (por ahora)
  - Total de personas: 0
  - Horarios populares: (vacío)
  - Estadísticas del menú
- No hay errores al cargar

### 5.5 Testing de CONFIGURACIÓN

1. **Ir a tab "Configuración"**
2. **Probar:**
   - Editar información del negocio
   - Cambiar descripción
   - Actualizar imagen de portada

**✅ Verificar:**
- Los cambios se guardan
- La imagen de portada se actualiza
- El QR code se genera correctamente

---

## 🌐 FASE 6: Testing de Página Pública (20 minutos)

### 6.1 Verificar Listado de Negocios

**Ir a**: `http://localhost:5173/stores`

**✅ Verificar:**
- Tu negocio aparece en la lista
- Se muestra la información básica (nombre, categoría, descripción)
- La imagen de portada se muestra (si la subiste)
- Hay un botón "Ver Menú" o similar

### 6.2 Ver Página Pública del Negocio

**Click en tu negocio** o **ir a**: `http://localhost:5173/negocio/la-parrilla-de-test`

**✅ Verificar:**
- Se carga la página pública
- Se muestra el menú completo con categorías
- Las imágenes de los items se muestran
- Los precios están formateados correctamente
- Se muestran los horarios de atención
- Hay un botón de WhatsApp
- Hay un código QR descargable

### 6.3 Descargar QR Code

1. **Click en "Descargar QR"**

**✅ Verificar:**
- Se descarga un archivo PNG
- El QR code es válido (probalo con un lector de QR)
- Al escanear, redirige a la página pública

---

## 📅 FASE 7: Testing de Reservas (30 minutos)

### 7.1 Crear Reserva desde Página Pública

**Estando en**: `http://localhost:5173/negocio/la-parrilla-de-test`

1. **Buscar el formulario de reserva**
2. **Completar:**
   ```
   Nombre: María González
   Teléfono: +54 9 11 9876-5432
   Fecha: [Mañana]
   Hora: 20:00
   Cantidad de personas: 4
   Mensaje: Mesa cerca de la ventana por favor
   ```

3. **Click en "Reservar"**

**✅ Verificar:**
- Aparece un mensaje de éxito
- No hay errores en consola
- El formulario se limpia o muestra confirmación

**❌ Posibles errores:**
- "RLS Policy Violation" → Las políticas de seguridad no permiten crear reservas
  - **Solución**: Ejecutar `fix-reservations-policies.sql`
- "Column 'number_of_people' doesn't exist" → Nombre de columna incorrecto
  - **Solución**: Ejecutar `fix-reservations-people-count.sql`

### 7.2 Verificar Reserva en Panel Admin

1. **Ir a**: `http://localhost:5173/admin/la-parrilla-de-test`
2. **Ir a tab "Reservas"**

**✅ Verificar:**
- La reserva aparece en la lista
- Estado: "Pendiente" (amarillo)
- Muestra todos los datos: nombre, teléfono, fecha, hora, personas, mensaje

### 7.3 Gestionar Estados de Reserva

**Probar cambios de estado:**

1. **Confirmar reserva:**
   - Click en "Confirmar"
   - ✅ Verifica: Estado cambia a "Confirmada" (verde)

2. **Completar reserva:**
   - Click en "Completar"
   - ✅ Verifica: Estado cambia a "Completada" (azul/gris)

3. **Crear otra reserva y cancelarla:**
   - Crear nueva reserva
   - Click en "Cancelar"
   - ✅ Verifica: Estado cambia a "Cancelada" (rojo)

### 7.4 Testing de Realtime

**Prueba de actualizaciones en tiempo real:**

1. **Abrir 2 ventanas del navegador:**
   - Ventana A: Panel admin (`/admin/la-parrilla-de-test`)
   - Ventana B: Página pública (`/negocio/la-parrilla-de-test`)

2. **En Ventana B:** Crear una nueva reserva

3. **En Ventana A:** Observar

**✅ Verificar:**
- La nueva reserva aparece **automáticamente** en la lista sin recargar
- Esto confirma que Supabase Realtime funciona

### 7.5 Testing de WhatsApp

1. **En el panel admin, click en el ícono de WhatsApp** junto a una reserva

**✅ Verificar:**
- Se abre WhatsApp Web (o la app)
- El número es correcto
- Hay un mensaje pre-escrito con la información de la reserva

---

## 🔍 FASE 8: Testing de Búsqueda y Filtros (10 minutos)

### 8.1 Testing en Página de Stores

**Ir a**: `http://localhost:5173/stores`

1. **Probar búsqueda:**
   - Escribir "parrilla" en el buscador
   - ✅ Verifica: Tu negocio aparece

2. **Probar filtro por categoría:**
   - Seleccionar "Parrilla"
   - ✅ Verifica: Solo aparecen parrillas

3. **Probar sin resultados:**
   - Buscar algo que no existe: "xyz123"
   - ✅ Verifica: Mensaje "No se encontraron negocios"

---

## 📊 FASE 9: Verificar Analytics (5 minutos)

**Ir a**: `http://localhost:5173/admin/la-parrilla-de-test` → Tab "Analytics"

**✅ Verificar que se muestren:**
- Total de reservas: (número correcto según las que creaste)
- Reservas por estado:
  - Pendientes: X
  - Confirmadas: X
  - Completadas: X
  - Canceladas: X
- Total de personas: (suma de todas las reservas)
- Estadísticas del menú:
  - Total de categorías: 3
  - Total de items: ~8
- Horarios más populares (si hay datos suficientes)

---

## 🔐 FASE 10: Testing de Seguridad (15 minutos)

### 10.1 Verificar Autorización

**Test 1: Intentar acceder a panel de otro negocio**

1. Copiar el slug de tu negocio: `la-parrilla-de-test`
2. Cambiar la URL manualmente: `/admin/negocio-falso-123`

**✅ Verificar:**
- Te redirige al home o muestra error 404
- NO puedes ver el panel de un negocio que no es tuyo

**Test 2: Intentar activar negocio sin pagar**

1. Cerrar sesión
2. Crear nuevo usuario y negocio
3. Intentar ir directamente a `/admin/[nuevo-slug]`

**✅ Verificar:**
- No puedes acceder si el negocio no está activo
- Te redirige a `/payment`

### 10.2 Verificar Validación de Webhooks

**Ir a**: Supabase Dashboard > Edge Functions > Logs > `mp-webhook`

**✅ Verificar en los logs:**
- "✅ Firma del webhook validada correctamente"
- NO debe haber: "⚠️ Webhook recibido SIN validación de firma"

Si ves la advertencia, significa que `MP_WEBHOOK_SECRET` no está configurado correctamente.

### 10.3 Verificar CORS

**Abrir consola del navegador (F12) y ejecutar:**

```javascript
// Intento de CORS desde un origen no permitido
fetch('https://dcagmqhokjcvvilvyigp.supabase.co/functions/v1/create-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://sitio-malicioso.com'
  },
  body: JSON.stringify({ businessId: 'test' })
})
```

**✅ Verificar:**
- El request es bloqueado por CORS
- Consola muestra error de CORS

---

## ✅ CHECKLIST FINAL

Usá este checklist para verificar que todo funcione:

### Autenticación
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Sesión persiste al recargar

### Registro de Negocio
- [ ] Formulario de registro funciona
- [ ] Slug se genera automáticamente
- [ ] Slugs duplicados se manejan correctamente
- [ ] Negocio se crea con estado inactivo

### Pagos
- [ ] Botón de Mercado Pago aparece
- [ ] Redirige al checkout de MP
- [ ] Pago se procesa correctamente
- [ ] Webhook activa el negocio
- [ ] Registro de pago se crea en BD

### Panel de Administración
- [ ] Acceso solo al dueño del negocio
- [ ] Tab de Analytics muestra datos
- [ ] Tab de Menú permite CRUD completo
- [ ] Subida de imágenes funciona
- [ ] Tab de Horarios guarda cambios
- [ ] Tab de Reservas muestra lista
- [ ] Cambio de estados funciona
- [ ] Tab de Configuración permite editar

### Página Pública
- [ ] Listado de negocios muestra activos
- [ ] Búsqueda funciona
- [ ] Filtros funcionan
- [ ] Página individual carga
- [ ] Menú se muestra correctamente
- [ ] Código QR se genera
- [ ] Botón de WhatsApp funciona

### Reservas
- [ ] Formulario de reserva funciona
- [ ] Validaciones se aplican
- [ ] Reserva se crea en BD
- [ ] Aparece en panel admin
- [ ] Estados se actualizan
- [ ] Realtime funciona (actualización automática)
- [ ] WhatsApp directo funciona

### Seguridad
- [ ] Autorización de panel funciona
- [ ] Webhook valida firma correctamente
- [ ] CORS está restringido
- [ ] RLS policies funcionan

---

## 🐛 Troubleshooting Común

### Error: "Failed to fetch"
- Verificar que las Edge Functions estén desplegadas
- Verificar que los secrets estén configurados en Supabase
- Verificar CORS en las funciones

### Error: "RLS Policy Violation"
- Ejecutar todos los scripts SQL en orden
- Verificar que las políticas existan en Supabase
- Verificar que el usuario esté autenticado

### Imágenes no se suben
- Verificar que los buckets sean públicos
- Verificar MIME types permitidos
- Verificar tamaño máximo (5 MB)

### Reservas no se crean
- Ejecutar `fix-reservations-people-count.sql`
- Ejecutar `fix-reservations-policies.sql`
- Verificar que la tabla tenga todos los campos

### Webhook no activa el negocio
- Verificar logs de Edge Function
- Verificar `MP_WEBHOOK_SECRET` configurado
- Verificar URL del webhook en Mercado Pago Dashboard
- Verificar que el webhook esté activo

---

## 📝 Reporte de Testing

Después de completar todos los tests, completá este reporte:

```
FECHA: _______________
TESTER: _______________

RESULTADOS:

✅ AUTENTICACIÓN:        [ PASS / FAIL ]
✅ REGISTRO NEGOCIO:     [ PASS / FAIL ]
✅ PAGOS:                [ PASS / FAIL ]
✅ PANEL ADMIN:          [ PASS / FAIL ]
✅ PÁGINA PÚBLICA:       [ PASS / FAIL ]
✅ RESERVAS:             [ PASS / FAIL ]
✅ REALTIME:             [ PASS / FAIL ]
✅ SEGURIDAD:            [ PASS / FAIL ]

ERRORES ENCONTRADOS:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

NOTAS:
___________________________________________________
___________________________________________________
```

---

## 🎉 ¡Testing Completo!

Si todos los tests pasaron, tu aplicación está lista para producción.

**Próximos pasos recomendados:**
1. Configurar dominio personalizado
2. Configurar SSL/HTTPS
3. Configurar monitoring (Sentry, LogRocket)
4. Crear backups automáticos de BD
5. Documentar procesos de deployment
6. Crear plan de mantenimiento
