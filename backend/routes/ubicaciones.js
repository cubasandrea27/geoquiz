const express = require('express');
const router  = express.Router();
const { list, create, createWithQuestion, update, remove } = require('../controllers/ubicaciones.controller');

router.get('/', list);
router.post('/con-pregunta', createWithQuestion);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
