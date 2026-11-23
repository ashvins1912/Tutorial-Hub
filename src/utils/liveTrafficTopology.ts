import type { SystemEdge, SystemNode } from '../types/system';

export type TrafficDomain = 'system-design' | 'playground' | 'devops' | 'database' | 'mermaid';

export type TrafficNodeRole =
  | 'client'
  | 'edge'
  | 'load-balancer'
  | 'service'
  | 'cache'
  | 'queue'
  | 'shard'
  | 'replica'
  | 'db'
  | 'security'
  | 'observability'
  | 'k8s';

export interface TrafficNode {
  id: string;
  label: string;
  sublabel: string;
  role: TrafficNodeRole;
  tier: number;
  capacityRps: number;
  baseLatencyMs: number;
  failoverTargetId?: string;
  isHotShard?: boolean;
  isReplica?: boolean;
  defaultFailed?: boolean;
}

export interface TrafficEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  kind?: 'primary' | 'cache-hit' | 'async' | 'failover' | 'replication';
  weight?: number;
}

export interface TrafficTopology {
  id: string;
  title: string;
  subtitle: string;
  domain: TrafficDomain;
  nodes: TrafficNode[];
  edges: TrafficEdge[];
  defaultRps: number;
  defaultCacheHitPct: number;
  primaryFailNodeId?: string;
  hotShardNodeId?: string;
  patternHighlights: string[];
}

export interface TrafficSimConfig {
  entryRps: number;
  cacheHitPct: number;
  hotShardSkew: boolean;
  failedNodeIds: string[];
}

export type NodeHealthStatus =
  | 'nominal'
  | 'elevated'
  | 'bottleneck'
  | 'failed'
  | 'failover-active';

export interface NodeLiveStats {
  id: string;
  incomingRps: number;
  processedRps: number;
  droppedRps: number;
  utilizationPct: number;
  latencyMs: number;
  status: NodeHealthStatus;
  receivingFailover: boolean;
}

export interface EdgeLiveStats {
  id: string;
  source: string;
  target: string;
  rps: number;
  kind: 'primary' | 'cache-hit' | 'async' | 'failover' | 'replication';
  isBottlenecked: boolean;
  isFailoverActive: boolean;
  isDropped: boolean;
}

export interface TrafficDiagnostic {
  severity: 'ok' | 'warn' | 'critical';
  title: string;
  detail: string;
  mitigation: string;
}

export interface TrafficSimulationSnapshot {
  nodeStats: Record<string, NodeLiveStats>;
  edgeStats: Record<string, EdgeLiveStats>;
  totalEntryRps: number;
  effectiveSuccessRps: number;
  cacheOffloadRps: number;
  droppedRps: number;
  p99LatencyMs: number;
  errorRatePct: number;
  bottleneckNodeIds: string[];
  activeFailoverPairs: { failedId: string; targetId: string }[];
  diagnostics: TrafficDiagnostic[];
}

/* -------------------------------------------------------------------------- */
/* Curated Reusable Architectural Pattern Presets                             */
/* -------------------------------------------------------------------------- */

export const LIVE_TRAFFIC_PRESETS: TrafficTopology[] = [
  {
    id: 'lb-cache-sharded-db',
    title: 'Load Balancer -> Service -> Cache -> Sharded DB + Failover',
    subtitle: 'Canonical distributed read/write path with L7 routing, Redis cache-aside, consistent-hash shards, and replica promotion.',
    domain: 'system-design',
    defaultRps: 28000,
    defaultCacheHitPct: 78,
    primaryFailNodeId: 'shard-0',
    hotShardNodeId: 'shard-1',
    patternHighlights: [
      'L7 Load Balancer distributes traffic across stateless API pods with health checks.',
      'Redis Cluster absorbs 78% of reads at <2ms; cache misses fan out to consistent-hash DB shards.',
      'Click Shard 0 (or trigger Failover) to watch reads/writes reroute to Hot Standby Replica.',
    ],
    nodes: [
      { id: 'client', label: 'Clients & Edge', sublabel: 'TLS 1.3 / HTTP/3', role: 'client', tier: 0, capacityRps: 250000, baseLatencyMs: 6 },
      { id: 'lb', label: 'L7 Load Balancer', sublabel: 'Envoy / ALB Least-Conn', role: 'load-balancer', tier: 1, capacityRps: 120000, baseLatencyMs: 3 },
      { id: 'svc-a', label: 'API Service A', sublabel: 'Stateless Pod Pool', role: 'service', tier: 2, capacityRps: 55000, baseLatencyMs: 9, failoverTargetId: 'svc-b' },
      { id: 'svc-b', label: 'API Service B', sublabel: 'Stateless Pod Pool', role: 'service', tier: 2, capacityRps: 55000, baseLatencyMs: 9, failoverTargetId: 'svc-a' },
      { id: 'cache', label: 'Redis Cache Cluster', sublabel: 'Cache-Aside + Singleflight', role: 'cache', tier: 3, capacityRps: 140000, baseLatencyMs: 1.5 },
      { id: 'shard-0', label: 'DB Shard 0 (Primary)', sublabel: 'Hash Range 00-7F', role: 'shard', tier: 4, capacityRps: 12000, baseLatencyMs: 14, failoverTargetId: 'replica-0' },
      { id: 'shard-1', label: 'DB Shard 1 (Hot Key)', sublabel: 'Hash Range 80-FF', role: 'shard', tier: 4, capacityRps: 12000, baseLatencyMs: 16, isHotShard: true, failoverTargetId: 'replica-0' },
      { id: 'replica-0', label: 'Standby Read Replica', sublabel: 'WAL Stream Failover', role: 'replica', tier: 4, capacityRps: 26000, baseLatencyMs: 18, isReplica: true },
    ],
    edges: [
      { id: 'e-c-lb', source: 'client', target: 'lb', label: 'HTTPS', kind: 'primary' },
      { id: 'e-lb-sa', source: 'lb', target: 'svc-a', label: '50% traffic', kind: 'primary', weight: 0.5 },
      { id: 'e-lb-sb', source: 'lb', target: 'svc-b', label: '50% traffic', kind: 'primary', weight: 0.5 },
      { id: 'e-sa-cache', source: 'svc-a', target: 'cache', label: 'GET / MGET', kind: 'primary' },
      { id: 'e-sb-cache', source: 'svc-b', target: 'cache', label: 'GET / MGET', kind: 'primary' },
      { id: 'e-cache-s0', source: 'cache', target: 'shard-0', label: 'Miss / Write', kind: 'primary', weight: 0.45 },
      { id: 'e-cache-s1', source: 'cache', target: 'shard-1', label: 'Miss / Write', kind: 'primary', weight: 0.45 },
      { id: 'e-cache-rep', source: 'cache', target: 'replica-0', label: 'Read Replica', kind: 'replication', weight: 0.1 },
      { id: 'e-s0-rep', source: 'shard-0', target: 'replica-0', label: 'Failover Promotion', kind: 'failover' },
      { id: 'e-s1-rep', source: 'shard-1', target: 'replica-0', label: 'Failover Promotion', kind: 'failover' },
    ],
  },
  {
    id: 'event-driven-kafka',
    title: 'Event-Driven Microservices (Gateway -> Kafka -> Sharded Ledger)',
    subtitle: 'Decoupled write ingestion with Kafka partition backpressure, idempotent workers, and sharded persistence.',
    domain: 'system-design',
    defaultRps: 36000,
    defaultCacheHitPct: 55,
    primaryFailNodeId: 'worker-pay',
    hotShardNodeId: 'ledger-shard-1',
    patternHighlights: [
      'API Gateway validates idempotency keys in Redis before emitting durable events to Kafka.',
      'Kafka absorbs 10x burst spikes so downstream Payment & Inventory workers never crash.',
      'Failing a worker triggers consumer-group rebalance onto sibling worker pods.',
    ],
    nodes: [
      { id: 'edge', label: 'API Gateway + WAF', sublabel: 'Token Bucket Rate Limit', role: 'edge', tier: 0, capacityRps: 150000, baseLatencyMs: 4 },
      { id: 'order-svc', label: 'Order Ingest API', sublabel: 'Outbox + Idempotency', role: 'service', tier: 1, capacityRps: 80000, baseLatencyMs: 8 },
      { id: 'idem-cache', label: 'Redis Idempotency', sublabel: 'Dedup + Hot Read Cache', role: 'cache', tier: 2, capacityRps: 130000, baseLatencyMs: 1.5 },
      { id: 'kafka', label: 'Kafka Event Bus', sublabel: '64 Partitions · RF=3', role: 'queue', tier: 2, capacityRps: 160000, baseLatencyMs: 5 },
      { id: 'worker-pay', label: 'Payment Worker Group', sublabel: 'Consumer Group A', role: 'service', tier: 3, capacityRps: 24000, baseLatencyMs: 18, failoverTargetId: 'worker-inv' },
      { id: 'worker-inv', label: 'Inventory & Fallback', sublabel: 'Consumer Group B', role: 'service', tier: 3, capacityRps: 38000, baseLatencyMs: 12 },
      { id: 'ledger-shard-0', label: 'Ledger Shard 0', sublabel: 'Double-Entry PG', role: 'shard', tier: 4, capacityRps: 15000, baseLatencyMs: 14, failoverTargetId: 'ledger-rep' },
      { id: 'ledger-shard-1', label: 'Ledger Shard 1 (Hot)', sublabel: 'Flash-Sale Merchant', role: 'shard', tier: 4, capacityRps: 14000, baseLatencyMs: 16, isHotShard: true, failoverTargetId: 'ledger-rep' },
      { id: 'ledger-rep', label: 'DR Standby Ledger', sublabel: 'Sync Quorum Standby', role: 'replica', tier: 4, capacityRps: 30000, baseLatencyMs: 19, isReplica: true },
    ],
    edges: [
      { id: 'ek-1', source: 'edge', target: 'order-svc', label: 'gRPC / HTTP2', kind: 'primary' },
      { id: 'ek-2', source: 'order-svc', target: 'idem-cache', label: 'Cache Check', kind: 'primary' },
      { id: 'ek-3', source: 'idem-cache', target: 'kafka', label: 'Append Event', kind: 'async' },
      { id: 'ek-4', source: 'kafka', target: 'worker-pay', label: 'Consume', kind: 'async', weight: 0.5 },
      { id: 'ek-5', source: 'kafka', target: 'worker-inv', label: 'Consume', kind: 'async', weight: 0.5 },
      { id: 'ek-6', source: 'worker-pay', target: 'ledger-shard-0', label: 'Commit Tx', kind: 'primary', weight: 0.5 },
      { id: 'ek-7', source: 'worker-pay', target: 'ledger-shard-1', label: 'Commit Tx', kind: 'primary', weight: 0.5 },
      { id: 'ek-8', source: 'worker-inv', target: 'ledger-shard-1', label: 'Reserve Stock', kind: 'primary' },
      { id: 'ek-f1', source: 'worker-pay', target: 'worker-inv', label: 'Rebalance', kind: 'failover' },
      { id: 'ek-f2', source: 'ledger-shard-0', target: 'ledger-rep', label: 'Failover', kind: 'failover' },
      { id: 'ek-f3', source: 'ledger-shard-1', target: 'ledger-rep', label: 'Failover', kind: 'failover' },
    ],
  },
  {
    id: 'multi-region-active-active',
    title: 'Multi-Region Active-Active GeoDNS & Regional Failover',
    subtitle: 'Anycast edge routing across US-East and EU-West with cross-region failover and global consensus storage.',
    domain: 'system-design',
    defaultRps: 50000,
    defaultCacheHitPct: 82,
    primaryFailNodeId: 'lb-us',
    hotShardNodeId: 'db-us',
    patternHighlights: [
      'Anycast GeoDNS routes users to the lowest-RTT healthy region.',
      'Click US-East Ingress to simulate a full AWS/GCP regional outage and watch 100% traffic drain to EU-West.',
      'Global Spanner / CockroachDB raft groups preserve cross-region consistency.',
    ],
    nodes: [
      { id: 'geodns', label: 'Anycast GeoDNS + CDN', sublabel: 'BGP Health Probing', role: 'edge', tier: 0, capacityRps: 300000, baseLatencyMs: 5 },
      { id: 'lb-us', label: 'US-East L7 Ingress', sublabel: 'us-east-1 Primary', role: 'load-balancer', tier: 1, capacityRps: 65000, baseLatencyMs: 4, failoverTargetId: 'lb-eu' },
      { id: 'lb-eu', label: 'EU-West L7 Ingress', sublabel: 'eu-west-1 Active', role: 'load-balancer', tier: 1, capacityRps: 85000, baseLatencyMs: 5, failoverTargetId: 'lb-us' },
      { id: 'cache-us', label: 'US Redis Edge Cache', sublabel: 'Local L1/L2 Cache', role: 'cache', tier: 2, capacityRps: 90000, baseLatencyMs: 2, failoverTargetId: 'cache-eu' },
      { id: 'cache-eu', label: 'EU Redis Edge Cache', sublabel: 'Local L1/L2 Cache', role: 'cache', tier: 2, capacityRps: 95000, baseLatencyMs: 2, failoverTargetId: 'cache-us' },
      { id: 'db-us', label: 'US Global DB Shard', sublabel: 'TrueTime Raft Leader', role: 'shard', tier: 3, capacityRps: 18000, baseLatencyMs: 18, isHotShard: true, failoverTargetId: 'db-eu' },
      { id: 'db-eu', label: 'EU Global DB Shard', sublabel: 'Active-Active Quorum', role: 'replica', tier: 3, capacityRps: 28000, baseLatencyMs: 22, isReplica: true },
    ],
    edges: [
      { id: 'mr-1', source: 'geodns', target: 'lb-us', label: '55% US', kind: 'primary', weight: 0.55 },
      { id: 'mr-2', source: 'geodns', target: 'lb-eu', label: '45% EU', kind: 'primary', weight: 0.45 },
      { id: 'mr-3', source: 'lb-us', target: 'cache-us', label: 'Read/Write', kind: 'primary' },
      { id: 'mr-4', source: 'lb-eu', target: 'cache-eu', label: 'Read/Write', kind: 'primary' },
      { id: 'mr-5', source: 'cache-us', target: 'db-us', label: 'Cache Miss', kind: 'primary' },
      { id: 'mr-6', source: 'cache-eu', target: 'db-eu', label: 'Cache Miss', kind: 'primary' },
      { id: 'mr-f1', source: 'lb-us', target: 'lb-eu', label: 'Regional Failover', kind: 'failover' },
      { id: 'mr-f2', source: 'db-us', target: 'db-eu', label: 'Raft Leader Transfer', kind: 'failover' },
    ],
  },
  {
    id: 'llm-token-streaming',
    title: 'Frontier LLM Serving (Router -> Prefix KV Cache -> GPU Shards)',
    subtitle: 'SSE token streaming architecture with continuous batching, prompt KV-cache hits, and disaggregated prefill/decode pools.',
    domain: 'system-design',
    defaultRps: 18000,
    defaultCacheHitPct: 68,
    primaryFailNodeId: 'gpu-prefill',
    hotShardNodeId: 'gpu-decode-1',
    patternHighlights: [
      'Prefix KV Cache reuses system prompt attention blocks, slashing Time-to-First-Token (TTFT) by 80%.',
      'Continuous batching schedules decode tokens across GPU tensor-parallel shards without head-of-line stalls.',
      'Click GPU Prefill Pool to test graceful fallback routing to Secondary GPU Cluster.',
    ],
    nodes: [
      { id: 'sse-gw', label: 'Edge SSE / HTTP3 GW', sublabel: 'Token Stream Multiplexer', role: 'edge', tier: 0, capacityRps: 120000, baseLatencyMs: 5 },
      { id: 'llm-router', label: 'KV-Aware Scheduler', sublabel: 'Prefix Affinity Router', role: 'load-balancer', tier: 1, capacityRps: 75000, baseLatencyMs: 4 },
      { id: 'kv-cache', label: 'PagedAttention KV Cache', sublabel: 'HBM3 + NVMe Prefix Store', role: 'cache', tier: 2, capacityRps: 90000, baseLatencyMs: 3 },
      { id: 'gpu-prefill', label: 'Prefill GPU Pool', sublabel: 'Compute-Bound Prompt', role: 'shard', tier: 3, capacityRps: 9000, baseLatencyMs: 48, failoverTargetId: 'gpu-fallback' },
      { id: 'gpu-decode-1', label: 'Decode GPU Shard (Hot)', sublabel: 'Memory-BW Token Gen', role: 'shard', tier: 3, capacityRps: 10000, baseLatencyMs: 26, isHotShard: true, failoverTargetId: 'gpu-fallback' },
      { id: 'gpu-fallback', label: 'Overflow / Quantized Pool', sublabel: 'FP8 Fallback Replicas', role: 'replica', tier: 3, capacityRps: 24000, baseLatencyMs: 32, isReplica: true },
    ],
    edges: [
      { id: 'lm-1', source: 'sse-gw', target: 'llm-router', label: 'Prompt Tokens', kind: 'primary' },
      { id: 'lm-2', source: 'llm-router', target: 'kv-cache', label: 'Prefix Hash Lookup', kind: 'primary' },
      { id: 'lm-3', source: 'kv-cache', target: 'gpu-prefill', label: 'KV Miss', kind: 'primary', weight: 0.45 },
      { id: 'lm-4', source: 'kv-cache', target: 'gpu-decode-1', label: 'Decode Batch', kind: 'primary', weight: 0.55 },
      { id: 'lm-f1', source: 'gpu-prefill', target: 'gpu-fallback', label: 'Overflow Reroute', kind: 'failover' },
      { id: 'lm-f2', source: 'gpu-decode-1', target: 'gpu-fallback', label: 'Speculative Fallback', kind: 'failover' },
    ],
  },
  {
    id: 'devops-k8s-mesh',
    title: 'Kubernetes Ingress -> Cilium/Istio mTLS Mesh -> Multi-AZ Pods',
    subtitle: 'Cloud-native request lifecycle across Cloud ALB, eBPF/mTLS sidecar mesh, HPA pods, and Multi-AZ managed database.',
    domain: 'devops',
    defaultRps: 32000,
    defaultCacheHitPct: 70,
    primaryFailNodeId: 'k8s-az1',
    hotShardNodeId: 'rds-primary',
    patternHighlights: [
      'Cloud Ingress terminates TLS and forwards through SPIFFE mTLS identity enforcement.',
      'Simulate an AZ-1 pod/node eviction to verify Topology Spread Constraints + PDB zero-downtime rerouting to AZ-2.',
      'OpenTelemetry Collector tracks golden-signal p99 latency & SLO burn rate.',
    ],
    nodes: [
      { id: 'cloud-alb', label: 'Cloud Ingress / ALB', sublabel: 'AWS ALB / GKE Gateway', role: 'load-balancer', tier: 0, capacityRps: 140000, baseLatencyMs: 3 },
      { id: 'mesh-mtls', label: 'Cilium eBPF / Istio mTLS', sublabel: 'SPIFFE Zero-Trust L7', role: 'security', tier: 1, capacityRps: 110000, baseLatencyMs: 2 },
      { id: 'k8s-az1', label: 'K8s Pods (AZ-1)', sublabel: 'HPA + Spot/On-Demand', role: 'k8s', tier: 2, capacityRps: 28000, baseLatencyMs: 10, failoverTargetId: 'k8s-az2' },
      { id: 'k8s-az2', label: 'K8s Pods (AZ-2)', sublabel: 'Topology Spread Peer', role: 'k8s', tier: 2, capacityRps: 45000, baseLatencyMs: 10, failoverTargetId: 'k8s-az1' },
      { id: 'elasticache', label: 'Managed Redis Cache', sublabel: 'ElastiCache / Memorystore', role: 'cache', tier: 3, capacityRps: 120000, baseLatencyMs: 1.5 },
      { id: 'rds-primary', label: 'Multi-AZ DB Primary', sublabel: 'RDS / Cloud SQL', role: 'db', tier: 4, capacityRps: 14000, baseLatencyMs: 13, isHotShard: true, failoverTargetId: 'rds-standby' },
      { id: 'rds-standby', label: 'Multi-AZ DB Standby', sublabel: 'Auto DNS Failover <30s', role: 'replica', tier: 4, capacityRps: 22000, baseLatencyMs: 16, isReplica: true },
    ],
    edges: [
      { id: 'dv-1', source: 'cloud-alb', target: 'mesh-mtls', label: 'HTTPS -> mTLS', kind: 'primary' },
      { id: 'dv-2', source: 'mesh-mtls', target: 'k8s-az1', label: '50% AZ-1', kind: 'primary', weight: 0.5 },
      { id: 'dv-3', source: 'mesh-mtls', target: 'k8s-az2', label: '50% AZ-2', kind: 'primary', weight: 0.5 },
      { id: 'dv-4', source: 'k8s-az1', target: 'elasticache', label: 'Lookup', kind: 'primary' },
      { id: 'dv-5', source: 'k8s-az2', target: 'elasticache', label: 'Lookup', kind: 'primary' },
      { id: 'dv-6', source: 'elasticache', target: 'rds-primary', label: 'Miss / Write', kind: 'primary' },
      { id: 'dv-f1', source: 'k8s-az1', target: 'k8s-az2', label: 'AZ Eviction Drain', kind: 'failover' },
      { id: 'dv-f2', source: 'rds-primary', target: 'rds-standby', label: 'Multi-AZ Promotion', kind: 'failover' },
    ],
  },
  {
    id: 'devops-canary-slo',
    title: 'Progressive Canary Rollout + OTel SLO Auto-Rollback',
    subtitle: 'Argo Rollouts traffic split (90% Stable / 10% Canary) with live Prometheus burn-rate gate and instant rollback.',
    domain: 'devops',
    defaultRps: 26000,
    defaultCacheHitPct: 60,
    primaryFailNodeId: 'canary-v2',
    hotShardNodeId: 'canary-v2',
    patternHighlights: [
      'Service Mesh splits 90% traffic to Stable v1 and 10% to Canary v2.',
      'Click Canary v2 to simulate a regression (5xx spike) and observe instant Argo Rollouts failover back to Stable v1.',
      'OTel Collector evaluates p99 latency & error budget burn continuously.',
    ],
    nodes: [
      { id: 'edge-gw', label: 'Ingress Gateway', sublabel: 'Weighted Split Controller', role: 'load-balancer', tier: 0, capacityRps: 120000, baseLatencyMs: 3 },
      { id: 'stable-v1', label: 'Stable Release v1.4', sublabel: '90% Production Traffic', role: 'k8s', tier: 1, capacityRps: 60000, baseLatencyMs: 9 },
      { id: 'canary-v2', label: 'Canary Release v1.5', sublabel: '10% Progressive Slice', role: 'k8s', tier: 1, capacityRps: 9000, baseLatencyMs: 14, isHotShard: true, failoverTargetId: 'stable-v1' },
      { id: 'shared-cache', label: 'Shared Redis Tier', sublabel: 'Session + Feature Flags', role: 'cache', tier: 2, capacityRps: 110000, baseLatencyMs: 2 },
      { id: 'prod-db', label: 'Production Cluster DB', sublabel: 'Expand-Contract Schema', role: 'db', tier: 3, capacityRps: 18000, baseLatencyMs: 14 },
      { id: 'otel-slo', label: 'OTel + SLO Burn Guard', sublabel: 'Auto-Rollback Controller', role: 'observability', tier: 3, capacityRps: 150000, baseLatencyMs: 3 },
    ],
    edges: [
      { id: 'cn-1', source: 'edge-gw', target: 'stable-v1', label: '90% weight', kind: 'primary', weight: 0.85 },
      { id: 'cn-2', source: 'edge-gw', target: 'canary-v2', label: '10% weight', kind: 'primary', weight: 0.15 },
      { id: 'cn-3', source: 'stable-v1', target: 'shared-cache', label: 'Queries', kind: 'primary' },
      { id: 'cn-4', source: 'canary-v2', target: 'shared-cache', label: 'Queries', kind: 'primary' },
      { id: 'cn-5', source: 'shared-cache', target: 'prod-db', label: 'DB Miss', kind: 'primary', weight: 0.85 },
      { id: 'cn-6', source: 'shared-cache', target: 'otel-slo', label: 'Telemetry', kind: 'async', weight: 0.15 },
      { id: 'cn-f1', source: 'canary-v2', target: 'stable-v1', label: 'SLO Auto-Rollback', kind: 'failover' },
    ],
  },
  {
    id: 'db-pgbouncer-shards',
    title: 'PgBouncer Transaction Pooler -> Sharded Primary & Read Replicas',
    subtitle: 'Database traffic lifecycle: connection multiplexing, L2 query cache, Citus/Vitess shards, hot-key skew, and replica promotion.',
    domain: 'database',
    defaultRps: 34000,
    defaultCacheHitPct: 74,
    primaryFailNodeId: 'pg-shard-0',
    hotShardNodeId: 'pg-shard-1',
    patternHighlights: [
      'PgBouncer multiplexes 10,000 app sockets into 120 backend Postgres processes without RAM exhaustion.',
      'Toggle Hot-Shard Skew to see a celebrity tenant saturate Shard 1 while Shard 0 sits idle.',
      'Click Primary Shard 0 to simulate Patroni leader failover to Synchronous Standby.',
    ],
    nodes: [
      { id: 'app-tier', label: 'Microservice Clients', sublabel: '10k App Connections', role: 'service', tier: 0, capacityRps: 140000, baseLatencyMs: 3 },
      { id: 'pgbouncer', label: 'PgBouncer Pooler', sublabel: 'Transaction Mode · 120 Procs', role: 'load-balancer', tier: 1, capacityRps: 90000, baseLatencyMs: 2 },
      { id: 'query-cache', label: 'Redis + Buffer Pool', sublabel: 'Shared Buffers / L2 Hit', role: 'cache', tier: 2, capacityRps: 130000, baseLatencyMs: 1.5 },
      { id: 'pg-shard-0', label: 'PG Shard 0 (Primary)', sublabel: 'B-Tree + WAL Sync', role: 'shard', tier: 3, capacityRps: 11000, baseLatencyMs: 12, failoverTargetId: 'pg-standby' },
      { id: 'pg-shard-1', label: 'PG Shard 1 (Hot Tenant)', sublabel: 'High MVCC Churn', role: 'shard', tier: 3, capacityRps: 11000, baseLatencyMs: 15, isHotShard: true, failoverTargetId: 'pg-standby' },
      { id: 'pg-standby', label: 'Patroni Sync Standby', sublabel: 'Read Replica + Raft Failover', role: 'replica', tier: 3, capacityRps: 24000, baseLatencyMs: 16, isReplica: true },
    ],
    edges: [
      { id: 'db-1', source: 'app-tier', target: 'pgbouncer', label: 'SQL Pool', kind: 'primary' },
      { id: 'db-2', source: 'pgbouncer', target: 'query-cache', label: 'Read / Write', kind: 'primary' },
      { id: 'db-3', source: 'query-cache', target: 'pg-shard-0', label: 'Shard 0', kind: 'primary', weight: 0.42 },
      { id: 'db-4', source: 'query-cache', target: 'pg-shard-1', label: 'Shard 1', kind: 'primary', weight: 0.42 },
      { id: 'db-5', source: 'query-cache', target: 'pg-standby', label: 'Read-Only', kind: 'replication', weight: 0.16 },
      { id: 'db-f1', source: 'pg-shard-0', target: 'pg-standby', label: 'Patroni Failover', kind: 'failover' },
      { id: 'db-f2', source: 'pg-shard-1', target: 'pg-standby', label: 'Patroni Failover', kind: 'failover' },
    ],
  },
  {
    id: 'db-cdc-wal-lakehouse',
    title: 'OLTP WAL -> Debezium CDC -> Kafka -> Iceberg Lakehouse & Vector',
    subtitle: 'Zero-dual-write streaming data pipeline capturing Postgres WAL into analytical Parquet snapshots and HNSW vector indexes.',
    domain: 'database',
    defaultRps: 24000,
    defaultCacheHitPct: 45,
    primaryFailNodeId: 'debezium',
    hotShardNodeId: 'iceberg',
    patternHighlights: [
      'Transactional Outbox writes atomically to OLTP WAL; Debezium streams commits without polling locks.',
      'Kafka buffers spikes so Iceberg Lakehouse compaction and Vector HNSW indexing never throttle OLTP.',
      'Fail Debezium Primary to test standby connector checkpoint takeover from LSN offset.',
    ],
    nodes: [
      { id: 'oltp-api', label: 'Write API Service', sublabel: 'ACID Outbox Tx', role: 'service', tier: 0, capacityRps: 90000, baseLatencyMs: 5 },
      { id: 'pg-wal', label: 'PostgreSQL Primary + WAL', sublabel: 'Logical Replication Slot', role: 'db', tier: 1, capacityRps: 42000, baseLatencyMs: 10 },
      { id: 'debezium', label: 'Debezium CDC Primary', sublabel: 'WAL LSN Streamer', role: 'queue', tier: 2, capacityRps: 30000, baseLatencyMs: 6, failoverTargetId: 'debezium-ha' },
      { id: 'debezium-ha', label: 'Debezium HA Standby', sublabel: 'Checkpoint Failover', role: 'replica', tier: 2, capacityRps: 38000, baseLatencyMs: 8, isReplica: true },
      { id: 'kafka-cdc', label: 'Kafka Change Topics', sublabel: 'Compacted Avro Log', role: 'queue', tier: 3, capacityRps: 140000, baseLatencyMs: 4 },
      { id: 'iceberg', label: 'Apache Iceberg Sink', sublabel: 'Z-Order Parquet Snapshots', role: 'shard', tier: 4, capacityRps: 18000, baseLatencyMs: 22, isHotShard: true },
      { id: 'vector-idx', label: 'HNSW Vector Index', sublabel: 'Semantic Embeddings', role: 'shard', tier: 4, capacityRps: 22000, baseLatencyMs: 14 },
    ],
    edges: [
      { id: 'cd-1', source: 'oltp-api', target: 'pg-wal', label: 'COMMIT WAL', kind: 'primary' },
      { id: 'cd-2', source: 'pg-wal', target: 'debezium', label: 'pgoutput LSN', kind: 'async' },
      { id: 'cd-3', source: 'debezium', target: 'kafka-cdc', label: 'CDC Event', kind: 'async' },
      { id: 'cd-4', source: 'debezium-ha', target: 'kafka-cdc', label: 'Failover CDC', kind: 'async' },
      { id: 'cd-5', source: 'kafka-cdc', target: 'iceberg', label: 'Micro-Batch', kind: 'async', weight: 0.55 },
      { id: 'cd-6', source: 'kafka-cdc', target: 'vector-idx', label: 'Upsert Vector', kind: 'async', weight: 0.45 },
      { id: 'cd-f1', source: 'debezium', target: 'debezium-ha', label: 'LSN Checkpoint Failover', kind: 'failover' },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Role Inference Helpers                                                     */
/* -------------------------------------------------------------------------- */

function inferRoleFromText(text: string): TrafficNodeRole {
  const lower = text.toLowerCase();
  if (/(client|browser|mobile|user|device|app\b|sender|caller)/.test(lower)) return 'client';
  if (/(cdn|dns|geodns|edge|waf|cloudflare|cloudfront|anycast)/.test(lower)) return 'edge';
  if (/(load\s*balanc|alb|nlb|nginx|envoy|ingress|router|gateway|proxy|pgbouncer|pooler)/.test(lower)) {
    return 'load-balancer';
  }
  if (/(redis|cache|memcached|kv\s*cache|buffer\s*pool|cdn|bloom)/.test(lower)) return 'cache';
  if (/(kafka|queue|sqs|pubsub|rabbit|nats|stream|debezium|cdc|broker|event\s*bus|outbox)/.test(lower)) {
    return 'queue';
  }
  if (/(replica|standby|secondary|dr\b|backup|fallback|follower)/.test(lower)) return 'replica';
  if (/(shard|partition|citus|vitess|gpu|hnsw|iceberg|delta|lakehouse|clickhouse|parquet)/.test(lower)) {
    return 'shard';
  }
  if (/(db|database|postgres|mysql|mongo|dynamo|spanner|cassandra|sql|wal|ledger|storage|s3|gcs|registry|vault)/.test(lower)) {
    return 'db';
  }
  if (/(opa|mtls|auth|security|scan|trivy|cosign|falco|sbom|cilium|istio|kms|secret)/.test(lower)) {
    return 'security';
  }
  if (/(otel|prometheus|grafana|slo|monitor|trace|metric|log|observ|alert)/.test(lower)) {
    return 'observability';
  }
  if (/(k8s|kube|pod|argo|helm|terraform|runner|docker|container|canary|node)/.test(lower)) {
    return 'k8s';
  }
  return 'service';
}

function defaultSpecForRole(role: TrafficNodeRole): { capacityRps: number; baseLatencyMs: number } {
  switch (role) {
    case 'client':
      return { capacityRps: 250000, baseLatencyMs: 5 };
    case 'edge':
      return { capacityRps: 180000, baseLatencyMs: 4 };
    case 'load-balancer':
      return { capacityRps: 110000, baseLatencyMs: 3 };
    case 'cache':
      return { capacityRps: 130000, baseLatencyMs: 1.5 };
    case 'queue':
      return { capacityRps: 120000, baseLatencyMs: 5 };
    case 'security':
      return { capacityRps: 95000, baseLatencyMs: 3 };
    case 'observability':
      return { capacityRps: 140000, baseLatencyMs: 3 };
    case 'k8s':
    case 'service':
      return { capacityRps: 42000, baseLatencyMs: 10 };
    case 'shard':
      return { capacityRps: 14000, baseLatencyMs: 15 };
    case 'replica':
      return { capacityRps: 24000, baseLatencyMs: 16 };
    case 'db':
    default:
      return { capacityRps: 16000, baseLatencyMs: 14 };
  }
}

/* -------------------------------------------------------------------------- */
/* Universal Mermaid Flowchart -> Live TrafficTopology Parser                 */
/* -------------------------------------------------------------------------- */

function stripMermaidBrackets(rawLabel: string): string {
  return rawLabel
    .replace(/^[\[\(\{\<\>"]+/, '')
    .replace(/[\]\)\}\>\"]+$/, '')
    .replace(/\\n/g, ' · ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseMermaidToTrafficTopology(
  mermaidCode: string,
  title: string,
  domain: TrafficDomain = 'mermaid',
  subtitle?: string
): TrafficTopology | null {
  if (!mermaidCode || !mermaidCode.trim()) return null;

  const nodeLabels = new Map<string, string>();
  const rawEdges: { source: string; target: string; label?: string; dashed: boolean }[] = [];

  const lines = mermaidCode
    .split('\n')
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith('%%') &&
        !l.startsWith('flowchart') &&
        !l.startsWith('graph ') &&
        !l.startsWith('subgraph') &&
        l !== 'end' &&
        !l.startsWith('style ') &&
        !l.startsWith('classDef ') &&
        !l.startsWith('class ') &&
        !l.startsWith('linkStyle ') &&
        !l.startsWith('direction ')
    );

  const registerNodeToken = (token: string): string | null => {
    const trimmed = token.trim();
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*(.*)$/);
    if (!match) return null;
    const id = match[1];
    const rest = match[2]?.trim() ?? '';
    if (rest.length > 0) {
      const cleaned = stripMermaidBrackets(rest);
      if (cleaned.length > 0) {
        nodeLabels.set(id, cleaned);
      }
    } else if (!nodeLabels.has(id)) {
      nodeLabels.set(id, id.replace(/_/g, ' '));
    }
    return id;
  };

  for (const line of lines) {
    // Support standard Mermaid directed arrows: -->, -.->, ==>, -->|label|, -.->|label|, -- label -->
    const arrowRegex =
      /^(.+?)\s*(?:(-->|-\.->|==>)\s*(?:\|([^|]+)\|)?|--\s*"?([^"-]+?)"?\s*(-->)|-\.\s*"?([^".]+?)"?\s*(-\.->))\s*(.+)$/;
    const edgeMatch = line.match(arrowRegex);

    if (edgeMatch) {
      const leftPart = edgeMatch[1];
      const arrowToken = edgeMatch[2] || edgeMatch[5] || edgeMatch[7] || '-->';
      const edgeLabel = (edgeMatch[3] || edgeMatch[4] || edgeMatch[6] || '').replace(/"/g, '').trim();
      const rightPart = edgeMatch[8];

      // Handle chained or & separated endpoints
      const leftIds = leftPart.split('&').map(registerNodeToken).filter((x): x is string => Boolean(x));
      const rightIds = rightPart.split('&').map(registerNodeToken).filter((x): x is string => Boolean(x));

      for (const s of leftIds) {
        for (const t of rightIds) {
          if (s !== t) {
            rawEdges.push({
              source: s,
              target: t,
              label: edgeLabel || undefined,
              dashed: arrowToken.includes('.'),
            });
          }
        }
      }
    } else {
      // Standalone node declaration line e.g. LB["L7 Load Balancer"]
      registerNodeToken(line);
    }
  }

  if (nodeLabels.size < 2 || rawEdges.length === 0) return null;

  // Limit extremely dense graphs to the first 12 most-connected nodes for clean animation legibility
  const degree = new Map<string, number>();
  for (const e of rawEdges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  const allIds = Array.from(nodeLabels.keys()).filter((id) => (degree.get(id) ?? 0) > 0);
  const keptIds = new Set(allIds.slice(0, 11));

  // Topological BFS tier assignment
  const inDeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of keptIds) {
    inDeg.set(id, 0);
    adj.set(id, []);
  }
  const filteredEdges = rawEdges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));
  for (const e of filteredEdges) {
    adj.get(e.source)?.push(e.target);
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  const tierMap = new Map<string, number>();
  const queue: string[] = [];
  for (const id of keptIds) {
    if ((inDeg.get(id) ?? 0) === 0) {
      queue.push(id);
      tierMap.set(id, 0);
    }
  }
  if (queue.length === 0 && allIds[0]) {
    queue.push(allIds[0]);
    tierMap.set(allIds[0], 0);
  }

  const visited = new Set<string>(queue);
  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const currTier = tierMap.get(curr) ?? 0;
    for (const next of adj.get(curr) ?? []) {
      const candidateTier = Math.min(currTier + 1, 5);
      if (!visited.has(next)) {
        visited.add(next);
        tierMap.set(next, candidateTier);
        queue.push(next);
      }
    }
  }
  for (const id of keptIds) {
    if (!tierMap.has(id)) tierMap.set(id, 1);
  }

  const nodes: TrafficNode[] = Array.from(keptIds).map((id) => {
    const fullLabel = nodeLabels.get(id) ?? id;
    const parts = fullLabel.split(/\s*[·:\-–]\s*/);
    const shortLabel = parts[0].length > 26 ? `${parts[0].slice(0, 24)}…` : parts[0];
    const sublabel = parts[1]
      ? parts[1].slice(0, 28)
      : fullLabel.length > 26
        ? fullLabel.slice(0, 28)
        : id;
    const role = inferRoleFromText(`${id} ${fullLabel}`);
    const spec = defaultSpecForRole(role);

    return {
      id,
      label: shortLabel,
      sublabel,
      role,
      tier: tierMap.get(id) ?? 0,
      capacityRps: spec.capacityRps,
      baseLatencyMs: spec.baseLatencyMs,
      isReplica: role === 'replica',
    };
  });

  // Auto-wire failover pairs among same-role or DB -> Replica peers so fault injection always demonstrates failover!
  const replicaNode = nodes.find((n) => n.role === 'replica');
  const dbNodes = nodes.filter((n) => n.role === 'db' || n.role === 'shard');
  const serviceNodes = nodes.filter((n) => n.role === 'service' || n.role === 'k8s');

  const edges: TrafficEdge[] = filteredEdges.map((e, idx) => ({
    id: `me-${idx}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    label: e.label ? (e.label.length > 22 ? `${e.label.slice(0, 20)}…` : e.label) : undefined,
    kind: e.dashed ? 'async' : 'primary',
  }));

  let primaryFailNodeId: string | undefined;
  let hotShardNodeId: string | undefined;

  if (dbNodes.length >= 1) {
    hotShardNodeId = dbNodes[dbNodes.length - 1].id;
    dbNodes[dbNodes.length - 1].isHotShard = true;
    primaryFailNodeId = dbNodes[0].id;
    if (replicaNode && replicaNode.id !== dbNodes[0].id) {
      dbNodes[0].failoverTargetId = replicaNode.id;
      edges.push({
        id: `me-failover-${dbNodes[0].id}-${replicaNode.id}`,
        source: dbNodes[0].id,
        target: replicaNode.id,
        label: 'Auto Failover',
        kind: 'failover',
      });
    } else if (dbNodes.length >= 2) {
      dbNodes[0].failoverTargetId = dbNodes[1].id;
      edges.push({
        id: `me-failover-${dbNodes[0].id}-${dbNodes[1].id}`,
        source: dbNodes[0].id,
        target: dbNodes[1].id,
        label: 'Peer Failover',
        kind: 'failover',
      });
    } else {
      // Synthesize a warm standby failover node for single-DB Mermaid diagrams
      const standbyId = `${dbNodes[0].id}_STANDBY`;
      nodes.push({
        id: standbyId,
        label: `${dbNodes[0].label.slice(0, 15)} Standby`,
        sublabel: 'Auto-Promoted Replica',
        role: 'replica',
        tier: dbNodes[0].tier,
        capacityRps: Math.round(dbNodes[0].capacityRps * 1.4),
        baseLatencyMs: dbNodes[0].baseLatencyMs + 4,
        isReplica: true,
      });
      dbNodes[0].failoverTargetId = standbyId;
      edges.push({
        id: `me-failover-${dbNodes[0].id}-${standbyId}`,
        source: dbNodes[0].id,
        target: standbyId,
        label: 'WAL Failover',
        kind: 'failover',
      });
    }
  }

  if (serviceNodes.length >= 2) {
    serviceNodes[0].failoverTargetId = serviceNodes[1].id;
    if (!primaryFailNodeId) primaryFailNodeId = serviceNodes[0].id;
  }
  if (!primaryFailNodeId && nodes.length > 2) {
    primaryFailNodeId = nodes[Math.floor(nodes.length / 2)].id;
  }

  return {
    id: `mermaid-parsed-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32)}`,
    title,
    subtitle:
      subtitle ??
      `Live animated packet simulator dynamically parsed from this Mermaid flow (${nodes.length} nodes · ${filteredEdges.length} paths). Click any node to inject a failure.`,
    domain,
    nodes,
    edges,
    defaultRps: 24000,
    defaultCacheHitPct: nodes.some((n) => n.role === 'cache') ? 72 : 40,
    primaryFailNodeId,
    hotShardNodeId,
    patternHighlights: [
      `Dynamically parsed ${nodes.length} architectural components and ${filteredEdges.length} directed pathways from the active Mermaid diagram.`,
      'Adjust RPS load and Cache Hit % to reveal saturation bottlenecks and queueing latency spikes.',
      'Click any component node directly to inject a fault and observe live failover rerouting.',
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* ReactFlow Playground -> Live TrafficTopology Adapter                       */
/* -------------------------------------------------------------------------- */

function mapPlaygroundComponentRole(componentType: string): TrafficNodeRole {
  if (componentType === 'client') return 'client';
  if (componentType === 'cdn' || componentType === 'dns') return 'edge';
  if (
    componentType === 'load_balancer' ||
    componentType === 'api_gateway' ||
    componentType === 'reverse_proxy' ||
    componentType === 'dynamic_router' ||
    componentType === 'network_switch'
  ) {
    return 'load-balancer';
  }
  if (componentType === 'auth_provider' || componentType === 'rate_limiter') return 'security';
  if (componentType === 'redis') return 'cache';
  if (componentType === 'kafka' || componentType === 'pubsub') return 'queue';
  if (componentType === 'logging' || componentType === 'tracing' || componentType === 'monitoring') {
    return 'observability';
  }
  if (componentType === 'vector_db' || componentType === 'ml_inference' || componentType === 'cassandra') {
    return 'shard';
  }
  if (
    componentType === 'postgres' ||
    componentType === 'oracle' ||
    componentType === 'mongodb' ||
    componentType === 'elasticsearch' ||
    componentType === 's3_storage' ||
    componentType === 'feature_store'
  ) {
    return 'db';
  }
  return 'service';
}

export function buildTrafficTopologyFromPlayground(
  pgNodes: SystemNode[],
  pgEdges: SystemEdge[],
  title: string,
  baseEntryRps: number
): TrafficTopology | null {
  if (pgNodes.length < 2) return null;

  const sortedByX = [...pgNodes].sort((a, b) => a.position.x - b.position.x).slice(0, 11);
  const keptSet = new Set(sortedByX.map((n) => n.id));
  const minX = sortedByX[0]?.position.x ?? 0;
  const maxX = sortedByX[sortedByX.length - 1]?.position.x ?? 1000;
  const spanX = Math.max(1, maxX - minX);

  const nodes: TrafficNode[] = sortedByX.map((n) => {
    const role = mapPlaygroundComponentRole(n.data.componentType);
    const tier = Math.min(4, Math.max(0, Math.round(((n.position.x - minX) / spanX) * 4)));
    const replicas = Math.max(1, n.data.config?.replicas ?? 1);
    const maxRpsPerReplica = n.data.config?.maxRpsPerReplica ?? 12000;
    const baseLatencyMs = Math.max(1.5, n.data.config?.baseLatencyMs ?? 8);
    return {
      id: n.id,
      label: n.data.label,
      sublabel: `${replicas}x · ${n.data.componentType.replace(/_/g, ' ')}`,
      role,
      tier,
      capacityRps: Math.max(3000, maxRpsPerReplica * replicas),
      baseLatencyMs,
      isReplica: n.data.config?.replicationMode === 'PRIMARY_REPLICA' && role === 'replica',
      defaultFailed: n.data.status === 'OFFLINE',
    };
  });

  const edges: TrafficEdge[] = pgEdges
    .filter((e) => keptSet.has(e.source) && keptSet.has(e.target))
    .map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: typeof e.label === 'string' ? e.label : undefined,
      kind: 'primary',
    }));

  // Auto-link failover targets for DBs and Services
  const replica = nodes.find((n) => n.role === 'replica');
  const dbs = nodes.filter((n) => n.role === 'db' || n.role === 'shard');
  let primaryFailNodeId = dbs[0]?.id ?? nodes[Math.floor(nodes.length / 2)]?.id;
  const hotShardNodeId = dbs[dbs.length - 1]?.id;
  if (dbs[dbs.length - 1]) dbs[dbs.length - 1].isHotShard = true;

  if (dbs[0] && replica && replica.id !== dbs[0].id) {
    dbs[0].failoverTargetId = replica.id;
    edges.push({
      id: `pg-fail-${dbs[0].id}-${replica.id}`,
      source: dbs[0].id,
      target: replica.id,
      label: 'Replica Failover',
      kind: 'failover',
    });
  } else if (dbs.length >= 2) {
    dbs[0].failoverTargetId = dbs[1].id;
    edges.push({
      id: `pg-fail-${dbs[0].id}-${dbs[1].id}`,
      source: dbs[0].id,
      target: dbs[1].id,
      label: 'Peer Failover',
      kind: 'failover',
    });
  }

  return {
    id: `playground-live-${pgNodes.length}-${pgEdges.length}`,
    title: `${title} — Live Packet Flow`,
    subtitle: `Synchronized with your live Playground canvas (${nodes.length} nodes · ${edges.length} edges). Inject node faults or spike traffic to inspect queueing bottlenecks.`,
    domain: 'playground',
    nodes,
    edges,
    defaultRps: Math.max(5000, Math.min(120000, baseEntryRps || 25000)),
    defaultCacheHitPct: nodes.some((n) => n.role === 'cache') ? 75 : 35,
    primaryFailNodeId,
    hotShardNodeId,
    patternHighlights: [
      'Mirroring your live Playground canvas nodes, replica capacities, and connections in real time.',
      'Click any node to simulate an instant outage and inspect failover path activation.',
      'Compare cache-hit short-circuiting against cache-stampede DB saturation.',
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Deterministic Real-Time Traffic, Bottleneck & Failover Engine              */
/* -------------------------------------------------------------------------- */

export function computeTrafficSimulation(
  topology: TrafficTopology,
  config: TrafficSimConfig
): TrafficSimulationSnapshot {
  const failedSet = new Set(config.failedNodeIds);
  const nodeMap = new Map(topology.nodes.map((n) => [n.id, n]));

  const primaryEdges = topology.edges.filter((e) => e.kind !== 'failover');
  const outEdgesBySource = new Map<string, TrafficEdge[]>();
  const inDegree = new Map<string, number>();

  for (const n of topology.nodes) {
    outEdgesBySource.set(n.id, []);
    inDegree.set(n.id, 0);
  }
  for (const e of primaryEdges) {
    outEdgesBySource.get(e.source)?.push(e);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  // Find entry roots (nodes with no incoming primary edges)
  let roots = topology.nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0 && !n.isReplica);
  if (roots.length === 0 && topology.nodes[0]) {
    roots = [topology.nodes[0]];
  }

  // Sort nodes by tier ascending for deterministic DAG propagation
  const sortedNodes = [...topology.nodes].sort((a, b) => a.tier - b.tier);

  const incomingRps = new Map<string, number>();
  const droppedRps = new Map<string, number>();
  const receivingFailover = new Set<string>();
  const edgeRps = new Map<string, number>();
  const activeFailoverPairs: { failedId: string; targetId: string }[] = [];

  for (const root of roots) {
    incomingRps.set(root.id, (incomingRps.get(root.id) ?? 0) + config.entryRps / roots.length);
  }

  let cacheOffloadRps = 0;

  for (const node of sortedNodes) {
    const inVal = incomingRps.get(node.id) ?? 0;
    if (inVal <= 0) continue;

    // If this node is failed, attempt failover reroute
    if (failedSet.has(node.id)) {
      const targetId = node.failoverTargetId;
      if (targetId && nodeMap.has(targetId) && !failedSet.has(targetId)) {
        receivingFailover.add(targetId);
        incomingRps.set(targetId, (incomingRps.get(targetId) ?? 0) + inVal);
        activeFailoverPairs.push({ failedId: node.id, targetId });
        const failoverEdge = topology.edges.find(
          (e) => e.kind === 'failover' && e.source === node.id && e.target === targetId
        );
        if (failoverEdge) {
          edgeRps.set(failoverEdge.id, (edgeRps.get(failoverEdge.id) ?? 0) + inVal);
        }
      } else {
        droppedRps.set(node.id, (droppedRps.get(node.id) ?? 0) + inVal);
      }
      continue;
    }

    // Effective outgoing traffic after capacity cap and cache hit offload
    const overCapDrop = Math.max(0, inVal - node.capacityRps * 1.18);
    if (overCapDrop > 0) {
      droppedRps.set(node.id, (droppedRps.get(node.id) ?? 0) + overCapDrop);
    }
    const processed = Math.max(0, inVal - overCapDrop);

    let forwardRps = processed;
    if (node.role === 'cache' || node.role === 'edge') {
      const hitFactor =
        node.role === 'cache'
          ? Math.max(0, Math.min(0.95, config.cacheHitPct / 100))
          : Math.max(0, Math.min(0.35, (config.cacheHitPct / 100) * 0.35));
      const offloaded = processed * hitFactor;
      cacheOffloadRps += offloaded;
      forwardRps = Math.max(0, processed - offloaded);
    }

    const outs = outEdgesBySource.get(node.id) ?? [];
    if (outs.length === 0 || forwardRps <= 0) continue;

    // Calculate weights (respecting hot-shard skew + healthy failover targets)
    const weights = outs.map((e) => {
      const targetNode = nodeMap.get(e.target);
      let w = e.weight ?? 1 / outs.length;
      if (config.hotShardSkew && targetNode?.isHotShard) {
        w *= 3.4;
      } else if (config.hotShardSkew && targetNode?.role === 'shard' && !targetNode.isHotShard) {
        w *= 0.35;
      }
      return Math.max(0.05, w);
    });
    const sumW = weights.reduce((acc, v) => acc + v, 0) || 1;

    outs.forEach((e, idx) => {
      const share = (forwardRps * weights[idx]) / sumW;
      edgeRps.set(e.id, (edgeRps.get(e.id) ?? 0) + share);
      incomingRps.set(e.target, (incomingRps.get(e.target) ?? 0) + share);
    });
  }

  // Second pass: if a target node that received traffic is ALSO failed and wasn't processed yet (same tier), handle failover
  for (const node of sortedNodes) {
    if (!failedSet.has(node.id)) continue;
    const inVal = incomingRps.get(node.id) ?? 0;
    if (inVal <= 0) continue;
    const alreadyHandled =
      activeFailoverPairs.some((p) => p.failedId === node.id) || (droppedRps.get(node.id) ?? 0) > 0;
    if (alreadyHandled) continue;
    const targetId = node.failoverTargetId;
    if (targetId && nodeMap.has(targetId) && !failedSet.has(targetId)) {
      receivingFailover.add(targetId);
      incomingRps.set(targetId, (incomingRps.get(targetId) ?? 0) + inVal);
      activeFailoverPairs.push({ failedId: node.id, targetId });
      const failoverEdge = topology.edges.find(
        (e) => e.kind === 'failover' && e.source === node.id && e.target === targetId
      );
      if (failoverEdge) {
        edgeRps.set(failoverEdge.id, (edgeRps.get(failoverEdge.id) ?? 0) + inVal);
      }
    } else {
      droppedRps.set(node.id, (droppedRps.get(node.id) ?? 0) + inVal);
    }
  }

  const nodeStats: Record<string, NodeLiveStats> = {};
  const bottleneckNodeIds: string[] = [];
  let totalDropped = 0;

  for (const node of topology.nodes) {
    const inVal = Math.round(incomingRps.get(node.id) ?? 0);
    const dropVal = Math.round(droppedRps.get(node.id) ?? 0);
    totalDropped += dropVal;
    const isFailed = failedSet.has(node.id);
    const isFailoverRx = receivingFailover.has(node.id);

    const util = isFailed ? 0 : Math.round((inVal / Math.max(1, node.capacityRps)) * 100);
    // M/M/1 queueing latency curve spikes sharply above 80% utilization
    let latencyMs = node.baseLatencyMs;
    if (isFailed) {
      latencyMs = 0;
    } else if (util > 100) {
      latencyMs = Math.round(node.baseLatencyMs * (3.5 + (util - 100) * 0.09));
    } else if (util > 80) {
      latencyMs = Math.round(node.baseLatencyMs * (1 + Math.pow((util - 75) / 18, 2)));
    } else if (isFailoverRx) {
      latencyMs = Math.round(node.baseLatencyMs * 1.35);
    } else {
      latencyMs = Math.round(node.baseLatencyMs * (1 + util * 0.002));
    }

    let status: NodeHealthStatus = 'nominal';
    if (isFailed) status = 'failed';
    else if (util >= 90) status = 'bottleneck';
    else if (isFailoverRx) status = 'failover-active';
    else if (util >= 72) status = 'elevated';

    if (status === 'bottleneck') bottleneckNodeIds.push(node.id);

    nodeStats[node.id] = {
      id: node.id,
      incomingRps: inVal,
      processedRps: isFailed ? 0 : Math.max(0, inVal - dropVal),
      droppedRps: dropVal,
      utilizationPct: util,
      latencyMs,
      status,
      receivingFailover: isFailoverRx,
    };
  }

  const edgeStats: Record<string, EdgeLiveStats> = {};
  for (const e of topology.edges) {
    const rps = Math.round(edgeRps.get(e.id) ?? 0);
    const srcStat = nodeStats[e.source];
    const dstStat = nodeStats[e.target];
    const isFailoverActive = e.kind === 'failover' && rps > 0;
    const isBottlenecked = Boolean(
      dstStat && (dstStat.status === 'bottleneck' || dstStat.utilizationPct >= 90) && rps > 0
    );
    const isDropped = Boolean(
      e.kind !== 'failover' && ((srcStat?.status === 'failed' && !isFailoverActive) || (dstStat?.status === 'failed' && !dstStat.receivingFailover && !activeFailoverPairs.some((p) => p.failedId === e.target)))
    );

    edgeStats[e.id] = {
      id: e.id,
      source: e.source,
      target: e.target,
      rps,
      kind: e.kind ?? 'primary',
      isBottlenecked,
      isFailoverActive,
      isDropped,
    };
  }

  // Compute critical-path p99 latency across tiers
  const maxLatencyByTier = new Map<number, number>();
  for (const n of topology.nodes) {
    const st = nodeStats[n.id];
    if (!st || st.incomingRps === 0 || st.status === 'failed') continue;
    const prev = maxLatencyByTier.get(n.tier) ?? 0;
    if (st.latencyMs > prev) maxLatencyByTier.set(n.tier, st.latencyMs);
  }
  const criticalPathLatency = Array.from(maxLatencyByTier.values()).reduce((a, b) => a + b, 0);
  const p99LatencyMs = Math.max(
    4,
    Math.round(criticalPathLatency * (1 - Math.min(0.45, (cacheOffloadRps / Math.max(1, config.entryRps)) * 0.45)))
  );

  const errorRatePct = Number(
    Math.min(100, (totalDropped / Math.max(1, config.entryRps)) * 100).toFixed(1)
  );

  // Build crisp diagnostic cards
  const diagnostics: TrafficDiagnostic[] = [];

  for (const pair of activeFailoverPairs) {
    const failedNode = nodeMap.get(pair.failedId);
    const targetNode = nodeMap.get(pair.targetId);
    const targetStat = nodeStats[pair.targetId];
    diagnostics.push({
      severity: targetStat?.status === 'bottleneck' ? 'critical' : 'warn',
      title: `Failover Active: ${failedNode?.label ?? pair.failedId} -> ${targetNode?.label ?? pair.targetId}`,
      detail: `Traffic automatically rerouted around ${failedNode?.label ?? pair.failedId}. ${targetNode?.label ?? pair.targetId} is now at ${targetStat?.utilizationPct ?? 0}% capacity (${targetStat?.latencyMs ?? 0}ms).`,
      mitigation:
        targetStat?.status === 'bottleneck'
          ? 'Standby is saturating under failover load. Provision N+2 headroom or enable load-shedding.'
          : 'Failover target absorbed traffic cleanly with zero dropped requests.',
    });
  }

  for (const bid of bottleneckNodeIds) {
    const node = nodeMap.get(bid);
    const st = nodeStats[bid];
    if (!node || !st) continue;
    diagnostics.push({
      severity: st.utilizationPct >= 110 ? 'critical' : 'warn',
      title: `Latency Bottleneck at ${node.label} (${st.utilizationPct}% Util · ${st.latencyMs}ms)`,
      detail: `Receiving ${st.incomingRps.toLocaleString()} RPS vs ${node.capacityRps.toLocaleString()} RPS capacity${st.droppedRps > 0 ? ` — shedding ${st.droppedRps.toLocaleString()} RPS` : ''}.`,
      mitigation:
        node.role === 'shard' || node.role === 'db'
          ? config.hotShardSkew
            ? 'Hot-key partition skew detected. Apply key salting (key#0..N), local L1 caching, or live shard split.'
            : 'Raise Redis cache-hit ratio, add read replicas, or shard horizontally.'
          : 'Autoscale stateless replicas (HPA/KEDA) and enforce backpressure at the edge gateway.',
    });
  }

  if (errorRatePct > 0 && bottleneckNodeIds.length === 0 && activeFailoverPairs.length === 0) {
    diagnostics.push({
      severity: 'critical',
      title: `Unprotected Single Point of Failure (${errorRatePct}% Error Rate)`,
      detail: `${totalDropped.toLocaleString()} RPS dropped because a failed node has no healthy failover peer.`,
      mitigation: 'Add a warm standby replica or multi-AZ active-active peer with automated health checks.',
    });
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      severity: 'ok',
      title: 'All Tiers Operating Within SLO Budget',
      detail: `Handling ${config.entryRps.toLocaleString()} RPS at p99 ${p99LatencyMs}ms with ${Math.round(cacheOffloadRps).toLocaleString()} RPS offloaded by edge/cache.`,
      mitigation: 'Click any node on the canvas to inject a fault, or trigger a 10x surge / hot-shard skew.',
    });
  }

  return {
    nodeStats,
    edgeStats,
    totalEntryRps: config.entryRps,
    effectiveSuccessRps: Math.max(0, config.entryRps - totalDropped),
    cacheOffloadRps: Math.round(cacheOffloadRps),
    droppedRps: totalDropped,
    p99LatencyMs,
    errorRatePct,
    bottleneckNodeIds,
    activeFailoverPairs,
    diagnostics,
  };
}
