import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function DepositSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reservationId = searchParams.get('reservation_id');
  const slug = searchParams.get('slug');
  const paymentId = searchParams.get('payment_id');

  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!reservationId || !paymentId) {
      setStatus('error');
      return;
    }
    confirmDeposit();
  }, []);

  async function confirmDeposit() {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-deposit', {
        body: { reservationId, paymentId },
      });

      if (error) throw error;

      if (data.status === 'approved') setStatus('approved');
      else if (data.status === 'pending') setStatus('pending');
      else setStatus('error');
    } catch (err) {
      console.error('Error confirmando seña:', err);
      setStatus('error');
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-neutral-medium">Confirmando tu seña...</p>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">⏳</p>
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Pago en proceso</h1>
          <p className="text-neutral-medium mb-8">
            Tu pago está siendo procesado. Te avisaremos cuando se confirme.
          </p>
          {slug && (
            <button onClick={() => navigate(`/negocio/${slug}`)} className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition">
              Volver al negocio
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">❌</p>
          <h1 className="text-2xl font-bold text-neutral-dark mb-2">Hubo un problema</h1>
          <p className="text-neutral-medium mb-8">
            No pudimos confirmar tu seña. Por favor contactá al negocio.
          </p>
          {slug && (
            <button onClick={() => navigate(`/negocio/${slug}`)} className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition">
              Volver al negocio
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-neutral-dark mb-2">¡Seña confirmada!</h1>
        <p className="text-neutral-medium mb-8">
          Tu reserva quedó confirmada. Nos vemos pronto.
        </p>
        {slug && (
          <button onClick={() => navigate(`/negocio/${slug}`)} className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition">
            Volver al negocio
          </button>
        )}
      </div>
    </div>
  );
}
