/**
 * SQLite access — single shared better-sqlite3 connection.
 */
import Database from 'better-sqlite3';
import { existsSync } from 'fs';
import { DB_PATH } from '../lib/config';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    if (!existsSync(DB_PATH)) {
      throw new Error(
        `Database not found at ${DB_PATH}. Run: npm run seed (demo data) or npm run init-db (empty schema).`
      );
    }
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
  }
  return _db;
}
