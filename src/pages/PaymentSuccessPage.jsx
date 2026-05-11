import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');
  const paymentId = searchParams.get('payment_id');

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    activateBusiness();
  }, [businessId]);

  async function activateBusiness() {
    try {
      if (!businessId) {
        navigate('/register');
        return;
      }

      // SECURITY: Verificar que el usuario autenticado es el dueño del negocio
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Error de autenticación:', authError);
        navigate('/login');
        return;
      }

      // Verificar propiedad del negocio antes de activar
      const { data: businessData, error: checkError } = await supabase
        .from('businesses')
        .select('id, user_id, name, slug')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single();

      if (checkError || !businessData) {
        console.error('No autorizado o negocio no encontrado');
        navigate('/');
        return;
      }

      // Activar el negocio
      const { data, error } = await supabase
        .from('businesses')
        .update({
          subscription_status: 'active',
          is_active: true,
          is_accepting_reservations: true
        })
        .eq('id', businessId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setBusiness(data);

      // Opcional: Guardar información del pago en la tabla payments
      if (paymentId) {
        await supabase
          .from('payments')
          .insert({
            business_id: businessId,
            mp_payment_id: paymentId,
            status: 'approved',
            amount: 120000,
            currency: 'ARS'
          });
      }

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-medium">Activando tu cuenta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Icono de éxito */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
        >
          <span className="text-4xl sm:text-5xl">✓</span>
        </motion.div>

        {/* Mensaje */}
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-3 sm:mb-4 px-2">
          ¡Pago exitoso!
        </h1>
        <p className="text-base sm:text-lg text-neutral-medium mb-2 px-2">
          Tu suscripción ha sido activada correctamente
        </p>
        {business && (
          <p className="text-sm text-neutral-medium mb-6 sm:mb-8 px-2">
            {business.name} ya está activo y listo para recibir reservas
          </p>
        )}

        {/* Card con próximos pasos */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-left">
          <h3 className="font-bold text-sm sm:text-base text-neutral-dark mb-3 sm:mb-4">Próximos pasos:</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold">1.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Configurá tu menú y horarios</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold">2.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Descargá tu código QR</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold">3.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Compartí tu página en redes sociales</span>
            </div>
          </div>
        </div>

        {/* Botón para ir al admin */}
        {business && (
          <button
            onClick={() => navigate(`/admin/${business.slug}`)}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-base sm:text-lg font-semibold hover:shadow-lg transition"
          >
            Ir a mi panel de administración
          </button>
        )}

        <p className="text-xs text-neutral-medium mt-3 sm:mt-4 px-2">
          Tu suscripción se renovará automáticamente cada mes
        </p>
      </motion.div>
    </div>
  );
}
