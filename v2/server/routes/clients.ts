/**
 * /clients — lists the opportunities known to the dashboard. Sourced from
 * SQLite (the live source of truth) rather than the filesystem.
 */
import { Router } from 'express';
import { getDb } from '../services/db';
import { SE_OWNER } from '../lib/config';

const router = Router();

router.get('/clients', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, file_path FROM opportunities WHERE se_owner = ? ORDER BY name`
    )
    .all(SE_OWNER) as Array<{ id: string; name: string; file_path: string }>;

  res.json(
    rows.map((r) => ({
      name: r.name,
      has_intelligence: Boolean(r.file_path),
      path: r.file_path || '',
    }))
  );
});

export default router;
