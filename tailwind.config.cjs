/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Nueva paleta: Profesional + Gastronómico
        primary: {
          DEFAULT: '#FF6B35', // Naranja cálido - energía, acción
          light: '#FF8555',
          dark: '#E65525',
          gradient: {
            from: '#FF6B35',
            to: '#FFB703',
          },
        },
        secondary: {
          DEFAULT: '#2D6A4F', // Verde oscuro - frescura, confianza
          light: '#3D7A5F',
          dark: '#1D5A3F',
        },
        accent: {
          DEFAULT: '#FFB703', // Dorado - destacados, premium
          light: '#FFC733',
          dark: '#E5A500',
        },
        neutral: {
          light: '#F8F9FA',
          medium: '#6C757D',
          dark: '#1B2021',
        },
        status: {
          success: '#2D6A4F',
          warning: '#FFB703',
          error: '#DC3545',
        },
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
