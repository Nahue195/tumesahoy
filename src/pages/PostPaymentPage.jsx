import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getItemWithExpiration, removeItem } from '../lib/secureStorage';

export default function PostPaymentPage() {
  const navigate = useNavigate();
  const [slug, setSlug] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // SECURITY: Obtener el slug usando helper con validación de expiración
    const savedSlug = getItemWithExpiration('pending_business_slug');

    if (savedSlug) {
      setSlug(savedSlug);

      // Countdown automático
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Redirigir al admin
            removeItem('pending_business_slug');
            navigate(`/admin/${savedSlug}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Si no hay slug guardado o expiró, ir al home
      navigate('/');
    }
  }, [navigate]);

  const goToAdmin = () => {
    if (slug) {
      removeItem('pending_business_slug');
      navigate(`/admin/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full text-center"
      >
        {/* Icono de éxito */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg"
        >
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        {/* Mensaje principal */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-dark mb-3 sm:mb-4 px-2">
          ¡Pago completado!
        </h1>

        <p className="text-base sm:text-lg text-neutral-medium mb-6 sm:mb-8 px-2">
          Tu negocio ya está activo y listo para recibir reservas
        </p>

        {/* Información importante */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-start gap-2 sm:gap-3 text-left mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-0.5 sm:mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs sm:text-sm text-neutral-dark font-semibold mb-1">
                Si todavía estás en Mercado Pago:
              </p>
              <p className="text-xs sm:text-sm text-neutral-medium">
                Buscá el botón "Volver al sitio" o cerrá esta pestaña y volvé a TuMesaHoy
              </p>
            </div>
          </div>
        </div>

        {/* Botón principal */}
        <button
          onClick={goToAdmin}
          className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 mb-3 sm:mb-4"
        >
          Ir a mi panel de administración
        </button>

        {/* Countdown */}
        <p className="text-xs sm:text-sm text-neutral-medium mb-6 sm:mb-8">
          Redirigiendo automáticamente en {countdown} segundo{countdown !== 1 ? 's' : ''}...
        </p>

        {/* Próximos pasos */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left">
          <h3 className="font-bold text-sm sm:text-base text-neutral-dark mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Próximos pasos:
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold flex-shrink-0">1.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Configurá tu menú y categorías</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold flex-shrink-0">2.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Establecé tus horarios de atención</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold flex-shrink-0">3.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Descargá tu código QR para compartir</span>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-accent font-bold flex-shrink-0">4.</span>
              <span className="text-xs sm:text-sm text-neutral-dark">Compartí tu página en redes sociales</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
