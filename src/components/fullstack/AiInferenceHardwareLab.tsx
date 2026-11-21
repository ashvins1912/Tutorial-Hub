import { useMemo, useState } from 'react';
import { Calculator, Cpu, Layers, Zap } from 'lucide-react';
import { LLM_INFERENCE_ENGINES } from '../../data/fullStackArchitectureData';
import { SegmentedTabBar } from '../ui';

type QuantFormat = 'fp16' | 'fp8' | 'awq4';
type GpuTarget = 'h100' | 'a100' | 'l40s';

const GPU_SPECS: Record<GpuTarget, { name: string; vramGb: number; hbmBwTbSec: number; fp16Tflops: number }> = {
  h100: { name: 'NVIDIA H100 SXM (80 GB)', vramGb: 80, hbmBwTbSec: 3.35, fp16Tflops: 989 },
  a100: { name: 'NVIDIA A100 SXM (80 GB)', vramGb: 80, hbmBwTbSec: 2.04, fp16Tflops: 312 },
  l40s: { name: 'NVIDIA L40S (48 GB)', vramGb: 48, hbmBwTbSec: 0.86, fp16Tflops: 362 },
};

export function AiInferenceHardwareLab() {
  const [modelBillions, setModelBillions] = useState<7 | 14 | 70>(70);
  const [quant, setQuant] = useState<QuantFormat>('fp8');
  const [gpu, setGpu] = useState<GpuTarget>('h100');
  const [batchSize, setBatchSize] = useState<number>(16);
  const [contextK, setContextK] = useState<number>(8);
  const [pagedAttention, setPagedAttention] = useState<boolean>(true);

  const calc = useMemo(() => {
    const bytesPerParam = quant === 'fp16' ? 2 : quant === 'fp8' ? 1 : 0.55;
    const weightsGb = Number((modelBillions * bytesPerParam).toFixed(1));

    // Realistic GQA KV-cache footprint (~0.16 MB/token for 70B, ~0.08 MB/token for 14B, ~0.05 MB/token for 7B in FP16)
    const mbPerToken = modelBillions === 70 ? 0.16 : modelBillions === 14 ? 0.08 : 0.05;
    const activeKvGb = (batchSize * contextK * 1024 * mbPerToken) / 1024;
    // Contiguous reservation wastes ~55% VRAM due to max-length pre-allocation & fragmentation; PagedAttention wastes ~3%
    const kvVramGb = Number((activeKvGb * (pagedAttention ? 1.03 : 2.15)).toFixed(1));
    const totalVramGb = Number((weightsGb + kvVramGb + 2.5).toFixed(1));

    const spec = GPU_SPECS[gpu];
    const gpusRequired = Math.max(1, Math.ceil(totalVramGb / (spec.vramGb * 0.92)));
    const aggregateBwTbSec = spec.hbmBwTbSec * gpusRequired;

    // Decode TPOT floor: reading model weights + active KV cache across aggregate HBM bandwidth (with ~72% effective efficiency)
    const bytesReadPerStepGb = weightsGb + activeKvGb;
    const tpotMs = Number(((bytesReadPerStepGb / (aggregateBwTbSec * 1000 * 0.72)) * 1000).toFixed(1));
    const tokensPerSecPerUser = Number((1000 / Math.max(1, tpotMs)).toFixed(1));
    const clusterTokPerSec = Math.round(tokensPerSecPerUser * batchSize);

    // Prefill TTFT estimate: 2 * P * L FLOPs / effective Tensor Core TFLOPs
    const prefillFlopsT = (2 * modelBillions * 1e9 * (contextK * 1024)) / 1e12;
    const effectiveTflops = spec.fp16Tflops * gpusRequired * (quant === 'fp8' ? 1.65 : 1) * 0.55;
    const ttftMs = Math.max(12, Math.round((prefillFlopsT / effectiveTflops) * 1000));

    return {
      weightsGb,
      kvVramGb,
      totalVramGb,
      gpusRequired,
      tpotMs,
      tokensPerSecPerUser,
      clusterTokPerSec,
      ttftMs,
      vramSavedGb: Number((activeKvGb * 1.12).toFixed(1)),
    };
  }, [modelBillions, quant, gpu, batchSize, contextK, pagedAttention]);

  return (
    <div className="space-y-6">
      {/* Interactive LLM VRAM, Quantization & Prefill vs Decode Calculator */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-sky-700 dark:text-sky-400 font-semibold">
              Section 05 · GPU Silicon Physics, Quantization &amp; PagedAttention Simulator
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              LLM Prefill (Compute-Bound) vs. Decode (HBM Bandwidth-Bound) Estimator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Adjust model parameters, quantization, batch concurrency, and PagedAttention to observe exact HBM3 VRAM usage, TTFT, and TPOT.
            </p>
          </div>

          <SegmentedTabBar<GpuTarget>
            ariaLabel="Target GPU accelerator"
            activeTab={gpu}
            onChange={setGpu}
            size="xs"
            tabs={[
              { id: 'h100', label: 'H100 (3.35 TB/s)' },
              { id: 'a100', label: 'A100 (2.04 TB/s)' },
              { id: 'l40s', label: 'L40S (0.86 TB/s)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 6 Cols: Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Model Size (Parameters)
                </span>
                <SegmentedTabBar<'7' | '14' | '70'>
                  ariaLabel="Model parameter size"
                  activeTab={String(modelBillions) as '7' | '14' | '70'}
                  onChange={(v) => setModelBillions(Number(v) as 7 | 14 | 70)}
                  size="xs"
                  tabs={[
                    { id: '7', label: '7B' },
                    { id: '14', label: '14B' },
                    { id: '70', label: '70B' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Weight Quantization
                </span>
                <SegmentedTabBar<QuantFormat>
                  ariaLabel="Quantization precision"
                  activeTab={quant}
                  onChange={setQuant}
                  size="xs"
                  tabs={[
                    { id: 'fp16', label: 'FP16/BF16' },
                    { id: 'fp8', label: 'FP8 (H100)' },
                    { id: 'awq4', label: 'INT4 AWQ' },
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <label htmlFor="llm-batch">Continuous Batch Size</label>
                  <span className="font-mono font-bold tabular-nums">{batchSize} reqs</span>
                </div>
                <input
                  id="llm-batch"
                  type="range"
                  min={1}
                  max={64}
                  step={1}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <label htmlFor="llm-ctx">Active Context Length</label>
                  <span className="font-mono font-bold tabular-nums">{contextK}K tokens</span>
                </div>
                <input
                  id="llm-ctx"
                  type="range"
                  min={2}
                  max={64}
                  step={2}
                  value={contextK}
                  onChange={(e) => setContextK(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            {/* PagedAttention Toggle + Visual Block Comparison */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  KV-Cache Memory Allocator
                </span>
                <button
                  type="button"
                  onClick={() => setPagedAttention((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                    pagedAttention
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {pagedAttention ? 'PagedAttention: ON (<4% Waste)' : 'Contiguous Legacy (~55% Fragmentation)'}
                </button>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const isUsed = pagedAttention ? idx < 15 : idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`h-5 rounded text-[9px] font-mono flex items-center justify-center border ${
                        isUsed
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-800 dark:text-sky-300'
                          : 'bg-rose-500/15 border-rose-400/40 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {isUsed ? `B${idx}` : 'WASTE'}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-5">
                {pagedAttention
                  ? `PagedAttention allocates non-contiguous 16-token virtual pages on demand, saving ~${calc.vramSavedGb} GB VRAM at this batch size.`
                  : `Legacy contiguous reservation pre-allocates max sequence length per request, wasting ~${calc.vramSavedGb} GB VRAM in internal fragmentation.`}
              </p>
            </div>
          </div>

          {/* Right 6 Cols: Computed Hardware & Latency Readout */}
          <div className="lg:col-span-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Model Weights VRAM', value: `${calc.weightsGb} GB`, sub: `${modelBillions}B @ ${quant.toUpperCase()}` },
                { label: 'KV-Cache VRAM', value: `${calc.kvVramGb} GB`, sub: `${batchSize} × ${contextK}K ctx` },
                { label: 'Min GPUs (TP)', value: `${calc.gpusRequired}× GPU`, sub: `${calc.totalVramGb} GB total` },
                { label: 'Est. TTFT (Prefill)', value: `${calc.ttftMs} ms`, sub: 'Compute-bound GEMM' },
                { label: 'Est. TPOT (Decode)', value: `${calc.tpotMs} ms`, sub: `${calc.tokensPerSecPerUser} tok/s / user` },
                { label: 'Cluster Throughput', value: `${calc.clusterTokPerSec.toLocaleString()} t/s`, sub: 'Amortized HBM3 read' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{m.label}</div>
                  <div className="text-lg font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                    {m.value}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 p-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-5">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                ML Compilers &amp; Silicon Memory Hierarchy
              </div>
              <p>
                • <strong>Graph Compilation:</strong> <code className="font-mono">torch.compile</code> (TorchInductor + OpenAI Triton kernels), <strong>JAX XLA</strong>, and <strong>ONNX Runtime</strong> fuse elementwise ops in on-chip SRAM so intermediate tensors never round-trip to HBM.
              </p>
              <p>
                • <strong>Memory Speed Cliff:</strong> GPU SRAM (~20 TB/s) &gt; HBM3 VRAM (3.35 TB/s) &gt; NVLink (900 GB/s) &gt; DDR5 Host RAM (~200 GB/s) &gt; PCIe Gen5 (64 GB/s) &gt; NVMe SSD (7 GB/s).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LLM Inference Engines Comparison Table */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Production LLM Inference Engines &amp; Model Servers Comparison
          </h3>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Engine</th>
                <th className="py-2.5 px-3">Core Architecture</th>
                <th className="py-2.5 px-3">KV-Cache Strategy</th>
                <th className="py-2.5 px-3">Quantization</th>
                <th className="py-2.5 px-3">Best Production Fit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {LLM_INFERENCE_ENGINES.map((eng) => (
                <tr key={eng.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {eng.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{eng.coreStrength}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{eng.kvCacheStrategy}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-sky-700 dark:text-sky-400">
                    {eng.quantizationSupport}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{eng.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1">
          <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
          <span>
            Orchestration layer: <strong>LangGraph</strong> (stateful agent graphs), <strong>LlamaIndex</strong> (RAG ingestion/retrieval), <strong>DSPy</strong> (programmatic prompt optimization), and <strong>Semantic Kernel</strong> (Enterprise JVM/.NET).
          </span>
        </div>
      </section>
    </div>
  );
}
