import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  ThumbsUp,
  Trash2,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { apiFetch } from '../lib/apiFetch';
import { PROBLEMS } from '../data/problems';

type CommunityTab = 'leaderboard' | 'feed' | 'invites';
type PostType = 'problem' | 'challenge' | 'read';
type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'All';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string;
  memberSince: string;
  currentTier: string;
  totalXp: number;
  uniqueProblemsSolved: number;
  completedLabsCount: number;
  compositeAccuracy: number;
  streak: number;
  challengesSolved: number;
  hasProgress: boolean;
  isCurrentUser: boolean;
  inYourNetwork: boolean;
}

interface LeaderboardPayload {
  summary: {
    totalMembers: number;
    activeMembers: number;
    networkMembers: number;
    currentUserRank: number | null;
    currentUserXp: number;
    currentUserSolved: number;
    currentUserHasProgress: boolean;
  };
  entries: LeaderboardEntry[];
}

interface CommunityComment {
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface CommunityPostItem {
  id: string;
  authorUserId: string;
  authorName: string;
  authorTier: string;
  postType: PostType;
  title: string;
  description: string;
  topicTag: string;
  difficulty: Difficulty;
  problemRef: string;
  externalUrl: string;
  targetTimeMinutes: number | null;
  upvoteCount: number;
  completedCount: number;
  hasUpvoted: boolean;
  hasCompleted: boolean;
  isAuthor: boolean;
  comments: CommunityComment[];
  createdAt: string;
}

interface SentInviteItem {
  id: string;
  inviteCode: string;
  inviteeEmail: string;
  personalMessage: string;
  status: 'pending' | 'accepted' | 'revoked';
  acceptedByName: string;
  acceptedAt: string | null;
  createdAt: string;
}

interface ReceivedInviteItem {
  id: string;
  inviteCode: string;
  inviterName: string;
  inviterEmail: string;
  personalMessage: string;
  status: 'pending' | 'accepted' | 'revoked';
  acceptedAt: string | null;
  createdAt: string;
}

interface InvitesPayload {
  personalInviteCode: string;
  sent: SentInviteItem[];
  received: ReceivedInviteItem[];
}

interface CommunityHubViewProps {
  onOpenProblem: (problemId: string) => void;
}

const POST_TYPE_LABELS: Record<PostType, string> = {
  challenge: 'Challenge',
  problem: 'Shared Problem',
  read: 'Recommended Read',
};

const TOPIC_SUGGESTIONS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Monotonic Stack',
  'Binary Search',
  'Trees & Graphs',
  'Dynamic Programming',
  'System Design',
  'Distributed Systems',
  'Interview Strategy',
];

function formatRelativeDate(iso: string): string {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '—';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (name.trim().slice(0, 2) || 'PF').toUpperCase();
}

function buildInviteUrl(code: string): string {
  if (typeof window === 'undefined') return `/?invite=${code}`;
  return `${window.location.origin}/?invite=${encodeURIComponent(code)}`;
}

export function CommunityHubView({ onOpenProblem }: CommunityHubViewProps) {
  const [activeTab, setActiveTab] = useState<CommunityTab>('leaderboard');

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardPayload | null>(null);
  const [lbFilter, setLbFilter] = useState<'all' | 'active' | 'network'>('all');
  const [lbSearch, setLbSearch] = useState('');
  const [loadingLb, setLoadingLb] = useState(true);
  const [lbError, setLbError] = useState<string | null>(null);

  // Feed state
  const [posts, setPosts] = useState<CommunityPostItem[]>([]);
  const [feedType, setFeedType] = useState<'all' | PostType>('all');
  const [feedSort, setFeedSort] = useState<'recent' | 'top'>('recent');
  const [feedSearch, setFeedSearch] = useState('');
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  // Composer form state
  const [newPostType, setNewPostType] = useState<PostType>('challenge');
  const [selectedLabProblemId, setSelectedLabProblemId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTopicTag, setNewTopicTag] = useState('Sliding Window');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Medium');
  const [newExternalUrl, setNewExternalUrl] = useState('');
  const [newTargetMinutes, setNewTargetMinutes] = useState('30');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [composerFeedback, setComposerFeedback] = useState<string | null>(null);

  // Comments state
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingCommentId, setSubmittingCommentId] = useState<string | null>(null);

  // Invites state
  const [invitesData, setInvitesData] = useState<InvitesPayload | null>(null);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [acceptCode, setAcceptCode] = useState('');
  const [acceptingCode, setAcceptingCode] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    setLoadingLb(true);
    setLbError(null);
    try {
      const params = new URLSearchParams({ filter: lbFilter });
      if (lbSearch.trim()) params.set('search', lbSearch.trim());
      const res = await apiFetch(`/api/community/leaderboard?${params.toString()}`);
      if (!res.ok) throw new Error('Unable to load community leaderboard.');
      const data = (await res.json()) as LeaderboardPayload;
      setLeaderboard(data);
    } catch (err) {
      setLbError(err instanceof Error ? err.message : 'Unable to load community leaderboard.');
    } finally {
      setLoadingLb(false);
    }
  }, [lbFilter, lbSearch]);

  const loadPosts = useCallback(async () => {
    setLoadingFeed(true);
    setFeedError(null);
    try {
      const params = new URLSearchParams({ type: feedType, sort: feedSort });
      if (feedSearch.trim()) params.set('q', feedSearch.trim());
      const res = await apiFetch(`/api/community/posts?${params.toString()}`);
      if (!res.ok) throw new Error('Unable to load shared community items.');
      const data = (await res.json()) as { posts: CommunityPostItem[] };
      setPosts(data.posts ?? []);
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : 'Unable to load community feed.');
    } finally {
      setLoadingFeed(false);
    }
  }, [feedType, feedSort, feedSearch]);

  const loadInvites = useCallback(async () => {
    setLoadingInvites(true);
    try {
      const res = await apiFetch('/api/community/invites');
      if (!res.ok) throw new Error('Unable to load invitations.');
      const data = (await res.json()) as InvitesPayload;
      setInvitesData(data);
    } catch {
      // handled softly
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    void loadInvites();
  }, [loadInvites]);

  const handleCopyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 2000);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleSelectLabProblem = (problemId: string) => {
    setSelectedLabProblemId(problemId);
    const found = PROBLEMS.find((p) => p.id === problemId);
    if (found) {
      setNewTitle(
        newPostType === 'challenge'
          ? `Solve #${found.number} ${found.title} without hints`
          : `#${found.number} ${found.title}`
      );
      setNewTopicTag(found.patternName);
      setNewDifficulty(found.difficulty as Difficulty);
      if (!newDescription.trim()) {
        setNewDescription(
          `Practice the ${found.patternName} invariant on "${found.title}". Focus on deriving the optimal complexity before coding.`
        );
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setComposerFeedback(null);
    setSubmittingPost(true);
    try {
      const res = await apiFetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postType: newPostType,
          title: newTitle,
          description: newDescription,
          topicTag: newTopicTag,
          difficulty: newPostType === 'read' ? 'All' : newDifficulty,
          problemRef: selectedLabProblemId || undefined,
          externalUrl: newExternalUrl.trim() || undefined,
          targetTimeMinutes:
            newPostType === 'challenge' && newTargetMinutes
              ? Number(newTargetMinutes)
              : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not publish item.');
      setPosts((prev) => [data.post, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setNewExternalUrl('');
      setSelectedLabProblemId('');
      setComposerOpen(false);
      setComposerFeedback(null);
    } catch (err) {
      setComposerFeedback(err instanceof Error ? err.message : 'Unable to share post.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleUpvote = async (postId: string) => {
    try {
      const res = await apiFetch(`/api/community/posts/${encodeURIComponent(postId)}/upvote`, {
        method: 'POST',
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
    } catch {
      // ignore transient errors
    }
  };

  const handleToggleComplete = async (postId: string) => {
    try {
      const res = await apiFetch(`/api/community/posts/${encodeURIComponent(postId)}/complete`, {
        method: 'POST',
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
      window.dispatchEvent(
        new CustomEvent('patternforge:db-sync', { detail: { stateKey: 'community-challenge' } })
      );
      void loadLeaderboard();
    } catch {
      // ignore
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const res = await apiFetch(`/api/community/posts/${encodeURIComponent(postId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) return;
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const draft = (commentDrafts[postId] ?? '').trim();
    if (draft.length < 2) return;
    setSubmittingCommentId(postId);
    try {
      const res = await apiFetch(`/api/community/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: draft }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    } finally {
      setSubmittingCommentId(null);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteFeedback(null);
    setSendingInvite(true);
    try {
      const res = await apiFetch('/api/community/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeEmail: inviteEmail.trim(),
          personalMessage: inviteNote.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to create invitation.');
      setInviteEmail('');
      setInviteNote('');
      setInviteFeedback({
        kind: 'success',
        text: data.invite?.inviteeEmail
          ? `Invitation created for ${data.invite.inviteeEmail} (Code: ${data.invite.inviteCode}). Copy the invite link below to share it, or they will connect automatically when signing up with that email.`
          : `Shareable invite link created (Code: ${data.invite?.inviteCode}).`,
      });
      await loadInvites();
    } catch (err) {
      setInviteFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to send invitation.',
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptCode.trim()) return;
    setInviteFeedback(null);
    setAcceptingCode(true);
    try {
      const res = await apiFetch('/api/community/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: acceptCode.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not redeem invite code.');
      setAcceptCode('');
      setInviteFeedback({
        kind: 'success',
        text: data.message || 'Successfully joined community network!',
      });
      await Promise.all([loadInvites(), loadLeaderboard()]);
    } catch (err) {
      setInviteFeedback({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Unable to accept invite code.',
      });
    } finally {
      setAcceptingCode(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    try {
      const res = await apiFetch(`/api/community/invites/${encodeURIComponent(inviteId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) return;
      await loadInvites();
    } catch {
      // ignore
    }
  };

  const problemLookup = useMemo(() => {
    const map = new Map<string, (typeof PROBLEMS)[number]>();
    for (const p of PROBLEMS) map.set(p.id, p);
    return map;
  }, []);

  const summary = leaderboard?.summary;
  const personalInviteUrl = invitesData?.personalInviteCode
    ? buildInviteUrl(invitesData.personalInviteCode)
    : '';

  return (
    <div className="space-y-6">
      {/* Header Surface */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Community Leaderboard &amp; Peer Challenges
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Track real database-backed rankings across learners, invite peers into your study
              network, and share DSA problems, timed challenges, or recommended technical reads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('invites');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              Invite Peers
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('feed');
                setComposerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Share Challenge or Read
            </button>
          </div>
        </div>

        {/* 4-Column KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {[
            {
              label: 'Your Community Rank',
              value: summary?.currentUserRank ? `#${summary.currentUserRank}` : '—',
              sub: summary?.currentUserHasProgress
                ? `${summary.currentUserXp.toLocaleString()} XP · ${summary.currentUserSolved} solved`
                : 'Fresh account · 0 XP until first progress',
            },
            {
              label: 'Community Members',
              value: summary ? summary.totalMembers.toLocaleString() : '—',
              sub: summary ? `${summary.activeMembers} active with progress` : 'Loading rankings',
            },
            {
              label: 'Invited Network',
              value: summary ? summary.networkMembers.toLocaleString() : '—',
              sub: invitesData
                ? `${invitesData.sent.filter((i) => i.status === 'pending').length} pending invites`
                : 'Direct peer connections',
            },
            {
              label: 'Shared Feed Items',
              value: posts.length.toLocaleString(),
              sub: `${posts.filter((p) => p.postType === 'challenge').length} challenges · ${posts.filter((p) => p.postType === 'read').length} reads`,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1"
            >
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {kpi.label}
              </div>
              <div className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {kpi.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums truncate">
                {kpi.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Community sections"
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          {(
            [
              { id: 'leaderboard', label: 'Community Leaderboard', icon: Trophy },
              { id: 'feed', label: 'Problems, Challenges & Reads', icon: BookOpen },
              { id: 'invites', label: 'Invite People', icon: Users },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            void loadLeaderboard();
            void loadPosts();
            void loadInvites();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Sync Live Data
        </button>
      </div>

      {/* ====================================================================
          TAB 1: COMMUNITY LEADERBOARD
      ==================================================================== */}
      {activeTab === 'leaderboard' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 w-fit">
              {(
                [
                  { id: 'all', label: 'All Members' },
                  { id: 'active', label: 'Active Progress Only' },
                  { id: 'network', label: 'My Invited Network' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setLbFilter(f.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    lbFilter === f.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={lbSearch}
                onChange={(e) => setLbSearch(e.target.value)}
                placeholder="Search learner or rank tier..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {lbError ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm text-rose-600 dark:text-rose-400">{lbError}</p>
              <button
                type="button"
                onClick={() => void loadLeaderboard()}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          ) : loadingLb && !leaderboard ? (
            <div className="space-y-2 py-4" aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : !leaderboard || leaderboard.entries.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No learners match this filter yet.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {lbFilter === 'active'
                  ? 'Fresh accounts start at 0 XP until they complete their first problem, quiz, or community challenge.'
                  : 'Invite teammates or classmates to build your peer leaderboard.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('invites')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                Invite Someone to Join
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-3 font-medium w-16">Rank</th>
                    <th className="py-2.5 px-3 font-medium">Learner</th>
                    <th className="py-2.5 px-3 font-medium">Tier</th>
                    <th className="py-2.5 px-3 font-medium text-right">Solved</th>
                    <th className="py-2.5 px-3 font-medium text-right">Challenges</th>
                    <th className="py-2.5 px-3 font-medium text-right">Accuracy</th>
                    <th className="py-2.5 px-3 font-medium text-right">Streak</th>
                    <th className="py-2.5 pl-3 font-medium text-right">Total XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {leaderboard.entries.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={
                        entry.isCurrentUser
                          ? 'bg-sky-50/70 dark:bg-sky-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }
                    >
                      <td className="py-3 pr-3 font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        #{entry.rank}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-sky-500/15 border border-slate-200 dark:border-sky-500/30 flex items-center justify-center text-[11px] font-mono font-bold text-white dark:text-sky-300 shrink-0">
                            {getInitials(entry.displayName)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {entry.displayName}
                              {entry.isCurrentUser && (
                                <span className="ml-1.5 text-[11px] font-normal text-sky-700 dark:text-sky-400">
                                  (You)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {!entry.hasProgress
                                ? 'Fresh account · no progress yet'
                                : entry.inYourNetwork && !entry.isCurrentUser
                                  ? 'In your invited network'
                                  : `Joined ${formatRelativeDate(entry.memberSince)}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {entry.currentTier}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                        {entry.uniqueProblemsSolved}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {entry.challengesSolved}
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {entry.compositeAccuracy}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {entry.streak}
                      </td>
                      <td className="py-3 pl-3 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {entry.totalXp.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary && summary.totalMembers <= 1 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You are the first learner in this workspace. Invite study partners so you can
                compete on the live leaderboard and trade challenges.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('invites')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                Open Invite Panel
              </button>
            </div>
          )}
        </section>
      )}

      {/* ====================================================================
          TAB 2: SHARED PROBLEMS, CHALLENGES TO SOLVE & RECOMMENDED READS
      ==================================================================== */}
      {activeTab === 'feed' && (
        <div className="space-y-5">
          {/* Feed Controls & Composer Toggle */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  {(
                    [
                      { id: 'all', label: 'All' },
                      { id: 'challenge', label: 'Challenges' },
                      { id: 'problem', label: 'Problems' },
                      { id: 'read', label: 'Recommended Reads' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeedType(item.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                        feedType === item.id
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <select
                  aria-label="Sort community feed"
                  value={feedSort}
                  onChange={(e) => setFeedSort(e.target.value as 'recent' | 'top')}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="recent">Sort: Most Recent</option>
                  <option value="top">Sort: Most Upvoted</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:flex-initial sm:w-64">
                  <Search
                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={feedSearch}
                    onChange={(e) => setFeedSearch(e.target.value)}
                    placeholder="Search title, topic, author..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setComposerOpen((v) => !v);
                    setComposerFeedback(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
                >
                  {composerOpen ? (
                    <>
                      <X className="w-3.5 h-3.5" aria-hidden="true" />
                      Close Form
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      New Post
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Composer Form */}
            {composerOpen && (
              <form
                onSubmit={handleCreatePost}
                className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Share Type:
                  </span>
                  {(
                    [
                      { id: 'challenge', label: 'Challenge to Solve' },
                      { id: 'problem', label: 'Problem to Practice' },
                      { id: 'read', label: 'Recommended Read' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNewPostType(opt.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        newPostType === opt.id
                          ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newPostType !== 'read' && (
                    <label className="space-y-1.5 text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Link an In-App Problem (Optional)
                      </span>
                      <select
                        value={selectedLabProblemId}
                        onChange={(e) => handleSelectLabProblem(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="">Custom problem / no lab link</option>
                        {PROBLEMS.map((p) => (
                          <option key={p.id} value={p.id}>
                            #{p.number} {p.title} ({p.difficulty} · {p.patternName})
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="space-y-1.5 text-xs md:col-span-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Title *
                    </span>
                    <input
                      type="text"
                      required
                      minLength={3}
                      maxLength={140}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={
                        newPostType === 'read'
                          ? 'e.g. Designing Data-Intensive Applications — Ch. 5 Replication Notes'
                          : newPostType === 'challenge'
                            ? 'e.g. 25-Min Monotonic Stack Speed Challenge: Largest Rectangle'
                            : 'e.g. Subarray Sum Equals K with Negative Numbers'
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </label>

                  <label className="space-y-1.5 text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Topic / Domain
                    </span>
                    <input
                      type="text"
                      list="community-topics-list"
                      maxLength={60}
                      value={newTopicTag}
                      onChange={(e) => setNewTopicTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <datalist id="community-topics-list">
                      {TOPIC_SUGGESTIONS.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </label>

                  {newPostType !== 'read' && (
                    <label className="space-y-1.5 text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Difficulty
                      </span>
                      <select
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </label>
                  )}

                  {newPostType === 'challenge' && (
                    <label className="space-y-1.5 text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Target Time (minutes)
                      </span>
                      <input
                        type="number"
                        min={5}
                        max={180}
                        value={newTargetMinutes}
                        onChange={(e) => setNewTargetMinutes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100"
                      />
                    </label>
                  )}

                  <label className="space-y-1.5 text-xs md:col-span-2 lg:col-span-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {newPostType === 'read'
                        ? 'Article / Paper / Book URL (https://...)'
                        : 'External Problem Link (Optional, https://...)'}
                    </span>
                    <input
                      type="url"
                      value={newExternalUrl}
                      onChange={(e) => setNewExternalUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </label>

                  <label className="space-y-1.5 text-xs md:col-span-2 lg:col-span-3">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {newPostType === 'read'
                        ? 'Why do you recommend this read? Key takeaways *'
                        : 'Problem Prompt, Constraints, or Challenge Rules *'}
                    </span>
                    <textarea
                      required
                      rows={3}
                      minLength={5}
                      maxLength={2000}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Describe the core invariant, edge case twist, or why peers should solve/read this..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </label>
                </div>

                {composerFeedback && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {composerFeedback}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setComposerOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPost}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    {submittingPost ? 'Publishing...' : 'Publish to Community'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Feed List */}
          {feedError ? (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-6 text-sm text-rose-600 dark:text-rose-400">
              {feedError}
            </div>
          ) : loadingFeed && posts.length === 0 ? (
            <div className="space-y-3" aria-busy="true">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No community posts yet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Be the first to share a DSA problem, post a timed coding challenge for peers to
                solve, or recommend an engineering paper or article.
              </p>
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Share First Challenge or Read
              </button>
            </section>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const linkedProblem = post.problemRef ? problemLookup.get(post.problemRef) : null;
                const commentsOpen = Boolean(expandedComments[post.id]);
                return (
                  <article
                    key={post.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5"
                  >
                    {/* Metadata Line — zero pills, dot-separated */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                          className={`font-semibold ${
                            post.postType === 'challenge'
                              ? 'text-amber-700 dark:text-amber-400'
                              : post.postType === 'read'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-sky-700 dark:text-sky-400'
                          }`}
                        >
                          {POST_TYPE_LABELS[post.postType]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {post.topicTag}
                        </span>
                        {post.postType !== 'read' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">{post.difficulty}</span>
                          </>
                        )}
                        {post.targetTimeMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              Target {post.targetTimeMinutes}m
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>
                          Shared by <strong className="text-slate-800 dark:text-slate-200">{post.authorName}</strong> ({post.authorTier})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatRelativeDate(post.createdAt)}
                        </span>
                      </div>

                      {post.isAuthor && (
                        <button
                          type="button"
                          onClick={() => void handleDeletePost(post.id)}
                          aria-label={`Delete ${post.title}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {/* Body */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {post.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    {/* Action Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleToggleUpvote(post.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            post.hasUpvoted
                              ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                          <span className="font-mono tabular-nums">{post.upvoteCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => void handleToggleComplete(post.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            post.hasCompleted
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          {post.hasCompleted
                            ? post.postType === 'read'
                              ? 'Read Completed'
                              : 'Solved (+50 XP)'
                            : post.postType === 'read'
                              ? 'Mark Read (+50 XP)'
                              : 'Mark Solved (+50 XP)'}
                          <span className="font-mono tabular-nums opacity-75">
                            · {post.completedCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }))
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                          Discuss ({post.comments.length})
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {linkedProblem && (
                          <button
                            type="button"
                            onClick={() => onOpenProblem(linkedProblem.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
                          >
                            Open in Lab
                            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                        {post.externalUrl && (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:border-sky-500"
                          >
                            {post.postType === 'read' ? 'Open Article' : 'External Link'}
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Inline Discussion Thread */}
                    {commentsOpen && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        {post.comments.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            No discussion notes yet. Share your approach, complexity tradeoff, or a
                            hint.
                          </p>
                        ) : (
                          <div className="space-y-2.5">
                            {post.comments.map((c, idx) => (
                              <div
                                key={`${post.id}-c-${idx}`}
                                className="rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2.5 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
                                  <strong className="text-slate-800 dark:text-slate-200">
                                    {c.authorName}
                                  </strong>
                                  <span className="font-mono tabular-nums">
                                    {formatRelativeDate(c.createdAt)}
                                  </span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {c.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <form
                          onSubmit={(e) => void handleAddComment(post.id, e)}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={commentDrafts[post.id] ?? ''}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            maxLength={1000}
                            placeholder="Add your solution insight, time complexity, or follow-up twist..."
                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          />
                          <button
                            type="submit"
                            disabled={
                              submittingCommentId === post.id ||
                              (commentDrafts[post.id] ?? '').trim().length < 2
                            }
                            className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          TAB 3: INVITE PEOPLE TO COMMUNITY
      ==================================================================== */}
      {activeTab === 'invites' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Personal Share Link + Direct Email Invite */}
          <div className="lg:col-span-7 space-y-6">
            {/* Personal Invite Link */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Your Personal Community Invite Link
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Share this link or code with teammates, classmates, or interview partners. When
                  they sign up or sign in, they are automatically linked to your community network.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  readOnly
                  aria-label="Personal community invite URL"
                  value={personalInviteUrl || 'Generating link...'}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  disabled={!personalInviteUrl}
                  onClick={() => void handleCopyText('personal-link', personalInviteUrl)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 whitespace-nowrap"
                >
                  {copiedKey === 'personal-link' ? (
                    <>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      Copied Link
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              {invitesData?.personalInviteCode && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Direct Code:{' '}
                    <strong className="font-mono text-slate-900 dark:text-slate-100">
                      {invitesData.personalInviteCode}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopyText('personal-code', invitesData.personalInviteCode)
                    }
                    className="text-sky-700 dark:text-sky-400 font-semibold hover:underline"
                  >
                    {copiedKey === 'personal-code' ? 'Code copied' : 'Copy code only'}
                  </button>
                </div>
              )}
            </section>

            {/* Invite by Email Form */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Invite a Specific Person by Email
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Creates a tracked invitation tied to their email. They will connect automatically
                  on sign-up, or you can copy and send them the unique invitation link right away.
                </p>
              </div>

              <form onSubmit={handleCreateInvite} className="space-y-3.5">
                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Invitee Email Address
                  </span>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Personal Challenge Note (Optional)
                  </span>
                  <textarea
                    rows={2}
                    maxLength={280}
                    value={inviteNote}
                    onChange={(e) => setInviteNote(e.target.value)}
                    placeholder="Join my DSA prep squad — let's solve this week's Sliding Window & Graph challenges together."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </label>

                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 disabled:opacity-60"
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  {sendingInvite ? 'Creating Invite...' : 'Create Tracked Invitation'}
                </button>
              </form>

              {inviteFeedback && (
                <div
                  className={`rounded-lg border p-3 text-xs font-medium ${
                    inviteFeedback.kind === 'success'
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                      : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {inviteFeedback.text}
                </div>
              )}
            </section>
          </div>

          {/* Right 5 Cols: Accept Invite Code + Sent/Received Ledger */}
          <div className="lg:col-span-5 space-y-6">
            {/* Redeem Invite Code */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Have an Invite Code?
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Enter a peer&apos;s code (e.g. <span className="font-mono">PF-8A3F19C2</span>) to
                  join their community network and compare progress.
                </p>
              </div>
              <form onSubmit={handleAcceptInvite} className="flex items-center gap-2">
                <input
                  type="text"
                  value={acceptCode}
                  onChange={(e) => setAcceptCode(e.target.value.toUpperCase())}
                  placeholder="PF-XXXXXXXX"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono uppercase text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  disabled={acceptingCode || acceptCode.trim().length < 4}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold disabled:opacity-50 whitespace-nowrap"
                >
                  {acceptingCode ? 'Joining...' : 'Join'}
                </button>
              </form>
            </section>

            {/* Sent Invitations History */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Sent Invitations
                </h2>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {invitesData?.sent.length ?? 0} total
                </span>
              </div>

              {loadingInvites && !invitesData ? (
                <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
              ) : !invitesData || invitesData.sent.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No direct invitations sent yet. Invite a teammate using the form on the left.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {invitesData.sent.map((inv) => (
                    <div key={inv.id} className="py-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {inv.inviteeEmail || 'Open Invite Link'}
                        </span>
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            inv.status === 'accepted'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : inv.status === 'revoked'
                                ? 'text-slate-400'
                                : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-mono">
                          {inv.inviteCode}
                          {inv.acceptedByName ? ` · Joined by ${inv.acceptedByName}` : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          {inv.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleCopyText(inv.id, buildInviteUrl(inv.inviteCode))
                                }
                                className="text-sky-700 dark:text-sky-400 font-semibold hover:underline"
                              >
                                {copiedKey === inv.id ? 'Copied' : 'Copy Link'}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRevokeInvite(inv.id)}
                                className="text-rose-600 dark:text-rose-400 hover:underline"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Received Invitations */}
            {invitesData && invitesData.received.length > 0 && (
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Community Connections
                </h2>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {invitesData.received.map((inv) => (
                    <div key={inv.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Invited by {inv.inviterName}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                          {inv.status}
                        </span>
                      </div>
                      {inv.personalMessage && (
                        <p className="text-slate-500 dark:text-slate-400">{inv.personalMessage}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
