import { Router } from 'express';
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getNotices);
router.post('/', restrictTo('ADMIN'), createNotice);
router.patch('/:id', restrictTo('ADMIN'), updateNotice);
router.delete('/:id', restrictTo('ADMIN'), deleteNotice);

export default router;
