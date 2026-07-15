const express = require('express');
const router  = express.Router();
const pool = require('../utils/db');

function normalizarTemaNombre(nombre = '') {
  return String(nombre)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, descripcion FROM temas WHERE activo = 1 ORDER BY nombre ASC'
    );

    const temasUnicos = [];
    const vistos = new Set();

    rows.forEach(tema => {
      const clave = normalizarTemaNombre(tema.nombre);
      if (!clave || vistos.has(clave)) return;

      vistos.add(clave);
      temasUnicos.push({
        id: tema.id,
        nombre: tema.nombre,
        descripcion: tema.descripcion
      });
    });

    res.json(temasUnicos);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron listar los temas' });
  }
});

router.post('/', async (req, res) => {
  const { nombre, descripcion } = req.body;
  const nombreOriginal = (nombre || '').trim();

  if (!nombreOriginal) {
    return res.status(400).json({ error: 'El nombre del tema es obligatorio' });
  }

  try {
    const [todosLosTemas] = await pool.query(
      'SELECT id, nombre FROM temas WHERE activo = 1 ORDER BY id ASC'
    );

    const temaExistente = todosLosTemas.find(tema =>
      normalizarTemaNombre(tema.nombre) === normalizarTemaNombre(nombreOriginal)
    );

    if (temaExistente) {
      return res.status(200).json({ id: temaExistente.id, nombre: temaExistente.nombre, existente: true });
    }

    const [result] = await pool.query(
      'INSERT INTO temas (docente_id, nombre, descripcion) VALUES (?, ?, ?)',
      [1, nombreOriginal, descripcion || '']
    );

    res.status(201).json({ id: result.insertId, nombre: nombreOriginal });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo crear el tema' });
  }
});

router.delete('/:id', async (req, res) => {
  const temaId = req.params.id;

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el id del tema' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE temas SET activo = 0 WHERE id = ? AND activo = 1',
      [temaId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    await pool.query(
      'UPDATE preguntas SET activo = 0 WHERE tema_id = ? AND activo = 1',
      [temaId]
    );

    res.json({ message: 'Tema borrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo borrar el tema' });
  }
});

module.exports = router;
