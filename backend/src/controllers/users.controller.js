import { getConnection } from '../services/db.js';
import bcrypt from 'bcryptjs';

export async function createUser(req, res) {
  try {
    const pool = await getConnection();
    const { username, password, role = 'reception' } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username y password' });

    const hash = bcrypt.hashSync(password, 10);
    await pool.request()
      .input('username', username)
      .input('password_hash', hash)
      .input('role', role)
      .query(`INSERT INTO users (username, password_hash, role, created_at) VALUES (@username, @password_hash, @role, SYSDATETIME())`);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo crear usuario' });
  }
}

export async function listUsers(req, res) {
  try {
    const pool = await getConnection();
    const q = await pool.request().query('SELECT id, username, role, created_at FROM users ORDER BY id DESC');
    res.json(q.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}
