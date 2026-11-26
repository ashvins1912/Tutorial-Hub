export interface BackendHandbookChapter {
  id: string;
  track?: 'spring-jpa' | 'nodejs-internals' | 'docker-handbook';
  number: string;
  title: string;
  subtitle: string;
  whatItIs: string;
  whyWeNeedIt: string;
  howItWorks: string[];
  formulaOrSpec?: string;
  indianExample: string;
  commonPitfalls: string[];
  keyTakeaways: string[];
  interviewQa: { q: string; a: string }[];
  codeExample?: {
    title: string;
    language: 'java' | 'javascript' | 'typescript';
    code: string;
    contextHint: string;
  };
}

export interface ComparisonRow {
  dimension: string;
  left: string;
  right: string;
}

/* ========================================================================== */
/* TRACK A: SPRING DATA JPA & HIBERNATE COMPLETE GUIDE (NEW MISSING TOPIC)    */
/* ========================================================================== */

export const SPRING_JPA_CHAPTERS: BackendHandbookChapter[] = [
  {
    id: 'jpa-architecture-lifecycle',
    number: '01',
    title: 'JPA vs Hibernate vs ORM, Annotations & Entity Lifecycle',
    subtitle: 'EntityManager · Persistence Context (1st-Level Cache) · 4 Entity States',
    whatItIs:
      'ORM maps Java classes to SQL tables. JPA (Jakarta Persistence API) is the rulebook (interfaces & annotations), Hibernate is the most popular engine implementing JPA, and Spring Data JPA removes 90% of boilerplate code by auto-generating repository queries.',
    whyWeNeedIt:
      'Writing raw JDBC `PreparedStatement` + `ResultSet` loops for 80 database tables is slow and error-prone. Spring Data JPA lets you focus on business logic while keeping full SQL control when needed.',
    howItWorks: [
      'Core Mapping Annotations: `@Entity` marks a class as a DB table, `@Table(name="orders")` sets table name, `@Id` marks primary key, `@GeneratedValue` picks ID generation (`IDENTITY` = MySQL/Postgres auto-increment, `SEQUENCE` = best for PostgreSQL/Oracle batch inserts, `AUTO` = provider choice, `TABLE` = legacy/slow).',
      'Persistence Context (1st-Level Cache): Every active transaction gets its own Persistence Context (`EntityManager`). Fetching Order #42 twice inside the same transaction hits RAM the 2nd time—zero extra SQL!',
      '4 Entity States: 1) Transient (`new Order()` — plain Java object, not in DB). 2) Managed (attached to Persistence Context — Hibernate Dirty Checking auto-generates UPDATE SQL on commit without calling `save()`!). 3) Detached (transaction closed — changes are NOT tracked). 4) Removed (marked for DELETE on commit).',
    ],
    formulaOrSpec: 'Java Object (Transient) ─persist()→ Managed (Dirty Checked) ─close()→ Detached  |  Spring Data JPA → JPA Spec → Hibernate ORM → JDBC → SQL DB',
    indianExample:
      'Think of JPA as SEBI rules, Hibernate as Zerodha implementing those rules, and Spring Data JPA as a 1-click SIP button that handles repetitive paperwork automatically.',
    commonPitfalls: [
      'Using `GenerationType.IDENTITY` disables Hibernate JDBC batch inserts—prefer `SEQUENCE` on PostgreSQL/Oracle for bulk writes.',
      'Forgetting a no-arg constructor (`protected Order() {}`) on `@Entity` classes causes Hibernate instantiation failure.',
    ],
    keyTakeaways: [
      'Inside a `@Transactional` method, mutating a Managed entity automatically persists on commit via Dirty Checking.',
      '1st-Level Cache is per-transaction (always on); 2nd-Level Cache (Ehcache/Redis) is shared across sessions (opt-in).',
    ],
    interviewQa: [
      {
        q: 'What is Dirty Checking in Hibernate?',
        a: 'Hibernate keeps a snapshot of every Managed entity when loaded into the Persistence Context. Before flushing/committing the transaction, it compares current field values against the snapshot and automatically fires an UPDATE only for changed entities.',
      },
      {
        q: 'Difference between JPA, Hibernate, and Spring Data JPA?',
        a: 'JPA is the specification (standard interfaces), Hibernate is the ORM implementation that generates SQL, and Spring Data JPA is a higher-level Spring abstraction providing `JpaRepository` so you avoid writing `EntityManager` boilerplate.',
      },
    ],
  },
  {
    id: 'jpa-relationships-queries',
    number: '02',
    title: 'Relationships (1:1, 1:N, N:1, N:N), JpaRepository, JPQL & Pagination',
    subtitle: 'mappedBy · @JoinColumn · Derived Queries · JPQL vs Native SQL · Pageable',
    whatItIs:
      'JPA maps foreign-key table joins onto clean Java references and gives you three ways to query data: Derived Method Names, JPQL (object-oriented SQL), and Native SQL—all supporting built-in `Pageable` pagination.',
    whyWeNeedIt:
      'Wrong relationship ownership (`mappedBy`) silently creates extra join tables or breaks cascades, and fetching 50,000 rows without `Pageable` crashes your Spring Boot heap with OutOfMemoryError.',
    howItWorks: [
      'Relationships & Ownership: `@ManyToOne` (foreign key lives on the Many side via `@JoinColumn`), `@OneToMany(mappedBy="customer")` (inverse side—always put `mappedBy` so Hibernate does NOT create a useless 3rd join table!), `@OneToOne`, and `@ManyToMany` with `@JoinTable`.',
      'Repository Hierarchy: `Repository → CrudRepository → ListCrudRepository & PagingAndSortingRepository → JpaRepository` (adds flush, batch delete, pagination).',
      '3 Query Modes: 1) Derived Queries (`findByCityAndPriceLessThanOrderByPriceAsc`). 2) JPQL (`@Query("SELECT o FROM Order o WHERE o.status = :st")` — uses Entity class & field names, DB-portable). 3) Native SQL (`nativeQuery = true` — raw Postgres/MySQL syntax).',
      'Write Queries: Any custom UPDATE/DELETE `@Query` MUST carry `@Modifying` + `@Transactional` (and `clearAutomatically = true` to avoid stale 1st-level cache).',
      'Pagination & Sorting: Pass `PageRequest.of(page, size, Sort.by("createdAt").descending())` to return `Page<Order>` (includes total count) or `Slice<Order>` (skips expensive `COUNT(*)` query—faster for infinite scroll!).',
    ],
    formulaOrSpec: 'Default Fetch Types: @ManyToOne & @OneToOne = EAGER (change to LAZY!)  |  @OneToMany & @ManyToMany = LAZY',
    indianExample:
      'In a Swiggy/Zomato order service, `Customer` (1) has many `Orders` (N). `Order` owns `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id")`, and "My Orders" API uses `Slice<Order>` with `PageRequest.of(0, 20)` so scrolling stays snappy.',
    commonPitfalls: [
      'Leaving `@ManyToOne` at its default `FetchType.EAGER` loads parent tables on every single query even when you only need the child ID.',
      'Printing entities with Lombok `@Data` (`toString()`/`equals()`) on bidirectional relationships triggers infinite recursion `StackOverflowError`!',
    ],
    keyTakeaways: [
      'Prefer `Slice<T>` over `Page<T>` when the UI does not need "Page 1 of 438" total counts.',
      'Always set `@ManyToOne(fetch = FetchType.LAZY)` explicitly in production entities.',
    ],
    interviewQa: [
      {
        q: 'What does `mappedBy` do in `@OneToMany`?',
        a: 'It tells Hibernate that the foreign key is already owned and managed by the `@ManyToOne` field on the child entity. Without `mappedBy`, Hibernate creates an unnecessary extra join table.',
      },
      {
        q: 'When should you return `Slice<T>` instead of `Page<T>` from a Spring Data JPA repository?',
        a: '`Page<T>` runs an extra `SELECT COUNT(*)` query across millions of rows to compute total pages, which slows down large tables. Use `Slice<T>` for "Load More" or infinite scroll feeds because it only fetches `size + 1` rows to check whether another page exists.',
      },
    ],
  },
  {
    id: 'jpa-transactions-auditing-inheritance',
    number: '03',
    title: '@Transactional (Propagation & Isolation), Auditing & Inheritance',
    subtitle: 'ACID · REQUIRED vs REQUIRES_NEW · @CreatedDate · SINGLE_TABLE vs JOINED',
    whatItIs:
      '`@Transactional` wraps a service method in an ACID database transaction via a Spring AOP proxy, JPA Auditing auto-fills created/updated timestamps and users, and Inheritance maps Java subclasses to SQL tables.',
    whyWeNeedIt:
      'If debiting a wallet succeeds but recording the order fails, `@Transactional` rolls back both so money never vanishes. Knowing AOP proxy traps prevents silent rollback bugs in production.',
    howItWorks: [
      'Propagation Modes: `REQUIRED` (default — join active transaction or start new one), `REQUIRES_NEW` (suspend outer TX and open a brand-new independent TX — great for saving failure audit logs even if main payment rolls back!), `SUPPORTS`, `NOT_SUPPORTED`, `MANDATORY`.',
      'Rollback Rule (Classic Trap!): By default, Spring ONLY rolls back on unchecked `RuntimeException` / `Error`—NOT on checked `Exception` unless you write `@Transactional(rollbackFor = Exception.class)`.',
      'Isolation Levels: `READ_COMMITTED` (Postgres default — stops Dirty Reads), `REPEATABLE_READ` (MySQL InnoDB default), `SERIALIZABLE` (strictest, slowest).',
      'JPA Auditing: Enable `@EnableJpaAuditing` + `@EntityListeners(AuditingEntityListener.class)` + `@CreatedDate`, `@LastModifiedDate`, `@CreatedBy` (powered by `AuditorAware<String>` reading logged-in user).',
      'Entity Inheritance: `SINGLE_TABLE` (1 table + discriminator column — fastest queries, nullable subtype cols), `JOINED` (normalized parent + child tables — clean schema, needs JOINs), `TABLE_PER_CLASS` (separate table per subclass — slow polymorphic UNIONs).',
    ],
    formulaOrSpec: 'AOP Proxy Rule: Calling a @Transactional method from INSIDE the same class (`this.foo()`) bypasses the proxy and ignores @Transactional!',
    indianExample:
      'During a UPI transfer, `transferFunds()` uses `REQUIRED` so debit + credit succeed or fail together, while `saveAttemptAuditLog()` uses `REQUIRES_NEW` so failed fraud attempts are STILL saved even after the transfer rolls back.',
    commonPitfalls: [
      'Self-invocation (`this.innerTransactionalMethod()`) silently ignores `@Transactional` because the call never passes through the Spring proxy.',
      'Putting `@Transactional` on `private` methods does nothing with standard Spring AOP proxies.',
    ],
    keyTakeaways: [
      'Mark read-only service methods `@Transactional(readOnly = true)` — Hibernate skips Dirty Checking snapshots, cutting CPU & memory!',
      'Use `SINGLE_TABLE` for speed when subclasses share most columns; use `JOINED` when strict NOT NULL normalization matters.',
    ],
    interviewQa: [
      {
        q: 'Why did `@Transactional` fail to roll back in my Spring Boot service?',
        a: 'Three most common reasons: (1) throwing a checked Exception without `rollbackFor = Exception.class`, (2) swallowing the exception in a try-catch block, or (3) calling the annotated method via `this.method()` inside the same class (bypassing the Spring AOP proxy).',
      },
      {
        q: 'Why does `@Transactional(readOnly = true)` improve Spring Boot read performance?',
        a: 'It tells Hibernate to set FlushMode to MANUAL and skip creating Dirty Checking memory snapshots for every loaded entity, reducing JVM heap allocation and CPU work on high-traffic read endpoints.',
      },
    ],
  },
  {
    id: 'jpa-n-plus-one-performance',
    number: '04',
    title: 'Hibernate Performance: Lazy vs Eager & Solving the N+1 Query Problem',
    subtitle: 'JOIN FETCH · @EntityGraph · DTO Projections · Batch Fetching',
    whatItIs:
      'The N+1 Query Problem happens when 1 query fetches N parent records (for example, 100 Orders), and then looping over `order.getItems()` fires 100 separate SQL queries—turning 1 fast query into 101 database round-trips!',
    whyWeNeedIt:
      'N+1 looks fine in local dev with 3 sample rows, then completely melts PostgreSQL in production when 10,000 users open their dashboards.',
    howItWorks: [
      'Spot It Early: Enable SQL logging in dev (`spring.jpa.show-sql=true` or Hibernate statistics) and count how many SELECT statements one HTTP request executes.',
      'Fix 1 — `JOIN FETCH` in JPQL: `SELECT DISTINCT o FROM Order o JOIN FETCH o.items WHERE o.customerId = :cid` loads Orders + Items in ONE single SQL JOIN!',
      'Fix 2 — `@EntityGraph(attributePaths = {"items", "customer"})`: Declaratively loads selected lazy associations on a repository method without rewriting JPQL.',
      'Fix 3 — Batch Fetching (`@BatchSize(size = 50)` or `default_batch_fetch_size: 50`): Converts 100 single queries into just 2 clean `WHERE order_id IN (:batchIds)` queries—essential when combining pagination with collections.',
      'Fix 4 — DTO / Interface Projections: For read-only screens, SELECT only the 4 columns needed into a Java `record` instead of hydrating full heavy `@Entity` graphs.',
    ],
    formulaOrSpec: 'N+1 Bad: 1 + 100 = 101 SQL queries  →  JOIN FETCH / @EntityGraph: 1 SQL query  |  BatchSize(50): 1 + 2 = 3 SQL queries',
    indianExample:
      'An e-commerce Seller Dashboard loading 200 Flipkart orders dropped API latency from 2,400ms (201 SQL queries) down to 35ms (1 query) simply by adding `@EntityGraph(attributePaths = "items")` and a read-only DTO projection.',
    commonPitfalls: [
      'Combining `JOIN FETCH` on a `@OneToMany` collection WITH `Pageable` causes Hibernate to load ALL rows into JVM RAM and paginate in memory (`HHH90003004` warning)! Use two-step ID pagination or `@BatchSize` instead.',
    ],
    keyTakeaways: [
      'Keep associations `LAZY` by default and eagerly fetch ONLY per-use-case via `JOIN FETCH` or `@EntityGraph`.',
      'Always use Java Record DTO projections + `@Transactional(readOnly = true)` for high-traffic read APIs.',
    ],
    interviewQa: [
      {
        q: 'What happens if you use `JOIN FETCH` on a OneToMany list together with `Pageable`?',
        a: 'SQL `LIMIT` applies to joined child rows, not parent rows—so Hibernate fetches the entire result set into application memory and slices pages in RAM. Fix it by fetching paginated parent IDs first, then fetching full entities with `WHERE o.id IN :ids` or using `@BatchSize`.',
      },
      {
        q: 'When should you prefer a Java Record DTO Projection over loading full `@Entity` objects?',
        a: 'Whenever an endpoint is read-only and only needs a subset of columns, such as an order list table. DTO projections select fewer columns over the wire and bypass the Persistence Context completely.',
      },
    ],
    codeExample: {
      title: 'Fixing N+1 Query Problem with @EntityGraph, JOIN FETCH & Read-Only Transaction',
      language: 'java',
      contextHint: 'Spring Data JPA repository eliminating 101 SQL queries down to 1 query safely.',
      code: `public interface OrderRepository extends JpaRepository<Order, Long> {

    // Fix 1: Single SQL query using JPQL JOIN FETCH
    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items WHERE o.customerId = :cid")
    List<Order> findWithItemsByCustomerId(@Param("cid") Long customerId);

    // Fix 2: Clean declarative @EntityGraph (no custom JPQL needed)
    @EntityGraph(attributePaths = {"items", "payment"})
    List<Order> findTop20ByStatusOrderByCreatedAtDesc(String status);
}

@Service
public class OrderReadService {
    private final OrderRepository orderRepo;

    public OrderReadService(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    // Skips Hibernate Dirty Checking snapshots -> lower CPU & RAM
    @Transactional(readOnly = true)
    public List<Order> getCustomerOrdersFast(Long customerId) {
        return orderRepo.findWithItemsByCustomerId(customerId);
    }
}`,
    },
  },
];

/* ========================================================================== */
/* TRACK B: NODE.JS INTERNALS DEEP DIVE                                       */
/* ========================================================================== */

export const NODEJS_INTERNALS_CHAPTERS: BackendHandbookChapter[] = [
  {
    id: 'node-v8-engine',
    number: '01',
    title: 'V8 JavaScript Engine (AST, Ignition, TurboFan, Hidden Classes & Inline Caching)',
    subtitle: 'How Node.js turns dynamic JavaScript into near-native machine code',
    whatItIs:
      'V8 (written in C++) compiles and executes JavaScript inside Node.js using a smart two-tier pipeline: fast startup via the Ignition bytecode interpreter, plus blazing speed via the TurboFan JIT compiler for hot functions.',
    whyWeNeedIt:
      'Understanding how V8 optimizes objects explains why consistent object shapes run 5× faster and why mixing property types randomly triggers costly "de-optimizations".',
    howItWorks: [
      '1. Parser → AST: V8 parses JS source into an Abstract Syntax Tree (AST).',
      '2. Ignition (Bytecode Interpreter): Converts AST into compact bytecode immediately so your Node server boots fast.',
      '3. Profiler + TurboFan (Optimizing JIT Compiler): Watches "hot" functions called thousands of times with steady types and compiles them straight into optimized CPU machine code.',
      '4. Hidden Classes (Shapes / Maps) & Inline Caching (IC): V8 internally assigns a fixed memory layout ("Hidden Class") to objects with identical keys in the same order (`{id, price}`), allowing O(1) direct memory-offset property reads instead of slow dictionary lookups!',
      '5. De-optimization (Bailout): If a hot function expecting integers suddenly gets a string or deletes keys via `delete obj.x`, TurboFan bails back to Ignition bytecode.',
    ],
    formulaOrSpec: 'JS Source → AST → Ignition Bytecode (Fast Start) → Hot Type Feedback → TurboFan Machine Code (Peak Speed)',
    indianExample:
      'Think of Ignition as taking an auto-rickshaw immediately (zero wait), while TurboFan is building a dedicated Metro line along the busiest daily route once V8 sees heavy repeat traffic.',
    commonPitfalls: [
      'Adding object properties in different orders or using `delete obj.prop` breaks V8 Hidden Classes and slows down hot loops.',
    ],
    keyTakeaways: [
      'Initialize all object properties in the constructor in the same order, and set unused fields to `null`/`undefined` instead of `delete`.',
      'V8 executes JS on 1 main thread, while Libuv handles async OS I/O and background thread-pool tasks.',
    ],
    interviewQa: [
      {
        q: 'Why does V8 have both Ignition (interpreter) and TurboFan (JIT compiler)?',
        a: 'Compiling every line upfront with TurboFan would make startup very slow and waste RAM on cold code. Ignition starts running immediately, collects real type feedback, and only compiles genuinely hot paths to native machine code.',
      },
      {
        q: 'How does using `delete obj.field` hurt V8 performance in a hot loop?',
        a: 'Deleting a property breaks the object\'s stable Hidden Class shape and forces V8 to fall back to slow hash-table dictionary mode for property lookups. Setting `obj.field = null` keeps the fast Hidden Class intact.',
      },
    ],
  },
  {
    id: 'node-event-loop-microtasks',
    number: '02',
    title: 'The 6 Event Loop Phases & Microtasks vs Macrotasks Priority',
    subtitle: 'Timers → Pending → Idle → Poll → Check → Close · nextTick > Promise.then',
    whatItIs:
      'The Event Loop (powered by Libuv) is the heartbeat of Node.js. It cycles through 6 ordered phases to run async callbacks, while draining two high-priority Microtask queues between EVERY single step.',
    whyWeNeedIt:
      'Interviewers love Node.js execution-order puzzles (`setTimeout(0)` vs `setImmediate` vs `Promise.then` vs `process.nextTick`), and recursive `process.nextTick` can starve your server\'s I/O completely!',
    howItWorks: [
      '6 Event Loop Phases (Macrotasks): 1) Timers (`setTimeout`, `setInterval`) → 2) Pending Callbacks (OS TCP/system errors) → 3) Idle/Prepare (internal) → 4) Poll (waits for incoming HTTP/DB/FS I/O & runs I/O callbacks) → 5) Check (`setImmediate`) → 6) Close Callbacks (`socket.on("close")`).',
      'Microtasks (Highest Priority — run right after Call Stack empties AND between every phase): First drain ALL `process.nextTick()` callbacks, THEN drain ALL `Promise.then()` / `queueMicrotask()` callbacks.',
      'Inside an I/O callback (like `fs.readFile`), `setImmediate` ALWAYS runs BEFORE `setTimeout(fn, 0)` because Poll goes straight to Check before wrapping back to Timers!',
      'Starvation Warning: Calling `process.nextTick()` recursively in a loop traps Node forever inside the microtask queue—incoming HTTP requests never reach the Poll phase.',
    ],
    formulaOrSpec: 'Sync Call Stack → process.nextTick Queue → Promise / queueMicrotask Queue → Next Event Loop Phase (Timers → Poll → Check → Close)',
    indianExample:
      'Like a hospital reception counter: Sync code is the current patient; `process.nextTick` is a VIP emergency jumping ahead of everyone; `Promise.then` is urgent priority; and regular OPD tokens rotate calmly through the 6 phases.',
    commonPitfalls: [
      'Assuming `setTimeout(fn, 0)` always beats `setImmediate(fn)` at top-level — at top-level their order is non-deterministic, whereas inside an I/O callback `setImmediate` ALWAYS runs first.',
    ],
    keyTakeaways: [
      'Order rule to remember forever: Sync > `process.nextTick` > `Promise.then` > `Timers / Poll / Check (setImmediate)`.',
      'Prefer `setImmediate()` over recursive `process.nextTick()` when breaking up heavy work so I/O stays responsive.',
    ],
    interviewQa: [
      {
        q: 'In what exact order will `console.log`, `setTimeout(0)`, `Promise.resolve().then`, and `process.nextTick` print?',
        a: '1) Synchronous `console.log`, 2) `process.nextTick`, 3) `Promise.then` (microtask), 4) `setTimeout(0)` (Timers macrotask phase).',
      },
      {
        q: 'Why can recursive `process.nextTick()` freeze an Express HTTP server completely?',
        a: 'Node.js drains the entire `nextTick` queue before moving to the next Event Loop phase. If every callback schedules another `nextTick`, the Event Loop never reaches the Poll phase to accept or answer HTTP sockets.',
      },
    ],
    codeExample: {
      title: 'Classic Node.js Event Loop Execution Order & Starvation-Safe Yield',
      language: 'javascript',
      contextHint: 'Exact priority order across Sync, nextTick, Promise microtasks, and I/O Check vs Timers.',
      code: `const fs = require('fs');

console.log('1. Sync Start');

setTimeout(() => console.log('5. Timer (setTimeout 0)'), 0);

Promise.resolve().then(() => console.log('4. Microtask (Promise.then)'));

process.nextTick(() => console.log('3. NextTick (runs before Promise)'));

fs.readFile(__filename, () => {
  // Inside an I/O callback, Check phase ALWAYS precedes next Timers phase
  setTimeout(() => console.log('7. Inside I/O -> setTimeout'), 0);
  setImmediate(() => console.log('6. Inside I/O -> setImmediate FIRST'));
});

console.log('2. Sync End');`,
    },
  },
  {
    id: 'node-libuv-threads-gc',
    number: '03',
    title: 'Libuv Thread Pool, Worker Threads, Generational GC & Event Loop Lag',
    subtitle: 'UV_THREADPOOL_SIZE (4→128) · epoll/kqueue · Scavenge & Mark-Sweep · monitorEventLoopDelay()',
    whatItIs:
      'Node.js is single-threaded ONLY for your JavaScript execution—under the hood, Libuv uses OS async networking (`epoll`/`kqueue`/`IOCP`) plus a C++ Thread Pool (default 4 threads) for blocking disk, crypto, and DNS calls.',
    whyWeNeedIt:
      'Knowing which tasks hit OS async I/O vs the 4-thread Libuv pool vs the main JS thread saves you from freezing 10,000 concurrent users with one `bcrypt.hashSync` or `JSON.parse` on a 50MB file.',
    howItWorks: [
      'Network I/O (HTTP, TCP, Postgres sockets): Does NOT use the Libuv thread pool! Handled directly by OS kernel async event polling (`epoll` on Linux, `kqueue` on macOS, `IOCP` on Windows) — scales to 50,000+ open sockets effortlessly.',
      'Libuv Thread Pool (`UV_THREADPOOL_SIZE`, default 4, max 128): Used for `fs.*` file system calls, `crypto.pbkdf2`/`scrypt`, `zlib` compression, and `dns.lookup`. If 4 heavy `crypto` jobs occupy all 4 threads, the 5th `fs.readFile` waits in queue!',
      'Worker Threads (`worker_threads`): Spawn separate V8 isolates for CPU-heavy JS (image resize, PDF generation, ML inference) so the main Event Loop stays free.',
      'V8 Generational GC: Splits heap into New Space (young short-lived objects cleaned rapidly via Cheney Scavenge copy algorithm) and Old Space (long-lived survivors cleaned via concurrent Mark-Sweep-Compact). Watch for leaks: accidental globals, unclosed `setInterval`, forgotten event listeners, unbounded caches.',
      'Monitoring Lag: Measure Event Loop blocking in production with `perf_hooks.monitorEventLoopDelay()` — if p99 delay exceeds 50ms, something is blocking the main thread!',
    ],
    formulaOrSpec: 'Network I/O → OS epoll/kqueue (0 pool threads)  |  FS/Crypto/DNS/zlib → Libuv Pool (default 4)  |  Heavy JS CPU → Worker Threads',
    indianExample:
      'During a Diwali login rush, 500 users log in at once using `crypto.scrypt`. Raising `UV_THREADPOOL_SIZE=16` on an 8-core Linux server cuts password-hash queueing delay by 4× without blocking incoming HTTP health checks.',
    commonPitfalls: [
      'Using `fs.readFileSync` or complex backtracking RegEx inside an Express route blocks ALL other connected users until it finishes.',
      'Setting `UV_THREADPOOL_SIZE=128` on a 2-vCPU container causes heavy CPU context-switching thrashing—match pool size closely to available cores.',
    ],
    keyTakeaways: [
      'End-to-End HTTP Request Lifecycle: OS TCP accept (`epoll`) → Libuv Poll phase → JS route handler → Async DB query (OS socket) → Microtask/Poll callback → HTTP response flushed back via `epoll`.',
      'Never run synchronous CPU loops on the main Node.js thread—offload to `worker_threads` or a background queue.',
    ],
    interviewQa: [
      {
        q: 'If Node.js is single-threaded, how can it handle 20,000 concurrent HTTP connections?',
        a: 'Only JavaScript execution is single-threaded. Network sockets are delegated directly to the OS kernel via non-blocking `epoll`/`kqueue`, so the main thread spends microseconds routing events instead of sitting idle waiting on I/O.',
      },
      {
        q: 'When should you use Node.js `worker_threads` instead of increasing `UV_THREADPOOL_SIZE`?',
        a: '`UV_THREADPOOL_SIZE` only helps native C++ Libuv operations (`fs`, `crypto`, `zlib`, `dns.lookup`). For heavy JavaScript CPU work such as parsing massive CSVs, image transforms, or JSON compression, use `worker_threads` so each task gets its own V8 thread.',
      },
    ],
  },
];

/* ========================================================================== */
/* TRACK C: DOCKER COMPLETE HANDBOOK                                          */
/* ========================================================================== */

export const DOCKER_VM_VS_CONTAINER: ComparisonRow[] = [
  {
    dimension: 'Everyday Analogy',
    left: 'Virtual Machine = Separate independent houses (each with its own water tank, kitchen & full OS)',
    right: 'Docker Container = Separate locked rooms inside ONE house sharing the host Linux kernel',
  },
  {
    dimension: 'Boot Time',
    left: '30–90 seconds (boots a full Guest OS)',
    right: 'Milliseconds to ~1 second (starts an isolated Linux process)',
  },
  {
    dimension: 'Disk & RAM Footprint',
    left: 'Gigabytes per VM (Guest OS + Hypervisor overhead)',
    right: 'Tens of MBs (only your app + minimal runtime libraries)',
  },
  {
    dimension: 'Isolation Mechanism',
    left: 'Hardware virtualization via Hypervisor (KVM, VMware, Hyper-V)',
    right: 'Linux Kernel Namespaces (visibility) + cgroups (CPU/RAM limits)',
  },
];

export const DOCKER_HANDBOOK_CHAPTERS: BackendHandbookChapter[] = [
  {
    id: 'docker-architecture-primitives',
    number: '01',
    title: 'VM vs Container, Architecture (CLI → dockerd → containerd → runc) & Linux Primitives',
    subtitle: 'Namespaces (PID/NET/MNT/UTS/IPC/USER) · cgroups · Image Layers & UnionFS',
    whatItIs:
      'Docker packages your app code, runtime, and exact dependencies into a portable Image that runs identically on your laptop, QA, and cloud production—eliminating "works on my machine!" forever.',
    whyWeNeedIt:
      'Virtual Machines waste gigabytes of RAM duplicating full operating systems. Containers share the host Linux kernel while isolating processes cleanly via Namespaces and cgroups.',
    howItWorks: [
      'Architecture Chain: `docker CLI` (your terminal) sends REST API requests over `/var/run/docker.sock` → `dockerd` (Docker Daemon) → `containerd` (lifecycle/image manager) → `runc` (OCI runtime that creates the actual Linux container process).',
      '6 Linux Namespaces (What a container CAN SEE): `PID` (own process tree starting at PID 1), `NET` (own IP & ports), `MNT` (own filesystem root), `UTS` (own hostname), `IPC` (isolated shared memory), `USER` (root inside container mapped to non-root on host).',
      'cgroups (Control Groups — How much it CAN USE): Hard limits on CPU shares (`--cpus="1.5"`) and RAM (`--memory="512m"`) so one buggy service cannot crash the whole server.',
      'Image Layers & UnionFS (OverlayFS): Every Dockerfile instruction creates a cached read-only layer. Running a container simply adds one thin writable layer on top (Copy-on-Write) — sharing identical base layers across 20 containers saves gigabytes of disk!',
    ],
    formulaOrSpec: 'docker CLI ─(docker.sock)→ dockerd → containerd → runc → Isolated Linux Process (Namespaces + cgroups)',
    indianExample:
      'Think of VMs as renting 5 separate bungalows (huge rent & upkeep) vs Docker Containers as 5 locked rooms in a PG/hostel sharing one building structure (Linux kernel), each with its own meter limit (cgroups).',
    commonPitfalls: [
      'Mounting `/var/run/docker.sock` inside an untrusted container effectively hands over full root access to the host machine!',
    ],
    keyTakeaways: [
      'A container is NOT a mini-VM—it is just an ordinary Linux process wearing Namespace blinders and cgroup resource cuffs.',
      'Order Dockerfile instructions from least-frequently changed (`package.json` / `pom.xml`) to most-frequently changed (`COPY src/`) to maximize layer cache hits!',
    ],
    interviewQa: [
      {
        q: 'What is the difference between a Docker Image and a Docker Container?',
        a: 'A Docker Image is an immutable, read-only template of layered filesystem snapshots (like a Class). A Docker Container is a live, running process created from that image with a thin writable top layer (like an Object instance).',
      },
      {
        q: 'How do Linux Namespaces and cgroups work together to isolate a container?',
        a: 'Namespaces restrict visibility so the container only sees its own processes, network stack, and filesystem, while cgroups restrict resource consumption so it cannot exceed its assigned CPU and RAM caps.',
      },
    ],
  },
  {
    id: 'docker-dockerfile-multistage',
    number: '02',
    title: 'Dockerfile (RUN vs CMD vs ENTRYPOINT), Multi-Stage Builds & Essential CLI',
    subtitle: 'Shrink Java/Node images from ~850 MB down to ~180 MB cleanly',
    whatItIs:
      'A Dockerfile is a build recipe. Using `.dockerignore` and Multi-Stage Builds separates bulky build compilers (Maven/JDK/TypeScript) from the tiny final runtime image.',
    whyWeNeedIt:
      'Shipping Maven, Git, source files, and a full JDK inside production wastes bandwidth, slows Kubernetes pod autoscaling, and expands your security attack surface.',
    howItWorks: [
      '`RUN` executes at BUILD time and commits a new image layer, such as `RUN npm ci` or `RUN mvn clean package`.',
      '`CMD` sets the default startup command at CONTAINER RUN time and is easily overridden by passing arguments to `docker run`.',
      '`ENTRYPOINT` sets the fixed main executable such as `["java", "-jar", "app.jar"]`; any extra CLI arguments get appended to `ENTRYPOINT` rather than replacing it.',
      'Multi-Stage Build: Stage 1 (`FROM maven:3.9-eclipse-temurin-21 AS builder`) compiles the JAR (~850 MB). Stage 2 (`FROM eclipse-temurin:21-jre-alpine`) copies ONLY `app.jar` from `builder` — final image drops from ~850 MB to ~180 MB!',
      'Always add `.dockerignore` (`node_modules`, `.git`, `target`, `.env`) so `docker build` does not copy gigabytes into the build context.',
    ],
    formulaOrSpec: 'Single-Stage Spring Boot Image: ~850 MB  →  Multi-Stage JRE Alpine Image: ~180 MB (78% smaller!)',
    indianExample:
      'Just like a chef leaves dirty pots, peelers, and raw spice sacks in the kitchen (Builder Stage) and sends ONLY the clean plated thali (Final Runtime Stage) to the dining table.',
    commonPitfalls: [
      'Using shell form (`CMD java -jar app.jar`) spawns `/bin/sh -c` as PID 1, which eats `SIGTERM` signals and breaks graceful shutdown. Always use JSON exec form (`ENTRYPOINT ["java", "-jar", "app.jar"]`)!',
    ],
    keyTakeaways: [
      'Essential daily CLI: `docker build -t app:1.0 .`, `docker run -d -p 8080:8080 --name api app:1.0`, `docker logs -f api`, `docker exec -it api sh`, `docker stats`, `docker system prune`.',
      'Always pin base image tags (`node:22-alpine`), never `:latest` in production.',
    ],
    interviewQa: [
      {
        q: 'What is the difference between `CMD` and `ENTRYPOINT` in a Dockerfile?',
        a: '`ENTRYPOINT` defines the main immutable executable for the container, whereas `CMD` provides default arguments (or a default command) that users can easily override at `docker run` time.',
      },
      {
        q: 'Why should you copy `package.json` or `pom.xml` before copying `src/` in a Dockerfile?',
        a: 'Docker caches each layer sequentially. Copying dependency manifests first lets Docker reuse the cached `npm ci` or `mvn dependency:go-offline` layer on every code edit unless dependencies actually changed, cutting rebuild times from minutes to seconds.',
      },
    ],
    codeExample: {
      title: 'Production Multi-Stage Hardened Spring Boot Dockerfile (850 MB → 180 MB)',
      language: 'javascript',
      contextHint: 'Multi-stage Dockerfile pattern with cached dependencies, JRE-only runtime, and non-root USER.',
      code: `# ---- Stage 1: Build with full JDK & Maven ----
# FROM maven:3.9-eclipse-temurin-21 AS builder
# WORKDIR /build
# COPY pom.xml .
# RUN mvn dependency:go-offline -B
# COPY src ./src
# RUN mvn clean package -DskipTests

# ---- Stage 2: Minimal JRE Runtime + Non-Root User ----
# FROM eclipse-temurin:21-jre-alpine
# WORKDIR /app
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# COPY --from=builder /build/target/*.jar app.jar
# USER appuser
# EXPOSE 8080
# ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

const sizeComparison = {
  singleStageJdkMb: 850,
  multiStageJreAlpineMb: 180,
  reductionPercent: Math.round(((850 - 180) / 850) * 100),
};
console.log('Image shrunk by ' + sizeComparison.reductionPercent + '%');`,
    },
  },
  {
    id: 'docker-network-storage-security',
    number: '03',
    title: 'Networking, Storage Volumes, Docker Compose, Security & Troubleshooting',
    subtitle: 'bridge/host/overlay · Volumes vs Bind Mounts · Non-Root Hardening · Swarm vs K8s',
    whatItIs:
      'Containers are ephemeral—when deleted, files inside them vanish. Docker Volumes persist database files, Docker Networks connect services by DNS name, Compose orchestrates multi-container local stacks, and Security flags lock containers down.',
    whyWeNeedIt:
      'Running PostgreSQL without a Volume deletes all user data on restart, and running containers as `root` turns any app bug into a host breakout risk.',
    howItWorks: [
      '5 Network Drivers: `bridge` (default isolated local subnet — user-defined bridges give automatic DNS like `http://postgres:5432`!), `host` (shares host network directly, zero NAT overhead), `none` (air-gapped), `overlay` (multi-host Swarm networking), `macvlan` (assigns real LAN MAC address).',
      '3 Storage Mounts: `Named Volumes` (`-v pgdata:/var/lib/postgresql/data` — Docker-managed, best for production DBs + easy tar backup/restore), `Bind Mounts` (`-v ./src:/app/src` — live code hot-reload in dev), `tmpfs` (RAM-only — ideal for temporary secrets/tokens that must never touch disk).',
      'Container Security Checklist: Always run as non-root (`USER appuser`), drop Linux capabilities (`--cap-drop=ALL`), use read-only root filesystem (`--read-only`), block privilege escalation (`--security-opt no-new-privileges:true`), and scan images in CI with `trivy` or `docker scout`.',
      'Troubleshooting & Scale: Fix `EADDRINUSE` by remapping host port (`-p 8081:8080`), inspect BuildKit multi-arch builds (`docker buildx`), and know Swarm vs Kubernetes (Swarm = built-in, quick for small teams; Kubernetes = industry standard for self-healing, HPA autoscaling, rich ecosystem).',
    ],
    formulaOrSpec: 'Hardened Run: docker run --read-only --cap-drop=ALL --security-opt no-new-privileges:true -u 1001 app:1.0',
    indianExample:
      'A local `docker-compose.yml` spins up your Spring Boot API + PostgreSQL (named volume `pg_data`) + Redis + Kafka in 1 command (`docker compose up -d`), where Spring connects to `jdbc:postgresql://postgres:5432/appdb` via Docker DNS.',
    commonPitfalls: [
      'Storing database data inside the container\'s writable layer instead of a Named Volume causes permanent data loss when upgrading the container image.',
      'Using `localhost` inside Container A to reach Postgres in Container B fails—each container has its own `localhost`; use the Compose service name (`postgres`) instead!',
    ],
    keyTakeaways: [
      'Backup a named Docker volume cleanly: run an Alpine helper mounting the volume + host folder and `tar czf /backup/pgdata.tar.gz -C /data .`.',
      'Use Bind Mounts for dev code live-reload, Named Volumes for stateful DBs, and `tmpfs` for sensitive in-memory secrets.',
    ],
    interviewQa: [
      {
        q: 'Why can\'t my backend container reach my Postgres container at `localhost:5432` in Docker Compose?',
        a: 'Every container has its own isolated Network Namespace (`NET`), so `localhost` points to the backend container itself. Connect using the Docker Compose service name such as `postgres:5432`, which Docker\'s internal DNS resolves on the shared bridge network.',
      },
      {
        q: 'When should you choose a Named Volume vs a Bind Mount vs `tmpfs`?',
        a: 'Use Named Volumes for stateful databases in production because Docker manages their lifecycle and backups safely, Bind Mounts in local development for live code reload, and `tmpfs` for sensitive in-memory tokens that must never touch disk.',
      },
    ],
  },
];
