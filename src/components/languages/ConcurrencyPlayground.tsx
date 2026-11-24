import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Code2,
  GripVertical,
  Lock,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { CopyButton, SegmentedTabBar } from '../ui';

type ConcurrencyPatternId = 'producer-consumer' | 'reader-writer' | 'shared-counter';

type BlockKind =
  | 'spawn-threads'
  | 'acquire-lock'
  | 'read-shared'
  | 'mutate-shared'
  | 'queue-put'
  | 'queue-get'
  | 'release-lock'
  | 'io-work';

interface LogicBlockSpec {
  kind: BlockKind;
  label: string;
  category: 'sync' | 'state' | 'queue' | 'control';
  javaSnippet: string;
  pythonSnippet: string;
  shortNote: string;
}

interface PlacedBlock {
  instanceId: string;
  kind: BlockKind;
}

const LOGIC_BLOCK_CATALOG: Record<BlockKind, LogicBlockSpec> = {
  'spawn-threads': {
    kind: 'spawn-threads',
    label: 'Spawn Worker Threads',
    category: 'control',
    javaSnippet: 'ExecutorService pool = Executors.newFixedThreadPool(4);',
    pythonSnippet: 'threads = [threading.Thread(target=worker) for _ in range(4)]',
    shortNote: 'Launches concurrent threads that interleave on shared memory.',
  },
  'acquire-lock': {
    kind: 'acquire-lock',
    label: 'Acquire Lock (synchronized / Lock)',
    category: 'sync',
    javaSnippet: 'lock.lock(); // or synchronized (monitor)',
    pythonSnippet: 'with lock:  # threading.Lock() acquire',
    shortNote: 'Enters mutual exclusion so only one thread modifies shared state.',
  },
  'read-shared': {
    kind: 'read-shared',
    label: 'Read Shared State',
    category: 'state',
    javaSnippet: 'int current = sharedState.read();',
    pythonSnippet: 'current = shared_state["balance"]',
    shortNote: 'Loads shared memory into thread-local register/stack.',
  },
  'mutate-shared': {
    kind: 'mutate-shared',
    label: 'Mutate Shared Memory',
    category: 'state',
    javaSnippet: 'sharedState.write(current + delta);',
    pythonSnippet: 'shared_state["balance"] = current + delta',
    shortNote: 'Non-atomic read-modify-write — causes a race condition if unguarded!',
  },
  'queue-put': {
    kind: 'queue-put',
    label: 'Bounded Queue Put (Producer)',
    category: 'queue',
    javaSnippet: 'queue.put(item); // blocks when full',
    pythonSnippet: 'q.put(item, block=True)  # thread-safe queue.Queue',
    shortNote: 'Thread-safe handoff with built-in condition variable & backpressure.',
  },
  'queue-get': {
    kind: 'queue-get',
    label: 'Bounded Queue Take (Consumer)',
    category: 'queue',
    javaSnippet: 'Item item = queue.take(); // waits until available',
    pythonSnippet: 'item = q.get(block=True); q.task_done()',
    shortNote: 'Atomically dequeues one work item without manual mutex boilerplate.',
  },
  'release-lock': {
    kind: 'release-lock',
    label: 'Release Lock (finally / exit)',
    category: 'sync',
    javaSnippet: '} finally { lock.unlock(); }',
    pythonSnippet: '# automatically released on leaving `with lock:` block',
    shortNote: 'Unlocks monitor even on exception — prevents permanent deadlock.',
  },
  'io-work': {
    kind: 'io-work',
    label: 'Simulate I/O Delay / Yield',
    category: 'control',
    javaSnippet: 'Thread.sleep(15); // widens interleaving window',
    pythonSnippet: 'time.sleep(0.015)  # releases GIL & forces context switch',
    shortNote: 'Forces OS/GIL context switch between read and write to expose races.',
  },
};

interface PatternPreset {
  id: ConcurrencyPatternId;
  title: string;
  subtitle: string;
  safeBlocks: BlockKind[];
  racyBlocks: BlockKind[];
  javaSafeCode: string;
  javaRacyCode: string;
  pythonSafeCode: string;
  pythonRacyCode: string;
}

const PATTERN_PRESETS: Record<ConcurrencyPatternId, PatternPreset> = {
  'producer-consumer': {
    id: 'producer-consumer',
    title: 'Producer-Consumer Pipeline',
    subtitle: 'Coordinate producers and consumers across a bounded buffer without dropped or duplicate items.',
    safeBlocks: ['spawn-threads', 'queue-put', 'io-work', 'queue-get'],
    racyBlocks: ['spawn-threads', 'read-shared', 'io-work', 'mutate-shared'],
    javaSafeCode: `// Java: Thread-safe Bounded BlockingQueue + ReentrantLock internals
BlockingQueue<Order> queue = new ArrayBlockingQueue<>(64);

Runnable producer = () -> {
    try {
        queue.put(new Order("ORD-42")); // blocks if full
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
};

Runnable consumer = () -> {
    try {
        Order order = queue.take();     // waits if empty
        process(order);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
};`,
    javaRacyCode: `// Java ANTI-PATTERN: Unsynchronized ArrayList shared across threads!
List<Order> buffer = new ArrayList<>(); // NOT thread-safe

Runnable producer = () -> buffer.add(new Order("ORD-42")); // Race!
Runnable consumer = () -> {
    if (!buffer.isEmpty()) {            // Check-then-act race window
        Order o = buffer.remove(0);     // IndexOutOfBounds / lost item!
        process(o);
    }
};`,
    pythonSafeCode: `# Python: Thread-safe queue.Queue (wraps Lock + not_empty/not_full Conditions)
import queue, threading

q: queue.Queue[str] = queue.Queue(maxsize=64)

def producer() -> None:
    q.put("ORD-42", block=True)         # blocks cleanly when full

def consumer() -> None:
    order = q.get(block=True)           # releases GIL while waiting
    try:
        process(order)
    finally:
        q.task_done()`,
    pythonRacyCode: `# Python ANTI-PATTERN: Shared list check-then-act without threading.Lock
buffer: list[str] = []

def consumer() -> None:
    if len(buffer) > 0:                 # Context switch right here!
        time.sleep(0.01)                # Another thread pops last item
        order = buffer.pop(0)           # IndexError / corrupted state!
        process(order)`,
  },
  'reader-writer': {
    id: 'reader-writer',
    title: 'Reader-Writer Shared Cache',
    subtitle: 'Allow safe concurrent reads while guaranteeing exclusive access for cache writers.',
    safeBlocks: [
      'spawn-threads',
      'acquire-lock',
      'read-shared',
      'mutate-shared',
      'release-lock',
    ],
    racyBlocks: ['spawn-threads', 'read-shared', 'io-work', 'mutate-shared'],
    javaSafeCode: `// Java: ReentrantReadWriteLock allows N parallel readers OR 1 writer
private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
private final Map<String, String> cache = new HashMap<>();

public String read(String key) {
    rwLock.readLock().lock();
    try {
        return cache.get(key);          // concurrent readers allowed
    } finally {
        rwLock.readLock().unlock();
    }
}

public void write(String key, String val) {
    rwLock.writeLock().lock();          // exclusive writer lock
    try {
        cache.put(key, val);
    } finally {
        rwLock.writeLock().unlock();
    }
}`,
    javaRacyCode: `// Java ANTI-PATTERN: Concurrent HashMap mutation without lock
private final Map<String, String> cache = new HashMap<>();

public void update(String key, String val) {
    String prev = cache.get(key);       // Stale read under concurrent write
    cache.put(key, prev + ":" + val);   // Torn bucket resize / lost update!
}`,
    pythonSafeCode: `# Python: threading.Lock (or custom RWLock via Condition) guards cache
import threading

lock = threading.Lock()
cache: dict[str, str] = {}

def update_cache(key: str, val: str) -> None:
    with lock:                          # Guarantees acquire + finally release
        prev = cache.get(key, "")
        cache[key] = f"{prev}:{val}"`,
    pythonRacyCode: `# Python ANTI-PATTERN: Unprotected read-modify-write across GIL switch
cache: dict[str, str] = {"k": "v0"}

def update_cache(key: str, val: str) -> None:
    prev = cache.get(key, "")           # Thread A reads "v0"
    time.sleep(0.01)                    # GIL drops -> Thread B writes "v0:B"
    cache[key] = f"{prev}:{val}"        # Thread A overwrites with "v0:A"!`,
  },
  'shared-counter': {
    id: 'shared-counter',
    title: 'Bank Ledger / Shared Counter',
    subtitle: 'Prevent lost updates during concurrent read-modify-write balance updates.',
    safeBlocks: [
      'spawn-threads',
      'acquire-lock',
      'read-shared',
      'io-work',
      'mutate-shared',
      'release-lock',
    ],
    racyBlocks: ['spawn-threads', 'read-shared', 'io-work', 'mutate-shared'],
    javaSafeCode: `// Java: synchronized / ReentrantLock critical section
private final ReentrantLock lock = new ReentrantLock();
private int balance = 100;

public void deposit(int amount) {
    lock.lock();
    try {
        int next = balance + amount;    // Atomic critical section
        balance = next;
    } finally {
        lock.unlock();                  // Always unlock in finally!
    }
}`,
    javaRacyCode: `// Java ANTI-PATTERN: Non-atomic read-modify-write without synchronized
private int balance = 100;

public void deposit(int amount) {
    int current = balance;              // T1 & T2 both read 100
    // OS preempts T1 here -> T2 writes 150
    balance = current + amount;         // T1 overwrites with 150 (Lost +50!)
}`,
    pythonSafeCode: `# Python: threading.Lock context manager prevents lost updates
import threading

lock = threading.Lock()
balance = 100

def deposit(amount: int) -> None:
    global balance
    with lock:                          # Acquires mutex before read-modify-write
        current = balance
        balance = current + amount      # Auto-releases on scope exit`,
    pythonRacyCode: `# Python ANTI-PATTERN: GIL does NOT make multi-step updates atomic!
balance = 100

def deposit(amount: int) -> None:
    global balance
    current = balance                   # LOAD_GLOBAL (T1 reads 100)
    time.sleep(0.01)                    # GIL switch -> T2 reads 100, writes 150
    balance = current + amount          # T1 writes 150 -> $50 vanished!`,
  },
};

function makePlacedBlocks(kinds: BlockKind[]): PlacedBlock[] {
  return kinds.map((kind, idx) => ({
    instanceId: `${kind}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
  }));
}

interface SafetyAnalysis {
  status: 'safe' | 'race-condition' | 'deadlock-risk' | 'incomplete';
  headline: string;
  explanation: string;
  expectedFinalValue: number;
  actualFinalValue: number;
  criticalBlockIndices: number[];
}

function analyzePipelineSafety(blocks: PlacedBlock[]): SafetyAnalysis {
  const kinds = blocks.map((b) => b.kind);
  const hasMutate = kinds.includes('mutate-shared');
  const hasQueuePair = kinds.includes('queue-put') && kinds.includes('queue-get');
  const acquireIdx = kinds.indexOf('acquire-lock');
  const releaseIdx = kinds.lastIndexOf('release-lock');
  const mutateIndices = kinds
    .map((k, idx) => (k === 'mutate-shared' ? idx : -1))
    .filter((i) => i >= 0);

  if (blocks.length < 2) {
    return {
      status: 'incomplete',
      headline: 'Add logic blocks to assemble a concurrent flow',
      explanation:
        'Drop at least 2 blocks (or load a pattern preset) to test thread interleaving and race conditions.',
      expectedFinalValue: 200,
      actualFinalValue: 100,
      criticalBlockIndices: [],
    };
  }

  // Lock acquired but never released -> deadlock / lock leak!
  if (acquireIdx !== -1 && (releaseIdx === -1 || releaseIdx < acquireIdx)) {
    return {
      status: 'deadlock-risk',
      headline: 'Deadlock / Lock Leak Detected — Missing Release Lock',
      explanation:
        'Thread A acquires the mutex and never unlocks it. Thread B blocks forever in WAITING/BLOCKED. Drop a "Release Lock" block after your critical section.',
      expectedFinalValue: 200,
      actualFinalValue: 150,
      criticalBlockIndices: [acquireIdx],
    };
  }

  // Check if every shared mutation happens strictly inside [acquireIdx, releaseIdx]
  if (hasMutate) {
    const unprotectedMutates = mutateIndices.filter(
      (idx) => acquireIdx === -1 || idx < acquireIdx || idx > releaseIdx
    );
    if (unprotectedMutates.length > 0) {
      return {
        status: 'race-condition',
        headline: 'RACE CONDITION DETECTED — Unprotected Shared Memory Write!',
        explanation:
          'Thread A and Thread B both read balance=100 concurrently and both write 150, losing +50 (Lost Update). Drag "Acquire Lock" BEFORE reading/mutating and "Release Lock" AFTER.',
        expectedFinalValue: 200,
        actualFinalValue: 150,
        criticalBlockIndices: unprotectedMutates,
      };
    }

    return {
      status: 'safe',
      headline: 'Thread-Safe Critical Section Verified (Mutual Exclusion Active)',
      explanation:
        'All shared mutations execute strictly between Acquire Lock and Release Lock. Thread B queues cleanly until Thread A unlocks—zero lost updates (100 -> 150 -> 200).',
      expectedFinalValue: 200,
      actualFinalValue: 200,
      criticalBlockIndices: [],
    };
  }

  if (hasQueuePair) {
    return {
      status: 'safe',
      headline: 'Thread-Safe Bounded Queue Pattern Verified',
      explanation:
        'Java BlockingQueue and Python queue.Queue encapsulate internal locks and condition variables, eliminating manual mutex races between Producer and Consumer.',
      expectedFinalValue: 200,
      actualFinalValue: 200,
      criticalBlockIndices: [],
    };
  }

  return {
    status: 'safe',
    headline: 'Read-Only / Non-Contended Sequence',
    explanation:
      'Add a "Mutate Shared Memory" block without a lock to trigger an animated race condition, or wrap it with Acquire + Release Lock to verify thread safety.',
    expectedFinalValue: 100,
    actualFinalValue: 100,
    criticalBlockIndices: [],
  };
}

export const ConcurrencyPlayground: React.FC = () => {
  const [patternId, setPatternId] = useState<ConcurrencyPatternId>('producer-consumer');
  const [blocks, setBlocks] = useState<PlacedBlock[]>(() =>
    makePlacedBlocks(PATTERN_PRESETS['producer-consumer'].racyBlocks)
  );
  const [draggedPaletteKind, setDraggedPaletteKind] = useState<BlockKind | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [simStep, setSimStep] = useState<number>(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const preset = PATTERN_PRESETS[patternId];
  const analysis = useMemo(() => analyzePipelineSafety(blocks), [blocks]);

  const totalSteps = Math.max(1, blocks.length + 1);

  useEffect(() => {
    if (!isSimPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setSimStep((prev) => (prev + 1) % totalSteps);
    }, 1150);
    return () => window.clearInterval(timer);
  }, [isSimPlaying, totalSteps, prefersReducedMotion]);

  useEffect(() => {
    setSimStep(0);
  }, [blocks.length, patternId]);

  const loadPreset = (id: ConcurrencyPatternId, variant: 'safe' | 'racy') => {
    setPatternId(id);
    const next = PATTERN_PRESETS[id];
    setBlocks(makePlacedBlocks(variant === 'safe' ? next.safeBlocks : next.racyBlocks));
    setSimStep(0);
    setIsSimPlaying(true);
  };

  const addBlockAt = (kind: BlockKind, index?: number) => {
    const item: PlacedBlock = {
      instanceId: `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      kind,
    };
    setBlocks((prev) => {
      if (typeof index === 'number' && index >= 0 && index <= prev.length) {
        const copy = [...prev];
        copy.splice(index, 0, item);
        return copy;
      }
      return [...prev, item];
    });
  };

  const removeBlock = (instanceId: string) => {
    setBlocks((prev) => prev.filter((b) => b.instanceId !== instanceId));
  };

  const moveBlock = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= blocks.length || fromIdx === toIdx) return;
    setBlocks((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const handleCanvasDrop = (e: React.DragEvent, targetIdx?: number) => {
    e.preventDefault();
    const paletteKind =
      (e.dataTransfer.getData('application/concurrency-block-kind') as BlockKind) ||
      draggedPaletteKind;
    const reorderIdxRaw = e.dataTransfer.getData('application/concurrency-reorder-index');

    if (reorderIdxRaw !== '') {
      const fromIdx = Number(reorderIdxRaw);
      const dest = typeof targetIdx === 'number' ? targetIdx : blocks.length - 1;
      if (!Number.isNaN(fromIdx)) moveBlock(fromIdx, dest);
    } else if (paletteKind && LOGIC_BLOCK_CATALOG[paletteKind]) {
      addBlockAt(paletteKind, targetIdx);
    }

    setDraggedPaletteKind(null);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // Compute animated Thread-A and Thread-B active indices for visual race feedback
  const threadAIdx = blocks.length > 0 ? Math.min(simStep, blocks.length - 1) : -1;
  const threadBIdx = useMemo(() => {
    if (blocks.length === 0) return -1;
    if (analysis.status === 'race-condition') {
      // Both threads collide on the exact same unprotected block!
      return threadAIdx;
    }
    if (analysis.status === 'deadlock-risk') {
      const acq = blocks.findIndex((b) => b.kind === 'acquire-lock');
      return acq >= 0 ? acq : 0;
    }
    // Safe: Thread B trails behind until Thread A exits critical section
    return Math.max(0, threadAIdx - 2);
  }, [blocks, analysis.status, threadAIdx]);

  const isCollisionStep =
    analysis.status === 'race-condition' &&
    threadAIdx >= 0 &&
    analysis.criticalBlockIndices.includes(threadAIdx);

  const showSafeCode = analysis.status === 'safe';

  return (
    <div className="space-y-5">
      {/* Header & Pattern Switcher */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                Drag-and-Drop Concurrency Playground
              </span>
              <span aria-hidden="true">·</span>
              <span>Build Multi-Threaded Patterns &amp; Watch Race Conditions Live</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
              Java synchronized / ReentrantLock vs. Python threading.Lock / Queue Builder
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-6">
              Drag logic blocks (or click +) into the execution pipeline to construct Producer-Consumer, Reader-Writer, or Shared Counter flows. Remove the lock to trigger animated race condition collisions, then restore synchronization to verify safety.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <SegmentedTabBar<ConcurrencyPatternId>
              ariaLabel="Choose multi-threaded concurrency pattern"
              activeTab={patternId}
              onChange={(id) => loadPreset(id, 'racy')}
              size="xs"
              tabs={[
                { id: 'producer-consumer', label: 'Producer-Consumer' },
                { id: 'reader-writer', label: 'Reader-Writer' },
                { id: 'shared-counter', label: 'Shared Counter' },
              ]}
            />
          </div>
        </div>

        {/* Preset Quick-Loaders + Playback */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadPreset(patternId, 'racy')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/35 px-3 py-1.5 font-semibold text-rose-800 dark:text-rose-300 hover:border-rose-500"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Load Racy (Broken) Flow
            </button>
            <button
              type="button"
              onClick={() => loadPreset(patternId, 'safe')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/35 px-3 py-1.5 font-semibold text-emerald-800 dark:text-emerald-300 hover:border-emerald-500"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Load Thread-Safe Flow
            </button>
            <button
              type="button"
              onClick={() => setBlocks([])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:border-slate-400"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Clear Blocks
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSimPlaying((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3 py-1.5 font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500"
          >
            {isSimPlaying ? (
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {isSimPlaying ? 'Pause Thread Trace' : 'Animate Threads'}
          </button>
        </div>
      </section>

      {/* Main Drag-and-Drop Builder + Animated Race Feedback */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 4 cols: Draggable Logic Block Palette */}
        <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Draggable Logic Blocks
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Drag any block onto the pipeline or click + to append.
            </p>
          </div>

          <div className="space-y-2">
            {(Object.values(LOGIC_BLOCK_CATALOG) as LogicBlockSpec[]).map((spec) => (
              <div
                key={spec.kind}
                draggable
                onDragStart={(e) => {
                  setDraggedPaletteKind(spec.kind);
                  e.dataTransfer.setData('application/concurrency-block-kind', spec.kind);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onDragEnd={() => {
                  setDraggedPaletteKind(null);
                  setDropTargetIndex(null);
                }}
                className="group rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5 cursor-grab active:cursor-grabbing hover:border-sky-500 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <GripVertical
                      className="w-3.5 h-3.5 text-slate-400 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {spec.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addBlockAt(spec.kind)}
                    aria-label={`Add ${spec.label}`}
                    className="inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-400 hover:border-sky-500 shrink-0"
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    Add
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-4">
                  {spec.shortNote}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* Right 8 cols: Dropzone Pipeline + Animated Race Condition Status */}
        <div className="xl:col-span-8 space-y-4">
          {/* Live Race Condition & Thread Safety Banner */}
          <div
            className={`rounded-xl border p-4 space-y-2 transition-colors ${
              analysis.status === 'race-condition'
                ? 'border-rose-400 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/35'
                : analysis.status === 'deadlock-risk'
                  ? 'border-amber-400 dark:border-amber-700 bg-amber-50/80 dark:bg-amber-950/35'
                  : analysis.status === 'safe'
                    ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                {analysis.status === 'race-condition' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                ) : analysis.status === 'deadlock-risk' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                )}
                <span>{analysis.headline}</span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                <span className="text-slate-600 dark:text-slate-300">
                  Expected: <strong>{analysis.expectedFinalValue}</strong>
                </span>
                <span
                  className={
                    analysis.actualFinalValue !== analysis.expectedFinalValue
                      ? 'font-bold text-rose-700 dark:text-rose-300'
                      : 'font-bold text-emerald-700 dark:text-emerald-300'
                  }
                >
                  Observed: {analysis.actualFinalValue}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-5">
              {analysis.explanation}
            </p>
          </div>

          {/* Interactive Dropzone Canvas */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = draggedIndex !== null ? 'move' : 'copy';
            }}
            onDrop={(e) => handleCanvasDrop(e)}
            className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-2.5 min-h-[260px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {preset.title} — Assembled Thread Execution Sequence ({blocks.length} blocks)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-sky-700 dark:text-sky-400 font-semibold">
                  ● Thread-A
                </span>
                <span className="text-indigo-700 dark:text-indigo-400 font-semibold">
                  ● Thread-B
                </span>
                {isCollisionStep && (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                    <Zap className="w-3 h-3" aria-hidden="true" />
                    COLLISION!
                  </span>
                )}
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                Drop concurrency blocks here from the left palette or load a preset above.
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block, idx) => {
                  const spec = LOGIC_BLOCK_CATALOG[block.kind];
                  const hasA = threadAIdx === idx;
                  const hasB = threadBIdx === idx;
                  const isRaceHere =
                    analysis.status === 'race-condition' &&
                    analysis.criticalBlockIndices.includes(idx) &&
                    hasA &&
                    hasB;
                  const isDeadlockHere =
                    analysis.status === 'deadlock-risk' &&
                    block.kind === 'acquire-lock' &&
                    hasB;
                  const isDropHover = dropTargetIndex === idx;

                  return (
                    <div
                      key={block.instanceId}
                      draggable
                      onDragStart={(e) => {
                        setDraggedIndex(idx);
                        e.dataTransfer.setData('application/concurrency-reorder-index', String(idx));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDropTargetIndex(idx);
                      }}
                      onDragLeave={() => setDropTargetIndex(null)}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleCanvasDrop(e, idx);
                      }}
                      className={`rounded-lg border p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isRaceHere
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 ring-2 ring-rose-500/40'
                          : isDeadlockHere
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-500/40'
                            : isDropHover
                              ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                              : hasA || hasB
                                ? 'border-sky-400 dark:border-sky-700 bg-sky-50/40 dark:bg-sky-950/25'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <GripVertical
                          className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 cursor-grab"
                          aria-hidden="true"
                        />
                        <span className="font-mono text-xs font-semibold tabular-nums text-slate-400 mt-0.5 w-5 shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {spec.label}
                            </span>
                            {hasA && (
                              <span className="rounded bg-sky-600 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                                T-A
                              </span>
                            )}
                            {hasB && (
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white ${
                                  isRaceHere
                                    ? 'bg-rose-600'
                                    : isDeadlockHere
                                      ? 'bg-amber-600'
                                      : 'bg-indigo-600'
                                }`}
                              >
                                {isRaceHere
                                  ? 'T-B RACE!'
                                  : isDeadlockHere
                                    ? 'T-B STALLED'
                                    : 'T-B'}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 font-mono text-[10.5px]">
                            <div className="text-sky-800 dark:text-sky-300 truncate">
                              Java: {spec.javaSnippet}
                            </div>
                            <div className="text-emerald-800 dark:text-emerald-300 truncate">
                              Python: {spec.pythonSnippet}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, idx - 1)}
                          disabled={idx === 0}
                          aria-label="Move block up"
                          className="rounded border border-slate-200 dark:border-slate-700 p-1 text-slate-600 dark:text-slate-300 hover:border-sky-500 disabled:opacity-35"
                        >
                          <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(idx, idx + 1)}
                          disabled={idx === blocks.length - 1}
                          aria-label="Move block down"
                          className="rounded border border-slate-200 dark:border-slate-700 p-1 text-slate-600 dark:text-slate-300 hover:border-sky-500 disabled:opacity-35"
                        >
                          <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.instanceId)}
                          aria-label="Remove block"
                          className="rounded border border-slate-200 dark:border-slate-700 p-1 text-rose-600 dark:text-rose-400 hover:border-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side-by-Side Java vs. Python Syntax Comparison synced to Pattern + Safety State */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Java · {showSafeCode ? 'synchronized / ReentrantLock / BlockingQueue' : 'Unsynchronized Race Bug'}
            </div>
            <CopyButton
              text={showSafeCode ? preset.javaSafeCode : preset.javaRacyCode}
              label="Copy"
              size="xs"
            />
          </div>
          <pre className="p-4 text-xs font-mono leading-5 bg-slate-950 text-sky-200 overflow-x-auto flex-1">
            {showSafeCode ? preset.javaSafeCode : preset.javaRacyCode}
          </pre>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
              <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              Python · {showSafeCode ? 'threading.Lock / queue.Queue' : 'Unprotected GIL Interleaving Bug'}
            </div>
            <CopyButton
              text={showSafeCode ? preset.pythonSafeCode : preset.pythonRacyCode}
              label="Copy"
              size="xs"
            />
          </div>
          <pre className="p-4 text-xs font-mono leading-5 bg-slate-950 text-emerald-200 overflow-x-auto flex-1">
            {showSafeCode ? preset.pythonSafeCode : preset.pythonRacyCode}
          </pre>
        </div>
      </section>
    </div>
  );
};
