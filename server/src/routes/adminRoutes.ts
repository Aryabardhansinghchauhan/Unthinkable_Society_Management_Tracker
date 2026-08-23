import { Router } from 'express';
import {
  getDashboardKPIs,
  getInsights,
  getRecurringIssues,
} from '../controllers/adminController';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/dashboard', getDashboardKPIs);
router.get('/insights', getInsights);
router.get('/recurring-issues', getRecurringIssues);
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;
