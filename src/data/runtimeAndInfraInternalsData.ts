export type InfraCategory = 'compilers-vms' | 'servers-routing' | 'security-edge' | 'data-ai-queues';

export type InfraSimKind =
  | 'compiler-jit'
  | 'load-balancer-router'
  | 'rate-auth-gateway'
  | 'dns-cdn-edge'
  | 'llm-paged-kv'
  | 'kafka-worker-log'
  | 'db-btree-lsm';

export interface ArchDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

export interface ArchDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface ArchDfdStep {
  step: number;
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetLabel: string;
}

export interface InternalAlgorithmSpec {
  name: string;
  complexity: string;
  whereUsed: string;
  plainEnglish: string;
  whyChosen: string;
}

export interface SystemInternalBlueprint {
  id: string;
  shortTitle: string;
  title: string;
  category: InfraCategory;
  simKind: InfraSimKind;
  examples: string;
  tagline: string;
  simpleEnglish: string;
  standardDefinition: string;
  internalDataStructures: string;
  bottleneckAndMitigation: string;
  algorithms: InternalAlgorithmSpec[];
  dfdNodes: ArchDfdNode[];
  dfdEdges: ArchDfdEdge[];
  dfdSteps: ArchDfdStep[];
}

export const INFRA_CATEGORY_META: { id: 'all' | InfraCategory; label: string }[] = [
  { id: 'all', label: 'All 16 Architectures' },
  { id: 'compilers-vms', label: 'Compilers, Interpreters & VMs' },
  { id: 'servers-routing', label: 'Web/App Servers, LB & Routers' },
  { id: 'security-edge', label: 'Auth/IdP, API Gateway, DNS & CDN' },
  { id: 'data-ai-queues', label: 'LLM, Kafka, Databases & Workers' },
];

export const SYSTEM_INTERNAL_BLUEPRINTS: SystemInternalBlueprint[] = [
  /* ==========================================================================
     TRACK A: COMPILERS, INTERPRETERS & VIRTUAL MACHINES
     ========================================================================== */
  {
    id: 'jvm-hotspot',
    shortTitle: 'JVM (HotSpot)',
    title: 'JVM Internal Architecture: ClassLoader, Bytecode Interpreter, C1/C2 Tiered JIT & GC',
    category: 'compilers-vms',
    simKind: 'compiler-jit',
    examples: 'OpenJDK HotSpot, GraalVM, OpenJ9',
    tagline: 'Write-once bytecode compiled adaptively into blazing-fast native machine code at runtime.',
    simpleEnglish:
      'The JVM starts by reading portable .class bytecode instructions line-by-line like a translator reading a script. As it watches your program run, it counts which methods are called thousands of times ("hot spots") and quietly compiles them into raw CPU machine code while a background garbage collector sweeps dead objects.',
    standardDefinition:
      'HotSpot combines a hierarchical ClassLoader subsystem, a bytecode verifier, a template-based interpreter, a 5-tier Just-In-Time (JIT) compiler pipeline (C1 client + C2 server Sea-of-Nodes SSA optimizer), and generational/regional concurrent garbage collectors (G1GC, ZGC) operating over managed Heap, Metaspace, and per-thread JVM Stacks.',
    internalDataStructures:
      'Constant Pool arrays, vtable/itable method dispatch arrays, MethodData profiling counters, Sea-of-Nodes SSA graphs for C2 optimization, Card Tables & Remembered Sets for G1GC, and Colored Pointer metadata bits for ZGC.',
    bottleneckAndMitigation:
      'Cold-start warmup latency (JIT takes seconds to profile hot paths) and GC Stop-The-World pauses -> mitigated via Ahead-Of-Time AppCDS archives, GraalVM native-image, or ZGC sub-millisecond colored-pointer concurrent compaction.',
    algorithms: [
      {
        name: 'Tiered JIT Profiling & Speculative Inlining',
        complexity: 'O(1) hot counter check -> O(n) compile on background thread',
        whereUsed: 'C1 (Tier 3) & C2 (Tier 4) Compiler',
        plainEnglish: 'Counts method calls and loop back-edges; pastes tiny hot methods directly into callers to erase call overhead.',
        whyChosen: 'Beats static AOT on polymorphic code because the JIT observes real runtime types and can deoptimize if assumptions change.',
      },
      {
        name: 'Escape Analysis & Scalar Replacement',
        complexity: 'O(V + E) Connection Graph traversal',
        whereUsed: 'C2 Optimizing Compiler',
        plainEnglish: 'Proves when a newly created object never leaves a method and breaks its fields into raw CPU registers instead of allocating on the Heap.',
        whyChosen: 'Eliminates millions of short-lived heap allocations and drastically cuts Garbage Collector workload.',
      },
      {
        name: 'Tri-Color Concurrent Marking (G1GC / ZGC)',
        complexity: 'O(Live Set) concurrent with mutator threads',
        whereUsed: 'Heap Garbage Collection',
        plainEnglish: 'Paints objects White (unseen), Gray (queued to scan), and Black (reachable) using read/write barriers so application threads barely pause.',
        whyChosen: 'Prevents multi-second Stop-The-World freezes even on 100GB+ enterprise heaps.',
      },
    ],
    dfdNodes: [
      { id: 'src', label: 'ClassLoader & Verify', sublabel: '.class Bytecode', x: 74, y: 112 },
      { id: 'interp', label: 'Interpreter + Profile', sublabel: 'Invocation Count', x: 212, y: 64 },
      { id: 'jit', label: 'C1/C2 Tiered JIT', sublabel: 'SSA + Inlining', x: 356, y: 162 },
      { id: 'codecache', label: 'Native CodeCache', sublabel: 'x86/ARM64 CPU', x: 492, y: 64 },
      { id: 'gc', label: 'Heap & G1/ZGC', sublabel: 'Tri-Color Sweep', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'src', to: 'interp', label: 'Load & Verify' },
      { id: 'e2', from: 'interp', to: 'jit', label: 'Hot Threshold' },
      { id: 'e3', from: 'jit', to: 'codecache', label: 'Emit Native' },
      { id: 'e4', from: 'codecache', to: 'gc', label: 'Alloc / Barrier' },
      { id: 'e5', from: 'codecache', to: 'interp', label: 'Deopt Bailout' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Class Loading, Linking & Bytecode Verification',
        plainEnglish: 'The JVM reads the .class file, checks that it cannot corrupt memory, and loads class metadata into Metaspace.',
        technicalDetail: 'Bootstrap/App ClassLoader parses Constant Pool; StackMapTable verifier proves type safety before execution.',
        activeNodeIds: ['src', 'interp'],
        activeEdgeIds: ['e1'],
        packetLabel: 'LOAD .class',
      },
      {
        step: 2,
        title: 'Template Interpreter & Profiling Counters',
        plainEnglish: 'Methods begin running immediately in the interpreter while recording call counts and actual runtime types.',
        technicalDetail: 'Interpreter increments invocation & backedge counters in MethodData; records monomorphic receiver class for inline caching.',
        activeNodeIds: ['interp', 'jit'],
        activeEdgeIds: ['e2'],
        packetLabel: 'HOT > 10k calls',
      },
      {
        step: 3,
        title: 'C2 Sea-of-Nodes SSA & Escape Analysis',
        plainEnglish: 'A background compiler thread converts hot bytecode into an optimization graph, inlines callees, and removes dead heap allocations.',
        technicalDetail: 'C2 builds SSA IR, runs Global Value Numbering + Escape Analysis, allocates CPU registers, and writes native assembly to CodeCache.',
        activeNodeIds: ['jit', 'codecache'],
        activeEdgeIds: ['e3'],
        packetLabel: 'EMIT x86_64',
      },
      {
        step: 4,
        title: 'Native Execution + Concurrent GC Barrier',
        plainEnglish: 'CPU runs compiled machine instructions at full speed; if an unexpected subclass appears, it safely falls back to the interpreter.',
        technicalDetail: 'TLAB pointer-bump allocation in O(1); ZGC load barrier remaps relocated objects concurrently; uncommon trap triggers deoptimization.',
        activeNodeIds: ['codecache', 'gc'],
        activeEdgeIds: ['e4'],
        packetLabel: 'TLAB + ZGC',
      },
    ],
  },
  {
    id: 'cpython-vm',
    shortTitle: 'CPython 3.13+ VM',
    title: 'CPython 3.13+ Interpreter: PEG Parser, Adaptive Quickening, Copy-and-Patch JIT & No-GIL',
    category: 'compilers-vms',
    simKind: 'compiler-jit',
    examples: 'CPython 3.13+, PyPy (Tracing JIT)',
    tagline: 'Dynamic bytecode VM accelerated by PEP 659 specializing opcodes and experimental free-threaded execution.',
    simpleEnglish:
      'Python reads your .py text into a syntax tree, compiles it into compact bytecode instructions, and executes them in a fast stack loop. In Python 3.11–3.13+, if an instruction keeps seeing integers or the same object attribute, CPython replaces that generic instruction in-place with a specialized fast version!',
    standardDefinition:
      'CPython parses source via a packrat PEG parser (PEP 617) into an AST, emits stack-based bytecode (.pyc), executes inside _PyEval_EvalFrameDefault with PEP 659 adaptive specialization (inline caches) and PEP 744 copy-and-patch JIT stencils, managing memory with immediate Reference Counting + Cyclic Generational GC and optional PEP 703 Free-Threaded (No-GIL) biased refcounting.',
    internalDataStructures:
      'PyObject header structs (ob_refcnt + ob_type*), PyCodeObject bytecode arrays, Inline Cache entries embedded inside bytecode streams, compact split-key hash tables (__dict__), and Mimalloc thread-local arenas in No-GIL mode.',
    bottleneckAndMitigation:
      'Dynamic attribute lookups and Global Interpreter Lock (GIL) serialization on CPU-bound threads -> mitigated via PEP 659 LOAD_ATTR_INSTANCE_VALUE specialization, Copy-and-Patch JIT, C/Rust extensions, and PEP 703 Free-Threaded builds.',
    algorithms: [
      {
        name: 'Packrat PEG Parsing with Memoization',
        complexity: 'O(n) linear time with memo table',
        whereUsed: 'Parser (PEP 617)',
        plainEnglish: 'Parses unambiguous Python grammar rules with infinite lookahead while caching failed parses so it never backtracks exponentially.',
        whyChosen: 'Removed LL(1) grammar hacks and unlocked clean syntax like structural pattern matching (match/case).',
      },
      {
        name: 'PEP 659 Adaptive Specializing Interpreter (Quickening)',
        complexity: 'O(1) opcode rewrite after warmup',
        whereUsed: 'Bytecode Eval Loop',
        plainEnglish: 'Rewrites generic BINARY_OP into BINARY_OP_ADD_INT once it notices you always add two integers at that line.',
        whyChosen: 'Delivers 25–60% speedups without the memory overhead of a massive optimizing JIT compiler.',
      },
      {
        name: 'Biased Reference Counting + Cyclic GC',
        complexity: 'O(1) local inc/dec; O(containers) cycle sweep',
        whereUsed: 'Memory Manager (PEP 703 No-GIL)',
        plainEnglish: 'The thread that owns an object updates its reference count without atomic locks; a background cyclic detector breaks A->B->A loops.',
        whyChosen: 'Allows true multi-core Python threads without paying heavy atomic CPU bus-lock penalties on every variable read.',
      },
    ],
    dfdNodes: [
      { id: 'peg', label: 'PEG Parser -> AST', sublabel: 'Memoized O(n)', x: 74, y: 112 },
      { id: 'bc', label: 'Bytecode Compiler', sublabel: 'PyCodeObject', x: 212, y: 64 },
      { id: 'eval', label: 'Adaptive Eval Loop', sublabel: 'PEP 659 Quickening', x: 356, y: 158 },
      { id: 'jit', label: 'Copy-Patch Stencil', sublabel: 'Tier-2 Micro-Ops', x: 492, y: 64 },
      { id: 'mem', label: 'RefCount + Cyclic GC', sublabel: 'Mimalloc / No-GIL', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'peg', to: 'bc', label: 'AST Nodes' },
      { id: 'e2', from: 'bc', to: 'eval', label: 'Bytecode' },
      { id: 'e3', from: 'eval', to: 'jit', label: 'Hot Trace' },
      { id: 'e4', from: 'eval', to: 'mem', label: 'PyObject Alloc' },
      { id: 'e5', from: 'jit', to: 'mem', label: 'Direct Slot R/W' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'PEG Parsing & AST Compilation',
        plainEnglish: 'Source text is tokenized (including INDENT/DEDENT) and parsed in linear time into an Abstract Syntax Tree.',
        technicalDetail: 'Packrat memoization guarantees O(n) parsing; symbol table classifies local fast-slots (LOAD_FAST) vs global dict lookups.',
        activeNodeIds: ['peg', 'bc'],
        activeEdgeIds: ['e1'],
        packetLabel: 'PARSE AST',
      },
      {
        step: 2,
        title: 'Stack-Based Frame Execution & Quickening',
        plainEnglish: 'The virtual machine pushes and pops object pointers on a frame stack and watches data types at each instruction.',
        technicalDetail: 'After ~8 executions, BINARY_OP specializes to BINARY_OP_ADD_INT with a type guard checked in 1 CPU branch.',
        activeNodeIds: ['bc', 'eval'],
        activeEdgeIds: ['e2'],
        packetLabel: 'QUICKEN OP',
      },
      {
        step: 3,
        title: 'Tier-2 Micro-Op Optimizer & Copy-and-Patch JIT',
        plainEnglish: 'Hot loops are translated into tiny micro-ops and stitched together from pre-compiled machine code templates.',
        technicalDetail: 'LLVM pre-builds C stencils at build time; runtime copies templates and patches immediate constants/addresses in microseconds.',
        activeNodeIds: ['eval', 'jit'],
        activeEdgeIds: ['e3'],
        packetLabel: 'PATCH JIT',
      },
      {
        step: 4,
        title: 'RefCount Deallocation & Cyclic Generation Sweep',
        plainEnglish: 'When a variable goes out of scope its counter hits zero and memory frees immediately; cyclic graphs are collected periodically.',
        technicalDetail: 'Biased refcount avoids atomic RMW for owning thread; immortal objects (None, True, small ints) skip refcount writes entirely.',
        activeNodeIds: ['jit', 'mem'],
        activeEdgeIds: ['e5'],
        packetLabel: 'REFCOUNT 0',
      },
    ],
  },
  {
    id: 'v8-engine',
    shortTitle: 'V8 JS Engine',
    title: 'V8 Engine Internals: Ignition, Hidden Classes (Shapes), Inline Caches & TurboFan JIT',
    category: 'compilers-vms',
    simKind: 'compiler-jit',
    examples: 'V8 (Chrome, Node.js, Deno), JavaScriptCore',
    tagline: 'Turning dynamically typed JavaScript objects into C-struct-speed memory layouts via Hidden Classes.',
    simpleEnglish:
      'JavaScript lets you add properties to objects anytime, which normally forces slow dictionary lookups. V8 secretly assigns every object with the same property order a shared "Hidden Class" (blueprint) so reading obj.x becomes a single fixed-offset memory jump—just like C++ or Java!',
    standardDefinition:
      'V8 parses JS lazily into an AST, generates register-based bytecode for the Ignition interpreter, rapidly compiles warm functions with Sparkplug (baseline) and Maglev (mid-tier SSA), and optimizes hot paths via TurboFan (Sea-of-Nodes) guided by Feedback Vectors and Monomorphic Inline Caches (ICs).',
    internalDataStructures:
      'Hidden Class (Map/Shape) transition trees, Feedback Vector arrays for Inline Caches, Pointer-Compressed 32-bit Heap references, and Orinoco Semi-Space (Young) + Mark-Sweep-Compact (Old) generations.',
    bottleneckAndMitigation:
      'Megamorphic call sites (passing 5+ differently shaped objects into one hot function) defeat Inline Caches -> keep object property initialization order identical in constructors so call sites stay monomorphic.',
    algorithms: [
      {
        name: 'Hidden Class Transition Trees & Inline Caching (IC)',
        complexity: 'O(1) single offset load when monomorphic',
        whereUsed: 'Property Access (obj.x)',
        plainEnglish: 'Caches the exact byte offset of obj.x right at the call site; if the next object shares the same Hidden Class, it skips dictionary lookup.',
        whyChosen: 'Makes dynamic JS property reads up to 20x faster than hash-table lookups.',
      },
      {
        name: '4-Tier Compilation Pipeline (Ignition -> Sparkplug -> Maglev -> TurboFan)',
        complexity: 'Progressive compile cost vs peak throughput',
        whereUsed: 'Execution Engine',
        plainEnglish: 'Balances instant page startup with peak throughput by only spending heavy optimization time on truly hot loops.',
        whyChosen: 'Eliminates the latency cliff between slow interpretation and expensive optimizing compilation.',
      },
      {
        name: 'Cheney Scavenger (Semi-Space Copying GC)',
        complexity: 'O(Surviving Young Objects)',
        whereUsed: 'Young Generation Heap',
        plainEnglish: 'Splits nursery memory in half; copies only live objects to the clean half and wipes the old half in one instant pointer reset.',
        whyChosen: 'Exploits the Generational Hypothesis (90%+ of JS objects die young) for <1ms minor GCs.',
      },
    ],
    dfdNodes: [
      { id: 'parse', label: 'Scanner & PreParser', sublabel: 'Lazy AST Build', x: 74, y: 112 },
      { id: 'ign', label: 'Ignition Bytecode', sublabel: 'Feedback Vector', x: 212, y: 64 },
      { id: 'shape', label: 'Hidden Class + IC', sublabel: 'Shape Offset Map', x: 356, y: 162 },
      { id: 'tf', label: 'Maglev / TurboFan', sublabel: 'Speculative JIT', x: 492, y: 64 },
      { id: 'gc', label: 'Orinoco GC Heap', sublabel: 'Young Scavenger', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'parse', to: 'ign', label: 'Bytecode' },
      { id: 'e2', from: 'ign', to: 'shape', label: 'Record Shape' },
      { id: 'e3', from: 'shape', to: 'tf', label: 'Monomorphic IC' },
      { id: 'e4', from: 'tf', to: 'gc', label: 'Fast Alloc' },
      { id: 'e5', from: 'tf', to: 'ign', label: 'Shape Deopt' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Lazy Parsing & Ignition Bytecode Generation',
        plainEnglish: 'Functions not called immediately are only pre-parsed for syntax; active functions compile into Ignition bytecode.',
        technicalDetail: 'Register-machine bytecode minimizes stack traffic; Feedback Vector allocates IC slots for every property load/call.',
        activeNodeIds: ['parse', 'ign'],
        activeEdgeIds: ['e1'],
        packetLabel: 'BYTECODE',
      },
      {
        step: 2,
        title: 'Hidden Class Assignment & Inline Cache Priming',
        plainEnglish: 'As objects are created with {x, y}, V8 links them to a shared Shape tree and records exact field offsets in the call site.',
        technicalDetail: 'IC transitions: Uninitialized -> Monomorphic (1 shape) -> Polymorphic (2-4 shapes) -> Megamorphic (hash lookup).',
        activeNodeIds: ['ign', 'shape'],
        activeEdgeIds: ['e2'],
        packetLabel: 'SHAPE #42',
      },
      {
        step: 3,
        title: 'Maglev & TurboFan Speculative Optimization',
        plainEnglish: 'TurboFan compiles hot functions assuming shapes never change, unboxing numbers into raw 64-bit CPU floats/ints.',
        technicalDetail: 'Inserts cheap CheckMaps guard; eliminates bounds checks and heap boxing; emits AVX/native machine instructions.',
        activeNodeIds: ['shape', 'tf'],
        activeEdgeIds: ['e3'],
        packetLabel: 'TURBOFAN',
      },
      {
        step: 4,
        title: 'Orinoco Parallel Scavenge & Deoptimization Safety',
        plainEnglish: 'Short-lived objects are swept in parallel in under a millisecond; if a surprise shape arrives, V8 cleanly deoptimizes back to Ignition.',
        technicalDetail: 'Parallel Cheney copy collects Young Gen across helper threads; On-Stack Replacement (OSR) swaps hot loops mid-flight.',
        activeNodeIds: ['tf', 'gc'],
        activeEdgeIds: ['e4'],
        packetLabel: 'SCAVENGE',
      },
    ],
  },
  {
    id: 'aot-llvm-compiler',
    shortTitle: 'LLVM / Rustc / GCC',
    title: 'AOT Native Compiler Architecture: Frontend AST, SSA IR Passes & Graph-Coloring Register Allocator',
    category: 'compilers-vms',
    simKind: 'compiler-jit',
    examples: 'LLVM/Clang, Rustc (MIR + Borrow Checker), GCC, Go gc',
    tagline: 'Multi-pass ahead-of-time compilation turning high-level code into zero-overhead CPU instructions.',
    simpleEnglish:
      'An ahead-of-time compiler works like a 3-stage factory: the Frontend checks grammar and types, the Middle-End simplifies your math and deletes useless work in a universal intermediate language (IR), and the Backend maps variables into the CPU’s scarce hardware registers.',
    standardDefinition:
      'A retargetable 3-phase compiler decouples language frontends (Lexer DFA -> Parser AST -> Type Checker / Borrow Checker) from a target-independent Middle-End (Static Single Assignment IR with Dominator Trees, LICM, GVN, Auto-Vectorization) and hardware Backends (Instruction Selection DAG, Graph-Coloring / Linear-Scan Register Allocation, Peephole Scheduling).',
    internalDataStructures:
      'DFA Token transition tables, Abstract Syntax Trees, Control-Flow Graphs (CFG), Dominator Trees, SSA Def-Use chains, and Interference Graphs for Register Allocation.',
    bottleneckAndMitigation:
      'Full-program Link-Time Optimization (LTO) and heavy monomorphization slow build times -> mitigated via ThinLTO parallel summary indices, incremental query-based compilation (Salsa in rustc), and fast linkers (mold/lld).',
    algorithms: [
      {
        name: 'SSA Construction via Dominance Frontiers (Cytron et al.)',
        complexity: 'O(N + E) near-linear on CFG',
        whereUsed: 'Middle-End Optimizer (LLVM IR)',
        plainEnglish: 'Renames every variable assignment so each variable is assigned exactly once, inserting Phi-nodes where branches merge.',
        whyChosen: 'Makes dataflow optimizations (Constant Propagation, Dead Code Elimination) trivial and blazingly fast.',
      },
      {
        name: 'Chaitin-Briggs Graph-Coloring Register Allocation',
        complexity: 'NP-Complete solved via O(V + E) heuristic simplify/spill',
        whereUsed: 'Backend Code Generator',
        plainEnglish: 'Treats variables alive at the same time as connected graph nodes and colors them using K hardware CPU registers so neighbors never share a register.',
        whyChosen: 'Keeping variables in CPU registers (1 cycle) instead of RAM stack spills (4-200 cycles) is the single biggest speed boost in compiled code.',
      },
      {
        name: 'Loop-Invariant Code Motion (LICM) & SIMD Vectorization',
        complexity: 'O(Loop Depth * Instructions)',
        whereUsed: 'LLVM Loop Optimization Passes',
        plainEnglish: 'Hoists unchanging calculations outside loops and packs 4–8 array additions into a single AVX2/NEON vector CPU instruction.',
        whyChosen: 'Unlocks 4x–8x hardware data-parallelism automatically without hand-written assembly.',
      },
    ],
    dfdNodes: [
      { id: 'front', label: 'Lexer & Parser', sublabel: 'DFA -> AST', x: 74, y: 112 },
      { id: 'sema', label: 'Type / Borrow Check', sublabel: 'CFG / MIR Safety', x: 212, y: 64 },
      { id: 'ssa', label: 'LLVM SSA IR Passes', sublabel: 'LICM / GVN / SIMD', x: 356, y: 162 },
      { id: 'reg', label: 'Register Allocator', sublabel: 'Graph Coloring', x: 492, y: 64 },
      { id: 'bin', label: 'ELF / Mach-O Binary', sublabel: 'Zero-Overhead', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'front', to: 'sema', label: 'AST Tree' },
      { id: 'e2', from: 'sema', to: 'ssa', label: 'Typed IR' },
      { id: 'e3', from: 'ssa', to: 'reg', label: 'Optimized IR' },
      { id: 'e4', from: 'reg', to: 'bin', label: 'Machine Code' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Lexical Analysis (DFA) & AST Construction',
        plainEnglish: 'Raw characters are grouped into tokens (keywords, numbers, operators) and structured into a syntax tree.',
        technicalDetail: 'Deterministic Finite Automaton scans UTF-8 bytes; recursive descent / Pratt parser builds AST with precedence.',
        activeNodeIds: ['front', 'sema'],
        activeEdgeIds: ['e1'],
        packetLabel: 'BUILD AST',
      },
      {
        step: 2,
        title: 'Semantic Analysis, Type Inference & Borrow Checking',
        plainEnglish: 'Verifies types match and (in Rust) proves mathematically that no pointer outlives its data or races across threads.',
        technicalDetail: 'Hindley-Milner unification infers generic types; Non-Lexical Lifetimes (NLL) runs dataflow liveness over MIR CFG.',
        activeNodeIds: ['sema', 'ssa'],
        activeEdgeIds: ['e2'],
        packetLabel: 'LOWER SSA',
      },
      {
        step: 3,
        title: 'Target-Independent SSA Optimization Pipeline',
        plainEnglish: 'Deletes dead branches, folds constants, hoists loop invariants, and fuses adjacent loops into SIMD vector instructions.',
        technicalDetail: 'Passes: mem2reg -> InstCombine -> GVN -> LICM -> LoopVectorize -> Inliner over LLVM SSA Bitcode.',
        activeNodeIds: ['ssa', 'reg'],
        activeEdgeIds: ['e3'],
        packetLabel: 'OPT -O3',
      },
      {
        step: 4,
        title: 'Instruction Selection, Graph-Coloring RegAlloc & Linking',
        plainEnglish: 'Maps virtual variables into physical CPU registers (RAX, RBX, XMM0) and emits the final native executable binary.',
        technicalDetail: 'SelectionDAG selects ISA opcodes; greedy graph-coloring assigns registers with minimal stack spills; lld links ELF binary.',
        activeNodeIds: ['reg', 'bin'],
        activeEdgeIds: ['e4'],
        packetLabel: 'EMIT ELF',
      },
    ],
  },

  /* ==========================================================================
     TRACK B: WEB SERVERS, APPLICATION SERVERS, LOAD BALANCERS & ROUTERS
     ========================================================================== */
  {
    id: 'web-server-reactor',
    shortTitle: 'Web Server (Nginx)',
    title: 'Web Server Internals: Event-Driven epoll/kqueue Reactor & Zero-Copy Static Serving',
    category: 'servers-routing',
    simKind: 'load-balancer-router',
    examples: 'Nginx, Envoy, Caddy, HAProxy',
    tagline: 'Serving 100,000+ concurrent TCP/TLS sockets per server using 1 non-blocking event loop per CPU core.',
    simpleEnglish:
      'Instead of hiring one waiter (OS thread) per customer who stands idle waiting for food, Nginx puts one super-fast waiter per CPU core who watches a ringing bell board (epoll). Whenever any of 50,000 sockets has bytes ready, that waiter handles it in microseconds and moves to the next!',
    standardDefinition:
      'A master-worker non-blocking Reactor architecture pins one single-threaded event loop per CPU core, multiplexing tens of thousands of sockets via Linux epoll (Red-Black Tree + Ready Linked List) or io_uring, terminating TLS with session resumption, and transferring static files via kernel sendfile() zero-copy DMA.',
    internalDataStructures:
      'Kernel epoll Red-Black Tree (watched FDs) + Ready Doubly-Linked List, Non-blocking Socket Ring Buffers, Timer Red-Black Tree / Hashed Timing Wheel for keep-alive timeouts, and Connection Pool Slab Allocator.',
    bottleneckAndMitigation:
      'Blocking disk I/O or synchronous Lua/C modules inside the single worker thread stalls all other connections on that core -> offload blocking work to thread pools (aio threads) or async upstream sockets.',
    algorithms: [
      {
        name: 'epoll / kqueue O(1) Event Multiplexing',
        complexity: 'O(1) ready-event dequeue; O(log N) FD registration',
        whereUsed: 'OS Kernel <-> Worker Loop',
        plainEnglish: 'Kernel notifies the worker only about sockets that actually have new data instead of scanning all 50,000 idle sockets.',
        whyChosen: 'Solved the classic C10K problem where O(N) select()/poll() burned 100% CPU scanning idle sockets.',
      },
      {
        name: 'Zero-Copy sendfile() & DMA Scatter-Gather',
        complexity: 'O(1) syscall; 0 user-space copies',
        whereUsed: 'Static Asset & Media Streaming',
        plainEnglish: 'Tells the OS kernel to push file bytes straight from Disk Page Cache to the Network Card without copying them into user RAM.',
        whyChosen: 'Cuts CPU utilization and memory bandwidth in half under heavy static traffic.',
      },
      {
        name: 'Hashed Timing Wheel (Keep-Alive & Read Timeouts)',
        complexity: 'O(1) timer insert/cancel',
        whereUsed: 'Connection Lifecycle Manager',
        plainEnglish: 'Organizes thousands of socket timeout timers into circular clock buckets so expiring idle connections costs O(1).',
        whyChosen: 'Avoids O(log N) heap churn when tens of thousands of connections reset timers every second.',
      },
    ],
    dfdNodes: [
      { id: 'nic', label: 'NIC & Kernel TCP', sublabel: 'SYN / TLS 1.3', x: 74, y: 112 },
      { id: 'epoll', label: 'epoll Ready List', sublabel: 'RB-Tree + O(1)', x: 212, y: 64 },
      { id: 'worker', label: 'Worker Event Loop', sublabel: '1 Core / Non-Block', x: 356, y: 162 },
      { id: 'parse', label: 'HTTP/2-3 FSM', sublabel: 'Zero-Alloc Parse', x: 492, y: 64 },
      { id: 'up', label: 'sendfile / Upstream', sublabel: 'DMA / Keep-Alive', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'nic', to: 'epoll', label: 'IRQ -> Ready' },
      { id: 'e2', from: 'epoll', to: 'worker', label: 'epoll_wait()' },
      { id: 'e3', from: 'worker', to: 'parse', label: 'Read Buffer' },
      { id: 'e4', from: 'parse', to: 'up', label: 'Proxy / Static' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'TCP Handshake & Kernel Socket Buffer Arrival',
        plainEnglish: 'Network card writes incoming packets via DMA into kernel memory and marks the socket ready in epoll.',
        technicalDetail: 'SO_REUSEPORT distributes incoming connections evenly across worker cores without thundering-herd lock contention.',
        activeNodeIds: ['nic', 'epoll'],
        activeEdgeIds: ['e1'],
        packetLabel: 'FD READY',
      },
      {
        step: 2,
        title: 'Non-Blocking epoll_wait() Batch Dequeue',
        plainEnglish: 'The pinned worker thread grabs all ready sockets in a single syscall and processes them sequentially with zero lock overhead.',
        technicalDetail: 'Edge-triggered (EPOLLET) mode wakes worker once per state change; drains socket until EAGAIN.',
        activeNodeIds: ['epoll', 'worker'],
        activeEdgeIds: ['e2'],
        packetLabel: 'BATCH 64 FDs',
      },
      {
        step: 3,
        title: 'Zero-Allocation HTTP/2 & HTTP/3 State Machine',
        plainEnglish: 'Parses HTTP headers directly inside the input buffer using pointer slices without allocating temporary strings.',
        technicalDetail: 'HPACK/QPACK header decompression; multiplexes concurrent streams over a single TCP/QUIC connection.',
        activeNodeIds: ['worker', 'parse'],
        activeEdgeIds: ['e3'],
        packetLabel: 'PARSE FSM',
      },
      {
        step: 4,
        title: 'Zero-Copy Static Transfer or Pooled Upstream Proxy',
        plainEnglish: 'Serves static files straight from OS Page Cache or forwards dynamic API requests over warm pooled upstream connections.',
        technicalDetail: 'sendfile() DMA bypasses user-space buffers; upstream keepalive pool eliminates per-request TCP/TLS handshakes.',
        activeNodeIds: ['parse', 'up'],
        activeEdgeIds: ['e4'],
        packetLabel: 'DMA / PROXY',
      },
    ],
  },
  {
    id: 'app-server-runtime',
    shortTitle: 'App Server (Tomcat/Netty)',
    title: 'Application Server Internals: Thread-per-Request (Tomcat/Gunicorn) vs Async Reactor (Netty/Uvicorn)',
    category: 'servers-routing',
    simKind: 'load-balancer-router',
    examples: 'Tomcat, Netty, Jetty, Uvicorn (ASGI), Gunicorn (WSGI), Kestrel',
    tagline: 'Bridging raw HTTP sockets into application business logic, DI containers, middleware chains, and DB pools.',
    simpleEnglish:
      'While a Web Server excels at raw sockets and static bytes, an Application Server runs your Java/Python code. Classic servers (Tomcat) hand each request to a worker thread from a pool (or a lightweight Java 21 Virtual Thread), while reactive servers (Netty/Uvicorn) run async coroutines on a tiny event-loop pool.',
    standardDefinition:
      'Application servers decouple network acceptors (Acceptor/Boss EventLoop) from request execution (Bounded Worker ThreadPool, Java 21 Virtual Thread Carrier Pool, or Async EventLoop + Coroutine Scheduler), orchestrating filter/middleware chains, serialization, transaction boundaries, and bounded backpressure queues.',
    internalDataStructures:
      'Bounded BlockingQueue (work queue), ThreadPoolExecutor worker set, Netty ByteBuf pooled arena slabs (jemalloc-style), Asyncio Ready/Scheduled Task Deques, and ThreadLocal / ScopedValue request context maps.',
    bottleneckAndMitigation:
      'Thread-pool exhaustion when downstream DB/API slows down (Little’s Law queue explosion) -> apply strict bounded queues, timeouts, bulkhead isolation, or switch to Java 21 Virtual Threads / async non-blocking I/O.',
    algorithms: [
      {
        name: 'Boss-Worker Multi-Reactor Pattern (Netty)',
        complexity: 'O(1) channel handoff across lock-free MPSC queue',
        whereUsed: 'Acceptor -> I/O Worker Loop',
        plainEnglish: 'One small Boss loop only accepts new TCP connections and round-robins them to N Worker loops that handle reads/writes.',
        whyChosen: 'Prevents heavy request processing from delaying new TCP connection accepts.',
      },
      {
        name: 'Bounded Queue + Backpressure Admission Control',
        complexity: 'O(1) enqueue/reject',
        whereUsed: 'Tomcat / ThreadPoolExecutor',
        plainEnglish: 'Caps waiting requests in memory; when full, fails fast with HTTP 503 instead of letting RAM grow until OutOfMemoryError.',
        whyChosen: 'Keeps p99 latency bounded and preserves server stability during traffic spikes.',
      },
      {
        name: 'Work-Stealing ForkJoin Carrier Scheduler (Java 21 Virtual Threads)',
        complexity: 'O(1) local deque push/pop',
        whereUsed: 'Virtual Thread Runtime',
        plainEnglish: 'Unmounts blocked virtual threads onto heap continuations in nanoseconds so 100,000 blocking HTTP/DB calls run on 8 OS threads.',
        whyChosen: 'Combines easy sequential code readability with async Reactor scalability.',
      },
    ],
    dfdNodes: [
      { id: 'acc', label: 'Acceptor / Boss', sublabel: 'Accept TCP Socket', x: 74, y: 112 },
      { id: 'q', label: 'Bounded Work Queue', sublabel: 'Backpressure Cap', x: 212, y: 64 },
      { id: 'exec', label: 'Thread / Async Pool', sublabel: 'Carrier / EventLoop', x: 356, y: 162 },
      { id: 'mw', label: 'Middleware & DI', sublabel: 'Auth / JSON / Tx', x: 492, y: 64 },
      { id: 'db', label: 'DB Pool & Downstream', sublabel: 'HikariCP / AsyncPG', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'acc', to: 'q', label: 'Dispatch Req' },
      { id: 'e2', from: 'q', to: 'exec', label: 'Assign Worker' },
      { id: 'e3', from: 'exec', to: 'mw', label: 'Filter Chain' },
      { id: 'e4', from: 'mw', to: 'db', label: 'Checkout Conn' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Socket Accept & Connection Handoff',
        plainEnglish: 'The Acceptor thread takes a new connection and drops it into a bounded work queue or assigns it to an I/O EventLoop.',
        technicalDetail: 'Netty BossEventLoop registers channel on Worker NioEventLoop; Tomcat NioEndpoint hands PollerEvent to Executor.',
        activeNodeIds: ['acc', 'q'],
        activeEdgeIds: ['e1'],
        packetLabel: 'ENQUEUE',
      },
      {
        step: 2,
        title: 'Worker Thread / Coroutine Scheduling',
        plainEnglish: 'An idle worker thread (or virtual thread / asyncio coroutine) picks up the request and binds its request context.',
        technicalDetail: 'ScopedValue / ContextVar propagates TraceID cleanly across child tasks without ThreadLocal memory leaks.',
        activeNodeIds: ['q', 'exec'],
        activeEdgeIds: ['e2'],
        packetLabel: 'SCHEDULE',
      },
      {
        step: 3,
        title: 'Middleware Chain, Deserialization & Business Controller',
        plainEnglish: 'Runs logging, auth filters, and JSON parsing before invoking your controller method.',
        technicalDetail: 'Chain-of-Responsibility filter pipeline; pooled ByteBuf / Pydantic v2 Rust validator parses JSON with minimal GC churn.',
        activeNodeIds: ['exec', 'mw'],
        activeEdgeIds: ['e3'],
        packetLabel: 'RUN HANDLER',
      },
      {
        step: 4,
        title: 'Connection Pool Checkout & Non-Blocking Yield',
        plainEnglish: 'Checks out a warm DB socket; while waiting for SQL results, the carrier thread or event loop immediately serves other requests.',
        technicalDetail: 'HikariCP lock-free ConcurrentBag checks out connection in <5us; virtual thread unmounts stack chunk on socket park.',
        activeNodeIds: ['mw', 'db'],
        activeEdgeIds: ['e4'],
        packetLabel: 'POOL I/O',
      },
    ],
  },
  {
    id: 'load-balancer',
    shortTitle: 'Load Balancer (L4/L7)',
    title: 'Load Balancer Internals: Maglev Consistent Hashing, Power-of-Two-Choices & Health Probes',
    category: 'servers-routing',
    simKind: 'load-balancer-router',
    examples: 'Google Maglev (L4), AWS ALB/NLB, Envoy, HAProxy, NGINX Plus',
    tagline: 'Distributing millions of packets/requests per second evenly across dynamic fleets while isolating failing nodes.',
    simpleEnglish:
      'A Load Balancer is the traffic controller standing in front of your backend servers. Instead of sending every request to one busy machine, it picks the healthiest, least-loaded backend in microseconds—and if a server crashes, it silently stops sending traffic there.',
    standardDefinition:
      'L4 Load Balancers operate at TCP/UDP packet level using ECMP + Maglev Consistent Hashing (Direct Server Return) for line-rate forwarding without stateful connection tables; L7 Load Balancers terminate HTTP/TLS and apply Power-of-Two-Choices (P2C) Least-Request, Smooth Weighted Round-Robin, Outlier Detection, and Slow-Start ramp-up.',
    internalDataStructures:
      'Maglev Lookup Table (prime-sized 65,537 slot array), Consistent Hash Ring (Sorted Array + Binary Search), EWMA Latency Ring Buffers per backend, and Atomic Active-Connection Counters.',
    bottleneckAndMitigation:
      'Herd effect (every stateless LB picking the exact same "least-loaded" server simultaneously) -> solved mathematically by Power-of-Two-Choices (P2C): randomly sample 2 healthy backends and pick the less busy one.',
    algorithms: [
      {
        name: 'Power of Two Choices (P2C) Least-Loaded',
        complexity: 'O(1) time (2 random probes)',
        whereUsed: 'Envoy / NGINX / Linkerd L7 LB',
        plainEnglish: 'Picks 2 healthy servers at random and routes to whichever has fewer active requests or lower EWMA latency.',
        whyChosen: 'Reduces maximum queue length exponentially from O(log N) to O(log log N) while avoiding herd-effect stampedes.',
      },
      {
        name: 'Maglev Consistent Hashing Table',
        complexity: 'O(1) packet lookup; O(M log M) table rebuild',
        whereUsed: 'L4 Stateless Load Balancers (Google Maglev / Cilium)',
        plainEnglish: 'Builds a giant lookup table so the same TCP 5-tuple always hits the same backend even without shared state across LB nodes.',
        whyChosen: 'When a backend dies, <1% of existing TCP connections get disrupted while load stays almost perfectly uniform.',
      },
      {
        name: 'Smooth Weighted Round Robin (Nginx SWRR)',
        complexity: 'O(N) or O(log N) heap',
        whereUsed: 'Heterogeneous server weights (e.g. 5:1:1)',
        plainEnglish: 'Interleaves weighted servers smoothly (A, B, A, C, A, A, A -> A, B, A, C, A, A...) instead of bursting 5 straight requests to server A.',
        whyChosen: 'Prevents micro-bursts on high-weight instances.',
      },
    ],
    dfdNodes: [
      { id: 'vip', label: 'Anycast VIP / ECMP', sublabel: 'L4 Packet Entry', x: 74, y: 112 },
      { id: 'hc', label: 'Health & Outlier Map', sublabel: 'Active + Passive', x: 212, y: 64 },
      { id: 'algo', label: 'P2C / Maglev Engine', sublabel: 'O(1) Backend Pick', x: 356, y: 162 },
      { id: 'pool', label: 'Backend Fleet', sublabel: 'Slow-Start Ramp', x: 492, y: 64 },
      { id: 'ewma', label: 'EWMA Telemetry', sublabel: 'Latency Feedback', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'vip', to: 'hc', label: 'Filter Healthy' },
      { id: 'e2', from: 'hc', to: 'algo', label: 'Healthy Set' },
      { id: 'e3', from: 'algo', to: 'pool', label: 'Forward Req' },
      { id: 'e4', from: 'pool', to: 'ewma', label: 'RTT + 5xx' },
      { id: 'e5', from: 'ewma', to: 'hc', label: 'Eject Outlier' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Anycast VIP & ECMP Fleet Entry',
        plainEnglish: 'BGP routers spray incoming packets across multiple stateless LB instances sharing one Virtual IP.',
        technicalDetail: 'ECMP hashes 5-tuple (srcIP, dstIP, srcPort, dstPort, proto) across active LB blades at line rate.',
        activeNodeIds: ['vip', 'hc'],
        activeEdgeIds: ['e1'],
        packetLabel: 'VIP INGRESS',
      },
      {
        step: 2,
        title: 'Healthy Pool Filtering & Passive Outlier Ejection',
        plainEnglish: 'Any backend failing health pings or throwing consecutive HTTP 500s is temporarily quarantined out of rotation.',
        technicalDetail: 'Panic threshold protects against total outage: if >50% backends fail checks, LB routes to all to prevent cascading collapse.',
        activeNodeIds: ['hc', 'algo'],
        activeEdgeIds: ['e2'],
        packetLabel: 'HEALTHY SET',
      },
      {
        step: 3,
        title: 'P2C / Maglev Target Selection',
        plainEnglish: 'Samples two healthy backends at random and picks the one with lower active requests and EWMA response time.',
        technicalDetail: 'Peak-EWMA tracks recent RTT weighted exponentially so slow garbage-collecting nodes lose traffic immediately.',
        activeNodeIds: ['algo', 'pool'],
        activeEdgeIds: ['e3'],
        packetLabel: 'P2C PICK',
      },
      {
        step: 4,
        title: 'Response Telemetry Feedback Loop',
        plainEnglish: 'Measures response latency and status code to continuously tune backend weights in real time.',
        technicalDetail: 'Updates atomic inflight counter and EWMA score; consecutive 5xx trips outlier circuit breaker.',
        activeNodeIds: ['pool', 'ewma'],
        activeEdgeIds: ['e4'],
        packetLabel: 'EWMA UPDATE',
      },
    ],
  },
  {
    id: 'dynamic-router-mesh',
    shortTitle: 'Dynamic Router & Mesh',
    title: 'Dynamic Router & Service Mesh: Compressed Radix Trie, Envoy xDS Control Plane & Canary Splits',
    category: 'servers-routing',
    simKind: 'load-balancer-router',
    examples: 'Envoy xDS, Traefik, Go httprouter/Gin, Istio Service Mesh',
    tagline: 'O(k) URL path matching with zero-downtime live route table hot-reloads and weighted canary rollouts.',
    simpleEnglish:
      'When a request arrives for /api/v2/orders/482/items, a Dynamic Router does not loop through 500 regex rules. It walks a compressed prefix tree (Radix Trie) character chunk by chunk in nanoseconds—and updates routing rules live via a control plane without ever restarting!',
    standardDefinition:
      'High-performance HTTP routers compile route tables into a Compressed Radix Tree (Patricia Trie) with parameter capture nodes (:id, *wild), paired with an atomic Read-Copy-Update (RCU) pointer swap driven by an xDS gRPC Control Plane for zero-downtime route updates, canary traffic mirroring, and retry/circuit-breaker policies.',
    internalDataStructures:
      'Compressed Radix Tree (Patricia Trie) per HTTP method, Atomic RCU Immutable Route Snapshot pointer, Weighted Alias Table for Canary Splits, and Half-Open Circuit Breaker FSM.',
    bottleneckAndMitigation:
      'Linear regex routing degrades O(R) with thousands of routes and causes lock contention on hot reloads -> compile routes into a Radix Trie and publish updates via lock-free atomic pointer swaps (RCU).',
    algorithms: [
      {
        name: 'Compressed Radix Tree (Patricia Trie)',
        complexity: 'O(k) where k = URL path length (independent of # routes!)',
        whereUsed: 'URL Path & Prefix Matching',
        plainEnglish: 'Merges shared URL prefixes like /api/v2/ into single edges so matching 10,000 routes is as fast as matching 10.',
        whyChosen: 'Zero allocations per lookup and predictable microsecond routing latency.',
      },
      {
        name: 'Atomic Read-Copy-Update (RCU) Route Snapshot',
        complexity: 'O(1) lock-free read; O(R) background rebuild',
        whereUsed: 'Control Plane -> Data Plane Live Reload',
        plainEnglish: 'Builds the new routing tree completely in the background, then flips a single atomic pointer so in-flight requests never block.',
        whyChosen: 'Enables 100+ route deployments per day with zero dropped packets or mutex stalls.',
      },
      {
        name: 'Deterministic Hash Canary & Traffic Shadowing',
        complexity: 'O(1) MurmurHash3 modulo 10,000',
        whereUsed: 'Progressive Delivery (1% -> 10% -> 100%)',
        plainEnglish: 'Hashes user_id so the same user consistently sees Canary v2 (sticky) while 95% of users stay safely on Stable v1.',
        whyChosen: 'Prevents flickering UI/API behavior during incremental rollouts.',
      },
    ],
    dfdNodes: [
      { id: 'cp', label: 'xDS Control Plane', sublabel: 'gRPC Push Delta', x: 74, y: 112 },
      { id: 'rcu', label: 'Atomic RCU Snapshot', sublabel: 'Lock-Free Swap', x: 212, y: 64 },
      { id: 'trie', label: 'Radix Trie Matcher', sublabel: 'O(k) Path Match', x: 356, y: 162 },
      { id: 'split', label: 'Canary / Header Rule', sublabel: '95% v1 / 5% v2', x: 492, y: 64 },
      { id: 'cb', label: 'Circuit Breaker', sublabel: 'Closed/Open/Half', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'cp', to: 'rcu', label: 'Compile Trie' },
      { id: 'e2', from: 'rcu', to: 'trie', label: 'Read Snapshot' },
      { id: 'e3', from: 'trie', to: 'split', label: 'Extract :id' },
      { id: 'e4', from: 'split', to: 'cb', label: 'Route Target' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Control Plane Pushes Delta Route Config (xDS)',
        plainEnglish: 'When a new microservice deploys, the Control Plane streams the updated route rules to every proxy over gRPC.',
        technicalDetail: 'Envoy ADS/RDS delta stream pushes only changed VirtualHost/Route entries; worker builds immutable Radix Trie off-path.',
        activeNodeIds: ['cp', 'rcu'],
        activeEdgeIds: ['e1'],
        packetLabel: 'xDS PUSH',
      },
      {
        step: 2,
        title: 'Lock-Free RCU Pointer Swap',
        plainEnglish: 'The router atomically switches incoming traffic to the fresh routing tree without pausing active requests.',
        technicalDetail: 'Atomic pointer exchange (std::atomic / ArcSwap); old snapshot frees once in-flight epoch counters drain.',
        activeNodeIds: ['rcu', 'trie'],
        activeEdgeIds: ['e2'],
        packetLabel: 'RCU SWAP',
      },
      {
        step: 3,
        title: 'O(k) Radix Trie Path & Param Extraction',
        plainEnglish: 'Walks the compressed prefix edges for GET /orders/:id in nanoseconds with zero regex backtracking.',
        technicalDetail: 'Static edges checked before param (:id) and wildcard (*) edges; captures slices directly from request buffer.',
        activeNodeIds: ['trie', 'split'],
        activeEdgeIds: ['e3'],
        packetLabel: 'MATCH O(k)',
      },
      {
        step: 4,
        title: 'Canary Weight Evaluation & Circuit Breaker Guard',
        plainEnglish: 'Routes 5% of hashed users to Canary v2 while wrapping the call in retry budgets and a circuit breaker.',
        technicalDetail: 'Retry budget caps retries at <=20% of active traffic to prevent retry storms; circuit breaker trips on error threshold.',
        activeNodeIds: ['split', 'cb'],
        activeEdgeIds: ['e4'],
        packetLabel: 'CANARY 5%',
      },
    ],
  },

  /* ==========================================================================
     TRACK C: AUTHENTICATOR / IDP, API GATEWAY, DNS & CDN
     ========================================================================== */
  {
    id: 'authenticator-idp',
    shortTitle: 'Authenticator & IdP',
    title: 'Authenticator & Identity Provider: OAuth 2.1, OIDC, PKCE, Asymmetric JWT & JWKS Rotation',
    category: 'security-edge',
    simKind: 'rate-auth-gateway',
    examples: 'Keycloak, Auth0, Okta, Cognito, Google Identity',
    tagline: 'Zero-trust stateless verification with asymmetric cryptography, short-lived tokens, and instant revocation.',
    simpleEnglish:
      'Think of an Identity Provider (IdP) like a passport office. You prove who you are once (with password/passkey + MFA), and it stamps a tamper-proof digital passport (JWT) signed with its private key. Every microservice verifies that stamp locally using the public key without calling the passport office on every click!',
    standardDefinition:
      'Modern authentication implements OAuth 2.1 Authorization Code Flow with PKCE (SHA-256 code_verifier/code_challenge), OpenID Connect (OIDC) ID Tokens, RS256/EdDSA asymmetric JWT signing backed by cached JWKS key-ID (kid) sets, rotating Refresh Tokens with reuse detection, and Redis Bloom/Set revocation lists for high-risk logout.',
    internalDataStructures:
      'JWKS Public Key Hash Map (kid -> PublicKey), Argon2id / bcrypt salted password hashes, Rotating Refresh Token Family Trees (for theft detection), and Redis TTL Revocation Sets / Bloom Filters.',
    bottleneckAndMitigation:
      'Stateless JWTs cannot be revoked immediately before expiry -> keep access tokens short-lived (5–15 min), pair with rotating refresh tokens with reuse-detection family revocation, and check a fast in-memory/Redis revocation Bloom filter for sensitive endpoints.',
    algorithms: [
      {
        name: 'PKCE (Proof Key for Code Exchange — SHA-256)',
        complexity: 'O(1) hash verification',
        whereUsed: 'OAuth 2.1 Login Handshake',
        plainEnglish: 'Client sends a locked hash upfront and reveals the secret key later, proving the app exchanging the auth code is the same app that started login.',
        whyChosen: 'Stops authorization-code interception attacks on mobile apps and SPAs without needing a client secret.',
      },
      {
        name: 'EdDSA / RS256 Asymmetric Signature Verification',
        complexity: 'O(1) ~0.05ms local CPU verification',
        whereUsed: 'API Gateway & Microservice Auth Filter',
        plainEnglish: 'Only the IdP holds the Private Key to sign tokens, while every service caches the Public Key (JWKS) to verify tokens locally.',
        whyChosen: 'Eliminates central auth-database bottlenecks at 100k+ RPS.',
      },
      {
        name: 'Argon2id Memory-Hard Password Hashing',
        complexity: 'Tunable memory (64MB+) + time cost',
        whereUsed: 'Credential Vault / Login Verify',
        plainEnglish: 'Forces both high RAM and CPU work per guess so GPU/ASIC crackers cannot brute-force leaked password tables.',
        whyChosen: 'Winner of the Password Hashing Competition; resistant to both GPU cracking and side-channel attacks.',
      },
    ],
    dfdNodes: [
      { id: 'cli', label: 'Client + PKCE', sublabel: 'SHA256 Challenge', x: 74, y: 112 },
      { id: 'idp', label: 'Identity Provider', sublabel: 'Argon2id / Passkey', x: 212, y: 64 },
      { id: 'sign', label: 'Token Signer (KMS)', sublabel: 'EdDSA / RS256', x: 356, y: 162 },
      { id: 'jwks', label: 'Service JWKS Cache', sublabel: 'Verify kid Local', x: 492, y: 64 },
      { id: 'rev', label: 'Policy & Revocation', sublabel: 'RBAC / ABAC / Denylist', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'cli', to: 'idp', label: 'Auth + PKCE' },
      { id: 'e2', from: 'idp', to: 'sign', label: 'Mint Claims' },
      { id: 'e3', from: 'sign', to: 'jwks', label: 'Bearer JWT' },
      { id: 'e4', from: 'jwks', to: 'rev', label: 'AuthZ Check' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Authorization Code + PKCE Challenge',
        plainEnglish: 'User authenticates via Passkey/MFA while the client submits a one-time SHA-256 challenge hash.',
        technicalDetail: 'IdP verifies WebAuthn signature or Argon2id hash (constant-time compare to block timing attacks) and issues short-lived Auth Code.',
        activeNodeIds: ['cli', 'idp'],
        activeEdgeIds: ['e1'],
        packetLabel: 'PKCE VERIFY',
      },
      {
        step: 2,
        title: 'HSM/KMS Asymmetric Token Minting',
        plainEnglish: 'The IdP signs a short-lived Access JWT (10m) and an opaque Rotating Refresh Token.',
        technicalDetail: 'JWT header carries kid (key rotation ID); payload carries sub, aud, iss, exp, scope, jti; signed via HSM Private Key.',
        activeNodeIds: ['idp', 'sign'],
        activeEdgeIds: ['e2'],
        packetLabel: 'SIGN JWT',
      },
      {
        step: 3,
        title: 'Stateless Local JWKS Verification',
        plainEnglish: 'When calling an API, the Gateway verifies the JWT signature locally using its cached Public Key in 50 microseconds.',
        technicalDetail: 'Validates alg whitelist (blocks alg:none attack), exp/nbf clock skew, iss/aud match, and cryptographic signature.',
        activeNodeIds: ['sign', 'jwks'],
        activeEdgeIds: ['e3'],
        packetLabel: 'JWKS OK',
      },
      {
        step: 4,
        title: 'RBAC/ABAC Policy Evaluation & Revocation Check',
        plainEnglish: 'Checks whether the user’s roles/scopes permit the action and ensures the token ID (jti) has not been revoked.',
        technicalDetail: 'Evaluates OPA/Rego or Zanzibar ReBAC graph; checks Redis denylist / refresh token family status on sensitive mutations.',
        activeNodeIds: ['jwks', 'rev'],
        activeEdgeIds: ['e4'],
        packetLabel: 'ALLOW 200',
      },
    ],
  },
  {
    id: 'api-gateway',
    shortTitle: 'API Gateway',
    title: 'API Gateway Internals: Distributed Rate Limiting, Auth Offload, Schema Validation & Aggregation',
    category: 'security-edge',
    simKind: 'rate-auth-gateway',
    examples: 'Kong, Envoy Gateway, AWS API Gateway, Apigee, KrakenD',
    tagline: 'The unified programmable front door enforcing security, quotas, transformations, and resilient fan-out.',
    simpleEnglish:
      'An API Gateway is the security desk + concierge of your microservice building. Every external request stops there first to verify its API key/JWT, check if the user exceeded their rate limit (e.g. 100 req/min), validate the JSON shape, and fan out to internal services.',
    standardDefinition:
      'A programmable L7 edge proxy executing an ordered plugin pipeline: TLS termination -> Request Normalization -> Authentication (JWT/mTLS) -> Distributed Rate Limiting (Token Bucket / GCRA in Redis Lua) -> Schema Validation -> Request Transformation / BFF Aggregation -> Adaptive Concurrency & Circuit Breaking.',
    internalDataStructures:
      'Redis Atomic Token Bucket / GCRA timestamp keys, Sliding-Window Sorted Sets, Compiled JSON Schema Validators, LRU Response Cache, and Little’s Law Adaptive Concurrency Limiters.',
    bottleneckAndMitigation:
      'Synchronous Redis round-trip per request for rate limiting adds tail latency -> use local token batch leasing (fetch 50 tokens per Redis sync) or Generic Cell Rate Algorithm (GCRA) with fail-open circuit breaker.',
    algorithms: [
      {
        name: 'Token Bucket & GCRA (Generic Cell Rate Algorithm)',
        complexity: 'O(1) time & O(1) memory per tenant key',
        whereUsed: 'Distributed Rate Limiter (Redis Lua)',
        plainEnglish: 'Refills tokens steadily at rate R up to burst cap B; each request spends 1 token or gets HTTP 429 Too Many Requests.',
        whyChosen: 'GCRA stores only a single Theoretical Arrival Time (TAT) timestamp per user—saving 90% Redis RAM over Sliding Window Logs.',
      },
      {
        name: 'Adaptive Concurrency Limiting (TCP Vegas / AIMD)',
        complexity: 'O(1) per response update',
        whereUsed: 'Overload Protection',
        plainEnglish: 'Automatically shrinks max in-flight requests when backend queue latency rises, then gently expands again when latency recovers.',
        whyChosen: 'Static rate limits break when backend capacity fluctuates; adaptive limits track true real-time saturation.',
      },
      {
        name: 'Request Coalescing (Singleflight) & BFF Fan-Out',
        complexity: 'O(1) inflight map lookup',
        whereUsed: 'Read-Heavy API Aggregation',
        plainEnglish: 'If 500 clients request the exact same product endpoint simultaneously, the gateway sends 1 upstream call and shares the response.',
        whyChosen: 'Eliminates thundering-herd spikes against downstream databases.',
      },
    ],
    dfdNodes: [
      { id: 'in', label: 'TLS + Normalize', sublabel: 'WAF / Sanitize', x: 74, y: 112 },
      { id: 'auth', label: 'Auth Plugin', sublabel: 'JWT / API Key', x: 212, y: 64 },
      { id: 'rl', label: 'Rate Limiter', sublabel: 'Token Bucket / GCRA', x: 356, y: 162 },
      { id: 'val', label: 'Schema & Transform', sublabel: 'OpenAPI / BFF', x: 492, y: 64 },
      { id: 'svc', label: 'Microservice Fan-Out', sublabel: 'Bulkhead + Retry', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'in', to: 'auth', label: 'Clean Req' },
      { id: 'e2', from: 'auth', to: 'rl', label: 'Tenant ID' },
      { id: 'e3', from: 'rl', to: 'val', label: 'Quota OK' },
      { id: 'e4', from: 'val', to: 'svc', label: 'Forward / FanOut' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'WAF Inspection & Path Normalization',
        plainEnglish: 'Blocks SQLi/XSS payloads and normalizes sneaky paths like /admin/../secret before any routing rule runs.',
        technicalDetail: 'Canonicalizes URL encoding, enforces max payload size, attaches W3C traceparent header.',
        activeNodeIds: ['in', 'auth'],
        activeEdgeIds: ['e1'],
        packetLabel: 'TRACE ID',
      },
      {
        step: 2,
        title: 'Identity Verification & Tenant Extraction',
        plainEnglish: 'Verifies JWT/API key and identifies the caller’s subscription tier (Free vs Enterprise quota).',
        technicalDetail: 'Injects verified X-Tenant-Id and X-Scopes headers while stripping untrusted client-supplied internal headers.',
        activeNodeIds: ['auth', 'rl'],
        activeEdgeIds: ['e2'],
        packetLabel: 'TENANT PRO',
      },
      {
        step: 3,
        title: 'Atomic Token Bucket / GCRA Quota Check',
        plainEnglish: 'Checks if the caller has tokens remaining in their bucket; rejects overflow immediately with HTTP 429 + Retry-After.',
        technicalDetail: 'Redis Lua script executes read-compute-write atomically in 1 RTT; local quota batching slashes Redis ops by 50x.',
        activeNodeIds: ['rl', 'val'],
        activeEdgeIds: ['e3'],
        packetLabel: 'TOKEN -1',
      },
      {
        step: 4,
        title: 'Schema Validation & Resilient Downstream Fan-Out',
        plainEnglish: 'Rejects malformed JSON at the edge and fans out valid requests to internal microservices with strict timeouts.',
        technicalDetail: 'Executes parallel non-blocking fan-out with per-upstream bulkhead semaphores and circuit breakers.',
        activeNodeIds: ['val', 'svc'],
        activeEdgeIds: ['e4'],
        packetLabel: 'FAN-OUT',
      },
    ],
  },
  {
    id: 'dns-resolution',
    shortTitle: 'DNS Architecture',
    title: 'DNS Internals: Recursive Resolvers, Anycast Root/TLD Hierarchy, GeoDNS & DNSSEC',
    category: 'security-edge',
    simKind: 'dns-cdn-edge',
    examples: 'Cloudflare 1.1.1.1, Google 8.8.8.8, Route 53, Unbound, CoreDNS',
    tagline: 'The globally distributed hierarchical phonebook resolving billions of domain names in milliseconds.',
    simpleEnglish:
      'When you type api.shop.com, your computer asks a local Recursive Resolver. If it is not cached, the resolver asks 3 specialists in order: Root (".") points to ".com" (TLD), ".com" points to "shop.com" (Authoritative), and Authoritative returns the IP address—then everyone caches it for TTL seconds!',
    standardDefinition:
      'A globally distributed, eventually consistent hierarchical key-value tree queried via UDP/53, DoH (HTTPS), or DoT (TLS). Recursive resolvers perform iterative tree traversal across Anycast Root (13 logical clusters), TLD, and Authoritative nameservers with positive/negative (NXDOMAIN) TTL caching, EDNS Client Subnet (ECS) geo-steering, and DNSSEC RSA/ECDSA chain-of-trust validation.',
    internalDataStructures:
      'Hierarchical Domain Label Trie (Zone File Radix Tree), Concurrent LRU/Clock RRSet Cache with TTL min-heap expiry, and In-Flight Query Coalescing Hash Table.',
    bottleneckAndMitigation:
      'DNS cache stampedes when a hot domain’s TTL expires simultaneously -> use Prefetching (refresh popular records at 90% TTL) and Serve-Stale (RFC 8767) while refreshing asynchronously.',
    algorithms: [
      {
        name: 'Hierarchical Iterative Tree Walk + Multi-Tier TTL Caching',
        complexity: 'O(1) on cache hit; O(depth <= 4) on cold miss',
        whereUsed: 'Recursive Resolver (Unbound / 1.1.1.1)',
        plainEnglish: 'Caches Root and TLD referrals so even cold subdomains skip the top of the tree and jump straight to the domain’s nameserver.',
        whyChosen: 'Decentralizes ownership globally while keeping 95%+ of real queries under 5ms via caching.',
      },
      {
        name: 'BGP Anycast + EDNS Client Subnet (ECS) Geo-Steering',
        complexity: 'O(1) Longest-Prefix Match (Radix/LC-Trie) in BGP/GeoIP',
        whereUsed: 'Authoritative GeoDNS (Route 53 / Cloudflare)',
        plainEnglish: 'Routes Tokyo users to a Tokyo IP and London users to a London IP by matching the user’s IP subnet against a latency/geo map.',
        whyChosen: 'Shaves 100–250ms of trans-oceanic speed-of-light latency before the first HTTP byte is sent.',
      },
      {
        name: 'DNSSEC Cryptographic Chain of Trust',
        complexity: 'O(depth) ECDSA/RSA signature verifies',
        whereUsed: 'Spoofing & Cache-Poisoning Defense',
        plainEnglish: 'Each parent zone signs the hash (DS record) of its child’s public key (DNSKEY) all the way from Root down to the final IP record.',
        whyChosen: 'Mathematically prevents man-in-the-middle attackers from forging fake IPs into DNS caches.',
      },
    ],
    dfdNodes: [
      { id: 'stub', label: 'OS Stub & Browser', sublabel: 'Local Cache / DoH', x: 74, y: 112 },
      { id: 'rec', label: 'Recursive Resolver', sublabel: '1.1.1.1 / Cache', x: 212, y: 64 },
      { id: 'root', label: 'Anycast Root (.)', sublabel: 'Refers -> .com', x: 356, y: 162 },
      { id: 'tld', label: 'TLD Server (.com)', sublabel: 'Refers -> NS', x: 492, y: 64 },
      { id: 'auth', label: 'Authoritative NS', sublabel: 'GeoDNS + DNSSEC', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'stub', to: 'rec', label: 'Query A/AAAA' },
      { id: 'e2', from: 'rec', to: 'root', label: 'Ask Root' },
      { id: 'e3', from: 'root', to: 'tld', label: 'NS .com' },
      { id: 'e4', from: 'tld', to: 'auth', label: 'NS shop.com' },
      { id: 'e5', from: 'auth', to: 'rec', label: 'IP + TTL + RRSIG' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Browser/OS Cache Check -> Recursive Resolver',
        plainEnglish: 'Checks browser & OS hosts cache first; on a miss, sends an encrypted DoH/UDP query to the ISP or 1.1.1.1 resolver.',
        technicalDetail: 'Coalesces identical concurrent queries for the same domain into 1 upstream iterative lookup.',
        activeNodeIds: ['stub', 'rec'],
        activeEdgeIds: ['e1'],
        packetLabel: 'Q: api.shop.com',
      },
      {
        step: 2,
        title: 'Anycast Root Referral (if .com NS not cached)',
        plainEnglish: 'The nearest Root cluster responds: "I do not know shop.com, go ask the .com TLD servers."',
        technicalDetail: 'QNAME Minimization (RFC 7816) sends only ".com" to Root instead of full subdomain for privacy.',
        activeNodeIds: ['rec', 'root'],
        activeEdgeIds: ['e2'],
        packetLabel: 'ASK ROOT',
      },
      {
        step: 3,
        title: 'TLD Server Referral to Authoritative Nameserver',
        plainEnglish: 'The .com TLD server replies with the Authoritative NS records and Glue IPs for shop.com.',
        technicalDetail: 'Glue A/AAAA records avoid circular dependency when nameservers live inside the domain they serve.',
        activeNodeIds: ['root', 'tld', 'auth'],
        activeEdgeIds: ['e3', 'e4'],
        packetLabel: 'TLD -> AUTH',
      },
      {
        step: 4,
        title: 'GeoDNS Answer, DNSSEC Verify & TTL Cache Store',
        plainEnglish: 'Authoritative NS returns the closest healthy Edge IP, signed with RRSIG; resolver verifies and caches it for TTL seconds.',
        technicalDetail: 'Validates RRSIG against DS chain; stores RRSet with TTL; returns IPv4/IPv6 answer to client.',
        activeNodeIds: ['auth', 'rec'],
        activeEdgeIds: ['e5'],
        packetLabel: 'IP + TTL 300s',
      },
    ],
  },
  {
    id: 'cdn-edge-network',
    shortTitle: 'CDN Edge Network',
    title: 'CDN Internals: Anycast Edge PoPs, Consistent-Hash Tiering, TinyLFU Eviction & Request Coalescing',
    category: 'security-edge',
    simKind: 'dns-cdn-edge',
    examples: 'Cloudflare, Fastly, Akamai, AWS CloudFront',
    tagline: 'Bringing compute and petabytes of cached content within 10ms of every user on Earth.',
    simpleEnglish:
      'Instead of every user in India, Brazil, and Germany fetching a video from one server in Virginia, a CDN places mini-warehouses (Edge PoPs) in 300+ cities. The first user pulls the file through an Origin Shield; the next 10 million users get it locally in 8ms!',
    standardDefinition:
      'A multi-tier Anycast edge network combining BGP routing to the nearest PoP, RAM + NVMe tiered caches governed by W-TinyLFU / S3-FIFO eviction, Consistent Hashing across PoP servers to maximize hit ratio, Collapsed Forwarding (Request Coalescing) on cache miss, Origin Shielding, and V8 Isolate Edge Workers.',
    internalDataStructures:
      'W-TinyLFU Count-Min Sketch (frequency filter) + Segmented LRU queues, Consistent Hash Ring across PoP cache nodes, In-Flight Coalescing Lock Table, and Surrogate-Key Reverse Index for instant O(1) cache purges.',
    bottleneckAndMitigation:
      'Cache Stampede (10,000 users requesting a newly expired hot object simultaneously crushes Origin) -> solved via Collapsed Forwarding (1 origin fetch, 9,999 waiters stream the same buffer) + Stale-While-Revalidate.',
    algorithms: [
      {
        name: 'W-TinyLFU (Windowed Tiny Least Frequently Used)',
        complexity: 'O(1) insert/evict with tiny 4-bit Count-Min Sketch',
        whereUsed: 'Edge RAM/NVMe Cache Admission & Eviction',
        plainEnglish: 'Before evicting a popular video to make room for a one-time file, it checks a compact frequency sketch so one-hit wonders never pollute the cache.',
        whyChosen: 'Beats classic LRU by 5–20% higher cache hit ratio under real skewed web traffic (Zipf distribution).',
      },
      {
        name: 'Collapsed Forwarding (Request Coalescing)',
        complexity: 'O(1) hash lookup on cache key',
        whereUsed: 'Edge Miss -> Origin Shield',
        plainEnglish: 'Merges 1,000 simultaneous cache misses for the same URL into a single Origin HTTP request and streams chunks to all 1,000 clients live.',
        whyChosen: 'Protects origin databases and S3 buckets from viral traffic spikes.',
      },
      {
        name: 'Surrogate-Key Tag Graph Purge',
        complexity: 'O(k) tagged keys; global gossip in <150ms',
        whereUsed: 'Instant Cache Invalidation',
        plainEnglish: 'Tags every cached page with product-42; when price changes, one purge command invalidates all related pages worldwide in ~150ms.',
        whyChosen: 'Solves hard cache invalidation without waiting hours for TTL expiry.',
      },
    ],
    dfdNodes: [
      { id: 'usr', label: 'User -> Anycast', sublabel: 'Nearest Edge PoP', x: 74, y: 112 },
      { id: 'l1', label: 'Edge L1 Cache', sublabel: 'W-TinyLFU RAM/NVMe', x: 212, y: 64 },
      { id: 'coal', label: 'Request Coalescer', sublabel: '1 Fetch / N Waiters', x: 356, y: 162 },
      { id: 'shield', label: 'Origin Shield (L2)', sublabel: 'Regional Tier', x: 492, y: 64 },
      { id: 'orig', label: 'Origin Server / S3', sublabel: 'Cache-Control SWR', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'usr', to: 'l1', label: 'TLS 1.3 (8ms)' },
      { id: 'e2', from: 'l1', to: 'coal', label: 'Cache MISS' },
      { id: 'e3', from: 'coal', to: 'shield', label: '1 Coalesced Req' },
      { id: 'e4', from: 'shield', to: 'orig', label: 'L2 MISS Fetch' },
      { id: 'e5', from: 'l1', to: 'usr', label: 'Cache HIT' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Anycast Routing & Edge TLS Termination',
        plainEnglish: 'BGP Anycast lands the user at the closest city PoP where TLS finishes in 1 round-trip (~8ms instead of 180ms).',
        technicalDetail: 'Consistent hash ring inside the PoP routes URL key to the exact cache blade owning that object.',
        activeNodeIds: ['usr', 'l1'],
        activeEdgeIds: ['e1'],
        packetLabel: 'EDGE POP',
      },
      {
        step: 2,
        title: 'L1 Edge Cache Lookup (HIT vs Stale-While-Revalidate)',
        plainEnglish: 'If found in RAM/NVMe, streams immediately at line rate; if stale, serves instantly while refreshing silently in background.',
        technicalDetail: 'W-TinyLFU updates 4-bit Count-Min Sketch frequency; Cache HIT bypasses Shield and Origin completely.',
        activeNodeIds: ['l1', 'usr'],
        activeEdgeIds: ['e5'],
        packetLabel: 'HIT 8ms',
      },
      {
        step: 3,
        title: 'Cache Miss -> Collapsed Forwarding to Origin Shield',
        plainEnglish: 'On a cold miss, hundreds of concurrent requests wait on a single merged call sent to the regional Origin Shield.',
        technicalDetail: 'Origin Shield collapses misses across 300+ global PoPs down to 1 single regional cache miss.',
        activeNodeIds: ['l1', 'coal', 'shield'],
        activeEdgeIds: ['e2', 'e3'],
        packetLabel: 'COALESCE',
      },
      {
        step: 4,
        title: 'Origin Fetch, Admission Filter & Streaming Fill',
        plainEnglish: 'Origin returns bytes with Cache-Control and ETag; Shield and Edge stream bytes to clients while storing them for future hits.',
        technicalDetail: 'TinyLFU admission filter decides whether object merits cache eviction slot; Surrogate-Key index registers purge tags.',
        activeNodeIds: ['shield', 'orig'],
        activeEdgeIds: ['e4'],
        packetLabel: 'ORIGIN FILL',
      },
    ],
  },

  /* ==========================================================================
     TRACK D: LLM ENGINES, KAFKA QUEUES, DATABASES & WORKER NODES
     ========================================================================== */
  {
    id: 'llm-inference-engine',
    shortTitle: 'LLM Engine (vLLM)',
    title: 'LLM Serving Internals: BPE Tokenization, FlashAttention, PagedAttention KV-Cache & Continuous Batching',
    category: 'data-ai-queues',
    simKind: 'llm-paged-kv',
    examples: 'vLLM, TensorRT-LLM, SGLang, llama.cpp',
    tagline: 'Serving billion-parameter Transformers at high token/sec without wasting GPU HBM memory.',
    simpleEnglish:
      'Generating text with an LLM has two distinct speeds: reading your entire prompt at once (Prefill — math-heavy) and generating one word at a time (Decode — memory-heavy). Modern engines like vLLM borrow the OS Virtual Memory paging trick so GPU memory for active chats never fragments!',
    standardDefinition:
      'An LLM inference engine tokenizes UTF-8 text via Byte-Pair Encoding (BPE), schedules mixed Prefill + Decode iterations via Continuous Batching (Chunked Prefill), executes fused SRAM-tiled FlashAttention CUDA kernels, manages KV-Cache tensors in fixed-size non-contiguous physical VRAM blocks via PagedAttention Block Tables (plus RadixAttention prefix sharing), and samples next tokens via Top-P/Speculative Decoding.',
    internalDataStructures:
      'BPE Merge Priority Table / Trie, PagedAttention Logical-to-Physical KV Block Table (like OS Page Tables), RadixAttention Prefix Tree (SGLang shared system prompts), and Running/Waiting/Swapped Iteration Scheduler Queues.',
    bottleneckAndMitigation:
      'Autoregressive Decode is strictly GPU HBM memory-bandwidth bound (reading all model weights for just 1 token per request) -> solved via Continuous Batching, FP8/INT4 Quantization (AWQ/GPTQ), Grouped-Query Attention (GQA), and Speculative Decoding.',
    algorithms: [
      {
        name: 'PagedAttention (OS Virtual Memory for KV-Cache)',
        complexity: 'O(1) block table lookup; <4% VRAM waste (down from 60%+)',
        whereUsed: 'vLLM / TensorRT-LLM VRAM Manager',
        plainEnglish: 'Splits each conversation’s KV-Cache into small 16-token pages stored anywhere in GPU RAM, just like an OS manages RAM pages.',
        whyChosen: 'Eliminates contiguous allocation fragmentation and enables Copy-on-Write sharing of identical system prompts across users.',
      },
      {
        name: 'FlashAttention-2/3 IO-Aware SRAM Tiling',
        complexity: 'O(N^2) FLOPs but O(N) HBM memory instead of O(N^2)',
        whereUsed: 'CUDA / Tensor Core Self-Attention Kernel',
        plainEnglish: 'Slices Q, K, V matrices into tiny tiles that stay inside ultra-fast on-chip GPU SRAM (19 TB/s) using online Softmax rescaling.',
        whyChosen: 'Never writes the giant N×N attention matrix back to slower HBM VRAM, giving 3x–5x speedup and 100K+ context windows.',
      },
      {
        name: 'Continuous (Iteration-Level) Batching + Speculative Decoding',
        complexity: 'Dynamic slot replacement every single token step',
        whereUsed: 'Inference Scheduler',
        plainEnglish: 'As soon as one user’s reply finishes, a waiting prompt takes its GPU slot on the very next token instead of waiting for the longest reply.',
        whyChosen: 'Increases real-world throughput by 5x–10x while Speculative Decoding verifies 4–5 draft tokens in 1 parallel forward pass.',
      },
    ],
    dfdNodes: [
      { id: 'tok', label: 'BPE Tokenizer', sublabel: 'Text -> Token IDs', x: 74, y: 112 },
      { id: 'sched', label: 'Continuous Batcher', sublabel: 'Prefill + Decode', x: 212, y: 64 },
      { id: 'kv', label: 'PagedAttention KV', sublabel: 'Block Table VRAM', x: 356, y: 162 },
      { id: 'gpu', label: 'FlashAttention GPU', sublabel: 'SRAM Tensor Cores', x: 492, y: 64 },
      { id: 'samp', label: 'Sampler & SSE', sublabel: 'Top-P / Stream', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'tok', to: 'sched', label: 'Token IDs' },
      { id: 'e2', from: 'sched', to: 'kv', label: 'Alloc Blocks' },
      { id: 'e3', from: 'kv', to: 'gpu', label: 'K/V + Weights' },
      { id: 'e4', from: 'gpu', to: 'samp', label: 'Logits' },
      { id: 'e5', from: 'samp', to: 'sched', label: 'Loop Next Tok' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'BPE Tokenization & Radix Prefix Cache Check',
        plainEnglish: 'Splits prompt text into subword integer IDs and checks if the system prompt’s KV blocks are already cached in GPU RAM.',
        technicalDetail: 'Rust tiktoken / SentencePiece runs in <0.2ms; RadixAttention hits shared prefix KV pages with zero recomputation.',
        activeNodeIds: ['tok', 'sched'],
        activeEdgeIds: ['e1'],
        packetLabel: 'TOKENS [128]',
      },
      {
        step: 2,
        title: 'PagedAttention Physical Block Allocation',
        plainEnglish: 'Allocates only the exact 16-token GPU memory pages needed right now instead of reserving max_tokens upfront.',
        technicalDetail: 'Logical-to-Physical Block Table maps sequence slots to scattered HBM3 blocks; supports preemption/swap if VRAM fills.',
        activeNodeIds: ['sched', 'kv'],
        activeEdgeIds: ['e2'],
        packetLabel: 'ALLOC KV BLK',
      },
      {
        step: 3,
        title: 'FlashAttention Tensor Core Execution (Prefill & Decode)',
        plainEnglish: 'Multiplies embeddings through Transformer attention + FFN layers in tiled GPU SRAM, appending new K/V vectors to the cache.',
        technicalDetail: 'Prefill is compute-bound (GEMM Tensor Cores); Decode is HBM bandwidth-bound reading quantized FP8/FP16 weights.',
        activeNodeIds: ['kv', 'gpu'],
        activeEdgeIds: ['e3'],
        packetLabel: 'FLASH ATTN',
      },
      {
        step: 4,
        title: 'Logit Sampling & SSE Token Streaming Loop',
        plainEnglish: 'Applies Temperature + Top-P sampling to pick the next token, streams it immediately to the user, and loops until EOS.',
        technicalDetail: 'Detokenizes incrementally; emits Server-Sent Event chunk while continuous batcher inserts next waiting request on EOS.',
        activeNodeIds: ['gpu', 'samp'],
        activeEdgeIds: ['e4'],
        packetLabel: 'STREAM TOK',
      },
    ],
  },
  {
    id: 'kafka-message-queue',
    shortTitle: 'Kafka & Event Log',
    title: 'Apache Kafka Internals: Append-Only Segmented Log, Zero-Copy Page Cache, ISR Quorum & KRaft',
    category: 'data-ai-queues',
    simKind: 'kafka-worker-log',
    examples: 'Apache Kafka, Redpanda, Apache Pulsar, NATS JetStream',
    tagline: 'Millions of durable messages/sec powered by sequential disk writes, OS Page Cache, and partitioned consumer groups.',
    simpleEnglish:
      'Unlike a traditional queue that deletes messages as soon as they are popped, Kafka is an append-only diary split into numbered notebooks (Partitions). Writing at the end of a file is lightning-fast sequential disk I/O, and multiple independent teams can read the exact same diary at their own bookmark (Offset)!',
    standardDefinition:
      'A distributed, partitioned, replicated commit log. Producers hash message keys to partitions and batch compressed RecordBatches to Partition Leaders; brokers append sequentially to segment files backed by OS Page Cache, replicate to In-Sync Replicas (ISR) governed by KRaft (Raft consensus), and serve consumers via zero-copy sendfile() using consumer-managed offsets and Cooperative Sticky Rebalancing.',
    internalDataStructures:
      'Append-Only .log Segment Files, Sparse Offset Index (.index — Binary Search), Timestamp Index (.timeindex), Producer RecordAccumulator Batch Queues, and Partition ISR Metadata State Machine.',
    bottleneckAndMitigation:
      'Hot partitions from skewed keys (e.g., 1 giant tenant ID) stall one consumer while others sit idle -> add key salting (tenantId#0..N) or increase partition count paired with Cooperative Sticky Rebalancing.',
    algorithms: [
      {
        name: 'Sequential Append-Only Log + Sparse Binary Search Index',
        complexity: 'O(1) append; O(log M) offset seek via sparse .index',
        whereUsed: 'Broker Storage Engine',
        plainEnglish: 'Never modifies old data in place; appends sequentially at the tail and jumps to any offset using a tiny memory-mapped index.',
        whyChosen: 'Sequential NVMe/HDD writes + OS Page Cache reach gigabytes/sec—often faster than random RAM access!',
      },
      {
        name: 'In-Sync Replicas (ISR) High-Watermark Quorum + KRaft (Raft)',
        complexity: 'O(R) replication fan-out (typically R=3)',
        whereUsed: 'Durability & Leader Election',
        plainEnglish: 'A message becomes visible to consumers only after all caught-up replicas confirm it (acks=all); if the leader dies, KRaft elects an ISR follower with zero data loss.',
        whyChosen: 'Balances high throughput with strong durability guarantees without ZooKeeper.',
      },
      {
        name: 'Cooperative Sticky Partition Assignment',
        complexity: 'O(P + C) incremental rebalance',
        whereUsed: 'Consumer Group Coordinator',
        plainEnglish: 'When a consumer joins or crashes, only the affected partitions move instead of stopping the entire consumer group.',
        whyChosen: 'Eliminates "stop-the-world" rebalance latency spikes in large streaming fleets.',
      },
    ],
    dfdNodes: [
      { id: 'prod', label: 'Producer Batcher', sublabel: 'Hash(key) % P', x: 74, y: 112 },
      { id: 'lead', label: 'Partition Leader', sublabel: 'Append .log + Cache', x: 212, y: 64 },
      { id: 'isr', label: 'ISR Followers', sublabel: 'High-Watermark', x: 356, y: 162 },
      { id: 'zc', label: 'Zero-Copy Fetch', sublabel: 'PageCache -> NIC', x: 492, y: 64 },
      { id: 'cg', label: 'Consumer Group', sublabel: 'Commit Offset', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'prod', to: 'lead', label: 'LZ4 Batch' },
      { id: 'e2', from: 'lead', to: 'isr', label: 'Replicate ISR' },
      { id: 'e3', from: 'lead', to: 'zc', label: 'HW Advance' },
      { id: 'e4', from: 'zc', to: 'cg', label: 'sendfile()' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Producer Partitioning, Idempotent Seq & Batch Compression',
        plainEnglish: 'Hashes the event key to guarantee ordering per entity, packs records into a compressed batch, and sends to the Partition Leader.',
        technicalDetail: 'Murmur2(key) % numPartitions; enable.idempotence=true attaches (PID, SeqNum) so retries never create duplicates.',
        activeNodeIds: ['prod', 'lead'],
        activeEdgeIds: ['e1'],
        packetLabel: 'BATCH LZ4',
      },
      {
        step: 2,
        title: 'Sequential Append to OS Page Cache + .index Entry',
        plainEnglish: 'Leader appends the batch at the end of the active segment file in O(1) without rewriting or locking older messages.',
        technicalDetail: 'Writes directly to Linux Page Cache; every 4KB adds an 8-byte (offset -> file_pos) pointer to mmap .index.',
        activeNodeIds: ['lead', 'isr'],
        activeEdgeIds: ['e2'],
        packetLabel: 'APPEND LOG',
      },
      {
        step: 3,
        title: 'ISR Replication & High-Watermark Advancement',
        plainEnglish: 'Followers pull the new batch; once min.insync.replicas confirm, the leader advances High-Watermark and ACKs the producer.',
        technicalDetail: 'Only records <= High-Watermark are readable by consumers, guaranteeing committed reads survive leader crashes.',
        activeNodeIds: ['isr', 'zc'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ACK ALL',
      },
      {
        step: 4,
        title: 'Zero-Copy Consumer Pull & Offset Commit',
        plainEnglish: 'Consumer polls at its own pace; Linux transfers bytes straight from Page Cache to NIC, and consumer commits its new offset.',
        technicalDetail: 'sendfile() skips JVM heap copies; offsets commit to compacted __consumer_offsets topic.',
        activeNodeIds: ['zc', 'cg'],
        activeEdgeIds: ['e4'],
        packetLabel: 'COMMIT OFF',
      },
    ],
  },
  {
    id: 'database-engines',
    shortTitle: 'Databases (B+Tree / LSM)',
    title: 'Database Storage Engines: WAL (ARIES), Buffer Pool, B+Tree vs LSM-Tree Compaction & MVCC',
    category: 'data-ai-queues',
    simKind: 'db-btree-lsm',
    examples: 'PostgreSQL, MySQL InnoDB (B+Tree); RocksDB, Cassandra, ScyllaDB (LSM)',
    tagline: 'How databases survive power loss, run concurrent readers without blocking writers, and index billions of rows.',
    simpleEnglish:
      'Every serious database writes changes to a crash-safe diary (WAL) first so a power outage never loses committed data. Read-heavy SQL engines organize pages in a wide B+Tree, while write-heavy NoSQL engines buffer writes in RAM (MemTable) and flush sorted immutable files (SSTables) with Bloom Filters!',
    standardDefinition:
      'Modern storage engines pair a sequential Write-Ahead Log (ARIES Redo/Undo recovery) with either In-Place Update B+Trees over a Latch-Crabbbed LRU-K/Clock-Sweep Buffer Pool (OLTP SQL) or Append-Only Log-Structured Merge-Trees (SkipList MemTable -> Immutable SSTables -> Leveled Compaction + Bloom Filters), isolating transactions via Multi-Version Concurrency Control (MVCC).',
    internalDataStructures:
      'B+Tree 8KB/16KB Slotted Pages (linked leaf chain), SkipList / Red-Black MemTable, Sorted String Tables (SSTables), Bloom Filter Bit Arrays, Buffer Pool Hash Table + Clock Sweep, and MVCC Tuple Version Chains (xmin/xmax).',
    bottleneckAndMitigation:
      'LSM Write/Space Amplification during Compaction or PostgreSQL MVCC Tuple Bloat -> tune Leveled vs Tiered compaction + Bloom Filters (10 bits/key -> ~1% FP) in LSM, and Autovacuum + HOT updates in PostgreSQL.',
    algorithms: [
      {
        name: 'B+Tree Indexing & Latch Crabbing',
        complexity: 'O(log_B N) — 3–4 disk hops for 100M+ rows',
        whereUsed: 'PostgreSQL, MySQL InnoDB, SQLite',
        plainEnglish: 'Stores hundreds of sorted keys per 8KB page with linked leaf pages, so range scans (BETWEEN) read sequentially at lightning speed.',
        whyChosen: 'Ultra-predictable point lookups and range scans with high branching factor (B ~ 500).',
      },
      {
        name: 'LSM-Tree + Bloom Filters + Leveled Compaction',
        complexity: 'O(1) RAM write; O(L * log N) worst read (skipped via Bloom)',
        whereUsed: 'RocksDB, Cassandra, CockroachDB Pebble',
        plainEnglish: 'Turns random disk writes into sequential appends; Bloom Filters let reads skip 99% of disk files that definitely do not contain the key.',
        whyChosen: '10x–50x higher write throughput on SSDs compared to random in-place B+Tree page mutations.',
      },
      {
        name: 'MVCC Snapshot Isolation + ARIES WAL Recovery',
        complexity: 'O(1) snapshot visibility check',
        whereUsed: 'Transaction & Concurrency Control',
        plainEnglish: 'Keeps old row versions stamped with Transaction IDs so readers see a clean consistent snapshot without locking out writers.',
        whyChosen: 'Readers never block writers and writers never block readers.',
      },
    ],
    dfdNodes: [
      { id: 'sql', label: 'Parser & CBO Plan', sublabel: 'Cost Optimizer', x: 74, y: 112 },
      { id: 'wal', label: 'Write-Ahead Log', sublabel: 'fsync Durability', x: 212, y: 64 },
      { id: 'buf', label: 'BufferPool / MemTbl', sublabel: 'MVCC + SkipList', x: 356, y: 162 },
      { id: 'idx', label: 'B+Tree / SSTable', sublabel: 'Bloom + Slotted Pg', x: 492, y: 64 },
      { id: 'cmp', label: 'Vacuum / Compaction', sublabel: 'Reclaim & Merge', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'sql', to: 'wal', label: 'Tx Write Log' },
      { id: 'e2', from: 'wal', to: 'buf', label: 'Dirty Page / Mem' },
      { id: 'e3', from: 'buf', to: 'idx', label: 'Checkpoint / Flush' },
      { id: 'e4', from: 'idx', to: 'cmp', label: 'GC / Compact' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Query Optimization & MVCC Snapshot Assignment',
        plainEnglish: 'The Cost-Based Optimizer uses table histograms to pick Index Scan vs Hash Join and assigns a Transaction ID.',
        technicalDetail: 'Dynamic Programming join ordering evaluates row cardinality estimates; MVCC snapshot captures active TxID watermark.',
        activeNodeIds: ['sql', 'wal'],
        activeEdgeIds: ['e1'],
        packetLabel: 'CBO PLAN',
      },
      {
        step: 2,
        title: 'Sequential Write-Ahead Log (WAL) Group Commit',
        plainEnglish: 'Appends the change to the sequential WAL file and flushes it to disk before telling the client "Committed!"',
        technicalDetail: 'Group Commit batches concurrent transaction WAL fsyncs into 1 SSD flush, multiplying commit TPS by 10x.',
        activeNodeIds: ['wal', 'buf'],
        activeEdgeIds: ['e2'],
        packetLabel: 'WAL FSYNC',
      },
      {
        step: 3,
        title: 'Buffer Pool Mutation / LSM MemTable -> SSTable Flush',
        plainEnglish: 'Updates the page in RAM (B+Tree) or SkipList (LSM); background flusher writes sorted SSTables with Bloom Filters to SSD.',
        technicalDetail: 'On read, LSM probes MemTable -> Bloom Filter per SSTable level -> Block Cache -> Binary Search Data Block.',
        activeNodeIds: ['buf', 'idx'],
        activeEdgeIds: ['e3'],
        packetLabel: 'INDEX / BLOOM',
      },
      {
        step: 4,
        title: 'Background Compaction / Autovacuum Maintenance',
        plainEnglish: 'Quietly merges overlapping sorted files (LSM) or cleans expired MVCC row versions (Postgres) to keep reads fast.',
        technicalDetail: 'K-way merge sort removes tombstones and duplicate keys during leveled compaction.',
        activeNodeIds: ['idx', 'cmp'],
        activeEdgeIds: ['e4'],
        packetLabel: 'COMPACT',
      },
    ],
  },
  {
    id: 'worker-nodes-scheduler',
    shortTitle: 'Worker Nodes & Jobs',
    title: 'Distributed Worker Nodes & Schedulers: Work-Stealing, Lease Fencing, Exponential Jitter & DLQ',
    category: 'data-ai-queues',
    simKind: 'kafka-worker-log',
    examples: 'Temporal, Celery, Sidekiq, BullMQ, Kubernetes Scheduler, Ray',
    tagline: 'Reliably executing millions of async background jobs, retries, and workflows across crash-prone machines.',
    simpleEnglish:
      'When a user clicks "Generate PDF Report" or "Charge Card", the API cannot wait 30 seconds. It drops a job ticket into a durable queue. Fleet Worker Nodes pull tickets, extend a heartbeat lease while working, safely retry crashes with jittered backoff, and guarantee the card is never charged twice!',
    standardDefinition:
      'Distributed task execution combines durable Broker Queues / Workflow Event Sourcing (Temporal), Lease-based Visibility Timeouts with Monotonic Fencing Tokens, Work-Stealing Thread Pools on each worker, Idempotency Key Deduplication Stores, Full-Jitter Exponential Backoff, and Dead-Letter Queues (DLQ) for poison pills.',
    internalDataStructures:
      'Priority Delay Queue (Min-Heap / Redis ZSET for scheduled retries), Per-Thread Work-Stealing Deques, Idempotency Key Hash Table (with DB Unique Constraint), and Heartbeat Lease Map.',
    bottleneckAndMitigation:
      'Zombie worker stalls during GC pause, loses lease, and wakes up after another worker already finished the job -> attach a strictly increasing Fencing Token (epoch number) checked atomically by the storage layer.',
    algorithms: [
      {
        name: 'Visibility Timeout Leases + Monotonic Fencing Tokens',
        complexity: 'O(1) lease claim & token compare',
        whereUsed: 'At-Least-Once Safe Execution',
        plainEnglish: 'Hides a claimed job from other workers for 30s; if the worker crashes without heartbeating, the job reappears and a new worker gets a higher token number.',
        whyChosen: 'Prevents split-brain double execution even under network partitions or long GC pauses.',
      },
      {
        name: 'Exponential Backoff with Full Jitter',
        complexity: 'sleep = random(0, min(cap, base * 2^attempt))',
        whereUsed: 'Failure Retry Scheduler',
        plainEnglish: 'Spreads retries randomly over expanding time windows instead of letting 10,000 failed jobs slam a recovering database at the exact same second.',
        whyChosen: 'Eliminates synchronized retry storms (proven by AWS Architecture benchmarks).',
      },
      {
        name: 'Chase-Lev Work-Stealing Deque',
        complexity: 'O(1) lock-free local push/pop; steal from tail',
        whereUsed: 'Worker Node Local Concurrency (Tokio / ForkJoinPool / Ray)',
        plainEnglish: 'Each CPU core pops from the top of its own task list; idle cores steal waiting tasks from the bottom of busy cores.',
        whyChosen: 'Maximizes multi-core utilization with minimal cache-line bouncing.',
      },
    ],
    dfdNodes: [
      { id: 'enq', label: 'Job Enqueue + Key', sublabel: 'Idempotency ID', x: 74, y: 112 },
      { id: 'q', label: 'Durable Queue / ZSET', sublabel: 'Delay + Priority', x: 212, y: 64 },
      { id: 'lease', label: 'Worker Lease Claim', sublabel: 'Fencing Token #N', x: 356, y: 162 },
      { id: 'pool', label: 'Work-Stealing Pool', sublabel: 'Heartbeat Loop', x: 492, y: 64 },
      { id: 'dlq', label: 'ACK / Jitter / DLQ', sublabel: 'Exactly-Once FX', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'enq', to: 'q', label: 'Persist Job' },
      { id: 'e2', from: 'q', to: 'lease', label: 'Claim + Lease' },
      { id: 'e3', from: 'lease', to: 'pool', label: 'Steal / Run' },
      { id: 'e4', from: 'pool', to: 'dlq', label: 'Commit / Retry' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Transactional Outbox & Idempotency Key Enqueue',
        plainEnglish: 'Saves the job alongside the database commit with a unique Idempotency Key so retries never duplicate side effects.',
        technicalDetail: 'Transactional Outbox prevents dual-write bug (DB succeeds but Queue enqueue fails).',
        activeNodeIds: ['enq', 'q'],
        activeEdgeIds: ['e1'],
        packetLabel: 'ENQUEUE JOB',
      },
      {
        step: 2,
        title: 'Atomic Lease Claim & Fencing Token Issuance',
        plainEnglish: 'An idle worker claims the job, sets a 30s visibility lease, and receives monotonic Fencing Token #42.',
        technicalDetail: 'Redis Lua / Postgres SELECT FOR UPDATE SKIP LOCKED ensures zero lock contention across 100s of workers.',
        activeNodeIds: ['q', 'lease'],
        activeEdgeIds: ['e2'],
        packetLabel: 'LEASE #42',
      },
      {
        step: 3,
        title: 'Work-Stealing Execution & Heartbeat Extension',
        plainEnglish: 'Worker executes tasks across CPU cores using work-stealing deques while renewing the lease every 10s for long jobs.',
        technicalDetail: 'Graceful SIGTERM drain stops claiming new jobs and finishes active leases before K8s pod termination.',
        activeNodeIds: ['lease', 'pool'],
        activeEdgeIds: ['e3'],
        packetLabel: 'HEARTBEAT',
      },
      {
        step: 4,
        title: 'ACK Completion, Jittered Retry, or DLQ Quarantine',
        plainEnglish: 'On success, ACKs the queue; on transient failure, schedules jittered retry; after max attempts, moves poison pill to DLQ.',
        technicalDetail: 'Storage validates fencing_token >= stored_token before committing state; DLQ preserves payload + stack trace for replay.',
        activeNodeIds: ['pool', 'dlq'],
        activeEdgeIds: ['e4'],
        packetLabel: 'ACK / DLQ',
      },
    ],
  },
];
