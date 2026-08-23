import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotice extends Document {
  title: string;
  body: string;
  isImportant: boolean;
  author: Types.ObjectId;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    isImportant: { type: Boolean, default: false, index: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Notice = mongoose.model<INotice>('Notice', NoticeSchema);
