import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const notifications = await Notification.find({ user: user._id })
      .populate('relatedComplaint', 'publicId title status priority')
      .populate('relatedNotice', 'title isImportant')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      user: user._id,
      readAt: null,
    });

    sendSuccess(res, {
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch notifications', 500);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      sendError(res, 'Notification not found.', 404, 'NOT_FOUND');
      return;
    }

    sendSuccess(res, notification);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update notification', 500);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    await Notification.updateMany(
      { user: user._id, readAt: null },
      { readAt: new Date() }
    );

    sendSuccess(res, { message: 'All notifications marked as read.' });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to mark all as read', 500);
  }
};
