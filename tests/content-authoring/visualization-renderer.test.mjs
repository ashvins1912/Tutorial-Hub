import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGraph } from '../../src/features/intelligent-engine/components/VisualizationRenderer.tsx';

test('parses top-down Mermaid flowcharts into safe nodes and edges', () => {
  const graph = parseGraph('flowchart TD\n  A[Upload source] --> B{Classify domain}\n  B --> C[Generate lesson]');
  assert.equal(graph.direction, 'TD');
  assert.deepEqual(graph.nodes.map((node) => node.id), ['A', 'B', 'C']);
  assert.equal(graph.nodes[0].label, 'Upload source');
  assert.equal(graph.nodes[1].shape, 'diamond');
  assert.deepEqual(graph.edges, [{ from: 'A', to: 'B', label: undefined }, { from: 'B', to: 'C', label: undefined }]);
});

test('parses left-to-right data-flow graphs and keeps bounded output', () => {
  const graph = parseGraph('graph LR\n  Client[Browser] --> API[API Gateway]\n  API --> DB[(Postgres)]');
  assert.equal(graph.direction, 'LR');
  assert.equal(graph.nodes.find((node) => node.id === 'DB')?.shape, 'database');
  assert.equal(graph.edges.length, 2);
});

test('ignores Mermaid directives and safely returns an empty graph for unsupported source', () => {
  const graph = parseGraph('sequenceDiagram\n  A->>B: request');
  assert.equal(graph.nodes.length, 0);
  assert.equal(graph.edges.length, 0);
});
test('preserves every edge in chained Mermaid flowchart statements', () => {
  const graph = parseGraph('flowchart TD\\n  A[Source] --> B[Validate] --> C[Publish] --> D[Learn]');
  assert.deepEqual(graph.nodes.map((node) => node.id), ['A', 'B', 'C', 'D']);
  assert.deepEqual(graph.edges.map(({ from, to }) => [from, to]), [['A', 'B'], ['B', 'C'], ['C', 'D']]);
});

test('bounds parsed graph nodes, edges, and source size', () => {
  const lines = ['flowchart LR', ...Array.from({ length: 45 }, (_, index) => `N${index}[Node ${index}] --> N${index + 1}[Node ${index + 1}]`)];
  const graph = parseGraph(lines.join('\\n'));
  assert.ok(graph.nodes.length <= 30);
  assert.ok(graph.edges.length <= 50);
  assert.equal(parseGraph('flowchart TD\\n' + ' '.repeat(13_000) + 'A[late node]').nodes.length, 0);
});
