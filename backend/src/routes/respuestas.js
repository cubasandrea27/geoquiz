const express = require('express');
const router  = express.Router();
const pool = require('../utils/db');

router.post('/', async (req, res) => {
  const { alumnoId, preguntaId, opcionIndex, esCorrecta } = req.body;

  if (!alumnoId || !preguntaId || opcionIndex === undefined) {
    return res.status(400).json({ error: 'Faltan datos para guardar la respuesta' });
  }

  try {
    const [existente] = await pool.query(
      'SELECT id FROM respuestas WHERE alumno_id = ? AND pregunta_id = ?',
      [alumnoId, preguntaId]
    );

    const respuestaTexto = String(opcionIndex);
    const correcta = esCorrecta ? 1 : 0;

    if (existente.length) {
      await pool.query(
        'UPDATE respuestas SET opcion_id = NULL, respuesta_texto = ?, es_correcta = ? WHERE id = ?',
        [respuestaTexto, correcta, existente[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO respuestas (alumno_id, pregunta_id, opcion_id, respuesta_texto, es_correcta) VALUES (?, ?, NULL, ?, ?)',
        [alumnoId, preguntaId, respuestaTexto, correcta]
      );
    }

    res.status(201).json({ message: 'Respuesta guardada' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la respuesta' });
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
        r.respuesta_texto AS opcion_elegida,
        r.es_correcta,
        CASE WHEN r.es_correcta = 1 THEN 'correcta' ELSE 'incorrecta' END AS resultado
      FROM respuestas r
      JOIN alumnos a ON a.id = r.alumno_id
      JOIN preguntas p ON p.id = r.pregunta_id
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
