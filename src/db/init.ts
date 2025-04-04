import sqlite3 from 'sqlite3';
import fs from 'fs';

const DB_PATH = "/Users/aselburzhubaeva/Documents/PROJECTS/smart-screenshot-manager-modules/smart-screenshot-manager/screenshots.db";

// Check if database file exists
const dbExists = fs.existsSync(DB_PATH);

// Enable verbose mode for better debugging
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

// Only create table if database is new
if (!dbExists) {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS screenshots (
        id INTEGER PRIMARY KEY,
        filepath TEXT UNIQUE,
        visual_elements JSON,
        content_context JSON,
        temporal_context JSON,
        searchable_tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        process.exit(1);
      }
      console.log('Screenshots table initialized');
    });
  });
}

// Handle database errors
db.on('error', (err) => {
  console.error('Database error:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});

export default db;