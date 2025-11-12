// backend/src/controllers/tickets.controller.js
import { getConnection } from '../services/db.js';
import { logEvent } from '../services/ticketEvents.js';

/**
 * Recepción crea ticket.
 * Body:
 *  - patient_id (opcional)
 *  - patient { name, document?, phone? } (opcional: si no viene patient_id)
 */
export async function createTicket(req, res) {
  const pool = await getConnection();
  const { patient_id, patient } = req.body;

  try {
    let pid = patient_id;

    // si no envían patient_id, crear paciente rápido
    if (!pid && patient?.name) {
      const p = await pool.request()
        .input('name', patient.name)
        .input('document', patient.document || null)
        .input('phone', patient.phone || null)
        .query(`
          INSERT INTO patients(name, document, phone)
          OUTPUT INSERTED.id
          VALUES(@name, @document, @phone)
        `);
      pid = p.recordset[0].id;
    }

    if (!pid) return res.status(400).json({ error: 'patient_id o patient.name requerido' });

    const ins = await pool.request()
      .input('patient_id', pid)
      .query(`
        INSERT INTO tickets(patient_id, status)
        OUTPUT INSERTED.id, INSERTED.patient_id, INSERTED.status, INSERTED.created_at
        VALUES(@patient_id, 'pending')
      `);

    const ticket = ins.recordset[0];
    await logEvent(ticket.id, 'create', { patient_id: pid });
    return res.status(201).json(ticket);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Triaje asigna clínica y prioridad (1 alta, 2 media, 3 baja)
 * Body: { clinic_id, priority }
 */
export async function triageTicket(req, res) {
  const { id } = req.params;
  const { clinic_id, priority } = req.body;
  if (!clinic_id || !priority) return res.status(400).json({ error: 'clinic_id y priority son requeridos' });

  try {
    const pool = await getConnection();
    const upd = await pool.request()
      .input('id', id)
      .input('clinic_id', clinic_id)
      .input('priority', priority)
      .query(`
        UPDATE tickets
        SET clinic_id = @clinic_id,
            priority  = @priority,
            status    = 'triaged',
            triaged_at = SYSDATETIME()
        OUTPUT INSERTED.id, INSERTED.clinic_id, INSERTED.priority, INSERTED.status, INSERTED.triaged_at
        WHERE id = @id;
      `);

    if (!upd.recordset.length) return res.status(404).json({ error: 'ticket no encontrado' });

    await logEvent(+id, 'triage', { clinic_id, priority });
    return res.json(upd.recordset[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Pantalla/doctor: obtener cola por clínica.
 * Orden: prioridad asc, triaged_at asc.
 */
export async function getClinicQueue(req, res) {
  const { id } = req.params; // clinic_id
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('clinic_id', id)
      .query(`
        SELECT t.id, t.patient_id, p.name as patient_name, t.priority, t.status, t.triaged_at, t.called_at
        FROM tickets t
        JOIN patients p ON p.id = t.patient_id
        WHERE t.clinic_id = @clinic_id
          AND t.status IN ('triaged','in_service')
        ORDER BY t.priority ASC, t.triaged_at ASC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Doctor: llamar siguiente en clínica.
 * Toma el primer triaged y lo pasa a in_service.
 */
export async function callNext(req, res) {
  const { id } = req.params; // clinic_id
  try {
    const pool = await getConnection();

    // uno en servicio por clínica: opcionalmente podrías cerrar el anterior
    const next = await pool.request()
      .input('clinic_id', id)
      .query(`
        SELECT TOP 1 t.id
        FROM tickets t
        WHERE t.clinic_id = @clinic_id AND t.status = 'triaged'
        ORDER BY t.priority ASC, t.triaged_at ASC
      `);

    if (!next.recordset.length) return res.status(204).send(); // no hay siguiente

    const ticketId = next.recordset[0].id;

    const upd = await pool.request()
      .input('id', ticketId)
      .query(`
        UPDATE tickets
        SET status = 'in_service', called_at = SYSDATETIME()
        OUTPUT INSERTED.id, INSERTED.status, INSERTED.called_at
        WHERE id = @id
      `);

    await logEvent(ticketId, 'call', null);
    res.json(upd.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** Doctor: finalizar consulta */
export async function finishTicket(req, res) {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const upd = await pool.request()
      .input('id', id)
      .query(`
        UPDATE tickets
        SET status = 'done', finished_at = SYSDATETIME()
        OUTPUT INSERTED.id, INSERTED.status, INSERTED.finished_at
        WHERE id = @id
      `);

    if (!upd.recordset.length) return res.status(404).json({ error: 'ticket no encontrado' });
    await logEvent(+id, 'finish', null);
    res.json(upd.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/** Doctor: marcar ausente */
export async function noShowTicket(req, res) {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const upd = await pool.request()
      .input('id', id)
      .query(`
        UPDATE tickets
        SET status = 'no_show'
        OUTPUT INSERTED.id, INSERTED.status
        WHERE id = @id
      `);

    if (!upd.recordset.length) return res.status(404).json({ error: 'ticket no encontrado' });
    await logEvent(+id, 'no_show', null);
    res.json(upd.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
