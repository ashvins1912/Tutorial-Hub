# Complete DSA Mastery Curriculum

This curriculum expands PatternForge into a beginner-to-advanced problem-solving academy. It is deliberately organized around concepts, invariants, reusable patterns, and transfer—not memorizing solutions.

## The learning contract: every topic follows the same loop

1. **Why it exists** — the real-world / computational problem the technique solves.
2. **Prerequisites** — the ideas and data structures already needed.
3. **Mental model** — a plain-language explanation and a small analogy.
4. **Visual model** — state changes, pointers, recursion tree, graph, or DP table.
5. **Operations and invariants** — what must always remain true and why.
6. **Naive solution first** — derive it without tricks; identify repeated work.
7. **Optimization** — discover what information can be reused, ordered, or discarded.
8. **Correctness proof** — explain why no valid answer is missed and no invalid answer is accepted.
9. **Complexity** — count work and memory, including amortized and recursion costs.
10. **Implementation** — language-neutral pseudocode, then Java, JavaScript/TypeScript, and Python.
11. **Pitfalls** — edge cases, off-by-one errors, overflow, mutation, and invalid assumptions.
12. **Practice ladder** — recognition drills, guided exercises, independent problems, and mixed variations.
13. **Transfer test** — a new constraint or unfamiliar statement to test whether the idea truly transferred.
14. **Recall** — immediate retrieval, then review after 1, 3, 7, 14, and 30 days.

A learner marks a topic mastered only after explaining the idea unaided, implementing it, passing edge cases, stating complexity, and solving a changed variation without seeing the solution.

## Stage 0 — Problem-solving foundations

- How to read constraints and translate words into input/output contracts
- Mathematical foundations: powers, logarithms, modulo, divisibility, GCD/LCM, primes, combinatorics, bit representation
- Complexity analysis: O(1), O(log N), O(N), O(N log N), O(N²), exponential; worst/average/amortized
- Recursion, call stack, induction, loop invariants, proof by contradiction
- Input modelling, edge cases, test design, debugging, overflow and integer limits
- Choosing data structures from required operations

## Stage 1 — Core programming and linear data structures

- Arrays and dynamic arrays: indexing, traversal, insertion/deletion, in-place operations
- Strings: immutability, character counts, Unicode awareness, parsing
- Hash tables: hashing, collisions, load factor, maps, sets, frequency maps
- Linked lists: singly/doubly/circular, pointer rewiring, sentinel nodes
- Stacks, queues, deque, monotonic stack and monotonic queue
- Sorting: comparison sorts, stability, counting/radix/bucket sort, custom comparators
- Binary search: exact search, lower/upper bound, first/last occurrence, rotated arrays, answer-space search
- Two pointers: inward, same-direction, fast/slow, partitioning
- Sliding windows: fixed, variable, frequency window, at-most/exactly K
- Prefix/suffix sums, difference arrays, 2D prefix sums
- Intervals: merge, insert, sweep lines, meeting rooms

## Stage 2 — Searching, ordering, and common patterns

- Divide and conquer and recurrence relations
- Quickselect and top-K selection
- K-way merge and external/stream-style processing
- Coordinate compression
- Inversion counting and merge-sort applications
- Binary search on monotonic predicates and feasibility proofs
- Greedy choice, exchange arguments, interval scheduling
- Counting/frequency patterns and prefix-XOR
- Cyclic sort and index placement
- Matrix traversal, spiral traversal, transpose, rotate, search
- Bit manipulation: masks, shifts, XOR tricks, subsets, popcount, bit DP

## Stage 3 — Trees and hierarchical structures

- Tree terminology, representation, recursion and iterative traversal
- Preorder, inorder, postorder, level order, zigzag, boundary and vertical traversal
- Binary search tree: search, insert, delete, validation, predecessor/successor
- Tree height, diameter, balanced trees, path sums, maximum path
- Lowest common ancestor and ancestor queries
- Build tree from traversal orders
- Serialize/deserialize trees
- Heaps and priority queues; binary heap operations and heapify
- Tries: prefix search, wildcard search, word dictionary, bitwise trie
- Balanced search trees conceptually: AVL, Red-Black, B-tree
- Fenwick tree and segment tree foundations

## Stage 4 — Graphs

- Graph modelling: directed/undirected, weighted/unweighted, cyclic/DAG, dense/sparse
- Adjacency list/matrix/edge list; grid graphs
- BFS, DFS, iterative traversal, connected components
- Cycle detection in directed and undirected graphs
- Bipartite checking and coloring
- Topological sorting: Kahn and DFS; dependency scheduling
- Shortest paths: BFS, 0-1 BFS, Dijkstra, Bellman-Ford, Floyd-Warshall
- Minimum spanning trees: Kruskal and Prim
- Disjoint Set Union: path compression, union by rank/size
- Bridges, articulation points, Tarjan SCC, Kosaraju SCC
- Multi-source BFS, state-space BFS, bidirectional BFS
- Euler paths/circuits, Hamiltonian search, low-link concepts
- DAG dynamic programming and shortest/longest paths in DAGs
- Network flow foundations: residual graphs, augmenting paths, max-flow/min-cut

## Stage 5 — Recursion, backtracking, and search

- Recursion tree, base case, progress measure, stack depth
- Subsets, subsequences, combinations, permutations
- Choose-explore-unchoose and state restoration
- Duplicate handling, pruning, branch and bound
- Word search, maze paths, N-Queens, Sudoku
- Meet in the middle
- Constraint propagation and search ordering
- Memoizing search states and recognizing when search becomes DP

## Stage 6 — Dynamic programming, from first principles

Use the SRTBOT method: **Subproblem, Recurrence, Topological order, Base cases, Original problem, Time**.

- Memoization vs tabulation; state design and transition proof
- 1D DP: Fibonacci, climbing stairs, house robber, min cost
- Grid/2D DP: unique paths, obstacles, minimum path
- Knapsack: 0/1, unbounded, bounded, subset sum, partition
- Coin change: minimum coins and number of combinations
- Subsequences: LIS, LCS, edit distance, longest common substring
- String DP: distinct subsequences, wildcard matching, regex matching
- Interval DP: matrix-chain multiplication, burst balloons, palindrome partitioning
- Tree DP: independent set, rerooting, subtree states
- DAG DP, bitmask DP, digit DP
- DP with state compression and rolling arrays
- DP optimization: monotone queue, divide-and-conquer optimization, convex hull trick
- Recognizing when greedy or two pointers is not valid

## Stage 7 — Advanced range queries and data structures

- Fenwick tree / Binary Indexed Tree: point update, prefix/range query
- Segment tree: build, point update, range query, iterative form
- Lazy propagation and range updates
- Merge sort tree, persistent segment tree concepts
- Sparse table and idempotent range queries
- Ordered sets/maps and order statistics
- Monotonic queue for window extrema
- Offline queries, Mo's algorithm
- Square-root decomposition
- Persistent and immutable data structure concepts
- LRU/LFU cache design and amortized analysis

## Stage 8 — Strings and advanced algorithms

- Prefix function / KMP, Z algorithm
- Rabin-Karp and rolling hash; collision considerations
- Trie variations and Aho-Corasick
- Suffix array, LCP, suffix automaton concepts
- Manacher's algorithm
- String matching and pattern search
- Palindrome, border, period, and repeated-substring problems

## Stage 9 — Mathematics, number theory, and bitwise algorithms

- Euclidean algorithm, extended GCD, modular inverse
- Fast exponentiation and modular exponentiation
- Sieve of Eratosthenes, prime factorization
- Combinations and permutations modulo a prime
- Chinese remainder theorem concepts
- Probability and expected value basics
- XOR basis and linear algebra over GF(2)
- Bitmask enumeration and subset transforms
- Game theory: Nim, Sprague-Grundy foundations

## Stage 10 — Advanced problem-solving and interview readiness

- Greedy proofs and counterexample construction
- Randomized algorithms and expected complexity
- Sweep-line geometry, orientation, segment intersection basics
- Computational geometry fundamentals
- Advanced graph algorithms and flow applications
- Algorithm selection under memory/time constraints
- API/design-style data structure questions
- Mixed-topic problems where the pattern is intentionally hidden
- Explaining trade-offs, testing, and communicating solutions under interview time limits

## Topic mastery gate

For each topic, provide these mandatory gates:

- **Explain:** teach it in plain language without reading.
- **Recognize:** identify when it applies and when it does not.
- **Derive:** start from a brute-force approach and derive the improvement.
- **Trace:** walk through a non-trivial example by hand.
- **Implement:** write a clean solution without copying.
- **Prove:** state the invariant / recurrence / greedy argument and correctness.
- **Analyse:** give time and space complexity with reasoning.
- **Stress test:** handle empty, singleton, duplicate, sorted, reverse-sorted, extreme, and adversarial inputs where relevant.
- **Transfer:** solve a new variation with changed constraints.
- **Recall:** solve again after a delay without hints.

Suggested score: 0–100, with mastery requiring at least 85 and all critical gates passed. A high quiz score alone must never unlock mastery.

## Practice design per topic

1. 3 recognition questions (choose the right data structure/pattern; explain why alternatives fail).
2. 2 trace-the-state exercises.
3. 2 implementation exercises (one guided, one blank editor).
4. 3 canonical problems (easy, medium, hard).
5. 2 counterexample / debugging exercises.
6. 2 constraint twists (larger N, streaming input, memory cap, duplicates, negative values, updates).
7. 1 mixed unseen problem.
8. Reattempt queue generated from mistakes and confidence, not only correctness.

Avoid teaching a pattern as a magic keyword. For example, sliding window requires a valid window invariant; the common positive-sum shrink rule is not generally valid with negative values. Dijkstra requires non-negative edge weights. Greedy requires a proof, not merely a plausible local choice.

## Product roadmap

### P0 — Learning quality and trust
- Show complete topic map grouped by prerequisite and level.
- Each topic gets a canonical lesson template, worked example, pseudocode, Java/JavaScript/Python examples, pitfalls, complexity, and practice ladder.
- Add an explicit "why this works" explanation and correctness proof.
- Label seeded/simulated visualizer metrics as illustrative; never imply synthetic operation counts are benchmark measurements.
- Ensure every existing topic quiz is linked to the correct topic (avoid defaulting silently to an unrelated quiz).

### P1 — Active learning
- Add a topic detail view with one step revealed at a time.
- Add hint ladder: nudge → invariant → pseudocode → partial code → full solution.
- Add trace tables and editable test cases.
- Add misconception-based feedback and counterexample generator.
- Add attempt history, confidence rating, and mistake journal.

### P2 — Mastery engine
- Persist topic checkpoints per learner.
- Use delayed retrieval (1/3/7/14/30 days), adaptive review, and mixed-topic sessions.
- Separate "seen", "practised", "passed", and "mastered" states.
- Gate topic progression by prerequisite mastery, with an override for experienced learners.
- Make progress resilient when the API/database is unavailable.

### P3 — Advanced practice
- Randomized but reproducible test cases and hidden edge cases.
- Complexity estimation drills.
- Pattern discrimination: two plausible approaches, choose and justify.
- Timed interview mode and untimed deep-learning mode.
- Topic coverage dashboard and weak-area recommendations.

## Success criteria

- No topic is marked complete merely by opening it or reading a solution.
- A learner can see prerequisites, next lesson, practice progress, and review due date.
- Every lesson distinguishes the general technique from special-case assumptions.
- All code examples compile/run against stated examples and edge cases.
- Learners can practise in Java, JavaScript/TypeScript, and Python.
- Curriculum has no hidden dead ends: every topic maps to lessons, practice, assessment, and revision.
