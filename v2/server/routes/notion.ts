/**
 * Notion connector plug (no socket). Endpoints: /notion/search, /notion/fetch.
 */
import { Router } from 'express';
import { connectorUnavailable } from '../services/connectors';

const router = Router();
router.use('/notion', (_req, res) => connectorUnavailable(res, 'notion'));
export default router;
