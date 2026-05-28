const router = require('express').Router();
const db = require('../db/schema');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const user = db.prepare('SELECT user_id, username, email, name, role, profile_photo FROM users WHERE user_id = ?').get(req.user.user_id);

  const enrollments = db.prepare(`
    SELECT cs.session_id, cc.title, cs.session_date, cs.start_time, cs.end_time, cc.room,
           u.name AS trainer_name
    FROM enrollments e
    JOIN class_sessions cs ON e.session_id = cs.session_id
    JOIN class_catalog cc ON cs.class_id = cc.class_id
    JOIN trainers t ON cs.trainer_id = t.trainer_id
    JOIN users u ON t.user_id = u.user_id
    WHERE e.user_id = ? AND e.status = 'enrolled' AND cs.session_date >= DATE('now')
    ORDER BY cs.session_date, cs.start_time
  `).all(req.user.user_id);

  const pastClasses = db.prepare(`
    SELECT cs.session_id, cc.title, cs.session_date,
           EXISTS(SELECT 1 FROM reviews r WHERE r.session_id = cs.session_id AND r.user_id = ?) AS has_review
    FROM enrollments e
    JOIN class_sessions cs ON e.session_id = cs.session_id
    JOIN class_catalog cc ON cs.class_id = cc.class_id
    WHERE e.user_id = ? AND (e.status = 'attended' OR (cs.session_date < DATE('now') AND e.status = 'enrolled'))
    ORDER BY cs.session_date DESC
  `).all(req.user.user_id, req.user.user_id);

  res.json({ ...user, enrollments, pastClasses });
});

router.put('/', auth, (req, res) => {
  const { name, email } = req.body;
  db.prepare('UPDATE users SET name = ?, email = ? WHERE user_id = ?').run(name, email, req.user.user_id);
  res.json({ message: 'Profile updated.' });
});

module.exports = router;
