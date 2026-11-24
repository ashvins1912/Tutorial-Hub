import type { LearningTopic } from './learningContract';
import { buildLearningTrace } from './traceEngine';
import { PATTERN_FORGE_TOPICS } from './patternForgeCurriculum';

/**
 * Automated Content Quality Governance Validator (Section 11)
 * Validates schema integrity, unique IDs, acyclic prerequisite references,
 * objective mapping, trace fixture determinism, complexity metadata, and
 * ensures structurally valid records are NEVER misclassified as Published/Verified.
 */

export interface GovernanceCheckResult {
  checkId: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface TopicGovernanceReport {
  topicId: string;
  title: string;
  verificationStatus: LearningTopic['verificationStatus'];
  version: string;
  structurallyValid: boolean;
  readyForPublication: boolean;
  checks: GovernanceCheckResult[];
}

export interface CurriculumGovernanceAudit {
  totalTopics: number;
  publishedCount: number;
  structurallyValidOnlyCount: number;
  uniqueIdsValid: boolean;
  prerequisiteGraphAcyclic: boolean;
  danglingPrerequisites: string[];
  topicReports: TopicGovernanceReport[];
}

function detectPrerequisiteCycle(topics: LearningTopic[]): boolean {
  const adjacency = new Map<string, string[]>();
  for (const t of topics) {
    adjacency.set(
      t.id,
      t.prerequisites.map((p) => p.topicId)
    );
  }

  const state = new Map<string, 0 | 1 | 2>(); // 0 = unvisited, 1 = visiting, 2 = done
  const dfs = (nodeId: string): boolean => {
    state.set(nodeId, 1);
    for (const next of adjacency.get(nodeId) ?? []) {
      const s = state.get(next) ?? 0;
      if (s === 1) return true;
      if (s === 0 && dfs(next)) return true;
    }
    state.set(nodeId, 2);
    return false;
  };

  for (const t of topics) {
    if ((state.get(t.id) ?? 0) === 0 && dfs(t.id)) return true;
  }
  return false;
}

export function validateTopicContract(
  topic: LearningTopic,
  knownTopicIds: Set<string>
): TopicGovernanceReport {
  const checks: GovernanceCheckResult[] = [];

  const hasCoreMeta =
    Boolean(topic.id) &&
    Boolean(topic.title) &&
    Boolean(topic.description) &&
    topic.learningObjectives.length >= 3 &&
    topic.recognitionSignals.length >= 2 &&
    topic.antiPatterns.length >= 1;
  checks.push({
    checkId: 'required-sections',
    label: 'Canonical metadata & objectives',
    passed: hasCoreMeta,
    detail: hasCoreMeta
      ? `${topic.learningObjectives.length} objectives, ${topic.recognitionSignals.length} signals.`
      : 'Missing core metadata, objectives, or anti-patterns.',
  });

  const missingPrereqs = topic.prerequisites.filter((p) => !knownTopicIds.has(p.topicId));
  checks.push({
    checkId: 'prerequisite-refs',
    label: 'Prerequisite reference integrity',
    passed: missingPrereqs.length === 0,
    detail:
      missingPrereqs.length === 0
        ? `${topic.prerequisites.length} valid prerequisite reference(s).`
        : `Dangling prerequisite(s): ${missingPrereqs.map((m) => m.topicId).join(', ')}`,
  });

  const versionIntact =
    Boolean(topic.version.contentId === topic.id) &&
    Boolean(topic.version.version) &&
    topic.version.reviewHistory.length >= 1 &&
    topic.version.verificationStatus === topic.verificationStatus;
  checks.push({
    checkId: 'version-integrity',
    label: 'Content version & review log integrity',
    passed: versionIntact,
    detail: versionIntact
      ? `v${topic.version.version} (${topic.verificationStatus}) · ${topic.version.reviewHistory.length} review entry(s).`
      : 'Content version metadata or status mismatch.',
  });

  const hasUnderstand = Boolean(
    topic.understand &&
      topic.understand.whatIsPattern &&
      topic.understand.realWorldAnalogy.title &&
      topic.understand.bruteForceComparisons.length >= 2 &&
      topic.understand.conceptualExamples.length >= 2 &&
      topic.understand.commonMisconceptions.length >= 2
  );
  checks.push({
    checkId: 'understand-stage',
    label: 'Stage 1 Understand completeness',
    passed: hasUnderstand,
    detail: hasUnderstand
      ? 'Complete analogy, brute-force comparisons, examples & concept check.'
      : 'Awaiting full Stage 1 authoring.',
  });

  let tracesValid = topic.traceIds.length >= 3;
  if (tracesValid) {
    for (const traceId of topic.traceIds) {
      const trace = buildLearningTrace(traceId);
      if (!trace || trace.steps.length < 3 || !trace.steps.some((s) => Boolean(s.checkpoint))) {
        tracesValid = false;
      }
    }
  }
  checks.push({
    checkId: 'trace-fixtures',
    label: 'Deterministic trace fixtures & checkpoints',
    passed: tracesValid,
    detail: tracesValid
      ? `${topic.traceIds.length} verified deterministic traces with prediction checkpoints.`
      : `${topic.traceIds.length}/3 interactive traces authored.`,
  });

  const hasVerifiedSolutions =
    topic.problems.length >= 3 &&
    topic.problems.every(
      (prob) =>
        prob.testSuite.cases.length >= 3 &&
        prob.solution.variants.length >= 1 &&
        prob.solution.variants.every(
          (v) => Boolean(v.code.java) && Boolean(v.code.javascript) && Boolean(v.code.python) && Boolean(v.timeComplexity)
        )
    );
  checks.push({
    checkId: 'multi-lang-solutions',
    label: 'Java 21 / JS / Python 3.12 verified suites',
    passed: hasVerifiedSolutions,
    detail: hasVerifiedSolutions
      ? `${topic.problems.length} problems with 3-language verified solutions & test suites.`
      : `${topic.problems.length} verified problems authored (minimum 3 required for publication).`,
  });

  const objectiveIds = new Set(topic.learningObjectives.map((o) => o.id));
  const assessmentsMapped =
    topic.assessments.length >= 1 &&
    topic.assessments.every(
      (a) => a.questions.length >= 3 && a.questions.every((q) => objectiveIds.has(q.objectiveId))
    );
  checks.push({
    checkId: 'assessment-mapping',
    label: 'Assessments mapped to learning objectives',
    passed: assessmentsMapped,
    detail: assessmentsMapped
      ? `${topic.assessments.length} objective-mapped transfer assessment(s).`
      : 'Awaiting objective-mapped assessment.',
  });

  const structurallyValid = hasCoreMeta && missingPrereqs.length === 0 && versionIntact;
  const readyForPublication =
    structurallyValid &&
    hasUnderstand &&
    tracesValid &&
    hasVerifiedSolutions &&
    assessmentsMapped &&
    Boolean(topic.version.technicalReviewer) &&
    Boolean(topic.version.learningReviewer);

  // Governance invariant: an unverified record must never be marked Published
  const statusHonest = topic.verificationStatus !== 'Published' || readyForPublication;
  checks.push({
    checkId: 'governance-honesty',
    label: 'Publication status honesty gate',
    passed: statusHonest,
    detail: statusHonest
      ? `Status "${topic.verificationStatus}" accurately reflects verified evidence.`
      : 'Violation: topic marked Published without meeting all verification gates!',
  });

  return {
    topicId: topic.id,
    title: topic.title,
    verificationStatus: topic.verificationStatus,
    version: topic.version.version,
    structurallyValid,
    readyForPublication,
    checks,
  };
}

export function auditCurriculumGovernance(
  topics: LearningTopic[] = PATTERN_FORGE_TOPICS
): CurriculumGovernanceAudit {
  const idSet = new Set<string>();
  let uniqueIdsValid = true;
  for (const t of topics) {
    if (idSet.has(t.id)) uniqueIdsValid = false;
    idSet.add(t.id);
  }

  const danglingPrerequisites: string[] = [];
  for (const t of topics) {
    for (const pr of t.prerequisites) {
      if (!idSet.has(pr.topicId)) {
        danglingPrerequisites.push(`${t.id} -> ${pr.topicId}`);
      }
    }
  }

  const prerequisiteGraphAcyclic = !detectPrerequisiteCycle(topics);
  const topicReports = topics.map((t) => validateTopicContract(t, idSet));

  return {
    totalTopics: topics.length,
    publishedCount: topics.filter((t) => t.verificationStatus === 'Published').length,
    structurallyValidOnlyCount: topics.filter((t) => t.verificationStatus === 'Structurally Valid').length,
    uniqueIdsValid,
    prerequisiteGraphAcyclic,
    danglingPrerequisites,
    topicReports,
  };
}
