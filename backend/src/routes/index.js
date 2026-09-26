import { Router } from 'express';
import healthRoutes from './health.js';
import authRoutes from './auth.js';
import parcelRoutes from './parcels.js';

import requestRoutes from './requests.js';
import officerRoutes from './officer.js';
import notificationRoutes from './notifications.js';
import alertRoutes from './alerts.js';
import systemRoutes from './systems.js';

const router = Router();

// Mount route groups
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/parcels', parcelRoutes);
router.use('/requests', requestRoutes);
router.use('/officer', officerRoutes);
router.use('/notifications', notificationRoutes);
router.use('/alerts', alertRoutes);
router.use('/systems', systemRoutes);

// Future route groups:
// router.use('/notifications', notificationRoutes);

export default router;
