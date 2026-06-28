/**
 * SQLite-backed task API. (The original filesystem tasks.md path is a
 * future filesystem-mode concern — see CONNECTORS.md.)
 */
import { Router } from 'express';
import { getDb } from '../services/db';

const router = Router();

function mapTask(row: any) {
  return {
    id: String(row.id),
    description: row.description,
    completed: Boolean(row.completed),
    opportunity: row.opportunity_id || '',
    due: row.due,
    type: row.type,
    source: row.source,
  };
}

// GET /api/tasks — all tasks (incomplete first, then by id).
router.get('/api/tasks', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM tasks ORDER BY completed, id`)
    .all();
  res.json(rows.map(mapTask));
});

// POST /api/tasks — create a task.
router.post('/api/tasks', (req, res) => {
  const db = getDb();
  const { description, opportunity, due, type, source } = req.body;
  if (!description) return res.status(400).json({ error: 'description required' });
  const info = db
    .prepare(
      `INSERT INTO tasks (description, opportunity_id, due, type, source)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      description,
      opportunity || null,
      due || 'backlog',
      type || 'follow-up',
      source || 'manual'
    );
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(info.lastInsertRowid);
  res.json(mapTask(row));
});

// PATCH /api/tasks/:id — toggle/update completion.
router.patch('/api/tasks/:id', (req, res) => {
  const db = getDb();
  const completed = req.body.completed ? 1 : 0;
  const info = db
    .prepare(
      `UPDATE tasks
         SET completed = @completed,
             completed_at = CASE WHEN @completed = 1 THEN datetime('now') ELSE NULL END
       WHERE id = @id`
    )
    .run({ id: req.params.id, completed });
  if (info.changes === 0) return res.status(404).json({ error: 'Task not found' });
  const row = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.id);
  res.json(mapTask(row));
});

export default router;
