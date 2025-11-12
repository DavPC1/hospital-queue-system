import { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [data, setData] = useState({ totals: {}, clinics: [] });
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const { data } = await api.get("/metrics");
      setData(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const t = data.totals || {};
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <StatCard title="Tickets hoy" value={t.tickets_today ?? 0} color="indigo" />
        <StatCard title="Pendientes" value={t.pending ?? 0} color="gray" />
        <StatCard title="Triaje" value={t.triaged ?? 0} color="yellow" />
        <StatCard title="En consulta" value={t.in_service ?? 0} color="blue" />
        <StatCard title="Atendidos" value={t.done ?? 0} color="green" />
        <StatCard title="Ausentes" value={t.no_show ?? 0} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow border">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold">Estado por clínica</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">Clínica</th>
                <th className="px-4 py-2">En cola</th>
                <th className="px-4 py-2">En consulta</th>
                <th className="px-4 py-2">Atendidos hoy</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-4 py-3" colSpan={4}>Cargando...</td></tr>
              ) : data.clinics.length === 0 ? (
                <tr><td className="px-4 py-3" colSpan={4}>Sin clínicas</td></tr>
              ) : (
                data.clinics.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.in_queue}</td>
                    <td className="px-4 py-3">{c.being_seen}</td>
                    <td className="px-4 py-3">{c.done_today}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
