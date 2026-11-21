import { useState } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, Compass, Lightbulb } from 'lucide-react';
import { STUDIO_KNOWLEDGE_PROFILES } from '../../data/knowledgeLinkRegistry';
import { usePatternForgeStore } from '../../store/usePatternForgeStore';

interface TopicBridgeBarProps {
  studioId: keyof typeof STUDIO_KNOWLEDGE_PROFILES;
}

export function TopicBridgeBar({ studioId }: TopicBridgeBarProps) {
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const [expanded, setExpanded] = useState(false);

  const profile = STUDIO_KNOWLEDGE_PROFILES[studioId];
  if (!profile) return null;

  return (
    <section
      aria-label={`Learning context and related studios for ${profile.title}`}
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
        <div className="space-y-1.5 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
              <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Concept Transfer &amp; Learning Path
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{profile.tier}</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            <strong className="font-semibold text-slate-900 dark:text-slate-100">In Simple English: </strong>
            {profile.plainEnglishSummary}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap shrink-0 self-start"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          {expanded ? 'Hide Standard Definition' : 'Standard Definition & Study Tip'}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Standard Engineering Definition
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {profile.standardDefinition}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <div className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              Recommended Practice Sequence
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {profile.practiceTip}
            </p>
          </div>
        </div>
      )}

      {/* Cross-Studio Connected Knowledge Links */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
          Connected Topics Across the Stack (Click to Jump)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
          {profile.links.map((link) => (
            <button
              key={`${studioId}-${link.targetView}`}
              type="button"
              onClick={() => setActiveView(link.targetView)}
              className="group text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-sky-950/30 transition-colors flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                  {link.relationship}
                </span>
                <ArrowRight
                  className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-transform group-hover:translate-x-0.5 shrink-0"
                  aria-hidden="true"
                />
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {link.label}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                {link.reason}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
