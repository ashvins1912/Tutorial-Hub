import type { LogicBoardEnrichment } from './logicBoardMathTypes';

export const ADV_B_LOGIC_BOARDS: Record<string, LogicBoardEnrichment> = {
  'convex-hull-graham-scan': {
    formalDefinition:
      'Graham Scan and Andrew’s Monotone Chain compute the smallest convex polygon (Convex Hull) enclosing a set of n 2D points in O(n log n) time using a monotonic stack guided by 2D vector cross-product turn orientation; Jarvis March (Gift Wrapping) runs in output-sensitive O(n·h).',
    problemStatementForm:
      'Given n 2D coordinates (Erect the Fence, maximum diameter pair via Rotating Calipers), return the exact boundary vertices of the convex hull.',
    logicBoard: [
      {
        step: '01 · Sort Lexicographically',
        condition: 'Andrew’s Monotone Chain (avoids trigonometry/atan2 float error)',
        action: 'Sort points ascending by x, tie-break by y ascending',
        invariant: 'Leftmost-bottom and rightmost-top points are guaranteed hull vertices',
      },
      {
        step: '02 · Build Lower Hull',
        condition: 'Scanning sorted points left-to-right',
        action: 'While hull.length >= 2 && cross(hull[-2], hull[-1], p) < 0 (use <= 0 to drop collinear), pop hull',
        invariant: 'Every consecutive triple on lower hull makes a counter-clockwise (left) turn',
      },
      {
        step: '03 · Build Upper Hull',
        condition: 'Scanning sorted points right-to-left',
        action: 'Apply identical cross-product pop rule starting above lower-hull anchor',
        invariant: 'Upper and lower chains join seamlessly without trigonometric precision bugs',
      },
      {
        step: '04 · Concatenate & Deduplicate',
        condition: 'Both chains finished',
        action: 'Drop duplicated endpoints (or deduplicate collinear all-on-one-line edge case)',
        invariant: 'Each point pushed ≤ twice and popped ≤ twice → O(n) scan after O(n log n) sort',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: '2D Signed Cross Product Orientation Test',
          formula: 'cross(O, A, B) = (A_x - O_x)(B_y - O_y) - (A_y - O_y)(B_x - O_x)',
          meaning: '> 0: counter-clockwise (left turn),  = 0: collinear,  < 0: clockwise (right turn).',
        },
        {
          name: 'Graham / Monotone Chain vs Jarvis March',
          formula: 'Monotone Chain: O(n log n)   |   Jarvis March: O(n · h)  (h = hull vertices)',
          meaning: 'Jarvis wins only when h ≪ log n; Monotone Chain is strictly integer-exact.',
        },
      ],
      proofSketch:
        'A polygon is convex iff traversing its boundary counter-clockwise never takes a right turn. Popping whenever cross(hull[-2], hull[-1], p) < 0 removes strictly interior points while amortizing total pops to ≤ n.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Erect the Fence, minimal enclosing polygon, or farthest pair of 2D points',
        recommendedPattern: 'Convex Hull (Graham Scan)',
        linkedId: 'convex-hull-graham-scan',
        linkedKind: 'algorithm',
        whyItFits: 'Integer cross-product Monotone Chain computes exact hull in O(n log n).',
      },
      {
        ifYouSee: '2D nearest neighbor search rather than outer perimeter',
        recommendedPattern: 'K-D Trees (Nearest Neighbor)',
        linkedId: 'kd-tree-nearest-neighbor',
        linkedKind: 'algorithm',
        whyItFits: 'Partitions interior points for O(log n) proximity queries.',
      },
      {
        ifYouSee: 'Lower envelope of 1D linear DP transitions y = m_j·x + b_j',
        recommendedPattern: 'Convex Hull Trick (DP Opt)',
        linkedId: 'convex-hull-trick',
        linkedKind: 'algorithm',
        whyItFits: 'Projective point-line dual of 2D Convex Hull.',
      },
    ],
  },

  'reservoir-sampling': {
    formalDefinition:
      'Reservoir Sampling (Algorithm R) selects a uniformly random sample of size k from a stream of unknown or unbounded length n in a single O(n) pass using strictly O(k) memory, guaranteeing every item has exact inclusion probability k / n.',
    problemStatementForm:
      'Given an unbounded linked list or real-time event stream (Linked List Random Node, Random Pick Index), pick k items uniformly at random without knowing n beforehand.',
    logicBoard: [
      {
        step: '01 · Fill Initial Reservoir',
        condition: 'First k stream items (index i = 0..k-1)',
        action: 'Store reservoir[i] = item_i directly',
        invariant: 'After k items, every seen item has probability k / k = 1',
      },
      {
        step: '02 · Draw Random Index',
        condition: 'Incoming stream item at 0-based index i >= k (total seen = i + 1)',
        action: 'Generate uniform integer r ∈ [0, i]',
        invariant: 'P(r < k) = k / (i + 1)',
      },
      {
        step: '03 · Conditional Replacement',
        condition: 'r < k',
        action: 'Overwrite reservoir[r] = item_i (else ignore item_i)',
        invariant: 'Every previously stored item survives with probability 1 - (k/(i+1))·(1/k) = i / (i + 1)',
      },
      {
        step: '04 · Stream Ends',
        condition: 'End of stream at length n',
        action: 'Return reservoir[0..k-1]',
        invariant: 'Telescoping product proves every item 0..n-1 finishes with exact probability k / n',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Inductive Uniformity Telescoping Proof',
          formula: 'P(item_i survives to n) = (k / i) × ∏_{m = i+1}^{n} (1 - 1/m) = (k / i) × (i / n) = k / n',
          meaning: 'Exact uniform probability k / n without ever knowing total stream length n in advance.',
        },
        {
          name: 'Weighted Stream Extension (A-Res)',
          formula: 'key_i = U(0, 1)^{1 / w_i};   keep top-k largest keys in Min-Heap',
          meaning: 'Generalizes uniform sampling to weighted streaming items in O(n log k).',
        },
      ],
      proofSketch:
        'Induct on n ≥ k: assuming each of the first n - 1 items is in the reservoir with probability k/(n-1), item n enters with probability k/n, and any previous resident survives iff it is NOT overwritten: P(survive) = (k/(n-1)) · (1 - (k/n)·(1/k)) = (k/(n-1)) · ((n-1)/n) = k/n.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Random sample from huge linked list or unknown-length event stream in O(k) memory',
        recommendedPattern: 'Reservoir Sampling',
        linkedId: 'reservoir-sampling',
        linkedKind: 'algorithm',
        whyItFits: 'Provably uniform O(k)-space single-pass stream sampling.',
      },
      {
        ifYouSee: 'Count distinct items across an unbounded stream in O(1) memory',
        recommendedPattern: 'HyperLogLog',
        linkedId: 'hyperloglog',
        linkedKind: 'algorithm',
        whyItFits: 'Estimates cardinality rather than drawing random item samples.',
      },
      {
        ifYouSee: 'Estimate heavy-hitter item frequencies in a stream',
        recommendedPattern: 'Count-Min Sketch',
        linkedId: 'count-min-sketch',
        linkedKind: 'algorithm',
        whyItFits: 'Sublinear frequency sketch tracks top-frequency elements accurately.',
      },
    ],
  },

  quickselect: {
    formalDefinition:
      'Hoare’s Quickselect finds the k-th smallest (or largest) order statistic in an unsorted array in O(n) expected time and O(1) extra space by partitioning around a randomized pivot and recursing strictly into the single half containing target index k.',
    problemStatementForm:
      'Given an unsorted array (Kth Largest Element, K Closest Points to Origin, Top K Frequent), find the k-th order statistic without O(n log n) full sorting.',
    logicBoard: [
      {
        step: '01 · Randomize Pivot',
        condition: 'Active range [lo, hi]',
        action: 'Pick random index pIdx ∈ [lo, hi] and swap to hi (breaks adversarial sorted worst case!)',
        invariant: 'Randomization guarantees O(n) expected time regardless of input order',
      },
      {
        step: '02 · 3-Way Dutch Flag Partition',
        condition: 'Partitioning [lo, hi] around pivot (3-way handles many duplicates!)',
        action: 'Split into < pivot ([lo..lt-1]), == pivot ([lt..gt]), > pivot ([gt+1..hi])',
        invariant: 'Prevents O(n²) degradation on arrays with thousands of duplicate values',
      },
      {
        step: '03 · Prune One Side Completely',
        condition: 'Compare target index k against [lt, gt]',
        action: 'If lt <= k <= gt return pivot; if k < lt recurse left [lo, lt-1]; else recurse right [gt+1, hi]',
        invariant: 'Recurses on ONLY ONE side (unlike QuickSort’s two recursive calls)',
      },
      {
        step: '04 · Worst-Case Guarantee Option',
        condition: 'Strict O(n) deterministic worst case required',
        action: 'Use Median-of-Medians (BFPRT groups of 5) pivot selection',
        invariant: 'Eliminates ≥ 30% of elements deterministically per pass → strict O(n) worst case',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Geometric Series Linear Expected Runtime',
          formula: 'T(n) = T(n/2) + O(n)  ⟹  n + n/2 + n/4 + … = 2n = O(n) expected',
          meaning: 'Single-branch recursion collapses QuickSort’s O(n log n) down to linear O(n).',
        },
        {
          name: 'BFPRT Deterministic Recurrence',
          formula: 'T(n) ≤ T(n/5) + T(7n/10) + O(n)  ⟹  (1/5 + 7/10 = 9/10 < 1)  ⟹  T(n) = O(n) worst-case',
          meaning: 'Proves deterministic linear-time selection is mathematically achievable.',
        },
      ],
      proofSketch:
        'A random pivot falls in the middle 50% of [lo, hi] with probability 1/2, shrinking the active range to ≤ 3/4 its size. Expected iterations to shrink by 3/4 is 2, giving a geometric series ∑ (3/4)^j · 2n = 8n = O(n).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Kth Largest Element, K Closest Points, or Top K Frequent on static unsorted array',
        recommendedPattern: 'Quickselect',
        linkedId: 'quickselect',
        linkedKind: 'algorithm',
        whyItFits: 'Expected O(n) time and O(1) space beats O(n log n) sorting and O(n log k) heaps.',
      },
      {
        ifYouSee: 'Streaming data where new elements arrive continuously and median/Top-K updates online',
        recommendedPattern: 'Two-Heap Median Maintenance',
        linkedId: 'dual-heaps-median',
        linkedKind: 'algorithm',
        whyItFits: 'Quickselect needs the full array upfront; heaps maintain streaming order stats.',
      },
      {
        ifYouSee: 'Need ALL elements sorted stably',
        recommendedPattern: 'Merge Sort Divide & Conquer',
        linkedId: 'merge-sort-divide-conquer',
        linkedKind: 'algorithm',
        whyItFits: 'Quickselect leaves sides unsorted; Merge Sort sorts everything stably in O(n log n).',
      },
    ],
  },

  'bloom-filter': {
    formalDefinition:
      'A Bloom Filter is a space-efficient probabilistic bit-array of m bits paired with k independent hash functions supporting O(k) insert and membership tests with ZERO false negatives and a tunable false-positive probability p ≈ (1 - e^{-kn/m})^k.',
    problemStatementForm:
      'Filter nonexistent keys in front of expensive disk/database lookups (LSM-Tree SSTables, CDN one-hit wonders, web crawler deduplication) using ~10 bits per key instead of full key storage.',
    logicBoard: [
      {
        step: '01 · Size Parameters (m, k)',
        condition: 'Target capacity n items and acceptable false-positive rate p (e.g., 1%)',
        action: 'Compute m = ⌈-n·ln(p) / (ln 2)²⌉ bits (~9.6 bits/key for 1%) and k = ⌈(m/n)·ln 2⌉ hashes (~7)',
        invariant: 'Optimal k makes bit array ≈ 50% filled at capacity n, maximizing entropy',
      },
      {
        step: '02 · Insert via Double Hashing',
        condition: 'Inserting key x',
        action: 'Compute h_i(x) = (h₁(x) + i·h₂(x)) mod m for i = 0..k-1 and set bit[h_i(x)] = 1',
        invariant: 'Kirsch-Mitzenmacher Theorem: 2 independent hashes generate all k positions with zero FPR loss',
      },
      {
        step: '03 · Query Membership',
        condition: 'Testing whether key x may exist',
        action: 'If ANY bit[h_i(x)] === 0 return DEFINITELY NOT PRESENT; if all k bits are 1 return PROBABLY PRESENT',
        invariant: 'Zero false negatives: inserted keys never have any of their k bits cleared',
      },
      {
        step: '04 · Deletion Constraint',
        condition: 'Application requires deleting keys',
        action: 'Do NOT flip bits to 0 (breaks other keys!); upgrade to Counting Bloom Filter or Cuckoo Filter',
        invariant: 'Standard Bloom Filter is insert-only; Cuckoo Filters support O(1) delete cleanly',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'False-Positive Probability Formula',
          formula: 'p ≈ ( 1 - e^{-k n / m} )^k,   optimal k* = (m / n) · ln 2 ≈ 0.693 · (m / n)',
          meaning: 'At optimal k*, each additional ~4.8 bits/key cuts false-positive rate by 10×.',
        },
        {
          name: 'Required Bit Budget per Element',
          formula: 'm / n = -ln(p) / (ln 2)² ≈ 1.44 · log₂(1 / p)   (1% FPR ⇒ ~9.6 bits/key)',
          meaning: '100 million keys fit in ~120 MB RAM at 1% FPR vs gigabytes for a HashSet.',
        },
      ],
      proofSketch:
        'After inserting n keys (k·n independent bit writes), the probability a specific bit stays 0 is (1 - 1/m)^{kn} ≈ e^{-kn/m}. All k bits of an unseen key are 1 with probability (1 - e^{-kn/m})^k; differentiating with respect to k yields optimal k* = (m/n) ln 2.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Avoid pointless disk reads for missing keys (RocksDB/Cassandra SSTables, crawler dedup)',
        recommendedPattern: 'Bloom Filter',
        linkedId: 'bloom-filter',
        linkedKind: 'algorithm',
        whyItFits: 'Guarantees zero false negatives in ~10 bits/key and O(k) lookup.',
      },
      {
        ifYouSee: 'Need approximate item FREQUENCIES (not just binary membership)',
        recommendedPattern: 'Count-Min Sketch',
        linkedId: 'count-min-sketch',
        linkedKind: 'algorithm',
        whyItFits: 'Replaces 1-bit flags with counter rows taking minimum across d hashes.',
      },
      {
        ifYouSee: 'Must store actual key-value payloads with zero false positives',
        recommendedPattern: 'Hash Table Chaining & Open Addressing',
        linkedId: 'hash-table-probing',
        linkedKind: 'algorithm',
        whyItFits: 'Exact key storage resolves collisions deterministically.',
      },
    ],
  },

  'skip-list': {
    formalDefinition:
      'A Skip List layers multiple probabilistic express-lane sorted linked lists atop a base sorted list where each node promotes to level l + 1 with probability p (typically 1/2 or 1/4), achieving O(log n) expected search, insert, delete, and range scan without complex tree rotations.',
    problemStatementForm:
      'Implement an ordered set/map or concurrent in-memory sorted index (Redis Sorted Sets, LevelDB/RocksDB MemTable) supporting O(log n) point lookup and sequential range scans.',
    logicBoard: [
      {
        step: '01 · Top-Down Express Descent',
        condition: 'Searching or locating insert predecessors for key target',
        action: 'Start at top level L_max; move right while curr.next[lvl].key < target; record update[lvl] = curr; drop lvl--',
        invariant: 'Each level drop narrows the horizontal search gap by factor 1/p',
      },
      {
        step: '02 · Geometric Coin-Flip Height',
        condition: 'Inserting new node',
        action: 'Start lvl = 1; while Math.random() < p && lvl < MAX_LVL increment lvl++',
        invariant: 'Expected nodes at level k is n · p^{k-1}, mimicking balanced tree fanout without rotations',
      },
      {
        step: '03 · Local Pointer Splice',
        condition: 'Splicing new node at levels 0..newLvl-1',
        action: 'Set node.next[i] = update[i].next[i]; update[i].next[i] = node (and update span counts for O(log n) rank)',
        invariant: 'Only touches local predecessor pointers → far easier to make lock-free than RB-trees',
      },
      {
        step: '04 · Range Scan & Delete',
        condition: 'Range query [L, R] or node deletion',
        action: 'Descend to L in O(log n), then walk level-0 next pointers in O(k); delete unlinks update[i].next[i]',
        invariant: 'Level-0 linked scan delivers fast sequential range iteration',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Expected Height & Search Path Bound',
          formula: 'E[height] = O(log_{1/p} n),   E[comparisons] ≤ (1/p) · log_{1/p} n = O(log n)',
          meaning: 'p = 1/4 (used by Redis ZSET) averages only 1.33 pointers per node while staying O(log n).',
        },
        {
          name: 'Expected Pointer Space Overhead',
          formula: 'E[pointers / node] = ∑_{k=0}^{∞} p^k = 1 / (1 - p)   (p=0.5 ⇒ 2.0,  p=0.25 ⇒ 1.33)',
          meaning: 'Total expected memory is strictly linear O(n).',
        },
      ],
      proofSketch:
        'Tracing a search path backward from target to head: at each step we move up a level with probability p or left with probability 1 - p. Reaching top level L = log_{1/p} n requires an expected L/p steps (negative binomial expectation), proving O(log n) expected time.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Design Skiplist, Redis ZSET leaderboard, or lock-free concurrent MemTable',
        recommendedPattern: 'Skip Lists',
        linkedId: 'skip-list',
        linkedKind: 'algorithm',
        whyItFits: 'Local pointer splicing beats Red-Black rotations for concurrency and simplicity.',
      },
      {
        ifYouSee: 'Need strict deterministic O(log n) worst-case (no probabilistic tail)',
        recommendedPattern: 'AVL & Red-Black Trees',
        linkedId: 'avl-red-black-trees',
        linkedKind: 'algorithm',
        whyItFits: 'Guarantees worst-case height without relying on random coin flips.',
      },
      {
        ifYouSee: 'Persisting sorted MemTable runs to disk with compaction',
        recommendedPattern: 'LSM-Tree Flushing & Compaction',
        linkedId: 'lsm-tree-compaction',
        linkedKind: 'algorithm',
        whyItFits: 'Skip Lists directly serve as the mutable in-memory MemTable inside LSM-Trees.',
      },
    ],
  },

  'count-min-sketch': {
    formalDefinition:
      'Count-Min Sketch is a sublinear probabilistic frequency table of d rows × w counters using d pairwise-independent hashes; increments add Δ to row i column h_i(x), and queries return the MINIMUM across all d rows—never underestimating true counts while bounding overestimation error within ε·N with probability ≥ 1 - δ.',
    problemStatementForm:
      'Track per-key frequencies, DDoS IP traffic bursts, or Heavy Hitters over a massive high-cardinality stream in fixed O(w·d) kilobytes of memory.',
    logicBoard: [
      {
        step: '01 · Dimension Grid (w, d)',
        condition: 'Target error tolerance ε and failure probability δ',
        action: 'Set width w = ⌈e / ε⌉ and depth d = ⌈ln(1 / δ)⌉; initialize C[d][w] = 0',
        invariant: 'Memory is O((1/ε) · ln(1/δ)) — completely independent of stream size N and distinct keys',
      },
      {
        step: '02 · Update All d Rows',
        condition: 'Item x arrives with non-negative weight Δ (usually 1)',
        action: 'For row r = 0..d-1: C[r][h_r(x) % w] += Δ',
        invariant: 'Conservative Update variant only increments the minimum counters to cut collision noise',
      },
      {
        step: '03 · Query Point Minimum',
        condition: 'Estimating frequency f̂(x)',
        action: 'Return min_{r=0..d-1} C[r][h_r(x) % w]',
        invariant: 'Because all Δ ≥ 0, C[r][h_r(x)] ≥ f(x) always → ZERO underestimation; min picks least-collided row',
      },
      {
        step: '04 · Merge Distributed Sketches',
        condition: 'Aggregating metrics across distributed cluster nodes',
        action: 'Element-wise add C_total[r][c] = C_A[r][c] + C_B[r][c] (using identical hashes)',
        invariant: 'Linear homomorphism enables exact parallel map-reduce aggregation',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'PAC (ε, δ) Error Guarantee',
          formula: 'f(x) ≤ f̂(x) ≤ f(x) + ε · ||a||₁   with probability ≥ 1 - δ,   w = ⌈e/ε⌉,  d = ⌈ln(1/δ)⌉',
          meaning: 'Guarantees tight frequency bounds for heavy hitters in constant memory.',
        },
        {
          name: 'Markov + Independence Tail Proof',
          formula: 'E[noise_r] ≤ ||a||₁ / w = ε||a||₁ / e  ⟹  P(noise_r > ε||a||₁) ≤ 1/e  ⟹  P(∀r fail) ≤ e^{-d} ≤ δ',
          meaning: 'Multiplying independent 1/e failure probabilities across d rows drives error exponentially to 0.',
        },
      ],
      proofSketch:
        'In row r, expected collision noise from other keys is ∑_{y≠x} f(y)·P(h_r(y)=h_r(x)) ≤ N/w = εN/e. By Markov’s inequality, row r exceeds error εN with probability ≤ 1/e. Taking the minimum over d independent rows fails only if ALL d rows fail: probability ≤ (1/e)^d ≤ δ.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Streaming Heavy Hitters, network flow frequency, or TinyLFU cache admission',
        recommendedPattern: 'Count-Min Sketch',
        linkedId: 'count-min-sketch',
        linkedKind: 'algorithm',
        whyItFits: 'Tracks streaming frequencies with provable (ε, δ) bounds in kilobytes.',
      },
      {
        ifYouSee: 'Only need binary set membership (seen vs unseen)',
        recommendedPattern: 'Bloom Filter',
        linkedId: 'bloom-filter',
        linkedKind: 'algorithm',
        whyItFits: '1-bit flags use far less memory than 32-bit counters when frequency isn’t needed.',
      },
      {
        ifYouSee: 'Need COUNT OF DISTINCT elements (cardinality) rather than per-item frequency',
        recommendedPattern: 'HyperLogLog',
        linkedId: 'hyperloglog',
        linkedKind: 'algorithm',
        whyItFits: 'Estimates billions of unique items in ~1.5 KB RAM.',
      },
    ],
  },

  hyperloglog: {
    formalDefinition:
      'HyperLogLog (HLL) estimates the number of distinct elements (cardinality) in a massive stream using O(log log N) bits per register—splitting hashed keys across m = 2^p registers that record the maximum leading-zero run ρ(w) and combining them via bias-corrected Harmonic Mean in ~1.5 KB RAM with ~0.81% standard error.',
    problemStatementForm:
      'Count billions of unique visitors, search queries, or SQL COUNT(DISTINCT user_id) in real time across distributed shards without storing gigabytes of hash sets.',
    logicBoard: [
      {
        step: '01 · Hash & Partition Bits',
        condition: 'Incoming element x hashed to 64-bit uniform hash h = hash64(x)',
        action: 'Use top p bits as bucket index idx = h >>> (64 - p) (m = 2^p registers); take remaining bits w',
        invariant: 'Stochastic averaging across m buckets crushes single-register variance by 1/√m',
      },
      {
        step: '02 · Update Max Leading Zeros',
        condition: 'Compute ρ(w) = leadingZeros(w) + 1',
        action: 'Set M[idx] = Math.max(M[idx], ρ(w))',
        invariant: 'Seeing a run of k leading zeros happens with probability 2^{-k} → suggests ~2^k uniques',
      },
      {
        step: '03 · Harmonic Mean Aggregation',
        condition: 'Querying estimated cardinality',
        action: 'Compute E = α_m · m² · ( ∑_{j=0}^{m-1} 2^{-M[j]} )^{-1}',
        invariant: 'Harmonic mean suppresses outlier registers with lucky long zero runs',
      },
      {
        step: '04 · Small-Range & Parallel Merge',
        condition: 'Low cardinality (E ≤ 2.5m with V zero registers) OR merging two shards A and B',
        action: 'Small range → LinearCounting m·ln(m/V); Distributed merge → M_merged[j] = max(M_A[j], M_B[j])',
        invariant: 'Lossless idempotent max-merge forms a join-semilattice CRDT (Redis PFADD/PFMERGE)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'HyperLogLog Harmonic Mean Estimator',
          formula: 'E = α_m · m² / ( ∑_{j=0}^{m-1} 2^{-M[j]} ),   α_m ≈ 0.7213 / (1 + 1.079/m)',
          meaning: 'Bias-corrected harmonic mean of per-bucket 2^{M[j]} estimates.',
        },
        {
          name: 'Standard Error & Memory Footprint',
          formula: 'σ_rel ≈ 1.04 / √m   (p = 14 ⇒ m = 16,384 registers ⇒ 12 KB RAM ⇒ 0.81% error)',
          meaning: 'Counts up to 10⁹+ distinct users in 12 KB (Redis HyperLogLog specification).',
        },
      ],
      proofSketch:
        'Each of m registers sees ~n/m unique items; its max leading-zero position M[j] concentrates around log₂(n/m). Taking the harmonic mean of 2^{M[j]} cancels right-tail outlier variance, yielding asymptotic bias factor α_m and standard error 1.04/√m (Flajolet et al. 2007).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Unique visitor counts, Redis PFCOUNT, or approximate SQL COUNT(DISTINCT) at scale',
        recommendedPattern: 'HyperLogLog',
        linkedId: 'hyperloglog',
        linkedKind: 'algorithm',
        whyItFits: '0.8% accuracy across billions of uniques in 12 KB with exact max-merge.',
      },
      {
        ifYouSee: 'Per-item frequency estimation (heavy hitters) rather than distinct count',
        recommendedPattern: 'Count-Min Sketch',
        linkedId: 'count-min-sketch',
        linkedKind: 'algorithm',
        whyItFits: 'Estimates individual key frequencies rather than total distinct set size.',
      },
      {
        ifYouSee: 'State-based distributed counter/set merging without consensus',
        recommendedPattern: 'CRDTs (G-Counter & OR-Set)',
        linkedId: 'crdt-gcounter-orset',
        linkedKind: 'algorithm',
        whyItFits: 'HLL’s element-wise max merge is itself a join-semilattice CRDT.',
      },
    ],
  },

  'cache-lru-lfu-arc': {
    formalDefinition:
      'Cache Replacement Policies evict cold entries under fixed capacity C in O(1) per access: LRU pairs a Hash Map with a Doubly Linked List by recency; LFU layers frequency-bucketed Doubly Linked Lists tracking minFreq; ARC adaptively balances recency (T1) vs frequency (T2) using ghost eviction lists (B1, B2).',
    problemStatementForm:
      'Design an O(1) get/put bounded cache (LRU Cache, LFU Cache, database buffer pool) resistant to sequential scan pollution while maximizing hit ratio.',
    logicBoard: [
      {
        step: '01 · O(1) Direct Node Lookup',
        condition: 'get(key) or put(key, val) called',
        action: 'Look up node pointer directly in map.get(key) in O(1)',
        invariant: 'Hash Map eliminates O(C) linked-list scanning on every access',
      },
      {
        step: '02 · Promote Recency / Frequency',
        condition: 'Cache hit on existing node',
        action: 'LRU: detach node & move to DLL head. LFU: detach from freqBucket[f], insert into freqBucket[f+1], bump minFreq if old bucket empties',
        invariant: 'Every pointer rewire executes in strictly O(1) time',
      },
      {
        step: '03 · Capacity Eviction',
        condition: 'Inserting new key when map.size === capacity',
        action: 'LRU: evict DLL tail. LFU: evict LRU tail of freqBucket[minFreq], then set new minFreq = 1',
        invariant: 'Evicts exact coldest entry while breaking LFU frequency ties by LRU recency',
      },
      {
        step: '04 · ARC Scan-Resistance Adaptation',
        condition: 'One-time full table scan threatens to flush hot working set (LRU flaw)',
        action: 'Track ghost keys in B1 (recency evicted) & B2 (frequency evicted); shift target split p toward whichever ghost list hits',
        invariant: 'Self-tunes recency vs frequency dynamically with zero manual tuning knobs',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Strict O(1) Cache Complexity',
          formula: 'get(k): O(1),   put(k, v): O(1),   Space: O(C)   (LRU, LFU, ARC)',
          meaning: 'Zero heap O(log C) overhead via doubly linked frequency buckets.',
        },
        {
          name: 'ARC Adaptive Split Parameter Update',
          formula: 'Hit B1 ⇒ p = min(C, p + max(1, |B2|/|B1|))   |   Hit B2 ⇒ p = max(0, p - max(1, |B1|/|B2|))',
          meaning: 'Automatically grows T1 on recency workloads and T2 on frequency workloads.',
        },
      ],
      proofSketch:
        'In LFU, minFreq can only reset to 1 on a brand-new insert or increment by +1 when the last node in freqBucket[minFreq] is promoted. Thus tracking minFreq as an integer scalar maintains the exact global minimum frequency in O(1) without a priority queue.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Design LRU Cache, LFU Cache, or scan-resistant DB buffer pool (ARC / W-TinyLFU)',
        recommendedPattern: 'Cache Replacement (LRU / LFU / ARC)',
        linkedId: 'cache-lru-lfu-arc',
        linkedKind: 'algorithm',
        whyItFits: 'Hash Map + Doubly Linked List buckets guarantee strict O(1) get/put/evict.',
      },
      {
        ifYouSee: 'Compact frequency filter for W-TinyLFU cache admission (Caffeine)',
        recommendedPattern: 'Count-Min Sketch',
        linkedId: 'count-min-sketch',
        linkedKind: 'algorithm',
        whyItFits: 'Estimates access frequency of evicted keys in tiny memory.',
      },
      {
        ifYouSee: 'Distributing cached keys across multiple cache servers',
        recommendedPattern: 'Consistent Hashing & DHT',
        linkedId: 'consistent-hashing-dht',
        linkedKind: 'algorithm',
        whyItFits: 'Minimizes cache invalidation storm when a cache node joins or crashes.',
      },
    ],
  },

  'buddy-memory-allocator': {
    formalDefinition:
      'The Buddy Memory Allocator partitions a 2^M-byte memory pool into power-of-two blocks stored in free lists by order k ∈ [0..M], splitting larger blocks on allocation and coalescing freed blocks with their exact XOR buddy address (addr ⊕ 2^k) in O(log(poolSize)) time.',
    problemStatementForm:
      'Implement a fast OS kernel page-frame allocator (Linux page allocator) supporting O(log M) malloc/free with automatic external-fragmentation coalescing.',
    logicBoard: [
      {
        step: '01 · Round Up to Power of 2',
        condition: 'Allocation request for S bytes',
        action: 'Compute minimal order k = ceil(log₂(max(S, minBlockSize)))',
        invariant: 'Every allocated block has size 2^k aligned to a multiple of 2^k',
      },
      {
        step: '02 · Split Larger Free Block',
        condition: 'freeList[k] is empty',
        action: 'Find smallest j > k with non-empty freeList[j]; split down j → k pushing each right half onto freeList[r]',
        invariant: 'At most M splits occur → O(log(poolSize)) allocation time',
      },
      {
        step: '03 · XOR Buddy Address Math',
        condition: 'Freeing block at offset addr of order k',
        action: 'Compute exact buddy offset buddyAddr = addr ^ (1 << k) in O(1)',
        invariant: 'Two buddies always share the exact same parent block aligned to 2^{k+1}',
      },
      {
        step: '04 · Coalesce Upward',
        condition: 'buddyAddr is currently free in freeList[k]',
        action: 'Remove buddy from freeList[k], merge at base = Math.min(addr, buddyAddr), increment k++, repeat',
        invariant: 'Eliminates external fragmentation by reassembling maximal contiguous power-of-2 slabs',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'XOR Buddy Partner Identity',
          formula: 'buddy(addr, k) = addr ⊕ 2^k,   mergedBase = addr & ~(2^k)',
          meaning: 'Single CPU XOR instruction locates the unique sibling block in O(1).',
        },
        {
          name: 'Internal Fragmentation Tradeoff',
          formula: 'Alloc/Free = O(log₂(M / minBlock));   worst-case internal waste < 50% (avg ~25%)',
          meaning: 'Fast O(1) buddy math trades internal rounding waste (mitigated by Slab/SLUB allocators).',
        },
      ],
      proofSketch:
        'Because every block of order k is aligned to 2^k, bit k of its offset is 0 for a left child and 1 for its right buddy, while all bits > k are identical. Flipping bit k via XOR 2^k therefore yields the exact unique buddy address.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'OS page-frame allocator, fast power-of-2 memory coalescing, or low-level memory manager',
        recommendedPattern: 'Buddy Memory Allocator',
        linkedId: 'buddy-memory-allocator',
        linkedKind: 'algorithm',
        whyItFits: 'O(log M) splitting and O(1) XOR buddy coalescing defeat external fragmentation.',
      },
      {
        ifYouSee: 'Low-level bitwise mask/power-of-2 address manipulation',
        recommendedPattern: 'Bit Manipulation',
        linkedId: 'bit-manipulation',
        linkedKind: 'algorithm',
        whyItFits: 'Buddy alignment relies directly on XOR and power-of-2 bit masks.',
      },
      {
        ifYouSee: 'Multi-threaded lock-free free-list pops without mutex contention',
        recommendedPattern: 'Lock-Free CAS Loops & RCU',
        linkedId: 'lockfree-cas-rcu',
        linkedKind: 'algorithm',
        whyItFits: 'Eliminates global allocator locks under high core counts.',
      },
    ],
  },

  'persistent-data-structures': {
    formalDefinition:
      'Persistent Data Structures preserve all historical versions immutably across updates by Path Copying—allocating only the O(log n) newly modified nodes along the root-to-leaf path while structurally sharing all untouched subtrees with previous roots.',
    problemStatementForm:
      'Support time-travel queries on historical versions (Snapshot Array, K-th smallest element in arbitrary subarray [L, R] via Persistent Segment Tree, Git commits, immutable Redux/Clojure state).',
    logicBoard: [
      {
        step: '01 · Allocate New Root per Version',
        condition: 'Mutating version v at position idx to produce version v + 1',
        action: 'Never overwrite existing nodes; clone ONLY the current node along the active search path',
        invariant: 'All prior root pointers remain 100% immutable and thread-safe to read concurrently',
      },
      {
        step: '02 · Structural Subtree Sharing',
        condition: 'Cloning internal node covering [l, r]',
        action: 'Point unchanged child directly to oldNode.child; recursively clone ONLY the modified branch',
        invariant: 'Each update allocates strictly O(log n) new nodes instead of O(n) full copy',
      },
      {
        step: '03 · Prefix-Version Subtraction (Range Kth)',
        condition: 'Finding K-th smallest element in static subarray A[L..R]',
        action: 'Build prefix frequency trees root[0..n]; descend simultaneously using leftCount = root[R].left.cnt - root[L-1].left.cnt',
        invariant: 'Tree difference root[R] - root[L-1] encodes exact sorted multiset of A[L..R] in O(log n)',
      },
      {
        step: '04 · Fat Node Alternative',
        condition: 'Need O(1) space per modification on pointer-rich graphs',
        action: 'Store timestamped version logs inside each node (Fat Node) and binary-search by version ID',
        invariant: 'Trades slightly slower reads for O(1) extra space per update',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Path-Copying Memory & Time Bound',
          formula: 'Space per update = O(log n),   Total Space for Q updates = O(n + Q log n)',
          meaning: 'Stores 10⁵ full tree snapshots in ~20 MB instead of O(n·Q) terabytes.',
        },
        {
          name: 'Persistent Segment Tree Range-Kth Formula',
          formula: 'countInRange(L, R, leftHalf) = root[R].left.sum - root[L - 1].left.sum',
          meaning: 'Answers online K-th smallest in any subarray [L, R] in O(log n) time.',
        },
      ],
      proofSketch:
        'Because each point update touches a single root-to-leaf path of length ⌈log₂ n⌉ + 1, cloning only path nodes leaves all other nodes unmodified and reachable from both old and new roots, guaranteeing immutability in O(log n) time and space.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'K-th smallest in arbitrary subarray [L, R], Snapshot Array, or immutable versioned state',
        recommendedPattern: 'Persistent Path Copying & Fat Nodes',
        linkedId: 'persistent-data-structures',
        linkedKind: 'algorithm',
        whyItFits: 'O(log n) structural sharing unlocks time-travel queries and lock-free snapshots.',
      },
      {
        ifYouSee: 'Single mutable version without historical rollback queries',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'In-place array Segment Tree has lower constant factors when history isn’t needed.',
      },
      {
        ifYouSee: 'Content-addressed cryptographic version trees (Git / DynamoDB anti-entropy)',
        recommendedPattern: 'Merkle Trees (Anti-Entropy Sync)',
        linkedId: 'merkle-tree-sync',
        linkedKind: 'algorithm',
        whyItFits: 'Hashes each immutable node so identical shared subtrees deduplicate cryptographically.',
      },
    ],
  },

  'lockfree-cas-rcu': {
    formalDefinition:
      'Lock-Free Concurrency replaces blocking mutexes with atomic hardware Compare-And-Swap (CAS) retry loops (Michael-Scott Queue, Treiber Stack) and Read-Copy-Update (RCU) grace-period reclamation so readers execute with ZERO locks and at least one thread always makes system-wide progress.',
    problemStatementForm:
      'Build high-throughput concurrent queues, reference counters, or read-mostly OS routing tables that eliminate deadlock, priority inversion, and lock-convoy stalls.',
    logicBoard: [
      {
        step: '01 · Atomic CAS Retry Loop',
        condition: 'Mutating shared head/tail pointer without a mutex',
        action: 'Loop: read expected = ptr; prepare nextNode; retry until atomicCAS(&ptr, expected, nextNode) succeeds',
        invariant: 'Failure only happens because ANOTHER thread succeeded → system-wide progress guaranteed',
      },
      {
        step: '02 · Defeat ABA Corruption',
        condition: 'Pointer changes A → B → A between load and CAS (freed memory reused at same address)',
        action: 'Attach monotonic version tag (Tagged Pointer <addr, stamp>) OR defer free via Hazard Pointers / Epoch Reclamation',
        invariant: 'Tagged CAS checks both address AND generation counter atomically',
      },
      {
        step: '03 · Michael-Scott Cooperative Tail Help',
        condition: 'Enqueue sees tail.next !== null (another thread inserted but hasn’t swung tail yet)',
        action: 'Help advance tail via CAS(tail, oldTail, next) before retrying own enqueue',
        invariant: 'Prevents a stalled writer from ever blocking subsequent enqueuers',
      },
      {
        step: '04 · RCU Wait-Free Readers',
        condition: 'Read-heavy (>95% reads) kernel/config table update',
        action: 'Writer copies object, mutates copy, atomically swaps pointer, waits one Grace Period (all prior readers exit), then frees old copy',
        invariant: 'Readers pay zero atomic RMW instructions and zero cache-line bouncing',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Hardware Atomic Compare-And-Swap Semantics',
          formula: 'CAS(addr, exp, val) ≡ atomic { if (*addr == exp) { *addr = val; return true; } return false; }',
          meaning: 'Consensus number ∞ (Herlihy’s Hierarchy): universal primitive for any lock-free object.',
        },
        {
          name: 'RCU Grace-Period Safety Condition',
          formula: 'free(oldCopy) safe  ⟺  t_free > max_{r ∈ activeReaders(t_publish)} t_exit(r)',
          meaning: 'Guarantees zero use-after-free while keeping readers completely lock-free.',
        },
      ],
      proofSketch:
        'A CAS operation fails only if a concurrent thread modified the target word since the caller’s load, meaning another thread completed a step. Therefore no deadlock or livelock can stall all threads simultaneously (lock-free progress).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'High-contention multi-core queue, wait-free config reloads, or eliminating mutex deadlocks',
        recommendedPattern: 'Lock-Free CAS Loops & RCU',
        linkedId: 'lockfree-cas-rcu',
        linkedKind: 'algorithm',
        whyItFits: 'Atomic CAS + RCU grace periods eliminate lock convoys and priority inversion.',
      },
      {
        ifYouSee: 'Concurrent ordered map/index amenable to lock-free CAS splicing',
        recommendedPattern: 'Skip Lists',
        linkedId: 'skip-list',
        linkedKind: 'algorithm',
        whyItFits: 'ConcurrentSkipListMap uses CAS on forward pointers without global tree rotations.',
      },
      {
        ifYouSee: 'Immutable structural sharing for safe concurrent snapshots',
        recommendedPattern: 'Persistent Path Copying & Fat Nodes',
        linkedId: 'persistent-data-structures',
        linkedKind: 'algorithm',
        whyItFits: 'Copy-on-write path copying is the exact foundation of RCU data updates.',
      },
    ],
  },

  'bplus-tree-storage': {
    formalDefinition:
      'A B+ Tree is a disk-optimized balanced m-ary search tree where internal nodes store routing keys only (maximizing fanout B per 4KB–16KB page) and all record payloads live in doubly linked leaf pages, guaranteeing O(log_B N) disk I/Os (3–4 pages for billions of rows) and fast sequential range scans.',
    problemStatementForm:
      'Design a relational database primary/secondary index (PostgreSQL, MySQL InnoDB, SQLite) supporting ACID point lookups, ordered BETWEEN range scans, and balanced updates on SSD/HDD pages.',
    logicBoard: [
      {
        step: '01 · High-Fanout Page Descent',
        condition: 'Searching key k from root page',
        action: 'Binary-search separator keys inside each internal page (fanout B ≈ 500–1000) down to leaf page',
        invariant: 'All leaves sit at identical depth h = ⌈log_{B/2} N⌉ ≈ 3–4 for 10⁹ rows',
      },
      {
        step: '02 · Leaf Split & Copy-Up',
        condition: 'Inserting into a full leaf page (keys === order)',
        action: 'Split leaf into two half-full pages, link sibling pointers, and COPY UP first key of right leaf to parent',
        invariant: 'Every key remains in the leaf layer so leaf scans never revisit internal nodes',
      },
      {
        step: '03 · Internal Split & Push-Up',
        condition: 'Parent internal page overflows from promoted separator',
        action: 'Split internal node and PUSH UP median key to grandparent (grows height by +1 only when root splits)',
        invariant: 'Maintains ≥ 50% page occupancy across all non-root pages',
      },
      {
        step: '04 · Underflow Borrow / Merge & Sibling Scan',
        condition: 'Deletion drops leaf below ⌈B/2⌉ - 1 keys OR range query BETWEEN L AND R',
        action: 'Borrow from adjacent sibling or merge two underfull siblings; range scan follows leaf.next pointers sequentially',
        invariant: 'Range scans execute sequential page I/O instead of repeated root-to-leaf descents',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'B+ Tree Disk I/O Height Bound',
          formula: 'h ≤ ⌊ log_{⌈B/2⌉} ((N + 1) / 2) ⌋ + 1   (B = 500, N = 10⁹ ⇒ h ≤ 4 disk pages)',
          meaning: 'Upper 2–3 levels stay pinned in RAM buffer pool → 1 disk read per point query.',
        },
        {
          name: 'Range Query I/O Cost',
          formula: 'I/O(BETWEEN L AND R) = O(log_B N + K / B)   (K matching records)',
          meaning: 'Linked leaves deliver K records in sequential page bursts.',
        },
      ],
      proofSketch:
        'Since every non-root internal node has at least ⌈B/2⌉ children, the number of leaves at height h is at least 2 · ⌈B/2⌉^{h-1}. Solving for h proves h = O(log_B N), keeping tree height ≤ 4 even for billion-row tables.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'OLTP relational index, read-heavy point/range queries, or predictable low-tail latency',
        recommendedPattern: 'B+ Tree Storage Engine',
        linkedId: 'bplus-tree-storage',
        linkedKind: 'algorithm',
        whyItFits: 'Guaranteed 3–4 I/O point reads and linked-leaf sequential scans.',
      },
      {
        ifYouSee: 'Write-heavy ingestion workload (time-series, telemetry, RocksDB/Cassandra)',
        recommendedPattern: 'LSM-Tree Flushing & Compaction',
        linkedId: 'lsm-tree-compaction',
        linkedKind: 'algorithm',
        whyItFits: 'Converts random B+ Tree page updates into fast sequential append-only flushes.',
      },
      {
        ifYouSee: 'Crash-safe durability for dirty B+ Tree pages in RAM',
        recommendedPattern: 'ARIES Crash Recovery (WAL)',
        linkedId: 'aries-wal-recovery',
        linkedKind: 'algorithm',
        whyItFits: 'Write-Ahead Logging guarantees durability without synchronous random page flushes.',
      },
    ],
  },

  'lsm-tree-compaction': {
    formalDefinition:
      'A Log-Structured Merge-Tree (LSM-Tree) turns random disk writes into sequential I/O by appending to a WAL + sorted in-memory MemTable, flushing immutable sorted SSTables to disk, and asynchronously merging runs via Size-Tiered or Leveled Compaction accelerated by per-SSTable Bloom Filters.',
    problemStatementForm:
      'Ingest millions of writes/sec (RocksDB, Cassandra, LevelDB, ScyllaDB) while supporting sorted range scans, tombstoned deletes, and bounded space/read amplification.',
    logicBoard: [
      {
        step: '01 · Sequential Write Path',
        condition: 'put(k, v) or delete(k) arrives',
        action: 'Append record (or TOMBSTONE for delete) sequentially to disk WAL, then insert into sorted MemTable (Skip List)',
        invariant: 'Zero random disk seeks on the write path → 10×–100× higher write throughput than B+ Trees',
      },
      {
        step: '02 · Immutable SSTable Flush',
        condition: 'MemTable exceeds RAM threshold (e.g., 64 MB)',
        action: 'Freeze MemTable and flush sequentially to Level-0 SSTable + sparse index + Bloom Filter',
        invariant: 'SSTables are strictly immutable once written, simplifying concurrency and caching',
      },
      {
        step: '03 · Background Compaction',
        condition: 'Level exceeds file count or byte cap (10× size ratio per level)',
        action: 'K-way merge overlapping SSTables, discarding overwritten older versions and expired tombstones',
        invariant: 'Size-Tiered optimizes write amp (Cassandra); Leveled minimizes read/space amp (RocksDB)',
      },
      {
        step: '04 · Bloom-Accelerated Read Path',
        condition: 'get(k) lookup',
        action: 'Check MemTable → Immutable MemTable → L0..L_max SSTables newest-first, skipping SSTables rejected by Bloom Filter',
        invariant: 'Newest timestamp wins; Bloom Filters cut ~99% of unnecessary disk SSTable reads',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'RUM Conjecture Amplification Tradeoffs (T = size ratio, L = levels)',
          formula: 'Leveled: WriteAmp = O(L · T),  SpaceAmp ≈ 1.1×   |   Size-Tiered: WriteAmp = O(L),  SpaceAmp ≈ 2×',
          meaning: 'Quantifies the fundamental Read / Update / Memory tradeoff in storage engines.',
        },
        {
          name: 'Level Depth Formula',
          formula: 'L = ⌈ log_T (TotalDataSize / L0_Size) ⌉   (T = 10 ⇒ 1 TB in ~5 levels)',
          meaning: 'Keeps worst-case multi-level probe count tiny even at terabyte scale.',
        },
      ],
      proofSketch:
        'Because SSTables are flushed sequentially and compacted via sequential K-way merge sort, random write I/O is eliminated completely. Read amplification across L levels is bounded to ~1 disk read per lookup when per-SSTable Bloom Filters reject absent keys.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'High-throughput write-heavy KV store, RocksDB/Cassandra internals, or time-series DB',
        recommendedPattern: 'LSM-Tree Flushing & Compaction',
        linkedId: 'lsm-tree-compaction',
        linkedKind: 'algorithm',
        whyItFits: 'Sequential append + compaction maximizes SSD/HDD write bandwidth.',
      },
      {
        ifYouSee: 'Skip absent SSTables in RAM before hitting SSD during LSM point reads',
        recommendedPattern: 'Bloom Filter',
        linkedId: 'bloom-filter',
        linkedKind: 'algorithm',
        whyItFits: 'Eliminates ~99% of futile SSTable disk reads.',
      },
      {
        ifYouSee: 'Read-heavy OLTP database needing consistent low read amplification',
        recommendedPattern: 'B+ Tree Storage Engine',
        linkedId: 'bplus-tree-storage',
        linkedKind: 'algorithm',
        whyItFits: 'In-place B+ Tree pages avoid multi-level SSTable read amplification.',
      },
    ],
  },

  'external-kway-merge': {
    formalDefinition:
      'External K-Way Merge Sort sorts datasets of N bytes that vastly exceed RAM capacity M by creating ⌈N/M⌉ sorted disk runs in Pass 0 and iteratively merging up to K = (M/B) - 1 runs concurrently using a Min-Heap and B-sized I/O buffers in O((N/B) · log_K(N/M)) disk I/Os.',
    problemStatementForm:
      'Sort a 100 GB log file or execute a huge SQL ORDER BY / LSM-Tree compaction on a machine with only 4 GB of RAM while minimizing disk I/O passes.',
    logicBoard: [
      {
        step: '01 · Pass 0: Generate Sorted Runs',
        condition: 'Input file size N > available RAM M',
        action: 'Read chunks of size M, sort in-memory (QuickSort/Timsort), write ⌈N / M⌉ sorted run files to disk',
        invariant: 'Each run is globally sorted internally; total Pass 0 cost = 2 · (N / B) page I/Os',
      },
      {
        step: '02 · Allocate K Input + 1 Output Buffers',
        condition: 'RAM holds M/B pages total',
        action: 'Reserve K = (M / B) - 1 pages for input run buffers and 1 page for output write buffer',
        invariant: 'Maximizes merge fan-in K to minimize total disk passes',
      },
      {
        step: '03 · Min-Heap K-Way Merge',
        condition: 'Merging K sorted runs',
        action: 'Push first record of each run into size-K Min-Heap; pop global min to output buffer; refill empty input buffer from disk',
        invariant: 'Output buffer flushes sequentially whenever full → O(log K) CPU per record',
      },
      {
        step: '04 · Multi-Pass Convergence',
        condition: 'Number of runs > K',
        action: 'Repeat merge passes reducing runs by factor K per pass until 1 single sorted file remains',
        invariant: 'Total passes = 1 + ⌈log_K(N / M)⌉ (usually just 2 passes for 100 GB with 4 GB RAM!)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'External Disk I/O Complexity',
          formula: 'Total I/Os = 2 · (N / B) · ( 1 + ⌈ log_{M/B - 1} (N / M) ⌉ )',
          meaning: 'With M = 1 GB and B = 1 MB, K ≈ 1000 so a 1 TB file sorts in just 2 passes!',
        },
        {
          name: 'Replacement Selection Bonus',
          formula: 'Expected run length with heap replacement selection = 2M   (halves initial run count)',
          meaning: 'Doubles Pass-0 run size on random inputs using the same RAM M.',
        },
      ],
      proofSketch:
        'Pass 0 reads and writes every page once (2N/B I/Os). Each merge pass reduces run count R → ⌈R / K⌉ while reading and writing every page once, requiring ⌈log_K(N/M)⌉ merge passes.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sort huge file larger than RAM, SQL ORDER BY spill-to-disk, or LSM compaction merge',
        recommendedPattern: 'External K-Way Merge Sort',
        linkedId: 'external-kway-merge',
        linkedKind: 'algorithm',
        whyItFits: 'Minimizes sequential disk passes via maximum K-way fan-in Min-Heap.',
      },
      {
        ifYouSee: 'In-memory Merge K Sorted Lists (all data fits in RAM)',
        recommendedPattern: 'Heap & Priority Queue Intervals',
        linkedId: 'heap-intervals',
        linkedKind: 'algorithm',
        whyItFits: 'Same size-K Min-Heap merge logic without disk page buffering.',
      },
      {
        ifYouSee: 'Joining two massive sorted tables larger than RAM',
        recommendedPattern: 'Hash Join, Sort-Merge & Volcano',
        linkedId: 'sql-joins-volcano',
        linkedKind: 'algorithm',
        whyItFits: 'Sort-Merge Join directly pipelines External K-Way Merge runs.',
      },
    ],
  },

  'aries-wal-recovery': {
    formalDefinition:
      'ARIES (Algorithms for Recovery and Isolation Exploiting Semantics) guarantees ACID Atomicity and Durability under STEAL/NO-FORCE buffer management via Write-Ahead Logging (WAL) with monotonic LSNs and a three-phase crash recovery protocol: Analysis, Redo (repeating history), and Undo (with CLRs).',
    problemStatementForm:
      'Recover a relational database (PostgreSQL, MySQL InnoDB, DB2) to an exact transactionally consistent state after sudden power loss, even if crashes happen mid-recovery.',
    logicBoard: [
      {
        step: '01 · WAL Force-Log Rule (Normal Ops)',
        condition: 'Dirty page evicted (STEAL) OR transaction commits (NO-FORCE)',
        action: 'Flush WAL records up to pageLSN / commitLSN to durable disk BEFORE flushing dirty data page or acknowledging commit',
        invariant: 'Disk log always strictly precedes or matches every page mutation on disk',
      },
      {
        step: '02 · Phase 1: Analysis Pass',
        condition: 'Crash restart from latest Fuzzy Checkpoint',
        action: 'Scan WAL forward to reconstruct Active Transaction Table (ATT: uncommitted losers) and Dirty Page Table (DPT: earliest recLSN)',
        invariant: 'Pinpoints exact Redo start point min(recLSN) and exact loser transactions to roll back',
      },
      {
        step: '03 · Phase 2: Redo (Repeat History)',
        condition: 'Scanning WAL forward from min(recLSN) to end of log',
        action: 'Reapply EVERY logged update (even losers!) unless page already clean or page.pageLSN >= record.LSN',
        invariant: 'Idempotent pageLSN check restores exact pre-crash disk+memory state',
      },
      {
        step: '04 · Phase 3: Undo + CLRs',
        condition: 'Scanning backward across prevLSN chains of all loser transactions',
        action: 'Reverse each uncommitted write and append a Compensation Log Record (CLR) with undoNextLSN pointing past it',
        invariant: 'CLRs are never undone again → guarantees bounded recovery even under repeated crash-during-recovery',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'WAL Durability & Redo Idempotence Rule',
          formula: 'WAL_flushedLSN ≥ pageLSN(disk)   |   Skip Redo iff pageLSN ≥ log.LSN',
          meaning: 'Ensures already-persisted updates are never applied twice during replay.',
        },
        {
          name: 'Redo Scan Starting Anchor',
          formula: 'RedoStartLSN = min_{p ∈ DirtyPageTable} recLSN(p)',
          meaning: 'Avoids replaying log history older than the earliest un-flushed dirty page.',
        },
      ],
      proofSketch:
        'Repeating history in Redo reconstructs the exact physical state at crash time (preserving all committed transactions). Undoing every loser backward via logged CLRs restores Atomicity while guaranteeing idempotency if a second crash strikes mid-Undo.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Database ACID crash recovery, Write-Ahead Logging, or crash-safe state persistence',
        recommendedPattern: 'ARIES Crash Recovery (WAL)',
        linkedId: 'aries-wal-recovery',
        linkedKind: 'algorithm',
        whyItFits: 'Industry-standard 3-phase Analysis/Redo/Undo protocol with CLR crash idempotency.',
      },
      {
        ifYouSee: 'B+ Tree buffer pool pages requiring crash durability',
        recommendedPattern: 'B+ Tree Storage Engine',
        linkedId: 'bplus-tree-storage',
        linkedKind: 'algorithm',
        whyItFits: 'ARIES protects B+ Tree structural splits and dirty pages in RAM.',
      },
      {
        ifYouSee: 'Replicating WAL logs across multiple fault-tolerant servers',
        recommendedPattern: 'Raft & Paxos Consensus',
        linkedId: 'raft-paxos-consensus',
        linkedKind: 'algorithm',
        whyItFits: 'Distributes a replicated WAL safely across a cluster quorum.',
      },
    ],
  },

  'sql-joins-volcano': {
    formalDefinition:
      'Relational Query Execution composes operators via the Volcano Iterator Model (open / next / close pull pipelines) using Hash Join (O(M + N) build/probe for equi-joins), Sort-Merge Join (O(M log M + N log N) for pre-sorted or range joins), or Indexed Nested Loop Join.',
    problemStatementForm:
      'Execute SQL equi-joins, range joins, and pipelined filter/projection trees over tables larger than RAM without materializing huge intermediate tables.',
    logicBoard: [
      {
        step: '01 · Volcano Pull Pipeline',
        condition: 'Executing query operator tree (Scan → Filter → Join → Limit)',
        action: 'Each operator implements open(), next() returning 1 tuple (or batch in Vectorized engines), and close()',
        invariant: 'Streaming tuples avoids materializing intermediate results and short-circuits on LIMIT K',
      },
      {
        step: '02 · Grace Hash Join (Equi-Join)',
        condition: 'Equality predicate R.k = S.k with unsorted inputs',
        action: 'Build in-memory hash table on SMALLER relation R; stream/probe larger relation S (partition to disk if |R| > RAM)',
        invariant: 'O(|R| + |S|) linear I/O and CPU; spills gracefully via symmetric hash partitioning',
      },
      {
        step: '03 · Sort-Merge Join',
        condition: 'Inputs already sorted by join key (e.g., B+ Tree index) OR output needs ORDER BY',
        action: 'Advance two sorted cursors like Two Pointers, backtracking only across duplicate-key groups',
        invariant: 'O(|R| + |S|) if pre-sorted; immune to hash skew collisions',
      },
      {
        step: '04 · Vectorized Batch Upgrade',
        condition: 'OLAP analytical queries hitting Volcano tuple-at-a-time virtual-call overhead',
        action: 'Return columnar batches of 1024 tuples per next() call (DuckDB/ClickHouse/Snowflake)',
        invariant: 'Amortizes function dispatch and unlocks CPU SIMD vectorization',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Join I/O Cost Comparison (|R| ≤ |S| pages)',
          formula: 'Block Nested Loop: |R| + (|R|/M)·|S|   |   Grace Hash: 3(|R| + |S|)   |   Sort-Merge: Sort + |R| + |S|',
          meaning: 'Hash Join dominates unsorted equi-joins; Sort-Merge wins when keys are pre-sorted.',
        },
        {
          name: 'Memory Requirement for 2-Pass Hash Join',
          formula: 'M ≥ √(|R|) pages   (1 GB RAM joins up to 1 TB table in 2 passes)',
          meaning: 'Partitioning R into B buffers ensures each partition fits in RAM for the probe phase.',
        },
      ],
      proofSketch:
        'Partitioning both R and S with identical hash function h₁ guarantees matching keys land strictly in the same bucket pair (R_i, S_i), allowing exact independent in-memory joins in 3(|R| + |S|) total page I/Os.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'SQL query engine execution, equi-join optimization, or streaming iterator pipelines',
        recommendedPattern: 'Hash Join, Sort-Merge & Volcano',
        linkedId: 'sql-joins-volcano',
        linkedKind: 'algorithm',
        whyItFits: 'Matches Hash Join, Sort-Merge, and pipelined iterators to data size and sort order.',
      },
      {
        ifYouSee: 'Sorting tables larger than RAM before Sort-Merge Join',
        recommendedPattern: 'External K-Way Merge Sort',
        linkedId: 'external-kway-merge',
        linkedKind: 'algorithm',
        whyItFits: 'Supplies sorted runs when inputs exceed memory.',
      },
      {
        ifYouSee: 'Point index lookup inside Indexed Nested Loop Join',
        recommendedPattern: 'B+ Tree Storage Engine',
        linkedId: 'bplus-tree-storage',
        linkedKind: 'algorithm',
        whyItFits: 'Turns inner table scan into O(log_B N) indexed probes.',
      },
    ],
  },

  'consistent-hashing-dht': {
    formalDefinition:
      'Consistent Hashing maps both keys and cluster nodes onto a circular hash ring [0, 2^m - 1] assigning each key to the next clockwise node via Virtual Nodes (vnodes), ensuring adding or removing a node remaps only K / N keys (vs ~100% under hash(k) mod N); Chord DHT adds O(log N) finger-table routing, and Rendezvous Hashing selects argmax_i h(k, node_i).',
    problemStatementForm:
      'Shard caches, databases, or P2P routing tables across dynamic servers (Dynamo, Cassandra, Memcached, CDNs) with minimal key migration and even load distribution.',
    logicBoard: [
      {
        step: '01 · Place Virtual Nodes on Ring',
        condition: 'Registering physical server S_i',
        action: 'Insert V = 100–200 virtual tokens hash(S_i + "#" + v) into a sorted array / balanced BST',
        invariant: 'Virtual nodes drop load standard deviation from O(100%) down to ~5–10%',
      },
      {
        step: '02 · Clockwise Binary Lookup',
        condition: 'Routing key k',
        action: 'Compute pos = hash(k); binary-search first vnode >= pos (wrapping around to index 0 if past max)',
        invariant: 'O(log(N·V)) routing lookup; replication simply walks the next R distinct physical nodes clockwise',
      },
      {
        step: '03 · Minimal Remap on Topology Change',
        condition: 'Node joins or crashes',
        action: 'Insert/remove only that node’s V ring positions; only keys in its immediately preceding arcs migrate',
        invariant: 'Expected remapped keys = K / N (optimal theoretical minimum)',
      },
      {
        step: '04 · Chord Finger Table / Rendezvous',
        condition: 'Decentralized P2P routing (Chord) OR stateless zero-ring assignment (Rendezvous)',
        action: 'Chord jumps finger[i] = succ(id + 2^i) in O(log N) hops; Rendezvous picks argmax_node hash(k, node)',
        invariant: 'Rendezvous needs zero ring state and handles heterogeneous server weights trivially',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Key Migration Fraction on Node Join/Leave',
          formula: 'Modulo Hash: ≈ (N - 1)/N → ~100% moved   |   Consistent Hash: E[moved] = K / N',
          meaning: 'Prevents catastrophic cache stampedes during auto-scaling or server crashes.',
        },
        {
          name: 'Virtual-Node Load Variance Bound',
          formula: 'σ_load / μ_load ≈ 1 / √V   (V = 150 vnodes/node ⇒ < 8% skew)',
          meaning: 'Law of large numbers smooths random ring arc lengths automatically.',
        },
      ],
      proofSketch:
        'Each of N nodes owns an expected 1/N fraction of the unit circle. Inserting one new node splits only the arcs immediately following its tokens, affecting exclusively keys hashed into those 1/(N+1) arcs.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Distributed cache sharding, Dynamo/Cassandra ring partitioning, or minimal key migration',
        recommendedPattern: 'Consistent Hashing & DHT',
        linkedId: 'consistent-hashing-dht',
        linkedKind: 'algorithm',
        whyItFits: 'Remaps only K/N keys on scaling and balances load via virtual nodes.',
      },
      {
        ifYouSee: 'Detecting failed ring peers without a central coordinator',
        recommendedPattern: 'Gossip Protocol & Phi Accrual',
        linkedId: 'gossip-phi-accrual',
        linkedKind: 'algorithm',
        whyItFits: 'Disseminates ring membership changes in O(log N) rounds.',
      },
      {
        ifYouSee: 'Reconciling divergent key replicas after a node recovers',
        recommendedPattern: 'Merkle Trees (Anti-Entropy Sync)',
        linkedId: 'merkle-tree-sync',
        linkedKind: 'algorithm',
        whyItFits: 'Pinpoints exact drifted key ranges in O(log K) hashes.',
      },
    ],
  },

  'raft-paxos-consensus': {
    formalDefinition:
      'Raft and Paxos achieve Strongly Consistent (CP) Replicated State Machines across N nodes tolerating up to f = ⌊(N-1)/2⌋ crash faults by enforcing strict Majority Quorums (⌊N/2⌋ + 1), monotonic term/ballot numbers, Leader Election with log-up-to-date voting, and replicated AppendEntries commitment.',
    problemStatementForm:
      'Elect a single leader and replicate a totally ordered write-ahead log safely across distributed servers (etcd, CockroachDB, TiKV, Kafka KRaft) despite network partitions and crashes.',
    logicBoard: [
      {
        step: '01 · Election Timeout & Quorum Vote',
        condition: 'Follower receives no heartbeat within randomized timeout [150ms, 300ms]',
        action: 'Increment currentTerm++, become Candidate, vote for self, broadcast RequestVote(term, lastLogIdx, lastLogTerm)',
        invariant: 'Randomized timeouts break split-vote ties; voter rejects any candidate with stale log',
      },
      {
        step: '02 · Log Replication (AppendEntries)',
        condition: 'Leader receives client command',
        action: 'Append (term, cmd) to local log; send AppendEntries(prevLogIdx, prevLogTerm, entries) to followers',
        invariant: 'Log Matching Property: matching (prevIdx, prevTerm) inductively proves identical full prefix',
      },
      {
        step: '03 · Majority Commit Rule',
        condition: 'Entry from CURRENT term replicated on ≥ ⌊N/2⌋ + 1 nodes',
        action: 'Advance commitIndex, apply to state machine, reply to client (never directly commit prior-term entry alone!)',
        invariant: 'Quorum intersection guarantees any future leader MUST contain every committed entry',
      },
      {
        step: '04 · Higher-Term Step-Down',
        condition: 'Any server sees RPC/response with term > currentTerm',
        action: 'Immediately update currentTerm = msg.term and revert to Follower',
        invariant: 'Guarantees at most ONE leader can ever be elected in any given term (Election Safety)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Quorum Intersection & Fault Tolerance',
          formula: 'Q = ⌊N / 2⌋ + 1,   ∀Q₁, Q₂: |Q₁ ∩ Q₂| ≥ 1,   Max crash faults f = ⌊(N - 1) / 2⌋',
          meaning: 'Any two majorities overlap in ≥ 1 server, guaranteeing durability across elections.',
        },
        {
          name: 'Log Up-To-Date Comparison Rule',
          formula: 'UpToDate(C, V) ⟺ (C.lastTerm > V.lastTerm) ∨ (C.lastTerm = V.lastTerm ∧ C.lastIdx ≥ V.lastIdx)',
          meaning: 'Guarantees Leader Completeness without needing to copy entries from followers to leader.',
        },
      ],
      proofSketch:
        'Since every committed entry resides on a majority Q₁ and every newly elected leader wins votes from a majority Q₂, Q₁ ∩ Q₂ contains at least one server holding the entry. Because voters reject candidates with less up-to-date logs, the new leader must already possess every committed entry.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Strong consistency, leader election, distributed lock service (etcd/ZooKeeper), or replicated WAL',
        recommendedPattern: 'Raft & Paxos Consensus',
        linkedId: 'raft-paxos-consensus',
        linkedKind: 'algorithm',
        whyItFits: 'Provable linearizability and Election Safety under network partitions.',
      },
      {
        ifYouSee: 'High-availability AP system requiring conflict-free merges without leader/quorum blocking',
        recommendedPattern: 'CRDTs (G-Counter & OR-Set)',
        linkedId: 'crdt-gcounter-orset',
        linkedKind: 'algorithm',
        whyItFits: 'Converges deterministically without consensus round-trips.',
      },
      {
        ifYouSee: 'Tracking causal ordering without a central leader clock',
        recommendedPattern: 'Vector Clocks & Lamport Timestamps',
        linkedId: 'vector-clocks-lamport',
        linkedKind: 'algorithm',
        whyItFits: 'Captures exact happened-before causality across decentralized replicas.',
      },
    ],
  },

  'gossip-phi-accrual': {
    formalDefinition:
      'Gossip (Epidemic) Protocols disseminate cluster membership/state across N peers in O(log N) rounds with O(1) per-node bandwidth by periodically exchanging digests with k random peers; the Phi Accrual Failure Detector replaces brittle binary timeouts with a continuous suspicion score φ(t) derived from empirical heartbeat inter-arrival distributions.',
    problemStatementForm:
      'Maintain decentralized cluster membership and adaptive failure detection across thousands of nodes (Cassandra, Dynamo, Akka, Consul SWIM) without a central heartbeat bottleneck.',
    logicBoard: [
      {
        step: '01 · Periodic Random Fanout',
        condition: 'Every gossip tick interval T (e.g., 1 second)',
        action: 'Select k random peers (typically k = 1..3) and send compact digest (nodeId → maxVersion)',
        invariant: 'O(1) constant network traffic per node regardless of cluster size N',
      },
      {
        step: '02 · Three-Way Delta Sync',
        condition: 'Peer receives digest',
        action: 'Reply with newer local entries AND request entries where sender has higher version (push-pull)',
        invariant: 'Push-pull achieves quadratic convergence in the final rounds → O(log N) full dissemination',
      },
      {
        step: '03 · Sliding Heartbeat Distribution',
        condition: 'Receiving heartbeat from peer p',
        action: 'Record inter-arrival delta Δt into sliding window W; update mean μ and variance σ² (or exponential rate λ)',
        invariant: 'Adapts automatically to real network jitter and GC pauses',
      },
      {
        step: '04 · Continuous Phi Suspicion',
        condition: 'Elapsed time t_since since last heartbeat from p',
        action: 'Compute φ(t_since) = -log₁₀(P_later(t_since)); flag suspect at φ ≥ 8 (Cassandra default), down at φ ≥ 12',
        invariant: 'Decouples suspicion scoring from application-specific action thresholds',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Epidemic Dissemination Convergence',
          formula: 'Rounds to infect all N nodes = O(log_k N)   (N = 10,000, k = 3 ⇒ ~9 rounds)',
          meaning: 'Exponential spread matches tree broadcast while tolerating arbitrary peer crashes.',
        },
        {
          name: 'Phi Accrual Suspicion Score',
          formula: 'φ(t_now) = -log₁₀( P_later(t_now - t_last) )   (φ = 1 ⇒ 10% false positive,  φ = 8 ⇒ 10^{-8})',
          meaning: 'Logarithmic probability scale maps network silence to exact mistake likelihood.',
        },
      ],
      proofSketch:
        'When fraction s of nodes are uninformed, each push-pull round shrinks s → s² (quadratic tail convergence) once half the cluster is informed, guaranteeing O(log N) rounds with high probability even under packet loss.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Decentralized peer membership, failure detection under jitter, or Cassandra/Consul cluster state',
        recommendedPattern: 'Gossip Protocol & Phi Accrual',
        linkedId: 'gossip-phi-accrual',
        linkedKind: 'algorithm',
        whyItFits: 'O(log N) fault-tolerant broadcast with adaptive probabilistic failure scoring.',
      },
      {
        ifYouSee: 'Mapping keys onto the live nodes discovered by Gossip',
        recommendedPattern: 'Consistent Hashing & DHT',
        linkedId: 'consistent-hashing-dht',
        linkedKind: 'algorithm',
        whyItFits: 'Gossip propagates ring topology updates that Consistent Hashing routes over.',
      },
      {
        ifYouSee: 'Need strict single-leader linearizable coordination rather than eventual gossip',
        recommendedPattern: 'Raft & Paxos Consensus',
        linkedId: 'raft-paxos-consensus',
        linkedKind: 'algorithm',
        whyItFits: 'Quorum consensus guarantees strong consistency where gossip is eventually consistent.',
      },
    ],
  },

  'merkle-tree-sync': {
    formalDefinition:
      'A Merkle Tree (Cryptographic Hash Tree) hashes individual data blocks into leaves and recursively hashes concatenated child digests up to a single Root Hash, enabling O(log N) inclusion proofs and O(k log N) anti-entropy synchronization that transfers only the k diverged key ranges between replicas.',
    problemStatementForm:
      'Synchronize divergent database replicas (Dynamo, Cassandra repair), verify blockchain transaction inclusion (SPV light clients), or deduplicate immutable version trees (Git, IPFS) with minimal bandwidth.',
    logicBoard: [
      {
        step: '01 · Hash Leaves & Build Bottom-Up',
        condition: 'Partitioning sorted key range into N buckets/blocks',
        action: 'Compute leaf[i] = H(block_i) and internal[p] = H(left || right) up to rootHash',
        invariant: 'Any single-bit change in any leaf deterministically avalanches into a different rootHash',
      },
      {
        step: '02 · O(1) Root Equality Check',
        condition: 'Two replicas A and B initiate anti-entropy sync',
        action: 'Exchange ONLY 32-byte rootHash; if rootA === rootB terminate immediately (0 data transferred!)',
        invariant: 'Verifies terabytes of identical replicas in 32 bytes of network traffic',
      },
      {
        step: '03 · Recursive Branch Prune',
        condition: 'Internal node hashes differ (nodeA !== nodeB)',
        action: 'Exchange left/right child hashes; skip matching subtrees completely and descend ONLY into differing branches',
        invariant: 'Pinpoints k corrupted/missing leaves in O(k · log N) hash exchanges',
      },
      {
        step: '04 · O(log N) Inclusion Proof',
        condition: 'Light client verifying leaf L belongs to trusted rootHash',
        action: 'Supply only the ⌈log₂ N⌉ sibling hashes along L’s root path; recompute root and compare',
        invariant: 'Zero need to download all N transactions to verify authenticity cryptographically',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Merkle Node Hash Recurrence',
          formula: 'h(leaf_i) = SHA256(0x00 || data_i),   h(internal) = SHA256(0x01 || h_left || h_right)',
          meaning: 'Domain separation prefixes (0x00 / 0x01) prevent second-preimage tree-forging attacks.',
        },
        {
          name: 'Inclusion Proof & Anti-Entropy Bandwidth',
          formula: 'Proof Size = ⌈log₂ N⌉ × 32 bytes   (N = 10⁶ ⇒ 640 bytes);   Diff Sync = O(k log N)',
          meaning: 'Exponentially shrinks verification and replica repair bandwidth.',
        },
      ],
      proofSketch:
        'Under collision resistance of H (finding x ≠ y with H(x) = H(y) is computationally infeasible), matching subtree hashes imply identical underlying data with overwhelming probability; therefore skipping equal subtrees never misses a diverged key.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Replica anti-entropy repair (Dynamo/Cassandra), Git object DAG, or blockchain SPV proofs',
        recommendedPattern: 'Merkle Trees (Anti-Entropy Sync)',
        linkedId: 'merkle-tree-sync',
        linkedKind: 'algorithm',
        whyItFits: 'Pinpoints exact diverged ranges in O(log N) cryptographic comparisons.',
      },
      {
        ifYouSee: 'Structural sharing across versioned trees without cryptographic hashing',
        recommendedPattern: 'Persistent Path Copying & Fat Nodes',
        linkedId: 'persistent-data-structures',
        linkedKind: 'algorithm',
        whyItFits: 'Shares immutable subtrees via memory pointers in O(log n) per update.',
      },
      {
        ifYouSee: 'Detecting WHICH replica write happened causally before another',
        recommendedPattern: 'Vector Clocks & Lamport Timestamps',
        linkedId: 'vector-clocks-lamport',
        linkedKind: 'algorithm',
        whyItFits: 'Merkle Trees detect divergence; Vector Clocks distinguish overwrite vs true conflict.',
      },
    ],
  },

  'vector-clocks-lamport': {
    formalDefinition:
      'Lamport Clocks assign scalar logical counters preserving causal implication (a → b ⟹ L(a) < L(b)), while Vector Clocks maintain an N-element per-node counter vector V[] that captures EXACT happened-before causality (a → b ⟺ V(a) < V(b)) and detects concurrent conflicting writes reliably.',
    problemStatementForm:
      'Order distributed events without trusting skewed physical wall clocks (NTP drift), detect concurrent sibling conflicts in multi-leader stores (Amazon Dynamo, Riak), and compute consistent causal snapshots.',
    logicBoard: [
      {
        step: '01 · Local Event Increment',
        condition: 'Node i performs a local write or sends a message',
        action: 'Lamport: c_i++; Vector: V_i[i]++',
        invariant: 'Monotonically advances node i’s causal coordinate',
      },
      {
        step: '02 · Message Receive Merge',
        condition: 'Node i receives message carrying timestamp T_msg',
        action: 'Lamport: c_i = max(c_i, T_msg) + 1; Vector: ∀k, V_i[k] = max(V_i[k], T_msg[k]), then V_i[i]++',
        invariant: 'Captures transitive causal knowledge from all upstream senders',
      },
      {
        step: '03 · Exact Causality vs Concurrency',
        condition: 'Comparing two Vector Clocks V_a and V_b',
        action: 'V_a < V_b iff ∀k V_a[k] ≤ V_b[k] ∧ ∃j V_a[j] < V_b[j] (causal); if neither V_a ≤ V_b nor V_b ≤ V_a → CONCURRENT (conflict!)',
        invariant: 'Lamport clocks CANNOT detect concurrency; Vector Clocks detect concurrency iff incomparable',
      },
      {
        step: '04 · Resolve Concurrent Siblings',
        condition: 'V_a ∥ V_b (true concurrent conflict detected)',
        action: 'Preserve both siblings for application merge (shopping cart union) or merge via CRDT / Dotted Version Vectors',
        invariant: 'Never silently drops concurrent writes like Last-Write-Wins (LWW) wall-clock timestamps',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Vector Clock Strong Causality Equivalence',
          formula: 'a → b  ⟺  V(a) < V(b)   (∀k: V(a)[k] ≤ V(b)[k]  ∧  V(a) ≠ V(b))',
          meaning: 'Exact isomorphism between causal partial order and component-wise vector order.',
        },
        {
          name: 'Concurrency Detection Criterion',
          formula: 'a ∥ b (concurrent)  ⟺  ¬(V(a) ≤ V(b)) ∧ ¬(V(b) ≤ V(a))',
          meaning: 'Guarantees zero silent write loss across partitioned multi-leader replicas.',
        },
      ],
      proofSketch:
        'Because V_i[i] increments strictly on node i and propagates via component-wise max on every message chain, V(a)[i] ≤ V(b)[i] holds for all i if and only if every causal ancestor of a has reached b before event b occurred (Mattern / Fidge 1988).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Detect concurrent replica conflicts, causal ordering without NTP trust, or Dynamo version vectors',
        recommendedPattern: 'Vector Clocks & Lamport Timestamps',
        linkedId: 'vector-clocks-lamport',
        linkedKind: 'algorithm',
        whyItFits: 'Proves exact happened-before vs concurrent conflict mathematically.',
      },
      {
        ifYouSee: 'Automatic conflict-free resolution without asking the application to merge siblings',
        recommendedPattern: 'CRDTs (G-Counter & OR-Set)',
        linkedId: 'crdt-gcounter-orset',
        linkedKind: 'algorithm',
        whyItFits: 'Semilattice merges converge automatically even on concurrent writes.',
      },
      {
        ifYouSee: 'Total global ordering required (no concurrent writes permitted)',
        recommendedPattern: 'Raft & Paxos Consensus',
        linkedId: 'raft-paxos-consensus',
        linkedKind: 'algorithm',
        whyItFits: 'Serializes all writes into one linearizable log via quorum leader.',
      },
    ],
  },

  'crdt-gcounter-orset': {
    formalDefinition:
      'Conflict-Free Replicated Data Types (CRDTs) are replicated state structures whose merge operator ⊔ forms a Mathematical Join-Semilattice—Commutative, Associative, and Idempotent—guaranteeing Strong Eventual Consistency across partitioned multi-master replicas with zero coordination locks.',
    problemStatementForm:
      'Build offline-first collaborative editors (Figma, Linear), multi-region counters (G-Counter / PN-Counter), or distributed shopping carts (OR-Set) that accept writes on any replica and converge identically upon reconnection.',
    logicBoard: [
      {
        step: '01 · Verify Semilattice Axioms',
        condition: 'Designing state-based merge(A, B)',
        action: 'Verify A ⊔ B = B ⊔ A (commutative), (A ⊔ B) ⊔ C = A ⊔ (B ⊔ C) (associative), A ⊔ A = A (idempotent)',
        invariant: 'Tolerates duplicate, reordered, and delayed network packets with zero state corruption',
      },
      {
        step: '02 · G-Counter & PN-Counter',
        condition: 'Distributed increment-only (or +/-) counter across N replicas',
        action: 'Each node i increments ONLY its own slot P[i]++; value = ∑ P[i]; merge takes max(A[i], B[i]) per slot (PN = ∑P - ∑N)',
        invariant: 'Eliminates lost updates from duplicate increments across partitions',
      },
      {
        step: '03 · OR-Set (Observed-Remove Set)',
        condition: 'Handling concurrent add(x) and remove(x) on different replicas',
        action: 'Each add(x) tags x with a globally unique token (x, uid); remove(x) tombstones ONLY currently observed uids',
        invariant: 'Add-Wins semantics: concurrent add(x, newUid) survives concurrent remove of older uids',
      },
      {
        step: '04 · Anti-Entropy Sync Exchange',
        condition: 'Replicas reconnect after network partition',
        action: 'Exchange states (or compact delta-CRDT diffs) and apply state = merge(local, remote)',
        invariant: 'Strong Eventual Consistency: any two replicas receiving the same set of updates hold byte-identical state',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Join-Semilattice Convergence Laws',
          formula: 'x ⊔ y = y ⊔ x  (Comm)   |   (x ⊔ y) ⊔ z = x ⊔ (y ⊔ z)  (Assoc)   |   x ⊔ x = x  (Idemp)',
          meaning: 'Guarantees identical final state regardless of message order, duplication, or batching.',
        },
        {
          name: 'PN-Counter Value & Merge Definition',
          formula: 'Val(P, N) = ∑_i P[i] - ∑_i N[i],   merge((P₁,N₁), (P₂,N₂)) = (max(P₁,P₂), max(N₁,N₂))',
          meaning: 'Monotonically non-decreasing per-replica vectors allow arbitrary +/- updates safely.',
        },
      ],
      proofSketch:
        'Because ⊔ is commutative, associative, and idempotent, merging any finite set of updates {u₁, …, u_k} in any order with any multiplicity produces their unique least upper bound lub({u₁, …, u_k}) in the lattice—proving Strong Eventual Consistency.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Offline-first collaboration, multi-region counters, or conflict-free distributed sets',
        recommendedPattern: 'CRDTs (G-Counter & OR-Set)',
        linkedId: 'crdt-gcounter-orset',
        linkedKind: 'algorithm',
        whyItFits: 'Semilattice algebra converges deterministically with zero consensus blocking.',
      },
      {
        ifYouSee: 'Need strict invariant that CANNOT be merged (e.g., bank balance ≥ 0 / unique username)',
        recommendedPattern: 'Raft & Paxos Consensus',
        linkedId: 'raft-paxos-consensus',
        linkedKind: 'algorithm',
        whyItFits: 'Global invariants require synchronous quorum consensus; CRDTs cannot prevent overdrafts.',
      },
      {
        ifYouSee: 'Causal tracking underlying OR-Set observed-version tags',
        recommendedPattern: 'Vector Clocks & Lamport Timestamps',
        linkedId: 'vector-clocks-lamport',
        linkedKind: 'algorithm',
        whyItFits: 'Dotted version vectors compact OR-Set metadata cleanly.',
      },
    ],
  },
};
