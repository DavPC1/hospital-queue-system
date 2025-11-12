// backend/src/controllers/clinics.controller.js
import { getConnection } from '../services/db.js';

export async function listClinics(req, res) {
  const pool = await getConnection();
  const result = await pool.request()
    .query('SELECT id, name, code, active FROM clinics ORDER BY name');
  res.json(result.recordset);
}

export async function createClinic(req, res) {
  const { name, code, active = true } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'name y code son requeridos' });

  const pool = await getConnection();

  // validar duplicado por code
  const exists = await pool.request()
    .input('code', code)
    .query('SELECT 1 FROM clinics WHERE code = @code');
  if (exists.recordset.length) return res.status(409).json({ error: 'code ya existe' });

  const insert = await pool.request()
    .input('name', name)
    .input('code', code)
    .input('active', active ? 1 : 0)
    .query(`
      INSERT INTO clinics(name, code, active)
      OUTPUT INSERTED.id, INSERTED.name, INSERTED.code, INSERTED.active
      VALUES(@name, @code, @active)
    `);
  res.status(201).json(insert.recordset[0]);
}
