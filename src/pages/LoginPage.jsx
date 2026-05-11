import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect'); // Obtener parámetro de redirect
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage('Autenticando...');

      // Hacer login con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage('Login exitoso! Redirigiendo...');

      setTimeout(() => {
        // Si hay un redirect interno válido, ir ahí directamente
        if (redirectTo && redirectTo.startsWith('/')) {
          navigate(redirectTo);
          return;
        }

        // Si no, buscar el negocio del usuario
        const loadBusinessAndRedirect = async () => {
          const { data: businesses, error: bizError } = await supabase
            .from('businesses')
            .select('slug')
            .eq('user_id', data.user.id)
            .eq('is_active', true)
            .limit(1);

          if (bizError) throw bizError;

          if (businesses && businesses.length > 0) {
            navigate(`/admin/${businesses[0].slug}`);
          } else {
            navigate('/register'); // Si no tiene negocio, llevar a crear uno
          }
        };

        loadBusinessAndRedirect();
      }, 500);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:text-accent transition text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">Volver al inicio</span>
              <span className="sm:hidden">Inicio</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex items-center justify-center px-4 py-8 sm:py-12 min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)]">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-primary/20">
            <motion.div
              className="text-center mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-neutral-medium">
                Accedé al panel de tu negocio
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-neutral-dark mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-medium" />
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-neutral-dark">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-primary hover:text-accent font-medium transition"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-medium" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-11 pr-11 py-3 border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-medium hover:text-primary transition"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 group"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {loading ? 'Autenticando...' : 'Entrar al panel'}
                {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </motion.button>
            </form>

            {/* Mensaje de estado */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                  message.includes('Error')
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-600'
                }`}
              >
                {message.includes('Error') ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                {message}
              </motion.div>
            )}

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-neutral-medium">
                ¿No tenés cuenta?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-primary hover:text-accent font-semibold transition"
                >
                  Registrate acá
                </button>
              </p>
            </motion.div>
          </div>

          {/* Info adicional */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-center space-x-8 text-sm text-neutral-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-secondary h-4 w-4" />
                Acceso seguro
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-secondary h-4 w-4" />
                Soporte 24/7
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
