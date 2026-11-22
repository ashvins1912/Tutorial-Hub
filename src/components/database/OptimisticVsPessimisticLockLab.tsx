import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  Lock,
  LockOpen,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CopyButton } from '../ui';

type LockingStrategy = 'optimistic' | 'pessimistic' | 'skip-locked';
type ContentionLevel = 'low' | 'medium' | 'high';

interface TxStepFrame {
  tick: string;
  title: string;
  explanation: string;
  rowBalance: number;
  rowVersion: number;
  lockOwner: 'NONE' | 'Tx A (ROW EXCLUSIVE)' | 'Tx B (ROW EXCLUSIVE)';
  waitQueue: string;
  txAState: 'IDLE' | 'READING' | 'COMPUTING' | 'LOCKED' | 'COMMITTED' | 'BLOCKED' | 'CONFLICT';
  txASql: string;
  txBState: 'IDLE' | 'READING' | 'COMPUTING' | 'LOCKED' | 'COMMITTED' | 'BLOCKED' | 'CONFLICT' | 'SKIPPED_OK';
  txBSql: string;
}

const SCENARIOS: Record<LockingStrategy, {
  name: string;
  tagline: string;
  sqlReference: string;
  frames: TxStepFrame[];
}> = {
  optimistic: {
    name: 'Optimistic Concurrency Control (Version CAS)',
    tagline: 'Zero DB locks during read/think time — detects conflicts at COMMIT via `WHERE version = $v` and retries cleanly.',
    sqlReference: `-- OPTIMISTIC LOCKING (Zero row lock while reading/computing!)
-- 1. Read current state + version
SELECT balance, version FROM accounts WHERE id = 42; -- returns ($100, v=1)

-- 2. Atomic Compare-And-Swap (CAS) update:
UPDATE accounts
SET balance = balance - 30, version = version + 1
WHERE id = 42 AND version = 1;
-- If affected_rows == 0 -> Conflict! Re-read v=2 and retry in app!`,
    frames: [
      {
        tick: 'T+0ms',
        title: 'Both Tx A & Tx B Read Account #42 Simultaneously (No Locks!)',
        explanation:
          'Under MVCC + Optimistic Locking, neither transaction locks the row on read. Both read `balance = $100, version = 1` concurrently at zero wait latency.',
        rowBalance: 100,
        rowVersion: 1,
        lockOwner: 'NONE',
        waitQueue: 'Empty (0 waiting)',
        txAState: 'READING',
        txASql: 'SELECT balance, version FROM accounts WHERE id = 42;\n-- Got: ($100, version = 1)',
        txBState: 'READING',
        txBSql: 'SELECT balance, version FROM accounts WHERE id = 42;\n-- Got: ($100, version = 1)',
      },
      {
        tick: 'T+15ms',
        title: 'Both Run Business Logic in App Memory (DB Completely Free!)',
        explanation:
          'Tx A prepares to withdraw $30; Tx B prepares to withdraw $40. Because NO database lock is held during app work, connection pools stay completely free!',
        rowBalance: 100,
        rowVersion: 1,
        lockOwner: 'NONE',
        waitQueue: 'Empty (0 waiting)',
        txAState: 'COMPUTING',
        txASql: '// App logic: $100 - $30 = $70\n// Ready to CAS with expected version = 1',
        txBState: 'COMPUTING',
        txBSql: '// App logic: $100 - $40 = $60\n// Ready to CAS with expected version = 1',
      },
      {
        tick: 'T+28ms',
        title: 'Tx A Executes Atomic CAS (`WHERE version = 1`) -> WINS!',
        explanation:
          'Row #42 still has `version = 1`. PostgreSQL atomically updates balance to `$70`, bumps `version` to `2`, and commits Tx A in 1ms!',
        rowBalance: 70,
        rowVersion: 2,
        lockOwner: 'NONE',
        waitQueue: 'Empty (0 waiting)',
        txAState: 'COMMITTED',
        txASql: 'UPDATE accounts SET balance = 70, version = 2\nWHERE id = 42 AND version = 1;\n-- 1 row updated -> COMMIT OK!',
        txBState: 'COMPUTING',
        txBSql: '-- Sending UPDATE with stale version = 1...',
      },
      {
        tick: 'T+32ms',
        title: 'Tx B Executes Stale CAS (`WHERE version = 1`) -> 0 ROWS (CONFLICT!)',
        explanation:
          'Because `version` is now `2`, Tx B’s `WHERE version = 1` matches 0 rows! Optimistic locking caught the race condition and PREVENTED a Lost Update (overwriting $70 with $60)!',
        rowBalance: 70,
        rowVersion: 2,
        lockOwner: 'NONE',
        waitQueue: 'Empty (Tx B retrying)',
        txAState: 'COMMITTED',
        txASql: '-- Tx A finished cleanly ($70, v=2)',
        txBState: 'CONFLICT',
        txBSql: 'UPDATE accounts SET balance = 60, version = 2\nWHERE id = 42 AND version = 1;\n-- 0 ROWS AFFECTED! OptimisticLockException!',
      },
      {
        tick: 'T+44ms',
        title: 'Tx B Re-Reads Fresh Version `2` & Commits Safely ($30, v=3)',
        explanation:
          'Tx B catches the conflict, re-reads fresh `($70, v=2)`, subtracts `$40 -> $30`, runs `WHERE version = 2`, and commits! Final balance `$30` (`$100 - $30 - $40`) is 100% mathematically exact.',
        rowBalance: 30,
        rowVersion: 3,
        lockOwner: 'NONE',
        waitQueue: 'Empty (0 waiting)',
        txAState: 'COMMITTED',
        txASql: '-- Committed ($100 -> $70)',
        txBState: 'COMMITTED',
        txBSql: 'SELECT balance, version ... -> ($70, v=2)\nUPDATE accounts SET balance = 30, version = 3\nWHERE id = 42 AND version = 2; -- 1 row -> COMMIT!',
      },
    ],
  },

  pessimistic: {
    name: 'Pessimistic Row Locking (`SELECT ... FOR UPDATE`)',
    tagline: 'Locks the row upfront so conflicting writers wait in a FIFO queue — zero wasted retries under heavy contention!',
    sqlReference: `-- PESSIMISTIC LOCKING (Best for hot wallets / Tatkal inventory!)
BEGIN;
-- Exclusive row lock acquired immediately; concurrent writers BLOCK here!
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;

UPDATE accounts SET balance = balance - 30 WHERE id = 42;
COMMIT; -- Releases lock & wakes next transaction in wait queue!`,
    frames: [
      {
        tick: 'T+0ms',
        title: 'Tx A Acquires Exclusive Row Lock (`SELECT ... FOR UPDATE`)',
        explanation:
          'Tx A immediately locks Account #42 with an exclusive row lock inside an open transaction. Readers without `FOR UPDATE` can still read the MVCC snapshot, but writers must wait.',
        rowBalance: 100,
        rowVersion: 1,
        lockOwner: 'Tx A (ROW EXCLUSIVE)',
        waitQueue: 'Empty',
        txAState: 'LOCKED',
        txASql: 'BEGIN;\nSELECT balance FROM accounts WHERE id = 42 FOR UPDATE;\n-- Lock ACQUIRED! Got balance = $100',
        txBState: 'IDLE',
        txBSql: 'BEGIN;\n-- About to request row #42...',
      },
      {
        tick: 'T+8ms',
        title: 'Tx B Requests `FOR UPDATE` -> BLOCKS in Lock Wait Queue!',
        explanation:
          'Tx B hits the active row lock owned by Tx A and pauses inside the DB Lock Manager Wait Queue. Notice: Tx B holds a DB connection slot while waiting!',
        rowBalance: 100,
        rowVersion: 1,
        lockOwner: 'Tx A (ROW EXCLUSIVE)',
        waitQueue: 'Tx B waiting (8ms...)',
        txAState: 'COMPUTING',
        txASql: '-- Validating balance >= $30 while holding DB lock...',
        txBState: 'BLOCKED',
        txBSql: 'SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;\n-- BLOCKED! Waiting for Tx A to COMMIT or ROLLBACK...',
      },
      {
        tick: 'T+24ms',
        title: 'Tx A Updates Balance to `$70` & Commits -> Releases Lock',
        explanation:
          'Tx A writes `$70` to WAL and commits, immediately releasing the row lock and signaling the Lock Manager to wake Tx B.',
        rowBalance: 70,
        rowVersion: 2,
        lockOwner: 'NONE',
        waitQueue: 'Waking Tx B...',
        txAState: 'COMMITTED',
        txASql: 'UPDATE accounts SET balance = 70 WHERE id = 42;\nCOMMIT; -- Lock RELEASED!',
        txBState: 'BLOCKED',
        txBSql: '-- Lock Manager waking Tx B with latest committed row!',
      },
      {
        tick: 'T+26ms',
        title: 'Tx B Unblocks, Acquires Lock & Reads Fresh `$70` Automatically!',
        explanation:
          'PostgreSQL’s `EvalPlanQual` automatically re-fetches the newly committed `$70` row for Tx B — zero application retry code needed!',
        rowBalance: 70,
        rowVersion: 2,
        lockOwner: 'Tx B (ROW EXCLUSIVE)',
        waitQueue: 'Empty',
        txAState: 'COMMITTED',
        txASql: '-- Committed ($100 -> $70)',
        txBState: 'LOCKED',
        txBSql: '-- Lock ACQUIRED! Fresh balance = $70\n-- Computing $70 - $40 = $30...',
      },
      {
        tick: 'T+34ms',
        title: 'Tx B Commits `$30` Cleanly With Zero Retry Loops!',
        explanation:
          'Final balance is `$30` with ZERO wasted retry work. Rule: Keep pessimistic transactions ultra-short (<20ms) — never call slow external HTTP APIs while holding a row lock!',
        rowBalance: 30,
        rowVersion: 3,
        lockOwner: 'NONE',
        waitQueue: 'Empty',
        txAState: 'COMMITTED',
        txASql: '-- Committed ($100 -> $70)',
        txBState: 'COMMITTED',
        txBSql: 'UPDATE accounts SET balance = 30 WHERE id = 42;\nCOMMIT; -- Done with 0 retries!',
      },
    ],
  },

  'skip-locked': {
    name: 'Pessimistic Non-Blocking (`FOR UPDATE SKIP LOCKED`)',
    tagline: 'For job queues & multi-row batch workers: skip locked rows immediately so parallel workers NEVER block each other!',
    sqlReference: `-- NON-BLOCKING QUEUE / BATCH WORKER PATTERN
BEGIN;
SELECT job_id, payload
FROM pending_jobs
WHERE status = 'QUEUED'
ORDER BY created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED; -- Instant 0ms claim of next FREE row!`,
    frames: [
      {
        tick: 'T+0ms',
        title: 'Worker A Locks Job #42 (`FOR UPDATE SKIP LOCKED`)',
        explanation:
          'Worker A claims the first free queued row (Job #42) with an exclusive row lock.',
        rowBalance: 100,
        rowVersion: 1,
        lockOwner: 'Tx A (ROW EXCLUSIVE)',
        waitQueue: 'Empty',
        txAState: 'LOCKED',
        txASql: 'SELECT id FROM jobs WHERE status=\'QUEUED\'\nORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;\n-- Claimed Job #42!',
        txBState: 'IDLE',
        txBSql: '-- Worker B polling next available job...',
      },
      {
        tick: 'T+4ms',
        title: 'Worker B Skips Locked Job #42 -> Claims Job #43 in 0ms!',
        explanation:
          'Instead of sitting blocked in a Lock Wait Queue behind Worker A, `SKIP LOCKED` instantly steps over Job #42 and grabs Job #43 in parallel!',
        rowBalance: 100,
        rowVersion: 1,
        lockOwner: 'Tx A (ROW EXCLUSIVE)',
        waitQueue: '0ms Wait (Skipped!)',
        txAState: 'COMPUTING',
        txASql: '-- Processing Job #42 concurrently...',
        txBState: 'SKIPPED_OK',
        txBSql: 'SELECT id FROM jobs WHERE status=\'QUEUED\'\nORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;\n-- Skipped #42 -> Claimed Job #43 in 0.4ms!',
      },
      {
        tick: 'T+18ms',
        title: 'Both Workers Commit in Parallel at Maximum Throughput!',
        explanation:
          'Zero lock contention, zero wasted retries, and zero double-processed jobs — the exact pattern used in PostgreSQL job queues and zero-downtime 10M-row batch updates.',
        rowBalance: 70,
        rowVersion: 2,
        lockOwner: 'NONE',
        waitQueue: 'Empty',
        txAState: 'COMMITTED',
        txASql: 'UPDATE jobs SET status=\'DONE\' WHERE id=42; COMMIT;',
        txBState: 'COMMITTED',
        txBSql: 'UPDATE jobs SET status=\'DONE\' WHERE id=43; COMMIT;',
      },
    ],
  },
};

function txBadgeStyle(state: string): string {
  switch (state) {
    case 'COMMITTED':
    case 'SKIPPED_OK':
      return 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
    case 'BLOCKED':
      return 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300';
    case 'CONFLICT':
      return 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
    case 'LOCKED':
      return 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300';
    default:
      return 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400';
  }
}

export function OptimisticVsPessimisticLockLab() {
  const [strategy, setStrategy] = useState<LockingStrategy>('optimistic');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [contention, setContention] = useState<ContentionLevel>('medium');

  const scenario = SCENARIOS[strategy];
  const frame = scenario.frames[stepIdx] ?? scenario.frames[0];

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [strategy]);

  useEffect(() => {
    if (!isPlaying) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= scenario.frames.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [isPlaying, scenario.frames.length]);

  // Derived benchmark telemetry comparing Optimistic vs Pessimistic under selected contention level
  const bench =
    contention === 'low'
      ? {
          optTps: '14,200 TPS',
          optRetry: '2% retries',
          pesTps: '9,800 TPS',
          pesWait: '1.2ms lock overhead',
          winner: 'Optimistic Locking Wins',
          reason:
            'When conflicts are rare (<5%, e.g., user profiles or CMS edits), skipping upfront locks maximizes throughput and keeps DB connections free.',
        }
      : contention === 'medium'
        ? {
            optTps: '6,400 TPS',
            optRetry: '32% retries',
            pesTps: '7,900 TPS',
            pesWait: '6.5ms avg queue wait',
            winner: 'Pessimistic Edge on Hot Rows',
            reason:
              'At ~35% conflict rate, Optimistic starts wasting ~1/3 of CPU work on rolled-back retries; short Pessimistic locks serialize cleanly.',
          }
        : {
            optTps: '1,100 TPS (Livelock!)',
            optRetry: '84% wasted retries!',
            pesTps: '5,600 TPS (Steady)',
            pesWait: '18ms deterministic FIFO',
            winner: 'Pessimistic Locking (`FOR UPDATE`) Wins Decisively',
            reason:
              'During 80% contention (IRCTC Tatkal / viral flash sales / hot wallets), Optimistic suffers retry storms & livelock. Use Pessimistic locking (or single-writer queues)!',
          };

  return (
    <div className="space-y-5">
      {/* Header & Strategy Switcher */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Concurrent SQL Transaction Locking Simulator
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Optimistic (`WHERE version = $v`) vs. Pessimistic (`SELECT ... FOR UPDATE`)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Step through two concurrent SQL transactions (`Tx A` withdrawing $30 and `Tx B` withdrawing $40 from Account #42 = $100) to see exact row versions, lock queues, CAS conflicts, and `SKIP LOCKED` behavior.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'optimistic', label: 'Optimistic (Version CAS)', icon: LockOpen },
                { id: 'pessimistic', label: 'Pessimistic (FOR UPDATE)', icon: Lock },
                { id: 'skip-locked', label: 'Non-Blocking (SKIP LOCKED)', icon: Zap },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = strategy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStrategy(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback & Timeline Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {scenario.frames.map((f, idx) => (
              <button
                key={f.tick}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(idx);
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono tabular-nums ${
                  idx === stepIdx
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {idx + 1}. {f.tick}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx((p) => Math.max(0, p - 1));
              }}
              disabled={stepIdx === 0}
              aria-label="Previous step"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (stepIdx >= scenario.frames.length - 1) setStepIdx(0);
                setIsPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Play Race'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx((p) => Math.min(scenario.frames.length - 1, p + 1));
              }}
              disabled={stepIdx === scenario.frames.length - 1}
              aria-label="Next step"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(0);
              }}
              aria-label="Reset simulation"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Center Stage: Live Database Row State + Concurrent Tx A / Tx B Execution Lanes */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
            [{frame.tick}] Step {stepIdx + 1} of {scenario.frames.length}
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {frame.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {frame.explanation}
          </p>
        </div>

        {/* Live Shared DB Row Tuple Box */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono tabular-nums">
          <div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <Database className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              ROW #42 BALANCE
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              ${frame.rowBalance}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">ROW VERSION (MVCC)</div>
            <div className="text-lg font-bold text-sky-700 dark:text-sky-400 mt-0.5">
              v = {frame.rowVersion}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">ACTIVE ROW LOCK</div>
            <div
              className={`text-xs font-bold mt-1.5 ${
                frame.lockOwner === 'NONE'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              {frame.lockOwner}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">LOCK WAIT QUEUE</div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1.5">
              {frame.waitQueue}
            </div>
          </div>
        </div>

        {/* Side-by-Side Tx A vs Tx B Execution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Transaction A (Withdraw $30 / Worker A)
              </span>
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${txBadgeStyle(
                  frame.txAState
                )}`}
              >
                {frame.txAState}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-white dark:bg-slate-900">
              <code>{frame.txASql}</code>
            </pre>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Transaction B (Withdraw $40 / Worker B)
              </span>
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-mono font-semibold ${txBadgeStyle(
                  frame.txBState
                )}`}
              >
                {frame.txBState}
              </span>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-white dark:bg-slate-900">
              <code>{frame.txBSql}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Interactive Contention Benchmark & Decision Advisor */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Contention Load Benchmark Advisor
            </p>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              When Should You Pick Optimistic vs. Pessimistic Locking?
            </h4>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-500">Contention:</span>
            {(
              [
                { id: 'low', label: 'Low (5%)' },
                { id: 'medium', label: 'Medium (35%)' },
                { id: 'high', label: 'Extreme (80% Tatkal)' },
              ] as const
            ).map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setContention(lvl.id)}
                className={`px-2.5 py-1 rounded-lg border ${
                  contention === lvl.id
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono tabular-nums">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
            <div className="text-[10px] text-slate-500">OPTIMISTIC (VERSION CAS)</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {bench.optTps}
            </div>
            <div className="text-[11px] text-amber-700 dark:text-amber-400">{bench.optRetry}</div>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1">
            <div className="text-[10px] text-slate-500">PESSIMISTIC (FOR UPDATE)</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {bench.pesTps}
            </div>
            <div className="text-[11px] text-sky-700 dark:text-sky-400">{bench.pesWait}</div>
          </div>
          <div className="p-3.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/25 space-y-1 font-sans">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {bench.winner}
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {bench.reason}
            </p>
          </div>
        </div>

        {/* Deadlock & External-IO Warning + Reference SQL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/70 bg-amber-50/40 dark:bg-amber-950/20 space-y-2 text-xs">
            <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Two Production Rules Every Senior Engineer Enforces
            </div>
            <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Prevent Deadlocks:</strong> When locking multiple rows pessimistically, ALWAYS sort IDs ascending (`ORDER BY id ASC FOR UPDATE`) so Tx A &amp; Tx B never form a circular wait.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>No External I/O Under Locks:</strong> NEVER call Stripe, email, or LLM APIs inside a `FOR UPDATE` transaction — use a short TTL lease or Transactional Outbox!
                </span>
              </li>
            </ul>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Production SQL Pattern ({strategy})
              </span>
              <CopyButton text={scenario.sqlReference} label="Copy SQL" />
            </div>
            <pre className="p-3.5 text-[11px] font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
              <code>{scenario.sqlReference}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
