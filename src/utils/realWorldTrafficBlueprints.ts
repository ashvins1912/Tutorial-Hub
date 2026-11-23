import {
  REAL_WORLD_SYSTEM_BLUEPRINTS,
  type RealWorldDomain,
  type RealWorldSystemBlueprint,
} from '../data/realWorldSystemBlueprintsData';
import { REAL_WORLD_BLUEPRINT_DEEP_SPECS } from '../data/realWorldBlueprintMermaidDfdData';
import type {
  TrafficEdge,
  TrafficNode,
  TrafficNodeRole,
  TrafficTopology,
} from './liveTrafficTopology';

export interface BlueprintTrafficExplanation {
  blueprintId: string;
  shortTitle: string;
  domainLabel: string;
  scaleBadge: string;
  commPatterns: string[];
  simpleEnglish: string;
  formalDefinition: string;
  architectureSummary: string;
  capacityNumbers: { metric: string; value: string }[];
  coreAlgorithms: string[];
  bottleneckAndFix: string;
  dbDesignSummary: string;
  consistencyModel: string;
  rpoRto: string;
  cachingStrategy: string;
  multiRegionDr: string;
  requestLifecycleSteps: {
    step: number;
    title: string;
    plainEnglish: string;
    technicalDetail: string;
    packetLabel: string;
  }[];
}

const DOMAIN_LABELS: Record<RealWorldDomain, string> = {
  'booking-travel': 'Booking, Travel & Quick-Commerce',
  'fintech-exchanges': 'FinTech, Payments & Exchanges',
  'ai-search-web': 'Frontier AI, Search & Core Web',
  'realtime-social-telecom': 'Real-Time Social, Rides & Telecom',
};

const REAL_WORLD_DEFAULT_RPS: Record<string, { rps: number; cacheHit: number }> = {
  'zepto-blinkit-instamart': { rps: 42000, cacheHit: 76 },
  'irctc-tatkal': { rps: 68000, cacheHit: 62 },
  'bookmyshow-ticketing': { rps: 54000, cacheHit: 70 },
  'flight-booking-gds': { rps: 24000, cacheHit: 68 },
  'stock-exchange-matching': { rps: 95000, cacheHit: 40 },
  'zerodha-kite': { rps: 62000, cacheHit: 72 },
  'chatgpt-google-gemini': { rps: 30000, cacheHit: 66 },
  'instagram-social': { rps: 84000, cacheHit: 86 },
  'whatsapp-messaging': { rps: 92000, cacheHit: 58 },
  'uber-geospatial': { rps: 74000, cacheHit: 64 },
  'slack-ms-teams': { rps: 48000, cacheHit: 74 },
  'telecommunication-5g-voip': { rps: 88000, cacheHit: 50 },
  'internet-www-end-to-end': { rps: 96000, cacheHit: 82 },
  'google-search-engine': { rps: 90000, cacheHit: 78 },
  'payment-gateway-ledger': { rps: 38000, cacheHit: 52 },
  'url-shortener-ratelimiter': { rps: 82000, cacheHit: 88 },
  'youtube-netflix-streaming': { rps: 98000, cacheHit: 90 },
};

function inferBlueprintNodeRole(text: string, idx: number, total: number): TrafficNodeRole {
  const lower = text.toLowerCase();
  if (idx === 0 && /(user|client|rider|trader|browser|mobile|caller|ue|device|fan|traveler)/.test(lower)) {
    return 'client';
  }
  if (/(cdn|dns|anycast|edge|waf|wait|cloudfront|isp|pop|cell|gnb|ran)/.test(lower)) return 'edge';
  if (/(load|gateway|gw|router|lb|ingress|alb|proxy|amf|sip|flannel|limit)/.test(lower)) {
    return 'load-balancer';
  }
  if (/(redis|cache|kv|mem|h3|spatial|bloom|lock|hot|buffer)/.test(lower)) return 'cache';
  if (/(kafka|queue|sqs|broker|event|stream|ring|disruptor|dag|cdc|outbox|bus)/.test(lower)) {
    return 'queue';
  }
  if (/(replica|standby|dr\b|backup|fallback|secondary)/.test(lower)) return 'replica';
  if (/(shard|partition|index|gpu|vector|engine|match|book|inverted|transcod|upf|sfu)/.test(lower)) {
    return 'shard';
  }
  if (/(db|postgres|sql|ledger|storage|s3|cassandra|dynamo|spanner|pnr|gds|rms|cdr|billing)/.test(lower)) {
    return 'db';
  }
  if (/(auth|captcha|kyc|fraud|e2ee|signal|tls|security|margin|risk)/.test(lower)) return 'security';
  if (idx === 0) return 'client';
  if (idx === total - 1) return 'db';
  return 'service';
}

function capacityAndLatencyForRole(role: TrafficNodeRole, defaultRps: number): {
  capacityRps: number;
  baseLatencyMs: number;
} {
  const scale = Math.max(1, defaultRps / 30000);
  switch (role) {
    case 'client':
      return { capacityRps: Math.round(280000 * scale), baseLatencyMs: 5 };
    case 'edge':
      return { capacityRps: Math.round(200000 * scale), baseLatencyMs: 4 };
    case 'load-balancer':
      return { capacityRps: Math.round(145000 * scale), baseLatencyMs: 3 };
    case 'cache':
      return { capacityRps: Math.round(160000 * scale), baseLatencyMs: 1.5 };
    case 'queue':
      return { capacityRps: Math.round(150000 * scale), baseLatencyMs: 4 };
    case 'security':
      return { capacityRps: Math.round(115000 * scale), baseLatencyMs: 3.5 };
    case 'shard':
      return { capacityRps: Math.round(26000 * scale), baseLatencyMs: 14 };
    case 'replica':
      return { capacityRps: Math.round(42000 * scale), baseLatencyMs: 17 };
    case 'db':
      return { capacityRps: Math.round(28000 * scale), baseLatencyMs: 13 };
    default:
      return { capacityRps: Math.round(68000 * scale), baseLatencyMs: 9 };
  }
}

function buildTopologyFromRealWorldBlueprint(bp: RealWorldSystemBlueprint): {
  topology: TrafficTopology;
  explanation: BlueprintTrafficExplanation;
} {
  const deep = REAL_WORLD_BLUEPRINT_DEEP_SPECS[bp.id];
  const tuned = REAL_WORLD_DEFAULT_RPS[bp.id] ?? { rps: 36000, cacheHit: 72 };

  const xs = bp.dfdNodes.map((n) => n.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const spanX = Math.max(1, maxX - minX);

  const nodes: TrafficNode[] = bp.dfdNodes.map((n, idx) => {
    const role = inferBlueprintNodeRole(`${n.id} ${n.label} ${n.sublabel}`, idx, bp.dfdNodes.length);
    const tier = Math.min(4, Math.max(0, Math.round(((n.x - minX) / spanX) * 4)));
    const spec = capacityAndLatencyForRole(role, tuned.rps);
    return {
      id: n.id,
      label: n.label,
      sublabel: n.sublabel,
      role,
      tier,
      capacityRps: spec.capacityRps,
      baseLatencyMs: spec.baseLatencyMs,
      isReplica: role === 'replica',
    };
  });

  const nodeIdSet = new Set(nodes.map((n) => n.id));
  const edges: TrafficEdge[] = bp.dfdEdges
    .filter((e) => nodeIdSet.has(e.from) && nodeIdSet.has(e.to))
    .map((e) => {
      const lower = e.label.toLowerCase();
      const kind: TrafficEdge['kind'] = /(async|queue|kafka|event|cdc|webhook|fan-out|stream|replicate)/.test(
        lower
      )
        ? 'async'
        : 'primary';
      return {
        id: `${bp.id}-${e.id}`,
        source: e.from,
        target: e.to,
        label: e.label,
        kind,
      };
    });

  // Ensure every real-world blueprint has a realistic hot-shard and automatic failover standby path
  const shardOrDbNodes = nodes.filter((n) => n.role === 'shard' || n.role === 'db');
  const existingReplica = nodes.find((n) => n.role === 'replica');
  const primaryFailTarget =
    shardOrDbNodes[0] ?? nodes[Math.min(nodes.length - 1, Math.max(1, nodes.length - 2))];
  const hotTarget = shardOrDbNodes[shardOrDbNodes.length - 1] ?? primaryFailTarget;
  if (hotTarget) {
    hotTarget.isHotShard = true;
  }

  if (primaryFailTarget) {
    if (existingReplica && existingReplica.id !== primaryFailTarget.id) {
      primaryFailTarget.failoverTargetId = existingReplica.id;
      edges.push({
        id: `${bp.id}-failover-edge`,
        source: primaryFailTarget.id,
        target: existingReplica.id,
        label: 'Auto Failover',
        kind: 'failover',
      });
    } else {
      const standbyId = `${primaryFailTarget.id}_standby`;
      nodes.push({
        id: standbyId,
        label: `${primaryFailTarget.label.slice(0, 14)} Standby`,
        sublabel: 'Multi-AZ DR Replica',
        role: 'replica',
        tier: primaryFailTarget.tier,
        capacityRps: Math.round(primaryFailTarget.capacityRps * 1.45),
        baseLatencyMs: primaryFailTarget.baseLatencyMs + 4,
        isReplica: true,
      });
      primaryFailTarget.failoverTargetId = standbyId;
      edges.push({
        id: `${bp.id}-failover-edge`,
        source: primaryFailTarget.id,
        target: standbyId,
        label: 'Multi-AZ Failover',
        kind: 'failover',
      });
    }
  }

  const topology: TrafficTopology = {
    id: `rw-${bp.id}`,
    title: `${bp.shortTitle} — ${bp.title}`,
    subtitle: `${bp.scaleBadge} · ${bp.simpleEnglish}`,
    domain: 'system-design',
    nodes,
    edges,
    defaultRps: tuned.rps,
    defaultCacheHitPct: tuned.cacheHit,
    primaryFailNodeId: primaryFailTarget?.id,
    hotShardNodeId: hotTarget?.id,
    patternHighlights: [
      bp.architectureSummary,
      bp.bottleneckAndFix,
      bp.dbDesignSummary,
    ],
  };

  const explanation: BlueprintTrafficExplanation = {
    blueprintId: bp.id,
    shortTitle: bp.shortTitle,
    domainLabel: DOMAIN_LABELS[bp.domain],
    scaleBadge: bp.scaleBadge,
    commPatterns: bp.commPatterns,
    simpleEnglish: bp.simpleEnglish,
    formalDefinition: deep?.formalDefinition ?? bp.architectureSummary,
    architectureSummary: bp.architectureSummary,
    capacityNumbers: bp.capacityNumbers,
    coreAlgorithms: bp.coreAlgorithms,
    bottleneckAndFix: bp.bottleneckAndFix,
    dbDesignSummary: bp.dbDesignSummary,
    consistencyModel: deep?.consistencyModel ?? 'Bounded staleness on reads; strong transactional guarantees on critical writes.',
    rpoRto: deep?.rpoRto ?? 'RPO < 1s (sync WAL / quorum replication) · RTO < 30s automated Multi-AZ failover.',
    cachingStrategy: deep?.cachingStrategy ?? 'Multi-tier edge CDN + Redis cluster cache-aside with singleflight stampede defense.',
    multiRegionDr: deep?.multiRegionDr ?? 'Active-Active edge routing with regional read replicas and automated primary promotion.',
    requestLifecycleSteps: bp.dfdSteps.map((s) => ({
      step: s.step,
      title: s.title,
      plainEnglish: s.plainEnglish,
      technicalDetail: s.technicalDetail,
      packetLabel: s.packetLabel,
    })),
  };

  return { topology, explanation };
}

const BUILT_REAL_WORLD = REAL_WORLD_SYSTEM_BLUEPRINTS.map(buildTopologyFromRealWorldBlueprint);

export const REAL_WORLD_TRAFFIC_TOPOLOGIES: TrafficTopology[] = BUILT_REAL_WORLD.map(
  (item) => item.topology
);

export const REAL_WORLD_TRAFFIC_EXPLANATIONS: Record<string, BlueprintTrafficExplanation> =
  Object.fromEntries(BUILT_REAL_WORLD.map((item) => [item.topology.id, item.explanation]));

export function getRealWorldExplanationForTopology(
  topology: TrafficTopology
): BlueprintTrafficExplanation | null {
  if (REAL_WORLD_TRAFFIC_EXPLANATIONS[topology.id]) {
    return REAL_WORLD_TRAFFIC_EXPLANATIONS[topology.id];
  }
  // Also match if a synced Mermaid/Playground topology carries a blueprint ID or shortTitle
  const lower = `${topology.id} ${topology.title}`.toLowerCase();
  for (const item of BUILT_REAL_WORLD) {
    const bpId = item.explanation.blueprintId.toLowerCase();
    const shortLower = item.explanation.shortTitle.toLowerCase();
    if (lower.includes(bpId) || (shortLower.length > 4 && lower.includes(shortLower))) {
      return item.explanation;
    }
  }
  return null;
}
