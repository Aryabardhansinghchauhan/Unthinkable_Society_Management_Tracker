import { Types } from 'mongoose';
import { Complaint, IComplaint } from '../models/Complaint';
import { ComplaintHistory } from '../models/ComplaintHistory';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { COMPLAINT_STATUS, NOTIFICATION_TYPES } from '../config/constants';
import { sendEmail } from './emailService';

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [COMPLAINT_STATUS.OPEN]: [COMPLAINT_STATUS.IN_PROGRESS],
  [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED],
  [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.REOPENED],
  [COMPLAINT_STATUS.REOPENED]: [COMPLAINT_STATUS.IN_PROGRESS],
};

export class TransitionError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'INVALID_TRANSITION') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const canTransition = (currentStatus: string, targetStatus: string): boolean => {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return Boolean(allowed && allowed.includes(targetStatus));
};

export const transitionStatus = async (
  complaintId: string | Types.ObjectId,
  targetStatus: string,
  actorId: string | Types.ObjectId,
  options?: {
    note?: string;
    metadata?: Record<string, any>;
    isResidentAction?: boolean;
  }
): Promise<IComplaint> => {
  const complaint = await Complaint.findById(complaintId).populate('resident');
  if (!complaint) {
    throw new TransitionError('Complaint not found', 404, 'NOT_FOUND');
  }

  const currentStatus = complaint.status;

  if (currentStatus === targetStatus) {
    return complaint;
  }

  if (!canTransition(currentStatus, targetStatus)) {
    throw new TransitionError(
      `Cannot transition complaint from "${currentStatus}" to "${targetStatus}". Allowed next state: [${(
        ALLOWED_TRANSITIONS[currentStatus] || []
      ).join(', ')}]`
    );
  }

  // Resident check for REOPENED
  if (targetStatus === COMPLAINT_STATUS.REOPENED && !options?.isResidentAction) {
    throw new TransitionError(
      'Complaints can only be reopened by the resident who reported them.',
      403,
      'FORBIDDEN'
    );
  }

  // Update complaint properties
  complaint.status = targetStatus as any;

  if (targetStatus === COMPLAINT_STATUS.IN_PROGRESS && !complaint.firstResponseAt) {
    complaint.firstResponseAt = new Date();
  }

  if (targetStatus === COMPLAINT_STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
  }

  if (targetStatus === COMPLAINT_STATUS.REOPENED) {
    complaint.reopenedAt = new Date();
    if (!options?.note) {
      throw new TransitionError('A reason note is required when reopening a complaint.');
    }
  }

  await complaint.save();

  // Create audit history
  await ComplaintHistory.create({
    complaint: complaint._id,
    actor: actorId,
    oldStatus: currentStatus,
    newStatus: targetStatus,
    eventType: targetStatus === COMPLAINT_STATUS.REOPENED ? 'REOPENED' : 'STATUS_CHANGED',
    note: options?.note || `Status updated from ${currentStatus} to ${targetStatus}`,
    metadata: options?.metadata,
  });

  // Notify resident or admin
  const residentUser: any = complaint.resident;

  if (targetStatus === COMPLAINT_STATUS.RESOLVED && residentUser) {
    await Notification.create({
      user: residentUser._id,
      type: NOTIFICATION_TYPES.RESOLUTION_CONFIRM,
      title: 'Looks like this is fixed 🎉',
      body: `The maintenance team marked "${complaint.title}" (${complaint.publicId}) as resolved. Was this actually fixed?`,
      relatedComplaint: complaint._id,
    });

    if (residentUser.email) {
      await sendEmail({
        to: residentUser.email,
        subject: `[${complaint.publicId}] Maintenance resolved: ${complaint.title}`,
        text: `Hello ${residentUser.name},\n\nYour complaint "${complaint.title}" (${complaint.publicId}) has been marked resolved. Please visit the portal to confirm resolution or let us know if you need more help.\n\nFixFlow Society Team`,
      });
    }
  } else if (targetStatus === COMPLAINT_STATUS.IN_PROGRESS && residentUser) {
    await Notification.create({
      user: residentUser._id,
      type: NOTIFICATION_TYPES.STATUS_UPDATE,
      title: 'Work has started 🛠️',
      body: `A technician has begun work on your request: "${complaint.title}" (${complaint.publicId}).`,
      relatedComplaint: complaint._id,
    });
  } else if (targetStatus === COMPLAINT_STATUS.REOPENED) {
    // Notify society admins
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: NOTIFICATION_TYPES.REOPENED,
        title: '⚠️ Complaint Reopened by Resident',
        body: `Resident ${residentUser?.name || ''} reopened "${complaint.title}" (${complaint.publicId}): "${options?.note}"`,
        relatedComplaint: complaint._id,
      });
    }
  }

  return complaint;
};
