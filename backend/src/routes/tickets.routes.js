// backend/src/routes/tickets.routes.js
import { Router } from 'express';
import {
  createTicket, triageTicket, getClinicQueue,
  callNext, finishTicket, noShowTicket
} from '../controllers/tickets.controller.js';

const router = Router();

router.post('/', createTicket);                 // recepción crea ticket
router.post('/:id/triage', triageTicket);       // triaje asigna clínica+prioridad
router.get('/clinic/:id/queue', getClinicQueue);// pantalla/doctor: cola clínica
router.post('/clinic/:id/next', callNext);      // doctor llama siguiente
router.post('/:id/finish', finishTicket);       // doctor finaliza
router.post('/:id/no-show', noShowTicket);      // doctor marca ausente

export default router;
