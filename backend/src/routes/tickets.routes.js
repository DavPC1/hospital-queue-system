// backend/src/routes/tickets.routes.js
import { Router } from 'express';
import {
  create,
  triage,
  nextInClinic,
  finish,
  noShow,
  queueByClinic
} from '../controllers/tickets.controller.js';

const router = Router();

router.post('/', create);
router.post('/:id/triage', triage);
router.post('/:id/finish', finish);
router.post('/:id/no-show', noShow);
router.post('/clinic/:id/next', nextInClinic);
router.get('/clinic/:id/queue', queueByClinic);

export default router;
