import { Server } from 'socket.io';

let io = null;

export function initSocket(server, corsOrigins = '*') {
  if (io) return io; // PROTECCIÓN: no inicializar dos veces
  io = new Server(server, { cors: { origin: corsOrigins } });

  // ajustar límite de listeners para evitar advertencias en desarrollos con reloads
  try {
    // límite por socket (ajusta según necesites)
    io.sockets.setMaxListeners(20);
    // también ajustar el proceso (opcional)
    process.setMaxListeners(50);
  } catch (e) {
    // ignore si no soporta
  }

  return io;
}

export function getIO() {
  if (!io) throw new Error('socket.io not initialized');
  return io;
}
