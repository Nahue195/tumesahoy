import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminDepositSection({ business, onUpdate }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    requires_deposit: false,
    deposit_amount: '',
    deposit_type: 'fixed',
    deposit_refundable: true,
    deposit_cancellation_hours: 24,
  });

  const isMpConnected = !!business?.mp_seller_access_token;
  const mpTokenExpired = business?.mp_seller_token_expires_at
    ? new Date(business.mp_seller_token_expires_at) < new Date()
    : false;

  useEffect(() => {
    if (!business) return;
    setForm({
      requires_deposit: business.requires_deposit || false,
      deposit_amount: business.deposit_amount || '',
      deposit_type: business.deposit_type || 'fixed',
      deposit_refundable: business.deposit_refundable ?? true,
      deposit_cancellation_hours: business.deposit_cancellation_hours || 24,
    });
  }, [business]);

  const handleConnectMP = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setMessage('❌ Sesión expirada, iniciá sesión nuevamente');
      return;
    }

    // Crear un token de estado opaco en la DB en lugar de pasar el JWT en la URL
    const { data: stateData, error: stateError } = await supabase
      .from('mp_oauth_states')
      .insert({ business_id: business.id, user_id: session.user.id })
      .select('id')
      .single();

    if (stateError || !stateData) {
      setMessage('❌ Error iniciando conexión con MercadoPago. Intentá nuevamente.');
      return;
    }

    const appId = import.meta.env.VITE_MP_APP_ID;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const redirectUri = `${supabaseUrl}/functions/v1/mp-oauth-callback`;
    // state = "businessSlug:stateId" — sin credenciales del usuario
    const state = `${business.slug}:${stateData.id}`;
    const url = `https://auth.mercadopago.com.ar/authorization?client_id=${appId}&response_type=code&platform_id=mp&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    window.location.href = url;
  };

  const handleSave = async () => {
    if (form.requires_deposit && !form.deposit_amount) {
      setMessage('❌ Ingresá el monto de la seña');
      return;
    }
    if (form.requires_deposit && !isMpConnected) {
      setMessage('❌ Primero conectá tu cuenta de MercadoPago');
      return;
    }

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('businesses')
      .update({
        requires_deposit: form.requires_deposit,
        deposit_amount: form.requires_deposit ? parseFloat(form.deposit_amount) : null,
        deposit_type: form.deposit_type,
        deposit_refundable: form.deposit_refundable,
        deposit_cancellation_hours: parseInt(form.deposit_cancellation_hours),
        updated_at: new Date().toISOString(),
      })
      .eq('id', business.id);

    setSaving(false);

    if (error) {
      setMessage('❌ Error al guardar: ' + error.message);
    } else {
      setMessage('✅ Configuración guardada');
      onUpdate?.();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Seña online</h2>
        <p className="text-sm text-gray-400">
          Pedile a tus clientes un depósito al reservar para reducir los no-shows.
          El dinero va directo a tu cuenta de MercadoPago.
        </p>
      </div>

      {/* Estado de conexión con MP */}
      <div className={`rounded-xl p-4 border ${isMpConnected && !mpTokenExpired ? 'bg-green-900/20 border-green-500/40' : 'bg-yellow-900/20 border-yellow-500/40'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{isMpConnected && !mpTokenExpired ? '✅' : '⚠️'}</span>
            <div>
              <p className="font-semibold text-sm text-white">
                {isMpConnected && !mpTokenExpired
                  ? 'MercadoPago conectado'
                  : mpTokenExpired
                  ? 'Conexión con MercadoPago vencida'
                  : 'MercadoPago no conectado'}
              </p>
              <p className="text-xs text-gray-400">
                {isMpConnected && !mpTokenExpired
                  ? 'Los pagos de seña van directo a tu cuenta'
                  : 'Necesitás conectar tu cuenta para cobrar señas'}
              </p>
            </div>
          </div>
          <button
            onClick={handleConnectMP}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition"
          >
            {isMpConnected ? 'Reconectar cuenta' : 'Conectar MercadoPago'}
          </button>
        </div>
      </div>

      {/* Toggle seña */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="font-semibold text-white">Requerir seña al reservar</p>
            <p className="text-sm text-gray-400">Los clientes deberán pagar antes de confirmar la reserva</p>
          </div>
          <div
            onClick={() => setForm(f => ({ ...f, requires_deposit: !f.requires_deposit }))}
            className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${form.requires_deposit ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.requires_deposit ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      {/* Configuración de monto (solo si seña activa) */}
      {form.requires_deposit && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">

          {/* Tipo de seña */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Tipo de seña</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'fixed', label: 'Monto fijo', desc: 'Ej: $2.000 por reserva' },
                { value: 'per_person', label: 'Por persona', desc: 'Ej: $500 × cant. personas' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, deposit_type: opt.value }))}
                  className={`p-3 rounded-lg border-2 text-left transition ${form.deposit_type === opt.value ? 'border-primary bg-primary/20' : 'border-gray-600 hover:border-gray-500'}`}
                >
                  <p className="font-semibold text-sm text-white">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {form.deposit_type === 'fixed' ? 'Monto de la seña (ARS)' : 'Monto por persona (ARS)'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
              <input
                type="number"
                min="1"
                value={form.deposit_amount}
                onChange={e => setForm(f => ({ ...f, deposit_amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-gray-700 text-white placeholder-gray-400"
                placeholder="2000"
              />
            </div>
          </div>

          {/* Política de cancelación */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Política de cancelación</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: true, label: 'Reembolsable', desc: 'Se devuelve si cancela a tiempo' },
                { value: false, label: 'No reembolsable', desc: 'No se devuelve en ningún caso' },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  onClick={() => setForm(f => ({ ...f, deposit_refundable: opt.value }))}
                  className={`p-3 rounded-lg border-2 text-left transition ${form.deposit_refundable === opt.value ? 'border-primary bg-primary/20' : 'border-gray-600 hover:border-gray-500'}`}
                >
                  <p className="font-semibold text-sm text-white">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Horas para cancelar con reembolso */}
          {form.deposit_refundable && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Reembolso si cancela con al menos...
              </label>
              <select
                value={form.deposit_cancellation_hours}
                onChange={e => setForm(f => ({ ...f, deposit_cancellation_hours: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-gray-700 text-white"
              >
                {[2, 4, 6, 12, 24, 48, 72].map(h => (
                  <option key={h} value={h}>{h} horas de anticipación</option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-900 rounded-lg p-3 text-sm text-gray-400">
            <p className="font-semibold text-white mb-1">Vista previa para el cliente:</p>
            <p>
              Se requiere una seña de{' '}
              <strong className="text-white">
                {form.deposit_type === 'fixed'
                  ? `$${Number(form.deposit_amount || 0).toLocaleString('es-AR')} ARS`
                  : `$${Number(form.deposit_amount || 0).toLocaleString('es-AR')} ARS por persona`}
              </strong>{' '}
              para confirmar tu reserva.
              {form.deposit_refundable
                ? ` Reembolsable si cancelás con más de ${form.deposit_cancellation_hours}hs de anticipación.`
                : ' No reembolsable.'}
            </p>
          </div>
        </div>
      )}

      {message && (
        <p className={`text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
}
