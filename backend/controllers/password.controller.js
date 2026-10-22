const bcrypt = require('bcrypt');
const pool = require('../utils/db');
const {
  getPasswordResetTtlMinutes,
  createPasswordResetToken,
  hashPasswordResetToken
} = require('../utils/password-reset');

const GENERIC_MESSAGE = 'Si los datos corresponden a una cuenta, se generaron instrucciones para restablecer la contraseña.';

function normalizarCredencial(valor) {
  return String(valor || '').trim().toLowerCase();
}

async function buscarUsuario(credencial) {
  if (/^\d{7,8}$/.test(credencial)) {
    const [rows] = await pool.query(
      'SELECT id, dni AS identificador FROM alumnos WHERE dni = ? AND activo = 1 LIMIT 1',
      [credencial]
    );
    return rows[0] ? { tipo: 'alumno', ...rows[0] } : null;
  }

  if (/^\S+@\S+\.\S+$/.test(credencial)) {
    const [rows] = await pool.query(
      'SELECT id, email AS identificador FROM docentes WHERE email = ? AND activo = 1 LIMIT 1',
      [credencial]
    );
    return rows[0] ? { tipo: 'docente', ...rows[0] } : null;
  }

  return null;
}

async function solicitarRecuperacion(req, res) {
  const credencial = normalizarCredencial(req.body?.credencial);

  if (!credencial) {
    return res.status(400).json({ error: 'Ingresá un DNI o email válido' });
  }

  try {
    const usuario = await buscarUsuario(credencial);
    const respuesta = { message: GENERIC_MESSAGE };

    if (usuario) {
      const { token, tokenHash } = createPasswordResetToken();
      const ttlMinutes = getPasswordResetTtlMinutes();

      await pool.query(
        `UPDATE recuperacion_password
         SET usado_en = NOW()
         WHERE usuario_tipo = ? AND usuario_id = ? AND usado_en IS NULL`,
        [usuario.tipo, usuario.id]
      );

      await pool.query(
        `INSERT INTO recuperacion_password
         (usuario_tipo, usuario_id, token_hash, vence_en)
         VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
        [usuario.tipo, usuario.id, tokenHash, ttlMinutes]
      );

      // En desarrollo se puede usar el token para probar el flujo sin un proveedor de correo.
      // Nunca se expone por defecto ni cuando NODE_ENV=production.
      if (process.env.NODE_ENV !== 'production' && process.env.RESET_EXPOSE_TOKEN === 'true') {
        respuesta.resetToken = token;
        respuesta.expiresInMinutes = ttlMinutes;
      }
    }

    return res.json(respuesta);
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    return res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
}

async function restablecerPassword(req, res) {
  const token = String(req.body?.token || '').trim();
  const nuevaPassword = String(req.body?.nuevaPassword || req.body?.password || '');

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return res.status(400).json({ error: 'El token de recuperación no es válido' });
  }
  if (nuevaPassword.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const tokenHash = hashPasswordResetToken(token);
    const [tokens] = await connection.query(
      `SELECT id, usuario_tipo, usuario_id
       FROM recuperacion_password
       WHERE token_hash = ? AND usado_en IS NULL AND vence_en > NOW()
       LIMIT 1
       FOR UPDATE`,
      [tokenHash]
    );

    if (!tokens.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'El token es inválido o ya venció' });
    }

    const reset = tokens[0];
    const tabla = reset.usuario_tipo === 'docente' ? 'docentes' : reset.usuario_tipo === 'alumno' ? 'alumnos' : null;
    if (!tabla) {
      await connection.rollback();
      return res.status(400).json({ error: 'El token no corresponde a un usuario válido' });
    }

    const hash = await bcrypt.hash(nuevaPassword, 10);
    const [actualizado] = await connection.query(
      `UPDATE ${tabla} SET password = ? WHERE id = ? AND activo = 1`,
      [hash, reset.usuario_id]
    );

    if (!actualizado.affectedRows) {
      await connection.rollback();
      return res.status(404).json({ error: 'La cuenta ya no está disponible' });
    }

    await connection.query(
      'UPDATE recuperacion_password SET usado_en = NOW() WHERE id = ?',
      [reset.id]
    );
    await connection.commit();

    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ error: 'No se pudo restablecer la contraseña' });
  } finally {
    connection.release();
  }
}

module.exports = { solicitarRecuperacion, restablecerPassword };
