import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

export default function TableMapViewer({ businessId, selectedTypeId = null, showLegend = true }) {
  const [floorPlan, setFloorPlan] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableTypes, setTableTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canvasScale, setCanvasScale] = useState(1);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Cargar datos
  useEffect(() => {
    if (!businessId) return;
    loadMapData();
  }, [businessId]);

  // Calcular escala responsive
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const logicalWidth = floorPlan?.canvas_width || 1000;
      const scale = containerWidth / logicalWidth;
      setCanvasScale(scale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [floorPlan]);

  // Renderizar plano de fondo en el canvas
  useEffect(() => {
    if (!canvasRef.current || !floorPlan?.image_url) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    img.onerror = () => {
      console.error('Error cargando imagen del plano');
    };

    img.src = floorPlan.image_url;
  }, [floorPlan]);

  async function loadMapData() {
    setLoading(true);
    try {
      // Cargar plano del local
      const { data: planData, error: planError } = await supabase
        .from('floor_plans')
        .select('*')
        .eq('business_id', businessId)
        .maybeSingle();

      if (planError && planError.code !== 'PGRST116') {
        console.error('Error cargando plano:', planError);
      }
      setFloorPlan(planData);

      // Cargar tipos de mesa
      const { data: typesData, error: typesError } = await supabase
        .from('table_types')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (typesError) throw typesError;
      setTableTypes(typesData || []);

      // Cargar mesas con su tipo
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select(`
          *,
          table_type:table_types(id, name, icon, color)
        `)
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (tablesError) throw tablesError;
      setTables(tablesData || []);
    } catch (error) {
      console.error('Error cargando datos del mapa:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="relative w-full bg-neutral-light border-2 border-secondary/20 rounded-xl overflow-hidden animate-pulse" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm text-neutral-medium">Cargando mapa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="relative w-full bg-gradient-to-br from-neutral-light to-white border-2 border-neutral-medium/20 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl mb-3">🪑</div>
            <p className="text-sm sm:text-base font-semibold text-neutral-dark mb-1">
              No hay mesas configuradas
            </p>
            <p className="text-xs sm:text-sm text-neutral-medium">
              El local aún no ha configurado su mapa de mesas
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Agrupar mesas por tipo para la leyenda
  const typeGroups = tableTypes.map(type => ({
    ...type,
    count: tables.filter(t => t.table_type?.id === type.id).length
  })).filter(type => type.count > 0);

  const canvasWidth = floorPlan?.canvas_width || 1000;
  const canvasHeight = floorPlan?.canvas_height || 600;
  const backgroundColor = floorPlan?.background_color || '#F8F9FA';

  return (
    <div className="space-y-3">
      {/* Mapa */}
      <div
        ref={containerRef}
        className="relative w-full border-2 border-secondary/20 rounded-xl overflow-hidden shadow-md"
        style={{
          backgroundColor,
          aspectRatio: `${canvasWidth}/${canvasHeight}`
        }}
      >
        {/* Canvas de fondo con la imagen del plano */}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="absolute inset-0 w-full h-full"
        />

        {/* Mesas renderizadas como divs */}
        {tables.map(table => {
          const isSelectedType = selectedTypeId && table.table_type?.id === selectedTypeId;
          const tableColor = table.table_type?.color || '#FF6B35';
          const minSize = 32; // Tamaño mínimo para que se vea bien en móvil
          const tableW = Math.max(minSize, table.width * canvasScale);
          const tableH = Math.max(minSize, table.height * canvasScale);

          return (
            <motion.div
              key={table.id}
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                opacity: selectedTypeId && !isSelectedType ? 0.3 : 1
              }}
              transition={{ duration: 0.3 }}
              className={`absolute ${isSelectedType ? 'z-10' : 'z-0'}`}
              style={{
                left: `${(table.position_x / canvasWidth) * 100}%`,
                top: `${(table.position_y / canvasHeight) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${table.rotation || 0}deg)`,
                width: tableW,
                height: tableH,
                backgroundColor: tableColor,
                borderRadius: table.shape === 'circle' ? '50%' : '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: `${Math.max(10, 12 * canvasScale)}px`,
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                boxShadow: isSelectedType
                  ? '0 0 0 3px rgba(255,107,53,0.5), 0 4px 12px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            >
              {table.table_number}
            </motion.div>
          );
        })}
      </div>

      {/* Leyenda */}
      {showLegend && typeGroups.length > 0 && (
        <div className="bg-white border-2 border-neutral-medium/20 rounded-lg p-3 sm:p-4">
          <h4 className="text-xs sm:text-sm font-semibold text-neutral-dark mb-3">Leyenda:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {typeGroups.map(type => {
              const isSelected = selectedTypeId === type.id;
              return (
                <div
                  key={type.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition ${
                    isSelected ? 'bg-primary/10 border-2 border-primary/30' : 'bg-gray-50'
                  }`}
                >
                  <div
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-neutral-dark truncate">
                      {type.name}
                    </p>
                    <p className="text-xs text-neutral-medium">
                      {type.count} {type.count === 1 ? 'mesa' : 'mesas'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
