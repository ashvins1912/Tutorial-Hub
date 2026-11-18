import { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Target, X } from 'lucide-react';
import { BigTechCompany } from '../../types/dsa';
import { COMPANY_SPRINT_META } from '../../../server/services/sprintGeneratorService';
import { useSprintStore } from '../../store/useSprintStore';

const COMPANIES: BigTechCompany[] = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'];

export function SprintConfiguratorModal() {
  const open = useSprintStore((s) => s.configuratorOpen);
  const setOpen = useSprintStore((s) => s.setConfiguratorOpen);
  const createSprint = useSprintStore((s) => s.createSprint);
  const isCreating = useSprintStore((s) => s.isCreatingSprint);
  const activeSprint = useSprintStore((s) => s.activeSprint);

  const [selectedCompany, setSelectedCompany] = useState<BigTechCompany>(
    activeSprint?.targetCompany ?? 'Google'
  );
  const [pace, setPace] = useState<60 | 120>(activeSprint?.dailyMinutesBudget ?? 60);

  if (!open) return null;

  const selectedMeta = COMPANY_SPRINT_META[selectedCompany];

  const handleLockIn = async () => {
    await createSprint(selectedCompany, pace);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sprint-config-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <p className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
              ADAPTIVE 14-DAY INTERVIEW ENGINE
            </p>
            <h2
              id="sprint-config-title"
              className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5"
            >
              Launch 14-Day Company Sprint
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Dynamically weights high-frequency patterns, injects 1-3-7-21 spaced recall twists, and unlocks a Day 14 45-min simulated interview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close sprint configurator"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Company Selector Cards */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            1. Choose Target Company
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMPANIES.map((comp) => {
              const meta = COMPANY_SPRINT_META[comp];
              const isSelected = selectedCompany === comp;
              return (
                <button
                  key={comp}
                  type="button"
                  onClick={() => setSelectedCompany(comp)}
                  className={`text-left p-4 rounded-xl border transition-colors space-y-2 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {comp}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {meta.tagline}
                  </p>
                  <div className="pt-1 border-t border-slate-200/70 dark:border-slate-800 text-[11px] font-mono text-sky-700 dark:text-sky-400">
                    Top 3: {meta.topPatterns.join(' · ')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Pace Toggle */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            2. Select Daily Time Commitment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPace(60)}
              className={`text-left p-4 rounded-xl border transition-colors space-y-1 ${
                pace === 60
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  60 Min / Day — Core 2 Problems
                </span>
                <span className="text-xs font-mono text-sky-600 dark:text-sky-400">28 Tasks</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                1 Pattern Warmup / Spaced Recall + 1 Core High-Frequency Problem daily.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPace(120)}
              className={`text-left p-4 rounded-xl border transition-colors space-y-1 ${
                pace === 120
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  120 Min / Day — Intensive 3 + Blind Arena
                </span>
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400">41 Tasks</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Adds a timed zero-hint Blind Arena problem every day on top of core & recall drills.
              </p>
            </button>
          </div>
        </div>

        {/* 14-Day Breakdown Preview Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              14-Day {selectedCompany} Escalation Preview
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Spaced Recall on Days 4, 7, 10, 13
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                DAYS 1–3
              </div>
              <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                Easy Signal Foundations
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/20">
              <div className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                DAYS 4–9
              </div>
              <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                Medium Core + D4/D7 Recall
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                DAYS 10–13
              </div>
              <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                Hard Fusion + D10/D13 Twist
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                DAY 14
              </div>
              <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                45-Min {selectedCompany} Mock (Top 2)
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
            Weighted focus: {Object.entries(selectedMeta.weights)
              .slice(0, 4)
              .map(([k, v]) => `${k} (${v}%)`)
              .join(' · ')}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isCreating}
            onClick={handleLockIn}
            className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-50"
          >
            {isCreating ? 'Generating 14-Day Plan...' : 'Lock In 14-Day Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}
