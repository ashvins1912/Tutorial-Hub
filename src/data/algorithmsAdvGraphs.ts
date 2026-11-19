import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';

export const ADV_GRAPH_ALGORITHMS: AlgorithmDefinition[] = [
  // 21. Bellman-Ford Algorithm
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    shortName: 'Bellman-Ford',
    category: 'Advanced Graph Algorithms',
    visualType: 'weighted-network',
    tagline: 'Single-source shortest paths with negative edge weights and negative-cycle detection in O(V · E).',
    timeComplexity: 'O(V · E)',
    spaceComplexity: 'O(V)',
    complexityLeap: 'Handles negative weights & K-stop limits where Dijkstra breaks completely',
    coreIdea:
      'Any simple shortest path in a V-vertex graph uses at most V - 1 edges. Relax all E edges for V - 1 passes. If a V-th pass still relaxes any edge, a reachable negative-weight cycle exists.',
    mentalModelSteps: [
      'Initialize dist[src] = 0 and dist[v] = ∞ for all other vertices.',
      'Repeat V - 1 times: for every edge (u, v, w), if dist[u] + w < dist[v], set dist[v] = dist[u] + w.',
      'Stop early if a full pass performs zero updates.',
      'Run 1 extra V-th pass: any further relaxation proves a reachable negative cycle.',
    ],
    loopInvariant: 'After pass k, dist[v] is ≤ the shortest path from source to v using at most k edges.',
    whenToUse: [
      'Shortest paths with NEGATIVE edge weights (arbitrage, energy gains)',
      'Shortest path with at most K stops (Cheapest Flights Within K Stops — LC 787)',
      'Negative-weight cycle detection in directed graphs',
    ],
    whenItFails: 'Too slow on large non-negative graphs — use Dijkstra O(E log V) whenever all weights are ≥ 0.',
    linkedTopics: ['Union-Find & Shortest Path', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['network-delay-time', 'find-if-path-exists', 'course-schedule-ii'],
    templates: {
      python: `def bellman_ford(n, edges, src):
    dist = [float('inf')] * n
    dist[src] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != float('inf') and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w; changed = True
        if not changed: break
    for u, v, w in edges:
        if dist[u] != float('inf') and dist[u] + w < dist[v]:
            return None  # Negative cycle
    return dist`,
      js: `function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w; changed = true;
      }
    }
    if (!changed) break;
  }
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) return null;
  }
  return dist;
}`,
      java: `public int[] bellmanFord(int n, int[][] edges, int src) {
  int[] d = new int[n]; Arrays.fill(d, 1_000_000_000); d[src] = 0;
  for (int i = 0; i < n - 1; i++)
    for (int[] e : edges) if (d[e[0]] + e[2] < d[e[1]]) d[e[1]] = d[e[0]] + e[2];
  for (int[] e : edges) if (d[e[0]] + e[2] < d[e[1]]) return null;
  return d;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Init: Source S = 0, Negative Edge B → C (-4)',
        explanation: 'Graph has 4 vertices (V=4) and negative edge B→C (-4). Dijkstra would greedily lock C at 5 via S→C and miss S→A→B→C (1)!',
        invariantCheck: 'Up to V - 1 = 3 relaxation passes.',
        variables: [{ name: 'pass', value: '0 (init)' }, { name: 'dist', value: 'S:0 A:∞ B:∞ C:∞' }],
        activeNodes: ['S'],
        nodeBadges: { S: '0', A: '∞', B: '∞', C: '∞' },
        graphSpec: {
          caption: 'Directed Graph with Negative Edge (-4)',
          nodes: [
            { id: 'S', x: 75, y: 112 }, { id: 'A', x: 220, y: 50 },
            { id: 'B', x: 370, y: 50 }, { id: 'C', x: 295, y: 175 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '+2', directed: true }, { u: 'S', v: 'C', label: '+5', directed: true },
            { u: 'A', v: 'B', label: '+3', directed: true }, { u: 'B', v: 'C', label: '-4', directed: true },
          ],
        },
      },
      {
        step: 2,
        title: 'Pass 1: Relax S→A (+2) and S→C (+5)',
        explanation: 'All 1-hop edges from S relax: dist[A] = 2 and dist[C] = 5.',
        invariantCheck: 'All ≤ 1-edge paths from S are exact.',
        variables: [{ name: 'pass', value: '1 of 3' }, { name: 'updated', value: 'A→2, C→5' }],
        activeNodes: ['A', 'C'],
        visitedNodes: ['S'],
        activeEdges: ['S->A', 'S->C'],
        nodeBadges: { S: '0', A: '2', B: '∞', C: '5' },
        graphSpec: {
          caption: 'Pass 1 relaxes 1-edge paths from S',
          nodes: [
            { id: 'S', x: 75, y: 112 }, { id: 'A', x: 220, y: 50 },
            { id: 'B', x: 370, y: 50 }, { id: 'C', x: 295, y: 175 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '+2', directed: true }, { u: 'S', v: 'C', label: '+5', directed: true },
            { u: 'A', v: 'B', label: '+3', directed: true }, { u: 'B', v: 'C', label: '-4', directed: true },
          ],
        },
      },
      {
        step: 3,
        title: 'Pass 2: Relax A→B → dist[B] = 5',
        explanation: 'Using dist[A] = 2, edge A→B (+3) unlocks dist[B] = 5.',
        invariantCheck: 'All ≤ 2-edge paths from S are optimal.',
        variables: [{ name: 'pass', value: '2 of 3' }, { name: 'updated', value: 'B → 5' }],
        activeNodes: ['B'],
        visitedNodes: ['S', 'A'],
        activeEdges: ['S->A', 'A->B'],
        nodeBadges: { S: '0', A: '2', B: '5', C: '5' },
        graphSpec: {
          caption: 'Pass 2 unlocks B = 5',
          nodes: [
            { id: 'S', x: 75, y: 112 }, { id: 'A', x: 220, y: 50 },
            { id: 'B', x: 370, y: 50 }, { id: 'C', x: 295, y: 175 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '+2', directed: true }, { u: 'S', v: 'C', label: '+5', directed: true },
            { u: 'A', v: 'B', label: '+3', directed: true }, { u: 'B', v: 'C', label: '-4', directed: true },
          ],
        },
      },
      {
        step: 4,
        title: 'Pass 3: Negative Edge B→C Drops C from 5 → 1!',
        explanation: 'dist[B] + (-4) = 1 < 5! A 4th check pass makes zero updates, confirming no negative cycle.',
        invariantCheck: 'Optimal distances locked: S:0, A:2, B:5, C:1.',
        variables: [{ name: 'pass 3', value: 'C: 5 → 1' }, { name: '4th pass', value: '0 updates (Safe)' }],
        activeNodes: ['C'],
        visitedNodes: ['S', 'A', 'B', 'C'],
        activeEdges: ['S->A', 'A->B', 'B->C'],
        nodeBadges: { S: '0', A: '2', B: '5', C: '1' },
        graphSpec: {
          caption: 'Final optimal distances: S:0, A:2, B:5, C:1',
          nodes: [
            { id: 'S', x: 75, y: 112 }, { id: 'A', x: 220, y: 50 },
            { id: 'B', x: 370, y: 50 }, { id: 'C', x: 295, y: 175 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '+2', directed: true }, { u: 'S', v: 'C', label: '+5', directed: true },
            { u: 'A', v: 'B', label: '+3', directed: true }, { u: 'B', v: 'C', label: '-4', directed: true },
          ],
        },
      },
    ],
  },

  // 22. Floyd-Warshall Algorithm
  {
    id: 'floyd-warshall',
    name: 'Floyd-Warshall (All-Pairs Shortest Path)',
    shortName: 'Floyd-Warshall',
    category: 'Advanced Graph Algorithms',
    visualType: 'matrix-grid',
    tagline: 'Compute shortest paths between every vertex pair (i, j) in O(V³) via 3 nested DP loops.',
    timeComplexity: 'O(V³)',
    spaceComplexity: 'O(V²)',
    complexityLeap: 'All-pairs matrix DP in 6 lines of code (supports negative edges cleanly)',
    coreIdea:
      'Allow intermediate pivot vertices k = 0..V-1 one at a time. For every pair (i, j), relax dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]).',
    mentalModelSteps: [
      'Initialize V×V matrix dist[i][i] = 0, direct edges dist[u][v] = w, and ∞ elsewhere.',
      'CRITICAL ORDER: Pivot k MUST be the outermost loop!',
      'Inside k, update dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]) for all i, j.',
      'If any diagonal dist[i][i] < 0 at the end, a negative cycle exists.',
    ],
    loopInvariant: 'After outer loop k, dist[i][j] is the shortest path from i to j using only intermediate nodes in {0..k}.',
    whenToUse: [
      'All-Pairs Shortest Paths when V ≤ 400 (LC 1334, LC 2976 26×26 letter conversion)',
      'Transitive closure (reachability matrix)',
      'Dense graphs with negative weights (no negative cycles)',
    ],
    whenItFails: 'Exceeds time limit once V > 500 — run V Dijkstras on sparse large graphs instead.',
    linkedTopics: ['Union-Find & Shortest Path', 'Dynamic Programming'],
    linkedProblemSlugs: ['network-delay-time', 'find-if-path-exists', 'coin-change'],
    templates: {
      python: `def floyd_warshall(n, edges):
    INF = 10**9
    d = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    for u, v, w in edges: d[u][v] = min(d[u][v], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return d`,
      js: `function floydWarshall(n, edges) {
  const INF = 1e9;
  const d = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w);
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  return d;
}`,
      java: `for (int k = 0; k < n; k++)
  for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
      if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];`,
    },
    frames: [
      {
        step: 1,
        title: 'Direct Edges Matrix (Before Any Pivot k)',
        explanation: 'Edges: 0→1 (3), 1→2 (2), 2→3 (1), 0→3 (10), 3→0 (4).',
        invariantCheck: 'Zero intermediate hops allowed yet.',
        variables: [{ name: 'pivot k', value: 'none' }, { name: '0 → 3', value: '10' }],
        matrix: {
          subtitle: 'Distance Matrix D(0) — Direct edges only',
          rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'],
          cells: [[0, 3, '∞', 10], ['∞', 0, 2, '∞'], ['∞', '∞', 0, 1], [4, '∞', '∞', 0]],
          matchedCells: [[0, 0], [1, 1], [2, 2], [3, 3]],
        },
      },
      {
        step: 2,
        title: 'Pivot k = 1: Unlocks 0→2 (5) & 3→1 (7)',
        explanation: 'D[0][1] + D[1][2] = 3 + 2 = 5 < ∞! Routing via node 1 opens new 2-hop paths.',
        invariantCheck: 'Paths through {0, 1} finalized.',
        variables: [{ name: 'pivot k', value: '1' }, { name: 'updated', value: 'D[0][2]=5, D[3][1]=7' }],
        matrix: {
          subtitle: 'After Pivot k = 1',
          rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'],
          cells: [[0, 3, 5, 10], ['∞', 0, 2, '∞'], ['∞', '∞', 0, 1], [4, 7, '∞', 0]],
          activeCells: [[0, 2], [3, 1]], matchedCells: [[0, 0], [1, 1], [2, 2], [3, 3]],
        },
      },
      {
        step: 3,
        title: 'Pivot k = 2: 0→3 Drops 10 → 6!',
        explanation: 'D[0][2] + D[2][3] = 5 + 1 = 6 < 10! Notice k=2 reuses D[0][2]=5 computed during k=1.',
        invariantCheck: 'Outer k guarantees subpaths are already settled.',
        variables: [{ name: 'pivot k', value: '2' }, { name: 'updated', value: 'D[0][3]: 10→6, D[1][3]: 3' }],
        matrix: {
          subtitle: 'After Pivot k = 2',
          rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'],
          cells: [[0, 3, 5, 6], ['∞', 0, 2, 3], ['∞', '∞', 0, 1], [4, 7, 9, 0]],
          activeCells: [[0, 3], [1, 3], [3, 2]], matchedCells: [[0, 0], [1, 1], [2, 2], [3, 3]],
        },
      },
      {
        step: 4,
        title: 'Pivot k = 3: Complete All-Pairs Shortest Path Matrix!',
        explanation: 'Routing via 3 fills return paths back to 0, 1, 2. Diagonal stays 0 → no negative cycles.',
        invariantCheck: 'All 16 vertex pairs solved in V³ = 64 operations.',
        variables: [{ name: 'pivot k', value: '3 (FINAL)' }, { name: 'complexity', value: 'O(V³)' }],
        matrix: {
          subtitle: 'Final All-Pairs Shortest Path Matrix',
          rowLabels: ['0', '1', '2', '3'], colLabels: ['0', '1', '2', '3'],
          cells: [[0, 3, 5, 6], [7, 0, 2, 3], [5, 8, 0, 1], [4, 7, 9, 0]],
          matchedCells: [[0, 3], [1, 0], [2, 0], [2, 1]],
        },
      },
    ],
  },

  // 23. Tarjan's & Kosaraju's Algorithms (SCCs & Bridges)
  {
    id: 'tarjan-kosaraju-scc',
    name: 'Tarjan’s & Kosaraju’s (SCC & Bridges)',
    shortName: 'Tarjan / Kosaraju',
    category: 'Advanced Graph Algorithms',
    visualType: 'weighted-network',
    tagline: 'Find Strongly Connected Components, Bridges, and Articulation Points in linear O(V + E).',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    complexityLeap: 'O(V·(V+E)) reachability tests → single-pass Tarjan low-link DFS O(V + E)',
    coreIdea:
      'Tarjan tracks discovery time disc[u] and earliest reachable ancestor low[u] via on-stack back-edges. Whenever low[u] === disc[u], u is the root of an SCC: pop the stack until u!',
    mentalModelSteps: [
      'Track timer, disc[u], low[u], explicit stack, and onStack[u].',
      'On enter u: disc[u] = low[u] = timer++, push u, onStack[u] = true.',
      'For neighbor v: if unvisited recurse & low[u] = min(low[u], low[v]); else if onStack[v] set low[u] = min(low[u], disc[v]).',
      'On exit u: if low[u] === disc[u], pop stack until u to emit one complete SCC.',
    ],
    loopInvariant: 'A node stays on Tarjan’s stack iff its SCC root has not finished DFS.',
    whenToUse: [
      'Strongly Connected Components & Condensation DAG (2-SAT, Flight Routes Check)',
      'Critical Connections / Bridges (LC 1192: undirected edge u-v is a bridge iff low[v] > disc[u])',
      'Articulation Points (single points of failure in a network)',
    ],
    whenItFails: 'Never update low[u] using a visited neighbor NOT onStack (cross-edge to an already-popped SCC).',
    linkedTopics: ['Graphs & Topo Sort', 'Union-Find & Shortest Path'],
    linkedProblemSlugs: ['course-schedule-ii', 'number-of-islands', 'find-if-path-exists'],
    templates: {
      python: `def tarjan_scc(n, adj):
    disc, low, on_st, st, sccs = [-1]*n, [0]*n, [False]*n, [], []
    timer = 0
    def dfs(u):
        nonlocal timer
        disc[u] = low[u] = timer; timer += 1
        st.append(u); on_st[u] = True
        for v in adj[u]:
            if disc[v] == -1: dfs(v); low[u] = min(low[u], low[v])
            elif on_st[v]: low[u] = min(low[u], disc[v])
        if low[u] == disc[u]:
            comp = []
            while True:
                w = st.pop(); on_st[w] = False; comp.append(w)
                if w == u: break
            sccs.append(comp)
    for i in range(n):
        if disc[i] == -1: dfs(i)
    return sccs`,
      js: `function tarjanSCC(n, adj) {
  const disc = new Array(n).fill(-1), low = new Array(n).fill(0);
  const onSt = new Array(n).fill(false), st = [], sccs = [];
  let timer = 0;
  function dfs(u) {
    disc[u] = low[u] = timer++; st.push(u); onSt[u] = true;
    for (const v of adj[u]) {
      if (disc[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }
      else if (onSt[v]) low[u] = Math.min(low[u], disc[v]);
    }
    if (low[u] === disc[u]) {
      const comp = [];
      while (true) { const w = st.pop(); onSt[w] = false; comp.push(w); if (w === u) break; }
      sccs.push(comp);
    }
  }
  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i);
  return sccs;
}`,
      java: `// Low-link root test: if (low[u] == disc[u]) pop stack until u`,
    },
    frames: [
      {
        step: 1,
        title: 'DFS Plunges 0 → 1 → 2 (Assign disc/low)',
        explanation: 'Stack holds [0, 1, 2] with disc/low = 0/0, 1/1, 2/2.',
        invariantCheck: 'All 3 nodes active on stack.',
        variables: [{ name: 'stack', value: '[0, 1, 2]' }, { name: 'SCCs', value: '0' }],
        activeNodes: ['0', '1', '2'], activeEdges: ['0->1', '1->2'],
        nodeBadges: { '0': '0/0', '1': '1/1', '2': '2/2', '3': '-/-', '4': '-/-' },
        graphSpec: {
          caption: 'Directed Graph (disc/low badges)',
          nodes: [
            { id: '0', x: 70, y: 65 }, { id: '1', x: 190, y: 50 },
            { id: '2', x: 145, y: 170 }, { id: '3', x: 325, y: 70 }, { id: '4', x: 430, y: 165 },
          ],
          edges: [
            { u: '0', v: '1', directed: true }, { u: '1', v: '2', directed: true },
            { u: '2', v: '0', directed: true }, { u: '1', v: '3', directed: true },
            { u: '3', v: '4', directed: true }, { u: '4', v: '3', directed: true },
          ],
        },
      },
      {
        step: 2,
        title: 'Back-Edge 2 → 0 Drops low[2] = 0 & low[1] = 0',
        explanation: 'Node 0 is ON stack, so back-edge 2→0 pulls low[2] and low[1] down to 0.',
        invariantCheck: 'Node 2 is NOT an SCC root since low[2] < disc[2].',
        variables: [{ name: 'back-edge', value: '2 → 0 (onStack)' }, { name: 'low[1..2]', value: '0' }],
        activeNodes: ['2', '0'], activeEdges: ['2->0', '0->1', '1->2'],
        nodeBadges: { '0': '0/0', '1': '1/0', '2': '2/0', '3': '-/-', '4': '-/-' },
        graphSpec: {
          caption: 'Back-edge pulls low-link back to root 0',
          nodes: [
            { id: '0', x: 70, y: 65 }, { id: '1', x: 190, y: 50 },
            { id: '2', x: 145, y: 170 }, { id: '3', x: 325, y: 70 }, { id: '4', x: 430, y: 165 },
          ],
          edges: [
            { u: '0', v: '1', directed: true }, { u: '1', v: '2', directed: true },
            { u: '2', v: '0', directed: true }, { u: '1', v: '3', directed: true },
            { u: '3', v: '4', directed: true }, { u: '4', v: '3', directed: true },
          ],
        },
      },
      {
        step: 3,
        title: 'Explore 1→3→4→3 → Pop SCC #1 = {3, 4} & SCC #2 = {0, 1, 2}!',
        explanation: 'low[3] == disc[3] (3) pops SCC {3, 4}; unwinding to 0 finds low[0] == disc[0] (0) and pops SCC {0, 1, 2}!',
        invariantCheck: '2 SCCs discovered in 1 linear O(V + E) pass.',
        variables: [{ name: 'SCC #1', value: '{3, 4}' }, { name: 'SCC #2', value: '{0, 1, 2}' }],
        visitedNodes: ['0', '1', '2', '3', '4'],
        activeEdges: ['0->1', '1->2', '2->0', '3->4', '4->3'],
        nodeBadges: { '0': 'SCC2', '1': 'SCC2', '2': 'SCC2', '3': 'SCC1', '4': 'SCC1' },
        graphSpec: {
          caption: 'Complete SCC Condensation: {0,1,2} ⇢ {3,4}',
          nodes: [
            { id: '0', x: 70, y: 65, group: 2 }, { id: '1', x: 190, y: 50, group: 2 },
            { id: '2', x: 145, y: 170, group: 2 }, { id: '3', x: 325, y: 70, group: 1 }, { id: '4', x: 430, y: 165, group: 1 },
          ],
          edges: [
            { u: '0', v: '1', directed: true }, { u: '1', v: '2', directed: true },
            { u: '2', v: '0', directed: true }, { u: '1', v: '3', label: 'bridge', directed: true, dashed: true },
            { u: '3', v: '4', directed: true }, { u: '4', v: '3', directed: true },
          ],
        },
      },
    ],
  },

  // 24. A* (A-Star) Search
  {
    id: 'a-star-search',
    name: 'A* (A-Star) Heuristic Search',
    shortName: 'A* Search',
    category: 'Advanced Graph Algorithms',
    visualType: 'matrix-grid',
    tagline: 'Guide shortest-path search straight toward the goal with f(n) = g(n) + h(n).',
    timeComplexity: 'O(E log V) guided',
    spaceComplexity: 'O(V)',
    complexityLeap: 'Blind circular Dijkstra expansion → focused goal-directed frontier',
    coreIdea:
      'Order the Min-Heap by f(n) = g(n) + h(n), combining exact traveled cost g(n) with an admissible heuristic h(n) (e.g., Manhattan distance on 4-way grids) that never overestimates remaining cost.',
    mentalModelSteps: [
      'Pick an admissible heuristic h(n) ≤ true remaining distance (Manhattan for 4-way, Chebyshev for 8-way).',
      'Push (f = h(start), g = 0, start) into Min-Heap.',
      'Pop lowest f; if state === goal, stop immediately with optimal distance g.',
      'Relax neighbors with g + 1 < gBest[next] and push (g + 1 + h(next), g + 1, next).',
    ],
    loopInvariant: 'With an admissible heuristic, the first time Goal is popped its g(goal) is guaranteed optimal.',
    whenToUse: [
      'Spatial grid pathfinding with obstacles (LC 1091, Robotics, Game AI)',
      'State-space puzzles (Sliding Puzzle LC 773, 8-Puzzle)',
      'Map routing (h = straight-line distance / max speed)',
    ],
    whenItFails: 'An inadmissible heuristic (overestimating true cost) can return a non-optimal path.',
    linkedTopics: ['Graphs & Topo Sort', 'Union-Find & Shortest Path'],
    linkedProblemSlugs: ['word-ladder', 'swim-in-rising-water', 'flood-fill'],
    templates: {
      python: `import heapq
def a_star(grid):
    R, C = len(grid), len(grid[0])
    if grid[0][0] or grid[R-1][C-1]: return -1
    h = lambda r, c: (R - 1 - r) + (C - 1 - c)
    pq, best = [(h(0, 0), 0, 0, 0)], {(0, 0): 0}
    while pq:
        _, g, r, c = heapq.heappop(pq)
        if (r, c) == (R - 1, C - 1): return g
        if g > best[(r, c)]: continue
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 0 and g + 1 < best.get((nr, nc), 10**9):
                best[(nr, nc)] = g + 1
                heapq.heappush(pq, (g + 1 + h(nr, nc), g + 1, nr, nc))
    return -1`,
      js: `function aStarShortestPath(grid) {
  const R = grid.length, C = grid[0].length;
  if (grid[0][0] || grid[R - 1][C - 1]) return -1;
  const h = (r, c) => (R - 1 - r) + (C - 1 - c);
  const gBest = Array.from({ length: R }, () => new Array(C).fill(Infinity));
  gBest[0][0] = 0;
  const pq = [[h(0, 0), 0, 0, 0]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [, g, r, c] = pq.shift();
    if (r === R - 1 && c === C - 1) return g;
    if (g > gBest[r][c]) continue;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 0 && g + 1 < gBest[nr][nc]) {
        gBest[nr][nc] = g + 1; pq.push([g + 1 + h(nr, nc), g + 1, nr, nc]);
      }
    }
  }
  return -1;
}`,
      java: `PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));`,
    },
    frames: [
      {
        step: 1,
        title: 'Start S(0,0) → Goal G(3,3) With Wall Column',
        explanation: 'Manhattan h(0,0) = 6. Walls (#) block column 2 down to row 2.',
        invariantCheck: 'h(r,c) never overestimates 4-way distance.',
        variables: [{ name: 'current', value: '(0,0) g=0 h=6' }, { name: 'f = g+h', value: '6' }],
        matrix: {
          subtitle: '4×4 Grid — Cell displays f = g + h (# = Wall)',
          rowLabels: ['r0', 'r1', 'r2', 'r3'], colLabels: ['c0', 'c1', 'c2', 'c3'],
          cells: [['S:6', '·', '#', '·'], ['·', '·', '#', '·'], ['·', '·', '#', '·'], ['·', '·', '·', 'G']],
          activeCells: [[0, 0]], blockedCells: [[0, 2], [1, 2], [2, 2]],
        },
      },
      {
        step: 2,
        title: 'Steer Around Wall Opening at Row 3 (All f = 6!)',
        explanation: 'Moving down and through (3,2) keeps f = g + h = 6! Cells behind the wall stay unvisited.',
        invariantCheck: 'Zero wasted expansions on dead-end upper-right region.',
        variables: [{ name: 'current', value: '(3,2) g=5 h=1' }, { name: 'f = g+h', value: '6' }],
        matrix: {
          subtitle: 'Guided frontier threads opening (3,2)',
          rowLabels: ['r0', 'r1', 'r2', 'r3'], colLabels: ['c0', 'c1', 'c2', 'c3'],
          cells: [['S:6', '6', '#', '·'], ['6', '6', '#', '·'], ['6', '6', '#', '·'], ['6', '6', '6', 'G']],
          activeCells: [[3, 2]], matchedCells: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], blockedCells: [[0, 2], [1, 2], [2, 2]],
        },
      },
      {
        step: 3,
        title: 'Pop Goal (3,3) → Optimal Path Length = 6 Confirmed!',
        explanation: 'Goal popped with g = 6, h = 0 while leaving 3 upper-right cells completely untouched.',
        invariantCheck: 'Admissible heuristic guarantees shortest path = 6.',
        variables: [{ name: 'shortest dist', value: '6 steps' }, { name: 'cells saved', value: '3 untouched' }],
        matrix: {
          subtitle: 'Optimal Path S → (1,0) → (2,0) → (3,0) → (3,1) → (3,2) → G',
          rowLabels: ['r0', 'r1', 'r2', 'r3'], colLabels: ['c0', 'c1', 'c2', 'c3'],
          cells: [['S:0', '·', '#', '·'], ['1', '·', '#', '·'], ['2', '·', '#', '·'], ['3', '4', '5', 'G:6']],
          matchedCells: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2], [3, 3]], blockedCells: [[0, 2], [1, 2], [2, 2]],
        },
      },
    ],
  },

  // 25. Ford-Fulkerson / Edmonds-Karp
  {
    id: 'max-flow-edmonds-karp',
    name: 'Ford-Fulkerson / Edmonds-Karp (Max Flow)',
    shortName: 'Max Flow (EK)',
    category: 'Advanced Graph Algorithms',
    visualType: 'weighted-network',
    tagline: 'Solve Maximum Flow & Minimum Cut via shortest BFS residual augmenting paths in O(V · E²).',
    timeComplexity: 'O(V · E²)',
    spaceComplexity: 'O(V + E)',
    complexityLeap: 'Reverse residual edges cleanly undo suboptimal greedy flow assignments',
    coreIdea:
      'Run BFS in the residual graph to find the shortest augmenting path from Source S to Sink T. Push bottleneck capacity f along forward edges (cap -= f) and add f to reverse edges (cap += f).',
    mentalModelSteps: [
      'Initialize residual capacity matrix cap[u][v] (reverse edges start at 0).',
      'BFS from S to T over edges with cap[u][v] > 0, tracking bottleneck flow.',
      'If T cannot be reached, stop: totalFlow = Max Flow = Min Cut.',
      'Subtract pushed flow from forward edges and add to reverse edges along parent path.',
    ],
    loopInvariant: 'Flow conservation holds at all internal nodes; when no S→T path remains, Max-Flow equals Min-Cut.',
    whenToUse: [
      'Maximum Bipartite Matching & Assignment with capacities',
      'Minimum Cut / Network Bottleneck / Edge-Disjoint Paths',
      'Project Selection & Circulation problems',
    ],
    whenItFails: 'For large dense flow graphs (V > 500), upgrade to Dinic’s Algorithm O(V² · E).',
    linkedTopics: ['Graphs & Topo Sort', 'Union-Find & Shortest Path'],
    linkedProblemSlugs: ['network-delay-time', 'find-if-path-exists', 'course-schedule-ii'],
    templates: {
      python: `from collections import deque
def edmonds_karp(n, edges, s, t):
    cap = [[0]*n for _ in range(n)]
    for u, v, c in edges: cap[u][v] += c
    flow = 0
    while True:
        parent = [-1]*n; parent[s] = s
        q = deque([(s, 10**18)]); pushed = 0
        while q and not pushed:
            u, f = q.popleft()
            for v in range(n):
                if parent[v] == -1 and cap[u][v] > 0:
                    parent[v] = u; nf = min(f, cap[u][v])
                    if v == t: pushed = nf; break
                    q.append((v, nf))
        if not pushed: break
        flow += pushed; cur = t
        while cur != s:
            p = parent[cur]; cap[p][cur] -= pushed; cap[cur][p] += pushed; cur = p
    return flow`,
      js: `function edmondsKarp(n, edges, s, t) {
  const cap = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v, c] of edges) cap[u][v] += c;
  let maxFlow = 0;
  while (true) {
    const parent = new Array(n).fill(-1); parent[s] = s;
    const q = [[s, Infinity]]; let pushed = 0;
    while (q.length && !pushed) {
      const [u, f] = q.shift();
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) {
          parent[v] = u; const nf = Math.min(f, cap[u][v]);
          if (v === t) { pushed = nf; break; }
          q.push([v, nf]);
        }
      }
    }
    if (!pushed) break;
    maxFlow += pushed;
    for (let cur = t; cur !== s; cur = parent[cur]) {
      cap[parent[cur]][cur] -= pushed; cap[cur][parent[cur]] += pushed;
    }
  }
  return maxFlow;
}`,
      java: `cap[prev][cur] -= pushed; cap[cur][prev] += pushed;`,
    },
    frames: [
      {
        step: 1,
        title: 'Augment #1: S → A → T (+6 Flow)',
        explanation: 'Shortest BFS path S→A→T has bottleneck min(10, 6) = 6. A→T saturates at 6/6.',
        invariantCheck: 'Total flow = 6; S→A has 4 residual capacity left.',
        variables: [{ name: 'path #1', value: 'S → A → T (+6)' }, { name: 'totalFlow', value: '6' }],
        activeNodes: ['S', 'A', 'T'], activeEdges: ['S->A', 'A->T'],
        graphSpec: {
          caption: 'Edge labels show flow / capacity',
          nodes: [
            { id: 'S', x: 65, y: 112 }, { id: 'A', x: 230, y: 48 },
            { id: 'B', x: 230, y: 175 }, { id: 'T', x: 405, y: 112 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '6/10', directed: true }, { u: 'S', v: 'B', label: '0/8', directed: true },
            { u: 'A', v: 'B', label: '0/5', directed: true }, { u: 'A', v: 'T', label: '6/6', directed: true },
            { u: 'B', v: 'T', label: '0/9', directed: true },
          ],
        },
      },
      {
        step: 2,
        title: 'Augment #2: S → B → T (+8 Flow → Total = 14)',
        explanation: 'Shortest remaining path S→B→T pushes min(8, 9) = 8 units. B→T still has 1 unit left!',
        invariantCheck: 'Total flow = 14.',
        variables: [{ name: 'path #2', value: 'S → B → T (+8)' }, { name: 'totalFlow', value: '14' }],
        activeNodes: ['S', 'B', 'T'], activeEdges: ['S->B', 'B->T'],
        graphSpec: {
          caption: 'S→B saturates; 1 unit remains open on B→T',
          nodes: [
            { id: 'S', x: 65, y: 112 }, { id: 'A', x: 230, y: 48 },
            { id: 'B', x: 230, y: 175 }, { id: 'T', x: 405, y: 112 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '6/10', directed: true }, { u: 'S', v: 'B', label: '8/8', directed: true },
            { u: 'A', v: 'B', label: '0/5', directed: true }, { u: 'A', v: 'T', label: '6/6', directed: true },
            { u: 'B', v: 'T', label: '8/9', directed: true },
          ],
        },
      },
      {
        step: 3,
        title: 'Augment #3: S → A → B → T (+1) → Max Flow = Min Cut = 15!',
        explanation: 'Pushes final +1 via A→B→T! Both incoming edges to T (6+9=15) are full → Min Cut {S,A,B} | {T} = 15!',
        invariantCheck: 'No augmenting path left → Max Flow = 15 proven.',
        variables: [{ name: 'path #3', value: 'S→A→B→T (+1)' }, { name: 'MAX FLOW', value: '15 (= Min Cut)' }],
        visitedNodes: ['S', 'A', 'B', 'T'], activeEdges: ['S->A', 'A->B', 'B->T'],
        graphSpec: {
          caption: 'Saturated Min-Cut {S,A,B} → {T} = 6 + 9 = 15',
          nodes: [
            { id: 'S', x: 65, y: 112, group: 1 }, { id: 'A', x: 230, y: 48, group: 1 },
            { id: 'B', x: 230, y: 175, group: 1 }, { id: 'T', x: 405, y: 112, group: 2 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '7/10', directed: true }, { u: 'S', v: 'B', label: '8/8', directed: true },
            { u: 'A', v: 'B', label: '1/5', directed: true }, { u: 'A', v: 'T', label: '6/6 ✓', directed: true },
            { u: 'B', v: 'T', label: '9/9 ✓', directed: true },
          ],
        },
      },
    ],
  },

  // 26. Prim's Algorithm (MST)
  {
    id: 'prims-mst',
    name: 'Prim’s Algorithm (Minimum Spanning Tree)',
    shortName: 'Prim’s MST',
    category: 'Advanced Graph Algorithms',
    visualType: 'weighted-network',
    tagline: 'Grow a Minimum Spanning Tree vertex-by-vertex via the lightest cut-crossing edge.',
    timeComplexity: 'O(E log V) / O(V²) dense',
    spaceComplexity: 'O(V + E)',
    complexityLeap: 'Beats Kruskal on dense complete graphs without sorting O(V²) edges',
    coreIdea:
      'Start from vertex 0 and repeatedly add the minimum-weight edge connecting any visited MST vertex to an unvisited vertex using a Min-Heap (or O(V²) array on dense graphs).',
    mentalModelSteps: [
      'Push (0, startNode=0) into Min-Heap.',
      'Pop smallest (w, u). If u already visited, skip.',
      'Mark u visited, add w to totalCost, increment taken.',
      'Push (weight, v) for all unvisited neighbors v until taken === V.',
    ],
    loopInvariant: 'By the Cut Property, the lightest edge crossing (Visited, Unvisited) always belongs to an MST.',
    whenToUse: [
      'Dense or complete graphs (Min Cost to Connect All Points — LC 1584)',
      'Adjacency-matrix MST without building an explicit edge list',
    ],
    whenItFails: 'Only applies to undirected connected graphs (return -1 if taken < V).',
    linkedTopics: ['Union-Find & Shortest Path', 'Heaps & Intervals'],
    linkedProblemSlugs: ['network-delay-time', 'accounts-merge', 'swim-in-rising-water'],
    templates: {
      python: `import heapq
def prim_mst(n, adj):
    vis, pq, total, taken = [False]*n, [(0, 0)], 0, 0
    while pq and taken < n:
        w, u = heapq.heappop(pq)
        if vis[u]: continue
        vis[u] = True; total += w; taken += 1
        for v, c in adj[u]:
            if not vis[v]: heapq.heappush(pq, (c, v))
    return total if taken == n else -1`,
      js: `function primMST(n, adj) {
  const vis = new Array(n).fill(false), pq = [[0, 0]];
  let total = 0, taken = 0;
  while (pq.length && taken < n) {
    pq.sort((a, b) => a[0] - b[0]);
    const [w, u] = pq.shift();
    if (vis[u]) continue;
    vis[u] = true; total += w; taken++;
    for (const [v, c] of adj[u]) if (!vis[v]) pq.push([c, v]);
  }
  return taken === n ? total : -1;
}`,
      java: `PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));`,
    },
    frames: [
      {
        step: 1,
        title: 'Start at Vertex 0 → Pick Lightest Edge 0–1 (w = 2)',
        explanation: 'Comparing frontier edges (0–1: 2) vs (0–2: 6), Prim locks 0–1 first!',
        invariantCheck: 'MST = {0, 1}, cost = 2.',
        variables: [{ name: 'added', value: '0–1 (w=2)' }, { name: 'total', value: '2' }],
        activeNodes: ['0', '1'], visitedNodes: ['0', '1'], activeEdges: ['0->1'],
        graphSpec: {
          caption: 'Undirected Weighted Graph (V = 4)',
          nodes: [
            { id: '0', x: 80, y: 112 }, { id: '1', x: 230, y: 48 },
            { id: '2', x: 230, y: 175 }, { id: '3', x: 390, y: 112 },
          ],
          edges: [
            { u: '0', v: '1', label: '2' }, { u: '0', v: '2', label: '6' },
            { u: '1', v: '2', label: '3' }, { u: '1', v: '3', label: '5' }, { u: '2', v: '3', label: '1' },
          ],
        },
      },
      {
        step: 2,
        title: 'Pick 1–2 (w = 3) → Exposes Ultra-Cheap Edge 2–3 (w = 1)!',
        explanation: '1–2 beats 0–2 (6) and 1–3 (5). Adding vertex 2 exposes 2–3 (w=1) to the heap.',
        invariantCheck: 'MST = {0, 1, 2}, cost = 5.',
        variables: [{ name: 'added', value: '1–2 (w=3)' }, { name: 'total', value: '5' }],
        activeNodes: ['2'], visitedNodes: ['0', '1', '2'], activeEdges: ['0->1', '1->2'],
        graphSpec: {
          caption: 'Vertex 2 unlocks edge 2–3 (weight 1)',
          nodes: [
            { id: '0', x: 80, y: 112 }, { id: '1', x: 230, y: 48 },
            { id: '2', x: 230, y: 175 }, { id: '3', x: 390, y: 112 },
          ],
          edges: [
            { u: '0', v: '1', label: '2' }, { u: '0', v: '2', label: '6' },
            { u: '1', v: '2', label: '3' }, { u: '1', v: '3', label: '5' }, { u: '2', v: '3', label: '1' },
          ],
        },
      },
      {
        step: 3,
        title: 'Pick 2–3 (w = 1) → Minimum Spanning Tree Complete (Weight = 6)!',
        explanation: 'All 4 vertices spanned by 3 edges (2 + 3 + 1 = 6); heavy edges 0–2 (6) and 1–3 (5) discarded.',
        invariantCheck: 'Exactly V - 1 = 3 edges with minimum total weight 6.',
        variables: [{ name: 'edges', value: '0-1, 1-2, 2-3' }, { name: 'FINAL MST', value: '6' }],
        visitedNodes: ['0', '1', '2', '3'], activeEdges: ['0->1', '1->2', '2->3'],
        graphSpec: {
          caption: 'Final MST total weight = 6',
          nodes: [
            { id: '0', x: 80, y: 112, group: 1 }, { id: '1', x: 230, y: 48, group: 1 },
            { id: '2', x: 230, y: 175, group: 1 }, { id: '3', x: 390, y: 112, group: 1 },
          ],
          edges: [
            { u: '0', v: '1', label: '2 ✓' }, { u: '0', v: '2', label: '6', dashed: true },
            { u: '1', v: '2', label: '3 ✓' }, { u: '1', v: '3', label: '5', dashed: true },
            { u: '2', v: '3', label: '1 ✓' },
          ],
        },
      },
    ],
  },
];

export const ADV_GRAPH_PRACTICE: Record<string, AlgorithmPracticeSpec> = {
  'bellman-ford': {
    algorithmId: 'bellman-ford',
    functionName: 'bellmanFord',
    title: 'Bellman-Ford With Negative Cycle Detection',
    prompt: 'Given n vertices, directed weighted edges [u, v, w], and source src, return shortest distances (or null if a reachable negative cycle exists).',
    structuredSteps: [
      { step: '1. Initialize dist[]', detail: 'Fill dist[n] with Infinity and set dist[src] = 0.' },
      { step: '2. Relax V - 1 Passes', detail: 'Loop n - 1 times relaxing all edges [u, v, w] when dist[u] + w < dist[v].' },
      { step: '3. V-th Cycle Check', detail: 'If any edge still relaxes on the extra pass, return null; else return dist.' },
    ],
    starterCode: `function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  // TODO: Relax n - 1 times, then run cycle detection pass
  return dist;
}`,
    solutionCode: `function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;
  for (let i = 0; i < n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w; changed = true;
      }
    }
    if (!changed) break;
  }
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) return null;
  }
  return dist;
}`,
    testCases: [
      { label: 'Negative edge beats direct path', args: [4, [[0, 1, 2], [0, 3, 5], [1, 2, 3], [2, 3, -4]], 0], expected: [0, 2, 5, 1] },
      { label: 'Reachable negative cycle returns null', args: [3, [[0, 1, 1], [1, 2, -3], [2, 1, 1]], 0], expected: null },
      { label: 'Single vertex', args: [1, [], 0], expected: [0] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 787', title: 'Cheapest Flights Within K Stops', difficulty: 'Medium', focus: 'K-pass Bellman-Ford with round snapshot' },
      { platform: 'CSES', number: 'CSES 1197', title: 'Cycle Finding', difficulty: 'Hard', focus: 'Reconstruct negative cycle via parent pointers' },
      { platform: 'LeetCode', number: 'LC 743', title: 'Network Delay Time', difficulty: 'Medium', focus: 'Compare Bellman-Ford vs Dijkstra', trainerSlug: 'network-delay-time' },
    ],
  },
  'floyd-warshall': {
    algorithmId: 'floyd-warshall',
    functionName: 'floydWarshall',
    title: 'All-Pairs Shortest Path Matrix',
    prompt: 'Given n vertices and directed edges [u, v, w], return the n×n shortest path matrix using -1 for unreachable pairs.',
    structuredSteps: [
      { step: '1. Base Matrix', detail: 'Set d[i][i] = 0, d[u][v] = min(d[u][v], w), INF elsewhere.' },
      { step: '2. Pivot k Outermost', detail: 'Run k -> i -> j relaxing d[i][j] = min(d[i][j], d[i][k] + d[k][j]).' },
      { step: '3. Normalize INF', detail: 'Map remaining unreachable cells to -1.' },
    ],
    starterCode: `function floydWarshall(n, edges) {
  const INF = 1e9;
  const d = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );
  // TODO: Populate edges, run k -> i -> j, convert INF to -1
  return d;
}`,
    solutionCode: `function floydWarshall(n, edges) {
  const INF = 1e9;
  const d = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))
  );
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w);
  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j])
          d[i][j] = d[i][k] + d[k][j];
  return d.map((row) => row.map((v) => (v >= INF ? -1 : v)));
}`,
    testCases: [
      { label: 'Multi-hop shortcut beats direct edge', args: [3, [[0, 1, 2], [1, 2, 3], [0, 2, 10]]], expected: [[0, 2, 5], [-1, 0, 3], [-1, -1, 0]] },
      { label: 'Negative edge without negative cycle', args: [3, [[0, 1, 4], [1, 2, -2], [2, 0, 1]]], expected: [[0, 4, 2], [-1, 0, -2], [1, 5, 0]] },
      { label: 'Disconnected vertices yield -1', args: [2, []], expected: [[0, -1], [-1, 0]] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1334', title: 'Find the City With Smallest Neighbors', difficulty: 'Medium', focus: 'Textbook V ≤ 100 Floyd-Warshall' },
      { platform: 'LeetCode', number: 'LC 2976', title: 'Minimum Cost to Convert String I', difficulty: 'Medium', focus: '26×26 alphabet Floyd-Warshall' },
      { platform: 'CSES', number: 'CSES 1672', title: 'Shortest Routes II', difficulty: 'Medium', focus: 'Undirected all-pairs queries' },
    ],
  },
  'tarjan-kosaraju-scc': {
    algorithmId: 'tarjan-kosaraju-scc',
    functionName: 'countSCCs',
    title: 'Count Strongly Connected Components (Tarjan)',
    prompt: 'Given n vertices and directed edges [u, v], return the number of Strongly Connected Components in O(V + E).',
    structuredSteps: [
      { step: '1. Init disc/low/onStack', detail: 'Build adj[] and allocate disc=-1, low=0, onStack=false, stack=[].' },
      { step: '2. Low-Link DFS', detail: 'Update low[u] from child low[v] and ONLY on-stack back-edge disc[v].' },
      { step: '3. Pop SCC Root', detail: 'When low[u] === disc[u], pop until u and increment sccCount.' },
    ],
    starterCode: `function countSCCs(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  // TODO: Implement Tarjan's low-link DFS
  return 0;
}`,
    solutionCode: `function countSCCs(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  const disc = new Array(n).fill(-1), low = new Array(n).fill(0);
  const onSt = new Array(n).fill(false), st = [];
  let timer = 0, count = 0;
  function dfs(u) {
    disc[u] = low[u] = timer++; st.push(u); onSt[u] = true;
    for (const v of adj[u]) {
      if (disc[v] === -1) { dfs(v); low[u] = Math.min(low[u], low[v]); }
      else if (onSt[v]) low[u] = Math.min(low[u], disc[v]);
    }
    if (low[u] === disc[u]) {
      count++;
      while (true) { const w = st.pop(); onSt[w] = false; if (w === u) break; }
    }
  }
  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i);
  return count;
}`,
    testCases: [
      { label: 'Two SCCs linked by bridge', args: [5, [[0, 1], [1, 2], [2, 0], [1, 3], [3, 4], [4, 3]]], expected: 2 },
      { label: 'DAG has n singleton SCCs', args: [4, [[0, 1], [1, 2], [2, 3]]], expected: 4 },
      { label: 'Single directed cycle', args: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1192', title: 'Critical Connections in a Network', difficulty: 'Hard', focus: 'Tarjan Bridges (low[v] > disc[u])' },
      { platform: 'CSES', number: 'CSES 1682', title: 'Flight Routes Check', difficulty: 'Medium', focus: 'Verify single SCC via Tarjan / Kosaraju' },
      { platform: 'LeetCode', number: 'LC 210', title: 'Course Schedule II', difficulty: 'Medium', focus: 'DAG ordering vs SCC cycle condensation', trainerSlug: 'course-schedule-ii' },
    ],
  },
  'a-star-search': {
    algorithmId: 'a-star-search',
    functionName: 'aStarShortestPath',
    title: 'A* 4-Directional Grid Pathfinding',
    prompt: 'Return shortest 4-way steps from (0,0) to (R-1,C-1) in binary grid (0=open, 1=wall) using A* with Manhattan heuristic, or -1.',
    structuredSteps: [
      { step: '1. Admissible Heuristic', detail: 'Define h(r, c) = (R - 1 - r) + (C - 1 - c) and guard blocked endpoints.' },
      { step: '2. Min-Heap by f = g + h', detail: 'Pop lowest f; return g immediately upon popping (R-1, C-1).' },
      { step: '3. Relax 4 Neighbors', detail: 'Update gBest[nr][nc] and push [g+1+h, g+1, nr, nc].' },
    ],
    starterCode: `function aStarShortestPath(grid) {
  const R = grid.length, C = grid[0].length;
  if (grid[0][0] === 1 || grid[R - 1][C - 1] === 1) return -1;
  // TODO: Implement A* with Manhattan heuristic
  return -1;
}`,
    solutionCode: `function aStarShortestPath(grid) {
  const R = grid.length, C = grid[0].length;
  if (grid[0][0] === 1 || grid[R - 1][C - 1] === 1) return -1;
  const h = (r, c) => (R - 1 - r) + (C - 1 - c);
  const gBest = Array.from({ length: R }, () => new Array(C).fill(Infinity));
  gBest[0][0] = 0;
  const pq = [[h(0, 0), 0, 0, 0]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [, g, r, c] = pq.shift();
    if (r === R - 1 && c === C - 1) return g;
    if (g > gBest[r][c]) continue;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 0 && g + 1 < gBest[nr][nc]) {
        gBest[nr][nc] = g + 1; pq.push([g + 1 + h(nr, nc), g + 1, nr, nc]);
      }
    }
  }
  return -1;
}`,
    testCases: [
      { label: 'Navigate around wall column', args: [[[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]]], expected: 6 },
      { label: 'Blocked path returns -1', args: [[[0, 1], [1, 0]]], expected: -1 },
      { label: '1×1 grid returns 0', args: [[[0]]], expected: 0 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1091', title: 'Shortest Path in Binary Matrix', difficulty: 'Medium', focus: '8-way A* with Chebyshev heuristic' },
      { platform: 'LeetCode', number: 'LC 773', title: 'Sliding Puzzle', difficulty: 'Hard', focus: 'State-space A* search' },
      { platform: 'LeetCode', number: 'LC 778', title: 'Swim in Rising Water', difficulty: 'Hard', focus: 'Priority grid search', trainerSlug: 'swim-in-rising-water' },
    ],
  },
  'max-flow-edmonds-karp': {
    algorithmId: 'max-flow-edmonds-karp',
    functionName: 'edmondsKarp',
    title: 'Edmonds-Karp Maximum Flow',
    prompt: 'Given n vertices, directed capacitated edges [u, v, cap], source s, and sink t, return the maximum s→t flow.',
    structuredSteps: [
      { step: '1. Residual Matrix', detail: 'Sum parallel edges into n×n matrix cap[u][v].' },
      { step: '2. Shortest Augmenting BFS', detail: 'Find shortest s→t path with cap[u][v] > 0 and bottleneck flow.' },
      { step: '3. Update Forward & Reverse', detail: 'Subtract pushed flow forward and add it to reverse residual edge.' },
    ],
    starterCode: `function edmondsKarp(n, edges, s, t) {
  const cap = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v, c] of edges) cap[u][v] += c;
  // TODO: Loop BFS augmenting paths until sink t is unreachable
  return 0;
}`,
    solutionCode: `function edmondsKarp(n, edges, s, t) {
  const cap = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v, c] of edges) cap[u][v] += c;
  let maxFlow = 0;
  while (true) {
    const parent = new Array(n).fill(-1); parent[s] = s;
    const q = [[s, Infinity]]; let pushed = 0;
    while (q.length && !pushed) {
      const [u, f] = q.shift();
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && cap[u][v] > 0) {
          parent[v] = u; const nf = Math.min(f, cap[u][v]);
          if (v === t) { pushed = nf; break; }
          q.push([v, nf]);
        }
      }
    }
    if (!pushed) break;
    maxFlow += pushed;
    for (let cur = t; cur !== s; cur = parent[cur]) {
      cap[parent[cur]][cur] -= pushed; cap[cur][parent[cur]] += pushed;
    }
  }
  return maxFlow;
}`,
    testCases: [
      { label: '4-node network (Max Flow = 15)', args: [4, [[0, 1, 10], [0, 2, 8], [1, 2, 5], [1, 3, 6], [2, 3, 9]], 0, 3], expected: 15 },
      { label: 'Unit-edge rerouting', args: [4, [[0, 1, 1], [0, 2, 1], [1, 2, 1], [1, 3, 1], [2, 3, 1]], 0, 3], expected: 2 },
      { label: 'Unreachable sink', args: [3, [[0, 1, 5]], 0, 2], expected: 0 },
    ],
    platformDrills: [
      { platform: 'CSES', number: 'CSES 1694', title: 'Download Speed', difficulty: 'Hard', focus: 'Direct Max-Flow benchmark' },
      { platform: 'CSES', number: 'CSES 1695', title: 'Police Chase', difficulty: 'Hard', focus: 'Extract Minimum Cut edges after max flow' },
      { platform: 'LeetCode', number: 'LC 1349', title: 'Maximum Students Taking Exam', difficulty: 'Hard', focus: 'Bipartite matching via Max Flow' },
    ],
  },
  'prims-mst': {
    algorithmId: 'prims-mst',
    functionName: 'primMST',
    title: 'Prim’s Minimum Spanning Tree Weight',
    prompt: 'Given n vertices and undirected weighted edges [u, v, w], return the MST total weight (or -1 if disconnected).',
    structuredSteps: [
      { step: '1. Undirected Adjacency', detail: 'Add [v, w] to adj[u] and [u, w] to adj[v].' },
      { step: '2. Grow MST From 0', detail: 'Pop lightest unvisited edge from Min-Heap, add w, push unvisited neighbors.' },
      { step: '3. Connectivity Check', detail: 'Return total if taken === n else -1.' },
    ],
    starterCode: `function primMST(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  // TODO: Grow MST from vertex 0 using a Min-Heap
  return -1;
}`,
    solutionCode: `function primMST(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  const vis = new Array(n).fill(false), pq = [[0, 0]];
  let total = 0, taken = 0;
  while (pq.length && taken < n) {
    pq.sort((a, b) => a[0] - b[0]);
    const [w, u] = pq.shift();
    if (vis[u]) continue;
    vis[u] = true; total += w; taken++;
    for (const [v, c] of adj[u]) if (!vis[v]) pq.push([c, v]);
  }
  return taken === n ? total : -1;
}`,
    testCases: [
      { label: '4-node graph MST = 6', args: [4, [[0, 1, 2], [0, 2, 6], [1, 2, 3], [1, 3, 5], [2, 3, 1]]], expected: 6 },
      { label: 'Disconnected returns -1', args: [4, [[0, 1, 3], [2, 3, 4]]], expected: -1 },
      { label: 'Single node returns 0', args: [1, []], expected: 0 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1584', title: 'Min Cost to Connect All Points', difficulty: 'Medium', focus: 'Dense O(V²) Prim’s MST' },
      { platform: 'CSES', number: 'CSES 1675', title: 'Road Reparation', difficulty: 'Medium', focus: 'MST with disconnected check' },
      { platform: 'NeetCode', number: 'LC 1135', title: 'Connecting Cities With Minimum Cost', difficulty: 'Medium', focus: 'Compare Prim vs Kruskal' },
    ],
  },
};
