import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { connectSocket } from '../services/socket';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode'; // ✅ Importación correcta

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        username: form.username,
        password: form.password,
      });

      const token = res.data.token || res.data.accessToken || res.data?.data?.token;
      const userFromBody = res.data.user || res.data.userInfo || res.data?.data?.user;

      if (!token) {
        toast.error('Respuesta inválida del servidor: no se recibió token');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);

      if (userFromBody) {
        localStorage.setItem('user', JSON.stringify(userFromBody));
      } else {
        try {
          const decoded = jwtDecode(token); // ✅ Uso correcto
          const user = {
            username: decoded.username || decoded.sub || decoded.name || form.username,
            role: decoded.role || decoded.roles || decoded?.role?.[0] || 'reception',
            ...decoded,
          };
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
          localStorage.setItem('user', JSON.stringify({ username: form.username }));
        }
      }

      try { connectSocket(); } catch (e) {}

      toast.success('Inicio de sesión correcto');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Credenciales inválidas';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Usuario</label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="submit"
              className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Entrar'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm({ username: 'admin', password: 'Admin123*' });
                toast.info('Autocompletar demo (admin)');
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              Autocompletar (demo)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}