export interface FrameworkStep {
  id: string;
  stepNumber: string;
  title: string;
  timeWindow: string;
  summary: string;
  checkpoints: string[];
}

export interface ComparisonTableData {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface RoadmapSubTopic {
  id: string;
  code: string;
  title: string;
  concept: string;
  bullets: { label: string; detail: string }[];
  hasNetworkingDfd?: boolean;
  table?: ComparisonTableData;
  interviewThought?: string;
}

export interface RoadmapModule {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  subTopics: RoadmapSubTopic[];
}

export type DistributedAlgoId =
  | 'consistent-hashing'
  | 'token-bucket'
  | 'bloom-filter'
  | 'raft'
  | 'quadtree-geohash'
  | 'vector-merkle';

export interface DistributedAlgoDeepDive {
  id: DistributedAlgoId;
  number: string;
  name: string;
  domain: string;
  problemSolved: string;
  mechanics: string[];
  timeComplexity: string;
  spaceComplexity: string;
  limitation: string;
  table?: ComparisonTableData;
}

export interface ReasoningQuizItem {
  id: string;
  number: number;
  title: string;
  scenario: string;
  options: { id: string; label: string; isCorrect: boolean }[];
  answerSummary: string;
  reasoning: string;
}

export const INTERVIEW_FRAMEWORK_STEPS: FrameworkStep[] = [
  {
    id: 'clarify-scope',
    stepNumber: '01',
    title: 'Clarify Requirements & Scope',
    timeWindow: 'Minutes 0–5',
    summary:
      'Never jump straight to drawing boxes. Lock down the top functional features and non-functional constraints before sketching.',
    checkpoints: [
      'Functional: Identify and confirm the top 3 core user workflows.',
      'Non-Functional: Clarify read-heavy vs. write-heavy traffic profile.',
      'Consistency vs. Availability: Decide Strong Consistency (banking/inventory) vs. Eventual Consistency (social feed).',
      'Latency SLA: Confirm target p95/p99 response budgets and durability expectations.',
    ],
  },
  {
    id: 'estimation',
    stepNumber: '02',
    title: 'Back-of-the-Envelope Estimation',
    timeWindow: 'Minutes 5–10',
    summary:
      'Quantify scale so every architectural choice (caching, sharding, CDN, queues) is backed by math instead of guesswork.',
    checkpoints: [
      'Daily Active Users (DAU) and average actions per user per day.',
      'Queries Per Second: QPS = (DAU × Actions) / 86,400.',
      'Peak QPS: Multiply average QPS by 2× to 3× for burst headroom.',
      '5-Year Storage & Bandwidth: Multiply daily records × payload size × 365 × 5.',
    ],
  },
  {
    id: 'high-level-design',
    stepNumber: '03',
    title: 'High-Level Design & Data Flow',
    timeWindow: 'Minutes 10–25',
    summary:
      'Trace the end-to-end request lifecycle and lock down contracts before zooming into individual boxes.',
    checkpoints: [
      'Draw core request path: Client → Load Balancer → API Gateway → Microservices → Database / Cache.',
      'Define explicit API contracts (REST endpoints or gRPC service definitions).',
      'Sketch database schemas, primary/shard keys, and index access patterns.',
      'Separate synchronous hot paths from asynchronous background pipelines.',
    ],
  },
  {
    id: 'deep-dive',
    stepNumber: '04',
    title: 'Deep Dive & Bottleneck Resolution',
    timeWindow: 'Minutes 25–45',
    summary:
      'Proactively attack your own design. Surface failure modes before the interviewer asks and justify every box you add.',
    checkpoints: [
      'Eliminate Single Points of Failure (SPOFs) across load balancers, compute, and databases.',
      'Mitigate database hot shards, celebrity skew, and replication lag.',
      'Protect storage against cache stampedes (thundering herd) and cache penetration.',
      'Handle network partitions, retries with idempotency keys, and observability metrics.',
    ],
  },
];

export const CORE_ROADMAP_MODULES: RoadmapModule[] = [
  {
    id: 'mod-1-networking',
    number: 'Module 1',
    title: 'Networking, Traffic & Scaling Foundations',
    subtitle: 'Horizontal scaling, DNS geo-routing, Layer 4 vs. Layer 7 Load Balancers, and API Gateways.',
    subTopics: [
      {
        id: 'scaling-lb-gw',
        code: '1.1',
        title: 'Scaling, Load Balancers & API Gateways',
        concept:
          'Vertical scaling (bigger machine) hits hardware ceilings and leaves a Single Point of Failure (SPOF). Horizontal scaling (more machines) requires a Load Balancer to distribute traffic and an API Gateway to centralize cross-cutting concerns like authentication, TLS termination, and rate limiting.',
        bullets: [
          {
            label: 'Stateless Compute Tier',
            detail:
              'Keep session state out of web servers (store in Redis/DB) so any node can serve any request and auto-scale horizontally on CPU or RPS.',
          },
          {
            label: 'Edge + Ingress Separation',
            detail:
              'DNS geo-routes users to the nearest region, L4 LB handles ultra-fast TCP forwarding, and L7 API Gateway inspects paths, headers, and auth tokens.',
          },
        ],
        hasNetworkingDfd: true,
        table: {
          caption: 'Layer 4 (Transport) vs. Layer 7 (Application) Load Balancer',
          headers: ['Feature', 'Layer 4 (Transport) LB', 'Layer 7 (Application) LB'],
          rows: [
            ['Routing Basis', 'IP Address & TCP/UDP Port', 'HTTP Headers, URL Path, Cookies'],
            [
              'Speed / Overhead',
              'Ultra-fast (packet forwarding, no decryption)',
              'Slower (terminates TLS, inspects payload)',
            ],
            [
              'Best Use Case',
              'High-throughput raw TCP, gaming, DNS',
              'Microservice routing (/api/users vs /api/pay)',
            ],
          ],
        },
        interviewThought:
          '“To prevent a single server from crashing under traffic spikes, I will place an L7 Load Balancer in front of stateless web servers. Because the servers are stateless, we can auto-scale them horizontally based on CPU and RPS metrics.”',
      },
    ],
  },
  {
    id: 'mod-2-storage',
    number: 'Module 2',
    title: 'Storage, Databases & Data Modeling',
    subtitle: 'SQL vs. NoSQL, replication topologies (Single, Multi-Leader, Leaderless), and horizontal sharding.',
    subTopics: [
      {
        id: 'sql-nosql-repl',
        code: '2.1',
        title: 'SQL vs. NoSQL & Replication Topologies',
        concept:
          'Storage is the hardest layer to scale because it is stateful. SQL enforces ACID transactions and relational integrity; NoSQL trades strict joins and cross-row ACID for horizontal write scalability and flexible schemas.',
        bullets: [
          {
            label: 'Single-Leader Replication',
            detail:
              'Writes go to Primary; Reads scale across Replicas. Risk: asynchronous replication lag causes stale reads right after a write.',
          },
          {
            label: 'Multi-Leader Replication',
            detail:
              'Writes go to multiple regional primaries for low-latency global writes. Risk: concurrent write conflicts requiring resolution (LWW or CRDTs).',
          },
          {
            label: 'Leaderless (Dynamo-Style)',
            detail:
              'Writes and reads contact W and R nodes out of N replicas. Strong consistency is achieved when W + R > N.',
          },
        ],
      },
      {
        id: 'sharding',
        code: '2.2',
        title: 'Sharding (Horizontal Partitioning)',
        concept:
          'Splitting a massive database horizontally across multiple physical nodes when a single node’s disk capacity, memory, or IOPS is exhausted.',
        bullets: [
          {
            label: 'Shard Key Selection',
            detail:
              'Pick a high-cardinality key aligned with your most frequent query access pattern to avoid scatter-gather cross-shard queries.',
          },
          {
            label: 'Hotspot Prevention',
            detail:
              'Avoid monotonically increasing keys (auto-increment IDs or raw timestamps) in range partitioning; pair consistent hashing with virtual nodes.',
          },
        ],
        table: {
          caption: 'Comparison of Database Partitioning Strategies',
          headers: ['Strategy', 'Mechanism', 'Pros', 'Cons / Limitations'],
          rows: [
            [
              'Range-Based',
              'Partition by key ranges (e.g., A–F, G–M)',
              'Fast range queries',
              'Hotspots if keys are sequential (e.g., timestamps)',
            ],
            [
              'Hash-Based',
              'hash(shard_key) % N',
              'Even data distribution',
              'Adding/removing nodes requires massive data migration',
            ],
            [
              'Consistent Hashing',
              'Map nodes and keys onto a 0–360° ring',
              'Only K/N keys move when nodes change',
              'Requires Virtual Nodes to prevent uneven ring splits',
            ],
          ],
        },
      },
    ],
  },
  {
    id: 'mod-3-caching',
    number: 'Module 3',
    title: 'Caching & Asynchronous Processing',
    subtitle: 'Read/write caching strategies, stampede & penetration defenses, and message queues vs. event logs.',
    subTopics: [
      {
        id: 'caching-strategies',
        code: '3.1',
        title: 'Caching Strategies & Critical Failure Modes',
        concept:
          'RAM is roughly 100× faster than SSDs. A well-placed cache absorbs read-heavy spikes and shields primary databases from saturation.',
        bullets: [
          {
            label: 'Cache-Aside (Lazy Loading)',
            detail:
              'App checks cache → on miss reads DB → writes result to cache. Resilient to cache failure, but pays miss latency on cold keys.',
          },
          {
            label: 'Write-Through',
            detail:
              'App writes to cache and DB synchronously. If both writes succeed and the cache entry is correctly populated, subsequent reads can hit a warm cache; write latency increases and partial failure/invalidation must be handled.',
          },
          {
            label: 'Write-Back (Write-Behind)',
            detail:
              'App writes to cache and returns immediately; cache flushes to DB asynchronously. Ultra-fast writes, but risks data loss if cache crashes before flush.',
          },
          {
            label: 'Cache Stampede (Thundering Herd)',
            detail:
              'A hot key expires and 10,000 requests hit the DB simultaneously. Fix: Distributed mutex locks (single-flight) or probabilistic early expiration + TTL jitter.',
          },
          {
            label: 'Cache Penetration',
            detail:
              'Queries for non-existent IDs bypass the cache and hammer the DB. Fix: Cache short-TTL null sentinels or place a Bloom Filter in front of cache/DB.',
          },
        ],
      },
      {
        id: 'queues-streams',
        code: '3.2',
        title: 'Message Queues & Event Streaming',
        concept:
          'Asynchronous messaging decouples producers from consumers, absorbs sudden traffic spikes (load leveling), and enables resilient background processing.',
        bullets: [
          {
            label: 'Load Leveling',
            detail:
              'Buffers 10× traffic bursts in a durable queue so downstream databases and workers process at a steady, safe throughput.',
          },
          {
            label: 'Dead-Letter Queues (DLQ)',
            detail:
              'Routes repeatedly failing messages to a dead-letter path after bounded retries, when configured; ordering, retry policy and consumer implementation determine whether a poison message blocks partition progress.',
          },
        ],
        table: {
          caption: 'Traditional Message Queue vs. Distributed Event Log',
          headers: ['Feature', 'Traditional Queue (RabbitMQ / SQS)', 'Distributed Event Log (Apache Kafka)'],
          rows: [
            [
              'Message Lifecycle',
              'Deleted immediately after consumer ACK',
              'Retained on disk for days/weeks (append-only log)',
            ],
            [
              'Consumption Model',
              'Competing consumers (work queue)',
              'Consumer groups with independent read offsets',
            ],
            [
              'Best For',
              'Task background jobs (emails, image resizing)',
              'High-throughput event sourcing, analytics, replayability',
            ],
          ],
        },
      },
    ],
  },
  {
    id: 'mod-4-distributed',
    number: 'Module 4',
    title: 'Distributed Systems Theory & Reliability',
    subtitle: 'CAP & PACELC theorems, rate limiting, circuit breakers, and retry-safe idempotency keys.',
    subTopics: [
      {
        id: 'cap-pacelc',
        code: '4.1',
        title: 'CAP & PACELC Theorems',
        concept:
          'Network partitions are inevitable in distributed systems. CAP defines behavior during a partition, while PACELC captures the everyday trade-off even when the network is healthy.',
        bullets: [
          {
            label: 'CAP Theorem (Partition Time)',
            detail:
              'During a Network Partition (P), choose between Consistency (C: every read returns the latest write or an error) and Availability (A: every non-failing node returns a response, even if stale).',
          },
          {
            label: 'PACELC Extension (Normal Operation)',
            detail:
              'If Partition (P) → A or C; Else (E) → trade off Latency (L) vs. Consistency (C). Synchronous replication increases write latency to preserve strong consistency.',
          },
        ],
      },
      {
        id: 'resiliency-patterns',
        code: '4.2',
        title: 'Production Resiliency Patterns',
        concept:
          'Assume every network call can time out, duplicate, or fail partially. Bake defensive guardrails into every service boundary.',
        bullets: [
          {
            label: 'Rate Limiting',
            detail:
              'Protects services from DDoS and noisy neighbors using Token Bucket or Sliding Window counters, returning HTTP 429 Too Many Requests.',
          },
          {
            label: 'Circuit Breaker (Closed → Open → Half-Open)',
            detail:
              'Stops calling a failing downstream service after X consecutive failures, failing fast to prevent cascading thread-pool exhaustion.',
          },
          {
            label: 'Idempotency Keys',
            detail:
              'Clients generate a unique UUID per checkout intent (POST /pay). On network timeout and retry, the server looks up the UUID and returns the original receipt without double-charging.',
          },
        ],
      },
    ],
  },
];

export const DISTRIBUTED_ALGORITHMS: DistributedAlgoDeepDive[] = [
  {
    id: 'consistent-hashing',
    number: '01',
    name: 'Consistent Hashing',
    domain: 'Load Balancing & Sharding',
    problemSolved:
      'Distributing keys across servers so adding or removing a node remaps only K/N keys instead of reshuffling nearly the entire cluster.',
    mechanics: [
      'Hash both server IDs and object keys onto a 32-bit integer ring (0 to 2³² − 1, visualized as 0°–360°).',
      'Walk clockwise from a key’s hash position to find the first server node responsible for storing it.',
      'Attach Virtual Nodes (e.g., 100–200 vnodes per physical server) so ring intervals stay balanced and uniform.',
    ],
    timeComplexity: 'O(log N) lookup via balanced BST (TreeMap) of ring hashes',
    spaceComplexity: 'O(N × V) where N = physical nodes and V = virtual nodes',
    limitation:
      'Does not natively account for heterogeneous hardware capacities unless weighted virtual node counts are configured per server.',
  },
  {
    id: 'token-bucket',
    number: '02',
    name: 'Token Bucket Algorithm',
    domain: 'API Rate Limiting',
    problemSolved:
      'Enforcing sustained API throughput limits while cleanly absorbing legitimate short traffic bursts in O(1) memory per client.',
    mechanics: [
      'Each client key has a bucket of max capacity C tokens refilled at rate R tokens/second.',
      'Use lazy refill math on each request: tokens = min(C, tokens + (now − last_refill) × R).',
      'If tokens >= 1, decrement by 1 and allow (HTTP 200); otherwise reject immediately with HTTP 429 Too Many Requests.',
    ],
    timeComplexity: 'O(1) per request (atomic Redis Lua script in distributed setups)',
    spaceComplexity: 'O(1) per client key (only 2 numbers: tokens & last_refill timestamp)',
    limitation:
      'Distributed gateways sharing one bucket require atomic compare-and-update (e.g., Redis Lua) to prevent race conditions under concurrent requests.',
    table: {
      caption: 'Rate Limiting Algorithms Comparison',
      headers: ['Algorithm', 'Burst Handling', 'Memory Footprint', 'Precision / Limitation'],
      rows: [
        [
          'Token Bucket',
          'Allows controlled bursts up to capacity C',
          'O(1) per user (tokens, timestamp)',
          'Best general-purpose choice',
        ],
        [
          'Leaky Bucket',
          'Smooths output to a strict constant rate',
          'O(C) queue size',
          'Bursts are queued/delayed rather than served fast',
        ],
        [
          'Fixed Window',
          'Allows 2× limit at window boundary edges',
          'O(1) per user',
          'Boundary spike vulnerability',
        ],
        [
          'Sliding Window Log',
          'Exact rate enforcement across any time slice',
          'O(R) stores every request timestamp',
          'High RAM usage at scale',
        ],
      ],
    },
  },
  {
    id: 'bloom-filter',
    number: '03',
    name: 'Bloom Filter',
    domain: 'Probabilistic Existence Check',
    problemSolved:
      'Testing whether a key is definitely absent from a massive dataset in O(k) before paying for a slow disk or database lookup (used in Cassandra SSTables, Chrome Safe Browsing, and cache penetration defense).',
    mechanics: [
      'Maintain an m-bit array initialized to 0 alongside k independent hash functions.',
      'Insert(x): Compute all k hash indices h₁(x)…hₖ(x) mod m and set those k bits to 1.',
      'Query(x): Check all k bit positions — if ANY bit is 0, x is 100% absent (zero false negatives). If all are 1, x is probably present (small false-positive probability).',
    ],
    timeComplexity: 'O(k) for insert and lookup (independent of dataset size n)',
    spaceComplexity: 'O(m) bits (~10 bits per element yields ~1% false-positive rate)',
    limitation:
      'Standard Bloom Filters cannot delete items (clearing a shared bit causes false negatives for colliding keys). Use a Counting Bloom Filter or Cuckoo Filter when deletion is needed.',
  },
  {
    id: 'raft',
    number: '04',
    name: 'Raft Consensus Algorithm',
    domain: 'Leader Election & Log Replication',
    problemSolved:
      'Achieving a single, strongly consistent replicated state machine across a cluster despite node crashes and message delays (powers etcd, Kubernetes, and CockroachDB).',
    mechanics: [
      'Leader Election: Nodes start as Followers. If no leader heartbeat arrives within a randomized election timeout (150–300ms), a node becomes a Candidate, increments its Term, and requests votes. A majority quorum (⌊N/2⌋ + 1) elects the Leader.',
      'Log Replication: The Leader appends client writes to its log and broadcasts AppendEntries RPCs. Once a majority acknowledges, the entry is committed and applied to every node’s state machine.',
      'Safety: Under Raft\'s voting, term, log-matching and quorum rules, a newly elected leader preserves entries that were committed in prior terms; this depends on protocol assumptions and correct implementation.',
    ],
    timeComplexity: 'Minimum 1 network round-trip (RTT) to a majority quorum per write',
    spaceComplexity: 'O(Log Entries) durable WAL + periodic state snapshots',
    limitation:
      'Write throughput is serialized through the single Leader; clusters require an odd node count (3, 5, 7) to tolerate (N − 1)/2 node failures.',
  },
  {
    id: 'quadtree-geohash',
    number: '05',
    name: 'QuadTree & Geohashing',
    domain: 'Spatial Indexing (Uber / Yelp)',
    problemSolved:
      'Finding nearby drivers, riders, or restaurants in O(log N) instead of running an O(N) distance scan across millions of global coordinates.',
    mechanics: [
      'Geohash interleaves latitude and longitude bits into a Base-32 prefix string — shared prefixes represent nearby 2D cells, indexable directly in SQL or Redis.',
      'QuadTree recursively splits a 2D bounding box into 4 quadrants (NW, NE, SW, SE) whenever a leaf exceeds max capacity (e.g., 100 drivers).',
      'Querying Geohash edges requires checking all 8 neighboring cells; QuadTree walks parent pointers to adjacent quadrants when a radius crosses a boundary.',
    ],
    timeComplexity: 'O(log N) spatial lookup; O(1) prefix match in Redis/B-Tree for Geohash',
    spaceComplexity: 'O(N) points stored across tree leaves or Base-32 index rows',
    limitation:
      'Geohash uses static grid granularity (dense cities overload a single prefix) and suffers from meridian/equator boundary discontinuities; QuadTree requires custom in-memory tree servers.',
    table: {
      caption: 'Geohash vs. QuadTree Spatial Indexing',
      headers: ['Feature', 'Geohash', 'QuadTree'],
      rows: [
        [
          'Structure',
          'Base-32 string encoding interleaved lat/lon bits',
          'In-memory tree splitting 2D space into 4 quadrants',
        ],
        [
          'Index Storage',
          'Works natively in standard SQL / Redis string indexes',
          'Requires custom in-memory graph/tree server',
        ],
        [
          'Dynamic Density',
          'Static grid sizes; dense cities overload one prefix',
          'Dynamically subdivides dense areas (e.g., Manhattan)',
        ],
        [
          'Edge Case',
          'Close points across a meridian differ completely (must query 8 neighbors)',
          'Boundary traversal requires parent-pointer backtracking',
        ],
      ],
    },
  },
  {
    id: 'vector-merkle',
    number: '06',
    name: 'Vector Clocks & Merkle Trees',
    domain: 'Conflict Detection & Anti-Entropy',
    problemSolved:
      'Detecting concurrent write conflicts without relying on drifting wall clocks, and syncing diverged replicas across millions of keys with minimal network transfer.',
    mechanics: [
      'Vector Clocks attach a logical counter map [NodeA: 2, NodeB: 1] to each data version. If every counter in V₁ ≤ V₂, V₂ causally supersedes V₁; if neither dominates, a concurrent write conflict is flagged.',
      'Merkle Trees build a binary hash tree where leaves hash key-value blocks and parents hash their children.',
      'Anti-Entropy Sync: Two replicas compare root hashes first. Matching subtrees are skipped entirely; only mismatched branches are traversed in O(log N) round-trips.',
    ],
    timeComplexity: 'O(N_nodes) vector comparison · O(log B) Merkle diff across B buckets',
    spaceComplexity: 'O(N_nodes) metadata per object · O(B) hashes per replica tree',
    limitation:
      'Vector clocks grow linearly with the number of writing nodes/clients (requiring pruning/dotted version vectors); Merkle trees must be recomputed on key-range changes.',
  },
];

export const REASONING_QUIZ_ITEMS: ReasoningQuizItem[] = [
  {
    id: 'q1-celebrity-hotspot',
    number: 1,
    title: 'The Celebrity Hotspot',
    scenario:
      'You are designing Twitter/X. A celebrity with 100 million followers posts a tweet. Pure Fan-out on Write (pushing the tweet ID to every follower’s precomputed Redis timeline cache) stalls your message queues for 10 minutes. How do you redesign the data flow?',
    options: [
      {
        id: 'a',
        label: 'Switch every single user to pure Fan-out on Read and delete Redis timelines',
        isCorrect: false,
      },
      {
        id: 'b',
        label: 'Hybrid Fan-out: Fan-out on Write for regular users, Fan-out on Read merged at feed load for flagged celebrities',
        isCorrect: true,
      },
      {
        id: 'c',
        label: 'Increase Redis cluster RAM to 10 TB so the 100M writes finish synchronously',
        isCorrect: false,
      },
      {
        id: 'd',
        label: 'Drop 90% of follower notifications when a tweet exceeds 1M followers',
        isCorrect: false,
      },
    ],
    answerSummary: 'Hybrid Fan-out (Write for normal users + Read merge for celebrities)',
    reasoning:
      'Keep Fan-out on Write for regular users so feed reads stay sub-10ms, but flag high-follower celebrity accounts. When a celebrity tweets, write once to a celebrity tweet table instead of fanning out 100M pushes, then merge those tweets dynamically at read time when followers open their home timeline.',
  },
  {
    id: 'q2-double-charge',
    number: 2,
    title: 'The Double-Charge Glitch',
    scenario:
      'A user clicks “Pay $500” on a flaky mobile network. Your Payment Service charges Stripe successfully, but the HTTP response drops before reaching the phone. The mobile app automatically retries POST /pay. Which pattern prevents charging the user twice?',
    options: [
      {
        id: 'a',
        label: 'Disable client-side HTTP retries completely',
        isCorrect: false,
      },
      {
        id: 'b',
        label: 'Switch the payment endpoint from POST to GET so HTTP caches it',
        isCorrect: false,
      },
      {
        id: 'c',
        label: 'Client-generated Idempotency Keys persisted with PROCESSING/COMPLETED state before calling Stripe',
        isCorrect: true,
      },
      {
        id: 'd',
        label: 'Add an L4 Load Balancer with sticky sessions so retries hit the same container',
        isCorrect: false,
      },
    ],
    answerSummary: 'Idempotency Keys (UUID per checkout attempt)',
    reasoning:
      'The client generates a unique UUID (idempotency_key) when checkout starts and sends it in the request header. The Payment Service atomically records the key in Redis/DB with PROCESSING → COMPLETED state and the receipt. Retries with the same key return the cached receipt without invoking Stripe a second time.',
  },
  {
    id: 'q3-flash-sale',
    number: 3,
    title: 'Flash Sale Inventory',
    scenario:
      'You have 100 concert tickets left, and 50,000 users click “Buy” at the exact same millisecond. Which CAP theorem trade-off applies, and which concurrency mechanism prevents overselling?',
    options: [
      {
        id: 'a',
        label: 'AP (Eventual Consistency) with Write-Back cache so all 50,000 requests succeed quickly',
        isCorrect: false,
      },
      {
        id: 'b',
        label: 'CP (Consistency over Availability) using SELECT FOR UPDATE, Optimistic Locking (version check), or an atomic Redis Lua DECR script',
        isCorrect: true,
      },
      {
        id: 'c',
        label: 'Multi-leader replication across 3 continents with Last-Write-Wins conflict resolution',
        isCorrect: false,
      },
      {
        id: 'd',
        label: 'A Bloom Filter to count remaining tickets probabilistically',
        isCorrect: false,
      },
    ],
    answerSummary: 'CP + Pessimistic/Optimistic Locking or Atomic Redis Lua Script',
    reasoning:
      'Overselling finite tickets is an unacceptable correctness violation, so you must pick CP (Consistency). Enforce strict atomic decrement via SQL Pessimistic Locking (SELECT ... FOR UPDATE), Optimistic Concurrency Control (UPDATE tickets SET count = count - 1, version = version + 1 WHERE id = 1 AND version = old_version AND count > 0), or a single-threaded Redis Lua script.',
  },
  {
    id: 'q4-empty-profile',
    number: 4,
    title: 'The Empty Profile Attack',
    scenario:
      'A malicious bot sends 50,000 RPS asking for random non-existent user IDs (GET /users/nonexistent_999). Because none exist in Redis, every request misses cache and hits your PostgreSQL primary, pegging CPU at 100%. What is the lightest-weight defense?',
    options: [
      {
        id: 'a',
        label: 'Add 20 PostgreSQL read replicas to absorb the bot queries',
        isCorrect: false,
      },
      {
        id: 'b',
        label: 'Switch from Cache-Aside to Write-Through caching',
        isCorrect: false,
      },
      {
        id: 'c',
        label: 'Place a Bloom Filter of valid user IDs in front of Redis/DB to reject absent keys in O(k) with zero false negatives',
        isCorrect: true,
      },
      {
        id: 'd',
        label: 'Shard PostgreSQL by user ID using range partitioning',
        isCorrect: false,
      },
    ],
    answerSummary: 'Bloom Filter in front of Cache/DB (O(k) negative rejection)',
    reasoning:
      'This is a cache-penetration defense. A Bloom filter can represent a large set compactly; memory per key depends on the target false-positive rate (about 10 bits/key is only an illustrative sizing point). For a standard filter without deletions, inserted keys are not false negatives: any 0 bit proves absence, while a positive result may be false and must be checked against PostgreSQL. Lookup costs O(k) hash probes under the usual model; size the filter and rebuild/update it consistently with the source of truth.',
  },
  {
    id: 'q5-clock-drift',
    number: 5,
    title: 'Multi-Region Clock Drift',
    scenario:
      'You run a multi-leader database across US-East and EU-West. Two users update the same document concurrently, and you resolve conflicts using Last-Write-Wins (LWW) based on each server’s System.currentTimeMillis(). Why does this silently corrupt data, and what is the fix?',
    options: [
      {
        id: 'a',
        label: 'System.currentTimeMillis() only has second precision; switch to nanoseconds',
        isCorrect: false,
      },
      {
        id: 'b',
        label: 'Physical clocks suffer NTP skew/drift (e.g., EU-West 50ms ahead), letting an older write overwrite a newer one — use Hybrid Logical Clocks (HLC) or Vector Clocks',
        isCorrect: true,
      },
      {
        id: 'c',
        label: 'TCP drops timestamps across oceans; switch to UDP',
        isCorrect: false,
      },
      {
        id: 'd',
        label: 'LWW fails only because both regions share the same DNS record',
        isCorrect: false,
      },
    ],
    answerSummary: 'NTP Clock Skew corrupts LWW → Use Hybrid Logical Clocks (HLC) or Vector Clocks',
    reasoning:
      'Physical server clocks drift under NTP — if EU-West is 50ms ahead of US-East, an earlier write from EU-West carries a higher wall-clock timestamp and silently wipes out a causally newer write from US-East. Use Hybrid Logical Clocks (like CockroachDB) or Vector Clocks to preserve causal ordering.',
  },
];
