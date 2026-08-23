import { Router } from 'express';
import { getStaff, createStaff, updateStaff } from '../controllers/staffController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getStaff);
router.post('/', restrictTo('ADMIN'), createStaff);
router.patch('/:id', restrictTo('ADMIN'), updateStaff);

export default router;
