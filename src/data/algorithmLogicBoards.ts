import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { LogicBoardEnrichment } from './logicBoardMathTypes';
import { CORE_A_LOGIC_BOARDS } from './algorithmLogicBoardsCoreA';
import { CORE_B_LOGIC_BOARDS } from './algorithmLogicBoardsCoreB';
import { ADV_A_LOGIC_BOARDS } from './algorithmLogicBoardsAdvA';
import { ADV_B_LOGIC_BOARDS } from './algorithmLogicBoardsAdvB';

export { TOPIC_LOGIC_BOARDS, getTopicLogicBoard } from './topicLogicBoards';
export type {
  LogicBoardEnrichment,
  LogicBoardRule,
  MathEquation,
  PatternRecommendation,
} from './logicBoardMathTypes';

export const ALGORITHM_LOGIC_BOARDS: Record<string, LogicBoardEnrichment> = {
  ...CORE_A_LOGIC_BOARDS,
  ...CORE_B_LOGIC_BOARDS,
  ...ADV_A_LOGIC_BOARDS,
  ...ADV_B_LOGIC_BOARDS,
};

export function getAlgorithmLogicBoard(algo: AlgorithmDefinition): LogicBoardEnrichment {
  const exact = ALGORITHM_LOGIC_BOARDS[algo.id];
  if (exact) return exact;

  return {
    formalDefinition: `${algo.name} (${algo.category}): ${algo.coreIdea} Runs in ${algo.timeComplexity} time and ${algo.spaceComplexity} space.`,
    problemStatementForm: `${algo.tagline} Complexity leap: ${algo.complexityLeap}.`,
    logicBoard: algo.mentalModelSteps.slice(0, 4).map((step, i) => ({
      step: `0${i + 1} · Step ${i + 1}`,
      condition: algo.whenToUse[i] ?? 'Precondition verified',
      action: step,
      invariant: algo.loopInvariant,
    })),
    mathematics: {
      hasMath: true,
      equations: [
        {
          name: 'Asymptotic Time & Space Bound',
          formula: `Time: ${algo.timeComplexity}   |   Space: ${algo.spaceComplexity}   (${algo.complexityLeap})`,
          meaning: algo.loopInvariant,
        },
      ],
      proofSketch: algo.loopInvariant,
    },
    patternRecommendations: algo.whenToUse.slice(0, 3).map((clue) => ({
      ifYouSee: clue,
      recommendedPattern: algo.shortName,
      linkedId: algo.id,
      linkedKind: 'algorithm',
      whyItFits: algo.tagline,
    })),
  };
}
