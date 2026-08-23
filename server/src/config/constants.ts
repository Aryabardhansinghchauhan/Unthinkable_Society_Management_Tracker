export const USER_ROLES = {
  RESIDENT: 'RESIDENT',
  ADMIN: 'ADMIN',
} as const;

export const COMPLAINT_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
} as const;

export const COMPLAINT_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export const COMPLAINT_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'Lift',
  'Cleaning',
  'Security',
  'Parking',
  'Common Area',
  'Other',
] as const;

export const ATTACHMENT_TYPES = {
  BEFORE: 'BEFORE',
  RESOLUTION: 'RESOLUTION',
  OTHER: 'OTHER',
} as const;

export const NOTIFICATION_TYPES = {
  STATUS_UPDATE: 'STATUS_UPDATE',
  NOTICE: 'NOTICE',
  REOPENED: 'REOPENED',
  RESOLUTION_CONFIRM: 'RESOLUTION_CONFIRM',
  ASSIGNMENT: 'ASSIGNMENT',
} as const;

export const DEFAULT_SLA_HOURS = {
  HIGH: 6,
  MEDIUM: 24,
  LOW: 48,
};

export const DEFAULT_OVERDUE_THRESHOLD_HOURS = 24;
export const DEFAULT_SOCIETY_NAME = 'Greenfield Heights Cooperative Housing Society';
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';
