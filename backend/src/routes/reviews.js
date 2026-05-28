const router = require('express').Router();
const db = require('../db/schema');
const auth = require('../middleware/auth');

router.post('/', auth, (req, res) => {
  const { session_id, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

  const existing = db.prepare('SELECT review_id FROM reviews WHERE session_id = ? AND user_id = ?').get(session_id, req.user.user_id);
  if (existing) {
    db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE review_id = ?').run(rating, comment, existing.review_id);
  } else {
    db.prepare('INSERT INTO reviews (session_id, user_id, rating, comment) VALUES (?,?,?,?)').run(session_id, req.user.user_id, rating, comment);
  }
  res.json({ message: 'Review submitted.' });
});

module.exports = router;
