import { useEffect, useState } from 'react';
import api from '../api/client';
import Card from '../components/Card';
import { toast } from 'react-toastify';

export default function Users(){
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username:'', password:'', role:'admin' });

  async function load(){
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch(e){ console.error(e); }
  }

  useEffect(()=>{ load(); },[]);

  async function create(e){
    e.preventDefault();
    try {
      await api.post('/users', form);
      toast.success('Usuario creado');
      setForm({ username:'', password:'', role:'admin' });
      load();
    } catch(err){ toast.error('Error creando usuario'); }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <Card title="Crear usuario">
          <form className="space-y-3" onSubmit={create}>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Usuario" className="w-full border px-3 py-2 rounded" />
            <input value={form.password} type="password" onChange={e=>setForm({...form,password:e.target.value})} placeholder="Contraseña" className="w-full border px-3 py-2 rounded" />
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full border px-3 py-2 rounded">
              <option value="admin">Administrador</option>
              <option value="reception">Recepción</option>
              <option value="nurse">Enfermería</option>
            </select>
            <button className="bg-sky-600 text-white px-4 py-2 rounded">Crear</button>
          </form>
        </Card>
      </div>

      <div>
        <Card title="Usuarios">
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u.id} className="flex justify-between p-2 border rounded">
                <div><div className="font-medium">{u.username}</div><div className="text-xs text-slate-500">{u.role}</div></div>
                <div className="text-xs text-slate-500">{new Date(u.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
