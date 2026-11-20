import { ALL_UNIVERSAL_STRATEGIES } from './catalogStrategyBridge';
import type { EngineAnalysisResult, StrategySignature, WorkspaceKind } from '../knowledge-base/types';
import { CandidateRetriever } from './CandidateRetriever';
import { rerankCandidates } from './ConfidentReranker';
import { deconstructProblem } from './Deconstructor';

function nowMs(): number {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}

/**
 * Facade for the Universal Logic & Problem-Solving Engine.
 * 100% pure TypeScript — zero UI framework or DOM dependencies.
 */
export class UniversalLogicEngine {
  private readonly retriever: CandidateRetriever;

  constructor(strategies: StrategySignature[] = ALL_UNIVERSAL_STRATEGIES) {
    this.retriever = new CandidateRetriever(strategies);
  }

  public analyze(problemStatement: string): EngineAnalysisResult {
    const start = nowMs();

    // Stage 1: Domain-Agnostic Deconstructor
    const deconstruction = deconstructProblem(problemStatement);

    // Stage 2: High-Recall Inverted N-Gram Candidate Retrieval (< 5ms)
    const retrieval = this.retriever.retrieve(deconstruction, 14);

    // Stage 3: High-Precision Confident Reranker & Socratic Blueprint
    const { recommendations, blueprint } = rerankCandidates(deconstruction, retrieval.candidates);

    const topStrategy = recommendations[0] ?? null;

    // Select optimal interactive workspace dynamically from detected domain + top strategy
    let recommendedWorkspace: WorkspaceKind = topStrategy?.strategy.workspaceKind ?? 'array-pointer';
    if (deconstruction.primaryDomain === 'DEDUCTIVE_CONSTRAINT') {
      recommendedWorkspace = 'truth-grid';
    } else if (
      deconstruction.primaryDomain === 'MATHEMATICAL_LOGIC' ||
      deconstruction.primaryDomain === 'GAME_THEORY_INVARIANT' ||
      deconstruction.primaryDomain === 'SYSTEM_STATE_LOGIC'
    ) {
      recommendedWorkspace = 'invariant-tracker';
    }

    const totalElapsedMs = Number(Math.max(0.1, nowMs() - start).toFixed(2));

    return {
      deconstruction,
      retrieval,
      recommendations,
      topStrategy,
      blueprint,
      recommendedWorkspace,
      totalElapsedMs,
    };
  }
}

export const defaultUniversalEngine = new UniversalLogicEngine(ALL_UNIVERSAL_STRATEGIES);

export function analyzeProblemStatement(problemStatement: string): EngineAnalysisResult {
  return defaultUniversalEngine.analyze(problemStatement);
}
