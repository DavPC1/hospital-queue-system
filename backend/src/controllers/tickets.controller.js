// backend/src/controllers/tickets.controller.js
import { getConnection } from '../services/db.js';
import { emitQueueUpdate, emitMetricsUpdate } from '../services/ticketEvents.js';

export async function create(req, res) {
  try {
    const pool = await getConnection();
    const body = req.body || {};

    let patientId = body.patient_id;
    if (!patientId && body.patient) {
      const { name, document, phone } = body.patient;
      const ins = await pool.request()
        .input('name', name)
        .input('document', document)
        .input('phone', phone)
        .query(`
          INSERT INTO patients (name, document, phone)
          OUTPUT INSERTED.id
          VALUES (@name, @document, @phone)
        `);
      patientId = ins.recordset[0].id;
    }

    if (!patientId) return res.status(400).json({ error: 'patient_id o patient es requerido' });

    const r = await pool.request()
      .input('patient_id', patientId)
      .query(`
        INSERT INTO tickets (patient_id, status, created_at)
        OUTPUT INSERTED.id, INSERTED.patient_id, INSERTED.status, INSERTED.created_at
        VALUES (@patient_id, 'pending', SYSDATETIME())
      `);
    const ticket = r.recordset[0];

    emitMetricsUpdate();
    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando ticket' });
  }
}

export async function triage(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { clinic_id, priority = 5 } = req.body;
    if (!clinic_id) return res.status(400).json({ error: 'clinic_id requerido' });

    const pool = await getConnection();
    await pool.request()
      .input('id', id)
      .input('clinic_id', clinic_id)
      .input('priority', priority)
      .query(`
        UPDATE tickets
        SET clinic_id = @clinic_id, priority = @priority, status = 'triaged', triaged_at = SYSDATETIME()
        WHERE id = @id
      `);

    emitQueueUpdate(clinic_id);
    emitMetricsUpdate();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en triaje' });
  }
}

export async function nextInClinic(req, res) {
  try {
    const clinic_id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const q = await pool.request()
      .input('clinic_id', clinic_id)
      .query(`
        SELECT TOP 1 t.*
        FROM tickets t
        WHERE t.clinic_id = @clinic_id AND t.status IN ('triaged','pending')
        ORDER BY COALESCE(t.priority,99) ASC, t.created_at ASC
      `);

    if (!q.recordset.length) return res.status(204).send();

    const ticket = q.recordset[0];

    await pool.request()
      .input('id', ticket.id)
      .query(`UPDATE tickets SET status='in_service', started_at=SYSDATETIME() WHERE id=@id`);

    emitQueueUpdate(clinic_id);
    emitMetricsUpdate();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener siguiente' });
  }
}

export async function finish(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const info = await pool.request().input('id', id).query('SELECT clinic_id FROM tickets WHERE id=@id');
    const clinic_id = info.recordset[0]?.clinic_id;

    await pool.request().input('id', id)
      .query(`UPDATE tickets SET status='finished', finished_at=SYSDATETIME() WHERE id=@id`);

    if (clinic_id) {
      emitQueueUpdate(clinic_id);
      emitMetricsUpdate();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al finalizar' });
  }
}

export async function noShow(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const info = await pool.request().input('id', id).query('SELECT clinic_id FROM tickets WHERE id=@id');
    const clinic_id = info.recordset[0]?.clinic_id;

    await pool.request().input('id', id)
      .query(`UPDATE tickets SET status='no_show', finished_at=SYSDATETIME() WHERE id=@id`);

    if (clinic_id) {
      emitQueueUpdate(clinic_id);
      emitMetricsUpdate();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al marcar ausencia' });
  }
}

export async function queueByClinic(req, res) {
  try {
    const clinic_id = parseInt(req.params.id, 10);
    const pool = await getConnection();
    const q = await pool.request()
      .input('clinic_id', clinic_id)
      .query(`
        SELECT t.id, t.patient_id, t.status, t.priority, t.created_at,
               p.name AS patient_name, p.document
        FROM tickets t
        LEFT JOIN patients p ON p.id = t.patient_id
        WHERE t.clinic_id = @clinic_id AND t.status IN ('triaged','pending','in_service')
        ORDER BY COALESCE(t.priority,99) ASC, t.created_at ASC
      `);
    res.json(q.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cola' });
  }
}
