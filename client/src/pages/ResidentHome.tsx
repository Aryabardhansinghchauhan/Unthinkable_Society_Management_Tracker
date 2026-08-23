import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Complaint, Notice } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { ComplaintCard } from '../features/complaints/ComplaintCard';
import { EmptyState } from '../components/ui/EmptyState';
import { MICROCOPY } from '../lib/microcopy';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Wrench,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const ResidentHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [complaintsRes, noticesRes] = await Promise.all([
          api.get('/complaints?limit=10'),
          api.get('/notices'),
        ]);
        setComplaints(complaintsRes.data.data?.complaints || []);
        setNotices(noticesRes.data.data || []);
      } catch (err) {
        console.error('Failed to load resident dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openCount = complaints.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const reopenedCount = complaints.filter((c) => c.status === 'REOPENED').length;

  const pinnedNotices = notices.filter((n) => n.isImportant).slice(0, 2);

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Greeting Hero */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-brand-950 p-8 sm:p-10 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-brand-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Flat {user?.flatNumber || 'B-204'} · {user?.building || 'Tower B'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Hello, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your maintenance requests, view technician assignments, and sign off when work is completed.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/report')}
            icon={<PlusCircle className="w-5 h-5 text-white" />}
            className="shadow-lg shadow-brand-500/25 shrink-0"
          >
            Report an Issue
          </Button>
        </div>
      </div>

      {/* Pinned Important Notice Banner */}
      {pinnedNotices.length > 0 && (
        <div className="space-y-3">
          {pinnedNotices.map((notice) => (
            <div
              key={notice._id}
              className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-3.5"
            >
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-950">
                    Important Notice: {notice.title}
                  </h4>
                  <Link
                    to="/notices"
                    className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-amber-800 mt-1 line-clamp-2">
                  {notice.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Issues"
          value={openCount}
          subtext="Awaiting review"
          accentColor="blue"
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          subtext="Technician assigned"
          accentColor="amber"
          icon={<Wrench className="w-6 h-6" />}
        />
        <StatCard
          label="Resolved"
          value={resolvedCount}
          subtext="Ready for your sign-off"
          accentColor="green"
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <StatCard
          label="Reopened"
          value={reopenedCount}
          subtext="Under re-evaluation"
          accentColor="rose"
          icon={<AlertCircle className="w-6 h-6" />}
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Your Maintenance Requests
            </h3>
            <p className="text-xs text-slate-500">
              Live status and resolution evidence for your flat
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/report')}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            New Request
          </Button>
        </div>

        {complaints.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 className="w-12 h-12 text-emerald-500" />}
            title="You're all clear 🎉"
            description={MICROCOPY.EMPTY_COMPLAINTS}
            actionLabel="Report an Issue"
            onAction={() => navigate('/report')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
