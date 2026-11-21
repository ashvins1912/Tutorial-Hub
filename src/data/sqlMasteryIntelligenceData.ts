export type SqlJoinKind =
  | 'inner'
  | 'left'
  | 'right'
  | 'full'
  | 'left-anti'
  | 'cross'
  | 'self';

export interface SqlJoinVisualSpec {
  id: SqlJoinKind;
  name: string;
  shortName: string;
  simpleEnglish: string;
  vennMask: { left: boolean; overlap: boolean; right: boolean };
  sqlExample: string;
  algorithmNote: string;
  resultRows: Array<{ leftVal: string; rightVal: string; note: string }>;
}

export const SQL_JOIN_SPECS: SqlJoinVisualSpec[] = [
  {
    id: 'inner',
    name: 'INNER JOIN',
    shortName: 'INNER',
    simpleEnglish:
      'Returns ONLY rows that have a matching key in BOTH tables. Unmatched users and orphan orders are excluded.',
    vennMask: { left: false, overlap: true, right: false },
    sqlExample: `SELECT u.name, o.product, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;`,
    algorithmNote: 'Planner picks Hash Join (unsorted bulk), Merge Join (pre-sorted), or Nested Loop + Index (selective).',
    resultRows: [
      { leftVal: '1 · Aarav', rightVal: '101 · Cloud DB ($120)', note: 'Matched' },
      { leftVal: '2 · Maya', rightVal: '102 · Cluster ($850)', note: 'Matched' },
      { leftVal: '3 · Liam', rightVal: '104 · Starter ($25)', note: 'Matched' },
    ],
  },
  {
    id: 'left',
    name: 'LEFT OUTER JOIN',
    shortName: 'LEFT',
    simpleEnglish:
      'Keeps EVERY row from the left table (`users`), filling right columns with `NULL` when no order exists.',
    vennMask: { left: true, overlap: true, right: false },
    sqlExample: `SELECT u.name, COALESCE(o.product, 'No orders yet') AS item
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;`,
    algorithmNote: 'Filter right-table predicates inside `ON` (not `WHERE`), otherwise `WHERE o.status = ...` silently turns LEFT into INNER!',
    resultRows: [
      { leftVal: '1 · Aarav', rightVal: '101 · Cloud DB ($120)', note: 'Matched' },
      { leftVal: '2 · Maya', rightVal: '102 · Cluster ($850)', note: 'Matched' },
      { leftVal: '5 · Priya (no orders)', rightVal: 'NULL', note: 'Preserved Left' },
    ],
  },
  {
    id: 'right',
    name: 'RIGHT OUTER JOIN',
    shortName: 'RIGHT',
    simpleEnglish:
      'Keeps EVERY row from the right table (`orders`), filling left columns with `NULL` if an order has an orphan/deleted user.',
    vennMask: { left: false, overlap: true, right: true },
    sqlExample: `SELECT u.name, o.order_id, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;`,
    algorithmNote: 'Mathematically identical to swapping table order and using LEFT JOIN (most style guides prefer LEFT JOIN for readability).',
    resultRows: [
      { leftVal: '1 · Aarav', rightVal: '101 · Cloud DB ($120)', note: 'Matched' },
      { leftVal: '2 · Maya', rightVal: '102 · Cluster ($850)', note: 'Matched' },
      { leftVal: 'NULL (orphan)', rightVal: '199 · Guest Checkout ($60)', note: 'Preserved Right' },
    ],
  },
  {
    id: 'full',
    name: 'FULL OUTER JOIN',
    shortName: 'FULL OUTER',
    simpleEnglish:
      'Returns EVERY row from both tables, matching where keys align and padding `NULL` on whichever side has no match.',
    vennMask: { left: true, overlap: true, right: true },
    sqlExample: `SELECT u.name, o.order_id
FROM users u
FULL OUTER JOIN orders o ON u.id = o.user_id;`,
    algorithmNote: 'Essential for financial reconciliation (comparing Ledger A vs. Bank Feed B to spot missing rows on either side).',
    resultRows: [
      { leftVal: '1 · Aarav', rightVal: '101 · Cloud DB ($120)', note: 'Matched' },
      { leftVal: '5 · Priya', rightVal: 'NULL', note: 'Left Only' },
      { leftVal: 'NULL', rightVal: '199 · Guest ($60)', note: 'Right Only' },
    ],
  },
  {
    id: 'left-anti',
    name: 'LEFT ANTI-JOIN (NOT EXISTS / IS NULL)',
    shortName: 'ANTI-JOIN',
    simpleEnglish:
      'Finds rows in the left table that have ZERO matches in the right table—NULL-safe and faster than `NOT IN`.',
    vennMask: { left: true, overlap: false, right: false },
    sqlExample: `SELECT u.id, u.name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);`,
    algorithmNote: 'Postgres/MySQL execute `NOT EXISTS` as a Hash/Merge Anti-Join that short-circuits on the very first match.',
    resultRows: [
      { leftVal: '5 · Priya (no orders)', rightVal: 'EXCLUDED', note: 'Zero Orders' },
    ],
  },
  {
    id: 'cross',
    name: 'CROSS JOIN (Cartesian Product)',
    shortName: 'CROSS',
    simpleEnglish:
      'Pairs EVERY row on the left with EVERY row on the right (`M × N` rows). Great for generating calendar × region matrices.',
    vennMask: { left: true, overlap: true, right: true },
    sqlExample: `SELECT r.region, p.tier
FROM regions r
CROSS JOIN pricing_tiers p;`,
    algorithmNote: 'Caution: 10,000 × 10,000 = 100,000,000 rows! Never omit an ON clause accidentally.',
    resultRows: [
      { leftVal: 'US-East', rightVal: 'FREE', note: 'Pair 1' },
      { leftVal: 'US-East', rightVal: 'PRO', note: 'Pair 2' },
      { leftVal: 'EU-West', rightVal: 'FREE', note: 'Pair 3' },
      { leftVal: 'EU-West', rightVal: 'PRO', note: 'Pair 4' },
    ],
  },
  {
    id: 'self',
    name: 'SELF JOIN (Hierarchical / Peer Compare)',
    shortName: 'SELF JOIN',
    simpleEnglish:
      'Joins a table back to itself using two aliases (e.g., `e` for employee and `m` for manager, or comparing day-over-day prices).',
    vennMask: { left: false, overlap: true, right: false },
    sqlExample: `SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;`,
    algorithmNote: 'Always index the self-referencing foreign key (`manager_id`); use `WITH RECURSIVE` for arbitrary tree depth.',
    resultRows: [
      { leftVal: 'Aarav (Staff Eng)', rightVal: 'Maya (VP Eng)', note: 'Reports To' },
      { leftVal: 'Maya (VP Eng)', rightVal: 'NULL (CEO)', note: 'Top Level' },
    ],
  },
];

export type SqlReferenceCategory =
  | 'operators'
  | 'functions'
  | 'window-agg'
  | 'fetch-patterns'
  | 'fast-insert-compression';

export interface SqlReferenceItem {
  id: string;
  category: SqlReferenceCategory;
  title: string;
  syntax: string;
  simpleEnglish: string;
  performanceNote: string;
  sqlExample: string;
}

export const SQL_COMPLETE_REFERENCE: SqlReferenceItem[] = [
  // 1. ALL SQL OPERATORS
  {
    id: 'op-comparison-range',
    category: 'operators',
    title: 'Comparison, Range & Membership (=, <>, >, >=, BETWEEN, IN, ANY/ALL)',
    syntax: 'col = v | col BETWEEN a AND b | col IN (v1, v2) | col > ANY(subquery)',
    simpleEnglish:
      'Filter rows by exact equality, numeric/date ranges (`BETWEEN` is inclusive on both ends), or list membership (`IN`).',
    performanceNote:
      'All SARGable when the column sits bare on the left side. Prefer `>= start AND < end` for timestamps instead of `BETWEEN` to avoid 23:59:59.999 gaps.',
    sqlExample: `SELECT order_id, product, amount
FROM orders
WHERE amount BETWEEN 100 AND 900
  AND status IN ('PAID', 'SHIPPED');`,
  },
  {
    id: 'op-pattern-null',
    category: 'operators',
    title: 'Pattern Matching, Logical & NULL-Safe Operators (LIKE, ILIKE, SIMILAR, IS NULL, IS DISTINCT FROM)',
    syntax: "LIKE 'prefix%' | ILIKE '%case%' | IS [NOT] NULL | IS NOT DISTINCT FROM",
    simpleEnglish:
      '`%` matches any sequence of characters and `_` matches 1 character. Never write `col = NULL` (always UNKNOWN!)—use `IS NULL` or `IS DISTINCT FROM`.',
    performanceNote:
      "Prefix `LIKE 'Cloud%'` uses B-Tree; substring `LIKE '%Cloud%'` needs a GIN `pg_trgm` trigram index.",
    sqlExample: `SELECT order_id, product, status
FROM orders
WHERE product LIKE 'Cloud%'
  AND status IS NOT NULL;`,
  },
  {
    id: 'op-set-ops',
    category: 'operators',
    title: 'Set Operators (UNION, UNION ALL, INTERSECT, EXCEPT)',
    syntax: 'SELECT ... UNION ALL SELECT ... | INTERSECT | EXCEPT',
    simpleEnglish:
      'Combine results from two queries vertically: `UNION ALL` appends fast without deduplicating, `INTERSECT` keeps shared rows, and `EXCEPT` subtracts right rows from left.',
    performanceNote:
      'Always prefer `UNION ALL` over `UNION` when datasets are disjoint—saves an entire O(N log N) sort/hash deduplication stage.',
    sqlExample: `SELECT user_id, 'ACTIVE' AS src FROM orders WHERE status = 'PAID'
UNION ALL
SELECT user_id, 'SHIPPED' AS src FROM orders WHERE status = 'SHIPPED';`,
  },
  {
    id: 'op-arithmetic-json',
    category: 'operators',
    title: 'Arithmetic, Bitwise & JSONB Operators (+, -, *, /, %, ||, ->, ->>, @>)',
    syntax: "amount * 1.18 | first || ' ' || last | payload->>'tier' | payload @> '{\"vip\":true}'",
    simpleEnglish:
      'Compute derived metrics inline, concatenate strings (`||`), or query semi-structured JSONB documents directly inside SQL.',
    performanceNote:
      'PostgreSQL JSONB containment (`@>`) and key existence (`?`) are accelerated in O(log N) by a `GIN (payload jsonb_path_ops)` index.',
    sqlExample: `SELECT id, payload->>'plan' AS plan
FROM accounts
WHERE payload @> '{"active": true, "region": "us-east"}';`,
  },

  // 2. SCALAR, STRING, DATE & CONDITIONAL FUNCTIONS
  {
    id: 'fn-string',
    category: 'functions',
    title: 'String Functions (UPPER, LOWER, TRIM, SUBSTRING, CONCAT, REPLACE, SPLIT_PART, LENGTH)',
    syntax: "UPPER(name), TRIM(s), SUBSTRING(s FROM 1 FOR 4), CONCAT_WS(' ', a, b)",
    simpleEnglish:
      'Clean, normalize, slice, and format text directly in the query layer without pulling extra columns into app code.',
    performanceNote:
      'Avoid applying `LOWER(email)` on an unindexed WHERE column—create a functional index `ON users (LOWER(email))` or use `citext`.',
    sqlExample: `SELECT UPPER(name) AS upper_name, LOWER(email) AS clean_email, LENGTH(name) AS name_len
FROM users
ORDER BY name_len DESC;`,
  },
  {
    id: 'fn-null-conditional',
    category: 'functions',
    title: 'Conditional & Null Functions (CASE WHEN, COALESCE, NULLIF, GREATEST, LEAST)',
    syntax: "COALESCE(col, 'default') | NULLIF(denom, 0) | CASE WHEN ... THEN ... ELSE ... END",
    simpleEnglish:
      '`COALESCE` picks the first non-NULL fallback. `NULLIF(x, 0)` prevents division-by-zero crashes cleanly. `CASE` adds inline if/else categorization.',
    performanceNote:
      '`CASE` inside `SUM(CASE WHEN status = \'PAID\' THEN amount ELSE 0 END)` (or `FILTER (WHERE ...)`) pivots multiple KPIs in ONE table scan!',
    sqlExample: `SELECT product, amount,
  CASE WHEN amount >= 300 THEN 'ENTERPRISE' ELSE 'STANDARD' END AS tier
FROM orders
ORDER BY amount DESC;`,
  },
  {
    id: 'fn-math-date',
    category: 'functions',
    title: 'Math & Date/Time Functions (ROUND, FLOOR, CEIL, ABS, DATE_TRUNC, EXTRACT, INTERVAL, AGE)',
    syntax: "ROUND(amt, 2) | DATE_TRUNC('month', created_at) | NOW() - INTERVAL '7 days'",
    simpleEnglish:
      'Bucket timestamps cleanly into hourly/daily/monthly rollups (`DATE_TRUNC`) and perform safe rounding and calendar arithmetic.',
    performanceNote:
      "Use `created_at >= NOW() - INTERVAL '7 days'` (SARGable index range) instead of `DATE_TRUNC('day', created_at) = ...` in WHERE.",
    sqlExample: `SELECT DATE_TRUNC('day', created_at) AS day_bucket,
       ROUND(AVG(amount), 2) AS avg_order
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1 DESC;`,
  },

  // 3. AGGREGATE & WINDOW FUNCTIONS
  {
    id: 'agg-groupby-having',
    category: 'window-agg',
    title: 'Aggregates, GROUP BY, HAVING, ROLLUP & CUBE',
    syntax: 'COUNT(DISTINCT col), SUM, AVG, MIN, MAX, STRING_AGG, ARRAY_AGG · GROUP BY ... HAVING',
    simpleEnglish:
      '`WHERE` filters individual rows BEFORE grouping; `HAVING` filters summarized groups AFTER `COUNT`/`SUM` runs.',
    performanceNote:
      'Always push row filters into `WHERE` (not `HAVING`) so indexes prune rows before aggregation memory is allocated.',
    sqlExample: `SELECT status, COUNT(*) AS orders_cnt, SUM(amount) AS total_rev, AVG(amount) AS avg_ticket
FROM orders
GROUP BY status
HAVING total_rev > 100
ORDER BY total_rev DESC;`,
  },
  {
    id: 'win-ranking-analytics',
    category: 'window-agg',
    title: 'Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, SUM() OVER, NTILE)',
    syntax: 'FUNC() OVER (PARTITION BY grp ORDER BY col ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)',
    simpleEnglish:
      'Compute running totals, Top-N per group, and previous-row deltas (`LAG`/`LEAD`) WITHOUT collapsing rows like `GROUP BY` does!',
    performanceNote:
      'A composite index on `(partition_col, order_col)` eliminates the expensive Window Sort step completely.',
    sqlExample: `SELECT user_id, order_id, amount,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn,
  SUM(amount) OVER (PARTITION BY user_id ORDER BY order_id) AS running_spend,
  LAG(amount) OVER (PARTITION BY user_id ORDER BY order_id) AS prev_amount
FROM orders;`,
  },

  // 4. EVERY WAY TO WRITE SQL FOR FETCHING DATA
  {
    id: 'fetch-cte-recursive',
    category: 'fetch-patterns',
    title: 'CTEs (WITH) & Recursive CTEs (Hierarchies / Graphs / Org Charts)',
    syntax: 'WITH cte AS (...) SELECT ... | WITH RECURSIVE tree AS (base UNION ALL recursive)',
    simpleEnglish:
      'Break giant unreadable queries into clean named building blocks (`WITH`). Add `RECURSIVE` to walk parent-child trees (folders, org charts, BOMs) in one round trip.',
    performanceNote:
      'PostgreSQL 12+ automatically inlines non-materialized CTEs so outer `WHERE` filters push down into indexes; use `AS MATERIALIZED` only when intentionally caching.',
    sqlExample: `WITH paid_orders AS (
  SELECT user_id, SUM(amount) AS spend
  FROM orders
  WHERE status = 'PAID'
  GROUP BY user_id
)
SELECT u.name, p.spend
FROM users u
JOIN paid_orders p ON p.user_id = u.id
ORDER BY p.spend DESC;`,
  },
  {
    id: 'fetch-subquery-exists-lateral',
    category: 'fetch-patterns',
    title: 'Subqueries, Semi-Join (EXISTS) & LATERAL Top-N Per Group',
    syntax: 'WHERE EXISTS (SELECT 1 ...) | CROSS/LEFT JOIN LATERAL (SELECT ... LIMIT 3) t ON true',
    simpleEnglish:
      '`EXISTS` checks whether at least one matching row exists (stopping immediately on the first match). `LATERAL` runs a correlated Top-K lookup per outer row using an index!',
    performanceNote:
      'When fetching the latest 3 orders per user for 50 users, `JOIN LATERAL (... ORDER BY created_at DESC LIMIT 3)` beats a full-table Window scan by 50x!',
    sqlExample: `SELECT u.id, u.name, recent.order_id, recent.amount
FROM users u
LEFT JOIN LATERAL (
  SELECT o.order_id, o.amount
  FROM orders o
  WHERE o.user_id = u.id
  ORDER BY o.order_id DESC
  LIMIT 2
) recent ON true;`,
  },
  {
    id: 'fetch-keyset-covering',
    category: 'fetch-patterns',
    title: 'Ultra-Fast Fetch: Keyset (Seek) Pagination + Covering Index-Only Scans',
    syntax: 'CREATE INDEX ... (status, order_id) INCLUDE (amount) · WHERE order_id > $cursor LIMIT 50',
    simpleEnglish:
      'Skip slow `OFFSET 100000` by bookmarking the last seen ID (`WHERE order_id > $last_id`) and store projected columns inside `INCLUDE` so the database never even opens the main table!',
    performanceNote:
      'Index-Only Scans eliminate random heap page I/O; Keyset pagination keeps page 10,000 just as fast (~0.4 ms) as page 1.',
    sqlExample: `-- Covering Index enables Index-Only Scan:
CREATE INDEX idx_orders_status_cover ON orders (status, order_id) INCLUDE (product, amount);

-- O(log N) Seek Pagination (Zero wasted OFFSET rows):
SELECT order_id, product, amount
FROM orders
WHERE status = 'PAID' AND order_id > 100
ORDER BY order_id ASC
LIMIT 50;`,
  },

  // 5. FAST FETCH TO INSERT COMPRESSION
  {
    id: 'ingest-copy-batch-compress',
    category: 'fast-insert-compression',
    title: 'Fast Fetch -> Compressed Bulk Insert (COPY Binary, Batch VALUES, TOAST LZ4 & Columnar ZSTD)',
    syntax: 'COPY ... FROM STDIN (FORMAT binary) | SET COMPRESSION lz4 | INSERT ... SELECT + UNLOGGED',
    simpleEnglish:
      'Never fetch rows and loop single-row `INSERT`s! Stream narrow projected columns in batches (1k–10k rows or `COPY`), turn on LZ4/ZSTD compression, and build secondary indexes AFTER bulk loading.',
    performanceNote:
      'Combining Keyset/Covering fetch + `COPY` binary + LZ4/ZSTD compression increases throughput 15x–50x while shrinking storage by 65%–85%!',
    sqlExample: `-- 1. Enable fast LZ4 compression on wide JSON/TEXT columns (PostgreSQL 14+):
ALTER TABLE order_snapshots ALTER COLUMN payload SET COMPRESSION lz4;

-- 2. Single-pass Fast Fetch -> Bulk Insert with conflict safety:
INSERT INTO order_snapshots (order_id, user_id, amount, status)
SELECT order_id, user_id, amount, status
FROM orders
WHERE status = 'PAID'
ON CONFLICT (order_id) DO NOTHING;`,
  },
];

export interface SqlIntelligencePreset {
  id: string;
  label: string;
  category: string;
  sql: string;
}

export const SQL_INTELLIGENCE_PRESETS: SqlIntelligencePreset[] = [
  {
    id: 'intel-wildcard-star',
    label: 'SELECT * + Leading Wildcard',
    category: 'Fetch Anti-Pattern',
    sql: `SELECT *
FROM orders
WHERE LOWER(status) = 'paid'
  AND product LIKE '%Cloud%'
ORDER BY order_id DESC
OFFSET 5000 LIMIT 50;`,
  },
  {
    id: 'intel-not-in-union',
    label: 'NOT IN Trap + UNION Sort',
    category: 'Correctness & Sort',
    sql: `SELECT id, name FROM users
WHERE id NOT IN (SELECT user_id FROM orders)
UNION
SELECT id, name FROM users WHERE city = 'Seattle' OR plan = 'ENTERPRISE';`,
  },
  {
    id: 'intel-row-by-row-insert',
    label: 'Row-by-Row INSERT Loop',
    category: 'Insert & Compression',
    sql: `INSERT INTO orders (order_id, user_id, product, amount, status) VALUES (201, 1, 'Log Pack', 40, 'PAID');
INSERT INTO orders (order_id, user_id, product, amount, status) VALUES (202, 2, 'Log Pack', 40, 'PAID');
INSERT INTO orders (order_id, user_id, product, amount, status) VALUES (203, 4, 'Log Pack', 40, 'PAID');`,
  },
  {
    id: 'intel-unbounded-update',
    label: 'Unbounded UPDATE (SEV-1)',
    category: 'DML Safety',
    sql: `UPDATE orders SET status = 'ARCHIVED';`,
  },
  {
    id: 'intel-tuned-gold',
    label: 'Well-Tuned Keyset Query',
    category: 'Gold Standard',
    sql: `SELECT order_id, product, amount
FROM orders
WHERE order_id > 100 AND amount BETWEEN 50 AND 900
ORDER BY order_id ASC
LIMIT 25;`,
  },
];

export interface CompressionPipelineStage {
  step: number;
  title: string;
  subtitle: string;
  plainEnglish: string;
  mechanism: string;
  impact: string;
}

export const FAST_FETCH_TO_COMPRESS_STAGES: CompressionPipelineStage[] = [
  {
    step: 1,
    title: '1. Narrow Covering Fetch',
    subtitle: 'Index-Only + Keyset Seek',
    plainEnglish:
      'Pull only needed columns using a covering B-Tree index and keyset cursor (`WHERE id > $last_id`) so zero heap pages or skipped OFFSET rows are wasted.',
    mechanism: 'Projection Pushdown + Index-Only Scan + Server-side Binary Cursor',
    impact: '5x–40x faster source extraction',
  },
  {
    step: 2,
    title: '2. Micro-Batch & Wire Compress',
    subtitle: '1k–10k Rows + LZ4/ZSTD',
    plainEnglish:
      'Group rows into 1,000–10,000 row chunks and compress them on the wire with LZ4 or ZSTD before transmitting—cutting network round-trips by 99.9%.',
    mechanism: 'Binary framing (`COPY FORMAT binary` / Arrow IPC) + ZSTD stream compression',
    impact: '70%–85% less network traffic',
  },
  {
    step: 3,
    title: '3. Bulk Stage & WAL Minimization',
    subtitle: 'COPY / UNLOGGED / Deferred Index',
    plainEnglish:
      'Stream batches into an `UNLOGGED` staging table or bulk `COPY`, dropping/deferring secondary indexes until after load to avoid millions of random B-Tree page splits.',
    mechanism: 'Sequential heap append + single bottom-up B-Tree build (`CREATE INDEX CONCURRENTLY`)',
    impact: '10x–35x higher insert rows/sec',
  },
  {
    step: 4,
    title: '4. Storage Page & Column Compression',
    subtitle: 'TOAST LZ4 / Dictionary / Delta / ZSTD',
    plainEnglish:
      'Compress stored data at rest: PostgreSQL `TOAST LZ4` compresses wide JSON/TEXT fields at GB/s speed; analytical/time-series sinks apply Delta + RLE + Dictionary + ZSTD.',
    mechanism: 'Row-store TOAST LZ4 (OLTP) · Columnar Parquet/ClickHouse ZSTD + Delta (OLAP)',
    impact: '3x–8x smaller storage & faster cache hits',
  },
];
