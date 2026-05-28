const router = require('express').Router();
const db = require('../db/schema');

router.get('/', (req, res) => {
  const trainers = db.prepare(`
    SELECT t.trainer_id, u.name, u.profile_photo, t.bio, t.specialization, t.certifications,
           COUNT(DISTINCT cs.session_id) AS session_count,
           ROUND(AVG(r.rating), 1) AS avg_rating,
           COUNT(DISTINCT r.review_id) AS review_count
    FROM trainers t
    JOIN users u ON t.user_id = u.user_id
    LEFT JOIN class_sessions cs ON cs.trainer_id = t.trainer_id AND cs.status = 'scheduled'
    LEFT JOIN reviews r ON r.session_id = cs.session_id
    WHERE u.is_active = 1
    GROUP BY t.trainer_id ORDER BY u.name
  `).all();
  res.json(trainers);
});

router.get('/:id', (req, res) => {
  const trainer = db.prepare(`
    SELECT t.trainer_id, u.name, u.profile_photo, t.bio, t.specialization, t.certifications,
           ROUND(AVG(r.rating), 1) AS avg_rating,
           COUNT(DISTINCT r.review_id) AS review_count
    FROM trainers t
    JOIN users u ON t.user_id = u.user_id
    LEFT JOIN class_sessions cs ON cs.trainer_id = t.trainer_id
    LEFT JOIN reviews r ON r.session_id = cs.session_id
    WHERE t.trainer_id = ? AND u.is_active = 1
    GROUP BY t.trainer_id
  `).get(req.params.id);

  if (!trainer) return res.status(404).json({ message: 'Trainer not found.' });

  const sessions = db.prepare(`
    SELECT cs.session_id, cs.session_date, cs.start_time, cs.end_time,
           cc.title, cc.type, cc.duration_minutes, cc.capacity, cc.room,
           COUNT(e.enrollment_id) AS enrolled_count
    FROM class_sessions cs
    JOIN class_catalog cc ON cs.class_id = cc.class_id
    LEFT JOIN enrollments e ON e.session_id = cs.session_id AND e.status = 'enrolled'
    WHERE cs.trainer_id = ? AND cs.status = 'scheduled' AND cs.session_date >= DATE('now')
    GROUP BY cs.session_id ORDER BY cs.session_date, cs.start_time
  `).all(req.params.id);

  const reviews = db.prepare(`
    SELECT r.rating, r.comment, r.created_at, u.name AS reviewer_name, cc.title AS class_title
    FROM reviews r
    JOIN class_sessions cs ON r.session_id = cs.session_id
    JOIN class_catalog cc ON cs.class_id = cc.class_id
    JOIN users u ON r.user_id = u.user_id
    WHERE cs.trainer_id = ?
    ORDER BY r.created_at DESC LIMIT 10
  `).all(req.params.id);

  res.json({ ...trainer, sessions, reviews });
});

module.exports = router;
