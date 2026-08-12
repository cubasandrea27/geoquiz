const pool = require('../utils/db');

async function listar(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM carreras WHERE activo = 1 ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error('Error al listar carreras:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerPorId(req, res) {
  const carreraId = req.params.id;
  if (!carreraId) {
    return res.status(400).json({ error: 'ID de carrera requerido' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM carreras WHERE id = ? AND activo = 1', [carreraId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carrera no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error al obtener carrera:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerTemas(req, res) {
  const carreraId = req.params.id;
  if (!carreraId) {
    return res.status(400).json({ error: 'ID de carrera requerido' });
  }
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.nombre, t.descripcion, t.docente_id, t.activo
      FROM temas t
      INNER JOIN carrera_tema ct ON ct.tema_id = t.id
      WHERE ct.carrera_id = ? AND t.activo = 1
      ORDER BY t.nombre
    `, [carreraId]);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener temas de carrera:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { listar, obtenerPorId, obtenerTemas };
