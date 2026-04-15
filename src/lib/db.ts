// Uses Node.js built-in sqlite module (stable in Node 22.5+ / Node 25+)
// No native compilation required.
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import type { Thought, PaginatedThoughts } from '@/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'thoughts.db');

let _db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (_db) return _db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new DatabaseSync(DB_PATH);

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
  const row = db.prepare('SELECT MAX(cycle_number) as max_cycle FROM thoughts').get() as unknown as
    | { max_cycle: number | null }
    | undefined;
  return row?.max_cycle ?? 0;
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
  return getThoughtById(Number(result.lastInsertRowid))!;
}

export function getThoughtById(id: number): Thought | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM thoughts WHERE id = ?').get(id);
  return (row as unknown as Thought) ?? null;
}

export function getLatestThought(): Thought | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM thoughts ORDER BY created_at DESC LIMIT 1').get();
  return (row as unknown as Thought) ?? null;
}

export function getThoughtsPaginated(page: number = 1, limit: number = 10): PaginatedThoughts {
  const db = getDb();
  const offset = (page - 1) * limit;

  const thoughts = db
    .prepare('SELECT * FROM thoughts ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as unknown as Thought[];

  const totalRow = db.prepare('SELECT COUNT(*) as count FROM thoughts').get() as unknown as { count: number };
  const total = totalRow.count;

  return {
    thoughts,
    total,
    page,
    limit,
    hasMore: offset + thoughts.length < total,
  };
}
