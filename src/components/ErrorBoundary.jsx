import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-light flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-6xl mb-4">😕</p>
            <h1 className="text-2xl font-bold text-neutral-dark mb-2">
              Algo salió mal
            </h1>
            <p className="text-neutral-medium mb-8">
              Ocurrió un error inesperado. Por favor recargá la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
