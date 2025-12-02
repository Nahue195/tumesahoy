import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const features = [
    {
      icon: "📅",
      title: "Sistema de Reservas",
      description: "Tus clientes reservan online 24/7. Sin llamadas, sin confusiones."
    },
    {
      icon: "📋",
      title: "Menú Digital",
      description: "Actualiza tu menú en tiempo real. Con fotos, precios y descripciones."
    },
    {
      icon: "🔔",
      title: "Notificaciones Automáticas",
      description: "Recibe alertas por WhatsApp de cada nueva reserva."
    },
    {
      icon: "📈",
      title: "Panel de Analytics",
      description: "Conoce tus horarios pico, platos favoritos y tendencias."
    },
    {
      icon: "📱",
      title: "100% Mobile",
      description: "Diseñado para que tus clientes reserven desde el celular."
    },
    {
      icon: "⏰",
      title: "Gestión de Horarios",
      description: "Define tus horarios de atención y capacidad por turno."
    }
  ];

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: '9.990',
      period: '/mes',
      description: 'Ideal para empezar',
      features: [
        'Hasta 50 reservas/mes',
        'Menú digital básico',
        'Notificaciones por email',
        'Panel de administración',
        'Soporte por email'
      ]
    },
    {
      id: 'pro',
      name: 'Profesional',
      price: '19.990',
      period: '/mes',
      description: 'Para negocios en crecimiento',
      popular: true,
      features: [
        'Reservas ilimitadas',
        'Menú digital avanzado',
        'Notificaciones por WhatsApp',
        'Analytics completo',
        'Personalización de marca',
        'Soporte prioritario',
        'Sin comisiones'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresa',
      price: 'Personalizado',
      period: '',
      description: 'Para cadenas y franquicias',
      features: [
        'Todo de Profesional',
        'Múltiples sucursales',
        'API personalizada',
        'Integración con POS',
        'Cuenta ejecutiva',
        'Onboarding dedicado'
      ]
    }
  ];

  const testimonials = [
    {
      name: "María González",
      business: "Café & Bistró",
      image: "🍰",
      text: "Desde que usamos TuMesaHoy, nuestras reservas aumentaron un 40%. Ya no perdemos tiempo en el teléfono.",
      rating: 5
    },
    {
      name: "Carlos Ruiz",
      business: "Heladería Chío",
      image: "🍦",
      text: "Mis clientes aman poder ver el menú y reservar desde su celular. La plataforma es súper fácil de usar.",
      rating: 5
    },
    {
      name: "Ana Martínez",
      business: "Trattoria Italiana",
      image: "🍝",
      text: "El panel de analytics me ayudó a entender mejor mi negocio. Ahora sé exactamente cuándo preparar más personal.",
      rating: 5
    }
  ];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TM</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TuMesaHoy
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition">
                Funciones
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition">
                Precios
              </button>
              <button onClick={() => scrollToSection('testimonials')} className="text-gray-700 hover:text-purple-600 transition">
                Testimonios
              </button>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-purple-600 hover:text-purple-700 transition">
                Iniciar Sesión
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5">
                Probar Gratis
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-purple-100 rounded-full text-purple-600 text-sm font-semibold mb-6">
                🚀 La solución digital para tu negocio
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Llevá tu negocio
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> online </span>
                en minutos
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Sistema de reservas y menú digital para restaurantes, cafeterías y heladerías. Sin instalaciones, sin complicaciones.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition transform hover:-translate-y-1 flex items-center justify-center">
                  Comenzar Ahora
                  <span className="ml-2">→</span>
                </button>
                <button 
                  onClick={() => window.open('https://wa.me/5491112345678', '_blank')}
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-lg text-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center">
                  💬 Hablar con Ventas
                </button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Sin contrato
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  14 días gratis
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Soporte 24/7
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 transform rotate-3">
                <div className="bg-white rounded-xl shadow-xl -rotate-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
                    <h3 className="font-bold text-lg">Heladería Chío</h3>
                    <p className="text-sm opacity-90">Helados artesanales y postres</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">1 kg de helado</p>
                        <p className="text-sm text-gray-600">Elegí hasta 4 sabores</p>
                      </div>
                      <span className="text-purple-600 font-bold">$ 15.000</span>
                    </div>
                    <div className="border-t-2 border-dashed pt-4">
                      <h4 className="font-semibold mb-3">Hacer una reserva</h4>
                      <div className="space-y-3">
                        <input type="text" placeholder="Nombre" className="w-full p-3 border rounded-lg" />
                        <input type="date" className="w-full p-3 border rounded-lg" />
                        <button className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold">
                          Reservar mesa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitás en una plataforma
            </h2>
            <p className="text-xl text-gray-600">
              Herramientas profesionales diseñadas para negocios locales
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes para cada tipo de negocio
            </h2>
            <p className="text-xl text-gray-600">
              Sin costos ocultos. Cancelá cuando quieras.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl transform scale-105' 
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold">
                    Más Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-6 ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={plan.popular ? 'text-purple-100' : 'text-gray-600'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className={`mr-2 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-500'}`}>
                        ✓
                      </span>
                      <span className={plan.popular ? 'text-purple-100' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.popular
                      ? 'bg-white text-purple-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  }`}
                >
                  Elegir {plan.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Negocios reales, resultados reales
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                <div className="flex items-center mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl mr-3">
                    {testimonial.image}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.business}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            ¿Listo para modernizar tu negocio?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Unite a los cientos de negocios que ya están usando TuMesaHoy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-white text-purple-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition transform hover:-translate-y-1">
              Comenzar Prueba Gratis
            </button>
            <button 
              onClick={() => window.open('https://wa.me/5491112345678', '_blank')}
              className="px-8 py-4 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition">
              Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TM</span>
              </div>
              <span className="text-white font-bold">TuMesaHoy</span>
            </div>
            <p className="text-sm">
              La plataforma digital para negocios locales de gastronomía.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Funciones</a></li>
              <li><a href="#" className="hover:text-white transition">Precios</a></li>
              <li><a href="#" className="hover:text-white transition">Casos de éxito</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Términos de servicio</a></li>
              <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          <p>© 2025 TuMesaHoy. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}