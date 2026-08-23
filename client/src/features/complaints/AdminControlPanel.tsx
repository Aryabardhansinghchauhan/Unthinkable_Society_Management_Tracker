import React, { useState, useEffect } from 'react';
import { Complaint, MaintenanceStaff, ComplaintPriority, ComplaintStatus } from '../../types';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileUploader } from '../../components/ui/FileUploader';
import {
  UserCheck,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  UploadCloud,
  FileText,
} from 'lucide-react';

interface AdminControlPanelProps {
  complaint: Complaint;
  onRefresh: () => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  complaint,
  onRefresh,
}) => {
  const [staffList, setStaffList] = useState<MaintenanceStaff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState(complaint.assignedTo?._id || '');
  const [assigning, setAssigning] = useState(false);

  const [statusNote, setStatusNote] = useState('');
  const [changingStatus, setChangingStatus] = useState(false);

  const [resolutionFile, setResolutionFile] = useState<File | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/staff');
        setStaffList(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch staff', err);
      }
    };
    fetchStaff();
  }, []);

  const handleAssign = async () => {
    if (!selectedStaffId) return;
    setAssigning(true);
    setError(null);
    try {
      await api.post(`/complaints/${complaint._id}/assign`, {
        staffId: selectedStaffId,
      });
      setSuccessMsg('Staff assigned successfully.');
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to assign staff.');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    setChangingStatus(true);
    setError(null);
    try {
      await api.post(`/complaints/${complaint._id}/status`, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      setStatusNote('');
      setSuccessMsg(`Status updated to ${newStatus}.`);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid status transition.');
    } finally {
      setChangingStatus(false);
    }
  };

  const handleUploadResolutionEvidence = async () => {
    if (!resolutionFile) return;
    setUploadingEvidence(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', resolutionFile);
      formData.append('type', 'RESOLUTION');
      await api.post(`/complaints/${complaint._id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResolutionFile(null);
      setSuccessMsg('Resolution evidence photo uploaded.');
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Upload failed.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  return (
    <Card className="p-6 border-blue-200 bg-gradient-to-b from-blue-50/40 to-white space-y-6">
      <div className="flex items-center justify-between border-b border-blue-100 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Administrator Triage & Controls
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          Admin Access
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Staff Assignment */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Assign Maintenance Technician
          </label>
          <div className="flex gap-2">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choose technician --</option>
              {staffList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.specialization})
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAssign}
              loading={assigning}
              disabled={!selectedStaffId || selectedStaffId === complaint.assignedTo?._id}
              icon={<UserCheck className="w-3.5 h-3.5" />}
            >
              Assign
            </Button>
          </div>
        </div>

        {/* Status Transition Action Buttons */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Lifecycle Actions
          </label>
          <div className="flex flex-wrap gap-2">
            {(complaint.status === 'OPEN' || complaint.status === 'REOPENED') && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleStatusChange('IN_PROGRESS')}
                loading={changingStatus}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                Start Work (In Progress)
              </Button>
            )}

            {complaint.status === 'IN_PROGRESS' && (
              <Button
                size="sm"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleStatusChange('RESOLVED')}
                loading={changingStatus}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Mark as Resolved
              </Button>
            )}

            {complaint.status === 'RESOLVED' && (
              <span className="text-xs text-slate-500 font-medium py-1.5">
                Waiting for resident resolution sign-off.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Photo Upload for Admin */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Upload Resolution Evidence Photo (After Repair)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1">
            <FileUploader
              label="Select resolution proof photo"
              onFileSelect={setResolutionFile}
            />
          </div>
          {resolutionFile && (
            <Button
              size="md"
              onClick={handleUploadResolutionEvidence}
              loading={uploadingEvidence}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Attach Resolution Proof
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
