// backend/src/controllers/tickets.controller.js
import { getConnection } from '../services/db.js';
import { emitQueueUpdate, emitMetricsUpdate } from '../services/ticketEvents.js';

/* ======================================================
   GET /api/tickets  → Últimos tickets (lo necesita Recepción)
====================================================== */
export const recent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const pool = await getConnection();

    // 👇 REEMPLAZA TU CONSULTA POR ESTA 👇
    const result = await pool.request().query(`
      SELECT TOP (${limit})
        t.id,
        t.patient_id,
        t.clinic_id,
        t.priority,
        t.status,
        t.created_at,
        t.triaged_at,
        t.called_at,
        t.finished_at,
        p.name AS patient_name, 
        p.document
      FROM dbo.tickets t
      LEFT JOIN patients p ON p.id = t.patient_id
      ORDER BY t.created_at DESC
    `);

    console.log("🔍 Datos enviados a frontend:", result.recordset);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ ERROR en recent:", err);
    res.status(500).json({ error: "Error en recent" });
  }
};

/* ======================================================
   POST /api/tickets  → Crear ticket
====================================================== */
export async function create(req, res) {
  try {
    const pool = await getConnection();
    const body = req.body || {};

    let patientId = body.patient_id;

    // Si envían datos de paciente, se crea uno nuevo
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

    if (!patientId) {
      return res.status(400).json({ error: 'patient_id o patient es requerido' });
    }

    // Aquí agregamos clinic_id
    const clinicId = body.clinic_id || null;

    const r = await pool.request()
      .input('patient_id', patientId)
      .input('clinic_id', clinicId)   // <-- nuevo input
      .query(`
        INSERT INTO tickets (patient_id, clinic_id, status, created_at)
        OUTPUT INSERTED.*
        VALUES (@patient_id, @clinic_id, 'pending', SYSDATETIME())
      `);

    const ticket = r.recordset[0];

    emitMetricsUpdate();
    res.status(201).json(ticket);

  } catch (err) {
    console.error('ERROR crear ticket:', err);
    res.status(500).json({ error: 'Error creando ticket' });
  }
}


/* ======================================================
   POST /api/tickets/:id/triage
====================================================== */
export async function triage(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { clinic_id, priority = 5 } = req.body;

    if (!clinic_id) {
      return res.status(400).json({ error: 'clinic_id requerido' });
    }

    const pool = await getConnection();

    await pool.request()
      .input('id', id)
      .input('clinic_id', clinic_id)
      .input('priority', priority)
      .query(`
        UPDATE tickets
        SET clinic_id = @clinic_id, priority = @priority,
            status = 'triaged', triaged_at = SYSDATETIME()
        WHERE id = @id
      `);

    emitQueueUpdate(clinic_id);
    emitMetricsUpdate();

    res.json({ ok: true });

  } catch (err) {
    console.error('ERROR triage:', err);
    res.status(500).json({ error: 'Error en triaje' });
  }
}

/* ======================================================
   POST /api/tickets/clinic/:id/next  → Siguiente ticket para médico
====================================================== */
export async function nextInClinic(req, res) {
  try {
    const clinic_id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const q = await pool.request()
      .input('clinic_id', clinic_id)
      .query(`
        SELECT TOP 1 t.*
        FROM tickets t
        WHERE t.clinic_id = @clinic_id
          AND t.status IN ('triaged','pending')
        ORDER BY COALESCE(t.priority, 99) ASC, t.created_at ASC
      `);

    if (!q.recordset.length) return res.status(204).send();

    const ticket = q.recordset[0];

 await pool.request()
      .input('id', ticket.id)
      .query(`
        UPDATE tickets
        SET status = 'in_service', called_at = SYSDATETIME()  -- <-- ASÍ QUEDA CORREGIDO
        WHERE id = @id
      `);

    emitQueueUpdate(clinic_id);
    emitMetricsUpdate();

    res.json(ticket);

  } catch (err) {
    console.error('ERROR nextInClinic:', err);
    res.status(500).json({ error: 'Error al obtener siguiente' });
  }
}

/* ======================================================
   POST /api/tickets/:id/finish
====================================================== */
export async function finish(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const info = await pool.request().input('id', id)
      .query('SELECT clinic_id FROM tickets WHERE id=@id');

    const clinic_id = info.recordset[0]?.clinic_id;

    await pool.request()
      .input('id', id)
      .query(`
        UPDATE tickets
        SET status='finished', finished_at=SYSDATETIME()
        WHERE id=@id
      `);

    if (clinic_id) {
      emitQueueUpdate(clinic_id);
      emitMetricsUpdate();
    }

    res.json({ ok: true });

  } catch (err) {
    console.error('ERROR finish:', err);
    res.status(500).json({ error: 'Error al finalizar' });
  }
}

/* ======================================================
   POST /api/tickets/:id/no-show
====================================================== */
export async function noShow(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const info = await pool.request()
      .input('id', id)
      .query('SELECT clinic_id FROM tickets WHERE id=@id');

    const clinic_id = info.recordset[0]?.clinic_id;

    await pool.request()
      .input('id', id)
      .query(`
        UPDATE tickets
        SET status='no_show', finished_at=SYSDATETIME()
        WHERE id=@id
      `);

    if (clinic_id) {
      emitQueueUpdate(clinic_id);
      emitMetricsUpdate();
    }

    res.json({ ok: true });

  } catch (err) {
    console.error('ERROR noShow:', err);
    res.status(500).json({ error: 'Error al marcar ausencia' });
  }
}

/* ======================================================
   GET /api/tickets/clinic/:id/queue
====================================================== */
export async function queueByClinic(req, res) {
  try {
    const clinic_id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const q = await pool.request()
      .input('clinic_id', clinic_id)
      .query(`
        SELECT
          t.id, t.patient_id, t.status, t.priority, t.created_at,
          p.name AS patient_name, p.document
        FROM tickets t
        LEFT JOIN patients p ON p.id = t.patient_id
        WHERE t.clinic_id = @clinic_id
          AND t.status IN ('triaged','pending','in_service')
        ORDER BY COALESCE(t.priority,99) ASC, t.created_at ASC
      `);

    res.json(q.recordset);

  } catch (err) {
    console.error('ERROR queueByClinic:', err);
    res.status(500).json({ error: 'Error al obtener cola' });
  }
}
export async function list(req, res) {
  try {
    const pool = await getConnection();
    const limit = parseInt(req.query.limit, 10) || 20;

    const q = await pool.request()
      .input('limit', limit)
      .query(`
        SELECT TOP (@limit)
          t.id, t.patient_id, t.status, t.priority, t.created_at,
          p.name AS patient_name, p.document
        FROM tickets t
        LEFT JOIN patients p ON p.id = t.patient_id
        ORDER BY t.created_at DESC
      `);

    res.json(q.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error listando tickets' });
  }
}

/* ======================================================
   GET /api/tickets/clinic/:id/counts  → Conteo para médico
====================================================== */
export async function getCountsByClinic(req, res) {
  try {
    const clinic_id = parseInt(req.params.id, 10);
    const pool = await getConnection();

    const q = await pool.request()
      .input('clinic_id', clinic_id)
      .query(`
        SELECT
          SUM(CASE WHEN status IN ('pending','triaged') THEN 1 ELSE 0 END) AS pending,
          SUM(CASE WHEN status = 'in_service' THEN 1 ELSE 0 END) AS in_service
        FROM tickets
        WHERE clinic_id = @clinic_id
      `);

    const counts = {
      pending: Number(q.recordset[0]?.pending) || 0,
      in_service: Number(q.recordset[0]?.in_service) || 0,
    };

    res.json(counts);

  } catch (err) {
    console.error('ERROR getCountsByClinic:', err);
    res.status(500).json({ error: 'Error al obtener conteo' });
  }
}

// NUEVA RUTA

/* ======================================================
   POST /api/tickets/:id/reassign  → Reasignar clínica
====================================================== */
export async function reassignClinic(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body;
    
    // Convertir el ID a número
    const new_clinic_id = parseInt(req.body.new_clinic_id, 10);

    if (!new_clinic_id || !reason) {
      return res.status(400).json({ error: 'Faltan campos: new_clinic_id y reason son obligatorios' });
    }

    const pool = await getConnection();

    // 1. Obtener la clínica antigua para notificarla
    const info = await pool.request()
      .input('id', id)
      .query('SELECT clinic_id FROM tickets WHERE id=@id');
    
    const old_clinic_id = info.recordset[0]?.clinic_id;

    // 2. Actualizar a la nueva clínica (CONSULTA CORREGIDA)
    await pool.request()
      .input('id', id)
      .input('new_clinic_id', new_clinic_id)
      .query(`
        UPDATE tickets
        SET clinic_id = @new_clinic_id,
            status = 'triaged',
            priority = 5
        WHERE id = @id
      `);

    // 3. Emitir eventos a ambas clínicas
    if (old_clinic_id) {
      emitQueueUpdate(old_clinic_id);
    }
    emitQueueUpdate(new_clinic_id);
    emitMetricsUpdate();

    res.json({ ok: true });

  } catch (err) {
    // Esto ahora mostrará el error en tu terminal
    console.error('ERROR reassignClinic:', err); 
    res.status(500).json({ error: 'Error al reasignar ticket' });
  }
}
