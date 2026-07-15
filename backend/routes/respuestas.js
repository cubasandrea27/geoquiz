const express = require('express');
const router  = express.Router();
const pool = require('../utils/db');

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
