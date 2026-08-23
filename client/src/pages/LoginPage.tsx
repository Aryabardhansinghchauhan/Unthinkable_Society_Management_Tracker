import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Wrench, CheckCircle2, ShieldCheck, Clock, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: 'resident@example.com',
    password: 'password123',
    phone: '',
    flatNumber: 'B-204',
    building: 'Tower B',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegistering) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Authentication failed. Please check your credentials.'
      );
    }
  };

  const handleQuickLogin = async (email: string) => {
    setError(null);
    try {
      await login(email, 'password123');
      navigate(email.includes('admin') ? '/admin' : '/');
    } catch (err: any) {
      setError('Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          
          {/* Brand Left Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-brand-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight">FixFlow</h1>
                  <p className="text-xs text-brand-400 font-medium">Society Maintenance Platform</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                  Maintenance, without the follow-up.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Every issue gets an assigned owner, clear SLA deadline, photo evidence, and mandatory resident sign-off.
                </p>
              </div>

              <div className="mt-8 space-y-3.5 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Rule-based smart priority scoring</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Strict SLAs & automated overdue tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Before/After evidence confirmation loop</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials Box */}
            <div className="mt-8 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Demo Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('resident@example.com')}
                  className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-left text-xs font-semibold transition-colors"
                >
                  👤 Resident
                  <span className="block text-[10px] text-slate-300 font-normal">Aarav (B-204)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@example.com')}
                  className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-left text-xs font-semibold transition-colors"
                >
                  🛡️ Admin
                  <span className="block text-[10px] text-slate-300 font-normal">Estate Manager</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Right Column */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  {isRegistering ? 'Create your resident account' : 'Welcome back'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isRegistering
                    ? 'Register your flat at Greenfield Heights'
                    : 'Sign in to report or track society maintenance'}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Aarav Patel"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Tower / Building
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.building}
                          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                          placeholder="e.g. Tower B"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Flat Number
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.flatNumber}
                          onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                          placeholder="e.g. B-204"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-3 text-sm font-bold mt-2"
                >
                  {isRegistering ? 'Register & Access Portal' : 'Sign In to FixFlow'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                  }}
                  className="text-xs text-slate-600 hover:text-brand-600 font-semibold"
                >
                  {isRegistering
                    ? 'Already have an account? Sign in'
                    : "New resident? Register your flat"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
