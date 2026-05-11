import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function CancelReservationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState(null);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (token) {
      loadReservation();
    }
  }, [token]);

  async function loadReservation() {
    try {
      setLoading(true);
      setError('');

      // Usar la función RPC segura para obtener la reserva
      const { data, error: rpcError } = await supabase
        .rpc('get_reservation_by_token', { p_token: token });

      if (rpcError) throw rpcError;

      if (!data.success) {
        setError(data.error || 'Reserva no encontrada');
        return;
      }

      setReservation(data.reservation);
      setBusiness(data.business);

      // Si ya está cancelada, mostrar ese estado
      if (data.reservation.status === 'cancelled') {
        setCancelled(true);
      }
    } catch (err) {
      console.error('Error cargando reserva:', err);
      setError('No se pudo cargar la reserva. Verificá que el link sea correcto.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    try {
      setCancelling(true);

      // Usar la función RPC segura para cancelar
      const { data, error: rpcError } = await supabase
        .rpc('cancel_reservation_by_token', { p_token: token });

      if (rpcError) throw rpcError;

      if (!data.success) {
        setError(data.error);
        return;
      }

      setCancelled(true);
    } catch (err) {
      console.error('Error cancelando reserva:', err);
      setError('Hubo un error al cancelar la reserva. Intentá nuevamente.');
    } finally {
      setCancelling(false);
    }
  }

  // Formatear fecha
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5) + ' hs';
  };

  // Estado de la reserva
  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      confirmed: { text: 'Confirmada', color: 'bg-green-100 text-green-800 border-green-300' },
      cancelled: { text: 'Cancelada', color: 'bg-red-100 text-red-800 border-red-300' },
      completed: { text: 'Completada', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      no_show: { text: 'No asistió', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    };
    return badges[status] || badges.pending;
  };

  // Verificar si la reserva puede ser cancelada
  const canCancel = () => {
    if (!reservation) return false;
    if (reservation.status === 'cancelled' || reservation.status === 'completed') return false;

    const reservationDate = new Date(reservation.reservation_date + 'T' + reservation.reservation_time);
    const now = new Date();

    // No se puede cancelar si ya pasó (con 1 hora de margen)
    const oneHourBefore = new Date(reservationDate.getTime() - 60 * 60 * 1000);
    return now < oneHourBefore;
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-neutral-medium">Cargando reserva...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && !reservation) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-dark mb-3">
            Reserva no encontrada
          </h1>
          <p className="text-neutral-medium mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(reservation?.status);

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img src="/LogoFinal.svg" alt="TuMesaHoy Logo" className="h-10 sm:h-12" />
            </div>
            {business?.slug && (
              <button
                onClick={() => navigate(`/negocio/${business.slug}`)}
                className="text-primary hover:text-accent transition text-sm font-medium"
              >
                Ver negocio
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header del card */}
          <div className={`p-6 ${cancelled ? 'bg-red-50' : 'bg-gradient-to-r from-primary/10 to-accent/10'}`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-dark">
                {cancelled ? 'Reserva Cancelada' : 'Tu Reserva'}
              </h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusBadge.color}`}>
                {statusBadge.text}
              </span>
            </div>
            {business && (
              <p className="text-neutral-medium">
                en <span className="font-semibold text-neutral-dark">{business.name}</span>
              </p>
            )}
          </div>

          {/* Detalles de la reserva */}
          <div className="p-6 space-y-4">
            {/* Nombre */}
            <div className="flex items-start gap-3">
              <span className="text-xl">👤</span>
              <div>
                <p className="text-sm text-neutral-medium">Nombre</p>
                <p className="font-semibold text-neutral-dark">{reservation?.customer_name}</p>
              </div>
            </div>

            {/* Fecha */}
            <div className="flex items-start gap-3">
              <span className="text-xl">📅</span>
              <div>
                <p className="text-sm text-neutral-medium">Fecha</p>
                <p className="font-semibold text-neutral-dark capitalize">{formatDate(reservation?.reservation_date)}</p>
              </div>
            </div>

            {/* Hora */}
            <div className="flex items-start gap-3">
              <span className="text-xl">🕐</span>
              <div>
                <p className="text-sm text-neutral-medium">Hora</p>
                <p className="font-semibold text-neutral-dark">{formatTime(reservation?.reservation_time)}</p>
              </div>
            </div>

            {/* Personas */}
            <div className="flex items-start gap-3">
              <span className="text-xl">👥</span>
              <div>
                <p className="text-sm text-neutral-medium">Personas</p>
                <p className="font-semibold text-neutral-dark">
                  {reservation?.number_of_people} {reservation?.number_of_people === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            </div>

            {/* Comentarios */}
            {reservation?.special_requests && (
              <div className="flex items-start gap-3">
                <span className="text-xl">💬</span>
                <div>
                  <p className="text-sm text-neutral-medium">Comentarios</p>
                  <p className="font-semibold text-neutral-dark">{reservation.special_requests}</p>
                </div>
              </div>
            )}

            {/* Ubicación del negocio */}
            {business?.address && (
              <div className="flex items-start gap-3 pt-4 border-t">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-sm text-neutral-medium">Dirección</p>
                  <p className="font-semibold text-neutral-dark">{business.address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="p-6 bg-neutral-light/50 border-t">
            {cancelled ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-neutral-dark font-semibold mb-2">
                  Tu reserva ha sido cancelada
                </p>
                <p className="text-sm text-neutral-medium mb-4">
                  Si cambiás de opinión, podés hacer una nueva reserva.
                </p>
                <button
                  onClick={() => navigate(`/negocio/${business?.slug}`)}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Hacer nueva reserva
                </button>
              </div>
            ) : canCancel() ? (
              <>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
                {showConfirm ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                    <p className="text-sm text-red-800 font-medium text-center">
                      ¿Confirmás la cancelación? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50"
                      >
                        {cancelling ? 'Cancelando...' : 'Sí, cancelar'}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition"
                      >
                        Volver
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
                  >
                    Cancelar Reserva
                  </button>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-neutral-medium text-sm">
                  {reservation?.status === 'completed'
                    ? 'Esta reserva ya fue completada.'
                    : 'Esta reserva ya no puede ser cancelada.'}
                </p>
                <button
                  onClick={() => navigate(`/negocio/${business?.slug}`)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Hacer nueva reserva
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contacto */}
        {business?.phone && !cancelled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-neutral-medium mb-2">
              ¿Necesitás modificar tu reserva?
            </p>
            <a
              href={`https://wa.me/${business.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition"
            >
              <span>💬</span>
              Contactar por WhatsApp
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
