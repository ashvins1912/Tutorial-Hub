import React, { useState } from 'react';
import { BookOpen, HelpCircle, Layers } from 'lucide-react';
import {
  DSA_HANDWRITTEN_TRACKS,
  EVERYDAY_INDIAN_DSA_ANALOGIES,
  type DsaHandwrittenTrack,
} from '../../data/dsaHandwrittenQuickNotesData';
import { LineByLineCodeStudio } from './LineByLineCodeStudio';

export const DsaHandwrittenQuickNotesView: React.FC = () => {
  const [activeTrackId, setActiveTrackId] =
    useState<DsaHandwrittenTrack['id']>('analogies-mindset');

  const activeTrack =
    DSA_HANDWRITTEN_TRACKS.find((t) => t.id === activeTrackId) ??
    DSA_HANDWRITTEN_TRACKS[0];

  return (
    <div className="space-y-5">
      {/* Track Selector */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
              Handwritten Notes Quick-Revision · Plain Indian Engineering Tone
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold text-slate-900 dark:text-slate-100">
              {activeTrack.title}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
            Focus: {activeTrack.languageTag}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeTrack.summary}
        </p>

        <div
          role="tablist"
          aria-label="DSA handwritten quick notes tracks"
          className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800"
        >
          {DSA_HANDWRITTEN_TRACKS.map((track) => {
            const selected = track.id === activeTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTrackId(track.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/45 text-sky-800 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{track.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Everyday Indian Analogies Grid when on Analogies track */}
      {activeTrack.id === 'analogies-mindset' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {EVERYDAY_INDIAN_DSA_ANALOGIES.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.structure}
                </h4>
                <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                  {item.timeHighlight}
                </span>
              </div>
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/25 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-200">
                <strong className="font-semibold">Indian Analogy: </strong>
                {item.indianAnalogy}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {item.mentalModel}
              </p>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">Ask in Interviews: </strong>
                {item.classicInterviewUse}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detailed Sections + Interactive Line-by-Line Code */}
      <div className="space-y-5">
        {activeTrack.sections.map((sec) => (
          <section
            key={sec.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
          >
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
                {sec.heading}
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {sec.plainExplanation}
              </p>
            </div>

            {sec.formulaOrRule && (
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 px-4 py-2.5 font-mono text-xs text-sky-900 dark:text-sky-200 overflow-x-auto">
                {sec.formulaOrRule}
              </div>
            )}

            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-5">
              {sec.keyPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>

            {sec.indianExample && (
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/25 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong className="font-semibold text-emerald-900 dark:text-emerald-300">
                  Real-World Indian Example:{' '}
                </strong>
                {sec.indianExample}
              </div>
            )}

            {sec.codeSnippet && (
              <LineByLineCodeStudio
                rawCode={sec.codeSnippet.code}
                initialLanguage={sec.codeSnippet.language}
                title={sec.codeSnippet.title}
                subtitle="Click any line to inspect the invariant and why it works"
                contextHint={sec.codeSnippet.contextHint}
                compact
              />
            )}
          </section>
        ))}
      </div>

      {/* Interview Quick Checks */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          Rapid Interview Q&amp;A Check
        </h4>
        <div className="space-y-2.5">
          {activeTrack.interviewChecklist.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 text-xs sm:text-sm space-y-1"
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">Q: {item.q}</div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">A: {item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
