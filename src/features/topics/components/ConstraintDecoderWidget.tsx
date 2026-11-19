import { useEffect, useState } from 'react';
import { CheckCircle2, Gauge, ShieldAlert, XCircle } from 'lucide-react';
import type { DeepTopicBlueprint } from '../data/deepTopicBlueprints';

interface ConstraintDecoderWidgetProps {
  topicId: string;
  guide: DeepTopicBlueprint['constraintGuide'];
}

const COMPLEXITY_TIERS: {
  id: DeepTopicBlueprint['constraintGuide']['correctTierId'];
  label: string;
  typicalN: string;
}[] = [
  { id: 'exp', label: 'O(2^N) / O(N!)', typicalN: 'N <= 20' },
  { id: 'n2', label: 'O(N²)', typicalN: 'N <= 2×10³' },
  { id: 'nlogn', label: 'O(N log N)', typicalN: 'N <= 2×10⁵' },
  { id: 'n', label: 'O(N)', typicalN: 'N <= 10⁶' },
  { id: 'logn', label: 'O(log N) / O(N log M)', typicalN: 'Range <= 10⁹' },
];

export function ConstraintDecoderWidget({ topicId, guide }: ConstraintDecoderWidgetProps) {
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setPicked(null);
  }, [topicId]);

  const isCorrect = picked === guide.correctTierId;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
          <Gauge className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>CONSTRAINT-TO-COMPLEXITY DECODER (STEP 0)</span>
        </div>
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          Given Bound: {guide.inputBound}
        </span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">
        Before reading any pattern or code, decode the time-complexity ceiling that fits within ~10⁸ operations/sec:
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {COMPLEXITY_TIERS.map((tier) => {
          const selected = picked === tier.id;
          const right = selected && tier.id === guide.correctTierId;
          const wrong = selected && tier.id !== guide.correctTierId;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setPicked(tier.id)}
              className={`rounded-lg border p-2 text-left transition-colors ${
                right
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                  : wrong
                    ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-slate-800 dark:text-slate-200 hover:border-sky-400'
              }`}
            >
              <div className="font-mono text-[11px] font-bold tabular-nums">{tier.label}</div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                {tier.typicalN}
              </div>
            </button>
          );
        })}
      </div>

      {picked && (
        <div
          className={`rounded-lg border p-3 space-y-2 text-xs ${
            isCorrect
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
              : 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="text-emerald-900 dark:text-emerald-200">
                  Target Ceiling Unlocked: {guide.expectedComplexity}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                <span className="text-amber-950 dark:text-amber-200">
                  Re-check math — Target Ceiling is {guide.expectedComplexity}
                </span>
              </>
            )}
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{guide.mathProof}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-rose-800 dark:text-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="font-semibold">Eliminated before reading story:</span>
            <span>{guide.eliminatedApproaches.join(' · ')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
