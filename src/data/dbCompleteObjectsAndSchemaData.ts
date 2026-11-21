export type DbObjectCategory = 'relational' | 'non-relational';

export type DbObjectSimKind =
  | 'window-fn'
  | 'view-matview'
  | 'trigger-fk'
  | 'nosql-assoc';

export interface DbMiniDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

export interface DbMiniDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface DbMiniDfdStep {
  step: number;
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetLabel: string;
}

export interface DbObjectModule {
  id: string;
  shortTitle: string;
  title: string;
  category: DbObjectCategory;
  simKind: DbObjectSimKind;
  tagline: string;
  simpleEnglish: string;
  standardDefinition: string;
  useCases: string[];
  whenToUse: string;
  whenNotToUse: string;
  performanceTip: string;
  codeLanguage: 'SQL (PostgreSQL 16+)' | 'NoSQL (MongoDB / DynamoDB / Cypher)';
  codeExample: string;
  dfdNodes: DbMiniDfdNode[];
  dfdEdges: DbMiniDfdEdge[];
  dfdSteps: DbMiniDfdStep[];
}

export type SqlScenarioLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Principal';

export interface SqlScenarioRule {
  id: string;
  label: string;
  hint: string;
  test: (sql: string) => boolean;
}

export interface SqlProgressiveScenario {
  id: string;
  number: string;
  level: SqlScenarioLevel;
  title: string;
  concepts: string;
  businessScenario: string;
  schemaSummary: string;
  plainEnglishGoal: string;
  starterSql: string;
  solutionSql: string;
  walkthrough: string[];
  rules: SqlScenarioRule[];
}

export type SchemaTechniqueCategory =
  | 'Relational Modeling'
  | 'Analytics & Warehouse'
  | 'Scale & Multi-Tenancy'
  | 'NoSQL & Eventing';

export interface SchemaEntityCard {
  name: string;
  role: string;
  columns: { name: string; type: string; badge?: 'PK' | 'FK' | 'IDX' | 'UK' }[];
}

export interface DbSchemaTechnique {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  category: SchemaTechniqueCategory;
  workloadMatch: 'oltp' | 'analytics' | 'saas' | 'audit' | 'scale';
  tagline: string;
  simpleEnglish: string;
  technicalExplanation: string;
  whyUse: string;
  whenToUse: string[];
  whenToAvoid: string[];
  tradeOffs: {
    readSpeed: string;
    writeSpeed: string;
    consistency: string;
    storageCost: string;
  };
  entities: SchemaEntityCard[];
  ddlBlueprint: string;
}

/* ============================================================================
   TRACK 1: RELATIONAL & NON-RELATIONAL OBJECTS, FUNCTIONS & ASSOCIATIONS (12)
   ============================================================================ */

export const DB_OBJECT_AND_ASSOC_MODULES: DbObjectModule[] = [
  {
    id: 'views-materialized-views',
    shortTitle: 'Views & MatViews',
    title: 'SQL Views vs Materialized Views (Virtual Queries vs Precomputed Snapshots)',
    category: 'relational',
    simKind: 'view-matview',
    tagline: 'Hide complex joins and sensitive columns with Virtual Views; accelerate heavy dashboards with Materialized Views.',
    simpleEnglish:
      'A regular View is like a saved bookmark for a complex SELECT query—it stores zero data and always runs live when you read it. A Materialized View is like printing out that report and pinning it to the wall: reading it takes 1 millisecond, but you must refresh the printout whenever underlying tables change!',
    standardDefinition:
      'A Standard View is a logical relation stored purely as a rewritten AST query definition in system catalogs (zero physical storage, 100% fresh). A Materialized View physically persists the query result set on disk, supports its own B-Tree/GIN indexes, and updates asynchronously via REFRESH MATERIALIZED VIEW [CONCURRENTLY].',
    useCases: [
      'Security abstraction: expose public user_profiles view hiding password_hash, ssn, and internal flags.',
      'Backward compatibility: refactor 1 big table into 2 normalized tables while keeping legacy queries working via a View.',
      'Executive BI dashboards: pre-aggregate 50M order rows into a daily Materialized View queried in <5ms.',
      'Cross-join reporting: index a Materialized View on derived columns impossible to index cleanly across base tables.',
    ],
    whenToUse:
      'Use a Standard View for security encapsulation, DRY query reuse, and 100% live data. Use a Materialized View when heavy aggregations run frequently and slight staleness (seconds to hours) is acceptable.',
    whenNotToUse:
      'Avoid deeply nested Views-on-Views (optimizer blindness & slow plans). Avoid Materialized Views for real-time banking balances or sub-second inventory counters where stale reads cause double-spending.',
    performanceTip:
      'Always create a UNIQUE INDEX on a Materialized View so you can run REFRESH MATERIALIZED VIEW CONCURRENTLY without blocking live readers!',
    codeLanguage: 'SQL (PostgreSQL 16+)',
    codeExample: `-- 1. Standard View: Security & clean abstraction (always 100% live)
CREATE OR REPLACE VIEW v_public_customers AS
SELECT id, full_name, tier, created_at
FROM customers
WHERE deleted_at IS NULL;

-- 2. Materialized View: Physically stored pre-aggregation (ultra-fast reads)
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
    DATE_TRUNC('day', placed_at) AS sales_day,
    region,
    COUNT(*)                     AS order_count,
    SUM(total_cents)             AS revenue_cents
FROM orders
WHERE status = 'PAID'
GROUP BY 1, 2;

-- Required UNIQUE index to enable lock-free concurrent refreshes!
CREATE UNIQUE INDEX idx_mv_daily_rev_pk
    ON mv_daily_revenue (sales_day, region);

-- Non-blocking refresh (readers keep querying previous snapshot during rebuild)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_revenue;`,
    dfdNodes: [
      { id: 'q', label: 'Client SELECT', sublabel: 'FROM view / mv', x: 78, y: 110 },
      { id: 'rw', label: 'Query Rewriter', sublabel: 'Expand View AST', x: 248, y: 58 },
      { id: 'mv', label: 'MatView Snapshot', sublabel: 'Indexed Heap', x: 424, y: 162 },
      { id: 'out', label: 'Result Rows', sublabel: 'Live vs <2ms Snap', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'q', to: 'rw', label: 'Standard View' },
      { id: 'e2', from: 'q', to: 'mv', label: 'MatView Scan' },
      { id: 'e3', from: 'rw', to: 'out', label: 'Live Base Join' },
      { id: 'e4', from: 'mv', to: 'out', label: 'Instant Read' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Standard View Query Rewrite',
        plainEnglish: 'When querying a normal View, the planner pastes the saved SQL right into your query and reads live base tables.',
        technicalDetail: 'PostgreSQL Query Rewriter substitutes RangeTblEntry with the view parse tree; zero extra disk storage.',
        activeNodeIds: ['q', 'rw'],
        activeEdgeIds: ['e1'],
        packetLabel: 'REWRITE AST',
      },
      {
        step: 2,
        title: 'Live Execution Over Base Tables',
        plainEnglish: 'Results are guaranteed 100% up-to-date, at the cost of re-running the joins and aggregations every time.',
        technicalDetail: 'Predicate pushdown pushes outer WHERE clauses inside the view unless blocked by LIMIT/DISTINCT/volatile fns.',
        activeNodeIds: ['rw', 'out'],
        activeEdgeIds: ['e3'],
        packetLabel: 'LIVE 100%',
      },
      {
        step: 3,
        title: 'Materialized View Direct Indexed Scan',
        plainEnglish: 'Querying a Materialized View skips the giant base tables completely and reads pre-computed rows in 1–2ms.',
        technicalDetail: 'REFRESH CONCURRENTLY builds a temp table, diffs via UNIQUE INDEX, and applies minimal row-level deltas.',
        activeNodeIds: ['q', 'mv', 'out'],
        activeEdgeIds: ['e2', 'e4'],
        packetLabel: 'SNAP 1.5ms',
      },
    ],
  },
  {
    id: 'lookups-foreign-keys',
    shortTitle: 'Lookups & Foreign Keys',
    title: 'Lookups, Reference Tables & Foreign Key Referential Integrity',
    category: 'relational',
    simKind: 'trigger-fk',
    tagline: 'Enforce rock-solid parent-child validity at the database engine level and index FK lookups cleanly.',
    simpleEnglish:
      'A Lookup Table (like countries or order_statuses) is an official dropdown list stored inside your database. A Foreign Key is a security guard that refuses to save an Order pointing to a fake customer_id—and decides what happens if that customer is deleted (CASCADE, RESTRICT, or SET NULL)!',
    standardDefinition:
      'Referential integrity constraints (FOREIGN KEY ... REFERENCES) enforce parent existence via internal system triggers on INSERT/UPDATE/DELETE, supporting ON DELETE/UPDATE actions (RESTRICT, NO ACTION, CASCADE, SET NULL). Lookup/Reference tables replace brittle hardcoded strings or rigid ENUMs with normalized, extensible metadata rows.',
    useCases: [
      'Order status / currency / country lookup tables with metadata (display_name, is_active, iso_code).',
      'Preventing orphan child rows (invoices without a valid customer_id).',
      'Automatic cleanup of child session_tokens via ON DELETE CASCADE when a user account closes.',
      'Preserving financial audit history via ON DELETE RESTRICT (blocking deletion of customers with paid invoices).',
    ],
    whenToUse:
      'Use Foreign Keys & Lookup Tables in almost every OLTP relational database where data consistency matters and rows live on the same database cluster.',
    whenNotToUse:
      'Cannot enforce native Foreign Keys across physically separate microservices or horizontally sharded databases (use Saga / Outbox + application validation there). Avoid ON DELETE CASCADE on massive parent tables with millions of children (causes giant lock storms!).',
    performanceTip:
      'PostgreSQL does NOT automatically create an index on a Foreign Key column! Always manually create an index on child FK columns (`CREATE INDEX ON orders(customer_id)`) or parent DELETEs will trigger full sequential scans on the child table!',
    codeLanguage: 'SQL (PostgreSQL 16+)',
    codeExample: `-- 1. Extensible Lookup Table (beats rigid ENUM when values evolve!)
CREATE TABLE order_statuses (
    code         VARCHAR(24) PRIMARY KEY,
    display_name TEXT NOT NULL,
    is_terminal  BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Child Table with Referential Integrity + Explicit FK Indexes
CREATE TABLE orders (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id  BIGINT NOT NULL
        REFERENCES customers(id) ON DELETE RESTRICT,
    status_code  VARCHAR(24) NOT NULL
        REFERENCES order_statuses(code) ON UPDATE CASCADE,
    total_cents  BIGINT NOT NULL CHECK (total_cents >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRITICAL: Always index FK columns to prevent parent-delete table scans!
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status_code ON orders (status_code);`,
    dfdNodes: [
      { id: 'wr', label: 'INSERT / DELETE', sublabel: 'Child or Parent', x: 78, y: 110 },
      { id: 'fk', label: 'FK Constraint Guard', sublabel: 'Lookup Parent PK', x: 248, y: 58 },
      { id: 'idx', label: 'Child FK Index', sublabel: 'O(log N) Verify', x: 424, y: 162 },
      { id: 'act', label: 'Commit / Cascade', sublabel: 'RESTRICT | CASCADE', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'wr', to: 'fk', label: 'Validate Ref' },
      { id: 'e2', from: 'fk', to: 'idx', label: 'Probe Index' },
      { id: 'e3', from: 'idx', to: 'act', label: 'Apply Action' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Write Intercepted by Referential Integrity Check',
        plainEnglish: 'Before committing a new order, the DB checks that customer_id and status_code genuinely exist in their parent tables.',
        technicalDetail: 'Takes FOR KEY SHARE row lock on parent tuple to prevent concurrent parent deletion before commit.',
        activeNodeIds: ['wr', 'fk'],
        activeEdgeIds: ['e1'],
        packetLabel: 'CHECK FK',
      },
      {
        step: 2,
        title: 'Indexed Lookup on Parent Delete / Update',
        plainEnglish: 'When deleting a parent row, the DB checks the child table’s FK index in milliseconds instead of scanning millions of rows.',
        technicalDetail: 'Missing child FK index degrades parent DELETE from O(log N) index lookup to O(N) Seq Scan + lock contention.',
        activeNodeIds: ['fk', 'idx'],
        activeEdgeIds: ['e2'],
        packetLabel: 'INDEX PROBE',
      },
      {
        step: 3,
        title: 'Enforce RESTRICT, CASCADE, or SET NULL',
        plainEnglish: 'Blocks illegal deletes (RESTRICT) or cleanly cascades updates/deletes inside the same atomic transaction.',
        technicalDetail: 'DEFERRED constraints allow circular FK inserts within one transaction, validating right at COMMIT.',
        activeNodeIds: ['idx', 'act'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ATOMIC OK',
      },
    ],
  },
  {
    id: 'database-triggers',
    shortTitle: 'Triggers & Rules',
    title: 'Database Triggers (BEFORE / AFTER / INSTEAD OF, Row vs Statement Level)',
    category: 'relational',
    simKind: 'trigger-fk',
    tagline: 'Automatically execute audit logging, timestamp stamping, or strict invariants inside the write transaction.',
    simpleEnglish:
      'A Trigger is an automatic motion sensor attached to a table. Whenever ANY app, script, or admin runs an INSERT, UPDATE, or DELETE, the database automatically wakes up your trigger function to stamp updated_at, validate business rules, or record a tamper-proof audit trail!',
    standardDefinition:
      'Event-driven stored routines bound to DML events (INSERT/UPDATE/DELETE/TRUNCATE) executing BEFORE (can mutate NEW row or abort write), AFTER (sees final committed row & PK for immutable audit logs), or INSTEAD OF (makes complex Views updatable), scoped FOR EACH ROW or FOR EACH STATEMENT (with transition tables).',
    useCases: [
      'Immutable compliance audit logs (SOC2/HIPAA/FinTech) capturing OLD and NEW JSONB snapshots on every change—even from manual SQL scripts!',
      'Auto-maintaining `updated_at = NOW()` or full-text `tsvector` search columns before write.',
      'Enforcing cross-row invariants impossible with single-row CHECK constraints.',
      'Populating a Transactional Outbox table inside the exact same ACID transaction as the business write.',
    ],
    whenToUse:
      'Use Triggers for cross-cutting data-integrity invariants and tamper-proof audit logs that MUST run regardless of which application or SQL client touches the table.',
    whenNotToUse:
      'NEVER make HTTP/email network calls inside a database trigger (holds transaction locks open and kills DB throughput!). Avoid complex hidden business workflows in cascading triggers—they become invisible debugging nightmares.',
    performanceTip:
      'For bulk updates of 100,000 rows, use a `FOR EACH STATEMENT` trigger with `REFERENCING NEW TABLE AS new_rows` so the trigger fires ONCE instead of 100,000 times!',
    codeLanguage: 'SQL (PostgreSQL 16+)',
    codeExample: `-- 1. Immutable Audit Log Table
CREATE TABLE account_audit_log (
    audit_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id BIGINT NOT NULL,
    op         TEXT NOT NULL,
    old_data   JSONB,
    new_data   JSONB,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trigger Function (captures OLD & NEW atomically inside same Tx)
CREATE OR REPLACE FUNCTION fn_audit_accounts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.balance_cents < 0 THEN
        RAISE EXCEPTION 'Overdraft blocked for account %', NEW.id;
    END IF;
    INSERT INTO account_audit_log(account_id, op, old_data, new_data)
    VALUES (COALESCE(NEW.id, OLD.id), TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 3. Bind AFTER trigger for tamper-proof audit trail
CREATE TRIGGER trg_accounts_audit
AFTER INSERT OR UPDATE OR DELETE ON accounts
FOR EACH ROW EXECUTE FUNCTION fn_audit_accounts();`,
    dfdNodes: [
      { id: 'dml', label: 'DML Write', sublabel: 'INSERT/UPD/DEL', x: 78, y: 110 },
      { id: 'bef', label: 'BEFORE Trigger', sublabel: 'Validate / Stamp', x: 248, y: 58 },
      { id: 'tbl', label: 'Table Heap + WAL', sublabel: 'Mutate Tuple', x: 424, y: 162 },
      { id: 'aft', label: 'AFTER Trigger', sublabel: 'Audit / Outbox', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'dml', to: 'bef', label: 'Intercept NEW' },
      { id: 'e2', from: 'bef', to: 'tbl', label: 'Approved Row' },
      { id: 'e3', from: 'tbl', to: 'aft', label: 'OLD + NEW Snap' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'BEFORE Trigger Validates or Mutates Incoming Row',
        plainEnglish: 'Runs before the row hits disk—can auto-fill updated_at or reject illegal values cleanly.',
        technicalDetail: 'Returning NULL in a BEFORE EACH ROW trigger silently skips the row; RAISE EXCEPTION aborts the entire transaction.',
        activeNodeIds: ['dml', 'bef'],
        activeEdgeIds: ['e1'],
        packetLabel: 'BEFORE ROW',
      },
      {
        step: 2,
        title: 'Base Table Tuple Written + Constraints Verified',
        plainEnglish: 'The database writes the new row version to the table and updates all B-Tree indexes.',
        technicalDetail: 'Row locks acquired, CHECK/UNIQUE/FK constraints verified, WAL record buffered.',
        activeNodeIds: ['bef', 'tbl'],
        activeEdgeIds: ['e2'],
        packetLabel: 'WRITE TUPLE',
      },
      {
        step: 3,
        title: 'AFTER Trigger Records Audit / Outbox Atomically',
        plainEnglish: 'Appends the OLD and NEW JSON snapshots into the audit table inside the exact same transaction—if anything fails, both roll back together!',
        technicalDetail: 'Guarantees 100% atomic auditability with zero drift between base state and audit log.',
        activeNodeIds: ['tbl', 'aft'],
        activeEdgeIds: ['e3'],
        packetLabel: 'AUDIT COMMIT',
      },
    ],
  },
  {
    id: 'window-functions',
    shortTitle: 'Window Functions',
    title: 'SQL Window Functions (OVER, PARTITION BY, RANK, LAG/LEAD & Rolling Frame Clauses)',
    category: 'relational',
    simKind: 'window-fn',
    tagline: 'Compute rankings, running totals, moving averages, and row-to-row deltas WITHOUT collapsing rows like GROUP BY.',
    simpleEnglish:
      'GROUP BY squashes 100 employee rows down into 3 department summary rows—you lose every individual person! A Window Function slides a magnifying glass (window) over each department so every employee keeps their own row while ALSO seeing their rank in the team, running total, and gap to the #1 earner!',
    standardDefinition:
      'Analytic functions evaluated after WHERE/GROUP BY/HAVING and before ORDER BY/LIMIT over a logical frame defined by OVER (PARTITION BY ... ORDER BY ... ROWS|RANGE BETWEEN ...). Supports Ranking (ROW_NUMBER, RANK, DENSE_RANK, NTILE), Value Offset (LAG, LEAD, FIRST_VALUE, LAST_VALUE), and Running Aggregates (SUM, AVG, COUNT).',
    useCases: [
      'Top-N per category (e.g., Top 3 highest-paid employees per department or latest order per customer).',
      'Running cumulative totals & 7-day rolling moving averages in financial and SaaS metrics.',
      'Month-over-Month (MoM) growth and user session gap detection using LAG() / LEAD().',
      'Deduplicating duplicate webhook events by keeping WHERE rn = 1 via ROW_NUMBER().',
    ],
    whenToUse:
      'Whenever you need aggregate/comparative context (rank, running sum, previous row value, % of total) alongside individual detail columns in a single fast pass.',
    whenNotToUse:
      'Use regular GROUP BY when you only want 1 summary row per group (less memory & smaller result set). Remember you cannot put window functions directly inside WHERE—wrap them in a CTE or use `QUALIFY` (Snowflake/BigQuery/DuckDB).',
    performanceTip:
      'Create a composite index matching `(partition_col, order_col)`! PostgreSQL can then stream the WindowAgg directly from the index in O(N) without an expensive in-memory QuickSort!',
    codeLanguage: 'SQL (PostgreSQL 16+)',
    codeExample: `WITH ranked_sales AS (
    SELECT
        dept,
        emp_name,
        sale_date,
        amount,
        -- 1. Ranking without gaps on ties (1, 2, 2, 3)
        DENSE_RANK() OVER (PARTITION BY dept ORDER BY amount DESC) AS dept_rank,
        -- 2. Running cumulative sum per department
        SUM(amount) OVER (
            PARTITION BY dept
            ORDER BY sale_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_total,
        -- 3. Previous sale delta via LAG()
        amount - LAG(amount, 1, 0) OVER (
            PARTITION BY dept ORDER BY sale_date
        ) AS delta_from_prev,
        -- 4. 3-row rolling moving average
        ROUND(AVG(amount) OVER (
            PARTITION BY dept ORDER BY sale_date
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ), 2) AS moving_avg_3
    FROM sales
)
SELECT * FROM ranked_sales WHERE dept_rank <= 3;`,
    dfdNodes: [
      { id: 'in', label: 'Filtered Rows', sublabel: 'Post-WHERE Set', x: 78, y: 110 },
      { id: 'part', label: 'PARTITION BY', sublabel: 'Group Buckets', x: 248, y: 58 },
      { id: 'frame', label: 'ORDER + Frame', sublabel: 'ROWS BETWEEN', x: 424, y: 162 },
      { id: 'out', label: 'Enriched Rows', sublabel: 'Same Row Count!', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'in', to: 'part', label: 'Split Partitions' },
      { id: 'e2', from: 'part', to: 'frame', label: 'Sort & Slide' },
      { id: 'e3', from: 'frame', to: 'out', label: 'Attach Metric' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Partition Stream Without Collapsing Rows',
        plainEnglish: 'Groups rows logically by department or user_id while preserving every single individual row.',
        technicalDetail: 'WindowAgg sorts by (PARTITION BY keys, ORDER BY keys) unless already satisfied by a matching B-Tree index.',
        activeNodeIds: ['in', 'part'],
        activeEdgeIds: ['e1'],
        packetLabel: 'PARTITION',
      },
      {
        step: 2,
        title: 'Slide Window Frame Over Ordered Tuples',
        plainEnglish: 'Computes RANK, LAG, or 7-day moving average strictly within the sliding frame around each current row.',
        technicalDetail: 'ROWS counts physical rows; RANGE groups equal ORDER BY peer values (careful with SUM() default RANGE frame on ties!).',
        activeNodeIds: ['part', 'frame'],
        activeEdgeIds: ['e2'],
        packetLabel: 'SLIDE FRAME',
      },
      {
        step: 3,
        title: 'Emit Detail Rows With Analytic Columns Attached',
        plainEnglish: 'Every original row comes out intact with its new rank, running total, and previous-row delta columns.',
        technicalDetail: 'Filter on window outputs in an outer SELECT / CTE (or QUALIFY in analytical engines).',
        activeNodeIds: ['frame', 'out'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ENRICHED',
      },
    ],
  },
  {
    id: 'ctes-recursive-procs',
    shortTitle: 'CTEs, Recursion & UDFs',
    title: 'CTEs (WITH), Recursive CTEs, LATERAL Joins, Stored Procedures & Functions',
    category: 'relational',
    simKind: 'view-matview',
    tagline: 'Structure complex pipelines cleanly, traverse trees/graphs in pure SQL, and encapsulate multi-step atomic routines.',
    simpleEnglish:
      'A CTE (`WITH step1 AS (...)`) breaks a terrifying 80-line nested subquery into clean, readable Lego blocks. A Recursive CTE lets SQL climb org charts or category trees of unlimited depth, while a Stored Procedure runs multi-step transactional transfers right inside the database with zero network round-trips!',
    standardDefinition:
      'Common Table Expressions (CTEs) define scoped named subqueries (inlined by Postgres 12+ unless MATERIALIZED). Recursive CTEs execute fixed-point iteration (Anchor Member UNION ALL Recursive Member) with cycle guards. Functions (RETURNS value, usable in SELECT) contrast with Stored Procedures (CALL, able to manage explicit COMMIT/ROLLBACK across batches).',
    useCases: [
      'Breaking complex ETL/analytics queries into testable, readable sequential CTE stages.',
      'Traversing hierarchical category trees, org charts, bill-of-materials, or comment threads via WITH RECURSIVE.',
      'Top-N related rows per parent cleanly via `CROSS JOIN LATERAL (SELECT ... LIMIT 3)`.',
      'Atomic financial ledger transfers or batch cleanup jobs in Stored Procedures with explicit batch COMMITs.',
    ],
    whenToUse:
      'Use CTEs for readability and Recursive CTEs for tree/DAG queries. Use SQL-inlined Functions for pure reusable expressions, and Stored Procedures only for batch maintenance or ultra-low-latency multi-statement DB routines.',
    whenNotToUse:
      'Avoid burying your entire application business logic inside massive PL/pgSQL procedures—they are harder to version-control, unit-test, and horizontally scale than stateless app services.',
    performanceTip:
      'In PostgreSQL 12+, non-recursive CTEs are automatically inlined so outer WHERE filters push down to indexes—add `AS MATERIALIZED` only when you intentionally want a heavy subquery evaluated once.',
    codeLanguage: 'SQL (PostgreSQL 16+)',
    codeExample: `-- 1. Recursive CTE: Traverse unlimited org-chart hierarchy with cycle protection
WITH RECURSIVE org_tree AS (
    -- Anchor member (CEO / root node)
    SELECT id, name, manager_id, 1 AS depth, ARRAY[id] AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive member
    SELECT e.id, e.name, e.manager_id, t.depth + 1, t.path || e.id
    FROM employees e
    JOIN org_tree t ON e.manager_id = t.id
    WHERE NOT (e.id = ANY(t.path)) -- Prevents infinite cycles!
      AND t.depth < 10
)
SELECT id, name, depth, path FROM org_tree ORDER BY path;

-- 2. Stored Procedure: Atomic transfer with row lock ordering (no deadlock!)
CREATE OR REPLACE PROCEDURE sp_transfer(p_from BIGINT, p_to BIGINT, p_amt BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    PERFORM 1 FROM accounts WHERE id IN (p_from, p_to) ORDER BY id FOR UPDATE;
    UPDATE accounts SET balance_cents = balance_cents - p_amt WHERE id = p_from;
    UPDATE accounts SET balance_cents = balance_cents + p_amt WHERE id = p_to;
END;
$$;`,
    dfdNodes: [
      { id: 'anc', label: 'Anchor Query', sublabel: 'Root Rows (d=1)', x: 78, y: 110 },
      { id: 'work', label: 'Working Table', sublabel: 'Current Frontier', x: 248, y: 58 },
      { id: 'rec', label: 'Recursive Join', sublabel: 'Cycle Check + d+1', x: 424, y: 162 },
      { id: 'res', label: 'Union Output', sublabel: 'Complete Tree', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'anc', to: 'work', label: 'Seed Frontier' },
      { id: 'e2', from: 'work', to: 'rec', label: 'Join Children' },
      { id: 'e3', from: 'rec', to: 'work', label: 'Next Level' },
      { id: 'e4', from: 'work', to: 'res', label: 'Empty -> Done' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Evaluate Anchor Query Into Working Table',
        plainEnglish: 'Finds the starting root rows (e.g., CEO or top category) and puts them into a temporary queue.',
        technicalDetail: 'RecursiveUnion plan initializes Working Table with Anchor tuples and appends them to final output.',
        activeNodeIds: ['anc', 'work'],
        activeEdgeIds: ['e1'],
        packetLabel: 'ANCHOR ROOT',
      },
      {
        step: 2,
        title: 'Iterative Breadth-First Expansion + Cycle Guard',
        plainEnglish: 'Joins the current level with child rows repeatedly until no new children exist—checking path arrays to stop loops.',
        technicalDetail: 'Each pass replaces Working Table with newly discovered children; CYCLE clause (SQL:2023) detects loops automatically.',
        activeNodeIds: ['work', 'rec'],
        activeEdgeIds: ['e2', 'e3'],
        packetLabel: 'EXPAND d+1',
      },
      {
        step: 3,
        title: 'Fixed-Point Termination & Final Tree Output',
        plainEnglish: 'Once a level produces zero new children, recursion halts cleanly and returns the full hierarchy.',
        technicalDetail: 'Indexed foreign key on manager_id makes each recursive join hop O(log N).',
        activeNodeIds: ['work', 'res'],
        activeEdgeIds: ['e4'],
        packetLabel: 'TREE DONE',
      },
    ],
  },
  {
    id: 'relational-associations',
    shortTitle: 'Relational Associations',
    title: 'Relational Associations: 1:1, 1:N, M:N Junction Tables, Self-Referencing & Polymorphic Design',
    category: 'relational',
    simKind: 'trigger-fk',
    tagline: 'Model every entity relationship cleanly with exact Foreign Key placement and zero orphan anomalies.',
    simpleEnglish:
      'Every relationship in a relational database follows one golden rule: the Foreign Key ALWAYS goes on the "Many" side! For One-to-One (User -> Profile), put a UNIQUE Foreign Key on the profile; for Many-to-Many (Students <-> Courses), create a bridge Junction Table holding both IDs!',
    standardDefinition:
      'Cardinality modeling maps conceptual ER associations to physical keys: 1:1 via FK + UNIQUE constraint (or shared PK), 1:N via FK on child table, M:N via an Associative/Junction Table with composite PK `(a_id, b_id)` + payload attributes, Self-Referencing via nullable parent FK, and Polymorphic via Exclusive Arcs or Class-Table Inheritance (preserving true FK integrity).',
    useCases: [
      '1:1 (Vertical Partitioning): Split heavy/sensitive `user_kyc_documents` out of hot `users` table.',
      '1:N: `customers` -> `orders` (FK `customer_id` indexed on `orders`).',
      'M:N With Attributes: `orders` <-> `products` bridged by `order_items(order_id, product_id, qty, unit_price)`.',
      'Self-Referencing: `categories(id, parent_id)` or `employees(id, manager_id)` + Social Graph `follows(follower_id, followee_id)`.',
    ],
    whenToUse:
      'Use strict FK-backed relational associations whenever cross-entity integrity, bi-directional querying, and ad-hoc reporting are core requirements.',
    whenNotToUse:
      'NEVER use the naive polymorphic anti-pattern `(entity_type VARCHAR, entity_id BIGINT)` if you need database-enforced referential integrity—it cannot declare a real Foreign Key and silently accumulates orphan rows!',
    performanceTip:
      'On an M:N Junction Table with `PRIMARY KEY (student_id, course_id)`, PostgreSQL can quickly find courses for a student, but you MUST add a reverse index `CREATE INDEX ON enrollments(course_id, student_id)` to query students for a course fast!',
    codeLanguage: 'SQL (PostgreSQL 16+)',
    codeExample: `-- 1. One-to-One (Shared PK / Vertical Split for hot vs cold columns)
CREATE TABLE user_profiles (
    user_id    BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio        TEXT,
    avatar_url TEXT
);

-- 2. Many-to-Many Junction Table with Payload + Reverse Index
CREATE TABLE enrollments (
    student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id   BIGINT NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grade       CHAR(2),
    PRIMARY KEY (student_id, course_id)
);
CREATE INDEX idx_enrollments_course_rev ON enrollments (course_id, student_id);

-- 3. Safe Polymorphic Exclusive Arc (Preserves REAL Foreign Keys!)
CREATE TABLE comments (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    body      TEXT NOT NULL,
    post_id   BIGINT REFERENCES posts(id)  ON DELETE CASCADE,
    video_id  BIGINT REFERENCES videos(id) ON DELETE CASCADE,
    CONSTRAINT chk_exactly_one_parent CHECK (num_nonnulls(post_id, video_id) = 1)
);`,
    dfdNodes: [
      { id: 'one', label: '1:1 Shared PK', sublabel: 'Hot / Cold Split', x: 78, y: 110 },
      { id: 'many', label: '1:N Child FK', sublabel: 'FK on Many Side', x: 248, y: 58 },
      { id: 'mn', label: 'M:N Junction', sublabel: 'Composite PK+Rev', x: 424, y: 162 },
      { id: 'arc', label: 'Exclusive Arc', sublabel: 'Real FK Polymorph', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'one', to: 'many', label: '1 -> N Growth' },
      { id: 'e2', from: 'many', to: 'mn', label: 'Bridge Table' },
      { id: 'e3', from: 'mn', to: 'arc', label: 'Strict Integrity' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: '1:1 & 1:N Exact Foreign Key Placement',
        plainEnglish: 'Keep frequently read columns slim via 1:1 vertical splitting; always place the Foreign Key on the Many side in 1:N.',
        technicalDetail: 'Shared PK in 1:1 guarantees both uniqueness and O(log N) PK-to-PK merge joins.',
        activeNodeIds: ['one', 'many'],
        activeEdgeIds: ['e1'],
        packetLabel: '1:1 & 1:N',
      },
      {
        step: 2,
        title: 'M:N Associative Bridge Table + Dual Direction Indexes',
        plainEnglish: 'Break Many-to-Many into two 1:N links joined by a bridge table storing relationship attributes like quantity or role.',
        technicalDetail: 'Composite PK (A, B) + reverse secondary index (B, A) delivers index-only scans in BOTH traversal directions!',
        activeNodeIds: ['many', 'mn'],
        activeEdgeIds: ['e2'],
        packetLabel: 'M:N BRIDGE',
      },
      {
        step: 3,
        title: 'Safe Polymorphic Exclusive Arc Constraint',
        plainEnglish: 'Instead of untyped (target_type, target_id), use explicit nullable FKs plus a CHECK ensuring exactly 1 parent is set.',
        technicalDetail: 'num_nonnulls(post_id, video_id) = 1 enforces strict engine-level referential integrity and cascade deletes.',
        activeNodeIds: ['mn', 'arc'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ARC SAFE',
      },
    ],
  },

  /* ==========================================================================
     NON-RELATIONAL (NoSQL) FUNCTIONS, PIPELINES & ASSOCIATIONS (6)
     ========================================================================== */
  {
    id: 'nosql-aggregation-pipelines',
    shortTitle: 'NoSQL Agg Pipelines',
    title: 'Non-Relational Aggregation Pipelines ($match, $group, $unwind, $facet & $setWindowFields)',
    category: 'non-relational',
    simKind: 'nosql-assoc',
    tagline: 'Stream, filter, reshape, and run window analytics inside document databases without exporting raw JSON to your app.',
    simpleEnglish:
      'An Aggregation Pipeline in MongoDB works like a factory conveyor belt: documents enter Stage 1 (`$match` throws away irrelevant docs using an index), Stage 2 (`$unwind` unpacks nested line-item arrays), Stage 3 (`$group` sums revenue), and Stage 4 (`$setWindowFields` computes rankings and moving averages)!',
    standardDefinition:
      'A composable declarative data-processing pipeline executing inside the storage engine. Optimizes early `$match`/`$sort` stages via B-Tree/Compound Index pushdown, expands arrays via `$unwind`, computes multi-branch summaries in one pass via `$facet`, and supports full SQL-equivalent analytic windowing via `$setWindowFields`.',
    useCases: [
      'Real-time e-commerce analytics over nested `order.items[]` arrays without multi-table SQL joins.',
      'Faceted catalog search (returning paginated items + brand counts + price histogram in ONE database round-trip via `$facet`).',
      'Rolling 7-day time-series moving averages on IoT sensor collections via `$setWindowFields`.',
      'Materializing pre-computed dashboard collections nightly via `$merge` (NoSQL equivalent of Materialized Views!).',
    ],
    whenToUse:
      'When your data is naturally document-shaped (nested arrays/sub-documents) and you want server-side filtering, grouping, faceted search, or materialized `$merge` rollups.',
    whenNotToUse:
      'Avoid running unindexed full-collection `$group` pipelines over 100M+ documents on your live OLTP primary—route them to analytics secondaries or a columnar warehouse (ClickHouse/BigQuery).',
    performanceTip:
      'ALWAYS put `$match` and `$sort` as the VERY FIRST stages so MongoDB uses a Compound Index (ESR rule: Equality -> Sort -> Range) and shrinks the document stream before `$unwind` or `$group`!',
    codeLanguage: 'NoSQL (MongoDB / DynamoDB / Cypher)',
    codeExample: `// MongoDB Aggregation Pipeline: Index-backed $match -> $unwind -> $group -> Window Rank -> $merge
db.orders.aggregate([
  // Stage 1: Push filter straight to Compound Index { status: 1, createdAt: -1 }
  { $match: { status: "PAID", createdAt: { $gte: ISODate("2026-01-01") } } },

  // Stage 2: Flatten embedded items[] array into individual documents
  { $unwind: "$items" },

  // Stage 3: Aggregate revenue per category + region
  { $group: {
      _id: { region: "$region", category: "$items.category" },
      revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      units:   { $sum: "$items.qty" }
  }},

  // Stage 4: NoSQL Window Function (Rank top categories per region!)
  { $setWindowFields: {
      partitionBy: "$_id.region",
      sortBy: { revenue: -1 },
      output: { categoryRank: { $denseRank: {} } }
  }},

  // Stage 5: Materialize into fast summary collection (NoSQL MatView)
  { $merge: { into: "mv_region_category_sales", whenMatched: "replace" } }
]);`,
    dfdNodes: [
      { id: 'm', label: '$match (Indexed)', sublabel: 'ESR Filter Early', x: 78, y: 110 },
      { id: 'u', label: '$unwind Array', sublabel: 'Expand Embedded', x: 248, y: 58 },
      { id: 'g', label: '$group + Window', sublabel: '$setWindowFields', x: 424, y: 162 },
      { id: 'o', label: '$merge / Output', sublabel: 'Materialized Coll', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'm', to: 'u', label: 'Shrink Stream' },
      { id: 'e2', from: 'u', to: 'g', label: 'Flat Items' },
      { id: 'e3', from: 'g', to: 'o', label: 'Ranked Rollup' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Index-Backed $match Reduces Stream Early',
        plainEnglish: 'Filters down millions of JSON documents using a compound index before doing any heavy CPU work.',
        technicalDetail: 'MongoDB pipeline optimizer coalesces adjacent $match+$sort and pushes projection down to WiredTiger storage.',
        activeNodeIds: ['m', 'u'],
        activeEdgeIds: ['e1'],
        packetLabel: 'IXSCAN',
      },
      {
        step: 2,
        title: '$unwind Nested Arrays & Compute Window Ranks',
        plainEnglish: 'Unpacks embedded item arrays, groups totals, and ranks top categories per region inside the engine.',
        technicalDetail: 'allowDiskUse:true spills >100MB sort/group buffers safely to temp disk instead of failing.',
        activeNodeIds: ['u', 'g'],
        activeEdgeIds: ['e2'],
        packetLabel: 'GROUP+RANK',
      },
      {
        step: 3,
        title: 'Stream to Client or Materialize via $merge',
        plainEnglish: 'Either returns the aggregated JSON live or saves it into a pre-built Materialized summary collection.',
        technicalDetail: '$merge performs incremental upserts into target collection without locking readers.',
        activeNodeIds: ['g', 'o'],
        activeEdgeIds: ['e3'],
        packetLabel: '$MERGE OK',
      },
    ],
  },
  {
    id: 'nosql-lookup-graphlookup',
    shortTitle: 'NoSQL $lookup & Graph',
    title: 'Non-Relational Lookups ($lookup, $graphLookup) & When to Avoid Cross-Collection Joins',
    category: 'non-relational',
    simKind: 'nosql-assoc',
    tagline: 'Perform left-outer joins and recursive graph traversals in Document DBs—while knowing their sharding cost.',
    simpleEnglish:
      'Even in NoSQL you sometimes need to join two collections (like Orders + Customers). `$lookup` acts like a SQL LEFT JOIN inside the pipeline, and `$graphLookup` acts like a Recursive CTE for org charts or friend networks—but unlike SQL, joining across sharded NoSQL collections can get slow if overused!',
    standardDefinition:
      '`$lookup` executes an indexed nested-loop Left Outer Join (supporting correlated sub-pipelines with `let`/`pipeline`), while `$graphLookup` executes bounded recursive BFS traversal (`maxDepth`, `depthField`) across self-referencing or edge collections.',
    useCases: [
      'Enriching infrequent admin/reporting queries with reference metadata (e.g., joining `orders` with `warehouses`).',
      'Hierarchical category trees, referral chains, or permission inheritance via `$graphLookup` with `maxDepth`.',
      'Correlated top-K sub-lookups (fetch latest 3 comments for each post using `$lookup` pipeline + `$limit`).',
    ],
    whenToUse:
      'Use `$lookup` for occasional low-QPS reporting/admin joins or small reference collections; use `$graphLookup` for bounded shallow hierarchies (depth <= 5).',
    whenNotToUse:
      'If every hot API endpoint needs 3–4 `$lookup` joins across collections, you modeled a relational domain in NoSQL—either apply the Extended Reference Pattern or use PostgreSQL!',
    performanceTip:
      'ALWAYS index the `foreignField` in the target collection! Without an index on `foreignField`, every input document triggers a full collection scan inside `$lookup` ($O(N \times M)$)!',
    codeLanguage: 'NoSQL (MongoDB / DynamoDB / Cypher)',
    codeExample: `// 1. Correlated $lookup (Left Outer Join fetching ONLY top 3 recent reviews)
db.products.aggregate([
  { $match: { _id: "sku-900" } },
  { $lookup: {
      from: "reviews",
      let: { pid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$productId", "$$pid"] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 }
      ],
      as: "latestReviews"
  }}
]);

// 2. $graphLookup: Recursive Hierarchy Traversal (NoSQL Recursive CTE!)
db.employees.aggregate([
  { $match: { name: "CTO" } },
  { $graphLookup: {
      from: "employees",
      startWith: "$_id",
      connectFromField: "_id",
      connectToField: "managerId",
      maxDepth: 4,
      depthField: "orgLevel",
      as: "reportingChain"
  }}
]);`,
    dfdNodes: [
      { id: 'src', label: 'Base Collection', sublabel: 'products / emp', x: 78, y: 110 },
      { id: 'lk', label: '$lookup Engine', sublabel: 'Index Probe FK', x: 248, y: 58 },
      { id: 'sub', label: 'Sub-Pipeline / BFS', sublabel: 'Sort + Limit 3', x: 424, y: 162 },
      { id: 'doc', label: 'Joined Document', sublabel: 'Embedded Array', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'src', to: 'lk', label: 'localField' },
      { id: 'e2', from: 'lk', to: 'sub', label: 'Match foreignIdx' },
      { id: 'e3', from: 'sub', to: 'doc', label: 'Attach Array' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Read Base Document & Extract Join Key',
        plainEnglish: 'Grabs the primary product or employee document and extracts its ID to look up related docs.',
        technicalDetail: 'Correlated `let` binds local fields into sub-pipeline variables (`$$pid`).',
        activeNodeIds: ['src', 'lk'],
        activeEdgeIds: ['e1'],
        packetLabel: 'BIND $$PID',
      },
      {
        step: 2,
        title: 'Indexed Foreign Collection Probe / Recursive BFS',
        plainEnglish: 'Uses the target collection’s index to pull only the top 3 newest reviews or walk up to maxDepth hops.',
        technicalDetail: 'Putting $sort + $limit inside $lookup pipeline avoids shipping 50,000 reviews across memory.',
        activeNodeIds: ['lk', 'sub'],
        activeEdgeIds: ['e2'],
        packetLabel: 'FOREIGN IX',
      },
      {
        step: 3,
        title: 'Embed Matched Results Into Output JSON',
        plainEnglish: 'Returns a clean unified JSON payload ready to serialize directly to your API caller.',
        technicalDetail: 'Keep resulting document safely below the 16MB BSON hard limit.',
        activeNodeIds: ['sub', 'doc'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ATTACH JSON',
      },
    ],
  },
  {
    id: 'nosql-associations-embed-ref',
    shortTitle: 'Embed vs Reference',
    title: 'NoSQL Associations: Embedding vs Referencing vs Extended Reference Pattern',
    category: 'non-relational',
    simKind: 'nosql-assoc',
    tagline: 'Master the #1 rule of NoSQL data modeling: data that is accessed together should be stored together.',
    simpleEnglish:
      'In NoSQL, you have 3 ways to connect data: (1) Embedding pastes child data directly inside the parent JSON (1 super-fast read!), (2) Referencing stores just the ID (like SQL) when children grow infinitely, and (3) Extended Reference stores the ID PLUS the 2 most-displayed fields (like customerName) so you skip joins 99% of the time!',
    standardDefinition:
      'Document association design balances Read Locality vs Write Fan-Out & Document Size Bounds (16MB BSON / 400KB DynamoDB). 1:Few embeds inline; 1:Many uses Child-to-Parent References; 1:Squillions (logs/followers) strictly references parent from child; Read-heavy M:N uses the Extended Reference Pattern with async fan-out updates on rare metadata edits.',
    useCases: [
      'Embedding (1:Few): Shipping addresses & order line items stored directly inside the `Order` document (atomic single-doc write!).',
      'Referencing (1:Squillions): Storing `userId` on each `audit_log` document so the user document never blows past 16MB.',
      'Extended Reference: Storing `{ customerId: 42, customerName: "Asha", tier: "PRO" }` inside `orders` so order lists render in 1 read with zero joins!',
    ],
    whenToUse:
      'Embed when child count is bounded (<= ~100), read together with parent, and rarely updated independently. Use Extended Reference when parent metadata rarely changes (user name, product title) but is displayed on every read.',
    whenNotToUse:
      'NEVER embed an unbounded growing array (like all comments on a viral video or all IoT pings inside a device doc)—it causes continuous document reallocation, RAM bloat, and eventually crashes on the 16MB/400KB item limit!',
    performanceTip:
      'In DynamoDB Single-Table Design, co-locate 1:N parent & children under the exact same Partition Key (`PK = "USER#42"`, `SK = "PROFILE"` and `SK = "ORDER#2026-01"`) to fetch both in ONE single `Query` operation!',
    codeLanguage: 'NoSQL (MongoDB / DynamoDB / Cypher)',
    codeExample: `// Pattern A: EMBEDDING (1:Few bounded items — 1 atomic read & write!)
{
  "_id": "ord_9001",
  "placedAt": "2026-11-21T10:00:00Z",
  // Pattern B: EXTENDED REFERENCE (No $lookup needed to show customer name!)
  "customer": { "id": "usr_42", "name": "Asha Rao", "tier": "PRO" },
  "items": [
    { "sku": "KB-01", "title": "Mech Keyboard", "qty": 1, "priceCents": 12900 },
    { "sku": "MS-04", "title": "Ergo Mouse",    "qty": 2, "priceCents": 5900 }
  ]
}

// Pattern C: REFERENCING (1:Squillions — unbounded events live in own collection)
{ "_id": "evt_88412", "orderId": "ord_9001", "type": "SHIPPED", "ts": "..." }`,
    dfdNodes: [
      { id: 'card', label: 'Check Cardinality', sublabel: '1:Few vs 1:Millions', x: 78, y: 110 },
      { id: 'emb', label: 'Embed Inline', sublabel: '1 Read / Atomic', x: 248, y: 58 },
      { id: 'ext', label: 'Extended Reference', sublabel: 'ID + Hot Fields', x: 424, y: 162 },
      { id: 'ref', label: 'Separate Collection', sublabel: 'Bounded Size OK', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'card', to: 'emb', label: 'Bounded <100' },
      { id: 'e2', from: 'card', to: 'ext', label: 'Hot Read Subset' },
      { id: 'e3', from: 'card', to: 'ref', label: 'Unbounded Growth' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: '1:Few Bounded Children -> Embed Directly Inside Document',
        plainEnglish: 'Order line items and addresses are small and always read with the order—embed them for single-disk-seek speed!',
        technicalDetail: 'Single-document writes in MongoDB & DynamoDB are natively ACID atomic without distributed 2PC overhead.',
        activeNodeIds: ['card', 'emb'],
        activeEdgeIds: ['e1'],
        packetLabel: '1-SEEK READ',
      },
      {
        step: 2,
        title: 'Hot Display Fields -> Extended Reference Pattern',
        plainEnglish: 'Copy just the customer’s name & tier alongside customerId so list pages render with zero joins.',
        technicalDetail: 'If customer changes their name once a year, an async worker updates recent orders via Change Stream.',
        activeNodeIds: ['card', 'ext'],
        activeEdgeIds: ['e2'],
        packetLabel: 'ZERO JOIN',
      },
      {
        step: 3,
        title: 'Unbounded 1:Millions -> Child-to-Parent Reference',
        plainEnglish: 'Logs, clicks, and social followers grow forever—store them as separate documents pointing back to parentId.',
        technicalDetail: 'Prevents 16MB BSON limit crashes and avoids rewriting giant arrays on every insert.',
        activeNodeIds: ['card', 'ref'],
        activeEdgeIds: ['e3'],
        packetLabel: 'SAFE SCALE',
      },
    ],
  },
  {
    id: 'nosql-design-patterns',
    shortTitle: 'Bucket, Subset & Outlier',
    title: 'Advanced NoSQL Schema Patterns: Bucket, Computed, Subset & Outlier Patterns',
    category: 'non-relational',
    simKind: 'nosql-assoc',
    tagline: 'Production NoSQL architecture patterns that cut index size by 90% and tame celebrity/IoT workloads.',
    simpleEnglish:
      'Smart NoSQL teams use 4 secret patterns: (1) Bucket groups 60 sensor readings into 1 hourly document (60x fewer index entries!), (2) Computed pre-calculates totals on write, (3) Subset keeps only the top 10 hot reviews inside a product doc while archiving 50,000 old ones, and (4) Outlier flags mega-celebrities into overflow docs!',
    standardDefinition:
      'Workload-driven document optimization patterns: Bucket Pattern (time/count batching reducing B-Tree index footprint), Computed Pattern (write-time incremental `$inc` rollups), Subset Pattern (keeping Working Set inside RAM), and Outlier Pattern (`hasOverflow: true` sidecar documents preventing skew from power-law entities).',
    useCases: [
      'Bucket Pattern: IoT telemetry, chat message chunks (50 messages/doc), financial tick candles.',
      'Computed Pattern: E-commerce rating average (`ratingSum`, `ratingCount`) updated atomically on review insert.',
      'Subset Pattern: Product page embeds top 10 newest reviews in RAM while 100,000 older reviews live in `reviews_archive`.',
      'Outlier Pattern: Handling a viral post with 5M likes or a celebrity with 100M followers without breaking normal users’ fast schema.',
    ],
    whenToUse:
      'Use Bucket for high-frequency time-series/chat, Subset when your Working Set exceeds RAM, Computed when read:write ratio > 50:1, and Outlier when 0.1% of entities have 1000x more links.',
    whenNotToUse:
      'Do not pre-optimize with Bucket or Outlier patterns on small simple CRUD apps—they add pagination and application code complexity.',
    performanceTip:
      'Grouping 60 one-minute IoT readings into 1 hourly Bucket document reduces index RAM consumption by ~98% and makes range queries read sequential contiguous disk pages!',
    codeLanguage: 'NoSQL (MongoDB / DynamoDB / Cypher)',
    codeExample: `// 1. BUCKET + COMPUTED PATTERN (60 IoT readings in 1 hourly doc -> 60x smaller index!)
{
  "_id": "sensor_77_2026-11-21T11",
  "sensorId": "sensor_77",
  "hour": ISODate("2026-11-21T11:00:00Z"),
  "count": 60,
  "sumTemp": 1344.2,          // Computed on write for instant O(1) avg!
  "maxTemp": 24.1,
  "readings": [ { "m": 0, "t": 22.3 }, { "m": 1, "t": 22.4 } /* ... */ ]
}

// 2. SUBSET + OUTLIER PATTERN (Hot top-5 reviews embedded; overflow flag for mega items)
{
  "_id": "book_42",
  "title": "Designing Data-Intensive Systems",
  "recentReviews": [ /* top 5 hot reviews kept in WiredTiger RAM */ ],
  "hasOverflowReviews": true  // App fetches page 2+ from reviews_overflow collection
}`,
    dfdNodes: [
      { id: 'w', label: 'High-Freq Writes', sublabel: 'IoT / Reviews', x: 78, y: 110 },
      { id: 'b', label: 'Bucket & Computed', sublabel: '$push + $inc', x: 248, y: 58 },
      { id: 's', label: 'Hot Subset (RAM)', sublabel: 'Fits Working Set', x: 424, y: 162 },
      { id: 'o', label: 'Outlier Overflow', sublabel: 'Sidecar Coll', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'w', to: 'b', label: 'Group 60/Doc' },
      { id: 'e2', from: 'b', to: 's', label: 'Keep Hot Top-N' },
      { id: 'e3', from: 's', to: 'o', label: 'Flag > Limit' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Bucket & Compute On Write',
        plainEnglish: 'Appends readings into an hourly bucket and atomically increments running sum/count so dashboards read in O(1).',
        technicalDetail: 'Atomic `$push` + `$inc` updates a single document while slashing B-Tree index size by 60x.',
        activeNodeIds: ['w', 'b'],
        activeEdgeIds: ['e1'],
        packetLabel: 'BUCKET 60x',
      },
      {
        step: 2,
        title: 'Hot Subset Keeps Working Set Inside RAM',
        plainEnglish: 'Stores only the 5–10 items users actually see on Page 1 inside the main document so RAM cache stays lean and fast.',
        technicalDetail: 'Prevents rarely-read historical arrays from evicting hot products out of the WiredTiger cache.',
        activeNodeIds: ['b', 's'],
        activeEdgeIds: ['e2'],
        packetLabel: 'HOT RAM',
      },
      {
        step: 3,
        title: 'Outlier Overflow Isolates Mega-Entities',
        plainEnglish: 'Normal items stay ultra-fast; the rare celebrity or viral item sets `hasOverflow: true` and spills extra links safely.',
        technicalDetail: 'Avoids distorting the 99.9% common-case schema to accommodate 0.1% power-law outliers.',
        activeNodeIds: ['s', 'o'],
        activeEdgeIds: ['e3'],
        packetLabel: 'OUTLIER OK',
      },
    ],
  },
  {
    id: 'nosql-change-streams-ttl',
    shortTitle: 'Change Streams & TTL',
    title: 'NoSQL Reactive Triggers: Change Streams, DynamoDB Streams & Automatic TTL Expiry',
    category: 'non-relational',
    simKind: 'trigger-fk',
    tagline: 'Replace synchronous blocking SQL triggers with asynchronous, horizontally scalable event streams and automatic data expiry.',
    simpleEnglish:
      'NoSQL databases generally skip blocking in-transaction SQL triggers to stay blazing fast at scale. Instead, they give you Change Streams (a live event feed of every insert/update/delete straight from the replication log) and TTL Indexes (which automatically vaporize expired sessions or OTP codes with zero cron jobs)!',
    standardDefinition:
      'Asynchronous Change Data Capture (CDC) powered by the storage engine’s replication log (MongoDB Oplog Change Streams with Resume Tokens; DynamoDB Streams triggering AWS Lambda) paired with background TTL Sweeper indexes that automatically purge expired documents based on timestamp fields.',
    useCases: [
      'Real-time cache invalidation (Redis) and Search Engine sync (Elasticsearch/OpenSearch) whenever a document updates.',
      'Async fan-out updates for the Extended Reference Pattern (updating denormalized customer names across orders).',
      'Zero-maintenance expiry of OTP codes, JWT denylists, shopping carts, and 30-day audit logs via TTL Indexes.',
      'Event-driven microservices reacting to DynamoDB writes with ordered per-partition Lambda triggers.',
    ],
    whenToUse:
      'Use Change Streams / DynamoDB Streams for decoupled async side-effects (emails, search indexing, analytics, webhooks) and TTL for ephemeral data.',
    whenNotToUse:
      'Do NOT rely on async Change Streams to enforce strict synchronous invariants (like preventing a negative bank balance)—use atomic conditional updates (`ConditionExpression` / `$expr`) for synchronous invariants!',
    performanceTip:
      'Always persist the Change Stream `resumeToken` after processing each event so your consumer recovers cleanly after a pod crash with zero missed events!',
    codeLanguage: 'NoSQL (MongoDB / DynamoDB / Cypher)',
    codeExample: `// 1. Automatic TTL Index: Delete session docs 3600s after lastSeen (zero cron!)
db.sessions.createIndex({ lastSeen: 1 }, { expireAfterSeconds: 3600 });

// 2. Reactive Change Stream (NoSQL Async Trigger via Oplog + Resume Token)
const stream = db.orders.watch(
  [{ $match: { operationType: { $in: ["insert", "update"] } } }],
  { fullDocument: "updateLookup" }
);

// DynamoDB Atomic Conditional Write (Synchronous Invariant without SQL Trigger!)
// UpdateExpression: "SET stock = stock - :qty"
// ConditionExpression: "stock >= :qty"  --> Fails atomically if oversold!`,
    dfdNodes: [
      { id: 'wr', label: 'Atomic Write', sublabel: 'Condition Check', x: 78, y: 110 },
      { id: 'op', label: 'Oplog / Stream', sublabel: 'Ordered CDC Log', x: 248, y: 58 },
      { id: 'fn', label: 'Worker / Lambda', sublabel: 'Resume Token', x: 424, y: 162 },
      { id: 'ttl', label: 'TTL Sweeper', sublabel: 'Auto-Expire Docs', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'wr', to: 'op', label: 'Append Oplog' },
      { id: 'e2', from: 'op', to: 'fn', label: 'Push Change' },
      { id: 'e3', from: 'wr', to: 'ttl', label: 'Expiry Clock' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Atomic Conditional Write Appends to Oplog',
        plainEnglish: 'Database commits the write fast (checking conditions atomically) and writes an entry to its internal replication log.',
        technicalDetail: 'Zero slow synchronous trigger callbacks blocking the hot write path.',
        activeNodeIds: ['wr', 'op'],
        activeEdgeIds: ['e1'],
        packetLabel: 'OPLOG WRITE',
      },
      {
        step: 2,
        title: 'Change Stream / Lambda Consumer Reacts Asynchronously',
        plainEnglish: 'Downstream workers receive the event in milliseconds to update Elasticsearch, push notifications, or sync caches.',
        technicalDetail: 'Resume Token checkpoints enable at-least-once delivery across worker restarts.',
        activeNodeIds: ['op', 'fn'],
        activeEdgeIds: ['e2'],
        packetLabel: 'CDC TRIGGER',
      },
      {
        step: 3,
        title: 'Background TTL Thread Purges Expired Data',
        plainEnglish: 'Old sessions and temporary OTP codes disappear automatically without heavy manual DELETE cron jobs.',
        technicalDetail: 'TTL monitor sweeps expired index keys asynchronously every ~60s (MongoDB) or background batches (DynamoDB).',
        activeNodeIds: ['wr', 'ttl'],
        activeEdgeIds: ['e3'],
        packetLabel: 'TTL PURGE',
      },
    ],
  },
  {
    id: 'kv-widecolumn-graph',
    shortTitle: 'KV, Wide-Col & Graph',
    title: 'Key-Value (Redis), Wide-Column (Cassandra) & Graph (Neo4j) Functions & Associations',
    category: 'non-relational',
    simKind: 'nosql-assoc',
    tagline: 'Know exactly when to reach for Redis data structures, Cassandra query-first partitions, or Index-Free Adjacency Graphs.',
    simpleEnglish:
      'Not all NoSQL is JSON documents! Redis gives you sub-millisecond RAM structures (Sorted Sets for leaderboards, Lua scripts for atomic rate limits). Cassandra organizes rows by `(PartitionKey, ClusteringKey)` for massive write scale. Graph DBs (Neo4j) store direct physical pointers between nodes so 5-hop friend/fraud traversals take 2ms instead of crashing SQL joins!',
    standardDefinition:
      'Specialized non-relational models: In-Memory Key-Value/Data-Structure Stores (Redis ZSET skip lists, HyperLogLog, atomic Lua/Functions), Wide-Column LSM Stores (Cassandra query-first primary key = `(partition_key, clustering_columns)` with zero joins), and Native Property Graphs (Neo4j Index-Free Adjacency: O(degree) pointer hops independent of total graph size).',
    useCases: [
      'Redis: Real-time gaming leaderboards (`ZADD`/`ZREVRANGE`), distributed rate limits (Lua), Streams, and Geo-radius (`GEOSEARCH`).',
      'Cassandra / ScyllaDB: Globally distributed chat inbox history (`PRIMARY KEY ((user_id, month), message_ts)`) at 1M writes/sec.',
      'Neo4j / Neptune Graph: Real-time fraud rings (shared device/card/IP 4-hop paths), recommendation engines, and IAM RBAC/ReBAC.',
    ],
    whenToUse:
      'Use Redis for ephemeral sub-ms state/queues/leaderboards, Cassandra for massive write-heavy time-ordered partitions, and Graph DBs when relationships are deep (3+ variable hops) and central to the query.',
    whenNotToUse:
      'Never use Cassandra when you need ad-hoc arbitrary WHERE filters or multi-table JOINs. Never use a Graph DB for simple flat CRUD or bulk tabular aggregations.',
    performanceTip:
      'In Cassandra, ALWAYS model tables from your exact query access patterns first (1 table per query pattern) and keep partition sizes under ~100MB by adding a time bucket (e.g., `month`) to the Partition Key!',
    codeLanguage: 'NoSQL (MongoDB / DynamoDB / Cypher)',
    codeExample: `-- 1. Cassandra Wide-Column (Query-First Partition + Sorted Clustering Key)
CREATE TABLE messages_by_channel (
    channel_id UUID,
    month_bucket TEXT,         -- Bounds partition size!
    created_at TIMEUUID,       -- Stored physically sorted DESC on disk!
    sender_id UUID,
    body TEXT,
    PRIMARY KEY ((channel_id, month_bucket), created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- 2. Neo4j Cypher Graph Traversal (4-Hop Fraud Ring in O(degree), zero JOINs!)
MATCH (a:Account {id: "acc_9"})-[:USES_DEVICE|USES_CARD*1..4]-(suspect:Account)
WHERE suspect.flagged = true
RETURN DISTINCT suspect.id, suspect.riskScore;`,
    dfdNodes: [
      { id: 'kv', label: 'Redis RAM DS', sublabel: 'ZSET / Lua <1ms', x: 78, y: 110 },
      { id: 'wc', label: 'Cassandra Partition', sublabel: 'Hash(PK) + Sort', x: 248, y: 58 },
      { id: 'gr', label: 'Neo4j Graph Node', sublabel: 'Direct Edge Ptr', x: 424, y: 162 },
      { id: 'ans', label: 'Specialized Speed', sublabel: 'Zero Heavy Join', x: 586, y: 110 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'kv', to: 'ans', label: 'Sub-ms RAM' },
      { id: 'e2', from: 'wc', to: 'ans', label: '1M Writes/s' },
      { id: 'e3', from: 'gr', to: 'ans', label: 'O(deg) Hops' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Redis In-Memory Data Structures & Atomic Lua',
        plainEnglish: 'Runs leaderboard rankings and token-bucket rate checks directly in RAM in under 1 millisecond.',
        technicalDetail: 'Single-threaded command loop executes Lua scripts atomically with zero lock contention.',
        activeNodeIds: ['kv', 'ans'],
        activeEdgeIds: ['e1'],
        packetLabel: 'REDIS <1ms',
      },
      {
        step: 2,
        title: 'Cassandra Consistent Hash Ring + Sorted Clustering Keys',
        plainEnglish: 'Hashes the Partition Key to locate the exact node and reads messages already pre-sorted newest-first on SSD!',
        technicalDetail: 'Zero joins, linear horizontal write scaling via LSM-Trees and tunable Quorum consistency (R + W > N).',
        activeNodeIds: ['wc', 'ans'],
        activeEdgeIds: ['e2'],
        packetLabel: 'WIDE-COL',
      },
      {
        step: 3,
        title: 'Graph Index-Free Adjacency Multi-Hop Traversal',
        plainEnglish: 'Each node stores physical pointers to its neighbors—finding 4-hop fraud rings takes milliseconds regardless of total DB size!',
        technicalDetail: 'Eliminates exponential O(N^4) SQL self-join explosion on variable-depth graph queries.',
        activeNodeIds: ['gr', 'ans'],
        activeEdgeIds: ['e3'],
        packetLabel: 'GRAPH HOP',
      },
    ],
  },
];

/* ============================================================================
   TRACK 2: BEGINNER-TO-ADVANCED SQL SCENARIOS & PRACTICE (8 SCENARIOS)
   ============================================================================ */

export const SQL_PROGRESSIVE_SCENARIOS: SqlProgressiveScenario[] = [
  {
    id: 'sql-beg-filter-case',
    number: '01',
    level: 'Beginner',
    title: 'Filtering, Null Safety (COALESCE), CASE WHEN & Keyset Pagination',
    concepts: 'WHERE · COALESCE · CASE WHEN · ORDER BY · LIMIT',
    businessScenario:
      'Product managers need a clean active-products catalog showing discounted price (falling back to regular price if discount is NULL) and a readable price tier label ("Budget", "Mid", "Premium").',
    schemaSummary: 'products(id, name, price, discount_price, is_active, created_at)',
    plainEnglishGoal:
      'Select active products, replace NULL discount_price using COALESCE, classify price tier with CASE WHEN, sort newest first, and fetch the first 20 rows.',
    starterSql: `-- Complete the beginner catalog query
SELECT
    id,
    name,
    -- TODO: use COALESCE(discount_price, price) AS final_price
    -- TODO: add CASE WHEN price >= 200 THEN 'Premium' ... END AS tier
FROM products
-- TODO: filter active products, ORDER BY created_at DESC, LIMIT 20
;`,
    solutionSql: `SELECT
    id,
    name,
    COALESCE(discount_price, price) AS final_price,
    CASE
        WHEN COALESCE(discount_price, price) >= 200 THEN 'Premium'
        WHEN COALESCE(discount_price, price) >= 50  THEN 'Mid'
        ELSE 'Budget'
    END AS price_tier
FROM products
WHERE is_active = TRUE
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
    walkthrough: [
      '1. `WHERE is_active = TRUE` filters inactive rows early (use a Partial Index `WHERE is_active = TRUE`).',
      '2. `COALESCE(discount_price, price)` safely avoids NULL arithmetic bugs (in SQL, `100 + NULL = NULL`!).',
      '3. `CASE WHEN ... END` creates clean derived categories inside SQL without shipping extra logic.',
      '4. Tie-breaking `ORDER BY created_at DESC, id DESC` guarantees deterministic pagination order.',
    ],
    rules: [
      {
        id: 'coalesce',
        label: 'Uses COALESCE() for NULL-safe pricing',
        hint: 'Use COALESCE(discount_price, price) to fall back when discount_price is NULL.',
        test: (s) => /\bcoalesce\s*\(/i.test(s),
      },
      {
        id: 'case',
        label: 'Uses CASE WHEN ... END tier classification',
        hint: 'Add a CASE WHEN ... THEN ... ELSE ... END expression.',
        test: (s) => /\bcase\b[\s\S]*\bwhen\b[\s\S]*\bend\b/i.test(s),
      },
      {
        id: 'where',
        label: 'Filters active rows via WHERE',
        hint: 'Include WHERE is_active = TRUE (or = true).',
        test: (s) => /\bwhere\b[\s\S]*is_active/i.test(s),
      },
      {
        id: 'order-limit',
        label: 'Sorts with ORDER BY and bounds output with LIMIT',
        hint: 'Add ORDER BY created_at DESC LIMIT 20.',
        test: (s) => /\border\s+by\b/i.test(s) && /\blimit\b/i.test(s),
      },
    ],
  },
  {
    id: 'sql-beg-joins-antijoin',
    number: '02',
    level: 'Beginner',
    title: 'LEFT JOIN Anti-Join & NOT EXISTS (Find Inactive / Zero-Order Customers)',
    concepts: 'LEFT JOIN · IS NULL Anti-Join · NOT EXISTS · NULL Pitfall',
    businessScenario:
      'Marketing wants to email every registered customer who has NEVER placed an order in 2026 so they can send a first-purchase coupon.',
    schemaSummary: 'customers(id, email, created_at) · orders(id, customer_id, placed_at)',
    plainEnglishGoal:
      'Find all customers with zero matching rows in orders using either a LEFT JOIN ... WHERE o.id IS NULL anti-join OR NOT EXISTS (never NOT IN on nullable columns!).',
    starterSql: `-- Find customers who have NEVER placed an order
SELECT c.id, c.email
FROM customers c
-- TODO: LEFT JOIN orders o ON ... WHERE o.id IS NULL (or use NOT EXISTS)
;`,
    solutionSql: `SELECT c.id, c.email
FROM customers c
LEFT JOIN orders o
    ON o.customer_id = c.id
WHERE o.id IS NULL;

-- Alternative (often even cleaner for the optimizer's Anti-Join plan):
-- SELECT c.id, c.email FROM customers c
-- WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);`,
    walkthrough: [
      '1. `LEFT JOIN` keeps every customer even if zero orders match (filling `o.*` columns with NULL).',
      '2. `WHERE o.id IS NULL` discards matched customers, leaving ONLY those with zero orders (an Anti-Join!).',
      '3. Why NOT `WHERE id NOT IN (SELECT customer_id FROM orders)`? If a single `customer_id` is NULL, `NOT IN` evaluates to UNKNOWN and silently returns ZERO rows!',
    ],
    rules: [
      {
        id: 'join-or-exists',
        label: 'Uses LEFT JOIN or NOT EXISTS against orders',
        hint: 'Use LEFT JOIN orders o ON o.customer_id = c.id or WHERE NOT EXISTS (...).',
        test: (s) => /\bleft\s+(outer\s+)?join\s+orders\b/i.test(s) || /\bnot\s+exists\s*\(/i.test(s),
      },
      {
        id: 'null-or-exists-pred',
        label: 'Correctly isolates non-matching rows (IS NULL or correlated NOT EXISTS)',
        hint: 'Add WHERE o.id IS NULL (with LEFT JOIN) or correlate o.customer_id = c.id inside NOT EXISTS.',
        test: (s) => /\bis\s+null\b/i.test(s) || /\bnot\s+exists\s*\([\s\S]*customer_id/i.test(s),
      },
      {
        id: 'no-not-in',
        label: 'Avoids the unsafe NOT IN nullable-subquery trap',
        hint: 'Replace NOT IN with LEFT JOIN ... IS NULL or NOT EXISTS.',
        test: (s) => !/\bnot\s+in\s*\(\s*select/i.test(s),
      },
    ],
  },
  {
    id: 'sql-int-groupby-having-filter',
    number: '03',
    level: 'Intermediate',
    title: 'GROUP BY, HAVING & Conditional Aggregation (FILTER / CASE Pivot)',
    concepts: 'GROUP BY · HAVING · COUNT FILTER · Conditional SUM',
    businessScenario:
      'Finance needs a regional dashboard showing total orders, PAID revenue vs REFUNDED revenue side-by-side in one single pass, returning ONLY regions exceeding $10,000 in paid sales.',
    schemaSummary: 'orders(id, region, status, total_cents, placed_at)',
    plainEnglishGoal:
      'Group by region, compute conditional paid & refunded sums in 1 table scan, and filter aggregated groups using HAVING.',
    starterSql: `-- Single-pass conditional aggregation + HAVING filter
SELECT
    region,
    COUNT(*) AS total_orders
    -- TODO: conditional SUM for PAID and REFUNDED orders
FROM orders
-- TODO: GROUP BY region and HAVING paid revenue > 1000000
;`,
    solutionSql: `SELECT
    region,
    COUNT(*) AS total_orders,
    SUM(total_cents) FILTER (WHERE status = 'PAID')     AS paid_cents,
    SUM(total_cents) FILTER (WHERE status = 'REFUNDED') AS refunded_cents
FROM orders
GROUP BY region
HAVING SUM(total_cents) FILTER (WHERE status = 'PAID') > 1000000
ORDER BY paid_cents DESC;`,
    walkthrough: [
      '1. `WHERE` filters raw rows BEFORE grouping; `HAVING` filters grouped totals AFTER `GROUP BY`.',
      '2. `SUM(total_cents) FILTER (WHERE status = \'PAID\')` (or `SUM(CASE WHEN ...)`) pivots multiple statuses in ONE single pass over disk instead of running 2 separate queries!',
      '3. Standard SQL requires every non-aggregated SELECT column to appear in `GROUP BY`.',
    ],
    rules: [
      {
        id: 'groupby',
        label: 'Groups rows using GROUP BY region',
        hint: 'Add GROUP BY region.',
        test: (s) => /\bgroup\s+by\s+region\b/i.test(s),
      },
      {
        id: 'cond-agg',
        label: 'Uses conditional aggregation (FILTER WHERE or SUM(CASE WHEN))',
        hint: "Use SUM(total_cents) FILTER (WHERE status = 'PAID') or SUM(CASE WHEN status = 'PAID' THEN total_cents ELSE 0 END).",
        test: (s) => /\bfilter\s*\(\s*where\b/i.test(s) || /\bsum\s*\(\s*case\b/i.test(s),
      },
      {
        id: 'having',
        label: 'Filters post-aggregation groups with HAVING',
        hint: 'Add HAVING SUM(...) > 1000000.',
        test: (s) => /\bhaving\b/i.test(s),
      },
    ],
  },
  {
    id: 'sql-int-upsert-matview',
    number: '04',
    level: 'Intermediate',
    title: 'Idempotent UPSERT (ON CONFLICT DO UPDATE) & Materialized View Refresh',
    concepts: 'INSERT ON CONFLICT · EXCLUDED · Atomic Upsert · Concurrency',
    businessScenario:
      'Webhook workers ingest product inventory updates that may arrive twice due to retries. Make the write 100% idempotent and race-condition free without a broken SELECT-then-INSERT.',
    schemaSummary: 'inventory(sku PK, warehouse_id PK, qty, updated_at)',
    plainEnglishGoal:
      'Insert a new stock row or atomically update `qty` and `updated_at` on `(sku, warehouse_id)` conflict using `EXCLUDED`, returning the updated row via `RETURNING`.',
    starterSql: `-- Write an atomic, race-free UPSERT statement
INSERT INTO inventory (sku, warehouse_id, qty, updated_at)
VALUES ('SKU-42', 1, 25, NOW())
-- TODO: ON CONFLICT (sku, warehouse_id) DO UPDATE SET ... RETURNING *
;`,
    solutionSql: `INSERT INTO inventory (sku, warehouse_id, qty, updated_at)
VALUES ('SKU-42', 1, 25, NOW())
ON CONFLICT (sku, warehouse_id)
DO UPDATE SET
    qty        = inventory.qty + EXCLUDED.qty,
    updated_at = EXCLUDED.updated_at
RETURNING sku, warehouse_id, qty, updated_at;`,
    walkthrough: [
      '1. Application-level `SELECT -> if exists UPDATE else INSERT` suffers from classic race conditions under concurrency!',
      '2. `ON CONFLICT (sku, warehouse_id) DO UPDATE` resolves uniqueness atomically inside the B-Tree index.',
      '3. `EXCLUDED` references the incoming proposed row values; `RETURNING` avoids a second SELECT round-trip.',
    ],
    rules: [
      {
        id: 'on-conflict',
        label: 'Uses ON CONFLICT (...) DO UPDATE',
        hint: 'Add ON CONFLICT (sku, warehouse_id) DO UPDATE SET ...',
        test: (s) => /\bon\s+conflict\b[\s\S]*\bdo\s+update\b/i.test(s),
      },
      {
        id: 'excluded',
        label: 'References incoming values via EXCLUDED',
        hint: 'Use EXCLUDED.qty or EXCLUDED.updated_at in the SET clause.',
        test: (s) => /\bexcluded\./i.test(s),
      },
      {
        id: 'returning',
        label: 'Returns the mutated row in 1 RTT via RETURNING',
        hint: 'End the statement with RETURNING * (or specific columns).',
        test: (s) => /\breturning\b/i.test(s),
      },
    ],
  },
  {
    id: 'sql-adv-windows-topn-mom',
    number: '05',
    level: 'Advanced',
    title: 'Window Functions: Top-N Per Group, Running Total & MoM Growth (LAG)',
    concepts: 'CTE · DENSE_RANK() OVER · LAG() · ROWS BETWEEN',
    businessScenario:
      'Analytics wants the Top 3 highest-revenue products per category PLUS each month’s revenue growth percentage compared to the previous month.',
    schemaSummary: 'monthly_sales(category, product_id, month_date, revenue)',
    plainEnglishGoal:
      'Use a CTE with `DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC)` and `LAG(revenue) OVER (...)`, then filter `WHERE rnk <= 3` in the outer query.',
    starterSql: `-- Compute Top-3 products per category + previous-month delta via Window Functions
WITH ranked AS (
    SELECT
        category,
        product_id,
        month_date,
        revenue
        -- TODO: DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...) AS rnk
        -- TODO: LAG(revenue) OVER (PARTITION BY ... ORDER BY ...) AS prev_rev
    FROM monthly_sales
)
SELECT * FROM ranked
-- TODO: keep top 3 per category
;`,
    solutionSql: `WITH ranked AS (
    SELECT
        category,
        product_id,
        month_date,
        revenue,
        DENSE_RANK() OVER (
            PARTITION BY category ORDER BY revenue DESC
        ) AS rnk,
        LAG(revenue) OVER (
            PARTITION BY product_id ORDER BY month_date
        ) AS prev_month_rev
    FROM monthly_sales
)
SELECT
    category,
    product_id,
    revenue,
    revenue - COALESCE(prev_month_rev, 0) AS mom_delta
FROM ranked
WHERE rnk <= 3;`,
    walkthrough: [
      '1. `DENSE_RANK()` keeps ties fairly (1, 2, 2, 3) unlike `ROW_NUMBER()` which breaks ties arbitrarily.',
      '2. `LAG(revenue)` peeks at the previous ordered row in O(1) without a slow self-join!',
      '3. Wrapping in a `WITH ranked AS (...)` CTE lets you cleanly filter `WHERE rnk <= 3` because SQL evaluates WHERE before Window Functions.',
    ],
    rules: [
      {
        id: 'cte',
        label: 'Wraps window calculation inside a WITH CTE',
        hint: 'Use WITH ranked AS (SELECT ... ) SELECT ... FROM ranked.',
        test: (s) => /\bwith\s+\w+\s+as\s*\(/i.test(s),
      },
      {
        id: 'rank',
        label: 'Uses DENSE_RANK() or ROW_NUMBER() OVER (PARTITION BY ...)',
        hint: 'Add DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC).',
        test: (s) => /\b(dense_rank|rank|row_number)\s*\(\s*\)\s*over\s*\([\s\S]*partition\s+by/i.test(s),
      },
      {
        id: 'lag',
        label: 'Computes previous-period value using LAG() OVER (...)',
        hint: 'Add LAG(revenue) OVER (PARTITION BY ... ORDER BY month_date).',
        test: (s) => /\blag\s*\([\s\S]*\)\s*over\s*\(/i.test(s),
      },
      {
        id: 'top3',
        label: 'Filters top-N in outer WHERE clause',
        hint: 'Add WHERE rnk <= 3 in the outer SELECT.',
        test: (s) => /\bwhere\b[\s\S]*(<=|<)\s*3/i.test(s),
      },
    ],
  },
  {
    id: 'sql-adv-recursive-lateral',
    number: '06',
    level: 'Advanced',
    title: 'WITH RECURSIVE Hierarchy Traversal & CROSS JOIN LATERAL Top-K',
    concepts: 'WITH RECURSIVE · UNION ALL · Cycle Protection · LATERAL JOIN',
    businessScenario:
      'Build an e-commerce breadcrumb path (Electronics > Audio > Headphones) from a self-referencing `categories(id, name, parent_id)` table of arbitrary depth.',
    schemaSummary: 'categories(id, name, parent_id)',
    plainEnglishGoal:
      'Write a `WITH RECURSIVE` query starting at `parent_id IS NULL`, joining children via `UNION ALL`, concatenating breadcrumb paths, and guarding against cycles or runaway depth.',
    starterSql: `-- Build full category breadcrumbs using WITH RECURSIVE
WITH RECURSIVE cat_tree AS (
    -- TODO: Anchor member (WHERE parent_id IS NULL)
    -- UNION ALL
    -- TODO: Recursive member joining categories c ON c.parent_id = cat_tree.id
)
SELECT id, name, breadcrumb, depth FROM cat_tree;`,
    solutionSql: `WITH RECURSIVE cat_tree AS (
    SELECT
        id,
        name,
        name::TEXT AS breadcrumb,
        1 AS depth,
        ARRAY[id] AS visited
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    SELECT
        c.id,
        c.name,
        t.breadcrumb || ' > ' || c.name,
        t.depth + 1,
        t.visited || c.id
    FROM categories c
    JOIN cat_tree t ON c.parent_id = t.id
    WHERE NOT (c.id = ANY(t.visited))
      AND t.depth < 12
)
SELECT id, name, breadcrumb, depth
FROM cat_tree
ORDER BY breadcrumb;`,
    walkthrough: [
      '1. Anchor member seeds root categories (`WHERE parent_id IS NULL`).',
      '2. `UNION ALL` avoids expensive duplicate-hashing on every iteration (use `UNION` only if graph has diamonds).',
      '3. `NOT (c.id = ANY(t.visited))` and `t.depth < 12` protect production CPUs from corrupt cyclic parent pointers!',
    ],
    rules: [
      {
        id: 'with-rec',
        label: 'Declares WITH RECURSIVE CTE',
        hint: 'Start with WITH RECURSIVE cat_tree AS (...).',
        test: (s) => /\bwith\s+recursive\b/i.test(s),
      },
      {
        id: 'anchor',
        label: 'Seeds roots with parent_id IS NULL',
        hint: 'Include WHERE parent_id IS NULL in the anchor SELECT.',
        test: (s) => /\bparent_id\s+is\s+null\b/i.test(s),
      },
      {
        id: 'union-all',
        label: 'Combines anchor & recursive step via UNION ALL',
        hint: 'Separate anchor and recursive SELECT with UNION ALL.',
        test: (s) => /\bunion\s+all\b/i.test(s),
      },
      {
        id: 'guard',
        label: 'Includes cycle or max-depth guard',
        hint: 'Add a depth limit (depth < 12) or visited array check.',
        test: (s) => /\bdepth\s*<\s*\d+/i.test(s) || /\bany\s*\(/i.test(s) || /\bcycle\b/i.test(s),
      },
    ],
  },
  {
    id: 'sql-adv-trigger-audit',
    number: '07',
    level: 'Advanced',
    title: 'Tamper-Proof Audit Trigger & PL/pgSQL Validation Function',
    concepts: 'CREATE FUNCTION · RETURNS TRIGGER · AFTER UPDATE · JSONB OLD/NEW',
    businessScenario:
      'Security compliance mandates that EVERY salary change on `employees`—whether from the HR app or an admin console—must automatically write `OLD` and `NEW` JSONB snapshots into `salary_audit`.',
    schemaSummary: 'employees(id, name, salary) · salary_audit(emp_id, old_row, new_row, changed_at)',
    plainEnglishGoal:
      'Create a `RETURNS TRIGGER` function inserting `to_jsonb(OLD)` and `to_jsonb(NEW)` into `salary_audit`, and attach it via `CREATE TRIGGER ... AFTER UPDATE ON employees FOR EACH ROW`.',
    starterSql: `-- 1. Create the trigger function returning TRIGGER
CREATE OR REPLACE FUNCTION fn_log_salary_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- TODO: INSERT INTO salary_audit using OLD and NEW
    RETURN NEW;
END;
$$;

-- 2. Attach AFTER UPDATE trigger FOR EACH ROW on employees
`,
    solutionSql: `CREATE OR REPLACE FUNCTION fn_log_salary_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.salary IS DISTINCT FROM OLD.salary THEN
        INSERT INTO salary_audit (emp_id, old_row, new_row, changed_at)
        VALUES (NEW.id, to_jsonb(OLD), to_jsonb(NEW), NOW());
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_employees_salary_audit
AFTER UPDATE OF salary ON employees
FOR EACH ROW
EXECUTE FUNCTION fn_log_salary_change();`,
    walkthrough: [
      '1. `AFTER UPDATE OF salary` fires ONLY when the `salary` column is targeted—skipping unrelated profile edits!',
      '2. `IS DISTINCT FROM` handles NULL comparisons safely without failing like `!=`.',
      '3. Storing `to_jsonb(OLD)` and `to_jsonb(NEW)` makes the audit table future-proof even as columns are added.',
    ],
    rules: [
      {
        id: 'ret-trg',
        label: 'Defines function with RETURNS TRIGGER',
        hint: 'Use CREATE OR REPLACE FUNCTION ... RETURNS TRIGGER LANGUAGE plpgsql.',
        test: (s) => /\breturns\s+trigger\b/i.test(s),
      },
      {
        id: 'audit-ins',
        label: 'Inserts OLD & NEW snapshot into salary_audit',
        hint: 'INSERT INTO salary_audit ... VALUES (..., to_jsonb(OLD), to_jsonb(NEW), ...).',
        test: (s) => /\binsert\s+into\s+salary_audit\b/i.test(s) && /\bold\b/i.test(s) && /\bnew\b/i.test(s),
      },
      {
        id: 'create-trg',
        label: 'Binds AFTER UPDATE trigger FOR EACH ROW',
        hint: 'Add CREATE TRIGGER ... AFTER UPDATE ... ON employees FOR EACH ROW EXECUTE FUNCTION ...',
        test: (s) => /\bcreate\s+trigger\b[\s\S]*\bafter\s+update\b[\s\S]*\bfor\s+each\s+row\b/i.test(s),
      },
    ],
  },
  {
    id: 'sql-prin-keyset-covering',
    number: '08',
    level: 'Principal',
    title: 'Keyset Cursor Pagination & Covering Index (INCLUDE) — Zero OFFSET Decay',
    concepts: 'Keyset Pagination · Composite Tuple Compare · INCLUDE Covering Index',
    businessScenario:
      'Page 5,000 of your activity feed (`OFFSET 100000 LIMIT 20`) takes 1.8 seconds because Postgres scans & discards 100,000 rows! Redesign it with O(log N) Keyset Cursor Pagination + an Index-Only Scan.',
    schemaSummary: 'events(id BIGINT, tenant_id BIGINT, created_at TIMESTAMPTZ, event_type TEXT)',
    plainEnglishGoal:
      'Create a covering index on `(tenant_id, created_at DESC, id DESC) INCLUDE (event_type)` and fetch the next 20 events using tuple keyset comparison `(created_at, id) < ($last_ts, $last_id)`.',
    starterSql: `-- 1. Create a Covering Index supporting Index-Only Scan
-- TODO: CREATE INDEX ... ON events (tenant_id, created_at DESC, id DESC) INCLUDE (event_type);

-- 2. Rewrite OFFSET pagination using O(log N) Keyset Tuple Cursor
SELECT id, created_at, event_type
FROM events
WHERE tenant_id = 7
  -- TODO: keyset condition (created_at, id) < ('2026-11-21T10:00:00Z', 98420)
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
    solutionSql: `CREATE INDEX idx_events_tenant_feed
    ON events (tenant_id, created_at DESC, id DESC)
    INCLUDE (event_type);

SELECT id, created_at, event_type
FROM events
WHERE tenant_id = 7
  AND (created_at, id) < ('2026-11-21T10:00:00Z'::timestamptz, 98420)
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
    walkthrough: [
      '1. `OFFSET 100000` is O(N) because the engine must walk 100,000 rows and throw them away—and rows shift if new events arrive!',
      '2. Tuple Keyset `(created_at, id) < (cursor_ts, cursor_id)` seeks directly into the B-Tree leaf in O(log N) (~0.4ms even on Page 50,000!).',
      '3. `INCLUDE (event_type)` stores `event_type` in the index leaf pages, turning the query into a zero-heap-fetch **Index-Only Scan**!',
    ],
    rules: [
      {
        id: 'covering',
        label: 'Creates Covering Index with INCLUDE (event_type)',
        hint: 'Add CREATE INDEX ... ON events (tenant_id, created_at DESC, id DESC) INCLUDE (event_type);',
        test: (s) => /\bcreate\s+index\b[\s\S]*\binclude\s*\(\s*event_type\s*\)/i.test(s),
      },
      {
        id: 'keyset',
        label: 'Uses Tuple Keyset Cursor (created_at, id) < (...)',
        hint: 'Use AND (created_at, id) < (last_ts, last_id) instead of OFFSET.',
        test: (s) => /\(\s*created_at\s*,\s*id\s*\)\s*<\s*\(/i.test(s),
      },
      {
        id: 'no-offset',
        label: 'Eliminates slow OFFSET keyword completely',
        hint: 'Remove OFFSET and rely purely on the keyset cursor + LIMIT 20.',
        test: (s) => !/\boffset\b/i.test(s) && /\blimit\s+20\b/i.test(s),
      },
    ],
  },
];

/* ============================================================================
   TRACK 3: DATABASE SCHEMA DESIGN TECHNIQUES (8 ARCHITECTURAL PATTERNS)
   ============================================================================ */

export const DB_SCHEMA_DESIGN_TECHNIQUES: DbSchemaTechnique[] = [
  {
    id: 'schema-normalization',
    number: '01',
    shortTitle: 'Normalization (1NF–BCNF)',
    title: 'Relational Normalization (1NF -> 2NF -> 3NF -> BCNF): Single Source of Truth',
    category: 'Relational Modeling',
    workloadMatch: 'oltp',
    tagline: 'Store every business fact in exactly one place so updates never contradict each other.',
    simpleEnglish:
      'If a customer’s email is copy-pasted inside 500 order rows and they change their email, you must update 500 rows—miss one and your data lies! Normalization splits entities cleanly so every fact lives in ONE table: 1NF (atomic cells), 2NF (no partial-key dependencies), 3NF (no non-key-to-non-key dependencies).',
    technicalExplanation:
      'Applies functional dependency decomposition: 1NF eliminates repeating groups/arrays; 2NF removes partial dependencies on composite primary keys; 3NF eliminates transitive dependencies (A -> B -> C); Boyce-Codd Normal Form (BCNF) guarantees every non-trivial determinant is a candidate superkey.',
    whyUse:
      'Eliminates Insertion, Update, and Deletion Anomalies, minimizes storage footprint, and maximizes OLTP write integrity under concurrent mutations.',
    whenToUse: [
      'Core transactional OLTP systems (FinTech ledgers, ERP, healthcare EHR, e-commerce inventory & orders).',
      'Write-heavy domains where entities mutate frequently and stale duplicates cause compliance bugs.',
      'Default starting blueprint for ANY new relational database before benchmarking real bottlenecks.',
    ],
    whenToAvoid: [
      'Read-heavy BI analytical dashboards aggregating 10+ tables (use Star Schema instead).',
      'Ultra-high-QPS read feeds where 6-way joins burn CPU (selectively denormalize hot counters).',
    ],
    tradeOffs: {
      readSpeed: 'Moderate (requires indexed JOINs)',
      writeSpeed: 'Fast & Safe (update 1 row, zero fan-out)',
      consistency: 'Strict ACID Single Source of Truth',
      storageCost: 'Minimal (zero duplicated text)',
    },
    entities: [
      {
        name: 'customers',
        role: 'Parent Entity (3NF)',
        columns: [
          { name: 'id', type: 'BIGINT', badge: 'PK' },
          { name: 'email', type: 'TEXT', badge: 'UK' },
          { name: 'tier', type: 'VARCHAR(16)' },
        ],
      },
      {
        name: 'orders',
        role: 'Transactional Child',
        columns: [
          { name: 'id', type: 'BIGINT', badge: 'PK' },
          { name: 'customer_id', type: 'BIGINT', badge: 'FK' },
          { name: 'placed_at', type: 'TIMESTAMPTZ', badge: 'IDX' },
        ],
      },
      {
        name: 'order_items',
        role: 'M:N Bridge + Price Snapshot',
        columns: [
          { name: 'order_id', type: 'BIGINT', badge: 'PK' },
          { name: 'product_id', type: 'BIGINT', badge: 'FK' },
          { name: 'unit_price_cents', type: 'BIGINT' },
        ],
      },
    ],
    ddlBlueprint: `-- Clean 3NF OLTP Core (Note: unit_price_cents is snapshotted on order_items
-- intentionally because historical invoice price MUST NOT change if catalog price changes!)
CREATE TABLE customers (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    full_name  TEXT NOT NULL
);

CREATE TABLE orders (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    placed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_orders_customer_placed ON orders (customer_id, placed_at DESC);`,
  },
  {
    id: 'schema-denormalization',
    number: '02',
    shortTitle: 'Strategic Denormalization',
    title: 'Strategic Denormalization, Derived Counters & Read-Optimized Projections',
    category: 'Relational Modeling',
    workloadMatch: 'scale',
    tagline: 'Intentionally duplicate hot read fields or pre-computed counters AFTER proving a join bottleneck.',
    simpleEnglish:
      'Running `SELECT COUNT(*) FROM likes WHERE post_id = 42` every time 100,000 users view a viral post will melt your database! Denormalization stores `like_count` right on the `posts` row so reads take 0.2ms—trading a tiny bit of extra write work for 100x faster reads.',
    technicalExplanation:
      'Controlled relaxation of 3NF by caching pre-joined attributes (`author_name`), materialized rollups (`like_count`, `order_total_cents`), or JSONB read payloads on the primary entity, kept consistent via atomic SQL triggers, transactional writes, or async CDC reconciliation jobs.',
    whyUse:
      'Eliminates expensive multi-table joins and `COUNT(*)` scans on ultra-hot read paths (social feeds, product listing cards, inbox unread badges).',
    whenToUse: [
      'Read-to-Write ratio exceeds 20:1 and EXPLAIN ANALYZE proves join/aggregation latency is the bottleneck.',
      'Immutable historical snapshots (copying `shipping_address` & `unit_price` onto an Order at checkout!).',
      'Aggregate badges (`unread_count`, `follower_count`, `avg_rating`).',
    ],
    whenToAvoid: [
      'Before profiling! Premature denormalization creates complex sync bugs and write-amplification.',
      'Frequently changing fields duplicated across millions of child rows (update storm!).',
    ],
    tradeOffs: {
      readSpeed: 'Blazing Fast (O(1) single-table lookup)',
      writeSpeed: 'Slower (extra sync / counter updates)',
      consistency: 'Must guard via Tx or Periodic Reconciler',
      storageCost: 'Higher (duplicated attributes)',
    },
    entities: [
      {
        name: 'posts (Denormalized Hot Row)',
        role: 'Zero-Join Feed Read',
        columns: [
          { name: 'id', type: 'BIGINT', badge: 'PK' },
          { name: 'author_id', type: 'BIGINT', badge: 'FK' },
          { name: 'author_handle', type: 'TEXT' },
          { name: 'like_count', type: 'INT' },
          { name: 'comment_count', type: 'INT' },
        ],
      },
      {
        name: 'post_likes',
        role: 'Source of Truth',
        columns: [
          { name: 'post_id', type: 'BIGINT', badge: 'PK' },
          { name: 'user_id', type: 'BIGINT', badge: 'PK' },
          { name: 'created_at', type: 'TIMESTAMPTZ' },
        ],
      },
    ],
    ddlBlueprint: `-- Denormalized hot counter kept in sync atomically inside the write transaction
BEGIN;
INSERT INTO post_likes (post_id, user_id) VALUES (42, 901) ON CONFLICT DO NOTHING;
UPDATE posts SET like_count = like_count + 1 WHERE id = 42;
COMMIT;

-- Tip: For viral posts (>500 likes/sec), buffer increments in Redis INCR
-- and flush deltas to Postgres every 5s to avoid row-lock contention!`,
  },
  {
    id: 'schema-star-snowflake',
    number: '03',
    shortTitle: 'Star & Snowflake (OLAP)',
    title: 'Dimensional Modeling: Star Schema vs Snowflake Schema for Analytics & Warehouses',
    category: 'Analytics & Warehouse',
    workloadMatch: 'analytics',
    tagline: 'Organize billions of analytical events into a central Fact table surrounded by rich Dimension tables.',
    simpleEnglish:
      'Think of a Star Schema like a wheel: the hub in the middle (`fact_sales`) holds pure numbers and dates (revenue, qty, cost), and the spokes (`dim_date`, `dim_product`, `dim_store`, `dim_customer`) hold descriptive labels. BI tools slice and dice 1 billion rows in seconds with simple 1-hop joins!',
    technicalExplanation:
      'Kimball Dimensional Modeling separates additive numeric measurements in narrow, high-volume Fact tables (referencing Surrogate Keys) from wide, denormalized Dimension tables (Star Schema) or normalized sub-dimensions (Snowflake Schema: `dim_product -> dim_subcategory -> dim_category`). Optimized for columnar engines (ClickHouse, BigQuery, Snowflake, DuckDB).',
    whyUse:
      'Makes complex BI queries (`Revenue by Fiscal Quarter × Product Category × Store Region`) dramatically simpler, faster to scan column-wise, and intuitive for analysts.',
    whenToUse: [
      'Data Warehouses, Lakehouses, executive BI dashboards, and cohort/funnel reporting.',
      'Prefer **Star Schema** by default (fewer joins, faster columnar scans); use **Snowflake** only when huge shared dimensions need strict hierarchy deduplication.',
    ],
    whenToAvoid: [
      'Live transactional OLTP apps processing single-user CRUD mutations (use 3NF OLTP + CDC into Star Warehouse!).',
    ],
    tradeOffs: {
      readSpeed: 'Ultra-Fast Analytical Scans (1-hop joins)',
      writeSpeed: 'Batch / Streaming ETL Append',
      consistency: 'Near Real-Time / Hourly ETL',
      storageCost: 'Very Low on Columnar Compression (RLE/Dict)',
    },
    entities: [
      {
        name: 'fact_sales (Center Hub)',
        role: 'Billions of Numeric Events',
        columns: [
          { name: 'sale_sk', type: 'BIGINT', badge: 'PK' },
          { name: 'date_key', type: 'INT', badge: 'FK' },
          { name: 'product_sk', type: 'INT', badge: 'FK' },
          { name: 'store_sk', type: 'INT', badge: 'FK' },
          { name: 'revenue_cents', type: 'BIGINT' },
        ],
      },
      {
        name: 'dim_date (Spoke)',
        role: 'Calendar Attributes',
        columns: [
          { name: 'date_key', type: 'INT', badge: 'PK' },
          { name: 'fiscal_quarter', type: 'TEXT' },
          { name: 'is_holiday', type: 'BOOLEAN' },
        ],
      },
      {
        name: 'dim_product (Spoke)',
        role: 'Denormalized Catalog',
        columns: [
          { name: 'product_sk', type: 'INT', badge: 'PK' },
          { name: 'sku', type: 'TEXT', badge: 'IDX' },
          { name: 'category', type: 'TEXT' },
          { name: 'brand', type: 'TEXT' },
        ],
      },
    ],
    ddlBlueprint: `-- Star Schema: Central Fact Table + Pre-Joined Dimension Spokes
CREATE TABLE fact_sales (
    sale_sk       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date_key      INT NOT NULL REFERENCES dim_date(date_key),
    product_sk    INT NOT NULL REFERENCES dim_product(product_sk),
    store_sk      INT NOT NULL REFERENCES dim_store(store_sk),
    qty           INT NOT NULL,
    revenue_cents BIGINT NOT NULL
) PARTITION BY RANGE (date_key);`,
  },
  {
    id: 'schema-multi-tenant',
    number: '04',
    shortTitle: 'Multi-Tenant SaaS Isolation',
    title: 'Multi-Tenant Schema Design: Pooled + RLS vs Schema-per-Tenant vs Silo DB-per-Tenant',
    category: 'Scale & Multi-Tenancy',
    workloadMatch: 'saas',
    tagline: 'Isolate B2B customer data securely while balancing cloud cost, noisy neighbors, and schema migrations.',
    simpleEnglish:
      'Building B2B SaaS is like choosing housing for customers: (1) **Shared Tables + tenant_id + RLS** is an apartment building (cheapest, easy migrations, engine-enforced locks on every door), (2) **Schema-per-Tenant** is townhouses, and (3) **Database-per-Tenant** is private villas for giant banks demanding zero shared hardware!',
    technicalExplanation:
      'Three isolation tiers: Pool Model (shared tables with composite `(tenant_id, id)` keys + PostgreSQL Row-Level Security policies), Bridge Model (separate PostgreSQL schema per tenant — degrades catalog cache past ~1,000 tenants), and Silo Model (dedicated DB cluster per enterprise tenant with independent backup/encryption keys/residency).',
    whyUse:
      'Prevents catastrophic cross-tenant data leaks while scaling cost-effectively from 10 to 100,000 SaaS workspaces.',
    whenToUse: [
      '**Pool + RLS**: Default choice for 95% of SaaS startups & mid-market apps (100 to 100,000+ tenants).',
      '**Silo (DB-per-Tenant)**: Regulated enterprise tiers (HIPAA/FedRAMP/EU residency) paying premium contracts.',
      '**Hybrid**: Pool for Free/Pro tiers + dedicated Silo DB for Fortune-500 Enterprise tier!',
    ],
    whenToAvoid: [
      'Avoid Schema-per-Tenant if you expect >2,000 tenants—PostgreSQL system catalog bloat and running DDL migrations across 10,000 schemas becomes an operational nightmare!',
    ],
    tradeOffs: {
      readSpeed: 'Fast with leading (tenant_id, ...) indexes',
      writeSpeed: 'High Utilization (Shared Pool)',
      consistency: 'DB-Enforced Row-Level Security (RLS)',
      storageCost: 'Lowest (Pool) -> Highest (Silo)',
    },
    entities: [
      {
        name: 'invoices (Pooled + RLS)',
        role: 'Composite Tenant Partition',
        columns: [
          { name: 'tenant_id', type: 'UUID', badge: 'PK' },
          { name: 'id', type: 'BIGINT', badge: 'PK' },
          { name: 'amount_cents', type: 'BIGINT' },
          { name: 'created_at', type: 'TIMESTAMPTZ', badge: 'IDX' },
        ],
      },
    ],
    ddlBlueprint: `-- Pool Model with Defense-in-Depth PostgreSQL Row-Level Security (RLS)
CREATE TABLE invoices (
    tenant_id    UUID NOT NULL,
    id           BIGINT GENERATED ALWAYS AS IDENTITY,
    amount_cents BIGINT NOT NULL,
    PRIMARY KEY (tenant_id, id)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON invoices
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);`,
  },
  {
    id: 'schema-temporal-scd',
    number: '05',
    shortTitle: 'Temporal & SCD Type 2',
    title: 'Temporal Schemas, Audit History & Slowly Changing Dimensions (SCD Type 1 / 2 / 4)',
    category: 'Analytics & Warehouse',
    workloadMatch: 'audit',
    tagline: 'Answer "What was this customer’s plan or price on March 14, 2025?" with zero ambiguity.',
    simpleEnglish:
      'Normal `UPDATE` erases history forever! SCD Type 2 never overwrites old rows—it closes the old row’s `valid_to` timestamp and inserts a brand-new version with `valid_from = NOW()`. Combined with PostgreSQL range exclusion constraints, two versions can NEVER accidentally overlap in time!',
    technicalExplanation:
      'Temporal versioning tracks valid-time (`valid_during TSTZRANGE`) and/or system-time history. SCD Type 1 overwrites in place; SCD Type 2 appends versioned rows with effective date bounds + `is_current`; SCD Type 4 splits live current state into a lean table and pushes historical versions into a separate `*_history` table.',
    whyUse:
      'Essential for billing, insurance policies, tax rates, healthcare records, and accurate historical analytics where retroactive overwrites corrupt past reports.',
    whenToUse: [
      'Pricing plans, tax rules, employee salaries, compliance-regulated records, and BI dimensions.',
      'Use **SCD Type 4** (current table + history table) when OLTP reads only care about current state 99% of the time!',
    ],
    whenToAvoid: [
      'Ephemeral session state, caches, or high-churn telemetry where full historical row versioning wastes disk.',
    ],
    tradeOffs: {
      readSpeed: 'Fast with GiST range / partial is_current idx',
      writeSpeed: '2x writes (close old + insert new)',
      consistency: 'Zero-Overlap Temporal Proof (EXCLUDE)',
      storageCost: 'Grows linearly with change frequency',
    },
    entities: [
      {
        name: 'plan_prices_scd2',
        role: 'Non-Overlapping Versioned Table',
        columns: [
          { name: 'version_id', type: 'BIGINT', badge: 'PK' },
          { name: 'plan_code', type: 'TEXT', badge: 'IDX' },
          { name: 'price_cents', type: 'BIGINT' },
          { name: 'valid_during', type: 'TSTZRANGE', badge: 'IDX' },
        ],
      },
    ],
    ddlBlueprint: `-- SCD Type 2 with PostgreSQL Exclusion Constraint (Mathematically blocks overlaps!)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE plan_prices_scd2 (
    version_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plan_code    TEXT NOT NULL,
    price_cents  BIGINT NOT NULL,
    valid_during TSTZRANGE NOT NULL,
    EXCLUDE USING gist (plan_code WITH =, valid_during WITH &&)
);

-- Point-in-time query: What did PRO cost on 2026-06-15?
SELECT price_cents FROM plan_prices_scd2
WHERE plan_code = 'PRO' AND valid_during @> '2026-06-15 12:00:00Z'::timestamptz;`,
  },
  {
    id: 'schema-partition-sharding',
    number: '06',
    shortTitle: 'Partitioning & Sharding',
    title: 'Declarative Table Partitioning (Range / List / Hash) & Horizontal Sharding',
    category: 'Scale & Multi-Tenancy',
    workloadMatch: 'scale',
    tagline: 'Split billion-row tables into bite-sized chunks for O(1) partition pruning and instant zero-vacuum retention drops.',
    simpleEnglish:
      'When a single table hits 500GB, its B-Tree indexes stop fitting in RAM and `DELETE FROM logs WHERE created_at < 90_days` freezes your database! Range Partitioning splits that table into monthly mini-tables: queries only touch 1 month (Partition Pruning), and deleting old data is an instant `DROP TABLE logs_2025_01`!',
    technicalExplanation:
      'Vertical/Local Partitioning (PostgreSQL Declarative `PARTITION BY RANGE/LIST/HASH`) splits storage and indexes within one server for cache locality and instant DDL archival; Horizontal Sharding (Citus, Vitess, CockroachDB) distributes partitions across independent servers by Shard Key to scale write IOPS & RAM beyond 1 machine.',
    whyUse:
      'Keeps active B-Tree indexes hot in RAM, eliminates massive Autovacuum storms on old data deletion, and breaks single-node write ceilings when sharded.',
    whenToUse: [
      '**Range Partitioning**: Any append-heavy table exceeding ~50–100GB (events, orders, payments, logs) with time-based queries & retention.',
      '**Horizontal Sharding**: Only after vertical scaling, indexing, partitioning, and read replicas are exhausted (>50k+ write TPS or >10TB hot working set).',
    ],
    whenToAvoid: [
      'Do NOT partition tiny tables (<10GB)—planning overhead slows queries. Avoid monotonic timestamp Shard Keys in distributed clusters (causes 100% of writes to slam a single "hot shard"!).',
    ],
    tradeOffs: {
      readSpeed: 'Fast if query includes Partition Key',
      writeSpeed: 'Linear Horizontal Scale (Hash Shards)',
      consistency: 'Cross-Shard Tx needs 2PC (avoid!)',
      storageCost: 'Instant Drop / S3 Cold Archival',
    },
    entities: [
      {
        name: 'audit_events (Parent)',
        role: 'PARTITION BY RANGE (created_at)',
        columns: [
          { name: 'created_at', type: 'TIMESTAMPTZ', badge: 'PK' },
          { name: 'id', type: 'BIGINT', badge: 'PK' },
          { name: 'tenant_id', type: 'UUID', badge: 'IDX' },
          { name: 'payload', type: 'JSONB' },
        ],
      },
    ],
    ddlBlueprint: `-- Declarative Monthly Range Partitioning (Partition Key MUST be in Primary Key!)
CREATE TABLE audit_events (
    created_at TIMESTAMPTZ NOT NULL,
    id         BIGINT GENERATED ALWAYS AS IDENTITY,
    tenant_id  UUID NOT NULL,
    payload    JSONB NOT NULL,
    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE TABLE audit_events_2026_11 PARTITION OF audit_events
    FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

-- Instant O(1) retention cleanup (Zero VACUUM bloat!):
-- DROP TABLE audit_events_2025_11;`,
  },
  {
    id: 'schema-polymorphic-jsonb',
    number: '07',
    shortTitle: 'Inheritance & JSONB Hybrid',
    title: 'Class-Table Inheritance, Single-Table Inheritance & Relational + JSONB Hybrid Schemas',
    category: 'Relational Modeling',
    workloadMatch: 'oltp',
    tagline: 'Model heterogeneous product catalogs or entity subtypes cleanly without EAV anti-patterns or 200 NULL columns.',
    simpleEnglish:
      'Selling both Shoes (size, color) and Laptops (CPU, RAM, SSD) in one SQL table creates hundreds of empty NULL columns! Use a Relational + JSONB Hybrid: keep core shared columns (`id`, `sku`, `price`, `brand`) strictly typed in SQL columns, and store category-specific specs in a GIN-indexed `attributes JSONB` column!',
    technicalExplanation:
      'Compares 4 subtype patterns: Single-Table Inheritance (1 wide table with sparse NULLs), Class-Table Inheritance (shared base table + 1:1 subtype tables), Concrete-Table Inheritance, and Relational + JSONB Hybrid (`JSONB` + `GIN jsonb_path_ops` index + generated columns for hot keys), strictly avoiding the slow Entity-Attribute-Value (EAV) anti-pattern.',
    whyUse:
      'Delivers rock-solid ACID relational guarantees on core billing/inventory fields while giving product teams schema flexibility for 500+ variable attributes.',
    whenToUse: [
      'E-commerce catalogs, SaaS custom form fields, webhook payloads, and feature configurations.',
      'Use **Class-Table Inheritance** when subtypes are few (<=5) and strictly structured (e.g., `payments` -> `card_payments` / `wire_payments`).',
    ],
    whenToAvoid: [
      'NEVER dump primary keys, foreign keys, or money amounts inside untyped JSONB! Never build an EAV `(entity_id, attr_name, attr_value)` table for core querying.',
    ],
    tradeOffs: {
      readSpeed: 'Fast via GIN jsonb_path_ops Index',
      writeSpeed: 'Moderate (GIN maintenance on JSON updates)',
      consistency: 'Strict SQL Core + CHECK JSON Schema',
      storageCost: 'Zero Sparse NULL Column Bloat',
    },
    entities: [
      {
        name: 'catalog_items (Hybrid)',
        role: 'Typed Core + Flexible JSONB',
        columns: [
          { name: 'id', type: 'BIGINT', badge: 'PK' },
          { name: 'sku', type: 'TEXT', badge: 'UK' },
          { name: 'price_cents', type: 'BIGINT', badge: 'IDX' },
          { name: 'specs', type: 'JSONB', badge: 'IDX' },
        ],
      },
    ],
    ddlBlueprint: `-- Relational + JSONB Hybrid with GIN jsonb_path_ops Index
CREATE TABLE catalog_items (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku         TEXT NOT NULL UNIQUE,
    category    TEXT NOT NULL,
    price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
    specs       JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Fast @> containment queries: WHERE specs @> '{"ram_gb": 32}'
CREATE INDEX idx_catalog_specs_gin
    ON catalog_items USING gin (specs jsonb_path_ops);`,
  },
  {
    id: 'schema-event-sourcing-cqrs',
    number: '08',
    shortTitle: 'Event Sourcing & CQRS',
    title: 'Event Sourcing & CQRS (Append-Only Event Store + Polyglot Read Projections)',
    category: 'NoSQL & Eventing',
    workloadMatch: 'audit',
    tagline: 'Store every state transition as an immutable fact—enabling perfect financial ledgers, time-travel replay, and tailored read models.',
    simpleEnglish:
      'Your bank statement never just stores `balance = $450`—it stores every deposit and withdrawal in chronological order, and your balance is simply the sum of those immutable events! CQRS splits the system in two: a fast append-only Write Store for truth, and specialized Read Projections (SQL, Redis, Elasticsearch) rebuilt anytime from events!',
    technicalExplanation:
      'Event Sourcing persists state as an ordered append-only log (`events(stream_id, version)` with Optimistic Concurrency `UNIQUE(stream_id, version)` + periodic Snapshots). Command Query Responsibility Segregation (CQRS) projects committed events asynchronously via Outbox/CDC into denormalized read views optimized independently for search, analytics, or sub-ms lookups.',
    whyUse:
      'Provides an unbreakable audit trail by design, unlocks retroactive analytics ("rebuild a brand-new dashboard from 3 years of past events"), and scales reads & writes completely independently.',
    whenToUse: [
      'Double-entry accounting ledgers, payment rails, trading order books, collaborative editing, and regulated compliance workflows.',
    ],
    whenToAvoid: [
      'Do NOT use Event Sourcing for simple CRUD apps (user profiles, blogs)—schema evolution of old events and eventual consistency between Write and Read models add steep engineering overhead!',
    ],
    tradeOffs: {
      readSpeed: 'Instant on Dedicated CQRS Read Models',
      writeSpeed: 'Fast O(1) Append-Only Event Log',
      consistency: 'Strong on Write Stream; Eventual on Views',
      storageCost: 'Append-Only (mitigate via Snapshots)',
    },
    entities: [
      {
        name: 'domain_events (Write Store)',
        role: 'Immutable Append-Only Log',
        columns: [
          { name: 'stream_id', type: 'UUID', badge: 'PK' },
          { name: 'version', type: 'INT', badge: 'PK' },
          { name: 'event_type', type: 'TEXT' },
          { name: 'payload', type: 'JSONB' },
        ],
      },
      {
        name: 'account_balances_view (CQRS)',
        role: 'Projected Read Model',
        columns: [
          { name: 'account_id', type: 'UUID', badge: 'PK' },
          { name: 'balance_cents', type: 'BIGINT' },
          { name: 'last_version', type: 'INT' },
        ],
      },
    ],
    ddlBlueprint: `-- Event Store with Optimistic Concurrency Control via UNIQUE (stream_id, version)
CREATE TABLE domain_events (
    global_seq  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    stream_id   UUID NOT NULL,
    version     INT NOT NULL,
    event_type  TEXT NOT NULL,
    payload     JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (stream_id, version) -- Prevents concurrent split-brain writes!
);`,
  },
];
