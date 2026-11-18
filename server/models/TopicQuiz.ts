import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  cognitiveFeedback: string;
}

export interface ITopicQuizQuestion {
  id: string;
  scenarioText: string;
  constraintHint: string;
  questionPrompt: string;
  options: ITopicQuizOption[];
  optimalComplexity: {
    time: string;
    space: string;
  };
}

export interface ITopicQuiz extends Document {
  topicId: string;
  topicTitle: string;
  tier: 'Noob' | 'Apprentice' | 'Practitioner' | 'Strategist' | 'Pro';
  questions: ITopicQuizQuestion[];
}

const TopicQuizSchema = new Schema<ITopicQuiz>(
  {
    topicId: { type: String, required: true, unique: true, index: true },
    topicTitle: { type: String, required: true },
    tier: {
      type: String,
      enum: ['Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'],
      required: true,
    },
    questions: [
      {
        id: { type: String, required: true },
        scenarioText: { type: String, required: true },
        constraintHint: { type: String, required: true },
        questionPrompt: { type: String, required: true },
        options: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
            cognitiveFeedback: { type: String, required: true },
          },
        ],
        optimalComplexity: {
          time: { type: String, required: true },
          space: { type: String, required: true },
        },
      },
    ],
  },
  { timestamps: true }
);

export const TopicQuiz =
  mongoose.models.TopicQuiz || mongoose.model<ITopicQuiz>('TopicQuiz', TopicQuizSchema);
