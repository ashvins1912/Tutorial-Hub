export type DiagramType = 'FLOWCHART' | 'DFD' | 'STATE_MACHINE' | 'DATA_STRUCTURE_TRACE';
export type DifficultyTier = 'EASY' | 'MEDIUM' | 'HARD' | 'SYSTEM_SCALE';

export interface DecisionBranchSpec {
  condition: string;
  truePath: string;
  falsePath: string;
}

export interface ConceptVisualSpec {
  inputs: string[];
  processes: string[];
  dataStores: string[];
  outputs: string[];
  decisionBranches: DecisionBranchSpec[];
}

export interface SocraticStep {
  step: number;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export interface GeneratedPracticeProblem {
  problemId: string;
  conceptId: string;
  title: string;
  difficulty: DifficultyTier;
  statement: string;
  constraints: string[];
  sampleInput: unknown;
  expectedOutput: unknown;
  edgeCaseTag: string;
  socraticSteps: SocraticStep[];
}

export interface ProblemBlueprint {
  blueprintId: string;
  patternName: string;
  difficulty: DifficultyTier;
  storyTemplates: string[];
  parameterRanges: Record<string, [number, number]>;
  edgeCaseInjectors: string[];
  generateInstance: (seed: number, difficulty: DifficultyTier) => GeneratedPracticeProblem;
}

export interface ConceptNode {
  id: string;
  title: string;
  category: string;
  tags: string[];
  coreMentalModel: string;
  invariantRule: string;
  complexity: {
    time: string;
    space: string;
  };
  visualSpec: ConceptVisualSpec;
  problemGenerators: ProblemBlueprint[];
  isCustom?: boolean;
}

export interface SynthesizedDiagram {
  type: DiagramType;
  title: string;
  mermaidCode: string;
  stepAnnotations: string[];
}

/**
 * Serializable JSON schema for hot-plugging brand-new concepts via UI form or JSON import
 * without writing custom TypeScript functions.
 */
export interface CustomConceptInput {
  id: string;
  title: string;
  category: string;
  tags: string[];
  coreMentalModel: string;
  invariantRule: string;
  complexity: {
    time: string;
    space: string;
  };
  visualSpec: ConceptVisualSpec;
  sampleEdgeCases?: string[];
}
