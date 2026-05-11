import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL;

export default function SuperAdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [feePercent, setFeePercent] = useState('');
  const [savingFee, setSavingFee] = useState(false);
  const [feeMessage, setFeeMessage] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceMessage, setPriceMessage] = useState('');
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, pending: 0 });
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== SUPERADMIN_EMAIL) {
      navigate('/');
      return;
    }
    setAuthorized(true);
    await Promise.all([loadSettings(), loadCommissions(), loadBusinesses()]);
    setLoading(false);
  }

  async function loadSettings() {
    const { data } = await supabase
      .from('platform_settings')
      .select('key, value');
    if (data) {
      const fee = data.find(r => r.key === 'marketplace_fee_percent');
      const price = data.find(r => r.key === 'subscription_monthly_price');
      if (fee) setFeePercent(fee.value);
      if (price) setSubPrice(price.value);
    }
  }

  async function loadCommissions() {
    const { data } = await supabase
      .from('reservations')
      .select('id, created_at, deposit_amount, commission_amount, deposit_status, businesses(name, slug)')
      .not('commission_amount', 'is', null)
      .gt('commission_amount', 0)
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setCommissions(data);
      const paid = data.filter(r => r.deposit_status === 'paid');
      const pendingList = data.filter(r => r.deposit_status === 'pending');
      setStats({
        total: paid.reduce((sum, r) => sum + (r.commission_amount || 0), 0),
        count: paid.length,
        pending: pendingList.reduce((sum, r) => sum + (r.commission_amount || 0), 0),
      });
    }
  }

  async function loadBusinesses() {
    const { data } = await supabase
      .from('businesses')
      .select('id, name, slug, is_active, created_at, mp_seller_access_token, mp_seller_token_expires_at, requires_deposit, deposit_amount')
      .order('created_at', { ascending: false });
    if (data) setBusinesses(data);
  }

  async function saveSubPrice() {
    const val = parseFloat(subPrice);
    if (isNaN(val) || val < 1) {
      setPriceMessage('❌ Ingresá un valor mayor a 0');
      return;
    }
    setSavingPrice(true);
    setPriceMessage('');
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key: 'subscription_monthly_price', value: String(val), updated_at: new Date().toISOString() });
    setSavingPrice(false);
    if (error) {
      setPriceMessage('❌ Error: ' + error.message);
    } else {
      setPriceMessage('✅ Precio actualizado');
      setTimeout(() => setPriceMessage(''), 3000);
    }
  }

  async function saveFeePercent() {
    const val = parseFloat(feePercent);
    if (isNaN(val) || val < 0 || val > 100) {
      setFeeMessage('❌ Ingresá un valor entre 0 y 100');
      return;
    }
    setSavingFee(true);
    setFeeMessage('');
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key: 'marketplace_fee_percent', value: String(val), updated_at: new Date().toISOString() });
    setSavingFee(false);
    if (error) {
      setFeeMessage('❌ Error: ' + error.message);
    } else {
      setFeeMessage('✅ Comisión actualizada');
      setTimeout(() => setFeeMessage(''), 3000);
    }
  }

  function formatDate(iso) {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function formatARS(n) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-dark">⚙️ Super Admin</h1>
          <p className="text-neutral-medium mt-1">Panel de control de TuMesaHoy</p>
        </div>

        {/* Stats de comisiones */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
            <p className="text-xs text-neutral-medium uppercase tracking-wide mb-1">Comisiones cobradas</p>
            <p className="text-2xl font-bold text-green-600">{formatARS(stats.total)}</p>
            <p className="text-xs text-neutral-medium mt-1">{stats.count} pagos</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
            <p className="text-xs text-neutral-medium uppercase tracking-wide mb-1">Comisiones pendientes</p>
            <p className="text-2xl font-bold text-amber-600">{formatARS(stats.pending)}</p>
            <p className="text-xs text-neutral-medium mt-1">por confirmar</p>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
            <p className="text-xs text-neutral-medium uppercase tracking-wide mb-1">Negocios activos</p>
            <p className="text-2xl font-bold text-primary">{businesses.filter(b => b.is_active).length}</p>
            <p className="text-xs text-neutral-medium mt-1">de {businesses.length} totales</p>
          </div>
        </div>

        {/* Comisión % */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-1">💰 Comisión de plataforma</h2>
          <p className="text-sm text-neutral-medium mb-4">
            Este % se aplica como <code>marketplace_fee</code> en cada pago de seña. Va directo a tu cuenta MP.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative w-36">
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={feePercent}
                onChange={e => setFeePercent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-medium text-sm">%</span>
            </div>
            <button
              onClick={saveFeePercent}
              disabled={savingFee}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {savingFee ? 'Guardando...' : 'Guardar'}
            </button>
            {feeMessage && (
              <p className={`text-sm font-medium ${feeMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {feeMessage}
              </p>
            )}
          </div>
          <p className="text-xs text-neutral-medium mt-3">
            Ejemplo: con {feePercent || '0'}% de comisión, sobre una seña de $5.000 ARS te quedan{' '}
            <strong>{formatARS(5000 * parseFloat(feePercent || 0) / 100)}</strong>.
          </p>
        </div>

        {/* Precio de suscripción mensual */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-1">📅 Precio de suscripción mensual</h2>
          <p className="text-sm text-neutral-medium mb-4">
            Cuánto pagan los restaurantes por mes para usar TuMesaHoy.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative w-44">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium text-sm font-semibold">$</span>
              <input
                type="number"
                min="1"
                step="100"
                value={subPrice}
                onChange={e => setSubPrice(e.target.value)}
                className="w-full pl-8 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-medium text-sm">ARS</span>
            </div>
            <button
              onClick={saveSubPrice}
              disabled={savingPrice}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50"
            >
              {savingPrice ? 'Guardando...' : 'Guardar'}
            </button>
            {priceMessage && (
              <p className={`text-sm font-medium ${priceMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {priceMessage}
              </p>
            )}
          </div>
          <p className="text-xs text-neutral-medium mt-3">
            Precio actual: <strong>{formatARS(parseFloat(subPrice || '0'))}/mes</strong>. Los cambios aplican a nuevas suscripciones.
          </p>
        </div>

        {/* Historial de comisiones */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-4">📋 Historial de comisiones</h2>
          {commissions.length === 0 ? (
            <p className="text-sm text-neutral-medium text-center py-6">No hay comisiones registradas todavía.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Fecha</th>
                    <th className="text-left py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Negocio</th>
                    <th className="text-right py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Seña</th>
                    <th className="text-right py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Mi comisión</th>
                    <th className="text-center py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-neutral-medium">{formatDate(r.created_at)}</td>
                      <td className="py-2 px-3 font-medium text-neutral-dark">{r.businesses?.name || '-'}</td>
                      <td className="py-2 px-3 text-right text-neutral-dark">{formatARS(r.deposit_amount)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-700">{formatARS(r.commission_amount)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.deposit_status === 'paid' ? 'bg-green-100 text-green-700' :
                          r.deposit_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {r.deposit_status === 'paid' ? 'Pagado' : r.deposit_status === 'pending' ? 'Pendiente' : r.deposit_status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Negocios */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-neutral-dark mb-4">🏢 Negocios registrados</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Nombre</th>
                  <th className="text-center py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Activo</th>
                  <th className="text-center py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">MP conectado</th>
                  <th className="text-center py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Seña</th>
                  <th className="text-right py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Monto seña</th>
                  <th className="text-left py-2 px-3 text-xs text-neutral-medium font-semibold uppercase">Registrado</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map(b => {
                  const mpExpired = b.mp_seller_token_expires_at
                    ? new Date(b.mp_seller_token_expires_at) < new Date()
                    : false;
                  const mpOk = !!b.mp_seller_access_token && !mpExpired;
                  return (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-neutral-dark">
                        <a href={`/negocio/${b.slug}`} target="_blank" rel="noreferrer" className="hover:text-primary">
                          {b.name}
                        </a>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-lg`}>{b.is_active ? '✅' : '❌'}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-lg">{mpOk ? '✅' : mpExpired ? '⚠️' : '❌'}</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-lg">{b.requires_deposit ? '✅' : '❌'}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-dark">
                        {b.requires_deposit ? formatARS(b.deposit_amount) : '-'}
                      </td>
                      <td className="py-2 px-3 text-neutral-medium">{formatDate(b.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
