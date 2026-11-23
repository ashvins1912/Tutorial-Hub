import type { OodConcept } from '../data/ood/oodTypes';
import type { NGramAlgorithmEntry } from '../data/ngramTaxonomy';
import type { LangVisualFlow } from '../data/languagesTutorialData';
import type { AlgorithmDefinition } from '../data/algorithmsCatalog';

function sanitizeLabel(text: string, maxLen = 52): string {
  const clean = text
    .replace(/"/g, "'")
    .replace(/[[\](){}]/g, '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > maxLen ? `${clean.slice(0, maxLen - 1)}…` : clean;
}

function safeId(raw: string, fallback: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, '_');
  if (!cleaned) return fallback;
  return /^[0-9]/.test(cleaned) ? `N_${cleaned}` : cleaned;
}

/* -------------------------------------------------------------------------- */
/* 1. OOPs, SOLID, GoF & OOD Systems Mermaid DFD Builder                      */
/* -------------------------------------------------------------------------- */

export function buildOodConceptMermaidDfd(concept: OodConcept): string {
  // Prefer the final frame because it shows the full resolved clean architecture
  const frame =
    concept.frames[concept.frames.length - 1] ??
    concept.frames[0];

  if (!frame || frame.nodes.length < 2) {
    return `flowchart LR
  CLI["Caller / Client"] -->|"Invoke Contract"| IFACE["${sanitizeLabel(concept.shortTitle)}"]
  IFACE -->|"Clean Dispatch"| IMPL["Concrete Implementation"]
  IMPL -->|"Result"| OUT["Verified State"]`;
  }

  const lines: string[] = ['flowchart LR'];
  const idMap = new Map<string, string>();

  frame.nodes.forEach((n, idx) => {
    const id = safeId(n.id, `O${idx + 1}`);
    idMap.set(n.id, id);
    const lbl = sanitizeLabel(n.sublabel ? `${n.label} - ${n.sublabel}` : n.label);
    if (n.kind === 'memory') {
      lines.push(`  ${id}[("${lbl}")]`);
    } else {
      lines.push(`  ${id}["${lbl}"]`);
    }
  });

  if (frame.edges.length > 0) {
    frame.edges.forEach((e) => {
      const from = idMap.get(e.from);
      const to = idMap.get(e.to);
      if (!from || !to) return;
      const lbl = e.label ? sanitizeLabel(e.label, 30) : e.style === 'inherit' ? 'implements' : 'calls';
      if (e.style === 'dashed' || e.style === 'blocked') {
        lines.push(`  ${from} -.->|"${lbl}"| ${to}`);
      } else {
        lines.push(`  ${from} -->|"${lbl}"| ${to}`);
      }
    });
  } else {
    const ids = Array.from(idMap.values());
    for (let i = 0; i < ids.length - 1; i++) {
      lines.push(`  ${ids[i]} -->|"Flow"| ${ids[i + 1]}`);
    }
  }

  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* 2. N-Gram & Fuzzy Search Algorithm Mermaid DFD Builder                     */
/* -------------------------------------------------------------------------- */

export function buildNGramAlgoMermaidDfd(algo: NGramAlgorithmEntry): string {
  const steps = algo.traceSteps && algo.traceSteps.length > 0 ? algo.traceSteps : [];
  if (steps.length < 2) {
    return `flowchart LR
  Q["Raw Query Strings"] -->|"Tokenize"| CORE["${sanitizeLabel(algo.name)}"]
  CORE -->|"Score & Prune"| RES["Ranked Fuzzy Matches"]`;
  }

  const lines: string[] = ['flowchart LR'];
  lines.push(`  IN["Input Pair: ${sanitizeLabel(algo.defaultA || 'Query A', 22)} vs ${sanitizeLabel(algo.defaultB || 'Query B', 22)}"]`);

  steps.forEach((st, idx) => {
    lines.push(`  T${idx + 1}["${idx + 1}. ${sanitizeLabel(st.title, 40)}"]`);
  });

  lines.push(`  OUT["Scored Output (${sanitizeLabel(algo.complexityReduction, 26)})"]`);
  lines.push(`  IN -->|"Feed"| T1`);
  for (let i = 0; i < steps.length - 1; i++) {
    lines.push(`  T${i + 1} -->|"${sanitizeLabel(steps[i].stateNote, 26) || 'Next'}"| T${i + 2}`);
  }
  lines.push(`  T${steps.length} -->|"Emit"| OUT`);
  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* 3. Python 3.13+ & Java 21+ Runtime Flow Mermaid DFD Builder                */
/* -------------------------------------------------------------------------- */

export function buildLanguageFlowMermaidDfd(
  flow: LangVisualFlow,
  activeNodeIds: string[] = []
): string {
  const lines: string[] = ['flowchart LR'];
  const idMap = new Map<string, string>();

  flow.nodes.forEach((n, idx) => {
    const id = safeId(n.id, `L${idx + 1}`);
    idMap.set(n.id, id);
    const lbl = sanitizeLabel(`${n.label} - ${n.sublabel}`);
    if (n.kind === 'memory') {
      lines.push(`  ${id}[("${lbl}")]`);
    } else {
      lines.push(`  ${id}["${lbl}"]`);
    }
  });

  flow.edges.forEach((e) => {
    const from = idMap.get(e.from);
    const to = idMap.get(e.to);
    if (!from || !to) return;
    const lbl = sanitizeLabel(e.label, 30) || 'Handoff';
    lines.push(`  ${from} -->|"${lbl}"| ${to}`);
  });

  activeNodeIds.forEach((rawId) => {
    const mapped = idMap.get(rawId);
    if (mapped) {
      lines.push(`  style ${mapped} fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:3px`);
    }
  });

  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* 4. Algorithms Studio & Architecture Visualizer Mermaid DFD Builders        */
/* -------------------------------------------------------------------------- */

export function buildAlgorithmFlowMermaidDfd(
  algo: AlgorithmDefinition,
  flowStages: { stage: string; detail: string }[]
): string {
  const lines: string[] = ['flowchart LR'];
  lines.push(`  IN["Input: ${sanitizeLabel(algo.category, 32)}"]`);

  if (flowStages.length >= 2) {
    flowStages.forEach((st, idx) => {
      lines.push(`  A${idx + 1}["${idx + 1}. ${sanitizeLabel(st.stage, 36)}"]`);
    });
    lines.push(`  OUT["Result (${sanitizeLabel(algo.timeComplexity, 26)})"]`);
    lines.push(`  IN -->|"Init"| A1`);
    for (let i = 0; i < flowStages.length - 1; i++) {
      lines.push(`  A${i + 1} -->|"Step"| A${i + 2}`);
    }
    lines.push(`  A${flowStages.length} -->|"Return"| OUT`);
  } else {
    lines.push(`  CORE["${sanitizeLabel(algo.name, 40)}"]`);
    lines.push(`  OUT["Result (${sanitizeLabel(algo.timeComplexity, 26)})"]`);
    lines.push(`  IN -->|"Execute"| CORE`);
    lines.push(`  CORE -->|"Emit"| OUT`);
  }
  return lines.join('\n');
}

export function buildDataStructureArchMermaidDfd(
  title: string,
  nodes: { id: string; label: string; complexity: string }[]
): string {
  const lines: string[] = ['flowchart LR'];
  const ids: string[] = [];

  nodes.forEach((n, idx) => {
    const id = safeId(n.id, `D${idx + 1}`);
    ids.push(id);
    lines.push(`  ${id}["${sanitizeLabel(n.label, 38)} - ${sanitizeLabel(n.complexity, 22)}"]`);
  });

  for (let i = 0; i < ids.length - 1; i++) {
    lines.push(`  ${ids[i]} -->|"Propagate"| ${ids[i + 1]}`);
  }

  if (ids.length < 2) {
    lines.push(`  ROOT["${sanitizeLabel(title)}"] -->|"Query"| RES["Result"]`);
  }

  return lines.join('\n');
}
