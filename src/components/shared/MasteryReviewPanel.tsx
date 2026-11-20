import { useMemo } from 'react';
import {
  Briefcase,
  CheckCircle2,
  GitFork,
  NotebookPen,
  ShieldAlert,
  Star,
} from 'lucide-react';
import { useAccountState } from '../../hooks/useAccountState';

export interface MasteryReviewEntry {
  readability: number;
  visualDfd: number;
  implementation: number;
  challenges: number;
  confidence: number;
  notes: string;
  updatedAt?: string;
}

export interface MasteryReviewPanelProps {
  entityKey: string;
  entityTitle: string;
  entityKind: 'algorithm' | 'curriculum-topic';
  codeLevelDfd: string;
  realWorldUseCases: string[];
  challengesFaced: string[];
  verifiedChecklist: { label: string; detail: string }[];
}

const RATING_DIMENSIONS: {
  key: keyof Pick<
    MasteryReviewEntry,
    'readability' | 'visualDfd' | 'implementation' | 'challenges' | 'confidence'
  >;
  label: string;
  hint: string;
}[] = [
  {
    key: 'readability',
    label: 'Easy to Read & Simple Language',
    hint: 'Can I explain the plain-English idea without jargon?',
  },
  {
    key: 'visualDfd',
    label: 'Visual, Animation & DFD Data Flow',
    hint: 'Can I picture how data transforms step by step?',
  },
  {
    key: 'implementation',
    label: 'Code-Level Implementation',
    hint: 'Can I code the optimal template cleanly from scratch?',
  },
  {
    key: 'challenges',
    label: 'Edge Cases & Production Challenges',
    hint: 'Can I spot traps, overflow, or failure constraints?',
  },
  {
    key: 'confidence',
    label: 'Zero-to-Expertise Interview Confidence',
    hint: 'Ready to solve an unseen twist in a timed interview?',
  },
];

const EMPTY_ENTRY: MasteryReviewEntry = {
  readability: 0,
  visualDfd: 0,
  implementation: 0,
  challenges: 0,
  confidence: 0,
  notes: '',
};

function getReadinessTier(avg: number): { label: string; toneClass: string } {
  if (avg === 0) return { label: 'Not Rated Yet', toneClass: 'text-slate-500 dark:text-slate-400' };
  if (avg < 2.5) return { label: 'Foundations (Revisit Analogy & DFD)', toneClass: 'text-amber-700 dark:text-amber-400' };
  if (avg < 3.8) return { label: 'Developing (Practice Dry-Run & Code)', toneClass: 'text-sky-700 dark:text-sky-400' };
  if (avg < 4.5) return { label: 'Interview-Ready (Test Follow-Up Twists)', toneClass: 'text-emerald-700 dark:text-emerald-400' };
  return { label: 'Specialist Mastery Achieved', toneClass: 'text-emerald-700 dark:text-emerald-400' };
}

export function MasteryReviewPanel({
  entityKey,
  entityTitle,
  entityKind,
  codeLevelDfd,
  realWorldUseCases,
  challengesFaced,
  verifiedChecklist,
}: MasteryReviewPanelProps) {
  const [allReviews, setAllReviews] = useAccountState<Record<string, MasteryReviewEntry>>(
    'student-mastery-reviews-v1',
    {},
    'patternforge_student_reviews_v1'
  );

  const entry = allReviews[entityKey] ?? EMPTY_ENTRY;

  const updateEntry = (patch: Partial<MasteryReviewEntry>) => {
    setAllReviews((prev) => ({
      ...prev,
      [entityKey]: {
        ...(prev[entityKey] ?? EMPTY_ENTRY),
        ...patch,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
    }));
  };

  const averageScore = useMemo(() => {
    const vals = [
      entry.readability,
      entry.visualDfd,
      entry.implementation,
      entry.challenges,
      entry.confidence,
    ].filter((v) => v > 0);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [entry]);

  const tier = getReadinessTier(averageScore);

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            Senior Architect Review &amp; Student Zero-to-Expertise Reflection
          </div>
          <h3 className="text-sm sm:text-base font-display font-bold text-slate-900 dark:text-slate-100">
            {entityTitle} — Production DFD, Challenges &amp; Mastery Rating
          </h3>
        </div>
        <div className="text-right text-xs font-mono tabular-nums">
          <div className={`font-semibold ${tier.toneClass}`}>
            {averageScore > 0 ? `${averageScore.toFixed(1)} / 5.0 · ` : ''}
            {tier.label}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {entityKind === 'algorithm' ? 'Algorithm Practice Audit' : 'Curriculum Topic Audit'}
            {entry.updatedAt ? ` · Saved ${entry.updatedAt}` : ''}
          </div>
        </div>
      </div>

      {/* Senior Architect Code-Level DFD + Real-World Use Cases + Challenges */}
      <div className="space-y-3.5">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
            <GitFork className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Code-Level Data Flow (DFD) &amp; Execution Pipeline</span>
          </div>
          <p className="text-xs sm:text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200">
            {codeLevelDfd}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Briefcase className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Real-World Production Use Cases</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {realWorldUseCases.map((uc, idx) => (
                <li key={idx}>{uc}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/15 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Engineering Challenges &amp; Implementation Traps</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {challengesFaced.map((ch, idx) => (
                <li key={idx}>{ch}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verified Architectural Completeness Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {verifiedChecklist.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-3 py-2 space-y-0.5"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                {item.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Self-Assessment Rubric (1-5) + Implementation Notes */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
              Student Zero-to-Expertise Self-Rating (After Practice)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rate how clear, visual, and reproducible this feels after completing the dry-run and implementation.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-800">
          {RATING_DIMENSIONS.map((dim) => {
            const val = entry[dim.key];
            return (
              <div
                key={dim.key}
                className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {dim.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{dim.hint}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0" role="group" aria-label={dim.label}>
                  {[1, 2, 3, 4, 5].map((score) => {
                    const active = val >= score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => updateEntry({ [dim.key]: score })}
                        aria-label={`Rate ${dim.label} ${score} out of 5`}
                        aria-pressed={val === score}
                        className={`w-7 h-7 rounded-md border text-xs font-mono font-semibold inline-flex items-center justify-center transition-colors ${
                          active
                            ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:border-sky-400'
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${active ? 'fill-amber-400 text-amber-500' : ''}`}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                  <span className="ml-1.5 w-7 text-right font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                    {val > 0 ? `${val}/5` : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Personal Implementation Notes & Challenges Faced */}
        <div className="space-y-1.5">
          <label
            htmlFor={`notes-${entityKey}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100"
          >
            <NotebookPen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span>My Implementation Notes &amp; Challenges Faced (Auto-Saved)</span>
          </label>
          <textarea
            id={`notes-${entityKey}`}
            rows={3}
            value={entry.notes}
            onChange={(e) => updateEntry({ notes: e.target.value })}
            placeholder="Write down the edge case that tripped you up, the invariant cue that made it click, or a reminder for your next spaced-repetition review..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/60 p-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>
    </section>
  );
}
