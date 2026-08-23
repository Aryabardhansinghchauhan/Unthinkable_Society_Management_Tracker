import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ComplaintCategory, ComplaintPriority } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FileUploader } from '../../components/ui/FileUploader';
import { PriorityBadge } from '../../components/ui/Badge';
import { triggerConfetti } from '../../lib/utils';
import { MICROCOPY } from '../../lib/microcopy';
import {
  Droplets,
  Zap,
  ArrowUpDown,
  Sparkles,
  Shield,
  Car,
  Trees,
  HelpCircle,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkle,
  CheckCircle2,
} from 'lucide-react';

const CATEGORIES: { name: ComplaintCategory; icon: any; description: string }[] = [
  { name: 'Plumbing', icon: Droplets, description: 'Leaks, drainage, taps, pipes' },
  { name: 'Electrical', icon: Zap, description: 'Power cuts, switches, sparks, wiring' },
  { name: 'Lift', icon: ArrowUpDown, description: 'Elevator stops, strange noises, doors' },
  { name: 'Cleaning', icon: Sparkles, description: 'Corridors, garbage disposal, dusting' },
  { name: 'Security', icon: Shield, description: 'Gates, intercom, visitor entry issues' },
  { name: 'Parking', icon: Car, description: 'Slot blockage, unauthorized parking' },
  { name: 'Common Area', icon: Trees, description: 'Clubhouse, garden, gym equipment' },
  { name: 'Other', icon: HelpCircle, description: 'General society maintenance' },
];

export const ReportWizard: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<ComplaintCategory>('Plumbing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Live smart priority suggestion state
  const [suggestedPriority, setSuggestedPriority] = useState<ComplaintPriority>('MEDIUM');
  const [suggestionReason, setSuggestionReason] = useState<string>(
    'Standard maintenance issue with typical society resolution timeframe.'
  );

  useEffect(() => {
    // Debounce smart priority analysis
    const timer = setTimeout(async () => {
      if (title.trim().length > 3 || description.trim().length > 5) {
        try {
          const res = await api.post('/complaints/suggest-priority', {
            category,
            title,
            description,
          });
          if (res.data.data) {
            setSuggestedPriority(res.data.data.priority);
            setSuggestionReason(res.data.data.reason);
          }
        } catch (err) {
          // Silent fallback to local heuristic
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [category, title, description]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 1. Create Complaint
      const res = await api.post('/complaints', {
        category,
        title: title.trim(),
        description: description.trim(),
      });
      const complaint = res.data.data;

      // 2. Upload photo if provided
      if (selectedFile && complaint._id) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'BEFORE');
        await api.post(`/complaints/${complaint._id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSubmittedId(complaint._id);
      triggerConfetti();
    } catch (err) {
      console.error('Failed to submit complaint', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          {MICROCOPY.SUBMIT_SUCCESS}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-8">
          The society maintenance team has received your ticket and will begin diagnosis within the SLA window.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => navigate(`/complaints/${submittedId}`)}
            variant="primary"
            className="w-full sm:w-auto"
          >
            Track Status Timeline
          </Button>
          <Button
            onClick={() => {
              setSubmittedId(null);
              setStep(1);
              setTitle('');
              setDescription('');
              setSelectedFile(null);
            }}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Report Another Issue
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xs mx-auto mb-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 shadow-md'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Step {step} of 3
          </p>
          <h2 className="text-lg font-bold text-slate-800">
            {step === 1 && 'Select Issue Category'}
            {step === 2 && 'Describe What Happened'}
            {step === 3 && 'Review & Confirm Submission'}
          </h2>
        </div>
      </div>

      {/* Step 1: Category Picker */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-36 ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight line-clamp-2 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setStep(2)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Details & Photo */}
      {step === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water leaking from master bedroom ceiling"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific location, when it started, and severity..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Smart Priority Suggestion Preview */}
          {(title.length > 3 || description.length > 5) && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5 animate-fade-in">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <Sparkle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {MICROCOPY.PRIORITY_SUGGESTED_LABEL}:
                  </span>
                  <PriorityBadge priority={suggestedPriority} />
                </div>
                <p className="text-xs text-slate-600">{suggestionReason}</p>
              </div>
            </div>
          )}

          {/* Photo Evidence Upload */}
          <FileUploader
            label="Attach Photo Evidence (Recommended)"
            onFileSelect={setSelectedFile}
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!title.trim() || !description.trim()}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Review Ticket
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {category} Issue
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{title}</h3>
              </div>
              <PriorityBadge priority={suggestedPriority} />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Description
              </span>
              <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200/60">
                {description}
              </p>
            </div>

            {selectedFile && (
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Attached Photo Evidence
                </span>
                <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  📎 {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Edit Details
            </Button>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              icon={<Check className="w-4 h-4" />}
            >
              Confirm & Submit Request
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
