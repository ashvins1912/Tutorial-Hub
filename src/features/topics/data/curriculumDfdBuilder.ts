import type {
  CurriculumDfdEdge,
  CurriculumDfdGraph,
  CurriculumDfdNode,
  CurriculumTopic,
} from '../types';
import { algorithmGraphService } from '../../../core/engine/AlgorithmGraphService';
import { getTopicComplexityProfile } from '../../visualizer/data/complexityComparisonData';

/**
 * Pure curriculum data resolver that synthesizes a Level-1 Data Flow Diagram
 * directly from the CurriculumTopic data structure, DeepTopic visualBlueprint,
 * and TopicComplexityProfile. If a topic explicitly defines `topic.dfdGraph`,
 * that authored definition is returned directly.
 */
export function getCurriculumDfdGraph(topic: CurriculumTopic): CurriculumDfdGraph {
  if (topic.dfdGraph) {
    return topic.dfdGraph;
  }

  const deepTopic = algorithmGraphService.getDeepTopic(topic.id);
  const complexityProfile = getTopicComplexityProfile(topic.id);

  const brute = topic.solutions.brute;
  const better = topic.solutions.better;
  const optimal = topic.solutions.optimal;

  const blueprint = deepTopic.visualBlueprint;
  const constraintRange = deepTopic.constraintDecoder.inputSizeRange;
  const primaryInput = topic.visualizer.inputSummary || blueprint.inputs.join(' · ');
  const secondaryInput = blueprint.inputs.filter((item) => item !== primaryInput).join(' · ');
  const fullInputSpec = secondaryInput
    ? `${primaryInput} (${secondaryInput})`
    : primaryInput;

  const stateStoreSummary =
    blueprint.stateVariables.length > 0
      ? blueprint.stateVariables.join(' · ')
      : `${complexityProfile.iterativeSpaceBigO} auxiliary state`;

  const primaryOutput =
    blueprint.outputs.length > 0
      ? blueprint.outputs.join(' · ')
      : `Verified optimal result via ${optimal.title}`;

  const step1Text =
    topic.mentalModelSteps[0] ??
    `Ingest ${primaryInput} and validate problem constraints (${constraintRange}).`;
  const step2Text =
    topic.mentalModelSteps[1] ??
    `Maintain auxiliary state (${stateStoreSummary}) to eliminate redundant nested scans.`;
  const step3Text =
    topic.mentalModelSteps[2] ??
    `Execute core invariant update (${optimal.title}) across each input transition.`;
  const step4Text =
    topic.mentalModelSteps[3] ??
    `Verify edge cases and emit final optimal answer in ${optimal.timeComplexity}.`;

  const clueSignal =
    topic.patternClues[0]?.signal ??
    `Constraint match: ${constraintRange} targets ${optimal.timeComplexity}.`;

  const nodes: CurriculumDfdNode[] = [
    {
      id: 'input-entity',
      stepNumber: 1,
      code: 'E1',
      label: 'External Input',
      shortSummary: topic.visualizer.inputSummary,
      kind: 'external-input',
      timeComplexity: 'O(1) boundary read',
      spaceComplexity: 'O(1) input reference',
      input: fullInputSpec,
      output: `Validated stream forwarded to 1.0 Core Invariant Engine (${constraintRange})`,
      upstreamLabels: ['Caller / Test Harness'],
      downstreamLabels: ['1.0 Core Invariant Engine'],
      stageMechanics: step1Text,
      invariantNote: `Constraint Decoder: ${constraintRange} → target ${deepTopic.constraintDecoder.requiredTimeComplexity}.`,
      bottleneckNote: `Eliminates ${brute.timeComplexity} brute-force baseline (${brute.title}).`,
      edgeCases: optimal.edgeCases.slice(0, 2),
      col: 0,
      row: 0,
    },
    {
      id: 'process-core',
      stepNumber: 2,
      code: '1.0',
      label: optimal.title,
      shortSummary: `Core ${topic.shortTitle} pass`,
      kind: 'process',
      timeComplexity: optimal.timeComplexity,
      spaceComplexity: optimal.spaceComplexity,
      input: `${primaryInput} + indexed state lookups from D1 State Store`,
      output: `Invariant-preserving candidate transitions → 2.0 Verification & Pruning Gate`,
      upstreamLabels: ['E1 External Input', 'D1 State & Memory Store'],
      downstreamLabels: ['D1 State & Memory Store', '2.0 Invariant & Pruning Gate'],
      stageMechanics: `${step2Text} ${step3Text}`,
      invariantNote: blueprint.invariantCondition,
      bottleneckNote: optimal.bottleneckOrUpgrade,
      edgeCases: optimal.edgeCases,
      col: 1,
      row: 0,
    },
    {
      id: 'state-store',
      stepNumber: 3,
      code: 'D1',
      label: 'State & Memory Store',
      shortSummary: complexityProfile.iterativeSpaceBigO,
      kind: 'data-store',
      timeComplexity: `${complexityProfile.iterativeTimeBigO} amortized access`,
      spaceComplexity: optimal.spaceComplexity,
      input: `State mutations & keys written by 1.0 ${optimal.title}`,
      output: `${stateStoreSummary} served to 1.0 Core Engine & 2.0 Invariant Gate`,
      upstreamLabels: ['1.0 Core Invariant Engine'],
      downstreamLabels: ['1.0 Core Invariant Engine', '2.0 Invariant & Pruning Gate'],
      stageMechanics: `Persists ${stateStoreSummary}. ${complexityProfile.tradeoffVerdict}`,
      invariantNote: `Recurrence / Memory Model: ${complexityProfile.recurrenceRelation} · Stack overhead: ${complexityProfile.iterativeStackOverhead}.`,
      bottleneckNote: `Upgrades from ${better.title} (${better.timeComplexity} / ${better.spaceComplexity}) to ${optimal.timeComplexity} / ${optimal.spaceComplexity}.`,
      edgeCases: optimal.edgeCases.slice(0, 2),
      col: 1,
      row: 1,
    },
    {
      id: 'process-guard',
      stepNumber: 4,
      code: '2.0',
      label: 'Invariant & Pruning Gate',
      shortSummary: 'Boundary & termination check',
      kind: 'process',
      timeComplexity: `${optimal.timeComplexity} total (${complexityProfile.iterativeStackOverhead} stack)`,
      spaceComplexity: complexityProfile.iterativeStackOverhead,
      input: `Candidate transitions from 1.0 ${optimal.title} + state snapshot from D1`,
      output: `Verified solution payload matching ${primaryOutput}`,
      upstreamLabels: ['1.0 Core Invariant Engine', 'D1 State & Memory Store'],
      downstreamLabels: ['E2 Verified Output'],
      stageMechanics: step4Text,
      invariantNote: `Signal Check: ${clueSignal}`,
      bottleneckNote: `Guards against off-by-one, empty-input, and state-leak bugs before final return.`,
      edgeCases: optimal.edgeCases,
      col: 2,
      row: 0,
    },
    {
      id: 'output-entity',
      stepNumber: 5,
      code: 'E2',
      label: 'Verified Output',
      shortSummary: `${optimal.timeComplexity} · ${optimal.spaceComplexity}`,
      kind: 'external-output',
      timeComplexity: `${optimal.timeComplexity} end-to-end`,
      spaceComplexity: `${optimal.spaceComplexity} end-to-end`,
      input: `Finalized result stream from 2.0 Invariant & Pruning Gate`,
      output: primaryOutput,
      upstreamLabels: ['2.0 Invariant & Pruning Gate'],
      downstreamLabels: ['Caller / Downstream System'],
      stageMechanics: `Emits ${primaryOutput}. End-to-end guarantee improves brute force (${brute.timeComplexity}) to optimal (${optimal.timeComplexity}).`,
      invariantNote: `Guaranteed optimal contract: ${optimal.intuition}`,
      bottleneckNote: optimal.bottleneckOrUpgrade,
      edgeCases: optimal.edgeCases,
      col: 3,
      row: 0,
    },
  ];

  const edges: CurriculumDfdEdge[] = [
    {
      id: 'e-in-core',
      from: 'input-entity',
      to: 'process-core',
      label: 'Raw Input',
      kind: 'flow',
    },
    {
      id: 'e-core-store',
      from: 'process-core',
      to: 'state-store',
      label: 'Read / Write State',
      kind: 'store-io',
    },
    {
      id: 'e-store-guard',
      from: 'state-store',
      to: 'process-guard',
      label: 'State Snapshot',
      kind: 'store-io',
    },
    {
      id: 'e-core-guard',
      from: 'process-core',
      to: 'process-guard',
      label: 'Candidate State',
      kind: 'flow',
    },
    {
      id: 'e-guard-out',
      from: 'process-guard',
      to: 'output-entity',
      label: 'Verified Output',
      kind: 'flow',
    },
  ];

  return {
    topicId: topic.id,
    topicTitle: topic.title,
    tier: topic.tier,
    category: topic.category,
    inputConstraint: constraintRange,
    recurrenceRelation: complexityProfile.recurrenceRelation,
    bruteTime: brute.timeComplexity,
    bruteSpace: brute.spaceComplexity,
    betterTime: better.timeComplexity,
    betterSpace: better.spaceComplexity,
    optimalTime: optimal.timeComplexity,
    optimalSpace: optimal.spaceComplexity,
    nodes,
    edges,
  };
}

export function getCurriculumDfdNodeById(
  topic: CurriculumTopic,
  nodeId: string | null,
): CurriculumDfdNode | null {
  if (!nodeId) return null;
  const graph = getCurriculumDfdGraph(topic);
  return graph.nodes.find((n) => n.id === nodeId) ?? graph.nodes[0] ?? null;
}
