// src/components/auth/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { userRole, loading } = useAuth();

  if (loading) {
    // Muestra un loader o un componente vacío mientras se verifica el rol
    return <div>Verificando acceso...</div>;
  }

  // Comprueba si el rol del usuario está en la lista de roles permitidos
  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    // Si no está permitido:
    // Si es un 'invitado', lo mandamos al login.
    // Si ya está logueado pero no tiene el rol correcto, a su página de perfil o al home.
    if (userRole === 'invitado') {
      return <Navigate to="/login" replace />;
    } else {
      // Redirige a una página de "no autorizado" o al perfil del socio
      return <Navigate to="/perfil" replace />;
    }
  }

  // Si el rol es permitido, renderiza el contenido de la ruta anidada
  return <Outlet />;
};

export default ProtectedRoute;
