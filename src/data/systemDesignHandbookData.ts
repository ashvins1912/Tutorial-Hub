export interface HandbookAcademyTopic {
  id: string;
  title: string;
  level: 'Foundation' | 'Intermediate' | 'Advanced';
  model: string;
  internals: string;
  use: string;
  tradeoff: string;
  example: string;
  interview: string;
  exercise: string;
  answer: string;
  prerequisites?: string;
  realLifeAnalogy?: string;
  masteryTest?: string;
}

export interface HandbookAcademyCategory {
  id: string;
  title: string;
  outcome: string;
  topics: HandbookAcademyTopic[];
}

export interface HandbookTopicEnrichment {
  prerequisites: string;
  realLifeAnalogy: string;
  masteryTest: string;
}

export interface ComplexityReferenceRow {
  complexity: string;
  growthIntuition: string;
  typicalExample: string;
}

export interface DataStructureCard {
  id: string;
  name: string;
  plainEnglish: string;
  whyItMatters: string;
  technicalWorking: string;
  prerequisites: string;
  realLifeAnalogy: string;
  useWhen: string;
  tradeoffs: string;
  checkQuestion: string;
}

export interface AlgorithmFamily {
  id: string;
  name: string;
  items: { name: string; detail: string }[];
}

export interface AlgorithmSelectionRule {
  signal: string;
  recommendation: string;
  why: string;
}

export interface OopDesignPatternItem {
  id: string;
  name: string;
  category: 'Creational' | 'Structural' | 'Behavioral' | 'Domain & Architecture';
  intent: string;
  example: string;
}

export interface ArchitecturePatternItem {
  id: string;
  name: string;
  plainEnglish: string;
  analogy: string;
  tradeoffs: string;
}

export interface HldBuildingBlockItem {
  id: string;
  name: string;
  plainEnglish: string;
  technicalWorking: string;
  analogy: string;
  tradeoffs: string;
}

export interface CapacityFormula {
  name: string;
  formula: string;
  note: string;
}

export interface CapacityPreset {
  id: string;
  name: string;
  subtitle: string;
  dauMillions: number;
  actionsPerUserPerDay: number;
  peakFactor: number;
  avgLatencyMs: number;
  payloadKb: number;
  retentionDays: number;
  replicationFactor: number;
  takeaway: string;
}

export interface InterviewPlaybookStep {
  step: number;
  title: string;
  duration: string;
  focus: string;
  deliverables: string[];
}

export interface HandbookCaseStudy {
  id: string;
  title: string;
  group: 'Core Case Studies' | 'Indian Real-World Walkthroughs';
  plainEnglish: string;
  whyItMatters: string;
  prerequisites: string;
  analogy: string;
  stepByStepWorking: string[];
  designDecisions: string;
  failureModes: string;
  practiceTask: string;
  masteryTest: string;
  disclaimer?: string;
}

export interface StudyPass {
  pass: number;
  name: string;
  goal: string;
  action: string;
}

export interface ExplanationStep {
  step: number;
  name: string;
  prompt: string;
}

export interface MasteryCheckpointTier {
  id: 'beginner' | 'intermediate' | 'advanced' | 'staff';
  label: string;
  summary: string;
  skills: string[];
}

export interface RoadmapWeek {
  weeks: string;
  phase: string;
  focus: string;
  habit: string;
}

export interface GlossaryEntry {
  term: string;
  meaning: string;
}

export interface ReferenceResource {
  id: string;
  category: string;
  title: string;
  summary: string;
  url?: string;
  urlNote?: string;
}

const ht = (
  id: string,
  title: string,
  level: HandbookAcademyTopic['level'],
  model: string,
  internals: string,
  use: string,
  tradeoff: string,
  example: string,
  interview: string,
  exercise: string,
  answer: string,
  prerequisites: string,
  realLifeAnalogy: string,
  masteryTest: string
): HandbookAcademyTopic => ({
  id,
  title,
  level,
  model,
  internals,
  use,
  tradeoff,
  example,
  interview,
  exercise,
  answer,
  prerequisites,
  realLifeAnalogy,
  masteryTest,
});

export const HANDBOOK_TOPIC_ENRICHMENTS: Record<string, HandbookTopicEnrichment> = {
  'vertical-horizontal': {
    prerequisites: 'Basic programming, HTTP, stateless services and database fundamentals.',
    realLifeAnalogy: 'A single larger kitchen versus opening multiple identical franchise kitchens serving the same menu.',
    masteryTest: 'Can you identify which parts of a stateful service block horizontal scaling first?',
  },
  'latency-throughput': {
    prerequisites: 'Request lifecycle, queueing basics and percentile statistics (p50/p95/p99).',
    realLifeAnalogy: 'Latency is how long one car takes through a toll plaza; throughput is how many cars pass per minute across all lanes.',
    masteryTest: 'Can you apply Little’s Law (L = λ × W) to estimate concurrent requests under load?',
  },
  cap: {
    prerequisites: 'Replication, consistency models and network failure modes.',
    realLifeAnalogy: 'Two bank branches lose their network link: they may pause certain withdrawals to avoid overspending, while a social feed keeps showing cached posts.',
    masteryTest: 'Why is CAP an operational choice during partitions rather than a permanent label for a database?',
  },
  'consistency-models': {
    prerequisites: 'Transactions, replication and concurrent read/write ordering.',
    realLifeAnalogy: 'A bank account balance needs stronger guarantees than a social post like counter.',
    masteryTest: 'Can you state which reads may be stale under eventual consistency and what convergence guarantees?',
  },
  dns: {
    prerequisites: 'IP addresses, ports and basic networking.',
    realLifeAnalogy: 'Calling a person by looking up their name in phone contacts rather than memorizing their number.',
    masteryTest: 'Why are DNS changes never instantaneous across all clients, and why is DNS not a health check by itself?',
  },
  'tcp-udp': {
    prerequisites: 'IP packets, ports and socket lifecycle.',
    realLifeAnalogy: 'TCP is tracked registered mail with confirmation; UDP is a quick postcard.',
    masteryTest: 'Why does reliable TCP delivery still fail to guarantee exactly-once application execution?',
  },
  'http-tls': {
    prerequisites: 'DNS, TCP connections and public-key certificates.',
    realLifeAnalogy: 'Checking an official ID badge at a counter before handing over a sealed order form and receiving a receipt.',
    masteryTest: 'What does a server TLS certificate prove, and why is application authorization still mandatory?',
  },
  websocket: {
    prerequisites: 'HTTP upgrade handshake and persistent socket lifecycle.',
    realLifeAnalogy: 'Polling is repeatedly checking the mailbox; SSE is a one-way loudspeaker alert; WebSocket is an open phone call.',
    masteryTest: 'How do you handle reconnects, heartbeats and backpressure across multiple WebSocket gateways?',
  },
  'sse-polling': {
    prerequisites: 'HTTP request/response and long-lived connections.',
    realLifeAnalogy: 'SSE is a live cricket score ticker pushed one way; polling is manually hitting refresh every few seconds.',
    masteryTest: 'When does one-way SSE with Last-Event-ID beat full-duplex WebSockets in operational simplicity?',
  },
  'lb-l4-l7': {
    prerequisites: 'HTTP, TCP, stateless services and health endpoints.',
    realLifeAnalogy: 'At a busy Bengaluru clinic, a dispatcher routes patients to open counters and stops sending anyone to a closed counter.',
    masteryTest: 'Can you explain L4 vs L7 routing and why readiness probes differ from liveness probes?',
  },
  'api-gateway': {
    prerequisites: 'HTTP routing, authentication, rate limiting and service boundaries.',
    realLifeAnalogy: 'A building reception desk verifies visitor identity, applies entry limits and directs people to the right floor.',
    masteryTest: 'Which cross-cutting policies belong in an API gateway and which business rules must stay in services?',
  },
  'rate-limit': {
    prerequisites: 'Counters, clocks, API identity and distributed atomic state.',
    realLifeAnalogy: 'A water tank refills at a steady rate up to its capacity: a brief rush can draw stored water, but sustained demand cannot exceed the inflow.',
    masteryTest: 'Can you explain the difference between sustained refill rate and burst capacity in a Token Bucket?',
  },
  'btree-lsm': {
    prerequisites: 'Disk pages, sorted keys, WAL, memtables, SSTables and compaction.',
    realLifeAnalogy: 'A B+ tree is a sorted school register with page tabs; an LSM tree is a daily shop notebook periodically merged into sorted ledgers.',
    masteryTest: 'Can you describe the B+ tree vs LSM read/write/space amplification trade-off without declaring one universally better?',
  },
  sharding: {
    prerequisites: 'Database partitioning, hashing and dominant query access patterns.',
    realLifeAnalogy: 'A college divides exam papers by roll number range; if one department has most students, one shelf overflows while others sit empty.',
    masteryTest: 'Can you justify a shard key using both write distribution and query locality for a skewed marketplace?',
  },
  'invalidation-ttl': {
    prerequisites: 'Cache-aside, TTL, eviction and event-driven invalidation.',
    realLifeAnalogy: 'A kirana shop keeps a printed price list at the counter; when prices change, the old sheet must be replaced or customers get charged wrong.',
    masteryTest: 'Can you state your staleness bound and protect the origin database if the cache layer fails?',
  },
  stampede: {
    prerequisites: 'Cache-aside, TTL expiry, request coalescing and locks.',
    realLifeAnalogy: 'When a popular train schedule board resets at once, hundreds of passengers rush the enquiry desk simultaneously unless one clerk updates the board for everyone.',
    masteryTest: 'How do single-flight coalescing, TTL jitter and stale-while-revalidate protect an origin database?',
  },
  queues: {
    prerequisites: 'Producers, brokers, consumers, acknowledgements, retries and DLQ.',
    realLifeAnalogy: 'An Indian courier hub absorbs parcel surges and sorts them asynchronously, smoothing peaks while requiring tracking for lost or retried parcels.',
    masteryTest: 'Why are message acknowledgement and database commit not automatically a single atomic action?',
  },
  idempotency: {
    prerequisites: 'HTTP semantics, database unique constraints and transactions.',
    realLifeAnalogy: 'A railway ticket counter checks the booking reference and hands back the same ticket on a repeated request instead of issuing a second ticket.',
    masteryTest: 'Why is a client network timeout an uncertain outcome rather than proof of failure?',
  },
  consensus: {
    prerequisites: 'Replication, network partitions, replicated logs and quorum intersection.',
    realLifeAnalogy: 'A committee elects a chair by majority vote so decisions stay valid even if one member is absent or messages arrive late.',
    masteryTest: 'Can you distinguish safety ("never wrong") from liveness ("eventually makes progress") in Raft?',
  },
  '2pc-saga': {
    prerequisites: 'Local ACID transactions, state machines, events and idempotency.',
    realLifeAnalogy: 'A wedding booking reserves a hall, caterer and photographer separately; if the photographer cancels, earlier bookings must be compensated rather than magically undone.',
    masteryTest: 'Can you distinguish a single-database rollback from cross-service compensating transactions?',
  },
  'event-sourcing': {
    prerequisites: 'Domain events, append-only logs, projections and schema versioning.',
    realLifeAnalogy: 'A bank passbook records every deposit and withdrawal as immutable lines; your current balance is derived by reading the entries.',
    masteryTest: 'How do you rebuild a read projection by replaying events without sending duplicate emails or payments?',
  },
  bloom: {
    prerequisites: 'Hash functions, bit arrays and false-positive probability.',
    realLifeAnalogy: 'A bouncer’s rapid guest-list pre-check may say "possibly listed", but will never say "not listed" for an actually invited guest.',
    masteryTest: 'What does a Bloom filter false positive mean operationally, and why are false negatives impossible in standard insertion-only use?',
  },
};

export const HANDBOOK_EXTRA_CATEGORIES: HandbookAcademyCategory[] = [
  {
    id: 'foundations',
    title: '0. System design foundations & runtime internals',
    outcome: 'Master HLD vs LLD, requirements framing, OS processes/threads, memory/GC and I/O backpressure before drawing architecture boxes.',
    topics: [
      ht(
        'hld-vs-lld',
        'HLD vs LLD boundaries',
        'Foundation',
        'High-Level Design (HLD) defines services, storage, communication and deployment topology; Low-Level Design (LLD) defines classes, interfaces, methods and object collaboration inside a component.',
        'HLD answers "what runs where, how data flows and how does it scale?" (clients, gateways, services, databases, caches, queues). LLD answers "how is this behavior structured cleanly in code?" (domain models, SOLID interfaces, sequence diagrams and patterns).',
        'Use HLD for system boundaries, throughput, availability and fault domains; use LLD for maintainable module contracts, state transitions and testable code structure.',
        'A polished HLD diagram cannot save broken data modeling or tangled code; a pristine class hierarchy cannot rescue an overloaded database or chatty network path.',
        'For an e-commerce checkout, HLD splits Catalog, Cart, Inventory and Payment services; LLD defines PaymentStrategy, IdempotencyStore and OrderStateMachine inside the checkout service.',
        'Where does an HLD architectural boundary end and an LLD code-level decision begin?',
        'Take an order-booking feature and list 3 HLD decisions (topology/storage) and 3 LLD decisions (classes/interfaces).',
        'HLD chooses service ownership, database/queue boundaries and scaling policy; LLD chooses interfaces, state machine classes, validation and strategy collaborators.',
        'Basic programming, HTTP and database fundamentals.',
        'HLD is the floor plan of a hospital (wings, wards, power backup); LLD is the detailed layout of each room, medical equipment and clinical workflow.',
        'Can you explain the boundary between a service-level decision and a class-level decision without mixing them?'
      ),
      ht(
        'functional-nfr',
        'Functional vs non-functional requirements',
        'Foundation',
        'Functional requirements specify what the system must do; non-functional requirements (NFRs) quantify how well it must perform under load, failure and security pressure.',
        'Express functional flows as user actions and state outcomes. Quantify NFRs explicitly: p95/p99 latency targets, availability SLO, peak throughput, durability, RPO/RTO, consistency scope and cost ceiling.',
        'Always lock down both functional scope and measurable NFRs before picking databases, queues, caches or microservices.',
        'Over-engineering imaginary NFRs wastes months and budget—an internal 50-user admin tool rarely needs multi-region active-active replication.',
        'A ride-hailing app must match riders with drivers (functional) while updating nearby driver locations within p95 < 200 ms and surviving zone failure (non-functional).',
        'What is the difference between throughput and latency, and why do both belong in NFRs?',
        'Write 3 functional requirements and 4 quantified NFRs for a clinic appointment booking portal.',
        'Functional: search slots, book slot, cancel/reschedule. NFRs: zero double-booking (strong consistency), p95 booking < 300 ms, 99.9% availability, audit retention for 5 years.',
        'Understanding of users, SLAs and business workflows.',
        'A taxi app must book a ride (functional) and show nearby drivers quickly even during evening peak rain (non-functional performance and reliability).',
        'Can you justify why every architectural component you add traces back to a specific functional or non-functional requirement?'
      ),
      ht(
        'process-thread-concurrency',
        'Process, thread, concurrency & parallelism',
        'Foundation',
        'A process is an isolated OS resource container; threads are execution paths inside a process. Concurrency interleaves overlapping tasks; parallelism runs tasks at the exact same instant across CPU cores.',
        'OS schedules threads onto CPU cores with context-switch overhead. CPU-bound work saturates cores; I/O-bound work waits on network or disk. In Java, master JVM threads, virtual threads, ExecutorService, CompletableFuture, synchronized, volatile and locks.',
        'Use bounded concurrency for independent work and I/O-bound workloads with explicit timeouts and pool limits.',
        'Adding threads beyond optimal saturation degrades throughput via context switching, lock contention, thread starvation, deadlocks and unbounded queue memory exhaustion.',
        'A Spring Boot service isolates payment HTTP calls in a bounded pool of 20 threads with a 2-second timeout so a slow bank gateway cannot starve catalog requests.',
        'Why does adding more threads often help I/O-bound workloads but hurt CPU-bound throughput?',
        'Design a Java example where two tasks update a shared counter concurrently, demonstrate a race condition, and fix it safely.',
        'CPU-bound work cannot exceed available cores—extra threads only add context switches. Fix shared-state races with AtomicLong, proper locking or immutable message passing.',
        'CPU, memory and operating system basics.',
        'A restaurant kitchen is a process and cooks are threads: one cook alternating between chopping and watching the oven is concurrency; two cooks chopping simultaneously is parallelism.',
        'Can you explain how thread pools, locks and context switching constrain service throughput?'
      ),
      ht(
        'stack-heap-gc',
        'Memory, stack, heap & garbage collection',
        'Intermediate',
        'The stack holds call frames and local execution references per thread; the heap stores dynamically allocated objects shared across calls and reclaimed by garbage collection.',
        'Method invocation pushes a stack frame and pops it on return. Heap objects live until unreachable; high allocation churn triggers frequent GC cycles and stop-the-world pause latency spikes. Containers also enforce strict memory cgroup limits.',
        'Design sensible object lifetimes, bounded caches and streaming pipelines for large payloads rather than buffering everything in RAM.',
        'Premature GC flag tuning without profiling hides real bugs like retained references (memory leaks), unbounded in-memory maps or full-file buffering causing OOM kills.',
        'A reporting worker streams a 2 GB CSV line-by-line in 1,000-row batches instead of loading all rows into an ArrayList, cutting peak heap from 6 GB to under 128 MB.',
        'How do you distinguish a true memory leak from high but reclaimable allocation pressure?',
        'Redesign a service that loads a 2 GB uploaded CSV into memory into a bounded-memory streaming processor.',
        'In a leak, post-GC live heap grows monotonically until OOM; high allocation churn shows a sawtooth pattern that drops back down after GC. Use streaming readers, chunked DB batching and backpressure.',
        'References, objects, call stacks and runtime basics.',
        'A work desk (stack) holds papers only for the current task; a shared store room (heap) holds equipment shared across many tasks until cleaners clear unused items.',
        'Can you diagnose whether an OutOfMemoryError comes from an unbounded cache, large payload buffering or container limits?'
      ),
      ht(
        'blocking-nonblocking-backpressure',
        'Blocking I/O, non-blocking I/O & backpressure',
        'Intermediate',
        'Blocking I/O parks a thread until the response returns; non-blocking I/O lets the thread serve other work until readiness events fire. Backpressure prevents fast producers from overwhelming slower consumers.',
        'I/O multiplexing (epoll/kqueue) handles many concurrent sockets with fewer threads, but every system still has finite service capacity. When arrival rate exceeds service rate, unbounded queues grow until latency collapses or RAM exhausts.',
        'Use bounded queues, explicit timeouts, admission control, 429/503 load shedding and Retry-After headers on every ingress boundary.',
        'Reactive/non-blocking code increases debugging complexity and stack-trace friction; it never eliminates the need for bounded queues and downstream timeouts.',
        'A bulk import API caps concurrent jobs to 16, bounds the waiting queue to 200 items, and returns HTTP 429 with Retry-After when saturated.',
        'Why is a message queue not infinite capacity, and what happens when arrival rate stays above service rate?',
        'Design a bulk upload API that bounds concurrent workers and communicates backpressure cleanly to clients.',
        'When arrival rate λ > service rate μ, queue depth and wait time grow without bound. Enforce admission control, bounded queues, rate limits and clear 429/503 retry guidance.',
        'Sockets, threads, queues and HTTP status codes.',
        'A bus counter can make every passenger stand waiting at the window (blocking) or hand out tokens and call them when ready (non-blocking)—but if tokens are issued infinitely, the waiting hall still overflows without backpressure.',
        'Can you explain how queue age, bounded pools and load shedding stop a slowdown from turning into a full outage?'
      ),
    ],
  },
  {
    id: 'algo-ds-production',
    title: '9. Complexity, data structures & production algorithms',
    outcome: 'Select the right data structure and algorithm family using invariants, constraints and asymptotic growth rather than memorization.',
    topics: [
      ht(
        'big-o-theta-omega',
        'Big O, Big Theta & Big Omega analysis',
        'Foundation',
        'Big O gives an asymptotic upper bound on resource growth, Big Theta gives a tight bound, and Big Omega gives a lower bound as input size n grows.',
        'Count dominant operations separately for time and auxiliary space, evaluating both average and worst-case inputs. Recognize growth cliffs: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!).',
        'Use asymptotic analysis early to rule out approaches that blow up at production input sizes, then benchmark real workloads.',
        'Big O hides constant factors, CPU cache locality, memory allocation overhead, network round-trips and database query planner choices.',
        'Replacing an O(n²) nested duplicate check on 100,000 imported rows (~10¹⁰ ops) with an O(n) HashSet pass cuts runtime from minutes to milliseconds.',
        'Why is an O(n log n) algorithm usually preferred over O(n²) for large n, and when can O(n²) still win?',
        'Classify typical workloads matching O(1), O(log n), O(n), O(n log n) and O(n²) and identify where cache locality alters real latency.',
        'For large n, quadratic growth explodes rapidly; for tiny arrays (e.g., n < 16), Insertion Sort can beat Merge Sort because of lower overhead and L1 cache locality.',
        'Loops, recursion, arrays and basic math.',
        'Finding a name in a sorted phone directory by repeatedly halving pages (O(log n)) beats checking every single line from page one (O(n)).',
        'Can you evaluate both time and auxiliary space complexity and spot when hardware or I/O dominates Big O?'
      ),
      ht(
        'core-data-structures',
        'Data structures selection: Arrays, Maps, Heaps, Tries, DSU & Graphs',
        'Foundation',
        'Every data structure trades access speed, update cost, ordering, memory layout and concurrency behavior; pick based on dominant operations.',
        'Dynamic arrays give O(1) indexed access and great cache locality; hash maps give average O(1) key lookup; heaps expose min/max in O(1) with O(log n) push/pop; balanced BSTs keep ordered O(log n) ops; tries lookup prefixes in O(key length); adjacency-list graphs use O(V+E); DSU gives near-O(1) connectivity via path compression + union by rank.',
        'Match structure to access pattern: Hash Map for counters/caches, Heap for top-K/schedulers/Dijkstra, Trie for autocomplete/routing prefixes, DSU for dynamic connected components.',
        'Linked lists suffer poor CPU cache locality despite O(1) node splicing; tries can consume heavy memory unless compressed; hash maps degrade under poor hash distribution or resizing spikes.',
        'A notification scheduler uses a min-heap keyed by next_run_timestamp to pull the earliest due job in O(log n) instead of scanning all pending jobs.',
        'Why is a linked list often slower than an array in practice even when theoretical insertion is O(1)?',
        'Map 5 real backend features (rate limiter, autocomplete, job timer, dependency build order, friend circles) to their ideal data structures.',
        'Arrays benefit from contiguous memory and CPU prefetching; linked lists chase scattered heap pointers. Map: HashMap/Redis, Trie, Min-Heap, Graph + Topo Sort, DSU.',
        'Indexing, references, recursion and hashing.',
        'Arrays are numbered lockers, stacks are plates, queues are counter lines, heaps are emergency triage, and tries are contact-list autocomplete.',
        'Can you justify why equal keys in a HashMap must produce equal hash codes and why a Trie search ignores total word count?'
      ),
      ht(
        'invariants-proofs',
        'Algorithm correctness, loop invariants & proof reasoning',
        'Intermediate',
        'An invariant is a property that holds before the loop starts, stays true after every iteration, and guarantees the right answer when the loop terminates.',
        'Prove three parts: Initialization (true before iteration 1), Preservation (if true before an iteration, it remains true after), and Termination (loop ends and invariant implies correctness). Pair invariants with boundary and property-based tests.',
        'Write down the exact loop invariant before coding tricky binary searches, two-pointer scans, sliding windows or DP transitions.',
        'Skipping invariants leads to off-by-one bugs, infinite loops, integer midpoint overflow and silent failures on empty, single-element or duplicate-heavy inputs.',
        'In lower-bound binary search, the invariant "all indices < low are < target and all indices >= high are >= target" proves the loop terminates at the exact insertion point.',
        'How does a loop invariant prove an algorithm works for every valid input rather than just two sample cases?',
        'State and prove the initialization, preservation and termination invariant for lower-bound binary search.',
        'Initialize low=0, high=n. Each step preserves that indices < low fail the predicate and indices >= high satisfy it. Because high-low strictly shrinks, termination at low==high yields the first valid index.',
        'Loops, conditionals, arrays and basic logic.',
        'During a cricket score chase, the scoreboard accounting rule must remain valid after every single ball; one wrong update corrupts the final total.',
        'Can you explain precisely why your algorithm can never discard the true answer?'
      ),
      ht(
        'answer-space-binary-search',
        'Binary search: lower bound & answer-space search',
        'Intermediate',
        'Binary search halves a sorted range or any monotonic answer space in O(log n) steps using a feasibility predicate.',
        'Define a monotonic predicate P(x) where false transitions to true (or true to false) once. Compute mid = low + (high - low) / 2 to avoid overflow, and shrink the half-open or closed interval strictly every step.',
        'Use for sorted lookups, first/last occurrence bounds, and optimization problems ("minimum capacity / maximum distance such that condition holds").',
        'Wrong boundary updates cause infinite loops; applying binary search without proving predicate monotonicity produces silently wrong answers.',
        'Finding the minimum truck capacity to ship packages within D days checks feasibility in O(n) per candidate capacity, solving the optimization in O(n log(sum(weights))).',
        'What property must a feasibility check satisfy before you can binary search on the answer space?',
        'Define the search bounds and monotonic predicate for minimum truck capacity to deliver packages in D days.',
        'Monotonicity: if capacity C succeeds in <= D days, every capacity > C also succeeds. Search [max(weights), sum(weights)] for the smallest feasible C.',
        'Sorted arrays, comparison and loop invariants.',
        'Finding the first available seat number after a known cutoff in an ordered reservation list by jumping to the middle page each time.',
        'Can you prove monotonicity before writing a single line of answer-space binary search?'
      ),
      ht(
        'sliding-window-two-pointers',
        'Sliding window & two pointers at scale',
        'Intermediate',
        'Maintain a moving range or pair of indices across a sequence so each element is processed a bounded number of times instead of restarting nested scans.',
        'Expand the right pointer to add elements to window state; while the window violates the constraint, contract the left pointer and undo its contribution. Each pointer moves at most n times, reducing O(n²) to O(n).',
        'Contiguous subarray/substring problems, sorted pair sums, deduplication and streaming window aggregations with monotonic window invariants.',
        'Negative numbers break simple sum-shrinking window monotonicity (switch to prefix sum + HashMap instead); stale frequency counts cause subtle bugs.',
        'Computing the longest substring with at most K distinct characters maintains a character frequency map and shrinks left whenever map.size() > K.',
        'Why does a sliding window stay O(n) even though there is a while loop inside the for loop?',
        'Trace longest substring with at most K distinct characters and explain why negative numbers break a variable-sum sliding window.',
        'The left pointer only moves forward from 0 to n, so across the entire run both pointers perform at most 2n operations total. Negative values mean expanding or shrinking can either raise or lower the sum, breaking monotonicity.',
        'Arrays, strings, hash maps and prefix sums.',
        'A train ticket conductor slides along a moving group of coaches rather than walking back to Coach 1 and recounting the entire train for every adjacent group.',
        'Can you justify amortized O(n) pointer movement and recognize when prefix sums must replace sliding window?'
      ),
      ht(
        'dp-state-transition',
        'Dynamic programming: state, transition & order',
        'Advanced',
        'Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing subproblem answers instead of recomputing them.',
        'Every DP solution requires five explicit pieces: exact state definition (what dp[i] or dp[i][j] means), transition from smaller states, base cases, dependency evaluation order, and final answer extraction. Optimize space only after correctness is proven.',
        'Optimization, counting paths/ways, partitioning, knapsack, edit distance and sequence alignment where greedy choices fail.',
        'Vague state definitions, missing base cases, wrong iteration order (e.g., iterating capacity forward instead of backward in 1D 0/1 knapsack) and hidden O(n²) memory blowups.',
        'In 0/1 Knapsack, dp[i][w] = max value using the first i items within weight w; each item is either skipped (dp[i-1][w]) or taken (val + dp[i-1][w-wt]).',
        'When should you choose memoization vs tabulation, and how do you know when 2D DP can be compressed to 1D?',
        'Define the exact state, transition and base cases for both 0/1 Knapsack and Longest Common Subsequence.',
        'Memoization explores only reachable states top-down; tabulation avoids recursion overhead and enables rolling-row compression whenever row i depends only on row i-1.',
        'Recursion, arrays, combinatorics and complexity analysis.',
        'A student plans exam prep by recording the highest score achievable after each subject given remaining hours instead of recalculating every schedule from scratch.',
        'Can you define what every DP cell represents in one precise sentence before writing transitions?'
      ),
      ht(
        'graph-modeling-selection',
        'Graph modeling & algorithm selection (BFS, DFS, Topo, Dijkstra)',
        'Intermediate',
        'Model entities as vertices and relationships as directed or undirected edges, then select traversal or shortest-path algorithms strictly by edge semantics.',
        'Use adjacency lists for O(V+E) space. BFS gives shortest path by hop count in unweighted graphs; DFS handles components and cycle detection; Topological Sort orders dependencies in a DAG; Dijkstra handles non-negative weights via a min-heap; Bellman-Ford handles negative weights and detects negative cycles.',
        'Service dependency graphs, deployment ordering, routing, network topology, fraud rings and social connections.',
        'Using BFS on weighted edges gives wrong answers; using Dijkstra with negative weights breaks greedy finality; forgetting visited tracking causes infinite loops on cycles.',
        'A CI/CD build orchestrator models microservice dependencies as a directed graph and runs Kahn’s topological sort to compute a valid build order or flag circular dependencies.',
        'How do you decide between BFS, DFS, Topological Sort, Dijkstra and Bellman-Ford?',
        'Model microservice deployment dependencies and design a cycle detector plus valid rollout order.',
        'Unweighted shortest path → BFS; dependency ordering in DAG → Topological Sort (detect cycle if output count < V); non-negative weights → Dijkstra; negative edges → Bellman-Ford.',
        'Queues, stacks, heaps, visited sets and adjacency lists.',
        'Metro stations are vertices and rail tracks are edges: BFS finds the fewest-stops route when every hop costs 1, while Dijkstra finds the fastest route when travel times differ.',
        'Can you pick the right graph algorithm strictly from whether edges are directed, weighted or cyclic?'
      ),
    ],
  },
  {
    id: 'lld-solid-patterns',
    title: '10. Low-Level Design (LLD), SOLID & 24 design patterns',
    outcome: 'Structure clean, extensible object-oriented code using SOLID boundaries, composition, UML diagrams and GoF/domain patterns without over-abstraction.',
    topics: [
      ht(
        'solid-principles',
        'SOLID design principles',
        'Foundation',
        'SOLID is five guidelines for keeping object-oriented modules cohesive, extensible and decoupled when business rules evolve.',
        'SRP: one cohesive reason to change. OCP: extend behavior via abstractions without repeatedly editing stable code. LSP: subtypes honor the base contract without surprises. ISP: prefer small client-specific interfaces. DIP: high-level business logic depends on abstractions, not concrete drivers.',
        'Domain workflows that change independently, support multiple providers (payments, notifications, storage) or require unit testing without live infrastructure.',
        'Over-applying SOLID creates an explosion of single-implementation interfaces and indirection that makes simple CRUD code harder to read.',
        'A checkout service depends on a PaymentGateway interface (DIP) with StripeGateway and RazorpayGateway implementations (OCP) instead of hardcoding SDK calls inside OrderController.',
        'How can violating the Liskov Substitution Principle break polymorphism even when code compiles?',
        'Refactor a monolithic InvoiceService that calculates tax, renders PDF, saves to SQL and emails customers using SRP and DIP.',
        'If a subclass throws UnsupportedOperationException or weakens postconditions expected by callers, polymorphic substitution fails at runtime. Split into TaxCalculator, InvoiceRenderer, InvoiceRepository and NotificationSender interfaces.',
        'Classes, interfaces, composition and polymorphism.',
        'A restaurant separates cashier, cook and delivery roles instead of asking one person to cook, bill and deliver every order simultaneously.',
        'Can you recognize when an abstraction clarifies change vs when it is premature over-engineering?'
      ),
      ht(
        'composition-over-inheritance',
        'Composition over inheritance',
        'Foundation',
        'Composition builds complex behavior by combining collaborating objects; inheritance locks classes into a rigid is-a hierarchy.',
        'Inject collaborators through constructors (dependency injection) and delegate behavior to swappable interfaces. Reserve inheritance strictly for genuine substitutable hierarchies.',
        'Pricing policies, shipping calculators, retry strategies, stream decorators, adapters and domain services.',
        'Deep inheritance trees suffer fragile base class problems and combinatorial subclass explosion when mixing orthogonal features (e.g., CompressedEncryptedLoggedStream).',
        'An OrderService receives PricingPolicy, TaxPolicy and FraudChecker via constructor injection so each rule can be tested and swapped independently.',
        'Why do deep inheritance hierarchies become fragile as requirements evolve?',
        'Convert a 3-level DiscountedExpressInternationalOrder inheritance hierarchy into composed policies.',
        'Changing a parent method can unexpectedly break distant subclasses, and multiple axes of variation explode subclass counts. Inject DiscountPolicy, ShippingPolicy and CustomsPolicy into Order.',
        'Interfaces, constructors and object delegation.',
        'A car has an engine and a transmission (composition); it is not a subclass of an engine.',
        'Can you refactor a rigid subclass explosion into clean constructor-injected collaborators?'
      ),
      ht(
        'uml-interaction-diagrams',
        'UML & interaction diagrams (Class, Sequence, State, Component)',
        'Foundation',
        'UML provides focused visual blueprints of object structure, message timing, legal state transitions and module boundaries before writing heavy code.',
        'Class diagrams capture types and relationships; Sequence diagrams show time-ordered actor/service calls; State diagrams enforce legal lifecycle transitions (e.g., CREATED → PAID → SHIPPED); Component diagrams show deployable boundaries.',
        'LLD interviews, RFC design reviews, payment/order state machines and onboarding new engineers.',
        'Trying to diagram every getter/setter or keeping huge diagrams that rot out of sync with code wastes time; keep diagrams minimal and decision-focused.',
        'A payment state diagram makes illegal transitions (e.g., FAILED → SHIPPED or double REFUNDED) immediately obvious before writing a single repository method.',
        'Which diagram best communicates a multi-step checkout failure and retry flow—a class diagram or a sequence diagram?',
        'Draw a state diagram for an order lifecycle (CREATED, RESERVED, PAID, SHIPPED, CANCELLED, REFUNDED) marking legal transitions.',
        'A sequence diagram exposes exact temporal ordering, timeouts and compensations; a state diagram enforces valid transitions and prevents impossible states.',
        'Object-oriented modeling and request lifecycles.',
        'A sequence diagram is a movie storyboard showing exactly who speaks to whom and in what order.',
        'Can you sketch a focused class + sequence + state diagram for a booking system in under 10 minutes?'
      ),
      ht(
        'creational-patterns',
        'Creational patterns: Factory, Abstract Factory, Builder, Singleton, Prototype',
        'Intermediate',
        'Creational patterns decouple object construction from usage so callers do not hardcode concrete classes or complex multi-step setup.',
        'Factory Method delegates concrete instantiation to subclasses/factories; Abstract Factory creates compatible object families; Builder constructs complex immutable objects step-by-step; Singleton restricts to one shared instance in scope; Prototype clones preconfigured templates.',
        'Multi-provider SDK selection (payment/SMS gateways), complex HTTP/query request builders, themed UI kits and expensive preconfigured templates.',
        'Overusing Singleton introduces hidden global state and makes unit tests tightly coupled; prefer dependency injection with singleton scope managed by the container.',
        'HttpRequest.newBuilder().uri(...).timeout(...).header(...).build() in Java 21 uses Builder to avoid unreadable 8-argument constructors.',
        'Why is a classic static Singleton often considered an anti-pattern in testable backend systems?',
        'Design a PaymentProviderFactory and a fluent NotificationRequest Builder for multi-channel alerts.',
        'Global static Singletons hide dependencies and leak state across tests; register one instance via DI container instead so tests can inject fakes cleanly.',
        'SOLID principles, interfaces and constructors.',
        'Ordering a custom thali step-by-step (Builder) vs requesting a regional meal kit from a kitchen factory (Abstract Factory).',
        'Can you choose between Factory Method, Abstract Factory and Builder based on construction complexity?'
      ),
      ht(
        'structural-patterns',
        'Structural patterns: Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight',
        'Intermediate',
        'Structural patterns compose classes and objects into larger structures while keeping interfaces clean and dependencies decoupled.',
        'Adapter translates an incompatible third-party interface; Decorator wraps an object to layer behavior (logging, metrics, compression); Facade exposes a simple entry point to a complex subsystem; Proxy controls access (lazy load, auth, caching); Composite treats items and groups uniformly; Bridge decouples abstraction from implementation; Flyweight shares intrinsic state.',
        'Wrapping vendor APIs (Adapter), layering cross-cutting concerns without subclassing (Decorator), simplifying checkout orchestration (Facade) and representing folder/org trees (Composite).',
        'Too many nested Decorators or Proxies make debugging call stacks harder; Facades must not turn into god objects holding all business logic.',
        'A CheckoutFacade coordinates Inventory, Payment and Order services, while a ShiprocketAdapter translates the carrier’s API into the internal ShippingProvider port.',
        'How do Decorator, Proxy and Adapter differ when all three wrap another object?',
        'Design a layered notification sender using Decorator (logging + retry) and Bridge (AlertType × DeliveryChannel).',
        'Adapter changes the interface to fit expectations; Decorator keeps the same interface to add composable behavior; Proxy keeps the same interface to govern access, caching or remote calls.',
        'Interfaces, composition and delegation.',
        'A travel plug Adapter converts socket shape; a Checkout Facade is a hotel concierge coordinating taxi, luggage and billing behind one desk.',
        'Can you pick Adapter vs Decorator vs Proxy vs Facade in a real backend refactoring scenario?'
      ),
      ht(
        'behavioral-domain-patterns',
        'Behavioral & domain patterns: Strategy, Observer, State, Command, Repository & Unit of Work',
        'Intermediate',
        'Behavioral patterns govern algorithms, event propagation and state transitions; domain patterns isolate persistence and business rules cleanly.',
        'Strategy swaps algorithms behind a common interface; Observer notifies subscribers on change; Command encapsulates queueable/undoable actions; State alters behavior by lifecycle state; Chain of Responsibility pipes handlers (auth/validation filters); Template Method fixes workflow skeleton; Repository abstracts persistence; Unit of Work commits aggregate changes atomically; Specification composes business predicates; Null Object eliminates null-check clutter.',
        'Dynamic pricing/shipping (Strategy), order status events (Observer), middleware filter pipelines (Chain of Responsibility), order lifecycles (State) and clean data access (Repository + Unit of Work).',
        'Pattern selection warning: always identify the actual changing behavior or coupling pain first—never force a pattern just because it appears in a catalog.',
        'Spring Security filter chains use Chain of Responsibility; pricing engines use Strategy + Specification; order lifecycles use State so PaidOrder and CancelledOrder enforce distinct rules.',
        'When does the State pattern beat an if/else switch block, and how do Repository and Unit of Work collaborate?',
        'Model an e-commerce Order using State (Pending, Paid, Shipped) and a composable Specification for promotion eligibility.',
        'Use State when behavior and valid transitions vary heavily across lifecycle states; Repository loads/saves domain entities while Unit of Work coordinates one atomic transaction boundary across multiple repositories.',
        'Polymorphism, SOLID principles and domain modeling.',
        'Strategy is swapping Google Maps transport modes (car, metro, walk); Observer is subscribing to parcel tracking updates; Chain of Responsibility is airport security checkpoints.',
        'Can you explain the coupling problem each pattern solves before naming the pattern?'
      ),
    ],
  },
  {
    id: 'arch-security-dr',
    title: '11. Architectural styles, API pagination, security & disaster recovery',
    outcome: 'Choose clean architecture boundaries, resilient isolation patterns, cursor pagination, database isolation, multi-tenant security and tested DR targets.',
    topics: [
      ht(
        'hexagonal-clean-layered',
        'Layered, Modular Monolith, Hexagonal & Clean/Onion Architecture',
        'Intermediate',
        'Architecture styles organize module dependencies so business rules stay understandable, testable and insulated from framework or database churn.',
        'Layered separates presentation, application, domain and infrastructure. Modular Monolith keeps one deployable artifact with strictly encapsulated domain modules. Hexagonal (Ports & Adapters) isolates core domain behind input/output ports. Clean/Onion points all dependencies inward toward business rules.',
        'Start with a Modular Monolith using Hexagonal/Clean boundaries for core domains so you get simple local ACID transactions and easy testing without distributed network tax.',
        'Bypassing layers creates a big ball of mud; conversely, ceremony-heavy Clean Architecture boilerplate can slow down tiny CRUD utilities.',
        'An Order domain module defines an OrderRepository port; in production a PostgreSQLAdapter implements it, while unit tests plug in an InMemoryOrderAdapter with zero DB setup.',
        'Why is a Modular Monolith often a stronger starting architecture than Microservices?',
        'Design ports and adapters for a Payment domain that must switch from a mock gateway in tests to Razorpay/Stripe in production.',
        'Modular Monoliths preserve strong module boundaries while avoiding network latency, distributed transactions and multi-service deployment overhead until scaling or team autonomy demands splitting.',
        'Dependency Inversion Principle, modules and API boundaries.',
        'Hexagonal architecture is a universal power plug adapter: the appliance (domain logic) stays unchanged regardless of which country’s wall socket (DB, queue, HTTP) powers it.',
        'Can you draw dependency arrows for Clean/Hexagonal architecture and show why infrastructure depends on domain, never the reverse?'
      ),
      ht(
        'strangler-sidecar-bulkhead',
        'Strangler Fig, Sidecar & Bulkhead isolation',
        'Advanced',
        'Strangler Fig migrates legacy systems incrementally; Sidecar attaches cross-cutting helpers beside an app; Bulkhead isolates resource pools so one failing workload cannot sink the whole system.',
        'Strangler Fig routes selected capabilities at the gateway/proxy from legacy to new services step-by-step. Sidecar co-locates proxies (TLS, telemetry, service mesh) alongside containers. Bulkhead partitions thread pools, DB connections or queues per failure domain.',
        'Legacy modernization without risky big-bang rewrites (Strangler Fig), uniform observability/mTLS (Sidecar), and protecting critical checkout paths from slow partner APIs (Bulkhead).',
        'Strangler Fig requires careful dual-run routing and data synchronization; Sidecars add memory/CPU tax per pod; Bulkheads reserve capacity that may sit idle during normal load.',
        'During migration of a legacy ERP monolith, /api/v2/invoices routes to the new billing service via Strangler Fig while /api/v1/ledger stays on the monolith until verified.',
        'How does a Bulkhead complement a Circuit Breaker and Timeout?',
        'Design a Bulkhead + Strangler Fig plan for migrating a slow PDF export feature out of a core monolith.',
        'Timeouts bound wait duration, Bulkheads cap concurrency/connections so slow exports cannot exhaust checkout threads, and Strangler Fig routes /exports incrementally to the new worker service.',
        'Proxies, thread pools, containers and failure domains.',
        'Bulkheads are watertight ship compartments that stop flooding in one hull section from sinking the entire vessel; Strangler Fig replaces one wing of a hospital while other wings keep operating.',
        'Can you choose failure-domain boundaries for Bulkheads without wasting excessive resources?'
      ),
      ht(
        'cursor-offset-pagination',
        'API pagination: Offset vs Cursor (Keyset) pagination',
        'Foundation',
        'Pagination returns large datasets in bounded pages to protect memory, network bandwidth and UI responsiveness.',
        'Offset pagination (LIMIT/OFFSET) scans and discards offset rows, getting slower at deep pages and shifting items when rows are inserted/deleted. Cursor (keyset) pagination queries WHERE (created_at, id) < (cursor_ts, cursor_id) ORDER BY created_at DESC, id DESC LIMIT k using a composite index.',
        'Use Cursor pagination for feeds, infinite scroll, activity logs and large tables; use Offset only for small bounded admin tables where jumping to arbitrary page numbers is mandatory.',
        'Offset degrades linearly with page depth and produces duplicate or skipped rows under concurrent writes; Cursor requires a deterministic, unique tie-breaker ordering and does not support arbitrary "jump to page 47".',
        'GET /orders?limit=25&cursor=eyJ0cyI6IjIwMjYtMTEtMjQiLCJpZCI6OTgyMX0 uses an index on (tenant_id, created_at DESC, id DESC) for consistent O(log n) page fetches.',
        'Why does OFFSET 100000 become slow and inconsistent on an active feed?',
        'Write the SQL WHERE clause and composite index for stable cursor pagination over tenant orders.',
        'The database must scan and skip 100,000 rows, and concurrent inserts shift offsets causing duplicates. Index (tenant_id, created_at DESC, id DESC) and filter by the last seen (created_at, id) tuple.',
        'SQL ordering, composite indexes and REST APIs.',
        'Offset pagination is counting 500 pages from the front cover every time; cursor pagination is opening directly to your bookmark.',
        'Why must a cursor include a unique tie-breaker column like id alongside created_at?'
      ),
      ht(
        'isolation-anomalies',
        'Transactions & isolation anomalies (Dirty Read, Phantom, Write Skew)',
        'Advanced',
        'Isolation levels govern which concurrent changes one transaction can observe from another, preventing subtle race conditions.',
        'Common anomalies: dirty read (uncommitted data), non-repeatable read (row changes mid-tx), phantom read (range query rows appear/disappear) and write skew (two concurrent transactions read overlapping state and write disjoint rows violating an invariant). Engines enforce isolation via locks or MVCC snapshots plus DB constraints.',
        'Inventory reservation, seat booking, double-spend prevention, doctor on-call scheduling and financial transfers.',
        'Stronger isolation (Serializable) reduces concurrency or raises abort/retry rates; application-level read-then-write without atomic SQL or constraints races silently under load.',
        'Atomic conditional SQL: UPDATE stock SET quantity = quantity - 1 WHERE sku_id = ? AND quantity > 0; check affected_rows == 1 instead of reading quantity first in application memory.',
        'Why is reading stock in app code, checking stock > 0, and then running UPDATE unsafe under concurrency?',
        'Explain write skew with an on-call doctor schedule (at least 1 doctor must remain on call) and fix it using locks or Serializable isolation.',
        'Two concurrent requests both read quantity = 1 and both decrement, overselling to -1. Use atomic conditional UPDATE, SELECT FOR UPDATE, unique constraints or Serializable isolation with retry.',
        'ACID transactions, SQL constraints and MVCC/locking.',
        'Two passengers check the last available railway seat at the exact same second—without atomic database locking, both screens show "1 seat left" and both try to confirm it.',
        'Can you explain why conditional SQL updates and unique constraints are essential even under Read Committed or Snapshot Isolation?'
      ),
      ht(
        'security-authn-authz',
        'Security fundamentals: AuthN, AuthZ, Encryption & Multi-Tenant Isolation',
        'Intermediate',
        'Security protects confidentiality, integrity and availability across every trust boundary: verify identity (Authentication) and enforce permissions (Authorization) strictly on trusted backend servers.',
        'Use TLS in transit, encryption at rest, short-lived tokens/sessions, least-privilege RBAC/ABAC, parameterized queries, input validation, secrets management, audit trails and mandatory server-side tenant_id scoping on every query, job and export.',
        'Every production service—especially multi-tenant SaaS, financial APIs, healthcare and internal admin endpoints.',
        'Hiding buttons on the frontend is never authorization; missing a single tenant_id filter in an API, cache key, search index or background export causes catastrophic cross-tenant data leaks.',
        'In a multi-tenant apartment community platform, every API resolves authenticated user membership from the server session and appends WHERE society_id = :resolvedTenantId.',
        'What is the difference between authentication and authorization, and how do confused-deputy tenant leaks happen?',
        'Audit a CRUD endpoint, Redis cache key and CSV export job to list every place tenant isolation must be enforced.',
        'AuthN verifies who you are; AuthZ verifies what you may access. Enforce resolved tenant_id on DB queries, cache key prefixes (tenant:{id}:...), object storage paths, search filters and async job payloads.',
        'HTTP, TLS, sessions/JWT and database schemas.',
        'A gated building checks your photo ID at the entrance (authentication) and separately checks which floor and apartment keys you are permitted to use (authorization).',
        'Can you explain why trusting a client-supplied tenantId header without server-side membership validation breaks isolation?'
      ),
      ht(
        'disaster-recovery-rpo-rto',
        'Disaster Recovery: RPO, RTO, Backups & Tested Restore Drills',
        'Intermediate',
        'Disaster recovery restores both data and service after regional, hardware or human catastrophes beyond ordinary retries and single-node failover.',
        'Define RPO (Recovery Point Objective: maximum acceptable data loss window) and RTO (Recovery Time Objective: maximum acceptable downtime). Combine automated encrypted backups, point-in-time WAL archiving, cross-region replication, documented runbooks and periodic restore drills.',
        'All production systems holding business-critical user, financial or operational state.',
        'Multi-region active-active setups carry major cost and data-consistency complexity; conversely, untested backups frequently turn out corrupted or missing encryption keys during a real incident.',
        'A core ledger sets RPO < 1 minute (continuous WAL shipping to a secondary region) and RTO < 15 minutes (automated standby promotion + DNS failover), validated quarterly via restore drills.',
        'How do RPO and RTO drive backup frequency, replication mode and infrastructure cost?',
        'Define realistic RPO/RTO targets and recovery steps for an internal analytics warehouse vs a payment ledger.',
        'Tight RPO (near zero data loss) demands synchronous or continuous replication; tight RTO demands warm/hot standbys rather than cold restore from object storage. Analytics can accept 24h RPO; payment ledgers require near-zero RPO.',
        'Replication, backups, DNS and availability fundamentals.',
        'Keeping notarized copies of property papers in a separate bank locker and actually checking once a year that you still have the key and can open it.',
        'Why is an untested backup operationally indistinguishable from having no backup at all?'
      ),
    ],
  },
  {
    id: 'case-studies-walkthroughs',
    title: '12. End-to-end case studies & Indian real-world walkthroughs',
    outcome: 'Apply fundamentals, HLD blocks, state machines, capacity math and failure recovery to 10 end-to-end production systems.',
    topics: [
      ht(
        'case-upi-payment',
        'UPI-Style Payment Workflow (Educational Model)',
        'Advanced',
        'Move money safely across multiple banks and network participants using explicit payment states, idempotency, immutable ledgers and reconciliation (educational model, not actual NPCI internals).',
        'Step 1: Create payment intent with unique transaction reference. Step 2: Authenticate payer and validate limits/merchant. Step 3: Submit authorization/debit-credit instruction. Step 4: Persist legal state transitions (CREATED → PROCESSING → SUCCESS | FAILED | REVERSED). Step 5: Handle uncertain timeouts via status inquiry and asynchronous reconciliation.',
        'Inter-bank payments, wallets, QR merchant checkout and any multi-hop financial transfer.',
        'Never treat a client or bank timeout as proof of failure—blind retries create duplicate debits; separate payment intent, attempts and immutable double-entry ledger records.',
        'Scanning a local shop QR code when mobile signal drops mid-payment: the app queries transaction status with the same transaction reference instead of submitting a second debit.',
        'How do you guarantee that a retry with the same transaction reference can never create a second financial debit?',
        'Define legal state transitions for CREATED, PROCESSING, SUCCESS, FAILED, REVERSED and specify which actor may trigger each.',
        'Persist a unique transaction_ref / idempotency key atomically with the payment intent and ledger entry; handle timeouts by polling/reconciling status rather than issuing a new debit.',
        'APIs, ACID transactions, idempotency, distributed timeouts and state machines.',
        'Paying a local shop by QR code: the payer wants exactly one debit and the merchant wants one confirmed credit even if mobile data cuts out mid-transfer.',
        'Can you draw all four outcomes of a payment request (success, timeout before processing, timeout after commit, retry) and show safe recovery?'
      ),
      ht(
        'case-irctc-reservation',
        'IRCTC-Style Seat Reservation (Educational Model)',
        'Advanced',
        'Allocate scarce, contended seat inventory fairly across sudden bursts of concurrent users using atomic holds, expiry and payment coordination (educational model, not actual IRCTC internals).',
        'Search availability (cached/read-optimized) → acquire short-lived seat hold via atomic conditional update or unique seat allocation row → process payment with idempotency key → confirm booking or release hold automatically on expiry/failure.',
        'Train/flight seat booking, concert ticketing, exam slot booking and limited-inventory flash holds.',
        'Peak festival bursts create extreme hot-row contention and bot traffic; expired holds paid late or lost payment confirmations require strict state-machine reconciliation and admission queueing.',
        'Festival tatkal-style rush: admission queue smooths ingress, atomic SQL reserves AVAILABLE seats with hold_expires_at, and an expiry sweeper releases unpaid seats.',
        'How does the system recover if payment succeeds right as the seat hold expires or the confirmation response drops?',
        'Write SQL to reserve one seat only if status = AVAILABLE using a unique constraint and conditional update.',
        'Use UPDATE seats SET status="HELD", hold_id=?, expires_at=? WHERE seat_id=? AND status="AVAILABLE"; check affected rows. On late payment after expiry, automatically trigger a compensating refund or waitlist allocation with full audit.',
        'Transactions, locks/optimistic concurrency, idempotency and queues.',
        'Hundreds of passengers clicking the final lower berth during a festival rush: the counter must lock the seat temporarily while collecting payment and release it if unpaid.',
        'Can you prevent overselling AND handle late-arriving payment webhooks safely?'
      ),
      ht(
        'case-food-delivery',
        'Food Delivery Platform (Geospatial & Order State)',
        'Advanced',
        'Coordinate customers, restaurants, couriers and payments in a time-sensitive workflow combining geospatial search, order state machines and event-driven dispatch.',
        'Separate catalog/geospatial search from order workflow. Flow: search nearby restaurants → create order → restaurant accepts & estimates prep time → geospatial queue assigns courier → live location tracking → deliver & settle → notify all participants via reliable events.',
        'Hyperlocal delivery, ride-hailing, on-demand logistics and multi-party marketplace workflows.',
        'Restaurant rejection after payment requires compensating refunds; stale rider GPS, duplicate courier acceptance and rainy-evening demand surges require idempotent state transitions and dynamic ETA updates.',
        'Ordering dosa during Bengaluru rain: catalog reads use cache/geospatial index (eventual), while order acceptance, courier assignment and payment capture enforce strong state consistency.',
        'Which data in a food delivery platform needs strong consistency and which can be eventually consistent?',
        'Design the order state machine and compensating actions when a restaurant rejects an order after payment capture.',
        'Strong consistency: payment ledger, order state transitions, single-courier assignment. Eventual consistency: restaurant menus, ratings, approximate rider map coordinates and analytics.',
        'APIs, geospatial indexing, queues, Saga compensation and observability.',
        'Ordering dosa during heavy rain: kitchen prep time, rider availability, traffic and possible cancellations must stay coordinated across three separate people.',
        'Can you prevent two couriers from accepting the exact same delivery assignment concurrently?'
      ),
      ht(
        'case-flash-sale',
        'E-Commerce Catalogue & Flash Sale (20x Traffic Spike)',
        'Intermediate',
        'Serve massive read-heavy catalogue traffic cheaply via CDN/cache/search while keeping flash-sale stock deduction strictly authoritative and protected from overload.',
        'Product reads hit CDN, Redis and search index. Checkout validates authoritative price and stock from the Inventory service, performs atomic stock reservation, enforces per-user purchase limits, and processes post-order events asynchronously via queues.',
        'Major seasonal online sales, limited-edition product drops and high-contention SKU checkouts.',
        'Serving stock directly from an eventually consistent search index causes massive overselling; hot SKUs can trigger cache stampedes and single-row DB lock contention.',
        'During a 20x seasonal sale, CDN + Redis absorb 98% of browse reads, rate limiters + waiting rooms shed excess checkout load, and atomic inventory checks protect the hot SKU.',
        'Why should a search index or CDN cache never be the final authority for product price or stock at checkout?',
        'Estimate peak RPS at 20x normal traffic and design a graceful overload policy (queueing, rate limiting, degraded non-critical widgets).',
        'Search indexes and caches lag behind writes and can serve stale stock/prices. Revalidate against authoritative inventory/pricing atomically at checkout and shed non-essential features (recommendations) under surge.',
        'CDN, caching, search index, rate limiting, queues and atomic DB updates.',
        'A festive mega-sale attracts 20 times more shoppers than an ordinary Tuesday: window-shopping displays can be photocopied outside, but the cash register must check the real stock ledger.',
        'Can you protect a single hot SKU from both overselling and cache stampede simultaneously?'
      ),
      ht(
        'case-apartment-multitenant',
        'Apartment Community Platform (Multi-Tenant SaaS)',
        'Intermediate',
        'Serve thousands of independent apartment societies on shared infrastructure while guaranteeing zero cross-tenant data leakage, strict RBAC and noisy-neighbor isolation.',
        'Authenticate user → resolve verified society/tenant membership server-side → authorize role (resident, security guard, facility manager, committee admin) → run tenant-scoped queries backed by (tenant_id, ...) composite indexes → write immutable audit logs for sensitive actions.',
        'B2B SaaS, gated community apps, clinic networks, school ERPs and multi-organization portals.',
        'Missing a tenant_id predicate in one query, cache key or background export leaks private visitor/billing records; one massive society running heavy exports can degrade smaller societies without per-tenant quotas.',
        'Every visitor-entry row carries society_id; Redis keys prefix society:{id}:...; per-tenant rate limits prevent one society’s bulk notice blast from slowing others.',
        'Why is hiding an Admin route in the frontend never sufficient for multi-tenant security?',
        'Review a visitor CRUD API, search endpoint and nightly PDF export worker and list every boundary where tenant_id must be enforced.',
        'Attackers call backend APIs directly. Enforce server-side session membership, RBAC checks, composite tenant_id DB filters (or Row-Level Security), tenant-prefixed cache keys and explicit tenant context in async jobs.',
        'Authentication, RBAC authorization, composite indexing, API gateways and audit logging.',
        'A gated community app serves hundreds of separate societies: a security guard in Society A must never see visitor logs or resident phone numbers from Society B.',
        'Can you explain when to stay on shared-DB tenant_id isolation vs offering a dedicated database for a high-isolation enterprise tenant?'
      ),
      ht(
        'case-url-shortener',
        'URL Shortener (Read-Heavy Mapping Service)',
        'Foundation',
        'Convert long URLs into compact unique codes and redirect readers with minimal latency at high read-to-write ratios.',
        'Create API validates URL, generates unique Base62/counter/hash short code, persists mapping and returns link. Redirect API reads Redis cache (falling back to indexed DB), emits async click analytics and returns HTTP 301/302 redirect.',
        'Link shorteners, QR redirect services, campaign tracking and read-heavy key-value lookups.',
        'Random codes need collision checks; sequential IDs leak creation volume; 301 permanent redirects reduce server hits but forfeit click analytics; spam/phishing URLs require abuse controls.',
        '100:1 read/write ratio lets Redis + Bloom filter serve >95% of redirects in single-digit milliseconds while PostgreSQL remains the durable mapping store.',
        'Compare 301 vs 302 redirects and random vs counter-based short-code generation.',
        'Design key generation, cache invalidation on URL expiry and abuse rate limiting for a URL shortener.',
        '301 is cached by browsers (faster, less server load, hides analytics); 302 hits server every time (accurate analytics, easy target updates). Use encrypted/scrambled counters or collision-checked Base62 with TTL + rate limits.',
        'HTTP redirects, hashing, DB indexes and cache-aside.',
        'A coat-check ticket maps a tiny token number to a stored coat location so you retrieve it instantly.',
        'Can you size storage and QPS for 100M links and defend your choice of 301 vs 302?'
      ),
      ht(
        'case-chat-app',
        'Real-Time Chat Application (Presence, Ordering & Fan-Out)',
        'Intermediate',
        'Deliver low-latency bidirectional messages with reliable persistence, clear ordering guarantees, presence status and offline catch-up sync.',
        'Clients hold persistent WebSocket connections to chat gateways. Send flow: authenticate → persist message with client_msg_id for dedup → publish to broker → route to recipient’s active gateway or push notification if offline → sync missed messages by per-conversation cursor.',
        '1:1 messaging, team collaboration channels, customer support chat and live notifications.',
        'Group fan-out grows with member count; clock skew breaks client-timestamp ordering; network drops cause duplicate sends unless deduplicated by client message ID.',
        'Messages are partitioned by conversation_id for per-chat ordering; offline mobile users receive push notifications and fetch delta history via last_seen_seq.',
        'How do you guarantee message deduplication and consistent per-conversation ordering when mobile clients reconnect?',
        'Design connection routing, offline sync and group fan-out for a 500-member chat room.',
        'Assign server-side monotonic sequence/Snowflake IDs per conversation, deduplicate writes with unique (conversation_id, client_msg_id), persist before fan-out, and sync gaps using cursor checkpoints.',
        'WebSockets, message brokers, partitioning and idempotency.',
        'A post office records and sorts every letter safely, delivers immediately if the recipient is home, and holds mail for pickup when they return.',
        'Can you explain how a chat gateway knows which server instance currently holds Recipient B’s WebSocket?'
      ),
      ht(
        'case-ecommerce-checkout',
        'E-Commerce Checkout & Order Fulfillment Saga',
        'Intermediate',
        'Coordinate cart validation, inventory reservation, payment capture and fulfillment across independent services using pending states, idempotency and compensating actions.',
        'Validate cart → atomically reserve stock with hold TTL → create PENDING order → call external payment provider with idempotency key → on success mark CONFIRMED and publish OrderConfirmed event via transactional outbox → on failure release stock reservation.',
        'Multi-service commerce, booking platforms and subscription billing workflows.',
        'Distributed steps cannot commit in one global ACID transaction; network failures between payment capture and order update require explicit pending states, webhooks and reconciliation.',
        'If payment succeeds but shipping label generation fails downstream, the order remains paid and retries fulfillment asynchronously rather than blindly cancelling the customer’s payment.',
        'Why should order creation persist a PENDING state before calling an external payment provider?',
        'Trace what happens if the server crashes right after Stripe charges the card but before the HTTP response reaches Checkout.',
        'Persisting PENDING with an idempotency key ensures retries reuse the same payment intent and webhook/reconciliation jobs converge the order to CONFIRMED without double-charging.',
        'ACID transactions, transactional outbox, idempotency and Saga pattern.',
        'A shop holds an item behind the counter briefly while card payment confirms, and puts it back on the shelf if the card declines.',
        'Can you explain every compensating action needed if any step in Checkout fails?'
      ),
      ht(
        'case-social-feed',
        'News & Social Feed (Hybrid Fan-Out & Ranking)',
        'Intermediate',
        'Serve a fast, personalized, cursor-paginated feed by balancing precomputed timelines (fan-out-on-write) against on-demand celebrity merges (fan-out-on-read).',
        'Store posts durably. For ordinary authors, async workers push post IDs into followers’ Redis feed lists (fan-out-on-write). For celebrity accounts with millions of followers, skip mass fan-out and merge their recent posts dynamically at read time (fan-out-on-read), then rank and cursor-paginate.',
        'Social timelines, activity streams, creator updates and personalized news feeds.',
        'Pure fan-out-on-write causes massive write amplification and queue stalls on celebrity posts; pure fan-out-on-read spikes read latency for users following hundreds of active accounts.',
        'A hybrid timeline keeps p95 home-feed reads under 50 ms while eliminating 10M-write storms whenever a major celebrity posts.',
        'How does hybrid fan-out solve the celebrity hot-user problem without sacrificing normal read latency?',
        'Design post creation, timeline cache eviction for inactive users and cursor pagination for a social feed.',
        'Flag accounts above a follower threshold (e.g., >50k) as fan-out-on-read; skip precomputing timelines for users inactive >30 days; merge ranked candidates with a stable cursor.',
        'Message queues, Redis sorted sets/lists, cursor pagination and ranking.',
        'A newspaper pre-delivers standard morning editions to subscribers’ doors, while breaking celebrity special columns are fetched from the kiosk on demand.',
        'Can you quantify the write amplification saved by switching a 10M-follower account to fan-out-on-read?'
      ),
      ht(
        'case-video-streaming',
        'Video Streaming Platform (Upload, Transcode & Adaptive CDN)',
        'Intermediate',
        'Ingest large raw video uploads into object storage, asynchronously transcode adaptive bitrate renditions and stream chunks globally from CDN edges.',
        'Client uploads raw video via multipart presigned URL to object storage → upload event queues transcoding DAG → workers split GOP chunks and encode 360p/720p/1080p/4K + HLS/DASH manifests → metadata stored in DB → CDN caches and serves video segments near viewers.',
        'Video-on-demand, course platforms, recorded webinars and global media libraries.',
        'Transcoding compute and egress bandwidth dominate cost; private/paid courses require signed CDN URLs/cookies and careful cache-key policies.',
        'A 1 GB uploaded lecture splits into 4-second HLS segments across 4 bitrates so mobile viewers switch smoothly from 1080p to 480p on weak signals without rebuffering.',
        'Why do streaming platforms split videos into small adaptive bitrate chunks instead of serving one giant MP4 file?',
        'Trace the end-to-end upload, transcoding retry/DLQ and CDN playback path for a 20-minute course video.',
        'Chunked HLS/DASH enables fast start, instant seeking, mid-playback quality adaptation to changing bandwidth, parallel transcoding and high CDN edge cache hit ratios.',
        'Object storage, async job queues, CDN edge caching and HTTP streaming.',
        'A central film studio prints reels in multiple screen sizes and ships copies to neighborhood theaters so audiences watch locally without traveling to the studio.',
        'Can you explain why raw uploads go directly from client to object storage via presigned URLs instead of streaming through API servers?'
      ),
    ],
  },
];

export const COMPLEXITY_REFERENCE_ROWS: ComplexityReferenceRow[] = [
  { complexity: 'O(1)', growthIntuition: 'Constant work independent of n', typicalExample: 'Array access by index, HashMap lookup (average)' },
  { complexity: 'O(log n)', growthIntuition: 'Repeatedly halve the search space', typicalExample: 'Binary search, balanced BST lookup' },
  { complexity: 'O(n)', growthIntuition: 'Visit each item a bounded number of times', typicalExample: 'Linear scan, two pointers, sliding window' },
  { complexity: 'O(n log n)', growthIntuition: 'Divide and combine / heap operations per item', typicalExample: 'Merge sort, heap sort, sorting + two pointers' },
  { complexity: 'O(n²)', growthIntuition: 'Compare many pairs in nested loops', typicalExample: 'Naive pair comparison, bubble/insertion worst case' },
  { complexity: 'O(2ⁿ)', growthIntuition: 'Branching include/exclude combinations', typicalExample: 'Naive subset recursion without memoization' },
  { complexity: 'O(n!)', growthIntuition: 'Enumerate all orderings/permutations', typicalExample: 'Brute-force traveling route permutations' },
];

export const DATA_STRUCTURE_CARDS: DataStructureCard[] = [
  {
    id: 'ds-array',
    name: 'Array & Dynamic Array',
    plainEnglish: 'A contiguous sequence stored in indexed positions.',
    whyItMatters: 'Fast O(1) indexed reads, compact storage and superior CPU cache locality.',
    technicalWorking: 'Index access is O(1); middle insertions/deletions shift O(n) elements; dynamic arrays resize and copy amortized O(1) at the tail.',
    prerequisites: 'Indexing and contiguous memory basics.',
    realLifeAnalogy: 'A row of numbered lockers.',
    useWhen: 'Dense lists, buffers, lookup by position and sequential scans.',
    tradeoffs: 'Middle insertions and occasional resizing copies can spike latency.',
    checkQuestion: 'Why is random access O(1) in an array?',
  },
  {
    id: 'ds-linked-list',
    name: 'Linked List',
    plainEnglish: 'Nodes connected sequentially by object references.',
    whyItMatters: 'O(1) insertion/removal once the target node pointer is already known.',
    technicalWorking: 'Traversal and search cost O(n); pointer splicing at a known node is O(1).',
    prerequisites: 'Object references and pointers.',
    realLifeAnalogy: 'A chain of coupled train cars.',
    useWhen: 'LRU cache doubly linked lists, specialized deques and intrusive queues.',
    tradeoffs: 'Poor CPU cache locality and extra pointer memory; searching still costs O(n).',
    checkQuestion: 'Why is a linked list not automatically faster than an array?',
  },
  {
    id: 'ds-stack-queue',
    name: 'Stack & Queue',
    plainEnglish: 'Stack is Last-In-First-Out (LIFO); Queue is First-In-First-Out (FIFO).',
    whyItMatters: 'Models nested call/undo work (stack) and ordered task buffering (queue).',
    technicalWorking: 'Push/pop and enqueue/dequeue are O(1) using array ring buffers or linked nodes.',
    prerequisites: 'Arrays or linked lists.',
    realLifeAnalogy: 'Stack: stack of plates. Queue: people waiting at a ticket counter.',
    useWhen: 'Undo history, expression parsing, DFS/BFS and bounded task buffering.',
    tradeoffs: 'Every production queue requires a capacity bound and explicit overload policy.',
    checkQuestion: 'Which structure powers level-order BFS traversal?',
  },
  {
    id: 'ds-hashmap',
    name: 'Hash Map',
    plainEnglish: 'Stores key-value pairs mapped to buckets via a hash function.',
    whyItMatters: 'Average O(1) lookup, insertion and update by key.',
    technicalWorking: 'Hash key to bucket index, resolve collisions (chaining or open addressing), and rehash when load factor exceeds threshold.',
    prerequisites: 'Hashing and key equality semantics.',
    realLifeAnalogy: 'A dictionary indexed directly by word.',
    useWhen: 'Caches, frequency counters, user/session lookups and routing metadata.',
    tradeoffs: 'Poor hash distribution, memory overhead and worst-case collision degradation.',
    checkQuestion: 'Why must two equal keys always return identical hash codes?',
  },
  {
    id: 'ds-heap',
    name: 'Heap / Priority Queue',
    plainEnglish: 'Tree-backed array structure exposing the minimum or maximum priority item at the root.',
    whyItMatters: 'Selects the next most urgent or earliest scheduled item in O(log n).',
    technicalWorking: 'Peek top is O(1); insert (sift-up) and extract top (sift-down) are O(log n).',
    prerequisites: 'Complete binary tree represented in an array.',
    realLifeAnalogy: 'Hospital emergency triage serving highest urgency first.',
    useWhen: 'Timers, job schedulers, Top-K streams, K-way merge and Dijkstra.',
    tradeoffs: 'Inefficient for arbitrary key lookup or full sorted iteration without draining.',
    checkQuestion: 'Why does a min-heap of size K beat sorting all N elements for Top-K?',
  },
  {
    id: 'ds-tree-bst',
    name: 'Tree & Balanced BST',
    plainEnglish: 'Hierarchical nodes where a Binary Search Tree orders keys by comparison.',
    whyItMatters: 'Maintains sorted keys with O(log n) lookup, predecessor/successor and range queries.',
    technicalWorking: 'Self-balancing trees (AVL, Red-Black, B+ Tree) keep height O(log n); unbalanced trees skew to O(n).',
    prerequisites: 'Recursion and total key ordering.',
    realLifeAnalogy: 'A folder hierarchy or sorted index directory.',
    useWhen: 'Database indexes, ordered maps, range queries and syntax trees.',
    tradeoffs: 'Rebalancing rotations and mutation complexity add overhead over hash maps.',
    checkQuestion: 'What input order causes an unbalanced BST to skew into O(n) height?',
  },
  {
    id: 'ds-trie',
    name: 'Trie (Prefix Tree)',
    plainEnglish: 'Tree where each edge represents a character or token along a shared prefix.',
    whyItMatters: 'Prefix search runs in O(key length) regardless of how many words are stored.',
    technicalWorking: 'Traverse character-by-character from root; compress single-child chains (radix tree) to save RAM.',
    prerequisites: 'Trees and string characters.',
    realLifeAnalogy: 'Autocomplete suggestions in a phone contact list.',
    useWhen: 'Autocomplete, spell-checking, dictionaries and IP routing tables.',
    tradeoffs: 'Can consume heavy memory for sparse alphabets without edge compression.',
    checkQuestion: 'Why does Trie lookup time depend on key length rather than total stored words?',
  },
  {
    id: 'ds-graph',
    name: 'Graph',
    plainEnglish: 'Vertices connected by directed or undirected, weighted or unweighted edges.',
    whyItMatters: 'Models real-world relationships, dependencies, networks and routes.',
    technicalWorking: 'Adjacency lists take O(V + E) memory; BFS/DFS run in O(V + E).',
    prerequisites: 'Queues, stacks, recursion and visited sets.',
    realLifeAnalogy: 'A city road map or metro station network.',
    useWhen: 'Social networks, service dependencies, logistics routing and fraud graphs.',
    tradeoffs: 'Cycles, disconnected components and negative edge weights require careful handling.',
    checkQuestion: 'Why are adjacency lists preferred over adjacency matrices for sparse production graphs?',
  },
  {
    id: 'ds-dsu',
    name: 'Disjoint Set Union (Union-Find)',
    plainEnglish: 'Maintains partitioned connected groups with fast union and find-root operations.',
    whyItMatters: 'Tests dynamic connectivity and merges clusters in near-constant amortized time.',
    technicalWorking: 'Path compression flattens parent pointers on find; union by rank/size keeps trees shallow (O(α(n))).',
    prerequisites: 'Parent arrays and graph connectivity.',
    realLifeAnalogy: 'Tracking social friend circles as separate groups merge together.',
    useWhen: 'Kruskal’s MST, network connectivity, duplicate entity clustering and cycle detection in undirected graphs.',
    tradeoffs: 'Does not directly give shortest paths or enumerate group members in sorted order.',
    checkQuestion: 'What performance bottleneck does path compression eliminate?',
  },
  {
    id: 'ds-bloom',
    name: 'Bloom Filter',
    plainEnglish: 'Space-efficient probabilistic bit array testing possible set membership.',
    whyItMatters: 'Blocks expensive disk or database lookups for keys that are definitely absent.',
    technicalWorking: 'k independent hash functions set bits in an m-bit array; lookup returns "definitely absent" if any bit is 0, else "possibly present".',
    prerequisites: 'Hashing and basic probability.',
    realLifeAnalogy: 'A venue bouncer’s quick check that may say "possibly on the list" but never wrongly rejects an invited guest.',
    useWhen: 'LSM SSTable guards, cache-penetration defense and web crawler URL dedup.',
    tradeoffs: 'Cannot list elements or delete safely (without counting variants); false-positive rate rises as the filter fills.',
    checkQuestion: 'What does a Bloom filter false positive mean in a cache-lookup path?',
  },
];

export const ALGORITHM_FAMILIES: AlgorithmFamily[] = [
  {
    id: 'searching',
    name: 'Searching',
    items: [
      { name: 'Linear search', detail: 'O(n); works on unsorted input with zero preprocessing.' },
      { name: 'Binary search', detail: 'O(log n); requires sorted or monotonic search space.' },
      { name: 'Binary search on answer', detail: 'Find min/max feasible value using a monotonic feasibility predicate.' },
    ],
  },
  {
    id: 'sorting',
    name: 'Sorting',
    items: [
      { name: 'Insertion sort', detail: 'Simple, cache-friendly for tiny or nearly sorted arrays.' },
      { name: 'Merge sort', detail: 'Stable O(n log n); requires O(n) auxiliary space on arrays.' },
      { name: 'Quick sort', detail: 'Average O(n log n); worst O(n²) without pivot safeguards.' },
      { name: 'Heap sort', detail: 'Guaranteed O(n log n) in-place, but not stable.' },
      { name: 'Counting / Radix / Bucket', detail: 'Linear-time non-comparison sorts exploiting bounded keys.' },
    ],
  },
  {
    id: 'window-pointers',
    name: 'Two Pointers, Sliding Window & Prefix Sums',
    items: [
      { name: 'Two pointers', detail: 'Process sorted or paired sequences in O(n) without nested loops.' },
      { name: 'Sliding window', detail: 'Maintain contiguous range state incrementally as edges move.' },
      { name: 'Prefix sums', detail: 'Answer range-sum queries in O(1) after O(n) preprocessing (works with negative numbers).' },
    ],
  },
  {
    id: 'backtracking-greedy-dp',
    name: 'Backtracking, Greedy & Dynamic Programming',
    items: [
      { name: 'Recursion & Backtracking', detail: 'Choose → recurse → undo with branch pruning for permutations/combinations/constraints.' },
      { name: 'Greedy', detail: 'Take locally optimal choice ONLY with a correctness proof (intervals, Huffman).' },
      { name: 'Dynamic Programming', detail: 'Define state, transition, base case and order for overlapping subproblems.' },
    ],
  },
  {
    id: 'graphs-strings-specialized',
    name: 'Graphs, Strings & Specialized Optimization',
    items: [
      { name: 'Graph suite', detail: 'BFS (unweighted shortest), DFS (components/cycles), Topo Sort (DAG), Dijkstra (non-negative), Bellman-Ford (negative), Floyd-Warshall, Kruskal/Prim (MST), Tarjan/Kosaraju (SCC).' },
      { name: 'String suite', detail: 'KMP (linear prefix matching), Rabin-Karp (rolling hash), Z algorithm, Trie, Suffix array/tree.' },
      { name: 'Specialized', detail: 'Monotonic stack/queue (next greater / window extrema), Bit manipulation, Meet-in-the-middle, Branch and bound.' },
    ],
  },
];

export const ALGORITHM_SELECTION_CHECKLIST: AlgorithmSelectionRule[] = [
  { signal: 'Input is sorted or feasibility predicate is monotonic', recommendation: 'Binary Search / Binary Search on Answer', why: 'Halves the search space every step to O(log n).' },
  { signal: 'Task asks about a contiguous subarray or substring', recommendation: 'Sliding Window or Prefix Sums + HashMap', why: 'Avoids recomputing overlapping range totals from scratch.' },
  { signal: 'Overlapping subproblems + optimal substructure', recommendation: 'Dynamic Programming (Memoization / Tabulation)', why: 'Caches each state once instead of branching exponentially.' },
  { signal: 'Entities connected by relationships or dependencies', recommendation: 'Graph Modeling (BFS, DFS, Topo Sort, Dijkstra)', why: 'Explicit edge semantics dictate exact traversal or shortest-path family.' },
  { signal: 'Repeatedly need next smallest, largest, or Top-K item', recommendation: 'Heap / Priority Queue', why: 'Maintains running extrema in O(log n) without full re-sorting.' },
  { signal: 'Need O(1) membership checks or negative-lookup filtering', recommendation: 'Hash Set or Bloom Filter', why: 'Eliminates linear scans and protects storage from absent-key misses.' },
  { signal: 'Locally optimal choice is provably safe globally', recommendation: 'Greedy Algorithm', why: 'Achieves O(n log n) or O(n) simplicity once exchange argument holds.' },
  { signal: 'Must generate all valid arrangements or solve constraints', recommendation: 'Backtracking with Pruning', why: 'Explores decision tree cleanly while cutting invalid subtrees early.' },
];

export const OOP_DESIGN_PATTERNS_24: OopDesignPatternItem[] = [
  { id: 'factory-method', name: 'Factory Method', category: 'Creational', intent: 'Create an object through a method while letting subclasses or implementations pick the concrete type.', example: 'Payment provider selection.' },
  { id: 'abstract-factory', name: 'Abstract Factory', category: 'Creational', intent: 'Create families of related objects without exposing concrete classes.', example: 'UI components across themes or platforms.' },
  { id: 'builder', name: 'Builder', category: 'Creational', intent: 'Construct a complex object step-by-step with readable optional configuration.', example: 'Building an HTTP or search request.' },
  { id: 'singleton', name: 'Singleton', category: 'Creational', intent: 'Restrict a type to one shared instance in a defined scope (use cautiously via DI).', example: 'Process-wide configuration registry.' },
  { id: 'prototype', name: 'Prototype', category: 'Creational', intent: 'Create new objects by cloning a preconfigured prototype instance.', example: 'Document or workflow templates.' },
  { id: 'adapter', name: 'Adapter', category: 'Structural', intent: 'Translate an incompatible third-party interface into the interface callers expect.', example: 'Wrapping an external shipping carrier API.' },
  { id: 'decorator', name: 'Decorator', category: 'Structural', intent: 'Layer behavior dynamically around an object without altering its class.', example: 'Adding logging, compression or metrics to a stream.' },
  { id: 'facade', name: 'Facade', category: 'Structural', intent: 'Provide a simple unified entry point over a complex subsystem.', example: 'Checkout facade coordinating inventory, payment and order.' },
  { id: 'proxy', name: 'Proxy', category: 'Structural', intent: 'Represent or control access to another object.', example: 'Lazy loading, remote RPC stub or authorization proxy.' },
  { id: 'composite', name: 'Composite', category: 'Structural', intent: 'Treat individual leaf objects and nested groups uniformly.', example: 'File system folder tree or UI component tree.' },
  { id: 'bridge', name: 'Bridge', category: 'Structural', intent: 'Separate abstraction from implementation so both dimensions vary independently.', example: 'Notification type decoupled from delivery channel.' },
  { id: 'flyweight', name: 'Flyweight', category: 'Structural', intent: 'Share immutable intrinsic state to dramatically reduce memory across many similar objects.', example: 'Reusing font glyph data in text rendering.' },
  { id: 'strategy', name: 'Strategy', category: 'Behavioral', intent: 'Swap interchangeable algorithms cleanly behind a common interface.', example: 'Dynamic pricing or shipping calculation policies.' },
  { id: 'observer', name: 'Observer', category: 'Behavioral', intent: 'Notify registered subscribers automatically when a subject’s state changes.', example: 'Order status updates driving UI or alert subscribers.' },
  { id: 'command', name: 'Command', category: 'Behavioral', intent: 'Encapsulate an action and its parameters as an object.', example: 'Queueable background tasks and undo/redo actions.' },
  { id: 'state', name: 'State', category: 'Behavioral', intent: 'Vary an object’s behavior cleanly according to its internal lifecycle state.', example: 'Order transitions across Pending, Paid and Shipped.' },
  { id: 'chain-of-resp', name: 'Chain of Responsibility', category: 'Behavioral', intent: 'Pass a request through sequential handlers until handled or rejected.', example: 'Authentication, rate-limit and validation filter chains.' },
  { id: 'template-method', name: 'Template Method', category: 'Behavioral', intent: 'Define an invariant workflow skeleton while letting subclasses customize selected steps.', example: 'Data import pipeline with pluggable file parsers.' },
  { id: 'mediator', name: 'Mediator', category: 'Behavioral', intent: 'Centralize complex many-to-many interactions among collaborating objects.', example: 'UI dialog or chat-room coordinator.' },
  { id: 'iterator', name: 'Iterator', category: 'Behavioral', intent: 'Traverse elements of a collection sequentially without exposing internal representation.', example: 'Standard collection or cursor stream iteration.' },
  { id: 'repository', name: 'Repository', category: 'Domain & Architecture', intent: 'Expose domain-focused collection semantics over persisted entities.', example: 'OrderRepository abstracting SQL/ORM queries.' },
  { id: 'unit-of-work', name: 'Unit of Work', category: 'Domain & Architecture', intent: 'Track entity mutations and commit them together in one transaction boundary.', example: 'Atomic multi-entity persistence for a checkout command.' },
  { id: 'specification', name: 'Specification', category: 'Domain & Architecture', intent: 'Represent a reusable business rule as a composable boolean predicate.', example: 'Coupon eligibility or product filtering rules.' },
  { id: 'null-object', name: 'Null Object', category: 'Domain & Architecture', intent: 'Provide a safe no-op implementation instead of scattering defensive null checks.', example: 'No-op metrics recorder or notification sender in tests.' },
];

export const ARCHITECTURAL_PATTERNS_12: ArchitecturePatternItem[] = [
  { id: 'layered', name: 'Layered Architecture', plainEnglish: 'Separate presentation, application, domain and infrastructure responsibilities.', analogy: 'A school separates front office, teaching, records and facilities.', tradeoffs: 'Familiar and simple, but degrades into tight coupling if layers are bypassed.' },
  { id: 'modular-monolith', name: 'Modular Monolith', plainEnglish: 'One deployable application with strictly encapsulated internal domain modules.', analogy: 'One building housing secure, independent departments.', tradeoffs: 'Simple deploys and ACID transactions; requires discipline to keep modules decoupled.' },
  { id: 'microservices', name: 'Microservices', plainEnglish: 'Independently deployable services organized around business capabilities.', analogy: 'Specialist companies cooperating through formal contracts.', tradeoffs: 'Independent scaling and release cadence, at the cost of network, data and ops complexity.' },
  { id: 'hexagonal', name: 'Hexagonal (Ports & Adapters)', plainEnglish: 'Keep domain logic independent of external technologies via explicit ports and adapters.', analogy: 'A universal plug adapter connecting one device to any wall socket.', tradeoffs: 'Highly testable and replaceable infrastructure; requires thoughtful interface boundaries.' },
  { id: 'clean-onion', name: 'Clean / Onion Architecture', plainEnglish: 'Point all source-code dependencies inward toward core business rules.', analogy: 'Outer service rings support the core rather than dictating how it works.', tradeoffs: 'Insulates business rules from framework churn; can feel heavy for tiny apps.' },
  { id: 'eda', name: 'Event-Driven Architecture', plainEnglish: 'Components react asynchronously to published facts/events rather than direct RPCs.', analogy: 'A fire alarm broadcasts an event; multiple teams react independently.', tradeoffs: 'Loose coupling and easy fan-out; harder end-to-end debugging, ordering and eventual consistency.' },
  { id: 'cqrs', name: 'CQRS', plainEnglish: 'Separate models and paths for state-changing commands vs read-optimized queries.', analogy: 'A store’s stock-receiving workflow differs from its customer display catalog.', tradeoffs: 'Optimizes asymmetric read/write workloads; introduces model duplication and sync lag.' },
  { id: 'event-sourcing', name: 'Event Sourcing', plainEnglish: 'Persist state transitions as an immutable append-only event log.', analogy: 'A bank passbook logs every deposit and withdrawal rather than overwriting only the balance.', tradeoffs: 'Full audit trail and replay; schema evolution and event-log management are demanding.' },
  { id: 'serverless', name: 'Serverless', plainEnglish: 'Run event-driven functions and managed services without provisioning servers.', analogy: 'Taking a taxi per trip instead of owning and maintaining a fleet.', tradeoffs: 'Elastic scale-to-zero and low ops; cold starts, execution limits and vendor coupling.' },
  { id: 'strangler-fig', name: 'Strangler Fig', plainEnglish: 'Incrementally replace a legacy system by routing selected capabilities to new services.', analogy: 'Renovating one wing of a building while the rest stays open.', tradeoffs: 'Eliminates big-bang rewrite risk; requires clean routing and coexistence discipline.' },
  { id: 'sidecar', name: 'Sidecar', plainEnglish: 'Co-locate a helper container alongside an application for cross-cutting concerns.', analogy: 'A dedicated assistant accompanying a specialist.', tradeoffs: 'Separates networking/telemetry from business code; adds per-pod resource overhead.' },
  { id: 'saga', name: 'Saga', plainEnglish: 'Coordinate multi-service workflows via local transactions and compensating actions.', analogy: 'A travel itinerary where failing one booking triggers cancelling earlier reservations.', tradeoffs: 'Avoids global distributed locks; compensations are business logic and not true rollbacks.' },
];

export const HLD_BUILDING_BLOCKS_18: HldBuildingBlockItem[] = [
  { id: 'hld-lb', name: 'Load Balancer', plainEnglish: 'Distributes incoming traffic across healthy backend instances.', technicalWorking: 'Health probes, routing policy (round-robin, least-connections), connection management and failover.', analogy: 'A dispatcher directing customers to open counters.', tradeoffs: 'Sticky sessions hurt stateless scaling; choose algorithm by request duration.' },
  { id: 'hld-gateway', name: 'API Gateway', plainEnglish: 'Managed front door handling routing, auth, rate limiting and telemetry.', technicalWorking: 'Matches path/host rules, enforces ingress policies, forwards requests and emits logs/metrics.', analogy: 'A building reception desk checking visitors and directing them.', tradeoffs: 'Avoid putting domain business logic in the gateway or creating a single bottleneck.' },
  { id: 'hld-cache', name: 'Cache', plainEnglish: 'Stores reusable data closer to compute to cut latency and origin load.', technicalWorking: 'Key lookup, TTL, eviction policy, invalidation and miss/stampede protection.', analogy: 'Keeping frequently used tools on a workbench shelf.', tradeoffs: 'Fast reads vs staleness, invalidation bugs and stampede risks.' },
  { id: 'hld-cdn', name: 'CDN', plainEnglish: 'Caches and delivers content from geographically distributed edge PoPs.', technicalWorking: 'Routes user to nearest edge; serves hit or fetches origin according to Cache-Control rules.', analogy: 'Regional distribution depots shortening delivery distance.', tradeoffs: 'Ideal for static/media and cacheable reads; private data demands strict cache-key rules.' },
  { id: 'hld-queue', name: 'Message Queue', plainEnglish: 'Buffers work asynchronously between producers and consumers.', technicalWorking: 'Producer publishes; broker persists; consumer processes and acks; retries + DLQ isolate failures.', analogy: 'Order tickets waiting in a kitchen rail during dinner rush.', tradeoffs: 'Smooths spikes but adds latency and at-least-once duplicate delivery semantics.' },
  { id: 'hld-search', name: 'Search Index', plainEnglish: 'Specialized inverted index for full-text retrieval, faceting and ranking.', technicalWorking: 'Tokenizes documents into postings lists and ranks matches (e.g., BM25).', analogy: 'A library subject catalog pointing to matching shelves.', tradeoffs: 'Usually eventually consistent with source DB; do not treat as transactional source of truth.' },
  { id: 'hld-object-store', name: 'Object Storage', plainEnglish: 'Stores large immutable blobs by key with metadata and lifecycle policies.', technicalWorking: 'HTTP upload/download, replication/erasure coding durability, presigned URLs and tiering.', analogy: 'A warehouse storing crates while a ledger tracks box numbers.', tradeoffs: 'Unbeatable for media/backups; not a substitute for transactional row queries.' },
  { id: 'hld-rate-limiter', name: 'Rate Limiter', plainEnglish: 'Caps request volume per user, IP or tenant to protect capacity.', technicalWorking: 'Token bucket / sliding window counters reject or delay excess requests (HTTP 429).', analogy: 'A venue controlling how many people enter per minute.', tradeoffs: 'Distributed counter accuracy, clock skew and fail-open vs fail-closed policy matter.' },
  { id: 'hld-discovery', name: 'Service Discovery', plainEnglish: 'Dynamically maps logical service names to currently healthy instance endpoints.', technicalWorking: 'Registry or platform DNS refreshes healthy endpoints via heartbeats/readiness checks.', analogy: 'A live company directory showing active desk extensions.', tradeoffs: 'Stale client caches need TTL bounds, health checks and retry budgets.' },
  { id: 'hld-dlock', name: 'Distributed Lock', plainEnglish: 'Coordinates exclusive access to a shared resource across separate processes.', technicalWorking: 'Time-bounded lease paired with monotonic fencing tokens validated by downstream storage.', analogy: 'A timed key card for a shared conference room.', tradeoffs: 'Leases alone are unsafe after GC pauses; prefer DB unique constraints or fencing tokens.' },
  { id: 'hld-cb', name: 'Circuit Breaker', plainEnglish: 'Temporarily stops calling a failing dependency to prevent cascading overload.', technicalWorking: 'Closed allows calls; Open fails fast; Half-Open sends probe requests to verify recovery.', analogy: 'Closing a broken checkout lane until a technician tests it.', tradeoffs: 'Requires tuned error thresholds and fallbacks; never replaces per-call timeouts.' },
  { id: 'hld-bulkhead', name: 'Bulkhead', plainEnglish: 'Isolates resource pools so one slow dependency cannot exhaust the entire service.', technicalWorking: 'Separate thread pools, connection pools, queues or tenant quotas.', analogy: 'Watertight ship compartments containing a leak.', tradeoffs: 'Adds reserved capacity overhead; size boundaries by failure domain.' },
  { id: 'hld-retry', name: 'Retry with Backoff & Jitter', plainEnglish: 'Repeats transient failures after randomized exponentially growing delays.', technicalWorking: 'Bounded attempts + exponential delay + random jitter on idempotent/safe operations only.', analogy: 'Waiting progressively longer before redialing a busy line.', tradeoffs: 'Unbounded retries amplify outages into retry storms; enforce retry budgets.' },
  { id: 'hld-replica', name: 'Read Replica', plainEnglish: 'Database copy serving read traffic and aiding failover recovery.', technicalWorking: 'Primary streams WAL/binlog to replicas asynchronously or synchronously.', analogy: 'Photocopying a master ledger for read-only clerks.', tradeoffs: 'Async lag causes stale read-after-write unless writers route to primary.' },
  { id: 'hld-sharding', name: 'Sharding', plainEnglish: 'Distributes table rows horizontally across multiple independent database nodes.', technicalWorking: 'Shard key hashes/maps records to nodes; router targets the right shard.', analogy: 'Splitting a national archive across regional offices by customer ID.', tradeoffs: 'Hot keys, cross-shard joins, distributed transactions and resharding are costly.' },
  { id: 'hld-chash', name: 'Consistent Hashing', plainEnglish: 'Maps keys and nodes onto a hash ring to minimize key movement on cluster changes.', technicalWorking: 'Hash keys and virtual nodes onto ring; route clockwise to next live node.', analogy: 'A circular seating chart where adding one chair shifts only neighboring seats.', tradeoffs: 'Needs virtual nodes to prevent uneven skew; still requires replication strategy.' },
  { id: 'hld-replication', name: 'Replication', plainEnglish: 'Maintains synchronized or converging copies of data across machines.', technicalWorking: 'Leader-follower, multi-leader or leaderless quorum protocols propagate updates.', analogy: 'Keeping verified copies of vital records in separate buildings.', tradeoffs: 'Improves durability/read scale while introducing lag, conflicts and consistency choices.' },
  { id: 'hld-partitioning', name: 'Partitioning', plainEnglish: 'Divides one large table or dataset into smaller logical/physical segments.', technicalWorking: 'Range, list or hash key routes queries and enables partition pruning/retention drops.', analogy: 'Filing a giant cabinet into labeled yearly drawers.', tradeoffs: 'Improves maintenance and scans; poor partition keys create hot skew.' },
];

export const CAPACITY_FORMULAS: CapacityFormula[] = [
  { name: 'Average & Peak RPS', formula: 'RPS = (Daily Requests ÷ 86,400) × Peak-to-Average Factor', note: 'Always separate daily average from peak traffic bursts (typically 2×–5×, or 20× during flash sales).' },
  { name: 'Concurrent Requests (Little’s Law)', formula: 'L ≈ Arrival Rate (RPS) × Average Response Time (seconds)', note: 'Reveals how many worker threads or open sockets are active simultaneously.' },
  { name: 'Storage Capacity', formula: 'Storage = Records/Day × Avg Bytes × Retention Days × Replication × Index Overhead', note: 'Include thumbnails, indexes, WAL logs and backups—never count raw payload alone.' },
  { name: 'Network Bandwidth', formula: 'Bandwidth ≈ Peak RPS × Average Payload Size (bytes/sec)', note: 'Check ingress vs egress separately; media egress drives CDN economics.' },
  { name: 'Cache Hit Ratio', formula: 'Hit Ratio = Cache Hits ÷ Total Cache Requests', note: 'A drop from 98% to 90% hit ratio multiplies origin database read load by 5×.' },
  { name: 'Availability', formula: 'Availability = Successful Usable Time ÷ Total Time', note: '99.9% ≈ 43.8 min/month downtime; 99.99% ≈ 4.38 min/month.' },
];

export const CAPACITY_PRESETS: CapacityPreset[] = [
  {
    id: 'photo-sharing',
    name: 'Photo Sharing Service (Handbook Worked Example)',
    subtitle: '1M DAU · 2 photos/day · 3 MB/photo → ~6 TB/day raw uploads',
    dauMillions: 1,
    actionsPerUserPerDay: 2,
    peakFactor: 3,
    avgLatencyMs: 250,
    payloadKb: 3072,
    retentionDays: 365,
    replicationFactor: 3,
    takeaway: 'At ~6 TB/day raw (before thumbnails, metadata and replicas), media belongs in Object Storage, metadata in a queryable DB, and delivery needs a CDN + lifecycle tiering.',
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener Redirects',
    subtitle: '50M DAU · 4 redirects/day · 1 KB payload · 5-year retention',
    dauMillions: 50,
    actionsPerUserPerDay: 4,
    peakFactor: 3,
    avgLatencyMs: 20,
    payloadKb: 1,
    retentionDays: 1825,
    replicationFactor: 3,
    takeaway: 'Read-heavy (~6,900 Peak RPS) with tiny records: Redis hot-key cache absorbs >90% of traffic while a single well-indexed DB + replicas easily holds metadata.',
  },
  {
    id: 'flash-sale-20x',
    name: 'E-Commerce Flash Sale (20× Peak)',
    subtitle: '5M DAU · 10 actions/day · 20× burst · 8 KB payload',
    dauMillions: 5,
    actionsPerUserPerDay: 10,
    peakFactor: 20,
    avgLatencyMs: 120,
    payloadKb: 8,
    retentionDays: 90,
    replicationFactor: 3,
    takeaway: '20× burst produces massive concurrency (~1,390 concurrent requests per 120ms): serve catalogue via CDN/cache, enforce per-user rate limits, and keep stock deduction atomic.',
  },
];

export const ESTIMATION_MISTAKES: string[] = [
  'Confusing daily average RPS with peak burst traffic.',
  'Ignoring retries, replicas, secondary indexes, thumbnails and operational logs.',
  'Assuming all Daily Active Users are active at the exact same second.',
  'Quoting hyper-precise numbers without stating assumptions aloud.',
  'Computing capacity totals without identifying the actual bottleneck or cost driver.',
];

export const INTERVIEW_7_STEPS: InterviewPlaybookStep[] = [
  {
    step: 1,
    title: 'Clarify requirements',
    duration: '5 min',
    focus: 'Lock scope before drawing any boxes.',
    deliverables: ['Target users & top 3 functional flows', 'Scale, regions, latency & consistency needs', 'Privacy/security expectations & explicit exclusions'],
  },
  {
    step: 2,
    title: 'Estimate scale',
    duration: '5 min',
    focus: 'Use rough math to expose architectural constraints.',
    deliverables: ['DAU, average RPS & peak RPS', 'Read/write ratio & hot-key skew', 'Daily/retention storage & ingress/egress bandwidth'],
  },
  {
    step: 3,
    title: 'Define APIs & data model',
    duration: '5–10 min',
    focus: 'Make contracts, ownership and query shapes concrete.',
    deliverables: ['Core REST/gRPC endpoints or async events', 'Primary entities, composite indexes & shard keys', 'Pagination, idempotency keys & data retention'],
  },
  {
    step: 4,
    title: 'Draw the basic architecture',
    duration: '10 min',
    focus: 'Keep the first version clean and end-to-end.',
    deliverables: ['Client → Gateway/LB → Stateless Services → DB', 'External integrations & async queues where justified', 'Trace one read path and one write path'],
  },
  {
    step: 5,
    title: 'Deep dive into highest-risk areas',
    duration: '15–20 min',
    focus: 'Solve the 2–3 hardest domain bottlenecks.',
    deliverables: ['Feed ranking / chat delivery / booking concurrency / search', 'Cache invalidation & stampede protection', 'Hot-partition mitigation & state machine invariants'],
  },
  {
    step: 6,
    title: 'Reliability, security & operations',
    duration: '5–10 min',
    focus: 'Show production engineering maturity.',
    deliverables: ['Timeouts, bulkheads, circuit breakers & bounded retries', 'AuthN/AuthZ, tenant isolation & encryption', 'Logs, metrics, traces, backups & RPO/RTO recovery'],
  },
  {
    step: 7,
    title: 'Trade-offs & 10× recap',
    duration: 'Final 3–5 min',
    focus: 'Defend choices and distinguish now vs future scale.',
    deliverables: ['Why this architecture fits current requirements', 'Key trade-offs accepted (consistency, cost, complexity)', 'What changes first if load grows 10×'],
  },
];

export const INTERVIEW_COMMUNICATION_CHECKLIST: string[] = [
  'State assumptions out loud before calculating or choosing storage.',
  'Keep the first architecture simple; add complexity only when a constraint demands it.',
  'Explain why each component exists instead of drawing boxes from habit.',
  'Never name a technology (Kafka, Redis, Cassandra) without stating its exact role.',
  'Proactively surface bottlenecks and failure modes before being asked.',
  'Invite interviewer feedback and adjust when constraints change.',
  'Clearly distinguish today’s requirements from future 10× scale.',
];

export const HANDBOOK_CASE_STUDIES_10: HandbookCaseStudy[] = [
  {
    id: 'upi-payment',
    title: 'UPI-Style Payment Workflow',
    group: 'Indian Real-World Walkthroughs',
    disclaimer: 'Educational architecture model only — not actual NPCI internal specifications.',
    plainEnglish: 'Move money safely across banks and network services with zero duplicate debits even when mobile networks drop.',
    whyItMatters: 'Teaches payment state machines, idempotency, uncertain timeout handling, immutable audit ledgers and reconciliation.',
    prerequisites: 'APIs, ACID transactions, distributed failures, security and state machines.',
    analogy: 'Paying a local shop via QR code: the payer wants exactly one debit and the merchant wants one confirmed credit even if mobile data drops mid-request.',
    stepByStepWorking: [
      'Create payment intent with a globally unique transaction reference and idempotency key.',
      'Authenticate payer and validate transaction amount, limits and merchant identity.',
      'Submit authorization/processing instruction to payment network participant with strict deadline.',
      'Persist legal state transitions (CREATED → PROCESSING → SUCCESS | FAILED | REVERSED).',
      'Return pending, success or failure cleanly to client without hiding uncertain outcomes.',
      'Run status inquiry and scheduled reconciliation jobs to resolve timed-out or delayed settlements.',
    ],
    designDecisions: 'Separate payment intent, execution attempts and immutable ledger entries. Enforce strict authorization, encryption, rate limits and idempotency. Never treat a client timeout as proof of failure.',
    failureModes: 'Duplicate debit on retry, delayed bank callback, uncertain timeout after commit, replay attacks, fraud and ledger reconciliation backlog.',
    practiceTask: 'Define legal state transitions among CREATED, PROCESSING, SUCCESS, FAILED and REVERSED and specify which actor may perform each.',
    masteryTest: 'Can you guarantee that retrying with the same transaction reference can never trigger a second financial debit?',
  },
  {
    id: 'irctc-seat-reservation',
    title: 'IRCTC-Style Seat Reservation',
    group: 'Indian Real-World Walkthroughs',
    disclaimer: 'Educational architecture model only — not actual IRCTC internal specifications.',
    plainEnglish: 'Allocate scarce seat inventory fairly to massive bursts of concurrent passengers without overselling.',
    whyItMatters: 'Teaches concurrency control, time-bounded temporary holds, hold expiry, payment coordination and admission fairness.',
    prerequisites: 'Transactions, pessimistic/optimistic concurrency, idempotency and queues.',
    analogy: 'Hundreds of passengers trying to book the final seat during a festival rush.',
    stepByStepWorking: [
      'Serve availability searches from read-optimized views/caches to absorb browsing spikes.',
      'Acquire a short-lived temporary seat hold via atomic conditional update or unique seat allocation constraint.',
      'Initiate payment linked to the hold ID and idempotency key.',
      'On payment confirmation within TTL, atomically commit the booking and issue PNR.',
      'Release unpaid or expired holds automatically via expiry sweeper/scheduler.',
    ],
    designDecisions: 'Durable booking state machine, unique seat allocation constraint, expiry scheduler, payment idempotency and peak admission control / virtual waiting room.',
    failureModes: 'Overselling under concurrent reads, expired hold paid late, payment captured but confirmation dropped, bot floods and hot-train row contention.',
    practiceTask: 'Write SQL for reserving one seat only if status is AVAILABLE, showing the transaction and unique constraint.',
    masteryTest: 'Can you explain how the system recovers safely if payment succeeds but the confirmation response is lost?',
  },
  {
    id: 'food-delivery',
    title: 'Food Delivery Platform',
    group: 'Indian Real-World Walkthroughs',
    plainEnglish: 'Connect customers, restaurants, couriers and payment providers through a real-time, location-aware order workflow.',
    whyItMatters: 'Combines geospatial matching, order state machines, asynchronous dispatch queues, saga compensations and live tracking.',
    prerequisites: 'APIs, database modeling, geospatial indexing, queues, saga and observability.',
    analogy: 'Ordering dosa during Bengaluru rain: kitchen prep time, rider availability, traffic, customer pin and possible cancellations all reshape the order.',
    stepByStepWorking: [
      'Search nearby open restaurants using a geospatial index and read-optimized catalog.',
      'Create order and validate menu/pricing; await restaurant acceptance and prep estimate.',
      'Publish dispatch event to match and assign an available nearby courier atomically.',
      'Stream live rider location updates and order milestones to customer and restaurant.',
      'Complete delivery, settle payout/payment and emit notifications asynchronously.',
    ],
    designDecisions: 'Decouple catalog/search from order workflow. Use geospatial indexes for nearby candidates, idempotent status transitions, assignment queues and event-driven notifications.',
    failureModes: 'No courier available in rain surge, restaurant rejects after payment, stale rider GPS, duplicate courier acceptance and payment/refund mismatches.',
    practiceTask: 'Define the complete order state machine and compensating actions when a restaurant rejects an order after payment capture.',
    masteryTest: 'Can you separate which fields require strong consistency vs eventual consistency?',
  },
  {
    id: 'ecommerce-flash-sale',
    title: 'E-Commerce Catalogue & Flash Sale',
    group: 'Indian Real-World Walkthroughs',
    plainEnglish: 'Serve huge product browse traffic cheaply while keeping sudden 20× flash-sale stock reservations strictly accurate.',
    whyItMatters: 'Teaches read scaling, CDN/cache design, search indexing, rate limiting, overload shedding and atomic stock reservation.',
    prerequisites: 'Cache, CDN, search index, database indexing, queues and idempotency.',
    analogy: 'A festive mega-sale brings 20× normal shoppers: catalog boards outside serve browsers, while the cash desk guards real inventory.',
    stepByStepWorking: [
      'Serve product pages, images and search from CDN, Redis and search index.',
      'Apply per-user rate limits and admission queueing on hot flash-sale checkout paths.',
      'Validate authoritative price and stock directly against the Inventory service.',
      'Execute atomic stock reservation before creating the order.',
      'Process order confirmation, invoicing and analytics asynchronously via durable queues.',
    ],
    designDecisions: 'Separate read models for browse/search from authoritative stock writes. Cache static descriptions aggressively, cap per-user quantity, and shed non-critical widgets under overload.',
    failureModes: 'Stale displayed price, overselling hot SKUs, cache stampede on sale start, bot scalping and downstream queue backlog.',
    practiceTask: 'Estimate peak RPS at 20× normal traffic and design a graceful overload policy.',
    masteryTest: 'Can you explain why the search index and cache must never be the final authority for stock?',
  },
  {
    id: 'apartment-multitenant',
    title: 'Apartment Community Multi-Tenant SaaS',
    group: 'Indian Real-World Walkthroughs',
    plainEnglish: 'Serve thousands of apartment societies on one SaaS platform while making cross-society data leakage impossible.',
    whyItMatters: 'Teaches strict multi-tenant isolation, RBAC, composite tenant indexing, audit trails and noisy-neighbor protection.',
    prerequisites: 'Authentication, authorization, relational schemas, API gateway and audit logs.',
    analogy: 'A gated community app serves residents, guards, facility staff and committees across hundreds of societies—Society A must never see Society B’s visitor logs.',
    stepByStepWorking: [
      'Authenticate caller and resolve verified tenant/society membership server-side.',
      'Authorize requested action against the caller’s role and permissions inside that society.',
      'Execute tenant-scoped queries indexed by (tenant_id, ...) and tenant-prefixed cache keys.',
      'Record immutable audit logs for sensitive actions (visitor approvals, billing, role edits).',
      'Enforce per-tenant rate limits and quotas on APIs and background exports.',
    ],
    designDecisions: 'Mandatory tenant_id across tables and composite indexes, least-privilege RBAC, per-tenant quotas, and optional dedicated DB tier for high-isolation enterprise societies.',
    failureModes: 'Missing tenant filter on one query, confused-deputy authorization, cross-tenant cache collision, leaked async export and noisy-neighbor spikes.',
    practiceTask: 'Review a visitor CRUD API and list every place tenant_id must be enforced, including background jobs and file exports.',
    masteryTest: 'Can you prove why frontend route hiding is never authorization?',
  },
  {
    id: 'url-shortener',
    title: 'URL Shortener',
    group: 'Core Case Studies',
    plainEnglish: 'Turn long URLs into compact short codes and redirect readers rapidly at high read-to-write ratios.',
    whyItMatters: 'Teaches clean API design, unique key generation, indexed lookups, caching and read-heavy scaling.',
    prerequisites: 'HTTP redirects, hash maps, database indexes and caching.',
    analogy: 'A coat-check ticket maps a small tag number to a stored coat.',
    stepByStepWorking: [
      'Validate target URL and enforce abuse/rate limits on create.',
      'Generate unique short code (Base62 encoded counter or collision-checked random ID).',
      'Persist mapping durably and return short link.',
      'On redirect, check Redis cache (plus optional Bloom filter), fall back to DB, and return 301/302.',
      'Emit click analytics asynchronously without delaying redirect response.',
    ],
    designDecisions: 'Optimize heavily for reads via Redis cache and optional edge caching; choose 301 vs 302 explicitly based on analytics vs origin offload needs.',
    failureModes: 'Hash collisions on short random codes, predictable sequential IDs leaking volume, cache penetration from random spam probes and malicious phishing targets.',
    practiceTask: 'Compare 301 vs 302 redirects and design expiry + cache invalidation for temporary links.',
    masteryTest: 'Can you justify your short-code generation strategy against both collision risk and volume leakage?',
  },
  {
    id: 'chat-application',
    title: 'Real-Time Chat Application',
    group: 'Core Case Studies',
    plainEnglish: 'Deliver messages between online and offline users with predictable per-conversation ordering and deduplication.',
    whyItMatters: 'Teaches persistent WebSocket connections, durable message storage, fan-out, presence and offline sync.',
    prerequisites: 'WebSocket, queues, database partitioning and idempotency.',
    analogy: 'A post office logs letters safely, delivers immediately if you are home, and holds mail for pickup when you return.',
    stepByStepWorking: [
      'Client opens authenticated WebSocket connection to a stateful chat gateway.',
      'Sender transmits message with client_msg_id; service persists to conversation partition.',
      'Broker fans message out to recipient gateways based on active connection registry.',
      'Online recipients receive live WebSocket frames; offline users get push notifications.',
      'Reconnecting clients sync missed messages using their last acknowledged sequence cursor.',
    ],
    designDecisions: 'Partition message storage by conversation_id, deduplicate sends via client_msg_id, track active gateway ownership in Redis, and bound group fan-out.',
    failureModes: 'Duplicate messages on flaky mobile retries, out-of-order display from client clock skew, thundering reconnects on gateway restart and massive group fan-out lag.',
    practiceTask: 'Design message delivery and offline catch-up when a user reconnects to a different WebSocket gateway.',
    masteryTest: 'Can you define your exact ordering guarantee (per-conversation vs global) and how duplicates are prevented?',
  },
  {
    id: 'ecommerce-checkout',
    title: 'E-Commerce Checkout',
    group: 'Core Case Studies',
    plainEnglish: 'Coordinate cart validation, stock reservation, payment collection and fulfillment reliably across services.',
    whyItMatters: 'Teaches local transactions, idempotency, Saga orchestration/choreography, inventory contention and external payment APIs.',
    prerequisites: 'Database transactions, queues, retries, idempotency and Saga pattern.',
    analogy: 'A store holds an item briefly while card payment confirms, releasing it back to the shelf if payment fails.',
    stepByStepWorking: [
      'Validate cart items, pricing and promotions.',
      'Atomically reserve stock with a short lease expiry.',
      'Create PENDING order and invoke payment provider with an idempotency key.',
      'Confirm reservation and publish OrderConfirmed event via transactional outbox.',
      'On payment failure or timeout, execute compensating action to release reserved stock.',
    ],
    designDecisions: 'Model explicit PENDING/CONFIRMED/CANCELLED states, persist transactional outbox events, and make every external call and consumer idempotent.',
    failureModes: 'Assuming multi-service steps commit atomically, orphaned stock locks on crash, duplicate charges on retry and webhook/response race conditions.',
    practiceTask: 'Trace failure recovery when payment authorization succeeds right before the checkout server crashes.',
    masteryTest: 'Can you explain why compensating actions cannot always perfectly undo external side effects?',
  },
  {
    id: 'news-social-feed',
    title: 'News & Social Feed',
    group: 'Core Case Studies',
    plainEnglish: 'Serve a fast, personalized, ranked timeline of posts using hybrid fan-out and cursor pagination.',
    whyItMatters: 'Teaches fan-out-on-write vs fan-out-on-read, ranking pipelines, caching and hot-celebrity mitigation.',
    prerequisites: 'Queues, cache, database indexes and cursor pagination.',
    analogy: 'A newspaper delivers regular issues to subscribers ahead of time, while rare celebrity special editions are fetched on demand.',
    stepByStepWorking: [
      'Persist new post and media references durably.',
      'For normal accounts, asynchronously fan-out post IDs into followers’ Redis timelines.',
      'For high-follower celebrity accounts, skip mass fan-out and store in a celebrity post list.',
      'On feed load, merge precomputed timeline with followed celebrities’ recent posts, rank and hydrate.',
      'Return bounded pages using stable cursor pagination.',
    ],
    designDecisions: 'Hybrid fan-out threshold balances write amplification against read latency; evict timelines for inactive users to save RAM.',
    failureModes: 'Queue stalls from pure fan-out-on-write on celebrity posts, slow read-time joins on pure fan-out-on-read and duplicate posts during pagination.',
    practiceTask: 'Choose a celebrity threshold and sketch the merge-and-rank step for a user following 300 regular accounts and 5 celebrities.',
    masteryTest: 'Can you explain the exact write-amplification vs read-latency trade-off of both fan-out modes?',
  },
  {
    id: 'video-streaming',
    title: 'Video Streaming Platform',
    group: 'Core Case Studies',
    plainEnglish: 'Upload raw videos, transcode multiple quality renditions asynchronously and stream adaptive chunks globally.',
    whyItMatters: 'Teaches object storage, asynchronous DAG processing, CDN edge delivery, adaptive bitrate manifests and access controls.',
    prerequisites: 'Object storage, queues, CDN and HTTP chunked streaming.',
    analogy: 'A central studio produces multiple screen formats and regional depots distribute copies close to local audiences.',
    stepByStepWorking: [
      'Issue presigned multipart upload URL directly to object storage.',
      'Trigger async transcoding job via queue to segment and encode multiple bitrates/codecs.',
      'Generate HLS/DASH manifests and persist video metadata & status in database.',
      'Deliver video chunks via global CDN edges with signed access policy where needed.',
      'Player adapts bitrate chunk-by-chunk as client network conditions fluctuate.',
    ],
    designDecisions: 'Keep binary uploads off API servers, parallelize chunk transcoding, and cache immutable media segments aggressively at the CDN edge.',
    failureModes: 'API server OOM from proxying large uploads, failed/stuck transcoding workers, runaway egress bandwidth cost and leaked private video URLs.',
    practiceTask: 'Design retry/DLQ handling for failed transcoding segments and signed URL access for paid course videos.',
    masteryTest: 'Can you explain how adaptive bitrate chunking improves both startup latency and CDN cache hit ratio?',
  },
];

export const FIVE_PASS_STUDY_METHOD: StudyPass[] = [
  { pass: 1, name: 'Vocabulary', goal: 'Define every core term accurately in plain English.', action: 'Write a 1-sentence definition without jargon.' },
  { pass: 2, name: 'Mechanism', goal: 'Trace how data moves step-by-step inside the component.', action: 'Draw the request/data flow diagram from memory.' },
  { pass: 3, name: 'Invariant & Correctness', goal: 'State what must always remain true even under concurrency.', action: 'Identify the single rule whose violation corrupts data.' },
  { pass: 4, name: 'Operational Trade-offs', goal: 'Evaluate latency, capacity, failure modes and cost.', action: 'List what breaks first and the exact recovery fallback.' },
  { pass: 5, name: 'Design Application', goal: 'Apply the concept inside a real end-to-end architecture.', action: 'Solve one unfamiliar design prompt or build a mini prototype.' },
];

export const EXPLANATION_8_STEP_FRAMEWORK: ExplanationStep[] = [
  { step: 1, name: 'Definition', prompt: 'What is it in plain, accurate English?' },
  { step: 2, name: 'Problem', prompt: 'What specific pain or scaling constraint does it solve?' },
  { step: 3, name: 'Mechanism', prompt: 'What happens step-by-step under the hood?' },
  { step: 4, name: 'Correctness', prompt: 'What invariant must always remain true?' },
  { step: 5, name: 'Trade-off', prompt: 'What do we gain, and what latency/consistency/complexity price do we pay?' },
  { step: 6, name: 'Failure', prompt: 'What happens when a node, dependency, message or network link fails?' },
  { step: 7, name: 'Application', prompt: 'Where would you deploy it in a real production system?' },
  { step: 8, name: 'Alternative', prompt: 'What else could solve the problem, and why not choose it here?' },
];

export const MASTERY_LEVEL_CHECKPOINTS: MasteryCheckpointTier[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    summary: 'Core vocabulary, simple request flows and foundational CS fluency.',
    skills: [
      'Define latency, throughput, availability, durability and consistency accurately.',
      'Draw a clean Client → LB → App → DB request flow.',
      'Calculate Big O time and space complexity for common loops and traversals.',
      'Explain arrays, hash maps, stacks, queues and the HTTP/TLS request lifecycle.',
    ],
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    summary: 'Practical API, schema, caching, queueing and capacity design.',
    skills: [
      'Design clean REST APIs with cursor pagination, validation and idempotency keys.',
      'Choose SQL vs NoSQL, cache placement and queues based on measured workload.',
      'Implement common LLD patterns (Strategy, State, Factory, Repository) cleanly.',
      'Estimate average/peak RPS, storage and bandwidth; explain retries with backoff & jitter.',
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced',
    summary: 'Distributed failure reasoning, consistency models and multi-service workflows.',
    skills: [
      'Reason rigorously about network partitions, uncertain timeouts and partial failure.',
      'Design quorum policies, replication topologies and shard keys avoiding hot partitions.',
      'Orchestrate cross-service Sagas, transactional outbox and event-sourced projections.',
      'Defend consistency, latency and failure-domain trade-offs under interrogation.',
    ],
  },
  {
    id: 'staff',
    label: 'Senior / Staff-Oriented',
    summary: 'System boundaries, business SLO alignment, migrations and organizational risk.',
    skills: [
      'Set durable service and team ownership boundaries without premature microservices.',
      'Align architecture investments directly to business SLOs, error budgets and cost ceilings.',
      'Lead zero-downtime migrations (Strangler Fig, dual-write, resharding) with rollback plans.',
      'Define operational ownership, DR restore drills and blast-radius isolation.',
    ],
  },
];

export const ROADMAP_13_WEEKS: RoadmapWeek[] = [
  { weeks: 'Weeks 1–2', phase: 'Foundations', focus: 'Programming runtime, OOP, Big O, arrays, hash maps, stacks, queues, trees and graphs.', habit: 'Solve 3–5 focused problems per study day.' },
  { weeks: 'Weeks 3–4', phase: 'Algorithms', focus: 'Binary search, sorting, sliding window, recursion, backtracking, DP, greedy and graph algorithms.', habit: 'Write the loop invariant and complexity proof for every solution.' },
  { weeks: 'Week 5', phase: 'Networking', focus: 'DNS, TCP/UDP, HTTP, TLS, REST, WebSocket, SSE and load balancing basics.', habit: 'Trace one full browser-to-database packet flow from memory.' },
  { weeks: 'Week 6', phase: 'Databases', focus: 'SQL, B+ tree vs LSM indexes, ACID transactions, isolation anomalies, replication, partitioning and NoSQL.', habit: 'Design composite indexes and inspect query plans.' },
  { weeks: 'Weeks 7–8', phase: 'Low-Level Design', focus: 'SOLID, composition over inheritance, UML diagrams, GoF patterns and Repository/Unit of Work.', habit: 'Complete 4–6 clean object-oriented design exercises.' },
  { weeks: 'Weeks 9–10', phase: 'HLD Building Blocks', focus: 'Cache, CDN, queues, API gateway, rate limiter, object storage, search index, sharding and discovery.', habit: 'Build mini implementations: LRU cache and Token Bucket.' },
  { weeks: 'Weeks 11–12', phase: 'Distributed Systems', focus: 'CAP/PACELC, consistency models, quorum reads/writes, Raft consensus, Saga, outbox and fault tolerance.', habit: 'Analyze partial failure and timeout recovery on every flow.' },
  { weeks: 'Weeks 13+', phase: 'End-to-End Case Studies', focus: 'UPI payments, IRCTC holds, food delivery, flash sales, chat, social feeds, video streaming and multi-tenant SaaS.', habit: 'Design 2 systems/week in 45-minute mock drills and maintain a trade-off journal.' },
];

export const WEEKLY_LEARNING_LOOP: string[] = [
  'Study one concept and write a concise one-page plain-English explanation.',
  'Draw its architecture or algorithm trace from memory without peeking.',
  'Implement a small working prototype or simulation (e.g., LRU cache, token bucket, idempotent endpoint).',
  'Solve one related interview or failure-analysis problem.',
  'Teach the concept aloud in 5 minutes using the 8-step framework.',
  'Review the topic after 1 day, 1 week and 1 month to lock long-term retention.',
];

export const TOPIC_DOCUMENTATION_TEMPLATE_22: string[] = [
  'Topic name and category',
  'One-sentence plain-English definition',
  'Problem it solves',
  'Why the problem matters at scale',
  'Prerequisite concepts',
  'Real-life analogy (and where the analogy breaks)',
  'Technical components and terminology',
  'Step-by-step internal working',
  'Diagram / sequence / pseudocode',
  'Variants and alternatives',
  'Time, space, latency or throughput characteristics',
  'Advantages',
  'Disadvantages and failure modes',
  'When to use',
  'When not to use',
  'Security and operational concerns',
  'Real-world software example',
  'Implementation example (prefer Java for backend topics)',
  'Interview questions: beginner / intermediate / advanced',
  'Hands-on exercise',
  'Related topics and next lessons',
  'Sources and last-reviewed date',
];

export const ENGINEERING_GLOSSARY_16: GlossaryEntry[] = [
  { term: 'Latency', meaning: 'Time taken for a single operation; measured at percentiles such as p50, p95 and p99.' },
  { term: 'Throughput', meaning: 'Volume of work completed per unit time, such as requests/second or messages/second.' },
  { term: 'Availability', meaning: 'Fraction of time a service is usable and serving valid requests.' },
  { term: 'Durability', meaning: 'Likelihood that committed data survives hardware, power or node failures.' },
  { term: 'Consistency', meaning: 'Rules governing which values and ordering concurrent readers can observe.' },
  { term: 'Replica', meaning: 'A synchronized or converging copy of data or stateless service state.' },
  { term: 'Partition / Shard', meaning: 'A logical or physical subset of data assigned to a partitioning unit or database node.' },
  { term: 'Hot Key', meaning: 'A single key or partition receiving disproportionate read or write traffic.' },
  { term: 'Backpressure', meaning: 'A flow-control mechanism that slows or sheds producers when consumers cannot keep up.' },
  { term: 'Idempotency', meaning: 'Repeating an operation produces the exact same intended state as executing it once.' },
  { term: 'Quorum', meaning: 'Minimum subset of nodes whose agreement or response satisfies a distributed protocol.' },
  { term: 'SLO / SLA', meaning: 'Service Level Objective (internal reliability target) vs Service Level Agreement (external contract).' },
  { term: 'RPO / RTO', meaning: 'Recovery Point Objective (max tolerable data loss) vs Recovery Time Objective (max tolerable downtime).' },
  { term: 'Dead-Letter Queue (DLQ)', meaning: 'Isolation queue holding poison or repeatedly failing messages for inspection and safe replay.' },
  { term: 'Fan-out', meaning: 'One event or request triggering parallel work or delivery across multiple recipients.' },
  { term: 'Control Plane / Data Plane', meaning: 'Control plane configures, routes and manages; data plane executes high-volume live traffic.' },
];

export const FINAL_DESIGN_REVIEW_CHECKLIST_12: { id: string; text: string; category: string }[] = [
  { id: 'req-explicit', category: 'Scope', text: 'Functional requirements, NFRs and explicit assumptions are documented.' },
  { id: 'data-ownership', category: 'Data', text: 'Data model, primary/shard keys and service data ownership are clear.' },
  { id: 'api-contracts', category: 'APIs', text: 'APIs define validation, cursor/offset pagination and consistent error semantics.' },
  { id: 'capacity-math', category: 'Scale', text: 'Capacity estimates account for peak traffic bursts, replicas, indexes and storage growth.' },
  { id: 'timeouts-failures', category: 'Resilience', text: 'Every critical dependency has bounded timeouts, circuit breakers and explicit fallback behavior.' },
  { id: 'retries-idempotency', category: 'Correctness', text: 'Retries use bounded backoff + jitter and mutating endpoints enforce idempotency.' },
  { id: 'consistency-tx', category: 'Data', text: 'Consistency guarantees and transaction or Saga boundaries are stated per operation.' },
  { id: 'security-tenants', category: 'Security', text: 'Server-side authentication, RBAC authorization and multi-tenant isolation are enforced.' },
  { id: 'observability', category: 'Ops', text: 'Structured logs, golden-signal metrics, alerts and distributed traces are planned.' },
  { id: 'dr-backups', category: 'Ops', text: 'Backups, RPO/RTO recovery targets and periodic restore drills are defined.' },
  { id: 'cost-ops', category: 'Trade-offs', text: 'Infrastructure cost and operational complexity are justified by business requirements.' },
  { id: 'right-sized', category: 'Simplicity', text: 'Architecture is no more complex than the actual requirements demand.' },
];

export const REFERENCE_LIBRARY_22: ReferenceResource[] = [
  { id: 'hld-handbook', category: 'Curricula & Guides', title: 'The HLD Handbook', summary: 'Broad HLD curriculum covering prerequisites, building blocks, distributed systems, operations, security and case studies.', url: 'https://hld.handbook.academy/' },
  { id: 'swebok', category: 'Curricula & Guides', title: 'SWEBOK Guide v4', summary: 'IEEE software engineering body of knowledge and standard professional terminology.', url: 'https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf' },
  { id: 'system-design-primer', category: 'Curricula & Guides', title: 'System Design Primer', summary: 'Open-source interview-oriented system design notes, diagrams and practice prompts.', url: 'https://github.com/donnemartin/system-design-primer' },
  { id: 'ddia', category: 'Books & Textbooks', title: 'Designing Data-Intensive Applications — Martin Kleppmann', summary: 'Foundational deep dive on storage engines, replication, partitioning, transactions and stream processing.', url: 'https://dataintensive.net/' },
  { id: 'dist-systems', category: 'Books & Textbooks', title: 'Distributed Systems — van Steen & Tanenbaum', summary: 'Rigorous textbook on distributed communication, coordination, consistency and fault tolerance.', url: 'https://www.distributed-systems.net/' },
  { id: 'db-internals', category: 'Books & Textbooks', title: 'Database Internals — Alex Petrov', summary: 'Deep guide to B-trees, LSM trees, compaction, storage engines and distributed consensus.', url: 'https://databass.dev/' },
  { id: 'alex-xu', category: 'Books & Textbooks', title: 'System Design Interview, Volumes 1 & 2 — Alex Xu', summary: 'Structured step-by-step interview walkthroughs, capacity estimation and trade-offs.', urlNote: 'Publisher / library catalog' },
  { id: 'arch-fundamentals', category: 'Books & Textbooks', title: 'Fundamentals of Software Architecture — Richards & Ford', summary: 'Architecture styles, modularity, evolutionary fitness functions and decision trade-offs.', urlNote: 'Publisher / library catalog' },
  { id: 'building-micro', category: 'Books & Textbooks', title: 'Building Microservices — Sam Newman', summary: 'Service boundaries, decomposition patterns, integration and operational architecture.', urlNote: 'Publisher / library catalog' },
  { id: 'designing-dist', category: 'Books & Textbooks', title: 'Designing Distributed Systems — Brendan Burns', summary: 'Cloud-native container patterns including sidecars, ambassadors, scatter-gather and queues.', url: 'https://azure.microsoft.com/en-us/resources/' },
  { id: 'head-first-dp', category: 'Books & Textbooks', title: 'Head First Design Patterns — Freeman & Robson', summary: 'Approachable, practical guide to object-oriented design patterns and SOLID principles.', urlNote: 'Publisher / library catalog' },
  { id: 'gaurav-sen', category: 'Video & Practice', title: 'Gaurav Sen / InterviewReady', summary: 'Video-based supplementary intuition for HLD building blocks and distributed architectures.', url: 'https://www.youtube.com/@gkcs' },
  { id: 'algo-practice', category: 'Video & Practice', title: 'Curated Algorithm Practice (LeetCode & GFG)', summary: 'Practice algorithms by pattern, always recording invariants, complexity and edge cases.', url: 'https://leetcode.com/' },
  { id: 'java-docs', category: 'Official Documentation', title: 'Oracle Java Documentation', summary: 'Authoritative reference for JVM, concurrency utilities, collections and runtime behavior.', url: 'https://docs.oracle.com/en/java/' },
  { id: 'spring-boot', category: 'Official Documentation', title: 'Spring Boot Reference', summary: 'Official documentation for backend configuration, web, security, testing and production ops.', url: 'https://docs.spring.io/spring-boot/index.html' },
  { id: 'postgres', category: 'Official Documentation', title: 'PostgreSQL Documentation', summary: 'SQL, B-tree/GIN/GiST indexes, MVCC transactions, isolation levels and replication.', url: 'https://www.postgresql.org/docs/' },
  { id: 'redis', category: 'Official Documentation', title: 'Redis Documentation', summary: 'In-memory data structures, caching patterns, Lua atomicity, persistence and cluster behavior.', url: 'https://redis.io/docs/' },
  { id: 'kafka', category: 'Official Documentation', title: 'Apache Kafka Documentation', summary: 'Topics, partitions, consumer groups, replication ISR and delivery semantics.', url: 'https://kafka.apache.org/documentation/' },
  { id: 'k8s', category: 'Official Documentation', title: 'Kubernetes Documentation', summary: 'Workloads, services, readiness/liveness probes, autoscaling and rolling deployments.', url: 'https://kubernetes.io/docs/' },
  { id: 'aws-arch', category: 'Cloud & Edge Docs', title: 'AWS Architecture Center', summary: 'Cloud reference architectures, Well-Architected pillars and production trade-offs.', url: 'https://aws.amazon.com/architecture/' },
  { id: 'gcp-arch', category: 'Cloud & Edge Docs', title: 'Google Cloud Architecture Center', summary: 'Production design patterns, reliability blueprints and cloud architecture guidance.', url: 'https://cloud.google.com/architecture' },
  { id: 'cloudflare', category: 'Cloud & Edge Docs', title: 'Cloudflare Learning Center', summary: 'Clear explanations of DNS, CDN, HTTP/3, TLS, caching, DDoS defense and networking.', url: 'https://www.cloudflare.com/learning/' },
];

export const RESOURCE_STUDY_TIPS: string[] = [
  'Choose one primary source per subject—do not read five books simultaneously.',
  'Use video explanations for initial intuition, a textbook for rigor, and official docs for implementation specifics.',
  'After every chapter, close the source and write your own plain-English explanation, diagram and failure cases.',
  'Maintain a "confusion log": write the exact question you cannot answer and resolve it before moving on.',
  'Build small prototypes: LRU cache, token bucket, URL shortener, queue consumer, idempotent payment API and mini search index.',
  'Design one system every week and revisit earlier designs after learning new components.',
  'Claim mastery only when you can design, implement, test, debug and defend the trade-offs aloud.',
];

export const HANDBOOK_SCOPE_NOTE =
  'This curriculum provides original plain-English explanations, analogies, exercises and study guidance covering core engineering principles. Technology limits, protocol behaviors and cloud defaults evolve—always verify product-specific details against current official documentation before production use.';
