import { SAMPLE_PROBLEMS } from '../../core/knowledge-base/strategiesCatalog';
import { PROBLEMS } from '../../data/problems';
import { BIG_TECH_PROBLEMS } from '../../../server/seed/bigTechTopicSeed';
import {
  MASTER_13_TOPIC_BANK,
  PRODUCT_COMPANY_HIGH_YIELD,
} from '../../data/productCompanyMasterBank';
import { HIGH_ROI_45_PROBLEMS } from '../../data/highRoi45';
import { MATRIX_PROBLEMS } from '../../data/matrixProblems';
import {
  ADVANCED_ALGORITHM_CATEGORIES,
  ALGORITHMS_CATALOG,
  ALL_PRACTICE_CHALLENGES,
  SYSTEMS_ALGORITHM_CATEGORIES,
} from '../../data/algorithmsCatalog';
import { CURRICULUM_TOPICS } from '../topics/data/curriculumIndex';
import { CURATED_INTERVIEW_BANK } from '../topics/data/curatedInterviewBank';

export type SystemProblemSource =
  | 'Logic Presets'
  | '94-Algo Studio'
  | '22 Topic Tracks'
  | 'Curated Bank'
  | '5-Stage Labs'
  | 'Big Tech Vault'
  | 'Product Co. Bank'
  | '45 High-ROI'
  | 'Matrix Bank'
  | 'DB Interview Catalog';

export interface SystemSolverProblem {
  id: string;
  title: string;
  statement: string;
  source: SystemProblemSource;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  hintSummary: string;
  optimalComplexity: string;
  labProblemId?: string;
  curriculumTopicId?: string;
  algorithmId?: string;
}

function normalizeTitleKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/^#\d+\s*/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function mapMatrixDifficulty(level: 'Beginner' | 'Intermediate' | 'Advanced'): 'Easy' | 'Medium' | 'Hard' {
  if (level === 'Beginner') return 'Easy';
  if (level === 'Advanced') return 'Hard';
  return 'Medium';
}

function normalizeDifficulty(raw: string): 'Easy' | 'Medium' | 'Hard' {
  if (raw === 'Easy' || raw === 'Easy-Med') return 'Easy';
  if (raw === 'Hard' || raw === 'Hardest' || raw === 'System Design') return 'Hard';
  return 'Medium';
}

/**
 * Compiles all built-in DSA, Math, Logic, Matrix, Big Tech, and Product-Company problems
 * available in the platform into a unified, searchable catalog for the Universal Solver Studio.
 */
export function buildStaticSystemProblemCatalog(): SystemSolverProblem[] {
  const results: SystemSolverProblem[] = [];
  const seenKeys = new Set<string>();

  const pushUnique = (item: SystemSolverProblem, dedupeByTitle = true) => {
    const key = dedupeByTitle ? normalizeTitleKey(item.title) : item.id;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    results.push(item);
  };

  // 1. Universal Logic / Math / Game Theory / Fuzzy Presets
  for (const s of SAMPLE_PROBLEMS) {
    pushUnique(
      {
        id: s.id,
        title: s.title,
        statement: s.statement,
        source: 'Logic Presets',
        topic: s.expectedDomain.replace(/_/g, ' '),
        difficulty: normalizeDifficulty(s.tier),
        companies: ['Google', 'Jane Street'],
        hintSummary: s.constraintsSummary,
        optimalComplexity: 'Constraint-derived',
      },
      false
    );
  }

  // 2. 5-Stage Interactive Lab Problems (richest statements & constraints)
  for (const p of PROBLEMS) {
    const baseText =
      p.statementSegments.map((seg) => seg.text).join('').trim() || p.summary;
    const constraintText = `Input size N <= 10^${p.inputSizeExponent}.`;
    const signalText =
      p.signals.length > 0
        ? ` Key signals: ${p.signals.map((sig) => sig.phrase).join(', ')}.`
        : '';
    pushUnique({
      id: `lab-${p.id}`,
      title: `#${p.number} ${p.title}`,
      statement: `${baseText} ${constraintText}${signalText}`,
      source: '5-Stage Labs',
      topic: p.patternName,
      difficulty: normalizeDifficulty(p.difficulty),
      companies: p.interviewContext?.companies ?? [],
      hintSummary: p.patternName,
      optimalComplexity: `${p.targetBigO} · ${p.spaceOptimal}`,
      labProblemId: p.id,
    });
  }

  // 3. Big Tech 48 Topic-Wise Vault
  for (const bp of BIG_TECH_PROBLEMS) {
    const companies = bp.bigTechFrequency.map((f) => f.company);
    const body = (bp.fullDescription || bp.promptSummary).trim();
    const constraintsJoined =
      bp.constraintsList && bp.constraintsList.length > 0
        ? bp.constraintsList.join('; ')
        : bp.constraintsText;
    const statement = `${body} Constraints: ${constraintsJoined}.`;
    const optimal = bp.interviewSolutionLadder.optimalPitch;
    pushUnique({
      id: `bigtech-${bp.slug}`,
      title: bp.title,
      statement,
      source: 'Big Tech Vault',
      topic: bp.topicCategory,
      difficulty: normalizeDifficulty(bp.difficulty),
      companies,
      hintSummary: bp.primaryPattern,
      optimalComplexity: `${optimal.time} · ${optimal.space}`,
      labProblemId: bp.labProblemId,
    });
  }

  // 4. Product Company High-Yield & Master 13 Bank (pre-authored solverPrompts!)
  for (const pq of PRODUCT_COMPANY_HIGH_YIELD) {
    pushUnique({
      id: `prod-${pq.id}`,
      title: pq.title,
      statement: pq.solverPrompt,
      source: 'Product Co. Bank',
      topic: pq.primaryPattern,
      difficulty: pq.difficulty,
      companies: pq.companies,
      hintSummary: pq.optimalApproach,
      optimalComplexity: pq.optimalComplexity,
      curriculumTopicId: pq.curriculumTopicId,
    });
  }

  for (const section of MASTER_13_TOPIC_BANK) {
    for (const mp of section.problems) {
      pushUnique({
        id: `master-${mp.id}`,
        title: `#${mp.number} ${mp.title}`,
        statement: mp.solverPrompt,
        source: 'Product Co. Bank',
        topic: section.title,
        difficulty: mp.difficulty,
        companies: mp.companies,
        hintSummary: mp.patternClue,
        optimalComplexity: mp.patternClue,
        curriculumTopicId: mp.curriculumTopicId,
      });
    }
  }

  // 5. 45 High-ROI Interview Sheet
  for (const hr of HIGH_ROI_45_PROBLEMS) {
    const statement = `Given a problem involving ${hr.signalPhrases.join(', ')} with input constraint N <= ${hr.inputConstraintMax}. Design an optimal algorithm to solve "${hr.title}" (${hr.primaryPattern} / ${hr.secondaryStructure}).`;
    pushUnique({
      id: `roi-${hr.number}`,
      title: `#${hr.number} ${hr.title}`,
      statement,
      source: '45 High-ROI',
      topic: hr.primaryPattern,
      difficulty: hr.difficulty as 'Easy' | 'Medium' | 'Hard',
      companies: hr.collections,
      hintSummary: hr.optimalApproach,
      optimalComplexity: hr.optimalApproach,
      labProblemId: hr.labProblemId,
    });
  }

  // 6. Matrix Problem Bank (40 Problems)
  for (const mp of MATRIX_PROBLEMS) {
    pushUnique({
      id: `matrix-${mp.id}`,
      title: mp.title,
      statement: `${mp.prompt} (2D Matrix ${mp.group} problem, R x C <= 10^5).`,
      source: 'Matrix Bank',
      topic: `Matrix · ${mp.group}`,
      difficulty: mapMatrixDifficulty(mp.level),
      companies: ['Google', 'Amazon', 'Microsoft'],
      hintSummary: mp.approach,
      optimalComplexity: mp.complexity,
    });
  }

  // 7. All 94 Algorithms Studio Challenges & Patterns
  for (const algo of ALGORITHMS_CATALOG) {
    const challenge = ALL_PRACTICE_CHALLENGES[algo.id];
    const promptText = challenge
      ? `${challenge.prompt} (${algo.name} · ${algo.category}). Key signals: ${algo.whenToUse.slice(0, 2).join('; ')}. Target complexity: ${algo.timeComplexity} time, ${algo.spaceComplexity} space.`
      : `Apply ${algo.name} (${algo.category}) to solve a real engineering scenario: ${algo.tagline}. Trigger signals: ${algo.whenToUse.slice(0, 2).join('; ')}. Target complexity: ${algo.timeComplexity} time, ${algo.spaceComplexity} space.`;

    const inferredDifficulty: 'Easy' | 'Medium' | 'Hard' =
      SYSTEMS_ALGORITHM_CATEGORIES.includes(algo.category) ||
      ADVANCED_ALGORITHM_CATEGORIES.includes(algo.category)
        ? 'Hard'
        : algo.category === 'Array & String Patterns' || algo.category === 'Searching & Sorting'
          ? 'Easy'
          : 'Medium';

    pushUnique(
      {
        id: `algo-studio-${algo.id}`,
        title: algo.name,
        statement: promptText,
        source: '94-Algo Studio',
        topic: algo.category,
        difficulty: inferredDifficulty,
        companies: ['Google', 'Meta', 'Amazon'],
        hintSummary: algo.coreIdea,
        optimalComplexity: `${algo.timeComplexity} · ${algo.spaceComplexity}`,
        algorithmId: algo.id,
      },
      false
    );
  }

  // 8. All 22 Curriculum Topic Tracks
  for (const topic of CURRICULUM_TOPICS) {
    const optimal = topic.solutions.optimal;
    const clueSummary = topic.patternClues.slice(0, 2).map((c) => c.signal).join('; ');
    pushUnique(
      {
        id: `curriculum-topic-${topic.id}`,
        title: `Topic #${String(topic.order).padStart(2, '0')}: ${topic.title}`,
        statement: `${topic.tagline}. ${topic.mentalModelSteps[0] ?? optimal.intuition} Pattern clues: ${clueSummary || topic.keywords.slice(0, 4).join(', ')}. Target complexity: ${optimal.timeComplexity} time, ${optimal.spaceComplexity} space.`,
        source: '22 Topic Tracks',
        topic: topic.tier,
        difficulty:
          topic.tier === 'Foundations'
            ? 'Easy'
            : topic.tier === 'Advanced' || topic.tier === 'Applied System Algorithms'
              ? 'Hard'
              : 'Medium',
        companies: ['FAANG', 'Systems'],
        hintSummary: optimal.intuition,
        optimalComplexity: `${optimal.timeComplexity} · ${optimal.spaceComplexity}`,
        curriculumTopicId: topic.id,
      },
      false
    );
  }

  // 9. Curated Blind 75 / NeetCode 150 Interview Bank
  for (const cq of CURATED_INTERVIEW_BANK) {
    const twistPrompt = cq.followUpTwists[0]?.prompt ? ` Follow-up twist: ${cq.followUpTwists[0].prompt}` : '';
    pushUnique({
      id: `curated-${cq.slug}`,
      title: cq.title,
      statement: `${cq.plainEnglishGoal} Pattern trigger: ${cq.patternTrigger}. Topic: ${cq.topicLabel}. Target complexity: ${cq.timeComplexity} time, ${cq.spaceComplexity} space.${twistPrompt}`,
      source: 'Curated Bank',
      topic: cq.topicLabel,
      difficulty: cq.difficulty,
      companies: cq.tracks,
      hintSummary: cq.optimalApproach,
      optimalComplexity: `${cq.timeComplexity} · ${cq.spaceComplexity}`,
      curriculumTopicId: cq.topicId,
    });
  }

  return results;
}

/**
 * Merges live MongoDB InterviewProblem documents into the static catalog without duplicates.
 */
export function mergeDbInterviewProblems(
  baseCatalog: SystemSolverProblem[],
  dbProblems: Array<{
    slug?: string;
    title?: string;
    topic?: string;
    topicId?: string;
    difficulty?: string;
    statement?: string;
    constraints?: string[];
    companies?: string[];
    stages?: { master?: { timeComplexity?: string; spaceComplexity?: string } };
  }>
): SystemSolverProblem[] {
  const seen = new Set(baseCatalog.map((item) => normalizeTitleKey(item.title)));
  const merged = [...baseCatalog];

  for (const doc of dbProblems) {
    if (!doc?.title) continue;
    const key = normalizeTitleKey(doc.title);
    if (seen.has(key)) continue;
    seen.add(key);

    const diff =
      doc.difficulty === 'Easy' || doc.difficulty === 'Medium' || doc.difficulty === 'Hard'
        ? doc.difficulty
        : 'Medium';
    const constraintsStr =
      Array.isArray(doc.constraints) && doc.constraints.length > 0
        ? ` Constraints: ${doc.constraints.slice(0, 4).join('; ')}.`
        : '';
    const rawStatement =
      typeof doc.statement === 'string' && doc.statement.trim().length > 15
        ? `${doc.statement.trim()}${constraintsStr}`
        : `Solve "${doc.title}" in the ${doc.topic || 'DSA'} domain. Identify the optimal data structure, loop invariant, and time/space complexity.${constraintsStr}`;

    const tc = doc.stages?.master?.timeComplexity;
    const sc = doc.stages?.master?.spaceComplexity;

    merged.push({
      id: `db-${doc.slug || key.replace(/\s+/g, '-')}`,
      title: doc.title,
      statement: rawStatement,
      source: 'DB Interview Catalog',
      topic: doc.topic || 'Interview DSA',
      difficulty: diff,
      companies: Array.isArray(doc.companies) ? doc.companies : [],
      hintSummary: doc.topic || 'Canonical Interview Problem',
      optimalComplexity: tc ? `${tc}${sc ? ` · ${sc}` : ''}` : 'Derive via constraints',
      curriculumTopicId: doc.topicId,
    });
  }

  return merged;
}
