import { useState } from 'react';
import { Check, Code2, Copy, Eye } from 'lucide-react';
import type {
  ConceptNode,
  DiagramType,
  SynthesizedDiagram,
} from '../../../core/intelligent-engine/intelligent-engine.types';

interface DiagramCanvasProps {
  concept: ConceptNode;
  diagram: SynthesizedDiagram;
}

function truncateLabel(text: string, maxLen: number): string {
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

function FlowchartSvg({
  concept,
  activePhase,
  onSelectPhase,
}: {
  concept: ConceptNode;
  activePhase: number | null;
  onSelectPhase: (idx: number) => void;
}) {
  const processes = concept.visualSpec.processes;
  const branch = concept.visualSpec.decisionBranches[0];
  const stepGap = 76;
  const startY = 24;
  const initY = startY + 62;
  const firstProcY = initY + 68;
  const branchY = firstProcY + processes.length * stepGap + 12;
  const endY = branch ? branchY + 132 : firstProcY + processes.length * stepGap + 24;
  const totalHeight = endY + 62;

  return (
    <svg
      viewBox={`0 0 720 ${totalHeight}`}
      className="w-full h-auto max-h-[540px]"
      role="img"
      aria-label={`${concept.title} Execution Logic Flowchart`}
    >
      <defs>
        <marker
          id="fc-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-500" />
        </marker>
      </defs>

      {/* Start Node */}
      <rect
        x="170"
        y={startY}
        width="380"
        height="40"
        rx="20"
        className="fill-sky-50 dark:fill-sky-950/60 stroke-sky-500 dark:stroke-sky-400"
        strokeWidth="1.5"
      />
      <text
        x="360"
        y={startY + 24}
        textAnchor="middle"
        className="fill-sky-900 dark:fill-sky-100 text-[11px] font-mono font-semibold"
      >
        START: {truncateLabel(concept.visualSpec.inputs.join(' + '), 48)}
      </text>

      <line
        x1="360"
        y1={startY + 40}
        x2="360"
        y2={initY - 3}
        className="stroke-slate-400 dark:stroke-slate-600"
        strokeWidth="1.5"
        markerEnd="url(#fc-arrow)"
      />

      {/* Initialize Data Stores */}
      <rect
        x="150"
        y={initY}
        width="420"
        height="44"
        rx="8"
        className="fill-slate-100 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
        strokeWidth="1.5"
      />
      <text
        x="360"
        y={initY + 18}
        textAnchor="middle"
        className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono uppercase"
      >
        Initialize State Stores
      </text>
      <text
        x="360"
        y={initY + 34}
        textAnchor="middle"
        className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-semibold"
      >
        {truncateLabel(concept.visualSpec.dataStores.join(' · '), 56)}
      </text>

      {/* Process Steps */}
      {processes.map((proc, idx) => {
        const y = firstProcY + idx * stepGap;
        const prevBottom = idx === 0 ? initY + 44 : firstProcY + (idx - 1) * stepGap + 46;
        const selected = activePhase === idx;
        return (
          <g
            key={idx}
            onClick={() => onSelectPhase(idx)}
            className="cursor-pointer"
          >
            <line
              x1="360"
              y1={prevBottom}
              x2="360"
              y2={y - 3}
              className="stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="1.5"
              markerEnd="url(#fc-arrow)"
            />
            <rect
              x="140"
              y={y}
              width="440"
              height="46"
              rx="8"
              className={
                selected
                  ? 'fill-sky-600 stroke-sky-700'
                  : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 hover:stroke-sky-400'
              }
              strokeWidth={selected ? '2' : '1.5'}
            />
            <text
              x="162"
              y={y + 27}
              className={
                selected
                  ? 'fill-sky-100 text-[11px] font-mono font-bold'
                  : 'fill-sky-600 dark:fill-sky-400 text-[11px] font-mono font-bold'
              }
            >
              0{idx + 1}
            </text>
            <text
              x="192"
              y={y + 27}
              className={
                selected
                  ? 'fill-white text-[12px] font-semibold'
                  : 'fill-slate-800 dark:fill-slate-100 text-[12px] font-medium'
              }
            >
              {truncateLabel(proc, 54)}
            </text>
          </g>
        );
      })}

      {/* Decision Branch Diamond */}
      {branch && (
        <g>
          <line
            x1="360"
            y1={firstProcY + Math.max(0, processes.length - 1) * stepGap + 46}
            x2="360"
            y2={branchY - 3}
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.5"
            markerEnd="url(#fc-arrow)"
          />
          <polygon
            points={`360,${branchY} 525,${branchY + 28} 360,${branchY + 56} 195,${branchY + 28}`}
            className="fill-amber-50 dark:fill-amber-950/50 stroke-amber-500 dark:stroke-amber-400"
            strokeWidth="1.5"
          />
          <text
            x="360"
            y={branchY + 32}
            textAnchor="middle"
            className="fill-amber-900 dark:fill-amber-200 text-[10.5px] font-mono font-semibold"
          >
            {truncateLabel(branch.condition, 36)}?
          </text>

          {/* True Branch Left */}
          <path
            d={`M 195 ${branchY + 28} L 130 ${branchY + 28} L 130 ${branchY + 68}`}
            fill="none"
            className="stroke-emerald-500"
            strokeWidth="1.5"
            markerEnd="url(#fc-arrow)"
          />
          <text
            x="160"
            y={branchY + 21}
            textAnchor="middle"
            className="fill-emerald-700 dark:fill-emerald-400 text-[10px] font-mono font-bold"
          >
            YES
          </text>
          <rect
            x="24"
            y={branchY + 72}
            width="280"
            height="40"
            rx="8"
            className="fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-400 dark:stroke-emerald-700"
            strokeWidth="1.5"
          />
          <text
            x="164"
            y={branchY + 96}
            textAnchor="middle"
            className="fill-emerald-900 dark:fill-emerald-200 text-[10.5px] font-medium"
          >
            {truncateLabel(branch.truePath, 40)}
          </text>

          {/* False Branch Right */}
          <path
            d={`M 525 ${branchY + 28} L 590 ${branchY + 28} L 590 ${branchY + 68}`}
            fill="none"
            className="stroke-rose-500"
            strokeWidth="1.5"
            markerEnd="url(#fc-arrow)"
          />
          <text
            x="560"
            y={branchY + 21}
            textAnchor="middle"
            className="fill-rose-700 dark:fill-rose-400 text-[10px] font-mono font-bold"
          >
            NO
          </text>
          <rect
            x="416"
            y={branchY + 72}
            width="280"
            height="40"
            rx="8"
            className="fill-rose-50 dark:fill-rose-950/40 stroke-rose-400 dark:stroke-rose-700"
            strokeWidth="1.5"
          />
          <text
            x="556"
            y={branchY + 96}
            textAnchor="middle"
            className="fill-rose-900 dark:fill-rose-200 text-[10.5px] font-medium"
          >
            {truncateLabel(branch.falsePath, 40)}
          </text>

          {/* Merge back to End */}
          <path
            d={`M 164 ${branchY + 112} L 164 ${endY + 20} L 208 ${endY + 20}`}
            fill="none"
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.4"
            markerEnd="url(#fc-arrow)"
          />
          <path
            d={`M 556 ${branchY + 112} L 556 ${endY + 20} L 512 ${endY + 20}`}
            fill="none"
            className="stroke-slate-400 dark:stroke-slate-600"
            strokeWidth="1.4"
            markerEnd="url(#fc-arrow)"
          />
        </g>
      )}

      {/* Return / End Node */}
      <rect
        x="212"
        y={endY}
        width="296"
        height="40"
        rx="20"
        className="fill-emerald-50 dark:fill-emerald-950/60 stroke-emerald-500 dark:stroke-emerald-400"
        strokeWidth="1.5"
      />
      <text
        x="360"
        y={endY + 24}
        textAnchor="middle"
        className="fill-emerald-900 dark:fill-emerald-100 text-[11px] font-mono font-semibold"
      >
        RETURN: {truncateLabel(concept.visualSpec.outputs.join(', '), 38)}
      </text>
    </svg>
  );
}

function DataFlowDiagramSvg({ concept }: { concept: ConceptNode }) {
  const inputs = concept.visualSpec.inputs.slice(0, 3);
  const processes = concept.visualSpec.processes.slice(0, 4);
  const stores = concept.visualSpec.dataStores.slice(0, 3);
  const outputs = concept.visualSpec.outputs.slice(0, 2);

  return (
    <svg
      viewBox="0 0 820 380"
      className="w-full h-auto"
      role="img"
      aria-label={`${concept.title} Level-1 Data Flow Diagram`}
    >
      <defs>
        <marker
          id="dfd-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-500 dark:fill-sky-400" />
        </marker>
      </defs>

      {/* Column headers */}
      <text x="86" y="24" textAnchor="middle" className="fill-slate-400 text-[10px] font-mono uppercase">
        External Inputs
      </text>
      <text x="410" y="24" textAnchor="middle" className="fill-slate-400 text-[10px] font-mono uppercase">
        Core Processes (Level-1 DFD)
      </text>
      <text x="734" y="24" textAnchor="middle" className="fill-slate-400 text-[10px] font-mono uppercase">
        Outputs
      </text>

      {/* External Inputs */}
      {inputs.map((inp, i) => {
        const y = 76 + i * 74;
        return (
          <g key={i}>
            <rect
              x="16"
              y={y}
              width="140"
              height="48"
              rx="6"
              className="fill-white dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600"
              strokeWidth="1.5"
            />
            <text
              x="86"
              y={y + 20}
              textAnchor="middle"
              className="fill-slate-500 dark:fill-slate-400 text-[9px] font-mono"
            >
              INPUT {i + 1}
            </text>
            <text
              x="86"
              y={y + 36}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 text-[10px] font-semibold"
            >
              {truncateLabel(inp, 20)}
            </text>
            <line
              x1="156"
              y1={y + 24}
              x2="208"
              y2="124"
              className="stroke-sky-500 dark:stroke-sky-400"
              strokeWidth="1.4"
              markerEnd="url(#dfd-arrow)"
            />
          </g>
        );
      })}

      {/* Process Bubbles */}
      {processes.map((proc, i) => {
        const cx = 252 + i * 116;
        const cy = 124;
        return (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r="42"
              className="fill-sky-50 dark:fill-sky-950/60 stroke-sky-500 dark:stroke-sky-400"
              strokeWidth="1.75"
            />
            <text
              x={cx}
              y={cy - 14}
              textAnchor="middle"
              className="fill-sky-700 dark:fill-sky-300 text-[10px] font-mono font-bold"
            >
              {i + 1}.0
            </text>
            <text
              x={cx}
              y={cy + 3}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 text-[9.5px] font-semibold"
            >
              {truncateLabel(proc.split(' ').slice(0, 2).join(' '), 14)}
            </text>
            <text
              x={cx}
              y={cy + 16}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-300 text-[8.5px]"
            >
              {truncateLabel(proc.split(' ').slice(2).join(' '), 15)}
            </text>
            {i < processes.length - 1 && (
              <line
                x1={cx + 42}
                y1={cy}
                x2={cx + 71}
                y2={cy}
                className="stroke-sky-500 dark:stroke-sky-400"
                strokeWidth="1.5"
                markerEnd="url(#dfd-arrow)"
              />
            )}
          </g>
        );
      })}

      {/* Data Stores (Open-sided DFD Store Notation along bottom) */}
      <text x="410" y="254" textAnchor="middle" className="fill-slate-400 text-[10px] font-mono uppercase">
        State & Data Stores (Read / Write)
      </text>
      {stores.map((ds, i) => {
        const total = stores.length;
        const w = 186;
        const gap = 22;
        const startX = 410 - (total * w + (total - 1) * gap) / 2;
        const x = startX + i * (w + gap);
        const y = 274;
        const procTargetX = 252 + Math.min(i, processes.length - 1) * 116;
        return (
          <g key={i}>
            <line
              x1={procTargetX}
              y1="168"
              x2={x + w / 2}
              y2={y - 4}
              className="stroke-amber-500 dark:stroke-amber-400"
              strokeWidth="1.3"
              strokeDasharray="4 3"
              markerEnd="url(#dfd-arrow)"
            />
            <line x1={x} y1={y} x2={x + w} y2={y} className="stroke-amber-500" strokeWidth="2" />
            <line x1={x} y1={y + 44} x2={x + w} y2={y + 44} className="stroke-amber-500" strokeWidth="2" />
            <rect
              x={x}
              y={y + 1}
              width={w}
              height="42"
              className="fill-amber-50/70 dark:fill-amber-950/40"
            />
            <line x1={x + 34} y1={y} x2={x + 34} y2={y + 44} className="stroke-amber-500" strokeWidth="1.5" />
            <text
              x={x + 17}
              y={y + 26}
              textAnchor="middle"
              className="fill-amber-800 dark:fill-amber-300 text-[10px] font-mono font-bold"
            >
              D{i + 1}
            </text>
            <text
              x={x + 110}
              y={y + 26}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 text-[10px] font-semibold"
            >
              {truncateLabel(ds, 24)}
            </text>
          </g>
        );
      })}

      {/* Outputs */}
      {outputs.map((out, i) => {
        const y = 100 + i * 74;
        const lastProcX = 252 + Math.max(0, processes.length - 1) * 116;
        return (
          <g key={i}>
            <line
              x1={lastProcX + 42}
              y1="124"
              x2="660"
              y2={y + 24}
              className="stroke-emerald-500"
              strokeWidth="1.5"
              markerEnd="url(#dfd-arrow)"
            />
            <rect
              x="664"
              y={y}
              width="140"
              height="48"
              rx="6"
              className="fill-emerald-50 dark:fill-emerald-950/50 stroke-emerald-500 dark:stroke-emerald-400"
              strokeWidth="1.5"
            />
            <text
              x="734"
              y={y + 20}
              textAnchor="middle"
              className="fill-emerald-700 dark:fill-emerald-300 text-[9px] font-mono font-bold"
            >
              OUTPUT {i + 1}
            </text>
            <text
              x="734"
              y={y + 36}
              textAnchor="middle"
              className="fill-emerald-950 dark:fill-emerald-100 text-[10px] font-semibold"
            >
              {truncateLabel(out, 20)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StateMachineSvg({ concept }: { concept: ConceptNode }) {
  const states = [
    { id: 'INIT', label: 'Init Stores', sub: truncateLabel(concept.visualSpec.dataStores[0] ?? 'State', 18) },
    ...concept.visualSpec.processes.slice(0, 3).map((p, i) => ({
      id: `S${i + 1}`,
      label: `Phase ${i + 1}`,
      sub: truncateLabel(p, 20),
    })),
    { id: 'EMIT', label: 'Emit Verified', sub: truncateLabel(concept.visualSpec.outputs[0] ?? 'Result', 18) },
  ];

  const branch = concept.visualSpec.decisionBranches[0];

  return (
    <svg
      viewBox="0 0 820 260"
      className="w-full h-auto"
      role="img"
      aria-label={`${concept.title} State Machine`}
    >
      <defs>
        <marker
          id="sm-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" className="fill-indigo-500 dark:fill-indigo-400" />
        </marker>
      </defs>

      {states.map((st, idx) => {
        const x = 22 + idx * 158;
        const y = 64;
        return (
          <g key={st.id}>
            <rect
              x={x}
              y={y}
              width="134"
              height="62"
              rx="12"
              className={
                idx === 0
                  ? 'fill-sky-50 dark:fill-sky-950/60 stroke-sky-500'
                  : idx === states.length - 1
                    ? 'fill-emerald-50 dark:fill-emerald-950/60 stroke-emerald-500'
                    : 'fill-white dark:fill-slate-900 stroke-indigo-400 dark:stroke-indigo-600'
              }
              strokeWidth="1.6"
            />
            <text
              x={x + 67}
              y={y + 24}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold"
            >
              {st.label}
            </text>
            <text
              x={x + 67}
              y={y + 44}
              textAnchor="middle"
              className="fill-slate-600 dark:fill-slate-400 text-[9.5px]"
            >
              {st.sub}
            </text>
            {idx < states.length - 1 && (
              <line
                x1={x + 134}
                y1={y + 31}
                x2={x + 154}
                y2={y + 31}
                className="stroke-indigo-500 dark:stroke-indigo-400"
                strokeWidth="1.6"
                markerEnd="url(#sm-arrow)"
              />
            )}
          </g>
        );
      })}

      {/* Feedback Transition Arc */}
      <path
        d="M 556 126 C 556 204, 240 204, 240 130"
        fill="none"
        className="stroke-amber-500"
        strokeWidth="1.5"
        strokeDasharray="5 3"
        markerEnd="url(#sm-arrow)"
      />
      <rect
        x="248"
        y="174"
        width="300"
        height="46"
        rx="8"
        className="fill-amber-50 dark:fill-amber-950/40 stroke-amber-400 dark:stroke-amber-700"
        strokeWidth="1.2"
      />
      <text
        x="398"
        y="193"
        textAnchor="middle"
        className="fill-amber-900 dark:fill-amber-200 text-[10px] font-mono font-semibold"
      >
        Loop / Invariant Guard: {truncateLabel(branch?.condition ?? concept.invariantRule, 36)}
      </text>
      <text
        x="398"
        y="209"
        textAnchor="middle"
        className="fill-amber-700 dark:fill-amber-300 text-[9.5px]"
      >
        Repair / Advance: {truncateLabel(branch?.falsePath ?? 'Iterate next element', 44)}
      </text>
    </svg>
  );
}

function SequenceTraceSvg({ concept }: { concept: ConceptNode }) {
  const lanes = [
    { x: 100, title: 'Input Stream', sub: truncateLabel(concept.visualSpec.inputs[0] ?? 'Raw Input', 18) },
    { x: 300, title: 'Invariant Engine', sub: concept.complexity.time },
    { x: 510, title: 'Primary Store', sub: truncateLabel(concept.visualSpec.dataStores[0] ?? 'Store', 18) },
    { x: 710, title: 'Result Builder', sub: truncateLabel(concept.visualSpec.outputs[0] ?? 'Output', 18) },
  ];

  const messages = [
    { from: 0, to: 1, y: 102, label: `1. Feed (${truncateLabel(concept.visualSpec.inputs.join(', '), 32)})`, dashed: false },
    { from: 1, to: 2, y: 152, label: `2. Mutate / Index (${truncateLabel(concept.visualSpec.processes[0] ?? 'Update', 30)})`, dashed: false },
    { from: 2, to: 1, y: 202, label: `3. O(1)/O(log N) Lookup (${concept.complexity.space})`, dashed: true },
    { from: 1, to: 3, y: 254, label: `4. Emit (${truncateLabel(concept.visualSpec.outputs.join(', '), 32)})`, dashed: false },
  ];

  return (
    <svg
      viewBox="0 0 820 315"
      className="w-full h-auto"
      role="img"
      aria-label={`${concept.title} Component Sequence Trace`}
    >
      <defs>
        <marker
          id="seq-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
        </marker>
      </defs>

      {lanes.map((lane, idx) => (
        <g key={idx}>
          <rect
            x={lane.x - 82}
            y="16"
            width="164"
            height="48"
            rx="8"
            className="fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.5"
          />
          <text
            x={lane.x}
            y="36"
            textAnchor="middle"
            className="fill-slate-900 dark:fill-slate-100 text-[11px] font-mono font-bold"
          >
            {lane.title}
          </text>
          <text
            x={lane.x}
            y="53"
            textAnchor="middle"
            className="fill-slate-500 dark:fill-slate-400 text-[9.5px]"
          >
            {lane.sub}
          </text>
          <line
            x1={lane.x}
            y1="64"
            x2={lane.x}
            y2="296"
            className="stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </g>
      ))}

      {messages.map((m, idx) => {
        const x1 = lanes[m.from].x;
        const x2 = lanes[m.to].x;
        const midX = (x1 + x2) / 2;
        return (
          <g key={idx}>
            <line
              x1={x1}
              y1={m.y}
              x2={x2 > x1 ? x2 - 6 : x2 + 6}
              y2={m.y}
              className="stroke-sky-600 dark:stroke-sky-400"
              strokeWidth="1.6"
              strokeDasharray={m.dashed ? '5 3' : undefined}
              markerEnd="url(#seq-arrow)"
            />
            <text
              x={midX}
              y={m.y - 8}
              textAnchor="middle"
              className="fill-slate-800 dark:fill-slate-200 text-[10px] font-mono font-semibold"
            >
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function DiagramCanvas({ concept, diagram }: DiagramCanvasProps) {
  const [showMermaidCode, setShowMermaidCode] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const [activePhase, setActivePhase] = useState<number | null>(0);

  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(diagram.mermaidCode);
      setCopiedMermaid(true);
      window.setTimeout(() => setCopiedMermaid(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  const renderVisual = (type: DiagramType) => {
    switch (type) {
      case 'FLOWCHART':
        return (
          <FlowchartSvg
            concept={concept}
            activePhase={activePhase}
            onSelectPhase={setActivePhase}
          />
        );
      case 'DFD':
        return <DataFlowDiagramSvg concept={concept} />;
      case 'STATE_MACHINE':
        return <StateMachineSvg concept={concept} />;
      case 'DATA_STRUCTURE_TRACE':
        return <SequenceTraceSvg concept={concept} />;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Synthesized {diagram.type.replace(/_/g, ' ')}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {diagram.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowMermaidCode((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
          >
            {showMermaidCode ? (
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{showMermaidCode ? 'Show Interactive SVG' : 'View Mermaid Syntax'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMermaid}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors"
          >
            {copiedMermaid ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{copiedMermaid ? 'Copied Mermaid' : 'Copy Mermaid'}</span>
          </button>
        </div>
      </div>

      {/* Interactive SVG or Mermaid Code Panel */}
      <div className="p-4 bg-slate-50/60 dark:bg-slate-950/60 overflow-x-auto">
        {showMermaidCode ? (
          <pre className="p-4 rounded-lg bg-slate-950 text-sky-200 font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
            <code>{diagram.mermaidCode}</code>
          </pre>
        ) : (
          renderVisual(diagram.type)
        )}
      </div>

      {/* Synced Plain-English Step Annotations */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Synced Diagram Walkthrough Annotations
        </div>
        <ul className="space-y-1">
          {diagram.stepAnnotations.map((note, idx) => (
            <li
              key={idx}
              className={`text-xs leading-relaxed px-2 py-1 rounded ${
                diagram.type === 'FLOWCHART' && activePhase !== null && idx === activePhase + 1
                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-medium'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <span className="font-mono text-sky-600 dark:text-sky-400 mr-2 tabular-nums">
                {String(idx + 1).padStart(2, '0')}.
              </span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
