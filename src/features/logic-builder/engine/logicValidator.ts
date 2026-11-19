import type { LogicBlockItem } from '../../topics/types';

export interface LogicValidationResult {
  isComplete: boolean;
  isValid: boolean;
  correctCount: number;
  totalCount: number;
  slotFeedback: {
    slotIndex: number;
    blockId: string | null;
    isCorrect: boolean;
    hint?: string;
  }[];
}

/**
 * Pure validator for the Drag-and-Drop "Complete in Pieces" Logic Builder.
 */
export function validateLogicAssembly(
  blocks: LogicBlockItem[],
  placedBlockIds: (string | null)[]
): LogicValidationResult {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  let correctCount = 0;

  const slotFeedback = placedBlockIds.map((blockId, slotIndex) => {
    if (!blockId) {
      return {
        slotIndex,
        blockId: null,
        isCorrect: false,
        hint: `Slot ${slotIndex + 1} is empty. Place the step that belongs at position ${slotIndex + 1}.`,
      };
    }
    const block = byId.get(blockId);
    const expectedOrder = slotIndex + 1;
    const isCorrect = block?.correctOrder === expectedOrder;
    if (isCorrect) correctCount++;

    return {
      slotIndex,
      blockId,
      isCorrect,
      hint: isCorrect
        ? undefined
        : block?.misplacedHint ??
          `This block belongs at step ${block?.correctOrder}, not step ${expectedOrder}.`,
    };
  });

  const isComplete = placedBlockIds.every((id) => id !== null);
  return {
    isComplete,
    isValid: isComplete && correctCount === blocks.length,
    correctCount,
    totalCount: blocks.length,
    slotFeedback,
  };
}

/** Deterministic scramble so blocks never start already solved */
export function scrambleLogicBlocks(blocks: LogicBlockItem[]): LogicBlockItem[] {
  const sorted = [...blocks].sort((a, b) => a.correctOrder - b.correctOrder);
  if (sorted.length <= 1) return sorted;
  // Deterministic non-trivial permutation (swap pairs + rotate)
  const out = [...sorted];
  const first = out.shift()!;
  out.push(first);
  if (out.length >= 4) {
    [out[0], out[2]] = [out[2], out[0]];
  }
  return out;
}
