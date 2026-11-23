export type FrontierLlmPlatformId = 'chatgpt' | 'gemini' | 'claude';

export interface LlmFlowHop {
  step: number;
  nodeId: string;
  phase: string;
  layer: 'Client' | 'Edge & Auth' | 'Routing & Cache' | 'GPU / TPU Compute' | 'Stream Egress';
  latencyMs: number;
  summary: string;
  internalLogic: string;
  wireSample: string;
  streamedTokenChunk?: {
    tokenText: string;
    tokenId: number;
    logprob: string;
  };
}

export interface FrontierLlmPlatformSpec {
  id: FrontierLlmPlatformId;
  name: string;
  vendor: string;
  flagshipStack: string;
  formalDefinition: string;
  hardwareFabric: string;
  tokenizerSpec: string;
  contextAndCacheSpec: string;
  streamingProtocolSpec: string;
  safetyAndToolingSpec: string;
  signatureDifferentiators: string[];
  flowSteps: LlmFlowHop[];
  buildArchitectureMermaid: (activeNodeId: string | null, visitedNodeIds: string[]) => string;
  sequenceMermaid: string;
}

export interface LlmInternalAlgorithmSpec {
  id: string;
  number: number;
  name: string;
  category:
    | 'Tokenization & Position'
    | 'Transformer & Attention'
    | 'Serving & GPU Memory'
    | 'Decoding & Client Stream';
  bottleneckType: 'CPU / Pre-Process' | 'Compute-Bound (FLOPS)' | 'Memory-Bandwidth-Bound (HBM)' | 'Network / I/O Stream';
  complexity: string;
  plainEnglish: string;
  formalDefinition: string;
  stepByStepLogic: string[];
  implementationCode: string;
  usedBy: string;
}

export interface ClientTokenStage {
  stage: number;
  title: string;
  protocolLayer: string;
  whatHappens: string;
  engineeringDetail: string;
}

function buildStyleLines(
  allNodeIds: string[],
  activeNodeId: string | null,
  visitedNodeIds: string[]
): string {
  const lines: string[] = [];
  for (const id of allNodeIds) {
    if (id === activeNodeId) {
      lines.push(`  style ${id} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`);
    } else if (visitedNodeIds.includes(id)) {
      lines.push(`  style ${id} fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px`);
    }
  }
  return lines.join('\n');
}

export const FRONTIER_LLM_PLATFORMS: FrontierLlmPlatformSpec[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT (OpenAI GPT-4o / o-Series)',
    vendor: 'OpenAI',
    flagshipStack: 'NVIDIA H100 / GB200 NVLink · TensorRT-LLM / Triton · tiktoken o200k_base · HTTP/2 SSE',
    formalDefinition:
      'A globally distributed multimodal Transformer serving platform built around disaggregated Prefill and Decode NVIDIA GPU pools, PagedAttention KV-cache prefix reuse, continuous iteration-level batching, and Server-Sent Events (SSE) token streaming over HTTP/2.',
    hardwareFabric:
      'Multi-node NVIDIA H100/GB200 clusters linked via 900 GB/s NVLink inside racks and InfiniBand RDMA across racks for Tensor Parallelism (TP=8) and KV-Cache transfer.',
    tokenizerSpec:
      'tiktoken Byte-Level BPE (`o200k_base`, 200,000 vocab) plus native audio/vision patch encoders; English averages ~0.75 words per token (~4 chars).',
    contextAndCacheSpec:
      'Automatic Prefix Prompt Caching (hashes 128-token prefix blocks across GPU HBM & Host DRAM) paired with PagedAttention 16-token virtual KV blocks.',
    streamingProtocolSpec:
      'HTTP/2 POST `/v1/chat/completions` (`stream: true`) returning `text/event-stream` JSON chunks (`chat.completion.chunk`) terminating with `data: [DONE]`.',
    safetyAndToolingSpec:
      'Parallel input/output Moderation Classifiers, Structured Outputs via Constrained FSM Decoding (JSON Schema grammar masks), and isolated container Code Interpreter / Web Search tool loops.',
    signatureDifferentiators: [
      'Automatic Prefix Caching slashes TTFT up to 80% on repeated system prompts & multi-turn threads.',
      'Constrained Grammar / FSM Logit Masking guarantees 100% valid JSON Schema Structured Outputs.',
      'Disaggregated Prefill (compute-bound) vs Decode (HBM-bandwidth-bound) pools prevent long prompts from stalling active token streams.',
      'Speculative Decoding & Reasoning Token Budgets (o-series) adapt test-time compute per query complexity.',
    ],
    flowSteps: [
      {
        step: 1,
        nodeId: 'Client',
        phase: 'Client Connection & TLS/HTTP2',
        layer: 'Client',
        latencyMs: 18,
        summary: 'Browser opens persistent HTTP/2 POST with `Accept: text/event-stream` and Bearer auth.',
        internalLogic:
          'Client reuses warm TLS 1.3 + HTTP/2 connection to nearest Anycast Edge PoP and sends conversation messages + `stream: true`.',
        wireSample: 'POST /v1/chat/completions HTTP/2 | Accept: text/event-stream | {"model":"gpt-4o","stream":true}',
      },
      {
        step: 2,
        nodeId: 'EdgeGW',
        phase: 'Edge Auth, Token Bucket & Moderation',
        layer: 'Edge & Auth',
        latencyMs: 24,
        summary: 'Validates JWT/API key, enforces RPM/TPM Redis Lua quota, and runs fast input safety check.',
        internalLogic:
          'Estimates prompt tokens before inference to reserve TPM (Tokens Per Minute) capacity; rejects policy violations early before burning GPU FLOPS.',
        wireSample: 'X-RateLimit-Remaining-Tokens: 294100 | safety_score: 0.002 (PASS)',
      },
      {
        step: 3,
        nodeId: 'Tokenizer',
        phase: 'tiktoken BPE & Prefix-Aware Router',
        layer: 'Routing & Cache',
        latencyMs: 8,
        summary: 'Encodes UTF-8 prompt into integer token IDs and hashes prefix blocks to pick a warm GPU pod.',
        internalLogic:
          'Runs greedy BPE merge table (`o200k_base`) -> `[15339, 995, 11, ...]`. Computes Radix prefix hash so router pins request to the GPU cluster already holding the system-prompt KV-cache!',
        wireSample: 'tokens=[200006, 17360, 15339, 11, 358, 1390] | prefix_cache_hit=78%',
      },
      {
        step: 4,
        nodeId: 'PrefillGPU',
        phase: 'Disaggregated Prefill (Parallel MatMul)',
        layer: 'GPU / TPU Compute',
        latencyMs: 145,
        summary: 'Computes Q, K, V projections for all uncached prompt tokens in ONE parallel FlashAttention pass.',
        internalLogic:
          'Compute-bound GEMM saturates GPU Tensor Cores; writes resulting Key/Value tensors into non-contiguous PagedAttention blocks and ships them over RDMA to a Decode worker.',
        wireSample: 'FlashAttention2 tiled SRAM pass | 320 uncached tokens -> 20 KV blocks allocated (42 MB HBM)',
      },
      {
        step: 5,
        nodeId: 'KVCache',
        phase: 'PagedAttention Block Table & Radix Cache',
        layer: 'GPU / TPU Compute',
        latencyMs: 6,
        summary: 'Maps logical token indices to physical HBM KV blocks with Copy-on-Write sharing across requests.',
        internalLogic:
          'Eliminates ~60% VRAM fragmentation by allocating 16-token pages on demand; shared system prompt pages use reference counting (zero duplicate HBM copies).',
        wireSample: 'block_table=[0x1A, 0x1B (shared), 0x4F, 0x52] | HBM_util=91.4%',
      },
      {
        step: 6,
        nodeId: 'DecodeGPU',
        phase: 'Continuous Batch Decode & Sampling',
        layer: 'GPU / TPU Compute',
        latencyMs: 22,
        summary: 'Generates 1 token per forward pass across 128 co-batched users; applies Top-P / FSM mask.',
        internalLogic:
          'Memory-bandwidth-bound step: streams model weights + KV blocks from HBM to SRAM, computes logits over 200K vocab, applies temperature & nucleus Top-P sampling -> emits token ID `4077`.',
        wireSample: 'iter_batch=128 reqs | logit_top1="Paged" (id=4077, p=0.94) | ITL=22ms',
        streamedTokenChunk: { tokenText: 'Paged', tokenId: 4077, logprob: '-0.06' },
      },
      {
        step: 7,
        nodeId: 'StreamOut',
        phase: 'Detokenize, Output Guard & SSE Flush',
        layer: 'Stream Egress',
        latencyMs: 5,
        summary: 'Converts token IDs to UTF-8 (buffering partial multi-byte emojis) and flushes SSE frame immediately.',
        internalLogic:
          'Detokenizer handles multi-byte UTF-8 boundaries safely; writes `data: {"choices":[{"delta":{"content":"..."}}]}\\n\\n` with TCP_NODELAY & `X-Accel-Buffering: no`.',
        wireSample: 'data: {"id":"chatcmpl-9a","choices":[{"delta":{"content":"Attention"}}]}',
        streamedTokenChunk: { tokenText: 'Attention', tokenId: 24812, logprob: '-0.02' },
      },
      {
        step: 8,
        nodeId: 'Client',
        phase: 'Browser ReadableStream & Incremental Paint',
        layer: 'Client',
        latencyMs: 4,
        summary: 'Client reads byte chunk via `getReader()`, decodes UTF-8 stream, and paints at 60fps.',
        internalLogic:
          'Frontend `TextDecoder({ stream: true })` parses SSE `\\n\\n` boundaries, appends token delta to React state / incremental Markdown AST, and persists final turn to DB on `[DONE]`.',
        wireSample: 'ReadableStream chunk -> UI Markdown paint (TTFT=228ms, 45 tok/s) -> data: [DONE]',
        streamedTokenChunk: { tokenText: ' eliminates KV fragmentation.', tokenId: 39104, logprob: '-0.09' },
      },
    ],
    buildArchitectureMermaid: (activeNodeId, visitedNodeIds) => {
      const styles = buildStyleLines(
        ['Client', 'EdgeGW', 'Tokenizer', 'PrefillGPU', 'KVCache', 'DecodeGPU', 'StreamOut', 'ChatDB'],
        activeNodeId,
        visitedNodeIds
      );
      return `flowchart LR
  subgraph ClientLayer["1. Client & Edge"]
    Client["Web / Mobile Client (HTTP/2 SSE)"] -->|"POST stream=true"| EdgeGW["Anycast Edge, Auth, TPM Quota & Safety"]
  end
  subgraph RoutingLayer["2. Tokenize & Prefix Route"]
    EdgeGW -->|"UTF-8 Prompt"| Tokenizer["tiktoken o200k_base & Radix Prefix Router"]
    Tokenizer <-->|"History"| ChatDB[("Conversation & Memory Store")]
  end
  subgraph GpuCluster["3. Disaggregated NVIDIA GPU Cluster"]
    Tokenizer -->|"Uncached Prompt"| PrefillGPU["Prefill Pool (FlashAttention / Tensor Cores)"]
    PrefillGPU -->|"RDMA KV Transfer"| KVCache[("PagedAttention HBM + Prefix Cache")]
    KVCache -->|"16-Token KV Blocks"| DecodeGPU["Decode Pool (Continuous Batch + Speculative)"]
  end
  subgraph EgressLayer["4. Live Token Float"]
    DecodeGPU -->|"Token IDs (20ms/tok)"| StreamOut["Detokenizer, Output Guard & SSE Flusher"]
    StreamOut -->|"data: delta frames"| Client
  end
${styles}`;
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  actor Client as Browser / SDK
  participant Edge as Edge GW + TPM Limiter
  participant Router as Tokenizer & Prefix Router
  participant Prefill as Prefill GPU Pool
  participant Decode as Decode GPU + Paged KV
  participant Stream as SSE Stream Flusher

  Client->>Edge: POST /v1/chat/completions (HTTP/2, stream=true)
  Edge->>Router: Auth OK + Input Safety PASS
  Router->>Prefill: Token IDs (78% Prefix KV Hit -> compute 22% delta)
  Prefill->>Decode: RDMA transfer PagedAttention KV blocks
  loop Continuous Batching (~20ms per token)
    Decode->>Stream: Sampled Token ID (Top-P / FSM Grammar)
    Stream-->>Client: SSE data: {"delta":{"content":"token"}} (TCP_NODELAY)
  end
  Stream-->>Client: SSE data: [DONE] + usage stats`,
  },

  {
    id: 'gemini',
    name: 'Google Gemini (TPU Pods, Native Multimodal & 2M Context)',
    vendor: 'Google DeepMind',
    flagshipStack: 'Google TPU v5p / Trillium Pods · 3D Torus ICI + Optical Switches · Native Multimodal + Ring Attention',
    formalDefinition:
      'A natively multimodal Mixture-of-Experts (MoE) foundation architecture running on custom Google TPU Pods interconnected by reconfigurable Optical Circuit Switches (OCS), combining unified text/image/audio/video tokenization with Ring Attention for 1M–2M token context windows.',
    hardwareFabric:
      'Google TPU v5p / Trillium Pods (up to 8,960 chips per pod) wired in a 3D Torus Inter-Chip Interconnect (ICI) with dynamic Optical Circuit Switches (OCS) routing around failed chips in milliseconds.',
    tokenizerSpec:
      'SentencePiece Unigram/BPE (~256K vocabulary) fused with native Vision ViT patch tokens, Video temporal frame tokens (258 tok/frame), and 16kHz Audio waveform tokens inside ONE shared embedding space.',
    contextAndCacheSpec:
      'Ring Attention shards 1M–2M token KV-caches across a ring of TPU chips, overlapping network KV block passing with local FlashAttention compute; Explicit Context Caching pins large repos/videos in TPU HBM.',
    streamingProtocolSpec:
      'Server-side gRPC / HTTP/2 SSE (`streamGenerateContent?alt=sse`) and low-latency bi-directional WebSocket Live API (`16kHz PCM audio / 1fps video in -> 24kHz PCM out`).',
    safetyAndToolingSpec:
      'Integrated Google Search & Maps Grounding tools, Function Calling, Thought-Signature reasoning traces, and layered harm/citation filters.',
    signatureDifferentiators: [
      'True Native Multimodality: text, 1-hour video, audio, and code enter the exact same Transformer layers without brittle captioning adapters.',
      'Ring Attention distributes 2M-token KV-caches across dozens of TPU chips so long-context attention scales linearly with chip count.',
      'Sparse MoE routing activates only a fraction of total parameters per token, yielding frontier quality at Flash-level latency.',
      'Optical Circuit Switches (OCS) dynamically reconfigure 3D Torus pod topology for 99.9%+ large-scale serving availability.',
    ],
    flowSteps: [
      {
        step: 1,
        nodeId: 'Client',
        phase: 'Multimodal Client Ingress (HTTP/2 / Live WS)',
        layer: 'Client',
        latencyMs: 16,
        summary: 'App server sends text + media/file URI over HTTP/2 SSE (`streamGenerateContent`).',
        internalLogic:
          'Google Front End (GFE) terminates QUIC/TLS 1.3 at the nearest global edge PoP and forwards over Google’s private Jupiter/B4 backbone.',
        wireSample: 'POST /models/gemini-4:streamGenerateContent?alt=sse | parts=[video_uri, prompt]',
      },
      {
        step: 2,
        nodeId: 'GFE',
        phase: 'GFE Quota, Context Cache & Grounding Check',
        layer: 'Edge & Auth',
        latencyMs: 20,
        summary: 'Resolves `cachedContent` handle and determines if Google Search/Maps grounding is required.',
        internalLogic:
          'If a 500K-token codebase is already pinned via Context Caching, skips re-encoding and jumps straight to the cached TPU HBM ring!',
        wireSample: 'cached_content_id=cache_repo_v4 (HIT: 480K tokens) | grounding=enabled',
      },
      {
        step: 3,
        nodeId: 'MultiTok',
        phase: 'Unified Multimodal Encoder (Text + Vision + Audio)',
        layer: 'Routing & Cache',
        latencyMs: 14,
        summary: 'SentencePiece tokenizes text while ViT/Audio encoders emit aligned patch embeddings.',
        internalLogic:
          'Maps text IDs, image patches, and audio frames into identical $d_{model}$ vectors tagged with multimodal 3D RoPE positional indices.',
        wireSample: 'unified_seq=[text(120 tok), video_patches(1548 tok)] -> d_model=8192',
      },
      {
        step: 4,
        nodeId: 'RingAttn',
        phase: 'Ring Attention Prefill Across TPU 3D Torus',
        layer: 'GPU / TPU Compute',
        latencyMs: 160,
        summary: 'Shards long context across TPU chips; passes KV blocks around the ICI ring while computing attention.',
        internalLogic:
          'Every TPU computes local FlashAttention on its query shard while asynchronously receiving the next chip’s KV shard over 4.8 Tbps ICI links—hiding network latency completely!',
        wireSample: 'TPU Ring (16 chips) | 3D Torus ICI KV-hop overlapped with MXU MatMul',
      },
      {
        step: 5,
        nodeId: 'MoE',
        phase: 'Sparse Mixture-of-Experts (Top-2 Router)',
        layer: 'GPU / TPU Compute',
        latencyMs: 18,
        summary: 'Gating network routes each token to only its Top-2 specialized experts via All-to-All ICI dispatch.',
        internalLogic:
          'Computes $G(x) = \\text{Softmax}(\\text{TopK}(x W_g))$ so each token activates ~15-25% of model weights—maximizing reasoning capacity while preserving high tokens/sec.',
        wireSample: 'MoE Gate -> Expert#14 (Systems, w=0.63) + Expert#07 (Code, w=0.37)',
      },
      {
        step: 6,
        nodeId: 'DecodeTPU',
        phase: 'TPU HBM Decode + Grounding Verification',
        layer: 'GPU / TPU Compute',
        latencyMs: 17,
        summary: 'Autoregressive decode reads sharded KV-cache from TPU HBM and samples next token.',
        internalLogic:
          'Uses Grouped-Query Attention (GQA) to minimize KV HBM traffic and supports optional Thinking tokens before final user-visible output.',
        wireSample: 'GQA Decode step | Thinking=enabled | next_token="Ring" (id=18922, 17ms)',
        streamedTokenChunk: { tokenText: 'Ring', tokenId: 18922, logprob: '-0.04' },
      },
      {
        step: 7,
        nodeId: 'StreamOut',
        phase: 'Citation Grounding & SSE Chunk Emission',
        layer: 'Stream Egress',
        latencyMs: 6,
        summary: 'Attaches grounding metadata/safety ratings and flushes `GenerateContentResponse` SSE frame.',
        internalLogic:
          'Streams incremental UTF-8 deltas over HTTP/2 with zero buffering so downstream web servers forward chunks directly to browsers.',
        wireSample: 'data: {"candidates":[{"content":{"parts":[{"text":" Attention"}]}}]}',
        streamedTokenChunk: { tokenText: ' Attention', tokenId: 30411, logprob: '-0.01' },
      },
      {
        step: 8,
        nodeId: 'Client',
        phase: 'Client Progressive Stream Assembly',
        layer: 'Client',
        latencyMs: 4,
        summary: 'Client SDK / Browser appends streamed deltas and renders structured response live.',
        internalLogic:
          'Async iterator `for await (const chunk of stream)` yields `chunk.text` incrementally without waiting for full generation completion.',
        wireSample: 'Client renders 58 tok/s live | Grounding sources attached on final chunk',
        streamedTokenChunk: { tokenText: ' scales to 2M tokens on TPUs.', tokenId: 44108, logprob: '-0.05' },
      },
    ],
    buildArchitectureMermaid: (activeNodeId, visitedNodeIds) => {
      const styles = buildStyleLines(
        ['Client', 'GFE', 'MultiTok', 'RingAttn', 'MoE', 'DecodeTPU', 'StreamOut', 'SearchTool'],
        activeNodeId,
        visitedNodeIds
      );
      return `flowchart LR
  subgraph Edge["1. Client & Google Front End"]
    Client["App / Browser (HTTP/2 SSE / Live WS)"] -->|"QUIC / TLS 1.3"| GFE["GFE Edge, Auth & Context Cache Lookup"]
    GFE -.->|"Optional Grounding"| SearchTool["Google Search / Maps Grounding"]
  end
  subgraph Encode["2. Unified Multimodal Space"]
    GFE -->|"Text + Video + Audio"| MultiTok["SentencePiece + ViT / Audio Patch Encoder"]
  end
  subgraph TpuPod["3. Google TPU v5p / Trillium 3D Torus Pod"]
    MultiTok -->|"Long Context Shards"| RingAttn["Ring Attention Prefill (ICI + OCS Fabric)"]
    RingAttn -->|"Token Routing"| MoE["Sparse MoE Top-K Experts (All-to-All)"]
    MoE -->|"GQA Sharded KV"| DecodeTPU["TPU Autoregressive Decode & Thinking"]
  end
  subgraph Egress["4. Live Token Stream"]
    DecodeTPU -->|"Delta + Citations"| StreamOut["Safety Filter & SSE Response Flusher"]
    StreamOut -->|"data: candidates delta"| Client
  end
${styles}`;
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  actor Client as App / Browser
  participant GFE as GFE & Context Cache
  participant Enc as Multimodal Encoder
  participant TPU as TPU Pod (Ring Attn + MoE)
  participant SSE as SSE Stream Flusher

  Client->>GFE: POST streamGenerateContent?alt=sse (prompt + cachedContent)
  GFE->>Enc: Encode new text/vision tokens (reuse 480K cached KV)
  Enc->>TPU: Dispatch to 3D Torus TPU Ring
  Note over TPU: Ring Attention overlaps ICI KV-transfer with FlashAttention + Sparse MoE
  loop Decode (~17ms per token)
    TPU->>SSE: Emit sampled token + optional grounding citation
    SSE-->>Client: SSE data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
  end`,
  },

  {
    id: 'claude',
    name: 'Anthropic Claude (Prompt Caching, Extended Thinking & Typed SSE)',
    vendor: 'Anthropic',
    flagshipStack: 'Multi-Cloud TPU / AWS Trainium / NVIDIA · Explicit Prefix KV Breakpoints · Typed Event SSE Protocol',
    formalDefinition:
      'A high-reliability reasoning and coding LLM serving architecture featuring developer-controlled Explicit Prompt Caching breakpoints, Constitutional AI alignment guardrails, Extended Thinking scratchpad streams, and a strongly-typed multi-block Server-Sent Events (SSE) protocol.',
    hardwareFabric:
      'Heterogeneous multi-cloud serving across AWS Trainium2/Inferentia, Google Cloud TPUs, and NVIDIA H100 clusters abstracted by a unified compiler & prefix-aware load balancer.',
    tokenizerSpec:
      'Custom Byte-Level BPE (~65K–100K vocab) heavily optimized for source code indentation, diffs, XML tags, and structured tool schemas.',
    contextAndCacheSpec:
      'Explicit `cache_control: {"type": "ephemeral"}` breakpoints allow developers to pin system prompts, tool definitions, and large code files in warm KV-cache (90% cost reduction, up to 85% TTFT speedup).',
    streamingProtocolSpec:
      'Strongly-typed SSE state machine on `POST /v1/messages`: `message_start` -> `content_block_start` (`thinking` | `text` | `tool_use`) -> `content_block_delta` (`thinking_delta` / `text_delta` / `input_json_delta`) -> `content_block_stop` -> `message_delta` -> `message_stop`.',
    safetyAndToolingSpec:
      'Constitutional AI (RLAIF) training + streaming Constitutional Classifier filters + native agentic Tool-Use / Computer-Use loop returning structured JSON tool calls mid-stream.',
    signatureDifferentiators: [
      'Typed Content-Block SSE State Machine cleanly separates Extended Thinking (`thinking_delta`), visible prose (`text_delta`), and streaming JSON tool arguments (`input_json_delta`).',
      'Explicit Prompt Cache Breakpoints give engineers deterministic control over prefix KV-cache hit rates in multi-turn coding agents.',
      'Constitutional AI & streaming classifier guardrails evaluate safety incrementally without blocking full-response latency.',
      'Multi-accelerator portability (Trainium + TPU + GPU) eliminates single-vendor capacity bottlenecks during global spikes.',
    ],
    flowSteps: [
      {
        step: 1,
        nodeId: 'Client',
        phase: 'Client Messages API Stream Open',
        layer: 'Client',
        latencyMs: 19,
        summary: 'Client opens HTTP/2 POST `/v1/messages` with `stream: true` and `cache_control` markers.',
        internalLogic:
          'Sends system instructions, tool schemas (marked ephemeral cache breakpoint), and user coding query over persistent TLS 1.3 connection.',
        wireSample: 'POST /v1/messages | {"stream":true,"thinking":{"type":"enabled"},"system":[{...,"cache_control":"ephemeral"}]}',
      },
      {
        step: 2,
        nodeId: 'EdgeGW',
        phase: 'Org Quota, Constitutional Ingress & Routing',
        layer: 'Edge & Auth',
        latencyMs: 21,
        summary: 'Enforces organization RPM/ITPM/OTPM buckets and computes prefix hash for cache affinity.',
        internalLogic:
          'Separates Input-Tokens-Per-Minute (excluding cache reads!) from Output-Tokens-Per-Minute so cached coding sessions scale cleanly.',
        wireSample: 'anthropic-ratelimit-input-tokens-remaining: 380000 | prefix_affinity=pod-us-east-7',
      },
      {
        step: 3,
        nodeId: 'CacheLookup',
        phase: 'Explicit Prompt Cache Breakpoint Hit',
        layer: 'Routing & Cache',
        latencyMs: 11,
        summary: 'Matches cryptographic hash of `tools + system + prefix` directly to warm HBM/DRAM KV blocks.',
        internalLogic:
          'Loads 40,000 cached KV tokens directly into attention block tables in ~11ms instead of burning 800ms of Prefill FLOPS (90% input discount!).',
        wireSample: 'cache_read_input_tokens=40200 (HIT) | uncached_input_tokens=185',
      },
      {
        step: 4,
        nodeId: 'Prefill',
        phase: 'Delta Prefill & KV Extension',
        layer: 'GPU / TPU Compute',
        latencyMs: 65,
        summary: 'Runs FlashAttention Prefill ONLY on the 185 newly appended user tokens.',
        internalLogic:
          'Appends new K/V vectors onto the cached prefix sequence using RoPE offsets starting at position 40,200.',
        wireSample: 'Delta Prefill: 185 tokens @ RoPE offset 40200 -> 65ms TTFT',
      },
      {
        step: 5,
        nodeId: 'Thinking',
        phase: 'Extended Thinking & Tool-Use Reasoning Loop',
        layer: 'GPU / TPU Compute',
        latencyMs: 26,
        summary: 'Generates internal reasoning tokens (`thinking_delta`) before committing to final answer or tool call.',
        internalLogic:
          'Streams `event: content_block_start (type: thinking)` followed by `thinking_delta` frames so the user sees live transparent reasoning.',
        wireSample: 'event: content_block_delta | {"delta":{"type":"thinking_delta","thinking":"Check lock order..."}}',
        streamedTokenChunk: { tokenText: '[Thinking] Verify lock order -> ', tokenId: 9102, logprob: '-0.08' },
      },
      {
        step: 6,
        nodeId: 'Decode',
        phase: 'Continuous Batch Decode + Constitutional Guard',
        layer: 'GPU / TPU Compute',
        latencyMs: 21,
        summary: 'Switches cleanly to `text` or `tool_use` content block while streaming safety classifier monitors deltas.',
        internalLogic:
          'Uses GQA + Continuous Batching across heterogeneous accelerators; emits incremental JSON fragments (`input_json_delta`) if calling a tool.',
        wireSample: 'event: content_block_delta | {"delta":{"type":"text_delta","text":"Use explicit"}}',
        streamedTokenChunk: { tokenText: 'Use explicit', tokenId: 14820, logprob: '-0.03' },
      },
      {
        step: 7,
        nodeId: 'SseMux',
        phase: 'Typed SSE Event State Machine Flusher',
        layer: 'Stream Egress',
        latencyMs: 5,
        summary: 'Frames every token into strict SSE `event:` + `data:` envelopes with periodic `ping` keep-alives.',
        internalLogic:
          'Sends `event: ping` during long tool pauses to keep corporate proxies alive, then closes cleanly with `message_delta` (stop_reason + usage) and `message_stop`.',
        wireSample: 'event: content_block_delta\\ndata: {"index":1,"delta":{"type":"text_delta","text":" KV breakpoints."}}',
        streamedTokenChunk: { tokenText: ' KV breakpoints.', tokenId: 27490, logprob: '-0.02' },
      },
      {
        step: 8,
        nodeId: 'Client',
        phase: 'Client Typed Block State Machine Render',
        layer: 'Client',
        latencyMs: 4,
        summary: 'Browser parses SSE event types into collapsible Thinking panel + live streaming response or tool runner.',
        internalLogic:
          'If `stop_reason === "tool_use"`, client executes the local tool (e.g., DB query or bash) and loops back to Step 1 with the `tool_result` block!',
        wireSample: 'event: message_stop | stop_reason="end_turn" | cache_read=40200 tok',
        streamedTokenChunk: { tokenText: ' (90% cache hit)', tokenId: 33219, logprob: '-0.05' },
      },
    ],
    buildArchitectureMermaid: (activeNodeId, visitedNodeIds) => {
      const styles = buildStyleLines(
        ['Client', 'EdgeGW', 'CacheLookup', 'Prefill', 'Thinking', 'Decode', 'SseMux', 'Tools'],
        activeNodeId,
        visitedNodeIds
      );
      return `flowchart LR
  subgraph Ingress["1. Client & Edge Control"]
    Client["Client / Coding Agent (Typed SSE)"] -->|"POST /v1/messages"| EdgeGW["Edge Quota & Prefix Affinity Router"]
  end
  subgraph PrefixCache["2. Explicit Prompt Cache"]
    EdgeGW -->|"Hash Breakpoints"| CacheLookup[("KV Prefix Cache (5m / 1h Breakpoints)")]
    CacheLookup -->|"Delta Tokens Only"| Prefill["Delta Prefill Engine (RoPE Offset)"]
  end
  subgraph Inference["3. Multi-Cloud Accelerator Inference"]
    Prefill -->|"KV Tables"| Thinking["Extended Thinking Block Generator"]
    Thinking -->|"Text / Tool JSON"| Decode["Continuous Batch Decode + Constitutional Guard"]
    Decode -.->|"tool_use block"| Tools["Client / Sandbox Tool Execution Loop"]
  end
  subgraph Stream["4. Typed SSE State Machine"]
    Decode -->|"Typed Deltas + Pings"| SseMux["SSE Event Framer (start/delta/stop)"]
    SseMux -->|"content_block_delta"| Client
  end
${styles}`;
    },
    sequenceMermaid: `sequenceDiagram
  autonumber
  actor Client as Client / IDE Agent
  participant Edge as Edge & Prefix Router
  participant Cache as Explicit KV Cache
  participant Accel as Trainium / TPU / GPU
  participant SSE as Typed SSE Framer

  Client->>Edge: POST /v1/messages (stream=true, cache_control=ephemeral)
  Edge->>Cache: Lookup prefix breakpoint hash (40K tokens HIT!)
  Cache->>Accel: Mount cached KV blocks + Delta Prefill 185 new tokens
  SSE-->>Client: event: message_start -> content_block_start (thinking)
  loop Extended Thinking + Final Text (~21ms/tok)
    Accel->>SSE: Next token (Constitutional Guard PASS)
    SSE-->>Client: event: content_block_delta (thinking_delta / text_delta)
  end
  SSE-->>Client: event: message_delta (usage + stop_reason) -> message_stop`,
  },
];

export const LLM_INTERNAL_ALGORITHMS: LlmInternalAlgorithmSpec[] = [
  {
    id: 'bpe-tokenization',
    number: 1,
    name: 'Byte-Pair Encoding (BPE) & SentencePiece Tokenization',
    category: 'Tokenization & Position',
    bottleneckType: 'CPU / Pre-Process',
    complexity: 'O(N log V) greedy merge (O(N) cached trie/regex split)',
    plainEnglish:
      'LLMs never read raw English letters or Unicode characters directly—they convert text into compact integer IDs (like dictionary page numbers). Frequent words ("architecture") become 1 token, while rare words split into sub-word pieces so the model never encounters an "unknown word" error.',
    formalDefinition:
      'Byte-Level BPE initializes tokens as UTF-8 bytes (0–255) and iteratively merges the highest-frequency adjacent byte/symbol pair $(a, b) \\to ab$ during training up to vocabulary size $V$ (e.g., 100K–256K). At inference, pre-tokenization regex splits text, then lowest-rank learned merge rules execute greedily.',
    stepByStepLogic: [
      'Split incoming UTF-8 string using a pre-tokenization regex (separating words, numbers, whitespace, and punctuation so merges do not cross word boundaries awkwardly).',
      'Convert each chunk into its raw UTF-8 byte sequence so any emoji, CJK glyph, or code symbol is representable with zero `<UNK>` failures.',
      'Repeatedly find the adjacent pair `(t[i], t[i+1])` with the lowest merge rank in the vocabulary table and fuse them into a single token ID.',
      'For multimodal models (Gemini / GPT-4o), vision ViT encoders slice images into 14x14 patches and project them into the same embedding dimension as text token IDs.',
    ],
    implementationCode: `def bpe_encode(text: str, merge_ranks: dict[tuple[bytes, bytes], int], vocab: dict[bytes, int]) -> list[int]:
    # 1. Start with raw UTF-8 bytes (zero <UNK> errors for emojis/code/Unicode)
    tokens = [bytes([b]) for b in text.encode("utf-8")]
    while len(tokens) >= 2:
        # 2. Find adjacent pair with lowest learned merge rank
        best_pair, best_rank = None, float("inf")
        for i in range(len(tokens) - 1):
            pair = (tokens[i], tokens[i + 1])
            rank = merge_ranks.get(pair)
            if rank is not None and rank < best_rank:
                best_pair, best_rank = pair, rank
        if best_pair is None:
            break
        # 3. Merge all occurrences of best_pair
        merged, i = [], 0
        while i < len(tokens):
            if i < len(tokens) - 1 and (tokens[i], tokens[i + 1]) == best_pair:
                merged.append(tokens[i] + tokens[i + 1])
                i += 2
            else:
                merged.append(tokens[i])
                i += 1
        tokens = merged
    return [vocab[t] for t in tokens]`,
    usedBy: 'ChatGPT (tiktoken o200k_base), Claude (custom BPE), Gemini (SentencePiece Unigram/BPE + multimodal patches)',
  },
  {
    id: 'rope-ring-attention',
    number: 2,
    name: 'Rotary Positional Embeddings (RoPE) & Ring Attention (2M Context)',
    category: 'Tokenization & Position',
    bottleneckType: 'Compute-Bound (FLOPS)',
    complexity: 'O(N · d) for RoPE; Ring Attention splits O(N²) across P chips -> O(N² / P)',
    plainEnglish:
      'Self-attention by itself is a bag-of-words—it does not know whether "dog bit man" or "man bit dog". RoPE rotates each token’s Query and Key vectors like clock hands at different speeds so their dot-product automatically encodes exact relative distance $(m - n)$. Ring Attention then lets 64 chips pass KV blocks in a circle to read 2M-token books!',
    formalDefinition:
      'RoPE applies a block-diagonal 2D rotation matrix $R_{\\Theta, m}^d$ to Query $q_m$ and Key $k_n$ such that $\\langle R_m q_m, R_n k_n \\rangle = q_m^\\top R_{n-m} k_n$ depends strictly on relative distance $n-m$. YaRN/NTK scaling stretches base frequency $\\theta$ for million-token windows; Ring Attention shards sequence blocks across $P$ devices overlapping ICI/NVLink KV transfers with local attention.',
    stepByStepLogic: [
      'Pair consecutive dimensions `(2i, 2i+1)` of every Query and Key head vector and compute rotation angle `theta_i = position * base^(-2i / d)`.',
      'Rotate each 2D coordinate `(x, y)` -> `(x cos θ - y sin θ, x sin θ + y cos θ)` in-place before computing `Q · K^T`.',
      'For 1M–2M context windows (Ring Attention), partition sequence $S$ into $P$ contiguous blocks across $P$ TPUs/GPUs.',
      'In $P$ ring rounds, each chip computes tiled FlashAttention between its local $Q_i$ and current $KV_j$ while asynchronously sending $KV_j$ to chip `(i+1) mod P`!',
    ],
    implementationCode: `def apply_rope(x, cos_cache, sin_cache, pos_offset: int):
    # x shape: [batch, heads, seq_len, head_dim]
    seq_len = x.shape[2]
    cos = cos_cache[pos_offset : pos_offset + seq_len]
    sin = sin_cache[pos_offset : pos_offset + seq_len]
    # Split even/odd pairs and apply 2D clock-hand rotation
    x_even, x_odd = x[..., 0::2], x[..., 1::2]
    rot_even = x_even * cos - x_odd * sin
    rot_odd  = x_even * sin + x_odd * cos
    return interleave(rot_even, rot_odd)

# Ring Attention Loop across P TPU/GPU chips (hides network latency behind compute!)
# for round in range(P):
#     send_async(kv_block, to=(rank + 1) % P); recv_async(next_kv, from=(rank - 1) % P)
#     out, lse = online_flash_attention_update(out, lse, q_local, kv_block)
#     kv_block = wait(next_kv)`,
    usedBy: 'Gemini (3D RoPE + Ring Attention 2M Context), ChatGPT, Claude, Llama 3/4, DeepSeek',
  },
  {
    id: 'gqa-mla',
    number: 3,
    name: 'Grouped-Query Attention (GQA) & Multi-Head Latent Attention (MLA)',
    category: 'Transformer & Attention',
    bottleneckType: 'Memory-Bandwidth-Bound (HBM)',
    complexity: 'Reduces KV-Cache memory & HBM reads by G× (8× to 16×)',
    plainEnglish:
      'In standard Multi-Head Attention, every query head stores its own giant Key/Value history—filling up 80GB of GPU VRAM with just a handful of users. GQA lets 8 Query heads share 1 single Key/Value head, shrinking the KV-cache 8x so a single GPU can serve 8x more concurrent chat streams!',
    formalDefinition:
      'Given $H_q$ query heads and $H_{kv}$ key/value heads ($H_{kv} \\ll H_q$, group ratio $g = H_q / H_{kv}$), GQA shares each $(K_j, V_j)$ across $g$ query heads. MLA goes further by projecting $K, V$ down into a tiny compressed latent vector $c_t^{KV}$ stored in KV-cache and up-projecting on the fly.',
    stepByStepLogic: [
      'Project hidden state $h_t$ into $H_q$ Query heads (e.g., 64 heads) but only $H_{kv}$ Key and Value heads (e.g., 8 heads).',
      'Append only the 8 Key/Value heads into the PagedAttention KV-Cache (cutting memory footprint & decode HBM bandwidth by 8x!).',
      'During attention dot-product, broadcast each KV head across its group of 8 Query heads inside fast on-chip SRAM without copying in HBM.',
      'Compute weighted sum of Values and concatenate all 64 output heads through projection $W_O$.',
    ],
    implementationCode: `# Grouped-Query Attention (e.g., 64 Q heads sharing 8 KV heads -> 8x smaller KV-cache)
def gqa_forward(h, Wq, Wk, Wv, kv_cache, num_q_heads=64, num_kv_heads=8):
    Q = (h @ Wq).reshape(B, T, num_q_heads, head_dim)
    K = (h @ Wk).reshape(B, T, num_kv_heads, head_dim)
    V = (h @ Wv).reshape(B, T, num_kv_heads, head_dim)

    K_all, V_all = kv_cache.append(K, V) # Stores only 8 heads instead of 64!
    group_size = num_q_heads // num_kv_heads # 8 Q heads per KV head
    # View/broadcast without materializing extra HBM copies in FlashAttention kernel:
    out = flash_attn_gqa(Q, K_all, V_all, group_size=group_size, causal=True)
    return out`,
    usedBy: 'Gemini, ChatGPT, Claude, Llama 3 (GQA), DeepSeek-V3/R1 (MLA)',
  },
  {
    id: 'flash-attention',
    number: 4,
    name: 'FlashAttention (IO-Aware Tiled SRAM Attention + Online Softmax)',
    category: 'Transformer & Attention',
    bottleneckType: 'Memory-Bandwidth-Bound (HBM)',
    complexity: 'O(N² · d) FLOPS, O(N) HBM Memory (eliminates O(N²) attention matrix in VRAM!)',
    plainEnglish:
      'Naive attention writes a huge $N \\times N$ score matrix to slow GPU HBM memory, then reads it back for Softmax, then writes it again. FlashAttention never creates that giant matrix in HBM at all—it loads tiny tiles of Q, K, V into ultra-fast on-chip GPU SRAM (19 TB/s!) and computes exact Softmax incrementally in one fused kernel.',
    formalDefinition:
      'FlashAttention partitions $Q, K, V$ into blocks fitting inside GPU SRAM ($M$) and computes exact scaled dot-product attention $\\text{softmax}(QK^\\top / \\sqrt{d})V$ in a single fused pass using the Online Safe Softmax recurrence $(m_{new}, \\ell_{new})$ to rescale running output accumulators without ever materializing $QK^\\top \\in \\mathbb{R}^{N\\times N}$ in HBM.',
    stepByStepLogic: [
      'Divide $Q$ into row tiles $Q_i$ and $K, V$ into column tiles $K_j, V_j$ sized to fit inside ~20MB on-chip GPU SRAM.',
      'For each $Q_i$ loaded once into SRAM, stream $K_j, V_j$ blocks from HBM and compute tile scores $S_{ij} = Q_i K_j^\\top / \\sqrt{d}$ directly in SRAM.',
      'Maintain running row-wise maximum $m_i$ and normalization denominator $\\ell_i$; rescale prior partial output $O_i$ by $e^{m_{old} - m_{new}}$ (Online Softmax) before adding $e^{S_{ij} - m_{new}} V_j$.',
      'Write ONLY the final tile $O_i$ back to HBM—achieving 3x–5x faster prefill and $O(N)$ memory instead of $O(N^2)$!',
    ],
    implementationCode: `# FlashAttention Core Loop (Runs inside GPU SRAM — ZERO N x N HBM Matrix!)
for Q_tile in split_tiles(Q, Br):                  # Load Q_tile to fast SRAM
    O = zeros(Br, d); m = full(Br, -inf); l = zeros(Br)
    for K_tile, V_tile in split_tiles(K, V, Bc):   # Stream K/V tiles to SRAM
        S = (Q_tile @ K_tile.T) / sqrt(d)          # Compute in SRAM
        m_tile = row_max(S)
        m_new  = max(m, m_tile)
        P      = exp(S - m_new)                    # Numerically stable
        alpha  = exp(m - m_new)
        l_new  = alpha * l + row_sum(P)
        O      = (O * (alpha * l) + P @ V_tile) / l_new
        m, l   = m_new, l_new
    write_to_hbm(O)                                # Only final O touches HBM!`,
    usedBy: 'Universal across ChatGPT (TensorRT-LLM), Gemini (TPU Pallas/SplashAttention), and Claude',
  },
  {
    id: 'sparse-moe',
    number: 5,
    name: 'Sparse Mixture-of-Experts (MoE Top-K Router & Load Balancing)',
    category: 'Transformer & Attention',
    bottleneckType: 'Compute-Bound (FLOPS)',
    complexity: 'Total Capacity = E × FFN, Active FLOPS per Token = K × FFN (e.g., K=2 of E=16)',
    plainEnglish:
      'Instead of forcing every single word through one massive 1-Trillion-parameter neural network, MoE splits the feed-forward brain into specialized "Experts" (math, Python, poetry, SQL). A lightweight Router reads each token and wakes up only the Top-2 best experts—giving trillion-parameter intelligence at small-model speed!',
    formalDefinition:
      'Replaces dense Transformer FFN layers with $E$ expert FFNs and a learned linear gating network $G(x) = \\text{Softmax}(\\text{TopK}(x W_g, k))$. Output is $y = \\sum_{i \\in \\text{TopK}} G(x)_i \\cdot \\text{FFN}_i(x)$, trained with an auxiliary load-balancing loss (or bias-free routing) to prevent expert collapse.',
    stepByStepLogic: [
      'Multiply each token’s hidden state $x$ by router matrix $W_g \\in \\mathbb{R}^{d \\times E}$ to score all $E$ experts.',
      'Select only the Top-$k$ experts (typically $k=2$) and normalize their weights via Softmax.',
      'Dispatch tokens across GPU/TPU chips hosting the chosen experts using high-speed All-to-All NVLink/ICI collectives.',
      'Run the chosen expert FFNs in parallel, gather results back via All-to-All, and combine with router weights $G(x)_i$.',
    ],
    implementationCode: `def sparse_moe_layer(x, router_W, experts, top_k=2):
    # x: [num_tokens, d_model]
    gate_logits = x @ router_W                          # [num_tokens, num_experts]
    top_vals, top_idx = topk(gate_logits, k=top_k)      # Pick best 2 experts per token
    top_weights = softmax(top_vals, dim=-1)             # Normalize weights

    output = zeros_like(x)
    for k in range(top_k):
        expert_ids = top_idx[:, k]
        weights = top_weights[:, k : k + 1]
        for e_id in unique(expert_ids):
            mask = (expert_ids == e_id)
            # Only matching tokens activate expert e_id (massive FLOPS savings!)
            output[mask] += weights[mask] * experts[e_id](x[mask])
    return output`,
    usedBy: 'Gemini (Sparse MoE), GPT-4/4o Frontier MoE, DeepSeek-V3/R1, Mixtral',
  },
  {
    id: 'paged-attention-radix',
    number: 6,
    name: 'PagedAttention (Virtual KV Memory) & Radix Prefix Caching',
    category: 'Serving & GPU Memory',
    bottleneckType: 'Memory-Bandwidth-Bound (HBM)',
    complexity: 'O(1) Block Table Lookup; cuts VRAM waste from ~65% down to <4%',
    plainEnglish:
      'Just like your Operating System uses Virtual Memory Pages so programs do not need one giant contiguous block of RAM, PagedAttention chops each user’s KV-cache into tiny 16-token blocks scattered anywhere in GPU VRAM. Shared system prompts point to the exact same physical blocks via a Radix Tree—saving gigabytes of memory!',
    formalDefinition:
      'Divides every sequence’s Key/Value tensors into fixed-size blocks of $B$ tokens (e.g., $B=16$) indexed by a per-request Block Table mapping logical blocks to physical HBM frames. RadixAttention / Automatic Prefix Caching indexes immutable prefix blocks in a prefix trie with LRU eviction and Copy-on-Write (CoW) for branching generations.',
    stepByStepLogic: [
      'When a request enters, walk the GPU scheduler’s Radix Prefix Tree with its token IDs to find the longest already-computed KV block prefix.',
      'Pin matched physical block IDs directly into the request’s Block Table and increment their reference counts (instant 0-FLOP prefix cache hit!).',
      'Allocate fresh 16-token physical KV blocks from the GPU Free Block Pool ONLY as new prompt/generated tokens fill the last block.',
      'When a request finishes, decrement ref-counts; keep popular system-prompt blocks warm in the LRU Radix Tree for future turns.',
    ],
    implementationCode: `class PagedKvManager:
    def __init__(self, total_physical_blocks: int, block_size: int = 16):
        self.free_blocks = list(range(total_physical_blocks))
        self.prefix_hash_to_block: dict[str, int] = {}
        self.ref_count: dict[int, int] = {}

    def allocate_for_tokens(self, token_ids: list[int]) -> list[int]:
        block_table, prefix_hash = [], "ROOT"
        for i in range(0, len(token_ids), 16):
            chunk = tuple(token_ids[i : i + 16])
            prefix_hash = sha256(f"{prefix_hash}:{chunk}")
            if len(chunk) == 16 and prefix_hash in self.prefix_hash_to_block:
                phys = self.prefix_hash_to_block[prefix_hash]  # Instant Prefix Cache HIT!
            else:
                phys = self.free_blocks.pop()                  # Allocate non-contiguous HBM frame
                if len(chunk) == 16:
                    self.prefix_hash_to_block[prefix_hash] = phys
            self.ref_count[phys] = self.ref_count.get(phys, 0) + 1
            block_table.append(phys)
        return block_table`,
    usedBy: 'ChatGPT (Automatic Prefix Cache), Claude (Explicit Cache Breakpoints), vLLM, SGLang, TensorRT-LLM',
  },
  {
    id: 'continuous-batching-disagg',
    number: 7,
    name: 'Continuous Batching & Disaggregated Prefill / Decode Serving',
    category: 'Serving & GPU Memory',
    bottleneckType: 'Memory-Bandwidth-Bound (HBM)',
    complexity: '4×–10× higher GPU throughput vs Static Batching; eliminates TTFT/ITL interference',
    plainEnglish:
      'In old static batching, if User A asks for a 5-word answer and User B asks for a 2,000-word essay, User A’s GPU slot sits completely idle waiting for User B! Continuous Batching swaps in a new user the exact millisecond someone hits `<EOS>`, while Disaggregated Serving puts heavy prompt-reading (Prefill) on separate GPUs from smooth token-streaming (Decode).',
    formalDefinition:
      'Iteration-Level (Orca) Scheduling inserts new requests and evicts finished sequences after EVERY single autoregressive decode step rather than per-batch. Disaggregated Serving decouples Compute-Bound Prefill instances from Memory-Bandwidth-Bound Decode instances, transferring KV blocks over RDMA/NVLink to guarantee both low TTFT and low p99 ITL.',
    stepByStepLogic: [
      'Route incoming prompt to a **Prefill Pool** (optimized for high tensor-core throughput) to compute initial KV blocks in one parallel pass.',
      'Transfer the resulting PagedAttention KV blocks over InfiniBand/RDMA/ICI to a **Decode Pool** worker with free HBM slots.',
      'At EVERY single decode iteration (~20ms), the scheduler packs up to 128–256 active users’ single-token steps into one batched GPU weight read.',
      'The instant any user generates `<EOS>` or hits `max_tokens`, evict them on that exact iteration and immediately admit the next waiting request!',
    ],
    implementationCode: `# Iteration-Level Continuous Batching Scheduler (Runs every ~20ms!)
while True:
    # 1. Evict completed requests immediately (zero idle bubble!)
    for req in list(running_batch):
        if req.last_token == EOS_ID or req.generated >= req.max_tokens:
            kv_manager.release(req.block_table)
            sse_broker.finish(req.id)
            running_batch.remove(req)

    # 2. Admit newly prefilled requests if HBM block budget allows
    while prefilled_queue and kv_manager.can_fit(prefilled_queue[0]):
        running_batch.append(prefilled_queue.popleft())

    # 3. Single forward pass reads model weights ONCE for ALL active users!
    next_tokens = gpu_decode_step(running_batch)
    for req, tok in zip(running_batch, next_tokens):
        req.append_token(tok)
        sse_broker.flush_delta(req.id, tok)  # Float token to client immediately!`,
    usedBy: 'ChatGPT, Google Gemini, Anthropic Claude, vLLM, TensorRT-LLM, SGLang',
  },
  {
    id: 'speculative-decoding',
    number: 8,
    name: 'Speculative Decoding (Draft-Model Parallel Verification)',
    category: 'Serving & GPU Memory',
    bottleneckType: 'Memory-Bandwidth-Bound (HBM)',
    complexity: '2×–3× faster token/sec with 100% MATHEMATICALLY IDENTICAL output distribution',
    plainEnglish:
      'Decoding 1 token at a time wastes 95% of a GPU’s math power just waiting to read model weights from memory. Speculative Decoding lets a tiny ultra-fast "Draft Model" guess the next 5 easy words ("of the United States"), and the giant Frontier Model verifies ALL 5 guesses simultaneously in ONE single pass—accepting 3–4 words per step with zero quality loss!',
    formalDefinition:
      'A fast draft model $q(x)$ (or Medusa/EAGLE speculative head) proposes $\\gamma$ lookahead tokens $x_1,\\dots,x_\\gamma$. The target model $p(x)$ evaluates all $\\gamma+1$ positions in a single parallel forward pass and applies rejection sampling (accept $x_t$ with probability $\\min(1, p(x_t)/q(x_t))$, else resample from $\\text{norm}(\\max(0, p - q))$), provably preserving the exact target distribution $p(x)$.',
    stepByStepLogic: [
      'Run the tiny Draft Model (or EAGLE lightweight head) $\\gamma=5$ steps quickly (~2ms total) to propose draft tokens `[t1, t2, t3, t4, t5]`.',
      'Pass all 5 draft tokens together into the Giant Target Model in ONE parallel forward pass (takes almost the same HBM read time as 1 token!).',
      'Check each draft token left-to-right: accept if target probability agrees (`u < p(ti) / q(ti)`); on first mismatch, sample a corrected token from `max(0, p - q)`.',
      'Emit all accepted tokens + 1 bonus token at once—streaming 3–5 tokens to the client per target-model weight read!',
    ],
    implementationCode: `def speculative_decode_step(prefix, draft_model, target_model, gamma=5):
    draft_tokens, draft_probs = draft_model.propose(prefix, steps=gamma)
    # Verify ALL gamma tokens in ONE single parallel pass of the giant target model!
    target_probs = target_model.forward_parallel(prefix + draft_tokens)

    accepted = []
    for i, tok in enumerate(draft_tokens):
        p, q = target_probs[i][tok], draft_probs[i][tok]
        if random.random() < min(1.0, p / max(q, 1e-9)):
            accepted.append(tok)
        else:
            # Lossless rejection correction guarantees exact target distribution!
            corrected = sample(normalize(maximum(0.0, target_probs[i] - draft_probs[i])))
            accepted.append(corrected)
            return accepted
    # All gamma accepted -> sample 1 extra bonus token for free!
    accepted.append(sample(target_probs[gamma]))
    return accepted`,
    usedBy: 'OpenAI ChatGPT, Google Gemini Flash/Pro, Anthropic Claude (fast coding/boilerplate generation)',
  },
  {
    id: 'logit-sampling',
    number: 9,
    name: 'Autoregressive Logit Decoding (Temperature, Top-K, Top-P & Constrained FSM)',
    category: 'Decoding & Client Stream',
    bottleneckType: 'Compute-Bound (FLOPS)',
    complexity: 'O(V log V) sort over vocabulary V (e.g., 200K logits on GPU)',
    plainEnglish:
      'At the end of the Transformer, the model outputs 200,000 raw scores (logits)—one for every word in its dictionary. Temperature controls creativity, Top-P (Nucleus) chops off weird unlikely tail words, and Constrained FSM masks out illegal characters when you demand strict JSON!',
    formalDefinition:
      'Scales raw vocabulary logits $z \\in \\mathbb{R}^V$ by temperature $T$ ($p_i = \\frac{\\exp(z_i/T)}{\\sum_j \\exp(z_j/T)}$), masks tokens violating any active JSON/Grammar Finite-State Machine to $-\\infty$, truncates to the smallest nucleus set $S$ with $\\sum_{i \\in S} p_i \\ge p_{top}$, re-normalizes, and draws the next token $y_t \\sim \\text{Categorical}(S)$.',
    stepByStepLogic: [
      'Apply **Constrained FSM / Grammar Mask** (if Structured JSON Output is active): set logits of any syntactically invalid next token to `-Infinity`.',
      'Divide logits by **Temperature $T$** ($T \\to 0$ becomes deterministic greedy argmax; $T > 1$ flattens probabilities for creative brainstorming).',
      'Compute Softmax probabilities, sort descending, keep Top-$K$ candidates, then keep the minimal prefix whose cumulative mass reaches **Top-$P$** (e.g., 0.90).',
      'Sample 1 integer token ID from the filtered distribution and immediately hand it to the Detokenizer & SSE Flusher.',
    ],
    implementationCode: `def sample_next_token(logits, temperature=0.7, top_p=0.9, fsm_allowed_mask=None):
    if fsm_allowed_mask is not None:
        logits = where(fsm_allowed_mask, logits, -1e9)  # Structured JSON guarantee!
    if temperature <= 1e-5:
        return int(argmax(logits))                      # Deterministic Greedy

    scaled = logits / temperature
    probs = softmax(scaled)
    sorted_idx = argsort_desc(probs)
    cum_probs = cumsum(probs[sorted_idx])
    # Nucleus (Top-P) cutoff: drop low-probability hallucination tail
    cutoff = searchsorted(cum_probs, top_p) + 1
    nucleus_idx = sorted_idx[:cutoff]
    nucleus_probs = probs[nucleus_idx] / sum(probs[nucleus_idx])
    return int(random_choice(nucleus_idx, p=nucleus_probs))`,
    usedBy: 'All Frontier LLMs (ChatGPT Structured Outputs, Gemini responseSchema, Claude Tool-Use JSON)',
  },
  {
    id: 'client-token-float',
    number: 10,
    name: 'Client Connection & Wire-to-DOM Token Float (HTTP/2 SSE & ReadableStream)',
    category: 'Decoding & Client Stream',
    bottleneckType: 'Network / I/O Stream',
    complexity: 'O(1) per token chunk (~15–30ms inter-token cadence, <5ms wire flush)',
    plainEnglish:
      'Why do ChatGPT, Gemini, and Claude words appear smoothly one-by-one instead of freezing for 15 seconds? Because the server holds ONE HTTP/2 response open (`text/event-stream`), turns off proxy buffering (`X-Accel-Buffering: no`), and pushes every single generated token down the wire immediately—where your browser’s `ReadableStream` decodes UTF-8 incrementally and paints at 60fps!',
    formalDefinition:
      'Establishes a persistent multiplexed HTTP/2 (or HTTP/3 QUIC) stream with `Content-Type: text/event-stream`, disables Nagle/proxy buffering (`TCP_NODELAY`, `X-Accel-Buffering: no`), frames each detokenized UTF-8 delta into `data: <json>\\n\\n`, and consumes byte chunks asynchronously on the client via Fetch `ReadableStreamDefaultReader` + streaming `TextDecoder` + `AbortController` cancellation.',
    stepByStepLogic: [
      'Client executes `fetch("/api/chat", { method: "POST", signal: abortController.signal })` over a persistent TLS 1.3 + HTTP/2 connection.',
      'Server flushes `200 OK` headers immediately (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`) BEFORE the first token finishes.',
      'Every ~20ms, GPU Decode emits a token ID -> Detokenizer handles split multi-byte UTF-8 characters (like emojis split across 2 tokens) -> Server calls `res.write("data: {...}\\n\\n")`.',
      'Browser `reader.read()` receives raw `Uint8Array` TCP/QUIC packets -> `decoder.decode(chunk, { stream: true })` preserves split UTF-8 bytes -> splits on `\\n\\n` SSE boundaries -> updates React UI inside animation frames; clicking "Stop" fires `abortController.abort()`, which signals the GPU scheduler to stop burning FLOPS immediately!',
    ],
    implementationCode: `// === CLIENT: How Tokens Float From Network Bytes -> Smooth Browser UI ===
const controller = new AbortController();
const res = await fetch("/api/llm/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
  signal: controller.signal, // "Stop Generating" cancels GPU decode immediately!
  body: JSON.stringify({ prompt, stream: true }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder("utf-8"); // { stream: true } prevents broken emojis!
let sseBuffer = "";

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  sseBuffer += decoder.decode(value, { stream: true });

  const frames = sseBuffer.split("\\n\\n");
  sseBuffer = frames.pop() ?? ""; // Keep incomplete trailing frame for next TCP packet

  for (const frame of frames) {
    const line = frame.split("\\n").find((l) => l.startsWith("data: "));
    if (!line || line === "data: [DONE]") continue;
    const { delta } = JSON.parse(line.slice(6));
    appendTokenToUi(delta); // Smooth 60fps incremental Markdown render!
  }
}`,
    usedBy: 'ChatGPT Web/API, Google Gemini AI Studio/API, Anthropic Claude Web/Messages API',
  },
];

export const CLIENT_TOKEN_STREAMING_STAGES: ClientTokenStage[] = [
  {
    stage: 1,
    title: 'Persistent HTTP/2 / QUIC Handshake & Auth',
    protocolLayer: 'TLS 1.3 + Anycast Edge',
    whatHappens: 'Browser/SDK connects to nearest edge PoP (10–25ms RTT) using an existing multiplexed HTTP/2 or HTTP/3 connection.',
    engineeringDetail: 'Edge verifies JWT/API Key, estimates prompt token length, checks Redis Lua RPM/TPM limits, and passes Abort/Disconnect propagation headers downstream.',
  },
  {
    stage: 2,
    title: 'Zero-Buffering SSE Response Header Flush',
    protocolLayer: 'L7 Proxy (Envoy / Nginx)',
    whatHappens: 'Backend immediately returns `HTTP 200 OK` with `Content-Type: text/event-stream` and `X-Accel-Buffering: no`.',
    engineeringDetail: 'Without disabling proxy & gzip buffering, Nginx/Cloudflare buffers 4KB–32KB before sending bytes—destroying the perceived real-time streaming experience!',
  },
  {
    stage: 3,
    title: 'Prefix KV-Cache Hit + Disaggregated Prefill (TTFT)',
    protocolLayer: 'GPU / TPU Compute Pool',
    whatHappens: 'Tokenizer maps prompt to IDs, Prefix Router hits warm KV blocks, and Prefill GPUs compute attention for new tokens in parallel.',
    engineeringDetail: 'Time-To-First-Token (TTFT) = Edge RTT + Queue Wait + Uncached Prefill time. Prefix caching drops TTFT from ~1,200ms down to ~180ms.',
  },
  {
    stage: 4,
    title: 'Autoregressive Decode -> UTF-8 Safe Detokenizer',
    protocolLayer: 'Continuous Batch Worker',
    whatHappens: 'Every ~18–25ms, Decode GPU emits 1 integer token ID (or 3–5 via Speculative Decoding) into the per-user output queue.',
    engineeringDetail: 'A single 4-byte emoji can span 2 BPE tokens! The streaming detokenizer buffers incomplete UTF-8 byte sequences until valid Unicode completes so `` replacement glyphs never flicker.',
  },
  {
    stage: 5,
    title: 'SSE Frame Serialization & Immediate Socket Flush',
    protocolLayer: 'TCP_NODELAY / HTTP/2 DATA',
    whatHappens: 'Server writes `data: {"delta":"token"}\\n\\n` and flushes the socket immediately (plus periodic `: ping` keep-alives).',
    engineeringDetail: 'If the user clicks "Stop Generating" or closes the tab, the `req.on("close")` TCP FIN/RST propagates via gRPC cancellation to abort GPU decoding and free KV blocks instantly!',
  },
  {
    stage: 6,
    title: 'Browser ReadableStream -> Incremental 60fps Render',
    protocolLayer: 'Fetch Streams + React DOM',
    whatHappens: 'Client reads `Uint8Array` chunks, stitches partial SSE lines across TCP packets, and appends tokens to an incremental Markdown renderer.',
    engineeringDetail: 'Batching DOM updates to `requestAnimationFrame` (~16ms) prevents layout thrashing at 100+ tokens/sec while keeping scrolling silky smooth.',
  },
];

export const PLATFORM_COMPARISON_ROWS: Array<{
  dimension: string;
  chatgpt: string;
  gemini: string;
  claude: string;
}> = [
  {
    dimension: 'Primary Accelerator Fabric',
    chatgpt: 'NVIDIA H100 / GB200 NVLink + InfiniBand RDMA',
    gemini: 'Google TPU v5p / Trillium 3D Torus + Optical Circuit Switches',
    claude: 'Multi-Cloud AWS Trainium2 + Google TPU + NVIDIA H100',
  },
  {
    dimension: 'Tokenization & Multimodality',
    chatgpt: 'tiktoken BPE (o200k_base) + native audio/vision tokens',
    gemini: 'SentencePiece (256K) + Unified Native Video/Audio/Image/Text',
    claude: 'Code-tuned Byte-Level BPE + Vision & PDF block encoders',
  },
  {
    dimension: 'Long Context & KV Caching',
    chatgpt: 'Automatic Prefix KV Caching + PagedAttention blocks',
    gemini: 'Ring Attention (1M–2M Context) + Explicit Context Caching',
    claude: 'Explicit `cache_control` Breakpoints (5m/1h TTL, 90% discount)',
  },
  {
    dimension: 'Reasoning / Test-Time Compute',
    chatgpt: 'Hidden/Summarized Reasoning Tokens (o-series)',
    gemini: 'Configurable `thinkingLevel` + Thought Signatures',
    claude: 'Streamed `thinking_delta` Extended Thinking Blocks',
  },
  {
    dimension: 'Client Streaming Wire Format',
    chatgpt: 'HTTP/2 SSE `chat.completion.chunk` + `[DONE]` & Realtime WS',
    gemini: 'HTTP/2 SSE `streamGenerateContent` + Bidirectional Live API WS',
    claude: 'Typed SSE State Machine (`content_block_start/delta/stop`)',
  },
  {
    dimension: 'Structured Output & Tooling',
    chatgpt: 'FSM Grammar-Constrained JSON Schema + Tool Calls',
    gemini: 'Constrained `responseSchema` + Search/Maps Grounding + Tools',
    claude: 'Streaming `input_json_delta` Tool-Use & Computer-Use Loop',
  },
];
