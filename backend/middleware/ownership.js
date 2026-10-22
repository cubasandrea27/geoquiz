const pool = require('../utils/db');

async function docentePoseeTema(temaId, docenteId, { activo = false } = {}) {
  const activoSql = activo ? ' AND activo = 1' : '';
  const [rows] = await pool.query(
    `SELECT 1 FROM temas WHERE id = ? AND docente_id = ?${activoSql} LIMIT 1`,
    [temaId, docenteId]
  );
  return rows.length > 0;
}

async function docentePoseePregunta(preguntaId, docenteId, { activo = false } = {}) {
  const activoSql = activo ? ' AND p.activo = 1 AND t.activo = 1' : '';
  const [rows] = await pool.query(
    `SELECT 1
     FROM preguntas p
     JOIN temas t ON t.id = p.tema_id
     WHERE p.id = ? AND t.docente_id = ?${activoSql}
     LIMIT 1`,
    [preguntaId, docenteId]
  );
  return rows.length > 0;
}

async function docentePoseeUbicacion(ubicacionId, docenteId, { activo = false } = {}) {
  const activoSql = activo ? ' AND u.activo = 1 AND t.activo = 1' : '';
  const [rows] = await pool.query(
    `SELECT 1
     FROM ubicaciones u
     JOIN temas t ON t.id = u.tema_id
     WHERE u.id = ? AND t.docente_id = ?${activoSql}
     LIMIT 1`,
    [ubicacionId, docenteId]
  );
  return rows.length > 0;
}

module.exports = { docentePoseeTema, docentePoseePregunta, docentePoseeUbicacion };
