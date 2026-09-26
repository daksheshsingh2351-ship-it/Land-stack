import { Router } from 'express';
import {
  getParcelByUlpin,
  listParcels,
  createParcel,
  updateParcel,
  deleteParcel,
} from '../controllers/parcelController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/parcels
 * List/search parcels with optional filters.
 * Public endpoint.
 */
router.get('/', listParcels);

/**
 * GET /api/parcels/:ulpin
 * Get a single parcel by ULPIN.
 * Public endpoint.
 */
router.get('/:ulpin', getParcelByUlpin);

/**
 * POST /api/parcels
 * Create a new parcel.
 * Requires: OFFICER or ADMIN role.
 */
router.post('/', authenticate, authorize('OFFICER', 'ADMIN'), createParcel);

/**
 * PATCH /api/parcels/:id
 * Update a parcel by ID.
 * Requires: OFFICER or ADMIN role.
 */
router.patch('/:id', authenticate, authorize('OFFICER', 'ADMIN'), updateParcel);

/**
 * DELETE /api/parcels/:id
 * Delete a parcel by ID.
 * Requires: ADMIN role only.
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteParcel);

export default router;
