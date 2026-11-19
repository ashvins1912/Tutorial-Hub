import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';

export const ADV_STRING_ALGORITHMS: AlgorithmDefinition[] = [
  // 32. Z-Algorithm
  {
    id: 'z-algorithm',
    name: 'Z-Algorithm (Linear Pattern Matching)',
    shortName: 'Z-Algorithm',
    category: 'Advanced String Algorithms',
    visualType: 'stream-partition',
    tagline: 'Compute prefix-match array Z[i] in O(N + M) via a sliding Z-box [L, R].',
    timeComplexity: 'O(N + M)',
    spaceComplexity: 'O(N + M)',
    complexityLeap: 'O(N · M) naive restart → O(N + M) Z-box prefix reuse',
    coreIdea:
      'Z[i] equals the longest substring starting at i matching a prefix of S. Maintain the rightmost Z-box [L, R]; inside [L, R], seed Z[i] = min(R - i + 1, Z[i - L]) in O(1), then extend right.',
    mentalModelSteps: [
      'Concatenate S = pattern + "$" + text so matches cannot exceed len(pattern).',
      'Track rightmost Z-box [l, r] initialized to [0, 0].',
      'If i <= r, seed z[i] = min(r - i + 1, z[i - l]); then expand while S[z[i]] === S[i + z[i]].',
      'Update [l, r] whenever i + z[i] - 1 > r. Every z[i] === len(pattern) is a match!',
    ],
    loopInvariant: 'S[l..r] always matches prefix S[0..r-l], and r only advances rightward (≤ N times).',
    whenToUse: [
      'Find ALL occurrences of a pattern in text in O(N + M)',
      'Sum of Scores of Built Strings (LC 2223 — sum(Z) + N!)',
    ],
    whenItFails: 'For searching thousands of patterns simultaneously, switch to Aho-Corasick.',
    linkedTopics: ['Sliding Window', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['minimum-window-substring', 'longest-substring-without-repeating', 'valid-palindrome-ii'],
    templates: {
      python: `def z_function(s):
    n = len(s); z = [0]*n; l = r = 0
    for i in range(1, n):
        if i <= r: z[i] = min(r - i + 1, z[i - l])
        while i + z[i] < n and s[z[i]] == s[i + z[i]]: z[i] += 1
        if i + z[i] - 1 > r: l, r = i, i + z[i] - 1
    return z`,
      js: `function zFunction(s) {
  const n = s.length, z = new Array(n).fill(0);
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
  }
  return z;
}`,
      java: `if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);`,
    },
    frames: [
      {
        step: 1,
        title: 'Build S = "ab$abxab" (Pattern "ab" + "$" + Text "abxab")',
        explanation: 'Any index i > 2 where Z[i] == 2 marks an exact hit of "ab" in text!',
        invariantCheck: 'Sentinel "$" caps all Z values at 2.',
        variables: [{ name: 'pattern', value: '"ab" (len 2)' }, { name: 'Z-box', value: '[0, 0]' }],
        array: ['a', 'b', '$', 'a', 'b', 'x', 'a', 'b'],
        secondaryArray: [0, 0, 0, null, null, null, null, null],
        pointers: [{ label: 'i', index: 3, tone: 'sky' }],
        windowRange: [0, 1],
      },
      {
        step: 2,
        title: 'Index 3: Z[3] = 2 (HIT #1!) → Slide Z-box to [3, 4]',
        explanation: 'S[3..4] == "ab" → text match at index 0! Right boundary R jumps to 4.',
        invariantCheck: 'R advances strictly rightward.',
        variables: [{ name: 'Z[3]', value: '2 (HIT #1)' }, { name: 'Z-box', value: '[3, 4]' }],
        array: ['a', 'b', '$', 'a', 'b', 'x', 'a', 'b'],
        secondaryArray: [0, 0, 0, 2, 0, 0, null, null],
        matchedIndices: [3, 4], windowRange: [3, 4],
        pointers: [{ label: 'L', index: 3, tone: 'emerald' }, { label: 'R', index: 4, tone: 'emerald' }],
      },
      {
        step: 3,
        title: 'Index 6: Z[6] = 2 (HIT #2!) → Matches at Text Indices [0, 3]',
        explanation: 'Complete Z = [0, 0, 0, 2, 0, 0, 2, 0] built in strict O(N + M) time!',
        invariantCheck: 'Every match found in one linear scan.',
        variables: [{ name: 'Z[]', value: '[0,0,0,2,0,0,2,0]' }, { name: 'hits', value: '[0, 3]' }],
        array: ['a', 'b', '$', 'a', 'b', 'x', 'a', 'b'],
        secondaryArray: [0, 0, 0, 2, 0, 0, 2, 0],
        matchedIndices: [3, 4, 6, 7], windowRange: [6, 7],
        pointers: [{ label: 'L', index: 6, tone: 'emerald' }, { label: 'R', index: 7, tone: 'emerald' }],
        hashEntries: [{ key: 'Match #1', val: 'idx 0', hit: true }, { key: 'Match #2', val: 'idx 3', hit: true }],
      },
    ],
  },

  // 33. Manacher's Algorithm
  {
    id: 'manachers-algorithm',
    name: 'Manacher’s Algorithm (O(N) Palindrome)',
    shortName: 'Manacher’s Algo',
    category: 'Advanced String Algorithms',
    visualType: 'stream-partition',
    tagline: 'Find the longest palindromic substring in strict O(N) via mirror symmetry around center C.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) expand-around-center → O(N) mirror radius reuse',
    coreIdea:
      'Insert "#" sentinels ("aba" → "^#a#b#a#$") so odd and even palindromes unify. Inside rightmost palindrome [2C-R, R], mirror index 2C-i seeds P[i] = min(R - i, P[2C - i]) for free!',
    mentalModelSteps: [
      'Transform s → T = "^#" + s.split("").join("#") + "#$".',
      'Track center C = 0, rightmost edge R = 0, and radius array P[i].',
      'If i < R, seed P[i] = min(R - i, P[2*C - i]) in O(1).',
      'Expand T[i+1+P[i]] === T[i-1-P[i]]; update C, R if i + P[i] > R. Max length = max(P)!',
    ],
    loopInvariant: 'Every i < R has a mirrored twin at 2C - i inside the active palindrome centered at C.',
    whenToUse: [
      'Longest Palindromic Substring (LC 5) in guaranteed O(N)',
      'Count all palindromic substrings (LC 647: Σ floor((P[i]+1)/2))',
    ],
    whenItFails: 'For non-contiguous palindromic SUBSEQUENCES, use 2D DP instead.',
    linkedTopics: ['Two Pointers', 'Dynamic Programming'],
    linkedProblemSlugs: ['valid-palindrome-ii', 'edit-distance', 'longest-substring-without-repeating'],
    templates: {
      python: `def manacher(s):
    t = "^#" + "#".join(s) + "#$"
    p = [0]*len(t); c = r = 0
    for i in range(1, len(t) - 1):
        if i < r: p[i] = min(r - i, p[2*c - i])
        while t[i + 1 + p[i]] == t[i - 1 - p[i]]: p[i] += 1
        if i + p[i] > r: c, r = i, i + p[i]
    return max(p)`,
      js: `function manacherLongestPalindrome(s) {
  if (!s.length) return 0;
  const t = '^#' + s.split('').join('#') + '#$';
  const p = new Array(t.length).fill(0);
  let c = 0, r = 0, best = 0;
  for (let i = 1; i < t.length - 1; i++) {
    if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);
    while (t[i + 1 + p[i]] === t[i - 1 - p[i]]) p[i]++;
    if (i + p[i] > r) { c = i; r = i + p[i]; }
    if (p[i] > best) best = p[i];
  }
  return best;
}`,
      java: `if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);`,
    },
    frames: [
      {
        step: 1,
        title: 'Transform "ababa" → "#a#b#a#b#a#" (All Centers Unified)',
        explanation: 'Separators "#" turn even palindromes into odd-centered palindromes automatically.',
        invariantCheck: 'P[i] equals exact palindrome length in original s.',
        variables: [{ name: 's', value: '"ababa"' }, { name: 'C / R', value: '0 / 0' }],
        array: ['#', 'a', '#', 'b', '#', 'a', '#', 'b', '#', 'a', '#'],
        secondaryArray: [0, 1, 0, null, null, null, null, null, null, null, null],
        pointers: [{ label: 'i', index: 1, tone: 'sky' }], windowRange: [0, 2],
      },
      {
        step: 2,
        title: 'Center C = 5 ("a") Expands Across Full String → P[5] = 5, R = 10!',
        explanation: 'Matching outward around center 5 locks P[5] = 5 ("ababa") and leaps R to 10.',
        invariantCheck: 'Active mirror window now covers [0..10].',
        variables: [{ name: 'C / R', value: '5 / 10' }, { name: 'P[5]', value: '5 ("ababa")' }],
        array: ['#', 'a', '#', 'b', '#', 'a', '#', 'b', '#', 'a', '#'],
        secondaryArray: [0, 1, 0, 3, 0, 5, null, null, null, null, null],
        matchedIndices: [1, 3, 5, 7, 9], windowRange: [0, 10],
        pointers: [{ label: 'C', index: 5, tone: 'emerald' }, { label: 'R', index: 10, tone: 'amber' }],
      },
      {
        step: 3,
        title: 'Mirror Shortcut at i = 7 Copies P[3] = 3 in O(1)!',
        explanation: 'mirror = 2×5 - 7 = 3 → P[7] = min(10 - 7, P[3]) = 3 with ZERO re-checks!',
        invariantCheck: 'R never moves left → strict O(N) total work.',
        variables: [{ name: 'mirror(7)', value: 'idx 3 (P=3)' }, { name: 'best len', value: '5' }],
        array: ['#', 'a', '#', 'b', '#', 'a', '#', 'b', '#', 'a', '#'],
        secondaryArray: [0, 1, 0, 3, 0, 5, 0, 3, 0, 1, 0],
        highlightIndices: [3, 7], matchedIndices: [5], windowRange: [4, 10],
        pointers: [{ label: 'mir', index: 3, tone: 'sky' }, { label: 'C', index: 5, tone: 'emerald' }, { label: 'i', index: 7, tone: 'amber' }],
      },
    ],
  },

  // 34. Aho-Corasick Algorithm
  {
    id: 'aho-corasick',
    name: 'Aho-Corasick (Multi-Pattern Automaton)',
    shortName: 'Aho-Corasick',
    category: 'Advanced String Algorithms',
    visualType: 'tree-structure',
    tagline: 'Match an entire dictionary of patterns simultaneously in one O(N + Σ|P| + Z) pass.',
    timeComplexity: 'O(N + Σ|P| + Z)',
    spaceComplexity: 'O(Σ|P| · |Σ|)',
    complexityLeap: 'O(K · N) separate KMP scans → single O(N) Trie + Failure-Link sweep',
    coreIdea:
      'Build a Trie of all dictionary patterns, then run BFS to wire KMP-style failure links fail[u] pointing to the longest proper suffix in the Trie. Merge output lists along failure links so one pass catches all overlapping patterns!',
    mentalModelSteps: [
      'Insert all dictionary words into a Prefix Trie, recording matches at terminal nodes.',
      'BFS from root: wire fail[v] = goto(fail[u], ch) for every Trie edge (u -ch-> v).',
      'Merge dictionary outputs: out[v] += out[fail[v]].',
      'Stream text through the automaton in one O(N) pass, emitting all out[state] matches.',
    ],
    loopInvariant: 'After reading text[0..i], state equals the deepest Trie node matching a suffix of text[0..i].',
    whenToUse: [
      'Stream of Characters (LC 1032), Content Moderation, Virus/DNA Multi-Signature Scanning',
      'Simultaneously matching thousands of keywords in a single text stream',
    ],
    whenItFails: 'For a single pattern, plain KMP or Z-Algorithm avoids Trie memory overhead.',
    linkedTopics: ['Backtracking & Tries', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['implement-trie', 'word-search-ii', 'minimum-window-substring'],
    templates: {
      python: `# Build Trie, then BFS failure links:
while q:
    u = q.popleft()
    for ch, v in nxt[u].items():
        f = fail[u]
        while f and ch not in nxt[f]: f = fail[f]
        fail[v] = nxt[f].get(ch, 0)
        out[v] += out[fail[v]]
        q.append(v)`,
      js: `while (q.length) {
  const u = q.shift();
  for (const [ch, v] of Object.entries(next[u])) {
    let f = fail[u];
    while (f && next[f][ch] === undefined) f = fail[f];
    fail[v] = next[f][ch] ?? 0;
    outCount[v] += outCount[fail[v]];
    q.push(v);
  }
}`,
      java: `out[v].addAll(out[fail[v]]); // Inherit suffix dictionary matches`,
    },
    frames: [
      {
        step: 1,
        title: 'Build Prefix Trie for {"he", "she", "his"}',
        explanation: 'Insert all dictionary words into a shared Prefix Trie.',
        invariantCheck: 'Every Trie path spells a dictionary prefix.',
        variables: [{ name: 'dict', value: 'he, she, his' }, { name: 'stage', value: 'Trie built' }],
        activeNodes: ['root'],
        nodeBadges: { root: '0', h: 'h', he: 'he ✓', s: 's', sh: 'sh', she: 'she ✓', hi: 'hi', his: 'his ✓' },
        graphSpec: {
          caption: 'Prefix Trie before wiring failure links',
          nodes: [
            { id: 'root', x: 250, y: 26 }, { id: 'h', x: 145, y: 84 }, { id: 's', x: 355, y: 84 },
            { id: 'he', x: 90, y: 148, group: 1 }, { id: 'hi', x: 195, y: 148 }, { id: 'sh', x: 355, y: 148 },
            { id: 'his', x: 195, y: 204, group: 1 }, { id: 'she', x: 355, y: 204, group: 1 },
          ],
          edges: [
            { u: 'root', v: 'h', label: 'h' }, { u: 'root', v: 's', label: 's' },
            { u: 'h', v: 'he', label: 'e' }, { u: 'h', v: 'hi', label: 'i' }, { u: 'hi', v: 'his', label: 's' },
            { u: 's', v: 'sh', label: 'h' }, { u: 'sh', v: 'she', label: 'e' },
          ],
        },
      },
      {
        step: 2,
        title: 'BFS Wires Failure Links: "sh" ⇢ "h" and "she" ⇢ "he"!',
        explanation: 'Failure link fail["she"] = "he" merges "he" into node "she"’s output list automatically!',
        invariantCheck: 'Failure links strictly decrease depth.',
        variables: [{ name: 'fail("sh")', value: '"h"' }, { name: 'out["she"]', value: '["she", "he"]' }],
        activeNodes: ['sh', 'she', 'h', 'he'], activeEdges: ['sh->h', 'she->he'],
        nodeBadges: { root: '0', h: 'h', he: '[he]', s: 's', sh: '⇢h', she: '[she,he]', hi: 'hi', his: '[his]' },
        graphSpec: {
          caption: 'Dashed failure links connect longest proper suffixes',
          nodes: [
            { id: 'root', x: 250, y: 26 }, { id: 'h', x: 145, y: 84, group: 2 }, { id: 's', x: 355, y: 84 },
            { id: 'he', x: 90, y: 148, group: 1 }, { id: 'hi', x: 195, y: 148 }, { id: 'sh', x: 355, y: 148, group: 2 },
            { id: 'his', x: 195, y: 204 }, { id: 'she', x: 355, y: 204, group: 1 },
          ],
          edges: [
            { u: 'root', v: 'h', label: 'h' }, { u: 'root', v: 's', label: 's' },
            { u: 'h', v: 'he', label: 'e' }, { u: 'h', v: 'hi', label: 'i' }, { u: 'hi', v: 'his', label: 's' },
            { u: 's', v: 'sh', label: 'h' }, { u: 'sh', v: 'she', label: 'e' },
            { u: 'sh', v: 'h', directed: true, dashed: true }, { u: 'she', v: 'he', directed: true, dashed: true },
          ],
        },
      },
      {
        step: 3,
        title: 'Stream "ushers": Landing on "she" Emits BOTH "she" & "he" Instantly!',
        explanation: 'Reading s→h→e reaches "she" and emits ["she", "he"] in a single O(1) transition!',
        invariantCheck: 'All overlapping patterns found in one O(N) pass.',
        variables: [{ name: 'text', value: '"ushers"' }, { name: 'emitted', value: '"she", "he" ✓' }],
        visitedNodes: ['root', 's', 'sh', 'she', 'he'], activeNodes: ['she'],
        activeEdges: ['root->s', 's->sh', 'sh->she', 'she->he'],
        nodeBadges: { root: '0', h: 'h', he: 'HIT!', s: 's', sh: 'sh', she: 'HIT×2', hi: 'hi', his: 'his' },
        graphSpec: {
          caption: 'Single-pass automaton catches overlapping matches at once',
          nodes: [
            { id: 'root', x: 250, y: 26 }, { id: 'h', x: 145, y: 84 }, { id: 's', x: 355, y: 84, group: 2 },
            { id: 'he', x: 90, y: 148, group: 1 }, { id: 'hi', x: 195, y: 148 }, { id: 'sh', x: 355, y: 148, group: 2 },
            { id: 'his', x: 195, y: 204 }, { id: 'she', x: 355, y: 204, group: 1 },
          ],
          edges: [
            { u: 'root', v: 'h' }, { u: 'root', v: 's' }, { u: 'h', v: 'he' }, { u: 'h', v: 'hi' },
            { u: 'hi', v: 'his' }, { u: 's', v: 'sh' }, { u: 'sh', v: 'she' },
            { u: 'she', v: 'he', directed: true, dashed: true },
          ],
        },
      },
    ],
  },

  // 35. Suffix Array & LCP Array
  {
    id: 'suffix-array-lcp',
    name: 'Suffix Array & LCP (Kasai’s Algorithm)',
    shortName: 'Suffix Array & LCP',
    category: 'Advanced String Algorithms',
    visualType: 'matrix-grid',
    tagline: 'Sort all N suffixes in O(N log N) and compute adjacent Longest Common Prefixes in O(N).',
    timeComplexity: 'O(N log N) · O(N) LCP',
    spaceComplexity: 'O(N)',
    complexityLeap: 'Replaces heavy Suffix Trees with two flat integer arrays SA[] & LCP[]',
    coreIdea:
      'Build Suffix Array SA[] via Prefix Doubling (sorting pairs (rank[i], rank[i + 2^k])). Then run Kasai’s O(N) pass to compute LCP[i] between adjacent sorted suffixes—immediately solving Longest Duplicate Substring and Distinct Substring Count!',
    mentalModelSteps: [
      'Prefix Doubling: sort indices by (rank[i], rank[i + k]) doubling k = 1, 2, 4, ... until all ranks are unique.',
      'SA[] holds sorted suffix start indices; inv[i] = rank[i] gives suffix i’s position in SA.',
      'Kasai’s O(N) LCP: sweep original i = 0..N-1, comparing with SA[rank[i]-1], decrementing h by 1 each step.',
      'Distinct Substrings = N*(N+1)/2 - Σ LCP[i]; Longest Duplicate = max(LCP).',
    ],
    loopInvariant: 'Kasai’s Lemma: LCP at original index i + 1 is ALWAYS ≥ LCP at index i minus 1, proving O(N) time.',
    whenToUse: [
      'Longest Duplicate Substring (LC 1044 — max(LCP))',
      'Count Distinct Substrings = N(N+1)/2 - Σ LCP',
      'Repeated substring lookup via O(M log N) Binary Search on SA[]',
    ],
    whenItFails: 'For a single-pattern search without multiple queries, KMP/Z-Algorithm O(N+M) is faster.',
    linkedTopics: ['Modified Binary Search', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['binary-search-classic', 'longest-substring-without-repeating', 'minimum-window-substring'],
    templates: {
      python: `# Kasai's O(N) LCP after Prefix Doubling SA
lcp = [0]*n; h = 0
for i in range(n):
    if rank[i] > 0:
        j = sa[rank[i] - 1]
        while i + h < n and j + h < n and s[i + h] == s[j + h]: h += 1
        lcp[rank[i]] = h
        if h > 0: h -= 1`,
      js: `let lcpSum = 0;
for (let i = 0, h = 0; i < n; i++) {
  if (rank[i] > 0) {
    const j = sa[rank[i] - 1];
    while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
    lcpSum += h;
    if (h > 0) h--;
  }
}`,
      java: `// Distinct Substrings = n*(n+1)/2 - sum(lcp); Longest Repeat = max(lcp)`,
    },
    frames: [
      {
        step: 1,
        title: 'Sorted Suffix Array for "banana" → SA = [5, 3, 1, 0, 4, 2]',
        explanation: 'All 6 suffixes sorted lexicographically place identical prefixes right next to each other!',
        invariantCheck: 'Every substring is a prefix of some row in SA.',
        variables: [{ name: 'S', value: '"banana"' }, { name: 'SA[]', value: '[5, 3, 1, 0, 4, 2]' }],
        matrix: {
          subtitle: 'Sorted Suffixes of "banana"',
          rowLabels: ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'], colLabels: ['SA[i]', 'Suffix'],
          cells: [[5, 'a'], [3, 'ana'], [1, 'anana'], [0, 'banana'], [4, 'na'], [2, 'nana']],
          activeCells: [[1, 1], [2, 1]],
        },
      },
      {
        step: 2,
        title: 'Kasai’s O(N) LCP = [0, 1, 3, 0, 0, 2] → Repeat "ana" (3) & 15 Distinct!',
        explanation: 'Adjacent "ana" & "anana" share LCP = 3! Distinct substrings = 21 - (0+1+3+0+0+2) = 15.',
        invariantCheck: 'max(LCP) = 3 and N(N+1)/2 - sum(LCP) = 15.',
        variables: [{ name: 'max(LCP)', value: '3 ("ana")' }, { name: 'distinct', value: '21 - 6 = 15' }],
        matrix: {
          subtitle: 'Suffix Array + Adjacent LCP Column',
          rowLabels: ['r0', 'r1', 'r2', 'r3', 'r4', 'r5'], colLabels: ['SA[i]', 'Suffix', 'LCP'],
          cells: [[5, 'a', 0], [3, 'ana', 1], [1, 'anana', 3], [0, 'banana', 0], [4, 'na', 0], [2, 'nana', 2]],
          matchedCells: [[2, 1], [2, 2]], activeCells: [[5, 2]],
        },
      },
    ],
  },
];

export const ADV_STRING_PRACTICE: Record<string, AlgorithmPracticeSpec> = {
  'z-algorithm': {
    algorithmId: 'z-algorithm',
    functionName: 'zFindAllMatches',
    title: 'Find All Pattern Occurrences via Z-Algorithm',
    prompt: 'Return all 0-based starting indices where non-empty pattern occurs in text using the Z-Algorithm.',
    structuredSteps: [
      { step: '1. Sentinel Concatenation', detail: 'Form s = pattern + "\\0" + text.' },
      { step: '2. Slide Z-Box [l, r]', detail: 'Seed z[i] = min(r - i + 1, z[i - l]) when i <= r, then expand.' },
      { step: '3. Record Matches', detail: 'When i > pattern.length and z[i] === pattern.length, record i - pattern.length - 1.' },
    ],
    starterCode: `function zFindAllMatches(text, pattern) {
  // TODO: Compute Z-array over pattern + "\\0" + text
  return [];
}`,
    solutionCode: `function zFindAllMatches(text, pattern) {
  const s = pattern + '\0' + text, n = s.length, m = pattern.length;
  const z = new Array(n).fill(0), hits = [];
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i <= r) z[i] = Math.min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
    if (i > m && z[i] === m) hits.push(i - m - 1);
  }
  return hits;
}`,
    testCases: [
      { label: 'Overlapping ("aa" in "aaaa")', args: ['aaaa', 'aa'], expected: [0, 1, 2] },
      { label: 'Disjoint matches', args: ['abxab', 'ab'], expected: [0, 3] },
      { label: 'No match', args: ['abcdef', 'xyz'], expected: [] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 2223', title: 'Sum of Scores of Built Strings', difficulty: 'Hard', focus: 'Direct Z-array sum + N' },
      { platform: 'LeetCode', number: 'LC 3031', title: 'Minimum Time to Revert Word II', difficulty: 'Hard', focus: 'Check suffix-prefix match via Z[i]' },
      { platform: 'CSES', number: 'CSES 1753', title: 'String Matching', difficulty: 'Medium', focus: 'O(N+M) pattern counting' },
    ],
  },
  'manachers-algorithm': {
    algorithmId: 'manachers-algorithm',
    functionName: 'manacherLongestPalindrome',
    title: 'O(N) Longest Palindromic Substring Length',
    prompt: 'Implement Manacher’s Algorithm to return the length of the longest palindromic substring in s.',
    structuredSteps: [
      { step: '1. Insert "#" Sentinels', detail: 'Build T = "^#" + s.split("").join("#") + "#$".' },
      { step: '2. Mirror Seed', detail: 'If i < R, set P[i] = min(R - i, P[2*C - i]).' },
      { step: '3. Expand & Track Max', detail: 'Expand P[i] while matching, update C/R, return max(P).' },
    ],
    starterCode: `function manacherLongestPalindrome(s) {
  if (!s.length) return 0;
  // TODO: Transform string and compute palindrome radii in O(N)
  return 0;
}`,
    solutionCode: `function manacherLongestPalindrome(s) {
  if (!s.length) return 0;
  const t = '^#' + s.split('').join('#') + '#$';
  const p = new Array(t.length).fill(0);
  let c = 0, r = 0, best = 0;
  for (let i = 1; i < t.length - 1; i++) {
    if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);
    while (t[i + 1 + p[i]] === t[i - 1 - p[i]]) p[i]++;
    if (i + p[i] > r) { c = i; r = i + p[i]; }
    if (p[i] > best) best = p[i];
  }
  return best;
}`,
    testCases: [
      { label: 'Odd palindrome ("ababa")', args: ['xababay'], expected: 5 },
      { label: 'Even palindrome ("cabbac")', args: ['cabbac'], expected: 6 },
      { label: 'Single character', args: ['z'], expected: 1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 5', title: 'Longest Palindromic Substring', difficulty: 'Medium', focus: 'O(N) Manacher vs O(N²) expand' },
      { platform: 'LeetCode', number: 'LC 647', title: 'Palindromic Substrings', difficulty: 'Medium', focus: 'Sum floor((P[i]+1)/2)' },
      { platform: 'CSES', number: 'CSES 1111', title: 'Longest Palindrome', difficulty: 'Hard', focus: 'N = 10⁶ requires O(N) Manacher' },
    ],
  },
  'aho-corasick': {
    algorithmId: 'aho-corasick',
    functionName: 'ahoCorasickCount',
    title: 'Multi-Pattern Count via Aho-Corasick',
    prompt: 'Build an Aho-Corasick automaton over dictionary patterns and return the total number of overlapping pattern hits in text.',
    structuredSteps: [
      { step: '1. Insert Into Trie', detail: 'Build transitions next[u][ch] and increment outCount[u] at pattern ends.' },
      { step: '2. BFS Failure Links', detail: 'Wire fail[v] from fail[u] and inherit outCount[v] += outCount[fail[v]].' },
      { step: '3. Single-Pass Stream', detail: 'Step state through text and accumulate outCount[state].' },
    ],
    starterCode: `function ahoCorasickCount(text, patterns) {
  // TODO: Build Trie + BFS failure links and count all pattern occurrences
  return 0;
}`,
    solutionCode: `function ahoCorasickCount(text, patterns) {
  const next = [{}], fail = [0], out = [0];
  for (const pat of patterns) {
    let u = 0;
    for (const ch of pat) {
      if (next[u][ch] === undefined) { next[u][ch] = next.length; next.push({}); fail.push(0); out.push(0); }
      u = next[u][ch];
    }
    out[u]++;
  }
  const q = Object.values(next[0]);
  while (q.length) {
    const u = q.shift();
    for (const [ch, v] of Object.entries(next[u])) {
      let f = fail[u];
      while (f && next[f][ch] === undefined) f = fail[f];
      fail[v] = next[f][ch] ?? 0; out[v] += out[fail[v]]; q.push(v);
    }
  }
  let st = 0, total = 0;
  for (const ch of text) {
    while (st && next[st][ch] === undefined) st = fail[st];
    st = next[st][ch] ?? 0; total += out[st];
  }
  return total;
}`,
    testCases: [
      { label: '"ushers" with {he, she, hers, his}', args: ['ushers', ['he', 'she', 'hers', 'his']], expected: 3 },
      { label: 'Overlapping nested words', args: ['ababa', ['a', 'aba', 'baba']], expected: 6 },
      { label: 'No hits', args: ['hello', ['xyz', 'qrs']], expected: 0 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1032', title: 'Stream of Characters', difficulty: 'Hard', focus: 'Multi-pattern stream automaton' },
      { platform: 'CSES', number: 'CSES 2102', title: 'Finding Patterns', difficulty: 'Hard', focus: '500K dictionary patterns in one pass' },
      { platform: 'LeetCode', number: 'LC 208', title: 'Implement Trie', difficulty: 'Medium', focus: 'Trie foundation', trainerSlug: 'implement-trie' },
    ],
  },
  'suffix-array-lcp': {
    algorithmId: 'suffix-array-lcp',
    functionName: 'countDistinctSubstrings',
    title: 'Distinct Substrings via Suffix Array + Kasai LCP',
    prompt: 'Build SA[] and Kasai LCP[] for string s, returning distinct non-empty substrings: N*(N+1)/2 - sum(LCP).',
    structuredSteps: [
      { step: '1. Prefix Doubling SA', detail: 'Sort suffix indices by (rank[i], rank[i+k]) for k = 1, 2, 4...' },
      { step: '2. Kasai O(N) LCP', detail: 'Compare adjacent sorted suffixes maintaining h >= h_prev - 1.' },
      { step: '3. Subtract Shared Prefixes', detail: 'Return n*(n+1)/2 - lcpSum.' },
    ],
    starterCode: `function countDistinctSubstrings(s) {
  const n = s.length;
  if (!n) return 0;
  // TODO: Prefix Doubling SA + Kasai LCP -> return n*(n+1)/2 - lcpSum
  return 0;
}`,
    solutionCode: `function countDistinctSubstrings(s) {
  const n = s.length;
  if (!n) return 0;
  const sa = Array.from({ length: n }, (_, i) => i);
  let rank = Array.from(s, (c) => c.charCodeAt(0));
  for (let k = 1; k < n; k <<= 1) {
    sa.sort((a, b) => rank[a] !== rank[b] ? rank[a] - rank[b] : (a + k < n ? rank[a + k] : -1) - (b + k < n ? rank[b + k] : -1));
    const tmp = new Array(n).fill(0);
    for (let i = 1; i < n; i++) {
      const p = sa[i - 1], c = sa[i];
      const same = rank[p] === rank[c] && (p + k < n ? rank[p + k] : -1) === (c + k < n ? rank[c + k] : -1);
      tmp[c] = tmp[p] + (same ? 0 : 1);
    }
    rank = tmp;
    if (rank[sa[n - 1]] === n - 1) break;
  }
  let lcpSum = 0;
  for (let i = 0, h = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1];
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
      lcpSum += h; if (h > 0) h--;
    }
  }
  return (n * (n + 1)) / 2 - lcpSum;
}`,
    testCases: [
      { label: '"banana" → 15 distinct', args: ['banana'], expected: 15 },
      { label: '"aaaa" → 4 distinct', args: ['aaaa'], expected: 4 },
      { label: '"abcd" → 10 distinct', args: ['abcd'], expected: 10 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 1044', title: 'Longest Duplicate Substring', difficulty: 'Hard', focus: 'max(LCP) or Binary Search + Rolling Hash' },
      { platform: 'CSES', number: 'CSES 2105', title: 'Distinct Substrings', difficulty: 'Hard', focus: 'Exact N(N+1)/2 - ΣLCP formula' },
      { platform: 'LeetCode', number: 'LC 1163', title: 'Last Substring in Lexicographical Order', difficulty: 'Hard', focus: 'Suffix comparison' },
    ],
  },
};
