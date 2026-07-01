const express = require('express');
const router  = express.Router();
const pool    = require('../utils/db');

router.get('/', async (req, res) => {
  const docenteId = Number(req.query.docenteId || req.body.docenteId || 1);

  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion, activo, created_at FROM temas WHERE docente_id = ? AND activo = 1 ORDER BY created_at DESC',
      [docenteId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar los temas' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion, docenteId } = req.body;
  const docente = Number(docenteId || 1);

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre del tema es obligatorio' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO temas (docente_id, nombre, descripcion) VALUES (?, ?, ?)',
      [docente, nombre, descripcion || '']
    );

    res.status(201).json({ message: 'Tema creado', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el tema' });
  }
});

module.exports = router;
