// frontend/src/layouts/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

function getToken() {
  return localStorage.getItem('token');
}

/**
 * Envuelve rutas que requieren autenticación.
 * - Si hay token -> renderiza children
 * - Si no -> redirige a /login
 */
export default function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
