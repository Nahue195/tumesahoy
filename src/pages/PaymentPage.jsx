import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { setItemWithExpiration } from '../lib/secureStorage';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [mpEmail, setMpEmail] = useState('');

  useEffect(() => {
    loadBusiness();
  }, [businessId]);

  async function loadBusiness() {
    if (!businessId) {
      navigate('/register');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        navigate('/register');
        return;
      }

      setBusiness(data);
    } catch (error) {
      console.error('❌ Error:', error);
      navigate('/register');
    } finally {
      setLoading(false);
    }
  }

  async function createPaymentPreference() {
    setCreating(true);
    setError('');

    try {
      // Validar que el email de MP esté ingresado
      if (!mpEmail || !mpEmail.includes('@')) {
        throw new Error('Por favor ingresá tu email de Mercado Pago');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Configuración de Supabase incompleta. Verificá las variables de entorno.');
      }

      // SECURITY: Obtener token de sesión del usuario autenticado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Tu sesión expiró. Por favor iniciá sesión nuevamente.');
      }

      const url = `${supabaseUrl}/functions/v1/create-subscription`;

      const requestBody = {
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        payerEmail: mpEmail,
        userToken: session.access_token
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`, // Usar Anon Key en Authorization
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `Error del servidor (${response.status})`);
      }

      // SECURITY: Guardar slug con expiración de 30 minutos
      setItemWithExpiration('pending_business_slug', business.slug, 30);

      // Redirigir al checkout de Mercado Pago para autorizar la suscripción
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error('No se recibió la URL de autorización de Mercado Pago');
      }

    } catch (error) {

      let errorMessage = 'Hubo un error al procesar la suscripción.';

      if (error.message.includes('sesión expiró')) {
        errorMessage = error.message;
        // Redirigir a login después de 2 segundos
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.message.includes('variables de entorno')) {
        errorMessage = 'Error de configuración. Por favor contactá al administrador.';
      } else {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img src="/LogoFinal.svg" alt="TuMesaHoy Logo" className="h-14 sm:h-16" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-2 px-2">
            ¡Último paso!
          </h1>
          <p className="text-sm sm:text-base text-neutral-medium px-2">
            Activá tu suscripción para comenzar a recibir reservas
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-dark mb-1">
                Suscripción Mensual
              </h2>
              <p className="text-xs sm:text-sm text-neutral-medium">
                Renovación automática cada mes
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-dark">
                $100
              </div>
              <div className="text-xs sm:text-sm text-neutral-medium">por mes</div>
            </div>
          </div>

          {/* Features incluidas */}
          <div className="mb-4 sm:mb-6">
            <h3 className="font-semibold text-sm sm:text-base text-neutral-dark mb-2 sm:mb-3">Todo incluido:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                'Reservas ilimitadas',
                'Menú digital con fotos',
                'Panel de administración',
                'Analytics y estadísticas',
                'Código QR personalizado',
                'WhatsApp integrado',
                'Página web personalizada',
                'Soporte prioritario'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-accent flex-shrink-0">✓</span>
                  <span className="text-xs sm:text-sm text-neutral-dark">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info del negocio */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-neutral-dark mb-1 break-words">
              <span className="font-semibold">Negocio:</span> {business?.name}
            </p>
            <p className="text-xs sm:text-sm text-neutral-dark break-all">
              <span className="font-semibold">URL:</span> /negocio/{business?.slug}
            </p>
          </div>

          {/* Info de suscripción */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 flex-shrink-0 text-lg">ℹ️</span>
              <div className="text-xs sm:text-sm text-blue-900">
                <p className="font-semibold mb-1">Suscripción automática</p>
                <p>• El cobro se renovará automáticamente cada mes</p>
                <p>• Podés cancelar cuando quieras desde tu panel de administración</p>
                <p>• Sin permanencia mínima ni penalizaciones</p>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4">
              <p className="text-xs sm:text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Campo de email de Mercado Pago */}
          <div className="mb-4">
            <label htmlFor="mpEmail" className="block text-sm font-semibold text-neutral-dark mb-2">
              Email de tu cuenta de Mercado Pago
            </label>
            <input
              id="mpEmail"
              type="email"
              value={mpEmail}
              onChange={(e) => setMpEmail(e.target.value)}
              placeholder="tu-email@ejemplo.com"
              className="w-full px-4 py-3 border border-neutral-medium/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              required
            />
            <p className="text-xs text-neutral-medium mt-1">
              Ingresá el email de la cuenta de Mercado Pago con la que vas a pagar
            </p>
          </div>

          {/* Botón de pago */}
          <button
            onClick={createPaymentPreference}
            disabled={creating}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-base sm:text-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Procesando...' : 'Suscribirme con Mercado Pago'}
          </button>

          <p className="text-xs text-center text-neutral-medium mt-3 sm:mt-4 px-2">
            Al continuar, aceptás nuestros términos de servicio, política de privacidad y autorizás el cobro automático mensual
          </p>
        </div>

        {/* Info adicional */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs sm:text-sm text-neutral-medium hover:text-primary transition"
          >
            ← Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
