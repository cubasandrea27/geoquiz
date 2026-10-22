const crypto = require('crypto');

const DEFAULT_TTL_MINUTES = 30;

function getPasswordResetTtlMinutes() {
  const configured = Number(process.env.RESET_TOKEN_TTL_MINUTES);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TTL_MINUTES;
}

function createPasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

function hashPasswordResetToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

module.exports = {
  getPasswordResetTtlMinutes,
  createPasswordResetToken,
  hashPasswordResetToken
};
