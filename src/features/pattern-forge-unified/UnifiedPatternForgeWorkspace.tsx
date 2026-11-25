import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Code2,
  Eye,
  GraduationCap,
  ShieldCheck,
  Target,
} from 'lucide-react';
import type { LessonStageId } from '../../../shared/learningContract';
import {
  FIVE_STAGE_LIFECYCLE,
  PATTERN_FORGE_CURRICULUM,
  PATTERN_FORGE_TOPICS,
} from '../../../shared/patternForgeCurriculum';
import { auditCurriculumGovernance } from '../../../shared/learningValidator';
import { useUnifiedLearningStore } from './useUnifiedLearningStore';
import { StageUnderstandView } from './components/StageUnderstandView';
import { TraceVisualizationPlayer } from './components/TraceVisualizationPlayer';
import { StageImplementView } from './components/StageImplementView';
import { StagePracticeView } from './components/StagePracticeView';
import { StageMasterView } from './components/StageMasterView';

interface UnifiedPatternForgeWorkspaceProps {
  externalTopicId?: string | null;
  onConsumeExternalTopic?: () => void;
}

const STAGE_ICONS: Record<LessonStageId, React.ComponentType<{ className?: string }>> = {
  understand: BookOpen,
  visualize: Eye,
  implement: Code2,
  practice: Target,
  master: GraduationCap,
};

export const UnifiedPatternForgeWorkspace: React.FC<UnifiedPatternForgeWorkspaceProps> = ({
  externalTopicId,
  onConsumeExternalTopic,
}) => {
  const activeTopicId = useUnifiedLearningStore((s) => s.activeTopicId);
  const activeStage = useUnifiedLearningStore((s) => s.activeStage);
  const activeWorkspaceTab = useUnifiedLearningStore((s) => s.activeWorkspaceTab);
  const setActiveTopicId = useUnifiedLearningStore((s) => s.setActiveTopicId);
  const setActiveStage = useUnifiedLearningStore((s) => s.setActiveStage);
  const setActiveWorkspaceTab = useUnifiedLearningStore((s) => s.setActiveWorkspaceTab);
  const hydrateFromServer = useUnifiedLearningStore((s) => s.hydrateFromServer);
  const evidenceByTopic = useUnifiedLearningStore((s) => s.evidenceByTopic);
  const revisionsByTopic = useUnifiedLearningStore((s) => s.revisionsByTopic);
  const getTopicMastery = useUnifiedLearningStore((s) => s.getTopicMastery);

  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'pilot' | 'inventory'>('all');
  // Consume each external navigation request at most once. A parent callback may
  // legitimately change identity after it clears the request; that must not cause
  // this effect to dispatch another store update.
  const lastConsumedExternalTopicRef = React.useRef<string | null>(null);

  useEffect(() => {
    void hydrateFromServer();
  }, [hydrateFromServer]);

  useEffect(() => {
    if (
      !externalTopicId ||
      !PATTERN_FORGE_TOPICS.some((t) => t.id === externalTopicId) ||
      lastConsumedExternalTopicRef.current === externalTopicId
    ) {
      return;
    }

    // Mark before invoking parent/store callbacks so synchronous renders cannot
    // re-enter the same navigation request.
    lastConsumedExternalTopicRef.current = externalTopicId;
    setActiveTopicId(externalTopicId, 'understand');
    onConsumeExternalTopic?.();
  }, [externalTopicId, onConsumeExternalTopic, setActiveTopicId]);

  const activeTopic = useMemo(
    () => PATTERN_FORGE_TOPICS.find((t) => t.id === activeTopicId) ?? PATTERN_FORGE_TOPICS[0],
    [activeTopicId]
  );

  const activeMastery = useMemo(
    () => getTopicMastery(activeTopic.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTopic.id, evidenceByTopic]
  );

  const governanceAudit = useMemo(() => auditCurriculumGovernance(PATTERN_FORGE_TOPICS), []);

  const filteredTopics = useMemo(() => {
    if (sidebarFilter === 'pilot') return PATTERN_FORGE_TOPICS.filter((t) => t.isPilotReference);
    if (sidebarFilter === 'inventory') return PATTERN_FORGE_TOPICS.filter((t) => !t.isPilotReference);
    return PATTERN_FORGE_TOPICS;
  }, [sidebarFilter]);

  const revisionList = useMemo(
    () =>
      Object.values(revisionsByTopic).sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      ),
    [revisionsByTopic]
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Workspace Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tutorial Hub Unified Learning Engine · v{PATTERN_FORGE_CURRICULUM.version} ·{' '}
            {governanceAudit.publishedCount} Published Pilot Patterns · {governanceAudit.totalTopics} Canonical Patterns Registered
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Pattern Forge — Reference Learning Experience
          </h1>
        </div>

        {/* Workspace Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab('learn')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeWorkspaceTab === 'learn'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Five-Stage Workspace
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab('revisions')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeWorkspaceTab === 'revisions'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Revision Queue ({revisionList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWorkspaceTab('governance')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              activeWorkspaceTab === 'governance'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Quality Governance</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FIVE-STAGE LEARNING WORKSPACE */}
      {activeWorkspaceTab === 'learn' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Rail: 28-Pattern Canonical Curriculum */}
          <aside className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  28-Pattern Curriculum
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {filteredTopics.length} shown
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 text-[11px]">
                {([
                  ['all', 'All (28)'],
                  ['pilot', 'Pilot (3)'],
                  ['inventory', 'Queue (25)'],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSidebarFilter(key)}
                    className={`py-1 rounded font-medium transition-colors whitespace-nowrap ${
                      sidebarFilter === key
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[720px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTopics.map((topic) => {
                const isSelected = topic.id === activeTopic.id;
                const topicMastery = getTopicMastery(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setActiveTopicId(topic.id, 'understand')}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isSelected
                        ? 'bg-sky-50/80 dark:bg-sky-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-sky-900 dark:text-sky-200'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {String(topic.number).padStart(2, '0')}. {topic.shortTitle}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                        {topicMastery.overallScorePct > 0 ? `${topicMastery.overallScorePct}%` : ''}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span
                        className={
                          topic.verificationStatus === 'Published'
                            ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-slate-500 dark:text-slate-400'
                        }
                      >
                        {topic.verificationStatus}
                      </span>
                      <span className="mx-1" aria-hidden="true">·</span>
                      <span>{topicMastery.level}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main 5-Stage Learning Surface */}
          <div className="lg:col-span-9 space-y-6">
            {/* Active Topic Metadata & 5-Stage Lifecycle Bar */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Pattern #{activeTopic.number} · {activeTopic.groupTitle} ·{' '}
                    <span
                      className={
                        activeTopic.verificationStatus === 'Published'
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-amber-700 dark:text-amber-400 font-medium'
                      }
                    >
                      {activeTopic.verificationStatus}
                    </span>{' '}
                    · v{activeTopic.version.version}
                  </div>
                  <h2 className="mt-1 text-xl font-display font-bold text-slate-900 dark:text-slate-100">
                    {activeTopic.title}
                  </h2>
                </div>

                <div className="text-right font-mono tabular-nums">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Mastery Standing
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activeMastery.level} · {activeMastery.overallScorePct}%
                  </div>
                </div>
              </div>

              {/* 5-Stage Horizontal Stepper */}
              <nav aria-label="Five-Stage Learning Lifecycle" className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {FIVE_STAGE_LIFECYCLE.map((stage) => {
                  const Icon = STAGE_ICONS[stage.id];
                  const active = activeStage === stage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => setActiveStage(stage.id)}
                      className={`text-left px-3 py-2.5 rounded-lg border transition-colors ${
                        active
                          ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap">
                        <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          {stage.order}. {stage.title}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {stage.subtitle}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Active Stage Content */}
            {activeStage === 'understand' && (
              <StageUnderstandView
                topic={activeTopic}
                onSelectTopic={(id) => setActiveTopicId(id, 'understand')}
                onAdvanceStage={() => setActiveStage('visualize')}
              />
            )}
            {activeStage === 'visualize' && (
              <TraceVisualizationPlayer
                topic={activeTopic}
                onAdvanceStage={() => setActiveStage('implement')}
              />
            )}
            {activeStage === 'implement' && (
              <StageImplementView
                topic={activeTopic}
                onAdvanceStage={() => setActiveStage('practice')}
              />
            )}
            {activeStage === 'practice' && (
              <StagePracticeView
                topic={activeTopic}
                onAdvanceStage={() => setActiveStage('master')}
              />
            )}
            {activeStage === 'master' && <StageMasterView topic={activeTopic} />}
          </div>
        </div>
      )}

      {/* TAB 2: ADAPTIVE REVISION QUEUE */}
      {activeWorkspaceTab === 'revisions' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
              Adaptive Spaced-Revision Queue (Day 1 · 3 · 7 · 14 · 30)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Topics enter revision once you pass conceptual checks or verify code implementations. Struggles automatically pull topics forward for reinforcement.
            </p>
          </div>

          {revisionList.length === 0 ? (
            <div className="p-8 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
              No patterns are scheduled for revision yet. Complete Stage 1 Concept Check or verify a solution in Stage 3 to start your adaptive retention ladder.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {revisionList.map((rev) => (
                <div
                  key={rev.id}
                  className="py-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {rev.topicTitle}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      Interval: Day {rev.intervalDays} · Status: {rev.status} · Due{' '}
                      {new Date(rev.dueAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {rev.adjustmentReason}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTopicId(rev.topicId, 'master')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
                  >
                    Open Recall Check
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: CONTENT QUALITY GOVERNANCE AUDIT */}
      {activeWorkspaceTab === 'governance' && (
        <section className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Registered Patterns</div>
              <div className="mt-1 text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {governanceAudit.totalTopics}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Published Reference Pilot</div>
              <div className="mt-1 text-2xl font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                {governanceAudit.publishedCount}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Structurally Valid Queue</div>
              <div className="mt-1 text-2xl font-mono font-bold tabular-nums text-amber-700 dark:text-amber-400">
                {governanceAudit.structurallyValidOnlyCount}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">DAG &amp; Unique ID Check</div>
              <div className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {governanceAudit.uniqueIdsValid && governanceAudit.prerequisiteGraphAcyclic
                  ? 'Verified Acyclic & Unique'
                  : 'Integrity Error'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-display font-semibold text-slate-900 dark:text-slate-100">
                Canonical Content Contract Governance Ledger
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structurally valid inventory records are explicitly separated from Code Verified / Published reference lessons.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Canonical ID &amp; Pattern</th>
                    <th className="px-4 py-3 font-medium">Version</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Checks Passed</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {governanceAudit.topicReports.map((rep) => {
                    const passedCount = rep.checks.filter((c) => c.passed).length;
                    return (
                      <tr key={rep.topicId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {rep.title}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">{rep.topicId}</div>
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                          v{rep.version}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              rep.verificationStatus === 'Published'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {rep.verificationStatus === 'Published' && (
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            {rep.verificationStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          {passedCount} / {rep.checks.length}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveTopicId(rep.topicId, 'understand')}
                            className="text-sky-700 dark:text-sky-400 font-semibold hover:underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
