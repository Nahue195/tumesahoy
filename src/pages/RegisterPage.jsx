import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Auth, 2: Datos del negocio, 3: Éxito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Autenticación
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Step 2: Datos del negocio
  const [businessForm, setBusinessForm] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    whatsapp: "",
    instagram: "",
  });

  // Generar slug automático desde el nombre
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, "") // Quitar caracteres especiales
      .trim()
      .replace(/\s+/g, "-"); // Espacios a guiones
  };

  const handleNameChange = (name) => {
    setBusinessForm({
      ...businessForm,
      name,
      slug: generateSlug(name),
    });
  };

  // Step 1: Crear cuenta
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setError("");

    if (authForm.password !== authForm.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (authForm.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
      });

      if (error) throw error;

      // Pasar al siguiente paso
      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Crear negocio
  async function handleBusinessSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("No se pudo obtener el usuario autenticado");
        setLoading(false);
        return;
      }

      // Verificar que el slug no exista
      const { data: existingBusiness } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", businessForm.slug)
        .single();

      if (existingBusiness) {
        setError("Este nombre de negocio ya está en uso. Por favor elegí otro.");
        setLoading(false);
        return;
      }

      // Crear el negocio
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .insert([
          {
            user_id: user.id,
            name: businessForm.name,
            slug: businessForm.slug,
            description: businessForm.description || null,
            address: businessForm.address || null,
            phone: businessForm.phone || null,
            whatsapp: businessForm.whatsapp || null,
            instagram: businessForm.instagram || null,
            is_active: true,
            is_accepting_reservations: true,
          },
        ])
        .select()
        .single();

      if (businessError) throw businessError;

      // Éxito!
      setStep(3);
      
      // Redirigir al admin después de 2 segundos
      setTimeout(() => {
        navigate(`/admin/${business.slug}`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al crear el negocio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navbar simple */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TM</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TuMesaHoy
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 transition text-sm font-medium"
            >
              ¿Ya tenés cuenta? Iniciar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-24 h-1 ${step >= 3 ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <span className={step === 1 ? 'font-semibold text-purple-600' : ''}>Cuenta</span>
            <span>•</span>
            <span className={step === 2 ? 'font-semibold text-purple-600' : ''}>Negocio</span>
            <span>•</span>
            <span className={step === 3 ? 'font-semibold text-purple-600' : ''}>Listo</span>
          </div>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
          {/* STEP 1: Autenticación */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Creá tu cuenta
                </h1>
                <p className="text-gray-600">
                  Empezá a recibir reservas online en minutos
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="tu@email.com"
                    value={authForm.email}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="Mínimo 6 caracteres"
                    value={authForm.password}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="Repetí tu contraseña"
                    value={authForm.confirmPassword}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, confirmPassword: e.target.value })
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? "Creando cuenta..." : "Continuar →"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Al registrarte aceptás nuestros{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Términos de Servicio
                </a>{" "}
                y{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Política de Privacidad
                </a>
              </p>
            </div>
          )}

          {/* STEP 2: Datos del negocio */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Datos de tu negocio
                </h1>
                <p className="text-gray-600">
                  Contanos sobre tu restaurante, cafetería o heladería
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleBusinessSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del negocio *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="Ej: Heladería Chío"
                    value={businessForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL de tu página
                  </label>
                  <div className="flex items-center">
                    <span className="px-4 py-3 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-lg text-gray-600 text-sm">
                      tumesahoy.com/
                    </span>
                    <input
                      type="text"
                      required
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-r-lg focus:border-purple-500 focus:outline-none transition"
                      placeholder="tu-negocio"
                      value={businessForm.slug}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, slug: e.target.value })
                      }
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Esta será la dirección de tu página pública
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="Ej: Helados artesanales y postres caseros"
                    rows="3"
                    value={businessForm.description}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                      placeholder="+54 9 11 1234-5678"
                      value={businessForm.phone}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                      placeholder="+54 9 11 1234-5678"
                      value={businessForm.whatsapp}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, whatsapp: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="Av. Siempreviva 123"
                    value={businessForm.address}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Instagram (opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                    placeholder="@tunegocio"
                    value={businessForm.instagram}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, instagram: e.target.value })
                    }
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Podés configurar horarios y más detalles después en el panel
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? "Creando..." : "Crear negocio →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Éxito */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-white">✓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                ¡Tu negocio está listo! 🎉
              </h1>
              <p className="text-gray-600 mb-8">
                Ya podés empezar a recibir reservas y gestionar tu menú.
                <br />
                Redirigiendo al panel de administración...
              </p>
              <div className="inline-flex items-center space-x-2 text-purple-600">
                <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full" />
                <span className="text-sm font-medium">Cargando tu panel</span>
              </div>
            </div>
          )}
        </div>

        {/* Info adicional */}
        {step < 3 && (
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                14 días de prueba
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Cancelá cuando quieras
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterPage;