import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { SocietySettings } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings, Save, Shield, Clock, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SocietySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/settings');
        setSettings(res.data.data);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccess(false);
    try {
      const res = await api.patch('/admin/settings', settings);
      setSettings(res.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-slate-700" />
          Society SLA & Escalation Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure response deadlines, overdue escalation thresholds, and society identification
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-600" />
              SLA Resolution Targets (Hours)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Maximum allowable hours from creation to resolution per priority tier
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5">
                High Priority (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.defaultSlaByPriority.HIGH}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultSlaByPriority: {
                      ...settings.defaultSlaByPriority,
                      HIGH: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-rose-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: 6 hours (Emergencies / Leaks)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                Medium Priority (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings.defaultSlaByPriority.MEDIUM}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultSlaByPriority: {
                      ...settings.defaultSlaByPriority,
                      MEDIUM: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: 24 hours (Standard issues)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Low Priority (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="336"
                value={settings.defaultSlaByPriority.LOW}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultSlaByPriority: {
                      ...settings.defaultSlaByPriority,
                      LOW: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-slate-500 outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: 48 hours (Cosmetic / Routine)
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Society Details & Environment
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Society Name
              </label>
              <input
                type="text"
                value={settings.societyName}
                onChange={(e) =>
                  setSettings({ ...settings, societyName: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          {success ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Settings updated successfully!
            </span>
          ) : (
            <span />
          )}

          <Button
            type="submit"
            loading={saving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Society Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
