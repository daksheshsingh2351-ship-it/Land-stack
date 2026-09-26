import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account.
 * Body: { name, email, password, role?, phone? }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Authenticate and receive a JWT.
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile.
 * Requires: Bearer token
 */
router.get('/me', authenticate, getMe);

export default router;
