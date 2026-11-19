import { useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  Network,
} from 'lucide-react';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';

export type ArchitectureDiagramId =
  | 'segment-tree'
  | 'hld-tree'
  | 'minhash-lsh'
  | 'aho-corasick'
  | 'block-max-wand'
  | 'fenwick-bit';

interface ArchNodeDetail {
  id: string;
  label: string;
  invariant: string;
  complexity: string;
}

interface ArchitectureSpec {
  id: ArchitectureDiagramId;
  title: string;
  shortName: string;
  category: string;
  complexitySummary: string;
  coreIdea: string;
  destination: 'algorithms' | 'fuzzy-search';
  targetAlgoId: string;
  targetNGramMode?: 'taxonomy' | 'pruning-sim' | 'case-study';
  nodes: ArchNodeDetail[];
  useCases: { system: string; role: string; scale: string }[];
  implementationNotes: string[];
  codePreview: string;
}

export const ARCHITECTURE_SPECS: ArchitectureSpec[] = [
  {
    id: 'segment-tree',
    title: 'Segment Tree with Lazy Propagation',
    shortName: 'Segment Tree',
    category: 'Range Queries & Trees',
    complexitySummary: 'Build O(N) · Range Query O(log N) · Range Update O(log N) · Space 4N',
    coreIdea:
      'Recursively bisects [0..N-1] into binary intervals. Pending range updates pause at fully covered ancestors as lazy tags and push down only when a child is visited.',
    destination: 'algorithms',
    targetAlgoId: 'segment-tree-lazy',
    nodes: [
      { id: 'root', label: 'Root Node [0..7]', invariant: 'Stores aggregate sum/min over entire array; lazy tag defers full-array shifts.', complexity: 'Depth 0 · O(1) read' },
      { id: 'left', label: 'Left Child [0..3]', invariant: 'Covers left half; receives pushed lazy delta only when queried or partially updated.', complexity: 'Index 2*i' },
      { id: 'right', label: 'Right Child [4..7]', invariant: 'Covers right half; completely covered sub-ranges return immediately without recursing.', complexity: 'Index 2*i + 1' },
      { id: 'lazy', label: 'Lazy Propagation Tag', invariant: 'Holds pending +delta for all leaves in subtree; pushed on demand via pushDown().', complexity: 'Avoids O(N) leaf updates' },
      { id: 'leaves', label: 'Leaf Layer [i..i]', invariant: 'Base array elements; at most 4 nodes visited per depth level on any [L..R] query.', complexity: 'Max 4·log2(N) visits' },
    ],
    useCases: [
      { system: 'Financial Order Books & Time-Series DBs', role: 'Real-time rolling min/max/volume aggregation across arbitrary price/time intervals.', scale: '10⁶ updates/sec' },
      { system: '2D Computational Geometry (Sweep Line)', role: 'Maintains active rectangle union area as vertical edges sweep left-to-right.', scale: 'O(N log N)' },
      { system: 'Game Engines & Scheduling Systems', role: 'Range booking / seat availability queries with instant block reservations.', scale: '< 1 ms P99' },
    ],
    implementationNotes: [
      'Allocate flat 1-indexed array of size 4 * N to avoid pointer overhead and maximize CPU L1 cache hits.',
      'Always call pushDown(node, lo, hi) before descending into either child on both updates and queries.',
      'Combine associative monoids (sum, min, max, gcd, matrix multiplication) with identical tree topology.',
    ],
    codePreview: `function updateRange(node, lo, hi, ql, qr, delta) {
  if (qr < lo || hi < ql) return;
  if (ql <= lo && hi <= qr) {
    tree[node] += delta * (hi - lo + 1);
    lazy[node] += delta; // defer child updates!
    return;
  }
  pushDown(node, lo, hi);
  const mid = (lo + hi) >> 1;
  updateRange(node * 2, lo, mid, ql, qr, delta);
  updateRange(node * 2 + 1, mid + 1, hi, ql, qr, delta);
  tree[node] = tree[node * 2] + tree[node * 2 + 1];
}`,
  },
  {
    id: 'hld-tree',
    title: 'Heavy-Light Decomposition (HLD)',
    shortName: 'Heavy-Light (HLD)',
    category: 'Range Queries & Trees',
    complexitySummary: 'Preprocess O(N) · Path Query O(log² N) · Point Update O(log N)',
    coreIdea:
      'Marks the edge to each node’s largest subtree as HEAVY, partitioning any tree into disjoint contiguous heavy chains mapped directly onto a single flat Segment Tree.',
    destination: 'algorithms',
    targetAlgoId: 'heavy-light-decomposition',
    nodes: [
      { id: 'heavy-chain', label: 'Heavy Chain [0→1→3→6]', invariant: 'Contiguous indices in base array; an entire chain segment answers in one O(log N) SegTree call.', complexity: 'O(log N) per chain' },
      { id: 'light-edge', label: 'Light Edge Jump', invariant: 'Every light edge doubles subtree size upward → at most log2(N) light edges on any root path!', complexity: 'Max log2(N) jumps' },
      { id: 'flat-array', label: 'Linearized Base Array', invariant: 'DFS visits heavy child first so every chain occupies a contiguous index slice pos[head]..pos[u].', complexity: 'O(N) flat memory' },
      { id: 'seg-layer', label: 'Backed Segment Tree', invariant: 'Executes range max/sum across each lifted chain slice until u and v share the same chain.', complexity: 'O(log² N) path query' },
    ],
    useCases: [
      { system: 'Distributed Network Topology Telemetry', role: 'Query max bottleneck latency or sum bandwidth along dynamic routing tree paths.', scale: '10⁵ routers' },
      { system: 'Hierarchical Org / Permission Engines', role: 'Aggregate or update inherited quotas along manager-to-employee chains.', scale: 'O(log² N) path ops' },
      { system: 'Competitive & Compiler Dominator Trees', role: 'Dynamic path queries and LCA computations on mutating weighted trees.', scale: '10⁵ queries < 100 ms' },
    ],
    implementationNotes: [
      'Pass 1 (DFS): compute subtree size sz[u], parent[u], depth[u], and heaviest child heavy[u].',
      'Pass 2 (DFS): assign contiguous DFS position pos[u] visiting heavy[u] BEFORE all light children, recording chain top head[u].',
      'Query(u, v): while head[u] !== head[v], lift the deeper chain head with segQuery(pos[head[u]], pos[u]) and jump u = parent[head[u]].',
    ],
    codePreview: `function queryPath(u, v) {
  let ans = -Infinity;
  while (head[u] !== head[v]) {
    if (depth[head[u]] < depth[head[v]]) [u, v] = [v, u];
    ans = Math.max(ans, segQuery(pos[head[u]], pos[u]));
    u = parent[head[u]]; // 1 light-edge jump (max log N times)
  }
  if (depth[u] > depth[v]) [u, v] = [v, u];
  return Math.max(ans, segQuery(pos[u], pos[v]));
}`,
  },
  {
    id: 'minhash-lsh',
    title: 'MinHash + LSH Banding Engine',
    shortName: 'MinHash + LSH',
    category: 'N-Gram Fuzzy Search',
    complexitySummary: 'Signature O(k·|G|) · Candidate Lookup O(b) · Eliminates O(N²) all-pairs',
    coreIdea:
      'Compresses massive n-gram shingle sets into k minimum hash values (Pr[collision] = Jaccard), then slices signatures into b bands of r rows to route near-duplicates to identical hash buckets.',
    destination: 'fuzzy-search',
    targetAlgoId: 'minhash',
    targetNGramMode: 'taxonomy',
    nodes: [
      { id: 'shingles', label: 'Shingle / N-Gram Sets', invariant: 'Documents transformed into hashed w-shingles or character trigrams.', complexity: 'O(|D|) linear pass' },
      { id: 'hashes', label: 'k Hash Permutations', invariant: 'Each hash function h_i selects min(h_i(g)) so collision probability equals exact Jaccard.', complexity: 'k = 64..128 ints' },
      { id: 'bands', label: 'LSH Band Slicer (b × r)', invariant: 'AND within each r-row band, OR across b bands creates steep S-curve at t ≈ (1/b)^(1/r).', complexity: 'P = 1 - (1 - s^r)^b' },
      { id: 'buckets', label: 'Collision Bucket Router', invariant: 'Only pairs colliding in >= 1 band enter exact verification, avoiding O(N²) comparisons.', complexity: 'O(N · b) sublinear' },
    ],
    useCases: [
      { system: 'LLM Pretraining Data Deduplication (FineWeb / Dolma)', role: 'Removes billions of near-duplicate scraped web pages before training.', scale: '10⁹+ documents' },
      { system: 'Search Engine Crawl Deduplication', role: 'Clusters syndicated news articles and scraped mirror pages in streaming pipelines.', scale: 'Terabytes/day' },
      { system: 'Plagiarism & Enterprise Document Compliance', role: 'Detects lightly edited contracts or code clones across huge repositories.', scale: '< 10 ms lookup' },
    ],
    implementationNotes: [
      'Tune bands b and rows r so inflection threshold (1/b)^(1/r) matches your target Jaccard cutoff (e.g. b=20, r=5 → t ≈ 0.55).',
      'Always verify candidate collisions with exact Jaccard or SimHash to eliminate false positives.',
      'Use 64-bit universal hashing h_i(x) = (a_i * x + b_i) mod P to compute k signatures in one fast vectorized loop.',
    ],
    codePreview: `function indexLsh(docId, sig, bands = 20, rows = 5) {
  for (let b = 0; b < bands; b++) {
    const key = b + ':' + sig.slice(b * rows, (b + 1) * rows).join(',');
    const bucket = tables[b].get(key) ?? [];
    bucket.push(docId);
    tables[b].set(key, bucket);
  }
}`,
  },
  {
    id: 'aho-corasick',
    title: 'Aho-Corasick Multi-Pattern Automaton',
    shortName: 'Aho-Corasick',
    category: 'Advanced String Algorithms',
    complexitySummary: 'Build O(Σ|P| · Σ) · Stream Match O(N + Z) · Single Linear Pass',
    coreIdea:
      'Compiles thousands of keywords into a single Trie augmented with BFS-computed Failure Links (longest proper suffix present in Trie) and Output Links so input streams never backtrack.',
    destination: 'algorithms',
    targetAlgoId: 'aho-corasick',
    nodes: [
      { id: 'trie', label: 'Prefix Trie Backbone', invariant: 'Shares common pattern prefixes ("he", "hers", "his") in compact state transitions.', complexity: 'O(Σ|P|) states' },
      { id: 'fail', label: 'BFS Failure Links', invariant: 'On mismatch, jumps to longest proper suffix state in the Trie—generalizing KMP to a tree.', complexity: '0 text backtracking' },
      { id: 'output', label: 'Dictionary Output Links', invariant: 'Shortcut pointers emit nested suffix matches (e.g. matching "she" also emits "he").', complexity: 'O(Z) exact hits' },
      { id: 'stream', label: 'Single-Pass Stream Scanner', invariant: 'Advances exactly 1 automaton state per incoming character regardless of dictionary size.', complexity: 'O(N + Z) total' },
    ],
    useCases: [
      { system: 'Network Intrusion Detection (Snort / Suricata / WAF)', role: 'Scans live TCP packets against 50,000+ malware signatures at line rate.', scale: '10+ Gbps streams' },
      { system: 'Content Moderation & DLP Scanners', role: 'Detects banned phrases, PII tokens, and secret keys in real-time chat/logs.', scale: 'O(N) regardless of dict' },
      { system: 'Bioinformatics Multi-Motif DNA Search', role: 'Locates thousands of restriction sites across gigabase genomes in one pass.', scale: '3×10⁹ base pairs' },
    ],
    implementationNotes: [
      'Build standard Trie first, then run a single BFS from root to compute fail[v] = goto(fail[parent], ch).',
      'Precompute full DFA transition table next[state][ch] if alphabet is small (ASCII/DNA) for branchless O(1) transitions.',
      'Propagate output[v] = output[v] ∪ output[fail[v]] during BFS so nested suffix hits are never missed.',
    ],
    codePreview: `function scanStream(text, root) {
  let state = root;
  const hits = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    while (state !== root && !state.next.has(ch)) state = state.fail;
    state = state.next.get(ch) ?? root;
    for (const pat of state.outputs) hits.push([i, pat]);
  }
  return hits;
}`,
  },
  {
    id: 'block-max-wand',
    title: 'Block-Max WAND Dynamic Top-K Pruner',
    shortName: 'Block-Max WAND',
    category: 'N-Gram Fuzzy Search',
    complexitySummary: 'Skips 80–95% of Postings · Block Skip O(log B) · Exact Top-K Guarantee',
    coreIdea:
      'Partitions inverted posting lists into fixed 128-doc blocks annotated with maximum BM25 impact scores, leaping cursors directly past blocks whose summed upper bound cannot beat the kth best score θ.',
    destination: 'fuzzy-search',
    targetAlgoId: 'wand-blockmax',
    targetNGramMode: 'taxonomy',
    nodes: [
      { id: 'postings', label: 'Aligned Posting Cursors', invariant: 'Query n-gram posting iterators sorted ascending by current docID.', complexity: 'Sorted skip-lists' },
      { id: 'blockmax', label: 'Block-Max Impact Metadata', invariant: 'Stores max BM25 score inside each 128-doc block before decompressing postings.', complexity: 'Zero block decode' },
      { id: 'pivot', label: 'Pivot Threshold Gate (Σ > θ)', invariant: 'Finds first term whose cumulative upper bound exceeds current kth heap score θ.', complexity: '5×–20× speedup' },
      { id: 'heap', label: 'Top-K Min-Heap (θ)', invariant: 'Each new high-scoring doc raises θ, dynamically accelerating pruning for remaining blocks.', complexity: 'O(C log k)' },
    ],
    useCases: [
      { system: 'Apache Lucene 8+ / Elasticsearch / OpenSearch', role: 'Core dynamic pruning engine powering sub-20ms full-text and fuzzy top-k search.', scale: 'Billions of docs' },
      { system: 'E-Commerce Product Search & Autocomplete', role: 'Ranks multi-trigram queries across 10M+ SKUs without decompressing tail postings.', scale: '< 15 ms P99' },
      { system: 'Hybrid Sparse+Dense RAG Pipelines', role: 'Accelerates BM25 lexical retrieval before reciprocal rank fusion.', scale: 'High QPS clusters' },
    ],
    implementationNotes: [
      'Always keep posting lists sorted by docID with skip pointers at every 128-document block boundary.',
      'Check shallow block-max upper bound BEFORE advancing and decompressing the full posting block.',
      'Pair with Length/Count filters when an explicit similarity threshold is also provided.',
    ],
    codePreview: `while (true) {
  cursors.sort((a, b) => a.docId - b.docId);
  let upper = 0, pivotIdx = -1;
  for (let i = 0; i < cursors.length; i++) {
    upper += cursors[i].maxTermScore;
    if (upper > theta) { pivotIdx = i; break; }
  }
  if (pivotIdx === -1) break; // no doc can beat top-k!
  advanceOrScorePivot(cursors, pivotIdx, topKHeap);
}`,
  },
  {
    id: 'fenwick-bit',
    title: 'Fenwick Tree (Binary Indexed Tree)',
    shortName: 'Fenwick Tree (BIT)',
    category: 'Range Queries & Trees',
    complexitySummary: 'Point Update O(log N) · Prefix Query O(log N) · Space Exactly N',
    coreIdea:
      'Uses the lowest set bit (i & -i) to assign each index i ownership over a power-of-two suffix range, supporting dynamic prefix sums in 10 lines of code and 1× N memory.',
    destination: 'algorithms',
    targetAlgoId: 'fenwick-tree-bit',
    nodes: [
      { id: 'lowbit', label: 'Lowest Set Bit (i & -i)', invariant: 'Bit trick isolates rightmost 1-bit, defining exact block length owned by index i.', complexity: '1 CPU instruction' },
      { id: 'update-arc', label: 'Upward Update Chain (i += i & -i)', invariant: 'Propagates point delta upward to at most log2(N) covering parent buckets.', complexity: 'O(log N) hops' },
      { id: 'query-arc', label: 'Prefix Query Jump (i -= i & -i)', invariant: 'Sums disjoint power-of-two blocks from i down to 0 to compute exact prefix [1..i].', complexity: 'O(log N) hops' },
      { id: 'compact-mem', label: '1× Flat Array Layout', invariant: 'No tree pointers, 4× smaller memory footprint than Segment Tree, ultra cache-friendly.', complexity: 'Space O(N)' },
    ],
    useCases: [
      { system: 'Streaming Order-Statistic & Rank Trees', role: 'Maintains live percentiles, inversion counts, and kth-element binary lifting in O(log N).', scale: '10⁶ ops/sec' },
      { system: 'Real-Time Leaderboard & Prefix Analytics', role: 'Tracks cumulative scores across dynamic user buckets with minimal RAM.', scale: '1× N memory' },
      { system: 'Arithmetic Coding & Compression Engines', role: 'Maintains dynamic cumulative symbol frequency tables during entropy encoding.', scale: 'Cache-resident' },
    ],
    implementationNotes: [
      'Always 1-index Fenwick arrays (indices 1..N) because 0 & -0 === 0 would cause an infinite loop.',
      'Range sum [L..R] is simply query(R) - query(L - 1) for invertible operations (+, XOR).',
      'For non-invertible operations like Range Min/Max with arbitrary updates, switch to a Segment Tree.',
    ],
    codePreview: `function add(i, delta) {
  for (; i <= n; i += i & -i) bit[i] += delta;
}
function prefixSum(i) {
  let sum = 0;
  for (; i > 0; i -= i & -i) sum += bit[i];
  return sum;
}`,
  },
];

interface ArchitectureVisualizerProps {
  selectedId: ArchitectureDiagramId;
  onSelectId: (id: ArchitectureDiagramId) => void;
}

export function ArchitectureVisualizer({
  selectedId,
  onSelectId,
}: ArchitectureVisualizerProps) {
  const openAlgorithm = usePatternForgeStore((s) => s.openAlgorithm);
  const openNGramAlgorithm = usePatternForgeStore((s) => s.openNGramAlgorithm);

  const spec =
    ARCHITECTURE_SPECS.find((s) => s.id === selectedId) ?? ARCHITECTURE_SPECS[0];
  const [selectedNodeId, setSelectedNodeId] = useState<string>(spec.nodes[0].id);
  const [showUseCaseView, setShowUseCaseView] = useState(false);

  const activeNode =
    spec.nodes.find((n) => n.id === selectedNodeId) ?? spec.nodes[0];

  const handleSelectSpec = (id: ArchitectureDiagramId) => {
    onSelectId(id);
    const next = ARCHITECTURE_SPECS.find((s) => s.id === id) ?? ARCHITECTURE_SPECS[0];
    setSelectedNodeId(next.nodes[0].id);
    setShowUseCaseView(false);
  };

  const handleOpenImplementationLab = () => {
    if (spec.destination === 'algorithms') {
      openAlgorithm(spec.targetAlgoId, 'practice');
    } else {
      openNGramAlgorithm(spec.targetAlgoId, spec.targetNGramMode ?? 'taxonomy');
    }
  };

  const handleOpenAnimatedStepLab = () => {
    if (spec.destination === 'algorithms') {
      openAlgorithm(spec.targetAlgoId, 'mental');
    } else {
      openNGramAlgorithm(spec.targetAlgoId, spec.targetNGramMode ?? 'taxonomy');
    }
  };

  const isSelected = (id: string) => activeNode.id === id;

  const nodeBoxClass = (id: string, tone: 'sky' | 'emerald' | 'amber' | 'violet' = 'sky') => {
    const active = isSelected(id);
    if (active) {
      return 'fill-sky-100 dark:fill-sky-900/70 stroke-sky-600 dark:stroke-sky-400 cursor-pointer';
    }
    if (tone === 'emerald') {
      return 'fill-emerald-50 dark:fill-emerald-950/50 stroke-emerald-400 dark:stroke-emerald-700 hover:stroke-sky-500 cursor-pointer';
    }
    if (tone === 'amber') {
      return 'fill-amber-50 dark:fill-amber-950/40 stroke-amber-400 dark:stroke-amber-700 hover:stroke-sky-500 cursor-pointer';
    }
    if (tone === 'violet') {
      return 'fill-violet-50 dark:fill-violet-950/40 stroke-violet-400 dark:stroke-violet-700 hover:stroke-sky-500 cursor-pointer';
    }
    return 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 hover:stroke-sky-500 cursor-pointer';
  };

  return (
    <div className="space-y-5">
      {/* Architecture Selector Bar */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              INTERACTIVE SVG ARCHITECTURE VISUALIZER · {ARCHITECTURE_SPECS.length} COMPLEX ALGORITHMIC STRUCTURES
            </p>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Click Any Structural Node or Launch Its Use Case & Implementation View
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setShowUseCaseView((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              showUseCaseView
                ? 'border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
            }`}
          >
            {showUseCaseView ? (
              <>
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to SVG Architecture Diagram
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                Use Case & Implementation View
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ARCHITECTURE_SPECS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectSpec(item.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                item.id === spec.id
                  ? 'border-sky-600 bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              {item.shortName}
            </button>
          ))}
        </div>
      </section>

      {showUseCaseView ? (
        /* Detailed Use Case & Implementation View */
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                USE CASE & IMPLEMENTATION DEEP DIVE · {spec.category.toUpperCase()}
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                {spec.title}
              </h3>
              <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                {spec.complexitySummary}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenAnimatedStepLab}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                Step-by-Step Animation
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleOpenImplementationLab}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
              >
                <Code2 className="w-3.5 h-3.5" />
                Open Interactive Code & Unit Tests
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Real-World Production Use Cases */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Production Engineering Use Cases
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {spec.useCases.map((uc) => (
                <div
                  key={uc.system}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2"
                >
                  <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                    {uc.scale}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {uc.system}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {uc.role}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Implementation Blueprint & Reference Core */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Critical Implementation Invariants
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {spec.implementationNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400">
                Core Implementation Kernel
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
                {spec.codePreview}
              </pre>
            </div>
          </div>
        </section>
      ) : (
        /* Interactive Two-Zone SVG Architecture Diagram + Node Inspector */
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)] gap-5 items-stretch">
          {/* Left Zone: Interactive SVG Architecture Canvas */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  {spec.title}
                </h3>
                <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  {spec.complexitySummary}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {spec.coreIdea}
              </p>
            </div>

            {/* Interactive SVG Canvas */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 overflow-x-auto">
              {spec.id === 'segment-tree' && (
                <svg viewBox="0 0 680 280" className="w-full min-w-[540px] h-auto" role="img" aria-label="Segment Tree with Lazy Propagation interactive SVG">
                  {/* Edges */}
                  <g className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.8">
                    <line x1="340" y1="54" x2="180" y2="108" />
                    <line x1="340" y1="54" x2="500" y2="108" />
                    <line x1="180" y1="146" x2="100" y2="196" />
                    <line x1="180" y1="146" x2="260" y2="196" />
                    <line x1="500" y1="146" x2="420" y2="196" />
                    <line x1="500" y1="146" x2="580" y2="196" />
                  </g>
                  {/* Lazy Propagation Dashed Arrow */}
                  <path d="M 218 124 Q 256 152 260 190" fill="none" className="stroke-amber-500" strokeWidth="2" strokeDasharray="4 3" />

                  {/* Root */}
                  <g onClick={() => setSelectedNodeId('root')}>
                    <rect x="255" y="16" width="170" height="38" rx="8" strokeWidth="1.8" className={nodeBoxClass('root')} />
                    <text x="340" y="34" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">[0..7] sum=36</text>
                    <text x="340" y="48" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">idx 1 · root</text>
                  </g>

                  {/* Left Child + Lazy Badge */}
                  <g onClick={() => setSelectedNodeId('left')}>
                    <rect x="105" y="108" width="150" height="38" rx="8" strokeWidth="1.8" className={nodeBoxClass('left', 'emerald')} />
                    <text x="180" y="126" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">[0..3] sum=16</text>
                    <text x="180" y="140" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono">idx 2 · query split</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('lazy')}>
                    <rect x="215" y="92" width="76" height="22" rx="5" strokeWidth="1.5" className={nodeBoxClass('lazy', 'amber')} />
                    <text x="253" y="106" textAnchor="middle" className="fill-amber-800 dark:fill-amber-300 text-[9px] font-mono font-bold">lazy: +4</text>
                  </g>

                  {/* Right Child */}
                  <g onClick={() => setSelectedNodeId('right')}>
                    <rect x="425" y="108" width="150" height="38" rx="8" strokeWidth="1.8" className={nodeBoxClass('right')} />
                    <text x="500" y="126" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">[4..7] sum=20</text>
                    <text x="500" y="140" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">idx 3 · right half</text>
                  </g>

                  {/* Leaf Ranges */}
                  {[
                    { x: 40, label: '[0..1]=5', sub: 'partial' },
                    { x: 200, label: '[2..3]=11', sub: 'COVERED ✓' },
                    { x: 360, label: '[4..5]=9', sub: 'COVERED ✓' },
                    { x: 520, label: '[6..7]=11', sub: 'outside' },
                  ].map((leaf) => (
                    <g key={leaf.label} onClick={() => setSelectedNodeId('leaves')}>
                      <rect x={leaf.x} y="196" width="120" height="38" rx="8" strokeWidth="1.6" className={nodeBoxClass('leaves', leaf.sub.includes('✓') ? 'emerald' : 'sky')} />
                      <text x={leaf.x + 60} y="214" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">{leaf.label}</text>
                      <text x={leaf.x + 60} y="228" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">{leaf.sub}</text>
                    </g>
                  ))}

                  {/* Clickable SVG CTA Bar */}
                  <g onClick={() => setShowUseCaseView(true)} className="cursor-pointer">
                    <rect x="195" y="248" width="290" height="26" rx="6" className="fill-slate-900 dark:fill-sky-500" />
                    <text x="340" y="265" textAnchor="middle" className="fill-white dark:fill-slate-950 text-[10px] font-mono font-bold">
                      Click to Open Use Case & Implementation View →
                    </text>
                  </g>
                </svg>
              )}

              {spec.id === 'hld-tree' && (
                <svg viewBox="0 0 680 280" className="w-full min-w-[540px] h-auto" role="img" aria-label="Heavy-Light Decomposition interactive SVG">
                  {/* Heavy Chain Edges (Thick Sky) */}
                  <g className="stroke-sky-500" strokeWidth="4">
                    <line x1="150" y1="45" x2="105" y2="110" />
                    <line x1="105" y1="110" x2="80" y2="178" />
                    <line x1="80" y1="178" x2="80" y2="232" />
                    <line x1="225" y1="110" x2="225" y2="178" />
                  </g>
                  {/* Light Edges (Dashed Amber) */}
                  <g className="stroke-amber-500" strokeWidth="2.2" strokeDasharray="5 4" onClick={() => setSelectedNodeId('light-edge')}>
                    <line x1="150" y1="45" x2="225" y2="110" />
                    <line x1="105" y1="110" x2="155" y2="178" />
                  </g>

                  {/* Tree Nodes */}
                  {[
                    { id: 'heavy-chain', cx: 150, cy: 45, lbl: '0' },
                    { id: 'heavy-chain', cx: 105, cy: 110, lbl: '1' },
                    { id: 'heavy-chain', cx: 80, cy: 178, lbl: '3' },
                    { id: 'heavy-chain', cx: 80, cy: 232, lbl: '6' },
                    { id: 'light-edge', cx: 225, cy: 110, lbl: '2' },
                    { id: 'light-edge', cx: 225, cy: 178, lbl: '5' },
                    { id: 'light-edge', cx: 155, cy: 178, lbl: '4' },
                  ].map((n) => (
                    <g key={n.lbl} onClick={() => setSelectedNodeId(n.id)}>
                      <circle cx={n.cx} cy={n.cy} r="17" strokeWidth="2" className={nodeBoxClass(n.id, n.id === 'heavy-chain' ? 'sky' : 'amber')} />
                      <text x={n.cx} y={n.cy + 4} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">{n.lbl}</text>
                    </g>
                  ))}

                  {/* Arrow from Tree to Linearized Array */}
                  <line x1="268" y1="125" x2="320" y2="125" className="stroke-slate-400" strokeWidth="2" />
                  <polygon points="320,120 330,125 320,130" className="fill-slate-400" />

                  {/* Linearized Flat Array */}
                  <g onClick={() => setSelectedNodeId('flat-array')}>
                    <text x="500" y="34" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[11px] font-mono font-bold">Linearized Chain Array (pos[u])</text>
                    {['0', '1', '3', '6', '2', '5', '4'].map((val, idx) => (
                      <g key={val}>
                        <rect
                          x={340 + idx * 45}
                          y="48"
                          width="41"
                          height="38"
                          rx="6"
                          strokeWidth="1.6"
                          className={nodeBoxClass('flat-array', idx < 4 ? 'sky' : idx < 6 ? 'emerald' : 'amber')}
                        />
                        <text x={360 + idx * 45} y="71" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[12px] font-mono font-bold">{val}</text>
                      </g>
                    ))}
                    <text x="430" y="102" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[9px] font-mono">Chain A (contiguous!)</text>
                    <text x="565" y="102" textAnchor="middle" className="fill-emerald-600 dark:fill-emerald-400 text-[9px] font-mono">Chain B</text>
                  </g>

                  {/* Segment Tree Backing Box */}
                  <g onClick={() => setSelectedNodeId('seg-layer')}>
                    <rect x="345" y="132" width="305" height="74" rx="10" strokeWidth="1.8" className={nodeBoxClass('seg-layer', 'emerald')} />
                    <text x="497" y="158" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[12px] font-mono font-bold">Single Segment Tree over Flat Array</text>
                    <text x="497" y="178" textAnchor="middle" className="fill-slate-600 dark:fill-slate-400 text-[10px] font-mono">Each chain slice = O(log N) range query</text>
                    <text x="497" y="194" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold">≤ log2(N) chains × O(log N) = O(log² N)</text>
                  </g>

                  <g onClick={() => setShowUseCaseView(true)} className="cursor-pointer">
                    <rect x="355" y="232" width="285" height="28" rx="6" className="fill-slate-900 dark:fill-sky-500" />
                    <text x="497" y="250" textAnchor="middle" className="fill-white dark:fill-slate-950 text-[10px] font-mono font-bold">
                      Open HLD Use Case & Implementation →
                    </text>
                  </g>
                </svg>
              )}

              {spec.id === 'minhash-lsh' && (
                <svg viewBox="0 0 680 260" className="w-full min-w-[540px] h-auto" role="img" aria-label="MinHash and LSH Banding interactive SVG">
                  {/* Pipeline Arrows */}
                  <g className="stroke-slate-400" strokeWidth="2">
                    <line x1="158" y1="115" x2="188" y2="115" />
                    <line x1="328" y1="115" x2="358" y2="115" />
                    <line x1="498" y1="115" x2="528" y2="115" />
                  </g>

                  {/* Stage 1: Shingles */}
                  <g onClick={() => setSelectedNodeId('shingles')}>
                    <rect x="18" y="45" width="140" height="140" rx="10" strokeWidth="1.8" className={nodeBoxClass('shingles')} />
                    <text x="88" y="70" textAnchor="middle" className="fill-sky-700 dark:fill-sky-400 text-[10px] font-mono font-bold">1. Shingle Sets</text>
                    <text x="88" y="96" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono">A: alg, lgo, gor</text>
                    <text x="88" y="116" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono">B: alg, lgo, rit</text>
                    <text x="88" y="156" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">10⁴ variable grams</text>
                  </g>

                  {/* Stage 2: k Hash Permutations */}
                  <g onClick={() => setSelectedNodeId('hashes')}>
                    <rect x="188" y="45" width="140" height="140" rx="10" strokeWidth="1.8" className={nodeBoxClass('hashes', 'amber')} />
                    <text x="258" y="70" textAnchor="middle" className="fill-amber-700 dark:fill-amber-400 text-[10px] font-mono font-bold">2. k MinHashes</text>
                    <text x="258" y="98" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono">min(h1..hk(G))</text>
                    <text x="258" y="122" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono">SigA: [12, 4, 9, 2]</text>
                    <text x="258" y="142" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-[10px] font-mono">SigB: [12, 4, 7, 2]</text>
                    <text x="258" y="166" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[9px] font-mono">Pr[=] = Jaccard</text>
                  </g>

                  {/* Stage 3: LSH Band Slicer */}
                  <g onClick={() => setSelectedNodeId('bands')}>
                    <rect x="358" y="45" width="140" height="140" rx="10" strokeWidth="1.8" className={nodeBoxClass('bands', 'violet')} />
                    <text x="428" y="70" textAnchor="middle" className="fill-violet-700 dark:fill-violet-400 text-[10px] font-mono font-bold">3. LSH Bands (b×r)</text>
                    <rect x="372" y="84" width="112" height="28" rx="5" className="fill-emerald-100 dark:fill-emerald-900/50 stroke-emerald-500" />
                    <text x="428" y="102" textAnchor="middle" className="fill-emerald-900 dark:fill-emerald-200 text-[10px] font-mono font-bold">Band 1: [12,4] HIT</text>
                    <rect x="372" y="122" width="112" height="28" rx="5" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700" />
                    <text x="428" y="140" textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[10px] font-mono">Band 2: diff</text>
                    <text x="428" y="170" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">1 - (1 - s^r)^b</text>
                  </g>

                  {/* Stage 4: Collision Buckets */}
                  <g onClick={() => setSelectedNodeId('buckets')}>
                    <rect x="528" y="45" width="134" height="140" rx="10" strokeWidth="1.8" className={nodeBoxClass('buckets', 'emerald')} />
                    <text x="595" y="70" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold">4. Bucket Router</text>
                    <text x="595" y="104" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold">B1#12-4 →</text>
                    <text x="595" y="124" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 text-[10px] font-mono">{'{Doc A, Doc B}'}</text>
                    <text x="595" y="160" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">O(b) lookup!</text>
                  </g>

                  <g onClick={() => setShowUseCaseView(true)} className="cursor-pointer">
                    <rect x="195" y="214" width="290" height="28" rx="6" className="fill-slate-900 dark:fill-sky-500" />
                    <text x="340" y="232" textAnchor="middle" className="fill-white dark:fill-slate-950 text-[10px] font-mono font-bold">
                      Open MinHash + LSH Use Case & Code →
                    </text>
                  </g>
                </svg>
              )}

              {spec.id === 'aho-corasick' && (
                <svg viewBox="0 0 680 265" className="w-full min-w-[540px] h-auto" role="img" aria-label="Aho-Corasick Automaton interactive SVG">
                  {/* Solid Trie Edges */}
                  <g className="stroke-slate-400 dark:stroke-slate-600" strokeWidth="2">
                    <line x1="90" y1="120" x2="210" y2="70" />
                    <line x1="210" y1="70" x2="340" y2="70" />
                    <line x1="340" y1="70" x2="470" y2="70" />
                    <line x1="90" y1="120" x2="210" y2="170" />
                    <line x1="210" y1="170" x2="340" y2="170" />
                    <line x1="340" y1="170" x2="470" y2="170" />
                  </g>
                  {/* Dashed Failure Links */}
                  <g onClick={() => setSelectedNodeId('fail')} className="cursor-pointer">
                    <path d="M 340 152 Q 290 112 224 82" fill="none" className="stroke-rose-500" strokeWidth="2.2" strokeDasharray="5 4" />
                    <path d="M 470 152 Q 425 112 355 82" fill="none" className="stroke-rose-500" strokeWidth="2.2" strokeDasharray="5 4" />
                    <text x="392" y="128" className="fill-rose-600 dark:fill-rose-400 text-[10px] font-mono font-bold">fail("she") → "he"</text>
                  </g>

                  {/* Nodes */}
                  <g onClick={() => setSelectedNodeId('trie')}>
                    <circle cx="90" cy="120" r="22" strokeWidth="2" className={nodeBoxClass('trie')} />
                    <text x="90" y="124" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold">ROOT</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('trie')}>
                    <circle cx="210" cy="70" r="20" strokeWidth="2" className={nodeBoxClass('trie')} />
                    <text x="210" y="74" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">h</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('output')}>
                    <circle cx="340" cy="70" r="22" strokeWidth="2.2" className={nodeBoxClass('output', 'emerald')} />
                    <text x="340" y="74" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-200 text-[11px] font-mono font-bold">he✓</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('output')}>
                    <circle cx="470" cy="70" r="22" strokeWidth="2.2" className={nodeBoxClass('output', 'emerald')} />
                    <text x="470" y="74" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-200 text-[11px] font-mono font-bold">her✓</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('trie')}>
                    <circle cx="210" cy="170" r="20" strokeWidth="2" className={nodeBoxClass('trie')} />
                    <text x="210" y="174" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">s</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('trie')}>
                    <circle cx="340" cy="170" r="20" strokeWidth="2" className={nodeBoxClass('trie')} />
                    <text x="340" y="174" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">sh</text>
                  </g>
                  <g onClick={() => setSelectedNodeId('stream')}>
                    <circle cx="470" cy="170" r="24" strokeWidth="2.2" className={nodeBoxClass('stream', 'emerald')} />
                    <text x="470" y="174" textAnchor="middle" className="fill-emerald-800 dark:fill-emerald-200 text-[11px] font-mono font-bold">she✓</text>
                  </g>

                  <g onClick={() => setSelectedNodeId('stream')}>
                    <rect x="530" y="78" width="132" height="90" rx="8" strokeWidth="1.6" className={nodeBoxClass('stream', 'sky')} />
                    <text x="596" y="102" textAnchor="middle" className="fill-sky-700 dark:fill-sky-400 text-[10px] font-mono font-bold">Stream Output</text>
                    <text x="596" y="124" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono">Input: "ushers"</text>
                    <text x="596" y="144" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono">Hits: she, he, her</text>
                  </g>

                  <g onClick={() => setShowUseCaseView(true)} className="cursor-pointer">
                    <rect x="195" y="220" width="290" height="28" rx="6" className="fill-slate-900 dark:fill-sky-500" />
                    <text x="340" y="238" textAnchor="middle" className="fill-white dark:fill-slate-950 text-[10px] font-mono font-bold">
                      Open Aho-Corasick Use Case & Code →
                    </text>
                  </g>
                </svg>
              )}

              {spec.id === 'block-max-wand' && (
                <svg viewBox="0 0 680 265" className="w-full min-w-[540px] h-auto" role="img" aria-label="Block-Max WAND interactive SVG">
                  {/* Pivot Vertical Line */}
                  <line x1="365" y1="22" x2="365" y2="205" className="stroke-sky-500" strokeWidth="2.2" strokeDasharray="5 3" />
                  <text x="365" y="16" textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[10px] font-mono font-bold">Pivot Doc #412 (Σ maxScore &gt; θ=2.4)</text>

                  {[
                    { y: 36, gram: '"apl"', blocks: [{ x: 105, w: 110, sc: '0.8', skip: true }, { x: 225, w: 120, sc: '1.1', skip: true }, { x: 355, w: 140, sc: '1.4', skip: false }] },
                    { y: 94, gram: '"iph"', blocks: [{ x: 105, w: 110, sc: '0.7', skip: true }, { x: 225, w: 120, sc: '0.9', skip: true }, { x: 355, w: 140, sc: '1.6', skip: false }] },
                    { y: 152, gram: '"pro"', blocks: [{ x: 105, w: 110, sc: '0.4', skip: true }, { x: 225, w: 120, sc: '0.3', skip: true }, { x: 355, w: 140, sc: '0.9', skip: false }] },
                  ].map((row) => (
                    <g key={row.gram}>
                      <g onClick={() => setSelectedNodeId('postings')}>
                        <rect x="20" y={row.y} width="72" height="36" rx="6" strokeWidth="1.5" className={nodeBoxClass('postings')} />
                        <text x="56" y={row.y + 22} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold">{row.gram}</text>
                      </g>
                      {row.blocks.map((blk, i) => (
                        <g key={i} onClick={() => setSelectedNodeId(blk.skip ? 'blockmax' : 'pivot')}>
                          <rect
                            x={blk.x}
                            y={row.y}
                            width={blk.w}
                            height="36"
                            rx="6"
                            strokeWidth="1.5"
                            className={
                              blk.skip
                                ? 'fill-rose-50/70 dark:fill-rose-950/30 stroke-rose-300 dark:stroke-rose-800 cursor-pointer'
                                : nodeBoxClass('pivot', 'emerald')
                            }
                          />
                          <text x={blk.x + blk.w / 2} y={row.y + 16} textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono font-bold">
                            max={blk.sc}
                          </text>
                          <text x={blk.x + blk.w / 2} y={row.y + 30} textAnchor="middle" className={`text-[9px] font-mono ${blk.skip ? 'fill-rose-600 dark:fill-rose-400' : 'fill-emerald-700 dark:fill-emerald-400'}`}>
                            {blk.skip ? 'SKIPPED ✕' : 'SCORE ✓'}
                          </text>
                        </g>
                      ))}
                    </g>
                  ))}

                  {/* Top-K Heap Box */}
                  <g onClick={() => setSelectedNodeId('heap')}>
                    <rect x="515" y="48" width="146" height="128" rx="10" strokeWidth="1.8" className={nodeBoxClass('heap', 'amber')} />
                    <text x="588" y="76" textAnchor="middle" className="fill-amber-800 dark:fill-amber-300 text-[11px] font-mono font-bold">Top-K Min-Heap</text>
                    <text x="588" y="102" textAnchor="middle" className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono">θ = heap.peek()</text>
                    <text x="588" y="122" textAnchor="middle" className="fill-sky-700 dark:fill-sky-400 text-[12px] font-mono font-bold">θ = 2.40</text>
                    <text x="588" y="152" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">Raises dynamically</text>
                  </g>

                  <g onClick={() => setShowUseCaseView(true)} className="cursor-pointer">
                    <rect x="195" y="218" width="290" height="28" rx="6" className="fill-slate-900 dark:fill-sky-500" />
                    <text x="340" y="236" textAnchor="middle" className="fill-white dark:fill-slate-950 text-[10px] font-mono font-bold">
                      Open Block-Max WAND Use Case & Code →
                    </text>
                  </g>
                </svg>
              )}

              {spec.id === 'fenwick-bit' && (
                <svg viewBox="0 0 680 265" className="w-full min-w-[540px] h-auto" role="img" aria-label="Fenwick Tree Binary Indexed Tree interactive SVG">
                  {/* Responsibility Span Bars */}
                  {[
                    { idx: 8, span: 8, y: 28, node: 'lowbit' },
                    { idx: 4, span: 4, y: 62, node: 'query-arc' },
                    { idx: 2, span: 2, y: 96, node: 'query-arc' },
                    { idx: 6, span: 2, y: 96, node: 'update-arc' },
                    { idx: 1, span: 1, y: 130, node: 'compact-mem' },
                    { idx: 3, span: 1, y: 130, node: 'compact-mem' },
                    { idx: 5, span: 1, y: 130, node: 'compact-mem' },
                    { idx: 7, span: 1, y: 130, node: 'query-arc' },
                  ].map((bar) => {
                    const cellW = 74;
                    const startX = 44 + (bar.idx - bar.span) * cellW;
                    const width = bar.span * cellW - 8;
                    return (
                      <g key={bar.idx} onClick={() => setSelectedNodeId(bar.node)}>
                        <rect
                          x={startX}
                          y={bar.y}
                          width={width}
                          height="24"
                          rx="5"
                          strokeWidth="1.5"
                          className={nodeBoxClass(bar.node, bar.idx === 7 || bar.idx === 6 || bar.idx === 4 ? 'emerald' : 'sky')}
                        />
                        <text x={startX + width / 2} y={bar.y + 16} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold">
                          bit[{bar.idx}] (span {bar.span} = {bar.idx}&amp;-{bar.idx})
                        </text>
                      </g>
                    );
                  })}

                  {/* Bottom Index Axis */}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <g key={i} onClick={() => setSelectedNodeId('compact-mem')}>
                      <rect x={44 + (i - 1) * 74} y="168" width="66" height="30" rx="5" strokeWidth="1.4" className={nodeBoxClass('compact-mem')} />
                      <text x={44 + (i - 1) * 74 + 33} y="182" textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-[10px] font-mono font-bold">i={i}</text>
                      <text x={44 + (i - 1) * 74 + 33} y="193" textAnchor="middle" className="fill-slate-500 text-[9px] font-mono">{i.toString(2).padStart(4, '0')}</text>
                    </g>
                  ))}

                  <g onClick={() => setShowUseCaseView(true)} className="cursor-pointer">
                    <rect x="195" y="218" width="290" height="28" rx="6" className="fill-slate-900 dark:fill-sky-500" />
                    <text x="340" y="236" textAnchor="middle" className="fill-white dark:fill-slate-950 text-[10px] font-mono font-bold">
                      Open Fenwick Tree Use Case & Code →
                    </text>
                  </g>
                </svg>
              )}
            </div>
          </div>

          {/* Right Zone: Interactive Node Inspector & Navigation */}
          <aside className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
                <Network className="w-4 h-4" />
                Clicked Structural Element Inspector
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {activeNode.label}
                </h4>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                  {activeNode.complexity}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeNode.invariant}
                </p>
              </div>

              {/* Selectable Component Legend */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Inspect All Architectural Components
                </div>
                <div className="space-y-1.5">
                  {spec.nodes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setSelectedNodeId(n.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors flex items-center justify-between gap-2 ${
                        n.id === activeNode.id
                          ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{n.label}</span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">{n.complexity}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowUseCaseView(true)}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors"
              >
                Open Use Case & Implementation View
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleOpenImplementationLab}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Code2 className="w-3.5 h-3.5" />
                Jump to Interactive Code Lab
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
