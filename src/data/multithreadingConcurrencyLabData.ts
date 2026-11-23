export type ConcurrencyDifficulty = 'Basics' | 'Intermediate' | 'Advanced';

export type ThreadStateBadge =
  | 'RUNNABLE'
  | 'RUNNING'
  | 'BLOCKED'
  | 'WAITING'
  | 'PARKED_IO'
  | 'GIL_WAIT'
  | 'DEADLOCK'
  | 'DONE';

export interface CoreLaneSlot {
  coreId: string;
  activeThread: string;
  state: ThreadStateBadge;
  taskLabel: string;
  contextSwitch?: boolean;
}

export interface ThreadSnapshotItem {
  threadId: string;
  state: ThreadStateBadge;
  holdingLock?: string;
  waitingFor?: string;
  progressPct: number;
}

export interface ConcurrencyTimelineFrame {
  frameNo: number;
  title: string;
  plainEnglish: string;
  underTheHood: string;
  dataFlowPacket: string;
  cores: CoreLaneSlot[];
  threads: ThreadSnapshotItem[];
  telemetry: {
    contextSwitchesPerSec: number;
    lockContentionPct: number;
    throughputOpsSec: number;
    queueDepth: number;
  };
}

export interface ConcurrencyScenarioSpec {
  id: string;
  number: number;
  level: ConcurrencyDifficulty;
  title: string;
  shortTitle: string;
  subtitle: string;
  formalDefinition: string;
  javaMentalModel: string;
  pythonMentalModel: string;
  javaCode: string;
  pythonCode: string;
  mermaidDfd: string;
  frames: ConcurrencyTimelineFrame[];
  keyTakeaways: string[];
  quickQuiz: {
    question: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
  };
}

export const MULTITHREADING_CONCURRENCY_SCENARIOS: ConcurrencyScenarioSpec[] = [
  {
    id: 'mt-lifecycle-context-switch',
    number: 1,
    level: 'Basics',
    title: 'Thread Lifecycle, OS Preemptive Scheduling & Context Switch Mechanics',
    shortTitle: 'Thread States & Context Switch',
    subtitle:
      'Watch how the OS scheduler time-slices threads across CPU cores, saves CPU registers + stack pointers during a context switch, and transitions threads through NEW → RUNNABLE → RUNNING → WAITING → TERMINATED.',
    formalDefinition:
      'A thread is the smallest unit of OS-scheduled execution sharing process Heap memory while owning a private Call Stack and Program Counter. Preemptive context switching suspends a running thread, flushes/saves its register frame into its Thread Control Block (TCB), and loads the next runnable thread—costing ~1–5 µs plus L1/L2 CPU cache invalidation.',
    javaMentalModel:
      'Java `Thread.State` explicitly exposes 6 states (`NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED`) mapped 1-to-1 to OS threads (for platform threads).',
    pythonMentalModel:
      'Python `threading.Thread` also creates real OS threads managed by the kernel scheduler, plus cooperates with the GIL check interval (`sys.getswitchinterval()`, default 5 ms) on standard CPython.',
    javaCode: `// Java 1+ Core: Thread lifecycle & explicit join()
Thread worker = new Thread(() -> {
    System.out.println("Running on: " + Thread.currentThread().getName());
    try { Thread.sleep(50); } catch (InterruptedException e) {
        Thread.currentThread().interrupt(); // Always restore interrupt flag!
    }
}, "order-worker-1");

worker.start();   // NEW -> RUNNABLE -> RUNNING (never call .run() directly!)
worker.join();    // Caller enters WAITING until worker reaches TERMINATED`,
    pythonCode: `import threading, time

def process_order():
    print(f"Running on: {threading.current_thread().name}")
    time.sleep(0.05)  # Releases GIL while kernel sleeps!

worker = threading.Thread(target=process_order, name="order-worker-1")
worker.start()        # Spawns OS thread -> RUNNABLE
worker.join()         # Caller waits cleanly until worker finishes`,
    mermaidDfd: `flowchart LR
  NEW["NEW (Thread Allocated)"] -->|"start()"| RUNQ["OS Run Queue (RUNNABLE)"]
  RUNQ -->|"Context Switch (Load TCB)"| CPU["CPU Core (RUNNING)"]
  CPU -->|"Quantum Expired (5ms)"| RUNQ
  CPU -->|"sleep() / I/O Wait"| WAIT["WAITING / PARKED_IO"]
  WAIT -->|"Timer / Epoll Ready"| RUNQ
  CPU -->|"Method Returns"| TERM["TERMINATED (Stack Freed)"]`,
    frames: [
      {
        frameNo: 1,
        title: '1. Threads Enter OS Run Queue (RUNNABLE)',
        plainEnglish: 'T1, T2, and T3 are started via `.start()`. They wait in the OS scheduler queue for an open CPU core.',
        underTheHood: 'Kernel allocates each thread’s private stack and TCB; main thread calls `join()` and parks in WAITING.',
        dataFlowPacket: 'start() -> TCB enqueued',
        cores: [
          { coreId: 'Core 0', activeThread: 'T1 (Orders)', state: 'RUNNING', taskLabel: 'Parse Payload' },
          { coreId: 'Core 1', activeThread: 'T2 (Auth)', state: 'RUNNING', taskLabel: 'Verify JWT' },
        ],
        threads: [
          { threadId: 'T1 (Orders)', state: 'RUNNING', progressPct: 25 },
          { threadId: 'T2 (Auth)', state: 'RUNNING', progressPct: 30 },
          { threadId: 'T3 (Billing)', state: 'RUNNABLE', waitingFor: 'CPU Core', progressPct: 0 },
        ],
        telemetry: { contextSwitchesPerSec: 1200, lockContentionPct: 4, throughputOpsSec: 18400, queueDepth: 1 },
      },
      {
        frameNo: 2,
        title: '2. Preemptive Context Switch: T1 -> T3 on Core 0',
        plainEnglish: 'T1 hits a network/sleep I/O wait, so the OS saves T1’s registers and instantly switches Core 0 to T3!',
        underTheHood: 'Context switch saves RIP/RSP registers into T1 TCB, loads T3 TCB (~2.4 µs), and marks T1 PARKED_IO.',
        dataFlowPacket: 'CTX SWITCH: Save T1 -> Load T3',
        cores: [
          { coreId: 'Core 0', activeThread: 'T3 (Billing)', state: 'RUNNING', taskLabel: 'Charge Card', contextSwitch: true },
          { coreId: 'Core 1', activeThread: 'T2 (Auth)', state: 'RUNNING', taskLabel: 'Sign Session' },
        ],
        threads: [
          { threadId: 'T1 (Orders)', state: 'PARKED_IO', waitingFor: 'DB Socket I/O', progressPct: 45 },
          { threadId: 'T2 (Auth)', state: 'RUNNING', progressPct: 75 },
          { threadId: 'T3 (Billing)', state: 'RUNNING', progressPct: 35 },
        ],
        telemetry: { contextSwitchesPerSec: 4850, lockContentionPct: 6, throughputOpsSec: 21200, queueDepth: 0 },
      },
      {
        frameNo: 3,
        title: '3. I/O Completes -> T1 Resumes & Finishes',
        plainEnglish: 'Kernel epoll wakes T1 back into RUNNABLE; T2 completes (TERMINATED) and Core 1 runs T1 to completion.',
        underTheHood: 'NIC interrupt wakes socket waiter; T1 moves PARKED_IO -> RUNNABLE -> RUNNING with zero busy-spinning.',
        dataFlowPacket: 'epoll Wakeup -> T1 Resumes',
        cores: [
          { coreId: 'Core 0', activeThread: 'T3 (Billing)', state: 'RUNNING', taskLabel: 'Write Receipt' },
          { coreId: 'Core 1', activeThread: 'T1 (Orders)', state: 'RUNNING', taskLabel: 'Return 200 OK', contextSwitch: true },
        ],
        threads: [
          { threadId: 'T1 (Orders)', state: 'RUNNING', progressPct: 95 },
          { threadId: 'T2 (Auth)', state: 'DONE', progressPct: 100 },
          { threadId: 'T3 (Billing)', state: 'RUNNING', progressPct: 85 },
        ],
        telemetry: { contextSwitchesPerSec: 2900, lockContentionPct: 2, throughputOpsSec: 24800, queueDepth: 0 },
      },
    ],
    keyTakeaways: [
      'Always call `.start()`—calling `.run()` directly executes synchronously on the current thread!',
      'Too many OS threads (>2–4x CPU cores for CPU work) thrash L1/L2 CPU caches with excessive context switching.',
      'In Java, always restore the interrupt flag (`Thread.currentThread().interrupt()`) if catching `InterruptedException`.',
    ],
    quickQuiz: {
      question: 'Why does creating 5,000 raw OS threads for CPU-bound math actually make a 4-core server SLOWER?',
      options: [
        { id: 'a', text: 'Only 4 threads can truly execute simultaneously; the other 4,996 cause massive OS context-switch overhead, stack RAM exhaustion, and CPU cache thrashing' },
        { id: 'b', text: 'OS threads cannot access Heap memory concurrently' },
        { id: 'c', text: 'CPUs automatically drop clock speed when thread count exceeds 100' },
      ],
      correctId: 'a',
      explanation: 'For CPU-bound tasks, optimal OS thread pool size is close to `num_cpu_cores`. Excess threads waste cycles saving/restoring registers and evicting L1/L2 cache lines.',
    },
  },
  {
    id: 'mt-race-condition-locks',
    number: 2,
    level: 'Basics',
    title: 'Race Conditions, Critical Sections, Mutex Locks & Lock-Free Atomics',
    shortTitle: 'Race Conditions & Locks',
    subtitle:
      'See why `counter += 1` is NOT atomic (Read-Modify-Write = 3 instructions!), how concurrent threads lose updates, and how `ReentrantLock`/`AtomicInteger` (Java) and `with lock:` (Python) enforce mutual exclusion.',
    formalDefinition:
      'A data race occurs when two or more threads access shared mutable state concurrently, at least one access is a write, and no happens-before synchronization (Mutex Lock, Monitor, or hardware CAS Atomic) orders them.',
    javaMentalModel:
      'Use `AtomicLong` (lock-free hardware Compare-And-Swap) for counters, or `synchronized` / `ReentrantLock` with `try/finally unlock()` for multi-field invariants.',
    pythonMentalModel:
      'Even WITH the GIL, `counter += 1` compiles to multiple bytecodes (`LOAD`, `BINARY_OP`, `STORE`)—a thread switch mid-step loses updates! Always wrap shared state in `with lock:`.',
    javaCode: `// Java: Lock-free CAS AtomicLong OR explicit ReentrantLock
AtomicLong safeHits = new AtomicLong(0);
safeHits.incrementAndGet();  // Single hardware LOCK XADD / CAS!

// Multi-field invariant -> ReentrantLock
private final ReentrantLock lock = new ReentrantLock();
public void transfer(long amt) {
    lock.lock();
    try { balance -= amt; ledgerCount++; }
    finally { lock.unlock(); } // Guaranteed release!
}`,
    pythonCode: `import threading

class SafeCounter:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.value = 0

    def increment(self) -> None:
        with self._lock:         # Acquires mutex, guarantees release!
            self.value += 1      # Protected critical section`,
    mermaidDfd: `flowchart LR
  T1["Thread 1: counter += 1"] -->|"Acquire Mutex"| LOCK["Lock / Monitor Guard"]
  T2["Thread 2: counter += 1"] -.->|"BLOCKED (Wait Queue)"| LOCK
  LOCK -->|"Exclusive Owner"| CRIT["Critical Section: Read -> Add -> Write"]
  CRIT -->|"Release + Memory Barrier"| WAKE["Wake Next Waiter (Happens-Before)"]`,
    frames: [
      {
        frameNo: 1,
        title: '1. T1 Acquires Mutex Lock & Enters Critical Section',
        plainEnglish: 'T1 grabs `balance_lock` and reads `balance = 100`. T2 arrives at the same moment and is forced into BLOCKED state.',
        underTheHood: 'Mutex state transitions 0 -> 1 atomically via CPU CAS instruction; T2 parks on the futex wait queue.',
        dataFlowPacket: 'CAS Acquire -> T1 Owns Lock',
        cores: [
          { coreId: 'Core 0', activeThread: 'T1 (Debit)', state: 'RUNNING', taskLabel: 'balance = 100 - 20' },
          { coreId: 'Core 1', activeThread: 'T2 (Debit)', state: 'BLOCKED', taskLabel: 'Waiting on Lock' },
        ],
        threads: [
          { threadId: 'T1 (Debit)', state: 'RUNNING', holdingLock: 'balance_lock', progressPct: 55 },
          { threadId: 'T2 (Debit)', state: 'BLOCKED', waitingFor: 'balance_lock', progressPct: 20 },
          { threadId: 'T3 (Read)', state: 'RUNNING', progressPct: 70 },
        ],
        telemetry: { contextSwitchesPerSec: 3400, lockContentionPct: 42, throughputOpsSec: 16200, queueDepth: 1 },
      },
      {
        frameNo: 2,
        title: '2. T1 Commits & Releases Lock with Memory Barrier',
        plainEnglish: 'T1 writes `balance = 80` and exits `with lock:` / `finally { lock.unlock(); }`, flushing the update so T2 sees 80—never stale 100!',
        underTheHood: 'Release memory fence establishes Happens-Before visibility across CPU core L1 caches and wakes T2.',
        dataFlowPacket: 'Unlock Fence -> Flush 80 to Cache',
        cores: [
          { coreId: 'Core 0', activeThread: 'T1 (Debit)', state: 'DONE', taskLabel: 'Committed: 80' },
          { coreId: 'Core 1', activeThread: 'T2 (Debit)', state: 'RUNNING', taskLabel: 'Acquired Lock (80)', contextSwitch: true },
        ],
        threads: [
          { threadId: 'T1 (Debit)', state: 'DONE', progressPct: 100 },
          { threadId: 'T2 (Debit)', state: 'RUNNING', holdingLock: 'balance_lock', progressPct: 65 },
          { threadId: 'T3 (Read)', state: 'DONE', progressPct: 100 },
        ],
        telemetry: { contextSwitchesPerSec: 2100, lockContentionPct: 18, throughputOpsSec: 22400, queueDepth: 0 },
      },
      {
        frameNo: 3,
        title: '3. T2 Computes Correctly: 80 - 30 = 50 (Zero Lost Updates)',
        plainEnglish: 'Both debits succeeded atomically without clobbering each other. Final balance is guaranteed exact (50).',
        underTheHood: 'For pure numeric counters, replacing Mutex with hardware `AtomicLong` eliminates blocking & cuts contention to <5%.',
        dataFlowPacket: 'Exact Invariant: 100 - 20 - 30 = 50',
        cores: [
          { coreId: 'Core 0', activeThread: 'Idle / Ready', state: 'RUNNABLE', taskLabel: 'Ready for Next' },
          { coreId: 'Core 1', activeThread: 'T2 (Debit)', state: 'DONE', taskLabel: 'Committed: 50' },
        ],
        threads: [
          { threadId: 'T1 (Debit)', state: 'DONE', progressPct: 100 },
          { threadId: 'T2 (Debit)', state: 'DONE', progressPct: 100 },
          { threadId: 'T3 (Read)', state: 'DONE', progressPct: 100 },
        ],
        telemetry: { contextSwitchesPerSec: 900, lockContentionPct: 3, throughputOpsSec: 34000, queueDepth: 0 },
      },
    ],
    keyTakeaways: [
      'Never assume `x += 1` is thread-safe in either Java or Python—always synchronize shared writes!',
      'Keep critical sections tiny (never make HTTP/DB calls while holding a mutex lock!).',
      'Prefer immutable snapshots or `AtomicInteger`/`AtomicLong` over coarse locks whenever possible.',
    ],
    quickQuiz: {
      question: 'Does Python’s GIL make `shared_counter += 1` completely safe across multiple threads without a `threading.Lock()`?',
      options: [
        { id: 'a', text: 'Yes, the GIL makes every line of Python atomic' },
        { id: 'b', text: 'No — `+= 1` executes multiple bytecode steps (load, add, store), and a thread switch can happen between them (and No-GIL 3.13t removes the GIL entirely)' },
        { id: 'c', text: 'Only if the counter is under 256' },
      ],
      correctId: 'b',
      explanation: 'Always guard compound read-modify-write operations on shared Python state with `with lock:` regardless of GIL behavior.',
    },
  },
  {
    id: 'mt-producer-consumer-backpressure',
    number: 3,
    level: 'Intermediate',
    title: 'Producer-Consumer Pattern & Bounded Queue Backpressure',
    shortTitle: 'Producer-Consumer Queues',
    subtitle:
      'Decouple fast producers from slower workers safely using `ArrayBlockingQueue` (Java) and `queue.Queue(maxsize=N)` (Python) so bursts never cause OutOfMemoryError.',
    formalDefinition:
      'A bounded thread-safe FIFO buffer coordinated by two condition variables (`notFull` and `notEmpty`). When full, producers block (backpressure) rather than exhausting heap RAM; when empty, consumers sleep with 0% CPU usage until notified.',
    javaMentalModel:
      '`BlockingQueue<Task>` (`ArrayBlockingQueue` / `LinkedBlockingQueue`) handles locking and condition signaling internally—avoid hand-coding `wait()/notifyAll()`.',
    pythonMentalModel:
      '`queue.Queue(maxsize=64)` wraps a `collections.deque` with a mutex and two `threading.Condition` variables, plus `.task_done()` / `.join()` for clean worker draining.',
    javaCode: `// Java: Bounded ArrayBlockingQueue provides automatic backpressure
BlockingQueue<String> queue = new ArrayBlockingQueue<>(64);

// Producer thread: blocks cleanly if queue hits 64 items
queue.put("event-1042");

// Consumer worker: sleeps with 0% CPU when empty
String job = queue.take();
process(job);`,
    pythonCode: `import queue, threading

q: queue.Queue[str | None] = queue.Queue(maxsize=64)

def worker():
    while (job := q.get()) is not None:  # Poison-pill clean shutdown!
        try:
            process(job)
        finally:
            q.task_done()

threading.Thread(target=worker, daemon=True).start()
q.put("event-1042")  # Blocks automatically when buffer reaches 64`,
    mermaidDfd: `flowchart LR
  P1["Fast Producers (HTTP Ingest)"] -->|"put() / Backpressure if Full"| BQ["Bounded Queue (Max=64)"]
  BQ -->|"take() / notEmpty Signal"| W1["Worker Pool Thread 1"]
  BQ -->|"take() / notEmpty Signal"| W2["Worker Pool Thread 2"]
  W1 -->|"Commit"| DB[("Downstream Storage")]
  W2 -->|"Commit"| DB`,
    frames: [
      {
        frameNo: 1,
        title: '1. Burst Arrives -> Bounded Queue Absorbs Spike',
        plainEnglish: 'Producers push jobs rapidly; the bounded ring buffer queues them safely while 2 consumers drain steadily.',
        underTheHood: 'Internal `notEmpty` condition wakes idle workers; ring buffer indices wrap modulo 64 in O(1).',
        dataFlowPacket: 'Enqueue Batch -> Depth 38/64',
        cores: [
          { coreId: 'Core 0', activeThread: 'Producer-1', state: 'RUNNING', taskLabel: 'queue.put(job)' },
          { coreId: 'Core 1', activeThread: 'Consumer-1', state: 'RUNNING', taskLabel: 'process(job#12)' },
        ],
        threads: [
          { threadId: 'Producer-1', state: 'RUNNING', progressPct: 60 },
          { threadId: 'Consumer-1', state: 'RUNNING', progressPct: 45 },
          { threadId: 'Consumer-2', state: 'RUNNING', progressPct: 50 },
        ],
        telemetry: { contextSwitchesPerSec: 2600, lockContentionPct: 11, throughputOpsSec: 28500, queueDepth: 38 },
      },
      {
        frameNo: 2,
        title: '2. Buffer Hits 64/64 -> Automatic Backpressure Parks Producer',
        plainEnglish: 'The queue is full! Instead of crashing with OOM, `put()` parks Producer-1 until a consumer frees a slot.',
        underTheHood: 'Producer waits on `notFull` Condition; zero busy-looping and heap memory stays strictly bounded.',
        dataFlowPacket: 'FULL (64/64) -> Backpressure Active',
        cores: [
          { coreId: 'Core 0', activeThread: 'Consumer-2', state: 'RUNNING', taskLabel: 'Drain & signal notFull', contextSwitch: true },
          { coreId: 'Core 1', activeThread: 'Consumer-1', state: 'RUNNING', taskLabel: 'Drain & signal notFull' },
        ],
        threads: [
          { threadId: 'Producer-1', state: 'WAITING', waitingFor: 'notFull slot', progressPct: 75 },
          { threadId: 'Consumer-1', state: 'RUNNING', progressPct: 80 },
          { threadId: 'Consumer-2', state: 'RUNNING', progressPct: 78 },
        ],
        telemetry: { contextSwitchesPerSec: 3100, lockContentionPct: 16, throughputOpsSec: 26900, queueDepth: 64 },
      },
      {
        frameNo: 3,
        title: '3. Consumers Drain -> Poison Pill Triggers Graceful Shutdown',
        plainEnglish: 'Queue drains smoothly back to 0; sending a `None` poison pill lets every consumer exit cleanly without losing in-flight jobs.',
        underTheHood: '`q.join()` returns once `unfinished_tasks == 0`; deterministic drain guarantees zero dropped messages.',
        dataFlowPacket: 'Poison Pill -> Graceful Drain 0/64',
        cores: [
          { coreId: 'Core 0', activeThread: 'Consumer-2', state: 'DONE', taskLabel: 'Drained Cleanly' },
          { coreId: 'Core 1', activeThread: 'Consumer-1', state: 'DONE', taskLabel: 'Drained Cleanly' },
        ],
        threads: [
          { threadId: 'Producer-1', state: 'DONE', progressPct: 100 },
          { threadId: 'Consumer-1', state: 'DONE', progressPct: 100 },
          { threadId: 'Consumer-2', state: 'DONE', progressPct: 100 },
        ],
        telemetry: { contextSwitchesPerSec: 800, lockContentionPct: 2, throughputOpsSec: 31000, queueDepth: 0 },
      },
    ],
    keyTakeaways: [
      'NEVER use an unbounded queue in production servers—traffic bursts will exhaust RAM and crash the process.',
      'Use `BlockingQueue` (Java) or `queue.Queue` (Python) instead of manual `wait()`/`notify()` loops.',
      'Use a Poison Pill sentinel (or Executor shutdown) to drain in-flight jobs gracefully during deploys.',
    ],
    quickQuiz: {
      question: 'Why must a production Producer-Consumer queue always have an explicit bounded capacity (`maxsize`)?',
      options: [
        { id: 'a', text: 'Unbounded queues cannot be read by multiple consumer threads' },
        { id: 'b', text: 'A bounded queue applies backpressure when consumers fall behind, preventing unbounded memory growth and OOM crashes' },
        { id: 'c', text: 'Bounded queues skip locking completely' },
      ],
      correctId: 'b',
      explanation: 'Backpressure protects the service: when the buffer fills, upstream producers slow down or return HTTP 429 instead of blowing up server RAM.',
    },
  },
  {
    id: 'mt-deadlock-ordering',
    number: 4,
    level: 'Intermediate',
    title: 'Deadlock Anatomy (4 Coffman Conditions) & Total Lock-Ordering Fix',
    shortTitle: 'Deadlocks & Lock Ordering',
    subtitle:
      'Watch Thread A (holding Lock 1, waiting for Lock 2) and Thread B (holding Lock 2, waiting for Lock 1) freeze forever—then break the cycle cleanly via deterministic Lock ID ordering and `tryLock(timeout)`.',
    formalDefinition:
      'Deadlock occurs when all 4 Coffman conditions hold simultaneously: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption, and (4) Circular Wait. Enforcing a global lock acquisition order (`min(idA, idB)` then `max(idA, idB)`) mathematically eliminates Circular Wait.',
    javaMentalModel:
      'Order locks by unique account ID (`if (a.id < b.id)`), or use `ReentrantLock.tryLock(50, MILLISECONDS)` with randomized jittered retry.',
    pythonMentalModel:
      'Sort locks by `id(lock)` or business key before nesting `with first_lock, second_lock:`—guaranteed deadlock-free across any number of threads.',
    javaCode: `// Deadlock-FREE transfer: Always lock lower Account ID first!
void transfer(Account from, Account to, long amt) {
    Account first  = from.id < to.id ? from : to;
    Account second = from.id < to.id ? to   : from;
    first.lock.lock();
    try {
        second.lock.lock();
        try { from.balance -= amt; to.balance += amt; }
        finally { second.lock.unlock(); }
    } finally { first.lock.unlock(); }
}`,
    pythonCode: `def transfer(from_acc, to_acc, amount: float) -> None:
    # Deterministic lock ordering breaks Circular Wait mathematically!
    first, second = sorted((from_acc, to_acc), key=lambda a: a.account_id)
    with first.lock:
        with second.lock:
            from_acc.balance -= amount
            to_acc.balance += amount`,
    mermaidDfd: `flowchart LR
  TA["Thread A (Acc 10 -> 20)"] -->|"Always Lock min(10,20)"| L10["Lock #10 First"]
  TB["Thread B (Acc 20 -> 10)"] -->|"Also Locks min(10,20)"| L10
  L10 -->|"Winner Proceeds"| L20["Lock #20 Second"]
  L20 -->|"Atomic Commit & Unlock"| OK["Zero Circular Wait"]`,
    frames: [
      {
        frameNo: 1,
        title: '1. The Bug: Unordered Acquisition Triggers Circular Deadlock',
        plainEnglish: 'T1 holds Lock#10 and waits for Lock#20. T2 holds Lock#20 and waits for Lock#10. Throughput drops to 0 ops/sec forever!',
        underTheHood: 'Cycle detected in Wait-For Graph: T1 -> L20 -> T2 -> L10 -> T1. Neither thread can ever progress.',
        dataFlowPacket: 'DEADLOCK CYCLE: 0 ops/sec!',
        cores: [
          { coreId: 'Core 0', activeThread: 'T1 (10->20)', state: 'DEADLOCK', taskLabel: 'Holds L10, Wants L20' },
          { coreId: 'Core 1', activeThread: 'T2 (20->10)', state: 'DEADLOCK', taskLabel: 'Holds L20, Wants L10' },
        ],
        threads: [
          { threadId: 'T1 (10->20)', state: 'DEADLOCK', holdingLock: 'L10', waitingFor: 'L20', progressPct: 40 },
          { threadId: 'T2 (20->10)', state: 'DEADLOCK', holdingLock: 'L20', waitingFor: 'L10', progressPct: 40 },
        ],
        telemetry: { contextSwitchesPerSec: 0, lockContentionPct: 100, throughputOpsSec: 0, queueDepth: 2 },
      },
      {
        frameNo: 2,
        title: '2. The Fix: Total Lock Ordering (`min(id)` First)',
        plainEnglish: 'Now BOTH threads request Lock#10 first! T1 wins Lock#10 and Lock#20 cleanly while T2 waits briefly for Lock#10.',
        underTheHood: 'Wait-For Graph becomes a strict DAG (L10 -> L20); mathematical cycle becomes impossible.',
        dataFlowPacket: 'Ordered Acquire: L10 -> L20',
        cores: [
          { coreId: 'Core 0', activeThread: 'T1 (10->20)', state: 'RUNNING', taskLabel: 'Holds L10 + L20' },
          { coreId: 'Core 1', activeThread: 'T2 (20->10)', state: 'BLOCKED', taskLabel: 'Queued on L10' },
        ],
        threads: [
          { threadId: 'T1 (10->20)', state: 'RUNNING', holdingLock: 'L10 + L20', progressPct: 85 },
          { threadId: 'T2 (20->10)', state: 'BLOCKED', waitingFor: 'L10', progressPct: 25 },
        ],
        telemetry: { contextSwitchesPerSec: 1800, lockContentionPct: 35, throughputOpsSec: 19400, queueDepth: 1 },
      },
      {
        frameNo: 3,
        title: '3. T1 Releases -> T2 Completes Immediately',
        plainEnglish: 'T1 finishes and unlocks L20 then L10. T2 immediately acquires L10 -> L20 and commits its transfer cleanly!',
        underTheHood: 'Liveness restored; `jstack` (Java) or `faulthandler` (Python) can verify zero deadlocked frames.',
        dataFlowPacket: 'Both Transfers Committed Safely',
        cores: [
          { coreId: 'Core 0', activeThread: 'T1 (10->20)', state: 'DONE', taskLabel: 'Transfer Complete' },
          { coreId: 'Core 1', activeThread: 'T2 (20->10)', state: 'DONE', taskLabel: 'Transfer Complete', contextSwitch: true },
        ],
        threads: [
          { threadId: 'T1 (10->20)', state: 'DONE', progressPct: 100 },
          { threadId: 'T2 (20->10)', state: 'DONE', progressPct: 100 },
        ],
        telemetry: { contextSwitchesPerSec: 1100, lockContentionPct: 5, throughputOpsSec: 27800, queueDepth: 0 },
      },
    ],
    keyTakeaways: [
      'Sorting locks by a canonical unique key (e.g., `account_id`) is the simplest, fastest deadlock prevention pattern.',
      'Adding `tryLock(timeout)` acts as a second safety net so threads back off instead of hanging indefinitely.',
      'Diagnose live deadlocks using `jstack <pid>` in Java or `faulthandler.dump_traceback()` in Python.',
    ],
    quickQuiz: {
      question: 'Which Coffman deadlock condition is eliminated when every thread acquires multiple locks in ascending ID order?',
      options: [
        { id: 'a', text: 'Mutual Exclusion' },
        { id: 'b', text: 'Circular Wait' },
        { id: 'c', text: 'CPU Context Switching' },
      ],
      correctId: 'b',
      explanation: 'A strict global ordering turns lock dependencies into a directed acyclic graph (DAG), making circular wait mathematically impossible.',
    },
  },
  {
    id: 'mt-python-gil-vs-nogil-asyncio',
    number: 5,
    level: 'Advanced',
    title: 'Python Concurrency Mastery: GIL Contention vs. asyncio Event Loop vs. ProcessPool / 3.13t No-GIL',
    shortTitle: 'Python GIL, Async & No-GIL',
    subtitle:
      'Compare live CPU-core utilization across standard CPython GIL threads (1 active core at a time), `asyncio.TaskGroup` (10k+ I/O coroutines on 1 core), and `ProcessPoolExecutor` / Free-Threaded `3.13t` (all cores at 100%).',
    formalDefinition:
      'Standard CPython protects reference-count updates with the Global Interpreter Lock (GIL), allowing only 1 thread to execute Python bytecode at any instant (though I/O & C extensions release it). True CPU parallelism uses OS processes (`ProcessPoolExecutor`) or PEP 703 Free-Threaded CPython (`python3.13t`) with biased refcounting and per-object locks.',
    javaMentalModel:
      'The JVM has no GIL (GC uses safepoints/barriers instead of refcount locks), so Java threads natively scale CPU work across all cores.',
    pythonMentalModel:
      'Decision rule: Network/DB I/O -> `asyncio.TaskGroup` (or `ThreadPoolExecutor` for blocking SDKs). Pure-Python CPU math -> `ProcessPoolExecutor`, NumPy/Rust extensions, or Free-Threaded `3.13t`.',
    javaCode: `// Java comparison: True multi-core CPU pool (No GIL)
try (var cpuPool = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors())) {
    List<Future<Long>> jobs = inputs.stream()
        .map(n -> cpuPool.submit(() -> heavyCompute(n)))
        .toList();
}`,
    pythonCode: `import asyncio
from concurrent.futures import ProcessPoolExecutor

# 1. High-concurrency I/O -> asyncio.TaskGroup (1 thread, 10k sockets)
async def fetch_batch(urls: list[str]):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_url(u)) for u in urls]
    return [t.result() for t in tasks]

# 2. Heavy CPU compute -> ProcessPoolExecutor (bypasses GIL across all cores!)
def run_parallel_cpu(items: list[int]) -> list[int]:
    with ProcessPoolExecutor() as pool:
        return list(pool.map(heavy_compute, items))`,
    mermaidDfd: `flowchart LR
  WORK["Python Workload Classifier"] -->|"I/O Bound (HTTP/DB)"| ASYNC["asyncio Event Loop (epoll/kqueue)"]
  WORK -->|"Blocking Sync SDK"| TP["ThreadPoolExecutor (GIL Released on I/O)"]
  WORK -->|"CPU Bound (Math/ML)"| PP["ProcessPoolExecutor / 3.13t No-GIL"]
  PP -->|"True Multi-Core"| CORES["Core 0 + Core 1 + Core 2 + Core 3"]`,
    frames: [
      {
        frameNo: 1,
        title: '1. Standard CPython Threads on CPU Math -> GIL Bottleneck',
        plainEnglish: 'T1 holds the GIL on Core 0 while T2 and T3 sit idle in GIL_WAIT—only 1 core is doing real Python work!',
        underTheHood: 'Threads ping-pong the GIL every 5ms (`sys.getswitchinterval`), adding lock contention with zero multi-core speedup.',
        dataFlowPacket: 'GIL Contention: 1/4 Cores Active',
        cores: [
          { coreId: 'Core 0', activeThread: 'PyThread-1', state: 'RUNNING', taskLabel: 'Holds GIL (Compute)' },
          { coreId: 'Core 1', activeThread: 'PyThread-2', state: 'GIL_WAIT', taskLabel: 'Stalled on GIL' },
          { coreId: 'Core 2', activeThread: 'PyThread-3', state: 'GIL_WAIT', taskLabel: 'Stalled on GIL' },
          { coreId: 'Core 3', activeThread: 'Idle Core', state: 'WAITING', taskLabel: 'Unused Silicon' },
        ],
        threads: [
          { threadId: 'PyThread-1', state: 'RUNNING', holdingLock: 'CPython GIL', progressPct: 45 },
          { threadId: 'PyThread-2', state: 'GIL_WAIT', waitingFor: 'CPython GIL', progressPct: 15 },
          { threadId: 'PyThread-3', state: 'GIL_WAIT', waitingFor: 'CPython GIL', progressPct: 10 },
        ],
        telemetry: { contextSwitchesPerSec: 6400, lockContentionPct: 78, throughputOpsSec: 9200, queueDepth: 2 },
      },
      {
        frameNo: 2,
        title: '2. Network I/O -> asyncio Event Loop Multiplexes 10,000 Sockets',
        plainEnglish: 'For HTTP/DB calls, `await` yields control in microseconds while kernel `epoll` watches thousands of sockets simultaneously!',
        underTheHood: 'Zero OS thread context switches; single-threaded cooperative loop avoids locks and scales to 10k+ connections.',
        dataFlowPacket: 'epoll Ready -> Microsecond Coroutine Switch',
        cores: [
          { coreId: 'Core 0', activeThread: 'Event Loop', state: 'RUNNING', taskLabel: 'Dispatch Coro #412', contextSwitch: true },
          { coreId: 'Core 1', activeThread: 'Kernel epoll', state: 'PARKED_IO', taskLabel: 'Watching 4,200 Sockets' },
        ],
        threads: [
          { threadId: 'Coro-API-1', state: 'RUNNING', progressPct: 80 },
          { threadId: 'Coro-DB-2', state: 'PARKED_IO', waitingFor: 'Postgres Socket', progressPct: 50 },
          { threadId: 'Coro-Redis-3', state: 'RUNNABLE', progressPct: 90 },
        ],
        telemetry: { contextSwitchesPerSec: 320, lockContentionPct: 0, throughputOpsSec: 46500, queueDepth: 12 },
      },
      {
        frameNo: 3,
        title: '3. CPU Parallelism -> ProcessPoolExecutor / 3.13t No-GIL Lights Up All Cores!',
        plainEnglish: 'Each worker gets its own GIL (or runs free-threaded in 3.13t), lighting up all 4 CPU cores simultaneously for ~3.8x speedup!',
        underTheHood: 'PEP 703 biased refcounting + mimalloc thread-safe heaps allow parallel bytecode execution without a global lock.',
        dataFlowPacket: '4/4 Cores Parallel Execution!',
        cores: [
          { coreId: 'Core 0', activeThread: 'Worker-0', state: 'RUNNING', taskLabel: 'Parallel Chunk 0' },
          { coreId: 'Core 1', activeThread: 'Worker-1', state: 'RUNNING', taskLabel: 'Parallel Chunk 1' },
          { coreId: 'Core 2', activeThread: 'Worker-2', state: 'RUNNING', taskLabel: 'Parallel Chunk 2' },
          { coreId: 'Core 3', activeThread: 'Worker-3', state: 'RUNNING', taskLabel: 'Parallel Chunk 3' },
        ],
        threads: [
          { threadId: 'Worker-0', state: 'RUNNING', progressPct: 92 },
          { threadId: 'Worker-1', state: 'RUNNING', progressPct: 89 },
          { threadId: 'Worker-2', state: 'RUNNING', progressPct: 94 },
          { threadId: 'Worker-3', state: 'RUNNING', progressPct: 91 },
        ],
        telemetry: { contextSwitchesPerSec: 650, lockContentionPct: 3, throughputOpsSec: 35800, queueDepth: 0 },
      },
    ],
    keyTakeaways: [
      'Standard Python threads DO speed up blocking I/O (because sockets/files release the GIL), NOT pure-Python CPU loops.',
      'Use `asyncio.TaskGroup` for high-concurrency network services; never call blocking `time.sleep()` inside `async def`!',
      'Use `ProcessPoolExecutor` (or Python 3.13t free-threaded builds) to saturate every CPU core on compute workloads.',
    ],
    quickQuiz: {
      question: 'What happens if you accidentally call blocking `time.sleep(5)` instead of `await asyncio.sleep(5)` inside a Python `async def` handler?',
      options: [
        { id: 'a', text: 'Only that single coroutine pauses while the other 500 coroutines keep running' },
        { id: 'b', text: 'It blocks the entire event-loop OS thread for 5 seconds, freezing ALL concurrent requests!' },
        { id: 'c', text: 'Python automatically converts time.sleep into asyncio.sleep' },
      ],
      correctId: 'b',
      explanation: 'An asyncio event loop runs on one OS thread. Any synchronous blocking call freezes every other coroutine on that loop—always use async libraries or `await asyncio.to_thread(...)`.',
    },
  },
  {
    id: 'mt-java-loom-virtual-threads',
    number: 6,
    level: 'Advanced',
    title: 'Java 21 Project Loom: Virtual Thread Carrier Mounting, Unmounting & Pinning Avoidance',
    shortTitle: 'Java Virtual Threads (Loom)',
    subtitle:
      'Watch thousands of lightweight Java Virtual Threads mount onto a tiny ForkJoinPool of OS Carrier Threads, unmount their continuation stack onto the Heap during DB/HTTP I/O, and avoid `synchronized` carrier pinning!',
    formalDefinition:
      'Java Virtual Threads (JEP 444) implement M:N user-mode scheduling inside the JVM. When a virtual thread blocks on a Loom-aware I/O call or `ReentrantLock`, the JVM copies its compact stack frames to the Heap (unmount), freeing the underlying OS carrier thread in ~200 nanoseconds to run another virtual thread.',
    javaMentalModel:
      'Write simple sequential blocking JDBC/HTTP code, run 1 virtual thread per request (NEVER pool virtual threads!), and replace long I/O `synchronized` blocks with `ReentrantLock` to avoid pinning.',
    pythonMentalModel:
      'Conceptually similar to Python `asyncio` coroutines suspended on the heap—except the JVM handles yielding automatically on standard blocking APIs without requiring `async`/`await` coloring!',
    javaCode: `// Java 21+ LTS: 100k concurrent tasks on a handful of OS carrier threads
private final ReentrantLock ioGuard = new ReentrantLock(); // Avoids pinning!

try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        int reqId = i;
        exec.submit(() -> {
            String data = httpClient.get("/item/" + reqId); // Unmounts carrier!
            ioGuard.lock();
            try { auditLog(data); } finally { ioGuard.unlock(); }
        });
    }
}`,
    pythonCode: `# Closest Python conceptual peer: 10,000 lightweight coroutines via asyncio
sem = asyncio.Semaphore(500)  # Bound downstream DB/HTTP fan-out

async def handle_req(req_id: int):
    async with sem:
        data = await http_client.get(f"/item/{req_id}")  # Yields event loop!
        await audit_log(data)`,
    mermaidDfd: `flowchart LR
  VT["10,000 Virtual Threads (KB Heap Stacks)"] -->|"Mount (~200ns)"| CAR["ForkJoin Carrier Pool (4 OS Threads)"]
  CAR -->|"Blocking HTTP / DB Call"| UNM["Unmount Stack to Heap"]
  UNM -->|"Carrier Immediately Free!"| CAR
  UNM -->|"Socket Ready (epoll)"| RE["Remount on Next Free Carrier"]`,
    frames: [
      {
        frameNo: 1,
        title: '1. Virtual Threads VT-101 & VT-102 Mount on 2 Carrier OS Threads',
        plainEnglish: 'Two lightweight Virtual Threads mount onto Core 0 and Core 1 carrier threads to start handling HTTP requests.',
        underTheHood: 'JVM ForkJoinPool carrier threads execute virtual thread continuations at full JIT native speed.',
        dataFlowPacket: 'Mount VT-101 & VT-102 on Carriers',
        cores: [
          { coreId: 'Carrier 0 (Core 0)', activeThread: 'VT-101', state: 'RUNNING', taskLabel: 'Prepare DB Query' },
          { coreId: 'Carrier 1 (Core 1)', activeThread: 'VT-102', state: 'RUNNING', taskLabel: 'Prepare HTTP Call' },
        ],
        threads: [
          { threadId: 'VT-101', state: 'RUNNING', progressPct: 30 },
          { threadId: 'VT-102', state: 'RUNNING', progressPct: 35 },
          { threadId: 'VT-103', state: 'RUNNABLE', waitingFor: 'Carrier', progressPct: 0 },
          { threadId: 'VT-104', state: 'RUNNABLE', waitingFor: 'Carrier', progressPct: 0 },
        ],
        telemetry: { contextSwitchesPerSec: 1800, lockContentionPct: 2, throughputOpsSec: 42000, queueDepth: 2 },
      },
      {
        frameNo: 2,
        title: '2. Blocking I/O -> VT-101 & VT-102 Unmount; VT-103 & VT-104 Mount Instantly!',
        plainEnglish: 'The instant VT-101 waits on Postgres, the JVM parks its tiny stack on the Heap and immediately runs VT-103 on Carrier 0—zero OS thread wasted!',
        underTheHood: 'User-mode continuation yield costs ~200ns (10x cheaper than OS context switch); Carriers stay 98% productive.',
        dataFlowPacket: 'Unmount VT-101 -> Mount VT-103 (~200ns)',
        cores: [
          { coreId: 'Carrier 0 (Core 0)', activeThread: 'VT-103', state: 'RUNNING', taskLabel: 'Mounted Instantly', contextSwitch: true },
          { coreId: 'Carrier 1 (Core 1)', activeThread: 'VT-104', state: 'RUNNING', taskLabel: 'Mounted Instantly', contextSwitch: true },
        ],
        threads: [
          { threadId: 'VT-101', state: 'PARKED_IO', waitingFor: 'PG Response (Heap)', progressPct: 50 },
          { threadId: 'VT-102', state: 'PARKED_IO', waitingFor: 'HTTP Response (Heap)', progressPct: 55 },
          { threadId: 'VT-103', state: 'RUNNING', progressPct: 45 },
          { threadId: 'VT-104', state: 'RUNNING', progressPct: 40 },
        ],
        telemetry: { contextSwitchesPerSec: 420, lockContentionPct: 1, throughputOpsSec: 88500, queueDepth: 0 },
      },
      {
        frameNo: 3,
        title: '3. Responses Arrive -> VT-101 Remounts on Any Free Carrier & Finishes',
        plainEnglish: 'When Postgres replies, VT-101 remounts on Carrier 1 (it doesn’t even need its original carrier!) and sends 200 OK.',
        underTheHood: 'Always limit downstream DB connections with a `Semaphore`—100k virtual threads can overwhelm a 100-connection DB pool!',
        dataFlowPacket: 'Remount VT-101 -> 88k+ RPS Sustained',
        cores: [
          { coreId: 'Carrier 0 (Core 0)', activeThread: 'VT-102', state: 'DONE', taskLabel: 'Sent 200 OK', contextSwitch: true },
          { coreId: 'Carrier 1 (Core 1)', activeThread: 'VT-101', state: 'DONE', taskLabel: 'Remounted & Done', contextSwitch: true },
        ],
        threads: [
          { threadId: 'VT-101', state: 'DONE', progressPct: 100 },
          { threadId: 'VT-102', state: 'DONE', progressPct: 100 },
          { threadId: 'VT-103', state: 'DONE', progressPct: 100 },
          { threadId: 'VT-104', state: 'DONE', progressPct: 100 },
        ],
        telemetry: { contextSwitchesPerSec: 380, lockContentionPct: 1, throughputOpsSec: 94200, queueDepth: 0 },
      },
    ],
    keyTakeaways: [
      'Never pool Virtual Threads—create a fresh virtual thread per task and use a `Semaphore` to cap downstream DB concurrency.',
      'In Java 21, prefer `ReentrantLock` over `synchronized` around I/O operations to avoid carrier-thread pinning (further improved in Java 24 JEP 491).',
      'Virtual threads shine for I/O-bound concurrency, not CPU-bound math (CPU still scales with physical core count).',
    ],
    quickQuiz: {
      question: 'If you have 50,000 Java 21 Virtual Threads calling a PostgreSQL database that allows at most 100 connections, how should you protect the database?',
      options: [
        { id: 'a', text: 'Put the Virtual Threads inside a fixed-size pool of 100 virtual threads' },
        { id: 'b', text: 'Keep 1 virtual thread per request, and guard the DB call with a `Semaphore(100)` or HikariCP connection pool' },
        { id: 'c', text: 'Wrap every SQL query in a global `synchronized` block' },
      ],
      correctId: 'b',
      explanation: 'Virtual threads are cheap tasks, not scarce resources to pool. Use a `Semaphore` (or bounded connection pool) to enforce downstream backpressure cleanly.',
    },
  },
];
