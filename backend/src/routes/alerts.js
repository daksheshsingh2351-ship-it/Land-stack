import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  listAlerts,
  getAlertById,
  updateAlert,
  getAlertSummary
} from '../controllers/alertController.js';

const router = Router();

// All alert routes require authentication
router.use(authenticate);

// ─── OFFICER & ADMIN ONLY ROUTES ──────────────────────────────────
router.get('/summary', authorize('OFFICER', 'ADMIN'), getAlertSummary);
router.patch('/:id', authorize('OFFICER', 'ADMIN'), updateAlert);

// ─── CITIZEN, OFFICER, & ADMIN ROUTES ─────────────────────────────
router.get('/', listAlerts);
router.get('/:id', getAlertById);

export default router;
