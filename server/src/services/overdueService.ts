import { IComplaint } from '../models/Complaint';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../config/constants';
import { getOrCreateSettings } from '../models/Settings';

export const isComplaintOverdue = (complaint: IComplaint): boolean => {
  const activeStatuses = [
    COMPLAINT_STATUS.OPEN,
    COMPLAINT_STATUS.IN_PROGRESS,
    COMPLAINT_STATUS.REOPENED,
  ];

  if (!activeStatuses.includes(complaint.status as any)) {
    return false;
  }

  return new Date() > new Date(complaint.dueAt);
};

export const calculateDueAt = async (
  priority: (typeof COMPLAINT_PRIORITY)[keyof typeof COMPLAINT_PRIORITY],
  fromDate: Date = new Date()
): Promise<Date> => {
  const settings = await getOrCreateSettings();
  const hours =
    settings.defaultSlaByPriority[priority] ||
    (priority === COMPLAINT_PRIORITY.HIGH ? 6 : priority === COMPLAINT_PRIORITY.MEDIUM ? 24 : 48);

  const due = new Date(fromDate.getTime() + hours * 60 * 60 * 1000);
  return due;
};

export const enrichComplaintWithComputedFields = (complaintDoc: any) => {
  const plain = complaintDoc.toObject ? complaintDoc.toObject() : { ...complaintDoc };
  const isOverdue = isComplaintOverdue(plain);

  const now = new Date().getTime();
  const dueTime = new Date(plain.dueAt).getTime();
  const msRemaining = dueTime - now;

  return {
    ...plain,
    isOverdue,
    hoursRemaining: Math.round(msRemaining / (1000 * 60 * 60)),
  };
};
