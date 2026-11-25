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
});
