import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Lightbulb,
  NotebookPen,
  RefreshCw,
} from 'lucide-react';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { apiFetch } from '../lib/apiFetch';
import { BEGINNER_TO_ADVANCED_PATH } from '../data/knowledgeLinkRegistry';
import { CopyButton } from './ui';

export function QuickRevisionHub() {
  const {
    data: { patterns: CURRICULUM_PATTERNS },
  } = useAsyncCatalog('curriculum-patterns');
  const { data: PROBLEMS } = useAsyncCatalog('interactive-problems');
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Unified Notes Maker across all problems
  const [selectedNoteId, setSelectedNoteId] = useState(PROBLEMS[0].id);
  const [noteText, setNoteText] = useState('');
  const [notesByProblem, setNotesByProblem] = useState<Record<string, string>>({});
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [noteDirty, setNoteDirty] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<Array<{ objectiveId: string; lessonId: string; accuracy: number; intervalDays: number; dueAt: string; status: 'due' | 'scheduled' }>>([]);
  const [reviewSummary, setReviewSummary] = useState<{ dueReviews: number; scheduledReviews: number } | null>(null);
  const [reviewQueueStatus, setReviewQueueStatus] = useState('Loading your review schedule…');

  useEffect(() => {
    let active = true;
    apiFetch('/api/learning-progress')
      .then(async (response) => {
        if (!response.ok) throw new Error('Your spaced-revision schedule is unavailable.');
        const payload = await response.json() as { objectiveReviewQueue?: Array<{ objectiveId: string; lessonId: string; accuracy: number; intervalDays: number; dueAt: string; status: 'due' | 'scheduled' }>; summary?: { dueReviews: number; scheduledReviews: number } };
        if (!active) return;
        const queue = payload.objectiveReviewQueue || [];
        setReviewQueue(queue.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()));
        setReviewSummary(payload.summary || null);
        setReviewQueueStatus(queue.length ? 'Review schedule ready' : 'Complete an objective-linked quiz to create your first review schedule');
      })
      .catch((error) => { if (active) setReviewQueueStatus(error instanceof Error ? error.message : 'Review schedule unavailable'); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    let active = true;
    apiFetch('/api/cognitive/notes')
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load your saved notes.');
        const payload = await response.json();
        if (active) {
          setNotesByProblem(payload.notes ?? {});
          setNotesLoaded(true);
        }
      })
      .catch(() => {
        if (active) setNotesLoaded(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setNoteText(notesByProblem[selectedNoteId] ?? '');
    setNoteDirty(false);
  }, [selectedNoteId, notesByProblem]);

  useEffect(() => {
    if (!notesLoaded || !noteDirty) return;
    const timeout = window.setTimeout(async () => {
      try {
        const response = await apiFetch('/api/cognitive/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ problemId: selectedNoteId, note: noteText }),
        });
        if (!response.ok) throw new Error('Unable to save this note.');
        setNotesByProblem((current) => ({ ...current, [selectedNoteId]: noteText }));
        setNoteDirty(false);
      } catch {
        // Keep the note in the editor; a later edit retries the save.
      }
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [notesLoaded, noteDirty, selectedNoteId, noteText]);

  const buildMarkdownBundle = () => {
    return PROBLEMS.map((p) => {
      const saved = notesByProblem[p.id] ?? '';
      return `## #${p.number} ${p.title} (${p.difficulty} · ${p.patternName})\n- Optimal: ${p.targetBigO} time / ${p.spaceOptimal} space\n- Key Signal: ${p.signals.map((s) => s.phrase).join(', ')}\n- Personal Notes: ${saved || 'No notes recorded yet.'}\n`;
    }).join('\n');
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([buildMarkdownBundle()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patternforge-dsa-revision-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const activePattern = CURRICULUM_PATTERNS[cardIdx % CURRICULUM_PATTERNS.length];

  return (
    <div className="space-y-8">
      <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-3" aria-label="Spaced revision queue">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-xs font-mono text-sky-600 dark:text-sky-400">SPACED RETRIEVAL</p><h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your objective review queue</h2><p className="text-[11px] text-slate-500">{reviewQueueStatus}</p></div>
          {reviewSummary && <div className="flex gap-3 text-xs"><span><strong className="text-amber-600">{reviewSummary.dueReviews}</strong> due</span><span><strong>{reviewSummary.scheduledReviews}</strong> scheduled</span></div>}
        </div>
        {reviewQueue.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{reviewQueue.slice(0, 8).map((item) => <div key={item.lessonId + item.objectiveId} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold truncate">{item.objectiveId}</p><p className="text-[10px] text-slate-500">Lesson {item.lessonId.slice(-8)} · Last accuracy {item.accuracy}%</p></div><div className="text-right shrink-0"><span className={item.status === "due" ? "text-[10px] font-semibold text-amber-600" : "text-[10px] font-semibold text-emerald-600"}>{item.status === "due" ? "Due now" : "Scheduled"}</span><p className="text-[10px] text-slate-500">{new Date(item.dueAt).toLocaleDateString()}</p></div></div>)}</div>}
        {reviewQueue.length > 8 && <p className="text-[10px] text-slate-500">Showing 8 of {reviewQueue.length} objectives. The schedule uses your latest verified attempt for each objective.</p>}
      </section>
      {/* The Mental Shift & Why It Gets Easier */}
      <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-5">
        <div>
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
            INTERVIEW TUTOR MINDSET · BREAKING THE BLANK-PAGE WALL
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            The Mental Shift & Why Pattern Mastery Gets Easier
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {[
            {
              title: '1. Building -> Optimizing',
              body: 'App building asks "does it work?". Product IT interviews ask "can it survive N = 10^5 in < 100ms using Big O analysis?"',
            },
            {
              title: '2. Grounding Abstract Structures',
              body: 'Recursion, DP tables, graphs, and pointers feel unnatural until you trace 4–6 elements by hand before touching syntax.',
            },
            {
              title: '3. Structure Over Speed',
              body: 'Cramming solutions fails on unfamiliar twists. Treat DSA like a gym: show up with pen, paper, dry-runs, and loop invariants.',
            },
            {
              title: '4. The 80% Familiarity Curve',
              body: 'Most interview problems are remixes of ~20 core patterns. Master 200–300 targeted problems and 80% of new prompts feel familiar.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1.5"
            >
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {card.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Revision Flashcard Drill + Unified Notes Maker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Rapid Signal-to-Pattern Flashcard */}
        <section className="lg:col-span-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" aria-hidden="true" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Quick Revision Signal Drill
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              Card {cardIdx + 1} / {CURRICULUM_PATTERNS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="w-full min-h-[210px] p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-left flex flex-col justify-between transition-colors hover:border-sky-400"
          >
            {!flipped ? (
              <>
                <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                  PROMPT · WHICH PATTERN DO THESE SIGNALS TRIGGER?
                </div>
                <div className="space-y-2 my-3">
                  {activePattern.signalClues.map((clue) => (
                    <div key={clue} className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      • “{clue}”
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  Click card to reveal Pattern & Brute → Optimal jump
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  ANSWER · {activePattern.tierLabel.toUpperCase()}
                </div>
                <div className="space-y-2 my-2">
                  <div className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {activePattern.name}
                  </div>
                  <div className="text-xs text-rose-700 dark:text-rose-400">
                    Brute: {activePattern.bruteProgression}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400">
                    Optimal: {activePattern.optimalProgression} ({activePattern.timeComplexity} / {activePattern.spaceComplexity})
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Canonical: {activePattern.canonicalProblems.join(' · ')}
                </div>
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCardIdx((i) => (i - 1 + CURRICULUM_PATTERNS.length) % CURRICULUM_PATTERNS.length);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
              </button>
              <button
                type="button"
                onClick={() => {
                  setFlipped(false);
                  setCardIdx((i) => (i + 1) % CURRICULUM_PATTERNS.length);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {activePattern.linkedProblemId && (
              <button
                type="button"
                onClick={() => selectProblem(activePattern.linkedProblemId!)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                Practice Lab
              </button>
            )}
          </div>
        </section>

        {/* Revision Notes Maker & Markdown Export */}
        <section className="lg:col-span-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Interview Revision Notes Maker
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton
                text={buildMarkdownBundle}
                label="Copy All MD"
                copiedLabel="Copied MD"
                size="sm"
              />
              <button
                type="button"
                onClick={handleDownloadMarkdown}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                Export .md
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="rev-note-select" className="text-xs font-medium text-slate-500 shrink-0">
              Topic / Problem:
            </label>
            <select
              id="rev-note-select"
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
            >
              {PROBLEMS.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.title} ({p.patternName})
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={noteText}
            onChange={(e) => { setNoteText(e.target.value); setNoteDirty(true); }}
            placeholder="Record your pen-and-paper dry run, edge cases, and loop invariant..."
            rows={7}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs font-mono leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Auto-saved per problem as you type. Export all notes into a single Markdown cheatsheet before interviews.
          </p>
        </section>
      </div>

      {/* Beginner-to-Advanced Full-Curriculum Transfer Map */}
      <section className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            Complete Beginner-to-Advanced Engineering Roadmap
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Jump Across Connected Studios in Learning Order
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Follow Stages 01 → 03 sequentially to transfer knowledge smoothly from language fundamentals and algorithms to databases, distributed systems, and AI infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {BEGINNER_TO_ADVANCED_PATH.map((stage) => (
            <div
              key={stage.stageNumber}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                  Stage {stage.stageNumber} · {stage.tier}
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {stage.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {stage.summary}
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                {stage.items.map((item) => (
                  <button
                    key={item.viewId}
                    type="button"
                    onClick={() => setActiveView(item.viewId)}
                    className="group w-full text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 hover:border-sky-500 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <span>{item.label}</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {item.whatYouLearn}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
