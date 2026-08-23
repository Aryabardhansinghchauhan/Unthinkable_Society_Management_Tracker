import React from 'react';
import { ReportWizard } from '../features/complaints/ReportWizard';

export const ReportIssuePage: React.FC = () => {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Maintenance Issue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tell us what needs fixing. We'll assign an owner and give you a clear resolution deadline.
        </p>
      </div>

      <ReportWizard />
    </div>
  );
};
