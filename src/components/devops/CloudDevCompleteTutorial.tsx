import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  Cloud,
  Container,
  Layers,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  AWS_GCP_DEVELOPER_MAPPINGS,
  CLOUD_DEV_CHAPTERS,
  DOCKER_BUILD_PROFILES,
  type CloudDevTrackId,
} from '../../data/dockerK8sCloudDevTutorialData';
import { CopyButton, SegmentedTabBar } from '../ui';

type TutorialViewTab = CloudDevTrackId | 'aws-vs-gcp';

const TRACK_META: Record<
  CloudDevTrackId,
  { title: string; subtitle: string; focus: string }
> = {
  docker: {
    title: 'Docker Complete Developer Tutorial',
    subtitle: 'Linux namespaces/cgroups, multi-stage slim/distroless builds, Compose networking, and CVE security.',
    focus: 'Containers & OCI Builds',
  },
  kubernetes: {
    title: 'Kubernetes (K8s) Complete Developer Tutorial',
    subtitle: 'Deployments, readiness/liveness probes, ClusterIP & Ingress routing, HPA autoscaling, and kubectl debugging.',
    focus: 'Orchestration & Scaling',
  },
  'aws-dev': {
    title: 'AWS Services for Developers — Complete Tutorial',
    subtitle: 'Least-privilege IAM roles, Lambda/ECS Fargate/EKS, S3 Presigned URLs, DynamoDB/Aurora, SQS+DLQ, and SDKs.',
    focus: 'Amazon Web Services',
  },
  'gcp-dev': {
    title: 'GCP for Developers — Complete Tutorial',
    subtitle: 'Workload Identity, Cloud Run revisions, GKE Autopilot, GCS Signed URLs, Cloud SQL, BigQuery, and Pub/Sub.',
    focus: 'Google Cloud Platform',
  },
};

/* -------------------------------------------------------------------------- */
/* Interactive Simulator 1: Docker Multi-Stage Layer & Security Optimizer     */
/* -------------------------------------------------------------------------- */
const DockerLayerOptimizerSim: React.FC = () => {
  const [profileId, setProfileId] = useState<'naive' | 'multistage-py' | 'multistage-java'>(
    'multistage-py'
  );
  const profile =
    DOCKER_BUILD_PROFILES.find((p) => p.id === profileId) ?? DOCKER_BUILD_PROFILES[0];

  const maxBar = 980;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Interactive Docker Build Inspector · Compare Image Bloat, Cache Speed &amp; Attack Surface
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Multi-Stage OverlayFS Layer &amp; Security Simulator
          </h4>
        </div>
        <SegmentedTabBar<'naive' | 'multistage-py' | 'multistage-java'>
          ariaLabel="Select Docker build profile"
          activeTab={profileId}
          onChange={setProfileId}
          size="xs"
          tabs={[
            { id: 'naive', label: 'Naive (980 MB)' },
            { id: 'multistage-py', label: 'Python Slim (74 MB)' },
            { id: 'multistage-java', label: 'Java Distroless (88 MB)' },
          ]}
        />
      </div>

      <div className="p-4 space-y-4">
        {/* Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Final Image Size</div>
            <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {profile.imageSizeMb} MB
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Rebuild (1-Line Edit)</div>
            <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
              {profile.buildTimeCacheHitSec}s
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Trivy High/Crit CVEs</div>
            <div
              className={`text-lg font-mono font-bold tabular-nums ${
                profile.cveCount > 5
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {profile.cveCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Container User</div>
            <div
              className={`text-sm font-mono font-bold mt-1 ${
                profile.runsAsRoot
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {profile.runsAsRoot ? 'root (UID 0) — Risk' : 'nonroot (Safe)'}
            </div>
          </div>
        </div>

        {/* Layers + Dockerfile Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              OverlayFS Layer Stack (Top = Base, Bottom = App Layer)
            </div>
            {profile.layers.map((layer, idx) => {
              const widthPct = Math.max(6, Math.round((layer.sizeMb / maxBar) * 100));
              return (
                <div
                  key={layer.name}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      L{idx + 1}. {layer.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                      {layer.sizeMb} MB · {layer.cached ? 'CACHE HIT' : 'REBUILT'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        layer.cached ? 'bg-sky-600 dark:bg-sky-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">{layer.note}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-900/90">
              <span className="text-xs font-mono text-slate-200">Dockerfile ({profile.label})</span>
              <CopyButton text={profile.dockerfile} label="Copy" />
            </div>
            <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-5 flex-1">
              {profile.dockerfile}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Interactive Simulator 2: Kubernetes HPA, Probes & Endpoint Traffic Router  */
/* -------------------------------------------------------------------------- */
const K8sAutoscalingProbeSim: React.FC = () => {
  const [incomingRps, setIncomingRps] = useState<number>(900);
  const [pod2ReadinessFailed, setPod2ReadinessFailed] = useState<boolean>(false);
  const [pod3OomKilled, setPod3OomKilled] = useState<boolean>(false);

  const rpsPerPodCapacity = 350;
  const desiredReplicas = Math.min(10, Math.max(3, Math.ceil(incomingRps / rpsPerPodCapacity)));

  const pods = useMemo(() => {
    const list = Array.from({ length: desiredReplicas }, (_, idx) => {
      const id = `orders-api-${idx + 1}`;
      if (idx === 1 && pod2ReadinessFailed) {
        return { id, status: 'NotReady (0/1)', receivesTraffic: false, cpuPct: 8 };
      }
      if (idx === 2 && pod3OomKilled) {
        return { id, status: 'OOMKilled -> Restarting', receivesTraffic: false, cpuPct: 0 };
      }
      return { id, status: 'Ready (1/1)', receivesTraffic: true, cpuPct: 0 };
    });

    const healthyCount = Math.max(1, list.filter((p) => p.receivesTraffic).length);
    const rpsPerHealthy = incomingRps / healthyCount;
    const perPodCpu = Math.min(100, Math.round((rpsPerHealthy / 450) * 100));

    return list.map((p) => (p.receivesTraffic ? { ...p, cpuPct: perPodCpu } : p));
  }, [desiredReplicas, incomingRps, pod2ReadinessFailed, pod3OomKilled]);

  const readyEndpoints = pods.filter((p) => p.receivesTraffic).length;
  const avgCpu = Math.round(
    pods.reduce((acc, p) => acc + p.cpuPct, 0) / Math.max(1, pods.length)
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Interactive Kubernetes Control Loop · HPA Target 65% CPU · Min 3 / Max 10 Replicas
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            Live HPA Autoscaling, Readiness Probe &amp; Service Endpoints Simulator
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPod2ReadinessFailed((v) => !v)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              pod2ReadinessFailed
                ? 'border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-amber-500'
            }`}
          >
            {pod2ReadinessFailed ? 'Restore Pod-2 Readiness' : 'Fail Pod-2 Readiness'}
          </button>
          <button
            type="button"
            onClick={() => setPod3OomKilled((v) => !v)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              pod3OomKilled
                ? 'border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-rose-500'
            }`}
          >
            {pod3OomKilled ? 'Recover Pod-3 OOM' : 'Inject Pod-3 OOMKill (137)'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="k8s-rps-slider" className="font-semibold text-slate-800 dark:text-slate-200">
                Cluster Incoming Traffic
              </label>
              <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                {incomingRps.toLocaleString()} RPS
              </span>
            </div>
            <input
              id="k8s-rps-slider"
              type="range"
              min={150}
              max={3400}
              step={50}
              value={incomingRps}
              onChange={(e) => setIncomingRps(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
              <span>150 RPS (Idle)</span>
              <span>1,500 RPS (Peak)</span>
              <span>3,400 RPS (Spike)</span>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-3 gap-2.5">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">HPA Replicas</div>
              <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {desiredReplicas}/10
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Service Endpoints</div>
              <div className="text-lg font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {readyEndpoints} Ready
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Fleet CPU Avg</div>
              <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {avgCpu}%
              </div>
            </div>
          </div>
        </div>

        {/* Live Pod Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {pods.map((pod) => (
            <div
              key={pod.id}
              className={`rounded-lg border p-2.5 text-xs space-y-1.5 ${
                pod.receivesTraffic
                  ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/25'
                  : pod.status.includes('OOM')
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30'
                    : 'border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30'
              }`}
            >
              <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 truncate">
                {pod.id}
              </div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                {pod.status}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400">
                <span>CPU {pod.cpuPct}%</span>
                <span>{pod.receivesTraffic ? 'IN SVC' : 'REMOVED'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Control Plane Action: </span>
          {pod2ReadinessFailed || pod3OomKilled
            ? `ClusterIP Service automatically removed unhealthy pod IP(s) from Endpoints and shifted all ${incomingRps.toLocaleString()} RPS across the ${readyEndpoints} healthy pods (~${Math.round(incomingRps / Math.max(1, readyEndpoints))} RPS/pod) with zero dropped requests.`
            : `All ${readyEndpoints} pods pass /health/ready and share ${incomingRps.toLocaleString()} RPS evenly (~${Math.round(incomingRps / Math.max(1, readyEndpoints))} RPS/pod).`}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Complete Developer Tutorial Component                                 */
/* -------------------------------------------------------------------------- */
export const CloudDevCompleteTutorial: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TutorialViewTab>('docker');
  const [selectedChapterByTrack, setSelectedChapterByTrack] = useState<
    Record<CloudDevTrackId, string>
  >({
    docker: 'docker-01-internals',
    kubernetes: 'k8s-01-architecture-workloads',
    'aws-dev': 'aws-01-iam-compute',
    'gcp-dev': 'gcp-01-iam-cloudrun-gke',
  });
  const [selectedMappingId, setSelectedMappingId] = useState<string>(
    AWS_GCP_DEVELOPER_MAPPINGS[0].id
  );
  const [completedChapterIds, setCompletedChapterIds] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  const trackChapters = useMemo(() => {
    if (activeTab === 'aws-vs-gcp') return [];
    return CLOUD_DEV_CHAPTERS.filter((c) => c.track === activeTab);
  }, [activeTab]);

  const activeChapter = useMemo(() => {
    if (activeTab === 'aws-vs-gcp') return null;
    const chosenId = selectedChapterByTrack[activeTab];
    return trackChapters.find((c) => c.id === chosenId) ?? trackChapters[0] ?? null;
  }, [activeTab, selectedChapterByTrack, trackChapters]);

  const activeMapping =
    AWS_GCP_DEVELOPER_MAPPINGS.find((m) => m.id === selectedMappingId) ??
    AWS_GCP_DEVELOPER_MAPPINGS[0];

  const toggleChapterDone = (id: string) => {
    setCompletedChapterIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      {/* Header & Track Selector */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                Complete Developer Cloud &amp; Containers Handbook
              </span>
              <span aria-hidden="true">·</span>
              <span>Docker · Kubernetes · AWS · GCP</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                {completedChapterIds.length}/{CLOUD_DEV_CHAPTERS.length} Chapters Complete
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'aws-vs-gcp'
                ? 'AWS vs. GCP Developer Service & SDK Translator'
                : TRACK_META[activeTab].title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {activeTab === 'aws-vs-gcp'
                ? 'Compare real day-to-day developer tasks side by side across AWS and Google Cloud with copyable CLI and SDK code.'
                : TRACK_META[activeTab].subtitle}
            </p>
          </div>

          <SegmentedTabBar<TutorialViewTab>
            ariaLabel="Select cloud and container tutorial track"
            activeTab={activeTab}
            onChange={setActiveTab}
            wrap
            tabs={[
              { id: 'docker', label: 'Docker', count: 3, icon: Container },
              { id: 'kubernetes', label: 'Kubernetes', count: 3, icon: Box },
              { id: 'aws-dev', label: 'AWS for Devs', count: 3, icon: Cloud },
              { id: 'gcp-dev', label: 'GCP for Devs', count: 3, icon: Server },
              { id: 'aws-vs-gcp', label: 'AWS vs. GCP Matrix', icon: Layers },
            ]}
          />
        </div>
      </section>

      {/* Embedded Interactive Simulators per Track */}
      {activeTab === 'docker' && <DockerLayerOptimizerSim />}
      {activeTab === 'kubernetes' && <K8sAutoscalingProbeSim />}

      {/* AWS vs. GCP Side-by-Side Developer Translator View */}
      {activeTab === 'aws-vs-gcp' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Pick a Developer Workflow ({AWS_GCP_DEVELOPER_MAPPINGS.length})
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {AWS_GCP_DEVELOPER_MAPPINGS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMappingId(m.id)}
                  className={`w-full text-left px-4 py-3 transition-colors space-y-0.5 ${
                    m.id === activeMapping.id
                      ? 'bg-sky-50/80 dark:bg-sky-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {m.task}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.category} · {m.awsService} vs {m.gcpService}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="xl:col-span-8 space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {activeMapping.category} · Side-by-Side Cloud Implementation
              </div>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
                {activeMapping.task}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-6">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Architectural Guidance:{' '}
                </span>
                {activeMapping.whenToPick}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-900">
                    <div className="text-xs font-semibold text-amber-300">
                      AWS · {activeMapping.awsService}
                    </div>
                    <CopyButton text={activeMapping.awsCode} label="Copy" />
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-100 overflow-x-auto leading-5 flex-1">
                    {activeMapping.awsCode}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-900">
                    <div className="text-xs font-semibold text-sky-300">
                      GCP · {activeMapping.gcpService}
                    </div>
                    <CopyButton text={activeMapping.gcpCode} label="Copy" />
                  </div>
                  <pre className="p-3.5 text-xs font-mono text-slate-100 overflow-x-auto leading-5 flex-1">
                    {activeMapping.gcpCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        activeChapter && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Chapter Selector Sidebar */}
            <aside className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-xs font-semibold text-slate-800 dark:text-slate-200">
                {TRACK_META[activeTab].focus} Chapters
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {trackChapters.map((ch) => {
                  const selected = ch.id === activeChapter.id;
                  const done = completedChapterIds.includes(ch.id);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() =>
                        setSelectedChapterByTrack((prev) => ({
                          ...prev,
                          [activeTab]: ch.id,
                        }))
                      }
                      className={`w-full text-left px-4 py-3.5 transition-colors flex items-start gap-3 ${
                        selected
                          ? 'bg-sky-50/80 dark:bg-sky-950/40'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold tabular-nums text-sky-700 dark:text-sky-400 mt-0.5">
                        0{ch.number}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                            {ch.title}
                          </span>
                          {done && (
                            <CheckCircle2
                              className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                              aria-label="Completed"
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ch.level} · {ch.readTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Chapter Content Workspace */}
            <div className="xl:col-span-8 space-y-5">
              {/* Plain-English Overview & Architecture Flow */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Chapter 0{activeChapter.number} · {activeChapter.level} ·{' '}
                      {activeChapter.readTime}
                    </div>
                    <h3 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-slate-100 text-balance">
                      {activeChapter.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {activeChapter.tagline}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleChapterDone(activeChapter.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      completedChapterIds.includes(activeChapter.id)
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:border-sky-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {completedChapterIds.includes(activeChapter.id)
                      ? 'Completed'
                      : 'Mark Complete'}
                  </button>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-6">
                  {activeChapter.plainEnglish}
                </p>

                {/* Step-by-Step Runtime Data Flow Strip */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Execution &amp; Control Plane Flow
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeChapter.architectureFlow.map((step, i) => (
                      <React.Fragment key={step}>
                        <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                          {step}
                        </div>
                        {i < activeChapter.architectureFlow.length - 1 && (
                          <ArrowRight
                            className="w-3.5 h-3.5 text-slate-400 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </section>

              {/* Hands-On Production Config / SDK Code */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900">
                  <div className="text-xs font-semibold text-slate-100">
                    {activeChapter.codeTitle}
                    <span className="ml-2 font-mono text-slate-400">
                      ({activeChapter.codeLanguage})
                    </span>
                  </div>
                  <CopyButton text={activeChapter.codeSnippet} label="Copy" />
                </div>
                <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-5">
                  {activeChapter.codeSnippet}
                </pre>
              </section>

              {/* CLI Cheatsheet + Production Hardening & Failure Playbook */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                    <Terminal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    Essential Developer CLI Commands
                  </div>
                  <div className="space-y-2.5">
                    {activeChapter.cliCheatsheet.map((item) => (
                      <div
                        key={item.command}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-2.5 space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-[11px] font-mono text-sky-700 dark:text-sky-400 break-all">
                            {item.command}
                          </code>
                          <CopyButton text={item.command} label="Copy" />
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          {item.purpose}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                      <ShieldCheck
                        className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                      Production Hardening Rules
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 leading-5">
                      {activeChapter.productionChecklist.map((rule) => (
                        <li key={rule} className="flex items-start gap-2">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-rose-200 dark:border-rose-900/70 bg-rose-50/60 dark:bg-rose-950/30 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-rose-900 dark:text-rose-200">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      Common Production Failure Playbook
                    </div>
                    <div className="text-rose-800 dark:text-rose-200">
                      <span className="font-semibold">Symptom: </span>
                      {activeChapter.commonFailure.symptom}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Cause: </span>
                      {activeChapter.commonFailure.rootCause}
                    </div>
                    <div className="text-emerald-800 dark:text-emerald-300">
                      <span className="font-semibold">Fix: </span>
                      {activeChapter.commonFailure.fix}
                    </div>
                  </div>
                </section>
              </div>

              {/* Quick Check */}
              <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                  Chapter Verification Check
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeChapter.quickCheck.question}
                </p>
                <div className="space-y-2">
                  {activeChapter.quickCheck.options.map((opt) => {
                    const picked = quizAnswers[activeChapter.id] === opt.id;
                    const isCorrect = opt.id === activeChapter.quickCheck.correctId;
                    const revealed = Boolean(quizAnswers[activeChapter.id]);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setQuizAnswers((prev) => ({
                            ...prev,
                            [activeChapter.id]: opt.id,
                          }));
                          if (
                            opt.id === activeChapter.quickCheck.correctId &&
                            !completedChapterIds.includes(activeChapter.id)
                          ) {
                            toggleChapterDone(activeChapter.id);
                          }
                        }}
                        className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs transition-colors ${
                          revealed && isCorrect
                            ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium'
                            : revealed && picked && !isCorrect
                              ? 'border-rose-400 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>
                {quizAnswers[activeChapter.id] && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {quizAnswers[activeChapter.id] === activeChapter.quickCheck.correctId
                        ? 'Correct: '
                        : 'Takeaway: '}
                    </span>
                    {activeChapter.quickCheck.explanation}
                  </div>
                )}
              </section>
            </div>
          </div>
        )
      )}
    </div>
  );
};
