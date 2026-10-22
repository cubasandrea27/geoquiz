const pool = require('../utils/db');
const bcrypt = require('bcrypt');

async function list(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, nombre, apellido, email, dni, activo, created_at
       FROM docentes WHERE activo = 1 ORDER BY apellido, nombre`
    );
    const [alumnos] = await pool.query(
      `SELECT id, nombre, apellido, dni, activo, created_at
       FROM alumnos WHERE activo = 1 ORDER BY apellido, nombre`
    );
    res.json({ docentes: rows, alumnos });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'No se pudieron listar los usuarios' });
  }
}

async function create(req, res) {
  const { rol, nombre, apellido, email, dni, password } = req.body;
  if (!['docente', 'alumno'].includes(rol) || !nombre || !apellido || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o el rol no es válido' });
  }
  if (rol === 'docente' && !email) return res.status(400).json({ error: 'El email es obligatorio para docentes' });
  if (rol === 'alumno' && !dni) return res.status(400).json({ error: 'El DNI es obligatorio para alumnos' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const table = rol === 'docente' ? 'docentes' : 'alumnos';
    const fields = rol === 'docente' ? ['nombre', 'apellido', 'email', 'password'] : ['nombre', 'apellido', 'dni', 'password'];
    const values = rol === 'docente' ? [nombre.trim(), apellido.trim(), email.trim(), hash] : [nombre.trim(), apellido.trim(), dni.trim(), hash];
    const [result] = await pool.query(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (?, ?, ?, ?)`, values);
    res.status(201).json({ id: result.insertId, rol, message: 'Usuario creado' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'No se pudo crear el usuario' });
  }
}

async function update(req, res) {
  const { id, rol, nombre, apellido, email, dni, activo } = req.body;
  const table = rol === 'docente' ? 'docentes' : 'alumnos';
  const fields = rol === 'docente' ? ['nombre = ?', 'apellido = ?', 'email = ?', 'activo = ?'] : ['nombre = ?', 'apellido = ?', 'dni = ?', 'activo = ?'];
  const values = rol === 'docente' ? [nombre, apellido, email, activo === undefined ? 1 : Number(activo), id] : [nombre, apellido, dni, activo === undefined ? 1 : Number(activo), id];

  if (!id || !nombre || !apellido) return res.status(400).json({ error: 'Faltan datos obligatorios' });
  try {
    const [result] = await pool.query(`UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?`, values);
    if (!result.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario actualizado' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'No se pudo actualizar el usuario' });
  }
}

async function remove(req, res) {
  const { id, rol } = req.body;
  if (!id || !['docente', 'alumno'].includes(rol)) return res.status(400).json({ error: 'Faltan datos válidos' });
  try {
    const table = rol === 'docente' ? 'docentes' : 'alumnos';
    const [result] = await pool.query(`UPDATE ${table} SET activo = 0 WHERE id = ?`, [id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'No se pudo desactivar el usuario' });
  }
}

module.exports = { list, create, update, remove };
