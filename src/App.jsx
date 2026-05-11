import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import InstallAppBanner from './components/InstallAppBanner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load de páginas para reducir bundle inicial
const HomePage = lazy(() => import('./pages/HomePage'));
const StoresPage = lazy(() => import('./pages/StoresPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const PaymentPendingPage = lazy(() => import('./pages/PaymentPendingPage'));
const PaymentFailurePage = lazy(() => import('./pages/PaymentFailurePage'));
const PostPaymentPage = lazy(() => import('./pages/PostPaymentPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const BusinessPage = lazy(() => import('./pages/BusinessPage'));
const SubscribePage = lazy(() => import('./pages/SubscribePage'));
const CancelReservationPage = lazy(() => import('./pages/CancelReservationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DepositSuccessPage = lazy(() => import('./pages/DepositSuccessPage'));
const DepositFailurePage = lazy(() => import('./pages/DepositFailurePage'));
const SuperAdminPage = lazy(() => import('./pages/SuperAdminPage'));


// Páginas del footer
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const SuccessStoriesPage = lazy(() => import('./pages/SuccessStoriesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-medium">Cargando...</p>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();

  // Páginas que NO deben mostrar el navbar global
  const hideNavbarRoutes = ['/login', '/signup', '/register', '/payment', '/subscribe', '/admin', '/negocio', '/cancelar-reserva', '/forgot-password', '/reset-password', '/superadmin'];
  const shouldHideNavbar = hideNavbarRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      {!shouldHideNavbar && <Navbar />}
      <InstallAppBanner />
      <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/pending" element={<PaymentPendingPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/payment/done" element={<PostPaymentPage />} />
          <Route path="/admin/:slug" element={<AdminPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/negocio/:slug" element={<BusinessPage />} />
          <Route path="/cancelar-reserva/:token" element={<CancelReservationPage />} />
          <Route path="/reserva/seña-exitosa" element={<DepositSuccessPage />} />
          <Route path="/reserva/seña-fallida" element={<DepositFailurePage />} />
          <Route path="/reserva/seña-pendiente" element={<DepositSuccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/superadmin" element={<SuperAdminPage />} />

          {/* Páginas del footer */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help-center" element={<HelpCenterPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
