const pool = require('../utils/db');

async function inscribirse(req, res) {
  const { temaId } = req.body;
  const alumnoId = req.user.id;
  
  if (!alumnoId || !temaId) {
    return res.status(400).json({ error: 'alumnoId y temaId son requeridos' });
  }

  try {
    // Verificar que el alumno existe
    const [alumnoRows] = await pool.query(
      'SELECT id FROM alumnos WHERE id = ? AND activo = 1',
      [alumnoId]
    );
    
    if (alumnoRows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    // Verificar que el tema existe
    const [temaRows] = await pool.query(
      'SELECT id FROM temas WHERE id = ? AND activo = 1',
      [temaId]
    );
    
    if (temaRows.length === 0) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    // Inscribir al alumno
    await pool.query(
      'INSERT IGNORE INTO tema_alumno (tema_id, alumno_id) VALUES (?, ?)',
      [temaId, alumnoId]
    );

    res.status(201).json({ message: 'Alumno inscrito correctamente en el tema' });
  } catch (err) {
    console.error('Error al inscribir alumno:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function obtenerInscripciones(req, res) {
  const alumnoId = req.params.alumnoId;
  
  if (!alumnoId) {
    return res.status(400).json({ error: 'ID de alumno requerido' });
  }
  if (Number(alumnoId) !== Number(req.user.id)) {
    return res.status(403).json({ error: 'No puedes consultar las inscripciones de otro alumno' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.nombre, t.descripcion, t.docente_id
      FROM tema_alumno ta
      INNER JOIN temas t ON t.id = ta.tema_id
      WHERE ta.alumno_id = ? AND t.activo = 1
      ORDER BY t.nombre
    `, [alumnoId]);
    
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener inscripciones:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function verificarInscripcion(req, res) {
  const { temaId } = req.query;
  const alumnoId = req.user.id;
  
  if (!alumnoId || !temaId) {
    return res.status(400).json({ error: 'alumnoId y temaId son requeridos' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT 1 FROM tema_alumno WHERE alumno_id = ? AND tema_id = ?',
      [alumnoId, temaId]
    );
    
    res.json({ inscrito: rows.length > 0 });
  } catch (err) {
    console.error('Error al verificar inscripción:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = { inscribirse, obtenerInscripciones, verificarInscripcion };
