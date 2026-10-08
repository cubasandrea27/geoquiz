const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/resumen/:temaId', authenticate, requireRole('docente'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id AS alumno_id, a.nombre, a.apellido,
             COUNT(r.id) AS respuestas,
             SUM(r.es_correcta = 1) AS correctas,
             SUM(r.es_correcta = 0) AS incorrectas,
             ROUND(100.0 * SUM(r.es_correcta = 1) / NULLIF(COUNT(r.id), 0), 1) AS porcentaje
      FROM alumnos a
      LEFT JOIN respuestas r ON r.alumno_id = a.id
      LEFT JOIN preguntas p ON p.id = r.pregunta_id
      WHERE p.tema_id = ? OR p.tema_id IS NULL
      GROUP BY a.id, a.nombre, a.apellido
      ORDER BY porcentaje DESC, a.apellido, a.nombre`, [req.params.temaId]);
    const tema = await pool.query('SELECT id, nombre FROM temas WHERE id = ?', [req.params.temaId]);
    res.json({ tema: tema[0][0] || null, alumnos: rows });
  } catch (error) {
    console.error('Error al calcular resumen:', error);
    res.status(500).json({ error: 'No se pudo calcular el resumen' });
  }
});

router.get('/csv/:temaId', authenticate, requireRole('docente'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.nombre, a.apellido, p.enunciado, o.texto AS opcion_elegida,
             CASE WHEN r.es_correcta = 1 THEN 'Correcta' ELSE 'Incorrecta' END AS resultado,
             r.respondida_en
      FROM respuestas r
      JOIN alumnos a ON a.id = r.alumno_id
      JOIN preguntas p ON p.id = r.pregunta_id
      LEFT JOIN opciones o ON o.id = r.opcion_id
      WHERE p.tema_id = ?
      ORDER BY a.apellido, a.nombre, r.respondida_en`, [req.params.temaId]);
    const tema = await pool.query('SELECT nombre FROM temas WHERE id = ?', [req.params.temaId]);
    const headers = ['Alumno', 'Apellido', 'Pregunta', 'Opción elegida', 'Resultado', 'Respondida en'];
    const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const content = [headers, ...rows.map(row => [row.nombre, row.apellido, row.enunciado, row.opcion_elegida, row.resultado, row.respondida_en].map(escapeCsv))].map(row => row.join(',')).join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${(tema[0][0]?.nombre || 'reportes').replace(/[^a-z0-9_-]/gi, '_')}.csv"`);
    res.send(content);
  } catch (error) {
    console.error('Error al exportar reporte:', error);
    res.status(500).json({ error: 'No se pudo exportar el reporte' });
  }
});

module.exports = router;
