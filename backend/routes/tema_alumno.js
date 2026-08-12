const express = require('express');
const router = express.Router();
const { inscribirse, obtenerInscripciones, verificarInscripcion } = require('../controllers/tema_alumno.controller');

router.post('/', inscribirse);
router.get('/alumno/:alumnoId', obtenerInscripciones);
router.get('/verificar', verificarInscripcion);

module.exports = router;
