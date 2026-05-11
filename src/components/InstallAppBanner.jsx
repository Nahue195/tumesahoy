import { useState, useEffect } from 'react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Detectar iOS (Safari no soporta beforeinstallprompt)
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isInStandaloneMode) return; // Ya está instalada

    if (isIOSDevice) {
      setIsIOS(true);
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) setShowBanner(true);
      return;
    }

    // Android / Chrome
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSModal(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner fijo abajo */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4 bg-white border-t-2 border-primary/20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-slide-up">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <img src="/FavIcon.png" alt="TuMesaHoy" className="w-10 h-10 rounded-xl" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-neutral-dark truncate">Instalar TuMesaHoy</p>
            <p className="text-xs text-neutral-medium">Acceso directo desde tu pantalla de inicio</p>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg text-sm font-semibold hover:shadow-lg transition"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 text-neutral-medium hover:text-neutral-dark transition"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal instrucciones iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-dark mb-4 text-center">
              Instalar TuMesaHoy
            </h3>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">1</span>
                <p className="text-sm text-neutral-dark pt-1">
                  Tocá el botón <strong>Compartir</strong>{' '}
                  <svg className="inline w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>{' '}
                  en la barra de Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">2</span>
                <p className="text-sm text-neutral-dark pt-1">
                  Deslizá hacia abajo y tocá <strong>"Agregar a Inicio"</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">3</span>
                <p className="text-sm text-neutral-dark pt-1">
                  Confirmá tocando <strong>"Agregar"</strong>
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
