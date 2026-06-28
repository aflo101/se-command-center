/**
 * Google Calendar + Gmail connector plug (no socket).
 * Endpoints: /calendar/*, /gmail/*.
 */
import { Router } from 'express';
import { connectorUnavailable } from '../services/connectors';

const router = Router();
router.use('/calendar', (_req, res) => connectorUnavailable(res, 'google'));
router.use('/gmail', (_req, res) => connectorUnavailable(res, 'google'));
export default router;
