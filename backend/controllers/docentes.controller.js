const pool    = require('../utils/db');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'geoquiz-secret-local';
}

async function register(req, res) {
  const { nombre, apellido, email, password } = req.body;
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO docentes (nombre, apellido, email, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, email, hash]
    );
    res.status(201).json({ message: 'Docente registrado', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya est� registrado' });
    }
    res.status(500).json({ error: 'Error interno' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contrase�a obligatorios' });
  try {
    const [rows] = await pool.query('SELECT * FROM docentes WHERE email = ? AND activo = 1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email no encontrado' });
    const docente = rows[0];
    const match = await bcrypt.compare(password, docente.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { id: docente.id, rol: 'docente' },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
    res.json({ token, nombre: docente.nombre, rol: 'docente', id: docente.id });
  } catch (err) {
    console.error('Login docente error:', err);
    res.status(500).json({ error: 'No se pudo iniciar sesión. Revisá la conexión con la base de datos.' });
  }
}

module.exports = { register, login };
