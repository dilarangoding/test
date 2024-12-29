const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/favorites', favoriteController.getFavorites);
router.post('/favorites', favoriteController.addFavorite);
router.delete('/favorites/:cafeId', favoriteController.removeFavorite);
router.get('/favorites/:cafeId/check', favoriteController.checkFavorite);

module.exports = router;
