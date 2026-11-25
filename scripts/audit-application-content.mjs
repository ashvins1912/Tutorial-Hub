import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const registryPath = path.join(root, 'docs/learning-surface-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Advisory scan only. It discovers review targets; it does not judge correctness
// or replace sentence-by-sentence subject-matter review.
const sourcePaths = [...new Set(registry.surfaces.flatMap((surface) => [
  ...surface.componentPaths,
  ...surface.dataSources,
  ...surface.apiRoutes,
]).filter((sourcePath) => /\.(ts|tsx|js|jsx|md|json)$/.test(sourcePath)))].sort();

const patterns = {
  absoluteClaims: /\b(always|never|guarantee(?:s|d)?|instantly|instant|100%|zero risk|perfect(?:ly)?)\b/i,
  placeholder: /\b(TODO|TBD|FIXME|lorem ipsum|coming soon|placeholder|not implemented)\b/i,
  emptyTeachingField: /\b(?:whyNeeded|explanation|summary|description|reason|hint|rationale|purpose|expectedOutcome|feedback|detail|tagline)\s*:\s*(['"])\s*\1/,
};

const counts = {
  sourceFiles: 0,
  sourceLines: 0,
  sourceWords: 0,
  absoluteClaimLines: 0,
  placeholderLines: 0,
  emptyTeachingFields: 0,
};
const findings = { absoluteClaims: [], placeholders: [], emptyTeachingFields: [] };

for (const sourcePath of sourcePaths) {
  const absolutePath = path.resolve(root, sourcePath);
  if (!absolutePath.startsWith(root + path.sep) || !fs.existsSync(absolutePath)) {
    throw new Error('Mapped learning source is missing or outside repository: ' + sourcePath);
  }
  const content = fs.readFileSync(absolutePath, 'utf8');
  const lines = content.split(/\r?\n/);
  counts.sourceFiles++;
  counts.sourceLines += lines.length;
  counts.sourceWords += (content.match(/\b[\p{L}\p{N}_'-]+\b/gu) || []).length;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const location = { path: sourcePath, line: index + 1, excerpt: line.trim().slice(0, 220) };
    if (patterns.absoluteClaims.test(line)) {
      counts.absoluteClaimLines++;
      if (findings.absoluteClaims.length < 40) findings.absoluteClaims.push(location);
    }
    if (patterns.placeholder.test(line) && !/___BLANK_\d+___/.test(line)) {
      counts.placeholderLines++;
      if (findings.placeholders.length < 40) findings.placeholders.push(location);
    }
    if (patterns.emptyTeachingField.test(line)) {
      counts.emptyTeachingFields++;
      if (findings.emptyTeachingFields.length < 40) findings.emptyTeachingFields.push(location);
    }
  }
}

const report = {
  schemaVersion: 1,
  purpose: 'Advisory first-pass scan of registered learner-facing component, data and API source paths. Counts and keyword matches are review aids, not quality scores or proof of content correctness.',
  surfaceCount: registry.surfaces.length,
  uniqueSourcePaths: sourcePaths.length,
  counts,
  findings,
  limitations: [
    'Keyword matches may be valid algorithmic invariants, code comments or intentional instructions; reviewers must inspect context.',
    'The scan does not evaluate semantic correctness, examples, code execution, visualizer alignment, quiz answers, accessibility or learner outcomes.',
    'Intentional fill-in-the-blank tokens such as ___BLANK_1___ are excluded from placeholder findings.',
    'Dynamic user-authored and database-published content is not represented by the static source inventory.',
  ],
};

console.log(JSON.stringify(report, null, 2));
