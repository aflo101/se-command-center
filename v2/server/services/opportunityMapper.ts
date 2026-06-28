/**
 * Maps SQLite rows into the frontend `Opportunity` shape and computes
 * derived deal-health (overallHealth + healthScore).
 *
 * Health rule (from project.md): Green = 60%+ positive signals,
 * Red = 40%+ negative signals, otherwise Yellow. 'unknown' signals are
 * excluded from the denominator.
 */
import type Database from 'better-sqlite3';

type SignalStatus = 'positive' | 'warning' | 'negative' | 'unknown';
type HealthStatus = 'healthy' | 'attention' | 'at-risk';

interface HealthSignalRow {
  name: string;
  status: SignalStatus;
  notes: string | null;
  criteria: string | null;
}

export function scoreHealth(signals: HealthSignalRow[]): {
  overallHealth: HealthStatus;
  healthScore: number;
} {
  const known = signals.filter((s) => s.status !== 'unknown');
  const total = known.length || 1;
  const positives = known.filter((s) => s.status === 'positive').length;
  const negatives = known.filter((s) => s.status === 'negative').length;
  const posRatio = positives / total;
  const negRatio = negatives / total;

  let overallHealth: HealthStatus = 'attention';
  if (posRatio >= 0.6) overallHealth = 'healthy';
  else if (negRatio >= 0.4) overallHealth = 'at-risk';

  return { overallHealth, healthScore: Math.round(posRatio * 100) };
}

export function mapOpportunity(db: Database.Database, row: any) {
  const healthSignals = db
    .prepare(
      `SELECT signal_name AS name, status, notes, criteria
       FROM health_signals WHERE opportunity_id = ? ORDER BY id`
    )
    .all(row.id) as HealthSignalRow[];

  const depthSignals = db
    .prepare(
      `SELECT signal_name AS name, value, notes
       FROM depth_signals WHERE opportunity_id = ? ORDER BY id`
    )
    .all(row.id);

  const documents = db
    .prepare(
      `SELECT name, status, link FROM documents WHERE opportunity_id = ? ORDER BY id`
    )
    .all(row.id);

  const recentProgress = db
    .prepare(
      `SELECT type, text FROM progress WHERE opportunity_id = ? ORDER BY id`
    )
    .all(row.id);

  const { overallHealth, healthScore } = scoreHealth(healthSignals);

  return {
    id: row.id,
    name: row.name,
    lastUpdated: row.last_updated,
    stage: row.se_stage,
    pipelineValue: row.pipeline_value ?? 0,
    nda: row.nda || 'not-addressed',
    engagementLevel: row.engagement_level || 'MEDIUM',
    nextStep: row.next_step || '',
    issue: row.issue || undefined,
    estimatedClose: row.estimated_close || '',
    seOwner: row.se_owner || undefined,
    sfdcOppId: row.sfdc_opp_id || undefined,
    slackChannel: row.slack_channel || undefined,
    healthSignals: healthSignals.map((s) => ({
      name: s.name,
      status: s.status,
      notes: s.notes || undefined,
      criteria: s.criteria || undefined,
    })),
    depthSignals,
    overallHealth,
    healthScore,
    lastValidated: row.last_validated || undefined,
    recentProgress,
    documents,
    rawContent: row.raw_content || '',
    filePath: row.file_path || '',
  };
}
