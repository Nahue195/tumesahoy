import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'tips', name: 'Tips de Negocio' },
    { id: 'technology', name: 'Tecnología' },
    { id: 'success', name: 'Casos de Éxito' },
    { id: 'trends', name: 'Tendencias' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: '10 Tips para Aumentar tus Reservas en Temporada Alta',
      excerpt: 'Descubre las estrategias que funcionan para llenar tu local en los momentos más importantes del año.',
      category: 'tips',
      author: 'María González',
      date: '2024-12-05',
      readTime: '5 min',
      image: '📈',
      featured: true
    },
    {
      id: 2,
      title: 'Cómo Crear un Menú Digital que Vende Más',
      excerpt: 'La psicología detrás de un menú efectivo: diseño, precios y descripciones que convierten.',
      category: 'tips',
      author: 'Carlos Rodríguez',
      date: '2024-12-01',
      readTime: '7 min',
      image: '🍽️',
      featured: true
    },
    {
      id: 3,
      title: 'Códigos QR: La Revolución en Restaurantes',
      excerpt: 'Por qué los códigos QR llegaron para quedarse y cómo aprovecharlos al máximo en tu negocio.',
      category: 'technology',
      author: 'Juan Pérez',
      date: '2024-11-28',
      readTime: '4 min',
      image: '📱',
      featured: false
    },
    {
      id: 4,
      title: 'Historia de Éxito: La Heladería de Lucía',
      excerpt: 'De 10 reservas al mes a más de 200. Cómo Lucía transformó su heladería con TuMesaHoy.',
      category: 'success',
      author: 'Laura Martínez',
      date: '2024-11-25',
      readTime: '6 min',
      image: '🍦',
      featured: true
    },
    {
      id: 5,
      title: 'Tendencias Gastronómicas 2025',
      excerpt: 'Las tendencias que marcarán el año: desde menús sustentables hasta experiencias inmersivas.',
      category: 'trends',
      author: 'María González',
      date: '2024-11-20',
      readTime: '8 min',
      image: '🌟',
      featured: false
    },
    {
      id: 6,
      title: 'WhatsApp Business para Restaurantes',
      excerpt: 'Aprende a usar WhatsApp Business para comunicarte efectivamente con tus clientes.',
      category: 'technology',
      author: 'Juan Pérez',
      date: '2024-11-15',
      readTime: '5 min',
      image: '💬',
      featured: false
    },
    {
      id: 7,
      title: 'Gestión de Reservas: Errores Comunes',
      excerpt: 'Los 7 errores más comunes al gestionar reservas y cómo evitarlos para no perder clientes.',
      category: 'tips',
      author: 'Laura Martínez',
      date: '2024-11-10',
      readTime: '6 min',
      image: '⚠️',
      featured: false
    },
    {
      id: 8,
      title: 'Fotografía de Alimentos: Guía Básica',
      excerpt: 'Consejos prácticos para tomar fotos profesionales de tus platos con solo tu celular.',
      category: 'tips',
      author: 'Carlos Rodríguez',
      date: '2024-11-05',
      readTime: '7 min',
      image: '📸',
      featured: false
    },
    {
      id: 9,
      title: 'El Café de Pedro: De Local a Fenómeno',
      excerpt: 'Cómo un pequeño café de barrio se convirtió en el lugar más buscado de la zona.',
      category: 'success',
      author: 'Laura Martínez',
      date: '2024-11-01',
      readTime: '5 min',
      image: '☕',
      featured: false
    }
  ];

  const filteredPosts = selectedCategory === 'all'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-light to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Blog
              </h1>
              <p className="text-xl text-neutral-medium leading-relaxed max-w-3xl mx-auto">
                Consejos, tendencias y casos de éxito para hacer crecer tu negocio gastronómico
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark mb-8">Destacados</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center text-7xl">
                    {post.image}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                      <span className="text-neutral-medium text-sm">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-dark mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-neutral-medium mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-medium">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-medium">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString('es-AR')}</span>
                      </div>
                    </div>
                    <button className="mt-4 flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                      Leer más <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                      : 'bg-neutral-light text-neutral-medium hover:bg-primary/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-dark mb-8">
              {selectedCategory === 'all' ? 'Todos los Artículos' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
                    {post.image}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-primary text-sm font-semibold">
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                      <span className="text-neutral-medium text-sm ml-auto">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-dark mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-neutral-medium text-sm mb-4 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-medium mb-3">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                      <span className="mx-2">•</span>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString('es-AR')}</span>
                    </div>
                    <button className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                      Leer artículo <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                No te pierdas ningún artículo
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Suscríbete a nuestro newsletter y recibe los mejores consejos directamente en tu email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
                  Suscribirse
                </button>
              </div>
              <p className="text-white/70 text-sm mt-4">
                Sin spam. Puedes darte de baja en cualquier momento.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
