const express = require('express');
const router = express.Router();
const pool = require('../utils/db');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/resumen/:temaId', authenticate, requireRole('docente'), async (req, res) => {
  try {
    const [temas] = await pool.query(
      'SELECT id, nombre FROM temas WHERE id = ? AND docente_id = ?',
      [req.params.temaId, req.user.id]
    );
    if (!temas.length) return res.status(404).json({ error: 'Tema no encontrado' });

    const [rows] = await pool.query(`
      SELECT a.id AS alumno_id, a.nombre, a.apellido,
             COUNT(p.id) AS respuestas,
             COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND r.es_correcta = 1 THEN 1 ELSE 0 END), 0) AS correctas,
             COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND r.es_correcta = 0 THEN 1 ELSE 0 END), 0) AS incorrectas,
             ROUND(100.0 * COALESCE(SUM(CASE WHEN p.id IS NOT NULL AND r.es_correcta = 1 THEN 1 ELSE 0 END), 0) / NULLIF(COUNT(p.id), 0), 1) AS porcentaje
      FROM tema_alumno ta
      JOIN alumnos a ON a.id = ta.alumno_id AND a.activo = 1
      JOIN temas t ON t.id = ta.tema_id
      LEFT JOIN respuestas r ON r.alumno_id = a.id
      LEFT JOIN preguntas p ON p.id = r.pregunta_id AND p.tema_id = t.id
      WHERE ta.tema_id = ? AND t.docente_id = ?
      GROUP BY a.id, a.nombre, a.apellido
      ORDER BY porcentaje DESC, a.apellido, a.nombre`, [req.params.temaId, req.user.id]);
    res.json({ tema: temas[0], alumnos: rows });
  } catch (error) {
    console.error('Error al calcular resumen:', error);
    res.status(500).json({ error: 'No se pudo calcular el resumen' });
  }
});

router.get('/csv/:temaId', authenticate, requireRole('docente'), async (req, res) => {
  try {
    const [temas] = await pool.query(
      'SELECT id, nombre FROM temas WHERE id = ? AND docente_id = ?',
      [req.params.temaId, req.user.id]
    );
    if (!temas.length) return res.status(404).json({ error: 'Tema no encontrado' });

    const [rows] = await pool.query(`
      SELECT a.nombre, a.apellido, p.enunciado, o.texto AS opcion_elegida,
             CASE WHEN r.es_correcta = 1 THEN 'Correcta' ELSE 'Incorrecta' END AS resultado,
             r.respondida_en
      FROM respuestas r
      JOIN alumnos a ON a.id = r.alumno_id
      JOIN preguntas p ON p.id = r.pregunta_id
      JOIN temas t ON t.id = p.tema_id AND t.docente_id = ?
      LEFT JOIN opciones o ON o.id = r.opcion_id
      WHERE p.tema_id = ?
      ORDER BY a.apellido, a.nombre, r.respondida_en`, [req.user.id, req.params.temaId]);
    const headers = ['Alumno', 'Apellido', 'Pregunta', 'Opción elegida', 'Resultado', 'Respondida en'];
    const escapeCsv = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const content = [headers, ...rows.map(row => [row.nombre, row.apellido, row.enunciado, row.opcion_elegida, row.resultado, row.respondida_en].map(escapeCsv))].map(row => row.join(',')).join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${(temas[0].nombre || 'reportes').replace(/[^a-z0-9_-]/gi, '_')}.csv"`);
    res.send(content);
  } catch (error) {
    console.error('Error al exportar reporte:', error);
    res.status(500).json({ error: 'No se pudo exportar el reporte' });
  }
});

module.exports = router;
