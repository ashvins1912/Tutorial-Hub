import { useState } from 'react';
import {
  Cpu,
  Database,
  ShieldAlert,
  Sliders,
  Terminal,
} from 'lucide-react';
import {
  DATABASE_MASTERY_QUIZ,
  OUTAGE_SCENARIOS,
  PRODUCTION_CHECKLIST,
} from '../../data/databaseInternalsData';
import { useAccountState } from '../../hooks/useAccountState';
import { withStudioBoundary } from '../hoc';
import { SegmentedTabBar } from '../ui';
import { QueryPipelinePlayground } from './QueryPipelinePlayground';
import { ExplainAndNoSqlLab } from './ExplainAndNoSqlLab';
import { ProductionOpsAndCapacityLab } from './ProductionOpsAndCapacityLab';
import { ChaosDrillAndQuizLab } from './ChaosDrillAndQuizLab';

type DbStudioTab = 'engine' | 'explain' | 'production' | 'chaos-quiz';

interface DatabaseInternalsProgress {
  solvedQuizIds: string[];
  solvedOutageIds: string[];
  completedChecklistIds: string[];
}

const DEFAULT_DB_PROGRESS: DatabaseInternalsProgress = {
  solvedQuizIds: [],
  solvedOutageIds: [],
  completedChecklistIds: [],
};

const BoundedQueryPipelinePlayground = withStudioBoundary(QueryPipelinePlayground, {
  studioName: 'Query Pipeline & SQL Optimizer Playground',
});
const BoundedExplainAndNoSqlLab = withStudioBoundary(ExplainAndNoSqlLab, {
  studioName: 'EXPLAIN ANALYZE & NoSQL Auditing Lab',
});
const BoundedProductionOpsAndCapacityLab = withStudioBoundary(ProductionOpsAndCapacityLab, {
  studioName: 'Capacity Planner, RLS & CDC Lab',
});
const BoundedChaosDrillAndQuizLab = withStudioBoundary(ChaosDrillAndQuizLab, {
  studioName: 'SRE Chaos Simulator & Mastery Quiz',
});

export function DatabaseInternalsStudio() {
  const [activeTab, setActiveTab] = useState<DbStudioTab>('engine');
  const [progress, setProgress] = useAccountState<DatabaseInternalsProgress>(
    'db-internals-progress',
    DEFAULT_DB_PROGRESS,
    'patternforge_db_internals_progress_v1'
  );

  const solvedQuizIds = Array.isArray(progress?.solvedQuizIds) ? progress.solvedQuizIds : [];
  const solvedOutageIds = Array.isArray(progress?.solvedOutageIds) ? progress.solvedOutageIds : [];
  const completedChecklistIds = Array.isArray(progress?.completedChecklistIds)
    ? progress.completedChecklistIds
    : [];

  const totalMilestones =
    DATABASE_MASTERY_QUIZ.length + OUTAGE_SCENARIOS.length + PRODUCTION_CHECKLIST.length;
  const completedMilestones =
    solvedQuizIds.length + solvedOutageIds.length + completedChecklistIds.length;
  const masteryPct = Math.round((completedMilestones / Math.max(1, totalMilestones)) * 100);

  const handleMarkQuizSolved = (questionId: string) => {
    setProgress((prev) => {
      const existing = Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [];
      if (existing.includes(questionId)) return prev;
      return {
        solvedQuizIds: [...existing, questionId],
        solvedOutageIds: Array.isArray(prev?.solvedOutageIds) ? prev.solvedOutageIds : [],
        completedChecklistIds: Array.isArray(prev?.completedChecklistIds)
          ? prev.completedChecklistIds
          : [],
      };
    });
  };

  const handleResetQuizProgress = () => {
    setProgress((prev) => ({
      solvedQuizIds: [],
      solvedOutageIds: Array.isArray(prev?.solvedOutageIds) ? prev.solvedOutageIds : [],
      completedChecklistIds: Array.isArray(prev?.completedChecklistIds)
        ? prev.completedChecklistIds
        : [],
    }));
  };

  const handleMarkOutageSolved = (scenarioId: string) => {
    setProgress((prev) => {
      const existing = Array.isArray(prev?.solvedOutageIds) ? prev.solvedOutageIds : [];
      if (existing.includes(scenarioId)) return prev;
      return {
        solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
        solvedOutageIds: [...existing, scenarioId],
        completedChecklistIds: Array.isArray(prev?.completedChecklistIds)
          ? prev.completedChecklistIds
          : [],
      };
    });
  };

  const handleToggleChecklistId = (itemId: string) => {
    setProgress((prev) => {
      const existing = Array.isArray(prev?.completedChecklistIds) ? prev.completedChecklistIds : [];
      const next = existing.includes(itemId)
        ? existing.filter((id) => id !== itemId)
        : [...existing, itemId];
      return {
        solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
        solvedOutageIds: Array.isArray(prev?.solvedOutageIds) ? prev.solvedOutageIds : [],
        completedChecklistIds: next,
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Editorial Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Database className="w-3.5 h-3.5" aria-hidden="true" />
                Staff / Principal Database Engineering Studio
              </span>
              <span aria-hidden="true">·</span>
              <span>PostgreSQL · MySQL · MongoDB · Cassandra · DynamoDB · pgvector</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              Database Internals, Query Optimization &amp; Production SRE Lab
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              Trace queries through the 5-stage engine pipeline, tune 20M-row execution plans, simulate quorum and consistent hashing, calculate HNSW &amp; IOPS capacity, and diagnose live SEV-1 outages.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 min-w-[260px]">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Overall Mastery</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {masteryPct}%
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Quiz Score</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {solvedQuizIds.length}/{DATABASE_MASTERY_QUIZ.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Outage Drills</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {solvedOutageIds.length}/{OUTAGE_SCENARIOS.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Prod Checklist</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {completedChecklistIds.length}/{PRODUCTION_CHECKLIST.length}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <SegmentedTabBar<DbStudioTab>
            ariaLabel="Database Internals Studio workspaces"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: 'engine',
                label: 'Engine Internals & SQL Optimizer',
                shortLabel: 'Engine & SQL',
                icon: Cpu,
              },
              {
                id: 'explain',
                label: 'EXPLAIN ANALYZE & NoSQL Lab',
                shortLabel: 'EXPLAIN Lab',
                icon: Terminal,
              },
              {
                id: 'production',
                label: 'Capacity, RLS, CDC & Cheat Sheets',
                shortLabel: 'Ops & Capacity',
                icon: Sliders,
              },
              {
                id: 'chaos-quiz',
                label: 'Live Chaos Drill, Quiz & AI Tasks',
                shortLabel: 'Chaos & Quiz',
                count: solvedQuizIds.length + solvedOutageIds.length,
                icon: ShieldAlert,
              },
            ]}
          />
        </div>
      </section>

      {/* Active Studio Workspace (Isolated by withStudioBoundary HOC) */}
      {activeTab === 'engine' && <BoundedQueryPipelinePlayground />}
      {activeTab === 'explain' && <BoundedExplainAndNoSqlLab />}
      {activeTab === 'production' && (
        <BoundedProductionOpsAndCapacityLab
          completedChecklistIds={completedChecklistIds}
          onToggleChecklistId={handleToggleChecklistId}
        />
      )}
      {activeTab === 'chaos-quiz' && (
        <BoundedChaosDrillAndQuizLab
          solvedQuizIds={solvedQuizIds}
          solvedOutageIds={solvedOutageIds}
          onMarkQuizSolved={handleMarkQuizSolved}
          onResetQuizProgress={handleResetQuizProgress}
          onMarkOutageSolved={handleMarkOutageSolved}
        />
      )}
    </div>
  );
}
