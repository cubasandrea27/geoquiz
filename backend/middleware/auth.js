const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Se requiere una sesión válida' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'geoquiz-secret-local');
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
