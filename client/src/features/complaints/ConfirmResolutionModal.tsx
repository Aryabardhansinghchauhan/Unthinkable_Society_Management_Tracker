import React, { useState } from 'react';
import { Complaint } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { triggerConfetti } from '../../lib/utils';
import { MICROCOPY } from '../../lib/microcopy';
import { CheckCircle2, RotateCcw, ThumbsUp, AlertTriangle } from 'lucide-react';

interface ConfirmResolutionModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const ConfirmResolutionModal: React.FC<ConfirmResolutionModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [step, setStep] = useState<'CHOICE' | 'REOPEN_FORM'>('CHOICE');
  const [reopenNote, setReopenNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmYes = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/complaints/${complaint._id}/confirm-resolution`, {
        feedback: feedback.trim() || undefined,
      });
      triggerConfetti();
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to confirm resolution');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmNo = async () => {
    if (!reopenNote.trim()) {
      setError('Please provide a reason why the issue is still unresolved.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/complaints/${complaint._id}/reopen`, {
        note: reopenNote.trim(),
      });
      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reopen complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'CHOICE' ? MICROCOPY.RESOLVED_TITLE : 'Reopen Maintenance Ticket'}
      subtitle={
        step === 'CHOICE'
          ? `Complaint ${complaint.publicId}`
          : 'Let the estate manager know what still needs fixing'
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'CHOICE' ? (
        <div className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-base font-bold text-emerald-950 mb-1">
              Was this actually fixed?
            </h4>
            <p className="text-xs text-emerald-700 max-w-sm mx-auto">
              The technician marked this issue as resolved. Please verify before we close the ticket.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Optional feedback for the society staff
            </label>
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. Prompt service, cleanly repaired!"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('REOPEN_FORM')}
              className="p-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-700 hover:text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>No, Still Happening</span>
            </button>

            <Button
              onClick={handleConfirmYes}
              loading={submitting}
              icon={<ThumbsUp className="w-4 h-4" />}
            >
              Yes, Completely Fixed
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Issue Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reopenNote}
              onChange={(e) => setReopenNote(e.target.value)}
              placeholder="e.g. The leak slowed down, but water started dripping again this evening..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setStep('CHOICE');
                setError(null);
              }}
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmNo}
              loading={submitting}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Confirm Reopen Request
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
