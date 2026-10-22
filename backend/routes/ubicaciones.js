const express = require('express');
const router  = express.Router();
const { list, create, createWithQuestion, assignQuestionWithLocation, update, remove } = require('../controllers/ubicaciones.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate, requireRole('docente'));
router.get('/', list);
router.post('/con-pregunta', createWithQuestion);
router.post('/asignar-pregunta', assignQuestionWithLocation);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
