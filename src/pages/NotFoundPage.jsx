import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-neutral-dark mb-2">
          Página no encontrada
        </h1>
        <p className="text-neutral-medium mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
