import {
  LINE_BY_LINE_PATTERNS_PART1,
  type AnnotatedCodeLine,
  type CodeLineRole,
  type DryRunStep,
  type KarumanchiChapterNote,
  type LineByLinePatternBlueprint,
  type UnderstandingCheck,
  type WorkedSampleProblem,
} from './dsaLineByLinePatternsPart1';
import { LINE_BY_LINE_PATTERNS_PART2 } from './dsaLineByLinePatternsPart2';

export type {
  AnnotatedCodeLine,
  CodeLineRole,
  DryRunStep,
  KarumanchiChapterNote,
  LineByLinePatternBlueprint,
  UnderstandingCheck,
  WorkedSampleProblem,
};

export const ALL_20_CODING_PATTERNS: LineByLinePatternBlueprint[] = [
  ...LINE_BY_LINE_PATTERNS_PART1,
  ...LINE_BY_LINE_PATTERNS_PART2,
];

/**
 * Resolve the primary 20-Pattern Line-by-Line Blueprint for any 28-Pattern ID or Curriculum Topic ID.
 */
export function findLineByLinePatternFor28Id(
  pattern28Id: string
): LineByLinePatternBlueprint | undefined {
  return ALL_20_CODING_PATTERNS.find((pat) => pat.dsa28PatternIds.includes(pattern28Id));
}

export function findLineByLinePatternForTopicId(
  topicId: string
): LineByLinePatternBlueprint | undefined {
  return ALL_20_CODING_PATTERNS.find((pat) => pat.curriculumTopicIds.includes(topicId));
}

/**
 * 18 Core Chapters distilled from Narasimha Karumanchi's
 * "Data Structures and Algorithms Made Easy" — structured around
 * principles, exact invariants/formulas, complexity proofs, and bug traps.
 */
export const KARUMANCHI_CHAPTER_NOTES: KarumanchiChapterNote[] = [
  {
    chapter: 1,
    title: 'Asymptotic Analysis & Master Theorem',
    madeEasyDefinition:
      'An algorithm is a step-by-step finite set of instructions written to solve a specific problem. Asymptotic Analysis measures how an algorithm\'s running time and memory grow as input size n becomes very large, independent of CPU speed or programming language.',
    adtOperations:
      'Three Core Notations: Big-O gives the tight upper bound (worst-case ceiling), Big-Omega (Ω) gives the lower bound (best-case floor), and Big-Theta (Θ) gives the exact tight bound when upper and lower growth rates match.',
    memoryRepresentation:
      'Space Complexity counts both Fixed Auxiliary Space (loop counters and constants) and Variable Space (arrays, hash maps, and recursion call-stack frames proportional to input size n).',
    corePrinciple:
      'Compare algorithms strictly by their dominant growth rate as n approaches infinity, ignoring lower-order terms and constant multipliers.',
    formulaOrInvariant:
      'Divide and Conquer Master Theorem: T(n) = a·T(n/b) + Θ(n^d · log^k n). Compare log_b(a) with d: if log_b(a) < d then Θ(n^d); if equal then Θ(n^d · log^(k+1) n); if log_b(a) > d then Θ(n^(log_b a)).',
    complexityBreakdown:
      'Binary Search (a=1, b=2, d=0) takes Θ(log n); Merge Sort (a=2, b=2, d=1) takes Θ(n log n); Binary Tree traversal (a=2, b=2, d=0) takes Θ(n).',
    classicTrap:
      'Assuming every nested loop automatically costs O(n²). Sliding windows and monotonic stacks use an inner while-loop whose total pops across the entire execution cannot exceed n, keeping total time O(n) amortized.',
    linkedPatternIds: ['sliding-window', 'modified-binary-search'],
  },
  {
    chapter: 2,
    title: 'Recursion & Backtracking',
    madeEasyDefinition:
      'Recursion is a technique in which a function calls itself on a smaller subproblem until it hits a stopping Base Case. Backtracking is an algorithmic form of recursion that explores candidate choices step by step and immediately undoes any path that violates constraints.',
    adtOperations:
      'Core Recursive Contract: 1) Base Case to stop infinite calls, 2) Recursive Case that shrinks input strictly toward the base case, and 3) Choose → Explore → Unchoose state restoration for backtracking.',
    memoryRepresentation:
      'Every active recursive call pushes a Stack Frame (local variables, parameters, and return address) onto the OS Call Stack, consuming O(depth) memory until the call returns.',
    corePrinciple:
      'Every recursive function must guarantee strict progress toward its base case, and any shared mutable container must return to its exact pre-call state after backtracking.',
    formulaOrInvariant:
      'State Restoration Invariant: for every `path.push(choice)` executed before a recursive call, a matching `path.pop()` executes right after the call returns.',
    complexityBreakdown:
      'Subsets take O(n · 2^n) time and O(n) stack space; Permutations take O(n · n!) time and O(n) stack space; N-Queens runs within O(n!) upper bound with column and diagonal pruning.',
    classicTrap:
      'Saving a direct reference to the mutable `path` list instead of appending a snapshot copy (`path.copy()` in Python or `new ArrayList<>(path)` in Java), which causes every stored answer to end up empty.',
    linkedPatternIds: ['subsets-backtracking'],
  },
  {
    chapter: 3,
    title: 'Linked Lists (Singly, Doubly, Circular & Floyd Proof)',
    madeEasyDefinition:
      'A Linked List is a linear dynamic data structure made of separate nodes stored anywhere in heap memory, where each node holds a data value and one or more pointer links to neighboring nodes.',
    adtOperations:
      'Main ADT Operations: Insert(position, value), Delete(position), Search(value), and Traverse(). Auxiliary Operations: Length(), Reverse(), FindMiddle(), and DetectCycle().',
    memoryRepresentation:
      'Unlike an array\'s contiguous memory block, each Linked List node is heap-allocated independently with a `data` field and a `next` reference (plus `prev` in Doubly Linked Lists), requiring extra pointer memory per node.',
    corePrinciple:
      'Linked Lists trade O(1) random index access for O(1) pointer rewiring whenever the predecessor node is known, and a Dummy Sentinel node eliminates special-case bugs at the head.',
    formulaOrInvariant:
      'Floyd Cycle Entry Proof: 2(D + K) = D + K + m·C simplifies to D = m·C - K. Moving one pointer from head and one from the meeting node at speed 1 collides at the exact cycle start.',
    complexityBreakdown:
      'Search and index access take O(n); Insert or delete at a known node takes O(1); Iterative reversal and cycle detection take O(n) time and O(1) extra space.',
    classicTrap:
      'Overwriting `curr.next = prev` before storing `nextNode = curr.next`, or comparing `slow.val == fast.val` instead of node reference identity during cycle detection.',
    linkedPatternIds: ['fast-slow-pointers', 'in-place-linked-list-reversal'],
  },
  {
    chapter: 4,
    title: 'Stacks & Monotonic Stack',
    madeEasyDefinition:
      'A Stack is an ordered linear Abstract Data Type in which all insertions and deletions occur strictly at one end called the Top, following the Last-In First-Out (LIFO) rule.',
    adtOperations:
      'Main ADT Operations: Push(data) inserts at top, Pop() removes and returns the top item. Auxiliary Operations: Top()/Peek() inspects top without removal, Size(), IsEmpty(), and IsFull() for fixed arrays.',
    memoryRepresentation:
      'Implemented either over a Dynamic Array (contiguous RAM, cache-friendly, occasional O(n) resize doubling) or a Singly Linked List pushing and popping at the head (strict O(1) worst-case per operation).',
    corePrinciple:
      'LIFO order naturally resolves nested structures such as balanced brackets and function frames, while a Monotonic Stack answers Next Greater Element and Histogram Span queries in one linear pass.',
    formulaOrInvariant:
      'Monotonic Stack Amortization: every element is pushed onto the stack once and popped at most once, and the element causing a pop is the exact nearest boundary.',
    complexityBreakdown:
      'Push, Pop, and Peek run in O(1); Next Greater Element and Largest Rectangle in Histogram run in O(n) time and O(n) space.',
    classicTrap:
      'Storing raw element values instead of array indices inside a monotonic stack, which prevents computing span widths via `(rightIndex - leftIndex - 1)`.',
    linkedPatternIds: ['depth-first-search'],
  },
  {
    chapter: 5,
    title: 'Queues, Circular Buffers & Monotonic Deques',
    madeEasyDefinition:
      'A Queue is an ordered linear Abstract Data Type where insertions happen strictly at the Rear (Enqueue) and deletions happen strictly at the Front (Dequeue), following the First-In First-Out (FIFO) rule.',
    adtOperations:
      'Main ADT Operations: Enqueue(data) adds at rear and Dequeue() removes from front. Auxiliary Operations: Front(), QueueSize(), and IsEmpty(). A Deque additionally supports O(1) push and pop at both ends.',
    memoryRepresentation:
      'Implemented as a Circular Array using `(index + 1) % capacity` wrap-around arithmetic so freed front slots are reused without shifting elements, or as a Linked List maintaining both `head` and `tail` pointers.',
    corePrinciple:
      'FIFO order preserves exact discovery distance for level-by-level Breadth-First Search, while a Monotonic Deque maintains the current maximum of a sliding window in O(1) amortized time.',
    formulaOrInvariant:
      'Monotonic Deque Rule: evict expired indices from the front (`dq[0] <= i - k`) and evict smaller dominated values from the back (`nums[dq[-1]] <= nums[i]`) so the front always holds the window maximum.',
    complexityBreakdown:
      'Circular Queue and Deque operations run in O(1); Two-Stack Queue runs in O(1) amortized; Sliding Window Maximum runs in O(n) time and O(k) space.',
    classicTrap:
      'Calling `list.pop(0)` in Python or `Array.shift()` in JavaScript inside a BFS loop, which shifts all remaining elements on every dequeue and degrades O(n) BFS into O(n²).',
    linkedPatternIds: ['breadth-first-search', 'sliding-window'],
  },
  {
    chapter: 6,
    title: 'Binary Trees, BSTs & Self-Balancing AVL Trees',
    madeEasyDefinition:
      'A Tree is a hierarchical non-linear data structure composed of nodes connected by parent-child edges with one Root and no cycles. A Binary Tree restricts every node to at most two children (Left and Right), and a Binary Search Tree (BST) orders keys strictly left < root < right.',
    adtOperations:
      'Core Operations: Insert(key), Delete(key), Search(key), Height(), Diameter(), LCA(p, q), and four Traversals—Preorder (Root-L-R), Inorder (L-Root-R), Postorder (L-R-Root), and Level-Order BFS.',
    memoryRepresentation:
      'Stored as heap-allocated nodes containing `val`, `left`, and `right` pointers (or densely packed in a 1D array when the tree is a Complete Binary Tree such as a Binary Heap).',
    corePrinciple:
      'Solve every tree question by choosing either top-down state passing (path sums and inherited BST bounds) or bottom-up subtree aggregation (height, balance check, diameter, and LCA).',
    formulaOrInvariant:
      'Global BST Property: every key in the entire left subtree must be strictly less than `node.val`, and every key in the entire right subtree must be strictly greater than `node.val`—verified using an inherited `(minBound, maxBound)` range.',
    complexityBreakdown:
      'Full tree traversals take O(n) time and O(h) stack space; Balanced BST / AVL search, insert, and delete run in O(log n) via LL, RR, LR, and RL rotations; an unbalanced skewed BST degrades to O(n).',
    classicTrap:
      'Validating a BST by checking only immediate children (`left.val < node.val < right.val`), which misses deep descendants that violate an ancestor\'s range.',
    linkedPatternIds: ['breadth-first-search', 'depth-first-search'],
  },
  {
    chapter: 7,
    title: 'Priority Queues & Binary Heaps',
    madeEasyDefinition:
      'A Priority Queue is an Abstract Data Type that always serves the highest-priority (minimum or maximum) element first rather than arrival order. A Binary Heap is its standard implementation using a Complete Binary Tree that satisfies the Heap Order Property.',
    adtOperations:
      'Main ADT Operations: Insert(key) via Percolate-Up, DeleteMin()/DeleteMax() via Percolate-Down, GetMin()/GetMax() peek in O(1), and BuildHeap(array) bottom-up heapification in O(n).',
    memoryRepresentation:
      'Because a Binary Heap is always a Complete Binary Tree, it is stored compactly inside a plain 1D array with zero pointer overhead using index formulas `left = 2i + 1`, `right = 2i + 2`, and `parent = floor((i - 1) / 2)`.',
    corePrinciple:
      'A Binary Heap avoids paying O(n log n) for full sorting whenever you only need rapid access to the running minimum, maximum, Top-K items, or stream median.',
    formulaOrInvariant:
      'Bottom-Up BuildHeap Proof: skipping all n/2 leaf nodes and percolating down from index `floor(n/2) - 1` to `0` sums `Σ (n / 2^(h+1)) · h = O(n)` linear time.',
    complexityBreakdown:
      'BuildHeap runs in O(n); Insert and Extract run in O(log n); Top-K runs in O(n log k); K-Way Merge runs in O(N log k); Two-Heap Streaming Median takes O(log n) insert and O(1) query.',
    classicTrap:
      'Building a Max-Heap of all N elements to find the Kth Largest item, which wastes O(N) memory and O(N log N) time instead of keeping a Min-Heap of fixed size K in O(N log K).',
    linkedPatternIds: ['two-heaps', 'top-k-elements', 'k-way-merge'],
  },
  {
    chapter: 8,
    title: 'Disjoint Sets (Union-Find ADT)',
    madeEasyDefinition:
      'A Disjoint Set (Union-Find) is a data structure that maintains a collection of non-overlapping sets and rapidly answers whether two elements belong to the same connected component.',
    adtOperations:
      'Three Core ADT Operations: MakeSet(x) creates a singleton set, Find(x) returns the representative root of x\'s set, and Union(x, y) merges the two sets containing x and y.',
    memoryRepresentation:
      'Stored as two compact integer arrays: `parent[i]` holding the parent pointer of each node (roots point to themselves) and `rank[i]` or `size[i]` tracking tree depth for balanced merges.',
    corePrinciple:
      'Combining Union-by-Rank (always attach the shorter tree under the taller root) with Path Compression (re-point visited nodes straight to the root) keeps connectivity queries effectively constant time.',
    formulaOrInvariant:
      'Amortized Complexity Bound: Path Compression + Union-by-Rank reduces every Find and Union to O(α(n)), where the inverse Ackermann function α(n) stays at most 4 for all practical dataset sizes.',
    complexityBreakdown:
      'MakeSet takes O(n) initialization; Find and Union run in O(α(n)) amortized time (effectively O(1)) with O(n) space.',
    classicTrap:
      'Checking `parent[a] == parent[b]` directly instead of calling `find(a) == find(b)`, which fails whenever intermediate nodes have not yet been path-compressed.',
    linkedPatternIds: ['islands-matrix-traversal', 'depth-first-search'],
  },
  {
    chapter: 9,
    title: 'Graph Algorithms (BFS, DFS, Topo Sort, Shortest Paths & MST)',
    madeEasyDefinition:
      'A Graph G = (V, E) is a non-linear data structure consisting of a finite set of Vertices V connected by Edges E, which may be directed or undirected and weighted or unweighted.',
    adtOperations:
      'Core Graph Algorithms: BFS (unweighted shortest hops), DFS (connected components and cycle checks), Topological Sort (DAG ordering via Kahn\'s Queue or DFS post-order), Dijkstra / Bellman-Ford (shortest paths), and Kruskal / Prim (Minimum Spanning Tree).',
    memoryRepresentation:
      'Adjacency List uses O(V + E) memory and is standard for sparse graphs; Adjacency Matrix uses O(V²) memory and provides O(1) edge lookup for dense graphs.',
    corePrinciple:
      'Choose the exact graph algorithm directly from edge properties: BFS for unweighted graphs, Kahn\'s algorithm for DAG dependencies, Dijkstra for non-negative weights, and Bellman-Ford when negative edges exist.',
    formulaOrInvariant:
      'Dijkstra Greedy Cut Property: when all edge weights are non-negative, popping the smallest tentative distance vertex `u` from the min-heap guarantees that `dist[u]` is permanently final.',
    complexityBreakdown:
      'BFS, DFS, and Kahn Topological Sort run in O(V + E); Dijkstra with a binary heap runs in O((V + E) log V); Bellman-Ford runs in O(V · E); Kruskal MST runs in O(E log E).',
    classicTrap:
      'Running Dijkstra on negative edge weights, or forgetting to skip outdated heap entries with `if poppedDist > dist[u]: continue`.',
    linkedPatternIds: ['islands-matrix-traversal', 'breadth-first-search', 'depth-first-search', 'topological-sort'],
  },
  {
    chapter: 10,
    title: 'Sorting Algorithms, Stability & Lower Bounds',
    madeEasyDefinition:
      'Sorting arranges a collection of records into ascending or descending order based on a comparison key so searching, grouping, deduplication, and interval merging become fast.',
    adtOperations:
      'Classification Axes: In-Place vs Out-of-Place (extra RAM), Stable vs Unstable (preserves relative order of equal keys), Internal (RAM) vs External (disk K-way merge), and Comparison-Based vs Linear Non-Comparison Sorts.',
    memoryRepresentation:
      'QuickSort and HeapSort rearrange arrays in-place with O(log n) or O(1) extra space; Merge Sort requires an O(n) auxiliary buffer for arrays but sorts Linked Lists in O(1) extra space.',
    corePrinciple:
      'Every comparison-based sort must take at least Ω(n log n) comparisons in the worst case because a binary decision tree needs height `log₂(n!) = Θ(n log n)` to distinguish all n! permutations.',
    formulaOrInvariant:
      'Stability Rule: Merge Sort, Insertion Sort, and Timsort preserve the original order of equal keys; HeapSort and standard Lomuto/Hoare QuickSort do not.',
    complexityBreakdown:
      'Merge Sort and Timsort guarantee O(n log n) worst case; QuickSort averages O(n log n) but degrades to O(n²) on bad pivots; Counting, Radix, and Cyclic Sort achieve O(n + k) linear time.',
    classicTrap:
      'Choosing the first or last element as QuickSort pivot on already-sorted arrays, which degrades QuickSort to O(n²) time and risks recursion stack overflow—fix with randomized or median-of-three pivots.',
    linkedPatternIds: ['cyclic-sort', 'merge-intervals', 'k-way-merge'],
  },
  {
    chapter: 11,
    title: 'Searching, Boundaries & Selection',
    madeEasyDefinition:
      'Searching locates a target record or boundary position within a collection. Binary Search eliminates half the remaining search space on every comparison whenever the search predicate is monotonic.',
    adtOperations:
      'Core Operations: Exact Binary Search, Lower Bound (first index where `val >= target`), Upper Bound (first index where `val > target`), Binary Search on Answer over `[minAns, maxAns]`, and Quickselect for Kth order statistics.',
    memoryRepresentation:
      'Requires O(1) random access over a contiguous sorted array or a mathematical integer range `[low, high]` evaluated by a deterministic `isFeasible(mid)` checker.',
    corePrinciple:
      'Binary Search works on ANY monotonic boolean predicate transitioning once from `False` to `True`, not merely exact equality lookup inside sorted arrays.',
    formulaOrInvariant:
      'Lower-Bound Loop Invariant (`lo < hi`): when `predicate(mid)` is True keep `hi = mid`; when False strictly discard `lo = mid + 1`. Termination at `lo == hi` lands on the exact first True boundary.',
    complexityBreakdown:
      'Binary Search runs in O(log n) time and O(1) space; Quickselect finds the Kth smallest element in O(n) expected time; Boyer-Moore Majority Vote runs in O(n) time and O(1) space.',
    classicTrap:
      'Writing `while (lo <= hi)` together with `hi = mid` causes an infinite loop when `lo == hi`, and computing `(lo + hi) / 2` in Java or C++ overflows 32-bit integers—always write `lo + (hi - lo) / 2`.',
    linkedPatternIds: ['modified-binary-search', 'two-pointers'],
  },
  {
    chapter: 14,
    title: 'Hashing, Collision Resolution & Load Factor',
    madeEasyDefinition:
      'Hashing maps arbitrary keys (strings, integers, tuples) through a deterministic Hash Function into fixed array bucket indices to deliver O(1) average lookup, insertion, and deletion.',
    adtOperations:
      'Main ADT Operations: Put(key, value), Get(key), Delete(key), ContainsKey(key), and Resize/Rehash when Load Factor crosses the threshold.',
    memoryRepresentation:
      'Backed by a bucket array resolving collisions either via Separate Chaining (linked list or balanced tree per bucket) or Open Addressing (Linear Probing, Quadratic Probing, or Double Hashing inside the same array).',
    corePrinciple:
      'Keeping the Load Factor `α = n / m` at or below 0.75 via geometric table doubling prevents long collision chains and preserves O(1) expected performance.',
    formulaOrInvariant:
      'Hash Contract Law: if two objects satisfy `a.equals(b)`, they MUST return the identical `hashCode()`. Violating this contract breaks HashMap lookups silently.',
    complexityBreakdown:
      'Expected O(1) lookup, insert, and delete; O(n) worst-case under hash collisions (Java 8+ converts bucket chains of length 8 or more into Red-Black Trees for O(log n) worst-case lookup).',
    classicTrap:
      'Mutating a key object\'s fields after inserting it into a HashMap changes its hashCode and makes the stored entry unreachable forever—always use immutable keys.',
    linkedPatternIds: ['sliding-window', 'top-k-elements', 'depth-first-search'],
  },
  {
    chapter: 15,
    title: 'String Algorithms (KMP, Rabin-Karp & Tries)',
    madeEasyDefinition:
      'String Algorithms search, index, and transform character sequences efficiently without repeating work on already-matched prefixes, using prefix tables (KMP), rolling hashes (Rabin-Karp), or prefix trees (Tries).',
    adtOperations:
      'Core Operations: PatternMatch(text, pattern), BuildLPS(pattern) for KMP, RollingHashUpdate() for Rabin-Karp, and Trie Insert(word), Search(word), and StartsWith(prefix).',
    memoryRepresentation:
      'Strings are stored as contiguous character or UTF-8 byte arrays (immutable in Java/Python). A Trie allocates tree nodes holding a 26-slot array or hash map of child character links plus an `isEndOfWord` flag.',
    corePrinciple:
      'Precomputing pattern self-overlap (KMP LPS array) or hashing fixed windows (Rabin-Karp) eliminates the O(n · m) backtracking penalty of naive substring matching.',
    formulaOrInvariant:
      'KMP Zero-Backtrack Invariant: on a mismatch at pattern index `j`, fall back to `j = lps[j - 1]` while the text pointer `i` never moves backward.',
    complexityBreakdown:
      'KMP guarantees O(n + m) time and O(m) space; Rabin-Karp averages O(n + m); Trie Insert, Search, and Prefix queries run in O(L) time where L is word length.',
    classicTrap:
      'Accepting a Rabin-Karp hash match without verifying character-by-character equality causes false-positive matches whenever two distinct substrings share the same modulo hash.',
    linkedPatternIds: ['sliding-window', 'longest-common-substring'],
  },
  {
    chapter: 17,
    title: 'Greedy Algorithms & Exchange Proofs',
    madeEasyDefinition:
      'A Greedy Algorithm constructs a global solution piece by piece by always picking the locally best-looking choice at the current step and never reversing that decision later.',
    adtOperations:
      'Standard Greedy Workflow: 1) Sort inputs by the proven greedy key (earliest finish time, highest value-to-weight ratio, or smallest frequency), 2) Maintain active feasibility with a pointer or Min-Heap, and 3) Accumulate optimal picks.',
    memoryRepresentation:
      'Typically operates directly on a sorted array or binary Min-Heap in O(1) to O(n) auxiliary memory—far lighter than multi-dimensional DP tables.',
    corePrinciple:
      'A greedy rule is valid ONLY when backed by an Exchange Argument proving that swapping any optimal solution\'s choice for the greedy choice never makes the answer worse.',
    formulaOrInvariant:
      'Activity Selection Law: sorting intervals strictly by EARLIEST FINISH time leaves the maximum remaining timeline for future activities.',
    complexityBreakdown:
      'Sorting-based greedy solutions run in O(n log n) time and O(1) to O(n) space; Huffman Coding and Meeting Rooms II run in O(n log n) using a Min-Heap.',
    classicTrap:
      'Applying greedy coin selection to arbitrary coin denominations—for coins `[1, 3, 4]` targeting amount 6, greedy picks `4 + 1 + 1` (3 coins) instead of the true optimum `3 + 3` (2 coins), proving DP is required.',
    linkedPatternIds: ['merge-intervals'],
  },
  {
    chapter: 19,
    title: 'Dynamic Programming (Overlapping Subproblems & Optimal Substructure)',
    madeEasyDefinition:
      'Dynamic Programming solves complex optimization and counting problems by breaking them into overlapping subproblems, solving each unique subproblem exactly once, and storing its result to avoid exponential recomputation.',
    adtOperations:
      'Two Equivalent Paradigms: Top-Down Memoization (recursion + cache map solving only reachable states) and Bottom-Up Tabulation (iterative DP table filled in topological dependency order with space compression).',
    memoryRepresentation:
      'Stored in a 1D or 2D state table (`dp[i]` or `dp[i][w]`). Whenever row `i` reads only row `i - 1`, rolling two rows or iterating backwards collapses O(n · W) RAM down to O(W).',
    corePrinciple:
      'Define a minimal sufficient state (SRTBOT: State, Recurrence, Base Case, Order, Answer, Time) that captures all past decisions needed to compute future transitions cleanly.',
    formulaOrInvariant:
      'Knapsack Loop Direction Law: 0/1 Knapsack iterates capacity BACKWARD (`W` down to `wt`) so each item is used at most once; Unbounded Knapsack iterates FORWARD (`wt` up to `W`) to permit unlimited reuse.',
    complexityBreakdown:
      '1D House Robber and Fibonacci take O(n) time and O(1) space; 0/1 Knapsack takes O(n · W) time and O(W) space; LCS and Palindromic Subsequence take O(m · n) time.',
    classicTrap:
      'Compressing a 2D DP table into a 1D array without checking whether transitions read `dp[i-1][j-1]` (diagonal) causes earlier iterations to overwrite values still needed later in the same row.',
    linkedPatternIds: ['fibonacci-numbers', 'knapsack-01', 'palindromic-subsequence', 'longest-common-substring'],
  },
  {
    chapter: 20,
    title: 'Complexity Classes (P, NP, NP-Complete & Reductions)',
    madeEasyDefinition:
      'Complexity Theory groups decision problems by solvability: Class P contains problems solvable in polynomial time, Class NP contains problems whose candidate answers are verifiable in polynomial time, and NP-Complete problems are the hardest problems in NP.',
    adtOperations:
      'Practical Interview Triage: Identify classic NP-Complete signatures (Subset Sum, 0/1 Knapsack, Partition Equal Subset, Traveling Salesperson, Graph Coloring) immediately from the prompt and constraints.',
    memoryRepresentation:
      'Small NP-Complete inputs (`n <= 20`) are represented using integer Bitmasks (`dp[mask]`) storing visited subsets in `2^n` table slots.',
    corePrinciple:
      'Recognizing an NP-Complete reduction saves you from wasting time hunting for an impossible O(n log n) greedy formula and points directly to Pseudo-Polynomial DP, Bitmask DP, or pruned Backtracking.',
    formulaOrInvariant:
      'Constraint Signal Rule: whenever `n <= 20` on a subset, partition, or Hamiltonian path problem, an `O(2^n)` or `O(n² · 2^n)` solution is the intended optimal algorithm.',
    complexityBreakdown:
      '0/1 Knapsack runs in O(n · W) pseudo-polynomial time because `W` is exponential in its binary bit-length `log₂ W`; Bitmask TSP runs in O(n² · 2^n) time and O(n · 2^n) space.',
    classicTrap:
      'Spending 20 interview minutes searching for a polynomial greedy shortcut on an NP-Complete partition problem even though the constraint `n <= 20` explicitly announces backtracking or bitmask DP.',
    linkedPatternIds: ['subsets-backtracking', 'knapsack-01'],
  },
  {
    chapter: 21,
    title: 'Bit Manipulation & Binary Tricks',
    madeEasyDefinition:
      'Bit Manipulation operates directly on the binary `0` and `1` bits of integers using CPU-native bitwise operators (`&`, `|`, `^`, `~`, `<<`, `>>`) for constant-space arithmetic, parity cancellation, and compact subset masks.',
    adtOperations:
      'Six Essential Bit Operations: Get bit `(x >> k) & 1`, Set bit `x | (1 << k)`, Clear bit `x & ~(1 << k)`, Toggle bit `x ^ (1 << k)`, Clear lowest set bit `x & (x - 1)`, and Isolate lowest set bit `x & -x`.',
    memoryRepresentation:
      'Signed integers use Two\'s Complement binary encoding where `-x = ~x + 1`, allowing a single 32-bit integer to represent a boolean set of up to 32 elements in just 4 bytes of RAM.',
    corePrinciple:
      'Exploit XOR self-cancellation (`x ^ x = 0`) and single-cycle bitmasks to replace O(n) hash sets with O(1) memory whenever keys are bounded integers or paired duplicates.',
    formulaOrInvariant:
      'Three Core Identities: `x ^ x = 0` (cancels pairs), `x & (x - 1)` (clears rightmost 1-bit and tests Power of 2 when result is 0 for `x > 0`), and `x & -x` (isolates rightmost 1-bit).',
    complexityBreakdown:
      'Single Number I and III run in O(n) time and O(1) space; Brian Kernighan set-bit counting runs in O(number of set bits) <= 32 iterations.',
    classicTrap:
      'Forgetting operator precedence: in Java, JavaScript, C++, and Python, `==` and `!=` bind tighter than `&`, so always wrap bit checks in parentheses as `(x & mask) != 0`.',
    linkedPatternIds: ['bitwise-xor'],
  },
];

/**
 * Generates clean, syntax-aware line-by-line explanations for any raw code snippet
 * (used to upgrade all 16 Tricky Pattern Templates, CurriculumWorkbench Brute/Optimal solutions,
 * and CompleteDsaCourse code examples into interactive line-by-line learning labs).
 */
export function annotateCodeLineByLine(
  rawCode: string,
  language: 'python' | 'typescript' | 'javascript' | 'java',
  contextHint?: string
): AnnotatedCodeLine[] {
  const normalized = rawCode.replace(/\\n/g, '\n');
  const rawLines = normalized.split('\n');

  return rawLines.map((line, index) => {
    const trimmed = line.trim();
    const inlineCommentMatch =
      language === 'python' ? line.match(/#\s*(.+)$/) : line.match(/\/\/\s*(.+)$/);
    const inlineNote = inlineCommentMatch ? inlineCommentMatch[1].trim() : '';

    if (!trimmed) {
      return {
        lineNo: index + 1,
        code: line,
        role: 'setup',
        whatItDoes: 'Visual spacing separating logical phases of the algorithm.',
        whyItExists: 'Improves readability by grouping initialization, loop invariants, and return blocks.',
        complexityImpact: 'No runtime cost',
      };
    }

    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      return {
        lineNo: index + 1,
        code: line,
        role: 'invariant',
        whatItDoes: inlineNote || trimmed.replace(/^(\/\/|#)\s*/, ''),
        whyItExists: 'Documents the invariant or phase boundary explicitly for interview clarity.',
        complexityImpact: 'Zero runtime cost (comment)',
      };
    }

    if (trimmed === '}' || trimmed === '};' || trimmed === '},') {
      return {
        lineNo: index + 1,
        code: line,
        role: 'invariant',
        whatItDoes: 'Closes the preceding lexical scope or loop block.',
        whyItExists: 'Marks where the block invariant finishes and control returns to the enclosing scope.',
        complexityImpact: 'No extra cost',
      };
    }

    if (
      /^(export\s+)?(function|class|def|public|private|static|record)\b/.test(trimmed) ||
      /^\w+\s*\([^)]*\)\s*(:\s*[\w<>\[\]| ]+)?\s*\{$/.test(trimmed)
    ) {
      return {
        lineNo: index + 1,
        code: line,
        role: 'setup',
        whatItDoes:
          inlineNote ||
          `Declares the ${contextHint ? `${contextHint} ` : ''}signature and input/output contract.`,
        whyItExists:
          'Establishes exact parameter types and boundaries before allocating state or entering loops.',
        complexityImpact: 'O(1) call frame setup',
      };
    }

    if (/^return\b/.test(trimmed)) {
      return {
        lineNo: index + 1,
        code: line,
        role: 'return',
        whatItDoes: inlineNote || `Returns the computed result: ${trimmed.replace(/^return\s*/, '').replace(/;$/, '')}.`,
        whyItExists:
          'Satisfies the function postcondition once the loop invariant or base case proves the final value.',
        complexityImpact: 'O(1) return',
      };
    }

    if (/^(while|for)\b/.test(trimmed)) {
      const isWhile = trimmed.startsWith('while');
      return {
        lineNo: index + 1,
        code: line,
        role: 'invariant',
        whatItDoes:
          inlineNote ||
          (isWhile
            ? `Repeats while condition holds: ${trimmed.replace(/^while\s*/, '').replace(/[:{]\s*$/, '')}.`
            : `Iterates systematically over: ${trimmed.replace(/^for\s*/, '').replace(/[:{]\s*$/, '')}.`),
        whyItExists:
          'Drives forward progress toward termination while preserving the core algorithm invariant each step.',
        complexityImpact: isWhile
          ? 'Verify strict pointer/bound progress per step to guarantee termination'
          : 'Contributes multiplicative factor to loop time complexity',
      };
    }

    if (/^(if|elif|else if)\b/.test(trimmed)) {
      const isGuard =
        /null|None|undefined|length\s*===?\s*0|isEmpty|continue|break|return|<=?\s*0|>=?\s*n/.test(
          trimmed
        );
      return {
        lineNo: index + 1,
        code: line,
        role: isGuard ? 'guard' : 'branch',
        whatItDoes:
          inlineNote ||
          `${isGuard ? 'Guards boundary/termination condition' : 'Evaluates decision branch'}: ${trimmed.replace(/^(if|elif|else if)\s*/, '').replace(/[:{]\s*$/, '')}.`,
        whyItExists: isGuard
          ? 'Prevents out-of-bounds access, null dereference, or invalid state transitions.'
          : 'Routes execution down the exact branch required to preserve correctness.',
        complexityImpact: 'O(1) conditional check',
      };
    }

    if (/^else\b/.test(trimmed)) {
      return {
        lineNo: index + 1,
        code: line,
        role: 'branch',
        whatItDoes: inlineNote || 'Handles the complementary case when the preceding condition is false.',
        whyItExists: 'Guarantees mutually exclusive, exhaustive handling of all states.',
        complexityImpact: 'O(1) branch',
      };
    }

    if (/(heappush|heappop|offer|poll|push|pop|shift|append|add|remove|set|put|merge|swap)/.test(trimmed)) {
      const isHeap = /(heappush|heappop|heap|pq|PriorityQueue|offer|poll)/.test(trimmed);
      return {
        lineNo: index + 1,
        code: line,
        role: 'mutation',
        whatItDoes: inlineNote || `Updates data structure state: ${trimmed.replace(/;$/, '')}.`,
        whyItExists:
          'Maintains the live frontier, frequency table, or path state needed by upcoming iterations.',
        complexityImpact: isHeap ? 'O(log k) / O(log n) heap sift' : 'O(1) amortized state update',
      };
    }

    if (/(new\s+(Map|Set|HashMap|HashSet|ArrayDeque|PriorityQueue|ArrayList|Int32Array|Array)|defaultdict|deque|\[\]|\{\})/.test(trimmed)) {
      return {
        lineNo: index + 1,
        code: line,
        role: 'setup',
        whatItDoes: inlineNote || `Allocates auxiliary structure: ${trimmed.replace(/;$/, '')}.`,
        whyItExists:
          'Trades bounded auxiliary memory for faster lookup, ordering, or traversal.',
        complexityImpact: 'Contributes to auxiliary space complexity',
      };
    }

    return {
      lineNo: index + 1,
      code: line,
      role: 'mutation',
      whatItDoes: inlineNote || `Updates local working state: ${trimmed.replace(/;$/, '')}.`,
      whyItExists: 'Computes intermediate values or advances indices/accumulators for the next step.',
      complexityImpact: 'O(1) local operation',
    };
  });
}
