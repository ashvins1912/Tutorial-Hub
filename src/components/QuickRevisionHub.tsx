import { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Lightbulb,
  NotebookPen,
  RefreshCw,
} from 'lucide-react';
import { CURRICULUM_PATTERNS } from '../data/curriculum';
import { PROBLEMS } from '../data/problems';
import { usePatternForgeStore } from '../store/usePatternForgeStore';

export function QuickRevisionHub() {
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Unified Notes Maker across all problems
  const [selectedNoteId, setSelectedNoteId] = useState(PROBLEMS[0].id);
  const [noteText, setNoteText] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const storageKey = `patternforge-note-${selectedNoteId}`;

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    setNoteText(saved ?? '');
  }, [storageKey]);

  const handleSaveNote = (text: string) => {
    setNoteText(text);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, text);
    }
    fetch('/api/cognitive/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'learner-default', problemId: selectedNoteId, note: text }),
    }).catch(() => {});
  };

  const buildMarkdownBundle = () => {
    return PROBLEMS.map((p) => {
      const saved =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(`patternforge-note-${p.id}`) || ''
          : '';
      return `## #${p.number} ${p.title} (${p.difficulty} · ${p.patternName})\n- Optimal: ${p.targetBigO} time / ${p.spaceOptimal} space\n- Key Signal: ${p.signals.map((s) => s.phrase).join(', ')}\n- Personal Notes: ${saved || 'No notes recorded yet.'}\n`;
    }).join('\n');
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdownBundle());
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // ignore
    }
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
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAll ? 'Copied MD' : 'Copy All MD'}
              </button>
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
            onChange={(e) => handleSaveNote(e.target.value)}
            placeholder="Record your pen-and-paper dry run, edge cases, and loop invariant..."
            rows={7}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs font-mono leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Auto-saved per problem as you type. Export all notes into a single Markdown cheatsheet before interviews.
          </p>
        </section>
      </div>
    </div>
  );
}
