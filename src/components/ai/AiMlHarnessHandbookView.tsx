import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  HelpCircle,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  HARNESS_ENGINEERING_NOTES,
  HARNESS_LEH_TRIP_WORKFLOW,
  ML_12_ALGORITHMS_NOTES,
  RAG_AND_SPRING_AI_NOTES,
  TRANSFORMER_LLM_NOTES,
  VECTOR_DB_COMPARISON,
  type PlainNoteSection,
} from '../../data/aiMlHarnessHandbookData';
import { useAccountState } from '../../hooks/useAccountState';
import { CatalogSearchInput } from '../ui';
import { LineByLineCodeStudio } from '../shared/LineByLineCodeStudio';

type HandbookTrackId = 'ml-12' | 'transformers-llm' | 'rag-spring-ai' | 'harness-agents';

const TRACK_TABS: {
  id: HandbookTrackId;
  label: string;
  count: number;
  icon: typeof Cpu;
  subtitle: string;
}[] = [
  {
    id: 'ml-12',
    label: '12 ML Algorithms',
    count: ML_12_ALGORITHMS_NOTES.length,
    icon: Layers,
    subtitle: 'Plain-English ML notes with Indian real-world datasets (₹ Lakhs flat prices, ₹499 churn, CIBIL loans)',
  },
  {
    id: 'transformers-llm',
    label: 'Transformers & LLMs',
    count: TRANSFORMER_LLM_NOTES.length,
    icon: Cpu,
    subtitle: 'Self-Attention, Pre-LN, BPE/SentencePiece, LoRA/QLoRA, INT4 Quantization & KV Cache',
  },
  {
    id: 'rag-spring-ai',
    label: 'RAG, Vector DBs & Spring AI',
    count: RAG_AND_SPRING_AI_NOTES.length,
    icon: Database,
    subtitle: 'Hybrid Search, Reranking, HNSW, RAGAS & Production Java Spring Boot + Spring AI RAG',
  },
  {
    id: 'harness-agents',
    label: 'Harness Engineering (AI Agents)',
    count: HARNESS_ENGINEERING_NOTES.length,
    icon: ShieldCheck,
    subtitle: 'Model vs Harness, Context Compaction, 5 Guardrail Layers, ₹0.35/query Cost Tracing & Leh Trip Lab',
  },
];

export const AiMlHarnessHandbookView: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<HandbookTrackId>('ml-12');
  const [selectedNoteId, setSelectedNoteId] = useState<string>(ML_12_ALGORITHMS_NOTES[0].id);
  const [search, setSearch] = useState('');
  const [lehStepIdx, setLehStepIdx] = useState(0);
  const [completedNotes, setCompletedNotes] = useAccountState<string[]>(
    'ai-ml-harness-handbook-done',
    [],
    'patternforge_ai_ml_harness_v1'
  );

  const trackNotes: PlainNoteSection[] = useMemo(() => {
    switch (activeTrack) {
      case 'ml-12':
        return ML_12_ALGORITHMS_NOTES;
      case 'transformers-llm':
        return TRANSFORMER_LLM_NOTES;
      case 'rag-spring-ai':
        return RAG_AND_SPRING_AI_NOTES;
      case 'harness-agents':
        return HARNESS_ENGINEERING_NOTES;
    }
  }, [activeTrack]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trackNotes;
    return trackNotes.filter((n) =>
      [
        n.title,
        n.category,
        n.whatItIs,
        n.whyWeNeedIt,
        n.indianExample,
        n.whenToUse,
        ...n.howItWorks,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [trackNotes, search]);

  const activeNote =
    filteredNotes.find((n) => n.id === selectedNoteId) ??
    filteredNotes[0] ??
    trackNotes[0];

  const totalNoteCount =
    ML_12_ALGORITHMS_NOTES.length +
    TRANSFORMER_LLM_NOTES.length +
    RAG_AND_SPRING_AI_NOTES.length +
    HARNESS_ENGINEERING_NOTES.length;

  const isDone = activeNote ? completedNotes.includes(activeNote.id) : false;

  const toggleDone = (id: string) => {
    setCompletedNotes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTrackSwitch = (nextTrack: HandbookTrackId) => {
    setActiveTrack(nextTrack);
    setSearch('');
    const list =
      nextTrack === 'ml-12'
        ? ML_12_ALGORITHMS_NOTES
        : nextTrack === 'transformers-llm'
          ? TRANSFORMER_LLM_NOTES
          : nextTrack === 'rag-spring-ai'
            ? RAG_AND_SPRING_AI_NOTES
            : HARNESS_ENGINEERING_NOTES;
    setSelectedNoteId(list[0].id);
  };

  const activeTrackMeta = TRACK_TABS.find((t) => t.id === activeTrack) ?? TRACK_TABS[0];
  const activeLehStep = HARNESS_LEH_TRIP_WORKFLOW[lehStepIdx] ?? HARNESS_LEH_TRIP_WORKFLOW[0];

  return (
    <div className="space-y-5">
      {/* Header & Track Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Plain-Language Study Handbooks
              </span>
              <span aria-hidden="true">·</span>
              <span>Indian Real-World Context</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {completedNotes.length}/{totalNoteCount} topics revised
              </span>
            </div>
            <h2 className="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              ML Algorithms, Transformers, LLMs, RAG, Spring AI &amp; Agent Harness Handbook
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeTrackMeta.subtitle}
            </p>
          </div>

          <CatalogSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search algorithm, concept, or formula..."
            className="w-full lg:w-72"
          />
        </div>

        <div
          role="tablist"
          aria-label="AI and ML Handbook tracks"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
        >
          {TRACK_TABS.map((tab) => {
            const Icon = tab.icon;
            const selected = tab.id === activeTrack;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => handleTrackSwitch(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
                <span className="font-mono tabular-nums text-[11px] opacity-75">
                  ({tab.count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Leh ₹50,000 Trip Agent Harness Walkthrough (shown on Harness Track) */}
      {activeTrack === 'harness-agents' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div className="space-y-0.5">
              <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                End-to-End Agent Harness Case Study · Step {activeLehStep.step} of{' '}
                {HARNESS_LEH_TRIP_WORKFLOW.length}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                3-Day Leh Trip from Delhi Under ₹50,000 — Live Execution Loop
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setLehStepIdx((i) =>
                    i === 0 ? HARNESS_LEH_TRIP_WORKFLOW.length - 1 : i - 1
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Prev
              </button>
              <button
                type="button"
                onClick={() =>
                  setLehStepIdx((i) => (i + 1) % HARNESS_LEH_TRIP_WORKFLOW.length)
                }
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
              >
                Next Phase
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {HARNESS_LEH_TRIP_WORKFLOW.map((item, idx) => {
              const current = idx === lehStepIdx;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setLehStepIdx(idx)}
                  className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                    current
                      ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/45 text-slate-900 dark:text-slate-100'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-mono tabular-nums text-sky-700 dark:text-sky-400">
                    0{item.step} · {item.phase}
                  </div>
                  <div className="text-xs font-semibold truncate mt-0.5">{item.title}</div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs leading-relaxed">
            <div className="lg:col-span-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Phase {activeLehStep.step}: {activeLehStep.phase} — {activeLehStep.title}
              </div>
              <p className="text-slate-700 dark:text-slate-300">{activeLehStep.harnessAction}</p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Active Harness Component
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeLehStep.toolOrGuardrail}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Live Budget &amp; Telemetry
                </div>
                <div className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                  {activeLehStep.budgetOrMetric}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Split Reader: Left Chapter Rail + Right Plain-English Study Note */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden lg:sticky lg:top-20">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              {activeTrackMeta.label}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {filteredNotes.length} / {trackNotes.length}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[680px] overflow-y-auto">
            {filteredNotes.map((note) => {
              const selected = note.id === activeNote?.id;
              const done = completedNotes.includes(note.id);
              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left px-4 py-3 transition-colors flex items-start justify-between gap-2.5 ${
                    selected
                      ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`text-[11px] font-mono tabular-nums ${
                        selected
                          ? 'text-sky-300 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {note.number} · {note.category}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold leading-snug mt-0.5">
                      {note.title}
                    </div>
                  </div>
                  {done && (
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-500 shrink-0 mt-1"
                      aria-label="Revised"
                    />
                  )}
                </button>
              );
            })}
            {filteredNotes.length === 0 && (
              <div className="p-4 text-xs text-slate-500 dark:text-slate-400">
                No topics match "{search}". Clear the search box to see all chapters.
              </div>
            )}
          </div>
        </aside>

        {activeNote && (
          <article className="lg:col-span-8 space-y-5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
              {/* Chapter Title & Mark Complete */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    Topic {activeNote.number} · {activeNote.category}
                  </div>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                    {activeNote.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDone(activeNote.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start ${
                    isDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  {isDone ? 'Revised' : 'Mark Revised'}
                </button>
              </div>

              {/* What It Is + Why We Need It */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm leading-relaxed">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    What It Is (Plain English)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{activeNote.whatItIs}</p>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Why We Need It
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{activeNote.whyWeNeedIt}</p>
                </div>
              </div>

              {/* Formula / Spec Strip */}
              {activeNote.formulaOrSpec && (
                <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 px-4 py-3 font-mono text-xs text-sky-900 dark:text-sky-200 overflow-x-auto">
                  {activeNote.formulaOrSpec}
                </div>
              )}

              {/* Step-by-Step Working */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  How It Works (Step-by-Step)
                </h4>
                <ol className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-decimal pl-5">
                  {activeNote.howItWorks.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Indian Real-World Example */}
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/25 p-4 space-y-1">
                <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Real-World Indian Example
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {activeNote.indianExample}
                </p>
              </div>

              {/* Pros vs Limitations + When To Use */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs leading-relaxed">
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Strengths / Pros
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {activeNote.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
                  <div className="font-semibold text-amber-700 dark:text-amber-400">
                    Limitations &amp; Watch-Outs
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {activeNote.limitations.map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    When to Use:{' '}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{activeNote.whenToUse}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Quick-Revision Key Takeaways
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {activeNote.keyTakeaways.map((kt, i) => (
                      <li key={i}>{kt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interview Q&A */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Common Interview Questions
                </h4>
                <div className="space-y-2.5">
                  {activeNote.interviewQa.map((qa, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 text-xs sm:text-sm space-y-1"
                    >
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Q: {qa.q}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        A: {qa.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Line-by-Line Code Studio when code exists */}
            {activeNote.codeExample && (
              <LineByLineCodeStudio
                rawCode={activeNote.codeExample.code}
                initialLanguage={activeNote.codeExample.language}
                title={activeNote.codeExample.title}
                subtitle="Click any line to inspect what it does and why it is written this way"
                contextHint={activeNote.codeExample.contextHint}
                compact
              />
            )}

            {/* Vector DB Comparison Table when viewing RAG track */}
            {activeTrack === 'rag-spring-ai' && (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Vector Database Quick Comparison (FAISS, Chroma, PGVector, Qdrant, Pinecone, Milvus)
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
                        <th className="py-2.5 px-4 font-semibold">Vector DB</th>
                        <th className="py-2.5 px-4 font-semibold">Type</th>
                        <th className="py-2.5 px-4 font-semibold">Indexing</th>
                        <th className="py-2.5 px-4 font-semibold">Best For / Indian Use Case</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {VECTOR_DB_COMPARISON.map((row) => (
                        <tr key={row.name}>
                          <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            {row.name}
                          </td>
                          <td className="py-2.5 px-4">{row.type}</td>
                          <td className="py-2.5 px-4 font-mono text-[11px]">{row.indexing}</td>
                          <td className="py-2.5 px-4">
                            {row.bestFor} · <span className="text-slate-500 dark:text-slate-400">{row.indianUseCase}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </article>
        )}
      </div>
    </div>
  );
};
