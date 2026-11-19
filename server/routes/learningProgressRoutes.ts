import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/requireAuth';
import { isMongoConnected } from '../db/connectMongo';
import { LearningProgress } from '../models/LearningProgress';
import { ContentAuthoringJob } from '../modules/content-authoring/ContentAuthoringJob';

const router = express.Router();
router.use(requireAuth);

function validLessonId(value: string) {
  return mongoose.Types.ObjectId.isValid(value);
}

export function buildAccessibleLessonFilter(lessonId: string, userId: string) {
  return { _id: lessonId, $or: [{ ownerId: userId }, { publishedAt: { $type: 'date' } }] };
}

async function findAccessibleLesson(lessonId: string, userId: string) {
  if (!validLessonId(lessonId)) return null;
  return ContentAuthoringJob.findOne(buildAccessibleLessonFilter(lessonId, userId)).select('generatedLesson.quiz').lean();
}

export function calculateQuizScore(quiz: Array<{ correctAnswer: string | string[] }>, answers: Record<string, string>) {
  if (Object.keys(answers).length !== quiz.length || quiz.some((_, index) => typeof answers[String(index)] !== 'string')) return null;
  return quiz.reduce((score, question, index) => {
    const expected = (Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer]).map((value) => String(value).trim().toLowerCase()).sort();
    const actual = (answers[String(index)] || '').split('|').filter(Boolean).map((value) => value.trim().toLowerCase()).sort();
    return score + (expected.length === actual.length && expected.every((value, itemIndex) => value === actual[itemIndex]) ? 1 : 0);
  }, 0);
}

function normalizeAnswers(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 40) return null;
  const result: Record<string, string> = {};
  for (const [key, answer] of entries) {
    if (!/^\d{1,3}$/.test(key) || typeof answer !== 'string' || answer.length > 1000) return null;
    result[key] = answer;
  }
  return result;
}

router.get('/:lessonId', async (req: Request, res: Response) => {
  if (!validLessonId(req.params.lessonId)) return res.status(400).json({ code: 'INVALID_LESSON_ID' });
  if (!isMongoConnected()) return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'Progress cannot be persisted while the database is unavailable.' });
  const lesson = await findAccessibleLesson(req.params.lessonId, req.authUser!.id);
  if (!lesson) return res.status(404).json({ code: 'LESSON_NOT_FOUND' });
  const progress = await LearningProgress.findOne({ userId: req.authUser!.id, lessonId: req.params.lessonId }).lean();
  const latestAttempt = progress?.quizHistory?.[progress.quizHistory.length - 1];
  const grading = latestAttempt && Array.isArray(lesson.generatedLesson?.quiz) ? {
    score: latestAttempt.score,
    total: latestAttempt.total,
    accuracy: latestAttempt.accuracy,
    correctAnswers: lesson.generatedLesson.quiz.map((question: any) => question.correctAnswer),
  } : null;
  return res.json({ progress: progress || null, grading });
});

router.put('/:lessonId', async (req: Request, res: Response) => {
  if (!validLessonId(req.params.lessonId)) return res.status(400).json({ code: 'INVALID_LESSON_ID' });
  if (!isMongoConnected()) return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'Progress cannot be persisted while the database is unavailable.' });
  const lesson = await findAccessibleLesson(req.params.lessonId, req.authUser!.id);
  if (!lesson) return res.status(404).json({ code: 'LESSON_NOT_FOUND' });
  const body = req.body || {};
  const update: Record<string, unknown> = { lastAccessedAt: new Date() };
  let quizAccuracy: number | null = null;
  let quizScore = 0;
  let quizGrading: { score: number; total: number; accuracy: number; correctAnswers: Array<string | string[]> } | null = null;
  if (body.resetQuiz === true) { update.lastScore = null; update.lastAnswers = {}; }
  if (body.algorithm !== undefined) {
    if (!['binary-search', 'bubble-sort'].includes(body.algorithm)) return res.status(400).json({ code: 'INVALID_ALGORITHM' });
    update.algorithm = body.algorithm;
  }
  if (body.input !== undefined) {
    if (typeof body.input !== 'string' || body.input.length > 300) return res.status(400).json({ code: 'INVALID_INPUT' });
    update.input = body.input;
  }
  if (body.target !== undefined) {
    if (typeof body.target !== 'string' || body.target.length > 32) return res.status(400).json({ code: 'INVALID_TARGET' });
    update.target = body.target;
  }
  if (body.currentStep !== undefined) {
    if (!Number.isInteger(body.currentStep) || body.currentStep < 0 || body.currentStep > 100) return res.status(400).json({ code: 'INVALID_STEP' });
    update.currentStep = body.currentStep;
  }
  if (body.quizAttempt !== undefined) {
    const attempt = body.quizAttempt;
    const quiz = lesson.generatedLesson?.quiz;
    if (!attempt || !Array.isArray(quiz) || quiz.length < 1 || quiz.length > 40 || attempt.total !== quiz.length) {
      return res.status(400).json({ code: 'INVALID_QUIZ_ATTEMPT' });
    }
    const normalizedAnswers = normalizeAnswers(attempt.answers);
    if (!normalizedAnswers) return res.status(400).json({ code: 'INVALID_QUIZ_ANSWERS' });
    const calculatedScore = calculateQuizScore(quiz, normalizedAnswers);
    if (calculatedScore === null) return res.status(400).json({ code: 'QUIZ_ANSWERS_INCOMPLETE' });
    quizScore = calculatedScore;
    const accuracy = Math.round((quizScore / quiz.length) * 100);
    const previous = await LearningProgress.findOne({ userId: req.authUser!.id, lessonId: req.params.lessonId }).select('bestScore').lean();
    const bestAccuracy = Math.max(previous?.bestScore || 0, accuracy);
    quizAccuracy = accuracy;
    update.lastScore = accuracy;
    update.quizTotal = quiz.length;
    update.masteryLevel = bestAccuracy >= 80 ? 'advanced' : bestAccuracy >= 50 ? 'intermediate' : 'beginner';
    update.lastAnswers = normalizedAnswers;
    quizGrading = { score: quizScore, total: quiz.length, accuracy, correctAnswers: quiz.map((question: any) => question.correctAnswer) };
  }
  if (body.completedPracticeIds !== undefined) {
    if (!Array.isArray(body.completedPracticeIds) || body.completedPracticeIds.length > 100 || body.completedPracticeIds.some((id: unknown) => typeof id !== 'string' || id.length > 100)) {
      return res.status(400).json({ code: 'INVALID_PRACTICE_PROGRESS' });
    }
    update.completedPracticeIds = [...new Set(body.completedPracticeIds)];
  }
  const atomicUpdate: Record<string, unknown> = { $set: update, $setOnInsert: { userId: req.authUser!.id, lessonId: req.params.lessonId } };
  if (quizAccuracy !== null) {
    atomicUpdate.$inc = { attempts: 1 };
    atomicUpdate.$max = { bestScore: quizAccuracy };
    atomicUpdate.$push = { quizHistory: { $each: [{ score: quizScore, total: (body.quizAttempt as { total: number }).total, accuracy: quizAccuracy, attemptedAt: new Date() }], $slice: -30 } };
  }
  const progress = await LearningProgress.findOneAndUpdate(
    { userId: req.authUser!.id, lessonId: req.params.lessonId },
    atomicUpdate,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
  return res.json({ ok: true, progress, grading: quizGrading });
});

router.get('/', async (req: Request, res: Response) => {
  if (!isMongoConnected()) return res.status(503).json({ code: 'DATABASE_UNAVAILABLE' });
  const records = await LearningProgress.find({ userId: req.authUser!.id }).sort({ lastAccessedAt: -1 }).limit(200).lean();
  const totalLessons = records.length;
  const masteredLessons = records.filter((item) => item.masteryLevel === 'advanced').length;
  const averageScore = totalLessons ? Math.round(records.reduce((sum, item) => sum + (item.bestScore || 0), 0) / totalLessons) : 0;
  return res.json({ progress: records, summary: { totalLessons, masteredLessons, averageScore } });
});

export default router;
