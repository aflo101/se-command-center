#!/usr/bin/env npx tsx
/**
 * Initialize the SQLite database with the schema (no data).
 *
 * Usage:
 *   npm run init-db
 *   npx tsx scripts/init-db.ts --reset   # Drop and recreate all tables
 *
 * For demo data, use `npm run seed` instead.
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { SCHEMA } from './schema';
import { DB_PATH } from '../server/lib/config';

function initDatabase(reset = false) {
  const dbDir = dirname(DB_PATH);
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');

  if (reset) {
    console.log('Dropping existing tables...');
    [
      'changelog', 'tasks', 'progress', 'documents',
      'stakeholders', 'champion_scores', 'depth_signals',
      'health_signals', 'opportunities', 'schema_version',
    ].forEach((t) => db.exec(`DROP TABLE IF EXISTS ${t}`));
  }

  console.log('Creating schema...');
  db.exec(SCHEMA);

  const version = db.prepare('SELECT MAX(version) as v FROM schema_version').get() as { v: number | null };
  if (!(version?.v)) {
    db.prepare('INSERT INTO schema_version (version, description) VALUES (?, ?)').run(
      1,
      'Initial schema with opportunities, signals, champions, stakeholders, documents, progress, changelog, tasks'
    );
    console.log('Schema version 1 applied.');
  }

  db.close();
  console.log(`Database initialized at: ${DB_PATH}`);
}

const reset = process.argv.includes('--reset');
if (reset) console.log('WARNING: This will delete all existing data!');
initDatabase(reset);
