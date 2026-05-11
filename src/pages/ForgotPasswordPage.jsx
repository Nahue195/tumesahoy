import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      setError(err.message);
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
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src="/LogoFinal.svg" alt="TuMesaHoy Logo" className="h-10 sm:h-12" />
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:text-accent transition text-xs sm:text-sm font-medium flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </button>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-8 sm:py-12 min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)]">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-primary/20">
            {!sent ? (
              <>
                <motion.div
                  className="text-center mb-6 sm:mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
                    <Mail className="h-7 w-7 text-primary" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-2">
                    ¿Olvidaste tu contraseña?
                  </h1>
                  <p className="text-neutral-medium text-sm">
                    Ingresá tu email y te enviaremos un enlace para restablecerla.
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

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg text-sm flex items-center gap-2 bg-red-50 text-red-600"
                    >
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition mt-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 group"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                    {!loading && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div
                className="text-center py-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-dark mb-2">¡Email enviado!</h2>
                <p className="text-neutral-medium text-sm mb-6">
                  Revisá tu bandeja de entrada en <span className="font-semibold text-neutral-dark">{email}</span> y hacé clic en el enlace para restablecer tu contraseña.
                </p>
                <p className="text-xs text-neutral-medium mb-6">
                  Si no lo ves, revisá la carpeta de spam.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:text-accent font-semibold transition text-sm flex items-center gap-1 mx-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al login
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
