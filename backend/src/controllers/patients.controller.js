// backend/src/controllers/patients.controller.js
import { getConnection } from '../services/db.js';

export async function listPatients(req, res) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT id, code, name, document, phone, created_at FROM patients ORDER BY id DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPatient(req, res) {
  try {
    const { name, document, phone } = req.body;
    if (!name)
      return res.status(400).json({ error: 'El campo name es obligatorio' });

    const pool = await getConnection();

    const insert = await pool.request()
      .input('name', name)
      .input('document', document || null)
      .input('phone', phone || null)
      .query(`
        INSERT INTO patients(name, document, phone)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.document, INSERTED.phone
        VALUES(@name, @document, @phone)
      `);

    res.status(201).json(insert.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
