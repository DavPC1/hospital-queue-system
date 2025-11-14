import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import { connectSocket } from '../services/socket';
import { toast } from 'react-toastify';

export default function Doctor() {
  const [clinicId, setClinicId] = useState('');
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, in_service: 0 });
  const socketRef = useRef(null);

  // ---------------------------
  // Conectar socket para actualizaciones
  // ---------------------------
  useEffect(() => {
    if (!socketRef.current) socketRef.current = connectSocket();
    const socket = socketRef.current;

    socket.on('queue:update', (payload) => {
      if (payload?.clinic_id?.toString() === clinicId?.toString()) {
        refreshCurrent();
        loadCounts();
      }
    });

    return () => socket.off('queue:update');
  }, [clinicId]);

  // ---------------------------
  // Llamar al siguiente paciente
  // ---------------------------
  async function callNext() {
    if (!clinicId) return toast.error('Ingrese clinic id');
    setLoading(true);
    try {
      const { data } = await api.post(`/tickets/clinic/${clinicId}/next`);
      setCurrent(data);
      toast.success(`Paciente #${data.id} llamado`);
      loadCounts();
    } catch (e) {
      toast.error('No hay pacientes pendientes');
      setCurrent(null);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // Finalizar consulta
  // ---------------------------
  async function finish() {
    if (!current) return;
    try {
      await api.post(`/tickets/${current.id}/finish`);
      toast.success('Consulta finalizada');
      setCurrent(null);
      loadCounts();
    } catch (e) {
      toast.error('Error finalizando consulta');
    }
  }

  // ---------------------------
  // Marcar paciente como ausente
  // ---------------------------
  async function noShow() {
    if (!current) return;
    try {
      await api.post(`/tickets/${current.id}/no-show`);
      toast.success('Paciente marcado como ausente');
      setCurrent(null);
      loadCounts();
    } catch (e) {
      toast.error('Error marcando como ausente');
    }
  }

  // ---------------------------
  // Refrescar ticket actual (si hay alguno en atención)
  // ---------------------------
  async function refreshCurrent() {
    if (!clinicId) return;
    try {
      const { data } = await api.get(`/tickets/clinic/${clinicId}/queue`);
      const inService = data.find(t => t.status === 'in_service') || null;
      setCurrent(inService);
    } catch (e) {
      console.error('Error refrescando ticket actual', e);
    }
  }

  // ---------------------------
  // Cargar indicadores
  // ---------------------------
  async function loadCounts() {
    if (!clinicId) return;
    try {
      const { data } = await api.get(`/tickets/clinic/${clinicId}/counts`);
      setCounts(data);
    } catch (e) {
      console.error('Error cargando indicadores', e);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Panel de llamadas */}
      <div>
        <Card title="Panel Médico">
          <div className="flex items-center gap-2">
            <input
              placeholder="Clínica id"
              value={clinicId}
              onChange={e => setClinicId(e.target.value)}
              className="border rounded px-3 py-2 w-40"
            />
            <button
              onClick={callNext}
              className="bg-green-600 text-white px-3 py-2 rounded"
            >
              {loading ? 'Buscando...' : 'Llamar siguiente'}
            </button>
          </div>
        </Card>

        <Card title="Paciente en atención" className="mt-4">
          {current ? (
            <div>
              <div className="text-lg font-semibold">{current.patient_name}</div>
              <div className="text-sm text-slate-600">
                #{current.id} • {current.document || '—'}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={finish}
                  className="bg-sky-600 text-white px-3 py-1 rounded"
                >
                  Finalizar
                </button>
                <button
                  onClick={noShow}
                  className="bg-rose-600 text-white px-3 py-1 rounded"
                >
                  Ausente
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">No hay paciente en atención</div>
          )}
        </Card>
      </div>

      {/* Indicadores rápidos */}
      <div>
        <Card title="Indicadores rápidos">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded text-center">
              <div className="text-sm text-slate-500">En espera</div>
              <div className="text-xl font-bold">{counts.pending}</div>
            </div>

            <div className="p-3 bg-gray-50 rounded text-center">
              <div className="text-sm text-slate-500">En atención</div>
              <div className="text-xl font-bold">{counts.in_service}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
