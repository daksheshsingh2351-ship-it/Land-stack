import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  listSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem
} from '../controllers/systemController.js';

const router = Router();

// All system routes require authentication
router.use(authenticate);

// ─── ANY AUTHENTICATED USER ───────────────────────────────────────
router.get('/', listSystems);
router.get('/:id', getSystemById);

// ─── ADMIN ONLY ───────────────────────────────────────────────────
router.post('/', authorize('ADMIN'), createSystem);
router.patch('/:id', authorize('ADMIN'), updateSystem);
router.delete('/:id', authorize('ADMIN'), deleteSystem);

export default router;
