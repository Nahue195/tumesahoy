import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function PaymentPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business_id');
  const [isValidBusiness, setIsValidBusiness] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateBusiness();
  }, [businessId]);

  async function validateBusiness() {
    try {
      if (!businessId) {
        setLoading(false);
        return;
      }

      // SECURITY: Verificar que el usuario autenticado es el dueño del negocio
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Error de autenticación');
        setLoading(false);
        return;
      }

      // Verificar propiedad del negocio
      const { data: businessData, error: checkError } = await supabase
        .from('businesses')
        .select('id')
        .eq('id', businessId)
        .eq('user_id', user.id)
        .single();

      if (!checkError && businessData) {
        setIsValidBusiness(true);
      }
    } catch (error) {
      console.error('Error validando negocio:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Icono de pendiente */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
        >
          <span className="text-4xl sm:text-5xl">⏳</span>
        </motion.div>

        {/* Mensaje */}
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-3 sm:mb-4 px-2">
          Pago pendiente
        </h1>
        <p className="text-base sm:text-lg text-neutral-medium mb-6 sm:mb-8 px-2">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>

        {/* Info adicional */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-left">
          <h3 className="font-bold text-sm sm:text-base text-neutral-dark mb-2 sm:mb-3">¿Qué significa esto?</h3>
          <p className="text-xs sm:text-sm text-neutral-medium mb-3 sm:mb-4">
            Algunos medios de pago requieren un tiempo de procesamiento.
            Revisaremos tu pago y activaremos tu cuenta automáticamente una vez confirmado.
          </p>
          <p className="text-xs sm:text-sm text-neutral-medium">
            Recibirás un email cuando tu pago sea aprobado.
          </p>
        </div>

        {/* Botones */}
        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Volver al inicio
          </button>
          {businessId && isValidBusiness && !loading && (
            <button
              onClick={() => navigate(`/payment?business_id=${businessId}`)}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition"
            >
              Intentar otro método de pago
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
