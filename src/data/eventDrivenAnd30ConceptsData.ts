export interface EdaTopicNote {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  whatItIs: string;
  whyWeNeedIt: string;
  howItWorks: string[];
  indianExample: string;
  tradeoffs: string;
  keyTakeaways: string[];
  interviewQa: { q: string; a: string }[];
}

export interface SystemDesignConcept30 {
  num: number;
  id: string;
  name: string;
  group: 'Networking & APIs' | 'Data & Scaling' | 'Async & Resilience';
  plainDefinition: string;
  whyItMatters: string;
  indianExample: string;
  interviewTip: string;
}

/* ========================================================================== */
/* EVENT-DRIVEN ARCHITECTURE (EDA) COMPLETE HANDBOOK                          */
/* ========================================================================== */

export const EDA_HANDBOOK_CHAPTERS: EdaTopicNote[] = [
  {
    id: 'eda-vs-req-res',
    number: '01',
    title: 'EDA vs Request-Response & Core Building Blocks',
    subtitle: 'Producer · Consumer · Channel · Broker · Router · Schema',
    whatItIs:
      'In Request-Response (REST/gRPC), Service A calls Service B and waits for a reply. In Event-Driven Architecture (EDA), Service A publishes a fact ("OrderPlaced") to a broker and moves on—any interested service reacts independently.',
    whyWeNeedIt:
      'When 6 downstream services (Inventory, Billing, SMS, Email, Loyalty, Analytics) all need to react to one checkout, synchronous REST chains become slow and fragile—if the SMS service slows down, the entire order checkout fails!',
    howItWorks: [
      'Producer (Publisher): Emits an immutable fact describing what already happened (past tense: `PaymentSucceeded`, `OrderDispatched`).',
      'Event Broker / Channel: Durable middleman (Kafka, RabbitMQ, AWS SNS/SQS) that stores and routes events safely.',
      'Consumer (Subscriber): Reads events at its own pace and updates its own database or triggers side effects.',
      'Schema: Agreed JSON/Avro/Protobuf contract defining event fields (eventId, timestamp, payload, version).',
    ],
    indianExample:
      'When you place a ₹650 order on Zomato/Swiggy, the Order Service publishes `OrderPlaced` once. Restaurant App, Delivery Partner Matching, Invoice PDF, and Push Notification services all react asynchronously without blocking your "Order Confirmed" screen.',
    tradeoffs:
      'EDA gives loose coupling, shock absorption during traffic spikes, and high availability—at the cost of eventual consistency and harder end-to-end debugging (solved via Correlation IDs and distributed tracing).',
    keyTakeaways: [
      'Use Request-Response when the user needs an immediate answer (login, seat availability check); use EDA for side effects and cross-service workflows.',
      'Events are immutable facts from the past—never name an event like a command (`SendEmail`); name it `OrderConfirmed`.',
    ],
    interviewQa: [
      {
        q: 'When should you NOT use Event-Driven Architecture?',
        a: 'Do not force Event-Driven Architecture for simple CRUD requests where the caller immediately needs a strongly consistent reply, such as checking an OTP or verifying bank account balance before a debit.',
      },
      {
        q: 'How do you trace one customer order across 6 asynchronous microservices when an issue happens?',
        a: 'Generate a unique Correlation ID at the API Gateway, attach it to every Kafka message header, log it in every consumer, and stitch all spans together in OpenTelemetry or Jaeger.',
      },
    ],
  },
  {
    id: 'eda-4-patterns',
    number: '02',
    title: '4 EDA Patterns (Notification, ECST, Event Sourcing, CQRS) & Push vs Pull',
    subtitle: 'Choosing how much data travels inside an event and how reads/writes scale',
    whatItIs:
      'Four proven patterns decide whether events carry just an ID, full state, an append-only audit log, or separate read/write models.',
    whyWeNeedIt:
      'Sending too little data causes a "callback storm" back to the producer; sending too much couples schemas. Picking the right pattern keeps microservices fast and clean.',
    howItWorks: [
      '1. Event Notification: Tiny event with just ID (`{orderId: 901}`). Consumer calls back if it needs full details. Minimal payload, high independence.',
      '2. Event-Carried State Transfer (ECST): Event carries full snapshot (`orderId, items, address, amount`). Consumers store a local copy and never call Producer back—great resilience, eventual consistency.',
      '3. Event Sourcing: Instead of overwriting a row (`balance = 4500`), store every event (`+5000, -500`) in an append-only log. Current state is rebuilt by replaying events—perfect for banking ledgers & audit trails.',
      '4. CQRS (Command Query Responsibility Segregation): Separate the Write DB (normalized transactions) from the Read DB (denormalized Elasticsearch/Redis views) synced via events.',
      'Push vs Pull & Queue vs Topic: RabbitMQ pushes messages from a Queue (1 consumer gets each task). Kafka lets Consumer Groups pull from a Topic (many independent groups read the same stream + replay history).',
    ],
    indianExample:
      'Your HDFC/SBI bank statement is natural Event Sourcing—every UPI debit/credit is appended forever; your current balance is simply the running sum, and read-heavy mobile app dashboards use a CQRS read replica.',
    tradeoffs:
      'Event Sourcing + CQRS give unbeatable auditability and read scaling, but add schema versioning and replay complexity—use only where audit history or extreme read/write asymmetry justifies it.',
    keyTakeaways: [
      'Queue = work distribution (1 task → 1 worker). Topic / Pub-Sub = broadcast (1 event → N independent subscriber groups).',
      'Kafka Pull model lets slow consumers read at their own pace without crashing from backpressure.',
    ],
    interviewQa: [
      {
        q: 'What is the difference between Event Notification and ECST?',
        a: 'Event Notification only sends a lightweight signal such as orderId, so the consumer queries the source service for details. Event-Carried State Transfer includes the full data snapshot inside the event so consumers remain self-sufficient even if the source service is down.',
      },
      {
        q: 'Why is CQRS frequently paired with Event Sourcing in production?',
        a: 'Replaying thousands of events from an Event Store on every read query would be far too slow. CQRS projects those events asynchronously into a fast read-optimized store such as Elasticsearch or PostgreSQL materialized views.',
      },
    ],
  },
  {
    id: 'eda-kafka-internals',
    number: '03',
    title: 'Apache Kafka Internals (Partitions, Consumer Groups, Offsets & Replication)',
    subtitle: 'How Kafka achieves millions of events/sec with disk durability',
    whatItIs:
      'Kafka is a distributed, append-only commit log split into Topics and Partitions across broker machines, giving sequential disk speed, horizontal scaling, and full message replay.',
    whyWeNeedIt:
      'Traditional queues delete messages once read and choke on high fan-out. Kafka retains streams for days/weeks so Fraud, Billing, and Analytics can all read independently and rewind offsets after a bug fix.',
    howItWorks: [
      'Topic & Partitions: A Topic (`upi-transactions`) is divided into P ordered Partitions (P0, P1, P2). Ordering is strictly guaranteed INSIDE one partition, not globally across partitions.',
      'Partition Key: Hashing a stable key such as `userId` or `orderId` guarantees that all events for the same user or order land in the exact same partition in strict chronological order.',
      'Consumer Groups & Offsets: Within one Consumer Group, each partition is read by at most 1 consumer (so max useful parallelism = number of partitions). Each group tracks its own read bookmark (`offset`).',
      'Replication & Durability: Each partition has 1 Leader + followers (Replication Factor = 3). Setting `acks=all` + `min.insync.replicas=2` ensures zero data loss even if a broker machine dies.',
    ],
    indianExample:
      'During IPL live streaming on JioCinema/Hotstar, clickstream and ad-impression events flow into a 64-partition Kafka topic partitioned by `sessionId`, feeding real-time view counters and billing pipelines simultaneously.',
    tradeoffs:
      'Setting `acks=all` maximizes durability at slightly higher write latency; `acks=1` is faster but risks losing recent messages if the leader crashes before replication.',
    keyTakeaways: [
      'More consumers than partitions inside a single Consumer Group leaves extra consumers sitting idle!',
      'Kafka is fast because of sequential append-only disk I/O + OS Page Cache + Zero-Copy (`sendfile`).',
    ],
    interviewQa: [
      {
        q: 'If a Kafka topic has 4 partitions and you launch 6 consumers in the same Consumer Group, what happens?',
        a: '4 consumers receive 1 partition each, and the remaining 2 consumers stay idle as hot standbys until one of the active consumers crashes.',
      },
      {
        q: 'Why does changing the partition count of an existing keyed topic break ordering?',
        a: 'Kafka assigns keys using `hash(key) % partitionCount`. Increasing partitions changes the modulo result, so new events for the same `orderId` can land in a different partition before older events finish processing.',
      },
    ],
  },
  {
    id: 'eda-delivery-idempotency',
    number: '04',
    title: 'Delivery Guarantees, Idempotency, Backoff & Dead Letter Queues (DLQ)',
    subtitle: 'Preventing double-debits and poison pills in distributed messaging',
    whatItIs:
      'Networks drop packets and consumers crash mid-processing. Understanding At-Most-Once, At-Least-Once, and Exactly-Once—paired with Idempotency and DLQs—keeps money and inventory accurate.',
    whyWeNeedIt:
      'In real distributed systems, At-Least-Once delivery means duplicate events WILL happen during retries. Without idempotency, a retried `DebitWallet` event could charge a customer twice.',
    howItWorks: [
      'At-Most-Once: Commit offset before processing (fast, zero duplicates, may lose data on crash — fine for non-critical click logs).',
      'At-Least-Once: Process first, commit offset after (zero data loss, duplicates possible on crash — industry default!).',
      'Idempotency Key: Attach a unique `eventId` / `txnId` to every event. Consumer checks a `processed_events` table (or Redis key) in the same DB transaction; if already seen, safely skip!',
      'Exponential Backoff + Jitter: On transient failure (DB blip), retry after 1s → 2s → 4s → 8s (+ random jitter) so retries do not create a thundering herd.',
      'Dead Letter Queue (DLQ): If a malformed "poison pill" message still fails after 3–5 retries, move it to a DLQ topic and alert engineers so healthy messages behind it never get stuck.',
    ],
    indianExample:
      'UPI Payment Retry: Your phone loses 4G right after entering your UPI PIN. The app retries with the exact same `idempotencyKey (RRN)`. The bank checks that key and confirms the original ₹1,200 debit instead of deducting ₹2,400.',
    tradeoffs:
      'True end-to-end Exactly-Once across external APIs is rare; the universal production standard is At-Least-Once Delivery + Idempotent Consumer.',
    keyTakeaways: [
      'Follow the industry-standard delivery rule: combine At-Least-Once delivery with an Idempotent Consumer keyed by `eventId`.',
      'Always configure a Dead Letter Queue so one corrupted JSON payload never blocks an entire Kafka partition.',
    ],
    interviewQa: [
      {
        q: 'How do you handle a "poison pill" message that crashes your Kafka consumer every time?',
        a: 'Catch deserialization and processing errors, retry transient errors with bounded exponential backoff, and after N failed attempts route the bad message plus error metadata to a Dead Letter Queue and advance the offset.',
      },
      {
        q: 'Why must you add random Jitter to Exponential Backoff retries?',
        a: 'If 5,000 consumers fail at the exact same millisecond during a database blip, plain backoff wakes all 5,000 together at 2s, 4s, and 8s, hammering the recovering database repeatedly. Jitter spreads retries smoothly across time.',
      },
    ],
  },
  {
    id: 'eda-saga-reliability-schema',
    number: '05',
    title: 'Saga Pattern, Ordering, Circuit Breaker, Schema Registry & Kafka vs RabbitMQ',
    subtitle: 'Distributed transactions without 2PC locks + safe schema evolution',
    whatItIs:
      'Microservices own separate databases, so classic SQL ACID transactions cannot span them. Sagas coordinate multi-service steps using local transactions + compensating undo actions on failure.',
    whyWeNeedIt:
      'Two-Phase Commit (2PC) locks database rows across services over the network, killing throughput and availability. Sagas keep every service fast while still rolling back cleanly if payment or stock fails.',
    howItWorks: [
      'Choreography Saga: Services react to each other\'s events (`OrderCreated → ReserveStock → ChargePayment`). Great for 2–4 simple steps; gets messy with 10+ steps.',
      'Orchestration Saga: A central Order Orchestrator (built with Temporal or a durable state machine) commands each step and triggers compensating actions (`ReleaseStock`, `RefundPayment`) if any step fails.',
      'Event Ordering & Late Events: Partition by entity key (`orderId`), stamp Producer Event Time (not server arrival time), and use small buffering watermarks for slightly late mobile events.',
      'Resilience Patterns: Timeouts + Circuit Breaker (trip open when downstream fails >50% so threads do not hang) + Bulkhead (separate thread pools so Analytics failure never starves Checkout).',
      'Schema Registry & Compatibility: Enforce Avro/Protobuf contracts centrally — Backward (new consumer reads old events: add optional field with default), Forward (old consumer reads new events), Full (both!).',
      'Kafka vs RabbitMQ: Pick Kafka for high-throughput event streams, replay, analytics, and multi-group pub-sub. Pick RabbitMQ for complex routing rules, priority queues, per-message ACKs, and classic background job queues.',
    ],
    indianExample:
      'MakeMyTrip Holiday Package Booking (Flight + Hotel + Cab): An Orchestration Saga books flight, then hotel; if the hotel room sells out last second, the orchestrator automatically fires `CancelFlightBooking` and `RefundUPI` compensating events.',
    tradeoffs:
      'Choreography avoids a central coordinator but makes complex flows hard to trace; Orchestration gives a single clear state diagram at the cost of running an orchestrator service.',
    keyTakeaways: [
      'To keep Backward Compatibility in Schema Registry, NEVER rename or delete a required field—add new optional fields with defaults.',
      'Kafka = durable replayable event log; RabbitMQ = smart message router & task queue.',
    ],
    interviewQa: [
      {
        q: 'How do you safely add a new field to a live Kafka event without breaking existing consumers?',
        a: 'Add the new field as optional with a default value and validate it against the Schema Registry using Backward or Full compatibility before deploying producers.',
      },
      {
        q: 'When is a Choreography Saga better than an Orchestration Saga?',
        a: 'Use Choreography when a workflow has only 2 to 4 loosely coupled services and minimal branching. Switch to Orchestration once you have multi-step rollbacks, strict timeouts, or need one central dashboard to inspect stuck orders.',
      },
    ],
  },
];

/* ========================================================================== */
/* 30 MUST-KNOW SYSTEM DESIGN CONCEPTS (ALGOMASTER VISUAL CHECKLIST)          */
/* ========================================================================== */

export const SYSTEM_DESIGN_30_CONCEPTS: SystemDesignConcept30[] = [
  {
    num: 1,
    id: 'sd30-client-server',
    name: 'Client-Server Architecture',
    group: 'Networking & APIs',
    plainDefinition: 'Clients (mobile app/browser) send requests; Servers process business logic, talk to databases, and return responses.',
    whyItMatters: 'Separates user interface from heavy data storage and security rules.',
    indianExample: 'Your PhonePe Android app (client) sends a balance check request to PhonePe\'s backend servers.',
    interviewTip: 'Keep servers stateless so any server instance can handle any client request.',
  },
  {
    num: 2,
    id: 'sd30-ip-address',
    name: 'IP Address',
    group: 'Networking & APIs',
    plainDefinition: 'A unique numeric network address (IPv4 like 142.250.190.46 or IPv6) identifying every device or server on the internet.',
    whyItMatters: 'Routers use IP addresses like postal PIN codes to deliver packets to the exact machine.',
    indianExample: 'Every EC2 server in AWS Mumbai (`ap-south-1`) gets a private VPC IP for internal calls and a public IP/Elastic IP for internet traffic.',
    interviewTip: 'Never expose database private IPs directly to the public internet—keep DBs in private subnets.',
  },
  {
    num: 3,
    id: 'sd30-dns',
    name: 'DNS (Domain Name System)',
    group: 'Networking & APIs',
    plainDefinition: 'The internet\'s phonebook that translates human names (`irctc.co.in`) into machine IP addresses.',
    whyItMatters: 'Cached at browser, OS, ISP, and recursive resolvers so lookups stay fast, and supports GeoDNS routing.',
    indianExample: 'GeoDNS routes a user in Chennai to the nearest Chennai/Mumbai edge server instead of Frankfurt.',
    interviewTip: 'Mention DNS TTL trade-offs: long TTL = faster cached lookups, short TTL = quicker failover during outages.',
  },
  {
    num: 4,
    id: 'sd30-reverse-proxy',
    name: 'Reverse Proxy',
    group: 'Networking & APIs',
    plainDefinition: 'A server sitting in front of your backend servers (like Nginx or Envoy) that accepts client traffic and forwards it internally.',
    whyItMatters: 'Hides internal server IPs, terminates SSL/TLS, compresses responses (gzip/Brotli), and caches static files.',
    indianExample: 'Nginx sits in front of 12 Spring Boot / Node.js instances so clients only ever see one clean HTTPS endpoint.',
    interviewTip: 'Forward proxy hides the client (corporate VPN); Reverse proxy hides and protects the backend servers.',
  },
  {
    num: 5,
    id: 'sd30-latency',
    name: 'Latency vs Throughput',
    group: 'Networking & APIs',
    plainDefinition: 'Latency is how long 1 single request takes (ms). Throughput is how many requests the system handles per second (RPS/QPS).',
    whyItMatters: 'High throughput does not guarantee low latency—a highway can carry 10,000 cars/hour while each car still sits in a 40-minute jam.',
    indianExample: 'UPI payment APIs target p99 latency under 500ms even while handling 5,000+ transactions per second.',
    interviewTip: 'Always quote p95 and p99 tail latency in interviews, never just average latency.',
  },
  {
    num: 6,
    id: 'sd30-http-https',
    name: 'HTTP & HTTPS (TLS)',
    group: 'Networking & APIs',
    plainDefinition: 'HTTP is the web\'s request/response protocol; HTTPS wraps HTTP inside TLS encryption so nobody on public Wi-Fi can read or tamper with data.',
    whyItMatters: 'TLS handshake verifies server identity via certificates and encrypts passwords, tokens, and payment data.',
    indianExample: 'Railway station Wi-Fi cannot sniff your SBI NetBanking credentials because HTTPS encrypts the entire channel end-to-end.',
    interviewTip: 'HTTP/2 adds multiplexing over 1 TCP connection; HTTP/3 uses QUIC over UDP to cut mobile reconnect lag.',
  },
  {
    num: 7,
    id: 'sd30-apis',
    name: 'APIs (Application Programming Interfaces)',
    group: 'Networking & APIs',
    plainDefinition: 'A documented contract defining what inputs a service accepts, what outputs it returns, and what error codes it sends.',
    whyItMatters: 'Lets frontend, mobile, and partner teams build independently without knowing internal database tables.',
    indianExample: 'Razorpay exposes clean `/v1/orders` and `/v1/payments` APIs so thousands of Indian websites accept UPI/cards in minutes.',
    interviewTip: 'Always version public APIs with explicit prefixes such as `/v1/orders`, paginate list endpoints, and define clear 4xx client vs 5xx server status codes.',
  },
  {
    num: 8,
    id: 'sd30-rest',
    name: 'REST API',
    group: 'Networking & APIs',
    plainDefinition: 'Resource-oriented HTTP APIs using standard verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`), stateless requests, and JSON payloads.',
    whyItMatters: 'Universal, easy to cache via HTTP headers/CDNs, and understood by every browser and developer.',
    indianExample: '`GET /api/v1/trains/12952/availability` cleanly fetches Rajdhani Express seat availability.',
    interviewTip: 'Keep `GET`, `PUT`, and `DELETE` idempotent; use cursor pagination over `OFFSET` for deep lists.',
  },
  {
    num: 9,
    id: 'sd30-graphql',
    name: 'GraphQL',
    group: 'Networking & APIs',
    plainDefinition: 'A query language over a single endpoint where the client asks for the exact fields it needs—no more, no less.',
    whyItMatters: 'Eliminates REST over-fetching (huge JSON payloads on 4G mobile) and under-fetching (5 waterfall API calls to load 1 screen).',
    indianExample: 'A mobile home screen fetches user profile + active Swiggy order + top 5 offers in one compact GraphQL query.',
    interviewTip: 'Watch out for N+1 resolver queries (fix with DataLoader) and query-depth limits to stop abusive nested queries.',
  },
  {
    num: 10,
    id: 'sd30-databases',
    name: 'Databases & ACID',
    group: 'Data & Scaling',
    plainDefinition: 'Durable storage engines designed to write, index, and query data reliably even after power cuts or crashes.',
    whyItMatters: 'ACID (Atomicity, Consistency, Isolation, Durability) guarantees money never vanishes halfway through a transfer.',
    indianExample: 'PostgreSQL / MySQL stores IRCTC ticket bookings and bank account ledgers where partial writes are unacceptable.',
    interviewTip: 'Pick the database by access pattern (transactions, search, time-series, graph), not by hype.',
  },
  {
    num: 11,
    id: 'sd30-sql-nosql',
    name: 'SQL vs NoSQL',
    group: 'Data & Scaling',
    plainDefinition: 'SQL databases store structured rows in related tables with ACID joins; NoSQL (Document, Key-Value, Wide-Column, Graph) trades strict joins for flexible schemas and easy horizontal scale.',
    whyItMatters: 'Matching storage model to workload avoids painful rewrites later.',
    indianExample: 'Flipkart uses SQL for Orders/Payments (strict ACID), MongoDB/Document store for diverse Product Catalog specs, and Redis Key-Value for live cart/session speed.',
    interviewTip: 'Start with PostgreSQL unless you have clear scale/schema evidence needing DynamoDB, Cassandra, or MongoDB.',
  },
  {
    num: 12,
    id: 'sd30-vertical-scaling',
    name: 'Vertical Scaling (Scale Up)',
    group: 'Data & Scaling',
    plainDefinition: 'Upgrading a single server to bigger CPU, more RAM, and faster NVMe SSDs.',
    whyItMatters: 'Zero code changes needed—the fastest way to handle early growth up to a single machine\'s hardware limit.',
    indianExample: 'Upgrading a startup\'s Postgres RDS instance from 4 vCPU / 16GB RAM to 32 vCPU / 128GB RAM before a festival sale.',
    interviewTip: 'Has a hard hardware ceiling and still leaves a Single Point of Failure (SPOF).',
  },
  {
    num: 13,
    id: 'sd30-horizontal-scaling',
    name: 'Horizontal Scaling (Scale Out)',
    group: 'Data & Scaling',
    plainDefinition: 'Adding more commodity servers behind a Load Balancer so traffic splits across a fleet.',
    whyItMatters: 'Removes single-machine ceilings and gives high availability—if 1 server dies, the remaining 9 keep serving users.',
    indianExample: 'Auto-scaling from 8 to 80 stateless API pods on Flipkart Big Billion Days midnight launch.',
    interviewTip: 'Horizontal scaling requires stateless app servers (keep sessions in Redis, files in S3/Blob Storage).',
  },
  {
    num: 14,
    id: 'sd30-load-balancer',
    name: 'Load Balancer',
    group: 'Networking & APIs',
    plainDefinition: 'Distributes incoming user traffic evenly across healthy backend servers using Round Robin, Least Connections, or IP Hash.',
    whyItMatters: 'Prevents any single server from melting down and automatically stops routing to crashed instances via health checks.',
    indianExample: 'AWS ALB (L7 HTTP) routes `/payments` to Payment pods and `/search` to Search pods across 3 Availability Zones in Mumbai.',
    interviewTip: 'Know L4 (fast TCP/IP packet routing) vs L7 (smart HTTP URL/header/cookie routing).',
  },
  {
    num: 15,
    id: 'sd30-indexing',
    name: 'Database Indexing',
    group: 'Data & Scaling',
    plainDefinition: 'A sorted B-Tree (or Hash/Inverted) lookup structure built on table columns—like a book\'s back index—so queries jump straight to matching rows.',
    whyItMatters: 'Turns a 10-million-row Full Table Scan (seconds) into a 4-hop B-Tree lookup (<2 milliseconds).',
    indianExample: 'Adding a composite index on `(user_id, created_at DESC)` makes "My Last 20 Orders" load in 3ms instead of 4 seconds.',
    interviewTip: 'Every index speeds up Reads but slows down Writes (INSERT/UPDATE must update every index too).',
  },
  {
    num: 16,
    id: 'sd30-replication',
    name: 'Database Replication',
    group: 'Data & Scaling',
    plainDefinition: 'Copying database writes from a Primary (Leader) node to one or more Read Replicas (Followers).',
    whyItMatters: 'Scales read-heavy workloads (90% reads, 10% writes) and provides disaster failover if the Primary crashes.',
    indianExample: 'Myntra product pages serve 95% reads from 5 Read Replicas while checkout writes go strictly to the Primary.',
    interviewTip: 'Always discuss Replication Lag: a user updating their profile might briefly see stale data if immediately reading a lagging async replica.',
  },
  {
    num: 17,
    id: 'sd30-sharding',
    name: 'Database Sharding',
    group: 'Data & Scaling',
    plainDefinition: 'Splitting one massive database horizontally across multiple independent database servers (shards) using a deterministic Shard Key such as `user_id % N` or Consistent Hashing.',
    whyItMatters: 'When Write QPS or total disk size outgrows even the largest single Primary server, sharding scales writes horizontally.',
    indianExample: 'Splitting 50 Crore user profiles across 16 PostgreSQL shards keyed by `user_id`.',
    interviewTip: 'Sharding breaks cross-shard JOINs and transactions, and poor shard keys cause "hot shards" (celebrity problem). Use only after indexing, caching, and read replicas are maxed out.',
  },
  {
    num: 18,
    id: 'sd30-partitioning',
    name: 'Table Partitioning',
    group: 'Data & Scaling',
    plainDefinition: 'Dividing one huge table into smaller logical chunks inside the same database—horizontally (by date/range/hash) or vertically (splitting heavy columns into a separate table).',
    whyItMatters: 'Queries scanning "this month\'s transactions" skip old partitions (Partition Pruning) and archiving old years is an instant `DROP PARTITION`.',
    indianExample: 'Partitioning a 2-billion-row UPI ledger table by `month` so monthly statement queries only touch 1 small partition.',
    interviewTip: 'Partitioning stays inside 1 DB instance; Sharding distributes partitions across separate machines.',
  },
  {
    num: 19,
    id: 'sd30-caching',
    name: 'Caching (Redis / Memcached)',
    group: 'Data & Scaling',
    plainDefinition: 'Storing frequently read data in ultra-fast RAM (<1ms) so repeated requests never hit the slower disk database.',
    whyItMatters: 'A single Redis node handles 100k+ reads/sec, shielding your SQL database from melting during viral spikes.',
    indianExample: 'Caching IPL live scorecards and train schedules in Redis with a 5-second TTL so 2 Crore viewers do not hammer Postgres.',
    interviewTip: 'Always cover Cache-Aside pattern, TTL expiration, Eviction (LRU/LFU), and Cache Stampede protection (mutex/lock).',
  },
  {
    num: 20,
    id: 'sd30-denormalization',
    name: 'Denormalization',
    group: 'Data & Scaling',
    plainDefinition: 'Intentionally duplicating select columns (like `seller_name` inside the `orders` table) to avoid expensive multi-table JOINs on hot read paths.',
    whyItMatters: 'Eliminating expensive multi-table JOINs on hot read paths drastically cuts database CPU load and keeps p99 page response times low under heavy traffic.',
    indianExample: 'Storing `restaurant_name` and `item_price` directly on each order row so Order History loads in 1 fast query—and preserves the historical price even if menu prices rise later.',
    interviewTip: 'Trade-off: Faster reads and simpler queries, at the expense of extra storage and keeping duplicated values synced on updates.',
  },
  {
    num: 21,
    id: 'sd30-cap',
    name: 'CAP Theorem',
    group: 'Data & Scaling',
    plainDefinition: 'During a network Partition (P) between distributed nodes, a system must choose between Consistency (C — latest data or error) and Availability (A — always respond, even if slightly stale).',
    whyItMatters: 'Network splits happen in real data centers, so you must consciously choose CP vs AP per feature.',
    indianExample: 'IRCTC seat booking & UPI debit choose CP (refuse booking rather than double-sell a berth); Instagram likes & product view counts choose AP (stay up, sync counts in seconds).',
    interviewTip: 'Also mention PACELC: even when there is no partition (E), you still trade off Latency (L) vs Consistency (C).',
  },
  {
    num: 22,
    id: 'sd30-blob-storage',
    name: 'Blob / Object Storage (S3 / GCS)',
    group: 'Data & Scaling',
    plainDefinition: 'Scalable storage for unstructured binary files—images, videos, PDFs, invoices, and backups—accessed via HTTP URLs.',
    whyItMatters: 'Never store 5MB PDFs or images as BLOBs inside SQL tables; store the file in S3 and save only its tiny URL string in Postgres.',
    indianExample: 'DigiLocker and Zepto store KYC PDFs and product photos in S3 Object Storage with 99.999999999% (11 nines) durability.',
    interviewTip: 'Use Pre-Signed URLs so mobile clients upload large files directly to S3 without choking your backend servers.',
  },
  {
    num: 23,
    id: 'sd30-cdn',
    name: 'CDN (Content Delivery Network)',
    group: 'Networking & APIs',
    plainDefinition: 'A global network of edge cache servers placed inside cities close to users to serve static assets (images, JS/CSS, video chunks) at local speed.',
    whyItMatters: 'Cuts round-trip distance from 150ms down to 10–20ms and offloads 80%+ bandwidth from your origin servers.',
    indianExample: 'Cloudflare/CloudFront edge PoPs in Mumbai, Delhi, Bengaluru, Chennai, and Kolkata stream Hotstar video chunks locally.',
    interviewTip: 'Use cache-busting hashed filenames (`app.8a2f.js`) with long CDN TTLs so updates go live immediately.',
  },
  {
    num: 24,
    id: 'sd30-websockets',
    name: 'WebSockets',
    group: 'Async & Resilience',
    plainDefinition: 'A persistent, full-duplex (two-way) TCP connection between client and server enabling instant real-time pushes without repeated HTTP polling.',
    whyItMatters: 'Eliminates wasted polling requests when data updates every second.',
    indianExample: 'Zerodha Kite live NSE/BSE stock ticks, WhatsApp chat messages, and Swiggy rider GPS map markers all stream over WebSockets.',
    interviewTip: 'Because WebSockets are stateful, scale them across servers using a Redis Pub/Sub or Kafka backplane.',
  },
  {
    num: 25,
    id: 'sd30-webhooks',
    name: 'Webhooks',
    group: 'Async & Resilience',
    plainDefinition: 'Server-to-server "reverse API calls" where Provider A sends an HTTP POST to your callback URL the moment an async event finishes.',
    whyItMatters: 'Eliminates wasteful polling loops that keep asking a payment gateway every 2 seconds whether the user finished paying.',
    indianExample: 'Razorpay/Cashfree calls your `/webhooks/payment-captured` endpoint the instant UPI confirms payment.',
    interviewTip: 'Always verify the HMAC webhook signature header, respond 200 OK quickly, and process idempotently via a queue.',
  },
  {
    num: 26,
    id: 'sd30-microservices',
    name: 'Microservices',
    group: 'Async & Resilience',
    plainDefinition: 'Splitting a large system into small, independently deployable services, each owning a clear business domain and its own database.',
    whyItMatters: 'Allows large teams to ship, scale, and isolate failures independently (Search crashing will not crash Checkout).',
    indianExample: 'Amazon/Flipkart separate Catalog, Cart, Checkout, Payments, and Delivery Tracking into independent services.',
    interviewTip: 'Start with a clean Modular Monolith for small teams—microservices add network latency, distributed tracing, and DevOps overhead.',
  },
  {
    num: 27,
    id: 'sd30-message-queue',
    name: 'Message Queue (SQS / RabbitMQ / Kafka)',
    group: 'Async & Resilience',
    plainDefinition: 'A durable buffer sitting between Producers and Consumers so heavy background jobs run asynchronously and traffic bursts get smoothed out.',
    whyItMatters: 'Decouples services and prevents sudden flash-sale spikes from overwhelming downstream databases.',
    indianExample: 'During NEET/JEE result day or flash sales, order confirmation emails and GST invoice PDF generation run asynchronously off SQS/Kafka workers.',
    interviewTip: 'Always pair queues with Retry Backoff, Dead Letter Queues (DLQ), and Idempotent Consumers.',
  },
  {
    num: 28,
    id: 'sd30-rate-limiting',
    name: 'Rate Limiting',
    group: 'Async & Resilience',
    plainDefinition: 'Capping how many requests a user, API key, or IP can send in a time window (returning HTTP 429 Too Many Requests when exceeded).',
    whyItMatters: 'Protects APIs from DDoS attacks, scraper bots, OTP SMS bombing, and noisy tenants.',
    indianExample: 'Limiting `/api/send-otp` to 3 requests per mobile number per 10 minutes using a Redis Sliding Window / Token Bucket counter.',
    interviewTip: 'Know Token Bucket (allows short bursts) vs Leaky Bucket (smooth fixed rate) vs Sliding Window Log/Counter.',
  },
  {
    num: 29,
    id: 'sd30-api-gateway',
    name: 'API Gateway',
    group: 'Networking & APIs',
    plainDefinition: 'The single smart front door in front of all microservices handling Authentication (JWT), Rate Limiting, Routing, Logging, and Request Aggregation.',
    whyItMatters: 'Avoids copy-pasting JWT verification, CORS, and throttling code across 25 separate microservices.',
    indianExample: 'Kong / AWS API Gateway verifies a user\'s JWT once at the edge and routes `/orders/*` to Order Service and `/wallet/*` to Wallet Service.',
    interviewTip: 'Run API Gateway in active-active HA mode so your single front door never becomes a Single Point of Failure.',
  },
  {
    num: 30,
    id: 'sd30-idempotency',
    name: 'Idempotency',
    group: 'Async & Resilience',
    plainDefinition: 'A property where executing the exact same request 1 time or 5 times produces the exact same final state—no duplicate orders or double charges.',
    whyItMatters: 'Mobile networks drop responses all the time; clients MUST retry safely without breaking user money.',
    indianExample: 'Client generates `Idempotency-Key: uuid-4821` on the "Pay ₹999" button click. Server stores the key + response in DB/Redis so retries return the original receipt instead of charging again.',
    interviewTip: 'Mention storing the idempotency key with a UNIQUE constraint inside the same database transaction as the payment write.',
  },
];
