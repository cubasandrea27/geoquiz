const express = require('express');
const router  = express.Router();
const pool    = require('../utils/db');

router.get('/', async (req, res) => {
  const temaId = Number(req.query.temaId || req.body.temaId);

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, tema_id, enunciado, activo, created_at FROM preguntas WHERE tema_id = ? AND activo = 1 ORDER BY created_at DESC',
      [temaId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar las preguntas' });
  }
});

router.post('/', async (req, res) => {
  const { temaId, enunciado, respuesta } = req.body;

  if (!temaId || !enunciado) {
    return res.status(400).json({ error: 'Tema y pregunta son obligatorios' });
  }

  const textoCompleto = respuesta
    ? `${enunciado} | Respuesta correcta: ${respuesta}`
    : enunciado;

  try {
    const [result] = await pool.query(
      'INSERT INTO preguntas (tema_id, enunciado) VALUES (?, ?)',
      [temaId, textoCompleto]
    );

    res.status(201).json({ message: 'Pregunta creada', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear la pregunta' });
  }
});

module.exports = router;
