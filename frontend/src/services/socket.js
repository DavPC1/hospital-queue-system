// frontend/src/services/socket.js
import { io as clientIO } from 'socket.io-client';

let socket = null;

export function connectSocket() {
  if (socket) return socket;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const origin = apiUrl.replace(/\/api\/?$/, '') || 'http://localhost:4000';
  socket = clientIO(origin, { transports: ['websocket'] });

  socket.on('connect', () => {
    // opcional: console.log('socket connected', socket.id);
  });

  socket.on('disconnect', () => {
    // opcional: console.log('socket disconnected');
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
