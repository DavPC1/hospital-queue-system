// frontend/src/layouts/MainLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getSocket, disconnectSocket } from '../services/socket';

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserFromStorage());

  useEffect(() => {
    const s = getSocket(); // asegurar conexión si la hay
    return () => {
      // opcional: desconectar al desmontar layout
      // if (s) s.disconnect();
    };
  }, []);

  function logout() {
    const s = getSocket();
    if (s) s.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-lg font-semibold text-slate-800">HospitalQueue</Link>
            <nav className="hidden lg:flex gap-3 text-sm">
              <Link to="/reception" className="px-3 py-2 rounded hover:bg-slate-100">Recepción</Link>
              <Link to="/triage" className="px-3 py-2 rounded hover:bg-slate-100">Triaje</Link>
              <Link to="/doctor" className="px-3 py-2 rounded hover:bg-slate-100">Médico</Link>
              <Link to="/display" className="px-3 py-2 rounded hover:bg-slate-100">Pantalla</Link>
              <Link to="/users" className="px-3 py-2 rounded hover:bg-slate-100">Usuarios</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm text-slate-600">Hola, <strong className="text-slate-800">{user.username}</strong></div>
                <button
                  onClick={logout}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-sm px-3 py-1 rounded"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="text-sm text-slate-600">Iniciar sesión</Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
