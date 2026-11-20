import React from 'react';
import { CheckCircle2, Circle, Clock3, RotateCcw } from 'lucide-react';
import type { ProblemDifficulty, ProblemStatus } from '../../hooks/useProblemStatusTracker';

export const ALL_DIFFICULTIES: readonly ProblemDifficulty[] = ['Easy', 'Medium', 'Hard'] as const;
export const ALL_STATUSES: readonly ProblemStatus[] = ['solved', 'in-progress', 'unattempted'] as const;

export interface ProblemFilterCounts {
  difficulty?: Partial<Record<ProblemDifficulty, number>>;
  status?: Partial<Record<ProblemStatus, number>>;
}

interface ProblemFilterBarProps {
  selectedDifficulties: ProblemDifficulty[];
  onToggleDifficulty: (difficulty: ProblemDifficulty) => void;
  onClearDifficulties: () => void;
  selectedStatuses: ProblemStatus[];
  onToggleStatus: (status: ProblemStatus) => void;
  onClearStatuses: () => void;
  counts?: ProblemFilterCounts;
  compact?: boolean;
  totalMatching?: number;
  totalCount?: number;
}

const STATUS_META: Record<
  ProblemStatus,
  {
    label: string;
    activeClass: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  solved: {
    label: 'Solved',
    activeClass:
      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300',
    Icon: CheckCircle2,
  },
  'in-progress': {
    label: 'In-Progress',
    activeClass:
      'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300',
    Icon: Clock3,
  },
  unattempted: {
    label: 'Unattempted',
    activeClass:
      'border-slate-500 dark:border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
    Icon: Circle,
  },
};

const DIFF_ACTIVE_CLASS: Record<ProblemDifficulty, string> = {
  Easy: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300',
  Medium: 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300',
  Hard: 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300',
};

export function toggleFilterValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function normalizeDifficulty(raw: string): ProblemDifficulty {
  const lower = raw.toLowerCase();
  if (lower.includes('easy') && !lower.includes('med')) return 'Easy';
  if (lower.includes('hard') || lower.includes('system')) return 'Hard';
  return 'Medium';
}

export const ProblemFilterBar: React.FC<ProblemFilterBarProps> = ({
  selectedDifficulties,
  onToggleDifficulty,
  onClearDifficulties,
  selectedStatuses,
  onToggleStatus,
  onClearStatuses,
  counts,
  compact = false,
  totalMatching,
  totalCount,
}) => {
  const hasAnyFilter = selectedDifficulties.length > 0 || selectedStatuses.length > 0;
  const padClass = compact ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1.5 text-xs';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
        {/* Difficulty Toggle Group */}
        <div
          role="group"
          aria-label="Filter by difficulty"
          className="flex flex-wrap items-center gap-1"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
            Difficulty
          </span>
          <button
            type="button"
            onClick={onClearDifficulties}
            aria-pressed={selectedDifficulties.length === 0}
            className={`${padClass} rounded-md border font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedDifficulties.length === 0
                ? 'border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            All
          </button>
          {ALL_DIFFICULTIES.map((diff) => {
            const active = selectedDifficulties.includes(diff);
            const count = counts?.difficulty?.[diff];
            return (
              <button
                key={diff}
                type="button"
                onClick={() => onToggleDifficulty(diff)}
                aria-pressed={active}
                className={`${padClass} rounded-md border font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                  active
                    ? DIFF_ACTIVE_CLASS[diff]
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{diff}</span>
                {typeof count === 'number' && (
                  <span className="font-mono text-[10px] tabular-nums opacity-75">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Status Toggle Group */}
        <div
          role="group"
          aria-label="Filter by completion status"
          className="flex flex-wrap items-center gap-1"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
            Status
          </span>
          <button
            type="button"
            onClick={onClearStatuses}
            aria-pressed={selectedStatuses.length === 0}
            className={`${padClass} rounded-md border font-semibold transition-colors whitespace-nowrap shrink-0 ${
              selectedStatuses.length === 0
                ? 'border-slate-900 dark:border-sky-500 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((status) => {
            const active = selectedStatuses.includes(status);
            const meta = STATUS_META[status];
            const Icon = meta.Icon;
            const count = counts?.status?.[status];
            return (
              <button
                key={status}
                type="button"
                onClick={() => onToggleStatus(status)}
                aria-pressed={active}
                className={`${padClass} rounded-md border font-semibold transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1 ${
                  active
                    ? meta.activeClass
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{meta.label}</span>
                {typeof count === 'number' && (
                  <span className="font-mono text-[10px] tabular-nums opacity-75">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Match Counter + Clear Action */}
      {(hasAnyFilter || (typeof totalMatching === 'number' && typeof totalCount === 'number')) && (
        <div className="flex items-center gap-2.5 text-xs shrink-0">
          {typeof totalMatching === 'number' && typeof totalCount === 'number' && (
            <span className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
              {totalMatching} / {totalCount} shown
            </span>
          )}
          {hasAnyFilter && (
            <button
              type="button"
              onClick={() => {
                onClearDifficulties();
                onClearStatuses();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface StatusCycleButtonProps {
  status: ProblemStatus;
  title: string;
  onClick: () => void;
  showLabel?: boolean;
}

export const StatusCycleButton: React.FC<StatusCycleButtonProps> = ({
  status,
  title,
  onClick,
  showLabel = false,
}) => {
  const nextLabel =
    status === 'unattempted'
      ? 'In-Progress'
      : status === 'in-progress'
        ? 'Solved'
        : 'Unattempted';

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Status: ${status}. Click to mark ${nextLabel}`}
      aria-label={`Change ${title} status from ${status} to ${nextLabel}`}
      className={`inline-flex items-center gap-1 rounded-md transition-colors shrink-0 ${
        showLabel
          ? 'px-2 py-1 border text-[11px] font-semibold ' +
            (status === 'solved'
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : status === 'in-progress'
                ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-slate-400')
          : 'p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
      }`}
    >
      {status === 'solved' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
      ) : status === 'in-progress' ? (
        <Clock3 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
      ) : (
        <Circle className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {showLabel && (
        <span>
          {status === 'solved' ? 'Solved' : status === 'in-progress' ? 'In-Progress' : 'Unattempted'}
        </span>
      )}
    </button>
  );
};
