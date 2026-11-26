import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Copy,
  ExternalLink,
  Layers,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  ALGORITHM_FAMILIES,
  ALGORITHM_SELECTION_CHECKLIST,
  ARCHITECTURAL_PATTERNS_12,
  CAPACITY_FORMULAS,
  CAPACITY_PRESETS,
  COMPLEXITY_REFERENCE_ROWS,
  DATA_STRUCTURE_CARDS,
  ENGINEERING_GLOSSARY_16,
  ESTIMATION_MISTAKES,
  EXPLANATION_8_STEP_FRAMEWORK,
  FINAL_DESIGN_REVIEW_CHECKLIST_12,
  FIVE_PASS_STUDY_METHOD,
  HANDBOOK_CASE_STUDIES_10,
  HANDBOOK_SCOPE_NOTE,
  HLD_BUILDING_BLOCKS_18,
  INTERVIEW_7_STEPS,
  INTERVIEW_COMMUNICATION_CHECKLIST,
  MASTERY_LEVEL_CHECKPOINTS,
  OOP_DESIGN_PATTERNS_24,
  REFERENCE_LIBRARY_22,
  RESOURCE_STUDY_TIPS,
  ROADMAP_13_WEEKS,
  TOPIC_DOCUMENTATION_TEMPLATE_22,
  WEEKLY_LEARNING_LOOP,
  type OopDesignPatternItem,
} from '../../data/systemDesignHandbookData';
import { useAccountState } from '../../hooks/useAccountState';
import { EventDrivenAnd30ConceptsView } from './EventDrivenAnd30ConceptsView';

export interface SystemDesignHandbookViewProps {
  onOpenAcademyTopic?: (categoryId: string, topicId: string) => void;
}

type HandbookSection =
  | 'study'
  | 'capacity-interview'
  | 'matrices'
  | 'case-studies'
  | 'eda-concepts30'
  | 'reference';

interface HandbookProgress {
  completedPasses: number[];
  checkedMasterySkills: string[];
  checkedReviewItems: string[];
  masteredCaseStudies: string[];
}

const INITIAL_PROGRESS: HandbookProgress = {
  completedPasses: [],
  checkedMasterySkills: [],
  checkedReviewItems: [],
  masteredCaseStudies: [],
};

const CASE_STUDY_TO_ACADEMY_TOPIC: Record<string, string> = {
  'upi-payment': 'case-upi-payment',
  'irctc-seat-reservation': 'case-irctc-reservation',
  'food-delivery': 'case-food-delivery',
  'ecommerce-flash-sale': 'case-flash-sale',
  'apartment-multitenant': 'case-apartment-multitenant',
  'url-shortener': 'case-url-shortener',
  'chat-application': 'case-chat-app',
  'ecommerce-checkout': 'case-ecommerce-checkout',
  'news-social-feed': 'case-social-feed',
  'video-streaming': 'case-video-streaming',
};

function formatStorageGb(gb: number): string {
  if (gb >= 1024 * 1024) return `${(gb / (1024 * 1024)).toFixed(2)} PB`;
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`;
  return `${gb.toFixed(1)} GB`;
}

function formatBandwidthMbps(mbPerSec: number): string {
  if (mbPerSec >= 1024) return `${(mbPerSec / 1024).toFixed(2)} GB/s`;
  return `${mbPerSec.toFixed(1)} MB/s`;
}

export function SystemDesignHandbookView({ onOpenAcademyTopic }: SystemDesignHandbookViewProps) {
  const [activeSection, setActiveSection] = useState<HandbookSection>('case-studies');
  const [progress, setProgress] = useAccountState<HandbookProgress>(
    'system-design-handbook-progress',
    INITIAL_PROGRESS,
    'patternforge_sd_handbook_v1'
  );

  // Capacity Estimator state (initialized to Photo Sharing worked example from Ch 15)
  const [activePresetId, setActivePresetId] = useState<string>(CAPACITY_PRESETS[0].id);
  const [dauMillions, setDauMillions] = useState<number>(CAPACITY_PRESETS[0].dauMillions);
  const [actionsPerUser, setActionsPerUser] = useState<number>(CAPACITY_PRESETS[0].actionsPerUserPerDay);
  const [peakFactor, setPeakFactor] = useState<number>(CAPACITY_PRESETS[0].peakFactor);
  const [avgLatencyMs, setAvgLatencyMs] = useState<number>(CAPACITY_PRESETS[0].avgLatencyMs);
  const [payloadKb, setPayloadKb] = useState<number>(CAPACITY_PRESETS[0].payloadKb);
  const [retentionDays, setRetentionDays] = useState<number>(CAPACITY_PRESETS[0].retentionDays);
  const [replicationFactor, setReplicationFactor] = useState<number>(CAPACITY_PRESETS[0].replicationFactor);

  // Matrices filters
  const [matrixTab, setMatrixTab] = useState<'complexity-ds' | 'algorithms' | 'oop' | 'architecture' | 'hld'>('oop');
  const [oopCategory, setOopCategory] = useState<'All' | OopDesignPatternItem['category']>('All');
  const [matrixQuery, setMatrixQuery] = useState<string>('');

  // Case Studies selector
  const [caseGroupFilter, setCaseGroupFilter] = useState<'All' | 'Indian Real-World Walkthroughs' | 'Core Case Studies'>('All');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(HANDBOOK_CASE_STUDIES_10[0].id);

  // Reference & Glossary filters
  const [glossaryQuery, setGlossaryQuery] = useState<string>('');
  const [resourceCategory, setResourceCategory] = useState<string>('All');
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);

  const applyCapacityPreset = (presetId: string) => {
    const preset = CAPACITY_PRESETS.find((p) => p.id === presetId) ?? CAPACITY_PRESETS[0];
    setActivePresetId(preset.id);
    setDauMillions(preset.dauMillions);
    setActionsPerUser(preset.actionsPerUserPerDay);
    setPeakFactor(preset.peakFactor);
    setAvgLatencyMs(preset.avgLatencyMs);
    setPayloadKb(preset.payloadKb);
    setRetentionDays(preset.retentionDays);
    setReplicationFactor(preset.replicationFactor);
  };

  const capacityStats = useMemo(() => {
    const dailyRequests = dauMillions * 1_000_000 * actionsPerUser;
    const avgRps = dailyRequests / 86_400;
    const peakRps = avgRps * peakFactor;
    const concurrentAvg = avgRps * (avgLatencyMs / 1000);
    const concurrentPeak = peakRps * (avgLatencyMs / 1000);
    const dailyRawGb = (dailyRequests * payloadKb) / (1024 * 1024);
    const totalRawGb = dailyRawGb * retentionDays;
    // Include 20% index/metadata overhead plus replication factor
    const totalProvisionedGb = totalRawGb * 1.2 * replicationFactor;
    const peakBandwidthMbPerSec = (peakRps * payloadKb) / 1024;
    return {
      dailyRequests,
      avgRps,
      peakRps,
      concurrentAvg,
      concurrentPeak,
      dailyRawGb,
      totalRawGb,
      totalProvisionedGb,
      peakBandwidthMbPerSec,
    };
  }, [dauMillions, actionsPerUser, peakFactor, avgLatencyMs, payloadKb, retentionDays, replicationFactor]);

  const togglePass = (passNum: number) => {
    setProgress((prev) => ({
      ...prev,
      completedPasses: prev.completedPasses.includes(passNum)
        ? prev.completedPasses.filter((x) => x !== passNum)
        : [...prev.completedPasses, passNum],
    }));
  };

  const toggleMasterySkill = (skillKey: string) => {
    setProgress((prev) => ({
      ...prev,
      checkedMasterySkills: prev.checkedMasterySkills.includes(skillKey)
        ? prev.checkedMasterySkills.filter((x) => x !== skillKey)
        : [...prev.checkedMasterySkills, skillKey],
    }));
  };

  const toggleReviewItem = (itemId: string) => {
    setProgress((prev) => ({
      ...prev,
      checkedReviewItems: prev.checkedReviewItems.includes(itemId)
        ? prev.checkedReviewItems.filter((x) => x !== itemId)
        : [...prev.checkedReviewItems, itemId],
    }));
  };

  const toggleCaseMastered = (caseId: string) => {
    setProgress((prev) => ({
      ...prev,
      masteredCaseStudies: prev.masteredCaseStudies.includes(caseId)
        ? prev.masteredCaseStudies.filter((x) => x !== caseId)
        : [...prev.masteredCaseStudies, caseId],
    }));
  };

  const filteredCaseStudies = useMemo(
    () =>
      HANDBOOK_CASE_STUDIES_10.filter(
        (c) => caseGroupFilter === 'All' || c.group === caseGroupFilter
      ),
    [caseGroupFilter]
  );

  const selectedCase =
    filteredCaseStudies.find((c) => c.id === selectedCaseId) ??
    filteredCaseStudies[0] ??
    HANDBOOK_CASE_STUDIES_10[0];

  const filteredOopPatterns = useMemo(
    () =>
      OOP_DESIGN_PATTERNS_24.filter((p) => {
        const matchCat = oopCategory === 'All' || p.category === oopCategory;
        const q = matrixQuery.trim().toLowerCase();
        const matchQ =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.intent.toLowerCase().includes(q) ||
          p.example.toLowerCase().includes(q);
        return matchCat && matchQ;
      }),
    [oopCategory, matrixQuery]
  );

  const filteredArchPatterns = useMemo(() => {
    const q = matrixQuery.trim().toLowerCase();
    return ARCHITECTURAL_PATTERNS_12.filter(
      (a) =>
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.plainEnglish.toLowerCase().includes(q) ||
        a.tradeoffs.toLowerCase().includes(q)
    );
  }, [matrixQuery]);

  const filteredHldBlocks = useMemo(() => {
    const q = matrixQuery.trim().toLowerCase();
    return HLD_BUILDING_BLOCKS_18.filter(
      (b) =>
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.plainEnglish.toLowerCase().includes(q) ||
        b.technicalWorking.toLowerCase().includes(q)
    );
  }, [matrixQuery]);

  const filteredGlossary = useMemo(() => {
    const q = glossaryQuery.trim().toLowerCase();
    return ENGINEERING_GLOSSARY_16.filter(
      (g) => !q || g.term.toLowerCase().includes(q) || g.meaning.toLowerCase().includes(q)
    );
  }, [glossaryQuery]);

  const resourceCategories = useMemo(
    () => ['All', ...Array.from(new Set(REFERENCE_LIBRARY_22.map((r) => r.category)))],
    []
  );

  const filteredResources = useMemo(
    () =>
      REFERENCE_LIBRARY_22.filter(
        (r) => resourceCategory === 'All' || r.category === resourceCategory
      ),
    [resourceCategory]
  );

  const handleCopyTopicTemplate = async () => {
    const markdown = [
      '# Topic Study Sheet',
      '',
      ...TOPIC_DOCUMENTATION_TEMPLATE_22.map((item, idx) => `## ${idx + 1}. ${item}\n\n- `),
    ].join('\n');
    try {
      await navigator.clipboard.writeText(markdown);
      setCopiedTemplate(true);
      window.setTimeout(() => setCopiedTemplate(false), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const reviewPct = Math.round(
    (progress.checkedReviewItems.length / FINAL_DESIGN_REVIEW_CHECKLIST_12.length) * 100
  );

  const sectionTabs: { id: HandbookSection; label: string; icon: typeof BookOpen }[] = [
    { id: 'case-studies', label: '10 Case Studies', icon: Compass },
    { id: 'eda-concepts30', label: 'EDA, Kafka & 30 Concepts', icon: Layers },
    { id: 'capacity-interview', label: 'Capacity & 7-Step Interview', icon: Calculator },
    { id: 'matrices', label: 'DS, Algos, LLD & HLD', icon: Layers },
    { id: 'study', label: '5-Pass Method & Roadmap', icon: BookOpen },
    { id: 'reference', label: 'Checklist, Glossary & Library', icon: ClipboardCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Section Navigation */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>System Design Learning Handbook</span>
              <span aria-hidden="true">·</span>
              <span>30 Chapters</span>
              <span aria-hidden="true">·</span>
              <span>Plain English, Trade-offs &amp; Indian Real-World Walkthroughs</span>
            </div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              From CS &amp; Runtime Fundamentals to Production Architecture
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Study topics in connected sequence: explain the idea in plain English, trace the flow,
              size capacity, analyze failure modes, and defend every trade-off aloud.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300 shrink-0">
            <div>
              <div className="text-slate-500 dark:text-slate-400 font-sans">Case studies done</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {progress.masteredCaseStudies.length} / {HANDBOOK_CASE_STUDIES_10.length}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />
            <div>
              <div className="text-slate-500 dark:text-slate-400 font-sans">Review checklist</div>
              <div className="text-lg font-semibold text-sky-700 dark:text-sky-400">
                {reviewPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Section Tabs */}
        <div
          role="tablist"
          aria-label="System Design Learning Handbook sections"
          className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
        >
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSection(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 1: 10 END-TO-END CASE STUDIES & INDIAN REAL-WORLD WALKTHROUGHS */}
      {activeSection === 'case-studies' && (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-5 items-start">
          <aside className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 xl:sticky xl:top-24">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Case Study Walkthroughs
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {filteredCaseStudies.length} systems
              </span>
            </div>

            <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
              {(['All', 'Indian Real-World Walkthroughs', 'Core Case Studies'] as const).map(
                (group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setCaseGroupFilter(group)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                      caseGroupFilter === group
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {group === 'All'
                      ? 'All 10'
                      : group === 'Indian Real-World Walkthroughs'
                        ? 'Indian Systems (5)'
                        : 'Core HLD (5)'}
                  </button>
                )
              )}
            </div>

            <div className="space-y-1.5">
              {filteredCaseStudies.map((cs) => {
                const isSelected = cs.id === selectedCase.id;
                const isDone = progress.masteredCaseStudies.includes(cs.id);
                return (
                  <button
                    key={cs.id}
                    type="button"
                    onClick={() => setSelectedCaseId(cs.id)}
                    aria-current={isSelected ? 'page' : undefined}
                    className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <span className="block w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold leading-snug">{cs.title}</span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {cs.group === 'Indian Real-World Walkthroughs'
                          ? 'Indian walkthrough'
                          : 'Core HLD study'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{selectedCase.group}</span>
                  <span aria-hidden="true">·</span>
                  <span>Prerequisites: {selectedCase.prerequisites}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-slate-100">
                  {selectedCase.title}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.plainEnglish}
                </p>
                {selectedCase.disclaimer && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Note: {selectedCase.disclaimer}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {onOpenAcademyTopic && CASE_STUDY_TO_ACADEMY_TOPIC[selectedCase.id] && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAcademyTopic(
                        'case-studies-walkthroughs',
                        CASE_STUDY_TO_ACADEMY_TOPIC[selectedCase.id]
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap"
                  >
                    Open in Deep Academy
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toggleCaseMastered(selectedCase.id)}
                  aria-pressed={progress.masteredCaseStudies.includes(selectedCase.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    progress.masteredCaseStudies.includes(selectedCase.id)
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-sky-400'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  {progress.masteredCaseStudies.includes(selectedCase.id)
                    ? 'Walkthrough Completed'
                    : 'Mark Walkthrough Done'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Real-life correlation
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.analogy}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Why this architecture matters
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.whyItMatters}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Step-by-step request &amp; state flow
              </h4>
              <ol className="space-y-2">
                {selectedCase.stepByStepWorking.map((stepText, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <span className="font-mono tabular-nums text-xs font-semibold text-sky-700 dark:text-sky-400 pt-0.5 shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="leading-relaxed">{stepText}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Key design decisions
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.designDecisions}
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                  Failure modes &amp; production traps
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.failureModes}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                  Hands-on practice task
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.practiceTask}
                </p>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Mastery self-test
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedCase.masteryTest}
                </p>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* SECTION 2: CAPACITY ESTIMATION WORKBENCH & 7-STEP INTERVIEW PLAYBOOK */}
      {activeSection === 'capacity-interview' && (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                  Interactive Capacity Estimation Workbench
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rough arithmetic exposes storage, concurrency and bandwidth constraints before picking technology.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CAPACITY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyCapacityPreset(preset.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${
                      activePresetId === preset.id
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {preset.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
              {/* Sliders Deck */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5 text-xs">
                  <span className="flex justify-between font-medium text-slate-700 dark:text-slate-200">
                    <span>Daily Active Users (DAU)</span>
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      {dauMillions}M users
                    </span>
                  </span>
                  <input
                    type="range"
                    min={0.5}
                    max={100}
                    step={0.5}
                    value={dauMillions}
                    onChange={(e) => setDauMillions(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="flex justify-between font-medium text-slate-700 dark:text-slate-200">
                    <span>Actions / User / Day</span>
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      {actionsPerUser} / day
                    </span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={actionsPerUser}
                    onChange={(e) => setActionsPerUser(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="flex justify-between font-medium text-slate-700 dark:text-slate-200">
                    <span>Peak-to-Average Factor</span>
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      {peakFactor}× peak
                    </span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={1}
                    value={peakFactor}
                    onChange={(e) => setPeakFactor(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="flex justify-between font-medium text-slate-700 dark:text-slate-200">
                    <span>Average Response Latency</span>
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      {avgLatencyMs} ms
                    </span>
                  </span>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    step={10}
                    value={avgLatencyMs}
                    onChange={(e) => setAvgLatencyMs(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="flex justify-between font-medium text-slate-700 dark:text-slate-200">
                    <span>Average Payload Size</span>
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      {payloadKb >= 1024 ? `${(payloadKb / 1024).toFixed(1)} MB` : `${payloadKb} KB`}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={5120}
                    step={1}
                    value={payloadKb}
                    onChange={(e) => setPayloadKb(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </label>

                <label className="block space-y-1.5 text-xs">
                  <span className="flex justify-between font-medium text-slate-700 dark:text-slate-200">
                    <span>Retention &amp; Replication</span>
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400">
                      {retentionDays}d · {replicationFactor}× replicas
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={30}
                      max={1825}
                      step={30}
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(Number(e.target.value))}
                      className="flex-1 accent-sky-600"
                      aria-label="Retention days"
                    />
                    <select
                      value={replicationFactor}
                      onChange={(e) => setReplicationFactor(Number(e.target.value))}
                      aria-label="Replication factor"
                      className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-xs font-mono"
                    >
                      <option value={1}>1×</option>
                      <option value={2}>2×</option>
                      <option value={3}>3×</option>
                    </select>
                  </div>
                </label>
              </div>

              {/* Computed Telemetry Panel */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Avg / Peak RPS</div>
                    <div className="mt-1 font-mono tabular-nums text-base font-bold text-slate-900 dark:text-slate-100">
                      {Math.round(capacityStats.avgRps).toLocaleString()} /{' '}
                      <span className="text-sky-700 dark:text-sky-400">
                        {Math.round(capacityStats.peakRps).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Peak Concurrent (Little’s Law)
                    </div>
                    <div className="mt-1 font-mono tabular-nums text-base font-bold text-slate-900 dark:text-slate-100">
                      {Math.max(1, Math.round(capacityStats.concurrentPeak)).toLocaleString()} active
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Daily Raw Storage</div>
                    <div className="mt-1 font-mono tabular-nums text-base font-bold text-slate-900 dark:text-slate-100">
                      {formatStorageGb(capacityStats.dailyRawGb)} / day
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Total Provisioned (+20% idx, {replicationFactor}×)
                    </div>
                    <div className="mt-1 font-mono tabular-nums text-base font-bold text-emerald-700 dark:text-emerald-400">
                      {formatStorageGb(capacityStats.totalProvisionedGb)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                  <span className="text-slate-600 dark:text-slate-400">Peak network bandwidth</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                    {formatBandwidthMbps(capacityStats.peakBandwidthMbPerSec)}
                  </span>
                </div>

                {CAPACITY_PRESETS.find((p) => p.id === activePresetId) && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-3">
                    <strong className="text-slate-900 dark:text-slate-100">Architectural takeaway: </strong>
                    {CAPACITY_PRESETS.find((p) => p.id === activePresetId)?.takeaway}
                  </p>
                )}
              </div>
            </div>

            {/* Formulas & Common Estimation Mistakes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2.5">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Core estimation formulas
                </h4>
                <div className="space-y-2">
                  {CAPACITY_FORMULAS.map((f) => (
                    <div
                      key={f.name}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-1"
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {f.name}
                      </div>
                      <div className="font-mono text-xs text-sky-700 dark:text-sky-400">
                        {f.formula}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{f.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                    Common estimation mistakes to avoid
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {ESTIMATION_MISTAKES.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Interview communication checklist
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                    {INTERVIEW_COMMUNICATION_CHECKLIST.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 7-Step System Design Interview Method */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                7-Step System Design Interview Playbook (45 Minutes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pace every design interview deliberately from requirements through failure analysis and 10× evolution.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {INTERVIEW_7_STEPS.map((st) => (
                <div
                  key={st.step}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums text-sky-700 dark:text-sky-400">
                    <span>Step 0{st.step}</span>
                    <span>{st.duration}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {st.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{st.focus}</p>
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4 pt-1">
                    {st.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* SECTION 3: COMPLEXITY, DATA STRUCTURES, ALGORITHMS, 24 OOP PATTERNS, 12 ARCH PATTERNS & 18 HLD BLOCKS */}
      {activeSection === 'matrices' && (
        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {(
                [
                  ['oop', '24 OOP Patterns'],
                  ['architecture', '12 Arch Styles'],
                  ['hld', '18 HLD Blocks'],
                  ['complexity-ds', 'Complexity & 10 DS'],
                  ['algorithms', 'Algorithms & Selection'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setMatrixTab(id);
                    setMatrixQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                    matrixTab === id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(matrixTab === 'oop' || matrixTab === 'architecture' || matrixTab === 'hld') && (
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={matrixQuery}
                  onChange={(e) => setMatrixQuery(e.target.value)}
                  placeholder="Filter patterns or trade-offs..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
          </div>

          {matrixTab === 'oop' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'Creational', 'Structural', 'Behavioral', 'Domain & Architecture'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setOopCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                          oopCategory === cat
                            ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pattern selection rule: identify the changing behavior or coupling pain first—never force a pattern from a catalog.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredOopPatterns.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {p.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {p.intent}
                    </p>
                    <p className="text-xs text-sky-700 dark:text-sky-400 pt-1">
                      Example: {p.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matrixTab === 'architecture' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredArchPatterns.map((arch) => (
                <div
                  key={arch.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2"
                >
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {arch.name}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {arch.plainEnglish}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analogy: {arch.analogy}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                    Trade-offs: {arch.tradeoffs}
                  </p>
                </div>
              ))}
            </div>
          )}

          {matrixTab === 'hld' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredHldBlocks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2"
                >
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {b.name}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {b.plainEnglish}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Mechanism: {b.technicalWorking}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Analogy: {b.analogy}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300 border-t border-slate-100 dark:border-slate-800 pt-2">
                    Caution: {b.tradeoffs}
                  </p>
                </div>
              ))}
            </div>
          )}

          {matrixTab === 'complexity-ds' && (
            <div className="space-y-6">
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Complexity</th>
                      <th className="py-2.5 px-3 font-semibold">Growth Intuition</th>
                      <th className="py-2.5 px-3 font-semibold">Typical Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {COMPLEXITY_REFERENCE_ROWS.map((row) => (
                      <tr key={row.complexity}>
                        <td className="py-2.5 px-3 font-mono font-semibold text-sky-700 dark:text-sky-400 whitespace-nowrap">
                          {row.complexity}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">
                          {row.growthIntuition}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {row.typicalExample}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DATA_STRUCTURE_CARDS.map((ds) => (
                  <div
                    key={ds.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {ds.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {ds.realLifeAnalogy}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ds.plainEnglish} {ds.technicalWorking}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Use when:</strong> {ds.useWhen}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      Trade-offs: {ds.tradeoffs}
                    </p>
                    <p className="text-xs text-sky-700 dark:text-sky-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                      Check: {ds.checkQuestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matrixTab === 'algorithms' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Core algorithm families
                </h4>
                {ALGORITHM_FAMILIES.map((fam) => (
                  <div
                    key={fam.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2"
                  >
                    <h5 className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                      {fam.name}
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {fam.items.map((item) => (
                        <li key={item.name}>
                          <strong className="text-slate-900 dark:text-slate-100">{item.name}:</strong>{' '}
                          {item.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Algorithm selection decision table
                </h4>
                <div className="space-y-2">
                  {ALGORITHM_SELECTION_CHECKLIST.map((rule) => (
                    <div
                      key={rule.signal}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3.5 space-y-1"
                    >
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Signal: {rule.signal}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        → {rule.recommendation}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{rule.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* SECTION 4: 5-PASS STUDY METHOD, 8-STEP EXPLANATION FRAMEWORK, MASTERY TIERS & 13-WEEK ROADMAP */}
      {activeSection === 'study' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                  The Five-Pass Study Method
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Learn complex systems in five deliberate passes rather than memorizing a single page.
                </p>
              </div>
              <div className="space-y-2">
                {FIVE_PASS_STUDY_METHOD.map((p) => {
                  const done = progress.completedPasses.includes(p.pass);
                  return (
                    <button
                      key={p.pass}
                      type="button"
                      onClick={() => togglePass(p.pass)}
                      aria-pressed={done}
                      className={`w-full text-left rounded-lg border p-3.5 transition-colors flex items-start gap-3 ${
                        done
                          ? 'border-emerald-500/70 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="font-mono tabular-nums text-xs font-semibold text-sky-700 dark:text-sky-400 pt-0.5">
                        Pass {p.pass}
                      </span>
                      <span className="flex-1 space-y-0.5">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {p.name}
                        </span>
                        <span className="block text-xs text-slate-600 dark:text-slate-300">
                          {p.goal} — {p.action}
                        </span>
                      </span>
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-700'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                  8-Step Concept Explanation Framework
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Clear interview grammar: “We need X because Y. We choose Z. It works by A→B→C. The trade-off is D. If E fails, we do F.”
                </p>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {EXPLANATION_8_STEP_FRAMEWORK.map((item) => (
                  <li
                    key={item.step}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 space-y-1"
                  >
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400 mr-1.5">
                        0{item.step}.
                      </span>
                      {item.name}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.prompt}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Mastery Checkpoints by Engineering Level */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                Mastery Checkpoints by Level
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Check off skills only when you can demonstrate them independently with a diagram and failure analysis.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {MASTERY_LEVEL_CHECKPOINTS.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {tier.label}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {tier.summary}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {tier.skills.map((skill, idx) => {
                      const key = `${tier.id}:${idx}`;
                      const checked = progress.checkedMasterySkills.includes(key);
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleMasterySkill(key)}
                            className="mt-0.5 accent-sky-600 shrink-0"
                          />
                          <span className={checked ? 'line-through opacity-70' : ''}>{skill}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 13-Week Roadmap & Weekly Learning Loop */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                13-Week Learning Roadmap &amp; Weekly Retention Loop
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Review each topic after Day 1 · Week 1 · Month 1
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {ROADMAP_13_WEEKS.map((w) => (
                <div
                  key={w.weeks}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3.5 space-y-1.5"
                >
                  <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
                    {w.weeks} · {w.phase}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {w.focus}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    Practice: {w.habit}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Repeatable weekly learning loop
              </h4>
              <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {WEEKLY_LEARNING_LOOP.map((step, i) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400 font-semibold">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </div>
      )}

      {/* SECTION 5: FINAL DESIGN REVIEW CHECKLIST, 22-POINT TEMPLATE, GLOSSARY & CURATED LIBRARY */}
      {activeSection === 'reference' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Interactive 12-Item Final Design Review Checklist */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                    12-Point Final Design Review Checklist
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Audit any architecture RFC or interview design before signing off.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono tabular-nums text-xs font-semibold text-sky-700 dark:text-sky-400">
                    {progress.checkedReviewItems.length}/{FINAL_DESIGN_REVIEW_CHECKLIST_12.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setProgress((prev) => ({ ...prev, checkedReviewItems: [] }))}
                    aria-label="Reset design review checklist"
                    className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-600 dark:bg-sky-400 transition-all"
                  style={{ width: `${reviewPct}%` }}
                />
              </div>

              <div className="space-y-2">
                {FINAL_DESIGN_REVIEW_CHECKLIST_12.map((item) => {
                  const checked = progress.checkedReviewItems.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReviewItem(item.id)}
                        className="mt-0.5 accent-sky-600 shrink-0"
                      />
                      <span className="flex-1">
                        <span className="font-medium text-slate-500 dark:text-slate-400 mr-1.5">
                          {item.category} ·
                        </span>
                        {item.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* 22-Point Topic Documentation Template */}
            <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                    22-Point Topic Documentation Template
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Repeatable study structure for documenting any component, algorithm or case study.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyTopicTemplate()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-500 whitespace-nowrap shrink-0"
                >
                  {copiedTemplate ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                  {copiedTemplate ? 'Copied Markdown' : 'Copy Template'}
                </button>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {TOPIC_DOCUMENTATION_TEMPLATE_22.map((field, idx) => (
                  <li key={field} className="flex items-start gap-2 py-1 border-b border-slate-100 dark:border-slate-800/70">
                    <span className="font-mono tabular-nums text-sky-700 dark:text-sky-400 shrink-0">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span>{field}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Searchable 16-Term Engineering Glossary */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                  Core System Design Glossary (16 Terms)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Precise engineering definitions for everyday architecture and interview discussions.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="text"
                  value={glossaryQuery}
                  onChange={(e) => setGlossaryQuery(e.target.value)}
                  placeholder="Search glossary terms..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredGlossary.map((g) => (
                <div
                  key={g.term}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3.5 space-y-1"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {g.term}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {g.meaning}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Expanded Reference Library & Responsible Use */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
                  Curated Reference Library ({REFERENCE_LIBRARY_22.length} Sources)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pair one primary textbook with official product documentation and hands-on prototypes.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resourceCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setResourceCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap ${
                      resourceCategory === cat
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {res.category}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {res.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {res.summary}
                    </p>
                  </div>
                  <div className="pt-1">
                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                      >
                        Visit documentation
                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {res.urlNote}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  How to use multiple resources without getting overwhelmed
                </h4>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
                  {RESOURCE_STUDY_TIPS.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Scope, accuracy &amp; responsible use
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {HANDBOOK_SCOPE_NOTE}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSection === 'eda-concepts30' && <EventDrivenAnd30ConceptsView />}
    </div>
  );
}
