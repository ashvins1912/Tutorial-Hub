import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../../middleware/requireAuth';
import { isMongoConnected } from '../../db/connectMongo';
import { ContentAuthoringJob } from './ContentAuthoringJob';
import { analyzeContent, normalizeUpload } from './contentAuthoring.service';
import type { LearningSection } from './contentAuthoring.types';

const router = express.Router();
const authorIds = new Set((process.env.CONTENT_AUTHOR_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean));

function requireContentAuthor(req: Request, res: Response, next: express.NextFunction) {
  if (!req.authUser) return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Sign in to access Content Studio.' });
  if (!authorIds.size) return res.status(503).json({ code: 'CONTENT_AUTHORING_NOT_CONFIGURED', message: 'Content Studio author access is not configured. Add authorized Supabase user IDs to CONTENT_AUTHOR_USER_IDS.' });
  if (!authorIds.has(req.authUser.id)) return res.status(403).json({ code: 'CONTENT_AUTHOR_REQUIRED', message: 'Your account is not authorized to create or publish learning content.' });
  return next();
}

const templates: Record<string, { fileName: string; mimeType: string; content: string }> = {
  'universal-json': { fileName: 'tutorial-hub-universal-content.json', mimeType: 'application/json', content: JSON.stringify({ schemaVersion: '1.0', content: { title: 'Your topic title', domain: 'GENERAL', type: 'tutorial', level: 'beginner', description: 'Explain the topic and its learning value.', learningObjectives: ['Understand the core concept'], prerequisites: [], topics: [], concepts: [], sourceReferences: [], examples: [], implementations: [], authorNotes: '' } }, null, 2) },
  markdown: { fileName: 'tutorial-hub-learning-topic.md', mimeType: 'text/markdown', content: '# Topic Title\n\n## Domain and Level\n- Domain: GENERAL\n- Type: tutorial\n- Level: beginner\n\n## Learning Objectives\n- Understand the core concept\n\n## Prerequisites\n- None\n\n## Core Explanation\n\n## Reasoning and Intuition\n\n## Worked Examples\n\n## Implementation / Practical Walkthrough\n\n## Visualization Requirements\n- Flowchart:\n- Diagram:\n- Animation:\n\n## Practice Questions\n\n## Quiz\n\n## Sources and References\n' },
  'dsa-problem': { fileName: 'tutorial-hub-dsa-problem.json', mimeType: 'application/json', content: JSON.stringify({ schemaVersion: '1.0', content: { title: 'Problem title', domain: 'DSA', type: 'coding_problem', level: 'intermediate', description: 'Paraphrased problem statement.', learningObjectives: [], prerequisites: [], topics: [], concepts: [], examples: [], constraints: [], implementations: { java: '', javascript: '', python: '' }, reasoning: [], visualizations: [{ type: 'flowchart', required: true }, { type: 'animation', required: true }], practice: { questions: [] }, quiz: [], sourceReferences: [] } }, null, 2) },
  'ml-ai-concept': { fileName: 'tutorial-hub-ml-ai-concept.json', mimeType: 'application/json', content: JSON.stringify({ schemaVersion: '1.0', content: { title: 'Model or AI concept', domain: 'MACHINE_LEARNING', type: 'model', level: 'intermediate', description: '', learningObjectives: [], prerequisites: [], concepts: [], mathematics: [], dataset: {}, trainingPipeline: [], evaluationMetrics: [], implementation: { language: 'python', code: '' }, visualizations: [{ type: 'model-architecture', required: true }, { type: 'training-pipeline', required: true }], quiz: [], exercises: [], sourceReferences: [] } }, null, 2) },
  'database-concept': { fileName: 'tutorial-hub-database-concept.json', mimeType: 'application/json', content: JSON.stringify({ schemaVersion: '1.0', content: { title: 'Database concept', domain: 'DATABASE', type: 'database_concept', level: 'intermediate', description: '', learningObjectives: [], prerequisites: [], entities: [], relationships: [], sqlExamples: [], queryPlans: [], transactionScenarios: [], visualizations: [{ type: 'er-diagram', required: true }, { type: 'transaction-timeline', required: false }], quiz: [], exercises: [], sourceReferences: [] } }, null, 2) },
  'system-design': { fileName: 'tutorial-hub-system-design.json', mimeType: 'application/json', content: JSON.stringify({ schemaVersion: '1.0', content: { title: 'System design case study', domain: 'SYSTEM_DESIGN', type: 'architecture', level: 'advanced', requirements: { functional: [], nonFunctional: [] }, constraints: [], components: [], apis: [], dataStores: [], flows: [], failureModes: [], tradeoffs: [], visualizations: [{ type: 'component-diagram', required: true }, { type: 'sequence-diagram', required: true }, { type: 'dfd', required: true }], exercises: [], sourceReferences: [] } }, null, 2) },
};

router.get('/templates', requireAuth, requireContentAuthor, (_req, res) => {
  res.json({ templates: Object.entries(templates).map(([id, item]) => ({ id, fileName: item.fileName, mimeType: item.mimeType })) });
});
router.get('/templates/:id/download', requireAuth, requireContentAuthor, (req, res) => {
  const item = templates[req.params.id];
  if (!item) return res.status(404).json({ error: 'Template not found.' });
  res.setHeader('Content-Type', item.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${item.fileName}"`);
  return res.send(item.content);
});

router.post('/upload', requireAuth, requireContentAuthor, async (req: Request, res: Response) => {
  if (!isMongoConnected()) return res.status(503).json({ code: 'DATABASE_UNAVAILABLE', message: 'MongoDB is required to save authoring jobs.' });
  const fileName = typeof req.body?.fileName === 'string' ? req.body.fileName.slice(0, 180) : '';
  const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType.slice(0, 120) : 'text/plain';
  const content = typeof req.body?.content === 'string' ? req.body.content : '';
  if (!fileName || !content) return res.status(400).json({ error: 'fileName and extracted text content are required.' });
  try {
    const normalized = normalizeUpload(fileName, mimeType, content);
    const { analysis, draft } = analyzeContent(fileName, normalized.sourceFormat, normalized.content);
    const job = await ContentAuthoringJob.create({
      ownerId: req.authUser!.id, fileName, mimeType: normalized.mimeType, sourceFormat: normalized.sourceFormat,
      sourceText: normalized.content, sha256: normalized.sha256, status: 'review_required', analysis, draft,
    });
    return res.status(201).json({ job: { id: job.id, fileName, status: job.status, analysis, draft: { ...draft, sourceText: undefined } } });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to process uploaded content.' });
  }
});

router.get('/jobs', requireAuth, requireContentAuthor, async (req: Request, res: Response) => {
  if (!isMongoConnected()) return res.status(503).json({ error: 'MongoDB is unavailable.' });
  const jobs = await ContentAuthoringJob.find({ ownerId: req.authUser!.id }).select('-sourceText -draft.sourceText').sort({ createdAt: -1 }).limit(50).lean();
  return res.json({ jobs });
});

router.get('/jobs/:id', requireAuth, requireContentAuthor, async (req: Request, res: Response) => {
  if (!isMongoConnected()) return res.status(503).json({ error: 'MongoDB is unavailable.' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Authoring job not found.' });
  const job = await ContentAuthoringJob.findOne({ _id: req.params.id, ownerId: req.authUser!.id }).select('-sourceText -draft.sourceText').lean();
  if (!job) return res.status(404).json({ error: 'Authoring job not found.' });
  return res.json({ job });
});

router.put('/jobs/:id/structure', requireAuth, requireContentAuthor, async (req: Request, res: Response) => {
  if (!isMongoConnected()) return res.status(503).json({ error: 'MongoDB is unavailable.' });
  const sections = req.body?.sections;
  const metadata = req.body?.metadata ?? {};
  const domains = ['DSA','MACHINE_LEARNING','AI','DATABASE','SYSTEM_DESIGN','SOFTWARE_ENGINEERING','GENERAL'];
  const kinds = ['algorithm','coding_problem','concept','model','architecture','database_concept','case_study','tutorial','question_bank','custom'];
  const levels = ['beginner','intermediate','advanced','expert','undetermined'];
  const hasSections = Array.isArray(sections);
  const hasMetadata = metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0;
  if (!hasSections && !hasMetadata) return res.status(400).json({ error: 'Provide a learning section array or author metadata overrides.' });
  if (hasSections && (sections.length > 80 || sections.some((section: LearningSection) =>
    !section || typeof section.id !== 'string' || typeof section.title !== 'string' || typeof section.purpose !== 'string' ||
    typeof section.required !== 'boolean' || !['explanation','reasoning','visualization','code','quiz','exercise','assessment','reference'].includes(section.blockType)
  ))) return res.status(400).json({ error: 'sections must be a valid learning section array (maximum 80).' });
  if (metadata.domain !== undefined && !domains.includes(metadata.domain)) return res.status(400).json({ error: 'Unsupported content domain.' });
  if (metadata.kind !== undefined && !kinds.includes(metadata.kind)) return res.status(400).json({ error: 'Unsupported content type.' });
  if (metadata.level !== undefined && !levels.includes(metadata.level)) return res.status(400).json({ error: 'Unsupported learning level.' });
  if (metadata.title !== undefined && (typeof metadata.title !== 'string' || !metadata.title.trim() || metadata.title.length > 180)) return res.status(400).json({ error: 'Title must contain 1–180 characters.' });
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Authoring draft not found.' });
  const job = await ContentAuthoringJob.findOne({ _id: req.params.id, ownerId: req.authUser!.id });
  if (!job?.draft || !job.analysis) return res.status(404).json({ error: 'Authoring draft not found.' });
  if (hasSections) {
    job.analysis.outline = sections;
    job.draft.sections = sections;
  }
  for (const key of ['domain','kind','level','title'] as const) {
    if (metadata[key] !== undefined) {
      (job.analysis as any)[key] = metadata[key];
      (job.draft as any)[key] = metadata[key];
    }
  }
  job.markModified('analysis');
  job.markModified('draft');
  await job.save();
  return res.json({ job: { id: job.id, status: job.status, analysis: job.analysis, draft: { ...job.draft, sourceText: undefined } } });
});

export default router;
