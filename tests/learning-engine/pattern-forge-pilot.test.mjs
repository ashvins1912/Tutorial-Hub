import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { DSA28_PATTERNS } from '../../src/data/dsa28Patterns.ts';
import {
  PATTERN_FORGE_CURRICULUM,
  PATTERN_FORGE_TOPICS,
  getAllCanonicalProblems,
  getLearningTopicById,
  getLessonsByTopicId,
} from '../../shared/patternForgeCurriculum.ts';
import { auditCurriculumGovernance } from '../../shared/learningValidator.ts';
import { buildLearningTrace } from '../../shared/traceEngine.ts';
import {
  computeNextRevisionSchedule,
  computeTopicMastery,
  createEmptyMasteryEvidence,
  createInitialRevisionSchedule,
  scorePatternRecognitionAttempt,
} from '../../shared/masteryEngine.ts';

test('canonical curriculum registers all 28 patterns preserving DSA28 canonical IDs', () => {
  assert.equal(PATTERN_FORGE_TOPICS.length, 28);
  assert.equal(PATTERN_FORGE_CURRICULUM.topicIds.length, 28);
  const expectedIds = DSA28_PATTERNS.map((p) => p.id);
  const actualIds = PATTERN_FORGE_TOPICS.map((t) => t.id);
  assert.deepEqual(actualIds, expectedIds);
});

test('content quality governance enforces acyclic DAG, unique IDs, and honest verification statuses', () => {
  const audit = auditCurriculumGovernance(PATTERN_FORGE_TOPICS);
  assert.equal(audit.totalTopics, 28);
  assert.equal(audit.publishedCount, 3);
  assert.equal(audit.structurallyValidOnlyCount, 25);
  assert.equal(audit.uniqueIdsValid, true);
  assert.equal(audit.prerequisiteGraphAcyclic, true);
  assert.deepEqual(audit.danglingPrerequisites, []);

  for (const report of audit.topicReports) {
    assert.equal(report.structurallyValid, true, `${report.topicId} must be structurally valid`);
    const honestyCheck = report.checks.find((c) => c.checkId === 'governance-honesty');
    assert.ok(honestyCheck?.passed, `${report.topicId} violated publication honesty gate`);
    if (report.verificationStatus === 'Published') {
      assert.equal(report.readyForPublication, true, `${report.topicId} must pass all publication gates`);
    }
  }
});

test('three reference pilot patterns provide full 5-stage lifecycle and deterministic traces with checkpoints', () => {
  const pilotIds = ['hashmap-hashset-lookup', 'dynamic-sliding-window', 'dynamic-programming'];
  for (const id of pilotIds) {
    const topic = getLearningTopicById(id);
    assert.ok(topic, `pilot topic ${id} must exist`);
    assert.equal(topic.verificationStatus, 'Published');
    assert.ok(topic.understand, `${id} must have Understand stage`);
    assert.ok(topic.traceIds.length >= 3, `${id} must have >= 3 interactive traces`);
    assert.ok(topic.problems.length >= 3, `${id} must have >= 3 verified problems`);
    assert.ok(topic.assessments.length >= 1, `${id} must have >= 1 transfer assessment`);

    const lessons = getLessonsByTopicId(id);
    assert.equal(lessons.length, 1);
    assert.deepEqual(
      lessons[0].stages.map((s) => s.id),
      ['understand', 'visualize', 'implement', 'practice', 'master']
    );

    for (const traceId of topic.traceIds) {
      const traceA = buildLearningTrace(traceId);
      const traceB = buildLearningTrace(traceId);
      assert.ok(traceA && traceB, `trace ${traceId} must build`);
      assert.deepEqual(traceA.steps, traceB.steps, `trace ${traceId} must be strictly deterministic`);
      assert.ok(traceA.steps.some((s) => Boolean(s.checkpoint)), `trace ${traceId} must include a prediction checkpoint`);
      const last = traceA.steps[traceA.steps.length - 1];
      assert.equal(last.operation.type, 'complete');
      assert.ok(last.state.finalResult, `trace ${traceId} must emit a finalResult`);
    }
  }
});

test('all verified pilot JavaScript and Python 3.12 solutions execute and pass 100% of test suites and edge cases', () => {
  const problems = getAllCanonicalProblems();
  assert.ok(problems.length >= 10, 'pilot should contain at least 10 verified problems');

  const tmpDir = mkdtempSync(join(tmpdir(), 'pattern-forge-pilot-'));
  try {
    for (const problem of problems) {
      assert.equal(problem.verificationStatus, 'Published');
      const optimalVariant =
        problem.solution.variants.find((v) => v.tier === 'optimal') ??
        problem.solution.variants[problem.solution.variants.length - 1];
      assert.ok(optimalVariant, `${problem.id} missing optimal solution`);
      assert.ok(optimalVariant.code.java.includes('class Solution'), `${problem.id} missing Java 21 class`);

      // Compile every reference tier with the same Java 21 toolchain used by CI.
      for (const variant of problem.solution.variants) {
        const javaOutDir = join(tmpDir, `${problem.id}-${variant.tier}`);
        mkdirSync(javaOutDir, { recursive: true });
        const javaFile = join(javaOutDir, 'Solution.java');
        writeFileSync(javaFile, variant.code.java, 'utf8');
        const javaCompile = spawnSync('javac', ['--release', '21', '-d', javaOutDir, javaFile], { encoding: 'utf8' });
        assert.equal(javaCompile.status, 0, `Java 21 ${problem.id} (${variant.tier}) did not compile: ${javaCompile.stderr || javaCompile.stdout}`);
      }

      // 1. Verify JavaScript optimal solution against all test cases
      const jsFn = new Function(
        `"use strict";\n${optimalVariant.code.javascript}\nreturn ${problem.testSuite.entryFunctionName.javascript};`
      )();
      assert.equal(typeof jsFn, 'function', `${problem.id} JS function missing`);
      for (const tc of problem.testSuite.cases) {
        const clonedArgs = JSON.parse(JSON.stringify(tc.args));
        const actual = jsFn(...clonedArgs);
        assert.deepEqual(
          actual,
          tc.expected,
          `JS ${problem.id} failed case "${tc.name}": expected ${JSON.stringify(tc.expected)}, got ${JSON.stringify(actual)}`
        );
      }

      // 2. Verify Python 3.12 optimal solution against all test cases
      const pyFile = join(tmpDir, `${problem.id.replace(/[^a-z0-9]/gi, '_')}.py`);
      const pyAssertions = problem.testSuite.cases
        .map(
          (tc) =>
            `assert ${problem.testSuite.entryFunctionName.python}(*json.loads(${JSON.stringify(
              JSON.stringify(tc.args)
            )})) == json.loads(${JSON.stringify(JSON.stringify(tc.expected))}), ${JSON.stringify(
              `Python ${problem.id} failed ${tc.name}`
            )}`
        )
        .join('\n');
      const pySource = `import json\n${optimalVariant.code.python}\n${pyAssertions}\n`;
      writeFileSync(pyFile, pySource, 'utf8');
      const pyRun = spawnSync('python3', [pyFile], { encoding: 'utf8' });
      assert.equal(pyRun.status, 0, pyRun.stderr || pyRun.stdout);
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('pattern recognition weighted rubric sums to 100% and grades accurately', () => {
  const swTopic = getLearningTopicById('dynamic-sliding-window');
  const prPrompt = swTopic?.problems.find((p) => p.patternRecognitionPrompt)?.patternRecognitionPrompt;
  assert.ok(prPrompt, 'sliding window pattern recognition prompt must exist');
  const totalWeight = prPrompt.criteria.reduce((sum, c) => sum + c.weight, 0);
  assert.equal(totalWeight, 100);

  const perfectAnswers = Object.fromEntries(
    prPrompt.criteria.map((c) => [c.criterion, c.options.find((o) => o.isCorrect).id])
  );
  const perfect = scorePatternRecognitionAttempt(prPrompt, perfectAnswers);
  assert.equal(perfect.weightedScorePct, 100);
  assert.equal(perfect.passed, true);

  const wrongAnswers = Object.fromEntries(
    prPrompt.criteria.map((c) => [c.criterion, c.options.find((o) => !o.isCorrect).id])
  );
  const zero = scorePatternRecognitionAttempt(prPrompt, wrongAnswers);
  assert.equal(zero.weightedScorePct, 0);
  assert.equal(zero.passed, false);
});

test('evidence-based mastery never awards Mastered without full 8-dimension proof', () => {
  const ev = createEmptyMasteryEvidence('hashmap-hashset-lookup', '1.0.0');
  assert.equal(computeTopicMastery(ev).level, 'Not Started');

  // Watching lesson + solving 1 easy problem MUST NOT award Mastered
  ev.understandCompleted = true;
  ev.conceptCheckPassed = true;
  ev.implementationsVerified = ['prob-hm-two-sum'];
  const partial = computeTopicMastery(ev);
  assert.notEqual(partial.level, 'Mastered');
  assert.ok(partial.missingForMastery.length > 0);

  // Full evidence across all 8 dimensions awards Mastered
  ev.tracesCompleted = ['trace-hashmap-two-sum', 'trace-hashmap-longest-consecutive'];
  ev.predictionCheckpointsCorrect = 2;
  ev.predictionCheckpointsTotal = 2;
  ev.implementationsVerified = ['prob-hm-two-sum', 'prob-hm-longest-consecutive'];
  ev.edgeCasesPassed = 3;
  ev.debuggingExercisesPassed = ['prob-hm-debug-subarray'];
  ev.patternRecognitionBestPct = 100;
  ev.complexityCheckPassed = true;
  ev.transferAssessmentBestPct = 100;

  const mastered = computeTopicMastery(ev);
  assert.equal(mastered.level, 'Mastered');
  assert.equal(mastered.missingForMastery.length, 0);
});

test('adaptive spaced revision advances on independent recall and pulls back on struggles', () => {
  const now = new Date('2026-11-24T00:00:00.000Z');
  let rev = createInitialRevisionSchedule('dynamic-programming', 'Dynamic Programming', now);
  assert.equal(rev.intervalDays, 1);

  // Strong independent recall advances 1 -> 3 -> 7
  rev = computeNextRevisionSchedule(rev, { scorePct: 95, hintsUsed: 0, timeTakenSec: 80, mistakesCount: 0 }, now);
  assert.equal(rev.intervalDays, 3);
  rev = computeNextRevisionSchedule(rev, { scorePct: 90, hintsUsed: 0, timeTakenSec: 95, mistakesCount: 0 }, now);
  assert.equal(rev.intervalDays, 7);

  // Assisted recall holds interval at Day 7
  rev = computeNextRevisionSchedule(rev, { scorePct: 80, hintsUsed: 1, timeTakenSec: 200, mistakesCount: 0 }, now);
  assert.equal(rev.intervalDays, 7);

  // Struggle pulls back 7 -> 3 and flags needs-reinforcement
  rev = computeNextRevisionSchedule(rev, { scorePct: 50, hintsUsed: 2, timeTakenSec: 400, mistakesCount: 3 }, now);
  assert.equal(rev.intervalDays, 3);
  assert.equal(rev.status, 'needs-reinforcement');

  // Repeated failure resets to Day 1
  rev = computeNextRevisionSchedule(rev, { scorePct: 45, hintsUsed: 3, timeTakenSec: 450, mistakesCount: 4 }, now);
  assert.equal(rev.intervalDays, 1);
  assert.equal(rev.consecutiveFailures, 2);
});
