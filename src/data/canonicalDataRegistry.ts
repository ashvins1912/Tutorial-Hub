/**
 * Single Canonical Local Data Registry
 *
 * Centralizes every static dataset in PatternForge behind strictly typed
 * collection keys. Used in two places:
 *  1. Backend seeder & Push-All API (`server/db/seedPlatformContent.ts`) to
 *     persist canonical records into MongoDB (`platform_content_bundles`).
 *  2. Frontend Zustand async catalog store (`useContentBootstrapStore.ts`) as
 *     instant zero-flicker initial state and resilient fallback whenever the
 *     database is offline, disabled by flag, errors out, or returns null/empty.
 */

import { ALGORITHMS_CATALOG } from './algorithmsCatalog';
import {
  ALGORITHM_POWER_COMBOS,
  MASTER_73_ROADMAP,
} from './algorithmCombinationsAndRoadmap';
import { CURRICULUM_PATTERNS, CURRICULUM_TIERS } from './curriculum';
import {
  COMPLETE_DSA_ROADMAP,
  DSA_LEVELS,
  LESSON_FLOW,
  MASTERY_CHECKLIST,
} from './completeDsaRoadmap';
import { DSA_COMPLETE_LESSONS, DSA_LESSON_STEPS } from './dsaCompleteLessons';
import { GOLDEN_PATTERN_TEMPLATES, TOPIC_RESOURCES } from './academyResources';
import {
  SHARED_TOPIC_LESSONS,
  SHARED_TOPIC_PROBLEMS,
} from './sharedTopicAcademy';
import { PROBLEMS } from './problems';
import {
  COMPANY_PATTERN_CHEATSHEET,
  MASTER_13_TOPIC_BANK,
  PRODUCT_COMPANY_HIGH_YIELD,
} from './productCompanyMasterBank';
import { HIGH_ROI_45_PROBLEMS } from './highRoi45';
import { LEETCODE_75_CATEGORIES, LEETCODE_75_PROBLEMS } from './leetcode75';
import {
  TOP_INTERVIEW_100,
  TOP_INTERVIEW_100_CATEGORIES,
} from './topInterview100';
import { MATRIX_PROBLEMS } from './matrixProblems';
import { PATTERN_DRILL_SCENARIOS } from './patternDrillScenarios';
import { BLUEPRINT_LIST } from './blueprints';
import { COMPONENT_CATALOG } from './componentCatalog';
import {
  SYSTEM_COMPONENTS,
  SYSTEM_LAYERS,
  SYSTEM_SCENARIOS,
} from './systemDesignData';
import {
  CORE_ROADMAP_MODULES,
  DISTRIBUTED_ALGORITHMS,
  INTERVIEW_FRAMEWORK_STEPS,
  REASONING_QUIZ_ITEMS,
} from './systemDesignMasterRoadmapData';
import { NGRAM_ALGORITHMS, NGRAM_STAGES } from './ngramTaxonomy';
import { FUZZY_CURRICULUM_MODULES } from './fuzzyCurriculumModules';
import { OOPS_AND_SOLID_CONCEPTS } from './ood/oopsAndSolidData';
import { PATTERNS_AND_OOD_CONCEPTS } from './ood/patternsAndOodData';
import { EXTENDED_GOF_PATTERNS } from './ood/extendedPatternsData';
import { AI_ENGINEERING_PHASES } from './aiEngineeringData';
import { CURRICULUM_TOPICS } from '../features/topics/data/curriculumIndex';
import { CURATED_INTERVIEW_BANK } from '../features/topics/data/curatedInterviewBank';
import {
  PURE_LOGIC_MODULES,
  SAMPLE_PROBLEMS,
  STRATEGIES_CATALOG,
} from '../core/knowledge-base/strategiesCatalog';
import {
  DSA28_CANONICAL_BUNDLE,
  type Dsa28BundlePayload,
} from './dsa28Patterns';
import {
  DSA28_TRICKY_TEMPLATES,
  type TrickyPatternTemplate,
} from './dsa28PatternTemplates';

export type ContentDomainId =
  | 'algorithms'
  | 'curriculum'
  | 'problems'
  | 'solver'
  | 'system-design'
  | 'ngram'
  | 'ood'
  | 'ai';

export interface ContentDomainMeta {
  id: ContentDomainId;
  label: string;
  shortLabel: string;
}

export const CONTENT_DOMAINS: ContentDomainMeta[] = [
  { id: 'algorithms', label: 'Algorithms & Logic Boards', shortLabel: 'Algorithms' },
  { id: 'curriculum', label: 'DSA Curriculum & Academy', shortLabel: 'Curriculum' },
  { id: 'problems', label: 'Problem Banks & Drills', shortLabel: 'Problem Banks' },
  { id: 'solver', label: 'Universal Problem Solver', shortLabel: 'Solver Studio' },
  { id: 'system-design', label: 'System Design & Live Playground', shortLabel: 'System Design' },
  { id: 'ngram', label: 'N-Gram & Fuzzy Search Lab', shortLabel: 'N-Gram Lab' },
  { id: 'ood', label: 'OOPs, SOLID & Design Patterns', shortLabel: 'OOD & SOLID' },
  { id: 'ai', label: 'AI Engineering Track', shortLabel: 'AI Engineering' },
];

export interface CanonicalBundlePayloadMap {
  'algorithms-catalog': typeof ALGORITHMS_CATALOG;
  'master-73-roadmap': typeof MASTER_73_ROADMAP;
  'algorithm-power-combos': typeof ALGORITHM_POWER_COMBOS;
  'curriculum-topics': typeof CURRICULUM_TOPICS;
  'complete-dsa-roadmap': {
    topics: typeof COMPLETE_DSA_ROADMAP;
    levels: typeof DSA_LEVELS;
    lessonFlow: typeof LESSON_FLOW;
    masteryChecklist: typeof MASTERY_CHECKLIST;
  };
  'dsa-complete-lessons': {
    lessons: typeof DSA_COMPLETE_LESSONS;
    steps: typeof DSA_LESSON_STEPS;
  };
  'curriculum-patterns': {
    patterns: typeof CURRICULUM_PATTERNS;
    tiers: typeof CURRICULUM_TIERS;
  };
  'academy-resources': {
    goldenTemplates: typeof GOLDEN_PATTERN_TEMPLATES;
    topicResources: typeof TOPIC_RESOURCES;
  };
  'shared-topic-academy': {
    lessons: typeof SHARED_TOPIC_LESSONS;
    problems: typeof SHARED_TOPIC_PROBLEMS;
  };
  'interactive-problems': typeof PROBLEMS;
  'curated-interview-bank': typeof CURATED_INTERVIEW_BANK;
  'product-company-bank': {
    highYield: typeof PRODUCT_COMPANY_HIGH_YIELD;
    master13: typeof MASTER_13_TOPIC_BANK;
    companyCheatsheet: typeof COMPANY_PATTERN_CHEATSHEET;
  };
  'high-roi-45': typeof HIGH_ROI_45_PROBLEMS;
  'leetcode-75': {
    problems: typeof LEETCODE_75_PROBLEMS;
    categories: typeof LEETCODE_75_CATEGORIES;
  };
  'top-interview-100': {
    problems: typeof TOP_INTERVIEW_100;
    categories: typeof TOP_INTERVIEW_100_CATEGORIES;
  };
  'matrix-problems': typeof MATRIX_PROBLEMS;
  'pattern-drill-scenarios': typeof PATTERN_DRILL_SCENARIOS;
  'dsa-28-patterns': Dsa28BundlePayload & {
    templates: TrickyPatternTemplate[];
  };
  'solver-strategies': {
    strategies: typeof STRATEGIES_CATALOG;
    pureLogicModules: typeof PURE_LOGIC_MODULES;
    sampleProblems: typeof SAMPLE_PROBLEMS;
  };
  'system-design-blueprints': typeof BLUEPRINT_LIST;
  'system-design-components': typeof COMPONENT_CATALOG;
  'system-design-scenarios': {
    scenarios: typeof SYSTEM_SCENARIOS;
    components: typeof SYSTEM_COMPONENTS;
    layers: typeof SYSTEM_LAYERS;
  };
  'system-design-roadmap': {
    coreModules: typeof CORE_ROADMAP_MODULES;
    distributedAlgorithms: typeof DISTRIBUTED_ALGORITHMS;
    frameworkSteps: typeof INTERVIEW_FRAMEWORK_STEPS;
    quizItems: typeof REASONING_QUIZ_ITEMS;
  };
  'ngram-fuzzy-catalog': {
    algorithms: typeof NGRAM_ALGORITHMS;
    stages: typeof NGRAM_STAGES;
    curriculumModules: typeof FUZZY_CURRICULUM_MODULES;
  };
  'ood-principles-catalog': {
    oopsAndSolid: typeof OOPS_AND_SOLID_CONCEPTS;
    patternsAndOod: typeof PATTERNS_AND_OOD_CONCEPTS;
    extendedGof: typeof EXTENDED_GOF_PATTERNS;
  };
  'ai-engineering-phases': typeof AI_ENGINEERING_PHASES;
}

export type ContentBundleKey = keyof CanonicalBundlePayloadMap;

export interface CanonicalBundleDefinition<K extends ContentBundleKey = ContentBundleKey> {
  key: K;
  label: string;
  domain: ContentDomainId;
  description: string;
  getData: () => CanonicalBundlePayloadMap[K];
  countItems: (payload: CanonicalBundlePayloadMap[K]) => number;
  isValidPayload: (payload: unknown) => payload is CanonicalBundlePayloadMap[K];
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function isRecordWithNonEmptyArrays(value: unknown, keys: string[]): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return keys.every((key) => isNonEmptyArray(obj[key]));
}

export const CANONICAL_BUNDLE_DEFINITIONS: {
  [K in ContentBundleKey]: CanonicalBundleDefinition<K>;
} = {
  'algorithms-catalog': {
    key: 'algorithms-catalog',
    label: 'Algorithms Catalog',
    domain: 'algorithms',
    description: '94 full algorithms with visualizations, code, invariants, and practice labs.',
    getData: () => ALGORITHMS_CATALOG,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof ALGORITHMS_CATALOG =>
      isNonEmptyArray(p) && typeof (p[0] as { id?: unknown })?.id === 'string' && Array.isArray((p[0] as { frames?: unknown })?.frames),
  },
  'master-73-roadmap': {
    key: 'master-73-roadmap',
    label: 'Master 73 Roadmap',
    domain: 'algorithms',
    description: '73 progressive mastery milestones across core, advanced, and systems tiers.',
    getData: () => MASTER_73_ROADMAP,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof MASTER_73_ROADMAP =>
      isNonEmptyArray(p) && typeof (p[0] as { number?: unknown })?.number === 'number',
  },
  'algorithm-power-combos': {
    key: 'algorithm-power-combos',
    label: 'Algorithm Power Combos',
    domain: 'algorithms',
    description: '16 multi-algorithm interview combinations and hybrid design patterns.',
    getData: () => ALGORITHM_POWER_COMBOS,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof ALGORITHM_POWER_COMBOS =>
      isNonEmptyArray(p) && typeof (p[0] as { id?: unknown })?.id === 'string',
  },
  'curriculum-topics': {
    key: 'curriculum-topics',
    label: 'Core Curriculum Tracks',
    domain: 'curriculum',
    description: '22 deep DSA curriculum topics with mental models, code ladders, and quizzes.',
    getData: () => CURRICULUM_TOPICS,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof CURRICULUM_TOPICS =>
      isNonEmptyArray(p) &&
      typeof (p[0] as { id?: unknown })?.id === 'string' &&
      Boolean((p[0] as { solutions?: unknown })?.solutions),
  },
  'complete-dsa-roadmap': {
    key: 'complete-dsa-roadmap',
    label: 'Complete DSA Roadmap',
    domain: 'curriculum',
    description: '55 topic roadmap milestones, 5 levels, lesson flow, and mastery checklist.',
    getData: () => ({
      topics: COMPLETE_DSA_ROADMAP,
      levels: DSA_LEVELS,
      lessonFlow: LESSON_FLOW,
      masteryChecklist: MASTERY_CHECKLIST,
    }),
    countItems: (p) => p.topics.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['complete-dsa-roadmap'] =>
      isRecordWithNonEmptyArrays(p, ['topics', 'levels', 'lessonFlow', 'masteryChecklist']),
  },
  'dsa-complete-lessons': {
    key: 'dsa-complete-lessons',
    label: 'Complete DSA Lessons',
    domain: 'curriculum',
    description: '15 end-to-end academy lessons and 8-step lesson workflow.',
    getData: () => ({
      lessons: DSA_COMPLETE_LESSONS,
      steps: DSA_LESSON_STEPS,
    }),
    countItems: (p) => p.lessons.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['dsa-complete-lessons'] =>
      isRecordWithNonEmptyArrays(p, ['lessons', 'steps']),
  },
  'curriculum-patterns': {
    key: 'curriculum-patterns',
    label: 'Coding Patterns Taxonomy',
    domain: 'curriculum',
    description: '20 recurring interview coding patterns grouped across 6 difficulty tiers.',
    getData: () => ({
      patterns: CURRICULUM_PATTERNS,
      tiers: CURRICULUM_TIERS,
    }),
    countItems: (p) => p.patterns.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['curriculum-patterns'] =>
      isRecordWithNonEmptyArrays(p, ['patterns', 'tiers']),
  },
  'academy-resources': {
    key: 'academy-resources',
    label: 'Golden Pattern Templates',
    domain: 'curriculum',
    description: '12 golden code templates and 4 curated academy reference packs.',
    getData: () => ({
      goldenTemplates: GOLDEN_PATTERN_TEMPLATES,
      topicResources: TOPIC_RESOURCES,
    }),
    countItems: (p) => p.goldenTemplates.length + p.topicResources.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['academy-resources'] =>
      isRecordWithNonEmptyArrays(p, ['goldenTemplates', 'topicResources']),
  },
  'shared-topic-academy': {
    key: 'shared-topic-academy',
    label: 'Shared Topic Academy',
    domain: 'curriculum',
    description: '23 cross-track lessons and 175 mapped practice problems.',
    getData: () => ({
      lessons: SHARED_TOPIC_LESSONS,
      problems: SHARED_TOPIC_PROBLEMS,
    }),
    countItems: (p) => p.lessons.length + p.problems.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['shared-topic-academy'] =>
      isRecordWithNonEmptyArrays(p, ['lessons', 'problems']),
  },
  'interactive-problems': {
    key: 'interactive-problems',
    label: '5-Stage Interactive Labs',
    domain: 'problems',
    description: '23 interactive problems with X-Ray reader, Visual Sandbox, Logic Builder, and Race Mode.',
    getData: () => PROBLEMS,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof PROBLEMS =>
      isNonEmptyArray(p) &&
      typeof (p[0] as { id?: unknown })?.id === 'string' &&
      Boolean((p[0] as { sandboxConfig?: unknown })?.sandboxConfig),
  },
  'curated-interview-bank': {
    key: 'curated-interview-bank',
    label: 'Curated Interview Bank',
    domain: 'problems',
    description: '59 curated interview problems spanning 23 core topics.',
    getData: () => CURATED_INTERVIEW_BANK,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof CURATED_INTERVIEW_BANK =>
      isNonEmptyArray(p) && typeof (p[0] as { title?: unknown })?.title === 'string',
  },
  'product-company-bank': {
    key: 'product-company-bank',
    label: 'Product Company & Master 13',
    domain: 'problems',
    description: '44 high-yield product problems, 13 master topic sets, and 5 company cheatsheets.',
    getData: () => ({
      highYield: PRODUCT_COMPANY_HIGH_YIELD,
      master13: MASTER_13_TOPIC_BANK,
      companyCheatsheet: COMPANY_PATTERN_CHEATSHEET,
    }),
    countItems: (p) => p.highYield.length + p.master13.length + p.companyCheatsheet.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['product-company-bank'] =>
      isRecordWithNonEmptyArrays(p, ['highYield', 'master13', 'companyCheatsheet']),
  },
  'high-roi-45': {
    key: 'high-roi-45',
    label: 'High-ROI 45 Collection',
    domain: 'problems',
    description: '50 highest-return interview questions for rapid preparation.',
    getData: () => HIGH_ROI_45_PROBLEMS,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof HIGH_ROI_45_PROBLEMS =>
      isNonEmptyArray(p) && typeof (p[0] as { title?: unknown })?.title === 'string',
  },
  'leetcode-75': {
    key: 'leetcode-75',
    label: 'LeetCode 75 Study Plan',
    domain: 'problems',
    description: '75 classic study-plan problems across 22 topic categories.',
    getData: () => ({
      problems: LEETCODE_75_PROBLEMS,
      categories: LEETCODE_75_CATEGORIES,
    }),
    countItems: (p) => p.problems.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['leetcode-75'] =>
      isRecordWithNonEmptyArrays(p, ['problems', 'categories']),
  },
  'top-interview-100': {
    key: 'top-interview-100',
    label: 'Top Interview 100',
    domain: 'problems',
    description: '100 must-solve interview problems across 15 categories.',
    getData: () => ({
      problems: TOP_INTERVIEW_100,
      categories: TOP_INTERVIEW_100_CATEGORIES,
    }),
    countItems: (p) => p.problems.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['top-interview-100'] =>
      isRecordWithNonEmptyArrays(p, ['problems', 'categories']),
  },
  'matrix-problems': {
    key: 'matrix-problems',
    label: 'Matrix Mastery Bank',
    domain: 'problems',
    description: '42 grid, traversal, DP, and spiral matrix problems.',
    getData: () => MATRIX_PROBLEMS,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof MATRIX_PROBLEMS =>
      isNonEmptyArray(p) && typeof (p[0] as { title?: unknown })?.title === 'string',
  },
  'pattern-drill-scenarios': {
    key: 'pattern-drill-scenarios',
    label: 'Pattern Drill Scenarios',
    domain: 'problems',
    description: '20 timed pattern-recognition scenarios for rapid interview intuition.',
    getData: () => PATTERN_DRILL_SCENARIOS,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof PATTERN_DRILL_SCENARIOS =>
      isNonEmptyArray(p) && typeof (p[0] as { id?: unknown })?.id === 'string',
  },
  'dsa-28-patterns': {
    key: 'dsa-28-patterns',
    label: '28-Pattern DSA Roadmap & Templates',
    domain: 'problems',
    description: '28 core interview patterns across 5 topic groups, compact 28-question revision list, 168 curated LeetCode problems, and 14 multi-language tricky pattern templates.',
    getData: () => ({
      ...DSA28_CANONICAL_BUNDLE,
      templates: DSA28_TRICKY_TEMPLATES,
    }),
    countItems: (p) =>
      p.patterns.reduce((sum, pat) => sum + pat.problems.length, 0) + p.templates.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['dsa-28-patterns'] =>
      isRecordWithNonEmptyArrays(p, ['groups', 'patterns', 'crossCutting', 'templates']),
  },
  'solver-strategies': {
    key: 'solver-strategies',
    label: 'Universal Solver Strategies',
    domain: 'solver',
    description: '43 algorithmic strategies, 4 pure logic modules, and 6 starter problems.',
    getData: () => ({
      strategies: STRATEGIES_CATALOG,
      pureLogicModules: PURE_LOGIC_MODULES,
      sampleProblems: SAMPLE_PROBLEMS,
    }),
    countItems: (p) => p.strategies.length + p.pureLogicModules.length + p.sampleProblems.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['solver-strategies'] =>
      isRecordWithNonEmptyArrays(p, ['strategies', 'pureLogicModules', 'sampleProblems']),
  },
  'system-design-blueprints': {
    key: 'system-design-blueprints',
    label: 'Live Playground Blueprints',
    domain: 'system-design',
    description: '8 runnable React Flow system architectures (UPI, Hotstar, WhatsApp, Netflix, Instagram, Search, Uber, Swiggy).',
    getData: () => BLUEPRINT_LIST,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof BLUEPRINT_LIST =>
      isNonEmptyArray(p) &&
      typeof (p[0] as { id?: unknown })?.id === 'string' &&
      Array.isArray((p[0] as { nodes?: unknown })?.nodes),
  },
  'system-design-components': {
    key: 'system-design-components',
    label: 'Playground Component Catalog',
    domain: 'system-design',
    description: '30 configurable infrastructure nodes across 8 architecture categories.',
    getData: () => COMPONENT_CATALOG,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof COMPONENT_CATALOG =>
      isNonEmptyArray(p) && typeof (p[0] as { type?: unknown })?.type === 'string',
  },
  'system-design-scenarios': {
    key: 'system-design-scenarios',
    label: 'System Scenarios & Layers',
    domain: 'system-design',
    description: '4 production scale scenarios, 11 building blocks, and 4 architectural layers.',
    getData: () => ({
      scenarios: SYSTEM_SCENARIOS,
      components: SYSTEM_COMPONENTS,
      layers: SYSTEM_LAYERS,
    }),
    countItems: (p) => p.scenarios.length + p.components.length + p.layers.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['system-design-scenarios'] =>
      isRecordWithNonEmptyArrays(p, ['scenarios', 'components', 'layers']),
  },
  'system-design-roadmap': {
    key: 'system-design-roadmap',
    label: 'System Design Master Roadmap',
    domain: 'system-design',
    description: '4 core roadmap modules, 6 distributed algorithms, 4 framework steps, and 5 reasoning quizzes.',
    getData: () => ({
      coreModules: CORE_ROADMAP_MODULES,
      distributedAlgorithms: DISTRIBUTED_ALGORITHMS,
      frameworkSteps: INTERVIEW_FRAMEWORK_STEPS,
      quizItems: REASONING_QUIZ_ITEMS,
    }),
    countItems: (p) =>
      p.coreModules.length +
      p.distributedAlgorithms.length +
      p.frameworkSteps.length +
      p.quizItems.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['system-design-roadmap'] =>
      isRecordWithNonEmptyArrays(p, [
        'coreModules',
        'distributedAlgorithms',
        'frameworkSteps',
        'quizItems',
      ]),
  },
  'ngram-fuzzy-catalog': {
    key: 'ngram-fuzzy-catalog',
    label: 'N-Gram & Fuzzy Search Lab',
    domain: 'ngram',
    description: '33 string similarity & indexing algorithms plus 5 fuzzy curriculum modules.',
    getData: () => ({
      algorithms: NGRAM_ALGORITHMS,
      stages: NGRAM_STAGES,
      curriculumModules: FUZZY_CURRICULUM_MODULES,
    }),
    countItems: (p) => p.algorithms.length + p.curriculumModules.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['ngram-fuzzy-catalog'] =>
      isRecordWithNonEmptyArrays(p, ['algorithms', 'stages', 'curriculumModules']),
  },
  'ood-principles-catalog': {
    key: 'ood-principles-catalog',
    label: 'OOPs, SOLID & GoF Patterns',
    domain: 'ood',
    description: '13 OOPs/SOLID principles, 11 OOD core patterns, and 8 extended GoF design patterns.',
    getData: () => ({
      oopsAndSolid: OOPS_AND_SOLID_CONCEPTS,
      patternsAndOod: PATTERNS_AND_OOD_CONCEPTS,
      extendedGof: EXTENDED_GOF_PATTERNS,
    }),
    countItems: (p) =>
      p.oopsAndSolid.length + p.patternsAndOod.length + p.extendedGof.length,
    isValidPayload: (p): p is CanonicalBundlePayloadMap['ood-principles-catalog'] =>
      isRecordWithNonEmptyArrays(p, ['oopsAndSolid', 'patternsAndOod', 'extendedGof']),
  },
  'ai-engineering-phases': {
    key: 'ai-engineering-phases',
    label: 'AI Engineering Phases',
    domain: 'ai',
    description: '5 structured AI engineering curriculum phases covering LLMs, RAG, agents, and evals.',
    getData: () => AI_ENGINEERING_PHASES,
    countItems: (p) => p.length,
    isValidPayload: (p): p is typeof AI_ENGINEERING_PHASES =>
      isNonEmptyArray(p) && typeof (p[0] as { id?: unknown })?.id === 'string',
  },
};

export const ALL_CONTENT_BUNDLE_KEYS = Object.keys(
  CANONICAL_BUNDLE_DEFINITIONS
) as ContentBundleKey[];

export function isValidContentBundleKey(key: string): key is ContentBundleKey {
  return Object.prototype.hasOwnProperty.call(CANONICAL_BUNDLE_DEFINITIONS, key);
}

/**
 * Always returns valid canonical fallback data for any bundle key.
 * Cached per key after first call so React selectors see referential stability.
 */
const localFallbackCache = new Map<ContentBundleKey, unknown>();

export function getCanonicalFallbackBundle<K extends ContentBundleKey>(
  key: K
): CanonicalBundlePayloadMap[K] {
  if (!localFallbackCache.has(key)) {
    localFallbackCache.set(key, CANONICAL_BUNDLE_DEFINITIONS[key].getData());
  }
  return localFallbackCache.get(key) as CanonicalBundlePayloadMap[K];
}

/**
 * Validates an incoming payload from DB/API. If it is null, undefined,
 * malformed, or empty, transparently maps and returns the single canonical
 * local fallback dataset instead.
 */
export function resolveBundleWithFallback<K extends ContentBundleKey>(
  key: K,
  candidate: unknown
): { data: CanonicalBundlePayloadMap[K]; usedFallback: boolean } {
  const def = CANONICAL_BUNDLE_DEFINITIONS[key];
  if (candidate !== null && candidate !== undefined && def.isValidPayload(candidate)) {
    return { data: candidate, usedFallback: false };
  }
  return { data: getCanonicalFallbackBundle(key), usedFallback: true };
}

export function getTotalCanonicalRecordCount(): number {
  return ALL_CONTENT_BUNDLE_KEYS.reduce((sum, key) => {
    const def = CANONICAL_BUNDLE_DEFINITIONS[key];
    return sum + def.countItems(getCanonicalFallbackBundle(key) as never);
  }, 0);
}
