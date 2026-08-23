import mongoose, { Schema, Document, Types } from 'mongoose';
import { ATTACHMENT_TYPES } from '../config/constants';

export interface IComplaintAttachment extends Document {
  complaint: Types.ObjectId;
  type: (typeof ATTACHMENT_TYPES)[keyof typeof ATTACHMENT_TYPES];
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const ComplaintAttachmentSchema = new Schema<IComplaintAttachment>(
  {
    complaint: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ATTACHMENT_TYPES),
      default: ATTACHMENT_TYPES.BEFORE,
    },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const ComplaintAttachment = mongoose.model<IComplaintAttachment>(
  'ComplaintAttachment',
  ComplaintAttachmentSchema
);
