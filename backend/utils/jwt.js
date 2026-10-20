const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('JWT_SECRET debe estar configurado y tener al menos 32 caracteres en producción');
  }
  return secret || 'geoquiz-secret-local-only';
}

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  });
}

module.exports = { getJwtSecret, signToken };
