import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Settings, getOrCreateSettings } from '../models/Settings';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const getSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await getOrCreateSettings();
    sendSuccess(res, settings);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch society settings', 500);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { overdueThresholdHours, defaultSlaByPriority, societyName, timezone } = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    if (overdueThresholdHours !== undefined) {
      settings.overdueThresholdHours = Number(overdueThresholdHours);
    }

    if (defaultSlaByPriority) {
      if (defaultSlaByPriority.LOW !== undefined) {
        settings.defaultSlaByPriority.LOW = Number(defaultSlaByPriority.LOW);
      }
      if (defaultSlaByPriority.MEDIUM !== undefined) {
        settings.defaultSlaByPriority.MEDIUM = Number(defaultSlaByPriority.MEDIUM);
      }
      if (defaultSlaByPriority.HIGH !== undefined) {
        settings.defaultSlaByPriority.HIGH = Number(defaultSlaByPriority.HIGH);
      }
    }

    if (societyName !== undefined) {
      settings.societyName = societyName.trim();
    }

    if (timezone !== undefined) {
      settings.timezone = timezone.trim();
    }

    await settings.save();
    sendSuccess(res, settings);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update settings', 500);
  }
};
