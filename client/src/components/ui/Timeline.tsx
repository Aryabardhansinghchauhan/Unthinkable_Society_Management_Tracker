import React from 'react';
import { ComplaintHistory } from '../../types';
import { formatDate, formatTimeAgo } from '../../lib/utils';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  RotateCcw,
  Sparkles,
  Paperclip,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface TimelineProps {
  events: ComplaintHistory[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-slate-400">
        No timeline events recorded yet.
      </div>
    );
  }

  const getEventIcon = (event: ComplaintHistory) => {
    if (event.eventType === 'RESOLUTION_CONFIRMED') {
      return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
    if (event.eventType === 'REOPENED') {
      return <RotateCcw className="w-4 h-4 text-rose-600" />;
    }
    if (event.eventType === 'ASSIGNED') {
      return <UserCheck className="w-4 h-4 text-blue-600" />;
    }
    if (event.eventType === 'ATTACHMENT_ADDED') {
      return <Paperclip className="w-4 h-4 text-purple-600" />;
    }
    if (event.newStatus === 'RESOLVED') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (event.newStatus === 'IN_PROGRESS') {
      return <Clock className="w-4 h-4 text-amber-600" />;
    }
    if (event.eventType === 'CREATED') {
      return <FileText className="w-4 h-4 text-slate-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-slate-500" />;
  };

  const getEventBadgeClass = (event: ComplaintHistory) => {
    if (event.eventType === 'RESOLUTION_CONFIRMED' || event.newStatus === 'RESOLVED') {
      return 'bg-emerald-50 border-emerald-200 ring-4 ring-emerald-50';
    }
    if (event.eventType === 'REOPENED') {
      return 'bg-rose-50 border-rose-200 ring-4 ring-rose-50';
    }
    if (event.eventType === 'ASSIGNED') {
      return 'bg-blue-50 border-blue-200 ring-4 ring-blue-50';
    }
    if (event.newStatus === 'IN_PROGRESS') {
      return 'bg-amber-50 border-amber-200 ring-4 ring-amber-50';
    }
    return 'bg-slate-100 border-slate-200 ring-4 ring-slate-50';
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event, index) => (
        <div key={event._id || index} className="relative group">
          {/* Node Icon */}
          <div
            className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110 ${getEventBadgeClass(
              event
            )}`}
          >
            {getEventIcon(event)}
          </div>

          {/* Event Content */}
          <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/70 rounded-2xl p-4 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                {event.actor?.name || 'System'}
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-200/60 px-1.5 py-0.2 rounded">
                  {event.actor?.role || 'SYSTEM'}
                </span>
              </span>
              <span
                className="text-[11px] text-slate-400"
                title={formatDate(event.createdAt)}
              >
                {formatTimeAgo(event.createdAt)}
              </span>
            </div>

            <p className="text-sm text-slate-700 font-medium">{event.note}</p>

            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="mt-2 text-xs text-slate-500 bg-white/70 rounded-lg p-2 border border-slate-200/60">
                {event.metadata.staffName && (
                  <div>
                    <span className="font-semibold text-slate-600">Assignee:</span>{' '}
                    {event.metadata.staffName} ({event.metadata.specialization})
                  </div>
                )}
                {event.metadata.reason && (
                  <div className="italic text-slate-600">
                    "{event.metadata.reason}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
