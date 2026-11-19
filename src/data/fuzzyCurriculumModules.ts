export interface ModuleSectionSpec {
  code: string;
  title: string;
  concepts: string[];
  dsaPattern: string;
}

export interface ModuleRealWorldProblem {
  title: string;
  companyContext: string;
  prompt: string;
  constraints: string[];
  solutionWalkthrough: string[];
  complexity: string;
}

export interface ModuleCodingExercise {
  title: string;
  functionName: string;
  prompt: string;
  starterCode: string;
  solutionCode: string;
  testCases: {
    label: string;
    args: unknown[];
    expected: unknown;
  }[];
}

export interface ModuleLinkedProblem {
  slug: string;
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  whyLinked: string;
}

export interface ModuleStudioLink {
  label: string;
  type: 'algorithm' | 'ngram' | 'architecture' | 'pruning-sim' | 'case-study';
  targetId: string;
}

export interface FuzzyCurriculumModule {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  stageTag: string;
  goal: string;
  sections: ModuleSectionSpec[];
  milestoneSummary: string;
  realWorldProblem: ModuleRealWorldProblem;
  exercise: ModuleCodingExercise;
  linkedProblems: ModuleLinkedProblem[];
  studioLinks: ModuleStudioLink[];
}

export const FUZZY_CURRICULUM_MODULES: FuzzyCurriculumModule[] = [
  // =========================================================================
  // MODULE 1
  // =========================================================================
  {
    id: 'mod-1-foundations',
    number: 1,
    title: 'Module 1: String Foundations & Exact Matching',
    shortTitle: '1. String Foundations',
    stageTag: 'Core Primitives',
    goal: 'Master the core data structures needed to slice, hash, and store text efficiently.',
    sections: [
      {
        code: '1.1',
        title: 'Sliding Window & Substring Extraction',
        concepts: [
          'Fixed-size sliding windows over character arrays',
          'Boundary padding ("  cat  ") to protect edge characters',
          'ASCII/UTF-8 normalization and deterministic case-folding',
        ],
        dsaPattern: 'Two-Pointer / Sliding Window over Arrays',
      },
      {
        code: '1.2',
        title: 'Hashing & Set Operations',
        concepts: [
          'Polynomial rolling hashes (Rabin-Karp) for O(1) window shifts',
          'Bitmasks for O(1) character-presence filtering',
          'Fast hash-set intersection and union without quadratic scans',
        ],
        dsaPattern: 'Hash Maps, Hash Sets & Bit Manipulation',
      },
      {
        code: '1.3',
        title: 'Prefix Trees (Tries)',
        concepts: [
          'Standard character Trie for O(P) prefix navigation',
          'Radix Tree (compressed trie) collapsing single-child chains',
          'Prefix frequency tracking and subtree top-k aggregation',
        ],
        dsaPattern: 'N-ary Trees & DFS Traversal',
      },
    ],
    milestoneSummary:
      'Build an exact-match prefix autocomplete engine using a Trie that returns the top 5 most frequent completions for a prefix.',
    realWorldProblem: {
      title: 'Instant Command-Palette & Search-Bar Prefix Autocomplete',
      companyContext: 'Google Search · GitHub Command Palette · VS Code Symbol Picker',
      prompt:
        'Design an in-memory autocomplete dictionary storing 500,000 query strings with historical popularity counts. On every keystroke (prefix length P), return the top 5 most frequent completions in under 2 ms.',
      constraints: [
        'Case-insensitive normalization ("App" matches "apple")',
        'Tie-breaking: higher frequency first, then lexicographical A→Z order',
        'Query latency must depend on prefix length P, never on total dictionary size N',
      ],
      solutionWalkthrough: [
        'Insert each lowercased word into a Trie, storing frequency at terminal nodes (and optionally caching top-5 hot completions at every node for O(P) reads).',
        'On query(prefix), walk down the Trie in O(P) character steps; if any edge is missing, return [] immediately.',
        'DFS the matched subtree to collect (word, freq) completions, sort by descending frequency then lexicographically, and slice top K.',
      ],
      complexity: 'Insert O(L) · Query O(P + S log S) (or O(P) with cached node top-5) · Space O(N · L)',
    },
    exercise: {
      title: 'Milestone 1: Trie Top-K Prefix Autocomplete Engine',
      functionName: 'prefixAutocomplete',
      prompt:
        'Implement prefixAutocomplete(entries, prefix, k = 5) where entries is an array of [word, freq] tuples. Build a Trie, match all case-insensitive completions starting with prefix, and return up to k words sorted by highest freq (ties broken alphabetically).',
      starterCode: `function prefixAutocomplete(entries, prefix, k = 5) {
  // 1. Build a Trie storing freq at each terminal node
  const root = { children: new Map(), freq: 0, word: null };
  // 2. Walk to the node matching prefix.toLowerCase()
  // 3. DFS the subtree, sort by freq desc then word asc, return top k words
  return [];
}`,
      solutionCode: `function prefixAutocomplete(entries, prefix, k = 5) {
  const root = { children: new Map(), freq: 0, word: null };
  for (const [rawWord, freq] of entries) {
    const word = String(rawWord).toLowerCase();
    let node = root;
    for (const ch of word) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), freq: 0, word: null });
      }
      node = node.children.get(ch);
    }
    node.word = word;
    node.freq += freq;
  }

  let cur = root;
  for (const ch of String(prefix).toLowerCase()) {
    if (!cur.children.has(ch)) return [];
    cur = cur.children.get(ch);
  }

  const hits = [];
  const dfs = (node) => {
    if (node.word !== null) hits.push([node.word, node.freq]);
    for (const child of node.children.values()) dfs(child);
  };
  dfs(cur);

  hits.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return hits.slice(0, k).map((x) => x[0]);
}`,
      testCases: [
        {
          label: 'Top-3 frequency ranking with tie-break',
          args: [
            [
              ['apple', 50],
              ['application', 80],
              ['apply', 50],
              ['appstore', 30],
              ['banana', 99],
            ],
            'App',
            3,
          ],
          expected: ['application', 'apple', 'apply'],
        },
        {
          label: 'Missing prefix returns empty array',
          args: [
            [
              ['iphone', 40],
              ['ipad', 35],
            ],
            'mac',
            5,
          ],
          expected: [],
        },
        {
          label: 'Accumulates duplicate entries cleanly',
          args: [
            [
              ['cat', 10],
              ['car', 15],
              ['cat', 10],
            ],
            'ca',
            2,
          ],
          expected: ['cat', 'car'],
        },
      ],
    },
    linkedProblems: [
      {
        slug: 'implement-trie',
        number: 208,
        title: 'Implement Trie (Prefix Tree)',
        difficulty: 'Medium',
        whyLinked: 'Core character-indexed N-ary tree powering O(P) prefix lookup.',
      },
      {
        slug: 'word-search-ii',
        number: 212,
        title: 'Word Search II',
        difficulty: 'Hard',
        whyLinked: 'Combines Trie prefix pruning with DFS traversal across state spaces.',
      },
      {
        slug: 'longest-substring-without-repeating',
        number: 3,
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        whyLinked: 'Builds core sliding-window + hash-map muscle for substring extraction.',
      },
    ],
    studioLinks: [
      { label: 'Sliding Window Animation', type: 'algorithm', targetId: 'sliding-window' },
      { label: 'KMP / Rabin-Karp Rolling Hash', type: 'algorithm', targetId: 'kmp-rabin-karp' },
      { label: 'NG-Tree / Q-Gram Trie', type: 'ngram', targetId: 'ng-tree-trie' },
    ],
  },

  // =========================================================================
  // MODULE 2
  // =========================================================================
  {
    id: 'mod-2-tokenization',
    number: 2,
    title: 'Module 2: N-Gram Tokenization & Set Similarity',
    shortTitle: '2. N-Grams & Similarity',
    stageTag: 'The Fuzzy Core',
    goal: 'Convert messy text into mathematical sets so you can measure similarity without slow character-by-character DP.',
    sections: [
      {
        code: '2.1',
        title: 'N-Gram Slicing Algorithms',
        concepts: [
          'Character N-Grams: Bigrams (n=2) vs Trigrams (n=3) trade-offs',
          'Padded N-Grams: Adding n-1 boundary markers so edge typos are weighted equally',
          'Edge N-Grams ("p", "ph", "pho") for instant search-as-you-type',
          'K-Skip-N-Grams & Word Shingles for insertions and phrase dedup',
        ],
        dsaPattern: 'Sliding Window + Boundary Framing',
      },
      {
        code: '2.2',
        title: 'Mathematical Similarity Formulas',
        concepts: [
          'Jaccard Similarity: |A ∩ B| / |A ∪ B| (standard metric overlap)',
          'Sørensen–Dice Coefficient: 2|A ∩ B| / (|A| + |B|) (harmonic overlap)',
          'Overlap & Tversky (α, β) for asymmetric partial-query scoring',
          'TF-IDF Weighted Cosine Similarity emphasizing rare n-grams ("qz") over common ones ("ing")',
        ],
        dsaPattern: 'Set Theory, Sparse Vectors & Frequency Maps',
      },
    ],
    milestoneSummary:
      'Write a standalone library that takes two strings, generates padded trigrams, and outputs Jaccard, Dice, and Cosine similarity scores.',
    realWorldProblem: {
      title: 'CRM Duplicate Company & Address Matcher',
      companyContext: 'Salesforce · Stripe KYC · PostgreSQL pg_trgm',
      prompt:
        'Two enterprise vendor records arrive as "Stripe Payments Inc" and "Strpe Paymnts Inc". Compute typo-resilient similarity scores in O(|A| + |B|) linear time without running quadratic character DP.',
      constraints: [
        'Handle typos at word boundaries ("_st" / "nc_") fairly via boundary padding',
        'Return bounded [0.0, 1.0] scores across Jaccard, Sørensen–Dice, and Binary Cosine',
        'Must run in strictly linear O(|A| + |B|) time per pair',
      ],
      solutionWalkthrough: [
        'Normalize strings (trim + lowercase) and pad both ends with n-1 = 2 sentinel underscores ("__").',
        'Slide a length-3 window to extract unique trigram sets A and B in O(|A| + |B|).',
        'Compute |A ∩ B| via a single pass over set A probing set B, then derive Jaccard, Dice, and Cosine in O(1) arithmetic.',
      ],
      complexity: 'Time O(|A| + |B|) · Space O(|A| + |B|)',
    },
    exercise: {
      title: 'Milestone 2: Padded Trigram Multi-Metric Similarity Library',
      functionName: 'computeNgramSimilarities',
      prompt:
        'Implement computeNgramSimilarities(a, b, n = 3). Normalize both strings (trim + lowercase), pad with "_".repeat(n - 1) on both sides, build unique n-gram sets, and return { jaccard, dice, cosine } rounded to 4 decimal places.',
      starterCode: `function computeNgramSimilarities(a, b, n = 3) {
  // 1. Helper: trim, lowercase, pad both sides with "_".repeat(n - 1), slice length-n grams into a Set
  // 2. Count intersection |A ∩ B| and union |A| + |B| - inter
  // 3. Return { jaccard, dice, cosine } rounded via Number(x.toFixed(4))
  return { jaccard: 0, dice: 0, cosine: 0 };
}`,
      solutionCode: `function computeNgramSimilarities(a, b, n = 3) {
  const toSet = (raw) => {
    const pad = '_'.repeat(n - 1);
    const s = pad + String(raw).trim().toLowerCase() + pad;
    const set = new Set();
    for (let i = 0; i <= s.length - n; i++) set.add(s.slice(i, i + n));
    return set;
  };

  const setA = toSet(a);
  const setB = toSet(b);
  let inter = 0;
  for (const g of setA) if (setB.has(g)) inter++;
  const union = setA.size + setB.size - inter;

  const r4 = (v) => Number(v.toFixed(4));
  const jaccard = union === 0 ? 1 : inter / union;
  const dice = setA.size + setB.size === 0 ? 1 : (2 * inter) / (setA.size + setB.size);
  const cosine = setA.size === 0 || setB.size === 0 ? 0 : inter / Math.sqrt(setA.size * setB.size);

  return { jaccard: r4(jaccard), dice: r4(dice), cosine: r4(cosine) };
}`,
      testCases: [
        {
          label: 'Identical strings score 1.0 across all metrics',
          args: ['Algorithm', 'algorithm', 3],
          expected: { jaccard: 1, dice: 1, cosine: 1 },
        },
        {
          label: 'Single-char deletion ("algorithm" vs "algoritm")',
          args: ['algorithm', 'algoritm', 3],
          expected: { jaccard: 0.6154, dice: 0.7619, cosine: 0.7628 },
        },
        {
          label: 'Completely disjoint strings share zero interior trigrams',
          args: ['abc', 'xyz', 3],
          expected: { jaccard: 0, dice: 0, cosine: 0 },
        },
      ],
    },
    linkedProblems: [
      {
        slug: 'two-sum',
        number: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        whyLinked: 'Canonical O(1) hash lookup eliminating quadratic pair comparisons.',
      },
      {
        slug: 'minimum-window-substring',
        number: 76,
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        whyLinked: 'Deep mastery of frequency maps and substring overlap invariants.',
      },
      {
        slug: 'subarray-sum-equals-k',
        number: 560,
        title: 'Subarray Sum Equals K',
        difficulty: 'Medium',
        whyLinked: 'Accumulating frequency signatures in hash tables in a single linear pass.',
      },
    ],
    studioLinks: [
      { label: 'Padded N-Grams Visualizer', type: 'ngram', targetId: 'padded-ngrams' },
      { label: 'All 12 Similarity Metrics Lab', type: 'ngram', targetId: 'jaccard-similarity' },
      { label: 'Tversky α/β Interactive Sliders', type: 'ngram', targetId: 'tversky-index' },
    ],
  },

  // =========================================================================
  // MODULE 3
  // =========================================================================
  {
    id: 'mod-3-candidate-gen',
    number: 3,
    title: 'Module 3: Candidate Generation (Stage 1 — High Recall)',
    shortTitle: '3. Candidate Retrieval',
    stageTag: 'Stage 1 · High Recall',
    goal: 'Retrieve the top 500–1,000 plausible candidates from 10M+ records in under 10 milliseconds.',
    sections: [
      {
        code: '3.1',
        title: 'Inverted Index & Posting List Compression',
        concepts: [
          'Inverted map: unique n-gram → sorted docID[] posting list',
          'Delta (gap) encoding + Variable-Byte compression for RAM density',
          'Roaring Bitmaps for hardware-accelerated bitwise posting intersections',
        ],
        dsaPattern: 'Hash Maps, Sorted Arrays & Bit Manipulation',
      },
      {
        code: '3.2',
        title: 'Posting List Merging & Dynamic Pruning',
        concepts: [
          'Term-at-a-Time (TAAT) hash accumulation vs Document-at-a-Time (DAAT) k-way merge',
          'WAND & Block-Max WAND jumping past 128-doc blocks that cannot beat top-k θ',
        ],
        dsaPattern: 'K-Way Merge & Bounded Min-Heap',
      },
      {
        code: '3.3',
        title: 'Mathematical Candidate Pruning (O(1) Speedups)',
        concepts: [
          'Length Filtering: skip |D| < ceil(t·|Q|) or |D| > floor(|Q|/t)',
          'Count Filtering: require shared >= ceil((t/(1+t))·(|Q|+|D|))',
          'Prefix Filtering (AllPairs / PPJoin): probe only rarest IDF prefix lists',
        ],
        dsaPattern: 'Mathematical Bounds & Binary Search',
      },
      {
        code: '3.4',
        title: 'Probabilistic & Deletion-Based Indexes',
        concepts: [
          'SymSpell: pre-generating k-deletion keys for microsecond edit-distance lookup',
          'MinHash + LSH Banding: sublinear O(N·b) nearest-neighbor retrieval',
          'BK-Trees: triangle-inequality metric pruning [d - k, d + k]',
        ],
        dsaPattern: 'Hashing, Metric Trees & Sketching',
      },
    ],
    milestoneSummary:
      'Build an in-memory inverted trigram index with O(1) length filtering and top-K selection to retrieve ranked candidates without full scans.',
    realWorldProblem: {
      title: '10M Product Catalog < 15 ms Candidate Generator',
      companyContext: 'Amazon · Shopify · Apache Lucene / Elasticsearch',
      prompt:
        'Index product titles into an inverted padded-trigram posting list with cached |D| lengths. Given query, Jaccard threshold t, and limit k, prune impossible lengths in O(1), accumulate posting overlaps, and return top k product IDs.',
      constraints: [
        'Must skip any doc outside [ceil(t·|Q|), floor(|Q|/t)] before computing Jaccard',
        'Tie-breaking: higher Jaccard score → shorter title length → smaller product_id',
        'Never scan documents that share zero trigrams with the query',
      ],
      solutionWalkthrough: [
        'At index time, slice each title into unique padded trigrams, push docId into postings[gram], and cache docGramCount[id] = |D|.',
        'At search time, compute O(1) length bracket [minD, maxD] from |Q| and threshold.',
        'Traverse posting lists only for query trigrams, skip docIds outside [minD, maxD], accumulate |Q ∩ D|, compute O(1) Jaccard, and keep top k.',
      ],
      complexity: 'Index O(L) · Search O(Σ|Postings(g)| + C log k) · Space O(N · L)',
    },
    exercise: {
      title: 'Milestone 3: Inverted Trigram Index + Length Filter + Top-K',
      functionName: 'searchInvertedTrigramIndex',
      prompt:
        'Implement searchInvertedTrigramIndex(catalog, query, threshold, k). Catalog items are { id, title }. Build an inverted padded-trigram index, apply O(1) length filtering, accumulate overlap counts, filter by Jaccard >= threshold, and return top k product IDs (tie-break: score desc, title.length asc, id asc).',
      starterCode: `function searchInvertedTrigramIndex(catalog, query, threshold, k) {
  // 1. Extract unique padded trigrams ("__" + s + "__")
  // 2. Build inverted posting lists: gram -> [docId, ...] and store |D| per doc
  // 3. Apply O(1) length bounds [Math.ceil(threshold * |Q|), Math.floor(|Q| / threshold)]
  // 4. Accumulate |Q ∩ D| from postings, score Jaccard >= threshold, return top k IDs
  return [];
}`,
      solutionCode: `function searchInvertedTrigramIndex(catalog, query, threshold, k) {
  const gramsOf = (raw) => {
    const s = '__' + String(raw).trim().toLowerCase() + '__';
    const set = new Set();
    for (let i = 0; i <= s.length - 3; i++) set.add(s.slice(i, i + 3));
    return set;
  };

  const postings = new Map();
  const docMeta = new Map();
  for (const item of catalog) {
    const gSet = gramsOf(item.title);
    docMeta.set(item.id, { len: gSet.size, titleLen: item.title.length });
    for (const g of gSet) {
      if (!postings.has(g)) postings.set(g, []);
      postings.get(g).push(item.id);
    }
  }

  const qSet = gramsOf(query);
  const qLen = qSet.size;
  const minD = Math.ceil(threshold * qLen);
  const maxD = threshold > 0 ? Math.floor(qLen / threshold) : Infinity;

  const overlaps = new Map();
  for (const g of qSet) {
    const list = postings.get(g);
    if (!list) continue;
    for (const docId of list) {
      const meta = docMeta.get(docId);
      if (meta.len < minD || meta.len > maxD) continue;
      overlaps.set(docId, (overlaps.get(docId) ?? 0) + 1);
    }
  }

  const scored = [];
  for (const [docId, inter] of overlaps.entries()) {
    const meta = docMeta.get(docId);
    const jaccard = inter / (qLen + meta.len - inter);
    if (jaccard >= threshold) {
      scored.push({ id: docId, score: jaccard, titleLen: meta.titleLen });
    }
  }

  scored.sort(
    (a, b) =>
      (Math.abs(b.score - a.score) > 1e-9 ? b.score - a.score : 0) ||
      a.titleLen - b.titleLen ||
      a.id - b.id
  );
  return scored.slice(0, k).map((x) => x.id);
}`,
      testCases: [
        {
          label: 'Retrieves typo match #101 and prunes unrelated #103',
          args: [
            [
              { id: 101, title: 'apple iphone 15 pro' },
              { id: 102, title: 'apple airpods pro' },
              { id: 103, title: 'samsung galaxy s24' },
            ],
            'aple iphon',
            0.3,
            2,
          ],
          expected: [101],
        },
        {
          label: 'Tie-breaks identical scores by shorter title then smaller id',
          args: [
            [
              { id: 20, title: 'sony camera' },
              { id: 10, title: 'sony camera' },
              { id: 15, title: 'sony camera pro' },
            ],
            'sony camra',
            0.35,
            2,
          ],
          expected: [10, 20],
        },
        {
          label: 'High threshold prunes all non-close items',
          args: [
            [
              { id: 1, title: 'usb' },
              { id: 2, title: 'wireless noise cancelling headphones' },
            ],
            'aple iphon',
            0.5,
            3,
          ],
          expected: [],
        },
      ],
    },
    linkedProblems: [
      {
        slug: 'merge-k-sorted-lists',
        number: 23,
        title: 'Merge K Sorted Lists',
        difficulty: 'Hard',
        whyLinked: 'Exact DAAT k-way posting-list merge pattern using a Min-Heap.',
      },
      {
        slug: 'kth-largest-in-stream',
        number: 703,
        title: 'Kth Largest Element in a Stream',
        difficulty: 'Easy',
        whyLinked: 'Bounded size-k Min-Heap powering O(C log k) Top-K selection & WAND θ.',
      },
      {
        slug: 'binary-search-classic',
        number: 704,
        title: 'Binary Search',
        difficulty: 'Easy',
        whyLinked: 'Galloping / skip-pointer jumps across sorted posting lists.',
      },
    ],
    studioLinks: [
      { label: 'Pruning Logic Simulator', type: 'pruning-sim', targetId: 'length-filtering' },
      { label: 'Block-Max WAND SVG', type: 'architecture', targetId: 'block-max-wand' },
      { label: 'MinHash + LSH SVG', type: 'architecture', targetId: 'minhash-lsh' },
    ],
  },

  // =========================================================================
  // MODULE 4
  // =========================================================================
  {
    id: 'mod-4-confident-scoring',
    number: 4,
    title: 'Module 4: Confident Scoring & Exact Fuzzy Algorithms',
    shortTitle: '4. Exact Reranking',
    stageTag: 'Stage 2 · High Precision',
    goal: 'Rerank Stage-1 candidates with order-aware exact edit algorithms and phonetic fallbacks to eliminate false positives.',
    sections: [
      {
        code: '4.1',
        title: 'Dynamic Programming Edit-Distance Algorithms',
        concepts: [
          'Levenshtein Distance in O(L · M) time and O(min(L, M)) rolling space',
          'Damerau-Levenshtein: adjacent transpositions ("teh" → "the") cost 1 edit instead of 2',
          'Ukkonen’s Diagonal Cutoff: compute edit distance <= k in O(k · min(L, M)) time',
        ],
        dsaPattern: '2D Dynamic Programming + Banded Matrix Pruning',
      },
      {
        code: '4.2',
        title: 'Automata & Heuristic Scoring',
        concepts: [
          'Levenshtein Automata + FST traversal (Lucene / Elasticsearch core)',
          'Jaro & Jaro-Winkler Similarity: prefix-boosted confidence for person/brand names',
          'Kondrak Positional N-Gram Distance: solves the "listen" vs "silent" anagram trap',
        ],
        dsaPattern: 'Finite State Machines & Order-Preserving Alignment',
      },
      {
        code: '4.3',
        title: 'Phonetic Fuzzy Algorithms (Fallback Layer)',
        concepts: [
          'Soundex consonant-code indexing for census/name lookup',
          'Double Metaphone acoustic skeletons rescuing "fantom" → "phantom"',
        ],
        dsaPattern: 'Deterministic String Normalization Pipeline',
      },
    ],
    milestoneSummary:
      'Implement Damerau-Levenshtein with Ukkonen’s diagonal cutoff and Jaro-Winkler, and use them to rerank Stage-1 candidates.',
    realWorldProblem: {
      title: 'Precision Name & Transposition Reranker (KYC / Spellcheck)',
      companyContext: 'Elasticsearch Fuzziness · Medical Patient Matching · Grammarly',
      prompt:
        'Stage 1 returned candidate words including anagrams ("silent" for "listen") and adjacent transpositions ("teh" for "the"). Rerank them using Damerau-Levenshtein (with max-k Ukkonen cutoff) blended with Jaro-Winkler prefix confidence.',
      constraints: [
        'Adjacent swap ("teh" → "the") MUST count as 1 edit, not 2',
        'Abort DP early when minimum row cost exceeds maxEditK (Ukkonen cutoff)',
        'Boost candidates matching the first 1–4 prefix characters via Jaro-Winkler (p = 0.1)',
      ],
      solutionWalkthrough: [
        'First check |len(a) - len(b)| > maxEditK → return Infinity in O(1).',
        'Run banded Damerau-Levenshtein checking substitution, insertion, deletion, AND adjacent transposition (a[i-1]===b[j-2] && a[i-2]===b[j-1]); if min value in row i exceeds maxEditK, stop immediately.',
        'Compute Jaro-Winkler with match window floor(max(|a|,|b|)/2) - 1 and prefix boost p = 0.1, then sort descending by blended confidence.',
      ],
      complexity: 'Time O(C · k · min(L, M)) · Space O(L · M) (or O(min(L, M)) rolling)',
    },
    exercise: {
      title: 'Milestone 4: Banded Damerau-Levenshtein + Jaro-Winkler Reranker',
      functionName: 'rerankCandidates',
      prompt:
        'Implement rerankCandidates(query, candidates, maxEditK = 2). Compute Damerau-Levenshtein distance with Ukkonen cutoff maxEditK (adjacent swap = 1 edit) and Jaro-Winkler similarity (p = 0.1). Keep only candidates with editDist <= maxEditK and return their strings sorted by descending score (0.55 * (1 - editDist/maxLen) + 0.45 * jaroWinkler).',
      starterCode: `function rerankCandidates(query, candidates, maxEditK = 2) {
  // 1. Implement damerauUkkonen(a, b, k): returns distance or Infinity if > k
  // 2. Implement jaroWinkler(a, b): returns similarity in [0, 1] with prefix boost p = 0.1
  // 3. Filter candidates with dist <= maxEditK, sort by blended confidence desc, return strings
  return [];
}`,
      solutionCode: `function rerankCandidates(query, candidates, maxEditK = 2) {
  const q = String(query).toLowerCase();

  const damerauUkkonen = (a, b, k) => {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > k) return Infinity;
    const INF = k + 1;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(INF));
    for (let i = 0; i <= Math.min(m, k); i++) dp[i][0] = i;
    for (let j = 0; j <= Math.min(n, k); j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      const lo = Math.max(1, i - k);
      const hi = Math.min(n, i + k);
      let rowMin = INF;
      for (let j = lo; j <= hi; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let best = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          best = Math.min(best, dp[i - 2][j - 2] + 1);
        }
        dp[i][j] = best;
        if (best < rowMin) rowMin = best;
      }
      if (rowMin > k) return Infinity;
    }
    return dp[m][n] <= k ? dp[m][n] : Infinity;
  };

  const jaroWinkler = (a, b) => {
    if (a === b) return 1;
    const lenA = a.length, lenB = b.length;
    if (!lenA || !lenB) return 0;
    const win = Math.max(0, Math.floor(Math.max(lenA, lenB) / 2) - 1);
    const mA = new Array(lenA).fill(false);
    const mB = new Array(lenB).fill(false);
    let matches = 0;
    for (let i = 0; i < lenA; i++) {
      const start = Math.max(0, i - win);
      const end = Math.min(lenB - 1, i + win);
      for (let j = start; j <= end; j++) {
        if (!mB[j] && a[i] === b[j]) {
          mA[i] = mB[j] = true;
          matches++;
          break;
        }
      }
    }
    if (matches === 0) return 0;
    let t = 0, kIdx = 0;
    for (let i = 0; i < lenA; i++) {
      if (!mA[i]) continue;
      while (!mB[kIdx]) kIdx++;
      if (a[i] !== b[kIdx]) t++;
      kIdx++;
    }
    const jaro = (matches / lenA + matches / lenB + (matches - t / 2) / matches) / 3;
    let prefix = 0;
    for (let i = 0; i < Math.min(4, lenA, lenB) && a[i] === b[i]; i++) prefix++;
    return jaro + prefix * 0.1 * (1 - jaro);
  };

  const ranked = [];
  for (const cand of candidates) {
    const c = String(cand).toLowerCase();
    const d = damerauUkkonen(q, c, maxEditK);
    if (d > maxEditK) continue;
    const editSim = 1 - d / Math.max(q.length, c.length, 1);
    const jw = jaroWinkler(q, c);
    const score = 0.55 * editSim + 0.45 * jw;
    ranked.push({ cand, score, d });
  }
  ranked.sort((a, b) => b.score - a.score || a.d - b.d || a.cand.localeCompare(b.cand));
  return ranked.map((x) => x.cand);
}`,
      testCases: [
        {
          label: 'Recognizes adjacent transposition ("recieve" → "receive") within k=1',
          args: ['recieve', ['receive', 'relieve', 'deceive'], 1],
          expected: ['receive', 'relieve'],
        },
        {
          label: 'Rejects anagram "silent" for "listen" at k=2',
          args: ['listen', ['listn', 'silent', 'listed'], 2],
          expected: ['listn', 'listed'],
        },
        {
          label: 'Jaro-Winkler prefers shared prefix ("algoritm" → "algorithm")',
          args: ['algoritm', ['logarithm', 'algorithm', 'algorist'], 2],
          expected: ['algorithm', 'algorist'],
        },
      ],
    },
    linkedProblems: [
      {
        slug: 'edit-distance',
        number: 72,
        title: 'Edit Distance (Levenshtein)',
        difficulty: 'Medium',
        whyLinked: 'Exact 2D DP foundation extended by Damerau transpositions and Ukkonen cutoffs.',
      },
      {
        slug: 'word-ladder',
        number: 127,
        title: 'Word Ladder',
        difficulty: 'Hard',
        whyLinked: 'Single-edit transition graph mirroring Levenshtein Automaton states.',
      },
      {
        slug: 'valid-palindrome-ii',
        number: 680,
        title: 'Valid Palindrome II',
        difficulty: 'Easy',
        whyLinked: 'Bounded 1-edit tolerance check without full DP overhead.',
      },
    ],
    studioLinks: [
      { label: 'Dynamic Programming Studio', type: 'algorithm', targetId: 'dynamic-programming' },
      { label: 'N-Gram + Levenshtein DFA', type: 'ngram', targetId: 'ngram-levenshtein-automaton' },
      { label: 'Phonetic N-Grams (Metaphone)', type: 'ngram', targetId: 'phonetic-ngrams' },
    ],
  },

  // =========================================================================
  // MODULE 5
  // =========================================================================
  {
    id: 'mod-5-production-pipeline',
    number: 5,
    title: 'Module 5: System Integration & Production Architecture',
    shortTitle: '5. Production Pipeline',
    stageTag: 'End-to-End System',
    goal: 'Combine Stage-1 Candidate Search and Stage-2 Confident Scoring into a production Waterfall Search Pipeline.',
    sections: [
      {
        code: '5.1',
        title: 'The Filter-and-Refine Pipeline',
        concepts: [
          'Stage 1: Normalize → Padded Trigrams → IDF-Sorted Candidate Search → Top 200',
          'Stage 2: Damerau-Levenshtein + Jaro-Winkler → Calibrated [0.0, 1.0] Confidence',
        ],
        dsaPattern: 'Two-Stage Retrieval & Precision Reranking',
      },
      {
        code: '5.2',
        title: 'Waterfall Query Routing & Confidence Tiers',
        concepts: [
          'Score >= 0.90: Direct Hit / Auto-Correct seamlessly',
          'Score 0.65 – 0.89: Display fuzzy matches + "Did you mean...?" prompt',
          'Score < 0.65: Trigger Phonetic (Metaphone) fallback or Semantic Vector search',
        ],
        dsaPattern: 'Multi-Tier Cascade & Early Exit',
      },
      {
        code: '5.3',
        title: 'Production Database Internals',
        concepts: [
          'PostgreSQL pg_trgm: GIN (exact inverted trigram lists, faster reads) vs GiST (lossy bit signatures, faster writes)',
          'Elasticsearch: edge_ngram index analyzer paired with fuzziness: AUTO (Levenshtein Automaton over FST)',
        ],
        dsaPattern: 'Inverted Indexes, FSTs & Signature Bitmaps',
      },
    ],
    milestoneSummary:
      'Build an end-to-end Filter-and-Refine Waterfall Router that scores candidates and routes queries across Direct Hit, Did-You-Mean, and Phonetic Fallback tiers.',
    realWorldProblem: {
      title: 'Production Waterfall Fuzzy Search Router (PostgreSQL + Elastic Pattern)',
      companyContext: 'PostgreSQL pg_trgm · Elasticsearch · Algolia · Meilisearch',
      prompt:
        'Wire Stage-1 Trigram Candidate Retrieval, Stage-2 Edit/Prefix Confidence Scoring, and a 3-tier Waterfall Router. Severe phonetic misspellings like "fantom" (which score < 0.65 lexically against "phantom") must automatically trigger the Phonetic Fallback tier.',
      constraints: [
        'Tier >= 0.90 → { tier: "direct-hit", results }',
        'Tier 0.65 .. 0.89 → { tier: "did-you-mean", results }',
        'Tier < 0.65 → { tier: "phonetic-fallback", results } via consonant Metaphone matching',
      ],
      solutionWalkthrough: [
        'Run Stage-1 trigram overlap to gather plausible lexical candidates without scanning the whole catalog.',
        'Score candidates with normalized Levenshtein + shared-prefix confidence; inspect topScore.',
        'If topScore >= 0.90 return direct-hit; if >= 0.65 return did-you-mean; otherwise run phonetic skeleton encoding ("PH"→"F", drop inner vowels) to rescue "fantom" → "phantom".',
      ],
      complexity: 'Stage 1 O(Σ|Postings|) + Stage 2 O(C · L · M) + O(N_p) Phonetic Index',
    },
    exercise: {
      title: 'Milestone 5: End-to-End Filter-and-Refine Waterfall Router',
      functionName: 'routeFuzzySearch',
      prompt:
        'Implement routeFuzzySearch(catalog, query, k = 3) where catalog is string[]. Score lexical candidates via normalized Levenshtein similarity (1 - editDist/maxLen). Route topScore >= 0.90 to "direct-hit", 0.65..0.89 to "did-you-mean", and < 0.65 to "phonetic-fallback" (matching phonetic skeleton: PH->F, V->F, C->K, drop inner AEIOUHY & duplicates). Return { tier, matches }.',
      starterCode: `function routeFuzzySearch(catalog, query, k = 3) {
  // 1. Score catalog items with normalized Levenshtein confidence in [0, 1]
  // 2. If topScore >= 0.90 -> tier "direct-hit"
  // 3. Else if topScore >= 0.65 -> tier "did-you-mean"
  // 4. Else -> tier "phonetic-fallback" matching phonetic skeleton (PH->F, V->F, C->K, strip inner vowels)
  return { tier: 'phonetic-fallback', matches: [] };
}`,
      solutionCode: `function routeFuzzySearch(catalog, query, k = 3) {
  const q = String(query).trim().toLowerCase();

  const editDist = (a, b) => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return dp[m][n];
  };

  const phonetic = (word) => {
    let s = String(word).toUpperCase().replace(/[^A-Z]/g, '');
    if (!s) return '';
    s = s.replace(/PH/g, 'F').replace(/V/g, 'F').replace(/C/g, 'K').replace(/(.)\\1+/g, '$1');
    return s[0] + s.slice(1).replace(/[AEIOUHY]/g, '');
  };

  const scored = catalog
    .map((item) => {
      const low = item.toLowerCase();
      const d = editDist(q, low);
      const conf = 1 - d / Math.max(q.length, low.length, 1);
      return { item, conf };
    })
    .sort((a, b) => b.conf - a.conf || a.item.localeCompare(b.item));

  const topScore = scored[0]?.conf ?? 0;
  if (topScore >= 0.9) {
    return {
      tier: 'direct-hit',
      matches: scored.filter((x) => x.conf >= 0.75).slice(0, k).map((x) => x.item),
    };
  }
  if (topScore >= 0.65) {
    return {
      tier: 'did-you-mean',
      matches: scored.filter((x) => x.conf >= 0.65).slice(0, k).map((x) => x.item),
    };
  }

  const qPhon = phonetic(q);
  const phonMatches = catalog.filter((item) => phonetic(item) === qPhon).slice(0, k);
  return { tier: 'phonetic-fallback', matches: phonMatches };
}`,
      testCases: [
        {
          label: 'Exact / >= 0.90 routes to direct-hit',
          args: [['headphones', 'headphone', 'keyboard'], 'headphones', 2],
          expected: { tier: 'direct-hit', matches: ['headphones', 'headphone'] },
        },
        {
          label: 'Moderate typo (0.65–0.89) routes to did-you-mean',
          args: [['algorithm', 'algorist', 'banana'], 'algoritm', 2],
          expected: { tier: 'did-you-mean', matches: ['algorithm', 'algorist'] },
        },
        {
          label: 'Severe acoustic typo ("filosofy" → "philosophy", conf=0.60 < 0.65) triggers phonetic-fallback',
          args: [['philosophy', 'keyboard', 'monitor'], 'filosofy', 2],
          expected: { tier: 'phonetic-fallback', matches: ['philosophy'] },
        },
      ],
    },
    linkedProblems: [
      {
        slug: 'lru-cache',
        number: 146,
        title: 'LRU Cache',
        difficulty: 'Medium',
        whyLinked: 'Caches hot autocomplete queries in O(1) in front of the search pipeline.',
      },
      {
        slug: 'find-median-from-data-stream',
        number: 295,
        title: 'Find Median from Data Stream',
        difficulty: 'Hard',
        whyLinked: 'Dual-heap streaming architecture for real-time P99 latency monitoring.',
      },
      {
        slug: 'edit-distance',
        number: 72,
        title: 'Edit Distance',
        difficulty: 'Medium',
        whyLinked: 'Powers Stage-2 exact confidence calibration before Waterfall tier routing.',
      },
    ],
    studioLinks: [
      { label: '10M Product Search Case Study', type: 'case-study', targetId: 'padded-ngrams' },
      { label: 'Pruning Logic Simulator', type: 'pruning-sim', targetId: 'count-filtering' },
      { label: 'Aho-Corasick Automaton SVG', type: 'architecture', targetId: 'aho-corasick' },
    ],
  },
];
