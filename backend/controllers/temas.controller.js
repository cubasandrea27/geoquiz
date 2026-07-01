const pool = require('../utils/db');

async function list(req, res) {
  const docenteId = req.query.docenteId || req.body.docenteId;

  if (!docenteId) {
    return res.status(400).json({ error: 'Falta el docenteId' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, activo, created_at FROM temas WHERE docente_id = ? AND activo = 1 ORDER BY created_at DESC',
      [docenteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function create(req, res) {
  const { nombre, descripcion, docenteId } = req.body;

  if (!nombre || !docenteId) {
    return res.status(400).json({ error: 'Nombre y docenteId son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO temas (docente_id, nombre, descripcion) VALUES (?, ?, ?)',
      [docenteId, nombre, descripcion || '']
    );

    res.status(201).json({ message: 'Tema creado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { list, create };
