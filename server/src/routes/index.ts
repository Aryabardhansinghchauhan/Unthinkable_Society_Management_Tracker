import { Router } from 'express';
import authRoutes from './authRoutes';
import complaintRoutes from './complaintRoutes';
import noticeRoutes from './noticeRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import staffRoutes from './staffRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/notices', noticeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/staff', staffRoutes);
router.use('/settings', settingsRoutes);

export default router;
