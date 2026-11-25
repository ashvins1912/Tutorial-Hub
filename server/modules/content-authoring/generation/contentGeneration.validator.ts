import type { GeneratedLesson, LearningSection } from '../contentAuthoring.types';
import { validateDomainLessonSimulator } from '../../../../shared/domainSimulatorContract';

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

export function validateGeneratedLesson(value: unknown, sections: LearningSection[], sourceText = ''): { lesson: GeneratedLesson; warnings: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('GENERATED_LESSON_INVALID_OBJECT');
  const raw = value as Record<string, unknown>;
  if (!isText(raw.title) || !isText(raw.summary)) throw new Error('GENERATED_LESSON_MISSING_TITLE_OR_SUMMARY');
  const modules = asArray(raw.modules);
  const expectedIds = new Set(sections.filter((section) => section.required).map((section) => section.id));
  const seenIds = new Set<string>();
  const warnings: string[] = [];
  for (const item of modules) {
    if (!item || typeof item !== 'object') throw new Error('GENERATED_MODULE_INVALID');
    const module = item as Record<string, unknown>;
    if (!isText(module.sectionId) || !isText(module.title) || !isText(module.contentMarkdown)) throw new Error('GENERATED_MODULE_INCOMPLETE');
    if (seenIds.has(module.sectionId)) throw new Error('GENERATED_MODULE_DUPLICATE_SECTION');
    seenIds.add(module.sectionId);
    const section = sections.find((candidate) => candidate.id === module.sectionId);
    if (!section) throw new Error('GENERATED_MODULE_UNKNOWN_SECTION');

    const codeExamples = asArray(module.codeExamples);
    const workedExamples = asArray(module.workedExamples);
    const reasoningSteps = asArray(module.reasoningSteps);
    if (['explanation', 'reasoning', 'code'].includes(section.blockType) && workedExamples.length === 0) {
      warnings.push(`Module "${module.title}" has no worked example or counterexample.`);
    }
    if (section.blockType === 'code' && codeExamples.length === 0) {
      warnings.push(`Code module "${module.title}" has no code example.`);
    }
    if (section.blockType === 'reasoning' && reasoningSteps.length < 2) {
      warnings.push(`Reasoning module "${module.title}" should show at least two explicit reasoning steps.`);
    }
    for (const example of workedExamples) {
      if (!example || typeof example !== 'object' || Array.isArray(example)) {
        warnings.push(`Module "${module.title}" contains a malformed worked example.`);
        continue;
      }
      const worked = example as Record<string, unknown>;
      if (!isText(worked.title) || !isText(worked.explanation)) {
        warnings.push(`Module "${module.title}" has a worked example missing its title or explanation.`);
      }
      if (!isText(worked.input) || !isText(worked.output)) {
        warnings.push(`Worked example "${String(worked.title || module.title)}" should state its input and expected output.`);
      }
    }
    for (const example of codeExamples) {
      if (!example || typeof example !== 'object' || Array.isArray(example)) {
        warnings.push(`Module "${module.title}" contains a malformed code example.`);
        continue;
      }
      const code = example as Record<string, unknown>;
      if (!isText(code.language) || !isText(code.code) || !isText(code.explanation)) {
        warnings.push(`Module "${module.title}" has a code example missing language, code or explanation.`);
      }
    }
  }
  const missing = [...expectedIds].filter((id) => !seenIds.has(id));
  if (missing.length) throw new Error(`GENERATED_REQUIRED_SECTIONS_MISSING:${missing.join(',')}`);
  const visualizations = asArray(raw.visualizations);
  const quiz = asArray(raw.quiz);
  const practiceTasks = asArray(raw.practiceTasks);
  if (!asArray(raw.learningObjectives).some(isText)) warnings.push('No measurable learning objectives were supplied.');
  const sourceUrls = new Set((sourceText.match(/https?:\/\/[^\s)\]>]+/g) || []).map((url) => url.replace(/[.,;]+$/, '')));
  const candidateReferences = asArray(raw.references).filter((ref): ref is Record<string, unknown> => !!ref && typeof ref === 'object' && isText((ref as Record<string, unknown>).label) && isText((ref as Record<string, unknown>).url));
  const allowedReferences = candidateReferences.filter((ref) => sourceUrls.has(String(ref.url).replace(/[.,;]+$/, '')));
  if (candidateReferences.length !== allowedReferences.length) warnings.push('One or more AI-suggested references were omitted because their URLs were not present in the author-supplied source.');
  if (!quiz.length) warnings.push('No quiz questions were generated.');
  if (!practiceTasks.length) warnings.push('No practical exercises were generated.');
  if (!visualizations.length) warnings.push('No visualizations were generated.');
  const availableQuizObjectives = new Set(asArray(raw.learningObjectives).filter(isText));
  const normalizedQuiz = quiz.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('GENERATED_QUIZ_INVALID');
    const question = item as Record<string, unknown>;
    if (!isText(question.question) || !isText(question.explanation) || !(isText(question.correctAnswer) || Array.isArray(question.correctAnswer))) throw new Error('GENERATED_QUIZ_INCOMPLETE');
    const objectiveIds = asArray(question.objectiveIds);
    const validObjectiveIds = objectiveIds.filter(isText);
    if (!validObjectiveIds.length || validObjectiveIds.length !== objectiveIds.length || validObjectiveIds.length > 12 || validObjectiveIds.some((id) => id.length > 120) || new Set(validObjectiveIds).size !== validObjectiveIds.length || validObjectiveIds.some((id) => !availableQuizObjectives.has(id))) throw new Error('GENERATED_QUIZ_OBJECTIVE_BINDING_INVALID');
    return { ...question, objectiveIds: validObjectiveIds };
  }) as GeneratedLesson['quiz'];
  for (const item of visualizations) {
    if (!item || typeof item !== 'object') throw new Error('GENERATED_VISUALIZATION_INVALID');
    const visual = item as Record<string, unknown>;
    if (!isText(visual.title) || !isText(visual.source) || !['mermaid','step-animation','table','equation','chart-spec'].includes(String(visual.type))) throw new Error('GENERATED_VISUALIZATION_INCOMPLETE');
    if (visual.type === 'step-animation' && asArray(visual.steps).length < 2) throw new Error('GENERATED_ANIMATION_NEEDS_TWO_STEPS');
  }
  let simulator: GeneratedLesson['simulator'];
  if (raw.simulator !== undefined && raw.simulator !== null) {
    if (!raw.simulator || typeof raw.simulator !== 'object' || Array.isArray(raw.simulator)) throw new Error('GENERATED_SIMULATOR_INVALID');
    const candidate = raw.simulator as Record<string, unknown>;
    if (candidate.schemaVersion !== 1 || !isText(candidate.id) || candidate.id.length > 80 || candidate.kind !== 'algorithm-trace' || !isText(candidate.title) || !isText(candidate.description) || !['binary-search', 'bubble-sort'].includes(String(candidate.algorithm)) || typeof candidate.initialInput !== 'string' || candidate.initialInput.length > 256) throw new Error('GENERATED_SIMULATOR_INVALID');
    if (!isText(candidate.initialInput)) throw new Error('GENERATED_SIMULATOR_INPUT_REQUIRED');
    const values = candidate.initialInput.split(',').map((part) => Number(part.trim()));
    if (values.length > 12 || values.some((value) => !Number.isFinite(value))) throw new Error('GENERATED_SIMULATOR_INPUT_INVALID');
    if (candidate.algorithm === 'binary-search' && (!isText(candidate.target) || !Number.isFinite(Number(candidate.target)))) throw new Error('GENERATED_SIMULATOR_TARGET_REQUIRED');
    if (candidate.algorithm === 'binary-search' && values.some((value, index) => index > 0 && values[index - 1] > value)) throw new Error('GENERATED_SIMULATOR_INPUT_MUST_BE_SORTED');
    const objectiveIds = asArray(candidate.objectiveIds);
    const validObjectiveIds = objectiveIds.filter(isText);
    const availableObjectives = new Set(asArray(raw.learningObjectives).filter(isText));
    if (!validObjectiveIds.length || validObjectiveIds.length !== objectiveIds.length || validObjectiveIds.length > 12 || validObjectiveIds.some((id) => id.length > 120) || new Set(validObjectiveIds).size !== validObjectiveIds.length || validObjectiveIds.some((id) => !availableObjectives.has(id))) throw new Error('GENERATED_SIMULATOR_OBJECTIVE_BINDING_INVALID');
    simulator = { schemaVersion: 1, id: candidate.id, kind: 'algorithm-trace', title: candidate.title, description: candidate.description, algorithm: candidate.algorithm as 'binary-search' | 'bubble-sort', initialInput: candidate.initialInput, objectiveIds: validObjectiveIds, ...(typeof candidate.target === 'string' ? { target: candidate.target } : {}) };
  }
  let domainSimulator: GeneratedLesson['domainSimulator'];
  if (raw.domainSimulator !== undefined && raw.domainSimulator !== null) {
    if (!raw.domainSimulator || typeof raw.domainSimulator !== 'object' || Array.isArray(raw.domainSimulator)) throw new Error('GENERATED_DOMAIN_SIMULATOR_INVALID');
    const candidate = raw.domainSimulator as Record<string, unknown>;
    const objectiveIds = asArray(candidate.objectiveIds);
    const validObjectiveIds = objectiveIds.filter(isText);
    const availableObjectives = asArray(raw.learningObjectives).filter(isText);
    domainSimulator = validateDomainLessonSimulator(candidate, availableObjectives) || undefined;
    if (!domainSimulator) {
      const invalidObjectiveBinding = !validObjectiveIds.length || validObjectiveIds.length !== objectiveIds.length || validObjectiveIds.some((id) => id.length > 120) || new Set(validObjectiveIds).size !== validObjectiveIds.length || validObjectiveIds.some((id) => !availableObjectives.includes(id));
      throw new Error(invalidObjectiveBinding ? 'GENERATED_DOMAIN_SIMULATOR_OBJECTIVE_BINDING_INVALID' : 'GENERATED_DOMAIN_SIMULATOR_INVALID');
    }
  }
  const lesson: GeneratedLesson = {
    schemaVersion: '1.0',
    title: raw.title as string,
    summary: raw.summary as string,
    learningObjectives: asArray(raw.learningObjectives).filter(isText),
    modules: modules as GeneratedLesson['modules'],
    visualizations: visualizations as GeneratedLesson['visualizations'],
    quiz: normalizedQuiz,
    practiceTasks: practiceTasks as GeneratedLesson['practiceTasks'],
    ...(simulator ? { simulator } : {}),
    ...(domainSimulator ? { domainSimulator } : {}),
    references: allowedReferences.map((ref) => ({ label: String(ref.label), url: String(ref.url), suppliedByUser: true })),
    qualityNotes: asArray(raw.qualityNotes).filter(isText),
    validation: { status: 'unverified-draft', checks: ['JSON structure valid', 'Required learning sections present', 'Visualization and objective-linked quiz structure checked', 'Worked-example and code-example evidence checked for quality warnings', 'Optional algorithm and domain simulator configuration shape checked'], warnings },
  };
  return { lesson, warnings };
}
