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
  const [subError, setSubError] = useState('');

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
          payerEmail: business.email,
          userToken: session.access_token,
        }
      });

      if (error) throw error;

      // Redirigir a MercadoPago para aprobar la suscripción
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      setSubError('Error al crear suscripción: ' + err.message);
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
              <p className="text-primary font-semibold">
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
                <span className="text-5xl font-bold text-primary">$100</span>
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

          {subError && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {subError}
            </div>
          )}
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