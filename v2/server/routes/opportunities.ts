/**
 * SQLite-backed opportunity API (the dashboard's primary data source).
 */
import { Router } from 'express';
import { getDb } from '../services/db';
import { mapOpportunity } from '../services/opportunityMapper';
import { SE_OWNER } from '../lib/config';

const router = Router();

// GET /api/opportunities — all opps for this SE, mapped + health-scored.
router.get('/api/opportunities', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT * FROM opportunities WHERE se_owner = ? ORDER BY se_stage, name`
    )
    .all(SE_OWNER);
  res.json(rows.map((r) => mapOpportunity(db, r)));
});

// GET /api/stats — dashboard summary tiles.
router.get('/api/stats', (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare(`SELECT * FROM opportunities WHERE se_owner = ?`)
    .all(SE_OWNER);
  const opps = rows.map((r) => mapOpportunity(db, r));

  res.json({
    activeOpportunities: opps.length,
    totalPipeline: opps.reduce((sum, o) => sum + (o.pipelineValue || 0), 0),
    povsInProgress: opps.filter((o) => o.stage === '3 POV/Validation').length,
    atRisk: opps.filter((o) => o.overallHealth === 'at-risk').length,
  });
});

// GET /api/opportunities/:id — single opp + champions + stakeholders.
router.get('/api/opportunities/:id', (req, res) => {
  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM opportunities WHERE id = ?`)
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Opportunity not found' });

  const opp = mapOpportunity(db, row);
  const champions = db
    .prepare(`SELECT * FROM champion_scores WHERE opportunity_id = ?`)
    .all(req.params.id);
  const stakeholders = db
    .prepare(`SELECT * FROM stakeholders WHERE opportunity_id = ?`)
    .all(req.params.id);

  res.json({ ...opp, champions, stakeholders });
});

// PATCH /api/opportunities/:id — update a whitelist of fields.
const PATCHABLE: Record<string, string> = {
  stage: 'se_stage',
  pipelineValue: 'pipeline_value',
  nextStep: 'next_step',
  issue: 'issue',
  engagementLevel: 'engagement_level',
  nda: 'nda',
  estimatedClose: 'estimated_close',
};

router.patch('/api/opportunities/:id', (req, res) => {
  const db = getDb();
  const updates: string[] = [];
  const params: Record<string, unknown> = { id: req.params.id };

  for (const [key, col] of Object.entries(PATCHABLE)) {
    if (key in req.body) {
      updates.push(`${col} = @${col}`);
      params[col] = req.body[key];
    }
  }
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updatable fields provided' });
  }
  updates.push(`updated_at = datetime('now')`);
  updates.push(`last_updated = @last_updated`);
  params.last_updated = new Date().toISOString();

  const info = db
    .prepare(`UPDATE opportunities SET ${updates.join(', ')} WHERE id = @id`)
    .run(params);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }

  const row = db
    .prepare(`SELECT * FROM opportunities WHERE id = ?`)
    .get(req.params.id);
  res.json(mapOpportunity(db, row));
});

// GET/POST /api/opportunities/:id/champions
router.get('/api/opportunities/:id/champions', (req, res) => {
  const db = getDb();
  res.json(
    db
      .prepare(`SELECT * FROM champion_scores WHERE opportunity_id = ?`)
      .all(req.params.id)
  );
});

router.post('/api/opportunities/:id/champions', (req, res) => {
  const db = getDb();
  const b = req.body;
  db.prepare(
    `INSERT OR REPLACE INTO champion_scores
       (opportunity_id, stakeholder_name, stakeholder_role,
        access_score, access_notes, action_score, action_notes,
        challenged_score, challenged_notes, motive_score, motive_notes,
        candor_score, candor_notes, is_primary_champion, last_validated)
     VALUES
       (@opp, @name, @role, @access, @accessNotes, @action, @actionNotes,
        @challenged, @challengedNotes, @motive, @motiveNotes,
        @candor, @candorNotes, @primary, @lastValidated)`
  ).run({
    opp: req.params.id,
    name: b.stakeholderName,
    role: b.stakeholderRole ?? null,
    access: b.accessScore ?? null,
    accessNotes: b.accessNotes ?? null,
    action: b.actionScore ?? null,
    actionNotes: b.actionNotes ?? null,
    challenged: b.challengedScore ?? null,
    challengedNotes: b.challengedNotes ?? null,
    motive: b.motiveScore ?? null,
    motiveNotes: b.motiveNotes ?? null,
    candor: b.candorScore ?? null,
    candorNotes: b.candorNotes ?? null,
    primary: b.isPrimaryChampion ? 1 : 0,
    lastValidated: b.lastValidated ?? new Date().toISOString(),
  });
  res.json({ ok: true });
});

// POST /api/opportunities/:id/signals — upsert one health signal.
router.post('/api/opportunities/:id/signals', (req, res) => {
  const db = getDb();
  const { name, status, notes, criteria } = req.body;
  if (!name || !status) {
    return res.status(400).json({ error: 'name and status are required' });
  }
  db.prepare(
    `INSERT INTO health_signals (opportunity_id, signal_name, status, notes, criteria)
     VALUES (@opp, @name, @status, @notes, @criteria)
     ON CONFLICT(opportunity_id, signal_name)
     DO UPDATE SET status = @status, notes = @notes, criteria = @criteria,
                   updated_at = datetime('now')`
  ).run({
    opp: req.params.id,
    name,
    status,
    notes: notes ?? null,
    criteria: criteria ?? null,
  });
  res.json({ ok: true });
});

// GET/POST /api/opportunities/:id/tasks
router.get('/api/opportunities/:id/tasks', (req, res) => {
  const db = getDb();
  res.json(
    db
      .prepare(
        `SELECT id, description, completed, opportunity_id AS opportunity,
                due, type, source
         FROM tasks WHERE opportunity_id = ? ORDER BY completed, id`
      )
      .all(req.params.id)
  );
});

router.post('/api/opportunities/:id/tasks', (req, res) => {
  const db = getDb();
  const { description, due, type, source } = req.body;
  const info = db
    .prepare(
      `INSERT INTO tasks (description, opportunity_id, due, type, source)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(
      description,
      req.params.id,
      due || 'backlog',
      type || 'follow-up',
      source || 'manual'
    );
  res.json({ id: info.lastInsertRowid, ok: true });
});

export default router;
