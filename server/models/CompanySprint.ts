import mongoose, { Schema, Document } from 'mongoose';

export type SprintTaskType =
  | 'PatternWarmup'
  | 'CoreProblem'
  | 'SpacedRecall'
  | 'BlindArena'
  | 'Mock45Sim';

export interface ISprintTask {
  taskId: string;
  taskType: SprintTaskType;
  problemId: Schema.Types.ObjectId | string;
  problemSlug: string;
  problemNumber: number;
  problemTitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topicCategory: string;
  twistConstraint: string;
  isCompleted: boolean;
  scoreEarned: number;
  estimatedMinutes: number;
  labProblemId?: string;
}

export interface ISprintDaySchedule {
  dayNumber: number;
  phaseTitle: string;
  focusPattern: string;
  patternTriggerReminder: string;
  companyInsiderTip: string;
  isUnlocked: boolean;
  tasks: ISprintTask[];
}

export interface ICompanySprint extends Document {
  userId: string;
  targetCompany: 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'Apple';
  dailyMinutesBudget: 60 | 120;
  startDate: Date;
  currentDay: number;
  companyPatternWeights: Map<string, number> | Record<string, number>;
  dailySchedule: ISprintDaySchedule[];
}

const SprintTaskSchema = new Schema<ISprintTask>(
  {
    taskId: { type: String, required: true },
    taskType: {
      type: String,
      enum: ['PatternWarmup', 'CoreProblem', 'SpacedRecall', 'BlindArena', 'Mock45Sim'],
      required: true,
    },
    problemId: { type: Schema.Types.Mixed, ref: 'Problem', required: true },
    problemSlug: { type: String, required: true },
    problemNumber: { type: Number, required: true },
    problemTitle: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    topicCategory: { type: String, required: true },
    twistConstraint: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    scoreEarned: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 25 },
    labProblemId: { type: String },
  },
  { _id: false }
);

const SprintDayScheduleSchema = new Schema<ISprintDaySchedule>(
  {
    dayNumber: { type: Number, min: 1, max: 14, required: true },
    phaseTitle: { type: String, required: true },
    focusPattern: { type: String, required: true },
    patternTriggerReminder: { type: String, required: true },
    companyInsiderTip: { type: String, required: true },
    isUnlocked: { type: Boolean, default: false },
    tasks: [SprintTaskSchema],
  },
  { _id: false }
);

const CompanySprintSchema = new Schema<ICompanySprint>(
  {
    userId: { type: String, required: true, index: true },
    targetCompany: {
      type: String,
      enum: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
      required: true,
    },
    dailyMinutesBudget: {
      type: Number,
      enum: [60, 120],
      required: true,
    },
    startDate: { type: Date, default: Date.now },
    currentDay: { type: Number, min: 1, max: 14, default: 1 },
    companyPatternWeights: {
      type: Map,
      of: Number,
      default: {},
    },
    dailySchedule: [SprintDayScheduleSchema],
  },
  { timestamps: true }
);

export const CompanySprint: mongoose.Model<ICompanySprint> =
  (mongoose.models.CompanySprint as mongoose.Model<ICompanySprint> | undefined) ||
  mongoose.model<ICompanySprint>('CompanySprint', CompanySprintSchema);
