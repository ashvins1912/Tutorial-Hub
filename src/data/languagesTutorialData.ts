import {
  CORE_FOUNDATION_CONCEPTS,
  CORE_LANGUAGE_VISUAL_FLOWS,
  CORE_PRACTICE_CHALLENGES,
  CORE_QUIZ_QUESTIONS,
} from './javaToPythonThinkingData';

export type LangTrack = 'python' | 'java';
export type SkillLevel = 'Basic' | 'Intermediate' | 'Advanced';

export interface LangDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  kind: 'source' | 'process' | 'runtime' | 'memory' | 'output';
}

export interface LangDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface LangVisualStep {
  stepNumber: number;
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetEdgeId?: string;
  packetLabel?: string;
  metrics: { label: string; value: string }[];
}

export interface LangVisualFlow {
  id: string;
  language: LangTrack;
  level: SkillLevel;
  category: string;
  shortTitle: string;
  title: string;
  tagline: string;
  standardDefinition: string;
  algorithmName: string;
  complexity: string;
  nodes: LangDfdNode[];
  edges: LangDfdEdge[];
  steps: LangVisualStep[];
  asciiDfd: {
    level0: string;
    level1: string;
  };
}

export interface LanguageConcept {
  id: string;
  language: LangTrack;
  versionTag: string;
  level: SkillLevel;
  category: string;
  title: string;
  simpleEnglish: string;
  standardDefinition: string;
  realWorldApplication: string;
  runtimeAndComplexity: string;
  commonTrap: string;
  clearSolution: string;
  codeExample: string;
  relatedFlowId: string;
}

export interface LanguageComparisonPair {
  id: string;
  topic: string;
  level: SkillLevel;
  summary: string;
  pythonCode: string;
  javaCode: string;
  keyTakeaway: string;
}

export interface LanguagePracticeRule {
  id: string;
  label: string;
  hint: string;
  test: (code: string) => boolean;
}

export interface LanguagePracticeChallenge {
  id: string;
  number: number;
  language: LangTrack;
  level: SkillLevel;
  title: string;
  scenario: string;
  goal: string;
  starterCode: string;
  buildingBlocks: { label: string; snippet: string }[];
  rules: LanguagePracticeRule[];
  referenceSolution: string;
  whyItWorks: string;
}

export interface LanguageQuizQuestion {
  id: string;
  language: LangTrack;
  level: SkillLevel;
  topic: string;
  question: string;
  codeSnippet?: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  simpleExplanation: string;
  technicalNote: string;
}

export const LANGUAGE_VISUAL_FLOWS: LangVisualFlow[] = [
  ...CORE_LANGUAGE_VISUAL_FLOWS,
  {
    id: 'py-execution-jit',
    language: 'python',
    level: 'Basic',
    category: 'Python 3.13+ Internals',
    shortTitle: 'CPython 3.13 VM & JIT',
    title: 'Python 3.13+ Execution Pipeline: AST, Bytecode, Adaptive Interpreter & Copy-and-Patch JIT',
    tagline: 'Watch how a .py file is parsed, compiled to bytecode, specialized for hot types, and optionally compiled to native machine code.',
    standardDefinition:
      'CPython compiles Python source code into an Abstract Syntax Tree (AST) and stack-based bytecode (.pyc), then executes it inside a Tier-1 specializing adaptive interpreter (PEP 659) and optional Tier-2 Copy-and-Patch JIT (PEP 744) or Free-Threaded No-GIL build (PEP 703).',
    algorithmName: 'Quickening / Inline Type Specialization + Copy-and-Patch JIT',
    complexity: 'Startup O(n) parse · Hot-loop dispatch O(1) specialized opcodes',
    nodes: [
      { id: 'src', label: 'Source (.py)', sublabel: 'UTF-8 Text', x: 75, y: 120, kind: 'source' },
      { id: 'ast', label: 'PEG Parser', sublabel: 'Builds AST', x: 235, y: 120, kind: 'process' },
      { id: 'bc', label: 'Bytecode (.pyc)', sublabel: 'Stack Opcodes', x: 405, y: 120, kind: 'memory' },
      { id: 'vm', label: 'Adaptive VM', sublabel: 'PEP 659 Tier 1', x: 575, y: 68, kind: 'runtime' },
      { id: 'jit', label: 'Tier-2 JIT', sublabel: 'Native Machine Code', x: 575, y: 185, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'ast', label: 'Tokens' },
      { id: 'e2', from: 'ast', to: 'bc', label: 'Compile' },
      { id: 'e3', from: 'bc', to: 'vm', label: 'Eval Loop' },
      { id: 'e4', from: 'vm', to: 'jit', label: 'Hot Loop' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Lexical Scan & PEG Parsing',
        plainEnglish: 'Python reads your text file and checks grammar rules (indentation, colons, parentheses) to build a structured syntax tree.',
        technicalDetail: 'CPython uses a Packrat PEG parser (PEP 617) to convert tokens into an AST without lookahead ambiguities, raising SyntaxError immediately if grammar fails.',
        activeNodeIds: ['src', 'ast'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'Tokens',
        metrics: [
          { label: 'Parser', value: 'PEG (PEP 617)' },
          { label: 'Error Check', value: 'Compile-time' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Bytecode Compilation (.pyc)',
        plainEnglish: 'The syntax tree is translated into compact instructions (bytecode) cached in __pycache__ so imports load faster next time.',
        technicalDetail: 'The compiler walks the AST and emits stack-machine opcodes (LOAD_FAST, BINARY_OP, CALL) stored in PyCodeObject.',
        activeNodeIds: ['ast', 'bc'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'Bytecode',
        metrics: [
          { label: 'Cache File', value: '__pycache__/*.pyc' },
          { label: 'VM Model', value: 'Stack-Based' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Tier-1 Specializing Adaptive Interpreter',
        plainEnglish: 'As your code runs, Python notices patterns—like adding two integers repeatedly—and swaps slow generic instructions for fast type-specific shortcuts.',
        technicalDetail: 'PEP 659 quickening replaces generic BINARY_OP with BINARY_OP_ADD_INT after profiling a few iterations, cutting dynamic type dispatch overhead dramatically.',
        activeNodeIds: ['bc', 'vm'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'Hot Opcodes',
        metrics: [
          { label: 'Optimization', value: 'PEP 659 Quickening' },
          { label: 'Speedup', value: '15–30% over 3.10' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Tier-2 Copy-and-Patch JIT & Free-Threaded Mode (3.13+)',
        plainEnglish: 'In Python 3.13+, super-hot loops can be stitched into real CPU machine code, and the experimental No-GIL build lets threads run truly in parallel on multiple CPU cores.',
        technicalDetail: 'Hot Tier-1 bytecode traces lower into micro-ops (uops) and patch pre-compiled LLVM machine-code stencils (PEP 744). With --disable-gil (PEP 703), per-object locks replace the Global Interpreter Lock.',
        activeNodeIds: ['vm', 'jit'],
        activeEdgeIds: ['e4'],
        packetEdgeId: 'e4',
        packetLabel: 'uops -> CPU',
        metrics: [
          { label: 'JIT Style', value: 'Copy-and-Patch' },
          { label: 'Parallelism', value: 'PEP 703 No-GIL' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Python Source .py] ---> ( CPython 3.13+ Runtime ) ---> [Process Output / Native Speed]`,
      level1: `[.py File] --(Tokens)--> (1. PEG Parser / AST) --(Compile)--> [Bytecode .pyc]
                                                                    |
  [Native CPU Execution] <--(Copy-and-Patch JIT)-- (2. Adaptive VM Tier-1 / PEP 659)`,
    },
  },
  {
    id: 'py-asyncio-loop',
    language: 'python',
    level: 'Advanced',
    category: 'Python Concurrency',
    shortTitle: 'asyncio Event Loop',
    title: 'Python asyncio Event Loop & Structured TaskGroup Concurrency',
    tagline: 'See how a single OS thread handles 10,000+ concurrent network calls by yielding control at await instead of blocking.',
    standardDefinition:
      'Python asyncio is a single-threaded cooperative multitasking runtime built around an OS I/O selector (epoll/kqueue/IOCP) that suspends coroutines at await boundaries and resumes them when sockets become ready.',
    algorithmName: 'Cooperative Coroutine Scheduling + OS Reactor (epoll/kqueue)',
    complexity: 'O(1) task switch (no OS context switch) · ~1 KB per coroutine',
    nodes: [
      { id: 'tg', label: 'TaskGroup', sublabel: 'Structured Scope', x: 75, y: 120, kind: 'source' },
      { id: 'loop', label: 'Event Loop', sublabel: 'Ready Queue', x: 245, y: 120, kind: 'runtime' },
      { id: 'coro', label: 'Coroutine Frame', sublabel: 'Hits await I/O', x: 425, y: 65, kind: 'process' },
      { id: 'os', label: 'OS Selector', sublabel: 'epoll / kqueue', x: 425, y: 185, kind: 'memory' },
      { id: 'done', label: 'Result Merged', sublabel: 'All Tasks Joined', x: 590, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'tg', to: 'loop', label: 'create_task()' },
      { id: 'e2', from: 'loop', to: 'coro', label: 'Step Task' },
      { id: 'e3', from: 'coro', to: 'os', label: 'await socket' },
      { id: 'e4', from: 'os', to: 'loop', label: 'I/O Ready' },
      { id: 'e5', from: 'loop', to: 'done', label: 'Exit Block' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Schedule Tasks Inside async with TaskGroup()',
        plainEnglish: 'You launch multiple async tasks inside a safety fence (TaskGroup). If one crashes, Python automatically cancels the siblings so nothing leaks.',
        technicalDetail: 'Introduced in Python 3.11+, asyncio.TaskGroup implements Structured Concurrency and bundles sibling failures into an ExceptionGroup handled via except*.',
        activeNodeIds: ['tg', 'loop'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'Tasks',
        metrics: [
          { label: 'Threads Used', value: '1 OS Thread' },
          { label: 'Cancellation', value: 'Automatic on Error' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Run Coroutine Until await',
        plainEnglish: 'The event loop picks the first ready task and runs its Python code at full speed until it hits an await network call.',
        technicalDetail: 'Only one coroutine runs on the CPU at a time—eliminating classic shared-memory race conditions between await points.',
        activeNodeIds: ['loop', 'coro'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'Execute',
        metrics: [
          { label: 'Switch Cost', value: '< 1 microsecond' },
          { label: 'Race Safety', value: 'Atomic between awaits' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Suspend & Hand Socket to OS Reactor',
        plainEnglish: 'Instead of sitting idle waiting for an API response, the task pauses, hands its socket to the OS, and lets other tasks run immediately.',
        technicalDetail: 'The coroutine frame stays on the heap (~1 KB) while its file descriptor is registered with epoll/kqueue for non-blocking readiness notification.',
        activeNodeIds: ['coro', 'os'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'Yield Control',
        metrics: [
          { label: 'CPU Wasted', value: '0% (Non-blocking)' },
          { label: 'Trap to Avoid', value: 'Never call time.sleep()' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. OS Signals Readiness -> Resume & Merge',
        plainEnglish: 'When data arrives from the network, the OS taps the event loop on the shoulder, wakes the paused task, and finishes the TaskGroup.',
        technicalDetail: 'Future.set_result() enqueues the task callback onto the ready deque; exiting the async with block guarantees all child tasks have completed.',
        activeNodeIds: ['os', 'loop', 'done'],
        activeEdgeIds: ['e4', 'e5'],
        packetEdgeId: 'e5',
        packetLabel: 'Resolved',
        metrics: [
          { label: 'Concurrency', value: '10k+ open sockets' },
          { label: 'Ideal Workload', value: 'I/O-bound APIs/DBs' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[10k Network Requests] ---> ( Single-Thread asyncio Event Loop ) ---> [Non-Blocking Responses]`,
      level1: `[TaskGroup] --(create_task)--> (Event Loop Ready Queue) --(Run)--> (Coroutine Frame)
                                         ^                                  |
                                    (I/O Ready)                       (await socket)
                                         |                                  v
                                    [OS epoll / kqueue Selector] <----------+`,
    },
  },
  {
    id: 'py-memory-gc',
    language: 'python',
    level: 'Intermediate',
    category: 'Python Memory Model',
    shortTitle: 'RefCount & Cyclic GC',
    title: 'Python Memory Management: Reference Counting + Generational Cyclic GC',
    tagline: 'In CPython, the reference count of an object reaching zero usually triggers prompt deallocation; this is an implementation detail, not a language-wide timing guarantee. The cyclic garbage collector handles unreachable reference cycles, and collection timing should not be relied on for resource cleanup—use context managers or explicit close methods.',
    standardDefinition:
      'CPython combines deterministic Immediate Reference Counting (ob_refcnt on every PyObject) with a 3-generation tri-color Cyclic Garbage Collector to detect unreachable reference cycles.',
    algorithmName: 'Immediate Reference Counting + Generational Cycle Detection (Gen 0/1/2)',
    complexity: 'RefCount free O(1) immediate · Cyclic sweep O(reachable gen objects)',
    nodes: [
      { id: 'alloc', label: 'PyObject Alloc', sublabel: 'refcnt = 1', x: 80, y: 120, kind: 'source' },
      { id: 'bind', label: 'Variable Refs', sublabel: 'a = b -> refcnt++', x: 245, y: 120, kind: 'process' },
      { id: 'zero', label: 'Zero RefCount', sublabel: 'Instant Free', x: 425, y: 65, kind: 'output' },
      { id: 'cycle', label: 'Cycle Detected', sublabel: 'A <-> B (refcnt=1)', x: 425, y: 185, kind: 'memory' },
      { id: 'gc', label: 'Cyclic GC', sublabel: 'Gen 0 -> 1 -> 2', x: 585, y: 185, kind: 'runtime' },
    ],
    edges: [
      { id: 'e1', from: 'alloc', to: 'bind', label: 'Assign' },
      { id: 'e2', from: 'bind', to: 'zero', label: 'del / scope exit' },
      { id: 'e3', from: 'bind', to: 'cycle', label: 'Circular Ref' },
      { id: 'e4', from: 'cycle', to: 'gc', label: 'Threshold Hit' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Everything Is a Heap PyObject',
        plainEnglish: 'In Python, even integers and functions are objects living on the heap with a sticky note showing how many variables point to them.',
        technicalDetail: 'Every object header carries ob_refcnt and a pointer to its PyTypeObject. Using __slots__ on classes removes per-instance __dict__ overhead by 40–60%.',
        activeNodeIds: ['alloc', 'bind'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'refcnt++',
        metrics: [
          { label: 'Default Attrs', value: 'Per-object __dict__' },
          { label: 'With __slots__', value: '~50% less RAM' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Deterministic Instant Deallocation',
        plainEnglish: 'The exact microsecond the last variable stops pointing to an object, its counter hits zero and Python frees its memory immediately.',
        technicalDetail: 'Unlike pure tracing GCs, reference counting reclaims non-cyclic objects deterministically at function exit without waiting for a GC pause.',
        activeNodeIds: ['bind', 'zero'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'refcnt == 0',
        metrics: [
          { label: 'Latency', value: 'O(1) Immediate' },
          { label: 'Handles', value: '95%+ of objects' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. The Circular Reference Trap (A -> B -> A)',
        plainEnglish: 'If Node A points to Node B and Node B points back to Node A, neither counter ever hits zero—even after your function finishes!',
        technicalDetail: 'Container types (list, dict, custom objects) can form isolated reference islands with ob_refcnt >= 1, which reference counting alone cannot free.',
        activeNodeIds: ['bind', 'cycle'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'A <-> B Leak?',
        metrics: [
          { label: 'RefCount Status', value: 'Stuck at 1' },
          { label: 'Prevention', value: 'weakref.ref()' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Generational Cyclic GC Sweeps Islands',
        plainEnglish: 'Periodically, Python checks young container objects (Generation 0) for closed loops that nobody outside can reach and clears them safely.',
        technicalDetail: 'CPython tracks containers across Generations 0, 1, and 2 (weak generational hypothesis). Subtracting internal references reveals unreachable cycles with effective count 0.',
        activeNodeIds: ['cycle', 'gc'],
        activeEdgeIds: ['e4'],
        packetEdgeId: 'e4',
        packetLabel: 'Reclaim Cycle',
        metrics: [
          { label: 'Generations', value: 'Gen 0 / 1 / 2' },
          { label: '3.13+ Note', value: 'Incremental GC tuned' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Object Creation] ---> ( RefCount + Cyclic GC Engine ) ---> [Reclaimed Heap RAM]`,
      level1: `[PyObject] --> (ob_refcnt == 0?) --YES--> [Immediate O(1) Free]
                        |
                       NO (Circular Island A <-> B)
                        v
                 (Generational Cyclic GC: Gen 0 -> 1 -> 2) --> [Break & Free]`,
    },
  },
  {
    id: 'py-collections-internals',
    language: 'python',
    level: 'Intermediate',
    category: 'Python Collections Internals',
    shortTitle: 'dict, list & deque Memory',
    title: 'Python Collections Lifecycle: Compact Hash Table (dict), Dynamic Array (list) & Block Deque',
    tagline: 'See how Python 3.7+ keeps dicts insertion-ordered using 20% less RAM, why list.append is O(1) amortized, and how deque achieves O(1) head/tail pops.',
    standardDefinition:
      'CPython dict separates a sparse open-addressed hash-index array (`dk_indices`) from a dense insertion-ordered entries array (`dk_entries`), resolving collisions via pseudo-random perturbation probing and resizing at 2/3 load factor.',
    algorithmName: 'Compact Open-Addressing Hash Table + Perturbation Probing + Block-Linked Deque',
    complexity: 'dict/set lookup O(1) avg · list.append O(1) amortized · deque.popleft() O(1)',
    nodes: [
      { id: 'key', label: 'hash(key)', sublabel: '64-bit SipHash', x: 75, y: 120, kind: 'source' },
      { id: 'idx', label: 'Sparse Indices', sublabel: 'mask = size - 1', x: 245, y: 68, kind: 'process' },
      { id: 'ent', label: 'Compact Entries', sublabel: '[hash, key, val]', x: 430, y: 68, kind: 'memory' },
      { id: 'probe', label: 'Perturb Probe', sublabel: 'Open Addressing', x: 245, y: 185, kind: 'runtime' },
      { id: 'resize', label: 'Resize @ 2/3 Load', sublabel: 'Rehash Table 2x', x: 585, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'key', to: 'idx', label: 'h & mask' },
      { id: 'e2', from: 'idx', to: 'ent', label: 'Slot Index' },
      { id: 'e3', from: 'idx', to: 'probe', label: 'Collision' },
      { id: 'e4', from: 'probe', to: 'ent', label: 'Empty Slot' },
      { id: 'e5', from: 'ent', to: 'resize', label: 'Load > 66%' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Hash Key via Randomized SipHash',
        plainEnglish: 'When you write `cache["user_42"] = data`, Python hashes the immutable key into a 64-bit integer and masks the low bits to pick a slot in the sparse index table.',
        technicalDetail: 'CPython randomizes string hashes per process (PYTHONHASHSEED) using SipHash-1-3 to defeat HashDoS collision attacks in web services.',
        activeNodeIds: ['key', 'idx'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'hash & mask',
        metrics: [
          { label: 'Hash Algo', value: 'SipHash-1-3' },
          { label: 'Key Rule', value: 'Must be Hashable' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Sparse Indices -> Compact Entries Array',
        plainEnglish: 'Instead of storing big empty buckets everywhere, Python stores tiny 1-byte/2-byte slot numbers that point into a tightly packed entries list—keeping insertion order for free!',
        technicalDetail: 'Split-table compact dict (PEP 412 / Python 3.6+) stores `(hash, key*, value*)` sequentially in `dk_entries`, preserving insertion order and cutting RAM by 20–25%.',
        activeNodeIds: ['idx', 'ent'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'entry[idx]',
        metrics: [
          { label: 'Order Guarantee', value: 'Insertion Ordered' },
          { label: 'RAM Savings', value: '20–25% Compact' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Collision Resolution via Perturbation Probing',
        plainEnglish: 'If two different keys land on the same index slot, Python jumps to a pseudo-random alternative slot using the upper bits of the hash until it finds the matching key or an empty spot.',
        technicalDetail: 'Open addressing formula `j = ((5 * j) + 1 + perturb) & mask; perturb >>= 5` avoids primary clustering and stays CPU-cache friendly without linked-list pointers.',
        activeNodeIds: ['idx', 'probe', 'ent'],
        activeEdgeIds: ['e3', 'e4'],
        packetEdgeId: 'e3',
        packetLabel: 'perturb >>= 5',
        metrics: [
          { label: 'Strategy', value: 'Open Addressing' },
          { label: 'Cache Locality', value: 'High (No Node Ptrs)' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Dynamic Resize @ 2/3 Load (and Why deque Beats list.pop(0))',
        plainEnglish: 'Once the dict is 2/3 full, Python allocates a larger table and re-indexes keys so lookups stay O(1). For queues, use `collections.deque` (O(1) both ends) instead of `list.pop(0)` (O(n) shift).',
        technicalDetail: '`list` over-allocates by ~12.5% for O(1) amortized `.append()`, while `collections.deque` uses a doubly-linked list of 64-element C blocks for thread-safe O(1) `.appendleft()` / `.popleft()`.',
        activeNodeIds: ['ent', 'resize'],
        activeEdgeIds: ['e5'],
        packetEdgeId: 'e5',
        packetLabel: 'Rehash 2x',
        metrics: [
          { label: 'Dict Resize At', value: '66.7% (2/3) Full' },
          { label: 'deque popleft', value: 'O(1) vs list O(n)' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Key / Element Ops] ---> ( CPython Compact Hash & Block-Deque Engine ) ---> [O(1) Lookup & Ordered State]`,
      level1: `[key] --(SipHash & mask)--> [Sparse dk_indices] --(idx)--> [Compact dk_entries: (h, k, v)]
                                    |                                     |
                              (Collision)                           (Load > 2/3)
                                    v                                     v
                           (Perturbation Probe)                  [Rehash & Grow Table]`,
    },
  },
  {
    id: 'py-multithreading-gil',
    language: 'python',
    level: 'Advanced',
    category: 'Python Multithreading & Lifecycle',
    shortTitle: 'Threads, GIL & Pools',
    title: 'Python Multithreading Lifecycle: OS Threads, GIL Handoff, Lock/Queue & 3.13t Free-Threading',
    tagline: 'Trace a Python thread from start() through GIL acquisition, I/O release, mutex contention, and true multi-core execution in ProcessPoolExecutor or 3.13t.',
    standardDefinition:
      'Standard CPython maps `threading.Thread` 1:1 to OS kernel threads serialized on Python bytecode by the Global Interpreter Lock (GIL, switched every 5ms or released on blocking I/O/C-extensions); Python 3.13t (PEP 703) removes the GIL for multi-core CPU threads.',
    algorithmName: 'OS Preemptive Threading + 5ms GIL Switch Interval / PEP 703 Biased RefCounting',
    complexity: 'I/O threads: concurrent scaling · CPU threads: 1x (GIL) vs N-core (3.13t / ProcessPool)',
    nodes: [
      { id: 'new', label: 'Thread NEW', sublabel: 'Thread(target=fn)', x: 75, y: 120, kind: 'source' },
      { id: 'gil', label: 'GIL / Lock Gate', sublabel: '5ms Switch / Lock', x: 245, y: 120, kind: 'runtime' },
      { id: 'run', label: 'RUNNING Bytecode', sublabel: 'Holds GIL (or 3.13t)', x: 425, y: 65, kind: 'process' },
      { id: 'wait', label: 'BLOCKED / I/O Wait', sublabel: 'Releases GIL!', x: 425, y: 185, kind: 'memory' },
      { id: 'done', label: 'TERMINATED', sublabel: 'join() Returns', x: 590, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'new', to: 'gil', label: 't.start()' },
      { id: 'e2', from: 'gil', to: 'run', label: 'Acquire GIL' },
      { id: 'e3', from: 'run', to: 'wait', label: 'I/O or Lock Wait' },
      { id: 'e4', from: 'wait', to: 'gil', label: 'I/O Ready' },
      { id: 'e5', from: 'run', to: 'done', label: 'Return / Exit' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Thread Creation -> OS Kernel Thread Start',
        plainEnglish: 'Calling `t.start()` asks the operating system to create a real OS thread and place it in the ready queue to compete for CPU execution.',
        technicalDetail: '`threading.Thread.start()` spawns a POSIX pthread / Windows thread. In `ThreadPoolExecutor`, worker threads are pre-spawned and pull work items from a thread-safe queue.',
        activeNodeIds: ['new', 'gil'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'pthread_create',
        metrics: [
          { label: 'Thread Type', value: '1:1 OS Kernel Thread' },
          { label: 'Pool API', value: 'ThreadPoolExecutor' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. GIL Acquisition vs. Python 3.13t Free-Threading',
        plainEnglish: 'On standard Python, only ONE thread holds the GIL microphone to run Python bytecode at a time (switching every 5ms). On Python 3.13t (`--disable-gil`), all threads run bytecode across every core at once!',
        technicalDetail: '`sys.getswitchinterval()` defaults to 0.005s. Even with the GIL, compound operations like `count += 1` (LOAD -> ADD -> STORE) are NOT atomic—always guard shared mutations with `threading.Lock`.',
        activeNodeIds: ['gil', 'run'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'Execute Bytecode',
        metrics: [
          { label: 'GIL Interval', value: '5 ms default' },
          { label: 'Shared State', value: 'Needs Lock / Queue' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Blocking I/O & C-Extensions Release the GIL',
        plainEnglish: 'Whenever a thread waits on a database, HTTP socket, disk file, or NumPy C-math, it politely drops the GIL so other threads run immediately at full speed!',
        technicalDetail: 'C macros `Py_BEGIN_ALLOW_THREADS` / `Py_END_ALLOW_THREADS` release the GIL around blocking syscalls (`recv`, `read`, `sleep`) and C/Rust math kernels (NumPy, PyTorch).',
        activeNodeIds: ['run', 'wait', 'gil'],
        activeEdgeIds: ['e3', 'e4'],
        packetEdgeId: 'e3',
        packetLabel: 'Release GIL',
        metrics: [
          { label: 'I/O Speedup', value: 'High (Multi-thread)' },
          { label: 'Safe Handoff', value: 'queue.Queue (FIFO)' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Clean Shutdown, join() & ProcessPool for CPU Work',
        plainEnglish: 'Once the function returns, the thread terminates and `t.join()` wakes the caller. For heavy pure-Python CPU math on standard Python, use `ProcessPoolExecutor` so each core gets its own interpreter.',
        technicalDetail: '`with ThreadPoolExecutor() as ex:` automatically calls `shutdown(wait=True)` on exit; `ProcessPoolExecutor` bypasses the GIL via separate OS processes.',
        activeNodeIds: ['run', 'done'],
        activeEdgeIds: ['e5'],
        packetEdgeId: 'e5',
        packetLabel: 'join() Done',
        metrics: [
          { label: 'CPU-Bound (GIL)', value: 'ProcessPoolExecutor' },
          { label: 'CPU-Bound (3.13t)', value: 'ThreadPoolExecutor' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Concurrent Tasks] ---> ( Python Thread Lifecycle & GIL/No-GIL Engine ) ---> [Thread-Safe Results]`,
      level1: `[NEW] --(start)--> (RUNNABLE / GIL Gate) --(Acquire)--> (RUNNING Bytecode) --(Exit)--> [TERMINATED]
                              ^                                  |
                         (I/O Ready / Notify)             (I/O / Lock.acquire / sleep)
                              |                                  v
                              +-------------------- [WAITING / BLOCKED (GIL Released)]`,
    },
  },
  {
    id: 'java-jvm-jit-zgc',
    language: 'java',
    level: 'Basic',
    category: 'Java 21+ JVM Internals',
    shortTitle: 'JVM Tiered JIT & ZGC',
    title: 'Java 21+ Execution Engine: javac Bytecode, Tiered C1/C2 JIT & Generational ZGC',
    tagline: 'Trace how Java achieves near-C++ peak throughput and sub-millisecond GC pauses across multi-gigabyte heaps.',
    standardDefinition:
      'Java compiles source code statically into platform-independent JVM bytecode (.class), verifies and loads classes dynamically, then optimizes hot paths via Tiered Compilation (Interpreter -> C1 -> C2 native machine code) backed by Generational ZGC (JEP 439).',
    algorithmName: 'Profile-Guided Tiered JIT (C1/C2) + Colored-Pointer Generational ZGC',
    complexity: 'JIT hot path: Native CPU speed · Gen ZGC pause: < 0.5 ms',
    nodes: [
      { id: 'javac', label: 'javac Compiler', sublabel: 'Static Type Check', x: 75, y: 120, kind: 'source' },
      { id: 'loader', label: 'ClassLoader', sublabel: 'Verify Bytecode', x: 235, y: 120, kind: 'process' },
      { id: 'interp', label: 'Interpreter', sublabel: 'Profile Hotness', x: 405, y: 68, kind: 'runtime' },
      { id: 'jit', label: 'C1 / C2 JIT', sublabel: 'Inlined Native Code', x: 575, y: 68, kind: 'output' },
      { id: 'zgc', label: 'Gen ZGC (JEP 439)', sublabel: '< 0.5ms Pauses', x: 490, y: 185, kind: 'memory' },
    ],
    edges: [
      { id: 'e1', from: 'javac', to: 'loader', label: '.class Bytecode' },
      { id: 'e2', from: 'loader', to: 'interp', label: 'Load & Link' },
      { id: 'e3', from: 'interp', to: 'jit', label: 'Hot Method' },
      { id: 'e4', from: 'jit', to: 'zgc', label: 'Heap Alloc' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Static Compilation with javac',
        plainEnglish: 'Before your app ever starts, Java checks every type, missing switch branch, and method signature—catching bugs before production.',
        technicalDetail: 'javac emits strongly typed .class bytecode files targeting the JVM instruction set, enforcing generics erasure checks and sealed type exhaustiveness at compile time.',
        activeNodeIds: ['javac', 'loader'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: '.class',
        metrics: [
          { label: 'Type Safety', value: 'Compile-time Static' },
          { label: 'Portability', value: 'Write Once, Run Anywhere' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Class Loading & Bytecode Verification',
        plainEnglish: 'The JVM loads classes on demand and verifies that bytecode cannot corrupt memory or bypass access rules.',
        technicalDetail: 'The Bytecode Verifier checks stack heights, type soundness, and control-flow integrity before handing methods to the execution engine.',
        activeNodeIds: ['loader', 'interp'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'Verified',
        metrics: [
          { label: 'Memory Safety', value: 'No raw pointer UB' },
          { label: 'Startup', value: 'Instant Interpret' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Tiered JIT Compilation (C1 -> C2)',
        plainEnglish: 'Methods that run thousands of times get promoted into heavily optimized native machine code—inlining tiny helpers and eliminating temporary objects completely!',
        technicalDetail: 'HotSpot profiles branch frequencies and receiver types, allowing the C2 JIT compiler to perform Escape Analysis (scalar replacement on the stack) and loop vectorization.',
        activeNodeIds: ['interp', 'jit'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'Native x64/ARM',
        metrics: [
          { label: 'Peak Speed', value: 'Near C++ Native' },
          { label: 'Key Trick', value: 'Escape Analysis' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Generational ZGC (Java 21 — JEP 439)',
        plainEnglish: 'Instead of freezing your server for long garbage collection pauses, Generational ZGC cleans short-lived young objects concurrently while your app keeps serving traffic.',
        technicalDetail: 'Enabled with -XX:+UseZGC -XX:+ZGenerational in Java 21 (default in 23+), ZGC uses colored pointers and load barriers to keep STW pauses under 0.5 ms even on 100GB+ heaps.',
        activeNodeIds: ['jit', 'zgc'],
        activeEdgeIds: ['e4'],
        packetEdgeId: 'e4',
        packetLabel: 'Concurrent GC',
        metrics: [
          { label: 'Max GC Pause', value: '< 0.5 ms' },
          { label: 'Heap Scale', value: 'MBs to 16 TB' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Java 21 Source .java] ---> ( javac + HotSpot JVM + Gen ZGC ) ---> [High-Throughput Native Service]`,
      level1: `[.java] --(javac)--> [.class] --> (ClassLoader) --> (Interpreter) --(Hot Profile)--> (C1/C2 JIT Native)
                                                                                              |
                                                      [Sub-ms Heap Reclaim] <--- (Generational ZGC JEP 439)`,
    },
  },
  {
    id: 'java-virtual-threads',
    language: 'java',
    level: 'Advanced',
    category: 'Java 21+ Concurrency',
    shortTitle: 'Virtual Threads (Loom)',
    title: 'Java 21+ Virtual Threads (Project Loom — JEP 444) M:N Carrier Scheduling',
    tagline: 'Write simple blocking synchronous code that scales to 1,000,000+ concurrent requests by unmounting virtual threads off OS carrier threads.',
    standardDefinition:
      'Virtual Threads (JEP 444) are lightweight user-mode threads managed by the JVM and multiplexed (M:N) onto a small ForkJoinPool of OS carrier threads; blocking I/O automatically unmounts the continuation stack to the heap.',
    algorithmName: 'M:N Work-Stealing Carrier Pool + Heap-Allocated Continuations',
    complexity: 'Thread creation O(1) (~1 KB heap) · Scales to 1M+ concurrent tasks',
    nodes: [
      { id: 'vts', label: '1M Virtual Threads', sublabel: '~1 KB Heap Each', x: 80, y: 120, kind: 'source' },
      { id: 'carrier', label: 'Carrier OS Thread', sublabel: 'ForkJoinPool (8 Cores)', x: 265, y: 68, kind: 'runtime' },
      { id: 'heap', label: 'Heap Continuation', sublabel: 'Unmounted on I/O', x: 265, y: 185, kind: 'memory' },
      { id: 'io', label: 'DB / HTTP Socket', sublabel: 'Non-Blocking Poller', x: 455, y: 185, kind: 'process' },
      { id: 'res', label: 'Re-Mount & Finish', sublabel: 'Simple Sync Code', x: 585, y: 68, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'vts', to: 'carrier', label: 'Mount VT' },
      { id: 'e2', from: 'carrier', to: 'heap', label: 'Unmount on Block' },
      { id: 'e3', from: 'heap', to: 'io', label: 'Wait I/O' },
      { id: 'e4', from: 'io', to: 'carrier', label: 'Ready -> Re-mount' },
      { id: 'e5', from: 'carrier', to: 'res', label: 'Complete' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Spawn Lightweight Virtual Threads Per Request',
        plainEnglish: 'Unlike heavy OS threads (~1 MB RAM each, max a few thousand), Java 21 lets you create a brand-new virtual thread for every incoming HTTP request.',
        technicalDetail: 'Executors.newVirtualThreadPerTaskExecutor() starts virtual threads with zero thread pooling required—each costs only a few hundred bytes on the JVM heap.',
        activeNodeIds: ['vts', 'carrier'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'Mount VT #42',
        metrics: [
          { label: 'OS Thread Size', value: '~1 MB stack' },
          { label: 'Virtual Thread', value: '~1 KB heap' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Blocking I/O Triggers Automatic Unmount',
        plainEnglish: 'When VT #42 calls a slow SQL query or HTTP API, the JVM parks VT #42 onto the heap in nanoseconds—freeing the OS core immediately for VT #43!',
        technicalDetail: 'JDK blocking calls (Socket, JDBC, LockSupport) call Continuation.yield(), saving the virtual thread stack frames on the heap so the carrier OS thread never sits idle.',
        activeNodeIds: ['carrier', 'heap', 'io'],
        activeEdgeIds: ['e2', 'e3'],
        packetEdgeId: 'e2',
        packetLabel: 'Save Stack -> Heap',
        metrics: [
          { label: 'Carrier Blocked?', value: 'NO (Runs VT #43)' },
          { label: 'Pinning Trap', value: 'Use ReentrantLock vs synchronized' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Socket Completes -> Re-Mount on Any Free Carrier',
        plainEnglish: 'Once the database replies, the JVM pops VT #42 right back onto an available CPU core and continues on the very next line of code.',
        technicalDetail: 'The OS poller marks the virtual thread runnable and pushes it onto a ForkJoinPool work-stealing queue for immediate re-mounting.',
        activeNodeIds: ['io', 'carrier'],
        activeEdgeIds: ['e4'],
        packetEdgeId: 'e4',
        packetLabel: 'Re-mount VT #42',
        metrics: [
          { label: 'Scheduler', value: 'Work-Stealing FJP' },
          { label: 'Stack Traces', value: '100% Readable' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Sync Simplicity at Reactive Scale',
        plainEnglish: 'You get the massive throughput of reactive frameworks (WebFlux/Netty) without callback spaghetti—normal try/catch and debuggers just work.',
        technicalDetail: 'Pair Virtual Threads with StructuredTaskScope to enforce deadline propagation and automatic sibling cancellation on error.',
        activeNodeIds: ['carrier', 'res'],
        activeEdgeIds: ['e5'],
        packetEdgeId: 'e5',
        packetLabel: 'Response Sent',
        metrics: [
          { label: 'Throughput', value: '100k–1M req/s I/O' },
          { label: 'Rule of Thumb', value: 'Never pool virtual threads' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[1,000,000 Blocking Tasks] ---> ( JVM Virtual Thread Scheduler ) ---> [8 OS Carrier Cores @ 100% Util]`,
      level1: `[Virtual Threads] --(Mount)--> (Carrier OS Thread) --(Normal Run)--> [Complete]
                                      |        ^
                          (Blocking I/O)     (I/O Ready)
                                      v        |
                            [Heap Continuation Stack] <---> [OS Socket Poller]`,
    },
  },
  {
    id: 'java-pattern-matching',
    language: 'java',
    level: 'Intermediate',
    category: 'Java 21+ Modern Type System',
    shortTitle: 'Sealed Records & Switch',
    title: 'Java 21+ Algebraic Data Types: Sealed Interfaces, Record Patterns & Exhaustive Switch',
    tagline: 'Replace brittle instanceof casts and null checks with compiler-verified exhaustive pattern matching (JEP 440 & JEP 441).',
    standardDefinition:
      'Java 21 combines sealed interfaces (closed sum types), record classes (immutable product types), record deconstruction patterns (JEP 440), and exhaustive switch expressions with guarded when clauses (JEP 441).',
    algorithmName: 'Compile-Time Exhaustiveness Checking + InvokeDynamic TypeSwitch Dispatch',
    complexity: 'O(1) type dispatch · Zero missed-case runtime bugs',
    nodes: [
      { id: 'sealed', label: 'sealed interface', sublabel: 'Closed Variant Set', x: 80, y: 120, kind: 'source' },
      { id: 'sw', label: 'switch (event)', sublabel: 'TypeSwitch Dispatch', x: 255, y: 120, kind: 'runtime' },
      { id: 'decon', label: 'Record Pattern', sublabel: 'Unpack Fields', x: 430, y: 68, kind: 'process' },
      { id: 'guard', label: 'when Guard', sublabel: 'Refine Condition', x: 430, y: 185, kind: 'memory' },
      { id: 'out', label: 'Exhaustive Value', sublabel: 'No default Needed', x: 590, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'sealed', to: 'sw', label: 'Permitted Subtype' },
      { id: 'e2', from: 'sw', to: 'decon', label: 'Match Type' },
      { id: 'e3', from: 'decon', to: 'guard', label: 'Check when' },
      { id: 'e4', from: 'guard', to: 'out', label: 'Return Result' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Restrict Subtypes with sealed interface',
        plainEnglish: 'You tell Java the exact list of allowed event types (e.g., CardPayment, UpiPayment, Refund). Nobody can sneak in an unknown subtype later.',
        technicalDetail: 'sealed interface Payment permits Card, Upi, Refund creates a closed Algebraic Data Type (ADT) known completely to javac.',
        activeNodeIds: ['sealed', 'sw'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'Payment',
        metrics: [
          { label: 'Compiler Check', value: 'Exhaustive' },
          { label: 'Null Safety', value: 'case null supported' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Deconstruct Record Fields Inline (JEP 440)',
        plainEnglish: 'Instead of casting and calling getter methods line by line, Java unpacks record fields directly inside the case pattern.',
        technicalDetail: 'case Card(var last4, var amount) matches the type and binds its component accessors automatically in a single expression.',
        activeNodeIds: ['sw', 'decon'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'Card(last4, amt)',
        metrics: [
          { label: 'Boilerplate', value: '-70% vs POJO' },
          { label: 'Immutability', value: 'Built-in final fields' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Refine Matches with Guarded when Clauses',
        plainEnglish: 'Add extra rules right on the case line—like routing payments above $10,000 for fraud review—without nested if/else pyramids.',
        technicalDetail: 'case Card(var last4, var amt) when amt > 10_000 -> ... evaluates the boolean guard only after the record pattern binds successfully.',
        activeNodeIds: ['decon', 'guard'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'when amt > 10k',
        metrics: [
          { label: 'Dispatch', value: 'invokedynamic' },
          { label: 'Readability', value: 'Flat declarative cases' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. Compile-Time Guarantee Without default:',
        plainEnglish: 'If a teammate adds a new CryptoPayment record six months later, your code refuses to compile until every switch handles it!',
        technicalDetail: 'Omitting a catch-all default branch turns missing domain states into immediate compile errors rather than silent production bugs.',
        activeNodeIds: ['guard', 'out'],
        activeEdgeIds: ['e4'],
        packetEdgeId: 'e4',
        packetLabel: 'Verified Return',
        metrics: [
          { label: 'Silent Bugs', value: 'Eliminated at compile' },
          { label: 'JEP Specs', value: 'JEP 440 + JEP 441' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Sealed Domain Event] ---> ( Java 21 Exhaustive Pattern Switch ) ---> [Type-Safe Result]`,
      level1: `[sealed Payment] --> (switch TypeSwitch) --> (Record Deconstruction) --> (when Guard) --> [Value]`,
    },
  },
  {
    id: 'java-collections-hashmap',
    language: 'java',
    level: 'Intermediate',
    category: 'Java Collections Framework',
    shortTitle: 'HashMap & ConcurrentMap',
    title: 'Java Collections Lifecycle: HashMap Buckets, Red-Black Treeification & ConcurrentHashMap CAS',
    tagline: 'Watch how Java HashMap hashes keys, handles collisions, converts long chains into O(log n) Red-Black trees at 8 nodes, and scales thread-safely via CAS.',
    standardDefinition:
      'Java `HashMap` stores entries in a power-of-two `Node<K,V>[]` bucket array (`loadFactor = 0.75`), upgrading colliding linked lists to balanced Red-Black trees when bucket depth reaches `TREEIFY_THRESHOLD = 8` (and table capacity >= 64). `ConcurrentHashMap` locks only the head node of an individual bucket via CAS + fine-grained `synchronized`.',
    algorithmName: 'Bit-Spread Hashing + Chained Buckets -> Red-Black Treeify (8) + Per-Bin CAS Locking',
    complexity: 'Lookup O(1) avg · Worst-case collision O(log n) via RB-Tree · Resize 2x @ 0.75 load',
    nodes: [
      { id: 'hash', label: 'hashCode() Spread', sublabel: 'h ^ (h >>> 16)', x: 75, y: 120, kind: 'source' },
      { id: 'bucket', label: 'Bucket Array [n]', sublabel: '(n - 1) & hash', x: 245, y: 120, kind: 'memory' },
      { id: 'list', label: 'Linked List Bin', sublabel: 'Nodes < 8', x: 425, y: 65, kind: 'process' },
      { id: 'tree', label: 'Red-Black Tree', sublabel: 'Treeify @ >= 8', x: 425, y: 185, kind: 'runtime' },
      { id: 'cas', label: 'CAS / Resize 2x', sublabel: 'Load > 0.75 / CHM', x: 590, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'hash', to: 'bucket', label: 'Bucket Idx' },
      { id: 'e2', from: 'bucket', to: 'list', label: 'Chain Node' },
      { id: 'e3', from: 'list', to: 'tree', label: 'Len >= 8' },
      { id: 'e4', from: 'list', to: 'cas', label: 'Size > 0.75n' },
      { id: 'e5', from: 'tree', to: 'cas', label: 'O(log n) Op' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Hash Bit-Spreading & Fast Power-of-2 Index',
        plainEnglish: 'Java mixes the upper 16 bits of `key.hashCode()` into the lower 16 bits so similar keys spread evenly across buckets, then uses a super-fast bitwise AND to pick the bucket slot.',
        technicalDetail: '`int h = key.hashCode(); int spread = h ^ (h >>> 16); int idx = (n - 1) & spread;` avoids slow modulo division because capacity `n` is always a power of 2 (default 16).',
        activeNodeIds: ['hash', 'bucket'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: '(n-1) & h',
        metrics: [
          { label: 'Default Cap', value: '16 buckets' },
          { label: 'Key Contract', value: 'equals() + hashCode()' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. Empty Slot vs. Collision Chaining',
        plainEnglish: 'If the bucket is empty, the entry drops right in (O(1)). If another key shares that bucket, Java chains them as a tiny linked list and checks `.equals()` on each node.',
        technicalDetail: 'In `ConcurrentHashMap`, inserting into an empty bucket uses a lock-free `VarHandle`/`Unsafe` Compare-And-Swap (CAS) instruction—zero OS lock overhead!',
        activeNodeIds: ['bucket', 'list'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'Bin Node',
        metrics: [
          { label: 'Empty Insert', value: 'O(1) / Lock-Free CAS' },
          { label: 'CHM Reads', value: 'Volatile Lock-Free' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. Treeification Guard: LinkedList -> Red-Black Tree @ 8',
        plainEnglish: 'In Java HashMap, a heavily populated bucket may be treeified (using a red-black tree) when the treeification threshold is reached and the table is large enough; otherwise the map may resize first. Tree bins improve collision handling, but do not claim every bucket with eight keys is immediately treeified or that all lookups are guaranteed O(log n). HashMap lookup is expected O(1) with well-distributed hashes; pathological collisions and key-comparison behavior still matter.',
        technicalDetail: 'When bin count hits `TREEIFY_THRESHOLD = 8` and table size >= `MIN_TREEIFY_CAPACITY = 64`, `treeifyBin()` converts nodes into `TreeNode`; tree bins can improve collision-heavy lookup, but do not state an unconditional O(log n) worst-case guarantee for every key type. A bin may untreeify at the implementation's lower threshold (commonly 6).',
        activeNodeIds: ['list', 'tree'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'Treeify(8)',
        metrics: [
          { label: 'Treeify At', value: '8 nodes (cap >= 64)' },
          { label: 'Worst-Case', value: 'O(log n) Protected' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. 2x Resizing @ 0.75 Load & ConcurrentHashMap Scaling',
        plainEnglish: 'When 75% of buckets fill up, Java doubles the array and cleanly splits every bucket into either its same index (`lo`) or `index + oldCap` (`hi`) without recomputing `hashCode()`.',
        technicalDetail: 'Bit test `(e.hash & oldCap) == 0` splits chains in O(n) total time. Under multi-threading, `ConcurrentHashMap` lets multiple threads help transfer buckets concurrently during resize.',
        activeNodeIds: ['list', 'tree', 'cas'],
        activeEdgeIds: ['e4', 'e5'],
        packetEdgeId: 'e4',
        packetLabel: 'Resize 2x',
        metrics: [
          { label: 'Load Factor', value: '0.75 default' },
          { label: 'Thread-Safe', value: 'ConcurrentHashMap' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[put(K,V) / get(K)] ---> ( Java HashMap / ConcurrentHashMap Engine ) ---> [O(1) Value / Atomic Update]`,
      level1: `[Key] --(h ^ h>>>16)--> [Bucket Table n] --(empty)--> [CAS Insert O(1)]
                                    |
                               (Collision)
                                    v
                            [LinkedList < 8] --(>= 8 & n>=64)--> [Red-Black Tree O(log n)]`,
    },
  },
  {
    id: 'java-thread-lifecycle-concurrency',
    language: 'java',
    level: 'Advanced',
    category: 'Java Multithreading & Lifecycle',
    shortTitle: 'Thread States & Pools',
    title: 'Java Thread Lifecycle (Thread.State FSM), ThreadPoolExecutor Queueing & CompletableFuture',
    tagline: 'Master all 6 official JVM Thread.State transitions (NEW -> RUNNABLE -> BLOCKED / WAITING / TIMED_WAITING -> TERMINATED) and ThreadPoolExecutor sizing.',
    standardDefinition:
      'Every Java `Thread` progresses through 6 canonical `Thread.State` values defined by the JVM (`NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED`). Production workloads submit tasks to bounded `ThreadPoolExecutor` / `ForkJoinPool` executors or compose non-blocking DAGs via `CompletableFuture`.',
    algorithmName: 'JVM 6-State Thread FSM + Bounded Queue-First ThreadPoolExecutor + Async DAG',
    complexity: 'Core Pool -> Queue -> Max Pool -> RejectPolicy · Safe Handoff via Happens-Before',
    nodes: [
      { id: 'new', label: 'NEW', sublabel: 'new Thread()', x: 75, y: 120, kind: 'source' },
      { id: 'run', label: 'RUNNABLE', sublabel: 'Ready / On CPU', x: 245, y: 120, kind: 'runtime' },
      { id: 'blk', label: 'BLOCKED', sublabel: 'Monitor Lock Wait', x: 425, y: 52, kind: 'memory' },
      { id: 'wait', label: 'WAITING / TIMED', sublabel: 'wait/join/sleep/park', x: 425, y: 188, kind: 'process' },
      { id: 'term', label: 'TERMINATED', sublabel: 'run() Finished', x: 590, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'new', to: 'run', label: 'start()' },
      { id: 'e2', from: 'run', to: 'blk', label: 'synchronized wait' },
      { id: 'e3', from: 'blk', to: 'run', label: 'Lock Acquired' },
      { id: 'e4', from: 'run', to: 'wait', label: 'wait / sleep / park' },
      { id: 'e5', from: 'wait', to: 'run', label: 'notify / timeout' },
      { id: 'e6', from: 'run', to: 'term', label: 'Complete / Throw' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. NEW -> RUNNABLE via start() (Never call run() Directly!)',
        plainEnglish: 'Creating `new Thread(task)` only allocates a Java object in state `NEW`. Calling `.start()` registers it with the scheduler as `RUNNABLE` (either queued for CPU or actively executing).',
        technicalDetail: 'Calling `t.run()` directly executes synchronously on the caller thread! Inside `ThreadPoolExecutor`, incoming tasks fill `corePoolSize` first, then enqueue in `BlockingQueue`, and only grow to `maxPoolSize` if the queue is FULL.',
        activeNodeIds: ['new', 'run'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 't.start()',
        metrics: [
          { label: 'JVM State', value: 'NEW -> RUNNABLE' },
          { label: 'Pool Trap', value: 'Queue fills BEFORE maxPool' },
        ],
      },
      {
        stepNumber: 2,
        title: '2. RUNNABLE <-> BLOCKED (Monitor Lock Contention)',
        plainEnglish: 'When Thread B tries to enter a `synchronized` block currently owned by Thread A, Thread B enters `BLOCKED` until Thread A exits the block and releases the monitor lock.',
        technicalDetail: '`BLOCKED` specifically denotes waiting to acquire an intrinsic monitor lock (`monitorenter`). Waiting on a `ReentrantLock` uses `LockSupport.park()`, placing the thread in `WAITING` instead!',
        activeNodeIds: ['run', 'blk'],
        activeEdgeIds: ['e2', 'e3'],
        packetEdgeId: 'e2',
        packetLabel: 'Monitor Contention',
        metrics: [
          { label: 'State Trigger', value: 'synchronized entry' },
          { label: 'Avoid Deadlock', value: 'Consistent lock order' },
        ],
      },
      {
        stepNumber: 3,
        title: '3. RUNNABLE <-> WAITING / TIMED_WAITING (Coordination & Sleep)',
        plainEnglish: 'When a thread pauses for a signal (`Object.wait()`, `LockSupport.park()`, `Future.get()`, `CountDownLatch.await()`) or a timer (`Thread.sleep(ms)`), it yields the CPU cleanly without spinning.',
        technicalDetail: '`wait()` releases the monitor lock and waits for `notifyAll()` (always check the predicate inside a `while` loop to guard against spurious wakeups). `Thread.sleep()` keeps any held locks!',
        activeNodeIds: ['run', 'wait'],
        activeEdgeIds: ['e4', 'e5'],
        packetEdgeId: 'e4',
        packetLabel: 'park() / sleep()',
        metrics: [
          { label: 'wait() Loop', value: 'Always while (!cond)' },
          { label: 'Async Compose', value: 'CompletableFuture' },
        ],
      },
      {
        stepNumber: 4,
        title: '4. RUNNABLE -> TERMINATED & Clean Pool Shutdown',
        plainEnglish: 'Once `run()` finishes normally or throws an uncaught exception, the thread becomes `TERMINATED` permanently and cannot be restarted.',
        technicalDetail: 'Use `try (var pool = Executors.newFixedThreadPool(8))` (Java 19+ `AutoCloseable` `ExecutorService`) or `shutdown()` + `awaitTermination()` so in-flight requests drain gracefully.',
        activeNodeIds: ['run', 'term'],
        activeEdgeIds: ['e6'],
        packetEdgeId: 'e6',
        packetLabel: 'TERMINATED',
        metrics: [
          { label: 'Restartable?', value: 'No (IllegalThreadState)' },
          { label: 'Java 21 Drain', value: 'try-with-resources Pool' },
        ],
      },
    ],
    asciiDfd: {
      level0: `[Submitted Runnables / Callables] ---> ( JVM Thread FSM & ExecutorService ) ---> [Completed Futures]`,
      level1: `[NEW] --(start)--> [RUNNABLE] --(synchronized lock busy)--> [BLOCKED] --(lock free)--> [RUNNABLE]
                             |  ^                                                             |
            (wait/park/sleep)|  |(notifyAll/unpark/timeout)                            (run() exits)
                             v  |                                                             v
                   [WAITING / TIMED_WAITING]                                           [TERMINATED]`,
    },
  },
];

export const LANGUAGE_CONCEPTS: LanguageConcept[] = [
  ...CORE_FOUNDATION_CONCEPTS,
  // PYTHON 3.13+ (BASIC -> ADVANCED)
  {
    id: 'py-basics-collections',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Basic',
    category: 'Core Foundations',
    title: 'Variables, Mutability & Built-In Collections (list, dict, set, tuple)',
    simpleEnglish:
      'Think of Python variables as name tags attached to objects in memory. Lists and dicts can be changed in place (mutable), while strings, numbers, and tuples cannot be changed once created (immutable).',
    standardDefinition:
      'Python is dynamically and strongly typed with pass-by-object-reference semantics. list is a dynamic pointer array, dict/set are compact open-addressed hash tables (insertion-ordered since 3.7), and tuple is an immutable fixed-size sequence.',
    realWorldApplication:
      'Use dict/set for O(1) caching, deduplication, and frequency counting in API handlers; use tuple for safe dictionary keys and fixed coordinate records.',
    runtimeAndComplexity: 'list.append O(1) amortized · dict/set lookup O(1) average · list membership `x in list` O(n)',
    commonTrap: 'Using a mutable default argument like `def add_item(x, items=[]):` — every call shares the exact same list instance!',
    clearSolution: 'Always default mutable parameters to `None` and initialize inside the function (`items = [] if items is None else items`).',
    codeExample: `def add_tag(tag: str, tags: list[str] | None = None) -> list[str]:
    result = [] if tags is None else list(tags)
    seen = set(result)  # O(1) membership check
    if tag not in seen:
        result.append(tag)
    return result

scores: dict[str, int] = {"alice": 95, "bob": 88}
print(scores.get("charlie", 0))  # Safe lookup -> 0`,
    relatedFlowId: 'py-execution-jit',
  },
  {
    id: 'py-comprehensions-match',
    language: 'python',
    versionTag: 'Python 3.10–3.13+',
    level: 'Basic',
    category: 'Control Flow & Expressiveness',
    title: 'Comprehensions & Structural Pattern Matching (match / case)',
    simpleEnglish:
      'Comprehensions let you filter and transform lists or dicts in one readable line. Structural pattern matching (match/case) unpacks the shape of JSON dicts or tuples cleanly without messy nested if/elif chains.',
    standardDefinition:
      'List/dict/set comprehensions execute in optimized C-level bytecode loops. Structural Pattern Matching (PEP 634) matches object structure, types, sequence lengths, and mapping keys with optional `if` guard clauses.',
    realWorldApplication:
      'Parsing webhook payloads, routing CLI/API commands, and transforming raw database rows into clean API response DTOs.',
    runtimeAndComplexity: 'Comprehension O(n) (faster than manual `.append()` loop due to LIST_APPEND opcode) · match/case O(cases)',
    commonTrap: 'Writing `case HTTP_OK:` expecting it to compare against a variable — a bare name captures any value! Use dotted constants (`Status.OK`) or literals.',
    clearSolution: 'Match against literals, Enum members (`Status.OK`), or mapping shapes (`{"type": "refund", "amount": amt}`), and keep comprehensions under 2 levels.',
    codeExample: `def route_event(event: dict[str, object]) -> str:
    match event:
        case {"type": "order", "amount": float(amt) | int(amt)} if amt >= 500:
            return f"VIP order flagged: \${amt}"
        case {"type": "order", "amount": amt}:
            return f"Standard order: \${amt}"
        case {"type": "cancel", "reason": str(reason)}:
            return f"Cancelled: {reason}"
        case _:
            return "Ignored event"

paid_totals = [amt for amt in (120, 45, 850) if amt >= 100]`,
    relatedFlowId: 'py-execution-jit',
  },
  {
    id: 'py-generators-decorators',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Intermediate',
    category: 'Idiomatic Python',
    title: 'Generators (yield), Decorators & Context Managers (with)',
    simpleEnglish:
      'Generators produce one item at a time instead of loading a giant 10 GB file into RAM. Decorators wrap functions to add logging or retries cleanly, and `with` blocks guarantee files or DB connections always close.',
    standardDefinition:
      'Generator functions return lazy Iterator state machines suspended at each `yield`. Decorators are higher-order callables (`@wraps`) transforming function objects. Context managers implement `__enter__`/`__exit__` for deterministic cleanup.',
    realWorldApplication:
      'Streaming multi-gigabyte CSV/log ETL pipelines with O(1) memory, database transaction scopes, and reusable `@retry` / `@timed` service decorators.',
    runtimeAndComplexity: 'Generator space: O(1) vs. O(n) for full list · Context cleanup guaranteed even on exceptions',
    commonTrap: 'Iterating over a generator twice (the second pass is silently empty!) or forgetting `@functools.wraps(fn)` in a decorator, which erases function metadata.',
    clearSolution: 'Use generators for single-pass streaming pipelines, convert to `tuple`/`list` if re-iteration is needed, and always decorate wrappers with `@functools.wraps`.',
    codeExample: `from collections.abc import Iterator
from functools import wraps
import time

def stream_errors(lines: Iterator[str]) -> Iterator[str]:
    for line in lines:
        if "ERROR" in line:
            yield line.strip()  # O(1) RAM streaming

def timed(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            ms = (time.perf_counter() - start) * 1000
            print(f"{fn.__name__} took {ms:.2f}ms")
    return wrapper`,
    relatedFlowId: 'py-memory-gc',
  },
  {
    id: 'py-modern-typing-dataclass',
    language: 'python',
    versionTag: 'Python 3.12–3.13+',
    level: 'Intermediate',
    category: 'Modern Type System',
    title: 'PEP 695 Generics, @dataclass(slots=True, frozen=True) & Protocol',
    simpleEnglish:
      'Modern Python lets you write clean, self-documenting types (`list[str] | None`, `def first[T](items: list[T])`) and compact immutable data models that use half the RAM of regular classes.',
    standardDefinition:
      'PEP 695 introduces concise type-parameter syntax (`type Alias[T] = ...`, `def fn[T]`). `@dataclass(frozen=True, slots=True)` generates `__init__`, `__eq__`, hashability, and fixed C-struct slot layouts. `typing.Protocol` enables structural subtyping (static duck typing).',
    realWorldApplication:
      'Building domain models in FastAPI/Pydantic services, eliminating `AttributeError`/`NoneType` bugs via mypy/pyright in CI, and slashing memory footprint in data-heavy workers.',
    runtimeAndComplexity: '`slots=True` eliminates per-instance `__dict__` (~40–55% memory reduction & ~15% faster attribute access)',
    commonTrap: 'Using legacy `typing.List`, `typing.Optional`, and `TypeVar` boilerplate in Python 3.12+, or mutating un-frozen dataclasses stored as dict keys.',
    clearSolution: 'Prefer built-in generics (`dict[str, int]`), union operator (`X | None`), PEP 695 `[T]`, and `@dataclass(frozen=True, slots=True)` for value objects.',
    codeExample: `from dataclasses import dataclass
from typing import Protocol

type UserId = int  # PEP 695 type alias (Python 3.12+)

@dataclass(frozen=True, slots=True)
class Order:
    order_id: int
    user_id: UserId
    amount: float

class Scorable(Protocol):
    def score(self) -> float: ...

def first_item[T](items: list[T]) -> T | None:
    return items[0] if items else None`,
    relatedFlowId: 'py-memory-gc',
  },
  {
    id: 'py-asyncio-structured',
    language: 'python',
    versionTag: 'Python 3.11–3.13+',
    level: 'Advanced',
    category: 'Async & Concurrency',
    title: 'Structured Concurrency with asyncio.TaskGroup & Bounded Semaphores',
    simpleEnglish:
      'Instead of firing off orphan background tasks that silently fail or overload downstream APIs, `TaskGroup` waits for every task cleanly and `Semaphore` caps how many run simultaneously.',
    standardDefinition:
      '`asyncio.TaskGroup` guarantees task lifetime scoping and cancels sibling tasks upon unhandled exceptions (raising `ExceptionGroup`). Combining `asyncio.Semaphore` applies backpressure to prevent socket exhaustion.',
    realWorldApplication:
      'AI LLM agent orchestration (calling embeddings, vector DBs, and tool APIs concurrently), high-throughput FastAPI microservices, and web scrapers.',
    runtimeAndComplexity: 'O(1) coroutine switching · Handles 10,000+ concurrent I/O operations on 1 thread',
    commonTrap: 'Calling blocking libraries (`requests.get`, `time.sleep`, heavy CPU loops) directly inside `async def` — this freezes the entire event loop for every user!',
    clearSolution: 'Use async-native drivers (`httpx.AsyncClient`, `asyncpg`) or offload unavoidable blocking/CPU work via `await asyncio.to_thread(...)`.',
    codeExample: `import asyncio

async def fetch_profile(user_id: int, sem: asyncio.Semaphore) -> dict[str, object]:
    async with sem:  # Max 10 concurrent outbound calls
        await asyncio.sleep(0.05)  # Non-blocking I/O
        return {"user_id": user_id, "status": "ok"}

async def fetch_batch(ids: list[int]) -> list[dict[str, object]]:
    sem = asyncio.Semaphore(10)
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch_profile(uid, sem)) for uid in ids]
    return [t.result() for t in tasks]`,
    relatedFlowId: 'py-asyncio-loop',
  },
  {
    id: 'py-nogil-jit-313',
    language: 'python',
    versionTag: 'Python 3.13+ (Latest)',
    level: 'Advanced',
    category: 'Python 3.13+ Frontier',
    title: 'Free-Threaded No-GIL (PEP 703), Subinterpreters & Experimental JIT',
    simpleEnglish:
      'Historically, Python’s Global Interpreter Lock (GIL) let only one thread execute Python code at a time. Python 3.13 introduces an experimental No-GIL mode (`python3.13t`) so CPU-heavy threads can finally use all your CPU cores in parallel!',
    standardDefinition:
      'PEP 703 introduces biased reference counting, immortal objects, and mimalloc-backed per-object locking so CPython can run without the GIL. PEP 744 adds an experimental Copy-and-Patch JIT compiler for hot bytecode traces.',
    realWorldApplication:
      'Multi-core numerical pipelines, local ML preprocessing, high-CPU simulations, and true parallel thread pools without multiprocessing pickle/IPC overhead.',
    runtimeAndComplexity: 'CPU-bound scaling moves from 1 core (GIL) -> N cores (`python3.13t` + `ThreadPoolExecutor`)',
    commonTrap: 'Assuming multi-threading speeds up CPU loops on standard GIL-enabled Python, or ignoring thread-safety locks when migrating to `python3.13t`.',
    clearSolution: 'Check `sys._is_gil_enabled()` at runtime; use `ProcessPoolExecutor` on standard GIL builds, and protect shared mutable state with `threading.Lock` on free-threaded 3.13t builds.',
    codeExample: `import sys
from concurrent.futures import ThreadPoolExecutor

def heavy_checksum(n: int) -> int:
    return sum(i * i for i in range(n))

gil_active = getattr(sys, "_is_gil_enabled", lambda: True)()
print(f"GIL enabled: {gil_active}")

# On Python 3.13t (free-threaded), these run on separate CPU cores!
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(heavy_checksum, [500_000] * 4))`,
    relatedFlowId: 'py-execution-jit',
  },
  {
    id: 'py-descriptors-memoryview',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Advanced',
    category: 'Memory & Metaprogramming',
    title: 'Descriptors, Weak References & Zero-Copy memoryview',
    simpleEnglish:
      'Descriptors are the secret engine behind `@property` and ORMs like SQLAlchemy—they let you intercept reads/writes on attributes. `memoryview` lets you slice huge binary buffers without copying bytes.',
    standardDefinition:
      'Objects implementing `__get__`, `__set__`, or `__set_name__` customize attribute access on owner classes. `memoryview` exposes the C buffer protocol directly for zero-copy slicing of `bytes`/`bytearray`.',
    realWorldApplication:
      'Building validation frameworks (Pydantic/Django fields), custom binary network protocol parsers, and large tensor/image slice operations.',
    runtimeAndComplexity: '`bytes[a:b]` slice = O(k) copy · `memoryview(buf)[a:b]` = O(1) zero-copy pointer view',
    commonTrap: 'Slicing multi-megabyte `bytes` buffers inside tight loops (`buf = buf[1024:]`), causing quadratic O(n^2) memory copying.',
    clearSolution: 'Wrap large binary payloads in `mv = memoryview(buf)` and slice the view in O(1) time and O(1) extra memory.',
    codeExample: `class PositiveNumber:
    def __set_name__(self, owner: type, name: str) -> None:
        self.private_name = f"_{name}"

    def __get__(self, obj: object, objtype: type | None = None) -> float:
        return getattr(obj, self.private_name)

    def __set__(self, obj: object, value: float) -> None:
        if value <= 0:
            raise ValueError(f"{self.private_name} must be > 0")
        setattr(obj, self.private_name, value)

buf = bytearray(b"HEADER:PAYLOAD_DATA")
payload_view = memoryview(buf)[7:]  # Zero-copy O(1) view`,
    relatedFlowId: 'py-memory-gc',
  },
  {
    id: 'py-functions-closures-legb',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Basic',
    category: 'Core Foundations',
    title: 'Functions, *args/**kwargs, Keyword-Only Params & Closures (LEGB Scope)',
    simpleEnglish:
      'Python functions are first-class objects you can pass around like numbers. Closures let inner functions remember variables from their outer scope using the LEGB lookup rule (Local -> Enclosing -> Global -> Built-in).',
    standardDefinition:
      'CPython resolves names via LEGB scope rules, captures enclosing free variables in `cell` objects (`__closure__`), and supports positional-only (`/`) and keyword-only (`*`) API boundaries (PEP 570).',
    realWorldApplication:
      'Building clean SDK/API signatures where boolean flags must be passed by name, writing factory functions, callbacks, and stateful decorators.',
    runtimeAndComplexity: 'Local (`LOAD_FAST`) & closure (`LOAD_DEREF`) lookup O(1) array index · Global lookup O(1) dict hash',
    commonTrap: 'Creating closures inside a `for` loop (`[lambda: i for i in range(3)]`)—every lambda captures the SAME final value `2` due to late binding!',
    clearSolution: 'Bind the loop variable as a default argument (`lambda i=i: i`) or use `functools.partial`, and declare `nonlocal` when mutating an enclosing variable.',
    codeExample: `def make_rate_limiter(max_calls: int, *, window_sec: float = 60.0):
    count = 0

    def allow() -> bool:
        nonlocal count  # Rebinds enclosing LEGB cell variable
        if count >= max_calls:
            return False
        count += 1
        return True

    return allow

# Keyword-only '*' enforces clear call sites:
limiter = make_rate_limiter(3, window_sec=10.0)
print(limiter(), limiter())  # True True`,
    relatedFlowId: 'py-execution-jit',
  },
  {
    id: 'py-oop-mro-abc',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Basic',
    category: 'OOP & Design',
    title: 'OOP in Python: Classes, Dunder Methods, C3 MRO Inheritance & ABCs',
    simpleEnglish:
      'Classes bundle data and behavior. Special double-underscore ("dunder") methods like `__repr__`, `__len__`, and `__eq__` let your custom objects behave like native Python lists and numbers.',
    standardDefinition:
      'Python supports single and multiple inheritance resolved deterministically by the C3 Linearization Method Resolution Order (`Class.__mro__`). `abc.ABC` + `@abstractmethod` enforces interface contracts at instantiation time.',
    realWorldApplication:
      'Designing plugin architectures, custom domain value objects with operator overloading, and clean mixin hierarchies in Django/FastAPI.',
    runtimeAndComplexity: 'Attribute/method lookup caches MRO slots via PEP 659 inline caches (O(1) hot path)',
    commonTrap: 'Calling parent `__init__` directly (`Parent.__init__(self)`) in multiple inheritance, causing diamond parents to run twice instead of cooperating via `super()`.',
    clearSolution: 'Always delegate via cooperative `super().__init__(**kwargs)`, define `__repr__` for debugging, and prefer composition or `Protocol` over deep inheritance trees.',
    codeExample: `from abc import ABC, abstractmethod

class StorageBackend(ABC):
    @abstractmethod
    def save(self, key: str, payload: bytes) -> None: ...

class InMemoryStorage(StorageBackend):
    def __init__(self) -> None:
        self._store: dict[str, bytes] = {}

    def save(self, key: str, payload: bytes) -> None:
        self._store[key] = payload

    def __len__(self) -> int:
        return len(self._store)  # Enables len(storage)`,
    relatedFlowId: 'py-memory-gc',
  },
  {
    id: 'py-collections-advanced',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Intermediate',
    category: 'Collections & Data Structures',
    title: 'Advanced Collections: deque, Counter, defaultdict, ChainMap & heapq',
    simpleEnglish:
      'Beyond plain `list` and `dict`, Python’s standard library ships high-speed specialized structures: `deque` for O(1) queues/sliding windows, `Counter` for instant tallies, `defaultdict` for grouping, and `heapq` for priority queues.',
    standardDefinition:
      '`collections.deque` implements a bounded or unbounded doubly-linked block queue (O(1) ends); `Counter` is a multiset `dict` subclass with `.most_common(k)`; `heapq` maintains a binary min-heap in-place on a `list` (O(log n) push/pop).',
    realWorldApplication:
      'Sliding-window rate limiters (`deque(maxlen=N)`), log error aggregation (`Counter`), inverted indexes (`defaultdict(list)`), and job priority schedulers (`heapq`).',
    runtimeAndComplexity: 'deque append/pop both ends O(1) · heapq push/pop O(log n) · Counter.most_common(k) O(n log k)',
    commonTrap: 'Using `list.pop(0)` in a BFS or worker queue—shifting every remaining element makes a 100k-item queue take O(n^2) time!',
    clearSolution: 'Always use `collections.deque` for FIFO queues/sliding windows and `heapq` for Top-K or priority scheduling.',
    codeExample: `from collections import Counter, defaultdict, deque
import heapq

window: deque[int] = deque(maxlen=3)  # Auto-evicts oldest in O(1)
for ms in (12, 18, 45, 22):
    window.append(ms)  # deque([18, 45, 22])

counts = Counter(["err", "ok", "err", "timeout", "err"])
top_event = counts.most_common(1)  # [('err', 3)]

by_region: defaultdict[str, list[str]] = defaultdict(list)
by_region["us-east"].append("node-1")

pq: list[tuple[int, str]] = []
heapq.heappush(pq, (1, "critical_alert"))
priority, task = heapq.heappop(pq)  # O(log n) min-heap`,
    relatedFlowId: 'py-collections-internals',
  },
  {
    id: 'py-exceptions-groups',
    language: 'python',
    versionTag: 'Python 3.11–3.13+',
    level: 'Intermediate',
    category: 'Error Handling & Resilience',
    title: 'Structured Exceptions: try/except/else/finally, Chaining & except* (PEP 654)',
    simpleEnglish:
      'Put only the risky line inside `try:`, run success logic in `else:`, and guarantee cleanup in `finally:`. When multiple concurrent tasks fail at once, Python 3.11+ lets you catch each error type cleanly with `except*`.',
    standardDefinition:
      'Python separates EAFP (`try/except/else/finally`) exception flows, explicit cause chaining (`raise DomainError(...) from err`), and `ExceptionGroup` + `except*` (PEP 654) for splitting concurrent failures.',
    realWorldApplication:
      'Wrapping low-level DB/HTTP errors into clean API domain exceptions without losing the original stack trace, and handling partial failures inside `asyncio.TaskGroup`.',
    runtimeAndComplexity: 'Zero-cost `try` blocks in Python 3.11+ (no runtime overhead when no exception is raised!)',
    commonTrap: 'Writing bare `except:` or `except Exception: pass`—this silently hides bugs, keyboard interrupts (`Ctrl+C`), and crashes.',
    clearSolution: 'Catch specific exception classes, preserve root causes with `raise CustomError(...) from exc`, and use `except*` for `TaskGroup` errors.',
    codeExample: `class PaymentDeclinedError(Exception):
    pass

def charge(raw_amount: str) -> float:
    try:
        amount = float(raw_amount)
    except ValueError as err:
        raise PaymentDeclinedError("Invalid numeric amount") from err
    else:
        return round(amount, 2)

# Handling concurrent ExceptionGroup (Python 3.11+):
try:
    raise ExceptionGroup("batch", [ValueError("bad id"), TimeoutError("slow")])
except* ValueError as eg:
    print("Validation failures:", len(eg.exceptions))
except* TimeoutError as eg:
    print("Retryable timeouts:", len(eg.exceptions))`,
    relatedFlowId: 'py-asyncio-loop',
  },
  {
    id: 'py-multithreading-sync',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Advanced',
    category: 'Multithreading & Concurrency',
    title: 'Multithreading: Thread, Lock, RLock, Condition, Event, queue.Queue & ThreadPoolExecutor',
    simpleEnglish:
      'Multiple Python threads share the same memory space and are great for running blocking I/O (DB queries, file reads, SDK calls) concurrently. Always protect shared writes with a `Lock` or pass data safely through `queue.Queue`.',
    standardDefinition:
      'Python’s `threading` module wraps OS native threads with synchronization primitives (`Lock`, `RLock`, `Semaphore`, `Event`, `Condition`, `Barrier`) and `queue.Queue` (internally lock-protected FIFO/Priority queues) orchestrated by `concurrent.futures.ThreadPoolExecutor`.',
    realWorldApplication:
      'Parallelizing synchronous libraries (`boto3`, `psycopg`, legacy SOAP/REST clients), producer-consumer background log flushers, and multi-core CPU pools on Python 3.13t.',
    runtimeAndComplexity: 'OS thread ~1–8 MB stack · Context switch ~1–5 us · `queue.Queue` O(1) thread-safe put/get',
    commonTrap: 'Incrementing shared counters (`total += 1`) across threads without a `threading.Lock`—the GIL can switch between `LOAD` and `STORE`, silently losing updates!',
    clearSolution: 'Protect every shared mutation with `with lock:`, or better yet, decouple threads with message passing via `queue.Queue` and `ThreadPoolExecutor`.',
    codeExample: `import queue
import threading
from concurrent.futures import ThreadPoolExecutor

lock = threading.Lock()
processed = 0
jobs: queue.Queue[str] = queue.Queue(maxsize=100)

def worker(job_id: str) -> str:
    global processed
    # Simulate blocking I/O (releases GIL!)
    with lock:
        processed += 1
    return f"done:{job_id}"

with ThreadPoolExecutor(max_workers=8) as pool:
    results = list(pool.map(worker, ["a", "b", "c", "d"]))`,
    relatedFlowId: 'py-multithreading-gil',
  },
  {
    id: 'py-multiprocessing-ipc',
    language: 'python',
    versionTag: 'Python 3.13+',
    level: 'Advanced',
    category: 'Multithreading & Concurrency',
    title: 'Multiprocessing, ProcessPoolExecutor & SharedMemory for CPU-Bound Parallelism',
    simpleEnglish:
      'On standard GIL-enabled Python, threads cannot speed up pure-Python number crunching. `ProcessPoolExecutor` launches separate Python processes—one per CPU core—giving true parallel speedup!',
    standardDefinition:
      '`multiprocessing` and `concurrent.futures.ProcessPoolExecutor` spawn isolated OS processes with independent Python interpreters and GILs, communicating via pickle IPC pipes or zero-copy `multiprocessing.shared_memory.SharedMemory`.',
    realWorldApplication:
      'Image/PDF batch processing, feature engineering, cryptography, video transcoding orchestration, and parallel Monte Carlo simulations.',
    runtimeAndComplexity: 'True N-core CPU scaling · Startup/IPC cost higher than threads (batch work into coarse chunks)',
    commonTrap: 'Forgetting `if __name__ == "__main__":` on macOS/Windows (`spawn` start method), causing infinite recursive process spawning, or pickling giant 500 MB arrays per task.',
    clearSolution: 'Guard entrypoints with `if __name__ == "__main__":`, pass chunked batches (`chunksize`), or share large buffers via `SharedMemory` (or migrate to Python 3.13t No-GIL).',
    codeExample: `from concurrent.futures import ProcessPoolExecutor

def count_primes(limit: int) -> int:
    return sum(
        1 for n in range(2, limit)
        if all(n % d != 0 for d in range(2, int(n ** 0.5) + 1))
    )

if __name__ == "__main__":
    with ProcessPoolExecutor() as pool:
        # Runs in parallel across all CPU cores (independent GILs)
        totals = list(pool.map(count_primes, [20_000] * 4))`,
    relatedFlowId: 'py-multithreading-gil',
  },

  // JAVA 21+ (BASIC -> ADVANCED)
  {
    id: 'java-basics-sequenced',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Basic',
    category: 'Core Foundations',
    title: 'Static Types, var, Text Blocks & Sequenced Collections (JEP 431)',
    simpleEnglish:
      'Modern Java is far cleaner than old Java: use `var` for obvious local types, triple-quoted Text Blocks for SQL/JSON, `List.of()` for immutable lists, and Java 21’s `.getFirst()` / `.getLast()` / `.reversed()` on ordered collections.',
    standardDefinition:
      'Java 21 introduces `SequencedCollection`, `SequencedSet`, and `SequencedMap` (JEP 431) providing uniform encounter-order APIs (`getFirst`, `getLast`, `reversed`) across `List`, `Deque`, and `LinkedHashMap`.',
    realWorldApplication:
      'Building clean REST DTOs, LRU caches (`LinkedHashMap.putFirst`), readable embedded SQL/JSON templates, and null-safe immutable configuration maps.',
    runtimeAndComplexity: '`ArrayList.getFirst/getLast` O(1) · `List.reversed()` O(1) view (zero copy!)',
    commonTrap: 'Calling `.add()` on `List.of(...)` (throws `UnsupportedOperationException` because it is unmodifiable) or writing verbose `list.get(list.size() - 1)`.',
    clearSolution: 'Use Java 21’s `list.getLast()` and `list.reversed()`, and copy into `new ArrayList<>(...)` only when mutation is explicitly required.',
    codeExample: `var cities = new ArrayList<>(List.of("Bengaluru", "Seattle", "Austin"));
String first = cities.getFirst();      // Java 21 JEP 431
String last = cities.getLast();        // No more size() - 1!
var revView = cities.reversed();       // O(1) live reversed view

String sql = """
    SELECT order_id, amount
    FROM orders
    WHERE status = 'PAID'
    """;`,
    relatedFlowId: 'java-jvm-jit-zgc',
  },
  {
    id: 'java-streams-lambdas',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Basic',
    category: 'Functional Data Pipelines',
    title: 'Lambdas, Method References & Streams API (.toList(), Collectors)',
    simpleEnglish:
      'Streams let you chain filter, transform, sort, and group operations on collections like an assembly line—describing WHAT you want instead of managing loop index variables by hand.',
    standardDefinition:
      'Java Streams are lazy, single-use pipelines composed of stateless intermediate operations (`filter`, `map`, `flatMap`) fused into one pass by a terminal operation (`toList()`, `collect`, `reduce`).',
    realWorldApplication:
      'Aggregating invoices by customer, filtering feature flags, mapping database entities to API responses, and computing analytics summaries.',
    runtimeAndComplexity: 'Single-pass lazy fusion O(n) · Short-circuits on `findFirst()` / `anyMatch()`',
    commonTrap: 'Using `.parallelStream()` blindly for tiny lists or I/O calls—this clogs the shared global `ForkJoinPool.commonPool()`!',
    clearSolution: 'Use sequential streams for normal transformations and Java 21 Virtual Threads (never `parallelStream()`) for concurrent I/O calls.',
    codeExample: `record Order(int id, String status, double amount) {}

var orders = List.of(
    new Order(101, "PAID", 120.0),
    new Order(102, "PENDING", 45.0),
    new Order(103, "PAID", 850.0)
);

List<Order> highValuePaid = orders.stream()
    .filter(o -> "PAID".equals(o.status()) && o.amount() >= 100)
    .sorted(Comparator.comparingDouble(Order::amount).reversed())
    .toList();  // Immutable list (Java 16+)`,
    relatedFlowId: 'java-jvm-jit-zgc',
  },
  {
    id: 'java-records-sealed-switch',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Intermediate',
    category: 'Data-Oriented Programming',
    title: 'Records, Sealed Interfaces & Exhaustive Switch Pattern Matching (JEP 440/441)',
    simpleEnglish:
      'Records replace 60 lines of getters/equals/hashCode with 1 line. Pairing `record` with `sealed interface` and Java 21 `switch` lets the compiler verify you handled every possible case automatically.',
    standardDefinition:
      'Java 21 standardizes Record Patterns (JEP 440) and Pattern Matching for switch (JEP 441), supporting nested deconstruction, `case null`, guarded `when` predicates, and compile-time exhaustiveness over `sealed` hierarchies.',
    realWorldApplication:
      'Modeling payment states, API Result types (`Ok | Err`), AST nodes, and event-driven Kafka message handlers with zero missed branches.',
    runtimeAndComplexity: 'Compile-time exhaustiveness · O(1) `invokedynamic` type-switch dispatch',
    commonTrap: 'Adding an unnecessary `default:` branch on a `sealed` switch—doing so disables the compiler warning when someone adds a new subtype later!',
    clearSolution: 'Omit `default:` when switching over a `sealed` hierarchy so `javac` enforces complete coverage on every future schema change.',
    codeExample: `sealed interface Payment permits Card, Upi {}
record Card(String last4, double amount) implements Payment {}
record Upi(String vpa, double amount) implements Payment {}

String audit(Payment p) {
    return switch (p) {
        case null -> "Missing payment";
        case Card(var last4, var amt) when amt > 10_000 ->
            "High-risk Card *" + last4 + ": $" + amt;
        case Card(var last4, var amt) ->
            "Card *" + last4 + ": $" + amt;
        case Upi(var vpa, var amt) ->
            "UPI " + vpa + ": $" + amt;
    };
}`,
    relatedFlowId: 'java-pattern-matching',
  },
  {
    id: 'java-optional-resources',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Intermediate',
    category: 'Resilient Production Code',
    title: 'Optional Pipelines, Unchecked vs Checked Exceptions & try-with-resources',
    simpleEnglish:
      '`Optional<T>` explicitly signals "this lookup might return nothing" so callers handle empty results cleanly instead of crashing with `NullPointerException`. `try-with-resources` auto-closes DB/file handles even on errors.',
    standardDefinition:
      '`Optional<T>` models absent return values via monadic chaining (`map`, `flatMap`, `orElseThrow`). `try-with-resources` invokes `AutoCloseable.close()` deterministically and preserves suppressed exceptions.',
    realWorldApplication:
      'Repository lookups (`findById`), JDBC connections & prepared statements, HTTP client pools, and structured Virtual Thread executors.',
    runtimeAndComplexity: 'Zero leaked file descriptors / DB connections under exceptions',
    commonTrap: 'Calling `optional.get()` without checking `isPresent()` (just a slower NPE!) or using `Optional` as a field/method parameter.',
    clearSolution: 'Use `Optional` strictly for return types and unwrap with `.orElseThrow(...)`, `.orElseGet(...)`, or `.map(...).orElse(...)`.',
    codeExample: `Optional<String> findEmail(Map<Integer, String> db, int id) {
    return Optional.ofNullable(db.get(id));
}

String domain = findEmail(userMap, 42)
    .map(email -> email.substring(email.indexOf('@') + 1))
    .orElse("unknown.local");

try (var conn = dataSource.getConnection();
     var stmt = conn.prepareStatement("SELECT 1")) {
    stmt.execute();
} // Automatically closed in reverse order!`,
    relatedFlowId: 'java-jvm-jit-zgc',
  },
  {
    id: 'java-virtual-threads-loom',
    language: 'java',
    versionTag: 'Java 21 LTS (JEP 444)',
    level: 'Advanced',
    category: 'High-Scale Concurrency',
    title: 'Virtual Threads (Project Loom) & Structured Concurrency',
    simpleEnglish:
      'Virtual Threads are ultra-cheap JVM-managed threads (~1 KB each). You write plain, easy-to-debug synchronous code, yet a single JVM can handle hundreds of thousands of simultaneous DB/HTTP requests.',
    standardDefinition:
      'Virtual Threads (JEP 444) decouple `java.lang.Thread` from 1:1 OS kernel threads. Blocking I/O yields the virtual thread’s heap-stored continuation off its ForkJoinPool carrier thread automatically.',
    realWorldApplication:
      'Spring Boot 3.2+ (`spring.threads.virtual.enabled=true`), microservices making fan-out HTTP/DB calls, and WebSocket gateways.',
    runtimeAndComplexity: '1M virtual threads ≈ ~1 GB heap (vs. 1,000 GB for 1M OS threads)',
    commonTrap: 'Pooling virtual threads in a fixed pool, storing giant objects in `ThreadLocal`, or running blocking I/O inside a `synchronized` block (which pins the carrier OS thread in Java 21; fixed in Java 24 JEP 491).',
    clearSolution: 'Create a fresh virtual thread per task via `Executors.newVirtualThreadPerTaskExecutor()`, replace `synchronized` around I/O with `ReentrantLock`, and limit downstream concurrency with a `Semaphore`.',
    codeExample: `try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = IntStream.range(0, 10_000)
        .mapToObj(id -> executor.submit(() -> {
            Thread.sleep(Duration.ofMillis(20)); // Unmounts carrier!
            return "Handled req #" + id;
        }))
        .toList();
} // Waits for all 10,000 virtual threads to finish cleanly`,
    relatedFlowId: 'java-virtual-threads',
  },
  {
    id: 'java-jmm-zgc',
    language: 'java',
    versionTag: 'Java 21 LTS (JEP 439)',
    level: 'Advanced',
    category: 'JVM Internals & GC Tuning',
    title: 'Java Memory Model (Happens-Before), Lock-Free Atomics & Generational ZGC',
    simpleEnglish:
      'CPU cores cache variables locally, so Thread B might not see Thread A’s update unless you establish a visibility barrier (`volatile`, `Atomic*`, or lock). Generational ZGC keeps GC pauses under half a millisecond.',
    standardDefinition:
      'The Java Memory Model (JMM) defines Happens-Before guarantees across threads (`volatile` store-load barriers, `AtomicLong` CAS instructions, `final` field safe publication). Generational ZGC (JEP 439) separates young/old heaps with concurrent load-barrier compaction.',
    realWorldApplication:
      'Low-latency trading engines, high-QPS API gateways where p99.9 tail latency matters, and lock-free rate limiters / metrics counters (`LongAdder`).',
    runtimeAndComplexity: '`LongAdder` O(1) striped contention-free increment · Gen ZGC pause < 0.5 ms regardless of heap size',
    commonTrap: 'Assuming `volatile count++;` is thread-safe (it is NOT — read-modify-write is 3 steps!) or ignoring high allocation rates under G1GC.',
    clearSolution: 'Use `AtomicLong` or `LongAdder` for concurrent counters, `ConcurrentHashMap.compute()` for atomic map updates, and enable `-XX:+UseZGC -XX:+ZGenerational` for ultra-low tail latency.',
    codeExample: `// Thread-safe high-throughput counter (avoids CAS contention)
var requestCounter = new LongAdder();
requestCounter.increment();

// Atomic check-and-update in ConcurrentHashMap
var cache = new ConcurrentHashMap<String, Integer>();
cache.merge("tenant_acme", 1, Integer::sum);

// JVM flag for Java 21 sub-millisecond GC pauses:
// java -XX:+UseZGC -XX:+ZGenerational -Xmx16g -jar service.jar`,
    relatedFlowId: 'java-jvm-jit-zgc',
  },
  {
    id: 'java-panama-ffm',
    language: 'java',
    versionTag: 'Java 21–22+ (Panama)',
    level: 'Advanced',
    category: 'Systems & Native Interop',
    title: 'Foreign Function & Memory (FFM) API — Safe Off-Heap Memory',
    simpleEnglish:
      'Need to call C/Rust libraries (like SIMD vector search or DuckDB) or store gigabytes outside GC heap safely? The FFM API replaces unsafe, crash-prone JNI with pure Java memory arenas that auto-free deterministically.',
    standardDefinition:
      'Project Panama’s Foreign Function & Memory API (`Arena`, `MemorySegment`, `Linker`) provides type-safe, bounds-checked off-heap memory allocation and direct downcalls to native C symbols without JNI glue code.',
    realWorldApplication:
      'Vector databases, high-frequency zero-copy networking, DuckDB/SQLite native bindings, and GPU/ML inference engines on the JVM.',
    runtimeAndComplexity: 'Zero JNI marshaling copy · Deterministic off-heap `Arena.close()` free (zero GC overhead)',
    commonTrap: 'Using legacy `sun.misc.Unsafe` or `ByteBuffer.allocateDirect` without deterministic deallocation, causing silent native OOM container kills.',
    clearSolution: 'Allocate off-heap buffers inside a confined `try (Arena arena = Arena.ofConfined())` block so native memory is freed immediately on block exit.',
    codeExample: `// Deterministic off-heap memory allocation (no GC pressure, no leaks)
try (Arena arena = Arena.ofConfined()) {
    MemorySegment seg = arena.allocate(ValueLayout.JAVA_INT, 1024);
    seg.setAtIndex(ValueLayout.JAVA_INT, 0, 42);
    int val = seg.getAtIndex(ValueLayout.JAVA_INT, 0);
} // Off-heap native memory freed deterministically right here!`,
    relatedFlowId: 'java-jvm-jit-zgc',
  },
  {
    id: 'java-oop-generics-pecs',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Basic',
    category: 'OOP & Type System',
    title: 'OOP Foundations, Interfaces, Polymorphism & Generics Wildcards (PECS)',
    simpleEnglish:
      'Java organizes code into strongly typed classes and interfaces. Generics (`List<T>`) catch type errors at compile time, and the PECS rule ("Producer Extends, Consumer Super") makes generic APIs flexible and safe.',
    standardDefinition:
      'Java enforces single class inheritance with multiple interface implementation (including `default` and `private` interface methods). Generics are invariant (`List<Integer>` is not a `List<Number>`) with compile-time type erasure and bounded wildcards (`? extends T`, `? super T`).',
    realWorldApplication:
      'Designing reusable Spring repositories (`Repository<T, ID>`), type-safe utility libraries (`Collections.copy`), and clean hexagonal domain interfaces.',
    runtimeAndComplexity: 'Zero runtime generic overhead (erased to bounds) · Monomorphic virtual calls inlined by C2 JIT',
    commonTrap: 'Using raw types (`List items = new ArrayList()`) or trying to insert elements into a `List<? extends Number>` (fails compile because the exact subtype is unknown).',
    clearSolution: 'Remember PECS: read from `List<? extends T>` (Producer), write into `List<? super T>` (Consumer), and prefer interfaces (`List`, `Map`) over concrete types in method signatures.',
    codeExample: `interface DiscountPolicy {
    double apply(double price);
    default String label() { return "standard"; }
}

// PECS: Producer Extends (read), Consumer Super (write)
static <T> void copyAll(List<? extends T> src, List<? super T> dest) {
    for (T item : src) {
        dest.add(item);
    }
}`,
    relatedFlowId: 'java-jvm-jit-zgc',
  },
  {
    id: 'java-collections-framework',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Intermediate',
    category: 'Collections & Data Structures',
    title: 'Java Collections Framework: ArrayList, HashMap, TreeMap, ArrayDeque & PriorityQueue',
    simpleEnglish:
      'Picking the right Java collection makes code 10x faster: `ArrayList` for indexed lists, `HashMap` for O(1) key lookups, `LinkedHashMap` for insertion/LRU order, `TreeMap` for sorted range queries, and `ArrayDeque` for stacks/queues.',
    standardDefinition:
      'The Java Collections Framework separates `Collection` (`List`, `Set`, `Queue`/`Deque`) and `Map`. `ArrayList` grows 1.5x; `HashMap` hashes with RB-tree collision protection at 8 nodes; `TreeMap` is a Red-Black BST; `ArrayDeque` is a cache-friendly circular ring buffer.',
    realWorldApplication:
      'Caching (`LinkedHashMap`), rate-limit time buckets (`TreeMap.subMap`), BFS/undo stacks (`ArrayDeque`), and event scheduling (`PriorityQueue`).',
    runtimeAndComplexity: 'ArrayList get O(1) · HashMap O(1) avg / O(log n) worst · TreeMap O(log n) · ArrayDeque head/tail O(1)',
    commonTrap: 'Using legacy `LinkedList` or `Stack` (synchronized legacy Vector!) for queues/stacks, or forgetting to override BOTH `equals()` and `hashCode()` on custom `HashMap` keys.',
    clearSolution: 'Always prefer `ArrayDeque` over `Stack`/`LinkedList` for queues/stacks, use `record` keys (auto `equals`/`hashCode`), and size initial capacities when counts are known.',
    codeExample: `// 1. O(1) ring-buffer queue/stack (faster than LinkedList & Stack)
Deque<String> queue = new ArrayDeque<>();
queue.offerLast("req-1");
String next = queue.pollFirst();

// 2. Sorted range map (Red-Black Tree, O(log n))
NavigableMap<Integer, String> scores = new TreeMap<>();
scores.put(95, "Alice");
scores.put(80, "Bob");
var topRange = scores.tailMap(90, true); // {95=Alice}

// 3. Min-heap priority queue
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(42);
minHeap.offer(7);
int smallest = minHeap.poll(); // 7`,
    relatedFlowId: 'java-collections-hashmap',
  },
  {
    id: 'java-concurrent-collections',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Intermediate',
    category: 'Collections & Data Structures',
    title: 'Concurrent Collections: ConcurrentHashMap, BlockingQueue & CopyOnWriteArrayList',
    simpleEnglish:
      'Plain `HashMap` and `ArrayList` corrupt data or throw `ConcurrentModificationException` when modified by multiple threads. Java’s `java.util.concurrent` collections give lock-free reads and safe atomic updates at high speed.',
    standardDefinition:
      '`ConcurrentHashMap` uses lock-free volatile reads, CAS empty-bin inserts, and per-bucket locking (`compute`, `merge`). `ArrayBlockingQueue`/`LinkedBlockingQueue` coordinate producer-consumer backpressure. `CopyOnWriteArrayList` duplicates the backing array on writes for zero-lock snapshot iteration.',
    realWorldApplication:
      'Shared in-memory caches, API rate-limit counters, producer-consumer worker queues, and read-heavy event listener registries.',
    runtimeAndComplexity: 'CHM read: O(1) lock-free · BlockingQueue: bounded backpressure · CopyOnWrite: O(1) read / O(n) write',
    commonTrap: 'Writing `if (!map.containsKey(k)) map.put(k, v);` on a `ConcurrentHashMap`—two threads can interleave between check and put (check-then-act race)!',
    clearSolution: 'Use atomic single-call compound methods (`computeIfAbsent`, `merge`, `putIfAbsent`) on `ConcurrentHashMap`, and bound every `BlockingQueue` to prevent OOM.',
    codeExample: `var hits = new ConcurrentHashMap<String, Long>();
// Atomic thread-safe increment (no check-then-act race!)
hits.merge("/api/orders", 1L, Long::sum);

// Bounded producer-consumer queue with backpressure
BlockingQueue<String> workQueue = new ArrayBlockingQueue<>(1000);
workQueue.put("invoice-901");     // Blocks if full
String job = workQueue.take();    // Blocks if empty

// Read-mostly listener list (safe concurrent iteration)
List<Runnable> listeners = new CopyOnWriteArrayList<>();`,
    relatedFlowId: 'java-collections-hashmap',
  },
  {
    id: 'java-multithreading-lifecycle',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Advanced',
    category: 'Multithreading & Concurrency',
    title: 'Multithreading Fundamentals: Thread.State Lifecycle, synchronized, wait/notify & volatile',
    simpleEnglish:
      'Every Java thread moves through 6 clear states (`NEW`, `RUNNABLE`, `BLOCKED`, `WAITING`, `TIMED_WAITING`, `TERMINATED`). `synchronized` guarantees mutual exclusion + visibility, while `volatile` guarantees cross-thread visibility for flags.',
    standardDefinition:
      'Java threads share heap memory and have private stacks. Intrinsic monitors (`synchronized`) provide mutual exclusion and Happens-Before memory barriers; `wait()`/`notifyAll()` coordinate condition queues while releasing the monitor; `volatile` enforces memory visibility without locking.',
    realWorldApplication:
      'Diagnosing production thread dumps (`jstack`) by reading `BLOCKED` vs `WAITING` states, graceful shutdown flags (`volatile boolean running`), and low-level guarded queues.',
    runtimeAndComplexity: 'OS thread ~1 MB stack · Uncontended lock: fast biased/thin lock · Contended lock: OS futex park',
    commonTrap: 'Calling `t.run()` instead of `t.start()`, checking `wait()` conditions with `if` instead of `while` (spurious wakeup bug), or acquiring two locks in opposite order (deadlock).',
    clearSolution: 'Always use `while (!ready) lock.wait();`, enforce global lock ordering, and prefer `java.util.concurrent` (`ExecutorService`, `BlockingQueue`, `AtomicBoolean`) over raw `Thread`/`wait`/`notify`.',
    codeExample: `class GracefulWorker implements Runnable {
    private volatile boolean running = true; // Visible across CPU cores

    public void stop() { running = false; }

    @Override
    public void run() {
        while (running) {
            // Process work batch cleanly
        }
    }
}

var worker = new GracefulWorker();
Thread t = Thread.ofPlatform().name("ingest-1").start(worker);
worker.stop();
t.join(); // Transitions caller to WAITING until t is TERMINATED`,
    relatedFlowId: 'java-thread-lifecycle-concurrency',
  },
  {
    id: 'java-executors-completablefuture',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Advanced',
    category: 'Multithreading & Concurrency',
    title: 'ExecutorService, ThreadPoolExecutor Sizing & CompletableFuture Async Pipelines',
    simpleEnglish:
      'Never spawn unbounded raw threads per request—use an `ExecutorService` pool (or Virtual Threads for I/O). `CompletableFuture` lets you fan out multiple async tasks, combine their results, apply timeouts, and handle fallbacks cleanly.',
    standardDefinition:
      '`ThreadPoolExecutor` manages core threads, a bounded `BlockingQueue`, max threads, and `RejectedExecutionHandler`. `CompletableFuture` implements a non-blocking completion stage DAG (`supplyAsync`, `thenCombine`, `allOf`, `orTimeout`, `exceptionally`).',
    realWorldApplication:
      'Aggregating user profile + pricing + inventory microservices in parallel with strict SLA timeouts and graceful degradation.',
    runtimeAndComplexity: 'CPU-bound pool size ≈ `Runtime.getRuntime().availableProcessors()` · I/O-bound: Virtual Threads',
    commonTrap: 'Using `Executors.newFixedThreadPool` or `newCachedThreadPool` blindly in production—fixed pools use an unbounded queue (OOM risk) and cached pools spawn unlimited OS threads!',
    clearSolution: 'Configure explicit bounded queues + `CallerRunsPolicy` on `ThreadPoolExecutor` for CPU pools, pass a dedicated executor to `CompletableFuture.supplyAsync(..., pool)`, and always attach `.orTimeout(...)`.',
    codeExample: `try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    var profileF = CompletableFuture.supplyAsync(() -> "Alice", pool);
    var scoreF = CompletableFuture.supplyAsync(() -> 98, pool);

    String summary = profileF
        .thenCombine(scoreF, (name, score) -> name + " (" + score + ")")
        .orTimeout(500, TimeUnit.MILLISECONDS)
        .exceptionally(err -> "Fallback guest (0)")
        .join();
}`,
    relatedFlowId: 'java-thread-lifecycle-concurrency',
  },
  {
    id: 'java-locks-synchronizers',
    language: 'java',
    versionTag: 'Java 21 LTS',
    level: 'Advanced',
    category: 'Multithreading & Concurrency',
    title: 'Explicit Locks & Synchronizers: ReentrantLock, ReadWriteLock, Semaphore & CountDownLatch',
    simpleEnglish:
      'When `synchronized` is too rigid, Java gives precision tools: `ReentrantLock` adds `tryLock(timeout)` to prevent deadlocks, `ReadWriteLock` lets many readers run together, `Semaphore` caps concurrency, and `CountDownLatch` waits for N startup tasks.',
    standardDefinition:
      'Built on AbstractQueuedSynchronizer (AQS), `ReentrantLock` supports fairness, interruptibility, and timed acquisition; `ReentrantReadWriteLock`/`StampedLock` optimize read-heavy workloads; `Semaphore`, `CountDownLatch`, and `CyclicBarrier` coordinate multi-thread phases.',
    realWorldApplication:
      'Deadlock-free account transfers (`tryLock`), bounding concurrent DB/API calls under Virtual Threads (`Semaphore`), and multi-service cache warm-up gates (`CountDownLatch`).',
    runtimeAndComplexity: 'AQS CLH FIFO queue O(1) park/unpark · `StampedLock.tryOptimisticRead()` zero-lock reads',
    commonTrap: 'Forgetting to call `lock.unlock()` inside a `finally` block—if an exception is thrown, the lock stays permanently locked and freezes every waiting thread forever!',
    clearSolution: 'Always pair `lock.lock()` immediately with `try { ... } finally { lock.unlock(); }`, and use `Semaphore` (not thread pool size) to throttle downstream resources with Virtual Threads.',
    codeExample: `var dbLimiter = new Semaphore(20); // Max 20 concurrent DB calls
var lock = new ReentrantLock();

if (lock.tryLock(100, TimeUnit.MILLISECONDS)) {
    try {
        dbLimiter.acquire();
        try {
            // Safe, deadlock-bounded, rate-limited critical section
        } finally {
            dbLimiter.release();
        }
    } finally {
        lock.unlock();
    }
}`,
    relatedFlowId: 'java-thread-lifecycle-concurrency',
  },
];

export const LANGUAGE_COMPARISON_PAIRS: LanguageComparisonPair[] = [
  {
    id: 'cmp-models',
    topic: 'Immutable Data Models',
    level: 'Basic',
    summary: 'Compact value objects with automatic equality, printing, and immutability.',
    pythonCode: `from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class User:
    id: int
    name: str
    role: str = "viewer"`,
    javaCode: `public record User(
    int id,
    String name,
    String role
) {
    public User(int id, String name) {
        this(id, name, "viewer");
    }
}`,
    keyTakeaway: 'Python uses `@dataclass(frozen=True, slots=True)` to eliminate `__dict__` overhead; Java 21 uses 1-line `record` classes with compact constructors.',
  },
  {
    id: 'cmp-pattern',
    topic: 'Pattern Matching',
    level: 'Intermediate',
    summary: 'Unpacking structured payloads with guard clauses instead of nested if/else.',
    pythonCode: `match event:
    case {"kind": "pay", "amt": amt} if amt > 1000:
        action = "review"
    case {"kind": "pay", "amt": amt}:
        action = "approve"
    case _:
        action = "ignore"`,
    javaCode: `String action = switch (event) {
    case Pay(var amt) when amt > 1000 -> "review";
    case Pay(var amt) -> "approve";
    case Cancel _ -> "ignore";
};`,
    keyTakeaway: 'Python’s `match/case` shines on dynamic dicts/JSON; Java 21’s `switch` over `sealed` records guarantees compile-time exhaustiveness.',
  },
  {
    id: 'cmp-pipelines',
    topic: 'Filter & Transform Pipelines',
    level: 'Basic',
    summary: 'Expressive functional collection transformations.',
    pythonCode: `top_paid = sorted(
    (o.amount for o in orders if o.status == "PAID"),
    reverse=True,
)[:3]`,
    javaCode: `var topPaid = orders.stream()
    .filter(o -> "PAID".equals(o.status()))
    .map(Order::amount)
    .sorted(Comparator.reverseOrder())
    .limit(3)
    .toList();`,
    keyTakeaway: 'Python favors concise generator/list comprehensions; Java uses fused lazy `Stream` pipelines ending in `.toList()`.',
  },
  {
    id: 'cmp-concurrency',
    topic: 'High-Concurrency I/O',
    level: 'Advanced',
    summary: 'Handling 10,000+ concurrent network/DB calls cleanly.',
    pythonCode: `async def run_all(urls: list[str]):
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(fetch(u)) for u in urls]
    return [t.result() for t in tasks]`,
    javaCode: `try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    var futures = urls.stream()
        .map(u -> exec.submit(() -> fetch(u)))
        .toList();
}`,
    keyTakeaway: 'Python uses cooperative `async/await` + `TaskGroup` on 1 event-loop thread; Java 21 uses Virtual Threads so plain synchronous code scales effortlessly.',
  },
  {
    id: 'cmp-collections',
    topic: 'Collections, Queues & Counting',
    level: 'Intermediate',
    summary: 'O(1) double-ended queues and frequency histograms in both ecosystems.',
    pythonCode: `from collections import Counter, deque

q = deque(["a", "b", "c"], maxlen=3)
q.append("d")        # O(1), evicts "a"
first = q.popleft()  # O(1)

freq = Counter(["ok", "err", "ok"])
top = freq.most_common(1)  # [('ok', 2)]`,
    javaCode: `Deque<String> q = new ArrayDeque<>(List.of("a", "b", "c"));
q.offerLast("d");     // O(1) ring buffer
String first = q.pollFirst();

Map<String, Long> freq = List.of("ok", "err", "ok").stream()
    .collect(Collectors.groupingBy(s -> s, Collectors.counting()));`,
    keyTakeaway: 'Python’s `deque` & `Counter` give concise O(1) primitives; Java pairs `ArrayDeque` (faster than `LinkedList`) with `Collectors.groupingBy`.',
  },
  {
    id: 'cmp-thread-safe',
    topic: 'Thread-Safe Shared State',
    level: 'Advanced',
    summary: 'Safe multi-threaded counters and producer-consumer queues without race conditions.',
    pythonCode: `import queue, threading

lock = threading.Lock()
counts: dict[str, int] = {}
jobs: queue.Queue[str] = queue.Queue(maxsize=100)

with lock:
    counts["hits"] = counts.get("hits", 0) + 1
jobs.put("task-1")`,
    javaCode: `var counts = new ConcurrentHashMap<String, Long>();
var jobs = new ArrayBlockingQueue<String>(100);

// Atomic per-bucket update (no global lock!)
counts.merge("hits", 1L, Long::sum);
jobs.put("task-1");`,
    keyTakeaway: 'Python guards shared dicts with `threading.Lock` and decouples threads with `queue.Queue`; Java provides lock-free reads & atomic `.merge()` via `ConcurrentHashMap` + `BlockingQueue`.',
  },
  {
    id: 'cmp-pools-futures',
    topic: 'Thread Pools & Futures',
    level: 'Advanced',
    summary: 'Running parallel tasks across worker pools with clean shutdown.',
    pythonCode: `from concurrent.futures import ThreadPoolExecutor, as_completed

with ThreadPoolExecutor(max_workers=8) as pool:
    futs = [pool.submit(fetch, u) for u in urls]
    results = [f.result() for f in as_completed(futs)]`,
    javaCode: `try (var pool = Executors.newFixedThreadPool(8)) {
    var futs = urls.stream()
        .map(u -> CompletableFuture.supplyAsync(() -> fetch(u), pool))
        .toList();
    var results = futs.stream().map(CompletableFuture::join).toList();
}`,
    keyTakeaway: 'Both languages support scoped auto-closing thread pools (`with` in Python, `try-with-resources` in Java 19+) to guarantee graceful drain without thread leaks.',
  },
];

export const LANGUAGE_PRACTICE_CHALLENGES: LanguagePracticeChallenge[] = [
  {
    id: 'py-lab-1-comp',
    number: 1,
    language: 'python',
    level: 'Basic',
    title: 'Safe Default & Dict Comprehension',
    scenario: 'A Python microservice needs to filter active users and build a `{user_id: score}` lookup map without using the mutable default argument trap.',
    goal: 'Write a function using `items: list[dict] | None = None`, guard `None`, and return a dict comprehension filtering `active == True`.',
    starterCode: `def active_score_map(users=[]):
    # Fix mutable default trap & return {u["id"]: u["score"] ...} for active users
    pass`,
    buildingBlocks: [
      { label: 'Safe None Default', snippet: 'def active_score_map(users: list[dict] | None = None) -> dict[int, int]:' },
      { label: 'Guard None', snippet: '    if users is None:\n        return {}' },
      { label: 'Dict Comprehension', snippet: '    return {u["id"]: u["score"] for u in users if u.get("active")}' },
    ],
    rules: [
      {
        id: 'no-mutable-default',
        label: 'Eliminates mutable default `users=[]`',
        hint: 'Replace `users=[]` with `users: list[dict] | None = None`.',
        test: (c) => !/users\s*=\s*\[\s*\]/.test(c) && /None/.test(c),
      },
      {
        id: 'dict-comp',
        label: 'Uses a dictionary comprehension `{k: v for ...}`',
        hint: 'Return `{u["id"]: u["score"] for u in users if u.get("active")}`.',
        test: (c) => /\{[^}]+:[^}]+for\s+.+\s+in\s+users/i.test(c),
      },
      {
        id: 'filter-active',
        label: 'Filters only active users (`if ... active`)',
        hint: 'Add `if u.get("active")` or `if u["active"]` inside the comprehension.',
        test: (c) => /\bif\b[\s\S]*active/i.test(c),
      },
    ],
    referenceSolution: `def active_score_map(users: list[dict] | None = None) -> dict[int, int]:
    if users is None:
        return {}
    return {u["id"]: u["score"] for u in users if u.get("active")}`,
    whyItWorks:
      'Defaulting to `None` prevents shared list state across calls, while the dict comprehension executes in a fast C-level loop with O(n) time.',
  },
  {
    id: 'py-lab-2-modern',
    number: 2,
    language: 'python',
    level: 'Intermediate',
    title: 'Frozen Slotted Dataclass + PEP 695',
    scenario: 'Your analytics worker holds 2 million `Event` objects in RAM and needs a type-safe generic helper `first_or_none[T]` (Python 3.12+ syntax).',
    goal: 'Define an immutable, memory-efficient `@dataclass(frozen=True, slots=True)` and a PEP 695 generic function `def first_or_none[T](...)`.',
    starterCode: `from dataclasses import dataclass

# 1. Add frozen=True and slots=True
@dataclass
class Event:
    id: int
    kind: str

# 2. Write PEP 695 generic function first_or_none[T]`,
    buildingBlocks: [
      { label: '@dataclass(frozen=True, slots=True)', snippet: '@dataclass(frozen=True, slots=True)' },
      { label: 'PEP 695 Generic Signature', snippet: 'def first_or_none[T](items: list[T]) -> T | None:' },
      { label: 'Return Guard', snippet: '    return items[0] if items else None' },
    ],
    rules: [
      {
        id: 'frozen-slots',
        label: 'Uses `@dataclass(frozen=True, slots=True)`',
        hint: 'Pass both `frozen=True` and `slots=True` to `@dataclass(...)`.',
        test: (c) => /@dataclass\s*\([^)]*frozen\s*=\s*True/i.test(c) && /@dataclass\s*\([^)]*slots\s*=\s*True/i.test(c),
      },
      {
        id: 'pep695-generic',
        label: 'Uses PEP 695 inline generic `[T]` syntax',
        hint: 'Write `def first_or_none[T](items: list[T]) -> T | None:`.',
        test: (c) => /def\s+first_or_none\s*\[\s*T\s*\]/.test(c),
      },
      {
        id: 'union-return',
        label: 'Uses modern `T | None` union return type',
        hint: 'Annotate return type as `-> T | None:` and handle empty lists.',
        test: (c) => /T\s*\|\s*None/.test(c) && /return\s+/.test(c),
      },
    ],
    referenceSolution: `from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Event:
    id: int
    kind: str

def first_or_none[T](items: list[T]) -> T | None:
    return items[0] if items else None`,
    whyItWorks:
      '`slots=True` strips the per-instance `__dict__` (~50% RAM savings across 2M objects), `frozen=True` guarantees hashability/immutability, and PEP 695 `[T]` removes `TypeVar` boilerplate.',
  },
  {
    id: 'py-lab-3-asyncio',
    number: 3,
    language: 'python',
    level: 'Advanced',
    title: 'asyncio.TaskGroup + Semaphore Backpressure',
    scenario: 'Your AI RAG ingestor fetches 500 URLs concurrently. Without concurrency limits it triggers HTTP 429 rate limits, and with raw `create_task` errors leak orphan tasks.',
    goal: 'Use `asyncio.Semaphore` and `async with asyncio.TaskGroup() as tg:` to bound concurrency and guarantee structured cleanup.',
    starterCode: `import asyncio

async def fetch_all(urls: list[str]):
    # Add asyncio.Semaphore(10) and async with asyncio.TaskGroup() as tg:
    pass`,
    buildingBlocks: [
      { label: 'Semaphore(10)', snippet: '    sem = asyncio.Semaphore(10)' },
      { label: 'Bounded Worker', snippet: '    async def worker(url: str) -> str:\n        async with sem:\n            await asyncio.sleep(0.01)\n            return url' },
      { label: 'TaskGroup Scope', snippet: '    async with asyncio.TaskGroup() as tg:\n        tasks = [tg.create_task(worker(u)) for u in urls]\n    return [t.result() for t in tasks]' },
    ],
    rules: [
      {
        id: 'semaphore',
        label: 'Creates & acquires `asyncio.Semaphore` via `async with`',
        hint: 'Instantiate `sem = asyncio.Semaphore(10)` and guard work with `async with sem:`.',
        test: (c) => /asyncio\.Semaphore\s*\(\s*\d+\s*\)/.test(c) && /async\s+with\s+sem\b/.test(c),
      },
      {
        id: 'taskgroup',
        label: 'Uses structured `async with asyncio.TaskGroup() as tg:`',
        hint: 'Spawn child tasks inside `async with asyncio.TaskGroup() as tg:`.',
        test: (c) => /async\s+with\s+asyncio\.TaskGroup\s*\(\s*\)\s+as\s+\w+/.test(c),
      },
      {
        id: 'create-task-result',
        label: 'Spawns via `tg.create_task(...)` and collects `.result()`',
        hint: 'Store tasks from `tg.create_task(...)` and return `[t.result() for t in tasks]`.',
        test: (c) => /\.create_task\s*\(/.test(c) && /\.result\s*\(\s*\)/.test(c),
      },
    ],
    referenceSolution: `import asyncio

async def fetch_all(urls: list[str]) -> list[str]:
    sem = asyncio.Semaphore(10)

    async def worker(url: str) -> str:
        async with sem:
            await asyncio.sleep(0.01)
            return url

    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(worker(u)) for u in urls]
    return [t.result() for t in tasks]`,
    whyItWorks:
      '`Semaphore(10)` enforces outbound backpressure while `TaskGroup` guarantees zero orphan tasks if any worker raises an exception.',
  },
  {
    id: 'java-lab-1-sequenced',
    number: 4,
    language: 'java',
    level: 'Basic',
    title: 'Java 21 SequencedCollection & Stream Pipeline',
    scenario: 'Modernize a legacy Java helper to read the latest entry using Java 21’s `getLast()` and filter positive amounts into an immutable list with `.toList()`.',
    goal: 'Use `.getLast()` (JEP 431) and a `.stream().filter(...).toList()` pipeline.',
    starterCode: `import java.util.List;

// 1. Get last element using Java 21 SequencedCollection API
// 2. Return immutable list of amounts > 100 using Streams + .toList()`,
    buildingBlocks: [
      { label: 'getLast() (JEP 431)', snippet: 'Integer latest = amounts.getLast();' },
      { label: 'Stream Filter + toList()', snippet: 'List<Integer> big = amounts.stream()\n    .filter(a -> a > 100)\n    .toList();' },
    ],
    rules: [
      {
        id: 'sequenced-last',
        label: 'Uses Java 21 `.getLast()` instead of `.get(size() - 1)`',
        hint: 'Call `amounts.getLast()` directly.',
        test: (c) => /\.getLast\s*\(\s*\)/.test(c) && !/size\s*\(\s*\)\s*-\s*1/.test(c),
      },
      {
        id: 'stream-filter',
        label: 'Chains `.stream().filter(...)`',
        hint: 'Use `amounts.stream().filter(a -> a > 100)`.',
        test: (c) => /\.stream\s*\(\s*\)[\s\S]*\.filter\s*\(/.test(c),
      },
      {
        id: 'immutable-tolist',
        label: 'Terminates stream cleanly with `.toList()`',
        hint: 'End the pipeline with `.toList();`.',
        test: (c) => /\.toList\s*\(\s*\)/.test(c),
      },
    ],
    referenceSolution: `import java.util.List;

List<Integer> amounts = List.of(40, 120, 850, 210);
Integer latest = amounts.getLast();

List<Integer> highValue = amounts.stream()
    .filter(a -> a > 100)
    .toList();`,
    whyItWorks:
      'JEP 431 eliminates off-by-one `size() - 1` boilerplate, and Stream `.toList()` fuses filtering in a single pass into an unmodifiable list.',
  },
  {
    id: 'java-lab-2-pattern',
    number: 5,
    language: 'java',
    level: 'Intermediate',
    title: 'Sealed Interface + Record Pattern Switch',
    scenario: 'Model a closed set of `Result` variants (`Ok` and `Err`) and dispatch them in an exhaustive Java 21 `switch` expression without a `default` branch.',
    goal: 'Declare `sealed interface Result permits Ok, Err`, define both `record` types, and handle them via `switch` with record deconstruction and a `when` guard.',
    starterCode: `// Define sealed interface Result permits Ok, Err
// Define record Ok(int code, String body) and record Err(String msg)
// Write exhaustive switch (res) with record pattern + when guard`,
    buildingBlocks: [
      { label: 'sealed interface', snippet: 'sealed interface Result permits Ok, Err {}' },
      { label: 'Records', snippet: 'record Ok(int code, String body) implements Result {}\nrecord Err(String msg) implements Result {}' },
      { label: 'Exhaustive switch + when', snippet: 'String format(Result r) {\n    return switch (r) {\n        case Ok(var code, var body) when code == 200 -> "OK: " + body;\n        case Ok(var code, var body) -> "Status " + code;\n        case Err(var msg) -> "Error: " + msg;\n    };\n}' },
    ],
    rules: [
      {
        id: 'sealed-permits',
        label: 'Declares `sealed interface ... permits Ok, Err`',
        hint: 'Write `sealed interface Result permits Ok, Err {}`.',
        test: (c) => /sealed\s+interface\s+\w+\s+permits\s+Ok\s*,\s*Err/.test(c),
      },
      {
        id: 'record-types',
        label: 'Defines immutable `record Ok(...)` and `record Err(...)`',
        hint: 'Implement Result on both `record Ok` and `record Err`.',
        test: (c) => /record\s+Ok\s*\(/.test(c) && /record\s+Err\s*\(/.test(c),
      },
      {
        id: 'pattern-when-exhaustive',
        label: 'Uses `switch` record deconstruction + `when` guard (no `default:`)',
        hint: 'Write `case Ok(var code, var body) when ... ->` and omit `default:`.',
        test: (c) => /switch\s*\(/.test(c) && /case\s+Ok\s*\(/.test(c) && /\bwhen\b/.test(c) && !/\bdefault\s*(->|:)/.test(c),
      },
    ],
    referenceSolution: `sealed interface Result permits Ok, Err {}
record Ok(int code, String body) implements Result {}
record Err(String msg) implements Result {}

String format(Result r) {
    return switch (r) {
        case Ok(var code, var body) when code == 200 -> "OK: " + body;
        case Ok(var code, var body) -> "Status " + code;
        case Err(var msg) -> "Error: " + msg;
    };
}`,
    whyItWorks:
      'Omitting `default:` lets `javac` guarantee at compile time that every permitted variant of `Result` is explicitly handled.',
  },
  {
    id: 'java-lab-3-loom',
    number: 6,
    language: 'java',
    level: 'Advanced',
    title: 'Java 21 Virtual Thread Executor + ReentrantLock',
    scenario: 'A payment gateway spawns 5,000 concurrent HTTP calls. Migrate it from a fixed OS thread pool + `synchronized` block to Java 21 Virtual Threads without carrier thread pinning.',
    goal: 'Use `try (var executor = Executors.newVirtualThreadPerTaskExecutor())` and protect shared state with `ReentrantLock` instead of `synchronized`.',
    starterCode: `import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

// Replace fixed OS pool with try-with-resources Virtual Thread executor
// Guard critical section with ReentrantLock (avoid synchronized pinning!)`,
    buildingBlocks: [
      { label: 'ReentrantLock', snippet: 'var lock = new ReentrantLock();' },
      { label: 'Virtual Thread Executor', snippet: 'try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    executor.submit(() -> {\n        lock.lock();\n        try {\n            // I/O safe critical section (no carrier pinning)\n        } finally {\n            lock.unlock();\n        }\n    });\n}' },
    ],
    rules: [
      {
        id: 'vt-executor',
        label: 'Uses `Executors.newVirtualThreadPerTaskExecutor()` inside `try (...)`',
        hint: 'Wrap `Executors.newVirtualThreadPerTaskExecutor()` in `try-with-resources`.',
        test: (c) => /try\s*\([^)]*Executors\.newVirtualThreadPerTaskExecutor\s*\(\s*\)/.test(c),
      },
      {
        id: 'reentrant-lock',
        label: 'Uses `ReentrantLock` with `try / finally { lock.unlock(); }`',
        hint: 'Acquire `lock.lock()` and always release inside `finally { lock.unlock(); }`.',
        test: (c) => /ReentrantLock/.test(c) && /\.lock\s*\(\s*\)/.test(c) && /finally[\s\S]*\.unlock\s*\(\s*\)/.test(c),
      },
      {
        id: 'no-synchronized',
        label: 'Avoids `synchronized` blocks that pin Java 21 carrier threads',
        hint: 'Do not use `synchronized` around I/O in Java 21 Virtual Threads.',
        test: (c) => !/\bsynchronized\b/.test(c),
      },
    ],
    referenceSolution: `import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

var lock = new ReentrantLock();
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> {
        lock.lock();
        try {
            // Unmounts carrier thread cleanly during blocking I/O
        } finally {
            lock.unlock();
        }
    });
}`,
    whyItWorks:
      '`try-with-resources` waits for all submitted virtual threads to finish before closing, and `ReentrantLock` lets the JVM unmount the virtual thread cleanly instead of pinning the OS carrier thread.',
  },
  {
    id: 'py-lab-4-collections',
    number: 7,
    language: 'python',
    level: 'Intermediate',
    title: 'Collections: Counter, defaultdict & deque',
    scenario: 'An observability pipeline needs an O(1) sliding window of the last 5 latencies (`deque(maxlen=5)`) and a frequency tally of HTTP status codes using `Counter`.',
    goal: 'Import `Counter` and `deque` from `collections`, create a bounded `deque(maxlen=5)`, and return `Counter(statuses).most_common(2)`.',
    starterCode: `from collections import Counter, deque

def summarize(latencies: list[int], statuses: list[int]):
    # 1. Create a bounded deque(maxlen=5) from latencies
    # 2. Compute top 2 statuses with Counter(statuses).most_common(2)
    pass`,
    buildingBlocks: [
      { label: 'Bounded deque', snippet: '    window = deque(latencies, maxlen=5)' },
      { label: 'Counter top 2', snippet: '    top_codes = Counter(statuses).most_common(2)' },
      { label: 'Return Tuple', snippet: '    return list(window), top_codes' },
    ],
    rules: [
      {
        id: 'bounded-deque',
        label: 'Uses `deque(..., maxlen=5)` for O(1) sliding window',
        hint: 'Pass `maxlen=5` to `deque(...)`.',
        test: (c) => /deque\s*\([^)]*maxlen\s*=\s*5/.test(c),
      },
      {
        id: 'counter-most-common',
        label: 'Uses `Counter(...).most_common(2)`',
        hint: 'Call `Counter(statuses).most_common(2)`.',
        test: (c) => /Counter\s*\([^)]*\)[\s\S]*\.most_common\s*\(\s*2\s*\)/.test(c),
      },
      {
        id: 'returns-result',
        label: 'Returns both the window and top status frequencies',
        hint: 'Add `return list(window), top_codes`.',
        test: (c) => /\breturn\b/.test(c),
      },
    ],
    referenceSolution: `from collections import Counter, deque

def summarize(latencies: list[int], statuses: list[int]):
    window = deque(latencies, maxlen=5)
    top_codes = Counter(statuses).most_common(2)
    return list(window), top_codes`,
    whyItWorks:
      '`deque(maxlen=5)` drops expired entries in O(1) time without shifting elements like a list, and `Counter.most_common(2)` uses a C-backed heap selection.',
  },
  {
    id: 'py-lab-5-threading',
    number: 8,
    language: 'python',
    level: 'Advanced',
    title: 'Thread-Safe Counter + ThreadPoolExecutor',
    scenario: 'Multiple worker threads process webhooks concurrently and increment a shared `total` counter. Without a `threading.Lock`, race conditions lose increments.',
    goal: 'Guard shared updates with `with lock:` using `threading.Lock()` and run workers cleanly inside `with ThreadPoolExecutor(max_workers=4) as pool:`.',
    starterCode: `import threading
from concurrent.futures import ThreadPoolExecutor

# 1. Create lock = threading.Lock()
# 2. Protect shared counter increment using with lock:
# 3. Execute tasks inside with ThreadPoolExecutor(max_workers=4) as pool:`,
    buildingBlocks: [
      { label: 'threading.Lock()', snippet: 'lock = threading.Lock()\ntotal = 0' },
      { label: 'Locked Worker', snippet: 'def process(item: int) -> int:\n    global total\n    with lock:\n        total += item\n    return total' },
      { label: 'ThreadPoolExecutor', snippet: 'with ThreadPoolExecutor(max_workers=4) as pool:\n    results = list(pool.map(process, [10, 20, 30, 40]))' },
    ],
    rules: [
      {
        id: 'create-lock',
        label: 'Instantiates `threading.Lock()`',
        hint: 'Create `lock = threading.Lock()`.',
        test: (c) => /threading\.Lock\s*\(\s*\)/.test(c),
      },
      {
        id: 'with-lock',
        label: 'Protects shared mutation using `with lock:` context manager',
        hint: 'Wrap `total += ...` inside `with lock:`.',
        test: (c) => /with\s+lock\s*:/.test(c),
      },
      {
        id: 'thread-pool',
        label: 'Uses `with ThreadPoolExecutor(...) as pool:` for structured shutdown',
        hint: 'Run tasks inside `with ThreadPoolExecutor(max_workers=4) as pool:`.',
        test: (c) => /with\s+ThreadPoolExecutor\s*\([^)]*\)\s+as\s+\w+/.test(c),
      },
    ],
    referenceSolution: `import threading
from concurrent.futures import ThreadPoolExecutor

lock = threading.Lock()
total = 0

def process(item: int) -> int:
    global total
    with lock:
        total += item
    return total

with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(process, [10, 20, 30, 40]))`,
    whyItWorks:
      '`with lock:` guarantees mutual exclusion even across GIL switches and releases the lock on exceptions; `with ThreadPoolExecutor` waits for all threads before exiting.',
  },
  {
    id: 'java-lab-4-collections',
    number: 9,
    language: 'java',
    level: 'Intermediate',
    title: 'ConcurrentHashMap.merge() & ArrayDeque',
    scenario: 'A multi-threaded API gateway counts hits per endpoint safely without check-then-act race conditions and buffers recent request IDs in an O(1) `ArrayDeque`.',
    goal: 'Use `ConcurrentHashMap` with atomic `.merge(key, 1L, Long::sum)` and an `ArrayDeque<String>` with `.offerLast(...)` / `.pollFirst()`.',
    starterCode: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

// 1. Create ConcurrentHashMap<String, Long> and atomically increment via .merge()
// 2. Create Deque<String> using ArrayDeque and enqueue/dequeue in O(1)`,
    buildingBlocks: [
      { label: 'ConcurrentHashMap + merge', snippet: 'var hits = new ConcurrentHashMap<String, Long>();\nhits.merge("/v1/pay", 1L, Long::sum);' },
      { label: 'ArrayDeque FIFO', snippet: 'Deque<String> queue = new ArrayDeque<>();\nqueue.offerLast("req-101");\nString head = queue.pollFirst();' },
    ],
    rules: [
      {
        id: 'chm-merge',
        label: 'Uses `ConcurrentHashMap` with atomic `.merge(..., Long::sum)`',
        hint: 'Call `hits.merge("/v1/pay", 1L, Long::sum);` instead of `get` + `put`.',
        test: (c) => /ConcurrentHashMap/.test(c) && /\.merge\s*\(/.test(c),
      },
      {
        id: 'array-deque',
        label: 'Uses `ArrayDeque` (not legacy `LinkedList`/`Stack`)',
        hint: 'Instantiate `new ArrayDeque<>()`.',
        test: (c) => /new\s+ArrayDeque\s*</.test(c) || /new\s+ArrayDeque\s*\(\s*\)/.test(c),
      },
      {
        id: 'deque-ops',
        label: 'Uses O(1) queue operations (`offerLast`/`pollFirst` or `offer`/`poll`)',
        hint: 'Enqueue with `.offerLast(...)` and dequeue with `.pollFirst()`.',
        test: (c) => /\.(offerLast|offer|addLast)\s*\(/.test(c) && /\.(pollFirst|poll|removeFirst)\s*\(/.test(c),
      },
    ],
    referenceSolution: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

var hits = new ConcurrentHashMap<String, Long>();
hits.merge("/v1/pay", 1L, Long::sum);

Deque<String> queue = new ArrayDeque<>();
queue.offerLast("req-101");
String head = queue.pollFirst();`,
    whyItWorks:
      '`ConcurrentHashMap.merge()` executes atomically per bucket without locking the entire map, and `ArrayDeque` uses a cache-friendly circular array with zero node allocations.',
  },
  {
    id: 'java-lab-5-completablefuture',
    number: 10,
    language: 'java',
    level: 'Advanced',
    title: 'CompletableFuture Parallel Fan-Out + Timeout',
    scenario: 'A checkout API must fetch user credit score and fraud risk in parallel on a bounded `ExecutorService`, combine both results, and enforce a 500ms timeout with a safe fallback.',
    goal: 'Launch two `CompletableFuture.supplyAsync(..., pool)` tasks, join them with `.thenCombine(...)`, and chain `.orTimeout(...)` + `.exceptionally(...)`.',
    starterCode: `import java.util.concurrent.*;

// Fan out two CompletableFuture.supplyAsync calls on a try-with-resources executor
// Combine with .thenCombine(...), guard with .orTimeout(...) and .exceptionally(...)`,
    buildingBlocks: [
      { label: 'Scoped Pool + Futures', snippet: 'try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {\n    var f1 = CompletableFuture.supplyAsync(() -> 780, pool);\n    var f2 = CompletableFuture.supplyAsync(() -> "LOW", pool);' },
      { label: 'thenCombine + Timeout + Fallback', snippet: '    String res = f1.thenCombine(f2, (s, r) -> s + ":" + r)\n        .orTimeout(500, TimeUnit.MILLISECONDS)\n        .exceptionally(ex -> "0:UNKNOWN")\n        .join();\n}' },
    ],
    rules: [
      {
        id: 'supply-async-pool',
        label: 'Passes an explicit executor to `CompletableFuture.supplyAsync(..., pool)`',
        hint: 'Avoid blocking the global `commonPool` by passing your executor as the 2nd argument.',
        test: (c) => /CompletableFuture\.supplyAsync\s*\([^)]+,\s*\w+\s*\)/.test(c),
      },
      {
        id: 'then-combine',
        label: 'Combines parallel futures with `.thenCombine(...)`',
        hint: 'Chain `f1.thenCombine(f2, (a, b) -> ...)`.',
        test: (c) => /\.thenCombine\s*\(/.test(c),
      },
      {
        id: 'timeout-fallback',
        label: 'Enforces SLA via `.orTimeout(...)` and `.exceptionally(...)`',
        hint: 'Chain `.orTimeout(500, TimeUnit.MILLISECONDS)` and `.exceptionally(...)`.',
        test: (c) => /\.orTimeout\s*\(/.test(c) && /\.exceptionally\s*\(/.test(c),
      },
    ],
    referenceSolution: `import java.util.concurrent.*;

try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
    var f1 = CompletableFuture.supplyAsync(() -> 780, pool);
    var f2 = CompletableFuture.supplyAsync(() -> "LOW", pool);

    String res = f1.thenCombine(f2, (score, risk) -> score + ":" + risk)
        .orTimeout(500, TimeUnit.MILLISECONDS)
        .exceptionally(ex -> "0:UNKNOWN")
        .join();
}`,
    whyItWorks:
      'Passing an explicit executor avoids starving `ForkJoinPool.commonPool()`, `thenCombine` runs non-blockingly once both futures complete, and `orTimeout` + `exceptionally` guarantees SLA resilience.',
  },
  ...CORE_PRACTICE_CHALLENGES,
];

export const LANGUAGE_MASTERY_QUIZ: LanguageQuizQuestion[] = [
  {
    id: 'lq-1',
    language: 'python',
    level: 'Basic',
    topic: 'Mutable Default Arguments',
    question: 'What is printed after calling `append_val(1)` then `append_val(2)` on `def append_val(x, box=[]): box.append(x); return box`?',
    options: [
      { id: 'a', text: '[1] then [2] because each call creates a new list' },
      { id: 'b', text: '[1] then [1, 2] because default arguments are evaluated once at function definition' },
      { id: 'c', text: 'TypeError because lists cannot be default parameters' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Python builds the default `[]` list a single time when `def` runs—not on every call—so every call without a second argument mutates the exact same list.',
    technicalNote: 'Default parameter values are stored on `fn.__defaults__`. Always use `box: list[int] | None = None`.',
  },
  {
    id: 'lq-2',
    language: 'python',
    level: 'Intermediate',
    topic: 'Memory Optimization',
    question: 'Why does adding `slots=True` to `@dataclass(frozen=True, slots=True)` dramatically cut RAM when storing 2 million records?',
    options: [
      { id: 'a', text: 'It compresses string fields with gzip automatically' },
      { id: 'b', text: 'It replaces each object’s dynamic per-instance `__dict__` hash table with fixed C-level pointer slots' },
      { id: 'c', text: 'It moves objects directly onto the CPU L1 cache' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Normally every Python object carries its own mini dictionary (`__dict__`) to allow dynamic attributes. `slots=True` turns that off and stores only the declared fields in a tight array.',
    technicalNote: 'Typical RAM savings are 40–55% per instance, plus ~15% faster attribute lookup.',
  },
  {
    id: 'lq-3',
    language: 'python',
    level: 'Advanced',
    topic: 'asyncio Event Loop',
    question: 'An engineer calls `time.sleep(2)` inside a FastAPI `async def` endpoint. What happens to 500 other concurrent requests?',
    options: [
      { id: 'a', text: 'Only that single request pauses; the other 500 keep running' },
      { id: 'b', text: 'All 500 concurrent requests on that worker freeze for 2 seconds because `time.sleep` blocks the event loop thread' },
      { id: 'c', text: 'Python automatically converts `time.sleep` into `asyncio.sleep`' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Because `asyncio` runs all tasks on a single thread, calling a synchronous blocking function stops the entire assembly line for everyone until it finishes.',
    technicalNote: 'Use `await asyncio.sleep(2)` for non-blocking delays or `await asyncio.to_thread(blocking_fn)` for legacy blocking I/O.',
  },
  {
    id: 'lq-4',
    language: 'python',
    level: 'Advanced',
    topic: 'Python 3.13+ Free-Threaded Mode',
    question: 'What major capability does Python 3.13’s experimental free-threaded build (PEP 703 / `python3.13t`) unlock?',
    options: [
      { id: 'a', text: 'True multi-core parallel execution of CPU-bound Python threads without the Global Interpreter Lock (GIL)' },
      { id: 'b', text: 'Automatic translation of Python code into Java bytecode' },
      { id: 'c', text: 'Removing garbage collection completely' },
    ],
    correctOptionId: 'a',
    simpleExplanation: 'By replacing the single global lock with fine-grained per-object locking and biased reference counting, multiple Python threads can finally crunch CPU math on separate cores simultaneously.',
    technicalNote: 'Check `sys._is_gil_enabled()` at runtime and ensure shared mutable structures use proper synchronization.',
  },
  {
    id: 'lq-5',
    language: 'java',
    level: 'Basic',
    topic: 'Java 21 Sequenced Collections',
    question: 'What does `list.reversed()` (introduced in Java 21 JEP 431) return on an `ArrayList` of 1,000,000 elements?',
    options: [
      { id: 'a', text: 'A brand-new copied list allocated in O(n) memory' },
      { id: 'b', text: 'An O(1) live reverse-ordered view backed by the original list with zero copying' },
      { id: 'c', text: 'It mutates the original list in-place permanently' },
    ],
    correctOptionId: 'b',
    simpleExplanation: '`reversed()` creates a lightweight wrapper that reads the same list backwards without duplicating a single element in RAM.',
    technicalNote: 'Part of `SequencedCollection` (JEP 431), alongside `getFirst()`, `getLast()`, `addFirst()`, and `removeLast()`.',
  },
  {
    id: 'lq-6',
    language: 'java',
    level: 'Intermediate',
    topic: 'Sealed Types & Switch Exhaustiveness',
    question: 'Why should you OMIT a `default:` branch when writing a Java 21 `switch` expression over a `sealed interface`?',
    options: [
      { id: 'a', text: '`default:` is illegal syntax in Java 21 switch expressions' },
      { id: 'b', text: 'Omitting `default:` lets `javac` fail compilation immediately whenever a new permitted subtype is added later' },
      { id: 'c', text: 'Omitting `default:` disables null checks' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'A catch-all `default:` silently swallows brand-new types added months later. Leaving it out turns forgotten cases into instant compile-time safety checks.',
    technicalNote: 'Combine `sealed` interfaces, `record` deconstruction (JEP 440), and `case null` for total compile-time domain safety.',
  },
  {
    id: 'lq-7',
    language: 'java',
    level: 'Advanced',
    topic: 'Java 21 Virtual Threads (JEP 444)',
    question: 'Why is `ReentrantLock` preferred over `synchronized` around blocking I/O in Java 21 Virtual Threads?',
    options: [
      { id: 'a', text: '`synchronized` throws an exception on virtual threads' },
      { id: 'b', text: 'In Java 21, blocking inside `synchronized` pins the virtual thread to its OS carrier thread, reducing scalability; `ReentrantLock` unmounts cleanly' },
      { id: 'c', text: '`ReentrantLock` skips all thread synchronization' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Virtual threads scale by stepping off the OS CPU thread while waiting on I/O. In Java 21, `synchronized` glues the virtual thread to the OS thread during I/O; `ReentrantLock` lets it step off cleanly.',
    technicalNote: 'Monitor pinning is tracked with `-Djdk.tracePinnedThreads=full` in Java 21 (and resolved at the JVM level in Java 24 JEP 491).',
  },
  {
    id: 'lq-8',
    language: 'java',
    level: 'Advanced',
    topic: 'Java 21 Generational ZGC',
    question: 'What is the primary engineering benefit of enabling Generational ZGC (`-XX:+UseZGC -XX:+ZGenerational`) in Java 21?',
    options: [
      { id: 'a', text: 'Sub-millisecond (< 0.5 ms) garbage collection pauses alongside higher throughput and lower CPU/RAM overhead on young objects' },
      { id: 'b', text: 'Disables JIT compilation to save startup time' },
      { id: 'c', text: 'Forces all objects onto the stack' },
    ],
    correctOptionId: 'a',
    simpleExplanation: 'Most Java objects die right after a single request finishes. Collecting young objects separately lets ZGC keep pauses under half a millisecond while using far less CPU and memory.',
    technicalNote: 'JEP 439 introduced Generational ZGC in Java 21 LTS, combining weak-generational efficiency with concurrent colored-pointer relocation.',
  },
  {
    id: 'lq-9',
    language: 'python',
    level: 'Intermediate',
    topic: 'Python Collections Performance',
    question: 'Why should you use `collections.deque` instead of a regular `list` for a 500,000-item FIFO work queue?',
    options: [
      { id: 'a', text: '`list` cannot store more than 100,000 elements' },
      { id: 'b', text: '`deque.popleft()` is O(1) via doubly-linked C blocks, whereas `list.pop(0)` shifts every remaining element in O(n) time' },
      { id: 'c', text: '`deque` automatically persists items to SQLite on disk' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Removing index 0 from a Python `list` forces Python to slide all 499,999 remaining pointers one slot to the left. `deque` simply moves a head pointer in constant O(1) time.',
    technicalNote: 'CPython `deque` is implemented as a doubly-linked list of 64-item C pointer blocks, providing O(1) ends and atomic `append`/`popleft`.',
  },
  {
    id: 'lq-10',
    language: 'python',
    level: 'Advanced',
    topic: 'Python Multithreading & Race Conditions',
    question: 'In standard GIL-enabled Python, is `counter += 1` across 4 `threading.Thread` workers guaranteed to be thread-safe without a `Lock`?',
    options: [
      { id: 'a', text: 'Yes, the GIL makes every single line of Python code atomic' },
      { id: 'b', text: 'No—`counter += 1` compiles to multiple bytecode instructions (LOAD, BINARY_OP, STORE), and the GIL can switch threads in between, losing updates' },
      { id: 'c', text: 'Yes, because integers are immutable in Python' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Even though only one thread runs bytecode at a time under the GIL, Thread A can read `counter = 10`, pause before saving `11`, while Thread B also reads `10` and saves `11`—losing one increment!',
    technicalNote: 'Always guard shared read-modify-write state with `with threading.Lock():` or communicate via thread-safe `queue.Queue`.',
  },
  {
    id: 'lq-11',
    language: 'python',
    level: 'Advanced',
    topic: 'Threading vs Multiprocessing vs asyncio',
    question: 'You have a pure-Python CPU-heavy image hashing loop running on standard GIL-enabled Python 3.13. Which concurrency tool gives true multi-core speedup?',
    options: [
      { id: 'a', text: '`asyncio.TaskGroup` on a single event loop' },
      { id: 'b', text: '`ProcessPoolExecutor` (separate OS processes with independent GILs) — or migrating to free-threaded `python3.13t` with threads' },
      { id: 'c', text: 'Spawning 64 `threading.Thread` workers on standard GIL Python' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Standard Python threads take turns on one GIL for CPU bytecode, and `asyncio` uses a single thread. `ProcessPoolExecutor` gives every CPU core its own Python interpreter and GIL.',
    technicalNote: 'Rule of thumb: I/O-bound -> `asyncio` or `ThreadPoolExecutor`; CPU-bound -> `ProcessPoolExecutor`, C/Rust extensions (NumPy), or free-threaded `python3.13t`.',
  },
  {
    id: 'lq-12',
    language: 'java',
    level: 'Intermediate',
    topic: 'Java HashMap Internals',
    question: 'What happens inside a Java 8–21 `HashMap` when 8 or more colliding keys hash into the same bucket (with table capacity >= 64)?',
    options: [
      { id: 'a', text: 'HashMap throws a `HashCollisionException`' },
      { id: 'b', text: 'That bucket’s linked list is automatically converted into a balanced Red-Black Tree (`treeifyBin`), keeping worst-case lookup at O(log n)' },
      { id: 'c', text: 'Old colliding keys are evicted like an LRU cache' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Instead of letting a long linked list slow lookups down to O(n), Java upgrades crowded buckets into a self-balancing tree so searches stay fast even under heavy collisions.',
    technicalNote: '`TREEIFY_THRESHOLD = 8`, `UNTREEIFY_THRESHOLD = 6`, `MIN_TREEIFY_CAPACITY = 64`.',
  },
  {
    id: 'lq-13',
    language: 'java',
    level: 'Advanced',
    topic: 'Java Thread.State Lifecycle',
    question: 'In a Java thread dump (`jstack`), what is the difference between a thread in state `BLOCKED` versus `WAITING`?',
    options: [
      { id: 'a', text: '`BLOCKED` means waiting to enter a `synchronized` monitor lock; `WAITING` means parked indefinitely via `Object.wait()`, `Thread.join()`, or `LockSupport.park()` (including `ReentrantLock`)' },
      { id: 'b', text: '`BLOCKED` means the thread crashed; `WAITING` means it is running on the CPU' },
      { id: 'c', text: 'They are identical aliases in the JVM' },
    ],
    correctOptionId: 'a',
    simpleExplanation: 'Seeing many `BLOCKED` threads points immediately to `synchronized` lock contention. Seeing `WAITING` threads means threads are parked waiting for a signal, queue item, or `ReentrantLock`.',
    technicalNote: 'Timed waits (`Thread.sleep(ms)`, `wait(ms)`, `tryLock(ms)`) appear as `TIMED_WAITING`.',
  },
  {
    id: 'lq-14',
    language: 'java',
    level: 'Advanced',
    topic: 'ConcurrentHashMap Atomicity',
    question: 'Why is `if (!map.containsKey(k)) { map.put(k, compute(k)); }` unsafe on a `ConcurrentHashMap`?',
    options: [
      { id: 'a', text: '`ConcurrentHashMap` does not support `containsKey()`' },
      { id: 'b', text: 'It is a non-atomic check-then-act race: two threads can both see `false` and overwrite each other; use `map.computeIfAbsent(k, ...)` instead' },
      { id: 'c', text: 'It locks the entire JVM heap forever' },
    ],
    correctOptionId: 'b',
    simpleExplanation: 'Even though `containsKey` and `put` are individually thread-safe, combining two separate calls leaves a gap between them where another thread can sneak in.',
    technicalNote: 'Always prefer atomic compound methods: `computeIfAbsent`, `compute`, `merge`, and `putIfAbsent`.',
  },
  ...CORE_QUIZ_QUESTIONS,
];
