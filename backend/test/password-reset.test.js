const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createPasswordResetToken,
  hashPasswordResetToken,
  getPasswordResetTtlMinutes
} = require('../utils/password-reset');

test('genera un token de recuperación y almacena solo su hash', () => {
  const { token, tokenHash } = createPasswordResetToken();

  assert.match(token, /^[a-f0-9]{64}$/);
  assert.match(tokenHash, /^[a-f0-9]{64}$/);
  assert.equal(hashPasswordResetToken(token), tokenHash);
  assert.notEqual(token, tokenHash);
});

test('usa el TTL configurado para los tokens de recuperación', () => {
  const anterior = process.env.RESET_TOKEN_TTL_MINUTES;
  process.env.RESET_TOKEN_TTL_MINUTES = '45';

  assert.equal(getPasswordResetTtlMinutes(), 45);

  if (anterior === undefined) delete process.env.RESET_TOKEN_TTL_MINUTES;
  else process.env.RESET_TOKEN_TTL_MINUTES = anterior;
});
