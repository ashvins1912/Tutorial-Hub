import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Cpu,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  DEVOPS_CLOUD_DEEP_TOPICS,
  type DevOpsDeepTopicCategory,
} from '../../data/devopsCloudDeepGapsData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { CopyButton } from '../ui';

const CATEGORIES: ('All' | DevOpsDeepTopicCategory)[] = [
  'All',
  'Kubernetes & Scaling',
  'Networking & Mesh',
  'IaC & Reliability',
  'Security & FinOps',
];

export const DevOpsCloudDeepVisualLab: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [category, setCategory] = useState<'All' | DevOpsDeepTopicCategory>('All');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(DEVOPS_CLOUD_DEEP_TOPICS[0].id);
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const filteredTopics = useMemo(
    () =>
      category === 'All'
        ? DEVOPS_CLOUD_DEEP_TOPICS
        : DEVOPS_CLOUD_DEEP_TOPICS.filter((t) => t.category === category),
    [category]
  );

  const activeTopic = useMemo(
    () =>
      filteredTopics.find((t) => t.id === selectedTopicId) ??
      filteredTopics[0] ??
      DEVOPS_CLOUD_DEEP_TOPICS[0],
    [filteredTopics, selectedTopicId]
  );

  useEffect(() => {
    setStepIdx(0);
  }, [activeTopic.id]);

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % activeTopic.steps.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [isPlaying, prefersReducedMotion, activeTopic.steps.length]);

  const activeStep = activeTopic.steps[stepIdx] ?? activeTopic.steps[0];
  const visitedNodeIds = useMemo(
    () => activeTopic.steps.slice(0, stepIdx).map((s) => s.nodeId),
    [activeTopic.steps, stepIdx]
  );

  const mermaidCode = useMemo(
    () => activeTopic.buildMermaid(activeStep.nodeId, visitedNodeIds),
    [activeTopic, activeStep.nodeId, visitedNodeIds]
  );

  return (
    <div className="space-y-5">
      {/* Header + Category Filter */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                Staff DevOps &amp; Cloud Internals Visual Lab
              </span>
              <span aria-hidden="true">·</span>
              <span>{DEVOPS_CLOUD_DEEP_TOPICS.length} Production Gap Modules</span>
              <span aria-hidden="true">·</span>
              <span>Live Animated Flows + Mermaid Architecture</span>
            </div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              Kubernetes Scaling, Service Mesh mTLS, IaC State, VPC Networking, OTel SLOs, Multi-Region DR &amp; FinOps
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              Every module pairs an interactive step-by-step animated simulator with live-highlighted Mermaid.js diagrams, AWS/GCP/Open-Source mappings, and copyable production configs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shrink-0 self-start">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {filteredTopics.map((topic) => {
            const active = topic.id === activeTopic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopicId(topic.id)}
                className={`text-left rounded-xl border p-3 transition-colors space-y-1 ${
                  active
                    ? 'border-sky-500 bg-sky-50/75 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-sky-700 dark:text-sky-400 font-semibold truncate">
                    {topic.category}
                  </span>
                  <span>{topic.difficulty}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                  {topic.title}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Topic Visual Animation Stage + Live Mermaid Diagram */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="text-sky-700 dark:text-sky-400 font-semibold">{activeTopic.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeTopic.difficulty} Level</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Step {stepIdx + 1} / {activeTopic.steps.length}
              </span>
            </div>
            <h4 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
              {activeTopic.title}
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
              {activeTopic.plainEnglish}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-5">
              <strong className="text-slate-700 dark:text-slate-200">Formal Definition:</strong>{' '}
              {activeTopic.formalDefinition}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-sky-500 whitespace-nowrap"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {isPlaying ? 'Pause Animation' : 'Animate Flow'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx((prev) => (prev - 1 + activeTopic.steps.length) % activeTopic.steps.length);
              }}
              aria-label="Previous step"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx((prev) => (prev + 1) % activeTopic.steps.length);
              }}
              aria-label="Next step"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setStepIdx(0);
              }}
              aria-label="Reset animation"
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 text-slate-700 dark:text-slate-300 hover:border-sky-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Interactive Animated Stage Track */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {activeTopic.steps.map((st, idx) => {
              const isCurrent = idx === stepIdx;
              const isVisited = idx < stepIdx;
              return (
                <React.Fragment key={st.nodeId}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setStepIdx(idx);
                    }}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-600 text-white'
                        : isVisited
                          ? 'border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-mono opacity-85">
                      Step {st.step} · {st.metricBadge}
                    </div>
                    <div className="text-xs font-semibold mt-0.5">{st.label}</div>
                  </button>
                  {idx < activeTopic.steps.length - 1 && (
                    <ArrowRight
                      className={`w-4 h-4 shrink-0 ${
                        isVisited || isCurrent
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTopic.id}-${activeStep.step}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.16 }}
              className="rounded-xl border border-sky-200 dark:border-sky-900/70 bg-sky-50/40 dark:bg-sky-950/20 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"
            >
              <div className="lg:col-span-8 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  <span>Active Stage {activeStep.step}: {activeStep.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeStep.metricBadge}</span>
                </div>
                <p className="text-sm text-slate-900 dark:text-slate-100 leading-6">
                  {activeStep.summary}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-5">
                  <strong className="text-slate-800 dark:text-slate-200">Under the Hood:</strong>{' '}
                  {activeStep.internalsDetail}
                </p>
              </div>
              <div className="lg:col-span-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-emerald-300 space-y-1">
                <div className="text-slate-400 text-[10px]">Live Runtime State Snapshot</div>
                <div className="leading-relaxed break-words">{activeStep.stateSnapshot}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live Highlighted Mermaid.js Flow + Cloud Mapping + Production Config */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <div className="xl:col-span-7 space-y-4">
            <FlightMermaidViewer
              title={`${activeTopic.title} — Live Highlighted Mermaid Flow`}
              subtitle={`Emerald = completed stages · Sky Blue = active stage (${activeStep.label})`}
              mermaidCode={mermaidCode}
              compact={false}
            />

            {/* AWS vs GCP vs Open-Source / In-House Mapping */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="font-mono font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
                  AWS Stack
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-5">{activeTopic.awsMapping}</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="font-mono font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
                  GCP Stack
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-5">{activeTopic.gcpMapping}</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
                <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                  Open-Source / On-Prem
                </div>
                <div className="text-slate-700 dark:text-slate-300 leading-5">{activeTopic.openSourceMapping}</div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 space-y-4">
            {/* Why This Gap Matters */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                Why Engineers Miss This in Production
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeTopic.whyGapMatters}
              </p>
            </div>

            {/* Copyable Production YAML / Terraform */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-300">
                  {activeTopic.productionSnippetTitle}
                </span>
                <CopyButton text={activeTopic.productionSnippet} label="Copy" />
              </div>
              <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                {activeTopic.productionSnippet}
              </pre>
            </div>

            {/* Real Failure Modes & Mitigations */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-4 space-y-3">
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                Production Failure Modes &amp; SRE Mitigations
              </div>
              {activeTopic.failureModes.map((fm) => (
                <div
                  key={fm.symptom}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3 space-y-1 text-xs"
                >
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{fm.symptom}</div>
                  <div className="text-slate-600 dark:text-slate-400">
                    <strong>Root Cause:</strong> {fm.rootCause}
                  </div>
                  <div className="text-emerald-800 dark:text-emerald-300">
                    <strong>Mitigation:</strong> {fm.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
