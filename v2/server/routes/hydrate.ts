/**
 * Hydration plug (no socket). Hydration needs a transcript source (Notion/Zoom)
 * + AWS Bedrock to extract intelligence — none are wired in this environment.
 * Endpoints: POST /hydrate, GET /status/:id.
 */
import { Router } from 'express';
import { connectorUnavailable } from '../services/connectors';

const router = Router();
router.post('/hydrate', (_req, res) => connectorUnavailable(res, 'bedrock'));
router.get('/status/:id', (_req, res) => connectorUnavailable(res, 'bedrock'));
export default router;
