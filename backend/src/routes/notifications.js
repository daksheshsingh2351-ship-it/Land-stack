import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);

// IMPORTANT: specific routes before /:id wildcard
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
