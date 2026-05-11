import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { StatCardSkeleton, CardSkeleton } from "./LoadingSkeleton";

function AdminAnalyticsSection({ businessId }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    totalPeople: 0,
    avgPeoplePerReservation: 0,
    totalMenuItems: 0,
    totalCategories: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [popularTimeSlots, setPopularTimeSlots] = useState([]);

  useEffect(() => {
    if (!businessId) return;
    loadAnalytics();
  }, [businessId]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      // Cargar todas las reservas
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('*')
        .eq('business_id', businessId);

      if (resError) throw resError;

      // Calcular estadísticas de reservas
      const totalReservations = reservations?.length || 0;
      const pendingReservations = reservations?.filter(r => r.status === 'pending').length || 0;
      const confirmedReservations = reservations?.filter(r => r.status === 'confirmed').length || 0;
      const completedReservations = reservations?.filter(r => r.status === 'completed').length || 0;
      const cancelledReservations = reservations?.filter(r => r.status === 'cancelled').length || 0;
      const totalPeople = reservations?.reduce((sum, r) => sum + r.people_count, 0) || 0;
      const avgPeoplePerReservation = totalReservations > 0 ? (totalPeople / totalReservations).toFixed(1) : 0;

      // Cargar estadísticas del menú
      const { data: categories, error: catError } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('business_id', businessId);

      if (catError) throw catError;

      const totalCategories = categories?.length || 0;
      let totalMenuItems = 0;

      if (totalCategories > 0) {
        const catIds = categories.map(c => c.id);
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('id')
          .in('category_id', catIds);

        if (itemsError) throw itemsError;
        totalMenuItems = items?.length || 0;
      }

      // Calcular horarios más populares
      const timeSlotCounts = {};
      reservations?.forEach(r => {
        const hour = r.reservation_time.slice(0, 2);
        timeSlotCounts[hour] = (timeSlotCounts[hour] || 0) + 1;
      });

      const popularSlots = Object.entries(timeSlotCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hour, count]) => ({
          time: `${hour}:00`,
          count
        }));

      // Actividad reciente (últimas 10 reservas)
      const recent = (reservations || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      setStats({
        totalReservations,
        pendingReservations,
        confirmedReservations,
        completedReservations,
        cancelledReservations,
        totalPeople,
        avgPeoplePerReservation,
        totalMenuItems,
        totalCategories
      });

      setPopularTimeSlots(popularSlots);
      setRecentActivity(recent);

    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Other sections skeleton */}
        <div className="grid md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <CardSkeleton />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total de Reservas',
      value: stats.totalReservations,
      icon: '📊',
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Pendientes',
      value: stats.pendingReservations,
      icon: '⏳',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      label: 'Confirmadas',
      value: stats.confirmedReservations,
      icon: '✅',
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Completadas',
      value: stats.completedReservations,
      icon: '🎉',
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Canceladas',
      value: stats.cancelledReservations,
      icon: '❌',
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'Total de Personas',
      value: stats.totalPeople,
      icon: '👥',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      label: 'Promedio por Reserva',
      value: stats.avgPeoplePerReservation,
      icon: '📈',
      color: 'from-pink-500 to-pink-600'
    },
    {
      label: 'Ítems del Menú',
      value: stats.totalMenuItems,
      icon: '🍽️',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-300">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Horarios más populares */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 rounded-t-xl">
            <h3 className="text-lg font-semibold text-white">⏰ Horarios más populares</h3>
          </div>
          <div className="px-4 py-4">
            {popularTimeSlots.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay datos suficientes todavía
              </p>
            ) : (
              <div className="space-y-3">
                {popularTimeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-secondary">#{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-300">{slot.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-accent"
                          style={{ width: `${(slot.count / popularTimeSlots[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-secondary w-8 text-right">
                        {slot.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Actividad reciente */}
        <section className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 rounded-t-xl">
            <h3 className="text-lg font-semibold text-white">🔔 Actividad reciente</h3>
          </div>
          <div className="px-4 py-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No hay actividad reciente
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentActivity.map((reservation) => {
                  const statusColors = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                    completed: 'bg-blue-100 text-blue-800'
                  };

                  const statusLabels = {
                    pending: 'Pendiente',
                    confirmed: 'Confirmada',
                    cancelled: 'Cancelada',
                    completed: 'Completada'
                  };

                  return (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-200">
                          {reservation.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(reservation.reservation_date + 'T00:00:00').toLocaleDateString('es-AR')} - {reservation.reservation_time.slice(0, 5)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 ${statusColors[reservation.status]} text-xs font-semibold rounded-full`}>
                        {statusLabels[reservation.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Resumen del menú */}
      <section className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm">
        <div className="px-4 py-3 border-b border-gray-700 bg-gray-900 rounded-t-xl">
          <h3 className="text-lg font-semibold text-white">📋 Resumen del menú</h3>
        </div>
        <div className="px-4 py-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalCategories}</p>
                <p className="text-sm text-gray-400">Categorías</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalMenuItems}</p>
                <p className="text-sm text-gray-400">Ítems totales</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats.totalCategories > 0 ? (stats.totalMenuItems / stats.totalCategories).toFixed(1) : 0}
                </p>
                <p className="text-sm text-gray-400">Promedio por categoría</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 border-2 border-secondary/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h4 className="font-bold text-white mb-2">Consejos para mejorar</h4>
            <ul className="space-y-1 text-sm text-gray-300">
              {stats.pendingReservations > 5 && (
                <li>• Tienes {stats.pendingReservations} reservas pendientes. Revísalas para confirmar o cancelar.</li>
              )}
              {stats.totalMenuItems === 0 && (
                <li>• Aún no has agregado ítems a tu menú. ¡Empieza a cargarlo para atraer más clientes!</li>
              )}
              {stats.totalReservations === 0 && (
                <li>• Aún no tienes reservas. Comparte el enlace de tu negocio en redes sociales.</li>
              )}
              {stats.totalReservations > 0 && stats.cancelledReservations / stats.totalReservations > 0.3 && (
                <li>• Tu tasa de cancelación es alta ({((stats.cancelledReservations / stats.totalReservations) * 100).toFixed(0)}%). Considera enviar recordatorios por WhatsApp.</li>
              )}
              {stats.totalMenuItems > 0 && stats.totalCategories === 0 && (
                <li>• Organiza tu menú en categorías para mejor experiencia del cliente.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalyticsSection;
