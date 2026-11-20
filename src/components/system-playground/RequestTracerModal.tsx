import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Send,
  X,
  XCircle,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';

export const RequestTracerModal: React.FC = () => {
  const isOpen = useSystemStore((s) => s.isTraceModalOpen);
  const trace = useSystemStore((s) => s.lastTraceResult);
  const closeTraceModal = useSystemStore((s) => s.closeTraceModal);
  const runRequestTrace = useSystemStore((s) => s.runRequestTrace);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trace) return null;

  const isSuccess = trace.httpStatus >= 200 && trace.httpStatus < 300;
  const isWarn = trace.httpStatus === 429;
  const jsonText = JSON.stringify(
    {
      status: `${trace.httpStatus} ${trace.httpStatusText}`,
      totalLatencyMs: trace.totalLatencyMs,
      headers: trace.responsePayload.headers,
      body: trace.responsePayload.body,
    },
    null,
    2,
  );

  const handleCopy = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(jsonText).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trace-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
            ) : isWarn ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <h2 id="trace-modal-title" className="text-sm font-display font-bold text-slate-50 truncate">
                Traced Request → {trace.targetLabel}
              </h2>
              <div className="text-xs font-mono tabular-nums flex items-center gap-2 mt-0.5">
                <span
                  className={
                    isSuccess
                      ? 'text-emerald-400 font-semibold'
                      : isWarn
                        ? 'text-amber-400 font-semibold'
                        : 'text-rose-400 font-semibold'
                  }
                >
                  HTTP {trace.httpStatus} {trace.httpStatusText}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300">Total {trace.totalLatencyMs} ms</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400">{trace.hops.length} hops</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeTraceModal}
            aria-label="Close request tracer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Hop-by-Hop Waterfall */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-300">Hop-by-Hop Execution Path</h3>
            <div className="space-y-1.5">
              {trace.hops.map((hop, idx) => {
                const failed =
                  hop.outcome === 'FAILED' ||
                  hop.outcome === 'OVERLOADED' ||
                  hop.outcome === 'RATE_LIMITED';
                const degraded = hop.outcome === 'DEGRADED';

                return (
                  <div
                    key={`${hop.nodeId}-${idx}`}
                    className={`rounded-xl border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      failed
                        ? 'border-rose-500/50 bg-rose-500/10'
                        : degraded
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-slate-800 bg-slate-950/70'
                    }`}
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                        <span className="font-mono text-slate-500">{idx + 1}.</span>
                        <span className="truncate">{hop.label}</span>
                        {idx < trace.hops.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{hop.note}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0">
                      <span className="text-slate-300">{hop.latencyMs}ms</span>
                      <span
                        className={`font-semibold ${
                          failed
                            ? 'text-rose-400'
                            : degraded
                              ? 'text-amber-400'
                              : hop.outcome === 'CACHE_HIT'
                                ? 'text-sky-400'
                                : 'text-emerald-400'
                        }`}
                      >
                        {hop.outcome}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mock JSON Payload Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-slate-300">
                Mock HTTP Response / Error Payload
              </h3>
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-700 bg-slate-950 text-[11px] font-medium text-slate-300 hover:border-sky-500"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" aria-hidden="true" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
              {jsonText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => runRequestTrace(trace.targetNodeId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-colors"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Re-Send Packet</span>
          </button>
          <button
            type="button"
            onClick={closeTraceModal}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
