// backend/src/app.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';

import clinicsRouter from './routes/clinics.routes.js';
import patientsRouter from './routes/patients.routes.js';
import ticketsRouter from './routes/tickets.routes.js';
import metricsRouter from './routes/metrics.routes.js';
import authRouter from './routes/auth.routes.js';

import { requireAuth } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errors.js';

import { initSocket } from './services/socket.js';
import { getConnection } from './services/db.js';

import usersRouter from './routes/users.routes.js';

const app = express();

// ======================================================
// 👇 LÓGICA DE ORÍGENES CORREGIDA 👇
// ======================================================
const allowedOrigins = [
  'http://localhost:5173',   // Frontend dev
  'http://localhost:4000'    // Para pruebas locales
];

// Si definimos un origen en producción (Render), lo agregamos a la lista
if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ORIGIN);
}
// ======================================================
// 👆 FIN DE LA CORRECCIÓN 👆
// ======================================================


/* ===== Middlewares base ===== */
app.use(cors({
  origin: allowedOrigins, // <-- Usa la lista dinámica
  credentials: true
}));

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

/* ===== Rate limit solo para login ===== */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth/login', authLimiter);

/* ===== Docs y health ===== */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/health', (_, res) => res.json({ status: 'ok', message: 'Servidor activo' }));

/* ===== Rutas públicas ===== */
app.use('/api/auth', authRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/metrics', metricsRouter);

/* ===== Rutas protegidas ===== */
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/patients', requireAuth, patientsRouter);
app.use('/api/tickets', requireAuth, ticketsRouter);

/* ===== Manejo de errores ===== */
app.use(errorHandler);

/* ===== HTTP + Socket.IO ===== */
const server = http.createServer(app);

// 🔥 CONFIGURACIÓN CORRECTA DE SOCKET.IO
initSocket(server, allowedOrigins); // <-- Usa la misma lista dinámica

/* ===== Inicio ===== */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

/* ===== Test de conexión DB ===== */
getConnection().catch((e) => {
  console.error('⚠️  DB no conectó al inicio:', e.message);
});