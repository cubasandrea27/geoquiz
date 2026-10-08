const pool = require('../utils/db');

async function list(req, res) {
  const { userType, userId } = req.query;
  if (!userType || !userId) {
    return res.status(400).json({ error: 'userType y userId son requeridos' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, titulo, mensaje, leida, created_at
       FROM notificaciones
       WHERE destinatario_tipo = ? AND destinatario_id = ?
       ORDER BY created_at DESC`,
      [userType, Number(userId)]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al listar notificaciones:', error);
    res.status(500).json({ error: 'No se pudieron listar las notificaciones' });
  }
}

async function create(req, res) {
  const { destinatarioTipo, destinatarioId, titulo, mensaje } = req.body;
  if (!['alumno', 'docente'].includes(destinatarioTipo) || !destinatarioId || !titulo || !mensaje) {
    return res.status(400).json({ error: 'Completá destinatario, título y mensaje' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO notificaciones (destinatario_tipo, destinatario_id, titulo, mensaje)
       VALUES (?, ?, ?, ?)`,
      [destinatarioTipo, Number(destinatarioId), titulo.trim(), mensaje.trim()]
    );
    res.status(201).json({ id: result.insertId, message: 'Notificación guardada' });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: 'No se pudo guardar la notificación' });
  }
}

async function markRead(req, res) {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'UPDATE notificaciones SET leida = 1 WHERE id = ? AND leida = 0',
      [id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Notificación no encontrada' });
    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ error: 'No se pudo actualizar la notificación' });
  }
}

module.exports = { list, create, markRead };
