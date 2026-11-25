import test from 'node:test';
import assert from 'node:assert/strict';
import { ALGORITHM_TUTOR_GUIDES } from '../../src/data/algorithmTutorGuides.ts';
import { MASTER_40_TUTOR_GUIDES } from '../../src/data/algorithmMasterMetadata.ts';

const expectedGuideIds = [
  'prefix-sum-hash',
  'two-pointers',
  'sliding-window',
  'binary-search',
  'fast-slow-pointers',
  'monotonic-stack',
  'tree-bfs-dfs',
  'heap-intervals',
  'graph-topo-sort',
  'dijkstra-shortest-path',
  'backtracking-trie',
  'dynamic-programming',
  'merge-sort-divide-conquer',
  'greedy-algorithms',
  'kadanes-algorithm',
  'cyclic-sort',
  'depth-first-search',
  'union-find-dsu',
  'bit-manipulation',
  'kmp-rabin-karp',
  'bellman-ford',
  'floyd-warshall',
  'tarjan-kosaraju-scc',
  'a-star-search',
  'max-flow-edmonds-karp',
  'prims-mst',
  'segment-tree-lazy',
  'fenwick-tree-bit',
  'binary-lifting-lca',
  'heavy-light-decomposition',
  'mos-algorithm',
  'z-algorithm',
  'manachers-algorithm',
  'aho-corasick',
  'suffix-array-lcp',
  'bitmask-dp',
  'digit-dp',
  'dp-on-trees-rerooting',
  'convex-hull-trick',
  'sieve-of-eratosthenes',
  'euclidean-extended-gcd',
  'modular-exponentiation',
  'convex-hull-graham-scan',
  'reservoir-sampling',
  'monotonic-deque',
  'zero-one-bfs',
  'bidirectional-bfs',
  'kruskals-mst',
  'bipartite-graph-coloring',
  'sweep-line-events',
  'dual-heaps-median',
  'lis-patience-sorting',
  'meet-in-the-middle'
];

test('algorithm tutor guides have complete, non-empty teaching contracts', () => {
  assert.equal(expectedGuideIds.length, 54, 'local guide inventory must contain all 54 explicitly maintained guides');
  assert.equal(Object.keys(MASTER_40_TUTOR_GUIDES).length, 40, 'master guide inventory must match its declared 40-guide contract');
  const expectedMergedGuideIds = [...new Set([...expectedGuideIds, ...Object.keys(MASTER_40_TUTOR_GUIDES)])].sort();
  assert.deepEqual(Object.keys(ALGORITHM_TUTOR_GUIDES).sort(), expectedMergedGuideIds, 'merged guide inventory must equal local plus master guide sources');
  for (const [key, guide] of Object.entries(ALGORITHM_TUTOR_GUIDES)) {
    assert.equal(guide.algorithmId, key, `algorithmId mismatch for ${key}`);
    for (const field of ['simpleAnalogy', 'interviewScript30s', 'chooseWhen', 'avoidWhen']) {
      assert.equal(typeof guide[field], 'string', `${key}: ${field} must be text`);
      assert.ok(guide[field].trim().length > 0, `${key}: ${field} must not be empty`);
    }
    assert.ok(Array.isArray(guide.followUpTwists), `${key}: followUpTwists must be an array`);
    assert.ok(guide.followUpTwists.length > 0, `${key}: add at least one learner follow-up twist`);
    for (const [index, twist] of guide.followUpTwists.entries()) {
      for (const field of ['question', 'invariantShift', 'complexityImpact']) {
        assert.equal(typeof twist[field], 'string', `${key} twist ${index}: ${field} must be text`);
        assert.ok(twist[field].trim().length > 0, `${key} twist ${index}: ${field} must not be empty`);
      }
    }
  }
});

test('high-risk algorithm tutor claims retain necessary assumptions and caveats', () => {
  const guides = ALGORITHM_TUTOR_GUIDES;
  assert.match(guides['backtracking-trie'].avoidWhen, /no universal N threshold/i);
  assert.match(guides['backtracking-trie'].followUpTwists.find(x => /N-Queens conflict/.test(x.question)).complexityImpact, /depends on implementation/i);
  assert.match(guides['dijkstra-shortest-path'].followUpTwists.find(x => /distinct shortest paths/.test(x.question)).complexityImpact, /strictly positive edge weights/i);
  assert.match(guides['two-pointers'].interviewScript30s, /excluding input and output/i);
  assert.match(guides['binary-search'].interviewScript30s, /candidate range of size R/i);
  assert.match(guides['prefix-sum-hash'].followUpTwists.find(x => /DIVISIBLE by K/i.test(x.question)).invariantShift, /K ≠ 0|non-zero K/i);
  assert.match(guides['prefix-sum-hash'].followUpTwists.find(x => /DIVISIBLE by K/i.test(x.question)).complexityImpact, /K = 0/i);
  assert.match(guides['sliding-window'].interviewScript30s, /validity is monotone/i);
  const streamQuery = Object.values(guides).flatMap(g => g.followUpTwists).find(x => /Stream of Characters/i.test(x.question));
  assert.ok(streamQuery, 'Stream of Characters follow-up should exist');
  assert.match(streamQuery.complexityImpact, /O\(matches\)/i);
  assert.match(streamQuery.invariantShift, /O\(L\) worst case per query/i);
  assert.match(guides['modular-exponentiation'].interviewScript30s, /sufficiently wide\/exact modular-multiply/i);
  assert.match(guides['modular-exponentiation'].avoidWhen, /reducing modulo M after an already-inexact multiplication is too late/i);
  assert.match(guides.quickselect.followUpTwists.find(x => /all-duplicate arrays/i.test(x.question)).complexityImpact, /3-way partitioning/i);
  assert.match(guides['floyd-warshall'].interviewScript30s, /not negative cycles/i);
  assert.match(guides['zero-one-bfs'].followUpTwists.find(x => /pushed into the deque more than once/i.test(x.question)).complexityImpact, /vertex can be re-enqueued/i);
  assert.match(guides['tree-bfs-dfs'].followUpTwists.find(x => /speed up Word Ladder/i.test(x.question)).complexityImpact, /not a universal bound/i);
  assert.match(guides['bellman-ford'].interviewScript30s, /negative cycles reachable from the chosen source/i);
  assert.match(guides['sieve-of-eratosthenes'].followUpTwists.find(x => /primes in/i.test(x.question)).complexityImpact, /base-prime list/i);
  assert.match(guides['mos-algorithm'].followUpTwists.find(x => /support point updates/i.test(x.question)).complexityImpact, /N \+ Q \+ U/i);
  assert.match(guides['z-algorithm'].interviewScript30s, /separator that cannot occur/i);
  assert.match(guides['manachers-algorithm'].followUpTwists.find(x => /sentinel characters/i.test(x.question)).invariantShift, /cannot occur in the input/i);
  assert.match(guides.quickselect.interviewScript30s, /expected recurrence is not a guaranteed half-size geometric series/i);
  assert.match(guides.quickselect.interviewScript30s, /recursive implementations also use stack space/i);
  assert.match(guides['prims-mst'].interviewScript30s, /indexed\/decrease-key heap/i);
  assert.match(guides['prims-mst'].followUpTwists.find(x => /Prim’s beat Kruskal/i.test(x.question)).complexityImpact, /explicit O\(V²\) edge storage/i);
  assert.match(guides['bellman-ford'].simpleAnalogy, /reachable vertices when no reachable negative cycle exists/i);
  assert.match(guides['bidirectional-bfs'].interviewScript30s, /irregular graphs do not have that universal bound/i);
  assert.match(guides['kmp-rabin-karp'].interviewScript30s, /collisions require verification/i);
  assert.match(guides['mos-algorithm'].followUpTwists.find(x => /reduce pointer movement/i.test(x.question)).complexityImpact, /not a fixed percentage/i);
  assert.match(guides['euclidean-extended-gcd'].followUpTwists.find(x => /integer overflow when computing/i.test(x.question)).complexityImpact, /final LCM fits/i);
  assert.match(guides['modular-exponentiation'].simpleAnalogy, /grows logarithmically/i);
  assert.match(guides['mos-algorithm'].followUpTwists.find(x => /reduce pointer movement/i.test(x.question)).complexityImpact, /not a fixed percentage/i);
  assert.match(guides['convex-hull-trick'].followUpTwists.find(x => /floating-point precision/i.test(x.question)).invariantShift, /fixed-width 64-bit products can still overflow/i);
  assert.match(guides['suffix-array-lcp'].followUpTwists.find(x => /Longest Common Substring/i.test(x.question)).invariantShift, /separator is absent from both strings/i);
  assert.match(guides['fenwick-tree-bit'].simpleAnalogy, /O\(log N\) steps/i);
  assert.match(guides['manachers-algorithm'].interviewScript30s, /separator absent from the input/i);
  assert.match(guides['bipartite-graph-coloring'].simpleAnalogy, /odd-length rivalry cycle/i);
  assert.match(guides['meet-in-the-middle'].simpleAnalogy, /match complementary sums/i);
  assert.match(guides['fast-slow-pointers'].simpleAnalogy, /different stopping conditions/i);
  assert.match(guides['monotonic-stack'].simpleAnalogy, /next-greater-to-the-right/i);
  assert.match(guides['mos-algorithm'].interviewScript30s, /supports efficient add\/remove operations/i);
  assert.match(guides['dual-heaps-median'].followUpTwists.find(x => /90th percentile/i.test(x.question)).invariantShift, /read `hi.top\(\)` as P90/i);
  assert.match(guides['kmp-rabin-karp'].followUpTwists.find(x => /Shortest Palindrome/i.test(x.question)).invariantShift, /separator absent from s/i);
  assert.match(guides['sweep-line-events'].interviewScript30s, /Ignore empty intervals/i);
});
