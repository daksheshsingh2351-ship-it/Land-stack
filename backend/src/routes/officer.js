import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardSummary,
  listOfficerRequests,
  assignRequest,
  updateRequestStatus
} from '../controllers/officerController.js';

const router = Router();

// All officer routes require authentication and OFFICER/ADMIN role
router.use(authenticate);
router.use(authorize('OFFICER', 'ADMIN'));

/**
 * GET /api/officer/dashboard
 * Get summary counts for the dashboard.
 */
router.get('/dashboard', getDashboardSummary);

/**
 * GET /api/officer/requests
 * List service requests tailored for the officer view.
 */
router.get('/requests', listOfficerRequests);

/**
 * POST /api/officer/requests/:id/assign
 * Assign a request to an officer.
 */
router.post('/requests/:id/assign', assignRequest);

/**
 * POST /api/officer/requests/:id/status
 * Update the status of a request.
 */
router.post('/requests/:id/status', updateRequestStatus);

export default router;
