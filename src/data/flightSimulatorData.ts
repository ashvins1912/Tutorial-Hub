export type DomainTemplateId = 'ecommerce' | 'fintech' | 'telehealth';
export type ArchitectureParadigm = 'monolith' | 'microservices';
export type BudgetTier = 'startup' | 'growth' | 'enterprise';
export type RepoModel = 'monorepo' | 'polyrepo';
export type BranchingModel = 'trunk-based' | 'gitflow';
export type RolloutStrategyId = 'rolling' | 'blue-green' | 'canary';
export type NodeCategory = 'edge' | 'compute' | 'data';

export type InfraNodeType =
  | 'cdn'
  | 'dns'
  | 'load-balancer'
  | 'api-gateway'
  | 'reverse-proxy'
  | 'web-client'
  | 'monolith-app'
  | 'auth-service'
  | 'search-service'
  | 'order-worker'
  | 'websocket-gw'
  | 'postgresql'
  | 'nosql-db'
  | 'elasticsearch'
  | 'redis-cache'
  | 'kafka-broker';

export interface UxJourneyStep {
  id: string;
  screen: string;
  userAction: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT';
  contractSample: string;
  enabled: boolean;
}

export interface DomainTemplate {
  id: DomainTemplateId;
  name: string;
  tagline: string;
  defaultDau: number;
  defaultLatencyMs: number;
  defaultBudget: BudgetTier;
  uxJourney: UxJourneyStep[];
  srsBullets: string[];
}

export interface InfraNodeCatalogItem {
  type: InfraNodeType;
  label: string;
  shortLabel: string;
  category: NodeCategory;
  defaultTechStack: string;
  techOptions: string[];
  baseLatencyMs: number;
  capacityRpsPerReplica: number;
  whatAndWhy: {
    definition: string;
    role: string;
    whatBreaksIfRemoved: string;
  };
  liveDataDfd: {
    protocol: string;
    samplePayload: string;
  };
  algorithm: {
    name: string;
    complexity: string;
    explanation: string;
  };
  teamHandoff: {
    owner: string;
    handoffChain: string;
  };
}

export interface FlightNodeData {
  id: string;
  type: InfraNodeType;
  label: string;
  x: number;
  y: number;
  techStack: string;
  replicas: number;
  killed?: boolean;
  latencyInjectedMs?: number;
  throttled?: boolean;
}

export interface FlightEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  packetKind: 'search' | 'checkout' | 'cache' | 'auth' | 'async';
}

export interface FeatureModuleDef {
  id: string;
  name: string;
  summary: string;
  mechanics: string;
  requiredNodes: InfraNodeType[];
  apiContract: string;
}

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  title: string;
  detail: string;
}

export const DOMAIN_TEMPLATES: DomainTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce Storefront',
    tagline: 'High-read catalog search, sub-100ms cart sessions, and ACID flash-sale checkout.',
    defaultDau: 450000,
    defaultLatencyMs: 120,
    defaultBudget: 'growth',
    srsBullets: [
      'Peak flash-sale throughput up to 25,000 RPS with 99.95% checkout availability.',
      'Fuzzy product search with typo tolerance and faceted filters under 60ms p95.',
      'Zero overselling via inventory reservation locks and idempotent payment webhooks.',
    ],
    uxJourney: [
      {
        id: 'ux-landing',
        screen: 'Landing Page',
        userAction: 'Load hero banners & trending SKU feed',
        endpoint: '/api/v1/catalog/trending',
        method: 'GET',
        contractSample: '{ "items": [{ "sku": "SKU-902", "priceCents": 4999, "inStock": true }] }',
        enabled: true,
      },
      {
        id: 'ux-login',
        screen: 'Login & Auth',
        userAction: 'Authenticate customer & issue short-lived JWT',
        endpoint: '/api/v1/auth/token',
        method: 'POST',
        contractSample: '{ "accessToken": "eyJhbG...", "expiresIn": 900, "scope": "cart:write" }',
        enabled: true,
      },
      {
        id: 'ux-search',
        screen: 'Product Search',
        userAction: 'Typeahead fuzzy query + category facets',
        endpoint: '/api/v1/search?q=running+shoes&page=1',
        method: 'GET',
        contractSample: '{ "hits": 142, "tookMs": 18, "results": [{ "sku": "SHOE-12", "score": 9.42 }] }',
        enabled: true,
      },
      {
        id: 'ux-cart',
        screen: 'Shopping Cart',
        userAction: 'Reserve SKU quantity in fast session store',
        endpoint: '/api/v1/cart/items',
        method: 'PUT',
        contractSample: '{ "cartId": "c_8841", "items": 2, "ttlSeconds": 900 }',
        enabled: true,
      },
      {
        id: 'ux-checkout',
        screen: 'Order & Checkout',
        userAction: 'Execute idempotent payment & async receipt event',
        endpoint: '/api/v1/orders',
        method: 'POST',
        contractSample: '{ "orderId": "ord_77412", "status": "CONFIRMED", "idempotencyKey": "ik_91a" }',
        enabled: true,
      },
    ],
  },
  {
    id: 'fintech',
    name: 'FinTech Digital Wallet',
    tagline: 'Strict double-entry ledger ACID consistency, zero-trust auth, and real-time fraud scoring.',
    defaultDau: 800000,
    defaultLatencyMs: 85,
    defaultBudget: 'enterprise',
    srsBullets: [
      'Double-entry ledger guaranteeing zero double-spends via SERIALIZABLE/Row-Lock transactions.',
      'End-to-end TLS 1.3 + mTLS service mesh with hardware-backed JWT signing keys.',
      'Real-time push balance notifications and asynchronous AML/fraud audit streaming.',
    ],
    uxJourney: [
      {
        id: 'ux-login',
        screen: 'Biometric Login',
        userAction: 'OAuth2 PKCE + device key verification',
        endpoint: '/api/v1/auth/verify-device',
        method: 'POST',
        contractSample: '{ "sessionId": "ses_941", "mfaVerified": true, "riskScore": 0.04 }',
        enabled: true,
      },
      {
        id: 'ux-dash',
        screen: 'Wallet Dashboard',
        userAction: 'Fetch cached balance & recent ledger entries',
        endpoint: '/api/v1/wallet/summary',
        method: 'GET',
        contractSample: '{ "balanceCents": 184250, "currency": "USD", "cacheHit": true }',
        enabled: true,
      },
      {
        id: 'ux-transfer',
        screen: 'Instant P2P Transfer',
        userAction: 'Execute atomic debit/credit ledger posting',
        endpoint: '/api/v1/transfers',
        method: 'POST',
        contractSample: '{ "txId": "tx_992104", "status": "SETTLED", "ledgerSeq": 8841920 }',
        enabled: true,
      },
      {
        id: 'ux-notify',
        screen: 'Live Receipt Stream',
        userAction: 'Broadcast settlement confirmation over WebSocket',
        endpoint: '/ws/v1/ledger-events',
        method: 'GET',
        contractSample: '{ "event": "TRANSFER_SETTLED", "txId": "tx_992104", "latencyMs": 31 }',
        enabled: true,
      },
    ],
  },
  {
    id: 'telehealth',
    name: 'Telehealth Consultation App',
    tagline: 'HIPAA-safe patient records, real-time appointment search, and live WebSocket triage queues.',
    defaultDau: 180000,
    defaultLatencyMs: 150,
    defaultBudget: 'startup',
    srsBullets: [
      'Encrypted PHI at rest (KMS) and in transit with strict RBAC audit logs.',
      'Real-time doctor availability slot locking without double bookings.',
      'Low-latency WebSocket signaling for patient waiting room & clinician chat.',
    ],
    uxJourney: [
      {
        id: 'ux-login',
        screen: 'Patient Portal Login',
        userAction: 'Verify patient identity & HIPAA consent claims',
        endpoint: '/api/v1/auth/patient-login',
        method: 'POST',
        contractSample: '{ "patientId": "pat_221", "role": "PATIENT", "auditLogged": true }',
        enabled: true,
      },
      {
        id: 'ux-search',
        screen: 'Find Specialist',
        userAction: 'Filter clinicians by specialty, language & slot',
        endpoint: '/api/v1/doctors/search?specialty=cardiology',
        method: 'GET',
        contractSample: '{ "doctors": [{ "id": "doc_14", "nextSlot": "2026-11-22T15:00Z" }] }',
        enabled: true,
      },
      {
        id: 'ux-book',
        screen: 'Book Appointment',
        userAction: 'Atomically lock 30-min slot & dispatch calendar invite',
        endpoint: '/api/v1/appointments',
        method: 'POST',
        contractSample: '{ "appointmentId": "apt_4081", "slotLocked": true }',
        enabled: true,
      },
      {
        id: 'ux-room',
        screen: 'Live Waiting Room',
        userAction: 'Real-time queue position updates via WebSocket',
        endpoint: '/ws/v1/triage-room',
        method: 'GET',
        contractSample: '{ "queuePosition": 1, "clinicianReady": true }',
        enabled: true,
      },
    ],
  },
];

export const INFRA_NODE_CATALOG: Record<InfraNodeType, InfraNodeCatalogItem> = {
  'web-client': {
    type: 'web-client',
    label: 'Web / Mobile Client',
    shortLabel: 'Client App',
    category: 'edge',
    defaultTechStack: 'React 19 + Next.js',
    techOptions: ['React 19 + Next.js', 'React SPA + Vite', 'Flutter Mobile', 'Swift / Kotlin Native'],
    baseLatencyMs: 8,
    capacityRpsPerReplica: 100000,
    whatAndWhy: {
      definition: 'The browser or mobile interface where users trigger clicks, searches, and checkouts.',
      role: 'Renders optimistic UI states, caches static bundles, and signs outgoing HTTPS API requests.',
      whatBreaksIfRemoved: 'No user-facing entry point exists to drive traffic or collect customer intent.',
    },
    liveDataDfd: {
      protocol: 'HTTPS / HTTP3',
      samplePayload: `GET /api/v1/search?q=sneakers HTTP/3\nAuthorization: Bearer eyJhbGciOiJSUzI1NiJ9...\nX-Request-Id: req_71f09a`,
    },
    algorithm: {
      name: 'Virtual DOM Reconciliation + Stale-While-Revalidate',
      complexity: 'O(N) diff / O(1) cache hit',
      explanation: 'Diffs minimal UI updates while serving cached API responses immediately and refreshing in the background.',
    },
    teamHandoff: {
      owner: 'UX Designer + Frontend Engineer',
      handoffChain: 'UX defines interactive journeys -> Frontend wires typed API contracts -> DevOps ships static assets to CDN.',
    },
  },
  dns: {
    type: 'dns',
    label: 'Global DNS',
    shortLabel: 'DNS',
    category: 'edge',
    defaultTechStack: 'AWS Route 53 / Cloud DNS',
    techOptions: ['AWS Route 53', 'GCP Cloud DNS', 'Cloudflare DNS', 'CoreDNS (On-Prem)'],
    baseLatencyMs: 6,
    capacityRpsPerReplica: 100000,
    whatAndWhy: {
      definition: 'Translates human domain names into the nearest healthy edge or Load Balancer IP address.',
      role: 'Performs GeoDNS latency routing and health-checked multi-region failover.',
      whatBreaksIfRemoved: 'Clients cannot resolve service hostnames or automatically fail over during regional outages.',
    },
    liveDataDfd: {
      protocol: 'DNS over HTTPS / UDP 53',
      samplePayload: `QUERY A api.storefront.io\nANSWER 52.84.11.42 (TTL: 60s, Geo: ap-south-1)`,
    },
    algorithm: {
      name: 'Anycast BGP + Geo-Proximity Weighted Routing',
      complexity: 'O(1) hierarchical cache lookup',
      explanation: 'Routes DNS resolution to the topologically closest PoP and shifts weights away from unhealthy endpoints.',
    },
    teamHandoff: {
      owner: 'DevOps / Network SRE',
      handoffChain: 'Architect sets multi-region failover policy -> SRE manages DNS records declaratively via Terraform.',
    },
  },
  cdn: {
    type: 'cdn',
    label: 'Edge CDN',
    shortLabel: 'CDN',
    category: 'edge',
    defaultTechStack: 'CloudFront / Cloudflare',
    techOptions: ['AWS CloudFront', 'GCP Cloud CDN', 'Cloudflare Edge', 'Fastly Varnish'],
    baseLatencyMs: 10,
    capacityRpsPerReplica: 80000,
    whatAndWhy: {
      definition: 'Globally distributed edge servers caching static assets, images, and public catalog responses near users.',
      role: 'Absorbs 70-90% of read bandwidth at the edge before traffic ever touches your origin servers.',
      whatBreaksIfRemoved: 'Origin servers get overwhelmed by image and static bundle requests, spiking latency and egress costs.',
    },
    liveDataDfd: {
      protocol: 'HTTP/3 QUIC',
      samplePayload: `HTTP/3 200 OK\nX-Cache: HIT from edge-bom-04\nCache-Control: public, max-age=300, stale-while-revalidate=60`,
    },
    algorithm: {
      name: 'Edge Consistent Hashing + W-TinyLFU Cache Eviction',
      complexity: 'O(1) edge lookup',
      explanation: 'Maps cache keys consistently across edge PoPs while keeping hot catalog items resident in NVMe/RAM.',
    },
    teamHandoff: {
      owner: 'Frontend + DevOps SRE',
      handoffChain: 'Frontend sets Cache-Control & content hashes -> SRE configures origin shield and WAF rules.',
    },
  },
  'load-balancer': {
    type: 'load-balancer',
    label: 'L4/L7 Load Balancer',
    shortLabel: 'Load Balancer',
    category: 'edge',
    defaultTechStack: 'AWS ALB / HAProxy',
    techOptions: ['AWS ALB / NLB', 'GCP Cloud Load Balancing', 'HAProxy + Keepalived', 'NGINX / Envoy'],
    baseLatencyMs: 7,
    capacityRpsPerReplica: 45000,
    whatAndWhy: {
      definition: 'Distributes incoming client connections evenly across healthy backend replicas and terminates TLS.',
      role: 'Enables horizontal scaling, zero-downtime Rolling/Blue-Green/Canary rollouts, and automatic unhealthy pod ejection.',
      whatBreaksIfRemoved: 'Traffic pins to a single server instance—causing immediate saturation and total outage on any node reboot.',
    },
    liveDataDfd: {
      protocol: 'TLS 1.3 -> HTTP/2',
      samplePayload: `X-Forwarded-For: 203.0.113.19\nX-Target-Group: prod-v2 (weight: 25%)\nUpstream-Health: 4/4 healthy`,
    },
    algorithm: {
      name: 'Least-Connections + Weighted Consistent Hashing',
      complexity: 'O(log N) / O(1) pool select',
      explanation: 'Routes each new request to the healthy backend with the fewest active in-flight requests to avoid tail-latency hotspots.',
    },
    teamHandoff: {
      owner: 'Architect + DevOps SRE',
      handoffChain: 'Backend exposes /healthz/ready -> SRE tunes drain timeouts, TLS ciphers, and weighted rollout splits.',
    },
  },
  'api-gateway': {
    type: 'api-gateway',
    label: 'API Gateway',
    shortLabel: 'API Gateway',
    category: 'edge',
    defaultTechStack: 'Kong / Envoy Gateway',
    techOptions: ['AWS API Gateway', 'Kong / Envoy Gateway', 'Apigee (GCP)', 'Traefik Enterprise'],
    baseLatencyMs: 9,
    capacityRpsPerReplica: 30000,
    whatAndWhy: {
      definition: 'The unified front door for APIs handling authentication verification, rate limiting, routing, and request shaping.',
      role: 'Protects downstream microservices from abusive traffic bursts and enforces consistent auth and telemetry headers.',
      whatBreaksIfRemoved: 'Every microservice must reimplement rate limiting, CORS, and JWT validation—leading to security gaps and DDoS vulnerability.',
    },
    liveDataDfd: {
      protocol: 'HTTPS REST / gRPC',
      samplePayload: `X-RateLimit-Remaining: 118/120\nX-Auth-Sub: usr_4491\nRoute-Matched: /api/v1/orders -> order-worker:8080`,
    },
    algorithm: {
      name: 'Token Bucket Rate Limiter + Radix Trie Path Router',
      complexity: 'O(1) token check / O(k) path match',
      explanation: 'Refills per-tenant tokens at a fixed rate allowing controlled bursts while dropping excess requests with HTTP 429.',
    },
    teamHandoff: {
      owner: 'Architect + Platform Team',
      handoffChain: 'UX & Backend agree on OpenAPI schema -> Platform team publishes Gateway routes and rate-limit quotas.',
    },
  },
  'reverse-proxy': {
    type: 'reverse-proxy',
    label: 'Reverse Proxy',
    shortLabel: 'Reverse Proxy',
    category: 'edge',
    defaultTechStack: 'NGINX / Envoy',
    techOptions: ['NGINX', 'Envoy Proxy', 'Traefik', 'Caddy'],
    baseLatencyMs: 5,
    capacityRpsPerReplica: 35000,
    whatAndWhy: {
      definition: 'Sits in front of internal web/application servers to compress responses, buffer slow clients, and shield internal IPs.',
      role: 'Offloads gzip/brotli compression, connection keep-alive pooling, and static file serving from app threads.',
      whatBreaksIfRemoved: 'Slow mobile clients hold expensive backend worker threads open, exhausting thread pools under mild load.',
    },
    liveDataDfd: {
      protocol: 'HTTP/2 -> Keep-Alive HTTP/1.1',
      samplePayload: `Content-Encoding: br\nConnection: keep-alive\nX-Upstream-Connect-Ms: 1.2`,
    },
    algorithm: {
      name: 'Event-Driven epoll / kqueue Non-Blocking I/O Loop',
      complexity: 'O(1) active socket dispatch',
      explanation: 'Handles tens of thousands of concurrent sockets on a handful of event-loop workers without thread-per-connection overhead.',
    },
    teamHandoff: {
      owner: 'DevOps / Platform Engineer',
      handoffChain: 'Backend tunes upstream timeouts -> DevOps packages NGINX/Envoy sidecar configuration in GitOps.',
    },
  },
  'monolith-app': {
    type: 'monolith-app',
    label: 'Monolith App Server',
    shortLabel: 'Monolith API',
    category: 'compute',
    defaultTechStack: 'Node.js + Express',
    techOptions: ['Node.js + Express', 'Python + FastAPI', 'Java + Spring Boot', 'Ruby on Rails'],
    baseLatencyMs: 24,
    capacityRpsPerReplica: 3500,
    whatAndWhy: {
      definition: 'A single deployable application unit bundling Auth, Catalog, Cart, and Orders inside one shared codebase and runtime.',
      role: 'Maximizes early-stage velocity with zero network hops between modules and simple local debugging.',
      whatBreaksIfRemoved: 'All core business logic disappears; however, a memory leak in Search inside a monolith crashes Checkout too (large blast radius).',
    },
    liveDataDfd: {
      protocol: 'In-Process Calls -> SQL',
      samplePayload: `POST /api/v1/orders\n{ "userId": "u_82", "sku": "SKU-902", "qty": 1 }\n-> In-process call: auth.verify() -> cart.lock() -> db.commit()`,
    },
    algorithm: {
      name: 'Thread Pool / Event Loop Work Queue + Connection Pooling',
      complexity: 'O(1) in-process invocation',
      explanation: 'Avoids cross-service RPC serialization overhead, though CPU-heavy endpoints compete for the same runtime pool.',
    },
    teamHandoff: {
      owner: 'Full-Stack Engineering Team',
      handoffChain: 'UX -> Single Full-Stack team implements feature modules in one repo -> DevOps deploys unified container.',
    },
  },
  'auth-service': {
    type: 'auth-service',
    label: 'Auth & Identity Service',
    shortLabel: 'Auth Service',
    category: 'compute',
    defaultTechStack: 'Go + Fiber (OIDC/JWT)',
    techOptions: ['Go + Fiber', 'Node.js + Express', 'Java + Spring Security', 'Keycloak / Cognito'],
    baseLatencyMs: 18,
    capacityRpsPerReplica: 6000,
    whatAndWhy: {
      definition: 'Dedicated microservice managing credential verification, OAuth2/OIDC flows, password hashing, and short-lived JWT issuance.',
      role: 'Isolates security-critical identity logic and signing keys from general product code.',
      whatBreaksIfRemoved: 'Users cannot log in, refresh sessions, or prove authorization to checkout or view dashboards.',
    },
    liveDataDfd: {
      protocol: 'gRPC / HTTPS JSON',
      samplePayload: `POST /internal/auth/issue\n{ "sub": "usr_4491", "alg": "RS256", "exp": 1795324900, "jti": "tok_9f2a" }`,
    },
    algorithm: {
      name: 'Argon2id Memory-Hard Hashing + Asymmetric RS256/EdDSA JWT',
      complexity: 'Constant-time verification',
      explanation: 'Resists GPU brute-force attacks on stored password hashes while letting downstream gateways verify JWT signatures offline via JWKS.',
    },
    teamHandoff: {
      owner: 'Security & Identity Backend Squad',
      handoffChain: 'UX designs login/MFA flows -> Auth team exposes OIDC endpoints -> SRE rotates KMS signing keys.',
    },
  },
  'search-service': {
    type: 'search-service',
    label: 'Product Search Service',
    shortLabel: 'Search Service',
    category: 'compute',
    defaultTechStack: 'Python + FastAPI',
    techOptions: ['Python + FastAPI', 'Go + Gin', 'Java + Spring Boot', 'Node.js + Fastify'],
    baseLatencyMs: 22,
    capacityRpsPerReplica: 5000,
    whatAndWhy: {
      definition: 'Stateless read-heavy service translating user search text and filter facets into ranked search engine queries.',
      role: 'Scales independently during catalog browsing spikes without stealing CPU from transactional checkout.',
      whatBreaksIfRemoved: 'Product discovery and typeahead autocomplete fail, slashing conversion rates.',
    },
    liveDataDfd: {
      protocol: 'HTTPS -> Elasticsearch REST',
      samplePayload: `{ "query": "running shoes", "fuzziness": "AUTO", "filters": { "inStock": true }, "from": 0, "size": 20 }`,
    },
    algorithm: {
      name: 'Query Rewrite + Levenshtein Automaton + BM25 Reranking',
      complexity: 'O(posting list intersection)',
      explanation: 'Expands typos using finite-state edit distance and scores matching SKUs by term rarity and popularity boosts.',
    },
    teamHandoff: {
      owner: 'Discovery & Search Squad',
      handoffChain: 'UX designs faceted filter bar -> Search team builds ranking pipeline -> SRE scales Elasticsearch shard replicas.',
    },
  },
  'order-worker': {
    type: 'order-worker',
    label: 'Order & Checkout Service',
    shortLabel: 'Order Service',
    category: 'compute',
    defaultTechStack: 'Java 21 + Spring Boot',
    techOptions: ['Java 21 + Spring Boot', 'Go + gRPC', 'Node.js + NestJS', 'Python + FastAPI'],
    baseLatencyMs: 32,
    capacityRpsPerReplica: 3200,
    whatAndWhy: {
      definition: 'Handles high-integrity transactional workflows: inventory locking, idempotent payment capture, and async event emission.',
      role: 'Guarantees exactly-once order creation even when mobile clients retry timed-out requests.',
      whatBreaksIfRemoved: 'Customers cannot complete purchases, or retries create duplicate charges and negative inventory.',
    },
    liveDataDfd: {
      protocol: 'HTTPS + Transactional Outbox',
      samplePayload: `BEGIN;\nUPDATE inventory SET qty = qty - 1 WHERE sku='SKU-902' AND qty >= 1;\nINSERT INTO outbox_events (topic, payload) VALUES ('orders.created', '{"orderId":"ord_77412"}');\nCOMMIT;`,
    },
    algorithm: {
      name: 'Idempotency Key Deduplication + Saga / Transactional Outbox',
      complexity: 'O(log N) indexed lock',
      explanation: 'Prevents double charges on network retries and atomically couples DB writes with asynchronous Kafka notifications.',
    },
    teamHandoff: {
      owner: 'Checkout & Payments Squad',
      handoffChain: 'UX builds checkout error states -> Payments team implements Saga/Outbox -> DevOps sets strict 99.95% SLO alerts.',
    },
  },
  'websocket-gw': {
    type: 'websocket-gw',
    label: 'WebSocket Real-Time Gateway',
    shortLabel: 'WebSocket GW',
    category: 'compute',
    defaultTechStack: 'Go / Node.js WS Cluster',
    techOptions: ['Go + Gorilla WS', 'Node.js + uWebSockets', 'Elixir Phoenix Channels', 'AWS API GW WebSocket'],
    baseLatencyMs: 11,
    capacityRpsPerReplica: 15000,
    whatAndWhy: {
      definition: 'Maintains persistent bidirectional TCP connections for instant order tracking, chat, or live wallet updates.',
      role: 'Pushes server-side state changes to browsers in milliseconds without wasteful HTTP polling.',
      whatBreaksIfRemoved: 'Users must manually refresh pages or hammer APIs with polling loops for live updates.',
    },
    liveDataDfd: {
      protocol: 'WSS (RFC 6455)',
      samplePayload: `WS PUSH -> { "channel": "order:ord_77412", "status": "PACKED", "etaMin": 9 }`,
    },
    algorithm: {
      name: 'Pub/Sub Fan-Out + Heartbeat Ping/Pong Liveness',
      complexity: 'O(subscribers) fan-out',
      explanation: 'Subscribes gateway nodes to Redis/Kafka topics and drops stale half-open sockets via periodic ping frames.',
    },
    teamHandoff: {
      owner: 'Realtime Platform Team',
      handoffChain: 'UX designs live status banners -> Realtime team manages WS reconnect backoff -> SRE tunes kernel file descriptors (ulimit).',
    },
  },
  'redis-cache': {
    type: 'redis-cache',
    label: 'Redis In-Memory Cache',
    shortLabel: 'Redis Cache',
    category: 'data',
    defaultTechStack: 'Redis 7 Cluster',
    techOptions: ['Redis 7 Cluster', 'Valkey', 'AWS ElastiCache', 'GCP Memorystore'],
    baseLatencyMs: 2,
    capacityRpsPerReplica: 50000,
    whatAndWhy: {
      definition: 'Sub-millisecond RAM key-value store caching hot catalog items, user sessions, shopping carts, and rate-limit counters.',
      role: 'Protects relational databases from read storms—serving 80%+ of reads in < 2ms.',
      whatBreaksIfRemoved: 'Every product view and session check slams PostgreSQL directly, causing connection exhaustion and 10x slower p99 latency.',
    },
    liveDataDfd: {
      protocol: 'RESP3 TCP',
      samplePayload: `GET catalog:sku:SKU-902 -> HIT (1.1ms)\nHSET cart:u_82 SKU-902 2 EX 900 -> OK`,
    },
    algorithm: {
      name: 'Approximated LRU / LFU Eviction + Single-Threaded Event Loop',
      complexity: 'O(1) hash table lookup',
      explanation: 'Samples random key pools to evict cold entries when memory reaches maxmemory, avoiding global lock contention.',
    },
    teamHandoff: {
      owner: 'Backend + Data SRE',
      handoffChain: 'Backend designs cache-aside TTLs & jitter -> SRE monitors hit ratio (> 85%) and eviction spikes.',
    },
  },
  postgresql: {
    type: 'postgresql',
    label: 'PostgreSQL (Primary SQL)',
    shortLabel: 'PostgreSQL',
    category: 'data',
    defaultTechStack: 'PostgreSQL 16 HA',
    techOptions: ['PostgreSQL 16 (RDS/Cloud SQL)', 'Amazon Aurora Postgres', 'MySQL 8 InnoDB', 'Patroni HA (On-Prem)'],
    baseLatencyMs: 16,
    capacityRpsPerReplica: 4500,
    whatAndWhy: {
      definition: 'ACID-compliant relational system of record storing users, orders, ledger transactions, and inventory counts.',
      role: 'Guarantees durable, strongly consistent writes with foreign-key integrity and row-level locking.',
      whatBreaksIfRemoved: 'System loses durable transactional persistence—every order, balance, or user record vanishes on restart.',
    },
    liveDataDfd: {
      protocol: 'PostgreSQL Wire TLS',
      samplePayload: `SELECT id, stock_qty FROM inventory WHERE sku = $1 FOR UPDATE;\n-- Index Scan using idx_inventory_sku (cost=0.29..8.30, 1.4ms)`,
    },
    algorithm: {
      name: 'B+Tree Indexing + MVCC + Write-Ahead Log (WAL)',
      complexity: 'O(log N) B+Tree seek',
      explanation: 'Readers never block writers via Multi-Version Concurrency Control, while sequential WAL flushes guarantee crash durability.',
    },
    teamHandoff: {
      owner: 'Backend + Database Reliability Engineer',
      handoffChain: 'Backend writes Expand-Contract migrations -> DBRE tunes PgBouncer pools, read replicas, and PITR backups.',
    },
  },
  'nosql-db': {
    type: 'nosql-db',
    label: 'NoSQL Document / Wide-Column',
    shortLabel: 'NoSQL DB',
    category: 'data',
    defaultTechStack: 'MongoDB / Cassandra',
    techOptions: ['MongoDB Atlas', 'Apache Cassandra', 'AWS DynamoDB', 'GCP Firestore'],
    baseLatencyMs: 12,
    capacityRpsPerReplica: 12000,
    whatAndWhy: {
      definition: 'Horizontally sharded schema-flexible database optimized for massive write ingestion, product attributes, or activity feeds.',
      role: 'Scales linearly across commodity nodes via partition keys without expensive cross-table SQL joins.',
      whatBreaksIfRemoved: 'High-volume unstructured catalogs or clickstream logs bloat relational tables and slow down schema migrations.',
    },
    liveDataDfd: {
      protocol: 'Wire Binary / CQL',
      samplePayload: `db.catalog.findOne({ _id: "SKU-902" })\n// Partition Key hash -> Shard 04 (3.2ms)`,
    },
    algorithm: {
      name: 'LSM-Tree (MemTable + SSTables) + Consistent Ring Sharding',
      complexity: 'O(1) amortized append write',
      explanation: 'Turns random writes into fast sequential appends in memory and compacts sorted immutable files asynchronously.',
    },
    teamHandoff: {
      owner: 'Backend + Data Platform',
      handoffChain: 'Architect selects high-cardinality partition key -> Backend models access patterns -> SRE monitors compaction I/O.',
    },
  },
  elasticsearch: {
    type: 'elasticsearch',
    label: 'Elasticsearch Engine',
    shortLabel: 'Elasticsearch',
    category: 'data',
    defaultTechStack: 'Elasticsearch / OpenSearch',
    techOptions: ['Elasticsearch 8', 'AWS OpenSearch', 'Meilisearch', 'Typesense'],
    baseLatencyMs: 14,
    capacityRpsPerReplica: 9000,
    whatAndWhy: {
      definition: 'Distributed full-text search and analytics index supporting fuzzy typo matching, synonyms, and instant facet counts.',
      role: 'Answers complex text queries in milliseconds that would cause full-table LIKE "%query%" scans in SQL.',
      whatBreaksIfRemoved: 'Search falls back to slow SQL wildcards, locking the primary database and destroying search relevance.',
    },
    liveDataDfd: {
      protocol: 'HTTP JSON REST',
      samplePayload: `POST /products/_search\n{ "query": { "multi_match": { "query": "runing shos", "fuzziness": "AUTO" } } }`,
    },
    algorithm: {
      name: 'Inverted Index + FST Prefix Dictionary + BM25 Scoring',
      complexity: 'O(matched postings)',
      explanation: 'Maps normalized tokens directly to sorted document ID bitsets and scores relevance via term frequency and document length.',
    },
    teamHandoff: {
      owner: 'Search Engineering + SRE',
      handoffChain: 'UX defines filter facets -> Search team maintains CDC sync from DB -> SRE sizes JVM heap and shard count.',
    },
  },
  'kafka-broker': {
    type: 'kafka-broker',
    label: 'Kafka Event Broker',
    shortLabel: 'Kafka Queue',
    category: 'data',
    defaultTechStack: 'Apache Kafka / MSK',
    techOptions: ['Apache Kafka (On-Prem)', 'AWS MSK', 'GCP Pub/Sub', 'RabbitMQ'],
    baseLatencyMs: 6,
    capacityRpsPerReplica: 40000,
    whatAndWhy: {
      definition: 'Durable distributed event log decoupling fast checkout APIs from slow downstream work like emails, SMS, analytics, and inventory sync.',
      role: 'Absorbs massive traffic spikes as a shock absorber so slow downstream consumers never fail customer checkouts.',
      whatBreaksIfRemoved: 'Synchronous calls to email/SMS/ERP providers stall checkout threads and cascade a third-party outage into total downtime.',
    },
    liveDataDfd: {
      protocol: 'Kafka Binary TCP',
      samplePayload: `PRODUCE topic="orders.created" partition=3 offset=910442\n{ "orderId": "ord_77412", "email": "notify_async", "totalCents": 4999 }`,
    },
    algorithm: {
      name: 'Partitioned Append-Only Commit Log + Zero-Copy sendfile()',
      complexity: 'O(1) sequential disk write',
      explanation: 'Transfers bytes directly from OS page cache to NIC without user-space copies while preserving strict per-key ordering inside each partition.',
    },
    teamHandoff: {
      owner: 'Event Platform + Backend Teams',
      handoffChain: 'Architect defines Avro/Protobuf event schemas -> Producers emit outbox events -> SRE alerts on consumer lag.',
    },
  },
};

export const FEATURE_MODULES: FeatureModuleDef[] = [
  {
    id: 'feat-auth',
    name: 'User Authentication & Login',
    summary: 'JWT/OAuth2 token issuance, Argon2id password hashing, and Redis session revocation list.',
    mechanics: 'Client -> API Gateway -> Auth Service -> PostgreSQL (credentials) + Redis (refresh/revocation)',
    requiredNodes: ['api-gateway', 'auth-service', 'redis-cache', 'postgresql'],
    apiContract: 'POST /api/v1/auth/token -> { accessToken, refreshToken, expiresIn: 900 }',
  },
  {
    id: 'feat-dashboard',
    name: 'User Dashboard',
    summary: 'Aggregated profile, recent activity, and cache-aside Redis hydration with TTL jitter.',
    mechanics: 'Client -> API Gateway -> Redis Cache Hit (< 2ms) OR PostgreSQL Miss Hydration',
    requiredNodes: ['api-gateway', 'redis-cache', 'postgresql'],
    apiContract: 'GET /api/v1/users/me/dashboard -> { profile, recentOrders, cacheHit: true }',
  },
  {
    id: 'feat-search',
    name: 'Product Search & Facets',
    summary: 'Fuzzy text matching, BM25 inverted index ranking, and cursor pagination.',
    mechanics: 'Client -> CDN / API Gateway -> Search Service -> Elasticsearch Inverted Index',
    requiredNodes: ['cdn', 'search-service', 'elasticsearch'],
    apiContract: 'GET /api/v1/search?q=shoes&cursor=eyJwIjoxfQ -> { hits, facets, tookMs: 16 }',
  },
  {
    id: 'feat-cart',
    name: 'Shopping Cart',
    summary: 'High-speed Redis hash session persistence with optimistic inventory reservation locks.',
    mechanics: 'Client -> API Gateway -> Order/App Service -> Redis Hash Cart (TTL 15m)',
    requiredNodes: ['api-gateway', 'redis-cache'],
    apiContract: 'PUT /api/v1/cart/items -> { cartId, lineItems, reservedUntil }',
  },
  {
    id: 'feat-checkout',
    name: 'Order & Checkout',
    summary: 'Idempotent distributed transactions, payment webhooks, and async Kafka email/SMS notifications.',
    mechanics: 'Client -> API Gateway -> Order Service -> PostgreSQL ACID Commit + Kafka Event Fan-out',
    requiredNodes: ['api-gateway', 'order-worker', 'postgresql', 'kafka-broker'],
    apiContract: 'POST /api/v1/orders (Idempotency-Key) -> { orderId, status: "CONFIRMED" }',
  },
];

export function buildPresetTopology(paradigm: ArchitectureParadigm): {
  nodes: FlightNodeData[];
  edges: FlightEdgeData[];
} {
  if (paradigm === 'monolith') {
    const nodes: FlightNodeData[] = [
      { id: 'n-client', type: 'web-client', label: 'Web / Mobile Client', x: 20, y: 150, techStack: 'React 19 + Next.js', replicas: 1 },
      { id: 'n-cdn', type: 'cdn', label: 'Edge CDN', x: 225, y: 55, techStack: 'CloudFront / Cloudflare', replicas: 2 },
      { id: 'n-lb', type: 'load-balancer', label: 'L7 Load Balancer', x: 225, y: 190, techStack: 'AWS ALB / HAProxy', replicas: 2 },
      { id: 'n-mono', type: 'monolith-app', label: 'Monolith App Server', x: 455, y: 150, techStack: 'Node.js + Express', replicas: 3 },
      { id: 'n-redis', type: 'redis-cache', label: 'Redis Cache', x: 700, y: 65, techStack: 'Redis 7 Cluster', replicas: 2 },
      { id: 'n-pg', type: 'postgresql', label: 'PostgreSQL Primary', x: 700, y: 220, techStack: 'PostgreSQL 16 HA', replicas: 2 },
    ];
    const edges: FlightEdgeData[] = [
      { id: 'e-c-cdn', source: 'n-client', target: 'n-cdn', label: 'Static + Edge', packetKind: 'search' },
      { id: 'e-c-lb', source: 'n-client', target: 'n-lb', label: 'HTTPS API', packetKind: 'checkout' },
      { id: 'e-cdn-lb', source: 'n-cdn', target: 'n-lb', label: 'Origin Miss', packetKind: 'search' },
      { id: 'e-lb-mono', source: 'n-lb', target: 'n-mono', label: 'Least-Conn', packetKind: 'checkout' },
      { id: 'e-mono-redis', source: 'n-mono', target: 'n-redis', label: 'Cache Check', packetKind: 'cache' },
      { id: 'e-mono-pg', source: 'n-mono', target: 'n-pg', label: 'ACID SQL', packetKind: 'checkout' },
    ];
    return { nodes, edges };
  }

  const nodes: FlightNodeData[] = [
    { id: 'n-client', type: 'web-client', label: 'Web / Mobile Client', x: 10, y: 165, techStack: 'React 19 + Next.js', replicas: 1 },
    { id: 'n-cdn', type: 'cdn', label: 'Edge CDN', x: 195, y: 55, techStack: 'CloudFront / Cloudflare', replicas: 2 },
    { id: 'n-gw', type: 'api-gateway', label: 'API Gateway + LB', x: 195, y: 195, techStack: 'Kong / Envoy Gateway', replicas: 3 },
    { id: 'n-auth', type: 'auth-service', label: 'Auth Service', x: 425, y: 35, techStack: 'Go + Fiber (JWT)', replicas: 2 },
    { id: 'n-search', type: 'search-service', label: 'Search Service', x: 425, y: 155, techStack: 'Python + FastAPI', replicas: 3 },
    { id: 'n-order', type: 'order-worker', label: 'Order & Checkout', x: 425, y: 280, techStack: 'Java 21 + Spring Boot', replicas: 3 },
    { id: 'n-redis', type: 'redis-cache', label: 'Redis Cache', x: 685, y: 35, techStack: 'Redis 7 Cluster', replicas: 3 },
    { id: 'n-es', type: 'elasticsearch', label: 'Elasticsearch', x: 685, y: 145, techStack: 'Elasticsearch 8', replicas: 3 },
    { id: 'n-pg', type: 'postgresql', label: 'PostgreSQL HA', x: 685, y: 250, techStack: 'PostgreSQL 16 HA', replicas: 2 },
    { id: 'n-kafka', type: 'kafka-broker', label: 'Kafka Event Bus', x: 685, y: 350, techStack: 'Apache Kafka / MSK', replicas: 3 },
  ];
  const edges: FlightEdgeData[] = [
    { id: 'e-1', source: 'n-client', target: 'n-cdn', label: 'Edge Cache', packetKind: 'search' },
    { id: 'e-2', source: 'n-client', target: 'n-gw', label: 'HTTPS / JWT', packetKind: 'checkout' },
    { id: 'e-3', source: 'n-gw', target: 'n-auth', label: 'Verify Token', packetKind: 'auth' },
    { id: 'e-4', source: 'n-gw', target: 'n-search', label: 'Search GET', packetKind: 'search' },
    { id: 'e-5', source: 'n-gw', target: 'n-order', label: 'Checkout POST', packetKind: 'checkout' },
    { id: 'e-6', source: 'n-auth', target: 'n-redis', label: 'Session Hit', packetKind: 'cache' },
    { id: 'e-7', source: 'n-search', target: 'n-redis', label: 'Hot SKU Hit', packetKind: 'cache' },
    { id: 'e-8', source: 'n-search', target: 'n-es', label: 'BM25 Query', packetKind: 'search' },
    { id: 'e-9', source: 'n-order', target: 'n-pg', label: 'ACID Lock', packetKind: 'checkout' },
    { id: 'e-10', source: 'n-order', target: 'n-kafka', label: 'Outbox Event', packetKind: 'async' },
  ];
  return { nodes, edges };
}

export function validateTopology(
  nodes: FlightNodeData[],
  edges: FlightEdgeData[],
  dau: number,
  targetLatencyMs: number,
  enabledFeatures: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const typesPresent = new Set(nodes.map((n) => n.type));

  // 1. Direct Client -> Database anti-pattern
  for (const edge of edges) {
    const src = nodeById.get(edge.source);
    const dst = nodeById.get(edge.target);
    if (
      src?.type === 'web-client' &&
      dst &&
      (dst.type === 'postgresql' || dst.type === 'nosql-db' || dst.type === 'redis-cache' || dst.type === 'elasticsearch')
    ) {
      issues.push({
        id: `direct-db-${edge.id}`,
        severity: 'error',
        title: 'Direct Client-to-Database Connection Detected',
        detail: `Edge connects ${src.label} directly to ${dst.label}. Always route through an API Gateway and compute service to enforce auth and prevent SQL/credential exposure.`,
      });
    }
  }

  // 2. Missing Edge Entry / Load Balancer or API Gateway
  if (!typesPresent.has('load-balancer') && !typesPresent.has('api-gateway')) {
    issues.push({
      id: 'missing-gateway',
      severity: 'error',
      title: 'No Load Balancer or API Gateway Placed',
      detail: 'Add an L4/L7 Load Balancer or API Gateway to terminate TLS, rate-limit bursts, and distribute traffic across compute replicas.',
    });
  }

  // 3. Single Point of Failure check on critical nodes
  for (const node of nodes) {
    if (
      (node.type === 'auth-service' || node.type === 'postgresql' || node.type === 'monolith-app') &&
      node.replicas <= 1 &&
      dau >= 100000
    ) {
      issues.push({
        id: `spof-${node.id}`,
        severity: 'warning',
        title: `Single Point of Failure on ${node.label}`,
        detail: `${node.label} has only 1 replica for ${dau.toLocaleString()} DAU. Scale to >= 2 replicas or Multi-AZ HA.`,
      });
    }
  }

  // 4. Missing Cache under aggressive latency or high DAU
  if (!typesPresent.has('redis-cache') && (dau >= 200000 || targetLatencyMs <= 120)) {
    issues.push({
      id: 'missing-redis',
      severity: 'warning',
      title: 'Missing In-Memory Cache (Redis) for Latency Target',
      detail: `Target latency is ${targetLatencyMs}ms at ${dau.toLocaleString()} DAU. Adding Redis absorbs 80%+ read traffic in < 2ms.`,
    });
  }

  // 5. Checkout enabled without async broker
  if (enabledFeatures.includes('feat-checkout') && !typesPresent.has('kafka-broker')) {
    issues.push({
      id: 'missing-kafka',
      severity: 'info',
      title: 'Consider Adding Kafka for Async Checkout Notifications',
      detail: 'Order & Checkout is enabled without a message broker—email/SMS webhooks will run synchronously inside checkout latency.',
    });
  }

  if (issues.length === 0) {
    issues.push({
      id: 'arch-clean',
      severity: 'info',
      title: 'Architecture Validation Passed (0 Critical Risks)',
      detail: 'Edge routing, compute isolation, caching, and data persistence satisfy your current DAU and latency targets.',
    });
  }

  return issues;
}

function sanitizeMermaidId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function generateTopologyMermaid(
  nodes: FlightNodeData[],
  edges: FlightEdgeData[]
): string {
  const lines: string[] = ['flowchart LR'];
  const edgeGroup = nodes.filter((n) => INFRA_NODE_CATALOG[n.type].category === 'edge');
  const computeGroup = nodes.filter((n) => INFRA_NODE_CATALOG[n.type].category === 'compute');
  const dataGroup = nodes.filter((n) => INFRA_NODE_CATALOG[n.type].category === 'data');

  const emitNode = (n: FlightNodeData) => {
    const mid = sanitizeMermaidId(n.id);
    const statusSuffix = n.killed ? ' [DOWN]' : ` x${n.replicas}`;
    const safeLabel = `${n.label} (${n.techStack}${statusSuffix})`.replace(/"/g, "'");
    if (INFRA_NODE_CATALOG[n.type].category === 'data') {
      return `    ${mid}[("${safeLabel}")]`;
    }
    return `    ${mid}["${safeLabel}"]`;
  };

  if (edgeGroup.length > 0) {
    lines.push('  subgraph Edge["Edge & Routing Layer"]');
    edgeGroup.forEach((n) => lines.push(emitNode(n)));
    lines.push('  end');
  }
  if (computeGroup.length > 0) {
    lines.push('  subgraph Compute["Compute & Microservices Layer"]');
    computeGroup.forEach((n) => lines.push(emitNode(n)));
    lines.push('  end');
  }
  if (dataGroup.length > 0) {
    lines.push('  subgraph Data["Data, Cache & Messaging Layer"]');
    dataGroup.forEach((n) => lines.push(emitNode(n)));
    lines.push('  end');
  }

  edges.forEach((e) => {
    const safeEdge = e.label.replace(/"/g, "'");
    lines.push(`  ${sanitizeMermaidId(e.source)} -->|"${safeEdge}"| ${sanitizeMermaidId(e.target)}`);
  });

  return lines.join('\n');
}

export function generateFeatureSequenceMermaid(
  domainName: string,
  paradigm: ArchitectureParadigm,
  rolloutStrategy: RolloutStrategyId,
  enabledFeatures: string[]
): string {
  const hasSearch = enabledFeatures.includes('feat-search');
  const hasCheckout = enabledFeatures.includes('feat-checkout');
  const computeParticipant = paradigm === 'monolith' ? 'MonolithAPI' : 'OrderSearchSvc';

  const lines: string[] = [
    'sequenceDiagram',
    `  autonumber`,
    `  actor User as ${domainName} User`,
    `  participant Edge as CDN / API Gateway (${rolloutStrategy})`,
    `  participant App as ${computeParticipant}`,
    `  participant Redis as Redis Cache`,
    `  participant DB as PostgreSQL / Search`,
    `  participant Kafka as Kafka Broker`,
    `  User->>Edge: HTTPS Request + JWT`,
    `  Edge->>App: Verified Route (Token Bucket OK)`,
    `  App->>Redis: GET hot key / session`,
    `  alt Cache Hit (82% of reads)`,
    `    Redis-->>App: Return JSON payload (1.2ms)`,
    `    App-->>User: 200 OK (Fast Path)`,
    `  else Cache Miss`,
    `    Redis-->>App: MISS`,
    `    App->>DB: ${hasSearch ? 'BM25 Inverted Index / B+Tree Query' : 'B+Tree Indexed Query'}`,
    `    DB-->>App: Result rows (16ms)`,
    `    App->>Redis: SETEX Hydrate Cache (TTL 300s)`,
    `    App-->>User: 200 OK`,
    `  end`,
  ];

  if (hasCheckout) {
    lines.push(`  User->>Edge: POST /api/v1/orders (Idempotency-Key)`);
    lines.push(`  Edge->>App: Route to Checkout Handler`);
    lines.push(`  App->>DB: BEGIN ACID Lock + Insert Outbox`);
    lines.push(`  DB-->>App: COMMIT OK`);
    lines.push(`  App--)Kafka: Async Emit orders.created (Email/SMS/Analytics)`);
    lines.push(`  App-->>User: 201 Created (Zero Downstream Blocking)`);
  }

  return lines.join('\n');
}
