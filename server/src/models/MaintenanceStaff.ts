import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceStaff extends Document {
  name: string;
  specialization: string; // e.g. Plumbing, Electrical, Lift
  phone: string;
  active: boolean;
  createdAt: Date;
}

const MaintenanceStaffSchema = new Schema<IMaintenanceStaff>(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const MaintenanceStaff = mongoose.model<IMaintenanceStaff>(
  'MaintenanceStaff',
  MaintenanceStaffSchema
);
