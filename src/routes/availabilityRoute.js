const express = require('express');
const router = express.Router();
const { createAvailability, checkAvailability } = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, createAvailability);

router.get('/:professor/:date', authMiddleware, checkAvailability);

module.exports = router;