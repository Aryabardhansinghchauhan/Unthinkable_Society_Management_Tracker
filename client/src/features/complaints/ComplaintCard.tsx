import React from 'react';
import { Link } from 'react-router-dom';
import { Complaint } from '../../types';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { formatTimeAgo } from '../../lib/utils';
import { ArrowRight, UserCheck, Clock, AlertTriangle } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  return (
    <Card hoverable className="p-5 sm:p-6 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {complaint.publicId}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {complaint.category}
            </span>
          </div>
          <StatusBadge status={complaint.status} isOverdue={complaint.isOverdue} />
        </div>

        <Link
          to={`/complaints/${complaint._id}`}
          className="group block mb-2"
        >
          <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {complaint.title}
          </h4>
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <PriorityBadge priority={complaint.priority} />
          {complaint.assignedTo && (
            <span className="flex items-center gap-1 text-slate-600 font-medium hidden sm:flex">
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              {complaint.assignedTo.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            {formatTimeAgo(complaint.createdAt)}
          </span>
          <Link
            to={`/complaints/${complaint._id}`}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
