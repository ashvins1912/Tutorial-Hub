import type { AiEngineeringPhase, AiPhaseId } from './aiEngineeringData';
import type { AcademyLesson } from '../features/ai-academy/data/aiEngineeringCurriculum';

export interface AiPhaseDeepSpec {
  formalDefinition: string;
  architectureBlueprint: string;
  keyBottleneckAndMitigation: string;
}

export interface AiPatternDeepSpec {
  formalDefinition: string;
  algorithmLanguage: 'python' | 'typescript';
  algorithmCode: string;
  implementationSteps: string[];
  mermaidDfd: string;
}

function cleanLabel(text: string, maxLen = 58): string {
  const cleaned = text
    .replace(/"/g, "'")
    .replace(/[[\](){}]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLen ? `${cleaned.slice(0, maxLen - 1)}…` : cleaned;
}

/* -------------------------------------------------------------------------- */
/* 1. Dynamic Mermaid.js DFD Builder for all 5 AI Engineering Phases          */
/* -------------------------------------------------------------------------- */

export function buildAiPhaseMermaidDfd(phase: AiEngineeringPhase): string {
  const ordered = [...phase.dfdNodes].sort((a, b) => a.stepOrder - b.stepOrder);
  const nodeLines = ordered.map((n) => {
    const id = n.id.replace(/[^a-zA-Z0-9_]/g, '_');
    const lbl = cleanLabel(`${n.label} - ${n.shortRole}`);
    if (n.kind === 'store') return `  ${id}[("${lbl}")]`;
    return `  ${id}["${lbl}"]`;
  });

  const edgeLines = phase.dfdEdges.map((e) => {
    const from = e.from.replace(/[^a-zA-Z0-9_]/g, '_');
    const to = e.to.replace(/[^a-zA-Z0-9_]/g, '_');
    const lbl = e.label ? cleanLabel(e.label, 34) : 'Data Flow';
    return `  ${from} -->|"${lbl}"| ${to}`;
  });

  return `flowchart LR\n${nodeLines.join('\n')}\n${edgeLines.join('\n')}`;
}

/* -------------------------------------------------------------------------- */
/* 2. Dynamic Step-Highlighted Mermaid DFD Builder for ALL AI Academy Lessons */
/* -------------------------------------------------------------------------- */

export function buildAcademyLessonMermaidDfd(
  lesson: AcademyLesson,
  activeStepIdx: number | null = null
): string {
  const steps = lesson.steps && lesson.steps.length > 0 ? lesson.steps : [];
  if (steps.length === 0) {
    return `flowchart LR\n  IN["Raw Input"] -->|"Process"| CORE["${cleanLabel(lesson.title)}"]\n  CORE -->|"Output"| OUT["Validated Result"]`;
  }

  const lines: string[] = ['flowchart LR'];
  lines.push(`  SRC["Input: ${cleanLabel(steps[0].input, 36)}"]`);

  steps.forEach((st, idx) => {
    const nodeId = `S${idx + 1}`;
    lines.push(`  ${nodeId}["${idx + 1}. ${cleanLabel(st.title, 38)}"]`);
  });

  const lastStep = steps[steps.length - 1];
  lines.push(`  OUT["Output: ${cleanLabel(lastStep.output, 36)}"]`);

  // Connect source -> S1 -> S2 -> ... -> OUT
  lines.push(`  SRC -->|"Feed"| S1`);
  for (let i = 0; i < steps.length - 1; i++) {
    const edgeLbl = cleanLabel(steps[i].output, 28) || 'Next Stage';
    lines.push(`  S${i + 1} -->|"${edgeLbl}"| S${i + 2}`);
  }
  lines.push(`  S${steps.length} -->|"Emit"| OUT`);

  // Failure guardrail branch on active step (or first step)
  const focusIdx = activeStepIdx !== null && activeStepIdx >= 0 && activeStepIdx < steps.length ? activeStepIdx : 0;
  const focusStep = steps[focusIdx];
  if (focusStep?.failure) {
    lines.push(`  ERR["Guardrail Check: ${cleanLabel(focusStep.failure, 40)}"]`);
    lines.push(`  S${focusIdx + 1} -.->|"Failure Mode"| ERR`);
  }

  // Apply live highlighting styles when stepping through
  if (activeStepIdx !== null && activeStepIdx >= 0 && activeStepIdx < steps.length) {
    for (let i = 0; i < activeStepIdx; i++) {
      lines.push(`  style S${i + 1} fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px`);
    }
    lines.push(`  style S${activeStepIdx + 1} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`);
  }

  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* 3. Complete Formal Definitions for all 5 AI Engineering Studio Phases      */
/* -------------------------------------------------------------------------- */

export const AI_PHASE_DEEP_SPECS: Record<AiPhaseId, AiPhaseDeepSpec> = {
  'phase-1-foundations': {
    formalDefinition:
      'Data Engineering & Numerical Foundations transform raw heterogeneous records into schema-validated, normalized dense tensors X ∈ R^(N×d) in contiguous C/SIMD memory while enforcing zero train/test data leakage via fit-on-train-only statistical transformers.',
    architectureBlueprint:
      'Raw CSV/JSON/API streams pass through deterministic Pydantic/Pandera schema validation (quarantining corrupt rows to a Dead Letter Queue), vectorized NumPy/Polars feature pipelines, and leak-free train-split scalers before entering model memory.',
    keyBottleneckAndMitigation:
      'Python interpreter loop overhead and silent schema drift stall pipelines 50–100×; replace row loops with contiguous SIMD/BLAS array ops and enforce versioned schema contracts at ingestion.',
  },
  'phase-2-classical-ml': {
    formalDefinition:
      'Classical Statistical Learning optimizes parametric or tree-partitioned hypothesis functions f_θ: R^d → Y via empirical risk minimization L(θ) + λ·R(θ), balancing bias-variance trade-offs under strict stratified or temporal cross-validation.',
    architectureBlueprint:
      'Leakage-safe sklearn/LightGBM pipelines combine ColumnTransformers, histogram-based split finders, out-of-fold validation scoring (PR-AUC / RMSE), and calibrated decision thresholds aligned to real business misclassification costs.',
    keyBottleneckAndMitigation:
      'Target leakage and optimizing raw accuracy on imbalanced datasets produce illusory offline gains; isolate all fitted transformers inside CV folds and optimize PR-AUC with cost-weighted thresholds.',
  },
  'phase-3-deep-learning': {
    formalDefinition:
      'Deep Representation Learning composes differentiable parameterized layers f_L ∘ … ∘ f_1(x) trained via reverse-mode automatic differentiation (backpropagation) and adaptive momentum optimizers (AdamW) over GPU tensor cores with residual skip pathways and normalization.',
    architectureBlueprint:
      'Tokenized batches stream through pinned host memory to GPU HBM, execute mixed-precision (BF16) forward passes with Multi-Head Self-Attention and FlashAttention SRAM tiling, compute cross-entropy loss, and backpropagate clipped gradients across distributed workers.',
    keyBottleneckAndMitigation:
      'O(N²) attention memory footprint and vanishing/exploding gradients limit context length and stability; apply FlashAttention tiling, Pre-LayerNorm residual paths, cosine LR warmup, and gradient clipping.',
  },
  'phase-4-genai-rag': {
    formalDefinition:
      'Production Retrieval-Augmented Generation & Agentic Systems ground autoregressive LLM generation P(y_t | y_<t, C) on dynamically retrieved evidence C = Rerank(BM25(q) ∪ ANN(E(q))) and bounded ReAct tool-execution loops verified by automated faithfulness evaluators.',
    architectureBlueprint:
      'User queries traverse PII/injection guardrails, execute parallel sparse BM25 + dense HNSW vector retrieval fused via Reciprocal Rank Fusion (RRF), pass through a Cross-Encoder reranker, invoke sandboxed tool calls, and stream grounded citations via SSE.',
    keyBottleneckAndMitigation:
      'Vector-only retrieval misses exact identifiers/SKUs while unguarded agent loops burn tokens indefinitely; pair BM25+HNSW+Reranker with strict step/token budgets and automated Ragas faithfulness gates.',
  },
  'phase-5-mlops': {
    formalDefinition:
      'Production MLOps & Inference Serving operationalize trained models as deterministic, versioned artifacts under strict latency/cost SLOs via post-training quantization, semantic caching, tiered model routing, progressive canary rollouts, and continuous distribution-drift telemetry.',
    architectureBlueprint:
      'Edge API gateways authenticate requests, check Redis semantic caches, route easy vs. hard prompts across quantized small/frontier vLLM pools behind canary traffic splits, and stream latency, token-cost, and PSI feature-drift metrics to automated rollback monitors.',
    keyBottleneckAndMitigation:
      'Unquantized FP16 weights exhaust GPU HBM bandwidth during decode while silent concept drift degrades accuracy post-launch; combine AWQ/FP8 quantization, continuous batching, semantic caching, and automated PSI/canary alarms.',
  },
};

/* -------------------------------------------------------------------------- */
/* 4. Complete Deep Specs for ALL 20 AI Algorithm Patterns                    */
/* -------------------------------------------------------------------------- */

export const AI_PATTERN_DEEP_SPECS: Record<string, AiPatternDeepSpec> = {
  /* ==================== PHASE 1: FOUNDATIONS ==================== */
  'pat-vectorization': {
    formalDefinition:
      'SIMD (Single Instruction, Multiple Data) Vectorization executes one CPU vector instruction (AVX-2 / AVX-512 / NEON) across 4–16 packed contiguous floating-point elements per clock cycle, eliminating Python bytecode dispatch and boxed PyObject pointer chasing.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

# Contiguous C-order float32 matrix: shape (100_000, 64)
X = np.random.randn(100_000, 64).astype(np.float32)
w = np.random.randn(64).astype(np.float32)

# Single BLAS sgemv call in C/AVX-512 (no Python loop overhead)
scores = X @ w                         # O(N * d) vectorized dot products
activated = np.maximum(0.0, scores)    # Fused SIMD ReLU over contiguous buffer`,
    implementationSteps: [
      'Allocate arrays in contiguous C-order float32 buffers so CPU hardware prefetchers stream full 64-byte cache lines into L1/L2.',
      'Replace per-element Python loops with NumPy/BLAS primitives (`@`, ufuncs) that dispatch straight into compiled OpenBLAS/MKL AVX kernels.',
      'Avoid accidental copies from non-contiguous slices or mixed dtypes (`object` arrays silently fall back to slow Python loops).',
    ],
    mermaidDfd: `flowchart LR
  RAW["Python Lists / JSON"] -->|"np.asarray float32"| BUF["Contiguous C Buffer"]
  BUF -->|"Cache-Line Prefetch"| SIMD["AVX-512 / BLAS Kernel"]
  SIMD -->|"Fused Matrix Op"| OUT["Output Tensor"]`,
  },

  'pat-scaling': {
    formalDefinition:
      'Feature Normalization maps raw columns x_j into comparable numerical ranges—Z-Score Standardization z = (x - μ_train) / σ_train or Min-Max Scaling x\' = (x - x_min) / (x_max - x_min)—using statistics fit strictly on the training split to prevent data leakage and ill-conditioned Hessians.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

class LeakFreeStandardScaler:
    def fit(self, X_train: np.ndarray):
        self.mean_ = X_train.mean(axis=0)
        self.std_ = np.where(X_train.std(axis=0) == 0, 1.0, X_train.std(axis=0))
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        return (X - self.mean_) / self.std_

# Fit ONLY on training split; reuse frozen mean_/std_ for val, test & prod!
scaler = LeakFreeStandardScaler().fit(X_train)
X_val_norm = scaler.transform(X_val)`,
    implementationSteps: [
      'Split dataset temporally or stratified BEFORE computing any column mean, standard deviation, or min/max.',
      'Guard zero-variance columns (`std == 0 -> 1.0`) to prevent NaN division explosions in production inference.',
      'Serialize fitted `(mean_, std_)` inside the model artifact so online inference applies identical scaling.',
    ],
    mermaidDfd: `flowchart LR
  SPLIT["Train / Val Split"] -->|"X_train Only"| FIT["Fit Mean and Std"]
  FIT -->|"Frozen Stats Artifact"| TR["Transform Val / Prod"]
  TR -->|"Zero-Mean Unit-Var"| MODEL["Distance or Gradient Model"]`,
  },

  'pat-cosine': {
    formalDefinition:
      'Cosine Similarity computes the normalized inner product cos(θ) = (A · B) / (‖A‖₂ · ‖B‖₂) ∈ [-1, 1], measuring directional alignment in R^d independent of vector magnitude. Pre-normalizing vectors to unit L2 norm reduces cosine search to pure matrix multiplication (GEMM).',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def top_k_cosine(query: np.ndarray, corpus: np.ndarray, k: int = 5):
    # Pre-normalize rows to unit L2 length (add eps to prevent /0)
    q_unit = query / (np.linalg.norm(query) + 1e-12)
    c_unit = corpus / (np.linalg.norm(corpus, axis=1, keepdims=True) + 1e-12)
    sims = c_unit @ q_unit                        # O(N * d) single BLAS call
    top_idx = np.argpartition(sims, -k)[-k:]      # O(N) partial selection vs O(N log N) sort
    return top_idx[np.argsort(sims[top_idx])[::-1]]`,
    implementationSteps: [
      'L2-normalize corpus embeddings once at index build time so query-time scoring requires only dot products.',
      'Add `1e-12` epsilon to denominator norms to prevent NaN outputs on empty or zero vectors.',
      'Use `argpartition` (`O(N)`) instead of full sort (`O(N log N)`) for exact Top-K extraction, or HNSW for >100k vectors.',
    ],
    mermaidDfd: `flowchart LR
  Q["Query Embedding"] -->|"L2 Normalize"| QU["Unit Query Vector"]
  DB[("Unit Corpus Matrix")] -->|"BLAS GEMM Dot"| SC["Similarity Scores"]
  QU -->|"Matrix Multiply"| SC
  SC -->|"argpartition Top-K"| RES["Ranked Matches"]`,
  },

  'pat-imputation': {
    formalDefinition:
      'Robust Imputation with Missingness Indicators replaces missing entries x_ij = NaN using distribution-robust training statistics (median / group median) while concatenating a binary mask m_ij = I(x_ij is NaN) so downstream models preserve Missing-Not-At-Random (MNAR) signal.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def fit_transform_robust_impute(X_train: np.ndarray, X_eval: np.ndarray):
    medians = np.nanmedian(X_train, axis=0)
    def apply(X):
        missing_mask = np.isnan(X).astype(np.float32)  # Preserve MNAR signal!
        filled = np.where(np.isnan(X), medians, X)
        return np.hstack([filled, missing_mask])
    return apply(X_train), apply(X_eval)`,
    implementationSteps: [
      'Compute column medians strictly on `X_train`—median resists extreme skew and corrupt outlier spikes unlike mean.',
      'Generate explicit binary missingness indicator columns BEFORE filling NaNs so models learn when absence itself predicts fraud or churn.',
      'Audit missingness rate over time in production; sudden spikes signal upstream sensor or ETL pipeline breakage.',
    ],
    mermaidDfd: `flowchart LR
  RAW["Raw Feature Matrix"] -->|"Check NaN"| MASK["Binary Missing Mask"]
  RAW -->|"Train Medians"| FILL["Median Imputed Values"]
  MASK -->|"Horizontal Concat"| FEAT["Leak-Free Feature Tensor"]
  FILL -->|"Horizontal Concat"| FEAT`,
  },

  /* ==================== PHASE 2: CLASSICAL ML ==================== */
  'pat-linear-margin': {
    formalDefinition:
      'Regularized Linear/Logistic Models & SVMs minimize convex empirical loss plus L2/L1 penalty: min_w Σ L(y_i, wᵀx_i + b) + λ‖w‖², yielding globally optimal hyperplanes with O(d) microsecond inference and interpretable feature weights.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def logistic_step_l2(X: np.ndarray, y: np.ndarray, w: np.ndarray, b: float, lr=0.05, lam=1e-3):
    logits = np.clip(X @ w + b, -30, 30)
    probs = 1.0 / (1.0 + np.exp(-logits))
    err = probs - y
    grad_w = (X.T @ err) / len(y) + lam * w   # L2 weight decay shrinks collinear weights
    grad_b = err.mean()
    return w - lr * grad_w, b - lr * grad_b`,
    implementationSteps: [
      'Clip logits to `[-30, 30]` before applying sigmoid to avoid IEEE-754 floating-point overflow in `exp(-z)`.',
      'Apply L2 regularization (`lam * w`) on weights (never on bias `b`) to stabilize collinear features and prevent overfitting.',
      'Calibrate decision thresholds on validation PR curves based on actual false-positive vs. false-negative business cost.',
    ],
    mermaidDfd: `flowchart LR
  X["Scaled Features X"] -->|"wT x + b"| LOGIT["Linear Score"]
  LOGIT -->|"Sigmoid 1 / 1+e^-z"| PROB["Calibrated Probability"]
  PROB -->|"Cost Threshold T"| DEC["Class Decision"]
  PROB -.->|"BCE + L2 Grad"| OPT["Weight Update"]`,
  },

  'pat-tree-ensembles': {
    formalDefinition:
      'Gradient Boosted Decision Trees (XGBoost / LightGBM) construct an additive ensemble F_M(x) = Σ η·h_m(x) sequentially by fitting each regularized tree h_m to first- and second-order Taylor gradients (g_i, h_i) of the loss over quantized feature histograms.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def xgb_split_gain(g_left, h_left, g_right, h_right, lam=1.0, gamma=0.1):
    # Second-order Newton leaf weight formula: w* = -G / (H + lambda)
    def score(G, H): return (G * G) / (H + lam)
    gain = 0.5 * (score(g_left, h_left) + score(g_right, h_right)
                  - score(g_left + g_right, h_left + h_right)) - gamma
    return gain  # Split only if gain > 0`,
    implementationSteps: [
      'Bin continuous features into 256 discrete histogram buckets once so split evaluation scans O(256) bins instead of sorting O(N log N) values.',
      'Compute per-sample gradient `g_i` and Hessian `h_i` from the current ensemble prediction, then choose splits maximizing regularized Newton gain.',
      'Control overfitting via `learning_rate`, `max_depth` / `num_leaves`, `min_child_weight`, and early stopping on a validation fold.',
    ],
    mermaidDfd: `flowchart LR
  DATA["Tabular Features"] -->|"256-Bin Quantize"| HIST["Feature Histograms"]
  HIST -->|"Max Newton Gain"| TREE["Fit Residual Tree h_m"]
  TREE -->|"Add eta * h_m"| ENS["Additive Ensemble F_m"]
  ENS -.->|"New Gradients g, h"| HIST`,
  },

  'pat-distance-cluster': {
    formalDefinition:
      'K-Means partitions points into k Voronoi cells minimizing within-cluster sum of squares Σ ‖x_i - μ_c‖² via alternating Lloyd updates, while DBSCAN discovers arbitrary-shape density-connected clusters by expanding ε-neighborhoods containing at least MinPts core neighbors.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def kmeans_lloyd(X: np.ndarray, k: int, iters: int = 20):
    rng = np.random.default_rng(42)
    centroids = X[rng.choice(len(X), size=k, replace=False)]
    for _ in range(iters):
        # Broadcast squared L2 distances: shape (N, k)
        dists = ((X[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=2)
        labels = dists.argmin(axis=1)
        new_c = np.array([X[labels == j].mean(axis=0) if np.any(labels == j) else centroids[j] for j in range(k)])
        if np.allclose(centroids, new_c): break
        centroids = new_c
    return labels, centroids`,
    implementationSteps: [
      'Standardize features before clustering so high-magnitude columns (e.g., annual revenue) do not drown out smaller units (e.g., age).',
      'Use K-Means++ initialization (sampling next centroids proportional to D(x)²) to avoid poor local minima.',
      'Switch to DBSCAN/HDBSCAN when clusters are non-spherical or noisy outliers should be labeled `-1` rather than forced into centroids.',
    ],
    mermaidDfd: `flowchart LR
  SC["Scaled Vectors"] -->|"K-Means++ Seed"| CENT["Initial Centroids"]
  CENT -->|"Nearest L2 Assign"| ASSGN["Cluster Assignments"]
  ASSGN -->|"Recompute Means"| UPD["Updated Centroids"]
  UPD -.->|"Until Converged"| ASSGN`,
  },

  'pat-dim-reduction': {
    formalDefinition:
      'Principal Component Analysis (PCA) projects centered data X̃ onto the top-k orthonormal eigenvectors of covariance matrix (1/N)X̃ᵀX̃ via Singular Value Decomposition X̃ = UΣVᵀ, preserving maximum linear variance; UMAP constructs a fuzzy topological k-NN graph and optimizes low-D layout via cross-entropy.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def pca_svd_fit_transform(X_train: np.ndarray, k: int):
    mean = X_train.mean(axis=0)
    X_centered = X_train - mean
    # Economy SVD avoids forming large d x d covariance matrix explicitly
    _, S, Vt = np.linalg.svd(X_centered, full_matrices=False)
    components = Vt[:k]                          # Top-k orthogonal principal axes
    explained_ratio = (S[:k] ** 2) / (S ** 2).sum()
    return X_centered @ components.T, components, explained_ratio`,
    implementationSteps: [
      'Center (and standardize when feature units differ) strictly on the training fold before computing SVD.',
      'Inspect cumulative `explained_ratio` (typically 90–95% retained variance) to pick `k` without discarding critical minority-class signal.',
      'Use PCA for deterministic linear compression/denoising; use UMAP strictly for nonlinear manifold visualization (not global distance math).',
    ],
    mermaidDfd: `flowchart LR
  X["High-D Features"] -->|"Center & Scale"| XC["Centered Matrix"]
  XC -->|"Economy SVD"| VT["Top-k Eigenvectors"]
  VT -->|"Linear Projection"| LOW["Compact k-D Embedding"]`,
  },

  /* ==================== PHASE 3: DEEP LEARNING ==================== */
  'pat-mlp': {
    formalDefinition:
      'A Pre-LayerNorm Residual MLP computes h_{l+1} = h_l + W₂·GELU(W₁·LayerNorm(h_l)), providing an unobstructed identity gradient highway ∂h_L/∂h_l = I + ∂F/∂h_l that prevents vanishing gradients in deep architectures.',
    algorithmLanguage: 'python',
    algorithmCode: `import torch
import torch.nn as nn

class PreNormResidualMLP(nn.Module):
    def __init__(self, d_model: int, expansion: int = 4, dropout: float = 0.1):
        super().__init__()
        self.norm = nn.LayerNorm(d_model)
        self.net = nn.Sequential(
            nn.Linear(d_model, d_model * expansion),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model * expansion, d_model),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.net(self.norm(x))  # Identity skip highway`,
    implementationSteps: [
      'Apply LayerNorm BEFORE linear projections (Pre-LN) so gradient variance remains bounded at initialization without brittle LR warmups.',
      'Use GELU or SwiGLU activations instead of saturating Sigmoid/Tanh to maintain strong gradient flow across negative inputs.',
      'Pair with AdamW decoupled weight decay and global gradient norm clipping (`clip_grad_norm_(params, 1.0)`).',
    ],
    mermaidDfd: `flowchart LR
  IN["Hidden State h_l"] -->|"Pre-LayerNorm"| LN["Normalized Tensor"]
  LN -->|"Linear + GELU + Linear"| FFN["MLP Transform F(x)"]
  IN -->|"Identity Skip Highway"| ADD["Residual Add h_l + F(x)"]
  FFN -->|"Add"| ADD`,
  },

  'pat-cnn': {
    formalDefinition:
      'Convolutional Neural Networks convolve shared spatial kernel banks K ∈ R^(C_out×C_in×k×k) across image feature maps via im2col/Winograd GEMM, achieving translation equivariance and hierarchical receptive fields with orders of magnitude fewer parameters than dense layers.',
    algorithmLanguage: 'python',
    algorithmCode: `import torch.nn as nn

class ResidualConvBlock(nn.Module):
    def __init__(self, ch: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(ch, ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(ch),
            nn.SiLU(inplace=True),
            nn.Conv2d(ch, ch, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(ch),
        )
        self.act = nn.SiLU(inplace=True)

    def forward(self, x):
        return self.act(x + self.block(x))`,
    implementationSteps: [
      'Omit `bias=True` on Conv2d layers immediately followed by BatchNorm2d because BatchNorm centering cancels additive bias.',
      'Stack 3×3 convolutions (or depthwise-separable convolutions) to expand receptive fields cheaply while adding nonlinearity at each step.',
      'Use Global Average Pooling instead of giant flatten-to-dense heads to cut parameter count and reduce spatial overfitting.',
    ],
    mermaidDfd: `flowchart LR
  IMG["Image Tensor B,C,H,W"] -->|"3x3 Shared Kernels"| CONV["Conv2d + BatchNorm"]
  CONV -->|"SiLU + Residual Skip"| POOL["Spatial Downsample"]
  POOL -->|"Global Avg Pool"| HEAD["Logit Classifier"]`,
  },

  'pat-transformer': {
    formalDefinition:
      'Multi-Head Scaled Dot-Product Self-Attention computes Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k + M_causal)·V across H parallel subspaces, enabling O(1) path length between any two tokens in a sequence while FlashAttention tiles the computation inside GPU SRAM.',
    algorithmLanguage: 'python',
    algorithmCode: `import math, torch
import torch.nn.functional as F

def scaled_dot_product_attention(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor, causal=True):
    d_k = Q.size(-1)
    scores = (Q @ K.transpose(-2, -1)) / math.sqrt(d_k)   # Prevent softmax saturation
    if causal:
        T = Q.size(-2)
        mask = torch.triu(torch.ones(T, T, device=Q.device, dtype=torch.bool), diagonal=1)
        scores = scores.masked_fill(mask, float('-inf'))
    weights = F.softmax(scores, dim=-1)
    return weights @ V`,
    implementationSteps: [
      'Divide Q·Kᵀ by `sqrt(d_k)` so dot-product variance stays ~1.0; unscaled logits push softmax into flat zero-gradient regions.',
      'Apply an upper-triangular causal mask (`-inf` above diagonal) in decoder models so token `t` never attends to future tokens `> t`.',
      'In production PyTorch 2+, call `F.scaled_dot_product_attention` to dispatch directly to FlashAttention-2 SRAM kernels.',
    ],
    mermaidDfd: `flowchart LR
  TOK["Token Embeddings + RoPE"] -->|"Linear Proj"| QKV["Q, K, V Multi-Head"]
  QKV -->|"QK^T / sqrt(d) + Mask"| ATTN["FlashAttention Softmax"]
  ATTN -->|"Weighted Sum V"| FFN["Pre-LN SwiGLU FFN"]`,
  },

  'pat-transfer': {
    formalDefinition:
      'Transfer Learning initializes target task parameters θ from a large pretrained foundation backbone θ_0, freezing early universal feature extractors while adapting upper task heads with discriminative low learning rates (1e-5 to 5e-5) to prevent catastrophic forgetting.',
    algorithmLanguage: 'python',
    algorithmCode: `import torch

def build_discriminative_optimizer(backbone, head, head_lr=1e-3, backbone_lr=2e-5):
    # Stage 1: Freeze backbone while newly initialized head stabilizes
    for p in backbone.parameters():
        p.requires_grad = False
    # Stage 2 (unfreeze top blocks): use 50x lower LR on pretrained weights
    return torch.optim.AdamW([
        {"params": head.parameters(), "lr": head_lr, "weight_decay": 0.01},
        {"params": [p for p in backbone.parameters() if p.requires_grad], "lr": backbone_lr},
    ])`,
    implementationSteps: [
      'Warm up the randomly initialized task head for 1–2 epochs with the pretrained backbone frozen so large initial head gradients do not corrupt pretrained weights.',
      'Unfreeze top transformer/conv blocks gradually using 10–50× smaller learning rates than the head.',
      'Match exact upstream normalization statistics (mean/std or tokenizer vocab) used during pretraining.',
    ],
    mermaidDfd: `flowchart LR
  PRE["Pretrained Backbone"] -->|"Freeze Early Layers"| ENC["Universal Features"]
  ENC -->|"Fine-Tune Top Blocks"| HEAD["Domain Task Head"]
  HEAD -->|"Discriminative AdamW"| VAL["Target Eval Metrics"]`,
  },

  /* ==================== PHASE 4: GENAI, RAG & AGENTS ==================== */
  'pat-hybrid-rag': {
    formalDefinition:
      'Hybrid RAG fuses lexical sparse retrieval (Okapi BM25 inverted index) and dense semantic retrieval (HNSW ANN vector search) via Reciprocal Rank Fusion RRF(d) = Σ 1/(k + rank_i(d)), then rescores Top-K candidates with a Cross-Encoder before grounded LLM generation.',
    algorithmLanguage: 'python',
    algorithmCode: `from collections import defaultdict

def reciprocal_rank_fusion(bm25_ids: list[str], vector_ids: list[str], k: int = 60, top_n: int = 20):
    scores = defaultdict(float)
    for rank, doc_id in enumerate(bm25_ids, start=1):
        scores[doc_id] += 1.0 / (k + rank)
    for rank, doc_id in enumerate(vector_ids, start=1):
        scores[doc_id] += 1.0 / (k + rank)
    # Pass top_n fused candidates to Cross-Encoder reranker -> top 5 for LLM prompt
    return [doc for doc, _ in sorted(scores.items(), key=lambda kv: kv[1], reverse=True)[:top_n]]`,
    implementationSteps: [
      'Run BM25 (captures exact error codes, SKUs, acronyms) and Dense HNSW (captures paraphrases/synonyms) in parallel to minimize retrieval latency.',
      'Merge ranked lists with parameter-free Reciprocal Rank Fusion (`k = 60`) instead of brittle raw score linear weighting across incompatible scales.',
      'Apply a Cross-Encoder reranker on the Top-20 fused passages to inject only the highest-precision Top-5 chunks with source citations into the LLM context.',
    ],
    mermaidDfd: `flowchart LR
  Q["User Query"] -->|"Exact Terms"| BM25["BM25 Inverted Index"]
  Q -->|"Dense Vector"| HNSW["HNSW Vector DB"]
  BM25 -->|"Top-50"| RRF["Reciprocal Rank Fusion"]
  HNSW -->|"Top-50"| RRF
  RRF -->|"Top-20"| RERANK["Cross-Encoder Reranker"]
  RERANK -->|"Top-5 Citations"| LLM["Grounded LLM Stream"]`,
  },

  'pat-lora': {
    formalDefinition:
      'Low-Rank Adaptation (LoRA) freezes pretrained weight matrices W₀ ∈ R^(d×k) and injects trainable low-rank update ΔW = (α/r)·B·A where A ∈ R^(r×k), B ∈ R^(d×r), r ≪ min(d,k), cutting trainable parameters and optimizer VRAM by 95–99% with zero inference latency once merged.',
    algorithmLanguage: 'python',
    algorithmCode: `import math, torch
import torch.nn as nn

class LoRALinear(nn.Module):
    def __init__(self, base: nn.Linear, r: int = 16, alpha: float = 32.0):
        super().__init__()
        self.base = base
        self.base.weight.requires_grad_(False)         # Freeze giant W0
        self.A = nn.Parameter(torch.empty(r, base.in_features))
        self.B = nn.Parameter(torch.zeros(base.out_features, r))  # Zero-init -> ΔW=0 at step 0
        nn.init.kaiming_uniform_(self.A, a=math.sqrt(5))
        self.scale = alpha / r

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.base(x) + ((x @ self.A.T) @ self.B.T) * self.scale`,
    implementationSteps: [
      'Initialize `B = 0` and `A ~ Kaiming` so the adapted model behaves identically to the pretrained base model at step 0.',
      'Apply LoRA to all attention projections (`q_proj`, `k_proj`, `v_proj`, `o_proj`) and MLP projections for highest task quality; quantize `W0` to NF4 for QLoRA.',
      'Merge `W_merged = W0 + (alpha/r) * (B @ A)` offline prior to vLLM deployment for zero runtime adapter overhead.',
    ],
    mermaidDfd: `flowchart LR
  X["Hidden Input x"] -->|"Frozen NF4/FP16"| W0["Frozen Base Weight W0"]
  X -->|"Trainable Down-Proj r"| A["LoRA Matrix A"]
  A -->|"Trainable Up-Proj"| B["LoRA Matrix B * alpha/r"]
  W0 -->|"Sum"| OUT["Adapted Output h"]
  B -->|"Residual Update"| OUT`,
  },

  'pat-react-agent': {
    formalDefinition:
      'A Guarded ReAct Agent runs a bounded state machine (Thought → Tool Call → Observation → Reflect) with JSON-schema tool validation, idempotency keys, max-step/token budgets, and human-in-the-loop approval gates for mutating side effects.',
    algorithmLanguage: 'typescript',
    algorithmCode: `async function runGuardedReAct(goal: string, maxSteps = 6, maxTokens = 8000) {
  const history = [{ role: 'user', content: goal }];
  let spentTokens = 0;

  for (let step = 1; step <= maxSteps && spentTokens < maxTokens; step++) {
    const resp = await callLlmWithTools(history);
    spentTokens += resp.usage.totalTokens;
    if (!resp.toolCall) return { status: 'done', answer: resp.text, steps: step };

    const validatedArgs = validateJsonSchema(resp.toolCall.name, resp.toolCall.args);
    if (isMutatingTool(resp.toolCall.name)) await requireApproval(resp.toolCall);
    const obs = await executeSandboxedTool(resp.toolCall.name, validatedArgs, { timeoutMs: 5000 });
    history.push({ role: 'tool', content: truncateObservation(obs, 1200) });
  }
  return { status: 'budget_exhausted', fallback: 'Escalate to deterministic workflow' };
}`,
    implementationSteps: [
      'Validate every LLM-emitted tool payload strictly against a JSON Schema before touching internal APIs or SQL engines.',
      'Enforce hard `maxSteps`, `maxTokens`, and per-tool timeouts to prevent infinite retry loops and runaway cloud bills.',
      'Truncate verbose tool outputs and attach OpenTelemetry trace spans per thought/tool iteration for reproducible debugging.',
    ],
    mermaidDfd: `flowchart LR
  GOAL["User Goal"] -->|"Budget Check"| LLM["Reasoning LLM"]
  LLM -->|"JSON Schema Validated"| GATE["Safety & Approval Gate"]
  GATE -->|"Sandboxed Exec"| TOOL["External Tool / API"]
  TOOL -->|"Bounded Observation"| LLM
  LLM -->|"Final Answer"| OUT["Verified Response"]`,
  },

  'pat-ragas-eval': {
    formalDefinition:
      'Automated RAG Evaluation decomposes quality into Retrieval Metrics (Context Precision, Context Recall) and Generation Metrics (Faithfulness = supported claims / total claims, Answer Relevancy) run continuously in CI over golden regression datasets.',
    algorithmLanguage: 'python',
    algorithmCode: `def compute_rag_ci_gate(eval_rows: list[dict], min_faithfulness=0.90, min_recall=0.85):
    faithfulness = sum(r["supported_claims"] / max(1, r["total_claims"]) for r in eval_rows) / len(eval_rows)
    ctx_recall = sum(r["ground_truth_hits"] / max(1, r["ground_truth_total"]) for r in eval_rows) / len(eval_rows)
    passed = faithfulness >= min_faithfulness and ctx_recall >= min_recall
    return {"passed": passed, "faithfulness": round(faithfulness, 3), "context_recall": round(ctx_recall, 3)}`,
    implementationSteps: [
      'Separate retrieval failures (low Context Recall) from generation hallucinations (low Faithfulness) so engineers fix the right subsystem.',
      'Pin a deterministic temperature-0 judge model with structured rubrics and periodically calibrate it against human-labeled golden sets.',
      'Block prompt, chunking, or embedding upgrades in CI whenever regression scores drop below release thresholds.',
    ],
    mermaidDfd: `flowchart LR
  GOLD[("Golden Eval Set")] -->|"Run RAG Pipeline"| PRED["Contexts + Answers"]
  PRED -->|"Decompose Claims"| JUDGE["Calibrated LLM Judge"]
  JUDGE -->|"Faithfulness & Recall"| GATE["CI Release Gate"]`,
  },

  /* ==================== PHASE 5: MLOPS & PRODUCTION ==================== */
  'pat-quantization': {
    formalDefinition:
      'Post-Training Weight Quantization maps FP16 weight tensors W into 4-bit integers Q = round(W / s) + z per group of 128 elements (with AWQ scaling salient activation channels first), slashing HBM VRAM footprint ~3.5× and accelerating memory-bandwidth-bound LLM decode up to 3×.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def quantize_group_int4_awq(W: np.ndarray, act_scale: np.ndarray, group_size: int = 128):
    # AWQ protects top 1% salient weight channels by pre-scaling with activation magnitudes
    W_scaled = W * act_scale[None, :]
    groups = W_scaled.reshape(-1, group_size)
    max_abs = np.max(np.abs(groups), axis=1, keepdims=True) + 1e-8
    scales = max_abs / 7.0                                  # Signed INT4 range [-7, 7]
    q_int4 = np.clip(np.round(groups / scales), -7, 7).astype(np.int8)
    return q_int4, scales`,
    implementationSteps: [
      'Calibrate per-channel activation magnitudes on ~128 representative prompts to identify salient weights before quantizing.',
      'Quantize in fine-grained 128-element groups with per-group FP16 scale factors so outlier values do not crush neighboring precision.',
      'Benchmark quantized outputs against FP16 on your domain eval suite (especially math, JSON formatting, and multi-hop reasoning) prior to rollout.',
    ],
    mermaidDfd: `flowchart LR
  FP16["FP16 Weights 140 GB"] -->|"Calibration Set"| SAL["Salient Channel Scaling"]
  SAL -->|"128-Elem Group Scale"| INT4["AWQ INT4 Packed 38 GB"]
  INT4 -->|"3x Less HBM Read"| GPU["Fast Decode Kernel"]`,
  },

  'pat-model-router': {
    formalDefinition:
      'Tiered Model Routing with Semantic Caching intercepts incoming prompts via a low-latency vector cache (serving cosine ≥ τ hits in <15 ms at $0 GPU cost) and classifies cache misses by complexity to route 70–85% of traffic to small fast models and only hard queries to frontier models.',
    algorithmLanguage: 'typescript',
    algorithmCode: `async function routePrompt(prompt: string, embedFn: (s: string) => Promise<number[]>) {
  const vec = await embedFn(prompt);
  const cached = await redisVectorSearch(vec, { minCosine: 0.96, ttlSec: 3600 });
  if (cached) return { source: 'semantic-cache', latencyMs: 12, text: cached.answer };

  const difficulty = scorePromptComplexity(prompt); // Classifier / heuristic score [0..1]
  const targetModel = difficulty < 0.65 ? 'small-8b-vllm' : 'frontier-reasoning-model';
  const answer = await invokeModel(targetModel, prompt);
  await redisVectorStore(vec, answer);
  return { source: targetModel, answer };
}`,
    implementationSteps: [
      'Set strict cosine similarity thresholds (`>= 0.96`) AND partition cache namespaces by tenant/user permissions to prevent cross-tenant data leakage.',
      'Train a lightweight classifier (DeBERTa/LightGBM) on historical eval logs to score query difficulty in <5 ms before routing.',
      'Implement circuit-breaker fallback from small model to frontier model whenever structured JSON validation fails.',
    ],
    mermaidDfd: `flowchart LR
  REQ["User Prompt"] -->|"Cosine >= 0.96"| CACHE[("Redis Semantic Cache")]
  CACHE -->|"Cache Miss"| ROUTER["Complexity Classifier"]
  ROUTER -->|"Simple 75%"| SMALL["Small 8B vLLM Pool"]
  ROUTER -->|"Complex 25%"| BIG["Frontier Model Pool"]`,
  },

  'pat-canary-shadow': {
    formalDefinition:
      'Shadow & Canary Progressive Delivery de-risks model upgrades by mirroring live traffic asynchronously to a candidate model (Shadow: 0% user impact) before shifting 1% → 10% → 50% → 100% of live requests (Canary) with automated SLO rollback gates.',
    algorithmLanguage: 'typescript',
    algorithmCode: `function selectModelVariant(requestId: string, canaryPct: number, errorRate: number) {
  if (errorRate > 0.015) return { variant: 'champion-v1', reason: 'auto-rollback-triggered' };
  // Deterministic hash ensures consistent user experience during canary rollout
  const bucket = fnv1aHash(requestId) % 100;
  return bucket < canaryPct
    ? { variant: 'challenger-v2', reason: 'canary-bucket' }
    : { variant: 'champion-v1', reason: 'stable-bucket' };
}`,
    implementationSteps: [
      'Run Shadow Mode first (fire-and-forget async mirror) to compare latency, token usage, and JSON parse rate with zero user risk.',
      'Hash requests deterministically by `user_id` or `session_id` during Canary rollout so a single user never flips erratically between model versions.',
      'Wire automated rollback triggers on p99 TTFT, 5xx rate, guardrail rejection spikes, and negative feedback rate.',
    ],
    mermaidDfd: `flowchart LR
  GW["API Gateway"] -->|"95% Live"| CHAMP["Champion Model v1"]
  GW -->|"5% Canary"| CHAL["Challenger Model v2"]
  GW -.->|"Async Shadow Tap"| EVAL["Offline Diff Telemetry"]
  CHAL -->|"SLO Check"| GATE["Auto-Promote or Rollback"]`,
  },

  'pat-drift': {
    formalDefinition:
      'Population Stability Index (PSI) quantifies covariate distribution shift between training baseline P and live production window Q as PSI = Σ (q_i - p_i)·ln(q_i / p_i), alerting teams (PSI > 0.20) before silent accuracy collapse impacts revenue.',
    algorithmLanguage: 'python',
    algorithmCode: `import numpy as np

def population_stability_index(expected_pct: np.ndarray, actual_pct: np.ndarray, eps: float = 1e-6) -> float:
    p = np.clip(expected_pct, eps, 1.0)
    q = np.clip(actual_pct, eps, 1.0)
    psi = float(np.sum((q - p) * np.log(q / p)))
    # Industry thresholds: <0.10 stable, 0.10..0.20 watch, >0.20 significant drift -> retrain!
    return round(psi, 4)`,
    implementationSteps: [
      'Log sampled production feature histograms, embedding centroids, and prediction confidences asynchronously without adding serving latency.',
      'Monitor both Data Drift (input PSI/KS-test) and Concept Drift (delayed ground-truth labels vs. predicted outcomes).',
      'Trigger automated retraining pipelines with fresh labeled windows and mandatory offline eval gates whenever PSI exceeds 0.20.',
    ],
    mermaidDfd: `flowchart LR
  LIVE["Live Inference Logs"] -->|"Windowed Bins"| PSI["PSI & Embedding Drift Engine"]
  BASE[("Training Baseline Stats")] -->|"Compare"| PSI
  PSI -->|"PSI > 0.20"| ALERT["Alert & Retrain Pipeline"]`,
  },
};
