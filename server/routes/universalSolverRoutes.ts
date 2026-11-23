import crypto from 'crypto';
import { Router, type Request } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { GoogleGenAI, Type } from '@google/genai';
import { isMongoConnected } from '../db/connectMongo';
import {
  SolverSharedProblem,
  type SolverSourcePlatform,
} from '../models/SolverSharedProblem';

const router = Router();

export interface FetchedExternalProblem {
  sourcePlatform: 'LeetCode' | 'GeeksforGeeks';
  sourceUrl: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  examples: string[];
  constraints: string[];
  topics: string[];
  hints: string[];
  companies: string[];
  starterCode?: {
    python?: string;
    typescript?: string;
    java?: string;
  };
  fetchedAt: string;
}

interface CacheEntry {
  fetchedAt: number;
  data: FetchedExternalProblem;
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const urlProblemCache = new Map<string, CacheEntry>();

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql/';
const LEETCODE_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionFrontendId
      title
      titleSlug
      difficulty
      content
      hints
      topicTags {
        name
      }
      codeSnippets {
        langSlug
        code
      }
    }
  }
`;

export function parseProblemUrl(
  rawUrl: string,
  hintPlatform?: 'LeetCode' | 'GeeksforGeeks'
):
  | { platform: 'LeetCode' | 'GeeksforGeeks'; slug: string; canonicalUrl: string }
  | { error: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { error: 'Please paste a LeetCode or GeeksforGeeks problem URL or slug.' };
  }

  // Allow bare slug when user selects a platform explicitly (e.g. "koko-eating-bananas")
  if (!trimmed.includes('/') && !trimmed.includes('.') && hintPlatform) {
    const cleanSlug = trimmed.toLowerCase();
    if (hintPlatform === 'LeetCode' && /^[a-z0-9-]+$/i.test(cleanSlug)) {
      return {
        platform: 'LeetCode',
        slug: cleanSlug,
        canonicalUrl: `https://leetcode.com/problems/${cleanSlug}/`,
      };
    }
    if (hintPlatform === 'GeeksforGeeks' && /^[a-z0-9-_]+$/i.test(cleanSlug)) {
      return {
        platform: 'GeeksforGeeks',
        slug: cleanSlug,
        canonicalUrl: `https://www.geeksforgeeks.org/problems/${cleanSlug}/1`,
      };
    }
  }

  let parsed: URL;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return { error: 'Invalid URL format. Example: https://leetcode.com/problems/two-sum/ or https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1' };
  }

  // Strictly enforce HTTPS, no embedded credentials, and no non-standard ports
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { error: 'Only standard web URLs on leetcode.com and geeksforgeeks.org are allowed.' };
  }
  if (parsed.username || parsed.password || (parsed.port && parsed.port !== '443' && parsed.port !== '80')) {
    return { error: 'URLs with custom ports or embedded credentials are not allowed.' };
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const pathParts = parsed.pathname.split('/').filter(Boolean);

  // LeetCode: leetcode.com/problems/<slug>/...
  if (host === 'leetcode.com' || host === 'leetcode.cn') {
    const problemsIdx = pathParts.findIndex((p) => p.toLowerCase() === 'problems');
    const slug = problemsIdx >= 0 ? pathParts[problemsIdx + 1] : undefined;
    if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
      return {
        error: 'Could not extract LeetCode problem slug. Expected format: https://leetcode.com/problems/<problem-slug>/',
      };
    }
    const cleanSlug = slug.toLowerCase();
    return {
      platform: 'LeetCode',
      slug: cleanSlug,
      canonicalUrl: `https://leetcode.com/problems/${cleanSlug}/`,
    };
  }

  // GeeksforGeeks: geeksforgeeks.org/problems/<slug>/... or practice.geeksforgeeks.org/problems/<slug>/...
  if (host === 'geeksforgeeks.org' || host === 'practice.geeksforgeeks.org') {
    const problemsIdx = pathParts.findIndex((p) => p.toLowerCase() === 'problems');
    const slug = problemsIdx >= 0 ? pathParts[problemsIdx + 1] : undefined;
    if (!slug || !/^[a-z0-9-_]+$/i.test(slug)) {
      return {
        error: 'Could not extract GeeksforGeeks problem slug. Expected format: https://www.geeksforgeeks.org/problems/<problem-slug>/1',
      };
    }
    const cleanSlug = slug.toLowerCase();
    return {
      platform: 'GeeksforGeeks',
      slug: cleanSlug,
      canonicalUrl: `https://www.geeksforgeeks.org/problems/${cleanSlug}/1`,
    };
  }

  return {
    error: 'Unsupported domain. Currently supported platforms: leetcode.com and geeksforgeeks.org.',
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&le;/gi, '<=')
    .replace(/&ge;/gi, '>=')
    .replace(/&minus;/gi, '-')
    .replace(/&times;/gi, 'x')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stripHtmlToReadableText(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<sup>(.*?)<\/sup>/gi, '^$1')
      .replace(/<sub>(.*?)<\/sub>/gi, '_$1')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|pre|h[1-6]|tr)>/gi, '\n')
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractExamplesAndConstraints(plainText: string): {
  statement: string;
  examples: string[];
  constraints: string[];
} {
  const lines = plainText.split('\n').map((l) => l.trim()).filter(Boolean);
  const examples: string[] = [];
  const constraints: string[] = [];
  const statementLines: string[] = [];

  let mode: 'statement' | 'examples' | 'constraints' = 'statement';
  let currentExample: string[] = [];

  for (const line of lines) {
    if (/^(constraints|expected time complexity|expected auxiliary space)/i.test(line)) {
      if (currentExample.length > 0) {
        examples.push(currentExample.join('\n'));
        currentExample = [];
      }
      mode = 'constraints';
      if (/^expected (time|auxiliary)/i.test(line)) {
        constraints.push(line);
      }
      continue;
    }

    if (/^example\s*\d*\s*:?/i.test(line) || /^examples?\s*:?$/i.test(line)) {
      if (currentExample.length > 0) {
        examples.push(currentExample.join('\n'));
        currentExample = [];
      }
      mode = 'examples';
      if (!/^examples?\s*:?$/i.test(line)) {
        currentExample.push(line);
      }
      continue;
    }

    if (mode === 'statement') {
      statementLines.push(line);
    } else if (mode === 'examples') {
      if (/^input\s*:/i.test(line) && currentExample.length > 1) {
        examples.push(currentExample.join('\n'));
        currentExample = [line];
      } else {
        currentExample.push(line);
      }
    } else {
      constraints.push(line.replace(/^[-•*]\s*/, ''));
    }
  }

  if (currentExample.length > 0) {
    examples.push(currentExample.join('\n'));
  }

  return {
    statement: statementLines.join('\n\n') || plainText.slice(0, 1400),
    examples: examples.slice(0, 4),
    constraints: constraints.slice(0, 8),
  };
}

function normalizeDifficulty(raw?: string): 'Easy' | 'Medium' | 'Hard' {
  const val = (raw ?? '').toLowerCase();
  if (val.includes('hard')) return 'Hard';
  if (val.includes('easy') || val.includes('basic') || val.includes('school')) return 'Easy';
  return 'Medium';
}

async function fetchLeetCodeBySlug(slug: string, canonicalUrl: string): Promise<FetchedExternalProblem> {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(10000),
    headers: {
      'Content-Type': 'application/json',
      Referer: canonicalUrl,
      'User-Agent': 'Mozilla/5.0 (compatible; PatternForgeDSA/1.0)',
    },
    body: JSON.stringify({
      query: LEETCODE_QUERY,
      variables: { titleSlug: slug },
    }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode returned HTTP ${response.status}.`);
  }

  const payload = (await response.json()) as {
    data?: {
      question?: {
        questionFrontendId?: string;
        title?: string;
        titleSlug?: string;
        difficulty?: string;
        content?: string | null;
        hints?: string[];
        topicTags?: Array<{ name: string }>;
        codeSnippets?: Array<{ langSlug: string; code: string }>;
      } | null;
    };
  };

  const q = payload.data?.question;
  if (!q || !q.title) {
    throw new Error(`LeetCode problem "${slug}" was not found.`);
  }
  if (!q.content) {
    throw new Error(
      `LeetCode problem "${q.title}" appears to be premium/locked so its statement is not publicly accessible.`
    );
  }

  const plainText = stripHtmlToReadableText(q.content);
  const { statement, examples, constraints } = extractExamplesAndConstraints(plainText);

  const starterCode: FetchedExternalProblem['starterCode'] = {};
  for (const snippet of q.codeSnippets ?? []) {
    if (snippet.langSlug === 'python3' && !starterCode.python) starterCode.python = snippet.code;
    if (snippet.langSlug === 'typescript' && !starterCode.typescript) starterCode.typescript = snippet.code;
    if (snippet.langSlug === 'java' && !starterCode.java) starterCode.java = snippet.code;
  }

  return {
    sourcePlatform: 'LeetCode',
    sourceUrl: canonicalUrl,
    slug,
    title: q.questionFrontendId ? `LC #${q.questionFrontendId}: ${q.title}` : q.title,
    difficulty: normalizeDifficulty(q.difficulty),
    statement,
    examples,
    constraints,
    topics: (q.topicTags ?? []).map((t) => t.name),
    hints: (q.hints ?? []).map((h) => stripHtmlToReadableText(h)).filter(Boolean),
    companies: [],
    starterCode,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchGeeksForGeeksBySlug(
  slug: string,
  canonicalUrl: string
): Promise<FetchedExternalProblem> {
  // Primary: official GeeksforGeeks Practice public API
  const apiEndpoints = [
    `https://practiceapi.geeksforgeeks.org/api/vr/problems/${encodeURIComponent(slug)}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/problems/${encodeURIComponent(slug)}/`,
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(endpoint, {
        signal: AbortSignal.timeout(10000),
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; PatternForgeDSA/1.0)',
        },
      });
      if (!response.ok) continue;

      const json = (await response.json()) as {
        results?: Record<string, unknown>;
        problem_name?: string;
        problem_question?: string;
        difficulty?: string;
        tags?: { topic_tags?: string[]; company_tags?: string[] };
      };

      const data = (json.results ?? json) as {
        problem_name?: string;
        problem_question?: string;
        difficulty?: string;
        tags?: { topic_tags?: string[]; company_tags?: string[] };
        topic_tags?: string[];
        company_tags?: string[];
      };

      if (data.problem_name && data.problem_question) {
        const plainText = stripHtmlToReadableText(data.problem_question);
        const { statement, examples, constraints } = extractExamplesAndConstraints(plainText);
        const topics = data.tags?.topic_tags ?? data.topic_tags ?? [];
        const companies = data.tags?.company_tags ?? data.company_tags ?? [];

        return {
          sourcePlatform: 'GeeksforGeeks',
          sourceUrl: canonicalUrl,
          slug,
          title: `GFG: ${data.problem_name}`,
          difficulty: normalizeDifficulty(data.difficulty),
          statement,
          examples,
          constraints,
          topics: Array.isArray(topics) ? topics.map(String) : [],
          hints: [],
          companies: Array.isArray(companies) ? companies.slice(0, 8).map(String) : [],
          fetchedAt: new Date().toISOString(),
        };
      }
    } catch {
      // fall through to next endpoint or HTML fallback
    }
  }

  // Fallback: fetch public problem HTML and inspect __NEXT_DATA__
  const pageRes = await fetch(canonicalUrl, {
    signal: AbortSignal.timeout(10000),
    headers: {
      Accept: 'text/html',
      'User-Agent': 'Mozilla/5.0 (compatible; PatternForgeDSA/1.0)',
    },
  });

  if (!pageRes.ok) {
    throw new Error(
      `GeeksforGeeks returned HTTP ${pageRes.status} for slug "${slug}". Verify the problem URL is public.`
    );
  }

  const html = await pageRes.text();
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch?.[1]) {
    try {
      const nextData = JSON.parse(nextDataMatch[1]) as {
        props?: {
          pageProps?: {
            initialState?: {
              problemData?: {
                allData?: {
                  problem_name?: string;
                  problem_question?: string;
                  difficulty?: string;
                  tags?: { topic_tags?: string[]; company_tags?: string[] };
                };
              };
            };
          };
        };
      };
      const allData = nextData.props?.pageProps?.initialState?.problemData?.allData;
      if (allData?.problem_name && allData?.problem_question) {
        const plainText = stripHtmlToReadableText(allData.problem_question);
        const { statement, examples, constraints } = extractExamplesAndConstraints(plainText);
        return {
          sourcePlatform: 'GeeksforGeeks',
          sourceUrl: canonicalUrl,
          slug,
          title: `GFG: ${allData.problem_name}`,
          difficulty: normalizeDifficulty(allData.difficulty),
          statement,
          examples,
          constraints,
          topics: allData.tags?.topic_tags ?? [],
          hints: [],
          companies: (allData.tags?.company_tags ?? []).slice(0, 8),
          fetchedAt: new Date().toISOString(),
        };
      }
    } catch {
      // fall through
    }
  }

  throw new Error(
    `Could not parse GeeksforGeeks problem content for "${slug}". You can still paste the problem statement directly into the Solver Studio.`
  );
}

/**
 * POST /api/solver/fetch-url
 * Body: { url: string }
 * Pulls a real LeetCode or GeeksforGeeks problem statement, examples, constraints, and topics.
 */
router.post('/fetch-url', async (req, res) => {
  const rawUrl = typeof req.body?.url === 'string' ? req.body.url.slice(0, 500) : '';
  const hintPlatform =
    req.body?.platform === 'LeetCode' || req.body?.platform === 'GeeksforGeeks'
      ? req.body.platform
      : undefined;
  const parsed = parseProblemUrl(rawUrl, hintPlatform);

  if ('error' in parsed) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const cacheKey = `${parsed.platform}:${parsed.slug}`;
  const cached = urlProblemCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    res.json({ cached: true, problem: cached.data });
    return;
  }

  try {
    const problem =
      parsed.platform === 'LeetCode'
        ? await fetchLeetCodeBySlug(parsed.slug, parsed.canonicalUrl)
        : await fetchGeeksForGeeksBySlug(parsed.slug, parsed.canonicalUrl);

    urlProblemCache.set(cacheKey, { fetchedAt: Date.now(), data: problem });
    res.json({ cached: false, problem });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch external problem.';
    res.status(502).json({ error: message });
  }
});

/**
 * POST /api/solver/ai-coach
 * Optional server-side Gemini Deep Logic Coach & Optimal Algorithm Producer.
 * Uses @google/genai with gemini-4-hydrogen strictly on the server.
 */
router.post('/ai-coach', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    res.status(503).json({
      error:
        'Deep AI Coach requires GEMINI_API_KEY on the server. The built-in Universal Logic Engine step-by-step coach remains fully available offline.',
    });
    return;
  }

  const problemTitle = typeof req.body?.problemTitle === 'string' ? req.body.problemTitle.slice(0, 200) : 'Untitled Problem';
  const problemStatement = typeof req.body?.problemStatement === 'string' ? req.body.problemStatement.slice(0, 4000) : '';
  const stepLabel = typeof req.body?.stepLabel === 'string' ? req.body.stepLabel.slice(0, 120) : 'Optimal Algorithm & Solution';
  const userFeedback = typeof req.body?.userFeedback === 'string' ? req.body.userFeedback.slice(0, 800) : '';
  const matchedAlgorithms = Array.isArray(req.body?.matchedAlgorithms)
    ? req.body.matchedAlgorithms.slice(0, 5).map(String)
    : [];
  const language =
    req.body?.language === 'java' || req.body?.language === 'typescript' ? req.body.language : 'python';

  if (!problemStatement.trim()) {
    res.status(400).json({ error: 'problemStatement is required.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = [
      'You are a Senior Staff Algorithms Tutor guiding a student step by step in simple, clear English.',
      `Problem Title: ${problemTitle}`,
      `Problem Statement:\n${problemStatement}`,
      `Current Guided Step: ${stepLabel}`,
      matchedAlgorithms.length > 0
        ? `Candidate Algorithms from Catalog: ${matchedAlgorithms.join(', ')}`
        : '',
      userFeedback ? `Student Feedback / Doubt: ${userFeedback}` : 'Student clicked: Ready for clear explanation & optimal solution.',
      `Preferred code language: ${language}`,
      'Explain clearly why the brute-force approach hits a bottleneck, how the optimal algorithm or combination of algorithms solves it, state the exact loop invariant, and provide clean, interview-ready code.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING },
            analogy: { type: Type.STRING },
            optimizedAlgorithm: { type: Type.STRING },
            timeComplexity: { type: Type.STRING },
            spaceComplexity: { type: Type.STRING },
            keyInvariant: { type: Type.STRING },
            codeSnippet: { type: Type.STRING },
            checkpointQuestion: { type: Type.STRING },
          },
          required: [
            'explanation',
            'analogy',
            'optimizedAlgorithm',
            'timeComplexity',
            'spaceComplexity',
            'keyInvariant',
            'codeSnippet',
            'checkpointQuestion',
          ],
        },
      },
    });

    const rawText = response.text?.trim() ?? '';
    if (!rawText) {
      res.status(502).json({ error: 'Gemini returned an empty response.' });
      return;
    }

    const parsed = JSON.parse(rawText);
    res.json({ model: 'gemini-4-hydrogen', coaching: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gemini coaching request failed.';
    res.status(502).json({ error: message });
  }
});

// =============================================================================
// SAVE FOR FUTURE & SHARE ON PLATFORM (PULLED PROBLEMS LIBRARY)
// =============================================================================

export interface SolverLibraryRecord {
  id: string;
  publicId: string;
  ownerUserId: string;
  authorName: string;
  visibility: 'saved' | 'shared';
  sourcePlatform: SolverSourcePlatform;
  sourceUrl: string;
  slug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  examples: string[];
  constraints: string[];
  topics: string[];
  recommendedPattern: string;
  complexitySummary: string;
  userNotes: string;
  upvotes: number;
  createdAt: string;
}

const memSavedProblems = new Map<string, SolverLibraryRecord>();
const memSharedProblems = new Map<string, SolverLibraryRecord>([
  [
    'sh-lru-cache-core',
    {
      id: 'sh-lru-cache-core',
      publicId: 'sh-lru-cache-core',
      ownerUserId: 'platform-curator',
      authorName: 'PatternForge Staff',
      visibility: 'shared',
      sourcePlatform: 'LeetCode',
      sourceUrl: 'https://leetcode.com/problems/lru-cache/',
      slug: 'lru-cache',
      title: 'LRU Cache',
      difficulty: 'Medium',
      statement:
        'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) and put(key, value) so both run in O(1) average time complexity.',
      examples: ['put(1,1), put(2,2), get(1)->1, put(3,3) evicts key 2'],
      constraints: ['1 <= capacity <= 3000', 'At most 2 * 10^5 calls to get and put'],
      topics: ['Hash Table', 'Linked List', 'Design', 'Doubly-Linked List'],
      recommendedPattern: 'Hash Map + Doubly Linked List',
      complexitySummary: 'Time O(1) · Space O(capacity)',
      userNotes: 'Pair sentinel head/tail nodes with a key->node map to avoid null pointer edge cases.',
      upvotes: 14,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    },
  ],
  [
    'sh-kadane-max-subarray',
    {
      id: 'sh-kadane-max-subarray',
      publicId: 'sh-kadane-max-subarray',
      ownerUserId: 'platform-curator',
      authorName: 'PatternForge Staff',
      visibility: 'shared',
      sourcePlatform: 'GeeksforGeeks',
      sourceUrl: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1',
      slug: 'kadanes-algorithm',
      title: "Kadane's Algorithm (Maximum Subarray Sum)",
      difficulty: 'Medium',
      statement:
        'Given an integer array arr[], find the contiguous subarray (containing at least one number) that has the maximum sum and return its sum.',
      examples: ['Input: [2, 3, -8, 7, -1, 2, 3] -> Output: 11 (subarray [7, -1, 2, 3])'],
      constraints: ['1 <= arr.length <= 10^5', '-10^7 <= arr[i] <= 10^7'],
      topics: ['Arrays', 'Dynamic Programming', 'Greedy'],
      recommendedPattern: "Kadane's Running Subarray Invariant",
      complexitySummary: 'Time O(N) · Space O(1)',
      userNotes: 'Reset running sum whenever currentSum + x < x; handles all-negative arrays safely.',
      upvotes: 11,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    },
  ],
]);

function extractAuthenticatedActor(req: Request): { userId: string; email: string; authorName: string } {
  const user = req.authUser;
  if (!user?.id) {
    throw new Error('Authenticated user context is required for solver library operations.');
  }
  const fallbackName = user.email ? user.email.split('@')[0] : 'Learner';
  const metadata = user.userMetadata ?? {};
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name : '';
  return {
    userId: user.id,
    email: user.email ?? '',
    authorName: fullName.trim().slice(0, 60) || fallbackName,
  };
}

function sanitizeLibraryPayload(
  body: Record<string, unknown>,
  actor: { userId: string; email: string; authorName: string },
  visibility: 'saved' | 'shared'
): SolverLibraryRecord {
  const title = String(body.title ?? '').trim().slice(0, 160);
  const statement = String(body.statement ?? '').trim().slice(0, 8000);
  const rawPlatform = String(body.sourcePlatform ?? 'Custom');
  const sourcePlatform: SolverSourcePlatform =
    rawPlatform === 'LeetCode' || rawPlatform === 'GeeksforGeeks' ? rawPlatform : 'Custom';
  const rawDiff = String(body.difficulty ?? 'Medium');
  const difficulty: 'Easy' | 'Medium' | 'Hard' =
    rawDiff === 'Easy' || rawDiff === 'Hard' ? rawDiff : 'Medium';
  const slug =
    String(body.slug ?? '')
      .trim()
      .slice(0, 120) ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') ||
    'custom-problem';
  const prefix = visibility === 'shared' ? 'sh' : 'sv';
  const publicId = `${prefix}-${slug.slice(0, 28)}-${crypto.randomBytes(3).toString('hex')}`;
  const authorName =
    typeof body.authorName === 'string' && body.authorName.trim()
      ? body.authorName.trim().slice(0, 60)
      : actor.authorName;

  return {
    id: publicId,
    publicId,
    ownerUserId: actor.userId,
    authorName,
    visibility,
    sourcePlatform,
    sourceUrl: String(body.sourceUrl ?? '').trim().slice(0, 400),
    slug,
    title,
    difficulty,
    statement,
    examples: Array.isArray(body.examples)
      ? body.examples.map((x) => String(x).slice(0, 400)).slice(0, 6)
      : [],
    constraints: Array.isArray(body.constraints)
      ? body.constraints.map((x) => String(x).slice(0, 250)).slice(0, 10)
      : [],
    topics: Array.isArray(body.topics)
      ? body.topics.map((x) => String(x).slice(0, 60)).slice(0, 10)
      : [],
    recommendedPattern: String(body.recommendedPattern ?? '').trim().slice(0, 140),
    complexitySummary: String(body.complexitySummary ?? '').trim().slice(0, 120),
    userNotes: String(body.userNotes ?? '').trim().slice(0, 800),
    upvotes: 0,
    createdAt: new Date().toISOString(),
  };
}

function serializeDoc(doc: Record<string, unknown>): SolverLibraryRecord {
  const publicId = String(doc.publicId ?? doc._id ?? '');
  return {
    id: publicId,
    publicId,
    ownerUserId: String(doc.ownerUserId ?? ''),
    authorName: String(doc.authorName ?? 'Learner'),
    visibility: doc.visibility === 'shared' ? 'shared' : 'saved',
    sourcePlatform:
      doc.sourcePlatform === 'LeetCode' || doc.sourcePlatform === 'GeeksforGeeks'
        ? doc.sourcePlatform
        : 'Custom',
    sourceUrl: String(doc.sourceUrl ?? ''),
    slug: String(doc.slug ?? ''),
    title: String(doc.title ?? ''),
    difficulty:
      doc.difficulty === 'Easy' || doc.difficulty === 'Hard' ? doc.difficulty : 'Medium',
    statement: String(doc.statement ?? ''),
    examples: Array.isArray(doc.examples) ? doc.examples.map(String) : [],
    constraints: Array.isArray(doc.constraints) ? doc.constraints.map(String) : [],
    topics: Array.isArray(doc.topics) ? doc.topics.map(String) : [],
    recommendedPattern: String(doc.recommendedPattern ?? ''),
    complexitySummary: String(doc.complexitySummary ?? ''),
    userNotes: String(doc.userNotes ?? ''),
    upvotes: Number(doc.upvotes ?? 0),
    createdAt: doc.createdAt ? new Date(String(doc.createdAt)).toISOString() : new Date().toISOString(),
  };
}

router.get('/saved-problems', requireAuth, async (req, res) => {
  const actor = extractAuthenticatedActor(req);
  try {
    if (isMongoConnected()) {
      const docs = await SolverSharedProblem.find({
        ownerUserId: actor.userId,
        visibility: 'saved',
      })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
      res.json({
        problems: docs.map((d) => serializeDoc(d as unknown as Record<string, unknown>)),
      });
      return;
    }
    const items = Array.from(memSavedProblems.values())
      .filter((p) => p.ownerUserId === actor.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json({ problems: items });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load saved problems.',
    });
  }
});

router.post('/saved-problems', requireAuth, async (req, res) => {
  const actor = extractAuthenticatedActor(req);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const title = String(body.title ?? '').trim();
  const statement = String(body.statement ?? '').trim();
  if (!title || !statement) {
    res.status(400).json({ error: 'title and statement are required to save a problem.' });
    return;
  }

  const record = sanitizeLibraryPayload(body, actor, 'saved');
  try {
    if (isMongoConnected()) {
      const created = await SolverSharedProblem.create({
        ...record,
        ownerEmail: actor.email,
      });
      res.status(201).json({
        problem: serializeDoc(created.toObject() as unknown as Record<string, unknown>),
      });
      return;
    }
    memSavedProblems.set(record.publicId, record);
    res.status(201).json({ problem: record });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to save problem.',
    });
  }
});

router.delete('/saved-problems/:id', requireAuth, async (req, res) => {
  const actor = extractAuthenticatedActor(req);
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      await SolverSharedProblem.deleteOne({
        publicId: id,
        ownerUserId: actor.userId,
        visibility: 'saved',
      });
      res.json({ ok: true, id });
      return;
    }
    const existing = memSavedProblems.get(id);
    if (existing && existing.ownerUserId === actor.userId) {
      memSavedProblems.delete(id);
    }
    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to delete saved problem.',
    });
  }
});

router.get('/shared-problems', async (_req, res) => {
  try {
    if (isMongoConnected()) {
      const docs = await SolverSharedProblem.find({ visibility: 'shared' })
        .sort({ upvotes: -1, createdAt: -1 })
        .limit(100)
        .lean();
      const dbList = docs.map((d) => serializeDoc(d as unknown as Record<string, unknown>));
      res.json({ problems: dbList });
      return;
    }
    const list = Array.from(memSharedProblems.values()).sort(
      (a, b) => b.upvotes - a.upvotes || b.createdAt.localeCompare(a.createdAt)
    );
    res.json({ problems: list });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load shared problems.',
    });
  }
});

router.get('/shared-problems/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const doc = await SolverSharedProblem.findOne({ publicId: id }).lean();
      if (!doc) {
        res.status(404).json({ error: 'Shared problem not found.' });
        return;
      }
      res.json({ problem: serializeDoc(doc as unknown as Record<string, unknown>) });
      return;
    }
    const found = memSharedProblems.get(id) ?? memSavedProblems.get(id);
    if (!found) {
      res.status(404).json({ error: 'Shared problem not found.' });
      return;
    }
    res.json({ problem: found });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to load shared problem.',
    });
  }
});

router.post('/shared-problems', requireAuth, async (req, res) => {
  const actor = extractAuthenticatedActor(req);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const title = String(body.title ?? '').trim();
  const statement = String(body.statement ?? '').trim();
  if (!title || !statement) {
    res.status(400).json({ error: 'title and statement are required to share a problem.' });
    return;
  }

  const record = sanitizeLibraryPayload(body, actor, 'shared');
  try {
    if (isMongoConnected()) {
      const created = await SolverSharedProblem.create({
        ...record,
        ownerEmail: actor.email,
      });
      res.status(201).json({
        problem: serializeDoc(created.toObject() as unknown as Record<string, unknown>),
      });
      return;
    }
    memSharedProblems.set(record.publicId, record);
    res.status(201).json({ problem: record });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to publish shared problem.',
    });
  }
});

router.post('/shared-problems/:id/upvote', requireAuth, async (req, res) => {
  const userId = req.authUser!.id;
  const { id } = req.params;
  try {
    if (isMongoConnected()) {
      const updated = await SolverSharedProblem.findOneAndUpdate(
        { publicId: id, visibility: 'shared', upvotedBy: { $ne: userId } },
        { $inc: { upvotes: 1 }, $addToSet: { upvotedBy: userId } },
        { new: true }
      ).lean();
      if (!updated) {
        const existing = await SolverSharedProblem.findOne({ publicId: id, visibility: 'shared' }).lean();
        if (!existing) {
          res.status(404).json({ error: 'Shared problem not found.' });
          return;
        }
        res.json({ problem: serializeDoc(existing as unknown as Record<string, unknown>), alreadyUpvoted: true });
        return;
      }
      res.json({ problem: serializeDoc(updated as unknown as Record<string, unknown>) });
      return;
    }
    const existing = memSharedProblems.get(id);
    if (!existing) {
      res.status(404).json({ error: 'Shared problem not found.' });
      return;
    }
    const alreadyUpvoted = Array.isArray((existing as any).upvotedBy) && (existing as any).upvotedBy.includes(userId);
    if (alreadyUpvoted) {
      res.json({ problem: existing, alreadyUpvoted: true });
      return;
    }
    const next = { ...existing, upvotes: existing.upvotes + 1, upvotedBy: [...(((existing as any).upvotedBy ?? []) as string[]), userId] };
    memSharedProblems.set(id, next);
    res.json({ problem: next });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to upvote shared problem.',
    });
  }
});

export default router;
