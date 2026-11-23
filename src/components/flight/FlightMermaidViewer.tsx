import React, { useEffect, useId, useRef, useState } from 'react';
import { Activity, Code2 } from 'lucide-react';
import type { FlightNodeData } from '../../data/flightSimulatorData';
import type { TrafficDomain } from '../../utils/liveTrafficTopology';
import { renderMermaidToSvgElement } from '../../utils/mermaidRenderer';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { CopyButton } from '../ui';

export interface FlightMermaidViewerProps {
  title: string;
  subtitle: string;
  mermaidCode: string;
  nodes?: FlightNodeData[];
  selectedNodeId?: string | null;
  onSelectNodeId?: (nodeId: string) => void;
  compact?: boolean;
  enableLiveTraffic?: boolean;
  trafficDomain?: TrafficDomain;
}

export const FlightMermaidViewer: React.FC<FlightMermaidViewerProps> = ({
  title,
  subtitle,
  mermaidCode,
  nodes = [],
  selectedNodeId,
  onSelectNodeId,
  compact = false,
  enableLiveTraffic = true,
  trafficDomain = 'mermaid',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showCode, setShowCode] = useState<boolean>(false);
  const [showLiveTraffic, setShowLiveTraffic] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const host = containerRef.current;
    if (!host) return;

    const render = async () => {
      try {
        setError(null);
        const imported = await renderMermaidToSvgElement(mermaidCode, {
          idPrefix: `flight-${uniqueId}`,
          isDark,
          maxHeight: compact ? '270px' : '420px',
        });
        if (cancelled || !containerRef.current) return;

        containerRef.current.replaceChildren(imported);

        if (nodes.length > 0 && onSelectNodeId) {
          const idPairs = nodes.map((n) => ({
            rawId: n.id,
            sanitized: n.id.replace(/[^a-zA-Z0-9_]/g, '_'),
            label: n.label,
          }));

          const renderedNodes = containerRef.current.querySelectorAll<SVGGElement>('.node');
          renderedNodes.forEach((el) => {
            const domId = el.id || '';
            const match = idPairs.find(
              (pair) =>
                domId.includes(`-${pair.sanitized}-`) ||
                domId.endsWith(`-${pair.sanitized}`) ||
                domId === pair.sanitized
            );
            if (!match) return;
            el.style.cursor = 'pointer';
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('data-flight-node', match.rawId);
            el.setAttribute('aria-label', `Inspect ${match.label}`);
            const activate = () => onSelectNodeId(match.rawId);
            el.addEventListener('click', activate);
            el.addEventListener('keydown', (evt) => {
              if (evt.key === 'Enter' || evt.key === ' ') {
                evt.preventDefault();
                activate();
              }
            });
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Mermaid render error');
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
    };
  }, [mermaidCode, isDark, uniqueId, nodes, onSelectNodeId, compact]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    host.querySelectorAll<SVGGElement>('[data-flight-node]').forEach((el) => {
      const nid = el.getAttribute('data-flight-node');
      const shape = el.querySelector<SVGElement>('rect, polygon, path, circle');
      if (!shape) return;
      if (nid === selectedNodeId) {
        shape.style.stroke = '#0284c7';
        shape.style.strokeWidth = '3px';
      } else {
        shape.style.stroke = '';
        shape.style.strokeWidth = '';
      }
    });
  }, [selectedNodeId, mermaidCode, isDark]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {enableLiveTraffic && (
            <button
              type="button"
              onClick={() => setShowLiveTraffic((v) => !v)}
              aria-pressed={showLiveTraffic}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                showLiveTraffic
                  ? 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:border-sky-500'
              }`}
            >
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              {showLiveTraffic ? 'Hide Live Traffic' : 'Live Traffic Flow'}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCode((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              showCode
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-sky-500'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
            {showCode ? 'Hide Mermaid Code' : 'Mermaid Source'}
          </button>
          <CopyButton text={mermaidCode} label="Copy Mermaid" />
        </div>
      </div>

      <div className={compact ? 'p-2.5 bg-slate-50/50 dark:bg-slate-950/70 overflow-x-auto' : 'p-4 bg-slate-50/50 dark:bg-slate-950/70 overflow-x-auto'}>
        {error ? (
          <div className="text-xs font-mono text-rose-600 dark:text-rose-400 p-3">{error}</div>
        ) : (
          <div
            ref={containerRef}
            className={compact ? 'min-w-0 flex items-center justify-center' : 'min-w-[680px] flex items-center justify-center'}
          />
        )}
      </div>

      {showLiveTraffic && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/40 dark:bg-slate-950/60">
          <LiveTrafficFlowSimulator
            mermaidCode={mermaidCode}
            mermaidTitle={title}
            domain={trafficDomain}
            compact
            allowPresetSwitcher={false}
            heading="Mermaid Live Traffic & Failover Simulator"
          />
        </div>
      )}

      {showCode && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-950 p-3.5">
          <pre className="text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
            {mermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
};
