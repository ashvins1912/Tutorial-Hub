export type DomainSimulatorScenario = 'database-query-plan' | 'system-capacity' | 'concurrency-lost-update' | 'cloud-pipeline-gate';

export type DomainLessonSimulator = {
  schemaVersion: 1;
  id: string;
  kind: 'domain-prediction';
  scenario: DomainSimulatorScenario;
  title: string;
  description: string;
  objectiveIds: string[];
};

const SCENARIOS = new Set<DomainSimulatorScenario>([
  'database-query-plan',
  'system-capacity',
  'concurrency-lost-update',
  'cloud-pipeline-gate',
]);

export function validateDomainLessonSimulator(value: unknown, availableObjectives?: string[]): DomainLessonSimulator | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== 1 || candidate.kind !== 'domain-prediction') return null;
  if (typeof candidate.id !== 'string' || !candidate.id.trim() || candidate.id.length > 80) return null;
  if (typeof candidate.title !== 'string' || !candidate.title.trim() || candidate.title.length > 120) return null;
  if (typeof candidate.description !== 'string' || !candidate.description.trim() || candidate.description.length > 400) return null;
  if (typeof candidate.scenario !== 'string' || !SCENARIOS.has(candidate.scenario as DomainSimulatorScenario)) return null;
  if (!Array.isArray(candidate.objectiveIds) || candidate.objectiveIds.length === 0 || candidate.objectiveIds.length > 12) return null;
  if (candidate.objectiveIds.some((id) => typeof id !== 'string' || !id.trim() || id.length > 120)) return null;
  const objectiveIds = candidate.objectiveIds as string[];
  if (new Set(objectiveIds).size !== objectiveIds.length) return null;
  if (availableObjectives && objectiveIds.some((id) => !availableObjectives.includes(id))) return null;
  return { schemaVersion: 1, id: candidate.id, kind: 'domain-prediction', scenario: candidate.scenario as DomainSimulatorScenario, title: candidate.title, description: candidate.description, objectiveIds };
}
