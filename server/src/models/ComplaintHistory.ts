import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComplaintHistory extends Document {
  complaint: Types.ObjectId;
  actor: Types.ObjectId;
  oldStatus?: string;
  newStatus?: string;
  eventType?: string; // e.g. CREATED, STATUS_CHANGED, ASSIGNED, PRIORITY_CHANGED, REOPENED, RESOLUTION_CONFIRMED, NOTE_ADDED
  note?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ComplaintHistorySchema = new Schema<IComplaintHistory>(
  {
    complaint: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    oldStatus: { type: String },
    newStatus: { type: String },
    eventType: { type: String, default: 'STATUS_CHANGED' },
    note: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ComplaintHistorySchema.index({ complaint: 1, createdAt: 1 });

export const ComplaintHistory = mongoose.model<IComplaintHistory>(
  'ComplaintHistory',
  ComplaintHistorySchema
);
