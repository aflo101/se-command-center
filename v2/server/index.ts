import express from 'express';
import cors from 'cors';
import { PORT, NOTION_TOKEN } from './lib/config';

// Routes
import healthRouter from './routes/health';
import clientsRouter from './routes/clients';
import hydrateRouter from './routes/hydrate';
import notionRouter from './routes/notion';
import feedbackRouter from './routes/feedback';
import zoomRouter from './routes/zoom';
import calendarRouter from './routes/calendar';
import opportunitiesRouter from './routes/opportunities';
import tasksRouter from './routes/tasks';
import fullHydrationRouter from './routes/full-hydration';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(healthRouter);
app.use(clientsRouter);
app.use(hydrateRouter);
app.use(notionRouter);
app.use(feedbackRouter);
app.use(zoomRouter);
app.use(calendarRouter);
app.use(opportunitiesRouter);
app.use(tasksRouter);
app.use(fullHydrationRouter);

// Start server
app.listen(PORT, () => {
  console.log();
  console.log('  SE Command Center - Hydration Server v2.0 (TypeScript)');
  console.log('  ' + '='.repeat(50));
  console.log(`  http://localhost:${PORT}`);
  console.log();
  console.log(`  Notion API: ${NOTION_TOKEN ? '✓ Configured' : '✗ Not configured'}`);
  console.log();
  console.log('  Endpoints:');
  console.log('    GET  /health             - Health check');
  console.log('    GET  /clients            - List clients');
  console.log('    POST /hydrate            - Start hydration job');
  console.log('    GET  /status/:id         - Job status');
  console.log('    POST /notion/search      - Search Notion pages');
  console.log('    POST /notion/fetch       - Fetch Notion page content');
  console.log('    POST /feedback           - Submit feedback');
  console.log('    GET  /zoom/test          - Test Zoom connection');
  console.log('    GET  /zoom/conversations - List Zoom conversations');
  console.log('    GET  /zoom/transcript/:id - Get transcript');
  console.log('    GET  /calendar/today     - Today\'s events');
  console.log('    GET  /calendar/events    - Events for N days');
  console.log('    GET  /calendar/search    - Search events');
  console.log('    GET  /gmail/recent       - Recent emails');
  console.log('    GET  /gmail/search       - Search emails');
  console.log('    GET  /gmail/labels       - Gmail labels');
  console.log();
  console.log('  Full Hydration:');
  console.log('    POST /full-hydration        - Start batch hydration');
  console.log('    GET  /full-hydration/:id    - Job status');
  console.log();
  console.log('  SQLite API:');
  console.log('    GET  /api/opportunities         - List all opps');
  console.log('    GET  /api/opportunities/:id     - Get single opp');
  console.log('    PATCH /api/opportunities/:id    - Update opp');
  console.log('    GET  /api/opportunities/:id/champions - Champions');
  console.log('    POST /api/opportunities/:id/champions - Add champion');
  console.log('    POST /api/opportunities/:id/signals   - Update signal');
  console.log('    GET  /api/stats                 - Dashboard stats');
  console.log();
});
