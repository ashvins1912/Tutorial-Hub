import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  Layers,
} from 'lucide-react';
import {
  ALL_20_CODING_PATTERNS,
  KARUMANCHI_CHAPTER_NOTES,
  type LineByLinePatternBlueprint,
} from '../../data/dsaLineByLineMasteryData';
import { useAccountState } from '../../hooks/useAccountState';
import { CatalogSearchInput } from '../ui';
import { LineByLineCodeStudio } from './LineByLineCodeStudio';

export interface Patterns20KarumanchiLabProps {
  initialPatternId?: string;
  onJumpTo28Pattern?: (pattern28Id: string) => void;
}

export const Patterns20KarumanchiLab: React.FC<Patterns20KarumanchiLabProps> = ({
  initialPatternId,
  onJumpTo28Pattern,
}) => {
  const [section, setSection] = useState<'patterns20' | 'karumanchi'>('patterns20');
  const [selectedId, setSelectedId] = useState<string>(
    initialPatternId ?? ALL_20_CODING_PATTERNS[0].id
  );
  const [search, setSearch] = useState('');
  const [masteredIds, setMasteredIds] = useAccountState<string[]>(
    'dsa-20-line-by-line-mastered',
    []
  );

  const normalizedQuery = search.trim().toLowerCase();

  const filteredPatterns = useMemo(() => {
    if (!normalizedQuery) return ALL_20_CODING_PATTERNS;
    return ALL_20_CODING_PATTERNS.filter((pat) =>
      [
        pat.title,
        pat.shortTitle,
        pat.applications,
        pat.karumanchiChapter,
        pat.karumanchiFoundation,
        ...pat.dsaUsages,
        ...pat.whenToUse,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const filteredChapters = useMemo(() => {
    if (!normalizedQuery) return KARUMANCHI_CHAPTER_NOTES;
    return KARUMANCHI_CHAPTER_NOTES.filter((ch) =>
      [
        `chapter ${ch.chapter}`,
        ch.title,
        ch.corePrinciple,
        ch.formulaOrInvariant,
        ch.complexityBreakdown,
        ch.classicTrap,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  const activePattern: LineByLinePatternBlueprint = useMemo(
    () =>
      ALL_20_CODING_PATTERNS.find((p) => p.id === selectedId) ??
      ALL_20_CODING_PATTERNS[0],
    [selectedId]
  );

  const isMastered = masteredIds.includes(activePattern.id);

  const toggleMastered = (patternId: string) => {
    setMasteredIds((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  const openPatternFromChapter = (patternId: string) => {
    setSelectedId(patternId);
    setSection('patterns20');
  };

  return (
    <div className="space-y-4">
      {/* Top Mode & Progress Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSection('patterns20')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                section === 'patterns20'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>20 Coding Patterns · Line-by-Line</span>
            </button>
            <button
              type="button"
              onClick={() => setSection('karumanchi')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                section === 'karumanchi'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Karumanchi DSA Foundations ({KARUMANCHI_CHAPTER_NOTES.length} Chapters)</span>
            </button>
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            Mastered:{' '}
            <strong className="text-slate-900 dark:text-slate-100">
              {masteredIds.length} / {ALL_20_CODING_PATTERNS.length}
            </strong>
          </div>
        </div>

        <CatalogSearchInput
          value={search}
          onChange={setSearch}
          placeholder={
            section === 'patterns20'
              ? 'Filter 20 patterns, data structure, or invariant...'
              : 'Search Karumanchi chapter, theorem, or trap...'
          }
          className="w-full lg:w-72"
        />
      </div>

      {/* SECTION A: 20 CODING PATTERNS LINE-BY-LINE WORKBENCH */}
      {section === 'patterns20' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Rail: All 20 Patterns */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                20 Interview Coding Patterns
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {filteredPatterns.length} / 20
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[760px] overflow-y-auto">
              {filteredPatterns.map((pat) => {
                const selected = pat.id === activePattern.id;
                const done = masteredIds.includes(pat.id);
                return (
                  <button
                    key={pat.id}
                    type="button"
                    onClick={() => setSelectedId(pat.id)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start justify-between gap-2.5 ${
                      selected
                        ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                        <span
                          className={
                            selected
                              ? 'text-sky-300 dark:text-sky-400 font-semibold'
                              : 'text-slate-400 dark:text-slate-500'
                          }
                        >
                          #{String(pat.number).padStart(2, '0')}
                        </span>
                        <span className="opacity-40" aria-hidden="true">·</span>
                        <span
                          className={
                            selected
                              ? 'text-slate-300 dark:text-slate-300'
                              : 'text-slate-500 dark:text-slate-400'
                          }
                        >
                          {pat.timeComplexity} · {pat.spaceComplexity}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mt-0.5 truncate">{pat.title}</p>
                      <p
                        className={`text-[11px] mt-0.5 truncate ${
                          selected
                            ? 'text-slate-300 dark:text-slate-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {pat.dsaUsages.join(' · ')}
                      </p>
                    </div>
                    {done ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                        aria-label="Mastered"
                      />
                    ) : (
                      <Circle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          selected ? 'text-slate-500' : 'text-slate-300 dark:text-slate-700'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}

              {filteredPatterns.length === 0 && (
                <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No coding patterns match "{search}".
                </p>
              )}
            </div>
          </aside>

          {/* Right Stage: Selected Pattern Deep Dive */}
          <div className="lg:col-span-8 space-y-4">
            {/* Overview & Karumanchi Foundation */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      Pattern #{String(activePattern.number).padStart(2, '0')} of 20
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Time {activePattern.timeComplexity}</span>
                    <span aria-hidden="true">·</span>
                    <span>Space {activePattern.spaceComplexity}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activePattern.dsaUsages.join(' · ')}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {activePattern.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {activePattern.applications}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleMastered(activePattern.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                      isMastered
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                    }`}
                  >
                    {isMastered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    )}
                    <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                  </button>

                  {onJumpTo28Pattern && activePattern.dsa28PatternIds[0] && (
                    <button
                      type="button"
                      onClick={() => onJumpTo28Pattern(activePattern.dsa28PatternIds[0])}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Practice Sheet</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>

              {/* Karumanchi Proof + Core Invariant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Karumanchi Foundation · {activePattern.karumanchiChapter}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activePattern.karumanchiFoundation}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-400">
                    <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Core Loop / Data Invariant</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activePattern.coreInvariant}
                  </p>
                </div>
              </div>

              {/* When To Use Recognition Signals */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  When to Recognize &amp; Apply This Pattern
                </p>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {activePattern.whenToUse.map((signal, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-sky-600 dark:text-sky-400 shrink-0 tabular-nums">
                        {idx + 1}.
                      </span>
                      <span className="leading-relaxed">{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Interactive Line-by-Line Studio (Python / TS / Java + Full Ledger + Dry-Run Trace + Quiz) */}
            <LineByLineCodeStudio
              blueprint={activePattern}
              onQuizPassed={() => {
                if (!masteredIds.includes(activePattern.id)) {
                  setMasteredIds((prev) => [...prev, activePattern.id]);
                }
              }}
            />

            {/* Verified Worked Sample Problems */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100">
                  Verified Worked Examples ({activePattern.workedSamples.length})
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Trace input → output before coding
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activePattern.workedSamples.map((sample, idx) => (
                  <article
                    key={idx}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3.5 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {idx + 1}. {sample.title}
                      </h4>
                      <div className="font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                        <p className="break-words">
                          <span className="text-slate-500 dark:text-slate-400">In: </span>
                          {sample.input}
                        </p>
                        <p className="break-words text-emerald-700 dark:text-emerald-400 font-semibold">
                          <span className="text-slate-500 dark:text-slate-400 font-normal">Out: </span>
                          {sample.output}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800">
                      {sample.insight}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SECTION B: KARUMANCHI 17-CHAPTER DSA FOUNDATIONS REFERENCE */}
      {section === 'karumanchi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChapters.map((ch) => (
            <article
              key={ch.chapter}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                    Chapter {String(ch.chapter).padStart(2, '0')} · Karumanchi DSA Foundations
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {ch.title}
                  </h3>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">
                      Core Principle:{' '}
                    </strong>
                    {ch.corePrinciple}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-indigo-700 dark:text-indigo-400">
                      Formula / Invariant:{' '}
                    </strong>
                    {ch.formulaOrInvariant}
                  </p>
                  <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    <strong className="font-sans font-semibold text-slate-800 dark:text-slate-200">
                      Complexity Bounds:{' '}
                    </strong>
                    {ch.complexityBreakdown}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Classic Interview Trap</span>
                  </div>
                  <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
                    {ch.classicTrap}
                  </p>
                </div>
              </div>

              {ch.linkedPatternIds.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Interactive Line-by-Line Lab:
                  </span>
                  {ch.linkedPatternIds.map((pid) => {
                    const target = ALL_20_CODING_PATTERNS.find((p) => p.id === pid);
                    if (!target) return null;
                    return (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => openPatternFromChapter(pid)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
                      >
                        <span>
                          #{String(target.number).padStart(2, '0')} {target.shortTitle}
                        </span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          ))}

          {filteredChapters.length === 0 && (
            <div className="md:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No Karumanchi foundation chapters match "{search}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
