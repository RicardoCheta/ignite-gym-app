const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/classes',   require('./routes/classes'));
app.use('/api/trainers',  require('./routes/trainers'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/profile',   require('./routes/profile'));
app.use('/api/reviews',   require('./routes/reviews'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Ignite API running on port ${PORT}`));
