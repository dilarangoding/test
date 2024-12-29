const express = require('express');
const router = express.Router();
const cafeController = require('../controllers/cafeController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/cafes', authenticate, cafeController.getCafes);
router.get('/cafes/:id', cafeController.getCafeById);

module.exports = router;
