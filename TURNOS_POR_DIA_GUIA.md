# Guía: Sistema de Turnos por Día

## 📋 Descripción

Esta funcionalidad permite habilitar/deshabilitar turnos específicos (Almuerzo, Cena, etc.) para cada día de la semana. Ahora los dueños de negocios pueden tener un control granular sobre qué turnos están disponibles cada día.

## ✨ Características

- **Turnos configurables**: Crea turnos personalizados (Almuerzo, Cena, Merienda, Happy Hour, etc.)
- **Control por día**: Habilita o deshabilita cada turno para cada día de la semana
- **Horarios personalizables**: Define los horarios disponibles para cada turno
- **Iconos visuales**: Usa emojis para identificar fácilmente cada turno
- **Filtrado automático**: Los clientes solo ven turnos disponibles para el día seleccionado

## 🚀 Pasos de Implementación

### 1. Ejecutar el Script SQL

Ve a tu panel de Supabase:

1. Dashboard > SQL Editor
2. Nueva Query
3. Copia y pega el contenido de `add-day-shifts-relation.sql`
4. Ejecuta el script (RUN)

Esto creará:
- Tabla `business_day_shifts` (relación día-turno)
- Políticas RLS necesarias
- Función helper `enable_shift_for_all_days()`

### 2. Verificar Migración de Datos Existentes (Opcional)

Si ya tenías turnos configurados en `business_shifts`, necesitas crear las relaciones en `business_day_shifts`.

Puedes ejecutar este script para habilitar automáticamente todos los turnos existentes en todos los días:

```sql
-- Habilitar todos los turnos existentes para todos los días
DO $$
DECLARE
  shift_record RECORD;
BEGIN
  FOR shift_record IN
    SELECT id, business_id FROM public.business_shifts
  LOOP
    PERFORM enable_shift_for_all_days(
      shift_record.business_id,
      shift_record.id
    );
  END LOOP;
END $$;
```

### 3. Probar la Funcionalidad

1. **Panel de Admin**:
   - Ve a tu panel de administración
   - Busca la sección "Gestión de Turnos de Reserva"
   - Crea un nuevo turno (ej: "Almuerzo")
   - Habilita/deshabilita días específicos usando los botones

2. **Página Pública**:
   - Ve a tu página pública del negocio
   - Selecciona una fecha
   - Solo verás los turnos habilitados para ese día

## 📖 Cómo Usar

### Para Dueños de Negocios

#### Crear un Turno Nuevo

1. Ve al panel de Admin
2. Sección "Gestión de Turnos de Reserva"
3. Click en "+ Nuevo turno"
4. Completa el formulario:
   - **Nombre**: Ej: "Almuerzo", "Cena"
   - **Icono**: Selecciona un emoji
   - **Hora inicio/fin**: Define el rango del turno
   - **Horarios disponibles**: Los horarios específicos que los clientes pueden elegir
5. Click en "Crear turno"

Por defecto, el turno se habilitará para todos los días de la semana.

#### Configurar Turnos por Día

1. Click en "✏️ Editar turnos"
2. Para cada turno, verás los 7 días de la semana
3. Los días en color (azul/verde) están habilitados
4. Los días en gris están deshabilitados
5. Click en cualquier día para cambiar su estado
6. Click en "Finalizar edición" cuando termines

**Ejemplo de configuración típica:**
- **Lunes a Viernes**: Solo "Almuerzo" (12:00-16:00)
- **Sábado**: "Almuerzo" y "Cena" (20:00-00:00)
- **Domingo**: Cerrado (ningún turno habilitado)

#### Eliminar un Turno

1. Click en "✏️ Editar turnos"
2. Click en "🗑️ Eliminar" en el turno que quieras borrar
3. Confirma la acción

⚠️ **Advertencia**: Eliminar un turno también eliminará todas sus configuraciones de días.

### Para Clientes

1. Selecciona una fecha en el formulario de reserva
2. Los turnos disponibles aparecerán automáticamente
3. Si no hay turnos disponibles para ese día, verás un mensaje sugiriendo contactar por WhatsApp

## 🗂️ Estructura de Datos

### Tabla: `business_shifts`
Almacena los turnos configurados (global).

```sql
{
  id: UUID,
  business_id: UUID,
  name: 'Almuerzo',
  icon: '☀️',
  start_time: '12:00',
  end_time: '16:00',
  available_times: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
  display_order: 0,
  is_active: true
}
```

### Tabla: `business_day_shifts`
Relación entre días y turnos (específico por día).

```sql
{
  id: UUID,
  business_id: UUID,
  shift_id: UUID,
  day_of_week: 1, // 0=Domingo, 1=Lunes, ..., 6=Sábado
  is_active: true
}
```

## 🔍 Ejemplos de Uso

### Ejemplo 1: Restaurante con horarios diferenciados

**Configuración:**
- Turno "Almuerzo" (☀️): 12:00-16:00
- Turno "Cena" (🌙): 20:00-00:00

**Por día:**
- Lunes-Viernes: Solo Almuerzo
- Sábado: Almuerzo + Cena
- Domingo: Solo Cena

### Ejemplo 2: Cafetería

**Configuración:**
- Turno "Desayuno" (☕): 08:00-12:00
- Turno "Almuerzo" (🍽️): 12:00-16:00
- Turno "Merienda" (🍰): 16:00-20:00

**Por día:**
- Lunes-Viernes: Desayuno + Almuerzo + Merienda
- Sábado: Desayuno + Merienda
- Domingo: Solo Merienda

### Ejemplo 3: Bar

**Configuración:**
- Turno "Happy Hour" (🍺): 18:00-21:00
- Turno "Noche" (🌙): 21:00-03:00

**Por día:**
- Lunes-Jueves: Cerrado
- Viernes-Sábado: Happy Hour + Noche
- Domingo: Solo Noche

## 🐛 Solución de Problemas

### Los turnos no aparecen en la página pública

**Posibles causas:**
1. No hay turnos configurados → Crea al menos un turno
2. No hay días habilitados → Habilita al menos un día para el turno
3. El día seleccionado no tiene turnos → Selecciona otro día o habilita turnos para ese día

### No puedo habilitar/deshabilitar días

**Solución:**
1. Verifica que estés en modo edición (click en "✏️ Editar turnos")
2. Recarga la página si el problema persiste

### Los cambios no se guardan

**Verifica:**
1. Que las políticas RLS estén configuradas correctamente
2. Que el script SQL se haya ejecutado sin errores
3. Los logs de la consola del navegador para más detalles

## 📝 Notas Técnicas

- La relación `business_day_shifts` tiene un constraint UNIQUE en `(business_id, day_of_week, shift_id)` para evitar duplicados
- Los cambios se guardan inmediatamente al hacer click en cada día (no requiere botón "Guardar")
- Si no hay registros en `business_day_shifts` para un negocio, se mostrarán todos los turnos por defecto (compatibilidad con versiones anteriores)
- Los turnos con `is_active = false` en `business_shifts` no se mostrarán nunca, independientemente de la configuración por día

## 🎯 Próximas Mejoras Sugeridas

- [ ] Editor de horarios disponibles desde el panel de admin (sin tener que eliminar y recrear el turno)
- [ ] Duplicar turnos entre días
- [ ] Configuración de excepciones (días festivos, eventos especiales)
- [ ] Vista de calendario mensual con turnos habilitados
- [ ] Estadísticas de reservas por turno y día

## 📞 Soporte

Si encontrás algún problema o tenés sugerencias, por favor:
1. Revisá los logs de la consola del navegador
2. Verificá que el script SQL se ejecutó correctamente
3. Revisá las políticas RLS en Supabase

---

✅ **¡Funcionalidad implementada exitosamente!**
