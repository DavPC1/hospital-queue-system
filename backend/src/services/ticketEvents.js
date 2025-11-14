// backend/src/services/ticketEvents.js
import { getIO } from "./socket.js";

export function emitQueueUpdate(clinicId) {
  console.log("📢 Emitting queue:update", clinicId);
  getIO().emit("queue:update", clinicId);
}

export function emitMetricsUpdate() {
  console.log("📢 Emitting metrics:update");
  getIO().emit("metrics:update");
}
