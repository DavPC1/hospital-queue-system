import { useEffect, useState, useRef } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import { connectSocket } from '../services/socket';
import { toast } from 'react-toastify';

export default function Triage(){
  const [clinicId, setClinicId] = useState('');
  const [queue, setQueue] = useState([]);
  const socketRef = useRef(null);

  async function loadQueue(){
    if (!clinicId) return;
    try {
      const { data } = await api.get(`/tickets/clinic/${clinicId}/queue`);
      setQueue(data);
    } catch(e){ console.error(e); }
  }

  useEffect(() => {
    if (!socketRef.current) socketRef.current = connectSocket();
    const socket = socketRef.current;

    socket.on('queue:update', (payload)=> {
      if (payload?.clinic_id?.toString() === clinicId.toString()) {
        loadQueue();
      }
    });

    return () => socket.off('queue:update');
  }, [clinicId]);

  async function assign(trkId, priority = 5){
    try {
      await api.post(`/tickets/${trkId}/triage`, {
        clinic_id: clinicId,
        priority
      });
      toast.success('Paciente asignado al triaje');
      loadQueue();
    } catch (e){
      console.error(e);
      toast.error('Error en asignación');
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Triaje">
        <div className="flex items-center gap-2">
          <input
            placeholder="Clínica id"
            value={clinicId}
            onChange={e => setClinicId(e.target.value)}
            className="border rounded px-3 py-2 w-40"
          />
          <button onClick={loadQueue} className="bg-sky-600 text-white px-3 py-2 rounded">
            Cargar
          </button>
        </div>
      </Card>

      <Card title="Cola (Triaged / Pending)">
        {queue.length === 0 ? (
          <div className="text-slate-500">No hay pacientes</div>
        ) : (
          <ul className="space-y-2">
            {queue.map(q => (
              <li key={q.id} className="p-2 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{q.patient_name}</div>
                  <div className="text-xs text-slate-500">#{q.id} • {q.document}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => assign(q.id, 1)} className="px-3 py-1 bg-green-600 text-white rounded">
                    Alta
                  </button>
                  <button onClick={() => assign(q.id, 5)} className="px-3 py-1 bg-amber-500 text-white rounded">
                    Normal
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
