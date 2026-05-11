import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabaseClient';
import { BusinessPageSkeleton } from '../components/LoadingSkeleton';
import TableMapViewer from '../components/TableMapViewer';
import TableTypeSelector from '../components/TableTypeSelector';
import { InstagramIcon, FacebookIcon, TikTokIcon } from '../components/SocialIcons';

export default function BusinessPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const dateScrollRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [businessShifts, setBusinessShifts] = useState([]);
  const [businessDayShifts, setBusinessDayShifts] = useState([]);
  const [showAllHours, setShowAllHours] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showReservationDrawer, setShowReservationDrawer] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    number_of_people: 2,
    reservation_date: "",
    reservation_time: "",
    preferred_table_type_id: "",
    special_requests: ""
  });
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [reservationError, setReservationError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [reviewForm, setReviewForm] = useState({ reviewer_name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  // Scroll listener para navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        setIsLoggedIn(!!user);

        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('id, name, slug, description, cover_image_url, category, address, phone, whatsapp_number, is_accepting_reservations, reservation_mode, default_reservation_duration, requires_deposit, deposit_amount, deposit_type, deposit_refundable, deposit_cancellation_hours, mp_seller_access_token, instagram_url, facebook_url, tiktok_url')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (businessError) throw businessError;
        if (!businessData) { setLoading(false); return; }

        setBusiness(businessData);

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('business_id', businessData.id)
          .order('sort_order', { ascending: true });

        if (categoriesError) throw categoriesError;
        setMenuCategories(categoriesData || []);

        if (categoriesData && categoriesData.length > 0) {
          const categoryIds = categoriesData.map(cat => cat.id);
          const { data: itemsData, error: itemsError } = await supabase
            .from('menu_items')
            .select('*')
            .in('category_id', categoryIds)
            .eq('is_available', true)
            .order('sort_order', { ascending: true });

          if (itemsError) throw itemsError;
          setMenuItems(itemsData || []);
        }

        const { data: hoursData, error: hoursError } = await supabase
          .from('business_hours')
          .select('*')
          .eq('business_id', businessData.id)
          .order('day_of_week', { ascending: true });

        if (hoursError) throw hoursError;
        setBusinessHours(hoursData || []);

        const { data: shiftsData, error: shiftsError } = await supabase
          .from('business_shifts')
          .select('*')
          .eq('business_id', businessData.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (shiftsError) {
          console.error('Error cargando turnos:', shiftsError);
          setBusinessShifts([
            { id: 'default-lunch', name: 'Almuerzo', icon: '☀️', available_times: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'] },
            { id: 'default-dinner', name: 'Cena', icon: '🌙', available_times: ['20:00', '20:30', '21:00', '21:30', '22:00', '22:30'] }
          ]);
          setBusinessDayShifts([]);
        } else {
          setBusinessShifts(shiftsData || []);
          const { data: dayShiftsData, error: dayShiftsError } = await supabase
            .from('business_day_shifts')
            .select('*')
            .eq('business_id', businessData.id);

          if (dayShiftsError) {
            console.error('Error cargando day_shifts:', dayShiftsError);
            setBusinessDayShifts([]);
          } else {
            setBusinessDayShifts(dayShiftsData || []);
          }
        }
        // Cargar reseñas
        const { data: reviewsData } = await supabase
          .from('business_reviews')
          .select('id, reviewer_name, rating, comment, created_at')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        if (reviewsData && reviewsData.length > 0) {
          setReviews(reviewsData);
          const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
          setReviewStats({ avg: Math.round(avg * 10) / 10, count: reviewsData.length });
        }

      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) return <BusinessPageSkeleton />;

  if (!business) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-3">Negocio no encontrado</h1>
          <p className="text-sm sm:text-base text-neutral-medium mb-6">El negocio que buscas no existe o no está disponible</p>
          <button onClick={() => navigate('/stores')} className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition text-sm sm:text-base">
            Ver todos los negocios
          </button>
        </div>
      </div>
    );
  }

  const formatBusinessHours = () => {
    if (businessHours.length === 0) return 'Horarios no especificados';
    const today = businessHours.find(h => h.day_of_week === new Date().getDay());
    if (today && !today.is_closed) return `Hoy: ${today.opens_at.slice(0, 5)} - ${today.closes_at.slice(0, 5)}`;
    if (today && today.is_closed) return 'Hoy: Cerrado';
    return 'Ver horarios';
  };

  const getDayName = (dayId) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayId];
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category_id === selectedCategory);

  const getAvailableShiftsForDay = (dateStr) => {
    if (!dateStr) return businessShifts;
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    if (businessDayShifts.length === 0) return businessShifts;
    const enabledShiftIds = businessDayShifts
      .filter(ds => ds.day_of_week === dayOfWeek && ds.is_active)
      .map(ds => ds.shift_id);
    return businessShifts.filter(shift => enabledShiftIds.includes(shift.id));
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    const errors = [];
    if (!reservationForm.customer_name || reservationForm.customer_name.trim().length === 0) errors.push('El nombre es requerido');
    else if (reservationForm.customer_name.length > 100) errors.push('El nombre es demasiado largo (máximo 100 caracteres)');

    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!reservationForm.customer_phone || reservationForm.customer_phone.trim().length === 0) errors.push('El teléfono es requerido');
    else if (!phoneRegex.test(reservationForm.customer_phone)) errors.push('El teléfono contiene caracteres inválidos');
    else if (reservationForm.customer_phone.length > 20) errors.push('El teléfono es demasiado largo');

    const peopleCount = parseInt(reservationForm.number_of_people);
    if (isNaN(peopleCount) || peopleCount < 1 || peopleCount > 50) errors.push('La cantidad de personas debe ser entre 1 y 50');

    if (reservationForm.customer_email && reservationForm.customer_email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reservationForm.customer_email)) errors.push('El email no es válido');
    }

    if (!reservationForm.reservation_date) {
      errors.push('La fecha es requerida');
    } else {
      const reservationDate = new Date(reservationForm.reservation_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (reservationDate < today) errors.push('La fecha de reserva no puede ser en el pasado');
    }

    if (!reservationForm.reservation_time) errors.push('La hora es requerida');
    if (reservationForm.special_requests && reservationForm.special_requests.length > 500) errors.push('El mensaje es demasiado largo (máximo 500 caracteres)');

    if (errors.length > 0) {
      setReservationError(errors.join(' · '));
      return;
    }
    setReservationError('');

    try {
      if (reservationForm.preferred_table_type_id) {
        const { data, error: availError } = await supabase
          .rpc('get_table_type_availability', {
            p_business_id: business.id,
            p_table_type_id: reservationForm.preferred_table_type_id,
            p_date: reservationForm.reservation_date,
            p_time: reservationForm.reservation_time
          });

        if (availError) {
          console.error('Error verificando disponibilidad:', availError);
          alert('Error al verificar disponibilidad. Por favor intenta nuevamente.');
          return;
        }

        const result = data?.[0] || { total_capacity: 0, available_capacity: 0, is_shared: false };

        if (result.is_shared) {
          if (result.available_capacity < peopleCount) {
            setReservationError(`Solo quedan ${result.available_capacity} lugares disponibles para este día. Seleccioná otra fecha o reducí la cantidad de personas.`);
            return;
          }
        } else {
          if (result.available_capacity <= 0) {
            setReservationError('No hay mesas disponibles para este día. Seleccioná otra fecha o contactanos por WhatsApp.');
            return;
          }
        }
      } else {
        const { data: tablesData } = await supabase
          .from('tables')
          .select('id')
          .eq('business_id', business.id)
          .eq('is_active', true)
          .limit(1);

        if (!tablesData || tablesData.length === 0) {
          console.log('ℹ️ No hay mesas configuradas para este negocio. La reserva se gestionará manualmente.');
        }
      }

      const reservationData = {
        business_id: business.id,
        customer_name: reservationForm.customer_name.trim(),
        customer_phone: reservationForm.customer_phone.trim(),
        customer_email: reservationForm.customer_email?.trim() || null,
        reservation_date: reservationForm.reservation_date,
        reservation_time: reservationForm.reservation_time,
        number_of_people: peopleCount,
        preferred_table_type_id: reservationForm.preferred_table_type_id || null,
        special_requests: reservationForm.special_requests?.trim() || null,
        status: 'pending'
      };

      // Calcular monto de seña si el negocio la requiere
      const depositRequired = business.requires_deposit && business.mp_seller_access_token;
      const depositAmount = depositRequired
        ? business.deposit_type === 'per_person'
          ? business.deposit_amount * peopleCount
          : business.deposit_amount
        : null;

      const { data: newReservation, error } = await supabase
        .from('reservations')
        .insert([{
          ...reservationData,
          deposit_status: depositRequired ? 'pending' : 'not_required',
          deposit_amount: depositAmount,
        }])
        .select('id, cancellation_token, reservation_date, reservation_time')
        .single();

      if (error) throw error;

      setShowReservationDrawer(false);
      setReservationForm({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        number_of_people: 2,
        reservation_date: "",
        reservation_time: "",
        preferred_table_type_id: "",
        special_requests: ""
      });

      // Si requiere seña, redirigir a MP para el pago
      if (depositRequired) {
        const { data: depositData, error: depositError } = await supabase.functions.invoke('create-deposit', {
          body: {
            businessId: business.id,
            reservationId: newReservation.id,
            customerEmail: reservationForm.customer_email?.trim() || null,
            customerName: reservationForm.customer_name.trim(),
            depositAmount,
            businessSlug: business.slug,
          },
        });

        if (depositError || !depositData?.init_point) {
          alert('Reserva creada, pero hubo un error al generar el link de pago. Contactá al negocio.');
          return;
        }

        window.location.href = depositData.init_point;
        return;
      }

      // Sin seña: mostrar modal de éxito y abrir WhatsApp
      const successData = {
        token: newReservation.cancellation_token,
        date: newReservation.reservation_date,
        time: newReservation.reservation_time,
        customerName: reservationForm.customer_name.trim(),
        customerPhone: reservationForm.customer_phone.trim(),
        numberOfPeople: peopleCount,
        specialRequests: reservationForm.special_requests?.trim() || null,
      };

      setReservationSuccess(successData);

      // Notificaciones por email (no bloqueante)
      supabase.functions.invoke('notify-reservation', {
        body: { event: 'reservation_created', reservationId: newReservation.id }
      }).catch(() => {});

      // Abrir WhatsApp automáticamente para notificar al negocio
      const whatsappNumber = (business.whatsapp_number || business.phone || '').replace(/\D/g, '');
      if (whatsappNumber) {
        const cancelUrl = `${window.location.origin}/cancelar-reserva/${newReservation.cancellation_token}`;
        const formattedDate = new Date(newReservation.reservation_date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
        const lines = [
          `Hola ${business.name}! Acabo de hacer una reserva 🍽️`,
          ``,
          `👤 Nombre: ${successData.customerName}`,
          `👥 Personas: ${successData.numberOfPeople}`,
          `📅 Fecha: ${formattedDate}`,
          `🕐 Hora: ${newReservation.reservation_time}hs`,
          `📱 Teléfono: ${successData.customerPhone}`,
        ];
        if (successData.specialRequests) lines.push(`📝 Pedido especial: ${successData.specialRequests}`);
        lines.push(``, `🔗 Link de cancelación: ${cancelUrl}`);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
      }
    } catch (error) {
      console.error('Error guardando reserva:', error);
      let errorMessage = 'Hubo un error al enviar la reserva. Por favor intenta nuevamente.';
      if (error.code === 'PGRST116') errorMessage = 'Este negocio no está aceptando reservas en este momento.';
      else if (error.code === '42501') errorMessage = 'No tenés permisos para crear esta reserva.';
      else if (error.message && error.message.includes('No hay mesas disponibles')) errorMessage = '❌ Lo sentimos, ya no hay mesas disponibles para este día.\n\nOtra persona acaba de reservar. Por favor seleccioná otro día o contactanos por WhatsApp.';
      else if (error.message) errorMessage = `Error: ${error.message}`;
      alert(errorMessage);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name.trim()) return;
    setSubmittingReview(true);
    setReviewMessage('');
    const { error } = await supabase
      .from('business_reviews')
      .insert([{
        business_id: business.id,
        reviewer_name: reviewForm.reviewer_name.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
      }]);
    setSubmittingReview(false);
    if (error) {
      setReviewMessage('❌ Error al enviar la reseña');
    } else {
      const newReview = { id: Date.now(), ...reviewForm, created_at: new Date().toISOString() };
      const updated = [newReview, ...reviews];
      setReviews(updated);
      const avg = updated.reduce((sum, r) => sum + r.rating, 0) / updated.length;
      setReviewStats({ avg: Math.round(avg * 10) / 10, count: updated.length });
      setReviewForm({ reviewer_name: '', rating: 5, comment: '' });
      setReviewMessage('✅ ¡Gracias por tu reseña!');
      setTimeout(() => setReviewMessage(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── NAVBAR STICKY ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: isScrolled ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-neutral-dark text-base sm:text-lg truncate max-w-[160px] sm:max-w-xs"
          >
            {business.name}
          </motion.span>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {isLoggedIn && (
              <button
                onClick={() => navigate(`/admin/${business.slug}`)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium border-2 transition ${isScrolled ? 'border-primary text-primary hover:bg-primary/10' : 'border-white/70 text-white hover:bg-white/20'}`}
              >
                ⚙️ <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            {business.is_accepting_reservations && (
              <button
                onClick={() => setShowReservationDrawer(true)}
                className={`px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm rounded-lg font-semibold transition shadow-sm ${isScrolled ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white text-primary hover:bg-white/90'}`}
              >
                Reservar mesa
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO FULL SCREEN ── */}
      <section className="relative h-screen min-h-[580px] max-h-[900px] flex items-center justify-center overflow-hidden">
        {/* Fondo */}
        {business.cover_image_url ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${business.cover_image_url})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />
        )}
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/75" />

        {/* Badge TuMesaHoy - top left */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-white/15 hover:bg-white/25 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl transition border border-white/20"
        >
          <img src="/LogoFinal.svg" alt="TuMesaHoy" className="h-7 sm:h-9 brightness-200 opacity-90" />
        </button>

        {/* Botón QR - top right */}
        <button
          onClick={() => setShowQR(true)}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-3 py-1.5 rounded-full transition border border-white/20 flex items-center gap-1.5"
        >
          <span>📱</span>
          <span className="hidden sm:inline">Ver QR</span>
        </button>

        {/* Contenido central */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center text-white px-5 sm:px-8 max-w-4xl mx-auto"
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-5 sm:mb-6">
            {business.category && (
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full border border-white/25 capitalize">
                {business.category}
              </span>
            )}
            {business.is_accepting_reservations ? (
              <span className="px-3 py-1 bg-green-500/85 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full">
                ✓ Aceptando reservas
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-500/85 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full">
                ✗ No disponible
              </span>
            )}
            {reviewStats.count > 0 && (
              <span className="px-3 py-1 bg-yellow-400/85 backdrop-blur-sm text-neutral-dark text-xs sm:text-sm font-semibold rounded-full flex items-center gap-1">
                ★ {reviewStats.avg} <span className="opacity-70">({reviewStats.count})</span>
              </span>
            )}
          </div>

          {/* Nombre del restaurante */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-5 drop-shadow-lg leading-tight">
            {business.name}
          </h1>

          {/* Descripción */}
          {business.description && (
            <p className="text-base sm:text-lg md:text-xl text-white/85 mb-7 sm:mb-9 max-w-2xl mx-auto leading-relaxed">
              {business.description}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {business.is_accepting_reservations ? (
              <button
                onClick={() => setShowReservationDrawer(true)}
                className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-white text-neutral-dark font-bold text-sm sm:text-base rounded-xl hover:bg-white/90 shadow-2xl transition transform hover:-translate-y-0.5 active:scale-95"
              >
                Reservar mesa
              </button>
            ) : (
              <div className="px-8 py-3.5 bg-white/15 text-white/60 font-bold text-sm sm:text-base rounded-xl border border-white/25 cursor-default">
                Reservas no disponibles
              </div>
            )}
            {menuItems.length > 0 && (
              <button
                onClick={() => menuRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 bg-transparent text-white font-bold text-sm sm:text-base rounded-xl border-2 border-white/50 hover:bg-white/10 transition active:scale-95"
              >
                Ver menú
              </button>
            )}
          </div>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-7 sm:bottom-9 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="flex flex-col items-center gap-1 text-white/40"
          >
            <span className="text-[10px] tracking-widest uppercase">Scroll</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STRIP DE INFO ── */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {business.address && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📍</span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-neutral-medium uppercase tracking-widest mb-1">Dirección</p>
                  <p className="text-sm sm:text-base text-neutral-dark font-medium">{business.address}</p>
                </div>
              </div>
            )}

            {businessHours.length > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🕒</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs font-bold text-neutral-medium uppercase tracking-widest mb-1">Horario</p>
                  <button
                    onClick={() => setShowAllHours(!showAllHours)}
                    className="text-sm sm:text-base text-neutral-dark font-medium hover:text-primary transition flex items-center gap-1.5"
                  >
                    {formatBusinessHours()}
                    <span className="text-xs text-neutral-medium">{showAllHours ? '▲' : '▼'}</span>
                  </button>
                  <AnimatePresence>
                    {showAllHours && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1 pt-2 border-t border-gray-100">
                          {businessHours.map((hour) => (
                            <div key={hour.day_of_week} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-neutral-medium">{getDayName(hour.day_of_week)}</span>
                              <span className={hour.is_closed ? 'text-red-500 font-semibold' : 'text-neutral-dark font-medium'}>
                                {hour.is_closed ? 'Cerrado' : `${hour.opens_at.slice(0, 5)} - ${hour.closes_at.slice(0, 5)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {(business.whatsapp_number || business.phone) && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-neutral-medium uppercase tracking-widest mb-1">Contacto</p>
                  <a
                    href={`https://wa.me/${((business.whatsapp_number || business.phone) || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-green-600 hover:text-green-700 font-semibold transition"
                  >
                    Escribir por WhatsApp →
                  </a>
                  {(business.instagram_url || business.facebook_url || business.tiktok_url) && (
                    <div className="flex items-center gap-3 mt-2">
                      {business.instagram_url && (
                        <a href={business.instagram_url} target="_blank" rel="noopener noreferrer"
                          className="text-neutral-medium hover:text-pink-500 transition" title="Instagram">
                          <InstagramIcon className="w-5 h-5" />
                        </a>
                      )}
                      {business.facebook_url && (
                        <a href={business.facebook_url} target="_blank" rel="noopener noreferrer"
                          className="text-neutral-medium hover:text-blue-600 transition" title="Facebook">
                          <FacebookIcon className="w-5 h-5" />
                        </a>
                      )}
                      {business.tiktok_url && (
                        <a href={business.tiktok_url} target="_blank" rel="noopener noreferrer"
                          className="text-neutral-medium hover:text-neutral-dark transition" title="TikTok">
                          <TikTokIcon className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN MENÚ ── */}
      {menuItems.length > 0 && (
        <section ref={menuRef} id="menu" className="py-10 sm:py-14 md:py-16 px-4 sm:px-6 bg-gray-50 flex-1">
          <div className="max-w-6xl mx-auto">
            {/* Encabezado */}
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-dark mb-3">Nuestro menú</h2>
              <div className="w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
            </div>

            {/* Filtros de categoría */}
            {menuCategories.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mb-7 sm:mb-9">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${selectedCategory === 'all' ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-medium hover:bg-gray-100 border border-gray-200'}`}
                >
                  Todo
                </button>
                {menuCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${selectedCategory === cat.id ? 'bg-primary text-white shadow-md' : 'bg-white text-neutral-medium hover:bg-gray-100 border border-gray-200'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Grid de items */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col"
                >
                  {item.image_url && (
                    <div className="h-44 sm:h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-base sm:text-lg text-neutral-dark mb-1 line-clamp-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-neutral-medium line-clamp-2 mb-3 flex-1">{item.description}</p>
                    )}
                    <span className="text-lg sm:text-xl font-bold text-primary mt-auto">
                      ${item.price.toLocaleString('es-AR')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {filteredItems.length === 0 && (
              <p className="text-center text-neutral-medium py-12 text-sm sm:text-base">
                No hay items en esta categoría
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── SECCIÓN RESEÑAS ── */}
      <section className="py-10 sm:py-14 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-dark mb-2">Reseñas</h2>
            {reviewStats.count > 0 && (
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-bold text-neutral-dark">{reviewStats.avg}</span>
                <div className="flex text-yellow-400 text-xl">
                  {[1,2,3,4,5].map(s => (
                    <span key={s}>{s <= Math.round(reviewStats.avg) ? '★' : '☆'}</span>
                  ))}
                </div>
                <span className="text-neutral-medium text-sm">({reviewStats.count} reseñas)</span>
              </div>
            )}
            <div className="w-14 h-1 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
          </div>

          {/* Formulario para dejar reseña */}
          <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 mb-8 border border-gray-200">
            <h3 className="font-bold text-neutral-dark mb-4 text-base">Dejá tu reseña</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-dark mb-1">Tu nombre *</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.reviewer_name}
                    onChange={e => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))}
                    placeholder="Juan García"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-dark mb-1">Puntaje *</label>
                  <div className="flex gap-1 py-2">
                    {[1,2,3,4,5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                        className={`text-2xl transition ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-dark mb-1">Comentario (opcional)</label>
                <textarea
                  rows={3}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="¿Cómo fue tu experiencia?"
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition resize-none"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {submittingReview ? 'Enviando...' : 'Publicar reseña'}
                </button>
                {reviewMessage && (
                  <p className={`text-sm font-medium ${reviewMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {reviewMessage}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Lista de reseñas */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-neutral-dark text-sm">{r.reviewer_name}</p>
                      <p className="text-xs text-neutral-medium">
                        {new Date(r.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex text-yellow-400 flex-shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-sm">{s <= r.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-neutral-medium leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-medium text-sm py-4">Todavía no hay reseñas. ¡Sé el primero!</p>
          )}
        </div>
      </section>

      {/* ── FOOTER MÍNIMO ── */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{business.name}</h3>
              <div className="space-y-1.5 text-sm text-gray-400">
                {business.address && <p>📍 {business.address}</p>}
                {(business.whatsapp_number || business.phone) && (
                  <a
                    href={`https://wa.me/${((business.whatsapp_number || business.phone) || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-green-400 transition w-fit"
                  >
                    💬 WhatsApp
                  </a>
                )}
                {(business.instagram_url || business.facebook_url || business.tiktok_url) && (
                  <div className="flex items-center gap-4 pt-1">
                    {business.instagram_url && (
                      <a href={business.instagram_url} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-400 transition" title="Instagram">
                        <InstagramIcon className="w-5 h-5" />
                      </a>
                    )}
                    {business.facebook_url && (
                      <a href={business.facebook_url} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition" title="Facebook">
                        <FacebookIcon className="w-5 h-5" />
                      </a>
                    )}
                    {business.tiktok_url && (
                      <a href={business.tiktok_url} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition" title="TikTok">
                        <TikTokIcon className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <img src="/LogoFinal.svg" alt="TuMesaHoy" className="h-5 opacity-60 brightness-200" />
                <span className="text-xs text-gray-500">Powered by TuMesaHoy</span>
              </button>
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── DRAWER DE RESERVA ── */}
      <AnimatePresence>
        {showReservationDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReservationDrawer(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-stretch justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:w-[500px] h-[94vh] sm:h-full flex flex-col rounded-t-3xl sm:rounded-none shadow-2xl"
            >
              {/* Handle mobile */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* Header del drawer */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b flex-shrink-0">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-dark">Hacer una reserva</h2>
                  <p className="text-xs sm:text-sm text-neutral-medium mt-0.5">{business.name}</p>
                </div>
                <button
                  onClick={() => setShowReservationDrawer(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-neutral-medium hover:text-neutral-dark transition text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Cuerpo scrolleable */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 sm:py-6">
                <form onSubmit={handleReservationSubmit} className="space-y-5 sm:space-y-6">

                  {/* Datos del cliente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">Nombre *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2.5 text-sm border-2 border-neutral-medium/30 rounded-xl focus:border-primary focus:outline-none transition"
                        placeholder="Tu nombre"
                        value={reservationForm.customer_name}
                        onChange={(e) => setReservationForm({ ...reservationForm, customer_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2.5 text-sm border-2 border-neutral-medium/30 rounded-xl focus:border-primary focus:outline-none transition"
                        placeholder="+54 9 11 1234-5678"
                        value={reservationForm.customer_phone}
                        onChange={(e) => setReservationForm({ ...reservationForm, customer_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">Email (opcional)</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 text-sm border-2 border-neutral-medium/30 rounded-xl focus:border-primary focus:outline-none transition"
                      placeholder="tu@email.com"
                      value={reservationForm.customer_email}
                      onChange={(e) => setReservationForm({ ...reservationForm, customer_email: e.target.value })}
                    />
                  </div>

                  {/* Selector de Fecha */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-dark mb-3">📅 Fecha de la reserva *</label>
                    <div className="relative">
                      {/* Flecha izquierda — solo desktop */}
                      <button
                        type="button"
                        onClick={() => dateScrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-7 h-7 bg-white border border-gray-200 shadow-md rounded-full items-center justify-center text-neutral-dark hover:bg-gray-50 transition text-base leading-none"
                      >
                        ‹
                      </button>

                      <div
                        ref={dateScrollRef}
                        className="flex gap-2 overflow-x-auto pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onWheel={(e) => {
                          if (dateScrollRef.current) {
                            e.preventDefault();
                            dateScrollRef.current.scrollLeft += e.deltaY;
                          }
                        }}
                      >
                        {(() => {
                          const dates = [];
                          const today = new Date();
                          for (let i = 0; i < 14; i++) {
                            const date = new Date(today);
                            date.setDate(today.getDate() + i);
                            const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            const dateStr = date.toISOString().split('T')[0];
                            dates.push({
                              dateStr,
                              dayNum: date.getDate(),
                              monthName: monthNames[date.getMonth()],
                              label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dayNames[date.getDay()]
                            });
                          }
                          return dates.map((item) => (
                            <button
                              key={item.dateStr}
                              type="button"
                              onClick={() => setReservationForm({ ...reservationForm, reservation_date: item.dateStr })}
                              className={`flex-shrink-0 w-[72px] p-3 rounded-xl border-2 transition text-center ${reservationForm.reservation_date === item.dateStr ? 'border-primary bg-primary text-white shadow-md scale-105' : 'border-neutral-medium/30 hover:border-primary/50 hover:bg-primary/5'}`}
                            >
                              <div className={`text-[10px] font-medium mb-0.5 ${reservationForm.reservation_date === item.dateStr ? 'text-white' : 'text-neutral-medium'}`}>{item.label}</div>
                              <div className={`text-xl font-bold ${reservationForm.reservation_date === item.dateStr ? 'text-white' : 'text-neutral-dark'}`}>{item.dayNum}</div>
                              <div className={`text-[10px] font-medium mt-0.5 ${reservationForm.reservation_date === item.dateStr ? 'text-white/90' : 'text-neutral-medium'}`}>{item.monthName}</div>
                            </button>
                          ));
                        })()}
                      </div>

                      {/* Flecha derecha — solo desktop */}
                      <button
                        type="button"
                        onClick={() => dateScrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-7 h-7 bg-white border border-gray-200 shadow-md rounded-full items-center justify-center text-neutral-dark hover:bg-gray-50 transition text-base leading-none"
                      >
                        ›
                      </button>
                    </div>

                    {/* Hint solo en móvil */}
                    <p className="text-center text-xs text-neutral-medium mt-2 sm:hidden">← Deslizá para ver más fechas →</p>
                  </div>

                  {/* Selector de Hora por Turnos */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-dark mb-3">🕐 Hora de la reserva *</label>
                    {(() => {
                      const availableShifts = getAvailableShiftsForDay(reservationForm.reservation_date);
                      if (!reservationForm.reservation_date) {
                        return (
                          <div className="text-center py-4 text-amber-600 text-sm bg-amber-50 rounded-xl border border-amber-200">
                            👆 Primero seleccioná una fecha para ver los turnos disponibles
                          </div>
                        );
                      }
                      if (availableShifts.length === 0) {
                        return (
                          <div className="text-center py-4 text-neutral-medium text-sm bg-gray-50 rounded-xl">
                            No hay turnos disponibles para este día.
                          </div>
                        );
                      }
                      return availableShifts.map((shift) => (
                        <div key={shift.id} className="mb-4">
                          <div className="text-xs font-semibold text-neutral-medium mb-2 flex items-center gap-2">
                            <span className="text-base">{shift.icon}</span>
                            <span>{shift.name}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {shift.available_times.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setReservationForm({ ...reservationForm, reservation_time: time })}
                                className={`py-2.5 rounded-xl border-2 transition text-xs sm:text-sm font-semibold ${reservationForm.reservation_time === time ? 'border-primary bg-primary text-white shadow-md' : 'border-neutral-medium/30 hover:border-primary/50 hover:bg-primary/5'}`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Cantidad de personas */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">Cantidad de personas *</label>
                    <select
                      className="w-full px-4 py-2.5 text-sm border-2 border-neutral-medium/30 rounded-xl focus:border-primary focus:outline-none transition"
                      value={reservationForm.number_of_people}
                      onChange={(e) => setReservationForm({ ...reservationForm, number_of_people: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>{num} {num === 1 ? 'persona' : 'personas'}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de mesa */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-dark mb-3">🪑 Tipo de mesa preferido (opcional)</label>
                    <TableTypeSelector
                      businessId={business.id}
                      selectedTypeId={reservationForm.preferred_table_type_id}
                      onSelectType={(typeId) => setReservationForm({ ...reservationForm, preferred_table_type_id: typeId })}
                      reservationDate={reservationForm.reservation_date}
                      reservationTime={reservationForm.reservation_time}
                      numberOfPeople={reservationForm.number_of_people}
                      reservationMode={business.reservation_mode || 'no_turnover'}
                    />
                    <p className="text-xs text-neutral-medium mt-2">
                      💡 Seleccionar un tipo de mesa ayuda al restaurante a preparar tu reserva, pero no garantiza una mesa específica.
                    </p>

                    {business.reservation_mode === 'with_duration' && business.default_reservation_duration && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs sm:text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-lg">⏱️</span>
                          <span>
                            <strong>Duración de la reserva:</strong> Tu mesa estará reservada por {
                              business.default_reservation_duration >= 60
                                ? `${Math.floor(business.default_reservation_duration / 60)} hora${Math.floor(business.default_reservation_duration / 60) > 1 ? 's' : ''}${business.default_reservation_duration % 60 > 0 ? ` ${business.default_reservation_duration % 60} min` : ''}`
                                : `${business.default_reservation_duration} minutos`
                            }.
                          </span>
                        </p>
                      </div>
                    )}
                    {(!business.reservation_mode || business.reservation_mode === 'no_turnover') && reservationForm.preferred_table_type_id && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs sm:text-sm text-amber-800 flex items-start gap-2">
                          <span className="text-lg">📅</span>
                          <span><strong>Reserva por día completo:</strong> Al reservar, la mesa queda asignada para todo el día seleccionado.</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mapa del local */}
                  {reservationForm.preferred_table_type_id && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-neutral-dark mb-3 flex items-center gap-2">
                        <span>🗺️</span> Vista del local
                      </h4>
                      <TableMapViewer
                        businessId={business.id}
                        selectedTypeId={reservationForm.preferred_table_type_id}
                        showLegend={true}
                      />
                    </div>
                  )}

                  {/* Comentarios */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-neutral-dark mb-2">Comentarios (opcional)</label>
                    <textarea
                      className="w-full px-4 py-2.5 text-sm border-2 border-neutral-medium/30 rounded-xl focus:border-primary focus:outline-none transition"
                      placeholder="Ej: Cumpleaños, alergias, preferencias..."
                      rows="3"
                      value={reservationForm.special_requests}
                      onChange={(e) => setReservationForm({ ...reservationForm, special_requests: e.target.value })}
                    />
                  </div>

                  {reservationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                      {reservationError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:shadow-lg transition transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Confirmar reserva
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL QR ── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQR(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-dark">Escaneá el QR</h3>
                <button onClick={() => setShowQR(false)} className="text-3xl text-neutral-medium hover:text-neutral-dark transition leading-none">×</button>
              </div>
              <div className="bg-white p-4 rounded-xl border-4 border-primary/20 mb-4">
                <QRCodeSVG value={window.location.href} size={256} level="H" className="w-full h-auto" />
              </div>
              <p className="text-center text-xs sm:text-sm text-neutral-medium mb-4">
                Compartí este código para que otros puedan ver el menú y hacer reservas
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="w-full py-3 text-sm sm:text-base bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL RESERVA EXITOSA ── */}
      <AnimatePresence>
        {reservationSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-3xl sm:text-4xl">✓</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-dark mb-2">¡Reserva Confirmada!</h3>
                <p className="text-sm sm:text-base text-neutral-medium">
                  Tu reserva en <span className="font-semibold">{business.name}</span> ha sido registrada
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-medium">📅 Fecha:</span>
                  <span className="font-semibold text-neutral-dark">
                    {new Date(reservationSuccess.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-medium">🕐 Hora:</span>
                  <span className="font-semibold text-neutral-dark">{reservationSuccess.time} hs</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-amber-800 mb-3">
                  <span className="font-semibold">⚠️ Importante:</span> Guardá este link para poder cancelar tu reserva si lo necesitás:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/cancelar-reserva/${reservationSuccess.token}`}
                    className="flex-1 text-xs bg-white border border-amber-300 rounded-lg px-3 py-2 text-neutral-dark"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/cancelar-reserva/${reservationSuccess.token}`);
                      alert('¡Link copiado!');
                    }}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <button
                onClick={() => setReservationSuccess(null)}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Entendido
              </button>

              {(business.whatsapp_number || business.phone) && (
                <div className="text-center mt-4">
                  <a
                    href={(() => {
                      const whatsappNumber = (business.whatsapp_number || business.phone || '').replace(/\D/g, '');
                      const cancelUrl = `${window.location.origin}/cancelar-reserva/${reservationSuccess.token}`;
                      const formattedDate = new Date(reservationSuccess.date + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
                      const lines = [
                        `Hola ${business.name}! Acabo de hacer una reserva 🍽️`,
                        ``,
                        `👤 Nombre: ${reservationSuccess.customerName}`,
                        `👥 Personas: ${reservationSuccess.numberOfPeople}`,
                        `📅 Fecha: ${formattedDate}`,
                        `🕐 Hora: ${reservationSuccess.time}hs`,
                        `📱 Teléfono: ${reservationSuccess.customerPhone}`,
                        ...(reservationSuccess.specialRequests ? [`📝 Pedido especial: ${reservationSuccess.specialRequests}`] : []),
                        ``,
                        `🔗 Link de cancelación: ${cancelUrl}`,
                      ];
                      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium transition"
                  >
                    <span>💬</span>
                    Reenviar confirmación por WhatsApp
                  </a>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
