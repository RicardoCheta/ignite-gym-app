const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, '../../ignite.db'));

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','trainer','admin')),
    profile_photo TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS trainers (
    trainer_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    bio TEXT,
    specialization TEXT,
    certifications TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS equipment (
    equipment_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','occupied','maintenance')),
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS class_catalog (
    class_id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 20,
    room TEXT,
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS class_sessions (
    session_id INTEGER PRIMARY KEY,
    class_id INTEGER NOT NULL,
    trainer_id INTEGER NOT NULL,
    session_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled','completed')),
    FOREIGN KEY (class_id) REFERENCES class_catalog(class_id),
    FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    enrollment_id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','cancelled','attended')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES class_sessions(session_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE (session_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY,
    session_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES class_sessions(session_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE (session_id, user_id)
  );
`);

// Seed data
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if (userCount === 0) {
  const hash = (p) => bcrypt.hashSync(p, 12);

  db.prepare(`INSERT INTO users (username, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run('admin', 'admin@ignite.gym', hash('admin123'), 'Alberto Admin', 'admin');
  db.prepare(`INSERT INTO users (username, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run('member', 'member@ignite.gym', hash('member123'), 'Maria Member', 'member');
  db.prepare(`INSERT INTO users (username, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run('tiago', 'tiago@ignite.gym', hash('trainer123'), 'Tiago Trainer', 'trainer');
  db.prepare(`INSERT INTO users (username, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run('sofia', 'sofia@ignite.gym', hash('trainer123'), 'Sofia Santos', 'trainer');
  db.prepare(`INSERT INTO users (username, email, password_hash, name, role) VALUES (?,?,?,?,?)`).run('miguel', 'miguel@ignite.gym', hash('trainer123'), 'Miguel Ferreira', 'trainer');

  const tiagoDd = db.prepare(`SELECT user_id FROM users WHERE username='tiago'`).get().user_id;
  const sofiaId = db.prepare(`SELECT user_id FROM users WHERE username='sofia'`).get().user_id;
  const miguelId = db.prepare(`SELECT user_id FROM users WHERE username='miguel'`).get().user_id;

  db.prepare(`INSERT INTO trainers (user_id, bio, specialization, certifications) VALUES (?,?,?,?)`).run(tiagoDd, 'Certified coach focused on strength and conditioning with 8 years of experience.', 'HIIT, Spinning, Strength', 'Level 3 Personal Trainer, CrossFit L1');
  db.prepare(`INSERT INTO trainers (user_id, bio, specialization, certifications) VALUES (?,?,?,?)`).run(sofiaId, 'Passionate about mindful movement and helping members reconnect with their bodies.', 'Yoga, Pilates, Flexibility', 'RYT-200 Yoga Alliance, Pilates Mat Certification');
  db.prepare(`INSERT INTO trainers (user_id, bio, specialization, certifications) VALUES (?,?,?,?)`).run(miguelId, 'Former competitive boxer, now helping members build strength and endurance through boxing.', 'Boxing, Cardio, Conditioning', 'IBBF Certified Coach, Level 2 Fitness Instructor');

  const equipment = [
    ['Treadmill 01', 'cardio', 'available', 'Main floor'],
    ['Treadmill 02', 'cardio', 'occupied', 'Main floor'],
    ['Stationary Bike 01', 'cardio', 'available', 'Main floor'],
    ['Rowing Machine 01', 'cardio', 'available', 'Main floor'],
    ['Bench Press Station', 'strength', 'available', 'Weights area'],
    ['Squat Rack 01', 'strength', 'occupied', 'Weights area'],
    ['Squat Rack 02', 'strength', 'available', 'Weights area'],
    ['Cable Machine 01', 'strength', 'maintenance', 'Weights area'],
    ['Dumbbell Set (5-50 kg)', 'strength', 'available', 'Weights area'],
    ['Yoga Mat Set', 'flexibility', 'available', 'Studio A'],
    ['Resistance Bands Set', 'flexibility', 'available', 'Studio A'],
  ];
  equipment.forEach(([name, cat, status, loc]) =>
    db.prepare(`INSERT INTO equipment (name, category, status, location) VALUES (?,?,?,?)`).run(name, cat, status, loc)
  );

  const classes = [
    ['Morning Yoga', 'yoga', 'Start your day with mindfulness and mobility.', 60, 20, 'Studio A'],
    ['Power HIIT', 'hiit', 'High intensity interval training for all levels.', 45, 16, 'Studio B'],
    ['Sunrise Spinning', 'spinning', 'High-energy cardio cycling session.', 50, 18, 'Studio C'],
    ['Pilates Flow', 'pilates', 'Core strength and flexibility through Pilates.', 60, 15, 'Studio A'],
    ['Boxing Basics', 'boxing', 'Learn boxing fundamentals and build endurance.', 60, 12, 'Studio B'],
  ];
  classes.forEach(([title, type, desc, dur, cap, room]) =>
    db.prepare(`INSERT INTO class_catalog (title, type, description, duration_minutes, capacity, room) VALUES (?,?,?,?,?,?)`).run(title, type, desc, dur, cap, room)
  );

  const tiago = db.prepare(`SELECT trainer_id FROM trainers JOIN users ON trainers.user_id=users.user_id WHERE username='tiago'`).get().trainer_id;
  const sofia = db.prepare(`SELECT trainer_id FROM trainers JOIN users ON trainers.user_id=users.user_id WHERE username='sofia'`).get().trainer_id;
  const miguel = db.prepare(`SELECT trainer_id FROM trainers JOIN users ON trainers.user_id=users.user_id WHERE username='miguel'`).get().trainer_id;

  const yoga = db.prepare(`SELECT class_id FROM class_catalog WHERE title='Morning Yoga'`).get().class_id;
  const hiit = db.prepare(`SELECT class_id FROM class_catalog WHERE title='Power HIIT'`).get().class_id;
  const spin = db.prepare(`SELECT class_id FROM class_catalog WHERE title='Sunrise Spinning'`).get().class_id;
  const pilates = db.prepare(`SELECT class_id FROM class_catalog WHERE title='Pilates Flow'`).get().class_id;
  const boxing = db.prepare(`SELECT class_id FROM class_catalog WHERE title='Boxing Basics'`).get().class_id;

  const sessions = [
    [yoga, sofia, '2026-06-02', '09:00', '10:00'],
    [yoga, sofia, '2026-06-04', '09:00', '10:00'],
    [hiit, tiago, '2026-06-02', '18:00', '18:45'],
    [hiit, tiago, '2026-06-05', '18:00', '18:45'],
    [spin, tiago, '2026-06-03', '07:00', '07:50'],
    [pilates, sofia, '2026-06-03', '11:00', '12:00'],
    [boxing, miguel, '2026-06-04', '20:00', '21:00'],
    [boxing, miguel, '2026-06-06', '20:00', '21:00'],
  ];
  sessions.forEach(([cid, tid, date, start, end]) =>
    db.prepare(`INSERT INTO class_sessions (class_id, trainer_id, session_date, start_time, end_time) VALUES (?,?,?,?,?)`).run(cid, tid, date, start, end)
  );

  console.log('Database seeded.');
}

module.exports = db;
