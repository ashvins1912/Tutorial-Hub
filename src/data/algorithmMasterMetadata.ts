import type { AlgorithmTutorGuide } from './algorithmTutorGuides';
import type { ComplexityComparisonProfile } from '../features/visualizer/data/complexityComparisonData';
import type { AlgorithmUpgradeAndArchitectSpec } from './algorithmUpgradeLadders';
import type {
  AlgorithmCategory,
  AlgorithmDefinition,
  AlgorithmStepFrame,
  AlgorithmVisualType,
} from './algorithmsCatalog';
import type {
  AlgorithmPracticeSpec,
  PlatformDrillItem,
} from './algorithmsPracticeExtras';
import type { BigTechTopicCategory, CodeLanguage } from '../types/dsa';

export interface MasterRawAlgorithm {
  id: string;
  name: string;
  shortName: string;
  category: AlgorithmCategory;
  difficulty?: string;
  visualType: AlgorithmVisualType;
  tagline: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityLeap?: string;
  mentalModel: string;
  coreInvariant: string;
  whenToUse: string[];
  whenItFails: string;
  linkedTopics: BigTechTopicCategory[];
  linkedProblemSlugs: string[];
  featuredLabId?: string;
  hasDpLabLink?: boolean;
  templates: Record<CodeLanguage, string>;
  frames: AlgorithmStepFrame[];
  platformDrills?: { platform: string; title: string; difficulty: string; whyThisFits: string }[];
}

export type MasterRawPracticeSpec = Omit<AlgorithmPracticeSpec, 'platformDrills'> & {
  platformDrills?: PlatformDrillItem[];
};

const MASTER_40_COMPLEXITY_LEAPS: Record<string, string> = {
  'linear-search': 'Zero-index unsorted scan → O(N) time · O(1) space with hardware cache prefetching',
  'interpolation-search': 'O(log N) binary midpoint probes → O(log log N) uniform proportional jump',
  'elementary-sorts': 'Unoptimized O(N²) swaps → Adaptive O(N + I) TimSort/Introsort small-run base case',
  'heapify-heapsort': 'O(N log N) top-down heap build → O(N) Floyd bottom-up build & O(1)-space O(N log N) sort',
  'counting-radix-sort': 'Ω(N log N) comparison lower bound → O(d · (N + B)) linear non-comparison digit sort',
  'linked-list-reversal': 'O(N) auxiliary array/stack copy → O(1) space 3-pointer in-place rewire',
  'shunting-yard-parser': 'Multi-pass recursive/AST build → O(N) single-pass operator precedence RPN stream',
  'avl-red-black-trees': 'O(N) skewed BST degeneration → O(log N) worst-case height in self-balancing AVL/Red-Black trees, maintained with rotations',
  'huffman-coding': 'Fixed-length log₂|Σ| encoding → Optimal variable-length prefix-free entropy code',
  'trie-prefix-autocomplete': 'O(N · L) full-dictionary scan → O(L) prefix lookup independent of N',
  'hash-table-probing': 'O(N) linear / O(log N) tree lookup → O(1) expected cache-friendly hash lookup',
  'splay-tree-rotations': 'Static O(log N) balanced tree → O(1) hot working-set amortized self-adjusting root',
  'kd-tree-nearest-neighbor': 'O(N) brute spatial scan → O(log N) average hypersphere branch-pruned 2D/3D NN',
  'quadtree-octree-spatial': 'O(N) global point scan → distribution-sensitive adaptive empty-space skipping; O(N) worst-case spatial query',
  'bwt-fm-index': 'O(N) uncompressed scan / large suffix-index RAM → compressed backward search with rank-query cost determined by the index representation',
  'lzw-compression': 'Uncompressed symbol stream → O(N) single-pass headerless adaptive dictionary coding',
  'hopcroft-karp-hungarian': 'O(V · E) augmenting paths → O(E √V) parallel layered matching / O(V³) min-cost',
  'eulerian-hierholzer': 'O(E²) Fleury bridge checks → O(V + E) linear post-order edge-splicing circuit',
  'tarjan-bridges-articulation': 'O(E · (V + E)) remove-and-test → O(V + E) single-pass disc/low DFS audit',
  'johnsons-all-pairs': 'O(V³) dense Floyd-Warshall → O(V · E log V) Bellman-Ford reweight + V× Dijkstra',
  'centroid-decomposition': 'O(N²) all-paths tree DFS → O(N log N) divide-and-conquer O(log N)-tall centroid tree',
  'bloom-filter': 'Exact HashSet membership costs memory proportional to stored keys; a Bloom Filter can use about 10 bits/key for a chosen false-positive target and has no false negatives under standard insert-only, intact-bit-array assumptions',
  'skip-list': 'O(N) sorted list / lock-heavy RB-Tree → O(log N) expected lock-free express lanes',
  'count-min-sketch': 'Exact HashMap counters grow with distinct keys; a Count-Min Sketch uses O((1/ε) log(1/δ)) counters for additive error εN with probability at least 1−δ, independent of stream length N when ε and δ are fixed',
  'hyperloglog': 'Exact unique-ID HashSet memory grows with cardinality → mergeable HLL registers with relative standard error approximately 1.04/√m (register count m)',
  'cache-lru-lfu-arc': 'O(C) scan / O(log C) heap eviction → O(1) pointer-spliced DLL & scan-resistant ARC',
  'buddy-memory-allocator': 'O(N) fragmented free-list scan → O(log M) power-of-2 split & O(1) XOR buddy coalesce',
  'persistent-data-structures': 'O(N) full-copy snapshot per edit → O(log N) structural-sharing path-copy versioning',
  'lockfree-cas-rcu': 'Blocking mutexes / RWLock cache-bouncing → low-overhead RCU read-side work with deferred reclamation + CAS retry progress guarantees',
  'bplus-tree-storage': 'O(log₂ N) random binary-tree seeks → O(log_B N) page descent with high fanout + linked leaf scans; actual I/O depends on layout and cache',
  'lsm-tree-compaction': 'Random in-place disk updates → sequential WAL/SSTable writes, in-memory ordered MemTable, and Bloom-filter-assisted reads with compaction tradeoffs',
  'external-kway-merge': 'OOM in-RAM sort failure → buffered sequential disk runs and multiway Min-Heap merge; pass count depends on memory and merge fan-in',
  'aries-wal-recovery': 'Slow synchronous FORCE page flushes → Fast sequential WAL + idempotent 3-pass recovery',
  'sql-joins-volcano': 'O(|R| · |S|) nested-loop join → O(|R| + |S|) pipelined Hash / Sort-Merge Volcano iterator',
  'consistent-hashing-dht': 'O(K) full-cache invalidation on mod N → O(K / N) minimal remapping with virtual nodes',
  'raft-paxos-consensus': 'Split-brain async primary → linearizable 2F+1 quorum consensus; stable-leader replication often commits in one quorum RTT, protocol/network dependent',
  'gossip-phi-accrual': 'O(N²) all-to-all heartbeat storms → bounded per-node fanout with probabilistic epidemic dissemination; convergence rounds depend on membership, network, and failure assumptions',
  'merkle-tree-sync': 'O(N) full replica dataset diff → O(k log(N/k)) hierarchical hash-tree anti-entropy repair',
  'vector-clocks-lamport': 'Physical-clock order can disagree with causality; vector clocks represent causal partial order and detect concurrent updates, using O(N) vector entries for N participants',
  'crdt-gcounter-orset': 'Cross-region coordination can be avoided for local G-Counter/OR-Set updates; replicas converge under the CRDT merge rule when updates are eventually delivered',
};

const CACHED_PLATFORM_DRILLS: Record<string, PlatformDrillItem[]> = {};

function toPlatformDrill(raw: {
  platform: string;
  title: string;
  difficulty: string;
  whyThisFits: string;
}): PlatformDrillItem {
  const normPlatform: PlatformDrillItem['platform'] =
    raw.platform === 'LeetCode'
      ? 'LeetCode'
      : raw.platform === 'NeetCode'
        ? 'NeetCode'
        : raw.platform === 'Grind 75'
          ? 'Grind 75'
          : 'CSES';
  const normDiff: PlatformDrillItem['difficulty'] =
    raw.difficulty === 'Easy' ? 'Easy' : raw.difficulty === 'Hard' ? 'Hard' : 'Medium';
  const numMatch = raw.title.match(/^(\d+)\.\s*(.*)$/);
  return {
    platform: normPlatform,
    number: numMatch ? `#${numMatch[1]}` : raw.platform,
    title: numMatch ? numMatch[2] : raw.title,
    difficulty: normDiff,
    focus: raw.whyThisFits,
  };
}

export function hydrateMasterAlgorithms(items: MasterRawAlgorithm[]): AlgorithmDefinition[] {
  return items.map((raw) => {
    if (raw.platformDrills && raw.platformDrills.length > 0) {
      CACHED_PLATFORM_DRILLS[raw.id] = raw.platformDrills.map(toPlatformDrill);
    }
    return {
      id: raw.id,
      name: raw.name,
      shortName: raw.shortName,
      category: raw.category,
      visualType: raw.visualType,
      tagline: raw.tagline,
      timeComplexity: raw.timeComplexity,
      spaceComplexity: raw.spaceComplexity,
      complexityLeap:
        raw.complexityLeap ??
        MASTER_40_COMPLEXITY_LEAPS[raw.id] ??
        `Baseline scan → ${raw.timeComplexity} time · ${raw.spaceComplexity} space (${raw.shortName})`,
      coreIdea: raw.mentalModel,
      mentalModelSteps: raw.frames.map((f) => `${f.title}: ${f.explanation}`),
      loopInvariant: raw.coreInvariant,
      whenToUse: raw.whenToUse,
      whenItFails: raw.whenItFails,
      linkedTopics: raw.linkedTopics,
      linkedProblemSlugs: raw.linkedProblemSlugs,
      featuredLabId: raw.featuredLabId,
      hasDpLabLink: raw.hasDpLabLink,
      templates: raw.templates,
      frames: raw.frames,
    };
  });
}

export function hydrateMasterPractice(
  rawMap: Record<string, MasterRawPracticeSpec>
): Record<string, AlgorithmPracticeSpec> {
  const result: Record<string, AlgorithmPracticeSpec> = {};
  for (const [key, spec] of Object.entries(rawMap)) {
    result[key] = {
      ...spec,
      platformDrills:
        spec.platformDrills ??
        CACHED_PLATFORM_DRILLS[spec.algorithmId] ?? [
          {
            platform: 'CSES',
            number: 'Core',
            title: spec.title,
            difficulty: 'Medium',
            focus: spec.prompt,
          },
        ],
    };
  }
  return result;
}

/**
 * Complete bespoke metadata for all 40 newly added Master Blueprint algorithms:
 * - 40 Tutor Guides (simple analogies, 30s senior interview scripts, Choose/Avoid rules, follow-up twists)
 * - 40 Calibrated Complexity Profiles (zero generic fallback recurrences across all 94 algorithms)
 * - Bespoke Upgrade Ladders, Code-Level DFDs, Production Use Cases, and Challenges Faced
 */
export const MASTER_40_TUTOR_GUIDES: Record<string, AlgorithmTutorGuide> = {
  'linear-search': {
    algorithmId: 'linear-search',
    simpleAnalogy:
      'Checking a row of unlabeled mailboxes one by one from left to right until you see your name—no prep needed, and shockingly fast when there are only 20 boxes.',
    interviewScript30s:
      '"For unsorted data queried once or for small cache-hot slices, a linear scan is O(N) time and O(1) space and can outperform sorting or hashing due to sequential memory access; the crossover depends on data size, layout, and hardware."',
    chooseWhen: 'Unsorted data queried once, linked lists without random access, or tiny N ≤ 32 SIMD/cache-line arrays.',
    avoidWhen: 'Repeated lookups on large datasets (build a HashMap for O(1) or sort + Binary Search for O(log N)).',
    followUpTwists: [
      {
        question: 'When can Linear Search actually beat Binary Search in wall-clock latency?',
        invariantShift: 'For N ≤ 32–64 contiguous integers, sequential CPU cache prefetching and zero branch mispredictions outperform random-jumping binary search.',
        complexityImpact: 'Still O(N) asymptotic; constant-factor wins for small/cache-hot inputs are hardware- and workload-dependent and should be benchmarked.',
      },
      {
        question: 'How does Sentinel Linear Search eliminate one comparison per loop iteration?',
        invariantShift: 'Temporarily place `target` in the last slot so the inner loop only checks `arr[i] !== target` without checking `i < n`, then restore the last slot.',
        complexityImpact: 'Halves loop branch instructions while staying O(N) time, O(1) space.',
      },
    ],
  },
  'interpolation-search': {
    algorithmId: 'interpolation-search',
    simpleAnalogy:
      'Looking up "Zimmerman" in a paper phonebook: you do not open to the middle ("M")—you jump straight near the back cover because letters are evenly distributed.',
    interviewScript30s:
      '"When sorted numeric keys are uniformly distributed, estimating `pos = lo + (target - a[lo]) * (hi - lo) / (a[hi] - a[lo])` narrows the range exponentially faster, dropping average probes from O(log N) to O(log log N)."',
    chooseWhen: 'Sorted, uniformly distributed numeric keys (timestamps, auto-increment IDs, columnar database pages).',
    avoidWhen: 'Exponentially skewed distributions (degrades to O(N))—always guard with a Binary Search fallback.',
    followUpTwists: [
      {
        question: 'What happens if all elements between lo and hi are equal (`a[hi] === a[lo]`)?',
        invariantShift: 'Division by zero! Always guard `if (a[lo] === a[hi]) return a[lo] === target ? lo : -1;` before computing the interpolated slope.',
        complexityImpact: 'Prevents NaN/infinite-loop crashes in O(1).',
      },
      {
        question: 'How do you guarantee O(log N) worst-case while keeping O(log log N) average?',
        invariantShift: 'Alternate one interpolation probe with one binary midpoint probe (or switch to binary search after 2 non-shrinking probes).',
        complexityImpact: 'O(log log N) uniform average, strict O(log N) worst case.',
      },
    ],
  },
  'elementary-sorts': {
    algorithmId: 'elementary-sorts',
    simpleAnalogy:
      'Insertion Sort is how you sort playing cards in your hand: pick up one card at a time and slide it leftward past bigger cards until it lands in place.',
    interviewScript30s:
      '"Bubble, Selection, and Insertion Sort are O(N²) worst-case; Insertion Sort is adaptive (O(N) on nearly sorted inputs), stable, and in-place. Many production sort implementations use insertion sort for short runs or partitions, but the cutoff and exact integration are implementation-specific."',
    chooseWhen: 'Tiny subarrays (N ≤ 32), online/streaming nearly-sorted data, or minimizing writes (Selection Sort uses ≤ N − 1 swaps).',
    avoidWhen: 'Large random or reversed arrays (N > 1000)—use Merge Sort, Quick Sort, or TimSort.',
    followUpTwists: [
      {
        question: 'If each element is at most K positions away from its sorted spot, what is Insertion Sort’s runtime?',
        invariantShift: 'Each element shifts leftward at most K times, collapsing worst-case O(N²) to O(N · K)!',
        complexityImpact: 'O(N · K) time, O(1) space (beats O(N log N) when K < log N).',
      },
      {
        question: 'When would you ever choose Selection Sort over Insertion Sort?',
        invariantShift: 'When writing to memory (e.g., EEPROM/flash wear) is far more expensive than reading: Selection Sort performs strictly at most N − 1 swaps.',
        complexityImpact: 'O(N²) comparisons, O(N) writes.',
      },
    ],
  },
  'heapify-heapsort': {
    algorithmId: 'heapify-heapsort',
    simpleAnalogy:
      'Building a tournament bracket from the bottom up: half the players are leaves who need zero matches, so crowning the overall champion takes linear O(N) work, not O(N log N).',
    interviewScript30s:
      '"Floyd’s bottom-up Build-Heap runs siftDown from index `floor(N/2) - 1` down to 0 in mathematically proven O(N) time. Repeatedly swapping the max root to the back yields in-place O(N log N) worst-case Heap Sort in O(1) space."',
    chooseWhen: 'Strict O(1) auxiliary space + guaranteed O(N log N) worst-case (embedded systems, Linux kernel, Introsort fallback).',
    avoidWhen: 'Stability is required or maximum CPU cache throughput is critical (QuickSort/TimSort have better spatial locality).',
    followUpTwists: [
      {
        question: 'Why is bottom-up Build-Heap O(N) while inserting N items top-down is O(N log N)?',
        invariantShift: 'Top-down sifts the N/2 leaves UP by log N levels; bottom-up sifts the N/2 leaves DOWN by 0 levels, summing ∑(h / 2^h) ≤ 2N.',
        complexityImpact: 'O(N) build vs O(N log N) repeated push.',
      },
      {
        question: 'Why is Heap Sort NOT stable?',
        invariantShift: 'Swapping root `a[0]` with `a[end]` leaps across unsorted interior elements, inverting the relative order of equal keys.',
        complexityImpact: 'Requires index tie-breaker (O(N) extra space) if stability is mandatory.',
      },
    ],
  },
  'counting-radix-sort': {
    algorithmId: 'counting-radix-sort',
    simpleAnalogy:
      'Sorting mail by ZIP code digit by digit from rightmost digit to leftmost into 10 stable bins: you never compare two envelopes directly, yet every letter arrives perfectly ordered.',
    interviewScript30s:
      '"Comparison sorts hit an Ω(N log N) information-theoretic lower bound. Counting Sort uses frequency prefix sums in O(N + K), and LSD Radix Sort chains stable Counting Sort across d digits to sort fixed-width integers in O(d · (N + B))."',
    chooseWhen: 'Bounded integer keys, fixed-length strings, IPv4/64-bit timestamps, or GPU/Suffix-Array linear sorting.',
    avoidWhen: 'Arbitrary floating-point comparators or unbounded huge K without radix digit decomposition.',
    followUpTwists: [
      {
        question: 'Why MUST Counting Sort iterate the input array RIGHT-TO-LEFT when placing elements?',
        invariantShift: 'Decrementing cumulative counts right-to-left preserves original left-to-right order of equal keys—which is mandatory for LSD Radix Sort correctness!',
        complexityImpact: 'Same O(N + K) time; guarantees stability.',
      },
      {
        question: 'How do you Radix Sort signed 32-bit negative AND positive integers cleanly?',
        invariantShift: 'XOR every integer with `0x80000000` (flip the sign bit) so signed order maps bijectively to unsigned order, sort, then flip back.',
        complexityImpact: 'Zero branching, still O(d · (N + B)).',
      },
    ],
  },
  'linked-list-reversal': {
    algorithmId: 'linked-list-reversal',
    simpleAnalogy:
      'Reversing a one-way chain of train cars in place: unhook the next coupler, point the current car back at the previous car, and step forward using a saved grip on the next car.',
    interviewScript30s:
      '"Using three pointers (`prev`, `curr`, `next`), we save `curr.next`, flip `curr.next = prev`, and slide both forward in O(N) time and O(1) space. Adding a dummy head makes sub-list and K-group reversals bug-free."',
    chooseWhen: 'LC 206, Reverse Linked List II (subrange), Reverse Nodes in K-Group, Palindrome Linked List, and Reorder List.',
    avoidWhen: 'Concurrent lock-free readers are traversing the list without synchronization (mutating next pointers mid-read causes races).',
    followUpTwists: [
      {
        question: 'How do you reverse nodes in groups of K while leaving a trailing remainder (< K) untouched?',
        invariantShift: 'Scout ahead K steps first; if fewer than K nodes remain, stop immediately. Otherwise reverse the K-slice and reconnect `groupPrev.next` and `tail.next`.',
        complexityImpact: 'O(N) time, O(1) space.',
      },
      {
        question: 'How do you check if a Singly Linked List is a palindrome in O(1) space without destroying the list?',
        invariantShift: 'Find midpoint with Fast/Slow, reverse the second half, compare both halves, then reverse the second half back to restore caller integrity.',
        complexityImpact: 'O(N) time, O(1) space.',
      },
    ],
  },
  'shunting-yard-parser': {
    algorithmId: 'shunting-yard-parser',
    simpleAnalogy:
      'A railroad switchyard sorting incoming train cars: numbers roll straight to the output track, while operators wait on a siding until lower-precedence tracks clear.',
    interviewScript30s:
      '"Dijkstra’s Shunting-Yard converts infix math into Reverse Polish Notation (RPN) in a single O(N) pass using an operator precedence stack, handling parentheses and left/right associativity without building an AST first."',
    chooseWhen: 'Basic Calculator I/II/III, spreadsheet formula engines, SQL WHERE expression compilers, and rule engines.',
    avoidWhen: 'Full programming language grammar with ambiguous lookahead (use Recursive Descent / Pratt Parser).',
    followUpTwists: [
      {
        question: 'How does right-associative exponentiation (`2 ^ 3 ^ 2 = 2 ^ 9 = 512`) differ from left-associative `-`?',
        invariantShift: 'For left-associative ops pop while `prec(top) >= prec(cur)`; for right-associative `^`, pop only while strictly `prec(top) > prec(cur)`.',
        complexityImpact: 'O(1) condition change; preserves exact O(N) parsing.',
      },
      {
        question: 'How do you handle unary minus (`-5` or `3 * (-2)`) without breaking binary subtraction?',
        invariantShift: 'Track whether the previous token was start-of-input, `(`, or another operator; rewrite unary `-` to a distinct high-precedence token `u-` (or inject `0 -`).',
        complexityImpact: 'Still single-pass O(N).',
      },
    ],
  },
  'avl-red-black-trees': {
    algorithmId: 'avl-red-black-trees',
    simpleAnalogy:
      'A hanging mobile sculpture: whenever one arm dips too low after adding a weight, a quick 3-pointer pivot (Left/Right Rotation) re-centers the balance without reordering any left-to-right labels.',
    interviewScript30s:
      '"Rotations preserve the BST in-order invariant in O(1) pointer swaps while enforcing O(log N) height. AVL keeps height strictly `|bf| ≤ 1` for faster reads; Red-Black relaxes height to `≤ 2 log₂(N)` so inserts/deletes need at most O(1) rotations."',
    chooseWhen: 'In-memory ordered maps/sets needing O(log N) range queries, predecessor/successor, and order statistics (Java TreeMap, C++ std::map).',
    avoidWhen: 'Pure exact-key lookup without ordering (HashMap is O(1)) or disk storage (B+ Trees cut random page I/O).',
    followUpTwists: [
      {
        question: 'Why does the Linux CFS scheduler and C++ `std::map` choose Red-Black Trees over AVL Trees?',
        invariantShift: 'AVL deletion can cascade O(log N) rotations back to the root, whereas Red-Black delete triggers at most 3 rotations—ideal for write-heavy workloads.',
        complexityImpact: 'O(1) rotations per update vs O(log N) worst-case AVL delete rotations.',
      },
      {
        question: 'How do you distinguish an LL/RR single rotation from an LR/RL double rotation in AVL?',
        invariantShift: 'Check the sign of `balanceFactor(node)` vs `balanceFactor(heavyChild)`: same sign = single rotation; opposite signs = double rotation.',
        complexityImpact: 'O(1) pointer updates at the lowest unbalanced ancestor.',
      },
    ],
  },
  'huffman-coding': {
    algorithmId: 'huffman-coding',
    simpleAnalogy:
      'Morse code for letters: assign the shortest dots-and-dashes to frequent letters like "E" and longer codes to rare letters like "Z", ensuring no code is the prefix of another so you never need spaces.',
    interviewScript30s:
      '"Huffman greedily extracts the two lowest-frequency symbols from a Min-Heap, merges them into a parent of combined weight, and repeats N − 1 times. This produces an optimal prefix-free binary code in O(K log K) time."',
    chooseWhen: 'Lossless entropy coding (DEFLATE/gzip, JPEG, PNG, HTTP/2 HPACK) and Minimum Cost to Connect Sticks (LC 1167).',
    avoidWhen: 'Symbols have skewed probabilities approaching 1.0 (Arithmetic / ANS coding beats Huffman’s 1-bit-per-symbol floor).',
    followUpTwists: [
      {
        question: 'If symbol frequencies are ALREADY sorted, can you build a Huffman tree faster than O(K log K)?',
        invariantShift: 'Use two FIFO queues (original sorted leaves + newly merged internal nodes); always pick the two smallest fronts in O(1) → total O(K)!',
        complexityImpact: 'Improves build from O(K log K) to linear O(K).',
      },
      {
        question: 'How do gzip/PNG avoid storing the entire Huffman tree pointer structure in file headers?',
        invariantShift: 'Use Canonical Huffman Codes: store only each symbol’s bit-length and reconstruct exact codes deterministically by sorting (bitLength, symbol).',
        complexityImpact: 'Shrinks header metadata dramatically with identical compression ratio.',
      },
    ],
  },
  'trie-prefix-autocomplete': {
    algorithmId: 'trie-prefix-autocomplete',
    simpleAnalogy:
      'A multi-story coat check organized letter by letter: all words starting with "app" share the exact same hallway `a → p → p` before branching into "apple" and "apply".',
    interviewScript30s:
      '"A Trie indexes strings by character path so insert, exact search, and prefix lookup run in O(L) time independent of dictionary size N—unlocking instant autocomplete and dead-branch DFS pruning in Word Search II."',
    chooseWhen: 'Search autocomplete, spellcheckers, longest common prefix, IP longest-prefix routing, and 2D board dictionary search.',
    avoidWhen: 'Millions of long sparse keys with tight RAM—compress single-child chains into a Radix Tree / Patricia Trie.',
    followUpTwists: [
      {
        question: 'How do you return the Top-3 hottest autocomplete suggestions in O(L) without DFS-ing the entire subtree?',
        invariantShift: 'Cache a pre-sorted top-3 `(freq, word)` list at every Trie node along the insertion path—querying any prefix becomes a pure O(L) read!',
        complexityImpact: 'Query drops from O(L + Subtree) to O(L); insert pays O(L · K).',
      },
      {
        question: 'How do you optimize Trie memory in Word Search II (LC 212) to avoid TLE?',
        invariantShift: 'Store the full `word` string at leaf nodes (eliminating string concatenation) and prune empty leaf branches backward once found.',
        complexityImpact: 'Prunes already-matched branches in O(1) amortized; actual speedup depends on dictionary size, prefix distribution, and cached Top-K maintenance.',
      },
    ],
  },
  'hash-table-probing': {
    algorithmId: 'hash-table-probing',
    simpleAnalogy:
      'A parking garage with assigned spots: Chaining stacks overflow cars in a side lane, while Open Addressing cruises sequentially (or by a second stride) to the next free stall—leaving a "tombstone" cone when a car leaves so later searches do not stop early.',
    interviewScript30s:
      '"Hash tables achieve O(1) expected lookup by hashing keys into buckets and resizing when load factor α crosses ~0.7. Open addressing (Linear/Quadratic/Double Hashing or Robin Hood) keeps buckets contiguous in CPU cache, while deletions require tombstones to preserve probe chains."',
    chooseWhen: 'O(1) key-value lookup, deduplication, frequency counting, and cache indexing (Python dict, Rust SwissTable, Java HashMap).',
    avoidWhen: 'Range queries, sorted iteration, or hard real-time O(1) worst-case without incremental rehashing.',
    followUpTwists: [
      {
        question: 'Why does deleting a key in Linear Probing by setting the slot to `EMPTY` corrupt lookups?',
        invariantShift: 'A later key that collided and probed past that slot will hit `EMPTY` and falsely report "not found"! You MUST write a `TOMBSTONE` marker (or backward-shift subsequent keys).',
        complexityImpact: 'Preserves correctness; periodic rehash clears accumulated tombstones.',
      },
      {
        question: 'How do Java 8 HashMap and Rust SwissTable defend against Hash-Flooding DoS attacks?',
        invariantShift: 'Java converts long bucket chains (len ≥ 8) into Red-Black Trees (O(log N) worst case); Rust uses randomized SipHash + SIMD 16-way parallel control-byte probing.',
        complexityImpact: 'Eliminates adversarial O(N²) degradation.',
      },
    ],
  },
  'splay-tree-rotations': {
    algorithmId: 'splay-tree-rotations',
    simpleAnalogy:
      'A stack of folders on your desk where every file you read gets placed right back on top—so the 5% of files you touch constantly are always one arm’s reach away.',
    interviewScript30s:
      '"Splay Trees require zero balance/color bits: every access rotates the target node to the root using Zig, Zig-Zig, and Zig-Zag double rotations. By potential-function analysis, every operation runs in O(log N) amortized and hot working-set keys approach O(1)."',
    chooseWhen: 'Skewed 80/20 locality workloads, ropes/text editors (split/join), and Link-Cut dynamic trees.',
    avoidWhen: 'Multi-threaded read-heavy concurrent workloads (even read lookups mutate the root, causing lock/cache-line contention).',
    followUpTwists: [
      {
        question: 'Why does Zig-Zig rotate the GRANDPARENT first instead of just doing two single rotations on X?',
        invariantShift: 'Two single rotations fail to halve the depth of the access path, allowing O(N) worst-case amortized sequences; parent-first Zig-Zig guarantees the O(log N) Access Theorem.',
        complexityImpact: 'Critical for amortized O(log N) proof.',
      },
      {
        question: 'How does Splay Tree support O(log N) Split and Join of entire sorted sequences?',
        invariantShift: 'Splay the split key to the root and sever its right child; to Join two trees, splay the max of the left tree to root (empty right child) and attach the right tree.',
        complexityImpact: 'O(log N) amortized split and merge.',
      },
    ],
  },
  'kd-tree-nearest-neighbor': {
    algorithmId: 'kd-tree-nearest-neighbor',
    simpleAnalogy:
      'Playing 20 Questions on a city map by alternating vertical and horizontal lines: if the closest café you found is 2 blocks away and the next avenue is 5 blocks away, you never even need to cross that avenue.',
    interviewScript30s:
      '"A K-D Tree cycles splitting axes `depth % k` at the median to partition k-dimensional space. Nearest-Neighbor DFS visits the closer child first and prunes the opposite branch whenever the perpendicular plane distance exceeds `bestDist`, achieving O(log N) average queries in low dimensions."',
    chooseWhen: 'Low-dimensional (k = 2..10) spatial nearest-neighbor search, LiDAR point clouds, and 3D ray-tracing BVHs.',
    avoidWhen: 'High-dimensional ML embeddings (k > 20)—curse of dimensionality forces visiting nearly all leaves (use HNSW / IVF-PQ ANN).',
    followUpTwists: [
      {
        question: 'Why does K-D Tree nearest-neighbor search degrade to O(N) in 128-dimensional vector search?',
        invariantShift: 'In high dimensions, hypersphere radii overlap almost every axis-aligned hyperplane, so the perpendicular distance pruning condition almost never triggers.',
        complexityImpact: 'Degrades from O(log N) to O(N); pivot to HNSW graph ANN.',
      },
      {
        question: 'How do you extend 1-NN search to K-Nearest Neighbors (KNN) cleanly?',
        invariantShift: 'Replace scalar `bestDist` with a size-K Max-Heap; prune the opposite subtree only when the heap has K items AND plane distance ≥ heap.top().',
        complexityImpact: 'O(log N + K log K) average in low dimensions.',
      },
    ],
  },
  'quadtree-octree-spatial': {
    algorithmId: 'quadtree-octree-spatial',
    simpleAnalogy:
      'Zooming into a map: empty oceans stay one huge square, while dense downtown Manhattan automatically splits into finer and finer 2×2 blocks until each tile holds only a handful of drivers.',
    interviewScript30s:
      '"A Quadtree (2D) or Octree (3D) recursively subdivides a bounding box into 4 (or 8) cells when a node exceeds capacity. Range queries skip non-intersecting cells; typical cost depends on balance and spatial distribution, while worst-case traversal can be O(N) plus reported results."',
    chooseWhen: 'Geo-proximity search (Uber/Yelp nearby drivers), 2D/3D game collision broad-phase, and sparse voxel terrain.',
    avoidWhen: 'Objects move at high velocity every millisecond across leaf boundaries (spatial hash grids or Geohash+Redis update faster).',
    followUpTwists: [
      {
        question: 'How do you handle a driver standing right on the border of two Quadtree quadrants?',
        invariantShift: 'Query using a bounding box centered on the user (`[x-r, x+r] × [y-r, y+r]`), which automatically intersects all bordering quadrants and filters exact Euclidean radius.',
        complexityImpact: 'Correctly includes intersecting neighboring quadrants; query cost depends on tree balance and spatial distribution and can be O(N) in the worst case.',
      },
      {
        question: 'What happens if two points share the exact same `(x, y)` coordinates during subdivision?',
        invariantShift: 'Without a `MAX_DEPTH` cap, splitting recurses infinitely! Always enforce a max depth or minimum tile width.',
        complexityImpact: 'Guarantees O(MAX_DEPTH) worst-case insert.',
      },
    ],
  },
  'bwt-fm-index': {
    algorithmId: 'bwt-fm-index',
    simpleAnalogy:
      'Sorting all circular rotations of a book pushes identical words next to each other so the last column becomes long runs of repeated letters—which compress tightly AND let you search any phrase backward using just letter counts.',
    interviewScript30s:
      '"BWT clusters contextually similar characters for Run-Length/Huffman compression (bzip2). By the Last-to-First (LF) mapping property, pairing BWT with `C[]` cumulative counts and `Occ(c, r)` rank queries creates an FM-Index that counts a pattern without decompressing. Query cost is O(|P|) when rank is O(1) (e.g., a fixed alphabet with suitable checkpoints); a Wavelet Tree typically adds a log-alphabet factor."',
    chooseWhen: 'Human genome alignment (Bowtie2, BWA), bzip2 compression, and compressed full-text substring indexing.',
    avoidWhen: 'Mutable live documents with frequent random character edits (rebuilding BWT/Suffix Array is O(N)).',
    followUpTwists: [
      {
        question: 'Why does the Last-to-First (LF) mapping property hold without storing any pointers?',
        invariantShift: 'Because both columns preserve the exact relative order of identical characters (the k-th occurrence of `c` in `L` is the exact same character as the k-th `c` in `F`).',
        complexityImpact: 'Enables O(1) backward step and lossless inversion in O(N).',
      },
      {
        question: 'How does Bowtie2 keep the `Occ(c, r)` table small for a 3-billion-base genome?',
        invariantShift: 'Store `Occ` checkpoints only every 64 or 128 positions (or use a Wavelet Tree) and count the short gap using CPU `popcount` bitmasks.',
        complexityImpact: 'Checkpoint sampling trades rank-query work for lower index memory; exact RAM and search cost depend on alphabet, checkpoint interval, and rank data structure.',
      },
    ],
  },
  'lzw-compression': {
    algorithmId: 'lzw-compression',
    simpleAnalogy:
      'Inventing abbreviations on the fly while texting: both sender and receiver start with the A–Z alphabet and automatically number every new two-letter combo they see—no dictionary ever has to be sent over the wire.',
    interviewScript30s:
      '"LZW greedily matches the longest prefix `w` in an adaptive Trie/dictionary, emits its code, and inserts `w + nextChar`. The decoder mirrors the exact same dictionary updates on the fly in O(N) time without transmitting the dictionary table."',
    chooseWhen: 'GIF, TIFF, PDF streams, and general repetitive text/binary compression where dictionary header overhead must be zero.',
    avoidWhen: 'Already-encrypted or high-entropy random data (dictionary bloats bit-width and expands output).',
    followUpTwists: [
      {
        question: 'What is the famous LZW `KwKwK` decoder edge case and how do you solve it?',
        invariantShift: 'When the encoder emits a code it JUST inserted (`nextCode`), the decoder has not added it yet—its value is provably `prevEntry + prevEntry[0]`!',
        complexityImpact: 'O(1) branch inside the decoder prevents fatal desynchronization.',
      },
      {
        question: 'What happens when a 12-bit LZW dictionary (4096 entries) fills up on a huge file?',
        invariantShift: 'Either freeze the dictionary, evict LRU entries, or emit a `CLEAR_CODE` (as GIF does) when compression ratio drops.',
        complexityImpact: 'Bounds memory strictly to O(2^bits) while adapting to changing data distributions.',
      },
    ],
  },
  'hopcroft-karp-hungarian': {
    algorithmId: 'hopcroft-karp-hungarian',
    simpleAnalogy:
      'Pairing riders with drivers: Hopcroft-Karp finds all shortest alternating swap chains at once in parallel waves, while the Hungarian algorithm adjusts "price bids" until every driver-rider pair hits minimum total wait time.',
    interviewScript30s:
      '"For unweighted maximum bipartite matching, Hopcroft-Karp layers the graph via BFS and extracts a maximal set of vertex-disjoint shortest augmenting paths via DFS in O(E √V). For minimum-cost weighted assignment, the Hungarian algorithm maintains dual potentials in O(V³)."',
    chooseWhen: 'Driver-rider dispatch, job-worker assignment, ad-slot allocation, and multi-object tracking (SORT/DeepSORT).',
    avoidWhen: 'Non-bipartite general graphs containing odd cycles (requires Edmonds’ Blossom Algorithm).',
    followUpTwists: [
      {
        question: 'How does Konig’s Theorem link Maximum Bipartite Matching to Minimum Vertex Cover?',
        invariantShift: 'In any bipartite graph, `|Min Vertex Cover| === |Max Matching|` and `|Max Independent Set| = V - |Max Matching|`—solving LC 1349 & grid-dominating problems directly!',
        complexityImpact: 'Turns NP-hard general problems into polynomial O(E √V) on bipartite graphs.',
      },
      {
        question: 'How do you turn a Min-Cost Hungarian solver into a MAX-Profit solver?',
        invariantShift: 'Negate every weight (`cost = -profit`) or subtract from `maxWeight` (`cost = maxW - profit`) before running the standard min-cost potential updates.',
        complexityImpact: 'Zero algorithmic change; stays O(V³).',
      },
    ],
  },
  'eulerian-hierholzer': {
    algorithmId: 'eulerian-hierholzer',
    simpleAnalogy:
      'Tracing a drawing without lifting your pen: walk forward erasing edges until you get stuck at the end, then backtrack and splice any unvisited side-loops directly into your path.',
    interviewScript30s:
      '"Unlike NP-hard Hamiltonian paths (every vertex once), an Eulerian path visits every EDGE once in O(E). Hierholzer’s algorithm consumes outgoing edges eagerly via DFS/stack and appends a node to the result ONLY when it runs out of edges (post-order), then reverses the output."',
    chooseWhen: 'Reconstruct Itinerary (LC 332), Valid Arrangement of Pairs (LC 2097), De Bruijn DNA genome assembly, and Crack the Safe.',
    avoidWhen: 'The problem asks to visit every VERTEX once (Hamiltonian Path / TSP → Bitmask DP).',
    followUpTwists: [
      {
        question: 'What exact degree conditions prove a directed graph has an Eulerian Path vs Circuit?',
        invariantShift: 'All non-zero-degree vertices lie in one connected component; Circuit needs `in[v] === out[v]` for all v; Path allows exactly one `out - in = 1` (start) and one `in - out = 1` (end).',
        complexityImpact: 'O(V + E) upfront validation.',
      },
      {
        question: 'Why does LC 332 sort each adjacency list in REVERSE order before popping?',
        invariantShift: 'Popping from the end of a reverse-sorted array gives the lexicographically smallest destination in O(1) instead of O(deg) `shift()`.',
        complexityImpact: 'O(E log E) total vs O(E²).',
      },
    ],
  },
  'tarjan-bridges-articulation': {
    algorithmId: 'tarjan-bridges-articulation',
    simpleAnalogy:
      'Inspecting a highway network for single points of failure: if an entire neighborhood behind road `(u, v)` has zero back-road detours reaching earlier towns (`low[v] > disc[u]`), that road is a critical bridge.',
    interviewScript30s:
      '"In one O(V + E) DFS pass, Tarjan tracks discovery time `disc[u]` and earliest reachable ancestor `low[u]`. Tree edge `(u, v)` is a Bridge iff `low[v] > disc[u]`, and non-root `u` is an Articulation Point iff `low[v] >= disc[u]`."',
    chooseWhen: 'Critical Connections in a Network (LC 1192), datacenter redundancy auditing, and biconnected component decomposition.',
    avoidWhen: 'Directed graph cycle compression (use Tarjan/Kosaraju SCC instead—directed reachability uses a stack and `onStack[]`).',
    followUpTwists: [
      {
        question: 'Why is the inequality strict (`>`) for Bridges but non-strict (`>=`) for Articulation Points?',
        invariantShift: 'If `low[v] === disc[u]`, subtree `v` has a back-edge right back to `u`: removing edge `(u, v)` leaves `v` connected to `u`, so NOT a bridge—but removing vertex `u` itself still disconnects `v`!',
        complexityImpact: 'Same O(V + E) single DFS pass.',
      },
      {
        question: 'How must you handle parallel multi-edges between `u` and `parent`?',
        invariantShift: 'Skip only the SINGLE parent edge by `edgeId` (not by `v === parent`), because a second parallel edge between `u` and `parent` means neither edge is a bridge!',
        complexityImpact: 'O(1) edge-ID check prevents false-positive bridges on multigraphs.',
      },
    ],
  },
  'johnsons-all-pairs': {
    algorithmId: 'johnsons-all-pairs',
    simpleAnalogy:
      'Elevating every city onto a gentle hill so every downhill negative-toll road becomes uphill (non-negative), letting you run ultra-fast Dijkstra from every city and then subtracting the elevation difference at the end.',
    interviewScript30s:
      '"Floyd-Warshall takes O(V³) even on sparse graphs. Johnson’s adds a virtual zero-weight super-source, runs Bellman-Ford once to compute potentials `h[v]`, reweights edges `w\' = w + h[u] - h[v] >= 0`, and runs V × Dijkstra in O(V · E log V)."',
    chooseWhen: 'All-Pairs Shortest Paths on SPARSE graphs (E ≪ V²) that may contain negative edge weights.',
    avoidWhen: 'Dense graphs where E ≈ V² (O(V³) Floyd-Warshall is simpler and cache-faster) or graphs with all non-negative weights (skip Bellman-Ford and run V × Dijkstra directly).',
    followUpTwists: [
      {
        question: 'Why does adding `h[u] - h[v]` to every edge NEVER change which path between `s` and `t` is shortest?',
        invariantShift: 'Intermediate node potentials telescope and cancel out: `w\'(path) = w(path) + h[s] - h[t]`, shifting every `s → t` path by the exact same constant!',
        complexityImpact: 'Exact shortest-path invariance proven algebraically.',
      },
      {
        question: 'What happens if the graph contains a negative-weight cycle?',
        invariantShift: 'The single initial Bellman-Ford pass from super-source `q` catches ANY negative cycle reachable anywhere in the graph and aborts immediately.',
        complexityImpact: 'O(V · E) early abort before running any Dijkstra passes.',
      },
    ],
  },
  'centroid-decomposition': {
    algorithmId: 'centroid-decomposition',
    simpleAnalogy:
      'Finding the balance point of a tree where cutting it breaks the tree into pieces at most half as big—doing this recursively builds a shallow O(log N)-tall command hierarchy over any skinny path graph.',
    interviewScript30s:
      '"Every tree has a centroid whose removal splits it into subtrees of size ≤ N/2. Recursively decomposing builds a Centroid Tree of height O(log N) where every original path `(u, v)` passes through `LCA_centroid(u, v)`, answering all-paths and dynamic nearest-node queries in O(N log N) / O(log² N)."',
    chooseWhen: 'Counting paths of exact length K in a tree, dynamic "paint node red / query nearest red node" (CF 342E), and tree divide-and-conquer.',
    avoidWhen: 'Path-range updates like "add +5 along path u..v" (Heavy-Light Decomposition + Segment Tree is built for path updates).',
    followUpTwists: [
      {
        question: 'Why does Centroid Decomposition handle a 100,000-node straight line without O(N²) stack blowup?',
        invariantShift: 'Unlike plain DFS rooted at node 1 (depth 100,000), the centroid of a line is always the exact middle—guaranteeing centroid-tree height ≤ ⌈log₂(100,000)⌉ = 17!',
        complexityImpact: 'Strict O(log N) centroid ancestors per node.',
      },
      {
        question: 'How do you avoid overcounting paths that start and end inside the SAME child subtree of a centroid?',
        invariantShift: 'Process one child subtree at a time: first query its depths against the accumulator map of PREVIOUS subtrees, then insert its depths into the map.',
        complexityImpact: 'O(N log N) total with zero inclusion-exclusion bugs.',
      },
    ],
  },
  'bloom-filter': {
    algorithmId: 'bloom-filter',
    simpleAnalogy:
      'A bouncer’s stamp sheet with k ink colors: if ANY of your k expected colors is missing, you definitely never visited; if all k colors are smudged, you probably visited (or someone else’s stamps overlapped).',
    interviewScript30s:
      '"An insert-only Bloom Filter hashes each key into an m-bit array using k hash positions in O(k) time. With intact bits and correct query/insert hashing it has no false negatives, and its false-positive rate is approximately `p ≈ (1 - e^(-kn/m))^k`; disk-read savings depend on the workload and chosen p."',
    chooseWhen: 'Database SSTable disk-skip (RocksDB/LevelDB/Cassandra), web-crawler URL dedup, and Chrome Safe Browsing.',
    avoidWhen: 'You require exact membership with zero false positives OR frequent deletions (upgrade to Counting Bloom Filter or Cuckoo Filter).',
    followUpTwists: [
      {
        question: 'Why can you NOT delete a key from a standard Bloom Filter by flipping its k bits back to 0?',
        invariantShift: 'Those bits may be shared by other inserted keys—clearing them introduces forbidden FALSE NEGATIVES! Use a Counting Bloom Filter (4-bit counters) or Cuckoo Filter instead.',
        complexityImpact: '4× memory overhead for 4-bit counters; restores safe deletion.',
      },
      {
        question: 'How do you compute k hash positions without running k slow cryptographic hashes?',
        invariantShift: 'Kirsch-Mitzenmacher double hashing: compute just two hashes `h1, h2` and derive `h_i(x) = (h1(x) + i * h2(x)) % m` with identical asymptotic false-positive rate!',
        complexityImpact: 'O(1) hash computation + O(k) arithmetic bit probes.',
      },
    ],
  },
  'skip-list': {
    algorithmId: 'skip-list',
    simpleAnalogy:
      'A subway system with local and express trains: ride the top-level express line skipping 100 stops at a time, drop down a level when you are about to overshoot, and take the local train for the final two stops.',
    interviewScript30s:
      '"A Skip List layers probabilistic express lanes over a sorted linked list (promoting nodes with p = 0.5 or 0.25). It matches Red-Black Tree O(log N) expected search/insert/delete without rotations—making lock-free concurrency and range scans dead simple (Redis ZSET, RocksDB MemTable)."',
    chooseWhen: 'Concurrent lock-free ordered maps (`ConcurrentSkipListMap`), Redis Sorted Sets, and LSM-Tree in-memory MemTables.',
    avoidWhen: 'Pointer-heavy cache misses hurt read-only static tables (B+ Trees or sorted arrays pack keys tightly into cache lines).',
    followUpTwists: [
      {
        question: 'Why does Redis choose a Skip List instead of an AVL/Red-Black Tree for ZSET (`ZRANGEBYSCORE`)?',
        invariantShift: 'Range queries walk level-0 forward pointers effortlessly, rank queries (`ZRANK`) just add span weights along search path, and implementation is simpler with tunable `p = 0.25` memory footprint.',
        complexityImpact: 'O(log N + K) range scan and O(log N) order-statistic rank.',
      },
      {
        question: 'Why are Skip Lists far easier to make lock-free than Red-Black Trees?',
        invariantShift: 'Insertions/deletions only CAS forward pointers locally at each level—no global multi-node tree rotations or parent re-colorings that require locking large subtrees.',
        complexityImpact: 'High multi-core write throughput under contention.',
      },
    ],
  },
  'count-min-sketch': {
    algorithmId: 'count-min-sketch',
    simpleAnalogy:
      'Keeping d independent tally notebooks where each item gets tossed into a hashed bucket: collisions can only inflate a bucket’s count, so taking the MINIMUM across all d notebooks strips away noise.',
    interviewScript30s:
      '"Count-Min Sketch uses a `d × w` counter matrix with independent hashes; updates and queries take O(d) time. With `w = O(1/ε)` and `d = O(log(1/δ))`, it estimates non-negative stream frequencies without underestimating, with additive error at most εN with probability at least 1−δ."',
    chooseWhen: 'Streaming Heavy Hitters / Top-K (paired with a size-K Min-Heap), DDoS IP rate monitoring, and Caffeine TinyLFU cache admission.',
    avoidWhen: 'Exact counts are legally/financially mandatory (billing ledgers) or keys undergo arbitrary unguarded negative decrements.',
    followUpTwists: [
      {
        question: 'What is "Conservative Update" and why does it slash Count-Min Sketch overestimation?',
        invariantShift: 'On increment, first read `minVal = query(x)` and ONLY increment the rows whose current cell equals `minVal`—preventing already-polluted buckets from growing further.',
        complexityImpact: 'Same O(d) time; accuracy depends on sketch width/depth and the stream distribution, with no decrements in the standard guarantee.',
      },
      {
        question: 'How do you find the Top-K heavy hitters over 1 billion events using Count-Min Sketch?',
        invariantShift: 'Feed every event into the CMS and check its estimated frequency against a tiny size-K Min-Heap of current heavy hitters—total RAM stays under a few megabytes!',
        complexityImpact: 'O(d + log K) per event, O(d·w + K) fixed memory.',
      },
    ],
  },
  'hyperloglog': {
    algorithmId: 'hyperloglog',
    simpleAnalogy:
      'If a stream contains many unique IDs, HyperLogLog hashes them into m registers and combines the leading-zero observations; with m = 16,384 and 6-bit registers it uses about 12 KB and has roughly 0.81% relative standard error (not a per-run error guarantee).',
    interviewScript30s:
      '"HyperLogLog hashes each ID, uses the top p bits to pick one of `m = 2^p` registers, and records the maximum leading-zero count `ρ` in the remaining bits. Register count determines memory and relative standard error (approximately 1.04/√m in the standard regime); 16,384 six-bit registers use about 12 KB and yield roughly 0.81% standard error."',
    chooseWhen: 'Unique daily active users (`Redis PFCOUNT`), BigQuery `APPROX_COUNT_DISTINCT`, and distributed ad-impression deduplication.',
    avoidWhen: 'You need exact uniqueness counts, element membership queries ("was user X seen?"), or set intersection accuracy.',
    followUpTwists: [
      {
        question: 'Why does HyperLogLog use the HARMONIC mean instead of the arithmetic mean?',
        invariantShift: 'A single lucky hash with 25 leading zeros (2^25 = 33M) would completely blow up an arithmetic mean; the harmonic mean dampens extreme outliers dramatically.',
        complexityImpact: 'Cuts standard error down to `1.04 / √m`.',
      },
      {
        question: 'How do you merge HyperLogLog sketches from 50 distributed Kafka partitions?',
        invariantShift: 'Take the element-wise `max(regA[i], regB[i])` across all `m` registers—it is commutative, associative, and idempotent (a true Join-Semilattice CRDT)!',
        complexityImpact: 'O(m) lossless union merge without double-counting duplicates.',
      },
    ],
  },
  'cache-lru-lfu-arc': {
    algorithmId: 'cache-lru-lfu-arc',
    simpleAnalogy:
      'A tiny kitchen counter: LRU kicks out the spice jar you touched longest ago; LFU kicks out the jar you used fewest times; ARC watches your trash bin ("ghost lists") to automatically balance recency vs frequency when a one-time party scan happens.',
    interviewScript30s:
      '"LRU pairs a HashMap with a Doubly Linked List for O(1) get/put. LFU adds frequency-bucketed DLLs plus `minFreq` for O(1) frequency eviction. ARC tracks two ghost eviction lists (B1/B2) to dynamically adapt recency-vs-frequency split and achieve scan resistance."',
    chooseWhen: 'Application caches, DB buffer pools (ZFS/PostgreSQL), CDN edge nodes, and LC 146 (LRU) / LC 460 (LFU).',
    avoidWhen: 'Pure sequential full-table scans under naive LRU (causes cache thrashing—use ARC, LRU-K, or TinyLFU).',
    followUpTwists: [
      {
        question: 'Why does a single full-table scan wipe out an LRU cache, and how does ARC stop it?',
        invariantShift: 'Every scanned page enters LRU as "most recent", which can evict hot working-set pages. ARC adapts between recency and frequency; pages promoted to T2 can be better protected from one-time scans, but no policy guarantees every hot page survives every workload.',
        complexityImpact: 'Still O(1) per access with high hit-rate stability.',
      },
      {
        question: 'How can LFU support O(1) expected updates without an O(log N) Min-Heap?',
        invariantShift: 'Maintain `freqToDLL` mapping each integer frequency to a doubly linked list and track scalar `minFreq`—since frequency only increments by +1 on access, `minFreq` updates in O(1)!',
        complexityImpact: 'Drops O(log C) heap update to strict O(1) get & put.',
      },
    ],
  },
  'buddy-memory-allocator': {
    algorithmId: 'buddy-memory-allocator',
    simpleAnalogy:
      'Splitting a giant sheet of graph paper strictly in half until a piece fits your drawing; when you finish, if the matching twin half beside it is also free, tape them back together in one step.',
    interviewScript30s:
      '"The Buddy Allocator rounds requests up to powers of 2 (`2^k`) and splits larger free blocks in half on demand. On `free(addr, order)`, its twin buddy’s address is computed in O(1) via `addr ^ (1 << order)`, enabling coalescing across at most O(log M) block orders. Buddy allocation can still suffer external fragmentation because free blocks of incompatible sizes cannot always combine."',
    chooseWhen: 'OS kernel physical page-frame allocators (Linux `alloc_pages`), slab backends, and real-time embedded memory pools.',
    avoidWhen: 'Many odd-sized allocations just above a power of 2 (e.g., 65 bytes wastes 63 bytes of internal fragmentation—pair with a Slab Allocator).',
    followUpTwists: [
      {
        question: 'Why does Linux pair the Buddy Allocator with a Slab/SLUB Allocator on top?',
        invariantShift: 'Buddy manages contiguous 4KB–4MB physical pages with low external fragmentation; Slab chops those pages into exact fixed-size object caches (e.g., 192-byte inodes) to eliminate internal fragmentation.',
        complexityImpact: 'O(1) small-object allocation + O(log M) page coalescing.',
      },
      {
        question: 'Why does `buddyAddr = addr ^ blockSize` always locate the exact merge partner?',
        invariantShift: 'Every aligned `2^k` block differs from its sibling twin in strictly bit `k` (0 for left twin, 1 for right twin)—so XORing bit `k` toggles directly between twins.',
        complexityImpact: 'O(1) bitwise buddy lookup without searching metadata trees.',
      },
    ],
  },
  'persistent-data-structures': {
    algorithmId: 'persistent-data-structures',
    simpleAnalogy:
      'Editing one chapter of a textbook by photocopying only the table of contents and that single chapter while sharing all 19 unchanged chapters—giving you instant time-travel back to every historical edition.',
    interviewScript30s:
      '"Path Copying creates immutable new nodes strictly along the O(log N) root-to-leaf edit path while sharing all untouched subtrees structurally. Fat Node versioning stores timestamped field logs per node. Both preserve every past version for O(log N) time-travel queries."',
    chooseWhen: 'Immutable Redux/Clojure collections, Git/Btrfs copy-on-write snapshots, and Persistent Segment Tree K-th smallest in range `[L, R]`.',
    avoidWhen: 'Tight in-place mutation loops with zero historical query requirements (causes extra heap allocations and GC pressure).',
    followUpTwists: [
      {
        question: 'How does a Persistent Segment Tree answer "K-th smallest value in subarray `[L..R]`" in O(log N)?',
        invariantShift: 'Build version `i` by adding `nums[i]` to a value-indexed Segment Tree; subtracting `root[R] - root[L - 1]` gives exact frequency counts for `[L..R]` and walks down the tree in O(log N)!',
        complexityImpact: 'O(N log N) build & space, O(log N) per range-order query.',
      },
      {
        question: 'What is the difference between Partial Persistence and Full Persistence?',
        invariantShift: 'Partial persistence lets you query any past version but only branch/edit the latest; Full persistence lets you fork and edit ANY historical version (creating a version DAG like Git).',
        complexityImpact: 'Path copying supports Full Persistence naturally in O(log N) per edit.',
      },
    ],
  },
  'lockfree-cas-rcu': {
    algorithmId: 'lockfree-cas-rcu',
    simpleAnalogy:
      'Updating a highway billboard while cars zoom past: build the entire new sign backstage, swap the pointer in one atomic click (CAS), and wait until every car already on the bridge finishes passing (RCU grace period) before recycling the old sign.',
    interviewScript30s:
      '"Mutexes can block readers and risk priority inversion. Compare-And-Swap (CAS) loops retry pointer updates without taking a mutex (Michael-Scott Queue), but are not automatically wait-free. RCU read-side critical sections are typically very low-overhead and avoid reader-side locks; old memory is reclaimed only after a grace period, with exact guarantees depending on the RCU implementation."',
    chooseWhen: 'OS routing tables & kernel lists (Linux RCU), HFT lock-free queues, and read-mostly shared configs at 100M+ QPS.',
    avoidWhen: 'Write-heavy multi-object atomic transactions (mutexes or STM are simpler and avoid CAS livelock storms).',
    followUpTwists: [
      {
        question: 'What is the ABA problem in a lock-free CAS stack/queue and how do you prevent it?',
        invariantShift: 'Thread 1 reads `A`, stalls while another thread pops `A`, pops `B`, and recycles memory back to `A`—so Thread 1’s CAS falsely succeeds! Fix with Tagged/Versioned Pointers (`(ptr, version++)`) or Hazard Pointers.',
        complexityImpact: 'A tagged/versioned pointer helps detect ABA; finite tag wrap and safe memory reclamation still need to be addressed.',
      },
      {
        question: 'Why does RCU outperform Reader-Writer Locks (RWLock) on 64-core servers?',
        invariantShift: 'Even shared RWLock readers atomically increment a shared counter, causing massive cross-core cache-line bouncing; RCU readers issue zero shared writes, scaling linearly with core count.',
        complexityImpact: 'O(1) read-side work in common RCU designs; do not call it wait-free across all implementations or workloads, and scalability depends on grace-period/reclamation behavior.',
      },
    ],
  },
  'bplus-tree-storage': {
    algorithmId: 'bplus-tree-storage',
    simpleAnalogy:
      'A multi-volume encyclopedia index: internal directory pages hold many guide words so high fanout reduces the number of page levels; linked leaf pages support sequential chapter-wide scans. Actual page reads depend on page layout and cache.',
    interviewScript30s:
      '"A B+ Tree packs many separator keys into 4KB–16KB internal pages and keeps payloads in linked leaves, reducing tree height and supporting sequential range scans. The number of page reads depends on fanout, page occupancy, cache hits, and storage layout; a large table may require only a few uncached index-page reads, but this is not a fixed guarantee."',
    chooseWhen: 'OLTP relational indexes (PostgreSQL, MySQL InnoDB, SQLite) requiring fast point lookups, predictable latency, and ordered `BETWEEN` range scans.',
    avoidWhen: 'Write-heavy petabyte append/time-series workloads where random in-place 16KB page updates bottleneck disk IOPS (use LSM-Trees).',
    followUpTwists: [
      {
        question: 'Why do databases store row payloads ONLY in B+ Tree leaves instead of internal nodes (like classic B-Trees)?',
        invariantShift: 'Keeping payloads out of internal pages increases fanout and reduces tree height; actual fanout and page depth depend on key/pointer sizes, page size, fill factor, and row count. Linked leaves support sequential range scans.',
        complexityImpact: 'Reduces random disk I/Os compared with lower-fanout layouts; the actual lookup and range-scan improvement depends on page size, occupancy, and cache.',
      },
      {
        question: 'Why do random UUIDv4 primary keys hurt InnoDB B+ Tree write performance compared to UUIDv7/BIGSERIAL?',
        invariantShift: 'UUIDv4 inserts into random leaf pages, causing frequent 50% page splits, cache-buffer misses, and write amplification; monotonic UUIDv7 appends cleanly to the rightmost leaf.',
        complexityImpact: 'Monotonic keys often improve locality and reduce random page splits; throughput and page-fill gains depend on workload, page size, concurrency, and database implementation.',
      },
    ],
  },
  'lsm-tree-compaction': {
    algorithmId: 'lsm-tree-compaction',
    simpleAnalogy:
      'Dumping incoming receipts sequentially into a tidy notepad (MemTable) instead of filing each one into an alphabetized cabinet; once the notepad fills up, sort it once into a sealed binder (SSTable) and merge binders in the background.',
    interviewScript30s:
      '"LSM-Trees convert random disk writes into sequential O(1) WAL appends + in-memory SkipList writes, flushing immutable sorted SSTables to disk. Background compaction (Size-Tiered for write speed, Leveled for tight read/space amplification) merges keys while Bloom Filters skip irrelevant SSTables."',
    chooseWhen: 'High-write-throughput KV/time-series/wide-column stores (RocksDB, Cassandra, ScyllaDB, HBase, InfluxDB).',
    avoidWhen: 'Read-heavy low-latency point queries without memory for Bloom Filters/block cache, or unpredictable compaction tail-latency sensitivity.',
    followUpTwists: [
      {
        question: 'How do you DELETE a key when SSTables on disk are strictly immutable?',
        invariantShift: 'Write a special `TOMBSTONE` record into the MemTable; reads stop if they hit a tombstone first, and compaction physically reclaims the dead key only when it reaches the bottommost level.',
        complexityImpact: 'O(1) write delete; excess tombstones can slow range scans until compacted.',
      },
      {
        question: 'Compare Size-Tiered Compaction (STCS) vs Leveled Compaction (LCS) across Read/Write/Space amplification.',
        invariantShift: 'STCS often reduces write amplification at the cost of higher read/space amplification; LCS keeps non-overlapping key ranges per level to improve read predictability at higher write amplification. Temporary space and amplification ratios depend on level sizing, compaction policy, and workload.',
        complexityImpact: 'Fundamental RUM (Read/Update/Memory) storage tradeoff.',
      },
    ],
  },
  'external-kway-merge': {
    algorithmId: 'external-kway-merge',
    simpleAnalogy:
      'Sorting a 100-GB deck of cards on a desk that only holds 1 GB: sort 100 separate 1-GB stacks onto the floor, then pull the top card from each stack using a 100-slot winner bracket (Min-Heap) to stream one giant sorted output.',
    interviewScript30s:
      '"When data exceeds RAM, External K-Way Merge first chunks input into RAM-sized sorted runs on disk, then streams all K runs through a size-K Min-Heap using page-sized input/output buffers—minimizing sequential disk passes to `1 + ⌈log_B(N/M)⌉`."',
    chooseWhen: 'SQL `ORDER BY` / `GROUP BY` spills to disk, LSM-Tree SSTable compaction, MapReduce shuffle, and LC 23 Merge K Sorted Lists.',
    avoidWhen: 'Dataset fits comfortably inside RAM (standard in-memory TimSort/QuickSort avoids disk serialization overhead).',
    followUpTwists: [
      {
        question: 'How does Replacement Selection produce initial runs ~2× larger than available RAM?',
        invariantShift: 'Stream incoming elements through a RAM Min-Heap: items ≥ last emitted value join the current run; smaller items stay frozen in the heap for the next run—averaging 2M run length on random input!',
        complexityImpact: 'Halves number of sorted runs K, reducing merge fan-in.',
      },
      {
        question: 'Why do production engines use double buffering during the K-way merge phase?',
        invariantShift: 'While the CPU merges buffer A, async I/O prefetches buffer B from disk so sequential disk reads overlap CPU heap comparisons completely.',
        complexityImpact: 'Eliminates I/O wait stalls during multi-gigabyte sorts.',
      },
    ],
  },
  'aries-wal-recovery': {
    algorithmId: 'aries-wal-recovery',
    simpleAnalogy:
      'An accountant’s flight recorder: write every ledger entry to the indestructible logbook BEFORE editing the whiteboard (WAL). After a power outage, scan forward to see what was in flight (Analysis), replay every logged mark (Redo), then erase uncommitted drafts backward (Undo).',
    interviewScript30s:
      '"ARIES enables high-performance STEAL/NO-FORCE buffer management via Write-Ahead Logging and Page LSNs. On crash, three passes restore exact ACID state: Analysis rebuilds dirty pages & active transactions, Redo repeats history for durability, and Undo rolls back uncommitted transactions writing CLRs so crash-during-recovery stays idempotent."',
    chooseWhen: 'ACID relational database crash recovery (PostgreSQL, MySQL InnoDB, DB2, SQL Server).',
    avoidWhen: 'Ephemeral caches or non-durable in-memory queues where losing un-flushed data on restart is acceptable.',
    followUpTwists: [
      {
        question: 'Why does ARIES Redo pass replay EVEN uncommitted transactions before Undo rolls them back?',
        invariantShift: '"Repeating History" restores the exact physical page state at crash time so physiological Undo operations (like B-Tree splits) and nested CLRs execute cleanly without structural corruption.',
        complexityImpact: 'Guarantees idempotent recovery even across repeated crashes mid-recovery.',
      },
      {
        question: 'What is a Compensation Log Record (CLR) and why does it prevent infinite crash loops?',
        invariantShift: 'Every Undo action logs a redo-only CLR pointing `undoNextLSN` to the prior record; if the DB crashes during Undo, the next recovery skips already-undone steps instead of undoing an undo!',
        complexityImpact: 'Bounded O(LogSize) recovery regardless of crash frequency.',
      },
    ],
  },
  'sql-joins-volcano': {
    algorithmId: 'sql-joins-volcano',
    simpleAnalogy:
      'An assembly line pulling parts on demand (`next()`): Hash Join builds a quick lookup shelf for the smaller table, while Sort-Merge Join walks two sorted conveyor belts in lockstep without ever holding the whole dataset in memory.',
    interviewScript30s:
      '"The Volcano iterator model pulls one tuple at a time (`open/next/close`) so operators compose with O(1) pipeline memory. Hash Join streams in O(R + S) by hashing the smaller build table; Sort-Merge Join shines when inputs are pre-sorted or output needs ordering."',
    chooseWhen: 'Relational query planners (PostgreSQL, DuckDB, Spark SQL): Hash Join for unsorted equi-joins, Sort-Merge for pre-sorted/range joins, Nested Loop for tiny/indexed inner tables.',
    avoidWhen: 'Tuple-at-a-time Volcano calls bottleneck OLAP columnar scans (upgrade to Vectorized 1024-row batches or LLVM JIT codegen).',
    followUpTwists: [
      {
        question: 'What happens in a Grace Hash Join when even the SMALLER build table does not fit in RAM?',
        invariantShift: 'Partition BOTH tables to disk using hash `h1(key)` into B spill buckets, then load one bucket pair at a time into RAM and join using an independent hash `h2(key)`.',
        complexityImpact: 'O(R + S) I/O passes without OOM crashes.',
      },
      {
        question: 'Why are modern OLAP engines (DuckDB, ClickHouse, Photon) replacing row-by-row Volcano with Vectorized Execution?',
        invariantShift: 'Passing a 1,024-row column batch per `next()` call amortizes virtual function dispatch 1000× and unlocks CPU SIMD AVX2/AVX-512 instructions.',
        complexityImpact: '10–50× faster analytical scan & join throughput.',
      },
    ],
  },
  'consistent-hashing-dht': {
    algorithmId: 'consistent-hashing-dht',
    simpleAnalogy:
      'Seating servers around a circular clock face: each key walks clockwise to the first server it meets. Adding a new server only steals keys from its single clockwise neighbor—and giving each server 150 "virtual seats" balances the pie evenly.',
    interviewScript30s:
      '"Modulo hashing (`hash(k) % N`) remaps ~100% of keys when a node joins or dies. Consistent Hashing places keys and virtual nodes on a hash ring, moving only `K / N` keys on topology changes. Chord adds O(log N) finger tables; Rendezvous Hashing picks `argmax hash(k, node)` with zero ring state."',
    chooseWhen: 'Distributed caches (Memcached, Redis Cluster), Dynamo/Cassandra sharding, CDNs, and sticky load balancers.',
    avoidWhen: 'Hot celebrity keys skew load onto one shard regardless of ring balance (requires key salting or local read-through caching).',
    followUpTwists: [
      {
        question: 'Why are Virtual Nodes (vnodes) mandatory in production Consistent Hashing?',
        invariantShift: 'With only 1 point per server, random placement creates 3–5× shard imbalance and causes a dead node’s entire load to slam one neighbor; 100–200 vnodes/server cut variance to < 5% and spread failover across the whole cluster.',
        complexityImpact: 'O(log(N · V)) lookup, uniform load balance, heterogeneous hardware weighting.',
      },
      {
        question: 'When is Rendezvous (Highest Random Weight) Hashing cleaner than a Ring?',
        invariantShift: 'When N is modest (≤ few hundred backends), picking `argmax_i hash(key, server_i)` requires zero ring binary-search structure, naturally yields top-R replicas, and balances uniformly without vnodes.',
        complexityImpact: 'O(N) compute, O(1) metadata state, minimal K/N remapping.',
      },
    ],
  },
  'raft-paxos-consensus': {
    algorithmId: 'raft-paxos-consensus',
    simpleAnalogy:
      'A club where a new president needs a majority vote AND must prove they have the most up-to-date meeting minutes; once a majority signs a new page of minutes, that decision is etched in stone forever.',
    interviewScript30s:
      '"Raft achieves linearizable consensus across 2F + 1 nodes by separating Leader Election (randomized timeouts + term numbers + log up-to-date check) from Log Replication (entries commit only once replicated to a majority quorum in the current term)."',
    chooseWhen: 'Metadata/configuration stores, distributed locks, and leader-elected state machines (etcd, Consul, CockroachDB, TiKV).',
    avoidWhen: 'Ultra-high-throughput geo-replicated caches or shopping carts that must stay writable during network partitions (use AP/CRDTs).',
    followUpTwists: [
      {
        question: 'Why is a Raft leader FORBIDDEN from committing an entry from a PREVIOUS term by counting replicas alone?',
        invariantShift: 'Figure 8 of the Raft paper proves a future leader could overwrite an old-term majority entry unless the current leader commits an entry from its OWN current term first (implicitly locking all prior entries).',
        complexityImpact: 'Critical safety invariant; prevents committed-log loss.',
      },
      {
        question: 'How do you handle a stale partitioned old leader serving dirty reads (Split-Brain Read)?',
        invariantShift: 'Serve linearizable reads via `ReadIndex` (leader confirms majority heartbeat quorum before answering) or time-bounded Leader Leases.',
        complexityImpact: '1 RTT quorum heartbeat confirms leadership without writing a disk log entry.',
      },
    ],
  },
  'gossip-phi-accrual': {
    algorithmId: 'gossip-phi-accrual',
    simpleAnalogy:
      'Spreading news at a party by telling 2 random friends every second—everybody hears it in log₂(N) rounds. Instead of declaring a quiet friend dead after a rigid 5-second timer, Phi Accrual scores how statistically unusual their silence is given past Wi-Fi jitter.',
    interviewScript30s:
      '"Gossip disseminates cluster membership in O(log N) rounds with bounded O(1) per-node bandwidth—no central heartbeat bottleneck. Pairing it with the Phi Accrual Failure Detector outputs a continuous suspicion score `φ = -log₁₀(P_later(t_now - t_last))` that adapts automatically to network jitter."',
    chooseWhen: 'Large decentralized peer-to-peer clusters (Cassandra, ScyllaDB, Akka, Consul Serf, Dynamo) scaling to hundreds/thousands of nodes.',
    avoidWhen: 'Strict instant linearizable membership changes where stale views cannot be tolerated (use Raft/ZooKeeper).',
    followUpTwists: [
      {
        question: 'Why does naive all-to-all heartbeating collapse as a cluster grows to 1,000 nodes?',
        invariantShift: 'All-to-all generates O(N²) heartbeat messages per second (1,000,000 msgs/s); Gossip sends constant k = 3 pings per node (O(N) total) and still converges in ~10 rounds.',
        complexityImpact: 'Drops network bandwidth from O(N²) to O(N) cluster-wide.',
      },
      {
        question: 'How does SWIM improve Gossip failure detection accuracy over direct ping timeouts?',
        invariantShift: 'If direct ping to node B fails, node A asks k random peers to send indirect `ping-req` probes to B—ruling out localized link flaps before marking B Suspect.',
        complexityImpact: 'Drastically cuts false-positive node evictions in O(1) extra probes.',
      },
    ],
  },
  'merkle-tree-sync': {
    algorithmId: 'merkle-tree-sync',
    simpleAnalogy:
      'Comparing two massive warehouses of 10 million boxes by checking a single master checksum on the front door: if they match, walk away in 1 second; if they differ, open only the half whose sub-checksum disagrees.',
    interviewScript30s:
      '"A Merkle Tree hashes data blocks at leaves and hashes pairs upward to one root digest. Two replicas compare roots in O(1) and drill only into mismatched subtrees—locating a single corrupted key among N records in O(log N) network messages instead of transferring the full dataset."',
    chooseWhen: 'Distributed DB anti-entropy repair (Cassandra/Dynamo), Git commit trees, BitTorrent chunk verification, and Blockchain SPV inclusion proofs.',
    avoidWhen: 'Replicas differ across > 30% of keys simultaneously (full snapshot streaming beats tree-traversal round trips).',
    followUpTwists: [
      {
        question: 'How does a light client verify one transaction inside a 4,096-tx block without downloading all 4,096 txs?',
        invariantShift: 'Download only the `log₂(4096) = 12` sibling hashes along the root-to-leaf audit path (a Merkle Proof) and recompute the root hash in O(log N) hashes!',
        complexityImpact: 'O(log N) proof size (~384 bytes) vs O(N) full block download.',
      },
      {
        question: 'What is a "Second Preimage Attack" on naive Merkle Trees and how is it fixed?',
        invariantShift: 'Without domain separation, an attacker can treat an internal 64-byte node as a leaf! Prefix leaf hashes with `0x00` and internal hashes with `0x01` (RFC 6962).',
        complexityImpact: 'Zero performance cost; guarantees cryptographic soundness.',
      },
    ],
  },
  'vector-clocks-lamport': {
    algorithmId: 'vector-clocks-lamport',
    simpleAnalogy:
      'Wall clocks drift across countries, so each teammate keeps a score-card `[Alice: 2, Bob: 1]` counting messages seen from everyone. If my scorecard beats yours in every slot, my edit happened after yours; if each of us is ahead in a different slot, we edited concurrently!',
    interviewScript30s:
      '"Physical wall clocks skew via NTP jumps. Lamport scalar clocks capture `A → B ⇒ L(A) < L(B)` in O(1) space but cannot distinguish causality from concurrency. Vector Clocks track one counter per replica (`O(N)`) so `V(A) < V(B)` iff A causally preceded B—pinpointing true concurrent write conflicts."',
    chooseWhen: 'Multi-leader conflict detection (Dynamo/Riak), causal broadcast, distributed debugging traces, and optimistic replication.',
    avoidWhen: 'Thousands of ephemeral client IDs writing directly (vector size explodes to O(Clients)—bind counters to server replicas or use Dotted Version Vectors).',
    followUpTwists: [
      {
        question: 'Why does `Lamport(A) < Lamport(B)` NOT prove event A caused event B?',
        invariantShift: 'A single scalar compresses parallel timelines onto one number line: two independent offline writes can have timestamps 3 and 5 with zero causal link—only Vector Clocks detect concurrency.',
        complexityImpact: 'O(N) metadata vs O(1) scalar buys exact causal partial-order isomorphism.',
      },
      {
        question: 'How do CockroachDB and Spanner combine physical time with logical causality?',
        invariantShift: 'Hybrid Logical Clocks (HLC) pack `(physicalTime, logicalCounter)` into 64 bits for bounded skew; Spanner uses GPS/atomic TrueTime uncertainty intervals (`commit-wait`).',
        complexityImpact: 'O(1) timestamp size with external consistency guarantees.',
      },
    ],
  },
  'crdt-gcounter-orset': {
    algorithmId: 'crdt-gcounter-orset',
    simpleAnalogy:
      'Two teammates editing an offline shopping cart on airplanes: instead of locking the cart or letting one overwrite the other, every item added carries a unique receipt tag so when both phones reconnect, merging in any order produces the exact same cart.',
    interviewScript30s:
      '"CRDTs guarantee Strong Eventual Consistency without coordination locks by designing merge operations that are Commutative, Associative, and Idempotent (a Join-Semilattice). G-Counters merge per-replica `max()`, PN-Counters subtract two G-Counters, and OR-Sets tag every add with a UUID so add-wins removes never resurrect stale items."',
    chooseWhen: 'Offline-first collaborative editors (Figma/Automerge/Yjs), multi-region counters, shopping carts, and Redis Enterprise active-active geo-replication.',
    avoidWhen: 'Strict global invariants like "bank balance must never go below $0" or "last seat on a flight" (requires consensus/serialization).',
    followUpTwists: [
      {
        question: 'Why does a naive 2P-Set fail for a shopping cart where a user adds, removes, and re-adds "Milk"?',
        invariantShift: 'In a 2P-Set, once "Milk" enters the tombstone set it can NEVER be re-added! An OR-Set (Observed-Remove Set) attaches a fresh unique tag `(Milk, uuid2)` on re-add so only observed older tags are tombstoned.',
        complexityImpact: 'Allows unlimited add/remove cycles with exact add-wins semantics.',
      },
      {
        question: 'What is the bandwidth problem with State-Based CRDTs and how do Delta-CRDTs solve it?',
        invariantShift: 'Shipping the full replica state on every gossip tick wastes bandwidth; Delta-CRDTs ship only recent `delta` mutations, which still satisfy the exact same commutative/idempotent merge laws.',
        complexityImpact: 'Cuts network sync traffic from O(|State|) to O(|Delta|) while keeping fault tolerance.',
      },
    ],
  },
};

export const MASTER_40_COMPLEXITY_PROFILES: Record<string, ComplexityComparisonProfile> = {
  'linear-search': {
    recursiveApproach: 'Tail-Recursive Index Scan',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(N) stack (without TCO)',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1) → Θ(N) worst, O(1) best',
    depthWorkFormula: (d) => `Probe ${d} → 1 equality comparison on cache-hot slot`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'Sequential For-Loop / Sentinel Scan',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(1)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative sequential scan maximizes CPU hardware prefetching and avoids O(N) stack overflow on large arrays.',
  },
  'interpolation-search': {
    recursiveApproach: 'Recursive Proportional-Slope Search',
    recursiveTimeBigO: 'O(log log N) uniform · O(N) skewed',
    recursiveSpaceBigO: 'O(log log N) avg · O(N) worst stack',
    recurrenceRelation: 'Uniform: T(N) = T(√N) + O(1) → O(log log N); Skewed: T(N) = T(N − 1) + O(1)',
    depthWorkFormula: (d) => `Probe ${d} → narrows uniform range to ≈ N^(1 / 2^${d})`,
    maxDepthBigO: 'O(log log N) avg',
    iterativeApproach: 'Iterative Slope-Probe + Binary Guard Loop',
    iterativeTimeBigO: 'O(log log N) avg · O(log N) guarded',
    iterativeSpaceBigO: 'O(1)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative loop with a binary fallback guard achieves O(log log N) uniform speed with zero risk of O(N) stack overflow.',
  },
  'elementary-sorts': {
    recursiveApproach: 'Recursive Prefix Insertion Sort',
    recursiveTimeBigO: 'O(N²) worst · O(N) nearly sorted',
    recursiveSpaceBigO: 'O(N) stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(inversions_at_N) → O(N + I)',
    depthWorkFormula: (d) => `Pass ${d} → inserts item into sorted prefix of length ${d}`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: 'In-Place Shift-Insert Loop (TimSort Base Case)',
    iterativeTimeBigO: 'O(N + I) ≤ O(N²)',
    iterativeSpaceBigO: 'O(1) in-place',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative Insertion Sort is adaptive, stable, and faster than O(N log N) sorts for N ≤ 32 subarrays.',
  },
  'heapify-heapsort': {
    recursiveApproach: 'Recursive Top-Down SiftDown Heap Sort',
    recursiveTimeBigO: 'O(N) build + O(N log N) extract',
    recursiveSpaceBigO: 'O(log N) recursion stack',
    recurrenceRelation: 'Build: ∑_{h=0}^{log N} (N / 2^(h+1)) · O(h) = O(N); Sort: N · O(log N)',
    depthWorkFormula: (d) => `Height ${d} → 2 child comparisons + 1 swap down binary heap`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Iterative Array SiftDown (Floyd Build + In-Place Extract)',
    iterativeTimeBigO: 'O(N log N) worst-case guaranteed',
    iterativeSpaceBigO: 'O(1) strict in-place',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative siftDown achieves true O(1) total space and deterministic O(N log N) worst-case without QuickSort’s O(N²) hazard.',
  },
  'counting-radix-sort': {
    recursiveApproach: 'MSD Recursive Radix Bucket Partitioning',
    recursiveTimeBigO: 'O(d · (N + B))',
    recursiveSpaceBigO: 'O(N + d · B)',
    recurrenceRelation: 'd passes × (N counts + B prefix sums + N stable placements) = O(d(N + B))',
    depthWorkFormula: (d) => `Digit pass ${d} → stable bucket scatter across radix base B`,
    maxDepthBigO: 'O(d) digit passes',
    iterativeApproach: 'Iterative LSD Stable Counting-Sort Passes',
    iterativeTimeBigO: 'O(d · (N + B))',
    iterativeSpaceBigO: 'O(N + B)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative LSD Radix breaks the Ω(N log N) comparison barrier cleanly for fixed-width integers and strings.',
  },
  'linked-list-reversal': {
    recursiveApproach: 'Post-Order Recursive Pointer Reversal',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(N) call stack',
    recurrenceRelation: 'T(N) = T(N − 1) + O(1) pointer rewire',
    depthWorkFormula: (d) => `Node ${d} → rewires head.next.next = head`,
    maxDepthBigO: 'O(N)',
    iterativeApproach: '3-Pointer In-Place Loop (prev, curr, next)',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(1)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative 3-pointer reversal uses O(1) memory and never overflows the call stack on 10^5-node linked lists.',
  },
  'shunting-yard-parser': {
    recursiveApproach: 'Recursive Descent Expression Grammar',
    recursiveTimeBigO: 'O(N)',
    recursiveSpaceBigO: 'O(Depth) call stack',
    recurrenceRelation: 'Each token pushed once and popped ≤ once from opStack → ≤ 2N ops',
    depthWorkFormula: (d) => `Token ${d} → O(1) precedence comparison & RPN emit`,
    maxDepthBigO: 'O(N) nested parens',
    iterativeApproach: 'Explicit Operator Precedence Stack (Dijkstra Shunting-Yard)',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(N) operator stack',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Explicit Shunting-Yard avoids deep recursion on 10,000-nested parentheses and outputs RPN directly in one linear scan.',
  },
  'avl-red-black-trees': {
    recursiveApproach: 'Recursive BST Insert/Delete + Unwind Rebalance',
    recursiveTimeBigO: 'O(log N) guaranteed',
    recursiveSpaceBigO: 'O(log N) call stack',
    recurrenceRelation: 'AVL h ≤ 1.44 log₂(N); RB h ≤ 2 log₂(N + 1) → O(log N) path + O(1) rotation',
    depthWorkFormula: (d) => `Tree level ${d} → 1 key comparison + height/color check`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Parent-Pointer Iterative Traversal + Fixup Loop',
    iterativeTimeBigO: 'O(log N) worst-case',
    iterativeSpaceBigO: 'O(1) auxiliary',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Balanced rotations eliminate O(N) BST skew; Red-Black’s O(1) delete rotations win on write-heavy kernels and std::map.',
  },
  'huffman-coding': {
    recursiveApproach: 'Recursive DFS Codeword Table Extraction',
    recursiveTimeBigO: 'O(K log K) build + O(K) codegen',
    recursiveSpaceBigO: 'O(K) tree + O(H) stack',
    recurrenceRelation: '(K − 1) × (2 extractMin + 1 insert) in Min-Heap = O(K log K)',
    depthWorkFormula: (d) => `Merge ${d} → combines 2 lightest subtrees in O(log K)`,
    maxDepthBigO: 'O(K) worst tree depth',
    iterativeApproach: 'Min-Heap Greedy Merge Loop (or 2-Queue O(K) on sorted)',
    iterativeTimeBigO: 'O(K log K) · O(K) pre-sorted',
    iterativeSpaceBigO: 'O(K)',
    iterativeStackOverhead: 'O(1) build stack',
    tradeoffVerdict: 'Greedy min-heap pairing guarantees minimum expected bits per symbol across all prefix-free codes.',
  },
  'trie-prefix-autocomplete': {
    recursiveApproach: 'Recursive Character-Index Trie Descent',
    recursiveTimeBigO: 'O(L) insert/search · O(L + K) prefix',
    recursiveSpaceBigO: 'O(L) stack + O(Nodes · Σ)',
    recurrenceRelation: 'T(L) = T(L − 1) + O(1) child edge lookup → strictly independent of dictionary size N',
    depthWorkFormula: (d) => `Char depth ${d} → 1 O(1) child table jump`,
    maxDepthBigO: 'O(L) word length',
    iterativeApproach: 'Iterative Pointer Walk (`curr = curr.children[ch]`)',
    iterativeTimeBigO: 'O(L)',
    iterativeSpaceBigO: 'O(Total Chars) shared prefixes',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative Trie walks run in O(L) regardless of whether the dictionary has 100 or 10,000,000 words.',
  },
  'hash-table-probing': {
    recursiveApproach: 'Recursive Probe-Chain Traversal',
    recursiveTimeBigO: 'O(1) expected (α < 0.7)',
    recursiveSpaceBigO: 'O(1/(1 − α)) expected stack',
    recurrenceRelation: 'Expected probes ≈ 1 / (1 − α) for open addressing; 1 + α/2 for chaining',
    depthWorkFormula: (d) => `Probe ${d} → contiguous cache-line slot check`,
    maxDepthBigO: 'O(1) expected',
    iterativeApproach: 'Iterative Open-Addressing / Bucket Loop + Amortized 2× Rehash',
    iterativeTimeBigO: 'O(1) amortized · O(N) worst-case',
    iterativeSpaceBigO: 'O(N / α)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative open addressing exploits L1/L2 cache locality cleanly; resizing at α = 0.7 keeps amortized ops O(1).',
  },
  'splay-tree-rotations': {
    recursiveApproach: 'Top-Down / Recursive Splay Restructuring',
    recursiveTimeBigO: 'O(log N) amortized · O(N) single op',
    recursiveSpaceBigO: 'O(N) worst-case stack',
    recurrenceRelation: 'Potential Φ = ∑ log₂(size(x)) → amortized cost ≤ 3(r(root) − r(x)) + 1 = O(log N)',
    depthWorkFormula: (d) => `Splay step ${d} → Zig-Zig / Zig-Zag halves path depth`,
    maxDepthBigO: 'O(N) worst single access',
    iterativeApproach: 'Iterative Top-Down Left/Right Assembly Loop',
    iterativeTimeBigO: 'O(log N) amortized',
    iterativeSpaceBigO: 'O(1) auxiliary (zero balance bits)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative top-down splaying avoids stack overflow on skewed initial trees while achieving O(1) hot-set locality.',
  },
  'kd-tree-nearest-neighbor': {
    recursiveApproach: 'Recursive Axis-Split DFS + Hypersphere Pruning',
    recursiveTimeBigO: 'O(log N) avg (low-D) · O(N) high-D',
    recursiveSpaceBigO: 'O(log N) balanced stack',
    recurrenceRelation: 'Build: T(N) = 2T(N/2) + O(N) = O(N log N); Query prunes whenever |q_a − p_a| ≥ bestDist',
    depthWorkFormula: (d) => `Axis depth ${d} → splits along dimension ${d} mod k`,
    maxDepthBigO: 'O(log N) balanced',
    iterativeApproach: 'Best-First Priority Queue Spatial Search',
    iterativeTimeBigO: 'O(log N) avg · O(N) worst',
    iterativeSpaceBigO: 'O(N) tree + O(log N) PQ',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Recursive DFS with closer-child-first ordering tightly shrinks `bestDist` early, pruning most branches in 2D/3D.',
  },
  'quadtree-octree-spatial': {
    recursiveApproach: 'Recursive 4-Way / 8-Way Quadrant Subdivision',
    recursiveTimeBigO: 'Distribution-sensitive range query; O(N) worst case plus output',
    recursiveSpaceBigO: 'O(N) leaves + O(Depth) stack',
    recurrenceRelation: 'Region side halves per level → depth ≤ log₂(WorldWidth / MinCell)',
    depthWorkFormula: (d) => `Zoom level ${d} → cell width shrinks by 1 / 2^${d}`,
    maxDepthBigO: 'O(log(Span/ε))',
    iterativeApproach: 'Iterative Stack / Morton Z-Order Linear Quadtree',
    iterativeTimeBigO: 'Distribution-sensitive; O(N) worst-case traversal',
    iterativeSpaceBigO: 'O(N)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Adaptive subdivision can skip empty regions efficiently for favorable spatial distributions; cap MAX_DEPTH or minimum cell width to prevent unbounded splitting on coincident points, while acknowledging O(N) worst-case queries.',
  },
  'bwt-fm-index': {
    recursiveApproach: 'Suffix-Tree / Recursive BWT Search',
    recursiveTimeBigO: 'O(|P|) pattern count when rank/Occ is O(1); wavelet-tree rank adds a log-alphabet factor',
    recursiveSpaceBigO: 'O(N) compressed bits',
    recurrenceRelation: 'Backward step: [l, r] ← [C[c] + Occ(c, l−1), C[c] + Occ(c, r) − 1] in O(1) per char',
    depthWorkFormula: (d) => `Pattern char ${d} → 2 O(1) Occ rank lookups narrow SA range`,
    maxDepthBigO: 'O(|P|)',
    iterativeApproach: 'Iterative Backward-Search Loop over C[] + Occ Checkpoints',
    iterativeTimeBigO: 'O(|P|) query · O(N log N) build',
    iterativeSpaceBigO: 'O(N · H₀) compressed',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'FM-Index backward search avoids decompressing the full text; memory and per-character rank cost depend on checkpoint sampling and rank structure.',
  },
  'lzw-compression': {
    recursiveApproach: 'Recursive Prefix-Trie Dictionary Expansion',
    recursiveTimeBigO: 'O(N) encode & decode',
    recursiveSpaceBigO: 'O(DictSize) ≤ O(2^bits)',
    recurrenceRelation: 'Each input character advances or emits 1 code in O(1) expected Trie/Hash time',
    depthWorkFormula: (d) => `Symbol ${d} → O(1) longest-prefix extension`,
    maxDepthBigO: 'O(MaxPhraseLen)',
    iterativeApproach: 'Single-Pass Iterative Greedy Dictionary Loop',
    iterativeTimeBigO: 'O(N)',
    iterativeSpaceBigO: 'O(2^bits) capped table',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Single-pass LZW achieves O(N) streaming compression and decompression with zero transmitted dictionary header.',
  },
  'hopcroft-karp-hungarian': {
    recursiveApproach: 'Recursive DFS Augmenting Path Finder',
    recursiveTimeBigO: 'O(E √V) HK · O(V³) Hungarian',
    recursiveSpaceBigO: 'O(V + E)',
    recurrenceRelation: 'HK: ≤ 2√V BFS+DFS phases × O(E) = O(E√V); Hungarian: V rows × O(V²) dual updates',
    depthWorkFormula: (d) => `Phase ${d} → shortest augmenting path length strictly increases`,
    maxDepthBigO: 'O(V)',
    iterativeApproach: 'BFS Layering + Iterative Hungarian Potential Loop',
    iterativeTimeBigO: 'O(E √V) / O(V³)',
    iterativeSpaceBigO: 'O(V + E) / O(V²)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Hopcroft-Karp beats naive O(V·E) Kuhn matching by √V; Hungarian solves weighted assignment optimally in O(V³).',
  },
  'eulerian-hierholzer': {
    recursiveApproach: 'Post-Order Recursive DFS Edge Consumption',
    recursiveTimeBigO: 'O(V + E)',
    recursiveSpaceBigO: 'O(E) recursion stack',
    recurrenceRelation: 'Each edge popped from adjacency list exactly once → O(V + E) (+ O(E log E) if sorted)',
    depthWorkFormula: (d) => `Edge ${d} → consumed permanently before backtracking`,
    maxDepthBigO: 'O(E)',
    iterativeApproach: 'Explicit Vertex Stack Hierholzer Loop',
    iterativeTimeBigO: 'O(V + E)',
    iterativeSpaceBigO: 'O(V + E)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Explicit-stack Hierholzer never overflows the call stack on 200,000-edge graphs while splicing sub-cycles in O(E).',
  },
  'tarjan-bridges-articulation': {
    recursiveApproach: 'Single-Pass Recursive Tarjan DFS (`disc` & `low`)',
    recursiveTimeBigO: 'O(V + E)',
    recursiveSpaceBigO: 'O(V) call stack',
    recurrenceRelation: 'Every vertex visited once, every undirected edge checked twice → Θ(V + E)',
    depthWorkFormula: (d) => `DFS depth ${d} → propagates low[v] back to parent u`,
    maxDepthBigO: 'O(V)',
    iterativeApproach: 'Explicit State-Frame Iterative Tarjan DFS',
    iterativeTimeBigO: 'O(V + E)',
    iterativeSpaceBigO: 'O(V + E)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Single-pass Tarjan beats naive O(E·(V+E)) edge-removal testing by a full factor of E.',
  },
  'johnsons-all-pairs': {
    recursiveApproach: 'Recursive DP APSP vs Reweighted Dijkstra',
    recursiveTimeBigO: 'O(V · E log V)',
    recursiveSpaceBigO: 'O(V² + E)',
    recurrenceRelation: '1 × Bellman-Ford O(V·E) + V × Dijkstra O((V+E) log V) = O(V·E log V)',
    depthWorkFormula: (d) => `Source ${d} → non-negative reweighted Dijkstra pass`,
    maxDepthBigO: 'O(V)',
    iterativeApproach: 'Iterative Bellman-Ford Potentials + V × Min-Heap Dijkstra',
    iterativeTimeBigO: 'O(V² log V + V · E)',
    iterativeSpaceBigO: 'O(V²)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'On sparse graphs with negative edges, Johnson’s O(V·E log V) crushes Floyd-Warshall’s O(V³).',
  },
  'centroid-decomposition': {
    recursiveApproach: 'Recursive Divide-and-Conquer Centroid Tree',
    recursiveTimeBigO: 'O(N log N) build · O(log² N) query',
    recursiveSpaceBigO: 'O(N log N)',
    recurrenceRelation: 'T(N) = ∑ T(n_i) + O(N) where every n_i ≤ N/2 → T(N) = O(N log N)',
    depthWorkFormula: (d) => `Centroid level ${d} → component size ≤ N / 2^${d}`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Iterative Centroid Ancestor Climb Loop',
    iterativeTimeBigO: 'O(log N) ancestor hops per update/query',
    iterativeSpaceBigO: 'O(N log N) ancestor table',
    iterativeStackOverhead: 'O(1) query stack',
    tradeoffVerdict: 'Halving component sizes at every level guarantees ≤ 20 recursion levels even on a 1,000,000-node chain.',
  },
  'bloom-filter': {
    recursiveApproach: 'Multi-Hash Bitwise Projection',
    recursiveTimeBigO: 'O(k) ≈ O(1)',
    recursiveSpaceBigO: 'O(m bits) ≈ 1.44 N log₂(1/p)',
    recurrenceRelation: 'Optimal k = (m / n) ln 2 → false positive p ≈ (0.6185)^(m/n)',
    depthWorkFormula: (d) => `Hash ${d} → sets/tests 1 bit in m-bit bitset`,
    maxDepthBigO: 'O(k) hashes',
    iterativeApproach: 'Kirsch-Mitzenmacher Double-Hash Bitset Loop',
    iterativeTimeBigO: 'O(k) constant (~7 bits for 1% FP)',
    iterativeSpaceBigO: '~10 bits per key (1% FP)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'A Bloom Filter can use roughly 10 bits per key for a chosen false-positive rate and reduce unnecessary SSTable reads; memory and savings depend on the target rate and workload.',
  },
  'skip-list': {
    recursiveApproach: 'Recursive Multi-Level Express Descent',
    recursiveTimeBigO: 'O(log N) expected',
    recursiveSpaceBigO: 'O(log N) stack + O(N / (1 − p)) pointers',
    recurrenceRelation: 'Expected height E[H] = log_{1/p}(N); expected pointers/node = 1 / (1 − p)',
    depthWorkFormula: (d) => `Express level ${d} → jumps ~2^${d} nodes per forward hop`,
    maxDepthBigO: 'O(log N) expected',
    iterativeApproach: 'Iterative Top-Down Update-Path Loop (Lock-Free Friendly)',
    iterativeTimeBigO: 'O(log N) expected',
    iterativeSpaceBigO: 'O(N) expected',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Iterative multi-level search matches balanced BST O(log N) performance with dramatically simpler lock-free CAS updates.',
  },
  'count-min-sketch': {
    recursiveApproach: 'Multi-Row Independent Hash Projection',
    recursiveTimeBigO: 'O(d) = O(log(1/δ))',
    recursiveSpaceBigO: 'O(d · w) = O((1/ε) log(1/δ))',
    recurrenceRelation: 'w = ⌈e / ε⌉, d = ⌈ln(1 / δ)⌉ → Pr[est − true > εN] ≤ δ',
    depthWorkFormula: (d) => `Row ${d} → 1 hash + 1 counter increment/min-read`,
    maxDepthBigO: 'O(d) rows',
    iterativeApproach: 'Fixed 2D Counter Matrix Loop (O(1) Streaming RAM)',
    iterativeTimeBigO: 'O(d) constant (~5 ops)',
    iterativeSpaceBigO: 'O(d · w) sublinear fixed RAM',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Tracks stream frequencies with parameterized sublinear counters; estimates do not undercount under non-negative updates, with additive error controlled by ε and δ.',
  },
  'hyperloglog': {
    recursiveApproach: 'Bit-Prefix Register Bucketing + Harmonic Mean',
    recursiveTimeBigO: 'O(1) add · O(m) count/merge',
    recursiveSpaceBigO: 'O(m · log log N) ≈ 12 KB for 10⁹ keys',
    recurrenceRelation: 'Standard error σ ≈ 1.04 / √m (m = 2^p registers, 6 bits each)',
    depthWorkFormula: (d) => `Register ${d} → stores max leading zeros ρ(w)`,
    maxDepthBigO: 'O(1) add',
    iterativeApproach: 'O(1) Bitwise Register Update + Harmonic Estimator',
    iterativeTimeBigO: 'O(1) add · O(m) cardinality readout',
    iterativeSpaceBigO: '12 KB fixed (p = 14 → 16,384 × 6-bit regs)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Uses mergeable registers with memory and relative standard error determined by register count; standard error is approximately 1.04/√m after small-range corrections.',
  },
  'cache-lru-lfu-arc': {
    recursiveApproach: 'TreeMap / Heap Eviction Queue',
    recursiveTimeBigO: 'O(log C) heap/tree',
    recursiveSpaceBigO: 'O(C)',
    recurrenceRelation: 'HashMap O(1) node handle + Doubly Linked List O(1) splice → strict O(1)',
    depthWorkFormula: (d) => `Op ${d} → O(1) Hash lookup + 4-pointer DLL detach/attach`,
    maxDepthBigO: 'O(1)',
    iterativeApproach: 'HashMap + Sentinel DLL (LRU) / Freq-DLL (LFU) / Ghost Lists (ARC)',
    iterativeTimeBigO: 'O(1) get & put',
    iterativeSpaceBigO: 'O(C) capacity',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Pointer-spliced doubly linked lists plus a HashMap provide O(1) expected data-structure operations; ARC adapts recency/frequency and can improve scan resistance depending on workload.',
  },
  'buddy-memory-allocator': {
    recursiveApproach: 'Recursive Power-of-2 Block Split / Coalesce',
    recursiveTimeBigO: 'O(log(MaxOrder − MinOrder))',
    recursiveSpaceBigO: 'O(log M) stack + free lists',
    recurrenceRelation: 'At most log₂(MaxSize / MinSize) splits on alloc and XOR merges on free',
    depthWorkFormula: (d) => `Order ${d} → splits/merges aligned 2^${d} block with addr ^ 2^${d}`,
    maxDepthBigO: 'O(log M)',
    iterativeApproach: 'Iterative Order Free-List Split & XOR Coalesce Loop',
    iterativeTimeBigO: 'O(log M) worst-case (~20 ops)',
    iterativeSpaceBigO: 'O(M / MinBlock) bitmap/free-lists',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Power-of-two splitting and XOR buddy lookup enable bounded coalescing; external fragmentation can still occur when free blocks cannot merge.',
  },
  'persistent-data-structures': {
    recursiveApproach: 'Recursive Path-Copying Functional Tree Update',
    recursiveTimeBigO: 'O(log N) per versioned edit',
    recursiveSpaceBigO: 'O(log N) new nodes per edit',
    recurrenceRelation: 'Creates strictly h = ⌈log₂ N⌉ copied nodes while sharing N − h immutable nodes',
    depthWorkFormula: (d) => `Tree depth ${d} → clones 1 spine node, shares sibling pointer`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Persistent Spine Cloning / Fat-Node Timestamp Log',
    iterativeTimeBigO: 'O(log N) edit & historical query',
    iterativeSpaceBigO: 'O(N + M log N) across M edits',
    iterativeStackOverhead: 'O(log N) or O(1)',
    tradeoffVerdict: 'Avoids full-copy snapshots by structurally sharing unchanged subtrees; the amount shared depends on the data structure and edit pattern.',
  },
  'lockfree-cas-rcu': {
    recursiveApproach: 'Lock-Based Critical Section vs Low-Overhead RCU Read-Side',
    recursiveTimeBigO: 'O(1) uncontended CAS; common RCU read-side work is O(1), with progress/reclamation guarantees implementation-dependent',
    recursiveSpaceBigO: 'O(1) per op + grace-period deferred trash',
    recurrenceRelation: 'CAS retries grow with write contention; common RCU read-side designs avoid shared writes, with implementation-specific progress and reclamation guarantees',
    depthWorkFormula: (d) => `Attempt ${d} → 1 hardware CMPXCHG atomic instruction`,
    maxDepthBigO: 'Common O(1) RCU read-side work; not a universal wait-free guarantee',
    iterativeApproach: 'Iterative CAS Retry Loop / RCU Publish + Grace-Period Reclaim',
    iterativeTimeBigO: 'CAS operation cost depends on retries/contention; common RCU read-side work is O(1), not a universal wait-free guarantee',
    iterativeSpaceBigO: 'O(Pending Deferred Copies)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'RCU can reduce reader-side cache-line contention in read-mostly workloads; tagged CAS helps detect ABA but finite tag wrap and safe reclamation must be handled.',
  },
  'bplus-tree-storage': {
    recursiveApproach: 'Recursive Page Descent + Bottom-Up Split/Merge',
    recursiveTimeBigO: 'O(log_B N) disk I/Os; actual page count depends on fanout, occupancy, cache, and storage layout',
    recursiveSpaceBigO: 'O(log_B N) path stack',
    recurrenceRelation: 'Height h ≤ ⌈log_{B/2}(N)⌉ where B ≈ 200–500 keys per 16KB page',
    depthWorkFormula: (d) => `Page level ${d} → binary searches ~500 separator keys in 1 page`,
    maxDepthBigO: 'O(log_B N), with page depth dependent on fanout and occupancy',
    iterativeApproach: 'Latch-Crabbing Iterative Page Traversal + Linked Leaf Scan',
    iterativeTimeBigO: 'O(log_B N) lookup · O(log_B N + K/B) range',
    iterativeSpaceBigO: 'O(N / B) disk pages',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'High branching factor B reduces tree height and disk-page visits relative to binary trees; actual I/O depends on page size, occupancy, and cache, while linked leaves support sequential range scans.',
  },
  'lsm-tree-compaction': {
    recursiveApproach: 'Multi-Level SSTable Lookup + Background Merge',
    recursiveTimeBigO: 'O(1) WAL + O(log M) write · O(L · log S) read',
    recursiveSpaceBigO: 'O(N) + compaction space amp (1.1× LCS / 2× STCS)',
    recurrenceRelation: 'Level count and Bloom-filter savings depend on size ratio, level policy, false-positive rate, and query mix',
    depthWorkFormula: (d) => `Level L${d} → Bloom Filter check + 1 binary-searched SSTable`,
    maxDepthBigO: 'O(log_T N) levels',
    iterativeApproach: 'Sequential WAL + SkipList MemTable + K-Way Compaction',
    iterativeTimeBigO: 'O(log M) write · O(1) Bloom-filtered read',
    iterativeSpaceBigO: 'O(N) disk + O(Bloom bits) RAM',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Turns many random updates into sequential WAL/SSTable writes, often improving ingest throughput for write-heavy workloads; the gain depends on compaction policy, device, and workload.',
  },
  'external-kway-merge': {
    recursiveApproach: 'Multi-Pass Balanced External Merge Tree',
    recursiveTimeBigO: 'O(N log N) CPU · O((N/B) · log_{M/B}(N/M)) I/O',
    recursiveSpaceBigO: 'O(M) bounded RAM buffer',
    recurrenceRelation: 'I/O Passes = 1 + ⌈log_{B_mem − 1}(N / M)⌉ (usually just 2 passes for terabytes!)',
    depthWorkFormula: (d) => `Merge pass ${d} → streams K sorted runs through size-K Min-Heap`,
    maxDepthBigO: 'O(log_{M/B}(N/M)) passes',
    iterativeApproach: 'Buffered K-Way Min-Heap Streaming Merge',
    iterativeTimeBigO: 'O((N / B) · passes) sequential I/O',
    iterativeSpaceBigO: 'O(M) RAM',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Sorts datasets larger than RAM by creating sorted runs and performing buffered multiway merges; pass count depends on memory, buffer size, fan-in, and dataset size.',
  },
  'aries-wal-recovery': {
    recursiveApproach: 'Forward Log Scan + Backward Undo Chain',
    recursiveTimeBigO: 'O(|Log since Checkpoint|)',
    recursiveSpaceBigO: 'O(|ActiveTx| + |DirtyPages|)',
    recurrenceRelation: '3 linear log passes: Analysis (fwd) + Redo (fwd from minRecLSN) + Undo (bwd via prevLSN)',
    depthWorkFormula: (d) => `LSN ${d} → idempotent PageLSN check (< recordLSN) or CLR undo`,
    maxDepthBigO: 'O(1) stack',
    iterativeApproach: '3-Pass Iterative LSN Scanner (Analysis → Redo → Undo + CLRs)',
    iterativeTimeBigO: 'O(|WAL tail|)',
    iterativeSpaceBigO: 'O(|DPT| + |ATT|)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'WAL and checkpointing bound recovery work according to checkpoint interval and log volume; STEAL/NO-FORCE permits buffer management flexibility but commit durability still depends on the configured log-flush policy.',
  },
  'sql-joins-volcano': {
    recursiveApproach: 'Nested-Loop Join O(|R| · |S|)',
    recursiveTimeBigO: 'O(|R| + |S|) Hash · O(|R|log|R| + |S|log|S|) Sort-Merge',
    recursiveSpaceBigO: 'O(min(|R|, |S|)) Hash · O(1) sorted Merge',
    recurrenceRelation: 'Hash: build min(|R|,|S|) + probe max(|R|,|S|); Volcano pulls 1 tuple/batch per next()',
    depthWorkFormula: (d) => `Operator ${d} → Volcano next() pulls pipelined rows without temp tables`,
    maxDepthBigO: 'O(QueryPlanHeight)',
    iterativeApproach: 'Pipelined Volcano / Vectorized Batch Hash & Sort-Merge Join',
    iterativeTimeBigO: 'O(|R| + |S|) expected equi-join',
    iterativeSpaceBigO: 'O(min(|R|, |S|)) build hash table',
    iterativeStackOverhead: 'O(PlanDepth)',
    tradeoffVerdict: 'Hash Join crushes O(|R|·|S|) nested loops on large tables; Sort-Merge wins on pre-sorted indexes or tight RAM.',
  },
  'consistent-hashing-dht': {
    recursiveApproach: 'Chord O(log N) Finger-Table Routing Hops',
    recursiveTimeBigO: 'O(log(N · V)) local ring · O(log N) DHT hops',
    recursiveSpaceBigO: 'O(N · V) ring entries · O(log N) fingers',
    recurrenceRelation: 'Topology change moves strictly K / N keys (vs ~K(N−1)/N for key % N)',
    depthWorkFormula: (d) => `Hop ${d} → halves clockwise distance around 2^m ring`,
    maxDepthBigO: 'O(log N) hops',
    iterativeApproach: 'Binary Search on Sorted Virtual-Node Ring / Rendezvous Argmax',
    iterativeTimeBigO: 'O(log(N · V)) ring · O(N) HRW',
    iterativeSpaceBigO: 'O(N · V)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Consistent hashing limits remapping when nodes join or leave; virtual-node count and hash distribution affect balance, while cache-miss and skew improvements depend on workload and configuration.',
  },
  'raft-paxos-consensus': {
    recursiveApproach: 'Multi-Round Paxos Prepare/Accept vs Raft Leader Pipeline',
    recursiveTimeBigO: '1 RTT per committed log entry (steady state)',
    recursiveSpaceBigO: 'O(LogSize) compacted via Snapshots',
    recurrenceRelation: 'Quorum Q = ⌊N / 2⌋ + 1 guarantees any two quorums intersect in ≥ 1 node',
    depthWorkFormula: (d) => `Term ${d} → majority AppendEntries RPC commits index safely`,
    maxDepthBigO: 'O(1) steady-state RTT',
    iterativeApproach: 'Event-Loop State Machine (Follower ↔ Candidate ↔ Leader)',
    iterativeTimeBigO: 'O(N) RPCs/commit · 1 RTT latency',
    iterativeSpaceBigO: 'O(Snapshotted Log)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Raft and Paxos can provide linearizable consensus under their stated quorum/failure assumptions; steady-state latency depends on protocol variant, batching, leader placement, and network RTT.',
  },
  'gossip-phi-accrual': {
    recursiveApproach: 'Exponential Epidemic Broadcast Tree',
    recursiveTimeBigO: 'O(log N) rounds to infect 100% of N nodes',
    recursiveSpaceBigO: 'O(N) membership table + O(W) heartbeat window',
    recurrenceRelation: 'Infected nodes double every round: I(t+1) ≈ min(N, k · I(t)) → Θ(log N) rounds',
    depthWorkFormula: (d) => `Round ${d} → reaches ≈ min(N, 2^${d}) peers with O(1) fanout`,
    maxDepthBigO: 'O(log N) rounds',
    iterativeApproach: 'Periodic O(1)-Fanout Gossip Loop + Sliding-Window Phi Score',
    iterativeTimeBigO: 'O(1) msg/node/tick · O(log N) convergence',
    iterativeSpaceBigO: 'O(N + W)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Decentralized gossip eliminates O(N²) heartbeat storms and Phi Accrual adapts cleanly to real cloud jitter.',
  },
  'merkle-tree-sync': {
    recursiveApproach: 'Top-Down Recursive Subtree Digest Diff',
    recursiveTimeBigO: 'O(1) identical · O(k log(N/k)) for k differing keys',
    recursiveSpaceBigO: 'O(N) tree hashes · O(log N) inclusion proof',
    recurrenceRelation: 'Only subtrees containing at least 1 of k dirty keys are traversed → ≤ 2k · log₂ N hashes',
    depthWorkFormula: (d) => `Tree depth ${d} → skips all matching sibling digest branches`,
    maxDepthBigO: 'O(log N)',
    iterativeApproach: 'Level-Order / Proof-Array Hash Verification Loop',
    iterativeTimeBigO: 'O(log N) per single-key sync or SPV proof',
    iterativeSpaceBigO: 'O(log N) proof payload',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Pinpoints 1 corrupted record out of 10M keys in ~24 hash comparisons instead of streaming gigabytes.',
  },
  'vector-clocks-lamport': {
    recursiveApproach: 'Causal Event DAG Reachability Check',
    recursiveTimeBigO: 'O(1) Lamport · O(N) Vector Clock compare/merge',
    recursiveSpaceBigO: 'O(1) Lamport · O(N) Vector Clock',
    recurrenceRelation: 'V(A) < V(B) ⇔ ∀i V(A)[i] ≤ V(B)[i] ∧ ∃j V(A)[j] < V(B)[j] in O(N) comparisons',
    depthWorkFormula: (d) => `Replica slot ${d} → takes element-wise max(local[d], remote[d])`,
    maxDepthBigO: 'O(1)',
    iterativeApproach: 'Iterative Element-Wise Max Merge & Dominance Scan',
    iterativeTimeBigO: 'O(N) replicas',
    iterativeSpaceBigO: 'O(N) counters per key',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Vector clocks detect exact concurrent write conflicts without synchronized physical clocks; prune old entries when N grows.',
  },
  'crdt-gcounter-orset': {
    recursiveApproach: 'Coordination-Free Lattice Join Merge',
    recursiveTimeBigO: 'O(1) local op · O(R) state merge (O(Δ) delta merge)',
    recursiveSpaceBigO: 'O(R) counter · O(|Adds| + |Tombstones|) OR-Set',
    recurrenceRelation: 'Merge ⊔ satisfies Commutativity, Associativity & Idempotence ⇒ guaranteed convergence',
    depthWorkFormula: (d) => `Replica ${d} → monotone lattice join never loses updates`,
    maxDepthBigO: 'O(1)',
    iterativeApproach: 'Local Mutation + Async Idempotent Delta-State Gossip Merge',
    iterativeTimeBigO: 'O(1) offline write latency',
    iterativeSpaceBigO: 'O(R) / O(Unique Tags)',
    iterativeStackOverhead: 'O(1) OS call stack',
    tradeoffVerdict: 'Allows local updates without synchronous cross-region consensus and converges after replicas exchange updates under the CRDT merge and delivery assumptions; local storage/network latency is not zero.',
  },
};

export const MASTER_BESPOKE_UPGRADE_SPECS: Record<string, AlgorithmUpgradeAndArchitectSpec> = {
  'bplus-tree-storage': {
    algorithmId: 'bplus-tree-storage',
    brute: { label: 'Brute Force', approach: 'Full unsorted heap-file table scan across all disk blocks.', time: 'O(N / B) I/O', space: 'O(1)', bottleneckOrWin: 'Reads millions of pages for a single primary-key lookup.' },
    better: { label: 'Better', approach: 'Balanced Binary Tree (AVL/RB) stored on disk.', time: 'O(log₂ N) I/O', space: 'O(N)', bottleneckOrWin: 'Height ~30 causes 30 random disk seeks (~150ms) and terrible range scan locality.' },
    optimal: { label: 'Optimal', approach: 'High-fanout B+ Tree (16KB pages, linked leaves, copy-up splits).', time: 'O(log_B N) I/O', space: 'O(N / B)', bottleneckOrWin: 'High fanout reduces index depth; exact page hops depend on page layout and cache, and sibling leaves support sequential range scans.' },
    codeLevelDfd: 'Search Key k → Latch Root Page → Binary Search Separator Keys → Follow Child Pointer to Leaf → Split Full Leaf (Promote Right-Min Key) or Scan Next Leaf Pointer.',
    realWorldUseCases: ['PostgreSQL, MySQL InnoDB, and SQLite primary & secondary database indexes', 'NTFS, ext4, XFS, and APFS filesystem directory/extent metadata trees'],
    challengesFaced: ['Random UUIDv4 keys trigger constant 50% page splits and buffer-pool cache misses (prefer monotonic UUIDv7).', 'Concurrent page splits require latch-crabbing / Blink-Tree high-keys to avoid deadlocks.', 'Forgetting that leaf splits COPY the separator key up while internal splits PUSH it up breaks leaf range scans.'],
  },
  'lsm-tree-compaction': {
    algorithmId: 'lsm-tree-compaction',
    brute: { label: 'Brute Force', approach: 'Append-only log file scanned backward on every read.', time: 'O(1) write · O(N) read', space: 'O(N)', bottleneckOrWin: 'Instant writes, but reads collapse linearly as the log grows.' },
    better: { label: 'Better', approach: 'In-place B+ Tree page updates on disk.', time: 'O(log_B N) random I/O', space: 'O(N)', bottleneckOrWin: 'Random 16KB dirty-page flushes saturate SSD/HDD write IOPS under heavy ingest.' },
    optimal: { label: 'Optimal', approach: 'Sequential WAL + SkipList MemTable + Immutable SSTables + Bloom Filters + Compaction.', time: 'O(log M) expected MemTable write · O(k) Bloom check', space: 'O(N)', bottleneckOrWin: 'Converts many random writes into sequential appends; Bloom filters reduce disk lookups according to their false-positive rate and the workload.' },
    codeLevelDfd: 'Write(k,v) → Append WAL → Insert MemTable (SkipList) → Flush Immutable Sorted SSTable + Bloom Filter → Background K-Way Compaction (Drop Overwritten Keys & Tombstones).',
    realWorldUseCases: ['RocksDB (Meta/CockroachDB/TiKV), Apache Cassandra, ScyllaDB, and LevelDB storage engines', 'High-volume time-series telemetry and observability ingestion pipelines (InfluxDB/ClickHouse MergeTree)'],
    challengesFaced: ['Compaction storms consume disk bandwidth and spike P99 tail latency if throttling is misconfigured.', 'Heavy delete workloads accumulate tombstones that slow range scans until bottommost compaction runs.', 'Choosing Size-Tiered (lower write amp) vs Leveled (lower space & read amp) directly determines cluster cost.'],
  },
  'aries-wal-recovery': {
    algorithmId: 'aries-wal-recovery',
    brute: { label: 'Brute Force', approach: 'FORCE every dirty page synchronously to disk on every COMMIT.', time: 'O(DirtyPages) random I/O', space: 'O(1)', bottleneckOrWin: 'Commits stall on synchronous random page flushes; throughput impact depends on device latency, dirty-page volume, and commit rate.' },
    better: { label: 'Better', approach: 'Shadow Paging (copy-on-write full page-table swaps per transaction).', time: 'O(PageTable)', space: 'O(2N)', bottleneckOrWin: 'Fragments sequential data layout and serializes concurrent multi-transaction commits.' },
    optimal: { label: 'Optimal', approach: 'STEAL/NO-FORCE Write-Ahead Log + 3-Pass ARIES (Analysis → Redo → Undo with CLRs).', time: 'O(1) seq WAL commit', space: 'O(DPT + ATT)', bottleneckOrWin: 'Fast sequential commits + idempotent crash recovery even if the DB crashes mid-recovery.' },
    codeLevelDfd: 'Crash Restart → Load Last Checkpoint → Analysis Pass (Build ActiveTx & DirtyPageTable) → Redo Pass (Replay from minRecLSN if pageLSN < LSN) → Undo Pass (Roll Back Losers + Log CLRs).',
    realWorldUseCases: ['PostgreSQL WAL, MySQL InnoDB Redo/Undo logs, IBM DB2, and Microsoft SQL Server', 'Durable transactional KV stores and distributed Raft log state machines'],
    challengesFaced: ['Flushing a dirty data page BEFORE its WAL record hits disk violates WAL and loses atomicity permanently.', 'Omitting Compensation Log Records (CLRs) causes infinite rollback loops if a second crash happens during recovery.', 'Rare checkpoints allow the WAL tail to grow, increasing restart recovery work in proportion to log volume and checkpoint policy.'],
  },
  'consistent-hashing-dht': {
    algorithmId: 'consistent-hashing-dht',
    brute: { label: 'Brute Force', approach: 'Simple modulo sharding `hash(key) % N`.', time: 'O(1)', space: 'O(1)', bottleneckOrWin: 'Modulo sharding can remap most keys when the shard count changes (approximately N/(N+1) on adding one shard under uniform hashing), causing cache churn.' },
    better: { label: 'Better', approach: 'Basic Consistent Hashing Ring (1 token per physical node).', time: 'O(log N)', space: 'O(N)', bottleneckOrWin: 'Remaps only K/N keys, but random placement creates severe 3–5× hot-shard skew.' },
    optimal: { label: 'Optimal', approach: 'Consistent Hashing with 150+ Virtual Nodes (or Rendezvous HRW / Chord DHT).', time: 'O(log(N·V))', space: 'O(N·V)', bottleneckOrWin: 'Remaps strictly K/N keys with < 5% shard variance and spreads failover load across all surviving nodes.' },
    codeLevelDfd: 'Key k → Compute 64-bit Hash h(k) → Binary Search First Clockwise Virtual Node ≥ h(k) (Wrap to 0) → Map Vnode to Physical Primary + Next R-1 Distinct Physical Replicas.',
    realWorldUseCases: ['Amazon DynamoDB, Apache Cassandra, Discord Guild routing, and Memcached/Envoy edge caches', 'P2P Distributed Hash Tables (Chord/Kademlia/BitTorrent) and CDN origin shielding'],
    challengesFaced: ['Forgetting to skip duplicate physical nodes when picking R replicas places two replicas on the same failing machine!', 'Hot single keys (e.g., viral celebrity post) still overload one shard—require key salting or local cache.', 'Changing vnode counts mid-flight without coordinated ring migration temporarily splits key ownership.'],
  },
  'raft-paxos-consensus': {
    algorithmId: 'raft-paxos-consensus',
    brute: { label: 'Brute Force', approach: 'Single primary server with async fire-and-forget replication.', time: 'O(1)', space: 'O(Log)', bottleneckOrWin: 'Primary crash loses acknowledged writes or creates split-brain dual primaries.' },
    better: { label: 'Better', approach: 'Basic Single-Decree Paxos with Prepare and Accept phases.', time: 'Often 2 RTTs in the basic path', space: 'O(Log)', bottleneckOrWin: 'Correct consensus; latency depends on proposer stability, batching, and network timing.' },
    optimal: { label: 'Optimal', approach: 'Raft / Multi-Paxos with a stable leader and majority replication.', time: 'Often one quorum RTT in steady state', space: 'O(Snapshot + Log)', bottleneckOrWin: 'Provides linearizable fault tolerance under protocol assumptions; election, batching, and network conditions affect latency.' },
    codeLevelDfd: 'Client Write → Leader Appends (term, idx, cmd) → Parallel AppendEntries RPCs → Majority Quorum Ack → Advance commitIndex (Current Term Rule) → Apply State Machine & Reply.',
    realWorldUseCases: ['Kubernetes etcd control plane, Consul, CockroachDB/TiKV Range Raft groups, and Kafka KRaft', 'Distributed lock managers, leader election, and strongly consistent metadata registries'],
    challengesFaced: ['Committing a previous-term entry purely by replica count violates Raft Figure 8 safety!', 'Partitioned old leaders serving local reads return stale data unless guarded by ReadIndex quorum or leases.', 'Non-randomized election timeouts cause infinite split-vote livelocks on even-sized or synchronized clusters.'],
  },
  'cache-lru-lfu-arc': {
    algorithmId: 'cache-lru-lfu-arc',
    brute: { label: 'Brute Force', approach: 'Array scan to locate oldest/least-used timestamp on every eviction.', time: 'O(C)', space: 'O(C)', bottleneckOrWin: 'Scanning 1,000,000 cache entries per miss destroys tail latency.' },
    better: { label: 'Better', approach: 'HashMap + Binary Min-Heap ordered by timestamp or frequency.', time: 'O(log C)', space: 'O(C)', bottleneckOrWin: 'Heap percolation and lazy stale-key cleanup add log C overhead on every hit.' },
    optimal: { label: 'Optimal', approach: 'HashMap + Sentinel DLL (LRU) / Freq-Buckets + minFreq (LFU) / Dual Ghost Lists (ARC).', time: 'O(1) get & put', space: 'O(C)', bottleneckOrWin: 'Strict O(1) pointer splices; ARC dynamically adapts recency vs frequency to resist full-table scans.' },
    codeLevelDfd: 'Request(key) → O(1) Map Lookup → Hit: Splice Node to MRU Head (or Promote freq+1 Bucket / ARC T2) → Miss: Evict Tail/minFreq Node (Record Ghost Key in ARC B1/B2) → Insert New Node.',
    realWorldUseCases: ['Redis, Memcached, ZFS Adaptive Replacement Cache (ARC), and Caffeine (W-TinyLFU) JVM caches', 'PostgreSQL/MySQL InnoDB buffer pools, OS page caches, and CPU hardware set-associative caches'],
    challengesFaced: ['Forgetting sentinel head/tail dummy nodes creates null-pointer bugs on 1-item caches.', 'Updating an existing key in LRU/LFU without checking capacity first can mistakenly evict a live entry.', 'Naive LRU suffers total cache thrashing on sequential scans larger than cache capacity (solved by ARC/LRU-K).'],
  },
  'bloom-filter': {
    algorithmId: 'bloom-filter',
    brute: { label: 'Brute Force', approach: 'Store every full 64-byte URL/key string in an in-memory HashSet.', time: 'O(1)', space: 'O(64B × N)', bottleneckOrWin: '1 billion keys demand > 64 GB RAM—crashing single-node services.' },
    better: { label: 'Better', approach: 'Store sorted 64-bit hashes on disk and binary search.', time: 'O(log N) disk I/O', space: 'O(8B × N) disk', bottleneckOrWin: 'Saves RAM, but triggers multiple slow disk seeks for every negative lookup.' },
    optimal: { label: 'Optimal', approach: 'Bloom Filter with k hash positions and a chosen false-positive target (about 10 bits/key near 1% FP).', time: 'O(k) per check', space: 'About 1.25 GB / 1B keys at 10 bits/key', bottleneckOrWin: 'Compresses membership memory relative to exact sets; no false negatives assumes insert-only use, intact bits, and consistent hashing; disk-read savings depend on negative-query rate and FP rate.' },
    codeLevelDfd: 'Key x → Compute h1(x), h2(x) → Project k Positions (h1 + i·h2) % m → Insert: Set All k Bits = 1 | Query: If Any Bit == 0 Return DEFINITELY ABSENT Else PROBABLY PRESENT.',
    realWorldUseCases: ['RocksDB / Cassandra / LevelDB per-SSTable negative-lookup short-circuiting', 'Google Chrome Safe Browsing URL checks, Medium/Quora seen-article filters, and CDN one-hit-wonder guards'],
    challengesFaced: ['Attempting to delete by clearing bits corrupts other keys and causes illegal false negatives (use Counting Bloom or Cuckoo Filter).', 'Overfilling past design capacity N causes false-positive rate to spike rapidly toward 100%.', 'Using correlated weak hashes ruins bit uniformity—always use Murmur3 / xxHash / SipHash.'],
  },
  'crdt-gcounter-orset': {
    algorithmId: 'crdt-gcounter-orset',
    brute: { label: 'Brute Force', approach: 'Global synchronous distributed lock or 2PC across geo-regions.', time: 'O(Cross-Region RTT)', space: 'O(1)', bottleneckOrWin: 'Blocks completely whenever a client goes offline or a transatlantic link partitions.' },
    better: { label: 'Better', approach: 'Last-Write-Wins (LWW) using unsynchronized physical wall-clock timestamps.', time: 'O(1)', space: 'O(1)', bottleneckOrWin: 'Clock skew silently drops concurrent writes permanently (lost-update anomalies).' },
    optimal: { label: 'Optimal', approach: 'Join-Semilattice CRDTs (G/PN-Counter, OR-Set with unique add tags, Delta-CRDT sync).', time: 'Local update work depends on representation; merge work depends on delta/state size', space: 'O(R) / O(Tags)', bottleneckOrWin: 'Allows local writes without synchronous consensus and converges under the CRDT merge rule when updates are eventually delivered; storage/network latency remains.' },
    codeLevelDfd: 'Local Offline Op → Mutate Replica Slot / Tag Add(val, uuid) → Async Gossip Delta to Peers → Commutative/Associative/Idempotent Merge (max / tag-union) → Converged Global State.',
    realWorldUseCases: ['Figma, Yjs, Automerge, and Apple Notes offline-first real-time collaboration', 'Redis Enterprise Active-Active Geo-Distribution, Riak DT, and SoundCloud/Discord multi-region counters'],
    challengesFaced: ['Never use CRDTs for hard financial/inventory invariants (e.g., preventing double-spend below $0).', 'Unbounded OR-Set tombstones bloat state forever unless garbage-collected once all replicas observe causality.', 'Implementing non-idempotent merges (like `a + b` instead of per-replica `max(a[i], b[i])`) double-counts retried messages!'],
  },
  'hash-table-probing': {
    algorithmId: 'hash-table-probing',
    brute: { label: 'Brute Force', approach: 'Linear scan over an unsorted array of `(key, value)` pairs.', time: 'O(N)', space: 'O(N)', bottleneckOrWin: 'Every lookup inspects N/2 keys on average—collapses at N = 10^5.' },
    better: { label: 'Better', approach: 'Balanced Binary Search Tree (AVL/Red-Black) keyed by key.', time: 'O(log N)', space: 'O(N)', bottleneckOrWin: 'Pointer-chasing tree nodes pays O(log N) comparisons and cache misses when ordering is unneeded.' },
    optimal: { label: 'Optimal', approach: 'Dynamic Hash Table (Separate Chaining or Open Addressing) with implementation-appropriate load-factor resizing.', time: 'O(1) expected under suitable hashing', space: 'O(N)', bottleneckOrWin: 'Hashing and cache-friendly probing can provide fast expected lookups; latency and resize cost depend on key, hash, and hardware.' },
    codeLevelDfd: 'Key k → Hash h(k) % M → Chaining: Walk Bucket List (or RB-Tree if len ≥ 8) | Open Addressing: Probe (h1 + i·h2) % M Skipping Tombstones → Resize & Rehash 2× When α > 0.7.',
    realWorldUseCases: ['Python `dict` (compact open addressing), Rust `HashMap` (SwissTable SIMD probing), and Java `HashMap`', 'Database in-memory hash joins, symbol tables in compilers, and DNS/URL caches'],
    challengesFaced: ['Deleting by writing EMPTY instead of TOMBSTONE in open addressing breaks downstream probe chains.', 'Linear probing suffers primary clustering above α = 0.75 (mitigate via Robin Hood hashing or Double Hashing).', 'Deterministic non-salted hashes are vulnerable to Hash-DoS O(N²) attacks on public HTTP APIs.'],
  },
  'trie-prefix-autocomplete': {
    algorithmId: 'trie-prefix-autocomplete',
    brute: { label: 'Brute Force', approach: 'Scan every word in dictionary checking `word.startsWith(prefix)`.', time: 'O(N · L)', space: 'O(1)', bottleneckOrWin: 'Checking 1,000,000 queries on every keystroke blows past 100ms latency budgets.' },
    better: { label: 'Better', approach: 'Sort dictionary and Binary Search lower/upper bounds for prefix.', time: 'O(L log N + K)', space: 'O(N · L)', bottleneckOrWin: 'Static array cannot support O(L) dynamic insertions or 2D DFS board prefix pruning.' },
    optimal: { label: 'Optimal', approach: 'Prefix Trie (with cached Top-K suggestions or Radix path compression).', time: 'O(L)', space: 'O(Shared Chars)', bottleneckOrWin: 'Lookup time depends strictly on query length L—completely independent of million-word dictionary size N.' },
    codeLevelDfd: 'Prefix P → Walk Root Along P[0..L-1] in O(L) → Missing Edge Returns Empty Immediately → Matched Node Emits Cached Top-K or Pruned Subtree Words.',
    realWorldUseCases: ['Google Search / IDE code autocomplete and mobile keyboard predictive typing', 'IPv4/IPv6 CIDR Longest-Prefix-Match router tables and LC 212 Word Search II DFS pruning'],
    challengesFaced: ['Allocating fixed 26- or 128-slot arrays at every node explodes RAM on sparse Unicode tries (use HashMaps or Radix Trees).', 'Forgetting an `isWord` terminal flag confuses prefix matches ("app") with actual stored words ("apple").', 'Unbounded autocomplete DFS on 1-letter prefixes ("a") can traverse millions of nodes without Top-K node caching.'],
  },
};
