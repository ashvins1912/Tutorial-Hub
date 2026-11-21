import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { SegmentedTabBar } from '../ui';

type ScenarioId = 'classic-2tx' | 'chain-3tx' | 'ordered-safe';

interface LockEvent {
  step: number;
  txId: string;
  action: 'LOCK_ROW' | 'COMMIT';
  rowId?: string;
  sql: string;
  note: string;
}

interface DeadlockScenario {
  id: ScenarioId;
  label: string;
  shortLabel: string;
  title: string;
  summary: string;
  transactions: { id: string; label: string; workload: string; costScore: number }[];
  rows: { id: string; table: string; label: string }[];
  events: LockEvent[];
}

const DEADLOCK_SCENARIOS: DeadlockScenario[] = [
  {
    id: 'classic-2tx',
    label: '2-Tx Classic Deadlock',
    shortLabel: '2-Tx Cycle',
    title: 'Classic 2-Transaction Circular Wait (Opposite Lock Order)',
    summary:
      'T1 transfers $200 from Account #101 to #202 while T2 simultaneously transfers $50 from Account #202 to #101. Because each acquires row locks in opposite order, a cycle forms in the Wait-For Graph.',
    transactions: [
      { id: 'T1', label: 'Transaction T1', workload: 'Transfer #101 -> #202 ($200)', costScore: 42 },
      { id: 'T2', label: 'Transaction T2', workload: 'Transfer #202 -> #101 ($50)', costScore: 18 },
    ],
    rows: [
      { id: 'Row #101', table: 'accounts', label: 'Account #101 (Alice)' },
      { id: 'Row #202', table: 'accounts', label: 'Account #202 (Bob)' },
    ],
    events: [
      {
        step: 1,
        txId: 'T1',
        action: 'LOCK_ROW',
        rowId: 'Row #101',
        sql: 'SELECT balance FROM accounts WHERE id = 101 FOR UPDATE;',
        note: 'T1 acquires an exclusive row-level FOR UPDATE lock on Row #101.',
      },
      {
        step: 2,
        txId: 'T2',
        action: 'LOCK_ROW',
        rowId: 'Row #202',
        sql: 'SELECT balance FROM accounts WHERE id = 202 FOR UPDATE;',
        note: 'T2 acquires an exclusive row-level FOR UPDATE lock on Row #202.',
      },
      {
        step: 3,
        txId: 'T1',
        action: 'LOCK_ROW',
        rowId: 'Row #202',
        sql: 'UPDATE accounts SET balance = balance + 200 WHERE id = 202;',
        note: 'T1 requests Row #202, which is held by T2 -> edge T1 waits-for T2 added.',
      },
      {
        step: 4,
        txId: 'T2',
        action: 'LOCK_ROW',
        rowId: 'Row #101',
        sql: 'UPDATE accounts SET balance = balance + 50 WHERE id = 101;',
        note: 'T2 requests Row #101, which is held by T1 -> cycle T1 -> T2 -> T1 formed (DEADLOCK!).',
      },
      {
        step: 5,
        txId: 'T1',
        action: 'COMMIT',
        sql: 'COMMIT; -- Completes once Row #202 is released',
        note: 'After T2 is aborted, T1 acquires Row #202, finishes the transfer, and commits cleanly.',
      },
      {
        step: 6,
        txId: 'T2',
        action: 'COMMIT',
        sql: 'COMMIT; -- Completes if T1 was aborted instead',
        note: 'If T1 was chosen as the victim, T2 acquires Row #101 and commits cleanly.',
      },
    ],
  },
  {
    id: 'chain-3tx',
    label: '3-Tx Ring Deadlock',
    shortLabel: '3-Tx Ring',
    title: '3-Transaction Multi-Table Wait-For Ring (T1 -> T2 -> T3 -> T1)',
    summary:
      'Distributed checkout, warehouse restock, and ledger settlement services lock three rows in a 3-way circular dependency. Aborting any single transaction breaks the entire cycle.',
    transactions: [
      { id: 'T1', label: 'Transaction T1', workload: 'Checkout Order #401', costScore: 65 },
      { id: 'T2', label: 'Transaction T2', workload: 'Warehouse Restock #88', costScore: 31 },
      { id: 'T3', label: 'Transaction T3', workload: 'Ledger Settlement #910', costScore: 14 },
    ],
    rows: [
      { id: 'Row #401', table: 'orders', label: 'Order #401' },
      { id: 'Row #88', table: 'inventory', label: 'SKU Inventory #88' },
      { id: 'Row #910', table: 'ledger', label: 'Settlement #910' },
    ],
    events: [
      {
        step: 1,
        txId: 'T1',
        action: 'LOCK_ROW',
        rowId: 'Row #401',
        sql: 'UPDATE orders SET status = \'LOCKED\' WHERE id = 401;',
        note: 'T1 holds exclusive row lock on Order #401.',
      },
      {
        step: 2,
        txId: 'T2',
        action: 'LOCK_ROW',
        rowId: 'Row #88',
        sql: 'UPDATE inventory SET qty = qty - 1 WHERE sku_id = 88;',
        note: 'T2 holds exclusive row lock on SKU Inventory #88.',
      },
      {
        step: 3,
        txId: 'T3',
        action: 'LOCK_ROW',
        rowId: 'Row #910',
        sql: 'UPDATE ledger SET state = \'POSTING\' WHERE entry_id = 910;',
        note: 'T3 holds exclusive row lock on Settlement #910.',
      },
      {
        step: 4,
        txId: 'T1',
        action: 'LOCK_ROW',
        rowId: 'Row #88',
        sql: 'SELECT qty FROM inventory WHERE sku_id = 88 FOR UPDATE;',
        note: 'T1 blocks waiting on T2 for SKU Inventory #88 (T1 -> T2).',
      },
      {
        step: 5,
        txId: 'T2',
        action: 'LOCK_ROW',
        rowId: 'Row #910',
        sql: 'SELECT state FROM ledger WHERE entry_id = 910 FOR UPDATE;',
        note: 'T2 blocks waiting on T3 for Settlement #910 (T2 -> T3).',
      },
      {
        step: 6,
        txId: 'T3',
        action: 'LOCK_ROW',
        rowId: 'Row #401',
        sql: 'SELECT status FROM orders WHERE id = 401 FOR UPDATE;',
        note: 'T3 blocks waiting on T1 for Order #401 -> 3-way cycle T1 -> T2 -> T3 -> T1!',
      },
      {
        step: 7,
        txId: 'T1',
        action: 'COMMIT',
        sql: 'COMMIT; -- Unblocked chain completes',
        note: 'Once a victim is aborted, the remaining transactions unblock in dependency order and commit.',
      },
      {
        step: 8,
        txId: 'T2',
        action: 'COMMIT',
        sql: 'COMMIT; -- Unblocked chain completes',
        note: 'T2 releases its locks upon commit.',
      },
      {
        step: 9,
        txId: 'T3',
        action: 'COMMIT',
        sql: 'COMMIT; -- Unblocked chain completes',
        note: 'T3 releases its locks upon commit.',
      },
    ],
  },
  {
    id: 'ordered-safe',
    label: 'Canonical Order (No Deadlock)',
    shortLabel: 'Safe Order',
    title: 'Deadlock Prevention via Canonical Primary-Key Lock Ordering',
    summary:
      'Both T1 and T2 sort target account IDs ascending (ORDER BY id ASC FOR UPDATE) before locking. T2 waits linearly on T1 without ever creating a cycle.',
    transactions: [
      { id: 'T1', label: 'Transaction T1', workload: 'Sorted lock: #101 then #202', costScore: 40 },
      { id: 'T2', label: 'Transaction T2', workload: 'Sorted lock: #101 then #202', costScore: 22 },
    ],
    rows: [
      { id: 'Row #101', table: 'accounts', label: 'Account #101 (Alice)' },
      { id: 'Row #202', table: 'accounts', label: 'Account #202 (Bob)' },
    ],
    events: [
      {
        step: 1,
        txId: 'T1',
        action: 'LOCK_ROW',
        rowId: 'Row #101',
        sql: 'SELECT id FROM accounts WHERE id IN (101, 202) ORDER BY id ASC FOR UPDATE; -- Row #101',
        note: 'T1 locks the lower PK (Row #101) first.',
      },
      {
        step: 2,
        txId: 'T2',
        action: 'LOCK_ROW',
        rowId: 'Row #101',
        sql: 'SELECT id FROM accounts WHERE id IN (101, 202) ORDER BY id ASC FOR UPDATE; -- Waits #101',
        note: 'T2 also requests Row #101 first and waits cleanly on T1 (T2 -> T1, acyclic).',
      },
      {
        step: 3,
        txId: 'T1',
        action: 'LOCK_ROW',
        rowId: 'Row #202',
        sql: 'UPDATE accounts SET balance = balance + 200 WHERE id = 202;',
        note: 'Row #202 is completely free! T1 acquires it immediately with zero contention.',
      },
      {
        step: 4,
        txId: 'T1',
        action: 'COMMIT',
        sql: 'COMMIT; -- Releases Row #101 and Row #202',
        note: 'T1 commits and releases both locks. T2 immediately wakes up and acquires Row #101.',
      },
      {
        step: 5,
        txId: 'T2',
        action: 'LOCK_ROW',
        rowId: 'Row #202',
        sql: 'UPDATE accounts SET balance = balance + 50 WHERE id = 202;',
        note: 'T2 acquires Row #202 cleanly.',
      },
      {
        step: 6,
        txId: 'T2',
        action: 'COMMIT',
        sql: 'COMMIT; -- Zero deadlocks!',
        note: 'Both transactions finish with 0% abort rate because a DAG can never form a cycle.',
      },
    ],
  },
];

type TxStatus = 'IDLE' | 'ACTIVE' | 'WAITING' | 'DEADLOCKED' | 'COMMITTED' | 'ABORTED';

interface WaitEdge {
  from: string;
  to: string;
  rowId: string;
}

interface ComputedLockState {
  txStatus: Record<string, TxStatus>;
  rowOwner: Record<string, string | null>;
  rowWaiters: Record<string, string[]>;
  waitEdges: WaitEdge[];
  cycleTxIds: string[];
  cycleEdges: Set<string>;
  logs: { id: string; level: 'info' | 'warn' | 'error' | 'success'; message: string }[];
}

function findCycle(txIds: string[], edges: WaitEdge[]): string[] {
  const adj = new Map<string, string[]>();
  txIds.forEach((id) => adj.set(id, []));
  edges.forEach((e) => {
    const list = adj.get(e.from);
    if (list && !list.includes(e.to)) list.push(e.to);
  });

  const state = new Map<string, number>(); // 0 unvisited, 1 visiting, 2 done
  const stack: string[] = [];

  const dfs = (u: string): string[] | null => {
    state.set(u, 1);
    stack.push(u);
    for (const v of adj.get(u) ?? []) {
      const s = state.get(v) ?? 0;
      if (s === 1) {
        const idx = stack.indexOf(v);
        return stack.slice(idx);
      }
      if (s === 0) {
        const found = dfs(v);
        if (found) return found;
      }
    }
    stack.pop();
    state.set(u, 2);
    return null;
  };

  for (const id of txIds) {
    if ((state.get(id) ?? 0) === 0) {
      const cycle = dfs(id);
      if (cycle && cycle.length >= 2) return cycle;
    }
  }
  return [];
}

function simulateLocks(
  scenario: DeadlockScenario,
  appliedSteps: number,
  abortedTxIds: string[]
): ComputedLockState {
  const abortedSet = new Set(abortedTxIds);
  const txStatus: Record<string, TxStatus> = {};
  const rowOwner: Record<string, string | null> = {};
  const rowWaiters: Record<string, string[]> = {};
  const logs: ComputedLockState['logs'] = [];

  scenario.transactions.forEach((t) => {
    txStatus[t.id] = abortedSet.has(t.id) ? 'ABORTED' : 'IDLE';
  });
  scenario.rows.forEach((r) => {
    rowOwner[r.id] = null;
    rowWaiters[r.id] = [];
  });

  const pendingCommits = new Set<string>();

  const releaseAllForTx = (txId: string, reason: 'COMMIT' | 'ABORT') => {
    Object.keys(rowOwner).forEach((rowId) => {
      if (rowOwner[rowId] === txId) {
        rowOwner[rowId] = null;
        // Grant next non-aborted waiter in FIFO order
        while (rowWaiters[rowId].length > 0) {
          const nextTx = rowWaiters[rowId].shift()!;
          if (!abortedSet.has(nextTx) && txStatus[nextTx] !== 'COMMITTED') {
            rowOwner[rowId] = nextTx;
            txStatus[nextTx] = 'ACTIVE';
            logs.push({
              id: `grant-${rowId}-${nextTx}-${logs.length}`,
              level: 'success',
              message: `${nextTx} unblocked and granted exclusive lock on ${rowId} after ${txId} ${reason.toLowerCase()}ed.`,
            });
            break;
          }
        }
      }
      rowWaiters[rowId] = rowWaiters[rowId].filter((w) => w !== txId);
    });
  };

  const tryFlushCommits = () => {
    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const txId of Array.from(pendingCommits)) {
        if (abortedSet.has(txId)) {
          pendingCommits.delete(txId);
          continue;
        }
        const stillWaiting = Object.values(rowWaiters).some((q) => q.includes(txId));
        if (!stillWaiting) {
          txStatus[txId] = 'COMMITTED';
          pendingCommits.delete(txId);
          logs.push({
            id: `commit-${txId}-${logs.length}`,
            level: 'success',
            message: `${txId} COMMIT succeeded — all held row locks released.`,
          });
          releaseAllForTx(txId, 'COMMIT');
          progressed = true;
        }
      }
    }
  };

  const eventsToRun = scenario.events.slice(0, appliedSteps);

  for (const ev of eventsToRun) {
    if (abortedSet.has(ev.txId)) continue;

    if (ev.action === 'LOCK_ROW' && ev.rowId) {
      const currentOwner = rowOwner[ev.rowId];
      if (!currentOwner || currentOwner === ev.txId) {
        rowOwner[ev.rowId] = ev.txId;
        if (txStatus[ev.txId] !== 'WAITING') {
          txStatus[ev.txId] = 'ACTIVE';
        }
        logs.push({
          id: `lock-${ev.step}`,
          level: 'info',
          message: `Step ${ev.step}: ${ev.txId} acquired FOR UPDATE lock on ${ev.rowId}.`,
        });
      } else {
        if (!rowWaiters[ev.rowId].includes(ev.txId)) {
          rowWaiters[ev.rowId].push(ev.txId);
        }
        txStatus[ev.txId] = 'WAITING';
        logs.push({
          id: `wait-${ev.step}`,
          level: 'warn',
          message: `Step ${ev.step}: ${ev.txId} blocked on ${ev.rowId} (held by ${currentOwner}) -> edge ${ev.txId} -> ${currentOwner}.`,
        });
      }
    } else if (ev.action === 'COMMIT') {
      pendingCommits.add(ev.txId);
      tryFlushCommits();
    }
  }

  // Handle aborted victims: record rollback log and flush newly unblocked commits
  if (abortedTxIds.length > 0) {
    abortedTxIds.forEach((victimId) => {
      logs.push({
        id: `abort-${victimId}`,
        level: 'error',
        message: `ERROR 40P01 (deadlock_detected): Aborted ${victimId}, rolled back uncommitted writes, and released its row locks.`,
      });
    });
    // If all events up to deadlock ran and a victim was aborted, allow surviving transactions to complete
    scenario.transactions.forEach((t) => {
      if (!abortedSet.has(t.id) && txStatus[t.id] === 'ACTIVE') {
        const stillWaiting = Object.values(rowWaiters).some((q) => q.includes(t.id));
        if (!stillWaiting && appliedSteps >= 4) {
          pendingCommits.add(t.id);
        }
      }
    });
    tryFlushCommits();
  }

  // Build Wait-For Graph edges: waitingTx -> rowOwner
  const waitEdges: WaitEdge[] = [];
  Object.entries(rowWaiters).forEach(([rowId, waiters]) => {
    const owner = rowOwner[rowId];
    if (!owner) return;
    waiters.forEach((waiter) => {
      if (waiter !== owner && !abortedSet.has(waiter) && !abortedSet.has(owner)) {
        waitEdges.push({ from: waiter, to: owner, rowId });
      }
    });
  });

  const cycleTxIds = findCycle(
    scenario.transactions.map((t) => t.id),
    waitEdges
  );
  const cycleSet = new Set(cycleTxIds);
  const cycleEdges = new Set<string>();

  if (cycleTxIds.length >= 2) {
    cycleTxIds.forEach((id) => {
      txStatus[id] = 'DEADLOCKED';
    });
    waitEdges.forEach((e) => {
      if (cycleSet.has(e.from) && cycleSet.has(e.to)) {
        cycleEdges.add(`${e.from}->${e.to}`);
      }
    });
    logs.push({
      id: 'cycle-detected',
      level: 'error',
      message: `Deadlock detector (deadlock_timeout = 1s) found circular wait: ${[...cycleTxIds, cycleTxIds[0]].join(' -> ')}. Select a transaction to Abort.`,
    });
  }

  return { txStatus, rowOwner, rowWaiters, waitEdges, cycleTxIds, cycleEdges, logs };
}

export function DeadlockWaitForVisualizer() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('classic-2tx');
  // Start at the deadlock step on classic-2tx so users immediately see the circular wait graph & Abort controls
  const [appliedSteps, setAppliedSteps] = useState<number>(4);
  const [abortedTxIds, setAbortedTxIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const scenario = useMemo(
    () => DEADLOCK_SCENARIOS.find((s) => s.id === scenarioId) ?? DEADLOCK_SCENARIOS[0],
    [scenarioId]
  );

  const lockState = useMemo(
    () => simulateLocks(scenario, appliedSteps, abortedTxIds),
    [scenario, appliedSteps, abortedTxIds]
  );

  const hasDeadlock = lockState.cycleTxIds.length >= 2;

  // Recommended victim = lowest undo/work cost transaction in the cycle
  const recommendedVictim = useMemo(() => {
    if (!hasDeadlock) return null;
    const candidates = scenario.transactions.filter((t) => lockState.cycleTxIds.includes(t.id));
    return candidates.sort((a, b) => a.costScore - b.costScore)[0] ?? null;
  }, [hasDeadlock, scenario.transactions, lockState.cycleTxIds]);

  const handleSelectScenario = (nextId: ScenarioId) => {
    setScenarioId(nextId);
    setAbortedTxIds([]);
    setIsPlaying(false);
    // Start at the signature deadlock moment for deadlock scenarios, or step 2 for safe ordering
    if (nextId === 'classic-2tx') setAppliedSteps(4);
    else if (nextId === 'chain-3tx') setAppliedSteps(6);
    else setAppliedSteps(2);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAbortedTxIds([]);
    setAppliedSteps(0);
  };

  const handleStepForward = () => {
    if (hasDeadlock) return;
    setAppliedSteps((prev) => Math.min(scenario.events.length, prev + 1));
  };

  const handleAbortTx = (txId: string) => {
    setIsPlaying(false);
    setAbortedTxIds((prev) => (prev.includes(txId) ? prev : [...prev, txId]));
    // Advance past remaining commit steps so unblocked transactions finish cleanly
    setAppliedSteps(scenario.events.length);
  };

  useEffect(() => {
    if (!isPlaying) return;
    if (hasDeadlock || appliedSteps >= scenario.events.length) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setAppliedSteps((prev) => Math.min(scenario.events.length, prev + 1));
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [isPlaying, hasDeadlock, appliedSteps, scenario.events.length]);

  // Compute clean node coordinates for 2-tx or 3-tx Wait-For Graph SVG
  const txCoords = useMemo(() => {
    if (scenario.transactions.length === 2) {
      return {
        T1: { x: 165, y: 150 },
        T2: { x: 475, y: 150 },
      } as Record<string, { x: number; y: number }>;
    }
    return {
      T1: { x: 320, y: 68 },
      T2: { x: 490, y: 232 },
      T3: { x: 150, y: 232 },
    } as Record<string, { x: number; y: number }>;
  }, [scenario.transactions.length]);

  const statusTextStyle = (status: TxStatus) => {
    switch (status) {
      case 'DEADLOCKED':
        return 'text-rose-700 dark:text-rose-400';
      case 'ABORTED':
        return 'text-slate-500 dark:text-slate-400 line-through';
      case 'COMMITTED':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'WAITING':
        return 'text-amber-700 dark:text-amber-400';
      case 'ACTIVE':
        return 'text-sky-700 dark:text-sky-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
      {/* Header + Scenario Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <GitBranch className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              Lock Manager · Wait-For Graph Cycle Detector
            </span>
            <span aria-hidden="true">·</span>
            <span>Row-Level FOR UPDATE Locks</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {scenario.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-6">
            {scenario.summary}
          </p>
        </div>

        <SegmentedTabBar<ScenarioId>
          ariaLabel="Deadlock simulation scenarios"
          activeTab={scenarioId}
          onChange={handleSelectScenario}
          size="xs"
          tabs={DEADLOCK_SCENARIOS.map((s) => ({
            id: s.id,
            label: s.label,
            shortLabel: s.shortLabel,
          }))}
        />
      </div>

      {/* Simulation Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (appliedSteps >= scenario.events.length || abortedTxIds.length > 0) {
                setAbortedTxIds([]);
                setAppliedSteps(0);
                setIsPlaying(true);
              } else {
                setIsPlaying((v) => !v);
              }
            }}
            disabled={hasDeadlock}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Play Lock Sequence
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepForward}
            disabled={hasDeadlock || appliedSteps >= scenario.events.length}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
            Step Next Lock ({appliedSteps}/{scenario.events.length})
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset to Step 0
          </button>
        </div>

        {/* Explicit Status Indicator (Icon + Text, never hue-only) */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          {hasDeadlock ? (
            <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
              DEADLOCK DETECTED: Cycle {[...lockState.cycleTxIds, lockState.cycleTxIds[0]].join(' -> ')}
            </span>
          ) : abortedTxIds.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              RESOLVED: Aborted {abortedTxIds.join(', ')} — surviving transactions committed
            </span>
          ) : appliedSteps >= scenario.events.length ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              ACYCLIC: All transactions committed with zero deadlocks
            </span>
          ) : (
            <span className="font-mono text-slate-600 dark:text-slate-400">
              NO CYCLE · Active Wait Edges: {lockState.waitEdges.length}
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Zone Sandbox: SVG Wait-For Graph (Left 7) + Row Lock Table & Abort Deck (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Interactive Wait-For Graph SVG */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 mb-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Directed Wait-For Graph (Nodes = Transactions, Edges = Waits-For Lock)
              </span>
              <span className="font-mono tabular-nums">
                DFS Cycle Search: {hasDeadlock ? 'CYCLE FOUND' : 'DAG (SAFE)'}
              </span>
            </div>

            <svg
              viewBox="0 0 640 300"
              role="img"
              aria-label="Wait-For Graph showing transactions and row-level lock dependencies"
              className="w-full h-auto max-h-[300px]"
            >
              <defs>
                <marker
                  id="arrow-wait-amber"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#d97706" />
                </marker>
                <marker
                  id="arrow-wait-crimson"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#dc2626" />
                </marker>
              </defs>

              {/* Subtle Blueprint Grid */}
              <g opacity="0.12" stroke="currentColor" className="text-slate-400 dark:text-slate-600">
                {[60, 120, 180, 240].map((y) => (
                  <line key={`h-${y}`} x1="20" y1={y} x2="620" y2={y} strokeWidth="1" />
                ))}
                {[120, 220, 320, 420, 520].map((x) => (
                  <line key={`v-${x}`} x1={x} y1="20" x2={x} y2="280" strokeWidth="1" />
                ))}
              </g>

              {/* Directed Wait-For Edges */}
              {lockState.waitEdges.map((edge) => {
                const start = txCoords[edge.from];
                const end = txCoords[edge.to];
                if (!start || !end) return null;

                const isCycleEdge = lockState.cycleEdges.has(`${edge.from}->${edge.to}`);
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const dist = Math.hypot(dx, dy) || 1;
                const ux = dx / dist;
                const uy = dy / dist;

                // Curve edges cleanly so opposing 2-tx edges (T1->T2 and T2->T1) never overlap
                const curveOffset = scenario.transactions.length === 2 ? 48 : 26;
                const nx = -uy;
                const ny = ux;
                const nodeRadius = 46;

                const x1 = start.x + ux * nodeRadius + nx * 10;
                const y1 = start.y + uy * nodeRadius + ny * 10;
                const x2 = end.x - ux * (nodeRadius + 4) + nx * 10;
                const y2 = end.y - uy * (nodeRadius + 4) + ny * 10;
                const cx = (start.x + end.x) / 2 + nx * curveOffset;
                const cy = (start.y + end.y) / 2 + ny * curveOffset;
                const labelX = (start.x + end.x) / 2 + nx * (curveOffset * 0.72);
                const labelY = (start.y + end.y) / 2 + ny * (curveOffset * 0.72);

                return (
                  <g key={`${edge.from}-${edge.to}-${edge.rowId}`}>
                    <path
                      d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                      fill="none"
                      stroke={isCycleEdge ? '#dc2626' : '#d97706'}
                      strokeWidth={isCycleEdge ? 3 : 2.25}
                      strokeDasharray="7 5"
                      markerEnd={isCycleEdge ? 'url(#arrow-wait-crimson)' : 'url(#arrow-wait-amber)'}
                    />
                    <rect
                      x={labelX - 58}
                      y={labelY - 12}
                      width="116"
                      height="22"
                      rx="6"
                      className={
                        isCycleEdge
                          ? 'fill-rose-50 dark:fill-rose-950 stroke-rose-400 dark:stroke-rose-700'
                          : 'fill-amber-50 dark:fill-amber-950 stroke-amber-400 dark:stroke-amber-700'
                      }
                      strokeWidth="1"
                    />
                    <text
                      x={labelX}
                      y={labelY + 3}
                      textAnchor="middle"
                      className={`text-[11px] font-mono font-semibold ${
                        isCycleEdge
                          ? 'fill-rose-800 dark:fill-rose-200'
                          : 'fill-amber-800 dark:fill-amber-200'
                      }`}
                    >
                      waits: {edge.rowId}
                    </text>
                  </g>
                );
              })}

              {/* Transaction Nodes */}
              {scenario.transactions.map((tx) => {
                const pos = txCoords[tx.id];
                if (!pos) return null;
                const status = lockState.txStatus[tx.id];
                const heldRows = Object.entries(lockState.rowOwner)
                  .filter(([, owner]) => owner === tx.id)
                  .map(([rowId]) => rowId);

                const circleClass =
                  status === 'DEADLOCKED'
                    ? 'fill-rose-50 dark:fill-rose-950/90 stroke-rose-600 dark:stroke-rose-500'
                    : status === 'ABORTED'
                      ? 'fill-slate-100 dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-700'
                      : status === 'COMMITTED'
                        ? 'fill-emerald-50 dark:fill-emerald-950/80 stroke-emerald-600 dark:stroke-emerald-500'
                        : status === 'WAITING'
                          ? 'fill-amber-50 dark:fill-amber-950/80 stroke-amber-500'
                          : status === 'ACTIVE'
                            ? 'fill-sky-50 dark:fill-sky-950/80 stroke-sky-600 dark:stroke-sky-400'
                            : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700';

                return (
                  <g key={tx.id}>
                    <circle cx={pos.x} cy={pos.y} r="44" strokeWidth="2.5" className={circleClass} />
                    <text
                      x={pos.x}
                      y={pos.y - 6}
                      textAnchor="middle"
                      className="text-base font-mono font-bold fill-slate-900 dark:fill-slate-100"
                    >
                      {tx.id}
                    </text>
                    <text
                      x={pos.x}
                      y={pos.y + 12}
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-semibold ${
                        status === 'DEADLOCKED'
                          ? 'fill-rose-700 dark:fill-rose-300'
                          : status === 'COMMITTED'
                            ? 'fill-emerald-700 dark:fill-emerald-300'
                            : status === 'WAITING'
                              ? 'fill-amber-700 dark:fill-amber-300'
                              : status === 'ACTIVE'
                                ? 'fill-sky-700 dark:fill-sky-300'
                                : 'fill-slate-500 dark:fill-slate-400'
                      }`}
                    >
                      {status}
                    </text>
                    {heldRows.length > 0 && (
                      <text
                        x={pos.x}
                        y={pos.y + 60}
                        textAnchor="middle"
                        className="text-[11px] font-mono fill-slate-700 dark:fill-slate-300"
                      >
                        Holds: {heldRows.join(', ')}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Abort Resolution Panel (appears prominently whenever a cycle exists) */}
          {hasDeadlock && (
            <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    Circular Wait Condition Active — Abort a Victim Transaction to Break the Cycle
                  </div>
                  <p className="text-xs text-rose-800/90 dark:text-rose-300/90 mt-0.5">
                    PostgreSQL&apos;s deadlock detector wakes after <code className="font-mono">deadlock_timeout</code> (default 1s) and aborts one transaction (<code className="font-mono">SQLSTATE 40P01</code>) so the remaining transactions can acquire their locks and commit.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {scenario.transactions
                  .filter((t) => lockState.cycleTxIds.includes(t.id))
                  .map((tx) => (
                    <button
                      key={tx.id}
                      type="button"
                      onClick={() => handleAbortTx(tx.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Abort {tx.id} (Rollback cost: {tx.costScore})
                    </button>
                  ))}

                {recommendedVictim && (
                  <button
                    type="button"
                    onClick={() => handleAbortTx(recommendedVictim.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-rose-400 dark:border-rose-700 bg-white dark:bg-slate-900 text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors whitespace-nowrap shrink-0"
                  >
                    Auto-Abort Lowest-Cost Victim ({recommendedVictim.id})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lock Manager Event Log */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-4 space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-400">
              Lock Manager Trace Log
            </div>
            {lockState.logs.length === 0 ? (
              <div className="text-xs font-mono text-slate-400">
                No locks acquired yet. Click &ldquo;Step Next Lock&rdquo; or &ldquo;Play Lock Sequence&rdquo; to execute transactions.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px] leading-5">
                {lockState.logs.map((entry) => (
                  <div
                    key={entry.id}
                    className={
                      entry.level === 'error'
                        ? 'text-rose-400 font-semibold'
                        : entry.level === 'warn'
                          ? 'text-amber-300'
                          : entry.level === 'success'
                            ? 'text-emerald-400'
                            : 'text-sky-300'
                    }
                  >
                    {entry.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Zone: Live Row-Level Lock Table & Active Transactions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Row-Level Lock Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Active Row-Level Lock Table (pg_locks)
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Exclusive FOR UPDATE
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {scenario.rows.map((row) => {
                const owner = lockState.rowOwner[row.id];
                const waiters = lockState.rowWaiters[row.id] ?? [];
                return (
                  <div key={row.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {row.id}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {row.table} · {row.label}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] shrink-0 space-y-0.5">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Held by: </span>
                        <span
                          className={
                            owner
                              ? 'font-semibold text-sky-700 dark:text-sky-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }
                        >
                          {owner ?? 'FREE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Waiters: </span>
                        <span
                          className={
                            waiters.length > 0
                              ? 'font-semibold text-amber-700 dark:text-amber-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }
                        >
                          {waiters.length > 0 ? waiters.join(', ') : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transactions Roster with Direct Abort Controls */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Transaction Sessions
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Direct Victim Control
              </span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {scenario.transactions.map((tx) => {
                const status = lockState.txStatus[tx.id];
                const canAbort = status === 'DEADLOCKED' || status === 'WAITING' || status === 'ACTIVE';
                return (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {tx.id}
                        </span>
                        <span className={`font-mono text-[11px] font-semibold ${statusTextStyle(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {tx.workload}
                      </div>
                    </div>
                    {canAbort && (
                      <button
                        type="button"
                        onClick={() => handleAbortTx(tx.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                          status === 'DEADLOCKED'
                            ? 'border-rose-500 bg-rose-600 text-white hover:bg-rose-700'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        Abort {tx.id}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline SQL Execution Script */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100">
              SQL Lock Timeline
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-56 overflow-y-auto">
              {scenario.events.map((ev) => {
                const executed = ev.step <= appliedSteps;
                const isLatest = ev.step === appliedSteps;
                return (
                  <div
                    key={ev.step}
                    className={`px-3.5 py-2.5 text-[11px] transition-colors ${
                      isLatest
                        ? 'bg-sky-50/80 dark:bg-sky-950/40'
                        : executed
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-50/40 dark:bg-slate-950/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        Step 0{ev.step} · {ev.txId}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {executed ? 'Executed' : 'Pending'}
                      </span>
                    </div>
                    <code className="block font-mono text-[11px] text-sky-700 dark:text-sky-400 mt-1 break-all">
                      {ev.sql}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
