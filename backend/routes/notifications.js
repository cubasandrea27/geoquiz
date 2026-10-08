const express = require('express');
const router = express.Router();
const { list, create, markRead } = require('../controllers/notifications.controller');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, list);
router.post('/', authenticate, requireRole('docente'), create);
router.patch('/:id/leida', authenticate, markRead);

module.exports = router;
