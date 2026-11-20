import type { LogicBoardEnrichment } from './logicBoardMathTypes';

export const CORE_B_LOGIC_BOARDS: Record<string, LogicBoardEnrichment> = {
  'depth-first-search': {
    formalDefinition:
      'Depth-First Search plunges down unvisited graph branches before backtracking, partitioning edges into Tree, Back, Forward, and Cross edges in O(V + E) time to reveal connected components, cycles, and Euler subtree intervals.',
    problemStatementForm:
      'Given an adjacency list or 2D grid, count islands/components, detect directed cycles, clone graphs, or test ancestor-descendant reachability.',
    logicBoard: [
      {
        step: '01 · Mark Entering State',
        condition: 'Entering unvisited vertex u',
        action: 'Set state[u] = VISITING (1) and record tin[u] = ++timer',
        invariant: 'Active call stack contains strictly all vertices with state === VISITING',
      },
      {
        step: '02 · Explore Neighbors',
        condition: 'For each v ∈ adj[u]',
        action: 'UNVISITED → dfs(v); VISITING (directed) → cycle detected; DONE → skip',
        invariant: 'Back-edge to a VISITING ancestor exists ⟺ graph contains a directed cycle',
      },
      {
        step: '03 · Finalize Exit State',
        condition: 'All neighbors explored',
        action: 'Set state[u] = DONE (2) and tout[u] = timer',
        invariant: 'Subtree interval [tin[v], tout[v]] is strictly nested inside [tin[u], tout[u]]',
      },
      {
        step: '04 · Iterative Stack Guard',
        condition: 'Path depth V > 10⁴ risks recursion stack overflow',
        action: 'Replace recursion with explicit heap stack',
        invariant: 'Maintains O(V + E) traversal without call-stack crashes',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'DFS Euler Subtree Interval Theorem',
          formula: 'v is a descendant of u  ⟺  tin[u] ≤ tin[v] ≤ tout[v] ≤ tout[u]',
          meaning: 'Enables O(1) ancestor checks and flattens trees onto Segment Tree arrays.',
        },
        {
          name: 'Linear Graph Work Bound',
          formula: 'T(V, E) = Θ(V + E),   Space = O(V)',
          meaning: 'Each vertex enters/exits once; each adjacency edge is inspected at most twice.',
        },
      ],
      proofSketch:
        'Vertices transition monotonically UNVISITED → VISITING → DONE. Adjacency list adj[u] is scanned once on entry, bounding total operations by ∑_u (1 + deg(u)) = Θ(V + E).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Number of Islands, Pacific Atlantic, Clone Graph, or directed cycle detection',
        recommendedPattern: 'Depth-First Search',
        linkedId: 'depth-first-search',
        linkedKind: 'algorithm',
        whyItFits: 'Clean O(V + E) flood fill, reachability, and back-edge cycle detection.',
      },
      {
        ifYouSee: 'Shortest unweighted hop count between start and target',
        recommendedPattern: 'Bidirectional BFS',
        linkedId: 'bidirectional-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'BFS guarantees minimum hops whereas DFS explores arbitrary depth first.',
      },
      {
        ifYouSee: 'Need Strongly Connected Components or critical bridge edges',
        recommendedPattern: 'Tarjan & Kosaraju SCC',
        linkedId: 'tarjan-kosaraju-scc',
        linkedKind: 'algorithm',
        whyItFits: 'Augments DFS with low-link timestamps.',
      },
    ],
  },

  'union-find-dsu': {
    formalDefinition:
      'Disjoint Set Union (Union-Find) partitions {0..n-1} into disjoint equivalence classes supporting Find(x) and Union(x, y) in O(α(n)) amortized time via Path Compression and Union by Rank/Size.',
    problemStatementForm:
      'Given dynamic undirected edge additions or equivalence pairs, answer connectivity queries, count components, detect redundant edges, or power Kruskal’s MST.',
    logicBoard: [
      {
        step: '01 · Singleton Init',
        condition: 'Initializing n elements',
        action: 'Set parent[i] = i, size[i] = 1, components = n',
        invariant: 'Every canonical root satisfies parent[r] === r',
      },
      {
        step: '02 · Find + Path Compression',
        condition: 'Querying representative of x',
        action: 'If parent[x] !== x set parent[x] = find(parent[x]); return parent[x]',
        invariant: 'Points every traversed node directly to its root',
      },
      {
        step: '03 · Union by Size / Rank',
        condition: 'Merging roots rx = find(x) and ry = find(y)',
        action: 'If rx === ry return false (cycle!); else attach smaller tree under larger, components--',
        invariant: 'Keeps tree height ≤ log₂ n (and amortized cost O(α(n)) with compression)',
      },
      {
        step: '04 · Offline Reverse-Delete',
        condition: 'Queries delete edges instead of adding them',
        action: 'Process queries in REVERSE order so deletions become Union insertions',
        invariant: 'Restores O(α(n)) without needing rollback DSU',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Tarjan Inverse Ackermann Bound',
          formula: 'T(m ops, n nodes) = O(m · α(n)),   α(n) ≤ 4 for all practical n',
          meaning: 'Effectively constant time per connectivity query and merge.',
        },
        {
          name: 'Rank-Size Guarantee',
          formula: 'size(root of rank r) ≥ 2^r  ⟹  max rank ≤ ⌊log₂ n⌋',
          meaning: 'Union by Rank alone already guarantees O(log n) worst-case depth.',
        },
      ],
      proofSketch:
        'Rank grows only when two equal-rank trees merge, doubling minimum subtree size (≥ 2^r). Combining Union by Rank with Path Compression amortizes pointer hops to O(α(n)) per operation.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Accounts Merge, Redundant Connection, Number of Provinces, or online island merges',
        recommendedPattern: 'Union-Find (DSU)',
        linkedId: 'union-find-dsu',
        linkedKind: 'algorithm',
        whyItFits: 'Near-O(1) dynamic connectivity and undirected cycle detection.',
      },
      {
        ifYouSee: 'Minimum Spanning Tree on edge-list graph',
        recommendedPattern: 'Kruskal’s MST',
        linkedId: 'kruskals-mst',
        linkedKind: 'algorithm',
        whyItFits: 'Sorts edges and uses DSU to reject cycle-forming edges.',
      },
      {
        ifYouSee: 'Directed reachability or shortest path queries',
        recommendedPattern: 'Depth-First Search',
        linkedId: 'depth-first-search',
        linkedKind: 'algorithm',
        whyItFits: 'DSU only models symmetric equivalence classes, not directed paths.',
      },
    ],
  },

  'bidirectional-bfs': {
    formalDefinition:
      'Bidirectional BFS expands simultaneously from source S and target T on an unweighted graph, always advancing the smaller frontier so both search balls intersect at depth d/2, cutting O(b^d) exploration down to O(b^{d/2}).',
    problemStatementForm:
      'Given an unweighted graph with known start S and exact goal T (Word Ladder, Open the Lock, Knight Shortest Path) and high branching factor b, find minimum hops.',
    logicBoard: [
      {
        step: '01 · Seed Both Frontiers',
        condition: 'S !== T and target T is reachable/valid',
        action: 'Set front = {S}, back = {T}, visited = {S, T}, steps = 0',
        invariant: 'front sits at depth d₁ from S; back sits at depth d₂ from T',
      },
      {
        step: '02 · Pick Smaller Frontier',
        condition: 'front.size > back.size',
        action: 'Swap front ↔ back before generating next layer',
        invariant: 'Minimizes worst-case branching volume on every expansion',
      },
      {
        step: '03 · Detect Intersection',
        condition: 'Neighbor nxt of u ∈ front satisfies back.has(nxt)',
        action: 'Immediately return steps + 1',
        invariant: 'First collision guarantees exact shortest hop distance d₁ + d₂ + 1',
      },
      {
        step: '04 · Advance Layer',
        condition: 'nxt unvisited and valid',
        action: 'Add nxt to nextFront and visited; replace front = nextFront, steps++',
        invariant: 'Returns -1 if either frontier becomes empty before colliding',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Exponential Reduction Identity',
          formula: 'Standard BFS: O(b^d)   ⟶   Bidirectional BFS: O(2 · b^{d/2})',
          meaning: 'For b = 10, d = 6: drops 1,000,000 visited nodes to ~2,000.',
        },
        {
          name: 'Collision Distance',
          formula: 'd(S, T) = dist_S(u) + 1 + dist_T(v)   at first bridging edge (u, v)',
          meaning: 'Exact minimum hops for unweighted symmetric graphs.',
        },
      ],
      proofSketch:
        'Full-layer expansion guarantees every node in front is at exact distance d₁ from S and every node in back is at d₂ from T; any shorter path would have triggered an earlier collision.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Word Ladder, Open the Lock, or unweighted graph with known start & goal',
        recommendedPattern: 'Bidirectional BFS',
        linkedId: 'bidirectional-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Square-root speedup on exponential branching graphs.',
      },
      {
        ifYouSee: 'Weighted graph with an admissible distance heuristic to target',
        recommendedPattern: 'A* Search Algorithm',
        linkedId: 'a-star-search',
        linkedKind: 'algorithm',
        whyItFits: 'Guides weighted exploration toward goal via f = g + h.',
      },
      {
        ifYouSee: 'Multi-source BFS with unknown/multiple goal cells',
        recommendedPattern: 'Tree BFS & DFS Traversals',
        linkedId: 'tree-bfs-dfs',
        linkedKind: 'algorithm',
        whyItFits: 'Standard multi-source BFS starts all sources at depth 0.',
      },
    ],
  },

  'bipartite-graph-coloring': {
    formalDefinition:
      'Bipartite Graph Coloring checks whether an undirected graph G = (V, E) can be 2-colored into two independent sets U and W with all edges crossing between U and W, which holds if and only if G has no odd-length cycles.',
    problemStatementForm:
      'Given conflict edges or an undirected graph (Is Graph Bipartite, Possible Bipartition), partition vertices into two conflict-free groups in O(V + E).',
    logicBoard: [
      {
        step: '01 · Loop All Components',
        condition: 'For each vertex u = 0..V-1',
        action: 'If color[u] === 0, set color[u] = 1 and launch BFS/DFS',
        invariant: 'Handles disconnected multi-component graphs completely',
      },
      {
        step: '02 · Flip Neighbor Color',
        condition: 'Neighbor v has color[v] === 0',
        action: 'Assign color[v] = -color[u] and enqueue/recurse v',
        invariant: 'Every traversed edge connects opposite color sets',
      },
      {
        step: '03 · Odd-Cycle Conflict',
        condition: 'Neighbor v already has color[v] === color[u]',
        action: 'Return false immediately (not bipartite)',
        invariant: 'Same-color edge witnesses an odd-length cycle',
      },
      {
        step: '04 · Confirm Partition',
        condition: 'All vertices colored conflict-free',
        action: 'Return true; U = {color = 1}, W = {color = -1}',
        invariant: 'Exact O(V + E) time, O(V) space',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'König Bipartite Theorem',
          formula: 'G is 2-colorable  ⟺  G contains NO odd-length cycle',
          meaning: 'Every tree and even-cycle graph is automatically bipartite.',
        },
        {
          name: 'BFS Parity Coloring',
          formula: 'color(v) = (-1)^{dist(root, v)}',
          meaning: 'Any edge connecting same-level BFS nodes closes an odd cycle of length 2k + 1.',
        },
      ],
      proofSketch:
        'Alternating 2 colors around an odd cycle forces an adjacent clash. Without odd cycles, BFS distance parity mod 2 produces a valid 2-coloring across every edge.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Two-team conflict partitioning, Possible Bipartition, or odd-cycle check',
        recommendedPattern: 'Bipartite Graph Coloring',
        linkedId: 'bipartite-graph-coloring',
        linkedKind: 'algorithm',
        whyItFits: 'Exact O(V + E) 2-coloring with zero backtracking.',
      },
      {
        ifYouSee: 'Maximum matching / assignment between two disjoint sets',
        recommendedPattern: 'Hopcroft-Karp & Hungarian Matching',
        linkedId: 'hopcroft-karp-hungarian',
        linkedKind: 'algorithm',
        whyItFits: 'Runs directly over the bipartite partition U × W.',
      },
      {
        ifYouSee: 'Online dynamic edge additions testing bipartiteness',
        recommendedPattern: 'Union-Find (DSU)',
        linkedId: 'union-find-dsu',
        linkedKind: 'algorithm',
        whyItFits: '2n twin-node DSU checks incremental bipartiteness in O(α(V)).',
      },
    ],
  },

  'avl-red-black-trees': {
    formalDefinition:
      'AVL and Red-Black Trees are self-balancing Binary Search Trees enforcing O(log n) worst-case height after every insert/delete via O(1) rotations (LL, RR, LR, RL) and height-balance or black-height invariants.',
    problemStatementForm:
      'Maintain a dynamic ordered map/set supporting O(log n) insert, delete, predecessor/successor, floor/ceiling, and range scans without O(n) BST degeneration.',
    logicBoard: [
      {
        step: '01 · Standard BST Update',
        condition: 'Inserting or deleting key k',
        action: 'Descend O(h) to leaf/in-order successor and apply mutation',
        invariant: 'BST ordering left < node < right preserved before rebalancing',
      },
      {
        step: '02 · Check Balance / Color',
        condition: 'AVL |h(L) - h(R)| > 1 OR Red-Black red parent with red child',
        action: 'Classify LL/RR (single rotation), LR/RL (double rotation), or RB recolor',
        invariant: 'Rotations strictly preserve in-order key sequence',
      },
      {
        step: '03 · Apply O(1) Rotation',
        condition: 'Rebalancing triggered at ancestor z',
        action: 'Rewire 3 child pointers and refresh heights/colors bottom-up',
        invariant: 'AVL insert needs ≤ 1 rotation; RB insert/delete needs ≤ 2 / ≤ 3 rotations',
      },
      {
        step: '04 · Workload Selection',
        condition: 'Read-heavy vs write-heavy ordered index',
        action: 'AVL (h < 1.44 log₂ n) for read-heavy; Red-Black (h ≤ 2 log₂ n, fewer writes) for TreeMap/std::map',
        invariant: 'Both guarantee O(log n) worst-case search, insert, and delete',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'AVL Fibonacci Height Bound',
          formula: 'N(h) = F_{h+3} - 1  ⟹  h < 1.44 · log₂(n + 2)',
          meaning: 'Minimum nodes at height h grows at golden ratio φ^h.',
        },
        {
          name: 'Red-Black Height Bound',
          formula: 'bh(root) ≥ h / 2,  n ≥ 2^{bh} - 1  ⟹  h ≤ 2 · log₂(n + 1)',
          meaning: 'Longest root-to-leaf path is at most twice the shortest path.',
        },
      ],
      proofSketch:
        'Because every null path shares black-height bh and no two red nodes are adjacent, total height h ≤ 2·bh ≤ 2 log₂(n + 1), proving O(log n) worst-case depth.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Ordered map/set needing predecessor, ceiling, or dynamic rank queries',
        recommendedPattern: 'AVL & Red-Black Trees',
        linkedId: 'avl-red-black-trees',
        linkedKind: 'algorithm',
        whyItFits: 'Guarantees O(log n) worst-case ordered operations.',
      },
      {
        ifYouSee: 'Lock-free / concurrent ordered index without rotation locks',
        recommendedPattern: 'Skip Lists',
        linkedId: 'skip-list',
        linkedKind: 'algorithm',
        whyItFits: 'Probabilistic tower pointers simplify concurrent updates (Redis ZSET / LevelDB).',
      },
      {
        ifYouSee: 'Disk-resident database index needing high page fanout',
        recommendedPattern: 'B+ Tree Storage Engine',
        linkedId: 'bplus-tree-storage',
        linkedKind: 'algorithm',
        whyItFits: 'High fanout B cuts disk I/O height to 3–4 pages.',
      },
    ],
  },

  'trie-prefix-autocomplete': {
    formalDefinition:
      'A Trie (Prefix Tree) indexes strings over alphabet Σ via shared prefix paths from a root, delivering O(L) insert, exact search, startsWith, wildcard DFS, and bitwise Max-XOR independent of dictionary size N.',
    problemStatementForm:
      'Given a dictionary of words or 32-bit integers, support O(L) prefix autocomplete, wildcard "." search, word frequency counts, or maximum pairwise XOR.',
    logicBoard: [
      {
        step: '01 · Descend / Allocate Edge',
        condition: 'For each char c of word[0..L-1]',
        action: 'Move curr = curr.children[c] (allocate on insert; return false if missing on search)',
        invariant: 'Depth d uniquely represents exact prefix word[0..d-1]',
      },
      {
        step: '02 · Mark Terminal & Cache',
        condition: 'End of word reached',
        action: 'Set curr.isEnd = true; optionally cache top-K hot completions at each prefix node',
        invariant: 'Top-K caching serves autocomplete in O(L) without subtree DFS',
      },
      {
        step: '03 · Wildcard Branching',
        condition: 'Query contains "." wildcard',
        action: 'Recurse across all existing non-null children for index i + 1',
        invariant: 'Prunes absent alphabet letters automatically',
      },
      {
        step: '04 · Opposite-Bit XOR Greedy',
        condition: '31-bit MSB Binary Trie maximizing num ⊕ y',
        action: 'Follow child (1 - bit) whenever present, else fall back to bit',
        invariant: 'MSB gain 2^k strictly outweighs sum of all lower bits 2^k - 1',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Dictionary-Independent Latency',
          formula: 'T_insert = T_search = T_prefix = O(L),   independent of |D|',
          meaning: 'Query cost scales strictly with query string length L.',
        },
        {
          name: 'MSB Greedy Dominance (Max XOR)',
          formula: '2^k > ∑_{j=0}^{k-1} 2^j = 2^k - 1',
          meaning: 'Maximizing bits top-down from bit 30 to bit 0 guarantees global max XOR.',
        },
      ],
      proofSketch:
        'Every word maps to a deterministic L-edge root path. Shared prefixes collapse into shared ancestors so prefix queries never scan non-matching dictionary entries.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Implement Trie, Search Suggestions, Wildcard Dictionary, or Maximum XOR',
        recommendedPattern: 'Trie Prefix Search & Auto-Complete',
        linkedId: 'trie-prefix-autocomplete',
        linkedKind: 'algorithm',
        whyItFits: 'Shared prefix edges unlock O(L) prefix lookup and greedy bitwise XOR.',
      },
      {
        ifYouSee: 'Search a 2D letter board for hundreds of words simultaneously',
        recommendedPattern: 'Backtracking + Trie Pruning',
        linkedId: 'backtracking-trie',
        linkedKind: 'algorithm',
        whyItFits: 'Fuses board DFS with instant Trie prefix pruning.',
      },
      {
        ifYouSee: 'Match thousands of fixed patterns in a single long text stream',
        recommendedPattern: 'Aho-Corasick Multi-Pattern Matching',
        linkedId: 'aho-corasick',
        linkedKind: 'algorithm',
        whyItFits: 'Adds KMP failure transitions to a Trie for linear multi-pattern scan.',
      },
    ],
  },

  'backtracking-trie': {
    formalDefinition:
      'Backtracking + Trie Pruning couples DFS grid/state exploration with a pre-built dictionary Trie so invalid prefixes abort in O(1) instead of exploring exponential dead branches.',
    problemStatementForm:
      'Given an M × N character board and up to 3×10⁴ dictionary words (Word Search II / Boggle), find all words constructible via simple adjacent paths.',
    logicBoard: [
      {
        step: '01 · Build Dictionary Trie',
        condition: 'Before board traversal',
        action: 'Insert all target words; store word string on terminal node',
        invariant: 'Single board DFS matches all W words concurrently',
      },
      {
        step: '02 · Instant Prefix Prune',
        condition: 'Visiting cell (r, c) with char ch',
        action: 'If !node.children[ch] return immediately; else advance nextNode = node.children[ch]',
        invariant: 'Eliminates dead paths at depth 1–2 in O(1)',
      },
      {
        step: '03 · Collect & Deduplicate',
        condition: 'nextNode.word !== null',
        action: 'Push nextNode.word to results and set nextNode.word = null',
        invariant: 'Prevents duplicate outputs from multiple board paths',
      },
      {
        step: '04 · Mark, Explore, Leaf-Prune',
        condition: 'Recursing 4 neighbors',
        action: 'Mark board[r][c] = "#", explore 4 dirs, restore ch; delete empty Trie leaf',
        invariant: 'Dynamic leaf pruning shrinks the Trie as words are discovered',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Pruned Multi-Word Bound',
          formula: 'T = O(M · N · 4 · 3^{L-1})   (removes × W dictionary factor)',
          meaning: 'Avoids re-scanning the board W separate times.',
        },
      ],
      proofSketch:
        'Any valid word path must have every prefix present in the Trie. Aborting on missing child edges never misses a valid word; in-place cell marking guarantees simple paths.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Word Search II, Boggle solver, or dictionary-pruned grid search',
        recommendedPattern: 'Backtracking + Trie Pruning',
        linkedId: 'backtracking-trie',
        linkedKind: 'algorithm',
        whyItFits: 'Simultaneously searches thousands of words in one pruned DFS.',
      },
      {
        ifYouSee: '1D string segmentation (Word Break II) with overlapping suffixes',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'Memoizes string suffix indices cleanly.',
      },
      {
        ifYouSee: 'Pure subsets/permutations without dictionary prefixes',
        recommendedPattern: 'Backtracking',
        linkedId: 'backtracking',
        linkedKind: 'topic',
        whyItFits: 'Standard choose-explore-unchoose backtracking applies directly.',
      },
    ],
  },

  'dynamic-programming': {
    formalDefinition:
      'Dynamic Programming solves optimization and counting problems with Optimal Substructure and Overlapping Subproblems by computing each unique state once along its topological DAG, turning exponential recursion into polynomial time.',
    problemStatementForm:
      'Given a sequential, capacity, string-alignment, or interval problem (Knapsack, Coin Change, Edit Distance, LCS, House Robber, Stock Trading), compute min/max cost or total ways.',
    logicBoard: [
      {
        step: '01 · Define Minimal State',
        condition: 'Choosing DP dimensions',
        action: 'State dp[s] unambiguously captures all history needed for future choices',
        invariant: 'Markov property holds: transitions depend solely on state s',
      },
      {
        step: '02 · Formulate Transition',
        condition: 'Combining smaller subproblems into dp[s]',
        action: 'Apply min / max / sum over all valid last actions entering s',
        invariant: 'State dependency graph is a strict DAG (acyclic)',
      },
      {
        step: '03 · Seed Base & Sentinels',
        condition: 'Empty prefix / zero capacity boundaries',
        action: 'Set reachable bases to 0 / 1 and unreachable states to +∞ / -∞',
        invariant: 'Unreachable states cannot corrupt min/max comparisons',
      },
      {
        step: '04 · Rolling Space Compression',
        condition: 'Layer i only reads layer i - 1',
        action: 'Roll 2D → 1D (w descending for 0/1 Knapsack, w ascending for Unbounded)',
        invariant: 'Cuts space from O(n·W) to O(W) without altering transition semantics',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Bellman Principle of Optimality',
          formula: 'dp[s] = opt_{s\' → s} ( dp[s\'] + cost(s\' → s) )',
          meaning: 'Every DP is an optimal path/count calculation on an implicit state DAG.',
        },
        {
          name: 'Levenshtein Edit Distance Recurrence',
          formula: 'dp[i][j] = (A[i-1]=B[j-1]) ? dp[i-1][j-1] : 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])',
          meaning: 'Canonical 2-string DP covering delete, insert, and substitute in O(mn).',
        },
      ],
      proofSketch:
        'Induction on topological order of the state DAG: base cases are exact, and evaluating dp[s] after all predecessors s\' guarantees dp[s] equals the global optimum for state s.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Knapsack, Coin Change, Edit Distance, LCS, or Stock K-transactions',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'Caches overlapping subproblems into polynomial state tables.',
      },
      {
        ifYouSee: 'Subset-visited state with n ≤ 20 (TSP / assignment)',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Compresses subset state into an integer bitmask.',
      },
      {
        ifYouSee: 'Longest Increasing Subsequence with n = 10⁵',
        recommendedPattern: 'LIS & Patience Sorting',
        linkedId: 'lis-patience-sorting',
        linkedKind: 'algorithm',
        whyItFits: 'Binary search on minimal tails drops O(n²) → O(n log n).',
      },
    ],
  },

  'greedy-algorithms': {
    formalDefinition:
      'A Greedy Algorithm constructs a global optimum by committing to a locally dominant choice at every step without backtracking, proven valid via Exchange Argument or Greedy-Stays-Ahead induction.',
    problemStatementForm:
      'Given interval scheduling, Jump Game, Gas Station circular tour, Candy, or Partition Labels where a clear dominance key unlocks O(n) or O(n log n) single-pass optimality.',
    logicBoard: [
      {
        step: '01 · Pick Dominance Order',
        condition: 'Items lack natural order',
        action: 'Sort by earliest end time (max intervals), max reach (Jump Game), or net surplus',
        invariant: 'Local choice leaves maximal remaining capacity for future items',
      },
      {
        step: '02 · Exchange Argument Audit',
        condition: 'Verifying greedy validity before coding',
        action: 'Test small counterexamples (e.g., coins {1,3,4} target 6); verify swapping into OPT never worsens cost',
        invariant: 'Abort greedy immediately and switch to DP if any counterexample fails',
      },
      {
        step: '03 · Commit Frontier',
        condition: 'Scanning sorted items',
        action: 'Commit feasible items irreversibly and advance boundary (lastEnd, farthest, tank)',
        invariant: 'O(1) extra state with zero backtracking',
      },
      {
        step: '04 · Two-Pass Neighbor Balance',
        condition: 'Constraints reference both left and right neighbors (e.g., Candy)',
        action: 'Enforce left-to-right pass, then right-to-left taking max(curr, right + 1)',
        invariant: 'Taking max satisfies both directional constraints simultaneously',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Gas Station Existence Theorem',
          formula: '∑ (gas[i] - cost[i]) ≥ 0  ⟹  valid start is index right after global min prefix sum',
          meaning: 'Resetting start whenever tank < 0 locates the unique valid origin in one O(n) pass.',
        },
        {
          name: 'Greedy Stays Ahead (Interval Scheduling)',
          formula: 'end(g_k) ≤ end(o_k)  ∀k ≥ 1  ⟹  |Greedy| ≥ |OPT|',
          meaning: 'Earliest finish time maximizes remaining timeline for all subsequent intervals.',
        },
      ],
      proofSketch:
        'Swapping the first differing choice in any optimal solution OPT with the greedy choice preserves feasibility without decreasing value; induction converts OPT into the greedy solution.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Jump Game I/II, Gas Station, Non-Overlapping Intervals, or Partition Labels',
        recommendedPattern: 'Greedy Algorithms',
        linkedId: 'greedy-algorithms',
        linkedKind: 'algorithm',
        whyItFits: 'Exchange argument holds for O(n) / O(n log n) single-pass optimality.',
      },
      {
        ifYouSee: 'Optimal prefix-free binary code or minimum-cost free rope merging',
        recommendedPattern: 'Huffman Coding',
        linkedId: 'huffman-coding',
        linkedKind: 'algorithm',
        whyItFits: 'Min-Heap merging minimizes weighted path length.',
      },
      {
        ifYouSee: 'Coupled capacity or arbitrary coin denominations breaking exchange argument',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'Evaluates all reachable states when local optimality fails.',
      },
    ],
  },

  'meet-in-the-middle': {
    formalDefinition:
      'Meet-in-the-Middle splits an exponential search of size n (25 ≤ n ≤ 44) into two halves of size n/2, enumerates all 2^{n/2} partial sums independently, and merges them via sorting + binary search / hashing in O(n · 2^{n/2}) time.',
    problemStatementForm:
      'Given n ≤ 40 items asking for exact subset sum, closest subsequence sum, or 4Sum II where O(2^n) times out and huge values (10⁹) block pseudo-polynomial DP.',
    logicBoard: [
      {
        step: '01 · Halve Input',
        condition: '22 < n ≤ 44',
        action: 'Split A into Left = A[0..⌊n/2⌋-1] and Right = A[⌊n/2⌋..n-1]',
        invariant: 'Every subset S decomposes uniquely as S_L ∪ S_R',
      },
      {
        step: '02 · Enumerate Halves',
        condition: 'Generating partial sums (optionally bucketed by chosen count k)',
        action: 'Compute all 2^{|L|} sums in leftSums and 2^{|R|} sums in rightSums',
        invariant: 'Each half runs in O(2^{n/2}) time and memory',
      },
      {
        step: '03 · Index Right Half',
        condition: 'Exact match (Hash Map) vs Closest/Range (Sort)',
        action: 'Hash rightSums for exact lookup OR sort rightSums ascending for binary search',
        invariant: 'Sorting rightSums costs O(n · 2^{n/2})',
      },
      {
        step: '04 · Join Complements',
        condition: 'For each x ∈ leftSums',
        action: 'Binary-search target - x in rightSums (inspecting both idx and idx - 1 for closest)',
        invariant: 'Covers all 2^n full subsets in O(n · 2^{n/2})',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Square-Root Exponential Collapse',
          formula: 'O(2^n)  ⟶  O(n · 2^{n/2})   (n = 40: 10^{12} ⟶ 2 × 10^6 ops)',
          meaning: 'Reduces 1 trillion operations to ~20ms.',
        },
        {
          name: 'Fixed-Cardinality Split Pairing',
          formula: 'k_L + k_R = n/2  ⟹  match Left[k] strictly against Right[n/2 - k]',
          meaning: 'Solves equal-size partition difference minimization cleanly.',
        },
      ],
      proofSketch:
        'Since sum(S_L ∪ S_R) = sum(S_L) + sum(S_R), binary-searching the sorted right sums for every left sum provably evaluates the optimal partner for all 2^n subsets.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Closest Subsequence Sum or Subset Sum with n ≈ 30–40 and values up to 10⁹',
        recommendedPattern: 'Meet-in-the-Middle',
        linkedId: 'meet-in-the-middle',
        linkedKind: 'algorithm',
        whyItFits: 'Independent of value magnitude and exponentially faster than O(2^n).',
      },
      {
        ifYouSee: 'Order-dependent subset DP (TSP) with n ≤ 20',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Handles sequential edge transitions that cannot split cleanly.',
      },
      {
        ifYouSee: 'Large n (1000) with small target sum W ≤ 10⁴',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'O(n·W) DP beats exponential subset enumeration.',
      },
    ],
  },

  'huffman-coding': {
    formalDefinition:
      'Huffman Coding builds an optimal prefix-free binary code tree for symbol frequencies f_1..f_n by repeatedly popping and merging the two lightest nodes from a Min-Heap in O(n log n) time, minimizing weighted path length.',
    problemStatementForm:
      'Given symbol frequencies (lossless compression) or stick/file merge costs (Minimum Cost to Connect Sticks), build the minimum-cost binary merge tree.',
    logicBoard: [
      {
        step: '01 · Seed Min-Heap Leaves',
        condition: 'For each symbol with frequency f_i > 0',
        action: 'Push leaf (f_i, symbol) into Min-Heap',
        invariant: 'Heap exposes the two lightest remaining subtrees in O(log n)',
      },
      {
        step: '02 · Merge Two Lightest',
        condition: 'heap.size > 1',
        action: 'Pop min a and b; push parent(weight = a.w + b.w, left = a, right = b); add a.w + b.w to cost',
        invariant: 'Least frequent symbols land deepest, minimizing ∑ f_i · depth(i)',
      },
      {
        step: '03 · Assign Prefix Codes',
        condition: 'Single root remains (n - 1 merges)',
        action: 'Traverse left = "0", right = "1" (assign "0" for 1-symbol edge case)',
        invariant: 'No codeword is a prefix of another → instantaneous unambiguous decoding',
      },
      {
        step: '04 · Entropy Benchmark',
        condition: 'Checking compression optimality',
        action: 'Verify average bits L_avg satisfies H(X) ≤ L_avg < H(X) + 1',
        invariant: 'Provably optimal among all symbol-by-symbol prefix-free codes',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Weighted Path Length Cost Identity',
          formula: 'Cost(T) = ∑_{i=1}^{n} f_i · depth_T(i) = ∑_{internal u} weight(u)',
          meaning: 'Total merge cost equals exact total encoded bit count.',
        },
        {
          name: 'Shannon Entropy & Kraft Inequality',
          formula: 'H(X) = -∑ p_i log₂ p_i ≤ L_avg < H(X) + 1,   ∑ 2^{-l_i} ≤ 1',
          meaning: 'Tight within 1 bit of theoretical information entropy.',
        },
      ],
      proofSketch:
        'Swapping the two deepest leaves in any optimal tree with the two lowest-frequency symbols never raises ∑ f_i · depth(i). Collapsing them into one combined symbol reduces n to n - 1; induction proves optimality.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Connect Sticks minimum cost, optimal file merging, or lossless prefix coding',
        recommendedPattern: 'Huffman Coding',
        linkedId: 'huffman-coding',
        linkedKind: 'algorithm',
        whyItFits: 'Min-Heap greedy merging is provably optimal.',
      },
      {
        ifYouSee: 'Dictionary compression exploiting repeated multi-character phrases',
        recommendedPattern: 'LZW Compression',
        linkedId: 'lzw-compression',
        linkedKind: 'algorithm',
        whyItFits: 'Encodes repeating substrings dynamically rather than single symbols.',
      },
      {
        ifYouSee: 'Can only merge ADJACENT piles in fixed order (Minimum Cost to Merge Stones)',
        recommendedPattern: 'Dynamic Programming',
        linkedId: 'dynamic-programming',
        linkedKind: 'algorithm',
        whyItFits: 'Adjacency restriction requires Interval DP rather than free Huffman pairing.',
      },
    ],
  },

  'bit-manipulation': {
    formalDefinition:
      'Bit Manipulation applies Boolean bitwise algebra (AND, OR, XOR, NOT, shifts) over binary integer words to execute pair cancellation, Kernighan popcount, power-of-two checks, and compact subset flags in O(1) ALU instructions.',
    problemStatementForm:
      'Given unique-element cancellation, bit counting, carryless addition, or compact bitmask set queries, solve in O(n) time and O(1) space.',
    logicBoard: [
      {
        step: '01 · XOR Pair Cancellation',
        condition: 'Every value appears twice except 1 (or 2) unique values',
        action: 'XOR all values into x; for 2 unique values, partition by rightmost set bit lsb = x & (-x)',
        invariant: 'Pairs cancel via a ⊕ a = 0; two unique numbers split cleanly by lsb',
      },
      {
        step: '02 · Kernighan Bit Clear',
        condition: 'Counting 1-bits or checking power of 2',
        action: 'Loop n &= (n - 1), count++ until n === 0',
        invariant: 'Executes exactly popcount(n) iterations (≤ 32)',
      },
      {
        step: '03 · Carryless Addition',
        condition: 'Computing a + b without "+" operator',
        action: 'While b !== 0: carry = (a & b) << 1; a = a ^ b; b = carry',
        invariant: 'Terminates once carry propagates to 0',
      },
      {
        step: '04 · Bitmask Set Algebra',
        condition: 'Managing subsets of {0..30}',
        action: 'Add: m | (1<<i), Del: m & ~(1<<i), Has: (m >> i) & 1, Flip: m ^ (1<<i)',
        invariant: 'Set union/intersection/difference run in single CPU cycles',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Two’s Complement Lowest-Bit Identities',
          formula: 'n & (n - 1) clears LSB   |   n & (-n) isolates LSB   |   (n > 0 ∧ (n & (n - 1)) = 0) ⟺ n = 2^k',
          meaning: 'Powers Kernighan popcount, Fenwick BIT, and Single Number III.',
        },
        {
          name: 'XOR Group Cancellation',
          formula: 'a ⊕ b ⊕ a = b,   sum_no_carry = a ⊕ b,   carry = (a & b) ≪ 1',
          meaning: 'O(1)-space unique detection and binary full-adder equivalence.',
        },
      ],
      proofSketch:
        'Since -n = ~n + 1 flips all trailing zeros into carries up to the lowest 1-bit while keeping higher bits inverted, n & (-n) isolates exclusively the lowest set bit.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Single Number I/II/III, Counting Bits, Reverse Bits, or Sum of Two Integers',
        recommendedPattern: 'Bit Manipulation',
        linkedId: 'bit-manipulation',
        linkedKind: 'algorithm',
        whyItFits: 'Optimal O(1)-space bitwise algebra.',
      },
      {
        ifYouSee: 'Dynamic prefix sums using i & (-i) bit hops',
        recommendedPattern: 'Fenwick Tree (BIT)',
        linkedId: 'fenwick-tree-bit',
        linkedKind: 'algorithm',
        whyItFits: 'Directly uses LSB arithmetic for O(log n) range sums.',
      },
      {
        ifYouSee: 'State-compressed DP over visited subsets (n ≤ 20)',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Encodes visited sets as integer indices.',
      },
    ],
  },

  'kmp-rabin-karp': {
    formalDefinition:
      'KMP matches pattern P[0..m-1] in text T[0..n-1] in deterministic O(n + m) via the Longest Proper Prefix-Suffix (LPS) failure array so text pointer i never rewinds; Rabin-Karp slides a modular polynomial rolling hash in O(1) per window.',
    problemStatementForm:
      'Given text T and pattern P (or repeated substring period / shortest palindrome / longest duplicate substring), find exact matches without O(n·m) worst-case backtracking.',
    logicBoard: [
      {
        step: '01 · Build LPS Failure Table',
        condition: 'Preprocessing P[0..m-1]',
        action: 'If P[i] === P[len] set lps[i++] = ++len; else if len > 0 fallback len = lps[len-1]; else lps[i++] = 0',
        invariant: 'lps[k] is the longest proper border (prefix = suffix) of P[0..k]',
      },
      {
        step: '02 · Non-Rewinding Scan',
        condition: 'Comparing T[i] and P[j]',
        action: 'Match → i++, j++; Mismatch → if j > 0 set j = lps[j-1], else i++',
        invariant: 'Text index i moves strictly forward; total j fallbacks ≤ n',
      },
      {
        step: '03 · Rabin-Karp Rolling Slide',
        condition: 'Duplicate length binary search or multiple fixed-length patterns',
        action: 'H = ((H - T[i-m]·B^{m-1})·B + T[i]) mod M; verify strings (or double-hash) on hit',
        invariant: 'O(1) per window slide; double-prime hashing drives collision risk < 10⁻¹⁸',
      },
      {
        step: '04 · Overlapping Hit Shift',
        condition: 'Full match j === m reached',
        action: 'Emit match at i - m, then set j = lps[j - 1]',
        invariant: 'Captures all overlapping occurrences in deterministic O(n + m)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'KMP Potential Linearity',
          formula: 'Φ = j;  increments ≤ n,  each fallback lowers j ≥ 1  ⟹  Steps ≤ 2n = O(n + m)',
          meaning: 'Strict worst-case O(n + m) even on adversarial repetitive inputs.',
        },
        {
          name: 'Polynomial Rolling Hash Slide',
          formula: 'H(i+1) = ( B · (H(i) - S[i] · B^{m-1}) + S[i+m] ) mod M',
          meaning: 'Updates fingerprint in O(1) arithmetic.',
        },
      ],
      proofSketch:
        'On mismatch at P[j] ≠ T[i], any valid alignment inside already-matched P[0..j-1] must be a prefix-suffix border of P[0..j-1]. Jumping to maximal border lps[j-1] skips only impossible shifts.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Single pattern search, Shortest Palindrome, or Repeated Substring Pattern',
        recommendedPattern: 'KMP & Rabin-Karp',
        linkedId: 'kmp-rabin-karp',
        linkedKind: 'algorithm',
        whyItFits: 'LPS solves exact matching and string periodicity in O(n + m).',
      },
      {
        ifYouSee: 'Need longest prefix match starting at every index i',
        recommendedPattern: 'Z-Algorithm',
        linkedId: 'z-algorithm',
        linkedKind: 'algorithm',
        whyItFits: 'Z-box computes Z[i] = LCP(S, S[i..]) in O(n).',
      },
      {
        ifYouSee: 'Search thousands of distinct patterns in one text pass',
        recommendedPattern: 'Aho-Corasick Multi-Pattern Matching',
        linkedId: 'aho-corasick',
        linkedKind: 'algorithm',
        whyItFits: 'Extends KMP failure links across an entire Trie.',
      },
    ],
  },

  'zero-one-bfs': {
    formalDefinition:
      '0-1 BFS finds single-source shortest paths on graphs with edge weights strictly in {0, 1} using a deque (push-front for weight 0, push-back for weight 1) in O(V + E) linear time, beating Dijkstra’s O((V + E) log V).',
    problemStatementForm:
      'Given a grid or graph where free moves cost 0 and obstacle removals or direction flips cost 1 (Minimum Cost to Make at Least One Valid Path), compute minimum cost.',
    logicBoard: [
      {
        step: '01 · Seed Deque',
        condition: 'Initializing source s',
        action: 'Set dist[v] = +∞, dist[s] = 0; pushFront(s)',
        invariant: 'Deque holds at most two distance levels simultaneously: d and d + 1',
      },
      {
        step: '02 · Pop Front Minimum',
        condition: 'Deque non-empty',
        action: 'Pop u = deque.popFront(); skip if stale',
        invariant: 'Front always holds global minimum unsettled distance',
      },
      {
        step: '03 · Weight-0 Push Front',
        condition: 'Edge (u, v) has w = 0 and dist[u] < dist[v]',
        action: 'Set dist[v] = dist[u] and pushFront(v)',
        invariant: 'Maintains sorted non-decreasing deque order',
      },
      {
        step: '04 · Weight-1 Push Back',
        condition: 'Edge (u, v) has w = 1 and dist[u] + 1 < dist[v]',
        action: 'Set dist[v] = dist[u] + 1 and pushBack(v)',
        invariant: 'O(1) deque ops replace O(log V) heap → O(V + E) total time',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Two-Level Deque Invariant',
          formula: '∀x ∈ Deque: dist[x] ∈ {d_front, d_front + 1},   sorted front → back',
          meaning: 'Proves deque front behaves identically to Dijkstra’s Min-Heap in O(1).',
        },
        {
          name: 'Linear Shortest-Path Runtime',
          formula: 'T = O(V + E)   (eliminates log V priority-queue factor)',
          meaning: 'Optimal for binary {0, 1} weighted graphs.',
        },
      ],
      proofSketch:
        'Popping front vertex u at distance d only pushes distance d to front or d + 1 to back, inductively preserving sorted deque order and guaranteeing exact Dijkstra settlement order in O(V + E).',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Grid path with free arrows (0) and direction changes / wall breaks (1)',
        recommendedPattern: '0-1 BFS',
        linkedId: 'zero-one-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Linear O(V + E) without priority-queue overhead.',
      },
      {
        ifYouSee: 'General non-negative edge weights (1..10⁶)',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Min-Heap generalizes to arbitrary positive weights.',
      },
      {
        ifYouSee: 'All edges unweighted (all weight 1)',
        recommendedPattern: 'Bidirectional BFS',
        linkedId: 'bidirectional-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Standard FIFO queue or bidirectional BFS suffices.',
      },
    ],
  },

  'kruskals-mst': {
    formalDefinition:
      'Kruskal’s Algorithm computes a Minimum Spanning Tree by sorting edges ascending by weight and greedily uniting distinct DSU components until V - 1 edges connect all vertices in O(E log E) time.',
    problemStatementForm:
      'Given weighted undirected edges (Connecting Cities With Minimum Cost), connect all V vertices with minimum total edge weight.',
    logicBoard: [
      {
        step: '01 · Sort Edges',
        condition: 'Edge list E = [(u, v, w)]',
        action: 'Sort E ascending by w',
        invariant: 'Lightest crossing edges are inspected first',
      },
      {
        step: '02 · DSU Cycle Test',
        condition: 'Next lightest edge (u, v, w)',
        action: 'Test find(u) !== find(v)',
        invariant: 'Distinct roots ⟺ edge creates no cycle',
      },
      {
        step: '03 · Commit Edge',
        condition: 'find(u) !== find(v)',
        action: 'union(u, v), totalCost += w, edgesUsed++',
        invariant: 'By the Cut Property, lightest crossing edge belongs to an MST',
      },
      {
        step: '04 · Connectivity Check',
        condition: 'edgesUsed === V - 1 or edges exhausted',
        action: 'Return totalCost if edgesUsed === V - 1 else -1 (disconnected)',
        invariant: 'O(E log E + E α(V)) = O(E log V)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'MST Cut Property',
          formula: '∀ cut (S, V\\S): argmin_{e ∈ δ(S)} w(e)  belongs to some MST',
          meaning: 'Guarantees greedy acceptance of the lightest non-cycle edge is safe.',
        },
        {
          name: 'Sparse-Graph Complexity',
          formula: 'T = O(E log E + E · α(V)) = O(E log V)',
          meaning: 'Excels on sparse graphs and edge-list inputs.',
        },
      ],
      proofSketch:
        'When Kruskal picks (u, v), it is the lightest edge crossing cut (comp(u), V\\comp(u)); by the Cut Property it belongs to an MST extending the current forest.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Sparse graph MST, edge-list input, or critical/pseudo-critical MST edges',
        recommendedPattern: 'Kruskal’s MST',
        linkedId: 'kruskals-mst',
        linkedKind: 'algorithm',
        whyItFits: 'Simple sort + DSU excels on edge lists.',
      },
      {
        ifYouSee: 'Dense complete graph (all pairs of 2D points, E ≈ V²)',
        recommendedPattern: 'Prim’s MST',
        linkedId: 'prims-mst',
        linkedKind: 'algorithm',
        whyItFits: 'O(V²) Prim avoids materializing and sorting V² edges.',
      },
      {
        ifYouSee: 'Unweighted dynamic connectivity',
        recommendedPattern: 'Union-Find (DSU)',
        linkedId: 'union-find-dsu',
        linkedKind: 'algorithm',
        whyItFits: 'Direct DSU without sorting runs in O(E α(V)).',
      },
    ],
  },

  'bellman-ford': {
    formalDefinition:
      'Bellman-Ford computes single-source shortest paths on graphs with possible negative edge weights by relaxing all E edges across V - 1 passes in O(V·E) time, detecting negative cycles via a V-th pass.',
    problemStatementForm:
      'Given a directed weighted graph with negative edges (currency arbitrage, Cheapest Flights Within K Stops), find shortest paths or detect a negative-weight cycle.',
    logicBoard: [
      {
        step: '01 · Init Distances',
        condition: 'Source s',
        action: 'Set dist[v] = +∞, dist[s] = 0',
        invariant: 'After pass k, dist[v] ≤ shortest path using ≤ k edges',
      },
      {
        step: '02 · Relax V-1 Passes',
        condition: 'For pass = 1..V-1 (or K+1 for K-stops)',
        action: 'Relax every (u, v, w): dist[u] + w < dist[v] (use prev snapshot for exact K-stops!)',
        invariant: 'Early-exit if zero edges relax during a pass',
      },
      {
        step: '03 · Negative Cycle Probe',
        condition: 'Pass V',
        action: 'If any reachable edge still relaxes, report negative-weight cycle',
        invariant: 'Simple paths use ≤ V - 1 edges; improvement on pass V proves a negative cycle',
      },
      {
        step: '04 · Arbitrage Transform',
        condition: 'Multiplicative exchange rates r(u, v)',
        action: 'Set w(u, v) = -log(r(u, v)) so product > 1 maps to negative sum < 0',
        invariant: 'Negative-cycle check finds risk-free arbitrage loops',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'K-Edge Shortest Path DP',
          formula: 'dist_k[v] = min( dist_{k-1}[v],  min_{(u→v)∈E} (dist_{k-1}[u] + w(u, v)) )',
          meaning: 'Bellman-Ford is bottom-up DP over edge count k ∈ [0..V-1].',
        },
        {
          name: 'Arbitrage Log Transform',
          formula: '∏ r_i > 1  ⟺  ∑ (-log r_i) < 0',
          meaning: 'Turns multiplicative rate cycles into additive negative cycles.',
        },
      ],
      proofSketch:
        'Induction on pass k shows dist[v] bounds every path of ≤ k edges. Without negative cycles, every shortest path is simple (≤ V - 1 edges), so V - 1 passes guarantee exact convergence.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Negative weights, currency arbitrage, or Cheapest Flights Within K Stops',
        recommendedPattern: 'Bellman-Ford Algorithm',
        linkedId: 'bellman-ford',
        linkedKind: 'algorithm',
        whyItFits: 'Handles negative weights and strict hop limits safely.',
      },
      {
        ifYouSee: 'All weights non-negative (w ≥ 0)',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Cuts O(VE) down to O((V + E) log V).',
      },
      {
        ifYouSee: 'All-pairs shortest paths on sparse graph with negative edges',
        recommendedPattern: 'Johnson’s Algorithm',
        linkedId: 'johnsons-all-pairs',
        linkedKind: 'algorithm',
        whyItFits: 'Single Bellman-Ford reweighting enables V fast Dijkstras.',
      },
    ],
  },

  'floyd-warshall': {
    formalDefinition:
      'Floyd-Warshall computes All-Pairs Shortest Paths (APSP) between every pair (i, j) in O(V³) time and O(V²) space via DP over the allowed intermediate vertex prefix {0..k}.',
    problemStatementForm:
      'Given a small dense weighted graph (V ≤ 400, possibly negative edges), compute all-pairs shortest distances, transitive closure, or threshold-reachable neighbor counts.',
    logicBoard: [
      {
        step: '01 · Seed Distance Matrix',
        condition: 'V × V matrix dist',
        action: 'dist[i][i] = 0, dist[i][j] = min(w(i, j)) for direct edges, +∞ otherwise',
        invariant: 'Base state allows 0 intermediate vertices',
      },
      {
        step: '02 · Outer K Loop',
        condition: 'k = 0..V-1 MUST be outermost',
        action: 'For all i, j: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])',
        invariant: 'After pass k, dist[i][j] is optimal using intermediates strictly inside {0..k}',
      },
      {
        step: '03 · Negative Cycle Test',
        condition: 'After all V outer loops',
        action: 'Check if any dist[i][i] < 0',
        invariant: 'Negative diagonal proves a negative cycle passing through i',
      },
      {
        step: '04 · Reconstruct Paths',
        condition: 'Actual vertex path required',
        action: 'Maintain next[i][j] = j initially; set next[i][j] = next[i][k] on relaxation',
        invariant: 'Walks shortest path in O(hops)',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Intermediate-Set DP Recurrence',
          formula: 'D^{(k)}[i][j] = min( D^{(k-1)}[i][j],  D^{(k-1)}[i][k] + D^{(k-1)}[k][j] )',
          meaning: 'Optimal path either bypasses k or splits cleanly at k.',
        },
        {
          name: 'Cubic Matrix Closure',
          formula: 'T = Θ(V³),   Space = Θ(V²)   (ideal for V ≤ 400)',
          meaning: 'In-place update is sound because row/col k stays fixed during pass k.',
        },
      ],
      proofSketch:
        'Induct on k: any simple path using intermediates in {0..k} either omits k or visits k once, decomposing into two optimal paths using intermediates in {0..k-1}.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'All-pairs shortest paths with V ≤ 400 (Find the City, Course Schedule IV)',
        recommendedPattern: 'Floyd-Warshall (All-Pairs)',
        linkedId: 'floyd-warshall',
        linkedKind: 'algorithm',
        whyItFits: 'Concise O(V³) triple loop with negative-edge support.',
      },
      {
        ifYouSee: 'All-pairs shortest paths on large sparse graph (V = 5000)',
        recommendedPattern: 'Johnson’s Algorithm',
        linkedId: 'johnsons-all-pairs',
        linkedKind: 'algorithm',
        whyItFits: 'O(V·E log V) beats O(V³) on sparse graphs.',
      },
      {
        ifYouSee: 'Single-source shortest path only',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Avoids computing unneeded V² pairs.',
      },
    ],
  },

  'tarjan-kosaraju-scc': {
    formalDefinition:
      'Tarjan’s (single-pass low-link DFS) and Kosaraju’s (two-pass transpose DFS) partition any directed graph into maximal Strongly Connected Components (SCCs) in O(V + E) time, condensing all cycles into an acyclic DAG.',
    problemStatementForm:
      'Given a directed graph, group mutually reachable vertices, solve 2-SAT boolean satisfiability, or find minimum edges to make a graph strongly connected.',
    logicBoard: [
      {
        step: '01 · Init Discovery & Low',
        condition: 'Tarjan DFS visits u',
        action: 'disc[u] = low[u] = ++timer; stack.push(u); onStack[u] = true',
        invariant: 'low[u] tracks earliest discovery time reachable via ≤ 1 stack back-edge',
      },
      {
        step: '02 · Propagate Low-Link',
        condition: 'Edge u → v',
        action: 'Unvisited → dfs(v), low[u] = min(low[u], low[v]); else if onStack[v] → low[u] = min(low[u], disc[v])',
        invariant: 'Cross-edges to already-popped SCCs (onStack === false) are ignored',
      },
      {
        step: '03 · Pop Complete SCC',
        condition: 'Post-DFS: low[u] === disc[u]',
        action: 'Pop stack until u is popped; assign shared compId to popped vertices',
        invariant: 'Tarjan emits SCCs in reverse topological order of condensation DAG',
      },
      {
        step: '04 · 2-SAT Evaluation',
        condition: 'Clauses (a ∨ b) encoded as ¬a → b and ¬b → a',
        action: 'Unsat iff compId[x] === compId[¬x]; else assign true to whichever finishes earlier',
        invariant: 'Solves 2-SAT in linear O(V + E) time',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Tarjan Low-Link Recurrence',
          formula: 'low[u] = min( disc[u],  min_{tree u→v} low[v],  min_{onStack u→w} disc[w] )',
          meaning: 'u is the unique DFS root of its SCC iff low[u] === disc[u].',
        },
        {
          name: '2-SAT Implication Criterion',
          formula: '(a ∨ b) ⟺ (¬a → b) ∧ (¬b → a);   SAT ⟺ ∀x: SCC(x) ≠ SCC(¬x)',
          meaning: 'Reduces 2-CNF satisfiability directly to linear SCC decomposition.',
        },
      ],
      proofSketch:
        'Every vertex in an SCC reaches its first-discovered DFS root r (forcing low[v] ≤ disc[r]), while r cannot reach any lower-disc node still on the stack, so low[r] = disc[r] pops the exact SCC.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Strongly Connected Components, 2-SAT, or collapsing directed cycles into a DAG',
        recommendedPattern: 'Tarjan & Kosaraju SCC',
        linkedId: 'tarjan-kosaraju-scc',
        linkedKind: 'algorithm',
        whyItFits: 'Single-pass O(V + E) decomposition and reverse topological order.',
      },
      {
        ifYouSee: 'Undirected graph critical bridges or articulation points',
        recommendedPattern: 'Tarjan’s Bridge-Finding Algorithm',
        linkedId: 'tarjan-bridges-articulation',
        linkedKind: 'algorithm',
        whyItFits: 'Uses disc/low-link tuned for undirected parent-edge skipping.',
      },
      {
        ifYouSee: 'Graph is already guaranteed acyclic (DAG)',
        recommendedPattern: 'Topological Sort (Kahn)',
        linkedId: 'graph-topo-sort',
        linkedKind: 'algorithm',
        whyItFits: 'In-degree BFS is simpler when no cycles need condensing.',
      },
    ],
  },

  'a-star-search': {
    formalDefinition:
      'A* Search guides single-pair shortest path search via priority f(u) = g(u) + h(u), where g(u) is exact cost from start and h(u) is an admissible heuristic (0 ≤ h(u) ≤ h*(u)), guaranteeing optimality while pruning away-from-goal nodes.',
    problemStatementForm:
      'Given a weighted map, grid, or state-space puzzle (8-puzzle, robotics routing) with an admissible goal-distance heuristic, find the exact shortest path rapidly.',
    logicBoard: [
      {
        step: '01 · Choose Admissible h(u)',
        condition: '4-dir grid · 8-dir grid · Euclidean plane',
        action: 'Pick Manhattan |Δx|+|Δy| (4-dir), Octile (8-dir), or Euclidean √(Δx²+Δy²) (free)',
        invariant: 'h(u) ≤ trueDist(u, T) guarantees optimal first extraction of T',
      },
      {
        step: '02 · Pop Lowest f(u)',
        condition: 'Min-Heap keyed by f(u) = g(u) + h(u)',
        action: 'Pop u; if u === T immediately return g[T]',
        invariant: 'Consistent h(u) ≤ w(u,v) + h(v) settles each node at most once',
      },
      {
        step: '03 · Relax Neighbors',
        condition: 'Neighbor (v, w) of u',
        action: 'If g[u] + w < g[v], update g[v] = g[u] + w, parent[v] = u, push (g[v] + h(v), v)',
        invariant: 'Mathematically equivalent to Dijkstra on w\'(u, v) = w(u, v) + h(v) - h(u) ≥ 0',
      },
      {
        step: '04 · Heuristic Bound Check',
        condition: 'No heuristic available vs tight heuristic',
        action: 'h = 0 degenerates cleanly to Dijkstra; tighter admissible h strictly expands fewer nodes',
        invariant: 'Never overestimate h(u) > h*(u) when exact optimality is required',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'A* Evaluation & Consistency',
          formula: 'f(u) = g(u) + h(u),   Admissible: h(u) ≤ h*(u),   Consistent: h(u) ≤ w(u, v) + h(v)',
          meaning: 'Consistency guarantees f-values are monotonically non-decreasing along paths.',
        },
        {
          name: 'Potential Reweighting Equivalence',
          formula: 'w\'(u, v) = w(u, v) + h(v) - h(u) ≥ 0',
          meaning: 'Proves consistent A* is Dijkstra on potential-shifted non-negative weights.',
        },
      ],
      proofSketch:
        'If goal T were popped with g(T) > g*(T), some unexpanded vertex u on an optimal path would sit in the heap with f(u) = g*(u) + h(u) ≤ g*(u) + h*(u) = g*(T) < f(T), contradicting T being minimum.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'GPS navigation, game grid routing, or sliding-tile puzzle with goal heuristic',
        recommendedPattern: 'A* Search Algorithm',
        linkedId: 'a-star-search',
        linkedKind: 'algorithm',
        whyItFits: 'Goal heuristic prunes vast away-from-target regions while preserving optimality.',
      },
      {
        ifYouSee: 'Weighted graph lacking geometric coordinates or heuristic',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'A* with h = 0 simplifies directly to Dijkstra.',
      },
      {
        ifYouSee: 'Unweighted graph with known start and target',
        recommendedPattern: 'Bidirectional BFS',
        linkedId: 'bidirectional-bfs',
        linkedKind: 'algorithm',
        whyItFits: 'Meets in the middle without needing a domain heuristic.',
      },
    ],
  },

  'max-flow-edmonds-karp': {
    formalDefinition:
      'Maximum Flow algorithms (Ford-Fulkerson, Edmonds-Karp BFS augmenting paths, Dinic’s layered blocking flows) push flow from S to T through a residual network with reverse edges until no S→T path remains, simultaneously proving the Minimum S-T Cut.',
    problemStatementForm:
      'Given a directed capacitated network (bandwidth routing, edge-disjoint paths, min-cut segmentation, multi-capacity matching), maximize S→T flow or minimize S-T cut.',
    logicBoard: [
      {
        step: '01 · Construct Residual Network',
        condition: 'Each directed edge u → v with capacity c',
        action: 'Add forward edge (u → v, cap = c) paired with reverse edge (v → u, cap = 0)',
        invariant: 'Reverse edge enables later paths to undo/reroute suboptimal earlier flow',
      },
      {
        step: '02 · Shortest Augmenting / Level Graph',
        condition: 'Edmonds-Karp (BFS) or Dinic (BFS levels + DFS blocking flow)',
        action: 'BFS from S over edges with residual cap > 0; stop if T unreachable',
        invariant: 'Edmonds-Karp runs ≤ O(VE) augmentations; Dinic runs ≤ V level phases',
      },
      {
        step: '03 · Push Bottleneck Δ',
        condition: 'Augmenting path P found',
        action: 'Compute Δ = min cap along P; subtract Δ forward, add Δ reverse',
        invariant: 'Flow conservation holds at every non-terminal vertex',
      },
      {
        step: '04 · Extract Exact Min-Cut',
        condition: 'Final residual BFS cannot reach T',
        action: 'Let R = S-reachable vertices in residual graph; edges R → V\\R form exact Min-Cut',
        invariant: 'Max-Flow Min-Cut Theorem: maxFlow === minCutCapacity',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Max-Flow Min-Cut Theorem',
          formula: 'max |f| = min_{(S, T) cut} ∑_{u ∈ S, v ∈ T} c(u, v)',
          meaning: 'Maximum throughput strictly equals minimum bottleneck cut capacity.',
        },
        {
          name: 'Polynomial Flow Complexity',
          formula: 'Edmonds-Karp: O(V · E²)   |   Dinic: O(V² · E)   |   Unit Dinic: O(E √V)',
          meaning: 'Avoids Ford-Fulkerson’s O(E · maxFlow) pseudo-polynomial trap.',
        },
      ],
      proofSketch:
        'No residual S→T path implies every edge leaving S-reachable set R is saturated and every edge entering R carries zero flow, making total flow equal cut(R, V\\R)—proving optimality by weak duality.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Network capacity, edge/vertex disjoint paths, min-cut, or project selection',
        recommendedPattern: 'Max Flow (Edmonds-Karp / Dinic)',
        linkedId: 'max-flow-edmonds-karp',
        linkedKind: 'algorithm',
        whyItFits: 'Residual reverse edges guarantee global optimality and yield Min-Cut.',
      },
      {
        ifYouSee: 'Unweighted 1-to-1 bipartite matching',
        recommendedPattern: 'Hopcroft-Karp & Hungarian Matching',
        linkedId: 'hopcroft-karp-hungarian',
        linkedKind: 'algorithm',
        whyItFits: 'Specialized O(E √V) bipartite matching.',
      },
      {
        ifYouSee: 'Single shortest path rather than parallel capacity',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Single-path minimum weight uses Dijkstra.',
      },
    ],
  },

  'prims-mst': {
    formalDefinition:
      'Prim’s Algorithm grows a Minimum Spanning Tree from one root by repeatedly attaching the minimum-weight edge crossing from the visited tree set S to an unvisited vertex in V\\S, running in O((V + E) log V) with a heap or O(V²) on dense graphs.',
    problemStatementForm:
      'Given a dense or adjacency-list weighted undirected graph (connecting N 2D points via Manhattan distance), construct an MST without allocating O(V²) edge lists.',
    logicBoard: [
      {
        step: '01 · Seed Root',
        condition: 'Start at vertex 0',
        action: 'Set minEdge[v] = +∞, minEdge[0] = 0, visited = false[]; push (0, 0)',
        invariant: 'minEdge[v] tracks lightest known edge from v to active MST set S',
      },
      {
        step: '02 · Attach Closest Vertex',
        condition: 'Pop (w, u) from heap (or linear scan min unvisited on dense graph)',
        action: 'If visited[u] continue; mark visited[u] = true, totalCost += w',
        invariant: 'By the Cut Property, edge w belongs to an MST',
      },
      {
        step: '03 · Refresh Cut Weights',
        condition: 'Unvisited neighbor (v, weight) of u',
        action: 'If weight < minEdge[v], update minEdge[v] = weight and push (weight, v)',
        invariant: 'Key is edge weight w(u, v) ONLY, NOT cumulative path dist[u] + w',
      },
      {
        step: '04 · Dense Array Mode',
        condition: 'Complete graph E = V(V-1)/2',
        action: 'Use O(V²) array-scan Prim in O(V) space instead of O(V² log V) heap',
        invariant: 'Zero edge-list allocation and superior cache speed on dense graphs',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Prim vs Dijkstra Key Contrast',
          formula: 'Prim: key[v] = min(key[v], w(u, v))   |   Dijkstra: dist[v] = min(dist[v], dist[u] + w(u, v))',
          meaning: 'Single-term difference separates MST from Shortest-Path Tree.',
        },
        {
          name: 'Sparse vs Dense Runtime',
          formula: 'Heap Prim: O((V + E) log V)   |   Dense Array Prim: O(V²)',
          meaning: 'Beats Kruskal’s O(V² log V) on complete 2D point clouds.',
        },
      ],
      proofSketch:
        'Each step selects the lightest edge crossing cut (S, V\\S); by the Cut Property it is safe for an MST extending S, and V - 1 additions complete the spanning tree.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Dense graph MST or Min Cost to Connect All Points (complete Manhattan graph)',
        recommendedPattern: 'Prim’s MST',
        linkedId: 'prims-mst',
        linkedKind: 'algorithm',
        whyItFits: 'O(V²) Prim runs in O(V) space without sorting V² edges.',
      },
      {
        ifYouSee: 'Sparse graph given as an edge list',
        recommendedPattern: 'Kruskal’s MST',
        linkedId: 'kruskals-mst',
        linkedKind: 'algorithm',
        whyItFits: 'Edge sorting + DSU is faster and cleaner on sparse graphs.',
      },
      {
        ifYouSee: 'Minimize distance from one root to every vertex',
        recommendedPattern: 'Dijkstra Shortest Path',
        linkedId: 'dijkstra-shortest-path',
        linkedKind: 'algorithm',
        whyItFits: 'Minimizes root-to-node path sums rather than total tree weight.',
      },
    ],
  },

  'hopcroft-karp-hungarian': {
    formalDefinition:
      'Hopcroft-Karp finds Maximum Cardinality Bipartite Matching in O(E √V) via phased multi-source BFS + vertex-disjoint DFS; the Hungarian (Kuhn-Munkres) Algorithm computes Minimum-Weight Perfect Matching in O(n³) using dual vertex potentials.',
    problemStatementForm:
      'Given N workers and N tasks (unweighted compatibility or N × N cost matrix), compute maximum pairings or minimum-cost 1-to-1 assignment.',
    logicBoard: [
      {
        step: '01 · Weighted vs Unweighted',
        condition: 'Binary compatibility vs N × N cost matrix',
        action: 'Pick Hopcroft-Karp (O(E √V)) for unweighted OR Hungarian (O(n³)) for weighted',
        invariant: 'Polynomial worst-case beats O(n·2^n) DP when n > 20',
      },
      {
        step: '02 · Hopcroft-Karp Layered BFS',
        condition: 'All unmatched left vertices U_free',
        action: 'BFS alternating unmatched (L→R) and matched (R→L) edges to find shortest augmenting length d',
        invariant: 'Shortest augmenting path length strictly increases each phase',
      },
      {
        step: '03 · Disjoint DFS Flip',
        condition: 'Layer graph reaches free right vertices',
        action: 'DFS along strict layers flipping matched ↔ unmatched edges on maximal disjoint paths',
        invariant: 'At most 2√V phases occur → O(E √V) total time',
      },
      {
        step: '04 · Hungarian Dual Update',
        condition: 'Weighted assignment C[i][j]',
        action: 'Maintain u[i] + v[j] ≤ C[i][j]; shift potentials by min slack δ to expose new tight edges',
        invariant: 'Complementary slackness proves global minimum cost at full match',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'König’s Min Vertex Cover Theorem',
          formula: '|Max Matching| = |Min Vertex Cover|   (in every bipartite graph)',
          meaning: 'Directly solves grid rook/domino placement and minimum line-cover problems.',
        },
        {
          name: 'Hungarian LP Dual Invariant',
          formula: 'u[i] + v[j] ≤ C[i][j]  ∀(i, j),   Optimal ⟺ ∑(u[i] + v[j]) = ∑ C[i][match(i)]',
          meaning: 'Strong LP duality guarantees global minimum assignment cost.',
        },
      ],
      proofSketch:
        'After √V Hopcroft-Karp phases, every remaining augmenting path has length > √V; since M ⊕ M* decomposes into vertex-disjoint augmenting paths, ≤ √V remain, bounding phases by 2√V.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Worker-task assignment, Campus Bikes II (large n), or domino grid tiling',
        recommendedPattern: 'Hopcroft-Karp & Hungarian Matching',
        linkedId: 'hopcroft-karp-hungarian',
        linkedKind: 'algorithm',
        whyItFits: 'Polynomial O(E √V) / O(n³) handles large n where Bitmask DP fails.',
      },
      {
        ifYouSee: 'Small n ≤ 18 weighted assignment',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Compact O(n · 2^n) DP is quicker to code when n ≤ 18.',
      },
      {
        ifYouSee: 'Multi-capacity assignment (each worker takes k_i jobs)',
        recommendedPattern: 'Max Flow (Edmonds-Karp / Dinic)',
        linkedId: 'max-flow-edmonds-karp',
        linkedKind: 'algorithm',
        whyItFits: 'Edge capacity k_i generalizes 1-to-1 matching naturally.',
      },
    ],
  },

  'eulerian-hierholzer': {
    formalDefinition:
      'Hierholzer’s Algorithm constructs an Eulerian Trail or Circuit (visiting every EDGE exactly once) in O(V + E) time by greedily consuming edges and appending vertices in post-order upon hitting dead ends, seamlessly splicing closed sub-cycles.',
    problemStatementForm:
      'Given flight tickets (Reconstruct Itinerary), domino pairs, or De Bruijn codes (Cracking the Safe), find a sequence traversing every single edge exactly once.',
    logicBoard: [
      {
        step: '01 · Degree Feasibility Audit',
        condition: 'Checking directed (or undirected) degrees',
        action: 'Directed trail: ≤1 node out-in=1 (start), ≤1 node in-out=1 (end), rest in=out. Undirected: 0 or 2 odd degrees',
        invariant: 'Necessary and sufficient condition (with edge connectivity) for Eulerian tour',
      },
      {
        step: '02 · Consume Edges Greedily',
        condition: 'Vertex u has unused outgoing edges',
        action: 'Pop next edge u → v permanently (Min-Heap / reverse-sorted list for lex smallest) and advance to v',
        invariant: 'Every edge deleted once → O(E) traversal',
      },
      {
        step: '03 · Post-Order Push on Dead End',
        condition: 'u has 0 remaining outgoing edges',
        action: 'Push u onto result stack and backtrack',
        invariant: 'Sink lands last; side cycles splice cleanly at their attachment vertex',
      },
      {
        step: '04 · Reverse Trail',
        condition: 'DFS/stack completes',
        action: 'Reverse result and verify result.length === E + 1',
        invariant: 'Produces exact Eulerian trail in O(E log E) sorted or O(V + E) unsorted',
      },
    ],
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Eulerian Degree Characterization',
          formula: 'Circuit: ∀v, deg⁺(v) = deg⁻(v)   |   Trail: ∃!s (deg⁺-deg⁻=1), ∃!t (deg⁻-deg⁺=1)',
          meaning: 'O(V + E) existence check before traversal.',
        },
        {
          name: 'De Bruijn Sequence Length',
          formula: '|DeBruijn(k, n)| = k^n + n - 1   (Eulerian circuit on k^{n-1} nodes)',
          meaning: 'Shortest superstring containing all k^n length-n codes.',
        },
      ],
      proofSketch:
        'Walking until stuck terminates at the unique sink t (or start s for a circuit). Remaining unused edges decompose into closed balanced sub-circuits intersecting the current trail; post-order backtracking splices every sub-circuit cleanly.',
    },
    patternRecommendations: [
      {
        ifYouSee: 'Reconstruct Itinerary, Valid Arrangement of Pairs, or Cracking the Safe',
        recommendedPattern: 'Hierholzer’s Eulerian Path',
        linkedId: 'eulerian-hierholzer',
        linkedKind: 'algorithm',
        whyItFits: 'Visits every EDGE once in O(E) without exponential backtracking.',
      },
      {
        ifYouSee: 'Visit every VERTEX once (Hamiltonian Path / TSP)',
        recommendedPattern: 'Bitmask DP',
        linkedId: 'bitmask-dp',
        linkedKind: 'algorithm',
        whyItFits: 'Vertex-once tours are NP-hard and require Bitmask DP.',
      },
      {
        ifYouSee: 'Linear DAG vertex ordering without edge-tour requirement',
        recommendedPattern: 'Topological Sort (Kahn)',
        linkedId: 'graph-topo-sort',
        linkedKind: 'algorithm',
        whyItFits: 'Simpler O(V + E) in-degree peeling suffices for DAGs.',
      },
    ],
  },
};
