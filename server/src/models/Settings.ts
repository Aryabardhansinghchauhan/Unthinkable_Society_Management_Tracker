import mongoose, { Schema, Document } from 'mongoose';
import {
  DEFAULT_OVERDUE_THRESHOLD_HOURS,
  DEFAULT_SLA_HOURS,
  DEFAULT_SOCIETY_NAME,
  DEFAULT_TIMEZONE,
} from '../config/constants';

export interface ISettings extends Document {
  overdueThresholdHours: number;
  defaultSlaByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  societyName: string;
  timezone: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    overdueThresholdHours: {
      type: Number,
      default: DEFAULT_OVERDUE_THRESHOLD_HOURS,
    },
    defaultSlaByPriority: {
      LOW: { type: Number, default: DEFAULT_SLA_HOURS.LOW },
      MEDIUM: { type: Number, default: DEFAULT_SLA_HOURS.MEDIUM },
      HIGH: { type: Number, default: DEFAULT_SLA_HOURS.HIGH },
    },
    societyName: {
      type: String,
      default: DEFAULT_SOCIETY_NAME,
    },
    timezone: {
      type: String,
      default: DEFAULT_TIMEZONE,
    },
  },
  {
    timestamps: true,
  }
);

export const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

export const getOrCreateSettings = async (): Promise<ISettings> => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({
      overdueThresholdHours: DEFAULT_OVERDUE_THRESHOLD_HOURS,
      defaultSlaByPriority: DEFAULT_SLA_HOURS,
      societyName: DEFAULT_SOCIETY_NAME,
      timezone: DEFAULT_TIMEZONE,
    });
  }
  return settings;
};
