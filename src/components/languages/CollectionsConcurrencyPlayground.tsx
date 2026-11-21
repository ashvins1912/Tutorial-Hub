import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Play,
  Plus,
  RotateCcw,
  Search,
  Shuffle,
  Trash2,
} from 'lucide-react';
import {
  COLLECTION_MATRIX_ROWS,
  CONCURRENCY_RUNTIME_SPECS,
  THREAD_FSM_ACTIONS,
  THREAD_FSM_NODES,
  type ConcurrencyRuntimeId,
  type ThreadFsmStateId,
} from '../../data/langCollectionsConcurrencyData';
import type { LangTrack } from '../../data/languagesTutorialData';
import { SegmentedTabBar } from '../ui';

interface CollectionsConcurrencyPlaygroundProps {
  languageFilter: 'all' | LangTrack;
}

type PlaygroundMode = 'collections' | 'concurrency';
type HashEngineMode = 'java-hashmap' | 'python-dict';
type WorkloadKind = 'io' | 'cpu';
type SyncStrategy = 'none' | 'lock' | 'atomic';

interface MapEntry {
  key: string;
  value: string;
  hash: number;
  bucket: number;
}

function deterministicHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

const INITIAL_ENTRIES: Array<{ key: string; value: string; forceBucket?: number }> = [
  { key: 'user_101', value: 'Alice' },
  { key: 'user_204', value: 'Raj' },
  { key: 'order_9', value: '$420' },
  { key: 'session_k', value: 'active' },
];

export function CollectionsConcurrencyPlayground({
  languageFilter,
}: CollectionsConcurrencyPlaygroundProps) {
  const [mode, setMode] = useState<PlaygroundMode>('collections');

  // --- Collections HashMap / Python dict Interactive State ---
  const [hashEngine, setHashEngine] = useState<HashEngineMode>(
    languageFilter === 'python' ? 'python-dict' : 'java-hashmap'
  );
  const [capacity, setCapacity] = useState<number>(8);
  const [entries, setEntries] = useState<MapEntry[]>(() =>
    INITIAL_ENTRIES.map((e) => {
      const hash = deterministicHash(e.key);
      return { key: e.key, value: e.value, hash, bucket: hash & 7 };
    })
  );
  const [keyInput, setKeyInput] = useState('tenant_acme');
  const [valInput, setValInput] = useState('pro_plan');
  const [lookupResult, setLookupResult] = useState<string>(
    'Ready — insert, lookup, or force hash collisions to watch bucket chains, treeification, and resizing.'
  );
  const [lastHighlightedBucket, setLastHighlightedBucket] = useState<number | null>(null);
  const [collisionSeed, setCollisionSeed] = useState<number>(1);

  useEffect(() => {
    if (languageFilter === 'python') setHashEngine('python-dict');
    if (languageFilter === 'java') setHashEngine('java-hashmap');
  }, [languageFilter]);

  const loadThreshold = hashEngine === 'java-hashmap' ? 0.75 : 0.67;
  const loadFactor = entries.length / capacity;

  const buckets = useMemo(() => {
    const arr: MapEntry[][] = Array.from({ length: capacity }, () => []);
    entries.forEach((entry) => {
      const idx = entry.bucket % capacity;
      arr[idx].push(entry);
    });
    return arr;
  }, [entries, capacity]);

  const maxBucketDepth = useMemo(
    () => buckets.reduce((max, b) => Math.max(max, b.length), 0),
    [buckets]
  );

  const visibleMatrixRows = useMemo(
    () =>
      languageFilter === 'all'
        ? COLLECTION_MATRIX_ROWS
        : COLLECTION_MATRIX_ROWS.filter((r) => r.language === languageFilter),
    [languageFilter]
  );

  const handlePut = (forceBucket?: number) => {
    const k = (forceBucket !== undefined ? `collide_${collisionSeed}` : keyInput).trim();
    const v = (forceBucket !== undefined ? `node_${collisionSeed}` : valInput).trim() || 'val';
    if (!k) return;

    if (forceBucket !== undefined) {
      setCollisionSeed((s) => s + 1);
    }

    const hash = forceBucket !== undefined ? forceBucket : deterministicHash(k);
    const existingIdx = entries.findIndex((e) => e.key === k);
    let nextEntries: MapEntry[];
    let nextCap = capacity;

    if (existingIdx >= 0) {
      nextEntries = entries.map((e, i) => (i === existingIdx ? { ...e, value: v } : e));
      const b = nextEntries[existingIdx].bucket % nextCap;
      setLastHighlightedBucket(b);
      setLookupResult(`Updated existing key "${k}" in bucket [${b}] in O(1) average time.`);
    } else {
      const bucket = forceBucket !== undefined ? forceBucket % nextCap : hash & (nextCap - 1);
      nextEntries = [...entries, { key: k, value: v, hash, bucket }];

      // Check resize threshold (skip auto-resize during forced collision demo so user can inspect chain/treeify!)
      if (forceBucket === undefined && nextEntries.length / nextCap > loadThreshold && nextCap < 32) {
        nextCap = nextCap * 2;
        nextEntries = nextEntries.map((e) => ({
          ...e,
          bucket: e.hash & (nextCap - 1),
        }));
        setCapacity(nextCap);
        const newB = hash & (nextCap - 1);
        setLastHighlightedBucket(newB);
        setLookupResult(
          `Load exceeded ${Math.round(loadThreshold * 100)}%! Resized table to ${nextCap} slots & rehashed "${k}" -> bucket [${newB}].`
        );
      } else {
        setLastHighlightedBucket(bucket);
        const depth = nextEntries.filter((e) => e.bucket % nextCap === bucket).length;
        if (hashEngine === 'java-hashmap' && depth >= 8) {
          setLookupResult(
            `Bucket [${bucket}] reached ${depth} colliding nodes! Java HashMap triggers treeifyBin() -> balanced Red-Black Tree (O(log n) worst-case).`
          );
        } else if (hashEngine === 'python-dict' && depth > 1) {
          setLookupResult(
            `Slot [${bucket}] collided! Python dict runs open-addressing perturbation probe while preserving exact insertion order in compact entries[].`
          );
        } else {
          setLookupResult(`Inserted "${k}" -> "${v}" into bucket [${bucket}] (depth ${depth}).`);
        }
      }
    }

    setEntries(nextEntries);
  };

  const handleLookup = () => {
    const k = keyInput.trim();
    if (!k) return;
    const found = entries.find((e) => e.key === k);
    if (!found) {
      const h = deterministicHash(k);
      const b = h & (capacity - 1);
      setLastHighlightedBucket(b);
      setLookupResult(`MISS: Key "${k}" hashed to bucket [${b}], not found in O(1).`);
      return;
    }
    const b = found.bucket % capacity;
    const bucketChain = buckets[b];
    const probes = bucketChain.findIndex((e) => e.key === k) + 1;
    setLastHighlightedBucket(b);
    setLookupResult(
      `HIT: Found "${found.key}" => "${found.value}" in bucket [${b}] after ${probes} ${
        hashEngine === 'java-hashmap' && bucketChain.length >= 8
          ? 'Red-Black tree step(s)'
          : 'probe/node comparison(s)'
      }.`
    );
  };

  const handleRemove = () => {
    const k = keyInput.trim();
    if (!k) return;
    const target = entries.find((e) => e.key === k);
    if (!target) {
      setLookupResult(`Cannot remove "${k}" — key does not exist.`);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.key !== k));
    setLastHighlightedBucket(target.bucket % capacity);
    setLookupResult(
      hashEngine === 'python-dict'
        ? `Removed "${k}" — Python marks a DUMMY tombstone in dk_indices so probe chains stay intact.`
        : `Removed "${k}" from bucket [${target.bucket % capacity}] — unlinked node in O(1) avg.`
    );
  };

  const handleResetMap = () => {
    setCapacity(8);
    setCollisionSeed(1);
    setLastHighlightedBucket(null);
    setEntries(
      INITIAL_ENTRIES.map((e) => {
        const hash = deterministicHash(e.key);
        return { key: e.key, value: e.value, hash, bucket: hash & 7 };
      })
    );
    setLookupResult('Reset table to 4 starter keys across 8 buckets.');
  };

  // --- Multithreading FSM + Concurrency Race Simulator State ---
  const [fsmState, setFsmState] = useState<ThreadFsmStateId>('NEW');
  const [fsmLog, setFsmLog] = useState<string[]>([
    'Thread created in NEW state. Click start() to schedule it.',
  ]);

  const currentFsmNode = useMemo(
    () => THREAD_FSM_NODES.find((n) => n.id === fsmState) ?? THREAD_FSM_NODES[0],
    [fsmState]
  );

  const availableTransitions = useMemo(
    () => THREAD_FSM_ACTIONS.filter((a) => a.from.includes(fsmState)),
    [fsmState]
  );

  const handleFsmTransition = (actionId: string) => {
    const action = THREAD_FSM_ACTIONS.find((a) => a.id === actionId);
    if (!action) return;
    setFsmState(action.to);
    setFsmLog((prev) => [
      `${fsmState} --[${action.label}]--> ${action.to}: ${action.explanation}`,
      ...prev.slice(0, 4),
    ]);
  };

  const handleResetFsm = () => {
    setFsmState('NEW');
    setFsmLog(['Reset thread back to NEW state.']);
  };

  // --- Race Condition & Multi-Runtime Throughput Simulator ---
  const [runtimeId, setRuntimeId] = useState<ConcurrencyRuntimeId>('java-virtual-threads');
  const [workload, setWorkload] = useState<WorkloadKind>('io');
  const [syncStrategy, setSyncStrategy] = useState<SyncStrategy>('lock');
  const [taskCount, setTaskCount] = useState<number>(64);
  const [simProgress, setSimProgress] = useState<number>(100);
  const [isSimRunning, setIsSimRunning] = useState<boolean>(false);

  const selectedRuntime = useMemo(
    () => CONCURRENCY_RUNTIME_SPECS.find((r) => r.id === runtimeId) ?? CONCURRENCY_RUNTIME_SPECS[0],
    [runtimeId]
  );

  useEffect(() => {
    if (!isSimRunning) return;
    setSimProgress(0);
    const id = window.setInterval(() => {
      setSimProgress((p) => {
        if (p >= 100) {
          window.clearInterval(id);
          setIsSimRunning(false);
          return 100;
        }
        return p + 10;
      });
    }, 65);
    return () => window.clearInterval(id);
  }, [isSimRunning]);

  const simMetrics = useMemo(() => {
    const expectedIncrements = taskCount * 100;
    const lostUpdates =
      syncStrategy === 'none'
        ? Math.round(
            expectedIncrements *
              (selectedRuntime.gilSerializedCpu && workload === 'cpu' ? 0.14 : 0.34)
          )
        : 0;
    const observedIncrements = expectedIncrements - lostUpdates;

    const baseTaskMs = workload === 'io' ? 40 : 25;
    const effectiveParallelism =
      workload === 'io'
        ? Math.min(taskCount, selectedRuntime.ioConcurrencyCap)
        : Math.min(taskCount, selectedRuntime.cpuSpeedupOn8Cores);

    const lockPenalty =
      syncStrategy === 'lock' ? 1.24 : syncStrategy === 'atomic' ? 1.05 : 1.0;

    const wallClockMs = Math.max(
      12,
      Math.round((taskCount * baseTaskMs * lockPenalty) / Math.max(1, effectiveParallelism))
    );
    const ramMb = Number(((taskCount * selectedRuntime.memoryPerTaskKb) / 1024).toFixed(2));
    const throughput = Math.round((taskCount / wallClockMs) * 1000);

    return {
      expectedIncrements,
      observedIncrements,
      lostUpdates,
      wallClockMs,
      ramMb,
      throughput,
      effectiveParallelism: Number(effectiveParallelism.toFixed(1)),
    };
  }, [taskCount, syncStrategy, selectedRuntime, workload]);

  const workerLanes = useMemo(() => {
    const lanes = Math.min(8, Math.max(4, Math.ceil(selectedRuntime.cpuSpeedupOn8Cores)));
    return Array.from({ length: lanes }, (_, i) => {
      const gilBlocked =
        selectedRuntime.gilSerializedCpu && workload === 'cpu' && i > 0;
      const pct = gilBlocked
        ? Math.max(8, Math.round(simProgress * 0.18))
        : Math.min(100, Math.round(simProgress * (0.88 + ((i % 3) * 0.06))));
      return {
        lane: i + 1,
        pct,
        status: gilBlocked ? 'WAITING ON GIL' : simProgress >= 100 ? 'DONE' : 'ACTIVE',
      };
    });
  }, [selectedRuntime, workload, simProgress]);

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
            Interactive Collections &amp; Multithreading Playground
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Experiment with live hash buckets, collisions, Red-Black treeification, thread lifecycle state machines, and multi-core race conditions.
          </p>
        </div>

        <SegmentedTabBar<PlaygroundMode>
          ariaLabel="Switch playground between Collections and Multithreading"
          activeTab={mode}
          onChange={setMode}
          size="xs"
          tabs={[
            { id: 'collections', label: 'Collections & Hash Playground', shortLabel: 'Collections', icon: Layers },
            { id: 'concurrency', label: 'Threads Lifecycle & Race Lab', shortLabel: 'Multithreading', icon: Cpu },
          ]}
        />
      </section>

      {mode === 'collections' ? (
        <div className="space-y-6">
          {/* Interactive HashMap / Python dict Bucket Playground */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Live Hash Table Internals Playground: Java HashMap vs. Python 3.13 Compact dict
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Insert keys, force collisions into Bucket [0] to watch Java Red-Black treeification (@ 8 nodes) or Python perturbation probing &amp; insertion-ordered entries.
                </p>
              </div>
              <SegmentedTabBar<HashEngineMode>
                ariaLabel="Choose HashMap or Python dict engine"
                activeTab={hashEngine}
                onChange={setHashEngine}
                size="xs"
                tabs={[
                  { id: 'java-hashmap', label: 'Java 21 HashMap (0.75 + RB-Tree)' },
                  { id: 'python-dict', label: 'Python 3.13 dict (0.67 + Ordered)' },
                ]}
              />
            </div>

            {/* Interactive Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Key
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="lg:col-span-3 space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Value
                </label>
                <input
                  type="text"
                  value={valInput}
                  onChange={(e) => setValInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="lg:col-span-6 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePut()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Put / Insert
                </button>
                <button
                  type="button"
                  onClick={handleLookup}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  <Search className="w-3.5 h-3.5" aria-hidden="true" />
                  Get
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => handlePut(0)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-400/70 bg-amber-50/70 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/70 whitespace-nowrap"
                >
                  <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
                  Force Collision [0]
                </button>
                <button
                  type="button"
                  onClick={handleResetMap}
                  aria-label="Reset hash map"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Live Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Size / Capacity</div>
                <div className="text-base font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {entries.length} / {capacity}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Load Factor</div>
                <div className="text-base font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {(loadFactor * 100).toFixed(0)}% (limit {Math.round(loadThreshold * 100)}%)
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Max Bucket Depth</div>
                <div className="text-base font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {maxBucketDepth} {hashEngine === 'java-hashmap' && maxBucketDepth >= 8 ? '· RB-Tree' : 'nodes'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Lookup Complexity</div>
                <div className="text-base font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  {maxBucketDepth >= 8 && hashEngine === 'java-hashmap' ? 'O(log n)' : 'O(1) avg'}
                </div>
              </div>
            </div>

            {/* Live Action Trace */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-3.5 py-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
              {lookupResult}
            </div>

            {/* Visual Bucket Array + Python Compact Entries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {buckets.map((chain, idx) => {
                const isTreeified = hashEngine === 'java-hashmap' && chain.length >= 8;
                const isHot = lastHighlightedBucket === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3 space-y-2 transition-colors ${
                      isTreeified
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30'
                        : isHot
                          ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Bucket [{idx}]
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {isTreeified ? 'RB-Tree (O(log n))' : `${chain.length} item${chain.length === 1 ? '' : 's'}`}
                      </span>
                    </div>
                    {chain.length === 0 ? (
                      <div className="text-[11px] font-mono text-slate-400 dark:text-slate-600">
                        empty slot
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {chain.map((item) => (
                          <div
                            key={item.key}
                            className="rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-mono flex items-center justify-between gap-2"
                          >
                            <span className="truncate font-semibold text-slate-900 dark:text-slate-100">
                              {item.key}
                            </span>
                            <span className="truncate text-sky-700 dark:text-sky-400">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {hashEngine === 'python-dict' && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Python 3.13 Compact Insertion-Ordered dk_entries[] Array (Preserves Exact Insert Order)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {entries.map((e, i) => (
                    <div
                      key={e.key}
                      className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-[11px] font-mono text-slate-800 dark:text-slate-200"
                    >
                      [{i}] {e.key}: {e.value}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Complete Python & Java Collections Big-O Matrix */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Complete Collections Reference Matrix (Python 3.13+ &amp; Java 21+)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Compare backing memory layout, Big-O operations, ordering, and thread-safety across both ecosystems.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3 font-semibold">Collection</th>
                    <th className="py-2.5 pr-3 font-semibold">Backing Internals</th>
                    <th className="py-2.5 pr-3 font-semibold">Lookup</th>
                    <th className="py-2.5 pr-3 font-semibold">Tail / Head Insert</th>
                    <th className="py-2.5 pr-3 font-semibold">Thread-Safety</th>
                    <th className="py-2.5 font-semibold">Ideal Production Use</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleMatrixRows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="py-2.5 pr-3 font-mono font-semibold whitespace-nowrap">
                        <span
                          className={
                            row.language === 'python'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {row.name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-slate-700 dark:text-slate-300">
                        {row.backingStructure}
                      </td>
                      <td className="py-2.5 pr-3 font-mono tabular-nums text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {row.lookup}
                      </td>
                      <td className="py-2.5 pr-3 font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {row.insertTail} / {row.insertHead}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">
                        {row.threadSafety}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{row.bestFor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Thread Lifecycle State Machine (Python + Java) */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Interactive Thread Lifecycle State Machine (Java Thread.State &amp; Python threading)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Trigger real scheduler transitions to watch a thread move through NEW, RUNNABLE, RUNNING, BLOCKED, WAITING, TIMED_WAITING, and TERMINATED.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFsm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset to NEW
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7: Interactive SVG FSM */}
              <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4">
                <svg
                  viewBox="0 0 650 248"
                  role="img"
                  aria-label="Thread lifecycle finite state machine"
                  className="w-full h-auto max-h-[260px]"
                >
                  <defs>
                    <marker
                      id="fsm-arrow"
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                    </marker>
                  </defs>

                  {/* Canonical Transition Lines */}
                  {[
                    ['NEW', 'RUNNABLE'],
                    ['RUNNABLE', 'RUNNING'],
                    ['RUNNING', 'BLOCKED'],
                    ['BLOCKED', 'RUNNABLE'],
                    ['RUNNING', 'WAITING'],
                    ['WAITING', 'RUNNABLE'],
                    ['RUNNING', 'TIMED_WAITING'],
                    ['TIMED_WAITING', 'RUNNABLE'],
                    ['RUNNING', 'TERMINATED'],
                  ].map(([fromId, toId], idx) => {
                    const f = THREAD_FSM_NODES.find((n) => n.id === fromId)!;
                    const t = THREAD_FSM_NODES.find((n) => n.id === toId)!;
                    const dx = t.x - f.x;
                    const dy = t.y - f.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    const ux = dx / dist;
                    const uy = dy / dist;
                    const isOutgoing = f.id === fsmState;
                    return (
                      <line
                        key={idx}
                        x1={f.x + ux * 52}
                        y1={f.y + uy * 22}
                        x2={t.x - ux * 54}
                        y2={t.y - uy * 24}
                        stroke={isOutgoing ? '#0284c7' : '#94a3b8'}
                        strokeWidth={isOutgoing ? 2 : 1.2}
                        strokeDasharray={isOutgoing ? '5 3' : undefined}
                        markerEnd="url(#fsm-arrow)"
                        opacity={isOutgoing ? 1 : 0.45}
                      />
                    );
                  })}

                  {/* State Nodes */}
                  {THREAD_FSM_NODES.map((node) => {
                    const active = node.id === fsmState;
                    return (
                      <g key={node.id}>
                        <rect
                          x={node.x - 54}
                          y={node.y - 22}
                          width={108}
                          height={44}
                          rx="9"
                          strokeWidth={active ? 2.4 : 1.2}
                          className={
                            active
                              ? 'fill-sky-50 dark:fill-sky-950/90 stroke-sky-600 dark:stroke-sky-400'
                              : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                          }
                        />
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          className={`text-[10px] font-mono font-bold ${
                            active
                              ? 'fill-sky-800 dark:fill-sky-300'
                              : 'fill-slate-800 dark:fill-slate-200'
                          }`}
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Right 5: Active State Details + Trigger Controls */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-sky-700 dark:text-sky-400">
                      Current State: {currentFsmNode.label}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-5">
                    {currentFsmNode.simpleEnglish}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                    <div className="text-amber-700 dark:text-amber-400">
                      Java 21: {currentFsmNode.javaApi}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-400">
                      Python 3.13: {currentFsmNode.pythonApi}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Trigger Legal Transitions from {fsmState}
                  </div>
                  {availableTransitions.length === 0 ? (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400">
                      Thread is TERMINATED permanently (calling start() again throws IllegalThreadStateException / RuntimeError). Click Reset to spawn a fresh thread.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTransitions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleFsmTransition(act.id)}
                          className="px-3 py-1.5 rounded-lg border border-sky-500/60 bg-sky-50/70 dark:bg-sky-950/40 text-xs font-semibold text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/70 transition-colors whitespace-nowrap"
                        >
                          {act.label} → {act.to}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-sky-300 p-3 font-mono text-[11px] leading-5 space-y-1">
                  {fsmLog.map((line, i) => (
                    <div key={i} className={i === 0 ? 'text-emerald-300' : 'opacity-70'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Multi-Runtime Concurrency & Race Condition Simulator */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Live Multithreading Race Condition &amp; Runtime Throughput Simulator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Compare Python GIL Threads, Python 3.13t No-GIL, ProcessPoolExecutor, Java OS ThreadPool, and Java 21 Virtual Threads across I/O vs. CPU workloads and Lock strategies.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSimRunning(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap self-start lg:self-auto"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Run Concurrent Batch
              </button>
            </div>

            {/* Runtime Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {CONCURRENCY_RUNTIME_SPECS.map((spec) => {
                const active = spec.id === runtimeId;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setRuntimeId(spec.id)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`text-[10px] font-mono font-semibold ${
                        spec.language === 'python'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {spec.language === 'python' ? 'Python 3.13+' : 'Java 21+'}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {spec.shortLabel}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Workload, Sync Strategy & Concurrency Slider */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-4 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Workload Profile
                </div>
                <SegmentedTabBar<WorkloadKind>
                  ariaLabel="Workload profile"
                  activeTab={workload}
                  onChange={setWorkload}
                  size="xs"
                  tabs={[
                    { id: 'io', label: 'I/O-Bound (DB / HTTP)' },
                    { id: 'cpu', label: 'CPU-Bound (Compute)' },
                  ]}
                />
              </div>

              <div className="lg:col-span-4 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Shared Counter Synchronization
                </div>
                <SegmentedTabBar<SyncStrategy>
                  ariaLabel="Synchronization strategy"
                  activeTab={syncStrategy}
                  onChange={setSyncStrategy}
                  size="xs"
                  tabs={[
                    { id: 'none', label: 'No Lock (Race)' },
                    { id: 'lock', label: 'Lock / ReentrantLock' },
                    { id: 'atomic', label: 'Atomic / Queue' },
                  ]}
                />
              </div>

              <div className="lg:col-span-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Concurrent Tasks
                  </span>
                  <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                    {taskCount} tasks (× 100 writes)
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={512}
                  step={8}
                  value={taskCount}
                  onChange={(e) => setTaskCount(Number(e.target.value))}
                  aria-label="Concurrent tasks count"
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            {/* Animated Worker Lanes + Outcome Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-2.5">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {selectedRuntime.label} — 8-Core Worker Execution Lanes
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedRuntime.summary}
                </p>
                <div className="space-y-2 pt-1">
                  {workerLanes.map((w) => (
                    <div key={w.lane} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-700 dark:text-slate-300">
                          Core / Worker #{w.lane}
                        </span>
                        <span
                          className={
                            w.status === 'WAITING ON GIL'
                              ? 'text-amber-700 dark:text-amber-400 font-semibold'
                              : 'text-sky-700 dark:text-sky-400 font-semibold tabular-nums'
                          }
                        >
                          {w.status} ({w.pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-150 ${
                            w.status === 'WAITING ON GIL'
                              ? 'bg-amber-500'
                              : 'bg-sky-600 dark:bg-sky-400'
                          }`}
                          style={{ width: `${w.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div
                  className={`rounded-xl border p-4 text-xs space-y-1.5 ${
                    simMetrics.lostUpdates > 0
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {simMetrics.lostUpdates > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                        DATA RACE DETECTED — Lost Updates!
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                        THREAD-SAFE — Exact Count Preserved
                      </>
                    )}
                  </div>
                  <div className="font-mono tabular-nums">
                    Expected: {simMetrics.expectedIncrements.toLocaleString()} · Observed:{' '}
                    {simMetrics.observedIncrements.toLocaleString()}
                    {simMetrics.lostUpdates > 0 &&
                      ` (Lost ${simMetrics.lostUpdates.toLocaleString()} writes!)`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Est. Wall Clock</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {simMetrics.wallClockMs} ms
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Throughput</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                      {simMetrics.throughput.toLocaleString()} /s
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Stack / Heap RAM</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {simMetrics.ramMb} MB
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Active Parallelism</div>
                    <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                      {simMetrics.effectiveParallelism}x
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
