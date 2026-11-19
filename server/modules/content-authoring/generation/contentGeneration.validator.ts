import type { GeneratedLesson, LearningSection } from '../contentAuthoring.types';

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

export function validateGeneratedLesson(value: unknown, sections: LearningSection[]): { lesson: GeneratedLesson; warnings: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('GENERATED_LESSON_INVALID_OBJECT');
  const raw = value as Record<string, unknown>;
  if (!isText(raw.title) || !isText(raw.summary)) throw new Error('GENERATED_LESSON_MISSING_TITLE_OR_SUMMARY');
  const modules = asArray(raw.modules);
  const expectedIds = new Set(sections.filter((section) => section.required).map((section) => section.id));
  const seenIds = new Set<string>();
  for (const item of modules) {
    if (!item || typeof item !== 'object') throw new Error('GENERATED_MODULE_INVALID');
    const module = item as Record<string, unknown>;
    if (!isText(module.sectionId) || !isText(module.title) || !isText(module.contentMarkdown)) throw new Error('GENERATED_MODULE_INCOMPLETE');
    if (seenIds.has(module.sectionId)) throw new Error('GENERATED_MODULE_DUPLICATE_SECTION');
    seenIds.add(module.sectionId);
    if (!sections.some((section) => section.id === module.sectionId)) throw new Error('GENERATED_MODULE_UNKNOWN_SECTION');
  }
  const missing = [...expectedIds].filter((id) => !seenIds.has(id));
  if (missing.length) throw new Error(`GENERATED_REQUIRED_SECTIONS_MISSING:${missing.join(',')}`);
  const visualizations = asArray(raw.visualizations);
  const quiz = asArray(raw.quiz);
  const practiceTasks = asArray(raw.practiceTasks);
  const warnings: string[] = [];
  if (!quiz.length) warnings.push('No quiz questions were generated.');
  if (!practiceTasks.length) warnings.push('No practical exercises were generated.');
  if (!visualizations.length) warnings.push('No visualizations were generated.');
  for (const item of quiz) {
    if (!item || typeof item !== 'object') throw new Error('GENERATED_QUIZ_INVALID');
    const question = item as Record<string, unknown>;
    if (!isText(question.question) || !isText(question.explanation) || !(isText(question.correctAnswer) || Array.isArray(question.correctAnswer))) throw new Error('GENERATED_QUIZ_INCOMPLETE');
  }
  for (const item of visualizations) {
    if (!item || typeof item !== 'object') throw new Error('GENERATED_VISUALIZATION_INVALID');
    const visual = item as Record<string, unknown>;
    if (!isText(visual.title) || !isText(visual.source) || !['mermaid','step-animation','table','equation','chart-spec'].includes(String(visual.type))) throw new Error('GENERATED_VISUALIZATION_INCOMPLETE');
    if (visual.type === 'step-animation' && asArray(visual.steps).length < 2) throw new Error('GENERATED_ANIMATION_NEEDS_TWO_STEPS');
  }
  const lesson: GeneratedLesson = {
    schemaVersion: '1.0',
    title: raw.title as string,
    summary: raw.summary as string,
    learningObjectives: asArray(raw.learningObjectives).filter(isText),
    modules: modules as GeneratedLesson['modules'],
    visualizations: visualizations as GeneratedLesson['visualizations'],
    quiz: quiz as GeneratedLesson['quiz'],
    practiceTasks: practiceTasks as GeneratedLesson['practiceTasks'],
    references: asArray(raw.references).filter((ref): ref is GeneratedLesson['references'][number] => !!ref && typeof ref === 'object' && isText((ref as Record<string, unknown>).label) && isText((ref as Record<string, unknown>).url)).map((ref) => ({ ...ref, suppliedByUser: Boolean(ref.suppliedByUser) })) as GeneratedLesson['references'],
    qualityNotes: asArray(raw.qualityNotes).filter(isText),
    validation: { status: 'unverified-draft', checks: ['JSON structure valid', 'Required learning sections present', 'Visualization and quiz structure checked'], warnings },
  };
  return { lesson, warnings };
}
