import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';

const router = Router();
router.post('/login',
  body('username').isString().trim().notEmpty(),
  body('password').isString().isLength({ min: 6 }),
  validate,
  login
);
export default router;
