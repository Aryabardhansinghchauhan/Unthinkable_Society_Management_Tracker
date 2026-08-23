import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Sparkles } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, switchPersona, loading } = useAuth();

  return (
    <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="font-semibold text-slate-300">
          Demo Presentation Switcher:
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Toggle roles instantly to test the full 90-second resolution loop
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => switchPersona('RESIDENT')}
          disabled={loading || user?.role === 'RESIDENT'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
            user?.role === 'RESIDENT'
              ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Resident (Aarav B-204)</span>
        </button>

        <button
          onClick={() => switchPersona('ADMIN')}
          disabled={loading || user?.role === 'ADMIN'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
            user?.role === 'ADMIN'
              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400 font-bold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin (Estate Manager)</span>
        </button>
      </div>
    </div>
  );
};
