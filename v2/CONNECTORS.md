# Connectors — Open Plugs, No Socket

SE Command ships with its outbound integrations as **open connectors**: each is
a stable *plug* (route shape + response contract) with **no socket** wired in.
The dashboard runs fully on its local SQLite data; the connectors are where you
later attach live systems (a transcript source, a conversation-intelligence API,
calendar/email, and an LLM provider) without changing the frontend or contracts.

---

## Current behaviour

The app runs entirely on the **SQLite data layer** (`data/pipeline.db`) — the
opportunity pipeline, deal health, documents, progress, and tasks are all served
locally. Only the *outbound* integrations are dormant.

Every connector endpoint responds with a clear, machine-readable signal:

```
HTTP 503
{
  "error": "connector_not_configured",
  "connector": "zoom",
  "socket": "Conversation-intelligence API (recordings, transcripts, deals)",
  "requires": ["OAUTH_CREDENTIALS"],
  "message": "The ... connector is a plug without a socket in this environment."
}
```

The UI surfaces this gracefully (Quick Actions show the message inline; nothing
breaks). `GET /health` reports the status of every connector.

---

## The connectors

Registry: [`server/services/connectors.ts`](server/services/connectors.ts).

| Connector | Plug (routes) | Socket (system to attach) | Requires |
|-----------|---------------|---------------------------|----------|
| **notion** | `/notion/search`, `/notion/fetch` | A transcript/notes source (meeting transcripts) | `NOTION_TOKEN` |
| **zoom** | `/zoom/*` | Conversation-intelligence API (recordings, transcripts) | OAuth creds |
| **google** | `/calendar/*`, `/gmail/*` | Calendar + email API | OAuth creds |
| **bedrock** | `/hydrate`, `/status/:id`, `/full-hydration` | LLM provider (transcript → intel extraction) | LLM provider creds |

Two additional dormant paths:

- **Filesystem mode** — read `intelligence.md` files directly in the browser via
  the File System Access API (the header toggle). SQLite is the active mode;
  re-enabling needs `src/lib/parser.ts` + the filesystem branch of `useFileSystem`.
- **tasks.md** — tasks persist to SQLite (`/api/tasks`); a filesystem variant
  would write back to a `tasks.md` file.

---

## Wiring a socket later

Plug contracts won't change — only the handlers:

1. Implement the real handler in `server/services/<connector>.ts`.
2. Replace the stub body in `server/routes/<connector>.ts` so it calls the
   service instead of `connectorUnavailable(...)`.
3. Flip `status` to `'connected'` in `connectors.ts` (or probe credentials live).
   `GET /health` and the UI update automatically.
4. Provide the credentials named in `requires` (env var or secret store).

Because every plug already exists and is typed, attaching a socket is a
localised change per connector — no frontend churn, no contract drift.
