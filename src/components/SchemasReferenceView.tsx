import { Database, Server } from 'lucide-react';
import { MONGOOSE_SCHEMAS_SOURCE } from '../data/mongooseSchemas';
import { CopyButton } from './ui';

export function SchemasReferenceView() {
  return (
    <div className="space-y-6">
      <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-sky-600 dark:text-sky-400">
              FULL-STACK DATA ARCHITECTURE · MERN + EXPRESS REST
            </p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
              <Database className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              MongoDB Mongoose Schemas & Cognitive API
            </h2>
          </div>
          <CopyButton
            text={MONGOOSE_SCHEMAS_SOURCE}
            label="Copy Mongoose Schemas"
            copiedLabel="Copied Schemas"
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { method: 'GET', path: '/api/cognitive/profile/:userId', desc: 'Fetches Rank, cognitive scores & 1-3-7-21 due queue' },
            { method: 'POST', path: '/api/cognitive/complete-problem', desc: 'Advances 1-3-7-21 interval & evaluates Rank promotion' },
            { method: 'GET', path: '/api/problems?topic=...&company=...', desc: 'Filters 36 Big Tech topic problems by company & difficulty' },
            { method: 'POST', path: '/api/sprints/create', desc: 'Generates weighted 14-day company sprint with recall & Day 14 mock' },
            { method: 'GET', path: '/api/sprints/active/:userId', desc: 'Fetches active sprint, readiness gauge & unlocked daily tasks' },
            { method: 'PATCH', path: '/api/sprints/:sprintId/complete-task', desc: 'Marks daily sprint task complete & unlocks next day on clear' },
          ].map((ep) => (
            <div
              key={ep.path}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-1"
            >
              <div className="flex items-center gap-1.5 font-mono font-semibold text-sky-700 dark:text-sky-400">
                <Server className="w-3.5 h-3.5" aria-hidden="true" />
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
    </div>
  );
}
