import type { Edge, Node } from '@xyflow/react';

export type ComponentCategory =
  | 'entry'
  | 'edge'
  | 'security'
  | 'compute'
  | 'messaging'
  | 'storage'
  | 'ai_ml'
  | 'observability';

export type ComponentType =
  | 'client'
  // Edge & Networking
  | 'dns'
  | 'cdn'
  | 'load_balancer'
  | 'reverse_proxy'
  | 'dynamic_router'
  | 'network_switch'
  // Security & Gateways
  | 'api_gateway'
  | 'auth_provider'
  | 'rate_limiter'
  // Compute & Services
  | 'web_server'
  | 'app_server'
  | 'worker'
  | 'serverless'
  // Real-Time & Messaging
  | 'websocket_gateway'
  | 'kafka'
  | 'pubsub'
  // Storage & Databases
  | 'postgres'
  | 'oracle'
  | 'mongodb'
  | 'cassandra'
  | 'elasticsearch'
  | 'redis'
  | 's3_storage'
  // AI / ML Infrastructure
  | 'vector_db'
  | 'ml_inference'
  | 'feature_store'
  // Observability & Ops
  | 'logging'
  | 'tracing'
  | 'monitoring';

export type NodeStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type RoutingAlgorithm = 'ROUND_ROBIN' | 'LEAST_CONN' | 'CONSISTENT_HASH' | 'IP_HASH';

export type ReplicationMode = 'SINGLE_NODE' | 'PRIMARY_REPLICA' | 'MULTI_MASTER' | 'SHARDED_CLUSTER';

export interface NodeConfig {
  replicas: number;
  maxRpsPerReplica: number;
  baseLatencyMs: number;
  cacheHitRatio?: number; // 0 to 0.99
  rateLimitRps?: number;
  routingAlgo?: RoutingAlgorithm;
  replicationMode?: ReplicationMode;
  runtime?: string;
  partitions?: number;
  gpuBatchSize?: number;
  samplingRate?: number;
  autoScaling?: boolean;
}

export interface NodeMetrics {
  incomingRps: number;
  processedRps: number;
  droppedRps: number;
  currentLatencyMs: number;
  cpuUsagePercent: number;
  errorRatePercent: number;
  cacheAbsorbedRps: number;
  isOverloaded: boolean;
}

export interface MockPayloadPacket {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export interface MockPayloads {
  successResponse: MockPayloadPacket;
  degradedResponse: MockPayloadPacket;
  errorResponse: MockPayloadPacket;
}

export interface ArchitectureImpact {
  whyAdded: string;
  latencyImpact: string;
  throughputImpact: string;
  availabilityImpact: string;
  bestPractices: string[];
}

export interface SystemNodeData extends Record<string, unknown> {
  componentType: ComponentType;
  category: ComponentCategory;
  label: string;
  subtitle: string;
  status: NodeStatus;
  config: NodeConfig;
  metrics: NodeMetrics;
  impact: ArchitectureImpact;
  mockPayloads: MockPayloads;
  isHighlighted?: boolean;
}

export type SystemNode = Node<SystemNodeData, 'systemNode'>;

export interface SystemEdgeData extends Record<string, unknown> {
  activeRps: number;
  droppedRps: number;
  packetSpeedMs: number;
  healthColor: string;
  status: 'HEALTHY' | 'WARN' | 'ERROR' | 'IDLE';
  isObservabilityEdge?: boolean;
  edgeLabel?: string;
}

export type SystemEdge = Edge<SystemEdgeData>;

export interface ComponentCatalogItem {
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  shortSubtitle: string;
  iconName: string;
  defaultConfig: NodeConfig;
  impact: ArchitectureImpact;
  mockPayloads: MockPayloads;
}

export interface RequestTraceHop {
  nodeId: string;
  label: string;
  componentType: ComponentType;
  status: NodeStatus;
  latencyMs: number;
  cpuUsagePercent: number;
  note: string;
  outcome: 'OK' | 'CACHE_HIT' | 'DEGRADED' | 'RATE_LIMITED' | 'OVERLOADED' | 'FAILED';
}

export interface RequestTraceResult {
  targetNodeId: string;
  targetLabel: string;
  timestamp: string;
  httpStatus: number;
  httpStatusText: string;
  totalLatencyMs: number;
  failedAtNodeId?: string;
  failedAtLabel?: string;
  hops: RequestTraceHop[];
  responsePayload: MockPayloadPacket;
}

export type AuditSeverity = 'CRITICAL' | 'WARNING' | 'OPTIMIZATION';

export interface AuditAutoFixAction {
  type: 'UPDATE_CONFIG' | 'ADD_NODE_BETWEEN' | 'ADD_ATTACHED_NODE';
  label: string;
  targetNodeId?: string;
  sourceNodeId?: string;
  newComponentType?: ComponentType;
  newLabel?: string;
  configPatch?: Partial<NodeConfig>;
}

export interface AuditFinding {
  id: string;
  ruleId: string;
  severity: AuditSeverity;
  category: keyof AuditCategoryScores;
  title: string;
  affectedNodeIds: string[];
  explanation: string;
  recommendation: string;
  pointDeduction: number;
  autoFixAction?: AuditAutoFixAction;
}

export interface AuditCategoryScores {
  scalability: number;
  highAvailability: number;
  performance: number;
  security: number;
  observability: number;
}

export type ArchitectureGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface AuditReport {
  overallScore: number;
  grade: ArchitectureGrade;
  categoryScores: AuditCategoryScores;
  findings: AuditFinding[];
  nodeCount: number;
  edgeCount: number;
  totalEntryRps: number;
  evaluatedAt: string;
}

export interface BlueprintWalkthroughStep {
  step: number;
  title: string;
  tier: string;
  description: string;
  highlightNodeIds: string[];
}

export interface SystemBlueprint {
  id: string;
  name: string;
  shortName: string;
  scaleTag: string;
  description: string;
  recommendedEntryRps: number;
  nodes: SystemNode[];
  edges: SystemEdge[];
  architecturalWalkthrough: BlueprintWalkthroughStep[];
}

export function createEmptyMetrics(): NodeMetrics {
  return {
    incomingRps: 0,
    processedRps: 0,
    droppedRps: 0,
    currentLatencyMs: 0,
    cpuUsagePercent: 0,
    errorRatePercent: 0,
    cacheAbsorbedRps: 0,
    isOverloaded: false,
  };
}
