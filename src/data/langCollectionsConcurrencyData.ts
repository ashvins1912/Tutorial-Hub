import type { LangTrack } from './languagesTutorialData';

export interface CollectionSpecRow {
  id: string;
  language: LangTrack;
  name: string;
  backingStructure: string;
  lookup: string;
  insertTail: string;
  insertHead: string;
  ordering: string;
  threadSafety: string;
  bestFor: string;
}

export const COLLECTION_MATRIX_ROWS: CollectionSpecRow[] = [
  // Python 3.13+
  {
    id: 'py-list',
    language: 'python',
    name: 'list',
    backingStructure: 'Dynamic C pointer array (~12.5% growth)',
    lookup: 'O(1) by index / O(n) scan',
    insertTail: 'O(1) amortized',
    insertHead: 'O(n) shifts all',
    ordering: 'Insertion order',
    threadSafety: 'Needs Lock for compound ops',
    bestFor: 'Indexed sequences, stacks (append/pop)',
  },
  {
    id: 'py-dict',
    language: 'python',
    name: 'dict',
    backingStructure: 'Compact open-addressed hash table (resize @ 2/3)',
    lookup: 'O(1) avg',
    insertTail: 'O(1) avg',
    insertHead: 'N/A (Keyed)',
    ordering: 'Insertion order (3.7+)',
    threadSafety: 'Needs Lock for read-modify-write',
    bestFor: 'Caches, JSON maps, frequency tables',
  },
  {
    id: 'py-set',
    language: 'python',
    name: 'set / frozenset',
    backingStructure: 'Open-addressed hash table (keys only)',
    lookup: 'O(1) avg',
    insertTail: 'O(1) avg',
    insertHead: 'N/A',
    ordering: 'Unordered',
    threadSafety: 'frozenset is immutable & safe',
    bestFor: 'Deduplication, O(1) membership, set algebra',
  },
  {
    id: 'py-deque',
    language: 'python',
    name: 'collections.deque',
    backingStructure: 'Doubly-linked list of 64-slot C blocks',
    lookup: 'O(1) ends / O(n) mid',
    insertTail: 'O(1)',
    insertHead: 'O(1)',
    ordering: 'Insertion order',
    threadSafety: 'Atomic append/popleft (C-level)',
    bestFor: 'FIFO queues, BFS, bounded sliding windows',
  },
  {
    id: 'py-heapq',
    language: 'python',
    name: 'heapq (min-heap)',
    backingStructure: 'Binary heap stored in-place on list',
    lookup: 'O(1) min peek',
    insertTail: 'O(log n) push/pop',
    insertHead: 'O(log n) pop min',
    ordering: 'Heap partial order',
    threadSafety: 'Use queue.PriorityQueue for threads',
    bestFor: 'Top-K streaming, Dijkstra, task schedulers',
  },
  {
    id: 'py-queue',
    language: 'python',
    name: 'queue.Queue',
    backingStructure: 'deque guarded by Lock + 2 Conditions',
    lookup: 'O(1) FIFO ends',
    insertTail: 'O(1) blocking put',
    insertHead: 'O(1) blocking get',
    ordering: 'FIFO / LIFO / Priority',
    threadSafety: '100% Thread-Safe (Producer-Consumer)',
    bestFor: 'Worker pools, bounded backpressure pipelines',
  },

  // Java 21+
  {
    id: 'java-arraylist',
    language: 'java',
    name: 'ArrayList<E>',
    backingStructure: 'Resizable Object[] array (1.5x growth)',
    lookup: 'O(1) by index',
    insertTail: 'O(1) amortized',
    insertHead: 'O(n) System.arraycopy',
    ordering: 'SequencedCollection (JEP 431)',
    threadSafety: 'Not thread-safe (fail-fast iterator)',
    bestFor: 'Default random-access list in Java',
  },
  {
    id: 'java-hashmap',
    language: 'java',
    name: 'HashMap<K,V>',
    backingStructure: 'Node[] buckets + RB-Treeify @ 8 (0.75 load)',
    lookup: 'O(1) avg / O(log n) worst',
    insertTail: 'O(1) avg',
    insertHead: 'N/A (Keyed)',
    ordering: 'Unordered (LinkedHashMap for order)',
    threadSafety: 'Not thread-safe (corrupts on races)',
    bestFor: 'Single-thread lookups, DTO indexing',
  },
  {
    id: 'java-chm',
    language: 'java',
    name: 'ConcurrentHashMap',
    backingStructure: 'Volatile Node[] + CAS empty + per-bin lock',
    lookup: 'O(1) lock-free read',
    insertTail: 'O(1) per-bin CAS/lock',
    insertHead: 'N/A (Keyed)',
    ordering: 'Unordered (weakly consistent iter)',
    threadSafety: '100% Thread-Safe (use .merge/.compute)',
    bestFor: 'Shared service caches, rate-limit counters',
  },
  {
    id: 'java-treemap',
    language: 'java',
    name: 'TreeMap<K,V>',
    backingStructure: 'Self-balancing Red-Black Tree',
    lookup: 'O(log n)',
    insertTail: 'O(log n)',
    insertHead: 'O(log n)',
    ordering: 'Sorted by Comparable / Comparator',
    threadSafety: 'Use ConcurrentSkipListMap for threads',
    bestFor: 'Range queries (subMap/floorKey), leaderboards',
  },
  {
    id: 'java-arraydeque',
    language: 'java',
    name: 'ArrayDeque<E>',
    backingStructure: 'Power-of-2 circular ring buffer array',
    lookup: 'O(1) both ends',
    insertTail: 'O(1) amortized',
    insertHead: 'O(1) amortized',
    ordering: 'SequencedCollection (FIFO / LIFO)',
    threadSafety: 'Use ConcurrentLinkedDeque for threads',
    bestFor: 'Stacks & queues (replaces Stack & LinkedList)',
  },
  {
    id: 'java-blockingqueue',
    language: 'java',
    name: 'ArrayBlockingQueue',
    backingStructure: 'Fixed-cap circular array + ReentrantLock',
    lookup: 'O(1) head/tail',
    insertTail: 'O(1) blocks if full',
    insertHead: 'O(1) blocks if empty',
    ordering: 'Strict FIFO (optional fair lock)',
    threadSafety: '100% Thread-Safe (Backpressure)',
    bestFor: 'Bounded ThreadPoolExecutor work queues',
  },
];

export type ThreadFsmStateId =
  | 'NEW'
  | 'RUNNABLE'
  | 'RUNNING'
  | 'BLOCKED'
  | 'WAITING'
  | 'TIMED_WAITING'
  | 'TERMINATED';

export interface ThreadFsmNode {
  id: ThreadFsmStateId;
  label: string;
  x: number;
  y: number;
  simpleEnglish: string;
  javaApi: string;
  pythonApi: string;
}

export interface ThreadFsmAction {
  id: string;
  label: string;
  from: ThreadFsmStateId[];
  to: ThreadFsmStateId;
  javaTrigger: string;
  pythonTrigger: string;
  explanation: string;
}

export const THREAD_FSM_NODES: ThreadFsmNode[] = [
  {
    id: 'NEW',
    label: 'NEW',
    x: 75,
    y: 120,
    simpleEnglish: 'The thread object is created in RAM, but the OS scheduler does not know about it yet.',
    javaApi: 'new Thread(runnable) / Thread.ofVirtual().unstarted(r)',
    pythonApi: 't = threading.Thread(target=worker)',
  },
  {
    id: 'RUNNABLE',
    label: 'RUNNABLE',
    x: 225,
    y: 120,
    simpleEnglish: 'Ready in the run queue waiting for an OS CPU core (or carrier thread / GIL turn).',
    javaApi: 'Thread.State.RUNNABLE (queued in OS or ForkJoinPool)',
    pythonApi: 'Ready to acquire GIL (or scheduled on core in 3.13t)',
  },
  {
    id: 'RUNNING',
    label: 'RUNNING',
    x: 385,
    y: 120,
    simpleEnglish: 'Actively executing CPU instructions right now on a hardware core.',
    javaApi: 'JVM treats Running as part of Thread.State.RUNNABLE',
    pythonApi: 'Executing bytecode (holding GIL on standard CPython)',
  },
  {
    id: 'BLOCKED',
    label: 'BLOCKED',
    x: 305,
    y: 38,
    simpleEnglish: 'Paused trying to enter a locked critical section currently held by another thread.',
    javaApi: 'Thread.State.BLOCKED (waiting on synchronized monitor)',
    pythonApi: 'Waiting on threading.Lock.acquire() (releases GIL)',
  },
  {
    id: 'WAITING',
    label: 'WAITING',
    x: 475,
    y: 38,
    simpleEnglish: 'Parked indefinitely until another thread explicitly signals, unlocks, or completes.',
    javaApi: 'Object.wait() · t.join() · LockSupport.park() · ReentrantLock',
    pythonApi: 'cond.wait() · event.wait() · t.join() · queue.get()',
  },
  {
    id: 'TIMED_WAITING',
    label: 'TIMED_WAITING',
    x: 385,
    y: 208,
    simpleEnglish: 'Sleeping or waiting with a deadline timer so it cannot hang forever.',
    javaApi: 'Thread.sleep(ms) · lock.tryLock(ms) · future.get(ms)',
    pythonApi: 'time.sleep(s) · event.wait(timeout) · queue.get(timeout)',
  },
  {
    id: 'TERMINATED',
    label: 'TERMINATED',
    x: 565,
    y: 120,
    simpleEnglish: 'Execution completed (or threw an uncaught error). Resources are reclaimed; cannot restart.',
    javaApi: 'Thread.State.TERMINATED (t.isAlive() == false)',
    pythonApi: 't.is_alive() == False (join() returns immediately)',
  },
];

export const THREAD_FSM_ACTIONS: ThreadFsmAction[] = [
  {
    id: 'start',
    label: 'start()',
    from: ['NEW'],
    to: 'RUNNABLE',
    javaTrigger: 'thread.start()',
    pythonTrigger: 't.start()',
    explanation: 'Registers the thread with the runtime scheduler so it becomes eligible to run on a CPU core.',
  },
  {
    id: 'dispatch',
    label: 'CPU Dispatch / Acquire GIL',
    from: ['RUNNABLE'],
    to: 'RUNNING',
    javaTrigger: 'OS scheduler / ForkJoinPool mounts thread on core',
    pythonTrigger: 'OS schedules thread & acquires GIL (or runs immediately in 3.13t)',
    explanation: 'The thread moves from the ready queue onto an actual hardware CPU core to execute instructions.',
  },
  {
    id: 'yield-preempt',
    label: 'Time Slice / yield()',
    from: ['RUNNING'],
    to: 'RUNNABLE',
    javaTrigger: 'OS preemption or Thread.yield()',
    pythonTrigger: '5ms GIL switch interval expires',
    explanation: 'The thread yields the CPU back to the ready queue so sibling threads stay responsive.',
  },
  {
    id: 'lock-contend',
    label: 'Lock Contention',
    from: ['RUNNING'],
    to: 'BLOCKED',
    javaTrigger: 'Entering busy synchronized(lock) monitor',
    pythonTrigger: 'Blocking inside lock.acquire() while another thread owns it',
    explanation: 'Another thread already owns the mutex; this thread parks off CPU until the lock is released.',
  },
  {
    id: 'lock-acquired',
    label: 'Lock Released -> Ready',
    from: ['BLOCKED'],
    to: 'RUNNABLE',
    javaTrigger: 'Owner exits synchronized block',
    pythonTrigger: 'Owner calls lock.release() / exits with lock:',
    explanation: 'The lock is free; the scheduler moves the waiting thread back to RUNNABLE.',
  },
  {
    id: 'wait-signal',
    label: 'wait() / join() / queue.get()',
    from: ['RUNNING'],
    to: 'WAITING',
    javaTrigger: 'obj.wait() / latch.await() / blockingQueue.take()',
    pythonTrigger: 'cond.wait() / event.wait() / q.get()',
    explanation: 'Thread releases CPU (and monitor/GIL) indefinitely until another thread sends a wakeup signal.',
  },
  {
    id: 'notify-wake',
    label: 'notifyAll() / Event.set()',
    from: ['WAITING'],
    to: 'RUNNABLE',
    javaTrigger: 'obj.notifyAll() / latch.countDown() / LockSupport.unpark()',
    pythonTrigger: 'cond.notify_all() / event.set() / q.put(item)',
    explanation: 'Producer or coordinator signals readiness, moving the parked thread back to RUNNABLE.',
  },
  {
    id: 'sleep-timeout',
    label: 'sleep(ms) / tryLock(timeout)',
    from: ['RUNNING'],
    to: 'TIMED_WAITING',
    javaTrigger: 'Thread.sleep(50) / lock.tryLock(100, MILLISECONDS)',
    pythonTrigger: 'time.sleep(0.05) / q.get(timeout=0.1)',
    explanation: 'Thread pauses for a bounded interval (releasing the GIL in Python, unmounting carrier in Java 21 Virtual Threads).',
  },
  {
    id: 'timer-expire',
    label: 'Timer Expires / I/O Ready',
    from: ['TIMED_WAITING'],
    to: 'RUNNABLE',
    javaTrigger: 'Sleep elapsed or socket poller fires',
    pythonTrigger: 'Timer elapsed or OS I/O syscall returns',
    explanation: 'Timeout completes or I/O arrives, returning the thread to the RUNNABLE queue.',
  },
  {
    id: 'finish',
    label: 'run() Completes -> Exit',
    from: ['RUNNING'],
    to: 'TERMINATED',
    javaTrigger: 'run() returns normally or throws uncaught exception',
    pythonTrigger: 'target function returns; thread joins cleanly',
    explanation: 'Execution ends permanently; any thread blocked in join() is woken up immediately.',
  },
];

export type ConcurrencyRuntimeId =
  | 'py-threads-gil'
  | 'py-threads-313t'
  | 'py-process-pool'
  | 'java-os-pool'
  | 'java-virtual-threads';

export interface ConcurrencyRuntimeSpec {
  id: ConcurrencyRuntimeId;
  language: LangTrack;
  label: string;
  shortLabel: string;
  memoryPerTaskKb: number;
  cpuSpeedupOn8Cores: number;
  ioConcurrencyCap: number;
  gilSerializedCpu: boolean;
  summary: string;
}

export const CONCURRENCY_RUNTIME_SPECS: ConcurrencyRuntimeSpec[] = [
  {
    id: 'py-threads-gil',
    language: 'python',
    label: 'Python 3.13 threading (Standard GIL)',
    shortLabel: 'Py Threads (GIL)',
    memoryPerTaskKb: 1024,
    cpuSpeedupOn8Cores: 1.0,
    ioConcurrencyCap: 150,
    gilSerializedCpu: true,
    summary: 'Great for blocking I/O (releases GIL on sockets/DB), but pure-Python CPU math runs on 1 core at a time.',
  },
  {
    id: 'py-threads-313t',
    language: 'python',
    label: 'Python 3.13t Free-Threaded (No-GIL PEP 703)',
    shortLabel: 'Py 3.13t (No-GIL)',
    memoryPerTaskKb: 1024,
    cpuSpeedupOn8Cores: 6.4,
    ioConcurrencyCap: 200,
    gilSerializedCpu: false,
    summary: 'Experimental PEP 703 build removes the GIL via per-object locks, scaling CPU threads across multiple cores.',
  },
  {
    id: 'py-process-pool',
    language: 'python',
    label: 'Python ProcessPoolExecutor (Multi-Core)',
    shortLabel: 'Py ProcessPool',
    memoryPerTaskKb: 24576,
    cpuSpeedupOn8Cores: 7.2,
    ioConcurrencyCap: 32,
    gilSerializedCpu: false,
    summary: 'Spawns 1 OS process + separate GIL per core. Highest CPU throughput on standard Python, higher RAM & IPC cost.',
  },
  {
    id: 'java-os-pool',
    language: 'java',
    label: 'Java ThreadPoolExecutor (Platform OS Threads)',
    shortLabel: 'Java OS Pool',
    memoryPerTaskKb: 1024,
    cpuSpeedupOn8Cores: 7.6,
    ioConcurrencyCap: 200,
    gilSerializedCpu: false,
    summary: 'True native multi-core execution with C2 JIT. Best for CPU-bound work; I/O concurrency capped by ~1 MB OS thread stacks.',
  },
  {
    id: 'java-virtual-threads',
    language: 'java',
    label: 'Java 21 Virtual Threads (Project Loom JEP 444)',
    shortLabel: 'Java 21 Virtual',
    memoryPerTaskKb: 1.5,
    cpuSpeedupOn8Cores: 7.4,
    ioConcurrencyCap: 100000,
    gilSerializedCpu: false,
    summary: 'Unmounts ~1.5 KB continuations on blocking I/O, letting plain synchronous Java code scale to 100k+ concurrent I/O calls.',
  },
];
