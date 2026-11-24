import mongoose, { Schema, Document } from 'mongoose';

const PipelineSchema = new Schema(
  {
    availableBlocks: [
      {
        id: String,
        category: String,
        label: String,
        isDistractor: Boolean,
        socraticHint: String,
      },
    ],
    correctSequence: [String],
    complexity: {
      time: String,
      space: String,
    },
    codeTemplates: {
      java: String,
      javascript: String,
      python: String,
    },
    blockLineMap: {
      type: Map,
      of: new Schema(
        {
          java: [Number],
          javascript: [Number],
          python: [Number],
        },
        { _id: false }
      ),
    },
  },
  { _id: false }
);

export type BigTechTopicCategory =
  | 'Arrays & Prefix Sum'
  | 'Two Pointers'
  | 'Sliding Window'
  | 'Modified Binary Search'
  | 'Linked Lists'
  | 'Monotonic Stack'
  | 'Trees DFS/BFS'
  | 'Heaps & Intervals'
  | 'Graphs & Topo Sort'
  | 'Union-Find & Shortest Path'
  | 'Backtracking & Tries'
  | 'Dynamic Programming';

export type BigTechCompany = 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'Apple';

export interface IProblem extends Document {
  slug: string;
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Hardest';
  topicCategory: BigTechTopicCategory;
  collections: string[];
  primaryPattern: string;
  secondaryStructure: string;
  topicId: string;
  contextStory: string;
  ahaInsight: string;
  companyTags: string[];
  bigTechFrequency: {
    company: BigTechCompany;
    frequencyScore: number;
    lastAskedTag: string;
  }[];
  howToIdentify: {
    keywordTriggers: string[];
    eliminatorRule: string;
    mentalModelQuestion: string;
  };
  interviewSolutionLadder: {
    clarifyingQuestions: {
      question: string;
      interviewerAnswer: string;
      isCritical: boolean;
    }[];
    bruteForcePitch: {
      explanation: string;
      bottleneck: string;
      time: string;
      space: string;
    };
    optimalPitch: {
      explanation: string;
      invariant: string;
      time: string;
      space: string;
    };
    interviewerFollowUp: {
      twist: string;
      adaptation: string;
    };
  };
  signalPhrases: {
    phrase: string;
    impliedConstraint: string;
    triggeredPattern: string;
  }[];
  inputConstraintMax: number;
  allowedComplexities: string[];
  tleComplexities: string[];
  sandboxInitialData: Schema.Types.Mixed;
  bruteForcePipeline: unknown;
  betterPipeline: unknown;
  optimalPipeline: unknown;
  srtbotConfig?: {
    subproblemOptions: string[];
    relationOptions: string[];
    topoOrderOptions: string[];
    baseCaseOptions: string[];
    originalOptions: string[];
    timeOptions: string[];
    correctAnswers: Record<string, string>;
  };
  followUpTwists: {
    twistTitle: string;
    constraintChange: string;
    newOptimalApproach: string;
  }[];
  feynmanPrompt: {
    sentenceTemplate: string;
    missingKeywords: string[];
  };
}

const ProblemSchema = new Schema<IProblem>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Hardest'],
      required: true,
    },
    topicCategory: {
      type: String,
      enum: [
        'Arrays & Prefix Sum',
        'Two Pointers',
        'Sliding Window',
        'Modified Binary Search',
        'Linked Lists',
        'Monotonic Stack',
        'Trees DFS/BFS',
        'Heaps & Intervals',
        'Graphs & Topo Sort',
        'Union-Find & Shortest Path',
        'Backtracking & Tries',
        'Dynamic Programming',
      ],
      required: true,
      index: true,
    },
    collections: [{ type: String }],
    primaryPattern: { type: String, required: true, index: true },
    secondaryStructure: { type: String, default: 'None' },
    topicId: { type: String, required: true },
    contextStory: { type: String, required: true },
    ahaInsight: { type: String, required: true },
    companyTags: [{ type: String }],
    bigTechFrequency: [
      {
        company: {
          type: String,
          enum: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
          required: true,
        },
        frequencyScore: { type: Number, min: 1, max: 100, required: true },
        lastAskedTag: { type: String, required: true },
      },
    ],
    howToIdentify: {
      keywordTriggers: [String],
      eliminatorRule: String,
      mentalModelQuestion: String,
    },
    interviewSolutionLadder: {
      clarifyingQuestions: [
        {
          question: String,
          interviewerAnswer: String,
          isCritical: Boolean,
        },
      ],
      bruteForcePitch: {
        explanation: String,
        bottleneck: String,
        time: String,
        space: String,
      },
      optimalPitch: {
        explanation: String,
        invariant: String,
        time: String,
        space: String,
      },
      interviewerFollowUp: {
        twist: String,
        adaptation: String,
      },
    },
    signalPhrases: [
      {
        phrase: String,
        impliedConstraint: String,
        triggeredPattern: String,
      },
    ],
    inputConstraintMax: { type: Number, required: true },
    allowedComplexities: [String],
    tleComplexities: [String],
    sandboxInitialData: Schema.Types.Mixed,
    bruteForcePipeline: PipelineSchema,
    betterPipeline: PipelineSchema,
    optimalPipeline: PipelineSchema,
    srtbotConfig: {
      subproblemOptions: [String],
      relationOptions: [String],
      topoOrderOptions: [String],
      baseCaseOptions: [String],
      originalOptions: [String],
      timeOptions: [String],
      correctAnswers: { type: Map, of: String },
    },
    followUpTwists: [
      {
        twistTitle: String,
        constraintChange: String,
        newOptimalApproach: String,
      },
    ],
    feynmanPrompt: {
      sentenceTemplate: String,
      missingKeywords: [String],
    },
  },
  { timestamps: true }
);

export const Problem: mongoose.Model<IProblem> =
  (mongoose.models.Problem as mongoose.Model<IProblem> | undefined) ||
  mongoose.model<IProblem>('Problem', ProblemSchema);
