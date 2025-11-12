import { getConnection } from '../services/db.js';

export async function getMetrics(req, res) {
  const pool = await getConnection();

  // Tickets de hoy
  const todayTotals = await pool.request().query(`
    SELECT
      COUNT(*)                          AS tickets_today,
      SUM(CASE WHEN status='pending'   THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status='triaged'   THEN 1 ELSE 0 END) AS triaged,
      SUM(CASE WHEN status='in_service'THEN 1 ELSE 0 END) AS in_service,
      SUM(CASE WHEN status='done'      THEN 1 ELSE 0 END) AS done,
      SUM(CASE WHEN status='no_show'   THEN 1 ELSE 0 END) AS no_show
    FROM tickets
    WHERE CAST(created_at AS date)=CAST(SYSDATETIME() AS date);
  `);

  // Por clínica (cola y atendidos)
  const byClinic = await pool.request().query(`
    SELECT
      c.id, c.name,
      SUM(CASE WHEN t.status IN ('triaged','in_service') THEN 1 ELSE 0 END) AS in_queue,
      SUM(CASE WHEN t.status='in_service' THEN 1 ELSE 0 END) AS being_seen,
      SUM(CASE WHEN t.status='done' AND CAST(t.finished_at AS date)=CAST(SYSDATETIME() AS date) THEN 1 ELSE 0 END) AS done_today
    FROM clinics c
    LEFT JOIN tickets t ON t.clinic_id=c.id
    GROUP BY c.id,c.name
    ORDER BY c.name;
  `);

  res.json({
    totals: todayTotals.recordset[0],
    clinics: byClinic.recordset
  });
}
