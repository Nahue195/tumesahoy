import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, Quote, Calendar, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SuccessStoriesPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const successStories = [
    {
      id: 1,
      businessName: 'Restaurante La Esquina',
      owner: 'Lucía Fernández',
      location: 'Palermo, Buenos Aires',
      category: 'Restaurante',
      image: '🍽️',
      color: 'from-orange-400 to-red-500',
      stats: {
        reservationsBefore: 10,
        reservationsAfter: 215,
        revenueBefore: '$50,000',
        revenueAfter: '$180,000',
        timeSaved: '15 horas/semana'
      },
      quote: 'TuMesaHoy cambió completamente mi negocio. Pasé de gestionar todo en papel a tener un sistema profesional que me ahorra horas cada día.',
      story: 'Lucía abrió su restaurante de comida casera hace 3 años. Al principio, las reservas las tomaba por WhatsApp y las anotaba en una libreta. "Era un caos", recuerda. "Perdía reservas, había confusiones con los horarios, y pasaba todo el día al teléfono". Después de implementar TuMesaHoy, digitalizó su menú completo con fotos de sus platos del día, pastas caseras y postres, configuró su sistema de reservas y compartió el código QR en redes. Los resultados fueron inmediatos: en el primer mes triplicó sus reservas.',
      results: [
        'Aumento del 2050% en reservas mensuales',
        'Reducción de 15 horas semanales en gestión',
        'Incremento del 260% en ingresos',
        '500+ nuevos clientes en 6 meses'
      ],
      beforeAfter: {
        before: ['Reservas por WhatsApp', 'Menú en pizarra', 'Sin analíticas', 'Pérdida de clientes'],
        after: ['Sistema automatizado', 'Menú digital con fotos', 'Dashboard completo', 'Fidelización de clientes']
      }
    },
    {
      id: 2,
      businessName: 'Café del Centro',
      owner: 'Pedro Martínez',
      location: 'Microcentro, CABA',
      category: 'Café',
      image: '☕',
      color: 'from-amber-500 to-orange-600',
      stats: {
        reservationsBefore: 5,
        reservationsAfter: 180,
        revenueBefore: '$35,000',
        revenueAfter: '$120,000',
        timeSaved: '12 horas/semana'
      },
      quote: 'No puedo creer que antes perdía tanto tiempo gestionando reservas manualmente. Ahora todo es automático y tengo más tiempo para mis clientes.',
      story: 'Pedro heredó el café de su padre, un negocio tradicional de 30 años. "Mi padre hacía todo a la antigua", cuenta. "Yo quería modernizar pero sin perder la esencia". Con TuMesaHoy digitalizó el menú tradicional, agregó fotos profesionales de sus medialunas caseras y tortas, y activó las reservas online. Sus clientes habituales, muchos de ellos mayores, se sorprendieron gratamente con lo fácil que era reservar escaneando el QR en la entrada.',
      results: [
        'Aumento del 3500% en reservas',
        'Clientes recurrentes: 85%',
        'Tiempo de gestión reducido en 60%',
        'Presencia en Google Maps mejorada'
      ],
      beforeAfter: {
        before: ['Llamadas todo el día', 'Menú impreso desactualizado', 'Sin presencia online', 'Horarios confusos'],
        after: ['Reservas 24/7', 'Menú siempre actualizado', 'Página profesional', 'Horarios claros y automáticos']
      }
    },
    {
      id: 3,
      businessName: 'Pizzería Don Tano',
      owner: 'Antonio Russo',
      location: 'Villa Urquiza, CABA',
      category: 'Pizzería',
      image: '🍕',
      color: 'from-red-500 to-yellow-500',
      stats: {
        reservationsBefore: 15,
        reservationsAfter: 280,
        revenueBefore: '$80,000',
        revenueAfter: '$250,000',
        timeSaved: '20 horas/semana'
      },
      quote: 'Mis clientes ahora pueden ver todas nuestras pizzas con fotos, hacer reservas online y yo tengo todo organizado. Es una maravilla.',
      story: 'Antonio es un pizzero de tercera generación. Su pizzería familiar estaba siempre llena, pero las reservas eran un desastre. "Teníamos dos cuadernos, uno se perdió y perdimos reservas de toda una semana", recuerda con dolor. Implementó TuMesaHoy después de que su hija se lo recomendara. Subió fotos de sus 23 variedades de pizza, configuró horarios de almuerzo y cena, y compartió el QR en su Instagram. "Ahora los jóvenes reservan por el celular y los clientes de toda la vida también aprendieron. Todos contentos".',
      results: [
        'Reservas incrementadas en 1767%',
        '0 reservas perdidas',
        'Mejor organización de turnos',
        'Clientes más satisfechos'
      ],
      beforeAfter: {
        before: ['Cuadernos de papel', 'Reservas perdidas', 'Desorganización', 'Estrés constante'],
        after: ['Sistema digital confiable', 'Historial completo', 'Planificación precisa', 'Tranquilidad total']
      }
    },
    {
      id: 4,
      businessName: 'Parrilla El Gaucho',
      owner: 'Martín López',
      location: 'San Telmo, CABA',
      category: 'Parrilla',
      image: '🥩',
      color: 'from-orange-600 to-red-700',
      stats: {
        reservationsBefore: 20,
        reservationsAfter: 350,
        revenueBefore: '$120,000',
        revenueAfter: '$380,000',
        timeSaved: '18 horas/semana'
      },
      quote: 'TuMesaHoy me permitió escalar mi negocio sin perder calidad. Ahora atiendo más clientes y mejor que nunca.',
      story: 'Martín abrió su parrilla en plena zona turística. El boca a boca funcionaba, pero no tenía forma de gestionar la demanda creciente. "Los fines de semana era un infierno", dice. "Llamadas, mensajes, gente que llegaba sin reserva porque \'me dijeron que había lugar\'". Con TuMesaHoy configuró su menú completo de carnes, achuras y guarniciones con precios, activó reservas con límite de personas por turno, y puso el código QR en la vidriera. Los turistas lo escanean antes de entrar, ven el menú en su idioma (traducción manual) y reservan. "Es otro nivel de profesionalismo".',
      results: [
        '1650% más reservas mensuales',
        'Menos no-shows (confirmación automática)',
        'Mejor experiencia del cliente',
        'Turistas contentos (menú digital claro)'
      ],
      beforeAfter: {
        before: ['Caos en fines de semana', 'No-shows frecuentes', 'Clientes frustrados', 'Pérdida de ventas'],
        after: ['Turnos organizados', 'Confirmaciones efectivas', 'Experiencia premium', 'Maximización de ingresos']
      }
    },
    {
      id: 5,
      businessName: 'Brunch Lab',
      owner: 'Sofía Ramírez',
      location: 'Recoleta, CABA',
      category: 'Brunch & Café',
      image: '🥐',
      color: 'from-green-400 to-cyan-500',
      stats: {
        reservationsBefore: 8,
        reservationsAfter: 190,
        revenueBefore: '$45,000',
        revenueAfter: '$165,000',
        timeSaved: '14 horas/semana'
      },
      quote: 'Soy emprendedora y TuMesaHoy me dio las herramientas de una empresa grande a precio de pyme. Increíble.',
      story: 'Sofía dejó su trabajo corporativo para abrir el brunch de sus sueños. Joven y tech-savvy, sabía que necesitaba presencia digital desde el día 1. "Investigué todas las opciones y TuMesaHoy era exactamente lo que buscaba: simple, bonito y sin comisiones locas". Diseñó su menú completo con fotos estéticas de cada plato, configuró horarios solo de mañana y tarde, y compartió su página en Instagram. En 3 meses se convirtió en "el lugar" para brunches en Recoleta. "Las influencers aman escanear el QR y compartir el menú digital. Es marketing gratis".',
      results: [
        'Crecimiento del 2275% en reservas',
        'Presencia Instagram potenciada',
        'Menú compartido 1000+ veces',
        'ROI del 450% en 6 meses'
      ],
      beforeAfter: {
        before: ['Inicio desde cero', 'Pocas reservas', 'Sin diferenciación', 'Esfuerzo manual'],
        after: ['Negocio establecido', 'Alta demanda', 'Marca reconocida', 'Automatización total']
      }
    },
    {
      id: 6,
      businessName: 'Sushi House',
      owner: 'Kenji Tanaka',
      location: 'Belgrano, CABA',
      category: 'Sushi',
      image: '🍣',
      color: 'from-blue-500 to-purple-600',
      stats: {
        reservationsBefore: 12,
        reservationsAfter: 240,
        revenueBefore: '$70,000',
        revenueAfter: '$220,000',
        timeSaved: '16 horas/semana'
      },
      quote: 'La presentación visual del menú digital hizo que nuestras ventas de combos premium se duplicaran. El cliente ve las fotos y se antoja.',
      story: 'Kenji tiene experiencia haciendo sushi pero no con tecnología. "Mi fuerte es el pescado fresco, no las computadoras", bromea. Su hija lo convenció de probar TuMesaHoy y en una tarde configuraron todo. Fotografiaron los 60 rolls diferentes, los combos, las bebidas, todo. "La gente ahora pide más porque ve todo en fotos. Antes era difícil explicar la diferencia entre un California y un Philadelphia por teléfono". Las reservas explotaron cuando empezó a compartir el código QR en sus deliveries. "Los clientes de delivery vienen ahora al local porque vieron el menú completo y se antojaron de comer acá".',
      results: [
        'Reservas aumentadas en 1900%',
        'Ventas de rolls premium +120%',
        'Conversión delivery → presencial: 35%',
        'Satisfacción del cliente: 98%'
      ],
      beforeAfter: {
        before: ['Menú complejo de explicar', 'Ventas limitadas', 'Solo delivery', 'Bajo ticket promedio'],
        after: ['Menú visual intuitivo', 'Ventas diversificadas', 'Delivery + presencial', 'Ticket promedio +85%']
      }
    }
  ];

  const metrics = [
    { number: '1,455', label: 'Reservas Totales/Mes', icon: Calendar },
    { number: '+1,750%', label: 'Promedio de Crecimiento', icon: TrendingUp },
    { number: '95%', label: 'Satisfacción de Clientes', icon: Star },
    { number: '2,500+', label: 'Nuevos Clientes', icon: Users }
  ];

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
                Casos de Éxito
              </h1>
              <p className="text-xl text-neutral-medium leading-relaxed max-w-3xl mx-auto">
                Historias reales de negocios que transformaron su gestión y multiplicaron sus resultados con TuMesaHoy
              </p>
            </motion.div>
          </div>
        </section>

        {/* Métricas Globales */}
        <section className="py-12 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-neutral-dark mb-2">
                    {metric.number}
                  </div>
                  <div className="text-neutral-medium">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            {successStories.map((story, index) => (
              <motion.article
                key={story.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${story.color} p-8 text-white`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="text-8xl">{story.image}</div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        {story.businessName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-white/90">
                        <span className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          {story.owner}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {story.location}
                        </span>
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                          {story.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Quote */}
                  <div className="mb-8 relative">
                    <Quote className="w-12 h-12 text-primary/20 absolute -top-2 -left-2" />
                    <blockquote className="text-xl italic text-neutral-medium pl-12">
                      "{story.quote}"
                    </blockquote>
                    <p className="text-primary font-semibold mt-2 pl-12">
                      — {story.owner}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-neutral-light p-6 rounded-2xl">
                    <div className="text-center">
                      <div className="text-sm text-neutral-medium mb-1">Reservas Antes</div>
                      <div className="text-2xl font-bold text-status-error">{story.stats.reservationsBefore}/mes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-medium mb-1">Reservas Ahora</div>
                      <div className="text-2xl font-bold text-status-success">{story.stats.reservationsAfter}/mes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-medium mb-1">Ingresos Antes</div>
                      <div className="text-2xl font-bold text-status-error">{story.stats.revenueBefore}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-medium mb-1">Ingresos Ahora</div>
                      <div className="text-2xl font-bold text-status-success">{story.stats.revenueAfter}</div>
                    </div>
                  </div>

                  {/* Story */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-neutral-dark mb-4">La Historia</h3>
                    <p className="text-neutral-medium leading-relaxed text-lg">
                      {story.story}
                    </p>
                  </div>

                  {/* Results */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-neutral-dark mb-4">Resultados</h3>
                    <ul className="grid md:grid-cols-2 gap-4">
                      {story.results.map((result, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-status-success rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-white text-sm">✓</span>
                          </div>
                          <span className="text-neutral-medium">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Before/After */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-status-error/10 p-6 rounded-xl">
                      <h4 className="font-bold text-status-error mb-4 text-lg">Antes de TuMesaHoy</h4>
                      <ul className="space-y-2">
                        {story.beforeAfter.before.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-medium">
                            <span className="text-status-error mt-1">✗</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-status-success/10 p-6 rounded-xl">
                      <h4 className="font-bold text-status-success mb-4 text-lg">Después de TuMesaHoy</h4>
                      <ul className="space-y-2">
                        {story.beforeAfter.after.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-neutral-medium">
                            <span className="text-status-success mt-1">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
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
                Tu historia de éxito empieza hoy
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Únete a cientos de negocios que ya están creciendo con TuMesaHoy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  Empezar Gratis
                </a>
                <a
                  href="/contact"
                  className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Hablar con Ventas
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
