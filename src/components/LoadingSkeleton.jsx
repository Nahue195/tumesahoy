import { motion } from 'framer-motion';

// Componente base de skeleton con animación
function SkeletonBase({ className = "", dark = false }) {
  return (
    <motion.div
      className={`rounded ${className} ${
        dark
          ? 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700'
          : 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'
      }`}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 1.5,
        ease: 'linear',
        repeat: Infinity,
      }}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

// Skeleton para tarjetas de tiendas (StoresPage)
export function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border-2 border-gray-100">
      {/* Imagen */}
      <SkeletonBase className="h-40 sm:h-48 w-full" />

      {/* Contenido */}
      <div className="p-4 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
        {/* Título */}
        <SkeletonBase className="h-5 sm:h-6 w-3/4" />

        {/* Categoría */}
        <SkeletonBase className="h-3 sm:h-4 w-1/3" />

        {/* Descripción */}
        <div className="space-y-1.5 sm:space-y-2">
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-5/6" />
        </div>

        {/* Dirección */}
        <SkeletonBase className="h-3 sm:h-4 w-2/3" />

        {/* Botón */}
        <SkeletonBase className="h-9 sm:h-10 w-full rounded-lg mt-3 sm:mt-4" />
      </div>
    </div>
  );
}

// Skeleton para BusinessPage
export function BusinessPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F7F8]">
      {/* Navbar */}
      <div className="bg-white shadow-sm h-14 sm:h-16 fixed top-0 left-0 right-0 z-50" />

      {/* Hero */}
      <div className="mt-14 sm:mt-16">
        <SkeletonBase className="h-[250px] sm:h-[350px] md:h-[400px] w-full" />
      </div>

      {/* Info bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6">
            <SkeletonBase className="h-3 sm:h-4 w-24 sm:w-32" />
            <SkeletonBase className="h-3 sm:h-4 w-24 sm:w-32" />
            <SkeletonBase className="h-3 sm:h-4 w-24 sm:w-32" />
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        {/* Formulario de reserva */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
          <SkeletonBase className="h-6 sm:h-8 w-40 sm:w-48 mb-4 sm:mb-6" />
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <SkeletonBase className="h-10 sm:h-12 rounded-lg" />
              <SkeletonBase className="h-10 sm:h-12 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <SkeletonBase className="h-10 sm:h-12 rounded-lg" />
              <SkeletonBase className="h-10 sm:h-12 rounded-lg" />
              <SkeletonBase className="h-10 sm:h-12 rounded-lg" />
            </div>
            <SkeletonBase className="h-20 sm:h-24 rounded-lg" />
            <SkeletonBase className="h-10 sm:h-12 rounded-lg" />
          </div>
        </div>

        {/* Menú */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6">
          <SkeletonBase className="h-6 sm:h-8 w-40 sm:w-48 mb-4 sm:mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 border-gray-100">
                <SkeletonBase className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1.5 sm:space-y-2">
                  <SkeletonBase className="h-4 sm:h-5 w-3/4" />
                  <SkeletonBase className="h-3 w-full" />
                  <SkeletonBase className="h-3 sm:h-4 w-1/3 mt-1 sm:mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton para AdminPage stats
export function StatCardSkeleton() {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <SkeletonBase dark className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
        <SkeletonBase dark className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
      </div>
      <SkeletonBase dark className="h-3 sm:h-4 w-28 sm:w-32" />
    </div>
  );
}

// Skeleton para tabla de reservas
export function ReservationCardSkeleton() {
  return (
    <div className="border border-gray-700 bg-gray-900 rounded-lg p-3 sm:p-4">
      <div className="flex flex-col md:flex-row items-start md:justify-between gap-3 sm:gap-4">
        <div className="flex-1 w-full space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <SkeletonBase dark className="h-5 sm:h-6 w-28 sm:w-32" />
            <SkeletonBase dark className="h-4 sm:h-5 w-16 sm:w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <SkeletonBase dark className="h-3 sm:h-4 w-20 sm:w-24" />
            <SkeletonBase dark className="h-3 sm:h-4 w-20 sm:w-24" />
            <SkeletonBase dark className="h-3 sm:h-4 w-20 sm:w-24" />
            <SkeletonBase dark className="h-3 sm:h-4 w-20 sm:w-24" />
          </div>
        </div>
        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto md:min-w-[140px]">
          <SkeletonBase dark className="h-9 sm:h-10 flex-1 md:flex-initial md:w-full rounded-lg" />
          <SkeletonBase dark className="h-9 sm:h-10 flex-1 md:flex-initial md:w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Skeleton genérico para listas
export function ListSkeleton({ items = 3 }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonBase key={i} className="h-10 sm:h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

// Skeleton para card simple
export function CardSkeleton({ className = "" }) {
  return (
    <div className={`bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4 sm:p-5 md:p-6 ${className}`}>
      <SkeletonBase dark className="h-5 sm:h-6 w-1/3 mb-3 sm:mb-4" />
      <div className="space-y-2 sm:space-y-3">
        <SkeletonBase dark className="h-3 sm:h-4 w-full" />
        <SkeletonBase dark className="h-3 sm:h-4 w-5/6" />
        <SkeletonBase dark className="h-3 sm:h-4 w-4/6" />
      </div>
    </div>
  );
}

export default SkeletonBase;
