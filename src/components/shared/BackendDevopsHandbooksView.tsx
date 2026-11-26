import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Cpu,
  Database,
  HelpCircle,
  Play,
  RotateCcw,
  Server,
  Zap,
} from 'lucide-react';
import {
  DOCKER_HANDBOOK_CHAPTERS,
  DOCKER_VM_VS_CONTAINER,
  NODEJS_INTERNALS_CHAPTERS,
  SPRING_JPA_CHAPTERS,
  type BackendHandbookChapter,
} from '../../data/backendDevopsHandbooksData';
import { useAccountState } from '../../hooks/useAccountState';
import { LineByLineCodeStudio } from './LineByLineCodeStudio';

export type BackendDevopsTrackId =
  | 'spring-jpa'
  | 'nodejs-internals'
  | 'docker-handbook'
  | 'process-vs-thread';

export interface BackendDevopsHandbooksViewProps {
  initialTrack?: BackendDevopsTrackId;
}

const TRACK_META: {
  id: BackendDevopsTrackId;
  label: string;
  icon: typeof Database;
  tagline: string;
}[] = [
  {
    id: 'spring-jpa',
    label: 'Spring Data JPA & Hibernate',
    icon: Database,
    tagline: 'Entity Lifecycle, Relationships, JPQL, @Transactional, Auditing & N+1 Fixes',
  },
  {
    id: 'nodejs-internals',
    label: 'Node.js Internals',
    icon: Server,
    tagline: 'V8 Ignition/TurboFan, 6-Phase Event Loop, Microtasks, Libuv Pool & Generational GC',
  },
  {
    id: 'docker-handbook',
    label: 'Docker Complete Handbook',
    icon: Box,
    tagline: 'VM vs Container, Namespaces/cgroups, Multi-Stage Builds (850MB→180MB) & Security',
  },
  {
    id: 'process-vs-thread',
    label: 'Process vs Thread Simulator',
    icon: Cpu,
    tagline: 'Interactive Memory Isolation vs Shared Memory Crash Lab',
  },
];

/* -------------------------------------------------------------------------- */
/* Interactive Process vs Thread Crash & Memory Simulator                     */
/* -------------------------------------------------------------------------- */
const ProcessVsThreadSimulator: React.FC = () => {
  const [procCounts, setProcCounts] = useState<[number, number, number]>([28, 28, 28]);
  const [procCrashed, setProcCrashed] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);
  const [sharedCount, setSharedCount] = useState<number>(84);
  const [threadProcessCrashed, setThreadProcessCrashed] = useState<boolean>(false);
  const [raceDetected, setRaceDetected] = useState<boolean>(false);

  const handleTickAll = () => {
    setProcCounts(([p1, p2, p3]) => [
      procCrashed[0] ? p1 : p1 + 1,
      procCrashed[1] ? p2 : p2 + 1,
      procCrashed[2] ? p3 : p3 + 1,
    ]);
    if (!threadProcessCrashed) {
      // Simulate 3 threads updating shared memory simultaneously (occasional lost update race)
      setSharedCount((c) => c + 3);
      setRaceDetected(false);
    }
  };

  const handleSimulateRace = () => {
    if (threadProcessCrashed) return;
    // 3 threads read the same count=X simultaneously and write X+1 instead of X+3
    setSharedCount((c) => c + 1);
    setRaceDetected(true);
  };

  const handleCrashWorker2 = () => {
    setProcCrashed(([p1, , p3]) => [p1, true, p3]);
    setThreadProcessCrashed(true);
  };

  const handleReset = () => {
    setProcCounts([28, 28, 28]);
    setProcCrashed([false, false, false]);
    setSharedCount(84);
    setThreadProcessCrashed(false);
    setRaceDetected(false);
  };

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
              OS Concurrency Visual Lab · Isolation vs Shared State
            </div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              Processes Isolate Memory. Threads Share It.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Trigger a crash in Worker #2 and compare what survives on the Process side vs the
              Thread side.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTickAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Tick Counters (+1)
            </button>
            <button
              type="button"
              onClick={handleSimulateRace}
              disabled={threadProcessCrashed}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/35 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:border-amber-500 disabled:opacity-45 whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5" aria-hidden="true" />
              Simulate Race Condition
            </button>
            <button
              type="button"
              onClick={handleCrashWorker2}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs font-semibold hover:border-rose-500 whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Crash Worker #2
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {/* Side-by-Side Visual Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: 3 PROCESSES · 1 THREAD EACH */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  PROCESS Model
                </h4>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  3 Processes · 1 Thread Each · Separate Isolated Memory
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                Fault Isolated
              </span>
            </div>

            <div className="space-y-2.5">
              {[0, 1, 2].map((idx) => {
                const dead = procCrashed[idx];
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border p-3.5 flex items-center justify-between transition-colors ${
                      dead
                        ? 'border-rose-400 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
                        : 'border-amber-300 dark:border-amber-800/70 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-mono text-sm font-bold ${
                          dead
                            ? 'border-rose-500 text-rose-700 dark:text-rose-300'
                            : 'border-amber-500 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100">
                          PROCESS {idx + 1} ·{' '}
                          <span
                            className={
                              dead
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }
                          >
                            {dead ? 'CRASHED' : 'RUNNING'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {dead
                            ? 'Memory space reclaimed by OS — siblings unaffected'
                            : 'Own private heap & stack memory'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-right">
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        count
                      </div>
                      <div className="text-base font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {dead ? '--' : procCounts[idx]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: 1 PROCESS · 3 THREADS SHARING MEMORY */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  THREAD Model
                </h4>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  1 Process · 3 Threads · One Shared Heap Memory
                </div>
              </div>
              <span
                className={`text-xs font-mono font-semibold ${
                  threadProcessCrashed
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-indigo-700 dark:text-indigo-400'
                }`}
              >
                {threadProcessCrashed ? 'ENTIRE PROCESS CRASHED' : 'Shared Heap Active'}
              </span>
            </div>

            <div
              className={`rounded-xl border-2 p-5 space-y-4 flex-1 flex flex-col justify-between transition-colors ${
                threadProcessCrashed
                  ? 'border-rose-400 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/25'
                  : 'border-indigo-300 dark:border-indigo-800/70 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  Shared Heap Variable (`count`)
                </div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-right">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    shared count
                  </div>
                  <div className="text-2xl font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                    {threadProcessCrashed ? 'DEAD' : sharedCount}
                  </div>
                </div>
              </div>

              {raceDetected && !threadProcessCrashed && (
                <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                  Race Condition! All 3 threads read the same value before writing, so 2 increments
                  were silently lost (+1 instead of +3). Fix with a Mutex Lock or Atomic Integer.
                </div>
              )}

              {threadProcessCrashed ? (
                <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-white/80 dark:bg-slate-950/70 p-4 text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
                  <strong>Unhandled Crash in Thread #2:</strong> Because Thread 1, Thread 2, and
                  Thread 3 all live inside ONE shared OS process memory space, an unhandled segfault
                  or OutOfMemory crash in Thread #2 immediately kills Thread #1 and Thread #3 too!
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {[1, 2, 3].map((t) => (
                    <div
                      key={t}
                      className="rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-3 text-center"
                    >
                      <div className="text-sm font-mono font-bold text-indigo-700 dark:text-indigo-300">
                        T{t}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Running
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plain-Language Indian Real-World Takeaway */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              When to Pick Processes
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Chrome browser tabs, Nginx worker processes, and Docker containers—if 1 tab crashes or
              hangs, your other 19 tabs stay completely alive.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              When to Pick Threads
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Java Spring Boot Tomcat worker threads or game engines where workers must share
              in-memory caches quickly with ultra-low context-switch overhead.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Golden Interview One-Liner
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Processes give safety and memory isolation (heavier creation + IPC needed); Threads
              give speed and easy shared memory (lighter, but need locks to avoid race conditions).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Unified Handbook Component                                            */
/* -------------------------------------------------------------------------- */
export const BackendDevopsHandbooksView: React.FC<BackendDevopsHandbooksViewProps> = ({
  initialTrack = 'spring-jpa',
}) => {
  const [activeTrack, setActiveTrack] = useState<BackendDevopsTrackId>(initialTrack);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(() => {
    if (initialTrack === 'nodejs-internals') return NODEJS_INTERNALS_CHAPTERS[0].id;
    if (initialTrack === 'docker-handbook') return DOCKER_HANDBOOK_CHAPTERS[0].id;
    return SPRING_JPA_CHAPTERS[0].id;
  });

  const [completedIds, setCompletedIds] = useAccountState<string[]>(
    'backend-devops-handbooks-done',
    [],
    'patternforge_backend_devops_handbooks_v1'
  );

  const chapters: BackendHandbookChapter[] = useMemo(() => {
    if (activeTrack === 'spring-jpa') return SPRING_JPA_CHAPTERS;
    if (activeTrack === 'nodejs-internals') return NODEJS_INTERNALS_CHAPTERS;
    if (activeTrack === 'docker-handbook') return DOCKER_HANDBOOK_CHAPTERS;
    return [];
  }, [activeTrack]);

  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) ?? chapters[0] ?? null;

  const handleTrackChange = (next: BackendDevopsTrackId) => {
    setActiveTrack(next);
    if (next === 'spring-jpa') setSelectedChapterId(SPRING_JPA_CHAPTERS[0].id);
    else if (next === 'nodejs-internals') setSelectedChapterId(NODEJS_INTERNALS_CHAPTERS[0].id);
    else if (next === 'docker-handbook') setSelectedChapterId(DOCKER_HANDBOOK_CHAPTERS[0].id);
  };

  const toggleDone = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const currentTrackMeta = TRACK_META.find((t) => t.id === activeTrack) ?? TRACK_META[0];

  return (
    <div className="space-y-5">
      {/* Header & Track Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
            Backend, Runtime &amp; DevOps Plain-Language Handbooks
          </div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
            Spring Data JPA, Node.js Internals, Docker &amp; Process vs Thread Lab
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {currentTrackMeta.tagline}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Backend and DevOps Handbook tracks"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
        >
          {TRACK_META.map((tab) => {
            const Icon = tab.icon;
            const selected = tab.id === activeTrack;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => handleTrackChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  selected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {activeTrack === 'process-vs-thread' ? (
        <ProcessVsThreadSimulator />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Chapter Rail */}
          <aside className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden lg:sticky lg:top-20">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {currentTrackMeta.label}
              </span>
              <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {chapters.length} chapters
              </span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {chapters.map((ch) => {
                const selected = ch.id === activeChapter?.id;
                const done = completedIds.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setSelectedChapterId(ch.id)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start justify-between gap-2 ${
                      selected
                        ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div
                        className={`text-[11px] font-mono ${
                          selected
                            ? 'text-sky-300 dark:text-sky-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        Chapter {ch.number}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold leading-snug mt-0.5">
                        {ch.title}
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
            </div>
          </aside>

          {/* Right Chapter Body */}
          {activeChapter && (
            <article className="lg:col-span-8 space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                      Chapter {activeChapter.number} · {activeChapter.subtitle}
                    </div>
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                      {activeChapter.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleDone(activeChapter.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start ${
                      completedIds.includes(activeChapter.id)
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {completedIds.includes(activeChapter.id) ? 'Revised' : 'Mark Revised'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm leading-relaxed">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      What It Is
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{activeChapter.whatItIs}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Why We Need It
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{activeChapter.whyWeNeedIt}</p>
                  </div>
                </div>

                {activeChapter.formulaOrSpec && (
                  <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/60 dark:bg-sky-950/30 px-4 py-3 font-mono text-xs text-sky-900 dark:text-sky-200 overflow-x-auto">
                    {activeChapter.formulaOrSpec}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    How It Works Step-by-Step
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc pl-5">
                    {activeChapter.howItWorks.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Docker VM vs Container comparison table on Docker Chapter 01 */}
                {activeChapter.id === 'docker-architecture-primitives' && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Virtual Machine vs Docker Container — At a Glance
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <th className="py-2 px-3 font-semibold">Dimension</th>
                            <th className="py-2 px-3 font-semibold">Virtual Machine</th>
                            <th className="py-2 px-3 font-semibold">Docker Container</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {DOCKER_VM_VS_CONTAINER.map((row) => (
                            <tr key={row.dimension}>
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                {row.dimension}
                              </td>
                              <td className="py-2 px-3">{row.left}</td>
                              <td className="py-2 px-3">{row.right}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm leading-relaxed">
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/25 p-4 space-y-1">
                    <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                      Relatable Indian Analogy / Example
                    </div>
                    <p className="text-slate-700 dark:text-slate-200">
                      {activeChapter.indianExample}
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/25 p-4 space-y-1">
                    <div className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                      Common Production Traps
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-700 dark:text-slate-200">
                      {activeChapter.commonPitfalls.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    Quick-Revision Key Takeaways
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                    {activeChapter.keyTakeaways.map((kt, i) => (
                      <li key={i}>{kt}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <HelpCircle
                      className="w-4 h-4 text-sky-600 dark:text-sky-400"
                      aria-hidden="true"
                    />
                    Interview Questions
                  </h4>
                  {activeChapter.interviewQa.map((qa, i) => (
                    <div
                      key={i}
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

              {activeChapter.codeExample && (
                <LineByLineCodeStudio
                  rawCode={activeChapter.codeExample.code}
                  initialLanguage={activeChapter.codeExample.language}
                  title={activeChapter.codeExample.title}
                  subtitle="Step through every line to understand the production pattern"
                  contextHint={activeChapter.codeExample.contextHint}
                  compact
                />
              )}
            </article>
          )}
        </div>
      )}
    </div>
  );
};
