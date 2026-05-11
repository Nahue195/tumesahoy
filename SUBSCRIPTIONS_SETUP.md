# 🔄 Guía de Implementación: Suscripciones Automáticas

## ✅ Lo que ya está listo:

### Backend:
- ✅ Base de datos configurada con campos de suscripción
- ✅ Edge Function `create-subscription` para crear suscripciones en MP
- ✅ Webhook actualizado (`mp-webhook-v2`) para eventos de suscripción
- ✅ Funciones de Supabase para gestionar pagos automáticos

---

## 📋 Paso 1: Desplegar los Edge Functions

### 1.1 Desplegar la función de crear suscripción

```bash
cd C:\TuMesaHoy\TuMesaHoy

# Desplegar create-subscription
supabase functions deploy create-subscription --no-verify-jwt

# Verificar que se desplegó
supabase functions list
```

### 1.2 Desplegar el webhook actualizado

```bash
# Desplegar mp-webhook-v2
supabase functions deploy mp-webhook-v2 --no-verify-jwt

# Configurar el webhook en MercadoPago
# Ir a: https://www.mercadopago.com.ar/developers/panel/app
# Webhooks > Agregar URL:
# https://dcagmqhokjcvvilvyigp.supabase.co/functions/v1/mp-webhook-v2
```

**IMPORTANTE**: Agregar estos eventos en MercadoPago:
- ✅ `payment` (pagos)
- ✅ `subscription_preapproval` (suscripciones)
- ✅ `subscription_authorized_payment` (cobros automáticos)

---

## 📋 Paso 2: Actualizar el Frontend

### 2.1 Crear página para agregar método de pago

Necesitamos una página donde el usuario pueda suscribirse antes de que termine su trial. Crear: `src/pages/SubscribePage.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SubscribePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  useEffect(() => {
    loadBusinessData();
  }, [businessId]);

  const loadBusinessData = async () => {
    if (!businessId) return;

    const { data, error } = await supabase
      .from('businesses_subscription_status')
      .select('*')
      .eq('id', businessId)
      .single();

    if (data) {
      setBusiness(data);
      setTrialDaysLeft(data.trial_days_remaining);
    }
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Llamar al Edge Function para crear suscripción
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: {
          businessId: businessId,
          businessName: business.name,
          businessSlug: business.slug,
          payerEmail: business.email
        }
      });

      if (error) throw error;

      // Redirigir a MercadoPago para aprobar la suscripción
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      console.error('Error creando suscripción:', err);
      alert('Error al crear suscripción: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!business) return <div>Cargando...</div>;

  return (
    <div className="min-h-screen bg-neutral-light py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary/20">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4">
            Activar Suscripción
          </h1>

          {trialDaysLeft > 0 ? (
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
              <p className="text-accent font-semibold">
                ⏰ Tu período de prueba termina en {trialDaysLeft} días
              </p>
              <p className="text-neutral-medium text-sm mt-1">
                Agregá tu método de pago ahora para no perder acceso
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 font-semibold">
                ⚠️ Tu período de prueba ha terminado
              </p>
              <p className="text-neutral-medium text-sm mt-1">
                Suscribite ahora para reactivar tu negocio
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-xl font-bold text-neutral-dark mb-4">
              Plan Pro - Suscripción Mensual
            </h2>

            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 mb-6">
              <div className="flex items-baseline mb-4">
                <span className="text-5xl font-bold text-primary">$70.000</span>
                <span className="text-neutral-medium ml-2">/mes</span>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center text-neutral-dark">
                  <span className="text-secondary mr-2">✓</span>
                  Menú digital ilimitado
                </li>
                <li className="flex items-center text-neutral-dark">
                  <span className="text-secondary mr-2">✓</span>
                  Sistema de reservas
                </li>
                <li className="flex items-center text-neutral-dark">
                  <span className="text-secondary mr-2">✓</span>
                  Código QR personalizado
                </li>
                <li className="flex items-center text-neutral-dark">
                  <span className="text-secondary mr-2">✓</span>
                  Panel de analytics
                </li>
                <li className="flex items-center text-neutral-dark">
                  <span className="text-secondary mr-2">✓</span>
                  Soporte prioritario
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-dark">
                <strong>💳 Cobro automático mensual</strong><br />
                Tu suscripción se renovará automáticamente cada mes. Podés cancelar cuando quieras.
              </p>
            </div>
          </div>

          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Activar Suscripción con MercadoPago'}
          </button>

          <p className="text-xs text-neutral-medium text-center mt-4">
            Serás redirigido a MercadoPago para completar el pago de forma segura
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Agregar ruta en App.jsx

```jsx
import SubscribePage from './pages/SubscribePage';

// Agregar en las rutas:
<Route path="/subscribe" element={<SubscribePage />} />
```

### 2.3 Crear banner de notificación en AdminPage

Agregar al inicio de AdminPage.jsx:

```jsx
// Al inicio del componente, después de cargar el negocio:
const [trialDaysLeft, setTrialDaysLeft] = useState(null);

useEffect(() => {
  const checkTrialStatus = async () => {
    const { data } = await supabase
      .from('businesses_subscription_status')
      .select('trial_days_remaining, subscription_status')
      .eq('id', businessId)
      .single();

    if (data) {
      setTrialDaysLeft(data.trial_days_remaining);
    }
  };

  checkTrialStatus();
}, [businessId]);

// Antes del contenido principal, agregar:
{trialDaysLeft !== null && trialDaysLeft <= 5 && (
  <div className="bg-accent/10 border-l-4 border-accent p-4 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-accent">
          ⏰ Tu trial termina en {trialDaysLeft} días
        </p>
        <p className="text-sm text-neutral-medium mt-1">
          Agregá tu método de pago para continuar sin interrupciones
        </p>
      </div>
      <button
        onClick={() => navigate(`/subscribe?business_id=${businessId}`)}
        className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
      >
        Suscribirse Ahora
      </button>
    </div>
  </div>
)}
```

---

## 📋 Paso 3: Probar el flujo completo

### 3.1 Flujo de prueba:

1. **Registrar nuevo usuario** → `/signup`
2. **Crear negocio** → `/register`
3. **Verificar que se cree con trial** → Ir a Supabase y verificar:
   ```sql
   SELECT name, subscription_status, trial_start_date, trial_end_date
   FROM businesses
   ORDER BY created_at DESC
   LIMIT 1;
   ```
4. **Simular que faltan pocos días** → En Supabase:
   ```sql
   UPDATE businesses
   SET trial_end_date = NOW() + INTERVAL '3 days'
   WHERE id = '[tu-business-id]';
   ```
5. **Ver banner en AdminPage** → Debería aparecer el banner de "tu trial termina en X días"
6. **Click en "Suscribirse"** → Ir a `/subscribe`
7. **Click en "Activar Suscripción"** → Redirige a MercadoPago
8. **Completar pago en MP** → Usar tarjetas de prueba
9. **Webhook procesa pago** → El negocio se activa automáticamente
10. **Verificar en Supabase**:
    ```sql
    SELECT * FROM businesses_subscription_status WHERE id = '[tu-business-id]';
    SELECT * FROM payments WHERE business_id = '[tu-business-id]';
    ```

### 3.2 Tarjetas de prueba de MercadoPago:

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | ✅ Aprobada |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | ✅ Aprobada |
| Visa | 4074 0210 6020 0003 | 123 | 11/25 | ❌ Rechazada |

---

## 📋 Paso 4: Configurar notificaciones (Opcional)

Crear un cron job que verifique diariamente los trials por vencer y envíe emails:

```sql
-- Función para obtener trials por vencer
CREATE OR REPLACE FUNCTION public.get_trials_expiring_soon()
RETURNS TABLE(
  business_id UUID,
  business_name TEXT,
  owner_email TEXT,
  days_left INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.email,
    EXTRACT(DAY FROM (b.trial_end_date - TIMEZONE('utc'::text, NOW())))::INTEGER
  FROM public.businesses b
  WHERE
    b.subscription_status = 'trial'
    AND b.trial_end_date > TIMEZONE('utc'::text, NOW())
    AND b.trial_end_date <= TIMEZONE('utc'::text, NOW()) + INTERVAL '7 days'
    AND b.is_active = true
  ORDER BY b.trial_end_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## ✅ Checklist de implementación:

- [ ] Desplegar `create-subscription` Edge Function
- [ ] Desplegar `mp-webhook-v2` Edge Function
- [ ] Configurar webhook en MercadoPago
- [ ] Crear `SubscribePage.jsx`
- [ ] Agregar ruta en `App.jsx`
- [ ] Agregar banner en `AdminPage.jsx`
- [ ] Probar flujo completo con tarjetas de prueba
- [ ] Verificar que los webhooks funcionen
- [ ] (Opcional) Configurar notificaciones por email

---

## 🎯 Resultado Final:

Con esta implementación:

✅ Usuario se registra → **30 días gratis sin tarjeta**
✅ A los 3-5 días de que termine → **Banner de notificación**
✅ Usuario agrega tarjeta → **Suscripción automática creada**
✅ Primer cobro → **Inmediato ($70.000)**
✅ Cada mes → **Cobro automático**
✅ Si falla pago → **MP reintenta 3 veces**
✅ Si no paga → **Negocio se desactiva automáticamente**

¡Todo automatizado! 🚀
