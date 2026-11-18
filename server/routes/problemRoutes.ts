import express, { Request, Response } from 'express';
import { BIG_TECH_36_PROBLEMS, BIG_TECH_TOPICS } from '../seed/bigTechTopicSeed';
import { BigTechCompany } from '../../src/types/dsa';

const router = express.Router();

// GET /api/problems/topics/summary
router.get('/topics/summary', (_req: Request, res: Response) => {
  res.json({ topics: BIG_TECH_TOPICS, totalProblems: BIG_TECH_36_PROBLEMS.length });
});

// GET /api/problems?topic=...&company=...&difficulty=...&q=...
router.get('/', (req: Request, res: Response) => {
  const { topic, company, difficulty, q } = req.query as Record<string, string | undefined>;

  let results = [...BIG_TECH_36_PROBLEMS];

  if (topic && topic !== 'All') {
    results = results.filter((p) => p.topicCategory.toLowerCase() === topic.toLowerCase());
  }

  if (difficulty && difficulty !== 'All') {
    results = results.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (company && company !== 'All') {
    const comp = company as BigTechCompany;
    results = results
      .filter((p) => p.bigTechFrequency.some((f) => f.company === comp))
      .sort((a, b) => {
        const fa = a.bigTechFrequency.find((f) => f.company === comp)?.frequencyScore ?? 0;
        const fb = b.bigTechFrequency.find((f) => f.company === comp)?.frequencyScore ?? 0;
        return fb - fa;
      });
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.primaryPattern.toLowerCase().includes(query) ||
        p.topicCategory.toLowerCase().includes(query) ||
        p.howToIdentify.keywordTriggers.some((k) => k.toLowerCase().includes(query))
    );
  }

  res.json({ count: results.length, problems: results });
});

// GET /api/problems/:slug
router.get('/:slug', (req: Request, res: Response) => {
  const problem = BIG_TECH_36_PROBLEMS.find((p) => p.slug === req.params.slug);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  return res.json({ problem });
});

export default router;
