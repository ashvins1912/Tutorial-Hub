# Interview Problem Catalog API

The catalog is MongoDB-backed and starts with the topic-wise master inventory. Inventory-only entries are deliberately marked `contentStatus: needs-authoring`; the importer does not fabricate official statements, examples, constraints, or solutions.

## Endpoints

- `GET /api/interview-problems?topicId=&q=&contentStatus=&page=&limit=` — paginated catalog.
- `GET /api/interview-problems/:slug` — fetch one record.
- `POST /api/interview-problems/upsert` — create/update with hybrid duplicate resolution.
- `PATCH /api/interview-problems/:slug` — enrich an existing record by stable slug.

Write endpoints require `x-problem-catalog-token`, configured server-side as `PROBLEM_CATALOG_ADMIN_TOKEN`. Do not expose this token to browser code.

### Upsert body

```json
{
  "title": "Longest Common Subsequence",
  "topicId": "dynamic-programming",
  "topic": "Dynamic Programming",
  "difficulty": "Medium",
  "statement": "Full verified problem statement...",
  "examples": [{"input":"text1 = \"abcde\", text2 = \"ace\"","output":"3","explanation":"\"ace\" is the longest common subsequence."}],
  "constraints": ["1 <= text1.length, text2.length <= 1000"],
  "stages": {
    "understand": {"concept":"...","prerequisites":["..."]},
    "visualize": {"diagram":"...","animationSteps":["..."]},
    "implement": {"bruteForce":"...","better":"...","optimal":"...","java":"...","javascript":"...","python":"..."},
    "practice": {"hints":["..."],"testCases":[{"input":"...","expected":"..."}]},
    "master": {"proof":"...","timeComplexity":"...","spaceComplexity":"...","quiz":["..."],"revisionDays":[1,3,7,14,30]}
  }
}
```

### Resolution policy

1. Normalize Unicode, punctuation, case, and whitespace; exact normalized title wins.
2. Explicit aliases are accepted only within the same topic.
3. Otherwise combine token Jaccard (0.38), character trigram Dice (0.34), edit similarity (0.18), and topic agreement (0.10).
4. Fuzzy auto-update requires confidence >= 0.96, same topic, and >= 0.08 margin over the runner-up.
5. Scores >= 0.82 that are not safe matches return HTTP 409 with candidates for human review. Lower scores create a distinct record.
6. Startup imports use the unique (topicId, normalizedTitle) key and `$setOnInsert`, so restarts never overwrite authored content.

A record can only be marked `validated` after statement, examples, constraints, and implementation/practice/master stage evidence are supplied.
