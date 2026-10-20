const bcrypt = require('bcrypt');
const pool = require('../utils/db');
const { parseCsv } = require('../utils/csv');

const ALIAS_PASSWORD = new Set(['password', 'contrasena', 'clave']);

function obtenerCsv(req) {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body.csv === 'string') return req.body.csv;
  return '';
}

function obtenerValor(row, nombres) {
  for (const nombre of nombres) {
    if (row[nombre] !== undefined) return String(row[nombre]).trim();
  }
  return '';
}

async function importarAlumnos(req, res) {
  const csv = obtenerCsv(req);
  if (!csv.trim()) {
    return res.status(400).json({ error: 'Enviá un archivo CSV o el campo csv con contenido' });
  }
  if (Buffer.byteLength(csv, 'utf8') > 2 * 1024 * 1024) {
    return res.status(413).json({ error: 'El archivo CSV no puede superar los 2 MB' });
  }

  const { headers, rows } = parseCsv(csv);
  const requeridos = ['nombre', 'apellido', 'dni'];
  const faltantes = requeridos.filter(header => !headers.includes(header));
  const tienePassword = headers.some(header => ALIAS_PASSWORD.has(header));
  if (faltantes.length || !tienePassword) {
    return res.status(400).json({
      error: 'El CSV debe incluir las columnas nombre, apellido, dni y password'
    });
  }
  if (rows.length > 1000) {
    return res.status(400).json({ error: 'El CSV no puede contener más de 1000 alumnos por importación' });
  }

  const connection = await pool.getConnection();
  const resultado = { total: rows.length, importados: 0, omitidos: 0, errores: [] };
  const dnisVistos = new Set();

  try {
    await connection.beginTransaction();
    const [existentes] = await connection.query('SELECT dni FROM alumnos');
    existentes.forEach(alumno => dnisVistos.add(String(alumno.dni)));

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const linea = index + 2;
      const nombre = obtenerValor(row, ['nombre']);
      const apellido = obtenerValor(row, ['apellido']);
      const dni = obtenerValor(row, ['dni']);
      const password = obtenerValor(row, [...ALIAS_PASSWORD]);

      if (!nombre || !apellido || !/^\d{7,8}$/.test(dni) || password.length < 8) {
        resultado.omitidos += 1;
        resultado.errores.push({ linea, dni, error: 'Nombre, apellido, DNI válido y contraseña de 8 caracteres son obligatorios' });
        continue;
      }
      if (dnisVistos.has(dni)) {
        resultado.omitidos += 1;
        resultado.errores.push({ linea, dni, error: 'El DNI ya existe o está repetido en el archivo' });
        continue;
      }

      try {
        const hash = await bcrypt.hash(password, 10);
        const [insertado] = await connection.query(
          'INSERT INTO alumnos (nombre, apellido, dni, password) VALUES (?, ?, ?, ?)',
          [nombre, apellido, dni, hash]
        );
        if (!insertado.affectedRows) {
          resultado.omitidos += 1;
          resultado.errores.push({ linea, dni, error: 'No se pudo insertar el alumno' });
          continue;
        }
        dnisVistos.add(dni);
        resultado.importados += 1;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          resultado.omitidos += 1;
          resultado.errores.push({ linea, dni, error: 'El DNI ya existe' });
        } else {
          throw error;
        }
      }
    }

    await connection.commit();
    res.status(201).json({
      message: 'Importación finalizada',
      ...resultado
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al importar alumnos:', error);
    res.status(500).json({ error: 'No se pudo completar la importación' });
  } finally {
    connection.release();
  }
}

module.exports = { importarAlumnos };
