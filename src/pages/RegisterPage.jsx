import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Tag, User, Mail, Phone, MapPin, FileText, ArrowRight, CheckCircle, AlertCircle, Zap, Shield, Smartphone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Si no está autenticado, redirigir a login
        navigate('/login');
      } else {
        setUser(user);
        // Pre-llenar el email del usuario
        setFormData(prev => ({ ...prev, email: user.email }));
      }
    };
    checkUser();
  }, [navigate]);

  const categories = [
    'Heladería',
    'Café',
    'Restaurante',
    'Parrilla',
    'Pizzería',
    'Sushi',
    'Vegetariano/Vegano',
    'Panadería',
    'Bar',
    'Otro'
  ];

  // Función para generar slug único
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage('Error: No estás autenticado');
      return;
    }

    try {
      setLoading(true);
      setMessage('Creando tu negocio...');

      // Generar slug base
      let slug = generateSlug(formData.businessName);

      // Verificar si el slug ya existe y agregar número si es necesario
      let finalSlug = slug;
      let counter = 1;
      let slugExists = true;

      while (slugExists) {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('slug')
          .eq('slug', finalSlug)
          .single();

        if (!existingBusiness) {
          slugExists = false;
        } else {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      }

      // Crear el negocio en la base de datos (inactivo hasta que pague)
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: formData.businessName,
          slug: finalSlug,
          category: formData.category,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          description: formData.description || null,
          is_active: false,
          is_accepting_reservations: true,
          subscription_status: 'inactive'
        })
        .select()
        .single();

      if (businessError) throw businessError;

      setMessage('¡Negocio creado exitosamente!');

      // Redirigir a página de pago para suscribirse
      setTimeout(() => {
        navigate(`/payment?business_id=${business.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error al crear negocio:', err);
      setMessage(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Navbar simple */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img src="/LogoFinal.svg" alt="TuMesaHoy Logo" className="h-10 sm:h-12" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:text-accent transition text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">¿Ya tenés cuenta? Ingresá</span>
                <span className="sm:hidden">Ingresá</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-neutral-medium hover:text-primary transition text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">Volver al inicio</span>
                <span className="sm:hidden">Inicio</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-8 sm:py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Registrá tu Negocio
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90">
            Comenzá a recibir reservas online en menos de 5 minutos
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        {/* Benefits Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          <motion.div
            className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-md hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-3 sm:mb-4">
              <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="font-bold text-neutral-dark mb-1 sm:mb-2 text-sm sm:text-base">Setup Rápido</h3>
            <p className="text-xs sm:text-sm text-neutral-medium">Configurá tu negocio en minutos</p>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-md hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-3 sm:mb-4">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="font-bold text-neutral-dark mb-1 sm:mb-2 text-sm sm:text-base">$100 ARS</h3>
            <p className="text-xs sm:text-sm text-neutral-medium">Suscripción mensual automática</p>
          </motion.div>
          <motion.div
            className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-md hover:shadow-xl transition-shadow sm:col-span-2 md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full mb-3 sm:mb-4">
              <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="font-bold text-neutral-dark mb-1 sm:mb-2 text-sm sm:text-base">100% Digital</h3>
            <p className="text-xs sm:text-sm text-neutral-medium">Menú y reservas online</p>
          </motion.div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-primary/20">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-dark mb-2">
              Información del Negocio
            </h2>
            <p className="text-sm sm:text-base text-neutral-medium">
              Completá los datos de tu negocio para comenzar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Nombre del negocio */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                name="businessName"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                placeholder="Ej: Heladería Don Pedro"
                value={formData.businessName}
                onChange={handleChange}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                Categoría *
              </label>
              <select
                name="category"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Seleccionar categoría...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid de 2 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                  placeholder="+54 9 11 1234-5678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                Dirección *
              </label>
              <input
                type="text"
                name="address"
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                placeholder="Av. Corrientes 1234, CABA"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                Descripción del Negocio
              </label>
              <textarea
                name="description"
                rows="4"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                placeholder="Contanos brevemente sobre tu negocio, qué lo hace especial..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Info adicional */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-neutral-dark">
                <span className="font-semibold">📋 Próximos pasos:</span> Después de registrarte, te redirigiremos al pago para activar tu suscripción de $100 ARS por mes.
              </p>
            </div>

            {/* Mensaje de estado */}
            {message && (
              <div className={`p-3 rounded-lg text-center text-xs sm:text-sm ${
                message.includes('Error')
                  ? 'bg-red-50 text-red-600'
                  : 'bg-green-50 text-green-600'
              }`}>
                {message}
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base border-2 border-neutral-medium/30 text-neutral-medium rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando negocio...' : 'Registrar Negocio'}
              </button>
            </div>
          </form>
        </div>

        {/* Testimonial o confianza */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <p className="text-neutral-medium text-xs sm:text-sm mb-3 sm:mb-4">
            Más de 100 negocios confían en TuMesaHoy
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-neutral-medium">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-secondary text-xl sm:text-2xl">✓</span>
              <span className="text-xs sm:text-sm">Datos seguros</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-secondary text-xl sm:text-2xl">✓</span>
              <span className="text-xs sm:text-sm">Sin permanencia</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-secondary text-xl sm:text-2xl">✓</span>
              <span className="text-xs sm:text-sm">Soporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
