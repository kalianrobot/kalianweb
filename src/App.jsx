import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Componentes Públicos
import HomePublica from './components/public/HomePublica';
import Navbar from './components/public/Navbar';
import LoginSocio from './components/auth/LoginSocio';
import PerfilSocio from './components/socio/PerfilSocio';

// Componentes Admin
import AdminDashboard from './components/admin/AdminDashboard';
import AdminEventos from './components/admin/AdminEventos';
import AdminCursos from './components/admin/AdminCursos';
import AdminSocios from './components/admin/AdminSocios';
import AdminReservas from './components/admin/AdminReservas';
import AdminLogin from './pages/admin/AdminLogin';

function App() {
  const { role, logoutAdmin } = useAuth();

  return (
    <Router>
      <Navbar />

      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<HomePublica />} />
        <Route path="/login" element={<LoginSocio />} />

        {/* RUTA DE LOGIN DE ADMIN */}
        {/* Si un no-admin intenta acceder a /admin, será redirigido aquí */}
        <Route path="/login-admin" element={role !== 'admin' ? <AdminLogin /> : <Navigate to="/admin" />} />

        {/* RUTA DE PERFIL DE SOCIO (Ejemplo de protección simple) */}
        {/* Más adelante esto será un <ProtectedRoute> */}
        <Route path="/perfil" element={role === 'socio' ? <PerfilSocio /> : <Navigate to="/login" />} />

        {/* RUTAS ADMIN (Protegidas por rol del contexto) */}
        <Route path="/admin" element={
          role === 'admin' ? (
            <AdminDashboard logout={logoutAdmin} />
          ) : (
            <Navigate to="/login-admin" />
          )
        } />

        <Route path="/admin/eventos" element={role === 'admin' ? <AdminEventos /> : <Navigate to="/login-admin" />} />
        <Route path="/admin/cursos" element={role === 'admin' ? <AdminCursos /> : <Navigate to="/login-admin" />} />
        <Route path="/admin/socios" element={role === 'admin' ? <AdminSocios /> : <Navigate to="/login-admin" />} />
        <Route path="/admin/reservas" element={role === 'admin' ? <AdminReservas /> : <Navigate to="/login-admin" />} />

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;