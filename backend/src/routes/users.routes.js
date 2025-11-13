import { Router } from 'express';
import { createUser, listUsers } from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roles.js'; // crea el middleware que te doy
const r = Router();

r.post('/', requireAuth, requireRole(['admin']), createUser);
r.get('/', requireAuth, requireRole(['admin']), listUsers);

export default r;
