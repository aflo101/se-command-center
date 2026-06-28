/**
 * Open-connector registry — "plugs without a socket."
 *
 * The integrations these plugs target (a transcript source, a conversation-
 * intelligence API, calendar/email, and an LLM provider) are not wired in this
 * build. Rather than delete the integration surface, each is preserved here as
 * a declared connector with a stable plug (route shape + response contract)
 * and NO socket (no live backend wired in).
 *
 * Future state: a deployment that has these systems available can implement
 * each connector's `handler` and flip `status` to 'connected' — the frontend
 * and route contracts do not change. See CONNECTORS.md for the full plan.
 */

export type ConnectorStatus = 'connected' | 'not_connected';

export interface Connector {
  key: string;
  label: string;
  /** The external system this plug is meant to connect to (the "socket"). */
  socket: string;
  /** Env vars / credentials a future socket would require. */
  requires: string[];
  status: ConnectorStatus;
  note: string;
}

export const CONNECTORS: Record<string, Connector> = {
  notion: {
    key: 'notion',
    label: 'Notion',
    socket: 'Notion API / MCP (meeting transcripts)',
    requires: ['NOTION_TOKEN'],
    status: 'not_connected',
    note: 'Transcript search/fetch for hydration.',
  },
  zoom: {
    key: 'zoom',
    label: 'Call Recording / Revenue Intelligence',
    socket: 'Conversation-intelligence API (recordings, transcripts, deals)',
    requires: ['OAUTH_CREDENTIALS'],
    status: 'not_connected',
    note: 'Call recordings, transcripts, analysis, deals.',
  },
  google: {
    key: 'google',
    label: 'Calendar + Email',
    socket: 'Google Calendar + Gmail API (OAuth)',
    requires: ['GOOGLE_OAUTH'],
    status: 'not_connected',
    note: 'Calendar events + email correlation to opportunities.',
  },
  bedrock: {
    key: 'bedrock',
    label: 'LLM Provider',
    socket: 'LLM provider API (transcript → intelligence extraction)',
    requires: ['LLM_PROVIDER_CREDENTIALS'],
    status: 'not_connected',
    note: 'LLM processing used by the hydration pipeline.',
  },
};

/** Standard response for an unwired connector plug. */
export function connectorUnavailable(res: any, key: string) {
  const c = CONNECTORS[key];
  return res.status(503).json({
    error: 'connector_not_configured',
    connector: key,
    socket: c?.socket,
    requires: c?.requires ?? [],
    message: c
      ? `The ${c.label} connector is a plug without a socket in this environment. See CONNECTORS.md.`
      : `Unknown connector: ${key}`,
  });
}

export function connectorStatuses() {
  return Object.values(CONNECTORS).map(({ key, label, socket, status }) => ({
    key,
    label,
    socket,
    status,
  }));
}
