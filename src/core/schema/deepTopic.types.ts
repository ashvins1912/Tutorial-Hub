export type DeepTopicCategory =
  | 'Foundations'
  | 'Trees & Graphs'
  | 'Paradigms'
  | 'Advanced Strings & Fuzzy Search'
  | 'Math & Logic';

export type DeepDifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'System Scale';

export type SupportedSolutionLanguage = 'python' | 'java' | 'typescript';

export interface DeepTopicIntuition {
  realWorldAnalogy: string;
  oneSentenceRule: string;
  whenToUse: string[];
  whenNotToUse: string[];
}

export interface DeepConstraintDecoder {
  inputSizeRange: string;
  requiredTimeComplexity: string;
  correctTierId: 'exp' | 'n2' | 'nlogn' | 'n' | 'logn';
  eliminatedPatterns: string[];
  whyThisWorks: string;
}

export interface DeepVisualBlueprint {
  inputs: string[];
  stateVariables: string[];
  stepByStepFlow: string[];
  invariantCondition: string;
  outputs: string[];
}

export interface BugPreventionEntry {
  trapTitle: string;
  brokenLogic: string;
  fixedLogic: string;
  explanation: string;
}

export interface LinkedCodingProblem {
  problemId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'System';
  companyTags: string[];
  mutationFromPrevious: string;
  relatedAlgorithms: string[];
  trainerSlug?: string;
  blankPageSteps: {
    step1_constraintHint: string;
    step2_manualDryRunPrompt: string;
    step3_bruteForceBottleneck: string;
    step4_optimalInvariant: string;
  };
  activeRecallChallenge: {
    language: SupportedSolutionLanguage;
    prompt: string;
    codeTemplateWithBlanks: string;
    correctMissingLines: string[];
    distractorLines: string[];
    acceptedKeywordsPerBlank: string[][];
    hintsPerBlank: string[];
  };
  solutions: {
    bruteForce: {
      complexity: string;
      code: Record<SupportedSolutionLanguage, string>;
    };
    optimal: {
      complexity: string;
      code: Record<SupportedSolutionLanguage, string>;
    };
  };
}

export interface DeepTopicContent {
  id: string;
  title: string;
  category: DeepTopicCategory;
  difficultyLevel: DeepDifficultyLevel;
  intuition: DeepTopicIntuition;
  constraintDecoder: DeepConstraintDecoder;
  visualBlueprint: DeepVisualBlueprint;
  bugPreventionLab: BugPreventionEntry[];
  problemMutationLadder: LinkedCodingProblem[];
}

export interface TopicGraphLinkage {
  topicId: string;
  prerequisites: { id: string; title: string; reason: string }[];
  siblingTopics: { id: string; title: string; sharedInvariant: string }[];
  nextLevelUnlocks: { id: string; title: string; progressionTwist: string }[];
}
