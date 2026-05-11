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

function AdminHoursSection({ businessId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState([]); // Ahora es un array de todos los turnos
  const [editMode, setEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!businessId) return;
    loadHours();
  }, [businessId]);

  async function loadHours() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .eq('business_id', businessId)
        .order('day_of_week', { ascending: true })
        .order('shift_number', { ascending: true });

      if (error) throw error;

      // Si no hay horarios, crear template vacío (un turno por día)
      if (!data || data.length === 0) {
        const template = DAYS.map(day => ({
          day_of_week: day.id,
          shift_number: 1,
          opens_at: '09:00',
          closes_at: '18:00',
          is_closed: day.id === 0, // Domingo cerrado por defecto
          isNew: true
        }));
        setHours(template);
      } else {
        setHours(data);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
    } finally {
      setLoading(false);
    }
  }

  // Agrupar horarios por día
  const getShiftsByDay = (dayId) => {
    return hours.filter(h => h.day_of_week === dayId).sort((a, b) => a.shift_number - b.shift_number);
  };

  const handleToggleDay = (dayId) => {
    setHours(prev =>
      prev.map(h =>
        h.day_of_week === dayId ? { ...h, is_closed: !h.is_closed } : h
      )
    );
  };

  const handleTimeChange = (dayId, shiftNumber, field, value) => {
    setHours(prev =>
      prev.map(h =>
        h.day_of_week === dayId && h.shift_number === shiftNumber
          ? { ...h, [field]: value }
          : h
      )
    );
  };

  const handleAddShift = (dayId) => {
    const shiftsForDay = getShiftsByDay(dayId);
    const maxShift = shiftsForDay.length > 0
      ? Math.max(...shiftsForDay.map(s => s.shift_number))
      : 0;

    const newShift = {
      day_of_week: dayId,
      shift_number: maxShift + 1,
      opens_at: '16:00',
      closes_at: '22:00',
      is_closed: false,
      isNew: true
    };

    setHours(prev => [...prev, newShift]);
  };

  const handleRemoveShift = (dayId, shiftNumber) => {
    setHours(prev => prev.filter(h => !(h.day_of_week === dayId && h.shift_number === shiftNumber)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Eliminar horarios existentes
      await supabase
        .from('business_hours')
        .delete()
        .eq('business_id', businessId);

      // Filtrar horarios que no están cerrados
      const hoursToInsert = hours
        .filter(h => !h.is_closed)
        .map(h => ({
          business_id: businessId,
          day_of_week: h.day_of_week,
          shift_number: h.shift_number,
          opens_at: h.opens_at,
          closes_at: h.closes_at,
          is_closed: false
        }));

      if (hoursToInsert.length > 0) {
        const { error } = await supabase
          .from('business_hours')
          .insert(hoursToInsert);

        if (error) {
          console.error('Error completo:', error);
          throw error;
        }
      }

      setSaveStatus({ type: 'success', text: '¡Horarios guardados exitosamente!' });
      setTimeout(() => setSaveStatus({ type: '', text: '' }), 4000);
      setEditMode(false);
      await loadHours();
    } catch (error) {
      console.error('Error guardando horarios:', error);
      setSaveStatus({ type: 'error', text: `Hubo un error al guardar los horarios: ${error.message || 'Error desconocido'}` });
      setTimeout(() => setSaveStatus({ type: '', text: '' }), 4000);
    } finally {
      setSaving(false);
    }
  };

  const getDayInfo = (dayId) => DAYS.find(d => d.id === dayId);

  if (loading) {
    return <p className="text-sm text-gray-400">Cargando horarios...</p>;
  }

  return (
    <section className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm mt-8">
      <div className="px-4 py-3 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-white">Horarios de atención</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
          >
            ✏️ Editar horarios
          </button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : '💾 Guardar'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                loadHours();
              }}
              disabled={saving}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600 transition disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        <div className="space-y-4">
          {DAYS.map((day) => {
            const shifts = getShiftsByDay(day.id);
            const isClosed = shifts.length === 0 || shifts.every(s => s.is_closed);

            return (
              <div
                key={day.id}
                className={`rounded-lg border-2 transition ${
                  isClosed
                    ? 'border-gray-700 bg-gray-900'
                    : 'border-secondary/20 bg-primary/20'
                }`}
              >
                {/* Encabezado del día */}
                <div className="flex items-center justify-between p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-[80px] md:w-24">
                      <p className="font-semibold text-white">
                        <span className="md:hidden">{day.short}</span>
                        <span className="hidden md:inline">{day.name}</span>
                      </p>
                    </div>

                    {/* Toggle abierto/cerrado */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!isClosed}
                        onChange={() => editMode && handleToggleDay(day.id)}
                        disabled={!editMode}
                        className="w-4 h-4 text-secondary border-gray-600 rounded focus:ring-secondary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label className="text-sm text-gray-400">
                        {isClosed ? 'Cerrado' : 'Abierto'}
                      </label>
                    </div>
                  </div>

                  {/* Botón para agregar turno */}
                  {!isClosed && editMode && (
                    <button
                      onClick={() => handleAddShift(day.id)}
                      className="px-3 py-1 text-xs bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition font-semibold"
                    >
                      + Agregar turno
                    </button>
                  )}
                </div>

                {/* Turnos del día */}
                {!isClosed && (
                  <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-2">
                    {shifts.map((shift, index) => (
                      <div
                        key={`${day.id}-${shift.shift_number}`}
                        className="flex items-center gap-2 md:gap-3 bg-gray-900 p-3 rounded-lg"
                      >
                        {shifts.length > 1 && (
                          <span className="text-xs font-semibold text-gray-400 min-w-[60px]">
                            Turno {shift.shift_number}
                          </span>
                        )}

                        <div className="flex-1 md:flex-initial">
                          <label className="block text-xs text-gray-400 mb-1">Apertura</label>
                          <input
                            type="time"
                            value={shift.opens_at}
                            onChange={(e) => editMode && handleTimeChange(day.id, shift.shift_number, 'opens_at', e.target.value)}
                            disabled={!editMode}
                            className="w-full px-2 md:px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                        <span className="text-gray-400 mt-5 hidden sm:inline">→</span>

                        <div className="flex-1 md:flex-initial">
                          <label className="block text-xs text-gray-400 mb-1">Cierre</label>
                          <input
                            type="time"
                            value={shift.closes_at}
                            onChange={(e) => editMode && handleTimeChange(day.id, shift.shift_number, 'closes_at', e.target.value)}
                            disabled={!editMode}
                            className="w-full px-2 md:px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Botón para eliminar turno (solo si hay más de 1) */}
                        {shifts.length > 1 && editMode && (
                          <button
                            onClick={() => handleRemoveShift(day.id, shift.shift_number)}
                            className="mt-5 p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition"
                            title="Eliminar turno"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isClosed && (
                  <div className="px-3 pb-3 md:px-4 md:pb-4">
                    <div className="text-sm text-gray-500 italic">
                      No hay atención este día
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {saveStatus.text && (
          <div className={`mb-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
            saveStatus.type === 'success'
              ? 'bg-green-900/30 text-green-300 border border-green-700'
              : 'bg-red-900/30 text-red-300 border border-red-700'
          }`}>
            {saveStatus.text}
          </div>
        )}

        {!editMode && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-300">
              💡 Estos horarios se mostrarán en tu página pública para que tus clientes sepan cuándo estás abierto.
              {hours.some(h => getShiftsByDay(h.day_of_week).length > 1) && (
                <span className="block mt-1">
                  ✨ Podés agregar múltiples turnos por día (por ejemplo: almuerzo y cena).
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminHoursSection;
