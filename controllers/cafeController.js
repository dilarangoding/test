const db = require('../config/db');

exports.getCafes = (req, res) => {
  const sql = 'SELECT * FROM cafes';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching cafes:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
    res.status(200).json(results);
  });
};

exports.getCafeById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM cafes WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching cafe by ID:', err);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Kafe tidak ditemukan' });
    }
    res.status(200).json(results[0]); // Kirim data kafe spesifik
  });
};
