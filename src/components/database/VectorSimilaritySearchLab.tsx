import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  Cpu,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Target,
} from 'lucide-react';
import { CopyButton } from '../ui';

type VectorIndexMode = 'hnsw' | 'ivf';
type DistanceMetric = 'cosine' | 'l2' | 'dot';

interface EmbeddingNode {
  id: number;
  label: string;
  cluster: number;
  x: number; // 0..640 SVG space
  y: number; // 0..320 SVG space
  hnswLayer: 0 | 1 | 2;
  // Normalized-ish semantic coordinates derived cleanly from SVG plane
  vx: number;
  vy: number;
}

interface PresetQuery {
  id: string;
  label: string;
  x: number;
  y: number;
  note: string;
}

const CLUSTER_META = [
  { id: 0, name: 'Payments & Ledgers', cx: 145, cy: 90, color: '#0284c7' },
  { id: 1, name: 'Locks & Concurrency', cx: 485, cy: 88, color: '#059669' },
  { id: 2, name: 'Storage & SQL Internals', cx: 165, cy: 242, color: '#d97706' },
  { id: 3, name: 'AI RAG & Embeddings', cx: 495, cy: 238, color: '#7c3aed' },
];

const RAW_NODES: Omit<EmbeddingNode, 'vx' | 'vy'>[] = [
  // Cluster 0: Payments & Ledgers (top-left)
  { id: 0, label: 'Double-Entry', cluster: 0, x: 90, y: 66, hnswLayer: 2 },
  { id: 1, label: 'Idempotency', cluster: 0, x: 152, y: 54, hnswLayer: 0 },
  { id: 2, label: 'Webhook HMAC', cluster: 0, x: 214, y: 78, hnswLayer: 1 },
  { id: 3, label: 'Refund Saga', cluster: 0, x: 112, y: 122, hnswLayer: 0 },
  { id: 4, label: 'Settlement', cluster: 0, x: 186, y: 128, hnswLayer: 0 },
  { id: 5, label: 'Outbox CDC', cluster: 0, x: 64, y: 108, hnswLayer: 0 },

  // Cluster 1: Locks & Concurrency (top-right)
  { id: 6, label: 'FOR UPDATE', cluster: 1, x: 432, y: 62, hnswLayer: 1 },
  { id: 7, label: 'MVCC Snap', cluster: 1, x: 504, y: 54, hnswLayer: 2 },
  { id: 8, label: 'SKIP LOCKED', cluster: 1, x: 568, y: 84, hnswLayer: 0 },
  { id: 9, label: 'Fencing Tok', cluster: 1, x: 448, y: 124, hnswLayer: 0 },
  { id: 10, label: 'Deadlock', cluster: 1, x: 526, y: 120, hnswLayer: 0 },
  { id: 11, label: 'Version CAS', cluster: 1, x: 392, y: 102, hnswLayer: 0 },

  // Cluster 2: Storage & SQL Internals (bottom-left)
  { id: 12, label: 'B+Tree Leaf', cluster: 2, x: 104, y: 214, hnswLayer: 1 },
  { id: 13, label: 'WAL Fsync', cluster: 2, x: 174, y: 202, hnswLayer: 0 },
  { id: 14, label: 'Parquet RLE', cluster: 2, x: 244, y: 232, hnswLayer: 0 },
  { id: 15, label: 'Iceberg Snap', cluster: 2, x: 124, y: 278, hnswLayer: 2 },
  { id: 16, label: 'Keyset Seek', cluster: 2, x: 206, y: 282, hnswLayer: 0 },
  { id: 17, label: 'CTID Cursor', cluster: 2, x: 68, y: 256, hnswLayer: 0 },

  // Cluster 3: AI RAG & Embeddings (bottom-right)
  { id: 18, label: 'HNSW Graph', cluster: 3, x: 436, y: 206, hnswLayer: 1 },
  { id: 19, label: 'IVF Voronoi', cluster: 3, x: 516, y: 198, hnswLayer: 0 },
  { id: 20, label: 'BM25 + RRF', cluster: 3, x: 574, y: 234, hnswLayer: 2 },
  { id: 21, label: 'Semantic Lay', cluster: 3, x: 452, y: 274, hnswLayer: 0 },
  { id: 22, label: 'Feature Str', cluster: 3, x: 534, y: 278, hnswLayer: 0 },
  { id: 23, label: 'Halfvec FP16', cluster: 3, x: 386, y: 246, hnswLayer: 0 },
];

const EMBEDDING_NODES: EmbeddingNode[] = RAW_NODES.map((n) => ({
  ...n,
  vx: (n.x - 320) / 280,
  vy: (n.y - 160) / 140,
}));

const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'q-rag',
    label: '"Fast vector index for hybrid RAG"',
    x: 492,
    y: 226,
    note: 'Lands right inside the AI RAG cluster — watch HNSW jump from Layer 2 to Layer 0 in 3 hops, or IVF probe just 1 Voronoi cell!',
  },
  {
    id: 'q-lock',
    label: '"Prevent Tatkal double-booking lock storm"',
    x: 468,
    y: 94,
    note: 'Queries the Concurrency & Locking cluster — compare Cosine angle vs L2 Euclidean distance!',
  },
  {
    id: 'q-boundary',
    label: '"Boundary Query: Streaming CDC to Parquet"',
    x: 298,
    y: 168,
    note: 'Sits right on the Voronoi boundary! Notice how IVF with nprobe=1 misses neighbors across the border until you raise nprobe to 2–3!',
  },
  {
    id: 'q-pay',
    label: '"Idempotent payment refund webhook"',
    x: 158,
    y: 96,
    note: 'Targets the Payments & Ledgers cluster in the top-left quadrant.',
  },
];

function computeMetricScore(
  qx: number,
  qy: number,
  nx: number,
  ny: number,
  metric: DistanceMetric
): { distance: number; display: string } {
  // Map SVG coords into centered semantic plane [-1, 1]
  const vqx = (qx - 320) / 280;
  const vqy = (qy - 160) / 140;
  const vnx = (nx - 320) / 280;
  const vny = (ny - 160) / 140;

  if (metric === 'l2') {
    const l2 = Math.hypot(vqx - vnx, vqy - vny);
    return { distance: l2, display: `L2 = ${l2.toFixed(3)}` };
  }
  const dot = vqx * vnx + vqy * vny;
  if (metric === 'dot') {
    // Negate so smaller = better consistently for sorting
    return { distance: -dot, display: `Dot = ${dot.toFixed(3)}` };
  }
  const magQ = Math.hypot(vqx, vqy) || 0.0001;
  const magN = Math.hypot(vnx, vny) || 0.0001;
  const cosSim = Math.max(-1, Math.min(1, dot / (magQ * magN)));
  const cosDist = 1 - cosSim;
  return { distance: cosDist, display: `Cos = ${cosSim.toFixed(3)}` };
}

// Build deterministic HNSW adjacency lists per layer (Layer 2 -> 1 -> 0)
function buildHnswEdges(): Record<0 | 1 | 2, [number, number][]> {
  const byLayer = (minLayer: number) => EMBEDDING_NODES.filter((n) => n.hnswLayer >= minLayer);

  const connectK = (nodes: EmbeddingNode[], k: number): [number, number][] => {
    const edgeSet = new Set<string>();
    const edges: [number, number][] = [];
    for (const a of nodes) {
      const sorted = nodes
        .filter((b) => b.id !== a.id)
        .sort((b1, b2) => Math.hypot(a.x - b1.x, a.y - b1.y) - Math.hypot(a.x - b2.x, a.y - b2.y))
        .slice(0, k);
      for (const b of sorted) {
        const key = a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push([a.id, b.id]);
        }
      }
    }
    return edges;
  };

  return {
    2: connectK(byLayer(2), 2),
    1: connectK(byLayer(1), 3),
    0: connectK(byLayer(0), 4),
  };
}

const HNSW_EDGES = buildHnswEdges();

export function VectorSimilaritySearchLab() {
  const [indexMode, setIndexMode] = useState<VectorIndexMode>('hnsw');
  const [metric, setMetric] = useState<DistanceMetric>('l2');
  const [topK, setTopK] = useState<number>(4);
  const [efSearch, setEfSearch] = useState<number>(8);
  const [nprobe, setNprobe] = useState<number>(2);
  const [queryPoint, setQueryPoint] = useState<{ x: number; y: number }>({
    x: PRESET_QUERIES[0].x,
    y: PRESET_QUERIES[0].y,
  });
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_QUERIES[0].id);
  const [animPhase, setAnimPhase] = useState<number>(3); // 0=start, 1=coarse, 2=refine, 3=complete
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Auto-play traversal stages 0 -> 3
  useEffect(() => {
    if (!isPlaying) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setAnimPhase(3);
      setIsPlaying(false);
      return;
    }
    const timer = window.setInterval(() => {
      setAnimPhase((prev) => {
        if (prev >= 3) {
          setIsPlaying(false);
          return 3;
        }
        return prev + 1;
      });
    }, 950);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  // 1. Ground-Truth Exact Brute-Force KNN (for exact Recall@K calculation!)
  const exactRanked = useMemo(() => {
    return EMBEDDING_NODES.map((node) => ({
      node,
      ...computeMetricScore(queryPoint.x, queryPoint.y, node.x, node.y, metric),
    })).sort((a, b) => a.distance - b.distance);
  }, [queryPoint, metric]);

  const exactTopKIds = useMemo(
    () => new Set(exactRanked.slice(0, topK).map((r) => r.node.id)),
    [exactRanked, topK]
  );

  // 2. HNSW Multi-Layer Greedy + Beam Search Simulation
  const hnswSimulation = useMemo(() => {
    const distOf = (id: number) =>
      computeMetricScore(
        queryPoint.x,
        queryPoint.y,
        EMBEDDING_NODES[id].x,
        EMBEDDING_NODES[id].y,
        metric
      ).distance;

    const neighborsOf = (id: number, layer: 0 | 1 | 2): number[] => {
      const out: number[] = [];
      for (const [u, v] of HNSW_EDGES[layer]) {
        if (u === id) out.push(v);
        else if (v === id) out.push(u);
      }
      return out;
    };

    const visitedOrder: number[] = [];
    const visitedSet = new Set<number>();
    const markVisit = (id: number) => {
      if (!visitedSet.has(id)) {
        visitedSet.add(id);
        visitedOrder.push(id);
      }
    };

    // Start at fixed Layer-2 entry point (node 0: Double-Entry)
    let curr = 0;
    markVisit(curr);
    const layer2Path: number[] = [curr];

    // Greedy walk Layer 2
    let improved = true;
    while (improved) {
      improved = false;
      for (const nb of neighborsOf(curr, 2)) {
        markVisit(nb);
        if (distOf(nb) < distOf(curr)) {
          curr = nb;
          layer2Path.push(curr);
          improved = true;
        }
      }
    }

    // Greedy walk Layer 1
    const layer1Path: number[] = [curr];
    improved = true;
    while (improved) {
      improved = false;
      for (const nb of neighborsOf(curr, 1)) {
        markVisit(nb);
        if (distOf(nb) < distOf(curr)) {
          curr = nb;
          layer1Path.push(curr);
          improved = true;
        }
      }
    }

    // Beam search Layer 0 up to efSearch evaluations
    const frontier = [curr];
    const expanded = new Set<number>();
    while (frontier.length > 0 && visitedSet.size < Math.min(EMBEDDING_NODES.length, efSearch + 4)) {
      frontier.sort((a, b) => distOf(a) - distOf(b));
      const next = frontier.shift()!;
      if (expanded.has(next)) continue;
      expanded.add(next);
      for (const nb of neighborsOf(next, 0)) {
        if (!visitedSet.has(nb) && visitedSet.size < Math.min(EMBEDDING_NODES.length, efSearch + 4)) {
          markVisit(nb);
          frontier.push(nb);
        }
      }
    }

    const candidates = Array.from(visitedSet)
      .map((id) => ({
        node: EMBEDDING_NODES[id],
        ...computeMetricScore(queryPoint.x, queryPoint.y, EMBEDDING_NODES[id].x, EMBEDDING_NODES[id].y, metric),
      }))
      .sort((a, b) => a.distance - b.distance);

    return {
      entryId: 0,
      layer2Path,
      layer1Path,
      visitedIds: visitedSet,
      evaluatedCount: visitedSet.size,
      topResults: candidates.slice(0, topK),
    };
  }, [queryPoint, metric, efSearch, topK]);

  // 3. IVF (Inverted File) Centroid Probe Simulation
  const ivfSimulation = useMemo(() => {
    const centroidRanks = CLUSTER_META.map((c) => ({
      cluster: c,
      ...computeMetricScore(queryPoint.x, queryPoint.y, c.cx, c.cy, metric),
    })).sort((a, b) => a.distance - b.distance);

    const probedClusterIds = new Set(centroidRanks.slice(0, nprobe).map((c) => c.cluster.id));
    const scannedNodes = EMBEDDING_NODES.filter((n) => probedClusterIds.has(n.cluster));
    const candidates = scannedNodes
      .map((node) => ({
        node,
        ...computeMetricScore(queryPoint.x, queryPoint.y, node.x, node.y, metric),
      }))
      .sort((a, b) => a.distance - b.distance);

    return {
      centroidRanks,
      probedClusterIds,
      visitedIds: new Set(scannedNodes.map((n) => n.id)),
      evaluatedCount: scannedNodes.length + CLUSTER_META.length,
      topResults: candidates.slice(0, topK),
    };
  }, [queryPoint, metric, nprobe, topK]);

  const activeResults =
    indexMode === 'hnsw' ? hnswSimulation.topResults : ivfSimulation.topResults;
  const activeVisitedIds =
    indexMode === 'hnsw' ? hnswSimulation.visitedIds : ivfSimulation.visitedIds;
  const activeEvaluated =
    indexMode === 'hnsw' ? hnswSimulation.evaluatedCount : ivfSimulation.evaluatedCount;
  const activeTopIds = useMemo(
    () => new Set(activeResults.map((r) => r.node.id)),
    [activeResults]
  );

  // Exact Recall@K vs Ground-Truth Brute Force
  const recallHits = activeResults.filter((r) => exactTopKIds.has(r.node.id)).length;
  const recallPct = Math.round((recallHits / Math.max(1, topK)) * 100);
  const speedupRatio = (EMBEDDING_NODES.length / Math.max(1, activeEvaluated)).toFixed(1);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(24, Math.min(616, ((e.clientX - rect.left) / rect.width) * 640));
    const y = Math.max(24, Math.min(296, ((e.clientY - rect.top) / rect.height) * 320));
    setQueryPoint({ x: Math.round(x), y: Math.round(y) });
    setActivePresetId('custom');
    setAnimPhase(0);
    setIsPlaying(true);
  };

  const pgvectorSql =
    indexMode === 'hnsw'
      ? `-- HNSW Index: Multi-layer proximity graph (best <100M vectors, fast real-time inserts)
CREATE INDEX idx_docs_hnsw
  ON embeddings USING hnsw (vec vector_${metric === 'cosine' ? 'cosine' : metric === 'l2' ? 'l2' : 'ip'}_ops)
  WITH (m = 16, ef_construction = 128);

SET LOCAL hnsw.ef_search = ${efSearch * 10};
SELECT id, label FROM embeddings
ORDER BY vec ${metric === 'cosine' ? '<=>' : metric === 'l2' ? '<->' : '<#>'} $query_vec
LIMIT ${topK};`
      : `-- IVF-Flat Index: K-Means Voronoi cells (compact RAM, tune nprobe for recall!)
CREATE INDEX idx_docs_ivf
  ON embeddings USING ivfflat (vec vector_${metric === 'cosine' ? 'cosine' : metric === 'l2' ? 'l2' : 'ip'}_ops)
  WITH (lists = 400);

SET LOCAL ivfflat.probes = ${nprobe * 10}; -- Raising probes fixes Voronoi boundary misses!
SELECT id, label FROM embeddings
ORDER BY vec ${metric === 'cosine' ? '<=>' : metric === 'l2' ? '<->' : '<#>'} $query_vec
LIMIT ${topK};`;

  const stageDescription =
    indexMode === 'hnsw'
      ? animPhase === 0
        ? 'Phase 0: Place query vector Q and enter at Layer 2 top-level entry point (#0).'
        : animPhase === 1
          ? `Phase 1 (Express Highway — Layer 2): Greedy long-range hops (${hnswSimulation.layer2Path.map((id) => `#${id}`).join(' -> ')}) leap across clusters.`
          : animPhase === 2
            ? `Phase 2 (Regional Descent — Layer 1): Refine entry into target neighborhood (${hnswSimulation.layer1Path.map((id) => `#${id}`).join(' -> ')}).`
            : `Phase 3 (Local Street Beam — Layer 0, efSearch=${efSearch}): Explored ${hnswSimulation.evaluatedCount}/${EMBEDDING_NODES.length} nodes -> Recall@${topK} = ${recallPct}%.`
      : animPhase === 0
        ? 'Phase 0: Place query vector Q and compute distance to all 4 K-Means Voronoi centroids.'
        : animPhase === 1
          ? `Phase 1 (Centroid Selection): Selected top nprobe=${nprobe} closest centroid(s): ${Array.from(ivfSimulation.probedClusterIds).map((id) => `C${id}`).join(', ')}.`
          : animPhase === 2
            ? `Phase 2 (Inverted List Scan): Pruned ${CLUSTER_META.length - nprobe} cell(s) completely; scanning only vectors inside probed cells.`
            : `Phase 3 (Top-K Rank): Evaluated ${ivfSimulation.evaluatedCount} distance ops -> Recall@${topK} = ${recallPct}%.`;

  return (
    <div className="space-y-5">
      {/* Header & Index Switcher */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Interactive ANN Vector Similarity Search Lab
            </p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              HNSW Multi-Layer Graph vs. IVF Voronoi Cluster Indexing
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Click anywhere on the 2D embedding map (or select a preset query) to watch HNSW descend layers or IVF probe Voronoi cells in real time — and measure exact Recall@K against brute-force KNN!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIndexMode('hnsw');
                setAnimPhase(0);
                setIsPlaying(true);
              }}
              className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                indexMode === 'hnsw'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              HNSW (Navigable Small World)
            </button>
            <button
              type="button"
              onClick={() => {
                setIndexMode('ivf');
                setAnimPhase(0);
                setIsPlaying(true);
              }}
              className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                indexMode === 'ivf'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              IVF (Voronoi Clusters)
            </button>
          </div>
        </div>

        {/* Preset Queries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_QUERIES.map((pq) => {
            const active = activePresetId === pq.id;
            return (
              <button
                key={pq.id}
                type="button"
                onClick={() => {
                  setActivePresetId(pq.id);
                  setQueryPoint({ x: pq.x, y: pq.y });
                  setAnimPhase(0);
                  setIsPlaying(true);
                }}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  active
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {pq.label}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {pq.note}
                </p>
              </button>
            );
          })}
        </div>

        {/* Parameter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Metric:</span>
              {(['l2', 'cosine', 'dot'] as DistanceMetric[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={`px-2 py-1 rounded border uppercase ${
                    metric === m
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {indexMode === 'hnsw' ? (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">efSearch:</span>
                {[4, 8, 14].map((ef) => (
                  <button
                    key={ef}
                    type="button"
                    onClick={() => setEfSearch(ef)}
                    className={`px-2 py-1 rounded border tabular-nums ${
                      efSearch === ef
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {ef}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">nprobe:</span>
                {[1, 2, 3, 4].map((np) => (
                  <button
                    key={np}
                    type="button"
                    onClick={() => setNprobe(np)}
                    className={`px-2 py-1 rounded border tabular-nums ${
                      nprobe === np
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {np}/4
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Top-K:</span>
              {[3, 4, 6].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTopK(k)}
                  className={`px-2 py-1 rounded border tabular-nums ${
                    topK === k
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (animPhase >= 3) setAnimPhase(0);
                setIsPlaying((p) => !p);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isPlaying ? 'Pause' : 'Animate Search'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setAnimPhase((p) => (p + 1) % 4);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300"
            >
              Step <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setAnimPhase(0);
              }}
              aria-label="Reset traversal"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono tabular-nums">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[10px] text-slate-500">EXACT RECALL@{topK}</div>
          <div
            className={`text-lg font-bold mt-0.5 ${
              recallPct === 100
                ? 'text-emerald-700 dark:text-emerald-400'
                : recallPct >= 75
                  ? 'text-sky-700 dark:text-sky-400'
                  : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {recallPct}% ({recallHits}/{topK})
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[10px] text-slate-500">VECTORS SCANNED</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {activeEvaluated} / {EMBEDDING_NODES.length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[10px] text-slate-500">VS BRUTE-FORCE KNN</div>
          <div className="text-lg font-bold text-sky-700 dark:text-sky-400 mt-0.5">
            {speedupRatio}x fewer ops
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-[10px] text-slate-500">ACTIVE STRUCTURE</div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
            {indexMode === 'hnsw' ? `HNSW (ef=${efSearch})` : `IVF (nprobe=${nprobe}/4)`}
          </div>
        </div>
      </div>

      {/* Interactive 2D Embedding Canvas + Live Top-K Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Interactive 2D Vector Space — Click Anywhere to Move Query Q
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Q=({((queryPoint.x - 320) / 280).toFixed(2)}, {((queryPoint.y - 160) / 140).toFixed(2)})
            </span>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-slate-950/70">
            <svg
              viewBox="0 0 640 320"
              onClick={handleSvgClick}
              className="w-full h-auto cursor-crosshair select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              role="img"
              aria-label="Interactive HNSW and IVF 2D vector similarity map"
            >
              {/* IVF Voronoi Quadrant Dividers + Highlighted Probed Cells */}
              {indexMode === 'ivf' && (
                <g>
                  {/* 4 cluster regions cleanly mapped to quadrants */}
                  {CLUSTER_META.map((c) => {
                    const rx = c.id === 0 || c.id === 2 ? 0 : 320;
                    const ry = c.id === 0 || c.id === 1 ? 0 : 160;
                    const probed = animPhase >= 1 && ivfSimulation.probedClusterIds.has(c.id);
                    return (
                      <g key={c.id}>
                        <rect
                          x={rx}
                          y={ry}
                          width={320}
                          height={160}
                          fill={probed ? c.color : 'transparent'}
                          fillOpacity={probed ? 0.08 : 0}
                          className="stroke-slate-300 dark:stroke-slate-800"
                          strokeDasharray="5 4"
                          strokeWidth={1.2}
                        />
                        <text
                          x={rx + 12}
                          y={ry + 18}
                          className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                        >
                          Cell C{c.id}: {c.name} {probed ? '(PROBED)' : '(PRUNED)'}
                        </text>
                        {/* Centroid X marker */}
                        <circle
                          cx={c.cx}
                          cy={c.cy}
                          r={8}
                          fill="none"
                          stroke={c.color}
                          strokeWidth={probed ? 2.4 : 1.2}
                          strokeDasharray={probed ? undefined : '2 2'}
                        />
                        <text
                          x={c.cx}
                          y={c.cy + 3}
                          textAnchor="middle"
                          className="text-[8.5px] font-mono font-bold fill-slate-700 dark:fill-slate-200"
                        >
                          C{c.id}
                        </text>
                        {/* Line from Q to Centroid in phase 1+ */}
                        {animPhase >= 1 && (
                          <line
                            x1={queryPoint.x}
                            y1={queryPoint.y}
                            x2={c.cx}
                            y2={c.cy}
                            stroke={probed ? c.color : '#94a3b8'}
                            strokeWidth={probed ? 1.8 : 0.8}
                            strokeDasharray="4 3"
                            opacity={probed ? 0.85 : 0.35}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              )}

              {/* HNSW Multi-Layer Graph Edges */}
              {indexMode === 'hnsw' && (
                <g>
                  {/* Layer 0 local edges */}
                  {HNSW_EDGES[0].map(([u, v], idx) => (
                    <line
                      key={`l0-${idx}`}
                      x1={EMBEDDING_NODES[u].x}
                      y1={EMBEDDING_NODES[u].y}
                      x2={EMBEDDING_NODES[v].x}
                      y2={EMBEDDING_NODES[v].y}
                      className="stroke-slate-200 dark:stroke-slate-800"
                      strokeWidth={1}
                    />
                  ))}
                  {/* Layer 1 regional edges */}
                  {HNSW_EDGES[1].map(([u, v], idx) => (
                    <line
                      key={`l1-${idx}`}
                      x1={EMBEDDING_NODES[u].x}
                      y1={EMBEDDING_NODES[u].y}
                      x2={EMBEDDING_NODES[v].x}
                      y2={EMBEDDING_NODES[v].y}
                      stroke="#0ea5e9"
                      strokeOpacity={animPhase >= 2 ? 0.55 : 0.2}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                  ))}
                  {/* Layer 2 express highway edges */}
                  {HNSW_EDGES[2].map(([u, v], idx) => (
                    <line
                      key={`l2-${idx}`}
                      x1={EMBEDDING_NODES[u].x}
                      y1={EMBEDDING_NODES[u].y}
                      x2={EMBEDDING_NODES[v].x}
                      y2={EMBEDDING_NODES[v].y}
                      stroke="#f59e0b"
                      strokeOpacity={animPhase >= 1 ? 0.9 : 0.35}
                      strokeWidth={2.2}
                    />
                  ))}
                  {/* Highlighted HNSW Greedy Path */}
                  {animPhase >= 1 &&
                    hnswSimulation.layer2Path.slice(0, -1).map((fromId, idx) => {
                      const toId = hnswSimulation.layer2Path[idx + 1];
                      return (
                        <line
                          key={`p2-${idx}`}
                          x1={EMBEDDING_NODES[fromId].x}
                          y1={EMBEDDING_NODES[fromId].y}
                          x2={EMBEDDING_NODES[toId].x}
                          y2={EMBEDDING_NODES[toId].y}
                          stroke="#ea580c"
                          strokeWidth={3.2}
                        />
                      );
                    })}
                  {animPhase >= 2 &&
                    hnswSimulation.layer1Path.slice(0, -1).map((fromId, idx) => {
                      const toId = hnswSimulation.layer1Path[idx + 1];
                      return (
                        <line
                          key={`p1-${idx}`}
                          x1={EMBEDDING_NODES[fromId].x}
                          y1={EMBEDDING_NODES[fromId].y}
                          x2={EMBEDDING_NODES[toId].x}
                          y2={EMBEDDING_NODES[toId].y}
                          stroke="#0284c7"
                          strokeWidth={3}
                        />
                      );
                    })}
                </g>
              )}

              {/* Lines from Query Q to Final Top-K Winning Vectors */}
              {animPhase >= 3 &&
                activeResults.map((res) => (
                  <line
                    key={`win-${res.node.id}`}
                    x1={queryPoint.x}
                    y1={queryPoint.y}
                    x2={res.node.x}
                    y2={res.node.y}
                    stroke="#10b981"
                    strokeWidth={2.2}
                  />
                ))}

              {/* Embedding Vector Nodes */}
              {EMBEDDING_NODES.map((node) => {
                const isWinner = animPhase >= 3 && activeTopIds.has(node.id);
                const isVisited = animPhase >= 2 && activeVisitedIds.has(node.id);
                const isGroundTruthMissed =
                  animPhase >= 3 && exactTopKIds.has(node.id) && !activeTopIds.has(node.id);
                const clusterColor = CLUSTER_META[node.cluster].color;

                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    {isGroundTruthMissed && (
                      <circle
                        r={12}
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth={2}
                        strokeDasharray="3 2"
                      />
                    )}
                    <circle
                      r={isWinner ? 7.5 : node.hnswLayer === 2 && indexMode === 'hnsw' ? 6.5 : 5}
                      fill={isWinner ? '#10b981' : isVisited ? clusterColor : '#94a3b8'}
                      fillOpacity={isWinner || isVisited ? 1 : 0.45}
                      stroke={
                        node.hnswLayer === 2 && indexMode === 'hnsw' ? '#f59e0b' : '#ffffff'
                      }
                      strokeWidth={node.hnswLayer === 2 && indexMode === 'hnsw' ? 2 : 1.2}
                    />
                    <text
                      y={-10}
                      textAnchor="middle"
                      className={`text-[8.5px] font-mono ${
                        isWinner
                          ? 'fill-emerald-700 dark:fill-emerald-300 font-bold'
                          : isGroundTruthMissed
                            ? 'fill-rose-600 dark:fill-rose-400 font-bold'
                            : 'fill-slate-600 dark:fill-slate-400'
                      }`}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}

              {/* Query Vector Q */}
              <g transform={`translate(${queryPoint.x}, ${queryPoint.y})`}>
                <circle r={11} fill="#e11d48" fillOpacity={0.2} stroke="#e11d48" strokeWidth={2} />
                <circle r={4.5} fill="#e11d48" />
                <text
                  y={21}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-bold fill-rose-600 dark:fill-rose-400"
                >
                  QUERY Q
                </text>
              </g>
            </svg>
          </div>

          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <span>{stageDescription}</span>
            <span className="text-[10px] font-mono text-slate-500">
              Green = Returned Top-{topK} · Red Dashed Ring = Missed Ground-Truth Neighbor
            </span>
          </div>
        </div>

        {/* Right Column: Live Top-K Retrieved Vectors + SQL Index Blueprint */}
        <div className="space-y-4">
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Retrieved Top-{topK} Neighbors
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{metric}</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {activeResults.map((res, idx) => {
                const isExact = exactTopKIds.has(res.node.id);
                return (
                  <div key={res.node.id} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="font-mono text-sky-700 dark:text-sky-400">#{idx + 1}</span>
                        <span>{res.node.label}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {CLUSTER_META[res.node.cluster].name} · L{res.node.hnswLayer}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                        {res.display}
                      </div>
                      <div
                        className={`text-[10px] ${
                          isExact
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {isExact ? 'Exact Top-K Match' : 'Approx Neighbor'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Index Trade-Off Summary */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-4 space-y-2 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              HNSW vs. IVF Quick Rule
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>HNSW</strong> keeps multi-layer graphs in RAM for top recall &amp; streaming inserts, while <strong>IVF</strong> clusters into Voronoi cells for 4–8x lower RAM (but requires higher <code className="font-mono">nprobe</code> for boundary queries!).
            </p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Live pgvector DDL &amp; Query
              </span>
              <CopyButton text={pgvectorSql} label="Copy" />
            </div>
            <pre className="p-3 text-[11px] font-mono leading-relaxed text-slate-800 dark:text-slate-200 overflow-x-auto bg-slate-950/[0.02] dark:bg-slate-950">
              <code>{pgvectorSql}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Bottom Comparison Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Cosine Similarity (`&lt;=&gt;`)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Measures angle between vectors (ignores length). Default choice for OpenAI/Gemini text embeddings &amp; RAG.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            L2 Euclidean (`&lt;-&gt;`)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Measures straight-line geometric distance. Essential when vector magnitude carries real meaning (image/spatial features).
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Inner / Dot Product (`&lt;#&gt;`)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Fastest SIMD instruction! Mathematically identical to Cosine when vectors are pre-normalized to unit length (`||v|| = 1`).
          </p>
        </div>
      </div>
    </div>
  );
}
