import { Router } from 'express';
import {
  create,
  triage,
  nextInClinic,
  finish,
  noShow,
  queueByClinic,
  list,
  recent,
  getCountsByClinic,
  reassignClinic // NUEVA FUNCIÓN
} from '../controllers/tickets.controller.js';

const router = Router();

// === CONSULTAS ===

// listado general de tickets
router.get('/', list);  

// últimos tickets (para recepción)
router.get('/recent', recent);

// cola por clínica
router.get('/clinic/:id/queue', queueByClinic);
router.get('/clinic/:id/counts', getCountsByClinic);

// === ACCIONES ===
router.post('/', create);
router.post('/:id/triage', triage);
router.post('/:id/finish', finish);
router.post('/:id/no-show', noShow);
router.post('/clinic/:id/next', nextInClinic);
router.post('/:id/reassign', reassignClinic); //NUEVA RUTA

export default router;
