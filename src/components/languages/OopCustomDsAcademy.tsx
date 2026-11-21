import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Code2,
  Cpu,
  Layers,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Trash2,
  Wrench,
} from 'lucide-react';
import type { LangTrack } from '../../data/languagesTutorialData';
import {
  CUSTOM_DS_BLUEPRINTS,
  OOP_CODING_MODULES,
  type CustomDsBlueprint,
  type CustomDsId,
  type MiniDfdEdge,
  type MiniDfdNode,
  type MiniDfdStep,
  type OopCodingModule,
} from '../../data/langOopCustomDsData';
import { CopyButton, SegmentedTabBar } from '../ui';

export interface OopCustomDsAcademyProps {
  languageFilter: 'all' | LangTrack;
}

type AcademyMode = 'oop-internals' | 'custom-ds';
type DsCodeTab = 'reference' | 'playground';

/* ============================================================================
   SHARED ANIMATED MINI-DFD ENGINE (SVG + requestAnimationFrame)
   ============================================================================ */

interface MiniDfdAnimatorProps {
  title: string;
  subtitle: string;
  nodes: MiniDfdNode[];
  edges: MiniDfdEdge[];
  steps: MiniDfdStep[];
  resetKey: string;
}

function MiniDfdAnimator({
  title,
  subtitle,
  nodes,
  edges,
  steps,
  resetKey,
}: MiniDfdAnimatorProps) {
  const markerPrefix = useId().replace(/:/g, '');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [packetT, setPacketT] = useState(0.5);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
    setPacketT(0.5);
  }, [resetKey]);

  const currentStep = steps[stepIdx] ?? steps[0];

  const reducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      return;
    }
    if (reducedMotion) {
      setPacketT(0.55);
      const timer = window.setInterval(() => {
        setStepIdx((prev) => (prev + 1) % steps.length);
      }, 2600);
      return () => window.clearInterval(timer);
    }

    lastTimeRef.current = performance.now();
    let localT = 0;
    const stepDurationMs = 2400;

    const tick = (now: number) => {
      const dt = Math.min(80, now - lastTimeRef.current);
      lastTimeRef.current = now;
      localT += dt / stepDurationMs;
      if (localT >= 1) {
        localT = 0;
        setStepIdx((prev) => (prev + 1) % steps.length);
      }
      setPacketT(localT);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, reducedMotion, steps.length]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, MiniDfdNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  const handlePrev = () => {
    setIsPlaying(false);
    setStepIdx((prev) => (prev - 1 + steps.length) % steps.length);
    setPacketT(0.55);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setStepIdx((prev) => (prev + 1) % steps.length);
    setPacketT(0.55);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIdx(0);
    setPacketT(0.5);
  };

  const activeNodeSet = new Set(currentStep?.activeNodeIds ?? []);
  const activeEdgeSet = new Set(currentStep?.activeEdgeIds ?? []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      {/* Header + Transport Controls */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Animated Data Flow Diagram (DFD)
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Play Flow'}
          </button>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous DFD step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
            {stepIdx + 1}/{steps.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next DFD step"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset DFD animation"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="p-4 bg-slate-50/40 dark:bg-slate-950/40">
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 668 224"
            className="w-full min-w-[540px] h-auto max-h-[245px]"
            role="img"
            aria-label={`Data flow diagram for ${title}`}
          >
            <defs>
              <marker
                id={`${markerPrefix}-idle`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-600" />
              </marker>
              <marker
                id={`${markerPrefix}-active`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge) => {
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);
              if (!fromNode || !toNode) return null;

              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const dist = Math.hypot(dx, dy) || 1;
              const ux = dx / dist;
              const uy = dy / dist;

              const padStart = 64;
              const padEnd = 68;
              const x1 = fromNode.x + ux * padStart;
              const y1 = fromNode.y + uy * Math.min(28, padStart * 0.45);
              const x2 = toNode.x - ux * padEnd;
              const y2 = toNode.y - uy * Math.min(28, padEnd * 0.45);

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2 - 12;

              const isActive = activeEdgeSet.has(edge.id);
              const px = x1 + (x2 - x1) * packetT;
              const py = y1 + (y2 - y1) * packetT;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? undefined : '4 4'}
                    markerEnd={`url(#${markerPrefix}-${isActive ? 'active' : 'idle'})`}
                    className={
                      isActive
                        ? 'stroke-sky-600 dark:stroke-sky-400 transition-colors'
                        : 'stroke-slate-300 dark:stroke-slate-700 transition-colors'
                    }
                  />
                  <rect
                    x={midX - 44}
                    y={midY - 9}
                    width={88}
                    height={16}
                    rx={4}
                    className={
                      isActive
                        ? 'fill-sky-50 dark:fill-sky-950/90 stroke-sky-300 dark:stroke-sky-700'
                        : 'fill-white/95 dark:fill-slate-900/95 stroke-slate-200 dark:stroke-slate-800'
                    }
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 2}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[9px] font-mono font-semibold fill-sky-800 dark:fill-sky-300'
                        : 'text-[9px] font-mono fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {edge.label}
                  </text>

                  {isActive && (
                    <g>
                      <circle
                        cx={px}
                        cy={py}
                        r={6}
                        className="fill-sky-600 dark:fill-sky-400 stroke-white dark:stroke-slate-950"
                        strokeWidth={2}
                      />
                      {currentStep?.packetLabel && (
                        <g transform={`translate(${px}, ${py - 15})`}>
                          <rect
                            x={-48}
                            y={-9}
                            width={96}
                            height={16}
                            rx={4}
                            className="fill-slate-900 dark:fill-sky-500"
                          />
                          <text
                            x={0}
                            y={2}
                            textAnchor="middle"
                            className="text-[8.5px] font-mono font-bold fill-white dark:fill-slate-950"
                          >
                            {currentStep.packetLabel.slice(0, 18)}
                          </text>
                        </g>
                      )}
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isActive = activeNodeSet.has(node.id);
              const w = 132;
              const h = 54;
              return (
                <g key={node.id} transform={`translate(${node.x - w / 2}, ${node.y - h / 2})`}>
                  <rect
                    width={w}
                    height={h}
                    rx={10}
                    strokeWidth={isActive ? 2 : 1.2}
                    className={
                      isActive
                        ? 'fill-sky-50 dark:fill-sky-950/70 stroke-sky-600 dark:stroke-sky-400 transition-colors'
                        : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700 transition-colors'
                    }
                  />
                  <text
                    x={w / 2}
                    y={23}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[11px] font-bold fill-slate-900 dark:fill-white'
                        : 'text-[11px] font-semibold fill-slate-800 dark:fill-slate-200'
                    }
                  >
                    {node.label}
                  </text>
                  <text
                    x={w / 2}
                    y={40}
                    textAnchor="middle"
                    className={
                      isActive
                        ? 'text-[9.5px] font-mono fill-sky-700 dark:fill-sky-300'
                        : 'text-[9.5px] font-mono fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {node.sublabel}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Active Step Explanation */}
        {currentStep && (
          <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Step {currentStep.step}: {currentStep.title}
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300">
                SIGNAL: {currentStep.packetLabel}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-5">
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Simple English
                </div>
                <p className="text-slate-700 dark:text-slate-300">{currentStep.plainEnglish}</p>
              </div>
              <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1">
                  Under the Hood (Memory &amp; Runtime)
                </div>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  {currentStep.technicalDetail}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Clickable Step Selector Strip */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {steps.map((s, idx) => {
            const active = idx === stepIdx;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(idx);
                  setPacketT(0.55);
                }}
                className={`text-left rounded-lg border px-2.5 py-2 transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400">
                  STEP 0{s.step}
                </div>
                <div className="text-xs font-medium truncate">{s.title}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   CUSTOM DATA STRUCTURES — LIVE INTERACTIVE MEMORY & POINTER SIMULATORS
   ============================================================================ */

interface BstNode {
  val: number;
  left: BstNode | null;
  right: BstNode | null;
}

function bstInsert(root: BstNode | null, val: number): { root: BstNode; path: number[]; inserted: boolean } {
  const path: number[] = [];
  if (!root) return { root: { val, left: null, right: null }, path: [val], inserted: true };

  const clone = (node: BstNode | null): BstNode | null =>
    node ? { val: node.val, left: clone(node.left), right: clone(node.right) } : null;

  const nextRoot = clone(root)!;
  let cur: BstNode = nextRoot;
  while (true) {
    path.push(cur.val);
    if (val === cur.val) {
      return { root: nextRoot, path, inserted: false };
    }
    if (val < cur.val) {
      if (!cur.left) {
        cur.left = { val, left: null, right: null };
        path.push(val);
        return { root: nextRoot, path, inserted: true };
      }
      cur = cur.left;
    } else {
      if (!cur.right) {
        cur.right = { val, left: null, right: null };
        path.push(val);
        return { root: nextRoot, path, inserted: true };
      }
      cur = cur.right;
    }
  }
}

function bstSearch(root: BstNode | null, target: number): { found: boolean; path: number[] } {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.val);
    if (target === cur.val) return { found: true, path };
    cur = target < cur.val ? cur.left : cur.right;
  }
  return { found: false, path };
}

function bstInorder(root: BstNode | null, out: number[] = []): number[] {
  if (!root) return out;
  bstInorder(root.left, out);
  out.push(root.val);
  bstInorder(root.right, out);
  return out;
}

function buildInitialBst(): BstNode {
  let root: BstNode | null = null;
  for (const v of [50, 30, 70, 20, 40, 60, 80]) {
    root = bstInsert(root, v).root;
  }
  return root!;
}

interface PositionedTreeNode {
  val: number;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function layoutBst(
  node: BstNode | null,
  x: number,
  y: number,
  spread: number,
  parentX?: number,
  parentY?: number,
  acc: PositionedTreeNode[] = []
): PositionedTreeNode[] {
  if (!node) return acc;
  acc.push({ val: node.val, x, y, parentX, parentY });
  layoutBst(node.left, x - spread, y + 54, Math.max(28, spread * 0.52), x, y, acc);
  layoutBst(node.right, x + spread, y + 54, Math.max(28, spread * 0.52), x, y, acc);
  return acc;
}

function simpleHash(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface HashEntry {
  key: string;
  value: number;
  hash: number;
}

function CustomDsLiveSimulator({ dsId }: { dsId: CustomDsId }) {
  // 1. Dynamic Array state
  const [arrData, setArrData] = useState<number[]>([10, 20, 30]);
  const [arrCap, setArrCap] = useState<number>(4);
  const [arrResizes, setArrResizes] = useState<number>(0);
  const [arrLastResize, setArrLastResize] = useState<boolean>(false);
  const [arrTrace, setArrTrace] = useState<string>(
    'Backing array has 3 active elements inside 4 contiguous slots. Click Append twice to witness a 2x geometric resize.'
  );
  const [arrInput, setArrInput] = useState<string>('40');

  // 2. Doubly Linked List state
  const [dllNodes, setDllNodes] = useState<string[]>(['A1', 'B2', 'C3']);
  const [dllHighlightIdx, setDllHighlightIdx] = useState<number | null>(null);
  const [dllTrace, setDllTrace] = useState<string>(
    'Sentinel HEAD and TAIL pointers let us insert or remove at either end in O(1) without shifting elements.'
  );
  const [dllInput, setDllInput] = useState<string>('D4');

  // 3. Custom HashMap state
  const [hmCap, setHmCap] = useState<number>(4);
  const [hmEntries, setHmEntries] = useState<HashEntry[]>(() => {
    const seed: [string, number][] = [
      ['alice', 95],
      ['bob', 88],
    ];
    return seed.map(([key, value]) => ({ key, value, hash: simpleHash(key) }));
  });
  const [hmKeyInput, setHmKeyInput] = useState<string>('carol');
  const [hmValInput, setHmValInput] = useState<string>('91');
  const [hmActiveBucket, setHmActiveBucket] = useState<number | null>(null);
  const [hmTrace, setHmTrace] = useState<string>(
    'Each key hashes to bucket = hash & (capacity - 1). Load factor > 0.75 triggers automatic 2x rehash.'
  );

  // 4. Circular Queue state
  const [cqCap, setCqCap] = useState<number>(6);
  const [cqSlots, setCqSlots] = useState<(string | null)[]>(['T1', 'T2', 'T3', null, null, null]);
  const [cqHead, setCqHead] = useState<number>(0);
  const [cqSize, setCqSize] = useState<number>(3);
  const [cqInput, setCqInput] = useState<string>('T4');
  const [cqTrace, setCqTrace] = useState<string>(
    'HEAD=0, TAIL=(head+size)%cap=3. Dequeue advances HEAD modulo capacity without shifting any elements!'
  );

  // 5. Binary Min-Heap state
  const [heap, setHeap] = useState<number[]>([5, 12, 9, 21, 18, 15]);
  const [heapInput, setHeapInput] = useState<string>('3');
  const [heapHighlight, setHeapHighlight] = useState<number[]>([]);
  const [heapTrace, setHeapTrace] = useState<string>(
    'Min-Heap invariant: heap[0] is always the smallest value. Parent=(i-1)//2, Left=2i+1, Right=2i+2.'
  );

  // 6. Binary Search Tree state
  const [bstRoot, setBstRoot] = useState<BstNode>(() => buildInitialBst());
  const [bstInput, setBstInput] = useState<string>('65');
  const [bstPath, setBstPath] = useState<number[]>([]);
  const [bstTrace, setBstTrace] = useState<string>(
    'Every left subtree holds smaller keys and every right subtree holds larger keys. Inorder traversal outputs sorted values.'
  );

  // Dynamic Array handlers
  const handleArrAppend = () => {
    const val = Number.parseInt(arrInput, 10);
    const num = Number.isFinite(val) ? val : (arrData[arrData.length - 1] ?? 0) + 10;
    let nextCap = arrCap;
    let resized = false;
    if (arrData.length === arrCap) {
      nextCap = arrCap * 2;
      resized = true;
      setArrCap(nextCap);
      setArrResizes((r) => r + 1);
    }
    const nextData = [...arrData, num];
    setArrData(nextData);
    setArrLastResize(resized);
    setArrInput(String(num + 10));
    setArrTrace(
      resized
        ? `RESIZE TRIGGERED! Full capacity (${arrCap}) -> allocated new array of ${nextCap} slots, copied ${arrData.length} items, appended ${num} at index ${arrData.length}.`
        : `O(1) fast append: wrote ${num} directly to slot [${arrData.length}] (size=${nextData.length}/${nextCap}).`
    );
  };

  const handleArrPop = () => {
    if (arrData.length === 0) return;
    const removed = arrData[arrData.length - 1];
    const next = arrData.slice(0, -1);
    setArrData(next);
    setArrLastResize(false);
    setArrTrace(`O(1) pop: removed ${removed} from tail index [${next.length}] and nulled slot reference.`);
  };

  const handleArrReset = () => {
    setArrData([10, 20, 30]);
    setArrCap(4);
    setArrResizes(0);
    setArrLastResize(false);
    setArrInput('40');
    setArrTrace('Reset dynamic array to 3 items in a 4-slot contiguous buffer.');
  };

  // Doubly Linked List handlers
  const handleDllAddFirst = () => {
    const label = dllInput.trim() || `N${dllNodes.length + 1}`;
    setDllNodes([label, ...dllNodes]);
    setDllHighlightIdx(0);
    setDllInput(`N${dllNodes.length + 2}`);
    setDllTrace(
      `O(1) addFirst("${label}"): rewired head.next -> [${label}] <-> oldFirst without touching any other node.`
    );
  };

  const handleDllAddLast = () => {
    const label = dllInput.trim() || `N${dllNodes.length + 1}`;
    const next = [...dllNodes, label];
    setDllNodes(next);
    setDllHighlightIdx(next.length - 1);
    setDllInput(`N${next.length + 1}`);
    setDllTrace(
      `O(1) addLast("${label}"): rewired oldLast <-> [${label}] <- tail using tail.prev pointer.`
    );
  };

  const handleDllRemoveFirst = () => {
    if (dllNodes.length === 0) return;
    const removed = dllNodes[0];
    setDllNodes(dllNodes.slice(1));
    setDllHighlightIdx(0);
    setDllTrace(`O(1) removeFirst(): unlinked "${removed}" and wired head.next directly to next node.`);
  };

  const handleDllRemoveLast = () => {
    if (dllNodes.length === 0) return;
    const removed = dllNodes[dllNodes.length - 1];
    const next = dllNodes.slice(0, -1);
    setDllNodes(next);
    setDllHighlightIdx(next.length > 0 ? next.length - 1 : null);
    setDllTrace(`O(1) removeLast(): unlinked "${removed}" via tail.prev in O(1) (impossible in singly-linked list!).`);
  };

  // Custom HashMap handlers
  const handleHmPut = (keyOverride?: string, valOverride?: number, customNote?: string) => {
    const key = (keyOverride ?? hmKeyInput).trim();
    if (!key) return;
    const val = valOverride ?? (Number.parseInt(hmValInput, 10) || 42);
    const hash = simpleHash(key);

    const existingIdx = hmEntries.findIndex((e) => e.key === key);
    let nextEntries: HashEntry[];
    if (existingIdx >= 0) {
      nextEntries = hmEntries.map((e, i) => (i === existingIdx ? { ...e, value: val } : e));
      const b = hash & (hmCap - 1);
      setHmEntries(nextEntries);
      setHmActiveBucket(b);
      setHmTrace(`Updated existing key "${key}" -> ${val} inside bucket [${b}] (O(1) amortized).`);
      return;
    }

    nextEntries = [...hmEntries, { key, value: val, hash }];
    let nextCap = hmCap;
    let rehashed = false;
    if (nextEntries.length / hmCap > 0.75 && hmCap < 16) {
      nextCap = hmCap * 2;
      rehashed = true;
      setHmCap(nextCap);
    }
    const bucket = hash & (nextCap - 1);
    setHmEntries(nextEntries);
    setHmActiveBucket(bucket);
    const lf = ((nextEntries.length / nextCap) * 100).toFixed(0);
    setHmTrace(
      customNote ??
        (rehashed
          ? `REHASH 2x! Load factor exceeded 75%. Capacity grew ${hmCap} -> ${nextCap}, recomputed bucket = hash & ${nextCap - 1} => [${bucket}] for "${key}" (load ${lf}%).`
          : `Inserted "${key}"=${val}. hash=${hash.toString(16).slice(0, 6)} -> bucket = hash & (${nextCap}-1) = [${bucket}] (load ${lf}%).`)
    );
  };

  const handleHmForceCollision = () => {
    const targetBucket = hmEntries.length > 0 ? hmEntries[0].hash & (hmCap - 1) : 0;
    let suffix = 1;
    let candidate = `k_${suffix}`;
    while (
      hmEntries.some((e) => e.key === candidate) ||
      (simpleHash(candidate) & (hmCap - 1)) !== targetBucket
    ) {
      suffix++;
      candidate = `k_${suffix}`;
      if (suffix > 500) break;
    }
    handleHmPut(
      candidate,
      10 + (suffix % 89),
      `COLLISION CHAINING! Key "${candidate}" hashed to the exact same bucket [${targetBucket}], so it was linked into bucket [${targetBucket}]'s chain.`
    );
  };

  // Circular Queue handlers
  const handleCqEnqueue = () => {
    const label = cqInput.trim() || `T${cqSize + 1}`;
    let cap = cqCap;
    let slots = [...cqSlots];
    let head = cqHead;
    let grew = false;

    if (cqSize === cap) {
      const nextCap = Math.min(12, cap * 2);
      if (nextCap === cap) {
        setCqTrace('Ring buffer at visualizer max capacity (12). Click Dequeue to free slots and watch wrap-around.');
        return;
      }
      const nextSlots: (string | null)[] = Array(nextCap).fill(null);
      for (let i = 0; i < cqSize; i++) {
        nextSlots[i] = slots[(head + i) % cap];
      }
      cap = nextCap;
      slots = nextSlots;
      head = 0;
      grew = true;
    }

    const tail = (head + cqSize) % cap;
    slots[tail] = label;
    setCqCap(cap);
    setCqSlots(slots);
    setCqHead(head);
    setCqSize(cqSize + 1);
    setCqInput(`T${cqSize + 2}`);
    setCqTrace(
      grew
        ? `Ring full -> unwrapped & grew to ${cap} slots, then enqueued "${label}" at TAIL index [${tail}].`
        : `O(1) enqueue("${label}") at TAIL = (${head} + ${cqSize}) % ${cap} = [${tail}].`
    );
  };

  const handleCqDequeue = () => {
    if (cqSize === 0) {
      setCqTrace('Queue is empty! Enqueue an item first.');
      return;
    }
    const slots = [...cqSlots];
    const removed = slots[cqHead];
    slots[cqHead] = null;
    const nextHead = (cqHead + 1) % cqCap;
    setCqSlots(slots);
    setCqHead(nextHead);
    setCqSize(cqSize - 1);
    setCqTrace(
      `O(1) dequeue() -> "${removed}". Freed slot [${cqHead}] and wrapped HEAD to (${cqHead}+1) % ${cqCap} = [${nextHead}].`
    );
  };

  // Binary Min-Heap handlers
  const handleHeapPush = () => {
    if (heap.length >= 15) {
      setHeapTrace('Heap visualizer capped at 15 nodes (4 levels). Click Pop Min to extract root.');
      return;
    }
    const parsed = Number.parseInt(heapInput, 10);
    const val = Number.isFinite(parsed) ? parsed : Math.floor(Math.random() * 40) + 1;
    const next = [...heap, val];
    const touched: number[] = [next.length - 1];
    let i = next.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (next[i] < next[p]) {
        [next[i], next[p]] = [next[p], next[i]];
        touched.push(p);
        i = p;
      } else {
        break;
      }
    }
    setHeap(next);
    setHeapHighlight(touched);
    setHeapInput(String(Math.max(1, (val * 7) % 35)));
    setHeapTrace(
      `O(log n) push(${val}): appended at index [${next.length - 1}] and sifted UP across indices [${touched.join(' -> ')}]. Min is now ${next[0]}.`
    );
  };

  const handleHeapPop = () => {
    if (heap.length === 0) return;
    const minVal = heap[0];
    if (heap.length === 1) {
      setHeap([]);
      setHeapHighlight([]);
      setHeapTrace(`Extracted final min element ${minVal}. Heap is now empty.`);
      return;
    }
    const next = [...heap];
    next[0] = next.pop()!;
    const touched: number[] = [0];
    let i = 0;
    while (true) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let smallest = i;
      if (l < next.length && next[l] < next[smallest]) smallest = l;
      if (r < next.length && next[r] < next[smallest]) smallest = r;
      if (smallest === i) break;
      [next[i], next[smallest]] = [next[smallest], next[i]];
      touched.push(smallest);
      i = smallest;
    }
    setHeap(next);
    setHeapHighlight(touched);
    setHeapTrace(
      `O(log n) popMin() -> ${minVal}: moved last element to root [0] and sifted DOWN through [${touched.join(' -> ')}]. New min: ${next[0]}.`
    );
  };

  // BST handlers
  const handleBstInsert = () => {
    const val = Number.parseInt(bstInput, 10);
    if (!Number.isFinite(val)) return;
    const res = bstInsert(bstRoot, val);
    setBstRoot(res.root);
    setBstPath(res.path);
    setBstTrace(
      res.inserted
        ? `Inserted ${val} in ${res.path.length} comparisons along path: ${res.path.join(' -> ')}.`
        : `Key ${val} already exists in the BST (path: ${res.path.join(' -> ')}).`
    );
  };

  const handleBstSearch = () => {
    const val = Number.parseInt(bstInput, 10);
    if (!Number.isFinite(val)) return;
    const res = bstSearch(bstRoot, val);
    setBstPath(res.path);
    setBstTrace(
      res.found
        ? `FOUND ${val} in ${res.path.length} hops: ${res.path.join(' -> ')}.`
        : `NOT FOUND (${val}). Halted at null child after visiting: ${res.path.join(' -> ')}.`
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Live Memory &amp; Pointer Simulator
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Execute Real Operations &amp; Watch Internal RAM State Mutate
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          INTERACTIVE SANDBOX
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. DYNAMIC ARRAY SIMULATOR */}
        {dsId === 'dynamic-array' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={arrInput}
                onChange={(e) => setArrInput(e.target.value)}
                aria-label="Value to append"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleArrAppend}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Append (push)
              </button>
              <button
                type="button"
                onClick={handleArrPop}
                disabled={arrData.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Pop Tail
              </button>
              <button
                type="button"
                onClick={handleArrReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <div className="ml-auto flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                <span>size={arrData.length}</span>
                <span>capacity={arrCap}</span>
                <span>resizes={arrResizes}</span>
                {arrLastResize && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold">
                    2x REALLOCATED
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex items-stretch gap-1.5 min-w-max">
                {Array.from({ length: arrCap }).map((_, idx) => {
                  const filled = idx < arrData.length;
                  const isNewest = idx === arrData.length - 1;
                  return (
                    <div
                      key={idx}
                      className={`w-16 rounded-lg border p-2 text-center transition-colors ${
                        isNewest
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                          : filled
                          ? 'border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/40'
                          : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400">[{idx}]</div>
                      <div className="text-sm font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                        {filled ? arrData[idx] : '—'}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {filled ? 'USED' : 'FREE'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {arrTrace}
            </p>
          </>
        )}

        {/* 2. DOUBLY LINKED LIST SIMULATOR */}
        {dsId === 'doubly-linked-list' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={dllInput}
                onChange={(e) => setDllInput(e.target.value)}
                maxLength={6}
                aria-label="Node value"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleDllAddFirst}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                + addFirst
              </button>
              <button
                type="button"
                onClick={handleDllAddLast}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                + addLast
              </button>
              <button
                type="button"
                onClick={handleDllRemoveFirst}
                disabled={dllNodes.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                removeFirst
              </button>
              <button
                type="button"
                onClick={handleDllRemoveLast}
                disabled={dllNodes.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                removeLast
              </button>
              <button
                type="button"
                onClick={() => {
                  setDllNodes(['A1', 'B2', 'C3']);
                  setDllHighlightIdx(null);
                  setDllInput('D4');
                  setDllTrace('Reset doubly linked list to 3 nodes between HEAD and TAIL sentinels.');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex items-center gap-2 min-w-max py-2">
                <div className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  HEAD
                </div>
                <span className="font-mono text-xs text-slate-400">⇄</span>
                {dllNodes.length === 0 ? (
                  <span className="text-xs font-mono text-slate-400 px-3">(empty list)</span>
                ) : (
                  dllNodes.map((val, idx) => (
                    <div key={`${val}-${idx}`} className="flex items-center gap-2">
                      <div
                        className={`rounded-lg border flex items-stretch overflow-hidden ${
                          idx === dllHighlightIdx
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                            : 'border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="px-1.5 py-2 text-[9px] font-mono text-slate-400 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                          prev
                        </span>
                        <span className="px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                          {val}
                        </span>
                        <span className="px-1.5 py-2 text-[9px] font-mono text-slate-400 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                          next
                        </span>
                      </div>
                      <span className="font-mono text-xs text-sky-600 dark:text-sky-400">⇄</span>
                    </div>
                  ))
                )}
                <div className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  TAIL
                </div>
              </div>
            </div>

            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {dllTrace}
            </p>
          </>
        )}

        {/* 3. CUSTOM HASHMAP SIMULATOR */}
        {dsId === 'custom-hashmap' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={hmKeyInput}
                onChange={(e) => setHmKeyInput(e.target.value)}
                placeholder="key"
                aria-label="HashMap key"
                className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <input
                type="number"
                value={hmValInput}
                onChange={(e) => setHmValInput(e.target.value)}
                placeholder="val"
                aria-label="HashMap value"
                className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => handleHmPut()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                put(key, val)
              </button>
              <button
                type="button"
                onClick={handleHmForceCollision}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Force Collision
              </button>
              <button
                type="button"
                onClick={() => {
                  setHmCap(4);
                  setHmEntries([
                    { key: 'alice', value: 95, hash: simpleHash('alice') },
                    { key: 'bob', value: 88, hash: simpleHash('bob') },
                  ]);
                  setHmActiveBucket(null);
                  setHmTrace('Reset HashMap to 4 buckets with 2 entries.');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>

              <div className="ml-auto flex items-center gap-3 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                <span>size={hmEntries.length}</span>
                <span>buckets={hmCap}</span>
                <span>load={Math.round((hmEntries.length / hmCap) * 100)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {Array.from({ length: hmCap }).map((_, bIdx) => {
                const chain = hmEntries.filter((e) => (e.hash & (hmCap - 1)) === bIdx);
                const active = hmActiveBucket === bIdx;
                return (
                  <div
                    key={bIdx}
                    className={`rounded-lg border p-2.5 space-y-1.5 ${
                      active
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Bucket [{bIdx}]
                      </span>
                      {chain.length > 1 && (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          CHAIN ({chain.length})
                        </span>
                      )}
                    </div>
                    {chain.length === 0 ? (
                      <div className="text-[11px] font-mono text-slate-400">null</div>
                    ) : (
                      <div className="space-y-1">
                        {chain.map((entry, idx) => (
                          <div
                            key={entry.key}
                            className="flex items-center justify-between px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                          >
                            <span className="text-slate-900 dark:text-slate-100">
                              {idx > 0 ? '→ ' : ''}
                              {entry.key}: {entry.value}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              #{entry.hash.toString(16).slice(0, 4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {hmTrace}
            </p>
          </>
        )}

        {/* 4. CIRCULAR QUEUE SIMULATOR */}
        {dsId === 'circular-queue' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={cqInput}
                onChange={(e) => setCqInput(e.target.value)}
                maxLength={6}
                aria-label="Item to enqueue"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleCqEnqueue}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                enqueue()
              </button>
              <button
                type="button"
                onClick={handleCqDequeue}
                disabled={cqSize === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40"
              >
                dequeue()
              </button>
              <button
                type="button"
                onClick={() => {
                  setCqCap(6);
                  setCqSlots(['T1', 'T2', 'T3', null, null, null]);
                  setCqHead(0);
                  setCqSize(3);
                  setCqInput('T4');
                  setCqTrace('Reset circular queue to capacity 6 with 3 queued tasks.');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>

              <div className="ml-auto flex items-center gap-3 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
                <span>HEAD={cqHead}</span>
                <span>TAIL={(cqHead + cqSize) % cqCap}</span>
                <span>size={cqSize}/{cqCap}</span>
              </div>
            </div>

            <div className="overflow-x-auto pb-1">
              <div className="flex items-stretch gap-2 min-w-max">
                {cqSlots.map((slot, idx) => {
                  const isHead = idx === cqHead && cqSize > 0;
                  const isTail = idx === (cqHead + cqSize) % cqCap;
                  return (
                    <div
                      key={idx}
                      className={`w-20 rounded-lg border p-2 text-center ${
                        isHead
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                          : slot !== null
                          ? 'border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30'
                          : isTail
                          ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20'
                          : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                      }`}
                    >
                      <div className="text-[10px] font-mono text-slate-400">slot[{idx}]</div>
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 my-1">
                        {slot ?? '—'}
                      </div>
                      <div className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-300 h-3">
                        {isHead && isTail ? 'HEAD/TAIL' : isHead ? 'HEAD' : isTail ? 'NEXT TAIL' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {cqTrace}
            </p>
          </>
        )}

        {/* 5. BINARY MIN-HEAP SIMULATOR */}
        {dsId === 'binary-min-heap' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={heapInput}
                onChange={(e) => setHeapInput(e.target.value)}
                aria-label="Priority value to push"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleHeapPush}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                push (siftUp)
              </button>
              <button
                type="button"
                onClick={handleHeapPop}
                disabled={heap.length === 0}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40"
              >
                popMin (siftDown)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHeap([5, 12, 9, 21, 18, 15]);
                  setHeapHighlight([]);
                  setHeapInput('3');
                  setHeapTrace('Reset Min-Heap. Notice how the tree is physically stored inside a flat array with zero node pointers!');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>

            {/* Synchronized Tree + Array */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
              <div className="lg:col-span-7 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-2">
                <svg viewBox="0 0 460 185" className="w-full h-auto max-h-[190px]" role="img" aria-label="Binary Min-Heap tree">
                  {heap.map((_, idx) => {
                    if (idx === 0) return null;
                    const p = Math.floor((idx - 1) / 2);
                    const lvl = Math.floor(Math.log2(idx + 1));
                    const posInLvl = idx - (Math.pow(2, lvl) - 1);
                    const countInLvl = Math.pow(2, lvl);
                    const x = ((posInLvl + 0.5) / countInLvl) * 440 + 10;
                    const y = 26 + lvl * 46;

                    const pLvl = Math.floor(Math.log2(p + 1));
                    const pPos = p - (Math.pow(2, pLvl) - 1);
                    const pCount = Math.pow(2, pLvl);
                    const px = ((pPos + 0.5) / pCount) * 440 + 10;
                    const py = 26 + pLvl * 46;

                    return (
                      <line
                        key={`edge-${idx}`}
                        x1={px}
                        y1={py}
                        x2={x}
                        y2={y}
                        strokeWidth={1.5}
                        className="stroke-slate-300 dark:stroke-slate-700"
                      />
                    );
                  })}
                  {heap.map((val, idx) => {
                    const lvl = Math.floor(Math.log2(idx + 1));
                    const posInLvl = idx - (Math.pow(2, lvl) - 1);
                    const countInLvl = Math.pow(2, lvl);
                    const x = ((posInLvl + 0.5) / countInLvl) * 440 + 10;
                    const y = 26 + lvl * 46;
                    const hl = heapHighlight.includes(idx);
                    return (
                      <g key={`node-${idx}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={16}
                          strokeWidth={hl ? 2.5 : 1.5}
                          className={
                            hl
                              ? 'fill-emerald-100 dark:fill-emerald-950 stroke-emerald-600 dark:stroke-emerald-400'
                              : idx === 0
                              ? 'fill-sky-100 dark:fill-sky-950 stroke-sky-600 dark:stroke-sky-400'
                              : 'fill-white dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600'
                          }
                        />
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          className="text-[11px] font-mono font-bold fill-slate-900 dark:fill-slate-100"
                        >
                          {val}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="lg:col-span-5 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Backing Contiguous Array
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {heap.map((val, idx) => (
                    <div
                      key={idx}
                      className={`px-2.5 py-1.5 rounded border text-center font-mono ${
                        heapHighlight.includes(idx)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50'
                          : idx === 0
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="text-[9px] text-slate-400">[{idx}]</div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{val}</div>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  parent(i) = (i - 1) // 2 · left(i) = 2i + 1 · right(i) = 2i + 2
                </div>
              </div>
            </div>
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {heapTrace}
            </p>
          </>
        )}

        {/* 6. BINARY SEARCH TREE SIMULATOR */}
        {dsId === 'binary-search-tree' && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={bstInput}
                onChange={(e) => setBstInput(e.target.value)}
                aria-label="Key to insert or search"
                className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleBstInsert}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Insert Key
              </button>
              <button
                type="button"
                onClick={handleBstSearch}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Search className="w-3.5 h-3.5" />
                Search Path
              </button>
              <button
                type="button"
                onClick={() => {
                  setBstRoot(buildInitialBst());
                  setBstPath([]);
                  setBstInput('65');
                  setBstTrace('Reset balanced BST with 7 ordered keys.');
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              >
                Reset
              </button>
            </div>

            {(() => {
              const laidOut = layoutBst(bstRoot, 260, 28, 115);
              const pathSet = new Set(bstPath);
              const sorted = bstInorder(bstRoot);
              return (
                <div className="space-y-3">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-2 overflow-x-auto">
                    <svg viewBox="0 0 520 215" className="w-full min-w-[440px] h-auto max-h-[215px]" role="img" aria-label="Binary Search Tree">
                      {laidOut.map((n, i) =>
                        n.parentX !== undefined && n.parentY !== undefined ? (
                          <line
                            key={`e-${i}`}
                            x1={n.parentX}
                            y1={n.parentY}
                            x2={n.x}
                            y2={n.y}
                            strokeWidth={pathSet.has(n.val) ? 2.5 : 1.5}
                            className={
                              pathSet.has(n.val)
                                ? 'stroke-sky-600 dark:stroke-sky-400'
                                : 'stroke-slate-300 dark:stroke-slate-700'
                            }
                          />
                        ) : null
                      )}
                      {laidOut.map((n, i) => {
                        const onPath = pathSet.has(n.val);
                        const isFinal = bstPath[bstPath.length - 1] === n.val;
                        return (
                          <g key={`n-${i}`}>
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={17}
                              strokeWidth={onPath ? 2.5 : 1.5}
                              className={
                                isFinal
                                  ? 'fill-emerald-100 dark:fill-emerald-950 stroke-emerald-600 dark:stroke-emerald-400'
                                  : onPath
                                  ? 'fill-sky-100 dark:fill-sky-950 stroke-sky-600 dark:stroke-sky-400'
                                  : 'fill-white dark:fill-slate-900 stroke-slate-400 dark:stroke-slate-600'
                              }
                            />
                            <text
                              x={n.x}
                              y={n.y + 4}
                              textAnchor="middle"
                              className="text-[11px] font-mono font-bold fill-slate-900 dark:fill-slate-100"
                            >
                              {n.val}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">
                      Sorted inorder():
                    </span>
                    {sorted.map((v) => (
                      <span
                        key={v}
                        className={`px-2 py-0.5 rounded border ${
                          pathSet.has(v)
                            ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2">
              {bstTrace}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN ACADEMY COMPONENT
   ============================================================================ */

export function OopCustomDsAcademy({ languageFilter }: OopCustomDsAcademyProps) {
  const [mode, setMode] = useState<AcademyMode>('oop-internals');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(OOP_CODING_MODULES[0].id);
  const [selectedDsId, setSelectedDsId] = useState<CustomDsId>('dynamic-array');
  const [dsCodeTab, setDsCodeTab] = useState<DsCodeTab>('reference');
  const [playgroundLang, setPlaygroundLang] = useState<LangTrack>(
    languageFilter === 'java' ? 'java' : 'python'
  );
  const [playgroundDrafts, setPlaygroundDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (languageFilter === 'python' || languageFilter === 'java') {
      setPlaygroundLang(languageFilter);
    }
  }, [languageFilter]);

  const activeModule: OopCodingModule =
    OOP_CODING_MODULES.find((m) => m.id === selectedModuleId) ?? OOP_CODING_MODULES[0];

  const activeDs: CustomDsBlueprint =
    CUSTOM_DS_BLUEPRINTS.find((d) => d.id === selectedDsId) ?? CUSTOM_DS_BLUEPRINTS[0];

  const draftKey = `${activeDs.id}:${playgroundLang}`;
  const currentStarter =
    playgroundLang === 'python' ? activeDs.starterPython : activeDs.starterJava;
  const currentReference =
    playgroundLang === 'python' ? activeDs.pythonCode : activeDs.javaCode;
  const currentCode = playgroundDrafts[draftKey] ?? currentStarter;
  const currentRules =
    playgroundLang === 'python' ? activeDs.pythonRules : activeDs.javaRules;

  const ruleResults = useMemo(
    () =>
      currentRules.map((rule) => ({
        ...rule,
        passed: rule.test(currentCode),
      })),
    [currentRules, currentCode]
  );

  const passedCount = ruleResults.filter((r) => r.passed).length;

  const handleUpdateDraft = useCallback(
    (next: string) => {
      setPlaygroundDrafts((prev) => ({ ...prev, [draftKey]: next }));
    },
    [draftKey]
  );

  const showPython = languageFilter === 'all' || languageFilter === 'python';
  const showJava = languageFilter === 'all' || languageFilter === 'java';

  return (
    <div className="space-y-6">
      {/* Mode Switcher Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400">
            Zero-to-Advanced Engineering Track
          </div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
            OOP Memory Internals &amp; Custom Data Structures From Scratch
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Learn how classes, functions, and OOP actually run on internal data structures—then build Dynamic Arrays, Linked Lists, HashMaps, Circular Queues, Heaps, and BSTs from zero in Python 3.13+ &amp; Java 21+.
          </p>
        </div>

        <SegmentedTabBar<AcademyMode>
          ariaLabel="OOP and Custom Data Structures track"
          activeTab={mode}
          onChange={setMode}
          tabs={[
            {
              id: 'oop-internals',
              label: 'Zero-to-Pro OOP & Internals',
              shortLabel: 'OOP Internals',
              count: OOP_CODING_MODULES.length,
              icon: Layers,
            },
            {
              id: 'custom-ds',
              label: 'Custom Data Structures Lab',
              shortLabel: 'Custom DS',
              count: CUSTOM_DS_BLUEPRINTS.length,
              icon: Boxes,
            },
          ]}
        />
      </div>

      {/* ====================================================================
          MODE 1: ZERO-TO-ADVANCED OOP & RUNTIME INTERNALS
          ==================================================================== */}
      {mode === 'oop-internals' && (
        <div className="space-y-6">
          {/* 6-Module Progression Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {OOP_CODING_MODULES.map((mod) => {
              const active = mod.id === activeModule.id;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`text-left rounded-xl border p-3.5 transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                      MODULE {mod.number}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {mod.level}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {mod.shortTitle}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {mod.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Module Title & Definitions */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                  MODULE {activeModule.number} · {activeModule.level.toUpperCase()}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeModule.title}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  In Simple English
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeModule.simpleEnglish}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <Cpu className="w-3.5 h-3.5" />
                  Standard Technical Definition
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeModule.standardDefinition}
                </p>
              </div>

              <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/30 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  How OOP Uses Internal Data Structures
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-6">
                  {activeModule.howOopUsesInternalDs}
                </p>
              </div>
            </div>
          </section>

          {/* Animated DFD */}
          <MiniDfdAnimator
            title={activeModule.title}
            subtitle="Step through how the runtime moves references, dispatches methods, and mutates internal structures."
            nodes={activeModule.dfdNodes}
            edges={activeModule.dfdEdges}
            steps={activeModule.dfdSteps}
            resetKey={activeModule.id}
          />

          {/* Side-by-Side Python 3.13+ & Java 21+ Code */}
          <div className={`grid grid-cols-1 ${showPython && showJava ? 'xl:grid-cols-2' : ''} gap-4`}>
            {showPython && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
                    <Code2 className="w-3.5 h-3.5" />
                    Python 3.13+ Implementation
                  </div>
                  <CopyButton text={activeModule.pythonCode} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
                  <code>{activeModule.pythonCode}</code>
                </pre>
              </div>
            )}

            {showJava && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-400">
                    <Code2 className="w-3.5 h-3.5" />
                    Java 21+ LTS Implementation
                  </div>
                  <CopyButton text={activeModule.javaCode} label="Copy" copiedLabel="Copied" size="xs" />
                </div>
                <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-slate-200">
                  <code>{activeModule.javaCode}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Common Pitfall vs Best Practice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                Common Pitfall to Avoid
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                {activeModule.commonPitfall}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Best Practice
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                {activeModule.bestPractice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 2: CUSTOM DATA STRUCTURES FROM SCRATCH + PLAYGROUND
          ==================================================================== */}
      {mode === 'custom-ds' && (
        <div className="space-y-6">
          {/* 6 Data Structure Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CUSTOM_DS_BLUEPRINTS.map((ds) => {
              const active = ds.id === activeDs.id;
              return (
                <button
                  key={ds.id}
                  type="button"
                  onClick={() => setSelectedDsId(ds.id)}
                  className={`text-left rounded-xl border p-3.5 transition-colors ${
                    active
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-400">
                      {ds.shortTitle}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {ds.level}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {ds.title}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {ds.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Live Interactive Memory & Pointer Simulator */}
          <CustomDsLiveSimulator dsId={activeDs.id} />

          {/* Conceptual Architecture + Complexity Table */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <div className="text-xs font-mono font-semibold text-sky-700 dark:text-sky-400">
                CUSTOM IMPLEMENTATION BLUEPRINT · {activeDs.level.toUpperCase()}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                {activeDs.title}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  In Simple English
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeDs.simpleEnglish}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                  Technical Definition
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeDs.standardDefinition}
                </p>
              </div>
              <div className="rounded-lg border border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/30 p-3.5 space-y-1.5">
                <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">
                  OOP Design &amp; Encapsulation Notes
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-6">
                  {activeDs.oopArchitectureNotes}
                </p>
              </div>
            </div>

            {/* Big-O Complexity Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Operation</th>
                    <th className="py-2.5 px-3 font-semibold">Average</th>
                    <th className="py-2.5 px-3 font-semibold">Worst Case</th>
                    <th className="py-2.5 px-3 font-semibold">Engineering Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {activeDs.complexityRows.map((row) => (
                    <tr key={row.operation} className="text-slate-700 dark:text-slate-300">
                      <td className="py-2 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {row.operation}
                      </td>
                      <td className="py-2 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                        {row.average}
                      </td>
                      <td className="py-2 px-3 font-mono text-amber-700 dark:text-amber-400 font-semibold">
                        {row.worst}
                      </td>
                      <td className="py-2 px-3">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Animated DFD for the selected Custom Data Structure */}
          <MiniDfdAnimator
            title={`${activeDs.shortTitle} — Internal Operation Flow`}
            subtitle="Trace how pointers, hashes, indices, and memory reallocations flow step by step."
            nodes={activeDs.dfdNodes}
            edges={activeDs.dfdEdges}
            steps={activeDs.dfdSteps}
            resetKey={`ds-${activeDs.id}`}
          />

          {/* Reference Code vs Build-It-Yourself Playground */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  From-Scratch Code &amp; Build-It-Yourself Playground
                </h4>
              </div>

              <SegmentedTabBar<DsCodeTab>
                ariaLabel="Reference code or interactive playground"
                activeTab={dsCodeTab}
                onChange={setDsCodeTab}
                size="xs"
                tabs={[
                  { id: 'reference', label: 'Reference Implementation', icon: Code2 },
                  { id: 'playground', label: 'Build-It-Yourself Playground', icon: Wrench },
                ]}
              />
            </div>

            {dsCodeTab === 'reference' ? (
              <div
                className={`p-4 grid grid-cols-1 ${showPython && showJava ? 'xl:grid-cols-2' : ''} gap-4`}
              >
                {showPython && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-emerald-400">
                        Python 3.13+ — {activeDs.shortTitle}
                      </span>
                      <CopyButton text={activeDs.pythonCode} label="Copy" copiedLabel="Copied" size="xs" />
                    </div>
                    <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto max-h-[460px] text-slate-200">
                      <code>{activeDs.pythonCode}</code>
                    </pre>
                  </div>
                )}

                {showJava && (
                  <div className="rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden">
                    <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-amber-400">
                        Java 21+ LTS — {activeDs.shortTitle}
                      </span>
                      <CopyButton text={activeDs.javaCode} label="Copy" copiedLabel="Copied" size="xs" />
                    </div>
                    <pre className="p-3.5 text-xs font-mono leading-relaxed overflow-x-auto max-h-[460px] text-slate-200">
                      <code>{activeDs.javaCode}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SegmentedTabBar<LangTrack>
                    ariaLabel="Playground language"
                    activeTab={playgroundLang}
                    onChange={setPlaygroundLang}
                    size="xs"
                    tabs={[
                      { id: 'python', label: 'Python 3.13+' },
                      { id: 'java', label: 'Java 21+ LTS' },
                    ]}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateDraft(currentReference)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50"
                    >
                      Load Reference Solution
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateDraft(currentStarter)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Starter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8">
                    <label
                      htmlFor="custom-ds-playground-editor"
                      className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1.5"
                    >
                      Implement {activeDs.shortTitle} in {playgroundLang === 'python' ? 'Python 3.13+' : 'Java 21+'} (live structural verification on every keystroke)
                    </label>
                    <textarea
                      id="custom-ds-playground-editor"
                      value={currentCode}
                      onChange={(e) => handleUpdateDraft(e.target.value)}
                      spellCheck={false}
                      rows={18}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed p-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="lg:col-span-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Verification Checklist
                      </span>
                      <span
                        className={`text-xs font-mono font-bold tabular-nums px-2 py-0.5 rounded ${
                          passedCount === ruleResults.length
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {passedCount}/{ruleResults.length} PASS
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ruleResults.map((r) => (
                        <div
                          key={r.id}
                          className={`rounded-lg border p-2.5 text-xs ${
                            r.passed
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {r.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-900 dark:text-slate-100">
                                {r.label}
                              </div>
                              {!r.passed && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Hint: {r.hint}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
