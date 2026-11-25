import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript-compiler-api');
const root = process.cwd();

function sentenceUnits(value) {
  const text = value.replace(/\s+/g, ' ').trim();
  if (!text) return [];
  // Keep punctuation attached; this is a review-candidate split, not a grammar parser.
  return text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/u).map((part) => part.trim()).filter(Boolean);
}

function getPropertyName(node) {
  let current = node.parent;
  while (current) {
    if (ts.isPropertyAssignment(current)) {
      const name = current.name;
      return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;
    }
    if (ts.isJsxAttribute(current)) return current.name.getText();
    if (ts.isStatement(current)) break;
    current = current.parent;
  }
  return undefined;
}

function isImportOrExportLiteral(node) {
  let current = node.parent;
  while (current) {
    if (ts.isImportDeclaration(current) || ts.isExportDeclaration(current)) return true;
    if (ts.isStatement(current)) return false;
    current = current.parent;
  }
  return false;
}

export function buildSentenceInventory() {
  const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/learning-surface-registry.json'), 'utf8'));
  const sourcePaths = [...new Set(registry.surfaces.flatMap((surface) => [
    ...surface.componentPaths, ...surface.dataSources, ...surface.apiRoutes,
  ]).filter((sourcePath) => /\.(ts|tsx|js|jsx|md|json)$/.test(sourcePath)))].sort();
  const records = [];
  const missing = [];
  for (const sourcePath of sourcePaths) {
    const absolute = path.resolve(root, sourcePath);
    if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute)) {
      missing.push(sourcePath);
      continue;
    }
    const content = fs.readFileSync(absolute, 'utf8');
    const scriptKind = sourcePath.endsWith('.tsx') ? ts.ScriptKind.TSX
      : sourcePath.endsWith('.jsx') ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
    const ast = ts.createSourceFile(sourcePath, content, ts.ScriptTarget.Latest, true, scriptKind);
    const add = (value, node, kind) => {
      const units = sentenceUnits(value);
      const location = ast.getLineAndCharacterOfPosition(node.getStart(ast));
      units.forEach((sentence, sentenceIndex) => records.push({
        sourcePath,
        line: location.line + 1,
        column: location.character + 1,
        kind,
        property: getPropertyName(node) ?? null,
        literal: value,
        sentenceIndex,
        sentence,
        reviewStatus: 'unreviewed',
        disposition: null,
        rationale: null,
      }));
    };
    const visit = (node) => {
      if (ts.isStringLiteral(node) && !isImportOrExportLiteral(node)) add(node.text, node, 'string-literal');
      else if (ts.isNoSubstitutionTemplateLiteral(node)) add(node.text, node, 'template-literal');
      else if (ts.isJsxText(node)) add(node.getText(ast), node, 'jsx-text');
      ts.forEachChild(node, visit);
    };
    visit(ast);
  }
  const countsBySource = {};
  for (const record of records) countsBySource[record.sourcePath] = (countsBySource[record.sourcePath] ?? 0) + 1;
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: 'Static sentence-unit discovery for review. Every unit is unreviewed by default; extraction does not prove that it renders, is learner-facing, or is technically correct.',
    surfaceCount: registry.surfaces.length,
    sourceCount: sourcePaths.length,
    missingSources: missing,
    sentenceUnitCount: records.length,
    countsBySource,
    records,
    limitations: [
      'Static literal extraction misses runtime/database/generated text and may include code identifiers, CSS, routes, internal labels and strings that never render.',
      'Sentence splitting is heuristic; a reviewer must merge/split units correctly and inspect the surrounding context.',
      'Every record starts unreviewed. Do not treat this inventory as an audit verdict.',
    ],
  };
}

const inventory = buildSentenceInventory();
if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(inventory, null, 2) + '\n');
} else {
  const { records, ...summary } = inventory;
  process.stdout.write(JSON.stringify({ ...summary, sample: records.slice(0, 20) }, null, 2) + '\n');
}
