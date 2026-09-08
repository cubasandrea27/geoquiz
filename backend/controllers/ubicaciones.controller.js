const pool = require('../utils/db');

async function list(req, res) {
  const temaId = req.query.temaId;

  if (!temaId) {
    return res.status(400).json({ error: 'Falta el temaId' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, tema_id, nombre, latitud, longitud, radio_metros FROM ubicaciones WHERE tema_id = ? AND activo = 1 ORDER BY id DESC',
      [temaId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
}

async function create(req, res) {
  const { temaId, nombre, latitud, longitud, radio_metros } = req.body;

  if (!temaId || latitud == null || longitud == null) {
    return res.status(400).json({ error: 'Tema, latitud y longitud son obligatorios' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO ubicaciones (tema_id, nombre, latitud, longitud, radio_metros) VALUES (?, ?, ?, ?, ?)',
      [temaId, nombre || null, latitud, longitud, radio_metros || 50]
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

  if (!temaId || latitud == null || longitud == null || !enunciado ||
      !Array.isArray(opciones) || opciones.length !== 3 || !respuestaCorrecta) {
    return res.status(400).json({ error: 'Completá ubicación, pregunta y las 3 opciones' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [temas] = await connection.query(
      'SELECT id FROM temas WHERE id = ? AND activo = 1',
      [temaId]
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
        [temaId, nombre || null, latitud, longitud, radio_metros || 50]
      );
      ubicacionSeleccionada = ubicacion.insertId;
    }

    const [pregunta] = await connection.query(
      'INSERT INTO preguntas (tema_id, ubicacion_id, enunciado) VALUES (?, ?, ?)',
      [temaId, ubicacionSeleccionada, enunciado]
    );

    const valoresOpciones = opciones.map((texto, index) => [
      pregunta.insertId,
      texto,
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

async function update(req, res) {
  const { id } = req.params;
  const { nombre, latitud, longitud, radio_metros } = req.body;

  if (latitud == null || longitud == null) {
    return res.status(400).json({ error: 'Latitud y longitud son obligatorias' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE ubicaciones SET nombre = ?, latitud = ?, longitud = ?, radio_metros = ? WHERE id = ? AND activo = 1',
      [nombre || null, latitud, longitud, radio_metros || 50, id]
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

module.exports = { list, create, createWithQuestion, update, remove };
