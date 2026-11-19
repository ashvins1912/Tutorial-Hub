import { ALGORITHMS_CATALOG } from '../data/algorithmsCatalog';

export type ScaleTier = 'huge' | 'large' | 'medium' | 'small';

export interface MatcherConstraintOverrides {
  scaleOverride?: 'auto' | ScaleTier;
  requireO1Space?: boolean;
  hasNegativeValues?: boolean;
  isOnlineDynamic?: boolean;
}

export interface DetectedConstraint {
  label: string;
  matchedText: string;
  implication: string;
  source: 'parsed' | 'override';
}

export interface ComplexityVerdict {
  tier: ScaleTier;
  scaleLabel: string;
  maxAllowedComplexity: string;
  eliminatedComplexities: string[];
  rationale: string;
  explicitTargetComplexity?: string;
}

export interface AlgorithmMatchRecommendation {
  id: string;
  name: string;
  category: string;
  timeComplexity: string;
  spaceComplexity: string;
  confidence: number; // 0-100
  matchedSignals: string[];
  whyItFits: string;
  cautionNote?: string;
  targetDestination: 'algorithms' | 'fuzzy-search';
  targetAlgoId: string;
  hasArchitectureView?:
    | 'segment-tree'
    | 'hld-tree'
    | 'minhash-lsh'
    | 'aho-corasick'
    | 'block-max-wand'
    | 'fenwick-bit';
  curriculumTopicId?: string;
}

export interface MatchAnalysisResult {
  complexityVerdict: ComplexityVerdict;
  detectedConstraints: DetectedConstraint[];
  recommendations: AlgorithmMatchRecommendation[];
  activeOverrides: {
    scaleOverride: 'auto' | ScaleTier;
    requireO1Space: boolean;
    hasNegativeValues: boolean;
    isOnlineDynamic: boolean;
  };
}

interface PatternRule {
  targetDestination: 'algorithms' | 'fuzzy-search';
  targetAlgoId: string;
  customName?: string;
  customCategory?: string;
  customTime?: string;
  customSpace?: string;
  keywords: { phrase: string; weight: number; label: string }[];
  scaleBonus?: ScaleTier[];
  o1SpaceFriendly?: boolean;
  handlesNegatives?: boolean;
  breaksOnNegatives?: string;
  onlineDynamicFriendly?: boolean;
  whyTemplate: string;
  hasArchitectureView?:
    | 'segment-tree'
    | 'hld-tree'
    | 'minhash-lsh'
    | 'aho-corasick'
    | 'block-max-wand'
    | 'fenwick-bit';
  curriculumTopicId?: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    targetDestination: 'fuzzy-search',
    targetAlgoId: 'padded-ngrams',
    customName: 'N-Gram Fuzzy Search (Padded Trigrams + Inverted Index + Pruning)',
    customCategory: 'N-Gram Fuzzy Search',
    customTime: 'O(Σ|Postings| + C log k)',
    customSpace: 'O(N · L)',
    keywords: [
      { phrase: 'typo', weight: 34, label: 'typo tolerance' },
      { phrase: 'fuzzy', weight: 34, label: 'fuzzy search' },
      { phrase: 'autocomplete', weight: 26, label: 'autocomplete' },
      { phrase: 'spelling', weight: 30, label: 'spelling errors' },
      { phrase: 'n-gram', weight: 36, label: 'n-gram' },
      { phrase: 'ngram', weight: 36, label: 'ngram' },
      { phrase: 'trigram', weight: 36, label: 'trigram' },
      { phrase: 'jaccard', weight: 30, label: 'Jaccard similarity' },
      { phrase: 'similarity', weight: 22, label: 'similarity threshold' },
      { phrase: 'missing space', weight: 26, label: 'missing spaces' },
      { phrase: 'transposition', weight: 26, label: 'transpositions' },
      { phrase: 'threshold', weight: 12, label: 'score threshold' },
    ],
    scaleBonus: ['huge', 'large'],
    whyTemplate:
      'Converts typo-tolerant substring matching into O(1) posting lookups plus Length/Count pruning instead of O(N·L·M) global edit distance.',
    hasArchitectureView: 'block-max-wand',
    curriculumTopicId: 'ngram-fuzzy-candidate-retrieval',
  },
  {
    targetDestination: 'fuzzy-search',
    targetAlgoId: 'minhash',
    customName: 'MinHash + LSH Banding (Near-Duplicate Sketching)',
    customCategory: 'N-Gram Fuzzy Search',
    customTime: 'O(N · b)',
    customSpace: 'O(N · k)',
    keywords: [
      { phrase: 'near-duplicate', weight: 38, label: 'near-duplicate detection' },
      { phrase: 'deduplicat', weight: 34, label: 'deduplication' },
      { phrase: 'plagiarism', weight: 32, label: 'plagiarism / shingling' },
      { phrase: 'jaccard', weight: 24, label: 'Jaccard estimation' },
      { phrase: 'billion', weight: 22, label: 'billion-scale corpus' },
      { phrase: 'similar documents', weight: 30, label: 'document similarity' },
      { phrase: 'shingle', weight: 28, label: 'w-shingling' },
    ],
    scaleBonus: ['huge'],
    whyTemplate:
      'Compresses massive shingle sets into fixed k-integer signatures and avoids O(N²) all-pairs checks via LSH banding.',
    hasArchitectureView: 'minhash-lsh',
    curriculumTopicId: 'confident-fuzzy-reranking',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'sliding-window',
    keywords: [
      { phrase: 'contiguous subarray', weight: 28, label: 'contiguous subarray' },
      { phrase: 'longest substring', weight: 36, label: 'longest substring' },
      { phrase: 'at most k', weight: 28, label: 'at most K constraint' },
      { phrase: 'window', weight: 26, label: 'sliding window' },
      { phrase: 'minimum window', weight: 36, label: 'minimum window' },
      { phrase: 'distinct characters', weight: 28, label: 'distinct characters' },
      { phrase: 'without repeating', weight: 34, label: 'unique characters' },
      { phrase: 'subarray', weight: 14, label: 'subarray' },
      { phrase: 'substring', weight: 18, label: 'substring' },
      { phrase: 'anagram', weight: 24, label: 'fixed-length anagram window' },
    ],
    scaleBonus: ['large', 'huge'],
    breaksOnNegatives:
      'Standard two-pointer shrink monotonicity breaks when negative numbers exist; prefer Prefix Sum + Hash Map for exact subarray sum with negatives.',
    whyTemplate:
      'Expands right and contracts left monotonically so every element enters and leaves the window once in O(N).',
    curriculumTopicId: 'sliding-window',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'prefix-sum-hash',
    keywords: [
      { phrase: 'subarray sum', weight: 36, label: 'subarray sum' },
      { phrase: 'sum equals k', weight: 34, label: 'exact sum equals K' },
      { phrase: 'equals k', weight: 26, label: 'exact target K' },
      { phrase: 'negative', weight: 22, label: 'negative values' },
      { phrase: 'range sum', weight: 24, label: 'static range sum' },
      { phrase: 'prefix', weight: 18, label: 'prefix accumulation' },
      { phrase: 'divisible by k', weight: 30, label: 'prefix modulo k' },
      { phrase: 'two sum', weight: 28, label: 'complement hash lookup' },
      { phrase: 'contiguous array', weight: 24, label: 'balanced prefix count' },
    ],
    scaleBonus: ['large', 'huge'],
    handlesNegatives: true,
    whyTemplate:
      'Turns nested O(N²) range checks into single-pass O(1) complement hash-map probes—works seamlessly with negative numbers.',
    curriculumTopicId: 'prefix-sum-diff-array',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'kadanes-algorithm',
    keywords: [
      { phrase: 'maximum subarray', weight: 40, label: 'maximum subarray sum' },
      { phrase: 'max subarray', weight: 38, label: 'max subarray sum' },
      { phrase: 'largest sum', weight: 34, label: 'largest contiguous sum' },
      { phrase: 'maximum product subarray', weight: 36, label: 'max subarray product' },
      { phrase: 'contiguous sum', weight: 30, label: 'contiguous sum' },
    ],
    scaleBonus: ['large', 'huge'],
    o1SpaceFriendly: true,
    handlesNegatives: true,
    whyTemplate:
      'Maintains the best subarray ending at index i by resetting whenever the running sum turns negative, solving in O(N) time and O(1) space.',
    curriculumTopicId: 'arrays-hashing',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'two-pointers',
    keywords: [
      { phrase: 'pair sum', weight: 34, label: 'pair sum' },
      { phrase: 'three sum', weight: 34, label: '3Sum / k-sum' },
      { phrase: '3sum', weight: 36, label: '3Sum' },
      { phrase: 'in-place', weight: 28, label: 'in-place O(1) space' },
      { phrase: 'palindrome', weight: 28, label: 'palindrome check' },
      { phrase: 'remove duplicates', weight: 34, label: 'deduplicate sorted array' },
      { phrase: 'container', weight: 28, label: 'opposing boundaries' },
      { phrase: 'trapping rain', weight: 30, label: 'two-boundary trapping' },
      { phrase: 'sorted array', weight: 18, label: 'sorted input' },
    ],
    scaleBonus: ['large', 'huge'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Converging or read/write pointers eliminate nested loops in O(N) time and O(1) auxiliary space.',
    curriculumTopicId: 'two-pointers',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'fast-slow-pointers',
    keywords: [
      { phrase: 'linked list', weight: 30, label: 'linked list' },
      { phrase: 'cycle', weight: 24, label: 'cycle detection' },
      { phrase: 'middle of', weight: 32, label: 'middle node' },
      { phrase: 'duplicate number', weight: 30, label: 'implicit cycle duplicate' },
      { phrase: 'happy number', weight: 34, label: 'sequence cycle' },
      { phrase: 'floyd', weight: 34, label: 'Floyd tortoise & hare' },
    ],
    scaleBonus: ['large', 'huge'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Advancing fast by 2 and slow by 1 detects cycles and finds midpoints in O(N) time with strict O(1) space.',
    curriculumTopicId: 'linked-lists',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'cyclic-sort',
    keywords: [
      { phrase: '1 to n', weight: 36, label: 'range [1..N]' },
      { phrase: '0 to n', weight: 34, label: 'range [0..N]' },
      { phrase: 'missing number', weight: 34, label: 'missing integer in range' },
      { phrase: 'first missing positive', weight: 38, label: 'first missing positive' },
      { phrase: 'find all duplicates', weight: 34, label: 'in-place index mapping' },
    ],
    scaleBonus: ['large'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Places each value v directly into index v-1 via in-place swaps to find missing or duplicate numbers in O(N) time and O(1) space.',
    curriculumTopicId: 'sorting-algorithms',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'merge-sort-divide-conquer',
    keywords: [
      { phrase: 'merge sort', weight: 40, label: 'Merge Sort' },
      { phrase: 'quick sort', weight: 40, label: 'Quick Sort' },
      { phrase: 'sort colors', weight: 38, label: '3-way Dutch Flag sort' },
      { phrase: 'dutch national flag', weight: 40, label: 'Dutch National Flag' },
      { phrase: 'stable sort', weight: 36, label: 'stable O(N log N) sort' },
      { phrase: 'inversion', weight: 34, label: 'inversion count' },
      { phrase: 'custom comparator', weight: 34, label: 'custom comparator sort' },
      { phrase: 'sort an array', weight: 36, label: 'O(N log N) sorting' },
      { phrase: 'divide and conquer', weight: 32, label: 'Divide & Conquer' },
    ],
    scaleBonus: ['large', 'huge'],
    whyTemplate:
      'Splits arrays into halves for guaranteed stable O(N log N) merging (plus inversion counting) or 3-way in-place Quick Sort partitioning.',
    curriculumTopicId: 'sorting-algorithms',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'modular-exponentiation',
    keywords: [
      { phrase: 'binary exponentiation', weight: 40, label: 'binary exponentiation' },
      { phrase: 'pow(x, n)', weight: 40, label: 'fast power O(log N)' },
      { phrase: 'x^n', weight: 36, label: 'exponentiation' },
      { phrase: 'recursion', weight: 28, label: 'recursive decomposition' },
      { phrase: 'recurrence', weight: 32, label: 'recurrence / Master Theorem' },
      { phrase: 'divide and conquer', weight: 28, label: 'Divide & Conquer halving' },
    ],
    scaleBonus: ['huge', 'large'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Halves the exponent each recursive or iterative step (x^n = (x^(n/2))^2) to reduce O(N) stack/time down to O(log N).',
    curriculumTopicId: 'recursion-divide-conquer',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'monotonic-stack',
    keywords: [
      { phrase: 'next greater', weight: 38, label: 'next greater element' },
      { phrase: 'next smaller', weight: 38, label: 'next smaller element' },
      { phrase: 'previous smaller', weight: 36, label: 'previous smaller bound' },
      { phrase: 'histogram', weight: 38, label: 'largest rectangle / histogram' },
      { phrase: 'span', weight: 26, label: 'stock span' },
      { phrase: 'daily temperature', weight: 36, label: 'nearest warmer day' },
      { phrase: 'sliding window maximum', weight: 34, label: 'monotonic deque / stack max' },
      { phrase: 'window maximum', weight: 32, label: 'sliding window max' },
    ],
    scaleBonus: ['large', 'huge'],
    whyTemplate:
      'Maintains monotonic order so every element is pushed and popped at most once, resolving nearest greater/smaller bounds in O(N).',
    curriculumTopicId: 'stacks-monotonic-stack',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'binary-search',
    keywords: [
      { phrase: 'sorted', weight: 22, label: 'sorted input' },
      { phrase: 'log n', weight: 32, label: 'O(log N) constraint' },
      { phrase: 'o(log', weight: 34, label: 'logarithmic time target' },
      { phrase: 'minimize the maximum', weight: 38, label: 'min-max answer space' },
      { phrase: 'maximize the minimum', weight: 38, label: 'max-min answer space' },
      { phrase: 'minimum capacity', weight: 34, label: 'capacity feasibility check' },
      { phrase: 'minimum speed', weight: 34, label: 'eating/travel speed search' },
      { phrase: 'rotated', weight: 32, label: 'rotated sorted array' },
      { phrase: 'kth smallest', weight: 24, label: 'monotonic search space' },
      { phrase: 'peak element', weight: 32, label: 'peak finding' },
      { phrase: 'ship packages', weight: 34, label: 'answer-space partition' },
    ],
    scaleBonus: ['huge', 'large'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Exploits a monotonic boolean feasibility predicate to halve the index or answer space each step in O(log S).',
    curriculumTopicId: 'binary-search',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'heap-intervals',
    keywords: [
      { phrase: 'top k', weight: 36, label: 'top-k selection' },
      { phrase: 'top-k', weight: 36, label: 'top-k selection' },
      { phrase: 'k largest', weight: 34, label: 'k largest elements' },
      { phrase: 'k closest', weight: 34, label: 'k closest items' },
      { phrase: 'k most frequent', weight: 34, label: 'k most frequent' },
      { phrase: 'ranked', weight: 20, label: 'ranked results' },
      { phrase: 'tie-breaking', weight: 18, label: 'deterministic tie-breaking' },
      { phrase: 'meeting room', weight: 36, label: 'meeting room / intervals' },
      { phrase: 'interval', weight: 26, label: 'intervals' },
      { phrase: 'priority', weight: 24, label: 'priority queue' },
      { phrase: 'median', weight: 32, label: 'streaming median (two heaps)' },
      { phrase: 'merge k', weight: 36, label: 'k-way sorted merge' },
    ],
    scaleBonus: ['large', 'huge'],
    onlineDynamicFriendly: true,
    whyTemplate:
      'A bounded Heap maintains top-k elements, streaming medians, or earliest interval end times in O(log k) per event.',
    curriculumTopicId: 'heaps-priority-queues',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'quickselect',
    keywords: [
      { phrase: 'kth largest', weight: 36, label: 'kth largest order statistic' },
      { phrase: 'kth smallest', weight: 32, label: 'kth smallest element' },
      { phrase: 'average o(n)', weight: 30, label: 'linear expected selection' },
      { phrase: 'partition', weight: 18, label: 'Hoare/Lomuto partition' },
    ],
    scaleBonus: ['large', 'huge'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Partitions only the half containing index k, finding the k-th order statistic in expected O(N) time and O(1) space.',
    curriculumTopicId: 'heaps-priority-queues',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'segment-tree-lazy',
    keywords: [
      { phrase: 'range update', weight: 40, label: 'dynamic range updates' },
      { phrase: 'range query', weight: 36, label: 'dynamic range queries' },
      { phrase: 'range minimum', weight: 36, label: 'range min/max query' },
      { phrase: 'range maximum', weight: 36, label: 'range max query' },
      { phrase: 'mutable', weight: 28, label: 'mutable array queries' },
      { phrase: 'point update', weight: 28, label: 'interleaved updates & queries' },
      { phrase: 'add val to', weight: 30, label: 'lazy range delta' },
      { phrase: 'segment', weight: 24, label: 'segment aggregation' },
    ],
    scaleBonus: ['large', 'huge'],
    onlineDynamicFriendly: true,
    handlesNegatives: true,
    whyTemplate:
      'Answers arbitrary associative range queries (min/max/sum) and range updates in O(log N) via binary interval decomposition and lazy tags.',
    hasArchitectureView: 'segment-tree',
    curriculumTopicId: 'segment-fenwick-trees',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'fenwick-tree-bit',
    keywords: [
      { phrase: 'prefix sum', weight: 22, label: 'dynamic prefix sums' },
      { phrase: 'inversion', weight: 36, label: 'inversion counting' },
      { phrase: 'point update', weight: 32, label: 'point update + prefix query' },
      { phrase: 'smaller numbers after', weight: 38, label: 'count smaller after self' },
      { phrase: 'count of range', weight: 30, label: 'dynamic frequency count' },
    ],
    scaleBonus: ['large', 'huge'],
    onlineDynamicFriendly: true,
    handlesNegatives: true,
    whyTemplate:
      'Compact 1D array using low-bit jumps (i & -i) for O(log N) dynamic prefix sums and point updates with half the memory of a Segment Tree.',
    hasArchitectureView: 'fenwick-bit',
    curriculumTopicId: 'segment-fenwick-trees',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'heavy-light-decomposition',
    keywords: [
      { phrase: 'tree path', weight: 40, label: 'tree path queries' },
      { phrase: 'path between two nodes', weight: 40, label: 'node-to-node path query' },
      { phrase: 'update node', weight: 30, label: 'dynamic tree node updates' },
      { phrase: 'subtree', weight: 20, label: 'tree path / subtree ops' },
    ],
    scaleBonus: ['large'],
    onlineDynamicFriendly: true,
    whyTemplate:
      'Decomposes any rooted tree into heavy chains so path queries cross at most O(log N) chains, solved via Segment Tree in O(log² N).',
    hasArchitectureView: 'hld-tree',
    curriculumTopicId: 'segment-fenwick-trees',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'binary-lifting-lca',
    keywords: [
      { phrase: 'lowest common ancestor', weight: 40, label: 'Lowest Common Ancestor (LCA)' },
      { phrase: 'kth ancestor', weight: 40, label: 'k-th tree ancestor' },
      { phrase: 'distance between two nodes', weight: 32, label: 'tree node distance queries' },
      { phrase: 'lca', weight: 36, label: 'LCA queries' },
    ],
    scaleBonus: ['large'],
    whyTemplate:
      'Precomputes 2^j-th jump tables in O(N log N) so k-th ancestor and LCA queries resolve in O(log N) bit jumps.',
    curriculumTopicId: 'trees-bst-nary',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'tree-bfs-dfs',
    keywords: [
      { phrase: 'binary tree', weight: 30, label: 'binary tree traversal' },
      { phrase: 'level order', weight: 36, label: 'level-order BFS' },
      { phrase: 'shortest path in grid', weight: 34, label: 'unweighted grid BFS' },
      { phrase: 'unweighted', weight: 30, label: 'unweighted shortest path' },
      { phrase: 'diameter', weight: 32, label: 'tree diameter DFS' },
      { phrase: 'bst', weight: 28, label: 'BST invariant traversal' },
      { phrase: 'islands', weight: 32, label: 'grid flood fill' },
    ],
    scaleBonus: ['large', 'medium'],
    whyTemplate:
      'Queue-driven BFS guarantees shortest hop distance in unweighted graphs/grids while DFS solves tree heights, diameters, and subtrees in O(V + E).',
    curriculumTopicId: 'trees-bst-nary',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'backtracking-trie',
    keywords: [
      { phrase: 'prefix', weight: 22, label: 'prefix lookup' },
      { phrase: 'word search', weight: 38, label: 'Word Search / Trie pruning' },
      { phrase: 'autocomplete', weight: 24, label: 'prefix autocomplete' },
      { phrase: 'wildcard', weight: 32, label: 'wildcard word dictionary' },
      { phrase: 'permutations', weight: 36, label: 'permutations / combinations' },
      { phrase: 'combinations', weight: 34, label: 'combinatorial generation' },
      { phrase: 'n-queens', weight: 38, label: 'constraint backtracking' },
      { phrase: 'all valid', weight: 28, label: 'enumerate all valid solutions' },
    ],
    scaleBonus: ['small', 'medium'],
    whyTemplate:
      'Tries index prefix transitions in O(L), while choose-explore-unchoose backtracking prunes invalid combinatorial branches early.',
    curriculumTopicId: 'backtracking',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'kmp-rabin-karp',
    keywords: [
      { phrase: 'pattern match', weight: 36, label: 'exact pattern matching' },
      { phrase: 'substring search', weight: 34, label: 'linear substring search' },
      { phrase: 'rolling hash', weight: 36, label: 'rolling hash' },
      { phrase: 'repeated substring', weight: 34, label: 'repeated substring period' },
      { phrase: 'longest happy prefix', weight: 36, label: 'prefix-suffix LPS border' },
    ],
    scaleBonus: ['large', 'huge'],
    whyTemplate:
      'KMP LPS fallback pointers and Rabin-Karp rolling hashes eliminate character backtracking for O(N + M) exact substring matching.',
    curriculumTopicId: 'exact-string-matching',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'aho-corasick',
    keywords: [
      { phrase: 'multiple pattern', weight: 38, label: 'multi-pattern search' },
      { phrase: 'dictionary of words', weight: 34, label: 'word dictionary scan' },
      { phrase: 'stream of characters', weight: 36, label: 'character stream matching' },
      { phrase: 'banned words', weight: 34, label: 'keyword / profanity filter' },
      { phrase: 'all occurrences', weight: 26, label: 'all pattern occurrences' },
    ],
    scaleBonus: ['large', 'huge'],
    whyTemplate:
      'Builds a Trie augmented with BFS failure links so thousands of patterns match simultaneously in a single O(N + M + Z) linear pass.',
    hasArchitectureView: 'aho-corasick',
    curriculumTopicId: 'exact-string-matching',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'manachers-algorithm',
    keywords: [
      { phrase: 'longest palindromic substring', weight: 42, label: 'longest palindromic substring' },
      { phrase: 'palindromic substring', weight: 36, label: 'palindromic substrings' },
      { phrase: 'palindrome in o(n)', weight: 38, label: 'linear-time palindrome' },
    ],
    scaleBonus: ['large', 'huge'],
    whyTemplate:
      'Reuses mirrored palindrome radii inside the rightmost boundary to find all palindromic centers in strict O(N) time.',
    curriculumTopicId: 'exact-string-matching',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'dijkstra-shortest-path',
    keywords: [
      { phrase: 'shortest path', weight: 34, label: 'shortest path' },
      { phrase: 'weighted graph', weight: 32, label: 'weighted graph' },
      { phrase: 'network delay', weight: 36, label: 'network latency routing' },
      { phrase: 'minimum cost path', weight: 32, label: 'min-cost routing' },
      { phrase: 'cheapest', weight: 24, label: 'cheapest route' },
      { phrase: 'minimum effort', weight: 32, label: 'minimax weighted grid path' },
    ],
    scaleBonus: ['large', 'medium'],
    breaksOnNegatives:
      'Dijkstra’s greedy finalization fails when negative edge weights exist; use Bellman-Ford instead.',
    whyTemplate:
      'Greedily settles the closest vertex from a Min-Heap in O((V + E) log V) for graphs with non-negative edge weights.',
    curriculumTopicId: 'graphs-traversal-dsu',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'bellman-ford',
    keywords: [
      { phrase: 'negative weight', weight: 40, label: 'negative edge weights' },
      { phrase: 'negative cycle', weight: 42, label: 'negative cycle / arbitrage' },
      { phrase: 'at most k stops', weight: 38, label: 'at most k edge hops' },
      { phrase: 'arbitrage', weight: 38, label: 'currency arbitrage' },
    ],
    scaleBonus: ['medium', 'small'],
    handlesNegatives: true,
    whyTemplate:
      'Relaxes all edges V-1 times to handle negative weights, bounded-hop shortest paths, and negative cycle detection where Dijkstra fails.',
    curriculumTopicId: 'graphs-traversal-dsu',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'floyd-warshall',
    keywords: [
      { phrase: 'all pairs', weight: 40, label: 'all-pairs shortest path' },
      { phrase: 'all-pairs', weight: 40, label: 'all-pairs shortest path' },
      { phrase: 'every pair of nodes', weight: 36, label: 'every pair distance' },
      { phrase: 'transitive closure', weight: 34, label: 'transitive closure' },
    ],
    scaleBonus: ['small', 'medium'],
    handlesNegatives: true,
    whyTemplate:
      'Computes shortest paths between every pair (u, v) in O(V³) via intermediate-vertex DP when V <= 400.',
    curriculumTopicId: 'graphs-traversal-dsu',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'graph-topo-sort',
    keywords: [
      { phrase: 'prerequisite', weight: 38, label: 'prerequisites' },
      { phrase: 'dependency', weight: 34, label: 'task dependencies' },
      { phrase: 'dependencies', weight: 34, label: 'task dependencies' },
      { phrase: 'dag', weight: 34, label: 'directed acyclic graph' },
      { phrase: 'build order', weight: 36, label: 'execution / build order' },
      { phrase: 'course schedule', weight: 38, label: 'course ordering' },
      { phrase: 'alien dictionary', weight: 36, label: 'lexicographic DAG order' },
      { phrase: 'cycle in directed', weight: 32, label: 'directed cycle check' },
    ],
    scaleBonus: ['large', 'medium'],
    whyTemplate:
      'Kahn’s zero-in-degree BFS queue resolves linear dependency orderings and detects directed cycles in O(V + E).',
    curriculumTopicId: 'graphs-traversal-dsu',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'union-find-dsu',
    keywords: [
      { phrase: 'connected component', weight: 36, label: 'connected components' },
      { phrase: 'disjoint', weight: 36, label: 'disjoint sets' },
      { phrase: 'merge account', weight: 36, label: 'account / cluster merging' },
      { phrase: 'redundant connection', weight: 38, label: 'undirected cycle' },
      { phrase: 'equivalence', weight: 28, label: 'equivalence classes' },
      { phrase: 'minimum spanning', weight: 30, label: 'Kruskal MST connectivity' },
      { phrase: 'dynamic connectivity', weight: 38, label: 'online edge unions' },
    ],
    scaleBonus: ['large', 'huge'],
    onlineDynamicFriendly: true,
    whyTemplate:
      'Path compression + union by rank merges dynamic connectivity components in amortized O(α(N)) ≈ O(1) time.',
    curriculumTopicId: 'graphs-traversal-dsu',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'tarjan-kosaraju-scc',
    keywords: [
      { phrase: 'strongly connected', weight: 40, label: 'strongly connected components' },
      { phrase: 'critical connection', weight: 40, label: 'graph bridges' },
      { phrase: 'bridge', weight: 34, label: 'cut-edges / bridges' },
      { phrase: 'articulation', weight: 38, label: 'articulation points' },
    ],
    scaleBonus: ['large', 'medium'],
    whyTemplate:
      'Tracks DFS discovery and low-link timestamps to identify bridges, articulation points, and SCCs in a single O(V + E) pass.',
    curriculumTopicId: 'graphs-traversal-dsu',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'bitmask-dp',
    keywords: [
      { phrase: 'traveling salesman', weight: 40, label: 'TSP / visit all nodes' },
      { phrase: 'visit all', weight: 30, label: 'visit every node / item' },
      { phrase: 'subset', weight: 24, label: 'subset state' },
      { phrase: 'assign', weight: 20, label: 'bipartite assignment' },
      { phrase: 'partition into k equal', weight: 34, label: 'k-subset partition' },
    ],
    scaleBonus: ['small'],
    whyTemplate:
      'When N <= 20, encoding visited subsets inside an integer bitmask reduces O(N!) permutations to O(N · 2^N) DP.',
    curriculumTopicId: 'bit-manipulation',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'bit-manipulation',
    keywords: [
      { phrase: 'single number', weight: 38, label: 'XOR unique element' },
      { phrase: 'appears twice', weight: 36, label: 'paired cancellation' },
      { phrase: 'xor', weight: 34, label: 'bitwise XOR' },
      { phrase: 'set bits', weight: 34, label: 'bit counting / Brian Kernighan' },
      { phrase: 'power of two', weight: 34, label: 'bit power check' },
    ],
    scaleBonus: ['large', 'huge'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Exploits self-inverse XOR (a ^ a = 0) and low-bit masks (n & (n-1)) for O(N) time and O(1) space.',
    curriculumTopicId: 'bit-manipulation',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'convex-hull-trick',
    keywords: [
      { phrase: 'monotonic slope', weight: 40, label: 'monotonic slopes' },
      { phrase: 'linear function', weight: 32, label: 'min/max of linear lines' },
      { phrase: 'dp[i] = min', weight: 30, label: '1D/1D quadratic DP optimization' },
      { phrase: 'batch', weight: 20, label: 'batch partitioning cost' },
    ],
    scaleBonus: ['large'],
    whyTemplate:
      'Maintains the lower envelope of linear DP transitions to collapse O(N²) DP transitions to O(N) or O(N log N).',
    curriculumTopicId: 'dynamic-programming',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'dynamic-programming',
    keywords: [
      { phrase: 'number of ways', weight: 34, label: 'counting ways' },
      { phrase: 'minimum cost', weight: 26, label: 'minimum cost optimization' },
      { phrase: 'knapsack', weight: 38, label: 'knapsack capacity' },
      { phrase: 'edit distance', weight: 38, label: 'string edit distance' },
      { phrase: 'subsequence', weight: 32, label: 'longest subsequence' },
      { phrase: 'coin change', weight: 38, label: 'unbounded coin DP' },
      { phrase: 'house robber', weight: 36, label: 'non-adjacent choice DP' },
      { phrase: 'word break', weight: 34, label: 'prefix segmentation DP' },
    ],
    scaleBonus: ['medium', 'small'],
    whyTemplate:
      'Caches overlapping subproblem states in a table (or rolling row) so exponential recursion collapses into polynomial time.',
    curriculumTopicId: 'dynamic-programming',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'greedy-algorithms',
    keywords: [
      { phrase: 'jump game', weight: 38, label: 'farthest reach greedy' },
      { phrase: 'gas station', weight: 36, label: 'circular deficit reset' },
      { phrase: 'non-overlapping', weight: 34, label: 'earliest finish interval' },
      { phrase: 'minimum number of arrows', weight: 34, label: 'interval stabbing' },
      { phrase: 'maximize profit', weight: 26, label: 'local optimal exchange' },
    ],
    scaleBonus: ['large', 'huge'],
    o1SpaceFriendly: true,
    whyTemplate:
      'Commits to the provably safe local choice (earliest finish or farthest reach) in O(N) or O(N log N) without a DP table.',
    curriculumTopicId: 'greedy-algorithms',
  },
  {
    targetDestination: 'algorithms',
    targetAlgoId: 'reservoir-sampling',
    keywords: [
      { phrase: 'unknown length', weight: 38, label: 'unknown stream length' },
      { phrase: 'uniform random', weight: 36, label: 'uniform random sample' },
      { phrase: 'infinite stream', weight: 38, label: 'infinite data stream' },
      { phrase: 'random node', weight: 34, label: 'one-pass random sampling' },
    ],
    scaleBonus: ['huge', 'large'],
    o1SpaceFriendly: true,
    onlineDynamicFriendly: true,
    whyTemplate:
      'Maintains a uniform k-item sample over an unbounded stream in a single pass using O(k) memory.',
    curriculumTopicId: 'queues-monotonic-deque',
  },
];

function extractExplicitComplexity(text: string): string | undefined {
  const match = text.match(
    /o\(\s*(1|log\s*n|n\s*log\s*n|n\s*\^\s*2|n²|n\s*\+\s*m|v\s*\+\s*e|n|2\s*\^\s*n)\s*\)/i
  );
  if (!match) return undefined;
  return match[0].replace(/\s+/g, ' ').toUpperCase().replace('O(', 'O(');
}

function detectScaleAndConstraints(
  raw: string,
  overrides?: MatcherConstraintOverrides
): {
  tier: ScaleTier;
  verdict: ComplexityVerdict;
  constraints: DetectedConstraint[];
  effectiveO1Space: boolean;
  effectiveNegatives: boolean;
  effectiveOnline: boolean;
} {
  const text = raw.toLowerCase();
  const constraints: DetectedConstraint[] = [];
  let parsedTier: ScaleTier = 'large';
  let tierDetectedFromText = false;

  // Detect explicit huge scale (10^7, 10^8, 10^9, million, billion)
  const hugeMatch = text.match(
    /(10\s*\^\s*[789]|10[⁷⁸⁹]|\b\d+\s*million\b|\b10m\b|\bbillion\b|1e[789])/
  );
  const largeMatch = text.match(
    /(10\s*\^\s*[56]|10[⁵⁶]|100,?000|200,?000|500,?000|1e[56]|n\s*<=?\s*100000|n\s*≤\s*100000)/
  );
  const mediumMatch = text.match(
    /(10\s*\^\s*[34]|10[³⁴]|n\s*<=?\s*[1-5],?000|n\s*≤\s*[1-5],?000|n\s*<=?\s*[2-9]00|n\s*≤\s*[2-9]00)/
  );
  const smallMatch = text.match(
    /(n\s*<=?\s*2[0-4]\b|n\s*≤\s*2[0-4]\b|n\s*<=?\s*1[0-9]\b|n\s*≤\s*1[0-9]\b|n\s*<=?\s*[1-9]\b|n\s*≤\s*[1-9]\b)/
  );

  if (hugeMatch) {
    parsedTier = 'huge';
    tierDetectedFromText = true;
    constraints.push({
      label: 'Massive Data Scale (N ≥ 10⁷)',
      matchedText: hugeMatch[0],
      implication:
        'Eliminates O(N·M) and per-query O(N log N) scans; requires O(1)/O(log N) indexing, mathematical pruning, or sketching.',
      source: 'parsed',
    });
  } else if (largeMatch) {
    parsedTier = 'large';
    tierDetectedFromText = true;
    constraints.push({
      label: 'Large Input Scale (N ~ 10⁵–10⁶)',
      matchedText: largeMatch[0],
      implication: 'Requires O(N) or O(N log N); nested O(N²) loops will Time Limit Exceed (TLE).',
      source: 'parsed',
    });
  } else if (mediumMatch) {
    parsedTier = 'medium';
    tierDetectedFromText = true;
    constraints.push({
      label: 'Medium Input Scale (N ≤ 5×10³)',
      matchedText: mediumMatch[0],
      implication: 'O(N²) 2D DP tables and O(V·E) graph algorithms pass comfortably within budget.',
      source: 'parsed',
    });
  } else if (smallMatch) {
    parsedTier = 'small';
    tierDetectedFromText = true;
    constraints.push({
      label: 'Combinatorial Scale (N ≤ 20)',
      matchedText: smallMatch[0],
      implication: 'Strong signal for O(2^N) Backtracking, Meet-in-the-Middle, or O(N · 2^N) Bitmask DP.',
      source: 'parsed',
    });
  }

  // Latency SLA detection
  const latencyMatch = text.match(/<\s*(\d+)\s*ms/);
  if (latencyMatch) {
    parsedTier = 'huge';
    tierDetectedFromText = true;
    constraints.push({
      label: `Strict Latency SLA (< ${latencyMatch[1]} ms)`,
      matchedText: latencyMatch[0],
      implication:
        'Requires precomputed index (Inverted Index / Trie / Segment Tree) + pruning bounds + bounded Top-K heap.',
      source: 'parsed',
    });
  }

  const explicitTargetComplexity = extractExplicitComplexity(raw);
  if (explicitTargetComplexity) {
    constraints.push({
      label: `Explicit Time Target (${explicitTargetComplexity})`,
      matchedText: explicitTargetComplexity,
      implication: `Problem explicitly caps solution complexity at ${explicitTargetComplexity}; reject slower baseline passes.`,
      source: 'parsed',
    });
  }

  const parsedO1Space = /(o\(1\)\s*(extra|aux|auxiliary)?\s*space|in-place|constant\s+(extra\s+)?space)/.test(text);
  const effectiveO1Space = Boolean(overrides?.requireO1Space || parsedO1Space);
  if (effectiveO1Space) {
    constraints.push({
      label: 'O(1) Auxiliary Space',
      matchedText: parsedO1Space ? 'in-place / O(1) space' : 'manual constraint toggle',
      implication:
        'Favors Two Pointers, Fast/Slow Pointers, Kadane’s, Cyclic Sort, Binary Search, or Bitwise XOR over Hash Maps.',
      source: parsedO1Space ? 'parsed' : 'override',
    });
  }

  const parsedNegatives = /(negative|-\s*10\^|-\s*\d{2,}\s*<=|nums\[i\]\s*may be negative|can be negative)/.test(text);
  const effectiveNegatives = Boolean(overrides?.hasNegativeValues || parsedNegatives);
  if (effectiveNegatives) {
    constraints.push({
      label: 'Negative Numbers / Weights Present',
      matchedText: parsedNegatives ? 'negative values detected' : 'manual constraint toggle',
      implication:
        'Breaks Sliding Window shrink monotonicity and Dijkstra greedy locks; use Prefix Sum + Hash Map or Bellman-Ford.',
      source: parsedNegatives ? 'parsed' : 'override',
    });
  }

  const parsedOnline = /(real-time|stream|online|range update|point update|mutable|update node)/.test(text);
  const effectiveOnline = Boolean(overrides?.isOnlineDynamic || parsedOnline);
  if (effectiveOnline) {
    constraints.push({
      label: 'Online / Dynamic Mutations',
      matchedText: parsedOnline ? 'updates / streaming' : 'manual constraint toggle',
      implication:
        'Static prefix arrays or one-off sorts break on mutations; use Segment Tree, Fenwick Tree, Heap, or DSU.',
      source: parsedOnline ? 'parsed' : 'override',
    });
  }

  if (/(typo|fuzzy|spelling|missing space|transposition)/.test(text)) {
    constraints.push({
      label: 'Fuzzy / Typo-Tolerant Matching',
      matchedText: 'typos / fuzzy / missing spaces',
      implication:
        'Exact word hashing fails; convert strings to Padded Character N-Grams + Inverted Index + Length/Count Pruning.',
      source: 'parsed',
    });
  }

  const tier: ScaleTier =
    overrides?.scaleOverride && overrides.scaleOverride !== 'auto'
      ? overrides.scaleOverride
      : parsedTier;

  if (overrides?.scaleOverride && overrides.scaleOverride !== 'auto' && !tierDetectedFromText) {
    constraints.unshift({
      label: `Simulated Input Scale (${tier.toUpperCase()})`,
      matchedText: 'manual scale selector',
      implication: 'Constraint ceiling overridden manually to test how scale shifts optimal DSA patterns.',
      source: 'override',
    });
  }

  const verdicts: Record<ScaleTier, ComplexityVerdict> = {
    huge: {
      tier: 'huge',
      scaleLabel: 'Massive / Real-Time Scale (N ≥ 10⁷ or < 50 ms SLA)',
      maxAllowedComplexity: 'O(1) · O(log N) · O(Σ|Postings| + C log k)',
      eliminatedComplexities: ['O(N·L·M) global DP', 'O(N²)', 'O(N log N) per query'],
      rationale:
        'Full corpus scans exceed latency budgets; use inverted indexing, mathematical pruning bounds, binary search, or sketches.',
      explicitTargetComplexity,
    },
    large: {
      tier: 'large',
      scaleLabel: 'Standard Interview Scale (N ~ 10⁵–10⁶)',
      maxAllowedComplexity: 'O(N) · O(N log N)',
      eliminatedComplexities: ['O(N²)', 'O(N³)', 'O(2^N)'],
      rationale:
        'Aim for single-pass pointers/windows/hash maps/monotonic stacks or O(log N) per-query structures (Heaps, Binary Search, Segment/Fenwick Trees).',
      explicitTargetComplexity,
    },
    medium: {
      tier: 'medium',
      scaleLabel: 'Quadratic-Safe Scale (N ≤ 5×10³)',
      maxAllowedComplexity: 'O(N²) · O(V·E)',
      eliminatedComplexities: ['O(N³) on N > 500', 'O(2^N)'],
      rationale:
        '2D Dynamic Programming tables, Bellman-Ford, and quadratic interval DP pass comfortably within 10⁸ ops.',
      explicitTargetComplexity,
    },
    small: {
      tier: 'small',
      scaleLabel: 'Combinatorial Scale (N ≤ 20)',
      maxAllowedComplexity: 'O(N · 2^N) · O(2^N)',
      eliminatedComplexities: ['Unpruned O(N!) for N > 12'],
      rationale:
        'Small N explicitly permits Bitmask DP, Meet-in-the-Middle, or constraint-pruned Backtracking.',
      explicitTargetComplexity,
    },
  };

  return {
    tier,
    verdict: verdicts[tier],
    constraints,
    effectiveO1Space,
    effectiveNegatives,
    effectiveOnline,
  };
}

export function analyzeProblemForAlgorithms(
  promptText: string,
  overrides?: MatcherConstraintOverrides
): MatchAnalysisResult {
  const clean = promptText.trim();
  const lower = clean.toLowerCase();
  const {
    tier,
    verdict,
    constraints,
    effectiveO1Space,
    effectiveNegatives,
    effectiveOnline,
  } = detectScaleAndConstraints(clean, overrides);

  const algoById = new Map(ALGORITHMS_CATALOG.map((a) => [a.id, a]));
  const scored: AlgorithmMatchRecommendation[] = [];

  for (const rule of PATTERN_RULES) {
    let score = 0;
    const matchedSignals: string[] = [];
    let cautionNote: string | undefined;

    for (const kw of rule.keywords) {
      if (lower.includes(kw.phrase)) {
        score += kw.weight;
        if (!matchedSignals.includes(kw.label)) matchedSignals.push(kw.label);
      }
    }

    if (score === 0) continue;

    if (rule.scaleBonus?.includes(tier)) {
      score += 12;
      matchedSignals.push(`fits ${tier}-scale ceiling`);
    }

    if (effectiveO1Space && rule.o1SpaceFriendly) {
      score += 14;
      matchedSignals.push('O(1) space compatible');
    }

    if (effectiveOnline && rule.onlineDynamicFriendly) {
      score += 14;
      matchedSignals.push('supports online updates');
    }

    if (effectiveNegatives) {
      if (rule.handlesNegatives) {
        score += 16;
        matchedSignals.push('safe with negative values');
      } else if (rule.breaksOnNegatives) {
        score -= 18;
        cautionNote = rule.breaksOnNegatives;
      }
    }

    const catalogEntry =
      rule.targetDestination === 'algorithms' ? algoById.get(rule.targetAlgoId) : undefined;

    scored.push({
      id: `${rule.targetDestination}:${rule.targetAlgoId}`,
      name: rule.customName ?? catalogEntry?.name ?? rule.targetAlgoId,
      category: rule.customCategory ?? catalogEntry?.category ?? 'Core Pattern',
      timeComplexity: rule.customTime ?? catalogEntry?.timeComplexity ?? 'O(N)',
      spaceComplexity: rule.customSpace ?? catalogEntry?.spaceComplexity ?? 'O(N)',
      confidence: Math.min(99, Math.max(38, Math.round(score))),
      matchedSignals,
      whyItFits: rule.whyTemplate,
      cautionNote,
      targetDestination: rule.targetDestination,
      targetAlgoId: rule.targetAlgoId,
      hasArchitectureView: rule.hasArchitectureView,
      curriculumTopicId: rule.curriculumTopicId,
    });
  }

  scored.sort((a, b) => b.confidence - a.confidence);

  // Smart constraint-aware fallback if prompt has only constraints or is very short
  if (scored.length === 0) {
    const fallbackIds: { id: string; topicId: string }[] =
      tier === 'small'
        ? [
            { id: 'bitmask-dp', topicId: 'bit-manipulation' },
            { id: 'backtracking-trie', topicId: 'backtracking' },
            { id: 'dynamic-programming', topicId: 'dynamic-programming' },
          ]
        : tier === 'medium'
          ? [
              { id: 'dynamic-programming', topicId: 'dynamic-programming' },
              { id: 'bellman-ford', topicId: 'graphs-traversal-dsu' },
              { id: 'floyd-warshall', topicId: 'graphs-traversal-dsu' },
            ]
          : effectiveOnline
            ? [
                { id: 'segment-tree-lazy', topicId: 'segment-fenwick-trees' },
                { id: 'fenwick-tree-bit', topicId: 'segment-fenwick-trees' },
                { id: 'heap-intervals', topicId: 'heaps-priority-queues' },
              ]
            : effectiveO1Space
              ? [
                  { id: 'two-pointers', topicId: 'two-pointers' },
                  { id: 'binary-search', topicId: 'binary-search' },
                  { id: 'kadanes-algorithm', topicId: 'arrays-hashing' },
                ]
              : [
                  { id: 'prefix-sum-hash', topicId: 'prefix-sum-diff-array' },
                  { id: 'sliding-window', topicId: 'sliding-window' },
                  { id: 'binary-search', topicId: 'binary-search' },
                ];

    for (const item of fallbackIds) {
      const a = algoById.get(item.id);
      if (a) {
        scored.push({
          id: `algorithms:${a.id}`,
          name: a.name,
          category: a.category,
          timeComplexity: a.timeComplexity,
          spaceComplexity: a.spaceComplexity,
          confidence: 58,
          matchedSignals: [`matches ${tier}-scale constraint profile`],
          whyItFits: a.tagline,
          targetDestination: 'algorithms',
          targetAlgoId: a.id,
          curriculumTopicId: item.topicId,
        });
      }
    }
  }

  return {
    complexityVerdict: verdict,
    detectedConstraints: constraints,
    recommendations: scored.slice(0, 6),
    activeOverrides: {
      scaleOverride: overrides?.scaleOverride ?? 'auto',
      requireO1Space: effectiveO1Space,
      hasNegativeValues: effectiveNegatives,
      isOnlineDynamic: effectiveOnline,
    },
  };
}
