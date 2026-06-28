/**
 * Shared SQLite schema for SE Command. Imported by init-db.ts and
 * seed-demo-db.ts so the schema has a single source of truth.
 */
export const SCHEMA = `
-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now')),
    description TEXT
);

-- Main opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sfdc_stage TEXT,
    se_stage TEXT NOT NULL DEFAULT '0 Incoming',
    pipeline_value INTEGER DEFAULT 0,
    sfdc_opp_id TEXT,
    slack_channel TEXT,
    se_owner TEXT DEFAULT 'Jordan Mercer',
    ae_owner TEXT,
    nda TEXT DEFAULT 'not-addressed',
    engagement_level TEXT DEFAULT 'MEDIUM',
    next_step TEXT,
    issue TEXT,
    estimated_close TEXT,
    last_meeting TEXT,
    next_meeting TEXT,
    last_updated TEXT NOT NULL,
    last_validated TEXT,
    raw_content TEXT,
    file_path TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Health signals (core deal-health signals per opportunity)
CREATE TABLE IF NOT EXISTS health_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    signal_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    criteria TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, signal_name)
);

-- Depth signals (psychological/political factors)
CREATE TABLE IF NOT EXISTS depth_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    signal_name TEXT NOT NULL,
    value TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, signal_name)
);

-- Champion Scorecard (5 signals per champion: AACMC)
CREATE TABLE IF NOT EXISTS champion_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    stakeholder_name TEXT NOT NULL,
    stakeholder_role TEXT,
    access_score INTEGER CHECK(access_score BETWEEN 0 AND 3),
    access_notes TEXT,
    action_score INTEGER CHECK(action_score BETWEEN 0 AND 3),
    action_notes TEXT,
    challenged_score INTEGER CHECK(challenged_score BETWEEN 0 AND 3),
    challenged_notes TEXT,
    motive_score INTEGER CHECK(motive_score BETWEEN 0 AND 3),
    motive_notes TEXT,
    candor_score INTEGER CHECK(candor_score BETWEEN 0 AND 3),
    candor_notes TEXT,
    is_primary_champion INTEGER DEFAULT 0,
    last_validated TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, stakeholder_name)
);

-- Stakeholders (full contact list)
CREATE TABLE IF NOT EXISTS stakeholders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    location TEXT,
    tenure TEXT,
    engagement TEXT,
    email TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, name)
);

-- Documents (TSP, POV, RFI, etc.)
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    link TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(opportunity_id, name)
);

-- Recent progress items
CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Change log (append-only audit trail)
CREATE TABLE IF NOT EXISTS changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    update_type TEXT NOT NULL,
    source TEXT,
    changes TEXT,
    sections_updated TEXT
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    opportunity_id TEXT REFERENCES opportunities(id) ON DELETE SET NULL,
    due TEXT NOT NULL,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opps_se_owner ON opportunities(se_owner);
CREATE INDEX IF NOT EXISTS idx_opps_se_stage ON opportunities(se_stage);
CREATE INDEX IF NOT EXISTS idx_opps_updated ON opportunities(updated_at);
CREATE INDEX IF NOT EXISTS idx_health_opp ON health_signals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_depth_opp ON depth_signals(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_champion_opp ON champion_scores(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_opp ON stakeholders(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_docs_opp ON documents(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_progress_opp ON progress(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_opp ON tasks(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due, completed);
CREATE INDEX IF NOT EXISTS idx_changelog_opp ON changelog(opportunity_id);
`;
