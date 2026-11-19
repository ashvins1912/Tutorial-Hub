import type { ConceptNode, SynthesizedDiagram } from './intelligent-engine.types';

function sanitizeMermaidLabel(text: string): string {
  return text.replace(/"/g, "'").replace(/[[\]{}]/g, (m) => `(${m})`).trim();
}

export class VisualDiagramSynthesizer {
  /**
   * Automatically converts ANY topic/algorithm concept into visual learning diagrams:
   * 1. Execution Logic Flowchart
   * 2. Level-1 Data Flow Diagram (DFD)
   * 3. State-Transition Graph
   * 4. Component Interaction & Memory/Pointer Sequence Trace
   */
  public synthesizeAllDiagrams(concept: ConceptNode): SynthesizedDiagram[] {
    return [
      this.generateFlowchart(concept),
      this.generateDataFlowDiagram(concept),
      this.generateStateMachine(concept),
      this.generateDataStructureTrace(concept),
    ];
  }

  /**
   * 1. Generates an Algorithmic Decision Flowchart
   */
  public generateFlowchart(concept: ConceptNode): SynthesizedDiagram {
    const inputsLabel = sanitizeMermaidLabel(concept.visualSpec.inputs.join(' + ') || 'Input');
    const storesLabel = sanitizeMermaidLabel(
      concept.visualSpec.dataStores.join(', ') || 'State Variables',
    );
    const outputsLabel = sanitizeMermaidLabel(concept.visualSpec.outputs.join(', ') || 'Result');

    const lines: string[] = ['flowchart TD'];
    lines.push(`  Start(["Start: ${inputsLabel}"]) --> Init["Initialize: ${storesLabel}"]`);

    let prevNode = 'Init';
    concept.visualSpec.processes.forEach((proc, idx) => {
      const nodeId = `Step${idx + 1}`;
      lines.push(`  ${prevNode} --> ${nodeId}["${idx + 1}. ${sanitizeMermaidLabel(proc)}"]`);
      prevNode = nodeId;
    });

    concept.visualSpec.decisionBranches.forEach((branch, idx) => {
      const decId = `Dec${idx + 1}`;
      const trueId = `True${idx + 1}`;
      const falseId = `False${idx + 1}`;
      const mergeId = `Merge${idx + 1}`;
      lines.push(`  ${prevNode} --> ${decId}{"${sanitizeMermaidLabel(branch.condition)}?"}`);
      lines.push(`  ${decId} -->|Yes| ${trueId}["${sanitizeMermaidLabel(branch.truePath)}"]`);
      lines.push(`  ${decId} -->|No| ${falseId}["${sanitizeMermaidLabel(branch.falsePath)}"]`);
      lines.push(`  ${trueId} --> ${mergeId}((" "))`);
      lines.push(`  ${falseId} --> ${mergeId}`);
      prevNode = mergeId;
    });

    lines.push(`  ${prevNode} --> End(["Return: ${outputsLabel}"])`);

    return {
      type: 'FLOWCHART',
      title: `${concept.title} — Execution Logic Flowchart`,
      mermaidCode: lines.join('\n'),
      stepAnnotations: [
        `Golden Invariant: ${concept.invariantRule}`,
        ...concept.visualSpec.processes.map((p, i) => `Phase ${i + 1}: ${p}`),
        ...concept.visualSpec.decisionBranches.map(
          (b) => `Branch (${b.condition}): YES → ${b.truePath} | NO → ${b.falsePath}`,
        ),
      ],
    };
  }

  /**
   * 2. Generates a Level-1 Data Flow Diagram (DFD) showing External Entities, Processes, and Data Stores
   */
  public generateDataFlowDiagram(concept: ConceptNode): SynthesizedDiagram {
    const lines: string[] = ['flowchart LR'];

    concept.visualSpec.inputs.forEach((inp, i) => {
      lines.push(`  ExtIn${i}["Input: ${sanitizeMermaidLabel(inp)}"]`);
    });

    concept.visualSpec.processes.forEach((proc, i) => {
      lines.push(`  P${i}((("${i + 1}.0\\n${sanitizeMermaidLabel(proc)}")))`);
    });

    concept.visualSpec.dataStores.forEach((ds, i) => {
      lines.push(`  DS${i}[("D${i + 1}: ${sanitizeMermaidLabel(ds)}")]`);
    });

    concept.visualSpec.outputs.forEach((out, i) => {
      lines.push(`  ExtOut${i}["Output: ${sanitizeMermaidLabel(out)}"]`);
    });

    if (concept.visualSpec.processes.length > 0) {
      concept.visualSpec.inputs.forEach((_, i) => {
        lines.push(`  ExtIn${i} -->|Raw Input| P0`);
      });
    }

    concept.visualSpec.processes.forEach((_, i) => {
      if (concept.visualSpec.dataStores[i]) {
        lines.push(`  P${i} <-->|Read/Write State| DS${i}`);
      }
      if (concept.visualSpec.processes[i + 1]) {
        lines.push(`  P${i} -->|Transformed Stream| P${i + 1}`);
      }
    });

    const lastProcIdx = Math.max(0, concept.visualSpec.processes.length - 1);
    concept.visualSpec.outputs.forEach((_, i) => {
      lines.push(`  P${lastProcIdx} -->|Verified Result| ExtOut${i}`);
    });

    return {
      type: 'DFD',
      title: `${concept.title} — Level-1 Data Flow Diagram (DFD)`,
      mermaidCode: lines.join('\n'),
      stepAnnotations: [
        `External Inputs: ${concept.visualSpec.inputs.join(' · ')}`,
        `Data Stores: ${concept.visualSpec.dataStores.join(' · ')}`,
        `Complexity Profile: ${concept.complexity.time} Time · ${concept.complexity.space} Space`,
      ],
    };
  }

  /**
   * 3. Generates a State-Transition Graph for Execution Phases & Pruning/Invariant Transitions
   */
  public generateStateMachine(concept: ConceptNode): SynthesizedDiagram {
    const lines: string[] = ['stateDiagram-v2'];
    lines.push('  [*] --> InitState: Load inputs & seed stores');

    let prev = 'InitState';
    concept.visualSpec.processes.forEach((proc, idx) => {
      const stateId = `Phase${idx + 1}`;
      lines.push(`  ${prev} --> ${stateId}: ${sanitizeMermaidLabel(proc)}`);
      prev = stateId;
    });

    const primaryBranch = concept.visualSpec.decisionBranches[0];
    if (primaryBranch) {
      lines.push(`  ${prev} --> InvariantCheck: Evaluate ${sanitizeMermaidLabel(primaryBranch.condition)}`);
      lines.push(`  InvariantCheck --> EmitResult: True (${sanitizeMermaidLabel(primaryBranch.truePath)})`);
      lines.push(`  InvariantCheck --> AdjustState: False (${sanitizeMermaidLabel(primaryBranch.falsePath)})`);
      lines.push(`  AdjustState --> Phase1: Loop / Next iteration`);
      lines.push(`  EmitResult --> [*]: ${sanitizeMermaidLabel(concept.visualSpec.outputs[0] ?? 'Done')}`);
    } else {
      lines.push(`  ${prev} --> [*]: Emit ${sanitizeMermaidLabel(concept.visualSpec.outputs[0] ?? 'Result')}`);
    }

    return {
      type: 'STATE_MACHINE',
      title: `${concept.title} — State-Transition Graph`,
      mermaidCode: lines.join('\n'),
      stepAnnotations: [
        `State Invariant: ${concept.invariantRule}`,
        `Mental Model: ${concept.coreMentalModel}`,
      ],
    };
  }

  /**
   * 4. Generates a Step-by-Step Memory & Component Interaction Sequence Diagram
   */
  public generateDataStructureTrace(concept: ConceptNode): SynthesizedDiagram {
    const primaryStore = sanitizeMermaidLabel(
      concept.visualSpec.dataStores[0] ?? 'Primary Data Structure',
    );
    const inputs = sanitizeMermaidLabel(concept.visualSpec.inputs.join(', '));
    const outputs = sanitizeMermaidLabel(concept.visualSpec.outputs.join(', '));
    const invariant = sanitizeMermaidLabel(concept.invariantRule);

    const mermaidCode = [
      'sequenceDiagram',
      '  participant Input as Raw Input Stream',
      `  participant Store as ${primaryStore}`,
      '  participant Engine as Core Invariant Loop',
      '  participant Output as Result Builder',
      `  Input->>Engine: Feed (${inputs})`,
      `  Engine->>Store: Mutate / Index state`,
      `  Note over Engine,Store: Invariant: ${invariant}`,
      '  Store-->>Engine: Return O(1) / O(log N) query result',
      `  Engine->>Output: Emit (${outputs})`,
    ].join('\n');

    return {
      type: 'DATA_STRUCTURE_TRACE',
      title: `${concept.title} — Component Interaction & Memory Trace`,
      mermaidCode,
      stepAnnotations: [
        `Primary Structure: ${concept.visualSpec.dataStores.join(' + ')}`,
        `Core Invariant: ${concept.invariantRule}`,
        `Outputs Emitted: ${concept.visualSpec.outputs.join(', ')}`,
      ],
    };
  }
}
