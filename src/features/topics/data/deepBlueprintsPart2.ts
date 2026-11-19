import type { DeepTopicBlueprint } from './deepTopicBlueprints';

/**
 * Bespoke Deep Topic Blueprints (Part 2 of 2):
 * Covers remaining 8 Intermediate, Advanced & Applied System topics so all 22/22
 * curriculum topics have plain-English analogies, constraint proofs, bug traps,
 * and tailored active-recall drills.
 */
export const DEEP_BLUEPRINTS_PART_2: Record<string, DeepTopicBlueprint> = {
  'recursion-divide-conquer': {
    id: 'recursion-divide-conquer',
    title: 'Recursion & Divide-and-Conquer',
    category: 'Paradigms',
    eli5Analogy:
      'Think of counting how many people sit in a giant stadium: instead of walking down every aisle yourself, you split the stadium in half, delegate each half to two assistants, wait for their two numbers, and simply add them together.',
    whenToUse: [
      'Problem splits cleanly into independent smaller halves whose results combine efficiently (Merge Sort, Binary Exponentiation, Tree Traversals)',
      'Counting cross-boundary pairs like Inversions or Reverse Pairs during a Merge Sort combine step',
      'Recurrence obeys Master Theorem T(N) = aT(N/b) + f(N) with non-overlapping subproblems',
    ],
    whenNotToUse: [
      'Subproblems heavily overlap (like raw Fibonacci or Coin Change) without memoization (switch to Dynamic Programming)',
      'Recursion depth can exceed 10^4 linear frames without halving (convert to iterative stack to avoid stack overflow)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5 (halving depth = log₂N <= 17 frames)',
      expectedComplexity: 'O(N log N) or O(log N) time · O(log N) call stack',
      correctTierId: 'nlogn',
      eliminatedApproaches: ['Linear O(N) exponentiation when exponent = 10^9', 'Array slicing inside recursive calls O(N log N) RAM'],
      mathProof:
        'Halving input size per call limits call-stack height to log₂(10^5) ≈ 17 frames. Passing (lo, hi) indices keeps per-frame auxiliary space O(1).',
    },
    blankPageDrill: {
      tinyInput: 'pow(2, 10) and mergeSort([5, 2, 4, 1])',
      manualQuestion:
        'Why does writing `pow(x, n/2) * pow(x, n/2)` twice instead of caching `half = pow(x, n/2)` turn O(log N) into O(N)?',
      memoryBridge: 'Calling the same subproblem twice creates a binary tree of 2^(log N) = N calls; caching `half` keeps it a single O(log N) chain!',
      bruteBottleneck: 'Repeatedly multiplying x by itself N times fails immediately when exponent N = 2^31 - 1.',
      invariantPrompt: 'Every recursive frame must check its ___ FIRST, shrink input strictly toward it, and pass ___ instead of slicing arrays.',
      adversarialCases: [
        { label: 'Negative Min-Int Exponent', input: 'pow(2, -2147483648)', trap: 'Negating -2^31 overflows 32-bit int; promote to 64-bit / handle -n safely.' },
        { label: 'Duplicate Subcall Trap', input: 'return f(n/2) * f(n/2)', trap: 'Never invoke f(n/2) twice; store `const half = f(n/2); return half * half`.' },
        { label: 'Hidden Array Slicing', input: 'arr.slice(0, mid)', trap: 'Slicing allocates O(N) per frame; pass `(lo, hi)` indices instead.' },
        { label: 'Base Case Order', input: 'lo >= hi', trap: 'Forgetting `lo >= hi` causes infinite recursion on empty subarrays.' },
      ],
    },
    coreInvariant:
      'Trust the recursive contract on strictly smaller subproblems (mathematical induction), guard the base case on line 1, and never recompute identical halves twice.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Calling recursive half twice in Binary Exponentiation',
        badSnippet: 'return myPow(x, n >> 1) * myPow(x, n >> 1); // O(N) tree blowup!',
        fixedSnippet: 'const half = myPow(x, Math.floor(n / 2)); return n % 2 === 0 ? half * half : half * half * x;',
        whyItHappens: 'Two identical recursive calls double work at every depth, turning log₂(N) work into 2^(log₂N) = N.',
      },
      {
        bugTitle: 'Slicing arrays inside Divide-and-Conquer calls',
        badSnippet: 'const left = sort(arr.slice(0, mid)); // allocates O(N log N) extra copies!',
        fixedSnippet: 'sortRange(arr, lo, mid); sortRange(arr, mid + 1, hi); // O(1) per frame',
        whyItHappens: 'Array slicing copies subarrays on every split instead of referencing index boundaries.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'rec-pow-50',
        title: 'Pow(x, n) — Binary Exponentiation (#50)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Halve exponent every step for O(log N) time',
        companyTags: ['Meta', 'Google', 'Amazon', 'LinkedIn'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the cached half-power step inside fastPow:',
          skeletonWithBlanks: `function fastPow(x: number, n: number): number {
  if (n === 0) return 1;
  const half = fastPow(x, ___BLANK_1___);
  return n % 2 === 0 ? half * half : ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Halved integer exponent',
              expected: 'Math.floor(n / 2)',
              acceptedKeywords: ['Math.floor(n / 2)', 'n >> 1', 'Math.trunc(n / 2)'],
              hint: 'Compute integer division n / 2.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Odd-exponent combine expression',
              expected: 'half * half * x',
              acceptedKeywords: ['half * half * x', 'x * half * half'],
              hint: 'Multiply half squared by one extra factor of x.',
            },
          ],
        },
      },
      {
        problemId: 'rec-construct-tree-105',
        title: 'Construct Binary Tree from Preorder & Inorder (#105)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Divide-and-conquer using O(1) HashMap root index lookup to avoid O(N²) slicing',
        companyTags: ['Amazon', 'Google', 'Meta', 'Microsoft'],
        trainerSlug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the index-bounded subtree partition:',
          skeletonWithBlanks: `function build(inL: number, inR: number): TreeNode | null {
  if (___BLANK_1___) return null;
  const val = preorder[preIdx++];
  const mid = inorderIndex.get(val)!;
  const node = new TreeNode(val);
  node.left = build(inL, ___BLANK_2___);
  node.right = build(mid + 1, inR);
  return node;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Empty range base case',
              expected: 'inL > inR',
              acceptedKeywords: ['inL > inR'],
              hint: 'Stop when left index crosses right index.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Right boundary of left subtree in inorder array',
              expected: 'mid - 1',
              acceptedKeywords: ['mid - 1'],
              hint: 'Everything strictly left of mid belongs to node.left.',
            },
          ],
        },
      },
      {
        problemId: 'rec-reverse-pairs-493',
        title: 'Reverse Pairs (#493)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Count cross-half pairs nums[i] > 2 * nums[j] in O(N) before merging sorted halves',
        companyTags: ['Google', 'Amazon', 'ByteDance'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the two-pointer cross-half count before the merge step:',
          skeletonWithBlanks: `let j = mid + 1;
for (let i = lo; i <= mid; i++) {
  while (j <= hi && ___BLANK_1___) j++;
  count += ___BLANK_2___;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Reverse pair condition on sorted halves',
              expected: 'nums[i] > 2 * nums[j]',
              acceptedKeywords: ['nums[i] > 2 * nums[j]'],
              hint: 'Advance j while left element exceeds twice the right element.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Number of valid right-half matches for index i',
              expected: 'j - (mid + 1)',
              acceptedKeywords: ['j - (mid + 1)', 'j - mid - 1'],
              hint: 'Every index from mid + 1 up to j - 1 satisfies the inequality.',
            },
          ],
        },
      },
    ],
  },

  'greedy-algorithms': {
    id: 'greedy-algorithms',
    title: 'Greedy Algorithms & Interval Exchange',
    category: 'Paradigms',
    eli5Analogy:
      'Think of scheduling the maximum number of meetings in a single conference room: always pick the meeting that ENDS earliest—because finishing sooner leaves the biggest possible open afternoon for every future meeting.',
    whenToUse: [
      'Interval problems: Merge Intervals (sort by start), Max Non-Overlapping / Min Arrows (sort by end), Meeting Rooms (sweep line)',
      'Reachability & Gas-Station frontiers where tracking the farthest reachable index resolves decisions in O(N) / O(1)',
      'You can prove an Exchange Argument: swapping any optimal choice with the greedy choice never worsens the answer',
    ],
    whenNotToUse: [
      'Arbitrary Coin Change (e.g., coins [1, 3, 4], target 6: greedy picks 4+1+1=3 coins, optimal DP picks 3+3=2 coins!)',
      '0/1 Knapsack where items cannot be split fractionally (always use Dynamic Programming)',
    ],
    constraintGuide: {
      inputBound: '1 <= N <= 10^5 intervals or steps',
      expectedComplexity: 'O(N log N) with sorting · O(N) / O(1) frontier sweep',
      correctTierId: 'nlogn',
      eliminatedApproaches: ['O(N²) Interval DP when Exchange Argument proves greedy optimality', 'Sorting by start time for max non-overlapping selection'],
      mathProof:
        'Sorting intervals takes O(N log N) followed by a single O(N) linear sweep, beating O(N²) DP by ~1,000× at N = 10^5.',
    },
    blankPageDrill: {
      tinyInput: 'intervals = [[1, 10], [2, 3], [4, 5], [6, 7]]',
      manualQuestion:
        'Why does sorting by START time fail on [[1,10],[2,3],[4,5],[6,7]] when maximizing non-overlapping intervals?',
      memoryBridge: 'Merge Intervals -> sort by START. Max Non-Overlapping / Min Removals -> sort by END.',
      bruteBottleneck: 'Trying every subset of intervals is O(2^N) and DP is O(N²); sorting by end time solves it in O(N log N).',
      invariantPrompt: 'Before committing to Greedy in an interview, always try to construct a small ___ (like coins [1,3,4], target 6).',
      adversarialCases: [
        { label: 'Long Early Interval', input: '[[1, 100], [2, 3], [4, 5]]', trap: 'Sorting by start picks [1,100] and blocks 2 smaller meetings; sort by END.' },
        { label: 'Touching Endpoints', input: '[[1, 2], [2, 3]]', trap: 'Clarify whether touching counts as overlap (`start < prevEnd` vs `start <= prevEnd`).' },
        { label: 'Unreachable Gap (Jump Game)', input: '[3, 2, 1, 0, 4]', trap: 'Return false immediately if `i > farthest` before updating farthest.' },
        { label: 'Gas Station Total Check', input: 'sum(gas) < sum(cost)', trap: 'If total gas < total cost, NO start works; otherwise reset start = i + 1 whenever tank < 0.' },
      ],
    },
    coreInvariant:
      'Pick the exact sort key or frontier metric supported by an Exchange Argument so every local commit preserves an optimal remaining subproblem.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Sorting by start time in Non-Overlapping Intervals (#435)',
        badSnippet: 'intervals.sort((a, b) => a[0] - b[0]); // keeps [1, 100] instead of [2, 3]!',
        fixedSnippet: 'intervals.sort((a, b) => a[1] - b[1]); // earliest finish frees maximum timeline',
        whyItHappens: 'Minimizing removals is equivalent to maximizing kept meetings, which requires earliest END time.',
      },
      {
        bugTitle: 'Forgetting to stop Jump Game loop at n - 2 in Jump Game II',
        badSnippet: 'for (let i = 0; i < nums.length; i++) { if (i === curEnd) jumps++; } // extra jump at last index!',
        fixedSnippet: 'for (let i = 0; i < nums.length - 1; i++) { ... }',
        whyItHappens: 'Once you reach index n - 1, you have already arrived and must not take another jump.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'greedy-jump-55',
        title: 'Jump Game (#55)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Maintain single farthest-reachable frontier in O(N) time and O(1) space',
        companyTags: ['Amazon', 'Google', 'Meta', 'Microsoft'],
        trainerSlug: 'jump-game',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the reachability guard and frontier update:',
          skeletonWithBlanks: `function canJump(nums: number[]): boolean {
  let farthest = 0;
  for (let i = 0; i < nums.length; i++) {
    if (___BLANK_1___) return false;
    farthest = Math.max(farthest, ___BLANK_2___);
  }
  return true;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Detect stranded index beyond reachable frontier',
              expected: 'i > farthest',
              acceptedKeywords: ['i > farthest'],
              hint: 'If current index i exceeds farthest, we can never step onto i.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'New reach from index i',
              expected: 'i + nums[i]',
              acceptedKeywords: ['i + nums[i]'],
              hint: 'From index i you can jump up to i + nums[i].',
            },
          ],
        },
      },
      {
        problemId: 'greedy-merge-56',
        title: 'Merge Intervals (#56)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Sort by START time and extend the last merged interval end whenever overlapping',
        companyTags: ['Meta', 'Google', 'Amazon', 'Bloomberg', 'Salesforce'],
        trainerSlug: 'merge-intervals',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the overlap merge check after sorting by start time:',
          skeletonWithBlanks: `intervals.sort((a, b) => a[0] - b[0]);
const merged: number[][] = [intervals[0]];
for (let i = 1; i < intervals.length; i++) {
  const last = merged[merged.length - 1];
  if (___BLANK_1___) last[1] = ___BLANK_2___;
  else merged.push(intervals[i]);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Overlap condition between sorted intervals',
              expected: 'intervals[i][0] <= last[1]',
              acceptedKeywords: ['intervals[i][0] <= last[1]'],
              hint: 'Intervals overlap when the next start is at or before last[1].',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Extended end boundary',
              expected: 'Math.max(last[1], intervals[i][1])',
              acceptedKeywords: ['Math.max(last[1], intervals[i][1])'],
              hint: 'Take the maximum end because intervals[i] might be fully nested inside last.',
            },
          ],
        },
      },
      {
        problemId: 'greedy-gas-134',
        title: 'Gas Station (#134)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 2 · Reset candidate start to i + 1 whenever running tank dips negative (proof by prefix dominance)',
        companyTags: ['Amazon', 'Google', 'Apple', 'Uber'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the tank reset and global feasibility check:',
          skeletonWithBlanks: `let total = 0, tank = 0, start = 0;
for (let i = 0; i < gas.length; i++) {
  const net = gas[i] - cost[i];
  total += net; tank += net;
  if (tank < 0) { ___BLANK_1___; tank = 0; }
}
return ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Advance candidate start past failed station',
              expected: 'start = i + 1',
              acceptedKeywords: ['start = i + 1'],
              hint: 'No station from start..i can reach i + 1; try i + 1 next.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Return start if total gas covers total cost',
              expected: 'total >= 0 ? start : -1',
              acceptedKeywords: ['total >= 0', 'start', '-1'],
              hint: 'A circular tour exists if and only if total >= 0.',
            },
          ],
        },
      },
    ],
  },

  'graphs-traversal-dsu': {
    id: 'graphs-traversal-dsu',
    title: 'Graphs (BFS, DFS, Topo Sort, DSU & Dijkstra)',
    category: 'Trees & Graphs',
    eli5Analogy:
      'Think of a city road network: BFS spreads like ripples in a pond to find minimum hops; Topological Sort follows recipe dependencies where steps with 0 remaining prerequisites go next; Union-Find merges connected neighborhoods in near-O(1); Dijkstra uses a GPS priority queue to expand the closest unvisited intersection first.',
    whenToUse: [
      'Unweighted shortest path or grid spread (Rotting Oranges, Word Ladder) -> Multi-Source BFS',
      'Task / course ordering or cycle detection in directed graphs -> Kahn Indegree Topological Sort',
      'Dynamic undirected connectivity, redundant edge detection, or Kruskal MST -> Union-Find (DSU)',
      'Shortest path with non-negative edge weights -> Min-Heap Dijkstra (switch to Bellman-Ford if negative weights or <= K stops)',
    ],
    whenNotToUse: [
      'Using DFS to find unweighted shortest paths (DFS explores arbitrary deep detours, not minimum hops)',
      'Using Dijkstra when negative edge weights exist (greedy finality breaks; use Bellman-Ford)',
      'Using Union-Find to detect cycles in a DIRECTED graph (DSU treats edges as undirected)',
    ],
    constraintGuide: {
      inputBound: '1 <= V, E <= 10^5 vertices/edges',
      expectedComplexity: 'O(V + E) BFS/DFS/Topo · O(E α(V)) DSU · O((V + E) log V) Dijkstra',
      correctTierId: 'nlogn',
      eliminatedApproaches: ['Floyd-Warshall O(V³) on sparse graphs V > 500', 'Marking BFS visited on dequeue (exponential duplicates)'],
      mathProof:
        'Adjacency lists visit every vertex and directed edge once in O(V + E) (~2×10^5 ops), whereas adjacency matrix scanning takes O(V²) = 10^10 ops.',
    },
    blankPageDrill: {
      tinyInput: 'Course Schedule: numCourses=4, prereqs=[[1,0],[2,0],[3,1],[3,2]]',
      manualQuestion:
        'In BFS on a grid, what catastrophic bug happens if you set `visited[nr][nc] = true` AFTER popping from the queue instead of BEFORE pushing?',
      memoryBridge: 'Two neighbors push the same cell twice, causing exponential duplicate entries in the queue; ALWAYS mark visited ON ENQUEUE.',
      bruteBottleneck: 'Re-running DFS per query/edge costs O(E·V) instead of O(α(V)) with Path-Compressed Union-Find.',
      invariantPrompt: 'In Kahn Topo Sort, a directed cycle exists if and only if processedCount ___ V; in Dijkstra, skip stale heap entries when ___.',
      adversarialCases: [
        { label: 'Disconnected Graph', input: '5 nodes, 1 edge (0-1)', trap: 'Always loop `for (let u = 0; u < n; u++)` so isolated components are never missed.' },
        { label: 'Reversed Prereq Edge', input: '[course, prereq]', trap: 'Edge goes `prereq -> course` and increments `indegree[course]++`.' },
        { label: 'Stale Heap Entry', input: 'Multiple paths relax same node u', trap: 'Include `if (d > dist[u]) continue;` right after popping from Min-Heap.' },
        { label: 'Negative Weight Edge', input: 'Edge weight = -5', trap: 'Immediately pivot from Dijkstra to Bellman-Ford.' },
      ],
    },
    coreInvariant:
      'Choose the exact graph engine by edge semantics: Unweighted -> BFS (mark on enqueue), DAG Order -> Kahn Indegree, Undirected Merges -> DSU, Weighted >= 0 -> Dijkstra.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Marking visited on dequeue instead of enqueue in BFS',
        badSnippet: 'const cur = q.shift(); visited.add(cur); // cell gets pushed multiple times -> TLE/MLE!',
        fixedSnippet: 'visited.add(next); q.push(next); // mark IMMEDIATELY upon discovery',
        whyItHappens: 'In grids, every cell has up to 4 neighbors; delaying visited marking lets multiple parents enqueue the same cell.',
      },
      {
        bugTitle: 'Omitting stale-distance guard in Dijkstra',
        badSnippet: 'const [d, u] = pq.pop(); for (const [v, w] of adj[u]) ... // re-relaxes dominated paths!',
        fixedSnippet: 'const [d, u] = pq.pop(); if (d > dist[u]) continue;',
        whyItHappens: 'Lazy priority queues hold older longer distances for u; skipping stale pops guarantees O((V + E) log V).',
      },
    ],
    linkedProblems: [
      {
        problemId: 'graph-islands-200',
        title: 'Number of Islands (#200)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Grid flood-fill DFS/BFS counting connected land components in O(R·C)',
        companyTags: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Bloomberg'],
        trainerSlug: 'number-of-islands',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the out-of-bounds/water guard and in-place visited sink:',
          skeletonWithBlanks: `function dfs(r: number, c: number): void {
  if (r < 0 || c < 0 || r >= R || c >= C || ___BLANK_1___) return;
  ___BLANK_2___;
  dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Stop on water or already-visited cell',
              expected: "grid[r][c] !== '1'",
              acceptedKeywords: ["grid[r][c] !== '1'", "grid[r][c] === '0'"],
              hint: 'Only traverse unvisited land cells ("1").',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Mark cell visited before recursing to avoid infinite loop',
              expected: "grid[r][c] = '0'",
              acceptedKeywords: ["grid[r][c] = '0'"],
              hint: 'Sink the land cell in place to "0".',
            },
          ],
        },
      },
      {
        problemId: 'graph-course-207',
        title: 'Course Schedule — Kahn Topo Sort (#207)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Track indegrees in a directed graph; count === numCourses proves cycle-free DAG',
        companyTags: ['Meta', 'Amazon', 'Google', 'Uber'],
        trainerSlug: 'course-schedule',
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the Kahn topological relaxation and cycle verdict:',
          skeletonWithBlanks: `while (head < q.length) {
  const u = q[head++];
  taken++;
  for (const v of adj[u]) {
    if (___BLANK_1___ === 0) q.push(v);
  }
}
return ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Decrement dependent course indegree',
              expected: '--indegree[v]',
              acceptedKeywords: ['--indegree[v]', 'indegree[v] - 1'],
              hint: 'When all prerequisites of v finish, indegree[v] hits 0.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Confirm all courses completed without a cycle',
              expected: 'taken === numCourses',
              acceptedKeywords: ['taken === numCourses'],
              hint: 'Nodes trapped in a cycle never drop to indegree 0.',
            },
          ],
        },
      },
      {
        problemId: 'graph-network-delay-743',
        title: 'Network Delay Time — Dijkstra (#743)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 2 · Weighted non-negative shortest paths using Min-Heap + stale-entry guard',
        companyTags: ['Google', 'Amazon', 'Uber', 'TikTok'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the Dijkstra stale-entry skip and edge relaxation:',
          skeletonWithBlanks: `while (!pq.isEmpty()) {
  const [d, u] = pq.pop();
  if (___BLANK_1___) continue;
  for (const [v, w] of adj[u]) {
    if (___BLANK_2___) {
      dist[v] = d + w;
      pq.push([dist[v], v]);
    }
  }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Skip outdated distance tuple',
              expected: 'd > dist[u]',
              acceptedKeywords: ['d > dist[u]'],
              hint: 'If a shorter path to u was already settled, ignore this stale entry.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Strict improvement check for neighbor v',
              expected: 'd + w < dist[v]',
              acceptedKeywords: ['d + w < dist[v]'],
              hint: 'Only relax when current distance + edge weight beats dist[v].',
            },
          ],
        },
      },
    ],
  },

  'segment-fenwick-trees': {
    id: 'segment-fenwick-trees',
    title: 'Segment Trees & Fenwick Trees (BIT)',
    category: 'Trees & Graphs',
    eli5Analogy:
      'Think of a company accounting ledger organized by day, week, month, and quarter: if Tuesday sales change, you only update Tuesday, Week 1, January, and Q1 (4 numbers instead of 365)—and summing Jan 1–Mar 20 combines just a handful of pre-summed blocks.',
    whenToUse: [
      'Interleaved online point updates AND range sum queries in O(log N) -> Fenwick Tree (BIT, 10 lines)',
      'Interleaved online updates AND Range Min / Max / GCD queries or lazy range-add updates -> Segment Tree',
      'Counting Smaller Numbers After Self / dynamic order statistics with Coordinate Compression',
    ],
    whenNotToUse: [
      'Array is completely static with zero updates (a plain Prefix Sum answers in O(1) vs O(log N))',
      'All updates happen offline before a single final readout (Difference Array runs in O(N + Q))',
    ],
    constraintGuide: {
      inputBound: '1 <= N, Q <= 10^5 online queries + updates',
      expectedComplexity: 'O(N) build · O(log N) update & query · O(N) space',
      correctTierId: 'nlogn',
      eliminatedApproaches: ['Rebuilding Prefix Sum on every update O(Q·N)', 'Scanning [L..R] on every query O(Q·N)'],
      mathProof:
        'At N = Q = 10^5, O(Q·N) executes 10^10 operations (TLE). Decomposing intervals into O(log₂N) ≈ 17 tree blocks executes only ~1.7×10^6 ops.',
    },
    blankPageDrill: {
      tinyInput: 'nums = [1, 3, 5, 7, 9, 11], update(2, 6), sumRange(1, 4)',
      manualQuestion:
        'In a Fenwick Tree (BIT), why MUST indices be 1-based (`i = idx + 1`) instead of 0-based?',
      memoryBridge: '`0 & -0 === 0`, so `i += i & -i` loops forever at index 0! Keeping BIT strictly 1-indexed avoids infinite loops.',
      bruteBottleneck: 'Updating a static prefix array forces shifting O(N) suffix entries on every single update.',
      invariantPrompt: 'Fenwick BIT updates climb via `i += ___` and prefix queries descend via `i -= ___`, both strictly 1-indexed.',
      adversarialCases: [
        { label: '0-Based BIT Infinite Loop', input: 'update(0, +5)', trap: 'Always shift external 0-based index by +1 before entering BIT loops.' },
        { label: 'Wrong Identity Element', input: 'Range Min Query', trap: 'Out-of-range neutral return MUST be +Infinity for Min, -Infinity for Max, 0 for Sum.' },
        { label: 'Negative Coordinates', input: 'nums = [-10^9, 10^9]', trap: 'Apply Coordinate Compression (sort unique values -> rank 1..M) before indexing BIT.' },
        { label: 'Recursive Tree Size', input: 'N = 10^5', trap: 'Allocate `4 * N` for recursive Segment Tree (or `2 * N` for iterative bottom-up).' },
      ],
    },
    coreInvariant:
      'Every update touches only O(log N) ancestor aggregates and every range query merges at most O(log N) disjoint power-of-two segments.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Calling Fenwick Tree lowbit loop with 0-based index',
        badSnippet: 'for (let i = idx; i <= n; i += i & -i) bit[i] += delta; // infinite loop when idx === 0!',
        fixedSnippet: 'for (let i = idx + 1; i <= n; i += i & -i) bit[i] += delta;',
        whyItHappens: 'For i = 0, lowest set bit (0 & -0) is 0, so i never advances.',
      },
      {
        bugTitle: 'Forgetting to pass DELTA (newVal - oldVal) into Fenwick update',
        badSnippet: 'bit.add(idx, newVal); // adds on top of old value instead of replacing!',
        fixedSnippet: 'const delta = newVal - nums[idx]; nums[idx] = newVal; bit.add(idx, delta);',
        whyItHappens: 'Fenwick trees store additive deltas, so replacing an element requires adding (newVal - oldVal).',
      },
    ],
    linkedProblems: [
      {
        problemId: 'seg-range-sum-307',
        title: 'Range Sum Query — Mutable (#307)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · 1-indexed Fenwick Tree supports O(log N) update and O(log N) range sum',
        companyTags: ['Google', 'Amazon', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the Fenwick Tree add() and prefixSum() lowbit loops:',
          skeletonWithBlanks: `add(idx: number, delta: number): void {
  for (let i = idx + 1; i <= this.n; i += ___BLANK_1___) {
    this.bit[i] += delta;
  }
}
prefix(idx: number): number {
  let sum = 0;
  for (let i = idx + 1; i > 0; i -= ___BLANK_2___) sum += this.bit[i];
  return sum;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Lowest set bit climb step',
              expected: 'i & -i',
              acceptedKeywords: ['i & -i'],
              hint: 'Add the lowest set bit (i & -i) to move to parent responsibility buckets.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Lowest set bit strip step',
              expected: 'i & -i',
              acceptedKeywords: ['i & -i'],
              hint: 'Subtract (i & -i) to sum disjoint prefix blocks down to 0.',
            },
          ],
        },
      },
      {
        problemId: 'seg-smaller-after-315',
        title: 'Count of Smaller Numbers After Self (#315)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 1 · Coordinate Compression + Right-to-Left Fenwick Tree frequency prefix query',
        companyTags: ['Google', 'Amazon', 'Uber'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the right-to-left rank query and BIT frequency increment:',
          skeletonWithBlanks: `for (let i = nums.length - 1; i >= 0; i--) {
  const rank = rankMap.get(nums[i])!;
  res[i] = bit.prefix(___BLANK_1___);
  bit.add(___BLANK_2___, 1);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Query strictly smaller ranks already seen to the right',
              expected: 'rank - 1',
              acceptedKeywords: ['rank - 1'],
              hint: 'Count elements with compressed rank strictly less than rank.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Record current element rank into BIT',
              expected: 'rank',
              acceptedKeywords: ['rank'],
              hint: 'Increment frequency at rank after querying.',
            },
          ],
        },
      },
      {
        problemId: 'seg-iterative-rmq',
        title: 'Iterative Segment Tree — Dynamic Range Max',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Bottom-up 2N Segment Tree answers non-invertible Range Max/Min in O(log N)',
        companyTags: ['Google', 'Databricks', 'Citadel'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the iterative bottom-up point update parent recalculation:',
          skeletonWithBlanks: `update(idx: number, val: number): void {
  let pos = idx + this.n;
  this.tree[pos] = val;
  for (pos >>= 1; pos >= 1; pos >>= 1) {
    this.tree[pos] = Math.max(___BLANK_1___, ___BLANK_2___);
  }
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Left child node value',
              expected: 'this.tree[pos << 1]',
              acceptedKeywords: ['pos << 1', '2 * pos', 'pos * 2'],
              hint: 'Left child lives at 2 * pos (pos << 1).',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Right child node value',
              expected: 'this.tree[(pos << 1) | 1]',
              acceptedKeywords: ['(pos << 1) | 1', '2 * pos + 1', 'pos * 2 + 1'],
              hint: 'Right child lives at 2 * pos + 1.',
            },
          ],
        },
      },
    ],
  },

  'bit-manipulation': {
    id: 'bit-manipulation',
    title: 'Bit Manipulation & Bitmasking',
    category: 'Math & Logic',
    eli5Analogy:
      'Think of 32 tiny light switches packed into a single integer: flipping the same switch twice (XOR) turns it back off cleanly, and turning off the rightmost lit switch (`n & (n - 1)`) lets you count lit switches without inspecting dark ones.',
    whenToUse: [
      'Find the unique/missing number in O(N) time and strictly O(1) space (XOR cancellation: x ^ x = 0)',
      'Count set bits, test powers of two, or add integers without `+`/`-` operators',
      'Compress a visited set of N <= 20 items into a single integer bitmask for fast DP or Backtracking',
    ],
    whenNotToUse: [
      'Subset universe has N > 30 elements in JS (signed 32-bit bitwise ops overflow; use BigInt or Set/DP)',
      'Bit hacks obscure simple readable logic when no O(1) space or bit-level constraint exists',
    ],
    constraintGuide: {
      inputBound: 'N <= 10^5 (XOR/bit tricks) or N <= 20 (Bitmask DP)',
      expectedComplexity: 'O(N) / O(1) space (XOR) · O(popcount) bit counting',
      correctTierId: 'n',
      eliminatedApproaches: ['HashMap frequency count when O(1) space is mandated', '32-iteration loop when Kernighan runs in O(set bits)'],
      mathProof:
        'XOR is commutative and associative: pairs cancel to 0 in a single O(N) pass with 1 integer register (O(1) RAM).',
    },
    blankPageDrill: {
      tinyInput: 'nums = [4, 1, 2, 1, 2] and n = 12 (binary 1100)',
      manualQuestion:
        'Why does `n & (n - 1)` clear ONLY the lowest set 1-bit of any positive integer n?',
      memoryBridge: 'Subtracting 1 flips the rightmost 1 to 0 and all trailing 0s to 1; ANDing with n wipes that suffix cleanly.',
      bruteBottleneck: 'Using a HashSet for Single Number or Missing Number violates the O(1) extra space follow-up.',
      invariantPrompt: 'XOR cancels duplicates via `x ^ x = ___` and `x ^ 0 = ___`; `n > 0 && (n & (n - 1)) === 0` tests ___.',
      adversarialCases: [
        { label: 'Operator Precedence Bug', input: 'if (x & 1 == 0)', trap: '`==` binds tighter than `&`! Always parenthesize `(x & 1) === 0`.' },
        { label: 'Signed Right Shift Loop', input: 'n = -1, while (n !== 0) n >>= 1', trap: 'Arithmetic `>>` keeps sign bit 1 forever! Use unsigned `>>>`.' },
        { label: 'Zero Power-of-Two Check', input: 'n = 0', trap: '0 & -1 === 0, so always guard `n > 0 && (n & (n - 1)) === 0`.' },
        { label: 'Two Unique Numbers', input: '[1, 2, 1, 3, 2, 5]', trap: 'Partition array using lowest differentiating bit `diff = xorAll & -xorAll`.' },
      ],
    },
    coreInvariant:
      'Leverage XOR self-cancellation (`x ^ x = 0`), Kernighan bit clearing (`n & (n - 1)`), and explicit parentheses around every bitwise operation.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Missing parentheses around bitwise AND with equality',
        badSnippet: 'if (mask & 1 === 0) // parsed as mask & (1 === 0)!',
        fixedSnippet: 'if ((mask & 1) === 0)',
        whyItHappens: 'Comparison operators (===, !==) have higher precedence than bitwise &, |, ^ in JS/Java/C++.',
      },
      {
        bugTitle: 'Infinite loop using signed shift >> on negative integers',
        badSnippet: 'while (n !== 0) { count += n & 1; n >>= 1; } // hangs on negative n!',
        fixedSnippet: 'while (n !== 0) { n &= n - 1; count++; } // or use unsigned n >>>= 1',
        whyItHappens: 'Signed right shift fills the left bit with 1 on negative numbers, converging to -1 forever.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'bit-single-136',
        title: 'Single Number (#136)',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · XOR reduction cancels every pair in O(N) time and O(1) space',
        companyTags: ['Amazon', 'Google', 'Apple', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(1)-space XOR accumulator:',
          skeletonWithBlanks: `function singleNumber(nums: number[]): number {
  let acc = ___BLANK_1___;
  for (const x of nums) acc ___BLANK_2___ x;
  return acc;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'XOR identity element',
              expected: '0',
              acceptedKeywords: ['0'],
              hint: 'x ^ 0 equals x.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Compound XOR operator',
              expected: '^=',
              acceptedKeywords: ['^='],
              hint: 'XOR each element into acc.',
            },
          ],
        },
      },
      {
        problemId: 'bit-counting-338',
        title: 'Counting Bits (#338)',
        difficulty: 'Easy',
        mutationDelta: 'Twist 1 · Combine Bit Manipulation with DP: bits[i] = bits[i & (i - 1)] + 1 in O(N)',
        companyTags: ['Amazon', 'Google', 'Microsoft'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(1)-per-number bit-count DP recurrence:',
          skeletonWithBlanks: `function countBits(n: number): number[] {
  const dp = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    dp[i] = dp[___BLANK_1___] + ___BLANK_2___;
  }
  return dp;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Index with lowest set bit cleared (or right-shifted)',
              expected: 'i & (i - 1)',
              acceptedKeywords: ['i & (i - 1)', 'i >> 1'],
              hint: 'Removing the rightmost 1-bit gives a smaller already-computed number.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Added bit contribution',
              expected: '1',
              acceptedKeywords: ['1', '(i & 1)'],
              hint: 'Add 1 for the cleared bit (or (i & 1) if using i >> 1).',
            },
          ],
        },
      },
      {
        problemId: 'bit-sum-two-371',
        title: 'Sum of Two Integers Without + / - (#371)',
        difficulty: 'Medium',
        mutationDelta: 'Twist 2 · Hardware full-adder loop: XOR computes sum without carry, (a & b) << 1 computes carry',
        companyTags: ['Meta', 'Amazon', 'Apple'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the carry-propagation loop:',
          skeletonWithBlanks: `function getSum(a: number, b: number): number {
  while (b !== 0) {
    const carry = ___BLANK_1___;
    a = ___BLANK_2___;
    b = carry;
  }
  return a;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Compute shifted carry bits',
              expected: '(a & b) << 1',
              acceptedKeywords: ['(a & b) << 1'],
              hint: 'Carry occurs only where both bits are 1, shifted left by 1.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Compute carry-free bitwise sum',
              expected: 'a ^ b',
              acceptedKeywords: ['a ^ b'],
              hint: 'XOR adds bits modulo 2 without carry.',
            },
          ],
        },
      },
    ],
  },

  'exact-string-matching': {
    id: 'exact-string-matching',
    title: 'Exact String Matching (KMP, Z-Algorithm & Rabin-Karp)',
    category: 'Advanced Strings & Fuzzy Search',
    eli5Analogy:
      'Imagine sliding a transparent word strip over a book page: when character 7 mismatches, naive search slides back to character 2 and re-reads everything. KMP remembers the longest matching prefix-suffix already read so your eyes NEVER move backward on the page.',
    whenToUse: [
      'Guaranteed worst-case O(N + M) exact substring search, repeated substring patterns, or longest prefix-suffix (KMP LPS)',
      'Checking all prefix matches in O(N) without fallback loops (Z-Algorithm on `pattern + "$" + text`)',
      'Finding Longest Duplicate Substring or multi-pattern matching via Rolling Hash (Rabin-Karp + Binary Search)',
    ],
    whenNotToUse: [
      'Search must tolerate typos, transpositions, or missing characters (upgrade to N-Gram Fuzzy Retrieval + Damerau-Levenshtein)',
      'Matching thousands of fixed dictionary prefixes simultaneously (use Trie or Aho-Corasick)',
    ],
    constraintGuide: {
      inputBound: '1 <= N, M <= 10^5 characters',
      expectedComplexity: 'O(N + M) worst-case (KMP / Z) · O(N) expected (Rabin-Karp)',
      correctTierId: 'n',
      eliminatedApproaches: ['Naive nested substring compare O(N · M)', 'Unverified single-mod hash without collision check'],
      mathProof:
        'On adversarial text "aaaa...ab" with pattern "aaaab", naive search runs O(N·M) = 10^10 ops (TLE). KMP/Z advances monotonically in <= 2(N + M) ops.',
    },
    blankPageDrill: {
      tinyInput: 'pattern = "ababaca" -> LPS = [0, 0, 1, 2, 3, 0, 1]',
      manualQuestion:
        'Why MUST the KMP fallback use `while (len > 0 && pat[i] !== pat[len]) len = lps[len - 1]` instead of a single `if` statement?',
      memoryBridge: 'A border can have a shorter nested border inside it; `while` walks down the border chain until a match or 0 is reached.',
      bruteBottleneck: 'Rewinding the text cursor after every mismatch wastes O(N·M) re-reading already-known characters.',
      invariantPrompt: '`lps[i]` stores the length of the longest proper ___ of `pat[0..i]` that is also a ___.',
      adversarialCases: [
        { label: 'Repetitive Text', input: 'text = "aaaaab", pat = "aaab"', trap: 'Naive search degrades quadratically; KMP keeps text pointer strictly forward.' },
        { label: 'Single if Fallback', input: 'pat = "aabaaac"', trap: 'Using `if` instead of `while` stops too early and computes wrong LPS values.' },
        { label: 'Negative Rolling Hash', input: 'hash - out * pow', trap: 'Always normalize `((h % mod) + mod) % mod` in JS/Java.' },
        { label: 'Z-Separator Collision', input: 'pat contains "$"', trap: 'Pick an out-of-alphabet sentinel like "\\0" when building `pat + sep + text`.' },
      ],
    },
    coreInvariant:
      'Precompute self-overlap borders (KMP LPS or Z-Box) so the text pointer NEVER rewinds, guaranteeing strictly linear O(N + M) worst-case matching.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Using `if` instead of `while` in KMP LPS fallback',
        badSnippet: 'if (len > 0 && p[i] !== p[len]) len = lps[len - 1]; // misses shorter nested borders!',
        fixedSnippet: 'while (len > 0 && p[i] !== p[len]) len = lps[len - 1];',
        whyItHappens: 'You may need to step back through multiple progressively shorter prefix-suffix borders before finding a matching character.',
      },
      {
        bugTitle: 'Skipping exact verification on Rabin-Karp hash collision',
        badSnippet: 'if (winHash === patHash) return i; // vulnerable to hash collision false positives!',
        fixedSnippet: 'if (winHash === patHash && text.slice(i, i + m) === pat) return i;',
        whyItHappens: 'Modulo arithmetic maps infinite strings into finite buckets; always confirm exact equality or use double hashing.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'str-kmp-28',
        title: 'Find First Occurrence — KMP (#28)',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Build LPS table and match text in guaranteed O(N + M)',
        companyTags: ['Google', 'Amazon', 'Meta', 'Microsoft'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the KMP LPS builder fallback loop:',
          skeletonWithBlanks: `const lps = new Array(m).fill(0);
for (let i = 1, len = 0; i < m; i++) {
  while (len > 0 && pat[i] !== pat[len]) ___BLANK_1___;
  if (pat[i] === pat[len]) ___BLANK_2___;
  lps[i] = len;
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Fall back to previous shorter border',
              expected: 'len = lps[len - 1]',
              acceptedKeywords: ['len = lps[len - 1]'],
              hint: 'Step len back to lps[len - 1].',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Extend matching border length',
              expected: 'len++',
              acceptedKeywords: ['len++', 'len += 1'],
              hint: 'Increment len when characters match.',
            },
          ],
        },
      },
      {
        problemId: 'str-repeated-459',
        title: 'Repeated Substring Pattern (#459)',
        difficulty: 'Easy',
        mutationDelta: 'Twist 1 · A string of length N is periodic iff `lps[n - 1] > 0 && n % (n - lps[n - 1]) === 0`',
        companyTags: ['Google', 'Amazon'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the O(N) KMP periodicity formula:',
          skeletonWithBlanks: `const unitLen = n - lps[n - 1];
return ___BLANK_1___ && ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Ensure a non-empty repeating border exists',
              expected: 'lps[n - 1] > 0',
              acceptedKeywords: ['lps[n - 1] > 0'],
              hint: 'If lps[n - 1] === 0, no prefix repeats as a suffix.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Confirm unit length evenly divides total length n',
              expected: 'n % unitLen === 0',
              acceptedKeywords: ['n % unitLen === 0'],
              hint: 'Total length must be an integer multiple of unitLen.',
            },
          ],
        },
      },
      {
        problemId: 'str-dup-1044',
        title: 'Longest Duplicate Substring — Rabin-Karp (#1044)',
        difficulty: 'Hard',
        mutationDelta: 'Twist 2 · Binary Search on duplicate length L + Rolling Hash O(N) feasibility check',
        companyTags: ['Google', 'Meta', 'Uber'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the safe rolling-hash window slide update:',
          skeletonWithBlanks: `// Remove outgoing char s[i - L], append incoming s[i]
hash = (hash - outCode * pow) % MOD;
if (hash < 0) ___BLANK_1___;
hash = (hash * BASE + ___BLANK_2___) % MOD;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Normalize negative modulo back into [0..MOD-1]',
              expected: 'hash += MOD',
              acceptedKeywords: ['hash += MOD', 'hash = hash + MOD'],
              hint: 'Add MOD whenever subtraction produces a negative remainder.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Append incoming character code',
              expected: 'inCode',
              acceptedKeywords: ['inCode', 's.charCodeAt(i)'],
              hint: 'Shift polynomial left by BASE and add the incoming character value.',
            },
          ],
        },
      },
    ],
  },

  'ngram-fuzzy-candidate-retrieval': {
    id: 'ngram-fuzzy-candidate-retrieval',
    title: 'N-Gram Tokenization & Candidate Pruning',
    category: 'Advanced Strings & Fuzzy Search',
    eli5Analogy:
      'Imagine searching 10 million library books when you misspelled "algorithim": instead of checking every book cover with edit distance, you chop the query into overlapping 3-letter puzzle pieces ("alg", "lgo", "gor"...) and pull ONLY the few hundred books sharing enough puzzle pieces.',
    whenToUse: [
      'Sub-20ms typo-tolerant search / autocomplete across 10^5 to 10^7 product titles, names, or SKUs',
      'Stage-1 high-recall candidate generation that shrinks millions of documents to <= 500 survivors before expensive reranking',
      'Near-duplicate document detection at scale (Shingling + MinHash / LSH)',
    ],
    whenNotToUse: [
      'Very short 1–2 character queries without edge-gram fallback (too few trigrams exist)',
      'Exact ID or exact prefix lookup with zero typo tolerance (HashMap or Trie is simpler and faster)',
    ],
    constraintGuide: {
      inputBound: 'N = 10^7 catalog items, query length L <= 60, SLA < 20ms',
      expectedComplexity: 'O(|Q| + postings_scanned) Stage 1 · caps survivors to K <= 500',
      correctTierId: 'n',
      eliminatedApproaches: ['Running O(L²) Levenshtein across all 10M items (~15 seconds)', 'Unpadded trigrams losing start/end typos'],
      mathProof:
        'A single edit destroys at most n trigrams (3 for trigrams). Therefore any match within d edits MUST share at least |G_q| - n·d trigrams, mathematically pruning >99.99% of the catalog.',
    },
    blankPageDrill: {
      tinyInput: 'query = "iphon" (padded: "  iphon  ") vs catalog ["iphone", "ipad", "samsung"]',
      manualQuestion:
        'Why does padding "cat" into "  cat  " prevent a single first-letter typo ("bat") from dropping trigram overlap to ZERO?',
      memoryBridge: 'Without padding, "cat" has only 1 trigram ("cat") -> 1 typo gives 0% match. With padding, "  cat  " has 5 trigrams and shares "at ", "t  "!',
      bruteBottleneck: 'Computing Levenshtein DP against 10 million strings takes billions of cell evaluations per keystroke.',
      invariantPrompt: 'Lossless lower-bound count pruning skips any document sharing fewer than ___ trigrams with the query.',
      adversarialCases: [
        { label: 'Missing Boundary Padding', input: '"cat" vs "bat"', trap: 'Unpadded overlap = 0; padded overlap = 2/5.' },
        { label: 'Stop-Gram Flood', input: 'trigrams "ing", "the"', trap: 'Sort query trigrams rarest-first (IDF) so rare grams prune first.' },
        { label: 'Length Bound Violation', input: 'len(q)=5, len(doc)=40, d=2', trap: 'Immediately prune any doc where |len(doc) - len(q)| > maxEdits.' },
        { label: 'Short 2-Char Query', input: 'q = "ai"', trap: 'Drop to edge n-grams or direct prefix lookup when length <= 3.' },
      ],
    },
    coreInvariant:
      'Pad string boundaries, intersect rarest inverted trigram posting lists first, and enforce exact length + minimum-overlap lower bounds to cap Stage-2 candidates under 5ms.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Slicing trigrams without (n - 1) boundary padding',
        badSnippet: 'for (let i = 0; i <= s.length - 3; i++) grams.push(s.slice(i, i + 3)); // 0 grams for len < 3!',
        fixedSnippet: 'const padded = `  ${s.trim().toLowerCase()}  `; for (let i = 0; i <= padded.length - 3; i++) grams.push(padded.slice(i, i + 3));',
        whyItHappens: 'Unpadded trigrams underweight the first and last characters and produce empty sets for short words.',
      },
      {
        bugTitle: 'Scanning full posting lists before checking length filter',
        badSnippet: 'scoreAllDocs(); // computes edit distance on 50-char docs for a 4-char query!',
        fixedSnippet: 'if (Math.abs(doc.length - query.length) > maxEdits) continue;',
        whyItHappens: 'Two strings differing in length by more than maxEdits can mathematically never be within maxEdits edit distance.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'ng-padded-trigrams',
        title: 'Padded Trigram Tokenizer & Dice Similarity',
        difficulty: 'Easy',
        mutationDelta: 'Base Form · Pad boundaries and compute Sørensen-Dice 2|A∩B| / (|A|+|B|)',
        companyTags: ['Google', 'Amazon', 'Algolia', 'Elasticsearch'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete padded trigram extraction and Dice score formula:',
          skeletonWithBlanks: `function paddedTrigrams(s: string): Set<string> {
  const p = ___BLANK_1___;
  const out = new Set<string>();
  for (let i = 0; i <= p.length - 3; i++) out.add(p.slice(i, i + 3));
  return out;
}
// Dice similarity:
const dice = ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Boundary-padded normalized string',
              expected: '`  ${s.trim().toLowerCase()}  `',
              acceptedKeywords: ['toLowerCase()', '  '],
              hint: 'Normalize case and add 2 spaces before and after.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Sørensen-Dice similarity formula',
              expected: '(2 * overlap) / (a.size + b.size)',
              acceptedKeywords: ['2 * overlap', 'a.size + b.size'],
              hint: 'Dice = 2 * intersection / (|A| + |B|).',
            },
          ],
        },
      },
      {
        problemId: 'ng-inverted-prune',
        title: 'Inverted N-Gram Index With Min-Overlap Pruning',
        difficulty: 'Medium',
        mutationDelta: 'Twist 1 · Enforce lossless threshold `minOverlap = Math.max(1, qGrams.size - 3 * maxEdits)`',
        companyTags: ['Amazon', 'Shopify', 'DoorDash'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the lossless length filter and overlap survival threshold:',
          skeletonWithBlanks: `const minOverlap = Math.max(1, qGrams.size - ___BLANK_1___);
const survivors = [...counts.entries()]
  .filter(([docId, hitCount]) => hitCount >= minOverlap && ___BLANK_2___);`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Maximum trigrams destroyed by maxEdits edits',
              expected: '3 * maxEdits',
              acceptedKeywords: ['3 * maxEdits', 'n * maxEdits'],
              hint: 'Each single-character edit affects at most 3 trigrams.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Length difference lower-bound filter',
              expected: 'Math.abs(docs[docId].length - query.length) <= maxEdits',
              acceptedKeywords: ['Math.abs', '<= maxEdits'],
              hint: 'Reject candidates whose length differs from query by more than maxEdits.',
            },
          ],
        },
      },
      {
        problemId: 'ng-scale-retrieval',
        title: '10M-SKU Typo-Tolerant Autocomplete Architecture',
        difficulty: 'System',
        mutationDelta: 'Twist 2 · Combine rarest-first posting intersection + IDF weights + Top-K Min-Heap candidate cap',
        companyTags: ['Google', 'Amazon', 'Uber', 'Instacart'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the rarest-first posting sort to minimize intersection work:',
          skeletonWithBlanks: `const orderedGrams = [...qGrams].sort((a, b) => ___BLANK_1___);
// Maintain bounded Stage-1 candidate heap of size K = 500:
if (topK.size() > 500) ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Sort trigrams by ascending posting-list length (rarest first)',
              expected: '(index.get(a)?.length ?? 0) - (index.get(b)?.length ?? 0)',
              acceptedKeywords: ['index.get(a)', 'index.get(b)', '-'],
              hint: 'Process shortest posting lists first to prune candidates early.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Evict lowest-scoring candidate beyond K=500 cap',
              expected: 'topK.pop()',
              acceptedKeywords: ['topK.pop()'],
              hint: 'Pop root from the size-500 Min-Heap.',
            },
          ],
        },
      },
    ],
  },

  'confident-fuzzy-reranking': {
    id: 'confident-fuzzy-reranking',
    title: 'Confident Fuzzy Reranking (Damerau-Levenshtein & Jaro-Winkler)',
    category: 'Advanced Strings & Fuzzy Search',
    eli5Analogy:
      'Stage 1 (N-Grams) is like a bouncer letting 200 likely suspects into the room in 3ms; Stage 2 (Confident Reranking) is the detective carefully checking swapped letters ("teh" -> "the"), matching prefixes, and popularity to decide whether to Auto-Correct (>= 0.88) or ask "Did you mean?"',
    whenToUse: [
      'Stage-2 precision reranking over <= 500 Stage-1 survivors under strict < 5ms CPU budget',
      'Keyboard typos involving adjacent transpositions ("recieve", "teh") where standard Levenshtein over-penalizes as 2 edits',
      'Product/search UX needing calibrated [0..1] confidence bands (Auto-Correct vs Suggest vs No Match)',
    ],
    whenNotToUse: [
      'Running directly across millions of documents without Stage-1 candidate pruning first',
      'Semantic synonym matching ("sofa" vs "couch") where lexical characters do not overlap (use dense vector embeddings)',
    ],
    constraintGuide: {
      inputBound: 'K <= 500 candidates, string length L <= 60, maxEdit d <= 3',
      expectedComplexity: 'O(K · L · d) banded Ukkonen DP · O(L) rolling space',
      correctTierId: 'n',
      eliminatedApproaches: ['Unbanded O(L1 · L2) full matrix over long descriptions', 'Raw unnormalized edit distance across varying lengths'],
      mathProof:
        'Banded Ukkonen DP computes only cells within |i - j| <= d (~3×60 = 180 cells per candidate). Across 300 survivors, that is ~54,000 ops (< 1.5ms).',
    },
    blankPageDrill: {
      tinyInput: 'query = "teh" vs candidate = "the" (adjacent swap)',
      manualQuestion:
        'Why does Damerau-Levenshtein score "teh" -> "the" as distance 1 while standard Levenshtein scores it as distance 2?',
      memoryBridge: 'Standard Levenshtein only knows insert/delete/replace; Damerau adds a 4th transition `dp[i-2][j-2] + 1` when `a[i-1]===b[j-2] && a[i-2]===b[j-1]`.',
      bruteBottleneck: 'Computing full unbanded 2D edit distance over 10M items destroys latency SLAs.',
      invariantPrompt: 'Ukkonen banded DP aborts early as soon as every cell in the current row exceeds ___ .',
      adversarialCases: [
        { label: 'Adjacent Keyboard Swap', input: '"teh" vs "the"', trap: 'Must check `i > 1 && j > 1 && a[i-1]===b[j-2] && a[i-2]===b[j-1]`.' },
        { label: 'Short vs Long Normalization', input: 'dist=1 on len 3 vs len 20', trap: 'Normalize via `1 - dist / Math.max(a.length, b.length)`.' },
        { label: 'Banded Early Abort', input: 'minRowVal > maxEdit', trap: 'Abort candidate immediately once entire row minimum exceeds maxEdit.' },
        { label: 'Over-Confident Auto-Correct', input: 'score = 0.72', trap: 'Only auto-select above calibrated high-precision threshold (>= 0.88); show "Did you mean?" in [0.65, 0.88).' },
      ],
    },
    coreInvariant:
      'Spend Stage-2 precision strictly on Stage-1 survivors using banded Damerau-Levenshtein + Jaro-Winkler prefix boost + calibrated confidence thresholds.',
    commonBugsAndTraps: [
      {
        bugTitle: 'Omitting the adjacent transposition transition in Damerau-Levenshtein',
        badSnippet: 'dp[i][j] = 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]); // scores "teh"->"the" as 2!',
        fixedSnippet:
          'if (i > 1 && j > 1 && a[i-1] === b[j-2] && a[i-2] === b[j-1]) dp[i][j] = Math.min(dp[i][j], dp[i-2][j-2] + 1);',
        whyItHappens: 'Human keyboard typos are heavily dominated by adjacent character swaps; treating them as 2 edits hurts top-1 accuracy.',
      },
      {
        bugTitle: 'Comparing raw integer edit distances across different query lengths',
        badSnippet: 'if (dist <= 2) autoCorrect(); // auto-corrects 2-letter word "go" to "to"!',
        fixedSnippet: 'const sim = 1 - dist / Math.max(a.length, b.length); // length-normalized [0..1]',
        whyItHappens: '2 edits on a 3-letter word is 67% error, while 2 edits on a 16-letter word is only 12.5% error.',
      },
    ],
    linkedProblems: [
      {
        problemId: 'rerank-damerau',
        title: 'Optimal String Alignment (Damerau-Levenshtein)',
        difficulty: 'Medium',
        mutationDelta: 'Base Form · Extend 2D Edit Distance with adjacent transposition transition (cost 1)',
        companyTags: ['Google', 'Amazon', 'Grammarly', 'Algolia'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the adjacent-swap transposition check and transition:',
          skeletonWithBlanks: `if (i > 1 && j > 1 && ___BLANK_1___) {
  dp[i][j] = Math.min(dp[i][j], ___BLANK_2___);
}`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Adjacent swapped characters condition',
              expected: 'a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]',
              acceptedKeywords: ['a[i - 1] === b[j - 2]', 'a[i - 2] === b[j - 1]'],
              hint: 'Last two characters of a prefix equal the reversed last two characters of b prefix.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Transposition DP cost',
              expected: 'dp[i - 2][j - 2] + 1',
              acceptedKeywords: ['dp[i - 2][j - 2] + 1'],
              hint: 'Take cost before the swapped pair plus 1 transposition.',
            },
          ],
        },
      },
      {
        problemId: 'rerank-banded-ukkonen',
        title: 'Banded Ukkonen Early-Abort Edit Distance',
        difficulty: 'Hard',
        mutationDelta: 'Twist 1 · Compute only |i - j| <= maxEdit diagonal band and abort row early for O(L·d) speed',
        companyTags: ['Google', 'Elastic', 'Meta'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the diagonal column band bounds and early-abort check:',
          skeletonWithBlanks: `const jStart = Math.max(1, i - maxEdit);
const jEnd = Math.min(b.length, ___BLANK_1___);
let rowMin = Infinity;
for (let j = jStart; j <= jEnd; j++) { /* compute dp[i][j] */ rowMin = Math.min(rowMin, dp[i][j]); }
if (___BLANK_2___) return maxEdit + 1;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Upper diagonal band column bound',
              expected: 'i + maxEdit',
              acceptedKeywords: ['i + maxEdit'],
              hint: 'Only columns within maxEdit steps right of i can stay <= maxEdit.',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Row-level early-abort guard',
              expected: 'rowMin > maxEdit',
              acceptedKeywords: ['rowMin > maxEdit'],
              hint: 'Edit distance is non-decreasing across rows; abort as soon as rowMin exceeds maxEdit.',
            },
          ],
        },
      },
      {
        problemId: 'rerank-confidence-band',
        title: 'Calibrated Hybrid Reranker (Auto-Correct vs Suggest)',
        difficulty: 'System',
        mutationDelta: 'Twist 2 · Blend Damerau similarity + Jaro-Winkler prefix boost + calibrated confidence bands',
        companyTags: ['Google', 'Amazon', 'Stripe', 'Shopify'],
        fadedCodeChallenge: {
          language: 'typescript',
          prompt: 'Complete the normalized similarity and confidence decision tier:',
          skeletonWithBlanks: `const damerauSim = 1 - dist / ___BLANK_1___;
const score = 0.5 * damerauSim + 0.3 * jaroWinkler + 0.2 * dice;
const action = score >= 0.88 ? 'auto_correct' : ___BLANK_2___;`,
          missingLines: [
            {
              placeholder: '___BLANK_1___',
              label: 'Length normalization denominator',
              expected: 'Math.max(a.length, b.length)',
              acceptedKeywords: ['Math.max(a.length, b.length)'],
              hint: 'Normalize by the longer string length so similarity stays in [0, 1].',
            },
            {
              placeholder: '___BLANK_2___',
              label: 'Fallback tier between Suggest and No-Match',
              expected: "score >= 0.65 ? 'did_you_mean' : 'no_match'",
              acceptedKeywords: ['0.65', 'did_you_mean', 'no_match'],
              hint: 'Scores between 0.65 and 0.88 surface "Did you mean?" suggestions.',
            },
          ],
        },
      },
    ],
  },
};
