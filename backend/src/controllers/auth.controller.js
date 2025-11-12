import { getConnection } from '../services/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: 'username y password requeridos' });

  const pool = await getConnection();
  const q = await pool.request()
    .input('username', username)
    .query('SELECT TOP 1 id, username, password_hash, role FROM users WHERE username=@username');

  if (!q.recordset.length)
    return res.status(401).json({ error: 'Usuario no encontrado' });

  const u = q.recordset[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok)
    return res.status(401).json({ error: 'Contraseña incorrecta' });

  const token = jwt.sign(
    { sub: u.id, username: u.username, role: u.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ token, user: { id: u.id, username: u.username, role: u.role } });
}
