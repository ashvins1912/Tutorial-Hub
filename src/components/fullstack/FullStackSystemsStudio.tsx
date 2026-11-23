import { useCallback, useState } from 'react';
import {
  Activity,
  Boxes,
  Code2,
  Cpu,
  Database,
  Layers,
  PlayCircle,
  Server,
} from 'lucide-react';
import {
  BACKEND_FRAMEWORKS,
  FAILURE_MODE_RUNBOOKS,
  STORYBOARD_FRAMES,
} from '../../data/fullStackArchitectureData';
import { SYSTEM_INTERNAL_BLUEPRINTS } from '../../data/runtimeAndInfraInternalsData';
import { useAccountState } from '../../hooks/useAccountState';
import { withStudioBoundary } from '../hoc';
import { SegmentedTabBar } from '../ui';
import { RuntimeAndInfraInternalsLab } from './RuntimeAndInfraInternalsLab';
import { FullStackStoryboardAnimator } from './FullStackStoryboardAnimator';
import { FrameworkRuntimeMatrixLab } from './FrameworkRuntimeMatrixLab';
import { AiInferenceHardwareLab } from './AiInferenceHardwareLab';
import { PolyglotStackCodeLab } from './PolyglotStackCodeLab';
import { StorageAndDiagnosticsLab } from './StorageAndDiagnosticsLab';
import { LiveTrafficFlowSimulator } from '../shared/LiveTrafficFlowSimulator';
import { TopicBridgeBar } from '../shared/TopicBridgeBar';

type FullStackTab = 'internals-sim' | 'storyboard' | 'frameworks' | 'ai-gpu' | 'polyglot' | 'storage-ops';

interface FullStackStudioProgress {
  verifiedRunbookIds: string[];
}

const DEFAULT_PROGRESS: FullStackStudioProgress = {
  verifiedRunbookIds: [],
};

const BoundedRuntimeAndInfraInternalsLab = withStudioBoundary(RuntimeAndInfraInternalsLab, {
  studioName: 'Compilers, VMs & Infrastructure Internals Simulator',
});
const BoundedFullStackStoryboardAnimator = withStudioBoundary(FullStackStoryboardAnimator, {
  studioName: 'Full-Stack Synchronized Storyboard & DFD Lab',
});
const BoundedFrameworkRuntimeMatrixLab = withStudioBoundary(FrameworkRuntimeMatrixLab, {
  studioName: 'Backend Frameworks, Servers & Runtimes Simulator',
});
const BoundedAiInferenceHardwareLab = withStudioBoundary(AiInferenceHardwareLab, {
  studioName: 'AI/ML Inference Engines & GPU Physics Lab',
});
const BoundedPolyglotStackCodeLab = withStudioBoundary(PolyglotStackCodeLab, {
  studioName: '5-Paradigm Polyglot Implementation Lab',
});
const BoundedStorageAndDiagnosticsLab = withStudioBoundary(StorageAndDiagnosticsLab, {
  studioName: 'Storage, Vector & SRE Diagnostics Lab',
});

export function FullStackSystemsStudio() {
  const [activeTab, setActiveTab] = useState<FullStackTab>('internals-sim');
  const [showStudioTraffic, setShowStudioTraffic] = useState(false);
  const [progress, setProgress] = useAccountState<FullStackStudioProgress>(
    'fullstack-studio-progress',
    DEFAULT_PROGRESS,
    'patternforge_fullstack_studio_progress_v1'
  );

  const verifiedRunbookIds = Array.isArray(progress?.verifiedRunbookIds)
    ? progress.verifiedRunbookIds
    : [];

  const handleToggleRunbook = useCallback(
    (id: string) => {
      setProgress((prev) => {
        const current = Array.isArray(prev?.verifiedRunbookIds) ? prev.verifiedRunbookIds : [];
        return {
          verifiedRunbookIds: current.includes(id)
            ? current.filter((x) => x !== id)
            : [...current, id],
        };
      });
    },
    [setProgress]
  );

  return (
    <div className="space-y-6">
      {/* Studio Editorial Header */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700 dark:text-sky-400">
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                Full-Stack Systems &amp; AI Infrastructure Blueprint
              </span>
              <span aria-hidden="true">·</span>
              <span>Hardware Silicon · VMs · 10 Backend Frameworks · LLM Engines · Storage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              Full-Stack Systems, Backend Frameworks &amp; AI/LLM Architecture Lab
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
              Trace requests end-to-end across edge proxies, all 10 major web frameworks (Spring Boot MVC/WebFlux, FastAPI, Django, Flask, NestJS/Express, Gin/Fiber, Axum/Actix, ASP.NET Core, Rails), GPU HBM3 inference engines, vector/relational databases, and live SRE diagnostics.
            </p>
            <div className="pt-1.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStudioTraffic((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                  showStudioTraffic
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 hover:border-sky-500'
                }`}
              >
                <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                {showStudioTraffic ? 'Hide Live Full-Stack Traffic' : 'Live Full-Stack Traffic Simulator'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 min-w-[260px]">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Storyboard Frames</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {STORYBOARD_FRAMES.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Backend Frameworks</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {BACKEND_FRAMEWORKS.length}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Code Paradigms</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                5
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Runbooks Reviewed</div>
              <div className="text-xl font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {verifiedRunbookIds.length}/{FAILURE_MODE_RUNBOOKS.length}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <SegmentedTabBar<FullStackTab>
            ariaLabel="Full-Stack Systems Studio workspaces"
            activeTab={activeTab}
            onChange={setActiveTab}
            wrap
            tabs={[
              {
                id: 'internals-sim',
                label: 'Compilers, VMs & Infra Sim',
                shortLabel: 'Internals Sim',
                count: SYSTEM_INTERNAL_BLUEPRINTS.length,
                icon: Boxes,
              },
              {
                id: 'storyboard',
                label: 'Storyboard & DFDs',
                shortLabel: 'Storyboard',
                icon: PlayCircle,
              },
              {
                id: 'frameworks',
                label: '10 Frameworks & VMs',
                shortLabel: 'Frameworks',
                count: BACKEND_FRAMEWORKS.length,
                icon: Server,
              },
              {
                id: 'ai-gpu',
                label: 'LLM Engines & GPU Physics',
                shortLabel: 'LLM & GPU',
                icon: Cpu,
              },
              {
                id: 'polyglot',
                label: '5-Paradigm Code',
                shortLabel: 'Polyglot',
                icon: Code2,
              },
              {
                id: 'storage-ops',
                label: 'Storage & SRE Diagnostics',
                shortLabel: 'Diagnostics',
                count: FAILURE_MODE_RUNBOOKS.length,
                icon: Database,
              },
            ]}
          />
        </div>
      </section>

      {showStudioTraffic && (
        <LiveTrafficFlowSimulator
          domain="system-design"
          initialPresetId="lb-cache-sharded-db"
          allowPresetSwitcher
          compact
          heading="Live Full-Stack Distributed Traffic Flow Simulator"
        />
      )}

      {/* Active Workspace */}
      {activeTab === 'internals-sim' && <BoundedRuntimeAndInfraInternalsLab />}
      {activeTab === 'storyboard' && <BoundedFullStackStoryboardAnimator />}
      {activeTab === 'frameworks' && <BoundedFrameworkRuntimeMatrixLab />}
      {activeTab === 'ai-gpu' && <BoundedAiInferenceHardwareLab />}
      {activeTab === 'polyglot' && <BoundedPolyglotStackCodeLab />}
      {activeTab === 'storage-ops' && (
        <BoundedStorageAndDiagnosticsLab
          verifiedRunbookIds={verifiedRunbookIds}
          onToggleRunbook={handleToggleRunbook}
        />
      )}

      <TopicBridgeBar studioId="full-stack" />
    </div>
  );
}
