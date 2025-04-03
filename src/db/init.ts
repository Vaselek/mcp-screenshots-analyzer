import Database from 'better-sqlite3';

const db = new Database('screenshots.db');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS screenshots (
  id INTEGER PRIMARY KEY,
  filepath TEXT UNIQUE,
  visual_elements JSON,
  content_context JSON,
  temporal_context JSON,
  searchable_tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

// Export the database connection
export default db; 