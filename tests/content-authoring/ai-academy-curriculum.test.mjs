import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_ENGINEERING_CURRICULUM, getAcademyCounts } from '../../src/features/ai-academy/data/aiEngineeringCurriculum.ts';

test('AI Engineering Academy has expanded beyond the initial 24 lessons', () => {
  const counts = getAcademyCounts();
  assert.equal(counts.phases, 5);
  assert.ok(counts.modules >= 15, `expected at least 15 modules, received ${counts.modules}`);
  assert.ok(counts.lessons >= 35, `expected at least 35 lessons, received ${counts.lessons}`);
});

test('lesson IDs are unique and every lesson has a complete learning structure', () => {
  const lessons = AI_ENGINEERING_CURRICULUM.flatMap((phase) => phase.modules.flatMap((module) => module.lessons));
  const ids = lessons.map((lesson) => lesson.id);
  assert.equal(new Set(ids).size, ids.length, 'lesson IDs must be unique');
  for (const lesson of lessons) {
    assert.ok(lesson.why.length > 20, lesson.id + ' needs a motivation section');
    assert.ok(lesson.analogy.length > 20, lesson.id + ' needs a mental model');
    assert.ok(lesson.explanation.length > 30, lesson.id + ' needs an explanation');
    assert.ok(lesson.keyPoints.length >= 3, lesson.id + ' needs key points');
    assert.ok(lesson.steps.length >= 3, lesson.id + ' needs a visual process');
    assert.equal(lesson.question.options.length, 4, lesson.id + ' needs four quiz options');
    assert.equal('answer' in lesson.question, false, lesson.id + ' must not ship the answer key to the browser');
    assert.ok(lesson.project.length > 20, lesson.id + ' needs an applied project');
  }
});
