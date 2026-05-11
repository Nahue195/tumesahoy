import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ReservationCardSkeleton } from "./LoadingSkeleton";

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completada' }
};

function AdminReservationsSection({ businessId }) {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [assigningTable, setAssigningTable] = useState(null);
  const [availableTables, setAvailableTables] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!businessId) return;
    loadReservations();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel(`reservations_changes_${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `business_id=eq.${businessId}`
        },
        () => {
          loadReservations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [businessId]);

  async function loadReservations() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          preferred_table_type:table_types!preferred_table_type_id(id, name, icon, color),
          assigned_table:tables!assigned_table_id(id, table_number)
        `)
        .eq('business_id', businessId)
        .order('reservation_date', { ascending: false })
        .order('reservation_time', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(reservationId, newStatus) {
    setUpdating(reservationId);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId)
        .select();

      if (error) {
        console.error('Error de Supabase:', error);
        throw error;
      }

      await loadReservations();
      setStatusMessage({ type: 'success', text: `Reserva ${newStatus === 'confirmed' ? 'confirmada' : newStatus === 'cancelled' ? 'cancelada' : 'completada'} exitosamente` });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error('Error actualizando reserva:', error);

      let errorMessage = 'Hubo un error al actualizar la reserva.';

      if (error.code === '42501') {
        errorMessage = 'No tenés permisos para actualizar esta reserva. Verificá las políticas de seguridad en Supabase.';
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      setStatusMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } finally {
      setUpdating(null);
    }
  }

  async function loadAvailableTables(reservation) {
    try {
      if (!reservation.preferred_table_type_id) {
        // Si no hay tipo preferido, cargar todas las mesas activas
        const { data, error } = await supabase
          .from('tables')
          .select('id, table_number, table_type_id')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('table_number', { ascending: true });

        if (error) throw error;

        // Marcar todas como disponibles (sin verificación de solapamiento)
        setAvailableTables(data.map(t => ({ table_id: t.id, table_number: t.table_number, is_available: true })));
      } else {
        // Si hay tipo preferido, usar la función SQL para obtener disponibilidad
        const { data, error } = await supabase.rpc('get_available_tables_by_type', {
          p_business_id: businessId,
          p_table_type_id: reservation.preferred_table_type_id,
          p_date: reservation.reservation_date,
          p_time: reservation.reservation_time,
          p_duration_minutes: 120
        });

        if (error) throw error;
        setAvailableTables(data || []);
      }
    } catch (error) {
      console.error('Error cargando mesas disponibles:', error);
      setAvailableTables([]);
    }
  }

  async function handleAssignTable(reservationId, tableId) {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ assigned_table_id: tableId })
        .eq('id', reservationId);

      if (error) throw error;

      setAssigningTable(null);
      await loadReservations();
      setStatusMessage({ type: 'success', text: 'Mesa asignada exitosamente' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error('Error asignando mesa:', error);
      setStatusMessage({ type: 'error', text: 'Error al asignar mesa. Por favor intenta nuevamente.' });
      setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    }
  }

  const filteredReservations = filter === 'all'
    ? reservations
    : reservations.filter(r => r.status === filter);

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <ReservationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm mt-8">
      <div className="px-4 py-3 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h2 className="text-base sm:text-lg font-semibold text-white">Reservas</h2>
          {pendingCount > 0 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
              {pendingCount} pendientes
            </span>
          )}
        </div>
        <button
          onClick={loadReservations}
          className="text-sm text-primary hover:text-accent font-medium"
        >
          🔄 Actualizar
        </button>
      </div>

      <div className="px-4 py-3 border-b border-gray-700 bg-gray-900">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            Todas ({reservations.length})
          </button>
          {Object.entries(STATUS_COLORS).map(([status, config]) => {
            const count = reservations.filter(r => r.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {statusMessage.text && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
          statusMessage.type === 'success'
            ? 'bg-green-900/30 text-green-300 border border-green-700'
            : 'bg-red-900/30 text-red-300 border border-red-700'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="px-4 py-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg font-semibold text-white mb-2">
              {filter === 'all' ? 'No hay reservas todavía' : `No hay reservas ${STATUS_COLORS[filter]?.label.toLowerCase()}`}
            </p>
            <p className="text-sm text-gray-500">
              Las reservas que recibas aparecerán acá
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReservations.map((reservation) => {
              const statusConfig = STATUS_COLORS[reservation.status];
              const reservationDate = new Date(reservation.reservation_date + 'T00:00:00');
              const isPast = reservationDate < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={reservation.id}
                  className="border border-gray-700 rounded-lg p-3 sm:p-4 bg-gray-900 hover:border-primary/50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Info de la reserva */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-bold text-base sm:text-lg text-gray-200">
                          {reservation.customer_name}
                        </h3>
                        <span className={`px-2 py-1 ${statusConfig.bg} ${statusConfig.text} text-xs font-semibold rounded-full`}>
                          {statusConfig.label}
                        </span>
                        {isPast && reservation.status === 'pending' && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs font-semibold rounded-full">
                            Vencida
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm mb-2">
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>📅</span>
                          <span>{new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>🕐</span>
                          <span>{reservation.reservation_time.slice(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>👥</span>
                          <span>{reservation.number_of_people} {reservation.number_of_people === 1 ? 'persona' : 'personas'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <span>📞</span>
                          <span className="break-all">{reservation.customer_phone}</span>
                        </div>
                      </div>

                      {reservation.message && (
                        <div className="mt-2 p-2 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400">
                            <span className="font-semibold">Comentarios:</span> {reservation.message}
                          </p>
                        </div>
                      )}

                      {/* Tipo de mesa preferido */}
                      {reservation.preferred_table_type && (
                        <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm">
                          <span style={{ fontSize: '1.2em' }}>{reservation.preferred_table_type.icon}</span>
                          <span className="text-gray-400">Prefiere:</span>
                          <span className="font-semibold" style={{ color: reservation.preferred_table_type.color }}>
                            {reservation.preferred_table_type.name}
                          </span>
                        </div>
                      )}

                      {/* Mesa asignada o botón de asignar */}
                      {reservation.assigned_table ? (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-800 font-semibold">
                            ✅ Mesa asignada: {reservation.assigned_table.table_number}
                          </p>
                        </div>
                      ) : reservation.status === 'confirmed' && (
                        <div className="mt-2">
                          <button
                            onClick={() => {
                              setAssigningTable(reservation.id);
                              loadAvailableTables(reservation);
                            }}
                            className="text-xs text-primary hover:text-accent font-semibold underline"
                          >
                            Asignar mesa específica
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-row md:flex-col gap-2 flex-wrap md:flex-nowrap md:min-w-[140px]">
                      <a
                        href={`https://wa.me/${reservation.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hola ${reservation.customer_name}! Te escribo por tu reserva del ${new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString('es-AR')} a las ${reservation.reservation_time.slice(0, 5)}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-status-success text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-status-success/80 transition flex items-center justify-center gap-2"
                      >
                        💬 WhatsApp
                      </a>

                      {reservation.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(reservation.id, 'confirmed')}
                          disabled={updating === reservation.id}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                        >
                          ✓ Confirmar
                        </button>
                      )}

                      {reservation.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(reservation.id, 'completed')}
                          disabled={updating === reservation.id}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          ✓ Completar
                        </button>
                      )}

                      {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                        <button
                          onClick={() => updateStatus(reservation.id, 'cancelled')}
                          disabled={updating === reservation.id}
                          className="flex-1 md:flex-initial px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
                        >
                          ✗ Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Asignar Mesa */}
      {assigningTable && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAssigningTable(null)}
        >
          <div
            className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Asignar Mesa</h3>
              <button
                onClick={() => setAssigningTable(null)}
                className="text-2xl text-gray-400 hover:text-white transition"
              >
                ×
              </button>
            </div>

            {availableTables.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🪑</div>
                <p className="text-sm text-gray-400 mb-4">
                  No hay mesas disponibles para este día y tipo.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                {availableTables.map(table => (
                  <button
                    key={table.table_id}
                    onClick={() => handleAssignTable(assigningTable, table.table_id)}
                    disabled={!table.is_available}
                    className={`w-full p-3 rounded-lg border-2 text-left transition ${
                      table.is_available
                        ? 'border-secondary/30 hover:border-primary hover:bg-primary/5 cursor-pointer'
                        : 'border-gray-700 bg-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-200">Mesa {table.table_number}</p>
                      <span className={`text-xs font-semibold ${
                        table.is_available ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {table.is_available ? '✓ Disponible' : '✗ Ocupada'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setAssigningTable(null)}
              className="w-full py-2 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminReservationsSection;
