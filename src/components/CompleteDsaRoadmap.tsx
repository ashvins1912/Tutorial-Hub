import { useMemo, useState } from 'react';
import { Search, CheckCircle2, Circle, BookOpen, Target, Brain, Filter } from 'lucide-react';
import { COMPLETE_DSA_ROADMAP, DSA_LEVELS, LESSON_FLOW, MASTERY_CHECKLIST, type DsaLevel, type DsaRoadmapTopic } from '../data/completeDsaRoadmap';

const levelStyles: Record<DsaLevel, string> = {
  Foundation: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  Core: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  Intermediate: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
  Advanced: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  Expert: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};
const storageKey = 'patternforge-dsa-roadmap-v1';
type Progress = Record<string, { completed: boolean; gates: string[] }>;

function loadProgress(): Progress {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) as Progress : {};
  } catch { return {}; }
}

export function CompleteDsaRoadmap() {
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | DsaLevel>('All');
  const [activeTopicId, setActiveTopicId] = useState(COMPLETE_DSA_ROADMAP[0].id);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const activeTopic = COMPLETE_DSA_ROADMAP.find((item) => item.id === activeTopicId) ?? COMPLETE_DSA_ROADMAP[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMPLETE_DSA_ROADMAP.filter((item) => {
      const matchesLevel = levelFilter === 'All' || item.level === levelFilter;
      const searchable = [item.title, item.group, ...item.subtopics, ...item.recognition].join(' ').toLowerCase();
      return matchesLevel && (!q || searchable.includes(q));
    });
  }, [query, levelFilter]);

  const completedCount = Object.values(progress).filter((item) => item.completed).length;
  const persist = (next: Progress) => {
    setProgress(next);
    try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* in-memory fallback */ }
  };
  const toggleGate = (topic: DsaRoadmapTopic, gate: string) => {
    const current = progress[topic.id] ?? { completed: false, gates: [] };
    const gates = current.gates.includes(gate) ? current.gates.filter((item) => item !== gate) : [...current.gates, gate];
    persist({ ...progress, [topic.id]: { gates, completed: gates.length === MASTERY_CHECKLIST.length } });
  };
  const groups = [...new Set(filtered.map((item) => item.group))];

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-sky-600 dark:text-sky-400">The complete learning path</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">DSA mastery roadmap</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">Learn major algorithm and data-structure families in prerequisite order. Each topic moves from a plain-English mental model to proof, implementation, independent practice and unfamiliar variations.</p>
        </div>
        <div className="min-w-44 rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Topics mastered</div>
          <div className="mt-1 text-3xl font-bold tabular-nums">{completedCount}<span className="text-base font-medium text-slate-400"> / {COMPLETE_DSA_ROADMAP.length}</span></div>
          <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: (completedCount / COMPLETE_DSA_ROADMAP.length * 100) + '%' }} /></div>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 mt-6">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"><BookOpen className="w-4 h-4 text-sky-600 mb-2" /><div className="text-sm font-semibold">Learn the why</div><p className="text-xs text-slate-500 mt-1">Build a mental model, not a keyword list.</p></div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"><Brain className="w-4 h-4 text-violet-600 mb-2" /><div className="text-sm font-semibold">Derive the how</div><p className="text-xs text-slate-500 mt-1">Improve brute force and justify every decision.</p></div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"><Target className="w-4 h-4 text-emerald-600 mb-2" /><div className="text-sm font-semibold">Prove mastery</div><p className="text-xs text-slate-500 mt-1">Pass independent implementation and transfer tests.</p></div>
      </div>
    </section>

    <section className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] gap-5 items-start">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics, subtopics or problem clues..." className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-sky-500" /></div>
          <div className="flex items-center gap-2 flex-wrap"><Filter className="w-4 h-4 text-slate-400" /><button type="button" onClick={() => setLevelFilter('All')} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${levelFilter === 'All' ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>All levels</button>{DSA_LEVELS.map((level) => <button key={level} type="button" onClick={() => setLevelFilter(level)} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${levelFilter === level ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{level}</button>)}</div>
          <p className="text-xs text-slate-500">{filtered.length} topics · grouped by learning area</p>
        </div>
        <div className="max-h-[780px] overflow-y-auto p-3 space-y-4">
          {groups.map((group) => <div key={group}><div className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{group}</div><div className="space-y-1">
            {filtered.filter((item) => item.group === group).map((item) => {
              const selected = item.id === activeTopic.id;
              const done = progress[item.id]?.completed;
              return <button key={item.id} type="button" onClick={() => setActiveTopicId(item.id)} className={`w-full text-left rounded-xl px-3 py-3 border transition-colors ${selected ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30 dark:border-sky-700' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70'}`}>
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</div><div className="mt-1 flex flex-wrap gap-2 items-center"><span className={`text-[10px] border rounded-full px-2 py-0.5 font-semibold ${levelStyles[item.level]}`}>{item.level}</span><span className="text-[11px] text-slate-400">{item.subtopics.length} subtopics</span></div></div>{done ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 shrink-0" />}</div>
              </button>;
            })}
          </div></div>)}
          {filtered.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No topics match this search. Try a broader term.</div>}
        </div>
      </div>

      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-start justify-between gap-3"><div><span className={`text-[10px] border rounded-full px-2 py-1 font-semibold ${levelStyles[activeTopic.level]}`}>{activeTopic.level}</span><h2 className="mt-3 text-xl font-bold">{activeTopic.title}</h2><p className="mt-1 text-xs text-slate-500">{activeTopic.group}</p></div><span className="text-xs text-slate-400 tabular-nums">{(progress[activeTopic.id]?.gates.length ?? 0)}/{MASTERY_CHECKLIST.length}</span></div>
          <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: ((progress[activeTopic.id]?.gates.length ?? 0) / MASTERY_CHECKLIST.length * 100) + '%' }} /></div>
          {activeTopic.prerequisites.length > 0 && <div className="mt-5"><div className="text-xs font-semibold text-slate-500 mb-2">Prerequisites</div><div className="flex flex-wrap gap-2">{activeTopic.prerequisites.map((id) => <button key={id} type="button" onClick={() => setActiveTopicId(id)} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900/40">{COMPLETE_DSA_ROADMAP.find((item) => item.id === id)?.title ?? id}</button>)}</div></div>}
          <div className="mt-5"><div className="text-xs font-semibold text-slate-500 mb-2">What you will learn</div><ul className="space-y-2">{activeTopic.subtopics.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300"><span className="text-sky-500">•</span>{item}</li>)}</ul></div>
          <div className="mt-5"><div className="text-xs font-semibold text-slate-500 mb-2">Problem signals</div><ul className="space-y-2">{activeTopic.recognition.map((item) => <li key={item} className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-2.5 text-xs text-slate-600 dark:text-slate-300">{item}</li>)}</ul></div>
          {activeTopic.pitfalls.length > 0 && <div className="mt-5"><div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">Common traps</div><ul className="space-y-1">{activeTopic.pitfalls.map((item) => <li key={item} className="text-xs text-slate-600 dark:text-slate-300">• {item}</li>)}</ul></div>}
        </section>
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"><h3 className="font-bold text-sm">Topic lesson sequence</h3><p className="text-xs text-slate-500 mt-1">Use this sequence for every topic.</p><ol className="mt-3 space-y-2">{LESSON_FLOW.map((step, index) => <li key={step} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300"><span className="w-5 h-5 shrink-0 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">{index + 1}</span><span>{step}</span></li>)}</ol></section>
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"><h3 className="font-bold text-sm">Mastery gate</h3><p className="text-xs text-slate-500 mt-1">Tick a gate only after doing it without reading the solution.</p><div className="mt-3 space-y-2">{MASTERY_CHECKLIST.map((gate) => { const checked = progress[activeTopic.id]?.gates.includes(gate) ?? false; return <button key={gate} type="button" onClick={() => toggleGate(activeTopic, gate)} className="w-full flex items-start gap-2.5 text-left rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800/70"><span className={`mt-0.5 ${checked ? 'text-emerald-500' : 'text-slate-300'}`}>{checked ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}</span><span className={`text-xs ${checked ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>{gate}</span></button>; })}</div><div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3 text-xs text-slate-500">Progress is saved in this browser. Reading or opening a topic does not count as mastery.</div></section>
      </div>
    </section>
  </div>;
}
