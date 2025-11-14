import { Server } from 'socket.io';

let io = null;

export function initSocket(server, corsOrigins = '*') {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: corsOrigins,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["polling", "websocket"], // 🔥 Render necesita ambos
  });

  io.on("connection", (socket) => {
    console.log("🔌 Cliente conectado:", socket.id);
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('socket.io not initialized');
  }
  return io;
}
