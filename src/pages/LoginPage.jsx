import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // Buscar el negocio del usuario
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .select("slug")
        .eq("is_active", true)
        .limit(1);

      if (businessError) throw businessError;

      if (businesses && businesses.length > 0) {
        // Redirigir al admin del negocio
        navigate(`/admin/${businesses[0].slug}`);
      } else {
        // Si no tiene negocio, redirigir a crear uno
        navigate("/register");
      }
    } catch (err) {
      console.error(err);
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navbar */}
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
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 text-sm font-medium"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-gray-600">
                Accedé al panel de tu negocio
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-6"
              >
                {loading ? "Ingresando..." : "Entrar al panel"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tenés cuenta?{" "}
                <button
                  onClick={() => navigate('/register')}
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Registrate gratis
                </button>
              </p>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Acceso seguro
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Soporte 24/7
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;