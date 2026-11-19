import type { CurriculumTopic, TopicDifficultyTier } from '../types';
import { FOUNDATIONS_TOPICS } from './topicsFoundations';
import { INTERMEDIATE_TOPICS } from './topicsIntermediate';
import { ADVANCED_TOPICS } from './topicsAdvanced';
import { APPLIED_FUZZY_TOPICS } from './topicsAppliedFuzzy';
import {
  BACKTRACKING_TOPIC,
  RECURSION_TOPIC,
  SORTING_TOPIC,
} from './topicsRecursionBacktrackingSorting';

export const TOPIC_TIERS: TopicDifficultyTier[] = [
  'Foundations',
  'Intermediate',
  'Advanced',
  'Applied System Algorithms',
];

const RAW_TOPICS: CurriculumTopic[] = [
  ...FOUNDATIONS_TOPICS,
  SORTING_TOPIC,
  ...INTERMEDIATE_TOPICS.slice(0, -1),
  RECURSION_TOPIC,
  BACKTRACKING_TOPIC,
  INTERMEDIATE_TOPICS[INTERMEDIATE_TOPICS.length - 1],
  ...ADVANCED_TOPICS,
  ...APPLIED_FUZZY_TOPICS,
];

export const CURRICULUM_TOPICS: CurriculumTopic[] = RAW_TOPICS.map((topic, idx) => ({
  ...topic,
  order: idx + 1,
}));

const LEGACY_TOPIC_ALIASES: Record<string, string> = {
  'recursion-backtracking-greedy': 'backtracking',
};

export function getTopicById(id: string): CurriculumTopic {
  const resolvedId = LEGACY_TOPIC_ALIASES[id] ?? id;
  return CURRICULUM_TOPICS.find((t) => t.id === resolvedId) ?? CURRICULUM_TOPICS[0];
}
