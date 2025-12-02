import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-800 border-rose-200",
};

function AdminPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reservas");

  const [business, setBusiness] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [coverUploading, setCoverUploading] = useState(false);

  // Formulario de datos del negocio
  const [businessForm, setBusinessForm] = useState({
    name: "",
    description: "",
    address: "",
    opening_hours: "",
    whatsapp: "",
    is_accepting_reservations: true,
  });

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Buscar negocio
        const { data: biz, error: bizError } = await supabase
          .from("businesses")
          .select("*")
          .eq("slug", slug)
          .single();

        if (bizError) throw bizError;
        setBusiness(biz);
        setBusinessForm({
          name: biz.name || "",
          description: biz.description || "",
          address: biz.address || "",
          opening_hours: biz.opening_hours || "",
          whatsapp: biz.whatsapp || "",
          is_accepting_reservations: biz.is_accepting_reservations !== false,
        });

        // Reservas
        const { data: res, error: resError } = await supabase
          .from("reservations")
          .select("*")
          .eq("business_id", biz.id)
          .order("reservation_date", { ascending: false })
          .order("reservation_time", { ascending: false });

        if (resError) throw resError;
        setReservations(res || []);

        // Categorías
        const { data: cats, error: catsError } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("business_id", biz.id)
          .order("sort_order");

        if (catsError) throw catsError;
        setMenuCategories(cats || []);

        // Items
        const { data: items, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("business_id", biz.id)
          .order("sort_order");

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

  // Cambiar estado de reserva
  async function updateStatus(id, newStatus) {
    setSavingId(id);
    try {
      const { error } = await supabase
        .from("reservations")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado.");
    } finally {
      setSavingId(null);
    }
  }

  // Guardar cambios del negocio
  async function handleSaveBusiness(e) {
    e.preventDefault();
    if (!business) return;

    try {
      const { data, error } = await supabase
        .from("businesses")
        .update({
          description: businessForm.description,
          address: businessForm.address,
          opening_hours: businessForm.opening_hours,
          whatsapp: businessForm.whatsapp,
          is_accepting_reservations: businessForm.is_accepting_reservations,
        })
        .eq("id", business.id)
        .select("*")
        .single();

      if (error) throw error;

      setBusiness(data);
      alert("✓ Datos guardados correctamente");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar los cambios.");
    }
  }

  // Subir portada
  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !business) return;

    try {
      setCoverUploading(true);

      const ext = file.name.split(".").pop();
      const path = `${business.id}/cover-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("business-covers")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("business-covers")
        .getPublicUrl(path);

      const { data, error: updateError } = await supabase
        .from("businesses")
        .update({ cover_image_url: publicUrl })
        .eq("id", business.id)
        .select("*")
        .single();

      if (updateError) throw updateError;

      setBusiness(data);
      alert("✓ Imagen de portada actualizada");
    } catch (err) {
      console.error("Error al subir portada:", err);
      alert("Error al subir la imagen.");
    } finally {
      setCoverUploading(false);
      event.target.value = "";
    }
  }

  // Cerrar sesión
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Negocio no encontrado</h1>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "reservas", label: "📅 Reservas", count: reservations.length },
    { id: "menu", label: "🍽️ Menú", count: menuItems.length },
    { id: "config", label: "⚙️ Configuración" },
    { id: "pedidos", label: "🛒 Pedidos", badge: "Próximamente" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">TM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
                <p className="text-xs text-gray-500">Panel de administración</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.open(`/${slug}`, "_blank")}
                className="px-4 py-2 text-sm border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
              >
                👁️ Ver página pública
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB: RESERVAS */}
        {activeTab === "reservas" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reservas</h2>
                <p className="text-gray-600 mt-1">Gestiona las reservas de tu negocio</p>
              </div>
              <div className="flex gap-2">
                <select className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm">
                  <option>Todas</option>
                  <option>Pendientes</option>
                  <option>Confirmadas</option>
                  <option>Canceladas</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100">
              {reservations.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sin reservas todavía
                  </h3>
                  <p className="text-gray-600">
                    Cuando recibas reservas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {reservations.map((r) => (
                    <div key={r.id} className="p-6 hover:bg-purple-50/50 transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {r.customer_name}
                            </h3>
                            <span
                              className={
                                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold " +
                                (STATUS_COLORS[r.status] ||
                                  "bg-slate-100 text-slate-700 border-slate-200")
                              }
                            >
                              {STATUS_LABELS[r.status] || r.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              📅 {r.reservation_date} • ⏰ {r.reservation_time} hs
                            </p>
                            <p>👥 {r.people_count} {r.people_count === 1 ? "persona" : "personas"}</p>
                            <p>📞 {r.customer_phone || "—"}</p>
                            {r.message && (
                              <p className="text-gray-500 italic mt-2">
                                💬 "{r.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(r.id, "confirmed")}
                            disabled={savingId === r.id || r.status === "confirmed"}
                            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                          >
                            ✓ Confirmar
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "pending")}
                            disabled={savingId === r.id || r.status === "pending"}
                            className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                          >
                            ⏳ Pendiente
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "cancelled")}
                            disabled={savingId === r.id || r.status === "cancelled"}
                            className="px-4 py-2 text-sm rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: MENÚ */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Menú</h2>
                <p className="text-gray-600 mt-1">Gestiona tu menú digital</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                + Agregar categoría
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
              {menuCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Todavía no creaste categorías
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Empezá creando categorías para organizar tu menú
                  </p>
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                    + Crear primera categoría
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {menuCategories.map((cat) => (
                    <div key={cat.id} className="border-2 border-gray-100 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                        <button className="px-4 py-2 text-sm bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition font-medium">
                          + Agregar item
                        </button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {menuItems
                          .filter((item) => item.category_id === cat.id)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-200 transition"
                            >
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{item.name}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                  </p>
                                )}
                                {item.price && (
                                  <p className="text-lg font-bold text-purple-600 mt-2">
                                    ${parseFloat(item.price).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                ⋮
                              </button>
                            </div>
                          ))}
                      </div>

                      {menuItems.filter((item) => item.category_id === cat.id).length === 0 && (
                        <p className="text-center text-gray-500 py-4">
                          No hay items en esta categoría
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: CONFIGURACIÓN */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
              <p className="text-gray-600 mt-1">Personaliza tu negocio</p>
            </div>

            {/* Imagen de portada */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Imagen de portada</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-2/3">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 h-48 flex items-center justify-center">
                    {business.cover_image_url ? (
                      <img
                        src={business.cover_image_url}
                        alt="Portada"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Sin imagen de portada</span>
                    )}
                  </div>
                </div>
                <div className="md:w-1/3 space-y-3">
                  <p className="text-sm text-gray-600">
                    Recomendado: formato horizontal, mínimo 1200×600 px
                  </p>
                  <label className="inline-block">
                    <span className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold cursor-pointer hover:shadow-lg transition inline-block">
                      {coverUploading ? "Subiendo..." : "Elegir archivo"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                      disabled={coverUploading}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Datos del negocio */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Datos del negocio</h3>
              <form onSubmit={handleSaveBusiness} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={businessForm.name}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El nombre no se puede editar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="Ej: Helados artesanales y postres caseros"
                    value={businessForm.description}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Av. Siempreviva 123"
                      value={businessForm.address}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, address: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Horarios
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Lunes a Domingo, 12:00 a 23:00"
                      value={businessForm.opening_hours}
                      onChange={(e) =>
                        setBusinessForm({ ...businessForm, opening_hours: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    WhatsApp del local
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                    placeholder="+54 9 11 1234-5678"
                    value={businessForm.whatsapp}
                    onChange={(e) =>
                      setBusinessForm({ ...businessForm, whatsapp: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <input
                    id="accepting"
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 rounded"
                    checked={businessForm.is_accepting_reservations}
                    onChange={(e) =>
                      setBusinessForm({
                        ...businessForm,
                        is_accepting_reservations: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="accepting" className="text-sm font-medium text-gray-900">
                    Aceptar reservas online
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Guardar cambios
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB: PEDIDOS */}
        {activeTab === "pedidos" && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Función en desarrollo
            </h3>
            <p className="text-gray-600 mb-6">
              Pronto podrás recibir y gestionar pedidos online desde tu negocio
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
              🚧 Próximamente
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;