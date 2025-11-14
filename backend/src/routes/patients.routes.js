// backend/src/routes/patients.routes.js
import { Router } from 'express';
import { list, create } from '../controllers/patients.controller.js';

const router = Router();

router.get('/', list);
router.post('/', create);

export default router;
