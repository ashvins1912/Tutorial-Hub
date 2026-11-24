import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript-compiler-api');

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, 'docs/learning-surface-registry.json'), 'utf8'));

// Inventory every TypeScript data source mapped to a learner-facing surface.
const sources = registry.surfaces.flatMap((surface) =>
  surface.dataSources
    .filter((sourcePath) => /\.tsx?$/.test(sourcePath))
    .map((sourcePath) => ({ surfaceId: surface.id, path: sourcePath }))
);


const stringValue = (node) => node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
const propertyMap = (node) => {
  const values = new Map();
  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : undefined;
    if (key) values.set(key, property.initializer);
  }
  return values;
};
const records = [];
const sourceSummaries = [];

for (const source of sources) {
  const absolute = path.join(root, source.path);
  if (!fs.existsSync(absolute)) throw new Error(`Missing canonical source: ${source.path}`);
  const content = fs.readFileSync(absolute, 'utf8');
  const ast = ts.createSourceFile(source.path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  let candidates = 0;
  const visit = (node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const props = propertyMap(node);
      const id = stringValue(props.get('id'));
      const title = stringValue(props.get('title')) ?? stringValue(props.get('name')) ?? stringValue(props.get('shortTitle'));
      if (id && title) {
        candidates++;
        const keys = [...props.keys()];
        const lessonSignals = ['explanation', 'workedExample', 'keyPoints', 'question', 'project', 'pitfalls'];
        const conceptSignals = ['oneSentenceRule', 'plainEnglish', 'standardDefinition', 'whyItMatters'];
        const kind = lessonSignals.some((key) => props.has(key)) ? 'lesson-candidate'
          : conceptSignals.some((key) => props.has(key)) ? 'concept-candidate' : 'topic-candidate';
        records.push({
          recordKey: `${source.surfaceId}#${source.path}#${node.getStart(ast)}#${id}`,
          surfaceId: source.surfaceId,
          sourcePath: source.path,
          sourceLine: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          id,
          title,
          candidateKind: kind,
          fieldsPresent: keys.filter((key) => ['why','outcome','explanation','analogy','keyPoints','workedExample','code','steps','question','project','pitfalls','practice','complexity','frames','quizzes'].includes(key)).sort(),
          reviewStatus: 'not_assessed',
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  sourceSummaries.push({ surfaceId: source.surfaceId, sourcePath: source.path, candidateRecords: candidates });
}

const unique = new Set();
for (const record of records) {
  if (unique.has(record.recordKey)) throw new Error(`Duplicate candidate record key ${record.recordKey}`);
  unique.add(record.recordKey);
}
const surfaceSummaries = [...new Set(sources.map((source) => source.surfaceId))].sort().map((surfaceId) => {
  const surfaceRecords = records.filter((record) => record.surfaceId === surfaceId);
  const fieldCounts = Object.fromEntries(
    [...new Set(surfaceRecords.flatMap((record) => record.fieldsPresent))].sort().map((field) => [
      field,
      surfaceRecords.filter((record) => record.fieldsPresent.includes(field)).length,
    ]),
  );
  return {
    surfaceId,
    sourceCount: sources.filter((source) => source.surfaceId === surfaceId).length,
    candidateRecordCount: surfaceRecords.length,
    candidateKinds: Object.fromEntries(
      ['lesson-candidate', 'concept-candidate', 'topic-candidate'].map((kind) => [
        kind,
        surfaceRecords.filter((record) => record.candidateKind === kind).length,
      ]),
    ),
    teachingFieldPresenceCounts: fieldCounts,
    reviewStatus: 'not_assessed',
  };
});

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  purpose: 'AST-derived candidate inventory across every TypeScript data source mapped by the canonical learning-surface registry; candidate extraction is not a quality score or verification.',
  sourceCount: sources.length,
  surfaceCount: surfaceSummaries.length,
  candidateRecordCount: records.length,
  sourceSummaries,
  surfaceSummaries,
  records,
};
console.log(JSON.stringify(output, null, 2));
