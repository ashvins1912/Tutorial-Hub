import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { AIAcademyProgress } from '../models/AIAcademyProgress';
import { AI_ENGINEERING_CURRICULUM } from '../../src/features/ai-academy/data/aiEngineeringCurriculum';

const router = express.Router();
router.use(requireAuth);

const lessons = new Map(
  AI_ENGINEERING_CURRICULUM.flatMap((phase) =>
    phase.modules.flatMap((module) => module.lessons.map((lesson) => [lesson.id, lesson] as const))
  )
);

export function gradeAcademyAnswer(lessonId: string, answer: unknown): boolean | null {
  const lesson = lessons.get(lessonId);
  if (!lesson || !Number.isInteger(answer) || (answer as number) < 0 || (answer as number) >= lesson.question.options.length) return null;
  return answer === lesson.question.answer;
}

export function isKnownAcademyLesson(lessonId: string): boolean {
  return lessons.has(lessonId);
}

router.get('/', async (req: Request, res: Response) => {
  if (!isMongoConnected()) {
    return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'AI Academy progress is temporarily unavailable.' });
  }
  const records = await AIAcademyProgress.find({ userId: req.authUser!.id })
    .sort({ lastAccessedAt: -1 }).limit(500).lean();
  const completed = records.filter((item) => item.completed).map((item) => item.lessonId);
  const quizPassed = records.filter((item) => item.quizPassed).map((item) => item.lessonId);
  const totalLessons = lessons.size;
  return res.json({
    progress: { completed, quizPassed, records },
    summary: {
      totalLessons,
      completedLessons: completed.length,
      quizPassedLessons: quizPassed.length,
      completionPercent: totalLessons ? Math.round(completed.length / totalLessons * 100) : 0,
    },
  });
});

router.put('/:lessonId', async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  if (!isKnownAcademyLesson(lessonId)) return res.status(404).json({ code: 'UNKNOWN_ACADEMY_LESSON' });
  if (!isMongoConnected()) {
    return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'AI Academy progress cannot be saved right now.' });
  }

  const body = req.body || {};
  const now = new Date();
  const set: Record<string, unknown> = { lastAccessedAt: now };
  const update: Record<string, unknown> = { $set: set, $setOnInsert: { userId: req.authUser!.id, lessonId } };

  if (body.action === 'complete') {
    set.completed = true;
    set.completedAt = now;
  } else if (body.action === 'quiz') {
    const correct = gradeAcademyAnswer(lessonId, body.answer);
    if (correct === null) return res.status(400).json({ code: 'INVALID_QUIZ_ANSWER' });
    set.quizLastCorrect = correct;
    if (correct) set.quizPassed = true;
    update.$inc = { quizAttempts: 1 };
  } else {
    return res.status(400).json({ code: 'INVALID_PROGRESS_ACTION' });
  }

  const record = await AIAcademyProgress.findOneAndUpdate(
    { userId: req.authUser!.id, lessonId }, update,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();

  return res.json({
    ok: true,
    record,
    grading: body.action === 'quiz' ? { correct: record?.quizLastCorrect, passed: record?.quizPassed } : undefined,
  });
});

export default router;
