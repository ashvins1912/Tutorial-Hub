import express, { Request, Response } from 'express';
import { BigTechCompany, CompanySprint as CompanySprintType } from '../../src/types/dsa';
import {
  COMPANY_SPRINT_META,
  computeSprintMetrics,
  generate14DaySprint,
} from '../services/sprintGeneratorService';
import {
  CompanySprint as CompanySprintModel,
  ISprintDaySchedule,
  ISprintTask,
} from '../models/CompanySprint';
import { isMongoConnected } from '../db/connectMongo';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
router.use(requireAuth);

// In-memory store fallback when MONGODB_URI is not set
const activeSprintByUser = new Map<string, CompanySprintType>();
const sprintById = new Map<string, CompanySprintType>();

function serializeMongoSprint(doc: any): CompanySprintType {
  const weightsObj: Record<string, number> =
    doc.companyPatternWeights instanceof Map
      ? Object.fromEntries(doc.companyPatternWeights.entries())
      : doc.companyPatternWeights || {};

  const sprint: CompanySprintType = {
    id: doc._id.toString(),
    userId: doc.userId,
    targetCompany: doc.targetCompany,
    dailyMinutesBudget: doc.dailyMinutesBudget,
    startDate: new Date(doc.startDate).toISOString(),
    currentDay: doc.currentDay,
    companyPatternWeights: weightsObj,
    dailySchedule: doc.dailySchedule,
    completionPct: 0,
    readinessScore: 28,
  };
  const metrics = computeSprintMetrics(sprint);
  sprint.completionPct = metrics.completionPct;
  sprint.readinessScore = metrics.readinessScore;
  return sprint;
}

// GET /api/sprints/companies/meta
router.get('/companies/meta', (_req: Request, res: Response) => {
  res.json({ companies: Object.values(COMPANY_SPRINT_META) });
});

// POST /api/sprints/create
router.post('/create', async (req: Request, res: Response) => {
  const {

    targetCompany = 'Google',
    dailyMinutesBudget = 60,
  } = req.body ?? {};

  const userId = req.authUser!.id;
  const validCompanies: BigTechCompany[] = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'];
  const company: BigTechCompany = validCompanies.includes(targetCompany)
    ? targetCompany
    : 'Google';
  const budget: 60 | 120 = dailyMinutesBudget === 120 ? 120 : 60;

  const sprint = generate14DaySprint(userId, company, budget);

  if (isMongoConnected()) {
    const doc = await CompanySprintModel.create({
      userId: sprint.userId,
      targetCompany: sprint.targetCompany,
      dailyMinutesBudget: sprint.dailyMinutesBudget,
      startDate: new Date(sprint.startDate),
      currentDay: sprint.currentDay,
      companyPatternWeights: sprint.companyPatternWeights,
      dailySchedule: sprint.dailySchedule,
    });
    return res.status(201).json({ sprint: serializeMongoSprint(doc) });
  }

  activeSprintByUser.set(userId, sprint);
  sprintById.set(sprint.id, sprint);

  return res.status(201).json({ sprint });
});

// GET /api/sprints/active/:userId
router.get('/active/:userId', async (req: Request, res: Response) => {
  const userId = req.authUser!.id;

  let sprint: CompanySprintType | null = null;

  if (isMongoConnected()) {
    const doc = await CompanySprintModel.findOne({ userId }).sort({ createdAt: -1 });
    if (doc) {
      sprint = serializeMongoSprint(doc);
    }
  } else {
    sprint = activeSprintByUser.get(userId) ?? null;
  }

  if (!sprint) {
    return res.json({ sprint: null });
  }

  const metrics = computeSprintMetrics(sprint);
  sprint.completionPct = metrics.completionPct;
  sprint.readinessScore = metrics.readinessScore;

  const currentDaySchedule =
    sprint.dailySchedule.find((d) => d.dayNumber === sprint.currentDay) ??
    sprint.dailySchedule[0];

  return res.json({
    sprint,
    completionPct: metrics.completionPct,
    readinessScore: metrics.readinessScore,
    unlockedTasksToday: currentDaySchedule.tasks,
  });
});

// PATCH /api/sprints/:sprintId/complete-task
router.patch('/:sprintId/complete-task', async (req: Request, res: Response) => {
  const { sprintId } = req.params;
  const { dayNumber, taskId, scoreEarned = 90 } = req.body ?? {};

  if (isMongoConnected()) {
    const doc = await CompanySprintModel.findOne({ _id: sprintId, userId: req.authUser!.id });
    if (!doc) {
      return res.status(404).json({ error: 'Sprint not found' });
    }
    const dayObj = doc.dailySchedule.find(
      (d: ISprintDaySchedule) => d.dayNumber === Number(dayNumber)
    );
    if (!dayObj) return res.status(404).json({ error: 'Sprint day not found' });

    const task = dayObj.tasks.find((t: ISprintTask) => t.taskId === taskId);
    if (!task) return res.status(404).json({ error: 'Sprint task not found' });

    task.isCompleted = true;
    task.scoreEarned = Math.max(task.scoreEarned, Number(scoreEarned) || 90);

    const allDayTasksComplete = dayObj.tasks.every((t: ISprintTask) => t.isCompleted);
    let unlockedNextDay = false;

    if (allDayTasksComplete && dayObj.dayNumber < 14) {
      const nextDay = doc.dailySchedule.find(
        (d: ISprintDaySchedule) => d.dayNumber === dayObj.dayNumber + 1
      );
      if (nextDay && !nextDay.isUnlocked) {
        nextDay.isUnlocked = true;
        unlockedNextDay = true;
      }
      if (doc.currentDay < dayObj.dayNumber + 1) {
        doc.currentDay = dayObj.dayNumber + 1;
      }
    }

    await doc.save();
    return res.json({
      sprint: serializeMongoSprint(doc),
      allDayTasksComplete,
      unlockedNextDay,
    });
  }

  const sprint = sprintById.get(sprintId);
  if (sprint && sprint.userId !== req.authUser!.id) return res.status(404).json({ error: 'Sprint not found' });
  if (!sprint) {
    return res.status(404).json({ error: 'Sprint not found' });
  }

  const dayObj = sprint.dailySchedule.find((d) => d.dayNumber === Number(dayNumber));
  if (!dayObj) {
    return res.status(404).json({ error: 'Sprint day not found' });
  }

  const task = dayObj.tasks.find((t) => t.taskId === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Sprint task not found' });
  }

  task.isCompleted = true;
  task.scoreEarned = Math.max(task.scoreEarned, Number(scoreEarned) || 90);

  const allDayTasksComplete = dayObj.tasks.every((t) => t.isCompleted);
  let unlockedNextDay = false;

  if (allDayTasksComplete && dayObj.dayNumber < 14) {
    const nextDay = sprint.dailySchedule.find((d) => d.dayNumber === dayObj.dayNumber + 1);
    if (nextDay && !nextDay.isUnlocked) {
      nextDay.isUnlocked = true;
      unlockedNextDay = true;
    }
    if (sprint.currentDay < dayObj.dayNumber + 1) {
      sprint.currentDay = dayObj.dayNumber + 1;
    }
  }

  const metrics = computeSprintMetrics(sprint);
  sprint.completionPct = metrics.completionPct;
  sprint.readinessScore = metrics.readinessScore;

  return res.json({
    sprint,
    allDayTasksComplete,
    unlockedNextDay,
  });
});

export default router;
