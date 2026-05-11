import { motion } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Zap, CreditCard, Settings, Shield } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const categories = [
    { id: 'all', name: 'Todas', icon: HelpCircle },
    { id: 'general', name: 'General', icon: Zap },
    { id: 'payments', name: 'Pagos', icon: CreditCard },
    { id: 'technical', name: 'Técnicas', icon: Settings },
    { id: 'security', name: 'Seguridad', icon: Shield }
  ];

  const faqs = [
    {
      category: 'general',
      question: '¿Qué es TuMesaHoy?',
      answer: 'TuMesaHoy es una plataforma SaaS diseñada para digitalizar negocios gastronómicos. Te permite crear tu menú digital, gestionar reservas, configurar horarios y obtener analíticas, todo en un solo lugar. Es la solución perfecta para heladerías, cafés, restaurantes, pizzerías y cualquier negocio de comida que quiera tener presencia digital profesional.'
    },
    {
      category: 'general',
      question: '¿Cuánto tiempo toma configurar mi negocio?',
      answer: 'La configuración inicial toma aproximadamente 20-30 minutos. En ese tiempo puedes: crear tu cuenta, agregar información de tu negocio, subir tu logo y portada, crear categorías de menú, agregar tus primeros items con fotos y precios, y configurar tus horarios de atención. Una vez completado, tu página estará lista para compartir con tus clientes.'
    },
    {
      category: 'general',
      question: '¿Necesito conocimientos técnicos?',
      answer: 'No, para nada. TuMesaHoy está diseñado para ser extremadamente simple e intuitivo. Si sabes usar WhatsApp o Instagram, puedes usar TuMesaHoy sin problemas. Además, incluimos tutoriales en video y soporte personalizado si lo necesitas.'
    },
    {
      category: 'general',
      question: '¿Puedo probar antes de pagar?',
      answer: 'Actualmente ofrecemos una garantía de satisfacción del 100%. Si no estás conforme con TuMesaHoy en los primeros 7 días, te devolvemos tu dinero sin preguntas. Esto te permite probar todas las funcionalidades con total tranquilidad.'
    },
    {
      category: 'payments',
      question: '¿Cuánto cuesta TuMesaHoy?',
      answer: 'El costo es de $120.000 ARS por mes, sin costos ocultos ni comisiones por reserva. Este precio incluye: menú digital ilimitado, gestión de reservas sin límite, panel de analytics completo, soporte por WhatsApp y email, actualizaciones gratuitas, y almacenamiento de imágenes. Es un precio fijo que no aumenta con tu crecimiento.'
    },
    {
      category: 'payments',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todos los métodos de pago a través de Mercado Pago: tarjetas de crédito (todas las marcas), tarjetas de débito, Mercado Pago wallet, efectivo (Rapipago/Pago Fácil) y transferencia bancaria. El pago es 100% seguro y encriptado.'
    },
    {
      category: 'payments',
      question: '¿Hay comisiones adicionales por reserva?',
      answer: 'No, absolutamente ninguna. A diferencia de otras plataformas que cobran entre 5-15% de comisión por reserva o venta, nosotros cobramos solo la suscripción mensual. No importa si recibes 10 o 1000 reservas al mes, el precio es siempre el mismo. Tu crecimiento no nos cuesta más.'
    },
    {
      category: 'payments',
      question: '¿Puedo cancelar mi suscripción?',
      answer: 'Sí, puedes cancelar en cualquier momento desde tu panel de administración. No hay penalidades ni permanencia mínima. Si cancelas, tu servicio permanecerá activo hasta el final del período que ya pagaste, y luego tu cuenta pasará a modo "pausado" (tus datos se conservan por 60 días por si decides volver).'
    },
    {
      category: 'payments',
      question: '¿Ofrecen factura?',
      answer: 'Sí, emitimos factura electrónica tipo A o B (según corresponda) automáticamente después de cada pago. La factura se envía a tu email y también está disponible para descarga en tu panel de administración en la sección "Facturación".'
    },
    {
      category: 'technical',
      question: '¿Cómo subo fotos de mis platos?',
      answer: 'Es muy simple: ve a tu panel de administración → sección "Menú" → selecciona una categoría → clic en "Agregar Item" → completa nombre, descripción y precio → clic en "Subir Imagen" → selecciona la foto desde tu computadora o celular → listo. Las fotos se optimizan automáticamente para web y se ven perfectas en todos los dispositivos.'
    },
    {
      category: 'technical',
      question: '¿Puedo editar el menú después de publicarlo?',
      answer: 'Sí, puedes editar tu menú las veces que quieras, sin límite. Los cambios se reflejan instantáneamente en tu página pública. Puedes agregar items, eliminarlos, cambiar precios, actualizar descripciones, reorganizar categorías, marcar items como no disponibles temporalmente, etc.'
    },
    {
      category: 'technical',
      question: '¿Cómo funcionan las reservas?',
      answer: 'Los clientes ingresan a tu página pública, completan un formulario simple (nombre, teléfono, fecha, hora, cantidad de personas), y la reserva llega instantáneamente a tu panel de administración. Recibes una notificación y puedes confirmar, modificar o cancelar la reserva. También puedes contactar directamente al cliente por WhatsApp con un solo clic.'
    },
    {
      category: 'technical',
      question: '¿Puedo desactivar las reservas temporalmente?',
      answer: 'Sí, hay un interruptor simple en tu panel que te permite pausar las reservas en cualquier momento (por ejemplo, si estás de vacaciones o lleno). Cuando las desactivas, tus clientes siguen viendo tu menú y horarios, pero no pueden hacer nuevas reservas hasta que las reactives.'
    },
    {
      category: 'technical',
      question: '¿Cómo comparto mi página con clientes?',
      answer: 'Tienes varias opciones: 1) Código QR descargable para imprimir y poner en tu local, 2) Link directo para compartir por WhatsApp, redes sociales o email, 3) Botón "Compartir" con opciones rápidas para Facebook, Instagram, Twitter, etc. Tu página URL es algo como: tumesahoy.com/negocio/tu-negocio'
    },
    {
      category: 'security',
      question: '¿Mis datos están seguros?',
      answer: 'Absolutamente. Usamos Supabase, una plataforma enterprise-grade con certificación SOC 2 Type 2. Todos los datos están encriptados en tránsito (SSL/TLS) y en reposo (AES-256). Tenemos backups automáticos diarios. No compartimos ni vendemos tus datos a terceros jamás. Además, cumplimos con la Ley de Protección de Datos Personales de Argentina.'
    },
    {
      category: 'security',
      question: '¿Quién puede ver la información de mis clientes?',
      answer: 'Solo tú. Las reservas y datos de clientes son privados y únicamente accesibles desde tu cuenta. Implementamos Row Level Security (RLS) en la base de datos, lo que significa que es técnicamente imposible que otro usuario vea tus datos, incluso si hubiera una vulnerabilidad en el sistema.'
    },
    {
      category: 'security',
      question: '¿Qué pasa si olvido mi contraseña?',
      answer: 'Puedes recuperarla fácilmente desde la pantalla de login con el botón "¿Olvidaste tu contraseña?". Te enviamos un email con un link de recuperación seguro que expira en 1 hora. Nunca enviamos la contraseña por email (de hecho, ni siquiera la conocemos porque está hasheada).'
    },
    {
      category: 'general',
      question: '¿Funciona en celulares?',
      answer: 'Sí, perfectamente. Tanto tu panel de administración como la página pública de tu negocio están 100% optimizados para celulares, tablets y computadoras. Diseño responsive que se adapta a cualquier tamaño de pantalla. Más del 80% de tus clientes verán tu menú desde el celular.'
    },
    {
      category: 'general',
      question: '¿Puedo tener múltiples negocios?',
      answer: 'Actualmente cada cuenta permite gestionar un negocio. Si tienes múltiples locales, puedes crear cuentas separadas para cada uno. Estamos trabajando en un plan "Multi-Local" que permitirá gestionar varios negocios desde una sola cuenta. Si te interesa, contáctanos para beta testing.'
    },
    {
      category: 'general',
      question: '¿Ofrecen soporte técnico?',
      answer: 'Sí, soporte incluido sin costo adicional por WhatsApp y email. Horario de atención: Lunes a Viernes 9:00-18:00, Sábados 10:00-14:00. Tiempo de respuesta promedio: menos de 2 horas en horario hábil. También tenemos una base de conocimiento completa con tutoriales en video y artículos detallados.'
    },
    {
      category: 'technical',
      question: '¿Puedo personalizar los colores de mi página?',
      answer: 'Actualmente todas las páginas usan nuestro diseño profesional con los colores de marca de TuMesaHoy (turquesa y verde). Esto garantiza consistencia y calidad. En el futuro lanzaremos la personalización de colores. Por ahora puedes personalizar: logo, portada, fotos de platos, descripción, horarios, y todos los textos.'
    },
    {
      category: 'technical',
      question: '¿Las fotos tienen límite de tamaño?',
      answer: 'El tamaño máximo por foto es 5 MB. Recomendamos fotos de buena calidad pero no es necesario que sean profesionales. Las fotos se optimizan automáticamente: se redimensionan, comprimen y convierten al formato más eficiente. No hay límite de cantidad de fotos que puedes subir.'
    },
    {
      category: 'payments',
      question: '¿Qué incluye el plan mensual?',
      answer: 'El plan de $120.000/mes incluye TODO: ✓ Menú digital ilimitado, ✓ Gestión de reservas ilimitadas, ✓ Página pública personalizada, ✓ Código QR descargable, ✓ Panel de analytics y estadísticas, ✓ Storage para imágenes, ✓ Actualizaciones automáticas, ✓ Soporte por WhatsApp/Email, ✓ SSL y seguridad enterprise, ✓ 99.9% uptime garantizado. Sin cargos ocultos ni sorpresas.'
    },
    {
      category: 'technical',
      question: '¿Cómo funcionan los horarios?',
      answer: 'Configuras tus horarios día por día (Lunes a Domingo). Para cada día puedes: marcar si está cerrado, establecer hora de apertura y cierre (formato 24hs), y guardar. Los horarios se muestran automáticamente en tu página pública y ayudan a los clientes a saber cuándo pueden visitarte o hacer reservas.'
    },
    {
      category: 'general',
      question: '¿Qué analíticas puedo ver?',
      answer: 'Tu dashboard incluye: total de reservas (por estado: pendientes, confirmadas, canceladas, completadas), personas atendidas, promedio de personas por reserva, horarios más populares (top 5), reservas por día de la semana, estadísticas del menú (total de categorías e items), actividad reciente, y más. Los datos se actualizan en tiempo real.'
    },
    {
      category: 'technical',
      question: '¿Puedo exportar mis datos?',
      answer: 'Sí, puedes exportar tus reservas en formato CSV/Excel desde el panel de administración. Esto es útil para análisis externos, respaldos, o integración con otros sistemas. En el futuro agregaremos exportación de menú y más opciones de descarga.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-light to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Preguntas Frecuentes
              </h1>
              <p className="text-xl text-neutral-medium leading-relaxed mb-8">
                Encuentra respuestas rápidas a las dudas más comunes
              </p>

              {/* Search */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-medium w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar en preguntas frecuentes..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#A7B1B7]/30 focus:outline-none focus:border-[#22B8C7] transition-colors"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                      : 'bg-neutral-light text-neutral-medium hover:bg-primary/10'
                  }`}
                >
                  <category.icon className="w-5 h-5" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-neutral-medium mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-neutral-dark mb-2">
                  No encontramos resultados
                </h3>
                <p className="text-neutral-medium">
                  Intenta con otras palabras clave o{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    contáctanos directamente
                  </a>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-light transition-colors"
                    >
                      <span className="font-bold text-neutral-dark text-lg pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 text-primary flex-shrink-0 transition-transform ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-5 text-neutral-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6 }}
              >
                <div className="text-5xl font-bold text-primary mb-2">
                  {faqs.length}
                </div>
                <div className="text-neutral-medium">
                  Preguntas Respondidas
                </div>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="text-5xl font-bold text-primary mb-2">
                  &lt;2h
                </div>
                <div className="text-neutral-medium">
                  Tiempo de Respuesta
                </div>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="text-5xl font-bold text-primary mb-2">
                  98%
                </div>
                <div className="text-neutral-medium">
                  Satisfacción de Clientes
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                ¿Aún tienes dudas?
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Nuestro equipo está disponible para ayudarte
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  Contactar Soporte
                </a>
                <a
                  href="/help-center"
                  className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Ver Centro de Ayuda
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
