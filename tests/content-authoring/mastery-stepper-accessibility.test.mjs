import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'src/components/MasteryStepper.tsx'), 'utf8');

test('Pattern Forge mastery stepper exposes the active and completed stage states', () => {
  assert.match(source, /const STAGES:.*\[\]/);
  for (const stage of [
    '1. Read & Signals', '2. Dry-Run & Pair', '3. Build Code',
    '4. Compare Big-O', '5. DP Learning Lab',
  ]) assert.ok(source.includes(stage), 'missing stable mastery stage: ' + stage);
  assert.match(source, /aria-label="5-Stage Mastery Stepper"/);
  assert.match(source, /aria-pressed=\{active\}/);
  assert.match(source, /aria-current=\{active \? 'step' : undefined\}/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /min-h-11/);
  assert.match(source, /if \(!problem\) return <div role="status"/);
});
