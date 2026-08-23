import mongoose, { Schema, Document, Types } from 'mongoose';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITY, COMPLAINT_STATUS } from '../config/constants';

export interface IComplaint extends Document {
  publicId: string; // e.g. FF-1042
  resident: Types.ObjectId;
  category: (typeof COMPLAINT_CATEGORIES)[number];
  title: string;
  description: string;
  status: (typeof COMPLAINT_STATUS)[keyof typeof COMPLAINT_STATUS];
  priority: (typeof COMPLAINT_PRIORITY)[keyof typeof COMPLAINT_PRIORITY];
  suggestedPriority?: string;
  prioritySuggestionReason?: string;
  assignedTo?: Types.ObjectId;
  dueAt: Date;
  resolvedAt?: Date;
  reopenedAt?: Date;
  firstResponseAt?: Date;
  resolutionConfirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resident: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.OPEN,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY),
      default: COMPLAINT_PRIORITY.MEDIUM,
      index: true,
    },
    suggestedPriority: {
      type: String,
    },
    prioritySuggestionReason: {
      type: String,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'MaintenanceStaff',
      index: true,
    },
    dueAt: {
      type: Date,
      required: true,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    reopenedAt: {
      type: Date,
    },
    firstResponseAt: {
      type: Date,
    },
    resolutionConfirmedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for analytics and attention queue filtering
ComplaintSchema.index({ status: 1, dueAt: 1 });
ComplaintSchema.index({ category: 1, createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
