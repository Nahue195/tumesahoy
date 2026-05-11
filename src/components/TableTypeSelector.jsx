import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TableTypeSelector({
  businessId,
  selectedTypeId,
  onSelectType,
  reservationDate,
  reservationTime,
  numberOfPeople,
  reservationMode = 'no_turnover'
}) {
  const [tableTypes, setTableTypes] = useState([]);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [sharedTypes, setSharedTypes] = useState({});
  const [businessReservationMode, setBusinessReservationMode] = useState(reservationMode);

  // Cargar tipos de mesa y modo de reserva
  useEffect(() => {
    if (!businessId) return;
    loadTableTypes();
    loadReservationMode();
  }, [businessId]);

  async function loadReservationMode() {
    try {
      const { data, error } = await supabase
        .rpc('get_business_reservation_mode', { p_business_id: businessId });

      if (error) {
        console.error('Error cargando modo de reserva:', error);
        return;
      }

      if (data && data.length > 0) {
        setBusinessReservationMode(data[0].reservation_mode || 'no_turnover');
      }
    } catch (error) {
      console.error('Error cargando modo de reserva:', error);
    }
  }

  // Calcular disponibilidad cuando cambien los parámetros de reserva
  useEffect(() => {
    if (!businessId || !reservationDate || !reservationTime || tableTypes.length === 0) {
      // Resetear disponibilidad si no hay suficiente info
      setAvailability({});
      return;
    }

    // Evitar recálculos duplicados con un pequeño debounce
    const timer = setTimeout(() => {
      calculateAvailability();
    }, 100);

    return () => clearTimeout(timer);
  }, [businessId, reservationDate, reservationTime, numberOfPeople, tableTypes.length]);

  // Suscripción separada para cambios en tiempo real
  useEffect(() => {
    if (!businessId || !reservationDate || !reservationTime) {
      return;
    }

    const subscription = supabase
      .channel(`availability_changes_${businessId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `business_id=eq.${businessId}`
        },
        (payload) => {
          console.log('🔔 Cambio en reservas detectado:', payload);
          // Recalcular solo si afecta la fecha actual (ignorar hora - una reserva ocupa todo el día)
          if (payload.new?.reservation_date === reservationDate) {
            calculateAvailability();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [businessId, reservationDate, reservationTime]);

  async function loadTableTypes() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('table_types')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTableTypes(data || []);

      // Guardar info de cuáles son compartidas
      const shared = {};
      (data || []).forEach(type => {
        shared[type.id] = type.is_shared || false;
      });
      setSharedTypes(shared);
    } catch (error) {
      console.error('Error cargando tipos de mesa:', error);
      setTableTypes([]);
    } finally {
      setLoading(false);
    }
  }

  async function calculateAvailability() {
    if (!reservationDate || !reservationTime) {
      return;
    }

    console.log('🔄 Calculando disponibilidad...', { reservationDate, reservationTime });

    const newAvailability = {};

    for (const type of tableTypes) {
      try {
        // Usar la nueva función RPC que maneja mesas compartidas
        const { data, error } = await supabase
          .rpc('get_table_type_availability', {
            p_business_id: businessId,
            p_table_type_id: type.id,
            p_date: reservationDate,
            p_time: reservationTime
          });

        if (error) {
          console.error('Error obteniendo disponibilidad:', error);
          newAvailability[type.id] = { total: 0, available: 0, isShared: false };
          continue;
        }

        const result = data?.[0] || { total_capacity: 0, available_capacity: 0, is_shared: false };

        console.log(`📊 Tipo "${type.name}" (ID: ${type.id}):`, {
          total: result.total_capacity,
          used: result.used_capacity,
          available: result.available_capacity,
          isShared: result.is_shared,
          fecha: reservationDate,
          hora: reservationTime
        });

        newAvailability[type.id] = {
          total: result.total_capacity,
          available: result.available_capacity,
          isShared: result.is_shared
        };
      } catch (error) {
        console.error(`Error calculando disponibilidad para tipo ${type.id}:`, error);
        newAvailability[type.id] = { total: 0, available: 0, isShared: false };
      }
    }

    console.log('✅ Disponibilidad calculada:', newAvailability);
    setAvailability(newAvailability);
  }

  // Filtrar tipos compatibles con el número de personas
  const compatibleTypes = tableTypes.filter(type => {
    return numberOfPeople >= type.min_capacity && numberOfPeople <= type.max_capacity;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="border-2 border-gray-200 rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (compatibleTypes.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-gradient-to-br from-neutral-light to-white border-2 border-neutral-medium/20 rounded-xl">
        <div className="text-4xl mb-3">🪑</div>
        <p className="text-sm sm:text-base text-neutral-medium">
          No hay tipos de mesa disponibles para {numberOfPeople} {numberOfPeople === 1 ? 'persona' : 'personas'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {compatibleTypes.map(type => {
          const typeAvailability = availability[type.id] || { total: 0, available: 0 };
          const isAvailable = typeAvailability.available > 0;
          const isSelected = selectedTypeId === type.id;
          const showAvailability = reservationDate && reservationTime;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                if (showAvailability && !isAvailable) {
                  // No hacer nada si no está disponible
                  return;
                }
                onSelectType(type.id);
              }}
              disabled={showAvailability && !isAvailable}
              className={`
                relative border-2 rounded-xl p-4 text-left transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 shadow-lg scale-105'
                  : showAvailability && !isAvailable
                  ? 'border-red-200 bg-red-50/30 opacity-70 cursor-not-allowed'
                  : 'border-secondary/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                }
              `}
            >
              {/* Header con icono y nombre */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="text-3xl flex-shrink-0"
                  style={{ filter: showAvailability && !isAvailable ? 'grayscale(100%)' : 'none' }}
                >
                  {type.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-neutral-dark text-sm sm:text-base truncate">
                    {type.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-medium">
                    {type.min_capacity === type.max_capacity
                      ? `${type.min_capacity} ${type.min_capacity === 1 ? 'persona' : 'personas'}`
                      : `${type.min_capacity}-${type.max_capacity} personas`
                    }
                  </p>
                </div>
              </div>

              {/* Descripción */}
              {type.description && (
                <p className="text-xs text-neutral-medium mb-3 line-clamp-2">
                  {type.description}
                </p>
              )}

              {/* Badge de agotado superpuesto */}
              {showAvailability && !isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full shadow-lg">
                      <span className="text-lg">🚫</span>
                      <span className="font-bold text-sm sm:text-base">AGOTADO</span>
                    </div>
                    <p className="text-xs text-red-600 mt-2 font-semibold">
                      {businessReservationMode === 'with_duration'
                        ? 'No hay mesas disponibles para este horario'
                        : 'No hay mesas disponibles para este día'
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Disponibilidad */}
              {showAvailability && (
                <div className="pt-3 border-t border-neutral-medium/20">
                  {isAvailable ? (
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-neutral-medium">Disponibilidad:</span>
                      <span className={`font-semibold ${
                        typeAvailability.available <= 2 ? 'text-amber-600' : 'text-secondary'
                      }`}>
                        {typeAvailability.isShared
                          ? `${typeAvailability.available} de ${typeAvailability.total} lugares`
                          : `${typeAvailability.available} de ${typeAvailability.total} ${typeAvailability.total === 1 ? 'mesa' : 'mesas'}`
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                        Sin disponibilidad
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Badge de seleccionado */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <div className="flex items-center justify-center gap-1 text-primary font-semibold text-xs sm:text-sm">
                    <span>✓</span>
                    <span>Seleccionado</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Información adicional */}
      {(!reservationDate || !reservationTime) && (
        <p className="text-xs text-neutral-medium text-center mt-3">
          💡 Seleccioná una fecha y hora para ver la disponibilidad {businessReservationMode === 'with_duration' ? 'del horario' : 'del día'}
        </p>
      )}

      {/* Mensaje cuando no hay disponibilidad en ningún tipo */}
      {reservationDate && reservationTime && compatibleTypes.length > 0 &&
       compatibleTypes.every(type => {
         const typeAvailability = availability[type.id] || { total: 0, available: 0 };
         return typeAvailability.available === 0;
       }) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">⏰</div>
          <p className="text-sm font-semibold text-amber-900 mb-1">
            {businessReservationMode === 'with_duration'
              ? 'No hay mesas disponibles para este horario'
              : 'No hay mesas disponibles para este día'
            }
          </p>
          <p className="text-xs text-amber-700">
            {businessReservationMode === 'with_duration'
              ? 'Por favor seleccioná otro horario o contactanos por WhatsApp para consultar opciones'
              : 'Por favor seleccioná otro día o contactanos por WhatsApp para consultar opciones'
            }
          </p>
        </div>
      )}
    </div>
  );
}
