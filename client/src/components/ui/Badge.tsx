import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '../../types';
import { AlertCircle, CheckCircle2, Clock, RotateCcw, Flame } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'danger' | 'warning' | 'success' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    info: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ComplaintStatus; isOverdue?: boolean }> = ({
  status,
  isOverdue = false,
}) => {
  if (isOverdue) {
    return (
      <Badge variant="danger" className="animate-pulse ring-2 ring-rose-300 ring-offset-1">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Overdue</span>
      </Badge>
    );
  }

  switch (status) {
    case 'OPEN':
      return (
        <Badge variant="info">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Open</span>
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="warning">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Work in Progress</span>
        </Badge>
      );
    case 'RESOLVED':
      return (
        <Badge variant="success">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resolved</span>
        </Badge>
      );
    case 'REOPENED':
      return (
        <Badge variant="danger">
          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
          <span>Reopened</span>
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: ComplaintPriority }> = ({ priority }) => {
  switch (priority) {
    case 'HIGH':
      return (
        <Badge variant="danger">
          <Flame className="w-3.5 h-3.5 text-rose-600" />
          <span>High Priority</span>
        </Badge>
      );
    case 'MEDIUM':
      return (
        <Badge variant="warning">
          <span>Medium Priority</span>
        </Badge>
      );
    case 'LOW':
      return (
        <Badge variant="default">
          <span>Low Priority</span>
        </Badge>
      );
    default:
      return <Badge>{priority}</Badge>;
  }
};
