export type SystemLayerId = 'edge' | 'compute' | 'cache_async' | 'storage';

export interface SystemComponentBlock {
  id: string;
  name: string;
  layer: SystemLayerId;
  role: string;
  latencyImpactMs: number;
  maxQpsBoost: number;
}

export interface SystemScenario {
  id: string;
  title: string;
  companyFrequency: string;
  summary: string;
  defaultDauMillions: number;
  defaultReadWriteRatio: number; // e.g., 100 means 100:1 reads to writes
  defaultLatencyBudgetMs: number;
  requiredComponents: {
    id: string;
    whyNeeded: string;
  }[];
  recommendedComponents: {
    id: string;
    whyHelpful: string;
  }[];
  animationSteps: {
    step: number;
    title: string;
    activeNodes: string[];
    packetNote: string;
    latencyMs: number;
  }[];
}

export const SYSTEM_LAYERS: { id: SystemLayerId; title: string; subtitle: string }[] = [
  { id: 'edge', title: '1. Edge & Traffic Ingress', subtitle: 'CDN, DNS, Rate Limiting, Load Balancing' },
  { id: 'compute', title: '2. Compute & API Gateway', subtitle: 'Stateless Services, Routing, WebSockets' },
  { id: 'cache_async', title: '3. Caching & Async Pipeline', subtitle: 'In-Memory Cache, Bloom Filter, Message Queues' },
  { id: 'storage', title: '4. Data Persistence & Sharding', subtitle: 'Primary DB, Read Replicas, Sharding, Object Store' },
];

export const SYSTEM_COMPONENTS: SystemComponentBlock[] = [
  {
    id: 'cdn',
    name: 'Global CDN',
    layer: 'edge',
    role: 'Serves static media & cached edge redirects close to users',
    latencyImpactMs: -45,
    maxQpsBoost: 40000,
  },
  {
    id: 'load-balancer',
    name: 'L7 Load Balancer',
    layer: 'edge',
    role: 'Distributes traffic across healthy stateless API servers',
    latencyImpactMs: 3,
    maxQpsBoost: 50000,
  },
  {
    id: 'rate-limiter',
    name: 'Distributed Rate Limiter',
    layer: 'edge',
    role: 'Token Bucket / Sliding Window guard against bursts & abuse',
    latencyImpactMs: 2,
    maxQpsBoost: 15000,
  },
  {
    id: 'api-gateway',
    name: 'Stateless API Servers',
    layer: 'compute',
    role: 'Horizontally scalable app tier handling auth & validation',
    latencyImpactMs: 12,
    maxQpsBoost: 25000,
  },
  {
    id: 'websocket-gw',
    name: 'WebSocket Push Gateway',
    layer: 'compute',
    role: 'Persistent bi-directional connections for live chat & presence',
    latencyImpactMs: 8,
    maxQpsBoost: 20000,
  },
  {
    id: 'redis-cache',
    name: 'Redis Cluster Cache',
    layer: 'cache_async',
    role: 'Sub-millisecond hot-key lookup eliminating DB read pressure',
    latencyImpactMs: -35,
    maxQpsBoost: 80000,
  },
  {
    id: 'bloom-filter',
    name: 'Bloom Filter Guard',
    layer: 'cache_async',
    role: 'O(1)-space probabilistic check rejecting non-existent keys before DB',
    latencyImpactMs: -15,
    maxQpsBoost: 30000,
  },
  {
    id: 'kafka-queue',
    name: 'Kafka Message Queue',
    layer: 'cache_async',
    role: 'Decouples heavy fan-out writes, analytics & async retries',
    latencyImpactMs: -20,
    maxQpsBoost: 45000,
  },
  {
    id: 'primary-db',
    name: 'Primary SQL / NoSQL DB',
    layer: 'storage',
    role: 'Durable source of truth for writes and transactional state',
    latencyImpactMs: 30,
    maxQpsBoost: 5000,
  },
  {
    id: 'read-replicas',
    name: 'Read Replicas',
    layer: 'storage',
    role: 'Offloads heavy SELECT queries away from primary write node',
    latencyImpactMs: -10,
    maxQpsBoost: 30000,
  },
  {
    id: 'consistent-sharding',
    name: 'Consistent Hash Shards',
    layer: 'storage',
    role: 'Partitions massive tables evenly with minimal re-balancing',
    latencyImpactMs: -8,
    maxQpsBoost: 60000,
  },
];

export const SYSTEM_SCENARIOS: SystemScenario[] = [
  {
    id: 'url-shortener',
    title: 'Design a Scalable URL Shortener (TinyURL)',
    companyFrequency: 'Google · Amazon · Meta · Uber',
    summary: 'Handle 100M+ daily redirects with sub-30ms P99 latency and collision-free short codes.',
    defaultDauMillions: 50,
    defaultReadWriteRatio: 100,
    defaultLatencyBudgetMs: 40,
    requiredComponents: [
      { id: 'load-balancer', whyNeeded: 'Traffic must be distributed across multiple stateless redirect servers to avoid a single point of failure.' },
      { id: 'api-gateway', whyNeeded: 'Stateless app servers decode Base62 keys and issue 301/302 redirects.' },
      { id: 'redis-cache', whyNeeded: 'With a 100:1 read-to-write ratio, caching hot URLs in Redis absorbs 80%+ of redirect reads.' },
      { id: 'primary-db', whyNeeded: 'Durable storage for long-to-short URL mappings.' },
    ],
    recommendedComponents: [
      { id: 'bloom-filter', whyHelpful: 'Prevents cache-penetration attacks by instantly rejecting unknown short codes before hitting the DB.' },
      { id: 'rate-limiter', whyNeeded: '', whyHelpful: 'Stops bots from exhausting Base62 keyspace or flooding write endpoints.' } as never,
    ].map((x) => ({ id: x.id, whyHelpful: x.whyHelpful })),
    animationSteps: [
      {
        step: 1,
        title: 'Client requests GET /a9X2k',
        activeNodes: ['load-balancer'],
        packetNote: 'L7 Load Balancer routes request to nearest healthy stateless API server.',
        latencyMs: 4,
      },
      {
        step: 2,
        title: 'Rate Limiter & Bloom Filter Check',
        activeNodes: ['rate-limiter', 'bloom-filter'],
        packetNote: 'Rate limit passes; Bloom Filter confirms key "a9X2k" probably exists (blocks fake spam keys in 0.2ms).',
        latencyMs: 6,
      },
      {
        step: 3,
        title: 'Redis Cache Lookup (Hot Key Hit)',
        activeNodes: ['api-gateway', 'redis-cache'],
        packetNote: 'Redis finds cached destination URL in memory without touching disk storage.',
        latencyMs: 9,
      },
      {
        step: 4,
        title: 'Async Click Analytics & 302 Redirect',
        activeNodes: ['kafka-queue', 'primary-db'],
        packetNote: 'User gets immediate 302 redirect while click event streams asynchronously via Kafka to DB.',
        latencyMs: 11,
      },
    ],
  },
  {
    id: 'social-feed',
    title: 'Design a Social Timeline Feed (X / Instagram)',
    companyFrequency: 'Meta · X · LinkedIn · Snap',
    summary: 'Balance fan-out-on-write for regular users vs fan-out-on-read for celebrity accounts.',
    defaultDauMillions: 120,
    defaultReadWriteRatio: 50,
    defaultLatencyBudgetMs: 80,
    requiredComponents: [
      { id: 'load-balancer', whyNeeded: 'Spreads feed requests across horizontally scaled timeline services.' },
      { id: 'api-gateway', whyNeeded: 'Runs hybrid fan-out merge logic between precomputed timelines and celebrity posts.' },
      { id: 'redis-cache', whyNeeded: 'Stores each user’s precomputed home timeline list (top 500 post IDs) in RAM.' },
      { id: 'kafka-queue', whyNeeded: 'Decouples post creation from fanning out updates to thousands of follower caches.' },
      { id: 'primary-db', whyNeeded: 'Stores canonical user graph and post records.' },
    ],
    recommendedComponents: [
      { id: 'cdn', whyHelpful: 'Offloads post images/videos to edge PoPs so feed servers only transfer lightweight JSON.' },
      { id: 'consistent-sharding', whyHelpful: 'Shards posts by user_id / post_id across horizontal database partitions.' },
    ],
    animationSteps: [
      {
        step: 1,
        title: 'Author Publishes New Post',
        activeNodes: ['load-balancer', 'api-gateway'],
        packetNote: 'API server persists post to Primary DB and immediately returns 201 Created.',
        latencyMs: 18,
      },
      {
        step: 2,
        title: 'Async Fan-Out Event via Kafka',
        activeNodes: ['kafka-queue'],
        packetNote: 'Kafka buffers fan-out jobs so followers’ Redis timelines update asynchronously without blocking the author.',
        latencyMs: 24,
      },
      {
        step: 3,
        title: 'Follower Opens Feed (Redis + CDN)',
        activeNodes: ['redis-cache', 'cdn'],
        packetNote: 'Timeline IDs load from Redis in <5ms while media assets stream from nearest Edge CDN.',
        latencyMs: 32,
      },
    ],
  },
  {
    id: 'distributed-rate-limiter',
    title: 'Design a Distributed API Rate Limiter',
    companyFrequency: 'Stripe · Cloudflare · Amazon · Atlassian',
    summary: 'Enforce per-user quotas across 100+ API nodes with atomic Redis Lua counters.',
    defaultDauMillions: 80,
    defaultReadWriteRatio: 10,
    defaultLatencyBudgetMs: 15,
    requiredComponents: [
      { id: 'rate-limiter', whyNeeded: 'Core Token Bucket / Sliding Window Log middleware inspecting user API keys.' },
      { id: 'redis-cache', whyNeeded: 'Shared atomic in-memory counters across all stateless gateways prevent per-node drift.' },
      { id: 'api-gateway', whyNeeded: 'Routes valid requests to downstream microservices and emits 429 Retry-After headers.' },
    ],
    recommendedComponents: [
      { id: 'load-balancer', whyHelpful: 'Terminates TLS and routes regional traffic evenly across gateways.' },
      { id: 'kafka-queue', whyHelpful: 'Streams rejected/429 audit metrics asynchronously without adding latency.' },
    ],
    animationSteps: [
      {
        step: 1,
        title: 'API Request Enters Edge Gateway',
        activeNodes: ['load-balancer', 'rate-limiter'],
        packetNote: 'Gateway extracts userId / IP key and checks local rule cache.',
        latencyMs: 2,
      },
      {
        step: 2,
        title: 'Atomic Redis Token Bucket Check',
        activeNodes: ['redis-cache'],
        packetNote: 'Single Lua script atomically refills tokens and decrements count in 1 network round-trip.',
        latencyMs: 5,
      },
      {
        step: 3,
        title: 'Forward Request or Return 429',
        activeNodes: ['api-gateway', 'kafka-queue'],
        packetNote: 'Allowed traffic reaches backend; rejected bursts emit async alert events to Kafka.',
        latencyMs: 7,
      },
    ],
  },
  {
    id: 'realtime-chat',
    title: 'Design a Real-Time Chat & Presence System',
    companyFrequency: 'WhatsApp · Slack · Discord · Microsoft',
    summary: 'Maintain millions of concurrent WebSockets with guaranteed message ordering & offline sync.',
    defaultDauMillions: 100,
    defaultReadWriteRatio: 5,
    defaultLatencyBudgetMs: 50,
    requiredComponents: [
      { id: 'websocket-gw', whyNeeded: 'Maintains stateful bi-directional connections for instant message delivery.' },
      { id: 'kafka-queue', whyNeeded: 'Reliably routes messages between sender gateway and recipient’s connected gateway.' },
      { id: 'redis-cache', whyNeeded: 'Tracks online presence heartbeats and userId -> gatewayServerId routing.' },
      { id: 'consistent-sharding', whyNeeded: 'Partitions chat history by channel_id so message sequences scale horizontally.' },
    ],
    recommendedComponents: [
      { id: 'load-balancer', whyHelpful: 'Balances initial WebSocket upgrade handshakes.' },
      { id: 'cdn', whyHelpful: 'Serves uploaded chat attachments and voice notes.' },
    ],
    animationSteps: [
      {
        step: 1,
        title: 'Sender Emits Frame Over WebSocket',
        activeNodes: ['load-balancer', 'websocket-gw'],
        packetNote: 'Persistent connection sends message payload with client sequence ID.',
        latencyMs: 8,
      },
      {
        step: 2,
        title: 'Presence Lookup & Kafka Routing',
        activeNodes: ['redis-cache', 'kafka-queue'],
        packetNote: 'Redis identifies recipient’s active gateway; Kafka guarantees ordered delivery.',
        latencyMs: 19,
      },
      {
        step: 3,
        title: 'Persist to Sharded History & Push',
        activeNodes: ['consistent-sharding', 'websocket-gw'],
        packetNote: 'Chat message saved to channel shard and pushed live to recipient socket.',
        latencyMs: 28,
      },
    ],
  },
];

export interface ArchitectureEvaluation {
  estimatedQps: number;
  estimatedPeakQps: number;
  dailyStorageGb: number;
  projectedLatencyMs: number;
  capacityQps: number;
  scorePct: number;
  status: 'OPTIMAL' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_BOTTLENECK';
  checks: { label: string; passed: boolean; detail: string }[];
  improvements: string[];
}

export function evaluateSystemArchitecture(
  scenario: SystemScenario,
  inputs: {
    dauMillions: number;
    readWriteRatio: number;
    latencyBudgetMs: number;
    consistencyMode: 'availability' | 'strong-consistency';
  },
  placedIds: string[]
): ArchitectureEvaluation {
  // Back-of-the-envelope math: ~10 requests/user/day average -> peak 2.5x
  const totalDailyReqs = inputs.dauMillions * 1_000_000 * 10;
  const estimatedQps = Math.round(totalDailyReqs / 86400);
  const estimatedPeakQps = Math.round(estimatedQps * 2.5);
  const writeFraction = 1 / (inputs.readWriteRatio + 1);
  const dailyStorageGb = Math.max(1, Math.round((totalDailyReqs * writeFraction * 0.5) / 1_000_000));

  const placedBlocks = SYSTEM_COMPONENTS.filter((c) => placedIds.includes(c.id));
  const capacityQps =
    placedBlocks.length === 0
      ? 0
      : placedBlocks.reduce((acc, b) => acc + b.maxQpsBoost, 1000);

  const rawLatency =
    65 + placedBlocks.reduce((acc, b) => acc + b.latencyImpactMs, 0);
  const projectedLatencyMs = placedBlocks.length === 0 ? 999 : Math.max(8, rawLatency);

  const checks: { label: string; passed: boolean; detail: string }[] = [];
  const improvements: string[] = [];

  for (const req of scenario.requiredComponents) {
    const hasIt = placedIds.includes(req.id);
    const compName = SYSTEM_COMPONENTS.find((c) => c.id === req.id)?.name ?? req.id;
    checks.push({
      label: `Core Component: ${compName}`,
      passed: hasIt,
      detail: hasIt ? 'Present in architecture.' : req.whyNeeded,
    });
    if (!hasIt) {
      improvements.push(`Add ${compName}: ${req.whyNeeded}`);
    }
  }

  // Dynamic input-aware diagnostics
  if (inputs.readWriteRatio >= 30 && !placedIds.includes('redis-cache')) {
    improvements.push(
      `Your ${inputs.readWriteRatio}:1 Read-Heavy ratio will saturate disk storage. Place a Redis Cluster Cache in Layer 3.`
    );
  }

  if (estimatedPeakQps > 15000 && !placedIds.includes('consistent-sharding') && !placedIds.includes('read-replicas')) {
    improvements.push(
      `Peak load (${estimatedPeakQps.toLocaleString()} QPS) exceeds a single database node. Add Read Replicas or Consistent Hash Shards.`
    );
  }

  if (inputs.latencyBudgetMs <= 45 && !placedIds.includes('cdn') && scenario.id !== 'distributed-rate-limiter') {
    improvements.push(
      `Tight ${inputs.latencyBudgetMs}ms latency SLA benefits from a Global CDN at the edge.`
    );
  }

  if (!placedIds.includes('rate-limiter')) {
    improvements.push(
      'Consider adding a Distributed Rate Limiter to protect downstream services from traffic spikes or scrapers.'
    );
  }

  if (inputs.consistencyMode === 'strong-consistency' && placedIds.includes('redis-cache')) {
    checks.push({
      label: 'Consistency Trade-Off',
      passed: true,
      detail: 'Use Write-Through caching or short TTLs so reads never serve stale transactional state.',
    });
  }

  const latencyPass = projectedLatencyMs <= inputs.latencyBudgetMs;
  checks.push({
    label: `Latency SLA (<= ${inputs.latencyBudgetMs}ms)`,
    passed: latencyPass,
    detail: `Projected P99 latency: ${projectedLatencyMs}ms`,
  });

  const qpsPass = capacityQps >= estimatedPeakQps;
  checks.push({
    label: `Peak Throughput (${estimatedPeakQps.toLocaleString()} QPS)`,
    passed: qpsPass,
    detail: `Architecture capacity: ${capacityQps.toLocaleString()} QPS`,
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const scorePct = Math.round((passedCount / Math.max(1, checks.length)) * 100);
  const status =
    scorePct >= 85
      ? 'OPTIMAL'
      : scorePct >= 55
        ? 'NEEDS_IMPROVEMENT'
        : 'CRITICAL_BOTTLENECK';

  return {
    estimatedQps,
    estimatedPeakQps,
    dailyStorageGb,
    projectedLatencyMs,
    capacityQps,
    scorePct,
    status,
    checks,
    improvements,
  };
}
