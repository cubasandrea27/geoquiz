const express = require('express');
const router  = express.Router();
const pool = require('../utils/db');

router.get('/todas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.tema_id AS temaId, p.ubicacion_id AS ubicacionId,
             p.enunciado, t.nombre AS temaNombre
      FROM preguntas p
      JOIN temas t ON t.id = p.tema_id
      WHERE p.activo = 1 AND t.activo = 1
      ORDER BY p.id DESC
    `);

    const preguntas = [];
    for (const pregunta of rows) {
      const [opciones] = await pool.query(
        'SELECT id, texto, es_correcta FROM opciones WHERE pregunta_id = ? ORDER BY id ASC',
        [pregunta.id]
      );

      preguntas.push({
        ...pregunta,
        opcion1: opciones[0] ? opciones[0].texto : '',
        opcion2: opciones[1] ? opciones[1].texto : '',
        opcion3: opciones[2] ? opciones[2].texto : '',
        correcta: opciones.findIndex((opcion) => opcion.es_correcta === 1) + 1,
        opciones
      });
    }

    res.json(preguntas);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar las preguntas' });
  }
});

router.get('/', async (req, res) => {
  const temaId = req.query.temaId;
  const alumnoId = req.query.alumnoId;
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng) : null;
  const precision = req.query.precision ? parseFloat(req.query.precision) : 0;
  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    if (alumnoId) {
      const [inscripciones] = await pool.query(
        'SELECT 1 FROM tema_alumno WHERE tema_id = ? AND alumno_id = ? LIMIT 1',
        [temaId, alumnoId]
      );

      if (!inscripciones.length) {
        return res.status(403).json({ error: 'El alumno no está registrado en este tema' });
      }
    }

    const params = [temaId];
    let ubicacionSql = '';

    if (lat !== null && lng !== null) {
      const margenGps = Number.isFinite(precision) && precision > 0 ? precision : 0;
      ubicacionSql = `
        AND (
          p.ubicacion_id IS NULL
          OR p.ubicacion_id IN (
            SELECT u.id
            FROM ubicaciones u
            WHERE u.tema_id = ? AND u.activo = 1
              AND (6371 * ACOS(LEAST(1, GREATEST(-1,
                COS(RADIANS(?)) * COS(RADIANS(u.latitud))
                * COS(RADIANS(u.longitud) - RADIANS(?))
                + SIN(RADIANS(?)) * SIN(RADIANS(u.latitud))
              )))) * 1000 <= u.radio_metros + ?
          )
        )`;
      params.push(temaId, lat, lng, lat, margenGps);
    }

    let bloqueoSql = '';
    if (alumnoId) {
      bloqueoSql = `
        AND NOT EXISTS (
          SELECT 1 FROM bloqueos_pregunta b
          WHERE b.alumno_id = ? AND b.pregunta_id = p.id
            AND b.bloqueada_hasta > NOW()
        )`;
      params.push(alumnoId);
    }

    const [preguntas] = await pool.query(`
      SELECT p.id, p.enunciado
      FROM preguntas p
      JOIN temas t ON t.id = p.tema_id AND t.activo = 1
      WHERE p.tema_id = ? AND p.activo = 1
      ${ubicacionSql}
      ${bloqueoSql}
      ORDER BY RAND()
    `, params);

    const preguntasConOpciones = [];

    for (const pregunta of preguntas) {
      const [opciones] = await pool.query(
        'SELECT id, texto FROM opciones WHERE pregunta_id = ? ORDER BY id ASC',
        [pregunta.id]
      );

      preguntasConOpciones.push({
        id: pregunta.id,
        enunciado: pregunta.enunciado,
        opciones: opciones.map(opcion => ({ id: opcion.id, texto: opcion.texto }))
      });
    }

    res.json(preguntasConOpciones);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar las preguntas' });
  }
});

router.post('/', async (req, res) => {
  const { temaId, ubicacionId, enunciado, opciones, respuestaCorrecta } = req.body;

  if (!temaId || !enunciado || !Array.isArray(opciones) || opciones.length !== 3 || !respuestaCorrecta) {
    return res.status(400).json({ error: 'Faltan datos para guardar la pregunta' });
  }

  try {
    let ubicacionSeleccionada = ubicacionId;

    if (!ubicacionSeleccionada) {
      const [ubicacionesDelTema] = await pool.query(
        'SELECT id FROM ubicaciones WHERE tema_id = ? AND activo = 1 ORDER BY id ASC LIMIT 1',
        [temaId]
      );
      ubicacionSeleccionada = ubicacionesDelTema[0]?.id;
    }

    const [ubicaciones] = await pool.query(
      'SELECT id FROM ubicaciones WHERE id = ? AND tema_id = ? AND activo = 1',
      [ubicacionSeleccionada, temaId]
    );

    if (!ubicaciones.length) {
      return res.status(400).json({ error: 'Primero cargá una ubicación activa para este tema' });
    }

    const [result] = await pool.query(
      'INSERT INTO preguntas (tema_id, ubicacion_id, enunciado) VALUES (?, ?, ?)',
      [temaId, ubicacionSeleccionada, enunciado]
    );

    const preguntaId = result.insertId;
    const values = opciones.map((texto, index) => [preguntaId, texto, index + 1 === Number(respuestaCorrecta) ? 1 : 0]);

    await pool.query(
      'INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES ?', [values]
    );

    res.status(201).json({ message: 'Pregunta guardada', id: preguntaId });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo guardar la pregunta' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE preguntas SET activo = 0 WHERE id = ? AND activo = 1',
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.json({ message: 'Pregunta eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar pregunta:', error);
    res.status(500).json({ error: 'No se pudo eliminar la pregunta' });
  }
});

module.exports = router;
