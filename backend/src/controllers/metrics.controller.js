// backend/src/controllers/metrics.controller.js
import { getConnection } from '../services/db.js';

// Export name: getMetrics
export async function getMetrics(req, res) {
  try {
    const pool = await getConnection();
    const q = await pool.request().query(`
      SELECT
        SUM(CASE WHEN status IN ('pending','triaged') THEN 1 ELSE 0 END) AS totalWaiting,
        SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END) AS inService,
        SUM(CASE WHEN CONVERT(date, created_at) = CONVERT(date, SYSDATETIME()) THEN 1 ELSE 0 END) AS totalTickets
      FROM tickets;
    `);
    const row = q.recordset[0] || { totalWaiting: 0, inService: 0, totalTickets: 0 };
    // Normalizar nombres a lo que espera el frontend
    res.json({
      totalWaiting: Number(row.totalWaiting) || 0,
      inService: Number(row.inService) || 0,
      totalTickets: Number(row.totalTickets) || 0
    });
  } catch (err) {
    console.error('metrics.getMetrics error:', err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
}
