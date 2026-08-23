export type UserRole = 'RESIDENT' | 'ADMIN';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  flatNumber?: string;
  building?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ComplaintCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'Lift'
  | 'Cleaning'
  | 'Security'
  | 'Parking'
  | 'Common Area'
  | 'Other';

export interface MaintenanceStaff {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  active: boolean;
}

export interface ComplaintAttachment {
  _id: string;
  complaint: string;
  type: 'BEFORE' | 'RESOLUTION' | 'OTHER';
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdBy: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface ComplaintHistory {
  _id: string;
  complaint: string;
  actor: {
    _id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  oldStatus?: ComplaintStatus;
  newStatus?: ComplaintStatus;
  eventType: string;
  note?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  publicId: string;
  resident: User;
  category: ComplaintCategory;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  suggestedPriority?: string;
  prioritySuggestionReason?: string;
  assignedTo?: MaintenanceStaff;
  dueAt: string;
  resolvedAt?: string;
  reopenedAt?: string;
  firstResponseAt?: string;
  resolutionConfirmedAt?: string;
  isOverdue: boolean;
  hoursRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  _id: string;
  title: string;
  body: string;
  isImportant: boolean;
  author: {
    _id: string;
    name: string;
    role: string;
  };
  publishedAt: string;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  user: string;
  type: 'STATUS_UPDATE' | 'NOTICE' | 'REOPENED' | 'RESOLUTION_CONFIRM' | 'ASSIGNMENT';
  title: string;
  body: string;
  readAt?: string | null;
  relatedComplaint?: {
    _id: string;
    publicId: string;
    title: string;
    status: ComplaintStatus;
    priority: ComplaintPriority;
  };
  relatedNotice?: {
    _id: string;
    title: string;
    isImportant: boolean;
  };
  createdAt: string;
}

export interface DashboardKPIs {
  openCount: number;
  inProgressCount: number;
  reopenedCount: number;
  overdueCount: number;
  highPriorityOpenCount: number;
  resolvedThisMonth: number;
  totalComplaints: number;
  onTimeRate: number;
  avgFirstResponseHours: number;
  avgResolutionHours: number;
}

export interface RecurringPattern {
  category: string;
  building: string;
  count: number;
  uniqueFlatsCount: number;
  flats: string[];
  complaintIds: string[];
  publicIds: string[];
  firstReported: string;
  lastReported: string;
  summary: string;
  recommendation: string;
}

export interface CategoryInsight {
  category: string;
  total: number;
  open: number;
  resolved: number;
}

export interface TowerInsight {
  tower: string;
  total: number;
  open: number;
  resolved: number;
}

export interface SocietySettings {
  _id: string;
  overdueThresholdHours: number;
  defaultSlaByPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  societyName: string;
  timezone: string;
}

export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: any;
  } | null;
}
