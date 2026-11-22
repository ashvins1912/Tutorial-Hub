export type MockSignalLevel = 'Strong Hire' | 'Hire' | 'Lean / Partial' | 'Red Flag';

export interface MockInterviewOption {
  id: string;
  label: string;
  points: number;
  signal: MockSignalLevel;
  interviewerFeedback: string;
}

export interface MockInterviewPhase {
  phaseNumber: number;
  phaseName: string;
  timeBudget: string;
  interviewerQuestion: string;
  contextClue: string;
  options: MockInterviewOption[];
}

export interface MockInterviewQuestion {
  id: string;
  title: string;
  shortTitle: string;
  companyStyle: string;
  difficulty: 'Senior (L5)' | 'Staff / Principal (L6+)';
  durationMinutes: number;
  relatedBlueprintId: string;
  openingPrompt: string;
  whiteboardHints: string[];
  phases: MockInterviewPhase[];
  modelStaffChecklist: string[];
}

export const SYSTEM_DESIGN_MOCK_INTERVIEWS: MockInterviewQuestion[] = [
  {
    id: 'mock-zepto-blinkit-instamart',
    title: 'Design Zepto / Blinkit / Instamart 10-Minute Quick-Commerce Delivery',
    shortTitle: 'Zepto / Blinkit / Instamart',
    companyStyle: 'Hyper-Local Quick Commerce · 10-Minute SLA Systems',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'zepto-blinkit-instamart',
    openingPrompt:
      'Design a 10-minute quick-commerce platform like Zepto, Blinkit, or Swiggy Instamart operating 1,000+ hyper-local Dark Stores across major cities, each stocking ~10,000 SKUs. We need live store-specific inventory with zero overselling, <90-second warehouse pick-and-pack, Just-In-Time rider dispatch, and graceful resilience during sudden monsoon rainstorms and IPL match spikes.',
    whiteboardHints: [
      'Discovery: H3 Hex Polygon -> Primary Dark Store + Load-Aware Fallback + Dynamic ETA (Pick + Road + Supply).',
      'Inventory: Sharded strictly by `dark_store_id` (10K SKUs/store) with sorted atomic multi-SKU locks (`available_qty >= req_qty`).',
      'Fulfillment: Transactional Outbox -> WMS 90s bin-sorted picking -> Just-In-Time rider arrival sync + order clubbing.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Hyper-Local Dark-Store Discovery & Honest ETA',
        timeBudget: '0–7 min',
        interviewerQuestion:
          'When a user opens the app, how do you instantly determine which Dark Store serves them, show accurate in-stock items, and promise an honest "9 mins" ETA instead of lying?',
        contextClue: 'Think H3 spatial lookup + live operational signals (picker backlog, rider supply, rain), NOT just straight-line distance!',
        options: [
          {
            id: 'opt-a',
            label: 'Map GPS `(lat, lng)` via an in-memory H3 Hex / Geo-Polygon Serviceability Cache to the primary Dark Store + nearby backup store, then compute Dynamic ETA = `predicted_pick_time(active_picker_queue) + handover + OSRM_road_eta + rain_factor`—auto-failing over to the backup store if the primary is overloaded!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Quick-commerce serviceability is NEVER static distance alone—factoring real-time picker backlog, rider availability, and rain into dynamic store routing & ETA prevents broken 10-minute promises.',
          },
          {
            id: 'opt-b',
            label: 'Show one single global catalog across the entire city and figure out which warehouse has the items after the user pays.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Catastrophic in 10-minute delivery! If Store A has milk and Store B 6km away has bread, you cannot deliver in 10 minutes—inventory MUST be scoped to the serving dark store BEFORE browsing!',
          },
          {
            id: 'opt-c',
            label: 'Run a PostGIS polygon scan against the primary PostgreSQL database on every home-screen scroll.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'H3 Resolution-9 hex -> dark_store_id fits in a few MB of RAM (<1ms lookup)! Never burn primary DB CPU on static polygon checks.',
          },
          {
            id: 'opt-d',
            label: 'Hardcode a static "10 mins" banner on every user’s app regardless of store load or traffic.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Promising 10 mins during a 35-minute monsoon backlog causes massive cancellations and support tickets. Always compute dynamic honest ETAs.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Last-Unit Inventory Race & Zero Overselling',
        timeBudget: '7–16 min',
        interviewerQuestion:
          'At 8:00 PM, Store #14 has ONLY 1 carton of milk left. Two neighbors click "Pay" at the exact same millisecond—and a third person added it to their cart 15 minutes ago and walked away. How do you reserve stock cleanly?',
        contextClue: 'Compare Add-to-Cart lock vs Checkout atomic reservation + sorted multi-SKU locking + TTL release.',
        options: [
          {
            id: 'opt-a',
            label: 'Do NOT lock stock on Add-to-Cart (abandoned carts would freeze the store!). Serve fast availability from Redis Hash `store:{id}:qty`, and at Checkout run an atomic All-or-Nothing reservation inside Store #14’s DB shard (`UPDATE dark_store_inventory SET available_qty = available_qty - req WHERE available_qty >= req` sorted by `sku_id`) with a 5-min payment TTL + fencing token!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook quick-commerce concurrency! Skipping Add-to-Cart locks stops cart-hoarding, sorted multi-SKU atomic updates eliminate deadlocks & partial reservations, and a 5-min payment TTL releases abandoned checkouts cleanly.',
          },
          {
            id: 'opt-b',
            label: 'Lock every item for 60 minutes the second any user taps "Add to Cart".',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Window shoppers and bots will lock out 100% of your milk, eggs, and iPhones without buying anything!',
          },
          {
            id: 'opt-c',
            label: 'Let both neighbors pay against the stale Redis cache and just cancel one order 4 minutes later.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Late stock-out cancellations destroy customer trust in quick commerce. Authoritative atomic check at checkout prevents double-selling.',
          },
          {
            id: 'opt-d',
            label: 'Lock the entire `dark_store_inventory` table across all 1,000 stores during every checkout.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Serializing all 1,000 cities/stores behind one global lock collapses throughput instantly! Shard by `dark_store_id` and lock only the specific `(dark_store_id, sku_id)` rows.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: '90-Second Picker WMS & Just-In-Time (JIT) Rider Dispatch',
        timeBudget: '16–26 min',
        interviewerQuestion:
          'You only have 10 minutes total: ~90 seconds to pick & pack 7 items inside the dark store and ~7 minutes to ride 1.8 km. How do you coordinate Warehouse Picking with Rider Dispatch so neither the rider sits idle nor the ice cream melts?',
        contextClue: 'Think Transactional Outbox -> Bin-Sorted Batch Picking -> Just-In-Time Dispatch + Multi-Order Clubbing.',
        options: [
          {
            id: 'opt-a',
            label: 'Commit payment + enqueue `wms.pick_task.created` via Transactional Outbox -> Picker handheld routes items in S-shape rack/zone order (`Ambient -> Chilled -> Frozen`, barcode-scanned in <90s). Simultaneously, JIT Dispatcher predicts `pack_ready_ts` and assigns a rider whose arrival ETA aligns with handover—clubbing 2 nearby orders along the same road vector to cut delivery cost 35%!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Principal-level operational architecture! Picking Frozen items last prevents melting, barcode scanning keeps physical-vs-digital inventory accurate, and JIT Rider Dispatch + directional clubbing makes 10-minute unit economics profitable!',
          },
          {
            id: 'opt-b',
            label: 'Wait until the bag is completely packed, sealed, and sitting on the counter for 3 minutes before searching for a rider.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Sequential wait wastes 3–4 precious minutes out of a 10-minute SLA! Overlapping rider approach with the 90-second pick phase (Just-In-Time dispatch) is how Zepto/Blinkit hit 8–9 min deliveries.',
          },
          {
            id: 'opt-c',
            label: 'Have each delivery rider walk inside the warehouse aisles themselves to hunt for groceries.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Specialized store pickers know exact rack/bin coordinates and pick in 60–90 seconds; letting riders roam aisles creates chaos and triples fulfillment time.',
          },
          {
            id: 'opt-d',
            label: 'Batch 15 orders onto a single bike so the last customer receives melted ice cream 45 minutes later.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Violates the core 10-minute SLA and cold-chain quality! Clubbing must strictly cap at 2–3 orders with tight detour/ETA constraints.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'Database Sharding & High-Churn Store Inventory Sync',
        timeBudget: '26–35 min',
        interviewerQuestion:
          'With 1,000 dark stores x 10,000 SKUs = 10M inventory rows plus millions of daily orders, picker scans, and inward vendor restocks, how do you shard the database and keep the user-facing search/catalog cache fresh?',
        contextClue: 'Think co-locating `dark_store_inventory`, `qcom_orders`, and `wms_pick_tasks` on `dark_store_id` + CDC -> Redis/Search.',
        options: [
          {
            id: 'opt-a',
            label: 'Shard `dark_store_inventory`, `qcom_orders`, and `wms_pick_tasks` together by `dark_store_id` so every cart checkout + pick-task enqueue stays single-shard ACID! Stream committed inventory deltas via Debezium CDC / Outbox into Redis Hashes (`store:{id}:inv`) and OpenSearch/Typesense for <20ms store-scoped catalog browsing, while rider GPS streams to an in-memory H3 Geo store.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Superb DB design! Co-locating store inventory, orders, and WMS tasks on `dark_store_id` eliminates distributed 2PC completely, and CDC-driven cache updates keep store search accurate within <500ms.',
          },
          {
            id: 'opt-b',
            label: 'Shard inventory by `sku_id` so Milk is on Shard 1, Bread is on Shard 2, and Eggs are on Shard 3.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Every 5-item grocery basket turns into a slow 5-shard distributed 2-Phase Commit transaction! Always co-locate all SKUs of a single dark store on the same `dark_store_id` shard.',
          },
          {
            id: 'opt-c',
            label: 'Run full-table SQL `LIKE` searches across PostgreSQL whenever users type "milk" in the search bar.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Burns OLTP primary CPU; serve fuzzy autocomplete & store-filtered catalog search from Elasticsearch/Typesense + Redis.',
          },
          {
            id: 'opt-d',
            label: 'Update catalog stock availability only once per night via a 2:00 AM batch cron job.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Fast-moving items sell out within 20 minutes! Real-time event-driven stock sync is mandatory.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Monsoon Surge + Physical Shelf Mismatch Mid-Pick',
        timeBudget: '35–45 min',
        interviewerQuestion:
          'Curveball: A sudden monsoon hits during an IPL final! 1) Store #14’s picker queue spikes to 180 pending orders and riders go offline. 2) Worse: our DB said `available_qty = 1` for Avocado, a user paid, and the picker walks to Bin B4 and finds the last avocado is bruised/missing! Handle BOTH gracefully.',
        contextClue: 'Think Dynamic Load-Shedding / Store Failover + Physical-Digital Inventory Drift Reconciliation & Instant Substitute/Partial Refund.',
        options: [
          {
            id: 'opt-a',
            label: '1) Surge Defense: Auto-trigger Dynamic ETA Padding, temporarily shrink delivery radius / shed heavy bulk SKUs, or route new orders to adjacent Dark Store #15 via H3 failover. 2) Physical Shelf Drift: Picker taps "Damaged/Missing" on handheld -> immediately sets DB `available_qty = 0` + triggers cycle-count audit, offers instant 1-tap Substitute or automatic idempotent Partial Refund for Avocado while STILL delivering the rest of the bag on time!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Battle-tested quick-commerce Staff mastery! Closing the physical-to-digital inventory loop the instant a picker flags a missing bin stops the next 5 customers from ordering a ghost item, and partial-refund/substitute saves the order without cancelling the whole basket.',
          },
          {
            id: 'opt-b',
            label: 'Cancel the entire 10-item grocery order automatically just because 1 avocado was bruised.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Cancelling the whole dinner basket ruins UX and wastes picker work! Partial refund or 1-tap substitution delivers 90% of the basket cleanly.',
          },
          {
            id: 'opt-c',
            label: 'Have the picker ship the bruised avocado anyway and ignore the inventory discrepancy.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Destroys brand trust and leaves ghost inventory in the DB causing repeated failures.',
          },
          {
            id: 'opt-d',
            label: 'Keep accepting unlimited 10-minute promises at Store #14 even though the picker queue is 45 minutes deep.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Unbounded queue admission turns a manageable surge into a 90-minute collapse with mass refunds. Dynamic ETA padding + store throttling/failover protects SLA.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'H3 Hex Polygon -> Primary/Fallback Dark-Store routing driven by live picker backlog, rider supply & rain-adjusted Dynamic ETA.',
      'Co-locate `dark_store_inventory`, `qcom_orders`, and `wms_pick_tasks` on `dark_store_id` for single-shard ACID multi-SKU locks (sorted by `sku_id`).',
      'Skip Add-to-Cart locks; reserve stock atomically at Checkout with short 5-min TTL + fencing token + signed payment webhook.',
      'Transactional Outbox -> <90s S-shape bin-sorted WMS picking (Frozen last) synchronized with Just-In-Time Rider Dispatch & directional order clubbing.',
      'Graceful surge shedding (radius shrink/store failover) + real-time physical-digital inventory reconciliation with instant partial refund/substitution.',
    ],
  },
  {
    id: 'mock-irctc-tatkal',
    title: 'Design IRCTC Tatkal & High-Contention Train Booking',
    shortTitle: 'IRCTC Tatkal Booking',
    companyStyle: 'High-Contention Distributed Systems · India/Global Scale',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'irctc-tatkal',
    openingPrompt:
      'Welcome! Today we are designing a national railway reservation system like IRCTC. At 10:00 AM sharp, 10 million users rush to book 100,000 Tatkal seats across trains, and a single physical berth can be reused across non-overlapping station legs (e.g., Delhi->Kanpur and Kanpur->Kolkata). Take a breath and walk me through how you would start.',
    whiteboardHints: [
      'Clarify: Zero overselling (CP) vs high availability for PNR/schedule reads (AP).',
      'Math: 500K RPS burst at 10:00 AM -> must protect DB with waiting queue + per-(train,date) partitioning.',
      'DB: Station-segment bitmask (`BIGINT`) + `lock_token` fencing verified on payment webhook.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Requirements & Scope Clarification',
        timeBudget: '0–5 min',
        interviewerQuestion:
          'Before drawing any boxes, what functional and non-functional constraints do you want to pin down first?',
        contextClue: 'Think about CAP trade-offs between browsing train schedules vs actually committing a seat berth.',
        options: [
          {
            id: 'opt-a',
            label: 'Split consistency models: Strong ACID consistency (zero double-booking) for seat holds/commits, Eventual Consistency (cached) for train search & PNR status; clarify multi-leg seat reuse & waitlist.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Immediately separating the read-heavy AP path (train availability search) from the strictly serialized CP path (seat allocation) plus spotting multi-leg reuse sets a Staff-level framing.',
          },
          {
            id: 'opt-b',
            label: 'Enforce strict linearizable consistency across every endpoint—including schedule search, fare inquiry, and seat booking—using global 2-Phase Commit.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Careful: putting global 2PC on search/availability reads will melt the database at 10:00 AM. Only seat allocation needs strict serialization; search can be slightly stale.',
          },
          {
            id: 'opt-c',
            label: 'Start by choosing Kubernetes, Kafka, and Microservices names for Auth, Payment, and Notification services.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Premature implementation! Always clarify functional scope, consistency SLAs, and contention hotspots before naming infrastructure.',
          },
          {
            id: 'opt-d',
            label: 'Prioritize eventual consistency everywhere so booking never fails, and reconcile duplicate seat assignments with manual customer support refunds later.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'In rail/ticketing, overselling the same physical berth causes severe real-world passenger conflict. Unlike an e-commerce SKU with warehouse buffer, you must prevent double allocation upfront.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Capacity & Scale Math',
        timeBudget: '5–12 min',
        interviewerQuestion:
          'At 10:00 AM, 500,000 requests/sec hit a popular Rajdhani Express train with only 1,000 Tatkal berths. Why does a standard PostgreSQL table with `SELECT ... FOR UPDATE` collapse here, and what is your throughput plan?',
        contextClue: 'Calculate lock contention on hot rows vs partitioned single-writer throughput.',
        options: [
          {
            id: 'opt-a',
            label: '500K RPS fighting over 1,000 rows creates massive row-lock queues and exhausts DB connection pools in <1 second. Place an Edge Virtual Waiting Queue + partition booking requests by `(train_id, journey_date)` so a single-writer actor/partition processes ~5K–10K atomic claims/sec cleanly.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Excellent systems intuition! Recognizing hot-key contention (100K users -> 1 train) and solving it with admission control (waiting room) + single-writer partitioning per `(train_id, journey_date)` is textbook production engineering.',
          },
          {
            id: 'opt-b',
            label: 'Add 50 PostgreSQL Read Replicas and load-balance booking writes across all 50 replicas.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Read replicas cannot accept independent ACID writes without multi-master conflict/overselling! Adding read replicas helps train search, not Tatkal write contention.',
          },
          {
            id: 'opt-c',
            label: 'Increase PostgreSQL `max_connections` to 100,000 and add more CPU cores to the primary DB.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'PostgreSQL spawns a process per connection; 100K active connections causes severe OS context-switching thrash and lock-manager spinlock collapse. Vertical scaling alone cannot absorb a 500K RPS spike.',
          },
          {
            id: 'opt-d',
            label: 'Cache the seat count in Redis and use `DECRBY` atomically, then flush bookings asynchronously to PostgreSQL via Kafka.',
            points: 14,
            signal: 'Hire',
            interviewerFeedback:
              'Good direction for shedding DB load! One catch to address: simple `DECRBY` works for unreserved count, but does not handle multi-leg station overlap or Redis failover persistence unless backed by a durable partition log.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'API, Protocol & Async Design',
        timeBudget: '12–20 min',
        interviewerQuestion:
          'How do you coordinate the 5-minute seat hold, third-party UPI/Card Payment Gateway redirect, and ticket issuance without blocking HTTP threads or losing paid tickets?',
        contextClue: 'Consider Idempotency Keys, Webhooks vs Polling, and Transactional Outbox / Enqueue.',
        options: [
          {
            id: 'opt-a',
            label: 'Two-phase booking: `POST /holds` (with client `Idempotency-Key`) creates a 5-min TTL lease + `lock_token` and returns payment intent. Payment Gateway calls our signed HMAC Webhook; receiver verifies signature, dedupes `event_id`, enqueues confirmation, and returns 200 OK in <50ms.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Production-grade! You nailed client idempotency, short-lived TTL leases, HMAC-verified async webhooks with fast 200 ACK, and decoupled worker confirmation.',
          },
          {
            id: 'opt-b',
            label: 'Keep the HTTP booking request open while waiting 3 minutes for the user to finish UPI/OTP on their bank page, holding the DB transaction open the entire time.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Never hold a DB transaction or HTTP thread open across external user/bank I/O! Connection pools will instantly exhaust and locks will deadlock the train.',
          },
          {
            id: 'opt-c',
            label: 'Trust the user browser redirect (`GET /payment-success?pnr=123`) as proof of payment and immediately confirm the ticket.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Critical security flaw + reliability bug: attackers can spoof the redirect URL for free tickets, and users whose mobile network drops before redirect lose paid tickets! Always use server-to-server signed Webhooks + reconciliation polling.',
          },
          {
            id: 'opt-d',
            label: 'Release the hold into Kafka and let a background cron job poll the bank every 2 minutes to check payment status.',
            points: 12,
            signal: 'Hire',
            interviewerFeedback:
              'Polling works as a fallback reconciliation safety net, but using signed Webhooks as the primary push channel gives instant confirmation while polling catches dropped webhooks.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB Schema, Indexing & Sharding',
        timeBudget: '20–32 min',
        interviewerQuestion:
          'A train stops at 32 stations (indexes 0..31). How do you model seat availability in the database so checking and locking a berth from Station 4 to Station 19 is blazing fast and prevents overlapping legs?',
        contextClue: 'Think about bitmask representation vs 32 rows per seat per train.',
        options: [
          {
            id: 'opt-a',
            label: 'Shard by `(train_id, journey_date)`. Store one row per physical berth with a 64-bit `occupied_mask BIGINT` (1 bit per station leg). Check availability via `(occupied_mask & $req_mask) = 0` and claim atomically via `occupied_mask | $req_mask` in O(1) CPU bitwise ops.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Brilliant! A 64-bit segment bitmask reduces 32 segment rows per seat down to 1 compact row, makes multi-leg overlap detection a single CPU instruction, and shard-co-locating by `(train_id, journey_date)` keeps every transaction single-shard ACID.',
          },
          {
            id: 'opt-b',
            label: 'Create a single `bookings` table sharded by `user_id` and run `SELECT COUNT(*)` across all shards for overlapping start/end stations on every booking.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Sharding inventory by `user_id` forces expensive scatter-gather queries across every shard for every seat check and breaks single-shard atomic locking!',
          },
          {
            id: 'opt-c',
            label: 'Insert one row per `(train_id, date, seat_id, station_leg_idx)` and lock all 15 rows with `SELECT ... FOR UPDATE` in ascending leg order.',
            points: 14,
            signal: 'Hire',
            interviewerFeedback:
              'Correct and deadlock-free (ascending lock order!), especially if trains exceed 64 stops (or use PostgreSQL `BIT VARYING`). Bitmasking is 10-30x tighter in memory and index footprint, so noting both is strong.',
          },
          {
            id: 'opt-d',
            label: 'Store the entire train manifest as one JSON array document in MongoDB and overwrite it on each booking.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Replacing one giant document per train serializes all 1,000 berths onto a single document write lock and triggers heavy write amplification.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Failure & Scale Curveball',
        timeBudget: '32–45 min',
        interviewerQuestion:
          'Curveball: User A locks Berth 14 at 10:00:00 (5-minute TTL expires at 10:05:00). Bank UPI is slow. At 10:05:02, the expiry worker releases Berth 14 and User B locks & buys it. At 10:05:04, User A’s bank sends a valid `payment.captured` Webhook! What happens?',
        contextClue: 'How do you prevent User A from overwriting User B while keeping User A’s money safe?',
        options: [
          {
            id: 'opt-a',
            label: 'Use a unique `lock_token` (fencing token) on the seat hold. On User A’s late webhook, the ACID UPDATE checks `WHERE lock_token = $token_A AND state = \'HELD\'`. It matches 0 rows -> do NOT steal User B’s berth; automatically transition User A’s booking to `EXPIRED_PAID` and enqueue an idempotent instant Refund + Waitlist offer.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook Staff-level answer! Fencing tokens (`lock_token`) make late-arriving webhooks mathematically incapable of corrupting newer owners, and automating the compensating refund via an idempotent outbox event closes the financial loop.',
          },
          {
            id: 'opt-b',
            label: 'Trust the webhook because money was collected—force-update Berth 14 to User A and email User B later.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'You just silently broke User B’s confirmed ticket! Never blindly overwrite state without verifying the hold version/fencing token.',
          },
          {
            id: 'opt-c',
            label: 'Extend the seat lock TTL from 5 minutes to 45 minutes so slow banks never time out.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'A 45-minute lock lets bots or abandoned checkouts freeze the entire Tatkal inventory and STILL does not eliminate the race condition at minute 45:01.',
          },
          {
            id: 'opt-d',
            label: 'Return HTTP 500 to the payment gateway webhook so it retries until an engineer manually resolves it.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Retrying forever will never make User A’s expired lock valid again—it just clogs the webhook queue. Acknowledge 200 OK after recording the compensating refund event.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Split AP read path (cached schedules/availability) from CP write path (serialized per `(train_id, journey_date)`).',
      'Protect Tatkal 10:00 AM burst with Edge Virtual Waiting Room + Token Bucket admission control.',
      'Model multi-leg berth reuse via 64-bit station-segment bitmasks (`occupied_mask & req_mask == 0`).',
      'Enforce `lock_token` fencing inside ACID confirmation + idempotent HMAC webhook receiver + automatic late-payment refund.',
      'Use Transactional Outbox to reliably enqueue PNR SMS/Email, Waitlist auto-promotion, and analytics.',
    ],
  },

  {
    id: 'mock-nasdaq-zerodha',
    title: 'Design a Stock Exchange Matching Engine (NASDAQ / NSE) & Broker (Zerodha)',
    shortTitle: 'Stock Exchange & Zerodha',
    companyStyle: 'Ultra-Low-Latency FinTech · Sub-Millisecond Systems',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'stock-exchange-matching',
    openingPrompt:
      'Let’s design an electronic stock exchange matching engine like NASDAQ/NSE paired with a retail broker layer like Zerodha Kite. We need 1M+ orders/sec at p99 < 1ms matching latency, strict Price-Time Priority (FIFO), and real-time market ticks streamed to 5 million connected traders.',
    whiteboardHints: [
      'Matching core: Single-threaded in-memory LMAX Disruptor per symbol group (NO locks, NO DB on hot path!).',
      'Order Book DS: Price levels (TreeMap / flat tick array) -> Doubly-Linked FIFO List + HashMap<orderId, Node> for O(1) cancel.',
      'Broker side: Pre-trade RMS margin check -> FIX/Binary to Exchange -> WebSocket binary tick fan-out.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Requirements & Latency Budget',
        timeBudget: '0–5 min',
        interviewerQuestion:
          'What makes a stock exchange matching engine fundamentally different from a normal CRUD web backend?',
        contextClue: 'Think determinism, ordering fairness, zero data loss, and microseconds vs milliseconds.',
        options: [
          {
            id: 'opt-a',
            label: 'Strict Price-Time Priority determinism (sequence numbers assigned at ingress), sub-100us in-memory execution with zero DB calls on the hot path, and guaranteed replayable state from an append-only event log.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Nailed the essence of exchange engineering: deterministic state-machine replication + lock-free memory execution + strict ingress sequencing.',
          },
          {
            id: 'opt-b',
            label: 'Using GraphQL APIs and microservices communicating over JSON/REST with PostgreSQL transactions per matched trade.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'JSON serialization + HTTP + disk-synced SQL commits take 5–30ms and cap out at a few thousand TPS per symbol—orders of magnitude too slow for NASDAQ/NSE.',
          },
          {
            id: 'opt-c',
            label: 'Eventual consistency across matching nodes so buy/sell orders match roughly within 5 seconds.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Regulators (SEC/SEBI) strictly mandate deterministic Price-Time Priority. Out-of-order fills cause unfair executions and massive financial liability.',
          },
          {
            id: 'opt-d',
            label: 'Using multi-threaded lock-based Java/C++ workers sharing one concurrent order book protected by mutexes.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Mutex contention and CPU cache-line bouncing across threads actually make a shared order book SLOWER than a pinned single-threaded event loop per symbol shard!',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Order Book Data Structures & Complexity',
        timeBudget: '5–12 min',
        interviewerQuestion:
          'Over 90% of exchange traffic is `CANCEL` or `MODIFY` order messages from market makers. What exact in-memory data structures power the Order Book so match, insert, and cancel are all blazing fast?',
        contextClue: 'How do you achieve O(1) cancellation inside a FIFO price level?',
        options: [
          {
            id: 'opt-a',
            label: 'Two sides (Bids descending, Asks ascending) indexed by price level (Red-Black Tree / flat tick array) where each price level owns an intrusive Doubly-Linked List (FIFO), plus a global `HashMap<order_id, OrderNode*>` giving O(1) cancel and O(1) best-bid/ask peek!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Flawless! Combining Price-Level Index + FIFO Doubly-Linked List + `HashMap<order_id, Node*>` is the exact textbook data structure powering real exchanges (plus pre-allocated object pools to avoid GC pauses).',
          },
          {
            id: 'opt-b',
            label: 'Two Binary Heaps (Max-Heap for Bids, Min-Heap for Asks) scanning linearly to remove cancelled orders.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Heaps give O(1) peek, but removing an arbitrary cancelled order in the middle is O(N) unless you add lazy deletion or index maps—and heaps break strict FIFO time-priority ties without extra keys.',
          },
          {
            id: 'opt-c',
            label: 'A PostgreSQL B-Tree index on `(symbol, side, price DESC, created_at ASC)` queried per order.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Database B-Trees involve MVCC snapshots, buffer pool latches, and WAL locks—far too slow for 1M+ ops/sec matching.',
          },
          {
            id: 'opt-d',
            label: 'A single sorted array of all open orders using binary search and shifting elements on insert/cancel.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Array shifts are O(N) on every insert and cancel—completely unusable under heavy HFT cancel bursts.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Broker Market Data Fan-Out (Zerodha Kite)',
        timeBudget: '12–20 min',
        interviewerQuestion:
          'NSE broadcasts 200,000 market ticks/sec. Zerodha Kite has 5 million retail users watching NIFTY & RELIANCE live on mobile/web. How do you fan out live prices without blowing up bandwidth or server RAM?',
        contextClue: 'Think WebSocket binary framing, pub/sub sharding, and tick coalescing/conflation.',
        options: [
          {
            id: 'opt-a',
            label: 'Ingest exchange UDP Multicast feed -> normalize into compact binary packets (44 bytes/tick instead of 400B JSON) -> fan out to regional WebSocket Gateway fleets subscribed per instrument token, applying 100ms-250ms tick conflation (latest-value wins) for retail clients.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Outstanding! Compact binary WebSocket frames cut egress ~8–10x, instrument-sharded fan-out scales horizontally to millions of connections, and tick conflation prevents slow mobile 4G clients from backing up server send buffers.',
          },
          {
            id: 'opt-b',
            label: 'Have all 5 million Zerodha browsers HTTP-poll `GET /api/quote?symbol=RELIANCE` every 500ms.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '10 million HTTP requests/sec with full TLS/header overhead just to send tiny price updates! WebSockets with binary framing are mandatory here.',
          },
          {
            id: 'opt-c',
            label: 'Send every single microsecond exchange tick as uncompressed JSON to all 5 million users without subscription filtering.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Broadcast storm! Users only watch 20–50 watchlist symbols, and humans cannot read 1,000 UI updates/sec. Subscription filtering + conflation are essential.',
          },
          {
            id: 'opt-d',
            label: 'Use Webhooks from Zerodha backend to push every stock tick to every user’s phone.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Mobile/browser clients behind NAT cannot receive webhooks, and webhooks are meant for discrete server-to-server events, not continuous market tick streams.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB-Level Persistence, Recovery & Broker RMS',
        timeBudget: '20–32 min',
        interviewerQuestion:
          'Since the Matching Engine runs in RAM with no SQL DB on the hot path, how do you guarantee ZERO lost orders on a power outage, AND how does Zerodha prevent a trader with Rs 10,000 from placing two simultaneous Rs 10,000 orders?',
        contextClue: 'Separate Exchange Sequenced Event Journal (Aeron/Raft) from Broker Pre-Trade RMS Ledger.',
        options: [
          {
            id: 'opt-a',
            label: 'Exchange: Sequence every incoming order in an append-only journal replicated via Raft/Aeron to hot-standby memory replicas before ACK; async workers persist filled executions to PostgreSQL/TimescaleDB. Broker: Atomic Redis Lua / sharded DB pre-trade margin reservation (`available_margin >= order_val`) keyed by `user_id` before sending FIX order to Exchange.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Complete Staff-level mastery! You cleanly handled both durable zero-loss exchange recovery (sequenced log + hot standby) and atomic broker pre-trade margin locking (preventing double-spend across parallel tabs).',
          },
          {
            id: 'opt-b',
            label: 'Snapshot the matching engine RAM to S3 every 5 minutes; if it crashes, ask traders to re-submit their last 5 minutes of orders.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Losing 5 minutes of live trades in a financial exchange is catastrophic and illegal. Every acknowledged order must be durably journaled before ACK.',
          },
          {
            id: 'opt-c',
            label: 'Check the trader’s margin balance using a stale read replica cache in Zerodha and settle negative balances next week.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'A malicious or buggy algo could fire 100 parallel orders against a stale cache and blow up broker capital in 50ms! Pre-trade RMS check must be atomic per user account.',
          },
          {
            id: 'opt-d',
            label: 'Write every order synchronously to a single PostgreSQL primary before passing it to the matching engine.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Durable, yes—but synchronous SQL disk fsync per order destroys the <1ms exchange latency target. Use an append-only sequential journal replicated to standby RAM instead.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Failure Curveball: Hot-Standby Split Brain',
        timeBudget: '32–45 min',
        interviewerQuestion:
          'Curveball: A network partition isolates the Primary Matching Engine for symbol `AAPL` for 800ms. Your Backup Engine thinks Primary is dead and tries to promote itself. How do you guarantee TWO engines never match conflicting trades for `AAPL`?',
        contextClue: 'Think Raft consensus quorum + monotonic epoch/term fencing at the Ingress Sequencer.',
        options: [
          {
            id: 'opt-a',
            label: 'All orders flow through a Raft-backed Ingress Sequencer with strict leader leases & epoch terms. Even if a partitioned old primary stays alive, downstream Order Gateways & Journal reject any execution report carrying a stale `epoch_term < current_epoch` (fencing!).',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact production pattern! Quorum-based Raft leadership prevents two leaders from committing to the journal simultaneously, and epoch fencing drops any zombie primary output.',
          },
          {
            id: 'opt-b',
            label: 'Run Active-Active matching in two data centers simultaneously and merge the conflicting trades afterward using last-write-wins.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Active-Active matching on the same stock creates two different market prices for the same share and double-fills the same limit order! One symbol MUST have one authoritative primary engine at a time.',
          },
          {
            id: 'opt-c',
            label: 'Use a simple 500ms ping heartbeat between Primary and Backup with no quorum witness.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Without a 3-node (odd) quorum witness, a network cut between Primary and Backup causes classic split-brain where BOTH nodes think the other died!',
          },
          {
            id: 'opt-d',
            label: 'Halt trading for the entire stock market for 30 minutes until a human operator manually restarts the server.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Safe against split-brain, yes, but automated Raft failover with hot-standby replay achieves sub-second seamless recovery with zero split-brain.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Deterministic single-threaded in-memory matching per symbol shard (LMAX Disruptor ring buffer, zero locks, zero GC).',
      'Order Book = Price-level index + FIFO Doubly-Linked List + `HashMap<orderId, Node*>` for O(1) cancel.',
      'Durability via Raft-replicated append-only Sequencer Log + hot standby + async TimescaleDB/Postgres trade ledger.',
      'Zerodha Broker layer: Atomic per-user RMS margin reservation + binary WebSocket tick fan-out with conflation.',
      'Prevent split-brain via odd-node Raft quorum + monotonic `epoch_term` fencing.',
    ],
  },

  {
    id: 'mock-chatgpt-gemini',
    title: 'Design ChatGPT / Google Gemini LLM Inference & Streaming Platform',
    shortTitle: 'ChatGPT / Google Gemini',
    companyStyle: 'AI Infrastructure · Frontier LLM Serving',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'chatgpt-google-gemini',
    openingPrompt:
      'Design a global conversational AI platform like ChatGPT or Google Gemini serving 100M+ daily active users with real-time token streaming, multi-turn conversation history, RAG/tool calling, and GPU cluster efficiency.',
    whiteboardHints: [
      'Two distinct GPU phases: Prefill (compute-bound, TTFT) vs Decode (memory-bandwidth bound, TPOT).',
      'Core infra algos: Continuous Batching + PagedAttention (vLLM) + Prefix KV-Cache Reuse.',
      'Protocol: SSE (`text/event-stream`) for token streaming; Postgres/Cassandra + pgvector/ScaNN for history & RAG.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Requirements & Latency SLAs',
        timeBudget: '0–5 min',
        interviewerQuestion:
          'Unlike a normal API with a single p99 latency metric, what are the TWO critical user-perceived latency metrics in an LLM chat system, and why do they map to completely different hardware bottlenecks?',
        contextClue: 'Think Time-to-First-Token vs Inter-Token Latency.',
        options: [
          {
            id: 'opt-a',
            label: 'TTFT (Time-To-First-Token, <500ms, driven by compute-bound Prefill over the prompt) and TPOT / ITL (Time-Per-Output-Token, ~20–40ms/tok, driven by HBM memory-bandwidth-bound autoregressive Decode).',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Staff-level AI infra clarity! Distinguishing compute-bound Prefill from memory-bandwidth-bound Decode explains almost every architectural decision that follows.',
          },
          {
            id: 'opt-b',
            label: 'Wait until the full 1,000-token response finishes generating (25 seconds), then return one big JSON response with a 30-second SLA.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Users perceive a 25-second blank spinner as broken! Streaming tokens as they are decoded cuts perceived latency from 25s down to ~300ms.',
          },
          {
            id: 'opt-c',
            label: 'Measure only CPU utilization and PostgreSQL query latency.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'In LLM serving, GPU HBM bandwidth, KV-cache memory capacity, TTFT, and TPOT dominate both cost and user experience.',
          },
          {
            id: 'opt-d',
            label: 'Optimize solely for maximum total tokens/sec throughput even if individual users wait 12 seconds for the first token.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Good for offline batch evals, bad for interactive chat! Interactive serving must balance throughput with strict TTFT and TPOT SLOs.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'GPU Serving & KV-Cache Scaling',
        timeBudget: '5–12 min',
        interviewerQuestion:
          'A single H100/TPU worker serves 64 concurrent users. Naive static batching wastes 60% of GPU memory on KV-cache fragmentation and stalls short answers behind long ones. How do you maximize GPU utilization?',
        contextClue: 'Think OS virtual memory paging applied to GPU KV-Cache + iteration-level scheduling.',
        options: [
          {
            id: 'opt-a',
            label: 'Use Continuous (Iteration-Level) Batching so finished sequences exit and new prompts enter at every token step, paired with PagedAttention (non-contiguous fixed-size KV blocks via a Block Table) + Prefix Caching for shared system prompts, and Disaggregated Prefill/Decode pools at massive scale.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Continuous Batching + PagedAttention + Prefix KV Caching + Prefill/Decode Disaggregation is the exact blueprint of modern vLLM/SGLang/Gemini serving stacks.',
          },
          {
            id: 'opt-b',
            label: 'Pre-allocate contiguous VRAM for the maximum 128K context window for every active request.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Pre-allocating 128K context per user wastes >90% of HBM VRAM and collapses batch size to 1–2 users per GPU!',
          },
          {
            id: 'opt-c',
            label: 'Recompute attention over the entire prompt from scratch on every single generated token instead of storing a KV-Cache.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Skipping KV-Cache turns O(N) token generation into O(N^2) redundant matrix multiplications—killing both latency and GPU cost.',
          },
          {
            id: 'opt-d',
            label: 'Run each user request sequentially (batch size = 1) on its own dedicated GPU.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Batch size 1 leaves GPU Tensor Cores ~95% idle during decode and is 20–50x too expensive at 100M DAU.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Streaming Protocol & Gateway Design',
        timeBudget: '12–20 min',
        interviewerQuestion:
          'Which network protocol do you choose between the user’s browser and your API Gateway to stream generated tokens—SSE, WebSockets, or Long Polling—and how do you handle token quota enforcement?',
        contextClue: 'Consider directionality, HTTP/2 multiplexing, proxies/CDNs, and prepaid token buckets.',
        options: [
          {
            id: 'opt-a',
            label: 'Use Server-Sent Events (SSE over HTTP/2) for text chat (simple unidirectional server->client stream, proxy/CDN friendly, built-in `Last-Event-ID` resume; upgrade to WebSockets/WebRTC only for bi-directional live voice). Enforce Token-Aware Rate Limiting (reserve estimated input+max_output tokens in Redis before GPU dispatch, refund unused tokens on finish).',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Crisp engineering judgment! Picking SSE for text streaming while explicitly calling out WebSocket/WebRTC for full-duplex live voice, plus token-aware rate limiting (not just RPM!), hits every Staff bar.',
          },
          {
            id: 'opt-b',
            label: 'Have the browser poll `GET /chat/latest-token` every 50ms until generation finishes.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              '20 HTTP requests/sec per active user burns massive load balancer CPU and creates choppy token delivery.',
          },
          {
            id: 'opt-c',
            label: 'Rate-limit solely by 60 requests/minute regardless of prompt length (10 tokens vs 100,000 tokens).',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'A single 100K-token prompt costs 1,000x more GPU compute than a 100-token prompt! You must enforce TPM (Tokens-Per-Minute) alongside RPM.',
          },
          {
            id: 'opt-d',
            label: 'Use server-to-server Webhooks pushed from the GPU directly to the user’s laptop browser.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Browsers behind residential NAT cannot accept incoming webhooks.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB Schema: Chat History, Branching & RAG Vector Store',
        timeBudget: '20–32 min',
        interviewerQuestion:
          'Users can edit an earlier prompt to create a branched conversation tree, attach PDFs for RAG search, and resume old threads instantly. How do you design the database layer?',
        contextClue: 'Think parent_message_id tree structure, sharding key, and hybrid BM25 + Vector index.',
        options: [
          {
            id: 'opt-a',
            label: 'Shard `conversations` and `messages` by `user_id` (or `conversation_id` with user index). Model branching via `(message_id, parent_message_id)` adjacency pointers so edits create sibling branches without copying history. Store uploaded doc chunks in a Hybrid Search store (HNSW/ScaNN Vector DB + BM25 lexical index) filtered by `user_id` tenant ACL.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Clean, pragmatic schema! Adjacency `parent_message_id` supports ChatGPT-style edit/regenerate branches effortlessly, and enforcing `user_id` metadata pre-filtering in the Vector DB avoids cross-tenant data leaks.',
          },
          {
            id: 'opt-b',
            label: 'Store every conversation’s entire history and uploaded PDF text inside a single unindexed text column in one unsharded MySQL instance.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Massive write amplification on every turn, zero semantic retrieval capability, and hits single-node storage limits rapidly at 100M DAU.',
          },
          {
            id: 'opt-c',
            label: 'Store all chat messages only in the GPU VRAM KV-Cache and delete them once the user closes the tab.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'GPU VRAM is volatile and costs ~$30,000+ per 80GB node—never use VRAM as durable user chat storage.',
          },
          {
            id: 'opt-d',
            label: 'Put all messages in a Vector Database only and run nearest-neighbor search to load the last 10 turns of a chat.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Vector DBs are great for semantic RAG retrieval, NOT for exact chronological turn history! Keep ordered turns in Postgres/Cassandra and semantic memories/docs in the Vector store.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Long-Context Prefill Starvation & KV Cache Routing',
        timeBudget: '32–45 min',
        interviewerQuestion:
          'Curveball: Whenever a user pastes a 100K-token codebase into a shared GPU replica, every other user streaming on that same GPU freezes for 3 seconds (huge TPOT jitter!). Also, multi-turn chats keep hitting random GPUs and recomputing the same 30K-token KV prefix. Fix both!',
        contextClue: 'Think Chunked Prefill / Prefill-Decode Disaggregation + KV-Cache-Aware Consistent Routing.',
        options: [
          {
            id: 'opt-a',
            label: '1) Enable Chunked Prefill or Disaggregated Prefill-vs-Decode GPU pools (prefill nodes compute prompt KV-cache and RDMA/NVLink-transfer KV blocks to decode nodes so decode TPOT never stalls). 2) Use KV-Cache-Aware Prefix Routing at the LLM Router (consistent-hash the conversation/prefix hash to the replica holding warm KV blocks, with load-aware fallback).',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Principal-level AI systems engineering! Chunked Prefill / P-D Disaggregation solves decode jitter completely, and KV-aware prefix routing slashes redundant TTFT compute by 60–80% on multi-turn chats.',
          },
          {
            id: 'opt-b',
            label: 'Use strict Round-Robin load balancing across all GPUs so every turn goes to a fresh GPU.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Round-Robin destroys KV-Cache locality! Every single turn forces full prompt recomputation, spiking TTFT and GPU cost.',
          },
          {
            id: 'opt-c',
            label: 'Hard-cap all users to 512 tokens max so nobody can ever send a long prompt.',
            points: 4,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Cutting product capability instead of fixing the scheduling architecture will not pass a Staff design bar.',
          },
          {
            id: 'opt-d',
            label: 'Add a CDN cache in front of the LLM to cache every generated answer by prompt hash.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Exact prompt caching only hits on identical static prompts—personalized multi-turn chats rarely match byte-for-byte. Prefix KV-Cache reuse on the GPU router is what actually helps multi-turn latency.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Separate TTFT (Prefill, compute-bound) vs TPOT (Decode, HBM memory-bandwidth-bound).',
      'GPU Runtime: Continuous Batching + PagedAttention + Prefix Caching + Chunked Prefill / P-D Disaggregation.',
      'KV-Cache-Aware Router using consistent hashing on conversation/system-prompt prefix + load-shedding fallback.',
      'SSE over HTTP/2 for text streaming (WebRTC/WS for live audio) + TPM/RPM token-bucket quota enforcement.',
      'Tree-structured `messages(parent_message_id)` in sharded SQL/NoSQL + tenant-isolated Hybrid Vector + BM25 RAG store.',
    ],
  },

  {
    id: 'mock-flight-gds',
    title: 'Design a Global Flight Booking, Ticket Exchange & GDS Platform',
    shortTitle: 'Flight Booking & GDS',
    companyStyle: 'Travel Tech · Amadeus / Sabre / Expedia / Skyscanner',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'flight-booking-gds',
    openingPrompt:
      'Design a global flight booking & ticket exchange platform (like Expedia / MakeMyTrip) integrated with a Global Distribution System (GDS like Amadeus/Sabre) and airline NDC APIs across 400+ airlines. Include live multi-hop search, fare pricing, zero-double-book PNR ticketing, and ticket re-issue/exchange.',
    whiteboardHints: [
      'Split Search (cached fare matrix + 1000:1 look-to-book ratio) from Live Re-Price & GDS Commit.',
      'Saga Orchestrator: Hold GDS PNR -> Authorize Card -> Issue E-Ticket -> Capture Card (compensate on failure!).',
      'DB: Relational PNR/Ticket/Coupon ledger + immutable `fare_rules` + ticket exchange delta-fare calculation.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Look-to-Book Ratio & Search Architecture',
        timeBudget: '0–5 min',
        interviewerQuestion:
          'Airlines charge heavy fees if your Look-to-Book ratio exceeds 200:1, and calling 50 airline APIs live takes 4–8 seconds per search. How do you serve <300ms multi-hop flight search?',
        contextClue: 'Think precomputed flight schedule graph + cached fare buckets + live verification only at checkout.',
        options: [
          {
            id: 'opt-a',
            label: 'Decouple Search from Live Booking: ingest airline ATPCO/OAG schedules + GDS availability cache pushes (AVS) into an in-memory Flight Graph + Redis fare cache for <200ms search, and only invoke live GDS/NDC `Re-Price & Availability` when a user clicks a specific itinerary.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Real OTAs (Expedia, Skyscanner, Kayak) rely on cached fare/availability feeds (AVS/ATPCO) to protect look-to-book ratios and hit <250ms search, then live-verify at checkout.',
          },
          {
            id: 'opt-b',
            label: 'Fan out synchronous live SOAP/XML calls to all 400 airlines on every search keystroke.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'You will blow through airline look-to-book penalties in minutes and suffer 8–15 second tail latencies!',
          },
          {
            id: 'opt-c',
            label: 'Run a single SQL `JOIN` across a 500M-row flights table for 3-hop layover combinations on every request.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Multi-hop pathfinding with minimum connection times (MCT) and fare class rules is a constrained graph search problem—SQL multi-self-joins will time out.',
          },
          {
            id: 'opt-d',
            label: 'Cache search results for 24 hours and guarantee the cached price even if the airline sold out.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Flight fare buckets (Y/B/M/Q) change minute-by-minute! Guaranteeing a 24h stale price causes massive financial loss when you have to buy a pricier seat from the airline.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Booking & Payment Orchestration (Distributed Saga)',
        timeBudget: '5–14 min',
        interviewerQuestion:
          'When a user clicks "Pay & Book", you must coordinate two external systems that do NOT support 2-Phase Commit: the Payment Gateway (Stripe/Adyen) and the Airline GDS (Amadeus/Sabre). What exact sequence avoids charging a user with no ticket—or issuing a free ticket?',
        contextClue: 'Think Authorize-Hold vs Capture, and Saga state machine.',
        options: [
          {
            id: 'opt-a',
            label: 'Use a persisted Saga State Machine: 1) Live Re-Price & Hold GDS PNR (un-ticketed hold), 2) Payment `AUTHORIZE` (place hold on card, do NOT capture yet!), 3) Call GDS `Issue E-Ticket` (13-digit ticket #) with idempotency key, 4) `CAPTURE` card payment. If step 3 fails, `VOID` card auth automatically!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Gold-standard travel-tech pattern! Authorizing first, issuing the airline E-Ticket second, and capturing last eliminates painful 7-day refund loops when the last seat sells out mid-checkout.',
          },
          {
            id: 'opt-b',
            label: 'Issue the non-refundable airline E-Ticket first, then ask the user to enter their credit card.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'If the card declines or user abandons, the OTA is on the hook to pay the airline for an issued ticket!',
          },
          {
            id: 'opt-c',
            label: 'Wrap the Stripe API HTTP call and Amadeus SOAP API call inside a PostgreSQL `BEGIN ... COMMIT` XA transaction.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Third-party external APIs (Stripe, Amadeus) do not participate in your PostgreSQL 2PC/XA transaction!',
          },
          {
            id: 'opt-d',
            label: 'Capture the user’s credit card immediately, then enqueue GDS ticketing for a nightly batch job.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'By tonight, the fare class will have expired or sold out, forcing mass cancellations and angry customers.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Ticket Exchange & Re-Issue Architecture',
        timeBudget: '14–22 min',
        interviewerQuestion:
          'A passenger already holds Ticket #176-2198440123 (NYC -> LON, Economy Q-class) and wants to exchange it for tomorrow’s flight. How do you model and execute a Ticket Exchange safely?',
        contextClue: 'Think immutable financial tickets, coupon status (`OPEN` -> `EXCHANGED`), fare difference + change penalty.',
        options: [
          {
            id: 'opt-a',
            label: 'Never overwrite the original E-Ticket row! Query GDS Automated Ticket Changer (ATC) to compute `new_fare - unused_coupon_value + change_penalty`, authorize the delta payment, mark old coupon status `OPEN -> EXCHANGED`, and issue a brand-new 13-digit E-Ticket linked via `parent_ticket_number` for full IATA BSP accounting audit.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Deep domain & DB mastery! Airlines/IATA strictly treat tickets and flight coupons as immutable financial instruments—linking `parent_ticket_number` with `EXCHANGED` coupon transitions preserves complete auditability.',
          },
          {
            id: 'opt-b',
            label: 'Run `UPDATE tickets SET departure_date = $new_date WHERE ticket_id = $1` directly in the database.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Mutating the ticket row destroys IATA financial audit trails, bypasses airline coupon re-issuance, and causes the passenger to be denied boarding at the airport gate!',
          },
          {
            id: 'opt-c',
            label: 'Always force the user to cancel for 0% refund and buy a completely separate ticket from scratch.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'This violates airline fare-rule exchange credits and provides terrible UX compared to proper coupon exchange.',
          },
          {
            id: 'opt-d',
            label: 'Calculate the fare difference locally using a flat $50 constant without checking airline fare rules.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Airline fare rules vary dynamically by route, cabin class, and advance-purchase window; you must evaluate ATPCO Category 31/33 rules via GDS/NDC.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB Schema & GDS State Synchronization',
        timeBudget: '22–32 min',
        interviewerQuestion:
          'An airline reschedules a flight by 2 hours directly inside the GDS three weeks after booking. How does your DB model PNRs, Segments, Passengers, and E-Tickets, and how do you stay synced with airline schedule changes?',
        contextClue: 'Think normalized PNR hierarchy + GDS Queue / Webhook ingestion.',
        options: [
          {
            id: 'opt-a',
            label: 'Relational PostgreSQL schema: `pnrs` (1:N) -> `itinerary_segments` & `passengers` & `e_tickets` -> `flight_coupons`, plus `booking_saga_log`. Subscribe to GDS Schedule-Change Queues / NDC Webhooks -> enqueue async worker -> diff segment times, update `itinerary_segments`, and trigger passenger re-accommodation notifications.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact production architecture! Separating PNR, Segments, Passengers, and Coupons cleanly handles multi-passenger/multi-leg trips, and async GDS queue/webhook workers keep schedules synced reliably.',
          },
          {
            id: 'opt-b',
            label: 'Store PNR, passenger names, flights, and payment details as one flat CSV string per booking.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Impossible to partially exchange 1 passenger out of 4 or update 1 cancelled leg out of a 3-hop itinerary.',
          },
          {
            id: 'opt-c',
            label: 'Poll the GDS API every 10 seconds for all 20 million active future bookings.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              '2M polls/sec will get your GDS credentials revoked immediately! Consume event-driven GDS schedule-change queues/webhooks instead.',
          },
          {
            id: 'opt-d',
            label: 'Never store PNR details locally; fetch everything from the airline live every time the user opens "My Trips".',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Makes your app completely dependent on slow legacy GDS uptime and breaks offline/invoice/support workflows.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Ambiguous GDS Network Timeout During Ticketing',
        timeBudget: '32–45 min',
        interviewerQuestion:
          'Curveball: Your Saga calls `GDS.IssueTicket(pnr=AB12CD)` and the TCP connection times out after 30 seconds! You have NO idea if the airline issued the ticket or dropped the request. What do you do right now?',
        contextClue: 'NEVER blindly retry or blindly void without reading authoritative GDS state first!',
        options: [
          {
            id: 'opt-a',
            label: 'Transition Saga to `TICKETING_UNKNOWN` (do NOT void card auth or blindly re-issue!). Enqueue a Reconciliation Worker that calls `GDS.RetrievePNR(AB12CD)` with exponential backoff: if E-Ticket # exists -> Capture card & confirm; if PNR is un-ticketed -> safely retry or void card auth and notify user.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Masterclass in distributed fault tolerance! Ambiguous timeouts are the #1 cause of duplicate airline tickets and uncaptured revenue in travel tech—reconciling authoritative GDS PNR state before acting is mandatory.',
          },
          {
            id: 'opt-b',
            label: 'Immediately void the user’s credit card and tell them the booking failed.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'If the airline DID issue the ticket before the response dropped, you just gave away a $1,200 flight for free!',
          },
          {
            id: 'opt-c',
            label: 'Immediately create a brand-new PNR and call `IssueTicket` again on a different GDS.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'You risk issuing TWO non-refundable tickets for the same passenger on the same flight!',
          },
          {
            id: 'opt-d',
            label: 'Return HTTP 500 to the browser and leave the card authorization hanging indefinitely.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Abandoning an in-flight financial Saga without automated reconciliation leaks money and creates angry support escalations.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Separate <250ms cached search (ATPCO/AVS flight graph + Redis) from live GDS/NDC re-price to protect look-to-book ratios.',
      'Persisted Saga Orchestrator: Hold PNR -> Authorize Card -> Issue E-Ticket -> Capture Card (Void auth on failure).',
      'Immutable E-Ticket & Flight Coupon model (`OPEN -> EXCHANGED` + `parent_ticket_number`) for IATA-compliant Ticket Exchange.',
      'Async GDS Queue / NDC Webhook ingestion for airline schedule changes and involuntary re-routing.',
      'Explicit `TICKETING_UNKNOWN` reconciliation state machine on GDS network timeouts.',
    ],
  },

  {
    id: 'mock-uber-dispatch',
    title: 'Design Uber Real-Time Geospatial Matching & Live Trip Tracking',
    shortTitle: 'Uber Geospatial Dispatch',
    companyStyle: 'Geospatial Distributed Systems · Real-Time Mobility',
    difficulty: 'Senior (L5)',
    durationMinutes: 45,
    relatedBlueprintId: 'uber-geospatial',
    openingPrompt:
      'Design Uber’s core rider-driver matching, live GPS location ingestion (5M active drivers sending GPS every 4 seconds), dynamic surge pricing, and real-time trip ETA tracking.',
    whiteboardHints: [
      'Ingest rate: 5M drivers / 4s = 1.25M GPS writes/sec -> in-memory H3 geospatial index, NOT disk SQL!',
      'Spatial Index: Uber H3 Hexagonal Grid (equal neighbor distance, fast k-ring expansion).',
      'Dispatch lock: One driver can only hold ONE pending offer at a time (TTL 15s atomic lease).',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Write Throughput & Storage Strategy',
        timeBudget: '0–6 min',
        interviewerQuestion:
          '5 million online drivers emit `(driver_id, lat, lng, heading, ts)` every 4 seconds (~1.25M writes/sec). Where do these live coordinates go?',
        contextClue: 'Live location is ephemeral high-churn state; trip history is append-only.',
        options: [
          {
            id: 'opt-a',
            label: 'Route GPS pings over persistent WebSocket/gRPC connections into a sharded in-memory Geospatial Index (partitioned by H3 City/Cell) with TTL expiry—never hit PostgreSQL per GPS ping! Async-batch raw breadcrumbs to Kafka -> Cassandra/Object Storage for trip replay & ETA ML.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Clean separation of hot ephemeral state (1.25M writes/s in RAM) vs cold durable analytics/audit breadcrumbs (batched Kafka -> Cassandra).',
          },
          {
            id: 'opt-b',
            label: 'Run `UPDATE drivers SET lat=$1, lng=$2 WHERE id=$3` in PostgreSQL 1.25 million times per second.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '1.25M random B-Tree/PostGIS row updates per second creates catastrophic MVCC dead-tuple bloat and WAL saturation.',
          },
          {
            id: 'opt-c',
            label: 'Store driver coordinates only on the rider’s phone via peer-to-peer Bluetooth.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Bluetooth range is ~10 meters—completely unusable for city-wide dispatch.',
          },
          {
            id: 'opt-d',
            label: 'Have drivers send GPS only once every 5 minutes to save database writes.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'A car moving 60 km/h travels 5 kilometers in 5 minutes—dispatches and live maps would be hopelessly inaccurate.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Geospatial Indexing (H3 vs Geohash vs QuadTree)',
        timeBudget: '6–14 min',
        interviewerQuestion:
          'Why did Uber invent H3 (Hexagonal Hierarchical Spatial Index) instead of sticking with square Geohashes for nearby-driver lookup and surge pricing?',
        contextClue: 'Think neighbor geometry and boundary edge effects.',
        options: [
          {
            id: 'opt-a',
            label: 'Hexagons have only ONE uniform center-to-center distance to all 6 neighbors (unlike squares where diagonal neighbors are √2 farther), smooth radial k-ring search without weird Geohash Z-curve boundary jumps, and clean hierarchical resolutions for per-hex Supply/Demand Surge aggregation.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact geospatial intuition! Uniform neighbor distance + clean k-ring expansion + smooth surge heatmaps make H3 far superior to square Geohashes for mobility.',
          },
          {
            id: 'opt-b',
            label: 'Hexagons use fewer bits than latitude/longitude floats so they compress better in JPEG images.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'H3 indices are 64-bit integers designed for uniform spatial neighborhoods and hierarchical aggregation, not image compression.',
          },
          {
            id: 'opt-c',
            label: 'Compute exact Haversine distance against all 5 million drivers in a linear loop on every ride request.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'O(N) full scan over 5M drivers per ride request collapses CPU immediately; spatial cell indexing narrows candidates to ~50 drivers in O(1).',
          },
          {
            id: 'opt-d',
            label: 'Use Geohash prefixes and ignore edge-boundary neighbors because riders never stand near cell borders.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Two points 10 meters apart across a Geohash boundary can have completely different prefixes! Always query the cell plus its surrounding neighbors (k-ring).',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Dispatch Algorithm & Preventing Double-Offer Race',
        timeBudget: '14–24 min',
        interviewerQuestion:
          'Riders A and B request rides 50ms apart right next to the same lone Driver X. How do you match riders to drivers using road ETA (not crow-flies distance) AND guarantee Driver X never receives two conflicting trips?',
        contextClue: 'Think H3 candidate filter -> Road-Graph ETA -> Atomic Driver Offer Lock (15s TTL) + Batched Bipartite Matching.',
        options: [
          {
            id: 'opt-a',
            label: '1) Pull nearby drivers via H3 k-ring, 2) Rank candidates by actual Road-Network ETA (Contraction Hierarchies / OSRM), 3) Run short 2-second Batched Bipartite Matching (minimizing global city ETA instead of greedy first-come!), and 4) Acquire an atomic Redis/DB lease `SET driver_lock:{id} {trip_id} NX PX 15000` before pushing the WebSocket offer.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Staff-level dispatch design! Batched bipartite matching beats greedy matching significantly on global wait times, road-network ETA avoids matching drivers across rivers/highways, and atomic `NX PX` leases eliminate double offers.',
          },
          {
            id: 'opt-b',
            label: 'Broadcast the ride offer to 20 nearby drivers at once and give the trip to whoever taps Accept first.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Broadcast works in low-density markets, but frustrates 19 drivers with "already taken" errors and causes distracted driving. Targeted sequential/batched offers with atomic leases are much cleaner.',
          },
          {
            id: 'opt-c',
            label: 'Match strictly by straight-line Euclidean distance without locking driver state.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Straight-line distance matches drivers across rivers/freeway medians (15-min real drive!), and skipping atomic locks double-books the same driver.',
          },
          {
            id: 'opt-d',
            label: 'Use a global single-threaded mutex across the entire planet so only one ride matches at a time.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Rides in Tokyo and New York never contend! Always shard dispatch independently by City / Geo-Region.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB Schema: Trips Ledger & Payment Settlement',
        timeBudget: '24–34 min',
        interviewerQuestion:
          'How do you design the persistent database schema for Trips, State Transitions (`REQUESTED -> MATCHED -> IN_PROGRESS -> COMPLETED`), and Driver/Rider Fare Settlement?',
        contextClue: 'Think Trip State Machine table sharded by `city_id`/`trip_id`, plus Double-Entry Ledger + Outbox.',
        options: [
          {
            id: 'opt-a',
            label: 'Sharded PostgreSQL/CockroachDB (partitioned by `city_id` / `trip_id`): `trips` table with strict state-machine version checks + `trip_events` append-only audit log + Double-Entry `ledger_entries` (Rider Debit, Driver Payout Credit, Platform Fee Credit) triggered via Transactional Outbox to Payment/Payout workers.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Solid, auditable architecture! Combining strict trip state transitions with a double-entry financial ledger via Transactional Outbox guarantees zero lost fares or double payouts.',
          },
          {
            id: 'opt-b',
            label: 'Store trips only in Redis with no persistent relational database.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Trips are legal and financial records (receipts, driver earnings, safety audits)—they MUST live in durable ACID storage.',
          },
          {
            id: 'opt-c',
            label: 'Keep a single mutable `driver_balance` float column and add `fare * 0.75` without recording individual trip transactions.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Floating-point rounding drift + zero audit trail! Always store integer minor units (cents/paise) in an immutable double-entry ledger.',
          },
          {
            id: 'opt-d',
            label: 'Store every 4-second GPS point inside the `trips` PostgreSQL row as an ever-growing JSON array.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Appending to a Postgres JSONB array every 4 seconds causes massive row rewrites (TOAST bloat). Stream GPS breadcrumbs to Cassandra/ClickHouse/S3 separately.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Concert Stadium Exit Spike & Split GPS Tunnels',
        timeBudget: '34–45 min',
        interviewerQuestion:
          'Curveball: A Taylor Swift concert lets out—50,000 fans open Uber simultaneously inside 3 adjacent H3 hexagons, AND a matched driver drives through a 90-second underground tunnel with zero cell signal. How does your system stay resilient?',
        contextClue: 'Think surge throttling/cached hex counts + dead-reckoning / graceful reconnect without false cancellation.',
        options: [
          {
            id: 'opt-a',
            label: '1) Aggregate Supply/Demand per H3 hex in a sliding 1-min streaming window (Flink/Kafka) to compute Surge Multiplier and cache ETA/surge snapshots per H3 hex (serving 50K fans in <5ms instead of 50K individual dispatch lookups). 2) Use a grace window (e.g., 2–3 min) before marking an active-trip driver offline, snap-to-road map-matching on reconnect, and resume trip state via WebSocket cursor replay.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Production-battle-tested thinking! Caching per-hex surge/ETA collapses 50K identical stadium reads into O(1) lookups, and distinguishing offline-idle drivers (short 15s TTL) from in-trip tunnel drivers prevents false trip cancellations.',
          },
          {
            id: 'opt-b',
            label: 'Immediately auto-cancel any active ride the moment a driver misses 2 consecutive 4-second GPS pings.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Every tunnel or parking garage would cancel live trips while the rider is sitting inside the car!',
          },
          {
            id: 'opt-c',
            label: 'Recalculate Surge Multiplier by running a live `COUNT(*)` SQL query across all 50,000 fans’ open app sessions.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Instant database meltdown! Stream-aggregate counts per H3 hex asynchronously and serve cached multipliers.',
          },
          {
            id: 'opt-d',
            label: 'Disable Surge Pricing completely during concerts so riders wait in a first-come queue.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Product nuance: surge pricing both equilibrates supply/demand and incentivizes nearby drivers to drive toward the stadium—plus you still need per-hex read caching to survive 50K concurrent map opens.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      '1.25M GPS writes/sec handled via persistent WS/gRPC -> in-memory H3 geospatial index; breadcrumbs batched to Cassandra/S3.',
      'H3 Hexagonal Grid for uniform neighbor distance, smooth k-ring queries, and streaming Supply/Demand Surge aggregation.',
      'Road-network ETA (Contraction Hierarchies) + 2-sec Batched Bipartite Matching + atomic 15s `NX PX` driver offer lock.',
      'City-sharded ACID `trips` state machine + immutable Double-Entry financial ledger (integer cents) via Outbox.',
      'Graceful tunnel-disconnect tolerance for active trips + per-hex cached surge/ETA during stadium exit spikes.',
    ],
  },

  {
    id: 'mock-whatsapp-slack',
    title: 'Design WhatsApp & Slack/MS Teams Real-Time Messaging',
    shortTitle: 'WhatsApp & Slack/Teams',
    companyStyle: 'Real-Time Messaging · Billions of Connections',
    difficulty: 'Senior (L5)',
    durationMinutes: 45,
    relatedBlueprintId: 'whatsapp-messaging',
    openingPrompt:
      'Design a global messaging system covering both WhatsApp-style 1:1 & group E2EE chat (100B messages/day) and Slack/MS Teams multi-device workspace channels with presence, typing indicators, and unread badges.',
    whiteboardHints: [
      'Stateful WebSocket Edge Gateways + Redis Session Registry (`user_id -> gateway_node`).',
      'Message IDs: Snowflake / ULID (time-sortable + unique) for strict per-channel ordering & cursor sync.',
      'Storage: Cassandra / ScyllaDB partitioned by `(channel_id, bucket_month)` + client-side cursor delta sync.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Connection & Routing Architecture',
        timeBudget: '0–6 min',
        interviewerQuestion:
          'Alice (connected to WebSocket Gateway #14 in Mumbai) sends a message to Bob (connected to Gateway #82 in London). How does Gateway #14 discover where Bob is and deliver the message in <100ms?',
        contextClue: 'Think stateful WebSocket edge + distributed Session Registry + internal gRPC/pub-sub routing.',
        options: [
          {
            id: 'opt-a',
            label: 'Maintain a distributed Redis Cluster Session Registry mapping `user_id -> [gateway_node_id, device_id]`. Gateway #14 persists the message, looks up Bob’s active gateway(s) (Gateway #82), and routes the frame over internal gRPC/NATS; if Bob is offline, enqueue an APNs/FCM Push Notification.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook real-time chat routing! Supporting multiple `device_id` entries per `user_id` also seamlessly handles Slack/Teams desktop + mobile multi-device sync.',
          },
          {
            id: 'opt-b',
            label: 'Have Gateway #14 broadcast every private message to all 2,000 WebSocket gateways so whichever one owns Bob can forward it.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'O(N_gateways) broadcast amplification collapses internal network bandwidth at 100B messages/day!',
          },
          {
            id: 'opt-c',
            label: 'Force Alice and Bob to be sticky-routed to the exact same server instance globally.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Impossible when Alice chats with 50 friends across the globe—every user would end up forced onto one giant server!',
          },
          {
            id: 'opt-d',
            label: 'Store the message in MySQL and have Bob’s phone poll `SELECT * FROM messages` every 1 second.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Polling drains mobile battery and generates billions of empty DB reads per second.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Message Ordering, Deduplication & Delivery Receipts',
        timeBudget: '6–14 min',
        interviewerQuestion:
          'On flaky subway 4G, Alice’s phone retries sending "See you at 7!" three times, and two messages arrive slightly out of order. How do you guarantee zero duplicates, crisp ordering, and accurate Single/Double/Blue ticks?',
        contextClue: 'Think `client_msg_id` idempotency + Snowflake/per-channel sequence IDs + ACK state transitions.',
        options: [
          {
            id: 'opt-a',
            label: 'Client attaches a UUID `client_msg_id` for idempotent deduplication. Server assigns a monotonically increasing `channel_seq` (or Snowflake ID) on persist and ACKs Alice (Single Grey Tick). When Bob’s client ACKs receipt -> push Double Grey Tick; when Bob opens chat -> push Read Receipt (`last_read_seq` watermark -> Blue Tick).',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Crystal clear! `client_msg_id` kills retry duplicates, server-assigned `channel_seq` gives deterministic ordering, and advancing a single `last_read_seq` watermark avoids sending 500 individual read receipts when opening a busy channel.',
          },
          {
            id: 'opt-b',
            label: 'Sort messages strictly by the sender’s phone wall-clock timestamp (`Date.now()`).',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Client clocks skew wildly (seconds, minutes, or wrong timezones)! Never trust client wall-clocks for authoritative chat ordering.',
          },
          {
            id: 'opt-c',
            label: 'Deduplicate by blocking any user from sending the exact same text string ("ok") twice in a row.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Users legitimately type "ok" or "yes" multiple times! Deduplicate by unique `client_msg_id`, never by message text.',
          },
          {
            id: 'opt-d',
            label: 'Skip ACKs completely and use fire-and-forget UDP packets for chat text.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Chat text demands reliable ordered delivery—fire-and-forget UDP drops messages silently.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'DB-Level Schema & Wide-Column Partitioning',
        timeBudget: '14–24 min',
        interviewerQuestion:
          'How do you design the message storage database to survive 100B writes/day, support fast "load last 50 messages" scrollback, AND avoid giant hot partitions in a 10-year-old `#general` Slack channel?',
        contextClue: 'Think LSM-Tree wide-column store (Cassandra/ScyllaDB) + time-bucketed partition key.',
        options: [
          {
            id: 'opt-a',
            label: 'Use Cassandra/ScyllaDB (LSM-Tree write-optimized) with composite Partition Key `(channel_id, bucket_month)` and Clustering Key `message_id DESC`. Time-bucketing caps partition size cleanly so 10-year `#general` channels never create unbounded multi-GB partitions while keeping latest-50 reads a single sequential disk slice!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact Discord/Slack/WhatsApp-scale storage engineering! `(channel_id, bucket_month)` + `message_id DESC` solves both massive write throughput (LSM append-only) and unbounded partition growth.',
          },
          {
            id: 'opt-b',
            label: 'Partition strictly by `user_id` and store every group message once per user in PostgreSQL.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Copying a message 10,000 times for a 10,000-member Slack channel explodes write amplification! Partition by `(channel_id, bucket)` instead.',
          },
          {
            id: 'opt-c',
            label: 'Use only `channel_id` as the Cassandra partition key forever with no time bucketing.',
            points: 12,
            signal: 'Hire',
            interviewerFeedback:
              'Good choice of LSM store, but after years of activity in a big `#general` channel, a single unbounded partition hits hundreds of MBs/GBs and triggers severe compaction/GC pauses. Always add a time bucket!',
          },
          {
            id: 'opt-d',
            label: 'Store raw 50MB video attachments directly as BLOB columns inside the messages database table.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Never put heavy media blobs in the chat DB! Upload encrypted media directly to S3/Object Storage via pre-signed URLs + CDN and store only the metadata/URL + decryption key pointer in the message.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'Presence ("Online / Last Seen") Storm Prevention',
        timeBudget: '24–34 min',
        interviewerQuestion:
          'When a user comes online in a 50,000-employee MS Teams / Slack org, broadcasting "Alice is Online!" to all 50,000 coworkers creates an O(N^2) presence storm every morning at 9:00 AM. How do you tame Presence?',
        contextClue: 'Think lazy/viewport subscription + heartbeat TTL + grace-period debounce.',
        options: [
          {
            id: 'opt-a',
            label: 'Store `presence:{user_id}` in Redis with a 30s heartbeat TTL. Use Lazy / Viewport Presence Subscriptions: clients only subscribe to presence updates for the ~30–50 users currently visible in their active sidebar/channel (NOT all 50K org members!), and debounce rapid disconnect/reconnect flaps with a 10-second grace window.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Viewport-scoped lazy presence subscriptions shrink O(N^2) morning login storms down to O(visible_contacts), and a 10s flap debounce stops jittery Wi-Fi from spamming status flips.',
          },
          {
            id: 'opt-b',
            label: 'Push every user’s online/offline event to every member of the company immediately.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '50K logins * 50K recipients = 2.5 billion presence messages at 9:00 AM! Instant outage.',
          },
          {
            id: 'opt-c',
            label: 'Write every 10-second heartbeat to PostgreSQL `UPDATE users SET last_seen = NOW()`.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Millions of heartbeat writes/sec will destroy your relational user table. Keep volatile presence in Redis with TTL expiry.',
          },
          {
            id: 'opt-d',
            label: 'Refresh online status only once per hour via a batch job.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Stale 1-hour presence makes the green dot useless for real-time collaboration.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: 100,000-Member Company-Wide Channel Fan-Out',
        timeBudget: '34–45 min',
        interviewerQuestion:
          'Curveball: The CEO posts an announcement in `#all-hands` (100,000 employees online simultaneously). If you try to look up 100,000 Redis session keys synchronously inside the send handler, the sender times out and gateways spike. How do you handle massive channel fan-out?',
        contextClue: 'Think Channel-Level Gateway Subscriptions (Pub/Sub by Channel -> Gateway, NOT per user!) + Async Enqueue.',
        options: [
          {
            id: 'opt-a',
            label: 'Invert the fan-out for large channels! Instead of looping 100K users, each WebSocket Gateway maintains a local map of which channels its connected users are viewing and subscribes ONCE to the channel’s pub/sub topic. The message persists once, enqueues to the channel topic, and is forwarded once per Gateway (e.g., 200 hops instead of 100,000!) where each Gateway fans out locally in RAM.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Brilliantly scalable! Gateway-level channel fan-out (the real Slack/Discord pattern) turns 100,000 cross-network lookups into ~200 gateway deliveries + ultra-fast local RAM broadcast.',
          },
          {
            id: 'opt-b',
            label: 'Run a synchronous `for` loop over all 100,000 user IDs inside the HTTP POST handler before returning 200 OK to the CEO.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '100K sequential/parallel lookups inside the request path causes massive timeouts and retries (creating duplicate CEO posts!).',
          },
          {
            id: 'opt-c',
            label: 'Cap all company channels to a maximum of 50 members.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Enterprise customers require org-wide announcement channels; solve it architecturally with gateway-level topic fan-out.',
          },
          {
            id: 'opt-d',
            label: 'Send 100,000 individual SMS messages instead of WebSocket frames.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Hugely expensive, slow, and totally bypasses the live chat app.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Stateful WebSocket Edge Fleet + Redis Session Registry (`user_id -> [gateway, device]`) + APNs/FCM offline push.',
      'Idempotent `client_msg_id` + server-assigned Snowflake/`channel_seq` ordering + `last_read_seq` watermark receipts.',
      'LSM-Tree storage (Cassandra/ScyllaDB) partitioned by `(channel_id, bucket_month)` with `message_id DESC` clustering.',
      'Viewport-scoped Lazy Presence subscriptions + Redis heartbeat TTL + 10s flap debounce.',
      'Gateway-level Channel Pub/Sub fan-out (200 gateway hops instead of 100K per-user lookups) for massive channels.',
    ],
  },

  {
    id: 'mock-google-search',
    title: 'Design Google Web Search Engine (Crawler, Inverted Index & PageRank)',
    shortTitle: 'Google Search Engine',
    companyStyle: 'Information Retrieval · Petabyte Distributed Systems',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'google-search-engine',
    openingPrompt:
      'Design a web-scale search engine like Google covering 50 billion web pages, serving 100,000+ queries/sec in under 200ms, keeping news fresh within minutes, and ranking results with relevance + authority.',
    whiteboardHints: [
      'Offline pipeline: Politeness-aware Distributed Crawler -> SimHash Dedupe -> MapReduce/Flume Inverted Index + PageRank.',
      'Online serving: Document-Sharded Inverted Index (NOT term-sharded!) -> Scatter-Gather -> 2-Stage Ranking (BM25 + Neural Reranker).',
      'Caching: Top 20% head queries served from RAM/Edge Cache (<10ms).',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Web Crawler Politeness & Deduplication',
        timeBudget: '0–8 min',
        interviewerQuestion:
          'Your crawler fetches billions of URLs across millions of domains. How do you avoid accidentally DDoSing small websites, getting trapped in infinite calendar URLs, or indexing 500 identical copies of the same page?',
        contextClue: 'Think Host-partitioned Frontier Queues, `robots.txt` cache, Bloom/RocksDB seen-URLs, and SimHash.',
        options: [
          {
            id: 'opt-a',
            label: 'Use a Politeness Frontier: hash URLs by `host_domain` into per-host FIFO queues enforcing `robots.txt` crawl-delay (e.g., max 1 req/sec/host) + Priority queues (high PageRank/news crawled more often). Dedupe URLs via distributed Bloom Filter + RocksDB, and dedupe near-duplicate HTML content via 64-bit SimHash / MinHash fingerprints.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Complete crawler mastery! Host-partitioned politeness queues, priority re-crawl scheduling, URL trap limits, and SimHash near-duplicate detection cover every classic crawling pitfall.',
          },
          {
            id: 'opt-b',
            label: 'Put all discovered URLs into one giant FIFO queue and crawl them at 10,000 req/sec regardless of domain.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'You will immediately DDoS small domains and get your crawler IP ranges permanently blacklisted across the internet!',
          },
          {
            id: 'opt-c',
            label: 'Compare every newly crawled HTML document byte-by-byte against all 50 billion existing pages.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'O(N^2) comparison is computationally impossible! SimHash/MinHash locality-sensitive hashing finds near-duplicates in O(1) bit-hamming lookups.',
          },
          {
            id: 'opt-d',
            label: 'Crawl every single webpage on the internet on the exact same fixed 30-day schedule.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Breaking news sites (Reuters, BBC) change every minute while static academic PDFs never change—adaptive priority scheduling is essential for freshness.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Inverted Index Sharding Strategy (Document vs Term Sharding)',
        timeBudget: '8–18 min',
        interviewerQuestion:
          'Your Inverted Index (`term -> [doc_id, positions, tf]`) is 200 TB across 2,000 Index Shard servers. Should you shard the index by TERM (`apple` on Shard 1, `pie` on Shard 2) or by DOCUMENT (`doc_id % 2000`)? Why?',
        contextClue: 'Compare multi-word intersection network traffic, hot terms ("the"), and fault tolerance.',
        options: [
          {
            id: 'opt-a',
            label: 'Shard by DOCUMENT (`doc_id` / PageRank tier)! Every shard holds a subset of documents and computes local multi-term intersections (`apple AND pie`) in RAM, returning only its Top-K (e.g., Top 20) DocIDs to the Root Aggregator. Term-sharding would ship multi-GB posting lists over the network and meltdown on hot stop-words!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact Google architecture! Document-sharding makes multi-word intersections completely local to each shard, avoids hot-term hotspots, and degrades gracefully if 1 shard out of 2,000 times out.',
          },
          {
            id: 'opt-b',
            label: 'Shard by TERM so each query only hits 2 servers.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Classic trap! For `"best pizza near me"`, transferring a 500M-doc posting list for `"best"` across the network to intersect with `"pizza"` saturates NICs and collapses on hot words.',
          },
          {
            id: 'opt-c',
            label: 'Store the entire 200 TB index in a single PostgreSQL table using `WHERE body LIKE \'%apple%\'`.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Leading-wildcard `LIKE` triggers a full 200 TB table scan—taking hours instead of <150ms!',
          },
          {
            id: 'opt-d',
            label: 'Replicate the full 200 TB index onto every single frontend web server.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'A single machine cannot fit 200 TB of hot index in RAM/NVMe.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Two-Stage Ranking & <200ms Tail Latency',
        timeBudget: '18–28 min',
        interviewerQuestion:
          'You want to rank results using a heavy Transformer neural model (BERT/RankBrain) AND PageRank, yet 100K queries/sec must finish in <200ms. How do you combine fast lexical retrieval with deep ML ranking?',
        contextClue: 'Think Tiered Inverted Index + L1 Fast Recall (BM25 + Static PageRank) -> L2 Neural Rerank on Top-100 only.',
        options: [
          {
            id: 'opt-a',
            label: 'Multi-stage Funnel: 1) Check Query Result Cache (absorbs ~30% head queries in <10ms), 2) Scatter-gather Top-K across Tier-1 (high-PageRank) doc shards using fast BM25 + static PageRank + WAND early termination (returns ~500 candidates in 40ms), 3) Run heavy Neural Cross-Encoder Reranker ONLY on the Top 50–100 candidates (~60ms)!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook search funnel! Tiered indices + WAND early termination + running expensive ML models only on the Top-100 candidates achieves both deep semantic relevance and <200ms p99.',
          },
          {
            id: 'opt-b',
            label: 'Run the Transformer neural model on all 50 billion web pages live for every user query.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Running a neural model over 50B pages per query would require more GPUs than exist on Earth!',
          },
          {
            id: 'opt-c',
            label: 'Sort results purely by PageRank alone without checking keyword relevance or query intent.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Every query would just return Facebook, Wikipedia, and YouTube homepages regardless of what the user searched!',
          },
          {
            id: 'opt-d',
            label: 'Compute PageRank live from scratch across the web graph inside each search request.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'PageRank is a query-independent graph authority score—precompute it offline via iterative MapReduce/Pregel and store it as a static float per `doc_id`.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB & Storage Layout (Doc Store, Link Graph, Posting Compression)',
        timeBudget: '28–36 min',
        interviewerQuestion:
          'How do you compress 50B-page inverted index posting lists so they fit in RAM, and where do you store raw page snippets and the web link graph?',
        contextClue: 'Think Delta-Encoding + Variable-Byte/PForDelta compression, Bigtable/RocksDB Doc Store, and LSM real-time index.',
        options: [
          {
            id: 'opt-a',
            label: 'Sort posting lists by `doc_id` (or static quality rank) and store Delta Gaps (`d1, d2-d1, ...`) compressed via VarInt / PForDelta (4–8x RAM savings) with Skip Pointers for fast intersection. Store crawled HTML/snippets in Bigtable/SSTables keyed by `doc_id`, and maintain a small mutable In-Memory Real-Time Index (Percolator/Caffeine) merged at query time for breaking news!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Principal-level IR detail! Delta-VarInt compression + Skip Pointers explain how Google fits massive posting lists in RAM, and merging a small real-time delta index gives minute-level news freshness without rebuilding the 200 TB base index.',
          },
          {
            id: 'opt-b',
            label: 'Store posting lists as uncompressed JSON strings of 64-bit UUIDs.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Uncompressed UUID strings blow up RAM 15–20x and kill CPU cache-line locality during list intersections.',
          },
          {
            id: 'opt-c',
            label: 'Rebuild the entire 200 TB search index from scratch every 60 seconds whenever a news article is published.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Full index rebuilds take hours/days; use an incremental LSM/Caffeine real-time overlay merged with the base index at query time.',
          },
          {
            id: 'opt-d',
            label: 'Store snippets inside the inverted index posting list next to every word occurrence.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Duplicating page text inside every word’s posting list bloats the RAM index massively. Fetch snippets from the separate Doc Store ONLY for the final 10 results on Page 1!',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Tail Latency Amplification Across 2,000 Shards',
        timeBudget: '36–45 min',
        interviewerQuestion:
          'Curveball: A query scatters to 2,000 Document Shards. Even if each shard has 99.9% fast latency (10ms) and only 0.1% slow GC/network stalls (500ms), probability math says `1 - 0.999^2000 = 86.5%` of ALL user searches will hit at least one slow shard and stall! How do you crush this tail latency?',
        contextClue: 'Think Jeff Dean’s "Tail at Scale": Hedged Requests, Strict Partial-Result Deadlines, and Tiered Early Exit.',
        options: [
          {
            id: 'opt-a',
            label: 'Apply "The Tail at Scale" defenses: 1) Hedged Requests (if a shard replica has not responded by p95 = 15ms, fire a duplicate request to a second replica and take the first answer, cancelling the slower one), 2) Hard 80ms leaf deadline returning graceful partial results if 1998/2000 shards replied, and 3) Serve most queries from smaller high-PageRank Tier-1 shards first.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Mic-drop Staff answer! Hedged Requests (adding <5% extra load while slashing p99 latency >70%) + partial-result leaf deadlines + Tier-1 early exit is literally how Google keeps global scatter-gather under 200ms.',
          },
          {
            id: 'opt-b',
            label: 'Wait up to 30 seconds for all 2,000 shards to respond so not a single low-ranked webpage is ever missed.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '86% of users will abandon your search engine! Returning 99.9% of shards in 80ms is invisible to users compared to a 30-second freeze.',
          },
          {
            id: 'opt-c',
            label: 'Send every query to 5 replicas of all 2,000 shards immediately at T=0ms.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              '5x immediate fan-out increases cluster hardware cost by 400%! Delaying the hedge until p95 (e.g. 15ms) gives almost the exact same latency win for only ~5% extra load.',
          },
          {
            id: 'opt-d',
            label: 'Collapse all 2,000 shards back onto 1 machine to eliminate scatter-gather.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Violates physical RAM/CPU limits for a 50-billion-page web index.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Politeness-enforced, host-partitioned Crawler Frontier + Bloom/RocksDB URL dedupe + SimHash content dedupe.',
      'Document-Sharded Inverted Index with Delta+VarInt/PForDelta compression + Skip Pointers + Real-time delta overlay.',
      'Multi-Stage Funnel: Query Cache -> Tier-1 BM25/PageRank WAND recall -> Neural Cross-Encoder Rerank on Top-100.',
      'Separate Bigtable/SSTable Doc Store fetched ONLY for the winning Page-1 snippets.',
      'Tail-at-Scale mitigation: p95 Hedged Requests + strict leaf deadlines returning graceful partial results.',
    ],
  },

  {
    id: 'mock-payment-gateway',
    title: 'Design a Stripe/Razorpay Payment Gateway, Webhooks & Double-Entry Ledger',
    shortTitle: 'Payment Gateway + Ledger',
    companyStyle: 'FinTech Core · Zero-Money-Loss Systems',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'payment-gateway-ledger',
    openingPrompt:
      'Design a payment processing platform like Stripe or Razorpay handling 50,000 payments/sec across card networks & UPI, merchant webhooks, automatic retries, and an auditable Double-Entry Ledger where not a single cent can ever be lost or double-charged.',
    whiteboardHints: [
      'End-to-end Idempotency Keys (`Idempotency-Key` stored with request hash + locked state in ACID DB).',
      'Immutable Double-Entry Ledger: Every transfer writes balanced DEBIT + CREDIT rows (`SUM = 0`) in integer minor units.',
      'Reliable Merchant Webhooks: Transactional Outbox -> Delivery Queue -> HMAC-SHA256 -> Exponential Backoff -> DLQ.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Preventing Double Charges (Idempotency Architecture)',
        timeBudget: '0–8 min',
        interviewerQuestion:
          'A merchant’s checkout server retries `POST /v1/charges` three times in 2 seconds because of a flaky mobile/proxy timeout. How do you guarantee the customer’s credit card is charged ONCE—and never twice?',
        contextClue: 'Think `Idempotency-Key` unique constraint, request-payload fingerprint check, and in-flight locking.',
        options: [
          {
            id: 'opt-a',
            label: 'Require a client `Idempotency-Key` persisted in an ACID `idempotency_keys(merchant_id, key)` UNIQUE table with states `IN_PROGRESS | COMPLETED` and `request_hash`. Concurrent duplicate hits see `IN_PROGRESS` (return 409 Conflict / wait), completed hits replay the exact cached response, and mismatched payloads with the same key return 422!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Stripe-caliber precision! Handling concurrent in-flight races, replaying exact stored responses, AND validating `request_hash` prevents subtle client bugs from silently returning the wrong charge.',
          },
          {
            id: 'opt-b',
            label: 'Disable the "Pay" button in the browser UI with JavaScript and assume duplicates will never reach the backend.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Network proxies, mobile SDKs, and load balancers automatically retry timed-out requests even if the user clicked once! Idempotency MUST be enforced server-side in ACID storage.',
          },
          {
            id: 'opt-c',
            label: 'Store seen request IDs in a local in-memory HashMap on each API server.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'The retry hits a DIFFERENT load-balanced API node (or arrives after a restart) and double-charges the card!',
          },
          {
            id: 'opt-d',
            label: 'Reject any two charges from the same user within 5 minutes even if they are buying two different items.',
            points: 8,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Heuristics break legitimate back-to-back purchases (e.g., buying two coffees or ride + tip). Explicit per-intent `Idempotency-Key` is exact.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Double-Entry Ledger Database Schema',
        timeBudget: '8–18 min',
        interviewerQuestion:
          'How do you model merchant balances, platform fees, refunds, and payouts in the database so auditors can prove mathematical consistency down to the exact cent?',
        contextClue: 'Immutable append-only postings (`SUM(signed_amount) = 0`), integer minor units, never `UPDATE balance = balance + x` alone.',
        options: [
          {
            id: 'opt-a',
            label: 'Immutable Append-Only Double-Entry Ledger in ACID PostgreSQL: every transaction creates a `journal_entry` + balanced `ledger_postings` rows (e.g., Buyer Clearing `-10000` cents, Merchant Payable `+9710` cents, Stripe Fee `+290` cents -> `SUM = 0`) using `BIGINT` minor units + `currency`. Refunds append reverse entries; never `UPDATE` or `DELETE` historical rows!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Gold-standard financial database design! Integer minor units eliminate IEEE-754 float bugs, append-only balanced postings make corruption immediately detectable, and materialized balance checkpoints keep reads O(1).',
          },
          {
            id: 'opt-b',
            label: 'Keep a single `merchant_balance FLOAT` column and run `UPDATE merchants SET balance = balance + 97.10` on each payment.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Float arithmetic introduces penny rounding errors (`0.1 + 0.2 = 0.30000000000000004`), single-row updates create massive lock contention on big merchants like Amazon, and overwriting destroys audit trails!',
          },
          {
            id: 'opt-c',
            label: 'Store financial ledger entries in an eventually consistent NoSQL store with last-write-wins conflict resolution.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Last-write-wins silently drops money during concurrent updates! Financial ledgers demand strict ACID serialization.',
          },
          {
            id: 'opt-d',
            label: 'Only store payment amounts in application log files and sum them up with a Python script at month-end.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Log files are lossy, non-transactional, and fail every financial compliance audit (SOC2/PCI/SOX).',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Reliable Merchant Webhook Delivery Pipeline',
        timeBudget: '18–26 min',
        interviewerQuestion:
          'When a payment settles, you must notify the merchant’s backend via Webhook. One merchant’s server is slow (10s timeout) and another returns 503 for 2 hours. How do you design a bulletproof Webhook Dispatcher?',
        contextClue: 'Think Transactional Outbox, per-merchant isolated queues/rate-limits, HMAC-SHA256 + timestamp, exponential backoff + circuit breaker.',
        options: [
          {
            id: 'opt-a',
            label: 'Write `webhook_events` inside the SAME ACID DB transaction as the payment (Transactional Outbox) -> Relay to per-merchant fair queues -> Worker POSTs with `X-Signature-256` (HMAC-SHA256 of `timestamp.body`) and strict 5s timeout -> Exponential backoff with jitter (1m, 5m, 30m, 2h..72h) -> Circuit-break failing endpoints + DLQ dashboard for merchant manual replay.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Complete production webhook platform! Transactional Outbox guarantees zero missed events, per-merchant isolation stops one slow merchant from starving healthy merchants (noisy-neighbor protection), and timestamped HMAC defeats spoofing + replay.',
          },
          {
            id: 'opt-b',
            label: 'Make a synchronous HTTP POST to the merchant’s webhook URL inside the Visa/Mastercard capture handler before committing the DB.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'If a merchant’s server is down or slow, you stall payment capture for every customer and risk rolling back already-captured money!',
          },
          {
            id: 'opt-c',
            label: 'Send unsigned JSON payloads once; if the merchant returns 503, drop the event permanently.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Attackers can forge fake `payment.succeeded` webhooks for free goods, and any 1-minute merchant deploy drops paid orders permanently.',
          },
          {
            id: 'opt-d',
            label: 'Retry failed webhooks in a tight 10ms `while` loop until they succeed.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Tight retry loops DDoS the recovering merchant and exhaust all your webhook worker threads!',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'Hot-Account Contention (Mega-Merchant Balance Updates)',
        timeBudget: '26–35 min',
        interviewerQuestion:
          'During Black Friday, Amazon processes 5,000 payments/sec into its SINGLE `merchant_payable` ledger account. Updating one `account_balance` row 5,000 times/sec deadlocks PostgreSQL! How do you scale hot ledger accounts?',
        contextClue: 'Think Sub-Account Sharding (e.g. 64 shadow buckets) + Async Batch Rollup.',
        options: [
          {
            id: 'opt-a',
            label: 'Append immutable `ledger_postings` rows directly (zero row-update lock on a single balance row!), OR shard hot merchant balance rows across `K = 64` sub-account buckets (`merchant_id + (tx_hash % 64)`), summing all 64 buckets on balance read and compacting periodically.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Staff-level database optimization! Append-only postings + K-bucket sub-account sharding eliminates single-row lock bottlenecks cleanly while keeping exact ACID sums.',
          },
          {
            id: 'opt-b',
            label: 'Switch the database isolation level to `READ UNCOMMITTED` and remove all row locks.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Causes lost updates and negative/corrupted financial balances!',
          },
          {
            id: 'opt-c',
            label: 'Rate-limit Amazon to 50 payments/sec so PostgreSQL locks stay happy.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Rejecting your biggest customer’s Black Friday traffic is a business disaster.',
          },
          {
            id: 'opt-d',
            label: 'Keep the balance only in Redis `INCRBY` and never persist it to SQL.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Volatile cache memory is unacceptable as the authoritative financial ledger.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Bank Reconciliation & Silent Settlement Drift',
        timeBudget: '35–45 min',
        interviewerQuestion:
          'Curveball: Your internal ledger says you collected $10,000,000 today, but the card acquirer bank’s end-of-day settlement file only deposits $9,998,420 ($1,580 missing from 14 edge-case timeouts/chargebacks). How do you catch and fix this automatically?',
        contextClue: 'Think Automated 3-Way Reconciliation Engine (Internal Ledger vs PSP API vs Bank Settlement File).',
        options: [
          {
            id: 'opt-a',
            label: 'Run an automated 3-Way Reconciliation Pipeline (Internal Ledger <-> Card Network/PSP Logs <-> Bank Settlement Files) matching by `network_tx_id`. Automatically categorize breaks (timing cut-off, missing capture, silent chargeback, fee discrepancy), trigger safe automated compensating entries for known rules, and page FinOps with exact mismatched tx IDs before merchant payout release!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'True FinTech Staff architecture! External bank networks are inherently messy; automated 3-way reconciliation BEFORE releasing merchant payouts is how real payment gateways prevent multi-million-dollar leaks.',
          },
          {
            id: 'opt-b',
            label: 'Ignore the $1,580 discrepancy since it is less than 0.02% of daily volume.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Unreconciled 0.02% drift compounds into millions of dollars and fails regulatory audits immediately.',
          },
          {
            id: 'opt-c',
            label: 'Delete the 14 transactions from your ledger so the numbers match the bank file.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Deleting ledger history is accounting fraud and destroys evidence of why the bank short-paid you!',
          },
          {
            id: 'opt-d',
            label: 'Ask merchants to email support if they notice missing payouts next month.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Reactive manual discovery is unacceptable; automated daily reconciliation catches breaks within hours.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Server-side ACID `Idempotency-Key` table with `IN_PROGRESS` lock, `request_hash` verification, and cached response replay.',
      'Immutable Append-Only Double-Entry Ledger (`BIGINT` minor units, `SUM = 0`) + K-bucket sub-account sharding for hot merchants.',
      'Transactional Outbox -> Fair Per-Merchant Queues -> HMAC-SHA256 Webhook Dispatcher -> Jitter Backoff + Circuit Breaker + DLQ.',
      'PCI-DSS isolation: tokenize raw PAN/CVV inside a dedicated Card Vault so core services never touch raw card numbers.',
      'Automated 3-Way Reconciliation (Internal Ledger vs PSP vs Bank Settlement File) gating merchant payouts.',
    ],
  },

  {
    id: 'mock-instagram-feed',
    title: 'Design Instagram Photo/Reels Feed, Celebrity Fan-Out & Stories',
    shortTitle: 'Instagram Feed & Reels',
    companyStyle: 'Consumer Social · 2B MAU Scale',
    difficulty: 'Senior (L5)',
    durationMinutes: 45,
    relatedBlueprintId: 'instagram-social',
    openingPrompt:
      'Design Instagram supporting 2 billion monthly users, photo/Reels uploads, home feed generation, Likes/Comments, and accounts ranging from normal users (500 followers) to mega-celebrities (300M+ followers).',
    whiteboardHints: [
      'Hybrid Fan-Out: Push (Fan-out-on-Write) for normal accounts, Pull (Fan-out-on-Read) for celebrities (>50K followers).',
      'Media pipeline: Pre-signed S3 upload -> Async Enqueue transcoding (AVIF/HLS ladder) -> Global Edge CDN.',
      'Hot Like counters: Buffered Redis/Kafka batched increment instead of 100K/s SQL row updates.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'The Celebrity Fan-Out Problem',
        timeBudget: '0–8 min',
        interviewerQuestion:
          'Cristiano Ronaldo (600M followers) posts a photo. If you push that post ID into all 600M followers’ Redis home-feed caches on write, what breaks—and how do you architect the Feed?',
        contextClue: 'Compare Fan-Out-on-Write vs Fan-Out-on-Read vs Hybrid.',
        options: [
          {
            id: 'opt-a',
            label: 'Hybrid Fan-Out! Normal users (<50K followers) use async Fan-Out-on-Write (push `post_id` into followers’ Redis/timeline caches for <20ms feed reads). Mega-celebrities skip push—instead, on feed read we merge the user’s precomputed inbox with the latest posts pulled from the ~5–20 celebrities they follow!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Classic Staff social-feed solution! Hybrid Fan-Out delivers instant reads for 99.9% of posts while completely eliminating 600M-write celebrity storms.',
          },
          {
            id: 'opt-b',
            label: 'Always run Fan-Out-on-Write synchronously for all 600M followers.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              '600M Redis writes takes minutes, saturates clusters, and causes massive replication lag!',
          },
          {
            id: 'opt-c',
            label: 'Run a live SQL `JOIN` across `follows` and `posts` for every user whenever they pull-to-refresh.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'A user following 2,000 accounts triggers 2,000-way scatter-gather DB joins on every single refresh—far too slow at 2B MAU.',
          },
          {
            id: 'opt-d',
            label: 'Push celebrity posts only to the first 1,000 followers and hide them from the rest.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Breaks the core product requirement for celebrity posts.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Media Upload, Transcoding & Global CDN Delivery',
        timeBudget: '8–16 min',
        interviewerQuestion:
          'Users upload 100M+ high-res photos & 4K Reels every day. How do you handle uploads cleanly without tying up API servers, and deliver instant playback on slow 3G phones?',
        contextClue: 'Think Direct-to-Object-Store pre-signed URLs + Async Enqueue Transcoding + Adaptive Bitrate HLS/CDN.',
        options: [
          {
            id: 'opt-a',
            label: 'API returns a short-lived Pre-Signed S3/GCS URL so the client uploads raw media directly to Object Storage (bypassing API RAM!). Object-store event enqueues an async Media Worker to generate multi-resolution WebP/AVIF thumbnails + HLS/DASH adaptive bitrate Reels segments, served globally via Edge CDN.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook media pipeline! Direct-to-S3 uploads keep app servers stateless/lean, async enqueue smooths transcoding CPU spikes, and adaptive CDN delivery handles 3G to 5G smoothly.',
          },
          {
            id: 'opt-b',
            label: 'Upload raw 200MB 4K videos through your Node.js/Java API server and transcode them synchronously before returning 200 OK.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'API servers OOM instantly and users stare at a 60-second upload spinner that times out!',
          },
          {
            id: 'opt-c',
            label: 'Serve the original raw 200MB 4K file directly to every mobile user’s feed.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Destroys mobile data plans and takes 20+ seconds to start playing each Reel.',
          },
          {
            id: 'opt-d',
            label: 'Store all photos as Base64 strings inside PostgreSQL rows.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Base64 inflates size 33% and turns your metadata DB into a slow, unscalable petabyte monster.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'DB Schema & Graph Sharding (Posts, Follows, Likes)',
        timeBudget: '16–26 min',
        interviewerQuestion:
          'How do you shard the Social Graph (`follows`), `posts`, and `likes` tables, and how do you avoid hot-row lock contention when 2 million people Like a viral Reel in 60 seconds?',
        contextClue: 'Think Shard by `user_id` vs `post_id` + Buffered/Sharded Like Counters.',
        options: [
          {
            id: 'opt-a',
            label: 'Shard `posts` & `follows` by `user_id` (using Snowflake `post_id` embedding shard bits for O(1) post lookup). Store individual `likes(post_id, user_id)` sharded by `post_id` for "did I like this?", and buffer total `like_count` increments in Redis/Kafka (flushing batched `+= delta` to DB every few seconds) so a viral post never deadlocks one DB row!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Clean, battle-tested data modeling! Embedding shard ID in Snowflake `post_id` + separating exact per-user like checks from buffered aggregate counts scales cleanly to viral celebrity bursts.',
          },
          {
            id: 'opt-b',
            label: 'Run `UPDATE posts SET like_count = like_count + 1 WHERE post_id = $1` synchronously on every tap.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Works at 50 likes/sec, collapses at 35,000 likes/sec on a viral Reel because all 35,000 transactions serialize on one hot row lock!',
          },
          {
            id: 'opt-c',
            label: 'Recompute `SELECT COUNT(*) FROM likes WHERE post_id = $1` live every time anyone scrolls past a post.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Counting millions of rows live on every scroll view melts the database instantly.',
          },
          {
            id: 'opt-d',
            label: 'Put all 2 billion users and 100 billion posts in one unsharded PostgreSQL instance.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Exceeds single-machine storage, RAM, and write IOPS by orders of magnitude.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'Cursor Pagination & Ranked ML Feed',
        timeBudget: '26–35 min',
        interviewerQuestion:
          'Users scroll infinitely down a personalized ML-ranked Feed (not purely chronological). Why does SQL `OFFSET 10000 LIMIT 20` fail here, and how do you paginate cleanly without showing duplicate posts?',
        contextClue: 'Think Keyset/Cursor pagination + Seen-Posts Bloom Filter / Session Cache.',
        options: [
          {
            id: 'opt-a',
            label: 'Never use `OFFSET` (O(N) scan + drifts when new posts insert!). Use opaque Cursor Pagination (`cursor = base64(score, post_id)` or a short-lived server-side ranked session list in Redis) paired with a compact per-user Seen-Posts Bloom Filter / Ring Buffer so refreshed feeds never repeat posts the user already viewed.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Cursor pagination + compact per-user Seen-Posts Bloom Filter solves both O(1) deep-scroll efficiency and duplicate suppression across ranked refreshes.',
          },
          {
            id: 'opt-b',
            label: 'Use `OFFSET page * 20 LIMIT 20` on PostgreSQL for every infinite scroll request.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              '`OFFSET` forces the DB to scan and discard thousands of rows per page AND causes duplicate/skipped posts whenever new posts arrive at the top.',
          },
          {
            id: 'opt-c',
            label: 'Download all 10,000 feed posts to the phone in one giant JSON response on app launch.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Multi-megabyte startup payload kills time-to-interactive and wastes bandwidth on posts the user never scrolls to.',
          },
          {
            id: 'opt-d',
            label: 'Keep a PostgreSQL table logging every single post ever scrolled past by all 2 billion users forever and `NOT IN (...)` it on every query.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Trillions of seen-impression rows + massive `NOT IN` queries! A compact time-windowed Bloom Filter per user uses just a few KB in Redis.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Thundering Herd on a Viral Celebrity Story',
        timeBudget: '35–45 min',
        interviewerQuestion:
          'Curveball: A celebrity posts a 24-hour Story and sends a Push Notification to 50M fans. The cached Story metadata expires in Redis at T=60s while 500,000 requests/sec hit the exact same key (`story:celeb_99`). How do you stop the Cache Stampede?',
        contextClue: 'Think Request Coalescing (Singleflight), Probabilistic Early Expiration, and L1 Local In-Process Cache.',
        options: [
          {
            id: 'opt-a',
            label: 'Combine three layers: 1) Short 5-second L1 In-Process Cache on API nodes for hot celebrity keys (absorbs 99% before even hitting Redis!), 2) Singleflight / Request Coalescing per node (only 1 DB fetch flies on miss while others await it), and 3) Stale-While-Revalidate / Probabilistic Early Refresh so hot keys refresh in the background before TTL hits zero.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook Staff-level caching resilience! L1 hot-key caching + Singleflight + Stale-While-Revalidate completely immunizes both Redis and PostgreSQL against 500K RPS thundering herds.',
          },
          {
            id: 'opt-b',
            label: 'Let all 500,000 cache-miss requests hit PostgreSQL simultaneously to refill Redis faster.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Instant database collapse (classic Cache Stampede / Thundering Herd)!',
          },
          {
            id: 'opt-c',
            label: 'Remove the TTL completely and cache every single user’s data in Redis forever without eviction.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Stories expire after 24 hours and deleted posts must vanish—infinite caching without invalidation/TTL exhausts RAM and leaks deleted content.',
          },
          {
            id: 'opt-d',
            label: 'Turn off Push Notifications for all users so traffic stays low.',
            points: 2,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Staggering push notification waves helps smooth peaks, yes—but you still need L1 hot-key caching + Singleflight to protect against cache-expiry stampedes.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Hybrid Fan-Out: Async Push for normal accounts (<50K followers) + Pull-on-Read merge for mega-celebrities.',
      'Direct Pre-Signed S3 uploads -> Async Enqueue transcoding (AVIF + HLS adaptive ladder) -> Global Edge CDN.',
      'Buffered Redis/Kafka batched Like/View counters to prevent viral hot-row DB lock storms.',
      'Cursor pagination + compact per-user Seen-Posts Bloom Filter for duplicate-free ranked infinite scroll.',
      'L1 local hot-key cache + Singleflight coalescing + Stale-While-Revalidate to defeat viral Cache Stampedes.',
    ],
  },

  {
    id: 'mock-bookmyshow',
    title: 'Design BookMyShow / Ticketmaster Stadium Concert Ticketing',
    shortTitle: 'BookMyShow / Ticketmaster',
    companyStyle: 'High-Contention E-Commerce · Zero Double-Booking',
    difficulty: 'Senior (L5)',
    durationMinutes: 45,
    relatedBlueprintId: 'bookmyshow-ticketing',
    openingPrompt:
      'Design BookMyShow / Ticketmaster for a mega-concert (60,000 stadium seats, 1 million fans waiting at 12:00 PM drop time). Users select up to 6 adjacent seats on an interactive seat map, hold them for 10 minutes while paying, and receive tamper-proof QR tickets.',
    whiteboardHints: [
      'Waiting Room FIFO Drop Gate protects checkout from 1M simultaneous fans.',
      'All-or-Nothing Atomic Multi-Seat Lock (`WHERE status=AVAILABLE OR locked_until < NOW()`) + `lock_token` fencing.',
      'Live seat-map updates via Redis Hash + WebSocket diffs (decoupled from ACID write DB).',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Surviving the 12:00 PM Drop Surge',
        timeBudget: '0–7 min',
        interviewerQuestion:
          'At 12:00:00 PM, 1 million fans refresh the concert page at once. What goes right at the edge to keep your booking servers upright and fair?',
        contextClue: 'Think Edge Virtual Waiting Room Queue + Signed Admission Token + Bot Defense.',
        options: [
          {
            id: 'opt-a',
            label: 'Place a CDN/Edge Virtual Waiting Room (backed by Redis/Kafka FIFO queue + bot/CAPTCHA verification) that admits users in controlled waves (e.g., 5,000/min) with a short-lived signed JWT `admission_token`, while serving the venue static layout from CDN.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact Ticketmaster/BookMyShow production pattern! Metering admission via signed Edge tokens turns an uncontrolled 1M-user DDoS into a smooth, fair 5K/min funnel.',
          },
          {
            id: 'opt-b',
            label: 'Let all 1 million users hit the SQL `show_seats` table simultaneously and hope auto-scaling spins up enough EC2 instances in 2 seconds.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'EC2 auto-scaling takes minutes and adding stateless app servers only slams the database harder!',
          },
          {
            id: 'opt-c',
            label: 'Randomly drop 95% of requests with HTTP 500 error screens.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Returning raw 500 errors makes users hammer F5 even faster, amplifying the storm and ruining brand trust.',
          },
          {
            id: 'opt-d',
            label: 'Disable seat selection and email tickets manually a week later.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Violates the core interactive seat-map requirement.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'All-or-Nothing Multi-Seat Locking',
        timeBudget: '7–16 min',
        interviewerQuestion:
          'User A clicks 4 adjacent seats (`A1, A2, A3, A4`) at the exact same millisecond User B clicks (`A3, A4, A5, A6`). How do you guarantee ZERO partial locks and ZERO deadlocks?',
        contextClue: 'Think sorted seat IDs + single atomic ACID UPDATE checking returned row count.',
        options: [
          {
            id: 'opt-a',
            label: 'Inside a single ACID transaction on the `show_id` shard, sort `seat_ids` deterministically (prevents deadlocks!) and run one atomic `UPDATE show_seats SET status=\'LOCKED\', lock_token=$tok, locked_until=NOW()+\'10m\' WHERE show_id=$1 AND seat_id = ANY($seats) AND (status=\'AVAILABLE\' OR (status=\'LOCKED\' AND locked_until < NOW())) RETURNING seat_id`. Commit ONLY if `returned_count == 4`, else ROLLBACK!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook concurrency engineering! Deterministic ID sorting eliminates deadlocks, lazy TTL (`locked_until < NOW()`) means expired locks are reclaimable instantly even if a background sweeper lags, and verifying exact row count guarantees All-or-Nothing.',
          },
          {
            id: 'opt-b',
            label: 'Lock each of the 4 seats in 4 separate HTTP calls so User A ends up holding 2 seats and User B holds 2 seats.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Partial seat locks leave families split apart and create deadlocks when seats are locked in opposite orders.',
          },
          {
            id: 'opt-c',
            label: 'Check availability in Java/Node memory with `SELECT`, wait 50ms, then run `UPDATE` with no `WHERE` version/status guard.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Classic Check-Then-Act (TOCTOU) race condition—both User A and User B read AVAILABLE and both overwrite the seat!',
          },
          {
            id: 'opt-d',
            label: 'Lock the entire 60,000-seat stadium table (`LOCK TABLE show_seats`) during every user’s checkout.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Table-wide locks serialize all 60,000 seats down to 1 user at a time instead of allowing independent sections to book concurrently.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Live Seat-Map Read Scaling',
        timeBudget: '16–24 min',
        interviewerQuestion:
          '200,000 admitted fans are staring at the live 60,000-seat stadium map. How do you show seats turning grey in real time without running 200K/s `SELECT * FROM show_seats` queries on PostgreSQL?',
        contextClue: 'Think Redis Hash/Bitset per show + WebSocket delta broadcasts.',
        options: [
          {
            id: 'opt-a',
            label: 'Maintain a Redis Hash/Bitset (`show:{id}:seat_states`, ~15KB for 60K seats!) for <2ms initial seat-map snapshots, and broadcast compact seat-state diffs (`seat A1 -> LOCKED`) via WebSockets/SSE whenever DB lock/commit events publish through Kafka/Redis PubSub.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Ultra-clean read/write separation! Serving 15KB bitsets/hashes from Redis + pushing tiny WebSocket diffs absorbs 200K/s map viewers effortlessly while keeping PostgreSQL strictly for ACID writes.',
          },
          {
            id: 'opt-b',
            label: 'Have every browser re-query PostgreSQL `SELECT * FROM show_seats` every 2 seconds.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '100K full 60,000-row queries per second melts PostgreSQL immediately.',
          },
          {
            id: 'opt-c',
            label: 'Cache the seat map in CDN for 10 minutes with no updates.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'During a hot drop, 90% of seats sell out in 2 minutes—a 10-minute stale map forces endless frustrating "Seat already taken" checkout errors.',
          },
          {
            id: 'opt-d',
            label: 'Stream a live 1080p video feed of the stadium seat map to every user.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Massive bandwidth waste and non-interactive!',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB Sharding & Tamper-Proof QR Ticket Issuance',
        timeBudget: '24–34 min',
        interviewerQuestion:
          'How do you shard the booking database across thousands of cities/shows, AND how do you verify QR tickets at stadium entry gates even if venue Wi-Fi goes down?',
        contextClue: 'Think `show_id` sharding + Asymmetric Ed25519 signed QR payload (offline verifiable!).',
        options: [
          {
            id: 'opt-a',
            label: 'Shard `show_seats` and `bookings` by `show_id` so every multi-seat lock & commit stays single-shard ACID. Sign each QR ticket payload `(ticket_id, show_id, seat_id, exp)` with an asymmetric Ed25519 private key so stadium gate scanners verify cryptographic authenticity offline using the public key + local Redis/SQLite scanned-ticket dedupe set!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Brilliant real-world detail! Single-shard `show_id` keeps seat ACID blazing fast, and Ed25519-signed QR codes + local gate dedupe survive stadium Wi-Fi outages while blocking forged screenshots.',
          },
          {
            id: 'opt-b',
            label: 'Shard `show_seats` by `seat_id` so Row A is on Shard 1 and Row B is on Shard 2.',
            points: 4,
            signal: 'Red Flag',
            interviewerFeedback:
              'Cross-shard multi-seat locks force distributed 2PC! Always co-locate all seats of a show on the same `show_id` shard.',
          },
          {
            id: 'opt-c',
            label: 'Encode only a sequential integer (`ticket_id=10042`) in the QR code with no signature.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Anyone can forge QR codes for `10043, 10044...` and walk into the concert free!',
          },
          {
            id: 'opt-d',
            label: 'Require every gate scanner to run a slow full-table scan on the central cloud DB with no offline fallback.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'One venue fiber cut freezes 60,000 fans outside the stadium gates!',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Abandoned Carts & Delayed Release',
        timeBudget: '34–45 min',
        interviewerQuestion:
          'Curveball: 10,000 scalper bots lock seats and abandon checkout right before paying. How do you ensure those seats immediately become green on everyone’s seat map at minute 10:00 AND stop late webhooks from double-booking?',
        contextClue: 'Combine Lazy SQL TTL check + Delayed Release Queue (for real-time UI refresh) + `lock_token` check on payment webhook.',
        options: [
          {
            id: 'opt-a',
            label: 'Pair TWO mechanisms: 1) Lazy Expiry in SQL (`locked_until < NOW()`) guarantees seats are bookable at second 600.001 even if workers lag; 2) Delayed Expiry Queue (Redis ZSET / SQS Delay) wakes at T+10m to flip Redis seat-map cache back to AVAILABLE and push WebSocket green-seat diffs; 3) Payment webhook strictly checks `WHERE lock_token = $token`, auto-refunding if expired.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Watertight design! Lazy SQL expiry guarantees correctness, Delayed Queue keeps the live UI fresh, and `lock_token` fencing guarantees zero late-webhook double-bookings.',
          },
          {
            id: 'opt-b',
            label: 'Rely solely on a nightly cron job at 2:00 AM to release abandoned locks.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Abandoned seats sit dead all day while real fans see "Sold Out"!',
          },
          {
            id: 'opt-c',
            label: 'Trust the user’s browser `window.onbeforeunload` event to call `/unlock-seats`.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Killed apps, lost Wi-Fi, and malicious bots never fire `onbeforeunload`! Server-side TTL is mandatory.',
          },
          {
            id: 'opt-d',
            label: 'Auto-charge the user’s card the instant they click a seat on the map.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Illegal without explicit checkout consent and card CVV/3DS confirmation.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Edge Virtual Waiting Room (FIFO Queue + signed admission token) to throttle 1M-user drops safely.',
      'All-or-Nothing sorted multi-seat ACID lock on `show_id` shard with lazy `locked_until < NOW()` check.',
      'Redis Hash/Bitset seat map + WebSocket delta diffs separating 200K/s reads from ACID writes.',
      'Delayed Expiry Queue for live green-seat UI refresh + `lock_token` fencing on payment webhook (auto-refund on late arrival).',
      'Asymmetric Ed25519-signed QR tickets verifiable offline at stadium gates.',
    ],
  },

  {
    id: 'mock-internet-www',
    title: 'Trace & Design "What Happens When You Type www.com?" at Global Scale',
    shortTitle: 'Internet & www.com Architecture',
    companyStyle: 'Foundational Infrastructure · Meta / Google / Cloudflare',
    difficulty: 'Senior (L5)',
    durationMinutes: 45,
    relatedBlueprintId: 'internet-www-end-to-end',
    openingPrompt:
      'Classic systems architecture interview: Walk me end-to-end through what happens from the microsecond a user presses Enter on `https://www.com` to pixels painting on screen—AND how you scale DNS, Anycast BGP, TLS, CDN, L4/L7 Load Balancers, and origin databases for 50M global RPS.',
    whiteboardHints: [
      'DNS Hierarchy: Browser -> OS -> Recursive Resolver -> Root -> `.com` TLD -> Authoritative NS -> Anycast IP.',
      'Transport: TCP 3-Way Handshake + TLS 1.3 (1-RTT) or HTTP/3 QUIC (0-RTT over UDP).',
      'Edge-to-Origin: BGP Anycast CDN PoP -> L4 Maglev/ECMP -> L7 Envoy -> App Pool -> Read/Write DB.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'DNS Resolution & Global Geo-Routing',
        timeBudget: '0–8 min',
        interviewerQuestion:
          'How does `www.com` resolve to the closest healthy Edge Data Center in <20ms, and what happens if your Frankfurt Edge PoP catches fire?',
        contextClue: 'Think Hierarchical DNS Caching + BGP Anycast IP announcements.',
        options: [
          {
            id: 'opt-a',
            label: 'Check Browser/OS cache -> Recursive Resolver (1.1.1.1/8.8.8.8) -> Root -> `.com` TLD -> Authoritative DNS returns an Anycast IP (with short 60s TTL). BGP Anycast announces that same IP from 300+ global Edge PoPs—routers automatically send users to the nearest PoP, and if Frankfurt fails, BGP withdraws its route in seconds and traffic shifts seamlessly to Amsterdam/London!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Explaining BOTH hierarchical DNS resolution AND how BGP Anycast provides instant sub-second failover (without waiting on stubborn ISP DNS TTL caches!) is a hallmark Staff insight.',
          },
          {
            id: 'opt-b',
            label: 'Hardcode one single Virginia server IP inside every user’s browser with a 30-day DNS TTL.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              '30-day TTL makes failover impossible for a month, and users in Mumbai/Sydney suffer 250ms+ round-trip latency to Virginia.',
          },
          {
            id: 'opt-c',
            label: 'Browser directly broadcasts an ARP packet across the whole internet asking "Who is www.com?"',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'ARP only works within a local L2 LAN subnet—routing across the global internet relies on DNS + IP/BGP.',
          },
          {
            id: 'opt-d',
            label: 'Skip DNS caching completely and query the 13 Root DNS servers on every single image/CSS sub-request.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Multi-level DNS caching (Browser, OS, ISP Resolver) is what makes the global internet scale.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'Transport & Encryption (TLS 1.3 vs HTTP/3 QUIC)',
        timeBudget: '8–16 min',
        interviewerQuestion:
          'On high-latency mobile networks, TCP + TLS 1.2 took 3–4 full round trips before sending a single byte of HTML, and 1 dropped packet froze every parallel HTTP/2 stream. How does HTTP/3 (QUIC) fix both?',
        contextClue: 'Think UDP-based QUIC integrating TLS 1.3 (1-RTT / 0-RTT) + independent stream recovery + Connection ID migration.',
        options: [
          {
            id: 'opt-a',
            label: 'HTTP/3 runs over QUIC (UDP) combining transport + TLS 1.3 handshake into 1-RTT (0-RTT on repeat visits!), isolates packet loss to the single affected stream (eliminating TCP Head-of-Line blocking), and uses a Connection ID so switching from Home Wi-Fi to 5G never drops the connection!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Crystal-clear networking mastery! Covering 1-RTT/0-RTT handshake fusion, stream-level loss isolation (fixing TCP HoL blocking), and seamless Wi-Fi->5G Connection ID migration hits 10/10.',
          },
          {
            id: 'opt-b',
            label: 'HTTP/3 disables encryption (plain HTTP) so no handshake is required.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'QUIC mandates TLS 1.3 encryption on EVERY connection—security is built into the transport layer!',
          },
          {
            id: 'opt-c',
            label: 'HTTP/3 opens 100 separate TCP connections per webpage to avoid Head-of-Line blocking.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Opening 100 TCP sockets wastes memory and causes severe congestion collapse; QUIC multiplexes independent streams over ONE UDP connection.',
          },
          {
            id: 'opt-d',
            label: 'HTTP/3 forces every packet to wait for manual browser JavaScript acknowledgments.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'QUIC handles congestion control and stream ACKs natively in the transport stack.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Edge Load Balancing (L4 Maglev/ECMP -> L7 Envoy)',
        timeBudget: '16–25 min',
        interviewerQuestion:
          'At 50M RPS, a single L7 reverse proxy cannot terminate all TLS connections. How do hyperscalers layer L4 and L7 Load Balancers inside a PoP without breaking active TCP streams when an L7 node restarts?',
        contextClue: 'Think ECMP Router -> L4 Consistent-Hashing LB (Maglev/Katran) -> L7 Envoy/Nginx Fleet.',
        options: [
          {
            id: 'opt-a',
            label: 'Two-tier edge: BGP ECMP routers spray packets across stateless L4 Load Balancers (Maglev/Katran eBPF) using 5-tuple Consistent Hashing so all packets of a TCP flow land on the same L7 Envoy proxy—and if an L7 node dies, Maglev’s permutation table disrupts <1% of existing flows while L7 terminates TLS, enforces WAF/rate limits, and routes by HTTP path.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact Google/Cloudflare edge architecture! Pairing ECMP -> L4 Consistent-Hashing (Maglev/eBPF) -> L7 Envoy gives horizontal linear scaling with minimal connection churn.',
          },
          {
            id: 'opt-b',
            label: 'Route all 50M RPS through a single vertical Nginx server on one machine.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'A single NIC/CPU caps out far below 50M TLS RPS and is a catastrophic single point of failure.',
          },
          {
            id: 'opt-c',
            label: 'Use random per-packet routing directly to L7 proxies without flow affinity.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'TCP/TLS state lives on a specific L7 proxy—randomly spraying packets of the same TCP connection to different L7 nodes breaks every connection immediately!',
          },
          {
            id: 'opt-d',
            label: 'Terminate TLS inside PostgreSQL directly so you do not need any load balancers.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Exposes your database directly to the public internet and melts DB CPUs with TLS handshakes.',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'CDN Caching, Origin Shield & Browser Critical Rendering Path',
        timeBudget: '25–35 min',
        interviewerQuestion:
          'Static JS/CSS/images are cached at 300 Edge PoPs, and personalized HTML comes from Origin. How do you prevent 300 Edge PoPs from all hammering Origin simultaneously on a cache miss, AND how do you make the browser paint First Contentful Paint (FCP) in <500ms?',
        contextClue: 'Think Origin Shield + Content-Hashed immutable assets (`Cache-Control: immutable`) + Critical CSS / Streaming SSR.',
        options: [
          {
            id: 'opt-a',
            label: 'Insert a Regional Origin Shield tier between the 300 Edge PoPs and Origin (collapsing 300 misses into 1 origin fetch!), serve content-hashed static bundles (`app.9f3a.js`) with `Cache-Control: public, max-age=31536000, immutable`, and stream SSR HTML with inline critical CSS + `defer` JS so the browser constructs DOM/CSSOM and paints without render-blocking waits.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Full-stack Staff mastery from Edge PoP to browser rendering engine! Origin Shield + immutable hashed assets + non-blocking streaming SSR slashes both origin load and FCP.',
          },
          {
            id: 'opt-b',
            label: 'Disable CDN caching completely (`Cache-Control: no-store`) for all images, fonts, and JavaScript bundles.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Sends 100% of static byte volume across oceans to your origin servers.',
          },
          {
            id: 'opt-c',
            label: 'Put synchronous blocking `<script>` tags for 8MB of JavaScript at the top of `<head>`.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              'Blocks HTML parsing and leaves the user staring at a blank white screen for seconds!',
          },
          {
            id: 'opt-d',
            label: 'Cache private user account dashboard HTML (`Cache-Control: public`) on shared Edge CDN nodes.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Severe security breach! User B receives User A’s private logged-in HTML from the shared CDN cache!',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: 10 Tbps Volumetric DDoS Attack on www.com',
        timeBudget: '35–45 min',
        interviewerQuestion:
          'Curveball: A botnet launches a combined 10 Tbps SYN-flood + HTTP/2 Rapid Reset attack against `www.com`. How does your infrastructure absorb it without kicking off real users?',
        contextClue: 'Think BGP Anycast absorption + eBPF/XDP SYN-cookies at NIC driver + L7 Adaptive Rate Limiting.',
        options: [
          {
            id: 'opt-a',
            label: 'Multi-layer defense: 1) BGP Anycast diffuses the 10 Tbps attack across 300+ global PoPs instead of 1 data center; 2) eBPF/XDP drops malformed UDP/SYN floods right at the NIC driver using stateless SYN-cookies (zero kernel socket RAM spent!); 3) L7 Edge enforces HTTP/2 stream-reset limits + TLS JA3/JA4 fingerprint challenges so legitimate users pass untouched.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Cloudflare-level infrastructure defense! Combining Anycast geographic dispersion + eBPF/XDP stateless SYN-cookies + L7 behavioral challenges keeps `www.com` rock-solid under 10 Tbps attacks.',
          },
          {
            id: 'opt-b',
            label: 'Let all 10 Tbps of packets reach your application Node.js/Spring Boot servers and inspect them in an Express middleware.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Your origin NICs and kernel socket tables will die 10,000x before a single packet reaches Express middleware!',
          },
          {
            id: 'opt-c',
            label: 'Shut down DNS for `www.com` for 6 hours until the attackers get bored.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'You just completed the attacker’s DDoS for them!',
          },
          {
            id: 'opt-d',
            label: 'Block every IP address outside a single country permanently.',
            points: 4,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Blocks millions of legitimate global users and still fails against domestic botnet nodes.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Hierarchical DNS caching -> BGP Anycast IP for closest PoP routing + sub-second failover.',
      'HTTP/3 over QUIC (UDP + TLS 1.3): 1-RTT/0-RTT handshake, stream-isolated loss recovery, Connection ID Wi-Fi->5G migration.',
      'Two-tier Edge LB: ECMP -> L4 Consistent-Hashing (Maglev/eBPF) -> L7 Envoy/Nginx TLS + WAF.',
      'Regional Origin Shield + content-hashed immutable CDN assets + non-blocking streaming SSR critical rendering path.',
      'DDoS resilience: Anycast dispersion + eBPF/XDP stateless SYN-cookies + L7 adaptive fingerprinting.',
    ],
  },

  {
    id: 'mock-telecom-5g-voip',
    title: 'Design a Global Telecom Voice/Video Calling & 5G Core Signaling System',
    shortTitle: 'Telecom 5G & VoIP Calling',
    companyStyle: 'Real-Time Media · Zoom / WhatsApp Call / 5G Telecom',
    difficulty: 'Staff / Principal (L6+)',
    durationMinutes: 45,
    relatedBlueprintId: 'telecommunication-5g-voip',
    openingPrompt:
      'Design a global real-time voice & video calling system supporting 1:1 VoIP calls, 50-person MS Teams/Zoom meetings, sub-150ms mouth-to-ear latency, NAT traversal, and Telecom 5G Control-vs-User Plane separation.',
    whiteboardHints: [
      'Separate Control Plane (SIP / WebSocket signaling: INVITE/200 OK/BYE) from Media Plane (UDP RTP/SRTP/WebRTC).',
      'NAT Traversal: ICE -> STUN (discover public IP) -> TURN Relay fallback (~15% corporate firewalls).',
      'Group calls: SFU (Selective Forwarding Unit) + Simulcast/SVC instead of N^2 peer mesh.',
    ],
    phases: [
      {
        phaseNumber: 1,
        phaseName: 'Control Plane vs Media Plane & TCP vs UDP',
        timeBudget: '0–8 min',
        interviewerQuestion:
          'Why do Telecom 5G Cores (CUPS) and VoIP systems strictly separate Call Signaling from Voice/Video Media, and why MUST real-time voice run over UDP (RTP/SRTP) instead of TCP?',
        contextClue: 'Think reliable signaling vs real-time stale-packet drop (TCP retransmission kills live voice!).',
        options: [
          {
            id: 'opt-a',
            label: 'Control Plane (SIP / WebSocket over TCP/TLS) needs 100% reliable ordered delivery for call setup (`INVITE -> RINGING -> 200 OK -> BYE`) & billing CDRs. Media Plane (SRTP over UDP) must NEVER wait for TCP retransmissions—a voice packet arriving 500ms late is useless and causes robotic stalls; better to drop it and use Opus Forward Error Correction (FEC) + Jitter Buffer!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Spot on! Separating reliable Control Plane from low-latency UDP Media Plane (with Opus FEC & adaptive Jitter Buffer) is the foundational rule of every telecom & WebRTC stack.',
          },
          {
            id: 'opt-b',
            label: 'Send live audio packets over HTTP/1.1 REST POST requests with automatic TCP retries so no audio byte is ever lost.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'TCP retransmission + head-of-line blocking introduces 1–3 second audio freezes whenever 1% packet loss occurs!',
          },
          {
            id: 'opt-c',
            label: 'Route all voice audio through the PostgreSQL billing database before forwarding to the callee.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Only call metadata (CDR start/end timestamps) touches databases—live media stays on dedicated UDP Media/UPF planes.',
          },
          {
            id: 'opt-d',
            label: 'Use UDP for billing records and TCP for live voice audio.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Exactly backwards! Billing/Signaling needs reliable delivery; live voice needs low-latency UDP.',
          },
        ],
      },
      {
        phaseNumber: 2,
        phaseName: 'NAT Traversal (ICE, STUN & TURN)',
        timeBudget: '8–16 min',
        interviewerQuestion:
          'Both callers sit behind home Wi-Fi routers (NAT) or strict corporate firewalls—neither device knows its public IP:Port. How do they establish a direct media stream, and what happens when a symmetric corporate firewall blocks P2P?',
        contextClue: 'Think ICE candidate gathering via STUN + TURN Relay fallback.',
        options: [
          {
            id: 'opt-a',
            label: 'Run ICE (Interactive Connectivity Establishment): clients query lightweight STUN servers to discover their public NAT-mapped IP:Port and exchange SDP candidates over the Signaling server for direct P2P (~85% of 1:1 calls). For strict symmetric NAT/firewalls (~15%), fall back seamlessly to regional TURN Relay servers over UDP/443 or TLS/443!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Textbook WebRTC/VoIP networking! STUN keeps relay bandwidth cost low for 85% of calls while global Anycast TURN servers guarantee ~99.9% call connectability behind strict enterprise firewalls.',
          },
          {
            id: 'opt-b',
            label: 'Ask every user to log into their home Wi-Fi router and manually configure Port Forwarding before making a call.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Completely unusable for consumers and impossible on cellular carrier-grade NAT!',
          },
          {
            id: 'opt-c',
            label: 'Proxy 100% of all 1:1 voice calls through a single central server in US-East.',
            points: 4,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Two callers in Bangalore routing voice through Virginia adds 300ms+ round-trip latency and massive egress cost. Use P2P via STUN or regional Edge TURN PoPs.',
          },
          {
            id: 'opt-d',
            label: 'Only allow calls when both phones are connected to the same Wi-Fi network.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Defeats the purpose of a global telecom/calling system.',
          },
        ],
      },
      {
        phaseNumber: 3,
        phaseName: 'Scaling 50-Person Video Meetings (Mesh vs MCU vs SFU)',
        timeBudget: '16–26 min',
        interviewerQuestion:
          'In a 50-person MS Teams / Zoom meeting, peer-to-peer Mesh requires every laptop to upload 49 video streams (100 Mbps uplink -> instant melt!). Compare MCU vs SFU with Simulcast.',
        contextClue: 'Think Selective Forwarding Unit (SFU) forwarding encoded streams without server-side video re-encoding.',
        options: [
          {
            id: 'opt-a',
            label: 'Use an SFU (Selective Forwarding Unit) + Simulcast/SVC! Each participant uploads just ONE multi-layer stream (180p/360p/720p) to the nearest Edge SFU; the SFU inspects RTP headers (no expensive server-side video decoding/transcoding!) and selectively forwards 720p for the active speaker + 180p thumbnails for others based on each viewer’s bandwidth.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Exact Zoom/Teams/Google Meet architecture! SFU + Simulcast cuts server CPU 10–20x compared to MCU video mixing, preserves End-to-End Encryption (SFrame), and adapts cleanly to weak mobile links.',
          },
          {
            id: 'opt-b',
            label: 'Use Full P2P Mesh so all 50 laptops connect directly to all 49 other laptops.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '50 * 49 = 2,450 streams; every participant’s home upload bandwidth and CPU collapses beyond ~4–6 peers.',
          },
          {
            id: 'opt-c',
            label: 'Use an MCU that decodes, composites, and re-encodes 50 separate custom HD video layouts on server CPUs for every meeting.',
            points: 10,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'MCUs work for legacy SIP hardware, but server-side decode/re-encode burns massive GPU/CPU cost, adds latency, and breaks E2EE. SFU + Simulcast is the modern standard.',
          },
          {
            id: 'opt-d',
            label: 'Record each speaker into MP4 files on S3 and poll S3 every 5 seconds.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              '5–10 seconds of latency makes interactive conversation completely impossible!',
          },
        ],
      },
      {
        phaseNumber: 4,
        phaseName: 'DB-Level Telecom Registry (HSS/UDM) & CDR Billing Ledger',
        timeBudget: '26–35 min',
        interviewerQuestion:
          'How do you store subscriber routing state (5G UDM / SIP Registrar) for <10ms call setup AND persist billions of Call Detail Records (CDRs) for real-time prepaid balance cut-off and telecom regulatory compliance?',
        contextClue: 'Think geo-replicated low-latency KV/SQL subscriber registry + Kafka CDR stream -> ClickHouse/Postgres + real-time OCS quota slices.',
        options: [
          {
            id: 'opt-a',
            label: '1) Subscriber/SIP Registry in geo-replicated in-memory KV/Aerospike/Redis (`msisdn/user_id -> active_sip_proxy, roaming_cell`) for <3ms lookup. 2) Online Charging System (OCS) reserves prepaid credit in 60-second slices via atomic Redis/DB counters (terminating call cleanly if balance hits 0). 3) Stream immutable CDRs (`call_id, start_ts, end_ts, duration_ms, codec_mos`) via Kafka to ClickHouse/TimescaleDB partitioned by `call_date`.',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Real telecom-grade engineering! Quota slicing in OCS prevents negative prepaid balances without per-second DB locks, and partitioned immutable CDR streams power both billing and QoS monitoring.',
          },
          {
            id: 'opt-b',
            label: 'Decrement the caller’s PostgreSQL balance row every 100 milliseconds during the phone call.',
            points: 2,
            signal: 'Red Flag',
            interviewerFeedback:
              '10 DB write transactions/sec per active call multiplies to tens of millions of writes/sec! Reserve 30–60s quota slices in OCS instead.',
          },
          {
            id: 'opt-c',
            label: 'Store CDR billing records only in ephemeral RAM on the SIP proxy.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Telecom regulators mandate durable CDR retention (often 1–7 years) and losing RAM means losing all revenue!',
          },
          {
            id: 'opt-d',
            label: 'Store all active call routing tables in a static JSON file updated once a week.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Mobile users move across cell towers and Wi-Fi networks continuously—routing tables change every second.',
          },
        ],
      },
      {
        phaseNumber: 5,
        phaseName: 'Staff Curveball: Cross-Region Meeting & Mid-Call SFU Node Failure',
        timeBudget: '35–45 min',
        interviewerQuestion:
          'Curveball: A 40-person meeting has 20 people in India and 20 in the US—AND the Mumbai SFU node crashes mid-sentence! How do you minimize cross-ocean latency AND recover the live call in <2 seconds?',
        contextClue: 'Think Cascaded Multi-Region SFUs (1 single backbone stream across the ocean!) + ICE Restart failover.',
        options: [
          {
            id: 'opt-a',
            label: 'Use Cascaded SFUs (Mumbai SFU + Virginia SFU connected over a private low-jitter backbone—carrying each speaker across the ocean ONCE instead of 20x!). If the Mumbai SFU crashes, the Signaling Orchestrator detects missed heartbeats within 1s, assigns a Standby SFU, and triggers an automatic WebRTC `ICE Restart` so clients reconnect seamlessly in <1.5s without users re-dialing!',
            points: 20,
            signal: 'Strong Hire',
            interviewerFeedback:
              'Principal-level real-time media engineering! Cascaded SFUs slash inter-continental bandwidth 20x and reduce jitter, while orchestrated automatic ICE Restart makes mid-call server crashes barely a 1-second blip.',
          },
          {
            id: 'opt-b',
            label: 'Kick all 40 participants out of the meeting and force the host to create a new invite link.',
            points: 4,
            signal: 'Lean / Partial',
            interviewerFeedback:
              'Disruptive UX—modern calling systems recover mid-call SFU crashes automatically via ICE Restart.',
          },
          {
            id: 'opt-c',
            label: 'Have all 20 India participants individually send 20 separate video streams over public internet directly to Virginia.',
            points: 6,
            signal: 'Lean / Partial',
            interviewerFeedback:
              '20x redundant trans-oceanic traffic over jittery public internet degrades video quality sharply compared to Cascaded Edge SFUs.',
          },
          {
            id: 'opt-d',
            label: 'Switch the 40-person video call to SMS text messages.',
            points: 0,
            signal: 'Red Flag',
            interviewerFeedback:
              'Not a valid media failover strategy.',
          },
        ],
      },
    ],
    modelStaffChecklist: [
      'Strict Control Plane (reliable SIP/WS signaling) vs Media Plane (low-latency UDP SRTP + Opus FEC + Jitter Buffer).',
      'ICE + STUN (85% direct P2P) + global Anycast TURN relay fallback (15% symmetric NAT/firewalls).',
      'SFU + Simulcast/SVC for group meetings (no server transcoding, E2EE compatible) + Cascaded SFUs across continents.',
      'In-memory SIP/5G UDM Registry + OCS 60s prepaid quota slicing + Kafka -> ClickHouse partitioned CDR billing ledger.',
      'Automatic Signaling-orchestrated ICE Restart to recover mid-call SFU node crashes in <2 seconds.',
    ],
  },
];
