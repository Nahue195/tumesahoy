import { useState, useEffect } from 'react';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../components/SocialIcons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';
import AdminMenuSection from '../components/AdminMenuSection';
import AdminHoursSection from '../components/AdminHoursSection';
import AdminShiftsSection from '../components/AdminShiftsSection';
import AdminReservationsSection from '../components/AdminReservationsSection';
import AdminAnalyticsSection from '../components/AdminAnalyticsSection';
import AdminTablesSection from '../components/AdminTablesSection';
import AdminDepositSection from '../components/AdminDepositSection';

export default function AdminPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Todos los hooks al principio
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');
  const [reservations, setReservations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [mpNotif, setMpNotif] = useState({ type: '', text: '' });
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  // Cargar datos del negocio desde Supabase
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoading(true);

        // Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // Redirigir a login con parámetro para volver aquí después
          navigate(`/login?redirect=/admin/${slug}`);
          return;
        }

        // Buscar el negocio por slug
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('slug', slug)
          .single();

        if (businessError || !businessData) {
          setError('Negocio no encontrado');
          return;
        }

        // Verificar que el usuario sea el dueño
        if (businessData.user_id !== user.id) {
          setError('No tenés permiso para acceder a este negocio');
          return;
        }

        // Si el negocio tiene suscripción en MP pero no está activo todavía,
        // activarlo como fallback por si el webhook no se ejecutó.
        // Se hace via RPC server-side para que la validación sea en el servidor.
        const shouldAutoActivate =
          businessData.mercadopago_subscription_id &&
          (!businessData.is_active || businessData.subscription_status !== 'active') &&
          businessData.subscription_status !== 'cancelled';

        if (shouldAutoActivate) {
          const { data: rpcResult } = await supabase
            .rpc('activate_business_if_subscribed', { p_business_id: businessData.id });

          if (rpcResult?.activated) {
            // Recargar el negocio con los datos actualizados
            const { data: updatedBusiness } = await supabase
              .from('businesses')
              .select('*')
              .eq('id', businessData.id)
              .single();
            setBusiness(updatedBusiness || businessData);
          } else {
            setBusiness(businessData);
          }
        } else {
          setBusiness(businessData);
        }
      } catch (err) {
        console.error('Error al cargar negocio:', err);
        setError('Error al cargar el negocio');
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [slug, navigate]);

  // Detectar retorno del OAuth de MercadoPago
  useEffect(() => {
    const mpConnected = searchParams.get('mp_connected');
    const mpError = searchParams.get('mp_error');
    if (mpConnected === 'true') {
      setActiveTab('deposit');
      setMpNotif({ type: 'success', text: '✅ MercadoPago conectado correctamente. Ya podés configurar la seña.' });
    } else if (mpError) {
      setActiveTab('deposit');
      setMpNotif({ type: 'error', text: '❌ Error al conectar MercadoPago: ' + mpError });
    }
  }, [searchParams]);

  // Cargar información de suscripción desde el negocio
  useEffect(() => {
    if (!business) return;

    // Usar los datos del negocio directamente
    setSubscriptionInfo({
      subscription_status: business.subscription_status,
      mercadopago_subscription_id: business.mercadopago_subscription_id,
      is_active: business.is_active,
      cancelled_at: business.cancelled_at,
      subscription_expires_at: business.subscription_expires_at,
      // Usar la fecha de expiración real si está disponible
      next_billing_date: business.subscription_expires_at || null
    });
  }, [business]);

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-neutral-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error || !business) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-dark mb-3 md:mb-4">
            {error || 'Negocio no encontrado'}
          </h1>
          <p className="text-sm sm:text-base text-neutral-medium mb-6 md:mb-8">El negocio que buscás no existe o no tenés permiso para acceder</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCancelSubscription = () => {
    if (business.subscription_status === 'cancelled') {
      setCancelMessage('info:Tu suscripción ya está cancelada. Seguirás teniendo acceso hasta la fecha de vencimiento.');
      return;
    }
    setShowCancelConfirm(true);
  };

  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    try {
      setCancellingSubscription(true);
      setCancelMessage('');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Tu sesión expiró. Por favor iniciá sesión nuevamente.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({ businessId: business.id, userToken: session.access_token })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al cancelar la suscripción');

      const { data: updatedBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', business.id)
        .single();

      if (!fetchError && updatedBusiness) setBusiness(updatedBusiness);

      setCancelMessage('success:Suscripción cancelada. Podés seguir usando TuMesaHoy durante 30 días más.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      setCancelMessage('error:' + (error.message || 'Hubo un error. Intentá nuevamente o contactá soporte.'));
    } finally {
      setCancellingSubscription(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      name: business.name,
      description: business.description || '',
      address: business.address,
      phone: business.phone,
      category: business.category,
      whatsapp_number: business.whatsapp_number || '',
      reservation_mode: business.reservation_mode || 'no_turnover',
      default_reservation_duration: business.default_reservation_duration || 120,
      instagram_url: business.instagram_url || '',
      facebook_url: business.facebook_url || '',
      tiktok_url: business.tiktok_url || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const uploadCoverImage = async (file) => {
    if (!file) return null;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `${business.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('business-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Subir imagen si hay una seleccionada
      let coverImageUrl = editForm.cover_image_url || business.cover_image_url;
      if (selectedCoverImage) {
        coverImageUrl = await uploadCoverImage(selectedCoverImage);
      }

      const { data, error } = await supabase
        .from('businesses')
        .update({
          name: editForm.name,
          description: editForm.description,
          address: editForm.address,
          phone: editForm.phone,
          category: editForm.category,
          whatsapp_number: editForm.whatsapp_number,
          cover_image_url: coverImageUrl,
          reservation_mode: editForm.reservation_mode,
          default_reservation_duration: editForm.default_reservation_duration,
          instagram_url: editForm.instagram_url || null,
          facebook_url: editForm.facebook_url || null,
          tiktok_url: editForm.tiktok_url || null,
        })
        .eq('id', business.id);

      if (error) throw error;

      // Actualizar el estado local
      setBusiness({ ...business, ...editForm, cover_image_url: coverImageUrl });
      setIsEditing(false);
      setSelectedCoverImage(null);
      setSaveMessage({ type: 'success', text: '¡Cambios guardados exitosamente!' });
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error('Error guardando cambios:', error);
      setSaveMessage({ type: 'error', text: 'Hubo un error al guardar los cambios. Intentá nuevamente.' });
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 4000);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "analytics", label: "📊 Analytics" },
    { id: "reservations", label: "📅 Reservas" },
    { id: "tables", label: "🪑 Mesas" },
    { id: "menu", label: "🍽️ Menú" },
    { id: "hours", label: "🕒 Horarios" },
    { id: "deposit", label: "💳 Seña" },
    { id: "config", label: "⚙️ Configuración" }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-neutral-dark via-gray-900 to-neutral-dark shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 sm:gap-4">
              <img src="/LogoBlanco.svg" alt="TuMesaHoy Logo" className="h-8 sm:h-9" />
              <div className="border-l border-white/20 pl-3 sm:pl-4">
                <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[140px] sm:max-w-none">{business.name}</h1>
                <p className="text-xs text-white/40 hidden sm:flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Panel de administración
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/negocio/${slug}`)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm border border-white/20 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-all font-medium"
              >
                <span className="hidden md:inline">👁️ Ver página</span>
                <span className="md:hidden">👁️</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-white/10 text-white/60 rounded-lg hover:bg-white/20 hover:text-white transition-all font-medium"
              >
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {subscriptionInfo && subscriptionInfo.subscription_status === 'trial' && subscriptionInfo.trial_days_remaining <= 7 && (
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 border-b-2 border-accent/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⏰</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-base sm:text-lg">
                    {subscriptionInfo.trial_days_remaining > 0
                      ? `Tenés ${subscriptionInfo.trial_days_remaining} ${subscriptionInfo.trial_days_remaining === 1 ? 'día' : 'días'} gratis restantes`
                      : 'Tu período de prueba ha terminado'
                    }
                  </p>
                  <p className="text-sm text-neutral-dark/80 mt-1">
                    {subscriptionInfo.trial_days_remaining > 0
                      ? 'Agregá tu método de pago para continuar sin interrupciones después del trial'
                      : 'Suscribite ahora para mantener tu negocio activo'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/subscribe?business_id=${business.id}`)}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                Suscribirse Ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-neutral-dark/95 border-b border-white/10 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-white/45 hover:text-white/80 hover:bg-white/8"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido de tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-base">📊</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Analytics</h2>
                <p className="text-xs sm:text-sm text-gray-400">Estadísticas y métricas de tu negocio</p>
              </div>
            </div>

            <AdminAnalyticsSection businessId={business.id} />
          </div>
        )}

        {/* TAB: MENÚ */}
        {activeTab === "menu" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-base">🍽️</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Menú</h2>
                <p className="text-xs sm:text-sm text-gray-400">Gestioná tu menú digital</p>
              </div>
            </div>

            <AdminMenuSection businessId={business.id} />
          </div>
        )}

        {/* TAB: RESERVAS */}
        {activeTab === "reservations" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-base">📅</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Reservas</h2>
                <p className="text-xs sm:text-sm text-gray-400">Gestioná las reservas de tu negocio</p>
              </div>
            </div>

            <AdminReservationsSection businessId={business.id} />
          </div>
        )}

        {/* TAB: MESAS */}
        {activeTab === "tables" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-base">🪑</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Mesas</h2>
                <p className="text-xs sm:text-sm text-gray-400">Configurá tipos de mesa y el mapa de tu local</p>
              </div>
            </div>

            <AdminTablesSection businessId={business.id} />
          </div>
        )}

        {/* TAB: HORARIOS */}
        {activeTab === "hours" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-base">🕒</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Horarios</h2>
                <p className="text-xs sm:text-sm text-gray-400">Configurá tus días y horarios de atención</p>
              </div>
            </div>

            <AdminHoursSection businessId={business.id} />
            <AdminShiftsSection businessId={business.id} />
          </div>
        )}

        {/* TAB: SEÑA */}
        {activeTab === "deposit" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                <span className="text-base">💳</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Seña online</h2>
                <p className="text-xs sm:text-sm text-gray-400">Cobrá un depósito al reservar para reducir no-shows</p>
              </div>
            </div>
            {mpNotif.text && (
              <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                mpNotif.type === 'success'
                  ? 'bg-green-900/30 text-green-300 border border-green-700'
                  : 'bg-red-900/30 text-red-300 border border-red-700'
              }`}>
                {mpNotif.text}
              </div>
            )}
            <AdminDepositSection business={business} onUpdate={() => window.location.reload()} />
          </div>
        )}

        {/* TAB: CONFIGURACIÓN */}
        {activeTab === "config" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                  <span className="text-base">⚙️</span>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Configuración</h2>
                  <p className="text-xs sm:text-sm text-gray-400">Personalizá tu negocio</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                >
                  ✏️ Editar
                </button>
              )}
            </div>

            <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Datos del negocio</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editForm.name : business.name}
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg transition ${
                      isEditing
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={isEditing ? editForm.category : business.category}
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg transition ${
                      isEditing
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                  >
                    <option value="Heladería">Heladería</option>
                    <option value="Café">Café</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Bar">Bar</option>
                    <option value="Panadería">Panadería</option>
                    <option value="Pizzería">Pizzería</option>
                    <option value="Hamburguesería">Hamburguesería</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Pastelería">Pastelería</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Slug (URL) - No editable
                  </label>
                  <input
                    type="text"
                    value={business.slug}
                    disabled
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tu negocio: /negocio/{business.slug}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={isEditing ? editForm.description : (business.description || '')}
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg transition ${
                      isEditing
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                    placeholder="Descripción de tu negocio..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editForm.address : business.address}
                      disabled={!isEditing}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg transition ${
                        isEditing
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                          : 'bg-gray-900 border-gray-700 text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editForm.phone : business.phone}
                      disabled={!isEditing}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg transition ${
                        isEditing
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                          : 'bg-gray-900 border-gray-700 text-gray-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    WhatsApp (opcional)
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editForm.whatsapp_number : (business.whatsapp_number || '')}
                    disabled={!isEditing}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp_number: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className={`w-full px-4 py-3 border rounded-lg transition ${
                      isEditing
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                        : 'bg-gray-900 border-gray-700 text-gray-400'
                    }`}
                  />
                </div>

                {/* Redes sociales */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-200 mb-2">
                      <InstagramIcon className="w-4 h-4 text-pink-500" /> Instagram
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editForm.instagram_url : (business.instagram_url || '')}
                      disabled={!isEditing}
                      onChange={(e) => setEditForm({ ...editForm, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/tunegocio"
                      className={`w-full px-4 py-3 border rounded-lg transition ${isEditing ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-200 mb-2">
                      <FacebookIcon className="w-4 h-4 text-blue-600" /> Facebook
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editForm.facebook_url : (business.facebook_url || '')}
                      disabled={!isEditing}
                      onChange={(e) => setEditForm({ ...editForm, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/tunegocio"
                      className={`w-full px-4 py-3 border rounded-lg transition ${isEditing ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-200 mb-2">
                      <TikTokIcon className="w-4 h-4" /> TikTok
                    </label>
                    <input
                      type="text"
                      value={isEditing ? editForm.tiktok_url : (business.tiktok_url || '')}
                      disabled={!isEditing}
                      onChange={(e) => setEditForm({ ...editForm, tiktok_url: e.target.value })}
                      placeholder="https://tiktok.com/@tunegocio"
                      className={`w-full px-4 py-3 border rounded-lg transition ${isEditing ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                    />
                  </div>
                </div>

                {/* Configuración de Modo de Reserva */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 sm:p-5">
                  <h4 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    Configuración de Reservas
                  </h4>

                  {/* Selector de Modo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Opción: Sin recambio */}
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => isEditing && setEditForm({ ...editForm, reservation_mode: 'no_turnover' })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        (isEditing ? editForm.reservation_mode : business.reservation_mode || 'no_turnover') === 'no_turnover'
                          ? 'border-primary bg-primary/20 shadow-md'
                          : isEditing
                          ? 'border-gray-600 hover:border-primary/50 cursor-pointer bg-gray-800'
                          : 'border-gray-700 bg-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div className="flex-1">
                          <h5 className="font-bold text-white text-sm sm:text-base">Sin recambio</h5>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Una reserva ocupa la mesa todo el día. Ideal para eventos o servicios de un solo turno.
                          </p>
                          {(isEditing ? editForm.reservation_mode : business.reservation_mode || 'no_turnover') === 'no_turnover' && (
                            <div className="mt-2 flex items-center gap-1 text-primary text-xs font-semibold">
                              <span>✓</span>
                              <span>Seleccionado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Opción: Con recambio */}
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => isEditing && setEditForm({ ...editForm, reservation_mode: 'with_duration' })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        (isEditing ? editForm.reservation_mode : business.reservation_mode || 'no_turnover') === 'with_duration'
                          ? 'border-primary bg-primary/20 shadow-md'
                          : isEditing
                          ? 'border-gray-600 hover:border-primary/50 cursor-pointer bg-gray-800'
                          : 'border-gray-700 bg-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">🔄</span>
                        <div className="flex-1">
                          <h5 className="font-bold text-white text-sm sm:text-base">Con recambio</h5>
                          <p className="text-xs sm:text-sm text-gray-400 mt-1">
                            Múltiples reservas por día con duración fija. Ideal para restaurantes con varios turnos.
                          </p>
                          {(isEditing ? editForm.reservation_mode : business.reservation_mode || 'no_turnover') === 'with_duration' && (
                            <div className="mt-2 flex items-center gap-1 text-primary text-xs font-semibold">
                              <span>✓</span>
                              <span>Seleccionado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Selector de Duración (solo visible en modo with_duration) */}
                  {(isEditing ? editForm.reservation_mode : business.reservation_mode || 'no_turnover') === 'with_duration' && (
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <label className="block text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                        <span>⏱️</span>
                        Duración de cada reserva
                      </label>
                      <select
                        value={isEditing ? editForm.default_reservation_duration : (business.default_reservation_duration || 120)}
                        disabled={!isEditing}
                        onChange={(e) => setEditForm({ ...editForm, default_reservation_duration: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 border rounded-lg transition ${
                          isEditing
                            ? 'bg-gray-700 border-gray-600 text-white focus:border-primary focus:outline-none'
                            : 'bg-gray-900 border-gray-700 text-gray-400'
                        }`}
                      >
                        <option value={30}>30 minutos</option>
                        <option value={45}>45 minutos</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1 hora 30 min</option>
                        <option value={120}>2 horas</option>
                        <option value={150}>2 horas 30 min</option>
                        <option value={180}>3 horas</option>
                        <option value={240}>4 horas</option>
                        <option value={300}>5 horas</option>
                        <option value={360}>6 horas</option>
                        <option value={480}>8 horas</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Esta duración se usa para calcular cuándo termina una reserva y permitir nuevas reservas en el mismo día.
                      </p>
                    </div>
                  )}
                </div>

                {/* Imagen de portada */}
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Imagen de portada (Hero)
                  </label>
                  {business.cover_image_url && !isEditing && (
                    <div className="mb-3">
                      <img
                        src={business.cover_image_url}
                        alt="Cover actual"
                        className="w-full h-48 object-cover rounded-lg border border-gray-600"
                      />
                    </div>
                  )}
                  {isEditing && (
                    <div className="space-y-2">
                      {business.cover_image_url && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Imagen actual:</p>
                          <img
                            src={business.cover_image_url}
                            alt="Cover actual"
                            className="w-full h-32 object-cover rounded-lg border border-gray-600"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedCoverImage(e.target.files[0])}
                        className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                      {selectedCoverImage && (
                        <p className="text-xs text-green-600">
                          ✓ Nueva imagen seleccionada: {selectedCoverImage.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Recomendado: 1920x400px (formato panorámico)
                      </p>
                    </div>
                  )}
                  {!business.cover_image_url && !isEditing && (
                    <p className="text-sm text-gray-400 italic">
                      No hay imagen de portada configurada
                    </p>
                  )}
                </div>

                {saveMessage.text && (
                  <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
                    saveMessage.type === 'success'
                      ? 'bg-green-900/30 text-green-300 border border-green-700'
                      : 'bg-red-900/30 text-red-300 border border-red-700'
                  }`}>
                    {saveMessage.text}
                  </div>
                )}

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving || uploadingImage}
                      className="flex-1 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                    >
                      {uploadingImage ? '📤 Subiendo imagen...' : saving ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex-1 py-3 bg-gray-700 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sección de Suscripción */}
            {subscriptionInfo && (
              <div className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Información de Suscripción</h3>

                <div className="space-y-4">
                  {/* Estado de la suscripción */}
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-200">Estado del Plan</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        subscriptionInfo.subscription_status === 'trial'
                          ? 'bg-accent text-white'
                          : subscriptionInfo.subscription_status === 'active'
                          ? 'bg-secondary text-white'
                          : subscriptionInfo.subscription_status === 'cancelled' && subscriptionInfo.is_active
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {subscriptionInfo.subscription_status === 'trial' && '🎁 Prueba Gratis'}
                        {subscriptionInfo.subscription_status === 'active' && '✅ Activo'}
                        {subscriptionInfo.subscription_status === 'cancelled' && subscriptionInfo.is_active && '⚠️ Cancelado (Activo)'}
                        {subscriptionInfo.subscription_status === 'cancelled' && !subscriptionInfo.is_active && '❌ Cancelado'}
                        {subscriptionInfo.subscription_status === 'expired' && '⏰ Expirado'}
                      </span>
                    </div>

                    {subscriptionInfo.subscription_status === 'trial' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Días restantes</span>
                          <span className="text-lg font-bold text-primary">
                            {subscriptionInfo.trial_days_remaining} {subscriptionInfo.trial_days_remaining === 1 ? 'día' : 'días'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Finaliza el</span>
                          <span className="text-sm font-semibold text-gray-200">
                            {new Date(subscriptionInfo.trial_end_date).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <button
                            onClick={() => navigate(`/subscribe?business_id=${business.id}`)}
                            className="w-full py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            Agregar Método de Pago
                          </button>
                        </div>
                      </div>
                    )}

                    {subscriptionInfo.subscription_status === 'active' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Plan</span>
                          <span className="text-sm font-bold text-secondary">Plan Pro - $100/mes</span>
                        </div>
                        {subscriptionInfo.next_billing_date && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Próximo cobro</span>
                            <span className="text-sm font-semibold text-gray-200">
                              {new Date(subscriptionInfo.next_billing_date).toLocaleDateString('es-AR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                          <p className="text-xs text-gray-500">
                            💳 Tu suscripción se renueva automáticamente cada mes. Podés cancelar cuando quieras.
                          </p>
                          {cancelMessage && (
                            <div className={`p-3 rounded-lg text-xs font-medium ${
                              cancelMessage.startsWith('success:') ? 'bg-green-900/30 text-green-300' :
                              cancelMessage.startsWith('info:') ? 'bg-blue-900/30 text-blue-300' :
                              'bg-red-900/30 text-red-300'
                            }`}>
                              {cancelMessage.replace(/^(success:|error:|info:)/, '')}
                            </div>
                          )}
                          {showCancelConfirm ? (
                            <div className="p-3 bg-red-900/20 border border-red-500/40 rounded-lg space-y-2">
                              <p className="text-xs text-red-300 font-medium">
                                ¿Cancelar suscripción? Seguirás teniendo acceso 30 días más, pero no se renovará.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={confirmCancelSubscription}
                                  className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
                                >
                                  Sí, cancelar
                                </button>
                                <button
                                  onClick={() => setShowCancelConfirm(false)}
                                  className="flex-1 py-1.5 bg-gray-700 text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-600 transition"
                                >
                                  Volver
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={handleCancelSubscription}
                              disabled={cancellingSubscription}
                              className="w-full py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
                            >
                              {cancellingSubscription ? 'Cancelando...' : 'Cancelar Suscripción'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {subscriptionInfo.subscription_status === 'cancelled' && subscriptionInfo.is_active && subscriptionInfo.subscription_expires_at && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Plan</span>
                          <span className="text-sm font-bold text-orange-400">Cancelado</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Acceso hasta</span>
                          <span className="text-sm font-semibold text-gray-200">
                            {new Date(subscriptionInfo.subscription_expires_at).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-500 mb-3">
                            ⚠️ Tu suscripción fue cancelada pero seguís teniendo acceso completo hasta la fecha indicada. Después tu negocio se desactivará automáticamente.
                          </p>
                          <button
                            onClick={() => navigate(`/payment?business_id=${business.id}`)}
                            className="w-full py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            Reactivar Suscripción
                          </button>
                        </div>
                      </div>
                    )}

                    {(subscriptionInfo.subscription_status === 'expired' || (subscriptionInfo.subscription_status === 'cancelled' && !subscriptionInfo.is_active)) && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">
                          Tu suscripción ha {subscriptionInfo.subscription_status === 'expired' ? 'expirado' : 'sido cancelada'}.
                          Suscribite nuevamente para reactivar tu negocio.
                        </p>
                        <div className="mt-3">
                          <button
                            onClick={() => navigate(`/payment?business_id=${business.id}`)}
                            className="w-full py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-bold hover:shadow-lg transition-all"
                          >
                            Reactivar Suscripción
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Características del plan */}
                  <div className="bg-gray-900 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-gray-200 mb-3">Incluido en tu plan:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm text-gray-400">
                        <span className="text-secondary mr-2">✓</span>
                        Menú digital ilimitado
                      </li>
                      <li className="flex items-center text-sm text-gray-400">
                        <span className="text-secondary mr-2">✓</span>
                        Sistema de reservas
                      </li>
                      <li className="flex items-center text-sm text-gray-400">
                        <span className="text-secondary mr-2">✓</span>
                        Código QR personalizado
                      </li>
                      <li className="flex items-center text-sm text-gray-400">
                        <span className="text-secondary mr-2">✓</span>
                        Panel de analytics
                      </li>
                      <li className="flex items-center text-sm text-gray-400">
                        <span className="text-secondary mr-2">✓</span>
                        Soporte prioritario
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de QR Code */}
            <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-700 p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Código QR de tu negocio</h3>
              <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                Compartí este código QR para que tus clientes puedan acceder rápidamente a tu página, ver el menú y hacer reservas.
              </p>

              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-start">
                {/* QR Code */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  <div className="bg-white p-3 sm:p-4 rounded-xl border-2 sm:border-4 border-primary/20 inline-block">
                    <QRCodeSVG
                      value={`${window.location.origin}/negocio/${business.slug}`}
                      size={window.innerWidth < 640 ? 160 : 200}
                      level="H"
                    />
                  </div>
                </div>

                {/* Instrucciones y botones */}
                <div className="flex-1 w-full">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-200 mb-2 sm:mb-3">Formas de usar tu QR:</h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-400 mb-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0">📱</span>
                      <span>Imprímelo y ponelo en tu local para que los clientes lo escaneen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0">🖼️</span>
                      <span>Usalo en tus redes sociales o materiales de marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary flex-shrink-0">📧</span>
                      <span>Incluilo en emails o mensajes de WhatsApp</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => {
                      const svg = document.querySelector('#qr-download svg');
                      if (!svg) return;

                      const svgData = new XMLSerializer().serializeToString(svg);
                      const canvas = document.createElement('canvas');
                      const ctx = canvas.getContext('2d');
                      const img = new Image();

                      img.onload = () => {
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.fillStyle = 'white';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);

                        const pngFile = canvas.toDataURL('image/png');
                        const downloadLink = document.createElement('a');
                        downloadLink.download = `qr-${business.slug}.png`;
                        downloadLink.href = pngFile;
                        downloadLink.click();
                      };

                      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span>📥</span>
                    <span className="hidden sm:inline">Descargar QR como imagen</span>
                    <span className="sm:hidden">Descargar QR</span>
                  </button>
                </div>
              </div>

              {/* Hidden QR for download */}
              <div id="qr-download" className="hidden">
                <QRCodeSVG
                  value={`${window.location.origin}/negocio/${business.slug}`}
                  size={512}
                  level="H"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
