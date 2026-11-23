import { COMPONENT_CATALOG_MAP } from './componentCatalog';
import {
  createEmptyMetrics,
  type ComponentType,
  type MockPayloads,
  type NodeConfig,
  type SystemBlueprint,
  type SystemEdge,
  type SystemNode,
} from '../types/system';

interface BlueprintNodeSpec {
  id: string;
  type: ComponentType;
  label: string;
  subtitle?: string;
  x: number;
  y: number;
  config?: Partial<NodeConfig>;
  whyAdded?: string;
  mockPayloads?: Partial<MockPayloads>;
}

interface BlueprintEdgeSpec {
  source: string;
  target: string;
  edgeLabel?: string;
}

export interface PlaygroundArchitectureExplanation {
  blueprintId: string;
  domain: string;
  formalDefinition: string;
  whyThisArchitectureExists: string;
  capacityAndScaleMath: string;
  coreAlgorithms: { name: string; role: string }[];
  databaseAndShardingStrategy: string;
  criticalBottlenecks: string[];
  failureAndChaosPlaybook: { trigger: string; systemResponse: string }[];
  requestFlowSummary: string;
}

function buildNode(spec: BlueprintNodeSpec): SystemNode {
  const catalog = COMPONENT_CATALOG_MAP[spec.type];
  return {
    id: spec.id,
    type: 'systemNode',
    position: { x: spec.x, y: spec.y },
    data: {
      componentType: spec.type,
      category: catalog.category,
      label: spec.label,
      subtitle: spec.subtitle ?? catalog.shortSubtitle,
      status: 'ONLINE',
      config: {
        ...catalog.defaultConfig,
        ...(spec.config ?? {}),
      },
      metrics: createEmptyMetrics(),
      impact: {
        ...catalog.impact,
        whyAdded: spec.whyAdded ?? catalog.impact.whyAdded,
      },
      mockPayloads: {
        successResponse: spec.mockPayloads?.successResponse ?? catalog.mockPayloads.successResponse,
        degradedResponse:
          spec.mockPayloads?.degradedResponse ?? catalog.mockPayloads.degradedResponse,
        errorResponse: spec.mockPayloads?.errorResponse ?? catalog.mockPayloads.errorResponse,
      },
    },
  };
}

function buildEdge(spec: BlueprintEdgeSpec, idx: number): SystemEdge {
  return {
    id: `e-${spec.source}-${spec.target}-${idx}`,
    source: spec.source,
    target: spec.target,
    type: 'animatedTraffic',
    animated: true,
    data: {
      activeRps: 0,
      droppedRps: 0,
      packetSpeedMs: 1400,
      healthColor: '#10b981',
      status: 'IDLE',
      edgeLabel: spec.edgeLabel,
    },
  };
}

function buildBlueprint(
  meta: Omit<SystemBlueprint, 'nodes' | 'edges'>,
  nodeSpecs: BlueprintNodeSpec[],
  edgeSpecs: BlueprintEdgeSpec[],
): SystemBlueprint {
  return {
    ...meta,
    nodes: nodeSpecs.map(buildNode),
    edges: edgeSpecs.map(buildEdge),
  };
}

export const REAL_WORLD_PLAYGROUND_BLUEPRINTS: Record<string, SystemBlueprint> = {
  'zepto-blinkit-instamart': buildBlueprint(
    {
      id: 'zepto-blinkit-instamart',
      name: 'Quick-Commerce 10-Min Delivery (Zepto / Blinkit)',
      shortName: 'Quick-Commerce 10m',
      scaleTag: '50K RPS Browse · 5K Orders/s · Dark-Store Sharded',
      description:
        'Hyperlocal 10-minute delivery architecture combining H3/S2 dark-store geofencing, atomic Redis SKU locks, PostgreSQL Transactional Outbox checkout, WMS picker orchestration, and live rider dispatch.',
      recommendedEntryRps: 28_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'Edge CDN & Geo-Routed API Gateway',
          tier: 'Edge & Geo Ingress',
          description:
            'Cloudflare CDN serves product thumbnails at <12ms while API Gateway resolves user lat/lng to the nearest active dark store polygon before routing.',
          highlightNodeIds: ['qc-client', 'qc-cdn', 'qc-gw'],
        },
        {
          step: 2,
          title: 'Dark-Store Catalog & Atomic Redis Inventory',
          tier: 'Catalog & Cache',
          description:
            'Redis Cluster partitioned by dark_store_id serves 92% of catalog reads in <2ms and executes atomic Lua DECR stock checks before checkout.',
          highlightNodeIds: ['qc-catalog', 'qc-redis'],
        },
        {
          step: 3,
          title: 'ACID Order Commit & Outbox Relay',
          tier: 'Checkout & Ledger',
          description:
            'Order Service writes order + stock reservation + outbox row inside one PostgreSQL ACID transaction sharded by dark_store_id to guarantee zero overselling.',
          highlightNodeIds: ['qc-order', 'qc-pg', 'qc-kafka'],
        },
        {
          step: 4,
          title: 'WMS Picking, ETA ML & Rider WebSocket Tracking',
          tier: 'Fulfillment & Dispatch',
          description:
            'Kafka fans out order.confirmed to dark-store picker handhelds, ML ETA predictors, and the WebSocket hub streaming live rider coordinates.',
          highlightNodeIds: ['qc-wms', 'qc-ml', 'qc-ws', 'qc-mon'],
        },
      ],
    },
    [
      { id: 'qc-client', type: 'client', label: 'Quick-Commerce App', subtitle: 'iOS / Android Geo GPS', x: 40, y: 230, whyAdded: 'Sends user GPS polygon, cart checkout with Idempotency-Key, and subscribes to live rider ETA.' },
      { id: 'qc-cdn', type: 'cdn', label: 'Edge CDN & SKU Media', subtitle: '96% Image Cache Hit', x: 310, y: 110, config: { replicas: 4, maxRpsPerReplica: 150_000, baseLatencyMs: 6, cacheHitRatio: 0.88 } },
      { id: 'qc-gw', type: 'api_gateway', label: 'Geo-Aware API Gateway', subtitle: 'H3 Store Polygon + JWT', x: 310, y: 290, config: { replicas: 5, maxRpsPerReplica: 40_000, baseLatencyMs: 8 } },
      { id: 'qc-catalog', type: 'app_server', label: 'Dark-Store Catalog Svc', subtitle: 'Go Microservice', x: 610, y: 130, config: { replicas: 6, maxRpsPerReplica: 18_000, baseLatencyMs: 12, runtime: 'Go 1.23' } },
      { id: 'qc-order', type: 'app_server', label: 'Checkout & Outbox Svc', subtitle: 'Idempotent Order Engine', x: 610, y: 330, config: { replicas: 6, maxRpsPerReplica: 9_000, baseLatencyMs: 22, runtime: 'Java 21' } },
      { id: 'qc-redis', type: 'redis', label: 'Redis Dark-Store Cluster', subtitle: 'CRC16 {storeId} + Lua DECR', x: 920, y: 130, config: { replicas: 6, maxRpsPerReplica: 140_000, baseLatencyMs: 2, cacheHitRatio: 0.9 } },
      { id: 'qc-pg', type: 'postgres', label: 'PostgreSQL Store Shards', subtitle: 'ACID Stock + Outbox WAL', x: 920, y: 330, config: { replicas: 4, maxRpsPerReplica: 8_000, baseLatencyMs: 18, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'qc-kafka', type: 'kafka', label: 'Kafka Order Event Bus', subtitle: 'CDC Outbox -> Fulfillment', x: 1230, y: 240, config: { replicas: 4, maxRpsPerReplica: 90_000, baseLatencyMs: 5, partitions: 64 } },
      { id: 'qc-wms', type: 'worker', label: 'WMS Picker & Dispatch', subtitle: '90-Sec Bin Picking SLA', x: 1530, y: 110, config: { replicas: 5, maxRpsPerReplica: 12_000, baseLatencyMs: 18 } },
      { id: 'qc-ml', type: 'ml_inference', label: '10-Min ETA & Clubbing ML', subtitle: 'Prep + Route Optimizer', x: 1530, y: 260, config: { replicas: 4, maxRpsPerReplica: 8_000, baseLatencyMs: 28 } },
      { id: 'qc-ws', type: 'websocket_gateway', label: 'Live Rider Map WS Hub', subtitle: '1Hz GPS Push to Buyers', x: 1530, y: 410, config: { replicas: 4, maxRpsPerReplica: 45_000, baseLatencyMs: 6 } },
      { id: 'qc-mon', type: 'monitoring', label: 'Dark-Store SLA Telemetry', subtitle: 'Stockout & Breach Alerts', x: 1230, y: 430, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'qc-client', target: 'qc-cdn', edgeLabel: 'SKU Media' },
      { source: 'qc-client', target: 'qc-gw', edgeLabel: 'Browse & Buy' },
      { source: 'qc-gw', target: 'qc-catalog', edgeLabel: 'Store Catalog' },
      { source: 'qc-gw', target: 'qc-order', edgeLabel: 'POST /checkout' },
      { source: 'qc-catalog', target: 'qc-redis', edgeLabel: '92% Cache Hit' },
      { source: 'qc-order', target: 'qc-redis', edgeLabel: 'Lua Stock Check' },
      { source: 'qc-order', target: 'qc-pg', edgeLabel: 'ACID + Outbox' },
      { source: 'qc-pg', target: 'qc-kafka', edgeLabel: 'Debezium CDC' },
      { source: 'qc-kafka', target: 'qc-wms', edgeLabel: 'Pick Task' },
      { source: 'qc-kafka', target: 'qc-ml', edgeLabel: 'Clubbing & ETA' },
      { source: 'qc-kafka', target: 'qc-ws', edgeLabel: 'Live Map' },
      { source: 'qc-order', target: 'qc-mon' },
    ],
  ),

  'irctc-tatkal': buildBlueprint(
    {
      id: 'irctc-tatkal',
      name: 'IRCTC Railway & Tatkal 10:00 AM Flash-Sale Engine',
      shortName: 'IRCTC Tatkal',
      scaleTag: '30K Tickets/Min · 10:00 AM Burst · Zero Double-Allotment',
      description:
        'Extreme-contention train berth booking architecture using virtual waiting-room admission control, Redis segment-bitmask locks, single-writer train-date partition actors, and ACID PNR persistence.',
      recommendedEntryRps: 45_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'Bot Shield & Virtual Waiting Room Gate',
          tier: 'Burst Admission',
          description:
            'At 10:00:00 AM IST traffic spikes 100x. Edge Rate Limiter and Captcha Auth shed automated bots and meter humans through a FIFO admission token queue.',
          highlightNodeIds: ['ir-client', 'ir-rl', 'ir-auth', 'ir-gw'],
        },
        {
          step: 2,
          title: 'Route-Segment Availability Cache & Coach Partitioning',
          tier: 'Contention Isolation',
          description:
            'Dynamic Router consistently hashes requests by (train_id, travel_date, class) so one popular Rajdhani train never starves other trains.',
          highlightNodeIds: ['ir-router', 'ir-redis'],
        },
        {
          step: 3,
          title: 'Deterministic Berth Lock & ACID PNR Commit',
          tier: 'Zero Double-Booking',
          description:
            'Booking Engine checks bitwise station-segment overlap, places a 7-minute Redis lease, and commits PNR + coach inventory in Oracle/Postgres.',
          highlightNodeIds: ['ir-book', 'ir-oracle'],
        },
        {
          step: 4,
          title: 'Payment Webhook, RAC/WL Queue & Charting',
          tier: 'Async Settlement',
          description:
            'Kafka handles payment gateway callbacks, auto-upgrades RAC/Waitlist tickets on cancellations, and dispatches SMS/email e-tickets.',
          highlightNodeIds: ['ir-kafka', 'ir-worker', 'ir-mon'],
        },
      ],
    },
    [
      { id: 'ir-client', type: 'client', label: 'IRCTC Web & RailConnect', subtitle: '10:00 AM Tatkal Burst', x: 40, y: 230 },
      { id: 'ir-rl', type: 'rate_limiter', label: 'Waiting Room & Bot WAF', subtitle: 'FIFO Token Admission', x: 310, y: 230, config: { replicas: 6, maxRpsPerReplica: 120_000, rateLimitRps: 80_000, baseLatencyMs: 4 } },
      { id: 'ir-auth', type: 'auth_provider', label: 'Captcha & Session Guard', subtitle: 'Anti-Touts Verification', x: 580, y: 60, config: { replicas: 5, maxRpsPerReplica: 35_000, baseLatencyMs: 14 } },
      { id: 'ir-gw', type: 'api_gateway', label: 'Reservation API Gateway', subtitle: 'Strict Timeout Budgets', x: 580, y: 230, config: { replicas: 5, maxRpsPerReplica: 45_000, baseLatencyMs: 7 } },
      { id: 'ir-router', type: 'dynamic_router', label: 'Train-Date Partition Router', subtitle: 'Hash(trainId + date)', x: 860, y: 230, config: { replicas: 5, maxRpsPerReplica: 60_000, baseLatencyMs: 4, routingAlgo: 'CONSISTENT_HASH' } },
      { id: 'ir-redis', type: 'redis', label: 'Redis Berth Bitmask Locks', subtitle: 'Segment Overlap + TTL', x: 1150, y: 80, config: { replicas: 6, maxRpsPerReplica: 150_000, baseLatencyMs: 2, cacheHitRatio: 0.88 } },
      { id: 'ir-book', type: 'app_server', label: 'Berth Allocation Engine', subtitle: 'Single-Writer per Train', x: 1150, y: 250, config: { replicas: 8, maxRpsPerReplica: 9_000, baseLatencyMs: 18, runtime: 'Java 21 / C++' } },
      { id: 'ir-oracle', type: 'oracle', label: 'Core PNR & Coach Ledger', subtitle: 'Partitioned ACID RDBMS', x: 1450, y: 170, config: { replicas: 4, maxRpsPerReplica: 7_500, baseLatencyMs: 22, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'ir-kafka', type: 'kafka', label: 'Payment & WL Upgrade Bus', subtitle: 'Async Settlement + RAC', x: 1450, y: 360, config: { replicas: 4, maxRpsPerReplica: 80_000, baseLatencyMs: 5, partitions: 48 } },
      { id: 'ir-worker', type: 'worker', label: 'Ticket PDF & SMS Worker', subtitle: 'PNR Confirmation + WL', x: 1740, y: 360, config: { replicas: 5, maxRpsPerReplica: 12_000, baseLatencyMs: 25 } },
      { id: 'ir-mon', type: 'monitoring', label: 'Tatkal Window SLO Radar', subtitle: 'Lock Contention & Queue', x: 1150, y: 430, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'ir-client', target: 'ir-rl', edgeLabel: 'Burst Traffic' },
      { source: 'ir-rl', target: 'ir-gw', edgeLabel: 'Admitted Queue' },
      { source: 'ir-gw', target: 'ir-auth', edgeLabel: 'Captcha Check' },
      { source: 'ir-gw', target: 'ir-router', edgeLabel: 'Train Query/Book' },
      { source: 'ir-router', target: 'ir-redis', edgeLabel: 'Seat Bitmap' },
      { source: 'ir-router', target: 'ir-book', edgeLabel: 'Reserve Berth' },
      { source: 'ir-book', target: 'ir-redis', edgeLabel: '7m Hold Lock' },
      { source: 'ir-book', target: 'ir-oracle', edgeLabel: 'ACID PNR' },
      { source: 'ir-book', target: 'ir-kafka', edgeLabel: 'Payment & WL' },
      { source: 'ir-kafka', target: 'ir-worker', edgeLabel: 'E-Ticket + SMS' },
      { source: 'ir-book', target: 'ir-mon' },
    ],
  ),

  'bookmyshow-ticketing': buildBlueprint(
    {
      id: 'bookmyshow-ticketing',
      name: 'BookMyShow Cinema & Mega-Concert Seat-Lock Engine',
      shortName: 'BookMyShow',
      scaleTag: '2M Waiting-Room Fans · Fencing Tokens · 10m Hold TTL',
      description:
        'High-demand stadium & cinema ticketing platform combining a CDN-backed virtual queue, Redis Redlock/Lua fencing-token seat holds, PostgreSQL unique booking constraints, and live seat-map broadcasts.',
      recommendedEntryRps: 38_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'CDN Static Showtimes & Virtual Waiting Queue',
          tier: 'Edge Absorption',
          description:
            'CloudFront caches concert pages & seat layouts while the Virtual Queue Rate Limiter absorbs 2M fans clicking "Book" simultaneously.',
          highlightNodeIds: ['bms-client', 'bms-cdn', 'bms-rl', 'bms-gw'],
        },
        {
          step: 2,
          title: 'Atomic Redis Seat Hold with Fencing Token',
          tier: 'Seat Locking',
          description:
            'Selecting seats runs an atomic Redis Lua script setting a 10-minute TTL lock + monotonic fencing token so expired holds can never overwrite new buyers.',
          highlightNodeIds: ['bms-seat', 'bms-redis'],
        },
        {
          step: 3,
          title: 'PostgreSQL Unique Seat Constraint & Payment Callback',
          tier: 'ACID Finalization',
          description:
            'PostgreSQL enforces UNIQUE(show_id, seat_id) with fencing-token validation before issuing signed QR passes.',
          highlightNodeIds: ['bms-pg', 'bms-kafka'],
        },
        {
          step: 4,
          title: 'Real-Time Seat-Map Diff Broadcast & QR Delivery',
          tier: 'Live UX & Egress',
          description:
            'WebSockets push seat state transitions (AVAILABLE -> HELD -> SOLD) to viewers while workers release expired holds and send QR passes.',
          highlightNodeIds: ['bms-ws', 'bms-worker', 'bms-mon'],
        },
      ],
    },
    [
      { id: 'bms-client', type: 'client', label: 'BookMyShow App / Web', subtitle: 'Concert & Cinema Fans', x: 40, y: 230 },
      { id: 'bms-cdn', type: 'cdn', label: 'Edge CDN Show Catalog', subtitle: 'Static Layouts & Posters', x: 310, y: 90, config: { replicas: 4, maxRpsPerReplica: 160_000, baseLatencyMs: 5, cacheHitRatio: 0.9 } },
      { id: 'bms-rl', type: 'rate_limiter', label: 'Virtual Waiting Room', subtitle: 'Signed Queue Pass Token', x: 310, y: 270, config: { replicas: 6, maxRpsPerReplica: 150_000, rateLimitRps: 70_000, baseLatencyMs: 4 } },
      { id: 'bms-gw', type: 'api_gateway', label: 'Ticketing API Gateway', subtitle: 'Queue Pass Validator', x: 590, y: 270, config: { replicas: 5, maxRpsPerReplica: 45_000, baseLatencyMs: 7 } },
      { id: 'bms-seat', type: 'app_server', label: 'Seat-Lock & Checkout Svc', subtitle: 'Fencing Token Engine', x: 890, y: 230, config: { replicas: 7, maxRpsPerReplica: 11_000, baseLatencyMs: 16, runtime: 'Go / Node' } },
      { id: 'bms-redis', type: 'redis', label: 'Redis Seat Hold Cluster', subtitle: 'Lua Hold + 10m TTL', x: 1190, y: 100, config: { replicas: 5, maxRpsPerReplica: 150_000, baseLatencyMs: 2, cacheHitRatio: 0.9 } },
      { id: 'bms-pg', type: 'postgres', label: 'PostgreSQL Bookings DB', subtitle: 'UNIQUE(show,seat) ACID', x: 1190, y: 280, config: { replicas: 4, maxRpsPerReplica: 8_500, baseLatencyMs: 16, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'bms-kafka', type: 'kafka', label: 'Seat & Payment Events', subtitle: 'Hold Expiry + Settlement', x: 1490, y: 230, config: { replicas: 4, maxRpsPerReplica: 80_000, baseLatencyMs: 5, partitions: 48 } },
      { id: 'bms-ws', type: 'websocket_gateway', label: 'Live Seat-Map Broadcast', subtitle: 'Real-Time Color Updates', x: 1780, y: 130, config: { replicas: 4, maxRpsPerReplica: 50_000, baseLatencyMs: 6 } },
      { id: 'bms-worker', type: 'worker', label: 'QR Ticket & Expiry Sweeper', subtitle: 'Release Unpaid Holds', x: 1780, y: 310, config: { replicas: 4, maxRpsPerReplica: 12_000, baseLatencyMs: 22 } },
      { id: 'bms-mon', type: 'monitoring', label: 'Concert Drop Monitor', subtitle: 'Queue Wait & Lock Drift', x: 890, y: 420, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'bms-client', target: 'bms-cdn', edgeLabel: 'Show Info' },
      { source: 'bms-client', target: 'bms-rl', edgeLabel: 'Join Queue' },
      { source: 'bms-rl', target: 'bms-gw', edgeLabel: 'Queue Pass' },
      { source: 'bms-gw', target: 'bms-seat', edgeLabel: 'Hold/Confirm' },
      { source: 'bms-seat', target: 'bms-redis', edgeLabel: 'Lua Seat Lock' },
      { source: 'bms-seat', target: 'bms-pg', edgeLabel: 'ACID Confirm' },
      { source: 'bms-seat', target: 'bms-kafka', edgeLabel: 'Seat Events' },
      { source: 'bms-kafka', target: 'bms-ws', edgeLabel: 'Map Diffs' },
      { source: 'bms-kafka', target: 'bms-worker', edgeLabel: 'QR & Expiry' },
      { source: 'bms-seat', target: 'bms-mon' },
    ],
  ),

  'flight-booking-gds': buildBlueprint(
    {
      id: 'flight-booking-gds',
      name: 'Flight Booking, Exchange & GDS (Amadeus / Sabre)',
      shortName: 'Flight GDS',
      scaleTag: '25K Search/s · Multi-Leg Pricing · Atomic PNR Reissue',
      description:
        'Global Distribution System (GDS) architecture bridging OTA fare search caches, real-time airline PSS availability feeds, EDIFACT/NDC booking sagas, and atomic ticket exchange/reissue workflows.',
      recommendedEntryRps: 22_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'OTA Ingress, Auth & Fare Search Fan-Out',
          tier: 'Search & Caching',
          description:
            'Search requests hit Redis fare-calendar caches first (94% hit rate) to avoid expensive per-call GDS look-to-book penalties.',
          highlightNodeIds: ['fl-client', 'fl-gw', 'fl-search', 'fl-redis'],
        },
        {
          step: 2,
          title: 'Live Airline Inventory & Fare Rule Re-Price',
          tier: 'GDS Verification',
          description:
            'Before charging a card, the Booking Saga re-prices live fare classes (Y/B/M) against Airline PSS via Dynamic Router to prevent stale-fare failures.',
          highlightNodeIds: ['fl-book', 'fl-router'],
        },
        {
          step: 3,
          title: 'ACID PNR Ledger & Atomic Exchange/Reissue Saga',
          tier: 'PNR & Ticketing',
          description:
            'PostgreSQL persists PNR snapshots and e-ticket coupon states (OPEN -> EXCHANGED -> FLOWN) while compensating sagas auto-void partial holds on failure.',
          highlightNodeIds: ['fl-pg', 'fl-kafka'],
        },
        {
          step: 4,
          title: 'Schedule-Change Sync, Refund Workers & Tracing',
          tier: 'Settlement & Ops',
          description:
            'Kafka streams airline schedule changes, BSP/ARC settlement ledgers, and e-ticket PDFs with full OpenTelemetry trace correlation.',
          highlightNodeIds: ['fl-worker', 'fl-es', 'fl-trace'],
        },
      ],
    },
    [
      { id: 'fl-client', type: 'client', label: 'OTA / Airline Portal', subtitle: 'Search, Book & Reissue', x: 40, y: 230 },
      { id: 'fl-gw', type: 'api_gateway', label: 'NDC / OTA API Gateway', subtitle: 'Partner Quotas & OAuth2', x: 320, y: 230, config: { replicas: 4, maxRpsPerReplica: 40_000, baseLatencyMs: 8 } },
      { id: 'fl-search', type: 'app_server', label: 'Multi-Leg Fare Graph Svc', subtitle: 'Dijkstra Itinerary Pricer', x: 620, y: 120, config: { replicas: 6, maxRpsPerReplica: 14_000, baseLatencyMs: 26, runtime: 'C++ / Rust' } },
      { id: 'fl-book', type: 'app_server', label: 'PNR & Exchange Saga Svc', subtitle: 'Hold -> Charge -> Issue', x: 620, y: 330, config: { replicas: 5, maxRpsPerReplica: 7_500, baseLatencyMs: 34, runtime: 'Java 21' } },
      { id: 'fl-redis', type: 'redis', label: 'Fare Calendar Cache', subtitle: '94% Look-to-Book Shield', x: 930, y: 70, config: { replicas: 5, maxRpsPerReplica: 140_000, baseLatencyMs: 2, cacheHitRatio: 0.92 } },
      { id: 'fl-es', type: 'elasticsearch', label: 'Route & Fare Rule Index', subtitle: 'ATPCO Rules & Layovers', x: 930, y: 200, config: { replicas: 4, maxRpsPerReplica: 16_000, baseLatencyMs: 18 } },
      { id: 'fl-router', type: 'dynamic_router', label: 'Airline PSS / GDS Switch', subtitle: 'Amadeus / Sabre / NDC', x: 930, y: 360, config: { replicas: 4, maxRpsPerReplica: 25_000, baseLatencyMs: 42, routingAlgo: 'CONSISTENT_HASH' } },
      { id: 'fl-pg', type: 'postgres', label: 'PNR & E-Ticket Ledger', subtitle: 'Coupon State Machine DB', x: 1240, y: 250, config: { replicas: 4, maxRpsPerReplica: 8_000, baseLatencyMs: 18, replicationMode: 'PRIMARY_REPLICA' } },
      { id: 'fl-kafka', type: 'kafka', label: 'GDS Schedule & BSP Bus', subtitle: 'Reissue & Refund Events', x: 1530, y: 250, config: { replicas: 4, maxRpsPerReplica: 75_000, baseLatencyMs: 5, partitions: 32 } },
      { id: 'fl-worker', type: 'worker', label: 'E-Ticket & Refund Worker', subtitle: 'IATA BSP Settlement', x: 1810, y: 250, config: { replicas: 4, maxRpsPerReplica: 10_000, baseLatencyMs: 30 } },
      { id: 'fl-trace', type: 'tracing', label: 'OTel Multi-GDS Tracer', subtitle: 'Cross-Airline Span Trace', x: 1240, y: 420, config: { replicas: 2, maxRpsPerReplica: 400_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'fl-client', target: 'fl-gw', edgeLabel: 'NDC / REST' },
      { source: 'fl-gw', target: 'fl-search', edgeLabel: 'Search Fares' },
      { source: 'fl-gw', target: 'fl-book', edgeLabel: 'Book / Exchange' },
      { source: 'fl-search', target: 'fl-redis', edgeLabel: '94% Cache' },
      { source: 'fl-search', target: 'fl-es', edgeLabel: 'Fare Rules' },
      { source: 'fl-book', target: 'fl-router', edgeLabel: 'Live PSS Hold' },
      { source: 'fl-book', target: 'fl-pg', edgeLabel: 'ACID PNR' },
      { source: 'fl-book', target: 'fl-kafka', edgeLabel: 'Ticket Events' },
      { source: 'fl-kafka', target: 'fl-worker', edgeLabel: 'BSP / PDF' },
      { source: 'fl-book', target: 'fl-trace' },
    ],
  ),

  'stock-exchange-matching': buildBlueprint(
    {
      id: 'stock-exchange-matching',
      name: 'Stock Exchange Matching Engine (NASDAQ / NSE)',
      shortName: 'Stock Exchange',
      scaleTag: '1M Orders/s · <20µs Core Match · Deterministic Sequencer',
      description:
        'Ultra-low-latency electronic stock exchange featuring kernel-bypass FIX gateways, deterministic LMAX-style single-threaded Limit Order Book (LOB) matching engines, Raft journal replication, and multicast market data feeds.',
      recommendedEntryRps: 65_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'FIX / Binary Ingress & Pre-Trade Risk Gate',
          tier: 'Ultra-Low-Latency Edge',
          description:
            'Brokers submit binary FIX/OUCH orders through dedicated network switches and nanosecond pre-trade fat-finger and circuit-breaker risk checks.',
          highlightNodeIds: ['ex-client', 'ex-switch', 'ex-gw'],
        },
        {
          step: 2,
          title: 'Symbol-Partitioned Sequencer & In-Memory Order Book',
          tier: 'Deterministic Matching',
          description:
            'Dynamic Router pins every ticker symbol (e.g., AAPL, RELIANCE) to a single lock-free CPU-pinned Limit Order Book executing Price-Time Priority (FIFO) matching.',
          highlightNodeIds: ['ex-router', 'ex-engine'],
        },
        {
          step: 3,
          title: 'Append-Only Sequenced Journal & Drop-Copy',
          tier: 'Durability & Replay',
          description:
            'Every order & fill event is written to a replicated append-only log so hot-standby engines replay identically for zero-loss failover.',
          highlightNodeIds: ['ex-kafka', 'ex-oracle'],
        },
        {
          step: 4,
          title: 'Level-2 Market Data Feed & Clearing Settlement',
          tier: 'Market Data & Clearing',
          description:
            'Order book ticks fan out via low-latency WebSocket/UDP feeds while T+1 clearing houses settle trades and surveillance monitors spoofing.',
          highlightNodeIds: ['ex-ws', 'ex-worker', 'ex-mon'],
        },
      ],
    },
    [
      { id: 'ex-client', type: 'client', label: 'Institutional & Broker FIX', subtitle: 'Binary OUCH / FIX 5.0', x: 40, y: 230 },
      { id: 'ex-switch', type: 'network_switch', label: 'Colocation L2 Switch', subtitle: 'Kernel-Bypass DPDK', x: 310, y: 230, config: { replicas: 4, maxRpsPerReplica: 300_000, baseLatencyMs: 1 } },
      { id: 'ex-gw', type: 'api_gateway', label: 'FIX Gateway & Risk Check', subtitle: 'Price-Band & Fat-Finger', x: 590, y: 230, config: { replicas: 6, maxRpsPerReplica: 90_000, baseLatencyMs: 2 } },
      { id: 'ex-router', type: 'dynamic_router', label: 'Symbol Sequencer Router', subtitle: 'Deterministic SeqNo', x: 880, y: 230, config: { replicas: 4, maxRpsPerReplica: 150_000, baseLatencyMs: 1, routingAlgo: 'CONSISTENT_HASH' } },
      { id: 'ex-engine', type: 'app_server', label: 'LMAX Limit Order Book', subtitle: 'Lock-Free Price-Time FIFO', x: 1180, y: 230, config: { replicas: 8, maxRpsPerReplica: 120_000, baseLatencyMs: 1, runtime: 'C++20 / Rust' } },
      { id: 'ex-kafka', type: 'kafka', label: 'Sequenced Execution Log', subtitle: 'Deterministic Replay Bus', x: 1480, y: 230, config: { replicas: 6, maxRpsPerReplica: 180_000, baseLatencyMs: 2, partitions: 128 } },
      { id: 'ex-ws', type: 'websocket_gateway', label: 'L2 Market Data Multicast', subtitle: 'ITCH / Depth-of-Book Feed', x: 1780, y: 90, config: { replicas: 6, maxRpsPerReplica: 120_000, baseLatencyMs: 2 } },
      { id: 'ex-oracle', type: 'oracle', label: 'Clearing & Trade Ledger', subtitle: 'Regulatory Audit Store', x: 1780, y: 250, config: { replicas: 4, maxRpsPerReplica: 25_000, baseLatencyMs: 12, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'ex-worker', type: 'worker', label: 'Surveillance & T+1 Clear', subtitle: 'Wash-Trade & Settlement', x: 1780, y: 410, config: { replicas: 4, maxRpsPerReplica: 25_000, baseLatencyMs: 15 } },
      { id: 'ex-mon', type: 'monitoring', label: 'PTP Microsecond Telemetry', subtitle: 'P99.99 Jitter Watch', x: 1180, y: 420, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 1 } },
    ],
    [
      { source: 'ex-client', target: 'ex-switch', edgeLabel: 'FIX Binary' },
      { source: 'ex-switch', target: 'ex-gw', edgeLabel: 'Pre-Trade Risk' },
      { source: 'ex-gw', target: 'ex-router', edgeLabel: 'Assign SeqNo' },
      { source: 'ex-router', target: 'ex-engine', edgeLabel: 'Symbol Partition' },
      { source: 'ex-engine', target: 'ex-kafka', edgeLabel: 'Match Fills' },
      { source: 'ex-kafka', target: 'ex-ws', edgeLabel: 'L2 Ticks' },
      { source: 'ex-kafka', target: 'ex-oracle', edgeLabel: 'Trade Persist' },
      { source: 'ex-kafka', target: 'ex-worker', edgeLabel: 'T+1 Clearing' },
      { source: 'ex-engine', target: 'ex-mon' },
    ],
  ),

  'zerodha-kite': buildBlueprint(
    {
      id: 'zerodha-kite',
      name: 'Zerodha Kite Retail Brokerage & Live Ticks',
      shortName: 'Zerodha Kite',
      scaleTag: '10M+ Active Traders · 9:15 AM Open · Binary Tick Fan-Out',
      description:
        'High-concurrency retail trading platform combining binary WebSocket market-tick fan-out, sub-5ms in-memory RMS margin verification, Exchange OMS lease-line routing, and post-trade holdings sync.',
      recommendedEntryRps: 50_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: '9:15 AM Market-Open Ingress & Auth Session Shield',
          tier: 'Edge & Auth',
          description:
            'Rate Limiter and API Gateway authenticate millions of simultaneous Kite logins at market open while separating read-only chart/tick streams from order placement.',
          highlightNodeIds: ['zk-client', 'zk-rl', 'zk-gw', 'zk-auth'],
        },
        {
          step: 2,
          title: 'Binary WebSocket Market-Tick Fan-Out',
          tier: 'Real-Time Ticks',
          description:
            'Redis Pub/Sub feeds compact 44-byte binary tick frames to horizontally scaled Go WebSocket gateways supporting millions of concurrent subscriptions.',
          highlightNodeIds: ['zk-redis', 'zk-ws'],
        },
        {
          step: 3,
          title: 'In-Memory RMS Margin Check & Exchange OMS Routing',
          tier: 'Risk & Order Routing',
          description:
            'OMS validates real-time collateral/margin in Redis (<3ms) before routing throttled orders over NSE/BSE leased lines via Dynamic Router.',
          highlightNodeIds: ['zk-oms', 'zk-router', 'zk-pg'],
        },
        {
          step: 4,
          title: 'Fill Webhooks, P&L Holdings & Contract Notes',
          tier: 'Post-Trade Pipeline',
          description:
            'Kafka streams exchange fill callbacks back to client WebSockets, updates PostgreSQL holdings/positions, and generates end-of-day contract notes.',
          highlightNodeIds: ['zk-kafka', 'zk-worker', 'zk-mon'],
        },
      ],
    },
    [
      { id: 'zk-client', type: 'client', label: 'Kite Web & Mobile Apps', subtitle: 'Live Charts + Instant Orders', x: 40, y: 230 },
      { id: 'zk-rl', type: 'rate_limiter', label: 'Order & Login Rate Guard', subtitle: 'Per-User Token Bucket', x: 310, y: 230, config: { replicas: 5, maxRpsPerReplica: 120_000, rateLimitRps: 90_000, baseLatencyMs: 3 } },
      { id: 'zk-gw', type: 'api_gateway', label: 'Kite OMS API Gateway', subtitle: 'JWT + TOTP Session Check', x: 590, y: 230, config: { replicas: 5, maxRpsPerReplica: 50_000, baseLatencyMs: 6 } },
      { id: 'zk-auth', type: 'auth_provider', label: '2FA TOTP & Device Auth', subtitle: 'SEBI Compliant Session', x: 590, y: 50, config: { replicas: 4, maxRpsPerReplica: 40_000, baseLatencyMs: 10 } },
      { id: 'zk-oms', type: 'app_server', label: 'OMS & RMS Margin Engine', subtitle: 'Sub-5ms Collateral Check', x: 890, y: 230, config: { replicas: 7, maxRpsPerReplica: 15_000, baseLatencyMs: 10, runtime: 'Go 1.23' } },
      { id: 'zk-redis', type: 'redis', label: 'Redis Margin & Tick Cache', subtitle: 'Real-Time Collateral + LTP', x: 1190, y: 80, config: { replicas: 6, maxRpsPerReplica: 180_000, baseLatencyMs: 2, cacheHitRatio: 0.92 } },
      { id: 'zk-ws', type: 'websocket_gateway', label: 'Kite Ticker Binary WS', subtitle: '44-Byte Binary Tick Push', x: 1500, y: 80, config: { replicas: 8, maxRpsPerReplica: 90_000, baseLatencyMs: 3 } },
      { id: 'zk-router', type: 'dynamic_router', label: 'NSE / BSE Lease-Line Switch', subtitle: 'Throttled Exchange Tap', x: 1190, y: 250, config: { replicas: 4, maxRpsPerReplica: 50_000, baseLatencyMs: 6, routingAlgo: 'LEAST_CONN' } },
      { id: 'zk-pg', type: 'postgres', label: 'Orders & Holdings Ledger', subtitle: 'Partitioned ACID DB', x: 1500, y: 250, config: { replicas: 4, maxRpsPerReplica: 10_000, baseLatencyMs: 14, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'zk-kafka', type: 'kafka', label: 'Trade Fill & Alert Bus', subtitle: 'Positions + GTT Triggers', x: 1190, y: 410, config: { replicas: 4, maxRpsPerReplica: 90_000, baseLatencyMs: 4, partitions: 48 } },
      { id: 'zk-worker', type: 'worker', label: 'EOD Settlement & Reports', subtitle: 'Contract Notes + Tax P&L', x: 1500, y: 410, config: { replicas: 4, maxRpsPerReplica: 14_000, baseLatencyMs: 24 } },
      { id: 'zk-mon', type: 'monitoring', label: 'Exchange Tap SLO Monitor', subtitle: 'Tick Lag & RMS Latency', x: 890, y: 410, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'zk-client', target: 'zk-rl', edgeLabel: 'Orders & Ticks' },
      { source: 'zk-rl', target: 'zk-gw', edgeLabel: 'Throttled API' },
      { source: 'zk-gw', target: 'zk-auth', edgeLabel: 'TOTP Verify' },
      { source: 'zk-gw', target: 'zk-oms', edgeLabel: 'Place Order' },
      { source: 'zk-oms', target: 'zk-redis', edgeLabel: 'RMS Margin' },
      { source: 'zk-redis', target: 'zk-ws', edgeLabel: '44B Binary Ticks' },
      { source: 'zk-oms', target: 'zk-router', edgeLabel: 'NSE/BSE Tap' },
      { source: 'zk-router', target: 'zk-pg', edgeLabel: 'Fill Persist' },
      { source: 'zk-oms', target: 'zk-kafka', edgeLabel: 'Order Updates' },
      { source: 'zk-kafka', target: 'zk-worker', edgeLabel: 'Holdings Sync' },
      { source: 'zk-oms', target: 'zk-mon' },
    ],
  ),

  'chatgpt-google-gemini': buildBlueprint(
    {
      id: 'chatgpt-google-gemini',
      name: 'ChatGPT, Gemini & Claude Global LLM Serving',
      shortName: 'Frontier LLM',
      scaleTag: 'Continuous Batching · PagedAttention KV · HTTP/2 SSE Tokens',
      description:
        'Production frontier LLM inference platform combining TPM/RPM edge rate limiting, prefix KV-cache-aware routing, disaggregated Prefill/Decode GPU/TPU clusters, RAG vector retrieval, and HTTP/2 SSE token streaming.',
      recommendedEntryRps: 24_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'HTTP/2 SSE Edge Gateway & TPM Token-Bucket Quota',
          tier: 'Client Stream & Auth',
          description:
            'Clients open persistent TLS 1.3 HTTP/2 streams. Edge Gateway verifies API keys and enforces both Requests-Per-Minute (RPM) and Tokens-Per-Minute (TPM) quotas.',
          highlightNodeIds: ['llm-client', 'llm-rl', 'llm-gw', 'llm-auth'],
        },
        {
          step: 2,
          title: 'Prompt Assembly, Safety & RAG Vector Retrieval',
          tier: 'Context Enrichment',
          description:
            'Orchestrator loads conversation history, fetches top-K semantic chunks from the HNSW Vector DB, and checks prefix KV-cache fingerprints.',
          highlightNodeIds: ['llm-orch', 'llm-vec', 'llm-redis'],
        },
        {
          step: 3,
          title: 'Prefix-Aware Router & Disaggregated GPU/TPU Inference',
          tier: 'Prefill + Decode',
          description:
            'KV-Cache Router pins prompts with shared system prefixes to warm GPU/TPU replicas running FlashAttention, Sparse MoE, PagedAttention, and Continuous Batching.',
          highlightNodeIds: ['llm-router', 'llm-gpu'],
        },
        {
          step: 4,
          title: 'Detokenizer SSE Stream, Metering & Eval Logs',
          tier: 'Token Float & Ops',
          description:
            'Sampled token IDs stream out chunk-by-chunk over SSE (`data: {"delta":"..."}`) at <30ms inter-token latency while Kafka meters exact token billing.',
          highlightNodeIds: ['llm-ws', 'llm-kafka', 'llm-pg', 'llm-mon'],
        },
      ],
    },
    [
      { id: 'llm-client', type: 'client', label: 'Chat Web / Mobile / SDK', subtitle: 'ReadableStream SSE Buyer', x: 40, y: 230 },
      { id: 'llm-rl', type: 'rate_limiter', label: 'TPM & RPM Quota Guard', subtitle: 'Redis Token-Bucket', x: 310, y: 230, config: { replicas: 5, maxRpsPerReplica: 100_000, rateLimitRps: 60_000, baseLatencyMs: 3 } },
      { id: 'llm-gw', type: 'api_gateway', label: 'HTTP/2 SSE Edge Proxy', subtitle: 'Zero-Buffer Flush + TLS 1.3', x: 590, y: 230, config: { replicas: 6, maxRpsPerReplica: 45_000, baseLatencyMs: 5 } },
      { id: 'llm-auth', type: 'auth_provider', label: 'API Key & Safety Guard', subtitle: 'Policy + Prompt Shield', x: 590, y: 50, config: { replicas: 4, maxRpsPerReplica: 40_000, baseLatencyMs: 9 } },
      { id: 'llm-orch', type: 'app_server', label: 'Tokenizer & RAG Orchestrator', subtitle: 'BPE / SentencePiece', x: 890, y: 230, config: { replicas: 6, maxRpsPerReplica: 16_000, baseLatencyMs: 12, runtime: 'Rust / Python' } },
      { id: 'llm-vec', type: 'vector_db', label: 'HNSW Semantic Vector DB', subtitle: 'RAG + Long-Term Memory', x: 1180, y: 60, config: { replicas: 4, maxRpsPerReplica: 18_000, baseLatencyMs: 14 } },
      { id: 'llm-redis', type: 'redis', label: 'Radix Prefix KV Index', subtitle: 'Prompt Prefix Cache Map', x: 1180, y: 210, config: { replicas: 5, maxRpsPerReplica: 150_000, baseLatencyMs: 2, cacheHitRatio: 0.78 } },
      { id: 'llm-router', type: 'dynamic_router', label: 'KV-Cache Locality Router', subtitle: 'Prefill -> Decode Pool', x: 1180, y: 370, config: { replicas: 5, maxRpsPerReplica: 50_000, baseLatencyMs: 4, routingAlgo: 'CONSISTENT_HASH' } },
      { id: 'llm-gpu', type: 'ml_inference', label: 'GPU / TPU MoE Cluster', subtitle: 'PagedAttention + FlashAttn', x: 1490, y: 240, config: { replicas: 8, maxRpsPerReplica: 6_500, baseLatencyMs: 48, gpuBatchSize: 64 } },
      { id: 'llm-ws', type: 'websocket_gateway', label: 'SSE Detokenizer Streamer', subtitle: 'Token-by-Token Delta Push', x: 1790, y: 120, config: { replicas: 6, maxRpsPerReplica: 60_000, baseLatencyMs: 4 } },
      { id: 'llm-kafka', type: 'kafka', label: 'Token Metering & Audit Bus', subtitle: 'Billing + Eval Pipeline', x: 1790, y: 290, config: { replicas: 4, maxRpsPerReplica: 80_000, baseLatencyMs: 5, partitions: 48 } },
      { id: 'llm-pg', type: 'postgres', label: 'Thread & Usage Store', subtitle: 'Encrypted Chat History', x: 1790, y: 440, config: { replicas: 4, maxRpsPerReplica: 12_000, baseLatencyMs: 12, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'llm-mon', type: 'monitoring', label: 'TTFT & ITL Token SLOs', subtitle: 'HBM KV-Cache Utilization', x: 1490, y: 440, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'llm-client', target: 'llm-rl', edgeLabel: 'POST /chat' },
      { source: 'llm-rl', target: 'llm-gw', edgeLabel: 'TPM Allowed' },
      { source: 'llm-gw', target: 'llm-auth', edgeLabel: 'Auth + Safety' },
      { source: 'llm-gw', target: 'llm-orch', edgeLabel: 'Tokenize' },
      { source: 'llm-orch', target: 'llm-vec', edgeLabel: 'RAG Top-K' },
      { source: 'llm-orch', target: 'llm-redis', edgeLabel: 'Prefix Hit?' },
      { source: 'llm-orch', target: 'llm-router', edgeLabel: 'Route Shard' },
      { source: 'llm-router', target: 'llm-gpu', edgeLabel: 'Prefill/Decode' },
      { source: 'llm-gpu', target: 'llm-ws', edgeLabel: 'SSE Tokens' },
      { source: 'llm-gpu', target: 'llm-kafka', edgeLabel: 'Usage Meter' },
      { source: 'llm-kafka', target: 'llm-pg', edgeLabel: 'Save Thread' },
      { source: 'llm-gpu', target: 'llm-mon' },
    ],
  ),

  'slack-ms-teams': buildBlueprint(
    {
      id: 'slack-ms-teams',
      name: 'Slack & MS Teams Multi-Tenant Workspace & Huddles',
      shortName: 'Slack / Teams',
      scaleTag: '20M+ Concurrent Sockets · Flannel Edge Cache · WebRTC SFU',
      description:
        'Enterprise multi-tenant real-time collaboration architecture using workspace-sharded channel servers, Flannel edge metadata caches, Kafka fan-out, Elasticsearch message search, and WebRTC SFU audio/video rooms.',
      recommendedEntryRps: 42_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'Flannel Edge Cache & Persistent WebSocket Gateway',
          tier: 'Edge Presence',
          description:
            'Clients bootstrap workspace metadata from regional Flannel Redis edge caches instead of thundering-herding origin databases on reconnect.',
          highlightNodeIds: ['sl-client', 'sl-gw', 'sl-ws', 'sl-redis'],
        },
        {
          step: 2,
          title: 'Workspace-Sharded Channel Router & Message Store',
          tier: 'Multi-Tenant Core',
          description:
            'Dynamic Router maps every workspace_id to isolated Vitess/PostgreSQL shards so a noisy 100K-employee org never degrades other tenants.',
          highlightNodeIds: ['sl-router', 'sl-app', 'sl-pg'],
        },
        {
          step: 3,
          title: 'Async Fan-Out, Mentions & Full-Text Search Index',
          tier: 'Search & Delivery',
          description:
            'Kafka fans out messages to online WebSocket gateways, mobile push workers, and per-workspace Elasticsearch search indexes.',
          highlightNodeIds: ['sl-kafka', 'sl-es', 'sl-worker'],
        },
        {
          step: 4,
          title: 'WebRTC SFU Media Huddles & S3 File Vault',
          tier: 'Files & Media',
          description:
            'Large file uploads go directly to S3 via presigned URLs while WebRTC SFU nodes forward encrypted audio/video streams without decoding.',
          highlightNodeIds: ['sl-s3', 'sl-mon'],
        },
      ],
    },
    [
      { id: 'sl-client', type: 'client', label: 'Slack / Teams Desktop', subtitle: 'WSS + WebRTC Huddles', x: 40, y: 230 },
      { id: 'sl-gw', type: 'api_gateway', label: 'Multi-Tenant API & Auth', subtitle: 'SSO / SAML + RBAC', x: 310, y: 120, config: { replicas: 5, maxRpsPerReplica: 45_000, baseLatencyMs: 8 } },
      { id: 'sl-ws', type: 'websocket_gateway', label: 'Gateway & WebRTC SFU', subtitle: '20M Persistent Sockets', x: 310, y: 310, config: { replicas: 8, maxRpsPerReplica: 80_000, baseLatencyMs: 4 } },
      { id: 'sl-redis', type: 'redis', label: 'Flannel Edge Cache', subtitle: 'Bootstrap & Presence Map', x: 610, y: 70, config: { replicas: 6, maxRpsPerReplica: 160_000, baseLatencyMs: 2, cacheHitRatio: 0.93 } },
      { id: 'sl-router', type: 'dynamic_router', label: 'Channel Server Router', subtitle: 'Hash(workspace_id)', x: 610, y: 260, config: { replicas: 5, maxRpsPerReplica: 65_000, baseLatencyMs: 4, routingAlgo: 'CONSISTENT_HASH' } },
      { id: 'sl-app', type: 'app_server', label: 'Channel & Thread Service', subtitle: 'Ordered Msg Sequencing', x: 920, y: 230, config: { replicas: 7, maxRpsPerReplica: 16_000, baseLatencyMs: 12, runtime: 'Go / Hack' } },
      { id: 'sl-pg', type: 'postgres', label: 'Vitess / PG Tenant Shards', subtitle: 'Sharded by workspace_id', x: 1230, y: 130, config: { replicas: 6, maxRpsPerReplica: 12_000, baseLatencyMs: 14, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'sl-kafka', type: 'kafka', label: 'Channel Fan-Out Bus', subtitle: 'Mentions + Unread Sync', x: 1230, y: 310, config: { replicas: 5, maxRpsPerReplica: 110_000, baseLatencyMs: 4, partitions: 64 } },
      { id: 'sl-es', type: 'elasticsearch', label: 'Workspace Search Cluster', subtitle: 'Inverted Index + ACLs', x: 1540, y: 120, config: { replicas: 4, maxRpsPerReplica: 18_000, baseLatencyMs: 20 } },
      { id: 'sl-worker', type: 'worker', label: 'Push, Bot & Webhook Svc', subtitle: 'APNs / FCM / App Events', x: 1540, y: 280, config: { replicas: 5, maxRpsPerReplica: 18_000, baseLatencyMs: 18 } },
      { id: 'sl-s3', type: 's3_storage', label: 'Encrypted File & Clip Vault', subtitle: 'Presigned Uploads + DLP', x: 1540, y: 430, config: { replicas: 4, maxRpsPerReplica: 60_000, baseLatencyMs: 24 } },
      { id: 'sl-mon', type: 'monitoring', label: 'Reconnect Storm Guard', subtitle: 'Socket & Fan-Out Lag', x: 920, y: 420, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'sl-client', target: 'sl-gw', edgeLabel: 'API & Search' },
      { source: 'sl-client', target: 'sl-ws', edgeLabel: 'WSS & Huddles' },
      { source: 'sl-gw', target: 'sl-redis', edgeLabel: 'Flannel Edge' },
      { source: 'sl-ws', target: 'sl-router', edgeLabel: 'Channel Msg' },
      { source: 'sl-gw', target: 'sl-router', edgeLabel: 'POST Message' },
      { source: 'sl-router', target: 'sl-app', edgeLabel: 'Tenant Shard' },
      { source: 'sl-app', target: 'sl-pg', edgeLabel: 'Persist Msg' },
      { source: 'sl-app', target: 'sl-kafka', edgeLabel: 'Fan-Out' },
      { source: 'sl-kafka', target: 'sl-es', edgeLabel: 'Index Search' },
      { source: 'sl-kafka', target: 'sl-worker', edgeLabel: 'Push / Bots' },
      { source: 'sl-app', target: 'sl-s3', edgeLabel: 'Attachments' },
      { source: 'sl-app', target: 'sl-mon' },
    ],
  ),

  'telecommunication-5g-voip': buildBlueprint(
    {
      id: 'telecommunication-5g-voip',
      name: '5G Core Network (AMF/SMF/UPF), SIP VoIP & CDR Billing',
      shortName: '5G Core & VoIP',
      scaleTag: 'Control vs. User Plane · <10ms Handover · Real-Time CDR',
      description:
        'Service-Based Architecture (SBA) 5G telecom core separating control-plane mobility (AMF/SMF/AUSF) from ultra-fast GTP-U data-plane forwarding (UPF), IMS SIP VoIP call routing, and real-time Cassandra CDR rating.',
      recommendedEntryRps: 55_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'gNodeB Radio Access & AMF/AUSF SIM Authentication',
          tier: 'Radio & Control Plane',
          description:
            '5G UE devices attach via gNodeB towers; AMF verifies 5G-AKA SIM cryptographic credentials against AUSF/UDM before allocating session tunnels.',
          highlightNodeIds: ['t5-client', 't5-switch', 't5-auth', 't5-amf'],
        },
        {
          step: 2,
          title: 'SMF Session Control & UPF High-Speed User Plane',
          tier: 'CUPS Forwarding',
          description:
            'SMF programs packet-forwarding rules into distributed edge UPF nodes so user data bypasses central control servers at <5ms latency.',
          highlightNodeIds: ['t5-smf', 't5-upf', 't5-redis'],
        },
        {
          step: 3,
          title: 'IMS SIP VoIP Signaling & Seamless Cell Handover',
          tier: 'Voice & Mobility',
          description:
            'SIP Proxy sets up VoNR/VoIP media sessions and coordinates Xn/N2 tower handovers without dropping calls at 120 km/h.',
          highlightNodeIds: ['t5-ws', 't5-kafka'],
        },
        {
          step: 4,
          title: 'Online Charging System (OCS) & Cassandra CDR Store',
          tier: 'Telecom Billing',
          description:
            'Usage quota slices stream through Kafka to real-time Online Charging workers and write-optimized Cassandra Call Detail Record (CDR) tables.',
          highlightNodeIds: ['t5-cass', 't5-worker', 't5-mon'],
        },
      ],
    },
    [
      { id: 't5-client', type: 'client', label: '5G UE Handsets & IoT', subtitle: 'NR Radio -> gNodeB', x: 40, y: 230 },
      { id: 't5-switch', type: 'network_switch', label: 'gNodeB RAN Backhaul', subtitle: 'N2 Control / N3 GTP-U', x: 310, y: 230, config: { replicas: 6, maxRpsPerReplica: 250_000, baseLatencyMs: 2 } },
      { id: 't5-auth', type: 'auth_provider', label: 'AUSF / UDM SIM Auth', subtitle: '5G-AKA Crypto Verify', x: 600, y: 60, config: { replicas: 5, maxRpsPerReplica: 50_000, baseLatencyMs: 8 } },
      { id: 't5-amf', type: 'api_gateway', label: 'AMF Mobility Function', subtitle: 'Handover & Paging Control', x: 600, y: 210, config: { replicas: 6, maxRpsPerReplica: 60_000, baseLatencyMs: 5 } },
      { id: 't5-upf', type: 'dynamic_router', label: 'Edge UPF User Plane', subtitle: 'GTP-U Packet Forwarder', x: 600, y: 380, config: { replicas: 8, maxRpsPerReplica: 150_000, baseLatencyMs: 2, routingAlgo: 'IP_HASH' } },
      { id: 't5-smf', type: 'app_server', label: 'SMF & Policy Control', subtitle: 'QoS Slice & IP Allocator', x: 920, y: 210, config: { replicas: 6, maxRpsPerReplica: 25_000, baseLatencyMs: 9, runtime: 'Go / C++' } },
      { id: 't5-redis', type: 'redis', label: 'Subscriber Session UDSF', subtitle: 'Active PDU & Quota Cache', x: 1220, y: 90, config: { replicas: 6, maxRpsPerReplica: 180_000, baseLatencyMs: 2, cacheHitRatio: 0.94 } },
      { id: 't5-ws', type: 'websocket_gateway', label: 'IMS SIP VoNR / VoIP Core', subtitle: 'RTP Voice & Handover', x: 1220, y: 250, config: { replicas: 5, maxRpsPerReplica: 60_000, baseLatencyMs: 5 } },
      { id: 't5-kafka', type: 'kafka', label: 'Real-Time CDR & Quota Bus', subtitle: 'OCS Rating Events', x: 1220, y: 410, config: { replicas: 5, maxRpsPerReplica: 140_000, baseLatencyMs: 4, partitions: 64 } },
      { id: 't5-cass', type: 'cassandra', label: 'Cassandra CDR Ledger', subtitle: 'Time-Partitioned Write-Heavy', x: 1540, y: 310, config: { replicas: 6, maxRpsPerReplica: 45_000, baseLatencyMs: 8, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 't5-worker', type: 'worker', label: 'OCS Billing & Roaming', subtitle: 'Prepaid Quota Deduct', x: 1540, y: 460, config: { replicas: 5, maxRpsPerReplica: 25_000, baseLatencyMs: 14 } },
      { id: 't5-mon', type: 'monitoring', label: 'RAN Handover & QoS NOC', subtitle: 'Packet Loss & Jitter SLA', x: 920, y: 410, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 't5-client', target: 't5-switch', edgeLabel: '5G NR Radio' },
      { source: 't5-switch', target: 't5-amf', edgeLabel: 'N2 Signaling' },
      { source: 't5-switch', target: 't5-upf', edgeLabel: 'N3 User Data' },
      { source: 't5-amf', target: 't5-auth', edgeLabel: '5G-AKA Auth' },
      { source: 't5-amf', target: 't5-smf', edgeLabel: 'PDU Session' },
      { source: 't5-smf', target: 't5-upf', edgeLabel: 'N4 PFCP Rules' },
      { source: 't5-smf', target: 't5-redis', edgeLabel: 'Quota Check' },
      { source: 't5-upf', target: 't5-ws', edgeLabel: 'SIP / VoNR' },
      { source: 't5-upf', target: 't5-kafka', edgeLabel: 'Usage CDRs' },
      { source: 't5-kafka', target: 't5-cass', edgeLabel: 'Persist CDR' },
      { source: 't5-kafka', target: 't5-worker', edgeLabel: 'OCS Billing' },
      { source: 't5-smf', target: 't5-mon' },
    ],
  ),

  'internet-www-end-to-end': buildBlueprint(
    {
      id: 'internet-www-end-to-end',
      name: 'How the Internet & www.com Works End-to-End',
      shortName: 'Internet / WWW',
      scaleTag: 'DNS -> BGP Anycast -> TLS 1.3 QUIC -> Origin Render',
      description:
        'Full browser-to-origin journey visualizing recursive DNS resolution, BGP Anycast routing to the nearest PoP, HTTP/3 QUIC 1-RTT TLS 1.3 termination, L4/L7 load balancing, origin SSR, and database hydration.',
      recommendedEntryRps: 60_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'Recursive DNS Resolution & BGP Anycast Routing',
          tier: 'Name & Network Layer',
          description:
            'Browser checks OS/ISP caches, resolves root -> .com TLD -> authoritative DNS A/AAAA records, and BGP Anycast directs packets to the geographically closest edge PoP.',
          highlightNodeIds: ['www-client', 'www-dns', 'www-cdn'],
        },
        {
          step: 2,
          title: 'TLS 1.3 + HTTP/3 QUIC Termination & Reverse Proxy',
          tier: 'Transport & Edge',
          description:
            'Edge PoP completes 1-RTT QUIC/TLS 1.3 handshake, serves 90% of static JS/CSS/images directly from NVMe cache, and proxies dynamic HTML requests to regional L7 load balancers.',
          highlightNodeIds: ['www-cdn', 'www-proxy', 'www-lb'],
        },
        {
          step: 3,
          title: 'Origin Web/App Tier & Redis Fragment Cache',
          tier: 'Application Compute',
          description:
            'Stateless web and app servers hydrate personalized page fragments from Redis (<2ms) and query PostgreSQL read replicas only on cache misses.',
          highlightNodeIds: ['www-web', 'www-app', 'www-redis', 'www-pg'],
        },
        {
          step: 4,
          title: 'Object Assets & Real-User Observability (RUM)',
          tier: 'Storage & Telemetry',
          description:
            'Static bundles originate from S3 while distributed tracing tracks DNS, TCP/QUIC, TLS, TTFB, and LCP latency budgets end to end.',
          highlightNodeIds: ['www-s3', 'www-trace'],
        },
      ],
    },
    [
      { id: 'www-client', type: 'client', label: 'Browser (Chrome / Safari)', subtitle: 'Typed https://www.com', x: 40, y: 230 },
      { id: 'www-dns', type: 'dns', label: 'Recursive & Auth DNS', subtitle: 'Root -> .com -> Anycast IP', x: 310, y: 70, config: { replicas: 4, maxRpsPerReplica: 250_000, baseLatencyMs: 6 } },
      { id: 'www-cdn', type: 'cdn', label: 'Anycast Edge PoP (HTTP/3)', subtitle: 'QUIC + TLS 1.3 + Cache', x: 310, y: 260, config: { replicas: 6, maxRpsPerReplica: 180_000, baseLatencyMs: 5, cacheHitRatio: 0.86 } },
      { id: 'www-proxy', type: 'reverse_proxy', label: 'NGINX / Envoy Edge Proxy', subtitle: 'Brotli + Connection Pool', x: 610, y: 260, config: { replicas: 5, maxRpsPerReplica: 80_000, baseLatencyMs: 3 } },
      { id: 'www-lb', type: 'load_balancer', label: 'Regional L7 Load Balancer', subtitle: 'Health Checks + EWMA', x: 900, y: 260, config: { replicas: 4, maxRpsPerReplica: 90_000, baseLatencyMs: 3, routingAlgo: 'LEAST_CONN' } },
      { id: 'www-web', type: 'web_server', label: 'SSR Web Tier', subtitle: 'Streaming HTML Chunks', x: 1190, y: 150, config: { replicas: 6, maxRpsPerReplica: 20_000, baseLatencyMs: 12 } },
      { id: 'www-app', type: 'app_server', label: 'Core Origin API Tier', subtitle: 'Business Logic & Auth', x: 1190, y: 340, config: { replicas: 6, maxRpsPerReplica: 16_000, baseLatencyMs: 16 } },
      { id: 'www-redis', type: 'redis', label: 'Redis Session & Page Cache', subtitle: 'Sub-2ms Fragment Cache', x: 1500, y: 120, config: { replicas: 5, maxRpsPerReplica: 160_000, baseLatencyMs: 2, cacheHitRatio: 0.9 } },
      { id: 'www-pg', type: 'postgres', label: 'Origin PostgreSQL Cluster', subtitle: 'Primary + Read Replicas', x: 1500, y: 290, config: { replicas: 4, maxRpsPerReplica: 10_000, baseLatencyMs: 16, replicationMode: 'PRIMARY_REPLICA' } },
      { id: 'www-s3', type: 's3_storage', label: 'S3 Static Bundle Origin', subtitle: 'Hashed JS / CSS / WebP', x: 610, y: 430, config: { replicas: 4, maxRpsPerReplica: 80_000, baseLatencyMs: 18 } },
      { id: 'www-trace', type: 'tracing', label: 'End-to-End TTFB / RUM', subtitle: 'DNS + TLS + Origin Spans', x: 1500, y: 440, config: { replicas: 2, maxRpsPerReplica: 450_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'www-client', target: 'www-dns', edgeLabel: 'DNS Lookup' },
      { source: 'www-client', target: 'www-cdn', edgeLabel: 'QUIC TLS 1.3' },
      { source: 'www-cdn', target: 'www-s3', edgeLabel: 'Asset Miss' },
      { source: 'www-cdn', target: 'www-proxy', edgeLabel: 'Dynamic Req' },
      { source: 'www-proxy', target: 'www-lb', edgeLabel: 'mTLS KeepAlive' },
      { source: 'www-lb', target: 'www-web', edgeLabel: 'HTML SSR' },
      { source: 'www-lb', target: 'www-app', edgeLabel: 'JSON API' },
      { source: 'www-web', target: 'www-redis', edgeLabel: 'Fragment Cache' },
      { source: 'www-app', target: 'www-redis', edgeLabel: 'Session Cache' },
      { source: 'www-redis', target: 'www-pg', edgeLabel: 'Cache Miss' },
      { source: 'www-app', target: 'www-trace' },
    ],
  ),

  'payment-gateway-ledger': buildBlueprint(
    {
      id: 'payment-gateway-ledger',
      name: 'Payment Gateway & Double-Entry Ledger (Stripe / Razorpay)',
      shortName: 'Stripe / Razorpay',
      scaleTag: 'Idempotent Charges · Zero-Sum Ledger · Signed Webhooks',
      description:
        'PCI-DSS compliant payment processing engine featuring Idempotency-Key deduplication, real-time ML fraud scoring, multi-acquirer smart routing, append-only double-entry accounting, and HMAC-signed merchant webhooks.',
      recommendedEntryRps: 24_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'Merchant Checkout Ingress & Idempotency Lock',
          tier: 'Safety & Deduplication',
          description:
            'API Gateway enforces per-merchant rate limits and Redis locks every Idempotency-Key so client timeouts and retries return the exact original charge response.',
          highlightNodeIds: ['pgw-client', 'pgw-rl', 'pgw-gw', 'pgw-redis'],
        },
        {
          step: 2,
          title: 'Real-Time ML Fraud Scoring & Smart Acquirer Routing',
          tier: 'Risk & Authorization',
          description:
            'Fraud ML scores velocity/device signals in <25ms before Dynamic Router selects the highest-success-rate card network or bank acquirer.',
          highlightNodeIds: ['pgw-app', 'pgw-ml', 'pgw-router'],
        },
        {
          step: 3,
          title: 'Immutable Double-Entry Ledger & Outbox Commit',
          tier: 'ACID Accounting',
          description:
            'Every payment writes balanced Debit + Credit journal entries (sum == 0) in Serializable PostgreSQL alongside an outbox event—never mutating historical balances.',
          highlightNodeIds: ['pgw-pg', 'pgw-kafka'],
        },
        {
          step: 4,
          title: 'Signed Webhook Delivery & T+1 Reconciliation',
          tier: 'Merchant Webhooks',
          description:
            'Workers deliver HMAC-SHA256 signed webhooks with exponential backoff and DLQ replay while nightly reconciliation audits acquirer settlement files.',
          highlightNodeIds: ['pgw-worker', 'pgw-mon'],
        },
      ],
    },
    [
      { id: 'pgw-client', type: 'client', label: 'Merchant Checkout SDK', subtitle: 'POST /v1/charges + Key', x: 40, y: 230 },
      { id: 'pgw-rl', type: 'rate_limiter', label: 'Merchant Rate Shield', subtitle: 'Anti-Card-Testing WAF', x: 310, y: 230, config: { replicas: 5, maxRpsPerReplica: 100_000, rateLimitRps: 65_000, baseLatencyMs: 3 } },
      { id: 'pgw-gw', type: 'api_gateway', label: 'PCI-DSS Vault Gateway', subtitle: 'Card Tokenization + Auth', x: 590, y: 230, config: { replicas: 5, maxRpsPerReplica: 45_000, baseLatencyMs: 8 } },
      { id: 'pgw-app', type: 'app_server', label: 'Payment State Machine', subtitle: 'Auth -> Capture -> Settle', x: 890, y: 230, config: { replicas: 6, maxRpsPerReplica: 10_000, baseLatencyMs: 18, runtime: 'Go / Ruby' } },
      { id: 'pgw-redis', type: 'redis', label: 'Idempotency & Velocity', subtitle: 'Atomic Key + 5m Risk', x: 1180, y: 70, config: { replicas: 5, maxRpsPerReplica: 150_000, baseLatencyMs: 2, cacheHitRatio: 0.86 } },
      { id: 'pgw-ml', type: 'ml_inference', label: 'Radar Fraud ML Engine', subtitle: 'Real-Time Risk Scoring', x: 1180, y: 210, config: { replicas: 5, maxRpsPerReplica: 12_000, baseLatencyMs: 22 } },
      { id: 'pgw-router', type: 'dynamic_router', label: 'Smart Acquirer Switch', subtitle: 'Visa / MC / UPI Failover', x: 1180, y: 370, config: { replicas: 4, maxRpsPerReplica: 35_000, baseLatencyMs: 35, routingAlgo: 'LEAST_CONN' } },
      { id: 'pgw-pg', type: 'postgres', label: 'Double-Entry Ledger DB', subtitle: 'Serializable Append-Only', x: 1490, y: 230, config: { replicas: 4, maxRpsPerReplica: 8_500, baseLatencyMs: 18, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'pgw-kafka', type: 'kafka', label: 'Outbox & Webhook Bus', subtitle: 'Exactly-Once Ledger CDC', x: 1780, y: 160, config: { replicas: 4, maxRpsPerReplica: 85_000, baseLatencyMs: 5, partitions: 48 } },
      { id: 'pgw-worker', type: 'worker', label: 'HMAC Webhook & Recon', subtitle: 'Exponential Retry + DLQ', x: 1780, y: 340, config: { replicas: 5, maxRpsPerReplica: 14_000, baseLatencyMs: 26 } },
      { id: 'pgw-mon', type: 'monitoring', label: 'Auth-Rate & Drift Radar', subtitle: 'Acquirer Health & Zero-Sum', x: 1490, y: 420, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'pgw-client', target: 'pgw-rl', edgeLabel: 'Charge Request' },
      { source: 'pgw-rl', target: 'pgw-gw', edgeLabel: 'Tokenize PAN' },
      { source: 'pgw-gw', target: 'pgw-app', edgeLabel: 'Idempotent Exec' },
      { source: 'pgw-app', target: 'pgw-redis', edgeLabel: 'Lock Key' },
      { source: 'pgw-app', target: 'pgw-ml', edgeLabel: 'Fraud Score' },
      { source: 'pgw-app', target: 'pgw-router', edgeLabel: 'Acquirer Auth' },
      { source: 'pgw-app', target: 'pgw-pg', edgeLabel: 'Double-Entry' },
      { source: 'pgw-pg', target: 'pgw-kafka', edgeLabel: 'Outbox CDC' },
      { source: 'pgw-kafka', target: 'pgw-worker', edgeLabel: 'HMAC Webhooks' },
      { source: 'pgw-app', target: 'pgw-mon' },
    ],
  ),

  'url-shortener-ratelimiter': buildBlueprint(
    {
      id: 'url-shortener-ratelimiter',
      name: 'Global URL Shortener (Bitly) & Distributed Rate Limiter',
      shortName: 'URL Shortener',
      scaleTag: '100K Redirects/s · 100:1 Read-Heavy · Redis Lua Sliding Window',
      description:
        'Classic high-throughput read-heavy architecture combining edge CDN 301/302 redirects, atomic Redis Lua Sliding-Window rate limiting, Base62 Snowflake key generation, and async click-stream analytics.',
      recommendedEntryRps: 75_000,
      architecturalWalkthrough: [
        {
          step: 1,
          title: 'Edge CDN Redirects & Atomic Redis Rate Limiter',
          tier: 'Ultra-Fast Edge',
          description:
            'Viral short links resolve at Edge CDN (<8ms) while API write/abuse traffic passes through an atomic Redis Lua Sliding-Window Log / Token Bucket limiter.',
          highlightNodeIds: ['url-client', 'url-cdn', 'url-rl', 'url-gw'],
        },
        {
          step: 2,
          title: 'Stateless Base62 Redirector & Hot-Key Redis Cache',
          tier: '100:1 Read Path',
          description:
            'Redirector checks Redis hot-link cache (98% hit rate) and uses Bloom/negative caching to prevent random 404 cache-penetration attacks.',
          highlightNodeIds: ['url-app', 'url-redis'],
        },
        {
          step: 3,
          title: 'Zero-Collision Key Generator & Cassandra/PG Store',
          tier: 'Durable Mapping',
          description:
            'Short-code creation allocates collision-free 7-character Base62 IDs from pre-allocated counter ranges and persists mappings in sharded Cassandra/PostgreSQL.',
          highlightNodeIds: ['url-cass', 'url-pg'],
        },
        {
          step: 4,
          title: 'Non-Blocking Clickstream Analytics Pipeline',
          tier: 'Async Analytics',
          description:
            'Every redirect emits a fire-and-forget click event to Kafka so GeoIP, referrer, and device rollups never add latency to the 302 redirect path.',
          highlightNodeIds: ['url-kafka', 'url-worker', 'url-mon'],
        },
      ],
    },
    [
      { id: 'url-client', type: 'client', label: 'Global Clicks & API Devs', subtitle: 'GET /aB9x2K & POST /shorten', x: 40, y: 230 },
      { id: 'url-cdn', type: 'cdn', label: 'Edge CDN Redirect PoP', subtitle: 'Viral Link 302 Cache', x: 310, y: 110, config: { replicas: 6, maxRpsPerReplica: 200_000, baseLatencyMs: 4, cacheHitRatio: 0.85 } },
      { id: 'url-rl', type: 'rate_limiter', label: 'Redis Lua Rate Limiter', subtitle: 'Sliding Window + Token Bucket', x: 310, y: 290, config: { replicas: 6, maxRpsPerReplica: 160_000, rateLimitRps: 110_000, baseLatencyMs: 2 } },
      { id: 'url-gw', type: 'api_gateway', label: 'Shortener Edge Gateway', subtitle: 'Custom Domains & API Keys', x: 600, y: 230, config: { replicas: 5, maxRpsPerReplica: 70_000, baseLatencyMs: 4 } },
      { id: 'url-app', type: 'app_server', label: 'Redirect & Base62 Service', subtitle: 'Range Counter ID Generator', x: 900, y: 230, config: { replicas: 7, maxRpsPerReplica: 28_000, baseLatencyMs: 5, runtime: 'Go / Rust' } },
      { id: 'url-redis', type: 'redis', label: 'Redis Hot-Link + Bloom', subtitle: '98% Hit + 404 Shield', x: 1210, y: 90, config: { replicas: 6, maxRpsPerReplica: 200_000, baseLatencyMs: 1, cacheHitRatio: 0.96 } },
      { id: 'url-cass', type: 'cassandra', label: 'Cassandra URL Mapping', subtitle: 'Key = short_code (7-char)', x: 1210, y: 250, config: { replicas: 5, maxRpsPerReplica: 45_000, baseLatencyMs: 6, replicationMode: 'SHARDED_CLUSTER' } },
      { id: 'url-pg', type: 'postgres', label: 'Tenant & Custom Alias DB', subtitle: 'Billing & Custom Domains', x: 1210, y: 410, config: { replicas: 3, maxRpsPerReplica: 10_000, baseLatencyMs: 12, replicationMode: 'PRIMARY_REPLICA' } },
      { id: 'url-kafka', type: 'kafka', label: 'Clickstream Event Bus', subtitle: 'Async Geo & Referrer Log', x: 1520, y: 230, config: { replicas: 5, maxRpsPerReplica: 160_000, baseLatencyMs: 4, partitions: 64 } },
      { id: 'url-worker', type: 'worker', label: 'Analytics Rollup Worker', subtitle: 'HyperLogLog Uniques', x: 1810, y: 230, config: { replicas: 5, maxRpsPerReplica: 30_000, baseLatencyMs: 16 } },
      { id: 'url-mon', type: 'monitoring', label: 'Redirect Latency & 429s', subtitle: 'P99 <15ms Guard', x: 900, y: 420, config: { replicas: 2, maxRpsPerReplica: 500_000, baseLatencyMs: 2 } },
    ],
    [
      { source: 'url-client', target: 'url-cdn', edgeLabel: 'Viral 302' },
      { source: 'url-client', target: 'url-rl', edgeLabel: 'API & Misses' },
      { source: 'url-rl', target: 'url-gw', edgeLabel: 'Within Quota' },
      { source: 'url-cdn', target: 'url-gw', edgeLabel: 'Edge Miss' },
      { source: 'url-gw', target: 'url-app', edgeLabel: 'Resolve/Mint' },
      { source: 'url-app', target: 'url-redis', edgeLabel: '98% Cache Hit' },
      { source: 'url-redis', target: 'url-cass', edgeLabel: 'Cold Lookup' },
      { source: 'url-app', target: 'url-pg', edgeLabel: 'Custom Alias' },
      { source: 'url-app', target: 'url-kafka', edgeLabel: 'Async Click' },
      { source: 'url-kafka', target: 'url-worker', edgeLabel: 'Rollup Stats' },
      { source: 'url-app', target: 'url-mon' },
    ],
  ),
};

export const PLAYGROUND_ARCHITECTURE_EXPLANATIONS: Record<string, PlaygroundArchitectureExplanation> = {
  'upi-payment-system': {
    blueprintId: 'upi-payment-system',
    domain: 'FinTech & Instant Payments',
    formalDefinition:
      'A real-time interbank push-payment switch orchestrating idempotent Saga debit/credit legs across Remitter and Beneficiary banks under strict ACID and <400ms P99 guarantees.',
    whyThisArchitectureExists:
      'Mobile networks drop mid-payment constantly. Separating mTLS edge verification, Redis SETNX idempotency locks, NPCI switch routing, and async SMS/Fraud workers prevents duplicate debits even under 500M+ daily transactions.',
    capacityAndScaleMath:
      '500M txns/day ≈ 5,800 avg TPS, peaking at 20,000+ TPS during festival sales; ~4 KB per txn ledger row -> ~2 TB/day journal growth.',
    coreAlgorithms: [
      { name: 'Idempotent Saga State Machine', role: 'Guarantees exactly-once financial effect across INITIATED -> DEBITED -> CREDITED -> SETTLED retries.' },
      { name: 'Token Bucket WAF + mTLS', role: 'Absorbs credential/PIN brute-force spikes at Cloudflare & Kong edge.' },
      { name: 'Serializable Double-Entry Ledger', role: 'Enforces debit + credit = 0 inside Core Banking Oracle RAC.' },
    ],
    databaseAndShardingStrategy:
      'Redis Cluster caches VPA -> IFSC resolution (85% hit) and holds 24h txnId idempotency keys; Oracle RAC / PostgreSQL partitions ledger rows by account_id & month with append-only journal tables.',
    criticalBottlenecks: [
      'Beneficiary bank CBS timeouts causing hanging debit holds -> mitigated via strict timeouts + Auto-Reversal reconciliation.',
      'Hot merchant VPA lock contention (e.g., IPL ticket merchant) -> mitigated via sub-ledger batching & queue smoothing.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Redis Idempotency Node', systemResponse: 'Orchestrator falls back to unique txn_id constraint in Core DB; latency rises ~18ms while preventing double debits.' },
      { trigger: 'Trigger 10x Traffic Spike', systemResponse: 'Cloudflare WAF + Kong shed excess traffic cleanly with HTTP 429 before Oracle RAC saturates.' },
    ],
    requestFlowSummary:
      'UPI App -> Cloudflare WAF -> Kong mTLS -> NPCI Device Auth -> Envoy LB -> Payment Orchestrator -> Redis Idempotency -> NPCI Switch -> Core Ledger -> Kafka Async SMS/Fraud.',
  },
  'hotstar-live-streaming': {
    blueprintId: 'hotstar-live-streaming',
    domain: 'Hyper-Scale Live Video Broadcast',
    formalDefinition:
      'A multi-CDN, adaptive-bitrate (HLS/CMAF) live video delivery architecture engineered to serve 50M+ concurrent cricket viewers while isolating stateless video chunks from bursty interactive chat/poll traffic.',
    whyThisArchitectureExists:
      'A single last-over wicket triggers 10M+ viewers joining or reacting within seconds. Serving 2-second HLS segments from tiered Edge CDNs offloads 99.8% of bandwidth from origin servers.',
    capacityAndScaleMath:
      '50M concurrent viewers × 2 Mbps average bitrate = 100 Tbps aggregate egress bandwidth; 99.8% absorbed by ISP/Multi-CDN edge PoPs.',
    coreAlgorithms: [
      { name: 'Adaptive Bitrate (ABR / BOLA)', role: 'Client dynamically switches between 240p..4K segments based on buffer occupancy & throughput.' },
      { name: 'Request Coalescing (Origin Shield)', role: 'Collapses 100,000 simultaneous edge cache misses for the same 2s segment into 1 origin fetch.' },
      { name: 'Consistent-Hash Multi-CDN Steering', role: 'Dynamically shifts regional traffic away from congested ISPs.' },
    ],
    databaseAndShardingStrategy:
      'Live media chunks live on S3/Object Origin behind tiered CDN shields; session tokens & live scoreboard state live in Redis; chat/reactions stream through Kafka into Cassandra.',
    criticalBottlenecks: [
      'Thundering herd on auth/login during match toss -> solved with pre-warmed JWT tokens & jittered client backoff.',
      'Origin shield miss storm -> solved via strict request collapsing at shield proxies.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade CDN PoP', systemResponse: 'DNS/Client CDN steering shifts viewers to secondary CDN while ABR drops bitrate temporarily to avoid rebuffering.' },
      { trigger: 'Trigger 10x Spike', systemResponse: 'Edge CDN absorbs video reads while Rate Limiter sheds non-essential chat writes first (graceful degradation).' },
    ],
    requestFlowSummary:
      'Live Encoder -> Origin Packager (HLS/DASH) -> S3 Origin Shield -> Multi-CDN Edge PoPs -> 50M Viewers; parallel API/WebSocket plane handles login, scores & live chat.',
  },
  'whatsapp-messaging': {
    blueprintId: 'whatsapp-messaging',
    domain: 'End-to-End Encrypted Real-Time Messaging',
    formalDefinition:
      'A persistent-connection, store-and-forward messaging fabric using Signal Double Ratchet E2EE, lightweight Erlang/Go socket gateways, and ephemeral delivery queues that delete payloads immediately after receiver ACK.',
    whyThisArchitectureExists:
      'Polling drains mobile batteries and explodes server cost. Keeping 100M+ lightweight TCP/WebSocket connections open enables <100ms message delivery with minimal server storage footprint.',
    capacityAndScaleMath:
      '100B messages/day ≈ 1.15M msg/sec sustained; ~2M concurrent connections per tuned gateway node with minimal RAM overhead.',
    coreAlgorithms: [
      { name: 'Signal Protocol (X3DH + Double Ratchet)', role: 'Provides forward secrecy and post-compromise security so servers only see ciphertext.' },
      { name: 'Store-and-Forward Undelivered Queue', role: 'Buffers ciphertext in Cassandra only while recipient is offline; purges upon device ACK.' },
      { name: 'Presence Lease Heartbeats', role: 'Tracks online gateway mapping in Redis with lazy fan-out to active chat peers.' },
    ],
    databaseAndShardingStrategy:
      'Redis stores user_id -> gateway_node_id routing & presence; Cassandra stores temporary offline queues partitioned by recipient_id; encrypted media blobs reside in S3/CDN with TTL.',
    criticalBottlenecks: [
      'Large group chats (1,024+ members) causing fan-out amplification -> solved via Sender Keys E2EE and async Kafka fan-out.',
      'Mass reconnect storm after regional ISP outage -> solved via exponential backoff with jitter on clients.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill WebSocket Gateway', systemResponse: 'Clients reconnect to healthy gateways with jitter; undelivered messages wait safely in Cassandra until re-attached.' },
      { trigger: 'Degrade Media S3', systemResponse: 'Text chat continues unaffected at <80ms because media uploads are decoupled via presigned URLs.' },
    ],
    requestFlowSummary:
      'Sender App -> WebSocket Gateway -> Chat Router -> Redis Presence Lookup -> Online Recipient Gateway (or Cassandra Offline Queue -> Push Notification) -> Double-Tick ACK.',
  },
  'netflix-youtube-streaming': {
    blueprintId: 'netflix-youtube-streaming',
    domain: 'Global VOD Streaming & Transcoding',
    formalDefinition:
      'A dual-plane video platform separating an asynchronous DAG media transcoding pipeline (write path) from an ISP-embedded Open Connect CDN playback plane and ML recommendation control plane (read path).',
    whyThisArchitectureExists:
      'Every uploaded 4K video must be chunked and encoded into 20+ codec/resolution rungs (AV1/H.265/H.264) once, then streamed billions of times from ISP-local caches without crossing expensive transit backbones.',
    capacityAndScaleMath:
      '500+ hours uploaded/min -> massive parallel GPU/CPU chunk transcoding; >1B hours watched/day served >95% from ISP-colocated CDN appliances.',
    coreAlgorithms: [
      { name: 'Parallel GOP Chunk DAG Transcoding', role: 'Splits videos into 4s scenes encoded concurrently across workers to cut encode time from hours to minutes.' },
      { name: 'Per-Title Convex-Hull Encoding', role: 'Tunes bitrate ladder per video complexity (cartoons need 4x less bitrate than action scenes).' },
      { name: 'Two-Tower + Deep Ranking ML', role: 'Retrieves 500 candidate videos via vector ANN then ranks top-20 per user in <60ms.' },
    ],
    databaseAndShardingStrategy:
      'Video blobs live in S3 + Open Connect ISP CDN; video metadata & view counts use sharded PostgreSQL/Vitess + Redis; watch history & analytics stream via Kafka into Cassandra/OLAP.',
    criticalBottlenecks: [
      'Viral upload transcode backlog -> solved via priority queues & parallel chunk splitting.',
      'View-counter row lock contention on viral videos -> solved via Kafka + Redis/HyperLogLog buffered batch increments.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill ML Recommendation Node', systemResponse: 'API Gateway falls back cleanly to cached trending/regional feeds in Redis so playback never breaks.' },
      { trigger: 'Trigger 10x Traffic Spike', systemResponse: 'CDN absorbs playback traffic while playback telemetry buffers gracefully in Kafka.' },
    ],
    requestFlowSummary:
      'Upload -> S3 -> Kafka -> Parallel Transcode Workers -> HLS/DASH Chunks -> ISP CDN; Playback -> API/ML Feed -> Signed CDN URL -> Adaptive Bitrate Stream.',
  },
  'instagram-twitter-feed': {
    blueprintId: 'instagram-twitter-feed',
    domain: 'Hybrid Push-Pull Social Feed',
    formalDefinition:
      'A hybrid fan-out social feed architecture that pushes regular user posts directly into follower Redis timelines (fan-out-on-write) while merging celebrity posts dynamically at read time (fan-out-on-read).',
    whyThisArchitectureExists:
      'Pure fan-out-on-write stalls queues for minutes when a celebrity with 100M followers posts; pure fan-out-on-read melts databases on every timeline refresh. The hybrid threshold (~100K followers) gives <80ms reads AND bounded writes.',
    capacityAndScaleMath:
      '500M DAU · 100:1 read/write ratio · Redis timeline stores compact 8-byte post_id lists (500 IDs ≈ 4 KB/active user -> ~2 TB RAM globally).',
    coreAlgorithms: [
      { name: 'Hybrid Push/Pull Fan-Out (>100K Celebrity Split)', role: 'Avoids 100M write amplification while keeping normal feeds pre-materialized in RAM.' },
      { name: 'Snowflake 64-bit K-Sortable IDs', role: 'Encodes timestamp + shard + sequence for lock-free chronological ordering.' },
      { name: 'K-Way Merge + ML Feed Ranker', role: 'Merges pre-computed Redis feed with live celebrity posts and ranks by engagement probability.' },
    ],
    databaseAndShardingStrategy:
      'Posts & media metadata sharded by post_id/user_id in PostgreSQL/Cassandra; pre-computed timelines in Redis sorted sets; media on S3 + Multi-CDN; hashtag search in Elasticsearch.',
    criticalBottlenecks: [
      'Celebrity hot-key reads in Redis -> solved with local L1 app cache + replicated Redis read replicas.',
      'Like-counter hot row contention -> solved via Redis INCR + async Kafka flush.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Kafka Fan-Out Bus', systemResponse: 'Writes still commit to primary Post DB; feeds degrade to pull-on-read fallback until Kafka recovers.' },
      { trigger: 'Trigger 10x Spike', systemResponse: 'Redis absorbs timeline reads while ML ranking falls back to reverse-chronological sorting to save CPU.' },
    ],
    requestFlowSummary:
      'Post Upload -> S3/CDN + Post DB -> Kafka -> Fan-Out Worker (if followers < 100K -> push to follower Redis ZSETs); Feed Read -> Redis Feed + Celebrity Pull -> ML Ranker -> Client.',
  },
  'google-search-engine': {
    blueprintId: 'google-search-engine',
    domain: 'Web-Scale Search & Information Retrieval',
    formalDefinition:
      'A document-partitioned scatter-gather search engine combining polite distributed web crawling, sharded inverted-index posting lists, PageRank + BM25/neural ranking, and multi-tier query result caching.',
    whyThisArchitectureExists:
      'Searching 100B+ web pages in <100ms is impossible on a single index. Partitioning documents across thousands of index leaf shards allows parallel scatter-gather intersection and top-K scoring.',
    capacityAndScaleMath:
      '100K+ queries/sec globally · ~50% repeat head queries served from Redis/CDN query cache · 100B+ indexed documents across thousands of leaf shards.',
    coreAlgorithms: [
      { name: 'Inverted Index + WAND / Block-Max Pruning', role: 'Skips low-scoring posting-list blocks to find top-K BM25 matches 10x faster.' },
      { name: 'PageRank Eigenvector Authority + Neural Re-Rank', role: 'Combines link-graph authority with Transformer cross-encoder semantic relevance.' },
      { name: 'Hedged Requests (Tail-Latency Mitigation)', role: 'Re-issues slow leaf shard RPCs after P95 threshold so 1 straggler never stalls the entire scatter-gather.' },
    ],
    databaseAndShardingStrategy:
      'Document-sharded Inverted Index (Elasticsearch/custom LSM segments) held in RAM/NVMe; raw crawled documents & link graph in distributed storage/Bigtable; hot query cache in Redis.',
    criticalBottlenecks: [
      'Tail latency amplification in fan-out scatter-gather (1 slow shard out of 500 slows every query) -> mitigated via hedged requests & partial-result timeouts.',
      'Crawler politeness & duplicate URL traps -> mitigated via URL Bloom filters and per-host politeness queues.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade Search Shard', systemResponse: 'Root Aggregator routes around slow leaf replica or returns partial top-K results within strict 120ms deadline.' },
      { trigger: 'Kill ML Re-Ranker', systemResponse: 'Serving pipeline gracefully falls back to fast BM25 + PageRank lexical ranking.' },
    ],
    requestFlowSummary:
      'Query -> Edge CDN/GW -> Query Rewriter -> Redis Query Cache -> Scatter-Gather Leaf Index Shards -> BM25/PageRank + Neural Re-Rank -> Snippet Hydration -> SERP.',
  },
  'uber-geospatial-dispatch': {
    blueprintId: 'uber-geospatial-dispatch',
    domain: 'Real-Time Geospatial Dispatch & Surge',
    formalDefinition:
      'A high-frequency geospatial matching engine ingesting millions of 4-second driver GPS pings into H3 hexagonal spatial indexes to match riders with minimum-ETA drivers and compute real-time surge multipliers.',
    whyThisArchitectureExists:
      'Driver locations change every 4 seconds and straight-line distance ignores bridges, highways, and traffic. Separating in-memory H3 spatial state from ACID trip ledgers enables sub-second matching at city scale.',
    capacityAndScaleMath:
      '5M active drivers × 1 GPS ping/4s = 1.25M location writes/sec -> stored strictly in volatile memory (Redis/Ringpop), never an OLTP SQL database.',
    coreAlgorithms: [
      { name: 'Uber H3 Hexagonal Hierarchical Spatial Index', role: 'Maps lat/lng to uniform-neighbor hex cells for O(1) k-ring nearby driver lookups.' },
      { name: 'Bipartite Minimum-ETA Batch Matching (Hungarian)', role: 'Matches batches of nearby riders & drivers globally over 2s windows to cut deadhead wait times.' },
      { name: 'Contraction Hierarchies + Traffic ETA ML', role: 'Computes road-network ETA in microseconds across millions of road segments.' },
    ],
    databaseAndShardingStrategy:
      'Ephemeral driver GPS lives in sharded in-memory H3/Redis nodes; trip state machine & receipts live in sharded PostgreSQL/Schemaless; GPS breadcrumbs archive into Kafka -> Cassandra/S3.',
    criticalBottlenecks: [
      'Double-dispatching the same driver to two riders -> solved via atomic Redis driver-offer lock with 15s acceptance TTL.',
      'Stadium concert exit surge hotspot -> solved via H3 cell-level surge throttling and localized shard isolation.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill ETA ML Service', systemResponse: 'Dispatch falls back to H3 road-graph heuristic ETA so rides continue matching without downtime.' },
      { trigger: 'Trigger 10x Surge Spike', systemResponse: 'Rate limiter protects trip DB while H3 surge engine dynamically balances supply & demand.' },
    ],
    requestFlowSummary:
      'Driver 4s GPS -> WebSocket -> Location Ingest -> H3 Redis Index; Rider Request -> Dispatch Service -> k-Ring H3 Lookup -> ETA ML -> Atomic Driver Lock -> ACID Trip DB.',
  },
  'swiggy-zomato-order-tracking': {
    blueprintId: 'swiggy-zomato-order-tracking',
    domain: 'Hyperlocal Food Delivery & Live Tracking',
    formalDefinition:
      'An event-driven 3-sided marketplace orchestrating customer checkout, restaurant kitchen acceptance, rider batching/assignment, ML prep-time prediction, and live map WebSocket telemetry.',
    whyThisArchitectureExists:
      'Unlike parcel shipping, hot food spoils in minutes. Predicting kitchen prep time accurately lets the dispatch engine assign a rider just in time so neither food nor rider waits.',
    capacityAndScaleMath:
      'Peak dinner rush (8 PM): 30K+ browse RPS, 3K+ orders/min, 500K+ live rider tracking sockets pushing 3s GPS coordinates.',
    coreAlgorithms: [
      { name: 'Just-In-Time (JIT) Rider Dispatch & Order Batching', role: 'Delays rider assignment until (prep_time - travel_time) approaches zero and clubs co-located orders.' },
      { name: 'Kitchen Prep-Time Gradient-Boosted ML', role: 'Combines live restaurant order load, dish complexity, and time-of-day for accurate ETAs.' },
      { name: 'Geo-Filtered Elasticsearch + Redis Menu Cache', role: 'Serves hyperlocal restaurant discovery within 5km radius at <40ms.' },
    ],
    databaseAndShardingStrategy:
      'Menus & rider geo-locations in Redis; restaurant/dish discovery in Elasticsearch; ACID order state machine in PostgreSQL; order lifecycle events over Kafka to WebSocket & notification workers.',
    criticalBottlenecks: [
      'Dinner-rush payment & restaurant confirmation spikes -> decoupled via Kafka event bus and async kitchen tablet alerts.',
      'Stale menu availability -> invalidated via merchant webhook events into Redis.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade Kitchen ETA ML', systemResponse: 'Falls back to historical median restaurant prep time stored in Redis.' },
      { trigger: 'Kill WebSocket Tracking', systemResponse: 'App seamlessly switches to 10-second polling fallback for order status milestones.' },
    ],
    requestFlowSummary:
      'App -> Rate Limiter -> Gateway -> Order Service -> Redis/Postgres/Elasticsearch -> Kafka Order Events -> Live Map WebSocket + ETA ML + SMS/Push Workers.',
  },
  'zepto-blinkit-instamart': {
    blueprintId: 'zepto-blinkit-instamart',
    domain: 'Quick-Commerce (10-Minute Hyperlocal Delivery)',
    formalDefinition:
      'A dark-store-sharded commerce & micro-warehouse architecture coupling sub-2ms per-store Redis inventory checks, ACID PostgreSQL Outbox checkout, 90-second WMS picking orchestration, and H3 rider clubbing.',
    whyThisArchitectureExists:
      'Inventory is strictly physical per micro-warehouse (dark store). Sharding both Redis and PostgreSQL by dark_store_id isolates stock contention and guarantees zero overselling on the last carton of milk.',
    capacityAndScaleMath:
      '1,000+ dark stores × ~8,000 SKUs/store = 8M store-SKU rows (easily fits in RAM!); 50K browse RPS + 5K checkout TPS during weekend peaks.',
    coreAlgorithms: [
      { name: 'H3/S2 Dark-Store Geofence Polygon Routing', role: 'Maps user GPS to serving dark store & disables checkout automatically when store capacity saturates.' },
      { name: 'Atomic Redis Lua Stock Reserve + PostgreSQL Transactional Outbox', role: 'Prevents dual-write drift between inventory commit and WMS picker task creation.' },
      { name: 'TSP Bin-Picking Route Optimization', role: 'Orders warehouse aisle/bin picks so packers finish a 10-item bag in <90 seconds.' },
    ],
    databaseAndShardingStrategy:
      'Both Redis hash-tags `{dark_store_id}` and PostgreSQL shards partition by `dark_store_id`; Debezium CDC tails PostgreSQL WAL outbox rows into Kafka for WMS & Rider Dispatch.',
    criticalBottlenecks: [
      'Flash-sale SKU hot row inside a single dark store -> mitigated via Redis Lua pre-check + bounded optimistic retries.',
      'Rain-induced rider shortage -> dynamic surge/ETA throttling disables 10-min promise before queues explode.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill WMS Picker Worker', systemResponse: 'Confirmed orders remain durable in Kafka `orders.confirmed` partition and drain automatically on worker restart.' },
      { trigger: 'Trigger 10x Spike', systemResponse: 'Redis absorbs 92% of catalog traffic while PostgreSQL protects stock consistency.' },
    ],
    requestFlowSummary:
      'App -> CDN/Geo Gateway -> Dark-Store Catalog (Redis) -> Checkout Service (Lua Check + ACID PostgreSQL Outbox) -> Debezium CDC Kafka -> WMS Picker + ETA ML + Live Rider WebSocket.',
  },
  'irctc-tatkal': {
    blueprintId: 'irctc-tatkal',
    domain: 'Extreme-Contention Railway Ticketing',
    formalDefinition:
      'A contention-isolated reservation engine designed for 10:00 AM Tatkal flash bursts using virtual waiting rooms, train-date single-writer partitioning, bitwise route-segment berth locking, and RAC/Waitlist promotion queues.',
    whyThisArchitectureExists:
      'Millions of users simultaneously fight for ~200 Tatkal berths on the same train at 10:00:00 AM. Without waiting-room admission control and per-train-date sharding, global DB row locks deadlock instantly.',
    capacityAndScaleMath:
      '10:00 AM burst: 500K+ concurrent login/search attempts -> metered to ~30K tickets/min committed across ~3,000 daily trains.',
    coreAlgorithms: [
      { name: 'Bitwise Route-Segment Berth Availability Mask', role: 'Represents 32+ stations along a route as a 64-bit integer; `(berthMask & reqMask) == 0` checks segment availability in 1 CPU cycle.' },
      { name: 'Consistent-Hash Train-Date Single-Writer Actor', role: 'Serializes allocation for one `(train_id, date)` in memory without distributed DB deadlocks.' },
      { name: 'Virtual Waiting Room + Anti-Bot Captcha Token', role: 'Sheds tout bots at the perimeter and feeds steady throughput into core booking.' },
    ],
    databaseAndShardingStrategy:
      'Redis holds train-date berth bitmasks & 7-minute payment-hold leases; Core Oracle/PostgreSQL partitions PNR & coach inventory by `(travel_date, train_id)`; Kafka drives RAC/Waitlist auto-upgrades.',
    criticalBottlenecks: [
      'Payment gateway slowness holding locked berths -> solved via strict 7-minute Redis TTL + compensating release sweep.',
      'Thundering herd on 10:00:00 AM clock tick -> smoothed by edge waiting-room admission tokens.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Trigger 10x Tatkal Spike', systemResponse: 'Virtual Waiting Room absorbs burst with HTTP 429/queue tokens while Core PNR DB maintains steady commit latency.' },
      { trigger: 'Kill Ticket Worker', systemResponse: 'PNR is already committed in ACID DB; PDF/SMS delivery resumes from Kafka with zero lost tickets.' },
    ],
    requestFlowSummary:
      'User -> Waiting Room WAF -> Captcha Auth -> Gateway -> Hash(train+date) Router -> Redis Bitmask Lock -> Berth Allocation Engine -> ACID PNR DB -> Kafka Payment/WL/SMS.',
  },
  'bookmyshow-ticketing': {
    blueprintId: 'bookmyshow-ticketing',
    domain: 'Mega-Concert & Cinema Seat-Lock Ticketing',
    formalDefinition:
      'A high-contention seat-reservation platform combining CDN-fronted virtual waiting rooms, Redis Lua fencing-token seat holds, PostgreSQL uniqueness invariants, and live WebSocket seat-map broadcasts.',
    whyThisArchitectureExists:
      'When 2M fans compete for 50,000 stadium seats, two buyers must never pay for Seat A14—even if a GC pause delays Buyer 1’s checkout past the 10-minute hold expiration.',
    capacityAndScaleMath:
      '2M fans in virtual queue -> metered at 5,000 active checkout sessions/min -> ~800 seat-lock ops/sec with 100% strict consistency.',
    coreAlgorithms: [
      { name: 'Monotonic Fencing Tokens on Distributed Seat Leases', role: 'DB rejects any stale commit carrying a lower fencing token than the latest seat holder, preventing zombie double-bookings.' },
      { name: 'Atomic Redis Lua Multi-Seat Hold (`MSETNX` + TTL)', role: 'Holds 4 contiguous seats all-or-nothing in a single atomic sub-millisecond operation.' },
      { name: 'Delta Seat-Map Pub/Sub Broadcast', role: 'Pushes compact seat-status bitdiffs instead of re-fetching full stadium SVG maps.' },
    ],
    databaseAndShardingStrategy:
      'Redis stores 10-minute seat hold leases + fencing counters keyed by `show_id`; PostgreSQL enforces `UNIQUE(show_id, seat_id)` for confirmed bookings; CDN serves static venue SVG layouts.',
    criticalBottlenecks: [
      'Expired seat holds trapped by abandoned browser tabs -> automatically freed by Redis TTL + Kafka sweeper.',
      'Full-stadium map polling storms -> replaced by CDN static layout + incremental WebSocket diffs.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade PostgreSQL Bookings DB', systemResponse: 'Waiting room slows admission rate automatically while Redis preserves active seat locks.' },
      { trigger: 'Kill WebSocket Map Hub', systemResponse: 'Checkout still enforces exact seat locks in Redis & PostgreSQL; UI falls back to 5s delta polling.' },
    ],
    requestFlowSummary:
      'Fan -> CDN Layout / Virtual Waiting Room -> Gateway -> Seat-Lock Service -> Redis Lua Hold (10m + Fencing Token) -> Payment -> ACID PostgreSQL Confirm -> Kafka -> Live Seat Map & QR.',
  },
  'flight-booking-gds': {
    blueprintId: 'flight-booking-gds',
    domain: 'Travel GDS & Airline Ticketing',
    formalDefinition:
      'A multi-airline Global Distribution System (GDS) architecture managing high look-to-book fare search caching, multi-leg itinerary pricing, real-time airline PSS verification, and atomic PNR booking/exchange sagas.',
    whyThisArchitectureExists:
      'Airlines charge OTAs penalties for excessive unbooked search queries, and ticket exchanges involve multi-coupon fare recalculation across partner airlines that must succeed or void atomically.',
    capacityAndScaleMath:
      'Look-to-book ratio ~1,000:1 -> 25K search RPS served 94% from Redis/Elasticsearch fare caches, protecting expensive Airline PSS calls for actual bookings.',
    coreAlgorithms: [
      { name: 'Time-Dependent Dijkstra / Multi-Leg Fare Graph', role: 'Combines layover constraints, minimum connection times, and ATPCO fare rules across airlines.' },
      { name: 'Compensating PNR Issue & Exchange Saga', role: 'Atomically holds new flight segment -> calculates fare diff -> charges payment -> voids old coupon -> issues new e-ticket.' },
      { name: 'Cache-Aside Fare Calendar with Stale-While-Revalidate', role: 'Keeps search latency <120ms while final checkout always verifies live PSS seat class.' },
    ],
    databaseAndShardingStrategy:
      'Redis caches popular origin-destination fare calendars; Elasticsearch indexes ATPCO fare rules; PostgreSQL stores versioned PNR records & e-ticket coupon states (`OPEN`, `EXCHANGED`, `VOID`, `FLOWN`).',
    criticalBottlenecks: [
      'Stale cached fare causing checkout price jump -> handled via explicit re-price step before payment capture.',
      'External Airline PSS latency spikes -> isolated via circuit breakers & per-airline bulkhead thread pools.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade Airline PSS Switch', systemResponse: 'Circuit breaker isolates the degraded airline while search & bookings for healthy airlines proceed normally.' },
      { trigger: 'Kill E-Ticket Worker', systemResponse: 'PNR hold stays safely persisted in PostgreSQL & Kafka replays ticketing + BSP settlement on recovery.' },
    ],
    requestFlowSummary:
      'OTA Portal -> NDC Gateway -> Fare Search (Redis + Elasticsearch) -> Booking/Exchange Saga -> Live Airline PSS Hold -> ACID PNR DB -> Kafka -> E-Ticket & IATA BSP Settlement.',
  },
  'stock-exchange-matching': {
    blueprintId: 'stock-exchange-matching',
    domain: 'Ultra-Low-Latency Financial Exchange',
    formalDefinition:
      'A deterministic, lock-free electronic matching architecture where symbol-partitioned in-memory Limit Order Books execute Price-Time Priority (FIFO) fills in <20 microseconds with replicated append-only replay logs.',
    whyThisArchitectureExists:
      'Traditional multi-threaded DB transactions take milliseconds and introduce lock jitter. Pinning one single-threaded CPU core per ticker symbol with LMAX Disruptor ring buffers yields deterministic microsecond matching.',
    capacityAndScaleMath:
      '1M+ orders/sec peak across symbols · <20µs wire-to-match P99 latency · ~64 bytes per binary order message -> 64 MB/sec sequenced journal.',
    coreAlgorithms: [
      { name: 'Price-Time Priority Limit Order Book (Red-Black Tree + FIFO Doubly Linked Lists)', role: 'O(1) cancel/best-bid-ask lookup and deterministic FIFO fill order at each price level.' },
      { name: 'LMAX Disruptor Mechanical Sympathy Ring Buffer', role: 'Eliminates locks, heap allocations, and CPU L1/L2 cache misses in the matching hot path.' },
      { name: 'Deterministic State Machine Replication (Raft/Aeron)', role: 'Hot standby processes the exact sequenced input stream for instant zero-loss failover.' },
    ],
    databaseAndShardingStrategy:
      'Active order books live 100% in pre-allocated RAM (zero DB in matching path); sequenced binary journal replicates to standby engines; trades persist asynchronously into Oracle/Postgres clearing ledgers.',
    criticalBottlenecks: [
      'GC pauses or OS context switches -> eliminated via C++/Rust or off-heap memory, CPU core pinning (`isolcpus`), and DPDK kernel bypass.',
      'Hot index-option ticker saturation -> partitioned by symbol & instrument class across dedicated cores.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Clearing Worker', systemResponse: 'Core matching continues uninterrupted at <20µs; clearing catches up cleanly from the sequenced execution log.' },
      { trigger: 'Degrade Market Data Feed', systemResponse: 'Order execution remains deterministic; slow subscribers re-sync L2 snapshots from recovery servers.' },
    ],
    requestFlowSummary:
      'Broker FIX Binary -> Colocation Switch -> Pre-Trade Risk Gateway -> Sequencer Router -> Lock-Free Limit Order Book -> Sequenced Execution Log -> L2 Market Data + Clearing Ledger.',
  },
  'zerodha-kite': {
    blueprintId: 'zerodha-kite',
    domain: 'Retail Trading & Real-Time Market Ticks',
    formalDefinition:
      'A high-concurrency brokerage architecture separating ultra-compact 44-byte binary WebSocket tick broadcasting from a sub-5ms in-memory RMS margin engine and exchange leased-line Order Management System (OMS).',
    whyThisArchitectureExists:
      'At 9:15 AM IST market open, millions of traders inspect live charts while placing orders within seconds. Decoupling the read-heavy tick fan-out plane from the strict-consistency RMS/OMS write plane keeps charts smooth and margins exact.',
    capacityAndScaleMath:
      '10M+ active traders · ~2M concurrent WebSocket tick streams × 44-byte binary frames ≈ 88 MB/s/tick-burst; ~10K–30K peak orders/sec.',
    coreAlgorithms: [
      { name: 'Compact Binary WebSocket Tick Framing + Pub/Sub Fan-Out', role: 'Cuts bandwidth & JSON parse CPU by 85% compared to text JSON tick frames.' },
      { name: 'Atomic In-Memory RMS Margin Reservation', role: 'Verifies cash/pledged collateral in Redis in <3ms before allowing any order onto exchange leased lines.' },
      { name: 'Exchange Lease-Line Token-Bucket Throttler', role: 'Respects strict per-second NSE/BSE broker tap limits without dropping valid orders.' },
    ],
    databaseAndShardingStrategy:
      'Real-time margin limits & latest LTP ticks live in Redis; executed orders, trades, and holdings commit to partitioned PostgreSQL; EOD contract notes and tax P&L run asynchronously from Kafka.',
    criticalBottlenecks: [
      'Exchange tap-limit congestion on volatile expiry days -> smoothed via multi-tap least-connections routing.',
      '9:15 AM login stampede -> absorbed by Redis-cached TOTP sessions and edge rate guards.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Ticker WebSocket Node', systemResponse: 'Order placement via OMS REST stays 100% online while Kite clients auto-reconnect to healthy ticker nodes.' },
      { trigger: 'Trigger 10x Expiry Spike', systemResponse: 'Per-user token bucket protects OMS & exchange leased lines from algorithmic runaway loops.' },
    ],
    requestFlowSummary:
      'Kite App -> Rate Guard -> OMS Gateway -> TOTP Auth -> OMS/RMS Engine (Redis Margin) -> NSE/BSE Lease-Line Switch -> Holdings DB + Kafka Fill Updates -> Binary Ticker WS.',
  },
  'chatgpt-google-gemini': {
    blueprintId: 'chatgpt-google-gemini',
    domain: 'Frontier LLM Inference & Token Streaming',
    formalDefinition:
      'A globally distributed generative AI serving platform combining TPM/RPM edge rate limiting, prefix KV-cache-aware routing, disaggregated Prefill/Decode GPU/TPU clusters with PagedAttention, and HTTP/2 SSE token streaming.',
    whyThisArchitectureExists:
      'LLM Prefill is compute-bound (matrix-matrix GEMM) while autoregressive Decode is HBM memory-bandwidth-bound. Separating Prefill and Decode pools with continuous iteration-level batching and prefix KV-cache reuse maximizes GPU/TPU utilization while keeping Time-To-First-Token (TTFT) low.',
    capacityAndScaleMath:
      '100K+ concurrent streams · 40–100 output tokens/sec/user · KV-cache consumes ~0.5–2 GB per long-context request in HBM3/HBM3e memory.',
    coreAlgorithms: [
      { name: 'FlashAttention + Online Softmax', role: 'Computes exact self-attention in GPU SRAM tiles in O(N) HBM memory instead of O(N²).' },
      { name: 'PagedAttention & Radix Prefix Caching', role: 'Eliminates KV-cache fragmentation via virtual memory blocks and reuses shared system-prompt KV pages.' },
      { name: 'Continuous Iteration-Level Batching & Speculative Decoding', role: 'Injects new requests every decode step and verifies draft tokens in parallel for 2–3x lower latency.' },
    ],
    databaseAndShardingStrategy:
      'Active KV-cache blocks live in GPU/TPU HBM + host RAM/RDMA cache; RAG embeddings live in HNSW Vector DB; encrypted conversation threads & token metering commit via Kafka into sharded PostgreSQL.',
    criticalBottlenecks: [
      'HBM KV-cache exhaustion during long-context bursts -> mitigated via PagedAttention eviction/swapping & KV-aware load balancing.',
      'Proxy buffering stalling SSE token float -> fixed with `X-Accel-Buffering: no`, HTTP/2 flushing, and browser `ReadableStream` rAF paint.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill RAG Vector DB', systemResponse: 'Orchestrator degrades cleanly to base parametric model generation without blocking chat replies.' },
      { trigger: 'Trigger 10x Token Burst', systemResponse: 'TPM Token-Bucket sheds excess tier-1 traffic while KV-Cache Locality Router protects decode P99 ITL.' },
    ],
    requestFlowSummary:
      'Client SSE -> TPM Rate Limiter -> HTTP/2 Edge -> Auth/Safety -> Tokenizer & RAG -> KV-Locality Router -> GPU/TPU MoE Cluster -> Detokenizer SSE Token Float -> Kafka Billing & Thread DB.',
  },
  'slack-ms-teams': {
    blueprintId: 'slack-ms-teams',
    domain: 'Enterprise Real-Time Collaboration & Huddles',
    formalDefinition:
      'A multi-tenant messaging & WebRTC architecture combining regional Flannel edge bootstrap caches, workspace-sharded channel servers, Kafka fan-out, ACL-enforced Elasticsearch search, and SFU audio/video rooms.',
    whyThisArchitectureExists:
      'Enterprise orgs have 100K+ employees in #announcements channels and strict tenant data isolation. Sharding by workspace_id and caching bootstrap state at the Flannel edge prevents morning login thundering herds.',
    capacityAndScaleMath:
      '20M+ concurrent WebSockets · ~200K msg/sec peak · Flannel edge absorbs >90% of client startup metadata lookups.',
    coreAlgorithms: [
      { name: 'Flannel Regional Edge Metadata Cache', role: 'Streams user/channel state from nearby edge caches so reconnect storms never hit origin DB shards.' },
      { name: 'Workspace-Sharded Consistent Hashing', role: 'Isolates noisy enterprise tenants onto dedicated Vitess/PostgreSQL & channel-server shards.' },
      { name: 'WebRTC Selective Forwarding Unit (SFU)', role: 'Routes encrypted Simulcast video layers selectively without server-side video transcoding.' },
    ],
    databaseAndShardingStrategy:
      'Messages & threads sharded by `workspace_id` in Vitess/PostgreSQL; online presence & channel memberships in Flannel/Redis; full-text search in ACL-filtered Elasticsearch; files in encrypted S3.',
    criticalBottlenecks: [
      'Morning reconnect storm across an entire timezone -> absorbed by Flannel edge caches + jittered WebSocket backoff.',
      '100K-member channel fan-out -> handled via lazy online-only socket fan-out and batched mobile push.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Elasticsearch Search', systemResponse: 'Real-time channel messaging and WebRTC huddles stay 100% operational; search indexing resumes from Kafka.' },
      { trigger: 'Degrade Flannel Edge Cache', systemResponse: 'Clients degrade to paginated lazy-loading of channels instead of full workspace bootstrap.' },
    ],
    requestFlowSummary:
      'Client -> API/WSS Gateway -> Flannel Edge Cache -> Workspace Channel Router -> Channel Service -> Tenant DB Shard + Kafka Fan-Out -> Online Sockets, Search Index & Push Workers.',
  },
  'telecommunication-5g-voip': {
    blueprintId: 'telecommunication-5g-voip',
    domain: '5G Core Network & Carrier VoIP',
    formalDefinition:
      'A 3GPP Service-Based Architecture (SBA) 5G telecom core implementing Control and User Plane Separation (CUPS: AMF/SMF vs. Edge UPF), IMS SIP VoNR voice signaling, and real-time Cassandra CDR billing.',
    whyThisArchitectureExists:
      'Routing gigabits of mobile video through central control servers destroys latency. Separating lightweight control signaling (AMF/SMF) from distributed edge packet forwarders (UPF) unlocks <10ms 5G latency and seamless cell handovers.',
    capacityAndScaleMath:
      'Millions of connected UEs per metro region · <10ms radio-to-UPF latency · hundreds of thousands of real-time CDR usage slices/sec.',
    coreAlgorithms: [
      { name: 'CUPS (Control & User Plane Separation — N2/N3/N4)', role: 'Programs edge UPF forwarding tables via PFCP while keeping subscriber mobility state centralized.' },
      { name: '5G-AKA Mutual SIM Authentication', role: 'Cryptographically authenticates SIM USIM keys against AUSF/UDM preventing rogue tower spoofing.' },
      { name: 'Make-Before-Break Xn/N2 Cell Handover', role: 'Prepares target gNodeB radio context before switching GTP-U tunnel so VoIP calls never drop.' },
    ],
    databaseAndShardingStrategy:
      'Active UE sessions & prepaid quota slices live in ultra-fast UDSF/Redis; immutable Call Detail Records (CDRs) append into write-optimized time-partitioned Cassandra clusters.',
    criticalBottlenecks: [
      'Signaling storms during mass stadium events or power restores -> mitigated via AMF overload control & paging queues.',
      'Prepaid balance race across concurrent data + voice sessions -> handled via Redis quota slice reservations.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade OCS Billing Worker', systemResponse: 'Active calls and 5G data continue uninterrupted under grace-quota slices while CDRs buffer safely in Kafka.' },
      { trigger: 'Kill Edge UPF Node', systemResponse: 'SMF re-anchors PDU sessions onto backup UPF nodes automatically.' },
    ],
    requestFlowSummary:
      '5G UE -> gNodeB RAN -> Control Plane (AMF -> AUSF Auth -> SMF) programs N4 PFCP rules -> Edge UPF forwards GTP-U data & IMS SIP VoIP -> Kafka CDRs -> Cassandra & OCS Billing.',
  },
  'internet-www-end-to-end': {
    blueprintId: 'internet-www-end-to-end',
    domain: 'Web & Internet Networking Stack',
    formalDefinition:
      'The complete end-to-end protocol stack turning a typed URL (`https://www.com`) into painted pixels via hierarchical DNS resolution, BGP Anycast edge routing, HTTP/3 QUIC + TLS 1.3 encryption, reverse-proxy pooling, and origin SSR.',
    whyThisArchitectureExists:
      'Every extra network round-trip across oceans adds 100–200ms. Combining Anycast CDN PoPs, 1-RTT QUIC/TLS 1.3 handshakes, persistent backend keep-alives, and Redis fragment caches keeps global TTFB under 100ms.',
    capacityAndScaleMath:
      '90%+ static assets (JS/CSS/WebP) terminate at Edge PoPs (<15ms); only ~10% personalized HTML/API requests traverse backhaul to origin.',
    coreAlgorithms: [
      { name: 'Hierarchical Recursive DNS + Anycast BGP', role: 'Resolves hostname to an IP announced simultaneously from 250+ global edge PoPs.' },
      { name: 'QUIC (UDP) + TLS 1.3 1-RTT / 0-RTT', role: 'Eliminates TCP head-of-line blocking and merges transport + crypto handshakes.' },
      { name: 'EWMA L7 Load Balancing & HTTP Streaming SSR', role: 'Routes to fastest healthy origin and flushes HTML `<head>` immediately while DB queries complete.' },
    ],
    databaseAndShardingStrategy:
      'Hashed static assets cached indefinitely on S3 + Edge CDN; user sessions & rendered fragments cached in Redis; canonical records stored in primary-replica PostgreSQL.',
    criticalBottlenecks: [
      'TCP/TLS handshake latency for distant users -> solved by terminating TLS 1.3 at Anycast Edge PoPs <20ms from the browser.',
      'Origin connection exhaustion -> prevented by NGINX/Envoy backend keep-alive pooling.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Origin PostgreSQL Replica', systemResponse: 'Static assets & Redis-cached pages keep serving at Edge CDN while origin fails over to healthy replica.' },
      { trigger: 'Trigger 10x Viral Spike', systemResponse: 'Edge CDN absorbs 86%+ traffic and stale-while-revalidate shields origin servers.' },
    ],
    requestFlowSummary:
      'Browser -> Recursive/Auth DNS -> BGP Anycast Edge CDN (QUIC/TLS 1.3) -> Reverse Proxy -> L7 LB -> SSR Web / API Tier -> Redis Cache -> PostgreSQL Origin + S3 Assets.',
  },
  'payment-gateway-ledger': {
    blueprintId: 'payment-gateway-ledger',
    domain: 'Payment Processing & Double-Entry Accounting',
    formalDefinition:
      'A PCI-DSS tokenized payment orchestration & immutable double-entry ledger engine enforcing idempotent charge execution, real-time ML fraud scoring, smart multi-acquirer failover, and HMAC-signed merchant webhooks.',
    whyThisArchitectureExists:
      'Updating a single mutable `balance` column loses audit history and corrupts books under concurrent refunds/disputes. Append-only double-entry journal rows (`SUM(entries) == 0`) combined with Idempotency-Keys make every cent auditable and retry-safe.',
    capacityAndScaleMath:
      '24K peak charge TPS · <25ms fraud ML budget · 2–4 immutable ledger journal rows per charge (buyer, merchant, fee, tax).',
    coreAlgorithms: [
      { name: 'Idempotency-Key Lock & Response Replay', role: 'Guarantees network retries with the same key never double-charge a customer card.' },
      { name: 'Double-Entry Zero-Sum Ledger Invariant', role: 'Every financial movement records balanced debit & credit rows inside a Serializable ACID transaction.' },
      { name: 'Smart Multi-Acquirer Bandit Routing + HMAC Webhooks', role: 'Dynamically routes around failing bank gateways and delivers tamper-proof merchant callbacks with exponential retry.' },
    ],
    databaseAndShardingStrategy:
      'Redis holds idempotency locks & 5-minute fraud velocity counters; Serializable PostgreSQL stores append-only ledger journals + outbox rows; Kafka powers HMAC webhook delivery & T+1 acquirer reconciliation.',
    criticalBottlenecks: [
      'Acquirer gateway brownouts dropping payment auth rates -> mitigated via live success-rate smart routing failover.',
      'Slow merchant webhook endpoints backing up workers -> isolated via per-merchant rate limits, exponential backoff, and Dead-Letter Queues.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Degrade Radar Fraud ML', systemResponse: 'Payment engine falls back to deterministic Redis velocity/rules engine so legitimate checkout stays online.' },
      { trigger: 'Kill Webhook Worker', systemResponse: 'Charges & ledger commits stay 100% ACID; signed merchant webhooks replay automatically from Kafka outbox.' },
    ],
    requestFlowSummary:
      'Checkout SDK -> Rate Shield -> PCI Vault Gateway -> Payment State Machine (Redis Idempotency + Fraud ML + Smart Acquirer Switch) -> Double-Entry Ledger DB -> Outbox Kafka -> HMAC Webhooks.',
  },
  'url-shortener-ratelimiter': {
    blueprintId: 'url-shortener-ratelimiter',
    domain: 'High-Throughput Read-Heavy & Edge Throttling',
    formalDefinition:
      'A 100:1 read-heavy redirection service paired with an atomic Redis Lua distributed rate limiter, collision-free Base62 range-counter ID generation, Bloom-filter 404 protection, and non-blocking Kafka click analytics.',
    whyThisArchitectureExists:
      'A viral link can hit 100K+ clicks/sec while random scanners probe non-existent short codes. Separating edge 302 caches, atomic Lua rate limiting, and async clickstream pipelines keeps redirects under 15ms.',
    capacityAndScaleMath:
      '7-char Base62 (`62^7 ≈ 3.52 trillion` unique URLs) · 100K redirect RPS · ~500 bytes/mapping -> 10B URLs ≈ 5 TB total storage.',
    coreAlgorithms: [
      { name: 'Atomic Redis Lua Sliding-Window / Token-Bucket Limiter', role: 'Evaluates and decrements quota in 1 network round-trip with zero race conditions.' },
      { name: 'Base62 Distributed Counter Range Allocation', role: 'Each app node reserves ranges of 100K IDs from coordinator so short-link minting needs zero cross-node locks.' },
      { name: 'Bloom Filter + Negative Caching + HyperLogLog', role: 'Blocks random 404 DB penetration attacks and counts unique visitors in 12 KB per link.' },
    ],
    databaseAndShardingStrategy:
      'Hot short codes cached in Edge CDN & Redis (98% hit); durable `short_code -> long_url` key-value mappings stored in Cassandra; custom domains & billing in PostgreSQL; click events streamed via Kafka.',
    criticalBottlenecks: [
      'Cache penetration from bots scanning random 7-char codes -> blocked by in-memory Bloom Filter + short-TTL negative cache.',
      'Synchronous analytics writes slowing redirects -> decoupled completely via fire-and-forget Kafka producer.',
    ],
    failureAndChaosPlaybook: [
      { trigger: 'Kill Analytics Worker', systemResponse: '302 redirects continue at <10ms while click events queue safely in Kafka.' },
      { trigger: 'Trigger 10x Bot Spike', systemResponse: 'Redis Lua Rate Limiter returns HTTP 429 cleanly while CDN serves valid viral links.' },
    ],
    requestFlowSummary:
      'Client Click -> Edge CDN / Redis Lua Rate Limiter -> Gateway -> Redirect & Base62 Service -> Redis Hot Cache (98%) / Cassandra -> 302 Redirect + Async Kafka Clickstream.',
  },
};
