import type { AlgorithmDefinition } from './algorithmsCatalog';

export interface AlgorithmPracticeTestCase {
  label: string;
  args: unknown[];
  expected: unknown;
  note?: string;
}

export interface PlatformDrillItem {
  platform: 'LeetCode' | 'NeetCode' | 'Grind 75' | 'CSES';
  number: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  focus: string;
  trainerSlug?: string;
}

export interface AlgorithmPracticeSpec {
  algorithmId: string;
  functionName: string;
  title: string;
  prompt: string;
  structuredSteps: { step: string; detail: string }[];
  starterCode: string;
  solutionCode: string;
  testCases: AlgorithmPracticeTestCase[];
  platformDrills: PlatformDrillItem[];
}

export const EXTRA_6_ALGORITHMS: AlgorithmDefinition[] = [
  // 15. Kadane's Algorithm
  {
    id: 'kadanes-algorithm',
    name: 'Kadane’s Algorithm (Max Subarray)',
    shortName: 'Kadane’s Algo',
    category: 'Array & String Patterns',
    visualType: 'kadane',
    tagline: 'Find the maximum sum of any contiguous subarray in a single O(N) pass.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(N²) all subarray slices → O(N) single running-best decision',
    coreIdea:
      'At every index i, make one binary decision: either EXTEND the previous running subarray (curSum + nums[i]) or RESTART fresh at nums[i] whenever curSum drops below 0.',
    mentalModelSteps: [
      'Initialize curSum = nums[0] and bestSum = nums[0] (never 0, in case all elements are negative!).',
      'For each x from index 1 .. n - 1: set curSum = max(x, curSum + x).',
      'Update bestSum = max(bestSum, curSum) immediately.',
      'Return bestSum after one linear pass in O(1) extra memory.',
    ],
    loopInvariant:
      'At index i, curSum equals the exact maximum sum of all contiguous subarrays ENDING at index i.',
    whenToUse: [
      'Maximum Subarray Sum (LC 53) & Circular Max Subarray (LC 918)',
      'Maximum Product Subarray (track both curMax and curMin simultaneously)',
      'Best Time to Buy & Sell Stock (Kadane over daily price differences)',
    ],
    whenItFails:
      'If the problem asks for subarray sum EQUALS K (not max sum), Kadane cannot track exact equality—switch to Prefix Sum + Hash Map.',
    linkedTopics: ['Arrays & Prefix Sum', 'Dynamic Programming'],
    linkedProblemSlugs: ['subarray-sum-equals-k', 'best-time-to-buy-and-sell-stock', 'product-of-array-except-self'],
    templates: {
      python: `def max_subarray(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
      js: `function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
      java: `public int maxSubArray(int[] nums) {
  int cur = nums[0], best = nums[0];
  for (int i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Start at index 0: nums[0] = -2',
        explanation: 'Initialize cur = -2, best = -2. Starting with nums[0] safely handles all-negative arrays.',
        invariantCheck: 'Best subarray ending at index 0 is [-2].',
        variables: [
          { name: 'curSum', value: '-2' },
          { name: 'bestSum', value: '-2' },
          { name: 'action', value: 'Initialize' },
        ],
        array: [-2, 1, -3, 4, -1, 2, 1, -5],
        pointers: [{ label: 'i', index: 0, tone: 'sky' }],
        windowRange: [0, 0],
      },
      {
        step: 2,
        title: 'Index 1 (1): Negative prefix hurts → RESTART at 1!',
        explanation: 'cur + 1 = -1 < 1, so drop [-2] completely and restart subarray at index 1. best = 1.',
        invariantCheck: 'Negative running totals can never help a future subarray.',
        variables: [
          { name: 'curSum', value: '1 (RESET)' },
          { name: 'bestSum', value: '1' },
        ],
        array: [-2, 1, -3, 4, -1, 2, 1, -5],
        pointers: [{ label: 'i', index: 1, tone: 'emerald' }],
        eliminatedIndices: [0],
        windowRange: [1, 1],
      },
      {
        step: 3,
        title: 'Index 3 (4): Drop [-2] streak → RESTART at 4!',
        explanation: 'After index 2 (-3), cur became -2. At index 3 (4), 4 > (-2 + 4), so start fresh at [4]. best = 4.',
        invariantCheck: 'Active subarray resets cleanly to [3..3].',
        variables: [
          { name: 'curSum', value: '4 (RESET)' },
          { name: 'bestSum', value: '4' },
        ],
        array: [-2, 1, -3, 4, -1, 2, 1, -5],
        pointers: [{ label: 'i', index: 3, tone: 'emerald' }],
        eliminatedIndices: [0, 1, 2],
        windowRange: [3, 3],
      },
      {
        step: 4,
        title: 'Indices 4–6 (-1, +2, +1): EXTEND to Peak Sum = 6!',
        explanation: '4 + (-1) = 3 (> 0, keep!), + 2 = 5, + 1 = 6! Window [4, -1, 2, 1] hits global peak = 6.',
        invariantCheck: 'Positive curSum = 3 bridged across -1 to unlock +2 and +1.',
        variables: [
          { name: 'curSum', value: '6' },
          { name: 'bestSum', value: '6 (PEAK)' },
          { name: 'best slice', value: '[4, -1, 2, 1]' },
        ],
        array: [-2, 1, -3, 4, -1, 2, 1, -5],
        pointers: [{ label: 'i', index: 6, tone: 'emerald' }],
        eliminatedIndices: [0, 1, 2],
        matchedIndices: [3, 4, 5, 6],
        windowRange: [3, 6],
      },
      {
        step: 5,
        title: 'Index 7 (-5): cur drops to 1, best stays 6 → Done!',
        explanation: '6 + (-5) = 1 < best 6. Final optimal contiguous subarray sum = 6 in 8 linear operations.',
        invariantCheck: 'Single pass O(N) time, O(1) memory.',
        variables: [
          { name: 'curSum', value: '1' },
          { name: 'final best', value: '6' },
        ],
        array: [-2, 1, -3, 4, -1, 2, 1, -5],
        pointers: [{ label: 'i', index: 7, tone: 'sky' }],
        matchedIndices: [3, 4, 5, 6],
        windowRange: [3, 6],
      },
    ],
  },

  // 16. Cyclic Sort
  {
    id: 'cyclic-sort',
    name: 'Cyclic Sort (In-Place 1..N Placement)',
    shortName: 'Cyclic Sort',
    category: 'Searching & Sorting',
    visualType: 'cyclic-sort',
    tagline: 'Place every value x in [1..N] into its home index x - 1 in O(N) time and O(1) space.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(N log N) sorting or O(N) HashSet → O(N) time & O(1) space',
    coreIdea:
      'When numbers belong to a known tight range [1..N] (or [0..N-1]), use the array itself as a hash table. Repeatedly swap nums[i] into its home index (nums[i] - 1) until either nums[i] is home or out of range.',
    mentalModelSteps: [
      'Iterate i from 0 .. n - 1.',
      'While nums[i] is inside [1..n] AND nums[nums[i] - 1] !== nums[i], swap nums[i] with nums[nums[i] - 1].',
      'Never increment i inside the while loop—only advance i once slot i holds its proper value or an invalid/duplicate number.',
      'Second scan: the first index i where nums[i] !== i + 1 immediately exposes the missing (or duplicate) number!',
    ],
    loopInvariant:
      'Every single swap permanently places at least one number into its final home slot, bounding total swaps across the entire run to <= N.',
    whenToUse: [
      'First Missing Positive (LC 41) in O(N) time and O(1) space',
      'Find Missing Number (LC 268), Find All Duplicates (LC 442), Find Duplicate (LC 287)',
      'Any problem stating values fall in range [1..N] or [0..N]',
    ],
    whenItFails:
      'Cannot be applied if values are arbitrary unbounded integers (e.g., 10^9) without a 1..N pigeonhole bound, or if mutating the input array is forbidden.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['first-missing-positive', 'two-sum', 'product-of-array-except-self'],
    templates: {
      python: `def first_missing_positive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            t = nums[i] - 1
            nums[i], nums[t] = nums[t], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
      js: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const t = nums[i] - 1;
      [nums[i], nums[t]] = [nums[t], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  return n + 1;
}`,
      java: `public int firstMissingPositive(int[] nums) {
  int n = nums.length;
  for (int i = 0; i < n; i++) {
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] != nums[i]) {
      int t = nums[i] - 1;
      int tmp = nums[t]; nums[t] = nums[i]; nums[i] = tmp;
    }
  }
  for (int i = 0; i < n; i++) if (nums[i] != i + 1) return i + 1;
  return n + 1;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Start: Unsorted [3, 4, -1, 1] → Goal: home[x] = x - 1',
        explanation: 'At i = 0, value 3 belongs at index 2 (3 - 1). Swap nums[0] and nums[2]!',
        invariantCheck: 'Valid range is [1..4]. Ignore values <= 0 or > 4.',
        variables: [
          { name: 'i', value: '0' },
          { name: 'swap', value: 'idx 0 (3) ↔ idx 2 (-1)' },
        ],
        array: [3, 4, -1, 1],
        pointers: [{ label: 'i', index: 0, tone: 'sky' }],
        highlightIndices: [0, 2],
      },
      {
        step: 2,
        title: '3 is Home at idx 2! Now i=0 holds -1 (skip) → i=1 holds 4',
        explanation: '-1 is outside [1..4], so advance to i = 1. Value 4 belongs at index 3 (4 - 1) → swap idx 1 and idx 3!',
        invariantCheck: 'Index 2 is permanently settled (3 == 2 + 1).',
        variables: [
          { name: 'i', value: '1' },
          { name: 'swap', value: 'idx 1 (4) ↔ idx 3 (1)' },
        ],
        array: [-1, 4, 3, 1],
        pointers: [{ label: 'i', index: 1, tone: 'sky' }],
        highlightIndices: [1, 3],
        matchedIndices: [2],
      },
      {
        step: 3,
        title: 'While-Loop stays at i = 1: value 1 belongs at index 0!',
        explanation: 'After placing 4 at idx 3, idx 1 now holds 1! Stay at i = 1 and swap 1 into its home index 0.',
        invariantCheck: 'Staying at i until settled guarantees 1 is not left behind.',
        variables: [
          { name: 'i', value: '1 (stay!)' },
          { name: 'swap', value: 'idx 1 (1) ↔ idx 0 (-1)' },
        ],
        array: [-1, 1, 3, 4],
        pointers: [{ label: 'i', index: 1, tone: 'amber' }],
        highlightIndices: [0, 1],
        matchedIndices: [2, 3],
      },
      {
        step: 4,
        title: 'Final Linear Scan: Index 1 != 2 → Missing Positive = 2!',
        explanation: 'Array is now [1, -1, 3, 4]. Scan left-to-right: idx 0 has 1 (OK), idx 1 has -1 (!= 2) → Answer is 2!',
        invariantCheck: 'Total swaps = 3 (<= N). Achieved O(N) time and O(1) space.',
        variables: [
          { name: 'settled', value: '[1, _, 3, 4]' },
          { name: 'missing', value: '2' },
        ],
        array: [1, -1, 3, 4],
        pointers: [{ label: 'MISS', index: 1, tone: 'rose' }],
        matchedIndices: [0, 2, 3],
        highlightIndices: [1],
      },
    ],
  },

  // 17. Dedicated Depth-First Search (DFS)
  {
    id: 'depth-first-search',
    name: 'Depth-First Search (DFS & Call Stack)',
    shortName: 'DFS (Recursion)',
    category: 'Tree & Graph Traversal',
    visualType: 'dfs-stack',
    tagline: 'Plunge deep down each branch via recursion or explicit stack to compute subtree returns.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(H) stack',
    complexityLeap: 'Repeated per-node subtree recomputation O(N²) → O(N) single postorder DFS',
    coreIdea:
      'Explore all the way down one branch until hitting a leaf/base case, then unwind upward combining left & right child answers. Postorder DFS separates what a node RETURNS to its parent from the GLOBAL best updated at the node.',
    mentalModelSteps: [
      'Define base case first: if (!node) return 0 (or neutral identity).',
      'Recursively solve left = dfs(node.left) and right = dfs(node.right).',
      'Update global metric at current node (e.g., diameter = max(diameter, left + right)).',
      'Return single-branch summary to parent: 1 + max(left, right).',
    ],
    loopInvariant:
      'Whenever dfs(node) returns, every node in node’s entire subtree has been visited exactly once and its height/result is finalized.',
    whenToUse: [
      'Binary Tree Diameter, Maximum Path Sum, Lowest Common Ancestor (LCA)',
      'Connected Components (Number of Islands), Cycle Detection in Graphs',
      'Preorder (clone/serialize), Inorder (sorted BST), Postorder (bottom-up deletion/height)',
    ],
    whenItFails:
      'Do NOT use DFS to find the shortest path (fewest hops) in an unweighted graph—DFS dives arbitrarily deep down long paths first. Use BFS instead.',
    linkedTopics: ['Trees DFS/BFS', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['diameter-of-binary-tree', 'lowest-common-ancestor', 'binary-tree-maximum-path-sum', 'number-of-islands'],
    templates: {
      python: `def diameter_of_binary_tree(root):
    best = 0
    def dfs(node):
        nonlocal best
        if not node:
            return 0
        left = dfs(node.left)
        right = dfs(node.right)
        best = max(best, left + right)
        return 1 + max(left, right)
    dfs(root)
    return best`,
      js: `function diameterOfBinaryTree(root) {
  let best = 0;
  function dfs(node) {
    if (!node) return 0;
    const left = dfs(node.left);
    const right = dfs(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  }
  dfs(root);
  return best;
}`,
      java: `int best = 0;
int dfs(TreeNode node) {
  if (node == null) return 0;
  int left = dfs(node.left);
  int right = dfs(node.right);
  best = Math.max(best, left + right);
  return 1 + Math.max(left, right);
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Plunge Left: Root (8) → 4 → Leaf (2)',
        explanation: 'DFS pushes calls down the leftmost spine first: dfs(8) → dfs(4) → dfs(2). Call stack depth reaches 3.',
        invariantCheck: 'DFS commits to full depth before exploring sibling 12.',
        variables: [
          { name: 'active call', value: 'dfs(2)' },
          { name: 'stack depth', value: '3' },
        ],
        activeNodes: ['2'],
        visitedNodes: ['8', '4', '2'],
        activeEdges: ['8->4', '4->2'],
        stackItems: [
          { label: 'dfs(8)', sub: 'waiting left' },
          { label: 'dfs(4)', sub: 'waiting left' },
          { label: 'dfs(2)', sub: 'leaf → ret 1', active: true },
        ],
        outputSeq: ['Visit: 8 → 4 → 2'],
      },
      {
        step: 2,
        title: 'Unwind to 4 → Explore Right Leaf (6)',
        explanation: 'dfs(2) returns height 1 to node 4. Now node 4 dives into its right child dfs(6), which also returns height 1.',
        invariantCheck: 'Node 4 now has left=1, right=1 → local diameter = 2.',
        variables: [
          { name: 'node 4', value: 'L=1, R=1 → diam 2' },
          { name: 'return to 8', value: '1 + max(1,1) = 2' },
        ],
        activeNodes: ['4', '6'],
        visitedNodes: ['8', '4', '2', '6'],
        activeEdges: ['4->6'],
        stackItems: [
          { label: 'dfs(8)', sub: 'waiting left' },
          { label: 'dfs(4)', sub: 'L=1, R=1 → ret 2', active: true },
        ],
        outputSeq: ['Postorder done: 2, 6, 4'],
      },
      {
        step: 3,
        title: 'Left Subtree Complete → Plunge Right Subtree (12 → 10, 15)',
        explanation: 'dfs(4) returns height 2 to root 8. Now root 8 invokes dfs(12), diving to leaves 10 and 15.',
        invariantCheck: 'Call stack memory was reused—never exceeds tree height H.',
        variables: [
          { name: 'node 12', value: 'L=1, R=1 → ret 2' },
          { name: 'global best', value: '2' },
        ],
        activeNodes: ['12', '10', '15'],
        visitedNodes: ['8', '4', '2', '6', '12', '10', '15'],
        activeEdges: ['8->12', '12->10', '12->15'],
        stackItems: [
          { label: 'dfs(8)', sub: 'L=2, waiting right' },
          { label: 'dfs(12)', sub: 'L=1, R=1 → ret 2', active: true },
        ],
        outputSeq: ['Postorder done: 2, 6, 4, 10, 15, 12'],
      },
      {
        step: 4,
        title: 'Combine at Root (8): L=2 + R=2 → Diameter = 4 Edges!',
        explanation: 'Root 8 receives left=2 and right=2, updating global diameter = 4 (path 2→4→8→12→15) in one O(N) pass.',
        invariantCheck: 'Every node visited once; stack cleanly emptied.',
        variables: [
          { name: 'root L / R', value: '2 / 2' },
          { name: 'final diameter', value: '4 edges' },
        ],
        activeNodes: ['8'],
        visitedNodes: ['8', '4', '2', '6', '12', '10', '15'],
        activeEdges: ['8->4', '4->2', '8->12', '12->15'],
        stackItems: [{ label: 'dfs(8)', sub: 'L+R = 4 (DONE)', active: true }],
        outputSeq: ['Postorder: 2, 6, 4, 10, 15, 12, 8'],
      },
    ],
  },

  // 18. Union-Find (Disjoint Set Union)
  {
    id: 'union-find-dsu',
    name: 'Union-Find (Disjoint Set Union)',
    shortName: 'Union-Find (DSU)',
    category: 'Tree & Graph Traversal',
    visualType: 'union-find',
    tagline: 'Track dynamic connected components and detect undirected cycles in O(α(N)) ≈ O(1).',
    timeComplexity: 'O(E · α(V))',
    spaceComplexity: 'O(V)',
    complexityLeap: 'O(V·E) repeated DFS per edge → near-constant O(α(N)) amortized union/find',
    coreIdea:
      'Represent each connected component as a rooted tree stored in a flat parent[] array. find(x) flattens paths directly to the root (Path Compression), and union(a, b) attaches the shallower tree under the taller root (Union by Rank).',
    mentalModelSteps: [
      'Initialize parent[i] = i (every node starts as its own isolated component) and rank[i] = 0.',
      'find(x): if parent[x] !== x, set parent[x] = find(parent[x]) (Path Compression).',
      'union(a, b): compute ra = find(a), rb = find(b). If ra === rb, edge (a, b) forms a CYCLE!',
      'Otherwise attach lower-rank root under higher-rank root and decrement component count.',
    ],
    loopInvariant:
      'Two vertices belong to the same connected component if and only if find(a) === find(b).',
    whenToUse: [
      'Dynamic connectivity, Redundant Connection (cycle detection), Accounts Merge (LC 721)',
      'Kruskal’s Minimum Spanning Tree (sort edges by weight + union if roots differ)',
      'Number of Islands II (streaming land additions)',
    ],
    whenItFails:
      'Cannot handle edge DELETIONS efficiently or directed reachability (for directed dependency graphs use Kahn’s Topo Sort / DFS).',
    linkedTopics: ['Union-Find & Shortest Path'],
    linkedProblemSlugs: ['accounts-merge', 'find-if-path-exists', 'swim-in-rising-water', 'network-delay-time'],
    templates: {
      python: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False  # already connected (cycle!)
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.components -= 1
        return True`,
      js: `class UnionFind {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.components = n;
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    this.components--;
    return true;
  }
}`,
      java: `class UnionFind {
  int[] parent, rank;
  UnionFind(int n) {
    parent = new int[n]; rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
  }
  int find(int x) { return parent[x] == x ? x : (parent[x] = find(parent[x])); }
  boolean union(int a, int b) {
    int ra = find(a), rb = find(b);
    if (ra == rb) return false;
    if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    if (rank[ra] == rank[rb]) rank[ra]++;
    return true;
  }
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Initialize 5 Disjoint Nodes (0..4): parent[i] = i',
        explanation: 'Every vertex starts as its own component root. Total connected components = 5.',
        invariantCheck: '5 isolated sets: {0}, {1}, {2}, {3}, {4}.',
        variables: [
          { name: 'operation', value: 'Init(5)' },
          { name: 'components', value: '5' },
        ],
        array: [0, 1, 2, 3, 4],
        secondaryArray: [0, 0, 0, 0, 0],
        activeNodes: [],
      },
      {
        step: 2,
        title: 'union(0, 1) and union(2, 3) → Two Pairs Merged',
        explanation: 'parent[1] = 0 (rank[0]→1) and parent[3] = 2 (rank[2]→1). Components drop from 5 → 3.',
        invariantCheck: 'Sets: {0,1}, {2,3}, {4}.',
        variables: [
          { name: 'operation', value: 'union(0,1), union(2,3)' },
          { name: 'components', value: '3' },
        ],
        array: [0, 0, 2, 2, 4],
        secondaryArray: [1, 0, 1, 0, 0],
        activeNodes: ['0', '1', '2', '3'],
        activeEdges: ['0->1', '2->3'],
      },
      {
        step: 3,
        title: 'union(1, 3) → Merge Root 2 Under Root 0!',
        explanation: 'find(1)=0 and find(3)=2. Attach root 2 under root 0 (parent[2] = 0, rank[0]→2). Now {0,1,2,3} form 1 component!',
        invariantCheck: 'Tree height stays bounded by O(log N) via Union by Rank.',
        variables: [
          { name: 'operation', value: 'union(1, 3)' },
          { name: 'components', value: '2' },
        ],
        array: [0, 0, 0, 2, 4],
        secondaryArray: [2, 0, 1, 0, 0],
        activeNodes: ['0', '2', '3'],
        visitedNodes: ['0', '1', '2', '3'],
        activeEdges: ['0->1', '2->3', '0->2'],
      },
      {
        step: 4,
        title: 'union(0, 3) → Path Compression + CYCLE DETECTED!',
        explanation: 'find(3) compresses parent[3] directly to 0! Since find(0) === find(3) === 0, edge (0, 3) is redundant (cycle!).',
        invariantCheck: 'Path compression flattens 3 → 0 for future O(1) lookups.',
        variables: [
          { name: 'find(3)', value: '0 (compressed!)' },
          { name: 'union(0, 3)', value: 'FALSE (CYCLE)' },
        ],
        array: [0, 0, 0, 0, 4],
        secondaryArray: [2, 0, 1, 0, 0],
        activeNodes: ['0', '3'],
        visitedNodes: ['0', '1', '2', '3'],
        activeEdges: ['0->1', '0->2', '0->3'],
      },
    ],
  },

  // 19. Bit Manipulation
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation (XOR, Masks & Shifts)',
    shortName: 'Bit Manipulation',
    category: 'Specialized Algorithms',
    visualType: 'bit-grid',
    tagline: 'Use XOR self-cancellation, bit masks, and shifts for O(1)-space hardware-speed logic.',
    timeComplexity: 'O(N) / O(1) word ops',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(N) HashSet frequency count → O(1) single-register XOR sweep',
    coreIdea:
      'Bitwise XOR obeys two golden identities: x ^ x = 0 and x ^ 0 = x (commutative & associative). XORing an entire array cancels every paired element to zero, leaving the single unique number intact in O(1) space. Similarly, n & (n - 1) clears the lowest set 1-bit.',
    mentalModelSteps: [
      'Self-Cancellation: x ^ x = 0 and x ^ 0 = x isolates the single unpaired number in O(1) space.',
      'Clear Lowest 1-Bit: n & (n - 1) strips the rightmost 1-bit (counts set bits in O(k) or tests Power of Two).',
      'Bitmask Subsets: iterate mask from 0 .. (1 << n) - 1; bit i is included iff (mask >> i) & 1 === 1.',
      'Check/Set/Toggle bit i: (x >> i) & 1, x | (1 << i), x ^ (1 << i).',
    ],
    loopInvariant:
      'After processing nums[0..i], acc equals the exact bitwise XOR of all elements seen so far—order does not matter.',
    whenToUse: [
      'Single Number (LC 136), Missing Number (LC 268), Number of 1 Bits (LC 191)',
      'Subsets / Bitmask DP when N <= 20 (each integer represents an entire visited subset)',
      'Power of Two check: n > 0 && (n & (n - 1)) === 0',
    ],
    whenItFails:
      'Watch out for 32-bit signed integer overflow in Java/JS bit shifts (use >>> for unsigned right shift in JS and avoid 1 << 31 sign traps).',
    linkedTopics: ['Arrays & Prefix Sum', 'Backtracking & Tries'],
    linkedProblemSlugs: ['subsets', 'first-missing-positive', 'two-sum'],
    templates: {
      python: `def single_number(nums):
    acc = 0
    for x in nums:
        acc ^= x
    return acc

def count_set_bits(n):
    bits = 0
    while n:
        n &= (n - 1)  # clears lowest set 1-bit
        bits += 1
    return bits`,
      js: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc ^= x;
  return acc;
}

function countSetBits(n) {
  let bits = 0;
  while (n > 0) {
    n &= (n - 1);
    bits++;
  }
  return bits;
}`,
      java: `public int singleNumber(int[] nums) {
  int acc = 0;
  for (int x : nums) acc ^= x;
  return acc;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Initialize acc = 0 (0000) for nums = [5, 3, 5, 6, 3]',
        explanation: 'Every paired value (5 and 3) will cancel itself to 0000 via XOR, leaving unique number 6 (0110).',
        invariantCheck: 'Identity element for XOR is 0 (0 ^ x = x).',
        variables: [
          { name: 'input', value: '[5, 3, 5, 6, 3]' },
          { name: 'acc (dec)', value: '0' },
          { name: 'acc (bin)', value: '0000' },
        ],
        array: [0, 0, 0, 0],
        secondaryArray: [0, 1, 0, 1],
        hashEntries: [{ key: 'Next op', val: '0000 ^ 0101 (5)', active: true }],
      },
      {
        step: 2,
        title: 'XOR 5 (0101) → acc = 5 (0101)',
        explanation: '0000 ^ 0101 = 0101 (5). Bits 2 and 0 flip ON.',
        invariantCheck: 'acc now holds 5.',
        variables: [
          { name: 'x = 5', value: '0101' },
          { name: 'acc', value: '0101 (5)' },
        ],
        array: [0, 1, 0, 1],
        secondaryArray: [0, 0, 1, 1],
        highlightIndices: [1, 3],
        hashEntries: [{ key: 'Next op', val: '0101 ^ 0011 (3)', active: true }],
      },
      {
        step: 3,
        title: 'XOR 3 (0011) → acc = 6 (0110)',
        explanation: '0101 ^ 0011 = 0110 (6). Bit 0 cancels (1 ^ 1 = 0) while bit 1 flips ON.',
        invariantCheck: 'acc = 5 ^ 3 = 6.',
        variables: [
          { name: 'x = 3', value: '0011' },
          { name: 'acc', value: '0110 (5 ^ 3)' },
        ],
        array: [0, 1, 1, 0],
        secondaryArray: [0, 1, 0, 1],
        highlightIndices: [1, 2],
        hashEntries: [{ key: 'Next op', val: '0110 ^ 0101 (5 cancels!)', active: true }],
      },
      {
        step: 4,
        title: 'XOR second 5 (0101) → 5 CANCELS OUT! acc = 3 (0011)',
        explanation: '(5 ^ 3) ^ 5 = 3! The pair of 5s annihilates cleanly regardless of order.',
        invariantCheck: 'Only unpaired 3 remains in acc.',
        variables: [
          { name: 'x = 5', value: '0101 (cancels 5)' },
          { name: 'acc', value: '0011 (3)' },
        ],
        array: [0, 0, 1, 1],
        secondaryArray: [0, 1, 1, 0],
        highlightIndices: [2, 3],
        hashEntries: [{ key: 'Next ops', val: 'XOR 6 (0110), then XOR 3 (0011)', active: true }],
      },
      {
        step: 5,
        title: 'XOR 6 then second 3 → Unique Answer = 6 (0110)!',
        explanation: '3 ^ 6 ^ 3 = 6 (0110). Both pairs cancelled to zero in O(N) time and O(1) memory!',
        invariantCheck: 'Zero HashMap memory used.',
        variables: [
          { name: 'final acc', value: '0110 (6)' },
          { name: 'extra space', value: 'O(1)' },
        ],
        array: [0, 1, 1, 0],
        matchedIndices: [1, 2],
        hashEntries: [{ key: 'Result', val: '6 (Unique Element)', hit: true }],
      },
    ],
  },

  // 20. KMP / Rabin-Karp String Pattern Matching
  {
    id: 'kmp-rabin-karp',
    name: 'KMP & Rabin-Karp String Matching',
    shortName: 'KMP / Rabin-Karp',
    category: 'Specialized Algorithms',
    visualType: 'kmp-match',
    tagline: 'Match patterns in O(N + M) without ever moving the text pointer i backward.',
    timeComplexity: 'O(N + M)',
    spaceComplexity: 'O(M)',
    complexityLeap: 'O(N · M) naive restart on mismatch → O(N + M) LPS prefix fallback',
    coreIdea:
      'KMP precomputes LPS[j] = length of the longest proper prefix of pattern[0..j] that is also a suffix. On mismatch at pattern[j], instead of restarting text pointer i, jump j = LPS[j - 1] to preserve all already-matched prefix characters!',
    mentalModelSteps: [
      'Build LPS[] array over pattern in O(M) using two pointers (len, i).',
      'Scan text with pointer i and pattern with pointer j.',
      'If text[i] === pattern[j], advance both i++ and j++. If j === M, match found at i - M!',
      'On mismatch: if j > 0, jump j = lps[j - 1] (i NEVER moves backward!); else advance i++.',
    ],
    loopInvariant:
      'At every step, pattern[0 .. j-1] is guaranteed to match the immediately preceding j characters of text.',
    whenToUse: [
      'Find First Occurrence / Substring Search (LC 28) in strict worst-case O(N + M)',
      'Repeated Substring Pattern (LC 459) & Shortest Palindrome (LC 214) using LPS table',
      'Rabin-Karp Rolling Hash for multi-pattern search or Longest Duplicate Substring (LC 1044)',
    ],
    whenItFails:
      'Rabin-Karp has O(N·M) worst-case under hash collisions unless verified; KMP guarantees strict O(N+M) worst-case for single-pattern search.',
    linkedTopics: ['Sliding Window', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['minimum-window-substring', 'longest-substring-without-repeating', 'valid-palindrome-ii'],
    templates: {
      python: `def kmp_search(text, pattern):
    if not pattern: return 0
    lps = [0] * len(pattern)
    length, i = 0, 1
    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1; lps[i] = length; i += 1
        elif length > 0:
            length = lps[length - 1]
        else:
            i += 1
    i = j = 0
    while i < len(text):
        if text[i] == pattern[j]:
            i += 1; j += 1
            if j == len(pattern): return i - j
        elif j > 0:
            j = lps[j - 1]
        else:
            i += 1
    return -1`,
      js: `function kmpSearch(text, pattern) {
  if (!pattern.length) return 0;
  const lps = new Array(pattern.length).fill(0);
  for (let len = 0, i = 1; i < pattern.length; ) {
    if (pattern[i] === pattern[len]) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else i++;
  }
  for (let i = 0, j = 0; i < text.length; ) {
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === pattern.length) return i - j;
    } else if (j > 0) j = lps[j - 1];
    else i++;
  }
  return -1;
}`,
      java: `public int kmpSearch(String text, String pat) {
  if (pat.isEmpty()) return 0;
  int[] lps = new int[pat.length()];
  for (int len = 0, i = 1; i < pat.length(); ) {
    if (pat.charAt(i) == pat.charAt(len)) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else i++;
  }
  for (int i = 0, j = 0; i < text.length(); ) {
    if (text.charAt(i) == pat.charAt(j)) {
      i++; j++;
      if (j == pat.length()) return i - j;
    } else if (j > 0) j = lps[j - 1];
    else i++;
  }
  return -1;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Precompute LPS for pattern "ABABC" → [0, 0, 1, 2, 0]',
        explanation: 'Prefix "AB" repeats at indices 2..3, so LPS[3] = 2. If index 4 ("C") mismatches, jump j back to 2!',
        invariantCheck: 'LPS built in O(M) = 5 steps.',
        variables: [
          { name: 'text', value: 'ABABABABC' },
          { name: 'pattern', value: 'ABABC' },
          { name: 'LPS[]', value: '[0, 0, 1, 2, 0]' },
        ],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'C'],
        secondaryArray: ['A', 'B', 'A', 'B', 'C'],
        hashEntries: [
          { key: 'lps[0] A', val: '0' },
          { key: 'lps[1] B', val: '0' },
          { key: 'lps[2] A', val: '1' },
          { key: 'lps[3] B', val: '2', active: true },
          { key: 'lps[4] C', val: '0' },
        ],
        windowRange: [0, 4],
      },
      {
        step: 2,
        title: 'Match 4 chars "ABAB", then MISMATCH at i=4 ("A" vs "C")!',
        explanation: 'text[0..3] matches pattern[0..3], but text[4]="A" != pattern[4]="C". Naive search would rewind i to 1!',
        invariantCheck: 'KMP NEVER rewinds text pointer i.',
        variables: [
          { name: 'i (text)', value: '4 ("A")' },
          { name: 'j (pat)', value: '4 ("C" ≠ "A")' },
          { name: 'fallback', value: 'j = lps[3] = 2' },
        ],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'C'],
        secondaryArray: ['A', 'B', 'A', 'B', 'C'],
        pointers: [{ label: 'i=4', index: 4, tone: 'rose' }],
        matchedIndices: [0, 1, 2, 3],
        highlightIndices: [4],
        windowRange: [0, 4],
        hashEntries: [
          { key: 'lps[0] A', val: '0' },
          { key: 'lps[1] B', val: '0' },
          { key: 'lps[2] A', val: '1' },
          { key: 'lps[3] B', val: '2', hit: true },
          { key: 'lps[4] C', val: '0' },
        ],
      },
      {
        step: 3,
        title: 'Instant LPS Shift: Align j=2 directly at i=4!',
        explanation: 'Because lps[3] = 2, prefix "AB" (indices 2..3) is ALREADY matched! Compare text[4]="A" with pattern[2]="A" → MATCH!',
        invariantCheck: 'Saved re-checking indices 2 and 3 completely.',
        variables: [
          { name: 'i (text)', value: '4 ("A")' },
          { name: 'j (pat)', value: '2 ("A" == "A")' },
          { name: 'aligned at', value: 'text[2..6]' },
        ],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'C'],
        secondaryArray: ['A', 'B', 'A', 'B', 'C'],
        pointers: [{ label: 'i=4', index: 4, tone: 'emerald' }],
        matchedIndices: [2, 3, 4],
        windowRange: [2, 6],
        hashEntries: [
          { key: 'lps[0] A', val: '0' },
          { key: 'lps[1] B', val: '0' },
          { key: 'lps[2] A', val: '1', active: true },
          { key: 'lps[3] B', val: '2' },
          { key: 'lps[4] C', val: '0' },
        ],
      },
      {
        step: 4,
        title: 'One More LPS Shift → Full Match at Index 4 ("ABABC")!',
        explanation: 'After one more fallback at i=6, pattern aligns at text[4..8] and matches "ABABC" completely in O(N + M)!',
        invariantCheck: 'Text pointer i strictly moved forward 0 → 8 with zero backtracking.',
        variables: [
          { name: 'match start', value: 'index 4' },
          { name: 'complexity', value: 'O(N + M)' },
        ],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'C'],
        secondaryArray: ['A', 'B', 'A', 'B', 'C'],
        pointers: [{ label: 'FOUND @ 4', index: 4, tone: 'emerald' }],
        matchedIndices: [4, 5, 6, 7, 8],
        windowRange: [4, 8],
        hashEntries: [{ key: 'Match Result', val: 'Index 4 ("ABABC")', hit: true }],
      },
    ],
  },
];

// Structured hands-on implementation practice & runnable browser test suites for ALL 20 algorithms
export const PRACTICE_CHALLENGES: Record<string, AlgorithmPracticeSpec> = {
  'prefix-sum-hash': {
    algorithmId: 'prefix-sum-hash',
    functionName: 'subarraySum',
    title: 'Implement Prefix Sum + Frequency Map',
    prompt: 'Return the count of contiguous subarrays in nums whose elements sum to k (handles negatives and zeros).',
    structuredSteps: [
      { step: '1. Seed Map', detail: 'Initialize freq = new Map([[0, 1]]), prefix = 0, count = 0.' },
      { step: '2. Query Before Store', detail: 'For each x: prefix += x; count += freq.get(prefix - k) || 0.' },
      { step: '3. Record Prefix', detail: 'Increment freq.set(prefix, (freq.get(prefix) || 0) + 1) and return count.' },
    ],
    starterCode: `function subarraySum(nums, k) {
  // 1. Seed empty prefix sum 0 with frequency 1
  const freq = new Map([[0, 1]]);
  let prefix = 0, count = 0;

  for (const x of nums) {
    prefix += x;
    // 2. Add how many earlier prefixes equal (prefix - k)
    // TODO: count += ...

    // 3. Record current prefix frequency
    // TODO: freq.set(...)
  }
  return count;
}`,
    solutionCode: `function subarraySum(nums, k) {
  const freq = new Map([[0, 1]]);
  let prefix = 0, count = 0;
  for (const x of nums) {
    prefix += x;
    count += freq.get(prefix - k) || 0;
    freq.set(prefix, (freq.get(prefix) || 0) + 1);
  }
  return count;
}`,
    testCases: [
      { label: 'Positive + Negative Mix', args: [[1, 2, 1, -1, 2], 3], expected: 3 },
      { label: 'Zero Target with Zeros', args: [[0, 0, 0], 0], expected: 6, note: 'Tests querying before updating map' },
      { label: 'Single Exact Match', args: [[5], 5], expected: 1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '#560', title: 'Subarray Sum Equals K', difficulty: 'Medium', focus: 'Negative values + HashMap', trainerSlug: 'subarray-sum-equals-k' },
      { platform: 'NeetCode', number: '#238', title: 'Product of Array Except Self', difficulty: 'Medium', focus: 'Prefix/Suffix without division', trainerSlug: 'product-of-array-except-self' },
      { platform: 'Grind 75', number: '#1', title: 'Two Sum', difficulty: 'Easy', focus: 'Complement lookup', trainerSlug: 'two-sum' },
    ],
  },

  'two-pointers': {
    algorithmId: 'two-pointers',
    functionName: 'maxArea',
    title: 'Implement Converging Two Pointers (Max Container)',
    prompt: 'Given non-negative vertical heights, return the maximum rectangular water area formed by any two lines.',
    structuredSteps: [
      { step: '1. Opposite Ends', detail: 'Set l = 0, r = height.length - 1, best = 0.' },
      { step: '2. Evaluate Area', detail: 'Compute area = (r - l) * Math.min(height[l], height[r]) and update best.' },
      { step: '3. Shrink Limiting Wall', detail: 'Move l++ if height[l] < height[r], else r--.' },
    ],
    starterCode: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    // TODO: compute area and update best

    // TODO: advance the shorter wall inward
    break;
  }
  return best;
}`,
    solutionCode: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, (r - l) * Math.min(height[l], height[r]));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}`,
    testCases: [
      { label: 'Classic Elevation', args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expected: 49 },
      { label: 'Visual Stage Sample', args: [[3, 8, 2, 5, 7, 4]], expected: 21 },
      { label: 'Two Equal Walls', args: [[4, 4]], expected: 4 },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#11', title: 'Container With Most Water', difficulty: 'Medium', focus: 'Shorter-wall greedy proof', trainerSlug: 'container-with-most-water' },
      { platform: 'Grind 75', number: '#15', title: '3Sum', difficulty: 'Medium', focus: 'Sort + duplicate skip', trainerSlug: '3sum' },
      { platform: 'LeetCode', number: '#42', title: 'Trapping Rain Water', difficulty: 'Hard', focus: 'Running leftMax/rightMax', trainerSlug: 'trapping-rain-water' },
    ],
  },

  'sliding-window': {
    algorithmId: 'sliding-window',
    functionName: 'lengthOfLongestSubstring',
    title: 'Implement Variable Sliding Window',
    prompt: 'Return the length of the longest contiguous substring of s containing no repeating characters.',
    structuredSteps: [
      { step: '1. State Map', detail: 'Create last = new Map(), left = 0, best = 0.' },
      { step: '2. Jump Left on Collision', detail: 'If last.has(s[r]), set left = Math.max(left, last.get(s[r]) + 1).' },
      { step: '3. Record & Maximize', detail: 'Update last.set(s[r], r) and best = Math.max(best, r - left + 1).' },
    ],
    starterCode: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    // TODO: jump left forward if s[r] is inside [left..r-1]

    last.set(s[r], r);
    best = Math.max(best, r - left + 1);
  }
  return best;
}`,
    solutionCode: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    if (last.has(s[r])) left = Math.max(left, last.get(s[r]) + 1);
    last.set(s[r], r);
    best = Math.max(best, r - left + 1);
  }
  return best;
}`,
    testCases: [
      { label: 'Visual Sample', args: ['abcbade'], expected: 5 },
      { label: 'All Identical', args: ['bbbb'], expected: 1 },
      { label: 'Empty String', args: [''], expected: 0, note: 'Edge case: empty input' },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#3', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', focus: 'Jump left safely', trainerSlug: 'longest-substring-without-repeating' },
      { platform: 'NeetCode', number: '#76', title: 'Minimum Window Substring', difficulty: 'Hard', focus: 'Formed vs required counter', trainerSlug: 'minimum-window-substring' },
      { platform: 'LeetCode', number: '#239', title: 'Sliding Window Maximum', difficulty: 'Hard', focus: 'Monotonic deque window', trainerSlug: 'sliding-window-maximum' },
    ],
  },

  'kadanes-algorithm': {
    algorithmId: 'kadanes-algorithm',
    functionName: 'maxSubArray',
    title: 'Implement Kadane’s Algorithm',
    prompt: 'Return the largest possible sum of any non-empty contiguous subarray in nums.',
    structuredSteps: [
      { step: '1. Safe Seed', detail: 'Initialize cur = nums[0] and best = nums[0] (works even when all values are negative).' },
      { step: '2. Extend or Restart', detail: 'At each i >= 1, cur = Math.max(nums[i], cur + nums[i]).' },
      { step: '3. Track Peak', detail: 'best = Math.max(best, cur) and return best.' },
    ],
    starterCode: `function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    // TODO: decide whether to restart at nums[i] or extend cur

    // TODO: update global best
  }
  return best;
}`,
    solutionCode: `function maxSubArray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}`,
    testCases: [
      { label: 'Mixed Positives & Negatives', args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { label: 'All Negatives Edge Case', args: [[-8, -3, -6, -2, -5]], expected: -2, note: 'Must not return 0!' },
      { label: 'Single Element', args: [[9]], expected: 9 },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#53', title: 'Maximum Subarray', difficulty: 'Medium', focus: 'Canonical Kadane' },
      { platform: 'NeetCode', number: '#152', title: 'Maximum Product Subarray', difficulty: 'Medium', focus: 'Track curMax & curMin' },
      { platform: 'LeetCode', number: '#121', title: 'Best Time to Buy & Sell Stock', difficulty: 'Easy', focus: 'Running min / diff Kadane', trainerSlug: 'best-time-to-buy-and-sell-stock' },
    ],
  },

  'fast-slow-pointers': {
    algorithmId: 'fast-slow-pointers',
    functionName: 'detectCycleFromNext',
    title: 'Implement Floyd’s Fast & Slow Cycle Detection',
    prompt: 'Given an array nextIdx where nextIdx[i] is the next node index (or -1 for null), return true if starting at 0 enters a cycle.',
    structuredSteps: [
      { step: '1. Start Together', detail: 'Initialize slow = 0, fast = 0.' },
      { step: '2. Advance 1 vs 2', detail: 'While fast !== -1 && nextIdx[fast] !== -1: slow = nextIdx[slow]; fast = nextIdx[nextIdx[fast]].' },
      { step: '3. Detect Collision', detail: 'If slow === fast return true; if loop exits return false.' },
    ],
    starterCode: `function detectCycleFromNext(nextIdx) {
  let slow = 0, fast = 0;
  while (fast !== -1 && nextIdx[fast] !== -1) {
    // TODO: advance slow by 1 hop and fast by 2 hops

    // TODO: return true on collision
    break;
  }
  return false;
}`,
    solutionCode: `function detectCycleFromNext(nextIdx) {
  let slow = 0, fast = 0;
  while (fast !== -1 && nextIdx[fast] !== -1) {
    slow = nextIdx[slow];
    fast = nextIdx[nextIdx[fast]];
    if (slow === fast) return true;
  }
  return false;
}`,
    testCases: [
      { label: 'Cycle 0->1->2->3->1', args: [[1, 2, 3, 1]], expected: true },
      { label: 'Linear Acyclic List', args: [[1, 2, 3, -1]], expected: false },
      { label: 'Single Node Self-Loop', args: [[0]], expected: true },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#141', title: 'Linked List Cycle', difficulty: 'Easy', focus: 'O(1) collision check', trainerSlug: 'linked-list-cycle' },
      { platform: 'NeetCode', number: '#287', title: 'Find the Duplicate Number', difficulty: 'Medium', focus: 'Floyd cycle entry point' },
      { platform: 'LeetCode', number: '#206', title: 'Reverse Linked List', difficulty: 'Easy', focus: 'In-place pointer rewiring', trainerSlug: 'reverse-linked-list' },
    ],
  },

  'monotonic-stack': {
    algorithmId: 'monotonic-stack',
    functionName: 'dailyTemperatures',
    title: 'Implement Monotonic Decreasing Stack',
    prompt: 'For each day i, return how many days until a strictly warmer temperature occurs (0 if none).',
    structuredSteps: [
      { step: '1. Answer + Index Stack', detail: 'Create ans = new Array(temps.length).fill(0) and stack = [].' },
      { step: '2. Pop Colder Days', detail: 'While stack.length && temps[stack.at(-1)] < temps[i]: pop prev and set ans[prev] = i - prev.' },
      { step: '3. Push Current Index', detail: 'stack.push(i) and return ans.' },
    ],
    starterCode: `function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    // TODO: pop while top temperature < temps[i] and record wait days

    stack.push(i);
  }
  return ans;
}`,
    solutionCode: `function dailyTemperatures(temps) {
  const ans = new Array(temps.length).fill(0);
  const stack = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[stack[stack.length - 1]] < temps[i]) {
      const prev = stack.pop();
      ans[prev] = i - prev;
    }
    stack.push(i);
  }
  return ans;
}`,
    testCases: [
      { label: 'Visual Stage Temps', args: [[73, 74, 75, 71, 69, 72, 76]], expected: [1, 1, 4, 2, 1, 1, 0] },
      { label: 'Strictly Decreasing', args: [[90, 80, 70]], expected: [0, 0, 0] },
      { label: 'Strictly Increasing', args: [[60, 65, 70]], expected: [1, 1, 0] },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#739', title: 'Daily Temperatures', difficulty: 'Medium', focus: 'Next Greater Element', trainerSlug: 'daily-temperatures' },
      { platform: 'LeetCode', number: '#84', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', focus: 'Monotonic increasing boundaries', trainerSlug: 'largest-rectangle-in-histogram' },
      { platform: 'Grind 75', number: '#155', title: 'Min Stack', difficulty: 'Medium', focus: 'O(1) stack invariant', trainerSlug: 'min-stack' },
    ],
  },

  'binary-search': {
    algorithmId: 'binary-search',
    functionName: 'searchRotated',
    title: 'Implement Modified Binary Search (Rotated Array)',
    prompt: 'Return the index of target in a distinct rotated sorted array in O(log N) time, or -1 if absent.',
    structuredSteps: [
      { step: '1. Closed Bounds', detail: 'Set l = 0, r = nums.length - 1; loop while (l <= r).' },
      { step: '2. Identify Sorted Half', detail: 'Check if nums[l] <= nums[m] (left sorted) or else right sorted.' },
      { step: '3. Discard Non-Containing Half', detail: 'Narrow toward the half that brackets target.' },
    ],
    starterCode: `function searchRotated(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = l + ((r - l) >> 1);
    if (nums[m] === target) return m;
    // TODO: check which half is sorted and narrow [l, r]
    break;
  }
  return -1;
}`,
    solutionCode: `function searchRotated(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l <= r) {
    const m = l + ((r - l) >> 1);
    if (nums[m] === target) return m;
    if (nums[l] <= nums[m]) {
      if (nums[l] <= target && target < nums[m]) r = m - 1;
      else l = m + 1;
    } else {
      if (nums[m] < target && target <= nums[r]) l = m + 1;
      else r = m - 1;
    }
  }
  return -1;
}`,
    testCases: [
      { label: 'Rotated Pivot Hit', args: [[6, 7, 1, 2, 3, 4, 5], 4], expected: 5 },
      { label: 'Target Absent', args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1 },
      { label: 'Single Element Hit', args: [[7], 7], expected: 0 },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#33', title: 'Search in Rotated Sorted Array', difficulty: 'Medium', focus: 'Sorted half check', trainerSlug: 'search-in-rotated-sorted-array' },
      { platform: 'NeetCode', number: '#875', title: 'Koko Eating Bananas', difficulty: 'Medium', focus: 'Binary Search on Answer', trainerSlug: 'koko-eating-bananas' },
      { platform: 'LeetCode', number: '#4', title: 'Median of Two Sorted Arrays', difficulty: 'Hard', focus: 'Partition halving', trainerSlug: 'median-of-two-sorted-arrays' },
    ],
  },

  'merge-sort-divide-conquer': {
    algorithmId: 'merge-sort-divide-conquer',
    functionName: 'mergeSort',
    title: 'Implement Merge Sort (Divide & Conquer)',
    prompt: 'Return a new ascending sorted array using recursive divide-and-conquer merge sort in O(N log N).',
    structuredSteps: [
      { step: '1. Base Case', detail: 'If arr.length <= 1 return arr.' },
      { step: '2. Divide & Recurse', detail: 'Split at mid = arr.length >> 1 and recursively sort left and right.' },
      { step: '3. Linear Two-Pointer Zip', detail: 'Merge left & right into out[] comparing L[i] <= R[j].' },
    ],
    starterCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const L = mergeSort(arr.slice(0, mid));
  const R = mergeSort(arr.slice(mid));
  const out = [];
  let i = 0, j = 0;
  // TODO: merge sorted halves L and R into out

  return out;
}`,
    solutionCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  const L = mergeSort(arr.slice(0, mid));
  const R = mergeSort(arr.slice(mid));
  const out = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) {
    out.push(L[i] <= R[j] ? L[i++] : R[j++]);
  }
  return out.concat(L.slice(i), R.slice(j));
}`,
    testCases: [
      { label: 'Visual Stage Array', args: [[38, 27, 43, 3, 9, 82]], expected: [3, 9, 27, 38, 43, 82] },
      { label: 'Duplicates & Negatives', args: [[5, -2, 5, 0, -2]], expected: [-2, -2, 0, 5, 5] },
      { label: 'Empty Array', args: [[]], expected: [] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '#912', title: 'Sort an Array', difficulty: 'Medium', focus: 'O(N log N) Merge/Quick Sort' },
      { platform: 'Grind 75', number: '#23', title: 'Merge K Sorted Lists', difficulty: 'Hard', focus: 'Divide-and-conquer list merge', trainerSlug: 'merge-k-sorted-lists' },
      { platform: 'LeetCode', number: '#215', title: 'Kth Largest Element (QuickSelect)', difficulty: 'Medium', focus: 'QuickSort partitioning', trainerSlug: 'kth-largest-in-stream' },
    ],
  },

  'cyclic-sort': {
    algorithmId: 'cyclic-sort',
    functionName: 'firstMissingPositive',
    title: 'Implement Cyclic Sort (First Missing Positive)',
    prompt: 'Return the smallest positive integer (>= 1) missing from nums in O(N) time and O(1) extra space.',
    structuredSteps: [
      { step: '1. Home-Slot While Loop', detail: 'For each i, while nums[i] in [1..n] && nums[nums[i]-1] !== nums[i], swap into slot nums[i]-1.' },
      { step: '2. First Mismatch Scan', detail: 'Return the first i + 1 where nums[i] !== i + 1.' },
      { step: '3. Full Range Fallback', detail: 'If 1..n are all present, return n + 1.' },
    ],
    starterCode: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    // TODO: swap nums[i] into its home index (nums[i] - 1) while valid & misplaced
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  return n + 1;
}`,
    solutionCode: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const t = nums[i] - 1;
      [nums[i], nums[t]] = [nums[t], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) {
    if (nums[i] !== i + 1) return i + 1;
  }
  return n + 1;
}`,
    testCases: [
      { label: 'Visual Stage Sample', args: [[3, 4, -1, 1]], expected: 2 },
      { label: 'Consecutive 1..3', args: [[1, 2, 3]], expected: 4 },
      { label: 'Duplicates Guard', args: [[1, 1, 2]], expected: 3, note: 'Tests infinite-swap guard' },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '#41', title: 'First Missing Positive', difficulty: 'Hard', focus: 'Cyclic placement O(1) space', trainerSlug: 'first-missing-positive' },
      { platform: 'NeetCode', number: '#268', title: 'Missing Number', difficulty: 'Easy', focus: '0..N cyclic or XOR' },
      { platform: 'LeetCode', number: '#442', title: 'Find All Duplicates in an Array', difficulty: 'Medium', focus: 'In-place index mapping' },
    ],
  },

  'heap-intervals': {
    algorithmId: 'heap-intervals',
    functionName: 'minMeetingRooms',
    title: 'Implement Interval Sweep / Min-Heap Rooms',
    prompt: 'Return the minimum number of conference rooms required to host all [start, end] meetings.',
    structuredSteps: [
      { step: '1. Separate & Sort', detail: 'Extract sorted starts[] and sorted ends[] ascending.' },
      { step: '2. Sweep Start vs Earliest End', detail: 'If starts[s] < ends[e], allocate room++; else reuse freed room (e++).' },
      { step: '3. Return Peak Rooms', detail: 'Return rooms.' },
    ],
    starterCode: `function minMeetingRooms(intervals) {
  const starts = intervals.map((x) => x[0]).sort((a, b) => a - b);
  const ends = intervals.map((x) => x[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (let s = 0; s < starts.length; s++) {
    // TODO: compare starts[s] with earliest ending meeting ends[e]
  }
  return rooms;
}`,
    solutionCode: `function minMeetingRooms(intervals) {
  const starts = intervals.map((x) => x[0]).sort((a, b) => a - b);
  const ends = intervals.map((x) => x[1]).sort((a, b) => a - b);
  let rooms = 0, e = 0;
  for (let s = 0; s < starts.length; s++) {
    if (starts[s] < ends[e]) rooms++;
    else e++;
  }
  return rooms;
}`,
    testCases: [
      { label: 'Visual Stage Schedule', args: [[[1, 5], [2, 8], [6, 10], [9, 12]]], expected: 2 },
      { label: 'Back-to-Back Touching', args: [[[1, 4], [4, 7], [7, 10]]], expected: 1 },
      { label: 'All Overlapping', args: [[[0, 10], [1, 9], [2, 8]]], expected: 3 },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#253', title: 'Meeting Rooms II', difficulty: 'Medium', focus: 'Min-Heap / Sweep line', trainerSlug: 'meeting-rooms-ii' },
      { platform: 'Grind 75', number: '#56', title: 'Merge Intervals', difficulty: 'Medium', focus: 'Sort by start + merge', trainerSlug: 'merge-intervals' },
      { platform: 'LeetCode', number: '#295', title: 'Find Median from Data Stream', difficulty: 'Hard', focus: 'Dual Max/Min Heap', trainerSlug: 'find-median-from-data-stream' },
    ],
  },

  'tree-bfs-dfs': {
    algorithmId: 'tree-bfs-dfs',
    functionName: 'bfsShortestHops',
    title: 'Implement Wave-Sized Breadth-First Search (BFS)',
    prompt: 'Given an unweighted adjacency list adj, return the fewest hops from start to target (or -1 if unreachable).',
    structuredSteps: [
      { step: '1. Queue + Visited Set', detail: 'Seed queue = [start], visited = new Set([start]), hops = 0.' },
      { step: '2. Snapshot Wave Size', detail: 'Process all nodes in the current distance wave before incrementing hops++.' },
      { step: '3. Mark Visited on Enqueue', detail: 'Add unseen neighbors to visited immediately when pushing to next wave.' },
    ],
    starterCode: `function bfsShortestHops(adj, start, target) {
  if (start === target) return 0;
  const visited = new Set([start]);
  let wave = [start], hops = 0;
  while (wave.length) {
    hops++;
    const next = [];
    // TODO: expand every node in wave; return hops on target; push unseen neighbors
    break;
  }
  return -1;
}`,
    solutionCode: `function bfsShortestHops(adj, start, target) {
  if (start === target) return 0;
  const visited = new Set([start]);
  let wave = [start], hops = 0;
  while (wave.length) {
    hops++;
    const next = [];
    for (const u of wave) {
      for (const v of adj[u] || []) {
        if (v === target) return hops;
        if (!visited.has(v)) { visited.add(v); next.push(v); }
      }
    }
    wave = next;
  }
  return -1;
}`,
    testCases: [
      { label: '2-Hop Shortest Path', args: [[[1, 2], [3], [3, 4], [4], []], 0, 4], expected: 2 },
      { label: 'Unreachable Target', args: [[[1], [0], [3], []], 0, 3], expected: -1 },
      { label: 'Start Equals Target', args: [[[1], []], 0, 0], expected: 0 },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#102', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', focus: 'Wave-sized queue', trainerSlug: 'binary-tree-level-order' },
      { platform: 'NeetCode', number: '#127', title: 'Word Ladder', difficulty: 'Hard', focus: 'Unweighted shortest hops', trainerSlug: 'word-ladder' },
      { platform: 'LeetCode', number: '#200', title: 'Number of Islands', difficulty: 'Medium', focus: 'Grid BFS flood-fill', trainerSlug: 'number-of-islands' },
    ],
  },

  'depth-first-search': {
    algorithmId: 'depth-first-search',
    functionName: 'countComponents',
    title: 'Implement Depth-First Search (Connected Components)',
    prompt: 'Given n vertices (0..n-1) and undirected edges, return the number of connected components using DFS.',
    structuredSteps: [
      { step: '1. Build Adjacency List', detail: 'Populate undirected edges into adj[u] and adj[v].' },
      { step: '2. Recursive DFS Flood', detail: 'Mark visited[u] = true and recurse on every unvisited neighbor.' },
      { step: '3. Count New Starts', detail: 'Each unvisited vertex i triggers one full DFS and increments count++.' },
    ],
    starterCode: `function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const seen = new Set();
  const dfs = (u) => {
    // TODO: mark u visited and recurse on unseen neighbors
  };
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (!seen.has(i)) { count++; dfs(i); }
  }
  return count;
}`,
    solutionCode: `function countComponents(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const seen = new Set();
  const dfs = (u) => {
    seen.add(u);
    for (const v of adj[u]) if (!seen.has(v)) dfs(v);
  };
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (!seen.has(i)) { count++; dfs(i); }
  }
  return count;
}`,
    testCases: [
      { label: 'Two Components', args: [5, [[0, 1], [1, 2], [3, 4]]], expected: 2 },
      { label: 'Single Connected Graph', args: [4, [[0, 1], [1, 2], [2, 3], [3, 0]]], expected: 1 },
      { label: 'No Edges', args: [3, []], expected: 3 },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#543', title: 'Diameter of Binary Tree', difficulty: 'Easy', focus: 'Postorder DFS return', trainerSlug: 'diameter-of-binary-tree' },
      { platform: 'Grind 75', number: '#236', title: 'Lowest Common Ancestor', difficulty: 'Medium', focus: 'Bottom-up tree DFS', trainerSlug: 'lowest-common-ancestor' },
      { platform: 'LeetCode', number: '#124', title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', focus: 'Branch vs global max', trainerSlug: 'binary-tree-maximum-path-sum' },
    ],
  },

  'graph-topo-sort': {
    algorithmId: 'graph-topo-sort',
    functionName: 'canFinishCourses',
    title: 'Implement Kahn’s Topological Sort (DAG Cycle Check)',
    prompt: 'Given numCourses and prerequisites [course, prereq], return true iff all courses can be finished (no cycle).',
    structuredSteps: [
      { step: '1. Build Adj & Indegree', detail: 'For [c, p], push c to adj[p] and increment indeg[c]++.' },
      { step: '2. Seed Zero-Indegree Queue', detail: 'Push every course i with indeg[i] === 0.' },
      { step: '3. Peel & Count', detail: 'Pop u, increment taken++, decrement neighbors’ indeg, enqueue when 0; return taken === numCourses.' },
    ],
    starterCode: `function canFinishCourses(numCourses, prereqs) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [c, p] of prereqs) { adj[p].push(c); indeg[c]++; }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  let taken = 0;
  // TODO: process queue, decrement indeg[v], push new 0-indegree nodes

  return taken === numCourses;
}`,
    solutionCode: `function canFinishCourses(numCourses, prereqs) {
  const adj = Array.from({ length: numCourses }, () => []);
  const indeg = new Array(numCourses).fill(0);
  for (const [c, p] of prereqs) { adj[p].push(c); indeg[c]++; }
  const q = [];
  for (let i = 0; i < numCourses; i++) if (indeg[i] === 0) q.push(i);
  let taken = 0;
  while (q.length) {
    const u = q.shift();
    taken++;
    for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);
  }
  return taken === numCourses;
}`,
    testCases: [
      { label: 'Valid DAG Schedule', args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expected: true },
      { label: 'Direct Cycle', args: [2, [[1, 0], [0, 1]]], expected: false },
      { label: 'No Prerequisites', args: [3, []], expected: true },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#210', title: 'Course Schedule II', difficulty: 'Medium', focus: 'Kahn’s order output', trainerSlug: 'course-schedule-ii' },
      { platform: 'LeetCode', number: '#269', title: 'Alien Dictionary', difficulty: 'Hard', focus: 'Char dependency DAG' },
      { platform: 'Grind 75', number: '#127', title: 'Word Ladder', difficulty: 'Hard', focus: 'Graph BFS layers', trainerSlug: 'word-ladder' },
    ],
  },

  'dijkstra-shortest-path': {
    algorithmId: 'dijkstra-shortest-path',
    functionName: 'networkDelayTime',
    title: 'Implement Dijkstra’s Shortest Path',
    prompt: 'Given directed weighted edges [u, v, w] (1-indexed 1..n) and source k, return min time for all nodes to receive signal (or -1).',
    structuredSteps: [
      { step: '1. Init Distances & PQ', detail: 'dist[1..n] = Infinity, dist[k] = 0, pq = [[0, k]].' },
      { step: '2. Skip Stale Pops', detail: 'Pop smallest [d, u]; if d > dist[u] continue.' },
      { step: '3. Relax Outgoing Edges', detail: 'If d + w < dist[v], update dist[v] and push [d + w, v]. Return max(dist[1..n]).' },
    ],
    starterCode: `function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const pq = [[0, k]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    // TODO: relax every outgoing edge [v, w] of u
  }
  const ans = Math.max(...dist.slice(1));
  return ans === Infinity ? -1 : ans;
}`,
    solutionCode: `function networkDelayTime(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) adj[u].push([v, w]);
  const dist = new Array(n + 1).fill(Infinity);
  dist[k] = 0;
  const pq = [[0, k]];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) { dist[v] = d + w; pq.push([d + w, v]); }
    }
  }
  const ans = Math.max(...dist.slice(1));
  return ans === Infinity ? -1 : ans;
}`,
    testCases: [
      { label: 'Connected Weighted Graph', args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expected: 2 },
      { label: 'Unreachable Node', args: [[[1, 2, 1]], 3, 1], expected: -1 },
      { label: 'Relaxation Shortcut', args: [[[1, 2, 5], [1, 3, 1], [3, 2, 2]], 3, 1], expected: 3 },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#743', title: 'Network Delay Time', difficulty: 'Medium', focus: 'Canonical Dijkstra', trainerSlug: 'network-delay-time' },
      { platform: 'LeetCode', number: '#778', title: 'Swim in Rising Water', difficulty: 'Hard', focus: 'Minimax Dijkstra', trainerSlug: 'swim-in-rising-water' },
      { platform: 'CSES', number: '1671', title: 'Shortest Routes I', difficulty: 'Medium', focus: 'Large-scale priority queue' },
    ],
  },

  'union-find-dsu': {
    algorithmId: 'union-find-dsu',
    functionName: 'findRedundantEdge',
    title: 'Implement Union-Find (Detect Cycle Edge)',
    prompt: 'Given 1-indexed undirected edges forming a tree plus one extra cycle edge, return that redundant edge [u, v].',
    structuredSteps: [
      { step: '1. Parent Array', detail: 'Initialize parent[i] = i for 0..edges.length.' },
      { step: '2. Path Compression Find', detail: 'find(x): return parent[x] === x ? x : (parent[x] = find(parent[x])).' },
      { step: '3. Detect Same Root', detail: 'For each [u, v]: if find(u) === find(v) return [u, v]; else parent[find(u)] = find(v).' },
    ],
    starterCode: `function findRedundantEdge(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const [u, v] of edges) {
    // TODO: check if u and v share a root; if so return [u, v], else union them
  }
  return [];
}`,
    solutionCode: `function findRedundantEdge(edges) {
  const parent = Array.from({ length: edges.length + 1 }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const [u, v] of edges) {
    const ru = find(u), rv = find(v);
    if (ru === rv) return [u, v];
    parent[ru] = rv;
  }
  return [];
}`,
    testCases: [
      { label: 'Triangle Cycle', args: [[[1, 2], [1, 3], [2, 3]]], expected: [2, 3] },
      { label: '4-Cycle Closing Edge', args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expected: [1, 4] },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#721', title: 'Accounts Merge', difficulty: 'Medium', focus: 'Transitive email union', trainerSlug: 'accounts-merge' },
      { platform: 'NeetCode', number: '#684', title: 'Redundant Connection', difficulty: 'Medium', focus: 'Cycle detection via DSU' },
      { platform: 'LeetCode', number: '#1971', title: 'Find if Path Exists in Graph', difficulty: 'Easy', focus: 'Connected component query', trainerSlug: 'find-if-path-exists' },
    ],
  },

  'dynamic-programming': {
    algorithmId: 'dynamic-programming',
    functionName: 'coinChange',
    title: 'Implement Bottom-Up Dynamic Programming (Coin Change)',
    prompt: 'Return the minimum number of coins required to make up amount (or -1 if impossible).',
    structuredSteps: [
      { step: '1. Table + Base Case', detail: 'dp = new Array(amount + 1).fill(amount + 1); dp[0] = 0.' },
      { step: '2. Bottom-Up Transitions', detail: 'For x = 1..amount and each coin c <= x: dp[x] = Math.min(dp[x], 1 + dp[x - c]).' },
      { step: '3. Sentinel Check', detail: 'Return dp[amount] > amount ? -1 : dp[amount].' },
    ],
    starterCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      // TODO: relax dp[x] using dp[x - c] when c <= x
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
    solutionCode: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let x = 1; x <= amount; x++) {
    for (const c of coins) {
      if (c <= x) dp[x] = Math.min(dp[x], 1 + dp[x - c]);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
    testCases: [
      { label: 'Greedy-Trap Case [1,3,4] → 6', args: [[1, 3, 4], 6], expected: 2, note: '3+3 beats greedy 4+1+1' },
      { label: 'Impossible Amount', args: [[2], 3], expected: -1 },
      { label: 'Zero Amount', args: [[1, 5], 0], expected: 0 },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#322', title: 'Coin Change', difficulty: 'Medium', focus: 'Unbounded min-cost DP', trainerSlug: 'coin-change' },
      { platform: 'NeetCode', number: '#300', title: 'Longest Increasing Subsequence', difficulty: 'Medium', focus: '1D DP / Patience BS', trainerSlug: 'longest-increasing-subsequence' },
      { platform: 'LeetCode', number: '#72', title: 'Edit Distance', difficulty: 'Hard', focus: '2D string alignment DP', trainerSlug: 'edit-distance' },
    ],
  },

  'greedy-algorithms': {
    algorithmId: 'greedy-algorithms',
    functionName: 'maxNonOverlapping',
    title: 'Implement Greedy Interval Selection',
    prompt: 'Return the maximum number of non-overlapping [start, end] intervals you can keep.',
    structuredSteps: [
      { step: '1. Sort by End Time', detail: 'Sort intervals ascending by end time (a[1] - b[1]).' },
      { step: '2. Track Earliest Finish', detail: 'Initialize kept = 0, lastEnd = -Infinity.' },
      { step: '3. Accept Compatible', detail: 'If start >= lastEnd, increment kept++ and set lastEnd = end.' },
    ],
    starterCode: `function maxNonOverlapping(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    // TODO: accept interval if s >= lastEnd and update lastEnd
  }
  return kept;
}`,
    solutionCode: `function maxNonOverlapping(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let kept = 0, lastEnd = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= lastEnd) { kept++; lastEnd = e; }
  }
  return kept;
}`,
    testCases: [
      { label: 'Visual Stage Intervals', args: [[[1, 3], [2, 5], [4, 7], [6, 8], [8, 11]]], expected: 3 },
      { label: 'Identical Overlapping', args: [[[1, 2], [1, 2], [1, 2]]], expected: 1 },
      { label: 'All Disjoint', args: [[[1, 2], [2, 3], [3, 4]]], expected: 3 },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#435', title: 'Non-overlapping Intervals', difficulty: 'Medium', focus: 'Sort by end time' },
      { platform: 'Grind 75', number: '#56', title: 'Merge Intervals', difficulty: 'Medium', focus: 'Sort by start time', trainerSlug: 'merge-intervals' },
      { platform: 'LeetCode', number: '#121', title: 'Best Time to Buy & Sell Stock', difficulty: 'Easy', focus: 'Greedy running minimum', trainerSlug: 'best-time-to-buy-and-sell-stock' },
    ],
  },

  'backtracking-trie': {
    algorithmId: 'backtracking-trie',
    functionName: 'combinationSumCount',
    title: 'Implement Pruned Backtracking (Combination Sum)',
    prompt: 'Return the number of unique combinations from distinct positive candidates summing to target (elements reusable).',
    structuredSteps: [
      { step: '1. Sort for Early Pruning', detail: 'Sort candidates ascending so cand[i] > rem breaks loop.' },
      { step: '2. Base Case Hit', detail: 'If rem === 0, increment count++ and return.' },
      { step: '3. Choose → Explore → Unchoose', detail: 'Loop i from start..n-1 and recurse dfs(i, rem - cand[i]).' },
    ],
    starterCode: `function combinationSumCount(candidates, target) {
  candidates.sort((a, b) => a - b);
  let count = 0;
  function dfs(start, rem) {
    if (rem === 0) { count++; return; }
    for (let i = start; i < candidates.length; i++) {
      // TODO: prune when candidates[i] > rem, else recurse with (i, rem - candidates[i])
    }
  }
  dfs(0, target);
  return count;
}`,
    solutionCode: `function combinationSumCount(candidates, target) {
  candidates.sort((a, b) => a - b);
  let count = 0;
  function dfs(start, rem) {
    if (rem === 0) { count++; return; }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > rem) break;
      dfs(i, rem - candidates[i]);
    }
  }
  dfs(0, target);
  return count;
}`,
    testCases: [
      { label: 'Visual Stage [2,3,5] → 5', args: [[2, 3, 5], 5], expected: 2 },
      { label: 'Standard [2,3,6,7] → 7', args: [[2, 3, 6, 7], 7], expected: 2 },
      { label: 'No Valid Combo', args: [[4, 6], 3], expected: 0 },
    ],
    platformDrills: [
      { platform: 'Grind 75', number: '#39', title: 'Combination Sum', difficulty: 'Medium', focus: 'Non-decreasing start index', trainerSlug: 'combination-sum' },
      { platform: 'NeetCode', number: '#78', title: 'Subsets', difficulty: 'Medium', focus: 'Power set decision tree', trainerSlug: 'subsets' },
      { platform: 'LeetCode', number: '#212', title: 'Word Search II', difficulty: 'Hard', focus: 'Backtracking + Prefix Trie', trainerSlug: 'word-search-ii' },
    ],
  },

  'bit-manipulation': {
    algorithmId: 'bit-manipulation',
    functionName: 'singleNumber',
    title: 'Implement Bitwise XOR Unique Finder',
    prompt: 'Every element in nums appears twice except for one unique element. Return that unique element in O(N) time and O(1) space.',
    structuredSteps: [
      { step: '1. Zero Accumulator', detail: 'Start with acc = 0.' },
      { step: '2. XOR Every Value', detail: 'Apply acc ^= x so every duplicate pair cancels to 0.' },
      { step: '3. Return Survivor', detail: 'Return acc directly in O(1) memory.' },
    ],
    starterCode: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) {
    // TODO: XOR x into acc
  }
  return acc;
}`,
    solutionCode: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc ^= x;
  return acc;
}`,
    testCases: [
      { label: 'Visual Stage Array', args: [[5, 3, 5, 6, 3]], expected: 6 },
      { label: 'Negative Unique Value', args: [[-7, 4, 4, 9, 9]], expected: -7 },
      { label: 'Single Element', args: [[42]], expected: 42 },
    ],
    platformDrills: [
      { platform: 'NeetCode', number: '#136', title: 'Single Number', difficulty: 'Easy', focus: 'XOR cancellation' },
      { platform: 'NeetCode', number: '#191', title: 'Number of 1 Bits', difficulty: 'Easy', focus: 'n & (n - 1) bit clear' },
      { platform: 'LeetCode', number: '#78', title: 'Subsets (Bitmask Variant)', difficulty: 'Medium', focus: '0 .. (1 << n) mask iteration', trainerSlug: 'subsets' },
    ],
  },

  'kmp-rabin-karp': {
    algorithmId: 'kmp-rabin-karp',
    functionName: 'kmpSearch',
    title: 'Implement KMP Pattern Matching (LPS Table)',
    prompt: 'Return the first starting index of pattern inside text in strict O(N + M) time, or -1 if absent.',
    structuredSteps: [
      { step: '1. Build LPS[]', detail: 'Precompute longest proper prefix-suffix lengths for pattern.' },
      { step: '2. Advance on Match', detail: 'If text[i] === pattern[j], advance i++, j++ and return i - j when j === pattern.length.' },
      { step: '3. Fallback Without Rewinding i', detail: 'On mismatch: if j > 0 set j = lps[j - 1]; else i++.' },
    ],
    starterCode: `function kmpSearch(text, pattern) {
  if (!pattern.length) return 0;
  const lps = new Array(pattern.length).fill(0);
  for (let len = 0, i = 1; i < pattern.length; ) {
    if (pattern[i] === pattern[len]) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else i++;
  }
  for (let i = 0, j = 0; i < text.length; ) {
    // TODO: match text[i] vs pattern[j] and fallback via lps[j - 1]
    break;
  }
  return -1;
}`,
    solutionCode: `function kmpSearch(text, pattern) {
  if (!pattern.length) return 0;
  const lps = new Array(pattern.length).fill(0);
  for (let len = 0, i = 1; i < pattern.length; ) {
    if (pattern[i] === pattern[len]) lps[i++] = ++len;
    else if (len > 0) len = lps[len - 1];
    else i++;
  }
  for (let i = 0, j = 0; i < text.length; ) {
    if (text[i] === pattern[j]) {
      i++; j++;
      if (j === pattern.length) return i - j;
    } else if (j > 0) j = lps[j - 1];
    else i++;
  }
  return -1;
}`,
    testCases: [
      { label: 'Visual Stage Overlap', args: ['ABABABABC', 'ABABC'], expected: 4 },
      { label: 'Pattern Not Found', args: ['ABCDABCD', 'ABCE'], expected: -1 },
      { label: 'Match at Start', args: ['hello', 'he'], expected: 0 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '#28', title: 'Find the Index of the First Occurrence', difficulty: 'Easy', focus: 'Canonical KMP / Rabin-Karp' },
      { platform: 'LeetCode', number: '#459', title: 'Repeated Substring Pattern', difficulty: 'Easy', focus: 'LPS periodicity check' },
      { platform: 'LeetCode', number: '#214', title: 'Shortest Palindrome', difficulty: 'Hard', focus: 'KMP on s + # + rev(s)' },
    ],
  },
};
