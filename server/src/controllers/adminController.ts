import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Complaint } from '../models/Complaint';
import { sendError, sendSuccess } from '../utils/apiResponse';
import { enrichComplaintWithComputedFields } from '../services/overdueService';
import { detectRecurringIssues } from '../services/recurringIssueService';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../config/constants';

export const getDashboardKPIs = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allComplaints = await Complaint.find()
      .populate('resident', 'name email flatNumber building phone')
      .populate('assignedTo', 'name specialization phone active')
      .lean();

    const enriched = allComplaints.map(enrichComplaintWithComputedFields);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const openCount = enriched.filter((c) => c.status === COMPLAINT_STATUS.OPEN).length;
    const inProgressCount = enriched.filter(
      (c) => c.status === COMPLAINT_STATUS.IN_PROGRESS
    ).length;
    const reopenedCount = enriched.filter(
      (c) => c.status === COMPLAINT_STATUS.REOPENED
    ).length;
    const overdueCount = enriched.filter((c) => c.isOverdue).length;
    const highPriorityOpenCount = enriched.filter(
      (c) =>
        c.priority === COMPLAINT_PRIORITY.HIGH &&
        (c.status === COMPLAINT_STATUS.OPEN || c.status === COMPLAINT_STATUS.REOPENED)
    ).length;

    const resolvedThisMonth = enriched.filter(
      (c) => c.status === COMPLAINT_STATUS.RESOLVED && c.resolvedAt && new Date(c.resolvedAt) >= startOfMonth
    ).length;

    // Calculate On-Time Resolution Rate
    const allResolved = enriched.filter((c) => c.status === COMPLAINT_STATUS.RESOLVED && c.resolvedAt);
    let onTimeCount = 0;
    let totalResolutionHours = 0;
    let validResolutionCases = 0;

    for (const item of allResolved) {
      const resolvedDate = new Date(item.resolvedAt!);
      const dueDate = new Date(item.dueAt);
      if (resolvedDate <= dueDate) {
        onTimeCount++;
      }
      const createdDate = new Date(item.createdAt);
      const resHours = (resolvedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      if (resHours >= 0) {
        totalResolutionHours += resHours;
        validResolutionCases++;
      }
    }

    const onTimeRate =
      allResolved.length > 0 ? Math.round((onTimeCount / allResolved.length) * 100) : 100;
    const avgResolutionHours =
      validResolutionCases > 0 ? Math.round((totalResolutionHours / validResolutionCases) * 10) / 10 : 0;

    // Calculate Average First Response Time (hours)
    let totalResponseHours = 0;
    let validResponseCases = 0;
    for (const item of enriched) {
      if (item.firstResponseAt) {
        const responseDate = new Date(item.firstResponseAt);
        const createdDate = new Date(item.createdAt);
        const respHours = (responseDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        if (respHours >= 0) {
          totalResponseHours += respHours;
          validResponseCases++;
        }
      }
    }
    const avgFirstResponseHours =
      validResponseCases > 0 ? Math.round((totalResponseHours / validResponseCases) * 10) / 10 : 0;

    // Attention Queue: Items requiring immediate admin triage
    // Prioritized by: Overdue -> Reopened -> High Priority Open -> General Open
    const attentionQueue = enriched
      .filter((c) => c.status !== COMPLAINT_STATUS.RESOLVED)
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.status === COMPLAINT_STATUS.REOPENED && b.status !== COMPLAINT_STATUS.REOPENED)
          return -1;
        if (a.status !== COMPLAINT_STATUS.REOPENED && b.status === COMPLAINT_STATUS.REOPENED)
          return 1;
        if (a.priority === COMPLAINT_PRIORITY.HIGH && b.priority !== COMPLAINT_PRIORITY.HIGH)
          return -1;
        if (a.priority !== COMPLAINT_PRIORITY.HIGH && b.priority === COMPLAINT_PRIORITY.HIGH)
          return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 10);

    sendSuccess(res, {
      kpis: {
        openCount,
        inProgressCount,
        reopenedCount,
        overdueCount,
        highPriorityOpenCount,
        resolvedThisMonth,
        totalComplaints: enriched.length,
        onTimeRate, // e.g. 92%
        avgFirstResponseHours, // e.g. 1.8 hrs
        avgResolutionHours, // e.g. 14.5 hrs
      },
      attentionQueue,
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch dashboard metrics', 500);
  }
};

export const getInsights = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          open: {
            $sum: {
              $cond: [{ $in: ['$status', [COMPLAINT_STATUS.OPEN, COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.REOPENED]] }, 1, 0],
            },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', COMPLAINT_STATUS.RESOLVED] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const towerStats = await Complaint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'resident',
          foreignField: '_id',
          as: 'residentInfo',
        },
      },
      { $unwind: '$residentInfo' },
      {
        $group: {
          _id: { $ifNull: ['$residentInfo.building', 'General'] },
          total: { $sum: 1 },
          open: {
            $sum: {
              $cond: [{ $in: ['$status', [COMPLAINT_STATUS.OPEN, COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.REOPENED]] }, 1, 0],
            },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', COMPLAINT_STATUS.RESOLVED] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    sendSuccess(res, {
      categoryStats: categoryStats.map((c) => ({
        category: c._id,
        total: c.total,
        open: c.open,
        resolved: c.resolved,
      })),
      towerStats: towerStats.map((t) => ({
        tower: t._id,
        total: t.total,
        open: t.open,
        resolved: t.resolved,
      })),
    });
  } catch (error: any) {
    sendError(res, error.message || 'Failed to fetch insights', 500);
  }
};

export const getRecurringIssues = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patterns = await detectRecurringIssues(30, 3);
    sendSuccess(res, patterns);
  } catch (error: any) {
    sendError(res, error.message || 'Failed to detect recurring issues', 500);
  }
};
