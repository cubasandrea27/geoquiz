const express = require('express');
const router = express.Router();
const { listar, obtenerPorId, obtenerTemas } = require('../controllers/carreras.controller');

router.get('/', listar);
router.get('/:id', obtenerPorId);
router.get('/:id/temas', obtenerTemas);

module.exports = router;
