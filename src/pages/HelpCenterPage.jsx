import { motion } from 'framer-motion';
import { Search, BookOpen, Video, FileText, HelpCircle, MessageCircle, Zap, Settings, CreditCard, Users } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const categories = [
    {
      icon: Zap,
      title: 'Primeros Pasos',
      description: 'Guías para comenzar con TuMesaHoy',
      color: 'from-yellow-400 to-orange-500',
      articles: 5
    },
    {
      icon: Settings,
      title: 'Configuración',
      description: 'Personaliza tu negocio y menú',
      color: 'from-blue-400 to-cyan-500',
      articles: 8
    },
    {
      icon: Users,
      title: 'Gestión de Reservas',
      description: 'Administra tus reservas eficientemente',
      color: 'from-purple-400 to-pink-500',
      articles: 6
    },
    {
      icon: CreditCard,
      title: 'Pagos y Facturación',
      description: 'Todo sobre suscripciones y pagos',
      color: 'from-green-400 to-emerald-500',
      articles: 4
    }
  ];

  const popularArticles = [
    {
      title: 'Cómo crear tu primer menú digital',
      category: 'Primeros Pasos',
      views: '1.2k vistas',
      readTime: '5 min'
    },
    {
      title: 'Configurar horarios de atención',
      category: 'Configuración',
      views: '890 vistas',
      readTime: '3 min'
    },
    {
      title: 'Gestionar y confirmar reservas',
      category: 'Gestión de Reservas',
      views: '756 vistas',
      readTime: '4 min'
    },
    {
      title: 'Subir fotos de tus platos',
      category: 'Configuración',
      views: '654 vistas',
      readTime: '3 min'
    },
    {
      title: 'Compartir tu código QR',
      category: 'Primeros Pasos',
      views: '543 vistas',
      readTime: '2 min'
    },
    {
      title: 'Cancelar o modificar suscripción',
      category: 'Pagos y Facturación',
      views: '432 vistas',
      readTime: '3 min'
    }
  ];

  const guides = [
    {
      icon: Video,
      title: 'Video Tutoriales',
      description: 'Aprende viendo paso a paso',
      count: '12 videos',
      color: 'bg-red-500'
    },
    {
      icon: BookOpen,
      title: 'Guías Completas',
      description: 'Documentación detallada',
      count: '25 guías',
      color: 'bg-blue-500'
    },
    {
      icon: FileText,
      title: 'Artículos',
      description: 'Tips y mejores prácticas',
      count: '40 artículos',
      color: 'bg-green-500'
    }
  ];

  const quickLinks = [
    { title: '¿Cómo empiezo?', link: '#' },
    { title: 'Crear categorías de menú', link: '#' },
    { title: 'Agregar items al menú', link: '#' },
    { title: 'Configurar WhatsApp', link: '#' },
    { title: 'Ver analíticas', link: '#' },
    { title: 'Exportar datos', link: '#' },
    { title: 'Cambiar plan', link: '#' },
    { title: 'Actualizar información', link: '#' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-light to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with Search */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-r from-primary to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Centro de Ayuda
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                ¿En qué podemos ayudarte hoy?
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-medium w-6 h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca artículos, guías, tutoriales..."
                  className="w-full pl-14 pr-4 py-5 rounded-2xl text-lg focus:outline-none focus:ring-4 focus:ring-white/50 shadow-2xl"
                />
              </div>

              <div className="flex flex-wrap gap-3 justify-center mt-6">
                <span className="text-white/70 text-sm">Búsquedas populares:</span>
                <button className="px-4 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition">
                  menú digital
                </button>
                <button className="px-4 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition">
                  reservas
                </button>
                <button className="px-4 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition">
                  horarios
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-dark mb-4">
                Explora por Categoría
              </h2>
              <p className="text-neutral-medium text-lg">
                Encuentra respuestas organizadas por tema
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <category.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-dark mb-2">
                    {category.title}
                  </h3>
                  <p className="text-neutral-medium mb-4 text-sm">
                    {category.description}
                  </p>
                  <span className="text-primary font-semibold text-sm">
                    {category.articles} artículos →
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-dark mb-4">
                Artículos Populares
              </h2>
              <p className="text-neutral-medium text-lg">
                Los más leídos por nuestra comunidad
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.map((article, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="bg-neutral-light p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                >
                  <span className="inline-block px-3 py-1 bg-[#22B8C7]/10 text-primary rounded-full text-xs font-semibold mb-3">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-dark mb-3 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-neutral-medium">
                    <span>{article.views}</span>
                    <span>{article.readTime}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Guides */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-dark mb-4">
                Recursos de Aprendizaje
              </h2>
              <p className="text-neutral-medium text-lg">
                Elige tu forma favorita de aprender
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {guides.map((guide, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center group cursor-pointer"
                >
                  <div className={`w-16 h-16 ${guide.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <guide.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-dark mb-2">
                    {guide.title}
                  </h3>
                  <p className="text-neutral-medium mb-4">
                    {guide.description}
                  </p>
                  <span className="text-primary font-semibold">
                    {guide.count} disponibles
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-dark mb-4">
                Accesos Rápidos
              </h2>
              <p className="text-neutral-medium text-lg">
                Atajos a las tareas más comunes
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.link}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="bg-neutral-light p-4 rounded-xl hover:bg-[#22B8C7]/10 hover:text-primary transition-all font-semibold text-neutral-dark flex items-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  {link.title}
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <MessageCircle className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">
                ¿No encontraste lo que buscabas?
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Nuestro equipo de soporte está listo para ayudarte
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  Contactar Soporte
                </a>
                <a
                  href="/faq"
                  className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Ver Preguntas Frecuentes
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
