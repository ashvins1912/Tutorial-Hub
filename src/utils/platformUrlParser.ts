export interface ParsedPlatformUrl {
  valid: boolean;
  normalizedUrl: string;
  platform: string;
  hostname: string;
  suggestedTitle: string;
  leetcodeSlug: string | null;
}

const KNOWN_PLATFORMS: { match: (host: string) => boolean; name: string }[] = [
  { match: (h) => h === 'leetcode.com' || h.endsWith('.leetcode.com') || h === 'leetcode.cn', name: 'LeetCode' },
  { match: (h) => h === 'geeksforgeeks.org' || h.endsWith('.geeksforgeeks.org'), name: 'GeeksforGeeks' },
  { match: (h) => h === 'codeforces.com' || h.endsWith('.codeforces.com'), name: 'Codeforces' },
  { match: (h) => h === 'hackerrank.com' || h.endsWith('.hackerrank.com'), name: 'HackerRank' },
  { match: (h) => h === 'codechef.com' || h.endsWith('.codechef.com'), name: 'CodeChef' },
  { match: (h) => h === 'atcoder.jp' || h.endsWith('.atcoder.jp'), name: 'AtCoder' },
  { match: (h) => h === 'neetcode.io' || h.endsWith('.neetcode.io'), name: 'NeetCode' },
  { match: (h) => h === 'interviewbit.com' || h.endsWith('.interviewbit.com'), name: 'InterviewBit' },
  { match: (h) => h === 'cses.fi' || h.endsWith('.cses.fi'), name: 'CSES' },
  { match: (h) => h === 'spoj.com' || h.endsWith('.spoj.com'), name: 'SPOJ' },
  { match: (h) => h === 'lintcode.com' || h.endsWith('.lintcode.com'), name: 'LintCode' },
  { match: (h) => h === 'codingninjas.com' || h.endsWith('.codingninjas.com') || h === 'naukri.com' || h.endsWith('.naukri.com'), name: 'Coding Ninjas' },
  { match: (h) => h === 'github.com' || h.endsWith('.github.com'), name: 'GitHub' },
  { match: (h) => h === 'medium.com' || h.endsWith('.medium.com'), name: 'Medium' },
  { match: (h) => h === 'substack.com' || h.endsWith('.substack.com'), name: 'Substack' },
  { match: (h) => h === 'youtube.com' || h.endsWith('.youtube.com') || h === 'youtu.be', name: 'YouTube' },
  { match: (h) => h === 'arxiv.org' || h.endsWith('.arxiv.org'), name: 'arXiv' },
  { match: (h) => h === 'algoexpert.io' || h.endsWith('.algoexpert.io'), name: 'AlgoExpert' },
];

const UPPERCASE_WORDS = new Set(['dp', 'bfs', 'dfs', 'bst', 'lru', 'lfu', 'sql', 'api', 'kmp', 'dag', 'mst', 'lca', 'lis', 'lcs', 'gcd', 'lcm', 'xor', 'ii', 'iii', 'iv']);

function slugToTitle(rawSlug: string): string {
  const cleaned = decodeURIComponent(rawSlug)
    .replace(/\.(html?|php|aspx?)$/i, '')
    // Strip GeeksforGeeks trailing numeric IDs (e.g. kadanes-algorithm-1587115620)
    .replace(/-\d{6,}$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (UPPERCASE_WORDS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function detectPlatformName(hostname: string): string {
  const cleanHost = hostname.toLowerCase().replace(/^www\./, '');
  const matched = KNOWN_PLATFORMS.find((entry) => entry.match(cleanHost));
  if (matched) return matched.name;
  // Turn "practice.something.io" -> "something.io"
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return cleanHost || 'Web Link';
}

/**
 * Normalizes and parses any coding or technical platform URL (LeetCode, GeeksforGeeks,
 * Codeforces, HackerRank, blogs, docs, etc.) into a safe https/http URL, platform label,
 * suggested human-readable title, and optional LeetCode problem slug.
 */
export function parsePlatformUrl(rawInput: string): ParsedPlatformUrl | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i.test(trimmed)
      ? `https://${trimmed}`
      : trimmed;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }
  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
  const platform = detectPlatformName(hostname);
  const segments = parsed.pathname.split('/').filter(Boolean);

  let leetcodeSlug: string | null = null;
  let suggestedTitle = '';

  if (platform === 'LeetCode') {
    const idx = segments.findIndex((s) => s.toLowerCase() === 'problems');
    if (idx >= 0 && segments[idx + 1]) {
      leetcodeSlug = segments[idx + 1].toLowerCase();
      suggestedTitle = slugToTitle(leetcodeSlug);
    }
  } else if (platform === 'GeeksforGeeks') {
    const idx = segments.findIndex((s) => s.toLowerCase() === 'problems');
    if (idx >= 0 && segments[idx + 1]) {
      suggestedTitle = slugToTitle(segments[idx + 1]);
    } else if (segments.length > 0) {
      const meaningful = segments.filter((s) => !/^\d+$/.test(s) && s.toLowerCase() !== 'dsa');
      const target = meaningful[meaningful.length - 1] ?? segments[segments.length - 1];
      suggestedTitle = slugToTitle(target);
    }
  } else if (platform === 'Codeforces') {
    const psIdx = segments.findIndex((s) => s.toLowerCase() === 'problem');
    if (psIdx >= 0 && segments[psIdx + 1] && segments[psIdx + 2]) {
      suggestedTitle = `Codeforces ${segments[psIdx + 1]}${segments[psIdx + 2]}`;
    } else if (segments.includes('contest') && segments.length >= 4) {
      suggestedTitle = `Codeforces Contest ${segments[1]} Problem ${segments[3]}`;
    }
  } else if (platform === 'HackerRank') {
    const idx = segments.findIndex((s) => s.toLowerCase() === 'challenges');
    if (idx >= 0 && segments[idx + 1]) {
      suggestedTitle = slugToTitle(segments[idx + 1]);
    }
  } else if (platform === 'CodeChef' || platform === 'InterviewBit' || platform === 'NeetCode') {
    const idx = segments.findIndex((s) => s.toLowerCase() === 'problems');
    if (idx >= 0 && segments[idx + 1]) {
      suggestedTitle = slugToTitle(segments[idx + 1]);
    }
  } else if (segments.length > 0) {
    const lastMeaningful = [...segments]
      .reverse()
      .find((s) => s.length > 2 && !/^\d+$/.test(s) && s.toLowerCase() !== 'description');
    if (lastMeaningful) {
      suggestedTitle = slugToTitle(lastMeaningful);
    }
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
    platform,
    hostname,
    suggestedTitle,
    leetcodeSlug,
  };
}
