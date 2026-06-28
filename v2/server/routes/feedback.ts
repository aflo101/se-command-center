/**
 * Feedback endpoint. Accepts hydration quality feedback. No external socket —
 * logged server-side so the UI flow works end-to-end.
 */
import { Router } from 'express';

const router = Router();

router.post('/feedback', (req, res) => {
  console.log('[feedback]', JSON.stringify(req.body));
  res.json({ ok: true, received: true });
});

export default router;
