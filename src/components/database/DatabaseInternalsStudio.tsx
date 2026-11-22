import { useCallback, useState } from 'react';
import {
  BookOpen,
  Brain,
  Code2,
  Compass,
  Cpu,
  Database,
  GitBranch,
  Layers,
  Lock,
  PlayCircle,
  Scale,
  ShieldAlert,
  Sliders,
  Target,
  Terminal,
} from 'lucide-react';
import {
  DATABASE_MASTERY_QUIZ,
  OUTAGE_SCENARIOS,
  PRODUCTION_CHECKLIST,
} from '../../data/databaseInternalsData';
import {
  ARCHITECT_CONCEPTS,
  PRACTICE_CHALLENGES,
  VISUAL_FLOW_SCENARIOS,
} from '../../data/databaseVisualData';
import {
  DB_OBJECT_AND_ASSOC_MODULES,
  DB_SCHEMA_DESIGN_TECHNIQUES,
  SQL_PROGRESSIVE_SCENARIOS,
} from '../../data/dbCompleteObjectsAndSchemaData';
import { DATA_ENG_AI_DB_TOPICS } from '../../data/dataEngAndAiDbData';
import { DB_NAMED_ALGORITHMS } from '../../data/dbNamedAlgorithmsArchitectureData';
import { useAccountState } from '../../hooks/useAccountState';
import { withStudioBoundary } from '../hoc';
import { SegmentedTabBar } from '../ui';
import { DbNamedAlgorithmsMermaidLab } from './DbNamedAlgorithmsMermaidLab';
import { DataEngAndAiDatabasesLab } from './DataEngAndAiDatabasesLab';
import { VectorSimilaritySearchLab } from './VectorSimilaritySearchLab';
import { OptimisticVsPessimisticLockLab } from './OptimisticVsPessimisticLockLab';
import { OltpVsOlapArchitectureLab } from './OltpVsOlapArchitectureLab';
import { DbObjectsAndSchemaAcademy } from './DbObjectsAndSchemaAcademy';
import { DatabaseVisualAnimator } from './DatabaseVisualAnimator';
import { DatabaseConceptGuide } from './DatabaseConceptGuide';
import { DatabasePracticeWorkbench } from './DatabasePracticeWorkbench';
import { TaxonomyAndSqlMasteryLab } from './TaxonomyAndSqlMasteryLab';
import { QueryPipelinePlayground } from './QueryPipelinePlayground';
import { ExplainAndNoSqlLab } from './ExplainAndNoSqlLab';
import { ProductionOpsAndCapacityLab } from './ProductionOpsAndCapacityLab';
import { ChaosDrillAndQuizLab } from './ChaosDrillAndQuizLab';
import { ConcurrencyRecoverySecurityLab } from './ConcurrencyRecoverySecurityLab';
import { SqlBasicsPlayground } from './SqlBasicsPlayground';
import { SqlQueryIntelligenceLab } from './SqlQueryIntelligenceLab';
import { TopicBridgeBar } from '../shared/TopicBridgeBar';

type DbStudioTab =
  | 'db-algorithms-mermaid'
  | 'vector-search'
  | 'locking-sim'
  | 'arch-comparison'
  | 'data-eng-ai-db'
  | 'db-complete-academy'
  | 'sql-basics'
  | 'sql-intelligence'
  | 'live-labs'
  | 'taxonomy-sql'
  | 'visual-dfd'
  | 'concepts'
  | 'practice'
  | 'engine'
  | 'explain'
  | 'production'
  | 'chaos-quiz';

interface DatabaseInternalsProgress {
  solvedQuizIds: string[];
  solvedOutageIds: string[];
  completedChecklistIds: string[];
  understoodConceptIds?: string[];
  completedPracticeIds?: string[];
}

const DEFAULT_DB_PROGRESS: DatabaseInternalsProgress = {
  solvedQuizIds: [],
  solvedOutageIds: [],
  completedChecklistIds: [],
  understoodConceptIds: [],
  completedPracticeIds: [],
};

const BoundedDbNamedAlgorithmsMermaidLab = withStudioBoundary(
  DbNamedAlgorithmsMermaidLab,
  {
    studioName: 'Named Database Algorithms & Mermaid Flow Encyclopedia',
  }
);
const BoundedVectorSimilaritySearchLab = withStudioBoundary(VectorSimilaritySearchLab, {
  studioName: 'Vector Similarity Search (HNSW & IVF) Lab',
});
const BoundedOptimisticVsPessimisticLockLab = withStudioBoundary(OptimisticVsPessimisticLockLab, {
  studioName: 'Optimistic vs Pessimistic Locking Simulator',
});
const BoundedOltpVsOlapArchitectureLab = withStudioBoundary(OltpVsOlapArchitectureLab, {
  studioName: 'OLTP vs OLAP Architecture Comparison',
});
const BoundedDataEngAndAiDatabasesLab = withStudioBoundary(DataEngAndAiDatabasesLab, {
  studioName: 'Data Engineering, Cursors, Chunk Fetch & AI Databases Lab',
});
const BoundedDbObjectsAndSchemaAcademy = withStudioBoundary(DbObjectsAndSchemaAcademy, {
  studioName: 'Views, Triggers, Windows, NoSQL & Schema Design Academy',
});
const BoundedTaxonomyAndSqlMasteryLab = withStudioBoundary(TaxonomyAndSqlMasteryLab, {
  studioName: 'Database Taxonomy, SQL Mastery & Sharding Lab',
});
const BoundedDatabaseVisualAnimator = withStudioBoundary(DatabaseVisualAnimator, {
  studioName: 'Visual DFD & Algorithm Animation Lab',
});
const BoundedDatabaseConceptGuide = withStudioBoundary(DatabaseConceptGuide, {
  studioName: 'Technical Architect Concept Encyclopedia',
});
const BoundedDatabasePracticeWorkbench = withStudioBoundary(DatabasePracticeWorkbench, {
  studioName: 'Hands-On Practice & Confidence Workbench',
});
const BoundedQueryPipelinePlayground = withStudioBoundary(QueryPipelinePlayground, {
  studioName: 'Query Pipeline & SQL Optimizer Playground',
});
const BoundedExplainAndNoSqlLab = withStudioBoundary(ExplainAndNoSqlLab, {
  studioName: 'EXPLAIN ANALYZE & NoSQL Auditing Lab',
});
const BoundedProductionOpsAndCapacityLab = withStudioBoundary(ProductionOpsAndCapacityLab, {
  studioName: 'Capacity Planner, RLS & CDC Lab',
});
const BoundedSqlBasicsPlayground = withStudioBoundary(SqlBasicsPlayground, {
  studioName: 'SQL Basics, Indexing & Syntax Check Playground',
});
const BoundedSqlQueryIntelligenceLab = withStudioBoundary(SqlQueryIntelligenceLab, {
  studioName: 'SQL Operators, Joins, Intelligence Engine & Compression Lab',
});
const BoundedConcurrencyRecoverySecurityLab = withStudioBoundary(
  ConcurrencyRecoverySecurityLab,
  {
    studioName: 'Deadlock, PITR & Row-Level Security Visualizers',
  }
);
const BoundedChaosDrillAndQuizLab = withStudioBoundary(ChaosDrillAndQuizLab, {
  studioName: 'SRE Chaos Simulator & Mastery Quiz',
});

export function DatabaseInternalsStudio() {
  const [activeTab, setActiveTab] = useState<DbStudioTab>('db-algorithms-mermaid');
  const [selectedFlowId, setSelectedFlowId] = useState<string>(VISUAL_FLOW_SCENARIOS[0].id);

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
  const understoodConceptIds = Array.isArray(progress?.understoodConceptIds)
    ? progress.understoodConceptIds
    : [];
  const completedPracticeIds = Array.isArray(progress?.completedPracticeIds)
    ? progress.completedPracticeIds
    : [];

  const totalMilestones =
    ARCHITECT_CONCEPTS.length +
    PRACTICE_CHALLENGES.length +
    DATABASE_MASTERY_QUIZ.length +
    OUTAGE_SCENARIOS.length +
    PRODUCTION_CHECKLIST.length;
  const completedMilestones =
    understoodConceptIds.length +
    completedPracticeIds.length +
    solvedQuizIds.length +
    solvedOutageIds.length +
    completedChecklistIds.length;
  const masteryPct = Math.round((completedMilestones / Math.max(1, totalMilestones)) * 100);

  const patchProgress = useCallback(
    (updater: (current: Required<DatabaseInternalsProgress>) => Required<DatabaseInternalsProgress>) => {
      setProgress((prev) => {
        const normalized: Required<DatabaseInternalsProgress> = {
          solvedQuizIds: Array.isArray(prev?.solvedQuizIds) ? prev.solvedQuizIds : [],
          solvedOutageIds: Array.isArray(prev?.solvedOutageIds) ? prev.solvedOutageIds : [],
          completedChecklistIds: Array.isArray(prev?.completedChecklistIds)
            ? prev.completedChecklistIds
            : [],
          understoodConceptIds: Array.isArray(prev?.understoodConceptIds)
            ? prev.understoodConceptIds
            : [],
          completedPracticeIds: Array.isArray(prev?.completedPracticeIds)
            ? prev.completedPracticeIds
            : [],
        };
        return updater(normalized);
      });
    },
    [setProgress]
  );

  const handleMarkQuizSolved = useCallback(
    (questionId: string) => {
      patchProgress((curr) =>
        curr.solvedQuizIds.includes(questionId)
          ? curr
          : { ...curr, solvedQuizIds: [...curr.solvedQuizIds, questionId] }
      );
    },
    [patchProgress]
  );

  const handleResetQuizProgress = useCallback(() => {
    patchProgress((curr) => ({ ...curr, solvedQuizIds: [] }));
  }, [patchProgress]);

  const handleMarkOutageSolved = useCallback(
    (scenarioId: string) => {
      patchProgress((curr) =>
        curr.solvedOutageIds.includes(scenarioId)
          ? curr
          : { ...curr, solvedOutageIds: [...curr.solvedOutageIds, scenarioId] }
      );
    },
    [patchProgress]
  );

  const handleToggleChecklistId = useCallback(
    (itemId: string) => {
      patchProgress((curr) => ({
        ...curr,
        completedChecklistIds: curr.completedChecklistIds.includes(itemId)
          ? curr.completedChecklistIds.filter((id) => id !== itemId)
          : [...curr.completedChecklistIds, itemId],
      }));
    },
    [patchProgress]
  );

  const handleToggleConceptUnderstood = useCallback(
    (conceptId: string) => {
      patchProgress((curr) => ({
        ...curr,
        understoodConceptIds: curr.understoodConceptIds.includes(conceptId)
          ? curr.understoodConceptIds.filter((id) => id !== conceptId)
          : [...curr.understoodConceptIds, conceptId],
      }));
    },
    [patchProgress]
  );

  const handleMarkPracticeSolved = useCallback(
    (challengeId: string) => {
      patchProgress((curr) =>
        curr.completedPracticeIds.includes(challengeId)
          ? curr
          : { ...curr, completedPracticeIds: [...curr.completedPracticeIds, challengeId] }
      );
    },
    [patchProgress]
  );

  const handleOpenVisualFlow = useCallback((flowId: string) => {
    setSelectedFlowId(flowId);
    setActiveTab('visual-dfd');
  }, []);

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
              <span>Visual DFD Animations · Simple English Definitions · Hands-On Practice</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              Database Internals, Visual Architecture &amp; Practice Studio
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              Learn database internals visually through animated Data Flow Diagrams, plain-English explanations paired with standard technical definitions and exact algorithms, live hands-on SQL practice labs, and SEV-1 outage simulations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 min-w-[260px]">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Confidence Score</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {masteryPct}%
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Concepts Clear</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {understoodConceptIds.length}/{ARCHITECT_CONCEPTS.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Practice Labs</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {completedPracticeIds.length}/{PRACTICE_CHALLENGES.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Quiz &amp; Drills</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {solvedQuizIds.length + solvedOutageIds.length}/
                {DATABASE_MASTERY_QUIZ.length + OUTAGE_SCENARIOS.length}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <SegmentedTabBar<DbStudioTab>
            ariaLabel="Database Internals Studio workspaces"
            activeTab={activeTab}
            onChange={setActiveTab}
            wrap
            tabs={[
              {
                id: 'db-algorithms-mermaid',
                label: 'Named Algorithms & Mermaid Flows',
                shortLabel: 'DB Algos & Mermaid',
                count: DB_NAMED_ALGORITHMS.length,
                icon: GitBranch,
              },
              {
                id: 'vector-search',
                label: 'Vector Search (HNSW & IVF)',
                shortLabel: 'HNSW / IVF',
                icon: Target,
              },
              {
                id: 'locking-sim',
                label: 'Optimistic vs Pessimistic Locks',
                shortLabel: 'Locking Sim',
                icon: Lock,
              },
              {
                id: 'arch-comparison',
                label: 'Architecture Comparison',
                shortLabel: 'OLTP vs OLAP',
                icon: Scale,
              },
              {
                id: 'data-eng-ai-db',
                label: 'Cursors, Data Eng & AI DBs',
                shortLabel: 'DE & AI DBs',
                count: DATA_ENG_AI_DB_TOPICS.length,
                icon: Brain,
              },
              {
                id: 'db-complete-academy',
                label: 'Views, Triggers, NoSQL & Schema Design',
                shortLabel: 'DB & Schema',
                count:
                  DB_OBJECT_AND_ASSOC_MODULES.length +
                  SQL_PROGRESSIVE_SCENARIOS.length +
                  DB_SCHEMA_DESIGN_TECHNIQUES.length,
                icon: Layers,
              },
              {
                id: 'visual-dfd',
                label: 'Visual DFD & Animations',
                shortLabel: 'Visual DFD',
                count: VISUAL_FLOW_SCENARIOS.length,
                icon: PlayCircle,
              },
              {
                id: 'sql-basics',
                label: 'SQL Basics & Syntax Lab',
                shortLabel: 'SQL Basics',
                icon: Database,
              },
              {
                id: 'sql-intelligence',
                label: 'SQL Joins, Fns & Optimizer',
                shortLabel: 'SQL Intel',
                icon: Cpu,
              },
              {
                id: 'live-labs',
                label: 'Deadlock, PITR & RLS',
                shortLabel: 'Deadlock/PITR/RLS',
                icon: GitBranch,
              },
              {
                id: 'taxonomy-sql',
                label: 'Taxonomy, SQL & Sharding',
                shortLabel: 'SQL & Tax.',
                icon: Compass,
              },
              {
                id: 'concepts',
                label: 'Concepts & Algorithms',
                shortLabel: 'Concepts',
                count: ARCHITECT_CONCEPTS.length,
                icon: BookOpen,
              },
              {
                id: 'practice',
                label: 'Practice Lab',
                shortLabel: 'Practice',
                count: completedPracticeIds.length,
                icon: Code2,
              },
              {
                id: 'engine',
                label: 'SQL Optimizer & Engine',
                shortLabel: 'Optimizer',
                icon: Cpu,
              },
              {
                id: 'explain',
                label: 'EXPLAIN & NoSQL',
                shortLabel: 'EXPLAIN',
                icon: Terminal,
              },
              {
                id: 'production',
                label: 'Capacity, RLS & CDC',
                shortLabel: 'Capacity',
                icon: Sliders,
              },
              {
                id: 'chaos-quiz',
                label: 'Chaos Drill & Quiz',
                shortLabel: 'Quiz',
                count: solvedQuizIds.length + solvedOutageIds.length,
                icon: ShieldAlert,
              },
            ]}
          />
        </div>
      </section>

      {/* Active Studio Workspace (Every Inner Panel Isolated by withStudioBoundary HOC) */}
      {activeTab === 'db-algorithms-mermaid' && <BoundedDbNamedAlgorithmsMermaidLab />}
      {activeTab === 'vector-search' && <BoundedVectorSimilaritySearchLab />}
      {activeTab === 'locking-sim' && <BoundedOptimisticVsPessimisticLockLab />}
      {activeTab === 'arch-comparison' && <BoundedOltpVsOlapArchitectureLab />}
      {activeTab === 'data-eng-ai-db' && <BoundedDataEngAndAiDatabasesLab />}
      {activeTab === 'db-complete-academy' && <BoundedDbObjectsAndSchemaAcademy />}
      {activeTab === 'sql-basics' && <BoundedSqlBasicsPlayground />}
      {activeTab === 'sql-intelligence' && <BoundedSqlQueryIntelligenceLab />}
      {activeTab === 'live-labs' && <BoundedConcurrencyRecoverySecurityLab />}
      {activeTab === 'taxonomy-sql' && <BoundedTaxonomyAndSqlMasteryLab />}
      {activeTab === 'visual-dfd' && (
        <BoundedDatabaseVisualAnimator
          selectedFlowId={selectedFlowId}
          onSelectFlowId={setSelectedFlowId}
        />
      )}
      {activeTab === 'concepts' && (
        <BoundedDatabaseConceptGuide
          understoodConceptIds={understoodConceptIds}
          onToggleUnderstood={handleToggleConceptUnderstood}
          onOpenVisualFlow={handleOpenVisualFlow}
        />
      )}
      {activeTab === 'practice' && (
        <BoundedDatabasePracticeWorkbench
          completedPracticeIds={completedPracticeIds}
          onMarkPracticeSolved={handleMarkPracticeSolved}
        />
      )}
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

      <TopicBridgeBar studioId="db-internals" />
    </div>
  );
}
