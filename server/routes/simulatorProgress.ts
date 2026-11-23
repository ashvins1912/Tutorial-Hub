import { validateDomainLessonSimulator } from '../../shared/domainSimulatorContract';

export type SimulatorCompletion = {
  simulatorId: string;
  scenario: string;
  answeredPredictions: number;
  completedAt: Date;
};

export function normalizeSimulatorCompletion(
  value: unknown,
  rawSimulator: unknown,
  learningObjectives: string[],
  now = new Date(),
): SimulatorCompletion | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const attempt = value as Record<string, unknown>;
  const simulator = validateDomainLessonSimulator(rawSimulator, learningObjectives);
  if (!simulator || attempt.completed !== true || attempt.simulatorId !== simulator.id || attempt.scenario !== simulator.scenario) return null;
  if (!Number.isInteger(attempt.answeredPredictions) || Number(attempt.answeredPredictions) < 1 || Number(attempt.answeredPredictions) > 12) return null;
  return { simulatorId: simulator.id, scenario: simulator.scenario, answeredPredictions: Number(attempt.answeredPredictions), completedAt: now };
}
