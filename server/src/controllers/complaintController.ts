import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Complaint, IComplaint } from '../models/Complaint';
import { ComplaintHistory } from '../models/ComplaintHistory';
import { ComplaintAttachment } from '../models/ComplaintAttachment';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { MaintenanceStaff } from '../models/MaintenanceStaff';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { getNextPublicId } from '../utils/publicId';
import {
  calculateDueAt,
  enrichComplaintWithComputedFields,
  isComplaintOverdue,
} from '../services/overdueService';
import { suggestPriority } from '../services/smartPriorityService';
import { transitionStatus } from '../services/statusTransitionService';
import { processUploadedFile } from '../services/storageService';
import {
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  NOTIFICATION_TYPES,
  USER_ROLES,
} from '../config/constants';

export const getComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      status,
      priority,
      category,
      tower,
      assignedTo,
      search,
      overdueOnly,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query: any = {};

    // Role-based scope
    if (user.role === USER_ROLES.RESIDENT) {
      query.resident = user._id;
    }

    if (status && typeof status === 'string') {
      query.status = status;
    }

    if (priority && typeof priority === 'string') {
      query.priority = priority;
    }

    if (category && typeof category === 'string') {
      query.category = category;
    }

    if (assignedTo && typeof assignedTo === 'string') {
      query.assignedTo = assignedTo;
    }

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { publicId: searchRegex },
      ];
    }

    let complaints = await Complaint.find(query)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .sort({ [sortBy as string]: sortOrder === 'asc' ? 1 : -1 })
      .lean();

    // Tower filtering if requested (from populated resident)
    if (tower && typeof tower === 'string') {
      complaints = complaints.filter(
        (c: any) => c.resident?.building?.toLowerCase() === tower.toLowerCase()
      );
    }

    // Enrich with dynamic overdue field
    let enriched = complaints.map(enrichComplaintWithComputedFields);

    if (overdueOnly === 'true') {
      enriched = enriched.filter((c) => c.isOverdue);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const total = enriched.length;
    const paginated = enriched.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    sendSuccess(res, {
      complaints: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch complaints', 500);
  }
};

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { category, title, description, priority: requestedPriority } = req.body;

    if (!category || !title || !description) {
      sendError(res, 'Category, title, and description are required.', 400, 'VALIDATION_ERROR');
      return;
    }

    // Run rules-based smart priority
    const smartSuggestion = suggestPriority(category, title, description);
    const finalPriority =
      requestedPriority && Object.values(COMPLAINT_PRIORITY).includes(requestedPriority)
        ? requestedPriority
        : smartSuggestion.priority;

    const publicId = await getNextPublicId();
    const dueAt = await calculateDueAt(finalPriority);

    const complaint = await Complaint.create({
      publicId,
      resident: user._id,
      category,
      title: title.trim(),
      description: description.trim(),
      status: COMPLAINT_STATUS.OPEN,
      priority: finalPriority,
      suggestedPriority: smartSuggestion.priority,
      prioritySuggestionReason: smartSuggestion.reason,
      dueAt,
    });

    // Create initial audit history
    await ComplaintHistory.create({
      complaint: complaint._id,
      actor: user._id,
      oldStatus: undefined,
      newStatus: COMPLAINT_STATUS.OPEN,
      eventType: 'CREATED',
      note: 'Maintenance request created by resident.',
      metadata: {
        suggestedPriority: smartSuggestion.priority,
        reason: smartSuggestion.reason,
      },
    });

    // Notify Admins
    const admins = await User.find({ role: USER_ROLES.ADMIN });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: NOTIFICATION_TYPES.STATUS_UPDATE,
        title: `New Issue: ${complaint.publicId}`,
        body: `${user.name} reported "${complaint.title}" (${complaint.category}, ${complaint.priority} Priority).`,
        relatedComplaint: complaint._id,
      });
    }

    const populated = await Complaint.findById(complaint._id)
      .populate('resident', 'name email flatNumber building phone')
      .lean();

    sendSuccess(res, enrichComplaintWithComputedFields(populated), 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to create complaint', 500);
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    if (!complaint) {
      sendError(res, 'Complaint not found.', 404, 'NOT_FOUND');
      return;
    }

    // Resident ownership check
    if (
      user.role === USER_ROLES.RESIDENT &&
      complaint.resident._id.toString() !== user._id.toString()
    ) {
      sendError(res, 'You do not have permission to view this complaint.', 403, 'FORBIDDEN');
      return;
    }

    const history = await ComplaintHistory.find({ complaint: complaint._id })
      .populate('actor', 'name role avatarUrl')
      .sort({ createdAt: 1 })
      .lean();

    const attachments = await ComplaintAttachment.find({ complaint: complaint._id })
      .populate('createdBy', 'name role')
      .sort({ createdAt: 1 })
      .lean();

    const enriched = enrichComplaintWithComputedFields(complaint);

    sendSuccess(res, {
      complaint: enriched,
      history,
      attachments,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch complaint details', 500);
  }
};

export const updateComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { priority, dueAt, note } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      sendError(res, 'Complaint not found.', 404, 'NOT_FOUND');
      return;
    }

    const metadata: Record<string, any> = {};

    if (priority && priority !== complaint.priority) {
      metadata.priority = { from: complaint.priority, to: priority };
      complaint.priority = priority;
      if (!dueAt) {
        complaint.dueAt = await calculateDueAt(priority, complaint.createdAt);
      }
    }

    if (dueAt) {
      metadata.dueAt = { from: complaint.dueAt, to: new Date(dueAt) };
      complaint.dueAt = new Date(dueAt);
    }

    await complaint.save();

    if (Object.keys(metadata).length > 0 || note) {
      await ComplaintHistory.create({
        complaint: complaint._id,
        actor: user._id,
        eventType: 'UPDATED',
        note: note || 'Complaint settings updated by administrator.',
        metadata,
      });
    }

    const updated = await Complaint.findById(id)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    sendSuccess(res, enrichComplaintWithComputedFields(updated));
  } catch (error: any) {
    sendError(res, error.message || 'Failed to update complaint', 500);
  }
};

export const changeStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      sendError(res, 'Target status is required.', 400, 'VALIDATION_ERROR');
      return;
    }

    const updatedComplaint = await transitionStatus(id, status, user._id, {
      note,
      isResidentAction: false,
    });

    const populated = await Complaint.findById(updatedComplaint._id)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    sendSuccess(res, enrichComplaintWithComputedFields(populated));
  } catch (error: any) {
    sendError(res, error.message || 'Failed to change complaint status', error.statusCode || 500);
  }
};

export const assignStaff = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { staffId, note } = req.body;

    if (!staffId) {
      sendError(res, 'Staff ID is required.', 400, 'VALIDATION_ERROR');
      return;
    }

    const staff = await MaintenanceStaff.findById(staffId);
    if (!staff) {
      sendError(res, 'Maintenance staff member not found.', 404, 'NOT_FOUND');
      return;
    }

    const complaint = await Complaint.findById(id).populate('resident');
    if (!complaint) {
      sendError(res, 'Complaint not found.', 404, 'NOT_FOUND');
      return;
    }

    const previousAssigneeId = complaint.assignedTo?.toString();
    complaint.assignedTo = staff._id as any;

    if (!complaint.firstResponseAt) {
      complaint.firstResponseAt = new Date();
    }

    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      actor: user._id,
      eventType: 'ASSIGNED',
      note: note || `Assigned to ${staff.name} (${staff.specialization}).`,
      metadata: {
        staffName: staff.name,
        specialization: staff.specialization,
        previousAssigneeId,
      },
    });

    // Notify resident
    const resident: any = complaint.resident;
    if (resident) {
      await Notification.create({
        user: resident._id,
        type: NOTIFICATION_TYPES.ASSIGNMENT,
        title: 'Technician Assigned 👷',
        body: `${staff.name} (${staff.specialization}) has been assigned to your issue "${complaint.title}" (${complaint.publicId}).`,
        relatedComplaint: complaint._id,
      });
    }

    const populated = await Complaint.findById(complaint._id)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    sendSuccess(res, enrichComplaintWithComputedFields(populated));
  } catch (error: any) {
    sendError(res, error.message || 'Failed to assign staff', 500);
  }
};

export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { type = 'BEFORE' } = req.body;
    const file = req.file;

    if (!file) {
      sendError(res, 'No file uploaded.', 400, 'FILE_MISSING');
      return;
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      sendError(res, 'Complaint not found.', 404, 'NOT_FOUND');
      return;
    }

    const processed = processUploadedFile(file);

    const attachment = await ComplaintAttachment.create({
      complaint: complaint._id,
      type,
      url: processed.url,
      filename: processed.filename,
      mimeType: processed.mimeType,
      sizeBytes: processed.sizeBytes,
      createdBy: user._id,
    });

    await ComplaintHistory.create({
      complaint: complaint._id,
      actor: user._id,
      eventType: 'ATTACHMENT_ADDED',
      note: `${type === 'RESOLUTION' ? 'Resolution evidence' : 'Attachment'} photo uploaded: ${processed.filename}`,
      metadata: {
        attachmentId: attachment._id,
        type,
      },
    });

    sendSuccess(res, attachment, 201);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to upload attachment', 500);
  }
};

export const reopenComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim().length === 0) {
      sendError(res, 'Please provide a brief reason why this is still unresolved.', 400, 'NOTE_REQUIRED');
      return;
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      sendError(res, 'Complaint not found.', 404, 'NOT_FOUND');
      return;
    }

    if (complaint.resident.toString() !== user._id.toString()) {
      sendError(res, 'Only the resident who reported this can reopen it.', 403, 'FORBIDDEN');
      return;
    }

    const updated = await transitionStatus(id, COMPLAINT_STATUS.REOPENED, user._id, {
      note: note.trim(),
      isResidentAction: true,
    });

    const populated = await Complaint.findById(updated._id)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    sendSuccess(res, enrichComplaintWithComputedFields(populated));
  } catch (error: any) {
    sendError(res, error.message || 'Failed to reopen complaint', error.statusCode || 500);
  }
};

export const confirmResolution = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { feedback } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      sendError(res, 'Complaint not found.', 404, 'NOT_FOUND');
      return;
    }

    if (complaint.resident.toString() !== user._id.toString()) {
      sendError(res, 'Only the resident who reported this can confirm resolution.', 403, 'FORBIDDEN');
      return;
    }

    if (complaint.status !== COMPLAINT_STATUS.RESOLVED) {
      sendError(res, 'Resolution can only be confirmed on resolved complaints.', 400, 'INVALID_STATE');
      return;
    }

    complaint.resolutionConfirmedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaint: complaint._id,
      actor: user._id,
      eventType: 'RESOLUTION_CONFIRMED',
      note: feedback ? `Resident confirmed resolution: "${feedback}"` : 'Resident confirmed the issue was completely fixed. 🎉',
      metadata: { feedback },
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    sendSuccess(res, enrichComplaintWithComputedFields(populated));
  } catch (error: any) {
    sendError(res, error.message || 'Failed to confirm resolution', 500);
  }
};

export const suggestPriorityEndpoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, title, description } = req.body;
    if (!category && !title && !description) {
      sendError(res, 'Please provide category, title or description to analyze.', 400);
      return;
    }

    const suggestion = suggestPriority(
      category || 'Other',
      title || '',
      description || ''
    );

    sendSuccess(res, suggestion);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to suggest priority', 500);
  }
};
