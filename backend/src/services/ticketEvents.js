// backend/src/services/ticketEvents.js
import { getConnection } from './db.js';

export async function logEvent(ticketId, type, meta = null) {
  const pool = await getConnection();
  await pool.request()
    .input('ticketId', ticketId)
    .input('type', type)
    .input('meta', meta ? JSON.stringify(meta) : null)
    .query(`
      INSERT INTO ticket_events(ticket_id, type, meta) 
      VALUES(@ticketId, @type, @meta)
    `);
}
