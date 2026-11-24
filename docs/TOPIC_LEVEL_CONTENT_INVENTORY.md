# Topic-level content inventory

The topic-level inventory is generated from the TypeScript AST of 27 canonical source files across 11 learning surfaces, listed in `scripts/audit-topic-content-inventory.mjs`.

## What the inventory means

- A candidate record is an object literal with a stable string `id` and a display field (`title`, `name`, or `shortTitle`).
- The source path and line are retained so a reviewer can navigate to the authored content.
- Candidate kind is a structural hint based on fields; it is not a claim that the record is a complete lesson.
- `fieldsPresent` reports selected teaching signals that are present on that exact object. It does not judge their depth, correctness, rendering or usefulness.
- Every record remains `not_assessed`. No score, mastery, verification or learning outcome is inferred from source shape.

## Initial canonical coverage

The expanded extraction covers 27 canonical source files across AI engineering, database internals, DevOps/cloud, full-stack architecture, system design, programming languages, OOP/SOLID, fuzzy search, flight simulator, AI academy, the DSA curriculum workspace and algorithm packs. Several surfaces have multiple canonical sources; the source path is part of record identity so IDs are not silently conflated.

## Run

```bash
npm run audit:topic-inventory
```

The command prints a machine-readable JSON report to stdout. CI runs it as a deterministic inventory regression check. Expand the source manifest only after confirming the path is canonical in `docs/learning-surface-registry.json`.

## Known limitations and next review gates

- The first pass intentionally inventories ID/title objects, not every prose paragraph, diagram, code sample, quiz option or simulator frame.
- Some datasets compose their content through imported arrays. Those imports are listed as separate sources only when explicitly added to the manifest.
- Candidate classification is heuristic and must be reviewed before it is used for lesson scorecards.
- Technical accuracy, examples, code execution, accessibility, visualization fidelity, assessment alignment, transfer and retention require separate evidence.
