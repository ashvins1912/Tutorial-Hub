import type { LogicBoardEnrichment } from './logicBoardMathTypes';

export const ADV_A_LOGIC_BOARDS: Record<string, LogicBoardEnrichment> = {
  'tarjan-bridges-articulation': {
    formalDefinition:
      'Tarjan’s Bridge & Articulation Point Algorithm identifies every single edge whose removal disconnects an undirected graph (bridge) and every vertex whose removal increases connected components (cut vertex) in one O(V + E) DFS pass via discovery and low-link timestamps.',
    problemStatementForm:
      'Given an undirected network (Critical Connections in a Network), find all single-point-of-failure links or router nodes in O(V + E) time.',
    logicBoard: [
      {
        step: '01 · Stamp Discovery & Low',
        condition: 'Entering unvisited vertex u from parent p',
        action: 'Set disc[u] = low[u] = ++timer',
        invariant: 'low[u] is the minimum disc reachable from u’s DFS subtree without reusing tree edge (u, p)',
      },
      {
        step: '02 · Skip Parent Edge',
        condition: 'Inspecting neighbor v of u',
        action: 'If v === p skip (handle parallel multi-edges by skipping parent edge ONCE via edgeId)',
        invariant: 'Prevents reversing directly back up the tree edge into false cycle detection',
      },
      {
        step: '03 · Test Bridge Inequality',
        condition: 'Tree child v finishes dfs(v, u)',
        action: 'Update low[u] = min(low[u], low[v]); if low[v] > disc[u] record (u, v) as a BRIDGE',
        invariant: 'Strict inequality (>) proves child subtree v has NO back-edge escaping above u',
      },
      {
        step: '04 · Test Articulation Point',
        condition: 'Checking if u is a cut vertex',
        action: 'Non-root u: low[v] >= disc[u] for some child v; Root u: dfsChildCount >= 2',
        invariant: 'Non-strict (>=) catches cut vertices even when child only reaches back to u itself',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Bridge vs Articulation Criteria',
          formula: 'Bridge(u, v): low[v] > disc[u]   |   CutVertex(u): (u≠root ∧ low[v] ≥ disc[u]) ∨ (u=root ∧ children ≥ 2)',
          meaning: 'Subtle ">" vs "≥" distinction is the #1 interview trap in Tarjan bridge problems.',
        },
        {
          name: 'Single-Pass Linear Runtime',
          formula: 'T = O(V + E),   Space = O(V)',
          meaning: 'Replaces naive O(E · (V + E)) remove-each-edge brute force.',
        },
      ],
      proofSketch:
        'Tree edge (u, v) is a bridge if and only if no vertex in v’s subtree has a back-edge to u or any ancestor of u, which is equivalent to low[v] > disc[u].',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Critical Connections in a Network, single-point-of-failure routers, or biconnected components',
        recommendedPattern: 'Tarjan’s Bridge-Finding Algorithm',
        linkedId: 'tarjan-bridges-articulation',
        linkedKind: 'algorithm',
        whyItFits: 'Finds all bridges and cut vertices in one O(V + E) pass.',
      },
      {
        ifYouSee: 'Directed graph strongly connected clusters (not undirected bridges)',
        recommendedPattern: 'Tarjan & Kosaraju SCC',
        linkedId: 'tarjan-kosaraju-scc',
        linkedKind: 'algorithm',
        whyItFits: 'Uses stack-based onStack[] low-link tailored for directed edges.',
      },
      {
        ifYouSee: 'Minimum edges to disconnect S from T (general K-edge connectivity)',
        recommendedPattern: 'Max Flow (Edmonds-Karp / Dinic)',
        linkedId: 'max-flow-edmonds-karp',
        linkedKind: 'algorithm',
        whyItFits: 'Unit-capacity Min-Cut generalizes 1-edge bridges to K-edge cuts.',
      },
    ],
  },

  'johnsons-all-pairs': {
    formalDefinition:
      'Johnson’s Algorithm computes All-Pairs Shortest Paths on sparse weighted graphs with negative edges (no negative cycles) in O(V·E log V) by running Bellman-Ford once from a super-source to compute reweighting potentials h(v), converting all edges to w\'(u, v) ≥ 0, and running Dijkstra from every vertex.',
    problemStatementForm:
      'Given a large sparse directed graph with negative edge weights (V ≈ 2000, E ≈ 5000), compute shortest distances between all pairs faster than Floyd-Warshall’s O(V³).',
    logicBoard: [
      {
        step: '01 · Attach Super-Source q',
        condition: 'Graph may contain negative edge weights',
        action: 'Add virtual node q with 0-weight directed edges q → v for all v ∈ V',
        invariant: 'Ensures every vertex is reachable in Bellman-Ford without altering paths inside G',
      },
      {
        step: '02 · Compute Potentials h(v)',
        condition: 'Run Bellman-Ford from q',
        action: 'Set h[v] = dist(q, v); abort immediately if a negative cycle is detected',
        invariant: 'Triangle inequality h[v] ≤ h[u] + w(u, v) holds for every edge (u, v)',
      },
      {
        step: '03 · Reweight Non-Negatively',
        condition: 'For every edge (u, v, w)',
        action: 'Compute w\'(u, v) = w(u, v) + h[u] - h[v] ≥ 0',
        invariant: 'Every path weight shifts by telescoping constant h[s] - h[t], preserving exact shortest paths',
      },
      {
        step: '04 · Run V Dijkstras & Unshift',
        condition: 'All edges now satisfy w\' ≥ 0',
        action: 'Run Dijkstra from each u ∈ V on w\'; recover true dist(u, v) = d\'(u, v) - h[u] + h[v]',
        invariant: 'Total runtime O(VE + V(V + E) log V) = O(V·E log V)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Potential Reweighting Telescoping Proof',
          formula: 'w\'(P) = ∑ (w(u_i, u_{i+1}) + h(u_i) - h(u_{i+1})) = w(P) + h(s) - h(t)',
          meaning: 'Intermediate potentials cancel identically, leaving relative path rankings unchanged.',
        },
        {
          name: 'Sparse APSP Runtime Advantage',
          formula: 'Johnson: O(V·E log V)   vs   Floyd-Warshall: O(V³)',
          meaning: 'Dramatically faster when E = O(V).',
        },
      ],
      proofSketch:
        'Because h(v) ≤ h(u) + w(u, v), every reweighted edge w\'(u, v) = w(u, v) + h(u) - h(v) ≥ 0, making Dijkstra valid. Because all s⇝t paths shift by the identical constant h(s) - h(t), the shortest path under w\' is identical to the shortest path under w.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Large sparse graph needing all-pairs shortest paths with negative weights',
        recommendedPattern: 'Johnson’s Algorithm',
        linkedId: 'johnsons-all-pairs',
        linkedKind: 'algorithm',
        whyItFits: 'Combines Bellman-Ford reweighting with V fast Dijkstras.',
      },
      {
        ifYouSee: 'Small or dense graph (V ≤ 400) needing all-pairs shortest paths',
        recommendedPattern: 'Floyd-Warshall (All-Pairs)',
        linkedId: 'floyd-warshall',
        linkedKind: 'algorithm',
        whyItFits: 'Simpler O(V³) matrix loop beats Johnson on dense graphs where E ≈ V².',
      },
      {
        ifYouSee: 'Single-source shortest paths with negative weights',
        recommendedPattern: 'Bellman-Ford Algorithm',
        linkedId: 'bellman-ford',
        linkedKind: 'algorithm',
        whyItFits: 'No need to run V Dijkstras for a single source.',
      },
    ],
  },

  'segment-tree-lazy': {
    formalDefinition:
      'A Segment Tree partitions array [0..n-1] into a binary tree of dyadic intervals supporting any associative monoid range query (sum, min, max, GCD) in O(log n); Lazy Propagation defers range-update writes inside tagged internal nodes until descendants are visited.',
    problemStatementForm:
      'Given an array with interleaved point/range updates (range add, range assign) and range queries (sum, min, max, count) with n, q ≤ 2×10⁵.',
    logicBoard: [
      {
        step: '01 · Build Bottom-Up / Recursive',
        condition: 'Leaf l === r vs internal node',
        action: 'Leaf stores A[l]; internal merges tree[node] = combine(tree[2*node], tree[2*node+1])',
        invariant: 'Array of size 4n covers all binary tree indices cleanly in O(n) build time',
      },
      {
        step: '02 · Lazy Push-Down',
        condition: 'Before descending to children when lazy[node] !== identity',
        action: 'Apply lazy[node] to both children’s values and compose onto children’s lazy tags; clear lazy[node]',
        invariant: 'Children always reflect all pending ancestor range mutations before being read',
      },
      {
        step: '03 · Range Update Split',
        condition: 'Updating [ul, ur] on node covering [l, r]',
        action: 'Disjoint → return; Full cover [l, r] ⊆ [ul, ur] → apply tag & return O(1); Partial → pushDown, recurse, pullUp',
        invariant: 'At most 4·log₂ n nodes touched per range update',
      },
      {
        step: '04 · Range Query Merge',
        condition: 'Querying [ql, qr] on node [l, r]',
        action: 'Disjoint → return identity (0, +∞, -∞); Full cover → return tree[node]; Partial → pushDown & combine children',
        invariant: 'Exact O(log n) worst-case query latency',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dyadic Interval Decomposition Bound',
          formula: 'Nodes visited per query/update ≤ 4 · ⌈log₂ n⌉ = O(log n),   Memory ≤ 4n',
          meaning: 'At most 2 nodes partially straddle [ql, qr] at any depth level.',
        },
        {
          name: 'Range-Sum Lazy Tag Update',
          formula: 'tree[node] += (r - l + 1) · Δ,   lazy[node] += Δ',
          meaning: 'Scales additive delta by segment width in O(1) without touching leaves.',
        },
      ],
      proofSketch:
        'At every depth d, only nodes containing ql or qr can split partially; all interior nodes return in O(1). Across log₂ n depths, at most 4 log₂ n nodes are expanded, preserving O(log n) for both queries and lazy updates.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Range Sum/Min/Max with interleaved point or range updates (Range Module, Falling Squares)',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Handles arbitrary monoids and range updates in strict O(log n).',
      },
      {
        ifYouSee: 'Only point update + invertible range sum / inversion count',
        recommendedPattern: 'Fenwick Tree (BIT)',
        linkedId: 'fenwick-tree-bit',
        linkedKind: 'algorithm',
        whyItFits: 'Half the memory and far simpler 10-line bit implementation.',
      },
      {
        ifYouSee: 'Range queries on paths between two nodes in a TREE',
        recommendedPattern: 'Heavy-Light Decomposition (HLD)',
        linkedId: 'heavy-light-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'Flattens tree paths into O(log n) contiguous Segment Tree ranges.',
      },
    ],
  },

  'fenwick-tree-bit': {
    formalDefinition:
      'A Fenwick Tree (Binary Indexed Tree) stores partial prefix sums in an array of size n + 1 where bucket i covers the range (i - LSB(i), i], supporting point updates and prefix-sum queries in O(log n) time and O(n) space via two’s-complement bit jumps.',
    problemStatementForm:
      'Given dynamic point updates and prefix/range sum queries, Count of Smaller Numbers After Self, or dynamic order-statistic frequencies in minimal code.',
    logicBoard: [
      {
        step: '01 · 1-Indexed Allocation',
        condition: 'Initializing BIT for n items',
        action: 'Allocate bit[0..n] filled with 0 (always shift 0-based idx → i = idx + 1)',
        invariant: 'Index 0 is never used because 0 & (-0) = 0 would loop infinitely',
      },
      {
        step: '02 · Point Update Climb',
        condition: 'Adding delta at 1-based index i',
        action: 'while (i <= n) { bit[i] += delta; i += i & -i; }',
        invariant: 'Visits every responsibility bucket covering index i in ≤ ⌊log₂ n⌋ + 1 steps',
      },
      {
        step: '03 · Prefix Sum Descent',
        condition: 'Querying prefix sum [1..i]',
        action: 'while (i > 0) { sum += bit[i]; i -= i & -i; }',
        invariant: 'Strips one set bit per iteration, summing disjoint power-of-two blocks',
      },
      {
        step: '04 · Range Sum & Binary Lifting',
        condition: 'Querying [l, r] OR finding smallest idx with prefixSum ≥ K',
        action: 'Range = query(r) - query(l - 1); Kth order statistic via power-of-2 bit lifting in O(log n)',
        invariant: 'Binary lifting on BIT finds Kth smallest in O(log n) instead of O(log² n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Fenwick Bucket Coverage Definition',
          formula: 'LSB(i) = i & (-i),   bit[i] = ∑_{k = i - LSB(i) + 1}^{i} A[k]',
          meaning: 'Every integer i decomposes uniquely into O(log n) disjoint power-of-2 suffix blocks.',
        },
        {
          name: 'Range Update + Point Query Trick',
          formula: 'Add +Δ at L, add -Δ at R + 1  ⟹  point(i) = prefixQuery(i)',
          meaning: 'Combines Difference Array with BIT for O(log n) range updates.',
        },
      ],
      proofSketch:
        'Removing LSB(i) strips the rightmost 1-bit of i, partitioning [1..i] into at most popcount(i) ≤ log₂ n disjoint ranges. Adding LSB(i) flips the rightmost 1-bit upward to the exact next parent bucket covering i.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Mutable Range Sum, Count Smaller After Self, or dynamic frequency ranks',
        recommendedPattern: 'Fenwick Tree (BIT)',
        linkedId: 'fenwick-tree-bit',
        linkedKind: 'algorithm',
        whyItFits: 'Compact 10-line O(log n) structure with half the memory of a Segment Tree.',
      },
      {
        ifYouSee: 'Non-invertible range MIN / MAX / GCD or lazy range assignment',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'BIT requires subtraction inverse; Segment Tree handles any monoid.',
      },
      {
        ifYouSee: 'Static array with zero updates (queries only)',
        recommendedPattern: 'Prefix Sum + Hash Map',
        linkedId: 'prefix-sum-hash',
        linkedKind: 'algorithm',
        whyItFits: 'Static prefix array answers range sums in O(1) instead of O(log n).',
      },
    ],
  },

  'binary-lifting-lca': {
    formalDefinition:
      'Binary Lifting precomputes a sparse jump table up[v][j] storing the 2^j-th ancestor of every tree node v in O(n log n) time, answering Kth-Ancestor, Lowest Common Ancestor (LCA), and tree-path aggregate queries in O(log n) time.',
    problemStatementForm:
      'Given a rooted tree of up to 10⁵ nodes and 10⁵ online queries asking for Kth ancestor of u, LCA(u, v), or distance/max-edge between u and v.',
    logicBoard: [
      {
        step: '01 · Build 2^j Jump Table',
        condition: 'DFS computes depth[v] and immediate parent up[v][0]',
        action: 'For j = 1..LOG-1 and all v: up[v][j] = up[up[v][j - 1]][j - 1]',
        invariant: 'Jumping 2^{j-1} twice reaches exact 2^j-th ancestor in O(n log n) preprocessing',
      },
      {
        step: '02 · Equalize Depths',
        condition: 'Querying LCA(u, v) with depth[u] > depth[v]',
        action: 'Lift u by diff = depth[u] - depth[v] jumping wherever bit j of diff is set',
        invariant: 'If u === v after equalization, v itself is the exact LCA',
      },
      {
        step: '03 · Parallel Binary Jump',
        condition: 'depth[u] === depth[v] and u !== v',
        action: 'For j = LOG-1 down to 0: if up[u][j] !== up[v][j], lift both u = up[u][j], v = up[v][j]',
        invariant: 'Stops at the highest distinct children strictly beneath the true LCA',
      },
      {
        step: '04 · Step One Up & Distance',
        condition: 'Loop ends with u ≠ v sharing parent',
        action: 'Return lca = up[u][0]; tree distance dist(u, v) = depth[u] + depth[v] - 2·depth[lca]',
        invariant: 'Answers LCA and Kth-ancestor in strict O(log n) worst-case time',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Doubling Ancestor Recurrence',
          formula: 'up[v][0] = parent[v],   up[v][j] = up[ up[v][j - 1] ][j - 1]   (0 ≤ j < ⌈log₂ n⌉)',
          meaning: 'Binary representation of any integer K decomposes K steps into ≤ log₂ n power-of-2 jumps.',
        },
        {
          name: 'Weighted Tree Distance Formula',
          formula: 'dist(u, v) = rootDist[u] + rootDist[v] - 2 · rootDist[LCA(u, v)]',
          meaning: 'Computes exact weighted path length between any two tree nodes in O(log n).',
        },
      ],
      proofSketch:
        'Any nonnegative distance d to LCA has a unique binary representation ∑ b_j 2^j. Scanning j from LOG-1 down to 0 greedily adds 2^j whenever up[u][j] ≠ up[v][j], converging strictly to d - 1 steps below LCA so up[u][0] is exact.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Kth Ancestor of a Tree Node, repeated LCA queries, or tree path min/max edge',
        recommendedPattern: 'Binary Lifting & LCA',
        linkedId: 'binary-lifting-lca',
        linkedKind: 'algorithm',
        whyItFits: 'Clean O(n log n) table answers every ancestor/LCA query in O(log n).',
      },
      {
        ifYouSee: 'Tree edges/nodes are MUTATED dynamically alongside path queries',
        recommendedPattern: 'Heavy-Light Decomposition (HLD)',
        linkedId: 'heavy-light-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'Binary lifting is static; HLD + Segment Tree supports dynamic updates.',
      },
      {
        ifYouSee: 'Only ONE LCA query on a binary tree (no repeated queries)',
        recommendedPattern: 'Tree BFS & DFS Traversals',
        linkedId: 'tree-bfs-dfs',
        linkedKind: 'algorithm',
        whyItFits: 'Single post-order DFS runs in O(n) without O(n log n) table build.',
      },
    ],
  },

  'heavy-light-decomposition': {
    formalDefinition:
      'Heavy-Light Decomposition (HLD) partitions a rooted tree’s edges into heavy chains (leading to each node’s largest subtree) and light edges so that ANY root-to-node path crosses at most ⌈log₂ n⌉ light edges, mapping tree path queries onto O(log n) contiguous Segment Tree intervals.',
    problemStatementForm:
      'Given a tree with dynamic node/edge updates AND arbitrary path queries (sum, max, XOR along path u ⇝ v) plus subtree queries in O(log² n) per operation.',
    logicBoard: [
      {
        step: '01 · Pass 1: Subtree Sizes',
        condition: 'First DFS from root',
        action: 'Compute sz[u], depth[u], parent[u], and heavy[u] = child with largest sz[c]',
        invariant: 'Every non-heavy (light) child satisfies sz[c] ≤ sz[u] / 2',
      },
      {
        step: '02 · Pass 2: Contiguous Chain Order',
        condition: 'Second DFS assigning flat positions pos[u]',
        action: 'Visit heavy[u] FIRST keeping same chain head[u]; visit light children starting new chains head[c] = c',
        invariant: 'Every heavy chain AND every subtree maps to a single contiguous array slice',
      },
      {
        step: '03 · Climb Chains to LCA',
        condition: 'Querying/updating path u ⇝ v while head[u] !== head[v]',
        action: 'Pick deeper chain head (say u); query Segment Tree on [pos[head[u]], pos[u]]; jump u = parent[head[u]]',
        invariant: 'Crossing a light edge doubles subtree size → at most ⌈log₂ n⌉ jumps',
      },
      {
        step: '04 · Final Shared Chain',
        condition: 'head[u] === head[v]',
        action: 'Ensure pos[u] <= pos[v]; query Segment Tree on [pos[u], pos[v]] (use pos[u]+1 for edge weights)',
        invariant: 'Total query/update time O(log² n) with Segment Tree',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Light-Edge Subtree Halving Theorem',
          formula: 'sz(lightChild) ≤ sz(parent) / 2  ⟹  #lightEdges(root ⇝ u) ≤ ⌊log₂ n⌋',
          meaning: 'Guarantees any u ⇝ v path decomposes into O(log n) contiguous array ranges.',
        },
        {
          name: 'Path Query Complexity',
          formula: 'T_path = O(log n chains × log n SegTree) = O(log² n),   T_subtree = O(log n)',
          meaning: 'Unifies dynamic path AND subtree queries under one Segment Tree.',
        },
      ],
      proofSketch:
        'Walking upward from any vertex u to the root, every light edge entered strictly doubles the current subtree size (since the heavy sibling was at least as large). Subtree size cannot exceed n, so at most ⌊log₂ n⌋ light edges exist on any path.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Dynamic node/edge updates combined with path sum/max/min queries on a tree',
        recommendedPattern: 'Heavy-Light Decomposition (HLD)',
        linkedId: 'heavy-light-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'Flattens dynamic tree paths directly into O(log n) Segment Tree calls.',
      },
      {
        ifYouSee: 'Static tree with NO updates asking for LCA or path aggregates',
        recommendedPattern: 'Binary Lifting & LCA',
        linkedId: 'binary-lifting-lca',
        linkedKind: 'algorithm',
        whyItFits: 'Faster O(log n) per query with much simpler code when tree is static.',
      },
      {
        ifYouSee: 'Count paths of exact length K or dynamic nearest-marked-node queries on a tree',
        recommendedPattern: 'Centroid Decomposition',
        linkedId: 'centroid-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'Balanced divide-and-conquer tree of height O(log n) aggregates all paths cleanly.',
      },
    ],
  },

  'mos-algorithm': {
    formalDefinition:
      'Mo’s Algorithm answers Q offline static range queries [L_i, R_i] in O((N + Q)√N) time by sorting queries into √N-sized left-endpoint blocks (ascending R inside each block, zigzagging alternating blocks) and sliding a single [curL, curR] window via O(1) add/remove hooks.',
    problemStatementForm:
      'Given an immutable array and 10⁵ offline queries asking for non-mergeable range statistics (distinct value count, mode frequency, sum of freq² × val) that Segment Trees cannot easily merge.',
    logicBoard: [
      {
        step: '01 · Block-Sort Offline Queries',
        condition: 'Block size B = Math.max(1, Math.floor(Math.sqrt(N)))',
        action: 'Sort queries by block = Math.floor(L / B); tie-break by R ascending (even block) / descending (odd block)',
        invariant: 'Zigzag (snake) ordering cuts R pointer resets in half across adjacent blocks',
      },
      {
        step: '02 · Expand Before Contract',
        condition: 'Moving [curL, curR] → [q.L, q.R]',
        action: 'Run expansions (curL--, curR++) BEFORE contractions (curL++, curR--) to keep curL <= curR + 1',
        invariant: 'Prevents negative frequency counts on empty/inverted transient windows',
      },
      {
        step: '03 · O(1) Add / Remove Delta',
        condition: 'Inserting or evicting element x',
        action: 'Update freq[x] and adjust distinctCount / answer incrementally in O(1)',
        invariant: 'Current state strictly matches exact multiset A[curL..curR]',
      },
      {
        step: '04 · Store at Original Query Index',
        condition: 'Window aligns with [q.L, q.R]',
        action: 'Write ans[q.origIdx] = currentAnswer',
        invariant: 'Total L movement ≤ Q·√N; total R movement ≤ N·√N → O((N + Q)√N)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Square-Root Block Movement Bound',
          formula: 'L_moves ≤ Q · B,   R_moves ≤ (N / B) · N  ⟹  optimal B = N / √Q  ⇒  T = O(N √Q)',
          meaning: 'Balances left-pointer intra-block wobble against right-pointer cross-array sweeps.',
        },
      ],
      proofSketch:
        'Within each block of width B = √N, L moves at most B per query (≤ Q√N total). Because R is sorted monotonically inside each of the N/B blocks, R sweeps at most N per block (≤ N√N total). Summing yields O((N + Q)√N).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Offline range distinct count, frequency-squared sums, or mode queries with NO updates',
        recommendedPattern: 'Mo’s Algorithm (Sqrt Decomposition)',
        linkedId: 'mos-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Handles non-associative frequency metrics where Segment Trees struggle.',
      },
      {
        ifYouSee: 'Online queries WITH interleaved updates on sum/min/max',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Mo’s requires offline reordering; Segment Tree answers online in O(log n).',
      },
      {
        ifYouSee: 'Dynamic frequency sums requiring O(log n)',
        recommendedPattern: 'Fenwick Tree (BIT)',
        linkedId: 'fenwick-tree-bit',
        linkedKind: 'algorithm',
        whyItFits: 'Faster O(log n) when metric is invertible.',
      },
    ],
  },

  'splay-tree-rotations': {
    formalDefinition:
      'A Splay Tree is a self-adjusting Binary Search Tree with zero stored balance metadata that moves every accessed node x to the root via Zig, Zig-Zig, and Zig-Zag double rotations, achieving O(log n) amortized time and optimal temporal-locality caching.',
    problemStatementForm:
      'Maintain a dynamic ordered sequence supporting split, join, range reversal (implicit key rope), or heavily skewed access patterns where hot keys are queried repeatedly.',
    logicBoard: [
      {
        step: '01 · Identify Parent & Grandparent',
        condition: 'Splaying accessed node x toward root',
        action: 'Inspect parent p = x.parent and grandparent g = p.parent',
        invariant: 'Terminates once x becomes the tree root (x.parent === null)',
      },
      {
        step: '02 · Zig (Depth 1)',
        condition: 'g === null (p is root)',
        action: 'Perform single rotation of x over p',
        invariant: 'Places x directly at root in O(1)',
      },
      {
        step: '03 · Zig-Zig (Same Side)',
        condition: 'x and p are both left children (or both right children)',
        action: 'Rotate p over g FIRST, THEN rotate x over p (order matters for amortized proof!)',
        invariant: 'Halves depth of the entire accessed spine, preventing O(n) chains',
      },
      {
        step: '04 · Zig-Zag (Opposite Sides)',
        condition: 'x is right child of left child p (or mirror)',
        action: 'Rotate x over p, THEN rotate x over g',
        invariant: 'Reduces x’s depth by 2 while preserving exact in-order sequence',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Sleator-Tarjan Access Lemma Potential',
          formula: 'Φ(T) = ∑_{v ∈ T} ⌊log₂ size(v)⌋,   Amortized(splay(x)) ≤ 3(r(root) - r(x)) + 1 = O(log n)',
          meaning: 'Proves O(log n) amortized cost plus Static Optimality and Working-Set theorems.',
        },
        {
          name: 'Working-Set Locality Bound',
          formula: 'Access cost of key x = O(log t_x),   where t_x = distinct items accessed since last lookup of x',
          meaning: 'Hot keys stay near the root with near-O(1) lookup latency.',
        },
      ],
      proofSketch:
        'Using potential Φ = ∑ log₂(size(v)), each Zig-Zig and Zig-Zag rotation satisfies amortized cost ≤ 3(r\'(x) - r(x)). Telescoping across all rotations up to the root bounds the entire splay operation by 3 log₂ n + 1.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Skewed/hot-key ordered lookups, dynamic tree split/join, or Link-Cut Trees',
        recommendedPattern: 'Splay Tree Rotations',
        linkedId: 'splay-tree-rotations',
        linkedKind: 'algorithm',
        whyItFits: 'Zero balance bits, O(log n) amortized split/join, and automatic hot-key promotion.',
      },
      {
        ifYouSee: 'Strict worst-case O(log n) latency required on every single operation (no amortized spikes)',
        recommendedPattern: 'AVL & Red-Black Trees',
        linkedId: 'avl-red-black-trees',
        linkedKind: 'algorithm',
        whyItFits: 'Eliminates single-operation O(n) worst-case spikes of splay trees.',
      },
      {
        ifYouSee: 'Fixed-capacity recency cache with O(1) exact lookups (no ordered range queries)',
        recommendedPattern: 'Cache Replacement (LRU / LFU / ARC)',
        linkedId: 'cache-lru-lfu-arc',
        linkedKind: 'algorithm',
        whyItFits: 'HashMap + DLL gives O(1) vs O(log n) when ordering is unneeded.',
      },
    ],
  },

  'kd-tree-nearest-neighbor': {
    formalDefinition:
      'A K-D Tree is a space-partitioning binary tree over k-dimensional points that cycles splitting hyperplanes along axis d = depth mod k at the median coordinate, enabling O(log n) average nearest-neighbor and orthogonal range search via hypersphere pruning.',
    problemStatementForm:
      'Given N static points in low-dimensional space (2D/3D GPS coordinates, RGB colors, k ≤ 10), answer fast Nearest Neighbor (k-NN) or bounding-box range queries.',
    logicBoard: [
      {
        step: '01 · Median Split Build',
        condition: 'Constructing subtree at depth d',
        action: 'Set axis = d % k; partition around median along axis via Quickselect in O(n); recurse left/right',
        invariant: 'All left points have p[axis] ≤ split; all right points have p[axis] ≥ split',
      },
      {
        step: '02 · Descend Near Branch First',
        condition: 'Querying nearest neighbor to target q',
        action: 'Compare q[axis] vs node.point[axis]; search the SAME-side (near) subtree first',
        invariant: 'Tightens bestDist rapidly to maximize pruning on the far branch',
      },
      {
        step: '03 · Hypersphere Prune Test',
        condition: 'Returning from near subtree with current bestDist',
        action: 'Compute perpendicular plane gap Δ = |q[axis] - node.point[axis]|; recurse far branch ONLY if Δ < bestDist',
        invariant: 'If Δ ≥ bestDist, NO point across the hyperplane can beat bestDist',
      },
      {
        step: '04 · Curse-of-Dimensionality Guard',
        condition: 'Dimension k > 20 (e.g., 768-dim LLM embeddings)',
        action: 'Switch to HNSW / IVF / LSH approximate vector search',
        invariant: 'In high dimensions nearly all hyperplanes intersect the query hypersphere → O(n) scan',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Hyperplane Pruning Inequality',
          formula: 'Prune far subtree  ⟺  |q_{axis} - node_{axis}| ≥ bestDist',
          meaning: 'Euclidean distance ≥ single-axis delta, guaranteeing zero missed neighbors.',
        },
        {
          name: 'Orthogonal Range & k-NN Complexity',
          formula: 'Build: O(n log n)  |  k-NN Avg: O(log n)  |  2D Range Query: O(√n + m)  (d-dim: O(n^{1-1/d} + m))',
          meaning: 'Explains why K-D Trees excel in 2D/3D and degrade as d grows large.',
        },
      ],
      proofSketch:
        'For any point p in the far half-space, ||q - p||₂ ≥ |q_axis - p_axis| ≥ |q_axis - node_axis|. Therefore if |q_axis - node_axis| ≥ bestDist, no point in the far subtree can strictly improve bestDist.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Nearest neighbor search in 2D/3D static point clouds (restaurants, robotics LiDAR)',
        recommendedPattern: 'K-D Trees (Nearest Neighbor)',
        linkedId: 'kd-tree-nearest-neighbor',
        linkedKind: 'algorithm',
        whyItFits: 'Hypersphere pruning answers low-dimensional k-NN in O(log n) expected time.',
      },
      {
        ifYouSee: 'Dynamic moving objects in 2D/3D game engines or map tile collisions',
        recommendedPattern: 'Quadtrees & Octrees',
        linkedId: 'quadtree-octree-spatial',
        linkedKind: 'algorithm',
        whyItFits: 'Fixed spatial quadrants handle frequent object movement without rebuilding medians.',
      },
      {
        ifYouSee: 'Static K closest points to origin ONE TIME (no repeated queries)',
        recommendedPattern: 'Quickselect',
        linkedId: 'quickselect',
        linkedKind: 'algorithm',
        whyItFits: 'One-off K closest runs in O(n) without building a spatial index.',
      },
    ],
  },

  'quadtree-octree-spatial': {
    formalDefinition:
      'A Quadtree (2D, 4 quadrants) or Octree (3D, 8 octants) recursively subdivides a bounded spatial region into equal sub-cells whenever node capacity exceeds threshold C, accelerating collision detection, map viewport culling, and dynamic geospatial range queries.',
    problemStatementForm:
      'Given dynamic 2D/3D moving objects or image/map tiles, query all entities inside a viewport rectangle/radius or detect broad-phase physics collisions without O(n²) pairwise checks.',
    logicBoard: [
      {
        step: '01 · Boundary Containment',
        condition: 'Inserting point/box p into node with AABB bounds',
        action: 'Return false if p falls outside bounds; insert directly if leaf has count < capacity C',
        invariant: 'Every stored entity resides strictly inside its enclosing node AABB',
      },
      {
        step: '02 · Subdivide on Overflow',
        condition: 'Leaf exceeds capacity C (and depth < maxDepth)',
        action: 'Split into 4 equal quadrants (NW, NE, SW, SE) or 8 octants and redistribute points',
        invariant: 'Adapts resolution dynamically: dense clusters split deeply, empty space stays 1 leaf',
      },
      {
        step: '03 · AABB Intersection Prune',
        condition: 'Querying viewport rectangle R',
        action: 'Skip entire subtree in O(1) if !intersects(node.bounds, R); else collect points & recurse children',
        invariant: 'Touches only quadrants overlapping query viewport R',
      },
      {
        step: '04 · Compression / Image Matrix',
        condition: 'Uniform value across all 4 children (Construct Quad Tree)',
        action: 'Merge 4 uniform leaves back into 1 single leaf node',
        invariant: 'Achieves massive spatial compression on uniform regions',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Adaptive Depth Resolution Bound',
          formula: 'Cell width at depth d = W / 2^d  ⟹  d_max = ⌈log₂(W / minSeparation)⌉',
          meaning: 'Spatial coordinates halve along every axis at each subdivision level.',
        },
        {
          name: 'Broad-Phase Collision Speedup',
          formula: 'Naive Pairwise: O(n²)   ⟶   Quadtree Local Check: O(n · (log n + k_local))',
          meaning: 'Tests collisions strictly against nearby entities in overlapping quadrants.',
        },
      ],
      proofSketch:
        'Since child AABBs partition the parent AABB disjointly, any region R disjoint from a parent cannot intersect any descendant. Pruning disjoint subtrees restricts work strictly to boundary and interior quadrants.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Game engine collision detection, map viewport queries, or Construct Quad Tree',
        recommendedPattern: 'Quadtrees & Octrees',
        linkedId: 'quadtree-octree-spatial',
        linkedKind: 'algorithm',
        whyItFits: 'Adaptive quadrant/octant subdivision handles dynamic moving objects and culling cleanly.',
      },
      {
        ifYouSee: 'Static k-NN search in general k dimensions (k = 3..10)',
        recommendedPattern: 'K-D Trees (Nearest Neighbor)',
        linkedId: 'kd-tree-nearest-neighbor',
        linkedKind: 'algorithm',
        whyItFits: 'Binary hyperplane splits avoid 2^k child explosion as k grows.',
      },
      {
        ifYouSee: 'Outer boundary perimeter / minimal enclosing polygon of 2D points',
        recommendedPattern: 'Convex Hull (Graham Scan)',
        linkedId: 'convex-hull-graham-scan',
        linkedKind: 'algorithm',
        whyItFits: 'Computes extreme boundary vertices directly in O(n log n).',
      },
    ],
  },

  'centroid-decomposition': {
    formalDefinition:
      'Centroid Decomposition recursively removes a tree’s centroid c (whose deletion leaves every remaining component with size ≤ n/2) to build a balanced Centroid Tree of height ≤ ⌊log₂ n⌋, reducing all-pairs path counting and dynamic nearest-node tree queries from O(n²) to O(n log n) / O(log n).',
    problemStatementForm:
      'Given an unrooted tree of 10⁵ nodes, count all paths of exact length K, or handle dynamic "paint node red / distance to nearest red node" queries online.',
    logicBoard: [
      {
        step: '01 · Compute Subtree Sizes',
        condition: 'DFS over active unremoved component of size S',
        action: 'Compute sz[u] ignoring previously removed centroids (removed[v] === true)',
        invariant: 'Every remaining component is a valid smaller tree',
      },
      {
        step: '02 · Locate Centroid c',
        condition: 'Walking from arbitrary component node toward heavy child',
        action: 'Move to child v while sz[v] > S / 2; stop when all neighbor components have size ≤ S / 2',
        invariant: 'Jordan’s Theorem guarantees every tree has 1 or 2 centroids',
      },
      {
        step: '03 · Solve Crossing Paths Through c',
        condition: 'Centroid c isolated',
        action: 'Process all paths passing THROUGH c by combining child subtrees one-by-one (avoiding same-subtree pairs)',
        invariant: 'Every path (u, v) in the original tree passes through the unique LCA(u, v) in the Centroid Tree',
      },
      {
        step: '04 · Mark Removed & Recurse',
        condition: 'Crossing paths accounted for',
        action: 'Set removed[c] = true; recurse on each adjacent unremoved component (linking centroidParent[subC] = c)',
        invariant: 'Component size halves at each level → Centroid Tree depth ≤ ⌊log₂ n⌋',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Centroid Tree Logarithmic Height Proof',
          formula: 'max_comp(T \\ {c}) ≤ |T| / 2  ⟹  height(CentroidTree) ≤ ⌊log₂ n⌋',
          meaning: 'Every node has at most O(log n) centroid ancestors, yielding O(n log n) total work.',
        },
        {
          name: 'Dynamic Nearest-Marked-Node Decomposition',
          formula: 'dist(u, v) = dist(u, anc) + dist(anc, v)   for anc = LCA_centroid(u, v)',
          meaning: 'Update/query walks only the O(log n) centroid ancestors of u.',
        },
      ],
      proofSketch:
        'Each recursion level visits every active vertex once and cuts every component to ≤ half its previous size. Thus total levels ≤ ⌊log₂ n⌋ and total DFS work across all levels is O(n log n).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Count tree paths of exact length K or dynamic nearest-colored-node tree queries',
        recommendedPattern: 'Centroid Decomposition',
        linkedId: 'centroid-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'Balanced O(log n) divide-and-conquer tree captures all paths cleanly.',
      },
      {
        ifYouSee: 'Dynamic point/path updates + path sum/max queries on a tree',
        recommendedPattern: 'Heavy-Light Decomposition (HLD)',
        linkedId: 'heavy-light-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'HLD + Segment Tree handles arbitrary range updates on u ⇝ v paths.',
      },
      {
        ifYouSee: 'Static all-roots subtree sum (Sum of Distances in Tree)',
        recommendedPattern: 'DP on Trees & Rerooting',
        linkedId: 'dp-on-trees-rerooting',
        linkedKind: 'algorithm',
        whyItFits: 'Simpler O(n) two-pass rerooting beats O(n log n) centroid decomposition when applicable.',
      },
    ],
  },

  'z-algorithm': {
    formalDefinition:
      'The Z-Algorithm computes array Z[0..n-1] where Z[i] is the Longest Common Prefix (LCP) between S[0..] and suffix S[i..] in deterministic O(n) time by reusing previously matched characters inside the rightmost known Z-box [L, R].',
    problemStatementForm:
      'Given pattern P and text T (concatenated as P + "$" + T), find all exact occurrences, longest prefix-suffix overlaps, or sum of prefix-match scores in O(n + m).',
    logicBoard: [
      {
        step: '01 · Initialize Z-Box',
        condition: 'Before iterating i = 1..n-1',
        action: 'Set L = 0, R = 0, Z[0] = n (or 0 depending on convention)',
        invariant: 'S[L..R] === S[0..R - L] with R maximized among all processed prefixes',
      },
      {
        step: '02 · Reuse Mirror Inside Z-Box',
        condition: 'i <= R (current index lies inside active Z-box)',
        action: 'Initialize Z[i] = Math.min(R - i + 1, Z[i - L]) in O(1)',
        invariant: 'Suffix S[i..R] matches S[i - L .. R - L] identically, skipping redundant checks',
      },
      {
        step: '03 · Extend Beyond R',
        condition: 'i + Z[i] < n && S[Z[i]] === S[i + Z[i]]',
        action: 'Increment Z[i]++ while characters match',
        invariant: 'Every successful while-step strictly advances the global right frontier R',
      },
      {
        step: '04 · Slide Z-Box Frontier',
        condition: 'i + Z[i] - 1 > R',
        action: 'Update L = i, R = i + Z[i] - 1',
        invariant: 'R never moves backward and ≤ n → total character comparisons ≤ 2n = O(n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Z-Array Definition & Pattern Matching',
          formula: 'Z[i] = LCP(S, S[i..]);   Match in P + "$" + T  ⟺  Z[i] = |P|',
          meaning: 'Single unified array replaces separate LPS build + search loops.',
        },
        {
          name: 'Monotonic Frontier Complexity Proof',
          formula: 'Each inner comparison either increments R (≤ n times) or terminates mismatch (≤ n times) ⇒ O(n)',
          meaning: 'Strict worst-case O(n) time with tiny constant factor.',
        },
      ],
      proofSketch:
        'When i ≤ R, S[L..R] = S[0..R-L] implies S[i..R] = S[i-L..R-L], so Z[i] is at least min(R-i+1, Z[i-L]). The while loop only compares characters strictly beyond R, advancing R on every match and bounding total matches by n.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sum of Scores of Built Strings, exact pattern matching, or prefix-suffix LCP at every index',
        recommendedPattern: 'Z-Algorithm',
        linkedId: 'z-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Directly outputs exact prefix-match lengths for every suffix in O(n).',
      },
      {
        ifYouSee: 'Streaming pattern matching without concatenating P + "$" + T into memory',
        recommendedPattern: 'KMP & Rabin-Karp',
        linkedId: 'kmp-rabin-karp',
        linkedKind: 'algorithm',
        whyItFits: 'KMP only stores O(|P|) LPS table and streams arbitrary-length text T.',
      },
      {
        ifYouSee: 'Longest palindromic substring in linear O(n)',
        recommendedPattern: 'Manacher’s Algorithm',
        linkedId: 'manachers-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Applies the exact same rightmost-box mirroring principle to palindromes.',
      },
    ],
  },

  'manachers-algorithm': {
    formalDefinition:
      'Manacher’s Algorithm computes the maximal palindrome radius centered at EVERY position of a string S in strict O(n) linear time by inserting sentinel separators ("#") to unify odd/even palindromes and mirroring radii inside the rightmost known palindrome [L, R].',
    problemStatementForm:
      'Given a string S[0..n-1] (n ≤ 10⁵), find the Longest Palindromic Substring or count all palindromic substrings in O(n) time instead of O(n²) center expansion.',
    logicBoard: [
      {
        step: '01 · Transform Uniform Odd Centers',
        condition: 'Preprocessing S of length n',
        action: 'Build T = "^#" + S.split("").join("#") + "#$" (guards ^ and $ remove bounds checks)',
        invariant: 'Both odd and even palindromes in S map to odd-length palindromes in T with length === P[i]',
      },
      {
        step: '02 · Mirror Inside Rightmost Box',
        condition: 'i < R (inside active rightmost palindrome centered at C)',
        action: 'Compute mirror = 2*C - i; seed P[i] = Math.min(R - i, P[mirror])',
        invariant: 'Symmetry around center C guarantees T[i - k .. i + k] is already palindromic for k ≤ min(R-i, P[mirror])',
      },
      {
        step: '03 · Expand Beyond Right Edge',
        condition: 'T[i + 1 + P[i]] === T[i - 1 - P[i]]',
        action: 'Increment P[i]++ while characters match',
        invariant: 'Every expansion step strictly advances the global right boundary R',
      },
      {
        step: '04 · Update Center & Extract',
        condition: 'i + P[i] > R',
        action: 'Set C = i, R = i + P[i]; map max P[i] back to original start = (i - P[i]) / 2',
        invariant: 'Total palindromic substrings = ∑ ⌊(P[i] + 1) / 2⌋ in O(n) total time',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Mirror Symmetry Lower Bound',
          formula: 'mirror = 2C - i,   P[i] ≥ min(R - i, P[2C - i])   for i < R',
          meaning: 'Reuses already-proven left-half palindrome radii in O(1).',
        },
        {
          name: 'Total Palindromic Substrings Count',
          formula: 'Count(S) = ∑_i ⌊(P[i] + 1) / 2⌋,   Time = O(n)  (R advances ≤ 2n times)',
          meaning: 'Counts all palindromic substrings and finds the longest in one linear pass.',
        },
      ],
      proofSketch:
        'Because T[C - (R - C) .. R] reads identically forward and backward, any palindrome centered at mirror = 2C - i clipped to [2C - R, R] appears verbatim around i. Each while-loop increment moves R strictly right, proving O(n) total comparisons.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Longest Palindromic Substring or Count Palindromic Substrings with n = 10⁵',
        recommendedPattern: 'Manacher’s Algorithm',
        linkedId: 'manachers-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Drops O(n²) DP/expansion down to deterministic O(n) time.',
      },
      {
        ifYouSee: 'Longest Palindromic SUBSEQUENCE (non-contiguous characters)',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'Manacher requires contiguous substrings; non-contiguous subsequences need Interval/LCS DP.',
      },
      {
        ifYouSee: 'Shortest Palindrome by prepending characters to the front',
        recommendedPattern: 'KMP & Rabin-Karp',
        linkedId: 'kmp-rabin-karp',
        linkedKind: 'algorithm',
        whyItFits: 'LPS of S + "#" + reverse(S) finds longest palindromic prefix in O(n).',
      },
    ],
  },

  'aho-corasick': {
    formalDefinition:
      'Aho-Corasick compiles a dictionary of K fixed patterns into a finite-state Trie Automaton augmented with BFS-computed KMP-style failure links and dictionary-suffix output links, reporting all z occurrences across text T in O(|T| + ∑|P_i| + z) linear time.',
    problemStatementForm:
      'Given thousands of banned keywords, virus signatures, or stream-of-characters patterns (Stream of Characters), match ALL patterns simultaneously in a single pass over text T.',
    logicBoard: [
      {
        step: '01 · Insert Dictionary Into Trie',
        condition: 'All patterns P_1..P_k',
        action: 'Insert each pattern into standard Trie, tagging terminal nodes with pattern IDs',
        invariant: 'Trie depth equals prefix length; total states ≤ 1 + ∑|P_i|',
      },
      {
        step: '02 · BFS Failure & Output Links',
        condition: 'BFS level-by-level from root',
        action: 'Set fail[child] = goto[fail[u]][c]; set outLink[child] = terminal(fail[child]) ? fail[child] : outLink[fail[child]]',
        invariant: 'fail[v] points to the longest proper suffix of state v that exists in the Trie',
      },
      {
        step: '03 · Single-Pass Automaton Scan',
        condition: 'For each character c of text T',
        action: 'Transition state = goto[state][c] in O(1) (pre-filled DFA table eliminates failure loops)',
        invariant: 'Text character c is processed in O(1) amortized (or worst-case DFA) time',
      },
      {
        step: '04 · Follow Output Links',
        condition: 'Current state or its outLink chain has matches',
        action: 'Walk outLink chain to emit all overlapping pattern suffixes ending at current index',
        invariant: 'Reports all z matches without scanning non-terminal failure nodes → O(n + m + z)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Multi-Pattern Linear Matching Bound',
          formula: 'T = O( |T| + ∑_{i=1}^{k} |P_i| + z ),   where z = total matches reported',
          meaning: 'Independent of dictionary count k (unlike running KMP k times in O(k·|T|)).',
        },
        {
          name: 'Failure Transition Property',
          formula: 'string(fail[v]) = longest proper suffix of string(v) present in Trie',
          meaning: 'Direct generalization of KMP’s LPS array from 1 pattern to an entire Trie.',
        },
      ],
      proofSketch:
        'During BFS, depth(fail[v]) < depth(v), so fail[u] is already finalized before computing fail[child]. On scanning text T, state depth increases by ≤ 1 per character and strictly drops on every failure hop, bounding total transitions by 2|T|.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Stream of Characters, content moderation filters, IDS signatures, or multi-keyword search',
        recommendedPattern: 'Aho-Corasick Multi-Pattern Matching',
        linkedId: 'aho-corasick',
        linkedKind: 'algorithm',
        whyItFits: 'Matches thousands of patterns simultaneously in one linear scan of text.',
      },
      {
        ifYouSee: 'Single fixed pattern search in text T',
        recommendedPattern: 'KMP & Rabin-Karp',
        linkedId: 'kmp-rabin-karp',
        linkedKind: 'algorithm',
        whyItFits: 'Simpler single-array LPS without Trie memory overhead.',
      },
      {
        ifYouSee: 'Fixed text T queried repeatedly by arbitrary NEW ad-hoc patterns online',
        recommendedPattern: 'Suffix Arrays & Kasai LCP',
        linkedId: 'suffix-array-lcp',
        linkedKind: 'algorithm',
        whyItFits: 'Indexes the text instead of the patterns, supporting O(|P| log |T|) online queries.',
      },
    ],
  },

  'suffix-array-lcp': {
    formalDefinition:
      'A Suffix Array SA[0..n-1] stores the starting indices of all n suffixes of S in lexicographical order (built in O(n log n) via prefix doubling), paired with Kasai’s O(n) Longest Common Prefix array LCP[i] = lcp(SA[i], SA[i-1]) to solve substring search, distinct-substring counting, and longest repeated substring.',
    problemStatementForm:
      'Given a static string S (up to 10⁵ chars), count distinct substrings, find Longest Repeated / Common Substring across multiple strings, or answer online substring queries.',
    logicBoard: [
      {
        step: '01 · Prefix-Doubling Sort',
        condition: 'Doubling step k = 1, 2, 4, … < n',
        action: 'Sort suffixes by rank pair (rank[i], rank[i + k]) using O(n) radix/counting sort; re-assign compact ranks',
        invariant: 'After step k, SA is sorted by the first 2k characters; terminates early once all ranks are unique',
      },
      {
        step: '02 · Kasai O(n) LCP Build',
        condition: 'Iterating original string order i = 0..n-1 with rank[i] > 0',
        action: 'Let j = SA[rank[i] - 1]; extend h while S[i+h] === S[j+h]; set lcp[rank[i]] = h; then h = max(0, h - 1)',
        invariant: 'Kasai Lemma: lcp(suffix i+1) ≥ lcp(suffix i) - 1, bounding total h increments to ≤ 2n',
      },
      {
        step: '03 · Substring Formulas',
        condition: 'SA and LCP arrays ready',
        action: 'Longest Repeated = max(LCP); Distinct Substrings = n(n+1)/2 - ∑ LCP[i]',
        invariant: 'Adjacent sorted suffixes share the maximum possible prefix with each other',
      },
      {
        step: '04 · Online Substring Search',
        condition: 'Query pattern P against indexed text S',
        action: 'Binary search SA for lower/upper bounds of P in O(|P| log n)',
        invariant: 'Count of occurrences = upperBound - lowerBound',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Distinct Substrings Formula',
          formula: '#DistinctSubstrings(S) = n(n + 1)/2 - ∑_{i=1}^{n-1} LCP[i]',
          meaning: 'Every suffix contributes n - SA[i] prefixes, of which LCP[i] already appeared in SA[i-1].',
        },
        {
          name: 'Kasai O(n) Linear Potential Bound',
          formula: 'LCP[rank[i + 1]] ≥ LCP[rank[i]] - 1   ⟹   h decreases ≤ n times, increases ≤ 2n times',
          meaning: 'Eliminates naive O(n²) pairwise prefix comparisons.',
        },
      ],
      proofSketch:
        'If suffix i shares h ≥ 1 leading characters with its SA predecessor j, then removing the identical first character leaves suffix i+1 sharing ≥ h - 1 characters with suffix j+1, which precedes i+1 in SA; thus LCP[rank[i+1]] ≥ h - 1.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Count distinct substrings, Longest Repeated/Common Substring, or fast static text index',
        recommendedPattern: 'Suffix Arrays & Kasai LCP',
        linkedId: 'suffix-array-lcp',
        linkedKind: 'algorithm',
        whyItFits: 'Lean array memory (4–8× smaller than Suffix Trees) with O(n) Kasai LCP.',
      },
      {
        ifYouSee: 'Ultra-compact compressed full-text search (DNA genomics, gigabyte corpora)',
        recommendedPattern: 'Burrows-Wheeler Transform & FM-Index',
        linkedId: 'bwt-fm-index',
        linkedKind: 'algorithm',
        whyItFits: 'Compresses the Suffix Array into O(n) bits with O(|P|) backward search.',
      },
      {
        ifYouSee: 'Only need single-length duplicate substring check (Longest Duplicate Substring)',
        recommendedPattern: 'KMP & Rabin-Karp',
        linkedId: 'kmp-rabin-karp',
        linkedKind: 'algorithm',
        whyItFits: 'Binary Search + Rolling Hash is faster to code in 45-minute interviews.',
      },
    ],
  },

  'bwt-fm-index': {
    formalDefinition:
      'The Burrows-Wheeler Transform (BWT) permutes a string into the last column L of its sorted cyclic rotations (clustering identical characters for compression), while the FM-Index layers C[] counts and Occ(c, r) checkpoints on L to answer exact substring counts in O(|P|) time using compressed space.',
    problemStatementForm:
      'Compress large repetitive texts (bzip2) or search multi-gigabyte genomic sequences (Bowtie/BWA aligners) in O(|P|) pattern time without storing an uncompressed Suffix Array.',
    logicBoard: [
      {
        step: '01 · Forward BWT via SA',
        condition: 'String S terminated by unique sentinel "$" (smallest char)',
        action: 'Build Suffix Array SA; emit L[i] = S[(SA[i] - 1 + n) % n]',
        invariant: 'L clusters characters that share identical following contexts into long compressible runs',
      },
      {
        step: '02 · Last-to-First (LF) Mapping',
        condition: 'Inverting BWT or stepping backward in FM-Index',
        action: 'Compute LF(i) = C[L[i]] + Occ(L[i], i) where C[c] = count of chars < c',
        invariant: 'LF-Property: the k-th occurrence of char c in L corresponds to the k-th occurrence of c in F',
      },
      {
        step: '03 · O(|P|) Backward Search',
        condition: 'Querying pattern P from right to left (j = |P|-1 down to 0)',
        action: 'Initialize [lo, hi] = [0, n - 1]; narrow lo = C[c] + Occ(c, lo - 1), hi = C[c] + Occ(c, hi) - 1',
        invariant: 'After reading P[j..|P|-1], [lo, hi] is the exact SA range starting with that suffix',
      },
      {
        step: '04 · Run-Length + Move-to-Front',
        condition: 'Using BWT for lossless compression (bzip2 pipeline)',
        action: 'Chain BWT → Move-to-Front (MTF) → Run-Length Encoding → Huffman/Entropy Coding',
        invariant: 'Reversible lossless transform requiring zero extra dictionary storage',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'LF-Mapping Bijection Formula',
          formula: 'LF(i) = C[L[i]] + Occ(L[i], i),   where C[c] = |{k : S[k] < c}|',
          meaning: 'Allows inverting BWT and stepping backward through text in O(1) per character.',
        },
        {
          name: 'FM-Index Backward Search Recurrence',
          formula: 'lo\' = C[c] + Occ(c, lo - 1),   hi\' = C[c] + Occ(c, hi) - 1   ⟹   Count = max(0, hi - lo + 1)',
          meaning: 'Counts all occurrences of P in O(|P|) time independent of text length |T|.',
        },
      ],
      proofSketch:
        'If two rotations i < j share the same last character c = L[i] = L[j], rotating both right by 1 prepends the identical character c to their already-ordered prefixes, preserving their relative rank in F. Thus the k-th c in L always maps to the k-th c in F.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'DNA/genome alignment, bzip2 compression, or O(|P|) compressed full-text search',
        recommendedPattern: 'Burrows-Wheeler Transform & FM-Index',
        linkedId: 'bwt-fm-index',
        linkedKind: 'algorithm',
        whyItFits: 'Delivers O(|P|) exact counting inside a compressed index.',
      },
      {
        ifYouSee: 'Uncompressed competitive/interview string indexing with LCP queries',
        recommendedPattern: 'Suffix Arrays & Kasai LCP',
        linkedId: 'suffix-array-lcp',
        linkedKind: 'algorithm',
        whyItFits: 'Simpler direct array access when memory compression is unnecessary.',
      },
      {
        ifYouSee: 'Streaming single-pass dictionary compression (GIF/TIFF/Unix compress)',
        recommendedPattern: 'LZW Compression',
        linkedId: 'lzw-compression',
        linkedKind: 'algorithm',
        whyItFits: 'Compresses streams online without needing full-block suffix sorting.',
      },
    ],
  },

  'lzw-compression': {
    formalDefinition:
      'Lempel-Ziv-Welch (LZW) is a lossless adaptive dictionary compression algorithm that greedily replaces the longest recognized phrase w with a fixed-width integer code while simultaneously inserting w + nextChar into the dictionary—allowing the decoder to rebuild the exact same dictionary without transmitting it.',
    problemStatementForm:
      'Compress and decompress repetitive byte/character streams in one O(n) pass (GIF, TIFF, PDF) without transmitting an explicit symbol table.',
    logicBoard: [
      {
        step: '01 · Seed Base Alphabet',
        condition: 'Initializing encoder & decoder identically',
        action: 'Populate dictionary codes 0..255 with all single-byte ASCII characters; nextCode = 256',
        invariant: 'Encoder and decoder start synchronized on code 0..255',
      },
      {
        step: '02 · Greedy Longest Phrase',
        condition: 'Reading next char c with current phrase w',
        action: 'If dict.has(w + c) set w = w + c; else emit dict[w], register dict[w + c] = nextCode++, set w = c',
        invariant: 'Every emitted phrase is already known to the decoder',
      },
      {
        step: '03 · Mirror-Build on Decode',
        condition: 'Decoder receives next code k after previous string prev',
        action: 'Look up entry = dict[k]; emit entry; register dict[nextCode++] = prev + entry[0]; prev = entry',
        invariant: 'Decoder stays exactly 1 entry behind encoder in lockstep',
      },
      {
        step: '04 · KwKwK Special Edge Case',
        condition: 'Decoder receives code k === nextCode (not yet in decoder dict!)',
        action: 'Synthesize entry = prev + prev[0] immediately before adding to dictionary',
        invariant: 'Handles self-referential "ABABA" patterns cleanly without corruption',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'KwKwK Self-Reference Identity',
          formula: 'k = nextCode  ⟹  entry = prev + prev[0]   (first char === last char)',
          meaning: 'Occurs uniquely when encoder immediately reuses the phrase it just registered.',
        },
        {
          name: 'Linear Trie-Backed Throughput',
          formula: 'Encode & Decode = O(n) time,   Dict capped at 2^{12} = 4096 (reset on full)',
          meaning: 'Fixed-bit-width codes keep dictionary memory bounded.',
        },
      ],
      proofSketch:
        'Since encoder emits code(w) before inserting w + c, decoder can reconstruct w + c upon reading the first character of the next token. The sole exception (next token IS w + c) forces its first and last characters to be w[0], uniquely determining entry = prev + prev[0].',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Lossless adaptive stream compression without sending a header dictionary (GIF/TIFF)',
        recommendedPattern: 'LZW Compression',
        linkedId: 'lzw-compression',
        linkedKind: 'algorithm',
        whyItFits: 'Single-pass O(n) encoding/decoding with automatic dictionary synchronization.',
      },
      {
        ifYouSee: 'Symbol-frequency prefix-free compression (known static frequencies)',
        recommendedPattern: 'Huffman Coding',
        linkedId: 'huffman-coding',
        linkedKind: 'algorithm',
        whyItFits: 'Optimal bit packing when single-symbol probabilities are skewed.',
      },
      {
        ifYouSee: 'Block-sorting compression + compressed full-text search',
        recommendedPattern: 'Burrows-Wheeler Transform & FM-Index',
        linkedId: 'bwt-fm-index',
        linkedKind: 'algorithm',
        whyItFits: 'Clusters identical contexts before run-length/entropy coding.',
      },
    ],
  },

  'lis-patience-sorting': {
    formalDefinition:
      'Patience Sorting computes the Longest Increasing Subsequence (LIS) in O(n log n) time by maintaining a strictly sorted array tails[] where tails[len] stores the smallest possible ending value of any increasing subsequence of length len + 1, updated via Binary Search.',
    problemStatementForm:
      'Given an array of up to 10⁵ numbers (or 2D Russian Doll Envelopes), compute LIS length in O(n log n) instead of O(n²) DP.',
    logicBoard: [
      {
        step: '01 · Maintain Optimal Tails',
        condition: 'Iterating each x in nums',
        action: 'Maintain array tails[] (strictly increasing for strict LIS; non-decreasing for LNDS)',
        invariant: 'tails[k] is the MINIMUM ending value among all increasing subsequences of length k + 1 seen so far',
      },
      {
        step: '02 · Binary Search Position',
        condition: 'Finding insertion slot for x in tails[]',
        action: 'Binary-search first index pos with tails[pos] >= x (use > x for non-decreasing)',
        invariant: 'tails[] stays strictly sorted, making binary search valid in O(log n)',
      },
      {
        step: '03 · Extend or Tighten Tail',
        condition: 'pos === tails.length vs pos < tails.length',
        action: 'Append x if pos === tails.length (extends LIS by 1); else overwrite tails[pos] = x (tighter tail)',
        invariant: 'Lower tail value strictly dominates higher tail for all future extensions',
      },
      {
        step: '04 · Reconstruct Actual Subsequence',
        condition: 'Need actual LIS elements (remember: tails[] itself is NOT always a valid subsequence!)',
        action: 'Store tailIdx[pos] = i and prev[i] = tailIdx[pos - 1]; backtrack from tailIdx[last]',
        invariant: 'Parent pointers recover a genuine monotonic subsequence of length tails.length',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dilworth’s Theorem Equivalence (Patience Piles)',
          formula: 'len(LIS) = min(# non-increasing subsequence partitions) = |tails|',
          meaning: 'Each pile in Patience Sorting is a non-increasing subsequence; #piles strictly equals LIS.',
        },
        {
          name: '2D Russian Doll Envelope Tie-Break',
          formula: 'Sort width ASC,  height DESC  ⟹  2D nested envelopes reduce to 1D LIS on height',
          meaning: 'Descending height prevents selecting two envelopes with identical width.',
        },
      ],
      proofSketch:
        'Inductively, tails[k] is the minimal tail of any length-(k+1) IS. For any new x, placing x at the first tails[pos] ≥ x implies tails[pos-1] < x (so x forms a valid length-(pos+1) IS) and x ≤ old tails[pos] (preserving minimality).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Longest Increasing Subsequence (n = 10⁵) or Russian Doll Envelopes',
        recommendedPattern: 'LIS & Patience Sorting',
        linkedId: 'lis-patience-sorting',
        linkedKind: 'algorithm',
        whyItFits: 'Binary search on minimal tails achieves O(n log n) vs O(n²) DP.',
      },
      {
        ifYouSee: 'Count NUMBER of LIS or LIS with gap/difference constraint',
        recommendedPattern: 'Segment Tree & Lazy Propagation',
        linkedId: 'segment-tree-lazy',
        linkedKind: 'algorithm',
        whyItFits: 'Segment Tree / Fenwick Tree over compressed values tracks (maxLen, count) in O(n log n).',
      },
      {
        ifYouSee: 'Two-sequence Longest Common Subsequence (LCS)',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'General LCS uses 2D DP (reduces to LIS only when one sequence has all unique items).',
      },
    ],
  },

  'bitmask-dp': {
    formalDefinition:
      'Bitmask DP represents subsets of a small domain (n ≤ 20) as an integer bitmask mask ∈ [0..2^n - 1], caching overlapping subset-ordering states in O(n² · 2^n) or O(n · 2^n) time instead of O(n!) permutation search.',
    problemStatementForm:
      'Given n ≤ 20 cities/workers/tasks (Traveling Salesman Problem, Shortest Path Visiting All Nodes, Partition to K Equal Sum Subsets), optimize over all subset visitations.',
    logicBoard: [
      {
        step: '01 · Encode Subset State',
        condition: 'n ≤ 20 items requiring exact visited-set memory',
        action: 'Define dp[mask][last] (for ordering like TSP) OR dp[mask] (for assignment where popcount(mask) gives row)',
        invariant: 'Bit i of mask is 1 ⟺ item i has been visited/assigned',
      },
      {
        step: '02 · Seed Base Mask',
        condition: 'Initial singleton masks or empty mask 0',
        action: 'Set dp[1 << start][start] = 0 (TSP) or dp[0] = 0 (assignment); all others +∞',
        invariant: 'Mask transitions strictly increase popcount(mask) → natural topological order 0..2^n-1',
      },
      {
        step: '03 · Transition Unset Bits',
        condition: 'For each next item j where (mask & (1 << j)) === 0',
        action: 'Relax dp[mask | (1 << j)][j] = min(…, dp[mask][u] + cost(u, j))',
        invariant: 'Evaluates every subset once regardless of how the prefix was ordered',
      },
      {
        step: '04 · Submask Enumeration Variant',
        condition: 'Partitioning mask into arbitrary subsets (e.g., grouping sessions)',
        action: 'Iterate submasks via for (sub = mask; sub > 0; sub = (sub - 1) & mask)',
        invariant: 'Total submask pairs across all masks equals exactly 3^n',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Held-Karp TSP Exponential Speedup',
          formula: 'Brute Force: O(n!)   ⟶   Bitmask DP: O(n² · 2^n)   (n = 20: 2.4×10^{18} ⟶ 4×10^8)',
          meaning: 'Collapses all (k-1)! orderings of the same visited prefix into 1 cached state.',
        },
        {
          name: '3^n Submask Enumeration Sum',
          formula: '∑_{m=0}^{2^n - 1} 2^{popcount(m)} = ∑_{k=0}^{n} C(n, k) · 2^k = (1 + 2)^n = 3^n',
          meaning: 'Tight bound when transitioning from mask to all subsets sub ⊆ mask.',
        },
      ],
      proofSketch:
        'Because future tour cost from vertex u depends only on (visitedSet, u) and NOT the order in which visitedSet was traversed, dp[mask][u] satisfies Bellman optimality along the DAG ordered by ascending mask integer value.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'TSP, Hamiltonian Path, Shortest Superstring, or assignment with n ≤ 20',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Drops O(n!) permutation search down to O(n² · 2^n).',
      },
      {
        ifYouSee: 'Weighted 1-to-1 assignment where n = 100–500 (too big for 2^n)',
        recommendedPattern: 'Hopcroft-Karp & Hungarian Matching',
        linkedId: 'hopcroft-karp-hungarian',
        linkedKind: 'algorithm',
        whyItFits: 'Polynomial O(n³) Hungarian handles large bipartite assignment.',
      },
      {
        ifYouSee: 'Subset sum (order-independent) with n = 30–40',
        recommendedPattern: 'Meet-in-the-Middle',
        linkedId: 'meet-in-the-middle',
        linkedKind: 'algorithm',
        whyItFits: 'Splits into two 2^{n/2} halves when 2^n is too large.',
      },
    ],
  },

  'digit-dp': {
    formalDefinition:
      'Digit DP counts integers in [L, R] (up to 10¹⁸) satisfying digit-level constraints by walking decimal positions left-to-right while tracking a tight upper-bound flag, leading-zero flag, and problem-specific state (digit sum, bitmask, remainder) in O(D · |states| · 10) time.',
    problemStatementForm:
      'Given bounds L, R ≤ 10¹⁸, count integers with no repeated digits, exact digit sum S, no adjacent equal digits, or divisible by K.',
    logicBoard: [
      {
        step: '01 · Range Subtraction',
        condition: 'Counting valid integers in inclusive range [L, R]',
        action: 'Compute solve(R) - solve(L - 1) using decimal string representations',
        invariant: 'Reduces two-sided [L, R] boundary tracking to a single upper bound [0, N]',
      },
      {
        step: '02 · Enforce Tight Upper Limit',
        condition: 'At digit position pos with boolean tight',
        action: 'Set limit = tight ? digits[pos] : 9; iterate d = 0..limit; nextTight = tight && (d === limit)',
        invariant: 'Prevents constructing any number exceeding N while sharing non-tight memo states',
      },
      {
        step: '03 · Guard Leading Zeros',
        condition: 'Constraint sensitive to 0s (e.g., distinct digits or non-zero count)',
        action: 'Track started / isLeadingZero flag; placing 0 while !started does NOT mark digit 0 used',
        invariant: 'Numbers like 0042 are properly evaluated as 42 without false zero-duplication',
      },
      {
        step: '04 · Memoize Unrestricted States',
        condition: 'Caching dfs(pos, tight, started, state)',
        action: 'Cache by (pos, state) whenever !tight && started (or cache full tuple including tight/started)',
        invariant: 'Each (pos, state) computes once → O(log₁₀ R × |states| × 10)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Prefix Range Decomposition',
          formula: 'Count([L, R]) = F(R) - F(L - 1),   D = ⌊log₁₀ R⌋ + 1 ≤ 19',
          meaning: 'Turns 10¹⁸ range iteration into ≤ 19 digit recursion steps.',
        },
        {
          name: 'Digit DP State Complexity',
          formula: 'T = O(D · |state| · 2 · 10)   (e.g., 19 × 1024 × 10 ≈ 2×10⁵ ops)',
          meaning: 'Instant millisecond execution even for 64-bit bounds.',
        },
      ],
      proofSketch:
        'Every integer x ∈ [0, N] maps bijectively to a unique D-digit padded path obeying d_i ≤ limit_i. Memoizing (pos, tight, started, state) evaluates the DAG of valid prefixes once.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Count integers in [L, R] up to 10¹⁸ with digit/sum/distinctness/divisibility rules',
        recommendedPattern: 'Digit DP',
        linkedId: 'digit-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Runs in O(log₁₀ R × states) where O(R) loops are impossible.',
      },
      {
        ifYouSee: 'Small range R ≤ 10⁶ asking for prime counts',
        recommendedPattern: 'Sieve of Eratosthenes',
        linkedId: 'sieve-of-eratosthenes',
        linkedKind: 'algorithm',
        whyItFits: 'Primality is not a local digit property; sieve marks primes in O(N log log N).',
      },
      {
        ifYouSee: 'Track used digits {0..9} inside Digit DP',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: '10-bit mask (1024 states) pairs directly with Digit DP for Numbers With Repeated Digits.',
      },
    ],
  },

  'dp-on-trees-rerooting': {
    formalDefinition:
      'Tree DP + Rerooting computes an aggregate value for EVERY node treated as the tree root in O(n) total time via two DFS passes: Pass 1 aggregates bottom-up subtree answers for an arbitrary root 0, and Pass 2 shifts the root across each edge (u → v) in O(1) to incorporate the outside-subtree contribution.',
    problemStatementForm:
      'Given an unrooted tree of 10⁵ nodes (Sum of Distances in Tree, Minimum Height Trees, Max Path from Every Node), compute an optimal metric from EVERY vertex as root in O(n) instead of O(n²).',
    logicBoard: [
      {
        step: '01 · Pass 1: Bottom-Up Subtree DP',
        condition: 'Post-order DFS rooted at node 0',
        action: 'Compute subSize[u] = 1 + ∑ subSize[v] and subAns[u] = combine(subAns[v])',
        invariant: 'After Pass 1, ans[0] = subAns[0] is exact for root 0',
      },
      {
        step: '02 · Pass 2: O(1) Edge Reroot Shift',
        condition: 'Pre-order DFS moving root from parent u to child v',
        action: 'Update ans[v] from ans[u] by adjusting v’s subtree (-subSize[v]) and outside nodes (+(n - subSize[v]))',
        invariant: 'Every node in v’s subtree gets 1 step closer; every node outside gets 1 step farther',
      },
      {
        step: '03 · Non-Invertible Prefix/Suffix Trick',
        condition: 'Operator is MAX/MIN/product mod P (cannot simply subtract child v from u)',
        action: 'Precompute prefixMax[] and suffixMax[] across children of u to exclude child v in O(1)',
        invariant: 'Handles non-invertible monoids (like max distance / eccentricity) in strict O(n)',
      },
      {
        step: '04 · Return All-Roots Vector',
        condition: 'Pass 2 completes',
        action: 'Return ans[0..n-1]',
        invariant: 'Two linear traversals → exact O(n) time and O(n) space',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Sum of Distances Rerooting Formula',
          formula: 'ans[v] = ans[u] - subSize[v] + (n - subSize[v]) = ans[u] + n - 2 · subSize[v]',
          meaning: 'Computes root v’s full distance sum from parent u in one arithmetic operation.',
        },
        {
          name: 'Non-Invertible Sibling Exclusion',
          formula: 'outside[v] = combine( outside[u], prefix[idx-1], suffix[idx+1] )',
          meaning: 'Prefix/suffix arrays exclude v without division or subtraction.',
        },
      ],
      proofSketch:
        'Moving the root across edge (u, v) decreases the distance to all subSize[v] nodes inside v’s subtree by 1 and increases the distance to all n - subSize[v] remaining nodes by 1, yielding ans[v] = ans[u] + n - 2·subSize[v].',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sum of Distances in Tree, Minimum Edge Reversals, or answer needed for EVERY root',
        recommendedPattern: 'DP on Trees & Rerooting',
        linkedId: 'dp-on-trees-rerooting',
        linkedKind: 'algorithm',
        whyItFits: 'Two O(n) DFS passes replace O(n²) per-root traversals.',
      },
      {
        ifYouSee: 'Only need answer for ONE fixed root (diameter, House Robber III)',
        recommendedPattern: 'Tree BFS & DFS Traversals',
        linkedId: 'tree-bfs-dfs',
        linkedKind: 'algorithm',
        whyItFits: 'Single post-order Pass 1 suffices without rerooting.',
      },
      {
        ifYouSee: 'Count paths of exact length K across arbitrary node pairs',
        recommendedPattern: 'Centroid Decomposition',
        linkedId: 'centroid-decomposition',
        linkedKind: 'algorithm',
        whyItFits: 'Divide-and-conquer at centroids handles distance-K pair counting cleanly.',
      },
    ],
  },

  'convex-hull-trick': {
    formalDefinition:
      'Convex Hull Trick (CHT) optimizes DP recurrences of the form dp[i] = min_{j < i} (m_j · x_i + b_j) + c_i from O(n²) down to O(n) (monotonic slopes/queries via deque) or O(n log n) (arbitrary queries via Li Chao Tree) by maintaining only the lower envelope of linear functions.',
    problemStatementForm:
      'Given a 1D DP whose transition splits cleanly into slope m_j × query x_i + intercept b_j (batch scheduling, tree cutting, splitting cost), collapse O(n²) to O(n) / O(n log n).',
    logicBoard: [
      {
        step: '01 · Factor Into Linear Form',
        condition: 'Transition contains product term a[i] * b[j]',
        action: 'Rewrite dp[i] = min_j (m_j · x_i + c_j) + const_i identifying slope m_j and intercept c_j',
        invariant: 'Each past state j maps to a line y = m_j·x + c_j',
      },
      {
        step: '02 · Prune Dominated Back Lines',
        condition: 'Inserting new line L₃ (monotonic decreasing slopes) with back two lines L₁, L₂',
        action: 'Pop L₂ while intersectX(L₁, L₃) <= intersectX(L₁, L₂) (cross-multiply to avoid float error!)',
        invariant: 'Surviving deque lines form the exact lower convex envelope',
      },
      {
        step: '03 · Query Envelope Minimum',
        condition: 'Monotonic increasing x_i (pop front while L₂(x_i) ≤ L₁(x_i)) OR non-monotonic x_i (binary search / Li Chao)',
        action: 'Evaluate front/optimal line m* · x_i + c* to obtain dp[i]',
        invariant: 'Deque mode runs in O(n) amortized; Binary Search / Li Chao runs in O(n log n)',
      },
      {
        step: '04 · Integer Overflow Guard',
        condition: 'Cross-multiplying intersection inequality (c₃-c₁)(m₁-m₂) <= (c₂-c₁)(m₁-m₃)',
        action: 'Use 128-bit BigInt / long double for intersection tests',
        invariant: 'Prevents silent 64-bit multiplication overflow on large coordinates',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Linear Envelope DP Structure',
          formula: 'dp[i] = c_i + min_{j < i} ( m_j · x_i + b_j )   (O(n²) ⟶ O(n) or O(n log n))',
          meaning: 'Turns quadratic state transition into an O(1) lower-envelope line evaluation.',
        },
        {
          name: 'Redundant Middle Line Criterion',
          formula: 'Pop L₂  ⟺  (b₃ - b₁)/(m₁ - m₃) ≤ (b₂ - b₁)/(m₁ - m₂)',
          meaning: 'L₂ sits permanently above L₁ and L₃ for every x ∈ ℝ.',
        },
      ],
      proofSketch:
        'If L₃ crosses L₁ at or to the left of where L₂ crosses L₁, then for all x to the left L₁ ≤ L₂ and for all x to the right L₃ ≤ L₂, so L₂ can never be strictly optimal and is safely discarded. Each line enters and leaves the deque at most once → O(n).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'O(n²) DP with a cross-product term m_j · x_i in the transition',
        recommendedPattern: 'Convex Hull Trick (DP Opt)',
        linkedId: 'convex-hull-trick',
        linkedKind: 'algorithm',
        whyItFits: 'Maintains lower envelope of lines to hit O(n) / O(n log n).',
      },
      {
        ifYouSee: 'DP transition is simply min_{i-k ≤ j < i} dp[j] with NO cross-product term',
        recommendedPattern: 'Monotonic Deque',
        linkedId: 'monotonic-deque',
        linkedKind: 'algorithm',
        whyItFits: 'Standard sliding window deque is far simpler without line geometry.',
      },
      {
        ifYouSee: '2D geometric convex polygon boundary of points (not DP optimization)',
        recommendedPattern: 'Convex Hull (Graham Scan)',
        linkedId: 'convex-hull-graham-scan',
        linkedKind: 'algorithm',
        whyItFits: 'Geometric dual of CHT for point sets in the plane.',
      },
    ],
  },

  'sieve-of-eratosthenes': {
    formalDefinition:
      'The Sieve of Eratosthenes enumerates all prime numbers up to N in O(N log log N) time and O(N) space by iteratively marking multiples of each unmarked prime p starting at p², and extends naturally to Smallest Prime Factor (SPF) for O(log x) factorization.',
    problemStatementForm:
      'Given N ≤ 10⁷ (Count Primes, fast prime factorization of many queries, segmented sieve over [L, R]), find all primes or factorize numbers rapidly.',
    logicBoard: [
      {
        step: '01 · Initialize Prime Flags',
        condition: 'Allocating boolean array isPrime[0..N]',
        action: 'Fill true; set isPrime[0] = isPrime[1] = false',
        invariant: 'Every unmarked number < p² is guaranteed prime when outer loop reaches p',
      },
      {
        step: '02 · Stop Outer Loop at √N',
        condition: 'For p = 2 while p * p <= N',
        action: 'Skip p if !isPrime[p]; else mark composites starting strictly at m = p * p',
        invariant: 'Every multiple k·p with k < p was already crossed out by a smaller prime factor',
      },
      {
        step: '03 · Cross Out Multiples',
        condition: 'For m = p * p; m <= N; m += p',
        action: 'Set isPrime[m] = false (or record spf[m] = p if spf[m] === 0 for factorization)',
        invariant: 'Total inner writes = N · ∑_{p ≤ √N} (1/p) = O(N log log N)',
      },
      {
        step: '04 · O(log x) SPF Factorization',
        condition: 'Factorizing query x ≤ N after SPF sieve',
        action: 'While x > 1: emit spf[x], set x = x / spf[x]',
        invariant: 'Factors arbitrary numbers in ≤ log₂ x divisions',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Mertens’ Second Theorem (Sieve Complexity)',
          formula: '∑_{p ≤ N} (N / p) = N · (ln ln N + M) = O(N log log N)',
          meaning: 'Harmonic sum over primes grows doubly-logarithmically—practically linear in N.',
        },
        {
          name: 'Prime Number Theorem Density',
          formula: 'π(N) ≈ N / ln(N)',
          meaning: 'Estimates exact prime count up to N (e.g., ~78,498 primes ≤ 10⁶).',
        },
      ],
      proofSketch:
        'Every composite number c ≤ N has a prime factor p ≤ √N, so stopping the outer loop at √N marks every composite. Starting inner marking at p² skips redundant marks since smaller multiples of p contain a smaller prime factor.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Count Primes ≤ N, factorize many queries ≤ 10⁶, or segmented range primes',
        recommendedPattern: 'Sieve of Eratosthenes',
        linkedId: 'sieve-of-eratosthenes',
        linkedKind: 'algorithm',
        whyItFits: 'Near-linear O(N log log N) preprocessing and O(log x) SPF factorization.',
      },
      {
        ifYouSee: 'Compute GCD, LCM, or modular inverse without full factorization',
        recommendedPattern: 'Euclidean & Extended GCD',
        linkedId: 'euclidean-extended-gcd',
        linkedKind: 'algorithm',
        whyItFits: 'Runs in O(log min(a, b)) even for 64-bit integers.',
      },
      {
        ifYouSee: 'Fast modular power a^b mod M or Fermat inverse for prime M',
        recommendedPattern: 'Modular Exponentiation',
        linkedId: 'modular-exponentiation',
        linkedKind: 'algorithm',
        whyItFits: 'Computes a^b mod M in O(log b) binary squaring steps.',
      },
    ],
  },

  'euclidean-extended-gcd': {
    formalDefinition:
      'The Euclidean Algorithm computes gcd(a, b) in O(log min(a, b)) via repeated remainder reduction gcd(a, b) = gcd(b, a mod b); Extended GCD simultaneously computes Bézout integer coefficients (x, y) satisfying a·x + b·y = gcd(a, b), unlocking modular inverses and linear Diophantine equations.',
    problemStatementForm:
      'Given integers a, b, and modulus m, compute gcd/lcm, solve linear Diophantine a·x + b·y = c (Water and Jug), or find modular multiplicative inverse a⁻¹ mod m.',
    logicBoard: [
      {
        step: '01 · Base Case',
        condition: 'b === 0',
        action: 'Return { g: a, x: 1, y: 0 } since a·1 + 0·0 = a',
        invariant: 'gcd(a, 0) = a',
      },
      {
        step: '02 · Euclidean Remainder Step',
        condition: 'b > 0',
        action: 'Recurse { g, x1, y1 } = extGcd(b, a % b)',
        invariant: 'a mod b < a / 2 every two steps → strictly O(log min(a, b)) depth',
      },
      {
        step: '03 · Back-Substitute Bézout',
        condition: 'Unwinding from b·x1 + (a - ⌊a/b⌋·b)·y1 = g',
        action: 'Set x = y1 and y = x1 - Math.floor(a / b) * y1',
        invariant: 'Maintains exact Bézout identity a·x + b·y = g at every frame',
      },
      {
        step: '04 · Extract Modular Inverse',
        condition: 'Solving a·x ≡ 1 (mod m)',
        action: 'Exists iff g === 1; return ((x % m) + m) % m',
        invariant: 'Works for ANY coprime modulus m (not just prime m like Fermat’s Little Theorem)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Bézout’s Identity & Diophantine Criterion',
          formula: 'a · x + b · y = gcd(a, b);   a · x + b · y = c solvable ⟺ gcd(a, b) | c',
          meaning: 'Instantly solves Water and Jug (c ≤ a + b ∧ gcd(a, b) | c) in O(log a).',
        },
        {
          name: 'Lamé’s Fibonacci Worst-Case Bound',
          formula: 'Steps ≤ 5 × digits₁₀(min(a, b)) = O(log min(a, b))',
          meaning: 'Consecutive Fibonacci numbers (F_{k+1}, F_k) are the slowest possible input.',
        },
      ],
      proofSketch:
        'Any common divisor of (a, b) divides a - q·b = a mod b and vice versa, so gcd(a, b) = gcd(b, a mod b). Since a mod b < b and (a mod b) < a/2 whenever b ≥ a/2, operands drop by at least half every two iterations.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Water and Jug, modular inverse mod composite M, Chinese Remainder Theorem, or fraction reduction',
        recommendedPattern: 'Euclidean & Extended GCD',
        linkedId: 'euclidean-extended-gcd',
        linkedKind: 'algorithm',
        whyItFits: 'Logarithmic O(log n) exact Bézout solver and universal modular inverse.',
      },
      {
        ifYouSee: 'Compute a^b mod M or Fermat inverse a^{p-2} mod prime p',
        recommendedPattern: 'Modular Exponentiation',
        linkedId: 'modular-exponentiation',
        linkedKind: 'algorithm',
        whyItFits: 'Binary squaring computes huge powers in O(log b).',
      },
      {
        ifYouSee: 'Enumerate all primes ≤ N or factorize many integers',
        recommendedPattern: 'Sieve of Eratosthenes',
        linkedId: 'sieve-of-eratosthenes',
        linkedKind: 'algorithm',
        whyItFits: 'Precomputes prime table in O(N log log N).',
      },
    ],
  },

  'modular-exponentiation': {
    formalDefinition:
      'Modular Exponentiation (Binary Exponentiation / Exponentiation by Squaring) computes a^b mod m in O(log b) multiplications by expanding exponent b in binary and squaring the running base at each bit, generalizing directly to O(k³ log b) matrix exponentiation for linear recurrences.',
    problemStatementForm:
      'Given base a, huge exponent b ≤ 10¹⁸, and modulus m (Pow(x, n), nth Fibonacci in O(log n), combinatorics nCr mod 10⁹+7), compute powers without overflow or O(b) timeouts.',
    logicBoard: [
      {
        step: '01 · Initialize Accumulator',
        condition: 'Computing base^exp mod m',
        action: 'Set res = 1 % m, base = ((base % m) + m) % m (use BigInt if m > 2²⁶)',
        invariant: 'Loop invariant: res × base^{exp} ≡ originalBase^{originalExp} (mod m)',
      },
      {
        step: '02 · Odd Bit Multiply',
        condition: 'exp & 1 === 1 (lowest bit of exp is 1)',
        action: 'Set res = (res * base) % m',
        invariant: 'Absorbs one power of current base into res',
      },
      {
        step: '03 · Square Base & Halve Exp',
        condition: 'exp > 0',
        action: 'Set base = (base * base) % m and exp = exp >> 1 (or Math.floor(exp / 2))',
        invariant: 'Halves exponent every iteration → at most ⌊log₂ b⌋ + 1 iterations',
      },
      {
        step: '04 · Matrix & Fermat Extensions',
        condition: 'Prime modulus division OR K-th term of linear recurrence',
        action: 'Division: a / b ≡ a · b^{p-2} (mod p); Recurrence: M^n · v₀ via matrix squaring',
        invariant: 'Computes 10¹⁸-th Fibonacci or graph K-step path counts in O(k³ log n)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Binary Squaring Identity',
          formula: 'a^b = (a²)^{b/2}  (b even),   a^b = a · (a²)^{(b-1)/2}  (b odd)  ⟹  O(log b) muls',
          meaning: 'Computes a^{10^{18}} mod M in ≤ 60 multiplications.',
        },
        {
          name: 'Fermat’s Little Theorem Inverse (Prime p)',
          formula: 'a^{p - 1} ≡ 1 (mod p)  ⟹  a^{-1} ≡ a^{p - 2} (mod p)   (p = 10⁹ + 7)',
          meaning: 'Enables modular division for nCr = n! · (r!)^{-1} · ((n-r)!)^{-1} mod p.',
        },
      ],
      proofSketch:
        'Writing b = ∑ b_k 2^k gives a^b = ∏_{b_k = 1} a^{2^k}. Repeated squaring produces a^{2^k} mod m at iteration k, and multiplying into res whenever b_k = 1 computes the exact modular product in ⌊log₂ b⌋ + 1 steps.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Pow(x, n), combinatorics mod 10⁹+7, or nth linear recurrence (n = 10¹⁸)',
        recommendedPattern: 'Modular Exponentiation',
        linkedId: 'modular-exponentiation',
        linkedKind: 'algorithm',
        whyItFits: 'O(log n) binary squaring handles scalar powers and matrix recurrences.',
      },
      {
        ifYouSee: 'Modular inverse when modulus m is COMPOSITE (not prime)',
        recommendedPattern: 'Euclidean & Extended GCD',
        linkedId: 'euclidean-extended-gcd',
        linkedKind: 'algorithm',
        whyItFits: 'Fermat’s p - 2 fails for composite m; Extended GCD works whenever gcd(a, m) = 1.',
      },
      {
        ifYouSee: 'Prime factorization or totient φ(m) across many inputs',
        recommendedPattern: 'Sieve of Eratosthenes',
        linkedId: 'sieve-of-eratosthenes',
        linkedKind: 'algorithm',
        whyItFits: 'Precomputes primes/SPF in O(N log log N).',
      },
    ],
  },
};
