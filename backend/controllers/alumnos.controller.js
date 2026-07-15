const pool    = require('../utils/db');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

async function register(req, res) {
  const { nombre, apellido, dni, password } = req.body;
  if (!nombre || !apellido || !dni) {
    return res.status(400).json({ error: 'Nombre, apellido y DNI son obligatorios' });
  }
  try {
    const hash = await bcrypt.hash(password || dni, 10);
    const [result] = await pool.query(
      'INSERT INTO alumnos (nombre, apellido, dni, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, dni, hash]
    );
    res.status(201).json({ message: 'Alumno registrado', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El DNI ya está registrado' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
}

async function login(req, res) {
  const { dni, password } = req.body;
  if (!dni) return res.status(400).json({ error: 'DNI obligatorio' });
  try {
    const [rows] = await pool.query('SELECT * FROM alumnos WHERE dni = ? AND activo = 1', [dni]);
    if (rows.length === 0) return res.status(401).json({ error: 'DNI no encontrado' });
    const alumno = rows[0];
    const match = await bcrypt.compare(password || dni, alumno.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { id: alumno.id, rol: 'alumno' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ token, nombre: alumno.nombre, rol: 'alumno' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { register, login };
