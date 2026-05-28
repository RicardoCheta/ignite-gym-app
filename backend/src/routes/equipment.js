const router = require('express').Router();
const db = require('../db/schema');

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM equipment ORDER BY category, name').all());
});

module.exports = router;
