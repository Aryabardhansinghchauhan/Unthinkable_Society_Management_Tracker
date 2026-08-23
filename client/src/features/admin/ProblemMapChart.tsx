import React from 'react';
import { CategoryInsight, TowerInsight } from '../../types';
import { Card } from '../../components/ui/Card';
import { PieChart, BarChart3, Building } from 'lucide-react';

interface ProblemMapChartProps {
  categoryStats: CategoryInsight[];
  towerStats: TowerInsight[];
}

export const ProblemMapChart: React.FC<ProblemMapChartProps> = ({
  categoryStats,
  towerStats,
}) => {
  const maxCategory = Math.max(...categoryStats.map((c) => c.total), 1);
  const maxTower = Math.max(...towerStats.map((t) => t.total), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Category Problem Map */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Category Distribution
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">All Time</span>
        </div>

        <div className="space-y-3.5">
          {categoryStats.map((cat) => {
            const percentage = Math.round((cat.total / maxCategory) * 100);
            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{cat.category}</span>
                  <span className="text-slate-500">
                    {cat.total} total · <span className="text-amber-600">{cat.open} open</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="bg-brand-500 rounded-full h-2 transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Tower Problem Map */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-slate-900 text-sm">
              Tower Concentration
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-medium">By Building</span>
        </div>

        <div className="space-y-3.5">
          {towerStats.map((tow) => {
            const percentage = Math.round((tow.total / maxTower) * 100);
            return (
              <div key={tow.tower} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{tow.tower}</span>
                  <span className="text-slate-500">
                    {tow.total} tickets · <span className="text-blue-600">{tow.resolved} resolved</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
