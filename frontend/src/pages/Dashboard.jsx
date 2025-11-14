// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import api from '../api/client';
import { connectSocket } from '../services/socket';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalWaiting: 0,
    inService: 0,
    totalToday: 0
  });
  const [loading, setLoading] = useState(true);
  const socket = connectSocket();
  const navigate = useNavigate();

  async function loadMetrics() {
    setLoading(true);
    try {
      const { data } = await api.get('/metrics');
      // espera { totalWaiting, inService, totalTickets } o ajusta
      setMetrics({
        totalWaiting: data.totalWaiting ?? data.waiting ?? 0,
        inService: data.inService ?? data.in_service ?? 0,
        totalToday: data.totalTickets ?? data.total_today ?? 0,
      });
    } catch (e) {
      console.error('Error cargando métricas', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
    socket.on('metrics:update', loadMetrics);
    return () => socket.off('metrics:update', loadMetrics);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/reception')} className="bg-white border px-3 py-2 rounded shadow-sm">Recepción</button>
          <button onClick={() => navigate('/triage')} className="bg-white border px-3 py-2 rounded shadow-sm">Triaje</button>
          <button onClick={() => navigate('/doctor')} className="bg-white border px-3 py-2 rounded shadow-sm">Médico</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-sm text-slate-500">En espera</div>
          <div className="text-4xl font-bold">{loading ? <Spinner/> : metrics.totalWaiting}</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">En atención</div>
          <div className="text-4xl font-bold">{loading ? <Spinner/> : metrics.inService}</div>
        </Card>

        <Card>
          <div className="text-sm text-slate-500">Total hoy</div>
          <div className="text-4xl font-bold">{loading ? <Spinner/> : metrics.totalToday}</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Acciones rápidas">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/reception')} className="bg-sky-600 text-white px-4 py-2 rounded">Abrir Recepción</button>
            <button onClick={() => navigate('/triage')} className="bg-amber-500 text-white px-4 py-2 rounded">Abrir Triaje</button>
            <button onClick={() => navigate('/doctor')} className="bg-green-600 text-white px-4 py-2 rounded">Abrir Médico</button>
          </div>
        </Card>

        <Card title="Atajos">
          <div className="text-sm text-slate-600">Usa estos atajos para navegar rápido entre módulos. La pantalla pública se actualiza automáticamente.</div>
        </Card>
      </div>
    </div>
  );
}
