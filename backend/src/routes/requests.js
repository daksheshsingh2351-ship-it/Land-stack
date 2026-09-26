import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createRequest,
  listRequests,
  getRequestById,
  updateRequest,
  deleteRequest
} from '../controllers/requestController.js';

const router = Router();

// All request routes require authentication
router.use(authenticate);

/**
 * GET /api/requests
 * List requests. Filtered based on role.
 */
router.get('/', listRequests);

/**
 * POST /api/requests
 * Create a new service request.
 */
router.post('/', createRequest);

/**
 * GET /api/requests/:id
 * Get a specific request.
 */
router.get('/:id', getRequestById);

/**
 * PATCH /api/requests/:id
 * Update a specific request.
 */
router.patch('/:id', updateRequest);

/**
 * DELETE /api/requests/:id
 * Delete a specific request.
 */
router.delete('/:id', deleteRequest);

export default router;
