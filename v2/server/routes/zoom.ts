/**
 * Zoom Revenue Accelerator connector plug (no socket).
 * Endpoints: /zoom/test, /zoom/conversations, /zoom/transcript/:id, ...
 */
import { Router } from 'express';
import { connectorUnavailable } from '../services/connectors';

const router = Router();
router.use('/zoom', (_req, res) => connectorUnavailable(res, 'zoom'));
export default router;
