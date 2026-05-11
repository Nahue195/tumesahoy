import { useSearchParams, useNavigate } from 'react-router-dom';

export default function DepositFailurePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get('slug');

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">😕</p>
        <h1 className="text-2xl font-bold text-neutral-dark mb-2">Pago no completado</h1>
        <p className="text-neutral-medium mb-8">
          No se pudo procesar la seña. Tu reserva no fue confirmada.
          Podés intentarlo nuevamente.
        </p>
        {slug && (
          <button
            onClick={() => navigate(`/negocio/${slug}`)}
            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            Volver e intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
