export interface StoryboardFrame {
  frame: number;
  timestamp: string;
  phase: 'Ingress' | 'Framework' | 'Retrieval' | 'Prefill (GPU)' | 'Decode (GPU)' | 'Streaming';
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeStageId: string;
  stateBoxes: {
    networkSocket: string;
    frameworkLoop: string;
    gpuVram: string;
    dbStorage: string;
  };
  metrics: { label: string; value: string }[];
}

export interface BackendFrameworkEntry {
  id: string;
  framework: string;
  language: string;
  runtime: string;
  server: string;
  gatewayInterface: string;
  concurrencyModel: 'Thread-Per-Request' | 'Event-Loop' | 'Goroutine M:N' | 'Virtual-Threads' | 'Tokio-Futures' | 'Pre-Fork-GVL';
  baseMemoryMb: number;
  kbPerConn: number;
  ioScalabilityScore: number;
  cpuBlockRisk: 'High (Freezes Loop)' | 'Medium (Exhausts Pool)' | 'Low (M:N Preemptive)';
  internalPipeline: string;
  idealWorkload: string;
  criticalTrap: string;
}

export interface RuntimeVmSpec {
  id: string;
  name: string;
  languages: string;
  executionEngine: string;
  memoryAndGc: string;
  concurrencyPrimitive: string;
  nativeAiInterop: string;
}

export interface LlmInferenceEngineSpec {
  id: string;
  name: string;
  coreStrength: string;
  kvCacheStrategy: string;
  batchingAndSpeed: string;
  quantizationSupport: string;
  bestFor: string;
}

export interface PolyglotImplementation {
  id: string;
  paradigm: string;
  shortLabel: string;
  stack: string;
  wireInterface: string;
  memoryHandoff: string;
  whyThisStack: string;
  code: string;
}

export interface FailureModeRunbook {
  id: string;
  layer: 'Framework & Runtime' | 'GPU & LLM' | 'Database & Vector' | 'OS & Network';
  title: string;
  symptom: string;
  rootCause: string;
  diagnosticCmd: string;
  keyTelemetry: string;
  productionFix: string;
}

export const FOUNDATIONAL_MENTAL_MODEL = {
  topic: 'End-to-End Streaming AI RAG & High-Concurrency API Request',
  plainEnglish:
    'A modern AI-backed web request flows like a tightly coordinated relay: an edge proxy handles encryption, a non-blocking web framework fetches context from relational and vector databases, and a GPU inference engine turns tokens into streaming words over one persistent HTTP connection.',
  rigorousDefinition:
    'An asynchronous distributed pipeline coupling TCP/TLS edge multiplexing (HTTP/2/3), non-blocking I/O event loops (epoll/kqueue/io_uring), HNSW approximate nearest-neighbor graph traversal O(log N), transformer Prefill GEMM compute O(L²·d + L·d²), and autoregressive KV-Cache-backed Decode memory streaming bounded by HBM bandwidth (TB/s).',
  realWorldAnalogy:
    'Imagine an express restaurant kitchen: a host (Nginx) checks reservations, a waiter (FastAPI/WebFlux) drops off tickets without standing idle, a pantry runner (pgvector/PostgreSQL) pulls recipe cards, and a massive multi-burner grill (GPU Tensor Cores) cooks 32 orders simultaneously while serving dishes one plate at a time (SSE token streaming).',
  whereAnalogyBreaksDown:
    'Unlike human chefs who process steps sequentially and get tired linearly, GPU Tensor Cores execute 16×16 fused matrix multiplications across thousands of threads in lockstep (SIMT) in a single clock cycle—making Prefill compute-bound (FLOPs) while single-token Decode becomes purely memory-bandwidth-bound (shuttling gigabytes of weights from HBM per token).',
  engineeringWhy:
    'Traditional thread-per-request WSGI/Servlet servers crash under C10K long-lived SSE streams (~1 MB OS stack per idle connection), while naive LLM serving wastes >60% GPU VRAM on fragmented KV-Cache buffers and stalls batches waiting for the slowest prompt.',
};

export const LEVEL0_MERMAID = `flowchart LR
  Client[Browser / Mobile / CLI Client] -->|HTTPS / SSE / gRPC| System((Full-Stack AI & Backend Platform))
  System -->|Token Stream + JSON| Client
  System <-->|SQL / Vector / Cache| Data[(PostgreSQL · pgvector · Redis · S3)]
  System <-->|CUDA / NVLink| GPU[[GPU HBM3 Inference Cluster]]`;

export const LEVEL1_MERMAID = `flowchart LR
  C[Client] -->|TLS 1.3 HTTP/2| E[Edge Proxy: Nginx / Envoy]
  E -->|ASGI / Netty / gRPC| F[App Server + Framework: Uvicorn+FastAPI / Netty+WebFlux]
  F -->|PgBouncer / HikariCP| PG[(PostgreSQL MVCC + WAL)]
  F -->|SIMD HNSW Search| VEC[(Qdrant / pgvector)]
  F -->|Semantic Cache| RED[(Redis RAM)]
  F -->|Continuous Batch gRPC| LLM[vLLM / TensorRT-LLM Engine]
  LLM -->|PagedAttention + FlashAttention| GPU[[CUDA Tensor Cores + HBM3]]
  LLM -.->|SSE data: token chunks| E -.-> C`;

export const ASCII_MEMORY_LAYOUT = `GPU HBM3 VRAM (80 GB H100) — PagedAttention Logical-to-Physical Block Layout
+------------------------------------------------------------------------------+
| Model Weights (Llama-3 70B FP8 ~70 GB or 8B FP16 ~16 GB, mmap Safetensors)   |
+------------------------------------------------------------------------------+
| KV-Cache Physical Block Pool (Fixed 16-token pages — <4% fragmentation!)     |
| [Blk 0: SysPrompt (Shared Prefix)] [Blk 1: Req#A tok 1-16] [Blk 2: Req#B...] |
| [Blk 3: Req#A tok 17-32]           [Blk 4: Free]           [Blk 5: Req#C...] |
+------------------------------------------------------------------------------+
| CUDA Activation Scratchpad (FlashAttention tiled SRAM chunks — zero HBM N²)  |
+------------------------------------------------------------------------------+`;

export const STORYBOARD_FRAMES: StoryboardFrame[] = [
  {
    frame: 1,
    timestamp: 'T+0 ms',
    phase: 'Ingress',
    title: 'Client Opens HTTPS Request -> Edge Proxy Terminates TLS',
    plainEnglish: 'The user hits Send. Nginx/Envoy verifies TLS 1.3, checks rate limits, and forwards the request over a keep-alive internal connection.',
    technicalDetail: 'Kernel NIC DMA copies TCP packets into sk_buff; Envoy terminates TLS 1.3, strips slow-client latency, and multiplexes onto an HTTP/2 or gRPC upstream pool.',
    activeStageId: 'edge',
    stateBoxes: {
      networkSocket: 'TCP RX: 1.4 KB JSON POST /v1/chat · TLS 1.3 decrypted · Rate-limit token OK',
      frameworkLoop: 'Idle / waiting on epoll_wait() fd readiness',
      gpuVram: 'Idle between micro-batches · Weights resident in HBM3',
      dbStorage: 'PgBouncer pool: 48/50 connections idle, WAL synced',
    },
    metrics: [
      { label: 'Wire Protocol', value: 'HTTP/2 + TLS 1.3' },
      { label: 'Added Overhead', value: '0.8 ms' },
    ],
  },
  {
    frame: 2,
    timestamp: 'T+2 ms',
    phase: 'Framework',
    title: 'App Server & Framework Middleware + Zero-Copy Validation',
    plainEnglish: 'Uvicorn (or Netty/Tomcat) wakes up, validates the JSON schema in microseconds, and injects auth/tenant context.',
    technicalDetail: 'Uvicorn uvloop invokes FastAPI ASGI coroutine; pydantic-core (Rust) validates payload; JWT tenant_id bound via ContextVar (or Java ScopedValue / WebFlux Context).',
    activeStageId: 'framework',
    stateBoxes: {
      networkSocket: 'ASGI/Netty request stream buffered in 8 KB user-space ring',
      frameworkLoop: 'Active Coroutine #412 on Event Loop · Pydantic Rust validation: 0.12 ms',
      gpuVram: 'Serving concurrent batch (14 active sequences)',
      dbStorage: 'Transaction not yet opened',
    },
    metrics: [
      { label: 'Schema Check', value: '0.12 ms (Rust)' },
      { label: 'OS Threads Blocked', value: '0 (Non-blocking)' },
    ],
  },
  {
    frame: 3,
    timestamp: 'T+6 ms',
    phase: 'Retrieval',
    title: 'Parallel Redis Semantic Cache Check + PostgreSQL Chat History',
    plainEnglish: 'The app checks Redis for a cached answer and reads recent conversation messages from PostgreSQL simultaneously without blocking the thread.',
    technicalDetail: 'asyncio.TaskGroup (or Virtual Threads) fires non-blocking TCP queries; PgBouncer assigns a backend slot, runs SET LOCAL app.current_tenant_id (RLS), and hits a B+ Tree Index Scan.',
    activeStageId: 'database',
    stateBoxes: {
      networkSocket: 'Outbound multiplexed sockets: Redis:6379 + PgBouncer:6432',
      frameworkLoop: 'Coroutine #412 SUSPENDED at await · Event loop serves 900 other users',
      gpuVram: 'Serving concurrent batch (14 active sequences)',
      dbStorage: 'Redis MISS (0.4ms) · PG Shared Buffers HIT: 6 history rows via Index Scan (2.1ms)',
    },
    metrics: [
      { label: 'Cache Check', value: '0.4 ms (Redis)' },
      { label: 'PG Read', value: '2.1 ms (Index Scan)' },
    ],
  },
  {
    frame: 4,
    timestamp: 'T+14 ms',
    phase: 'Retrieval',
    title: 'Vector Database HNSW Graph Search (RAG Grounding)',
    plainEnglish: 'The query embedding jumps through a multi-layer shortcut graph (HNSW) in the vector database to grab the top-5 most relevant tenant documents.',
    technicalDetail: 'Qdrant / pgvector traverses HNSW upper layers -> Layer 0 using AVX-512 SIMD Cosine similarity with pre-filtered tenant_id metadata bitmap.',
    activeStageId: 'vector',
    stateBoxes: {
      networkSocket: 'gRPC binary payload: 1536-dim float16 vector (3 KB)',
      frameworkLoop: 'Coroutine #412 awaiting top-5 chunks · Prompt template assembled on wake',
      gpuVram: 'Embedding micro-batch finished (3.2 ms)',
      dbStorage: 'HNSW RAM Graph: 42 distance ops (AVX-512) -> Top-5 docs returned (4.8 ms)',
    },
    metrics: [
      { label: 'Search Algo', value: 'HNSW O(log N)' },
      { label: 'SIMD Distance', value: 'AVX-512 Cosine' },
    ],
  },
  {
    frame: 5,
    timestamp: 'T+22 ms',
    phase: 'Prefill (GPU)',
    title: 'Tokenization (BPE) & Continuous Batch Admission in vLLM',
    plainEnglish: 'The assembled prompt (1,200 words) is split into integer token IDs and slotted immediately into the GPU engine’s running batch—no waiting for other users to finish!',
    technicalDetail: 'Rust Tiktoken/SentencePiece BPE maps text -> 1,600 int32 token IDs; vLLM Scheduler allocates 100 physical 16-token KV-Cache blocks via PagedAttention Block Table.',
    activeStageId: 'engine',
    stateBoxes: {
      networkSocket: 'Internal gRPC request to vLLM Inference Pod (4.8 KB token IDs)',
      frameworkLoop: 'Async HTTP/gRPC stream open; awaiting first token frame',
      gpuVram: 'PCIe Gen5 H2D copy (0.04 ms) · Block Table maps 100 KV blocks (0 wasted pages)',
      dbStorage: 'Connection returned to PgBouncer pool immediately',
    },
    metrics: [
      { label: 'Prompt Tokens', value: '1,600 tokens' },
      { label: 'KV Blocks Alloc', value: '100 × 16-tok' },
    ],
  },
  {
    frame: 6,
    timestamp: 'T+48 ms',
    phase: 'Prefill (GPU)',
    title: 'GPU Prefill Phase — Compute-Bound Parallel Matrix Multiplication',
    plainEnglish: 'The GPU processes all 1,600 input tokens in ONE massive parallel sweep, computing the Key/Value memory cache and predicting the very first answer word.',
    technicalDetail: 'CUDA Tensor Cores execute FP8/BF16 GEMM + FlashAttention-2 (tiled in on-chip SRAM to avoid O(N²) HBM writes), saturating compute FLOPs and populating all 100 KV-Cache blocks.',
    activeStageId: 'gpu',
    stateBoxes: {
      networkSocket: 'Client waiting (TTFT clock ticking: 48 ms)',
      frameworkLoop: 'Zero CPU usage while waiting on gRPC stream iterator',
      gpuVram: 'COMPUTE-BOUND: Tensor Cores 94% util · FlashAttention SRAM tiling · KV-Cache filled',
      dbStorage: 'Idle',
    },
    metrics: [
      { label: 'Bottleneck', value: 'Compute (TFLOPs)' },
      { label: 'TTFT', value: '48 ms (First Token!)' },
    ],
  },
  {
    frame: 7,
    timestamp: 'T+50 ms',
    phase: 'Streaming',
    title: 'First Token Sampled -> Detokenized -> Pushed via SSE',
    plainEnglish: 'The first word is chosen from the probability distribution, converted back to text, and immediately flushed to the user’s screen.',
    technicalDetail: 'Logits pass through Softmax + Top-p/Temperature sampling on GPU -> token ID copied D2H -> detokenized -> FastAPI/WebFlux yields `data: {"delta":"PostgreSQL"}\n\n` with `X-Accel-Buffering: no`.',
    activeStageId: 'edge',
    stateBoxes: {
      networkSocket: 'SSE Chunk #1 flushed: `data: {"delta":"PostgreSQL"}\\n\\n` (no proxy buffering)',
      frameworkLoop: 'Coroutine #412 wakes (0.03 ms), writes chunk to socket, yields again',
      gpuVram: 'Seq #412 transitions from Prefill Queue -> Decode Queue',
      dbStorage: 'Idle',
    },
    metrics: [
      { label: 'First Token (TTFT)', value: '50 ms' },
      { label: 'Stream Protocol', value: 'SSE (text/event-stream)' },
    ],
  },
  {
    frame: 8,
    timestamp: 'T+64 ms',
    phase: 'Decode (GPU)',
    title: 'Autoregressive Decode Loop — Memory-Bandwidth-Bound Token Generation',
    plainEnglish: 'Each next word requires reading the model’s weights + KV-Cache from high-speed GPU memory once per step. Continuous batching shares that memory read across 32 users at once!',
    technicalDetail: 'Decode step reads weights from HBM3 (3.35 TB/s) + attends over cached KV blocks via PagedAttention kernel; arithmetic intensity is low, so batching amortizes HBM bandwidth cost.',
    activeStageId: 'gpu',
    stateBoxes: {
      networkSocket: 'Streaming steady SSE chunks every ~14 ms (71 tokens/sec)',
      frameworkLoop: 'Lightweight chunk forwarding; backpressure respected if client is slow',
      gpuVram: 'MEMORY-BW-BOUND: HBM3 88% util · 32 batched sequences share weight read',
      dbStorage: 'Idle',
    },
    metrics: [
      { label: 'Bottleneck', value: 'HBM3 Bandwidth' },
      { label: 'TPOT', value: '14 ms / token' },
    ],
  },
  {
    frame: 9,
    timestamp: 'T+180 ms',
    phase: 'Streaming',
    title: 'EOS Token Reached -> KV Blocks Freed -> Async WAL Persist & Metrics',
    plainEnglish: 'The model finishes its answer, immediately returns its GPU memory blocks to the pool, closes the stream cleanly, and saves the chat transcript asynchronously.',
    technicalDetail: 'vLLM frees 108 KV-Cache physical blocks in O(1); SSE emits `data: [DONE]`; background worker/outbox commits chat log to PostgreSQL WAL + updates Redis semantic cache + exports TTFT/TPOT to Prometheus.',
    activeStageId: 'database',
    stateBoxes: {
      networkSocket: 'SSE `data: [DONE]` sent · HTTP/2 stream closed cleanly (TCP kept alive)',
      frameworkLoop: 'Background task persists audit record + Prometheus histogram updated',
      gpuVram: '108 KV-Cache blocks immediately recycled into free block list',
      dbStorage: 'PG INSERT chat_messages -> WAL fsync (1.1 ms) · Redis cache SETEX 300s',
    },
    metrics: [
      { label: 'VRAM Recycled', value: '108 blocks (O(1))' },
      { label: 'Audit Commit', value: '1.1 ms WAL fsync' },
    ],
  },
];

export const BACKEND_FRAMEWORKS: BackendFrameworkEntry[] = [
  {
    id: 'spring-mvc',
    framework: 'Spring Boot WebMVC',
    language: 'Java 21+',
    runtime: 'HotSpot JVM (Tiered JIT + Gen ZGC)',
    server: 'Apache Tomcat / Jetty / Undertow',
    gatewayInterface: 'Jakarta Servlet API',
    concurrencyModel: 'Virtual-Threads',
    baseMemoryMb: 260,
    kbPerConn: 12,
    ioScalabilityScore: 92,
    cpuBlockRisk: 'Low (M:N Preemptive)',
    internalPipeline: 'Filter Chain -> DispatcherServlet -> HandlerMapping -> AOP Proxies -> Controller -> Jackson Serialization',
    idealWorkload: 'Enterprise APIs, transactional microservices, Spring AI + JDBC using Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`).',
    criticalTrap: 'Running classic platform thread pools (200 threads) with slow LLM streaming calls starves Tomcat immediately; enable Virtual Threads and replace `synchronized` I/O with `ReentrantLock`.',
  },
  {
    id: 'spring-webflux',
    framework: 'Spring Boot WebFlux',
    language: 'Java 21+ / Kotlin',
    runtime: 'HotSpot JVM (NIO)',
    server: 'Reactor Netty',
    gatewayInterface: 'Reactive Streams (Mono / Flux)',
    concurrencyModel: 'Event-Loop',
    baseMemoryMb: 240,
    kbPerConn: 6,
    ioScalabilityScore: 97,
    cpuBlockRisk: 'High (Freezes Loop)',
    internalPipeline: 'Netty EventLoopGroup -> WebFilter -> RouterFunction / Handler -> Project Reactor Flux<ServerSentEvent>',
    idealWorkload: 'Ultra-high-fanout API gateways, reactive SSE/WebSocket streaming, and backpressure-aware pipelines.',
    criticalTrap: 'Calling blocking JDBC (`JpaRepository`) or `.block()` inside a Netty event-loop thread freezes throughput across all connections.',
  },
  {
    id: 'fastapi',
    framework: 'FastAPI & Starlette',
    language: 'Python 3.13+',
    runtime: 'CPython (asyncio + Rust pydantic-core)',
    server: 'Uvicorn (uvloop + httptools) / Hypercorn',
    gatewayInterface: 'ASGI 3.0',
    concurrencyModel: 'Event-Loop',
    baseMemoryMb: 95,
    kbPerConn: 8,
    ioScalabilityScore: 90,
    cpuBlockRisk: 'High (Freezes Loop)',
    internalPipeline: 'Uvicorn uvloop -> ASGI Middleware -> Starlette Router -> Dependency Injection Graph -> Pydantic v2 Rust Validation -> StreamingResponse',
    idealWorkload: 'AI/ML inference gateways, LLM agent orchestrators, LangGraph/PyTorch/vLLM control planes, and SSE streaming APIs.',
    criticalTrap: 'Writing blocking `requests.get()` or heavy pandas/NumPy work inside `async def` blocks the single event loop (sync `def` routes auto-offload to AnyIO’s 40-thread pool).',
  },
  {
    id: 'django',
    framework: 'Django',
    language: 'Python 3.13+',
    runtime: 'CPython',
    server: 'Gunicorn (WSGI) / Uvicorn (ASGI)',
    gatewayInterface: 'WSGI / ASGI',
    concurrencyModel: 'Pre-Fork-GVL',
    baseMemoryMb: 130,
    kbPerConn: 48,
    ioScalabilityScore: 72,
    cpuBlockRisk: 'Medium (Exhausts Pool)',
    internalPipeline: 'Gunicorn Pre-Fork Worker -> Middleware Onion (Auth/CSRF/Session) -> URL Resolver -> View -> Django ORM QuerySet',
    idealWorkload: 'Admin-heavy SaaS monoliths, CMS/back-office apps, rapid relational CRUD with built-in migrations and auth.',
    criticalTrap: 'Serving long-lived SSE streams over synchronous Gunicorn workers exhausts all worker processes (4–16) within seconds; use ASGI (`async def` views) or offload to FastAPI.',
  },
  {
    id: 'flask',
    framework: 'Flask',
    language: 'Python 3.13+',
    runtime: 'CPython',
    server: 'Gunicorn / Waitress',
    gatewayInterface: 'WSGI (PEP 3333)',
    concurrencyModel: 'Pre-Fork-GVL',
    baseMemoryMb: 75,
    kbPerConn: 44,
    ioScalabilityScore: 68,
    cpuBlockRisk: 'Medium (Exhausts Pool)',
    internalPipeline: 'Gunicorn Worker -> Werkzeug WSGI Wrapper -> RequestContext / AppContext (ContextVars) -> Blueprint Route',
    idealWorkload: 'Lightweight internal tools, simple ML model wrappers behind a reverse proxy with short request lifetimes.',
    criticalTrap: 'Deploying `app.run()` dev server in production or handling slow LLM streams on sync WSGI workers without gevent/ASGI.',
  },
  {
    id: 'nestjs-express',
    framework: 'NestJS & Express',
    language: 'TypeScript / Node.js',
    runtime: 'V8 JIT + Libuv Event Loop',
    server: 'Node.js http / Fastify',
    gatewayInterface: 'Node IncomingMessage / ServerResponse',
    concurrencyModel: 'Event-Loop',
    baseMemoryMb: 110,
    kbPerConn: 9,
    ioScalabilityScore: 91,
    cpuBlockRisk: 'High (Freezes Loop)',
    internalPipeline: 'Libuv Poll -> Middleware -> Guards -> Interceptors (RxJS) -> Pipes (Validation) -> Controller -> SSE Observable',
    idealWorkload: 'BFF (Backend-for-Frontend) services, real-time WebSocket/SSE chat gateways, and full-stack TypeScript teams.',
    criticalTrap: 'Heavy synchronous JSON.parse on 50 MB blobs, crypto hashing, or CPU loops stall the single V8 thread; offload via `worker_threads`.',
  },
  {
    id: 'gin-fiber',
    framework: 'Gin & Fiber',
    language: 'Go 1.23+',
    runtime: 'Go Native Runtime (M:N Work-Stealing Scheduler)',
    server: 'Go net/http (Gin) / fasthttp (Fiber)',
    gatewayInterface: 'http.Handler / fasthttp.RequestCtx',
    concurrencyModel: 'Goroutine M:N',
    baseMemoryMb: 28,
    kbPerConn: 4,
    ioScalabilityScore: 98,
    cpuBlockRisk: 'Low (M:N Preemptive)',
    internalPipeline: 'netpoller (epoll/kqueue) -> 2 KB Goroutine per Request -> Radix-Tree Router -> Middleware Chain -> Zero-Alloc JSON/gRPC',
    idealWorkload: 'High-throughput API gateways, AI proxy routers, telemetry collectors, and low-RAM microservices.',
    criticalTrap: 'Leaking goroutines without `context.Context` cancellation on client disconnects or retaining `fasthttp` zero-copy byte slices past request scope.',
  },
  {
    id: 'axum-actix',
    framework: 'Axum & Actix-Web',
    language: 'Rust',
    runtime: 'LLVM Native Binary + Tokio Runtime',
    server: 'Hyper (Axum) / Actix HTTP',
    gatewayInterface: 'Tower Service<Request> Trait',
    concurrencyModel: 'Tokio-Futures',
    baseMemoryMb: 16,
    kbPerConn: 2,
    ioScalabilityScore: 99,
    cpuBlockRisk: 'Low (M:N Preemptive)',
    internalPipeline: 'Tokio epoll/io_uring -> Hyper HTTP/2 -> Tower Layer Stack -> Zero-Copy Extractors -> Stackless Async Future',
    idealWorkload: 'Ultra-low-latency edge gateways, tokenizers (`tiktoken`/HF `tokenizers`), vector DB engines (Qdrant), and LLM routers.',
    criticalTrap: 'Running CPU-heavy work directly inside a Tokio async task starves worker threads; wrap blocking calls in `tokio::task::spawn_blocking`.',
  },
  {
    id: 'aspnet-core',
    framework: 'ASP.NET Core',
    language: 'C# / .NET 8+',
    runtime: 'CLR + RyuJIT + Span<T> Zero-Alloc',
    server: 'Kestrel (Sockets / HTTP/3 QUIC)',
    gatewayInterface: 'HttpContext Middleware Pipeline',
    concurrencyModel: 'Tokio-Futures',
    baseMemoryMb: 120,
    kbPerConn: 7,
    ioScalabilityScore: 96,
    cpuBlockRisk: 'Low (M:N Preemptive)',
    internalPipeline: 'Kestrel Socket Pipeline (System.IO.Pipelines) -> Middleware Delegate Chain -> Endpoint Routing -> Minimal API / Semantic Kernel',
    idealWorkload: 'Enterprise high-throughput APIs, gRPC services, and Semantic Kernel AI orchestration.',
    criticalTrap: 'Calling `.Result` or `.Wait()` on async Tasks causes ThreadPool starvation and classic sync-over-async deadlocks.',
  },
  {
    id: 'rails',
    framework: 'Ruby on Rails',
    language: 'Ruby 3.3+ (YJIT)',
    runtime: 'CRuby MRI (GVL + YJIT)',
    server: 'Puma (Clustered Multi-Process + Thread Pool)',
    gatewayInterface: 'Rack Specification',
    concurrencyModel: 'Pre-Fork-GVL',
    baseMemoryMb: 185,
    kbPerConn: 42,
    ioScalabilityScore: 74,
    cpuBlockRisk: 'Medium (Exhausts Pool)',
    internalPipeline: 'Puma Worker -> Rack Middleware Stack -> ActionDispatch Router -> ActionController -> ActiveRecord ORM -> Sidekiq Jobs',
    idealWorkload: 'Rapid product iteration, rich SaaS business domains paired with Sidekiq Redis workers for background AI/email jobs.',
    criticalTrap: 'ActiveRecord N+1 queries (forgetting `.includes()`) and long-running LLM HTTP calls hogging Puma’s small thread pool (typically 3–5 threads per worker).',
  },
];

export const RUNTIME_VM_SPECS: RuntimeVmSpec[] = [
  {
    id: 'jvm',
    name: 'JVM (HotSpot — Java 21+)',
    languages: 'Java, Kotlin, Scala',
    executionEngine: 'Bytecode -> Interpreter -> C1/C2 Tiered JIT (Escape Analysis)',
    memoryAndGc: 'Heap + Thread Stacks · G1GC & Generational ZGC (<0.5 ms pauses)',
    concurrencyPrimitive: 'OS Threads + Project Loom Virtual Threads (M:N ~1 KB heap)',
    nativeAiInterop: 'ONNX Runtime Java, DJL, Panama Foreign Function & Memory (FFM) API',
  },
  {
    id: 'v8',
    name: 'V8 + Libuv (Node.js / Bun)',
    languages: 'TypeScript, JavaScript',
    executionEngine: 'Ignition Bytecode -> Maglev / TurboFan JIT',
    memoryAndGc: 'Generational Scavenger (New Space) + Mark-Sweep-Compact',
    concurrencyPrimitive: 'Single-Thread Event Loop (Microtask Promise queue -> Libuv I/O phases)',
    nativeAiInterop: 'N-API C++/Rust addons, WebAssembly (WASM), WebGPU / ONNX Runtime Web',
  },
  {
    id: 'cpython',
    name: 'CPython 3.13+',
    languages: 'Python',
    executionEngine: 'PEG Parser -> Bytecode -> PEP 659 Adaptive VM -> Copy-and-Patch JIT',
    memoryAndGc: 'Immediate Reference Counting + 3-Gen Cyclic GC',
    concurrencyPrimitive: 'GIL (released in C/CUDA extensions) · asyncio Event Loop · PEP 703 No-GIL',
    nativeAiInterop: 'Native C-API, PyBind11, Cython, ctypes -> direct CUDA / PyTorch C++ kernels',
  },
  {
    id: 'clr',
    name: '.NET CLR (.NET 8/9)',
    languages: 'C#, F#',
    executionEngine: 'CIL Bytecode -> Tiered RyuJIT + NativeAOT',
    memoryAndGc: 'Generational Server GC + Span<T> / stackalloc zero-GC slicing',
    concurrencyPrimitive: 'Compiler-generated async/await state machines on work-stealing ThreadPool',
    nativeAiInterop: 'P/Invoke, TorchSharp, ONNX Runtime C#, Semantic Kernel',
  },
];

export const LLM_INFERENCE_ENGINES: LlmInferenceEngineSpec[] = [
  {
    id: 'vllm',
    name: 'vLLM',
    coreStrength: 'PagedAttention virtual memory for KV-Cache + high-throughput OpenAI-compatible serving',
    kvCacheStrategy: 'Non-contiguous 16-token physical VRAM blocks (<4% waste) + Automatic Prefix Caching',
    batchingAndSpeed: 'Iteration-level Continuous Batching + Chunked Prefill + Speculative Decoding',
    quantizationSupport: 'FP16, BF16, FP8, AWQ, GPTQ, SmoothQuant, Marlin kernels',
    bestFor: 'Default production Kubernetes LLM serving clusters (multi-tenant high concurrency)',
  },
  {
    id: 'trt-llm',
    name: 'NVIDIA TensorRT-LLM',
    coreStrength: 'Ahead-of-time fused CUDA graph compilation tuned for H100 / B200 Tensor Cores',
    kvCacheStrategy: 'Paged KV-Cache + FP8 KV-Cache quantization',
    batchingAndSpeed: 'In-Flight Batching + Medusa/Eagle speculative decoding + NVLink Tensor Parallelism',
    quantizationSupport: 'FP16, BF16, FP8 (H100 native), INT8 SmoothQuant, INT4 AWQ',
    bestFor: 'Maximum raw tokens/sec and lowest p99 latency on dedicated NVIDIA GPU fleets',
  },
  {
    id: 'sglang',
    name: 'SGLang',
    coreStrength: 'RadixAttention tree reusing shared system prompts & multi-turn agent KV prefixes automatically',
    kvCacheStrategy: 'LRU Radix Tree over KV-Cache pages (zero recompute on shared agent prefixes)',
    batchingAndSpeed: 'Compressed FSM constrained JSON decoding (up to 5x faster structured outputs)',
    quantizationSupport: 'FP16, BF16, FP8, AWQ, GPTQ',
    bestFor: 'Multi-turn AI agents, RAG pipelines with shared system prompts, and strict JSON outputs',
  },
  {
    id: 'triton',
    name: 'NVIDIA Triton Inference Server',
    coreStrength: 'Unified multi-framework model router (PyTorch, ONNX, TensorRT-LLM, vLLM, XGBoost)',
    kvCacheStrategy: 'Delegated to TensorRT-LLM / vLLM backend while managing ensembles',
    batchingAndSpeed: 'Dynamic Batching + Multi-model DAG Ensembles (Tokenizer -> Embedding -> LLM)',
    quantizationSupport: 'All backend formats (ONNX INT8, TRT FP8, PyTorch BF16)',
    bestFor: 'Enterprises serving classical ML, vision, embeddings, and LLMs behind one gRPC plane',
  },
  {
    id: 'llamacpp',
    name: 'llama.cpp / Ollama',
    coreStrength: 'Zero-dependency C/C++ portable inference across Apple Silicon Metal, CPU AVX-512, and CUDA',
    kvCacheStrategy: 'Static quantized KV-Cache (Q8_0 / Q4_0) with unified RAM/VRAM offload',
    batchingAndSpeed: 'SIMD AVX-512 / ARM NEON + Apple Metal unified memory kernels',
    quantizationSupport: 'GGUF K-quants (Q4_K_M, Q5_K_M, Q6_K, Q8_0, IQ2)',
    bestFor: 'Local development, edge/on-prem appliances, and air-gapped laptops without H100s',
  },
];

export const POLYGLOT_IMPLEMENTATIONS: PolyglotImplementation[] = [
  {
    id: 'poly-python',
    paradigm: '1. Python (AI Native)',
    shortLabel: 'Python FastAPI',
    stack: 'FastAPI + Uvicorn (uvloop) + Pydantic v2 + Async SSE',
    wireInterface: 'ASGI 3.0 -> HTTP/1.1 or HTTP/2 Chunked SSE (`text/event-stream`)',
    memoryHandoff: 'Pydantic Rust validates UTF-8 bytes directly -> AsyncGenerator yields small str frames without buffering full response.',
    whyThisStack: 'Dominates AI orchestration because PyTorch, vLLM, and LangGraph expose native Python/C++ bindings.',
    code: `from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
import httpx, json

app = FastAPI()

class ChatReq(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)
    tenant_id: str

async def stream_vllm_tokens(req: ChatReq):
    # Non-blocking async HTTP client (never blocks Uvicorn uvloop!)
    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST", "http://vllm-svc:8000/v1/completions",
            json={"model": "llama-3-70b-fp8", "prompt": req.prompt, "stream": True},
        ) as resp:
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    yield f"{line}\\n\\n"

@app.post("/v1/chat/stream")
async def chat_stream(req: ChatReq):
    return StreamingResponse(
        stream_vllm_tokens(req),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )`,
  },
  {
    id: 'poly-java',
    paradigm: '2. Enterprise JVM',
    shortLabel: 'Java 21 Spring',
    stack: 'Java 21 LTS + Spring Boot WebFlux (Netty) / Virtual Threads',
    wireInterface: 'Reactive Netty EventLoop (`Flux<ServerSentEvent<String>>`)',
    memoryHandoff: 'Netty pooled DirectByteBuf reads off-heap socket buffers and forwards reactive chunks with demand-driven backpressure.',
    whyThisStack: 'Combines enterprise governance, sub-millisecond Generational ZGC, and reactive or Virtual Thread scalability.',
    code: `@RestController
@RequestMapping("/v1/chat")
public class AiGatewayController {
    private final WebClient vllmClient;

    public AiGatewayController(WebClient.Builder builder) {
        this.vllmClient = builder.baseUrl("http://vllm-svc:8000").build();
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamTokens(@RequestBody ChatReq req) {
        // Non-blocking Netty EventLoop pipeline with automatic backpressure
        return vllmClient.post()
            .uri("/v1/completions")
            .bodyValue(Map.of("prompt", req.prompt(), "stream", true))
            .retrieve()
            .bodyToFlux(String.class)
            .map(chunk -> ServerSentEvent.builder(chunk).build());
    }
}`,
  },
  {
    id: 'poly-rust',
    paradigm: '3. Systems / Compiled',
    shortLabel: 'Rust Axum/Tokio',
    stack: 'Rust + Axum + Tokio + Hyper (Zero-Copy Bytes)',
    wireInterface: 'Tower Service + Hyper HTTP/2 Stream (Zero GC pauses)',
    memoryHandoff: 'Reference-counted `bytes::Bytes` slices forward network frames without deep heap copies or garbage collection.',
    whyThisStack: 'Unmatched tail-latency predictability for AI API gateways, tokenizers, and vector database engines.',
    code: `use axum::{routing::post, response::sse::{Event, Sse}, Json, Router};
use futures_util::stream::{self, Stream};
use serde::Deserialize;
use std::convert::Infallible;

#[derive(Deserialize)]
struct PromptReq { prompt: String }

async fn stream_handler(
    Json(req): Json<PromptReq>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    // Zero-cost stackless Future scheduled on Tokio work-stealing pool
    let tokens = vec!["PagedAttention", " eliminates", " KV", " fragmentation."];
    let stream = stream::iter(tokens.into_iter().map(move |tok| {
        Ok(Event::default().data(format!("{{\\"token\\":\\"{}\\"}}", tok)))
    }));
    Sse::new(stream)
}`,
  },
  {
    id: 'poly-ts',
    paradigm: '4. Web / Event-Driven',
    shortLabel: 'TS / Node SSE',
    stack: 'TypeScript + Node.js / NestJS (Web Streams ReadableStream)',
    wireInterface: 'WHATWG ReadableStream + TextDecoder over V8 Libuv Event Loop',
    memoryHandoff: 'Decodes incremental Uint8Array socket chunks into SSE frames cleanly without waiting for full payload buffering.',
    whyThisStack: 'Ideal for BFF gateways, tool-calling agent loops, and direct browser/React incremental UI rendering.',
    code: `export async function consumeLlmStream(
  prompt: string,
  onToken: (delta: string) => void
): Promise<void> {
  const res = await fetch("/v1/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, tenant_id: "tenant_acme" }),
  });
  if (!res.body) throw new Error("ReadableStream unavailable");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\\n\\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      if (frame.startsWith("data: ") && frame !== "data: [DONE]") {
        const parsed = JSON.parse(frame.slice(6));
        onToken(parsed.delta ?? "");
      }
    }
  }
}`,
  },
  {
    id: 'poly-bash',
    paradigm: '5. Shell / CLI Ops',
    shortLabel: 'Bash & Profiling',
    stack: 'POSIX Bash + curl -N (Unbuffered SSE) + jq + nvidia-smi',
    wireInterface: 'POSIX pipes (`|`) connecting stdout fd 1 -> stdin fd 0 across forked processes',
    memoryHandoff: 'Kernel 64 KB pipe ring buffer streams live SSE lines into `jq --unbuffered` in real time.',
    whyThisStack: 'Essential for SRE live smoke tests, CI load checks, and direct GPU/OS incident triage over SSH.',
    code: `#!/usr/bin/env bash
set -euo pipefail

# 1. Stream live SSE tokens unbuffered (-N) and extract JSON delta with jq
curl -sN -X POST https://api.internal/v1/chat/stream \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Explain PagedAttention","tenant_id":"tenant_acme"}' \\
  | sed -u 's/^data: //' \\
  | grep -v '^\\[DONE\\]$' \\
  | jq -rj --unbuffered '.delta // empty'

# 2. Live GPU HBM memory + SM compute telemetry (1s interval)
nvidia-smi dmon -s pucm -d 1`,
  },
];

export const FAILURE_MODE_RUNBOOKS: FailureModeRunbook[] = [
  {
    id: 'fail-event-loop-block',
    layer: 'Framework & Runtime',
    title: 'Blocking the Event Loop (FastAPI async def / Spring WebFlux / Node.js)',
    symptom: 'p99 latency spikes from 40ms to 8,000ms across ALL endpoints even though CPU usage sits around 12% (1 core pegged at 100%).',
    rootCause: 'A synchronous call (`requests.get`, `time.sleep`, JDBC `.block()`, or heavy JSON/regex CPU loop) executes directly on the single event-loop thread, halting every other coroutine.',
    diagnosticCmd: 'py-spy top --pid <uvicorn_pid>  # or: node --inspect / BlockHound in WebFlux',
    keyTelemetry: 'event_loop_lag_ms > 100ms while total host CPU < 20%',
    productionFix: 'Use native async drivers (`httpx`, `asyncpg`, R2DBC) or offload unavoidable blocking work to `await asyncio.to_thread()` / `Schedulers.boundedElastic()`.',
  },
  {
    id: 'fail-thread-starvation',
    layer: 'Framework & Runtime',
    title: 'Thread Pool Starvation (Tomcat / Gunicorn WSGI under SSE Streams)',
    symptom: 'New HTTP requests queue indefinitely and time out with HTTP 502/504 from Nginx/Envoy while DB and GPU look mostly idle.',
    rootCause: 'Long-lived 30-second LLM streaming responses occupy every synchronous worker thread (e.g., 200 Tomcat threads or 8 Gunicorn workers), leaving zero workers to accept new traffic.',
    diagnosticCmd: 'jstack <pid> | grep -c "WAITING"  # or: ss -tulpn | grep :8000',
    keyTelemetry: 'tomcat_threads_busy_threads == tomcat_threads_config_max_threads',
    productionFix: 'Enable Java 21 Virtual Threads (`spring.threads.virtual.enabled=true`), switch to WebFlux/Netty or FastAPI/Uvicorn ASGI, and set strict upstream timeouts.',
  },
  {
    id: 'fail-cuda-oom',
    layer: 'GPU & LLM',
    title: 'CUDA Out-Of-Memory (OOM) & KV-Cache Eviction Thrashing',
    symptom: 'vLLM logs `Preempted running request` repeatedly, TTFT jumps 10x, or inference pod crashes with `torch.cuda.OutOfMemoryError`.',
    rootCause: 'Long 64K-token prompts exhaust remaining HBM VRAM after model weights are loaded, forcing the scheduler to evict and recompute KV-Cache blocks.',
    diagnosticCmd: 'nvidia-smi dmon -s mu -d 1  # inspect FB memory & GPU util live',
    keyTelemetry: 'vllm:gpu_cache_usage_perc > 0.95 & vllm:num_preemptions_total rising',
    productionFix: 'Quantize weights/KV-Cache to FP8/AWQ, enforce `--max-model-len`, enable Chunked Prefill, and autoscale replicas when KV cache occupancy exceeds 80%.',
  },
  {
    id: 'fail-decode-bw',
    layer: 'GPU & LLM',
    title: 'Compute-Bound Prefill vs. Memory-Bandwidth-Bound Decode Wall',
    symptom: 'Single-user generation is stuck at 25 tokens/sec even though GPU Tensor Core compute utilization looks tiny.',
    rootCause: 'Generating 1 token reads the entire model weight matrix from HBM VRAM (e.g., 70 GB / 3,350 GB/s ≈ 21 ms floor), leaving Tensor Cores starved waiting on memory bandwidth.',
    diagnosticCmd: 'nsys profile --trace=cuda,nvtx python benchmark_decode.py',
    keyTelemetry: 'High HBM bandwidth % (>85%) + Low SM Tensor Core util (<25%) -> TPOT ceiling',
    productionFix: 'Increase Continuous Batching concurrency (amortizing weight reads across 32+ users), quantize weights (FP16 -> FP8/INT4 cuts bytes read 2–4x), or enable Speculative Decoding.',
  },
  {
    id: 'fail-nan-overflow',
    layer: 'GPU & LLM',
    title: 'Silent Precision Overflow (FP16 NaN / Inf Collapse)',
    symptom: 'Model outputs repetitive garbage tokens or training loss suddenly explodes to `NaN`.',
    rootCause: 'IEEE FP16 max value is only 65,504 (`2^15`); unscaled attention logits or gradients overflow to `Inf`, and `Inf - Inf` produces `NaN` across all layers.',
    diagnosticCmd: 'TORCH_SHOW_CPP_STACKTRACES=1 python train.py  # + torch.autograd.set_detect_anomaly(True)',
    keyTelemetry: 'grad_norm == NaN or logits containing +/-Inf',
    productionFix: 'Switch from FP16 to BF16 (same exponent range as FP32 up to `3.4e38`) on Ampere/Hopper GPUs, apply gradient clipping, and keep LayerNorm/Softmax in FP32.',
  },
  {
    id: 'fail-n-plus-one',
    layer: 'Database & Vector',
    title: 'ORM N+1 Query Storm & Connection Pool Exhaustion',
    symptom: 'Fetching 50 chat threads triggers 51 SQL round-trips, exhausting HikariCP/PgBouncer and spiking PostgreSQL CPU.',
    rootCause: 'Lazy-loaded ORM relationships (Hibernate `@OneToMany`, SQLAlchemy lazy load, ActiveRecord) fire a separate `SELECT` inside a loop for every parent row.',
    diagnosticCmd: 'EXPLAIN (ANALYZE, BUFFERS) SELECT ...;  # + SELECT state, count(*) FROM pg_stat_activity GROUP BY 1;',
    keyTelemetry: 'hikaricp_connections_pending > 0 & >50 queries per HTTP request',
    productionFix: 'Use eager `JOIN FETCH` / `selectinload()` / `.includes()`, route through PgBouncer in Transaction Mode, and add composite covering indexes.',
  },
  {
    id: 'fail-sse-buffering',
    layer: 'OS & Network',
    title: 'Reverse Proxy Buffering & Silent SSE Stream Timeouts',
    symptom: 'Users see a blank screen for 15 seconds and then the entire LLM answer pops in all at once—or drops at exactly 60 seconds.',
    rootCause: 'Nginx buffers upstream response chunks by default (`proxy_buffering on`) and closes idle upstream reads at `proxy_read_timeout 60s`.',
    diagnosticCmd: 'curl -ivN https://api.internal/v1/chat/stream  # inspect chunk arrival timestamps',
    keyTelemetry: 'TTFT at client >> TTFT measured at vLLM pod',
    productionFix: 'Set `X-Accel-Buffering: no`, `proxy_buffering off;`, `proxy_read_timeout 300s;`, and emit periodic SSE `: keep-alive` comment heartbeats every 15s.',
  },
  {
    id: 'fail-backpressure',
    layer: 'OS & Network',
    title: 'Backpressure Collapse & Unbounded Queue OOM',
    symptom: 'API gateway pod RSS memory climbs steadily until Kubernetes OOMKills it (Exit Code 137) during traffic spikes.',
    rootCause: 'Fast GPU token producers or Kafka consumers push chunks into unbounded in-memory queues faster than slow mobile clients or downstream DBs can drain them.',
    diagnosticCmd: 'htop && vmstat 1 && jmap -histo:live <pid> | head -n 20',
    keyTelemetry: 'container_memory_working_set_bytes climbing linearly with slow clients',
    productionFix: 'Enforce bounded queues (`asyncio.Queue(maxsize=64)`, Reactor backpressure, `Semaphore` admission control) and shed load early with HTTP 429 + `Retry-After`.',
  },
];
