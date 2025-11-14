// backend/src/controllers/patients.controller.js
import { getConnection } from '../services/db.js';

export const list = async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT id, name, lastname, dni FROM patients ORDER BY id DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error('patients.list error:', err);
    res.status(500).json({ error: 'Error al obtener pacientes' });
  }
};

export const create = async (req, res) => {
  try {
    const { name, lastname, dni } = req.body;
    if (!name || !lastname || !dni)
      return res.status(400).json({ error: 'Faltan campos requeridos' });

    const pool = await getConnection();
    const result = await pool.request()
      .input('name', name)
      .input('lastname', lastname)
      .input('dni', dni)
      .query(`
        INSERT INTO patients (name, lastname, dni)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.lastname, INSERTED.dni
        VALUES (@name, @lastname, @dni)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('patients.create error:', err);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
};
