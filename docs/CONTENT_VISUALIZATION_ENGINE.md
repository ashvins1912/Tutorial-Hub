# Phase 3 — Interactive Visualization and Simulation Engine

The Content Studio review UI renders generated visualization specifications as interactive, safe React/SVG components. No generated HTML or SVG string is injected into the DOM.

## Supported visualization formats

| Generated type | Renderer behavior |
|---|---|
| `mermaid` flowchart / graph | Parses simple TD/LR node and edge syntax and renders an SVG graph |
| `mermaid` sequenceDiagram | Renders participants, lifelines and request/message arrows |
| `mermaid` erDiagram | Renders entities, supplied fields and relationships |
| `step-animation` | Play/pause, reset, previous/next, step selection and progress |
| Algorithm animation state | Renders `array` or `values` as indexed cells and highlights pointer/index fields such as `left`, `right`, `mid`, `index`, `pointer`, plus `activeIndices` |
| `chart-spec` | Renders bar, line and scatter charts from JSON data |
| `table` | Renders JSON row arrays/objects or tab-separated source |
| `equation` | Displays source equation text in a readable, scrollable math panel |

## Mermaid subset
Use `flowchart TD`, `flowchart LR`, `sequenceDiagram` or `erDiagram`. Complex Mermaid constructs (class diagrams, gantt, mindmaps, state diagrams, subgraph styling and arbitrary Mermaid directives) are not fully implemented and may fall back to the source representation. The renderer deliberately uses a bounded subset rather than executing model-supplied HTML or SVG.

## Chart source shape
`chart-spec.source` must be a JSON string:
```json
{
  "chartType": "bar",
  "xKey": "step",
  "series": [{ "dataKey": "comparisons", "label": "Comparisons" }],
  "data": [
    { "step": "1", "comparisons": 8 },
    { "step": "2", "comparisons": 5 }
  ]
}
```

## Animation state shape
A step may include a compact state object:
```json
{
  "array": [4, 1, 7, 2],
  "left": 0,
  "right": 3,
  "mid": 1,
  "activeIndices": [1, 3],
  "phase": "compare pivot"
}
```
The UI highlights the indexed cells and exposes other state values as labels. State is instructional data only; it is not executed.

## Safety and limitations
- Text is rendered as React text nodes. No `dangerouslySetInnerHTML`, script execution, iframe, or remote diagram service.
- Mermaid parsing is intentionally limited to a safe subset and node/edge counts are bounded.
- Generated source remains unverified. The renderer does not prove diagram correctness or execute algorithms.
- SVG labels are truncated for layout stability; source specification remains available in a disclosure panel.
