import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getSettings);
router.patch('/', updateSettings);

export default router;
