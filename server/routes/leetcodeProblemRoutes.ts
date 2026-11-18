import express, { Request, Response } from 'express';

const router = express.Router();
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; payload: LeetCodeProblemPayload }>();

interface LeetCodeProblemPayload {
  slug: string;
  questionId: string;
  title: string;
  difficulty: string;
  contentHtml: string;
  exampleTestcases: string;
  hints: string[];
  javaSnippet: string | null;
  topics: string[];
}

const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      content
      difficulty
      exampleTestcases
      hints
      codeSnippets { lang langSlug code }
      topicTags { name slug }
    }
  }
`;

router.get('/:slug', async (req: Request, res: Response) => {
  const slug = String(req.params.slug || '').toLowerCase();
  if (!/^[a-z0-9-]{2,120}$/.test(slug)) {
    return res.status(400).json({ error: 'Invalid LeetCode problem slug' });
  }

  const cached = cache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({ problem: cached.payload, cached: true });
  }

  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/problems/${slug}/`,
        'User-Agent': 'TutorialHubDSAAcademy/1.0',
      },
      body: JSON.stringify({
        query: QUESTION_QUERY,
        variables: { titleSlug: slug },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'LeetCode problem details are temporarily unavailable' });
    }

    const result = await response.json() as {
      data?: { question?: {
        questionId?: string; title?: string; content?: string; difficulty?: string;
        exampleTestcases?: string; hints?: string[];
        codeSnippets?: { langSlug: string; code: string }[];
        topicTags?: { name: string; slug: string }[];
      } | null };
      errors?: unknown[];
    };
    const question = result.data?.question;
    if (!question?.title || !question.content) {
      return res.status(404).json({ error: 'LeetCode did not return this problem' });
    }

    const payload: LeetCodeProblemPayload = {
      slug,
      questionId: question.questionId || '',
      title: question.title,
      difficulty: question.difficulty || 'Unknown',
      contentHtml: question.content,
      exampleTestcases: question.exampleTestcases || '',
      hints: question.hints || [],
      javaSnippet: question.codeSnippets?.find((snippet) => snippet.langSlug === 'java')?.code || null,
      topics: (question.topicTags || []).map((tag) => tag.name),
    };
    cache.set(slug, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return res.json({ problem: payload, cached: false });
  } catch {
    return res.status(502).json({ error: 'Unable to load LeetCode details right now. Open the original problem page instead.' });
  }
});

export default router;
