const express = require('express');
const { login } = require('../services/login');

const router = express.Router();

// Endpoint untuk login
router.post('/api/v1/login', login);

module.exports = router;
