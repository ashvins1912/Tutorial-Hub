import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  classifyQuestionToPattern28,
  type CustomPattern28Problem,
  type Dsa28Difficulty,
} from '../data/dsa28Patterns';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { apiFetch } from '../lib/apiFetch';
import { OverlayDialog, OverlayHeader } from './ui';

export interface AddCustomProblemModalProps {
  open: boolean;
  onClose: () => void;
  existingProblems: CustomPattern28Problem[];
  defaultPatternId?: string;
  onProblemAdded: (
    problem: CustomPattern28Problem,
    options: { openInSolver: boolean }
  ) => void;
}

interface ParsedExternalProblem {
  sourcePlatform: 'LeetCode' | 'GeeksforGeeks';
  sourceUrl: string;
  slug: string;
  title: string;
  difficulty: Dsa28Difficulty;
  statement: string;
  examples: string[];
  constraints: string[];
  topics: string[];
  hints?: string[];
  companies?: string[];
}

const DIFFICULTY_TEXT_CLASS: Record<Dsa28Difficulty, string> = {
  Easy: 'text-emerald-600 dark:text-emerald-400',
  Medium: 'text-amber-600 dark:text-amber-400',
  Hard: 'text-rose-600 dark:text-rose-400',
};

const QUICK_SAMPLE_URLS = [
  {
    label: 'LeetCode · Koko Eating Bananas',
    platform: 'LeetCode' as const,
    url: 'https://leetcode.com/problems/koko-eating-bananas/',
  },
  {
    label: "GeeksforGeeks · Kadane's Algorithm",
    platform: 'GeeksforGeeks' as const,
    url: 'https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1',
  },
];

export const AddCustomProblemModal: React.FC<AddCustomProblemModalProps> = ({
  open,
  onClose,
  existingProblems,
  defaultPatternId,
  onProblemAdded,
}) => {
  const {
    data: { groups, patterns },
  } = useAsyncCatalog('dsa-28-patterns');

  const [entryMode, setEntryMode] = useState<'url' | 'manual'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [platformHint, setPlatformHint] = useState<'LeetCode' | 'GeeksforGeeks'>('LeetCode');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedProblem, setParsedProblem] = useState<ParsedExternalProblem | null>(null);
  const [showFullStatement, setShowFullStatement] = useState(true);

  const [chosenPatternId, setChosenPatternId] = useState<string>(
    defaultPatternId ?? patterns[0]?.id ?? 'hashmap-hashset-lookup'
  );
  const [manualOverride, setManualOverride] = useState(false);
  const [revisionNote, setRevisionNote] = useState('');

  // Manual fallback fields
  const [manualTitle, setManualTitle] = useState('');
  const [manualPlatform, setManualPlatform] = useState<'LeetCode' | 'GeeksforGeeks'>('LeetCode');
  const [manualUrl, setManualUrl] = useState('');
  const [manualDifficulty, setManualDifficulty] = useState<Dsa28Difficulty>('Medium');
  const [manualTags, setManualTags] = useState('');
  const [manualStatement, setManualStatement] = useState('');

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      if (defaultPatternId && !parsedProblem) {
        setChosenPatternId(defaultPatternId);
      }
    }
  }, [open, defaultPatternId, parsedProblem]);

  const classification = useMemo(() => {
    if (entryMode === 'url' && parsedProblem) {
      return classifyQuestionToPattern28({
        title: parsedProblem.title,
        statement: parsedProblem.statement,
        topics: parsedProblem.topics,
        constraints: parsedProblem.constraints,
      });
    }
    if (
      entryMode === 'manual' &&
      (manualTitle.trim() || manualTags.trim() || manualStatement.trim())
    ) {
      return classifyQuestionToPattern28({
        title: manualTitle,
        statement: manualStatement,
        topics: manualTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
    }
    return null;
  }, [entryMode, parsedProblem, manualTitle, manualTags, manualStatement]);

  useEffect(() => {
    if (classification && !manualOverride) {
      setChosenPatternId(classification.best.patternId);
    }
  }, [classification, manualOverride]);

  const resetForm = () => {
    setUrlInput('');
    setParsedProblem(null);
    setRevisionNote('');
    setManualTitle('');
    setManualUrl('');
    setManualTags('');
    setManualStatement('');
    setManualOverride(false);
    setErrorMsg(null);
  };

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  const handleParseUrl = async (e?: React.FormEvent, overrideUrl?: string, overridePlatform?: 'LeetCode' | 'GeeksforGeeks') => {
    e?.preventDefault();
    const targetUrl = (overrideUrl ?? urlInput).trim();
    const targetPlatform = overridePlatform ?? platformHint;

    if (!targetUrl) {
      setErrorMsg('Paste a LeetCode or GeeksforGeeks problem URL (or slug) to parse.');
      return;
    }

    setParsing(true);
    setErrorMsg(null);
    setManualOverride(false);

    try {
      const response = await apiFetch('/api/solver/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, platform: targetPlatform }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.problem) {
        throw new Error(
          typeof payload?.error === 'string'
            ? payload.error
            : 'Unable to parse this problem from the server. You can switch to Manual Entry.'
        );
      }

      const fetched = payload.problem as ParsedExternalProblem;
      setParsedProblem(fetched);
      const firstLine = (fetched.statement || '')
        .split('\n')
        .map((line) => line.trim())
        .find(Boolean);
      setRevisionNote(firstLine ? firstLine.slice(0, 180) : `Imported from ${fetched.sourcePlatform}`);
    } catch (err) {
      setParsedProblem(null);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not reach the server parser. Try again or use Manual Entry.'
      );
    } finally {
      setParsing(false);
    }
  };

  const handleSaveProblem = async (openInSolver: boolean) => {
    setErrorMsg(null);

    let candidate: CustomPattern28Problem | null = null;

    if (entryMode === 'url') {
      if (!parsedProblem) {
        setErrorMsg('Parse a LeetCode or GeeksforGeeks URL first.');
        return;
      }
      const slugKey = `${parsedProblem.sourcePlatform.toLowerCase()}-${parsedProblem.slug}`;
      candidate = {
        id: `custom-${slugKey}`,
        patternId: chosenPatternId,
        sourcePlatform: parsedProblem.sourcePlatform,
        title: parsedProblem.title,
        slug: slugKey,
        url: parsedProblem.sourceUrl,
        difficulty: parsedProblem.difficulty,
        topics: parsedProblem.topics.slice(0, 8),
        keyIdea: revisionNote.trim() || `Imported from ${parsedProblem.sourcePlatform}`,
        statement: parsedProblem.statement,
        examples: parsedProblem.examples.slice(0, 4),
        constraints: parsedProblem.constraints.slice(0, 8),
        addedAt: new Date().toISOString(),
        confidence: classification?.best.confidence,
      };
    } else {
      const cleanTitle = manualTitle.trim();
      const cleanStatement = manualStatement.trim();
      if (!cleanTitle) {
        setErrorMsg('Enter a problem title before adding.');
        return;
      }
      const rawSlug = cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const slugKey = `${manualPlatform.toLowerCase()}-${rawSlug || Date.now()}`;
      const cleanUrl =
        manualUrl.trim() ||
        (manualPlatform === 'LeetCode'
          ? `https://leetcode.com/problems/${rawSlug}/`
          : `https://www.geeksforgeeks.org/problems/${rawSlug}/1`);

      candidate = {
        id: `custom-${slugKey}`,
        patternId: chosenPatternId,
        sourcePlatform: manualPlatform,
        title: cleanTitle,
        slug: slugKey,
        url: cleanUrl,
        difficulty: manualDifficulty,
        topics: manualTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 8),
        keyIdea:
          cleanStatement.split('\n')[0]?.slice(0, 180) || `Added from ${manualPlatform}`,
        statement: cleanStatement || cleanTitle,
        examples: [],
        constraints: [],
        addedAt: new Date().toISOString(),
        confidence: classification?.best.confidence,
      };
    }

    if (!candidate) return;

    const duplicate = existingProblems.some(
      (item) => item.slug === candidate!.slug || item.url === candidate!.url
    );
    if (duplicate) {
      setErrorMsg('This problem is already in your custom problem list.');
      return;
    }

    setSaving(true);
    try {
      const matchedPattern = patterns.find((p) => p.id === candidate!.patternId);
      // Persist to the server-side saved problems library as well (best-effort; account state also persists)
      const saveRes = await apiFetch('/api/solver/saved-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourcePlatform: candidate.sourcePlatform,
          sourceUrl: candidate.url,
          slug: candidate.slug,
          title: candidate.title,
          difficulty: candidate.difficulty,
          statement: candidate.statement || candidate.keyIdea,
          examples: candidate.examples ?? [],
          constraints: candidate.constraints ?? [],
          topics: candidate.topics,
          recommendedPattern: matchedPattern?.title ?? '',
          userNotes: candidate.keyIdea,
        }),
      }).catch(() => null);

      if (saveRes?.ok) {
        const savedPayload = await saveRes.json().catch(() => null);
        if (savedPayload?.problem?.publicId) {
          candidate.savedRecordId = String(savedPayload.problem.publicId);
        }
      }

      onProblemAdded(candidate, { openInSolver });
      resetForm();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = entryMode === 'url' ? Boolean(parsedProblem) : Boolean(manualTitle.trim());

  return (
    <OverlayDialog
      open={open}
      onClose={handleClose}
      ariaLabel="Add Custom Problem"
      maxWidthClass="max-w-3xl"
    >
      <OverlayHeader
        kicker="SERVER-SIDE PROBLEM PARSER · LEETCODE & GEEKSFORGEEKS"
        title="Add Custom Problem"
        subtitle="Paste a LeetCode or GeeksforGeeks URL to parse the full statement, examples, and constraints via the server API and add it directly to your problem bank."
        onClose={handleClose}
      />

      <div className="p-6 overflow-y-auto space-y-5">
        {/* Entry Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-fit">
            <button
              type="button"
              onClick={() => {
                setEntryMode('url');
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                entryMode === 'url'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Parse from URL
            </button>
            <button
              type="button"
              onClick={() => {
                setEntryMode('manual');
                setErrorMsg(null);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                entryMode === 'manual'
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Manual Entry
            </button>
          </div>

          {entryMode === 'url' && (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Try sample:</span>
              {QUICK_SAMPLE_URLS.map((sample) => (
                <button
                  key={sample.url}
                  type="button"
                  disabled={parsing}
                  onClick={() => {
                    setPlatformHint(sample.platform);
                    setUrlInput(sample.url);
                    void handleParseUrl(undefined, sample.url, sample.platform);
                  }}
                  className="text-sky-600 dark:text-sky-400 font-medium hover:underline whitespace-nowrap"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL Parser Input */}
        {entryMode === 'url' ? (
          <form onSubmit={(e) => void handleParseUrl(e)} className="space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                aria-label="Platform selector"
                value={platformHint}
                onChange={(e) =>
                  setPlatformHint(e.target.value as 'LeetCode' | 'GeeksforGeeks')
                }
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200 shrink-0"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
              </select>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://leetcode.com/problems/two-sum/ or https://www.geeksforgeeks.org/problems/..."
                aria-label="LeetCode or GeeksforGeeks problem URL"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
              <button
                type="submit"
                disabled={parsing}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-50 whitespace-nowrap shrink-0 transition-colors"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Parse Problem</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Accepts full URLs from <span className="font-mono">leetcode.com/problems/...</span> or{' '}
              <span className="font-mono">geeksforgeeks.org/problems/...</span> (or a bare problem slug matching the selected platform).
            </p>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Problem Title
              </label>
              <input
                type="text"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="e.g., Allocate Minimum Number of Pages"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Platform
              </label>
              <select
                value={manualPlatform}
                onChange={(e) =>
                  setManualPlatform(e.target.value as 'LeetCode' | 'GeeksforGeeks')
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="LeetCode">LeetCode</option>
                <option value="GeeksforGeeks">GeeksforGeeks</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Difficulty
              </label>
              <select
                value={manualDifficulty}
                onChange={(e) => setManualDifficulty(e.target.value as Dsa28Difficulty)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Source URL (optional)
              </label>
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/... or https://www.geeksforgeeks.org/problems/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                value={manualTags}
                onChange={(e) => setManualTags(e.target.value)}
                placeholder="Binary Search, Greedy, Array"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Problem Statement / Key Notes
              </label>
              <textarea
                rows={4}
                value={manualStatement}
                onChange={(e) => setManualStatement(e.target.value)}
                placeholder="Paste the problem description, constraints, or core trick..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 resize-y"
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div
            role="alert"
            className="px-3.5 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300"
          >
            {errorMsg}
          </div>
        )}

        {/* Parsed Problem Statement Preview */}
        {entryMode === 'url' && parsedProblem && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {parsedProblem.sourcePlatform}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className={`font-semibold ${DIFFICULTY_TEXT_CLASS[parsedProblem.difficulty]}`}>
                  {parsedProblem.difficulty}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {parsedProblem.title}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFullStatement((prev) => !prev)}
                  className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{showFullStatement ? 'Hide Statement' : 'Show Statement'}</span>
                </button>
                <a
                  href={parsedProblem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Original</span>
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {parsedProblem.topics.length > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Topics: </span>
                  {parsedProblem.topics.join(' · ')}
                </p>
              )}

              {showFullStatement && (
                <div className="space-y-3">
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {parsedProblem.statement}
                  </div>

                  {parsedProblem.examples.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Parsed Examples ({parsedProblem.examples.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {parsedProblem.examples.slice(0, 2).map((ex, idx) => (
                          <pre
                            key={idx}
                            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto"
                          >
                            {ex}
                          </pre>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedProblem.constraints.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Constraints
                      </p>
                      <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1">
                        {parsedProblem.constraints.slice(0, 5).join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Revision Summary / Key Idea (shown in your problem table)
                </label>
                <input
                  type="text"
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Auto-Classified Eligible Pattern Section */}
        {classification && (
          <div className="p-4 rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Auto-Matched Pattern Category</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  #{String(classification.best.patternNumber).padStart(2, '0')}{' '}
                  {classification.best.patternTitle}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {classification.best.matchedReasons.join(' · ')}
                </p>
              </div>
              <span className="font-mono tabular-nums text-xs font-bold text-sky-700 dark:text-sky-400 shrink-0">
                {classification.best.confidence}% match
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 mr-1">Top matches:</span>
              {[classification.best, ...classification.alternatives].map((cand) => {
                const selected = chosenPatternId === cand.patternId;
                return (
                  <button
                    key={cand.patternId}
                    type="button"
                    onClick={() => {
                      setManualOverride(true);
                      setChosenPatternId(cand.patternId);
                    }}
                    className={`px-2 py-1 rounded-md font-medium border transition-colors ${
                      selected
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                    }`}
                  >
                    #{cand.patternNumber} {cand.patternTitle}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Assign to Pattern Category
              </label>
              <select
                value={chosenPatternId}
                onChange={(e) => {
                  setManualOverride(true);
                  setChosenPatternId(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100"
              >
                {groups.map((grp) => (
                  <optgroup key={grp.id} label={grp.title}>
                    {patterns
                      .filter((pat) => pat.groupId === grp.id)
                      .map((pat) => (
                        <option key={pat.id} value={pat.id}>
                          #{String(pat.number).padStart(2, '0')} {pat.title}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <button
          type="button"
          onClick={handleClose}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canSubmit || saving}
            onClick={() => void handleSaveProblem(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-sky-500 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            <span>Add &amp; Open in Solver</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={!canSubmit || saving}
            onClick={() => void handleSaveProblem(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-40 transition-colors whitespace-nowrap"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add to My Problems</span>
              </>
            )}
          </button>
        </div>
      </div>
    </OverlayDialog>
  );
};
