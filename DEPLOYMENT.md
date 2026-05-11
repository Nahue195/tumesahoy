# 🚀 Guía de Deployment - TuMesaHoy

## ✅ Build Completado

El build de producción está listo en la carpeta `dist/`

---

## 📦 Qué subir a Hostinger

**Subir TODO el contenido de la carpeta `dist/`:**
- `index.html`
- `.htaccess` (para routing del SPA - ya incluido)
- `favicon.ico` (ícono del sitio)
- Carpeta `assets/` (con todos los archivos CSS y JS)
- Cualquier otro archivo dentro de `dist/`

---

## 🌐 Pasos para subir a Hostinger

### Opción 1: Via FTP (Recomendado)

1. **Conectar via FTP:**
   - Host: `ftp.tudominio.com` (lo ves en el panel de Hostinger)
   - Usuario: tu usuario FTP de Hostinger
   - Puerto: 21

2. **Subir archivos:**
   - Ir a la carpeta `public_html/` (o la carpeta de tu dominio)
   - **IMPORTANTE:** ELIMINAR todo lo que esté ahí primero
   - Subir TODO el contenido de la carpeta `dist/`
   - Esperar a que se suban todos los archivos

### Opción 2: Via Panel de Hostinger

1. Ir a **File Manager** en tu panel de Hostinger
2. Navegar a `public_html/`
3. Eliminar archivos anteriores
4. Subir todo el contenido de `dist/`

---

## ⚙️ Configurar Variables de Entorno

**IMPORTANTE:** Necesitás configurar las variables de entorno en Hostinger.

### En el Panel de Hostinger:

1. Ve a **Advanced > PHP Configuration** o **Variables de Entorno**
2. Agrega estas variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://tu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Mercado Pago
VITE_MP_PUBLIC_KEY=tu_public_key_aqui
```

**NOTA:** Si Hostinger no soporta variables de entorno para apps estáticas, necesitarás:
- Usar Vercel, Netlify o similar (más recomendado para React)
- O crear un archivo `.env.production` local ANTES del build

---

## 🔄 Si necesitás hacer cambios

1. Hacer los cambios en el código
2. Correr `npm run build`
3. Volver a subir el contenido de `dist/` a Hostinger

---

## ⚠️ Problemas Comunes

### La página muestra "404" en rutas como /login, /stores, etc.

**Solución:** Verificá que el archivo `.htaccess` se haya subido correctamente

El archivo `.htaccess` ya está incluido en la carpeta `dist/` y debería haberse subido con el resto de los archivos. Si el problema persiste:

1. Verificá que el archivo `.htaccess` esté en `public_html/`
2. Verificá que empiece con un punto (`.htaccess`)
3. En algunos servidores puede estar oculto - activá "mostrar archivos ocultos" en el File Manager

### La página carga pero no funciona

- Verificá que las variables de entorno estén configuradas
- Abrí la consola del navegador (F12) y fijate si hay errores
- Verificá que todos los archivos de `dist/assets/` se hayan subido correctamente

---

## 🎯 Alternativa Recomendada: Vercel (Más Fácil)

Hostinger es para sitios estáticos tradicionales. Para React, **Vercel es mejor**:

1. Pushear código a GitHub
2. Conectar Vercel a tu repositorio
3. Configurar variables de entorno en Vercel
4. Deploy automático ✨

**Ventajas:**
- Deploy automático en cada commit
- Variables de entorno fáciles de configurar
- SSL gratis
- CDN global
- Sin problemas de routing

---

## 📝 Checklist Pre-Deploy

- [ ] Build completado sin errores
- [ ] Variables de entorno configuradas
- [ ] Archivo .env NO subido al repositorio
- [ ] Probado localmente con `npm run build && npm run preview`
- [ ] URLs de Supabase correctas (producción, no desarrollo)
- [ ] Credenciales de Mercado Pago correctas (producción)

---

## 🆘 Soporte

Si tenés problemas:
1. Revisá la consola del navegador (F12)
2. Verificá que TODAS las variables de entorno estén configuradas
3. Asegurate que los archivos se hayan subido correctamente
4. Verificá el `.htaccess` si hay problemas con las rutas
