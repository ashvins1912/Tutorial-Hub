import { NGRAM_STAGE_1_2 } from './ngramTaxonomyPart1';
import { NGRAM_STAGE_3_4 } from './ngramTaxonomyPart2';

export type NGramStageId = 'tokenization' | 'similarity' | 'retrieval' | 'hybrid';

export type NGramSubGroup =
  | 'Tokenization & Slicing'
  | 'Set-Based Metrics (Unweighted)'
  | 'Vector & Weighted Metrics'
  | 'Order-Aware & Structural Metrics'
  | 'Inverted Index & Pruning Filters'
  | 'Probabilistic & Sketching Indexes'
  | 'Hybrid & Phonetic Variants';

export type NGramVisualMode =
  | 'tok-char'
  | 'tok-edge'
  | 'tok-padded'
  | 'tok-skip'
  | 'tok-word'
  | 'tok-variable'
  | 'tok-bpe'
  | 'sim-set'
  | 'sim-tversky'
  | 'sim-vector'
  | 'sim-ukkonen'
  | 'sim-levenshtein'
  | 'ret-inverted'
  | 'ret-funnel'
  | 'ret-wand'
  | 'ret-minhash'
  | 'ret-simhash'
  | 'ret-bloom'
  | 'hyb-phonetic'
  | 'hyb-twostage'
  | 'hyb-bktree'
  | 'hyb-ngtree';

export interface NGramTraceStep {
  title: string;
  activeLine: number; // 1-indexed line in codeLines
  detail: string;
  stateNote: string;
}

export interface NGramAlgorithmEntry {
  id: string;
  name: string;
  shortName: string;
  stage: NGramStageId;
  subGroup: NGramSubGroup;
  visualMode: NGramVisualMode;
  metricKey?:
    | 'jaccard'
    | 'dice'
    | 'overlap'
    | 'braunBlanquet'
    | 'tversky'
    | 'kulczynski'
    | 'cosineTfIdf'
    | 'okapiBm25'
    | 'softTfIdf'
    | 'kondrakPositional'
    | 'ukkonenSimilarity'
    | 'ngramLevenshteinSim';
  formula: string;
  complexityReduction: string;
  summary: string;
  problemSolved: string;
  howItReducesComplexity: string;
  realLifeUseCases: string[];
  defaultA?: string;
  defaultB?: string;
  codeLines: string[];
  traceSteps: NGramTraceStep[];
}

export interface NGramStageMeta {
  id: NGramStageId;
  order: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  pipelineRole: string;
}

export const NGRAM_STAGES: NGramStageMeta[] = [
  {
    id: 'tokenization',
    order: 1,
    title: 'Stage 1: Tokenization & Slicing',
    shortTitle: '1. Tokenization (7)',
    subtitle: 'Slice raw strings into overlapping sub-units before indexing or scoring.',
    pipelineRole: 'Converts brittle whole-word tokens into typo-resilient subword units.',
  },
  {
    id: 'similarity',
    order: 2,
    title: 'Stage 2: Similarity & Distance Metrics',
    shortTitle: '2. Similarity Metrics (12)',
    subtitle: 'Score overlap across Set-Based, Vector/TF-IDF/BM25, and Order-Aware models.',
    pipelineRole: 'Quantifies closeness between query and candidate n-gram representations.',
  },
  {
    id: 'retrieval',
    order: 3,
    title: 'Stage 3: Indexing, Filtering & Retrieval',
    shortTitle: '3. Indexing & Retrieval (10)',
    subtitle: 'Eliminate 99%+ of non-matching documents before running expensive edit distance.',
    pipelineRole: 'Collapses O(N) full-table scans into sub-millisecond posting/sketch lookups.',
  },
  {
    id: 'hybrid',
    order: 4,
    title: 'Stage 4: Hybrid & Phonetic Extensions',
    shortTitle: '4. Hybrid & Phonetic (4)',
    subtitle: 'Fuse phonetic encoding, Levenshtein automata, and metric trees with n-grams.',
    pipelineRole: 'Handles sounds-alike names and guarantees exact edit-distance recall.',
  },
];

export const NGRAM_ALGORITHMS: NGramAlgorithmEntry[] = [
  ...NGRAM_STAGE_1_2,
  ...NGRAM_STAGE_3_4,
];
