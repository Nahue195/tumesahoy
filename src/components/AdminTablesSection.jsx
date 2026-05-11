import { useEffect, useState, useRef, useCallback } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../lib/supabaseClient';

// Colores por defecto para tipos de mesa
const DEFAULT_TYPE_COLORS = [
  '#FF6B35', // primary
  '#2D6A4F', // secondary
  '#FFB703', // accent
  '#4A90E2', // azul
  '#9B59B6', // morado
  '#E74C3C', // rojo
];

// Función debounce para guardado automático
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function AdminTablesSection({ businessId }) {
  // Estados principales
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('types'); // 'types' | 'tables' | 'map'

  // Tipos de mesa
  const [tableTypes, setTableTypes] = useState([]);
  const [editingType, setEditingType] = useState(null);
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    icon: '🪑',
    color: DEFAULT_TYPE_COLORS[0],
    min_capacity: 1,
    max_capacity: 4,
    is_shared: false
  });

  // Mesas
  const [tables, setTables] = useState([]);
  const [editingTable, setEditingTable] = useState(null);

  // Función para generar posición inicial aleatoria
  const getRandomPosition = () => ({
    position_x: 200 + Math.floor(Math.random() * 600), // Entre 200 y 800
    position_y: 150 + Math.floor(Math.random() * 300)  // Entre 150 y 450
  });

  const [newTable, setNewTable] = useState({
    table_type_id: '',
    table_number: '',
    table_name: '',
    capacity: 4,
    ...getRandomPosition(),
    width: 80,
    height: 80,
    rotation: 0,
    shape: 'circle'
  });


  // Canvas drag & drop
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasContainerRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!businessId) return;
    loadAllData();
  }, [businessId]);

  // Calcular escala del canvas
  useEffect(() => {
    const updateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.offsetWidth;
      const scale = containerWidth / 1000;
      setCanvasScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      await Promise.all([
        loadTableTypes(),
        loadTables()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTableTypes() {
    try {
      const { data, error } = await supabase
        .from('table_types')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setTableTypes(data || []);
    } catch (error) {
      console.error('Error cargando tipos de mesa:', error);
    }
  }

  async function loadTables() {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          table_type:table_types(id, name, icon, color)
        `)
        .eq('business_id', businessId)
        .order('table_number', { ascending: true });

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      console.error('Error cargando mesas:', error);
    }
  }

  // ========================================
  // FUNCIONES: TIPOS DE MESA
  // ========================================

  async function handleAddType() {
    if (!newType.name.trim()) {
      alert('El nombre del tipo es requerido');
      return;
    }

    setSaving(true);
    try {
      const maxOrder = tableTypes.reduce((max, t) => Math.max(max, t.display_order || 0), 0);

      const { error } = await supabase
        .from('table_types')
        .insert({
          business_id: businessId,
          name: newType.name.trim(),
          description: newType.description.trim() || null,
          icon: newType.icon,
          color: newType.color,
          min_capacity: newType.min_capacity,
          max_capacity: newType.max_capacity,
          is_shared: newType.is_shared,
          display_order: maxOrder + 1
        });

      if (error) throw error;

      await loadTableTypes();
      setNewType({
        name: '',
        description: '',
        icon: '🪑',
        color: DEFAULT_TYPE_COLORS[0],
        min_capacity: 1,
        max_capacity: 4,
        is_shared: false
      });
      alert('Tipo de mesa creado exitosamente');
    } catch (error) {
      console.error('Error creando tipo:', error);
      alert('Error al crear tipo de mesa');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateType() {
    if (!editingType || !editingType.name.trim()) {
      alert('El nombre del tipo es requerido');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('table_types')
        .update({
          name: editingType.name.trim(),
          description: editingType.description?.trim() || null,
          icon: editingType.icon,
          color: editingType.color,
          min_capacity: editingType.min_capacity,
          max_capacity: editingType.max_capacity,
          is_shared: editingType.is_shared || false
        })
        .eq('id', editingType.id);

      if (error) throw error;

      await loadTableTypes();
      setEditingType(null);
      alert('Tipo actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando tipo:', error);
      alert('Error al actualizar tipo');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteType(typeId) {
    // Verificar si hay mesas asignadas a este tipo
    const assignedTables = tables.filter(t => t.table_type_id === typeId);
    if (assignedTables.length > 0) {
      alert(`No se puede eliminar este tipo porque tiene ${assignedTables.length} mesa(s) asignada(s). Elimina las mesas primero.`);
      return;
    }

    if (!window.confirm('¿Estás seguro de eliminar este tipo de mesa?')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('table_types')
        .delete()
        .eq('id', typeId);

      if (error) throw error;

      await loadTableTypes();
      alert('Tipo eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando tipo:', error);
      alert('Error al eliminar tipo');
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // FUNCIONES: MESAS
  // ========================================

  async function handleAddTable() {
    if (!newTable.table_type_id) {
      alert('Debes seleccionar un tipo de mesa');
      return;
    }

    if (!newTable.table_number.trim()) {
      alert('El número de mesa es requerido');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tables')
        .insert({
          business_id: businessId,
          table_type_id: newTable.table_type_id,
          table_number: newTable.table_number.trim(),
          table_name: newTable.table_name?.trim() || null,
          capacity: newTable.capacity || 4,
          position_x: newTable.position_x,
          position_y: newTable.position_y,
          width: newTable.width,
          height: newTable.height,
          rotation: newTable.rotation,
          shape: newTable.shape
        });

      if (error) {
        if (error.code === '23505') {
          alert('Ya existe una mesa con ese número');
          return;
        }
        throw error;
      }

      await loadTables();
      setNewTable({
        table_type_id: '',
        table_number: '',
        table_name: '',
        capacity: 4,
        ...getRandomPosition(),
        width: 80,
        height: 80,
        rotation: 0,
        shape: 'circle'
      });
      alert('Mesa creada exitosamente');
    } catch (error) {
      console.error('Error creando mesa:', error);
      alert('Error al crear mesa');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateTable() {
    if (!editingTable || !editingTable.table_number.trim()) {
      alert('El número de mesa es requerido');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tables')
        .update({
          table_type_id: editingTable.table_type_id,
          table_number: editingTable.table_number.trim(),
          table_name: editingTable.table_name?.trim() || null,
          capacity: editingTable.capacity || 4,
          width: editingTable.width,
          height: editingTable.height,
          rotation: editingTable.rotation,
          shape: editingTable.shape
        })
        .eq('id', editingTable.id);

      if (error) throw error;

      await loadTables();
      setEditingTable(null);
      alert('Mesa actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando mesa:', error);
      alert('Error al actualizar mesa');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTable(tableId) {
    if (!window.confirm('¿Estás seguro de eliminar esta mesa?')) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId);

      if (error) throw error;

      await loadTables();
      setSelectedTableId(null);
      alert('Mesa eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando mesa:', error);
      alert('Error al eliminar mesa');
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // FUNCIONES: DRAG & DROP
  // ========================================

  const debouncedSavePosition = useCallback(
    debounce(async (tableId, x, y) => {
      try {
        const { error } = await supabase
          .from('tables')
          .update({
            position_x: Math.round(x),
            position_y: Math.round(y)
          })
          .eq('id', tableId);

        if (error) throw error;
      } catch (error) {
        console.error('Error guardando posición:', error);
      }
    }, 500),
    []
  );

  function handleDragEnd(event) {
    const { active, delta } = event;
    const tableId = active.id;

    // Encontrar la mesa actual
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // Calcular nueva posición en coordenadas lógicas (0-1000)
    const newX = table.position_x + (delta.x / canvasScale);
    const newY = table.position_y + (delta.y / canvasScale);

    // Limitar dentro del canvas
    const clampedX = Math.max(0, Math.min(1000, newX));
    const clampedY = Math.max(0, Math.min(600, newY));

    // Actualizar UI inmediatamente
    setTables(prev => prev.map(t =>
      t.id === tableId ? { ...t, position_x: clampedX, position_y: clampedY } : t
    ));

    // Guardar en DB con delay
    debouncedSavePosition(tableId, clampedX, clampedY);
  }

  function getTableTypeColor(typeId) {
    const type = tableTypes.find(t => t.id === typeId);
    return type?.color || '#FF6B35';
  }

  // Manejador para cambiar forma y ajustar dimensiones
  function handleShapeChange(shape, isEditing = false) {
    const dimensions = {
      circle: { width: 80, height: 80 },
      square: { width: 80, height: 80 },
      rectangle: { width: 120, height: 60 }
    };

    if (isEditing && editingTable) {
      setEditingTable({
        ...editingTable,
        shape,
        ...dimensions[shape]
      });
    } else {
      setNewTable({
        ...newTable,
        shape,
        ...dimensions[shape]
      });
    }
  }

  // Componente para mesa draggable
  function DraggableTable({ table, isSelected, tableColor, onSelect, scale }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: table.id
    });

    // Aplicar el transform del drag si existe
    const dragX = transform?.x || 0;
    const dragY = transform?.y || 0;

    // Posición final en píxeles (coordenadas lógicas * escala + delta del drag)
    const finalX = (table.position_x * scale) + dragX;
    const finalY = (table.position_y * scale) + dragY;

    const style = {
      position: 'absolute',
      left: `${finalX}px`,
      top: `${finalY}px`,
      transform: 'translate(-50%, -50%)', // Centrar la mesa en su posición
      width: table.width * scale,
      height: table.height * scale,
      backgroundColor: tableColor,
      borderRadius: table.shape === 'circle' ? '50%' : '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      color: 'white',
      fontSize: `${Math.max(10, 12 * scale)}px`,
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      boxShadow: isSelected || isDragging
        ? '0 0 0 3px rgba(255,107,53,0.5), 0 4px 12px rgba(0,0,0,0.3)'
        : '0 2px 8px rgba(0,0,0,0.2)',
      cursor: 'move',
      touchAction: 'none',
      zIndex: isDragging ? 100 : (isSelected ? 10 : 0),
      opacity: isDragging ? 0.8 : 1
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => onSelect(table.id)}
      >
        {table.table_number}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
      {/* Header con sub-tabs */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setActiveSubTab('types')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === 'types'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            🏷️ Tipos de Mesa
          </button>
          <button
            onClick={() => setActiveSubTab('tables')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === 'tables'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            🪑 Mesas
          </button>
          <button
            onClick={() => setActiveSubTab('map')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeSubTab === 'map'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            🗺️ Mapa Visual
          </button>
        </div>
      </div>

      {/* Contenido según sub-tab activo */}
      <div className="p-6">
        {/* TAB 1: TIPOS DE MESA */}
        {activeSubTab === 'types' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Tipos de Mesa Configurados</h3>

              {tableTypes.length === 0 ? (
                <div className="text-center py-12 bg-gray-900 border-2 border-gray-700 rounded-xl">
                  <div className="text-5xl mb-3">🏷️</div>
                  <p className="text-gray-500">No hay tipos de mesa todavía</p>
                  <p className="text-sm text-gray-500 mt-1">Crea tu primer tipo abajo</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tableTypes.map(type => (
                    <div
                      key={type.id}
                      className="border-2 border-gray-700 rounded-xl p-4 hover:border-primary/30 transition"
                    >
                      {editingType?.id === type.id ? (
                        // Modo edición
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingType.name}
                            onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                            placeholder="Nombre del tipo"
                          />
                          <input
                            type="text"
                            value={editingType.icon}
                            onChange={(e) => setEditingType({ ...editingType, icon: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                            placeholder="Icono (emoji)"
                          />
                          <input
                            type="color"
                            value={editingType.color}
                            onChange={(e) => setEditingType({ ...editingType, color: e.target.value })}
                            className="w-full h-10 rounded-lg cursor-pointer"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="number"
                              min="1"
                              value={editingType.min_capacity}
                              onChange={(e) => setEditingType({ ...editingType, min_capacity: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                              placeholder="Min"
                            />
                            <input
                              type="number"
                              min="1"
                              value={editingType.max_capacity}
                              onChange={(e) => setEditingType({ ...editingType, max_capacity: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                              placeholder="Max"
                            />
                          </div>
                          {/* Toggle compartida en edición */}
                          <label className="flex items-center gap-2 cursor-pointer p-2 bg-gray-700 rounded-lg">
                            <input
                              type="checkbox"
                              checked={editingType.is_shared || false}
                              onChange={(e) => setEditingType({ ...editingType, is_shared: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-600 text-secondary focus:ring-secondary"
                            />
                            <span className="text-xs font-semibold text-gray-200">
                              🤝 Mesa compartida
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateType}
                              disabled={saving}
                              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => setEditingType(null)}
                              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-600"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Modo visualización
                        <>
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white"
                              style={{ backgroundColor: type.color }}
                            >
                              {type.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white">{type.name}</h4>
                                {type.is_shared && (
                                  <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs font-semibold rounded-full">
                                    🤝 Compartida
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {type.min_capacity}-{type.max_capacity} personas
                                {type.is_shared && ' (suma por personas)'}
                              </p>
                            </div>
                          </div>
                          {type.description && (
                            <p className="text-xs text-gray-400 mb-3">{type.description}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingType(type)}
                              className="flex-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteType(type.id)}
                              className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200"
                            >
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario agregar tipo */}
            <div className="border border-gray-700 rounded-xl p-4 bg-gray-900">
              <h4 className="text-sm font-bold text-gray-200 mb-3">Agregar Nuevo Tipo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                  placeholder="Nombre del tipo *"
                />
                <input
                  type="text"
                  value={newType.icon}
                  onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                  className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                  placeholder="Icono (emoji)"
                />
                <input
                  type="color"
                  value={newType.color}
                  onChange={(e) => setNewType({ ...newType, color: e.target.value })}
                  className="h-10 rounded-lg cursor-pointer"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newType.min_capacity}
                    onChange={(e) => setNewType({ ...newType, min_capacity: parseInt(e.target.value) })}
                    className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                    placeholder="Min personas"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newType.max_capacity}
                    onChange={(e) => setNewType({ ...newType, max_capacity: parseInt(e.target.value) })}
                    className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                    placeholder="Max personas"
                  />
                </div>
              </div>

              {/* Toggle Mesa Compartida */}
              <div className="mt-3 p-3 border-2 border-dashed border-secondary/30 rounded-lg bg-gray-700/50">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newType.is_shared}
                    onChange={(e) => setNewType({ ...newType, is_shared: e.target.checked })}
                    className="w-5 h-5 mt-0.5 rounded border-gray-600 text-secondary focus:ring-secondary"
                  />
                  <div>
                    <span className="font-semibold text-sm text-gray-200">
                      🤝 Mesa compartida (comunitaria)
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {newType.is_shared
                        ? '✓ La disponibilidad se cuenta por PERSONAS. Múltiples reservas pueden compartir hasta llenar la capacidad total.'
                        : 'La disponibilidad se cuenta por MESAS. Cada mesa = 1 reserva por día (sin recambio) o por horario (con recambio).'
                      }
                    </p>
                  </div>
                </label>
              </div>

              <button
                onClick={handleAddType}
                disabled={saving || !newType.name.trim()}
                className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : '✨ Agregar Tipo'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MESAS */}
        {activeSubTab === 'tables' && (
          <div className="space-y-6">
            {tableTypes.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 border-2 border-gray-700 rounded-xl">
                <div className="text-5xl mb-3">🏷️</div>
                <p className="text-gray-500 font-semibold mb-2">Primero crea tipos de mesa</p>
                <p className="text-sm text-gray-500">Ve a la pestaña "Tipos de Mesa" para empezar</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Mesas Configuradas ({tables.length})</h3>

                  {tables.length === 0 ? (
                    <div className="text-center py-12 bg-gray-900 border-2 border-gray-700 rounded-xl">
                      <div className="text-5xl mb-3">🪑</div>
                      <p className="text-gray-500">No hay mesas todavía</p>
                      <p className="text-sm text-gray-500 mt-1">Agrega tu primera mesa abajo</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tableTypes.map(type => {
                        const typeTables = tables.filter(t => t.table_type_id === type.id);
                        if (typeTables.length === 0) return null;

                        return (
                          <div key={type.id} className="border-2 border-gray-700 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                style={{ backgroundColor: type.color }}
                              >
                                {type.icon}
                              </div>
                              <h4 className="font-bold text-white">{type.name}</h4>
                              <span className="text-xs text-gray-400">({typeTables.length} mesas)</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {typeTables.map(table => (
                                <div
                                  key={table.id}
                                  className="border border-gray-700 rounded-lg p-2 hover:border-primary transition bg-gray-900"
                                >
                                  <p className="font-semibold text-sm text-white">Mesa {table.table_number}</p>
                                  {table.table_name && (
                                    <p className="text-xs text-gray-400">{table.table_name}</p>
                                  )}
                                  <p className="text-xs text-secondary font-semibold">
                                    👥 {table.capacity || '?'} personas
                                  </p>
                                  <div className="flex gap-1 mt-2">
                                    <button
                                      onClick={() => setEditingTable(table)}
                                      className="flex-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold hover:bg-primary/20"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTable(table.id)}
                                      className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-semibold hover:bg-red-200"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Formulario agregar mesa */}
                <div className="border border-gray-700 rounded-xl p-4 bg-gray-900">
                  <h4 className="text-sm font-bold text-gray-200 mb-3">Agregar Nueva Mesa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={newTable.table_type_id}
                      onChange={(e) => {
                        const selectedType = tableTypes.find(t => t.id === e.target.value);
                        setNewTable({
                          ...newTable,
                          table_type_id: e.target.value,
                          capacity: selectedType?.max_capacity || 4
                        });
                      }}
                      className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                    >
                      <option value="">Seleccionar tipo *</option>
                      {tableTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name} {type.is_shared ? '(compartida)' : ''}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newTable.table_number}
                      onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                      placeholder="Número de mesa *"
                    />
                    <input
                      type="text"
                      value={newTable.table_name}
                      onChange={(e) => setNewTable({ ...newTable, table_name: e.target.value })}
                      className="px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                      placeholder="Nombre (opcional)"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-1">
                        Capacidad (personas) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newTable.capacity}
                        onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 4 })}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm placeholder-gray-400"
                        placeholder="Capacidad"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-200 mb-1">
                        Forma visual
                      </label>
                      <select
                        value={newTable.shape}
                        onChange={(e) => handleShapeChange(e.target.value, false)}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                      >
                        <option value="circle">⭕ Circular</option>
                        <option value="rectangle">▭ Rectangular</option>
                        <option value="square">◻️ Cuadrada</option>
                      </select>
                    </div>
                  </div>

                  {/* Info sobre tipo seleccionado */}
                  {newTable.table_type_id && (
                    <div className="mt-3 p-2 bg-gray-700/70 rounded-lg text-xs">
                      {(() => {
                        const selectedType = tableTypes.find(t => t.id === newTable.table_type_id);
                        if (!selectedType) return null;
                        return selectedType.is_shared ? (
                          <p className="text-secondary">
                            <strong>🤝 Tipo compartido:</strong> Los {newTable.capacity} lugares se irán llenando con las reservas del día/horario.
                          </p>
                        ) : (
                          <p className="text-gray-400">
                            <strong>🪑 Tipo normal:</strong> Esta mesa admite 1 reserva por día (sin recambio) o por horario (con recambio).
                          </p>
                        );
                      })()}
                    </div>
                  )}

                  <button
                    onClick={handleAddTable}
                    disabled={saving || !newTable.table_type_id || !newTable.table_number.trim()}
                    className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : '✨ Agregar Mesa'}
                  </button>
                </div>
              </>
            )}

            {/* Modal edición de mesa */}
            {editingTable && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setEditingTable(null)}
              >
                <div
                  className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-4">Editar Mesa</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Tipo de Mesa</label>
                      <select
                        value={editingTable.table_type_id}
                        onChange={(e) => setEditingTable({ ...editingTable, table_type_id: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                      >
                        {tableTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.icon} {type.name} {type.is_shared ? '(compartida)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Número *</label>
                      <input
                        type="text"
                        value={editingTable.table_number}
                        onChange={(e) => setEditingTable({ ...editingTable, table_number: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Nombre (opcional)</label>
                      <input
                        type="text"
                        value={editingTable.table_name || ''}
                        onChange={(e) => setEditingTable({ ...editingTable, table_name: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Capacidad (personas) *</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={editingTable.capacity || 4}
                        onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 4 })}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-1">Forma</label>
                      <select
                        value={editingTable.shape}
                        onChange={(e) => handleShapeChange(e.target.value, true)}
                        className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                      >
                        <option value="circle">Circular</option>
                        <option value="rectangle">Rectangular</option>
                        <option value="square">Cuadrada</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Ancho (px)</label>
                        <input
                          type="number"
                          min="30"
                          value={editingTable.width}
                          onChange={(e) => setEditingTable({ ...editingTable, width: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Alto (px)</label>
                        <input
                          type="number"
                          min="30"
                          value={editingTable.height}
                          onChange={(e) => setEditingTable({ ...editingTable, height: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-gray-700 border-2 border-gray-600 text-white rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleUpdateTable}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditingTable(null)}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MAPA VISUAL */}
        {activeSubTab === 'map' && (
          <div className="space-y-6">
            {tables.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 border-2 border-gray-700 rounded-xl">
                <div className="text-5xl mb-3">🪑</div>
                <p className="text-gray-500 font-semibold mb-2">Primero agrega mesas</p>
                <p className="text-sm text-gray-500">Ve a la pestaña "Mesas" para crear tus mesas</p>
              </div>
            ) : (
              <>
                {/* Canvas con drag & drop */}
                <div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">Mapa Interactivo del Local</h4>
                      {selectedTableId && (
                        <button
                          onClick={() => setSelectedTableId(null)}
                          className="text-xs text-primary hover:text-accent font-semibold"
                        >
                          Deseleccionar
                        </button>
                      )}
                    </div>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-xs text-blue-800">
                        <strong>💡 Tip:</strong> Arrastrá las mesas con el mouse para posicionarlas en el mapa. Los cambios se guardan automáticamente.
                      </p>
                    </div>
                  </div>

                  <DndContext onDragEnd={handleDragEnd}>
                    <div
                      ref={canvasContainerRef}
                      className="relative w-full border border-gray-700 rounded-xl overflow-hidden shadow-sm bg-gray-900"
                      style={{
                        aspectRatio: '16/9'
                      }}
                    >
                      {/* Mesas draggable */}
                      {tables.map(table => {
                        const isSelected = selectedTableId === table.id;
                        const tableColor = getTableTypeColor(table.table_type_id);

                        return (
                          <DraggableTable
                            key={table.id}
                            table={table}
                            isSelected={isSelected}
                            tableColor={tableColor}
                            onSelect={setSelectedTableId}
                            scale={canvasScale}
                          />
                        );
                      })}
                    </div>
                  </DndContext>

                  {/* Info de mesa seleccionada */}
                  {selectedTableId && (
                    <div className="mt-3 p-4 border border-gray-700 rounded-lg bg-gray-900">
                      {(() => {
                        const table = tables.find(t => t.id === selectedTableId);
                        if (!table) return null;
                        const shapeNames = {
                          circle: 'Circular',
                          rectangle: 'Rectangular',
                          square: 'Cuadrada'
                        };
                        return (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                                  style={{ backgroundColor: getTableTypeColor(table.table_type_id) }}
                                >
                                  {table.table_type?.icon || '🪑'}
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-white">
                                    Mesa {table.table_number}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {table.table_type?.name}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-gray-700/70 rounded px-2 py-1 text-gray-300">
                                  <span className="text-gray-400">Forma:</span> {shapeNames[table.shape]}
                                </div>
                                <div className="bg-gray-700/70 rounded px-2 py-1 text-gray-300">
                                  <span className="text-gray-400">Tamaño:</span> {table.width}×{table.height}px
                                </div>
                                <div className="bg-gray-700/70 rounded px-2 py-1 col-span-2 text-gray-300">
                                  <span className="text-gray-400">Posición:</span> X: {Math.round(table.position_x)}, Y: {Math.round(table.position_y)}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingTable(table);
                                }}
                                className="px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-accent transition whitespace-nowrap"
                              >
                                ✏️ Editar
                              </button>
                              <button
                                onClick={() => handleDeleteTable(table.id)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition whitespace-nowrap"
                              >
                                🗑️ Eliminar
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
