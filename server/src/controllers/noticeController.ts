import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notice } from '../models/Notice';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { NOTIFICATION_TYPES } from '../config/constants';

export const getNotices = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notices = await Notice.find()
      .populate('author', 'name role')
      .sort({ isImportant: -1, publishedAt: -1 })
      .lean();

    sendSuccess(res, notices);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch notices', 500);
  }
};

export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { title, body, isImportant = false } = req.body;

    if (!title || !body) {
      sendError(res, 'Notice title and message body are required.', 400, 'VALIDATION_ERROR');
      return;
    }

    const notice = await Notice.create({
      title: title.trim(),
      body: body.trim(),
      isImportant: Boolean(isImportant),
      author: user._id,
      publishedAt: new Date(),
    });

    // Notify all residents
    const residents = await User.find({ role: 'RESIDENT' });
    const notifications = residents.map((resUser) => ({
      user: resUser._id,
      type: NOTIFICATION_TYPES.NOTICE,
      title: isImportant ? `📢 Important Notice: ${notice.title}` : `📢 Society Notice: ${notice.title}`,
      body: notice.body.length > 120 ? `${notice.body.slice(0, 117)}...` : notice.body,
      relatedNotice: notice._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const populated = await Notice.findById(notice._id).populate('author', 'name role').lean();
    sendSuccess(res, populated, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create notice', 500);
  }
};

export const updateNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, body, isImportant } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      sendError(res, 'Notice not found.', 404, 'NOT_FOUND');
      return;
    }

    if (title !== undefined) notice.title = title.trim();
    if (body !== undefined) notice.body = body.trim();
    if (isImportant !== undefined) notice.isImportant = Boolean(isImportant);

    await notice.save();
    const populated = await Notice.findById(id).populate('author', 'name role').lean();
    sendSuccess(res, populated);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update notice', 500);
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notice = await Notice.findByIdAndDelete(id);

    if (!notice) {
      sendError(res, 'Notice not found.', 404, 'NOT_FOUND');
      return;
    }

    sendSuccess(res, { message: 'Notice deleted successfully.' });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to delete notice', 500);
  }
};
