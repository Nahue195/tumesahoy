import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // Verificar si requiere confirmación de email
      const requiresEmailConfirmation = !data.user.confirmed_at;

      if (requiresEmailConfirmation) {
        setMessage({
          type: 'success',
          text: '¡Cuenta creada exitosamente! 📧 Te enviamos un email de verificación. Por favor, verificá tu correo antes de continuar.'
        });
        setShowResendButton(true);
        // No redirigir automáticamente si requiere confirmación
      } else {
        setMessage({
          type: 'success',
          text: '¡Cuenta creada exitosamente! Redirigiendo...'
        });
        // Esperar 2 segundos y redirigir a registro de negocio
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      }

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message === 'User already registered'
          ? 'Este email ya está registrado'
          : `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: '📧 Email de verificación reenviado. Revisá tu bandeja de entrada y spam.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error al reenviar el email. Intentá nuevamente en unos minutos.'
      });
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light flex flex-col">
      {/* Navbar simple */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img src="/LogoFinal.svg" alt="TuMesaHoy Logo" className="h-10 sm:h-12" />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/login"
                className="text-neutral-medium hover:text-primary transition text-xs sm:text-sm font-medium"
              >
                <span className="hidden sm:inline">Iniciar sesión</span>
                <span className="sm:hidden">Ingresar</span>
              </Link>
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

      {/* Contenido principal */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full">
          {/* Card de registro */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-primary/20">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-2">
                Crear Cuenta
              </h1>
              <p className="text-sm sm:text-base text-neutral-medium">
                Registrate para comenzar a usar TuMesaHoy
              </p>
            </div>

            {/* Mensaje de estado */}
            {message.text && (
              <div
                className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-secondary/10 text-secondary border border-secondary/30'
                    : 'bg-status-error/10 text-status-error border border-status-error/30'
                }`}
              >
                {message.text}

                {/* Botón para reenviar email de verificación */}
                {showResendButton && message.type === 'success' && (
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => navigate('/register')}
                      className="w-full py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
                    >
                      ✅ Ya verifiqué mi email → Continuar
                    </button>
                    <button
                      onClick={handleResendEmail}
                      disabled={resendingEmail}
                      className="w-full py-2 bg-white text-primary border-2 border-primary rounded-lg text-sm font-semibold hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendingEmail ? 'Reenviando...' : '📧 Reenviar email de verificación'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-neutral-medium/30 rounded-lg focus:border-primary focus:outline-none transition"
                  placeholder="Repetir contraseña"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            {/* Link a login */}
            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-xs sm:text-sm text-neutral-medium">
                ¿Ya tenés cuenta?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-accent font-semibold"
                >
                  Iniciá sesión acá
                </Link>
              </p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-6 sm:mt-8 text-center">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-medium">
                <span className="text-secondary">✓</span>
                <span>Setup incluido</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-medium">
                <span className="text-secondary">✓</span>
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-medium">
                <span className="text-secondary">✓</span>
                <span>Todas las funciones</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-medium">
                <span className="text-secondary">✓</span>
                <span>Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
