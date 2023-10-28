const express = require('express');
const { search, getSeacrchKeywrords } = require('../elasticsearch/services');
const router = express.Router();

router
    .post('/', search)
    .get('/keywords', getSeacrchKeywrords);


module.exports = router;