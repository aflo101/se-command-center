/**
 * Full (batch) hydration plug (no socket). Endpoints: /full-hydration[/:id].
 */
import { Router } from 'express';
import { connectorUnavailable } from '../services/connectors';

const router = Router();
router.use('/full-hydration', (_req, res) => connectorUnavailable(res, 'bedrock'));
export default router;
