import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { CopyButton } from '../ui';

interface OrderRow {
  orderId: number;
  customer: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED';
  updatedAt: string;
}

interface WalEntry {
  id: string;
  index: number;
  lsn: string;
  timestamp: string;
  walSegment: string;
  op: 'BASE_BACKUP' | 'INSERT' | 'UPDATE' | 'DROP_TABLE';
  sql: string;
  description: string;
  payload?: {
    orderId: number;
    customer?: string;
    amount?: number;
    status?: OrderRow['status'];
  };
}

const BASE_BACKUP_ROWS: OrderRow[] = [
  { orderId: 1001, customer: 'Northwind Traders', amount: 640, status: 'SHIPPED', updatedAt: '00:00:00' },
  { orderId: 1002, customer: 'Acme Logistics', amount: 1180, status: 'PENDING', updatedAt: '00:00:00' },
  { orderId: 1003, customer: 'Vanguard Retail', amount: 390, status: 'PAID', updatedAt: '00:00:00' },
];

const INITIAL_WAL_STREAM: WalEntry[] = [
  {
    id: 'wal-0',
    index: 0,
    lsn: '0/1000000',
    timestamp: '00:00:00',
    walSegment: '000000010000000000000001',
    op: 'BASE_BACKUP',
    sql: 'pg_basebackup -D /var/lib/postgresql/restore --checkpoint=fast',
    description: 'Nightly physical snapshot restored (3 committed baseline orders).',
  },
  {
    id: 'wal-1',
    index: 1,
    lsn: '0/1042A00',
    timestamp: '09:05:12',
    walSegment: '000000010000000000000002',
    op: 'INSERT',
    sql: "INSERT INTO orders VALUES (1004, 'Globex Corp', 420, 'PENDING');",
    description: 'Order #1004 committed and archived to S3 WAL stream.',
    payload: { orderId: 1004, customer: 'Globex Corp', amount: 420, status: 'PENDING' },
  },
  {
    id: 'wal-2',
    index: 2,
    lsn: '0/1089F10',
    timestamp: '09:12:40',
    walSegment: '000000010000000000000002',
    op: 'UPDATE',
    sql: "UPDATE orders SET status = 'PAID' WHERE order_id = 1002;",
    description: 'Payment webhook marked Order #1002 as PAID.',
    payload: { orderId: 1002, status: 'PAID' },
  },
  {
    id: 'wal-3',
    index: 3,
    lsn: '0/10D4C80',
    timestamp: '09:18:05',
    walSegment: '000000010000000000000003',
    op: 'INSERT',
    sql: "INSERT INTO orders VALUES (1005, 'Initech Cloud', 1290, 'PAID');",
    description: 'Enterprise checkout Order #1005 committed.',
    payload: { orderId: 1005, customer: 'Initech Cloud', amount: 1290, status: 'PAID' },
  },
  {
    id: 'wal-4',
    index: 4,
    lsn: '0/1120B40',
    timestamp: '09:24:31',
    walSegment: '000000010000000000000003',
    op: 'INSERT',
    sql: "INSERT INTO orders VALUES (1006, 'Soylent Supply', 860, 'PENDING');",
    description: 'Order #1006 committed cleanly.',
    payload: { orderId: 1006, customer: 'Soylent Supply', amount: 860, status: 'PENDING' },
  },
  {
    id: 'wal-5',
    index: 5,
    lsn: '0/1168E00',
    timestamp: '09:29:59',
    walSegment: '000000010000000000000004',
    op: 'UPDATE',
    sql: "UPDATE orders SET status = 'SHIPPED' WHERE order_id = 1004;",
    description: 'Last healthy commit before disaster (1 second before DROP TABLE).',
    payload: { orderId: 1004, status: 'SHIPPED' },
  },
  {
    id: 'wal-6',
    index: 6,
    lsn: '0/11A0000',
    timestamp: '09:30:00',
    walSegment: '000000010000000000000004',
    op: 'DROP_TABLE',
    sql: 'DROP TABLE orders CASCADE; -- Accidental migration run against prod!',
    description: 'SEV-1 Incident: orders table dropped in production and logged to WAL.',
  },
];

function replayWalUpTo(entries: WalEntry[], stepIndex: number): {
  rows: OrderRow[];
  tableDropped: boolean;
  droppedAt: string | null;
  replayedEntries: WalEntry[];
} {
  let rows: OrderRow[] = BASE_BACKUP_ROWS.map((r) => ({ ...r }));
  let tableDropped = false;
  let droppedAt: string | null = null;

  const limit = Math.max(0, Math.min(stepIndex, entries.length - 1));
  const replayedEntries = entries.slice(0, limit + 1);

  for (const entry of replayedEntries) {
    if (entry.op === 'BASE_BACKUP') continue;
    if (entry.op === 'DROP_TABLE') {
      tableDropped = true;
      droppedAt = entry.timestamp;
      rows = [];
      continue;
    }
    if (tableDropped) continue;

    if (entry.op === 'INSERT' && entry.payload) {
      rows = [
        ...rows,
        {
          orderId: entry.payload.orderId,
          customer: entry.payload.customer ?? 'New Customer',
          amount: entry.payload.amount ?? 500,
          status: entry.payload.status ?? 'PENDING',
          updatedAt: entry.timestamp,
        },
      ];
    } else if (entry.op === 'UPDATE' && entry.payload) {
      rows = rows.map((r) =>
        r.orderId === entry.payload?.orderId
          ? {
              ...r,
              status: entry.payload.status ?? r.status,
              updatedAt: entry.timestamp,
            }
          : r
      );
    }
  }

  return { rows, tableDropped, droppedAt, replayedEntries };
}

export function PitrRecoveryPlayground() {
  const [walEntries, setWalEntries] = useState<WalEntry[]>(INITIAL_WAL_STREAM);
  // Default recovery target: 09:29:59 (index 5 — 1 second before DROP TABLE!)
  const [targetIndex, setTargetIndex] = useState<number>(5);
  // Current animated replay cursor
  const [replayCursor, setReplayCursor] = useState<number>(0);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const [nextOrderId, setNextOrderId] = useState<number>(1007);

  const dropEntryIndex = useMemo(
    () => walEntries.findIndex((e) => e.op === 'DROP_TABLE'),
    [walEntries]
  );

  const targetEntry = walEntries[Math.min(targetIndex, walEntries.length - 1)] ?? walEntries[0];
  const currentCursorEntry =
    walEntries[Math.min(replayCursor, walEntries.length - 1)] ?? walEntries[0];

  // Current live (disaster) state at end of WAL stream
  const liveProdState = useMemo(
    () => replayWalUpTo(walEntries, walEntries.length - 1),
    [walEntries]
  );

  // Recovered standby state at current replay cursor
  const recoveredState = useMemo(
    () => replayWalUpTo(walEntries, replayCursor),
    [walEntries, replayCursor]
  );

  const replayComplete = replayCursor === targetIndex && replayCursor > 0;
  const recoverySafe = !recoveredState.tableDropped && replayComplete;

  // Count how many healthy post-backup commits were missed if user chose an earlier timestamp
  const healthyTotalBeforeDrop = useMemo(() => {
    const end = dropEntryIndex === -1 ? walEntries.length : dropEntryIndex;
    return walEntries.slice(1, end).length;
  }, [walEntries, dropEntryIndex]);

  const recoveredHealthyCommits = useMemo(() => {
    if (recoveredState.tableDropped) return 0;
    return walEntries.slice(1, replayCursor + 1).filter((e) => e.op !== 'DROP_TABLE').length;
  }, [walEntries, replayCursor, recoveredState.tableDropped]);

  const missedCommits = Math.max(0, healthyTotalBeforeDrop - recoveredHealthyCommits);

  useEffect(() => {
    if (!isReplaying) return;
    if (replayCursor >= targetIndex) {
      setIsReplaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setReplayCursor((prev) => Math.min(targetIndex, prev + 1));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [isReplaying, replayCursor, targetIndex]);

  const handleStartReplay = () => {
    if (targetIndex === 0) {
      setReplayCursor(0);
      setIsReplaying(false);
      return;
    }
    if (replayCursor >= targetIndex) {
      setReplayCursor(0);
    }
    setIsReplaying(true);
  };

  const handleStepReplay = () => {
    setIsReplaying(false);
    setReplayCursor((prev) => Math.min(targetIndex, prev + 1));
  };

  const handleResetPlayground = () => {
    setIsReplaying(false);
    setWalEntries(INITIAL_WAL_STREAM);
    setTargetIndex(5);
    setReplayCursor(0);
    setNextOrderId(1007);
  };

  const handleInjectLiveTransaction = () => {
    setIsReplaying(false);
    const hasDrop = walEntries.some((e) => e.op === 'DROP_TABLE');
    // Insert right before DROP TABLE if present, or at end if no drop yet
    const insertAt = hasDrop ? walEntries.findIndex((e) => e.op === 'DROP_TABLE') : walEntries.length;
    const prevTime = walEntries[Math.max(0, insertAt - 1)]?.timestamp ?? '09:29:00';
    const [hh, mm, ss] = prevTime.split(':').map(Number);
    const totalSec = hh * 3600 + mm * 60 + ss + 1;
    const fmt = (n: number) => String(n).padStart(2, '0');
    const newTs = `${fmt(Math.floor(totalSec / 3600))}:${fmt(Math.floor((totalSec % 3600) / 60))}:${fmt(totalSec % 60)}`;
    const newLsn = `0/11${(70 + nextOrderId).toString(16).toUpperCase()}00`;

    const newEntry: WalEntry = {
      id: `wal-custom-${nextOrderId}`,
      index: insertAt,
      lsn: newLsn,
      timestamp: newTs,
      walSegment: '000000010000000000000004',
      op: 'INSERT',
      sql: `INSERT INTO orders VALUES (${nextOrderId}, 'Custom SaaS #${nextOrderId}', 750, 'PAID');`,
      description: `Injected live transaction Order #${nextOrderId} archived into WAL.`,
      payload: {
        orderId: nextOrderId,
        customer: `Custom SaaS #${nextOrderId}`,
        amount: 750,
        status: 'PAID',
      },
    };

    const updated = [...walEntries];
    updated.splice(insertAt, 0, newEntry);
    const reindexed = updated.map((item, idx) => ({ ...item, index: idx }));
    setWalEntries(reindexed);
    setTargetIndex(insertAt);
    setReplayCursor(0);
    setNextOrderId((n) => n + 1);
  };

  const recoveryConfigSnippet = `# postgresql.auto.conf (Generated for PITR Restore Cluster)
restore_command = 'pgbackrest --stanza=prod archive-get %f "%p"'
recovery_target_time = '2026-11-21 ${targetEntry.timestamp}+00'
recovery_target_lsn = '${targetEntry.lsn}'
recovery_target_inclusive = true
recovery_target_action = 'promote'   # Opens Timeline 2 once target LSN is reached`;

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <HardDrive className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              Disaster Recovery · Base Backup + Continuous WAL Archiving
            </span>
            <span aria-hidden="true">·</span>
            <span>Point-in-Time Recovery (PITR)</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Interactive Point-in-Time Recovery (PITR) &amp; WAL Replay Playground
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-6">
            Production suffered an accidental <code className="font-mono">DROP TABLE orders</code> at{' '}
            <span className="font-mono font-semibold text-rose-700 dark:text-rose-400">09:30:00</span>. Choose a{' '}
            <code className="font-mono">recovery_target_time</code> before the drop and replay archived Write-Ahead Log (WAL) segments onto the midnight base backup to recover zero-loss data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInjectLiveTransaction}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            Inject New Tx Before Drop
          </button>
          <button
            type="button"
            onClick={handleResetPlayground}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset Timeline
          </button>
        </div>
      </div>

      {/* Interactive Recovery Target Slider + Replay Controls */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <label
              htmlFor="pitr-target-slider"
              className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Set Recovery Target Timestamp (<code className="font-mono">recovery_target_time</code>)
            </label>
            <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
              Selected Target:{' '}
              <span
                className={`font-semibold ${
                  targetEntry.op === 'DROP_TABLE'
                    ? 'text-rose-700 dark:text-rose-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {targetEntry.timestamp} (LSN {targetEntry.lsn})
              </span>{' '}
              · {targetEntry.op === 'DROP_TABLE' ? 'WARNING: Includes DROP TABLE!' : targetEntry.op}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => (isReplaying ? setIsReplaying(false) : handleStartReplay())}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
            >
              {isReplaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  Pause Replay
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  {replayComplete ? 'Replay Again' : 'Start WAL Replay'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleStepReplay}
              disabled={replayCursor >= targetIndex}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
              Step WAL ({replayCursor}/{targetIndex})
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            id="pitr-target-slider"
            type="range"
            min={0}
            max={walEntries.length - 1}
            step={1}
            value={targetIndex}
            onChange={(e) => {
              const val = Number(e.target.value);
              setIsReplaying(false);
              setTargetIndex(val);
              if (replayCursor > val) setReplayCursor(val);
            }}
            className="w-full accent-sky-600"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {walEntries.map((entry) => {
              const isTarget = entry.index === targetIndex;
              const isReplayed = entry.index <= replayCursor;
              const isDrop = entry.op === 'DROP_TABLE';
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    setIsReplaying(false);
                    setTargetIndex(entry.index);
                    if (replayCursor > entry.index) setReplayCursor(entry.index);
                  }}
                  className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                    isTarget
                      ? isDrop
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50'
                        : 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                      : isDrop
                        ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:border-rose-400'
                        : isReplayed
                          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-[10px] font-mono tabular-nums">
                    <span
                      className={
                        isDrop
                          ? 'font-bold text-rose-700 dark:text-rose-400'
                          : 'font-semibold text-slate-700 dark:text-slate-300'
                      }
                    >
                      {entry.timestamp}
                    </span>
                    {isTarget && (
                      <span className="font-bold text-sky-700 dark:text-sky-400">TARGET</span>
                    )}
                  </div>
                  <div
                    className={`text-[11px] font-mono font-semibold truncate mt-0.5 ${
                      isDrop
                        ? 'text-rose-700 dark:text-rose-400'
                        : isReplayed
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {entry.op === 'BASE_BACKUP'
                      ? 'Base Backup'
                      : entry.op === 'DROP_TABLE'
                        ? 'DROP TABLE!'
                        : `${entry.op} #${entry.payload?.orderId}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Replay Cursor LSN</div>
          <div className="text-base font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {currentCursorEntry.lsn}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            At {currentCursorEntry.timestamp}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Recovered Rows</div>
          <div
            className={`text-base font-mono font-bold tabular-nums mt-0.5 ${
              recoveredState.tableDropped
                ? 'text-rose-700 dark:text-rose-400'
                : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {recoveredState.tableDropped ? '0 (TABLE DROPPED)' : `${recoveredState.rows.length} rows`}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            Live Prod: {liveProdState.tableDropped ? 'DROPPED' : `${liveProdState.rows.length} rows`}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Effective Data Loss (RPO)</div>
          <div
            className={`text-base font-mono font-bold tabular-nums mt-0.5 ${
              recoveredState.tableDropped
                ? 'text-rose-700 dark:text-rose-400'
                : missedCommits === 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {recoveredState.tableDropped
              ? 'TOTAL LOSS'
              : missedCommits === 0
                ? '0 Commits Lost'
                : `${missedCommits} Commits Pending`}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            {recoveredHealthyCommits}/{healthyTotalBeforeDrop} post-backup writes
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">Cluster Timeline State</div>
          <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {replayComplete ? 'Timeline 2 (Promoted)' : isReplaying ? 'Replaying WAL...' : 'Timeline 1 (Standby)'}
          </div>
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
            {recoverySafe
              ? 'Safe to cut over traffic'
              : recoveredState.tableDropped
                ? 'Move target before 09:30:00'
                : 'Ready to replay'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Stage: Archived WAL Stream (Left 6) + Live Recovered Table & Config (Right 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Archived WAL Segments & Replay Status */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Archived WAL Stream (S3 / pgBackRest)
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Stops at {targetEntry.timestamp}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {walEntries.map((entry) => {
              const isApplied = entry.index <= replayCursor;
              const isBeyondTarget = entry.index > targetIndex;
              const isDrop = entry.op === 'DROP_TABLE';
              const isCurrent = entry.index === replayCursor;

              return (
                <div
                  key={entry.id}
                  className={`p-3.5 text-xs transition-colors ${
                    isDrop && isApplied
                      ? 'bg-rose-50/80 dark:bg-rose-950/40'
                      : isCurrent
                        ? 'bg-sky-50/70 dark:bg-sky-950/30'
                        : isBeyondTarget
                          ? 'bg-slate-50/50 dark:bg-slate-950/40 opacity-60'
                          : 'bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        {entry.timestamp}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 dark:text-slate-400">LSN {entry.lsn}</span>
                    </div>
                    <span
                      className={`font-semibold ${
                        isDrop && isApplied
                          ? 'text-rose-700 dark:text-rose-400'
                          : isApplied
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : isBeyondTarget
                              ? 'text-slate-500 dark:text-slate-400'
                              : 'text-sky-700 dark:text-sky-400'
                      }`}
                    >
                      {isDrop && isBeyondTarget
                        ? 'SKIPPED (DISASTER AVOIDED)'
                        : isDrop && isApplied
                          ? 'REPLAYED DROP TABLE!'
                          : isApplied
                            ? 'REPLAYED'
                            : isBeyondTarget
                              ? 'DISCARDED (PAST TARGET)'
                              : 'QUEUED FOR REPLAY'}
                    </span>
                  </div>
                  <code
                    className={`block font-mono text-[11px] mt-1.5 break-all ${
                      isDrop ? 'text-rose-700 dark:text-rose-400 font-semibold' : 'text-sky-700 dark:text-sky-400'
                    }`}
                  >
                    {entry.sql}
                  </code>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    {entry.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Reconstructed `orders` Table State + Dynamic PostgreSQL PITR Config */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Recovered Standby Table: <code className="font-mono">public.orders</code>
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                Snapshot @ {currentCursorEntry.timestamp}
              </span>
            </div>

            {recoveredState.tableDropped ? (
              <div className="p-6 text-center space-y-2 bg-rose-50/50 dark:bg-rose-950/20">
                <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400 mx-auto" aria-hidden="true" />
                <div className="text-sm font-mono font-semibold text-rose-800 dark:text-rose-300">
                  ERROR: relation &quot;public.orders&quot; does not exist
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300/90 max-w-md mx-auto leading-5">
                  Your recovery target ({targetEntry.timestamp}) replayed the <code className="font-mono">DROP TABLE</code> WAL record at {recoveredState.droppedAt}. Move the target timestamp slider to <strong>09:29:59</strong> (before the drop) and replay again.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">order_id</th>
                      <th className="py-2.5 px-3">customer</th>
                      <th className="py-2.5 px-3 text-right">amount</th>
                      <th className="py-2.5 px-3">status</th>
                      <th className="py-2.5 px-3 text-right">wal_time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {recoveredState.rows.map((row) => (
                      <tr
                        key={row.orderId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                          #{row.orderId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                          {row.customer}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                          ${row.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {row.status}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          {row.updatedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Outcome Verification Banner */}
          {replayComplete && (
            <div
              className={`rounded-xl border p-3.5 flex items-start gap-2.5 text-xs ${
                recoverySafe
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              {recoverySafe ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              )}
              <div className="leading-5">
                {recoverySafe ? (
                  <>
                    <strong>PITR Promotion Successful:</strong> PostgreSQL stopped WAL replay at{' '}
                    <code className="font-mono">{targetEntry.timestamp}</code>, bypassed the{' '}
                    <code className="font-mono">DROP TABLE</code> event, and opened a fresh Timeline 2 with{' '}
                    <strong>{recoveredState.rows.length} intact rows</strong>.
                  </>
                ) : (
                  <>
                    <strong>Recovery Overshot the Incident:</strong> Set the slider to{' '}
                    <code className="font-mono">09:29:59</code> so WAL replay halts strictly before the{' '}
                    <code className="font-mono">09:30:00</code> DDL drop.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Dynamic PostgreSQL Recovery Config */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Generated PostgreSQL PITR Recovery Configuration
              </span>
              <CopyButton text={recoveryConfigSnippet} label="Copy Config" copiedLabel="Copied" size="xs" />
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
              {recoveryConfigSnippet}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
