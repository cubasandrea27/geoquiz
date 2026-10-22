const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../utils/jwt');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Se requiere una sesión válida' });

  try {
    req.user = jwt.verify(token, getJwtSecret());
    if (!req.user.id || !['docente', 'alumno'].includes(req.user.rol)) {
      return res.status(401).json({ error: 'El token no contiene una identidad válida' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'La sesión ha expirado o es inválida' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para realizar esta operación' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
