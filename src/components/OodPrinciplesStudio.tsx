import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  HelpCircle,
  Lightbulb,
  PlayCircle,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { OodConcept, OodTrackId } from '../data/ood/oodTypes';
import { useAccountState } from '../hooks/useAccountState';
import { useAsyncCatalog } from '../hooks/useAsyncCatalog';
import { OodAnimationStage as OodAnimationStageBase } from './OodAnimationStage';
import { buildOodConceptMermaidDfd } from '../utils/studioMermaidBuilders';
import { FlightMermaidViewer } from './flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from './shared/LiveTrafficFlowSimulator';
import { withStudioBoundary } from './hoc';
import { SegmentedTabBar } from './ui';
import { TopicBridgeBar } from './shared/TopicBridgeBar';

const OodAnimationStage = withStudioBoundary(OodAnimationStageBase, {
  studioName: 'OOD Visual Animation Stage',
});

const TRACK_ORDER: Record<OodTrackId, number> = {
  oops: 1,
  solid: 2,
  creational: 3,
  structural: 4,
  behavioral: 5,
  'ood-systems': 6,
};

type StudioTab = 'visual' | 'code' | 'interview';
type CodeLang = 'python' | 'java' | 'typescript';

interface TrackMeta {
  id: 'all' | OodTrackId;
  label: string;
  shortLabel: string;
  subtitle: string;
}

const TRACK_FILTERS: TrackMeta[] = [
  {
    id: 'all',
    label: 'All Topics',
    shortLabel: 'All',
    subtitle: 'Full curriculum from OOPs fundamentals to GoF patterns & OOD systems',
  },
  {
    id: 'oops',
    label: 'OOPs Pillars',
    shortLabel: 'OOPs',
    subtitle: 'Classes, Heap vs Stack, Encapsulation, Abstraction, Inheritance & Polymorphism',
  },
  {
    id: 'solid',
    label: 'SOLID & Rules',
    shortLabel: 'SOLID',
    subtitle: 'SRP, OCP, LSP, ISP, DIP, DRY/KISS/YAGNI & Law of Demeter',
  },
  {
    id: 'creational',
    label: 'Creational',
    shortLabel: 'Creational',
    subtitle: 'Factory Method, Abstract Factory, Builder, Singleton & Prototype',
  },
  {
    id: 'structural',
    label: 'Structural',
    shortLabel: 'Structural',
    subtitle: 'Adapter, Facade, Decorator, Proxy, Composite, Bridge & Flyweight',
  },
  {
    id: 'behavioral',
    label: 'Behavioral',
    shortLabel: 'Behavioral',
    subtitle: 'Strategy, Observer, State, Chain of Responsibility, Command, Template, Iterator & Mediator',
  },
  {
    id: 'ood-systems',
    label: 'OOD Systems',
    shortLabel: 'OOD LLD',
    subtitle: 'End-to-end designs: Parking Lot, Elevator, Rate Limiter & Payments',
  },
];

const LANG_OPTIONS: { id: CodeLang; label: string }[] = [
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'typescript', label: 'TypeScript' },
];

function getDifficultyClasses(difficulty: OodConcept['difficulty']): string {
  if (difficulty === 'Beginner') {
    return 'text-emerald-700 dark:text-emerald-400';
  }
  if (difficulty === 'Intermediate') {
    return 'text-amber-700 dark:text-amber-400';
  }
  return 'text-rose-700 dark:text-rose-400';
}

export function OodPrinciplesStudio() {
  const { data: oodCatalog } = useAsyncCatalog('ood-principles-catalog');
  const ALL_OOD_CONCEPTS = useMemo<OodConcept[]>(
    () =>
      [
        ...oodCatalog.oopsAndSolid,
        ...oodCatalog.patternsAndOod,
        ...oodCatalog.extendedGof,
      ].sort((a, b) => TRACK_ORDER[a.track] - TRACK_ORDER[b.track]),
    [oodCatalog]
  );
  const [masteredIds, setMasteredIds] = useAccountState<string[]>('ood-mastery-progress', []);
  const [selectedTrack, setSelectedTrack] = useState<'all' | OodTrackId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string>(ALL_OOD_CONCEPTS[0].id);
  const [activeTab, setActiveTab] = useState<StudioTab>('visual');
  const [codeLang, setCodeLang] = useState<CodeLang>('python');
  const [copiedSide, setCopiedSide] = useState<'bad' | 'good' | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [openQaIndex, setOpenQaIndex] = useState<number | null>(0);

  const masteredSet = useMemo(() => new Set(masteredIds), [masteredIds]);

  const trackCounts = useMemo(() => {
    const counts: Record<'all' | OodTrackId, { total: number; mastered: number }> = {
      all: { total: ALL_OOD_CONCEPTS.length, mastered: 0 },
      oops: { total: 0, mastered: 0 },
      solid: { total: 0, mastered: 0 },
      creational: { total: 0, mastered: 0 },
      structural: { total: 0, mastered: 0 },
      behavioral: { total: 0, mastered: 0 },
      'ood-systems': { total: 0, mastered: 0 },
    };
    for (const c of ALL_OOD_CONCEPTS) {
      counts[c.track].total += 1;
      if (masteredSet.has(c.id)) {
        counts.all.mastered += 1;
        counts[c.track].mastered += 1;
      }
    }
    return counts;
  }, [masteredSet]);

  const filteredConcepts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_OOD_CONCEPTS.filter((c) => {
      if (selectedTrack !== 'all' && c.track !== selectedTrack) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.shortTitle.toLowerCase().includes(q) ||
        c.trackLabel.toLowerCase().includes(q) ||
        c.oneSentenceRule.toLowerCase().includes(q)
      );
    });
  }, [selectedTrack, searchQuery]);

  const activeConcept = useMemo(
    () => ALL_OOD_CONCEPTS.find((c) => c.id === activeId) ?? ALL_OOD_CONCEPTS[0],
    [activeId]
  );

  const activeIndexInFiltered = filteredConcepts.findIndex((c) => c.id === activeConcept.id);
  const activeIndexGlobal = ALL_OOD_CONCEPTS.findIndex((c) => c.id === activeConcept.id);
  const isMastered = masteredSet.has(activeConcept.id);

  const selectedQuizOptionId = quizAnswers[activeConcept.id] ?? null;
  const selectedQuizOption =
    activeConcept.quiz.options.find((opt) => opt.id === selectedQuizOptionId) ?? null;

  const selectConcept = (id: string) => {
    setActiveId(id);
    setOpenQaIndex(0);
    setCopiedSide(null);
  };

  const toggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const markMastered = (id: string) => {
    setMasteredIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSelectQuizOption = (optionId: string) => {
    setQuizAnswers((prev) => ({ ...prev, [activeConcept.id]: optionId }));
    const chosen = activeConcept.quiz.options.find((o) => o.id === optionId);
    if (chosen?.isCorrect) {
      markMastered(activeConcept.id);
    }
  };

  const handleCopyCode = (side: 'bad' | 'good', codeText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(codeText).then(() => {
        setCopiedSide(side);
        window.setTimeout(() => setCopiedSide(null), 1600);
      });
    }
  };

  const handlePrevTopic = () => {
    if (activeIndexInFiltered > 0) {
      selectConcept(filteredConcepts[activeIndexInFiltered - 1].id);
    } else if (activeIndexGlobal > 0) {
      selectConcept(ALL_OOD_CONCEPTS[activeIndexGlobal - 1].id);
    }
  };

  const handleNextTopic = () => {
    if (activeIndexInFiltered >= 0 && activeIndexInFiltered < filteredConcepts.length - 1) {
      selectConcept(filteredConcepts[activeIndexInFiltered + 1].id);
    } else if (activeIndexGlobal < ALL_OOD_CONCEPTS.length - 1) {
      selectConcept(ALL_OOD_CONCEPTS[activeIndexGlobal + 1].id);
    }
  };

  const masteryPct = Math.round((trackCounts.all.mastered / Math.max(1, trackCounts.all.total)) * 100);
  const codePair = activeConcept.code[codeLang];

  return (
    <div className="space-y-6">
      {/* Studio Header & 4-Track Mastery Overview */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400 font-semibold">
              Visual Architecture &amp; Object-Oriented Mastery
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              OOPs, Design Principles &amp; OOD Visual Studio
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Learn every Object-Oriented pillar, SOLID rule, Creational · Structural · Behavioral
              GoF Design Pattern, and Low-Level OOD interview blueprint through animated diagrams,
              real-world analogies, side-by-side bad vs clean code, and mastery quizzes.
            </p>
          </div>

          <div className="shrink-0 lg:text-right space-y-1.5 min-w-[200px]">
            <div className="text-xs text-slate-500 dark:text-slate-400">Overall Mastery</div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {trackCounts.all.mastered}
              <span className="text-base font-normal text-slate-400">
                /{trackCounts.all.total}
              </span>
              <span className="ml-2 text-sm font-semibold text-sky-700 dark:text-sky-400">
                {masteryPct}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-600 dark:bg-sky-400 transition-all duration-300"
                style={{ width: `${masteryPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 6-Track Quick Filter Bar (OOPs · SOLID · Creational · Structural · Behavioral · OOD Systems) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          {TRACK_FILTERS.filter((t) => t.id !== 'all').map((track) => {
            const count = trackCounts[track.id];
            const isSelected = selectedTrack === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedTrack(isSelected ? 'all' : track.id)}
                className={`text-left rounded-lg border p-3.5 transition-colors ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {track.label}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {count.mastered}/{count.total}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {track.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main 2-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Rail */}
        <aside className="lg:col-span-4 xl:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden lg:sticky lg:top-20">
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search OOPs, SOLID, patterns..."
                aria-label="Search OOPs and design principle topics"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Compact Track Tabs */}
            <div className="flex flex-wrap gap-1">
              {TRACK_FILTERS.map((t) => {
                const active = selectedTrack === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTrack(t.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      active
                        ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {t.shortLabel} ({trackCounts[t.id].total})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scrollable Topic Index */}
          <div className="max-h-[540px] lg:max-h-[680px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredConcepts.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No topics match &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTrack('all');
                  }}
                  className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredConcepts.map((concept, idx) => {
                const isSelected = concept.id === activeConcept.id;
                const done = masteredSet.has(concept.id);
                return (
                  <button
                    key={concept.id}
                    type="button"
                    onClick={() => selectConcept(concept.id)}
                    className={`w-full text-left px-3.5 py-3 transition-colors flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-[11px] font-mono tabular-nums text-slate-400 mt-0.5 w-5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div
                        className={`text-xs font-semibold leading-snug ${
                          isSelected
                            ? 'text-sky-800 dark:text-sky-200'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {concept.shortTitle}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="truncate">{concept.trackLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-medium ${getDifficultyClasses(concept.difficulty)}`}>
                          {concept.difficulty}
                        </span>
                      </div>
                    </div>
                    {done && (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                        aria-label="Mastered"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Learning Canvas */}
        <section className="lg:col-span-8 xl:col-span-9 space-y-5 min-w-0">
          {/* Concept Banner & Tab Switcher */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-sky-700 dark:text-sky-400">
                    {activeConcept.trackLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className={`font-semibold ${getDifficultyClasses(activeConcept.difficulty)}`}>
                    {activeConcept.difficulty}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {activeConcept.frames.length} animated steps
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {activeConcept.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => toggleMastered(activeConcept.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 self-start ${
                  isMastered
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                {isMastered ? 'Mastered (+45 XP)' : 'Mark Mastered'}
              </button>
            </div>

            {/* Golden One-Sentence Rule + Analogy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/30 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  Plain-English Rule
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeConcept.oneSentenceRule}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  Real-World Analogy
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeConcept.realWorldAnalogy}
                </p>
              </div>
            </div>

            {/* Progressive-Disclosure 3-Tab Switcher */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <SegmentedTabBar
                ariaLabel="Topic learning sections"
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={[
                  { id: 'visual', label: 'Visual Animation & Intuition', icon: PlayCircle },
                  { id: 'code', label: 'Bad vs Clean Code', icon: Code2 },
                  { id: 'interview', label: 'Interview Q&A & Quiz', icon: HelpCircle },
                ]}
              />
            </div>
          </div>

          {/* TAB 1: Visual Animation & Complete Easy Explanation */}
          {activeTab === 'visual' && (
            <div className="space-y-5">
              <OodAnimationStage concept={activeConcept} />

              {/* Rendered Mermaid.js Object & Architecture DFD + Live Dispatch Traffic */}
              {(() => {
                const oodMermaid = buildOodConceptMermaidDfd(activeConcept);
                return (
                  <div className="space-y-4">
                    <FlightMermaidViewer
                      title={`${activeConcept.shortTitle} — Architecture & Interaction DFD (Mermaid.js)`}
                      subtitle="Class contracts, object delegation, and clean dependency inversion rendered as an interactive Mermaid flow."
                      mermaidCode={oodMermaid}
                      trafficDomain="system-design"
                      compact
                    />
                    <LiveTrafficFlowSimulator
                      mermaidCode={oodMermaid}
                      mermaidTitle={`${activeConcept.shortTitle} Call Flow`}
                      domain="system-design"
                      compact
                      heading={`Live Call & Object Dispatch Simulation — ${activeConcept.shortTitle}`}
                    />
                  </div>
                );
              })()}

              {/* Why It Matters */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Why This Matters in Real Codebases &amp; Interviews
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeConcept.whyItMatters}
                </p>
              </div>

              {/* Key Takeaways & Common Pitfalls Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                      aria-hidden="true"
                    />
                    Key Takeaways to Remember
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {activeConcept.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
                          {idx + 1}.
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <AlertTriangle
                      className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0"
                      aria-hidden="true"
                    />
                    Common Mistakes &amp; Traps
                  </h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {activeConcept.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5 shrink-0">
                          ×
                        </span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Side-by-Side Bad vs Clean Code */}
          {activeTab === 'code' && (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Side-by-Side Refactor Comparison
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Compare the brittle anti-pattern directly against the clean, maintainable
                      design.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    {LANG_OPTIONS.map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => {
                          setCodeLang(lang.id);
                          setCopiedSide(null);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                          codeLang === lang.id
                            ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bad vs Clean Panels */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* Bad Anti-Pattern */}
                  <div className="rounded-xl border border-rose-200 dark:border-rose-900/70 overflow-hidden flex flex-col">
                    <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900/70 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-rose-800 dark:text-rose-200 truncate">
                        Avoid · {activeConcept.code.badLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode('bad', codePair.bad)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 dark:text-rose-300 hover:underline shrink-0"
                      >
                        {copiedSide === 'bad' ? (
                          <>
                            <Check className="w-3 h-3" aria-hidden="true" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" aria-hidden="true" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 overflow-x-auto flex-1">
                      <code>{codePair.bad}</code>
                    </pre>
                  </div>

                  {/* Clean Refactor */}
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/70 overflow-hidden flex flex-col">
                    <div className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-900/70 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 truncate">
                        Clean · {activeConcept.code.goodLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode('good', codePair.good)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                      >
                        {copiedSide === 'good' ? (
                          <>
                            <Check className="w-3 h-3" aria-hidden="true" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" aria-hidden="true" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 text-xs font-mono leading-relaxed text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 overflow-x-auto flex-1">
                      <code>{codePair.good}</code>
                    </pre>
                  </div>
                </div>

                {/* Refactor Rationale */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 space-y-1">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Why the Clean Version Wins
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeConcept.code.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Quiz & Senior Interview Q&A */}
          {activeTab === 'interview' && (
            <div className="space-y-5">
              {/* Interactive Checkpoint Quiz */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Quick Mastery Check
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Solve correctly to auto-record +45 XP
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                  {activeConcept.quiz.question}
                </p>

                <div className="space-y-2">
                  {activeConcept.quiz.options.map((opt) => {
                    const isPicked = selectedQuizOptionId === opt.id;
                    const showResult = Boolean(selectedQuizOptionId);
                    let optionStyle =
                      'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-sky-400 text-slate-800 dark:text-slate-200';
                    if (isPicked && opt.isCorrect) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
                    } else if (isPicked && !opt.isCorrect) {
                      optionStyle =
                        'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100';
                    } else if (showResult && opt.isCorrect) {
                      optionStyle =
                        'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100';
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectQuizOption(opt.id)}
                        className={`w-full text-left rounded-lg border px-4 py-3 text-xs sm:text-sm transition-colors flex items-start justify-between gap-3 ${optionStyle}`}
                      >
                        <span className="leading-relaxed">{opt.text}</span>
                        {isPicked && opt.isCorrect && (
                          <CheckCircle2
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                        {isPicked && !opt.isCorrect && (
                          <XCircle
                            className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedQuizOption && (
                  <div
                    className={`rounded-lg border p-3.5 text-xs sm:text-sm leading-relaxed ${
                      selectedQuizOption.isCorrect
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                        : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <strong className="font-semibold">
                      {selectedQuizOption.isCorrect ? 'Correct! ' : 'Not quite: '}
                    </strong>
                    {selectedQuizOption.explanation}
                  </div>
                )}
              </div>

              {/* Senior Interview Q&A Accordion */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Real Interview Follow-Up Questions
                </h3>

                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeConcept.interviewQa.map((qa, idx) => {
                    const isOpen = openQaIndex === idx;
                    return (
                      <div key={idx} className="py-3 first:pt-1 last:pb-1">
                        <button
                          type="button"
                          onClick={() => setOpenQaIndex(isOpen ? null : idx)}
                          aria-expanded={isOpen}
                          className="w-full text-left flex items-start justify-between gap-3 group"
                        >
                          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                            Q{idx + 1}. {qa.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp
                              className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronDown
                              className="w-4 h-4 text-slate-400 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                        {isOpen && (
                          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-0.5">
                            {qa.answer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Footer Prev / Next Topic Stepper */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3.5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrevTopic}
              disabled={activeIndexGlobal <= 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Previous Topic
            </button>

            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              Topic {activeIndexGlobal + 1} / {ALL_OOD_CONCEPTS.length}
            </span>

            <button
              type="button"
              onClick={handleNextTopic}
              disabled={activeIndexGlobal >= ALL_OOD_CONCEPTS.length - 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-40 transition-colors"
            >
              Next Topic
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>

      <TopicBridgeBar studioId="ood" />
    </div>
  );
}
