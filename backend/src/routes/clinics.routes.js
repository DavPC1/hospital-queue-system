// backend/src/routes/clinics.routes.js
import { Router } from 'express';
import { list, create } from '../controllers/clinics.controller.js';

const router = Router();

router.get('/', list);
router.post('/', create);

export default router;
