// frontend/src/services/socket.js
import { io as clientIO } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (socket) return socket;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const origin = apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:4000';

  socket = clientIO(origin, {
    transports: ['websocket', 'polling'],  // 🔥 Render necesita esto
    reconnection: true,
    reconnectionDelay: 500,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
