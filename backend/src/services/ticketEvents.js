// backend/src/services/ticketEvents.js
import { getIO } from './socket.js';

export function emitQueueUpdate(clinic_id) {
  try { getIO().emit('queue:update', { clinic_id }); } catch {}
}
export function emitMetricsUpdate() {
  try { getIO().emit('metrics:update'); } catch {}
}
