export type SqlColumnType = 'INT' | 'VARCHAR' | 'DECIMAL' | 'BOOLEAN' | 'DATE';

export interface TableColumn {
  name: string;
  type: SqlColumnType;
  primaryKey?: boolean;
  notNull?: boolean;
}

export interface TableIndex {
  name: string;
  tableName: string;
  columns: string[];
  unique: boolean;
}

export type SqlValue = string | number | boolean | null;
export type TableRow = Record<string, SqlValue>;

export interface DatabaseTable {
  name: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export interface MiniDatabaseState {
  tables: Record<string, DatabaseTable>;
  indexes: TableIndex[];
}

export interface SyntaxIssue {
  statementIndex: number;
  statementPreview: string;
  severity: 'error' | 'warning';
  code: string;
  message: string;
  suggestion: string;
}

export interface StatementPlan {
  scanType: 'Index Scan' | 'Seq Scan' | 'DDL / Catalog' | 'DML Write';
  detail: string;
  indexUsed?: string;
  rowsScanned?: number;
  rowsAffected?: number;
}

export interface StatementExecutionResult {
  statementIndex: number;
  sql: string;
  kind: string;
  success: boolean;
  message: string;
  warning?: string;
  plan?: StatementPlan;
  columns?: string[];
  rows?: TableRow[];
}

export interface SqlIntelligenceFinding {
  id: string;
  severity: 'critical' | 'high' | 'optimization' | 'good';
  category: 'Fetch Speed' | 'Indexing' | 'Join / Rewrite' | 'Insert & Compression' | 'Correctness';
  title: string;
  explanation: string;
  recommendation: string;
  suggestedSql?: string;
  estimatedImpact: string;
}

export interface SqlIntelligenceReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  detectedScan: string;
  recommendedScan: string;
  estimatedSpeedup: string;
  compressionOpportunity: string;
  findings: SqlIntelligenceFinding[];
  optimizedSql: string;
}

export interface SqlRunResponse {
  syntaxValid: boolean;
  issues: SyntaxIssue[];
  results: StatementExecutionResult[];
  nextDb: MiniDatabaseState;
  completedOps: ('CREATE_TABLE' | 'INSERT' | 'SELECT' | 'UPDATE' | 'DELETE' | 'CREATE_INDEX' | 'INDEX_SCAN')[];
}

export function createInitialMiniDatabase(): MiniDatabaseState {
  return {
    tables: {
      users: {
        name: 'users',
        columns: [
          { name: 'id', type: 'INT', primaryKey: true, notNull: true },
          { name: 'name', type: 'VARCHAR', notNull: true },
          { name: 'email', type: 'VARCHAR', notNull: true },
          { name: 'city', type: 'VARCHAR' },
          { name: 'plan', type: 'VARCHAR' },
        ],
        rows: [
          { id: 1, name: 'Aarav Patel', email: 'aarav@acme.io', city: 'Bengaluru', plan: 'PRO' },
          { id: 2, name: 'Maya Lin', email: 'maya@globex.io', city: 'Seattle', plan: 'ENTERPRISE' },
          { id: 3, name: 'Liam Brooks', email: 'liam@initech.io', city: 'Austin', plan: 'FREE' },
          { id: 4, name: 'Sofia Rossi', email: 'sofia@acme.io', city: 'Bengaluru', plan: 'PRO' },
        ],
      },
      orders: {
        name: 'orders',
        columns: [
          { name: 'order_id', type: 'INT', primaryKey: true, notNull: true },
          { name: 'user_id', type: 'INT', notNull: true },
          { name: 'product', type: 'VARCHAR', notNull: true },
          { name: 'amount', type: 'DECIMAL', notNull: true },
          { name: 'status', type: 'VARCHAR', notNull: true },
        ],
        rows: [
          { order_id: 101, user_id: 1, product: 'Cloud DB Pro', amount: 120, status: 'PAID' },
          { order_id: 102, user_id: 2, product: 'Enterprise Cluster', amount: 850, status: 'PAID' },
          { order_id: 103, user_id: 1, product: 'Backup Add-on', amount: 45, status: 'PENDING' },
          { order_id: 104, user_id: 3, product: 'Starter Plan', amount: 25, status: 'CANCELLED' },
          { order_id: 105, user_id: 4, product: 'Cloud DB Pro', amount: 120, status: 'PAID' },
          { order_id: 106, user_id: 2, product: 'Vector Index Pack', amount: 300, status: 'SHIPPED' },
        ],
      },
    },
    indexes: [
      { name: 'pk_users_id', tableName: 'users', columns: ['id'], unique: true },
      { name: 'pk_orders_order_id', tableName: 'orders', columns: ['order_id'], unique: true },
    ],
  };
}

function cloneDb(db: MiniDatabaseState): MiniDatabaseState {
  const tables: Record<string, DatabaseTable> = {};
  Object.entries(db.tables).forEach(([key, tbl]) => {
    tables[key] = {
      name: tbl.name,
      columns: tbl.columns.map((c) => ({ ...c })),
      rows: tbl.rows.map((r) => ({ ...r })),
    };
  });
  return {
    tables,
    indexes: db.indexes.map((idx) => ({ ...idx, columns: [...idx.columns] })),
  };
}

function stripSqlComments(raw: string): string {
  // Remove -- line comments (outside single quotes) and /* ... */ block comments
  let out = '';
  let inSingle = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    const next = raw[i + 1];
    if (ch === "'" && raw[i - 1] !== '\\') {
      inSingle = !inSingle;
      out += ch;
      continue;
    }
    if (!inSingle && ch === '-' && next === '-') {
      while (i < raw.length && raw[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (!inSingle && ch === '/' && next === '*') {
      i += 2;
      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) i++;
      i++;
      out += ' ';
      continue;
    }
    out += ch;
  }
  return out;
}

function splitStatements(sql: string): { statements: string[]; lexicalError?: { message: string; suggestion: string } } {
  const cleaned = stripSqlComments(sql);
  const statements: string[] = [];
  let current = '';
  let inSingle = false;
  let parenDepth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "'" && cleaned[i - 1] !== '\\') {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (!inSingle) {
      if (ch === '(') parenDepth++;
      if (ch === ')') {
        parenDepth--;
        if (parenDepth < 0) {
          return {
            statements: [],
            lexicalError: {
              message: 'Unexpected closing parenthesis ")" with no matching "(".',
              suggestion: 'Check parentheses in CREATE TABLE, INSERT VALUES, or CREATE INDEX.',
            },
          };
        }
      }
      if (ch === ';') {
        if (current.trim()) statements.push(current.trim());
        current = '';
        continue;
      }
    }
    current += ch;
  }

  if (inSingle) {
    return {
      statements: [],
      lexicalError: {
        message: "Unclosed string literal — missing closing single quote (').",
        suggestion: "Close every text value with matching single quotes, e.g. 'PAID'.",
      },
    };
  }
  if (parenDepth !== 0) {
    return {
      statements: [],
      lexicalError: {
        message: `Unbalanced parentheses — ${parenDepth} opening "(" without a matching ")".`,
        suggestion: 'Ensure every "(" has a closing ")" before the semicolon.',
      },
    };
  }
  if (current.trim()) {
    statements.push(current.trim());
  }
  return { statements };
}

function splitCommaRespectingQuotesAndParens(input: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let inSingle = false;
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && input[i - 1] !== '\\') {
      inSingle = !inSingle;
      cur += ch;
      continue;
    }
    if (!inSingle) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        parts.push(cur.trim());
        cur = '';
        continue;
      }
    }
    cur += ch;
  }
  if (cur.trim() || input.trim().endsWith(',')) {
    parts.push(cur.trim());
  }
  return parts;
}

function parseLiteral(raw: string): { ok: boolean; value: SqlValue; error?: string } {
  const t = raw.trim();
  if (!t) return { ok: false, value: null, error: 'Empty value expression.' };
  if (/^NULL$/i.test(t)) return { ok: true, value: null };
  if (/^TRUE$/i.test(t)) return { ok: true, value: true };
  if (/^FALSE$/i.test(t)) return { ok: true, value: false };
  if (/^'.*'$/.test(t)) {
    return { ok: true, value: t.slice(1, -1).replace(/''/g, "'") };
  }
  if (/^-?\d+(\.\d+)?$/.test(t)) {
    return { ok: true, value: Number(t) };
  }
  return {
    ok: false,
    value: null,
    error: `Invalid literal "${t}". Wrap text values in single quotes (e.g. '${t}').`,
  };
}

function normalizeColumnType(rawType: string): SqlColumnType | null {
  const upper = rawType.toUpperCase();
  if (/^(INT|INTEGER|BIGINT|SMALLINT|SERIAL)$/.test(upper)) return 'INT';
  if (/^(VARCHAR(\(\d+\))?|TEXT|CHAR(\(\d+\))?)$/.test(upper)) return 'VARCHAR';
  if (/^(DECIMAL(\(\d+,\s*\d+\))?|NUMERIC(\(\d+,\s*\d+\))?|FLOAT|DOUBLE|REAL)$/.test(upper)) return 'DECIMAL';
  if (/^(BOOL|BOOLEAN)$/.test(upper)) return 'BOOLEAN';
  if (/^(DATE|TIMESTAMP|TIMESTAMPTZ)$/.test(upper)) return 'DATE';
  return null;
}

interface WhereClauseEval {
  referencedCols: string[];
  predicate: (row: TableRow) => boolean;
}

function splitAndConditionsRespectingBetween(group: string): string[] {
  // Split on AND unless it belongs to BETWEEN <low> AND <high>
  const tokens = group.split(/\s+/);
  const parts: string[] = [];
  let buf: string[] = [];
  let awaitingBetweenAnd = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const upper = t.toUpperCase();
    if (upper === 'BETWEEN') {
      awaitingBetweenAnd = true;
      buf.push(t);
      continue;
    }
    if (upper === 'AND') {
      if (awaitingBetweenAnd) {
        awaitingBetweenAnd = false;
        buf.push(t);
        continue;
      }
      if (buf.length > 0) {
        parts.push(buf.join(' ').trim());
        buf = [];
      }
      continue;
    }
    buf.push(t);
  }
  if (buf.length > 0) parts.push(buf.join(' ').trim());
  return parts.filter(Boolean);
}

function parseWhereClause(
  whereText: string,
  validCols: Set<string>
): { ok: true; eval: WhereClauseEval } | { ok: false; error: string; suggestion: string } {
  // Support OR groups of AND clauses (including BETWEEN ... AND ..., IN (...), NOT LIKE, IS NULL)
  const orGroups = whereText.split(/\s+OR\s+/i).map((g) => g.trim()).filter(Boolean);
  if (orGroups.length === 0) {
    return {
      ok: false,
      error: 'Empty WHERE clause.',
      suggestion: "Provide a condition like WHERE status = 'PAID' or WHERE amount BETWEEN 50 AND 500.",
    };
  }

  const referencedCols: string[] = [];
  const groupFns: ((row: TableRow) => boolean)[] = [];

  for (const group of orGroups) {
    const andParts = splitAndConditionsRespectingBetween(group);
    const partFns: ((row: TableRow) => boolean)[] = [];

    for (const part of andParts) {
      // 1. IS NULL / IS NOT NULL
      const nullMatch = part.match(/^([a-zA-Z_][a-zA-Z0-9_.]*)\s+IS\s+(NOT\s+)?NULL$/i);
      if (nullMatch) {
        const col = nullMatch[1].toLowerCase().split('.').pop()!;
        if (!validCols.has(col)) {
          return {
            ok: false,
            error: `Unknown column "${col}" in WHERE clause.`,
            suggestion: `Available columns: ${Array.from(validCols).join(', ')}.`,
          };
        }
        referencedCols.push(col);
        const isNot = Boolean(nullMatch[2]);
        partFns.push((row) =>
          isNot
            ? row[col] !== null && row[col] !== undefined
            : row[col] === null || row[col] === undefined
        );
        continue;
      }

      // 2. [NOT] BETWEEN low AND high
      const betweenMatch = part.match(
        /^([a-zA-Z_][a-zA-Z0-9_.]*)\s+(NOT\s+)?BETWEEN\s+(.+?)\s+AND\s+(.+)$/i
      );
      if (betweenMatch) {
        const col = betweenMatch[1].toLowerCase().split('.').pop()!;
        const isNot = Boolean(betweenMatch[2]);
        if (!validCols.has(col)) {
          return {
            ok: false,
            error: `Unknown column "${col}" in BETWEEN condition.`,
            suggestion: `Available columns: ${Array.from(validCols).join(', ')}.`,
          };
        }
        const lowLit = parseLiteral(betweenMatch[3]);
        const highLit = parseLiteral(betweenMatch[4]);
        if (!lowLit.ok || !highLit.ok) {
          return {
            ok: false,
            error: `Invalid BETWEEN bounds in "${part}".`,
            suggestion: 'Example: WHERE amount BETWEEN 100 AND 500.',
          };
        }
        referencedCols.push(col);
        const lowN = Number(lowLit.value);
        const highN = Number(highLit.value);
        partFns.push((row) => {
          const v = row[col];
          if (v === null || v === undefined) return false;
          const nv = Number(v);
          const inside =
            !Number.isNaN(nv) && !Number.isNaN(lowN) && !Number.isNaN(highN)
              ? nv >= lowN && nv <= highN
              : String(v) >= String(lowLit.value) && String(v) <= String(highLit.value);
          return isNot ? !inside : inside;
        });
        continue;
      }

      // 3. [NOT] IN (v1, v2, ...)
      const inMatch = part.match(/^([a-zA-Z_][a-zA-Z0-9_.]*)\s+(NOT\s+)?IN\s*\(([^)]+)\)$/i);
      if (inMatch) {
        const col = inMatch[1].toLowerCase().split('.').pop()!;
        const isNot = Boolean(inMatch[2]);
        if (!validCols.has(col)) {
          return {
            ok: false,
            error: `Unknown column "${col}" in IN (...) condition.`,
            suggestion: `Available columns: ${Array.from(validCols).join(', ')}.`,
          };
        }
        const rawItems = splitCommaRespectingQuotesAndParens(inMatch[3]);
        const parsedVals: SqlValue[] = [];
        for (const ri of rawItems) {
          const lit = parseLiteral(ri);
          if (!lit.ok) {
            return {
              ok: false,
              error: lit.error ?? `Invalid value "${ri}" inside IN (...).`,
              suggestion: "Example: WHERE status IN ('PAID', 'SHIPPED').",
            };
          }
          parsedVals.push(lit.value);
        }
        referencedCols.push(col);
        const hasNullInList = parsedVals.some((v) => v === null);
        partFns.push((row) => {
          const v = row[col];
          if (v === null || v === undefined) return false;
          const matched = parsedVals.some(
            (pv) => pv !== null && String(pv).toLowerCase() === String(v).toLowerCase()
          );
          if (isNot) {
            // SQL 3-valued logic: NOT IN with NULL returns UNKNOWN (false)
            if (hasNullInList) return false;
            return !matched;
          }
          return matched;
        });
        continue;
      }

      // 4. Comparison operators including NOT LIKE / ILIKE
      const cmpMatch = part.match(
        /^([a-zA-Z_][a-zA-Z0-9_.]*)\s*(=|!=|<>|>=|<=|>|<|NOT\s+LIKE|NOT\s+ILIKE|ILIKE|LIKE)\s*(.+)$/i
      );
      if (!cmpMatch) {
        return {
          ok: false,
          error: `Could not parse WHERE condition "${part}".`,
          suggestion:
            "Use comparisons like status = 'PAID', amount BETWEEN 50 AND 500, status IN ('PAID', 'SHIPPED'), or product LIKE 'Cloud%'.",
        };
      }

      const col = cmpMatch[1].toLowerCase().split('.').pop()!;
      const op = cmpMatch[2].replace(/\s+/g, ' ').toUpperCase();
      const rawVal = cmpMatch[3].trim();

      if (!validCols.has(col)) {
        return {
          ok: false,
          error: `Unknown column "${col}" in WHERE clause.`,
          suggestion: `Available columns: ${Array.from(validCols).join(', ')}.`,
        };
      }

      const lit = parseLiteral(rawVal);
      if (!lit.ok) {
        return {
          ok: false,
          error: lit.error ?? `Invalid value "${rawVal}" in WHERE clause.`,
          suggestion: "Quote strings with single quotes (e.g. status = 'PAID') and write numbers unquoted.",
        };
      }

      referencedCols.push(col);
      const target = lit.value;

      partFns.push((row) => {
        const v = row[col];
        if (v === null || v === undefined) return false;
        if (op === '=') {
          return (
            String(v).toLowerCase() === String(target).toLowerCase() &&
            (typeof v === typeof target || String(v) === String(target))
          );
        }
        if (op === '!=' || op === '<>') return String(v) !== String(target);
        if (op === 'LIKE' || op === 'ILIKE' || op === 'NOT LIKE' || op === 'NOT ILIKE') {
          const pattern = String(target)
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/%/g, '.*')
            .replace(/_/g, '.');
          const matched = new RegExp(`^${pattern}$`, 'i').test(String(v));
          return op.startsWith('NOT') ? !matched : matched;
        }
        const nV = Number(v);
        const nT = Number(target);
        if (Number.isNaN(nV) || Number.isNaN(nT)) return false;
        if (op === '>') return nV > nT;
        if (op === '>=') return nV >= nT;
        if (op === '<') return nV < nT;
        if (op === '<=') return nV <= nT;
        return false;
      });
    }

    groupFns.push((row) => partFns.every((fn) => fn(row)));
  }

  return {
    ok: true,
    eval: {
      referencedCols,
      predicate: (row) => groupFns.some((fn) => fn(row)),
    },
  };
}

function findMatchingIndex(
  db: MiniDatabaseState,
  tableName: string,
  referencedCols: string[]
): TableIndex | null {
  if (referencedCols.length === 0) return null;
  const colSet = new Set(referencedCols);
  // Leftmost prefix rule: an index can be used if its leading column (columns[0]) is filtered in WHERE
  return (
    db.indexes.find(
      (idx) => idx.tableName === tableName && idx.columns.length > 0 && colSet.has(idx.columns[0])
    ) ?? null
  );
}

function detectKeywordTypo(stmt: string): { typo: string; fix: string } | null {
  const firstWord = stmt.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  const typoMap: Record<string, string> = {
    SLECT: 'SELECT',
    SELCT: 'SELECT',
    SELEC: 'SELECT',
    INSRT: 'INSERT',
    INSER: 'INSERT',
    UPDAT: 'UPDATE',
    UDPATE: 'UPDATE',
    DELET: 'DELETE',
    DELTE: 'DELETE',
    CREAT: 'CREATE',
    CRATE: 'CREATE',
    DROOP: 'DROP',
    ALTR: 'ALTER',
    TRUNCAT: 'TRUNCATE',
  };
  if (typoMap[firstWord]) return { typo: firstWord, fix: typoMap[firstWord] };
  if (/\bFORM\b/i.test(stmt) && !/\bFROM\b/i.test(stmt)) {
    return { typo: 'FORM', fix: 'FROM' };
  }
  return null;
}

export function runMiniSql(
  rawSql: string,
  currentDb: MiniDatabaseState,
  mode: 'syntax-only' | 'execute'
): SqlRunResponse {
  const workingDb = cloneDb(currentDb);
  const issues: SyntaxIssue[] = [];
  const results: StatementExecutionResult[] = [];
  const completedOps = new Set<SqlRunResponse['completedOps'][number]>();

  const { statements, lexicalError } = splitStatements(rawSql);
  if (lexicalError) {
    issues.push({
      statementIndex: 1,
      statementPreview: rawSql.trim().slice(0, 80),
      severity: 'error',
      code: 'LEXICAL_ERROR',
      message: lexicalError.message,
      suggestion: lexicalError.suggestion,
    });
    return { syntaxValid: false, issues, results, nextDb: currentDb, completedOps: [] };
  }

  if (statements.length === 0) {
    issues.push({
      statementIndex: 1,
      statementPreview: '',
      severity: 'error',
      code: 'EMPTY_INPUT',
      message: 'No SQL statements found to check or execute.',
      suggestion: 'Write a SQL statement (e.g. SELECT * FROM orders;) or click a lesson template above.',
    });
    return { syntaxValid: false, issues, results, nextDb: currentDb, completedOps: [] };
  }

  statements.forEach((stmt, idx) => {
    const stmtNum = idx + 1;
    const preview = stmt.replace(/\s+/g, ' ').slice(0, 76);

    const typo = detectKeywordTypo(stmt);
    if (typo) {
      issues.push({
        statementIndex: stmtNum,
        statementPreview: preview,
        severity: 'error',
        code: 'KEYWORD_TYPO',
        message: `Unrecognized SQL keyword "${typo.typo}".`,
        suggestion: `Did you mean "${typo.fix}"?`,
      });
      return;
    }

    // 1. CREATE TABLE
    if (/^CREATE\s+TABLE\b/i.test(stmt)) {
      const m = stmt.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([\s\S]+)\)$/i);
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_CREATE_TABLE',
          message: 'Invalid CREATE TABLE syntax.',
          suggestion: 'Use: CREATE TABLE table_name (id INT PRIMARY KEY, name VARCHAR(100) NOT NULL);',
        });
        return;
      }
      const tableName = m[1].toLowerCase();
      const body = m[2].trim();
      const ifNotExists = /IF\s+NOT\s+EXISTS/i.test(stmt);

      if (workingDb.tables[tableName] && !ifNotExists) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'TABLE_EXISTS',
          message: `Table "${tableName}" already exists.`,
          suggestion: `Use CREATE TABLE IF NOT EXISTS ${tableName} (...) or DROP TABLE ${tableName}; first.`,
        });
        return;
      }

      const colDefs = splitCommaRespectingQuotesAndParens(body);
      if (colDefs.some((d) => d === '')) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'TRAILING_COMMA',
          message: 'Trailing comma detected inside CREATE TABLE column list.',
          suggestion: 'Remove the extra comma before the closing parenthesis ")".',
        });
        return;
      }

      const columns: TableColumn[] = [];
      let colErr = false;
      for (const def of colDefs) {
        const cm = def.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+([a-zA-Z0-9_(),\s]+?)(?:\s+(PRIMARY\s+KEY|NOT\s+NULL))*$/i);
        if (!cm) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'INVALID_COLUMN_DEF',
            message: `Cannot parse column definition "${def}".`,
            suggestion: 'Format each column as: column_name TYPE [PRIMARY KEY] [NOT NULL].',
          });
          colErr = true;
          break;
        }
        const tokens = def.trim().split(/\s+/);
        const colName = tokens[0].toLowerCase();
        const rawType = tokens[1] ?? '';
        const colType = normalizeColumnType(rawType);
        if (!colType) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'UNKNOWN_TYPE',
            message: `Unsupported data type "${rawType}" on column "${colName}".`,
            suggestion: 'Supported types: INT, VARCHAR(n), TEXT, DECIMAL(p,s), BOOLEAN, DATE.',
          });
          colErr = true;
          break;
        }
        const upperDef = def.toUpperCase();
        columns.push({
          name: colName,
          type: colType,
          primaryKey: /PRIMARY\s+KEY/.test(upperDef),
          notNull: /NOT\s+NULL/.test(upperDef) || /PRIMARY\s+KEY/.test(upperDef),
        });
      }
      if (colErr) return;

      if (!workingDb.tables[tableName]) {
        workingDb.tables[tableName] = { name: tableName, columns, rows: [] };
        const pk = columns.find((c) => c.primaryKey);
        if (pk) {
          workingDb.indexes.push({
            name: `pk_${tableName}_${pk.name}`,
            tableName,
            columns: [pk.name],
            unique: true,
          });
        }
      }
      completedOps.add('CREATE_TABLE');
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'CREATE TABLE',
        success: true,
        message: `Table "${tableName}" created with ${columns.length} columns.`,
        plan: {
          scanType: 'DDL / Catalog',
          detail: `Catalog updated: ${tableName} (${columns.map((c) => `${c.name}:${c.type}`).join(', ')})`,
        },
      });
      return;
    }

    // 2. CREATE [UNIQUE] INDEX
    if (/^CREATE\s+(?:UNIQUE\s+)?INDEX\b/i.test(stmt)) {
      const m = stmt.match(
        /^CREATE\s+(UNIQUE\s+)?INDEX\s+(?:CONCURRENTLY\s+)?(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s+ON\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]+)\)$/i
      );
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_CREATE_INDEX',
          message: 'Invalid CREATE INDEX syntax.',
          suggestion: 'Use: CREATE [UNIQUE] INDEX idx_name ON table_name (col1, col2);',
        });
        return;
      }
      const unique = Boolean(m[1]);
      const idxName = m[2].toLowerCase();
      const tableName = m[3].toLowerCase();
      const idxCols = m[4].split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);

      const tbl = workingDb.tables[tableName];
      if (!tbl) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Cannot create index "${idxName}": table "${tableName}" does not exist.`,
          suggestion: `Existing tables: ${Object.keys(workingDb.tables).join(', ')}.`,
        });
        return;
      }

      const validColSet = new Set(tbl.columns.map((c) => c.name));
      const badCol = idxCols.find((c) => !validColSet.has(c));
      if (badCol) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_COLUMN',
          message: `Column "${badCol}" does not exist on table "${tableName}".`,
          suggestion: `Available columns: ${tbl.columns.map((c) => c.name).join(', ')}.`,
        });
        return;
      }

      if (workingDb.indexes.some((i) => i.name === idxName) && !/IF\s+NOT\s+EXISTS/i.test(stmt)) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'INDEX_EXISTS',
          message: `Index "${idxName}" already exists.`,
          suggestion: `Use CREATE INDEX IF NOT EXISTS ${idxName} ... or DROP INDEX ${idxName};`,
        });
        return;
      }

      if (unique) {
        const seen = new Set<string>();
        for (const r of tbl.rows) {
          const key = idxCols.map((c) => String(r[c] ?? 'NULL')).join('|');
          if (seen.has(key)) {
            issues.push({
              statementIndex: stmtNum,
              statementPreview: preview,
              severity: 'error',
              code: 'UNIQUE_VIOLATION',
              message: `Cannot build UNIQUE INDEX "${idxName}": duplicate value (${key}) already exists in "${tableName}".`,
              suggestion: 'Deduplicate existing rows first or create a non-unique B-Tree index.',
            });
            return;
          }
          seen.add(key);
        }
      }

      if (!workingDb.indexes.some((i) => i.name === idxName)) {
        workingDb.indexes.push({ name: idxName, tableName, columns: idxCols, unique });
      }
      completedOps.add('CREATE_INDEX');
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: unique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX',
        success: true,
        message: `B-Tree ${unique ? 'UNIQUE ' : ''}index "${idxName}" built on ${tableName}(${idxCols.join(', ')}).`,
        plan: {
          scanType: 'DDL / Catalog',
          indexUsed: idxName,
          detail: `Leading column "${idxCols[0]}" now accelerates WHERE filters via O(log N) Index Scan.`,
        },
      });
      return;
    }

    // 3. DROP INDEX
    if (/^DROP\s+INDEX\b/i.test(stmt)) {
      const m = stmt.match(/^DROP\s+INDEX\s+(?:IF\s+EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)$/i);
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_DROP_INDEX',
          message: 'Invalid DROP INDEX syntax.',
          suggestion: 'Use: DROP INDEX [IF EXISTS] index_name;',
        });
        return;
      }
      const idxName = m[1].toLowerCase();
      const exists = workingDb.indexes.some((i) => i.name === idxName);
      if (!exists && !/IF\s+EXISTS/i.test(stmt)) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_INDEX',
          message: `Index "${idxName}" does not exist.`,
          suggestion: `Active indexes: ${workingDb.indexes.map((i) => i.name).join(', ') || 'none'}.`,
        });
        return;
      }
      workingDb.indexes = workingDb.indexes.filter((i) => i.name !== idxName);
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'DROP INDEX',
        success: true,
        message: `Index "${idxName}" dropped.`,
      });
      return;
    }

    // 4. DROP TABLE / TRUNCATE TABLE
    if (/^DROP\s+TABLE\b/i.test(stmt)) {
      const m = stmt.match(/^DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-zA-Z_][a-zA-Z0-9_]*)$/i);
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_DROP_TABLE',
          message: 'Invalid DROP TABLE syntax.',
          suggestion: 'Use: DROP TABLE [IF EXISTS] table_name;',
        });
        return;
      }
      const tableName = m[1].toLowerCase();
      if (!workingDb.tables[tableName] && !/IF\s+EXISTS/i.test(stmt)) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Table "${tableName}" does not exist.`,
          suggestion: 'Add IF EXISTS or verify the table name in the Schema Explorer.',
        });
        return;
      }
      delete workingDb.tables[tableName];
      workingDb.indexes = workingDb.indexes.filter((i) => i.tableName !== tableName);
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'DROP TABLE',
        success: true,
        message: `Table "${tableName}" and its associated indexes were dropped.`,
      });
      return;
    }

    if (/^TRUNCATE\s+(?:TABLE\s+)?/i.test(stmt)) {
      const m = stmt.match(/^TRUNCATE\s+(?:TABLE\s+)?([a-zA-Z_][a-zA-Z0-9_]*)$/i);
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_TRUNCATE',
          message: 'Invalid TRUNCATE syntax.',
          suggestion: 'Use: TRUNCATE TABLE table_name;',
        });
        return;
      }
      const tableName = m[1].toLowerCase();
      const tbl = workingDb.tables[tableName];
      if (!tbl) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Table "${tableName}" does not exist.`,
          suggestion: `Available tables: ${Object.keys(workingDb.tables).join(', ')}.`,
        });
        return;
      }
      const cleared = tbl.rows.length;
      tbl.rows = [];
      completedOps.add('DELETE');
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'TRUNCATE TABLE',
        success: true,
        message: `Truncated "${tableName}" (${cleared} rows removed, schema & indexes preserved).`,
      });
      return;
    }

    // 5. INSERT INTO
    if (/^INSERT\b/i.test(stmt)) {
      const m = stmt.match(
        /^INSERT\s+INTO\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+)$/i
      );
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_INSERT',
          message: 'Invalid INSERT syntax — expected INSERT INTO table (cols) VALUES (...).',
          suggestion: "Example: INSERT INTO users (id, name, email, city, plan) VALUES (5, 'Neha', 'neha@acme.io', 'Pune', 'PRO');",
        });
        return;
      }
      const tableName = m[1].toLowerCase();
      const tbl = workingDb.tables[tableName];
      if (!tbl) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Table "${tableName}" does not exist.`,
          suggestion: `Create it first or insert into: ${Object.keys(workingDb.tables).join(', ')}.`,
        });
        return;
      }

      const targetCols = m[2]
        ? m[2].split(',').map((c) => c.trim().toLowerCase())
        : tbl.columns.map((c) => c.name);
      const validColSet = new Set(tbl.columns.map((c) => c.name));
      const badCol = targetCols.find((c) => !validColSet.has(c));
      if (badCol) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_COLUMN',
          message: `Unknown column "${badCol}" on table "${tableName}".`,
          suggestion: `Valid columns for ${tableName}: ${tbl.columns.map((c) => c.name).join(', ')}.`,
        });
        return;
      }

      // Extract value tuples: (...), (...)
      const tupleMatches = Array.from(m[3].trim().matchAll(/\(([^)]+)\)/g));
      if (tupleMatches.length === 0) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_INSERT_VALUES',
          message: 'Could not find value tuples inside VALUES (...).',
          suggestion: 'Wrap each row inside parentheses, e.g. VALUES (1, \'Alice\').',
        });
        return;
      }

      let inserted = 0;
      for (const tm of tupleMatches) {
        const rawVals = splitCommaRespectingQuotesAndParens(tm[1]);
        if (rawVals.length !== targetCols.length) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'COLUMN_VALUE_MISMATCH',
            message: `INSERT specifies ${targetCols.length} columns but provided ${rawVals.length} values.`,
            suggestion: `Match every column (${targetCols.join(', ')}) with exactly one value.`,
          });
          return;
        }
        const rowObj: TableRow = {};
        tbl.columns.forEach((c) => {
          rowObj[c.name] = null;
        });

        for (let i = 0; i < targetCols.length; i++) {
          const parsed = parseLiteral(rawVals[i]);
          if (!parsed.ok) {
            issues.push({
              statementIndex: stmtNum,
              statementPreview: preview,
              severity: 'error',
              code: 'INVALID_LITERAL',
              message: parsed.error ?? `Invalid literal "${rawVals[i]}".`,
              suggestion: "Wrap strings in single quotes (e.g. 'PAID').",
            });
            return;
          }
          rowObj[targetCols[i]] = parsed.value;
        }

        // Validate NOT NULL & PRIMARY KEY & UNIQUE indexes
        for (const col of tbl.columns) {
          if (col.notNull && (rowObj[col.name] === null || rowObj[col.name] === undefined)) {
            issues.push({
              statementIndex: stmtNum,
              statementPreview: preview,
              severity: 'error',
              code: 'NOT_NULL_VIOLATION',
              message: `Column "${col.name}" violates NOT NULL constraint on "${tableName}".`,
              suggestion: `Supply a non-null value for "${col.name}".`,
            });
            return;
          }
        }

        const uniqueIndexes = workingDb.indexes.filter((i) => i.tableName === tableName && i.unique);
        for (const uIdx of uniqueIndexes) {
          const newKey = uIdx.columns.map((c) => String(rowObj[c] ?? 'NULL')).join('|');
          const dup = tbl.rows.some(
            (existing) => uIdx.columns.map((c) => String(existing[c] ?? 'NULL')).join('|') === newKey
          );
          if (dup) {
            issues.push({
              statementIndex: stmtNum,
              statementPreview: preview,
              severity: 'error',
              code: 'UNIQUE_CONSTRAINT',
              message: `Duplicate key value (${newKey}) violates unique constraint "${uIdx.name}".`,
              suggestion: `Use a distinct value for ${uIdx.columns.join(', ')} or run UPDATE instead.`,
            });
            return;
          }
        }

        tbl.rows.push(rowObj);
        inserted++;
      }

      completedOps.add('INSERT');
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'INSERT',
        success: true,
        message: `Inserted ${inserted} row${inserted === 1 ? '' : 's'} into "${tableName}".`,
        plan: {
          scanType: 'DML Write',
          rowsAffected: inserted,
          detail: `Appended ${inserted} tuple(s) to heap and updated ${
            workingDb.indexes.filter((i) => i.tableName === tableName).length
          } index(es).`,
        },
      });
      return;
    }

    // 6. UPDATE
    if (/^UPDATE\b/i.test(stmt)) {
      const m = stmt.match(
        /^UPDATE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i
      );
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_UPDATE',
          message: 'Invalid UPDATE syntax — expected UPDATE table SET col = value WHERE condition.',
          suggestion: "Example: UPDATE orders SET status = 'PAID' WHERE order_id = 103;",
        });
        return;
      }
      const tableName = m[1].toLowerCase();
      const tbl = workingDb.tables[tableName];
      if (!tbl) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Table "${tableName}" does not exist.`,
          suggestion: `Available tables: ${Object.keys(workingDb.tables).join(', ')}.`,
        });
        return;
      }

      const validColSet = new Set(tbl.columns.map((c) => c.name));
      const setAssignments = splitCommaRespectingQuotesAndParens(m[2]);
      const parsedSets: { col: string; val: SqlValue }[] = [];

      for (const assign of setAssignments) {
        const am = assign.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
        if (!am) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'SYNTAX_SET',
            message: `Invalid SET assignment "${assign}".`,
            suggestion: "Use column = value pairs separated by commas, e.g. SET status = 'PAID', amount = 99.",
          });
          return;
        }
        const col = am[1].toLowerCase();
        if (!validColSet.has(col)) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'UNKNOWN_COLUMN',
            message: `Unknown column "${col}" in UPDATE SET clause.`,
            suggestion: `Available columns: ${tbl.columns.map((c) => c.name).join(', ')}.`,
          });
          return;
        }
        const lit = parseLiteral(am[2]);
        if (!lit.ok) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'INVALID_LITERAL',
            message: lit.error ?? `Invalid value "${am[2]}".`,
            suggestion: "Quote string literals with single quotes (e.g. 'SHIPPED').",
          });
          return;
        }
        parsedSets.push({ col, val: lit.value });
      }

      let warning: string | undefined;
      let whereEval: WhereClauseEval = { referencedCols: [], predicate: () => true };

      if (m[3]) {
        const parsedWhere = parseWhereClause(m[3], validColSet);
        if (parsedWhere.ok === false) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'SYNTAX_WHERE',
            message: parsedWhere.error,
            suggestion: parsedWhere.suggestion,
          });
          return;
        }
        whereEval = parsedWhere.eval;
      } else {
        warning = `Safety Warning: UPDATE "${tableName}" has no WHERE clause — every row in the table is modified!`;
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'warning',
          code: 'MISSING_WHERE',
          message: warning,
          suggestion: 'Add a WHERE primary_key = ... filter to avoid accidentally overwriting all rows.',
        });
      }

      const matchedIdx = findMatchingIndex(workingDb, tableName, whereEval.referencedCols);
      let updated = 0;
      tbl.rows = tbl.rows.map((row) => {
        if (!whereEval.predicate(row)) return row;
        updated++;
        const next = { ...row };
        parsedSets.forEach(({ col, val }) => {
          next[col] = val;
        });
        return next;
      });

      completedOps.add('UPDATE');
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'UPDATE',
        success: true,
        warning,
        message: `Updated ${updated} row${updated === 1 ? '' : 's'} in "${tableName}".`,
        plan: {
          scanType: matchedIdx ? 'Index Scan' : 'Seq Scan',
          indexUsed: matchedIdx?.name,
          rowsScanned: matchedIdx ? Math.max(1, updated) : tbl.rows.length,
          rowsAffected: updated,
          detail: matchedIdx
            ? `Index Scan via ${matchedIdx.name} located target rows directly before writing new MVCC row versions.`
            : `Seq Scan inspected all ${tbl.rows.length} rows (create an index on ${whereEval.referencedCols[0] ?? 'filtered column'} to speed up updates).`,
        },
      });
      return;
    }

    // 7. DELETE FROM
    if (/^DELETE\b/i.test(stmt)) {
      const m = stmt.match(/^DELETE\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+WHERE\s+([\s\S]+))?$/i);
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_DELETE',
          message: 'Invalid DELETE syntax — expected DELETE FROM table_name WHERE condition.',
          suggestion: "Example: DELETE FROM orders WHERE status = 'CANCELLED';",
        });
        return;
      }
      const tableName = m[1].toLowerCase();
      const tbl = workingDb.tables[tableName];
      if (!tbl) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Table "${tableName}" does not exist.`,
          suggestion: `Available tables: ${Object.keys(workingDb.tables).join(', ')}.`,
        });
        return;
      }

      const validColSet = new Set(tbl.columns.map((c) => c.name));
      let warning: string | undefined;
      let whereEval: WhereClauseEval = { referencedCols: [], predicate: () => true };

      if (m[2]) {
        const parsedWhere = parseWhereClause(m[2], validColSet);
        if (parsedWhere.ok === false) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'SYNTAX_WHERE',
            message: parsedWhere.error,
            suggestion: parsedWhere.suggestion,
          });
          return;
        }
        whereEval = parsedWhere.eval;
      } else {
        warning = `Safety Warning: DELETE FROM "${tableName}" has no WHERE clause — every row will be deleted!`;
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'warning',
          code: 'MISSING_WHERE',
          message: warning,
          suggestion: 'Always include a WHERE predicate unless intentionally wiping the table.',
        });
      }

      const matchedIdx = findMatchingIndex(workingDb, tableName, whereEval.referencedCols);
      const beforeCount = tbl.rows.length;
      tbl.rows = tbl.rows.filter((r) => !whereEval.predicate(r));
      const deleted = beforeCount - tbl.rows.length;

      completedOps.add('DELETE');
      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: 'DELETE',
        success: true,
        warning,
        message: `Deleted ${deleted} row${deleted === 1 ? '' : 's'} from "${tableName}".`,
        plan: {
          scanType: matchedIdx ? 'Index Scan' : 'Seq Scan',
          indexUsed: matchedIdx?.name,
          rowsScanned: matchedIdx ? Math.max(1, deleted) : beforeCount,
          rowsAffected: deleted,
          detail: matchedIdx
            ? `Index Scan using ${matchedIdx.name} located ${deleted} row(s) without scanning the entire table.`
            : `Full Seq Scan checked all ${beforeCount} rows.`,
        },
      });
      return;
    }

    // 8. SELECT (Supports DISTINCT, INNER/LEFT/RIGHT/FULL/CROSS JOIN, WHERE, GROUP BY, HAVING, Scalar Functions, ORDER BY, LIMIT, OFFSET)
    if (/^SELECT\b/i.test(stmt)) {
      const m = stmt.match(
        /^SELECT\s+(DISTINCT\s+)?([\s\S]+?)\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?(?!INNER\b|LEFT\b|RIGHT\b|FULL\b|CROSS\b|JOIN\b|WHERE\b|GROUP\b|ORDER\b|LIMIT\b|OFFSET\b)[a-zA-Z_][a-zA-Z0-9_]*)?(?:\s+(INNER|LEFT(?:\s+OUTER)?|RIGHT(?:\s+OUTER)?|FULL(?:\s+OUTER)?|CROSS)?\s*JOIN\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(?:AS\s+)?(?!ON\b|WHERE\b|GROUP\b|ORDER\b|LIMIT\b|OFFSET\b)[a-zA-Z_][a-zA-Z0-9_]*)?(?:\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+))?)?(?:\s+WHERE\s+([\s\S]+?))?(?:\s+GROUP\s+BY\s+([a-zA-Z_][a-zA-Z0-9_.]*))?(?:\s+HAVING\s+([\s\S]+?))?(?:\s+ORDER\s+BY\s+([a-zA-Z_][a-zA-Z0-9_.]*)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?(?:\s+OFFSET\s+(\d+))?$/i
      );
      if (!m) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'SYNTAX_SELECT',
          message:
            'Invalid SELECT syntax — check clause order: SELECT [DISTINCT] ... FROM ... [JOIN ...] [WHERE ...] [GROUP BY ...] [HAVING ...] [ORDER BY ...] [LIMIT n] [OFFSET m].',
          suggestion:
            "Example: SELECT status, COUNT(*) AS cnt, SUM(amount) AS rev FROM orders WHERE amount BETWEEN 50 AND 900 GROUP BY status HAVING rev > 100 ORDER BY rev DESC LIMIT 5;",
        });
        return;
      }

      const isDistinct = Boolean(m[1]);
      const selectRaw = m[2].trim();
      const tableName = m[3].toLowerCase();
      const joinKindRaw = (m[4] ?? 'INNER').replace(/\s+/g, ' ').toUpperCase();
      const joinTableName = m[5]?.toLowerCase();
      const joinLeft = m[6]?.toLowerCase();
      const joinRight = m[7]?.toLowerCase();
      const whereRaw = m[8]?.trim();
      const groupByCol = m[9]?.toLowerCase().split('.').pop();
      const havingRaw = m[10]?.trim();
      const orderByCol = m[11]?.toLowerCase().split('.').pop();
      const orderDir = (m[12]?.toUpperCase() as 'ASC' | 'DESC' | undefined) ?? 'ASC';
      const limitNum = m[13] ? Number(m[13]) : undefined;
      const offsetNum = m[14] ? Number(m[14]) : 0;

      const baseTbl = workingDb.tables[tableName];
      if (!baseTbl) {
        issues.push({
          statementIndex: stmtNum,
          statementPreview: preview,
          severity: 'error',
          code: 'UNKNOWN_TABLE',
          message: `Table "${tableName}" does not exist.`,
          suggestion: `Available tables: ${Object.keys(workingDb.tables).join(', ')}.`,
        });
        return;
      }

      let combinedRows: TableRow[] = baseTbl.rows.map((r) => ({ ...r }));
      const validColSet = new Set(baseTbl.columns.map((c) => c.name));

      if (joinTableName) {
        const joinTbl = workingDb.tables[joinTableName];
        if (!joinTbl) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'UNKNOWN_JOIN_TABLE',
            message: `JOIN table "${joinTableName}" does not exist.`,
            suggestion: `Available tables: ${Object.keys(workingDb.tables).join(', ')}.`,
          });
          return;
        }
        joinTbl.columns.forEach((c) => validColSet.add(c.name));
        const joined: TableRow[] = [];

        if (joinKindRaw === 'CROSS') {
          for (const lr of baseTbl.rows) {
            for (const rr of joinTbl.rows) {
              joined.push({ ...rr, ...lr });
            }
          }
        } else {
          if (!joinLeft || !joinRight) {
            issues.push({
              statementIndex: stmtNum,
              statementPreview: preview,
              severity: 'error',
              code: 'MISSING_JOIN_ON',
              message: `${joinKindRaw} JOIN requires an ON condition (e.g. ON orders.user_id = users.id).`,
              suggestion: 'Add ON left_table.col = right_table.col or use CROSS JOIN.',
            });
            return;
          }
          const leftCol = joinLeft.split('.').pop()!;
          const rightCol = joinRight.split('.').pop()!;
          const isLeft = joinKindRaw.startsWith('LEFT');
          const isRight = joinKindRaw.startsWith('RIGHT');
          const isFull = joinKindRaw.startsWith('FULL');

          const matchedRightIndices = new Set<number>();

          for (const lr of baseTbl.rows) {
            let hadMatch = false;
            joinTbl.rows.forEach((rr, rIdx) => {
              const isMatch =
                (lr[leftCol] !== undefined && lr[leftCol] === rr[rightCol]) ||
                (lr[rightCol] !== undefined && lr[rightCol] === rr[leftCol]);
              if (isMatch) {
                hadMatch = true;
                matchedRightIndices.add(rIdx);
                joined.push({ ...rr, ...lr });
              }
            });
            if (!hadMatch && (isLeft || isFull)) {
              const nullFill: TableRow = {};
              joinTbl.columns.forEach((c) => {
                nullFill[c.name] = null;
              });
              joined.push({ ...nullFill, ...lr });
            }
          }

          if (isRight || isFull) {
            joinTbl.rows.forEach((rr, rIdx) => {
              if (!matchedRightIndices.has(rIdx)) {
                const nullLeft: TableRow = {};
                baseTbl.columns.forEach((c) => {
                  nullLeft[c.name] = null;
                });
                joined.push({ ...nullLeft, ...rr });
              }
            });
          }
        }
        combinedRows = joined;
      }

      let whereEval: WhereClauseEval = { referencedCols: [], predicate: () => true };
      if (whereRaw) {
        const parsedWhere = parseWhereClause(whereRaw, validColSet);
        if (parsedWhere.ok === false) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'SYNTAX_WHERE',
            message: parsedWhere.error,
            suggestion: parsedWhere.suggestion,
          });
          return;
        }
        whereEval = parsedWhere.eval;
      }

      const totalBeforeFilter = combinedRows.length;
      const filteredRows = combinedRows.filter(whereEval.predicate);
      const matchedIdx = findMatchingIndex(workingDb, tableName, whereEval.referencedCols);

      const evalScalarExpr = (expr: string, row: TableRow): { ok: true; val: SqlValue } | { ok: false; col: string } => {
        const trimmed = expr.trim();
        // UPPER(col) / LOWER(col) / LENGTH(col) / ABS(col)
        const unaryFn = trimmed.match(/^(UPPER|LOWER|LENGTH|ABS)\s*\(\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*\)$/i);
        if (unaryFn) {
          const fn = unaryFn[1].toUpperCase();
          const col = unaryFn[2].toLowerCase().split('.').pop()!;
          if (!validColSet.has(col)) return { ok: false, col };
          const v = row[col];
          if (v === null || v === undefined) return { ok: true, val: null };
          if (fn === 'UPPER') return { ok: true, val: String(v).toUpperCase() };
          if (fn === 'LOWER') return { ok: true, val: String(v).toLowerCase() };
          if (fn === 'LENGTH') return { ok: true, val: String(v).length };
          if (fn === 'ABS') return { ok: true, val: Math.abs(Number(v)) };
        }

        // COALESCE(col, fallback)
        const coalFn = trimmed.match(/^COALESCE\s*\((.+)\)$/i);
        if (coalFn) {
          const args = splitCommaRespectingQuotesAndParens(coalFn[1]);
          for (const a of args) {
            const lit = parseLiteral(a);
            if (lit.ok && !validColSet.has(a.toLowerCase().split('.').pop()!)) {
              if (lit.value !== null) return { ok: true, val: lit.value };
            } else {
              const col = a.toLowerCase().split('.').pop()!;
              if (!validColSet.has(col)) return { ok: false, col };
              if (row[col] !== null && row[col] !== undefined) return { ok: true, val: row[col] };
            }
          }
          return { ok: true, val: null };
        }

        // ROUND(col, digits)
        const roundFn = trimmed.match(/^ROUND\s*\(\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*(?:,\s*(\d+))?\s*\)$/i);
        if (roundFn) {
          const col = roundFn[1].toLowerCase().split('.').pop()!;
          if (!validColSet.has(col)) return { ok: false, col };
          const digits = roundFn[2] ? Number(roundFn[2]) : 0;
          const n = Number(row[col]);
          return { ok: true, val: Number.isNaN(n) ? null : Number(n.toFixed(digits)) };
        }

        // Simple CASE WHEN col op val THEN res [ELSE fallback] END
        const caseMatch = trimmed.match(
          /^CASE\s+WHEN\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*(=|!=|>|>=|<|<=)\s*([^\s]+)\s+THEN\s+(.+?)(?:\s+ELSE\s+(.+?))?\s+END$/i
        );
        if (caseMatch) {
          const col = caseMatch[1].toLowerCase().split('.').pop()!;
          if (!validColSet.has(col)) return { ok: false, col };
          const op = caseMatch[2];
          const cmpLit = parseLiteral(caseMatch[3]);
          const thenLit = parseLiteral(caseMatch[4]);
          const elseLit = caseMatch[5] ? parseLiteral(caseMatch[5]) : { ok: true, value: null };
          const v = row[col];
          let cond = false;
          if (v !== null && v !== undefined && cmpLit.ok) {
            if (op === '=') cond = String(v).toLowerCase() === String(cmpLit.value).toLowerCase();
            else if (op === '!=') cond = String(v) !== String(cmpLit.value);
            else if (op === '>') cond = Number(v) > Number(cmpLit.value);
            else if (op === '>=') cond = Number(v) >= Number(cmpLit.value);
            else if (op === '<') cond = Number(v) < Number(cmpLit.value);
            else if (op === '<=') cond = Number(v) <= Number(cmpLit.value);
          }
          return { ok: true, val: cond ? thenLit.value : elseLit.value };
        }

        const plainCol = trimmed.toLowerCase().split('.').pop()!;
        if (!validColSet.has(plainCol)) return { ok: false, col: plainCol };
        return { ok: true, val: row[plainCol] ?? null };
      };

      const selectItems = splitCommaRespectingQuotesAndParens(selectRaw);
      const hasAggregate = selectItems.some((item) => /^(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(item));

      let outputCols: string[] = [];
      let outputRows: TableRow[] = [];

      if (hasAggregate || groupByCol) {
        if (groupByCol && !validColSet.has(groupByCol)) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'UNKNOWN_GROUP_COL',
            message: `Unknown GROUP BY column "${groupByCol}".`,
            suggestion: `Available columns: ${Array.from(validColSet).join(', ')}.`,
          });
          return;
        }

        const groups = new Map<string, TableRow[]>();
        if (groupByCol) {
          filteredRows.forEach((r) => {
            const key = String(r[groupByCol] ?? 'NULL');
            const arr = groups.get(key) ?? [];
            arr.push(r);
            groups.set(key, arr);
          });
        } else {
          groups.set('__ALL__', filteredRows);
        }

        outputCols = selectItems.map((it) => {
          const aliasMatch = it.match(/\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i);
          return aliasMatch ? aliasMatch[1].toLowerCase() : it.trim().toLowerCase();
        });

        const computeAggregateValue = (
          fn: string,
          distinctAgg: boolean,
          targetColRaw: string,
          grpRows: TableRow[]
        ): SqlValue => {
          const targetCol = targetColRaw.toLowerCase().split('.').pop()!;
          if (fn === 'COUNT') {
            if (targetCol === '*') return grpRows.length;
            const nonNull = grpRows
              .map((r) => r[targetCol])
              .filter((v) => v !== null && v !== undefined);
            return distinctAgg ? new Set(nonNull.map(String)).size : nonNull.length;
          }
          const nums = grpRows
            .map((r) => Number(r[targetCol]))
            .filter((n) => !Number.isNaN(n));
          if (nums.length === 0) return null;
          if (fn === 'SUM') return Number(nums.reduce((a, b) => a + b, 0).toFixed(2));
          if (fn === 'AVG') return Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2));
          if (fn === 'MIN') return Math.min(...nums);
          if (fn === 'MAX') return Math.max(...nums);
          return null;
        };

        // Pre-parse any aggregate expressions used directly in HAVING (e.g., HAVING SUM(amount) > 100)
        const havingAggSpecs: { key: string; fn: string; distinctAgg: boolean; targetCol: string }[] = [];
        let normalizedHaving = havingRaw ?? '';
        if (normalizedHaving) {
          normalizedHaving = normalizedHaving.replace(
            /(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(DISTINCT\s+)?(\*|[a-zA-Z_][a-zA-Z0-9_.]*)\s*\)/gi,
            (_full, fnRaw: string, distRaw: string | undefined, colRaw: string) => {
              const key = `__hav_agg_${havingAggSpecs.length}`;
              havingAggSpecs.push({
                key,
                fn: fnRaw.toUpperCase(),
                distinctAgg: Boolean(distRaw),
                targetCol: colRaw,
              });
              return key;
            }
          );
        }

        const groupedPairs: { out: TableRow; evalRow: TableRow }[] = [];

        for (const [, grpRows] of groups) {
          const out: TableRow = {};
          selectItems.forEach((it, i) => {
            const colKey = outputCols[i];
            const cleanExpr = it.replace(/\s+AS\s+[a-zA-Z_][a-zA-Z0-9_]*$/i, '').trim();
            const aggMatch = cleanExpr.match(
              /^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(DISTINCT\s+)?(\*|[a-zA-Z_][a-zA-Z0-9_.]*)\s*\)$/i
            );
            if (aggMatch) {
              out[colKey] = computeAggregateValue(
                aggMatch[1].toUpperCase(),
                Boolean(aggMatch[2]),
                aggMatch[3],
                grpRows
              );
            } else {
              const plainCol = cleanExpr.toLowerCase().split('.').pop()!;
              out[colKey] = grpRows[0]?.[plainCol] ?? null;
            }
          });

          const evalRow: TableRow = { ...out };
          havingAggSpecs.forEach((spec) => {
            evalRow[spec.key] = computeAggregateValue(spec.fn, spec.distinctAgg, spec.targetCol, grpRows);
          });
          groupedPairs.push({ out, evalRow });
        }

        if (havingRaw) {
          const havingCols = new Set([...outputCols, ...havingAggSpecs.map((s) => s.key)]);
          const parsedHaving = parseWhereClause(normalizedHaving, havingCols);
          if (parsedHaving.ok === false) {
            issues.push({
              statementIndex: stmtNum,
              statementPreview: preview,
              severity: 'error',
              code: 'SYNTAX_HAVING',
              message: parsedHaving.error.replace('WHERE', 'HAVING'),
              suggestion: `Use aggregate functions or grouped aliases in HAVING, e.g. HAVING SUM(amount) > 100 or HAVING ${outputCols[outputCols.length - 1]} > 100.`,
            });
            return;
          }
          outputRows = groupedPairs
            .filter((pair) => parsedHaving.eval.predicate(pair.evalRow))
            .map((pair) => pair.out);
        } else {
          outputRows = groupedPairs.map((pair) => pair.out);
        }
      } else {
        if (selectRaw === '*') {
          outputCols = Array.from(validColSet);
          outputRows = filteredRows.map((r) => {
            const projected: TableRow = {};
            outputCols.forEach((c) => {
              projected[c] = r[c] ?? null;
            });
            return projected;
          });
        } else {
          const parsedItems = selectItems.map((item) => {
            const aliasMatch = item.match(/\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i);
            const cleanExpr = item.replace(/\s+AS\s+[a-zA-Z_][a-zA-Z0-9_]*$/i, '').trim();
            const label = aliasMatch
              ? aliasMatch[1].toLowerCase()
              : cleanExpr.toLowerCase().split('.').pop()!;
            return { cleanExpr, label };
          });
          outputCols = parsedItems.map((p) => p.label);

          for (const r of filteredRows) {
            const projected: TableRow = {};
            for (const p of parsedItems) {
              const res = evalScalarExpr(p.cleanExpr, r);
              if (res.ok === false) {
                issues.push({
                  statementIndex: stmtNum,
                  statementPreview: preview,
                  severity: 'error',
                  code: 'UNKNOWN_SELECT_COL',
                  message: `Unknown column "${res.col}" in SELECT list.`,
                  suggestion: `Available columns: ${Array.from(validColSet).join(', ')}.`,
                });
                return;
              }
              projected[p.label] = res.val;
            }
            outputRows.push(projected);
          }
        }
      }

      if (isDistinct) {
        const seen = new Set<string>();
        outputRows = outputRows.filter((row) => {
          const sig = outputCols.map((c) => String(row[c] ?? 'NULL')).join('\u0001');
          if (seen.has(sig)) return false;
          seen.add(sig);
          return true;
        });
      }

      if (orderByCol) {
        if (!validColSet.has(orderByCol) && !outputCols.includes(orderByCol)) {
          issues.push({
            statementIndex: stmtNum,
            statementPreview: preview,
            severity: 'error',
            code: 'UNKNOWN_ORDER_COL',
            message: `Unknown ORDER BY column "${orderByCol}".`,
            suggestion: `Order by one of: ${outputCols.join(', ')}.`,
          });
          return;
        }
        outputRows.sort((a, b) => {
          const av = a[orderByCol];
          const bv = b[orderByCol];
          if (av === bv) return 0;
          if (av === null || av === undefined) return 1;
          if (bv === null || bv === undefined) return -1;
          const cmp =
            typeof av === 'number' && typeof bv === 'number'
              ? av - bv
              : String(av).localeCompare(String(bv));
          return orderDir === 'DESC' ? -cmp : cmp;
        });
      }

      if (offsetNum > 0 || limitNum !== undefined) {
        outputRows = outputRows.slice(
          offsetNum,
          limitNum !== undefined ? offsetNum + limitNum : undefined
        );
      }

      completedOps.add('SELECT');
      if (matchedIdx) completedOps.add('INDEX_SCAN');

      results.push({
        statementIndex: stmtNum,
        sql: stmt,
        kind: joinTableName ? `SELECT (${joinKindRaw} JOIN)` : 'SELECT',
        success: true,
        message: `Returned ${outputRows.length} row${outputRows.length === 1 ? '' : 's'}.`,
        columns: outputCols,
        rows: outputRows,
        plan: {
          scanType: matchedIdx ? 'Index Scan' : 'Seq Scan',
          indexUsed: matchedIdx?.name,
          rowsScanned: matchedIdx ? Math.max(1, filteredRows.length) : totalBeforeFilter,
          rowsAffected: outputRows.length,
          detail: matchedIdx
            ? `Index Scan using ${matchedIdx.name} on ${tableName}(${matchedIdx.columns.join(', ')}) — O(log N) lookup.`
            : whereRaw
              ? `Seq Scan on ${tableName} checked all ${totalBeforeFilter} rows. Add an index on (${whereEval.referencedCols[0]}) to switch to Index Scan!`
              : `Seq Scan read all ${totalBeforeFilter} rows (no WHERE predicate).`,
        },
      });
      return;
    }

    // Fallback unsupported statement
    issues.push({
      statementIndex: stmtNum,
      statementPreview: preview,
      severity: 'error',
      code: 'UNSUPPORTED_SQL',
      message: `Unrecognized SQL statement starting with "${stmt.split(/\s+/)[0]}".`,
      suggestion:
        'Supported commands: CREATE TABLE, INSERT INTO, SELECT (with DISTINCT/JOIN/WHERE/BETWEEN/IN/GROUP BY/HAVING/ORDER BY/LIMIT/OFFSET), UPDATE, DELETE FROM, CREATE [UNIQUE] INDEX, DROP INDEX, DROP TABLE, TRUNCATE TABLE.',
    });
  });

  const hasErrors = issues.some((i) => i.severity === 'error');
  return {
    syntaxValid: !hasErrors,
    issues,
    results: hasErrors ? [] : results,
    nextDb: mode === 'execute' && !hasErrors ? workingDb : currentDb,
    completedOps: mode === 'execute' && !hasErrors ? Array.from(completedOps) : [],
  };
}

/**
 * Principal-level SQL Intelligence Review, Fast-Fetch & Insert-Compression Analyzer.
 */
export function analyzeSqlIntelligence(
  rawSql: string,
  db?: MiniDatabaseState
): SqlIntelligenceReport {
  const sql = stripSqlComments(rawSql).trim();
  const findings: SqlIntelligenceFinding[] = [];
  let score = 100;
  let optimizedSql = sql;

  const hasSelectStar = /\bSELECT\s+(?:DISTINCT\s+)?\*/i.test(sql);
  if (hasSelectStar) {
    score -= 18;
    findings.push({
      id: 'select-star',
      severity: 'high',
      category: 'Fetch Speed',
      title: 'SELECT * prevents Index-Only Scans & inflates network + TOAST decompression I/O',
      explanation:
        'Fetching every column forces heap page lookups (random I/O), decompresses wide TEXT/JSONB TOAST columns unnecessarily, and saturates network buffers.',
      recommendation:
        'Project only the exact columns your caller needs so the planner can serve the query directly from a covering B-Tree index (`INCLUDE (...)`).',
      suggestedSql: sql.replace(/SELECT\s+\*/i, 'SELECT order_id, user_id, amount, status'),
      estimatedImpact: '2x–6x lower I/O & enables Index-Only Scan',
    });
    optimizedSql = optimizedSql.replace(/SELECT\s+\*/i, 'SELECT order_id, user_id, amount, status');
  }

  // Non-SARGable function wrapped around WHERE column
  const nonSargFn = sql.match(
    /\bWHERE\b[\s\S]*?\b(LOWER|UPPER|YEAR|MONTH|DATE|SUBSTRING|COALESCE|CAST)\s*\(\s*([a-zA-Z0-9_.]+)\s*\)/i
  );
  if (nonSargFn) {
    score -= 22;
    const fnName = nonSargFn[1].toUpperCase();
    const colName = nonSargFn[2];
    findings.push({
      id: 'non-sargable-fn',
      severity: 'critical',
      category: 'Indexing',
      title: `Non-SARGable predicate ${fnName}(${colName}) disables standard B-Tree index`,
      explanation:
        'Wrapping an indexed column in a function forces the database to compute that function on every single row in a Full Table Scan.',
      recommendation:
        fnName === 'YEAR' || fnName === 'DATE'
          ? `Rewrite using a half-open range predicate (${colName} >= '2026-01-01' AND ${colName} < '2027-01-01') so the B-Tree range scan stays active.`
          : `Create a functional/expression index: CREATE INDEX CONCURRENTLY idx_${colName.replace(/\./g, '_')}_${fnName.toLowerCase()} ON table (${fnName}(${colName}));`,
      suggestedSql:
        fnName === 'YEAR' || fnName === 'DATE'
          ? `WHERE ${colName} >= '2026-01-01' AND ${colName} < '2027-01-01'`
          : `CREATE INDEX CONCURRENTLY idx_expr_${colName.replace(/\./g, '_')} ON users (${fnName}(${colName}));`,
      estimatedImpact: '10x–200x faster (Full Seq Scan -> B-Tree Range Scan)',
    });
  }

  // Leading wildcard LIKE '%...'
  if (/\b(?:I?LIKE)\s+'%/i.test(sql)) {
    score -= 20;
    findings.push({
      id: 'leading-wildcard',
      severity: 'critical',
      category: 'Indexing',
      title: "Leading wildcard LIKE '%...' cannot traverse a standard B-Tree index",
      explanation:
        "B-Tree indexes sort strings left-to-right. A leading '%' forces a full scan over every row in the table.",
      recommendation:
        'Use a prefix match (`LIKE \'Cloud%\'`) for B-Tree, or create a PostgreSQL GIN Trigram index (`pg_trgm`) / Full-Text `tsvector` GIN index for substring search.',
      suggestedSql:
        'CREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX CONCURRENTLY idx_orders_product_trgm ON orders USING GIN (product gin_trgm_ops);',
      estimatedImpact: '15x–100x faster substring search on 1M+ rows',
    });
  }

  // Deep OFFSET pagination
  const offsetMatch = sql.match(/\bOFFSET\s+(\d+)/i);
  if (offsetMatch) {
    const offVal = Number(offsetMatch[1]);
    score -= offVal >= 100 ? 20 : 12;
    findings.push({
      id: 'offset-pagination',
      severity: offVal >= 100 ? 'critical' : 'high',
      category: 'Fetch Speed',
      title: `OFFSET ${offVal} wastes CPU/RAM scanning and discarding skipped rows`,
      explanation:
        'Even with an index, `OFFSET N` must read, sort, and throw away N rows before returning the next page—degrading linearly to O(N) on deep pages.',
      recommendation:
        'Switch to Keyset (Seek) Pagination using the last seen indexed cursor (`WHERE order_id > $last_id ORDER BY order_id ASC LIMIT 50`).',
      suggestedSql:
        'SELECT order_id, user_id, amount, status\nFROM orders\nWHERE order_id > :last_seen_order_id\nORDER BY order_id ASC\nLIMIT 50;',
      estimatedImpact: 'Constant O(log N) latency across page 1 to page 100,000',
    });
  }

  // NOT IN subquery NULL hazard
  if (/\bNOT\s+IN\s*\(\s*SELECT\b/i.test(sql)) {
    score -= 18;
    findings.push({
      id: 'not-in-null-trap',
      severity: 'critical',
      category: 'Correctness',
      title: 'NOT IN (SELECT ...) silently returns 0 rows if any subquery value is NULL',
      explanation:
        'Under SQL three-valued logic, `x != NULL` evaluates to UNKNOWN, causing the entire `NOT IN` anti-join to return an empty set.',
      recommendation:
        'Rewrite with `NOT EXISTS (...)` or a `LEFT JOIN ... WHERE right.id IS NULL` anti-join—both are NULL-safe and unlock Hash/Merge Anti-Join plans.',
      suggestedSql:
        'SELECT u.id, u.name\nFROM users u\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o WHERE o.user_id = u.id\n);',
      estimatedImpact: 'Eliminates silent NULL bugs + enables Hash Anti-Join',
    });
  }

  // UNION vs UNION ALL
  if (/\bUNION\b(?!\s+ALL\b)/i.test(sql)) {
    score -= 10;
    findings.push({
      id: 'union-sort',
      severity: 'optimization',
      category: 'Fetch Speed',
      title: 'UNION performs an implicit global sort/hash deduplication pass',
      explanation:
        'If branches are already disjoint (e.g. active + archived partitions), `UNION` wastes memory and CPU sorting millions of rows just to check for duplicates.',
      recommendation: 'Use `UNION ALL` unless cross-branch duplicate elimination is strictly required.',
      suggestedSql: sql.replace(/\bUNION\b(?!\s+ALL\b)/gi, 'UNION ALL'),
      estimatedImpact: '2x–5x faster streaming combine, zero temp sort spill',
    });
  }

  // OR across different columns
  if (/\bWHERE\b[\s\S]*\bOR\b/i.test(sql)) {
    score -= 10;
    findings.push({
      id: 'or-bitmap-union',
      severity: 'optimization',
      category: 'Indexing',
      title: 'OR predicate can force Seq Scan or expensive BitmapOr merges',
      explanation:
        'When OR filters span distinct columns, single B-Tree indexes lose selectivity and may fall back to a sequential scan.',
      recommendation:
        'Use `IN (...)` when testing the same column, or split into two indexed `UNION ALL` branches when filtering distinct indexed columns.',
      estimatedImpact: 'Restores sharp B-Tree index selectivity',
    });
  }

  // Single-row INSERT loops or unbatched writes -> Fast-Fetch to Insert Compression guidance
  const insertCount = (sql.match(/\bINSERT\s+INTO\b/gi) ?? []).length;
  if (insertCount >= 1) {
    if (insertCount >= 2) {
      score -= 18;
      findings.push({
        id: 'multi-insert-loop',
        severity: 'high',
        category: 'Insert & Compression',
        title: `${insertCount} separate INSERT statements multiply WAL fsync, parse & round-trip overhead`,
        explanation:
          'Sending individual INSERTs causes 1 network RTT + 1 WAL commit record + per-row B-Tree page locks per statement.',
        recommendation:
          'Batch 500–5,000 rows per multi-row `INSERT INTO ... VALUES (...), (...)` or stream via PostgreSQL `COPY FROM STDIN (FORMAT binary)` with ZSTD/LZ4 transport compression and deferred secondary index creation.',
        suggestedSql:
          "-- Fast Bulk Ingest + LZ4 Compression Pattern:\nALTER TABLE events_archive ALTER COLUMN payload SET COMPRESSION lz4;\nCOPY events_archive (id, tenant_id, payload) FROM STDIN WITH (FORMAT binary);",
        estimatedImpact: '10x–45x higher ingest rows/sec & 3x–6x smaller disk footprint',
      });
    } else {
      findings.push({
        id: 'single-insert-compression',
        severity: 'optimization',
        category: 'Insert & Compression',
        title: 'Insert-Compression & Fast-Ingest Tuning Tip',
        explanation:
          'For high-volume ETL or fetch-to-insert pipelines, row-by-row inserts incur heavy WAL and random B-Tree split amplification.',
        recommendation:
          'Use `INSERT INTO dest SELECT ...` with a Covering Index fetch, `SET COMPRESSION lz4` (PG 14+) on wide columns, or columnar ZSTD + Dictionary/Delta encoding for analytical sinks.',
        estimatedImpact: '60%–82% storage savings via LZ4/ZSTD + batching',
      });
    }
  }

  // Missing WHERE on UPDATE/DELETE
  if (/\b(UPDATE|DELETE\s+FROM)\b/i.test(sql) && !/\bWHERE\b/i.test(sql)) {
    score -= 30;
    findings.push({
      id: 'unbounded-dml',
      severity: 'critical',
      category: 'Correctness',
      title: 'Unbounded UPDATE/DELETE without WHERE will mutate or wipe the entire table',
      explanation:
        'An accidental table-wide write acquires locks on every row, explodes MVCC dead tuples & WAL volume, and can cause immediate data loss.',
      recommendation:
        'Add an indexed `WHERE` filter (or batch by primary key chunks of 5,000 rows) before running in production.',
      estimatedImpact: 'Prevents SEV-1 data loss & table-wide lock stalls',
    });
  }

  // Check missing index on live mini-DB tables if available
  const fromMatch = sql.match(/\bFROM\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
  const whereMatch = sql.match(/\bWHERE\s+([a-zA-Z_][a-zA-Z0-9_.]*)\s*(=|>=|<=|>|<|BETWEEN|IN)/i);
  if (fromMatch && whereMatch && db) {
    const tbl = fromMatch[1].toLowerCase();
    const col = whereMatch[1].toLowerCase().split('.').pop()!;
    const hasIdx = db.indexes.some((i) => i.tableName === tbl && i.columns[0] === col);
    if (!hasIdx && db.tables[tbl]) {
      score -= 14;
      const ddl = `CREATE INDEX CONCURRENTLY idx_${tbl}_${col} ON ${tbl} (${col});`;
      findings.push({
        id: 'missing-where-index',
        severity: 'high',
        category: 'Indexing',
        title: `No leading B-Tree index on ${tbl}(${col}) — planner falls back to Seq Scan`,
        explanation: `Filtering "${tbl}" by "${col}" scans every page because no active index starts with "${col}".`,
        recommendation: `Add a non-blocking B-Tree (or covering INCLUDE) index on ${tbl}(${col}).`,
        suggestedSql: ddl,
        estimatedImpact: 'O(N) Seq Scan -> O(log N) Index Scan',
      });
    }
  }

  if (findings.length === 0) {
    findings.push({
      id: 'well-tuned',
      severity: 'good',
      category: 'Fetch Speed',
      title: 'Query follows SARGable indexing & explicit column projection best practices',
      explanation:
        'No anti-patterns detected (`SELECT *`, leading wildcards, non-SARGable functions, deep `OFFSET`, or unsafe DML).',
      recommendation:
        'Verify actual buffer hits in production with `EXPLAIN (ANALYZE, BUFFERS)` and add `INCLUDE (...)` columns if heap fetches dominate.',
      estimatedImpact: 'Optimal Index / Index-Only Scan ready',
    });
  }

  score = Math.max(15, Math.min(100, score));
  const grade: SqlIntelligenceReport['grade'] =
    score >= 88 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : 'D';

  const hasCritical = findings.some((f) => f.severity === 'critical');
  const detectedScan = hasCritical
    ? 'Full Seq Scan / Unoptimized I/O'
    : score < 88
      ? 'Suboptimal Scan / Extra Heap & Sort Overhead'
      : 'SARGable Index / Covering Scan';
  const recommendedScan =
    insertCount > 0
      ? 'Batched COPY / Multi-Row Insert + LZ4/ZSTD Compression'
      : 'Covering Index-Only Scan + Keyset Seek';

  const estimatedSpeedup =
    score < 50 ? '15x – 120x faster' : score < 75 ? '4x – 20x faster' : score < 90 ? '1.8x – 4x faster' : 'Already near-optimal';

  const compressionOpportunity =
    insertCount > 0 || hasSelectStar
      ? '3.2x – 6.5x storage & wire reduction (LZ4 / ZSTD + narrow projection)'
      : '2.5x – 4.0x disk savings with TOAST LZ4 / Columnar ZSTD';

  return {
    score,
    grade,
    detectedScan,
    recommendedScan,
    estimatedSpeedup,
    compressionOpportunity,
    findings,
    optimizedSql,
  };
}

