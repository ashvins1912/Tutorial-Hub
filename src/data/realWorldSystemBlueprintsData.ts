export type CommPrimitiveId = 'webhook' | 'websocket' | 'enqueue';

export interface CommPrimitiveSpec {
  id: CommPrimitiveId;
  title: string;
  shortTitle: string;
  direction: string;
  tagline: string;
  simpleEnglish: string;
  technicalDefinition: string;
  whenToUse: string[];
  whenNotToUse: string[];
  reliabilityGuarantees: string[];
  protocolDiagramSteps: {
    step: number;
    actor: string;
    action: string;
    detail: string;
  }[];
  productionCode: string;
}

export type RealWorldDomain =
  | 'booking-travel'
  | 'fintech-exchanges'
  | 'ai-search-web'
  | 'realtime-social-telecom';

export interface SystemBlueprintDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

export interface SystemBlueprintDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface SystemBlueprintDfdStep {
  step: number;
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetLabel: string;
}

export interface DbSchemaTableSpec {
  tableName: string;
  engine: string;
  partitionOrShardKey: string;
  columns: { name: string; type: string; key?: 'PK' | 'FK' | 'IDX' | 'UK' | 'SHARD' }[];
}

export interface RealWorldSystemBlueprint {
  id: string;
  shortTitle: string;
  title: string;
  domain: RealWorldDomain;
  commPatterns: ('Webhook' | 'WebSocket' | 'Enqueue' | 'SSE' | 'Multicast/Binary' | 'gRPC/SIP')[];
  scaleBadge: string;
  simpleEnglish: string;
  architectureSummary: string;
  capacityNumbers: { metric: string; value: string }[];
  coreAlgorithms: string[];
  bottleneckAndFix: string;
  dbDesignSummary: string;
  dbTables: DbSchemaTableSpec[];
  dbDdlSnippet: string;
  dfdNodes: SystemBlueprintDfdNode[];
  dfdEdges: SystemBlueprintDfdEdge[];
  dfdSteps: SystemBlueprintDfdStep[];
}

/* ============================================================================
   PART 1: COMMUNICATION ARCHITECTURE PRIMITIVES (WEBHOOK, WEBSOCKET, ENQUEUE)
   ============================================================================ */

export const COMM_ARCHITECTURE_PRIMITIVES: CommPrimitiveSpec[] = [
  {
    id: 'webhook',
    title: 'Webhooks (Event-Driven Server-to-Server HTTP Push)',
    shortTitle: 'Webhooks',
    direction: 'Provider -> Consumer (Async HTTP POST)',
    tagline: 'Eliminate wasteful client polling by pushing signed event notifications the moment state changes.',
    simpleEnglish:
      'Instead of calling the pizza shop every 10 seconds asking "Is my order ready yet?" (polling), you give them your phone number (callback URL) and they ring you the instant it leaves the oven! In production, every ring carries a cryptographic signature (HMAC) and a unique Event ID so duplicates never double-charge you.',
    technicalDefinition:
      'An asynchronous HTTP POST callback architecture decouples external event producers (Stripe, Razorpay, Exchange OMS, Airline GDS) from consumers. Production webhook senders use a persistent Delivery Queue, HMAC-SHA256 payload signatures with timestamp replay defense, exponential backoff with jitter, circuit-breaker endpoint pausing, and Dead-Letter replay queues.',
    whenToUse: [
      'Cross-organization notifications: Payment settled (Stripe/UPI), GitHub push, flight PNR ticket issued, shipment delivered.',
      'Low-to-medium frequency state transitions where holding an open socket 24/7 makes no sense.',
      'Decoupling third-party SaaS integrations without sharing internal message brokers.',
    ],
    whenNotToUse: [
      'Sub-100ms bi-directional chat, live stock market ticks, or multiplayer gaming (use WebSockets).',
      'Browser/mobile clients sitting behind NAT firewalls (clients cannot expose public HTTP endpoints).',
    ],
    reliabilityGuarantees: [
      'Verify `X-Signature-256` with constant-time compare + reject timestamps older than 5 minutes (blocks replay attacks).',
      'Acknowledge HTTP 200 IMMEDIATELY (<500ms) after enqueuing the raw payload—NEVER run slow DB/PDF jobs synchronously inside the webhook HTTP handler!',
      'Store `event_id` in an Idempotency Table (`UNIQUE(event_id)`) because webhooks guarantee At-Least-Once (NOT Exactly-Once) delivery.',
    ],
    protocolDiagramSteps: [
      { step: 1, actor: 'Provider (Stripe/GDS)', action: 'Persist Event + Enqueue', detail: 'Writes event to Transactional Outbox and enqueues delivery job.' },
      { step: 2, actor: 'Dispatcher Worker', action: 'Sign HMAC-SHA256 + POST', detail: 'Computes HMAC(secret, ts + "." + body) and POSTs to consumer URL with 5s timeout.' },
      { step: 3, actor: 'Consumer Receiver', action: 'Verify Sig + Dedupe + Enqueue', detail: 'Checks signature, inserts event_id (ON CONFLICT DO NOTHING), enqueues local worker, returns HTTP 200 fast!' },
      { step: 4, actor: 'Retry / DLQ Engine', action: 'Backoff + Jitter on 5xx', detail: 'If consumer times out or returns 5xx, retries at 1m, 5m, 30m, 2h -> DLQ alert.' },
    ],
    productionCode: `// Production Webhook Receiver: Fast Verify -> Deduplicate -> Enqueue -> 200 OK
app.post('/webhooks/payments', rawBodyParser, async (req, res) => {
  const sig = req.header('X-Signature-256');
  const ts  = req.header('X-Webhook-Timestamp');
  if (!verifyHmacConstantTime(SECRET, \`\${ts}.\${req.rawBody}\`, sig)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }
  const event = JSON.parse(req.rawBody);

  // Idempotency guard: INSERT INTO webhook_events(event_id) ON CONFLICT DO NOTHING
  const isNew = await db.tryClaimEventId(event.id);
  if (!isNew) return res.status(200).json({ status: 'already_processed' });

  // Hand off heavy processing to internal queue & ACK fast (<100ms)!
  await jobQueue.enqueue('payment.settled', event);
  return res.status(200).json({ received: true });
});`,
  },
  {
    id: 'websocket',
    title: 'WebSockets (Persistent Full-Duplex Bi-Directional Streaming)',
    shortTitle: 'WebSockets',
    direction: 'Client <-> Server (Persistent TCP / TLS Frame Stream)',
    tagline: 'Keep one lightweight socket open for millisecond chat, live order-book ticks, Uber GPS, and collaborative editing.',
    simpleEnglish:
      'Normal HTTP is like sending letters back and forth—every message needs a new envelope and handshake. A WebSocket starts as one HTTP request ("Upgrade to WebSocket!"), then turns into an open live phone call where both client and server can speak simultaneously in tiny 2-byte frames!',
    technicalDefinition:
      'RFC 6455 upgrades an HTTP/1.1 TCP connection (`101 Switching Protocols`) into a stateful, full-duplex binary/text framed channel. At scale, stateless API tiers sit behind a fleet of Stateful WebSocket Gateways (100k–500k sockets/node via `epoll`), linked by a Session Registry (Redis `userId -> gwNode`) and Pub/Sub or Kafka fan-out buses.',
    whenToUse: [
      'Real-time bi-directional apps: WhatsApp, Slack, MS Teams, Uber driver GPS telemetry, multiplayer games.',
      'Ultra-frequent server push: Zerodha/NASDAQ live market ticks, collaborative Google Docs cursors.',
    ],
    whenNotToUse: [
      'Simple CRUD APIs, cacheable CDN reads, or one-way LLM text streaming (SSE over HTTP/2 is simpler for unidirectional AI token streams!).',
    ],
    reliabilityGuarantees: [
      'Send Ping/Pong heartbeats every 20–30s to detect dead mobile TCP sockets cleanly.',
      'Reconnection Storm Protection: Clients MUST reconnect using Exponential Backoff + Random Jitter with a `last_seen_seq_id` cursor to replay missed messages!',
      'Per-connection Outbound Send Buffer Cap: Drop/disconnect slow consumers so 1 stuck 3G phone cannot OOM a 200k-socket gateway node.',
    ],
    protocolDiagramSteps: [
      { step: 1, actor: 'Client -> L7 LB', action: 'HTTP GET Upgrade: websocket', detail: 'Authenticates JWT during handshake; L7 upgrades TCP socket to RFC 6455 (101).' },
      { step: 2, actor: 'WS Gateway Node', action: 'Register Session in Redis', detail: 'Stores user_42 -> gw-node-07 with TTL refreshed by 25s Ping/Pong heartbeats.' },
      { step: 3, actor: 'Pub/Sub / Kafka Fan-Out', action: 'Route Frame to Target GW', detail: 'Looks up recipient’s gateway node and publishes compact binary/Protobuf frame.' },
      { step: 4, actor: 'Client Reconnect', action: 'Jitter + Delta Sync', detail: 'On tunnel drop, reconnects with random jitter + last_seq_id to catch up seamlessly.' },
    ],
    productionCode: `// Stateful WebSocket Gateway Fan-Out Pattern (Node/Go/Netty concept)
wsServer.on('connection', async (socket, req) => {
  const userId = verifyJwt(req.headers['authorization']);
  localSockets.set(userId, socket);
  await redis.hset('ws:sessions', userId, MY_GATEWAY_ID);

  // Heartbeat keeps NAT alive & detects zombie mobile drops
  const hb = setInterval(() => socket.ping(), 25_000);

  socket.on('message', async (frame) => {
    const msg = decodeProtobuf(frame);
    // Persist durably first -> publish to recipient's gateway channel
    await kafka.produce('chat.messages', { key: msg.channelId, value: msg });
  });

  socket.on('close', () => {
    clearInterval(hb);
    localSockets.delete(userId);
  });
});`,
  },
  {
    id: 'enqueue',
    title: 'Enqueue & Durable Async Queues (Peak Shaving, Outbox & Backpressure)',
    shortTitle: 'Enqueue & Queues',
    direction: 'Producer -> Durable Broker -> Competing Workers',
    tagline: 'Absorb 100x traffic spikes like IRCTC Tatkal or Black Friday without crashing downstream databases.',
    simpleEnglish:
      'Think of Enqueue like a ticket dispenser at a busy bank. Even if 50,000 customers rush through the doors at 10:00 AM sharp, everyone instantly gets a numbered ticket (`202 Accepted`) while tellers (Workers) serve tickets at a steady, safe speed without collapsing!',
    technicalDefinition:
      'Asynchronous message buffering decouples request ingestion from execution via durable brokers (Kafka, RabbitMQ, SQS, Redis Streams). Production architectures pair the Transactional Outbox Pattern (atomic DB + event write), Partitioned Ordering, Visibility-Timeout Leases, Idempotent Consumers, Priority/Delay Queues, and Dead-Letter Queues (DLQ).',
    whenToUse: [
      'Peak-shaving bursty traffic: IRCTC Tatkal booking queue, BookMyShow concert drops, flash-sale checkout.',
      'Heavy background pipelines: Instagram/YouTube video transcoding, PDF invoices, email/SMS blasts, search re-indexing.',
      'Resilient microservice decoupling when downstream payment gateways or GDS airlines slow down.',
    ],
    whenNotToUse: [
      'Synchronous user flows that MUST return immediate computed results in <50ms (e.g., password login validation or reading a cached profile).',
    ],
    reliabilityGuarantees: [
      'Use Transactional Outbox (`INSERT INTO outbox` in the same SQL Tx) so a crash between DB commit and Queue push NEVER loses an event.',
      'Always design consumers to be **Idempotent** (`unique_key` check) because network retries deliver messages At-Least-Once.',
      'Isolate slow/poison messages into a **Dead-Letter Queue (DLQ)** with alerting + replay tooling so 1 corrupt JSON payload never blocks the partition.',
    ],
    protocolDiagramSteps: [
      { step: 1, actor: 'API + Outbox Tx', action: 'Atomic DB + Outbox Enqueue', detail: 'Saves order + outbox row in 1 ACID transaction; returns 202 Accepted in 8ms.' },
      { step: 2, actor: 'Broker Partition', action: 'Persist & Replicate Log', detail: 'Appends to durable partition (key = entity_id for strict per-entity order).' },
      { step: 3, actor: 'Worker Pool', action: 'Lease + Idempotent Execute', detail: 'Worker claims message with visibility lease, checks idempotency key, runs job.' },
      { step: 4, actor: 'ACK / Retry / DLQ', action: 'Commit or Quarantine', detail: 'ACKs on success; retries with full jitter on transient error; routes poison pills to DLQ.' },
    ],
    productionCode: `-- Transactional Outbox Enqueue Pattern (Zero Dual-Write Data Loss!)
BEGIN;
  INSERT INTO bookings (id, user_id, show_id, status)
  VALUES ($1, $2, $3, 'PENDING_PAYMENT');

  -- Enqueue inside the EXACT same ACID DB transaction!
  INSERT INTO outbox_events (id, aggregate_id, topic, payload)
  VALUES (gen_random_uuid(), $1, 'booking.created', $4);
COMMIT;
-- Debezium CDC / Outbox Relay streams committed rows to Kafka/SQS reliably!`,
  },
];

/* ============================================================================
   PART 2: 17 REAL-WORLD SYSTEM DESIGN BLUEPRINTS + COMPLETE DB-LEVEL DESIGNS
   ============================================================================ */

export const REAL_WORLD_DOMAIN_META: { id: 'all' | RealWorldDomain; label: string }[] = [
  { id: 'all', label: 'All 17 Systems' },
  { id: 'booking-travel', label: 'Zepto/Blinkit, IRCTC, BookMyShow & Flights/GDS' },
  { id: 'fintech-exchanges', label: 'NASDAQ/NSE/BSE, Zerodha & Payments' },
  { id: 'ai-search-web', label: 'ChatGPT/Gemini, Google Search, Internet & Video' },
  { id: 'realtime-social-telecom', label: 'Instagram, WhatsApp, Uber, Teams/Slack & Telecom' },
];

export const REAL_WORLD_SYSTEM_BLUEPRINTS: RealWorldSystemBlueprint[] = [
  {
    id: 'zepto-blinkit-instamart',
    shortTitle: 'Zepto / Blinkit / Instamart',
    title: 'Quick-Commerce 10-Minute Delivery Platform (Zepto, Blinkit & Swiggy Instamart)',
    domain: 'booking-travel',
    commPatterns: ['WebSocket', 'Enqueue', 'Webhook'],
    scaleBadge: '10-Min SLA · 1,000+ Dark Stores · 90s Pick-Pack',
    simpleEnglish:
      'Delivering groceries in 10 minutes is NOT a normal e-commerce app with faster bikes — it is a hyper-local micro-warehouse symphony! The instant you open the app, your GPS maps via H3 hexagons to ONE nearby Dark Store (1.5–2.5 km away), showing ONLY that store’s exact live shelf count. On checkout, inventory locks atomically so the last milk carton is never oversold, a handheld scanner routes a picker through aisles in <90 seconds, and a rider is dispatched Just-In-Time to meet the sealed bag at the gate!',
    architectureSummary:
      'GPS -> H3 Polygon Serviceability & Dynamic ETA Engine (Picker Queue + Rain + Rider Supply) -> Dark-Store-Sharded Catalog & Redis Inventory Cache -> Atomic Multi-SKU Stock Reservation & Payment Webhook -> Transactional Outbox -> 90s Dark-Store WMS Picker Routing -> Just-In-Time Rider Clubbing & Dispatch -> Live WebSocket Order + Rider GPS Stream.',
    capacityNumbers: [
      { metric: 'Doorstep Delivery SLA', value: '8–12 min (p90)' },
      { metric: 'Dark-Store Pick & Pack', value: '< 90 sec target' },
      { metric: 'SKUs per Dark Store', value: '8,000–15,000 SKUs' },
      { metric: 'Inventory Sync Lag', value: '< 500 ms (Zero Oversell)' },
    ],
    coreAlgorithms: [
      'H3 Hexagonal Polygon -> Dark-Store Routing with Dynamic Load Failover: maps user `(lat, lng)` to primary store + fallback neighbor if primary picker queue exceeds 120s.',
      'Atomic Multi-SKU All-or-Nothing Reservation (`available_qty >= req_qty` sorted by `sku_id`) prevents overselling the last 1 unit of milk/bread during 8 PM dinner rushes without deadlocks.',
      'Dark-Store WMS S-Shape Aisle Batch Picking: groups 2–3 small orders per picker handheld scanner sorted by physical rack/zone (`Ambient -> Chilled -> Frozen`) to hit <90s pack time.',
      'Just-In-Time (JIT) Rider Dispatch + Multi-Order Clubbing: predicts exact `pack_ready_ts` and assigns a rider whose arrival ETA matches handover, clubbing 2 nearby drop-offs along the same bearing!',
    ],
    bottleneckAndFix:
      'IPL Match / Monsoon Rain Surge: 20,000 customers in one neighborhood flood a single Dark Store while riders drop offline in rain -> Dynamic ETA Padding + Store Admission Throttling (temporarily hide slow/bulky SKUs or failover to adjacent dark store), short 5-min payment reservation TTLs, and real-time Mid-Pick Item Substitution / Instant Partial Refund if a bin is physically damaged!',
    dbDesignSummary:
      'PostgreSQL sharded strictly by `dark_store_id` so every multi-SKU cart reservation, pick task creation, and order state transition runs inside ONE single-shard ACID transaction! Hot catalog reads (`store:{id}:sku_qty`) are served from Redis Hashes updated via CDC/Outbox, while live rider GPS streams into an in-memory H3 geospatial index.',
    dbTables: [
      {
        tableName: 'dark_store_inventory',
        engine: 'PostgreSQL (Sharded by dark_store_id) + Redis Cache',
        partitionOrShardKey: 'dark_store_id',
        columns: [
          { name: 'dark_store_id', type: 'INT', key: 'SHARD' },
          { name: 'sku_id', type: 'BIGINT', key: 'PK' },
          { name: 'available_qty', type: 'INT' },
          { name: 'reserved_qty', type: 'INT' },
          { name: 'bin_location', type: 'VARCHAR(16)', key: 'IDX' },
          { name: 'version', type: 'INT' },
        ],
      },
      {
        tableName: 'qcom_orders',
        engine: 'PostgreSQL ACID (Co-located by dark_store_id)',
        partitionOrShardKey: 'dark_store_id',
        columns: [
          { name: 'order_id', type: 'UUID', key: 'PK' },
          { name: 'dark_store_id', type: 'INT', key: 'SHARD' },
          { name: 'user_id', type: 'BIGINT', key: 'IDX' },
          { name: 'state', type: 'VARCHAR(24)', key: 'IDX' },
          { name: 'promised_eta_sec', type: 'INT' },
          { name: 'payment_lock_token', type: 'UUID', key: 'UK' },
        ],
      },
      {
        tableName: 'wms_pick_tasks',
        engine: 'PostgreSQL ACID + Outbox Queue',
        partitionOrShardKey: 'dark_store_id',
        columns: [
          { name: 'task_id', type: 'UUID', key: 'PK' },
          { name: 'dark_store_id', type: 'INT', key: 'SHARD' },
          { name: 'order_id', type: 'UUID', key: 'FK' },
          { name: 'picker_id', type: 'BIGINT', key: 'IDX' },
          { name: 'bin_sequence_json', type: 'JSONB' },
          { name: 'packed_at', type: 'TIMESTAMPTZ' },
        ],
      },
      {
        tableName: 'rider_dispatch_leases',
        engine: 'Redis H3 Geo + PostgreSQL Assignment Log',
        partitionOrShardKey: 'city_id',
        columns: [
          { name: 'rider_id', type: 'BIGINT', key: 'PK' },
          { name: 'city_id', type: 'INT', key: 'SHARD' },
          { name: 'h3_cell', type: 'BIGINT', key: 'IDX' },
          { name: 'clubbed_order_ids', type: 'UUID[]' },
          { name: 'lease_expires_at', type: 'TIMESTAMPTZ' },
        ],
      },
    ],
    dbDdlSnippet: `-- Atomic Multi-SKU Reservation inside ONE dark_store_id Shard (Zero Oversell, Zero Deadlock!)
BEGIN;
-- 1. Lock requested SKUs in ascending sku_id order to prevent circular deadlocks!
WITH req(sku_id, qty) AS (
  VALUES (1001, 2), (2045, 1), (3088, 1)
),
reserved AS (
  UPDATE dark_store_inventory inv
  SET available_qty = inv.available_qty - req.qty,
      reserved_qty  = inv.reserved_qty + req.qty,
      version       = inv.version + 1
  FROM req
  WHERE inv.dark_store_id = $store_id
    AND inv.sku_id = req.sku_id
    AND inv.available_qty >= req.qty
  RETURNING inv.sku_id, inv.bin_location
)
SELECT COUNT(*) AS matched_skus FROM reserved;
-- App verifies matched_skus == 3 (All-or-Nothing!), else ROLLBACK & show exact OOS SKU!

-- 2. Enqueue WMS 90-second Pick Task atomically via Transactional Outbox!
INSERT INTO outbox_events (id, aggregate_id, topic, payload)
VALUES (gen_random_uuid(), $order_id, 'wms.pick_task.created', $bin_route_json);
COMMIT;`,
    dfdNodes: [
      { id: 'geo', label: 'H3 Store Router', sublabel: 'Polygon + ETA', x: 74, y: 112 },
      { id: 'inv', label: 'Dark-Store Inv', sublabel: 'Redis + Shard DB', x: 212, y: 62 },
      { id: 'chk', label: 'Atomic Checkout', sublabel: 'Multi-SKU Lock', x: 356, y: 162 },
      { id: 'wms', label: '90s Picker WMS', sublabel: 'Bin Scan Route', x: 494, y: 62 },
      { id: 'rdr', label: 'JIT Rider Match', sublabel: 'Club + Live WS', x: 606, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'geo', to: 'inv', label: 'Resolve Store' },
      { id: 'e2', from: 'inv', to: 'chk', label: 'Reserve SKUs' },
      { id: 'e3', from: 'chk', to: 'wms', label: 'Outbox Pick' },
      { id: 'e4', from: 'wms', to: 'rdr', label: 'JIT Dispatch' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'H3 Geo-Resolution Picks Best Dark Store & Live ETA',
        plainEnglish:
          'Your GPS coordinates map in <3ms to the nearest serving Dark Store (e.g., Koramangala Store #14), factoring in live picker backlog, rain, and idle riders to display an honest "9 mins" ETA.',
        technicalDetail:
          'In-memory H3 Resolution-9 lookup returns primary + fallback dark store IDs; dynamic ETA = `predict_pick(backlog) + handover + OSRM_road_eta(store, user)`.',
        activeNodeIds: ['geo', 'inv'],
        activeEdgeIds: ['e1'],
        packetLabel: 'STORE #14',
      },
      {
        step: 2,
        title: 'Atomic Multi-SKU Stock Reservation & Payment Capture',
        plainEnglish:
          'On checkout, every cart item is locked together inside Store #14’s shard so two neighbors can never both buy the last carton of milk — and a signed UPI/Card webhook confirms payment cleanly.',
        technicalDetail:
          'Single-shard ACID `UPDATE ... WHERE available_qty >= req_qty` sorted by `sku_id` + `outbox_events` insert in the same commit.',
        activeNodeIds: ['inv', 'chk'],
        activeEdgeIds: ['e2'],
        packetLabel: 'LOCK SKUs',
      },
      {
        step: 3,
        title: '90-Second Picker Handheld Routing & Just-In-Time Rider Handover',
        plainEnglish:
          'A store picker’s handheld lights up with the shortest bin sequence (`A1 -> B4 -> Fridge C2`). Meanwhile, Dispatch assigns a nearby rider to arrive right as the bag seals, streaming live GPS via WebSocket!',
        technicalDetail:
          'Barcode scan verifies physical item; JIT bipartite dispatcher clubs compatible orders going in the same direction to cut cost per delivery 35%.',
        activeNodeIds: ['chk', 'wms', 'rdr'],
        activeEdgeIds: ['e3', 'e4'],
        packetLabel: '9 MIN ETA',
      },
    ],
  },
  {
    id: 'irctc-tatkal',
    shortTitle: 'IRCTC (Tatkal)',
    title: 'IRCTC Railway Reservation & Tatkal 10:00 AM Extreme-Contention Booking Engine',
    domain: 'booking-travel',
    commPatterns: ['Enqueue', 'Webhook'],
    scaleBadge: '25K+ tickets/min · 10M Tatkal burst',
    simpleEnglish:
      'At 10:00 AM sharp, millions of passengers hit IRCTC for the exact same train’s Tatkal seats. To survive without overselling a single berth, IRCTC places burst traffic into a Virtual Waiting Queue, uses ultra-fast in-memory seat-segment bitmaps (so Passenger A riding Delhi->Kanpur and Passenger B riding Kanpur->Kolkata can safely share Seat #14!), and confirms via idempotent payment webhooks.',
    architectureSummary:
      'Edge Bot/CAPTCHA + Virtual Waiting Queue -> Stateless Booking API -> Train-Date Sharded Partition (Single-Writer Queue per Train+Date eliminates cross-node lock storms!) -> Segment-Bitmap Seat Allocator -> Payment Gateway + Async Webhook Confirmation -> PNR Read Replicas.',
    capacityNumbers: [
      { metric: 'Tatkal Peak RPS', value: '500K+ req/sec' },
      { metric: 'Bookings / Min', value: '28,000+ PNRs' },
      { metric: 'Zero Oversell SLA', value: '100% Strong ACID' },
      { metric: 'Seat Hold TTL', value: '5–8 min lease' },
    ],
    coreAlgorithms: [
      'Station-Segment Bitmask Allocation (`occupied_mask & req_mask == 0`) enables multi-leg reuse of the exact same physical berth in O(1) bitwise CPU ops!',
      'Partitioned Single-Writer Enqueue per `(train_id, journey_date)` serializes seat claims without distributed 2PC deadlock storms.',
      'RAC / Waitlist Priority Queue auto-promotion triggered by cancellation events.',
    ],
    bottleneckAndFix:
      'Row-lock thrashing when 50,000 users run `SELECT FOR UPDATE` on Train 12951 simultaneously -> shard inventory by `(train_id, journey_date)` and serialize seat reservation through an in-memory Redis Lua / Partitioned Queue before flushing ACID PNR records to DB.',
    dbDesignSummary:
      'Sharded PostgreSQL/Oracle by `HASH(train_id, journey_date)` so all coaches, seats, and PNRs for one train departure live on ONE shard (zero cross-shard joins!). Bitmask column `segment_mask BIGINT` represents up to 64 station stops per seat.',
    dbTables: [
      {
        tableName: 'train_seat_inventory',
        engine: 'PostgreSQL (Sharded by train_id, journey_date)',
        partitionOrShardKey: '(train_id, journey_date)',
        columns: [
          { name: 'train_id', type: 'INT', key: 'SHARD' },
          { name: 'journey_date', type: 'DATE', key: 'SHARD' },
          { name: 'coach_seat_id', type: 'VARCHAR(12)', key: 'PK' },
          { name: 'quota_type', type: 'VARCHAR(10)', key: 'IDX' },
          { name: 'segment_mask', type: 'BIGINT' },
          { name: 'hold_expires_at', type: 'TIMESTAMPTZ', key: 'IDX' },
        ],
      },
      {
        tableName: 'pnr_bookings',
        engine: 'PostgreSQL ACID + Read Replicas',
        partitionOrShardKey: '(train_id, journey_date)',
        columns: [
          { name: 'pnr_no', type: 'CHAR(10)', key: 'PK' },
          { name: 'user_id', type: 'BIGINT', key: 'IDX' },
          { name: 'from_stop_bit', type: 'SMALLINT' },
          { name: 'to_stop_bit', type: 'SMALLINT' },
          { name: 'status', type: 'VARCHAR(16)' },
          { name: 'payment_ref', type: 'TEXT', key: 'UK' },
        ],
      },
    ],
    dbDdlSnippet: `-- Atomic Segment-Bitmap Berth Reservation (Zero Oversell + Multi-Leg Seat Reuse!)
UPDATE train_seat_inventory
SET segment_mask = segment_mask | $req_bitmask,
    hold_expires_at = NOW() + INTERVAL '6 minutes'
WHERE train_id = $1 AND journey_date = $2 AND coach_seat_id = $3
  AND (segment_mask & $req_bitmask) = 0  -- Proves zero overlap between stops!
RETURNING coach_seat_id;`,
    dfdNodes: [
      { id: 'q', label: 'Virtual Waiting Q', sublabel: 'Bot + Rate Limit', x: 74, y: 112 },
      { id: 'eng', label: 'Train Shard Queue', sublabel: 'Single-Writer Key', x: 212, y: 64 },
      { id: 'bit', label: 'Segment Bitmask', sublabel: 'O(1) Berth Hold', x: 356, y: 162 },
      { id: 'pay', label: 'Payment + Webhook', sublabel: 'Idempotent UPI', x: 492, y: 64 },
      { id: 'db', label: 'PNR Sharded DB', sublabel: 'ACID + Waitlist', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'q', to: 'eng', label: 'Admit Token' },
      { id: 'e2', from: 'eng', to: 'bit', label: 'Hold Berth' },
      { id: 'e3', from: 'bit', to: 'pay', label: '6m Lease' },
      { id: 'e4', from: 'pay', to: 'db', label: 'Webhook Confirm' },
    ],
    dfdSteps: [
      { step: 1, title: 'Tatkal Waiting Room Admission & Bot Defense', plainEnglish: 'Absorbs 500K RPS spikes in an edge queue and admits steady batches to protect the booking tier.', technicalDetail: 'Signed waiting-room JWT token enforces fair FIFO admission without DB hits.', activeNodeIds: ['q', 'eng'], activeEdgeIds: ['e1'], packetLabel: 'ADMIT TOKEN' },
      { step: 2, title: 'Bitmask Segment Check & Temporary Berth Hold', plainEnglish: 'Uses a single bitwise AND to verify if stops 3->7 on Berth B2-14 are free and locks it for 6 minutes.', technicalDetail: 'Redis Lua / Partitioned Writer runs `(mask & req) == 0` atomically in <1ms.', activeNodeIds: ['eng', 'bit'], activeEdgeIds: ['e2'], packetLabel: 'MASK & REQ==0' },
      { step: 3, title: 'UPI / Card Checkout & Idempotent Webhook Confirm', plainEnglish: 'User pays while berth is safely held; payment webhook confirms the PNR or expiry sweeper releases the berth.', technicalDetail: 'UNIQUE(payment_ref) guarantees duplicate webhooks never issue two PNRs.', activeNodeIds: ['bit', 'pay', 'db'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'PNR CONFIRMED' },
    ],
  },
  {
    id: 'bookmyshow-ticketing',
    shortTitle: 'BookMyShow',
    title: 'BookMyShow Cinema & Mega-Concert Seat-Lock Ticketing Architecture',
    domain: 'booking-travel',
    commPatterns: ['Enqueue', 'WebSocket', 'Webhook'],
    scaleBadge: '2M+ concert queue · 10m seat lock',
    simpleEnglish:
      'When 2 million fans try to grab 50,000 stadium seats at noon, everyone sees a live color-coded seat map (Available / Locked / Sold). Clicking a seat acquires a 10-minute distributed lock in Redis + DB (`SKIP LOCKED`), pushes instant seat-state diffs via WebSocket/SSE, and confirms via Payment Webhook.',
    architectureSummary:
      'CDN Static Venue SVG Map + Edge Waiting Room Queue -> Show-Sharded Seat Lock Service (Redis Lua TTL + PostgreSQL `version` Optimistic Lock) -> Payment Service + Webhook -> QR Ticket Generator & Async Notification Queue.',
    capacityNumbers: [
      { metric: 'Mega-Event Spike', value: '1M+ waiting users' },
      { metric: 'Seat Map Read QPS', value: '200K/sec (Cached)' },
      { metric: 'Seat Lock Lease', value: '10 min TTL' },
      { metric: 'Double-Book Rate', value: '0% (ACID + Fence)' },
    ],
    coreAlgorithms: [
      'Two-Phase Seat Reservation: `AVAILABLE -> LOCKED (expires_at, lock_token) -> BOOKED` with Fencing Token verified at payment capture!',
      'Optimistic Concurrency Control (`WHERE status = \'AVAILABLE\' AND version = $v`) prevents race conditions cleanly.',
      'Delayed Expiry Queue + Lazy TTL check auto-releases abandoned seats when checkout times out.',
    ],
    bottleneckAndFix:
      'Payment webhook arrives at minute 10:02 right after the 10:00 seat lock expired and someone else grabbed the seat -> Payment capture MUST verify the exact `lock_token` inside an ACID transaction; if expired, trigger automatic instant refund!',
    dbDesignSummary:
      'PostgreSQL sharded by `show_id` (`show_seats` holds 1 row per physical seat per show, ~500–60,000 rows/show) paired with Redis Hash `show:{id}:seats` for <2ms seat-map renders.',
    dbTables: [
      {
        tableName: 'show_seats',
        engine: 'PostgreSQL (Sharded by show_id)',
        partitionOrShardKey: 'show_id',
        columns: [
          { name: 'show_id', type: 'BIGINT', key: 'SHARD' },
          { name: 'seat_id', type: 'VARCHAR(12)', key: 'PK' },
          { name: 'status', type: 'VARCHAR(12)', key: 'IDX' },
          { name: 'lock_token', type: 'UUID' },
          { name: 'locked_until', type: 'TIMESTAMPTZ', key: 'IDX' },
          { name: 'version', type: 'INT' },
        ],
      },
      {
        tableName: 'bookings',
        engine: 'PostgreSQL ACID',
        partitionOrShardKey: 'show_id',
        columns: [
          { name: 'booking_id', type: 'UUID', key: 'PK' },
          { name: 'user_id', type: 'BIGINT', key: 'IDX' },
          { name: 'show_id', type: 'BIGINT', key: 'FK' },
          { name: 'amount_cents', type: 'BIGINT' },
          { name: 'payment_state', type: 'VARCHAR(16)' },
        ],
      },
    ],
    dbDdlSnippet: `-- Atomic Multi-Seat Lock (All-or-Nothing: prevents locking 2 of 3 requested seats!)
UPDATE show_seats
SET status = 'LOCKED', lock_token = $token, locked_until = NOW() + INTERVAL '10 min', version = version + 1
WHERE show_id = $1 AND seat_id = ANY($seat_ids)
  AND (status = 'AVAILABLE' OR (status = 'LOCKED' AND locked_until < NOW()))
RETURNING seat_id;
-- App verifies returned_count == requested_count before COMMIT, else ROLLBACK!`,
    dfdNodes: [
      { id: 'wait', label: 'Concert Queue', sublabel: 'FIFO Drop Gate', x: 74, y: 112 },
      { id: 'map', label: 'Redis Seat Map', sublabel: 'Live WS Diffs', x: 212, y: 64 },
      { id: 'lock', label: 'Atomic Seat Lock', sublabel: '10m TTL + Token', x: 356, y: 162 },
      { id: 'pay', label: 'Payment + Webhook', sublabel: 'Verify Token', x: 492, y: 64 },
      { id: 'db', label: 'Show-Sharded DB', sublabel: 'BOOKED + QR', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'wait', to: 'map', label: 'Enter Venue' },
      { id: 'e2', from: 'map', to: 'lock', label: 'Pick Seats' },
      { id: 'e3', from: 'lock', to: 'pay', label: 'Hold 10m' },
      { id: 'e4', from: 'pay', to: 'db', label: 'Commit / Refund' },
    ],
    dfdSteps: [
      { step: 1, title: 'Waiting Room Gate & Cached Seat Map Load', plainEnglish: 'Fans enter in controlled waves and view seat availability served from Redis/CDN with live WebSocket updates.', technicalDetail: 'Separates 200K/s seat-map reads from ACID write path.', activeNodeIds: ['wait', 'map'], activeEdgeIds: ['e1'], packetLabel: 'MAP SNAP' },
      { step: 2, title: 'All-or-Nothing Atomic Multi-Seat Lock', plainEnglish: 'Locks all 4 chosen seats together for 10 minutes—if even 1 seat was taken 1ms earlier, the whole batch rolls back cleanly.', technicalDetail: 'Single SQL transaction checks `(status=AVAILABLE OR expired)` and verifies exact row count.', activeNodeIds: ['map', 'lock'], activeEdgeIds: ['e2'], packetLabel: 'LOCK 4 SEATS' },
      { step: 3, title: 'Webhook Payment Confirmation & Fencing Check', plainEnglish: 'When payment succeeds, the DB confirms the lock token is still valid, flips seats to BOOKED, and enqueues QR ticket email.', technicalDetail: 'Prevents late-webhook double booking via strict `WHERE lock_token = $token`.', activeNodeIds: ['lock', 'pay', 'db'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'QR ISSUED' },
    ],
  },
  {
    id: 'flight-booking-gds',
    shortTitle: 'Flight & GDS Platform',
    title: 'Flight Booking, Ticket Exchange/Reissue & Global Distribution System (GDS — Amadeus / Sabre)',
    domain: 'booking-travel',
    commPatterns: ['Enqueue', 'Webhook', 'gRPC/SIP'],
    scaleBadge: '100K+ fare searches/sec · 400+ Airlines',
    simpleEnglish:
      'Booking or exchanging a flight across 400 airlines requires a Global Distribution System (GDS like Amadeus/Sabre). Search reads fast pre-computed fare caches (combining multi-leg routes with Dijkstra/A*), while Booking & Ticket Exchange execute a strict 2-step **Price-Revalidate -> Hold PNR -> Issue/Reissue e-Ticket** Saga across airline PSS inventory systems!',
    architectureSummary:
      'Meta-Search Aggregator + Fare Cache (ATPCO rules + Airline NDC/EDIFACT feeds) -> Multi-Leg Route Graph Engine -> GDS Inventory Hold (PNR Creation) -> Fare Re-Pricing & Exchange Calculator (Diff + Penalty) -> Atomic Ticketing / EMD Issuance -> Webhook Schedule-Change & Refund Sync.',
    capacityNumbers: [
      { metric: 'Look-to-Book Ratio', value: '500 : 1 (Read Heavy)' },
      { metric: 'Fare Combinations', value: '10B+ cached O&D pairs' },
      { metric: 'PNR Hold Consistency', value: 'Strong Airline PSS' },
      { metric: 'Exchange Reissue', value: 'Saga + Compensating Tx' },
    ],
    coreAlgorithms: [
      'Time-Dependent Dijkstra / A* over Flight Leg Graph (respecting Minimum Connection Time `MCT >= 45m` & interline baggage rules).',
      'Fare-Bucket Inventory Yield Management (Nested Booking Classes Y/B/M/Q/L updated live via Airline AVS/NDC streams).',
      'Saga Orchestrator for **Flight Exchange / Reissue**: Hold New Segment -> Calculate Fare Difference + Change Fee -> Charge Delta -> Reissue e-Ticket -> Release Old Seat (auto-compensates on any failure!).',
    ],
    bottleneckAndFix:
      'Searching 400 live airline PSS systems directly on every user search would cost $millions in GDS fees and take 15 seconds -> serve 99% of searches from an in-memory Pre-Computed Fare Cache updated by streaming Airline Availability deltas, and call Live Airline Re-Pricing ONLY when the user clicks "Book / Exchange"!',
    dbDesignSummary:
      'Polyglot Travel DB: Redis/Aerospike Fare Cache for <80ms search; Strongly consistent PostgreSQL/CockroachDB for **PNR, Segments, Passengers, e-Ticket Numbers (13-digit IATA), and Exchange Audit Ledger**; Event Queue (Kafka) for airline schedule-change webhooks.',
    dbTables: [
      {
        tableName: 'flight_inventory_buckets',
        engine: 'PostgreSQL / PSS Sharded by flight_date',
        partitionOrShardKey: '(carrier_flight, dep_date)',
        columns: [
          { name: 'flight_leg_id', type: 'BIGINT', key: 'PK' },
          { name: 'booking_class', type: 'CHAR(1)', key: 'PK' },
          { name: 'seats_available', type: 'SMALLINT' },
          { name: 'fare_cents', type: 'INT' },
          { name: 'version', type: 'INT' },
        ],
      },
      {
        tableName: 'pnr_records',
        engine: 'PostgreSQL ACID',
        partitionOrShardKey: 'pnr_locator',
        columns: [
          { name: 'pnr_locator', type: 'CHAR(6)', key: 'PK' },
          { name: 'eticket_no', type: 'CHAR(13)', key: 'UK' },
          { name: 'parent_eticket_no', type: 'CHAR(13)', key: 'FK' },
          { name: 'status', type: 'VARCHAR(16)', key: 'IDX' },
          { name: 'total_paid_cents', type: 'BIGINT' },
        ],
      },
    ],
    dbDdlSnippet: `-- Ticket Exchange / Reissue Ledger (Links Original e-Ticket -> New Reissued e-Ticket)
CREATE TABLE ticket_exchanges (
    exchange_id       UUID PRIMARY KEY,
    pnr_locator       CHAR(6) NOT NULL REFERENCES pnr_records(pnr_locator),
    old_eticket_no    CHAR(13) NOT NULL,
    new_eticket_no    CHAR(13) NOT NULL UNIQUE,
    fare_diff_cents   BIGINT NOT NULL,
    change_fee_cents  BIGINT NOT NULL,
    saga_state        VARCHAR(24) NOT NULL, -- HOLD_NEW -> CHARGED -> REISSUED -> OLD_RELEASED
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`,
    dfdNodes: [
      { id: 'srch', label: 'Fare Cache & Graph', sublabel: 'A* + ATPCO Rules', x: 74, y: 112 },
      { id: 'gds', label: 'GDS / NDC Router', sublabel: 'Live Price Check', x: 212, y: 64 },
      { id: 'saga', label: 'Booking/Exch Saga', sublabel: 'Hold -> Diff -> Pay', x: 356, y: 162 },
      { id: 'pss', label: 'Airline PSS Seat', sublabel: 'Issue 13-Digit Tkt', x: 492, y: 64 },
      { id: 'db', label: 'PNR & Exchange DB', sublabel: 'Webhook Sync', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'srch', to: 'gds', label: 'Select Itinerary' },
      { id: 'e2', from: 'gds', to: 'saga', label: 'Live Re-Price' },
      { id: 'e3', from: 'saga', to: 'pss', label: 'Hold / Reissue' },
      { id: 'e4', from: 'pss', to: 'db', label: 'Commit PNR' },
    ],
    dfdSteps: [
      { step: 1, title: 'Cached Multi-Leg Route Search (500:1 Look-to-Book)', plainEnglish: 'Searches pre-indexed fare rules and flight graphs in <80ms without hammering airline mainframes.', technicalDetail: 'Applies Minimum Connection Time (MCT) graph pruning + streaming AVS seat-bucket invalidation.', activeNodeIds: ['srch', 'gds'], activeEdgeIds: ['e1'], packetLabel: 'ROUTE A*' },
      { step: 2, title: 'Live GDS / NDC Fare Revalidation & Seat Hold', plainEnglish: 'Calls the airline PSS directly to verify exact live fare and places a temporary PNR hold.', technicalDetail: 'Handles both legacy EDIFACT and modern XML/JSON IATA NDC APIs uniformly.', activeNodeIds: ['gds', 'saga'], activeEdgeIds: ['e2'], packetLabel: 'HOLD PNR' },
      { step: 3, title: 'Ticket Issuance or Atomic Flight Exchange Saga', plainEnglish: 'For exchanges, calculates fare difference + penalty, captures delta payment, issues the new 13-digit e-ticket, and releases the old seat.', technicalDetail: 'Compensating Saga step voids new hold automatically if payment or PSS reissue fails.', activeNodeIds: ['saga', 'pss', 'db'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'ETKT ISSUED' },
    ],
  },
  {
    id: 'stock-exchange-matching',
    shortTitle: 'NASDAQ / NSE / BSE',
    title: 'Stock Exchange Matching Engine (NASDAQ / NSE / BSE) — Sub-20µs Deterministic Order Book',
    domain: 'fintech-exchanges',
    commPatterns: ['Multicast/Binary', 'Enqueue'],
    scaleBadge: '1M+ orders/sec · <20µs match latency',
    simpleEnglish:
      'A stock exchange like NASDAQ or NSE cannot wait for slow SQL queries or thread locks! Every buy/sell order enters a lock-free Ring Buffer (LMAX Disruptor) into a single ultra-fast CPU core pinned in RAM. That core matches bids and asks in microseconds using a sorted Order Book, journals every event to disk, and broadcasts prices to millions via UDP Multicast!',
    architectureSummary:
      'Binary FIX/OUCH Order Gateway -> Pre-Trade Risk Firewall -> LMAX Disruptor Lock-Free Ring Buffer -> Deterministic Single-Threaded Matching Engine (Sharded by Symbol: AAPL / RELIANCE) -> Append-Only Event Journal + Active-Standby Raft Replica -> ITCH Market Data Multicast + T+1 Clearing Ledger DB.',
    capacityNumbers: [
      { metric: 'Order Throughput', value: '1M+ msgs/sec per shard' },
      { metric: 'Match p99 Latency', value: '< 20 microseconds' },
      { metric: 'Determinism', value: '100% Replayable Log' },
      { metric: 'Settlement', value: 'T+1 Clearing Ledger' },
    ],
    coreAlgorithms: [
      'Price-Time Priority Limit Order Book (LOB): Red-Black Tree / Indexed Array of Price Levels -> O(1) FIFO Doubly-Linked List of Orders + HashMap `orderId -> Node*` for O(1) Cancel!',
      'LMAX Disruptor Mechanical Sympathy: Pre-allocated cache-line padded ring buffer avoids JVM GC pauses and CPU cache misses.',
      'Deterministic State-Machine Replication: Standby engine replays the exact same ordered input journal for instant zero-loss failover.',
    ],
    bottleneckAndFix:
      'Multi-threaded locks or Garbage Collection pauses create 50ms latency spikes (fatal in trading!) -> shard matching strictly by Stock Symbol, run 1 pinned thread per shard with zero heap allocations on the hot path, and persist asynchronously via sequential journal!',
    dbDesignSummary:
      'Hot Path uses ZERO SQL DB calls (pure RAM LOB + sequential Aeron/WAL Event Journal). Warm/Cold Path streams executions via Kafka into PostgreSQL/ClickHouse for Regulatory Audit (SEBI/SEC), T+1 Clearing & Settlement, and Historical Tick Analytics.',
    dbTables: [
      {
        tableName: 'order_event_journal',
        engine: 'Append-Only Sequenced WAL + ClickHouse',
        partitionOrShardKey: '(symbol, trade_date)',
        columns: [
          { name: 'seq_id', type: 'BIGINT', key: 'PK' },
          { name: 'symbol', type: 'VARCHAR(16)', key: 'SHARD' },
          { name: 'order_id', type: 'BIGINT', key: 'IDX' },
          { name: 'side_price_qty', type: 'STRUCT' },
          { name: 'event_ns', type: 'BIGINT' },
        ],
      },
      {
        tableName: 'trade_executions_ledger',
        engine: 'PostgreSQL ACID (T+1 Clearing)',
        partitionOrShardKey: 'trade_date',
        columns: [
          { name: 'trade_id', type: 'BIGINT', key: 'PK' },
          { name: 'buy_order_id', type: 'BIGINT', key: 'IDX' },
          { name: 'sell_order_id', type: 'BIGINT', key: 'IDX' },
          { name: 'exec_price_ticks', type: 'BIGINT' },
          { name: 'exec_qty', type: 'INT' },
        ],
      },
    ],
    dbDdlSnippet: `-- Prices stored strictly as exact integer ticks (NEVER FLOAT/DOUBLE in finance!)
CREATE TABLE trade_executions_ledger (
    trade_id         BIGINT PRIMARY KEY,
    symbol           VARCHAR(16) NOT NULL,
    buy_broker_id    INT NOT NULL,
    sell_broker_id   INT NOT NULL,
    exec_price_ticks BIGINT NOT NULL, -- e.g. 245050 = $2450.50 (100x ticks)
    exec_qty         INT NOT NULL CHECK (exec_qty > 0),
    matched_at_ns    BIGINT NOT NULL
) PARTITION BY RANGE (matched_at_ns);`,
    dfdNodes: [
      { id: 'fix', label: 'FIX/OUCH Gateway', sublabel: 'Binary + Risk Gate', x: 74, y: 112 },
      { id: 'seq', label: 'Sequencer Ring', sublabel: 'LMAX Lock-Free', x: 212, y: 64 },
      { id: 'lob', label: 'Matching Engine', sublabel: 'LOB Tree + FIFO', x: 356, y: 162 },
      { id: 'itch', label: 'ITCH Multicast', sublabel: 'UDP L2 OrderBook', x: 492, y: 64 },
      { id: 'clr', label: 'Journal & Clearing', sublabel: 'T+1 Settlement DB', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'fix', to: 'seq', label: 'Validate Order' },
      { id: 'e2', from: 'seq', to: 'lob', label: 'Seq #N (<2us)' },
      { id: 'e3', from: 'lob', to: 'itch', label: 'Fill Broadcast' },
      { id: 'e4', from: 'lob', to: 'clr', label: 'Persist Trade' },
    ],
    dfdSteps: [
      { step: 1, title: 'Binary FIX/OUCH Ingress & Pre-Trade Risk Checks', plainEnglish: 'Checks broker fat-finger limits, price circuit bands, and throttle quotas in <5 microseconds.', technicalDetail: 'Kernel-bypass Solarflare/DPDK NIC reads binary packets directly into user-space memory.', activeNodeIds: ['fix', 'seq'], activeEdgeIds: ['e1'], packetLabel: 'OUCH ORDER' },
      { step: 2, title: 'Deterministic Sequencer & Single-Core LOB Match', plainEnglish: 'Assigns global sequence #N and matches Buy/Sell orders strictly by Best Price then Earliest Time with zero locks.', technicalDetail: 'O(1) order cancel via HashMap -> intrusive Doubly-Linked List node unlink inside Price Level.', activeNodeIds: ['seq', 'lob'], activeEdgeIds: ['e2'], packetLabel: 'MATCH <15us' },
      { step: 3, title: 'UDP Multicast Market Feed & Clearing Ledger Persistence', plainEnglish: 'Streams live Order Book changes simultaneously to all brokers via multicast while journaling trades for T+1 settlement.', technicalDetail: 'Replayable event log guarantees exact byte-for-byte disaster recovery on standby replicas.', activeNodeIds: ['lob', 'itch', 'clr'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'ITCH + WAL' },
    ],
  },
  {
    id: 'zerodha-kite',
    shortTitle: 'Zerodha Kite',
    title: 'Zerodha Kite Retail Brokerage: Real-Time Market Ticks, RMS Margin Checks & OMS',
    domain: 'fintech-exchanges',
    commPatterns: ['WebSocket', 'Enqueue', 'Webhook'],
    scaleBadge: '15M+ traders · 10M+ orders/day',
    simpleEnglish:
      'Zerodha sits between 15 million retail traders and NSE/BSE exchanges. When you tap "Buy", its Risk Management System (RMS) checks your available cash margin in <5ms, enqueues the order over leased exchange lines, streams live binary price ticks over WebSockets, and updates your P&L portfolio in real time!',
    architectureSummary:
      'Kite Web/Mobile -> Edge Load Balancer -> Stateful Binary WebSocket Ticker Fleet (compressed 44-byte binary packets!) + Stateless OMS API -> In-Memory Redis RMS Margin Engine -> Exchange Leased-Line FIX Adapters -> Async Trade Confirmation -> PostgreSQL Ledger + TimescaleDB OHLC Candles.',
    capacityNumbers: [
      { metric: 'Concurrent WebSockets', value: '3M+ live traders' },
      { metric: 'Market Open Burst', value: '150K+ orders/min (9:15 AM)' },
      { metric: 'Tick Packet Size', value: '44 bytes binary (not JSON!)' },
      { metric: 'RMS Margin Latency', value: '< 5 ms in-memory' },
    ],
    coreAlgorithms: [
      'Binary Struct WebSocket Compression: Replaces 450-byte JSON ticks with 44-byte packed binary buffers (10x bandwidth & CPU savings!).',
      'Atomic In-Memory RMS Margin Reservation (Redis Lua `avail_margin >= req_margin`) prevents double-spending cash across simultaneous orders.',
      'Streaming OHLC Time-Bucket Aggregation builds 1m/5m/1d candlestick charts live into TimescaleDB.',
    ],
    bottleneckAndFix:
      'At 9:15 AM market open, millions of users open Kite simultaneously and flood orders -> pre-warm Redis user margin & holdings snapshots before 9:00 AM, throttle exchange FIX pipes via per-broker token buckets, and stream binary WebSocket diffs only for subscribed instruments!',
    dbDesignSummary:
      'PostgreSQL for strict ACID Orders, Positions, Holdings & Funds Ledger; Redis Cluster for sub-ms RMS Margin & Intraday Positions; TimescaleDB / ClickHouse for multi-year OHLC candlestick time-series.',
    dbTables: [
      {
        tableName: 'oms_orders',
        engine: 'PostgreSQL (Partitioned by trade_date)',
        partitionOrShardKey: 'trade_date',
        columns: [
          { name: 'order_id', type: 'BIGINT', key: 'PK' },
          { name: 'client_id', type: 'VARCHAR(16)', key: 'IDX' },
          { name: 'exchange_order_id', type: 'VARCHAR(32)', key: 'UK' },
          { name: 'symbol_side_qty', type: 'STRUCT' },
          { name: 'status', type: 'VARCHAR(16)', key: 'IDX' },
        ],
      },
      {
        tableName: 'ohlc_candles',
        engine: 'TimescaleDB Hypertable',
        partitionOrShardKey: '(instrument_token, bucket_ts)',
        columns: [
          { name: 'instrument_token', type: 'INT', key: 'PK' },
          { name: 'bucket_ts', type: 'TIMESTAMPTZ', key: 'PK' },
          { name: 'open_high_low_close', type: 'BIGINT[4]' },
          { name: 'volume', type: 'BIGINT' },
        ],
      },
    ],
    dbDdlSnippet: `-- Atomic Margin Check & Hold before forwarding order to NSE/BSE
UPDATE client_margins
SET blocked_margin_paise = blocked_margin_paise + $req_margin,
    updated_at = NOW()
WHERE client_id = $1
  AND (available_cash_paise - blocked_margin_paise) >= $req_margin
RETURNING (available_cash_paise - blocked_margin_paise) AS remaining_margin;`,
    dfdNodes: [
      { id: 'app', label: 'Kite App (WS)', sublabel: '44B Binary Ticks', x: 74, y: 112 },
      { id: 'oms', label: 'OMS + RMS Guard', sublabel: 'Redis Margin <5ms', x: 212, y: 64 },
      { id: 'ex', label: 'NSE/BSE FIX Pipe', sublabel: 'Rate-Limited Line', x: 356, y: 162 },
      { id: 'tick', label: 'Ticker Fan-Out', sublabel: 'PubSub -> WS GW', x: 492, y: 64 },
      { id: 'db', label: 'Ledger + Timescale', sublabel: 'Positions + OHLC', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'app', to: 'oms', label: 'Place Order' },
      { id: 'e2', from: 'oms', to: 'ex', label: 'Margin OK -> FIX' },
      { id: 'e3', from: 'ex', to: 'tick', label: 'Fill + Tick' },
      { id: 'e4', from: 'ex', to: 'db', label: 'Update Ledger' },
    ],
    dfdSteps: [
      { step: 1, title: 'Sub-5ms RMS Margin & Holdings Verification', plainEnglish: 'Verifies you have enough cash or shares in Redis memory before touching the exchange.', technicalDetail: 'Prevents rejected exchange orders and enforces SEBI peak-margin regulations atomically.', activeNodeIds: ['app', 'oms'], activeEdgeIds: ['e1'], packetLabel: 'RMS CHECK' },
      { step: 2, title: 'Exchange FIX Pipe Dispatch & Throttle Control', plainEnglish: 'Enqueues validated orders across leased exchange lines respecting per-second exchange throttle caps.', technicalDetail: 'Maintains persistent TCP/FIX sessions with sequence-number gap recovery.', activeNodeIds: ['oms', 'ex'], activeEdgeIds: ['e2'], packetLabel: 'FIX NEW' },
      { step: 3, title: 'Binary WebSocket Fan-Out & Portfolio Ledger Update', plainEnglish: 'Pushes instant order-fill alerts and 44-byte price ticks over WebSockets while recording trades in Postgres & TimescaleDB.', technicalDetail: 'WebSocket gateways fan out only subscribed instrument tokens to minimize mobile battery & bandwidth.', activeNodeIds: ['ex', 'tick', 'db'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'FILL + TICK' },
    ],
  },
  {
    id: 'chatgpt-google-gemini',
    shortTitle: 'ChatGPT & Gemini',
    title: 'ChatGPT & Google Gemini: Global Multimodal LLM Serving, Streaming & Memory Architecture',
    domain: 'ai-search-web',
    commPatterns: ['SSE', 'Enqueue', 'WebSocket'],
    scaleBadge: '1B+ prompts/day · Token SSE Streaming',
    simpleEnglish:
      'When you send a prompt + image to ChatGPT or Gemini, the edge gateway checks safety & rate limits, fetches your chat history + RAG memory, checks if the system prompt is already cached in GPU RAM (Prefix Caching!), streams tokens word-by-word via SSE from a GPU/TPU cluster using Continuous Batching, and saves the full turn asynchronously!',
    architectureSummary:
      'Global Edge -> Auth/Quota Gateway (Token Bucket by Tokens-Per-Minute!) -> Orchestrator (Multimodal Encoder + Safety Classifier + Tool/Search Router) -> Prefix-Aware Router -> Disaggregated Prefill & Decode GPU/TPU Clusters (vLLM / Sax / PagedAttention) -> SSE Token Stream -> Async Persistence & Vector Memory DB.',
    capacityNumbers: [
      { metric: 'Time-To-First-Token', value: '< 400 ms (Prefill)' },
      { metric: 'Decode Speed', value: '60–150 tokens/sec' },
      { metric: 'Rate Limit Unit', value: 'Tokens/Min (TPM) + RPM' },
      { metric: 'Context Caching', value: '90% Prefill Savings' },
    ],
    coreAlgorithms: [
      'Disaggregated Prefill vs Decode Serving: Separates compute-bound Prefill GPUs from memory-bandwidth-bound Decode GPUs so long prompts never stall active streaming chats!',
      'Prefix-Aware Consistent Routing (RadixAttention): Routes multi-turn chats back to the exact GPU replica already holding their warm KV-Cache prefix.',
      'Speculative Decoding + Continuous Batching maximizes HBM3/TPU utilization across concurrent conversations.',
    ],
    bottleneckAndFix:
      'One user pasting a 100K-token PDF stalls decode latency for 30 other users sharing the same GPU -> use **Chunked Prefill** + **Disaggregated Prefill/Decode pools** with NVLink/RDMA KV-Cache transfer!',
    dbDesignSummary:
      'Sharded PostgreSQL/Spanner (by `user_id`) for Conversations & Message Turns; Object Storage (GCS/S3) for multimodal images/PDFs; Vector Index (ScaNN / pgvector / Qdrant) for long-term user memory & RAG chunks; Redis for TPM token quotas.',
    dbTables: [
      {
        tableName: 'conversations',
        engine: 'Cloud Spanner / Sharded PostgreSQL',
        partitionOrShardKey: 'user_id',
        columns: [
          { name: 'user_id', type: 'UUID', key: 'SHARD' },
          { name: 'conv_id', type: 'UUID', key: 'PK' },
          { name: 'model_id', type: 'TEXT' },
          { name: 'updated_at', type: 'TIMESTAMPTZ', key: 'IDX' },
        ],
      },
      {
        tableName: 'messages',
        engine: 'Interleaved / Sharded by (user_id, conv_id)',
        partitionOrShardKey: '(user_id, conv_id)',
        columns: [
          { name: 'conv_id', type: 'UUID', key: 'PK' },
          { name: 'turn_seq', type: 'INT', key: 'PK' },
          { name: 'role', type: 'VARCHAR(16)' },
          { name: 'content_ref', type: 'TEXT' },
          { name: 'token_usage', type: 'JSONB' },
        ],
      },
    ],
    dbDdlSnippet: `-- Interleaved Conversation History + Vector Memory Schema
CREATE TABLE user_memory_embeddings (
    memory_id  UUID PRIMARY KEY,
    user_id    UUID NOT NULL,
    fact_text  TEXT NOT NULL,
    embedding  VECTOR(768) NOT NULL, -- HNSW / ScaNN cosine similarity index
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_mem_user_hnsw ON user_memory_embeddings USING hnsw (embedding vector_cosine_ops);`,
    dfdNodes: [
      { id: 'gw', label: 'Edge SSE & TPM', sublabel: 'Quota + Safety', x: 74, y: 112 },
      { id: 'orch', label: 'RAG & Tool Router', sublabel: 'Prefix Affinity', x: 212, y: 64 },
      { id: 'pre', label: 'Prefill GPU Pool', sublabel: 'Compute + KV Gen', x: 356, y: 162 },
      { id: 'dec', label: 'Decode GPU Pool', sublabel: 'PagedAttn Stream', x: 492, y: 64 },
      { id: 'db', label: 'Spanner + VectorDB', sublabel: 'History + Memory', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'gw', to: 'orch', label: 'Prompt + Files' },
      { id: 'e2', from: 'orch', to: 'pre', label: 'Prefix Route' },
      { id: 'e3', from: 'pre', to: 'dec', label: 'RDMA KV Transfer' },
      { id: 'e4', from: 'dec', to: 'db', label: 'Async Save Turn' },
    ],
    dfdSteps: [
      { step: 1, title: 'TPM Quota Check, Safety Filter & Context Hydration', plainEnglish: 'Validates token quota, fetches recent chat turns + semantic memory vectors, and routes to a warm GPU node.', technicalDetail: 'Prefix-aware consistent hashing hits RadixAttention KV cache, cutting TTFT by 5x.', activeNodeIds: ['gw', 'orch'], activeEdgeIds: ['e1'], packetLabel: 'HYDRATE CTX' },
      { step: 2, title: 'Disaggregated Prefill -> RDMA KV-Cache Handoff', plainEnglish: 'Prefill GPUs crunch the full prompt in parallel, then send the generated KV-Cache pages over ultra-fast NVLink/RDMA to Decode GPUs.', technicalDetail: 'Prevents long-context prefills from adding jitter to active token streams.', activeNodeIds: ['orch', 'pre', 'dec'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'KV RDMA' },
      { step: 3, title: 'SSE Token-by-Token Streaming & Async DB Persistence', plainEnglish: 'Streams tokens straight to the user browser via SSE while an async queue saves the final turn & billing token counts.', technicalDetail: 'Post-generation safety classifier runs streaming lookahead buffer before flushing SSE chunks.', activeNodeIds: ['dec', 'db'], activeEdgeIds: ['e4'], packetLabel: 'SSE STREAM' },
    ],
  },
  {
    id: 'instagram-social',
    shortTitle: 'Instagram',
    title: 'Instagram Photo/Reels Feed: Hybrid Push-Pull Fan-Out, Transcoding Queue & Multi-CDN',
    domain: 'realtime-social-telecom',
    commPatterns: ['Enqueue', 'WebSocket'],
    scaleBadge: '2B+ MAU · 100:1 Read-Heavy Feed',
    simpleEnglish:
      'When your friend with 300 followers posts a photo, Instagram pre-pushes that post ID straight into all 300 friends’ Redis home feeds (Fan-Out-on-Write). But when Cristiano Ronaldo (600M followers) posts, pushing 600M rows would crash Redis—so celebrity posts are merged live on read (Hybrid Fan-Out)!',
    architectureSummary:
      'Chunked Media Upload -> S3 Raw Bucket -> Enqueue Transcoding DAG (Thumbnails + Reels HLS ABR) -> Multi-CDN Edge -> Post Metadata Sharded DB -> Hybrid Fan-Out Service (Push for <100K followers; Pull-Merge for Celebrities) -> Ranking ML Scorer.',
    capacityNumbers: [
      { metric: 'Read : Write Ratio', value: '100 : 1' },
      { metric: 'Feed Render SLA', value: '< 150 ms p99' },
      { metric: 'Celebrity Cutoff', value: '> 100K followers = Pull' },
      { metric: 'Media Storage', value: 'Exabytes (Object + CDN)' },
    ],
    coreAlgorithms: [
      'Hybrid Push/Pull Fan-Out: Push O(followers) into Redis Sorted Sets for normal users; Pull + K-Way Merge at read time for celebrities.',
      'Snowflake 64-bit Time-Sortable IDs `(41b timestamp | 13b shardId | 10b seq)` enable zero-coordination distributed ordering!',
      'Two-Stage Reels Ranking: Candidate Generation (ANN Embeddings) -> Heavy Neural Ranker.',
    ],
    bottleneckAndFix:
      'Celebrity Hot-Key Fan-Out Storm (1 post triggers 500M Redis writes) -> classify accounts above 100K followers as Pull-Only and merge their last 5 posts in memory during feed read!',
    dbDesignSummary:
      'Sharded PostgreSQL (by `user_id` via Snowflake ID) for `posts`, `users`, and `follows`; Redis Sorted Sets (`feed:{userId}`) for pre-computed home timeline IDs; S3 + Multi-CDN for images/Reels.',
    dbTables: [
      {
        tableName: 'posts',
        engine: 'Sharded PostgreSQL (by author_id)',
        partitionOrShardKey: 'author_id',
        columns: [
          { name: 'post_id', type: 'BIGINT (Snowflake)', key: 'PK' },
          { name: 'author_id', type: 'BIGINT', key: 'SHARD' },
          { name: 'cdn_media_urls', type: 'JSONB' },
          { name: 'like_count', type: 'INT' },
          { name: 'created_at', type: 'TIMESTAMPTZ', key: 'IDX' },
        ],
      },
      {
        tableName: 'follows',
        engine: 'TAO / Sharded Graph Store',
        partitionOrShardKey: 'follower_id',
        columns: [
          { name: 'follower_id', type: 'BIGINT', key: 'PK' },
          { name: 'followee_id', type: 'BIGINT', key: 'PK' },
          { name: 'is_celebrity', type: 'BOOLEAN', key: 'IDX' },
        ],
      },
    ],
    dbDdlSnippet: `-- Dual-Indexed Social Graph (Fast "Who I follow" + "My followers" lookups)
CREATE TABLE follows (
    follower_id BIGINT NOT NULL,
    followee_id BIGINT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX idx_follows_reverse ON follows (followee_id, follower_id);`,
    dfdNodes: [
      { id: 'up', label: 'Media Upload', sublabel: 'S3 + Transcode Q', x: 74, y: 112 },
      { id: 'cdn', label: 'Multi-CDN Edge', sublabel: 'WebP / HLS Reels', x: 212, y: 64 },
      { id: 'fan', label: 'Hybrid Fan-Out', sublabel: 'Push vs Celeb Pull', x: 356, y: 162 },
      { id: 'rad', label: 'Redis Feed Cache', sublabel: 'ZSET Post IDs', x: 492, y: 64 },
      { id: 'db', label: 'Sharded Post DB', sublabel: 'Snowflake IDs', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'up', to: 'cdn', label: 'Encode ABR' },
      { id: 'e2', from: 'up', to: 'fan', label: 'Post Event' },
      { id: 'e3', from: 'fan', to: 'rad', label: 'Push <100K' },
      { id: 'e4', from: 'rad', to: 'db', label: 'Hydrate + Pull' },
    ],
    dfdSteps: [
      { step: 1, title: 'Async Media Transcoding Queue -> Global CDN', plainEnglish: 'Uploads raw video/photo to object storage; background workers encode multiple resolutions and push to CDN.', technicalDetail: 'Decouples heavy FFmpeg transcoding from API response via durable queue.', activeNodeIds: ['up', 'cdn'], activeEdgeIds: ['e1'], packetLabel: 'TRANSCODE' },
      { step: 2, title: 'Hybrid Fan-Out Decision (Push vs Celebrity Pull)', plainEnglish: 'Normal user posts push IDs to followers’ Redis feeds; celebrity posts skip push to avoid write storms.', technicalDetail: 'Reduces feed-read latency to <20ms while keeping celebrity write cost O(1).', activeNodeIds: ['up', 'fan', 'rad'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'HYBRID PUSH' },
      { step: 3, title: 'Feed Read Merge, ML Ranking & Hydration', plainEnglish: 'Reads pre-pushed IDs from Redis, merges followed celebrities’ latest posts, ranks with ML, and hydrates CDN URLs.', technicalDetail: 'Time-sortable Snowflake IDs allow fast cursor pagination without OFFSET.', activeNodeIds: ['rad', 'db'], activeEdgeIds: ['e4'], packetLabel: 'RANK FEED' },
    ],
  },
  {
    id: 'whatsapp-messaging',
    shortTitle: 'WhatsApp',
    title: 'WhatsApp E2EE Messaging: Persistent WebSockets, Store-and-Forward & Signal Protocol',
    domain: 'realtime-social-telecom',
    commPatterns: ['WebSocket', 'Enqueue'],
    scaleBadge: '100B+ msgs/day · E2EE Zero Server History',
    simpleEnglish:
      'Every phone holds one tiny persistent TCP/WebSocket connection to an Erlang/BEAM Chat Gateway. Messages are encrypted end-to-end on your phone (even WhatsApp cannot read them!). If your friend is offline, the encrypted blob waits in a temporary Store-and-Forward Queue and is DELETED from servers the second your friend’s phone sends a delivery ACK!',
    architectureSummary:
      'Mobile Client (Signal Double Ratchet E2EE + Local SQLite) <-> Stateful Chat Gateway Fleet (2M+ connections/server!) -> Session Registry -> Online Direct Push OR Offline Store-and-Forward Queue (Cassandra/Mnesia) + APNs/FCM Wakeup -> Encrypted Media Blob CDN -> Delivery Receipt FSM (1 tick / 2 ticks / Blue ticks).',
    capacityNumbers: [
      { metric: 'Daily Messages', value: '100 Billion+ / day' },
      { metric: 'Sockets / Server', value: '2M+ (Erlang/BEAM)' },
      { metric: 'Delivery Latency', value: '< 100 ms global' },
      { metric: 'Server Retention', value: '0 after ACK (E2EE)' },
    ],
    coreAlgorithms: [
      'Signal Protocol (X3DH + Double Ratchet): Forward secrecy & post-compromise security with per-message ephemeral keys.',
      'Group Sender Keys: For a 500-person group, encrypts the message ONCE with a Group Sender Key instead of 500x pairwise encryptions!',
      'Last-Seen Presence Debouncing: Only fans out online/typing status to actively open chats (avoids O(N^2) presence storm).',
    ],
    bottleneckAndFix:
      'Offline users reconnecting after a flight trigger giant bursts -> stream queued encrypted messages in paginated ordered batches with client-side watermark ACKs before server deletion!',
    dbDesignSummary:
      'Primary chat history lives on the **User’s Device (SQLite)**! Server DB only stores: (1) Cassandra/Mnesia transient `undelivered_messages` partitioned by `recipient_id` (TTL 30 days, deleted immediately upon ACK), (2) User Public PreKey Bundles, and (3) Group Membership lists.',
    dbTables: [
      {
        tableName: 'undelivered_inbox',
        engine: 'Cassandra / Mnesia (Ephemeral, TTL 30d)',
        partitionOrShardKey: 'recipient_user_id',
        columns: [
          { name: 'recipient_user_id', type: 'BIGINT', key: 'SHARD' },
          { name: 'msg_id', type: 'TIMEUUID', key: 'PK' },
          { name: 'sender_id', type: 'BIGINT' },
          { name: 'ciphertext_blob', type: 'BLOB' },
        ],
      },
      {
        tableName: 'group_members',
        engine: 'Sharded KV / PostgreSQL',
        partitionOrShardKey: 'group_id',
        columns: [
          { name: 'group_id', type: 'UUID', key: 'SHARD' },
          { name: 'user_id', type: 'BIGINT', key: 'PK' },
          { name: 'role', type: 'VARCHAR(12)' },
        ],
      },
    ],
    dbDdlSnippet: `-- Ephemeral Store-and-Forward Partition (Deleted immediately upon recipient ACK!)
CREATE TABLE undelivered_inbox (
    recipient_user_id BIGINT,
    msg_id            TIMEUUID,
    sender_id         BIGINT,
    ciphertext_blob   BLOB,
    PRIMARY KEY ((recipient_user_id), msg_id)
) WITH CLUSTERING ORDER BY (msg_id ASC)
  AND default_time_to_live = 2592000; -- 30-day hard expiry`,
    dfdNodes: [
      { id: 'cli', label: 'Sender (E2EE)', sublabel: 'Double Ratchet', x: 74, y: 112 },
      { id: 'gw', label: 'WS Chat Gateway', sublabel: '2M Sockets/Node', x: 212, y: 64 },
      { id: 'reg', label: 'Session Router', sublabel: 'Online / Offline?', x: 356, y: 162 },
      { id: 'q', label: 'Offline Inbox DB', sublabel: 'Delete After ACK', x: 492, y: 64 },
      { id: 'rcpt', label: 'Recipient Phone', sublabel: '2 Ticks -> Blue', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'cli', to: 'gw', label: 'Ciphertext' },
      { id: 'e2', from: 'gw', to: 'reg', label: 'Lookup GW' },
      { id: 'e3', from: 'reg', to: 'q', label: 'If Offline' },
      { id: 'e4', from: 'reg', to: 'rcpt', label: 'Direct Push' },
    ],
    dfdSteps: [
      { step: 1, title: 'Client-Side E2EE Encryption -> Persistent Gateway', plainEnglish: 'Sender encrypts text on-device and pushes a tiny binary frame over its open WebSocket (1 gray tick).', technicalDetail: 'Server only sees routing metadata (sender, recipient, msg_id) — never plaintext.', activeNodeIds: ['cli', 'gw'], activeEdgeIds: ['e1'], packetLabel: '1 TICK' },
      { step: 2, title: 'Session Lookup -> Live Push or Offline Store-and-Forward', plainEnglish: 'If recipient is online, pushes directly to their gateway; if offline, saves ciphertext in Cassandra and pings APNs/FCM.', technicalDetail: 'Group chats fan out to member gateways using cached group membership (<=1,024 members).', activeNodeIds: ['gw', 'reg', 'q'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'ROUTE / QUEUE' },
      { step: 3, title: 'Delivery ACK & Immediate Server Purge', plainEnglish: 'Once the recipient’s phone confirms receipt (2 gray ticks), the server deletes the encrypted message permanently!', technicalDetail: 'Eliminates petabytes of long-term server message storage while maximizing privacy.', activeNodeIds: ['reg', 'rcpt'], activeEdgeIds: ['e4'], packetLabel: '2 TICKS ACK' },
    ],
  },
  {
    id: 'uber-geospatial',
    shortTitle: 'Uber Dispatch',
    title: 'Uber Geospatial Ride Matching, H3 Spatial Index, Live GPS Tracking & Surge Pricing',
    domain: 'realtime-social-telecom',
    commPatterns: ['WebSocket', 'Enqueue', 'Webhook'],
    scaleBadge: '1M+ GPS pings/sec · H3 Hex Grid',
    simpleEnglish:
      'Every active Uber driver streams GPS coordinates every 4 seconds over WebSockets. Uber maps every lat/lng onto a giant honeycomb grid of hexagons (**Uber H3**) so finding all free drivers within 3 km is an O(1) lookup of just 7 adjacent hexagons—then a Dispatch Engine matches riders & drivers globally to minimize total wait time!',
    architectureSummary:
      'Driver/Rider Apps (WebSocket GPS every 4s) -> Location Ingestion Fleet -> H3 Hexagonal In-Memory Spatial Index (Sharded by City/Region) -> Dispatch Matching Optimizer (Bipartite Min-Wait) + ETA Routing Engine (Contraction Hierarchies) -> Surge Pricing Engine -> Trip State Machine + Payment/Ledger DB.',
    capacityNumbers: [
      { metric: 'Driver GPS Pings', value: '1M+ updates/sec' },
      { metric: 'Spatial Query', value: 'O(1) k-Ring H3 Lookup' },
      { metric: 'ETA Calculation', value: '< 5 ms (Contraction Hier.)' },
      { metric: 'Dispatch Consistency', value: '1 Driver = 1 Trip Lock' },
    ],
    coreAlgorithms: [
      'Uber H3 Hierarchical Hexagonal Spatial Index: Unlike square grids/QuadTrees, every hexagon has 6 equidistant neighbors—making radius search & surge heatmaps mathematically uniform!',
      'Batch Window Bipartite Matching (Hungarian Algorithm): Waits 2–3 seconds to globally match multiple nearby riders & drivers instead of greedy nearest-driver!',
      'Contraction Hierarchies (CH) on Road Graphs pre-computes highway shortcuts for <5ms traffic-aware ETA!',
    ],
    bottleneckAndFix:
      'Two riders in downtown Manhattan get offered the exact same driver simultaneously -> Trip Dispatch acquires an atomic Redis/DB Driver Lock (`driver_state: AVAILABLE -> OFFERED` with 15s TTL) before pushing the ride offer over WebSocket!',
    dbDesignSummary:
      'Volatile In-Memory Redis/Ringpop H3 Grid for live driver locations (never write 1M GPS pings/sec to SQL!); Sharded PostgreSQL/Schemaless (by `city_id` / `trip_id`) for Trip State Machine & Financial Ledger; Kafka -> ClickHouse for Surge Demand/Supply heatmaps.',
    dbTables: [
      {
        tableName: 'trips',
        engine: 'Sharded PostgreSQL (by city_id, trip_id)',
        partitionOrShardKey: 'city_id',
        columns: [
          { name: 'trip_id', type: 'UUID', key: 'PK' },
          { name: 'city_id', type: 'INT', key: 'SHARD' },
          { name: 'rider_id', type: 'BIGINT', key: 'IDX' },
          { name: 'driver_id', type: 'BIGINT', key: 'IDX' },
          { name: 'state', type: 'VARCHAR(20)' },
          { name: 'fare_cents', type: 'BIGINT' },
        ],
      },
      {
        tableName: 'h3_driver_index (In-Memory)',
        engine: 'Redis GEO / Custom H3 Ringpop RAM',
        partitionOrShardKey: 'h3_cell_res8',
        columns: [
          { name: 'h3_cell_res8', type: 'BIGINT', key: 'PK' },
          { name: 'driver_id', type: 'BIGINT', key: 'PK' },
          { name: 'lat_lng_heading', type: 'PACKED_16B' },
          { name: 'status', type: 'TINYINT' },
        ],
      },
    ],
    dbDdlSnippet: `-- Trip State Machine with Optimistic Version Guard (Prevents Double-Assign!)
CREATE TABLE trips (
    trip_id     UUID PRIMARY KEY,
    city_id     INT NOT NULL,
    rider_id    BIGINT NOT NULL,
    driver_id   BIGINT,
    pickup_h3   BIGINT NOT NULL,
    state       VARCHAR(20) NOT NULL, -- REQUESTED -> MATCHED -> IN_PROGRESS -> COMPLETED
    surge_mult  NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    version     INT NOT NULL DEFAULT 1
);`,
    dfdNodes: [
      { id: 'gps', label: 'Driver WS GPS', sublabel: '1M pings/sec', x: 74, y: 112 },
      { id: 'h3', label: 'H3 Hex RAM Index', sublabel: 'O(1) 7-Cell Ring', x: 212, y: 64 },
      { id: 'disp', label: 'Dispatch & ETA', sublabel: 'Bipartite + CH', x: 356, y: 162 },
      { id: 'srg', label: 'Surge Pricing', sublabel: 'Supply/Demand H3', x: 492, y: 64 },
      { id: 'db', label: 'Trip & Ledger DB', sublabel: 'ACID State FSM', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'gps', to: 'h3', label: 'Update Cell' },
      { id: 'e2', from: 'h3', to: 'disp', label: 'Nearby Drivers' },
      { id: 'e3', from: 'h3', to: 'srg', label: 'Hex Density' },
      { id: 'e4', from: 'disp', to: 'db', label: 'Lock & Match' },
    ],
    dfdSteps: [
      { step: 1, title: 'Live Driver GPS Stream -> H3 Hexagon Index', plainEnglish: 'Drivers stream GPS every 4 seconds; ingestion updates their exact H3 hexagon bucket purely in RAM.', technicalDetail: 'TTL of 30s auto-evicts drivers who lose signal cleanly.', activeNodeIds: ['gps', 'h3'], activeEdgeIds: ['e1'], packetLabel: 'H3 UPDATE' },
      { step: 2, title: 'k-Ring Spatial Query, Surge & Bipartite Matching', plainEnglish: 'Queries the rider’s hexagon + 6 neighbors, scores road ETA via Contraction Hierarchies, and picks the globally optimal driver.', technicalDetail: '2-second batching window prevents suboptimal greedy matching in dense cities.', activeNodeIds: ['h3', 'disp', 'srg'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'MATCH + ETA' },
      { step: 3, title: 'Atomic Driver Lock, WebSocket Offer & Trip Persistence', plainEnglish: 'Locks the driver for 15 seconds, pushes the offer via WebSocket, and records the confirmed Trip & payment ledger in DB.', technicalDetail: 'Trip state transitions enforce strict FSM guards (`MATCHED -> STARTED -> COMPLETED`).', activeNodeIds: ['disp', 'db'], activeEdgeIds: ['e4'], packetLabel: 'TRIP LOCKED' },
    ],
  },
  {
    id: 'slack-ms-teams',
    shortTitle: 'Slack & MS Teams',
    title: 'Slack & Microsoft Teams: Multi-Tenant Real-Time Channels, Flannel Edge Cache & WebRTC SFU',
    domain: 'realtime-social-telecom',
    commPatterns: ['WebSocket', 'Enqueue', 'gRPC/SIP'],
    scaleBadge: '300M+ MAU · Channels + Video Huddles',
    simpleEnglish:
      'Slack and MS Teams blend real-time channel chat, workspace presence, full-text search, and 100-person video calls. When you type in `#engineering`, your WebSocket Gateway saves the message to the workspace’s sharded DB, fans it out over Pub/Sub to online channel members, indexes it asynchronously for instant search, and routes video calls through a WebRTC SFU media server!',
    architectureSummary:
      'Desktop/Web Client (WebSocket + WebRTC) -> Edge Flannel Metadata Cache -> Channel Router & Stateful WS Gateway Fleet -> Workspace-Sharded Message DB (Vitess/CosmosDB) -> Async Kafka Fan-Out (Search Index, Push Notifications, Bot Webhooks, Unread Counters) -> WebRTC SFU Media Servers.',
    capacityNumbers: [
      { metric: 'Real-Time Fan-Out', value: '< 200 ms channel delivery' },
      { metric: 'Workspace Scale', value: '1 to 500,000 seats/org' },
      { metric: 'Video Architecture', value: 'WebRTC SFU (Simulcast)' },
      { metric: 'Search SLA', value: '< 300 ms across yrs of chat' },
    ],
    coreAlgorithms: [
      'Edge Metadata Caching (Slack Flannel): Caches workspace user/channel directories at the edge so giant 100K-user enterprise reconnects never crush central DBs.',
      'WebRTC Selective Forwarding Unit (SFU) with Simulcast: Every speaker uploads 1 multi-bitrate stream; SFU forwards the right quality (360p/720p/1080p) to each viewer without expensive server re-encoding!',
      'Per-Channel Partitioned Time-Series Storage + Read-Cursor Unread Watermark (`last_read_ts`) avoids storing per-user message copies.',
    ],
    bottleneckAndFix:
      'Posting `@channel` in a 50,000-employee `#announcements` channel creates a giant notification spike -> decouple live WebSocket delivery from Push/Email notifications via partitioned Enqueue workers and track unreads using a single `last_read_ts` bookmark per `(user_id, channel_id)`!',
    dbDesignSummary:
      'Multi-Tenant Sharded DB (Vitess/MySQL or CosmosDB) sharded by `workspace_id` (with oversized enterprise channels split by `(channel_id, month_bucket)`); Elasticsearch/OpenSearch sharded by `workspace_id` for full-text search; Redis for live Presence & Typing indicators.',
    dbTables: [
      {
        tableName: 'channel_messages',
        engine: 'Vitess MySQL / Cassandra (Sharded by channel_id)',
        partitionOrShardKey: '(workspace_id, channel_id)',
        columns: [
          { name: 'channel_id', type: 'UUID', key: 'SHARD' },
          { name: 'msg_ts', type: 'BIGINT (Snowflake)', key: 'PK' },
          { name: 'thread_root_ts', type: 'BIGINT', key: 'IDX' },
          { name: 'sender_id', type: 'UUID' },
          { name: 'body_blocks', type: 'JSONB' },
        ],
      },
      {
        tableName: 'channel_read_cursors',
        engine: 'PostgreSQL / Redis Write-Behind',
        partitionOrShardKey: 'user_id',
        columns: [
          { name: 'user_id', type: 'UUID', key: 'PK' },
          { name: 'channel_id', type: 'UUID', key: 'PK' },
          { name: 'last_read_ts', type: 'BIGINT' },
          { name: 'mention_count', type: 'INT' },
        ],
      },
    ],
    dbDdlSnippet: `-- Zero-Fanout Unread Tracking (1 Bookmark Row instead of copying messages!)
CREATE TABLE channel_read_cursors (
    workspace_id UUID NOT NULL,
    user_id      UUID NOT NULL,
    channel_id   UUID NOT NULL,
    last_read_ts BIGINT NOT NULL,
    PRIMARY KEY (workspace_id, user_id, channel_id)
);`,
    dfdNodes: [
      { id: 'ws', label: 'WS + Flannel Edge', sublabel: 'Cached Directory', x: 74, y: 112 },
      { id: 'ch', label: 'Channel Router', sublabel: 'PubSub Fan-Out', x: 212, y: 64 },
      { id: 'db', label: 'Sharded Msg DB', sublabel: 'By Workspace/Ch', x: 356, y: 162 },
      { id: 'q', label: 'Async Kafka Bus', sublabel: 'Search + Bot Hook', x: 492, y: 64 },
      { id: 'sfu', label: 'WebRTC SFU', sublabel: 'Simulcast Calls', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'ws', to: 'ch', label: 'Send Msg' },
      { id: 'e2', from: 'ch', to: 'db', label: 'Persist Turn' },
      { id: 'e3', from: 'ch', to: 'q', label: 'Index + Notify' },
      { id: 'e4', from: 'ws', to: 'sfu', label: 'Audio/Video RTP' },
    ],
    dfdSteps: [
      { step: 1, title: 'Edge Flannel Hydration & Persistent Channel Socket', plainEnglish: 'Client connects to the nearest edge cache and opens 1 WebSocket for all channels in the workspace.', technicalDetail: 'Prevents thundering-herd metadata queries after corporate office Wi-Fi drops.', activeNodeIds: ['ws', 'ch'], activeEdgeIds: ['e1'], packetLabel: 'WS MSG' },
      { step: 2, title: 'Durable Channel Write & Live Member Fan-Out', plainEnglish: 'Saves the message to the channel’s DB shard and immediately fans out frames to online members via Pub/Sub.', technicalDetail: 'Offline members see unread badge via lightweight `last_read_ts < channel_latest_ts` compare.', activeNodeIds: ['ch', 'db'], activeEdgeIds: ['e2'], packetLabel: 'PERSIST + FAN' },
      { step: 3, title: 'Async Search/Webhook Indexing + WebRTC SFU Huddles', plainEnglish: 'Kafka feeds Elasticsearch & third-party Slack Bot Webhooks, while live meetings flow through low-latency WebRTC SFU servers.', technicalDetail: 'SFU avoids CPU-heavy MCU transcoding, scaling smoothly to 100+ participants.', activeNodeIds: ['ch', 'q', 'sfu'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'SEARCH / SFU' },
    ],
  },
  {
    id: 'telecommunication-5g-voip',
    shortTitle: 'Telecom (5G & VoIP)',
    title: 'Telecommunication Network Architecture: 5G Core (AMF/SMF/UPF), Cell Handover, SIP VoIP & CDR Billing',
    domain: 'realtime-social-telecom',
    commPatterns: ['gRPC/SIP', 'Enqueue'],
    scaleBadge: '50M+ subscribers · <10ms 5G Handover',
    simpleEnglish:
      'When you make a phone call while driving at 100 km/h, your phone smoothly switches between cell towers (Handover) without dropping a single word! Telecom networks strictly split the **Control Plane** (finding where your phone is, checking SIM auth & balance) from the **User Plane** (streaming ultra-fast voice/data packets straight to the Internet or callee)!',
    architectureSummary:
      'UE Smartphone -> gNodeB Radio Tower -> 5G Control Plane (AMF Mobility + SMF Session + AUSF/UDM SIM Subscriber DB + IMS SIP Call Signaling) vs User Plane (UPF High-Speed Packet Forwarder + RTP Media Relay) -> Real-Time Online Charging System (OCS) & Kafka CDR Billing Pipeline.',
    capacityNumbers: [
      { metric: '5G Air Latency', value: '1–10 ms URLLC' },
      { metric: 'Tower Handover', value: '< 30 ms seamless switch' },
      { metric: 'Subscriber Lookup', value: '< 2 ms UDM/HLR DB' },
      { metric: 'CDR Volume', value: 'Billions of records/day' },
    ],
    coreAlgorithms: [
      'CUPS (Control and User Plane Separation): Lets UPF data routers sit at city edges near cell towers while centralized Control Plane manages auth & mobility.',
      'Make-Before-Break Soft Handover (X2/Xn interface): Pre-allocates radio bearers on the next tower before releasing the previous tower as signal RSRP drops.',
      'SIP INVITE / 200 OK / ACK Signaling + RTP/SRTP over UDP (never TCP for live voice—TCP retransmission stalls audio!).',
    ],
    bottleneckAndFix:
      'Prepaid subscribers consuming data/calls concurrently across multiple sessions could go negative -> Online Charging System (OCS) grants small **Quota Slices** (e.g., 50MB / 3-minute credit reservations) to the UPF/IMS node and renews asynchronously!',
    dbDesignSummary:
      'Ultra-available In-Memory/Geo-Replicated **UDM / HLR Subscriber DB** (keyed by IMSI/MSISDN for <2ms SIM auth & roaming state); High-Throughput **Append-Only CDR Store** (Kafka -> ClickHouse / Partitioned PostgreSQL by `call_date`) for regulatory retention & billing.',
    dbTables: [
      {
        tableName: 'udm_subscribers',
        engine: 'Geo-Replicated In-Memory SQL / Aerospike',
        partitionOrShardKey: 'imsi',
        columns: [
          { name: 'imsi', type: 'CHAR(15)', key: 'PK' },
          { name: 'msisdn', type: 'VARCHAR(16)', key: 'UK' },
          { name: 'current_amf_cell', type: 'VARCHAR(32)' },
          { name: 'plan_qos_profile', type: 'JSONB' },
          { name: 'credit_balance_cents', type: 'BIGINT' },
        ],
      },
      {
        tableName: 'call_detail_records_cdr',
        engine: 'ClickHouse / Partitioned Postgres (Monthly)',
        partitionOrShardKey: '(call_date, caller_msisdn)',
        columns: [
          { name: 'cdr_id', type: 'UUID', key: 'PK' },
          { name: 'caller_msisdn', type: 'VARCHAR(16)', key: 'IDX' },
          { name: 'callee_msisdn', type: 'VARCHAR(16)', key: 'IDX' },
          { name: 'duration_sec', type: 'INT' },
          { name: 'cell_tower_id', type: 'VARCHAR(24)' },
        ],
      },
    ],
    dbDdlSnippet: `-- High-Throughput Partitioned Call Detail Records (CDR) for Billing & Lawful Retention
CREATE TABLE call_detail_records_cdr (
    call_start_ts TIMESTAMPTZ NOT NULL,
    cdr_id        UUID NOT NULL,
    caller_msisdn VARCHAR(16) NOT NULL,
    callee_msisdn VARCHAR(16) NOT NULL,
    duration_sec  INT NOT NULL,
    bytes_used    BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (call_start_ts, cdr_id)
) PARTITION BY RANGE (call_start_ts);`,
    dfdNodes: [
      { id: 'ue', label: 'Phone -> gNodeB', sublabel: '5G Radio Handover', x: 74, y: 112 },
      { id: 'amf', label: 'Control (AMF/SIP)', sublabel: 'Auth + Mobility', x: 212, y: 64 },
      { id: 'upf', label: 'User Plane (UPF)', sublabel: 'RTP / IP FastPath', x: 356, y: 162 },
      { id: 'udm', label: 'UDM / OCS Credit', sublabel: 'SIM + Quota Slice', x: 492, y: 64 },
      { id: 'cdr', label: 'Kafka -> CDR DB', sublabel: 'Billing + Audit', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'ue', to: 'amf', label: 'SIP / Auth' },
      { id: 'e2', from: 'amf', to: 'udm', label: 'Verify SIM' },
      { id: 'e3', from: 'ue', to: 'upf', label: 'Voice/Data UDP' },
      { id: 'e4', from: 'upf', to: 'cdr', label: 'Emit CDR' },
    ],
    dfdSteps: [
      { step: 1, title: 'SIM Authentication & SIP Call Control Signaling', plainEnglish: 'Tower authenticates the SIM card against the UDM Subscriber DB and locates the callee’s current cell tower.', technicalDetail: '5G-AKA cryptographic challenge-response prevents SIM cloning; SIP sets up codec negotiation.', activeNodeIds: ['ue', 'amf', 'udm'], activeEdgeIds: ['e1', 'e2'], packetLabel: '5G-AKA + SIP' },
      { step: 2, title: 'Direct User Plane (UPF) Media & Seamless Handover', plainEnglish: 'Once connected, voice/data packets bypass the control plane and flow directly across edge UPF routers over UDP.', technicalDetail: 'Xn handover transfers buffered packets between towers in <30ms while moving at highway speeds.', activeNodeIds: ['ue', 'upf'], activeEdgeIds: ['e3'], packetLabel: 'RTP / UPF' },
      { step: 3, title: 'Real-Time Quota Slice & Immutable CDR Billing Stream', plainEnglish: 'UPF deducts prepaid quota slices in real time and streams Call Detail Records to Kafka for monthly billing & audit.', technicalDetail: 'Partitioned columnar CDR tables handle billions of daily records with instant drop retention.', activeNodeIds: ['upf', 'cdr'], activeEdgeIds: ['e4'], packetLabel: 'EMIT CDR' },
    ],
  },
  {
    id: 'internet-www-end-to-end',
    shortTitle: 'Internet & www.com',
    title: 'How the Internet & www.com Works End-to-End: DNS, BGP, Anycast, TCP/QUIC, TLS 1.3 & HTTP/3',
    domain: 'ai-search-web',
    commPatterns: ['gRPC/SIP', 'WebSocket'],
    scaleBadge: '5B+ users · Global AS BGP Mesh',
    simpleEnglish:
      'Typing `https://www.example.com` kicks off an invisible global relay race in under 80 milliseconds: Browser checks HSTS & cache -> Recursive DNS finds the IP -> BGP Internet routers steer packets across fiber cables to the nearest Anycast CDN PoP -> QUIC + TLS 1.3 establishes an encrypted pipe in 1 round-trip -> Origin renders HTML & streams assets!',
    architectureSummary:
      'Browser Cache/HSTS -> Recursive DNS (Root -> TLD -> Authoritative) -> ISP BGP Autonomous System (AS) Routing -> Anycast Edge CDN -> L4/L7 Load Balancer -> TLS 1.3 + HTTP/3 QUIC -> Origin Web/App Server -> Browser DOM/CSSOM/GPU Paint.',
    capacityNumbers: [
      { metric: 'Global BGP Routes', value: '~950,000 IPv4 prefixes' },
      { metric: 'TLS 1.3 + QUIC', value: '1-RTT (0-RTT Resume!)' },
      { metric: 'DNS Cache Hit Ratio', value: '> 95% (< 3ms)' },
      { metric: 'Speed of Light Floor', value: '~65ms NY <-> London' },
    ],
    coreAlgorithms: [
      'BGP Path-Vector Routing + Longest-Prefix Match (LC-Trie / TCAM hardware) selects optimal inter-ISP fiber paths across 75,000+ Autonomous Systems.',
      'QUIC (HTTP/3 over UDP): Eliminates TCP Head-of-Line blocking so 1 lost packet only pauses 1 stream instead of freezing the whole webpage!',
      'TLS 1.3 Diffie-Hellman (ECDHE) Forward Secrecy + X.509 Certificate Transparency verification.',
    ],
    bottleneckAndFix:
      'TCP 3-way handshake + TLS 1.2 2-RTT handshake wastes 300ms on mobile networks before a single HTML byte moves -> HTTP/3 over QUIC fuses transport + TLS 1.3 into 1-RTT (and 0-RTT on repeat visits) plus Connection Migration across Wi-Fi -> 5G switches!',
    dbDesignSummary:
      'Distributed Hierarchical **DNS Zone Databases** (Authoritative RRSet tables replicated globally via AXFR/IXFR) + Router **BGP RIB/FIB Prefix Tables** + Certificate Transparency Merkle Tree Append-Only Logs.',
    dbTables: [
      {
        tableName: 'dns_zone_records',
        engine: 'Globally Replicated Zone DB (In-Memory Radix)',
        partitionOrShardKey: 'zone_domain',
        columns: [
          { name: 'zone_domain', type: 'TEXT', key: 'SHARD' },
          { name: 'rr_name_type', type: 'TEXT', key: 'PK' },
          { name: 'rdata_ip', type: 'INET' },
          { name: 'ttl_seconds', type: 'INT' },
          { name: 'rrsig_dnssec', type: 'BYTEA' },
        ],
      },
    ],
    dbDdlSnippet: `-- Authoritative DNS Zone Record Schema (Replicated to 300+ Anycast PoPs)
CREATE TABLE dns_zone_records (
    zone_id     UUID NOT NULL,
    fqdn        TEXT NOT NULL,
    record_type VARCHAR(10) NOT NULL, -- A, AAAA, CNAME, MX, TXT, NS
    rdata       TEXT NOT NULL,
    ttl_seconds INT NOT NULL DEFAULT 300,
    geo_region  VARCHAR(16) DEFAULT 'GLOBAL',
    PRIMARY KEY (zone_id, fqdn, record_type, geo_region)
);`,
    dfdNodes: [
      { id: 'br', label: 'Browser + HSTS', sublabel: 'Parse www.com', x: 74, y: 112 },
      { id: 'dns', label: 'DNS Hierarchy', sublabel: 'Root->TLD->Auth', x: 212, y: 64 },
      { id: 'bgp', label: 'BGP Anycast Mesh', sublabel: 'Nearest Edge IP', x: 356, y: 162 },
      { id: 'tls', label: 'QUIC + TLS 1.3', sublabel: '1-RTT HTTP/3', x: 492, y: 64 },
      { id: 'dom', label: 'CDN / Origin -> DOM', sublabel: 'Paint Pixels', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'br', to: 'dns', label: 'Resolve IP' },
      { id: 'e2', from: 'dns', to: 'bgp', label: 'Anycast IP' },
      { id: 'e3', from: 'bgp', to: 'tls', label: '1-RTT Pipe' },
      { id: 'e4', from: 'tls', to: 'dom', label: 'HTML/JS/CSS' },
    ],
    dfdSteps: [
      { step: 1, title: 'URL Parse, HSTS HTTPS Upgrade & DNS Lookup', plainEnglish: 'Forces HTTPS automatically and resolves `www.example.com` into the nearest Edge IP address.', technicalDetail: 'DoH/UDP resolver walks cached hierarchy and validates DNSSEC signature.', activeNodeIds: ['br', 'dns'], activeEdgeIds: ['e1'], packetLabel: 'DNS A/AAAA' },
      { step: 2, title: 'BGP Anycast Routing & QUIC + TLS 1.3 1-RTT Handshake', plainEnglish: 'Internet routers steer packets to the closest city PoP where encryption & connection setup finish in 1 single round-trip.', technicalDetail: 'HTTP/3 multiplexes independent streams over UDP with zero TCP HoL blocking.', activeNodeIds: ['dns', 'bgp', 'tls'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'HTTP/3 1-RTT' },
      { step: 3, title: 'Edge Cache / Origin Fetch & Browser Render Pipeline', plainEnglish: 'Streams compressed Brotli HTML/CSS/JS; browser builds DOM + CSSOM, runs layout, and paints 60fps pixels.', technicalDetail: 'Preload scanner fetches critical fonts/CSS in parallel while parsing HTML stream.', activeNodeIds: ['tls', 'dom'], activeEdgeIds: ['e4'], packetLabel: 'DOM PAINT' },
    ],
  },
  {
    id: 'google-search-engine',
    shortTitle: 'Google Search Engine',
    title: 'Google Search Engine: Distributed Web Crawler, Sharded Inverted Index, PageRank & Sub-100ms Serving',
    domain: 'ai-search-web',
    commPatterns: ['Enqueue', 'gRPC/SIP'],
    scaleBadge: '100B+ indexed pages · <100ms query',
    simpleEnglish:
      'Google does NOT crawl the live web when you type a search! Continuously in the background, polite Crawlers fetch billions of pages, remove duplicates (SimHash), flip every page inside-out into a giant book index (**Inverted Index**: `"java" -> [doc4, doc91, ...]`), compute authority (**PageRank**), and fan your query out across 1,000 index shards in 50ms!',
    architectureSummary:
      'URL Frontier Priority Queue (Politeness + Freshness) -> Distributed Crawler Fleet -> SimHash Near-Duplicate Filter -> Document Store (Bigtable/Colossus) -> Distributed Indexer (MapReduce / Incremental Inverted Index Sharded by DocID!) -> PageRank + Neural Embedding Pipeline -> Query Root Scatter-Gather (<100ms).',
    capacityNumbers: [
      { metric: 'Queries / Second', value: '100,000+ QPS' },
      { metric: 'Indexed Web Size', value: '100+ Petabytes' },
      { metric: 'Serving Fan-Out', value: 'Scatter-Gather < 80ms' },
      { metric: 'Shard Strategy', value: 'Document-Partitioned' },
    ],
    coreAlgorithms: [
      'Sharded Inverted Index with Roaring/PForDelta Compressed Posting Lists + Skip Pointers for ultra-fast sorted list intersection (`"java" AND "gc"`).',
      'Document-Partitioned Sharding (beats Term-Partitioned!): Each shard holds a slice of documents and runs local intersection + Top-10, avoiding giant network shuffles!',
      'Hybrid Retrieval: BM25 Lexical Score + PageRank Link Graph Eigenvector + Neural Cross-Encoder Reranking.',
    ],
    bottleneckAndFix:
      'One slow index shard among 1,000 shards ruins tail latency (Tail-at-Scale problem!) -> send **Hedged Requests** (if shard replica A has not answered in 20ms, fire a duplicate read to replica B and take the first winner!)',
    dbDesignSummary:
      'Colossus/Bigtable for crawled HTML Documents & Link Graph; RAM/SSD-resident **Document-Sharded Inverted Index** (`term -> compressed posting list of doc_ids + positions`); Distributed Cache for top 20% head queries.',
    dbTables: [
      {
        tableName: 'inverted_index_shard',
        engine: 'Custom RAM/NVMe LSM + PForDelta Postings',
        partitionOrShardKey: 'HASH(doc_id) % 1000',
        columns: [
          { name: 'term_id', type: 'BIGINT', key: 'PK' },
          { name: 'doc_freq', type: 'INT' },
          { name: 'posting_list', type: 'COMPRESSED_INTS' },
          { name: 'skip_pointers', type: 'ARRAY' },
        ],
      },
      {
        tableName: 'web_documents',
        engine: 'Bigtable / Wide-Column Store',
        partitionOrShardKey: 'reverse_domain_url',
        columns: [
          { name: 'doc_id', type: 'BIGINT', key: 'PK' },
          { name: 'url_hash', type: 'CHAR(32)', key: 'UK' },
          { name: 'simhash_64', type: 'BIGINT', key: 'IDX' },
          { name: 'pagerank_score', type: 'FLOAT4' },
          { name: 'parsed_snippet', type: 'TEXT' },
        ],
      },
    ],
    dbDdlSnippet: `-- Crawler Politeness Frontier + Document Metadata Schema
CREATE TABLE crawl_frontier (
    host_domain    TEXT NOT NULL,
    next_crawl_at  TIMESTAMPTZ NOT NULL,
    url_hash       CHAR(32) NOT NULL,
    priority_score REAL NOT NULL,
    simhash_64     BIGINT,
    PRIMARY KEY (host_domain, next_crawl_at, url_hash)
);`,
    dfdNodes: [
      { id: 'cr', label: 'Polite Crawler', sublabel: 'URL Frontier Q', x: 74, y: 112 },
      { id: 'ded', label: 'SimHash & Parse', sublabel: 'Tokenize + Links', x: 212, y: 64 },
      { id: 'idx', label: 'Inverted Index', sublabel: '1000 Doc Shards', x: 356, y: 162 },
      { id: 'pr', label: 'PageRank + BM25', sublabel: 'Neural Rerank', x: 492, y: 64 },
      { id: 'q', label: 'Query Root (<80m)', sublabel: 'Scatter-Gather', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'cr', to: 'ded', label: 'Raw HTML' },
      { id: 'e2', from: 'ded', to: 'idx', label: 'Build Postings' },
      { id: 'e3', from: 'idx', to: 'pr', label: 'Top-K Local' },
      { id: 'e4', from: 'pr', to: 'q', label: 'Merge Top 10' },
    ],
    dfdSteps: [
      { step: 1, title: 'Polite Distributed Crawl & SimHash Deduplication', plainEnglish: 'Crawlers obey robots.txt per host, fetch fresh pages, and drop near-duplicate mirrors using 64-bit SimHash.', technicalDetail: 'Mercator frontier separates per-host politeness queues from freshness priority queues.', activeNodeIds: ['cr', 'ded'], activeEdgeIds: ['e1'], packetLabel: 'CRAWL + SIM' },
      { step: 2, title: 'Document-Sharded Inverted Index & PageRank', plainEnglish: 'Maps every word to compressed sorted DocID lists across 1,000 shards while PageRank scores page authority.', technicalDetail: 'Delta + Variable-Byte encoding shrinks posting lists 10x so hot terms fit inside RAM.', activeNodeIds: ['ded', 'idx', 'pr'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'INVERT IDX' },
      { step: 3, title: 'Scatter-Gather Hedged Query Serving (<80ms)', plainEnglish: 'Root fans query to all shards in parallel, merges each shard’s Top-10 via Min-Heap, reranks with neural models, and renders snippets.', technicalDetail: 'Hedged tail requests guarantee sub-100ms p99 across 1,000 parallel RPCs.', activeNodeIds: ['pr', 'q'], activeEdgeIds: ['e4'], packetLabel: 'TOP-10 65ms' },
    ],
  },
  {
    id: 'payment-gateway-ledger',
    shortTitle: 'Stripe / UPI Ledger',
    title: 'Payment Gateway & Immutable Double-Entry Ledger (Stripe / Razorpay / UPI)',
    domain: 'fintech-exchanges',
    commPatterns: ['Webhook', 'Enqueue'],
    scaleBadge: 'Zero Double-Charge · ACID Ledger',
    simpleEnglish:
      'In payments, losing $1 or charging a user twice when Wi-Fi flickers is unacceptable. Every request carries an **Idempotency Key** so retries safely return the exact same result, money NEVER overwrites a single `balance` column—instead every move appends 2 balanced entries (**Debit + Credit summing to ZERO**) in an immutable Double-Entry Ledger, and merchants are notified via signed Webhooks!',
    architectureSummary:
      'Client Checkout (Idempotency-Key) -> Payment Orchestrator (State Machine: CREATED -> AUTH -> CAPTURED -> SETTLED) -> Card Network / UPI PSP Adapter -> Immutable Double-Entry Ledger DB (Serializable/Row-Locked) -> Transactional Outbox -> Signed Merchant Webhook Engine + Nightly PSP Reconciliation.',
    capacityNumbers: [
      { metric: 'Money Conservation', value: 'SUM(debit) == SUM(credit)' },
      { metric: 'Duplicate Protection', value: '100% Idempotency Key' },
      { metric: 'Webhook Delivery', value: 'HMAC + 72h Backoff' },
      { metric: 'Reconciliation', value: 'Daily PSP Settlement Diff' },
    ],
    coreAlgorithms: [
      'Double-Entry Accounting Invariant: Every transaction creates >=2 immutable posting rows whose signed amounts sum strictly to 0.',
      'Idempotency Key State Lock (`INSERT ... ON CONFLICT`) caches exact HTTP response across network timeouts.',
      'Reconciliation Engine cross-checks internal ledger against bank/Visa settlement files daily to catch ghost charges.',
    ],
    bottleneckAndFix:
      'Hot merchant account (e.g., Amazon’s single ledger row) gets 5,000 payments/sec causing SQL row-lock contention -> use **Sub-Account Sharding** (16 parallel merchant bucket accounts summed at settlement) or **Append-Only Ledger Postings** without updating 1 single balance row on every swipe!',
    dbDesignSummary:
      'Strongly consistent PostgreSQL / CockroachDB with 3 core immutable tables: `idempotency_keys`, `ledger_journals`, and `ledger_postings` (strict integer cents/paise, NEVER floating-point!).',
    dbTables: [
      {
        tableName: 'idempotency_keys',
        engine: 'PostgreSQL ACID',
        partitionOrShardKey: 'merchant_id',
        columns: [
          { name: 'merchant_id', type: 'UUID', key: 'PK' },
          { name: 'idempotency_key', type: 'TEXT', key: 'PK' },
          { name: 'request_hash', type: 'CHAR(64)' },
          { name: 'response_json', type: 'JSONB' },
        ],
      },
      {
        tableName: 'ledger_postings',
        engine: 'PostgreSQL Append-Only Ledger',
        partitionOrShardKey: 'created_month',
        columns: [
          { name: 'posting_id', type: 'BIGINT', key: 'PK' },
          { name: 'journal_id', type: 'UUID', key: 'FK' },
          { name: 'account_id', type: 'UUID', key: 'IDX' },
          { name: 'amount_cents', type: 'BIGINT' },
          { name: 'currency', type: 'CHAR(3)' },
        ],
      },
    ],
    dbDdlSnippet: `-- Immutable Double-Entry Transfer (Debit Buyer, Credit Merchant + Fee = Sum 0!)
BEGIN;
  INSERT INTO ledger_journals (journal_id, payment_id) VALUES ($jid, $pid);
  INSERT INTO ledger_postings (journal_id, account_id, amount_cents, currency) VALUES
    ($jid, $buyer_acct,    -10000, 'USD'),
    ($jid, $merchant_acct,  +9700, 'USD'),
    ($jid, $platform_fee,    +300, 'USD');
  -- Outbox event triggers signed Merchant Webhook!
  INSERT INTO outbox_events (topic, payload) VALUES ('payment.captured', $payload);
COMMIT;`,
    dfdNodes: [
      { id: 'cli', label: 'Checkout + IdemKey', sublabel: 'Retry-Safe POST', x: 74, y: 112 },
      { id: 'fsm', label: 'Payment FSM', sublabel: 'Auth -> Capture', x: 212, y: 64 },
      { id: 'psp', label: 'Card / UPI Rail', sublabel: 'Bank Settlement', x: 356, y: 162 },
      { id: 'ldg', label: 'Double-Entry DB', sublabel: 'Sum(D+C) == 0', x: 492, y: 64 },
      { id: 'wh', label: 'Webhook Engine', sublabel: 'HMAC + Jitter Q', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'cli', to: 'fsm', label: 'Claim Key' },
      { id: 'e2', from: 'fsm', to: 'psp', label: 'Charge Rail' },
      { id: 'e3', from: 'psp', to: 'ldg', label: 'Append Postings' },
      { id: 'e4', from: 'ldg', to: 'wh', label: 'Outbox -> Push' },
    ],
    dfdSteps: [
      { step: 1, title: 'Idempotency Key Claim & Payment FSM Init', plainEnglish: 'Records the unique Idempotency Key first—if the user double-clicks or network retries, returns the saved result with zero double charge.', technicalDetail: 'Rejects key reuse with mismatched payload hash (HTTP 422).', activeNodeIds: ['cli', 'fsm'], activeEdgeIds: ['e1'], packetLabel: 'IDEM CLAIM' },
      { step: 2, title: 'Bank / UPI Rail Authorization & Capture', plainEnglish: 'Communicates with Visa/Mastercard/NPCI rails with strict timeouts and deterministic status reconciliation.', technicalDetail: 'Unknown timeout states enter async polling queue instead of blindly retrying.', activeNodeIds: ['fsm', 'psp'], activeEdgeIds: ['e2'], packetLabel: 'PSP AUTH' },
      { step: 3, title: 'Immutable Double-Entry Commit & Signed Merchant Webhook', plainEnglish: 'Appends balanced Debit/Credit rows + Outbox event in 1 ACID transaction, then pushes an HMAC-signed Webhook to the merchant!', technicalDetail: 'Zero drift between financial ledger and merchant notification queue.', activeNodeIds: ['psp', 'ldg', 'wh'], activeEdgeIds: ['e3', 'e4'], packetLabel: 'LEDGER + HOOK' },
    ],
  },
  {
    id: 'url-shortener-ratelimiter',
    shortTitle: 'URL Shortener & RL',
    title: 'Global URL Shortener (TinyURL/Bitly) & Distributed Rate Limiter (Classic Interview Core)',
    domain: 'ai-search-web',
    commPatterns: ['Enqueue'],
    scaleBadge: '100K+ redirects/sec · <10ms L1 Cache',
    simpleEnglish:
      'A URL Shortener turns a long link into 7 clean Base62 characters (`bit.ly/3xK9pQ2`) with zero collisions using pre-generated Key Generation Service (KGS) ranges—then serves 99% of redirects straight out of Redis/CDN in <5ms while pushing click analytics asynchronously to Kafka!',
    architectureSummary:
      'Edge Rate Limiter (Redis Lua Token Bucket / GCRA) -> Redirect Service -> Redis Cluster L1 Cache (80/20 rule) -> Sharded KV/Postgres DB (`short_code -> long_url`) -> 302 (analytics) vs 301 (SEO/zero-origin-load) -> Async Click Stream Queue -> ClickHouse Analytics.',
    capacityNumbers: [
      { metric: '7-Char Base62 Space', value: '62^7 = 3.5 Trillion URLs' },
      { metric: 'Redirect Latency', value: '< 8 ms (Redis Hit)' },
      { metric: 'Read : Write Ratio', value: '100 : 1' },
      { metric: 'Rate Limit Overhead', value: '< 1 ms (Redis Lua)' },
    ],
    coreAlgorithms: [
      'Counter Range Allocator (KGS) + Base62 Encoding: Each app node leases 10,000 IDs at a time in RAM -> zero DB round-trips & 0% hash collisions!',
      'HTTP 301 (Permanent — browser caches, saves server load) vs HTTP 302 (Temporary — hits server every click so you can count analytics!).',
      'Redis Lua GCRA / Token Bucket enforces atomic distributed rate limits without race conditions.',
    ],
    bottleneckAndFix:
      'Cache Penetration attack (bots flooding millions of fake non-existent short codes bypass Redis and slam Postgres) -> place a **Bloom Filter** in front of Redis or cache negative `404` entries with a short 60s TTL!',
    dbDesignSummary:
      'NoSQL KV / Sharded PostgreSQL keyed directly by `short_code CHAR(7)` (100% point lookups, zero joins!); ClickHouse partitioned by `click_date` for async click telemetry.',
    dbTables: [
      {
        tableName: 'short_urls',
        engine: 'DynamoDB / Sharded PostgreSQL',
        partitionOrShardKey: 'short_code',
        columns: [
          { name: 'short_code', type: 'CHAR(7)', key: 'PK' },
          { name: 'long_url', type: 'TEXT' },
          { name: 'owner_id', type: 'BIGINT', key: 'IDX' },
          { name: 'expires_at', type: 'TIMESTAMPTZ', key: 'IDX' },
        ],
      },
    ],
    dbDdlSnippet: `-- Ultra-Lean Point-Lookup Table (Zero secondary overhead on hot redirect path)
CREATE TABLE short_urls (
    short_code CHAR(7) PRIMARY KEY,
    long_url   TEXT NOT NULL,
    owner_id   BIGINT,
    expires_at TIMESTAMPTZ
);`,
    dfdNodes: [
      { id: 'rl', label: 'Rate Limiter', sublabel: 'Redis Lua GCRA', x: 74, y: 112 },
      { id: 'kgs', label: 'KGS Base62 Pool', sublabel: '0% Collisions', x: 212, y: 64 },
      { id: 'rc', label: 'Bloom + Redis L1', sublabel: '95% Hit <5ms', x: 356, y: 162 },
      { id: 'db', label: 'Sharded URL DB', sublabel: 'PK: short_code', x: 492, y: 64 },
      { id: 'ana', label: 'Kafka Click Log', sublabel: 'ClickHouse BI', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'rl', to: 'kgs', label: 'Create Link' },
      { id: 'e2', from: 'rl', to: 'rc', label: 'GET /3xK9pQ2' },
      { id: 'e3', from: 'rc', to: 'db', label: 'Cache Miss' },
      { id: 'e4', from: 'rc', to: 'ana', label: 'Async Click' },
    ],
    dfdSteps: [
      { step: 1, title: 'Token Bucket Rate Limit & KGS Base62 Minting', plainEnglish: 'Blocks abusive bots in <1ms and mints unique 7-character codes from pre-allocated RAM ranges with zero collisions.', technicalDetail: 'Randomized XOR permutation hides sequential link counts from competitors.', activeNodeIds: ['rl', 'kgs'], activeEdgeIds: ['e1'], packetLabel: 'BASE62 MINT' },
      { step: 2, title: 'Bloom Filter + Redis L1 Fast Redirect', plainEnglish: 'Rejects fake links at the Bloom Filter and serves real redirects from Redis in <5ms (HTTP 302).', technicalDetail: 'Only cold 5% cache misses ever touch the sharded URL database.', activeNodeIds: ['rl', 'rc', 'db'], activeEdgeIds: ['e2', 'e3'], packetLabel: '302 REDIRECT' },
      { step: 3, title: 'Fire-and-Forget Async Click Analytics Enqueue', plainEnglish: 'Drops country/referrer/device click events into Kafka so analytics never add 1ms to user redirect latency.', technicalDetail: 'Batch inserts into ClickHouse compress 10x for real-time marketer charts.', activeNodeIds: ['rc', 'ana'], activeEdgeIds: ['e4'], packetLabel: 'LOG CLICK' },
    ],
  },
  {
    id: 'youtube-netflix-streaming',
    shortTitle: 'YouTube & Netflix',
    title: 'YouTube / Netflix Video Streaming: DAG Transcoding Queue, Adaptive Bitrate (HLS/DASH) & ISP CDN',
    domain: 'ai-search-web',
    commPatterns: ['Enqueue', 'Webhook'],
    scaleBadge: '1B+ hrs/day · Open Connect ISP Edge',
    simpleEnglish:
      'You never stream one giant 4GB MP4 file! When a creator uploads a video, workers slice it into 4-second chunks and transcode each chunk in parallel into 5 qualities (360p to 4K) + codecs (AV1/H.265). Your player automatically switches chunk quality mid-video if your Wi-Fi dips (**Adaptive Bitrate Streaming**), pulling bytes from Netflix/YouTube servers placed right inside your ISP!',
    architectureSummary:
      'Resumable Chunked Upload -> Raw Object Store -> Enqueue DAG Transcoder (Split -> Parallel Encode 360p..4K -> Manifest HLS/DASH + DRM) -> Global CDN / ISP Open Connect Appliances (Nightly Popular Pre-Fill) -> Video Metadata Sharded DB + Watch-Progress KV Store.',
    capacityNumbers: [
      { metric: 'Chunk Segment Size', value: '2–6 seconds (HLS/DASH)' },
      { metric: 'ISP Edge Offload', value: '> 95% bytes served locally' },
      { metric: 'Upload Resume', value: 'Chunked Checksum Offset' },
      { metric: 'Watch Resume Sync', value: 'Every 15s KV heartbeat' },
    ],
    coreAlgorithms: [
      'Parallel GOP (Group of Pictures) DAG Transcoding: Splits a 2-hour movie into 1,800 chunks encoded across 200 spot workers simultaneously (turns 10h encode into 3 mins!).',
      'Adaptive Bitrate (ABR / BOLA Algorithm): Player monitors buffer fill & throughput to pick optimal chunk bitrate with zero rebuffering.',
      'Popularity-Driven Off-Peak CDN Pre-Positioning: Pushes tomorrow’s trending Netflix release to ISP Open Connect servers at 3:00 AM!',
    ],
    bottleneckAndFix:
      'Storing live `watch_position_sec` updates every 5 seconds for 200M viewers into SQL melts disks -> buffer heartbeats in Redis / Cassandra write-optimized LSM store and flush checkpoints cleanly!',
    dbDesignSummary:
      'Vitess/Sharded PostgreSQL for Video Metadata, Channels & Subscriptions; Cassandra/DynamoDB LSM store for `watch_history(user_id, video_id, position_sec)`; S3 + ISP CDN for petabytes of video segments.',
    dbTables: [
      {
        tableName: 'videos',
        engine: 'Vitess / Sharded PostgreSQL',
        partitionOrShardKey: 'video_id',
        columns: [
          { name: 'video_id', type: 'CHAR(11)', key: 'PK' },
          { name: 'channel_id', type: 'BIGINT', key: 'IDX' },
          { name: 'hls_manifest_url', type: 'TEXT' },
          { name: 'transcode_state', type: 'VARCHAR(16)' },
          { name: 'view_count', type: 'BIGINT' },
        ],
      },
      {
        tableName: 'watch_progress',
        engine: 'Cassandra / DynamoDB (Write-Heavy LSM)',
        partitionOrShardKey: 'user_id',
        columns: [
          { name: 'user_id', type: 'BIGINT', key: 'SHARD' },
          { name: 'video_id', type: 'CHAR(11)', key: 'PK' },
          { name: 'position_sec', type: 'INT' },
          { name: 'updated_at', type: 'TIMESTAMPTZ' },
        ],
      },
    ],
    dbDdlSnippet: `-- High-Write LSM Watch History & Resume Bookmark Store
CREATE TABLE watch_progress (
    user_id      BIGINT,
    video_id     TEXT,
    position_sec INT,
    updated_at   TIMESTAMP,
    PRIMARY KEY ((user_id), video_id)
);`,
    dfdNodes: [
      { id: 'up', label: 'Resumable Upload', sublabel: 'Raw S3 Chunks', x: 74, y: 112 },
      { id: 'dag', label: 'DAG Transcode Q', sublabel: 'Parallel 360p..4K', x: 212, y: 64 },
      { id: 'cdn', label: 'ISP Open Connect', sublabel: '95% Local Edge', x: 356, y: 162 },
      { id: 'abr', label: 'ABR Video Player', sublabel: 'HLS/DASH Switch', x: 492, y: 64 },
      { id: 'db', label: 'Meta + Watch DB', sublabel: 'LSM Resume Sync', x: 604, y: 146 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'up', to: 'dag', label: 'Split GOP' },
      { id: 'e2', from: 'dag', to: 'cdn', label: 'Pre-Fill Edge' },
      { id: 'e3', from: 'cdn', to: 'abr', label: '4s Chunks' },
      { id: 'e4', from: 'abr', to: 'db', label: '15s Heartbeat' },
    ],
    dfdSteps: [
      { step: 1, title: 'Chunked Resumable Upload -> Parallel DAG Transcoding', plainEnglish: 'Slices uploaded video into tiny segments and transcodes every resolution in parallel across worker pools.', technicalDetail: 'Emits HLS/DASH `.m3u8`/`.mpd` manifest and fires creator webhook once ready.', activeNodeIds: ['up', 'dag'], activeEdgeIds: ['e1'], packetLabel: 'ENCODE DAG' },
      { step: 2, title: 'ISP Open Connect Edge Pre-Fill & Adaptive Playback', plainEnglish: 'Serves 4-second video chunks straight from inside your ISP; player seamlessly shifts 4K <-> 720p on Wi-Fi dips.', technicalDetail: 'Eliminates backbone transit costs and keeps startup time under 500ms.', activeNodeIds: ['dag', 'cdn', 'abr'], activeEdgeIds: ['e2', 'e3'], packetLabel: 'ABR 4s' },
      { step: 3, title: 'High-Throughput LSM Watch Resume & View Counting', plainEnglish: 'Persists "Continue Watching" timestamps to write-heavy LSM storage and batches view counts asynchronously.', technicalDetail: 'HyperLogLog deduplicates unique views cleanly at scale.', activeNodeIds: ['abr', 'db'], activeEdgeIds: ['e4'], packetLabel: 'SAVE POS' },
    ],
  },
];
