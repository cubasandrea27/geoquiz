const pool    = require('../utils/db');
const bcrypt  = require('bcrypt');
const { signToken } = require('../utils/jwt');

async function register(req, res) {
  const nombre = String(req.body.nombre || '').trim();
  const apellido = String(req.body.apellido || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Email inválido o contraseña demasiado corta (mínimo 8 caracteres)' });
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
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email y contrase�a obligatorios' });
  try {
    const [rows] = await pool.query('SELECT * FROM docentes WHERE email = ? AND activo = 1', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Email no encontrado' });
    const docente = rows[0];
    const match = await bcrypt.compare(password, docente.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });
    const token = signToken(
      { id: docente.id, rol: 'docente' },
    );
    res.json({ token, nombre: docente.nombre, rol: 'docente', id: docente.id });
  } catch (err) {
    console.error('Login docente error:', err);
    res.status(500).json({ error: 'No se pudo iniciar sesión. Revisá la conexión con la base de datos.' });
  }
}

module.exports = { register, login };
