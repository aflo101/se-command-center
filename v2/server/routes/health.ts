import { Router } from 'express';
import { NOTION_TOKEN, VERSION } from '../lib/config';
import { connectorStatuses } from '../services/connectors';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: VERSION,
    timestamp: new Date().toISOString(),
    notion_configured: Boolean(NOTION_TOKEN),
    connectors: connectorStatuses(),
  });
});

export default router;
