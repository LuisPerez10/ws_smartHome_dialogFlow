const { Router } = require('express');
const router = Router();
const { webhook } = require('../controllers/webhooks');

router.post('/', webhook);

module.exports = router;