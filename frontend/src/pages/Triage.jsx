// src/pages/Triage.jsx
import { useEffect, useState, useRef } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import { connectSocket } from '../services/socket';
import { toast } from 'react-toastify';

export default function Triage(){
  const [clinicId, setClinicId] = useState('');
  const [queue, setQueue] = useState([]);
  const socketRef = useRef(null);

  // --- NUEVOS ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reassignForm, setReassignForm] = useState({ newClinicId: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ---

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

    // Escucha el evento si *esta* clínica se actualiza
    socket.on('queue:update', (payload)=> {
      // payload es solo un clinicId
      if (payload?.toString() === clinicId.toString()) {
        loadQueue();
      }
    });

    return () => socket.off('queue:update');
  }, [clinicId]); // Depende solo de clinicId

  // --- ASIGNAR (Función existente) ---
  async function assign(trkId, priority = 5){
    try {
      await api.post(`/tickets/${trkId}/triage`, {
        clinic_id: clinicId,
        priority
      });
      toast.success('Paciente asignado al triaje');
      loadQueue(); // Refresca la cola
    } catch (e){
      console.error(e);
      toast.error('Error en asignación');
    }
  }

  // --- NUEVAS FUNCIONES PARA EL MODAL ---
  function openReassignModal(ticket) {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }

  function closeReassignModal() {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setReassignForm({ newClinicId: '', reason: '' });
  }

  async function handleReassignSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!reassignForm.newClinicId || !reassignForm.reason) {
      toast.error('La nueva clínica y el motivo son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/reassign`, {
        new_clinic_id: reassignForm.newClinicId,
        reason: reassignForm.reason
      });
      toast.success(`Ticket #${selectedTicket.id} reasignado`);
      closeReassignModal();
      loadQueue(); // Recarga la cola actual
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Error al reasignar');
    } finally {
      setIsSubmitting(false);
    }
  }
  // ---

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
                {/* --- BOTONES DE ACCIÓN --- */}
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => assign(q.id, 1)} className="px-3 py-1 bg-green-600 text-white rounded">
                    Alta
                  </button>
                  <button onClick={() => assign(q.id, 5)} className="px-3 py-1 bg-amber-500 text-white rounded">
                    Normal
                  </button>
                  {/* --- NUEVO BOTÓN DE REASIGNAR --- */}
                  <button onClick={() => openReassignModal(q)} className="px-3 py-1 bg-blue-600 text-white rounded">
                    Reasignar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* --- NUEVO MODAL DE REASIGNACIÓN --- */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Reasignar Ticket #{selectedTicket.id}
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Paciente: {selectedTicket.patient_name}
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">ID Nueva Clínica</label>
                <input
                  type="number"
                  value={reassignForm.newClinicId}
                  onChange={e => setReassignForm({...reassignForm, newClinicId: e.target.value})}
                  className="w-full border px-3 py-2 rounded mt-1"
                  placeholder="Ej: 2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Motivo (Obligatorio)</label>
                <textarea
                  value={reassignForm.reason}
                  onChange={e => setReassignForm({...reassignForm, reason: e.target.value})}
                  className="w-full border px-3 py-2 rounded mt-1"
                  rows="3"
                  placeholder="Ej: Área saturada, requiere especialidad..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeReassignModal}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-blue-600 text-white px-4 py-2 rounded ${isSubmitting ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar Reasignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}