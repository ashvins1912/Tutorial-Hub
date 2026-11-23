import { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Code2, Cpu, Gauge, Server } from 'lucide-react';
import {
  BACKEND_FRAMEWORKS,
  RUNTIME_VM_SPECS,
  type BackendFrameworkEntry,
} from '../../data/fullStackArchitectureData';
import { FRAMEWORK_DEEP_SPECS } from '../../data/fullStackDeepEnrichmentData';
import { FlightMermaidViewer } from '../flight/FlightMermaidViewer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton, SegmentedTabBar } from '../ui';

type WorkloadSim = 'sse-io' | 'cpu-heavy' | 'sync-bug-in-async';

export function FrameworkRuntimeMatrixLab() {
  const [selectedId, setSelectedId] = useState<string>(BACKEND_FRAMEWORKS[0].id);
  const [workload, setWorkload] = useState<WorkloadSim>('sse-io');
  const [concurrentConns, setConcurrentConns] = useState<number>(5000);

  const selected: BackendFrameworkEntry = useMemo(
    () => BACKEND_FRAMEWORKS.find((f) => f.id === selectedId) ?? BACKEND_FRAMEWORKS[0],
    [selectedId]
  );

  // Compute realistic live stress behavior for the selected framework × concurrency × workload
  const simResult = useMemo(() => {
    const estRamMb = Math.round(selected.baseMemoryMb + (concurrentConns * selected.kbPerConn) / 1024);

    if (workload === 'sse-io') {
      if (selected.concurrencyModel === 'Pre-Fork-GVL') {
        return {
          status: 'CRITICAL: Worker Pool Exhaustion',
          healthy: false,
          ramMb: estRamMb,
          p99LatencyMs: Math.round(1200 + concurrentConns * 1.4),
          explanation: `${selected.server} (${selected.gatewayInterface}) ties up 1 sync worker per open SSE stream. At ${concurrentConns.toLocaleString()} live streams, worker processes saturate instantly and Nginx returns HTTP 504.`,
        };
      }
      return {
        status: 'NOMINAL: High-Scale Non-Blocking / M:N',
        healthy: true,
        ramMb: estRamMb,
        p99LatencyMs: Math.max(8, Math.round(12 + (100 - selected.ioScalabilityScore) * 1.8)),
        explanation: `${selected.framework} on ${selected.server} parks idle sockets on ${
          selected.concurrencyModel === 'Virtual-Threads'
            ? 'heap continuations (unmounted carrier threads)'
            : 'epoll/kqueue non-blocking readiness queues'
        } — handling ${concurrentConns.toLocaleString()} concurrent streams smoothly.`,
      };
    }

    if (workload === 'sync-bug-in-async') {
      if (selected.concurrencyModel === 'Event-Loop') {
        return {
          status: 'OUTAGE: Event Loop Frozen Across All Users',
          healthy: false,
          ramMb: estRamMb,
          p99LatencyMs: 6400,
          explanation: `A single 200ms blocking call inside ${selected.framework}'s ${selected.server} event loop freezes every concurrent connection on that worker thread! Offload via to_thread / boundedElastic / worker_threads.`,
        };
      }
      return {
        status: 'CONTAINED: Other Workers / M:N Scheduler Keep Moving',
        healthy: true,
        ramMb: estRamMb,
        p99LatencyMs: 245,
        explanation: `${selected.concurrencyModel} isolates blocking calls across preemptive carriers/workers, though heavy I/O inside synchronized locks (Java 21) or small Puma/Gunicorn pools still needs discipline.`,
      };
    }

    // cpu-heavy
    if (selected.language.startsWith('Python') || selected.language.startsWith('Ruby') || selected.language.startsWith('TypeScript')) {
      return {
        status: 'BOTTLENECK: Single-Thread CPU / GIL Contention',
        healthy: false,
        ramMb: estRamMb,
        p99LatencyMs: Math.round(680 + concurrentConns * 0.25),
        explanation: `Heavy pure-language CPU loops contend on ${selected.runtime}. Offload to C++/Rust/CUDA native extensions (releasing GIL), separate worker queues (Celery/BullMQ), or Go/Rust/Java compute services.`,
      };
    }
    return {
      status: 'OPTIMAL: Multi-Core Native / JIT Scaling',
      healthy: true,
      ramMb: estRamMb,
      p99LatencyMs: Math.round(35 + concurrentConns * 0.01),
      explanation: `${selected.runtime} executes native/JIT code cleanly across all CPU cores with zero Global Interpreter Lock bottleneck.`,
    };
  }, [selected, workload, concurrentConns]);

  return (
    <div className="space-y-6">
      {/* Interactive Concurrency & Load Stress Simulator */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
              Sections 03 &amp; 04 · Interactive Framework × Server × Runtime Simulator
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              Compare All 10 Major Backend Frameworks Under Real Concurrency Loads
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Select any framework below and toggle traffic patterns to inspect its underlying server, gateway interface (ASGI/WSGI/Servlet/Rack/Tower), and live concurrency behavior.
            </p>
          </div>

          <SegmentedTabBar<WorkloadSim>
            ariaLabel="Simulated backend workload"
            activeTab={workload}
            onChange={setWorkload}
            size="xs"
            tabs={[
              { id: 'sse-io', label: 'Streaming I/O (SSE)' },
              { id: 'sync-bug-in-async', label: 'Blocking Call Bug' },
              { id: 'cpu-heavy', label: 'Heavy CPU Compute' },
            ]}
          />
        </div>

        {/* 10 Framework Selector Cards (2 balanced rows of 5 on xl) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {BACKEND_FRAMEWORKS.map((fw) => {
            const active = fw.id === selected.id;
            return (
              <button
                key={fw.id}
                type="button"
                onClick={() => setSelectedId(fw.id)}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-sky-700 dark:text-sky-400 font-semibold truncate">
                  {fw.language}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                  {fw.framework}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {fw.server.split(' ')[0]} · {fw.gatewayInterface.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Framework Deep Dive + Live Concurrency Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3 text-xs leading-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                {selected.framework}
              </div>
              <span className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400">
                {selected.concurrencyModel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[11px]">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">App Server</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selected.server}</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5">
                <div className="text-slate-500 dark:text-slate-400">Gateway Interface</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selected.gatewayInterface}</div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 sm:col-span-2">
                <div className="text-slate-500 dark:text-slate-400">Host Runtime / VM</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{selected.runtime}</div>
              </div>
            </div>

            <div>
              <strong className="text-slate-900 dark:text-slate-100">Internal Request Pipeline:</strong>{' '}
              <span className="font-mono text-[11px] text-sky-800 dark:text-sky-300">
                {selected.internalPipeline}
              </span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-slate-100">Ideal Production Use:</strong>{' '}
              <span className="text-slate-600 dark:text-slate-400">{selected.idealWorkload}</span>
            </div>
            <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-3 text-rose-900 dark:text-rose-200">
              <strong>Critical Production Trap:</strong> {selected.criticalTrap}
            </div>
          </div>

          {/* Right 5 Cols: Live Load Stress Readout */}
          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <label htmlFor="fw-conns" className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  Concurrent Open Connections
                </label>
                <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                  {concurrentConns.toLocaleString()}
                </span>
              </div>
              <input
                id="fw-conns"
                type="range"
                min={100}
                max={25000}
                step={100}
                value={concurrentConns}
                onChange={(e) => setConcurrentConns(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Est. Process RAM</div>
                <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {simResult.ramMb.toLocaleString()} MB
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Est. p99 Overhead</div>
                <div
                  className={`text-lg font-mono font-bold tabular-nums mt-0.5 ${
                    simResult.healthy
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {simResult.p99LatencyMs.toLocaleString()} ms
                </div>
              </div>
            </div>

            <div
              className={`rounded-lg border p-3.5 text-xs space-y-1.5 ${
                simResult.healthy
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                {simResult.healthy ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>{simResult.status}</span>
              </div>
              <p className="leading-5">{simResult.explanation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Framework Formal Definition, Concurrency Algorithm Code, Mermaid DFD & Live Traffic */}
      {(() => {
        const fwSpec = FRAMEWORK_DEEP_SPECS[selected.id];
        if (!fwSpec) return null;
        return (
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                  Framework Architecture Definition &amp; Concurrency Algorithm
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                  {selected.framework} — {fwSpec.algorithmName}
                </h3>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">Formal Definition: </strong>
                  {fwSpec.formalDefinition}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900">
                    <span className="text-[11px] font-mono text-slate-300">
                      Core Concurrency Implementation ({fwSpec.algorithmLanguage})
                    </span>
                    <CopyButton text={fwSpec.algorithmCode} label="Copy Code" copiedLabel="Copied" size="xs" />
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-sky-200 leading-5 overflow-x-auto">
                    {fwSpec.algorithmCode}
                  </pre>
                </div>

                <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-2.5">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Deep Implementation Walkthrough
                  </div>
                  <ol className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-5 list-decimal list-inside">
                    {fwSpec.implementationWalkthrough.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <FlightMermaidViewer
              title={`${selected.framework} — Request Dispatch & Runtime DFD (Mermaid.js)`}
              subtitle={`Visualizing how ${selected.server} (${selected.gatewayInterface}) routes sockets into ${selected.runtime}.`}
              mermaidCode={fwSpec.mermaidDfd}
              trafficDomain="system-design"
              compact
            />

            <LiveTrafficFlowSimulator
              mermaidCode={fwSpec.mermaidDfd}
              mermaidTitle={`${selected.framework} Request Pipeline`}
              domain="system-design"
              compact
              heading={`Live Request Traffic Simulation — ${selected.framework}`}
            />
          </div>
        );
      })()}

      {/* Host Virtual Machines & Runtimes Comparison Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Host Runtimes, Virtual Machines &amp; Native AI Interop Matrix
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Runtime / VM</th>
                <th className="py-2.5 px-3">Execution &amp; JIT</th>
                <th className="py-2.5 px-3">Memory &amp; GC</th>
                <th className="py-2.5 px-3">Concurrency Model</th>
                <th className="py-2.5 px-3">Native AI / C++ Interop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {RUNTIME_VM_SPECS.map((vm) => (
                <tr key={vm.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {vm.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{vm.executionEngine}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{vm.memoryAndGc}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{vm.concurrencyPrimitive}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-sky-700 dark:text-sky-400">
                    {vm.nativeAiInterop}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edge Reverse Proxies & Async Workers Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs leading-5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Edge Reverse Proxies &amp; API Gateways (Nginx · Envoy · Caddy · HAProxy · Kong)
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Terminate TLS 1.3 and HTTP/3 QUIC, protect app servers from slow-client socket stalls, enforce token-bucket rate limits, and disable buffering (<code className="font-mono">proxy_buffering off</code>) on SSE/gRPC token streams.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Async Brokers &amp; Distributed Workers (Kafka · RabbitMQ · Celery · BullMQ · Temporal · Ray)
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Decouple multi-minute fine-tuning, bulk document embeddings, and PDF ingestion from synchronous HTTP gateways. Use <strong>Temporal</strong> for durable multi-step agent retries and <strong>Ray</strong> for multi-node GPU actor orchestration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
