import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Display() {
  const [clinics, setClinics] = useState([]);
  const [clinicId, setClinicId] = useState('');
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    api.get('/clinics').then(({ data }) => {
      setClinics(data);
      if (data.length) setClinicId(String(data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!clinicId) return;
    const load = async () => {
      const { data } = await api.get(`/tickets/clinic/${clinicId}/queue`);
      setQueue(data);
    };
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [clinicId]);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Pantalla de Turnos</h2>
        <select
          value={clinicId}
          onChange={e => setClinicId(e.target.value)}
          className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {clinics.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {queue.length === 0 ? (
        <p className="text-gray-500">No hay pacientes en cola.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {queue.map(q => (
            <div key={q.id} className="border rounded-lg p-4 bg-gray-50">
              <p className="text-4xl font-black text-gray-800">#{q.id}</p>
              <p className="text-lg">{q.patient_name}</p>
              <p className="text-sm text-gray-600">
                Prioridad: {q.priority === 1 ? 'Alta' : q.priority === 2 ? 'Media' : 'Baja'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Estado: {q.status === 'in_service' ? 'En consulta' : 'En cola'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
