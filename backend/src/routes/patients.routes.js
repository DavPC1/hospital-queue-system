// backend/src/routes/patients.routes.js
import { Router } from 'express';
import { listPatients, createPatient } from '../controllers/patients.controller.js';

const router = Router();

router.get('/', listPatients);   // GET /api/patients
router.post('/', createPatient); // POST /api/patients

export default router;
