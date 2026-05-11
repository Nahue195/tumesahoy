import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const DAYS = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Lunes', short: 'Lun' },
  { id: 2, name: 'Martes', short: 'Mar' },
  { id: 3, name: 'Miércoles', short: 'Mié' },
  { id: 4, name: 'Jueves', short: 'Jue' },
  { id: 5, name: 'Viernes', short: 'Vie' },
  { id: 6, name: 'Sábado', short: 'Sáb' }
];

const EMOJI_OPTIONS = ['☀️', '🌙', '☕', '🍺', '🍽️', '🥗', '🍕', '🍰'];

function AdminShiftsSection({ businessId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [dayShifts, setDayShifts] = useState([]); // Relación día-turno
  const [editMode, setEditMode] = useState(false);
  const [showNewShiftForm, setShowNewShiftForm] = useState(false);
  const [timeInterval, setTimeInterval] = useState(30); // Intervalo en minutos
  const [newShift, setNewShift] = useState({
    name: '',
    icon: '🍽️',
    start_time: '12:00',
    end_time: '16:00',
    available_times: []
  });

  // Función para generar horarios automáticamente
  const generateAvailableTimes = (startTime, endTime, intervalMinutes) => {
    if (!startTime || !endTime) return [];

    const times = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;

    // Si end_time es menor que start_time, significa que cruza la medianoche
    // Agregamos 24 horas (1440 minutos) al end_time
    if (endMinutes <= currentMinutes) {
      endMinutes += 24 * 60; // Agregar 24 horas
    }

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60) % 24; // Usar módulo 24 para manejar cruce de medianoche
      const minutes = currentMinutes % 60;
      const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      times.push(timeStr);
      currentMinutes += intervalMinutes;
    }

    return times;
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setNewShift({
      name: '',
      icon: '🍽️',
      start_time: '12:00',
      end_time: '16:00',
      available_times: []
    });
    setTimeInterval(30);
    setShowNewShiftForm(false);
  };

  // Función para abrir el formulario limpio
  const openNewShiftForm = () => {
    setNewShift({
      name: '',
      icon: '🍽️',
      start_time: '12:00',
      end_time: '16:00',
      available_times: []
    });
    setTimeInterval(30);
    setShowNewShiftForm(true);
  };

  useEffect(() => {
    if (!businessId) return;
    loadShifts();
  }, [businessId]);

  async function loadShifts() {
    setLoading(true);
    try {
      // Cargar turnos
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('business_shifts')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (shiftsError) throw shiftsError;
      setShifts(shiftsData || []);

      // Cargar relación día-turno
      const { data: dayShiftsData, error: dayShiftsError } = await supabase
        .from('business_day_shifts')
        .select('*')
        .eq('business_id', businessId);

      if (dayShiftsError) {
        console.error('Error cargando day_shifts:', dayShiftsError);
        setDayShifts([]);
      } else {
        setDayShifts(dayShiftsData || []);
      }
    } catch (error) {
      console.error('Error cargando turnos:', error);
    } finally {
      setLoading(false);
    }
  }

  // Verificar si un turno está habilitado para un día específico
  const isShiftEnabledForDay = (shiftId, dayId) => {
    const relation = dayShifts.find(
      ds => ds.shift_id === shiftId && ds.day_of_week === dayId
    );
    return relation ? relation.is_active : false;
  };

  // Toggle de turno para un día específico
  const handleToggleDayShift = async (shiftId, dayId) => {
    if (!editMode) return;

    const existingRelation = dayShifts.find(
      ds => ds.shift_id === shiftId && ds.day_of_week === dayId
    );

    try {
      if (existingRelation) {
        // Actualizar relación existente
        const newActiveState = !existingRelation.is_active;

        const { error } = await supabase
          .from('business_day_shifts')
          .update({ is_active: newActiveState })
          .eq('id', existingRelation.id);

        if (error) throw error;

        setDayShifts(prev =>
          prev.map(ds =>
            ds.id === existingRelation.id ? { ...ds, is_active: newActiveState } : ds
          )
        );
      } else {
        // Crear nueva relación
        const { data, error } = await supabase
          .from('business_day_shifts')
          .insert({
            business_id: businessId,
            shift_id: shiftId,
            day_of_week: dayId,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        setDayShifts(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error toggling day shift:', error);
      alert('Error al actualizar el turno para este día');
    }
  };

  const handleAddShift = async () => {
    if (!newShift.name.trim()) {
      alert('Por favor ingresá un nombre para el turno');
      return;
    }

    if (!newShift.start_time || !newShift.end_time) {
      alert('Por favor ingresá el horario de inicio y fin del turno');
      return;
    }

    // Generar horarios disponibles automáticamente
    const availableTimes = generateAvailableTimes(newShift.start_time, newShift.end_time, timeInterval);

    if (availableTimes.length === 0) {
      alert('No se pudieron generar horarios. Verificá que los horarios sean válidos.');
      return;
    }

    setSaving(true);
    try {
      // Crear el turno
      const { data: shiftData, error: shiftError } = await supabase
        .from('business_shifts')
        .insert({
          business_id: businessId,
          name: newShift.name.trim(),
          icon: newShift.icon,
          start_time: newShift.start_time,
          end_time: newShift.end_time,
          available_times: availableTimes,
          display_order: shifts.length,
          is_active: true
        })
        .select()
        .single();

      if (shiftError) throw shiftError;

      // Habilitar el turno para todos los días por defecto
      const dayShiftsToInsert = DAYS.map(day => ({
        business_id: businessId,
        shift_id: shiftData.id,
        day_of_week: day.id,
        is_active: true
      }));

      const { error: dayShiftsError } = await supabase
        .from('business_day_shifts')
        .insert(dayShiftsToInsert);

      if (dayShiftsError) throw dayShiftsError;

      alert('¡Turno creado exitosamente!');
      resetForm();
      await loadShifts();
    } catch (error) {
      console.error('Error creando turno:', error);
      alert('Error al crear el turno: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (!confirm('¿Estás seguro de eliminar este turno? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('business_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      alert('Turno eliminado exitosamente');
      await loadShifts();
    } catch (error) {
      console.error('Error eliminando turno:', error);
      alert('Error al eliminar el turno: ' + error.message);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-400">Cargando turnos...</p>;
  }

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm mt-8">
      <div className="px-4 py-3 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Gestión de Turnos de Reserva
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
              >
                ✏️ Editar turnos
              </button>
              <button
                onClick={openNewShiftForm}
                className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
              >
                + Nuevo turno
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setEditMode(false);
                loadShifts();
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600 transition"
            >
              Finalizar edición
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Formulario para nuevo turno */}
        {showNewShiftForm && (
          <div className="mb-6 p-4 bg-gray-900 border-2 border-gray-700 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Crear nuevo turno</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Nombre del turno *
                  </label>
                  <input
                    type="text"
                    value={newShift.name}
                    onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                    placeholder="Ej: Almuerzo, Cena, Merienda"
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:border-secondary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Icono
                  </label>
                  <div className="flex gap-2">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewShift({ ...newShift, icon: emoji })}
                        className={`text-2xl p-2 rounded-lg border-2 transition ${
                          newShift.icon === emoji
                            ? 'border-secondary bg-secondary/10'
                            : 'border-gray-600 hover:border-secondary/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Hora inicio
                  </label>
                  <input
                    type="time"
                    value={newShift.start_time}
                    onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:border-secondary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Hora fin
                  </label>
                  <input
                    type="time"
                    value={newShift.end_time}
                    onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg focus:border-secondary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Mostrar horarios cada
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Define cada cuánto aparecen las opciones de horario para el cliente
                </p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[15, 30, 60].map(interval => (
                    <button
                      key={interval}
                      type="button"
                      onClick={() => setTimeInterval(interval)}
                      className={`px-4 py-2 rounded-lg border-2 transition font-semibold ${
                        timeInterval === interval
                          ? 'border-secondary bg-secondary text-white'
                          : 'border-gray-600 hover:border-secondary/50 text-gray-300'
                      }`}
                    >
                      {interval} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Vista previa de horarios generados */}
              <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Vista previa de horarios disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const previewTimes = generateAvailableTimes(newShift.start_time, newShift.end_time, timeInterval);

                    if (previewTimes.length === 0) {
                      return (
                        <p className="text-sm text-gray-400">
                          Seleccioná un horario de inicio y fin para ver la vista previa
                        </p>
                      );
                    }

                    return previewTimes.map((time, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-gray-700 border-2 border-gray-600 rounded-lg text-sm font-medium text-white"
                      >
                        {time}
                      </div>
                    ));
                  })()}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  💡 El cliente podrá elegir entre estos horarios. La duración de cada reserva se configura en "Configuración de Reservas".
                  {(() => {
                    const [startHour] = newShift.start_time.split(':').map(Number);
                    const [endHour] = newShift.end_time.split(':').map(Number);
                    const crossesMidnight = endHour < startHour || (endHour === 0 && startHour > 0);
                    if (crossesMidnight) {
                      return <span className="block mt-1 text-amber-400 font-semibold">🌙 Este turno cruza la medianoche (continúa al día siguiente)</span>;
                    }
                    return null;
                  })()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddShift}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Crear turno'}
                </button>
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de turnos */}
        {shifts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No tenés turnos configurados todavía.
            </p>
            <button
              onClick={openNewShiftForm}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Crear tu primer turno
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="border border-gray-700 rounded-xl p-4 bg-gray-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{shift.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{shift.name}</h3>
                      <p className="text-sm text-gray-400">
                        {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  {editMode && (
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      🗑️ Eliminar
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 mb-2">
                    Horarios disponibles:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {shift.available_times.map((time, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 text-gray-300 rounded"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">
                    Días habilitados:
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day) => {
                      const isEnabled = isShiftEnabledForDay(shift.id, day.id);
                      return (
                        <button
                          key={day.id}
                          onClick={() => handleToggleDayShift(shift.id, day.id)}
                          disabled={!editMode}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                            isEnabled
                              ? 'bg-gradient-to-r from-secondary to-accent text-white'
                              : 'bg-gray-700 text-gray-400'
                          } ${editMode ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!editMode && shifts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 Los turnos organizan las franjas horarias (almuerzo, cena, etc.) y qué horarios puede elegir el cliente.
              La duración de cada reserva se configura en la pestaña <strong>Configuración → Configuración de Reservas</strong>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminShiftsSection;
