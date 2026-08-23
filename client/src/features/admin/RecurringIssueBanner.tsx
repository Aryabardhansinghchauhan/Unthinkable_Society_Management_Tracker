import React from 'react';
import { RecurringPattern } from '../../types';
import { Card } from '../../components/ui/Card';
import { Layers, AlertTriangle, Lightbulb, Building2 } from 'lucide-react';

interface RecurringIssueBannerProps {
  patterns: RecurringPattern[];
}

export const RecurringIssueBanner: React.FC<RecurringIssueBannerProps> = ({ patterns }) => {
  if (patterns.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Recurring Pattern Detection
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
          Rules-based Aggregation Detector
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((item, idx) => (
          <Card
            key={idx}
            className="p-5 border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Building2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.summary}</h4>
                  <p className="text-xs text-slate-500">
                    Flats involved: {item.flats.join(', ') || 'Common lines'}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white shrink-0">
                {item.count} tickets
              </span>
            </div>

            <div className="mt-3 p-3 bg-white rounded-xl border border-amber-100 flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 font-medium">
                {item.recommendation}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
