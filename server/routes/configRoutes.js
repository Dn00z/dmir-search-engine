const express = require('express');
const { index } = require('../elasticsearch/services');
const router = express.Router();

router.post('/index', index);

module.exports = router;