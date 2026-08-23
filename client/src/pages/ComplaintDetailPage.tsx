import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Complaint, ComplaintHistory, ComplaintAttachment } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Timeline } from '../components/ui/Timeline';
import { EvidenceViewer } from '../features/complaints/EvidenceViewer';
import { ConfirmResolutionModal } from '../features/complaints/ConfirmResolutionModal';
import { AdminControlPanel } from '../features/complaints/AdminControlPanel';
import { formatDate, formatTimeAgo } from '../lib/utils';
import { MICROCOPY } from '../lib/microcopy';
import {
  ArrowLeft,
  Clock,
  UserCheck,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistory[]>([]);
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.data?.complaint || null);
      setHistory(res.data.data?.history || []);
      setAttachments(res.data.data?.attachments || []);
    } catch (err) {
      console.error('Failed to load complaint details', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading maintenance record...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <h3 className="text-lg font-bold text-slate-800">Issue not found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This maintenance request could not be located or you may not have permission to view it.
        </p>
        <Button onClick={() => navigate('/')} variant="outline">
          Return Home
        </Button>
      </div>
    );
  }

  const isResident = user?.role === 'RESIDENT';
  const isAdmin = user?.role === 'ADMIN';
  const isResolved = complaint.status === 'RESOLVED';
  const isResolutionConfirmed = Boolean(complaint.resolutionConfirmedAt);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to requests</span>
        </button>
      </div>

      {/* Main Header Card */}
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold bg-slate-900 text-white px-3 py-1 rounded-xl">
                {complaint.publicId}
              </span>
              <StatusBadge status={complaint.status} isOverdue={complaint.isOverdue} />
              <PriorityBadge priority={complaint.priority} />
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {complaint.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {complaint.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {complaint.description}
            </p>
          </div>

          {/* Quick SLA / Overdue Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 lg:min-w-[280px] space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 uppercase tracking-wider">
                Resolution Target
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {formatDate(complaint.dueAt)}
              </p>
              {complaint.isOverdue ? (
                <p className="text-xs font-bold text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Past resolution SLA
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Expected within {complaint.hoursRemaining || 24} hours
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Resident:</span>
                <span className="font-semibold text-slate-900">
                  {complaint.resident.name} ({complaint.resident.flatNumber || 'Flat'}, {complaint.resident.building || 'Tower'})
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Assigned:</span>
                <span className="font-semibold text-slate-900">
                  {complaint.assignedTo ? complaint.assignedTo.name : 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resident Resolution Banner (Prompt if RESOLVED) */}
        {isResolved && isResident && !isResolutionConfirmed && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {MICROCOPY.RESOLVED_TITLE}
                </h4>
                <p className="text-xs text-emerald-800">
                  {MICROCOPY.RESOLVED_BODY}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsConfirmModalOpen(true)}
              variant="primary"
              size="md"
              icon={<ThumbsUp className="w-4 h-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
            >
              Sign Off / Reopen
            </Button>
          </div>
        )}

        {/* Resolution Confirmed Badge */}
        {isResolutionConfirmed && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3 text-xs font-semibold text-emerald-800">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Resolution was reviewed and confirmed by {complaint.resident.name} on{' '}
              {formatDate(complaint.resolutionConfirmedAt)}.
            </span>
          </div>
        )}
      </Card>

      {/* Admin Control Panel (if logged in as admin) */}
      {isAdmin && (
        <AdminControlPanel complaint={complaint} onRefresh={fetchDetails} />
      )}

      {/* Attachments & Evidence Viewer */}
      <Card className="p-6 sm:p-8">
        <EvidenceViewer attachments={attachments} />
      </Card>

      {/* Vertical Status & History Timeline */}
      <Card className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Accountability Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Every status update, technician assignment, and resident sign-off event
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {history.length} events
          </span>
        </div>

        <Timeline events={history} />
      </Card>

      {/* Confirm Resolution / Reopen Modal */}
      {isConfirmModalOpen && (
        <ConfirmResolutionModal
          complaint={complaint}
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onRefresh={fetchDetails}
        />
      )}
    </div>
  );
};
