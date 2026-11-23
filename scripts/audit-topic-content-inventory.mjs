import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.cwd();
const sources = [
  { surfaceId: 'ai-engineering', path: 'src/data/aiEngineeringData.ts' },
  { surfaceId: 'db-internals', path: 'src/data/databaseInternalsData.ts' },
  { surfaceId: 'devops-cloud', path: 'src/data/devopsCloudCurriculumData.ts' },
  { surfaceId: 'full-stack', path: 'src/data/fullStackArchitectureData.ts' },
  { surfaceId: 'system-design', path: 'src/data/systemDesignData.ts' },
  { surfaceId: 'languages', path: 'src/data/languagesTutorialData.ts' },
  { surfaceId: 'ood', path: 'src/data/ood/oopsAndSolidData.ts' },
  { surfaceId: 'fuzzy-search', path: 'src/data/ngramTaxonomy.ts' },
  { surfaceId: 'flight-simulator', path: 'src/data/flightSimulatorData.ts' },
  { surfaceId: 'ai-academy', path: 'src/features/ai-academy/data/aiEngineeringCurriculum.ts' },
  { surfaceId: 'workspace', path: 'src/features/topics/data/curriculumIndex.ts' },
  { surfaceId: 'workspace', path: 'src/data/dsaCompleteLessons.ts' },
];

const stringValue = (node) => ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : undefined;
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
  const key = `${record.sourcePath}#${record.id}`;
  if (unique.has(key)) throw new Error(`Duplicate candidate ID ${key}`);
  unique.add(key);
}
const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  purpose: 'AST-derived candidate inventory only; candidate extraction is not a quality score or verification.',
  sourceCount: sources.length,
  candidateRecordCount: records.length,
  sourceSummaries,
  records,
};
console.log(JSON.stringify(output, null, 2));
