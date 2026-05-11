#!/bin/bash

# ============================================
# Script de RESET COMPLETO y SETUP
# ============================================

echo "🔥 INICIANDO RESET COMPLETO DEL PROYECTO"
echo "========================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para preguntar confirmación
confirm() {
    read -p "⚠️  ¿Estás SEGURO que querés eliminar TODO? (escribe 'SI' para confirmar): " response
    if [ "$response" != "SI" ]; then
        echo "${RED}❌ Operación cancelada${NC}"
        exit 1
    fi
}

# Pedir confirmación
confirm

echo ""
echo "${YELLOW}Paso 1: Eliminando base de datos...${NC}"
supabase db reset --linked

echo ""
echo "${GREEN}✅ Base de datos eliminada${NC}"

echo ""
echo "${YELLOW}Paso 2: Ejecutando script de setup principal...${NC}"
# El reset ya ejecuta las migraciones, pero podemos forzarlas
# supabase db push

echo ""
echo "${YELLOW}Paso 3: Limpiando Storage Buckets...${NC}"
echo "ℹ️  Esto se debe hacer manualmente en el Dashboard:"
echo "   https://supabase.com/dashboard/project/dcagmqhokjcvvilvyigp/storage/buckets"

echo ""
echo "${YELLOW}Paso 4: Verificando Edge Functions...${NC}"
supabase functions list

echo ""
echo "${GREEN}✅ RESET COMPLETO EXITOSO${NC}"
echo ""
echo "📋 PRÓXIMOS PASOS MANUALES:"
echo ""
echo "1. Ir al Dashboard de Supabase:"
echo "   https://supabase.com/dashboard/project/dcagmqhokjcvvilvyigp"
echo ""
echo "2. Ir a SQL Editor y ejecutar EN ORDEN:"
echo "   ✅ supabase-setup.sql"
echo "   ✅ supabase-subscriptions.sql"
echo "   ✅ fix-reservations-people-count.sql"
echo "   ✅ fix-reservations-policies.sql"
echo ""
echo "3. Verificar Storage Buckets (o crearlos si no existen):"
echo "   ✅ business-images (público)"
echo "   ✅ menu-images (público)"
echo ""
echo "4. Configurar Secrets de Mercado Pago"
echo ""
echo "5. Ejecutar: npm run dev"
echo ""
echo "6. Ejecutar: node test-setup.js"
echo ""
