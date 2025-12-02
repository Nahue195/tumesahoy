import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function BusinessPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Estado del formulario de reserva
  const [reservationForm, setReservationForm] = useState({
    customer_name: "",
    customer_phone: "",
    people_count: 2,
    reservation_date: "",
    reservation_time: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);

  // Cargar datos del negocio y menú
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Buscar negocio
        const { data: biz, error: bizError } = await supabase
          .from("businesses")
          .select("*")
          .eq("slug", slug)
          .single();

        if (bizError) throw bizError;
        setBusiness(biz);

        // 2. Buscar categorías del menú
        const { data: categories, error: catError } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("business_id", biz.id)
          .order("name");

        if (catError) throw catError;
        setMenuCategories(categories || []);

        // 3. Buscar items del menú
        const { data: items, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("business_id", biz.id)
          .order("name");

        if (itemsError) throw itemsError;
        setMenuItems(items || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug]);

  // Enviar reserva
  async function handleReservationSubmit(e) {
    e.preventDefault();
    if (!business) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from("reservations").insert([
        {
          business_id: business.id,
          customer_name: reservationForm.customer_name,
          customer_phone: reservationForm.customer_phone,
          people_count: reservationForm.people_count,
          reservation_date: reservationForm.reservation_date,
          reservation_time: reservationForm.reservation_time,
          message: reservationForm.message,
          status: "pending",
        },
      ]);

      if (error) throw error;

      alert("¡Reserva enviada! Te contactaremos pronto para confirmar.");
      setReservationForm({
        customer_name: "",
        customer_phone: "",
        people_count: 2,
        reservation_date: "",
        reservation_time: "",
        message: "",
      });
      setShowReservationForm(false);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al enviar la reserva. Por favor intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // Filtrar items por categoría
  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Negocio no encontrado</h1>
          <p className="text-gray-600">No pudimos encontrar este negocio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header con imagen de portada */}
      <header className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        {business.cover_image_url ? (
          <div className="relative h-64 md:h-80">
            <img 
              src={business.cover_image_url} 
              alt={business.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  {business.is_accepting_reservations ? (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      ✓ Aceptando reservas
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                      ✗ No disponible
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{business.name}</h1>
                {business.description && (
                  <p className="text-lg text-white/90">{business.description}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 px-6">
            <div className="max-w-5xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                {business.is_accepting_reservations ? (
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    ✓ Aceptando reservas
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                    ✗ No disponible
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{business.name}</h1>
              {business.description && (
                <p className="text-xl text-purple-100">{business.description}</p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Barra de info rápida */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              {business.address && (
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{business.address}</span>
                </div>
              )}
              {business.opening_hours && (
                <div className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>{business.opening_hours}</span>
                </div>
              )}
              {business.whatsapp && (
                <a 
                  href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
            {business.is_accepting_reservations && (
              <button
                onClick={() => setShowReservationForm(!showReservationForm)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                {showReservationForm ? "Ocultar formulario" : "Hacer una reserva"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Formulario de reserva (desplegable) */}
        {showReservationForm && business.is_accepting_reservations && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hacer una reserva</h2>
            <form onSubmit={handleReservationSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Tu nombre"
                    value={reservationForm.customer_name}
                    onChange={(e) =>
                      setReservationForm({ ...reservationForm, customer_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="+54 9 11 1234-5678"
                    value={reservationForm.customer_phone}
                    onChange={(e) =>
                      setReservationForm({ ...reservationForm, customer_phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    value={reservationForm.reservation_date}
                    onChange={(e) =>
                      setReservationForm({ ...reservationForm, reservation_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    value={reservationForm.reservation_time}
                    onChange={(e) =>
                      setReservationForm({ ...reservationForm, reservation_time: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Personas *
                  </label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    value={reservationForm.people_count}
                    onChange={(e) =>
                      setReservationForm({ ...reservationForm, people_count: parseInt(e.target.value) })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "persona" : "personas"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comentarios (opcional)
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Ej: Cumpleaños, alergias, preferencias..."
                  rows="3"
                  value={reservationForm.message}
                  onChange={(e) =>
                    setReservationForm({ ...reservationForm, message: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {submitting ? "Enviando..." : "Reservar mesa"}
              </button>
            </form>
          </div>
        )}

        {/* Menú */}
        {menuItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Menú disponible</h2>
              <span className="text-sm text-gray-500">Actualizado en tiempo real</span>
            </div>

            {/* Filtros de categoría */}
            {menuCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === "all"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                {menuCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedCategory === cat.id
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Items del menú */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 transition"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    {item.price && (
                      <p className="text-lg font-bold text-purple-600 mt-2">
                        ${parseFloat(item.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No hay items en esta categoría
              </p>
            )}
          </div>
        )}

        {menuItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-purple-100">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Menú en construcción
            </h3>
            <p className="text-gray-600">
              Estamos preparando nuestro menú digital. Pronto podrás ver todos nuestros productos aquí.
            </p>
            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                💬 Consultanos por WhatsApp
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm">
            Powered by{" "}
            <a
              href="/"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              TuMesaHoy
            </a>
          </p>
          <p className="text-xs mt-2">
            Sistema de reservas y menú digital para negocios locales
          </p>
        </div>
      </footer>
    </div>
  );
}
 
export default BusinessPage;