const router = require('express').Router();
const db = require('../db/schema');
const auth = require('../middleware/auth');

router.get('/', (req, res) => {
  const { type, trainer } = req.query;
  const userId = req.headers.authorization ? (() => {
    try { return require('jsonwebtoken').verify(req.headers.authorization.slice(7), process.env.JWT_SECRET || 'ignite-gym-secret-key').user_id; } catch { return null; }
  })() : null;

  let query = `
    SELECT cs.session_id, cs.session_date, cs.start_time, cs.end_time, cs.status,
           cc.title, cc.type, cc.description, cc.duration_minutes, cc.capacity, cc.room,
           u.name AS trainer_name,
           COUNT(DISTINCT e.enrollment_id) AS enrolled_count,
           ${userId ? `COUNT(DISTINCT ue.enrollment_id)` : '0'} AS user_enrolled
    FROM class_sessions cs
    JOIN class_catalog cc ON cs.class_id = cc.class_id
    JOIN trainers t ON cs.trainer_id = t.trainer_id
    JOIN users u ON t.user_id = u.user_id
    LEFT JOIN enrollments e ON e.session_id = cs.session_id AND e.status = 'enrolled'
    ${userId ? `LEFT JOIN enrollments ue ON ue.session_id = cs.session_id AND ue.user_id = ${userId} AND ue.status = 'enrolled'` : ''}
    WHERE cs.status = 'scheduled' AND cc.is_active = 1 AND cs.session_date >= DATE('now')
  `;
  const params = [];
  if (type) { query += ` AND cc.type = ?`; params.push(type); }
  if (trainer) { query += ` AND cs.trainer_id = ?`; params.push(trainer); }
  query += ` GROUP BY cs.session_id ORDER BY cs.session_date, cs.start_time`;

  res.json(db.prepare(query).all(...params));
});

router.get('/my-enrollments', auth, (req, res) => {
  const enrollments = db.prepare(`
    SELECT cs.session_id, cs.session_date, cs.start_time, cs.end_time,
           cc.title, cc.type, cc.duration_minutes, cc.room,
           u.name AS trainer_name
    FROM enrollments e
    JOIN class_sessions cs ON e.session_id = cs.session_id
    JOIN class_catalog cc ON cs.class_id = cc.class_id
    JOIN trainers t ON cs.trainer_id = t.trainer_id
    JOIN users u ON t.user_id = u.user_id
    WHERE e.user_id = ? AND e.status = 'enrolled'
      AND cs.status = 'scheduled' AND cs.session_date >= DATE('now')
    ORDER BY cs.session_date, cs.start_time
  `).all(req.user.user_id);
  res.json(enrollments);
});

router.post('/enroll', auth, (req, res) => {
  if (req.user.role !== 'member') return res.status(403).json({ message: 'Only members can enroll.' });
  const { session_id } = req.body;

  const session = db.prepare(`
    SELECT cs.session_id, cc.capacity, COUNT(e.enrollment_id) AS enrolled_count
    FROM class_sessions cs JOIN class_catalog cc ON cs.class_id = cc.class_id
    LEFT JOIN enrollments e ON e.session_id = cs.session_id AND e.status = 'enrolled'
    WHERE cs.session_id = ? AND cs.status = 'scheduled'
    GROUP BY cs.session_id
  `).get(session_id);

  if (!session) return res.status(404).json({ message: 'Session not found.' });
  if (session.capacity - session.enrolled_count <= 0) return res.status(409).json({ message: 'Class is full.' });

  const existing = db.prepare('SELECT * FROM enrollments WHERE session_id = ? AND user_id = ?').get(session_id, req.user.user_id);
  if (existing?.status === 'enrolled') return res.status(409).json({ message: 'Already enrolled.' });

  if (existing) {
    db.prepare('UPDATE enrollments SET status = ? WHERE enrollment_id = ?').run('enrolled', existing.enrollment_id);
  } else {
    db.prepare('INSERT INTO enrollments (session_id, user_id) VALUES (?,?)').run(session_id, req.user.user_id);
  }
  res.json({ message: 'Enrolled successfully.' });
});

router.post('/cancel', auth, (req, res) => {
  const { session_id } = req.body;
  db.prepare('UPDATE enrollments SET status = ? WHERE session_id = ? AND user_id = ?').run('cancelled', session_id, req.user.user_id);
  res.json({ message: 'Enrollment cancelled.' });
});

module.exports = router;
