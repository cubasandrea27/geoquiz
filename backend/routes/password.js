const express = require('express');
const {
  solicitarRecuperacion,
  restablecerPassword
} = require('../controllers/password.controller');

const router = express.Router();

router.post('/solicitar', solicitarRecuperacion);
router.post('/restablecer', restablecerPassword);

module.exports = router;
