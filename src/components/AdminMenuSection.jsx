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
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Estados para edición
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImage, setEditImage] = useState(null);

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

  async function uploadImage(file) {
    if (!file) return null;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${businessId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.category_id || !newItem.name.trim() || !newItem.price) return;

    setSaving(true);
    setError("");

    try {
      // Subir imagen si hay una seleccionada
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

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
        business_id: businessId,
        category_id: newItem.category_id,
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        price: Number(newItem.price),
        image_url: imageUrl,
        sort_order: maxSort + 1,
      });

      if (insertError) throw insertError;

      setNewItem((prev) => ({
        ...prev,
        name: "",
        description: "",
        price: "",
      }));
      setSelectedImage(null);
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

  function handleEditItem(item) {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category_id: item.category_id,
    });
    setEditImage(null);
  }

  function handleCancelEdit() {
    setEditingItem(null);
    setEditForm({});
    setEditImage(null);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.price) return;

    setSaving(true);
    setError("");

    try {
      let imageUrl = editingItem.image_url;
      if (editImage) {
        imageUrl = await uploadImage(editImage);
      }

      const { error: updateError } = await supabase
        .from("menu_items")
        .update({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          price: Number(editForm.price),
          category_id: editForm.category_id,
          image_url: imageUrl,
        })
        .eq("id", editingItem.id);

      if (updateError) throw updateError;

      handleCancelEdit();
      await fetchMenu();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el ítem.");
    } finally {
      setSaving(false);
    }
  }

  const itemsByCategory = categories.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category_id === cat.id),
  }));

  return (
    <>
      <section className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Menú del negocio</h2>
          <p className="text-sm text-gray-400 mt-1">
            Lo que cargues acá se ve en tu carta pública
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-900/20 border border-red-500/40 rounded-xl px-4 py-3">
                <p className="text-sm text-red-300 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Agregar categoría */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏷️</span>
                <h3 className="text-lg font-bold text-white">Categorías</h3>
              </div>
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 mb-3">
                  Todavía no hay categorías de menú para este negocio.
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-full bg-gray-700 border border-gray-600 text-gray-200 font-semibold text-sm px-4 py-2 shadow-sm"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              <form
                onSubmit={handleAddCategory}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  className="flex-1 rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  placeholder="Ej: Helados por kilo, Postres, Bebidas..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={saving || !newCategoryName.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➕ Agregar categoría
                </button>
              </form>
            </div>

            {/* Agregar ítem */}
            {categories.length > 0 && (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">➕</span>
                  <h3 className="text-lg font-bold text-white">Agregar ítem al menú</h3>
                </div>
                <form
                  onSubmit={handleAddItem}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Categoría *
                      </label>
                      <select
                        className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
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
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Precio *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-secondary">$</span>
                        <input
                          type="number"
                          min="0"
                          className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
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
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Nombre del producto *
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                      placeholder="Ej: 1 kg de helado"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Descripción (opcional)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
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

                  {/* Campo de imagen */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Imagen del producto (opcional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                      className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gradient-to-r file:from-secondary/10 file:to-accent/10
                        file:text-secondary hover:file:from-secondary/20 hover:file:to-accent/20
                        file:transition file:cursor-pointer"
                    />
                    {selectedImage && (
                      <p className="text-xs text-green-600 mt-2 font-medium">
                        ✓ {selectedImage.name}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      uploading ||
                      !newItem.category_id ||
                      !newItem.name.trim() ||
                      !newItem.price
                    }
                    className="w-full py-4 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? '📤 Subiendo imagen...' : saving ? '💾 Guardando...' : '✨ Agregar ítem al menú'}
                  </button>
                </form>
              </div>
            )}

            {/* Lista del menú */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="text-lg font-bold text-white">Ítems actuales</h3>
              </div>
              {itemsByCategory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  Todavía no hay ítems cargados.
                </p>
              ) : (
                <div className="space-y-6">
                  {itemsByCategory.map((cat) => (
                    <div key={cat.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">
                          {cat.name}
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-secondary/30 to-transparent" />
                      </div>
                      {cat.items.length === 0 ? (
                        <p className="text-sm text-gray-500 ml-1">
                          Sin ítems en esta categoría.
                        </p>
                      ) : (
                        <div className="grid gap-3">
                          {cat.items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-500 transition-all"
                            >
                              <div className="flex items-center gap-4">
                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-bold text-white truncate">
                                    {item.name}
                                  </h4>
                                  {item.description && (
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-lg font-bold text-secondary">
                                      {formatPrice(item.price)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleEditItem(item)}
                                    className="px-4 py-2 bg-gradient-to-r from-secondary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition whitespace-nowrap"
                                  >
                                    ✏️ Editar
                                  </button>
                                  <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 whitespace-nowrap"
                                  >
                                    🗑️ Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
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

    {/* Modal de edición */}
    {editingItem && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleCancelEdit}>
        <div
          className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-neutral-dark px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 className="text-xl font-bold text-white">✏️ Editar producto</h3>
            <button
              onClick={handleCancelEdit}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Categoría *
                </label>
                <select
                  className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                  value={editForm.category_id}
                  onChange={(e) =>
                    setEditForm((prev) => ({
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
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Precio *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-secondary">$</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                    placeholder="15000"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Nombre del producto *
              </label>
              <input
                type="text"
                className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                placeholder="Ej: 1 kg de helado"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                rows={2}
                className="w-full rounded-lg border-2 bg-gray-700 border-gray-600 text-white placeholder-gray-400 px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
                placeholder="Ej: Elegí hasta 4 sabores"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Cambiar imagen (opcional)
              </label>
              {editingItem.image_url && !editImage && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-2">Imagen actual:</p>
                  <img
                    src={editingItem.image_url}
                    alt={editingItem.name}
                    className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImage(e.target.files[0])}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-secondary/10 file:to-accent/10
                  file:text-secondary hover:file:from-secondary/20 hover:file:to-accent/20
                  file:transition file:cursor-pointer"
              />
              {editImage && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ Nueva imagen seleccionada: {editImage.name}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || uploading || !editForm.name.trim() || !editForm.price}
                className="flex-1 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? '📤 Subiendo imagen...' : saving ? '💾 Guardando...' : '✅ Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="flex-1 py-3 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}

export default AdminMenuSection;
