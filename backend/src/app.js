// backend/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import clinicsRouter from './routes/clinics.routes.js';
import patientsRouter from './routes/patients.routes.js';
import ticketsRouter from './routes/tickets.routes.js';
import metricsRouter from './routes/metrics.routes.js';
import helmet from 'helmet';
import compression from 'compression';
import authRouter from './routes/auth.routes.js';
import { requireAuth } from './middlewares/auth.js';


dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());
app.use('/api/auth', authRouter);
app.use('/api/clinics', clinicsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/metrics', metricsRouter);
app.get('/api/health', (_, res) => res.json({ status: 'ok', message: 'Servidor activo' }));

// protege lo que quieras
app.use('/api/patients', requireAuth, patientsRouter);
app.use('/api/tickets', requireAuth, ticketsRouter);
// públicos o semipúblicos:
app.use('/api/clinics', clinicsRouter);
app.use('/api/metrics', metricsRouter);

// endpoint de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor activo' });
});

// puerto configurado en .env o 4000 por defecto
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Servidor API funcionando en http://localhost:${port}`);
});

import { getConnection } from './services/db.js';

getConnection(); // probar al iniciar
