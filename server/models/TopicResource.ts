import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicResource extends Document {
  topicId: string;
  topicTitle: string;
  tier: 'LogicWarmup' | 'Noob' | 'Apprentice' | 'Practitioner' | 'Strategist' | 'Pro';
  coverageChecklist: {
    subConcept: string;
    isCore: boolean;
    intuitionSummary: string;
  }[];
  curatedLinks: {
    academicLecture: {
      institution: string;
      courseCode: string;
      professor: string;
      title: string;
      url: string;
      watchForBullets: string[];
    };
    visualExplainer: {
      educator: string;
      title: string;
      url: string;
      bestFor: string;
    };
    sheetsAndRoadmaps: {
      platform: string;
      title: string;
      url: string;
    }[];
  };
  analyticalBlueprint: {
    constraintRule: string;
    loopInvariant: string;
    bottleneckPattern: string;
  };
}

const TopicResourceSchema = new Schema<ITopicResource>(
  {
    topicId: { type: String, required: true, unique: true, index: true },
    topicTitle: { type: String, required: true },
    tier: {
      type: String,
      enum: ['LogicWarmup', 'Noob', 'Apprentice', 'Practitioner', 'Strategist', 'Pro'],
      required: true,
    },
    coverageChecklist: [
      {
        subConcept: { type: String, required: true },
        isCore: { type: Boolean, default: true },
        intuitionSummary: { type: String, required: true },
      },
    ],
    curatedLinks: {
      academicLecture: {
        institution: String,
        courseCode: String,
        professor: String,
        title: String,
        url: String,
        watchForBullets: [String],
      },
      visualExplainer: {
        educator: String,
        title: String,
        url: String,
        bestFor: String,
      },
      sheetsAndRoadmaps: [
        {
          platform: String,
          title: String,
          url: String,
        },
      ],
    },
    analyticalBlueprint: {
      constraintRule: { type: String, required: true },
      loopInvariant: { type: String, required: true },
      bottleneckPattern: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const TopicResource: mongoose.Model<ITopicResource> =
  (mongoose.models.TopicResource as mongoose.Model<ITopicResource> | undefined) ||
  mongoose.model<ITopicResource>('TopicResource', TopicResourceSchema);
