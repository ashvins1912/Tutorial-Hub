export const MONGOOSE_SCHEMAS_SOURCE = `import mongoose, { Schema, Document } from 'mongoose';

// 1. Pattern Schema — 6 Tiers & 18 Core Algorithmic Patterns
export interface IPattern extends Document {
  slug: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  difficulty: 'Easy' | 'Easy-Med' | 'Medium' | 'Med-Hard' | 'Hard' | 'Hardest';
  name: string;
  topicGroup: string;
  signalClues: string[];
  bruteProgression: string;
  optimalProgression: string;
  targetTimeBigO: string;
  targetSpaceBigO: string;
  canonicalProblems: string[];
}

const PatternSchema = new Schema<IPattern>({
  slug: { type: String, required: true, unique: true, index: true },
  tier: { type: Number, required: true, min: 1, max: 6 },
  difficulty: {
    type: String,
    enum: ['Easy', 'Easy-Med', 'Medium', 'Med-Hard', 'Hard', 'Hardest'],
    required: true,
  },
  name: { type: String, required: true },
  topicGroup: { type: String, required: true },
  signalClues: [{ type: String, required: true }],
  bruteProgression: { type: String, required: true },
  optimalProgression: { type: String, required: true },
  targetTimeBigO: { type: String, required: true },
  targetSpaceBigO: { type: String, required: true },
  canonicalProblems: [{ type: String }],
}, { timestamps: true });

// 2. Problem Schema — Signal Phrases, Line-Mapped Blocks & Race Keyframes
export interface IProblem extends Document {
  slug: string;
  number: number;
  title: string;
  difficulty: string;
  patternId: mongoose.Types.ObjectId;
  inputSizeExponent: number;
  statementSegments: { text: string; signalId?: string }[];
  signals: {
    id: string;
    phrase: string;
    impliedConstraint: string;
    eliminatedPatterns: string[];
    triggeredPatterns: string[];
    complexityHint: string;
  }[];
  quizOptions: {
    id: string;
    pattern: string;
    dataStructure: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  blocks: {
    id: string;
    label: string;
    category: 'Variables & Pointers' | 'Loops' | 'Conditionals' | 'Data Structure Ops';
    targetSlot: 'init' | 'loop' | 'update';
    mode: 'brute' | 'optimal' | 'distractor';
    code: { java: string[]; js: string[]; python: string[] };
  }[];
  raceKeyframes: {
    datasetValues: Schema.Types.Mixed[];
    bruteFrames: Schema.Types.Mixed[];
    optimalFrames: Schema.Types.Mixed[];
  };
  interviewContext: {
    companies: string[];
    followUpTwists: { twist: string; adaptation: string }[];
    relatedProblems: { title: string; difficulty: string; sharedTrigger: string }[];
  };
}

const ProblemSchema = new Schema<IProblem>({
  slug: { type: String, required: true, unique: true, index: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  patternId: { type: Schema.Types.ObjectId, ref: 'Pattern', required: true },
  inputSizeExponent: { type: Number, required: true, min: 2, max: 6 },
  statementSegments: [{ text: String, signalId: String }],
  signals: [{
    id: String,
    phrase: String,
    impliedConstraint: String,
    eliminatedPatterns: [String],
    triggeredPatterns: [String],
    complexityHint: String,
  }],
  quizOptions: [{
    id: String,
    pattern: String,
    dataStructure: String,
    isCorrect: Boolean,
    feedback: String,
  }],
  blocks: [{
    id: String,
    label: String,
    category: String,
    targetSlot: String,
    mode: String,
    code: {
      java: [String],
      js: [String],
      python: [String],
    },
  }],
  raceKeyframes: {
    datasetValues: [Schema.Types.Mixed],
    bruteFrames: [Schema.Types.Mixed],
    optimalFrames: [Schema.Types.Mixed],
  },
  interviewContext: {
    companies: [String],
    followUpTwists: [{ twist: String, adaptation: String }],
    relatedProblems: [{ title: String, difficulty: String, sharedTrigger: String }],
  },
}, { timestamps: true });

// 3. UserMastery Schema — Stage Progression & Pattern Proficiency
export interface IUserMastery extends Document {
  userId: string;
  problemProgress: Map<string, {
    highestUnlockedStage: number;
    quizSolved: boolean;
    sandboxCompleted: boolean;
    bruteBuilt: boolean;
    bottleneckSolved: boolean;
    optimalBuilt: boolean;
    lastLanguage: 'java' | 'js' | 'python';
  }>;
  masteredPatternSlugs: string[];
}

const UserMasterySchema = new Schema<IUserMastery>({
  userId: { type: String, required: true, unique: true, index: true },
  problemProgress: {
    type: Map,
    of: new Schema({
      highestUnlockedStage: { type: Number, default: 1 },
      quizSolved: { type: Boolean, default: false },
      sandboxCompleted: { type: Boolean, default: false },
      bruteBuilt: { type: Boolean, default: false },
      bottleneckSolved: { type: Boolean, default: false },
      optimalBuilt: { type: Boolean, default: false },
      lastLanguage: { type: String, enum: ['java', 'js', 'python'], default: 'python' },
    }, { _id: false }),
    default: {},
  },
  masteredPatternSlugs: [{ type: String }],
}, { timestamps: true });

// 4. CompanySprint Schema — 14-Day Weighted Company Sprint & Daily War-Room
export interface ICompanySprint extends Document {
  userId: string;
  targetCompany: 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'Apple';
  dailyMinutesBudget: 60 | 120;
  startDate: Date;
  currentDay: number;
  companyPatternWeights: Map<string, number>;
  dailySchedule: {
    dayNumber: number;
    phaseTitle: string;
    focusPattern: string;
    companyInsiderTip: string;
    tasks: {
      taskType: 'PatternWarmup' | 'CoreProblem' | 'SpacedRecall' | 'BlindArena' | 'Mock45Sim';
      problemId: mongoose.Types.ObjectId;
      twistConstraint: string;
      isCompleted: boolean;
      scoreEarned: number;
    }[];
  }[];
}

const CompanySprintSchema = new Schema<ICompanySprint>({
  userId: { type: String, required: true, index: true },
  targetCompany: { type: String, enum: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'], required: true },
  dailyMinutesBudget: { type: Number, enum: [60, 120], required: true },
  startDate: { type: Date, default: Date.now },
  currentDay: { type: Number, min: 1, max: 14, default: 1 },
  companyPatternWeights: { type: Map, of: Number },
  dailySchedule: [{
    dayNumber: Number,
    phaseTitle: String,
    focusPattern: String,
    companyInsiderTip: String,
    tasks: [{
      taskType: { type: String, enum: ['PatternWarmup', 'CoreProblem', 'SpacedRecall', 'BlindArena', 'Mock45Sim'] },
      problemId: { type: Schema.Types.ObjectId, ref: 'Problem' },
      twistConstraint: String,
      isCompleted: { type: Boolean, default: false },
      scoreEarned: { type: Number, default: 0 },
    }],
  }],
}, { timestamps: true });

export const PatternModel = mongoose.model<IPattern>('Pattern', PatternSchema);
export const ProblemModel = mongoose.model<IProblem>('Problem', ProblemSchema);
export const UserMasteryModel = mongoose.model<IUserMastery>('UserMastery', UserMasterySchema);
export const CompanySprintModel = mongoose.model<ICompanySprint>('CompanySprint', CompanySprintSchema);
`;
