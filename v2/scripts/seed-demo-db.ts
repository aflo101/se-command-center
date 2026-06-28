#!/usr/bin/env npx tsx
/**
 * Seed a fictional demo pipeline into SQLite for SE Command.
 *
 * All companies, people, and deals here are invented for demonstration.
 * Any resemblance to real organizations is coincidental.
 *
 * Usage:
 *   npm run seed            # create demo DB (refuses to overwrite existing)
 *   npm run seed -- --force # overwrite an existing pipeline.db
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { SCHEMA } from './schema';
import { DB_PATH } from '../server/lib/config';

const FORCE = process.argv.includes('--force');

type Status = 'positive' | 'warning' | 'negative' | 'unknown';
type Signal = [name: string, status: Status, notes: string];
type Doc = [name: string, status: 'complete' | 'in-progress' | 'not-started'];
type Progress = [type: 'completed' | 'in-progress' | 'warning', text: string];
type Depth = [name: string, value: string, notes: string];

interface DemoOpp {
  id: string;
  name: string;
  stage: string;
  value: number;
  engagement: 'HIGH' | 'MEDIUM' | 'LOW';
  nda: 'signed' | 'pending' | 'not-addressed';
  nextStep: string;
  issue?: string;
  estClose: string;
  sfdcOppId?: string;
  slackChannel?: string;
  lastUpdated: string;
  signals: Signal[];
  documents?: Doc[];
  progress?: Progress[];
  depth?: Depth[];
}

const H = ['Executive Sponsor', 'Technical Champion', 'Budget Holder Access', 'Compelling Event', 'Competition'];
const sig = (statuses: Status[], notes: string[]): Signal[] =>
  H.map((name, i) => [name, statuses[i], notes[i] || '']);

const OPPS: DemoOpp[] = [
  {
    id: 'meridian-health', name: 'Meridian Health System', stage: '0 Incoming', value: 0,
    engagement: 'HIGH', nda: 'pending', estClose: 'Q3 2026', lastUpdated: '2026-06-22T16:00:00.000Z',
    nextStep: 'Schedule intro call with security team; send platform overview',
    issue: 'No exec sponsor identified yet — inbound via webinar',
    signals: sig(['warning', 'warning', 'unknown', 'warning', 'unknown'],
      ['Inbound contact only', 'Security analyst engaged', 'Unknown', 'PHI exposure concern raised', 'Unknown']),
    progress: [['completed', 'Inbound lead from compliance webinar'], ['in-progress', 'Routing to regional team']],
  },
  {
    id: 'vantage-global', name: 'Vantage Global', stage: '0 Incoming', value: 0,
    engagement: 'MEDIUM', nda: 'not-addressed', estClose: 'Q4 2026', lastUpdated: '2026-06-18T16:00:00.000Z',
    nextStep: 'Qualify use case; confirm data environment (multi-cloud)',
    signals: sig(['warning', 'warning', 'warning', 'warning', 'unknown'],
      ['Unconfirmed', 'IT contact only', 'Unknown', 'Cloud migration underway', 'Unknown']),
    progress: [['in-progress', 'Initial discovery email sent']],
  },
  {
    id: 'northwind-retail', name: 'Northwind Retail', stage: '0 Incoming', value: 450000,
    engagement: 'MEDIUM', nda: 'not-addressed', estClose: 'Q4 2026', lastUpdated: '2026-06-20T16:00:00.000Z',
    nextStep: 'Technical deep-dive with cloud security lead',
    issue: 'No direct contact yet — routed via channel partner',
    signals: sig(['warning', 'positive', 'unknown', 'warning', 'negative'],
      ['Identified, not engaged', 'Cloud lead is enthusiastic', 'Unknown', 'PCI audit pending', 'Incumbent DLP in place']),
    documents: [['Discovery Brief', 'in-progress'], ['Platform Overview', 'complete']],
    progress: [['completed', 'Partner intro received'], ['warning', 'Incumbent contract renews Q1']],
  },
  {
    id: 'brightpeak-ins', name: 'Brightpeak Insurance', stage: '0 Incoming', value: 350000,
    engagement: 'HIGH', nda: 'not-addressed', estClose: 'Q3 2026', lastUpdated: '2026-06-21T16:00:00.000Z',
    nextStep: 'Confirm scope of sensitive data estate; align on success criteria',
    signals: sig(['positive', 'warning', 'warning', 'warning', 'unknown'],
      ['VP Security sponsoring', 'Architect assigned', 'Via org chart', 'Audit finding to remediate', 'Unknown']),
    progress: [['completed', 'Exec intro call held'], ['in-progress', 'Scoping data sources']],
  },
  {
    id: 'vela-media', name: 'Vela Media', stage: '0 Incoming', value: 0,
    engagement: 'MEDIUM', nda: 'not-addressed', estClose: 'Q4 2026', lastUpdated: '2026-06-15T16:00:00.000Z',
    nextStep: 'Re-engage after budget cycle; nurture',
    signals: sig(['warning', 'unknown', 'unknown', 'warning', 'unknown'],
      ['Stalled', 'Unknown', 'Unknown', 'No clear trigger', 'Unknown']),
  },
  {
    id: 'crestline-fin', name: 'Crestline Financial', stage: '0 Incoming', value: 0,
    engagement: 'MEDIUM', nda: 'not-addressed', estClose: 'Q4 2026', lastUpdated: '2026-06-17T16:00:00.000Z',
    nextStep: 'Discovery workshop to map data stores',
    signals: sig(['unknown', 'warning', 'warning', 'warning', 'unknown'],
      ['Unknown', 'Data governance lead', 'Identified', 'Regulatory review', 'Unknown']),
    progress: [['in-progress', 'Workshop being scheduled']],
  },
  {
    id: 'clarion-ind', name: 'Clarion Industries', stage: '1 Discovery', value: 200000,
    engagement: 'MEDIUM', nda: 'pending', estClose: 'Q1 2027', lastUpdated: '2026-06-19T16:00:00.000Z',
    nextStep: 'Send POV scoping doc; align on data sources for pilot',
    issue: 'POV scoping needed before procurement will engage',
    signals: sig(['warning', 'positive', 'warning', 'warning', 'warning'],
      ['Director level', 'Plant IT champion active', 'Identified', 'OT/IT convergence', 'Evaluating two vendors']),
    documents: [['Technical Success Plan (TSP)', 'in-progress']],
    progress: [['completed', 'Discovery call #1 complete'], ['in-progress', 'Scoping POV']],
  },
  {
    id: 'halloran-legal', name: 'Halloran Legal', stage: '1 Discovery', value: 200000,
    engagement: 'HIGH', nda: 'signed', estClose: 'Q4 2026', lastUpdated: '2026-06-23T16:00:00.000Z',
    nextStep: 'Schedule 1-hour technical demo for the security committee',
    issue: 'Previously evaluated a competitor 2 years ago — needs fresh differentiation',
    signals: sig(['positive', 'warning', 'warning', 'positive', 'warning'],
      ['Managing partner backing', 'IT director engaged', 'Identified', 'Client data mandate', 'Prior eval of incumbent']),
    documents: [['Demo Recording', 'not-started']],
    progress: [['completed', 'NDA signed'], ['in-progress', 'Demo scheduling']],
  },
  {
    id: 'linden-supply', name: 'Linden Supply Co', stage: '1 Discovery', value: 0,
    engagement: 'MEDIUM', nda: 'not-addressed', estClose: 'Q1 2027', lastUpdated: '2026-06-16T16:00:00.000Z',
    nextStep: 'Follow-up call to confirm budget and timeline',
    signals: sig(['warning', 'warning', 'unknown', 'warning', 'unknown'],
      ['Identified', 'Single contact', 'Unknown', 'Exploratory', 'Unknown']),
    documents: [['Discovery Brief', 'complete'], ['Data Inventory', 'in-progress'], ['Platform Overview', 'complete']],
    progress: [['completed', 'Intro call held']],
  },
  {
    id: 'lumora-beauty', name: 'Lumora Beauty', stage: '1 Discovery', value: 1500000,
    engagement: 'HIGH', nda: 'signed', estClose: 'Q3 2026', lastUpdated: '2026-06-24T16:00:00.000Z',
    nextStep: 'Build POV plan; identify 2 priority data stores for scanning',
    signals: sig(['positive', 'positive', 'warning', 'warning', 'unknown'],
      ['CISO sponsoring', 'Cloud security champion active', 'Identified via sponsor', 'Board-level data initiative', 'Unknown']),
    documents: [['Technical Success Plan (TSP)', 'in-progress'], ['Executive Briefing', 'complete'], ['Data Inventory', 'in-progress']],
    progress: [['completed', 'Exec alignment call'], ['completed', 'NDA signed'], ['in-progress', 'POV planning']],
    depth: [['Multi-Threaded', 'Yes', '3 stakeholders engaged'], ['Political Capital', 'Medium', 'CISO is new in seat']],
  },
  {
    id: 'veritas-data', name: 'Veritas Data', stage: '2 Scoping', value: 1200000,
    engagement: 'HIGH', nda: 'signed', estClose: 'Q3 2026', sfdcOppId: '006DEMO00VERITAS',
    slackChannel: 'C0DEMOVRTS', lastUpdated: '2026-06-25T16:00:00.000Z',
    nextStep: 'Finalize POV success criteria with Dana Whitfield; lock scoping doc',
    signals: sig(['positive', 'positive', 'positive', 'positive', 'warning'],
      ['Dana Whitfield (CISO) actively sponsoring', 'Marcus Lee (Sec Architect) — deep technical fit confirmed',
        'Direct line to economic buyer established', 'Compliance deadline Q4 (board mandate)', 'One competitor, differentiated']),
    documents: [['Technical Success Plan (TSP)', 'complete'], ['POV Agreement & SOW', 'in-progress'],
      ['Executive Briefing', 'complete'], ['Architecture Review', 'complete'],
      ['Data Inventory', 'complete'], ['Security Questionnaire', 'in-progress'], ['Pricing Proposal', 'not-started']],
    progress: [['completed', 'Scoping workshop complete'], ['completed', 'Multi-threaded to 4 stakeholders'],
      ['in-progress', 'POV SOW in legal review']],
    depth: [['Multi-Threaded', 'Yes', '4 stakeholders'], ['Champion Challenged', 'No', 'Champion is well-positioned'],
      ['Political Capital', 'High', 'CISO has board visibility'], ['Buyer Scars', 'No', 'No prior failed projects']],
  },
  {
    id: 'helix-diagnostics', name: 'Helix Diagnostics', stage: '3 POV/Validation', value: 750000,
    engagement: 'HIGH', nda: 'signed', estClose: 'Q2 2026', lastUpdated: '2026-06-24T16:00:00.000Z',
    nextStep: 'Spin up tenant; run POV scan on lab data store; schedule readout',
    issue: 'Acquisition of Helix closing Q2 may freeze net-new spend',
    signals: sig(['positive', 'warning', 'warning', 'positive', 'warning'],
      ['VP Eng sponsoring', 'Champion went quiet last 2 weeks', 'Identified', 'HIPAA audit in flight', 'Incumbent under review']),
    documents: [['POV Agreement & SOW', 'complete'], ['Technical Success Plan (TSP)', 'complete'],
      ['POV Findings Report', 'in-progress'], ['Executive Briefing', 'not-started'],
      ['Architecture Review', 'complete'], ['Data Inventory', 'complete']],
    progress: [['completed', 'POV agreement signed'], ['in-progress', 'Tenant provisioning'],
      ['warning', 'Champion responsiveness dropped']],
    depth: [['Champion Challenged', 'Yes', 'Reorg pressure on champion'], ['Buyer Scars', 'Medium', 'Prior tool shelfware']],
  },
  {
    id: 'stride-footwear', name: 'Stride Footwear', stage: '4 Tech Win/Negotiate', value: 140000,
    engagement: 'HIGH', nda: 'signed', estClose: 'Q3 2026', sfdcOppId: '006DEMO00STRIDE',
    slackChannel: 'C0DEMOSTRD', lastUpdated: '2026-06-23T16:00:00.000Z',
    nextStep: 'Address value-assessment feedback; final review with VP; close',
    issue: 'Primary champion on leave imminent — key advocate unavailable for final push',
    signals: sig(['warning', 'warning', 'warning', 'warning', 'unknown'],
      ['Sponsor identified, low engagement', 'Champion engaged but cautious on timeline', 'Unknown', 'Sell to leadership needed', 'Unknown']),
    documents: [['Business Value Assessment', 'in-progress'], ['Pricing Proposal', 'complete'],
      ['POV Findings Report', 'complete'], ['Technical Success Plan (TSP)', 'complete'], ['Final SOW', 'in-progress']],
    progress: [['completed', 'POV readout delivered'], ['completed', 'Pricing proposal sent'],
      ['warning', 'Champion availability shrinking']],
  },
];

interface DemoTask {
  description: string; opportunity: string;
  due: 'today' | 'this-week' | 'backlog'; type: string; source: string; completed?: boolean;
}
const TASKS: DemoTask[] = [
  { description: 'Send POV success criteria draft to Dana Whitfield', opportunity: 'veritas-data', due: 'today', type: 'follow-up', source: 'meeting' },
  { description: 'Provision POV tenant for lab data store', opportunity: 'helix-diagnostics', due: 'today', type: 'deliverable', source: 'meeting' },
  { description: 'Incorporate value-assessment feedback', opportunity: 'stride-footwear', due: 'this-week', type: 'deliverable', source: 'email' },
  { description: 'Schedule security-committee demo', opportunity: 'halloran-legal', due: 'this-week', type: 'follow-up', source: 'manual' },
  { description: 'Draft POV scoping doc', opportunity: 'clarion-ind', due: 'backlog', type: 'deliverable', source: 'manual' },
  { description: 'Send platform overview to Meridian security team', opportunity: 'meridian-health', due: 'backlog', type: 'follow-up', source: 'meeting', completed: true },
];

function seed() {
  if (existsSync(DB_PATH) && !FORCE) {
    console.error(`Refusing to overwrite existing DB: ${DB_PATH}`);
    console.error('Re-run with --force to replace it (this deletes existing data).');
    process.exit(1);
  }
  mkdirSync(dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);

  // Clear (in FK-safe order)
  ['changelog', 'tasks', 'progress', 'documents', 'stakeholders', 'champion_scores',
    'depth_signals', 'health_signals', 'opportunities'].forEach((t) => db.exec(`DELETE FROM ${t}`));

  const insOpp = db.prepare(`INSERT INTO opportunities
    (id, name, se_stage, pipeline_value, sfdc_opp_id, slack_channel, se_owner, nda,
     engagement_level, next_step, issue, estimated_close, last_updated)
    VALUES (@id,@name,@stage,@value,@sfdcOppId,@slackChannel,'Jordan Mercer',@nda,
     @engagement,@nextStep,@issue,@estClose,@lastUpdated)`);
  const insSig = db.prepare(`INSERT INTO health_signals (opportunity_id, signal_name, status, notes) VALUES (?,?,?,?)`);
  const insDoc = db.prepare(`INSERT INTO documents (opportunity_id, name, status) VALUES (?,?,?)`);
  const insProg = db.prepare(`INSERT INTO progress (opportunity_id, type, text) VALUES (?,?,?)`);
  const insDepth = db.prepare(`INSERT INTO depth_signals (opportunity_id, signal_name, value, notes) VALUES (?,?,?,?)`);
  const insTask = db.prepare(`INSERT INTO tasks (description, opportunity_id, due, type, source, completed) VALUES (?,?,?,?,?,?)`);

  const tx = db.transaction(() => {
    for (const o of OPPS) {
      insOpp.run({
        id: o.id, name: o.name, stage: o.stage, value: o.value,
        sfdcOppId: o.sfdcOppId ?? null, slackChannel: o.slackChannel ?? null,
        nda: o.nda, engagement: o.engagement, nextStep: o.nextStep,
        issue: o.issue ?? null, estClose: o.estClose, lastUpdated: o.lastUpdated,
      });
      for (const [n, s, notes] of o.signals) insSig.run(o.id, n, s, notes);
      for (const [n, s] of o.documents ?? []) insDoc.run(o.id, n, s);
      for (const [t, text] of o.progress ?? []) insProg.run(o.id, t, text);
      for (const [n, v, notes] of o.depth ?? []) insDepth.run(o.id, n, v, notes);
    }
    for (const t of TASKS) insTask.run(t.description, t.opportunity, t.due, t.type, t.source, t.completed ? 1 : 0);
  });
  tx();

  const n = db.prepare('SELECT COUNT(*) c FROM opportunities').get() as { c: number };
  db.close();
  console.log(`Seeded ${n.c} demo opportunities into ${DB_PATH}`);
}

seed();
