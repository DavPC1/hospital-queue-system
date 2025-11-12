import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Doctor() {
  const [clinics, setClinics] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [current, setCurrent] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/clinics').then(({ data }) => {
      setClinics(data);
      if (data.length) setClinicId(String(data[0].id));
    });
  }, []);

  async function callNext() {
    setMsg(null);
    const { data } = await api.post(`/tickets/clinic/${clinicId}/next`).catch(() => ({ data: null }));
    if (!data || !data.id) {
      setCurrent(null);
      setMsg({ type: 'warn', text: 'No hay pacientes en cola' });
      return;
    }
    setCurrent(data);
  }

  async function finishTicket() {
    if (!current) return;
    await api.post(`/tickets/${current.id}/finish`);
    setCurrent(null);
    setMsg({ type: 'ok', text: 'Consulta finalizada' });
  }

  async function noShow() {
    if (!current) return;
    await api.post(`/tickets/${current.id}/no-show`);
    setCurrent(null);
    setMsg({ type: 'warn', text: 'Marcado como ausente' });
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Panel Médico</h2>

      <div className="flex items-center gap-3 mb-4">
        <span>Clínica:</span>
        <select
          value={clinicId}
          onChange={e => setClinicId(e.target.value)}
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {clinics.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!current ? (
        <button
          onClick={callNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Llamar siguiente
        </button>
      ) : (
        <div className="border rounded p-4">
          <p className="text-lg">
            Atendiendo Ticket <span className="font-semibold">#{current.id}</span>
          </p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={finishTicket}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
            >
              Finalizar
            </button>
            <button
              onClick={noShow}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded"
            >
              Ausente
            </button>
          </div>
        </div>
      )}

      {msg && (
        <p
          className={`mt-4 text-sm ${
            msg.type === 'ok'
              ? 'text-green-700'
              : msg.type === 'warn'
              ? 'text-yellow-700'
              : 'text-red-600'
          }`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
