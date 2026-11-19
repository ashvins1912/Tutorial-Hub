import { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Check,
  CheckSquare,
  Compass,
  Copy,
  MessageSquareQuote,
  Square,
  Wrench,
} from 'lucide-react';
import type { CurriculumTopic } from '../types';
import { getTopicExpertiseGuide } from '../data/topicExpertisePlaybooks';
import { useAccountState } from '../../../hooks/useAccountState';

const STORAGE_KEY = 'patternforge_topic_checkpoints_v1';

interface TopicExpertisePlaybookProps {
  topic: CurriculumTopic;
  isMastered: boolean;
  onToggleMastered: () => void;
}

export function TopicExpertisePlaybook({
  topic,
  isMastered,
  onToggleMastered,
}: TopicExpertisePlaybookProps) {
  const guide = getTopicExpertiseGuide(topic);
  const [checkedMap, setCheckedMap] = useAccountState<Record<string, boolean[]>>(
    'topic-expertise-checks',
    {},
    STORAGE_KEY
  );
  const [copiedScript, setCopiedScript] = useState(false);

  const topicChecks = checkedMap[topic.id] ?? guide.masteryCheckpoints.map(() => false);
  const normalizedChecks = guide.masteryCheckpoints.map((_, i) => Boolean(topicChecks[i]));
  const completedCount = normalizedChecks.filter(Boolean).length;
  const totalCount = guide.masteryCheckpoints.length;
  const allReady = totalCount > 0 && completedCount === totalCount;

  const toggleCheckpoint = (index: number) => {
    setCheckedMap((prev) => {
      const current = prev[topic.id] ?? guide.masteryCheckpoints.map(() => false);
      const next = guide.masteryCheckpoints.map((_, i) =>
        i === index ? !current[i] : Boolean(current[i]),
      );
      return { ...prev, [topic.id]: next };
    });
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(guide.verbalizationScript);
      setCopiedScript(true);
      window.setTimeout(() => setCopiedScript(false), 1800);
    } catch {
      // clipboard unavailable in restricted iframe
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-display font-bold text-slate-900 dark:text-slate-100">
            05. Best-Way Expertise Playbook
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Staff-level invariant, canonical recipe, high-frequency failure traps, and interview verbalization for {topic.title}.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
          <span
            className={
              allReady
                ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400'
            }
          >
            {completedCount}/{totalCount} Expert Checkpoints
          </span>
        </div>
      </div>

      {/* Golden Invariant & Canonical Best-Way Recipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/50 dark:bg-sky-950/30 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
            <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Golden Invariant</span>
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            {guide.goldenInvariant}
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/30 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            <Wrench className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Canonical Best-Way Recipe</span>
          </div>
          <p className="text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
            {guide.canonicalRecipe}
          </p>
        </div>
      </div>

      {/* 45-Second Interview Verbalization Script */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <MessageSquareQuote className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <span>45-Second Interview Verbalization Script</span>
          </div>
          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
          >
            {copiedScript ? (
              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-3 h-3" aria-hidden="true" />
            )}
            <span>{copiedScript ? 'Copied' : 'Copy Script'}</span>
          </button>
        </div>
        <blockquote className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
          {guide.verbalizationScript}
        </blockquote>
      </div>

      {/* Top Traps & Best-Way Fixes */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span>High-Frequency Interview Traps & Best-Way Fixes</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {guide.trapsAndFixes.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white dark:bg-slate-900/80 grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs"
            >
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-semibold uppercase text-rose-700 dark:text-rose-400">
                  ✕ Common Trap #{idx + 1}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{item.trap}</p>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-semibold uppercase text-emerald-700 dark:text-emerald-400">
                  ✓ Best-Way Fix
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {item.bestWayFix}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Mastery Self-Audit Checklist */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <Award className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
            <span>Mastery Self-Audit Checklist (Persisted Locally)</span>
          </div>

          {allReady && !isMastered && (
            <button
              type="button"
              onClick={onToggleMastered}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors"
            >
              <Check className="w-3 h-3" aria-hidden="true" />
              All Verified — Mark Topic Mastered
            </button>
          )}
        </div>

        <ul className="space-y-1.5">
          {guide.masteryCheckpoints.map((checkpoint, idx) => {
            const done = normalizedChecks[idx];
            return (
              <li key={idx}>
                <button
                  type="button"
                  onClick={() => toggleCheckpoint(idx)}
                  aria-pressed={done}
                  className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg border text-xs transition-colors ${
                    done
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                  }`}
                >
                  {done ? (
                    <CheckSquare
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  ) : (
                    <Square
                      className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                  )}
                  <span className={done ? 'line-through opacity-85' : ''}>{checkpoint}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
