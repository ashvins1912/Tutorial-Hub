import type {
  ArchitectureGrade,
  AuditCategoryScores,
  AuditFinding,
  AuditReport,
  ComponentType,
  SystemEdge,
  SystemNode,
} from '../types/system';

const SPOF_CANDIDATE_TYPES = new Set<ComponentType>([
  'postgres',
  'oracle',
  'mongodb',
  'load_balancer',
  'app_server',
]);

const PRIMARY_DB_TYPES = new Set<ComponentType>(['postgres', 'oracle', 'mongodb']);
const RDBMS_TYPES = new Set<ComponentType>(['postgres', 'oracle']);
const HEAVY_WORKLOAD_TYPES = new Set<ComponentType>(['ml_inference', 'worker']);
const QUEUE_TYPES = new Set<ComponentType>(['kafka', 'pubsub']);
const INGRESS_GUARD_TYPES = new Set<ComponentType>(['api_gateway', 'rate_limiter']);
const OBSERVABILITY_TYPES = new Set<ComponentType>(['monitoring', 'logging', 'tracing']);
const TRANSACTIONAL_TYPES = new Set<ComponentType>(['app_server', 'postgres', 'oracle']);

function computeGrade(score: number): ArchitectureGrade {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

/**
 * Intelligent Architecture Judge (Rule-Based Heuristic Engine).
 * Evaluates 8 production distributed-systems rules across Scalability,
 * High Availability, Performance, Security, and Observability with one-click Auto-Fixes.
 */
export function analyzeArchitecture(
  nodes: SystemNode[],
  edges: SystemEdge[],
  baseEntryRps = 0,
): AuditReport {
  const scores: AuditCategoryScores = {
    scalability: 100,
    highAvailability: 100,
    performance: 100,
    security: 100,
    observability: 100,
  };

  const findings: AuditFinding[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, SystemEdge[]>();
  const incoming = new Map<string, SystemEdge[]>();

  for (const n of nodes) {
    outgoing.set(n.id, []);
    incoming.set(n.id, []);
  }
  for (const e of edges) {
    if (outgoing.has(e.source) && incoming.has(e.target)) {
      outgoing.get(e.source)!.push(e);
      incoming.get(e.target)!.push(e);
    }
  }

  const hasPathThroughType = (
    startId: string,
    endId: string,
    allowedIntermediate: Set<ComponentType>,
  ): boolean => {
    const visited = new Set<string>();
    const queue: Array<{ id: string; seen: boolean }> = [{ id: startId, seen: false }];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const e of outgoing.get(curr.id) ?? []) {
        const nextNode = nodeMap.get(e.target);
        if (!nextNode) continue;
        const nowSeen = curr.seen || allowedIntermediate.has(nextNode.data.componentType);
        if (e.target === endId && nowSeen) return true;
        const key = `${e.target}:${nowSeen ? 1 : 0}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ id: e.target, seen: nowSeen });
        }
      }
    }
    return false;
  };

  // RULE 1: Single Point of Failure (SPOF) Check (CRITICAL, -15 pts HA)
  const spofNodes = nodes.filter((node) => {
    if (!SPOF_CANDIDATE_TYPES.has(node.data.componentType)) return false;
    if ((node.data.config.replicas ?? 1) > 1) return false;
    // Check if an upstream splits to a sibling failover node of the same type
    const parents = (incoming.get(node.id) ?? []).map((e) => e.source);
    const hasSiblingFailover = parents.some((parentId) => {
      const siblings = (outgoing.get(parentId) ?? [])
        .map((e) => nodeMap.get(e.target))
        .filter((n): n is SystemNode => Boolean(n && n.id !== node.id));
      return siblings.some((s) => s.data.componentType === node.data.componentType);
    });
    return !hasSiblingFailover;
  });

  for (const spof of spofNodes) {
    scores.highAvailability = Math.max(0, scores.highAvailability - 15);
    findings.push({
      id: `spof-${spof.id}`,
      ruleId: 'SPOF_DETECTION',
      severity: 'CRITICAL',
      category: 'highAvailability',
      title: `Single Point of Failure: ${spof.data.label}`,
      affectedNodeIds: [spof.id],
      explanation: `${spof.data.label} runs with only 1 replica and no failover peer. A single crash or AZ outage will drop 100% of traffic on this path.`,
      recommendation:
        'Scale to at least 3 replicas across multiple Availability Zones (or configure Primary-Standby replication).',
      pointDeduction: 15,
      autoFixAction: {
        type: 'UPDATE_CONFIG',
        label: 'Auto-Fix: Scale to 3 Replicas',
        targetNodeId: spof.id,
        configPatch: {
          replicas: 3,
          replicationMode: PRIMARY_DB_TYPES.has(spof.data.componentType)
            ? 'PRIMARY_REPLICA'
            : spof.data.config.replicationMode,
        },
      },
    });
  }

  // RULE 2: Database Read/Write Thrashing (CRITICAL, -15 pts Performance)
  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const dst = nodeMap.get(edge.target);
    if (!src || !dst) continue;
    if (src.data.componentType !== 'app_server' || !PRIMARY_DB_TYPES.has(dst.data.componentType)) {
      continue;
    }

    const effectiveRps = Math.max(dst.data.metrics.incomingRps, src.data.metrics.incomingRps);
    const hasRedisCache =
      nodes.some((n) => n.data.componentType === 'redis') &&
      ((incoming.get(dst.id) ?? []).some(
        (e) => nodeMap.get(e.source)?.data.componentType === 'redis',
      ) ||
        (outgoing.get(src.id) ?? []).some(
          (e) => nodeMap.get(e.target)?.data.componentType === 'redis',
        ));

    if (effectiveRps > 2000 && !hasRedisCache) {
      scores.performance = Math.max(0, scores.performance - 15);
      findings.push({
        id: `db-thrash-${src.id}-${dst.id}`,
        ruleId: 'DB_THRASHING',
        severity: 'CRITICAL',
        category: 'performance',
        title: `Database Thrashing on ${dst.data.label}`,
        affectedNodeIds: [src.id, dst.id],
        explanation: `${src.data.label} sends ${effectiveRps.toLocaleString()} RPS directly to ${dst.data.label} with no Redis cache absorbing hot reads.`,
        recommendation:
          'Insert a Redis In-Memory Cache (85%+ hit rate) between your App Server and Database to shield IOPS and cut latency by ~10x.',
        pointDeduction: 15,
        autoFixAction: {
          type: 'ADD_NODE_BETWEEN',
          label: 'Auto-Fix: Inject Redis Cache',
          sourceNodeId: src.id,
          targetNodeId: dst.id,
          newComponentType: 'redis',
          newLabel: 'Redis Read-Through Cache',
        },
      });
    }
  }

  // RULE 3: Synchronous Heavy Workload Anti-Pattern (WARNING, -10 pts Scalability)
  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const dst = nodeMap.get(edge.target);
    if (!src || !dst) continue;
    const isSyncCaller =
      src.data.componentType === 'api_gateway' || src.data.componentType === 'app_server';
    if (!isSyncCaller || !HEAVY_WORKLOAD_TYPES.has(dst.data.componentType)) continue;

    // Only flag if no queue sits between them
    const queuedPathExists = hasPathThroughType(src.id, dst.id, QUEUE_TYPES);
    if (!queuedPathExists) {
      scores.scalability = Math.max(0, scores.scalability - 10);
      findings.push({
        id: `sync-heavy-${src.id}-${dst.id}`,
        ruleId: 'SYNC_HEAVY_WORKLOAD',
        severity: 'WARNING',
        category: 'scalability',
        title: `Synchronous Bottleneck: ${src.data.label} → ${dst.data.label}`,
        affectedNodeIds: [src.id, dst.id],
        explanation: `${src.data.label} invokes heavy workload ${dst.data.label} synchronously. Traffic bursts will tie up HTTP threads and trigger cascading timeouts.`,
        recommendation:
          'Insert an Apache Kafka broker between the service and heavy worker/ML tier to decouple bursts asynchronously.',
        pointDeduction: 10,
        autoFixAction: {
          type: 'ADD_NODE_BETWEEN',
          label: 'Auto-Fix: Insert Apache Kafka Broker',
          sourceNodeId: src.id,
          targetNodeId: dst.id,
          newComponentType: 'kafka',
          newLabel: 'Apache Kafka Async Queue',
        },
      });
    }
  }

  // RULE 4: Unprotected Public Ingress (CRITICAL, -15 pts Security)
  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const dst = nodeMap.get(edge.target);
    if (!src || !dst) continue;
    if (src.data.componentType !== 'client') continue;
    const isExposedTarget =
      dst.data.componentType === 'app_server' ||
      PRIMARY_DB_TYPES.has(dst.data.componentType) ||
      dst.data.componentType === 'cassandra';

    if (isExposedTarget) {
      scores.security = Math.max(0, scores.security - 15);
      findings.push({
        id: `unprotected-ingress-${src.id}-${dst.id}`,
        ruleId: 'UNPROTECTED_INGRESS',
        severity: 'CRITICAL',
        category: 'security',
        title: `Unprotected Public Ingress to ${dst.data.label}`,
        affectedNodeIds: [src.id, dst.id],
        explanation: `Public Client traffic connects straight to ${dst.data.label} without passing through an API Gateway or WAF/Rate Limiter.`,
        recommendation:
          'Place a WAF & Rate Limiter or API Gateway at the edge to terminate TLS, throttle DDoS spikes, and validate schemas.',
        pointDeduction: 15,
        autoFixAction: {
          type: 'ADD_NODE_BETWEEN',
          label: 'Auto-Fix: Insert WAF & Rate Limiter',
          sourceNodeId: src.id,
          targetNodeId: dst.id,
          newComponentType: 'rate_limiter',
          newLabel: 'Edge WAF & Rate Limiter',
        },
      });
    }
  }

  // RULE 5: Missing Authentication Layer (WARNING, -10 pts Security)
  const hasTransactional = nodes.some((n) => TRANSACTIONAL_TYPES.has(n.data.componentType));
  const hasAuthProvider = nodes.some((n) => n.data.componentType === 'auth_provider');
  if (hasTransactional && !hasAuthProvider) {
    const anchor =
      nodes.find((n) => INGRESS_GUARD_TYPES.has(n.data.componentType)) ??
      nodes.find((n) => n.data.componentType === 'app_server');
    scores.security = Math.max(0, scores.security - 10);
    findings.push({
      id: 'missing-auth-provider',
      ruleId: 'MISSING_AUTH',
      severity: 'WARNING',
      category: 'security',
      title: 'Missing Authentication & Authorization Layer',
      affectedNodeIds: anchor ? [anchor.id] : [],
      explanation:
        'Transactional compute/database tiers are present without an OAuth2/OIDC/JWT Auth Provider validating identity or permissions.',
      recommendation:
        'Attach an Auth Provider (OAuth2 / OIDC / JWT) to your API Gateway or Compute tier to enforce zero-trust access control.',
      pointDeduction: 10,
      autoFixAction: anchor
        ? {
            type: 'ADD_ATTACHED_NODE',
            label: 'Auto-Fix: Add OAuth2/JWT Auth Provider',
            sourceNodeId: anchor.id,
            newComponentType: 'auth_provider',
            newLabel: 'OAuth2 / JWT Auth Provider',
          }
        : undefined,
    });
  }

  // RULE 6: Zero Observability Blindspot (WARNING, -10 pts Observability)
  const hasObservability = nodes.some((n) => OBSERVABILITY_TYPES.has(n.data.componentType));
  if (nodes.length >= 4 && !hasObservability) {
    const anchor =
      nodes.find((n) => n.data.componentType === 'app_server') ??
      nodes.find((n) => n.data.componentType === 'api_gateway') ??
      nodes[0];
    scores.observability = Math.max(0, scores.observability - 10);
    findings.push({
      id: 'zero-observability',
      ruleId: 'ZERO_OBSERVABILITY',
      severity: 'WARNING',
      category: 'observability',
      title: 'Zero Observability Blindspot',
      affectedNodeIds: anchor ? [anchor.id] : [],
      explanation:
        'This distributed architecture has 4+ components but lacks Monitoring (Prometheus), Logging (ELK), or Distributed Tracing (Jaeger).',
      recommendation:
        'Attach a Monitoring & Alerting node to compute clusters so SLA breaches and saturation trigger autoscaling alerts.',
      pointDeduction: 10,
      autoFixAction: anchor
        ? {
            type: 'ADD_ATTACHED_NODE',
            label: 'Auto-Fix: Add Prometheus Monitoring',
            sourceNodeId: anchor.id,
            newComponentType: 'monitoring',
            newLabel: 'Prometheus & Grafana',
          }
        : undefined,
    });
  }

  // RULE 7: Static Assets Served Without CDN (OPTIMIZATION, -5 pts Performance)
  const s3Nodes = nodes.filter((n) => n.data.componentType === 's3_storage');
  const hasCdn = nodes.some((n) => n.data.componentType === 'cdn');
  if (s3Nodes.length > 0 && !hasCdn) {
    for (const s3 of s3Nodes) {
      const parentEdge = (incoming.get(s3.id) ?? [])[0];
      scores.performance = Math.max(0, scores.performance - 5);
      findings.push({
        id: `missing-cdn-${s3.id}`,
        ruleId: 'STATIC_ASSETS_NO_CDN',
        severity: 'OPTIMIZATION',
        category: 'performance',
        title: `Object Storage (${s3.data.label}) Without Edge CDN`,
        affectedNodeIds: [s3.id],
        explanation:
          'Serving media/blobs directly from Object Storage forces every user request to traverse the origin region, inflating bandwidth cost and latency.',
        recommendation:
          'Place a Global CDN (Cloudflare / CloudFront) in front of S3 Object Storage to absorb 90%+ of media fetches at the edge.',
        pointDeduction: 5,
        autoFixAction: parentEdge
          ? {
              type: 'ADD_NODE_BETWEEN',
              label: 'Auto-Fix: Place Global CDN Ahead of S3',
              sourceNodeId: parentEdge.source,
              targetNodeId: s3.id,
              newComponentType: 'cdn',
              newLabel: 'Global Edge CDN',
            }
          : {
              type: 'ADD_ATTACHED_NODE',
              label: 'Auto-Fix: Add Global Edge CDN',
              sourceNodeId: s3.id,
              newComponentType: 'cdn',
              newLabel: 'Global Edge CDN',
            },
      });
    }
  }

  // RULE 8: Hot Partition / Unsharded Big Data (WARNING, -10 pts Scalability)
  const totalEntryRps = Math.max(
    baseEntryRps,
    nodes
      .filter((n) => n.data.componentType === 'client')
      .reduce((acc, n) => acc + n.data.metrics.incomingRps, 0),
  );
  const hasWideNoSql = nodes.some(
    (n) => n.data.componentType === 'cassandra' || n.data.componentType === 'elasticsearch',
  );
  const unshardedRdbms = nodes.filter(
    (n) =>
      RDBMS_TYPES.has(n.data.componentType) &&
      n.data.config.replicationMode !== 'SHARDED_CLUSTER' &&
      n.data.config.replicationMode !== 'MULTI_MASTER',
  );

  if (totalEntryRps > 50_000 && unshardedRdbms.length > 0 && !hasWideNoSql) {
    for (const db of unshardedRdbms) {
      scores.scalability = Math.max(0, scores.scalability - 10);
      findings.push({
        id: `hot-partition-${db.id}`,
        ruleId: 'HOT_PARTITION_RDBMS',
        severity: 'WARNING',
        category: 'scalability',
        title: `Unsharded RDBMS Under High Load (${db.data.label})`,
        affectedNodeIds: [db.id],
        explanation: `Ingress traffic is ${totalEntryRps.toLocaleString()} RPS while ${db.data.label} runs unsharded (${db.data.config.replicationMode ?? 'SINGLE_NODE'}). Single-writer SQL locks will become a hard scaling wall.`,
        recommendation:
          'Switch to a Sharded Cluster / Multi-Master topology or offload high-volume writes to Apache Cassandra.',
        pointDeduction: 10,
        autoFixAction: {
          type: 'UPDATE_CONFIG',
          label: 'Auto-Fix: Enable Sharded Cluster (6 Replicas)',
          targetNodeId: db.id,
          configPatch: {
            replicationMode: 'SHARDED_CLUSTER',
            replicas: Math.max(6, db.data.config.replicas),
          },
        },
      });
    }
  }

  // Bonus overload check (dynamic runtime feedback)
  const overloadedNodes = nodes.filter((n) => n.data.metrics.isOverloaded);
  for (const ov of overloadedNodes) {
    scores.scalability = Math.max(0, scores.scalability - 5);
    findings.push({
      id: `overloaded-${ov.id}`,
      ruleId: 'RUNTIME_OVERLOAD',
      severity: 'CRITICAL',
      category: 'scalability',
      title: `Live Capacity Saturated: ${ov.data.label}`,
      affectedNodeIds: [ov.id],
      explanation: `${ov.data.label} is receiving ${ov.data.metrics.incomingRps.toLocaleString()} RPS against a max capacity of ${(ov.data.config.maxRpsPerReplica * ov.data.config.replicas).toLocaleString()} RPS, causing ${ov.data.metrics.errorRatePercent}% drops.`,
      recommendation: `Increase replicas on ${ov.data.label} or add upstream caching/rate-limiting to restore headroom.`,
      pointDeduction: 5,
      autoFixAction: {
        type: 'UPDATE_CONFIG',
        label: `Auto-Fix: Double Replicas (${ov.data.config.replicas * 2}x)`,
        targetNodeId: ov.id,
        configPatch: {
          replicas: Math.min(32, Math.max(2, ov.data.config.replicas * 2)),
        },
      },
    });
  }

  const overallScore = Math.round(
    scores.highAvailability * 0.25 +
      scores.scalability * 0.25 +
      scores.performance * 0.2 +
      scores.security * 0.15 +
      scores.observability * 0.15,
  );

  // Sort findings: CRITICAL -> WARNING -> OPTIMIZATION
  const sevWeight = { CRITICAL: 0, WARNING: 1, OPTIMIZATION: 2 };
  findings.sort((a, b) => sevWeight[a.severity] - sevWeight[b.severity]);

  return {
    overallScore,
    grade: computeGrade(overallScore),
    categoryScores: scores,
    findings,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    totalEntryRps,
    evaluatedAt: new Date().toISOString(),
  };
}
