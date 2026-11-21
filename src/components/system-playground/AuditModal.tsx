import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Info,
  ShieldCheck,
  Wand2,
  X,
} from 'lucide-react';
import { useSystemStore } from '../../store/useSystemStore';
import { formatRps } from './iconMap';
import { OverlayDialog } from '../ui';

interface AuditModalProps {
  onFocusNodes: (nodeIds: string[]) => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ onFocusNodes }) => {
  const isOpen = useSystemStore((s) => s.isAuditModalOpen);
  const report = useSystemStore((s) => s.auditReport);
  const nodes = useSystemStore((s) => s.nodes);
  const closeAuditModal = useSystemStore((s) => s.closeAuditModal);
  const applyAutoFix = useSystemStore((s) => s.applyAutoFix);

  if (!isOpen || !report) return null;

  const nodeLabelMap = new Map(nodes.map((n) => [n.id, n.data.label]));

  const gradeRingClass =
    report.grade === 'S' || report.grade === 'A'
      ? 'border-emerald-500 text-emerald-300 bg-emerald-500/15'
      : report.grade === 'B' || report.grade === 'C'
        ? 'border-amber-500 text-amber-300 bg-amber-500/15'
        : 'border-rose-500 text-rose-300 bg-rose-500/15';

  const categories: { label: string; score: number }[] = [
    { label: 'High Availability (25%)', score: report.categoryScores.highAvailability },
    { label: 'Scalability (25%)', score: report.categoryScores.scalability },
    { label: 'Performance (20%)', score: report.categoryScores.performance },
    { label: 'Security (15%)', score: report.categoryScores.security },
    { label: 'Observability (15%)', score: report.categoryScores.observability },
  ];

  return (
    <OverlayDialog
      open={isOpen}
      onClose={closeAuditModal}
      ariaLabel="Smart Architecture Judge Report"
      maxWidthClass="max-w-3xl"
      backdropClassName="bg-slate-950/80 backdrop-blur-xs"
      panelClassName="rounded-2xl border border-slate-700 bg-slate-900 text-slate-100"
    >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" aria-hidden="true" />
            <div>
              <h2 id="audit-modal-title" className="text-base font-display font-bold text-slate-50">
                Smart Architecture Judge Report
              </h2>
              <p className="text-xs text-slate-400 font-mono tabular-nums">
                {report.nodeCount} nodes · {report.edgeCount} edges · {formatRps(report.totalEntryRps)} RPS evaluated
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuditModal}
            aria-label="Close audit report"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Scorecard Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center p-4 rounded-xl border border-slate-800 bg-slate-950/70">
            <div className="md:col-span-4 flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${gradeRingClass}`}
              >
                <span className="text-3xl font-display font-bold leading-none">{report.grade}</span>
                <span className="text-[11px] font-mono tabular-nums mt-1">
                  {report.overallScore}/100
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-100">
                  {report.findings.length === 0
                    ? 'Production Ready'
                    : `${report.findings.length} Finding${report.findings.length === 1 ? '' : 's'}`}
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  8 heuristic distributed-systems checks scored live.
                </p>
              </div>
            </div>

            <div className="md:col-span-8 space-y-2.5">
              {categories.map((cat) => (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{cat.label}</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-100">
                      {cat.score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        cat.score >= 85
                          ? 'bg-emerald-500'
                          : cat.score >= 65
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings List */}
          {report.findings.length === 0 ? (
            <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-emerald-200">
                  Zero Architectural Anti-Patterns Detected
                </h3>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  No Single Points of Failure, database thrashing, unprotected ingress, or missing
                  observability blindspots found at {formatRps(report.totalEntryRps)} RPS. Try
                  triggering the 10x Traffic Spike or taking a node OFFLINE to stress-test resilience.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300">
                Actionable Findings &amp; One-Click Auto-Fixes
              </h3>

              {report.findings.map((finding) => {
                const isCritical = finding.severity === 'CRITICAL';
                const isWarn = finding.severity === 'WARNING';
                const SevIcon = isCritical ? AlertOctagon : isWarn ? AlertTriangle : Info;
                const borderColor = isCritical
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : isWarn
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-cyan-500/40 bg-cyan-500/5';
                const sevTextColor = isCritical
                  ? 'text-rose-400'
                  : isWarn
                    ? 'text-amber-400'
                    : 'text-cyan-400';

                return (
                  <div
                    key={finding.id}
                    className={`rounded-xl border p-4 space-y-2.5 ${borderColor}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className={`flex items-center gap-1.5 text-[11px] font-mono font-semibold ${sevTextColor}`}>
                          <SevIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>{finding.severity}</span>
                          <span aria-hidden="true">·</span>
                          <span>-{finding.pointDeduction} pts</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-100">{finding.title}</h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {finding.affectedNodeIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              onFocusNodes(finding.affectedNodeIds);
                              closeAuditModal();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-medium text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
                          >
                            <Crosshair className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Locate</span>
                          </button>
                        )}

                        {finding.autoFixAction && (
                          <button
                            type="button"
                            onClick={() => applyAutoFix(finding.autoFixAction!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                          >
                            <Wand2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{finding.autoFixAction.label}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{finding.explanation}</p>
                    <p className="text-xs text-slate-200">
                      <strong className="text-sky-300 font-semibold">Recommendation: </strong>
                      {finding.recommendation}
                    </p>

                    {finding.affectedNodeIds.length > 0 && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Affected:{' '}
                        {finding.affectedNodeIds
                          .map((id) => nodeLabelMap.get(id) ?? id)
                          .join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-end">
          <button
            type="button"
            onClick={closeAuditModal}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
    </OverlayDialog>
  );
};
