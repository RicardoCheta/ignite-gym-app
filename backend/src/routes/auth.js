const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/schema');

const JWT_SECRET = process.env.JWT_SECRET || 'ignite-gym-secret-key';
const sign = (user) => jwt.sign({ user_id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Fill in all fields.' });

  const user = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ message: 'Invalid credentials.' });

  const { password_hash, ...safeUser } = user;
  res.json({ token: sign(user), user: safeUser });
});

router.post('/register', (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) return res.status(400).json({ message: 'Fill in all fields.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const exists = db.prepare('SELECT user_id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (exists) return res.status(409).json({ message: 'Username or email already taken.' });

  const hash = bcrypt.hashSync(password, 12);
  const result = db.prepare('INSERT INTO users (username, email, password_hash, name) VALUES (?,?,?,?)').run(username, email, hash, name);
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(result.lastInsertRowid);
  const { password_hash, ...safeUser } = user;
  res.status(201).json({ token: sign(user), user: safeUser });
});

module.exports = router;
