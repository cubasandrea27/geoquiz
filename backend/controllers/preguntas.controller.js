const pool = require('../utils/db');

async function list(req, res) {
  const temaId = req.query.temaId || req.body.temaId;

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, tema_id, enunciado, activo, created_at FROM preguntas WHERE tema_id = ? AND activo = 1 ORDER BY created_at DESC',
      [temaId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function create(req, res) {
  const { temaId, enunciado } = req.body;

  if (!temaId || !enunciado) {
    return res.status(400).json({ error: 'Tema y enunciado son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO preguntas (tema_id, enunciado) VALUES (?, ?)',
      [temaId, enunciado]
    );

    res.status(201).json({ message: 'Pregunta creada', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { list, create };
