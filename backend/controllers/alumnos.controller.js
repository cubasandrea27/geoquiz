const pool    = require('../utils/db');
const bcrypt  = require('bcrypt');
const { signToken } = require('../utils/jwt');

async function register(req, res) {
  const nombre = String(req.body.nombre || '').trim();
  const apellido = String(req.body.apellido || '').trim();
  const dni = String(req.body.dni || '').trim();
  const password = String(req.body.password || '');
  if (!nombre || !apellido || !dni || !password) {
    return res.status(400).json({ error: 'Nombre, apellido, DNI y contraseña son obligatorios' });
  }
  if (!/^\d{7,8}$/.test(dni) || password.length < 8) {
    return res.status(400).json({ error: 'DNI inválido o contraseña demasiado corta (mínimo 8 caracteres)' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO alumnos (nombre, apellido, dni, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, dni, hash]
    );
    res.status(201).json({ message: 'Alumno registrado', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El DNI ya esta registrado' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
}

async function login(req, res) {
  const dni = String(req.body.dni || '').trim();
  const password = String(req.body.password || '');
  if (!/^\d{7,8}$/.test(dni) || !password) return res.status(400).json({ error: 'DNI y contraseña son obligatorios' });
  try {
    const [rows] = await pool.query('SELECT * FROM alumnos WHERE dni = ? AND activo = 1', [dni]);
    if (rows.length === 0) return res.status(401).json({ error: 'DNI no encontrado' });
    const alumno = rows[0];
    const match = await bcrypt.compare(password, alumno.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = signToken(
      { id: alumno.id, rol: 'alumno' },
    );
    res.json({ token, nombre: alumno.nombre, rol: 'alumno', id: alumno.id });
  } catch (err) {
    console.error('Login alumno error:', err);
    res.status(500).json({ error: 'No se pudo iniciar sesión. Revisá la conexión con la base de datos.' });
  }
}

module.exports = { register, login };
