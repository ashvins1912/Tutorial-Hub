import React, { useCallback, useEffect, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Loader2,
  Share2,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '../../lib/apiFetch';

export interface SolverLibraryItem {
  id: string;
  publicId: string;
  authorName: string;
  visibility: 'saved' | 'shared';
  sourcePlatform: 'LeetCode' | 'GeeksforGeeks' | 'Custom';
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

const LOCAL_SAVED_KEY = 'patternforge_solver_saved_pulled_v1';

function readLocalSaved(): SolverLibraryItem[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalSaved(items: SolverLibraryItem[]) {
  try {
    window.localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(items.slice(0, 60)));
  } catch {
    // ignore storage quota errors
  }
}

interface PulledProblemActionStripProps {
  title: string;
  statement: string;
  sourcePlatform: 'LeetCode' | 'GeeksforGeeks' | 'Custom';
  sourceUrl?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examples?: string[];
  constraints?: string[];
  topics?: string[];
  recommendedPattern: string;
  complexitySummary: string;
  onNotify: (kind: 'success' | 'warn', text: string) => void;
  onLibraryChanged: () => void;
}

export const PulledProblemActionStrip: React.FC<PulledProblemActionStripProps> = ({
  title,
  statement,
  sourcePlatform,
  sourceUrl = '',
  difficulty,
  examples = [],
  constraints = [],
  topics = [],
  recommendedPattern,
  complexitySummary,
  onNotify,
  onLibraryChanged,
}) => {
  const [noteOpen, setNoteOpen] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const buildPayload = () => ({
    title: title.trim(),
    statement: statement.trim(),
    sourcePlatform,
    sourceUrl,
    difficulty,
    examples,
    constraints,
    topics,
    recommendedPattern,
    complexitySummary,
    userNotes: userNotes.trim(),
  });

  const handleSaveForFuture = async () => {
    if (!title.trim() || !statement.trim()) {
      onNotify('warn', 'Enter or pull a problem statement before saving.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/solver/saved-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = (await res.json()) as { problem?: SolverLibraryItem; error?: string };
      if (!res.ok || !data.problem) {
        throw new Error(data.error || 'Could not save problem to server.');
      }
      const existing = readLocalSaved().filter((x) => x.publicId !== data.problem!.publicId);
      writeLocalSaved([data.problem, ...existing]);
      setJustSaved(true);
      setNoteOpen(false);
      onLibraryChanged();
      onNotify('success', `Saved "${title.trim()}" to your Future Practice Library.`);
      window.setTimeout(() => setJustSaved(false), 2600);
    } catch {
      // Offline fallback: save locally so user never loses pulled problem
      const localItem: SolverLibraryItem = {
        id: `sv-local-${Date.now()}`,
        publicId: `sv-local-${Date.now()}`,
        authorName: 'You',
        visibility: 'saved',
        sourcePlatform,
        sourceUrl,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: title.trim(),
        difficulty,
        statement: statement.trim(),
        examples,
        constraints,
        topics,
        recommendedPattern,
        complexitySummary,
        userNotes: userNotes.trim(),
        upvotes: 0,
        createdAt: new Date().toISOString(),
      };
      writeLocalSaved([localItem, ...readLocalSaved()]);
      setJustSaved(true);
      setNoteOpen(false);
      onLibraryChanged();
      onNotify('success', `Saved "${title.trim()}" locally for future practice.`);
      window.setTimeout(() => setJustSaved(false), 2600);
    } finally {
      setSaving(false);
    }
  };

  const handleShareOnPlatform = async () => {
    if (!title.trim() || !statement.trim()) {
      onNotify('warn', 'Enter or pull a problem statement before sharing.');
      return;
    }
    setSharing(true);
    try {
      const res = await apiFetch('/api/solver/shared-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = (await res.json()) as { problem?: SolverLibraryItem; error?: string };
      if (!res.ok || !data.problem) {
        throw new Error(data.error || 'Could not publish shared problem.');
      }
      const shareUrl = `${window.location.origin}${window.location.pathname}?sharedProblem=${encodeURIComponent(data.problem.publicId)}`;
      setLastShareUrl(shareUrl);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl).catch(() => {});
        setCopiedLink(true);
        window.setTimeout(() => setCopiedLink(false), 2200);
      }
      setNoteOpen(false);
      onLibraryChanged();
      onNotify(
        'success',
        `Shared "${title.trim()}" on the platform! Shareable link copied to clipboard.`
      );
    } catch (err) {
      onNotify(
        'warn',
        err instanceof Error ? err.message : 'Unable to share problem on platform.'
      );
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => void handleSaveForFuture()}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-indigo-500 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : justSaved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            )}
            <span>{justSaved ? 'Saved for Future' : 'Save for Future'}</span>
          </button>

          <button
            type="button"
            onClick={() => void handleShareOnPlatform()}
            disabled={sharing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {sharing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>Share on Platform</span>
          </button>

          <button
            type="button"
            onClick={() => setNoteOpen((v) => !v)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline-offset-2 hover:underline whitespace-nowrap"
          >
            {noteOpen ? 'Hide Note' : '+ Add Study Note'}
          </button>
        </div>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
          >
            <span>Source ({sourcePlatform})</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        )}
      </div>

      {noteOpen && (
        <textarea
          rows={2}
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Add a key invariant note, edge-case reminder, or hint before saving/sharing..."
          className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      )}

      {lastShareUrl && (
        <div className="rounded-lg border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-mono text-sky-900 dark:text-sky-200 truncate flex-1 min-w-0">
            {lastShareUrl}
          </span>
          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard?.writeText) {
                void navigator.clipboard.writeText(lastShareUrl);
                setCopiedLink(true);
                window.setTimeout(() => setCopiedLink(false), 1800);
              }
            }}
            className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-300 hover:underline shrink-0"
          >
            {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copiedLink ? 'Copied' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
};

interface SavedAndSharedLibraryPanelProps {
  refreshSignal: number;
  onLoadProblem: (item: SolverLibraryItem) => void;
  onNotify: (kind: 'success' | 'warn', text: string) => void;
}

export const SavedAndSharedLibraryPanel: React.FC<SavedAndSharedLibraryPanelProps> = ({
  refreshSignal,
  onLoadProblem,
  onNotify,
}) => {
  const [tab, setTab] = useState<'saved' | 'shared'>('saved');
  const [savedItems, setSavedItems] = useState<SolverLibraryItem[]>(() => readLocalSaved());
  const [sharedItems, setSharedItems] = useState<SolverLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLibraries = useCallback(async () => {
    setLoading(true);
    try {
      const [savedRes, sharedRes] = await Promise.all([
        apiFetch('/api/solver/saved-problems'),
        apiFetch('/api/solver/shared-problems'),
      ]);
      if (savedRes.ok) {
        const data = (await savedRes.json()) as { problems?: SolverLibraryItem[] };
        const serverSaved = Array.isArray(data.problems) ? data.problems : [];
        const localSaved = readLocalSaved();
        const mergedMap = new Map<string, SolverLibraryItem>();
        for (const item of [...serverSaved, ...localSaved]) {
          mergedMap.set(item.publicId, item);
        }
        const merged = Array.from(mergedMap.values()).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
        );
        setSavedItems(merged);
      }
      if (sharedRes.ok) {
        const data = (await sharedRes.json()) as { problems?: SolverLibraryItem[] };
        if (Array.isArray(data.problems)) {
          setSharedItems(data.problems);
        }
      }
    } catch {
      setSavedItems(readLocalSaved());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLibraries();
  }, [fetchLibraries, refreshSignal]);

  const handleDeleteSaved = async (publicId: string) => {
    const nextLocal = readLocalSaved().filter((x) => x.publicId !== publicId);
    writeLocalSaved(nextLocal);
    setSavedItems((prev) => prev.filter((x) => x.publicId !== publicId));
    try {
      await apiFetch(`/api/solver/saved-problems/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });
    } catch {
      // local removal already succeeded
    }
    onNotify('success', 'Removed problem from your Saved library.');
  };

  const handleUpvoteShared = async (publicId: string) => {
    try {
      const res = await apiFetch(`/api/solver/shared-problems/${encodeURIComponent(publicId)}/upvote`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = (await res.json()) as { problem?: SolverLibraryItem };
        if (data.problem) {
          setSharedItems((prev) =>
            prev.map((item) => (item.publicId === publicId ? data.problem! : item))
          );
        }
      }
    } catch {
      // ignore transient error
    }
  };

  const handleCopyShareLink = (publicId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?sharedProblem=${encodeURIComponent(publicId)}`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url);
    }
    setCopiedId(publicId);
    onNotify('success', 'Shareable problem link copied to clipboard.');
    window.setTimeout(() => setCopiedId((curr) => (curr === publicId ? null : curr)), 1800);
  };

  const activeList = tab === 'saved' ? savedItems : sharedItems;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setTab('saved')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === 'saved'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Saved for Future ({savedItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('shared')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === 'shared'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Shared on Platform ({sharedItems.length})</span>
          </button>
        </div>

        {loading && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
          </span>
        )}
      </div>

      {activeList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {tab === 'saved'
            ? 'No pulled problems saved yet. Pull a LeetCode/GFG URL or paste a prompt and click "Save for Future".'
            : 'No shared problems yet. Share a pulled problem to publish it for the community.'}
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-0.5">
          {activeList.map((item) => (
            <div
              key={item.publicId}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        item.difficulty === 'Easy'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : item.difficulty === 'Hard'
                            ? 'text-rose-700 dark:text-rose-400'
                            : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {item.difficulty}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
                      {item.sourcePlatform}
                    </span>
                    {tab === 'shared' && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          by {item.authorName}
                        </span>
                      </>
                    )}
                  </div>

                  {item.recommendedPattern && (
                    <div className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                      Pattern: {item.recommendedPattern}
                      {item.complexitySummary ? ` · ${item.complexitySummary}` : ''}
                    </div>
                  )}

                  {item.userNotes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Note: {item.userNotes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onLoadProblem(item)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:opacity-90 whitespace-nowrap"
                  >
                    Open in Solver
                  </button>
                  {tab === 'shared' && (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleUpvoteShared(item.publicId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                      >
                        <ThumbsUp className="w-3 h-3" aria-hidden="true" />
                        <span>{item.upvotes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyShareLink(item.publicId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                      >
                        {copiedId === item.publicId ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === item.publicId ? 'Copied' : 'Link'}</span>
                      </button>
                    </>
                  )}
                  {tab === 'saved' && (
                    <button
                      type="button"
                      onClick={() => void handleDeleteSaved(item.publicId)}
                      aria-label={`Delete ${item.title}`}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
