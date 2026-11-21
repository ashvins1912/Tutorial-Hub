import { useEffect, useState } from 'react';
import { Database, Pause, Play, RotateCcw, Server } from 'lucide-react';
import { MONGOOSE_SCHEMAS_SOURCE } from '../data/mongooseSchemas';
import { CopyButton } from './ui';
import { TopicBridgeBar } from './shared/TopicBridgeBar';

const SCHEMA_DFD_STEPS = [
  {
    step: 1,
    nodeId: 'client',
    title: 'Frontend Action (React Client)',
    plainEnglish:
      'When you finish a problem or save a note, the browser sends a small JSON message over HTTPS to the backend API.',
    standardDef:
      'Stateless HTTP/JSON client request carrying Bearer auth credentials and structured domain payload.',
    latencyMs: 8,
  },
  {
    step: 2,
    nodeId: 'api',
    title: 'Express REST Router & Auth Guard',
    plainEnglish:
      'The backend checks who you are, verifies the fields are valid, and routes the request to the right service handler.',
    standardDef:
      'API controller enforces JWT/session identity, input schema validation, and idempotency before persistence.',
    latencyMs: 14,
  },
  {
    step: 3,
    nodeId: 'mongoose',
    title: 'Mongoose Schema & Validation Layer',
    plainEnglish:
      'Mongoose acts like a strict gatekeeper: it checks data types, required fields, and defaults so broken data never enters the database.',
    standardDef:
      'ODM schema contract mapping TypeScript interfaces to strongly typed BSON documents with pre-save hooks and field validators.',
    latencyMs: 19,
  },
  {
    step: 4,
    nodeId: 'storage',
    title: 'Indexed Collection & Persistence Store',
    plainEnglish:
      'The database updates the exact user record in milliseconds using a compound B-Tree index instead of scanning every document.',
    standardDef:
      'Atomic document upsert backed by compound indexes (userId + problemId) and Write-Ahead / Journal durability.',
    latencyMs: 28,
  },
] as const;

const ENDPOINTS = [
  { method: 'GET', path: '/api/cognitive/profile/:userId', desc: 'Fetches Rank, cognitive scores & 1-3-7-21 due queue' },
  { method: 'POST', path: '/api/cognitive/complete-problem', desc: 'Advances 1-3-7-21 interval & evaluates Rank promotion' },
  { method: 'GET', path: '/api/problems?topic=...&company=...', desc: 'Filters 36 Big Tech topic problems by company & difficulty' },
  { method: 'POST', path: '/api/sprints/create', desc: 'Generates weighted 14-day company sprint with recall & Day 14 mock' },
  { method: 'GET', path: '/api/sprints/active/:userId', desc: 'Fetches active sprint, readiness gauge & unlocked daily tasks' },
  { method: 'PATCH', path: '/api/sprints/:sprintId/complete-task', desc: 'Marks daily sprint task complete & unlocks next day on clear' },
];

export function SchemasReferenceView() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCHEMA_DFD_STEPS.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const currentStep = SCHEMA_DFD_STEPS[activeIdx] ?? SCHEMA_DFD_STEPS[0];

  const dfdNodes = [
    { id: 'client', x: 18, label: 'React Client', sub: 'HTTPS JSON' },
    { id: 'api', x: 230, label: 'Express REST API', sub: 'Auth + Router' },
    { id: 'mongoose', x: 442, label: 'Schema Contract', sub: 'Type & Constraint Check' },
    { id: 'storage', x: 654, label: 'Indexed Store', sub: 'Compound B-Tree Index' },
  ];

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-mono text-sky-700 dark:text-sky-400">
              Full-Stack Data Architecture · Schema Contracts &amp; REST API Flow
            </p>
            <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2 text-balance">
              <Database className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
              Database Schemas, API Contracts &amp; Request DFD
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every reliable app separates how data is requested (REST endpoints), how it is validated (typed schemas), and how it is stored and indexed for fast lookups.
            </p>
          </div>
          <CopyButton
            text={MONGOOSE_SCHEMAS_SOURCE}
            label="Copy Mongoose Schemas"
            copiedLabel="Copied Schemas"
            size="sm"
          />
        </div>

        {/* Interactive Animated Schema & API Data Flow Diagram (DFD) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Interactive Request-to-Schema Data Flow Diagram (DFD)
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Step {currentStep.step} of {SCHEMA_DFD_STEPS.length} · {currentStep.title} · Cumulative{' '}
                <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                  {currentStep.latencyMs} ms
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Play DFD'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveIdx(0);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 848 136"
              className="w-full min-w-[640px] h-auto"
              role="img"
              aria-label="Client to Express API to Mongoose Schema Validation to Indexed Database Store DFD"
            >
              <defs>
                <marker
                  id="schema-dfd-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" className="fill-slate-400 dark:fill-slate-500" />
                </marker>
                <marker
                  id="schema-dfd-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" className="fill-sky-600 dark:fill-sky-400" />
                </marker>
              </defs>

              {dfdNodes.map((node, i) => {
                const isActive = i === activeIdx;
                const isDone = i < activeIdx;
                const nextNode = dfdNodes[i + 1];
                return (
                  <g key={node.id}>
                    {nextNode && (
                      <line
                        x1={node.x + 176}
                        y1={66}
                        x2={nextNode.x - 6}
                        y2={66}
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className={
                          isActive || isDone
                            ? 'stroke-sky-600 dark:stroke-sky-400'
                            : 'stroke-slate-300 dark:stroke-slate-700'
                        }
                        markerEnd={
                          isActive || isDone
                            ? 'url(#schema-dfd-arrow-active)'
                            : 'url(#schema-dfd-arrow)'
                        }
                      />
                    )}
                    <g
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveIdx(i);
                      }}
                      className="cursor-pointer"
                    >
                      <rect
                        x={node.x}
                        y={28}
                        width={176}
                        height={76}
                        rx={10}
                        strokeWidth={isActive ? 2.2 : 1.2}
                        className={
                          isActive
                            ? 'fill-sky-600 dark:fill-sky-500 stroke-sky-700 dark:stroke-sky-300'
                            : isDone
                              ? 'fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-400 dark:stroke-emerald-700'
                              : 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700'
                        }
                      />
                      <text
                        x={node.x + 88}
                        y={58}
                        textAnchor="middle"
                        className={`text-[12px] font-semibold ${
                          isActive
                            ? 'fill-white dark:fill-slate-950'
                            : 'fill-slate-900 dark:fill-slate-100'
                        }`}
                      >
                        {node.label}
                      </text>
                      <text
                        x={node.x + 88}
                        y={78}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          isActive
                            ? 'fill-sky-100 dark:fill-slate-900'
                            : 'fill-slate-500 dark:fill-slate-400'
                        }`}
                      >
                        {node.sub}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                In Simple English (Beginner Friendly)
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.plainEnglish}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 space-y-1">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Standard Architecture Definition
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.standardDef}
              </p>
            </div>
          </div>
        </div>

        {/* REST Endpoints Contract Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1"
            >
              <div className="flex items-center gap-1.5 font-mono font-semibold text-sky-700 dark:text-sky-400">
                <Server className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{ep.method}</span>
              </div>
              <div className="font-mono text-[11px] text-slate-900 dark:text-slate-100 break-all">
                {ep.path}
              </div>
              <p className="text-slate-600 dark:text-slate-400">{ep.desc}</p>
            </div>
          ))}
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-6 overflow-x-auto border border-slate-800 max-h-[60vh]">
          {MONGOOSE_SCHEMAS_SOURCE}
        </pre>
      </div>

      <TopicBridgeBar studioId="schemas" />
    </div>
  );
}
