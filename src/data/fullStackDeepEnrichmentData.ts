import type { SystemInternalBlueprint } from './runtimeAndInfraInternalsData';

export interface InfraAlgoDeepSpec {
  algorithmName: string;
  formalDefinition: string;
  language: string;
  code: string;
  implementationSteps: string[];
  complexityNote: string;
}

export interface FrameworkDeepSpec {
  formalDefinition: string;
  mermaidDfd: string;
  algorithmName: string;
  algorithmLanguage: string;
  algorithmCode: string;
  implementationWalkthrough: string[];
}

export interface AiGpuDeepAlgorithm {
  id: string;
  name: string;
  formalDefinition: string;
  complexity: string;
  language: string;
  code: string;
  implementationWalkthrough: string[];
}

export interface PolyglotDeepSpec {
  formalDefinition: string;
  mermaidDfd: string;
  keyMechanism: string;
}

/* -------------------------------------------------------------------------- */
/* 1. Dynamic Mermaid.js DFD Generator for all 16 Runtime & Infra Blueprints  */
/* -------------------------------------------------------------------------- */

function sanitizeMermaidLabel(text: string): string {
  return text.replace(/"/g, "'").replace(/[\r\n]+/g, ' ').trim();
}

export function buildBlueprintMermaidDfd(bp: SystemInternalBlueprint): string {
  const nodeLines = bp.dfdNodes.map((n) => {
    const safeId = n.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const lbl = sanitizeMermaidLabel(`${n.label} - ${n.sublabel}`);
    return `  ${safeId}["${lbl}"]`;
  });

  const edgeLines = bp.dfdEdges.map((e) => {
    const fromId = e.from.replace(/[^a-zA-Z0-9_]/g, '_');
    const toId = e.to.replace(/[^a-zA-Z0-9_]/g, '_');
    const lbl = sanitizeMermaidLabel(e.label);
    return `  ${fromId} -->|"${lbl}"| ${toId}`;
  });

  return `flowchart LR\n${nodeLines.join('\n')}\n${edgeLines.join('\n')}`;
}

/* -------------------------------------------------------------------------- */
/* 2. Deep Algorithm Code & Implementation Specs for all 16 Infra Blueprints  */
/* -------------------------------------------------------------------------- */

export const INFRA_ALGO_DEEP_SPECS: Record<string, InfraAlgoDeepSpec> = {
  'jvm-hotspot': {
    algorithmName: 'Tiered JIT Profiling & Tri-Color Concurrent GC Marking',
    formalDefinition:
      'Adaptive compilation promotes bytecode methods whose invocation and loop back-edge counters cross threshold T into SSA native machine code, while Tri-Color Marking partitions heap graphs into White (unreachable), Gray (frontier), and Black (scanned) sets under a SATB/Load Barrier invariant.',
    language: 'java',
    code: `// Conceptual HotSpot Tiered JIT + Tri-Color SATB Write Barrier
final class TriColorGcMarker {
  enum Color { WHITE, GRAY, BLACK }
  final Deque<Object> grayStack = new ArrayDeque<>();

  // Called by JIT-emitted write barrier on every reference mutation: obj.field = newVal
  void writeBarrierSATB(Object oldRef) {
    if (oldRef != null && colorOf(oldRef) == Color.WHITE) {
      setColor(oldRef, Color.GRAY);       // Snapshot-At-The-Beginning preserves reachability
      grayStack.push(oldRef);
    }
  }

  void markStepConcurrent() {
    while (!grayStack.isEmpty()) {
      Object cur = grayStack.pop();
      for (Object child : outgoingRefs(cur)) {
        if (colorOf(child) == Color.WHITE) {
          setColor(child, Color.GRAY);
          grayStack.push(child);
        }
      }
      setColor(cur, Color.BLACK);         // All children visited; safe from sweep
    }
  }
}`,
    implementationSteps: [
      'ClassLoader verifies bytecode stack frames once; Template Interpreter runs cold code and increments MethodData counters.',
      'Once invocation + back-edge counts pass 10,000, C2 builds a Sea-of-Nodes SSA IR, runs Escape Analysis (scalar replacement into CPU registers), and emits x86/ARM64 machine code into CodeCache.',
      'During concurrent GC, mutator threads execute a 2-instruction load/write barrier so moving references never hide live objects from the Gray frontier.',
    ],
    complexityNote: 'JIT check: O(1) per call · Tri-Color Mark: O(Live Objects) concurrent (<0.5 ms STW with Gen ZGC).',
  },
  'cpython-vm': {
    algorithmName: 'PEP 659 Adaptive Quickening + Immediate Refcount & Cyclic GC',
    formalDefinition:
      'CPython executes stack-based bytecode that dynamically specializes hot opcodes in-place (Quickening) based on observed operand types, paired with immediate reference counting (O(1) deterministic reclamation) and a 3-generation cycle detector.',
    language: 'python',
    code: `# Conceptual PEP 659 Inline Cache Specialization + asyncio Coroutine Suspension
class AdaptiveAddOpcode:
    def __init__(self):
        self.specialized = None
        self.hit_count = 0

    def execute(self, a, b):
        # Fast path: specialized type guard succeeds in ~2 CPU instructions
        if self.specialized == "INT" and type(a) is int and type(b) is int:
            return a + b
        # Guard miss -> deoptimize back to generic dispatch & re-profile
        if type(a) is int and type(b) is int:
            self.hit_count += 1
            if self.hit_count >= 8:
                self.specialized = "INT"
        return a.__add__(b)`,
    implementationSteps: [
      'CPython PEG parser compiles source to AST and stack-machine bytecode; PEP 659 rewrites generic LOAD_ATTR/BINARY_OP instructions into type-guarded fast opcodes after 8 hits.',
      'Every PyObject carries ob_refcnt; when it drops to 0, memory frees immediately without waiting for GC pauses.',
      'C/Rust/CUDA extensions (NumPy, PyTorch, pydantic-core) release the GIL around native work so all CPU/GPU cores run in parallel.',
    ],
    complexityNote: 'Specialized opcode guard: O(1) · Refcount free: O(1) amortized · Cyclic GC: O(Container Graph).',
  },
  'v8-engine': {
    algorithmName: 'Hidden Classes (Maps) + Monomorphic Inline Cache (IC)',
    formalDefinition:
      'V8 assigns every JS object a hidden structural descriptor (Map/Shape) with fixed byte offsets; Inline Caches remember the Map pointer at each property access site so dynamic `obj.x` compiles to a single pointer comparison plus direct memory offset load.',
    language: 'typescript',
    code: `// Conceptual V8 Hidden Class Transition Tree & Inline Cache Lookup
interface HiddenMap { id: number; offsets: Record<string, number>; }

class InlineCacheSite {
  private cachedMapId = -1;
  private cachedOffset = -1;

  readProp(obj: { map: HiddenMap; slots: unknown[] }, prop: string) {
    // Monomorphic Fast Path: 1 pointer compare + O(1) indexed load (no hash table!)
    if (obj.map.id === this.cachedMapId) {
      return obj.slots[this.cachedOffset];
    }
    // Slow Path: lookup offset in HiddenMap & update IC cache
    const offset = obj.map.offsets[prop];
    this.cachedMapId = obj.map.id;
    this.cachedOffset = offset;
    return obj.slots[offset];
  }
}`,
    implementationSteps: [
      'Ignition interprets bytecode and records feedback vectors (observed Hidden Class Maps) at every property read/write site.',
      'Consistent property initialization order shares one Hidden Class -> monomorphic IC -> TurboFan compiles `obj.x` to a single MOV instruction.',
      'Adding/deleting properties dynamically mutates shapes into megamorphic dictionary mode, forcing slow hash lookups.',
    ],
    complexityNote: 'Monomorphic IC load: O(1) (~1 ns) vs. Megamorphic hash lookup: ~15–40 ns.',
  },
  'aot-llvm-compiler': {
    algorithmName: 'SSA Phi-Node Optimization + Graph-Coloring Register Allocation',
    formalDefinition:
      'LLVM lowers front-end ASTs into Static Single Assignment (SSA) IR where every virtual register is assigned exactly once, enabling constant propagation, dead-code elimination, SIMD auto-vectorization, and Chaitin-Briggs interference-graph register allocation.',
    language: 'rust',
    code: `// Rust Ownership + LLVM Zero-Cost Monomorphization & SIMD Auto-Vectorization
#[inline(always)]
pub fn dot_product_f32(a: &[f32], b: &[f32]) -> f32 {
    assert_eq!(a.len(), b.len());
    // Rust's borrow checker proves &a and &b never alias mutable memory ("noalias" in LLVM IR)
    // LLVM auto-vectorizes this loop into AVX-512 / NEON fused multiply-add (FMA) instructions!
    a.iter()
        .zip(b.iter())
        .map(|(&x, &y)| x * y)
        .sum()
}`,
    implementationSteps: [
      'Rustc Borrow Checker enforces aliasing XOR mutability at compile time, emitting `noalias` LLVM IR attributes impossible for C without `restrict`.',
      'LLVM middle-end passes convert loops into SSA form, hoist loop-invariant bounds checks, and fuse operations into SIMD vector lanes.',
      'LLVM backend builds a live-range interference graph and assigns physical x86/ARM64 registers with zero GC overhead.',
    ],
    complexityNote: 'Zero runtime GC pause; SIMD FMA processes 8–16 floats per CPU clock cycle.',
  },
  'web-server-reactor': {
    algorithmName: 'Linux epoll Edge-Triggered Non-Blocking Reactor Event Loop',
    formalDefinition:
      'A single-threaded worker registers thousands of non-blocking TCP sockets (`O_NONBLOCK`) with the OS kernel red-black tree (`epoll_ctl`), sleeping on `epoll_wait` and receiving only the active subset of ready file descriptors in O(k) time rather than scanning all N sockets.',
    language: 'c',
    code: `// Conceptual Nginx / Envoy Worker Reactor Loop (Linux epoll_wait)
int epfd = epoll_create1(EPOLL_CLOEXEC);
struct epoll_event events[1024];

while (worker_running) {
  // Blocks with 0% CPU until kernel NIC interrupts mark sockets readable/writable
  int ready = epoll_wait(epfd, events, 1024, /*timeout_ms=*/ 50);
  for (int i = 0; i < ready; i++) {
    Conn *c = (Conn *)events[i].data.ptr;
    if (events[i].events & EPOLLIN)  handle_nonblocking_read(c);
    if (events[i].events & EPOLLOUT) handle_nonblocking_flush(c);
  }
}`,
    implementationSteps: [
      'Master process binds port 443 and forks 1 worker per CPU core pinned via CPU affinity.',
      'Kernel NIC DMA writes inbound TLS packets into `sk_buff` ring buffers and appends ready sockets to epoll’s O(1) ready list.',
      'Worker drains readable bytes into user-space ring buffers, terminates TLS 1.3, and multiplexes onto persistent upstream keep-alive connections.',
    ],
    complexityNote: 'epoll_wait returns in O(Ready Sockets k) independent of 100,000+ idle keep-alive connections.',
  },
  'app-server-runtime': {
    algorithmName: 'Java 21 Virtual Thread Continuation Unmount / M:N Scheduler',
    formalDefinition:
      'User-space virtual threads execute on a small ForkJoinPool of OS carrier threads; upon hitting a blocking socket/DB syscall, the JVM parks the lightweight continuation frame (~1 KB) on the heap and immediately mounts another runnable request on the freed OS thread.',
    language: 'java',
    code: `// Java 21 Virtual Threads: Blocking-Style Code with Non-Blocking Kernel Scalability
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 50_000; i++) {
        int reqId = i;
        executor.submit(() -> {
            // Unmounts from OS carrier thread while waiting on PgBouncer/vLLM I/O!
            String ctx = dbClient.fetchUserContext(reqId);
            return llmClient.generateSummary(ctx);
        });
    }
}`,
    implementationSteps: [
      'Incoming socket accepted by Tomcat/Netty creates a lightweight Virtual Thread (or ASGI coroutine / Goroutine) consuming ~2–8 KB instead of a 1 MB OS thread stack.',
      'When code awaits database or upstream HTTP I/O, the runtime registers the fd with epoll/kqueue and yields the carrier OS thread in nanoseconds.',
      'Avoiding `synchronized` pinning (use `ReentrantLock`) keeps carrier threads saturated even with 100k slow SSE connections.',
    ],
    complexityNote: 'Memory: ~2–12 KB/conn vs ~1 MB/OS thread (100× higher connection density).',
  },
  'load-balancer': {
    algorithmName: 'Power-of-Two Choices (P2C) Least-Connections + EWMA Latency',
    formalDefinition:
      'Instead of scanning all N backend instances (O(N)) or using blind Round-Robin, P2C picks 2 healthy backends uniformly at random in O(1) and routes the request to the one with lower active connections weighted by Exponentially Weighted Moving Average (EWMA) response latency.',
    language: 'typescript',
    code: `// Envoy / NGINX Plus Power-of-Two-Choices (P2C) + EWMA Load Balancer
interface Backend { id: string; healthy: boolean; activeConns: number; ewmaMs: number; }

function pickBackendP2C(pool: Backend[]): Backend {
  const healthy = pool.filter((b) => b.healthy);
  if (healthy.length === 1) return healthy[0];
  const i = Math.floor(Math.random() * healthy.length);
  let j = Math.floor(Math.random() * (healthy.length - 1));
  if (j >= i) j++;
  const a = healthy[i], b = healthy[j];
  const scoreA = (a.activeConns + 1) * Math.max(1, a.ewmaMs);
  const scoreB = (b.activeConns + 1) * Math.max(1, b.ewmaMs);
  return scoreA <= scoreB ? a : b;
}`,
    implementationSteps: [
      'L4 (Maglev/ECMP) hashes 5-tuple TCP flows at line rate; L7 (Envoy/ALB) terminates TLS and inspects HTTP headers/paths.',
      'P2C selects two random healthy endpoints and compares `(activeConns + 1) * ewmaLatency`, instantly steering traffic away from slow/GC-pausing pods.',
      'Outlier detection ejects any backend returning consecutive 5xx errors before passive health checks even expire.',
    ],
    complexityNote: 'O(1) selection time · Exponentially reduces maximum queue length from O(log N / log log N) to O(log log N).',
  },
  'dynamic-router-mesh': {
    algorithmName: 'Consistent Hashing Ring with Virtual Nodes (vNodes) & Weighted Canary',
    formalDefinition:
      'Maps both backend shards and request keys onto a 32-bit/64-bit hash ring using V virtual nodes per physical host, ensuring O(log(N·V)) key lookup and moving only ~K/N keys when a node joins or crashes.',
    language: 'typescript',
    code: `// Consistent Hash Ring with Binary Search over Virtual Nodes
class ConsistentHashRing {
  private ring: { hash: number; nodeId: string }[] = [];

  addNode(nodeId: string, vnodes = 128) {
    for (let v = 0; v < vnodes; v++) {
      this.ring.push({ hash: fnv1a32(\`\${nodeId}#\${v}\`), nodeId });
    }
    this.ring.sort((a, b) => a.hash - b.hash);
  }

  getNode(key: string): string {
    const h = fnv1a32(key);
    let lo = 0, hi = this.ring.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this.ring[mid].hash < h) lo = mid + 1;
      else hi = mid;
    }
    return this.ring[lo % this.ring.length].nodeId;
  }
}`,
    implementationSteps: [
      'Service discovery (xDS / Envoy Control Plane) pushes live healthy endpoints and weights into sidecar/eBPF maps with zero restarts.',
      'Sticky/cache-affinity traffic hashes `tenant_id` or `prompt_prefix` clockwise onto the ring so cache hit ratios stay >85%.',
      'When a pod fails, only its 1/N hash slices smoothly shift to adjacent virtual nodes without a global cache flush.',
    ],
    complexityNote: 'Lookup: O(log(N × V)) · Key remapping on node add/remove: optimal K/N.',
  },
  'authenticator-idp': {
    algorithmName: 'OAuth 2.1 PKCE + Stateless RS256 JWKS Signature Verification',
    formalDefinition:
      'PKCE binds an authorization code to a client-generated cryptographic verifier (`SHA256(verifier) == challenge`) to block interception, while API gateways verify short-lived JWTs locally in microseconds using cached asymmetric public keys (JWKS).',
    language: 'typescript',
    code: `// Stateless Gateway JWT Verification with Cached JWKS Public Key
async function verifyAccessToken(jwt: string, jwksCache: Map<string, CryptoKey>) {
  const [headerB64, payloadB64, sigB64] = jwt.split(".");
  const header = JSON.parse(atob(headerB64));
  if (header.alg !== "RS256" && header.alg !== "EdDSA") {
    throw new Error("Rejected unsafe alg header"); // Blocks alg=none attack
  }
  const pubKey = jwksCache.get(header.kid);
  if (!pubKey) throw new Error("Unknown key ID -> refresh JWKS");
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", pubKey, base64UrlDecode(sigB64),
    new TextEncoder().encode(\`\${headerB64}.\${payloadB64}\`)
  );
  if (!valid) throw new Error("Invalid cryptographic signature");
  const claims = JSON.parse(atob(payloadB64));
  if (claims.exp * 1000 < Date.now()) throw new Error("Token expired");
  return claims;
}`,
    implementationSteps: [
      'Client sends `code_challenge = BASE64URL(SHA256(code_verifier))`; IdP issues authorization code redeemable only with the original `code_verifier`.',
      'IdP signs a 15-minute JWT with its HSM private key and rotates refresh tokens on every use (reuse detection revokes the entire session family).',
      'Edge Gateway verifies JWT signature locally via cached JWKS in <0.2 ms with zero database round-trip.',
    ],
    complexityNote: 'Verification: O(1) local RSA/EdDSA verify (~0.15 ms) · Eliminates central auth DB bottleneck.',
  },
  'api-gateway': {
    algorithmName: 'Atomic Redis Lua Token Bucket Rate Limiter + Circuit Breaker',
    formalDefinition:
      'Token Bucket grants burst capacity B while refilling at steady rate R tokens/sec; executing refill and decrement inside a single Redis Lua script guarantees atomic, race-free distributed rate limiting across stateless gateway replicas.',
    language: 'lua',
    code: `-- Atomic Redis Lua Token Bucket (Zero Race Conditions Across Gateway Pods)
local key      = KEYS[1]
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2]) -- tokens per second
local now      = tonumber(ARGV[3])

local bucket = redis.call("HMGET", key, "tokens", "ts")
local tokens = tonumber(bucket[1]) or capacity
local lastTs = tonumber(bucket[2]) or now

tokens = math.min(capacity, tokens + (now - lastTs) * rate)
if tokens < 1 then
  return {0, math.floor(tokens)} -- HTTP 429 Too Many Requests
end
tokens = tokens - 1
redis.call("HMSET", key, "tokens", tokens, "ts", now)
redis.call("EXPIRE", key, math.ceil(capacity / rate) * 2)
return {1, math.floor(tokens)}   -- Allowed`,
    implementationSteps: [
      'Gateway extracts `tenant_id` from verified JWT claims and invokes the preloaded Lua script SHA (`EVALSHA`) in a single 0.4 ms Redis RTT.',
      'Allowed requests proceed through a per-upstream Circuit Breaker (Closed -> Open -> Half-Open) that fast-fails unhealthy services.',
      'Rejected traffic returns HTTP 429 with `Retry-After` and `X-RateLimit-Remaining` headers before touching compute pods.',
    ],
    complexityNote: 'O(1) time and O(1) memory per tenant key · Atomic single-threaded Redis execution.',
  },
  'dns-resolution': {
    algorithmName: 'Hierarchical Recursive Resolution + EDNS Client Subnet (ECS) Geo-Steering',
    formalDefinition:
      'Recursive resolvers traverse Root (`.`), TLD (`.com`), and Authoritative nameservers while caching RRsets by TTL; GeoDNS evaluates EDNS Client Subnet prefixes + active health checks to return the lowest-RTT healthy regional IP.',
    language: 'typescript',
    code: `// Conceptual Recursive DNS Resolver with Negative TTL Caching & Geo-Health Failover
function resolveHost(qname: string, clientSubnet: string, cache: DnsCache): string {
  const hit = cache.get(qname, clientSubnet);
  if (hit && hit.expiresAt > Date.now()) return hit.ip; // <1 ms Cache Hit

  // Iterative walk: Root -> TLD -> Authoritative GeoDNS
  const nsTld = queryRoot(qname);
  const nsAuth = queryTld(nsTld, qname);
  const answer = queryAuthoritativeGeo(nsAuth, qname, clientSubnet); // Picks healthy lowest-RTT region
  cache.set(qname, clientSubnet, answer.ip, Math.min(answer.ttlSec, 60));
  return answer.ip;
}`,
    implementationSteps: [
      'OS stub checks `/etc/hosts` and local cache, then queries recursive resolver (1.1.1.1 / 8.8.8.8 / CoreDNS).',
      'On cache miss, resolver iteratively walks Root -> TLD -> Authoritative NS with DNSSEC RRSIG verification.',
      'Short TTLs (30–60s) on edge CNAME/A records allow automated regional failover when health probes detect an outage.',
    ],
    complexityNote: 'Cache Hit: O(1) (<1 ms) · Cold recursive walk: 3–4 UDP/DoH hops (~25–60 ms).',
  },
  'cdn-edge-network': {
    algorithmName: 'BGP Anycast Ingress + W-TinyLFU Cache Admission & Request Collapsing',
    formalDefinition:
      'Every Edge PoP advertises the same Anycast IP via BGP so packets enter the nearest PoP; Request Collapsing (Singleflight) coalesces thousands of simultaneous cache misses for the same URL into a single origin fetch.',
    language: 'typescript',
    code: `// CDN Edge Request Collapsing (Singleflight) to Prevent Origin Cache Stampedes
const inflightOriginFetches = new Map<string, Promise<Response>>();

async function serveEdgeAsset(cacheKey: string, originFetch: () => Promise<Response>) {
  const cached = edgeLruCache.get(cacheKey);
  if (cached && !cached.isExpired) return cached.response; // HIT (<5 ms)

  // Coalesce 10,000 concurrent misses for the same hot asset into 1 origin request!
  let pending = inflightOriginFetches.get(cacheKey);
  if (!pending) {
    pending = originFetch().finally(() => inflightOriginFetches.delete(cacheKey));
    inflightOriginFetches.set(cacheKey, pending);
  }
  const resp = await pending;
  edgeLruCache.set(cacheKey, resp.clone());
  return resp;
}`,
    implementationSteps: [
      'BGP Anycast routes client TCP handshake to the closest Edge PoP (saving 100+ ms RTT on TLS 1.3 setup).',
      'Tiered Origin Shield sits between 300+ Edge PoPs and the origin S3/ALB so cache misses hit the shield once instead of 300 times.',
      'Stale-While-Revalidate serves expired assets instantly while refreshing asynchronously in the background.',
    ],
    complexityNote: 'Singleflight reduces origin fan-out from O(C concurrent users) to O(1) request per key.',
  },
  'llm-inference-engine': {
    algorithmName: 'PagedAttention Virtual KV Block Allocator + Continuous Batching',
    formalDefinition:
      'Inspired by OS virtual memory paging, PagedAttention partitions each request’s Key-Value cache into fixed 16-token non-contiguous physical HBM blocks mapped by a per-sequence Block Table, cutting VRAM fragmentation from ~55% to <4% and enabling Copy-on-Write shared prefixes.',
    language: 'python',
    code: `# vLLM PagedAttention Block Table + Iteration-Level Continuous Batching
class PagedKvBlockManager:
    def __init__(self, total_blocks: int, block_size: int = 16):
        self.block_size = block_size
        self.free_blocks = list(range(total_blocks))
        self.block_tables: dict[str, list[int]] = {}

    def append_token_slot(self, seq_id: str, num_tokens: int) -> int:
        table = self.block_tables.setdefault(seq_id, [])
        needed_blocks = (num_tokens + self.block_size - 1) // self.block_size
        while len(table) < needed_blocks:
            if not self.free_blocks:
                raise MemoryError("Preempt lowest-priority sequence to CPU swap")
            table.append(self.free_blocks.pop()) # O(1) non-contiguous allocation
        return table[-1]

    def free_sequence(self, seq_id: str):
        self.free_blocks.extend(self.block_tables.pop(seq_id, [])) # O(1) recycle`,
    implementationSteps: [
      'Incoming prompts are admitted on the very next decode iteration (Continuous Batching) without waiting for longer answers to finish.',
      'Shared system prompts point to the same read-only physical KV blocks via reference counting (Automatic Prefix Caching).',
      'When EOS is emitted, all physical blocks return immediately to `free_blocks`, keeping GPU utilization >90%.',
    ],
    complexityNote: 'Block alloc/free: O(1) · Cuts KV-Cache VRAM waste from ~55% to <4% -> 2–4× higher batch throughput.',
  },
  'kafka-message-queue': {
    algorithmName: 'Append-Only Segmented Log + Zero-Copy sendfile() & ISR Quorum',
    formalDefinition:
      'Each Kafka partition is a totally ordered immutable append-only log split into 1 GB segments; consumers read sequentially via OS Page Cache and Linux `sendfile()` DMA (zero user-space copies) up to the In-Sync Replica (ISR) High Watermark.',
    language: 'java',
    code: `// Conceptual Kafka Partition Append + High-Watermark Commit Visibility
final class PartitionLog {
  long logEndOffset = 0;
  long highWatermark = 0; // Highest offset replicated to ALL In-Sync Replicas (ISR)

  synchronized long appendBatch(byte[] compressedBatch, List<Long> followerAcks) {
    long baseOffset = logEndOffset;
    writeSequentialPageCache(baseOffset, compressedBatch); // O(1) sequential I/O
    logEndOffset += countRecords(compressedBatch);
    // Advance High Watermark only when every ISR follower catches up (acks=all)
    long minIsrOffset = followerAcks.stream().mapToLong(Long::longValue).min().orElse(baseOffset);
    highWatermark = Math.max(highWatermark, Math.min(logEndOffset, minIsrOffset));
    return baseOffset;
  }
}`,
    implementationSteps: [
      'Producers batch and compress (LZ4/Zstd) messages keyed by `hash(key) % partitions` for per-key ordering.',
      'Broker appends sequentially to OS Page Cache (hitting NVMe sequential bandwidth of GB/s) and replicates to ISR followers.',
      'Consumers pull from Page Cache via `sendfile()` directly to the NIC socket without copying into JVM heap.',
    ],
    complexityNote: 'Append & Read: O(1) sequential disk/Page Cache I/O · Zero-copy eliminates 2 CPU memory copies.',
  },
  'database-engines': {
    algorithmName: 'B+ Tree Page Lookup/Split vs. LSM-Tree MemTable & Bloom Compaction',
    formalDefinition:
      'B+ Trees optimize read latency via balanced 8–16 KB disk pages with O(log_B N) depth (3–4 levels for 100M rows), while LSM-Trees convert random writes into sequential WAL + sorted MemTable flushes (SSTables) guarded by Bloom Filters.',
    language: 'typescript',
    code: `// LSM-Tree Write & Bloom-Guarded Read Path (RocksDB / Cassandra)
class LsmEngine {
  private memTable = new Map<string, string>();
  private sstables: { bloom: BloomFilter; data: Map<string, string> }[] = [];

  put(key: string, val: string) {
    appendWalSequential(key, val);          // O(1) durable sequential write
    this.memTable.set(key, val);            // O(log M) in-memory skip list / RB-tree
    if (this.memTable.size >= 4096) this.flushToImmutableSstable();
  }

  get(key: string): string | null {
    if (this.memTable.has(key)) return this.memTable.get(key)!;
    for (let i = this.sstables.length - 1; i >= 0; i--) {
      if (!this.sstables[i].bloom.mightContain(key)) continue; // Skip 99% of disk SSTables!
      const hit = this.sstables[i].data.get(key);
      if (hit !== undefined) return hit;
    }
    return null;
  }
}`,
    implementationSteps: [
      'Every write appends sequentially to the Write-Ahead Log (WAL) first so crash recovery (ARIES) never loses committed transactions.',
      'B+ Tree engines modify 8 KB Buffer Pool pages in-place; LSM engines flush sorted immutable SSTables and merge them in background compaction.',
      'Bloom filters reject non-existent keys in O(k) bit checks before issuing a single SSD read.',
    ],
    complexityNote: 'B+ Tree Read: O(log_B N) (~3 page reads) · LSM Write: O(1) amortized sequential I/O.',
  },
  'worker-nodes-scheduler': {
    algorithmName: 'Durable Workflow Event-Sourcing + Visibility Timeout Lease & Idempotency',
    formalDefinition:
      'Distributed job queues prevent double-execution and lost jobs via atomic Visibility Timeout leases, exponential backoff with jitter, Dead-Letter Queues (DLQ), and idempotency keys persisted atomically with business state.',
    language: 'typescript',
    code: `// Idempotent Worker Loop with Visibility Lease, Backoff Jitter & DLQ Routing
async function processJobWithLease(job: QueueJob) {
  // 1. Idempotency Guard: skip if this exact job_id was already committed
  const inserted = await db.exec(
    "INSERT INTO processed_jobs(job_id) VALUES ($1) ON CONFLICT DO NOTHING", [job.id]
  );
  if (inserted.rowCount === 0) return queue.ack(job.receiptHandle);

  try {
    await executeSideEffect(job.payload);
    await queue.ack(job.receiptHandle);
  } catch (err) {
    if (job.attempt >= 5) return queue.moveToDlq(job, String(err));
    const jitterMs = Math.random() * 500;
    const delayMs = Math.min(60_000, 1000 * Math.pow(2, job.attempt) + jitterMs);
    await queue.nackWithDelay(job.receiptHandle, delayMs);
  }
}`,
    implementationSteps: [
      'Worker pulls a job with a 30s visibility lease; if the worker pod OOMKills mid-run, the broker automatically re-queues the job when the lease expires.',
      'Heartbeat extender renews the lease for long-running video/AI jobs while bounded concurrency semaphores prevent pod memory collapse.',
      'Poison-pill messages exceeding max retries route to a Dead-Letter Queue (DLQ) with full stack context for safe replay.',
    ],
    complexityNote: 'At-least-once delivery + O(1) unique-key idempotency check = Effective Exactly-Once semantics.',
  },
};

/* -------------------------------------------------------------------------- */
/* 3. Per-Framework Deep Specs, Mermaid DFDs & Concurrency Algorithm Code     */
/* -------------------------------------------------------------------------- */

export const FRAMEWORK_DEEP_SPECS: Record<string, FrameworkDeepSpec> = {
  'spring-mvc': {
    formalDefinition:
      'Spring Boot WebMVC implements the Front Controller pattern (`DispatcherServlet`) atop Jakarta Servlet containers; with Java 21 Project Loom Virtual Threads enabled, each blocking HTTP/JDBC call unmounts cleanly from its OS carrier thread.',
    mermaidDfd: `flowchart LR
  C["Client HTTP/2"] -->|"TLS"| LB["ALB / Envoy"]
  LB -->|"Keep-Alive"| TC["Tomcat Virtual Thread Pool"]
  TC -->|"Filter Chain"| DS["DispatcherServlet + AOP"]
  DS -->|"Cache-Aside"| RED[("Redis Cluster")]
  DS -->|"HikariCP Pool"| PG[("PostgreSQL Primary")]
  PG -.->|"WAL Replication"| REP[("Read Replica")]`,
    algorithmName: 'Project Loom Virtual Thread Carrier Unmount',
    algorithmLanguage: 'java',
    algorithmCode: `// application.yml: spring.threads.virtual.enabled=true
@GetMapping("/orders/{id}")
public OrderView getOrder(@PathVariable String id) {
    // Runs on a 1KB Virtual Thread; unmounts OS carrier during Redis & JDBC waits
    return redisCache.getOrLoad(id, () -> orderRepo.findByIdWithItems(id));
}`,
    implementationWalkthrough: [
      'Tomcat accepts the socket and spawns a lightweight Virtual Thread (~1 KB heap continuation).',
      'Security & logging Servlet Filters run before DispatcherServlet resolves the controller method.',
      'During HikariCP JDBC or Redis socket waits, the JVM parks the continuation and reuses the OS carrier for another request.',
    ],
  },
  'spring-webflux': {
    formalDefinition:
      'Spring WebFlux is a fully non-blocking Reactive Streams framework built on Reactor Netty’s epoll/kqueue EventLoopGroup, enforcing pull-based backpressure (`request(n)`) end-to-end across HTTP, Redis, and R2DBC.',
    mermaidDfd: `flowchart LR
  C["Client SSE / HTTP2"] -->|"TLS"| LB["Edge Ingress"]
  LB -->|"NIO Socket"| NT["Reactor Netty EventLoop"]
  NT -->|"WebFilter + Mono/Flux"| WF["WebFlux Reactive Handler"]
  WF -->|"Lettuce Async"| RED[("Redis Reactive")]
  WF -->|"R2DBC Non-Blocking"| PG[("PostgreSQL Cluster")]`,
    algorithmName: 'Reactive Streams Demand-Driven Backpressure (request(n))',
    algorithmLanguage: 'java',
    algorithmCode: `// Reactor Flux: downstream slow client controls upstream token emission rate
public Flux<ServerSentEvent<String>> streamChat(String prompt) {
    return llmWebClient.post().uri("/v1/stream").bodyValue(prompt)
        .retrieve().bodyToFlux(String.class)
        .limitRate(32) // Bounded prefetch buffer prevents OOM under slow mobile clients
        .map(tok -> ServerSentEvent.builder(tok).build());
}`,
    implementationWalkthrough: [
      'A fixed pool of Netty EventLoop threads (1 per CPU core) multiplexes tens of thousands of connections.',
      'Zero blocking calls are permitted on EventLoop threads; operators compose async state machines.',
      '`limitRate(32)` propagates backpressure upstream so fast GPU token producers cannot OOM the JVM heap.',
    ],
  },
  fastapi: {
    formalDefinition:
      'FastAPI pairs Starlette’s ASGI 3.0 async coroutine router on Uvicorn (`uvloop` Cython libuv event loop) with Rust-compiled `pydantic-core` schema validation for high-concurrency Python I/O and AI streaming.',
    mermaidDfd: `flowchart LR
  C["Browser / SDK"] -->|"HTTPS"| NG["Nginx / Envoy"]
  NG -->|"ASGI 3.0"| UV["Uvicorn uvloop Event Loop"]
  UV -->|"Rust Validate"| FA["FastAPI Coroutine + DI"]
  FA -->|"asyncpg / aioredis"| RED[("Redis Cache")]
  FA -->|"PgBouncer Tx Pool"| PG[("PostgreSQL + pgvector")]
  FA -->|"gRPC Stream"| LLM["vLLM GPU Inference"]`,
    algorithmName: 'ASGI Asyncio Coroutine TaskGroup Fan-Out',
    algorithmLanguage: 'python',
    algorithmCode: `async def fetch_rag_context(tenant_id: str, query_vec: list[float]):
    # Concurrent non-blocking fan-out on a single uvloop event loop thread
    async with asyncio.TaskGroup() as tg:
        hist_task = tg.create_task(pg_pool.fetch(SQL_HISTORY, tenant_id))
        vec_task  = tg.create_task(qdrant.search(tenant_id, query_vec, limit=5))
    return hist_task.result(), vec_task.result()`,
    implementationWalkthrough: [
      'Uvicorn (`uvloop`) polls epoll/kqueue and hands ASGI `scope, receive, send` callables to FastAPI.',
      'Pydantic v2 validates JSON in compiled Rust (`pydantic-core`) without Python loop overhead.',
      '`asyncio.TaskGroup` awaits PostgreSQL and Vector DB simultaneously while freeing the loop for other users.',
    ],
  },
  django: {
    formalDefinition:
      'Django is a batteries-included MVT web framework that routes requests through a layered Middleware Onion, URL Resolver, ORM QuerySet compiler, and either Gunicorn WSGI pre-fork workers or ASGI async views.',
    mermaidDfd: `flowchart LR
  C["Client Browser"] -->|"HTTPS"| NG["Nginx Reverse Proxy"]
  NG -->|"WSGI / ASGI"| GU["Gunicorn Pre-Fork Workers"]
  GU -->|"Auth + CSRF Onion"| DJ["Django View + ORM"]
  DJ -->|"Cache Framework"| RED[("Redis Cache")]
  DJ -->|"PgBouncer Pool"| PG[("PostgreSQL Primary")]`,
    algorithmName: 'ORM N+1 Elimination via Prefetch / Select Related',
    algorithmLanguage: 'python',
    algorithmCode: `# Prevents 1 + N SQL round-trips by joining & batch-fetching related rows in 2 queries
orders = (
    Order.objects
    .select_related("customer")          # SQL INNER JOIN in query #1
    .prefetch_related("items__product")  # Single WHERE order_id IN (...) in query #2
    .filter(tenant_id=tenant_id)[:50]
)`,
    implementationWalkthrough: [
      'Nginx buffers slow mobile clients so synchronous Gunicorn worker processes never stall on network reads.',
      'Django Middleware enforces CSRF, session lookup, and tenant context before reaching the view.',
      'Using `select_related` and `prefetch_related` collapses 100+ lazy queries into 2 indexed SQL round-trips.',
    ],
  },
  flask: {
    formalDefinition:
      'Flask is a minimalist WSGI micro-framework layered over Werkzeug routing and ContextVar-scoped request contexts, designed for explicit composition with extensions behind Gunicorn/Nginx.',
    mermaidDfd: `flowchart LR
  C["API Client"] -->|"HTTPS"| NG["Nginx Proxy"]
  NG -->|"WSGI PEP 3333"| GU["Gunicorn Sync/Gevent Pool"]
  GU -->|"Werkzeug Router"| FL["Flask Blueprint Handler"]
  FL -->|"Redis Lookup"| RED[("Redis Cache")]
  FL -->|"SQLAlchemy Pool"| PG[("PostgreSQL DB")]`,
    algorithmName: 'ContextVar Request Isolation & Connection Pool Checkout',
    algorithmLanguage: 'python',
    algorithmCode: `# ContextVar isolates request-local DB session cleanly across threads/greenlets
@app.teardown_appcontext
def release_db_session(exc=None):
    session = g.pop("db_session", None)
    if session is not None:
        session.close() # Always returns socket cleanly to SQLAlchemy/PgBouncer pool`,
    implementationWalkthrough: [
      'Werkzeug matches the URL map and pushes an isolated `RequestContext` backed by Python `ContextVar`.',
      'Always serve behind Gunicorn/Waitress with bounded SQLAlchemy pool sizes and teardown cleanup hooks.',
      'Offload long-running ML or SSE workloads to Celery workers or an ASGI service so WSGI workers stay free.',
    ],
  },
  'nestjs-express': {
    formalDefinition:
      'NestJS structures Node.js/V8 applications with modular DI, Guards, RxJS Interceptors, and Validation Pipes executing over Libuv’s single-threaded non-blocking I/O event loop.',
    mermaidDfd: `flowchart LR
  C["Web / Mobile App"] -->|"HTTPS"| LB["Cloud ALB / CDN"]
  LB -->|"Keep-Alive"| ND["Node.js V8 + Libuv Loop"]
  ND -->|"Guard + Pipe + DI"| NJ["NestJS Controller"]
  NJ -->|"ioredis"| RED[("Redis Cache")]
  NJ -->|"Prisma / pg Pool"| PG[("PostgreSQL DB")]
  NJ -.->|"Offload CPU"| WK["Worker Threads / BullMQ"]`,
    algorithmName: 'Libuv Event Loop Phase Protection via Worker Threads',
    algorithmLanguage: 'typescript',
    algorithmCode: `// Never block V8's single event loop with CPU work; offload to a Worker pool
async function verifyHeavyPayload(payload: Buffer): Promise<boolean> {
  return workerPool.run("verifySignatureAndParse", payload); // Runs on separate V8 Isolate
}`,
    implementationWalkthrough: [
      'Libuv polls OS sockets and dispatches I/O callbacks; Microtasks (Promises) drain immediately after each phase.',
      'NestJS Guards verify JWTs and Pipes validate DTOs before controller execution.',
      'CPU-heavy JSON parsing, image processing, or crypto work moves to `worker_threads` or BullMQ queues.',
    ],
  },
  'gin-fiber': {
    formalDefinition:
      'Go’s Gin/Fiber web servers run atop the Go M:N Work-Stealing Goroutine Scheduler and integrated epoll/kqueue `netpoller`, combining ultra-low 2 KB goroutine stacks with compiled native throughput.',
    mermaidDfd: `flowchart LR
  C["Client"] -->|"HTTP/2"| LB["L7 Load Balancer"]
  LB -->|"netpoller epoll"| GO["Go M:N Goroutine Pool"]
  GO -->|"Radix Tree Route"| GN["Gin / Fiber Handler"]
  GN -->|"go-redis"| RED[("Redis Cache")]
  GN -->|"pgxpool"| PG[("PostgreSQL Shards")]`,
    algorithmName: 'Go M:N Work-Stealing Scheduler + Context Cancellation',
    algorithmLanguage: 'go',
    algorithmCode: `func handleSearch(c *gin.Context) {
    // Propagate client disconnect cancellation directly into Redis & PostgreSQL!
    ctx, cancel := context.WithTimeout(c.Request.Context(), 150*time.Millisecond)
    defer cancel()
    res, err := store.QueryWithContext(ctx, c.Query("q"))
    if err != nil { c.JSON(504, gin.H{"error": "timeout"}); return }
    c.JSON(200, res)
}`,
    implementationWalkthrough: [
      'Each connection gets a 2 KB stack-growing goroutine multiplexed across P logical processors by work-stealing.',
      'Radix-tree routing matches URL parameters with zero heap allocations.',
      'Propagating `c.Request.Context()` aborts downstream DB queries immediately if the client drops.',
    ],
  },
  'axum-actix': {
    formalDefinition:
      'Axum composes Hyper HTTP/2/3, Tower middleware traits, and Tokio’s work-stealing async executor into stackless compile-time state machines with zero garbage collection pauses.',
    mermaidDfd: `flowchart LR
  C["Edge Client"] -->|"HTTP/2 gRPC"| LB["Envoy / Anycast"]
  LB -->|"Tokio epoll/io_uring"| AX["Axum + Tower Layers"]
  AX -->|"Zero-Copy Bytes"| RED[("Redis / Qdrant")]
  AX -->|"sqlx Async Pool"| PG[("PostgreSQL Cluster")]`,
    algorithmName: 'Stackless Async Future State Machine + Tower Backpressure',
    algorithmLanguage: 'rust',
    algorithmCode: `// Tower ConcurrencyLimit + Timeout protects downstream shards with zero GC overhead
let app = Router::new()
    .route("/v1/search", post(search_handler))
    .layer(ServiceBuilder::new()
        .layer(ConcurrencyLimitLayer::new(512))
        .layer(TimeoutLayer::new(Duration::from_millis(200))));`,
    implementationWalkthrough: [
      'Rust compiles every `async fn` into an exact-size enum state machine stored inline with zero heap frame allocation.',
      'Tower layers enforce rate limits, concurrency caps, and tracing cleanly before deserializing request bodies.',
      'Zero GC pauses guarantee flat p99.9 tail latency even at >100k RPS per instance.',
    ],
  },
  'aspnet-core': {
    formalDefinition:
      'ASP.NET Core runs on Kestrel’s zero-allocation `System.IO.Pipelines` socket engine and .NET’s tiered RyuJIT CLR, compiling `async/await` methods into state machines over a hill-climbing ThreadPool.',
    mermaidDfd: `flowchart LR
  C["Client HTTP/3 QUIC"] -->|"TLS 1.3"| LB["Front Door / ALB"]
  LB -->|"Kestrel Pipelines"| AS["ASP.NET Core Middleware"]
  AS -->|"StackExchange.Redis"| RED[("Redis Cache")]
  AS -->|"Npgsql Pool"| PG[("PostgreSQL / SQL Server")]`,
    algorithmName: 'Zero-Allocation Span<T> & System.IO.Pipelines Parsing',
    algorithmLanguage: 'csharp',
    algorithmCode: `// Kestrel parses HTTP headers directly on pooled memory slices (zero string GC churn)
app.MapGet("/v1/items/{id}", async (string id, IDistributedCache cache, NpgsqlDataSource db, CancellationToken ct) =>
{
    var hit = await cache.GetStringAsync(id, ct);
    if (hit is not null) return Results.Text(hit, "application/json");
    return Results.Ok(await LoadFromDbAsync(db, id, ct));
});`,
    implementationWalkthrough: [
      'Kestrel reads socket bytes into pooled `Memory<byte>` slabs, parsing headers with `ReadOnlySpan<byte>` without allocating strings.',
      'Never call `.Result` or `.Wait()` on Tasks—full async propagation keeps ThreadPool starvation at zero.',
      'Built-in HTTP/3 QUIC and NativeAOT cut cold-start latency for containerized microservices.',
    ],
  },
  rails: {
    formalDefinition:
      'Ruby on Rails runs atop Puma’s multi-process/multi-thread Rack server with CRuby’s YJIT compiler, combining Convention-over-Configuration ActiveRecord persistence with Sidekiq Redis workers for async jobs.',
    mermaidDfd: `flowchart LR
  C["Browser"] -->|"HTTPS"| NG["Nginx / Cloudflare"]
  NG -->|"Rack Socket"| PM["Puma Cluster Workers"]
  PM -->|"ActionController"| RL["Rails + ActiveRecord"]
  RL -->|"Cache + Jobs"| RED[("Redis + Sidekiq Queue")]
  RL -->|"PgBouncer Pool"| PG[("PostgreSQL Primary")]`,
    algorithmName: 'Pre-Fork Copy-on-Write Workers + Async Sidekiq Offload',
    algorithmLanguage: 'ruby',
    algorithmCode: `# Keep Puma threads fast (<50ms): offload AI/webhooks to Sidekiq Redis workers
class ReportsController < ApplicationController
  def create
    job = Report.create!(tenant: current_tenant, status: :queued)
    GenerateAiReportJob.perform_later(job.id) # O(1) Redis LPUSH; frees Puma thread immediately
    render json: { job_id: job.id }, status: :accepted
  end
end`,
    implementationWalkthrough: [
      'Puma `preload_app!` loads Rails once before forking workers so OS Copy-on-Write shares base RAM pages.',
      'YJIT compiles hot Ruby methods into native machine code for 1.5–2× request speedup.',
      'Offloading slow LLM/email I/O to Sidekiq prevents Puma’s small thread pool (3–5 threads) from saturating.',
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* 4. AI / GPU Physics Mermaid DFD & Core Algorithm Walkthroughs              */
/* -------------------------------------------------------------------------- */

export const AI_GPU_ARCHITECTURE_MERMAID = `flowchart LR
  C["Client SSE Stream"] -->|"Prompt"| GW["API Gateway + Tokenizer"]
  GW -->|"Token IDs"| SCH["Continuous Batch Scheduler"]
  SCH -->|"Prefix Hit Check"| RAD["Radix / Prefix KV Cache"]
  RAD -->|"Compute-Bound GEMM"| PRE["Prefill Pool: FlashAttention SRAM"]
  PRE -->|"Allocate 16-tok Pages"| PAG["PagedAttention HBM3 Block Pool"]
  PAG -->|"Memory-BW-Bound Step"| DEC["Decode Pool: FP8 Tensor Cores"]
  DEC -.->|"SSE Token Delta"| C`;

export const AI_GPU_DEEP_ALGORITHMS: AiGpuDeepAlgorithm[] = [
  {
    id: 'flash-attention',
    name: 'FlashAttention-2 Online Softmax SRAM Tiling',
    formalDefinition:
      'Computes exact scaled dot-product attention `softmax(QK^T / sqrt(d))V` by partitioning Q, K, V into blocks that fit inside ultra-fast GPU on-chip SRAM (19 TB/s), rescaling running softmax statistics incrementally so the O(N²) attention matrix is never materialized in HBM VRAM.',
    complexity: 'Memory: O(N) instead of O(N²) · Compute: O(N²·d) fused in SRAM',
    language: 'python',
    code: `# Conceptual FlashAttention Tiled Online Softmax Loop (Zero N x N HBM Matrix!)
for q_block in split_tiles(Q, Br=128):
    O_acc, m_prev, l_prev = zeros(), -inf, zeros()
    for k_block, v_block in zip(split_tiles(K, Bc=64), split_tiles(V, Bc=64)):
        S_tile = (q_block @ k_block.T) * inv_sqrt_d   # Stays inside 20 MB GPU SRAM!
        m_new  = maximum(m_prev, rowmax(S_tile))
        P_tile = exp(S_tile - m_new)
        l_new  = exp(m_prev - m_new) * l_prev + rowsum(P_tile)
        O_acc  = (O_acc * exp(m_prev - m_new) * l_prev + P_tile @ v_block) / l_new
        m_prev, l_prev = m_new, l_new`,
    implementationWalkthrough: [
      'Standard attention writes an N×N matrix to HBM VRAM (for 64K tokens, 8 GB per head!) causing instant OOM.',
      'FlashAttention keeps each 128×64 tile strictly inside GPU on-chip SRAM (~19 TB/s vs 3.35 TB/s HBM3).',
      'Online Softmax tracks running max `m` and denominator `l` per row so tiled outputs are mathematically identical to exact attention.',
    ],
  },
  {
    id: 'paged-kv-batching',
    name: 'Iteration-Level Continuous Batching + Chunked Prefill',
    formalDefinition:
      'Schedules token generation at the granularity of a single forward pass rather than an entire request batch; finished sequences exit immediately, new prompts enter on the next step, and long prefills are sliced into fixed token chunks so decode TTFT/TPOT never stalls.',
    complexity: 'Scheduler: O(B active sequences) per decode step (~0.2 ms CPU overhead)',
    language: 'python',
    code: `# Continuous Batching + Chunked Prefill Step Budget
def schedule_iteration(waiting_q, running_q, token_budget=2048):
    batch = []
    used_tokens = 0
    # 1. Prioritize active decode sequences (1 token each -> keeps TPOT smooth!)
    for seq in running_q:
        if used_tokens + 1 <= token_budget:
            batch.append((seq, 1))
            used_tokens += 1
    # 2. Fill remaining compute budget with chunked prefill slices
    while waiting_q and used_tokens < token_budget:
        seq = waiting_q[0]
        chunk = min(seq.remaining_prefill_tokens, token_budget - used_tokens)
        batch.append((seq, chunk))
        used_tokens += chunk
        if seq.remaining_prefill_tokens == chunk:
            running_q.append(waiting_q.popleft())
    return batch`,
    implementationWalkthrough: [
      'Static batching wastes >60% GPU cycles padding short answers until the longest sequence finishes.',
      'Chunked Prefill mixes 1-token memory-bound decodes with compute-bound prefill chunks in the SAME GPU kernel pass.',
      'Result: Tensor Cores and HBM3 memory bandwidth stay simultaneously utilized with smooth streaming latency.',
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* 5. Polyglot Paradigm Deep Specs & Wire/Memory Mermaid DFDs                 */
/* -------------------------------------------------------------------------- */

export const POLYGLOT_DEEP_SPECS: Record<string, PolyglotDeepSpec> = {
  'poly-python': {
    formalDefinition:
      'Asynchronous ASGI 3.0 streaming pipeline pairing Uvicorn’s `uvloop` event loop, Rust-compiled `pydantic-core` validation, and `httpx` non-blocking chunked SSE iteration with zero thread blocking.',
    mermaidDfd: `flowchart LR
  C["Client SSE"] -->|"HTTP/2"| UV["Uvicorn uvloop (epoll)"]
  UV -->|"UTF-8 Bytes"| PY["Pydantic v2 (Rust Core)"]
  PY -->|"AsyncGenerator"| FA["FastAPI StreamingResponse"]
  FA -->|"httpx AsyncClient"| VL["vLLM Inference Pod"]
  VL -.->|"data: token chunks"| C`,
    keyMechanism: 'Setting `X-Accel-Buffering: no` forces Nginx/Envoy to flush every single token frame immediately instead of buffering 4 KB chunks.',
  },
  'poly-java': {
    formalDefinition:
      'Reactive Streams non-blocking JVM pipeline using Netty off-heap `DirectByteBuf` slabs and Project Reactor `Flux<ServerSentEvent>` with pull-based backpressure.',
    mermaidDfd: `flowchart LR
  C["Client SSE"] -->|"HTTP/2"| NT["Reactor Netty DirectByteBuf"]
  NT -->|"Mono/Flux"| WF["Spring WebFlux Controller"]
  WF -->|"WebClient NIO"| VL["vLLM Inference Pod"]
  VL -.->|"Backpressure Flux"| C`,
    keyMechanism: 'Netty pooled off-heap buffers avoid copying socket payloads into the JVM Garbage Collected heap on every SSE chunk.',
  },
  'poly-rust': {
    formalDefinition:
      'Zero-GC compiled systems gateway built on Tokio work-stealing futures, Hyper HTTP/2 framing, and reference-counted `bytes::Bytes` slices for deterministic p99.9 latency.',
    mermaidDfd: `flowchart LR
  C["Client SSE"] -->|"HTTP/2"| HY["Hyper + Tokio epoll"]
  HY -->|"Zero-Copy Bytes"| TW["Tower Middleware Layers"]
  TW -->|"Stackless Future"| AX["Axum Sse Stream"]
  AX -->|"gRPC / HTTP2"| VL["vLLM Inference Pod"]`,
    keyMechanism: 'Cloning `bytes::Bytes` increments an atomic refcount instead of allocating or copying network payload buffers.',
  },
  'poly-ts': {
    formalDefinition:
      'Event-driven TypeScript/Browser streaming consumer utilizing the WHATWG `ReadableStream` API and incremental `TextDecoder({ stream: true })` to handle arbitrary TCP packet boundaries cleanly.',
    mermaidDfd: `flowchart LR
  API["SSE Backend Stream"] -->|"Chunked TCP"| RD["ReadableStream Reader"]
  RD -->|"Uint8Array"| TD["TextDecoder stream:true"]
  TD -->|"Split \\n\\n"| BUF["SSE Frame Buffer Parser"]
  BUF -->|"onToken(delta)"| UI["React Incremental Render"]`,
    keyMechanism: 'Buffering partial frames until `\\n\\n` prevents JSON parse crashes when a multi-byte UTF-8 emoji or JSON object splits across two TCP packets.',
  },
  'poly-bash': {
    formalDefinition:
      'POSIX process pipeline connecting unbuffered `curl -N`, `sed -u`, and `jq --unbuffered` across 64 KB kernel pipe ring buffers for instant SRE incident triage.',
    mermaidDfd: `flowchart LR
  API["HTTPS Endpoint"] -->|"curl -sN"| P1["Kernel Pipe 64KB"]
  P1 -->|"sed -u"| P2["Strip data: Prefix"]
  P2 -->|"jq --unbuffered"| OUT["Live Terminal stdout"]
  GPU["NVIDIA H100"] -->|"nvidia-smi dmon"| OUT`,
    keyMechanism: 'Passing `-N` to curl and `--unbuffered` to jq disables stdio 4 KB block buffering so tokens appear the millisecond they arrive.',
  },
};

/* -------------------------------------------------------------------------- */
/* 6. Storage, Pooling & SRE Diagnostics Mermaid DFD & Algorithms             */
/* -------------------------------------------------------------------------- */

export const STORAGE_DIAGNOSTICS_MERMAID = `flowchart LR
  APP["App Coroutines / Threads"] -->|"DataLoader Batch"| ORM["ORM / SQL Driver"]
  ORM -->|"10k Sockets -> 100 Procs"| PGB["PgBouncer Transaction Pool"]
  PGB -->|"MVCC + B+ Tree + WAL"| PG[("PostgreSQL Primary")]
  PG -.->|"WAL Stream"| REP[("Read Replica")]
  APP -->|"Semantic Hit <1ms"| RED[("Redis RAM Cache")]
  APP -->|"AVX-512 HNSW"| VEC[("Qdrant / pgvector")]
  S3[("S3 / NVMe Safetensors")] -->|"Zero-Copy mmap"| GPU["GPU HBM3 Weights"]`;

export const STORAGE_DEEP_ALGORITHMS: AiGpuDeepAlgorithm[] = [
  {
    id: 'hnsw-greedy',
    name: 'HNSW Hierarchical Greedy Graph Search (Vector RAG)',
    formalDefinition:
      'Hierarchical Navigable Small World (HNSW) indexes high-dimensional embeddings as a multi-layer skip-list proximity graph, greedily descending coarse upper layers into the dense Layer 0 neighborhood in O(log N) distance evaluations.',
    complexity: 'Search: O(efSearch × log N) with AVX-512 SIMD Cosine · Memory: ~2–4 KB/vector (FP16)',
    language: 'python',
    code: `# Conceptual HNSW Multi-Layer Greedy Descent (Qdrant / pgvector)
def hnsw_search(query_vec, entry_node, top_layer, ef_search=64):
    curr = entry_node
    # 1. Coarse greedy walk from top skip-layer down to Layer 1
    for layer in range(top_layer, 0, -1):
        improved = True
        while improved:
            improved = False
            for nbr in curr.neighbors[layer]:
                if cosine_dist(query_vec, nbr.vec) < cosine_dist(query_vec, curr.vec):
                    curr, improved = nbr, True
    # 2. Beam search on dense Layer 0 maintaining ef_search closest candidates
    return beam_search_layer0(query_vec, curr, ef_search)`,
    implementationWalkthrough: [
      'Upper layers contain exponentially fewer long-range highway links so the search jumps across millions of vectors in ~4–6 hops.',
      'Layer 0 runs a bounded beam search (`ef_search`) trading millisecond latency directly against Top-K recall.',
      'Scalar (FP16/INT8) or binary quantization shrinks HNSW RAM footprints 2–8× so the entire graph stays resident in RAM.',
    ],
  },
  {
    id: 'bounded-backpressure',
    name: 'Bounded Admission Queue & Load-Shedding Backpressure Guard',
    formalDefinition:
      'Caps in-flight work using a fixed-capacity semaphore and bounded ring buffer, immediately rejecting excess requests with HTTP 429 (`Retry-After`) before heap growth triggers Kubernetes OOMKill (Exit Code 137).',
    complexity: 'O(1) admission check · Strictly bounds worst-case RSS memory to O(MAX_INFLIGHT)',
    language: 'typescript',
    code: `// Bounded Admission Guard (Eliminates Unbounded Queue OOM Under Traffic Spikes)
class BoundedAdmissionGate {
  private inflight = 0;
  constructor(private readonly maxInflight: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.inflight >= this.maxInflight) {
      throw Object.assign(new Error("Load shed: queue full"), { status: 429, retryAfter: 2 });
    }
    this.inflight++;
    try { return await task(); }
    finally { this.inflight--; }
  }
}`,
    implementationWalkthrough: [
      'Unbounded queues hide downstream slowness while silently filling pod RAM until Linux OOMKiller terminates the entire container.',
      'Failing fast with HTTP 429 protects already-admitted requests so goodput stays high instead of collapsing to zero.',
      'Pair with client exponential backoff + full jitter so retrying clients do not synchronize into a thundering herd.',
    ],
  },
];
