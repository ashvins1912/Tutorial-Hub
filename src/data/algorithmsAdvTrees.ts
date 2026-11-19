import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';

export const ADV_TREE_ALGORITHMS: AlgorithmDefinition[] = [
  // 27. Segment Tree (with Lazy Propagation)
  {
    id: 'segment-tree-lazy',
    name: 'Segment Tree (with Lazy Propagation)',
    shortName: 'Segment Tree',
    category: 'Range Queries & Advanced Trees',
    visualType: 'tree-structure',
    tagline: 'Dynamic range queries AND range updates in O(log N) via deferred lazy tags.',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(4N)',
    complexityLeap: 'O(N) range add & sum → O(log N) for BOTH via lazy pushdown',
    coreIdea:
      'Each node stores the aggregate over [L, R]. When a range update fully covers [L, R], update tree[node] in O(1) and stash pending delta in lazy[node]—pushing it down to children only when a future visit splits that node.',
    mentalModelSteps: [
      'Allocate tree[4N] and lazy[4N]; build recursively from leaves upward in O(N).',
      'Implement pushDown(u, l, r): apply lazy[u] to both children and clear lazy[u] = 0.',
      'Range Update: disjoint → return; full cover → update node & lazy[u] and return; partial → pushDown, recurse, pull up.',
      'Range Query: disjoint → identity; full cover → return tree[u]; partial → pushDown & merge children.',
    ],
    loopInvariant: 'tree[u] always reflects all updates inside [l, r], while lazy[u] holds pending updates not yet pushed to children.',
    whenToUse: [
      'Dynamic range sum/min/max/GCD with BOTH range updates and range queries (LC 307, LC 699)',
      'Walking down a Segment Tree to find first index ≥ target in O(log N)',
    ],
    whenItFails: 'For point updates + prefix sums only, a Fenwick Tree (BIT) is 4× shorter and uses O(N) memory.',
    linkedTopics: ['Arrays & Prefix Sum', 'Trees DFS/BFS'],
    linkedProblemSlugs: ['subarray-sum-equals-k', 'diameter-of-binary-tree', 'merge-intervals'],
    templates: {
      python: `class LazySegTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.t = [0] * (4 * self.n); self.lz = [0] * (4 * self.n)
        self._build(1, 0, self.n - 1, arr)
    def _build(self, u, l, r, a):
        if l == r: self.t[u] = a[l]; return
        m = (l + r) // 2
        self._build(2*u, l, m, a); self._build(2*u+1, m+1, r, a)
        self.t[u] = self.t[2*u] + self.t[2*u+1]
    def _push(self, u, l, r):
        if self.lz[u]:
            m, v = (l + r) // 2, self.lz[u]
            self.t[2*u] += v*(m-l+1); self.lz[2*u] += v
            self.t[2*u+1] += v*(r-m); self.lz[2*u+1] += v
            self.lz[u] = 0`,
      js: `class LazySegTree {
  constructor(arr) {
    this.n = arr.length;
    this.t = new Array(4 * this.n).fill(0);
    this.lz = new Array(4 * this.n).fill(0);
    const build = (u, l, r) => {
      if (l === r) { this.t[u] = arr[l]; return; }
      const m = (l + r) >> 1;
      build(u * 2, l, m); build(u * 2 + 1, m + 1, r);
      this.t[u] = this.t[u * 2] + this.t[u * 2 + 1];
    };
    build(1, 0, this.n - 1);
  }
  push(u, l, r) {
    if (!this.lz[u]) return;
    const m = (l + r) >> 1, v = this.lz[u];
    this.t[u * 2] += v * (m - l + 1); this.lz[u * 2] += v;
    this.t[u * 2 + 1] += v * (r - m); this.lz[u * 2 + 1] += v;
    this.lz[u] = 0;
  }
}`,
      java: `void push(int u, int l, int r) {
  if (lz[u] == 0) return;
  int m = (l + r) / 2, v = lz[u];
  t[2*u] += v*(m-l+1); lz[2*u] += v; t[2*u+1] += v*(r-m); lz[2*u+1] += v; lz[u] = 0;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Build Segment Tree over arr = [2, 5, 1, 4]',
        explanation: 'Leaves hold [2, 5, 1, 4]; internal nodes hold [0..1]=7, [2..3]=5, root [0..3]=12.',
        invariantCheck: 'Every internal node equals sum of its two children.',
        variables: [{ name: 'array', value: '[2, 5, 1, 4]' }, { name: 'root sum', value: '12' }],
        visitedNodes: ['[0..3]'],
        nodeBadges: { '[0..3]': '12', '[0..1]': '7', '[2..3]': '5', '0': '2', '1': '5', '2': '1', '3': '4' },
        graphSpec: {
          caption: 'Segment Tree Intervals over [0..3]',
          nodes: [
            { id: '[0..3]', x: 250, y: 38 }, { id: '[0..1]', x: 140, y: 108 }, { id: '[2..3]', x: 360, y: 108 },
            { id: '0', x: 85, y: 182 }, { id: '1', x: 195, y: 182 }, { id: '2', x: 305, y: 182 }, { id: '3', x: 415, y: 182 },
          ],
          edges: [
            { u: '[0..3]', v: '[0..1]' }, { u: '[0..3]', v: '[2..3]' },
            { u: '[0..1]', v: '0' }, { u: '[0..1]', v: '1' },
            { u: '[2..3]', v: '2' }, { u: '[2..3]', v: '3' },
          ],
        },
      },
      {
        step: 2,
        title: 'Range Add +3 on [0..1] → Stash Lazy Tag & Stop Early!',
        explanation: '[0..1] is fully covered! Update sum 7→13, stash lazy=+3, skip leaves 0 & 1, pull root to 18.',
        invariantCheck: 'Deferred lazy tag gives O(log N) range updates.',
        variables: [{ name: 'update', value: 'add +3 to [0..1]' }, { name: 'lazy[0..1]', value: '+3 (pending)' }],
        activeNodes: ['[0..1]', '[0..3]'], activeEdges: ['[0..3]->[0..1]'],
        nodeBadges: { '[0..3]': '18', '[0..1]': '13 (lz:+3)', '[2..3]': '5', '0': '2', '1': '5', '2': '1', '3': '4' },
        graphSpec: {
          caption: 'Lazy +3 defers leaf mutations until a split occurs',
          nodes: [
            { id: '[0..3]', x: 250, y: 38 }, { id: '[0..1]', x: 140, y: 108, group: 2 }, { id: '[2..3]', x: 360, y: 108 },
            { id: '0', x: 85, y: 182 }, { id: '1', x: 195, y: 182 }, { id: '2', x: 305, y: 182 }, { id: '3', x: 415, y: 182 },
          ],
          edges: [
            { u: '[0..3]', v: '[0..1]' }, { u: '[0..3]', v: '[2..3]' },
            { u: '[0..1]', v: '0', dashed: true }, { u: '[0..1]', v: '1', dashed: true },
            { u: '[2..3]', v: '2' }, { u: '[2..3]', v: '3' },
          ],
        },
      },
      {
        step: 3,
        title: 'Query [1..2] → PushDown Lazy +3 → Answer = 8 + 1 = 9!',
        explanation: 'Splitting [0..1] triggers pushDown: leaves become 5 & 8, clearing lazy=0. Combine leaf 1 (8) + leaf 2 (1) = 9!',
        invariantCheck: 'PushDown guarantees fresh child values on demand.',
        variables: [{ name: 'query', value: 'sum([1..2])' }, { name: 'result', value: '8 + 1 = 9' }],
        activeNodes: ['1', '2'], visitedNodes: ['[0..3]', '[0..1]', '[2..3]', '0', '1', '2'],
        activeEdges: ['[0..3]->[0..1]', '[0..1]->1', '[0..3]->[2..3]', '[2..3]->2'],
        nodeBadges: { '[0..3]': '18', '[0..1]': '13 (lz:0)', '[2..3]': '5', '0': '5 ✓', '1': '8 ✓', '2': '1 ✓', '3': '4' },
        graphSpec: {
          caption: 'PushDown updates leaves 0 & 1 → query([1..2]) = 9',
          nodes: [
            { id: '[0..3]', x: 250, y: 38 }, { id: '[0..1]', x: 140, y: 108 }, { id: '[2..3]', x: 360, y: 108 },
            { id: '0', x: 85, y: 182 }, { id: '1', x: 195, y: 182, group: 1 }, { id: '2', x: 305, y: 182, group: 1 }, { id: '3', x: 415, y: 182 },
          ],
          edges: [
            { u: '[0..3]', v: '[0..1]' }, { u: '[0..3]', v: '[2..3]' },
            { u: '[0..1]', v: '0' }, { u: '[0..1]', v: '1' },
            { u: '[2..3]', v: '2' }, { u: '[2..3]', v: '3' },
          ],
        },
      },
    ],
  },

  // 28. Fenwick Tree (Binary Indexed Tree)
  {
    id: 'fenwick-tree-bit',
    name: 'Fenwick Tree (Binary Indexed Tree)',
    shortName: 'Fenwick Tree (BIT)',
    category: 'Range Queries & Advanced Trees',
    visualType: 'array-cells-bit',
    tagline: 'Compact O(N) structure for O(log N) prefix sums & point updates via lowbit (i & -i).',
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(N)',
    complexityLeap: '10 lines of bit manipulation vs 60-line Segment Tree',
    coreIdea:
      'In 1-based indexing, bit[i] stores the sum of the last (i & -i) elements. Update climbs via i += (i & -i); prefix query peels disjoint binary blocks via i -= (i & -i).',
    mentalModelSteps: [
      'Always use 1-based array bit[1..N] (never 0, since 0 & -0 == 0 loops forever).',
      'Point Add(i, delta): while (i <= N) { bit[i] += delta; i += i & -i; }.',
      'Prefix Query(i): while (i > 0) { sum += bit[i]; i -= i & -i; }.',
      'Range Sum(L, R) = prefix(R) - prefix(L - 1).',
    ],
    loopInvariant: 'bit[i] covers exactly the half-open slice (i - (i & -i), i].',
    whenToUse: [
      'Count of Smaller Numbers After Self (LC 315) & Reverse Pairs (LC 493)',
      'Dynamic prefix sums & inversion counting in O(N log N)',
    ],
    whenItFails: 'Needs an invertible operator (+, XOR) for range(L,R) = pref(R) - pref(L-1); use Segment Tree for arbitrary range min/max.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['subarray-sum-equals-k', 'product-of-array-except-self', 'two-sum'],
    templates: {
      python: `class BIT:
    def __init__(self, n): self.n, self.b = n, [0]*(n+1)
    def add(self, i, d):
        while i <= self.n: self.b[i] += d; i += i & -i
    def pref(self, i):
        s = 0
        while i > 0: s += self.b[i]; i -= i & -i
        return s`,
      js: `class FenwickTree {
  constructor(n) { this.n = n; this.bit = new Array(n + 1).fill(0); }
  add(i, d) { for (; i <= this.n; i += i & -i) this.bit[i] += d; }
  prefix(i) { let s = 0; for (; i > 0; i -= i & -i) s += this.bit[i]; return s; }
}`,
      java: `void add(int i, int d) { for (; i <= n; i += i & -i) bit[i] += d; }
int pref(int i) { int s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; }`,
    },
    frames: [
      {
        step: 1,
        title: '1-Based BIT Responsibility Spans (lowbit = i & -i)',
        explanation: 'Odd indices hold 1 cell; 2 & 6 hold 2 cells; 4 holds [1..4]; 8 holds [1..8].',
        invariantCheck: 'Exact N + 1 memory slots.',
        variables: [{ name: 'lowbit', value: 'i & -i' }, { name: 'spans', value: '1,2,1,4,1,2,1,8' }],
        array: [3, 5, -1, 10, 5, 9, -3, 19],
        secondaryArray: ['[1]', '[1..2]', '[3]', '[1..4]', '[5]', '[5..6]', '[7]', '[1..8]'],
      },
      {
        step: 2,
        title: 'Prefix Query(7): Peel Lowbits 7 → 6 → 4 → 0!',
        explanation: '7 (111₂) → bit[7](-3), 6 (110₂) → bit[6](9), 4 (100₂) → bit[4](10). Total = 16 in 3 hops!',
        invariantCheck: 'Disjoint binary intervals cover [1..7] exactly.',
        variables: [{ name: 'hops', value: '7 → 6 → 4' }, { name: 'sum[1..7]', value: '-3 + 9 + 10 = 16' }],
        array: [3, 5, -1, 10, 5, 9, -3, 19],
        secondaryArray: ['[1]', '[1..2]', '[3]', '[1..4]', '[5]', '[5..6]', '[7]', '[1..8]'],
        matchedIndices: [3, 5, 6],
        pointers: [{ label: '4', index: 3, tone: 'emerald' }, { label: '6', index: 5, tone: 'emerald' }, { label: '7', index: 6, tone: 'sky' }],
        hashEntries: [{ key: 'bit[7]+bit[6]+bit[4]', val: '-3 + 9 + 10 = 16', hit: true }],
      },
      {
        step: 3,
        title: 'Point Update add(3, +5): Climb Parents 3 → 4 → 8!',
        explanation: '3 + lowbit(3)=4, 4 + lowbit(4)=8. Only 3 slots mutate in O(log N)!',
        invariantCheck: 'Every covering ancestor updated cleanly.',
        variables: [{ name: 'add(3, +5)', value: 'update 3, 4, 8' }],
        array: [3, 5, 4, 15, 5, 9, -3, 24],
        secondaryArray: ['[1]', '[1..2]', '[3]', '[1..4]', '[5]', '[5..6]', '[7]', '[1..8]'],
        highlightIndices: [2, 3, 7],
        pointers: [{ label: '3', index: 2, tone: 'amber' }, { label: '4', index: 3, tone: 'amber' }, { label: '8', index: 7, tone: 'amber' }],
      },
    ],
  },

  // 29. Binary Lifting (LCA)
  {
    id: 'binary-lifting-lca',
    name: 'Binary Lifting (Lowest Common Ancestor)',
    shortName: 'Binary Lifting',
    category: 'Range Queries & Advanced Trees',
    visualType: 'tree-structure',
    tagline: 'Jump 2^k levels up a tree in O(log N) for Kth Ancestor and LCA queries.',
    timeComplexity: 'O(N log N) build · O(log N) query',
    spaceComplexity: 'O(N log N)',
    complexityLeap: 'O(N) parent-by-parent climb → O(log N) binary power-of-two jumps',
    coreIdea:
      'Precompute up[u][j] = 2^j-th ancestor of u via up[u][j] = up[ up[u][j-1] ][j-1]. For LCA(u, v), equalize depths with bit jumps, then lift u and v together from highest bit down while up[u][j] != up[v][j].',
    mentalModelSteps: [
      'DFS from root to record depth[u] and immediate parent up[u][0].',
      'Fill DP table: up[u][j] = up[ up[u][j-1] ][j-1] for j = 1..LOG-1.',
      'Equalize depths by lifting deeper node on set bits of (depth[u] - depth[v]).',
      'If u == v return u; else for j = LOG-1..0 if up[u][j] != up[v][j] jump both; return up[u][0].',
    ],
    loopInvariant: 'During the downward bit loop, u and v stay strictly below their true LCA.',
    whenToUse: [
      'Kth Ancestor of a Tree Node (LC 1483) & high-volume LCA queries',
      'Tree path distance & static max/min edge weight along any tree path',
    ],
    whenItFails: 'Static trees only. For a single LCA query, plain O(N) postorder DFS is lighter.',
    linkedTopics: ['Trees DFS/BFS', 'Dynamic Programming'],
    linkedProblemSlugs: ['lowest-common-ancestor', 'diameter-of-binary-tree', 'binary-tree-level-order'],
    templates: {
      python: `def kth_ancestor(up, u, k):
    for j in range(len(up[0])):
        if (k >> j) & 1:
            u = up[u][j]
            if u == -1: return -1
    return u`,
      js: `function kthAncestor(up, u, k) {
  for (let j = 0; j < up[0].length && u !== -1; j++) {
    if ((k >> j) & 1) u = up[u][j];
  }
  return u;
}`,
      java: `for (int j = 1; j < LOG; j++)
  for (int i = 0; i < n; i++)
    up[i][j] = up[i][j-1] == -1 ? -1 : up[up[i][j-1]][j-1];`,
    },
    frames: [
      {
        step: 1,
        title: 'Query LCA(6, 5): Depths d[6]=3, d[5]=2',
        explanation: 'Table up[u][j] stores 1st, 2nd, 4th ancestors. First equalize depth difference (3 - 2 = 1).',
        invariantCheck: 'up[6][0]=3, up[6][1]=1, up[6][2]=0.',
        variables: [{ name: 'query', value: 'LCA(6, 5)' }, { name: 'diff', value: '3 - 2 = 1 (2⁰)' }],
        activeNodes: ['6', '5'],
        nodeBadges: { '0': 'd=0', '1': 'd=1', '2': 'd=1', '3': 'd=2', '4': 'd=2', '5': 'd=2', '6': 'd=3' },
        graphSpec: {
          caption: 'Binary Lifting precomputes 2^j ancestor jumps',
          nodes: [
            { id: '0', x: 250, y: 28 }, { id: '1', x: 155, y: 84 }, { id: '2', x: 355, y: 84 },
            { id: '3', x: 95, y: 142 }, { id: '4', x: 215, y: 142 }, { id: '5', x: 355, y: 142 }, { id: '6', x: 95, y: 198 },
          ],
          edges: [
            { u: '0', v: '1' }, { u: '0', v: '2' }, { u: '1', v: '3' },
            { u: '1', v: '4' }, { u: '2', v: '5' }, { u: '3', v: '6' },
          ],
        },
      },
      {
        step: 2,
        title: 'Lift u = 6 → 3 (Equal Depth 2), Then Lift (3, 5) → (1, 2)',
        explanation: 'Since up[3][0]=1 != up[5][0]=2, lift both to (1, 2) sitting directly beneath LCA!',
        invariantCheck: 'u and v stay strictly below LCA until loop ends.',
        variables: [{ name: 'equalized', value: 'u=3, v=5' }, { name: 'lifted', value: 'u=1, v=2' }],
        activeNodes: ['1', '2'], activeEdges: ['1->3', '2->5', '3->6'],
        nodeBadges: { '0': 'LCA?', '1': 'u', '2': 'v', '3': 'd=2', '4': 'd=2', '5': 'd=2', '6': 'd=3' },
        graphSpec: {
          caption: 'Both jump together while ancestors differ',
          nodes: [
            { id: '0', x: 250, y: 28 }, { id: '1', x: 155, y: 84, group: 2 }, { id: '2', x: 355, y: 84, group: 2 },
            { id: '3', x: 95, y: 142 }, { id: '4', x: 215, y: 142 }, { id: '5', x: 355, y: 142 }, { id: '6', x: 95, y: 198 },
          ],
          edges: [
            { u: '0', v: '1' }, { u: '0', v: '2' }, { u: '1', v: '3' },
            { u: '1', v: '4' }, { u: '2', v: '5' }, { u: '3', v: '6', dashed: true },
          ],
        },
      },
      {
        step: 3,
        title: 'Return up[1][0] = Root 0 → LCA(6, 5) = 0 in O(log N)!',
        explanation: 'One final parent hop from u=1 yields LCA = 0.',
        invariantCheck: 'Answered in O(log N) regardless of tree height.',
        variables: [{ name: 'LCA(6, 5)', value: 'Node 0 ✓' }],
        activeNodes: ['0'], visitedNodes: ['0', '1', '2'], activeEdges: ['0->1', '0->2'],
        nodeBadges: { '0': 'LCA ✓', '1': 'u', '2': 'v', '3': 'd=2', '4': 'd=2', '5': 'd=2', '6': 'd=3' },
        graphSpec: {
          caption: 'LCA(6, 5) = Node 0',
          nodes: [
            { id: '0', x: 250, y: 28, group: 1 }, { id: '1', x: 155, y: 84 }, { id: '2', x: 355, y: 84 },
            { id: '3', x: 95, y: 142 }, { id: '4', x: 215, y: 142 }, { id: '5', x: 355, y: 142 }, { id: '6', x: 95, y: 198 },
          ],
          edges: [
            { u: '0', v: '1' }, { u: '0', v: '2' }, { u: '1', v: '3' },
            { u: '1', v: '4' }, { u: '2', v: '5' }, { u: '3', v: '6' },
          ],
        },
      },
    ],
  },

  // 30. Heavy-Light Decomposition (HLD)
  {
    id: 'heavy-light-decomposition',
    name: 'Heavy-Light Decomposition (HLD)',
    shortName: 'Heavy-Light (HLD)',
    category: 'Range Queries & Advanced Trees',
    visualType: 'tree-structure',
    tagline: 'Decompose trees into heavy chains so path queries reduce to O(log N) Segment Tree slices.',
    timeComplexity: 'O(log² N) path query',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N) dynamic tree path queries → O(log² N) over flattened chains',
    coreIdea:
      'Mark the edge to each node’s largest subtree child as HEAVY and visit heavy children first during DFS. Every heavy chain becomes a contiguous array slice; any path (u, v) crosses ≤ O(log N) chains!',
    mentalModelSteps: [
      'DFS #1: compute sz[u], parent[u], depth[u], and heavy[u] (largest child).',
      'DFS #2: assign chain head[u] and flat Euler index pos[u], recursing into heavy[u] first.',
      'Build a Segment Tree / BIT on the flat array pos[0..N-1].',
      'Path Query(u, v): while head[u] != head[v], query [pos[head[u]], pos[u]] on deeper chain and jump u = parent[head[u]].',
    ],
    loopInvariant: 'Every light edge crossed doubles subtree size, capping light jumps at ⌊log₂ N⌋.',
    whenToUse: [
      'Dynamic path sum/max + node/edge updates on trees (CSES Path Queries II)',
      'Combined subtree updates + path queries on the same flat Segment Tree',
    ],
    whenItFails: 'For static trees with no updates, Binary Lifting or Euler Tour + Prefix Sums is much simpler.',
    linkedTopics: ['Trees DFS/BFS', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['lowest-common-ancestor', 'diameter-of-binary-tree', 'binary-tree-maximum-path-sum'],
    templates: {
      python: `def dfs_hld(u, h):
    head[u] = h; pos[u] = timer[0]; timer[0] += 1
    if heavy[u] != -1: dfs_hld(heavy[u], h)
    for v in adj[u]:
        if v != parent[u] and v != heavy[u]: dfs_hld(v, v)`,
      js: `while (head[u] !== head[v]) {
  if (depth[head[u]] < depth[head[v]]) [u, v] = [v, u];
  ans += rangeQuery(pos[head[u]], pos[u]);
  u = parent[head[u]];
}
if (depth[u] > depth[v]) [u, v] = [v, u];
ans += rangeQuery(pos[u], pos[v]);`,
      java: `while (head[u] != head[v]) {
  if (depth[head[u]] < depth[head[v]]) { int t = u; u = v; v = t; }
  ans += seg.query(pos[head[u]], pos[u]); u = parent[head[u]];
}`,
    },
    frames: [
      {
        step: 1,
        title: 'DFS #1: Mark Largest-Subtree Edges as Heavy (Solid)',
        explanation: '0→1→3→6 forms Heavy Chain A (sz=4); 2→5 forms Chain B; 0→2 and 1→4 are Light edges (dashed).',
        invariantCheck: 'At most 1 heavy child per node.',
        variables: [{ name: 'Chain A', value: '0 → 1 → 3 → 6' }, { name: 'Chain B', value: '2 → 5' }],
        activeNodes: ['0', '1', '3', '6'], activeEdges: ['0->1', '1->3', '3->6', '2->5'],
        nodeBadges: { '0': 'sz:7', '1': 'sz:4', '2': 'sz:2', '3': 'sz:2', '4': 'sz:1', '5': 'sz:1', '6': 'sz:1' },
        graphSpec: {
          caption: 'Solid = Heavy Chains · Dashed = Light Edges',
          nodes: [
            { id: '0', x: 250, y: 28, group: 2 }, { id: '1', x: 150, y: 84, group: 2 }, { id: '2', x: 355, y: 84, group: 1 },
            { id: '3', x: 95, y: 142, group: 2 }, { id: '4', x: 215, y: 142 }, { id: '5', x: 355, y: 142, group: 1 }, { id: '6', x: 95, y: 198, group: 2 },
          ],
          edges: [
            { u: '0', v: '1', label: 'H' }, { u: '0', v: '2', label: 'L', dashed: true },
            { u: '1', v: '3', label: 'H' }, { u: '1', v: '4', label: 'L', dashed: true },
            { u: '2', v: '5', label: 'H' }, { u: '3', v: '6', label: 'H' },
          ],
        },
      },
      {
        step: 2,
        title: 'DFS #2: Flatten Chains Contiguously & Answer Path(6, 5) in 2 Queries!',
        explanation: 'Chain A occupies pos[0..3], Chain B occupies pos[5..6]. Query(6,5) runs SegTree[5..6] + SegTree[0..3]!',
        invariantCheck: 'Arbitrary tree path reduced to ≤ O(log N) range queries.',
        variables: [{ name: 'SegQuery #1', value: 'pos [5..6] (2,5)' }, { name: 'SegQuery #2', value: 'pos [0..3] (0,1,3,6)' }],
        visitedNodes: ['0', '1', '3', '6', '2', '5'], activeEdges: ['0->1', '1->3', '3->6', '0->2', '2->5'],
        nodeBadges: { '0': 'p:0', '1': 'p:1', '3': 'p:2', '6': 'p:3', '4': 'p:4', '2': 'p:5', '5': 'p:6' },
        graphSpec: {
          caption: 'Flat array [0,1,3,6 | 4 | 2,5] answers Path(6,5) in 2 queries',
          nodes: [
            { id: '0', x: 250, y: 28, group: 1 }, { id: '1', x: 150, y: 84, group: 1 }, { id: '2', x: 355, y: 84, group: 1 },
            { id: '3', x: 95, y: 142, group: 1 }, { id: '4', x: 215, y: 142 }, { id: '5', x: 355, y: 142, group: 1 }, { id: '6', x: 95, y: 198, group: 1 },
          ],
          edges: [
            { u: '0', v: '1' }, { u: '0', v: '2', dashed: true },
            { u: '1', v: '3' }, { u: '1', v: '4', dashed: true },
            { u: '2', v: '5' }, { u: '3', v: '6' },
          ],
        },
      },
    ],
  },

  // 31. Mo's Algorithm
  {
    id: 'mos-algorithm',
    name: 'Mo’s Algorithm (Offline √N Decomposition)',
    shortName: 'Mo’s Algorithm',
    category: 'Range Queries & Advanced Trees',
    visualType: 'stream-partition',
    tagline: 'Reorder offline range queries by √N blocks so sliding [L, R] runs in O((N + Q)√N).',
    timeComplexity: 'O((N + Q)√N)',
    spaceComplexity: 'O(N + Q)',
    complexityLeap: 'O(N · Q) per-query rescans → O((N + Q)√N) amortized window slides',
    coreIdea:
      'Sort all offline queries [L, R] by (⌊L / √N⌋, R). Maintain one sliding window [curL, curR] with O(1) add/remove operations, always expanding before shrinking.',
    mentalModelSteps: [
      'Set block size B = max(1, floor(sqrt(N))).',
      'Sort queries by block = floor(L / B), then R (alternating asc/desc per block).',
      'Slide curL & curR: EXPAND first (curL--, curR++), then SHRINK (curL++, curR--).',
      'Store live metric (e.g., distinct count) at ans[originalIndex].',
    ],
    loopInvariant: 'Within each L-block, R travels monotonically O(N); across all Q queries L shifts O(Q√N).',
    whenToUse: [
      'Offline distinct element counts, mode, or frequency-squared over arbitrary [L, R]',
      'Offline tree subtree queries flattened with Euler Tour',
    ],
    whenItFails: 'Offline only (requires knowing queries upfront; no online interleaved updates).',
    linkedTopics: ['Sliding Window', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['longest-substring-without-repeating', 'minimum-window-substring', 'subarray-sum-equals-k'],
    templates: {
      python: `queries.sort(key=lambda q: (q[0] // B, q[1] if (q[0] // B) % 2 == 0 else -q[1]))
for l, r, idx in queries:
    while cur_l > l: cur_l -= 1; add(arr[cur_l])
    while cur_r < r: cur_r += 1; add(arr[cur_r])
    while cur_l < l: remove(arr[cur_l]); cur_l += 1
    while cur_r > r: remove(arr[cur_r]); cur_r -= 1
    ans[idx] = distinct`,
      js: `for (const { l, r, idx } of sortedQs) {
  while (curL > l) add(arr[--curL]);
  while (curR < r) add(arr[++curR]);
  while (curL < l) rem(arr[curL++]);
  while (curR > r) rem(arr[curR--]);
  ans[idx] = distinct;
}`,
      java: `Arrays.sort(qs, (a, b) -> a.l/B != b.l/B ? a.l/B - b.l/B : a.r - b.r);`,
    },
    frames: [
      {
        step: 1,
        title: 'Block Size B = √9 = 3 · Answer Q1 [0..2] (Distinct = 2)',
        explanation: 'Reordered queries: [0..2] → [1..5] → [4..7]. Window [0..2] holds {4, 2} → distinct = 2.',
        invariantCheck: 'Block 0 queries share monotonic R.',
        variables: [{ name: 'B = √N', value: '3' }, { name: 'Q1 [0..2]', value: 'distinct = 2' }],
        array: [4, 2, 4, 1, 2, 5, 1, 4, 5],
        secondaryArray: ['B0', 'B0', 'B0', 'B1', 'B1', 'B1', 'B2', 'B2', 'B2'],
        windowRange: [0, 2],
        pointers: [{ label: 'L', index: 0, tone: 'sky' }, { label: 'R', index: 2, tone: 'emerald' }],
        hashEntries: [{ key: 'Q1 [0..2]', val: '2 distinct', hit: true }],
      },
      {
        step: 2,
        title: 'Slide to Q2 [1..5]: Expand R (+3), Shrink L (+1) → Distinct = 4!',
        explanation: 'Only 4 O(1) pointer moves reuse the entire [1..2] overlap!',
        invariantCheck: 'Expand-first avoids temporary negative frequencies.',
        variables: [{ name: 'window', value: '[1..5]' }, { name: 'Q2 distinct', value: '4' }],
        array: [4, 2, 4, 1, 2, 5, 1, 4, 5],
        secondaryArray: ['B0', 'B0', 'B0', 'B1', 'B1', 'B1', 'B2', 'B2', 'B2'],
        windowRange: [1, 5], eliminatedIndices: [0],
        pointers: [{ label: 'L', index: 1, tone: 'sky' }, { label: 'R', index: 5, tone: 'emerald' }],
        hashEntries: [{ key: 'Q1', val: '2' }, { key: 'Q2 [1..5]', val: '4 distinct', hit: true }],
      },
      {
        step: 3,
        title: 'Slide to Q3 [4..7] (Block 1) → Distinct = 4!',
        explanation: 'Expand R→7, shrink L→4. All 3 queries answered in minimal amortized moves!',
        invariantCheck: 'Total shifts bounded by O((N + Q)√N).',
        variables: [{ name: 'window', value: '[4..7]' }, { name: 'Q3 distinct', value: '4' }],
        array: [4, 2, 4, 1, 2, 5, 1, 4, 5],
        secondaryArray: ['B0', 'B0', 'B0', 'B1', 'B1', 'B1', 'B2', 'B2', 'B2'],
        windowRange: [4, 7], matchedIndices: [4, 5, 6, 7], eliminatedIndices: [0, 1, 2, 3],
        pointers: [{ label: 'L', index: 4, tone: 'sky' }, { label: 'R', index: 7, tone: 'emerald' }],
        hashEntries: [{ key: 'Q1', val: '2' }, { key: 'Q2', val: '4' }, { key: 'Q3 [4..7]', val: '4', hit: true }],
      },
    ],
  },
];

export const ADV_TREE_PRACTICE: Record<string, AlgorithmPracticeSpec> = {
  'segment-tree-lazy': {
    algorithmId: 'segment-tree-lazy',
    functionName: 'runLazySegTreeOps',
    title: 'Lazy Segment Tree Range-Add & Range-Sum',
    prompt: 'Execute ops (["add", l, r, val] | ["sum", l, r]) on nums with a Lazy Segment Tree and return all "sum" outputs.',
    structuredSteps: [
      { step: '1. Build 4N Tree & Lazy', detail: 'Compute node sums bottom-up in O(N).' },
      { step: '2. Implement pushDown', detail: 'Push pending lazy[u] to left/right children and zero lazy[u].' },
      { step: '3. Full-Cover Short-Circuit', detail: 'Update/return in O(1) when ql <= l && r <= qr.' },
    ],
    starterCode: `function runLazySegTreeOps(nums, ops) {
  const n = nums.length;
  const t = new Array(4 * n).fill(0), lz = new Array(4 * n).fill(0);
  // TODO: Build, push, rangeAdd, rangeSum and return all "sum" outputs
  return [];
}`,
    solutionCode: `function runLazySegTreeOps(nums, ops) {
  const n = nums.length;
  const t = new Array(4 * n).fill(0), lz = new Array(4 * n).fill(0);
  const build = (u, l, r) => {
    if (l === r) { t[u] = nums[l]; return; }
    const m = (l + r) >> 1; build(u * 2, l, m); build(u * 2 + 1, m + 1, r);
    t[u] = t[u * 2] + t[u * 2 + 1];
  };
  const push = (u, l, r) => {
    if (!lz[u]) return;
    const m = (l + r) >> 1, v = lz[u];
    t[u * 2] += v * (m - l + 1); lz[u * 2] += v;
    t[u * 2 + 1] += v * (r - m); lz[u * 2 + 1] += v;
    lz[u] = 0;
  };
  const add = (u, l, r, ql, qr, v) => {
    if (qr < l || r < ql) return;
    if (ql <= l && r <= qr) { t[u] += v * (r - l + 1); lz[u] += v; return; }
    push(u, l, r);
    const m = (l + r) >> 1;
    add(u * 2, l, m, ql, qr, v); add(u * 2 + 1, m + 1, r, ql, qr, v);
    t[u] = t[u * 2] + t[u * 2 + 1];
  };
  const sum = (u, l, r, ql, qr) => {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return t[u];
    push(u, l, r);
    const m = (l + r) >> 1;
    return sum(u * 2, l, m, ql, qr) + sum(u * 2 + 1, m + 1, r, ql, qr);
  };
  build(1, 0, n - 1);
  const out = [];
  for (const op of ops) {
    if (op[0] === 'add') add(1, 0, n - 1, op[1], op[2], op[3]);
    else out.push(sum(1, 0, n - 1, op[1], op[2]));
  }
  return out;
}`,
    testCases: [
      { label: 'Range add + partial pushdown', args: [[2, 5, 1, 4], [['sum', 0, 3], ['add', 0, 1, 3], ['sum', 1, 2], ['sum', 0, 3]]], expected: [12, 9, 18] },
      { label: 'Overlapping positive & negative adds', args: [[1, 1, 1, 1, 1], [['add', 0, 4, 2], ['add', 1, 3, -1], ['sum', 0, 4], ['sum', 2, 2]]], expected: [12, 2] },
      { label: 'Single element', args: [[10], [['add', 0, 0, 5], ['sum', 0, 0]]], expected: [15] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 307', title: 'Range Sum Query - Mutable', difficulty: 'Medium', focus: 'Point update + range sum Segment Tree' },
      { platform: 'LeetCode', number: 'LC 699', title: 'Falling Squares', difficulty: 'Hard', focus: 'Lazy Segment Tree with coordinate compression' },
      { platform: 'CSES', number: 'CSES 1735', title: 'Range Updates and Sums', difficulty: 'Hard', focus: 'Dual lazy tags (add + assign)' },
    ],
  },
  'fenwick-tree-bit': {
    algorithmId: 'fenwick-tree-bit',
    functionName: 'countSmallerAfterSelf',
    title: 'Count Smaller After Self via Fenwick Tree',
    prompt: 'Return counts[i] = number of smaller elements strictly to the right of nums[i] using coordinate compression + BIT.',
    structuredSteps: [
      { step: '1. Coordinate Compress', detail: 'Sort unique values and map each to 1-based rank 1..M.' },
      { step: '2. Sweep Right-to-Left', detail: 'Scan i from n-1 down to 0 so BIT holds only right-side elements.' },
      { step: '3. Prefix Query & Add', detail: 'counts[i] = pref(rank - 1), then add(rank, 1).' },
    ],
    starterCode: `function countSmallerAfterSelf(nums) {
  // TODO: Coordinate compress + 1-based Fenwick Tree sweep
  return [];
}`,
    solutionCode: `function countSmallerAfterSelf(nums) {
  const uniq = [...new Set(nums)].sort((a, b) => a - b);
  const rank = new Map(uniq.map((v, i) => [v, i + 1]));
  const m = uniq.length, bit = new Array(m + 1).fill(0);
  const add = (i, d) => { for (; i <= m; i += i & -i) bit[i] += d; };
  const pref = (i) => { let s = 0; for (; i > 0; i -= i & -i) s += bit[i]; return s; };
  const ans = new Array(nums.length).fill(0);
  for (let i = nums.length - 1; i >= 0; i--) {
    const r = rank.get(nums[i]);
    ans[i] = pref(r - 1); add(r, 1);
  }
  return ans;
}`,
    testCases: [
      { label: 'Classic LC 315', args: [[5, 2, 6, 1]], expected: [2, 1, 1, 0] },
      { label: 'Negatives & duplicates', args: [[-1, -1, 0, -5]], expected: [1, 1, 1, 0] },
      { label: 'Sorted ascending', args: [[1, 2, 3, 4]], expected: [0, 0, 0, 0] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 315', title: 'Count of Smaller Numbers After Self', difficulty: 'Hard', focus: 'Coordinate compression + BIT' },
      { platform: 'LeetCode', number: 'LC 493', title: 'Reverse Pairs', difficulty: 'Hard', focus: 'BIT prefix query on 2 * nums[j]' },
      { platform: 'CSES', number: 'CSES 1648', title: 'Dynamic Range Sum Queries', difficulty: 'Medium', focus: 'Pure BIT speed benchmark' },
    ],
  },
  'binary-lifting-lca': {
    algorithmId: 'binary-lifting-lca',
    functionName: 'answerLCAQueries',
    title: 'Binary Lifting LCA Engine',
    prompt: 'Given n nodes rooted at 0 with parent[] (parent[0] = -1) and queries [[u, v]], return the LCA for each query.',
    structuredSteps: [
      { step: '1. Compute Depths & up[u][0]', detail: 'Traverse from root 0 to compute depth[] and parent up[u][0].' },
      { step: '2. Fill Power-of-2 Table', detail: 'up[u][j] = up[ up[u][j-1] ][j-1].' },
      { step: '3. Equalize & Converge', detail: 'Lift deeper node by diff bits, then jump both down LOG-1..0.' },
    ],
    starterCode: `function answerLCAQueries(n, parent, queries) {
  // TODO: Build depth[] and up[n][LOG], then answer each [u, v] query
  return [];
}`,
    solutionCode: `function answerLCAQueries(n, parent, queries) {
  const LOG = Math.max(1, Math.ceil(Math.log2(n + 1)));
  const kids = Array.from({ length: n }, () => []);
  for (let i = 1; i < n; i++) kids[parent[i]].push(i);
  const depth = new Array(n).fill(0);
  const up = Array.from({ length: n }, () => new Array(LOG).fill(-1));
  const st = [0];
  while (st.length) {
    const u = st.pop(); up[u][0] = parent[u];
    for (let j = 1; j < LOG; j++) up[u][j] = up[u][j - 1] === -1 ? -1 : up[up[u][j - 1]][j - 1];
    for (const v of kids[u]) { depth[v] = depth[u] + 1; st.push(v); }
  }
  const lca = (u, v) => {
    if (depth[u] < depth[v]) [u, v] = [v, u];
    const diff = depth[u] - depth[v];
    for (let j = 0; j < LOG; j++) if ((diff >> j) & 1) u = up[u][j];
    if (u === v) return u;
    for (let j = LOG - 1; j >= 0; j--) if (up[u][j] !== up[v][j]) { u = up[u][j]; v = up[v][j]; }
    return up[u][0];
  };
  return queries.map(([u, v]) => lca(u, v));
}`,
    testCases: [
      { label: 'Multi-level queries', args: [7, [-1, 0, 0, 1, 1, 2, 3], [[6, 5], [6, 4], [6, 3]]], expected: [0, 1, 3] },
      { label: 'Same node & chain', args: [5, [-1, 0, 1, 2, 3], [[4, 4], [4, 2]]], expected: [4, 2] },
      { label: 'Star tree', args: [4, [-1, 0, 0, 0], [[1, 2], [2, 3]]], expected: [0, 0] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1483', title: 'Kth Ancestor of a Tree Node', difficulty: 'Hard', focus: 'Direct Binary Lifting table' },
      { platform: 'CSES', number: 'CSES 1688', title: 'Company Queries II', difficulty: 'Medium', focus: 'High-throughput LCA queries' },
      { platform: 'LeetCode', number: 'LC 236', title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', focus: 'Single DFS vs Binary Lifting', trainerSlug: 'lowest-common-ancestor' },
    ],
  },
  'heavy-light-decomposition': {
    algorithmId: 'heavy-light-decomposition',
    functionName: 'hldPathSums',
    title: 'HLD Dynamic Tree Path Sum Queries',
    prompt: 'Given n-node tree edges, node values, and ops (["set", u, val] | ["pathSum", u, v]), return all pathSum answers using HLD + BIT.',
    structuredSteps: [
      { step: '1. Subtree & Heavy Child', detail: 'Compute sz[u], parent[u], depth[u], heavy[u].' },
      { step: '2. Flatten Chains', detail: 'Assign head[u] & pos[u], visiting heavy[u] first.' },
      { step: '3. Climb Chains & Sum', detail: 'Query [pos[head[u]], pos[u]] until both sit on one chain.' },
    ],
    starterCode: `function hldPathSums(n, edges, values, ops) {
  // TODO: Decompose into heavy chains + flat BIT and answer ops
  return [];
}`,
    solutionCode: `function hldPathSums(n, edges, values, ops) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const parent = new Array(n).fill(-1), depth = new Array(n).fill(0);
  const sz = new Array(n).fill(0), heavy = new Array(n).fill(-1);
  const head = new Array(n).fill(0), pos = new Array(n).fill(0);
  let cur = 0;
  function dfs1(u, p) {
    sz[u] = 1; parent[u] = p; let best = 0;
    for (const v of adj[u]) {
      if (v === p) continue;
      depth[v] = depth[u] + 1; dfs1(v, u); sz[u] += sz[v];
      if (sz[v] > best) { best = sz[v]; heavy[u] = v; }
    }
  }
  function dfs2(u, h) {
    head[u] = h; pos[u] = cur++;
    if (heavy[u] !== -1) dfs2(heavy[u], h);
    for (const v of adj[u]) if (v !== parent[u] && v !== heavy[u]) dfs2(v, v);
  }
  dfs1(0, -1); dfs2(0, 0);
  const bit = new Array(n + 1).fill(0), flat = new Array(n).fill(0);
  const add = (i, d) => { for (i++; i <= n; i += i & -i) bit[i] += d; };
  const pref = (i) => { let s = 0; for (i++; i > 0; i -= i & -i) s += bit[i]; return s; };
  const range = (l, r) => pref(r) - (l > 0 ? pref(l - 1) : 0);
  for (let i = 0; i < n; i++) { flat[pos[i]] = values[i]; add(pos[i], values[i]); }
  const out = [];
  for (const op of ops) {
    if (op[0] === 'set') { const p = pos[op[1]]; add(p, op[2] - flat[p]); flat[p] = op[2]; }
    else {
      let u = op[1], v = op[2], ans = 0;
      while (head[u] !== head[v]) {
        if (depth[head[u]] < depth[head[v]]) [u, v] = [v, u];
        ans += range(pos[head[u]], pos[u]); u = parent[head[u]];
      }
      if (depth[u] > depth[v]) [u, v] = [v, u];
      out.push(ans + range(pos[u], pos[v]));
    }
  }
  return out;
}`,
    testCases: [
      { label: 'Cross-chain sum & update', args: [7, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [3, 6]], [1, 2, 3, 4, 5, 6, 7], [['pathSum', 6, 5], ['set', 1, 10], ['pathSum', 6, 4]]], expected: [23, 26] },
      { label: 'Line tree update', args: [3, [[0, 1], [1, 2]], [5, 10, 15], [['pathSum', 2, 2], ['set', 2, 20], ['pathSum', 0, 2]]], expected: [15, 35] },
      { label: 'Star tree', args: [4, [[0, 1], [0, 2], [0, 3]], [1, 2, 3, 4], [['pathSum', 1, 3], ['set', 0, 10], ['pathSum', 2, 3]]], expected: [7, 17] },
    ],
    platformDrills: [
      { platform: 'CSES', number: 'CSES 2134', title: 'Path Queries II', difficulty: 'Hard', focus: 'HLD + Segment Tree max on tree paths' },
      { platform: 'CSES', number: 'CSES 1138', title: 'Path Queries', difficulty: 'Medium', focus: 'Euler Tour + BIT root-to-node sums' },
      { platform: 'LeetCode', number: 'LC 124', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', focus: 'Static tree DP vs dynamic HLD', trainerSlug: 'binary-tree-maximum-path-sum' },
    ],
  },
  'mos-algorithm': {
    algorithmId: 'mos-algorithm',
    functionName: 'mosDistinctQueries',
    title: 'Offline Distinct Count Queries (Mo’s Algorithm)',
    prompt: 'Return the count of distinct integers in each inclusive range [l, r] using Mo’s √N query ordering.',
    structuredSteps: [
      { step: '1. Sort by √N Block', detail: 'Sort queries by (floor(l/B), r) with zig-zag odd blocks.' },
      { step: '2. O(1) Add / Remove', detail: 'Track freq Map & distinct count.' },
      { step: '3. Expand First, Shrink Second', detail: 'Adjust curL/curR to [l, r] and write ans[origIdx].' },
    ],
    starterCode: `function mosDistinctQueries(arr, queries) {
  // TODO: Sort queries by Mo's comparator and maintain sliding distinct count
  return [];
}`,
    solutionCode: `function mosDistinctQueries(arr, queries) {
  const B = Math.max(1, Math.floor(Math.sqrt(arr.length)));
  const qs = queries.map(([l, r], idx) => ({ l, r, idx, blk: Math.floor(l / B) }));
  qs.sort((a, b) => (a.blk !== b.blk ? a.blk - b.blk : a.blk & 1 ? b.r - a.r : a.r - b.r));
  const freq = new Map(), ans = new Array(queries.length).fill(0);
  let curL = 0, curR = -1, distinct = 0;
  const add = (x) => { const c = (freq.get(x) || 0) + 1; freq.set(x, c); if (c === 1) distinct++; };
  const rem = (x) => { const c = freq.get(x) - 1; freq.set(x, c); if (c === 0) distinct--; };
  for (const { l, r, idx } of qs) {
    while (curL > l) add(arr[--curL]);
    while (curR < r) add(arr[++curR]);
    while (curL < l) rem(arr[curL++]);
    while (curR > r) rem(arr[curR--]);
    ans[idx] = distinct;
  }
  return ans;
}`,
    testCases: [
      { label: 'Overlapping queries', args: [[4, 2, 4, 1, 2, 5, 1, 4, 5], [[0, 2], [4, 7], [1, 5]]], expected: [2, 4, 4] },
      { label: 'All identical', args: [[7, 7, 7, 7], [[0, 3], [1, 2]]], expected: [1, 1] },
      { label: 'Single elements', args: [[10, 20, 30], [[2, 2], [0, 0], [0, 2]]], expected: [1, 1, 3] },
    ],
    platformDrills: [
      { platform: 'CSES', number: 'CSES 1734', title: 'Distinct Values Queries', difficulty: 'Hard', focus: 'Offline distinct count via Mo’s or Fenwick sweep' },
      { platform: 'LeetCode', number: 'LC 1157', title: 'Online Majority Element In Subarray', difficulty: 'Hard', focus: 'Sqrt decomposition comparison' },
      { platform: 'LeetCode', number: 'LC 76', title: 'Minimum Window Substring', difficulty: 'Hard', focus: 'Sliding frequency window', trainerSlug: 'minimum-window-substring' },
    ],
  },
};
