import { useState } from 'react';
import api from '../api/client';

export default function Reception() {
  const [form, setForm] = useState({ name: '', document: '', phone: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const { data } = await api.post('/tickets', { patient: form });
      setMsg({ type: 'ok', text: `Ticket creado #${data.id} para ${form.name}` });
      setForm({ name: '', document: '', phone: '' });
    } catch (err) {
      setMsg({ type: 'err', text: 'Error al crear ticket' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Recepción</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nombre del paciente"
          className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="document"
          value={form.document}
          onChange={handleChange}
          placeholder="Documento"
          className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          className="border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded"
        >
          {loading ? 'Creando...' : 'Crear Ticket'}
        </button>
      </form>

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
