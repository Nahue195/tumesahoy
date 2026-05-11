import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center  cursor-pointer">
            <img src="/LogoFinal.svg" alt="TuMesaHoy Logo" className="h-20" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-neutral-medium hover:text-primary transition font-medium"
            >
              Inicio
            </Link>
            <a
              href="#features"
              className="text-neutral-medium hover:text-primary transition font-medium cursor-pointer"
            >
              Funciones
            </a>
            <a
              href="#pricing"
              className="text-neutral-medium hover:text-primary transition font-medium cursor-pointer"
            >
              Precios
            </a>
            <Link
              to="/stores"
              className="text-neutral-medium hover:text-primary transition font-medium"
            >
              Tiendas
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-2 text-primary border-2 border-primary rounded-lg hover:bg-primary/10 transition text-sm font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition transform hover:-translate-y-0.5 text-sm font-medium"
            >
              Probar Gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-medium hover:text-primary hover:bg-primary/10 transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-light/10">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-medium hover:text-primary transition font-medium py-2 px-4 rounded-lg hover:bg-primary/5"
              >
                Inicio
              </Link>
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-medium hover:text-primary transition font-medium py-2 px-4 rounded-lg hover:bg-primary/5 cursor-pointer"
              >
                Funciones
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-medium hover:text-primary transition font-medium py-2 px-4 rounded-lg hover:bg-primary/5 cursor-pointer"
              >
                Precios
              </a>
              <Link
                to="/stores"
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-medium hover:text-primary transition font-medium py-2 px-4 rounded-lg hover:bg-primary/5"
              >
                Tiendas
              </Link>
              <div className="pt-3 border-t border-neutral-light/10 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center px-6 py-2 text-primary border-2 border-primary rounded-lg hover:bg-primary/10 transition text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center px-6 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition text-sm font-medium"
                >
                  Probar Gratis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
