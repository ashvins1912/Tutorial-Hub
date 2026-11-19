import { motion } from 'framer-motion';
import { AlgorithmDefinition, AlgorithmStepFrame } from '../../data/algorithmsCatalog';

interface AlgorithmVisualStageProps {
  algorithm: AlgorithmDefinition;
  frame: AlgorithmStepFrame;
}

const POINTER_TONE: Record<'sky' | 'emerald' | 'amber' | 'rose', string> = {
  sky: 'bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950',
  emerald: 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950',
  amber: 'bg-amber-600 text-white dark:bg-amber-400 dark:text-slate-950',
  rose: 'bg-rose-600 text-white dark:bg-rose-400 dark:text-slate-950',
};

function renderArrayCells(
  frame: AlgorithmStepFrame,
  options?: { secondaryLabel?: string; showWindowBracket?: boolean }
) {
  const arr = frame.array ?? [];
  const win = frame.windowRange;
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex items-end gap-2 min-w-full justify-center pt-7">
          {arr.map((val, idx) => {
            const pointersHere = (frame.pointers ?? []).filter((p) => p.index === idx);
            const isMatched = frame.matchedIndices?.includes(idx);
            const isHighlighted = frame.highlightIndices?.includes(idx);
            const isEliminated = frame.eliminatedIndices?.includes(idx);
            const inWindow = win ? idx >= win[0] && idx <= win[1] : false;

            const boxStyle = isMatched
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
              : isHighlighted || inWindow
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                : isEliminated
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 opacity-55'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100';

            return (
              <div key={idx} className="flex flex-col items-center relative min-w-[54px]">
                {/* Pointer labels above cell */}
                <div className="absolute -top-7 flex items-center gap-1">
                  {pointersHere.map((ptr) => (
                    <motion.span
                      key={ptr.label}
                      layout
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight ${POINTER_TONE[ptr.tone]}`}
                    >
                      {ptr.label}
                    </motion.span>
                  ))}
                </div>

                <motion.div
                  layout
                  transition={{ duration: 0.2 }}
                  className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono tabular-nums transition-colors ${boxStyle}`}
                >
                  <span className="text-base font-bold">{val}</span>
                  <span className="text-[10px] opacity-60">[{idx}]</span>
                </motion.div>

                {frame.secondaryArray && (
                  <div className="mt-1.5 text-center">
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {options?.secondaryLabel ?? 'aux'}
                    </div>
                    <div className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums min-w-[36px]">
                      {frame.secondaryArray[idx] ?? '—'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Hash Table Row */}
      {frame.hashEntries && frame.hashEntries.length > 0 && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-2">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            Hash Map State (O(1) Lookup)
          </div>
          <div className="flex flex-wrap gap-2">
            {frame.hashEntries.map((entry) => (
              <motion.div
                key={entry.key}
                layout
                className={`px-2.5 py-1.5 rounded-md border font-mono text-xs tabular-nums transition-colors ${
                  entry.hit
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                    : entry.active
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                {entry.key} → {entry.val}
                {entry.hit ? ' (HIT)' : ''}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderTwoPointersBars(frame: AlgorithmStepFrame) {
  const arr = (frame.array ?? []) as number[];
  const maxVal = Math.max(...arr, 1);
  const win = frame.windowRange ?? [0, arr.length - 1];
  const minWall = Math.min(arr[win[0]] ?? 0, arr[win[1]] ?? 0);

  return (
    <div className="space-y-3">
      <div className="relative h-56 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-6 pt-8 pb-6 flex items-end justify-around gap-3">
        {arr.map((h, idx) => {
          const pct = Math.round((h / maxVal) * 100);
          const ptrs = (frame.pointers ?? []).filter((p) => p.index === idx);
          const isEndpoint = idx === win[0] || idx === win[1];
          const isInside = idx > win[0] && idx < win[1];
          const isElim = frame.eliminatedIndices?.includes(idx);
          const waterPct = Math.round((minWall / maxVal) * 100);

          return (
            <div key={idx} className="flex-1 max-w-[64px] h-full flex flex-col justify-end items-center relative">
              {/* Pointer indicator */}
              <div className="absolute -top-6 flex gap-1">
                {ptrs.map((ptr) => (
                  <motion.span
                    key={ptr.label}
                    layout
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${POINTER_TONE[ptr.tone]}`}
                  >
                    {ptr.label}
                  </motion.span>
                ))}
              </div>

              {/* Shaded water/container band between L and R */}
              {(isInside || isEndpoint) && (
                <div
                  className="absolute bottom-5 inset-x-0 bg-sky-500/15 dark:bg-sky-400/15 border-t border-dashed border-sky-500/60 pointer-events-none transition-all duration-200"
                  style={{ height: `${Math.max(waterPct * 0.78, 8)}%` }}
                />
              )}

              <motion.div
                layout
                className={`w-full rounded-t-md border transition-colors flex items-start justify-center pt-1 font-mono text-xs font-bold tabular-nums z-10 ${
                  isEndpoint
                    ? 'bg-sky-600 dark:bg-sky-500 border-sky-700 dark:border-sky-400 text-white dark:text-slate-950'
                    : isElim
                      ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 opacity-50'
                      : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                }`}
                style={{ height: `${Math.max(pct * 0.78, 14)}%` }}
              >
                {h}
              </motion.div>
              <span className="mt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                [{idx}]
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-400 px-1">
        <span>Active span: [{win[0]} .. {win[1]}] (width = {win[1] - win[0]})</span>
        <span>Limiting wall height = {minWall}</span>
      </div>
    </div>
  );
}

function renderMonotonicStack(frame: AlgorithmStepFrame) {
  const temps = (frame.array ?? []) as number[];
  const minT = 65;
  const maxT = 78;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_190px] gap-4 items-stretch">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 flex flex-col justify-between">
        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-3">
          Daily Temperatures & Resolved Wait Days
        </div>
        <div className="h-44 flex items-end justify-around gap-2 pt-4">
          {temps.map((t, idx) => {
            const pct = Math.round(((t - minT) / (maxT - minT)) * 100);
            const isMatched = frame.matchedIndices?.includes(idx);
            const isActive = frame.highlightIndices?.includes(idx);
            const isPtr = frame.pointers?.some((p) => p.index === idx);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 mb-1">
                  {t}°
                </div>
                <motion.div
                  layout
                  className={`w-full max-w-[44px] rounded-t-md border transition-colors ${
                    isPtr
                      ? 'bg-sky-600 dark:bg-sky-400 border-sky-700 dark:border-sky-300'
                      : isMatched
                        ? 'bg-emerald-500/80 dark:bg-emerald-500/70 border-emerald-600'
                        : isActive
                          ? 'bg-amber-500/80 dark:bg-amber-500/70 border-amber-600'
                          : 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600'
                  }`}
                  style={{ height: `${Math.max(pct, 16)}%` }}
                />
                <div className="mt-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  d{idx}
                </div>
                <div className="mt-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {frame.secondaryArray?.[idx] ?? 0}d
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 flex flex-col justify-between">
        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          LIFO Stack (Top ↑)
        </div>
        <div className="flex-1 flex flex-col-reverse justify-start gap-1.5 py-3">
          {(frame.stackItems ?? []).length === 0 ? (
            <div className="text-xs font-mono text-slate-400 text-center py-6">Empty</div>
          ) : (
            (frame.stackItems ?? []).map((item) => (
              <motion.div
                key={item.label}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`px-3 py-2 rounded-md border font-mono text-xs flex items-center justify-between ${
                  item.active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                <span className="font-bold">{item.sub}</span>
              </motion.div>
            ))
          )}
        </div>
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
          Strictly decreasing ↑
        </div>
      </div>
    </div>
  );
}

function renderFastSlowSvg(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: '10', x: 65, y: 110 },
    { id: '20', x: 185, y: 110 },
    { id: '30', x: 305, y: 50 },
    { id: '40', x: 425, y: 110 },
    { id: '50', x: 305, y: 170 },
  ];
  const edges = [
    { id: '10->20', d: 'M 89 110 L 160 110' },
    { id: '20->30', d: 'M 207 98 L 283 62' },
    { id: '30->40', d: 'M 327 62 L 403 98' },
    { id: '40->50', d: 'M 403 122 L 327 158' },
    { id: '50->20', d: 'M 283 158 L 207 122' },
  ];

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
      <svg viewBox="0 0 500 220" className="w-full h-56" role="img" aria-label="Cyclic linked list diagram">
        <defs>
          <marker id="arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400 dark:fill-slate-600" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-sky-500" />
          </marker>
        </defs>

        {edges.map((e) => {
          const active = frame.activeEdges?.includes(e.id);
          return (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              strokeWidth={active ? 3 : 2}
              strokeDasharray={e.id === '50->20' ? '5 3' : undefined}
              markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow-muted)'}
              className={active ? 'stroke-sky-500' : 'stroke-slate-300 dark:stroke-slate-700'}
            />
          );
        })}

        <text x="200" y="196" className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono">
          back-edge cycle (50 → 20)
        </text>

        {nodes.map((n) => {
          const badge = frame.nodeBadges?.[n.id];
          const isHit = badge?.includes('HIT');
          const isActive = frame.activeNodes?.includes(n.id);
          const isVisited = frame.visitedNodes?.includes(n.id);
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r={22}
                strokeWidth={2.5}
                className={
                  isHit
                    ? 'fill-emerald-500/20 stroke-emerald-500'
                    : isActive
                      ? 'fill-sky-500/20 stroke-sky-500'
                      : isVisited
                        ? 'fill-slate-200/70 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                }
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                className="fill-slate-900 dark:fill-slate-100 text-xs font-mono font-bold"
              >
                {n.id}
              </text>
              {badge && (
                <text
                  x={n.x}
                  y={n.y - 29}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-bold ${
                    isHit ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-sky-600 dark:fill-sky-400'
                  }`}
                >
                  {badge}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function renderTreeSvg(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: '8', x: 250, y: 36 },
    { id: '4', x: 140, y: 105 },
    { id: '12', x: 360, y: 105 },
    { id: '2', x: 85, y: 175 },
    { id: '6', x: 195, y: 175 },
    { id: '10', x: 305, y: 175 },
    { id: '15', x: 415, y: 175 },
  ];
  const edges = [
    ['8', '4'],
    ['8', '12'],
    ['4', '2'],
    ['4', '6'],
    ['12', '10'],
    ['12', '15'],
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 500 212" className="w-full h-52" role="img" aria-label="Binary tree BFS traversal diagram">
          {edges.map(([u, v]) => {
            const key = `${u}->${v}`;
            const active = frame.activeEdges?.includes(key);
            return (
              <line
                key={key}
                x1={byId[u].x}
                y1={byId[u].y}
                x2={byId[v].x}
                y2={byId[v].y}
                strokeWidth={active ? 3 : 2}
                className={active ? 'stroke-sky-500' : 'stroke-slate-300 dark:stroke-slate-700'}
              />
            );
          })}
          {nodes.map((n) => {
            const isActive = frame.activeNodes?.includes(n.id);
            const isVisited = frame.visitedNodes?.includes(n.id);
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={20}
                  strokeWidth={2.5}
                  className={
                    isActive
                      ? 'fill-sky-600 dark:fill-sky-400 stroke-sky-700 dark:stroke-sky-300'
                      : isVisited
                        ? 'fill-emerald-50 dark:fill-emerald-950 stroke-emerald-500'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className={`text-xs font-mono font-bold ${
                    isActive
                      ? 'fill-white dark:fill-slate-950'
                      : 'fill-slate-900 dark:fill-slate-100'
                  }`}
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-slate-500 dark:text-slate-400">FIFO Queue: </span>
          <strong className="text-sky-700 dark:text-sky-400">
            {(frame.queueItems ?? []).length ? `[${frame.queueItems!.join(', ')}]` : '[] (empty)'}
          </strong>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-slate-500 dark:text-slate-400">Levels Output: </span>
          <strong className="text-emerald-700 dark:text-emerald-400">
            {(frame.outputSeq ?? []).join(', ') || '[]'}
          </strong>
        </div>
      </div>
    </div>
  );
}

function renderIntervalTimeline(frame: AlgorithmStepFrame, showHeap: boolean) {
  const maxT = 13;
  const intervals = frame.intervals ?? [];

  return (
    <div className={`grid grid-cols-1 ${showHeap ? 'md:grid-cols-[1fr_195px]' : ''} gap-4`}>
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>Timeline Axis (t = 0 .. 12)</span>
          <span>{showHeap ? 'Sorted by Start Time' : 'Sorted by End Time'}</span>
        </div>

        <div className="space-y-2.5">
          {intervals.map((iv) => {
            const leftPct = (iv.start / maxT) * 100;
            const widthPct = ((iv.end - iv.start) / maxT) * 100;
            const barTone =
              iv.status === 'active'
                ? 'bg-sky-600 dark:bg-sky-400 text-white dark:text-slate-950 border-sky-700'
                : iv.status === 'reused'
                  ? 'bg-emerald-600 dark:bg-emerald-400 text-white dark:text-slate-950 border-emerald-700'
                  : iv.status === 'selected'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-500'
                    : iv.status === 'skipped'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 line-through opacity-75'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700';

            return (
              <div key={iv.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{iv.id}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {iv.room ? `Room ${iv.room} · ` : ''}
                    {iv.status.toUpperCase()}
                  </span>
                </div>
                <div className="relative h-7 rounded bg-slate-200/70 dark:bg-slate-800/70 overflow-hidden">
                  <motion.div
                    layout
                    className={`absolute top-0.5 bottom-0.5 rounded border px-2 flex items-center text-[11px] font-mono font-semibold truncate ${barTone}`}
                    style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 12)}%` }}
                  >
                    {iv.start}–{iv.end}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showHeap && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            Min-Heap (Earliest End ↑)
          </div>
          <div className="space-y-2 py-3">
            {(frame.stackItems ?? []).map((item, i) => (
              <div
                key={`${item.label}-${i}`}
                className={`p-2.5 rounded-md border font-mono text-xs ${
                  i === 0
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] opacity-75">{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
            Peek root in O(1)
          </div>
        </div>
      )}
    </div>
  );
}

function renderTopoGraphSvg(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: 'C0', x: 75, y: 65 },
    { id: 'C1', x: 75, y: 165 },
    { id: 'C2', x: 245, y: 65 },
    { id: 'C3', x: 245, y: 165 },
    { id: 'C4', x: 420, y: 115 },
  ];
  const edges = [
    ['C0', 'C2'],
    ['C0', 'C3'],
    ['C1', 'C3'],
    ['C2', 'C4'],
    ['C3', 'C4'],
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 500 225" className="w-full h-52" role="img" aria-label="Directed acyclic graph topological sort">
          <defs>
            <marker id="topo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400 dark:fill-slate-600" />
            </marker>
            <marker id="topo-arrow-hi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-sky-500" />
            </marker>
          </defs>
          {edges.map(([u, v]) => {
            const key = `${u}->${v}`;
            const active = frame.activeEdges?.includes(key);
            const dx = byId[v].x - byId[u].x;
            const dy = byId[v].y - byId[u].y;
            const len = Math.hypot(dx, dy);
            const x1 = byId[u].x + (dx / len) * 24;
            const y1 = byId[u].y + (dy / len) * 24;
            const x2 = byId[v].x - (dx / len) * 28;
            const y2 = byId[v].y - (dy / len) * 28;
            return (
              <line
                key={key}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeWidth={active ? 3 : 2}
                markerEnd={active ? 'url(#topo-arrow-hi)' : 'url(#topo-arrow)'}
                className={active ? 'stroke-sky-500' : 'stroke-slate-300 dark:stroke-slate-700'}
              />
            );
          })}

          {nodes.map((n) => {
            const isVisited = frame.visitedNodes?.includes(n.id);
            const isActive = frame.activeNodes?.includes(n.id);
            const badge = frame.nodeBadges?.[n.id];
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={22}
                  strokeWidth={2.5}
                  className={
                    isVisited
                      ? 'fill-emerald-500/20 stroke-emerald-500'
                      : isActive
                        ? 'fill-sky-500/20 stroke-sky-500'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-xs font-mono font-bold">
                  {n.id}
                </text>
                {badge && (
                  <text
                    x={n.x}
                    y={n.y - 29}
                    textAnchor="middle"
                    className={`text-[10px] font-mono font-bold ${
                      badge === 'done'
                        ? 'fill-emerald-600 dark:fill-emerald-400'
                        : badge === 'in:0'
                          ? 'fill-sky-600 dark:fill-sky-400'
                          : 'fill-slate-500 dark:fill-slate-400'
                    }`}
                  >
                    {badge}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-slate-500">Zero-Indegree Queue: </span>
          <strong className="text-sky-600 dark:text-sky-400">
            {(frame.queueItems ?? []).length ? `[${frame.queueItems!.join(', ')}]` : '[]'}
          </strong>
        </div>
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-slate-500">Topo Order: </span>
          <strong className="text-emerald-600 dark:text-emerald-400">
            {(frame.outputSeq ?? []).length ? frame.outputSeq!.join(' → ') : 'Starting...'}
          </strong>
        </div>
      </div>
    </div>
  );
}

function renderDijkstraGraphSvg(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: 'A', x: 70, y: 112 },
    { id: 'B', x: 220, y: 50 },
    { id: 'C', x: 220, y: 175 },
    { id: 'E', x: 375, y: 50 },
    { id: 'D', x: 375, y: 175 },
  ];
  const edges = [
    { u: 'A', v: 'B', w: 4 },
    { u: 'A', v: 'C', w: 1 },
    { u: 'C', v: 'B', w: 2 },
    { u: 'C', v: 'D', w: 5 },
    { u: 'B', v: 'E', w: 1 },
    { u: 'E', v: 'D', w: 1 },
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 470 225" className="w-full h-52" role="img" aria-label="Weighted graph Dijkstra shortest path">
          {edges.map(({ u, v, w }) => {
            const key = `${u}->${v}`;
            const active = frame.activeEdges?.includes(key);
            const mx = (byId[u].x + byId[v].x) / 2;
            const my = (byId[u].y + byId[v].y) / 2;
            return (
              <g key={key}>
                <line
                  x1={byId[u].x}
                  y1={byId[u].y}
                  x2={byId[v].x}
                  y2={byId[v].y}
                  strokeWidth={active ? 3 : 2}
                  className={active ? 'stroke-emerald-500' : 'stroke-slate-300 dark:stroke-slate-700'}
                />
                <rect
                  x={mx - 10}
                  y={my - 9}
                  width={20}
                  height={18}
                  rx={4}
                  className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"
                />
                <text
                  x={mx}
                  y={my + 4}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    active ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-slate-600 dark:fill-slate-400'
                  }`}
                >
                  {w}
                </text>
              </g>
            );
          })}

          {nodes.map((n) => {
            const settled = frame.visitedNodes?.includes(n.id);
            const active = frame.activeNodes?.includes(n.id);
            const dist = frame.nodeBadges?.[n.id] ?? '∞';
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={22}
                  strokeWidth={2.5}
                  className={
                    settled
                      ? 'fill-emerald-500/20 stroke-emerald-500'
                      : active
                        ? 'fill-sky-500/20 stroke-sky-500'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-xs font-mono font-bold">
                  {n.id}
                </text>
                <text
                  x={n.x}
                  y={n.y - 28}
                  textAnchor="middle"
                  className="fill-sky-700 dark:fill-sky-400 text-[11px] font-mono font-bold"
                >
                  d={dist}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
        <span className="text-slate-500">Min-Heap Priority Queue: </span>
        <strong className="text-sky-700 dark:text-sky-400">
          {(frame.queueItems ?? []).length ? frame.queueItems!.join('  ·  ') : 'Empty (all vertices settled)'}
        </strong>
      </div>
    </div>
  );
}

function renderBacktrackingSvg(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: 'root', label: '[] rem:5', x: 250, y: 34 },
    { id: 'n2', label: '[2] rem:3', x: 120, y: 105 },
    { id: 'n3', label: '[3] rem:2', x: 250, y: 105 },
    { id: 'n5', label: '[5] rem:0', x: 380, y: 105 },
    { id: 'n22', label: '[2,2] rem:1', x: 65, y: 180 },
    { id: 'n23', label: '[2,3] rem:0', x: 185, y: 180 },
  ];
  const edges = [
    ['root', 'n2', '+2'],
    ['root', 'n3', '+3'],
    ['root', 'n5', '+5'],
    ['n2', 'n22', '+2'],
    ['n2', 'n23', '+3'],
  ] as const;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 500 220" className="w-full h-52" role="img" aria-label="Backtracking decision tree with pruning">
          {edges.map(([u, v, lbl]) => {
            const key = `${u}->${v}`;
            const active = frame.activeEdges?.includes(key);
            const mx = (byId[u].x + byId[v].x) / 2;
            const my = (byId[u].y + byId[v].y) / 2;
            return (
              <g key={key}>
                <line
                  x1={byId[u].x}
                  y1={byId[u].y + 14}
                  x2={byId[v].x}
                  y2={byId[v].y - 14}
                  strokeWidth={active ? 2.5 : 1.5}
                  className={active ? 'stroke-sky-500' : 'stroke-slate-300 dark:stroke-slate-700'}
                />
                <text x={mx + 8} y={my} className="fill-slate-500 dark:fill-slate-400 text-[10px] font-mono">
                  {lbl}
                </text>
              </g>
            );
          })}
          {nodes.map((n) => {
            const pruned = frame.prunedNodes?.includes(n.id);
            const isSol = n.label.includes('rem:0') && (frame.visitedNodes?.includes(n.id) || frame.activeNodes?.includes(n.id));
            const active = frame.activeNodes?.includes(n.id);
            return (
              <g key={n.id}>
                <rect
                  x={n.x - 46}
                  y={n.y - 15}
                  width={92}
                  height={30}
                  rx={6}
                  strokeWidth={2}
                  className={
                    pruned
                      ? 'fill-rose-50 dark:fill-rose-950/50 stroke-rose-500'
                      : isSol
                        ? 'fill-emerald-50 dark:fill-emerald-950/50 stroke-emerald-500'
                        : active
                          ? 'fill-sky-50 dark:fill-sky-950/50 stroke-sky-500'
                          : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-semibold ${
                    pruned
                      ? 'fill-rose-700 dark:fill-rose-300'
                      : isSol
                        ? 'fill-emerald-700 dark:fill-emerald-300'
                        : 'fill-slate-900 dark:fill-slate-100'
                  }`}
                >
                  {pruned ? '✕ ' : isSol ? '✓ ' : ''}
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
        <span className="text-slate-500">Discovered Combinations: </span>
        <strong className="text-emerald-600 dark:text-emerald-400">
          {(frame.outputSeq ?? []).length ? frame.outputSeq!.join('  ·  ') : 'Exploring...'}
        </strong>
      </div>
    </div>
  );
}

function renderDpTable(frame: AlgorithmStepFrame) {
  const arr = frame.array ?? [];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3">
        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          Bottom-Up DP State Table — dp[x] = min coins for amount x
        </div>
        <div className="grid grid-cols-7 gap-2">
          {arr.map((val, x) => {
            const isHi = frame.highlightIndices?.includes(x);
            const isDone = frame.matchedIndices?.includes(x);
            return (
              <motion.div
                key={x}
                layout
                className={`rounded-lg border-2 p-2.5 text-center font-mono tabular-nums ${
                  isHi
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-100'
                    : isDone
                      ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="text-[10px] opacity-70">dp[{x}]</div>
                <div className="text-lg font-bold mt-0.5">{val}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {frame.dpDependencies && frame.dpDependencies.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500 dark:text-slate-400">Active Transitions:</span>
          {frame.dpDependencies.map((dep, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-md border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200"
            >
              dp[{dep.from}] → dp[{dep.to}] ({dep.label})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function renderMergeSort(frame: AlgorithmStepFrame) {
  const chunks = frame.mergeLevels ?? [];
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-5 space-y-4">
      <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
        Divide & Conquer Subarray Partitions
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 py-4">
        {chunks.map((chunk, i) => (
          <motion.div
            key={`${chunk.range.join('-')}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1.5 p-2 rounded-lg border-2 ${
              chunk.sorted
                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40'
                : chunk.active
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            {chunk.values.map((v, idx) => (
              <span
                key={idx}
                className="w-9 h-9 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums"
              >
                {v}
              </span>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function renderKadane(frame: AlgorithmStepFrame) {
  const arr = (frame.array ?? []) as number[];
  const win = frame.windowRange ?? [0, 0];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-3">
          <span>Active Subarray Window [{win[0]} .. {win[1]}]</span>
          <span>Negative prefixes dropped immediately</span>
        </div>
        {renderArrayCells(frame, { showWindowBracket: true })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 px-1">
        <span>Active slice: [{arr.slice(win[0], win[1] + 1).join(', ')}]</span>
        <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
          Window sum = {arr.slice(win[0], win[1] + 1).reduce((a, b) => a + Number(b), 0)}
        </span>
      </div>
    </div>
  );
}

function renderCyclicSort(frame: AlgorithmStepFrame) {
  const arr = frame.array ?? [];
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3">
      <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
        In-Place Home Slot Placement (value v belongs at index v - 1)
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex items-end gap-2.5 min-w-full justify-center pt-7">
          {arr.map((val, idx) => {
            const ptrs = (frame.pointers ?? []).filter((p) => p.index === idx);
            const settled = Number(val) === idx + 1 || frame.matchedIndices?.includes(idx);
            const active = frame.highlightIndices?.includes(idx);
            return (
              <div key={idx} className="flex flex-col items-center relative min-w-[56px]">
                <div className="absolute -top-7 flex gap-1">
                  {ptrs.map((p) => (
                    <span key={p.label} className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${POINTER_TONE[p.tone]}`}>
                      {p.label}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-slate-400 mb-1">home:{idx + 1}</span>
                <motion.div
                  layout
                  className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center font-mono tabular-nums ${
                    settled
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                      : active
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <span className="text-base font-bold">{val}</span>
                  <span className="text-[10px] opacity-60">[{idx}]</span>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function renderDfsStack(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: '8', x: 200, y: 34 },
    { id: '4', x: 112, y: 102 },
    { id: '12', x: 288, y: 102 },
    { id: '2', x: 64, y: 172 },
    { id: '6', x: 158, y: 172 },
    { id: '10', x: 242, y: 172 },
    { id: '15', x: 336, y: 172 },
  ];
  const edges = [['8', '4'], ['8', '12'], ['4', '2'], ['4', '6'], ['12', '10'], ['12', '15']];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_205px] gap-4 items-stretch">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
          <svg viewBox="0 0 400 208" className="w-full h-52" role="img" aria-label="DFS recursive tree traversal">
            {edges.map(([u, v]) => {
              const key = `${u}->${v}`;
              const active = frame.activeEdges?.includes(key);
              return (
                <line
                  key={key}
                  x1={byId[u].x}
                  y1={byId[u].y}
                  x2={byId[v].x}
                  y2={byId[v].y}
                  strokeWidth={active ? 3 : 2}
                  className={active ? 'stroke-sky-500' : 'stroke-slate-300 dark:stroke-slate-700'}
                />
              );
            })}
            {nodes.map((n) => {
              const isActive = frame.activeNodes?.includes(n.id);
              const isVisited = frame.visitedNodes?.includes(n.id);
              return (
                <g key={n.id}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={19}
                    strokeWidth={2.5}
                    className={
                      isActive
                        ? 'fill-sky-600 dark:fill-sky-400 stroke-sky-700 dark:stroke-sky-300'
                        : isVisited
                          ? 'fill-emerald-50 dark:fill-emerald-950 stroke-emerald-500'
                          : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                    }
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    className={`text-xs font-mono font-bold ${isActive ? 'fill-white dark:fill-slate-950' : 'fill-slate-900 dark:fill-slate-100'}`}
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 flex flex-col justify-between">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            Recursion Call Stack (Top ↑)
          </div>
          <div className="flex-1 flex flex-col-reverse justify-start gap-1.5 py-2.5">
            {(frame.stackItems ?? []).map((item) => (
              <div
                key={item.label}
                className={`px-2.5 py-2 rounded-md border font-mono text-xs ${
                  item.active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>{item.label}</div>
                {item.sub && <div className="text-[10px] opacity-75">{item.sub}</div>}
              </div>
            ))}
          </div>
          <div className="text-[10px] font-mono text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-1.5">
            Space = O(Tree Height)
          </div>
        </div>
      </div>

      {frame.outputSeq && frame.outputSeq.length > 0 && (
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono">
          <span className="text-slate-500">Traversal Log: </span>
          <strong className="text-emerald-700 dark:text-emerald-400">{frame.outputSeq.join(' · ')}</strong>
        </div>
      )}
    </div>
  );
}

function renderUnionFind(frame: AlgorithmStepFrame) {
  const nodes = [
    { id: '0', x: 110, y: 46 },
    { id: '1', x: 60, y: 148 },
    { id: '2', x: 245, y: 80 },
    { id: '3', x: 315, y: 158 },
    { id: '4', x: 430, y: 98 },
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges = (frame.activeEdges ?? []).map((e) => e.split('->'));
  const parents = frame.array ?? [0, 1, 2, 3, 4];
  const ranks = frame.secondaryArray ?? [0, 0, 0, 0, 0];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 500 198" className="w-full h-48" role="img" aria-label="Disjoint set union forest">
          {edges.map(([u, v]) => {
            const a = byId[u];
            const b = byId[v];
            if (!a || !b) return null;
            return (
              <line
                key={`${u}-${v}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeWidth={2.5}
                className="stroke-sky-500"
              />
            );
          })}
          {nodes.map((n) => {
            const isActive = frame.activeNodes?.includes(n.id);
            const isVisited = frame.visitedNodes?.includes(n.id);
            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={21}
                  strokeWidth={2.5}
                  className={
                    isActive
                      ? 'fill-sky-500/20 stroke-sky-500'
                      : isVisited
                        ? 'fill-emerald-500/15 stroke-emerald-500'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-slate-900 dark:fill-slate-100 text-xs font-mono font-bold">
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {parents.map((p, idx) => (
          <div key={idx} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center font-mono text-xs tabular-nums">
            <div className="text-[10px] text-slate-500">node {idx}</div>
            <div className="font-bold text-slate-900 dark:text-slate-100">p={p}</div>
            <div className="text-[10px] text-sky-600 dark:text-sky-400">rank={ranks[idx] ?? 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderBitGrid(frame: AlgorithmStepFrame) {
  const accBits = frame.array ?? [0, 0, 0, 0];
  const opBits = frame.secondaryArray;
  const powers = [8, 4, 2, 1];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-5 space-y-4">
        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          4-Bit Hardware Register (XOR Self-Cancellation: x ^ x = 0)
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2 items-center max-w-md mx-auto">
            <div className="text-xs font-mono font-semibold text-slate-500 text-right pr-2">acc</div>
            {accBits.map((bit, i) => {
              const hi = frame.highlightIndices?.includes(i) || frame.matchedIndices?.includes(i);
              return (
                <div
                  key={`acc-${i}`}
                  className={`rounded-lg border-2 py-2.5 text-center font-mono tabular-nums ${
                    Number(bit) === 1
                      ? hi
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                        : 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] opacity-70">2^{3 - i} ({powers[i]})</div>
                  <div className="text-lg font-bold">{bit}</div>
                </div>
              );
            })}
          </div>

          {opBits && (
            <div className="grid grid-cols-5 gap-2 items-center max-w-md mx-auto">
              <div className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400 text-right pr-2">XOR x</div>
              {opBits.map((bit, i) => (
                <div
                  key={`op-${i}`}
                  className={`rounded-lg border py-2 text-center font-mono text-sm font-bold tabular-nums ${
                    Number(bit) === 1
                      ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  {bit}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {frame.hashEntries && frame.hashEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {frame.hashEntries.map((e) => (
            <div
              key={e.key}
              className={`px-3 py-1.5 rounded-md border font-mono text-xs ${
                e.hit
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                  : 'border-sky-400 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200'
              }`}
            >
              {e.key}: {e.val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderKmpMatch(frame: AlgorithmStepFrame) {
  const text = frame.array ?? [];
  const pat = frame.secondaryArray ?? [];
  const offset = frame.windowRange?.[0] ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 overflow-x-auto space-y-2.5">
        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          Text Ribbon vs Aligned Pattern (offset = {offset})
        </div>
        <div className="inline-flex gap-1.5 min-w-full justify-center pt-5">
          {text.map((ch, idx) => {
            const ptr = frame.pointers?.find((p) => p.index === idx);
            const matched = frame.matchedIndices?.includes(idx);
            const mismatch = frame.highlightIndices?.includes(idx);
            const patIdx = idx - offset;
            const patCh = patIdx >= 0 && patIdx < pat.length ? pat[patIdx] : null;
            return (
              <div key={idx} className="flex flex-col items-center relative w-11">
                {ptr && (
                  <span className={`absolute -top-6 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${POINTER_TONE[ptr.tone]}`}>
                    {ptr.label}
                  </span>
                )}
                <div
                  className={`w-10 h-10 rounded-md border-2 flex items-center justify-center font-mono text-sm font-bold ${
                    mismatch
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-200'
                      : matched
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {ch}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">{idx}</span>
                <div
                  className={`mt-1 w-10 h-9 rounded-md border flex items-center justify-center font-mono text-xs font-bold ${
                    patCh !== null
                      ? mismatch
                        ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200'
                        : 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200'
                      : 'border-transparent text-transparent'
                  }`}
                >
                  {patCh ?? '.'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {frame.hashEntries && frame.hashEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {frame.hashEntries.map((entry) => (
            <div
              key={entry.key}
              className={`px-2.5 py-1 rounded-md border font-mono text-xs tabular-nums ${
                entry.hit
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                  : entry.active
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              {entry.key}: {entry.val}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderGraphSpecSvg(frame: AlgorithmStepFrame) {
  const spec = frame.graphSpec;
  if (!spec) return renderArrayCells(frame);
  const byId = Object.fromEntries(spec.nodes.map((n) => [n.id, n]));

  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 500 228" className="w-full h-56" role="img" aria-label={spec.caption ?? 'Graph visualization'}>
          <defs>
            <marker id="gen-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-slate-400 dark:fill-slate-600" />
            </marker>
            <marker id="gen-arrow-hi" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-sky-500" />
            </marker>
          </defs>

          {spec.edges.map((edge, idx) => {
            const u = byId[edge.u];
            const v = byId[edge.v];
            if (!u || !v) return null;
            const key = `${edge.u}->${edge.v}`;
            const revKey = `${edge.v}->${edge.u}`;
            const active = frame.activeEdges?.includes(key) || (!edge.directed && frame.activeEdges?.includes(revKey));
            const dx = v.x - u.x;
            const dy = v.y - u.y;
            const len = Math.max(Math.hypot(dx, dy), 1);
            const pad = edge.directed ? 24 : 20;
            const x1 = u.x + (dx / len) * 20;
            const y1 = u.y + (dy / len) * 20;
            const x2 = v.x - (dx / len) * pad;
            const y2 = v.y - (dy / len) * pad;
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g key={`${key}-${idx}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth={active ? 3 : 2}
                  strokeDasharray={edge.dashed ? '5 4' : undefined}
                  markerEnd={edge.directed ? (active ? 'url(#gen-arrow-hi)' : 'url(#gen-arrow)') : undefined}
                  className={
                    active
                      ? 'stroke-sky-500'
                      : edge.dashed
                        ? 'stroke-amber-400 dark:stroke-amber-600'
                        : 'stroke-slate-300 dark:stroke-slate-700'
                  }
                />
                {edge.label && (
                  <>
                    <rect
                      x={mx - Math.max(edge.label.length * 3.8, 12)}
                      y={my - 9}
                      width={Math.max(edge.label.length * 7.6, 24)}
                      height={17}
                      rx={4}
                      className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"
                    />
                    <text
                      x={mx}
                      y={my + 3}
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-bold ${
                        active ? 'fill-sky-600 dark:fill-sky-400' : 'fill-slate-600 dark:fill-slate-400'
                      }`}
                    >
                      {edge.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {spec.nodes.map((n) => {
            const isActive = frame.activeNodes?.includes(n.id);
            const isVisited = frame.visitedNodes?.includes(n.id);
            const badge = frame.nodeBadges?.[n.id];
            const circleStyle =
              n.group === 1
                ? 'fill-emerald-500/20 stroke-emerald-500'
                : n.group === 2
                  ? 'fill-sky-500/20 stroke-sky-500'
                  : isActive
                    ? 'fill-sky-500/20 stroke-sky-500'
                    : isVisited
                      ? 'fill-emerald-500/15 stroke-emerald-500'
                      : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700';

            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={20} strokeWidth={2.5} className={circleStyle} />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold"
                >
                  {n.id}
                </text>
                {badge && (
                  <text
                    x={n.x}
                    y={n.y - 25}
                    textAnchor="middle"
                    className="fill-sky-700 dark:fill-sky-400 text-[10px] font-mono font-bold"
                  >
                    {badge}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {spec.caption && (
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 px-1">{spec.caption}</div>
      )}
    </div>
  );
}

function renderMatrixGrid(frame: AlgorithmStepFrame) {
  const mat = frame.matrix;
  if (!mat) return renderArrayCells(frame);
  const isPairIn = (list: [number, number][] | undefined, r: number, c: number) =>
    Boolean(list?.some(([rr, cc]) => rr === r && cc === c));

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-3 overflow-x-auto">
      {mat.subtitle && (
        <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">
          {mat.subtitle}
        </div>
      )}
      <table className="mx-auto border-separate border-spacing-1.5 font-mono text-xs tabular-nums">
        {mat.colLabels && (
          <thead>
            <tr>
              {mat.rowLabels && <th className="px-2 py-1 text-slate-400" />}
              {mat.colLabels.map((cl) => (
                <th key={cl} className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {cl}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {mat.cells.map((row, rIdx) => (
            <tr key={rIdx}>
              {mat.rowLabels && (
                <td className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-right">
                  {mat.rowLabels[rIdx]}
                </td>
              )}
              {row.map((cell, cIdx) => {
                const blocked = isPairIn(mat.blockedCells, rIdx, cIdx);
                const matched = isPairIn(mat.matchedCells, rIdx, cIdx);
                const active = isPairIn(mat.activeCells, rIdx, cIdx);
                const cellClass = blocked
                  ? 'bg-slate-800 dark:bg-slate-700 border-slate-700 text-slate-300 font-bold'
                  : matched
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                    : active
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 font-bold'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';

                return (
                  <td
                    key={cIdx}
                    className={`min-w-[52px] h-10 px-2.5 text-center rounded-md border-2 transition-colors ${cellClass}`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderGeometryHull(frame: AlgorithmStepFrame) {
  const geo = frame.geometrySpec;
  if (!geo) return renderArrayCells(frame);

  // Map mathematical (x in [0..7], y in [0..8]) -> SVG (460 x 215)
  const sx = (x: number) => 42 + (x / 7) * 390;
  const sy = (y: number) => 190 - (y / 8) * 165;

  return (
    <div className="space-y-2.5">
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
        <svg viewBox="0 0 470 218" className="w-full h-56" role="img" aria-label={geo.caption ?? '2D geometry canvas'}>
          {/* Grid axes */}
          {[0, 2, 4, 6, 8].map((gy) => (
            <line key={`gy-${gy}`} x1={42} y1={sy(gy)} x2={432} y2={sy(gy)} strokeWidth={1} className="stroke-slate-200 dark:stroke-slate-800" />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((gx) => (
            <line key={`gx-${gx}`} x1={sx(gx)} y1={25} x2={sx(gx)} y2={190} strokeWidth={1} className="stroke-slate-200 dark:stroke-slate-800" />
          ))}
          <line x1={42} y1={190} x2={436} y2={190} strokeWidth={1.5} className="stroke-slate-400 dark:stroke-slate-600" />
          <line x1={42} y1={22} x2={42} y2={190} strokeWidth={1.5} className="stroke-slate-400 dark:stroke-slate-600" />

          {/* CHT Lines Mode */}
          {geo.mode === 'lines' &&
            (geo.lines ?? []).map((ln) => {
              const x0 = 0;
              const y0 = ln.m * x0 + ln.b;
              const x1 = 4.5;
              const y1 = ln.m * x1 + ln.b;
              const strokeCls =
                ln.status === 'hull'
                  ? 'stroke-sky-600 dark:stroke-sky-400'
                  : ln.status === 'active'
                    ? 'stroke-emerald-500'
                    : 'stroke-rose-400/70 dark:stroke-rose-600/70';
              return (
                <g key={ln.label}>
                  <line
                    x1={sx(x0)}
                    y1={sy(Math.max(0, Math.min(8.2, y0)))}
                    x2={sx(x1)}
                    y2={sy(Math.max(0, Math.min(8.2, y1)))}
                    strokeWidth={ln.status === 'pruned' ? 1.5 : 2.5}
                    strokeDasharray={ln.status === 'pruned' ? '5 4' : undefined}
                    className={strokeCls}
                  />
                  <text
                    x={sx(x1) + 4}
                    y={sy(Math.max(0.4, Math.min(7.8, y1))) + 3}
                    className={`text-[10px] font-mono font-bold ${
                      ln.status === 'pruned' ? 'fill-rose-500' : 'fill-slate-700 dark:fill-slate-300'
                    }`}
                  >
                    {ln.label}
                  </text>
                </g>
              );
            })}

          {/* Query vertical dashed line for CHT */}
          {geo.queryX !== undefined && (
            <line
              x1={sx(geo.queryX)}
              y1={24}
              x2={sx(geo.queryX)}
              y2={190}
              strokeWidth={2}
              strokeDasharray="4 3"
              className="stroke-emerald-500"
            />
          )}

          {/* Convex Hull Polygon Path */}
          {geo.hullPath && geo.hullPath.length >= 2 && (
            <polyline
              points={geo.hullPath.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
              fill="none"
              strokeWidth={2.5}
              className="stroke-sky-500"
            />
          )}

          {/* Points */}
          {geo.points.map((pt) => (
            <g key={pt.label}>
              <circle
                cx={sx(pt.x)}
                cy={sy(pt.y)}
                r={pt.highlight ? 6.5 : 5}
                strokeWidth={2}
                className={
                  pt.pruned
                    ? 'fill-rose-100 dark:fill-rose-950 stroke-rose-500'
                    : pt.highlight
                      ? 'fill-emerald-500 stroke-emerald-700 dark:stroke-emerald-300'
                      : 'fill-white dark:fill-slate-900 stroke-slate-500'
                }
              />
              <text
                x={sx(pt.x) + 8}
                y={sy(pt.y) - 6}
                className={`text-[10px] font-mono font-bold ${
                  pt.pruned ? 'fill-rose-600 dark:fill-rose-400' : 'fill-slate-800 dark:fill-slate-200'
                }`}
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {geo.caption && (
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400 px-1">{geo.caption}</div>
      )}
    </div>
  );
}

function renderNumberSieve(frame: AlgorithmStepFrame) {
  const arr = frame.array ?? [];
  // Compact wrap grid for Prime Sieve (> 9 cells); standard cells for GCD / ModPow / Digit DP
  if (arr.length > 10) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4">
          <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-3">
            Sieve Grid (2 .. {arr[arr.length - 1]}) — Green = Prime · Struck = Composite
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {arr.map((val, idx) => {
              const isPrime = frame.matchedIndices?.includes(idx);
              const isElim = frame.eliminatedIndices?.includes(idx);
              const isHi = frame.highlightIndices?.includes(idx);
              return (
                <div
                  key={idx}
                  className={`h-11 rounded-md border-2 flex items-center justify-center font-mono text-sm font-bold tabular-nums transition-colors ${
                    isHi
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 line-through'
                      : isElim
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 text-slate-400 line-through opacity-55'
                        : isPrime
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
        {frame.hashEntries && frame.hashEntries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {frame.hashEntries.map((e) => (
              <div key={e.key} className="px-3 py-1.5 rounded-md border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                {e.key}: {e.val}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return renderArrayCells(frame, { secondaryLabel: 'state' });
}

export function AlgorithmVisualStage({ algorithm, frame }: AlgorithmVisualStageProps) {
  switch (algorithm.visualType) {
    case 'prefix-hash':
      return renderArrayCells(frame, { secondaryLabel: 'prefix' });
    case 'sliding-window':
      return renderArrayCells(frame, { showWindowBracket: true });
    case 'binary-search':
      return renderArrayCells(frame);
    case 'two-pointers':
      return renderTwoPointersBars(frame);
    case 'monotonic-stack':
      return renderMonotonicStack(frame);
    case 'fast-slow':
      return renderFastSlowSvg(frame);
    case 'tree-traversal':
      return renderTreeSvg(frame);
    case 'heap-intervals':
      return renderIntervalTimeline(frame, true);
    case 'greedy-intervals':
      return renderIntervalTimeline(frame, false);
    case 'graph-topo':
      return renderTopoGraphSvg(frame);
    case 'dijkstra-graph':
      return renderDijkstraGraphSvg(frame);
    case 'backtracking-tree':
      return renderBacktrackingSvg(frame);
    case 'dp-table':
      return renderDpTable(frame);
    case 'merge-sort':
      return renderMergeSort(frame);
    case 'kadane':
      return renderKadane(frame);
    case 'cyclic-sort':
      return renderCyclicSort(frame);
    case 'dfs-stack':
      return renderDfsStack(frame);
    case 'union-find':
      return renderUnionFind(frame);
    case 'bit-grid':
      return renderBitGrid(frame);
    case 'kmp-match':
      return renderKmpMatch(frame);
    case 'weighted-network':
    case 'tree-structure':
      return renderGraphSpecSvg(frame);
    case 'matrix-grid':
      return renderMatrixGrid(frame);
    case 'geometry-hull':
      return renderGeometryHull(frame);
    case 'number-sieve':
      return renderNumberSieve(frame);
    case 'array-cells-bit':
      return renderArrayCells(frame, { secondaryLabel: 'span' });
    case 'stream-partition':
      return renderArrayCells(frame, { secondaryLabel: 'aux', showWindowBracket: true });
    default:
      return renderArrayCells(frame);
  }
}
