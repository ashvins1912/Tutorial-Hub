import { createHash } from 'node:crypto';
import path from 'node:path';
import type { ContentAnalysis, ContentDomain, ContentKind, ContentLevel, LearningSection, CanonicalLearningDraft } from './contentAuthoring.types';

const MAX_SOURCE_CHARS = 1_000_000;
const SUPPORTED_EXTENSIONS = new Set(['.json', '.md', '.markdown', '.txt', '.yaml', '.yml', '.java', '.js', '.jsx', '.ts', '.tsx', '.py', '.sql']);

export function normalizeUpload(fileName: string, mimeType: string, content: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) throw new Error('Unsupported format. Supported formats: JSON, Markdown, TXT, YAML, JavaScript, TypeScript, Java, Python and SQL.');
  if (typeof content !== 'string' || !content.trim()) throw new Error('The uploaded file is empty.');
  if (content.length > MAX_SOURCE_CHARS) throw new Error('The extracted text exceeds the 1 MB authoring limit.');
  let normalized = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (extension === '.json') {
    const parsed = JSON.parse(normalized) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('JSON input must be an object or a supported content package.');
    normalized = JSON.stringify(parsed, null, 2);
  }
  return {
    sourceFormat: extension.slice(1),
    mimeType: mimeType || 'text/plain',
    content: normalized,
    sha256: createHash('sha256').update(normalized).digest('hex'),
  };
}

function detectDomain(text: string): ContentDomain {
  const value = text.toLowerCase();
  const scores: Array<[ContentDomain, RegExp]> = [
    ['DSA', /\b(array|linked list|binary search|dynamic programming|graph algorithm|leetcode|time complexity|big o)\b/g],
    ['MACHINE_LEARNING', /\b(machine learning|regression|classification|random forest|gradient descent|training data|overfitting|loss function)\b/g],
    ['AI', /\b(artificial intelligence|llm|large language model|transformer|embedding|rag|neural network|agentic)\b/g],
    ['DATABASE', /\b(database|sql|nosql|indexing|transaction|normalization|postgres|mongodb|query plan)\b/g],
    ['SYSTEM_DESIGN', /\b(microservice|distributed system|load balancer|scalability|architecture|event driven|sequence diagram|data flow)\b/g],
    ['SOFTWARE_ENGINEERING', /\b(java|spring boot|api|rest|oauth|docker|kubernetes|testing|design pattern)\b/g],
  ];
  const ranked = scores.map(([domain, pattern]) => ({ domain, score: (value.match(pattern) || []).length })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked[0].domain : 'GENERAL';
}

function detectKind(domain: ContentDomain, text: string): ContentKind {
  const value = text.toLowerCase();
  if (/\b(problem statement|input:|output:|constraints:|examples:)\b/.test(value)) return 'coding_problem';
  if (domain === 'DSA' && /\b(algorithm|pseudocode|complexity)\b/.test(value)) return 'algorithm';
  if (domain === 'MACHINE_LEARNING') return 'model';
  if (domain === 'AI') return /\b(architecture|pipeline|system)\b/.test(value) ? 'architecture' : 'concept';
  if (domain === 'DATABASE') return 'database_concept';
  if (domain === 'SYSTEM_DESIGN') return 'architecture';
  if (/\bcase study\b/.test(value)) return 'case_study';
  return 'tutorial';
}

function detectLevel(text: string): ContentLevel {
  const value = text.toLowerCase();
  if (/\b(expert|research-level|production internals|advanced optimization)\b/.test(value)) return 'expert';
  if (/\b(advanced|distributed|optimization|proof|concurrency)\b/.test(value)) return 'advanced';
  if (/\b(intermediate|implementation|trade-off|complexity)\b/.test(value)) return 'intermediate';
  if (/\b(beginner|introduction|fundamentals|getting started)\b/.test(value)) return 'beginner';
  return 'undetermined';
}

function makeOutline(domain: ContentDomain, kind: ContentKind): LearningSection[] {
  const common: LearningSection[] = [
    { id: 'overview', title: 'Concept and Learning Objectives', purpose: 'Explain what the learner will understand and why it matters.', required: true, blockType: 'explanation' },
    { id: 'intuition', title: 'Intuition and Mental Model', purpose: 'Build an intuitive model before formal details.', required: true, blockType: 'reasoning' },
    { id: 'deep-dive', title: 'Detailed Explanation', purpose: 'Explain terminology, components, mechanics and important details.', required: true, blockType: 'explanation' },
  ];
  const domainSections: Record<ContentDomain, LearningSection[]> = {
    DSA: [
      { id: 'approaches', title: 'Brute Force to Optimal Reasoning', purpose: 'Compare approaches and derive the efficient solution.', required: true, blockType: 'reasoning' },
      { id: 'trace', title: 'Step-by-Step Trace and Animation', purpose: 'Show state transitions, invariants and execution.', required: true, blockType: 'visualization' },
      { id: 'implementation', title: 'Implementation and Complexity', purpose: 'Provide tested implementations and complexity analysis.', required: true, blockType: 'code' },
    ],
    MACHINE_LEARNING: [
      { id: 'math', title: 'Mathematical Foundations', purpose: 'Explain assumptions, equations and intuition.', required: true, blockType: 'reasoning' },
      { id: 'pipeline', title: 'Dataset, Training and Evaluation Pipeline', purpose: 'Describe features, training, validation and metrics.', required: true, blockType: 'visualization' },
      { id: 'experiment', title: 'Hands-on Experiment', purpose: 'Provide a reproducible experiment and interpretation.', required: true, blockType: 'exercise' },
    ],
    AI: [
      { id: 'architecture', title: 'Model and Component Architecture', purpose: 'Explain the model, components and responsibilities.', required: true, blockType: 'visualization' },
      { id: 'dataflow', title: 'Inference and Data Flow', purpose: 'Trace data through the system.', required: true, blockType: 'visualization' },
      { id: 'implementation', title: 'Implementation and Evaluation', purpose: 'Show a safe implementation and evaluation approach.', required: true, blockType: 'code' },
    ],
    DATABASE: [
      { id: 'schema', title: 'Data Model and Relationships', purpose: 'Explain entities, schema and relationships.', required: true, blockType: 'visualization' },
      { id: 'execution', title: 'Query / Transaction Execution', purpose: 'Explain execution plans, indexes or transaction states.', required: true, blockType: 'visualization' },
      { id: 'lab', title: 'SQL / Database Lab', purpose: 'Provide executable queries and practical exercises.', required: true, blockType: 'exercise' },
    ],
    SYSTEM_DESIGN: [
      { id: 'requirements', title: 'Requirements and Constraints', purpose: 'Define functional and non-functional requirements.', required: true, blockType: 'reasoning' },
      { id: 'architecture', title: 'Component Architecture and DFD', purpose: 'Show services, dependencies and data movement.', required: true, blockType: 'visualization' },
      { id: 'tradeoffs', title: 'Scaling, Failure Modes and Trade-offs', purpose: 'Evaluate capacity, resilience and design choices.', required: true, blockType: 'reasoning' },
    ],
    SOFTWARE_ENGINEERING: [
      { id: 'design', title: 'Design and Component Responsibilities', purpose: 'Explain the implementation structure and boundaries.', required: true, blockType: 'visualization' },
      { id: 'implementation', title: 'Implementation Walkthrough', purpose: 'Provide code and explain key decisions.', required: true, blockType: 'code' },
      { id: 'testing', title: 'Testing and Operational Concerns', purpose: 'Cover tests, security and runtime behavior.', required: true, blockType: 'exercise' },
    ],
    GENERAL: [
      { id: 'examples', title: 'Worked Examples and Applications', purpose: 'Connect the concept to concrete examples.', required: true, blockType: 'explanation' },
      { id: 'visual', title: 'Suitable Visualization', purpose: 'Select diagrams or other visual aids where useful.', required: false, blockType: 'visualization' },
      { id: 'practice', title: 'Practice and Reflection', purpose: 'Check understanding with applied questions.', required: true, blockType: 'exercise' },
    ],
  };
  return [...common, ...domainSections[domain],
    { id: 'quiz', title: 'Knowledge Check and Quiz', purpose: 'Test key concepts and misconceptions.', required: true, blockType: 'quiz' },
    { id: 'assessment', title: 'Practice and Mastery Assessment', purpose: 'Measure independent application.', required: true, blockType: 'assessment' },
    { id: 'references', title: 'Sources and Further Reading', purpose: 'Preserve traceable source references.', required: true, blockType: 'reference' },
  ];
}

export function analyzeContent(fileName: string, sourceFormat: string, text: string): { analysis: ContentAnalysis; draft: CanonicalLearningDraft } {
  let parsed: Record<string, unknown> | null = null;
  if (sourceFormat === 'json') parsed = JSON.parse(text) as Record<string, unknown>;
  const content = parsed && typeof parsed.content === 'object' && parsed.content !== null
    ? parsed.content as Record<string, unknown>
    : parsed;
  const body = typeof content?.description === 'string' ? `${String(content.title || '')}\n${content.description}\n${text}` : text;
  const domain = (typeof content?.domain === 'string' && ['DSA','MACHINE_LEARNING','AI','DATABASE','SYSTEM_DESIGN','SOFTWARE_ENGINEERING','GENERAL'].includes(content.domain)
    ? content.domain : detectDomain(body)) as ContentDomain;
  const kind = (typeof content?.type === 'string' && ['algorithm','coding_problem','concept','model','architecture','database_concept','case_study','tutorial','question_bank','custom'].includes(content.type)
    ? content.type : detectKind(domain, body)) as ContentKind;
  const level = (typeof content?.level === 'string' && ['beginner','intermediate','advanced','expert'].includes(content.level)
    ? content.level : detectLevel(body)) as ContentLevel;
  const headings = [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => match[1].trim()).slice(0, 80);
  const codeBlocks = [...text.matchAll(/```[\s\S]*?```/g)].length;
  const tables = text.split('\n').filter((line) => /^\s*\|.*\|\s*$/.test(line)).length;
  const title = String(content?.title || headings[0] || path.basename(fileName, path.extname(fileName)).replace(/[-_]/g, ' ')).slice(0, 180);
  const topics = Array.isArray(content?.topics) ? content.topics.filter((v): v is string => typeof v === 'string').slice(0, 30) : headings.slice(1, 21);
  const prerequisites = Array.isArray(content?.prerequisites) ? content.prerequisites.filter((v): v is string => typeof v === 'string').slice(0, 30) : [];
  const concepts = Array.isArray(content?.concepts) ? content.concepts.filter((v): v is string => typeof v === 'string').slice(0, 50) : [];
  const visualizations = domain === 'DSA' ? ['flowchart','algorithm-animation','data-structure-trace']
    : domain === 'DATABASE' ? ['er-diagram','query-plan','transaction-timeline','data-flow']
    : domain === 'MACHINE_LEARNING' ? ['model-architecture','training-pipeline','metric-chart']
    : domain === 'AI' ? ['component-architecture','sequence-diagram','inference-data-flow']
    : domain === 'SYSTEM_DESIGN' ? ['component-diagram','sequence-diagram','dfd']
    : ['flowchart','concept-map'];
  const warnings = level === 'undetermined' ? ['Learning level could not be confidently inferred; choose it during review.'] : [];
  if (!headings.length) warnings.push('No Markdown headings detected. The source may need sectioning before generation.');
  const analysis: ContentAnalysis = {
    domain, kind, level, confidence: parsed?.content || headings.length ? 0.82 : 0.58, title, topics, prerequisites, concepts,
    detected: { headings, codeBlocks, tables, wordCount: text.trim().split(/\s+/).filter(Boolean).length },
    recommendedVisualizations: visualizations, outline: makeOutline(domain, kind), warnings,
  };
  const objectives = Array.isArray(content?.learningObjectives) ? content.learningObjectives.filter((v): v is string => typeof v === 'string') : [];
  const draft: CanonicalLearningDraft = {
    schemaVersion: '1.0', title, domain, kind, level,
    source: { fileName, format: sourceFormat, sha256: createHash('sha256').update(text).digest('hex') },
    sourceText: text, learningObjectives: objectives, prerequisites, concepts, sections: analysis.outline, status: 'draft',
  };
  return { analysis, draft };
}
