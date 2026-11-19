import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_ENGINEERING_CURRICULUM, getAcademyCounts } from '../../src/features/ai-academy/data/aiEngineeringCurriculum.ts';
import { AI_ACADEMY_QUIZ_ANSWERS } from '../../server/data/aiAcademyQuizAnswers.ts';

const lessons = AI_ENGINEERING_CURRICULUM.flatMap((phase) =>
  phase.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, phaseId: phase.id, moduleId: module.id })))
);

test('AI Engineering Academy includes seven complete learning phases', () => {
  const counts = getAcademyCounts();
  assert.equal(counts.phases, 7);
  assert.ok(counts.modules >= 25, `expected at least 25 modules, received ${counts.modules}`);
  assert.ok(counts.lessons >= 68, `expected at least 68 lessons, received ${counts.lessons}`);
  assert.deepEqual(AI_ENGINEERING_CURRICULUM.map((phase) => phase.id), [
    'foundations', 'classical-ml', 'deep-learning', 'genai', 'mlops', 'rag-systems', 'agentic-systems',
  ]);
});

test('lesson IDs are unique and every lesson has a complete learning structure', () => {
  const ids = lessons.map((lesson) => lesson.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson IDs must be unique');
  for (const lesson of lessons) {
    assert.ok(lesson.why.length > 20, lesson.id + ' needs a motivation section');
    assert.ok(lesson.analogy.length > 20, lesson.id + ' needs a mental model');
    assert.ok(lesson.explanation.length > 100, lesson.id + ' needs a detailed explanation');
    assert.ok(lesson.keyPoints.length >= 3, lesson.id + ' needs key points');
    assert.ok(lesson.workedExample.length > 30, lesson.id + ' needs a worked example');
    assert.ok(lesson.code.length > 20, lesson.id + ' needs an implementation example');
    assert.ok(lesson.steps.length >= 3, lesson.id + ' needs a visual process');
    for (const step of lesson.steps) {
      assert.ok(step.input.length > 0 && step.output.length > 0 && step.failure.length > 0,
        lesson.id + ' step ' + step.title + ' needs input/output/failure detail');
    }
    assert.equal(lesson.question.options.length, 4, lesson.id + ' needs four quiz options');
    assert.equal('answer' in lesson.question, false, lesson.id + ' must not ship the answer key to the browser');
    assert.ok(lesson.question.explanation.length > 20, lesson.id + ' needs quiz explanation');
    assert.ok(lesson.project.length > 30, lesson.id + ' needs an applied project');
    assert.ok(lesson.pitfalls.length >= 3, lesson.id + ' needs practical pitfalls');
    assert.ok(lesson.next.length > 5, lesson.id + ' needs a next step');
  }
});

test('server-side quiz keys exactly cover the published curriculum', () => {
  const curriculumIds = new Set(lessons.map((lesson) => lesson.id));
  const answerIds = new Set(Object.keys(AI_ACADEMY_QUIZ_ANSWERS));
  assert.deepEqual([...answerIds].sort(), [...curriculumIds].sort(),
    'every lesson must have one server-side quiz key and no stale quiz keys may remain');
  for (const [lessonId, answer] of Object.entries(AI_ACADEMY_QUIZ_ANSWERS)) {
    assert.ok(Number.isInteger(answer) && answer >= 0 && answer < 4, lessonId + ' has an invalid answer index');
  }
});

test('Phase 6 and Phase 7 cover the intended advanced systems topics', () => {
  const rag = AI_ENGINEERING_CURRICULUM.find((phase) => phase.id === 'rag-systems');
  const agents = AI_ENGINEERING_CURRICULUM.find((phase) => phase.id === 'agentic-systems');
  assert.ok(rag && rag.modules.flatMap((module) => module.lessons).length >= 9);
  assert.ok(agents && agents.modules.flatMap((module) => module.lessons).length >= 10);
  const agentIds = new Set(agents.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
  for (const required of [
    'agentic-system-fundamentals', 'agent-loop-control', 'agent-tool-contracts',
    'agent-planning-decomposition', 'agent-workflows-state-machines', 'agent-memory-context',
    'multi-agent-coordination', 'agent-human-approval', 'agent-security-prompt-injection',
    'agent-evaluation-tracing', 'agent-production-architecture', 'agent-protocols-interoperability',
    'agentic-capstone',
  ]) {
    assert.ok(agentIds.has(required), 'missing agentic topic ' + required);
  }
});
