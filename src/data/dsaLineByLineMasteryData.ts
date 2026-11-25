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
    corePrinciple:
      'Compare algorithms by growth rate as n -> ∞ using Big-O (upper), Big-Ω (lower), and Big-Θ (tight) bounds rather than hardware wall-clock time.',
    formulaOrInvariant:
      'Divide & Conquer Master Theorem: T(n) = a·T(n/b) + Θ(n^d · log^k n). Compare log_b(a) vs d: Case 1 (<) => Θ(n^d), Case 2 (=) => Θ(n^d · log^(k+1) n), Case 3 (>) => Θ(n^(log_b a)).',
    complexityBreakdown:
      'Binary search (a=1,b=2,d=0) => Θ(log n); Merge sort (a=2,b=2,d=1) => Θ(n log n); Binary tree scan (a=2,b=2,d=0) => Θ(n).',
    classicTrap:
      'Confusing nested loops with automatic O(n²): sliding windows and monotonic stacks run inner while-loops whose total pops across the whole run are bounded by n -> O(n) amortized.',
    linkedPatternIds: ['sliding-window', 'modified-binary-search'],
  },
  {
    chapter: 2,
    title: 'Recursion & Backtracking',
    corePrinciple:
      'Every recursive algorithm requires a base case, strict progress toward the base case, and an explicit undo step when sharing mutable state across branches.',
    formulaOrInvariant:
      'Choose -> Explore -> Unchoose invariant: after returning from a recursive call, mutable state equals its exact pre-call snapshot.',
    complexityBreakdown:
      'Subsets: O(n · 2^n) time, O(n) stack; Permutations: O(n · n!) time, O(n) stack; N-Queens: O(n!) upper bound with column/diagonal bitmask pruning.',
    classicTrap:
      'Pushing a reference to the mutable `path` list instead of a copy (`path.copy()` / `[...path]`) causes all saved answers to become empty at the end.',
    linkedPatternIds: ['subsets-backtracking'],
  },
  {
    chapter: 3,
    title: 'Linked Lists (Singly, Doubly, Circular, XOR & Floyd Proof)',
    corePrinciple:
      'Nodes trade O(1) random array indexing for O(1) pointer rewiring once a predecessor reference is known; dummy sentinels eliminate head edge cases.',
    formulaOrInvariant:
      'Floyd Cycle Entry: 2(D + K) = D + K + m·C => D = m·C - K. Stepping one pointer from head and one from the meeting point at speed 1 collides at the exact entry.',
    complexityBreakdown:
      'Traversal/search O(n); Insert/delete at known node O(1); Iterative reversal & cycle entry O(n) time, O(1) space.',
    classicTrap:
      'Overwriting `curr.next = prev` before saving `nxt = curr.next`, or comparing `slow.val == fast.val` instead of object reference identity.',
    linkedPatternIds: ['fast-slow-pointers', 'in-place-linked-list-reversal'],
  },
  {
    chapter: 4,
    title: 'Stacks & Monotonic Stack',
    corePrinciple:
      'LIFO order resolves nested structures (brackets, call frames, expression parsing) and maintains monotonic sequences to answer Next Greater / Histogram Span queries in one linear pass.',
    formulaOrInvariant:
      'Each element is pushed onto the monotonic stack once and popped at most once; the element that triggers a pop is the exact nearest boundary.',
    complexityBreakdown:
      'Push/pop/peek O(1); Next Greater Element / Largest Rectangle in Histogram O(n) time, O(n) space.',
    classicTrap:
      'Storing raw values instead of indices on a monotonic stack makes it impossible to compute spans or rectangle widths `(right - left - 1)`.',
    linkedPatternIds: ['depth-first-search'],
  },
  {
    chapter: 5,
    title: 'Queues, Circular Buffers & Monotonic Deques',
    corePrinciple:
      'FIFO order preserves arrival sequence for level-by-level BFS frontiers; double-ended monotonic queues track sliding-window maxima in O(1) amortized time.',
    formulaOrInvariant:
      'Monotonic Deque: evict expired indices at front (`dq[0] <= i - k`), evict dominated smaller values at back (`nums[dq[-1]] <= nums[i]`) -> front is always current window max.',
    complexityBreakdown:
      'Circular array queue ops O(1); Two-stack queue amortized O(1); Sliding Window Max O(n) time, O(k) space.',
    classicTrap:
      'Using `list.pop(0)` in Python or `Array.shift()` in JS inside BFS degrades linear O(n) traversals to O(n²).',
    linkedPatternIds: ['breadth-first-search', 'sliding-window'],
  },
  {
    chapter: 6,
    title: 'Binary Trees, BSTs & Self-Balancing AVL Trees',
    corePrinciple:
      'Decompose tree tasks into top-down state propagation (path sums, global BST bounds) vs bottom-up subtree aggregation (height, diameter, LCA).',
    formulaOrInvariant:
      'Global BST Invariant: every key in left subtree < node.val < every key in right subtree — validate with inherited `(low, high)` range, not local parent checks.',
    complexityBreakdown:
      'Traversals O(n) time, O(h) stack; Balanced BST / AVL search/insert/delete O(log n) via LL/RR/LR/RL rotations; skewed BST degrades to O(n).',
    classicTrap:
      'Validating a BST by checking only `node.left.val < node.val < node.right.val` misses deep subtree violations against higher ancestors.',
    linkedPatternIds: ['breadth-first-search', 'depth-first-search'],
  },
  {
    chapter: 7,
    title: 'Priority Queues & Binary Heaps',
    corePrinciple:
      'A complete binary tree packed densely in an array exposes the global min/max in O(1) and updates in O(log n) via percolate-up and percolate-down.',
    formulaOrInvariant:
      '0-based array indices: `left = 2i + 1`, `right = 2i + 2`, `parent = floor((i - 1) / 2)`. Bottom-up `buildHeap` sums `Σ (n / 2^(h+1)) · h = O(n)`.',
    complexityBreakdown:
      'BuildHeap O(n); Insert/Extract O(log n); Top K O(n log k); K-Way Merge O(N log k); Streaming Median O(log n) add / O(1) query.',
    classicTrap:
      'Using a Max-Heap of size N instead of a Min-Heap of size K for Top-K Largest wastes O(N) memory and O(N log N) time.',
    linkedPatternIds: ['two-heaps', 'top-k-elements', 'k-way-merge'],
  },
  {
    chapter: 8,
    title: 'Disjoint Sets (Union-Find ADT)',
    corePrinciple:
      'Track dynamic undirected connectivity and Kruskal MST cycle detection by merging representative roots with Union-by-Rank and Path Compression.',
    formulaOrInvariant:
      'Path compression flattens visited nodes straight to root; Union-by-Rank keeps tree height <= log₂ n, reducing amortized op cost to inverse Ackermann O(α(n)) <= 4.',
    complexityBreakdown:
      'MakeSet O(n); Find & Union O(α(n)) amortized ≈ O(1).',
    classicTrap:
      'Checking `parent[a] == parent[b]` instead of `find(a) == find(b)` misses uncompressed paths and returns false negatives.',
    linkedPatternIds: ['islands-matrix-traversal', 'depth-first-search'],
  },
  {
    chapter: 9,
    title: 'Graph Algorithms (BFS, DFS, Topo Sort, Shortest Paths & MST)',
    corePrinciple:
      'Select graph traversal strictly from edge properties: BFS for unweighted hops, Kahn/DFS for DAG ordering, Dijkstra for non-negative weights, Bellman-Ford for negative edges.',
    formulaOrInvariant:
      'Dijkstra Greedy Cut Invariant: when popping the minimum tentative distance vertex `u` from the min-heap with all weights >= 0, no future path can shorten `dist[u]`.',
    complexityBreakdown:
      'BFS/DFS/Kahn O(V + E); Dijkstra with binary heap O((V + E) log V); Bellman-Ford O(V · E); Kruskal O(E log E).',
    classicTrap:
      'Running Dijkstra on negative edge weights, or forgetting to skip stale heap entries (`if d > dist[u]: continue`).',
    linkedPatternIds: ['islands-matrix-traversal', 'breadth-first-search', 'depth-first-search', 'topological-sort'],
  },
  {
    chapter: 10,
    title: 'Sorting Algorithms, Stability & Lower Bounds',
    corePrinciple:
      'Comparison sorts cannot beat Ω(n log n) because a decision tree must distinguish n! permutations (`log₂(n!) = Θ(n log n)`). Non-comparison sorts (Counting, Radix, Cyclic) beat it by exploiting key structure.',
    formulaOrInvariant:
      'Stability guarantees equal keys preserve input order (Merge Sort, Insertion Sort, Timsort are stable; HeapSort & standard QuickSort are unstable).',
    complexityBreakdown:
      'Merge/Timsort O(n log n) worst; QuickSort O(n log n) expected / O(n²) adversarial pivot; Cyclic/Counting/Radix O(n + k).',
    classicTrap:
      'Picking first/last element as QuickSort pivot on already-sorted input degrades QuickSort to O(n²) time and O(n) stack overflow.',
    linkedPatternIds: ['cyclic-sort', 'merge-intervals', 'k-way-merge'],
  },
  {
    chapter: 11,
    title: 'Searching, Boundaries & Selection',
    corePrinciple:
      'Binary search applies to ANY monotonic predicate `False...False -> True...True`, not merely exact lookup in sorted arrays.',
    formulaOrInvariant:
      'Lower bound invariant (`lo < hi`): when `predicate(mid)` is true, keep `hi = mid`; when false, strictly discard `lo = mid + 1`. Terminates at exact transition `lo == hi`.',
    complexityBreakdown:
      'Binary search O(log n); Quickselect O(n) average; Boyer-Moore majority vote O(n) time, O(1) space.',
    classicTrap:
      'Mixing `lo <= hi` with `hi = mid` infinite-loops; computing `(lo + hi) / 2` in Java/C++ overflows 32-bit int when `lo + hi > 2^31 - 1`.',
    linkedPatternIds: ['modified-binary-search', 'two-pointers'],
  },
  {
    chapter: 14,
    title: 'Hashing, Collision Resolution & Load Factor',
    corePrinciple:
      'Map arbitrary keys to array buckets in O(1) expected time via hash functions, managing collisions through Separate Chaining or Open Addressing (Linear/Quadratic Probing, Double Hashing).',
    formulaOrInvariant:
      'Load factor `α = n / m`: keeping `α <= 0.75` via geometric rehashing preserves O(1) expected lookup, insert, and delete.',
    complexityBreakdown:
      'Average O(1) lookup/insert/delete; worst-case O(n) under adversarial hash collisions (Java 8+ converts long chains >= 8 into Red-Black trees for O(log n) worst case).',
    classicTrap:
      'Mutating a key object after inserting it into a HashMap changes its hashCode and permanently strands the entry.',
    linkedPatternIds: ['sliding-window', 'top-k-elements', 'depth-first-search'],
  },
  {
    chapter: 15,
    title: 'String Algorithms (KMP, Rabin-Karp & Tries)',
    corePrinciple:
      'Eliminate O(n · m) naive pattern backtracking by precomputing longest proper prefix-suffix (KMP LPS array), rolling polynomial hashes (Rabin-Karp), or prefix trees (Tries).',
    formulaOrInvariant:
      'KMP Invariant: on mismatch at pattern index `j`, jump to `j = lps[j - 1]` — never moving the text pointer `i` backward.',
    complexityBreakdown:
      'KMP O(n + m) deterministic; Rabin-Karp O(n + m) expected; Trie insert/search/startsWith O(L) per word length L.',
    classicTrap:
      'Trusting a Rabin-Karp hash match without verifying character-by-character equality causes false positives from hash collisions.',
    linkedPatternIds: ['sliding-window', 'longest-common-substring'],
  },
  {
    chapter: 17,
    title: 'Greedy Algorithms & Exchange Proofs',
    corePrinciple:
      'A greedy choice is ONLY valid when backed by an Exchange Argument or Stays-Ahead proof showing an optimal solution exists containing the local choice.',
    formulaOrInvariant:
      'Interval Scheduling: sorting by EARLIEST FINISH time leaves maximum remaining timeline; sorting by earliest start or shortest duration has trivial counterexamples.',
    complexityBreakdown:
      'Usually O(n log n) sorting + O(n) linear scan (or O(n log n) with min-heap for Huffman Coding / Meeting Rooms).',
    classicTrap:
      'Applying greedy to canonical-looking coin change fails on non-canonical coins (e.g., `[1, 3, 4]` for amount 6: greedy picks `4+1+1 = 3` coins vs optimal `3+3 = 2`).',
    linkedPatternIds: ['merge-intervals'],
  },
  {
    chapter: 19,
    title: 'Dynamic Programming (Overlapping Subproblems & Optimal Substructure)',
    corePrinciple:
      'Define a minimal sufficient state (SRTBOT: State, Recurrence, Base Case, Order, Answer, Time) that summarizes all history required for future decisions, then evaluate in topological order.',
    formulaOrInvariant:
      'Loop Direction Law: 0/1 Knapsack iterates capacity BACKWARD (`W..wt`) to forbid reuse; Unbounded Knapsack iterates FORWARD (`wt..W`) to allow reuse.',
    complexityBreakdown:
      '1D Fibonacci/Robber O(n) time O(1) space; 0/1 Knapsack O(n·W) pseudo-polynomial O(W) space; LPS & LCS O(n²) / O(m·n).',
    classicTrap:
      'Compressing a 2D DP table into 1D before checking which neighboring cells (`left`, `up`, `diag`) are read causes silent overwriting bugs.',
    linkedPatternIds: ['fibonacci-numbers', 'knapsack-01', 'palindromic-subsequence', 'longest-common-substring'],
  },
  {
    chapter: 20,
    title: 'Complexity Classes (P, NP, NP-Complete & Reductions)',
    corePrinciple:
      'P problems are solvable in polynomial time; NP problems are VERIFIABLE in polynomial time. Recognizing NP-Complete reductions (Subset Sum, 0/1 Knapsack, TSP, Clique) tells you immediately to look for pseudo-polynomial DP, bitmask DP (`n <= 20`), or backtracking with pruning.',
    formulaOrInvariant:
      'If `n <= 20` and the problem reduces to Subset Sum / Hamiltonian Path / Partition, an exponential `O(2^n)` or `O(n² · 2^n)` state space is EXPECTED, not a mistake.',
    complexityBreakdown:
      '0/1 Knapsack O(n·W) is pseudo-polynomial because `W` is exponential in its bit-length `log₂ W`.',
    classicTrap:
      'Wasting 20 interview minutes searching for a polynomial O(n log n) greedy algorithm on an NP-Complete subset/partition problem when `n <= 20` explicitly signals backtracking or bitmask DP.',
    linkedPatternIds: ['subsets-backtracking', 'knapsack-01'],
  },
  {
    chapter: 21,
    title: 'Bit Manipulation & Binary Tricks',
    corePrinciple:
      'Exploit hardware bit-level parallelism and two’s complement identities for O(1)-space state masks, parity cancellation, and subset iteration.',
    formulaOrInvariant:
      '`x ^ x = 0` (cancel pairs) · `x & (x - 1)` (clear lowest set bit / power-of-two test) · `x & -x` (isolate lowest set bit).',
    complexityBreakdown:
      'Single Number I/III O(n) time, O(1) space; Brian Kernighan popcount O(set bits) <= O(32).',
    classicTrap:
      'Forgetting operator precedence: in Java/JS/C++/Python, `==` binds tighter than `&`, so ALWAYS parenthesize `(x & mask) != 0`!',
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
