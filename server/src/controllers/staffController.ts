import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { MaintenanceStaff } from '../models/MaintenanceStaff';
import { sendError, sendSuccess } from '../utils/apiResponse';

export const getStaff = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const staff = await MaintenanceStaff.find({ active: true }).sort({ name: 1 }).lean();
    sendSuccess(res, staff);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch staff members', 500);
  }
};

export const createStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, specialization, phone } = req.body;

    if (!name || !specialization || !phone) {
      sendError(res, 'Name, specialization, and phone are required.', 400, 'VALIDATION_ERROR');
      return;
    }

    const staff = await MaintenanceStaff.create({
      name: name.trim(),
      specialization: specialization.trim(),
      phone: phone.trim(),
      active: true,
    });

    sendSuccess(res, staff, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create staff member', 500);
  }
};

export const updateStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, specialization, phone, active } = req.body;

    const staff = await MaintenanceStaff.findById(id);
    if (!staff) {
      sendError(res, 'Staff member not found.', 404, 'NOT_FOUND');
      return;
    }

    if (name !== undefined) staff.name = name.trim();
    if (specialization !== undefined) staff.specialization = specialization.trim();
    if (phone !== undefined) staff.phone = phone.trim();
    if (active !== undefined) staff.active = Boolean(active);

    await staff.save();
    sendSuccess(res, staff);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update staff member', 500);
  }
};
