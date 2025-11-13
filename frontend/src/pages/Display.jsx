import { useState, useEffect } from 'react';
import api from '../api/client';
import { connectSocket } from '../services/socket';

export default function Display(){
  const [clinicId,setClinicId]=useState('');
  const [current,setCurrent]=useState(null);
  const [nexts,setNexts]=useState([]);
  const socket = connectSocket();

  async function load(){
    if (!clinicId) return;
    try {
      const { data } = await api.get(`/tickets/clinic/${clinicId}/queue`);
      setNexts(data.slice(0,5));
      setCurrent(data.find(t=>t.status==='in_service') || null);
    } catch(e){ console.error(e); }
  }

  useEffect(()=>{
    socket.on('queue:update', (payload)=> {
      if (payload?.clinic_id?.toString() === clinicId?.toString()) load();
    });
    return ()=> socket.off('queue:update');
  }, [clinicId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm">Clínica id:</label>
        <input value={clinicId} onChange={e=>setClinicId(e.target.value)} className="border px-3 py-2 rounded w-28" />
        <button onClick={load} className="bg-sky-600 text-white px-3 py-2 rounded">Cargar</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-sky-50 p-6 rounded text-center">
          <div className="text-sm text-slate-600">En atención</div>
          <div className="text-6xl font-bold mt-4">{current ? `#${current.id}` : '-'}</div>
          <div className="text-xl mt-2">{current?.patient_name || ''}</div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-slate-600 mb-3">Próximos</div>
          <ul className="space-y-2">
            {nexts.length === 0 && <div className="text-slate-500">Sin próximos</div>}
            {nexts.map(t => (
              <li key={t.id} className="flex justify-between">
                <span className="font-medium">#{t.id} {t.patient_name}</span>
                <span className="text-sm text-slate-500">{t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
