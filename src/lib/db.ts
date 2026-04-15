import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { Thought, PaginatedThoughts } from '@/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'thoughts.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS thoughts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_number INTEGER NOT NULL,
      content TEXT NOT NULL,
      meme_phrase TEXT NOT NULL,
      meme_image_path TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_thoughts_cycle_number ON thoughts(cycle_number);
  `);

  return _db;
}

export function getLatestCycleNumber(): number {
  const db = getDb();
  const row = db.prepare('SELECT MAX(cycle_number) as max_cycle FROM thoughts').get() as { max_cycle: number | null };
  return row.max_cycle ?? 0;
}

export function insertThought(data: {
  cycle_number: number;
  content: string;
  meme_phrase: string;
  meme_image_path: string;
}): Thought {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO thoughts (cycle_number, content, meme_phrase, meme_image_path, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  const result = stmt.run(data.cycle_number, data.content, data.meme_phrase, data.meme_image_path);
  return getThoughtById(result.lastInsertRowid as number)!;
}

export function getThoughtById(id: number): Thought | null {
  const db = getDb();
  return db.prepare('SELECT * FROM thoughts WHERE id = ?').get(id) as Thought | null;
}

export function getLatestThought(): Thought | null {
  const db = getDb();
  return db.prepare('SELECT * FROM thoughts ORDER BY created_at DESC LIMIT 1').get() as Thought | null;
}

export function getThoughtsPaginated(page: number = 1, limit: number = 10): PaginatedThoughts {
  const db = getDb();
  const offset = (page - 1) * limit;

  const thoughts = db
    .prepare('SELECT * FROM thoughts ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as Thought[];

  const totalRow = db.prepare('SELECT COUNT(*) as count FROM thoughts').get() as { count: number };
  const total = totalRow.count;

  return {
    thoughts,
    total,
    page,
    limit,
    hasMore: offset + thoughts.length < total,
  };
}
