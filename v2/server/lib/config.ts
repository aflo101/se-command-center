/**
 * Server configuration. All values overridable via environment variables
 * (see .env.example). Defaults are generic/demo-safe so the repo runs for
 * anyone out of the box; real deployments override via a gitignored .env.
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Resolve the repo root relative to this file (portable across machines).
const here = dirname(fileURLToPath(import.meta.url)); // <repo>/v2/server/lib
const REPO_ROOT = join(here, '..', '..', '..'); // <repo>/
const V2_DIR = join(here, '..', '..'); // <repo>/v2

// Minimal .env.local loader (dependency-free). Existing process.env wins.
function loadEnvLocal(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m || line.trim().startsWith('#')) continue;
    const key = m[1];
    if (key in process.env) continue;
    process.env[key] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}
loadEnvLocal(join(V2_DIR, '.env.local'));

export const PORT = Number(process.env.PORT) || 3001;

// Notion token — only used by the (currently dormant) Notion connector.
export const NOTION_TOKEN = process.env.NOTION_TOKEN || '';

// SQLite database — source of truth for opportunity data.
export const DB_PATH =
  process.env.SE_DB_PATH || join(REPO_ROOT, 'data', 'pipeline.db');

// Clients directory — used only by filesystem mode / migration.
export const CLIENTS_DIR =
  process.env.SE_CLIENTS_DIR || join(REPO_ROOT, 'clients');

// Dashboard filter: show only this SE's opportunities.
export const SE_OWNER = process.env.SE_OWNER || 'Jordan Mercer';

// CRM deep-link base (generic by default; override for a real CRM org).
export const SFDC_BASE_URL =
  process.env.SFDC_BASE_URL || 'https://crm.example/opportunity';

export const VENDOR_NAME = process.env.VENDOR_NAME || 'Aegis Data Security';
export const APP_NAME = process.env.APP_NAME || 'SE Command Center';

export const VERSION = '3.1.0';
