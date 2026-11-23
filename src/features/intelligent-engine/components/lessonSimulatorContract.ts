export type LessonSimulator =
  | {
      schemaVersion: 1;
      id: string;
      kind: 'algorithm-trace';
      title: string;
      description: string;
      algorithm: 'binary-search' | 'bubble-sort';
      initialInput: string;
      target?: string;
    };

export function validateLessonSimulator(value: unknown): LessonSimulator | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.schemaVersion !== 1 || typeof candidate.id !== 'string' || !candidate.id.trim() || candidate.id.length > 80) return null;
  if (candidate.kind !== 'algorithm-trace' || typeof candidate.title !== 'string' || !candidate.title.trim() || typeof candidate.description !== 'string' || !candidate.description.trim()) return null;
  if (candidate.algorithm !== 'binary-search' && candidate.algorithm !== 'bubble-sort') return null;
  if (typeof candidate.initialInput !== 'string' || !candidate.initialInput.trim() || candidate.initialInput.length > 256) return null;
  const values = candidate.initialInput.split(',').map((part) => Number(part.trim()));
  if (values.length > 12 || values.some((value) => !Number.isFinite(value))) return null;
  if (candidate.algorithm === 'binary-search' && (typeof candidate.target !== 'string' || !candidate.target.trim() || !Number.isFinite(Number(candidate.target)) || values.some((value, index) => index > 0 && values[index - 1] > value))) return null;
  return {
    schemaVersion: 1,
    id: candidate.id,
    kind: 'algorithm-trace',
    title: candidate.title,
    description: candidate.description,
    algorithm: candidate.algorithm,
    initialInput: candidate.initialInput,
    ...(typeof candidate.target === 'string' ? { target: candidate.target } : {}),
  };
}
