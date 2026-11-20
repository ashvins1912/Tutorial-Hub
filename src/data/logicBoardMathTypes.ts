export interface LogicBoardRule {
  step: string;
  condition: string;
  action: string;
  invariant: string;
}

export interface MathEquation {
  name: string;
  formula: string;
  meaning: string;
}

export interface PatternRecommendation {
  ifYouSee: string;
  recommendedPattern: string;
  linkedId?: string;
  linkedKind?: 'algorithm' | 'topic';
  whyItFits: string;
}

export interface LogicBoardEnrichment {
  formalDefinition: string;
  problemStatementForm: string;
  logicBoard: LogicBoardRule[];
  mathematics: {
    hasMath: boolean;
    equations: MathEquation[];
    proofSketch: string;
  };
  patternRecommendations: PatternRecommendation[];
}
