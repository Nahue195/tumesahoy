import { motion } from 'framer-motion';
import { Users, Target, Heart, Sparkles, TrendingUp, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const values = [
    {
      icon: Heart,
      title: 'Pasión por lo Local',
      description: 'Creemos en el poder de los negocios locales para transformar comunidades y crear experiencias únicas.'
    },
    {
      icon: Sparkles,
      title: 'Innovación Simple',
      description: 'Tecnología accesible que cualquier negocio puede usar, sin complicaciones ni costos prohibitivos.'
    },
    {
      icon: Users,
      title: 'Comunidad Primero',
      description: 'Construimos herramientas pensando en las necesidades reales de dueños de negocios y sus clientes.'
    },
    {
      icon: Shield,
      title: 'Transparencia Total',
      description: 'Sin letra chica, sin comisiones ocultas. Precio fijo, valor real y compromiso genuino.'
    }
  ];

  const team = [
    {
      name: 'Nahuel Martinez',
      role: 'Founder & CEO',
      description: 'Crea, diseña y desarrolla TuMesaHoy. Apasionado por la tecnología simple y útil, lleva adelante la visión del producto y la experiencia del usuario.',
      image: '👨‍💻'
    },
    {
      name: 'Mateo Olivera',
      role: 'Co-Founder & Head of Sales',
      description: 'Autor de la idea original de TuMesaHoy. Especialista en ventas y relaciones comerciales, conecta la plataforma con los locales y entiende las necesidades del mercado.',
      image: '💼'
    }
  ];

  const milestones = [
    { year: 'Diciembre 2024', event: 'Nace la Idea', description: 'El 1 de diciembre nace TuMesaHoy con la visión de digitalizar negocios gastronómicos locales' },
    { year: 'Diciembre 2024', event: 'Desarrollo del MVP', description: 'Creación de la plataforma: menú digital, sistema de reservas y panel de administración' },
    { year: 'Diciembre 2024', event: 'Integración de Pagos', description: 'Implementación completa con Mercado Pago y arquitectura en Supabase' },
    { year: 'Enero 2025', event: 'Primeros Clientes', description: 'Lanzamiento del beta privado con negocios seleccionados' },
    { year: 'Q1 2025', event: 'Lanzamiento Público', description: 'Apertura de la plataforma para todos los negocios de Argentina' }
  ];

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
                Sobre Nosotros
              </h1>
              <p className="text-xl text-neutral-medium leading-relaxed max-w-3xl mx-auto">
                Somos un equipo argentino apasionado por ayudar a negocios locales a brillar en el mundo digital.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold text-neutral-dark">Nuestra Misión</h2>
                </div>
                <p className="text-neutral-medium leading-relaxed text-lg">
                  Democratizar la tecnología para que cualquier negocio gastronómico, sin importar su tamaño,
                  pueda tener una presencia digital profesional, gestionar reservas y mostrar su menú al mundo,
                  todo a un precio justo y sin comisiones abusivas.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-accent/10 to-primary/10 p-8 rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <h2 className="text-3xl font-bold text-neutral-dark">Nuestra Visión</h2>
                </div>
                <p className="text-neutral-medium leading-relaxed text-lg">
                  Convertirnos en la plataforma #1 de digitalización para negocios gastronómicos en Argentina,
                  transformando la forma en que los clientes descubren y se conectan con sus lugares favoritos,
                  impulsando el crecimiento de miles de emprendedores.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Valores */}
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
                Nuestros Valores
              </h2>
              <p className="text-neutral-medium text-lg">
                Los principios que guían cada decisión que tomamos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-dark mb-2">
                    {value.title}
                  </h3>
                  <p className="text-neutral-medium leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Historia / Timeline */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-dark mb-4">
                Nuestra Historia
              </h2>
              <p className="text-neutral-medium text-lg">
                El camino que nos trajo hasta aquí
              </p>
            </motion.div>

            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary to-accent"></div>

              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeIn}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`relative flex items-center ${
                      index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Punto en la línea */}
                    <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-accent rounded-full border-4 border-white shadow-lg z-10"></div>

                    {/* Contenido */}
                    <div className={`ml-8 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                      <div className="bg-white p-6 rounded-xl shadow-lg">
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full text-sm font-semibold mb-2">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-bold text-neutral-dark mb-2">
                          {milestone.event}
                        </h3>
                        <p className="text-neutral-medium">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Equipo */}
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
                Nuestro Equipo
              </h2>
              <p className="text-neutral-medium text-lg">
                Las personas que hacen posible TuMesaHoy
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
                >
                  <div className="text-7xl mb-4">{member.image}</div>
                  <h3 className="text-xl font-bold text-neutral-dark mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-neutral-medium text-sm leading-relaxed">
                    {member.description}
                  </p>
                </motion.div>
              ))}
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
                ¿Listo para unirte a nosotros?
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Únete a cientos de negocios que ya están creciendo con TuMesaHoy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  Empezar Ahora
                </a>
                <a
                  href="/contact"
                  className="px-8 py-4 bg-white/10 text-white border-2 border-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Contactar Ventas
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
