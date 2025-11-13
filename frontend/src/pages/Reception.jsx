import { useState, useEffect } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { connectSocket } from '../services/socket';

export default function Reception(){
  const [name,setName]=useState('');
  const [doc,setDoc]=useState('');
  const [phone,setPhone]=useState('');
  const [recent,setRecent]=useState([]);
  const [loading,setLoading]=useState(false);
  const socket = connectSocket();

  async function loadRecent(){
    setLoading(true);
    try {
      const { data } = await api.get('/tickets?limit=8');
      setRecent(data);
    } catch(e){
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(()=>{
    loadRecent();
    socket.on('queue:update', loadRecent);
    return ()=> socket.off('queue:update', loadRecent);
  },[]);

  async function submit(e){
    e.preventDefault();
    try {
      const body = { patient: { name, document: doc, phone } };
      const res = await api.post('/tickets', body);
      toast.success(`Ticket #${res.data.id} creado`);
      setName(''); setDoc(''); setPhone('');
      loadRecent();
    } catch(err){
      toast.error(err?.response?.data?.error || 'Error creando ticket');
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <Card title="Recepción - Crear ticket">
          <form onSubmit={submit} className="space-y-3">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" className="w-full border rounded px-3 py-2" required />
            <input value={doc} onChange={e=>setDoc(e.target.value)} placeholder="Documento" className="w-full border rounded px-3 py-2" />
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Teléfono" className="w-full border rounded px-3 py-2" />
            <button className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">Crear ticket</button>
          </form>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card title="Últimos tickets">
          {loading ? <div className="flex items-center gap-2"><Spinner/>Cargando...</div> : (
            <ul className="space-y-2">
              {recent.length === 0 && <div className="text-sm text-slate-500">Sin tickets recientes</div>}
              {recent.map(t => (
                <li key={t.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{t.patient_name}</div>
                    <div className="text-xs text-slate-500">#{t.id} — {t.document || '—'}</div>
                  </div>
                  <div className="text-sm text-slate-700">{t.status}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
