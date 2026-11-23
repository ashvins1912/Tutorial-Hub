import { validateDomainLessonSimulator } from '../../../shared/domainSimulatorContract';

export function sanitizePublishedLesson(lesson: Record<string, any>) {
  const { domainSimulator: rawDomainSimulator, ...safeLesson } = lesson;
  const domainSimulator = validateDomainLessonSimulator(rawDomainSimulator, Array.isArray(lesson.learningObjectives) ? lesson.learningObjectives : []);
  return {
    ...safeLesson,
    ...(domainSimulator ? { domainSimulator } : {}),
    quiz: Array.isArray(lesson.quiz) ? lesson.quiz.map((question: any) => ({
      question: question.question,
      options: question.options,
      explanation: question.explanation,
      objectiveIds: Array.isArray(question.objectiveIds) ? question.objectiveIds.filter((id: unknown) => typeof id === 'string') : [],
    })) : [],
  };
}
