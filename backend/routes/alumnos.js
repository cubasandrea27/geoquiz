const express  = require('express');
const router   = express.Router();
const { register, login } = require('../controllers/alumnos.controller');
const { importarAlumnos } = require('../controllers/importacion.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.post('/register', register);
router.post('/login',    login);
router.post('/importar', authenticate, requireRole('docente'), importarAlumnos);

module.exports = router;
