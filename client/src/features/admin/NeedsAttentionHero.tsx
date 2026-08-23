import React from 'react';
import { AlertCircle, RotateCcw, Flame, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { MICROCOPY } from '../../lib/microcopy';

interface NeedsAttentionHeroProps {
  overdueCount: number;
  reopenedCount: number;
  highPriorityOpenCount: number;
}

export const NeedsAttentionHero: React.FC<NeedsAttentionHeroProps> = ({
  overdueCount,
  reopenedCount,
  highPriorityOpenCount,
}) => {
  const totalUrgent = overdueCount + reopenedCount + highPriorityOpenCount;

  if (totalUrgent === 0) {
    return (
      <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black">All SLAs On Track 👍</h3>
            <p className="text-sm text-emerald-100 mt-0.5">
              Zero overdue complaints and zero unresolved resident reopens across Greenfield Heights.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl shadow-rose-950/20 border-rose-900/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-attention">
              ACTION REQUIRED
            </span>
            <span className="text-xs font-semibold text-rose-300">
              Executive Priority Queue
            </span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            {totalUrgent} issue{totalUrgent > 1 ? 's' : ''} requiring immediate triage
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            {MICROCOPY.OVERDUE_ALERT}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[90px]">
            <span className="text-2xl font-black text-rose-400 block leading-tight">
              {overdueCount}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3 text-rose-400" /> Overdue
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[90px]">
            <span className="text-2xl font-black text-amber-400 block leading-tight">
              {reopenedCount}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
              <RotateCcw className="w-3 h-3 text-amber-400" /> Reopened
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[90px]">
            <span className="text-2xl font-black text-white block leading-tight">
              {highPriorityOpenCount}
            </span>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
              <Flame className="w-3 h-3 text-rose-400" /> High Open
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
