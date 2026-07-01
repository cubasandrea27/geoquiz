const express = require('express');
const router  = express.Router();
const pool    = require('../utils/db');
const bcrypt  = require('bcrypt');

router.post('/register', async (req, res) => {
  const { nombre, apellido, dni, password } = req.body;

  if (!nombre || !apellido || !dni || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO alumnos (nombre, apellido, dni, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, dni, hash]
    );

    res.status(201).json({ message: 'Alumno registrado', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El DNI ya está registrado' });
    }
    res.status(500).json({ error: 'No se pudo guardar el alumno' });
  }
});

router.post('/login', async (req, res) => {
  const { dni, password } = req.body;

  if (!dni || !password) {
    return res.status(400).json({ error: 'DNI y contraseña obligatorios' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM alumnos WHERE dni = ? AND activo = 1', [dni]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Alumno no encontrado' });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ rol: 'alumno', nombre: rows[0].nombre });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

module.exports = router;
