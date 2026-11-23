export interface LessonSimulatorConfig {
  id: string;
  title: string;
  kind: 'algorithm-trace';
  algorithm: 'binary-search' | 'bubble-sort';
  initialInput: string;
  initialTarget?: string;
  objectiveIds: string[];
}
