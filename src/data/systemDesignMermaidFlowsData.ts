export interface ArchMermaidNodeDetail {
  id: string;
  label: string;
  layer: 'Edge' | 'Compute' | 'Cache & Queue' | 'Database';
  tech: string;
  role: string;
  latencyBudget: string;
  connections: {
    direction: 'Inbound' | 'Outbound';
    peer: string;
    protocol: string;
    detail: string;
  }[];
  expandedMermaid: string;
  keyAlgorithms: string[];
}

export interface SystemArchitectureMermaidBlueprint {
  id: string;
  name: string;
  domain: string;
  scaleTarget: string;
  summary: string;
  overviewMermaid: string;
  expandedFullMermaid: string;
  walkthroughOrder: string[];
  nodes: ArchMermaidNodeDetail[];
}

export const SYSTEM_DESIGN_MERMAID_BLUEPRINTS: SystemArchitectureMermaidBlueprint[] = [
  {
    id: 'arch-quick-commerce',
    name: 'Quick-Commerce & E-Commerce Checkout (Zepto / Amazon)',
    domain: 'E-Commerce & Instant Delivery',
    scaleTarget: '50K RPS Browse · 5K Orders/sec · < 80ms p99',
    summary:
      'High-throughput storefront pairing Geo-Sharded Redis inventory & dark-store routing with ACID PostgreSQL Outbox checkout and Kafka async fulfillment.',
    walkthroughOrder: ['CDN', 'Gateway', 'OrderSvc', 'Redis', 'Postgres', 'Kafka'],
    overviewMermaid: `flowchart LR
  CDN["Edge CDN & WAF"] -->|"HTTPS/3"| Gateway["API Gateway"]
  Gateway -->|"Browse/Search"| CatalogSvc["Catalog & Geo Service"]
  Gateway -->|"Checkout"| OrderSvc["Order & Inventory Service"]
  CatalogSvc -->|"Cache-Aside"| Redis[("Redis Geo & Hot SKU Cache")]
  OrderSvc -->|"ACID Lock + Outbox"| Postgres[("PostgreSQL Primary + Replicas")]
  OrderSvc -.->|"CDC Outbox"| Kafka[("Kafka Event Bus")]
  Kafka --> RiderSvc["Rider Dispatch & Notifications"]`,
    expandedFullMermaid: `flowchart LR
  subgraph Edge["Edge & Traffic Shield"]
    CDN["Edge CDN (Static Assets + GeoIP)"] --> Gateway["L7 API Gateway (JWT + Token Bucket Rate Limit)"]
  end
  subgraph Compute["Stateless Microservices (K8s HPA)"]
    Gateway --> CatalogSvc["Catalog & Dark-Store S2 Geo Service"]
    Gateway --> OrderSvc["Order & Checkout Service (Idempotency Key)"]
    RiderSvc["Rider Dispatch + Push/SMS Workers"]
  end
  subgraph Data["Databases, Cache & Async Backbone"]
    CatalogSvc -->|"85% Hit (<1.5ms)"| Redis[("Redis Cluster: CRC16 Slots + GEOADD + Atomic DECR")]
    OrderSvc -->|"PgBouncer Pool"| Postgres[("PostgreSQL: Strict 2PL + MVCC + WAL + Outbox")]
    Postgres -->|"Streaming WAL"| ReadRep[("Read Replicas (Browse Fallback)")]
    Postgres -->|"Debezium Logical CDC"| Kafka[("Kafka KRaft: orders.created Partitions")]
    Kafka --> RiderSvc
  end`,
    nodes: [
      {
        id: 'CDN',
        label: 'Edge CDN & WAF',
        layer: 'Edge',
        tech: 'CloudFront / Cloud Armor',
        role: 'Caches product imagery and blocks DDoS/bot credential stuffing at PoPs < 15ms from users.',
        latencyBudget: '< 12 ms',
        keyAlgorithms: ['Anycast BGP Routing', 'Consistent Hashing PoP Cache', 'WAF Rule Matching'],
        connections: [
          { direction: 'Inbound', peer: 'Mobile / Web Apps', protocol: 'HTTP/3 QUIC', detail: 'TLS termination at nearest PoP' },
          { direction: 'Outbound', peer: 'API Gateway', protocol: 'HTTPS Keep-Alive', detail: 'Dynamic API pass-through' },
        ],
        expandedMermaid: `flowchart LR
  User["User Mobile App"] --> Anycast["Anycast Edge PoP"]
  Anycast --> WAF["WAF + Bot Shield"]
  WAF -->|"Static Asset Hit (96%)"| Cache["Edge SSD Cache"]
  WAF -->|"Dynamic API"| Origin["API Gateway Origin"]`,
      },
      {
        id: 'Gateway',
        label: 'API Gateway',
        layer: 'Edge',
        tech: 'Envoy / Kong / AWS API GW',
        role: 'Centralizes JWT verification, per-user Token Bucket rate limiting, and circuit breaking.',
        latencyBudget: '< 6 ms',
        keyAlgorithms: ['Token Bucket Rate Limiting', 'EWMA Load Balancing', 'Circuit Breaker FSM'],
        connections: [
          { direction: 'Inbound', peer: 'Edge CDN', protocol: 'HTTPS', detail: 'Verified client traffic' },
          { direction: 'Outbound', peer: 'Catalog & Order Services', protocol: 'gRPC / HTTP2', detail: 'Authenticated internal RPC' },
        ],
        expandedMermaid: `flowchart LR
  Req["Incoming Request"] --> JWT["Verify JWKS Signature"]
  JWT --> Limiter{"Redis Token Bucket<br/>Rate Limit"}
  Limiter -->|"429 Exceeded"| Reject["Reject Fast"]
  Limiter -->|"Allowed"| CB["Circuit Breaker + EWMA LB"] --> Svc["Downstream Service"]`,
      },
      {
        id: 'OrderSvc',
        label: 'Order & Inventory Service',
        layer: 'Compute',
        tech: 'Java 21 Virtual Threads / Go',
        role: 'Guarantees zero overselling via Idempotency Keys, atomic inventory reservation, and transactional outbox commits.',
        latencyBudget: '< 35 ms',
        keyAlgorithms: ['Idempotency Key Deduplication', 'Transactional Outbox', 'Saga Compensation'],
        connections: [
          { direction: 'Inbound', peer: 'API Gateway', protocol: 'gRPC', detail: 'POST /orders with Idempotency-Key' },
          { direction: 'Outbound', peer: 'PostgreSQL Primary', protocol: 'PgBouncer TCP', detail: 'ACID order + outbox insert' },
          { direction: 'Outbound', peer: 'Redis Cluster', protocol: 'RESP3', detail: 'Fast stock counter check' },
        ],
        expandedMermaid: `flowchart LR
  Req["POST /orders + Idempotency-Key"] --> Check{"Key Already Processed?"}
  Check -->|"Yes"| Replay["Return Cached 201 Response"]
  Check -->|"No"| Tx["BEGIN ACID Tx: Reserve Stock + Insert Order + Outbox"]
  Tx --> Commit["COMMIT -> Return 201 Created"]`,
      },
      {
        id: 'Redis',
        label: 'Redis Geo & Hot SKU Cache',
        layer: 'Cache & Queue',
        tech: 'Redis 7 Cluster (16,384 Slots)',
        role: 'Absorbs 85% of catalog reads, stores dark-store geo-indexes, and guards flash-sale hot SKU stock atomically.',
        latencyBudget: '< 2 ms',
        keyAlgorithms: ['CRC16 Consistent Hash Slots', 'Geohash / S2 Radius Search', 'Approximate LRU/LFU'],
        connections: [
          { direction: 'Inbound', peer: 'Catalog & Order Services', protocol: 'RESP3', detail: 'Hot SKU reads & atomic DECR' },
          { direction: 'Outbound', peer: 'Redis Replicas', protocol: 'Async PSYNC', detail: 'HA failover & read offload' },
        ],
        expandedMermaid: `flowchart LR
  Cmd["GET sku:42 / GEORADIUS"] --> Slot["CRC16(key) mod 16384 Slot"]
  Slot --> Loop["Single-Threaded Event Loop (RAM)"]
  Loop -->|"Atomic DECR"| Stock["Zero-Oversell Flash Sale Counter"]
  Loop --> AOF[("AOF Append Log + Standby Replica")]`,
      },
      {
        id: 'Postgres',
        label: 'PostgreSQL Primary + Replicas',
        layer: 'Database',
        tech: 'PostgreSQL 16 + PgBouncer + Debezium',
        role: 'System of record for orders, inventory ledger, and transactional outbox with zero data loss (ARIES WAL).',
        latencyBudget: '< 18 ms',
        keyAlgorithms: ['B+Tree Indexes', 'MVCC Snapshot Isolation', 'Strict 2PL FOR UPDATE', 'ARIES WAL Recovery'],
        connections: [
          { direction: 'Inbound', peer: 'Order Service', protocol: 'PgBouncer TX Pool', detail: 'ACID writes + FOR UPDATE locks' },
          { direction: 'Outbound', peer: 'Read Replicas', protocol: 'Physical WAL Stream', detail: 'HA failover + order history reads' },
          { direction: 'Outbound', peer: 'Kafka Event Bus', protocol: 'Debezium Logical CDC', detail: 'Zero-dual-write event publishing' },
        ],
        expandedMermaid: `flowchart LR
  Pool["PgBouncer Pool"] --> Opt["System R Cost Optimizer"]
  Opt --> Lock["Strict 2PL Row Lock + MVCC Tuple"]
  Lock --> Buf["Clock-Sweep Buffer Pool + B+Tree"]
  Lock --> WAL[("Sequential WAL fsync (ARIES)")]
  WAL --> Rep[("Streaming Read Replica")]
  WAL --> CDC["Debezium CDC -> Kafka Outbox"]`,
      },
      {
        id: 'Kafka',
        label: 'Kafka Event Bus',
        layer: 'Cache & Queue',
        tech: 'Apache Kafka (KRaft Quorum)',
        role: 'Decouples checkout from rider dispatch, billing emails, and real-time analytics so slow consumers never block orders.',
        latencyBudget: '< 8 ms publish',
        keyAlgorithms: ['Append-Only Commit Log', 'KRaft Raft Consensus', 'Zero-Copy sendfile()'],
        connections: [
          { direction: 'Inbound', peer: 'Debezium CDC', protocol: 'Kafka Binary TCP', detail: 'orders.created partitioned by store_id' },
          { direction: 'Outbound', peer: 'Rider Dispatch & Analytics', protocol: 'Consumer Group Pull', detail: 'Independent offset replay' },
        ],
        expandedMermaid: `flowchart LR
  Prod["Debezium CDC Producer"] --> Part["Partition Hash(dark_store_id)"]
  Part --> Log[("Append-Only Log + ISR Quorum")]
  Log --> CG1["Rider Dispatch Consumer Group"]
  Log --> CG2["Analytics / ClickHouse Sink"]`,
      },
    ],
  },
  {
    id: 'arch-social-feed',
    name: 'Global Social Feed & Timeline (X / Instagram Fan-Out)',
    domain: 'Social Media & High-Fanout Feeds',
    scaleTarget: '200K RPS Feed Reads · Hybrid Push/Pull Fan-Out · < 50ms p99',
    summary:
      'Combines Hybrid Fan-Out-on-Write (for regular users) with Fan-Out-on-Read (for 10M+ follower celebrities) backed by Redis Sorted Sets and LSM-Tree Cassandra/ScyllaDB.',
    walkthroughOrder: ['Gateway', 'PostSvc', 'Kafka', 'FanoutWorker', 'RedisFeed', 'Cassandra'],
    overviewMermaid: `flowchart LR
  Gateway["API Gateway + CDN"] -->|"Write Post"| PostSvc["Post Ingestion Service"]
  Gateway -->|"Read Home Feed"| FeedSvc["Timeline Aggregator"]
  PostSvc --> Cassandra[("Cassandra / ScyllaDB (LSM)")]
  PostSvc --> Kafka[("Kafka: post.published")]
  Kafka --> FanoutWorker["Hybrid Fan-Out Workers"]
  FanoutWorker -->|"Push (<100K followers)"| RedisFeed[("Redis Timeline ZSETs")]
  FeedSvc -->|"Merge Prebuilt + Celebs"| RedisFeed
  FeedSvc -.->|"Celebrity Pull"| Cassandra`,
    expandedFullMermaid: `flowchart LR
  subgraph Edge["Edge & API Layer"]
    Gateway["Edge CDN + GraphQL API Gateway"]
  end
  subgraph WritePath["Write & Hybrid Fan-Out Path"]
    Gateway --> PostSvc["Post Service (Snowflake 64-bit ID)"]
    PostSvc --> Cassandra[("Cassandra LSM: MemTable + WAL + Bloom + SSTables")]
    PostSvc --> Kafka[("Kafka Topic: post.published")]
    Kafka --> FanoutWorker["Fan-Out Workers (Check Follower Count)"]
    FanoutWorker -->|"Regular User: Push"| RedisFeed[("Redis Sorted Set ZADD (Top 800 IDs/User)")]
  end
  subgraph ReadPath["Sub-50ms Timeline Read Path"]
    Gateway --> FeedSvc["Feed Service"]
    FeedSvc -->|"O(log N) ZREVRANGE"| RedisFeed
    FeedSvc -->|"Merge Followed Celebrities"| Cassandra
  end`,
    nodes: [
      {
        id: 'Gateway',
        label: 'API Gateway + CDN',
        layer: 'Edge',
        tech: 'CloudFront + GraphQL Edge',
        role: 'Serves media blobs from Edge CDN and routes timeline/post RPCs with auth & throttling.',
        latencyBudget: '< 10 ms',
        keyAlgorithms: ['Edge Caching', 'Persisted GraphQL Queries', 'Rate Limiting'],
        connections: [
          { direction: 'Inbound', peer: 'Mobile Apps', protocol: 'HTTP/3', detail: 'Timeline fetch & post publish' },
          { direction: 'Outbound', peer: 'Post & Feed Services', protocol: 'gRPC', detail: 'Internal microservice calls' },
        ],
        expandedMermaid: `flowchart LR
  App["Client App"] --> CDN["Media CDN (Images/Video)"]
  App --> GW["GraphQL Gateway (Auth + Dedupe)"] --> Feed["Feed & Post Services"]`,
      },
      {
        id: 'PostSvc',
        label: 'Post Ingestion Service',
        layer: 'Compute',
        tech: 'Go / Java + Snowflake ID',
        role: 'Assigns k-ordered 64-bit Snowflake IDs, persists post metadata to Cassandra, and publishes fan-out events.',
        latencyBudget: '< 25 ms',
        keyAlgorithms: ['Snowflake Time-Ordered 64-bit IDs', 'Async Event Publishing'],
        connections: [
          { direction: 'Outbound', peer: 'Cassandra', protocol: 'CQL Quorum', detail: 'Durable post write' },
          { direction: 'Outbound', peer: 'Kafka', protocol: 'Async Batch', detail: 'Triggers follower fan-out' },
        ],
        expandedMermaid: `flowchart LR
  Req["POST /tweets"] --> ID["Generate 64-bit Snowflake ID<br/>(Timestamp + Worker + Seq)"]
  ID --> DB[("Cassandra Quorum Write")]
  ID --> Bus["Emit Kafka post.published"]`,
      },
      {
        id: 'FanoutWorker',
        label: 'Hybrid Fan-Out Workers',
        layer: 'Compute',
        tech: 'Kafka Consumers + Graph Service',
        role: 'Pushes post IDs into followers’ Redis timelines for normal users, while skipping fan-out for celebrities (merged on read!).',
        latencyBudget: '< 250 ms async',
        keyAlgorithms: ['Hybrid Push/Pull Fan-Out', 'Graph Adjacency Partitioning'],
        connections: [
          { direction: 'Inbound', peer: 'Kafka', protocol: 'Consumer Group', detail: 'post.published stream' },
          { direction: 'Outbound', peer: 'Redis Timeline ZSETs', protocol: 'Pipelined ZADD', detail: 'Batch timeline updates' },
        ],
        expandedMermaid: `flowchart LR
  Evt["post.published"] --> Check{"Followers > 100K<br/>(Celebrity)?"}
  Check -->|"No (99.9%)"| Push["Pipelined ZADD to Follower Timelines"]
  Check -->|"Yes (Celebrity)"| Skip["Skip Fan-Out (Merged at Read Time!)"]`,
      },
      {
        id: 'RedisFeed',
        label: 'Redis Timeline ZSETs',
        layer: 'Cache & Queue',
        tech: 'Redis Cluster (SkipList ZSET)',
        role: 'Stores pre-computed list of latest 800 post IDs per active user sorted by Snowflake timestamp for O(log N) instant loads.',
        latencyBudget: '< 2 ms',
        keyAlgorithms: ['SkipList Sorted Set (ZSET)', 'ZREVRANGE + ZREMRANGEBYRANK Trim'],
        connections: [
          { direction: 'Inbound', peer: 'Fan-Out Workers', protocol: 'Pipelined ZADD', detail: 'Insert new post IDs' },
          { direction: 'Inbound', peer: 'Feed Aggregator', protocol: 'ZREVRANGE', detail: 'Instant page-1 fetch' },
        ],
        expandedMermaid: `flowchart LR
  Read["ZREVRANGE feed:u42 0 49"] --> Skip["SkipList Index O(log N + 50)"]
  Skip --> Trim["Trim > 800 old IDs (Bounded RAM)"]
  Skip --> Hydrate["Hydrate Post JSON from Cache / Cassandra"]`,
      },
      {
        id: 'Cassandra',
        label: 'Cassandra / ScyllaDB (LSM)',
        layer: 'Database',
        tech: 'ScyllaDB / Cassandra LSM-Tree',
        role: 'Write-optimized wide-column store partitioning posts by `(author_id, snowflake_id DESC)` across consistent hash shards.',
        latencyBudget: '< 8 ms p99',
        keyAlgorithms: ['Consistent Hashing + VNodes', 'LSM-Tree MemTable + SSTable Compaction', 'Bloom Filters'],
        connections: [
          { direction: 'Inbound', peer: 'Post Service', protocol: 'CQL LOCAL_QUORUM', detail: 'Sequential LSM writes' },
          { direction: 'Inbound', peer: 'Feed Service', protocol: 'CQL Multi-Get', detail: 'Celebrity posts + cold hydration' },
        ],
        expandedMermaid: `flowchart LR
  PK["Partition Key: author_id"] --> Ring["Consistent Hash Ring (RF=3)"]
  Ring --> Mem["CommitLog WAL + RAM MemTable"]
  Mem --> SST[("Immutable SSTables + Bloom Filters")]
  SST --> Compact["Leveled Compaction (Merge Runs)"]`,
      },
      {
        id: 'Kafka',
        label: 'Kafka: post.published',
        layer: 'Cache & Queue',
        tech: 'Apache Kafka',
        role: 'Buffers massive celebrity posting spikes so fan-out workers drain smoothly without crashing Redis.',
        latencyBudget: '< 6 ms',
        keyAlgorithms: ['Partitioned Append Log', 'Backpressure Consumer Scaling'],
        connections: [
          { direction: 'Inbound', peer: 'Post Service', protocol: 'TCP Batch', detail: 'Publish post events' },
          { direction: 'Outbound', peer: 'Fan-Out Workers', protocol: 'Pull Batch', detail: 'Controlled consumption rate' },
        ],
        expandedMermaid: `flowchart LR
  Pub["Post Service"] --> Topic[("Kafka Topic (64 Partitions)")]
  Topic --> Workers["Auto-Scaled Fan-Out Consumer Group"]`,
      },
    ],
  },
  {
    id: 'arch-ai-rag-platform',
    name: 'Production AI RAG & Hybrid Search Platform',
    domain: 'AI Engineering & Vector Search',
    scaleTarget: '10M Document Chunks · < 40ms Retrieval · Semantic Cache',
    summary:
      'Dual-pipeline AI architecture combining asynchronous document chunking/embedding ingestion with low-latency Hybrid Search (pgvector HNSW + BM25 RRF) and Redis Semantic Caching.',
    walkthroughOrder: ['Gateway', 'SemCache', 'RagOrch', 'VectorDB', 'IngestPipe'],
    overviewMermaid: `flowchart LR
  Gateway["API Gateway"] --> RagOrch["RAG Orchestrator"]
  RagOrch -->|"1. Semantic Cache"| SemCache[("Redis Vector Cache")]
  RagOrch -->|"2. Hybrid Search"| VectorDB[("pgvector HNSW + BM25")]
  RagOrch -->|"3. Grounded Prompt"| LLM["LLM Inference Gateway"]
  Docs["Docs / S3 Upload"] --> IngestPipe["Chunk + Embed Worker"] --> VectorDB`,
    expandedFullMermaid: `flowchart LR
  subgraph Online["Online Query Path (<40ms Retrieval)"]
    Gateway["API Gateway (Tenant Auth + Token Quota)"] --> RagOrch["RAG Orchestrator"]
    RagOrch --> SemCache[("Redis Semantic Cache (Cosine > 0.96 -> Instant Hit!)")]
    RagOrch --> VectorDB[("PostgreSQL + pgvector: HNSW Layer 2->0 + GIN BM25")]
    VectorDB --> RRF["Reciprocal Rank Fusion + Cross-Encoder Re-Rank"] --> LLM["LLM Streaming SSE"]
  end
  subgraph Offline["Async Ingestion Pipeline"]
    Docs["S3 / GCS Upload"] --> Queue[("SQS / PubSub")] --> IngestPipe["Semantic Chunker + Batch Embedder"] --> VectorDB
  end`,
    nodes: [
      {
        id: 'Gateway',
        label: 'API Gateway',
        layer: 'Edge',
        tech: 'Envoy + Token Quota Limiter',
        role: 'Enforces tenant isolation, per-org token budgets, and SSE streaming timeouts.',
        latencyBudget: '< 5 ms',
        keyAlgorithms: ['Sliding Window Token Quota', 'Tenant RBAC Claims'],
        connections: [
          { direction: 'Inbound', peer: 'Web / SDK Clients', protocol: 'HTTPS SSE', detail: 'Streaming AI answers' },
          { direction: 'Outbound', peer: 'RAG Orchestrator', protocol: 'HTTP/2', detail: 'Scoped tenant request' },
        ],
        expandedMermaid: `flowchart LR
  Client["Client"] --> Auth["Verify Tenant JWT"] --> Quota{"Monthly Token Quota OK?"} --> Orch["RAG Orchestrator"]`,
      },
      {
        id: 'SemCache',
        label: 'Redis Semantic Cache',
        layer: 'Cache & Queue',
        tech: 'Redis Stack Vector Search',
        role: 'Matches semantically equivalent questions (cosine > 0.96) to return cached answers in 5ms, cutting LLM costs 40%+.',
        latencyBudget: '< 5 ms',
        keyAlgorithms: ['Cosine Threshold Lookup', 'TTL Invalidation on Doc Update'],
        connections: [
          { direction: 'Inbound', peer: 'RAG Orchestrator', protocol: 'RESP3', detail: 'Query embedding lookup' },
        ],
        expandedMermaid: `flowchart LR
  Emb["Query Vector"] --> Search["Redis Vector Index"] --> Thresh{"Cosine > 0.96?"}
  Thresh -->|"Yes (40% Savings)"| Hit["Return Cached Answer (5ms)"]
  Thresh -->|"No"| Miss["Proceed to Hybrid Retrieval"]`,
      },
      {
        id: 'RagOrch',
        label: 'RAG Orchestrator',
        layer: 'Compute',
        tech: 'Python 3.13 FastAPI asyncio',
        role: 'Coordinates query rewriting, parallel vector + BM25 retrieval, Reciprocal Rank Fusion, and citation verification.',
        latencyBudget: '< 40 ms pre-LLM',
        keyAlgorithms: ['Reciprocal Rank Fusion (RRF)', 'Asyncio TaskGroup Parallel Fan-Out'],
        connections: [
          { direction: 'Outbound', peer: 'pgvector + BM25', protocol: 'asyncpg', detail: 'Parallel hybrid search' },
          { direction: 'Outbound', peer: 'LLM Gateway', protocol: 'Streaming HTTP', detail: 'Grounded context prompt' },
        ],
        expandedMermaid: `flowchart LR
  Q["User Question"] --> Par["asyncio.TaskGroup"]
  Par --> V["Dense HNSW Top-30"]
  Par --> K["Sparse BM25 Top-30"]
  V & K --> RRF["RRF Score = 1/(60+rank)"] --> TopK["Top-8 Grounded Citations"]`,
      },
      {
        id: 'VectorDB',
        label: 'pgvector HNSW + BM25',
        layer: 'Database',
        tech: 'PostgreSQL 16 + pgvector 0.8 (halfvec)',
        role: 'Stores 10M+ chunks with tenant RLS security, HNSW approximate nearest-neighbor graph, and GIN full-text indexes.',
        latencyBudget: '< 15 ms',
        keyAlgorithms: ['HNSW Multi-Layer Graph', 'Half-Precision Quantization', 'Row-Level Security (RLS)', 'BM25 / GIN'],
        connections: [
          { direction: 'Inbound', peer: 'RAG Orchestrator', protocol: 'asyncpg Pool', detail: 'Iterative HNSW + tenant filter' },
          { direction: 'Inbound', peer: 'Ingestion Worker', protocol: 'COPY Bulk Upsert', detail: 'Document chunk indexing' },
        ],
        expandedMermaid: `flowchart LR
  Q["Query halfvec + tenant_id"] --> RLS["PostgreSQL RLS Policy Filter"]
  RLS --> HNSW["HNSW Layer 2 -> Layer 0 Beam (ef=100)"]
  RLS --> GIN["GIN Full-Text Keyword Index"]
  HNSW & GIN --> Top["Return Hybrid Candidate Chunks"]`,
      },
      {
        id: 'IngestPipe',
        label: 'Chunk & Embed Worker',
        layer: 'Compute',
        tech: 'Cloud Run / Celery + SQS',
        role: 'Splits PDFs/docs into overlapping semantic chunks, computes batch embeddings, and upserts idempotently via doc hash.',
        latencyBudget: 'Async Batch',
        keyAlgorithms: ['Recursive Semantic Chunking', 'SHA-256 Deduplication', 'Batch Embedding'],
        connections: [
          { direction: 'Inbound', peer: 'S3 / GCS Upload Event', protocol: 'SQS / PubSub', detail: 'New document trigger' },
          { direction: 'Outbound', peer: 'pgvector DB', protocol: 'Batch Upsert', detail: 'Write chunks + embeddings' },
        ],
        expandedMermaid: `flowchart LR
  Doc["Uploaded PDF/Doc"] --> Parse["Extract & Semantic Chunk (512 tok)"]
  Parse --> Hash["SHA-256 Dedupe Check"] --> Batch["Batch Embed (64/req)"] --> Upsert[("Bulk Upsert pgvector")]`,
      },
    ],
  },
  {
    id: 'arch-fintech-ledger',
    name: 'FinTech Double-Entry Payment Ledger (Stripe / UPI)',
    domain: 'FinTech & Strong Consistency',
    scaleTarget: 'Zero Lost Pennies · True Serializable · Full Audit Trail',
    summary:
      'Immutable append-only double-entry ledger enforced by Idempotency Keys, Serializable Snapshot Isolation (SSI) / Strict 2PL, synchronous Multi-AZ WAL, and async bank settlement.',
    walkthroughOrder: ['IdemGW', 'LedgerSvc', 'LedgerDB', 'FraudSvc', 'SettlementBus'],
    overviewMermaid: `flowchart LR
  IdemGW["Idempotency & mTLS Gateway"] --> LedgerSvc["Double-Entry Ledger Service"]
  LedgerSvc -->|"Pre-Auth Score"| FraudSvc["Real-Time Fraud Scorer"]
  LedgerSvc -->|"SSI / Strict 2PL"| LedgerDB[("Immutable Double-Entry Ledger DB")]
  LedgerDB -->|"Sync WAL"| Standby[("Sync Multi-AZ Standby")]
  LedgerDB -.->|"Outbox CDC"| SettlementBus[("Kafka Settlement Rail")]`,
    expandedFullMermaid: `flowchart LR
  subgraph Security["Zero-Trust & Idempotency Edge"]
    IdemGW["mTLS Gateway + Redis/DB Idempotency Key Lock"]
  end
  subgraph Core["Financial Core"]
    IdemGW --> LedgerSvc["Ledger Service (Debit + Credit = 0 Invariant)"]
    LedgerSvc -->|"gRPC < 15ms"| FraudSvc["Fraud ML Scorer (Feature Store)"]
    LedgerSvc --> LedgerDB[("PostgreSQL SSI + Strict 2PL (ORDER BY account_id ASC)")]
  end
  subgraph Durability["Zero-RPO Durability & Settlement"]
    LedgerDB -->|"Synchronous Commit (RPO=0)"| Standby[("AZ-2 Hot Standby")]
    LedgerDB -->|"Debezium Outbox"| SettlementBus[("Kafka -> Bank ACH / Card Networks")]
  end`,
    nodes: [
      {
        id: 'IdemGW',
        label: 'Idempotency & mTLS Gateway',
        layer: 'Edge',
        tech: 'Envoy mTLS + Idempotency Store',
        role: 'Guarantees client network retries NEVER double-charge a card by locking and caching responses per `Idempotency-Key`.',
        latencyBudget: '< 8 ms',
        keyAlgorithms: ['mTLS X.509 Handshake', 'Atomic Idempotency Key State Machine'],
        connections: [
          { direction: 'Inbound', peer: 'Merchant SDKs', protocol: 'mTLS HTTPS', detail: 'Payment requests with UUID key' },
          { direction: 'Outbound', peer: 'Ledger Service', protocol: 'gRPC', detail: 'Exactly-once validated call' },
        ],
        expandedMermaid: `flowchart LR
  Req["POST /charges (Idempotency-Key)"] --> State{"Key Status?"}
  State -->|"IN_PROGRESS"| Wait["409 Concurrent Retry"]
  State -->|"COMPLETED"| Return["Return Stored Receipt (No Re-Charge!)"]
  State -->|"NEW"| Lock["Insert Key -> Forward to Ledger"]`,
      },
      {
        id: 'LedgerSvc',
        label: 'Double-Entry Ledger Service',
        layer: 'Compute',
        tech: 'Java 21 + Spring Boot',
        role: 'Enforces integer minor units (cents) and balanced double-entry postings (`SUM(debits) == SUM(credits)`) inside one ACID transaction.',
        latencyBudget: '< 30 ms',
        keyAlgorithms: ['Double-Entry Accounting Invariant', 'Deterministic Account Lock Ordering'],
        connections: [
          { direction: 'Outbound', peer: 'Fraud Scorer', protocol: 'gRPC', detail: 'Risk check before commit' },
          { direction: 'Outbound', peer: 'Ledger DB', protocol: 'JDBC SERIALIZABLE', detail: 'Append-only ledger postings' },
        ],
        expandedMermaid: `flowchart LR
  Transfer["Transfer $50: A -> B"] --> Sort["Sort Account IDs (min, max)<br/>Prevents Deadlocks!"]
  Sort --> Post["Insert Debit(-5000) + Credit(+5000)"]
  Post --> Check{"Sum == 0 & Balance >= 0?"} --> Commit["ACID Commit"]`,
      },
      {
        id: 'LedgerDB',
        label: 'Immutable Double-Entry Ledger DB',
        layer: 'Database',
        tech: 'PostgreSQL / CockroachDB (Sync Multi-AZ)',
        role: 'Append-only journal with `synchronous_commit = remote_apply`, SSI write-skew defense, and zero-RPO failover.',
        latencyBudget: '< 20 ms',
        keyAlgorithms: ['Serializable Snapshot Isolation (SSI)', 'Strict 2PL', 'Synchronous WAL Replication', 'ARIES Recovery'],
        connections: [
          { direction: 'Inbound', peer: 'Ledger Service', protocol: 'PgBouncer', detail: 'Atomic ledger inserts' },
          { direction: 'Outbound', peer: 'Multi-AZ Standby', protocol: 'Sync WAL', detail: 'RPO = 0 durability guarantee' },
        ],
        expandedMermaid: `flowchart LR
  Tx["Ledger Tx"] --> SSI["SSI SIREAD Check + Row Lock"]
  SSI --> Append[("Append-Only Journal Table<br/>(Never UPDATE/DELETE History!)")]
  Append --> SyncWAL[("Sync WAL -> AZ-2 Standby ACK (RPO=0)")]
  SyncWAL --> Outbox["CDC Outbox -> Settlement Bus"]`,
      },
      {
        id: 'FraudSvc',
        label: 'Real-Time Fraud Scorer',
        layer: 'Compute',
        tech: 'Python / ONNX + Redis Feature Store',
        role: 'Evaluates velocity rules (transactions in last 5 min, geo-impossibility) and ML risk score in < 15ms.',
        latencyBudget: '< 15 ms',
        keyAlgorithms: ['Sliding Window Velocity Counters', 'Gradient Boosted Trees (ONNX)'],
        connections: [
          { direction: 'Inbound', peer: 'Ledger Service', protocol: 'gRPC', detail: 'Pre-commit risk score' },
        ],
        expandedMermaid: `flowchart LR
  Tx["Charge Payload"] --> Vel["Redis Sliding Window<br/>(Tx/5min, Geo Velocity)"]
  Vel --> Model["ONNX Fraud Model (<8ms)"] --> Decision{"Score > 0.85?"}
  Decision -->|"Yes"| Block["Decline / 3DS Challenge"]
  Decision -->|"No"| Allow["Approve Commit"]`,
      },
      {
        id: 'SettlementBus',
        label: 'Kafka Settlement Rail',
        layer: 'Cache & Queue',
        tech: 'Kafka + Reconciliation Workers',
        role: 'Reliably delivers committed ledger payouts to external bank/card rails with automated nightly reconciliation.',
        latencyBudget: 'Async Guaranteed',
        keyAlgorithms: ['Transactional Outbox', 'Idempotent Inbox Table', 'Dead-Letter Replay'],
        connections: [
          { direction: 'Inbound', peer: 'Ledger DB CDC', protocol: 'Debezium', detail: 'Committed payout events' },
          { direction: 'Outbound', peer: 'External Bank Rails', protocol: 'ISO 20022 / HTTPS', detail: 'Retryable settlement' },
        ],
        expandedMermaid: `flowchart LR
  CDC["Outbox Event"] --> Kafka[("Kafka Settlement Topic")]
  Kafka --> Inbox{"Idempotent Inbox Check"} --> Bank["Call Bank ACH / Card Rail"]`,
      },
    ],
  },
];
