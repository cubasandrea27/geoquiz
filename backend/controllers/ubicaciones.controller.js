const pool = require('../utils/db');
const { docentePoseeTema, docentePoseeUbicacion } = require('../middleware/ownership');

function validarCoordenadas(latitud, longitud, radio) {
  const lat = Number(latitud);
  const lng = Number(longitud);
  const metros = Number(radio);
  return Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    Number.isFinite(lng) && lng >= -180 && lng <= 180 &&
    Number.isFinite(metros) && metros > 0 && metros <= 100000;
}

async function list(req, res) {
  const temaId = req.query.temaId;

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.tema_id, u.nombre, u.latitud, u.longitud, u.radio_metros
       FROM ubicaciones u
       JOIN temas t ON t.id = u.tema_id
       WHERE u.tema_id = ? AND t.docente_id = ? AND u.activo = 1
       ORDER BY u.id DESC`,
      [temaId, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function create(req, res) {
  const { temaId, nombre, latitud, longitud, radio_metros } = req.body;

  const radio = radio_metros == null ? 50 : Number(radio_metros);
  if (!temaId || latitud == null || longitud == null || !validarCoordenadas(latitud, longitud, radio)) {
    return res.status(400).json({ error: 'Tema, latitud y longitud son obligatorios' });
  }

  try {
    if (!(await docentePoseeTema(temaId, req.user.id, { activo: true }))) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    const [result] = await pool.query(
      'INSERT INTO ubicaciones (tema_id, nombre, latitud, longitud, radio_metros) VALUES (?, ?, ?, ?, ?)',
      [temaId, nombre || null, Number(latitud), Number(longitud), radio]
    );

    res.status(201).json({ message: 'Ubicación creada', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function createWithQuestion(req, res) {
  const {
    temaId,
    nombre,
    latitud,
    longitud,
    radio_metros,
    ubicacionId,
    enunciado,
    opciones,
    respuestaCorrecta
  } = req.body;

  const radio = radio_metros == null ? 50 : Number(radio_metros);
  const opcionesValidas = Array.isArray(opciones) && opciones.length === 3 &&
    opciones.every((opcion) => typeof opcion === 'string' && opcion.trim().length > 0);
  const correctaValida = Number.isInteger(Number(respuestaCorrecta)) && Number(respuestaCorrecta) >= 1 && Number(respuestaCorrecta) <= 3;

  if (!temaId || latitud == null || longitud == null || !validarCoordenadas(latitud, longitud, radio) || !enunciado ||
      !opcionesValidas || !correctaValida) {
    return res.status(400).json({ error: 'Completá ubicación, pregunta y las 3 opciones' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [temas] = await connection.query(
      'SELECT id FROM temas WHERE id = ? AND docente_id = ? AND activo = 1',
      [temaId, req.user.id]
    );

    if (!temas.length) {
      await connection.rollback();
      return res.status(400).json({ error: 'El tema no existe o está inactivo' });
    }

    let ubicacionSeleccionada = ubicacionId;

    if (ubicacionSeleccionada) {
      const [ubicaciones] = await connection.query(
        'SELECT id FROM ubicaciones WHERE id = ? AND tema_id = ? AND activo = 1',
        [ubicacionSeleccionada, temaId]
      );

      if (!ubicaciones.length) {
        await connection.rollback();
        return res.status(400).json({ error: 'La ubicación seleccionada no pertenece al tema' });
      }
    } else {
      const [ubicacion] = await connection.query(
        `INSERT INTO ubicaciones (tema_id, nombre, latitud, longitud, radio_metros)
         VALUES (?, ?, ?, ?, ?)`,
        [temaId, nombre || null, Number(latitud), Number(longitud), radio]
      );
      ubicacionSeleccionada = ubicacion.insertId;
    }

    const [pregunta] = await connection.query(
      'INSERT INTO preguntas (tema_id, ubicacion_id, enunciado) VALUES (?, ?, ?)',
      [temaId, ubicacionSeleccionada, enunciado]
    );

    const valoresOpciones = opciones.map((texto, index) => [
      pregunta.insertId,
      texto.trim(),
      index + 1 === Number(respuestaCorrecta) ? 1 : 0
    ]);

    await connection.query(
      'INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES ?',
      [valoresOpciones]
    );

    await connection.commit();
    res.status(201).json({
      message: 'Ubicación y pregunta guardadas correctamente',
      ubicacionId: ubicacionSeleccionada,
      preguntaId: pregunta.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar ubicación y pregunta:', error);
    res.status(500).json({ error: 'No se pudieron guardar la ubicación y la pregunta' });
  } finally {
    connection.release();
  }
}

async function assignQuestionWithLocation(req, res) {
  const { preguntaId, nombre, latitud, longitud, radio_metros } = req.body;
  const radio = radio_metros == null ? 50 : Number(radio_metros);
  const pregunta = Number(preguntaId);

  if (!Number.isInteger(pregunta) || pregunta <= 0 || latitud == null || longitud == null ||
      !validarCoordenadas(latitud, longitud, radio)) {
    return res.status(400).json({ error: 'Pregunta, latitud y longitud son obligatorias' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [preguntas] = await connection.query(`
      SELECT p.id, p.tema_id
      FROM preguntas p
      JOIN temas t ON t.id = p.tema_id
      WHERE p.id = ? AND p.activo = 1 AND t.activo = 1 AND t.docente_id = ?
      LIMIT 1
    `, [pregunta, req.user.id]);

    if (!preguntas.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    const [ubicacion] = await connection.query(
      `INSERT INTO ubicaciones (tema_id, nombre, latitud, longitud, radio_metros)
       VALUES (?, ?, ?, ?, ?)`,
      [preguntas[0].tema_id, nombre || null, Number(latitud), Number(longitud), radio]
    );

    await connection.query(
      'UPDATE preguntas SET ubicacion_id = ? WHERE id = ? AND activo = 1',
      [ubicacion.insertId, pregunta]
    );

    await connection.commit();
    return res.status(201).json({
      message: 'Ubicación creada y asignada correctamente',
      ubicacionId: ubicacion.insertId,
      preguntaId: pregunta
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al asignar ubicación a la pregunta:', error);
    return res.status(500).json({ error: 'No se pudo crear y asignar la ubicación' });
  } finally {
    connection.release();
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { nombre, latitud, longitud, radio_metros } = req.body;

  const radio = radio_metros == null ? 50 : Number(radio_metros);
  if (latitud == null || longitud == null || !validarCoordenadas(latitud, longitud, radio)) {
    return res.status(400).json({ error: 'Latitud y longitud son obligatorias' });
  }

  try {
    if (!(await docentePoseeUbicacion(id, req.user.id, { activo: true }))) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    const [result] = await pool.query(
      'UPDATE ubicaciones SET nombre = ?, latitud = ?, longitud = ?, radio_metros = ? WHERE id = ? AND activo = 1',
      [nombre || null, Number(latitud), Number(longitud), radio, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    res.json({ message: 'Ubicación actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    if (!(await docentePoseeUbicacion(id, req.user.id, { activo: true }))) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    const [result] = await pool.query(
      'UPDATE ubicaciones SET activo = 0 WHERE id = ? AND activo = 1',
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Ubicación no encontrada' });
    }

    res.json({ message: 'Ubicación eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { list, create, createWithQuestion, assignQuestionWithLocation, update, remove };
