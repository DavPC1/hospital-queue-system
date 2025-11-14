// backend/src/controllers/clinics.controller.js
import { getConnection } from '../services/db.js';

// GET /api/clinics
export const list = async (req, res) => {
  try {
    const pool = await getConnection();
    const q = await pool.request()
      .query('SELECT id, name, description FROM clinics ORDER BY id DESC');
    res.json(q.recordset);
  } catch (err) {
    console.error('clinics.list error:', err);
    res.status(500).json({ error: 'Error al obtener clínicas' });
  }
};

// POST /api/clinics
export const create = async (req, res) => {
  try {
    const { name, description = null } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ error: 'name es requerido' });
    }
    const pool = await getConnection();
    const r = await pool.request()
      .input('name', name)
      .input('description', description)
      .query(`
        INSERT INTO clinics (name, description)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.description
        VALUES (@name, @description)
      `);
    res.status(201).json(r.recordset[0]);
  } catch (err) {
    console.error('clinics.create error:', err);
    res.status(500).json({ error: 'Error al crear clínica' });
  }
};
