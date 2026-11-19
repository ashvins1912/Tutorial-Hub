import type {
  ConceptNode,
  CustomConceptInput,
  DifficultyTier,
  GeneratedPracticeProblem,
  SynthesizedDiagram,
} from './intelligent-engine.types';
import { VisualDiagramSynthesizer } from './VisualDiagramSynthesizer';
import { SEED_CONCEPT_PACK } from './seedConceptPack';

const CUSTOM_CONCEPTS_STORAGE_KEY = 'patternforge_custom_concepts_v1';
const MASTERY_STORAGE_KEY = 'patternforge_engine_mastery_v1';

/**
 * Wraps any user-authored JSON/Form CustomConceptInput into a live ConceptNode
 * with an automatic parametric Socratic & invariant-verification generator.
 */
export function buildConceptNodeFromCustomSpec(spec: CustomConceptInput): ConceptNode {
  const safeId =
    spec.id
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-|-$/g, '') || `custom-${Date.now()}`;

  const cleanProcesses =
    spec.visualSpec.processes.length > 0
      ? spec.visualSpec.processes
      : ['Parse Input', 'Maintain Invariant', 'Emit Output'];
  const cleanStores =
    spec.visualSpec.dataStores.length > 0 ? spec.visualSpec.dataStores : ['Primary State Store'];
  const cleanInputs = spec.visualSpec.inputs.length > 0 ? spec.visualSpec.inputs : ['Problem Input'];
  const cleanOutputs = spec.visualSpec.outputs.length > 0 ? spec.visualSpec.outputs : ['Verified Output'];
  const cleanBranches =
    spec.visualSpec.decisionBranches.length > 0
      ? spec.visualSpec.decisionBranches
      : [
          {
            condition: 'Invariant Holds',
            truePath: 'Advance / Emit Optimal Step',
            falsePath: 'Prune or Repair State',
          },
        ];

  return {
    id: safeId,
    title: spec.title.trim(),
    category: spec.category.trim() || 'Custom Domain Concept',
    tags: spec.tags.map((t) => t.trim()).filter(Boolean),
    coreMentalModel: spec.coreMentalModel.trim(),
    invariantRule: spec.invariantRule.trim(),
    complexity: {
      time: spec.complexity.time.trim() || 'O(N log N)',
      space: spec.complexity.space.trim() || 'O(N)',
    },
    visualSpec: {
      inputs: cleanInputs,
      processes: cleanProcesses,
      dataStores: cleanStores,
      outputs: cleanOutputs,
      decisionBranches: cleanBranches,
    },
    isCustom: true,
    problemGenerators: [
      {
        blueprintId: `${safeId}-auto-blueprint`,
        patternName: spec.title.trim(),
        difficulty: 'MEDIUM',
        storyTemplates: [
          `Apply ${spec.title} over scaled inputs while preserving its core invariant.`,
        ],
        parameterRanges: { scalePower: [3, 6] },
        edgeCaseInjectors: spec.sampleEdgeCases?.length
          ? spec.sampleEdgeCases
          : ['empty_or_singleton', 'worst_case_skew', 'boundary_overflow'],
        generateInstance: (seed, difficulty): GeneratedPracticeProblem => {
          const edgeCases = spec.sampleEdgeCases?.length
            ? spec.sampleEdgeCases
            : ['empty_or_singleton', 'worst_case_skew', 'boundary_overflow'];
          const chosenEdge = edgeCases[Math.abs(seed) % edgeCases.length];
          const nSize =
            difficulty === 'EASY'
              ? 100
              : difficulty === 'MEDIUM'
                ? 50_000
                : difficulty === 'HARD'
                  ? 250_000
                  : 5_000_000;

          return {
            problemId: `${safeId}-${seed}`,
            conceptId: safeId,
            title: `${spec.title} Design Drill #${seed}`,
            difficulty,
            statement: `Architect and dry-run "${spec.title}" for N = ${nSize.toLocaleString()} items (${cleanInputs.join(' + ')} → ${cleanOutputs.join(', ')}). Handle edge case "${chosenEdge}" within ${spec.complexity.time} time and ${spec.complexity.space} space.`,
            constraints: [
              `Target Time: ${spec.complexity.time}`,
              `Target Space: ${spec.complexity.space}`,
              `Required Stores: ${cleanStores.join(', ')}`,
            ],
            sampleInput: {
              scaleN: nSize,
              inputs: cleanInputs,
              injectedEdgeCase: chosenEdge,
            },
            expectedOutput: {
              pipelineStages: cleanProcesses,
              activeDataStores: cleanStores,
              invariantPreserved: spec.invariantRule,
              emittedOutputs: cleanOutputs,
            },
            edgeCaseTag: chosenEdge,
            socraticSteps: [
              {
                step: 1,
                question: `Which invariant guarantees correctness for "${spec.title}"?`,
                options: [
                  spec.invariantRule,
                  'Sort all elements twice on every iteration in O(N^2 log N).',
                  'Drop all state stores and rely on random guessing.',
                ],
                correctIndex: 0,
                hint: `Mental model: ${spec.coreMentalModel}`,
              },
              {
                step: 2,
                question: `Which primary data store(s) power the "${cleanProcesses[0]}" → "${cleanProcesses[cleanProcesses.length - 1]}" pipeline?`,
                options: [
                  cleanStores.join(' + '),
                  'An unindexed linear flat log scanned from start to end every query.',
                  'A fixed 2-byte constant register.',
                ],
                correctIndex: 0,
                hint: `Check the DFD Data Stores layer for ${spec.title}.`,
              },
            ],
          };
        },
      },
    ],
  };
}

export class IntelligentLearningEngine {
  private conceptRegistry: Map<string, ConceptNode> = new Map();
  private trigramIndex: Map<string, Set<string>> = new Map();
  private diagramSynthesizer = new VisualDiagramSynthesizer();
  private userMastery: Map<string, number> = new Map();

  /**
   * FLEXIBLE INGESTION: Add or upgrade any algorithm, DSA topic, or custom concept at runtime
   */
  public registerOrUpgradeConcept(concept: ConceptNode): void {
    this.conceptRegistry.set(concept.id, concept);
    this.rebuildTrigramIndexForConcept(concept);
  }

  public registerCustomConceptFromSpec(spec: CustomConceptInput): ConceptNode {
    const node = buildConceptNodeFromCustomSpec(spec);
    this.registerOrUpgradeConcept(node);
    return node;
  }

  private rebuildTrigramIndexForConcept(concept: ConceptNode): void {
    const searchableText = `${concept.id} ${concept.title} ${concept.category} ${concept.tags.join(' ')} ${concept.coreMentalModel} ${concept.invariantRule}`.toLowerCase();
    const padded = `  ${searchableText}  `;
    for (let i = 0; i <= padded.length - 3; i++) {
      const gram = padded.slice(i, i + 3);
      let bucket = this.trigramIndex.get(gram);
      if (!bucket) {
        bucket = new Set<string>();
        this.trigramIndex.set(gram, bucket);
      }
      bucket.add(concept.id);
    }
  }

  public listAllConcepts(): ConceptNode[] {
    return Array.from(this.conceptRegistry.values());
  }

  public getConcept(conceptId: string): ConceptNode | undefined {
    return this.conceptRegistry.get(conceptId);
  }

  /**
   * Fuzzy Padded N-Gram Search across all registered topics & newly added custom concepts
   */
  public findConcepts(query: string): ConceptNode[] {
    const cleaned = query.toLowerCase().trim();
    if (!cleaned) return this.listAllConcepts();

    const padded = `  ${cleaned}  `;
    const scores = new Map<string, number>();

    for (let i = 0; i <= padded.length - 3; i++) {
      const gram = padded.slice(i, i + 3);
      this.trigramIndex.get(gram)?.forEach((id) => {
        scores.set(id, (scores.get(id) ?? 0) + 1);
      });
    }

    // Boost direct title/tag substring hits for crisp precision
    for (const concept of this.conceptRegistry.values()) {
      const hay = `${concept.title} ${concept.tags.join(' ')} ${concept.category}`.toLowerCase();
      if (hay.includes(cleaned)) {
        scores.set(concept.id, (scores.get(concept.id) ?? 0) + 12);
      }
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.conceptRegistry.get(id)!)
      .filter(Boolean);
  }

  /**
   * Generates a complete Visual Learning Pack (Flowchart + DFD + State Machine + Trace) for ANY topic
   */
  public getVisualLearningPack(conceptId: string): {
    concept: ConceptNode;
    diagrams: SynthesizedDiagram[];
  } {
    const concept = this.conceptRegistry.get(conceptId);
    if (!concept) throw new Error(`Concept "${conceptId}" not found.`);
    return {
      concept,
      diagrams: this.diagramSynthesizer.synthesizeAllDiagrams(concept),
    };
  }

  /**
   * Generates a fresh, pattern-based practice problem tailored to the user's mastery level
   */
  public generatePracticeSession(
    conceptId: string,
    forcedDifficulty?: DifficultyTier,
    customSeed?: number,
  ): GeneratedPracticeProblem {
    const concept = this.conceptRegistry.get(conceptId);
    if (!concept || concept.problemGenerators.length === 0) {
      throw new Error(`No problem blueprints available for "${conceptId}".`);
    }

    const mastery = this.userMastery.get(conceptId) ?? 20;
    const targetDifficulty: DifficultyTier =
      forcedDifficulty ??
      (mastery < 35 ? 'EASY' : mastery < 65 ? 'MEDIUM' : mastery < 85 ? 'HARD' : 'SYSTEM_SCALE');

    const matchingBlueprints = concept.problemGenerators.filter(
      (b) => b.difficulty === targetDifficulty,
    );
    const blueprint =
      matchingBlueprints.length > 0 ? matchingBlueprints[0] : concept.problemGenerators[0];

    const seed =
      typeof customSeed === 'number' ? customSeed : Math.floor(Math.random() * 90000) + 1000;
    return blueprint.generateInstance(seed, targetDifficulty);
  }

  public getMastery(conceptId: string): number {
    return this.userMastery.get(conceptId) ?? 20;
  }

  public setMasterySnapshot(snapshot: Record<string, number>): void {
    for (const [id, score] of Object.entries(snapshot)) {
      this.userMastery.set(id, Math.max(0, Math.min(100, score)));
    }
  }

  public getMasterySnapshot(): Record<string, number> {
    const out: Record<string, number> = {};
    this.userMastery.forEach((v, k) => {
      out[k] = v;
    });
    return out;
  }

  /**
   * Updates user mastery when a user drops or completes a problem
   */
  public recordAttempt(conceptId: string, completed: boolean, hintsUsed: number): number {
    const current = this.userMastery.get(conceptId) ?? 20;
    const delta = completed ? Math.max(5, 16 - hintsUsed * 3) : -8;
    const updated = Math.max(0, Math.min(100, current + delta));
    this.userMastery.set(conceptId, updated);
    return updated;
  }
}

export function loadPersistedCustomSpecs(): CustomConceptInput[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_CONCEPTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CustomConceptInput[];
  } catch {
    return [];
  }
}

export function savePersistedCustomSpecs(specs: CustomConceptInput[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CUSTOM_CONCEPTS_STORAGE_KEY, JSON.stringify(specs));
  } catch {
    // ignore storage errors
  }
}

export function loadPersistedMastery(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export function savePersistedMastery(snapshot: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors
  }
}

export function createSeededLearningEngine(): IntelligentLearningEngine {
  const engine = new IntelligentLearningEngine();
  for (const concept of SEED_CONCEPT_PACK) {
    engine.registerOrUpgradeConcept(concept);
  }
  const customSpecs = loadPersistedCustomSpecs();
  for (const spec of customSpecs) {
    engine.registerCustomConceptFromSpec(spec);
  }
  engine.setMasterySnapshot(loadPersistedMastery());
  return engine;
}
