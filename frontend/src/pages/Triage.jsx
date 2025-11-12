import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Triage() {
  const [clinics, setClinics] = useState([]);
  const [ticketId, setTicketId] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [priority, setPriority] = useState('2');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/clinics').then(({ data }) => {
      setClinics(data);
      if (data.length) setClinicId(String(data[0].id));
    });
  }, []);

  async function assign() {
    if (!ticketId || !clinicId) {
      setMsg({ type: 'err', text: 'Ticket y clínica son requeridos' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await api.post(`/tickets/${ticketId}/triage`, {
        clinic_id: Number(clinicId),
        priority: Number(priority),
      });
      setMsg({ type: 'ok', text: `Ticket #${ticketId} asignado` });
      setTicketId('');
    } catch (e) {
      setMsg({ type: 'err', text: 'No se pudo asignar. Verifica el ID.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Triaje</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={ticketId}
          onChange={e => setTicketId(e.target.value.replace(/\D/g, ''))}
          placeholder="ID de ticket"
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={clinicId}
          onChange={e => setClinicId(e.target.value)}
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {clinics.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="1">Prioridad alta</option>
          <option value="2">Prioridad media</option>
          <option value="3">Prioridad baja</option>
        </select>
      </div>

      <button
        onClick={assign}
        disabled={loading}
        className="mt-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-4 py-2 rounded"
      >
        {loading ? 'Asignando...' : 'Asignar a clínica'}
      </button>

      {msg && (
        <p
          className={`mt-4 text-sm ${
            msg.type === 'ok' ? 'text-green-700' : 'text-red-600'
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
