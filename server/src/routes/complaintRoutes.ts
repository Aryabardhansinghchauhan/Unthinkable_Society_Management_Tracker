import { Router } from 'express';
import {
  getComplaints,
  createComplaint,
  getComplaintById,
  updateComplaint,
  changeStatus,
  assignStaff,
  uploadAttachment,
  reopenComplaint,
  confirmResolution,
  suggestPriorityEndpoint,
} from '../controllers/complaintController';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(protect);

router.get('/', getComplaints);
router.post('/', createComplaint);
router.post('/suggest-priority', suggestPriorityEndpoint);

router.get('/:id', getComplaintById);
router.patch('/:id', restrictTo('ADMIN'), updateComplaint);
router.post('/:id/status', restrictTo('ADMIN'), changeStatus);
router.post('/:id/assign', restrictTo('ADMIN'), assignStaff);
router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.post('/:id/reopen', reopenComplaint);
router.post('/:id/confirm-resolution', confirmResolution);

export default router;
