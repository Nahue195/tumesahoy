import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function formatPrice(value) {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(num);
}

function AdminMenuSection({ businessId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItem, setNewItem] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    if (!businessId) return;
    fetchMenu();
  }, [businessId]);

  async function fetchMenu() {
    setLoading(true);
    setError("");
    try {
      // 1) Categorías
      const { data: cats, error: catError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true });

      if (catError) throw catError;
      setCategories(cats || []);

      // 2) Items
      if (cats && cats.length > 0) {
        const catIds = cats.map((c) => c.id);
        const { data: its, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .in("category_id", catIds)
          .order("sort_order", { ascending: true });

        if (itemsError) throw itemsError;
        setItems(its || []);

        // si el form de nuevo ítem no tiene categoría, le ponemos la primera
        if (!newItem.category_id) {
          setNewItem((prev) => ({ ...prev, category_id: cats[0]?.id || "" }));
        }
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el menú.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSaving(true);
    setError("");

    try {
      const maxSort =
        categories.reduce(
          (max, c) => (c.sort_order > max ? c.sort_order : max),
          0
        ) || 0;

      const { error: insertError } = await supabase
        .from("menu_categories")
        .insert({
          business_id: businessId,
          name: newCategoryName.trim(),
          sort_order: maxSort + 1,
        });

      if (insertError) throw insertError;

      setNewCategoryName("");
      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear la categoría.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.category_id || !newItem.name.trim() || !newItem.price) return;

    setSaving(true);
    setError("");

    try {
      const { data: currentItems, error: itemsError } = await supabase
        .from("menu_items")
        .select("sort_order")
        .eq("category_id", newItem.category_id);

      if (itemsError) throw itemsError;

      const maxSort =
        (currentItems || []).reduce(
          (max, i) => (i.sort_order > max ? i.sort_order : max),
          0
        ) || 0;

      const { error: insertError } = await supabase.from("menu_items").insert({
        category_id: newItem.category_id,
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        price: Number(newItem.price),
        sort_order: maxSort + 1,
      });

      if (insertError) throw insertError;

      setNewItem((prev) => ({
        ...prev,
        name: "",
        description: "",
        price: "",
      }));
      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError("No se pudo agregar el ítem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(itemId) {
    const confirmDelete = window.confirm(
      "¿Seguro que querés eliminar este ítem del menú?"
    );
    if (!confirmDelete) return;

    setSaving(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (deleteError) throw deleteError;
      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el ítem.");
    } finally {
      setSaving(false);
    }
  }

  const itemsByCategory = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category_id === cat.id),
  }));

  return (
    <section className="bg-white border rounded-xl shadow-sm mt-8">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Menú del negocio</h2>
        <span className="text-xs text-slate-500">
          Lo que cargues acá se ve en la carta pública.
        </span>
      </div>

      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando menú...</p>
        ) : (
          <>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            {/* Agregar categoría */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <p className="text-sm font-medium text-slate-800 mb-2">
                Categorías
              </p>
              {categories.length === 0 && (
                <p className="text-xs text-slate-500 mb-2">
                  Todavía no hay categorías de menú para este negocio.
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-3 py-1"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <form
                onSubmit={handleAddCategory}
                className="flex flex-col sm:flex-row gap-2 items-start sm:items-center"
              >
                <input
                  type="text"
                  className="w-full sm:w-72 rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                  placeholder="Ej: Helados por kilo, Postres..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={saving || !newCategoryName.trim()}
                  className="inline-flex items-center rounded-md bg-slate-900 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-800 disabled:opacity-60"
                >
                  Agregar categoría
                </button>
              </form>
            </div>

            {/* Agregar ítem */}
            {categories.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-800 mb-2">
                  Agregar ítem al menú
                </p>
                <form
                  onSubmit={handleAddItem}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 items-start"
                >
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Categoría
                    </label>
                    <select
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                      value={newItem.category_id}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          category_id: e.target.value,
                        }))
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                      placeholder="Ej: 1 kg de helado"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                      placeholder="Ej: Elegí hasta 4 sabores"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Precio
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">$</span>
                      <input
                        type="number"
                        min="0"
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                        placeholder="15000"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !newItem.category_id ||
                        !newItem.name.trim() ||
                        !newItem.price
                      }
                      className="mt-2 w-full inline-flex items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Agregar ítem
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Lista del menú */}
            <div className="border border-slate-200 rounded-lg p-3">
              <p className="text-sm font-medium text-slate-800 mb-2">
                Ítems actuales
              </p>
              {itemsByCategory.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Todavía no hay ítems cargados.
                </p>
              ) : (
                <div className="space-y-4">
                  {itemsByCategory.map((cat) => (
                    <div key={cat.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-[0.16em]">
                          {cat.name}
                        </h3>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      {cat.items.length === 0 ? (
                        <p className="text-xs text-slate-400 ml-1">
                          Sin ítems en esta categoría.
                        </p>
                      ) : (
                        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-md bg-slate-50/40">
                          {cat.items.map((item) => (
                            <li
                              key={item.id}
                              className="px-3 py-2 flex items-center justify-between gap-3"
                            >
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-slate-500">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-emerald-600">
                                  {formatPrice(item.price)}
                                </span>
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="text-xs text-red-600 hover:text-red-700"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default AdminMenuSection;
