const pool = require('../utils/db');

async function list(req, res) {
  const temaId = req.query.temaId;

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, tema_id, nombre, latitud, longitud, radio_metros FROM ubicaciones WHERE tema_id = ? AND activo = 1 ORDER BY id DESC',
      [temaId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function create(req, res) {
  const { temaId, nombre, latitud, longitud, radio_metros } = req.body;

  if (!temaId || latitud == null || longitud == null) {
    return res.status(400).json({ error: 'Tema, latitud y longitud son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO ubicaciones (tema_id, nombre, latitud, longitud, radio_metros) VALUES (?, ?, ?, ?, ?)',
      [temaId, nombre || null, latitud, longitud, radio_metros || 50]
    );

    res.status(201).json({ message: 'Ubicación creada', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { nombre, latitud, longitud, radio_metros } = req.body;

  if (latitud == null || longitud == null) {
    return res.status(400).json({ error: 'Latitud y longitud son obligatorias' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE ubicaciones SET nombre = ?, latitud = ?, longitud = ?, radio_metros = ? WHERE id = ? AND activo = 1',
      [nombre || null, latitud, longitud, radio_metros || 50, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    res.json({ message: 'Ubicación actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE ubicaciones SET activo = 0 WHERE id = ? AND activo = 1',
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    res.json({ message: 'Ubicación eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { list, create, update, remove };
