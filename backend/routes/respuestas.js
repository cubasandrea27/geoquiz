const express = require('express');
const router  = express.Router();
const pool = require('../utils/db');

// Todas las respuestas de los alumnos, agrupadas por alumno, para todos
// los temas de un docente. Sirve para la sección "Ver respuestas" del
// panel docente, incluyendo el tema al que pertenece cada pregunta para
// poder filtrar del lado del cliente sin pegarle de nuevo a la API.
router.get('/docente/:docenteId', async (req, res) => {
  const { docenteId } = req.params;

  if (!docenteId) {
    return res.status(400).json({ error: 'Falta el docenteId' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT
        a.id AS alumno_id,
        a.nombre,
        a.apellido,
        p.id AS pregunta_id,
        p.enunciado AS pregunta,
        t.id AS tema_id,
        t.nombre AS tema_nombre,
        o.texto AS opcion_elegida,
        o.es_correcta,
        CASE
          WHEN o.es_correcta = 1 THEN 'correcta'
          ELSE 'incorrecta'
        END AS resultado,
        r.respondida_en
      FROM respuestas r
      JOIN alumnos a   ON a.id = r.alumno_id
      JOIN preguntas p ON p.id = r.pregunta_id
      JOIN temas t     ON t.id = p.tema_id
      LEFT JOIN opciones o ON o.id = r.opcion_id
      WHERE t.docente_id = ?
      ORDER BY a.apellido, a.nombre, r.respondida_en DESC
    `, [docenteId]);

    const resultados = {};

    rows.forEach(row => {
      if (!resultados[row.alumno_id]) {
        resultados[row.alumno_id] = {
          alumno_id: row.alumno_id,
          nombre: row.nombre,
          apellido: row.apellido,
          respuestas: []
        };
      }

      resultados[row.alumno_id].respuestas.push({
        pregunta_id: row.pregunta_id,
        pregunta: row.pregunta,
        tema_id: row.tema_id,
        tema_nombre: row.tema_nombre,
        opcion_elegida: row.opcion_elegida || 'Sin respuesta',
        resultado: row.resultado,
        respondida_en: row.respondida_en
      });
    });

    res.json(Object.values(resultados));
  } catch (error) {
    console.error('Error al listar respuestas del docente:', error);
    res.status(500).json({ error: 'No se pudieron listar las respuestas' });
  }
});

// Registrar la respuesta de un alumno a una pregunta.
router.post('/', async (req, res) => {
  const { alumnoId, preguntaId, opcionId, latitud, longitud } = req.body;

  if (!alumnoId || !preguntaId || !opcionId) {
    return res.status(400).json({ error: 'alumnoId, preguntaId y opcionId son requeridos' });
  }

  try {
    const [opciones] = await pool.query(
      'SELECT id, es_correcta FROM opciones WHERE id = ? AND pregunta_id = ?',
      [opcionId, preguntaId]
    );

    if (!opciones.length) {
      return res.status(404).json({ error: 'La opción no pertenece a esa pregunta' });
    }

    const esCorrecta = opciones[0].es_correcta ? 1 : 0;

    const [result] = await pool.query(
      `INSERT INTO respuestas (alumno_id, pregunta_id, opcion_id, es_correcta, latitud_resp, longitud_resp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [alumnoId, preguntaId, opcionId, esCorrecta, latitud || null, longitud || null]
    );

    res.status(201).json({ message: 'Respuesta registrada', id: result.insertId, esCorrecta: !!esCorrecta });
  } catch (error) {
    console.error('Error al registrar respuesta:', error);
    res.status(500).json({ error: 'No se pudo registrar la respuesta' });
  }
});

router.get('/por-tema/:temaId', async (req, res) => {
  const { temaId } = req.params;

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id AS alumno_id,
        a.nombre,
        a.apellido,
        p.id AS pregunta_id,
        p.enunciado AS pregunta,
        o.texto AS opcion_elegida,
        o.es_correcta,
        CASE 
          WHEN o.es_correcta = 1 THEN 'correcta'
          ELSE 'incorrecta'
        END AS resultado
      FROM respuestas r
      JOIN alumnos a ON a.id = r.alumno_id
      JOIN preguntas p ON p.id = r.pregunta_id
      LEFT JOIN opciones o ON o.id = r.opcion_id
      WHERE p.tema_id = ?
      ORDER BY a.apellido, a.nombre, p.id ASC
    `, [temaId]);

    const resultados = {};

    rows.forEach(row => {
      if (!resultados[row.alumno_id]) {
        resultados[row.alumno_id] = {
          alumno_id: row.alumno_id,
          nombre: row.nombre,
          apellido: row.apellido,
          respuestas: [],
          puntaje: 0
        };
      }

      const respuesta = {
        pregunta_id: row.pregunta_id,
        pregunta: row.pregunta,
        opcion_elegida: row.opcion_elegida || 'Sin respuesta',
        resultado: row.resultado
      };

      resultados[row.alumno_id].respuestas.push(respuesta);
      if (row.resultado === 'correcta') {
        resultados[row.alumno_id].puntaje += 1;
      }
    });

    res.json(Object.values(resultados));
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar las respuestas' });
  }
});

module.exports = router;
