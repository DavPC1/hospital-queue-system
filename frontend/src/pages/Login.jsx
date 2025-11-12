import { useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin123*');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setErr('');
    setLoading(true);
    try{
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      nav('/dashboard', { replace: true });
    }catch(e){
      const msg = e?.response?.data?.error || 'Credenciales inválidas';
      setErr(msg);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Ingresar</h1>
        <input className="border rounded p-2 w-full" placeholder="Usuario"
               value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="border rounded p-2 w-full" placeholder="Password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>
    </div>
  );
}
