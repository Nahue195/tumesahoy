import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Menu as MenuIcon,
  BarChart3,
  QrCode,
  Check,
  ArrowRight,
  Star,
  Users,
  Clock,
  TrendingUp,
  Zap,
  Shield
} from 'lucide-react';
import Footer from '../components/Footer';

export default function HomePage() {
  // Animación de fade in
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ===================================== */}
      {/* HERO SECTION */}
      {/* ===================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-secondary pt-32 pb-32">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeIn} className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Más de 100 restaurantes ya digitalizados
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeIn}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Digitalizá tu Restaurante
              <br />
              <span className="text-accent">en 5 Minutos</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
            >
              Sistema completo de <span className="font-semibold">reservas online</span>,
              <span className="font-semibold"> menú digital</span> y
              <span className="font-semibold"> gestión</span> para tu negocio gastronómico
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center px-8 py-4 bg-white text-primary font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Empezar Ahora
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/stores"
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Ver Tiendas
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm"
            >
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-accent" />
                Configuración incluida
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-accent" />
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2 text-accent" />
                Cancelá cuando quieras
              </div>
            </motion.div>

            {/* Mockup del dashboard */}
            <motion.div
              variants={fadeIn}
              className="mt-16 relative"
            >
              <div className="relative max-w-4xl mx-auto">
                {/* Ventana de browser */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                  {/* Chrome del browser */}
                  <div className="bg-black/20 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/70"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
                    <div className="flex-1 mx-3 bg-white/10 rounded-full h-5 flex items-center px-3">
                      <span className="text-white/40 text-xs">tumesahoy.com/admin/mi-restaurante</span>
                    </div>
                  </div>

                  {/* Contenido del dashboard */}
                  <div className="p-4 sm:p-6 text-left">
                    {/* Header del panel */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wide">Panel de control</p>
                        <p className="text-white font-bold text-lg">La Parrilla de Don José</p>
                      </div>
                      <span className="px-3 py-1 bg-green-400/20 text-green-300 text-xs font-semibold rounded-full border border-green-400/30">
                        ● Activo
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-white/50 text-xs mb-1">Reservas hoy</p>
                        <p className="text-white text-2xl font-bold">12</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-white/50 text-xs mb-1">Confirmadas</p>
                        <p className="text-accent text-2xl font-bold">9</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-white/50 text-xs mb-1">Personas</p>
                        <p className="text-white text-2xl font-bold">38</p>
                      </div>
                    </div>

                    {/* Lista de reservas */}
                    <div className="space-y-2">
                      {[
                        { name: 'García, Martina', time: '20:00', people: 4, status: 'confirmed' },
                        { name: 'López, Juan', time: '20:30', people: 2, status: 'pending' },
                        { name: 'Martínez, Laura', time: '21:00', people: 6, status: 'confirmed' },
                        { name: 'Rodríguez, C.', time: '21:30', people: 3, status: 'confirmed' },
                      ].map((r, i) => (
                        <div key={i} className="bg-white/8 hover:bg-white/12 rounded-xl px-3 sm:px-4 py-2.5 flex items-center justify-between transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-white/40 text-xs font-mono w-10 shrink-0">{r.time}</span>
                            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                              <span className="text-white/70 text-xs font-bold">{r.name[0]}</span>
                            </div>
                            <span className="text-white text-sm font-medium">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-white/40 text-xs hidden sm:block">{r.people} pers.</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              r.status === 'confirmed'
                                ? 'bg-green-400/15 text-green-300 border border-green-400/25'
                                : 'bg-yellow-400/15 text-yellow-300 border border-yellow-400/25'
                            }`}>
                              {r.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Glow sutil debajo */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-accent/20 blur-2xl rounded-full"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===================================== */}
      {/* PROBLEMA → SOLUCIÓN */}
      {/* ===================================== */}
      <section className="py-20 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6"
            >
              ¿Tu restaurante todavía usa <span className="text-primary">papel y lápiz</span>?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-neutral-medium max-w-3xl mx-auto"
            >
              Dejá atrás los problemas del sistema tradicional
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Problemas */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.h3
                variants={fadeIn}
                className="text-2xl font-bold text-neutral-dark mb-8"
              >
                Problemas comunes:
              </motion.h3>

              {[
                'Reservas perdidas por teléfono ocupado',
                'Clientes que se van porque parece que no hay mesas',
                'Menú desactualizado y difícil de cambiar',
                'Sin datos de tus mejores horarios y platos',
                'Tiempo perdido anotando reservas manualmente'
              ].map((problem, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="flex items-start bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-error/10 rounded-full flex items-center justify-center mr-4">
                    <span className="text-error font-bold">✗</span>
                  </div>
                  <p className="text-neutral-dark">{problem}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Soluciones */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-6"
            >
              <motion.h3
                variants={fadeIn}
                className="text-2xl font-bold text-secondary mb-8"
              >
                TuMesaHoy resuelve esto con:
              </motion.h3>

              {[
                {
                  title: 'Sistema de reservas online 24/7',
                  desc: 'Tus clientes reservan cuando quieren, vos gestionás desde tu celular'
                },
                {
                  title: 'Menú digital actualizable en segundos',
                  desc: 'Cambiá precios, agregá platos o fotos desde el panel'
                },
                {
                  title: 'Analytics en tiempo real',
                  desc: 'Sabé qué horarios son más populares y optimizá tu negocio'
                },
                {
                  title: 'Código QR personalizado',
                  desc: 'Compartí el link de tu menú en redes, flyers o tus vidrieras'
                },
                {
                  title: 'Gestión centralizada',
                  desc: 'Todo en un solo panel: reservas, menú, horarios y más'
                }
              ].map((solution, index) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="flex items-start bg-secondary/5 p-4 rounded-lg border-l-4 border-secondary"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-4">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-neutral-dark font-semibold">{solution.title}</p>
                    <p className="text-neutral-medium text-sm mt-1">{solution.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* FEATURES PRINCIPALES */}
      {/* ===================================== */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6"
            >
              Todo lo que necesitás en <span className="text-primary">un solo lugar</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-neutral-medium max-w-3xl mx-auto"
            >
              Herramientas profesionales para gestionar tu negocio como los grandes
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Calendar,
                title: 'Reservas Online',
                description: 'Sistema completo de reservas 24/7 con confirmaciones automáticas',
                bgClass: 'bg-gradient-to-br from-primary to-primary-dark'
              },
              {
                icon: MenuIcon,
                title: 'Menú Digital',
                description: 'Menú con fotos, categorías y precios. Actualizalo en segundos',
                bgClass: 'bg-gradient-to-br from-primary to-primary-dark'
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Estadísticas en tiempo real de reservas, horarios y clientes',
                bgClass: 'bg-gradient-to-br from-primary to-primary-dark'
              },
              {
                icon: QrCode,
                title: 'QR Code',
                description: 'Código QR personalizado para compartir en cualquier lado',
                bgClass: 'bg-gradient-to-br from-primary to-primary-dark'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-neutral-light p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 ${feature.bgClass} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-dark mb-3">{feature.title}</h3>
                <p className="text-neutral-medium">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===================================== */}
      {/* CÓMO FUNCIONA */}
      {/* ===================================== */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6"
            >
              Empezá en <span className="text-primary">3 pasos simples</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-neutral-medium max-w-3xl mx-auto"
            >
              No necesitás conocimientos técnicos. Es tan fácil como usar WhatsApp
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 relative"
          >
            {/* Línea conectora en desktop */}
            <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-1 bg-gradient-to-r from-primary via-accent to-secondary"
                 style={{ top: '5rem', left: '16.666%', right: '16.666%' }}></div>

            {[
              {
                step: '1',
                title: 'Registrá tu negocio',
                description: 'Completá tus datos básicos: nombre, dirección, categoría. Solo 5 minutos.',
                icon: Users
              },
              {
                step: '2',
                title: 'Cargá tu menú',
                description: 'Subí fotos de tus platos, agregá precios y descripciones. Tan fácil como Instagram.',
                icon: MenuIcon
              },
              {
                step: '3',
                title: 'Compartí y listo',
                description: 'Descargá tu QR, compartí el link y empezá a recibir reservas al instante.',
                icon: QrCode
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="relative bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                {/* Número del paso */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                  {step.step}
                </div>

                <step.icon className="w-16 h-16 text-primary mx-auto mb-6 mt-4" />
                <h3 className="text-2xl font-bold text-neutral-dark mb-4">{step.title}</h3>
                <p className="text-neutral-medium">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mt-12"
          >
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Empezar Ahora Gratis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===================================== */}
      {/* PRICING */}
      {/* ===================================== */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6"
            >
              Precio <span className="text-primary">simple y transparente</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-neutral-medium max-w-3xl mx-auto"
            >
              Una sola suscripción, todas las funciones. Sin costos ocultos.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-lg mx-auto"
          >
            <div className="relative bg-gradient-to-br from-primary to-secondary p-1 rounded-3xl shadow-2xl">
              <div className="bg-white rounded-3xl p-8 md:p-12">
                {/* Badge de oferta */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-6 py-2 bg-accent text-white font-bold rounded-full text-sm shadow-lg">
                    <Star className="w-4 h-4 mr-2" />
                    Mejor Precio
                  </span>
                </div>

                <div className="text-center mb-8 mt-4">
                  <h3 className="text-3xl font-bold text-neutral-dark mb-2">Plan Pro</h3>
                  <p className="text-neutral-medium">Todo incluido, sin límites</p>
                </div>

                {/* Precio */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl md:text-7xl font-bold text-primary">$100</span>
                    <span className="text-2xl text-neutral-medium">/mes</span>
                  </div>
                  <p className="text-sm text-neutral-medium mt-3">
                    Si no pagás, la cuenta se deshabilita automáticamente
                  </p>
                </div>

                {/* Características incluidas */}
                <div className="space-y-4 mb-8">
                  {[
                    'Reservas ilimitadas',
                    'Menú digital completo',
                    'Panel de administración',
                    'Analytics en tiempo real',
                    'Código QR personalizado',
                    'Soporte por WhatsApp',
                    'Actualizaciones gratuitas',
                    'Sin costos de instalación'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-6 h-6 text-secondary mr-3 flex-shrink-0" />
                      <span className="text-neutral-dark">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/signup"
                  className="block w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white text-center font-bold rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Empezar Ahora
                </Link>

                <p className="text-center text-sm text-neutral-medium mt-6">
                  Sin permanencia • Cancelá cuando quieras • Sin tarjeta de crédito
                </p>
              </div>
            </div>

            {/* ROI Calculator */}
            <div className="mt-12 bg-neutral-light p-6 rounded-2xl">
              <div className="flex items-start">
                <TrendingUp className="w-8 h-8 text-secondary mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-neutral-dark mb-2">💡 Calculá el retorno</h4>
                  <p className="text-neutral-medium text-sm">
                    Con solo <span className="font-semibold text-secondary">5 mesas más por mes</span> ($14.000 promedio),
                    ya pagaste la suscripción. Todo lo demás es ganancia pura.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================================== */}
      {/* TESTIMONIOS */}
      {/* ===================================== */}
      <section className="py-20 bg-gradient-to-br from-neutral-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold text-neutral-dark mb-6"
            >
              Lo que dicen <span className="text-primary">nuestros clientes</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                name: 'Juan Pérez',
                business: 'Parrilla Don Juan',
                location: 'Palermo, CABA',
                rating: 5,
                text: 'Aumentamos 40% las reservas en el primer mes. Los clientes aman poder reservar desde su celular.'
              },
              {
                name: 'María González',
                business: 'Café La Esquina',
                location: 'San Telmo, CABA',
                rating: 5,
                text: 'Antes perdíamos clientes porque no atendíamos el teléfono. Ahora todo es automático y nunca perdemos una reserva.'
              },
              {
                name: 'Carlos Mendoza',
                business: 'Restaurante El Jardín',
                location: 'Belgrano, CABA',
                rating: 5,
                text: 'El panel de analytics nos ayudó a optimizar los horarios y aumentar la facturación. Excelente inversión.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white p-8 rounded-2xl shadow-lg"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Testimonial */}
                <p className="text-neutral-dark mb-6 italic">"{testimonial.text}"</p>

                {/* Author */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-dark">{testimonial.name}</p>
                    <p className="text-sm text-neutral-medium">{testimonial.business}</p>
                    <p className="text-xs text-neutral-medium">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===================================== */}
      {/* TRUST SIGNALS */}
      {/* ===================================== */}
      <section className="py-16 bg-white border-y border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, number: '100+', label: 'Restaurantes activos' },
              { icon: Calendar, number: '5.000+', label: 'Reservas gestionadas' },
              { icon: Clock, number: '24/7', label: 'Soporte disponible' },
              { icon: Shield, number: '100%', label: 'Datos seguros' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <stat.icon className="w-12 h-12 text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold text-neutral-dark mb-2">{stat.number}</div>
                <div className="text-neutral-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================== */}
      {/* CTA FINAL */}
      {/* ===================================== */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-secondary relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-secondary rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeIn}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            >
              ¿Listo para digitalizar tu restaurante?
            </motion.h2>

            <motion.p
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/90 mb-10"
            >
              Unite a los cientos de restaurantes que ya aumentaron sus reservas con TuMesaHoy
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-10 py-5 bg-white text-primary font-bold rounded-full text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 w-6 h-6" />
              </Link>
            </motion.div>

            <motion.p
              variants={fadeIn}
              className="mt-8 text-white/80"
            >
              Sin permanencia • Cancelá cuando quieras • Soporte en español
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
