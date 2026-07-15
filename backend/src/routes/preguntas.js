const express = require('express');
const router  = express.Router();
const pool    = require('../utils/db');

router.get('/', async (req, res) => {
  const temaId = Number(req.query.temaId || req.body.temaId);

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [preguntas] = await pool.query(
      'SELECT id, enunciado FROM preguntas WHERE tema_id = ? AND activo = 1 ORDER BY id DESC',
      [temaId]
    );

    const preguntasConOpciones = [];

    for (const pregunta of preguntas) {
      const [opciones] = await pool.query(
        'SELECT id, texto, es_correcta FROM opciones WHERE pregunta_id = ? ORDER BY id ASC',
        [pregunta.id]
      );

      const correcta = opciones.findIndex(opcion => opcion.es_correcta === 1) + 1;

      preguntasConOpciones.push({
        id: pregunta.id,
        enunciado: pregunta.enunciado,
        opcion1: opciones[0] ? opciones[0].texto : '',
        opcion2: opciones[1] ? opciones[1].texto : '',
        opcion3: opciones[2] ? opciones[2].texto : '',
        correcta
      });
    }

    res.json(preguntasConOpciones);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar las preguntas' });
  }
});

router.post('/', async (req, res) => {
  const { temaId, enunciado, opciones, respuestaCorrecta } = req.body;

  if (!temaId || !enunciado || !Array.isArray(opciones) || opciones.length !== 3 || !respuestaCorrecta) {
    return res.status(400).json({ error: 'Faltan datos para guardar la pregunta' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO preguntas (tema_id, enunciado) VALUES (?, ?)',
      [temaId, enunciado]
    );

    const preguntaId = result.insertId;
    const values = opciones.map((texto, index) => [preguntaId, texto, index + 1 === Number(respuestaCorrecta) ? 1 : 0]);

    await pool.query('INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES ?', [values]);

    res.status(201).json({ message: 'Pregunta creada', id: preguntaId });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la pregunta' });
  }
});

module.exports = router;
