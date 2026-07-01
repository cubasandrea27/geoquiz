const express = require('express');
const router  = express.Router();
const pool    = require('../utils/db');
const bcrypt  = require('bcrypt');

router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO docentes (nombre, apellido, email, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, email, hash]
    );

    res.status(201).json({ message: 'Docente registrado', id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'No se pudo guardar el docente' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña obligatorios' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM docentes WHERE email = ? AND activo = 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Docente no encontrado' });
    }

    const match = await bcrypt.compare(password, rows[0].password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ rol: 'docente', nombre: rows[0].nombre });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo iniciar sesión' });
  }
});

module.exports = router;
