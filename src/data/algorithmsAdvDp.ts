import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';

export const ADV_DP_ALGORITHMS: AlgorithmDefinition[] = [
  // 36. Bitmask DP
  {
    id: 'bitmask-dp',
    name: 'Bitmask DP (Subset States / TSP)',
    shortName: 'Bitmask DP',
    category: 'Advanced Dynamic Programming',
    visualType: 'matrix-grid',
    tagline: 'Compress visited subsets into integer bitmasks to solve N ≤ 20 permutation problems in O(N² · 2^N).',
    timeComplexity: 'O(N² · 2^N)',
    spaceComplexity: 'O(N · 2^N)',
    complexityLeap: 'O(N!) factorial permutations (~10¹⁸ for N=20) → O(N²·2^N) feasible DP',
    coreIdea:
      'Represent any subset of {0..N-1} as an N-bit integer mask. Define dp[mask][u] = optimal cost after visiting subset `mask` and ending at node `u`. Transition to any unvisited node `v` (where `(mask >> v) & 1 == 0`) via `mask | (1 << v)`!',
    mentalModelSteps: [
      'Recognize the N ≤ 20 constraint signal (2²⁰ ≈ 10⁶ states fits cleanly in memory!).',
      'Define state dp[mask][u] = best cost covering subset mask, ending at node u.',
      'Base case: dp[1 << 0][0] = 0 (start at city 0).',
      'Iterate mask = 1..(1<<N)-1; for each u in mask and v NOT in mask, relax dp[mask | (1<<v)][v].',
    ],
    loopInvariant: 'Every subset mask is evaluated strictly AFTER all its smaller proper submasks.',
    whenToUse: [
      'Traveling Salesman / Shortest Path Visiting All Nodes (LC 847) & Find Shortest Superstring (LC 943)',
      'Partition to K Equal Sum Subsets (LC 698) & Minimum Cost to Assign N Tasks to N Workers',
    ],
    whenItFails: 'Explodes past N > 22 (2²⁵ ≈ 3.3×10⁷) — switch to Greedy, Flow, or Meet-in-the-Middle.',
    linkedTopics: ['Dynamic Programming', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['coin-change', 'subsets', 'network-delay-time'],
    templates: {
      python: `def tsp_min_tour(cost):
    n = len(cost); INF = 10**9
    dp = [[INF]*n for _ in range(1 << n)]
    dp[1][0] = 0
    for mask in range(1, 1 << n):
        for u in range(n):
            if dp[mask][u] == INF: continue
            for v in range(n):
                if not (mask & (1 << v)):
                    nm = mask | (1 << v)
                    dp[nm][v] = min(dp[nm][v], dp[mask][u] + cost[u][v])
    full = (1 << n) - 1
    return min(dp[full][u] + cost[u][0] for u in range(n))`,
      js: `function tspMinTour(cost) {
  const n = cost.length, INF = 1e9, FULL = (1 << n) - 1;
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  dp[1][0] = 0;
  for (let mask = 1; mask <= FULL; mask++) {
    for (let u = 0; u < n; u++) {
      if (dp[mask][u] === INF) continue;
      for (let v = 0; v < n; v++) {
        if (!(mask & (1 << v))) {
          const nm = mask | (1 << v);
          dp[nm][v] = Math.min(dp[nm][v], dp[mask][u] + cost[u][v]);
        }
      }
    }
  }
  let ans = INF;
  for (let u = 0; u < n; u++) ans = Math.min(ans, dp[FULL][u] + cost[u][0]);
  return ans;
}`,
      java: `dp[mask | (1 << v)][v] = Math.min(dp[mask | (1 << v)][v], dp[mask][u] + cost[u][v]);`,
    },
    frames: [
      {
        step: 1,
        title: 'Base State: Start at City 0 → dp[001₂][0] = 0',
        explanation: '3 cities with costs: 0→1(4), 0→2(9), 1→2(2), 2→0(3), 1→0(5), 2→1(6). Bitmask 001₂ means {0} visited.',
        invariantCheck: 'Only mask 001₂ at city 0 is reachable with cost 0.',
        variables: [{ name: 'mask', value: '001₂ ({0})' }, { name: 'dp[001][0]', value: '0' }],
        matrix: {
          subtitle: 'Bitmask DP Table — Rows = Visited Subset Mask · Cols = Last City',
          rowLabels: ['001 {0}', '011 {0,1}', '101 {0,2}', '111 {0,1,2}'], colLabels: ['end 0', 'end 1', 'end 2'],
          cells: [[0, '∞', '∞'], ['∞', '∞', '∞'], ['∞', '∞', '∞'], ['∞', '∞', '∞']],
          activeCells: [[0, 0]],
        },
      },
      {
        step: 2,
        title: 'Expand From {0}: Visit 1 (011₂: 4) and Visit 2 (101₂: 9)',
        explanation: 'mask | (1<<1) = 011₂ sets dp[011][1] = 4; mask | (1<<2) = 101₂ sets dp[101][2] = 9.',
        invariantCheck: '2-city submasks filled cleanly from 1-city mask.',
        variables: [{ name: '0→1', value: 'dp[011][1] = 4' }, { name: '0→2', value: 'dp[101][2] = 9' }],
        matrix: {
          subtitle: '2-City Subset Transitions Completed',
          rowLabels: ['001 {0}', '011 {0,1}', '101 {0,2}', '111 {0,1,2}'], colLabels: ['end 0', 'end 1', 'end 2'],
          cells: [[0, '∞', '∞'], ['∞', 4, '∞'], ['∞', '∞', 9], ['∞', '∞', '∞']],
          activeCells: [[1, 1], [2, 2]], matchedCells: [[0, 0]],
        },
      },
      {
        step: 3,
        title: 'Full Mask 111₂: Optimal Tour 0 → 1 → 2 → 0 = 4 + 2 + 3 = 9!',
        explanation: 'dp[111][2] = dp[011][1]+2 = 6; closing back to 0 adds 3 → total tour = 9 (beating 0→2→1→0 = 20)!',
        invariantCheck: 'Every permutation compressed into 2^N subset states.',
        variables: [{ name: 'dp[111][2]', value: '6' }, { name: 'return → 0', value: '6 + 3 = 9 ✓' }],
        matrix: {
          subtitle: 'Full Mask 111₂ Completed — Min Closed Tour = 9',
          rowLabels: ['001 {0}', '011 {0,1}', '101 {0,2}', '111 {0,1,2}'], colLabels: ['end 0', 'end 1', 'end 2'],
          cells: [[0, '∞', '∞'], ['∞', 4, '∞'], ['∞', '∞', 9], ['∞', 15, 6]],
          matchedCells: [[0, 0], [1, 1], [3, 2]],
        },
      },
    ],
  },

  // 37. Digit DP
  {
    id: 'digit-dp',
    name: 'Digit DP (Range [L, R] Digit Constraints)',
    shortName: 'Digit DP',
    category: 'Advanced Dynamic Programming',
    visualType: 'number-sieve',
    tagline: 'Count numbers in [L, R] (up to 10¹⁸!) matching digit rules in O(Digits · States).',
    timeComplexity: 'O(D · S · 10)',
    spaceComplexity: 'O(D · S)',
    complexityLeap: 'O(R - L) iterating 10¹⁸ integers → O(18 × States) memoized digit DFS',
    coreIdea:
      'Convert upper bound N into a digit string and fill positions pos = 0..D-1 left-to-right. Track a boolean `tight` flag indicating whether all prior digits matched N’s prefix (capping current digit at `digits[pos]` instead of 9). Answer(L, R) = solve(R) - solve(L - 1)!',
    mentalModelSteps: [
      'Write solve(N) counting valid integers in [0, N]; final range answer is solve(R) - solve(L - 1).',
      'DFS state: (pos, tight, stateMetric, started) where tight restricts digit d <= (tight ? digits[pos] : 9).',
      'Next tight flag is `nextTight = tight && (d === limit)`.',
      'Memoize ONLY when `!tight` (or include tight in cache key) so states reuse across all suffixes!',
    ],
    loopInvariant: 'Once tight flips from true to false, every remaining digit can freely choose 0..9.',
    whenToUse: [
      'Numbers At Most N Given Digit Set (LC 902) & Count Special Integers (LC 2376 — distinct digits)',
      'Number of Digit One (LC 233) & Count Numbers in [L, R] with Digit Sum == K',
    ],
    whenItFails: 'Only for decimal/base-B positional constraints — not for general divisibility by arbitrary prime factors without mod state.',
    linkedTopics: ['Dynamic Programming'],
    linkedProblemSlugs: ['climbing-stairs', 'coin-change', 'edit-distance'],
    templates: {
      python: `from functools import lru_cache
def count_digit_sum(n, target):
    s = str(n)
    @lru_cache(None)
    def dfs(pos, rem, tight):
        if rem < 0: return 0
        if pos == len(s): return 1 if rem == 0 else 0
        lim = int(s[pos]) if tight else 9
        return sum(dfs(pos + 1, rem - d, tight and d == lim) for d in range(lim + 1))
    return dfs(0, target, True)`,
      js: `function countWithDigitSum(n, target) {
  const s = String(n), memo = new Map();
  function dfs(pos, rem, tight) {
    if (rem < 0) return 0;
    if (pos === s.length) return rem === 0 ? 1 : 0;
    const key = \`\${pos},\${rem},\${tight ? 1 : 0}\`;
    if (memo.has(key)) return memo.get(key);
    const lim = tight ? Number(s[pos]) : 9;
    let ways = 0;
    for (let d = 0; d <= lim; d++) ways += dfs(pos + 1, rem - d, tight && d === lim);
    memo.set(key, ways);
    return ways;
  }
  return dfs(0, target, true);
}`,
      java: `int lim = tight ? s.charAt(pos) - '0' : 9;`,
    },
    frames: [
      {
        step: 1,
        title: 'Goal: Count Numbers ≤ 325 Whose Digit Sum Equals 5',
        explanation: 'At pos = 0, tight = true caps first digit at 3 (choices: 0, 1, 2, 3).',
        invariantCheck: 'Prefix digits strictly bounded by "325".',
        variables: [{ name: 'bound N', value: '325' }, { name: 'target sum', value: '5' }, { name: 'pos 0 limit', value: '0..3 (tight)' }],
        array: ['3', '2', '5'], secondaryArray: ['0..3', '?', '?'],
        pointers: [{ label: 'pos=0', index: 0, tone: 'sky' }], highlightIndices: [0],
        hashEntries: [{ key: 'd ∈ {0,1,2}', val: 'tight → FALSE (free!)' }, { key: 'd = 3', val: 'tight → TRUE (bound 2)', active: true }],
      },
      {
        step: 2,
        title: 'Branch d₀ < 3 Unlocks Free Suffixes (tight = false → 0..9!)',
        explanation: 'Choosing d₀ = 1 leaves rem = 4 with tight = false! Positions 1 & 2 can pick ANY digits summing to 4: (04,13,22,31,40 = 5 ways), cached cleanly!',
        invariantCheck: 'Unbound states (tight=false) are memoized & reused across prefixes.',
        variables: [{ name: 'd₀ = 1', value: 'tight = FALSE' }, { name: 'memo(1, 4, F)', value: '5 ways' }],
        array: ['1', '0..9', '0..9'], secondaryArray: ['picked', 'free', 'free'],
        matchedIndices: [0], highlightIndices: [1, 2],
        hashEntries: [{ key: 'd₀=0 (rem 5)', val: '6 ways' }, { key: 'd₀=1 (rem 4)', val: '5 ways', hit: true }, { key: 'd₀=2 (rem 3)', val: '4 ways' }],
      },
      {
        step: 3,
        title: 'Tight Branch d₀ = 3 Caps pos 1 at 2 → Total = 18 Numbers!',
        explanation: 'With d₀ = 3 (rem = 2, tight=true): 302, 311, 320 (3 valid numbers ≤ 325). Total = 6 + 5 + 4 + 3 = 18!',
        invariantCheck: 'Solved in O(3 × 6 × 10) instead of scanning all 325 numbers.',
        variables: [{ name: 'tight d₀=3', value: '302, 311, 320 (3)' }, { name: 'TOTAL', value: '6+5+4+3 = 18 ✓' }],
        array: ['3', '2', '0'], secondaryArray: ['tight', 'tight', 'rem=0'],
        matchedIndices: [0, 1, 2],
        hashEntries: [{ key: 'Sum of branches', val: '6 + 5 + 4 + 3 = 18', hit: true }],
      },
    ],
  },

  // 38. DP on Trees (Rerooting Technique)
  {
    id: 'dp-on-trees-rerooting',
    name: 'DP on Trees (Rerooting Technique)',
    shortName: 'Tree Rerooting DP',
    category: 'Advanced Dynamic Programming',
    visualType: 'tree-structure',
    tagline: 'Compute optimal tree answers for EVERY vertex as root in O(N) via two DFS passes.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) running a fresh DFS from every root → O(N) two-pass rerooting shift',
    coreIdea:
      'DFS #1 (bottom-up from arbitrary root 0) computes subtree size sz[u] and subtree answer down[u]. DFS #2 (top-down) shifts the root across edge u → v in O(1): every node inside v’s subtree moves 1 step CLOSER (-sz[v]), while every node outside moves 1 step FARTHER (+(N - sz[v]))!',
    mentalModelSteps: [
      'DFS #1 (Postorder from 0): compute sz[u] = 1 + Σ sz[v] and distSum[0] = Σ (distSum[v] + sz[v]).',
      'Now ans[0] is completely exact!',
      'DFS #2 (Preorder from 0): when moving root from parent u to child v, ans[v] = ans[u] - sz[v] + (N - sz[v]).',
      'Every node receives its exact all-nodes distance sum in O(1) per edge → O(N) total!',
    ],
    loopInvariant: 'When DFS #2 enters child v, parent ans[u] is already globally finalized.',
    whenToUse: [
      'Sum of Distances in Tree (LC 834 — textbook 2-pass rerooting!)',
      'Minimum Height Trees / Longest Path From Every Node (CSES Tree Distances I & II)',
    ],
    whenItFails: 'When combining non-invertible ops (like max without subtraction), maintain prefix/suffix child aggregates during DFS #2 instead of subtracting.',
    linkedTopics: ['Trees DFS/BFS', 'Dynamic Programming'],
    linkedProblemSlugs: ['diameter-of-binary-tree', 'binary-tree-maximum-path-sum', 'lowest-common-ancestor'],
    templates: {
      python: `def sum_of_distances(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges: adj[u].append(v); adj[v].append(u)
    sz, ans = [1]*n, [0]*n
    def dfs1(u, p):
        for v in adj[u]:
            if v == p: continue
            dfs1(v, u); sz[u] += sz[v]; ans[0] += ans[v] + sz[v]
    def dfs2(u, p):
        for v in adj[u]:
            if v == p: continue
            ans[v] = ans[u] - sz[v] + (n - sz[v])
            dfs2(v, u)
    dfs1(0, -1); dfs2(0, -1)
    return ans`,
      js: `function sumOfDistancesInTree(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const sz = new Array(n).fill(1), ans = new Array(n).fill(0);
  function dfs1(u, p) {
    for (const v of adj[u]) {
      if (v === p) continue;
      dfs1(v, u); sz[u] += sz[v]; ans[u] += ans[v] + sz[v];
    }
  }
  function dfs2(u, p) {
    for (const v of adj[u]) {
      if (v === p) continue;
      ans[v] = ans[u] - sz[v] + (n - sz[v]);
      dfs2(v, u);
    }
  }
  dfs1(0, -1); dfs2(0, -1);
  return ans;
}`,
      java: `ans[v] = ans[u] - sz[v] + (n - sz[v]); // O(1) root shift formula`,
    },
    frames: [
      {
        step: 1,
        title: 'DFS #1 (Bottom-Up): Compute Subtree Sizes & Root 0 Sum = 6',
        explanation: '5-node tree rooted at 0: sz = [5, 1, 3, 1, 1]. Distance sum from root 0 = 1 + 1 + 2 + 2 = 6.',
        invariantCheck: 'ans[0] = 6 is exact; all sz[u] computed bottom-up.',
        variables: [{ name: 'pass', value: 'DFS #1 (Postorder)' }, { name: 'ans[0]', value: '6' }],
        activeNodes: ['0'], visitedNodes: ['0', '1', '2', '3', '4'],
        nodeBadges: { '0': 'sz:5 d:6', '1': 'sz:1', '2': 'sz:3', '3': 'sz:1', '4': 'sz:1' },
        graphSpec: {
          caption: 'Pass 1 computes sz[] & exact root answer ans[0] = 6',
          nodes: [
            { id: '0', x: 250, y: 36, group: 1 }, { id: '1', x: 135, y: 112 },
            { id: '2', x: 350, y: 112 }, { id: '3', x: 280, y: 190 }, { id: '4', x: 420, y: 190 },
          ],
          edges: [{ u: '0', v: '1' }, { u: '0', v: '2' }, { u: '2', v: '3' }, { u: '2', v: '4' }],
        },
      },
      {
        step: 2,
        title: 'DFS #2 Reroot 0 → 2: ans[2] = 6 - 3 + (5 - 3) = 5!',
        explanation: 'Shifting root from 0 to 2 moves 3 nodes ({2,3,4}) 1 step closer (-3) and 2 nodes ({0,1}) 1 step farther (+2) → 6 - 3 + 2 = 5!',
        invariantCheck: 'O(1) formula avoids re-traversing the tree!',
        variables: [{ name: 'shift', value: '0 → 2 (sz[2]=3)' }, { name: 'ans[2]', value: '6 - 3 + 2 = 5' }],
        activeNodes: ['2'], visitedNodes: ['0', '2'], activeEdges: ['0->2'],
        nodeBadges: { '0': 'ans:6', '1': 'sz:1', '2': 'ans:5 ✓', '3': 'sz:1', '4': 'sz:1' },
        graphSpec: {
          caption: 'Rerooting 0 → 2 updates answer in O(1): 6 - 3 + 2 = 5',
          nodes: [
            { id: '0', x: 250, y: 36 }, { id: '1', x: 135, y: 112 },
            { id: '2', x: 350, y: 112, group: 2 }, { id: '3', x: 280, y: 190 }, { id: '4', x: 420, y: 190 },
          ],
          edges: [{ u: '0', v: '1' }, { u: '0', v: '2', label: '-3 +2', directed: true }, { u: '2', v: '3' }, { u: '2', v: '4' }],
        },
      },
      {
        step: 3,
        title: 'Complete Rerooting: All 5 Roots Solved in O(N) → [6, 9, 5, 8, 8]!',
        explanation: 'ans[1]=6-1+4=9, ans[3]=5-1+4=8, ans[4]=5-1+4=8. Every single node evaluated in 2 linear passes!',
        invariantCheck: 'Total complexity = O(N) instead of O(N²).',
        variables: [{ name: 'ans[]', value: '[6, 9, 5, 8, 8]' }, { name: 'best center', value: 'Node 2 (sum 5)' }],
        visitedNodes: ['0', '1', '2', '3', '4'], activeEdges: ['0->1', '0->2', '2->3', '2->4'],
        nodeBadges: { '0': '6', '1': '9', '2': '5 ★', '3': '8', '4': '8' },
        graphSpec: {
          caption: 'All-roots distance sums completed in O(N)',
          nodes: [
            { id: '0', x: 250, y: 36, group: 1 }, { id: '1', x: 135, y: 112, group: 1 },
            { id: '2', x: 350, y: 112, group: 2 }, { id: '3', x: 280, y: 190, group: 1 }, { id: '4', x: 420, y: 190, group: 1 },
          ],
          edges: [{ u: '0', v: '1' }, { u: '0', v: '2' }, { u: '2', v: '3' }, { u: '2', v: '4' }],
        },
      },
    ],
  },

  // 39. Convex Hull Trick (CHT)
  {
    id: 'convex-hull-trick',
    name: 'Convex Hull Trick (CHT DP Optimization)',
    shortName: 'Convex Hull Trick',
    category: 'Advanced Dynamic Programming',
    visualType: 'geometry-hull',
    tagline: 'Optimize linear DP recurrences dp[i] = min(m_j · x_i + b_j) from O(N²) to O(N) via lower envelope.',
    timeComplexity: 'O(N) monotonic · O(N log N) general',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) scanning all prior j → O(1) amortized deque / O(log N) envelope query',
    coreIdea:
      'Rewrite DP transition dp[i] = min_j (m_j · x_i + b_j) as evaluating a set of 2D lines y = m·x + b at query x_i. Maintain only lines forming the LOWER CONVEX ENVELOPE in a deque: if middle line L2 is strictly above the intersection of L1 & L3, L2 can NEVER be optimal and is popped permanently!',
    mentalModelSteps: [
      'Factor DP recurrence into line form: slope m_j, intercept b_j, and query x_i.',
      'Check dominance test bad(L1, L2, L3): intersect(L1, L3) <= intersect(L1, L2) → pop middle line L2!',
      'When inserting strictly decreasing slopes m_j, pop dominated lines from the BACK of the deque.',
      'When queries x_i increase monotonically, pop stale lines from the FRONT while L0(x) >= L1(x); answer is deque[0](x)!',
    ],
    loopInvariant: 'Intersection x-coordinates between consecutive lines in the deque are strictly increasing.',
    whenToUse: [
      'DP recurrences with cross-term `a[i] * b[j]` (Batch Scheduling, Machine Works, USACO Land Acquisition)',
      'Minimum Cost to Cut/Partition with quadratic prefix penalties `(P[i] - P[j])²`',
    ],
    whenItFails: 'If slopes & queries are completely arbitrary (non-monotonic), replace the monotonic deque with a Li Chao Segment Tree O(N log X).',
    linkedTopics: ['Dynamic Programming', 'Monotonic Stack'],
    linkedProblemSlugs: ['coin-change', 'longest-increasing-subsequence', 'largest-rectangle-in-histogram'],
    templates: {
      python: `from collections import deque
# Decreasing slopes m, increasing queries x -> O(N) total
def bad(l1, l2, l3):
    # (b3 - b1)/(m1 - m3) <= (b2 - b1)/(m1 - m2) using cross-multiply
    return (l3[1] - l1[1]) * (l1[0] - l2[0]) <= (l2[1] - l1[1]) * (l1[0] - l3[0])

def add_line(hull, m, b):
    while len(hull) >= 2 and bad(hull[-2], hull[-1], (m, b)):
        hull.pop()
    hull.append((m, b))`,
      js: `function bad(l1, l2, l3) {
  return (l3[1] - l1[1]) * (l1[0] - l2[0]) <= (l2[1] - l1[1]) * (l1[0] - l3[0]);
}
function evalLine(l, x) { return l[0] * x + l[1]; }`,
      java: `// Cross-product intersection test avoids floating-point precision bugs
(l3.b - l1.b) * (l1.m - l2.m) <= (l2.b - l1.b) * (l1.m - l3.m)`,
    },
    frames: [
      {
        step: 1,
        title: 'Add Lines L1: y = -1x + 7 and L2: y = -2x + 9 (Lower Envelope)',
        explanation: 'L1 & L2 intersect at x = 2 (y = 5). For x < 2, L1 is lower; for x > 2, L2 is lower.',
        invariantCheck: 'Envelope holds [L1, L2] with increasing intersection points.',
        variables: [{ name: 'L1', value: 'y = -x + 7' }, { name: 'L2', value: 'y = -2x + 9' }],
        geometrySpec: {
          mode: 'lines',
          caption: 'Lower Envelope of Linear DP Functions y = m·x + b',
          points: [{ x: 2, y: 5, label: 'x=2', highlight: true }],
          lines: [
            { m: -1, b: 7, label: 'L1 (-x+7)', status: 'hull' },
            { m: -2, b: 9, label: 'L2 (-2x+9)', status: 'hull' },
          ],
        },
      },
      {
        step: 2,
        title: 'Insert L3: y = -3x + 10 → Pops Dominated L2 Permanently!',
        explanation: 'intersect(L1, L3) = 1.5 ≤ intersect(L1, L2) = 2! L2 sits STRICTLY ABOVE min(L1, L3) everywhere — pop L2!',
        invariantCheck: 'Every line pushed & popped at most once → O(N) amortized!',
        variables: [{ name: 'L3', value: 'y = -3x + 10' }, { name: 'popped', value: 'L2 (never optimal!)' }],
        geometrySpec: {
          mode: 'lines',
          caption: 'L3 dominates L2 everywhere → Pop L2 from deque!',
          points: [{ x: 1.5, y: 5.5, label: 'x=1.5', highlight: true }],
          lines: [
            { m: -1, b: 7, label: 'L1 (-x+7)', status: 'hull' },
            { m: -2, b: 9, label: 'L2 (POPPED)', status: 'pruned' },
            { m: -3, b: 10, label: 'L3 (-3x+10)', status: 'active' },
          ],
        },
      },
      {
        step: 3,
        title: 'Monotonic Query x = 3 → Pop Stale Front L1, Return L3(3) = 1!',
        explanation: 'At x = 3: L1(3)=4 > L3(3)=1. Pop L1 from front! Minimum value at x=3 is 1 in O(1) amortized!',
        invariantCheck: 'Monotonic queries x advance front pointer monotonically.',
        variables: [{ name: 'query x', value: '3' }, { name: 'min y', value: 'L3(3) = 1 ✓' }],
        geometrySpec: {
          mode: 'lines',
          caption: 'Query x = 3 hits lower envelope at L3(3) = 1',
          queryX: 3,
          points: [{ x: 3, y: 1, label: '(3, 1) ★', highlight: true }],
          lines: [
            { m: -1, b: 7, label: 'L1 (stale)', status: 'pruned' },
            { m: -3, b: 10, label: 'L3 (BEST)', status: 'hull' },
          ],
        },
      },
    ],
  },
];

export const ADV_DP_PRACTICE: Record<string, AlgorithmPracticeSpec> = {
  'bitmask-dp': {
    algorithmId: 'bitmask-dp',
    functionName: 'tspMinTour',
    title: 'Traveling Salesman Minimum Closed Tour (Bitmask DP)',
    prompt: 'Given an n×n cost matrix (n ≤ 12), return the minimum cost of a Hamiltonian cycle starting and ending at city 0.',
    structuredSteps: [
      { step: '1. Allocate dp[1 << n][n]', detail: 'Initialize with Infinity and set base case dp[1][0] = 0.' },
      { step: '2. Submask Transitions', detail: 'For each mask & visited u, relax unvisited v via nm = mask | (1 << v).' },
      { step: '3. Close Tour Back to 0', detail: 'Return min over all u of dp[(1<<n)-1][u] + cost[u][0].' },
    ],
    starterCode: `function tspMinTour(cost) {
  const n = cost.length, INF = 1e9;
  // TODO: Bitmask DP over dp[1 << n][n]
  return 0;
}`,
    solutionCode: `function tspMinTour(cost) {
  const n = cost.length, INF = 1e9, FULL = (1 << n) - 1;
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(INF));
  dp[1][0] = 0;
  for (let mask = 1; mask <= FULL; mask++) {
    for (let u = 0; u < n; u++) {
      if (dp[mask][u] === INF) continue;
      for (let v = 0; v < n; v++) {
        if (!(mask & (1 << v))) {
          const nm = mask | (1 << v);
          if (dp[mask][u] + cost[u][v] < dp[nm][v]) dp[nm][v] = dp[mask][u] + cost[u][v];
        }
      }
    }
  }
  let ans = INF;
  for (let u = 0; u < n; u++) ans = Math.min(ans, dp[FULL][u] + cost[u][0]);
  return ans;
}`,
    testCases: [
      { label: '3-city asymmetric tour = 9', args: [[[0, 4, 9], [5, 0, 2], [3, 6, 0]]], expected: 9 },
      { label: '4-city symmetric tour = 80', args: [[[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]], expected: 80 },
      { label: '2-city tour', args: [[[0, 7], [3, 0]]], expected: 10 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 847', title: 'Shortest Path Visiting All Nodes', difficulty: 'Hard', focus: 'BFS + Bitmask state (node, visitedMask)' },
      { platform: 'LeetCode', number: 'LC 698', title: 'Partition to K Equal Sum Subsets', difficulty: 'Medium', focus: '1D Bitmask DP over subset sums' },
      { platform: 'CSES', number: 'CSES 1690', title: 'Hamiltonian Flights', difficulty: 'Hard', focus: 'Count paths in O(N²·2^N) Bitmask DP' },
    ],
  },
  'digit-dp': {
    algorithmId: 'digit-dp',
    functionName: 'countDigitSumRange',
    title: 'Count Integers in [L, R] With Exact Digit Sum K',
    prompt: 'Using Digit DP (solve(R) - solve(L - 1)), return how many integers x in [L, R] have digits summing exactly to targetSum.',
    structuredSteps: [
      { step: '1. Prefix Decomposition', detail: 'Implement solve(N) for [0..N], then return solve(R) - (L > 0 ? solve(L - 1) : 0).' },
      { step: '2. Tight Bound Recursion', detail: 'lim = tight ? Number(s[pos]) : 9; recurse with tight && d === lim.' },
      { step: '3. Memoize (pos, rem, tight)', detail: 'Cache results to achieve O(Digits × TargetSum) runtime.' },
    ],
    starterCode: `function countDigitSumRange(L, R, targetSum) {
  // TODO: Implement Digit DP solve(N) and return solve(R) - solve(L - 1)
  return 0;
}`,
    solutionCode: `function countDigitSumRange(L, R, targetSum) {
  const solve = (n) => {
    if (n < 0) return 0;
    const s = String(n), memo = new Map();
    const dfs = (pos, rem, tight) => {
      if (rem < 0) return 0;
      if (pos === s.length) return rem === 0 ? 1 : 0;
      const key = pos + ',' + rem + ',' + (tight ? 1 : 0);
      if (memo.has(key)) return memo.get(key);
      const lim = tight ? Number(s[pos]) : 9;
      let ways = 0;
      for (let d = 0; d <= lim; d++) ways += dfs(pos + 1, rem - d, tight && d === lim);
      memo.set(key, ways);
      return ways;
    };
    return dfs(0, targetSum, true);
  };
  return solve(R) - solve(L - 1);
}`,
    testCases: [
      { label: '[0, 325] with digit sum 5 → 18', args: [0, 325, 5], expected: 18 },
      { label: '[10, 50] with digit sum 5 → 5 (14,23,32,41,50)', args: [10, 50, 5], expected: 5 },
      { label: '[100, 999] with digit sum 1 → 1 (100)', args: [100, 999, 1], expected: 1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 2376', title: 'Count Special Integers', difficulty: 'Hard', focus: 'Digit DP + 10-bit used-digits mask' },
      { platform: 'LeetCode', number: 'LC 2719', title: 'Count of Integers', difficulty: 'Hard', focus: 'Digit sum in [minSum, maxSum] over huge strings' },
      { platform: 'CSES', number: 'CSES 2220', title: 'Counting Numbers', difficulty: 'Hard', focus: 'Digit DP with no two adjacent equal digits' },
    ],
  },
  'dp-on-trees-rerooting': {
    algorithmId: 'dp-on-trees-rerooting',
    functionName: 'sumOfDistancesInTree',
    title: 'All-Roots Tree Distance Sums (2-Pass Rerooting DP)',
    prompt: 'Given n nodes (0..n-1) and undirected tree edges, return ans[i] = sum of distances from node i to all other nodes in O(N).',
    structuredSteps: [
      { step: '1. DFS #1 Bottom-Up', detail: 'Compute subtree size sz[u] and root 0 distance sum ans[0].' },
      { step: '2. O(1) Rerooting Formula', detail: 'ans[v] = ans[u] - sz[v] + (n - sz[v]).' },
      { step: '3. DFS #2 Top-Down', detail: 'Propagate ans[] from root 0 to every child in one pass.' },
    ],
    starterCode: `function sumOfDistancesInTree(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  // TODO: Two-pass rerooting DFS
  return new Array(n).fill(0);
}`,
    solutionCode: `function sumOfDistancesInTree(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const sz = new Array(n).fill(1), ans = new Array(n).fill(0);
  function dfs1(u, p) {
    for (const v of adj[u]) {
      if (v === p) continue;
      dfs1(v, u); sz[u] += sz[v]; ans[u] += ans[v] + sz[v];
    }
  }
  function dfs2(u, p) {
    for (const v of adj[u]) {
      if (v === p) continue;
      ans[v] = ans[u] - sz[v] + (n - sz[v]);
      dfs2(v, u);
    }
  }
  dfs1(0, -1); dfs2(0, -1);
  return ans;
}`,
    testCases: [
      { label: '5-node tree → [6, 9, 5, 8, 8]', args: [5, [[0, 1], [0, 2], [2, 3], [2, 4]]], expected: [6, 9, 5, 8, 8] },
      { label: 'LC 834 classic 6-node tree', args: [6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]], expected: [8, 12, 6, 10, 10, 10] },
      { label: 'Single node', args: [1, []], expected: [0] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 834', title: 'Sum of Distances in Tree', difficulty: 'Hard', focus: 'Canonical 2-pass Tree Rerooting DP' },
      { platform: 'CSES', number: 'CSES 1133', title: 'Tree Distances II', difficulty: 'Medium', focus: '200,000-node O(N) rerooting benchmark' },
      { platform: 'LeetCode', number: 'LC 2581', title: 'Count Number of Possible Root Nodes', difficulty: 'Hard', focus: 'Rerooting edge-guess count in O(N)' },
    ],
  },
  'convex-hull-trick': {
    algorithmId: 'convex-hull-trick',
    functionName: 'chtMinQueries',
    title: 'Monotonic Convex Hull Trick Envelope Evaluator',
    prompt: 'Given lines [[m, b], ...] with strictly decreasing slopes m and strictly increasing queries xs, return the minimum m*x + b for each query x in O(L + Q).',
    structuredSteps: [
      { step: '1. Dominance Cross-Test', detail: 'Pop middle line L2 whenever intersect(L1, L3) <= intersect(L1, L2) via integer cross-multiplication.' },
      { step: '2. Build Lower Envelope', detail: 'Insert all decreasing-slope lines maintaining hull deque.' },
      { step: '3. Advance Front Pointer', detail: 'For increasing x, advance head while eval(hull[head], x) >= eval(hull[head+1], x).' },
    ],
    starterCode: `function chtMinQueries(lines, xs) {
  // TODO: Maintain lower convex envelope deque and evaluate increasing queries xs
  return [];
}`,
    solutionCode: `function chtMinQueries(lines, xs) {
  const bad = (l1, l2, l3) => (l3[1] - l1[1]) * (l1[0] - l2[0]) <= (l2[1] - l1[1]) * (l1[0] - l3[0]);
  const val = (l, x) => l[0] * x + l[1];
  const hull = [];
  for (const line of lines) {
    while (hull.length >= 2 && bad(hull[hull.length - 2], hull[hull.length - 1], line)) hull.pop();
    hull.push(line);
  }
  let head = 0;
  const out = [];
  for (const x of xs) {
    while (head + 1 < hull.length && val(hull[head], x) >= val(hull[head + 1], x)) head++;
    out.push(val(hull[head], x));
  }
  return out;
}`,
    testCases: [
      { label: 'Dominated middle line L2 pruned', args: [[[-1, 7], [-2, 9], [-3, 10]], [0, 1, 2, 3]], expected: [7, 6, 4, 1] },
      { label: 'Single line', args: [[[-4, 20]], [1, 5]], expected: [16, 0] },
      { label: 'Three active envelope segments', args: [[[-1, 10], [-2, 12], [-4, 22]], [1, 3, 6]], expected: [9, 6, -2] },
    ],
    platformDrills: [
      { platform: 'CSES', number: 'CSES 2084', title: 'Monster Game I', difficulty: 'Hard', focus: 'Textbook monotonic Convex Hull Trick DP' },
      { platform: 'CSES', number: 'CSES 2085', title: 'Monster Game II', difficulty: 'Hard', focus: 'Non-monotonic Li Chao Tree upgrade' },
      { platform: 'LeetCode', number: 'LC 300', title: 'Longest Increasing Subsequence', difficulty: 'Medium', focus: 'DP optimization mindset', trainerSlug: 'longest-increasing-subsequence' },
    ],
  },
};
