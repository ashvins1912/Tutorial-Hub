import { useMemo, useState } from 'react';
import { BookOpen, Code2, Cpu, Network } from 'lucide-react';
import { POLYGLOT_IMPLEMENTATIONS } from '../../data/fullStackArchitectureData';
import { POLYGLOT_DEEP_SPECS } from '../../data/fullStackDeepEnrichmentData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton } from '../ui';

export function PolyglotStackCodeLab() {
  const [selectedId, setSelectedId] = useState<string>(POLYGLOT_IMPLEMENTATIONS[0].id);

  const active = useMemo(
    () => POLYGLOT_IMPLEMENTATIONS.find((p) => p.id === selectedId) ?? POLYGLOT_IMPLEMENTATIONS[0],
    [selectedId]
  );
  const deepSpec = POLYGLOT_DEEP_SPECS[active.id];

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
      <div>
        <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
          Section 06 · 5-Paradigm Polyglot Implementations
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          Same Streaming AI Endpoint Across All 5 Computing Paradigms
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          Compare production-grade Server-Sent Events (SSE) token streaming, memory handoffs, and wire protocols across Python, Java 21 Spring Boot, Rust Axum/Tokio, TypeScript/Node.js, and POSIX Shell.
        </p>
      </div>

      {/* 5 Paradigm Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {POLYGLOT_IMPLEMENTATIONS.map((item) => {
          const isSelected = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`text-left rounded-xl border p-3.5 transition-colors ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold">
                {item.paradigm}
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {item.shortLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Paradigm Code + Wire & Memory Handoff Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {active.stack}
            </span>
            <CopyButton text={active.code} label="Copy Code" copiedLabel="Copied" size="xs" />
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-6 overflow-x-auto border border-slate-800">
            {active.code}
          </pre>
        </div>

        <div className="lg:col-span-5 space-y-3 text-xs leading-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Wire Protocol &amp; Gateway Interface
            </div>
            <p className="font-mono text-[11px] text-sky-800 dark:text-sky-300">
              {active.wireInterface}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              Memory Handoff &amp; Zero-Copy Path
            </div>
            <p className="text-slate-600 dark:text-slate-400">{active.memoryHandoff}</p>
          </div>

          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1.5">
            <div className="font-semibold text-emerald-800 dark:text-emerald-300">
              Why Production Teams Pick This Paradigm
            </div>
            <p className="text-slate-700 dark:text-slate-300">{active.whyThisStack}</p>
          </div>

          {deepSpec && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-1.5">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Complete Paradigm Definition &amp; Key Mechanism
              </div>
              <p className="text-slate-600 dark:text-slate-400">{deepSpec.formalDefinition}</p>
              <div className="pt-1 font-mono text-[11px] text-sky-700 dark:text-sky-400">
                Core Mechanism: {deepSpec.keyMechanism}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rendered Mermaid Wire & Memory Handoff DFD + Live Traffic Simulator */}
      {deepSpec && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <FlightMermaidViewer
            title={`${active.shortLabel} — Wire, Runtime & Memory Handoff DFD`}
            subtitle="End-to-end streaming data flow across socket buffers, runtime scheduler, and SSE token emission."
            mermaidCode={deepSpec.mermaidDfd}
            trafficDomain="system-design"
            compact
          />
          <LiveTrafficFlowSimulator
            mermaidCode={deepSpec.mermaidDfd}
            mermaidTitle={`${active.shortLabel} Streaming Pipeline`}
            domain="system-design"
            compact
            heading={`Live Token & Request Traffic Simulation — ${active.shortLabel}`}
          />
        </div>
      )}
    </section>
  );
}
