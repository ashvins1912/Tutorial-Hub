import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  Search,
  X,
} from 'lucide-react';
import { TOPIC_TIERS } from '../data/curriculumIndex';
import { useAsyncCatalog } from '../../../hooks/useAsyncCatalog';
import { fuzzySearchTopics } from '../utils/fuzzyTopicSearch';
import type { TopicDifficultyTier } from '../types';

interface TopicSidebarProps {
  activeTopicId: string;
  masteredTopicIds: string[];
  onSelectTopic: (topicId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onCollapseDesktop: () => void;
}

const TIER_ACCENT: Record<TopicDifficultyTier, string> = {
  Foundations: 'text-emerald-700 dark:text-emerald-400',
  Intermediate: 'text-sky-700 dark:text-sky-400',
  Advanced: 'text-amber-700 dark:text-amber-400',
  'Applied System Algorithms': 'text-indigo-700 dark:text-indigo-400',
};

export function TopicSidebar({
  activeTopicId,
  masteredTopicIds,
  onSelectTopic,
  mobileOpen,
  onCloseMobile,
  onCollapseDesktop,
}: TopicSidebarProps) {
  const { data: CURRICULUM_TOPICS } = useAsyncCatalog('curriculum-topics');
  const [query, setQuery] = useState('');
  const [collapsedTiers, setCollapsedTiers] = useState<Record<string, boolean>>({});

  const masteredSet = useMemo(() => new Set(masteredTopicIds), [masteredTopicIds]);
  const searchResults = useMemo(
    () => fuzzySearchTopics(CURRICULUM_TOPICS, query),
    [CURRICULUM_TOPICS, query]
  );

  const groupedByTier = useMemo(() => {
    const map = new Map<TopicDifficultyTier, typeof searchResults>();
    for (const tier of TOPIC_TIERS) map.set(tier, []);
    for (const item of searchResults) {
      map.get(item.topic.tier)?.push(item);
    }
    return map;
  }, [searchResults]);

  const toggleTier = (tier: string) => {
    setCollapsedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  const progressPct = Math.round((masteredTopicIds.length / CURRICULUM_TOPICS.length) * 100);

  const sidebarBody = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Sidebar Header & Mastery Progress */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Curriculum Roadmap
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              {masteredTopicIds.length} / {CURRICULUM_TOPICS.length} Mastered · {progressPct}%
            </div>
          </div>

          <button
            type="button"
            onClick={onCollapseDesktop}
            aria-label="Collapse topic sidebar"
            className="hidden lg:inline-flex p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close topic navigation"
            className="lg:hidden inline-flex p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Clean Progress Rail */}
        <div className="h-1.5 w-full rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-sky-600 dark:bg-sky-400 transition-all duration-200"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* N-Gram Fuzzy Search Filter */}
        <div className="relative">
          <Search
            className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Fuzzy filter (e.g. "slidng", "fenwik")'
            aria-label="Fuzzy search topics"
            className="w-full pl-8 pr-7 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          )}
        </div>

        {query.trim().length > 0 && (
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            N-Gram Search: {searchResults.length} match{searchResults.length === 1 ? '' : 'es'}
          </div>
        )}
      </div>

      {/* Grouped Topic Tree */}
      <nav aria-label="DSA Curriculum Topics" className="flex-1 overflow-y-auto p-3 space-y-4">
        {searchResults.length === 0 ? (
          <div className="p-4 text-center space-y-1.5">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              No matching topics
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Try terms like &ldquo;sliding&rdquo;, &ldquo;dp&rdquo;, &ldquo;trie&rdquo;, or &ldquo;damerau&rdquo;.
            </p>
          </div>
        ) : (
          TOPIC_TIERS.map((tier) => {
            const items = groupedByTier.get(tier) ?? [];
            if (items.length === 0) return null;
            const isCollapsed = Boolean(collapsedTiers[tier]) && !query.trim();
            const tierMastered = items.filter((i) => masteredSet.has(i.topic.id)).length;

            return (
              <div key={tier} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleTier(tier)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <span className={`text-[11px] font-mono font-semibold ${TIER_ACCENT[tier]}`}>
                    {tier}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    {tierMastered}/{items.length}
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </span>
                </button>

                {!isCollapsed && (
                  <ul className="space-y-0.5">
                    {items.map(({ topic, matchMode, score }) => {
                      const active = topic.id === activeTopicId;
                      const done = masteredSet.has(topic.id);
                      return (
                        <li key={topic.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTopic(topic.id);
                              onCloseMobile();
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-start gap-2.5 ${
                              active
                                ? 'bg-slate-900 dark:bg-sky-500/15 text-white dark:text-sky-200 ring-1 ring-slate-900 dark:ring-sky-500/40'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <span
                              className={`text-[11px] font-mono tabular-nums mt-0.5 shrink-0 ${
                                active ? 'text-sky-300 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {String(topic.order).padStart(2, '0')}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs font-semibold truncate">
                                {topic.shortTitle}
                              </span>
                              {query.trim() && matchMode === 'ngram-fuzzy' && (
                                <span
                                  className={`block text-[10px] font-mono tabular-nums ${
                                    active ? 'text-sky-200' : 'text-sky-600 dark:text-sky-400'
                                  }`}
                                >
                                  Fuzzy match · {Math.round(score * 100)}%
                                </span>
                              )}
                            </span>
                            {done && (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                  active ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                                aria-label="Mastered"
                              />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarBody}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Curriculum Topic Navigation"
          className="fixed inset-0 z-50 lg:hidden flex bg-slate-950/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseMobile();
          }}
        >
          <div className="w-[300px] max-w-[85vw] h-full shadow-2xl">{sidebarBody}</div>
        </div>
      )}
    </>
  );
}
