export type OodTrackId =
  | 'oops'
  | 'solid'
  | 'creational'
  | 'structural'
  | 'behavioral'
  | 'ood-systems';

export type OodNodeKind =
  | 'client'
  | 'interface'
  | 'class'
  | 'object'
  | 'memory'
  | 'gate'
  | 'event'
  | 'broken';

export type OodNodeState = 'idle' | 'active' | 'highlight' | 'warn' | 'error' | 'success';

export interface OodVisualNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number; // 0..100 percentage across animation stage
  y: number; // 0..100 percentage down animation stage
  kind: OodNodeKind;
  state: OodNodeState;
  fields?: string[];
}

export interface OodVisualEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed' | 'call' | 'blocked' | 'inherit';
  active?: boolean;
}

export interface OodAnimationFrame {
  stepNumber: number;
  badge: string;
  title: string;
  caption: string;
  nodes: OodVisualNode[];
  edges: OodVisualEdge[];
  stateWatch: { key: string; value: string; tone?: 'neutral' | 'good' | 'warn' | 'bad' }[];
}

export interface OodCodeComparison {
  badLabel: string;
  goodLabel: string;
  explanation: string;
  python: { bad: string; good: string };
  java: { bad: string; good: string };
  typescript: { bad: string; good: string };
}

export interface OodConcept {
  id: string;
  track: OodTrackId;
  trackLabel: string;
  title: string;
  shortTitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  oneSentenceRule: string;
  realWorldAnalogy: string;
  whyItMatters: string;
  keyTakeaways: string[];
  commonMistakes: string[];
  frames: OodAnimationFrame[];
  code: OodCodeComparison;
  interviewQa: { question: string; answer: string }[];
  quiz: {
    question: string;
    options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  };
}
