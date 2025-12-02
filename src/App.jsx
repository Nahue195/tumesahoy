import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import BusinessPage from "./pages/BusinessPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* Página pública del negocio */}
        <Route path="/:slug" element={<BusinessPage />} />
        {/* Panel admin del negocio */}
        <Route path="/admin/:slug" element={<AdminPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}

export default App;
