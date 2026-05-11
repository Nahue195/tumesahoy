import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    subject: 'Consulta General',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const subjects = [
    'Consulta General',
    'Soporte Técnico',
    'Ventas y Precios',
    'Sugerencias',
    'Problemas de Pago',
    'Otro'
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'tumesahoy@gmail.com',
      link: 'mailto:tumesahoy@gmail.com',
      description: 'Respuesta en menos de 24hs'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+54 9 2392617818',
      link: 'tel:+5491112345678',
      description: 'Lun a Vie, 9:00 a 18:00'
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp',
      content: '+54 9 2392617818',
      link: 'https://wa.me/5492392617818',
      description: 'Respuesta inmediata'
    },
    {
      icon: MapPin,
      title: 'Oficina',
      content: 'Av. Corrientes 1234, CABA',
      link: 'https://maps.google.com',
      description: 'Visítanos con cita previa'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    console.log('Form submitted:', formData);
    setSubmitted(true);

    // Reset form después de 3 segundos
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        subject: 'Consulta General',
        message: ''
      });
    }, 3000);
  };

  const faqs = [
    {
      question: '¿Cuánto tiempo tarda en configurarse?',
      answer: 'En menos de 30 minutos puedes tener tu negocio completamente configurado y listo para recibir reservas.'
    },
    {
      question: '¿Ofrecen capacitación?',
      answer: 'Sí, incluimos una sesión de onboarding gratuita y acceso a tutoriales en video.'
    },
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer: 'Sí, no hay permanencia mínima. Puedes cancelar tu suscripción cuando quieras.'
    }
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
                Contacto
              </h1>
              <p className="text-xl text-neutral-medium leading-relaxed max-w-3xl mx-auto">
                Estamos aquí para ayudarte. Envíanos tu consulta y te responderemos lo antes posible.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.link}
                  target={info.link.startsWith('http') ? '_blank' : '_self'}
                  rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all group cursor-pointer"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <info.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-dark mb-2">
                    {info.title}
                  </h3>
                  <p className="text-primary font-semibold mb-1">
                    {info.content}
                  </p>
                  <p className="text-sm text-neutral-medium">
                    {info.description}
                  </p>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Form and Info */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold text-neutral-dark mb-6">
                  Envíanos un mensaje
                </h2>

                {submitted ? (
                  <div className="bg-status-success/10 border-2 border-status-success rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-status-success rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl">✓</span>
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-dark mb-2">
                      ¡Mensaje Enviado!
                    </h3>
                    <p className="text-neutral-medium">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-neutral-dark font-semibold mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-medium/30 rounded-xl focus:outline-none focus:border-primary transition-colors"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-dark font-semibold mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border-2 border-neutral-medium/30 rounded-xl focus:outline-none focus:border-primary transition-colors"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-neutral-dark font-semibold mb-2">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-neutral-medium/30 rounded-xl focus:outline-none focus:border-primary transition-colors"
                          placeholder="+54 9 11 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-neutral-dark font-semibold mb-2">
                          Nombre del Negocio
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border-2 border-neutral-medium/30 rounded-xl focus:outline-none focus:border-primary transition-colors"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-neutral-dark font-semibold mb-2">
                        Asunto *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-neutral-medium/30 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-dark font-semibold mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        className="w-full px-4 py-3 border-2 border-neutral-medium/30 rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Enviar Mensaje
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Additional Info */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Horarios */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                    <h3 className="text-2xl font-bold text-neutral-dark">
                      Horarios de Atención
                    </h3>
                  </div>
                  <div className="space-y-3 text-neutral-medium">
                    <div className="flex justify-between">
                      <span className="font-semibold">Lunes a Viernes</span>
                      <span>9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Sábados</span>
                      <span>10:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Domingos</span>
                      <span>Cerrado</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-neutral-medium/20">
                    <p className="text-sm text-neutral-medium leading-relaxed">
                      Para WhatsApp y email, respondemos 24/7 en menos de 2 horas en horario hábil.
                    </p>
                  </div>
                </div>

                {/* FAQs Rápidas */}
                <div>
                  <h3 className="text-2xl font-bold text-neutral-dark mb-4">
                    Preguntas Frecuentes
                  </h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                        <h4 className="font-bold text-neutral-dark mb-2">
                          {faq.question}
                        </h4>
                        <p className="text-neutral-medium text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                  <a
                    href="/faq"
                    className="inline-block mt-4 text-primary font-semibold hover:underline"
                  >
                    Ver todas las preguntas frecuentes →
                  </a>
                </div>

                {/* Redes Sociales */}
                <div>
                  <h3 className="text-2xl font-bold text-neutral-dark mb-4">
                    Síguenos
                  </h3>
                  <div className="flex gap-4">
                    <a
                      href="#"
                      className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-12 text-center"
            >
              <MapPin className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-neutral-dark mb-4">
                Visítanos
              </h2>
              <p className="text-neutral-medium text-lg mb-6">
                Av. Corrientes 1234, Piso 5, Oficina 12<br />
                Ciudad Autónoma de Buenos Aires, Argentina
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                Ver en Google Maps
              </a>
              <p className="text-sm text-neutral-medium mt-4">
                * Se requiere cita previa. Contáctanos para coordinar.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
