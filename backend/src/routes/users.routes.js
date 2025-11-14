// src/routes/users.routes.js
import { Router } from 'express';
import { createUser, listUsers } from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js';
const r = Router();

// r.post('/', requireAuth, requireRole(['admin']), createUser); // <-- Comentada
r.post('/', createUser); // <-- NUEVA LÍNEA (temporalmente sin seguridad)
r.get('/', requireAuth, requireRole(['admin']), listUsers);

export default r;