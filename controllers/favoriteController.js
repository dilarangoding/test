const db = require('../config/db');

const favoriteController = {
  // Get all favorites for logged in user
  getFavorites: async (req, res) => {
      try {
          const userId = req.user.id;

          const favorites = await db.query(
              `SELECT c.* FROM cafes c
               INNER JOIN favorites f ON c.id = f.cafe_id
               WHERE f.user_id = $1
               ORDER BY f.created_at DESC`,
              [userId]
          );

          res.json({
              status: 'success',
              data: favorites.rows
          });
      } catch (error) {
          console.error('Error in getFavorites:', error);
          res.status(500).json({
              status: 'error',
              message: 'Failed to get favorites'
          });
      }
  },

  // Add cafe to favorites
  addFavorite: async (req, res) => {
      try {
          const { cafeId } = req.body;
          const userId = req.user.id;

          // Validate cafeId
          if (!cafeId) {
              return res.status(400).json({
                  status: 'error',
                  message: 'Cafe ID is required'
              });
          }

          // Check if already in favorites
          const existingFavorite = await db.query(
              'SELECT id FROM favorites WHERE user_id = $1 AND cafe_id = $2',
              [userId, cafeId]
          );

          if (existingFavorite.rows.length > 0) {
              return res.status(400).json({
                  status: 'error',
                  message: 'Cafe already in favorites'
              });
          }

          // Add to favorites
          await db.query(
              'INSERT INTO favorites (user_id, cafe_id) VALUES ($1, $2)',
              [userId, cafeId]
          );

          res.json({
              status: 'success',
              message: 'Added to favorites successfully'
          });
      } catch (error) {
          console.error('Error in addFavorite:', error);
          res.status(500).json({
              status: 'error',
              message: 'Failed to add favorite'
          });
      }
  },

  // Remove cafe from favorites
  removeFavorite: async (req, res) => {
      try {
          const { cafeId } = req.params;
          const userId = req.user.id;

          const result = await db.query(
              'DELETE FROM favorites WHERE user_id = $1 AND cafe_id = $2 RETURNING *',
              [userId, cafeId]
          );

          if (result.rows.length === 0) {
              return res.status(404).json({
                  status: 'error',
                  message: 'Favorite not found'
              });
          }

          res.json({
              status: 'success',
              message: 'Removed from favorites successfully'
          });
      } catch (error) {
          console.error('Error in removeFavorite:', error);
          res.status(500).json({
              status: 'error',
              message: 'Failed to remove favorite'
          });
      }
  },

  // Check if cafe is in favorites
  checkFavorite: async (req, res) => {
      try {
          const { cafeId } = req.params;
          const userId = req.user.id;

          const favorite = await db.query(
              'SELECT id FROM favorites WHERE user_id = $1 AND cafe_id = $2',
              [userId, cafeId]
          );

          res.json({
              status: 'success',
              isFavorite: favorite.rows.length > 0
          });
      } catch (error) {
          console.error('Error in checkFavorite:', error);
          res.status(500).json({
              status: 'error',
              message: 'Failed to check favorite status'
          });
      }
  }
};

module.exports = favoriteController;
