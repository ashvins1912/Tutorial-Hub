import type {
  ComponentType,
  NodeMetrics,
  RequestTraceHop,
  RequestTraceResult,
  SystemEdge,
  SystemNode,
} from '../types/system';

const OBSERVABILITY_TYPES = new Set<ComponentType>(['logging', 'tracing', 'monitoring']);
const CACHE_TYPES = new Set<ComponentType>(['cdn', 'redis']);

export interface SimulationTickResult {
  nodes: SystemNode[];
  edges: SystemEdge[];
  summary: {
    totalEntryRps: number;
    totalDeliveredRps: number;
    totalDroppedRps: number;
    avgLatencyMs: number;
    overloadedCount: number;
    offlineCount: number;
    globalErrorRatePct: number;
  };
}

/**
 * Pure DAG traffic propagation tick executed every 500ms.
 * Handles topological ordering (with cycle-safe fallback), rate limiting,
 * cache hit absorption, load splitting across healthy replicas, chaos OFFLINE/DEGRADED states,
 * and observability side-effect mirroring.
 */
export function runSimulationTick(
  nodes: SystemNode[],
  edges: SystemEdge[],
  baseEntryRps: number,
  spikeMultiplier: number,
): SimulationTickResult {
  if (nodes.length === 0) {
    return {
      nodes,
      edges,
      summary: {
        totalEntryRps: 0,
        totalDeliveredRps: 0,
        totalDroppedRps: 0,
        avgLatencyMs: 0,
        overloadedCount: 0,
        offlineCount: 0,
        globalErrorRatePct: 0,
      },
    };
  }

  const nodeMap = new Map<string, SystemNode>();
  const incomingRpsMap = new Map<string, number>();
  const metricsMap = new Map<string, NodeMetrics>();
  const outgoingEdgesMap = new Map<string, SystemEdge[]>();
  const incomingEdgesMap = new Map<string, SystemEdge[]>();
  const inDegree = new Map<string, number>();

  for (const node of nodes) {
    nodeMap.set(node.id, node);
    incomingRpsMap.set(node.id, 0);
    outgoingEdgesMap.set(node.id, []);
    incomingEdgesMap.set(node.id, []);
    inDegree.set(node.id, 0);
  }

  for (const edge of edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) continue;
    outgoingEdgesMap.get(edge.source)!.push(edge);
    incomingEdgesMap.get(edge.target)!.push(edge);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Entry injection: all client nodes, or root nodes with 0 incoming edges
  const effectiveEntryRps = Math.max(0, Math.round(baseEntryRps * spikeMultiplier));
  const clientNodes = nodes.filter((n) => n.data.componentType === 'client');
  const rootNodes =
    clientNodes.length > 0
      ? clientNodes
      : nodes.filter(
          (n) =>
            (inDegree.get(n.id) ?? 0) === 0 &&
            !OBSERVABILITY_TYPES.has(n.data.componentType),
        );

  const perRootRps = rootNodes.length > 0 ? effectiveEntryRps / rootNodes.length : 0;
  for (const root of rootNodes) {
    incomingRpsMap.set(root.id, (incomingRpsMap.get(root.id) ?? 0) + perRootRps);
  }

  // Kahn's topological sort with deterministic cycle-safe tail
  const queue: string[] = [];
  const remainingInDegree = new Map(inDegree);
  for (const node of nodes) {
    if ((remainingInDegree.get(node.id) ?? 0) === 0) {
      queue.push(node.id);
    }
  }

  const topoOrder: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    topoOrder.push(id);

    for (const edge of outgoingEdgesMap.get(id) ?? []) {
      const next = (remainingInDegree.get(edge.target) ?? 1) - 1;
      remainingInDegree.set(edge.target, next);
      if (next <= 0 && !visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  // Append any cycle participants in deterministic order so nothing is skipped
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      topoOrder.push(node.id);
    }
  }

  const edgeFlowMap = new Map<
    string,
    {
      activeRps: number;
      droppedRps: number;
      healthColor: string;
      status: 'HEALTHY' | 'WARN' | 'ERROR' | 'IDLE';
      packetSpeedMs: number;
      isObservabilityEdge: boolean;
    }
  >();

  // Propagate traffic downstream along topological order
  for (const nodeId of topoOrder) {
    const node = nodeMap.get(nodeId)!;
    const { componentType, status, config } = node.data;
    const incomingRps = Math.round(incomingRpsMap.get(nodeId) ?? 0);

    let processedRps = 0;
    let droppedRps = 0;
    let currentLatencyMs = 0;
    let cpuUsagePercent = 0;
    let errorRatePercent = 0;
    let cacheAbsorbedRps = 0;
    let isOverloaded = false;

    if (status === 'OFFLINE') {
      processedRps = 0;
      droppedRps = incomingRps;
      currentLatencyMs = 0;
      cpuUsagePercent = 0;
      errorRatePercent = incomingRps > 0 ? 100 : 0;
      isOverloaded = false;
    } else {
      let effectiveIncoming = incomingRps;

      // Rate limiter enforces strict Token Bucket ceiling (HTTP 429 on excess)
      if (componentType === 'rate_limiter' && typeof config.rateLimitRps === 'number') {
        const limit = Math.max(1, config.rateLimitRps);
        if (effectiveIncoming > limit) {
          droppedRps += effectiveIncoming - limit;
          effectiveIncoming = limit;
        }
      }

      const replicas = Math.max(1, config.replicas || 1);
      const maxPerReplica = Math.max(1, config.maxRpsPerReplica || 1000);
      const degradedFactor = status === 'DEGRADED' ? 0.5 : 1.0;
      const totalCapacity = Math.max(1, Math.round(maxPerReplica * replicas * degradedFactor));

      if (effectiveIncoming > totalCapacity) {
        processedRps = totalCapacity;
        droppedRps += effectiveIncoming - totalCapacity;
        cpuUsagePercent = 100;
        isOverloaded = true;
        const overloadRatio = (effectiveIncoming - totalCapacity) / totalCapacity;
        const base = Math.max(1, config.baseLatencyMs);
        currentLatencyMs = Math.min(
          9999,
          Math.round(base * (1 + Math.pow(overloadRatio, 2) * 5) * (status === 'DEGRADED' ? 2 : 1)),
        );
      } else {
        processedRps = effectiveIncoming;
        cpuUsagePercent =
          effectiveIncoming > 0 ? Math.min(99, Math.round((effectiveIncoming / totalCapacity) * 100)) : 0;
        currentLatencyMs =
          effectiveIncoming > 0
            ? Math.round(config.baseLatencyMs * (status === 'DEGRADED' ? 3 : 1))
            : config.baseLatencyMs;
      }

      errorRatePercent =
        incomingRps > 0 ? Math.min(100, Math.round((droppedRps / incomingRps) * 1000) / 10) : 0;
    }

    // Cache absorption math for CDN / Redis
    let downstreamRps = processedRps;
    if (status !== 'OFFLINE' && CACHE_TYPES.has(componentType)) {
      const hitRatio = Math.min(0.99, Math.max(0, config.cacheHitRatio ?? 0));
      cacheAbsorbedRps = Math.round(processedRps * hitRatio);
      downstreamRps = Math.max(0, processedRps - cacheAbsorbedRps);
    }

    metricsMap.set(nodeId, {
      incomingRps,
      processedRps,
      droppedRps,
      currentLatencyMs,
      cpuUsagePercent,
      errorRatePercent,
      cacheAbsorbedRps,
      isOverloaded,
    });

    // Propagate along outgoing edges
    const outgoing = outgoingEdgesMap.get(nodeId) ?? [];
    if (outgoing.length === 0) continue;

    const obsEdges: SystemEdge[] = [];
    const primaryEdges: SystemEdge[] = [];

    for (const edge of outgoing) {
      const targetNode = nodeMap.get(edge.target);
      if (targetNode && OBSERVABILITY_TYPES.has(targetNode.data.componentType)) {
        obsEdges.push(edge);
      } else {
        primaryEdges.push(edge);
      }
    }

    // Mirror processedRps to observability edges without subtracting from primary traffic
    for (const edge of obsEdges) {
      const targetNode = nodeMap.get(edge.target)!;
      const targetOffline = targetNode.data.status === 'OFFLINE';
      const mirroredRps = status === 'OFFLINE' ? 0 : Math.round(processedRps * (targetNode.data.config.samplingRate ?? 1));
      incomingRpsMap.set(edge.target, (incomingRpsMap.get(edge.target) ?? 0) + mirroredRps);

      edgeFlowMap.set(edge.id, {
        activeRps: mirroredRps,
        droppedRps: targetOffline ? mirroredRps : 0,
        healthColor: targetOffline || status === 'OFFLINE' ? '#ef4444' : '#64748b',
        status: targetOffline || status === 'OFFLINE' ? 'ERROR' : mirroredRps > 0 ? 'HEALTHY' : 'IDLE',
        packetSpeedMs: Math.max(600, Math.min(2400, Math.round(2200 - mirroredRps / 80))),
        isObservabilityEdge: true,
      });
    }

    if (primaryEdges.length === 0) continue;

    // Identify healthy vs offline targets for smart failover splitting
    const healthyPrimary = primaryEdges.filter(
      (e) => nodeMap.get(e.target)?.data.status !== 'OFFLINE',
    );

    const splitCount = healthyPrimary.length > 0 ? healthyPrimary.length : primaryEdges.length;
    const perEdgeRps = status === 'OFFLINE' ? 0 : downstreamRps / splitCount;

    for (const edge of primaryEdges) {
      const targetNode = nodeMap.get(edge.target)!;
      const targetOffline = targetNode.data.status === 'OFFLINE';

      // If another healthy replica/route exists, load balancer shifts traffic away from offline target
      let assignedRps = 0;
      if (status === 'OFFLINE') {
        assignedRps = 0;
      } else if (targetOffline && healthyPrimary.length > 0) {
        assignedRps = 0;
      } else {
        assignedRps = Math.round(perEdgeRps);
      }

      if (assignedRps > 0) {
        incomingRpsMap.set(edge.target, (incomingRpsMap.get(edge.target) ?? 0) + assignedRps);
      }

      const isErr = status === 'OFFLINE' || targetOffline || errorRatePercent > 5;
      const isWarn =
        !isErr &&
        (status === 'DEGRADED' ||
          targetNode.data.status === 'DEGRADED' ||
          currentLatencyMs > 150 ||
          cpuUsagePercent >= 85);

      const healthColor = isErr
        ? '#ef4444'
        : isWarn
          ? '#f59e0b'
          : assignedRps > 0
            ? '#10b981'
            : '#475569';

      const edgeStatus = isErr
        ? 'ERROR'
        : isWarn
          ? 'WARN'
          : assignedRps > 0
            ? 'HEALTHY'
            : 'IDLE';

      const speedFromLatency = Math.max(250, Math.min(2600, 450 + currentLatencyMs * 6));
      const speedFromRps = Math.max(220, 1900 - assignedRps / 60);
      const packetSpeedMs = Math.round(Math.min(speedFromLatency, speedFromRps));

      edgeFlowMap.set(edge.id, {
        activeRps: assignedRps,
        droppedRps: status === 'OFFLINE' || targetOffline ? Math.round(downstreamRps / primaryEdges.length) : 0,
        healthColor,
        status: edgeStatus,
        packetSpeedMs: Math.max(220, Math.min(2600, packetSpeedMs)),
        isObservabilityEdge: false,
      });
    }
  }

  // Second pass: if a target ended up overloaded/erroring, reflect warning/error tint on incoming edge
  for (const edge of edges) {
    const flow = edgeFlowMap.get(edge.id);
    const targetMetrics = metricsMap.get(edge.target);
    const targetNode = nodeMap.get(edge.target);
    if (!flow || !targetMetrics || !targetNode) continue;
    if (flow.isObservabilityEdge) continue;

    if (targetNode.data.status === 'OFFLINE' || targetMetrics.errorRatePercent > 5) {
      flow.healthColor = '#ef4444';
      flow.status = 'ERROR';
      flow.droppedRps = Math.max(flow.droppedRps, targetMetrics.droppedRps);
    } else if (
      targetNode.data.status === 'DEGRADED' ||
      targetMetrics.currentLatencyMs > 150 ||
      targetMetrics.cpuUsagePercent >= 85
    ) {
      flow.healthColor = '#f59e0b';
      flow.status = 'WARN';
    }
  }

  const nextNodes: SystemNode[] = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      metrics: metricsMap.get(node.id) ?? node.data.metrics,
    },
  }));

  const nextEdges: SystemEdge[] = edges.map((edge) => {
    const flow = edgeFlowMap.get(edge.id);
    return {
      ...edge,
      type: 'animatedTraffic',
      data: {
        ...(edge.data ?? {}),
        activeRps: flow?.activeRps ?? 0,
        droppedRps: flow?.droppedRps ?? 0,
        packetSpeedMs: flow?.packetSpeedMs ?? 1600,
        healthColor: flow?.healthColor ?? '#475569',
        status: flow?.status ?? 'IDLE',
        isObservabilityEdge: flow?.isObservabilityEdge ?? false,
      },
    };
  });

  // Compute global summary telemetry
  let totalDroppedRps = 0;
  let latencySum = 0;
  let latencyCount = 0;
  let overloadedCount = 0;
  let offlineCount = 0;

  for (const node of nextNodes) {
    const m = node.data.metrics;
    if (node.data.status === 'OFFLINE') offlineCount++;
    if (m.isOverloaded) overloadedCount++;
    if (!OBSERVABILITY_TYPES.has(node.data.componentType)) {
      totalDroppedRps += m.droppedRps;
      if (m.incomingRps > 0 && node.data.status !== 'OFFLINE') {
        latencySum += m.currentLatencyMs;
        latencyCount++;
      }
    }
  }

  const cappedDropped = Math.min(effectiveEntryRps, totalDroppedRps);
  const totalDeliveredRps = Math.max(0, effectiveEntryRps - cappedDropped);
  const globalErrorRatePct =
    effectiveEntryRps > 0 ? Math.round((cappedDropped / effectiveEntryRps) * 1000) / 10 : 0;

  return {
    nodes: nextNodes,
    edges: nextEdges,
    summary: {
      totalEntryRps: effectiveEntryRps,
      totalDeliveredRps,
      totalDroppedRps: cappedDropped,
      avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
      overloadedCount,
      offlineCount,
      globalErrorRatePct,
    },
  };
}

/**
 * Traces a single live request packet from the Client (or root) to `targetNodeId`,
 * returning hop-by-hop latencies, failure points, and realistic mock HTTP JSON payloads.
 */
export function traceSingleRequest(
  nodes: SystemNode[],
  edges: SystemEdge[],
  targetNodeId: string,
): RequestTraceResult | null {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const targetNode = nodeMap.get(targetNodeId);
  if (!targetNode) return null;

  // Build adjacency list
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  for (const n of nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }
  for (const e of edges) {
    if (adj.has(e.source) && nodeMap.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
    }
  }

  // Start BFS from client nodes (or root nodes)
  const starts = nodes
    .filter((n) => n.data.componentType === 'client')
    .map((n) => n.id);
  const rootIds =
    starts.length > 0
      ? starts
      : nodes.filter((n) => (inDeg.get(n.id) ?? 0) === 0).map((n) => n.id);

  let path: string[] | null = null;

  if (rootIds.includes(targetNodeId)) {
    path = [targetNodeId];
  } else {
    const queue: string[][] = rootIds.map((id) => [id]);
    const visited = new Set<string>(rootIds);
    while (queue.length > 0) {
      const curr = queue.shift()!;
      const last = curr[curr.length - 1];
      if (last === targetNodeId) {
        path = curr;
        break;
      }
      for (const nextId of adj.get(last) ?? []) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push([...curr, nextId]);
        }
      }
    }
  }

  // If disconnected from Client, trace directly against the node itself
  const tracePath = path ?? [targetNodeId];
  const hops: RequestTraceHop[] = [];
  let totalLatencyMs = 0;

  for (const id of tracePath) {
    const node = nodeMap.get(id)!;
    const { status, metrics, config, componentType, label, mockPayloads } = node.data;

    // 1. Offline node -> immediate 503 failure
    if (status === 'OFFLINE') {
      hops.push({
        nodeId: node.id,
        label,
        componentType,
        status,
        latencyMs: 0,
        cpuUsagePercent: 0,
        note: 'Node is OFFLINE — connection refused / upstream 503 returned.',
        outcome: 'FAILED',
      });

      return {
        targetNodeId,
        targetLabel: targetNode.data.label,
        timestamp: new Date().toISOString(),
        httpStatus: mockPayloads.errorResponse.statusCode || 503,
        httpStatusText: mockPayloads.errorResponse.statusText || 'Service Unavailable',
        totalLatencyMs,
        failedAtNodeId: node.id,
        failedAtLabel: label,
        hops,
        responsePayload: {
          ...mockPayloads.errorResponse,
          body: {
            ...mockPayloads.errorResponse.body,
            failedHop: label,
            tracePath: tracePath.map((p) => nodeMap.get(p)?.data.label ?? p),
          },
        },
      };
    }

    const hopLatency = Math.max(1, metrics.currentLatencyMs || config.baseLatencyMs);
    totalLatencyMs += hopLatency;

    // 2. Rate limiter exceeded
    if (componentType === 'rate_limiter' && metrics.droppedRps > 0 && metrics.errorRatePercent >= 15) {
      hops.push({
        nodeId: node.id,
        label,
        componentType,
        status,
        latencyMs: hopLatency,
        cpuUsagePercent: metrics.cpuUsagePercent,
        note: `Token bucket saturated (${metrics.droppedRps.toLocaleString()} RPS shed with HTTP 429).`,
        outcome: 'RATE_LIMITED',
      });

      return {
        targetNodeId,
        targetLabel: targetNode.data.label,
        timestamp: new Date().toISOString(),
        httpStatus: 429,
        httpStatusText: 'Too Many Requests',
        totalLatencyMs,
        failedAtNodeId: node.id,
        failedAtLabel: label,
        hops,
        responsePayload: {
          ...mockPayloads.errorResponse,
          statusCode: 429,
          statusText: 'Too Many Requests',
          body: {
            ...mockPayloads.errorResponse.body,
            incomingRps: metrics.incomingRps,
            rateLimitRps: config.rateLimitRps,
          },
        },
      };
    }

    // 3. Severe overload (>= 95% CPU) -> 504 Gateway Timeout
    if (metrics.cpuUsagePercent >= 95 && metrics.isOverloaded) {
      hops.push({
        nodeId: node.id,
        label,
        componentType,
        status,
        latencyMs: hopLatency,
        cpuUsagePercent: metrics.cpuUsagePercent,
        note: `Saturated at ${metrics.cpuUsagePercent}% CPU (${metrics.incomingRps.toLocaleString()} incoming vs ${(config.maxRpsPerReplica * config.replicas).toLocaleString()} max RPS).`,
        outcome: 'OVERLOADED',
      });

      return {
        targetNodeId,
        targetLabel: targetNode.data.label,
        timestamp: new Date().toISOString(),
        httpStatus: 504,
        httpStatusText: 'Gateway Timeout (Node Overloaded)',
        totalLatencyMs,
        failedAtNodeId: node.id,
        failedAtLabel: label,
        hops,
        responsePayload: {
          ...mockPayloads.errorResponse,
          statusCode: 504,
          statusText: 'Gateway Timeout',
          body: {
            ...mockPayloads.errorResponse.body,
            reason: 'CAPACITY_EXCEEDED',
            cpuUsagePercent: metrics.cpuUsagePercent,
            observedLatencyMs: hopLatency,
          },
        },
      };
    }

    // 4. Healthy or Degraded hop
    const isCache = CACHE_TYPES.has(componentType) && (config.cacheHitRatio ?? 0) > 0;
    hops.push({
      nodeId: node.id,
      label,
      componentType,
      status,
      latencyMs: hopLatency,
      cpuUsagePercent: metrics.cpuUsagePercent,
      note:
        status === 'DEGRADED'
          ? `Degraded mode active (3x latency penalty, 50% capacity).`
          : isCache
            ? `Cache tier (${Math.round((config.cacheHitRatio ?? 0) * 100)}% hit rate shields downstream origin).`
            : `Processed cleanly (${config.replicas} replica${config.replicas > 1 ? 's' : ''}).`,
      outcome: status === 'DEGRADED' ? 'DEGRADED' : isCache ? 'CACHE_HIT' : 'OK',
    });
  }

  const anyDegraded = hops.some((h) => h.outcome === 'DEGRADED');
  const payload = anyDegraded
    ? targetNode.data.mockPayloads.degradedResponse
    : targetNode.data.mockPayloads.successResponse;

  return {
    targetNodeId,
    targetLabel: targetNode.data.label,
    timestamp: new Date().toISOString(),
    httpStatus: payload.statusCode,
    httpStatusText: payload.statusText,
    totalLatencyMs,
    hops,
    responsePayload: {
      ...payload,
      headers: {
        ...payload.headers,
        'x-total-trace-ms': `${totalLatencyMs}ms`,
        'x-hops-traversed': String(hops.length),
      },
    },
  };
}
