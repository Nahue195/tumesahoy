import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function PaymentFailurePage() {
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
        {/* Icono de error */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
        >
          <span className="text-4xl sm:text-5xl">✗</span>
        </motion.div>

        {/* Mensaje */}
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-3 sm:mb-4 px-2">
          Pago rechazado
        </h1>
        <p className="text-base sm:text-lg text-neutral-medium mb-6 sm:mb-8 px-2">
          No pudimos procesar tu pago. Por favor, intentá nuevamente.
        </p>

        {/* Razones comunes */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 text-left">
          <h3 className="font-bold text-sm sm:text-base text-neutral-dark mb-2 sm:mb-3">Razones comunes:</h3>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-neutral-medium">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Fondos insuficientes en la tarjeta</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Datos de la tarjeta incorrectos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Límite de compra excedido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Problemas con el emisor de la tarjeta</span>
            </li>
          </ul>
        </div>

        {/* Botones */}
        <div className="space-y-2 sm:space-y-3">
          {businessId && isValidBusiness && !loading && (
            <button
              onClick={() => navigate(`/payment?business_id=${businessId}`)}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Intentar nuevamente
            </button>
          )}
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Volver al inicio
          </button>
        </div>

        <p className="text-xs text-neutral-medium mt-4 sm:mt-6 px-2">
          ¿Necesitás ayuda? Contactanos a soporte@tumesahoy.com
        </p>
      </motion.div>
    </div>
  );
}
