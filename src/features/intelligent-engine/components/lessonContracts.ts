export interface LessonSimulatorConfig {
  schemaVersion: 1;
  id: string;
  title: string;
  description: string;
  kind: 'algorithm-trace';
  algorithm: 'binary-search' | 'bubble-sort';
  initialInput: string;
  initialTarget?: string;
  objectiveIds: string[];
}

export function validateLessonSimulator(value: unknown): LessonSimulatorConfig | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== 1 || typeof candidate.id !== 'string' || !candidate.id.trim() || candidate.id.length > 80) return null;
  if (candidate.kind !== 'algorithm-trace' || typeof candidate.title !== 'string' || !candidate.title.trim() || typeof candidate.description !== 'string' || !candidate.description.trim()) return null;
  if (candidate.algorithm !== 'binary-search' && candidate.algorithm !== 'bubble-sort') return null;
  if (typeof candidate.initialInput !== 'string' || !candidate.initialInput.trim() || candidate.initialInput.length > 256) return null;
  const values = candidate.initialInput.split(',').map((part) => Number(part.trim()));
  if (values.length > 12 || values.some((item) => !Number.isFinite(item))) return null;
  if (candidate.algorithm === 'binary-search' && (typeof candidate.initialTarget !== 'string' || !candidate.initialTarget.trim() || !Number.isFinite(Number(candidate.initialTarget)) || values.some((item, index) => index > 0 && values[index - 1] > item))) return null;
  if (!Array.isArray(candidate.objectiveIds) || candidate.objectiveIds.length === 0 || candidate.objectiveIds.some((item) => typeof item !== 'string' || !item.trim())) return null;
  return {
    schemaVersion: 1,
    id: candidate.id,
    title: candidate.title,
    description: candidate.description,
    kind: 'algorithm-trace',
    algorithm: candidate.algorithm,
    initialInput: candidate.initialInput,
    ...(typeof candidate.initialTarget === 'string' ? { initialTarget: candidate.initialTarget } : {}),
    objectiveIds: candidate.objectiveIds as string[],
  };
}
