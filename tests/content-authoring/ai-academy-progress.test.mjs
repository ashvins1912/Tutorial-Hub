import test from 'node:test';
import assert from 'node:assert/strict';
import { AIAcademyProgress } from '../../server/models/AIAcademyProgress.ts';
import { gradeAcademyAnswer, isKnownAcademyLesson } from '../../server/routes/aiAcademyProgressRoutes.ts';
import { AI_ACADEMY_QUIZ_ANSWERS } from '../../server/data/aiAcademyQuizAnswers.ts';
import { AI_ENGINEERING_CURRICULUM } from '../../src/features/ai-academy/data/aiEngineeringCurriculum.ts';

test('AI Academy progress is uniquely scoped to authenticated user and lesson', () => {
  const indexes = AIAcademyProgress.schema.indexes();
  assert.ok(indexes.some(([keys, options]) => keys.userId === 1 && keys.lessonId === 1 && options.unique === true));
});

test('AI Academy progress has server-owned completion and quiz fields', () => {
  assert.equal(AIAcademyProgress.schema.path('completed').instance, 'Boolean');
  assert.equal(AIAcademyProgress.schema.path('quizPassed').instance, 'Boolean');
  assert.equal(AIAcademyProgress.schema.path('quizAttempts').options.min, 0);
});

test('only curriculum lesson IDs are accepted', () => {
  assert.equal(isKnownAcademyLesson('python-data-model'), true);
  assert.equal(isKnownAcademyLesson('agentic-capstone'), true);
  assert.equal(isKnownAcademyLesson('rag-graphrag'), true);
  assert.equal(isKnownAcademyLesson('made-up-lesson'), false);
});

test('quiz answer is graded against server-side curriculum answer', () => {
  assert.equal(gradeAcademyAnswer('python-data-model', 1), true);
  assert.equal(gradeAcademyAnswer('python-data-model', 0), false);
  assert.equal(gradeAcademyAnswer('python-data-model', '1'), null);
  assert.equal(gradeAcademyAnswer('python-data-model', 99), null);
  assert.equal(gradeAcademyAnswer('unknown', 1), null);
  assert.equal(gradeAcademyAnswer('agent-tool-contracts', 2), true);
  assert.equal(gradeAcademyAnswer('agent-tool-contracts', 1), false);
});

test('quiz answer registry remains exactly aligned with all seven curriculum phases', () => {
  const ids = AI_ENGINEERING_CURRICULUM.flatMap((phase) =>
    phase.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
  ).sort();
  assert.deepEqual(Object.keys(AI_ACADEMY_QUIZ_ANSWERS).sort(), ids);
  assert.equal(AI_ENGINEERING_CURRICULUM.length, 7);
});
