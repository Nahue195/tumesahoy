import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { StoreCardSkeleton } from '../components/LoadingSkeleton';
import { Store, Search, MapPin, Phone, MessageCircle, ArrowRight, CheckCircle, Filter, X } from 'lucide-react';
import Footer from '../components/Footer';

export default function StoresPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar tiendas desde Supabase
  useEffect(() => {
    async function loadStores() {
      try {
        // Solo campos públicos necesarios para mostrar las tarjetas
        const { data, error } = await supabase
          .from('businesses')
          .select('id, name, slug, description, cover_image_url, category, address, phone, whatsapp_number')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('Error cargando tiendas:', error);
        setStores([]);
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, []);

  const categories = ['all', ...new Set(stores.map(store => store.category))];

  const filteredStores = stores.filter(store => {
    const matchesCategory = selectedCategory === 'all' || store.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full text-primary text-sm font-semibold mb-6 border border-primary/20"
          >
            <Store className="h-4 w-4" />
            Tiendas Adheridas
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-dark mb-6 leading-tight px-4"
          >
            Descubri los mejores
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> locales </span>
            cerca tuyo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-neutral-medium mb-8 max-w-3xl mx-auto px-4"
          >
            Todos estos negocios ya están usando TuMesaHoy para gestionar sus reservas y menús digitales. Visita, reserva y disfruta!
          </motion.p>
        </div>
      </section>

      {/* Barra de Búsqueda */}
      <section className="px-4 pb-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-medium" />
            <input
              type="text"
              placeholder="Buscar por nombre, categoría o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none transition text-neutral-dark placeholder:text-neutral-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-medium hover:text-primary transition"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contador de Resultados y Filtros */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2 text-neutral-medium">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">
                {filteredStores.length} {filteredStores.length === 1 ? 'negocio encontrado' : 'negocios encontrados'}
              </span>
            </div>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-white text-neutral-medium hover:text-primary border-2 border-neutral-medium/20 hover:border-primary/50'
                }`}
              >
                {category === 'all' ? 'Todas' : category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Tiendas */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <StoreCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredStores.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Store className="h-12 w-12 text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-neutral-dark mb-2">
                {searchQuery ? 'No encontramos resultados' : 'No hay tiendas disponibles'}
              </h3>
              <p className="text-neutral-medium mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `No encontramos negocios que coincidan con "${searchQuery}". Intenta con otro término de búsqueda.`
                  : selectedCategory === 'all'
                  ? 'Todavía no hay negocios registrados. ¡Sé el primero!'
                  : 'No hay tiendas en esta categoría.'}
              </p>
              {!searchQuery && (
                <motion.button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Registrar mi Negocio
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/negocio/${store.slug}`)}
                >
                {/* Imagen/Header de la tienda */}
                <div className="h-48 relative overflow-hidden">
                  {store.cover_image_url ? (
                    <>
                      <img
                        src={store.cover_image_url}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <span className="text-white text-6xl font-bold">{store.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3" />
                    Activo
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-neutral-dark mb-2 group-hover:text-primary transition">
                        {store.name}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                        <Store className="h-3 w-3" />
                        {store.category}
                      </span>
                    </div>
                  </div>

                  {store.description && (
                    <p className="text-neutral-medium text-sm mb-4 line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  {store.address && (
                    <div className="flex items-center text-sm text-neutral-medium mb-4 gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{store.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {store.phone && (
                        <motion.a
                          href={`tel:${store.phone}`}
                          className="p-2 rounded-lg bg-neutral-light text-neutral-medium hover:bg-primary hover:text-white transition"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Phone className="h-4 w-4" />
                        </motion.a>
                      )}
                      {(store.whatsapp_number || store.phone) && (
                        <motion.a
                          href={`https://wa.me/${(store.whatsapp_number || store.phone).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-neutral-light text-secondary hover:bg-secondary hover:text-white transition"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </motion.a>
                      )}
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/negocio/${store.slug}`);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2 text-sm group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Ver Menú
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl shadow-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
            >
              <Store className="h-8 w-8 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              ¿Querés que tu negocio aparezca aquí?
            </h2>
            <p className="text-base sm:text-lg mb-8 opacity-90">
              Unite a TuMesaHoy y comenzá a recibir reservas online hoy mismo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-primary rounded-lg text-lg font-semibold hover:bg-neutral-light transition shadow-lg inline-flex items-center justify-center gap-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Registrar mi Negocio
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => navigate('/')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Conocer más
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
