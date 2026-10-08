const express = require('express');
const router = express.Router();
const { list, create, update, remove } = require('../controllers/usuarios.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, requireRole('docente'), list);
router.post('/', authenticate, requireRole('docente'), create);
router.put('/', authenticate, requireRole('docente'), update);
router.delete('/', authenticate, requireRole('docente'), remove);

module.exports = router;
