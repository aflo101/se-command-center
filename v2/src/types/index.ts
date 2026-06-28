// Opportunity Types

// SE Stages: 0 Incoming, 1 Discovery, 2 Scoping, 3 POV/Validation, 4 Tech Win/Negotiate
export type SEStage =
  | '0 Incoming'
  | '1 Discovery'
  | '2 Scoping'
  | '3 POV/Validation'
  | '4 Tech Win/Negotiate';

// Keep DealStage as alias for backwards compatibility
export type DealStage = SEStage;
export type HealthStatus = 'healthy' | 'attention' | 'at-risk';
export type SignalStatus = 'positive' | 'warning' | 'negative' | 'unknown';

export interface HealthSignal {
  name: string;
  status: SignalStatus;
  notes?: string;
  criteria?: string;  // Criteria definition from schema
}

// Depth signals for psychological/political factors
export type DepthSignalValue = 'Yes' | 'No' | 'Unknown' | 'High' | 'Medium' | 'Low';

export interface DepthSignal {
  name: string;
  value: DepthSignalValue;
  notes?: string;
}

export interface Document {
  name: string;
  status: 'complete' | 'in-progress' | 'not-started';
  link?: string;
}

export interface ProgressItem {
  type: 'completed' | 'in-progress' | 'warning';
  text: string;
}

export interface Opportunity {
  id: string;
  name: string;
  lastUpdated: Date;

  // Status
  stage: DealStage;
  pipelineValue: number;
  nda: 'signed' | 'pending' | 'not-addressed';
  engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  nextStep: string;
  issue?: string;  // Primary risk/blocker that could derail the deal
  estimatedClose: string;
  seOwner?: string;

  // Quick Links
  sfdcOppId?: string;    // Salesforce Opportunity ID (18-char)
  slackChannel?: string; // Slack Channel ID

  // Health
  healthSignals: HealthSignal[];      // Core signals (6)
  depthSignals: DepthSignal[];        // Depth signals (4)
  overallHealth: HealthStatus;
  healthScore: number;
  lastValidated?: Date;               // When signals were last assessed

  // Progress
  recentProgress: ProgressItem[];

  // Documents
  documents: Document[];

  // Raw content
  rawContent: string;
  filePath: string;
}

// Store Types

export interface OpportunityStore {
  opportunities: Opportunity[];
  selectedOpportunity: Opportunity | null;
  isLoading: boolean;
  error: string | null;

  setOpportunities: (opps: Opportunity[]) => void;
  selectOpportunity: (opp: Opportunity | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refreshOpportunity: (id: string, data: Partial<Opportunity>) => void;
  updateOpportunityStage: (id: string, newStage: DealStage, newContent: string) => void;
}

export type AppView = 'dashboard' | 'tasks' | 'calendar';

export interface SettingsStore {
  directoryHandle: FileSystemDirectoryHandle | null;
  sidebarCollapsed: boolean;
  viewMode: 'kanban' | 'table';
  currentView: AppView;

  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: 'kanban' | 'table') => void;
  setCurrentView: (view: AppView) => void;
}

// API Types

export interface Job {
  id: string;
  status: 'starting' | 'fetching' | 'processing' | 'writing' | 'complete' | 'error';
  progress: number;
  step: string;
  result?: { file: string; size: number };
  error?: string;
}

export interface HydrationRequest {
  client: string;
  meeting_title?: string;
  source: 'notion' | 'zoom' | 'direct';
  transcript?: string;
  notion_url?: string;
  conversation_id?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
  notion_configured: boolean;
}

export interface ClientInfo {
  name: string;
  has_intelligence: boolean;
  path: string;
}

// Task Types

export type TaskDue = 'today' | 'this-week' | 'backlog';
export type TaskType = 'follow-up' | 'deliverable' | 'internal' | 'research';
export type TaskSource = 'email' | 'meeting' | 'sf-change' | 'manual';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  description: string;
  completed: boolean;
  opportunity: string;  // Client folder name
  due: TaskDue;
  type: TaskType;
  source: TaskSource;
}

export interface TaskStore {
  tasks: Task[];
  highlightedTaskId: string | null;
  setTasks: (tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  setHighlightedTask: (id: string | null) => void;
}

// Calendar & Email Types

export interface CalendarEvent {
  id: string;
  summary: string;
  time: string;
  location: string | null;
  description: string | null;
  attendees: string[];
  hangoutLink: string | null;
  htmlLink: string | null;
  // Enriched fields from correlation
  correlatedClients?: string[];
  matchedBy?: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  date: string;
  from: string;
  subject: string;
  labels: string[];
  snippet: string;
  // Enriched fields from correlation
  correlatedClient?: string;
}
