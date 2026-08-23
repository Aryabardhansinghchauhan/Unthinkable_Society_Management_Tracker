import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  DashboardKPIs,
  Complaint,
  RecurringPattern,
  CategoryInsight,
  TowerInsight,
} from '../types';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { NeedsAttentionHero } from '../features/admin/NeedsAttentionHero';
import { RecurringIssueBanner } from '../features/admin/RecurringIssueBanner';
import { ProblemMapChart } from '../features/admin/ProblemMapChart';
import { formatTimeAgo, formatDate } from '../lib/utils';
import {
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [attentionQueue, setAttentionQueue] = useState<Complaint[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryInsight[]>([]);
  const [towerStats, setTowerStats] = useState<TowerInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [dashRes, recRes, insightsRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/recurring-issues'),
          api.get('/admin/insights'),
        ]);

        setKpis(dashRes.data.data?.kpis || null);
        setAttentionQueue(dashRes.data.data?.attentionQueue || []);
        setRecurringPatterns(recRes.data.data || []);
        setCategoryStats(insightsRes.data.data?.categoryStats || []);
        setTowerStats(insightsRes.data.data?.towerStats || []);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading || !kpis) {
    return (
      <div className="py-24 text-center text-sm text-slate-400">
        Loading estate intelligence metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Executive Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Society Maintenance & SLA Dashboard
          </h1>
        </div>

        <Link
          to="/admin/complaints"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors"
        >
          <span>View All Society Tickets</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Hero Attention Card */}
      <NeedsAttentionHero
        overdueCount={kpis.overdueCount}
        reopenedCount={kpis.reopenedCount}
        highPriorityOpenCount={kpis.highPriorityOpenCount}
      />

      {/* Story-Driven KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="On-Time Resolution Rate"
          value={`${kpis.onTimeRate}%`}
          subtext="Target SLA compliance"
          trend={{ value: 'Within SLA limit', isPositive: kpis.onTimeRate >= 85 }}
          accentColor="green"
          icon={<ShieldCheck className="w-6 h-6" />}
        />
        <StatCard
          label="Avg First Response"
          value={`${kpis.avgFirstResponseHours}h`}
          subtext="Triage to technician assign"
          accentColor="blue"
          icon={<Zap className="w-6 h-6" />}
        />
        <StatCard
          label="Avg Resolution Time"
          value={`${kpis.avgResolutionHours}h`}
          subtext="Open to resident resolution"
          accentColor="amber"
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          label="Active Work Queue"
          value={kpis.openCount + kpis.inProgressCount + kpis.reopenedCount}
          subtext={`${kpis.resolvedThisMonth} resolved this month`}
          accentColor="purple"
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      {/* Attention Queue Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Attention Queue</span>
              {attentionQueue.length > 0 && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                  {attentionQueue.length} prioritized
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Sorted by urgency: Overdue → Reopened by resident → High Priority Open
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {attentionQueue.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No pending tickets in the attention queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Resident / Flat</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Due Target</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attentionQueue.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      item.isOverdue ? 'bg-rose-50/40' : item.status === 'REOPENED' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link
                        to={`/complaints/${item._id}`}
                        className="hover:text-brand-600 hover:underline"
                      >
                        {item.publicId}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.resident?.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.resident?.flatNumber} · {item.resident?.building}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{item.category}</td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} isOverdue={item.isOverdue} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.assignedTo ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {item.assignedTo.name}
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={item.isOverdue ? 'text-rose-700 font-bold' : 'text-slate-600'}>
                        {formatDate(item.dueAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/complaints/${item._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-700 font-bold transition-all"
                      >
                        <span>Triage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recurring Pattern Detector Banner */}
      <RecurringIssueBanner patterns={recurringPatterns} />

      {/* Problem Map Concentrations */}
      <ProblemMapChart categoryStats={categoryStats} towerStats={towerStats} />
    </div>
  );
};
