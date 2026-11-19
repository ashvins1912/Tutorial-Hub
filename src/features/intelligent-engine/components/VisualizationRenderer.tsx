import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';

export type LessonVisual = {
  id: string;
  title: string;
  type: string;
  description: string;
  source: string;
  steps?: Array<{ title: string; explanation: string; state?: Record<string, unknown> }>;
};

type GraphNode = { id: string; label: string; shape: 'rect' | 'round' | 'diamond' | 'database' };
type GraphEdge = { from: string; to: string; label?: string };
type ChartData = { chartType: 'bar' | 'line' | 'scatter' | 'pie'; xKey: string; nameKey?: string; valueKey?: string; series: Array<{ dataKey: string; label?: string; valuePrefix?: string; valueSuffix?: string }>; data: Array<Record<string, string | number>>; xAxisLabel?: string; axisLabel?: string; valueSuffix?: string };

function parseGraph(source: string) {
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const direction = /^(flowchart|graph)\s+LR/i.test(lines[0] || '') ? 'LR' : 'TD';
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const token = /([A-Za-z][\w-]*)(?:\[([^\]]+)\]|\{([^}]+)\}|\(\(([^)]+)\)\)|\(([^)]+)\)|\[\(([^)]+)\)\])?/g;
  const readToken = (value: string) => {
    const match = token.exec(value);
    token.lastIndex = 0;
    if (!match) return null;
    const [, id, rect, diamond, round, pill, database,] = match;
    const label = rect || diamond || round || pill || database || id;
    const shape: GraphNode['shape'] = database ? 'database' : diamond ? 'diamond' : round || pill ? 'round' : 'rect';
    if (!nodes.has(id)) nodes.set(id, { id, label, shape });
    return id;
  };
  for (const line of lines.slice(1)) {
    if (/^(subgraph|end|classDef|class |style |%%)/i.test(line)) continue;
    const parts = line.split(/\s*(?:-->|---|==>|-.->|==>|--\s*[^-]+\s*-->)\s*/);
    if (parts.length >= 2) {
      const from = readToken(parts[0]);
      const to = readToken(parts[1]);
      if (from && to) {
        const labelMatch = line.match(/--\s*([^>-]+?)\s*-->/);
        edges.push({ from, to, label: labelMatch?.[1]?.trim() });
      }
    } else {
      readToken(line);
    }
  }
  return { direction, nodes: [...nodes.values()].slice(0, 30), edges: edges.slice(0, 50) };
}

function MermaidDiagram({ source }: { source: string }) {
  const graph = useMemo(() => parseGraph(source), [source]);
  const horizontal = graph.direction === 'LR';
  const columns = horizontal ? Math.max(1, graph.nodes.length) : 1;
  const rows = horizontal ? 1 : Math.max(1, graph.nodes.length);
  const width = horizontal ? Math.max(560, columns * 190 + 50) : 620;
  const height = horizontal ? 190 : Math.max(180, rows * 112 + 30);
  const positions = new Map(graph.nodes.map((node, index) => [node.id, horizontal ? { x: 35 + index * 190, y: 50 } : { x: 180, y: 25 + index * 112 }]));
  if (!graph.nodes.length) return <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{source}</pre>;
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
    <svg role="img" aria-label="Rendered flow diagram" viewBox={`0 0 ${width} ${height}`} className="min-w-full" style={{ minWidth: horizontal ? width : 0, maxHeight: 520 }}>
      <defs><marker id="lesson-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#64748b"/></marker></defs>
      {graph.edges.map((edge, index) => {
        const from = positions.get(edge.from); const to = positions.get(edge.to);
        if (!from || !to) return null;
        const x1 = from.x + (horizontal ? 140 : 0); const y1 = from.y + (horizontal ? 24 : 58);
        const x2 = to.x + (horizontal ? 0 : 140); const y2 = to.y + (horizontal ? 24 : 0);
        return <g key={index}><path d={horizontal ? `M ${x1} ${y1} L ${x2 - 8} ${y2}` : `M ${x1} ${y1} L ${x2} ${y2 - 8}`} stroke="#64748b" strokeWidth="1.8" fill="none" markerEnd="url(#lesson-arrow)"/>{edge.label && <text x={(x1+x2)/2} y={(y1+y2)/2-6} textAnchor="middle" fontSize="10" fill="#64748b">{edge.label}</text>}</g>;
      })}
      {graph.nodes.map((node) => {
        const point = positions.get(node.id)!;
        return <g key={node.id} transform={`translate(${point.x},${point.y})`}>
          {node.shape === 'diamond' ? <polygon points="70,0 140,27 70,54 0,27" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5"/> : node.shape === 'database' ? <g><rect x="0" y="9" width="140" height="42" fill="#ecfdf5" stroke="#059669"/><ellipse cx="70" cy="9" rx="70" ry="9" fill="#d1fae5" stroke="#059669"/><path d="M0 51 C0 63 140 63 140 51" fill="none" stroke="#059669"/></g> : <rect x="0" y="0" width="140" height="54" rx={node.shape === 'round' ? 27 : 8} fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5"/>}
          <text x="70" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">{node.label.length > 22 ? node.label.slice(0, 21) + '…' : node.label}</text>
        </g>;
      })}
    </svg>
    <p className="px-2 pb-1 text-[10px] text-slate-500">Simplified flow renderer · {graph.nodes.length} nodes · {graph.edges.length} connections</p>
  </div>;
}

function AnimationPlayer({ visual }: { visual: LessonVisual }) {
  const steps = visual.steps || [];
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing || steps.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => current >= steps.length - 1 ? 0 : current + 1), 1300);
    return () => window.clearInterval(timer);
  }, [playing, steps.length]);
  const step = steps[active];
  const go = (index: number) => { setPlaying(false); setActive(Math.max(0, Math.min(steps.length - 1, index))); };
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => setPlaying((value) => !value)} disabled={steps.length < 2} className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{playing ? <Pause size={14}/> : <Play size={14}/>} {playing ? 'Pause' : 'Play'}</button>
      <button type="button" onClick={() => go(0)} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs"><RotateCcw size={13}/> Reset</button>
      <button type="button" onClick={() => go(active - 1)} disabled={active === 0} className="rounded-md border p-2 disabled:opacity-40" aria-label="Previous animation step"><ChevronLeft size={15}/></button>
      <button type="button" onClick={() => go(active + 1)} disabled={active >= steps.length - 1} className="rounded-md border p-2 disabled:opacity-40" aria-label="Next animation step"><ChevronRight size={15}/></button>
      <span className="ml-auto text-xs tabular-nums text-slate-500">Step {steps.length ? active + 1 : 0} / {steps.length}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: steps.length ? `${(active + 1) / steps.length * 100}%` : '0%' }}/></div>
    {step ? <div className="grid gap-3 md:grid-cols-[1fr_220px]">
      <div className="min-h-32 rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30"><h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</h5><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{step.explanation}</p></div>
      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><h5 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Current state</h5><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-slate-700 dark:text-slate-300">{JSON.stringify(step.state ?? { step: active + 1 }, null, 2)}</pre></div>
    </div> : <p className="text-xs text-slate-500">No animation steps were generated.</p>}
    <div className="flex flex-wrap gap-1.5">{steps.map((item, index) => <button key={index} type="button" onClick={() => go(index)} className={`rounded-md px-2 py-1.5 text-[10px] ${active === index ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{index + 1}. {item.title}</button>)}</div>
  </div>;
}

function ChartVisualization({ source }: { source: string }) {
  let chart: ChartData;
  try { chart = JSON.parse(source) as ChartData; } catch { return <p className="text-xs text-amber-700">Chart data is not valid JSON.</p>; }
  if (!Array.isArray(chart.data) || !Array.isArray(chart.series) || !chart.data.length || !chart.series.length) return <p className="text-xs text-amber-700">Chart needs data points and at least one series.</p>;
  const values = chart.data.flatMap((row) => chart.series.map((series) => Number(row[series.dataKey])).filter(Number.isFinite));
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const chartHeight = 190;
  return <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
    <svg viewBox={`0 0 ${Math.max(480, chart.data.length * 76)} 240`} className="w-full" role="img" aria-label={`${chart.chartType} chart`}>
      {[0, 1, 2, 3].map((tick) => { const y = 205 - tick * 55; return <g key={tick}><line x1="42" x2={Math.max(460, chart.data.length * 76)} y1={y} y2={y} stroke="#cbd5e1" strokeDasharray="3 4"/><text x="34" y={y+4} fontSize="9" textAnchor="end" fill="#64748b">{Math.round(min + (max-min)*tick/3)}</text></g>; })}
      {chart.data.map((row, index) => chart.series.map((series, seriesIndex) => {
        const value = Number(row[series.dataKey]); if (!Number.isFinite(value)) return null;
        const x = 55 + index * 76 + seriesIndex * (chart.chartType === 'bar' ? 20 : 0);
        const y = 205 - (value-min)/(max-min || 1) * chartHeight;
        if (chart.chartType === 'line' || chart.chartType === 'scatter') {
          const previous = chart.data[index-1]; const previousValue = previous ? Number(previous[series.dataKey]) : NaN;
          const previousY = 205 - (previousValue-min)/(max-min || 1) * chartHeight;
          return <g key={`${series.dataKey}-${index}`}>{chart.chartType === 'line' && index > 0 && Number.isFinite(previousValue) && <line x1={55+(index-1)*76} y1={previousY} x2={x} y2={y} stroke="#0284c7" strokeWidth="2.5"/>}<circle cx={x} cy={y} r="4" fill="#0284c7"/><title>{String(row[chart.xKey])}: {value}</title></g>;
        }
        const barHeight = Math.max(2, 205-y);
        return <g key={`${series.dataKey}-${index}`}><rect x={x} y={y} width="15" height={barHeight} rx="3" fill={seriesIndex ? '#0d9488' : '#0284c7'}/><title>{String(row[chart.xKey])}: {value}</title></g>;
      }))}
      {chart.data.map((row,index)=><text key={index} x={55+index*76} y="224" fontSize="9" textAnchor="middle" fill="#64748b">{String(row[chart.xKey] ?? '').slice(0,10)}</text>)}
    </svg>
    <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">{chart.series.map((series,index)=><span key={series.dataKey} className="inline-flex items-center gap-1"><i className={`h-2 w-2 rounded-full ${index ? 'bg-teal-600' : 'bg-sky-600'}`}/>{series.label || series.dataKey}</span>)}</div>
    {chart.xAxisLabel && <p className="mt-1 text-center text-[10px] text-slate-500">{chart.xAxisLabel}</p>}
  </div>;
}

function TableVisualization({ source }: { source: string }) {
  let rows: unknown;
  try { rows = JSON.parse(source); } catch { rows = source.split(/\r?\n/).filter(Boolean).map((line) => line.split(/\t|\s{2,}/)); }
  if (!Array.isArray(rows) || !rows.length) return <pre className="overflow-auto text-xs">{source}</pre>;
  const normalized = rows.map((row) => Array.isArray(row) ? row : row && typeof row === 'object' ? Object.values(row as Record<string, unknown>) : [row]);
  return <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800"><table className="min-w-full text-left text-xs"><tbody>{normalized.map((row,index)=><tr key={index} className={index===0?'bg-slate-100 font-semibold dark:bg-slate-800':'border-t border-slate-100 dark:border-slate-800'}>{row.map((cell,cellIndex)=><td key={cellIndex} className="px-3 py-2">{String(cell ?? '')}</td>)}</tr>)}</tbody></table></div>;
}

export function VisualizationRenderer({ visual }: { visual: LessonVisual }) {
  const type = visual.type.toLowerCase();
  return <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
    <div><h4 className="text-sm font-semibold">{visual.title}</h4><p className="mt-1 text-xs text-slate-500">{visual.description}</p></div>
    {type === 'mermaid' ? <MermaidDiagram source={visual.source}/> :
      type === 'step-animation' ? <AnimationPlayer visual={visual}/> :
      type === 'chart-spec' ? <ChartVisualization source={visual.source}/> :
      type === 'table' ? <TableVisualization source={visual.source}/> :
      type === 'equation' ? <div className="overflow-x-auto rounded-lg bg-slate-50 p-5 text-center dark:bg-slate-900"><code className="whitespace-pre-wrap text-base font-semibold text-slate-800 dark:text-slate-100">{visual.source}</code></div> :
      <pre className="overflow-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 text-xs text-slate-100">{visual.source}</pre>}
    <details className="text-[10px] text-slate-500"><summary className="cursor-pointer">View source specification</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-2 dark:bg-slate-900">{visual.source}</pre></details>
  </section>;
}
