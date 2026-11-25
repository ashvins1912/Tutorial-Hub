import test from 'node:test';
import assert from 'node:assert/strict';
import { ALGORITHM_TUTOR_GUIDES } from '../../src/data/algorithmTutorGuides.ts';

test('algorithm tutor guides have complete, non-empty teaching contracts', () => {
  assert.ok(Object.keys(ALGORITHM_TUTOR_GUIDES).length > 0);
  for (const [key, guide] of Object.entries(ALGORITHM_TUTOR_GUIDES)) {
    assert.equal(guide.algorithmId, key, `algorithmId mismatch for ${key}`);
    for (const field of ['simpleAnalogy', 'interviewScript30s', 'chooseWhen', 'avoidWhen']) {
      assert.equal(typeof guide[field], 'string', `${key}: ${field} must be text`);
      assert.ok(guide[field].trim().length > 0, `${key}: ${field} must not be empty`);
    }
    assert.ok(Array.isArray(guide.followUpTwists), `${key}: followUpTwists must be an array`);
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
});
