import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Database,
  KeyRound,
  Play,
  RotateCcw,
  SearchCheck,
  Table2,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  createInitialMiniDatabase,
  runMiniSql,
  type MiniDatabaseState,
  type SqlRunResponse,
} from '../../utils/miniSqlEngine';
import { CopyButton } from '../ui';

interface SqlLessonPreset {
  id: string;
  category: string;
  title: string;
  plainEnglish: string;
  syntaxPattern: string;
  sql: string;
  isBrokenDemo?: boolean;
}

const SQL_BASIC_PRESETS: SqlLessonPreset[] = [
  {
    id: 'create-table',
    category: '01 · CREATE (DDL)',
    title: 'CREATE TABLE with Constraints',
    plainEnglish:
      'Defines a new table blueprint with column data types, a unique PRIMARY KEY, and NOT NULL rules.',
    syntaxPattern: 'CREATE TABLE name (col TYPE PRIMARY KEY, col2 TYPE NOT NULL);',
    sql: `-- Create a new products table with Primary Key & NOT NULL rules
CREATE TABLE IF NOT EXISTS products (
  sku_id INT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price DECIMAL(10,2) NOT NULL
);

INSERT INTO products (sku_id, title, category, price)
VALUES
  (501, 'NVMe SSD 2TB', 'Storage', 189),
  (502, 'DDR5 RAM 64GB', 'Memory', 240);

SELECT * FROM products ORDER BY price DESC;`,
  },
  {
    id: 'insert-rows',
    category: '02 · INSERT (Create)',
    title: 'INSERT Single & Multi-Row Data',
    plainEnglish:
      'Adds new rows into an existing table while the engine validates column counts, NOT NULL rules, and Primary Key uniqueness.',
    syntaxPattern: "INSERT INTO table (c1, c2) VALUES (v1, v2);",
    sql: `-- Insert a new user and their first order
INSERT INTO users (id, name, email, city, plan)
VALUES (5, 'Kiran Rao', 'kiran@acme.io', 'Mumbai', 'PRO');

INSERT INTO orders (order_id, user_id, product, amount, status)
VALUES (107, 5, 'Dedicated Replica', 410, 'PAID');

SELECT * FROM users WHERE city = 'Mumbai';`,
  },
  {
    id: 'select-join-group',
    category: '03 · SELECT (Read)',
    title: 'SELECT, WHERE, JOIN & GROUP BY',
    plainEnglish:
      'Reads rows, filters with WHERE, combines related tables with JOIN, and computes totals using GROUP BY + SUM/COUNT.',
    syntaxPattern: 'SELECT cols FROM t1 JOIN t2 ON ... WHERE ... GROUP BY ... ORDER BY ...;',
    sql: `-- 1. Join users and orders to see who bought what
SELECT name, product, amount, status
FROM orders
INNER JOIN users ON orders.user_id = users.id
WHERE status = 'PAID'
ORDER BY amount DESC;

-- 2. Revenue summary grouped by order status
SELECT status, COUNT(*) AS total_orders, SUM(amount) AS revenue
FROM orders
GROUP BY status
ORDER BY revenue DESC;`,
  },
  {
    id: 'update-safe',
    category: '04 · UPDATE (Modify)',
    title: 'UPDATE Rows Safely with WHERE',
    plainEnglish:
      'Changes existing column values. Always include a WHERE clause—omitting WHERE updates every single row in the table!',
    syntaxPattern: "UPDATE table SET col = 'new_val' WHERE id = 103;",
    sql: `-- Mark pending Order #103 as PAID and confirm the change
UPDATE orders
SET status = 'PAID', amount = 55
WHERE order_id = 103;

SELECT order_id, product, amount, status
FROM orders
WHERE order_id = 103;`,
  },
  {
    id: 'delete-safe',
    category: '05 · DELETE (Remove)',
    title: 'DELETE Specific Rows vs. TRUNCATE',
    plainEnglish:
      'DELETE removes only rows matching WHERE (logged per row). TRUNCATE wipes all rows instantly while keeping the table schema.',
    syntaxPattern: "DELETE FROM table WHERE status = 'CANCELLED';",
    sql: `-- Safely remove only cancelled orders (never omit WHERE!)
DELETE FROM orders
WHERE status = 'CANCELLED';

SELECT * FROM orders ORDER BY order_id ASC;`,
  },
  {
    id: 'indexing-btree',
    category: '06 · INDEXING',
    title: 'CREATE INDEX (Seq Scan -> Index Scan)',
    plainEnglish:
      'Builds a sorted B-Tree lookup structure on filtered columns so queries jump directly to matching rows in O(log N) instead of scanning the entire table.',
    syntaxPattern: 'CREATE [UNIQUE] INDEX idx_name ON table (col1, col2);',
    sql: `-- Step 1: Query BEFORE index (watch plan show Seq Scan!)
SELECT order_id, product, amount FROM orders WHERE status = 'PAID';

-- Step 2: Create a composite B-Tree index (leading column = status)
CREATE INDEX IF NOT EXISTS idx_orders_status_amount ON orders (status, amount);

-- Step 3: Re-run the exact same query (plan upgrades to Index Scan!)
SELECT order_id, product, amount FROM orders WHERE status = 'PAID';`,
  },
  {
    id: 'broken-syntax-demo',
    category: 'Syntax Check Demo',
    title: 'Test Syntax Checker (Broken SQL)',
    plainEnglish:
      'Loads intentionally broken SQL (keyword typo + unknown column) so you can see the Syntax Checker pinpoint mistakes with fixes.',
    syntaxPattern: 'Click "Check Syntax" to inspect line-by-line diagnostics',
    isBrokenDemo: true,
    sql: `-- Intentional SQL mistakes for testing the Syntax Checker:
-- 1. Typo "FORM" instead of "FROM"
SLECT order_id, product FORM orders WHERE status = 'PAID';`,
  },
];

interface PracticeMilestone {
  id: 'CREATE_TABLE' | 'INSERT' | 'SELECT' | 'UPDATE' | 'DELETE' | 'CREATE_INDEX' | 'INDEX_SCAN';
  label: string;
}

const PRACTICE_MILESTONES: PracticeMilestone[] = [
  { id: 'CREATE_TABLE', label: 'CREATE TABLE' },
  { id: 'INSERT', label: 'INSERT rows' },
  { id: 'SELECT', label: 'SELECT query' },
  { id: 'UPDATE', label: 'UPDATE with WHERE' },
  { id: 'DELETE', label: 'DELETE safely' },
  { id: 'CREATE_INDEX', label: 'CREATE INDEX' },
  { id: 'INDEX_SCAN', label: 'Trigger Index Scan' },
];

export function SqlBasicsPlayground() {
  const [db, setDb] = useState<MiniDatabaseState>(() => createInitialMiniDatabase());
  const [activePresetId, setActivePresetId] = useState<string>(SQL_BASIC_PRESETS[5].id);
  const [sqlInput, setSqlInput] = useState<string>(SQL_BASIC_PRESETS[5].sql);
  const [lastMode, setLastMode] = useState<'syntax-only' | 'execute' | null>(null);
  const [lastResponse, setLastResponse] = useState<SqlRunResponse | null>(null);
  const [selectedTableName, setSelectedTableName] = useState<string>('orders');
  const [completedOps, setCompletedOps] = useState<string[]>([]);

  const tableNames = useMemo(() => Object.keys(db.tables), [db.tables]);
  const activeTable = db.tables[selectedTableName] ?? db.tables[tableNames[0]];
  const activeTableIndexes = useMemo(
    () => db.indexes.filter((i) => i.tableName === activeTable?.name),
    [db.indexes, activeTable]
  );

  const activePreset = useMemo(
    () => SQL_BASIC_PRESETS.find((p) => p.id === activePresetId) ?? SQL_BASIC_PRESETS[0],
    [activePresetId]
  );

  const handleLoadPreset = (preset: SqlLessonPreset) => {
    setActivePresetId(preset.id);
    setSqlInput(preset.sql);
    setLastResponse(null);
    setLastMode(null);
  };

  const handleCheckSyntax = () => {
    const res = runMiniSql(sqlInput, db, 'syntax-only');
    setLastMode('syntax-only');
    setLastResponse(res);
  };

  const handleRunSql = () => {
    const res = runMiniSql(sqlInput, db, 'execute');
    setLastMode('execute');
    setLastResponse(res);
    if (res.syntaxValid) {
      setDb(res.nextDb);
      if (res.completedOps.length > 0) {
        setCompletedOps((prev) => Array.from(new Set([...prev, ...res.completedOps])));
      }
      // If a brand-new table was created, switch explorer to it automatically
      const created = Object.keys(res.nextDb.tables).find((t) => !db.tables[t]);
      if (created) setSelectedTableName(created);
    }
  };

  const handleResetDb = () => {
    setDb(createInitialMiniDatabase());
    setSelectedTableName('orders');
    setLastResponse(null);
    setLastMode(null);
  };

  const handleDropIndexQuick = (indexName: string) => {
    const res = runMiniSql(`DROP INDEX ${indexName};`, db, 'execute');
    if (res.syntaxValid) {
      setDb(res.nextDb);
      setLastMode('execute');
      setLastResponse(res);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Core SQL Fundamentals Guide + 1-Click Preset Loader */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Code2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span className="font-semibold text-sky-700 dark:text-sky-400">
                SQL Fundamentals · CRUD, DDL &amp; B-Tree Indexing
              </span>
              <span aria-hidden="true">·</span>
              <span>Live Syntax Checker &amp; Mini Execution Engine</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Interactive Basic SQL &amp; Indexing Playground
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-6">
              Practice <code className="font-mono">CREATE TABLE</code>, <code className="font-mono">INSERT</code>,{' '}
              <code className="font-mono">SELECT</code>, <code className="font-mono">UPDATE</code>,{' '}
              <code className="font-mono">DELETE</code>, and <code className="font-mono">CREATE INDEX</code> against a live in-memory relational database. Run <strong>Check Syntax</strong> anytime to catch grammar, typo, and schema errors before executing.
            </p>
          </div>

          {/* Live Hands-On Milestone Progress */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-4 py-3 shrink-0">
            <div className="flex items-center justify-between gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span>Hands-On SQL Ops Verified</span>
              <span className="font-bold text-sky-700 dark:text-sky-400 tabular-nums">
                {completedOps.length}/{PRACTICE_MILESTONES.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] font-mono">
              {PRACTICE_MILESTONES.map((m) => {
                const done = completedOps.includes(m.id);
                return (
                  <span
                    key={m.id}
                    className={
                      done
                        ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {done ? '✓' : '○'} {m.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* 7 Interactive Lesson Cards (Create, Insert, Select, Update, Delete, Index, Syntax Error Demo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {SQL_BASIC_PRESETS.map((preset) => {
            const active = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadPreset(preset)}
                className={`text-left rounded-xl border p-3 transition-colors ${
                  active
                    ? preset.isBrokenDemo
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30'
                      : 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div
                  className={`text-[11px] font-mono font-semibold ${
                    preset.isBrokenDemo
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-sky-700 dark:text-sky-400'
                  }`}
                >
                  {preset.category}
                </div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1 leading-snug">
                  {preset.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Concept Quick Reference Bar */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {activePreset.title}
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-5">
              {activePreset.plainEnglish}
            </p>
          </div>
          <code className="font-mono text-[11px] px-3 py-2 rounded-md bg-slate-950 text-sky-300 border border-slate-800 shrink-0 overflow-x-auto max-w-full">
            {activePreset.syntaxPattern}
          </code>
        </div>
      </section>

      {/* Section 2: Two-Zone Live SQL Editor + Live Database Tables & Indexes Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: SQL Editor, Syntax Checker & Query Output */}
        <section className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                SQL Editor &amp; Syntax Validator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Write one or more semicolon-separated SQL statements. Press <kbd className="font-mono">Ctrl/Cmd + Enter</kbd> to run.
              </p>
            </div>
            <CopyButton text={sqlInput} label="Copy SQL" copiedLabel="Copied" size="xs" />
          </div>

          <textarea
            aria-label="SQL Playground Editor"
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRunSql();
              }
            }}
            rows={10}
            spellCheck={false}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 font-mono text-xs leading-6 p-4 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRunSql}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5" aria-hidden="true" />
                Run SQL
              </button>
              <button
                type="button"
                onClick={handleCheckSyntax}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-sky-500/60 bg-sky-50/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/70 transition-colors whitespace-nowrap shrink-0"
              >
                <SearchCheck className="w-3.5 h-3.5" aria-hidden="true" />
                Check Syntax Only
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetDb}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset Sample DB
            </button>
          </div>

          {/* Syntax Diagnostics & Execution Output */}
          {lastResponse && (
            <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              {/* Verdict Header */}
              <div
                className={`rounded-lg border p-3.5 flex items-start gap-2.5 text-xs ${
                  !lastResponse.syntaxValid
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
                    : lastResponse.issues.length > 0
                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {!lastResponse.syntaxValid ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                )}
                <div className="space-y-0.5">
                  <div className="font-semibold">
                    {!lastResponse.syntaxValid
                      ? `Syntax / Schema Check Failed (${lastResponse.issues.filter((i) => i.severity === 'error').length} error${lastResponse.issues.filter((i) => i.severity === 'error').length === 1 ? '' : 's'})`
                      : lastMode === 'syntax-only'
                        ? `Syntax Valid — ${lastResponse.results.length} statement${lastResponse.results.length === 1 ? '' : 's'} passed grammar & schema verification (database not modified)`
                        : `Executed ${lastResponse.results.length} statement${lastResponse.results.length === 1 ? '' : 's'} cleanly`}
                  </div>
                  {lastMode === 'syntax-only' && lastResponse.syntaxValid && (
                    <div className="opacity-90">
                      Click <strong>Run SQL</strong> to commit these statements to the live tables on the right.
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Syntax Errors & Safety Warnings */}
              {lastResponse.issues.length > 0 && (
                <div className="space-y-2">
                  {lastResponse.issues.map((issue, i) => (
                    <div
                      key={`${issue.code}-${i}`}
                      className={`rounded-lg border p-3.5 text-xs space-y-1 ${
                        issue.severity === 'error'
                          ? 'border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                          : 'border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                        <span
                          className={
                            issue.severity === 'error'
                              ? 'font-bold text-rose-700 dark:text-rose-400'
                              : 'font-bold text-amber-700 dark:text-amber-400'
                          }
                        >
                          {issue.severity.toUpperCase()} · Statement #{issue.statementIndex} · {issue.code}
                        </span>
                      </div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {issue.message}
                      </div>
                      <div className="text-slate-600 dark:text-slate-400">
                        <strong>Suggested Fix:</strong> {issue.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Per-Statement Execution Results & Query Plans */}
              {lastResponse.results.length > 0 && (
                <div className="space-y-3">
                  {lastResponse.results.map((res) => (
                    <div
                      key={res.statementIndex}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                    >
                      <div className="px-3.5 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                          #{res.statementIndex} · {res.kind}
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                          {res.message}
                        </div>
                      </div>

                      {res.plan && (
                        <div className="px-3.5 py-2 bg-slate-50/40 dark:bg-slate-950/30 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              res.plan.scanType === 'Index Scan'
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : res.plan.scanType === 'Seq Scan'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : 'text-sky-700 dark:text-sky-400'
                            }`}
                          >
                            <Zap className="w-3 h-3" aria-hidden="true" />
                            Plan: {res.plan.scanType}
                            {res.plan.indexUsed ? ` (${res.plan.indexUsed})` : ''}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {res.plan.detail}
                          </span>
                        </div>
                      )}

                      {res.columns && res.rows && (
                        <div className="overflow-x-auto">
                          {res.rows.length === 0 ? (
                            <div className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                              Query returned 0 rows.
                            </div>
                          ) : (
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                <tr>
                                  {res.columns.map((col) => (
                                    <th key={col} className="py-2 px-3">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                                {res.rows.map((row, rIdx) => (
                                  <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                    {res.columns!.map((col) => (
                                      <td
                                        key={col}
                                        className="py-2 px-3 tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap"
                                      >
                                        {row[col] === null || row[col] === undefined ? 'NULL' : String(row[col])}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right 5 Cols: Live Database Tables, Columns & Indexes Inspector */}
        <aside className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                Live Database Explorer ({tableNames.length} tables)
              </h3>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Updates live on Run SQL
              </span>
            </div>

            {/* Table Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {tableNames.map((name) => {
                const active = activeTable?.name === name;
                const count = db.tables[name].rows.length;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedTableName(name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors whitespace-nowrap ${
                      active
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {name} ({count})
                  </button>
                );
              })}
            </div>

            {activeTable && (
              <>
                {/* Schema Columns */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Columns &amp; Constraints
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                    {activeTable.columns.map((col) => (
                      <div key={col.name} className="px-3 py-2 flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {col.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {col.type}
                          {col.primaryKey ? ' · PK' : ''}
                          {col.notNull && !col.primaryKey ? ' · NOT NULL' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active B-Tree Indexes */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                      Active Indexes on <code className="font-mono">{activeTable.name}</code>
                    </span>
                    <span className="font-mono tabular-nums">{activeTableIndexes.length}</span>
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                    {activeTableIndexes.length === 0 ? (
                      <div className="p-3 text-slate-500 dark:text-slate-400">
                        No indexes — all WHERE queries perform a Seq Scan.
                      </div>
                    ) : (
                      activeTableIndexes.map((idx) => (
                        <div key={idx.name} className="px-3 py-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                              {idx.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              ({idx.columns.join(', ')}) {idx.unique ? '· UNIQUE' : '· B-Tree'}
                            </div>
                          </div>
                          {!idx.name.startsWith('pk_') && (
                            <button
                              type="button"
                              onClick={() => handleDropIndexQuick(idx.name)}
                              aria-label={`Drop index ${idx.name}`}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Live Rows Preview */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Current Rows ({activeTable.rows.length})
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-64">
                    {activeTable.rows.length === 0 ? (
                      <div className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                        Table is empty — run an INSERT statement to add rows.
                      </div>
                    ) : (
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                          <tr>
                            {activeTable.columns.map((c) => (
                              <th key={c.name} className="py-2 px-2.5 whitespace-nowrap">
                                {c.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {activeTable.rows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                              {activeTable.columns.map((c) => (
                                <td
                                  key={c.name}
                                  className="py-2 px-2.5 tabular-nums text-slate-800 dark:text-slate-200 whitespace-nowrap"
                                >
                                  {r[c.name] === null || r[c.name] === undefined ? 'NULL' : String(r[c.name])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
