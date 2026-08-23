import mongoose, { Schema, Document, Types } from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants';

export interface INotification extends Document {
  user: Types.ObjectId;
  type: (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
  title: string;
  body: string;
  readAt?: Date | null;
  relatedComplaint?: Types.ObjectId;
  relatedNotice?: Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    readAt: { type: Date, default: null, index: true },
    relatedComplaint: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
    },
    relatedNotice: {
      type: Schema.Types.ObjectId,
      ref: 'Notice',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ user: 1, readAt: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  'Notification',
  NotificationSchema
);
