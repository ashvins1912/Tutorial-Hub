import type {
  ConceptNode,
  DifficultyTier,
  GeneratedPracticeProblem,
} from './intelligent-engine.types';

/** Deterministic linear-congruential pseudo-random helper */
function seededInt(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const frac = x - Math.floor(x);
  return Math.floor(frac * (max - min + 1)) + min;
}

function scaleLabel(difficulty: DifficultyTier): string {
  switch (difficulty) {
    case 'EASY':
      return 'N <= 10^3';
    case 'MEDIUM':
      return 'N <= 10^5';
    case 'HARD':
      return 'N <= 5 * 10^5 (strict time budget)';
    case 'SYSTEM_SCALE':
      return 'N <= 10^7 streaming / distributed scale';
  }
}

export const SEED_CONCEPT_PACK: ConceptNode[] = [
  // 1. Two-Stage N-Gram Fuzzy Search
  {
    id: 'ngram-two-stage-search',
    title: 'Two-Stage N-Gram Fuzzy Search (Candidate + Confident Rerank)',
    category: 'Search & Information Retrieval',
    tags: ['n-gram', 'trigram', 'fuzzy search', 'inverted index', 'levenshtein', 'jaccard'],
    coreMentalModel:
      'Use fast set-overlap on padded trigrams for high-recall candidate retrieval, then run exact edit distance on the top K candidates for high precision.',
    invariantRule:
      'Any string within edit distance k shares at least max(|A|, |B|) - n + 1 - k*n n-grams.',
    complexity: { time: 'O(Candidate_Set + K * L * M)', space: 'O(N * L)' },
    visualSpec: {
      inputs: ['User Search Query (with typos)', 'Catalog Corpus (10M Titles)'],
      processes: [
        'Normalize & Generate Padded Trigrams',
        'Query Inverted Posting Lists + Length/Count Pruning',
        'Compute Jaccard Similarity & Extract Top-K Candidates',
        'Rerank Top-K via Damerau-Levenshtein Confidence Score',
      ],
      dataStores: ['Trigram Inverted Index', 'Doc Length Lookup Array', 'Bounded Min-Heap (Size K)'],
      outputs: ['Ranked Top-K Confident Matches'],
      decisionBranches: [
        {
          condition: 'Candidate Jaccard >= Threshold',
          truePath: 'Push to Top-K Min-Heap for Stage-2 Reranking',
          falsePath: 'Prune immediately (Count/Length Filter)',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'trigram-jaccard-builder',
        patternName: 'Padded Trigram Candidate Scoring',
        difficulty: 'MEDIUM',
        storyTemplates: [
          'Given a misspelled search query and a catalog of product titles, compute padded trigram Jaccard similarity and return matches >= threshold.',
        ],
        parameterRanges: { catalogSize: [5, 20], thresholdPercent: [20, 60] },
        edgeCaseInjectors: ['short_typo', 'adjacent_transposition', 'prefix_drop'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const wordsPool = ['apple', 'apricot', 'application', 'banana', 'bandana', 'laptop', 'lamp', 'pillow'];
          const queries = ['aple', 'latpop', 'bananna', 'aprcot'];
          const query = queries[Math.abs(seed) % queries.length];
          const threshold = difficulty === 'EASY' ? 0.2 : difficulty === 'HARD' ? 0.35 : 0.25;

          const getTrigrams = (s: string) => {
            const p = `  ${s}  `;
            const set = new Set<string>();
            for (let i = 0; i <= p.length - 3; i++) set.add(p.slice(i, i + 3));
            return set;
          };

          const qGrams = getTrigrams(query);
          const expected = wordsPool
            .map((word) => {
              const wGrams = getTrigrams(word);
              let inter = 0;
              qGrams.forEach((g) => {
                if (wGrams.has(g)) inter++;
              });
              const union = qGrams.size + wGrams.size - inter;
              return { word, score: Number((inter / union).toFixed(2)) };
            })
            .filter((item) => item.score >= threshold)
            .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word));

          return {
            problemId: `ngram-${seed}`,
            conceptId: 'ngram-two-stage-search',
            title: `Fuzzy Catalog Retrieval #${seed}`,
            difficulty,
            statement: `Query = "${query}", Threshold = ${threshold}. Using padded trigrams (n=3, two spaces on each side), find all matching titles from ${JSON.stringify(wordsPool)} ranked descending by Jaccard similarity.`,
            constraints: [
              scaleLabel(difficulty),
              'Pad strings with 2 leading and 2 trailing spaces ("  " + s + "  ")',
              'Round Jaccard similarity to 2 decimal places',
            ],
            sampleInput: { query, threshold, catalog: wordsPool },
            expectedOutput: expected,
            edgeCaseTag: seed % 2 === 0 ? 'short_typo' : 'adjacent_transposition',
            socraticSteps: [
              {
                step: 1,
                question: `Why must we pad "${query}" with two spaces before slicing trigrams?`,
                options: [
                  'So prefix/suffix characters participate equally and short tokens still yield multiple trigrams.',
                  'To sort characters alphabetically before hashing.',
                  'To guarantee O(1) Levenshtein distance without DP.',
                ],
                correctIndex: 0,
                hint: 'Without padding, a 3-letter word produces only 1 trigram—any single typo destroys 100% of overlap.',
              },
              {
                step: 2,
                question: 'Why run Damerau-Levenshtein only in Stage 2 (top-K candidates) instead of all 10M titles?',
                options: [
                  'Exact edit distance is O(L*M) per pair; Stage-1 inverted index prunes 99.9% of non-candidates first.',
                  'Levenshtein cannot handle ASCII strings.',
                  'Stage 1 already guarantees zero false positives.',
                ],
                correctIndex: 0,
                hint: 'Filter-and-Refine trades tiny memory for sub-millisecond recall before running expensive exact scoring.',
              },
            ],
          };
        },
      },
    ],
  },

  // 2. Variable-Size Sliding Window
  {
    id: 'sliding-window-variable',
    title: 'Variable-Size Sliding Window (Monotonic Two-Pointer)',
    category: 'Arrays & Strings',
    tags: ['sliding window', 'substring', 'subarray', 'two pointers', 'frequency map'],
    coreMentalModel:
      'Maintain a single contiguous window [left..right]. Expand right unconditionally; shrink left only while the window invariant is broken.',
    invariantRule:
      'Both left and right move monotonically rightward at most N times total, guaranteeing amortized O(N) runtime.',
    complexity: { time: 'O(N)', space: 'O(K) distinct chars' },
    visualSpec: {
      inputs: ['Character / Integer Stream', 'Validity Bound (Unique or Sum K)'],
      processes: [
        'Expand Right Pointer & Acquire Element',
        'Update Frequency Map / Running Window Aggregate',
        'Shrink Left Pointer While Invariant Violated',
        'Record Optimal Window Length',
      ],
      dataStores: ['Window Frequency Map', 'Left/Right Pointer Pair', 'Best Length Scalar'],
      outputs: ['Longest / Shortest Valid Window Metric'],
      decisionBranches: [
        {
          condition: 'Window Violates Validity Constraint',
          truePath: 'Evict s[left] and increment left pointer',
          falsePath: 'Update best = max(best, right - left + 1)',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'longest-unique-substring',
        patternName: 'Variable Sliding Window with Last-Seen Index Map',
        difficulty: 'MEDIUM',
        storyTemplates: [
          'Given an event stream string, compute the length of the longest contiguous substring with all unique tokens.',
        ],
        parameterRanges: { len: [7, 14] },
        edgeCaseInjectors: ['stale_index_left_of_window', 'all_unique', 'adjacent_duplicates'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const alphabets = ['abcde', 'abca', 'xyzab', 'mnopm'];
          const alpha = alphabets[Math.abs(seed) % alphabets.length];
          const len = seededInt(seed + 1, 7, 11);
          let s = '';
          for (let i = 0; i < len; i++) {
            s += alpha[seededInt(seed + i * 7, 0, alpha.length - 1)];
          }
          const lastSeen = new Map<string, number>();
          let left = 0;
          let best = 0;
          let bestSub = '';
          for (let r = 0; r < s.length; r++) {
            const ch = s[r];
            if (lastSeen.has(ch) && lastSeen.get(ch)! >= left) {
              left = lastSeen.get(ch)! + 1;
            }
            lastSeen.set(ch, r);
            if (r - left + 1 > best) {
              best = r - left + 1;
              bestSub = s.slice(left, r + 1);
            }
          }
          return {
            problemId: `sw-${seed}`,
            conceptId: 'sliding-window-variable',
            title: `Unique Telemetry Burst #${seed}`,
            difficulty,
            statement: `Given telemetry string s = "${s}", return the length and example substring of the longest contiguous segment containing no repeated characters.`,
            constraints: [scaleLabel(difficulty), 'O(N) time, O(min(N, |Σ|)) space'],
            sampleInput: { s },
            expectedOutput: { maxLength: best, exampleWindow: bestSub },
            edgeCaseTag: 'stale_index_left_of_window',
            socraticSteps: [
              {
                step: 1,
                question: 'Why must we compute left = Math.max(left, lastSeen[ch] + 1) instead of left = lastSeen[ch] + 1?',
                options: [
                  'Because lastSeen[ch] might point to an index already evicted to the left of the current window.',
                  'Because strings are 1-indexed.',
                  'To handle negative integers.',
                ],
                correctIndex: 0,
                hint: 'Moving left backward would re-include duplicate characters that were already removed!',
              },
              {
                step: 2,
                question: 'When does a Variable Sliding Window FAIL and require Prefix Sum + HashMap instead?',
                options: [
                  'When subarray sum problems contain negative numbers, breaking monotonicity.',
                  'When the string is longer than 100 characters.',
                  'When characters are lowercase ASCII.',
                ],
                correctIndex: 0,
                hint: 'Shrinking a window with negative values can INCREASE the sum instead of decreasing it.',
              },
            ],
          };
        },
      },
    ],
  },

  // 3. Prefix Sum + HashMap
  {
    id: 'prefix-sum-hashmap',
    title: 'Prefix Sum + HashMap Subarray Frequency',
    category: 'Arrays & Prefix Math',
    tags: ['prefix sum', 'hashmap', 'subarray sum k', 'negative numbers', 'range sum'],
    coreMentalModel:
      'Rewrite sum(L..R) === K as prefix[R] - prefix[L - 1] === K. Count prior occurrences of (currentPrefix - K) in O(1) using a HashMap.',
    invariantRule:
      'Seeding freq.set(0, 1) accounts for every valid subarray starting cleanly at index 0.',
    complexity: { time: 'O(N)', space: 'O(N)' },
    visualSpec: {
      inputs: ['Integer Array (May Include Negatives)', 'Target Sum K'],
      processes: [
        'Seed Prefix Map with {0: 1}',
        'Accumulate runningSum += nums[i]',
        'Query freq.get(runningSum - K)',
        'Increment freq[runningSum]',
      ],
      dataStores: ['Prefix Frequency HashMap', 'Running Sum Accumulator'],
      outputs: ['Total Subarrays Summing to K'],
      decisionBranches: [
        {
          condition: 'freq.has(runningSum - K)',
          truePath: 'Add freq.get(runningSum - K) to totalCount',
          falsePath: 'Proceed directly to recording runningSum',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'subarray-sum-k-gen',
        patternName: 'Prefix Difference Lookup',
        difficulty: 'MEDIUM',
        storyTemplates: ['Count contiguous ledger delta slices whose net balance equals K.'],
        parameterRanges: { len: [6, 10], k: [2, 7] },
        edgeCaseInjectors: ['negative_elements', 'zero_prefix_hit'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const len = seededInt(seed, 6, 9);
          const nums: number[] = [];
          for (let i = 0; i < len; i++) {
            nums.push(seededInt(seed + i * 11, -2, 5));
          }
          const k = seededInt(seed + 99, 2, 6);
          const freq = new Map<number, number>([[0, 1]]);
          let sum = 0;
          let count = 0;
          for (const x of nums) {
            sum += x;
            count += freq.get(sum - k) ?? 0;
            freq.set(sum, (freq.get(sum) ?? 0) + 1);
          }
          return {
            problemId: `prefix-${seed}`,
            conceptId: 'prefix-sum-hashmap',
            title: `Net Ledger Slices #${seed}`,
            difficulty,
            statement: `Given signed transaction deltas nums = ${JSON.stringify(nums)} and target K = ${k}, count all contiguous subarrays summing exactly to K.`,
            constraints: [scaleLabel(difficulty), 'nums[i] may be negative, zero, or positive'],
            sampleInput: { nums, k },
            expectedOutput: { subarrayCount: count },
            edgeCaseTag: 'negative_elements',
            socraticSteps: [
              {
                step: 1,
                question: 'Why must freq be initialized with { 0: 1 } before the loop starts?',
                options: [
                  'So a runningSum === K at index i finds runningSum - K = 0 in the map (counting subarray [0..i]).',
                  'To avoid division by zero.',
                  'To sort prefix sums in ascending order.',
                ],
                correctIndex: 0,
                hint: 'The empty prefix before index 0 has sum 0 and occurs exactly once.',
              },
              {
                step: 2,
                question: 'What bug happens if you increment freq[runningSum] BEFORE querying freq[runningSum - K] when K = 0?',
                options: [
                  'Every index falsely matches itself as an empty zero-length subarray.',
                  'The algorithm becomes O(N^2).',
                  'Negative sums overflow 64-bit floats.',
                ],
                correctIndex: 0,
                hint: 'Always query prior prefixes first, then insert the current prefix.',
              },
            ],
          };
        },
      },
    ],
  },

  // 4. Monotonic Stack
  {
    id: 'monotonic-stack',
    title: 'Monotonic Stack (Next Greater Element / Span)',
    category: 'Stacks & Queues',
    tags: ['monotonic stack', 'next greater', 'temperatures', 'histogram', 'span'],
    coreMentalModel:
      'Store indices of unresolved elements in strictly monotonic order. A new element resolves and pops every weaker waiting element in amortized O(1).',
    invariantRule:
      'Every array index is pushed once and popped at most once -> guaranteed O(N) total operations.',
    complexity: { time: 'O(N)', space: 'O(N)' },
    visualSpec: {
      inputs: ['Unsorted Measurement Sequence'],
      processes: [
        'Inspect Current Value nums[i]',
        'Pop All Stack Top Indices Violating Monotonicity',
        'Resolve Distance (i - poppedIdx)',
        'Push Current Index i Onto Stack',
      ],
      dataStores: ['Monotonic Index Stack', 'Result Distance Array'],
      outputs: ['Next Greater Wait / Span Array'],
      decisionBranches: [
        {
          condition: 'stack.length > 0 && nums[i] > nums[stack.top]',
          truePath: 'Pop top index and record answer[top] = i - top',
          falsePath: 'Push index i and advance to i + 1',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'next-warmer-days',
        patternName: 'Decreasing Monotonic Index Stack',
        difficulty: 'MEDIUM',
        storyTemplates: ['Compute how many days until a strictly warmer temperature occurs.'],
        parameterRanges: { len: [6, 9] },
        edgeCaseInjectors: ['strictly_decreasing_tail', 'equal_plateau'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const len = seededInt(seed, 6, 8);
          const temps = Array.from({ length: len }, (_, i) => seededInt(seed + i * 13, 62, 85));
          const ans = new Array<number>(len).fill(0);
          const stack: number[] = [];
          for (let i = 0; i < len; i++) {
            while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
              const prev = stack.pop()!;
              ans[prev] = i - prev;
            }
            stack.push(i);
          }
          return {
            problemId: `mstack-${seed}`,
            conceptId: 'monotonic-stack',
            title: `Next Peak Wait Time #${seed}`,
            difficulty,
            statement: `Given daily readings temps = ${JSON.stringify(temps)}, return an array where answer[i] is the number of days to wait for a strictly higher reading (0 if none).`,
            constraints: [scaleLabel(difficulty), 'O(N) amortized time'],
            sampleInput: { temps },
            expectedOutput: ans,
            edgeCaseTag: 'equal_plateau',
            socraticSteps: [
              {
                step: 1,
                question: 'Why do we store INDICES instead of raw temperature values on the stack?',
                options: [
                  'Because we need i - poppedIndex to compute the exact wait distance and write into ans[poppedIndex].',
                  'Because integers cannot be stored in JavaScript arrays.',
                  'To enable binary search on the stack.',
                ],
                correctIndex: 0,
                hint: 'An index gives you both position (for distance) and value via temps[idx].',
              },
            ],
          };
        },
      },
    ],
  },

  // 5. Binary Search on Answer
  {
    id: 'binary-search-answer',
    title: 'Binary Search on Answer Space (Feasibility Predicate)',
    category: 'Searching & Optimization',
    tags: ['binary search', 'koko', 'capacity', 'predicate', 'monotonic boolean'],
    coreMentalModel:
      'Whenever feasible(X) flips cleanly from False..False to True..True over an answer range [lo..hi], binary search the boundary in O(log(Range) * check).',
    invariantRule:
      'Maintain lo <= answer <= hi: when feasible(mid) is true, keep mid (hi = mid); when false, discard mid (lo = mid + 1).',
    complexity: { time: 'O(N log(MaxVal))', space: 'O(1)' },
    visualSpec: {
      inputs: ['Workload Piles / Task Sizes', 'Deadline Hours H'],
      processes: [
        'Bound Answer Space [lo = 1, hi = max(piles)]',
        'Compute Overflow-Safe Midpoint lo + floor((hi-lo)/2)',
        'Run Greedy O(N) Feasibility Check feasible(mid)',
        'Halve Search Space Preserving First True',
      ],
      dataStores: ['Lower Bound lo', 'Upper Bound hi', 'Feasibility Hour Counter'],
      outputs: ['Minimum Feasible Rate K'],
      decisionBranches: [
        {
          condition: 'hoursNeeded(mid) <= H',
          truePath: 'hi = mid (record valid rate, try smaller)',
          falsePath: 'lo = mid + 1 (too slow, must speed up)',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'min-processing-rate',
        patternName: 'Lower-Bound Feasibility Binary Search',
        difficulty: 'MEDIUM',
        storyTemplates: ['Find the minimum batch throughput rate K to finish all queues within H hours.'],
        parameterRanges: { piles: [4, 6] },
        edgeCaseInjectors: ['tight_deadline_equals_n', 'ceiling_division_rounding'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const piles = Array.from({ length: 4 }, (_, i) => seededInt(seed + i * 5, 3, 18));
          const hours = seededInt(seed + 41, 5, 10);
          let lo = 1;
          let hi = Math.max(...piles);
          while (lo < hi) {
            const mid = lo + Math.floor((hi - lo) / 2);
            const needed = piles.reduce((acc, p) => acc + Math.ceil(p / mid), 0);
            if (needed <= hours) hi = mid;
            else lo = mid + 1;
          }
          return {
            problemId: `bsa-${seed}`,
            conceptId: 'binary-search-answer',
            title: `Minimum Ingestion Rate #${seed}`,
            difficulty,
            statement: `Given job batch sizes piles = ${JSON.stringify(piles)} and deadline H = ${hours} hours, find the minimum integer rate K (items/hour) to complete all batches in <= H hours.`,
            constraints: [scaleLabel(difficulty), 'Each batch takes ceil(pile / K) hours'],
            sampleInput: { piles, hours },
            expectedOutput: { minRateK: lo },
            edgeCaseTag: 'ceiling_division_rounding',
            socraticSteps: [
              {
                step: 1,
                question: 'When feasible(mid) returns TRUE, why do we set hi = mid instead of hi = mid - 1?',
                options: [
                  'Because mid itself could be the exact minimum valid rate; discarding it risks missing the answer.',
                  'Because hi must always stay odd.',
                  'To force an infinite loop check.',
                ],
                correctIndex: 0,
                hint: 'For lower-bound search, keep the known-good candidate inside [lo, hi].',
              },
            ],
          };
        },
      },
    ],
  },

  // 6. Recursion & Backtracking
  {
    id: 'recursion-backtracking',
    title: 'Recursion & Backtracking (Choose → Explore → Undo)',
    category: 'Recursion & Combinatorics',
    tags: ['recursion', 'backtracking', 'n-queens', 'subsets', 'call stack', 'pruning'],
    coreMentalModel:
      'Traverse an implicit decision tree depth-first. Mutate shared state before recursing, and symmetrically undo the exact mutation upon unwinding.',
    invariantRule:
      'Every recursive frame restores shared state cleanly before returning, bounding auxiliary stack memory to O(MaxDepth).',
    complexity: { time: 'O(Branching^Depth) pruned', space: 'O(Depth) Call Stack' },
    visualSpec: {
      inputs: ['Candidate Choices / Board Size N', 'Constraint Sets (Cols/Diags)'],
      processes: [
        'Check Base Case (Leaf / Target Reached)',
        'Filter Candidates via O(1) Pruning Guard',
        'Choose Candidate & Push Recursive Call Frame',
        'Unwind Frame & Undo State Mutation (Backtrack)',
      ],
      dataStores: ['LIFO Call Stack Frames', 'Current Path Buffer', 'Constraint HashSets'],
      outputs: ['All Valid Constraint-Satisfying Solutions'],
      decisionBranches: [
        {
          condition: 'Base Case Met (row === N or rem === 0)',
          truePath: 'Clone snapshot into results & return frame',
          falsePath: 'Iterate legal choices → recurse → pop undo',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'combination-sum-gen',
        patternName: 'Sorted Bound-Pruned Backtracking',
        difficulty: 'MEDIUM',
        storyTemplates: ['Find all unique combinations of candidates summing to target with unlimited reuse.'],
        parameterRanges: { target: [5, 8] },
        edgeCaseInjectors: ['sorted_early_break', 'avoid_duplicate_permutations'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const cands = [2, 3, seededInt(seed, 4, 6)].sort((a, b) => a - b);
          const uniqueCands = Array.from(new Set(cands));
          const target = seededInt(seed + 17, 5, 8);
          const results: number[][] = [];
          const path: number[] = [];
          const dfs = (start: number, rem: number) => {
            if (rem === 0) {
              results.push([...path]);
              return;
            }
            for (let i = start; i < uniqueCands.length; i++) {
              if (uniqueCands[i] > rem) break;
              path.push(uniqueCands[i]);
              dfs(i, rem - uniqueCands[i]);
              path.pop();
            }
          };
          dfs(0, target);
          return {
            problemId: `bt-${seed}`,
            conceptId: 'recursion-backtracking',
            title: `Pruned Combination Tree #${seed}`,
            difficulty,
            statement: `Given distinct candidates = ${JSON.stringify(uniqueCands)} and target = ${target}, return all unique combinations summing to target (same element may be reused).`,
            constraints: ['Order-independent combinations (no [2,3] & [3,2] duplicates)', 'Sort candidates for early pruning break'],
            sampleInput: { candidates: uniqueCands, target },
            expectedOutput: results,
            edgeCaseTag: 'avoid_duplicate_permutations',
            socraticSteps: [
              {
                step: 1,
                question: 'How do we prevent generating both [2, 3] and [3, 2] during backtracking?',
                options: [
                  'Pass startIndex = i into the recursive call so choices only move forward.',
                  'Run a HashSet over every permutation at the end.',
                  'Reverse the array on every call.',
                ],
                correctIndex: 0,
                hint: 'Restricting each child frame to indices >= i enforces canonical non-decreasing order.',
              },
            ],
          };
        },
      },
    ],
  },

  // 7. Divide & Conquer Sorting
  {
    id: 'divide-conquer-sorting',
    title: 'Divide & Conquer Sorting (Merge Sort / Quick Sort)',
    category: 'Sorting & Order Statistics',
    tags: ['merge sort', 'quick sort', 'sorting', 'inversions', 'partition', 'n log n'],
    coreMentalModel:
      'Split an O(N^2) comparison space recursively in half until trivial size-1 arrays, then merge or partition in linear O(N) work per level.',
    invariantRule:
      'Balanced recursion yields log2(N) levels × O(N) work per level = O(N log N) total comparisons.',
    complexity: { time: 'O(N log N)', space: 'O(N) Merge / O(log N) Quick' },
    visualSpec: {
      inputs: ['Unsorted Array'],
      processes: [
        'Divide Array at Midpoint / Pivot',
        'Recursively Sort Left & Right Partitions',
        'Linear Two-Pointer Merge (or Lomuto/Hoare Partition)',
        'Emit Stable Sorted Output',
      ],
      dataStores: ['Recursion Call Stack', 'Merge Auxiliary Buffer'],
      outputs: ['Sorted Array & Inversion Count'],
      decisionBranches: [
        {
          condition: 'left[i] <= right[j]',
          truePath: 'Emit left[i] (preserves stability, 0 inversions)',
          falsePath: 'Emit right[j] & count (left.length - i) inversions',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'merge-sort-inversions',
        patternName: 'Merge Sort Inversion Counting',
        difficulty: 'HARD',
        storyTemplates: ['Count the number of out-of-order pairs (i < j, a[i] > a[j]) while sorting.'],
        parameterRanges: { len: [5, 7] },
        edgeCaseInjectors: ['reverse_sorted_max_inversions', 'duplicates_stability'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const len = seededInt(seed, 5, 7);
          const arr = Array.from({ length: len }, (_, i) => seededInt(seed + i * 19, 1, 15));
          let inversions = 0;
          for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
              if (arr[i] > arr[j]) inversions++;
            }
          }
          const sorted = [...arr].sort((a, b) => a - b);
          return {
            problemId: `sort-${seed}`,
            conceptId: 'divide-conquer-sorting',
            title: `Inversion Count & Stable Sort #${seed}`,
            difficulty,
            statement: `Given ranking array arr = ${JSON.stringify(arr)}, return both the sorted array and the exact inversion count (pairs i < j where arr[i] > arr[j]) in O(N log N).`,
            constraints: [scaleLabel(difficulty), 'Use <= on left comparison to preserve stability'],
            sampleInput: { arr },
            expectedOutput: { sorted, inversions },
            edgeCaseTag: 'duplicates_stability',
            socraticSteps: [
              {
                step: 1,
                question: 'During Merge Sort, when right[j] < left[i], how many inversions are revealed immediately?',
                options: [
                  'All remaining elements in the left half: (left.length - i).',
                  'Exactly 1 inversion.',
                  'Zero inversions until the root merge.',
                ],
                correctIndex: 0,
                hint: 'Since left[] is already sorted, every element from left[i] onward is also strictly greater than right[j].',
              },
            ],
          };
        },
      },
    ],
  },

  // 8. LRU Cache (O(1) Hybrid DS)
  {
    id: 'lru-cache-o1',
    title: 'LRU Cache (HashMap + Doubly Linked List)',
    category: 'Design Data Structures',
    tags: ['lru cache', 'hashmap', 'doubly linked list', 'eviction', 'o(1)', 'system coding'],
    coreMentalModel:
      'Pair a HashMap (O(1) key -> node lookup) with a Doubly Linked List (O(1) splice-to-front and tail eviction using sentinel head/tail nodes).',
    invariantRule:
      'MRU sits right after sentinel head; LRU sits right before sentinel tail. Every get/put touches at most 6 pointer assignments.',
    complexity: { time: 'O(1) get & put', space: 'O(Capacity)' },
    visualSpec: {
      inputs: ['get(key) / put(key, val) API Calls', 'Fixed Cache Capacity C'],
      processes: [
        'Lookup Node Pointer in HashMap',
        'Detach Node & Splice Directly After Sentinel Head',
        'Insert New Node at Head on Miss',
        'Evict Sentinel Tail.prev When Size > Capacity',
      ],
      dataStores: ['Key -> Node HashMap', 'Sentinel Doubly Linked List'],
      outputs: ['Cached Value or -1 · Evicted Key'],
      decisionBranches: [
        {
          condition: 'map.size > capacity after put()',
          truePath: 'Remove tail.prev from DLL & delete its key from HashMap',
          falsePath: 'Maintain current nodes in O(1)',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'lru-trace-sim',
        patternName: 'O(1) Eviction Order Simulation',
        difficulty: 'MEDIUM',
        storyTemplates: ['Simulate an LRU Cache of capacity 2 over a sequence of get/put operations.'],
        parameterRanges: { cap: [2, 3] },
        edgeCaseInjectors: ['get_promotes_to_mru', 'update_existing_key_no_evict'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const cap = 2;
          const k1 = seededInt(seed, 1, 3);
          const k2 = k1 + 1;
          const k3 = k2 + 1;
          const ops: (['put', number, number] | ['get', number])[] = [
            ['put', k1, 10],
            ['put', k2, 20],
            ['get', k1],
            ['put', k3, 30],
            ['get', k2],
            ['get', k3],
          ];
          const cache = new Map<number, number>();
          const outputs: (number | null)[] = [];
          for (const op of ops) {
            if (op[0] === 'get') {
              const k = op[1];
              if (!cache.has(k)) {
                outputs.push(-1);
              } else {
                const v = cache.get(k)!;
                cache.delete(k);
                cache.set(k, v);
                outputs.push(v);
              }
            } else {
              const [, k, v] = op;
              if (cache.has(k)) cache.delete(k);
              cache.set(k, v);
              if (cache.size > cap) {
                const lruKey = cache.keys().next().value!;
                cache.delete(lruKey);
              }
              outputs.push(null);
            }
          }
          return {
            problemId: `lru-${seed}`,
            conceptId: 'lru-cache-o1',
            title: `LRU Cache Operation Trace #${seed}`,
            difficulty,
            statement: `Given LRU Cache with capacity = ${cap} and operations ${JSON.stringify(ops)}, compute the output vector (null for put, value or -1 for get).`,
            constraints: ['Both get() and put() must run in strict O(1) time'],
            sampleInput: { capacity: cap, operations: ops },
            expectedOutput: outputs,
            edgeCaseTag: 'get_promotes_to_mru',
            socraticSteps: [
              {
                step: 1,
                question: 'Why is a Singly Linked List insufficient for an O(1) LRU Cache?',
                options: [
                  'Detaching a middle node requires its prev pointer; without prev you must scan O(N) from head.',
                  'Singly linked lists cannot store integers.',
                  'Singly linked lists use more memory than arrays.',
                ],
                correctIndex: 0,
                hint: 'Doubly linked lists give O(1) node.prev.next = node.next without traversal.',
              },
            ],
          };
        },
      },
    ],
  },

  // 9. Balanced Two-Heap Streaming Median
  {
    id: 'two-heap-median',
    title: 'Balanced Two-Heap Streaming Median',
    category: 'Heaps & Priority Queues',
    tags: ['heap', 'priority queue', 'median', 'data stream', 'two heaps'],
    coreMentalModel:
      'Partition the stream into a lower Max-Heap and upper Min-Heap so the median always lives right at the two heap tops in O(1).',
    invariantRule:
      'Every element in lowerMaxHeap <= every element in upperMinHeap, and 0 <= |lower| - |upper| <= 1.',
    complexity: { time: 'O(log N) add · O(1) median', space: 'O(N)' },
    visualSpec: {
      inputs: ['Unbounded Numeric Data Stream'],
      processes: [
        'Push Incoming Value Into Lower Max-Heap',
        'Migrate Max of Lower Into Upper Min-Heap (Order Guard)',
        'Rebalance Sizes So |lower| >= |upper|',
        'Read Median Directly From Heap Tops',
      ],
      dataStores: ['Lower Half Max-Heap', 'Upper Half Min-Heap'],
      outputs: ['Exact Running Median'],
      decisionBranches: [
        {
          condition: '|lower| > |upper|',
          truePath: 'Median = lower.peek() (odd count)',
          falsePath: 'Median = (lower.peek() + upper.peek()) / 2',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'stream-median-gen',
        patternName: 'Two-Heap Running Median',
        difficulty: 'HARD',
        storyTemplates: ['Compute running median after each latency metric arrives in a stream.'],
        parameterRanges: { len: [5, 7] },
        edgeCaseInjectors: ['even_odd_alternation', 'decreasing_stream'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const stream = Array.from({ length: 5 }, (_, i) => seededInt(seed + i * 23, 1, 30));
          const sorted: number[] = [];
          const medians: number[] = [];
          for (const x of stream) {
            sorted.push(x);
            sorted.sort((a, b) => a - b);
            const m = sorted.length;
            const med =
              m % 2 === 1
                ? sorted[Math.floor(m / 2)]
                : Number(((sorted[m / 2 - 1] + sorted[m / 2]) / 2).toFixed(1));
            medians.push(med);
          }
          return {
            problemId: `heapmed-${seed}`,
            conceptId: 'two-heap-median',
            title: `Streaming P50 Latency #${seed}`,
            difficulty,
            statement: `Given latency stream = ${JSON.stringify(stream)}, compute the running median after each insertion using two balanced heaps.`,
            constraints: [scaleLabel(difficulty), 'O(log N) per addNum, O(1) per findMedian'],
            sampleInput: { stream },
            expectedOutput: medians,
            edgeCaseTag: 'even_odd_alternation',
            socraticSteps: [
              {
                step: 1,
                question: 'Why does the lower half use a MAX-Heap while the upper half uses a MIN-Heap?',
                options: [
                  'So the largest element of the lower half and smallest element of the upper half sit directly at peek() in O(1).',
                  'Because Min-Heaps cannot store duplicate values.',
                  'To sort the entire stream in O(N).',
                ],
                correctIndex: 0,
                hint: 'The median sits right at the boundary between the two halves!',
              },
            ],
          };
        },
      },
    ],
  },

  // 10. Trie Prefix Autocomplete
  {
    id: 'trie-autocomplete',
    title: 'Prefix Trie & Ranked Autocomplete Engine',
    category: 'Trees & Strings',
    tags: ['trie', 'prefix tree', 'autocomplete', 'search', 'dictionary'],
    coreMentalModel:
      'Factor shared string prefixes into shared tree edges so prefix lookup depends only on query length L—independent of dictionary size N.',
    invariantRule:
      'Walking L character edges lands on the exact root of all dictionary words sharing that L-character prefix in O(L) time.',
    complexity: { time: 'O(L) lookup', space: 'O(Total Chars)' },
    visualSpec: {
      inputs: ['Word Dictionary + Weights', 'User Keystroke Prefix'],
      processes: [
        'Insert Words & Maintain Top-K Hot Cache per Node',
        'Traverse Prefix Edges Character by Character',
        'Collect Terminal Matches in Subtree',
        'Return Top-K Ranked Suggestions',
      ],
      dataStores: ['26-Way / Map Trie Nodes', 'Node Top-K Cache'],
      outputs: ['Prefix-Matched Autocomplete Suggestions'],
      decisionBranches: [
        {
          condition: 'Current Character Edge Exists',
          truePath: 'Advance cursor = cursor.children[ch]',
          falsePath: 'Return [] immediately (no prefix match)',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'trie-prefix-count',
        patternName: 'Prefix Subtree Ranking',
        difficulty: 'MEDIUM',
        storyTemplates: ['Return top prefix matches sorted by frequency then lexicographical order.'],
        parameterRanges: { k: [2, 3] },
        edgeCaseInjectors: ['tie_break_lexicographical', 'missing_prefix'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const dict = [
            { word: 'system', freq: seededInt(seed, 5, 15) },
            { word: 'sync', freq: seededInt(seed + 1, 5, 15) },
            { word: 'syntax', freq: seededInt(seed + 2, 5, 15) },
            { word: 'search', freq: seededInt(seed + 3, 5, 15) },
            { word: 'server', freq: seededInt(seed + 4, 5, 15) },
          ];
          const prefix = seed % 2 === 0 ? 'sy' : 'se';
          const expected = dict
            .filter((d) => d.word.startsWith(prefix))
            .sort((a, b) => b.freq - a.freq || a.word.localeCompare(b.word))
            .map((d) => d.word);
          return {
            problemId: `trie-${seed}`,
            conceptId: 'trie-autocomplete',
            title: `Ranked Prefix Autocomplete #${seed}`,
            difficulty,
            statement: `Given weighted vocabulary ${JSON.stringify(dict)} and prefix "${prefix}", return matching words sorted by highest frequency (tie-break alphabetically).`,
            constraints: [scaleLabel(difficulty), 'O(L) prefix navigation'],
            sampleInput: { dict, prefix },
            expectedOutput: expected,
            edgeCaseTag: 'tie_break_lexicographical',
            socraticSteps: [
              {
                step: 1,
                question: 'How do production search bars avoid traversing an entire huge subtree on a 1-letter prefix like "s"?',
                options: [
                  'Pre-store the Top-K highest-weight completions directly on every Trie node during insertion.',
                  'Scan the entire database on every keystroke.',
                  'Delete all words starting with "s".',
                ],
                correctIndex: 0,
                hint: 'Caching Top-K at each node makes autocomplete O(L) even for single-letter prefixes.',
              },
            ],
          };
        },
      },
    ],
  },

  // 11. Dijkstra Shortest Path
  {
    id: 'dijkstra-shortest-path',
    title: "Dijkstra's Shortest Path (Min-Heap Relaxation)",
    category: 'Graphs & Routing',
    tags: ['dijkstra', 'shortest path', 'min-heap', 'weighted graph', 'routing'],
    coreMentalModel:
      'Greedily settle the unvisited vertex with the smallest tentative distance from the source, relaxing all outgoing non-negative edges.',
    invariantRule:
      'With strictly non-negative edge weights, the first time a node is popped from the Min-Heap, its distance is provably optimal.',
    complexity: { time: 'O((V + E) log V)', space: 'O(V + E)' },
    visualSpec: {
      inputs: ['Weighted Directed Graph (w >= 0)', 'Source Node S'],
      processes: [
        'Initialize dist[S] = 0, Others = Infinity',
        'Pop Minimum (d, u) From Priority Queue',
        'Skip Stale Entry if d > dist[u]',
        'Relax Neighbors: dist[u] + w < dist[v]',
      ],
      dataStores: ['Adjacency List', 'Distance Array dist[]', 'Min-Heap (dist, node)'],
      outputs: ['Shortest Distance Vector From Source S'],
      decisionBranches: [
        {
          condition: 'd > dist[u] (Stale Heap Entry)',
          truePath: 'Continue immediately (Lazy Deletion)',
          falsePath: 'Relax all outgoing neighbors (v, w) of u',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'dijkstra-latency-gen',
        patternName: 'Non-Negative Min-Heap Relaxation',
        difficulty: 'MEDIUM',
        storyTemplates: ['Compute minimum packet propagation latency from router 0 to all routers.'],
        parameterRanges: { nodes: [4, 5] },
        edgeCaseInjectors: ['stale_heap_entry', 'multi_hop_beats_direct_edge'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const w01 = seededInt(seed, 1, 4);
          const w12 = seededInt(seed + 1, 1, 4);
          const w02 = w01 + w12 + seededInt(seed + 2, 1, 4);
          const w23 = seededInt(seed + 3, 1, 5);
          const w13 = w12 + w23 + 2;
          const edges: [number, number, number][] = [
            [0, 1, w01],
            [0, 2, w02],
            [1, 2, w12],
            [2, 3, w23],
            [1, 3, w13],
          ];
          const dist = [0, Infinity, Infinity, Infinity];
          const adj: [number, number][][] = [[], [], [], []];
          for (const [u, v, w] of edges) adj[u].push([v, w]);
          const pq: [number, number][] = [[0, 0]];
          while (pq.length > 0) {
            pq.sort((a, b) => a[0] - b[0]);
            const [d, u] = pq.shift()!;
            if (d > dist[u]) continue;
            for (const [v, w] of adj[u]) {
              if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.push([dist[v], v]);
              }
            }
          }
          return {
            problemId: `dijk-${seed}`,
            conceptId: 'dijkstra-shortest-path',
            title: `Network Delay Relaxation #${seed}`,
            difficulty,
            statement: `Given 4 routers (0..3) and directed edges [u, v, weight] = ${JSON.stringify(edges)}, compute shortest distance array from source 0.`,
            constraints: [scaleLabel(difficulty), 'All edge weights >= 0'],
            sampleInput: { n: 4, source: 0, edges },
            expectedOutput: dist,
            edgeCaseTag: 'multi_hop_beats_direct_edge',
            socraticSteps: [
              {
                step: 1,
                question: 'Why does Dijkstra break if the graph contains negative edge weights?',
                options: [
                  'A later negative edge can reduce an already settled vertex’s distance, violating greedy optimality.',
                  'Min-Heaps cannot compare negative numbers.',
                  'Adjacency lists disallow negative weights.',
                ],
                correctIndex: 0,
                hint: 'For negative edges, switch to Bellman-Ford O(V*E).',
              },
            ],
          };
        },
      },
    ],
  },

  // 12. Kahn's Topological Sort
  {
    id: 'kahns-topological-sort',
    title: "Kahn's Topological Sort (DAG Indegree Queue)",
    category: 'Graphs & Scheduling',
    tags: ['topological sort', 'dag', 'course schedule', 'indegree', 'bfs', 'cycle detection'],
    coreMentalModel:
      'Repeatedly peel off vertices with zero unmet prerequisites (indegree === 0) via a FIFO Queue and decrement their dependents’ indegrees.',
    invariantRule:
      'A valid schedule exists if and only if processedCount === totalVertices (otherwise remaining nodes contain a directed cycle).',
    complexity: { time: 'O(V + E)', space: 'O(V + E)' },
    visualSpec: {
      inputs: ['Tasks V', 'Prerequisite Directed Edges [u -> v]'],
      processes: [
        'Build Adjacency List & Indegree Array',
        'Enqueue All Zero-Indegree Roots',
        'Pop Node u, Append to Order & Decrement Neighbor Indegrees',
        'Verify output.length === V for Cycle Detection',
      ],
      dataStores: ['Adjacency List', 'Indegree Counter Array', 'Zero-Indegree FIFO Queue'],
      outputs: ['Valid Topological Order or Cycle Detected'],
      decisionBranches: [
        {
          condition: 'indegree[neighbor] === 0 after decrement',
          truePath: 'Enqueue neighbor (all prerequisites satisfied)',
          falsePath: 'Wait for remaining incoming edges',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'kahn-dag-order',
        patternName: 'Zero-Indegree Peeling',
        difficulty: 'MEDIUM',
        storyTemplates: ['Determine build order for microservice modules with dependency edges.'],
        parameterRanges: { nodes: [4, 5] },
        edgeCaseInjectors: ['diamond_dependency', 'directed_cycle'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const hasCycle = seed % 3 === 0;
          const edges: [number, number][] = hasCycle
            ? [
                [0, 1],
                [1, 2],
                [2, 1],
                [0, 3],
              ]
            : [
                [0, 1],
                [0, 2],
                [1, 3],
                [2, 3],
              ];
          const indeg = [0, 0, 0, 0];
          const adj: number[][] = [[], [], [], []];
          for (const [u, v] of edges) {
            adj[u].push(v);
            indeg[v]++;
          }
          const q: number[] = [];
          for (let i = 0; i < 4; i++) if (indeg[i] === 0) q.push(i);
          const order: number[] = [];
          while (q.length > 0) {
            const u = q.shift()!;
            order.push(u);
            for (const v of adj[u]) {
              indeg[v]--;
              if (indeg[v] === 0) q.push(v);
            }
          }
          return {
            problemId: `topo-${seed}`,
            conceptId: 'kahns-topological-sort',
            title: `Service Build Schedule #${seed}`,
            difficulty,
            statement: `Given 4 services (0..3) and directed prerequisite edges [prereq, service] = ${JSON.stringify(edges)}, determine whether a valid build order exists and return the Kahn BFS order (or [] if cyclic).`,
            constraints: [scaleLabel(difficulty), 'O(V + E) linear time'],
            sampleInput: { n: 4, edges },
            expectedOutput: { canFinish: order.length === 4, order: order.length === 4 ? order : [] },
            edgeCaseTag: hasCycle ? 'directed_cycle' : 'diamond_dependency',
            socraticSteps: [
              {
                step: 1,
                question: 'How does Kahn’s Algorithm detect a cycle without keeping a separate 3-color DFS array?',
                options: [
                  'Nodes inside a cycle never reach indegree === 0, so final order.length < V.',
                  'The queue throws a stack overflow.',
                  'Indegree becomes negative.',
                ],
                correctIndex: 0,
                hint: 'Every vertex in a directed cycle waits on another vertex in that cycle forever.',
              },
            ],
          };
        },
      },
    ],
  },

  // 13. Union-Find (DSU)
  {
    id: 'union-find-dsu',
    title: 'Disjoint Set Union (Path Compression + Union by Rank)',
    category: 'Graphs & Connectivity',
    tags: ['union find', 'dsu', 'connected components', 'kruskal', 'accounts merge'],
    coreMentalModel:
      'Maintain dynamic equivalence classes with parent pointers; flatten trees on every find() and attach smaller rank under larger rank.',
    invariantRule:
      'Path Compression + Union by Rank yields amortized O(α(N)) ≈ O(1) connectivity queries and merges.',
    complexity: { time: 'O(E · α(V))', space: 'O(V)' },
    visualSpec: {
      inputs: ['Node Count V', 'Undirected Edge / Merge Stream'],
      processes: [
        'Initialize parent[i] = i, rank[i] = 0',
        'Execute find(x) With Recursive Path Compression',
        'Compare Roots rootX vs rootY',
        'Union Smaller Rank Tree Under Larger Root',
      ],
      dataStores: ['Parent Pointer Array', 'Tree Rank / Size Array', 'Component Counter'],
      outputs: ['Connected Component Count & Cycle Flag'],
      decisionBranches: [
        {
          condition: 'find(u) === find(v)',
          truePath: 'Redundant edge detected (forms a cycle!)',
          falsePath: 'Merge roots and decrement componentCount',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'dsu-components-gen',
        patternName: 'Dynamic Connectivity & Redundant Edge',
        difficulty: 'MEDIUM',
        storyTemplates: ['Track cluster count and detect the first redundant connection in a network.'],
        parameterRanges: { n: [5, 6] },
        edgeCaseInjectors: ['cycle_edge_detection', 'isolated_vertex'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const n = 5;
          const edges: [number, number][] = [
            [0, 1],
            [1, 2],
            [3, 4],
            seed % 2 === 0 ? [0, 2] : [2, 3],
          ];
          const parent = Array.from({ length: n }, (_, i) => i);
          const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
          let components = n;
          let redundantEdge: [number, number] | null = null;
          for (const [u, v] of edges) {
            const ru = find(u);
            const rv = find(v);
            if (ru === rv) {
              redundantEdge = [u, v];
            } else {
              parent[ru] = rv;
              components--;
            }
          }
          return {
            problemId: `dsu-${seed}`,
            conceptId: 'union-find-dsu',
            title: `Cluster Merge & Cycle Guard #${seed}`,
            difficulty,
            statement: `Given ${n} servers (0..${n - 1}) and links ${JSON.stringify(edges)}, compute the final connected component count and identify any redundant cycle-forming edge.`,
            constraints: [scaleLabel(difficulty), 'Use path compression + union by rank'],
            sampleInput: { n, edges },
            expectedOutput: { components, redundantEdge },
            edgeCaseTag: redundantEdge ? 'cycle_edge_detection' : 'bridge_merge',
            socraticSteps: [
              {
                step: 1,
                question: 'Why must you combine Path Compression AND Union by Rank/Size?',
                options: [
                  'Together they keep tree heights near-constant, achieving amortized O(α(N)) inverse-Ackermann time.',
                  'To support deleting edges in O(1).',
                  'To convert undirected edges into directed paths.',
                ],
                correctIndex: 0,
                hint: 'Path compression flattens queried branches directly to the root.',
              },
            ],
          };
        },
      },
    ],
  },

  // 14. Dynamic Programming (Tabulation)
  {
    id: 'dynamic-programming-tabulation',
    title: 'Dynamic Programming (Optimal Substructure + Tabulation)',
    category: 'Dynamic Programming',
    tags: ['dp', 'coin change', 'knapsack', 'memoization', 'tabulation', 'recurrence'],
    coreMentalModel:
      'Identify overlapping subproblems, define a minimal state dp[state], seed base cases, and fill in strict topological order.',
    invariantRule:
      'Every subproblem state is solved exactly once, collapsing exponential O(C^A) recursion trees into polynomial O(A * C) table transitions.',
    complexity: { time: 'O(Amount · Coins)', space: 'O(Amount)' },
    visualSpec: {
      inputs: ['Coin Denominations', 'Target Amount A'],
      processes: [
        'Initialize dp[0] = 0, dp[1..A] = Infinity',
        'Iterate Sub-Amounts a = 1..A',
        'Transition dp[a] = min(dp[a], 1 + dp[a - coin])',
        'Read Final Answer dp[A] (or -1 if Infinity)',
      ],
      dataStores: ['1D DP State Table dp[0..A]'],
      outputs: ['Minimum Coins Required'],
      decisionBranches: [
        {
          condition: 'a - coin >= 0 && dp[a - coin] + 1 < dp[a]',
          truePath: 'Relax dp[a] = dp[a - coin] + 1',
          falsePath: 'Keep current optimal value dp[a]',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'coin-change-dp-gen',
        patternName: 'Unbounded Min-Cost Tabulation',
        difficulty: 'MEDIUM',
        storyTemplates: ['Compute minimum coins to make exact change when greedy fails.'],
        parameterRanges: { amount: [6, 12] },
        edgeCaseInjectors: ['greedy_counterexample_1_3_4', 'unreachable_amount'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const coins = seed % 2 === 0 ? [1, 3, 4] : [2, 5, 7];
          const amount = seededInt(seed + 5, 6, 11);
          const dp = new Array<number>(amount + 1).fill(Infinity);
          dp[0] = 0;
          for (let a = 1; a <= amount; a++) {
            for (const c of coins) {
              if (a - c >= 0 && dp[a - c] + 1 < dp[a]) {
                dp[a] = dp[a - c] + 1;
              }
            }
          }
          const ans = dp[amount] === Infinity ? -1 : dp[amount];
          return {
            problemId: `dp-${seed}`,
            conceptId: 'dynamic-programming-tabulation',
            title: `Optimal Coin Tabulation #${seed}`,
            difficulty,
            statement: `Given coin denominations coins = ${JSON.stringify(coins)} and target amount = ${amount}, return the fewest coins needed (or -1 if impossible).`,
            constraints: [scaleLabel(difficulty), 'Unlimited supply per coin denomination'],
            sampleInput: { coins, amount },
            expectedOutput: { minCoins: ans },
            edgeCaseTag: 'greedy_counterexample_1_3_4',
            socraticSteps: [
              {
                step: 1,
                question: 'With coins = [1, 3, 4] and amount = 6, why does Greedy fail?',
                options: [
                  'Greedy picks 4 + 1 + 1 (3 coins), missing the globally optimal 3 + 3 (2 coins).',
                  'Greedy enters an infinite loop.',
                  'Greedy requires sorted negative coins.',
                ],
                correctIndex: 0,
                hint: 'Local greedy choices do not guarantee global optimality for arbitrary coin systems.',
              },
            ],
          };
        },
      },
    ],
  },

  // 15. Consistent Hashing Ring
  {
    id: 'consistent-hashing-ring',
    title: 'Consistent Hashing Ring (Virtual Nodes & Bounded Rebalance)',
    category: 'System Design & Distributed Algorithms',
    tags: ['consistent hashing', 'sharding', 'load balancer', 'virtual nodes', 'binary search', 'ring'],
    coreMentalModel:
      'Map both servers (with V virtual replicas) and keys onto a circular hash ring [0..2^32-1]. Route each key clockwise to the first virtual node via Binary Search.',
    invariantRule:
      'Adding or removing 1 node remaps only ~K/N keys on average instead of nearly 100% under naive hash(key) % N.',
    complexity: { time: 'O(log(N · V)) route', space: 'O(N · V)' },
    visualSpec: {
      inputs: ['Incoming Request Key', 'Cluster Shard Topology + Virtual Node Factor V'],
      processes: [
        'Hash Each Server Replica Onto Ring [0..M-1]',
        'Sort Ring Token Positions in Contiguous Array',
        'Hash Incoming Request Key → keyToken',
        'Binary Search First Ring Token >= keyToken (Wrap to Index 0)',
      ],
      dataStores: ['Sorted Ring Token Array', 'Token -> Physical Node Map'],
      outputs: ['Target Physical Shard & Minimal Rebalance Delta'],
      decisionBranches: [
        {
          condition: 'Binary Search Finds Token >= keyToken',
          truePath: 'Route request to ring[idx].physicalNode',
          falsePath: 'Wrap clockwise around 0 to ring[0].physicalNode',
        },
      ],
    },
    problemGenerators: [
      {
        blueprintId: 'consistent-ring-routing',
        patternName: 'Clockwise Binary Search on Sorted Ring',
        difficulty: 'SYSTEM_SCALE',
        storyTemplates: ['Route keys onto a sorted hash ring and compute clockwise wrap-around assignment.'],
        parameterRanges: { keys: [3, 5] },
        edgeCaseInjectors: ['clockwise_wrap_to_index_0', 'exact_token_collision'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const ring = [
            { token: 12, node: 'shard-A' },
            { token: 38, node: 'shard-B' },
            { token: 74, node: 'shard-C' },
            { token: 91, node: 'shard-A' },
          ];
          const keyTokens = [
            seededInt(seed, 1, 20),
            seededInt(seed + 1, 35, 65),
            seededInt(seed + 2, 92, 99),
          ];
          const routing = keyTokens.map((kt) => {
            const match = ring.find((r) => r.token >= kt) ?? ring[0];
            return { keyToken: kt, assignedShard: match.node, wrapped: kt > ring[ring.length - 1].token };
          });
          return {
            problemId: `chash-${seed}`,
            conceptId: 'consistent-hashing-ring',
            title: `Consistent Hash Ring Routing #${seed}`,
            difficulty,
            statement: `Given sorted ring tokens ${JSON.stringify(ring)} on ring [0..99], determine the clockwise assigned physical shard for hashed keys ${JSON.stringify(keyTokens)}.`,
            constraints: ['O(log R) clockwise binary search per lookup', 'Wrap to ring[0] if keyToken > maxToken'],
            sampleInput: { ring, keyTokens },
            expectedOutput: routing,
            edgeCaseTag: 'clockwise_wrap_to_index_0',
            socraticSteps: [
              {
                step: 1,
                question: 'Why do production distributed caches (Dynamo, Cassandra, Redis Cluster) place multiple Virtual Nodes per physical server?',
                options: [
                  'To smooth out uneven hash gaps and prevent hot-spot skew across physical shards.',
                  'To increase the number of keys remapped during scaling.',
                  'To replace TCP with UDP.',
                ],
                correctIndex: 0,
                hint: 'With only 1 token per server, random hashing can leave one server owning 60% of the ring.',
              },
            ],
          };
        },
      },
    ],
  },
];
