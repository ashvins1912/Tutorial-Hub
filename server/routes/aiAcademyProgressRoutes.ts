import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { AIAcademyProgress } from '../models/AIAcademyProgress';
import { AI_ACADEMY_QUIZ_ANSWERS } from '../data/aiAcademyQuizAnswers';

const router = express.Router();
router.use(requireAuth);

const lessonIds = new Set(Object.keys(AI_ACADEMY_QUIZ_ANSWERS));

function unavailable(res: Response, message: string) {
  return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message });
}

export function gradeAcademyAnswer(lessonId: string, answer: unknown): boolean | null {
  const correctAnswer = AI_ACADEMY_QUIZ_ANSWERS[lessonId];
  if (correctAnswer === undefined || !Number.isInteger(answer) || (answer as number) < 0 || (answer as number) > 3) return null;
  return answer === correctAnswer;
}

export function isKnownAcademyLesson(lessonId: string): boolean {
  return lessonIds.has(lessonId);
}

router.get('/', async (_req: Request, res: Response) => {
  if (!isMongoConnected()) {
    return unavailable(res, 'AI Academy progress is temporarily unavailable.');
  }
  try {
    const records = await AIAcademyProgress.find({ userId: _req.authUser!.id })
      .sort({ lastAccessedAt: -1 }).limit(500).lean();
    const completed = records.filter((item) => item.completed).map((item) => item.lessonId);
    const quizPassed = records.filter((item) => item.quizPassed).map((item) => item.lessonId);
    const publicRecords = records.map(({ userId: _userId, ...record }) => record);
    const totalLessons = lessonIds.size;
    return res.json({
      progress: { completed, quizPassed, records: publicRecords },
      summary: {
        totalLessons,
        completedLessons: completed.length,
        quizPassedLessons: quizPassed.length,
        completionPercent: totalLessons ? Math.round(completed.length / totalLessons * 100) : 0,
      },
    });
  } catch (error) {
    console.error('[AI Academy] Progress read failed:', error instanceof Error ? error.message : 'unknown error');
    return unavailable(res, 'AI Academy progress could not be loaded. Please retry.');
  }
});

router.put('/:lessonId', async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  if (!isKnownAcademyLesson(lessonId)) return res.status(404).json({ code: 'UNKNOWN_ACADEMY_LESSON' });
  if (!isMongoConnected()) {
    return unavailable(res, 'AI Academy progress cannot be saved right now.');
  }

  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ code: 'INVALID_PROGRESS_PAYLOAD' });
  }
  const keys = Object.keys(body);
  if (body.action === 'complete') {
    if (keys.some((key) => key !== 'action')) return res.status(400).json({ code: 'INVALID_PROGRESS_PAYLOAD' });
  } else if (body.action === 'quiz') {
    if (keys.some((key) => key !== 'action' && key !== 'answer') || !keys.includes('answer')) {
      return res.status(400).json({ code: 'INVALID_PROGRESS_PAYLOAD' });
    }
  } else {
    return res.status(400).json({ code: 'INVALID_PROGRESS_ACTION' });
  }

  const now = new Date();
  const set: Record<string, unknown> = { lastAccessedAt: now };
  const update: Record<string, unknown> = { $set: set, $setOnInsert: { userId: req.authUser!.id, lessonId } };

  if (body.action === 'complete') {
    set.completed = true;
    set.completedAt = now;
  } else {
    const correct = gradeAcademyAnswer(lessonId, body.answer);
    if (correct === null) return res.status(400).json({ code: 'INVALID_QUIZ_ANSWER' });
    set.quizLastCorrect = correct;
    if (correct) set.quizPassed = true;
    update.$inc = { quizAttempts: 1 };
  }

  try {
    const record = await AIAcademyProgress.findOneAndUpdate(
      { userId: req.authUser!.id, lessonId }, update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();

    if (!record) return res.status(503).json({ code: 'PROGRESS_WRITE_UNAVAILABLE' });
    const { userId: _userId, ...publicRecord } = record;
    return res.json({
      ok: true,
      record: publicRecord,
      grading: body.action === 'quiz' ? { correct: record.quizLastCorrect, passed: record.quizPassed } : undefined,
    });
  } catch (error) {
    console.error('[AI Academy] Progress write failed:', error instanceof Error ? error.message : 'unknown error');
    return unavailable(res, 'AI Academy progress could not be saved. Please retry.');
  }
});

export default router;
