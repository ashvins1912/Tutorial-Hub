import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Database,
  Edit3,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';
import { usePatternForgeStore, TopView } from '../store/usePatternForgeStore';
import type { CodeLanguage, RankTier } from '../types/dsa';

interface UserPreferences {
  targetRole: string;
  targetCompany: 'Google' | 'Meta' | 'Amazon' | 'Microsoft' | 'Apple' | 'Any';
  dailyGoalMinutes: number;
  preferredLanguage: CodeLanguage;
  bio: string;
}

interface ProfileStatsPayload {
  storageMode: 'mongodb' | 'dev-memory';
  isFreshAccount?: boolean;
  communityChallengesSolved?: number;
  account: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    memberSince: string;
    lastSignInAt: string;
  };
  preferences: UserPreferences;
  rank: {
    currentTier: RankTier;
    nextTier: RankTier | null;
    totalXp: number;
    xpToNextTier: number;
    rankProgressPct: number;
  };
  cognitiveMetrics: {
    signalRecognitionScore: number;
    bottleneckDiagnosisScore: number;
    logicAssemblyAccuracy: number;
    paperDryRunStreak: number;
  };
  compositeAccuracy: number;
  uniqueProblemsSolved: number;
  labTelemetry: {
    totalLabs: number;
    completedLabs: number;
    inProgressLabs: number;
    signalsExploredTotal: number;
    xrayDecodedCount: number;
    patternQuizzesSolved: number;
    sandboxesVerified: number;
    invariantsLocked: number;
    activeRecallCount: number;
    bottlenecksDiagnosed: number;
    feynmanReflectionsDone: number;
    totalAssemblyErrors: number;
  };
  solverTelemetry?: {
    completedCount: number;
    microDrillsCompleted: number;
    dropsLogged: number;
    unlockedTier: string;
    customConceptsCount: number;
    engineTrackedConcepts: number;
    engineAvgMastery: number;
  };
  moduleProgress: {
    id: string;
    label: string;
    completed: number;
    total: number;
  }[];
  difficultyBreakdown: {
    Easy: { solved: number; total: number };
    Medium: { solved: number; total: number };
    Hard: { solved: number; total: number };
  };
  topicBreakdown: {
    topic: string;
    solved: number;
    total: number;
    pct: number;
  }[];
  companyReadiness: {
    company: string;
    solvedCount: number;
    totalCount: number;
    readinessPct: number;
  }[];
  activeSprint: {
    targetCompany: string;
    currentDay: number;
    dailyMinutesBudget: number;
    completionPct: number;
    readinessScore: number;
    tasksCompleted: number;
    totalTasks: number;
  } | null;
  spacedRepetition: {
    totalScheduled: number;
    dueNow: number;
    stageCounts: Record<'1' | '3' | '7' | '21', number>;
    queue: {
      problemId: string;
      problemTitle: string;
      patternTag: string;
      intervalStage: 1 | 3 | 7 | 21;
      nextReviewDate: string;
      isDueNow: boolean;
      twistConstraint: string;
    }[];
  };
  notesSummary: {
    totalNotes: number;
    totalWords: number;
    recentKeys: string[];
  };
  warmupDrillsCompleted: number;
  topicExpertiseChecksCount: number;
  activity14Days: {
    date: string;
    label: string;
    count: number;
    xp: number;
  }[];
  recentActivity: {
    date: string;
    kind: string;
    label: string;
    xp: number;
    score?: number;
  }[];
  dbSyncLedger: {
    key: string;
    label: string;
    category: string;
    persisted: boolean;
    itemCount: number;
    updatedAt: string | null;
  }[];
}

type ProfileTab = 'overview' | 'readiness' | 'modules';

const MODULE_NAV_MAP: Record<string, TopView> = {
  labs: 'workspace',
  bigtech: 'roadmap',
  'product-bank': 'roadmap',
  quizzes: 'skill-tree',
  xray: 'workspace',
  recall: 'workspace',
  'dp-lab': 'workspace',
  'matrix-bank': 'workspace',
  algorithms: 'algorithms',
  fuzzy: 'fuzzy-search',
  'sys-design': 'system-design',
  'sys-roadmap': 'system-design',
  mutations: 'workspace',
  'solver-studio': 'solver',
  'concept-engine': 'knowledge-engine',
};

const LANG_LABELS: Record<CodeLanguage, string> = {
  python: 'Python',
  js: 'JavaScript',
  java: 'Java',
};

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Not synced yet';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string, email: string): string {
  const src = name.trim() || email.split('@')[0] || 'U';
  const parts = src.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export function ProfileStatsView() {
  const setActiveView = usePatternForgeStore((s) => s.setActiveView);
  const selectProblem = usePatternForgeStore((s) => s.selectProblem);
  const setActiveLanguage = usePatternForgeStore((s) => s.setActiveLanguage);
  const fetchBrainProfile = usePatternForgeStore((s) => s.fetchBrainProfile);

  const [stats, setStats] = useState<ProfileStatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [topicFilter, setTopicFilter] = useState('');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'synced'>('all');
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Edit profile form state
  const [editing, setEditing] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [formFullName, setFormFullName] = useState('');
  const [formTargetRole, setFormTargetRole] = useState('Senior Software Engineer');
  const [formTargetCompany, setFormTargetCompany] =
    useState<UserPreferences['targetCompany']>('Google');
  const [formDailyGoal, setFormDailyGoal] = useState(60);
  const [formPreferredLang, setFormPreferredLang] = useState<CodeLanguage>('python');
  const [formBio, setFormBio] = useState('');

  const loadStats = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/profile/stats');
      if (!res.ok) {
        throw new Error(`Unable to load profile statistics (${res.status}).`);
      }
      const data = (await res.json()) as ProfileStatsPayload;
      setStats(data);
      setFormFullName(data.account.fullName || '');
      setFormTargetRole(data.preferences.targetRole);
      setFormTargetCompany(data.preferences.targetCompany);
      setFormDailyGoal(data.preferences.dailyGoalMinutes);
      setFormPreferredLang(data.preferences.preferredLanguage);
      setFormBio(data.preferences.bio || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profile statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStats(false);
  }, [loadStats]);

  // Auto-refresh whenever any DB-backed hook persists state
  useEffect(() => {
    const onDbSync = () => {
      void loadStats(true);
    };
    window.addEventListener('patternforge:db-sync', onDbSync);
    return () => window.removeEventListener('patternforge:db-sync', onDbSync);
  }, [loadStats]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSaveFeedback(null);
    try {
      const res = await apiFetch('/api/profile/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formFullName,
          targetRole: formTargetRole,
          targetCompany: formTargetCompany,
          dailyGoalMinutes: formDailyGoal,
          preferredLanguage: formPreferredLang,
          bio: formBio,
        }),
      });
      if (!res.ok) throw new Error('Could not save profile preferences.');
      setActiveLanguage(formPreferredLang);
      await Promise.all([loadStats(true), fetchBrainProfile()]);
      setEditing(false);
      setSaveFeedback('Profile and learning goals saved to database.');
    } catch (err) {
      setSaveFeedback(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const filteredTopics = useMemo(() => {
    if (!stats) return [];
    const q = topicFilter.trim().toLowerCase();
    if (!q) return stats.topicBreakdown;
    return stats.topicBreakdown.filter((t) => t.topic.toLowerCase().includes(q));
  }, [stats, topicFilter]);

  const filteredLedger = useMemo(() => {
    if (!stats) return [];
    if (ledgerFilter === 'synced') {
      return stats.dbSyncLedger.filter((row) => row.persisted);
    }
    return stats.dbSyncLedger;
  }, [stats, ledgerFilter]);

  const maxDayCount = useMemo(() => {
    if (!stats) return 1;
    return Math.max(1, ...stats.activity14Days.map((d) => d.count));
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading profile statistics">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-80 rounded bg-slate-100 dark:bg-slate-800/70" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse"
            >
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800 mb-3" />
              <div className="h-6 w-14 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <div className="h-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Could not load learner profile
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {error || 'The profile telemetry endpoint returned an empty response.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadStats(false)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    );
  }

  const displayName = stats.account.fullName.trim() || stats.account.email.split('@')[0] || 'Learner';
  const syncedKeysCount = stats.dbSyncLedger.filter((k) => k.persisted).length;
  const totalLedgerItems = stats.dbSyncLedger.reduce((acc, k) => acc + k.itemCount, 0);
  const solverTel = stats.solverTelemetry ?? {
    completedCount: 0,
    microDrillsCompleted: 0,
    dropsLogged: 0,
    unlockedTier: 'Easy',
    customConceptsCount: 0,
    engineTrackedConcepts: 0,
    engineAvgMastery: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Summary & Rank Progress */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0">
            {stats.account.avatarUrl && !avatarFailed ? (
              <img
                src={stats.account.avatarUrl}
                alt={`${displayName} profile avatar`}
                referrerPolicy="no-referrer"
                onError={() => setAvatarFailed(true)}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-14 h-14 rounded-xl bg-slate-900 dark:bg-sky-500/15 border border-slate-200 dark:border-sky-500/30 flex items-center justify-center text-base font-display font-bold text-white dark:text-sky-300 shrink-0"
              >
                {getInitials(stats.account.fullName, stats.account.email)}
              </div>
            )}

            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </h1>
                <span className="text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400 font-semibold">
                  {stats.rank.currentTier} Rank
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span>{stats.account.email}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Target: {stats.preferences.targetRole} ({stats.preferences.targetCompany})
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Goal: {stats.preferences.dailyGoalMinutes}m/day
                </span>
                <span aria-hidden="true">·</span>
                <span>Language: {LANG_LABELS[stats.preferences.preferredLanguage]}</span>
                <span aria-hidden="true">·</span>
                <span>Member since {formatShortDate(stats.account.memberSince)}</span>
              </div>

              {stats.preferences.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl pt-0.5">
                  {stats.preferences.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('community')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
            >
              Community Leaderboard
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => void loadStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing((v) => !v);
                setSaveFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
            >
              {editing ? (
                <>
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Close Editor
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit Profile & Goals
                </>
              )}
            </button>
          </div>
        </div>

        {/* Rank & XP Progress Line */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Rank Trajectory: {stats.rank.currentTier}
                {stats.rank.nextTier ? ` → ${stats.rank.nextTier}` : ' (Top Tier Reached)'}
              </span>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <span className="font-mono tabular-nums">
                {stats.rank.totalXp.toLocaleString()} XP earned
              </span>
              {stats.rank.nextTier && (
                <>
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {stats.rank.xpToNextTier.toLocaleString()} XP to {stats.rank.nextTier}
                  </span>
                </>
              )}
            </div>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              {stats.rank.rankProgressPct}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sky-600 dark:bg-sky-400 rounded-full transition-transform duration-300 origin-left"
              style={{ width: `${Math.max(2, stats.rank.rankProgressPct)}%` }}
            />
          </div>
        </div>

        {saveFeedback && (
          <div className="flex items-center justify-between gap-2 pt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span>{saveFeedback}</span>
            <button
              type="button"
              onClick={() => setSaveFeedback(null)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Editable Profile & Goals Form */}
        {editing && (
          <form
            onSubmit={handleSaveProfile}
            className="pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Display Name</span>
              <input
                type="text"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                maxLength={80}
                placeholder="Your full name"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Target Role</span>
              <input
                type="text"
                value={formTargetRole}
                onChange={(e) => setFormTargetRole(e.target.value)}
                maxLength={80}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Target Company</span>
              <select
                value={formTargetCompany}
                onChange={(e) =>
                  setFormTargetCompany(e.target.value as UserPreferences['targetCompany'])
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {(['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Any'] as const).map((co) => (
                  <option key={co} value={co}>
                    {co}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Daily Practice Goal (minutes)
              </span>
              <input
                type="number"
                min={15}
                max={360}
                step={5}
                value={formDailyGoal}
                onChange={(e) => setFormDailyGoal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <label className="space-y-1.5 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Preferred Interview Language
              </span>
              <select
                value={formPreferredLang}
                onChange={(e) => setFormPreferredLang(e.target.value as CodeLanguage)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="python">Python</option>
                <option value="js">JavaScript</option>
                <option value="java">Java</option>
              </select>
            </label>

            <label className="space-y-1.5 text-xs md:col-span-2 lg:col-span-3">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Learning Focus / Bio (saved to your DB profile)
              </span>
              <textarea
                rows={2}
                maxLength={300}
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                placeholder="e.g. Preparing for L5 Google interviews; focusing on DP state transitions and Graph shortest paths."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>

            <div className="md:col-span-2 lg:col-span-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingPrefs}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                {savingPrefs ? 'Saving...' : 'Save to Database'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Fresh Account Zero-State Verification Strip */}
      {(stats.isFreshAccount || (stats.rank.totalXp === 0 && stats.uniqueProblemsSolved === 0)) && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Fresh Account Active · 0 XP &amp; Clean Record
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              Your profile starts with zero pre-seeded progress, zero fake accuracy scores, and an
              empty review queue. Complete your first interactive lab, curriculum drill, or
              community challenge to start building your leaderboard rank.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveView('workspace')}
              className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
            >
              Start Curriculum
            </button>
            <button
              type="button"
              onClick={() => setActiveView('community')}
              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
            >
              Browse Community Challenges
            </button>
          </div>
        </section>
      )}

      {/* 6-Column KPI Strip */}
      <section
        aria-label="Key Performance Statistics"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          {
            label: 'Problems Solved',
            value: stats.uniqueProblemsSolved.toLocaleString(),
            detail: `${stats.labTelemetry.completedLabs}/${stats.labTelemetry.totalLabs} core labs`,
          },
          {
            label: 'Total XP',
            value: stats.rank.totalXp.toLocaleString(),
            detail: `${stats.rank.currentTier} · ${stats.rank.rankProgressPct}%`,
          },
          {
            label: 'Cognitive Accuracy',
            value: `${stats.compositeAccuracy}%`,
            detail: `Avg across 3 metrics`,
          },
          {
            label: 'Dry-Run Streak',
            value: `${stats.cognitiveMetrics.paperDryRunStreak}`,
            detail: `${stats.labTelemetry.sandboxesVerified} traces verified`,
          },
          {
            label: 'Active Recall & Gates',
            value: `${stats.labTelemetry.activeRecallCount + stats.labTelemetry.xrayDecodedCount}`,
            detail: `${stats.labTelemetry.xrayDecodedCount} N-bounds · ${stats.labTelemetry.activeRecallCount} recall`,
          },
          {
            label: 'Spaced Rep Due',
            value: `${stats.spacedRepetition.dueNow}`,
            detail: `${stats.spacedRepetition.totalScheduled} scheduled`,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1.5"
          >
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {kpi.label}
            </div>
            <div className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {kpi.value}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
              {kpi.detail}
            </div>
          </div>
        ))}
      </section>

      {/* Progressive Disclosure Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Profile analytics sections"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {(
            [
              { id: 'overview', label: 'Overview & Cognitive Telemetry' },
              { id: 'readiness', label: 'Topics, Difficulty & Company Readiness' },
              { id: 'modules', label: 'All Modules, Spaced Rep & DB Ledger' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          <Database className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>
            {stats.storageMode === 'mongodb' ? 'MongoDB Persisted' : 'Server Memory Store'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {syncedKeysCount}/{stats.dbSyncLedger.length} state stores synced
          </span>
        </div>
      </div>

      {/* TAB 1: Overview & Cognitive Telemetry */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Cognitive Dimensions + 5-Stage Lab Funnel + 14-Day Activity */}
          <div className="lg:col-span-7 space-y-6">
            {/* Cognitive Metrics */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Cognitive Performance Profile
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  Composite {stats.compositeAccuracy}%
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    label: 'Signal Recognition Accuracy',
                    value: stats.cognitiveMetrics.signalRecognitionScore,
                    max: 100,
                    unit: '%',
                    hint: 'Identifying hidden constraints & trigger patterns in Stage 1',
                  },
                  {
                    label: 'Bottleneck Diagnosis Accuracy',
                    value: stats.cognitiveMetrics.bottleneckDiagnosisScore,
                    max: 100,
                    unit: '%',
                    hint: 'Spotting asymptotic bottlenecks between brute force and optimal',
                  },
                  {
                    label: 'Logic Assembly Accuracy',
                    value: stats.cognitiveMetrics.logicAssemblyAccuracy,
                    max: 100,
                    unit: '%',
                    hint: 'Constructing invariants and pipeline blocks without distractor errors',
                  },
                  {
                    label: 'Knowledge Engine Avg Mastery',
                    value: solverTel.engineAvgMastery,
                    max: 100,
                    unit: '%',
                    hint: `${solverTel.engineTrackedConcepts} tracked concepts · ${solverTel.customConceptsCount} custom blueprints`,
                  },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {metric.label}
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {metric.value}
                        {metric.unit}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          metric.value >= 80
                            ? 'bg-emerald-600 dark:bg-emerald-500'
                            : metric.value >= 60
                              ? 'bg-sky-600 dark:bg-sky-400'
                              : 'bg-amber-600 dark:bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, metric.value))}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{metric.hint}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 5-Stage Lab Pipeline Funnel */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  5-Stage Interactive Lab Telemetry
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {stats.labTelemetry.completedLabs} completed · {stats.labTelemetry.inProgressLabs}{' '}
                  in progress · {stats.labTelemetry.totalLabs} total labs
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 pr-3 font-medium">Stage & Milestone</th>
                      <th className="py-2.5 px-3 font-medium text-right">Completed</th>
                      <th className="py-2.5 pl-3 font-medium text-right">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {[
                      {
                        stage: 'Stage 1 · Constraint-to-Complexity Gates',
                        done: stats.labTelemetry.xrayDecodedCount,
                        total: stats.labTelemetry.totalLabs,
                      },
                      {
                        stage: 'Stage 1 · Pattern Quizzes Solved',
                        done: stats.labTelemetry.patternQuizzesSolved,
                        total: stats.labTelemetry.totalLabs,
                      },
                      {
                        stage: 'Stage 2 · Dry-Run Sandboxes Verified',
                        done: stats.labTelemetry.sandboxesVerified,
                        total: stats.labTelemetry.totalLabs,
                      },
                      {
                        stage: 'Stage 2 · Loop Invariants Locked',
                        done: stats.labTelemetry.invariantsLocked,
                        total: stats.labTelemetry.totalLabs,
                      },
                      {
                        stage: 'Stage 3 · Active Recall Synthesis Unlocked',
                        done: stats.labTelemetry.activeRecallCount,
                        total: stats.labTelemetry.totalLabs,
                      },
                      {
                        stage: 'Stage 4 · Bottlenecks Diagnosed',
                        done: stats.labTelemetry.bottlenecksDiagnosed,
                        total: stats.labTelemetry.totalLabs,
                      },
                      {
                        stage: 'Stage 5 · Feynman Reflections Completed',
                        done: stats.labTelemetry.feynmanReflectionsDone,
                        total: stats.labTelemetry.totalLabs,
                      },
                    ].map((row) => {
                      const pct =
                        row.total > 0 ? Math.round((row.done / row.total) * 100) : 0;
                      return (
                        <tr
                          key={row.stage}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                        >
                          <td className="py-2.5 pr-3 text-slate-800 dark:text-slate-200 font-medium">
                            {row.stage}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                            {row.done}/{row.total}
                          </td>
                          <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                            {pct}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                <span>Signals inspected: {stats.labTelemetry.signalsExploredTotal}</span>
                <span aria-hidden="true">·</span>
                <span>Assembly distractor errors: {stats.labTelemetry.totalAssemblyErrors}</span>
                <span aria-hidden="true">·</span>
                <span>Universal Solver tier: {solverTel.unlockedTier}</span>
                <span aria-hidden="true">·</span>
                <span>Micro-drills repaired: {solverTel.microDrillsCompleted}</span>
              </div>
            </section>

            {/* 14-Day Activity Momentum */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  14-Day Practice Momentum
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {stats.activity14Days.reduce((a, b) => a + b.count, 0)} events ·{' '}
                  {stats.activity14Days.reduce((a, b) => a + b.xp, 0).toLocaleString()} XP
                </span>
              </div>

              <div className="grid grid-cols-14 gap-1.5 items-end h-32 pt-4">
                {stats.activity14Days.map((day) => {
                  const pct = day.count > 0 ? Math.max(14, Math.round((day.count / maxDayCount) * 100)) : 4;
                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center justify-end h-full gap-1.5 group"
                      title={`${day.label}: ${day.count} events, ${day.xp} XP`}
                    >
                      <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.count}
                      </span>
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className={`w-full rounded-sm transition-opacity ${
                            day.count > 0
                              ? 'bg-sky-600 dark:bg-sky-400 group-hover:opacity-80'
                              : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 truncate max-w-full">
                        {day.date.slice(8)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right 5 Cols: Recent Activity + Study Artifacts Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* Study Artifacts Summary */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Study Artifacts & Drills
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveView('revision')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                >
                  Open Notes
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {[
                  {
                    label: 'Saved Revision Notes',
                    value: `${stats.notesSummary.totalNotes} notes`,
                    sub: `${stats.notesSummary.totalWords.toLocaleString()} words written`,
                  },
                  {
                    label: 'Warmup Drills Completed',
                    value: `${stats.warmupDrillsCompleted}`,
                    sub: 'Logged to cognitive profile',
                  },
                  {
                    label: 'Topic Playbook Checkpoints',
                    value: `${stats.topicExpertiseChecksCount}`,
                    sub: 'Curriculum invariants checked',
                  },
                  {
                    label: 'Universal Solver Completed',
                    value: `${solverTel.completedCount}`,
                    sub: `${solverTel.dropsLogged} drops diagnosed`,
                  },
                  {
                    label: 'Custom Engine Blueprints',
                    value: `${solverTel.customConceptsCount}`,
                    sub: 'User-authored concept nodes',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="py-2.5 flex items-baseline justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.label}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">{item.sub}</div>
                    </div>
                    <div className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 shrink-0">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent DB Activity Feed */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Recent Activity Log
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  Latest {stats.recentActivity.length}
                </span>
              </div>

              {stats.recentActivity.length === 0 ? (
                <div className="py-6 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <p>
                    No completed labs, quizzes, or drills logged yet. Complete your first 5-Stage
                    Lab or Topic Pattern Quiz to build your verified history.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView('workspace')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
                  >
                    Open Curriculum
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentActivity.map((act, idx) => (
                    <div
                      key={`${act.date}-${idx}`}
                      className="py-2.5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {act.label}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          {formatDateTime(act.date)}
                          {typeof act.score === 'number' ? ` · Score ${act.score}%` : ''}
                        </div>
                      </div>
                      <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                        +{act.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: Topics, Difficulty & Company Readiness */}
      {activeTab === 'readiness' && (
        <div className="space-y-6">
          {/* Difficulty + Company Readiness Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Difficulty Breakdown */}
            <section className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Difficulty Breakdown
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Big Tech 48 + Labs
                </span>
              </div>

              <div className="space-y-4">
                {(['Easy', 'Medium', 'Hard'] as const).map((level) => {
                  const row = stats.difficultyBreakdown[level];
                  const pct = row.total > 0 ? Math.round((row.solved / row.total) * 100) : 0;
                  const barColor =
                    level === 'Easy'
                      ? 'bg-emerald-600 dark:bg-emerald-500'
                      : level === 'Medium'
                        ? 'bg-amber-600 dark:bg-amber-500'
                        : 'bg-rose-600 dark:bg-rose-500';
                  return (
                    <div key={level} className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {level}
                        </span>
                        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                          {row.solved}/{row.total} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active 14-Day Sprint */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    14-Day Company Sprint
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveView('sprint')}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                  >
                    {stats.activeSprint ? 'Open War Room' : 'Configure Sprint'}
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                {stats.activeSprint ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                      <span className="font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {stats.activeSprint.targetCompany}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Day {stats.activeSprint.currentDay}/14</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {stats.activeSprint.tasksCompleted}/{stats.activeSprint.totalTasks} tasks
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Readiness {stats.activeSprint.readinessScore}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
                        style={{ width: `${stats.activeSprint.completionPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No active 14-Day Sprint yet. Launch one targeted at{' '}
                    {stats.preferences.targetCompany} to track daily readiness.
                  </p>
                )}
              </div>
            </section>

            {/* Big Tech Company Readiness */}
            <section className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Big Tech Frequency-Weighted Readiness
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveView('roadmap')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
                >
                  Practice Topic Bank
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats.companyReadiness.map((co) => {
                  const isTarget = co.company === stats.preferences.targetCompany;
                  return (
                    <div key={co.company} className="py-3 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {co.company}
                          </span>
                          {isTarget && (
                            <span className="text-sky-700 dark:text-sky-400 font-medium">
                              · Primary Target
                            </span>
                          )}
                        </div>
                        <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                          {co.solvedCount}/{co.totalCount} tagged ·{' '}
                          <strong className="text-slate-900 dark:text-slate-100">
                            {co.readinessPct}%
                          </strong>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isTarget
                              ? 'bg-sky-600 dark:bg-sky-400'
                              : 'bg-slate-700 dark:bg-slate-400'
                          }`}
                          style={{ width: `${co.readinessPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* All 12 DSA Topic Categories */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Topic Category Mastery
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sorted by highest mastery across all indexed DSA categories
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search
                  className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  placeholder="Filter topics..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {filteredTopics.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                No topics match "{topicFilter}".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {filteredTopics.map((topic) => (
                  <div key={topic.topic} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {topic.topic}
                      </span>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                        {topic.solved}/{topic.total} ({topic.pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
                        style={{ width: `${topic.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 3: All Modules, Spaced Repetition & DB Sync Ledger */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* All Cross-Platform Modules */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Cross-Platform Learning Modules
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {stats.moduleProgress.length} DB-tracked tracks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {stats.moduleProgress.map((mod) => {
                const pct =
                  mod.total > 0 ? Math.min(100, Math.round((mod.completed / mod.total) * 100)) : 0;
                const targetView = MODULE_NAV_MAP[mod.id] ?? 'workspace';
                return (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveView(targetView)}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 text-left truncate"
                      >
                        {mod.label}
                      </button>
                      <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                        {mod.completed}/{mod.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Spaced Repetition 1-3-7-21 Queue */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  1-3-7-21 Spaced Repetition Queue
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  1d: {stats.spacedRepetition.stageCounts['1'] ?? 0} · 3d:{' '}
                  {stats.spacedRepetition.stageCounts['3'] ?? 0} · 7d:{' '}
                  {stats.spacedRepetition.stageCounts['7'] ?? 0} · 21d:{' '}
                  {stats.spacedRepetition.stageCounts['21'] ?? 0} · Due now:{' '}
                  {stats.spacedRepetition.dueNow}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('workspace')}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
              >
                Open Interactive Labs
              </button>
            </div>

            {stats.spacedRepetition.queue.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
                No problems scheduled yet. Finish Stage 5 (Feynman Reflection) on any interactive lab
                to enroll it into the 1-3-7-21 recall cycle.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2 pr-3 font-medium">Problem & Pattern</th>
                      <th className="py-2 px-3 font-medium">Interval</th>
                      <th className="py-2 px-3 font-medium">Next Review</th>
                      <th className="py-2 pl-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats.spacedRepetition.queue.map((item) => (
                      <tr
                        key={item.problemId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-2.5 pr-3">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {item.problemTitle}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {item.patternTag}
                            {item.twistConstraint ? ` · ${item.twistConstraint}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                          +{item.intervalStage}d
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <span
                            className={
                              item.isDueNow
                                ? 'text-amber-700 dark:text-amber-400 font-semibold'
                                : 'text-slate-600 dark:text-slate-400'
                            }
                          >
                            {item.isDueNow ? 'Due now' : formatShortDate(item.nextReviewDate)}
                          </span>
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <button
                            type="button"
                            onClick={() => selectProblem(item.problemId, { recallMode: true })}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:border-sky-500 whitespace-nowrap"
                          >
                            Start Recall
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Database Persistence Ledger */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Database Persistence Ledger
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {syncedKeysCount}/{stats.dbSyncLedger.length} state stores persisted ·{' '}
                  {totalLedgerItems.toLocaleString()} total records tracked in{' '}
                  {stats.storageMode === 'mongodb' ? 'MongoDB' : 'server store'}
                </p>
              </div>

              <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setLedgerFilter('all')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    ledgerFilter === 'all'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({stats.dbSyncLedger.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerFilter('synced')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    ledgerFilter === 'synced'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Synced ({syncedKeysCount})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3 font-medium">State Store</th>
                    <th className="py-2.5 px-3 font-medium">Category</th>
                    <th className="py-2.5 px-3 font-medium">Status</th>
                    <th className="py-2.5 px-3 font-medium text-right">Records</th>
                    <th className="py-2.5 pl-3 font-medium text-right">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLedger.map((row) => (
                    <tr
                      key={row.key}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {row.label}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {row.key}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row.category}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                        <span
                          className={
                            row.persisted
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }
                        >
                          {row.persisted ? 'Synced' : 'Idle'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                        {row.itemCount}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(row.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
