// backend/src/routes/clinics.routes.js
import { Router } from 'express';
import { listClinics, createClinic } from '../controllers/clinics.controller.js';

const router = Router();

router.get('/', listClinics);   // GET /api/clinics
router.post('/', createClinic); // POST /api/clinics

export default router;
