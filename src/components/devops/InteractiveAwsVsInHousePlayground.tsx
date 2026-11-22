import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  Cloud,
  Lock,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export const InteractiveAwsVsInHousePlayground: React.FC = () => {
  const [trafficRps, setTrafficRps] = useState<number>(8000);
  const [iamDenied, setIamDenied] = useState<boolean>(false);
  const [crashLoop, setCrashLoop] = useState<boolean>(false);
  const [hybridBurst, setHybridBurst] = useState<boolean>(false);
  const [restartCount, setRestartCount] = useState<number>(0);

  const prefersReducedMotion = useReducedMotion();

  // Increment CrashLoopBackOff restart counter realistically while fault is active
  useEffect(() => {
    if (!crashLoop) {
      setRestartCount(0);
      return;
    }
    setRestartCount(1);
    const timer = window.setInterval(() => {
      setRestartCount((c) => (c >= 9 ? 9 : c + 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [crashLoop]);

  const capacityPerPod = 1000;
  const desiredAwsPods = Math.max(4, Math.ceil(trafficRps / capacityPerPod));
  // If IAM permission denied, newly scaled pods cannot mount Secrets Manager and stall at 4 baseline pods
  const readyAwsPods = iamDenied
    ? Math.min(4, desiredAwsPods)
    : crashLoop
      ? Math.max(2, Math.floor(desiredAwsPods * 0.5))
      : desiredAwsPods;
  const awsCapacity = readyAwsPods * capacityPerPod;
  const awsDroppedRps = Math.max(0, trafficRps - awsCapacity);
  const awsP99Ms = crashLoop ? 860 : iamDenied && awsDroppedRps > 0 ? 540 : 42 + Math.round(trafficRps / 1200);
  const awsHourlyUsd = (desiredAwsPods * 0.14 + 0.45).toFixed(2);

  const onPremRackMax = 10; // 10,000 RPS ceiling
  const readyOnPremPods = iamDenied
    ? 4
    : crashLoop
      ? 5
      : onPremRackMax;
  const onPremBaseCapacity = readyOnPremPods * capacityPerPod;
  const onPremOverflow = Math.max(0, trafficRps - onPremBaseCapacity);
  const burstCloudPods =
    hybridBurst && !iamDenied && onPremOverflow > 0
      ? Math.ceil(onPremOverflow / capacityPerPod)
      : 0;
  const onPremDroppedRps = hybridBurst && !iamDenied ? 0 : onPremOverflow;
  const onPremCpuPct = Math.min(100, Math.round((trafficRps / (onPremRackMax * capacityPerPod)) * 100));
  const onPremP99Ms =
    crashLoop
      ? 940
      : onPremDroppedRps > 0
        ? 780
        : 36 + Math.round((trafficRps / 10000) * 45);

  const packetDurationSec = Math.max(0.45, 2.2 - trafficRps / 14000);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1 max-w-2xl">
          <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
            Interactive Infrastructure Deployment Sandbox · AWS vs. In-House Bare-Metal
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100">
            AWS Cloud vs. On-Premise Live Traffic &amp; Failure Simulator
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Sweep live traffic load and inject realistic <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">IAM Permission Denied</span> or{' '}
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">CrashLoopBackOff</span> failures to observe how AWS EKS/ALB and In-House HAProxy/RKE2 behave side by side.
          </p>
        </div>

        {(iamDenied || crashLoop) && (
          <button
            type="button"
            onClick={() => {
              setIamDenied(false);
              setCrashLoop(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Run kubectl rollout undo &amp; Restore IAM
          </button>
        )}
      </div>

      {/* Interactive Sliders & Failure Injection Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="aws-onprem-rps-slider" className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Simulated Traffic Load (RPS)
            </label>
            <span className="text-sm font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
              {trafficRps.toLocaleString()} req/sec
            </span>
          </div>
          <input
            id="aws-onprem-rps-slider"
            type="range"
            min={1000}
            max={24000}
            step={1000}
            value={trafficRps}
            onChange={(e) => setTrafficRps(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Steady 4K', val: 4000 },
                { label: 'Rack Cap 10K', val: 10000 },
                { label: 'Flash Spike 22K', val: 22000 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setTrafficRps(preset.val)}
                  className={`px-2 py-1 rounded border text-[11px] font-mono tabular-nums transition-colors ${
                    trafficRps === preset.val
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hybridBurst}
                onChange={(e) => setHybridBurst(e.target.checked)}
                className="rounded border-slate-300 accent-sky-600"
              />
              <span>Hybrid Burst</span>
            </label>
          </div>
        </div>

        {/* Failure Toggles */}
        <div className="lg:col-span-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-2.5">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Production Failure Injectors
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setIamDenied((v) => !v)}
              aria-pressed={iamDenied}
              className={`text-left rounded-lg border p-3 transition-colors ${
                iamDenied
                  ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  IAM Permission Denied
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    iamDenied ? 'text-amber-700 dark:text-amber-300' : 'text-slate-400'
                  }`}
                >
                  {iamDenied ? 'ACTIVE' : 'OFF'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Blocks kms:Decrypt / Vault secret mount on new pods
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCrashLoop((v) => !v)}
              aria-pressed={crashLoop}
              className={`text-left rounded-lg border p-3 transition-colors ${
                crashLoop
                  ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                  CrashLoopBackOff
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    crashLoop ? 'text-rose-700 dark:text-rose-300' : 'text-slate-400'
                  }`}
                >
                  {crashLoop ? `OOM (${restartCount}x)` : 'OFF'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Exit Code 137 OOMKilled cycling half the fleet
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Visual Cluster Simulation: AWS vs In-House */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* AWS Cloud Panel */}
        <div
          className={`rounded-xl border p-4 space-y-4 ${
            awsDroppedRps > 0 || crashLoop || iamDenied
              ? 'border-amber-300 dark:border-amber-800 bg-amber-50/25 dark:bg-amber-950/15'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  AWS Managed Cloud (ALB + EKS + Karpenter)
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  ECR · Secrets Manager · IRSA · CloudWatch
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold ${
                awsDroppedRps > 0 || crashLoop
                  ? 'text-rose-700 dark:text-rose-400'
                  : iamDenied
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {crashLoop
                ? 'DEGRADED (OOM)'
                : iamDenied
                  ? 'SCALE BLOCKED (IAM)'
                  : 'HEALTHY (ELASTIC)'}
            </span>
          </div>

          {/* Animated Traffic Pipe into AWS Cluster */}
          <div className="relative h-5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center px-2">
            <span className="text-[10px] font-mono text-slate-500 z-10">
              AWS ALB -&gt; Target Group ({trafficRps.toLocaleString()} RPS)
            </span>
            {!prefersReducedMotion && (
              <motion.span
                aria-hidden="true"
                className={`absolute top-1.5 h-2 w-8 rounded-full ${
                  awsDroppedRps > 0 ? 'bg-rose-500/80' : 'bg-sky-500/80'
                }`}
                initial={{ left: '-10%' }}
                animate={{ left: '105%' }}
                transition={{ repeat: Infinity, duration: packetDurationSec, ease: 'linear' }}
              />
            )}
          </div>

          {/* AWS KPI Strip */}
          <div className="grid grid-cols-4 gap-2 text-xs font-mono tabular-nums">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">Ready Pods</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {readyAwsPods}/{desiredAwsPods}
              </div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">p99 Latency</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{awsP99Ms}ms</div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">HTTP 503/s</div>
              <div className={`font-bold ${awsDroppedRps > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {awsDroppedRps.toLocaleString()}
              </div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">OpEx Rate</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">${awsHourlyUsd}/h</div>
            </div>
          </div>

          {/* Animated EKS Pod Fleet */}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: desiredAwsPods }).map((_, i) => {
              const isIamStuck = iamDenied && i >= readyAwsPods;
              const isCrashing = crashLoop && i >= readyAwsPods;
              return (
                <motion.div
                  key={i}
                  layout={!prefersReducedMotion}
                  initial={prefersReducedMotion ? false : { scale: 0.7, opacity: 0 }}
                  animate={
                    isCrashing && !prefersReducedMotion
                      ? { scale: [1, 0.92, 1], opacity: [1, 0.55, 1] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={isCrashing ? { repeat: Infinity, duration: 1.2 } : { duration: 0.2 }}
                  className={`h-7 px-2 rounded border text-[10px] font-mono tabular-nums inline-flex items-center ${
                    isCrashing
                      ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      : isIamStuck
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                  }`}
                >
                  {isCrashing ? `P${i + 1} OOM` : isIamStuck ? `P${i + 1} IAM` : `P${i + 1}`}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* In-House Bare-Metal Panel */}
        <div
          className={`rounded-xl border p-4 space-y-4 ${
            onPremDroppedRps > 0 || crashLoop || iamDenied
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/25 dark:bg-rose-950/15'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  In-House Bare-Metal (HAProxy + MetalLB + RKE2)
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Harbor · HashiCorp Vault · Keepalived VRRP · Prometheus
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-semibold ${
                onPremDroppedRps > 0 || crashLoop
                  ? 'text-rose-700 dark:text-rose-400'
                  : iamDenied
                    ? 'text-amber-700 dark:text-amber-400'
                    : burstCloudPods > 0
                      ? 'text-sky-700 dark:text-sky-400'
                      : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {crashLoop
                ? 'CRASHLOOP (OOM)'
                : iamDenied
                  ? 'VAULT 403 DENIED'
                  : onPremDroppedRps > 0
                    ? 'RACK SATURATED 503'
                    : burstCloudPods > 0
                      ? `HYBRID BURST (+${burstCloudPods})`
                      : 'FIXED CAPEX OK'}
            </span>
          </div>

          {/* Animated Traffic Pipe into On-Prem Rack */}
          <div className="relative h-5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center px-2">
            <span className="text-[10px] font-mono text-slate-500 z-10">
              Keepalived VIP -&gt; HAProxy -&gt; MetalLB ({trafficRps.toLocaleString()} RPS)
            </span>
            {!prefersReducedMotion && (
              <motion.span
                aria-hidden="true"
                className={`absolute top-1.5 h-2 w-8 rounded-full ${
                  onPremDroppedRps > 0 ? 'bg-rose-500/80' : 'bg-emerald-500/80'
                }`}
                initial={{ left: '-10%' }}
                animate={{ left: '105%' }}
                transition={{ repeat: Infinity, duration: packetDurationSec, ease: 'linear' }}
              />
            )}
          </div>

          {/* On-Prem KPI Strip */}
          <div className="grid grid-cols-4 gap-2 text-xs font-mono tabular-nums">
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">Rack Ready</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                {readyOnPremPods}/{onPremRackMax}
              </div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">Rack CPU</div>
              <div className={`font-bold ${onPremCpuPct >= 95 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {onPremCpuPct}%
              </div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">p99 Latency</div>
              <div className="font-bold text-slate-900 dark:text-slate-100">{onPremP99Ms}ms</div>
            </div>
            <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2">
              <div className="text-[10px] text-slate-500">HTTP 503/s</div>
              <div className={`font-bold ${onPremDroppedRps > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {onPremDroppedRps.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Fixed Rack Slots + Optional Hybrid Cloud Burst Slots */}
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: onPremRackMax }).map((_, i) => {
              const isVaultStuck = iamDenied && i >= readyOnPremPods;
              const isCrashing = crashLoop && i >= readyOnPremPods;
              const isSaturated = !isCrashing && !isVaultStuck && onPremDroppedRps > 0;
              return (
                <motion.div
                  key={i}
                  animate={
                    isCrashing && !prefersReducedMotion
                      ? { scale: [1, 0.92, 1], opacity: [1, 0.55, 1] }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={isCrashing ? { repeat: Infinity, duration: 1.2 } : { duration: 0.2 }}
                  className={`h-7 px-2 rounded border text-[10px] font-mono tabular-nums inline-flex items-center ${
                    isCrashing || isSaturated
                      ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      : isVaultStuck
                        ? 'border-amber-500 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {isCrashing ? `R${i + 1} OOM` : isVaultStuck ? `R${i + 1} 403` : `R${i + 1}`}
                </motion.div>
              );
            })}
            {Array.from({ length: burstCloudPods }).map((_, i) => (
              <span
                key={`burst-${i}`}
                className="h-7 px-2 rounded border border-sky-400 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-[10px] font-mono text-sky-800 dark:text-sky-300 inline-flex items-center"
              >
                Burst C{i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Live Failure Diagnostics & SRE Remediation Console */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-400 pb-1 border-b border-slate-800">
          <Terminal className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
          <span>Live Cluster Diagnostics &amp; Telemetry Feed</span>
        </div>
        {iamDenied && (
          <div className="text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              [IAM/Vault Denied] AWS EKS: AccessDeniedException (missing kms:Decrypt on mrk-9a81f) · On-Prem: Vault CSI returned 403 permission denied. New pods stuck in CreateContainerConfigError.
            </span>
          </div>
        )}
        {crashLoop && (
          <div className="text-rose-400 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              [CrashLoopBackOff] Pod checkout-api terminated with Exit Code 137 (OOMKilled &gt; 512Mi limit). Restarts: {restartCount}. Run &quot;kubectl rollout undo deployment/checkout-api&quot; to restore healthy capacity.
            </span>
          </div>
        )}
        {!iamDenied && !crashLoop && onPremDroppedRps > 0 && (
          <div className="text-rose-300">
            [Capacity Ceiling] In-House rack reached 100% CPU at 10,000 RPS and dropped {onPremDroppedRps.toLocaleString()} req/s (HTTP 503). AWS EKS auto-scaled cleanly to {desiredAwsPods} pods. Toggle &quot;Hybrid Burst&quot; to spill excess on-prem load to cloud.
          </div>
        )}
        {!iamDenied && !crashLoop && onPremDroppedRps === 0 && (
          <div className="text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>
              [Nominal] Both AWS EKS ({readyAwsPods} pods) and In-House RKE2 ({readyOnPremPods} rack + {burstCloudPods} burst pods) are serving {trafficRps.toLocaleString()} RPS with 0 dropped requests.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
