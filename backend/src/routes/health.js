import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint.
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LandStack backend is running',
  });
});

export default router;
