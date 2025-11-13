import { useState, useEffect } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import { connectSocket } from '../services/socket';
import { toast } from 'react-toastify';

export default function Doctor(){
  const [clinicId,setClinicId]=useState('');
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = connectSocket();

  useEffect(()=>{
    socket.on('queue:update', (payload)=> {
      if (payload?.clinic_id?.toString() === clinicId?.toString()) refreshCurrent();
    });
    return ()=> socket.off('queue:update');
  }, [clinicId]);

  async function callNext(){
    if (!clinicId) return toast.error('Ingrese clinic id');
    setLoading(true);
    try {
      const { data } = await api.post(`/tickets/clinic/${clinicId}/next`);
      setCurrent(data);
      toast.success('Paciente llamado');
    } catch(e){
      toast.error('No hay pacientes');
      setCurrent(null);
    } finally { setLoading(false); }
  }

  async function finish(){
    if (!current) return;
    await api.post(`/tickets/${current.id}/finish`);
    toast.success('Consulta finalizada');
    setCurrent(null);
  }

  async function noShow(){
    if (!current) return;
    await api.post(`/tickets/${current.id}/no-show`);
    toast.success('Marcado como ausente');
    setCurrent(null);
  }

  async function refreshCurrent(){
    // opcional: recargar estado del ticket en curso
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card title="Panel Médico">
          <div className="flex items-center gap-2">
            <input placeholder="Clínica id" value={clinicId} onChange={e=>setClinicId(e.target.value)} className="border rounded px-3 py-2 w-40" />
            <button onClick={callNext} className="bg-green-600 text-white px-3 py-2 rounded">{loading ? 'Buscando...' : 'Llamar siguiente'}</button>
          </div>
        </Card>

        <Card title="Paciente en atención" className="mt-4">
          {current ? (
            <div>
              <div className="text-lg font-semibold">{current.patient_name}</div>
              <div className="text-sm text-slate-600">#{current.id} • {current.document}</div>
              <div className="mt-3 flex gap-2">
                <button onClick={finish} className="bg-sky-600 text-white px-3 py-1 rounded">Finalizar</button>
                <button onClick={noShow} className="bg-rose-600 text-white px-3 py-1 rounded">Ausente</button>
              </div>
            </div>
          ) : <div className="text-slate-500">No hay paciente en atención</div>}
        </Card>
      </div>

      <div>
        <Card title="Indicadores rápidos">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-slate-500">En espera</div>
              <div className="text-xl font-bold">—</div>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-sm text-slate-500">En atención</div>
              <div className="text-xl font-bold">—</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
