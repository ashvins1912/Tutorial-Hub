import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { CopyButton, SegmentedTabBar } from '../ui';

type TenantSessionValue = 'tenant_acme' | 'tenant_globex' | 'tenant_initech' | 'unset';
type SessionRole = 'app_user' | 'table_owner' | 'bypassrls_admin';
type AccessClearance = 'standard' | 'confidential_admin';
type ViewMode = 'xray' | 'client-result';

interface TenantRecord {
  id: string;
  tenantId: 'tenant_acme' | 'tenant_globex' | 'tenant_initech';
  tenantLabel: string;
  title: string;
  classification: 'standard' | 'confidential';
  amountUsd: number;
  vectorSim: string;
}

const INITIAL_TABLE_ROWS: TenantRecord[] = [
  {
    id: 'rec-101',
    tenantId: 'tenant_acme',
    tenantLabel: 'Acme Corp',
    title: 'Acme Q4 Cloud Invoice Summary',
    classification: 'standard',
    amountUsd: 48200,
    vectorSim: '0.94',
  },
  {
    id: 'rec-102',
    tenantId: 'tenant_acme',
    tenantLabel: 'Acme Corp',
    title: 'Acme M&A Acquisition Term Sheet',
    classification: 'confidential',
    amountUsd: 1250000,
    vectorSim: '0.92',
  },
  {
    id: 'rec-201',
    tenantId: 'tenant_globex',
    tenantLabel: 'Globex Inc',
    title: 'Globex Regional Support Runbook',
    classification: 'standard',
    amountUsd: 19400,
    vectorSim: '0.91',
  },
  {
    id: 'rec-202',
    tenantId: 'tenant_globex',
    tenantLabel: 'Globex Inc',
    title: 'Globex Executive Payroll & Equity Cap Table',
    classification: 'confidential',
    amountUsd: 890000,
    vectorSim: '0.89',
  },
  {
    id: 'rec-301',
    tenantId: 'tenant_initech',
    tenantLabel: 'Initech SaaS',
    title: 'Initech API Rate-Limit SLA Policy',
    classification: 'standard',
    amountUsd: 31500,
    vectorSim: '0.88',
  },
  {
    id: 'rec-302',
    tenantId: 'tenant_initech',
    tenantLabel: 'Initech SaaS',
    title: 'Initech Zero-Day Incident Postmortem',
    classification: 'confidential',
    amountUsd: 410000,
    vectorSim: '0.86',
  },
];

interface WriteAttemptResult {
  allowed: boolean;
  targetTenant: string;
  message: string;
}

export function RowLevelSecurityVisualizer() {
  const [rlsEnabled, setRlsEnabled] = useState<boolean>(true);
  const [forceRlsForOwner, setForceRlsForOwner] = useState<boolean>(true);
  const [sessionTenant, setSessionTenant] = useState<TenantSessionValue>('tenant_acme');
  const [sessionRole, setSessionRole] = useState<SessionRole>('app_user');
  const [clearance, setClearance] = useState<AccessClearance>('standard');
  const [enforceClearancePolicy, setEnforceClearancePolicy] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('xray');
  const [rows, setRows] = useState<TenantRecord[]>(INITIAL_TABLE_ROWS);
  const [writeFeedback, setWriteFeedback] = useState<WriteAttemptResult | null>(null);

  // Determine whether PostgreSQL actually enforces RLS for the current role + flags
  const rlsEffectivelyActive = useMemo(() => {
    if (!rlsEnabled) return false;
    if (sessionRole === 'bypassrls_admin') return false;
    if (sessionRole === 'table_owner' && !forceRlsForOwner) return false;
    return true;
  }, [rlsEnabled, sessionRole, forceRlsForOwner]);

  const bypassReason = useMemo(() => {
    if (!rlsEnabled) return 'RLS is DISABLED on table customer_records.';
    if (sessionRole === 'bypassrls_admin') {
      return 'Role bypassrls_admin holds the BYPASSRLS / SUPERUSER attribute — engine skips all RLS policies.';
    }
    if (sessionRole === 'table_owner' && !forceRlsForOwner) {
      return 'Role table_owner owns the table and FORCE ROW LEVEL SECURITY is OFF — PostgreSQL silently bypasses policies!';
    }
    return null;
  }, [rlsEnabled, sessionRole, forceRlsForOwner]);

  const evaluatedRows = useMemo(() => {
    return rows.map((row) => {
      if (!rlsEffectivelyActive) {
        const isCrossTenant = sessionTenant === 'unset' || row.tenantId !== sessionTenant;
        return {
          row,
          visible: true,
          leaked: isCrossTenant,
          reason: isCrossTenant
            ? 'EXPOSED (Cross-tenant leak — RLS inactive/bypassed)'
            : 'Visible (Matches session tenant, but unprotected)',
        };
      }

      if (sessionTenant === 'unset') {
        return {
          row,
          visible: false,
          leaked: false,
          reason: "FILTERED: current_setting('app.current_tenant_id', true) is NULL (fail-closed)",
        };
      }

      const tenantMatches = row.tenantId === sessionTenant;
      if (!tenantMatches) {
        return {
          row,
          visible: false,
          leaked: false,
          reason: `FILTERED: tenant_id (${row.tenantId}) != '${sessionTenant}'`,
        };
      }

      if (enforceClearancePolicy && row.classification === 'confidential' && clearance !== 'confidential_admin') {
        return {
          row,
          visible: false,
          leaked: false,
          reason: "FILTERED: classification = 'confidential' requires app.clearance = 'confidential_admin'",
        };
      }

      return {
        row,
        visible: true,
        leaked: false,
        reason: `PASSED: tenant_id = '${sessionTenant}'${enforceClearancePolicy ? ` AND clearance OK` : ''}`,
      };
    });
  }, [rows, rlsEffectivelyActive, sessionTenant, enforceClearancePolicy, clearance]);

  const visibleCount = evaluatedRows.filter((e) => e.visible).length;
  const filteredCount = evaluatedRows.length - visibleCount;
  const leakedCount = evaluatedRows.filter((e) => e.leaked).length;

  const displayedRows =
    viewMode === 'client-result' ? evaluatedRows.filter((e) => e.visible) : evaluatedRows;

  // Test a cross-tenant INSERT to demonstrate WITH CHECK policy enforcement
  const handleAttemptCrossTenantInsert = () => {
    const rogueTenant: TenantRecord['tenantId'] =
      sessionTenant === 'tenant_globex' ? 'tenant_acme' : 'tenant_globex';
    const rogueLabel = rogueTenant === 'tenant_acme' ? 'Acme Corp' : 'Globex Inc';

    if (rlsEffectivelyActive) {
      setWriteFeedback({
        allowed: false,
        targetTenant: rogueTenant,
        message: `BLOCKED — ERROR 42501: new row violates row-level security policy (WITH CHECK) for table "customer_records". Session '${sessionTenant}' cannot insert rows for '${rogueTenant}'.`,
      });
      return;
    }

    const injectedId = `rec-rogue-${rows.length + 1}`;
    setRows((prev) => [
      ...prev,
      {
        id: injectedId,
        tenantId: rogueTenant,
        tenantLabel: rogueLabel,
        title: `Injected Rogue Write (${rogueLabel})`,
        classification: 'confidential',
        amountUsd: 99999,
        vectorSim: '0.99',
      },
    ]);
    setWriteFeedback({
      allowed: true,
      targetTenant: rogueTenant,
      message: `SECURITY BREACH — INSERT succeeded without WITH CHECK enforcement! Session '${sessionTenant}' just poisoned '${rogueTenant}' data (${injectedId}).`,
    });
  };

  const rlsSqlBlueprint = useMemo(() => {
    const policyPredicate = enforceClearancePolicy
      ? `tenant_id = current_setting('app.current_tenant_id', true)\n    AND (classification <> 'confidential' OR current_setting('app.clearance', true) = 'confidential_admin')`
      : `tenant_id = current_setting('app.current_tenant_id', true)`;

    return `-- 1. Table RLS State
ALTER TABLE customer_records ${rlsEnabled ? 'ENABLE' : 'DISABLE'} ROW LEVEL SECURITY;
ALTER TABLE customer_records ${forceRlsForOwner ? 'FORCE' : 'NO FORCE'} ROW LEVEL SECURITY;

-- 2. Security Policy (USING filters SELECT/UPDATE/DELETE, WITH CHECK guards INSERT/UPDATE)
CREATE POLICY tenant_isolation ON customer_records
  USING (${policyPredicate})
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));

-- 3. Active Pooled Transaction Context (PgBouncer Transaction-Mode Safe)
BEGIN;
SET LOCAL ROLE ${sessionRole};
${
  sessionTenant === 'unset'
    ? "-- app.current_tenant_id NOT SET (returns NULL -> fail-closed)"
    : `SET LOCAL app.current_tenant_id = '${sessionTenant}';`
}${
      enforceClearancePolicy
        ? `\nSET LOCAL app.clearance = '${clearance}';`
        : ''
    }
SELECT id, tenant_id, title, amount_usd FROM customer_records; -- Developer omitted WHERE!
COMMIT;`;
  }, [rlsEnabled, forceRlsForOwner, sessionRole, sessionTenant, enforceClearancePolicy, clearance]);

  const effectivePlannerPredicate = useMemo(() => {
    if (!rlsEffectivelyActive) {
      return 'Seq Scan on customer_records  (NO security barrier filter injected!)';
    }
    const base = `Filter: (tenant_id = ${
      sessionTenant === 'unset' ? 'NULL' : `'${sessionTenant}'`
    })`;
    if (!enforceClearancePolicy) {
      return `Index Scan using idx_records_tenant on customer_records  (${base})`;
    }
    return `Index Scan using idx_records_tenant on customer_records  (${base} AND (classification <> 'confidential' OR '${clearance}' = 'confidential_admin'))`;
  }, [rlsEffectivelyActive, sessionTenant, enforceClearancePolicy, clearance]);

  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-6">
      {/* Header + Primary RLS Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              Multi-Tenant Governance · Engine-Level Policy Enforcement
            </span>
            <span aria-hidden="true">·</span>
            <span>Session-Bound Variables (SET LOCAL)</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Interactive Row-Level Security (RLS) Visualizer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-6">
            Toggle Row-Level Security on <code className="font-mono">customer_records</code> and mutate PostgreSQL session variables (<code className="font-mono">app.current_tenant_id</code>, role, and clearance) to watch the database engine rewrite queries and filter rows in real time—even when application SQL omits a <code className="font-mono">WHERE</code> clause.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setRlsEnabled((v) => !v);
              setWriteFeedback(null);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
              rlsEnabled
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
            }`}
          >
            {rlsEnabled ? (
              <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <Unlock className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
            {rlsEnabled ? 'RLS: ENABLED' : 'RLS: DISABLED'}
          </button>

          <button
            type="button"
            onClick={() => {
              setForceRlsForOwner((v) => !v);
              setWriteFeedback(null);
            }}
            disabled={!rlsEnabled}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 ${
              forceRlsForOwner
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300'
                : 'border-amber-400 dark:border-amber-700 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300'
            }`}
          >
            {forceRlsForOwner ? 'FORCE RLS: ON' : 'FORCE RLS: OFF'}
          </button>
        </div>
      </div>

      {/* Session Variable Control Deck */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
            SET LOCAL app.current_tenant_id
          </div>
          <SegmentedTabBar<TenantSessionValue>
            ariaLabel="Session current_tenant_id variable"
            activeTab={sessionTenant}
            onChange={(val) => {
              setSessionTenant(val);
              setWriteFeedback(null);
            }}
            size="xs"
            tabs={[
              { id: 'tenant_acme', label: 'tenant_acme', shortLabel: 'Acme' },
              { id: 'tenant_globex', label: 'tenant_globex', shortLabel: 'Globex' },
              { id: 'tenant_initech', label: 'tenant_initech', shortLabel: 'Initech' },
              { id: 'unset', label: 'UNSET (NULL)', shortLabel: 'NULL' },
            ]}
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
            SET LOCAL ROLE
          </div>
          <SegmentedTabBar<SessionRole>
            ariaLabel="PostgreSQL execution role"
            activeTab={sessionRole}
            onChange={(val) => {
              setSessionRole(val);
              setWriteFeedback(null);
            }}
            size="xs"
            tabs={[
              { id: 'app_user', label: 'app_user' },
              { id: 'table_owner', label: 'table_owner' },
              { id: 'bypassrls_admin', label: 'bypassrls_admin', shortLabel: 'superuser' },
            ]}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-mono">
              app.clearance Policy
            </span>
            <button
              type="button"
              onClick={() => setEnforceClearancePolicy((v) => !v)}
              className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              {enforceClearancePolicy ? 'Disable 2nd Predicate' : 'Add Classification Predicate'}
            </button>
          </div>
          <SegmentedTabBar<AccessClearance>
            ariaLabel="Session clearance variable"
            activeTab={clearance}
            onChange={setClearance}
            size="xs"
            tabs={[
              { id: 'standard', label: 'standard' },
              { id: 'confidential_admin', label: 'confidential_admin', shortLabel: 'confidential' },
            ]}
          />
        </div>
      </div>

      {/* Effective Security Verdict Banner */}
      <div
        className={`rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          leakedCount > 0
            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200'
            : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {leakedCount > 0 ? (
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          )}
          <div className="space-y-1">
            <div className="font-semibold">
              {leakedCount > 0
                ? `CROSS-TENANT DATA LEAK: ${leakedCount} foreign tenant rows exposed to session '${sessionTenant}'`
                : sessionTenant === 'unset'
                  ? 'FAIL-CLOSED PROTECTION ACTIVE: Unset session variable yields 0 rows (zero leakage)'
                  : `ZERO LEAKAGE: ${visibleCount} authorized row${visibleCount === 1 ? '' : 's'} returned, ${filteredCount} foreign/restricted rows silently filtered by engine`}
            </div>
            {bypassReason && <div className="opacity-90">{bypassReason}</div>}
            <div className="font-mono text-[11px] opacity-90 break-all">
              Planner Rewrite: {effectivePlannerPredicate}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAttemptCrossTenantInsert}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          Test Cross-Tenant INSERT (WITH CHECK)
        </button>
      </div>

      {writeFeedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-xs font-mono flex items-start gap-2 ${
            writeFeedback.allowed
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
              : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {writeFeedback.allowed ? (
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span>{writeFeedback.message}</span>
        </div>
      )}

      {/* Main 2-Column Stage: Live Row-Filtering Table (Left 7) + SQL Policy Blueprint (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Real-Time Row Visibility Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Table <code className="font-mono">customer_records</code> ({visibleCount} visible · {filteredCount} filtered)
            </div>
            <SegmentedTabBar<ViewMode>
              ariaLabel="Row visibility view mode"
              activeTab={viewMode}
              onChange={setViewMode}
              size="xs"
              tabs={[
                { id: 'xray', label: 'Engine X-Ray (All Disk Rows)', shortLabel: 'Engine X-Ray', icon: Eye },
                { id: 'client-result', label: 'Client Query Output', shortLabel: 'Client Output', icon: EyeOff },
              ]}
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {displayedRows.length === 0 ? (
              <div className="p-8 text-center space-y-1.5 bg-slate-50/60 dark:bg-slate-950/40">
                <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" aria-hidden="true" />
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  0 Rows Returned to Application Client
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  PostgreSQL evaluated the RLS <code className="font-mono">USING</code> predicate as false for every physical row. Switch to <strong>Engine X-Ray</strong> to inspect filtered disk rows.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {displayedRows.map(({ row, visible, leaked, reason }) => (
                  <div
                    key={row.id}
                    className={`p-3.5 text-xs transition-colors ${
                      leaked
                        ? 'bg-rose-50/70 dark:bg-rose-950/30'
                        : visible
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-slate-50/80 dark:bg-slate-950/70 opacity-55'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                            {row.id}
                          </span>
                          <span className="font-mono text-[11px] text-sky-700 dark:text-sky-400">
                            {row.tenantId}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {row.classification}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono tabular-nums text-[11px] text-slate-600 dark:text-slate-300">
                            ${row.amountUsd.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`text-sm font-medium mt-0.5 ${
                            !visible
                              ? 'line-through text-slate-500 dark:text-slate-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {row.title}
                        </div>
                      </div>

                      <span
                        className={`font-mono text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                          leaked
                            ? 'text-rose-700 dark:text-rose-400'
                            : visible
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {leaked ? 'LEAKED' : visible ? 'VISIBLE' : 'FILTERED OUT'}
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      {reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live SQL Policy & Session Code */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Live PostgreSQL Policy &amp; Session State
            </span>
            <CopyButton text={rlsSqlBlueprint} label="Copy SQL" copiedLabel="Copied" size="xs" />
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 text-sky-300 font-mono text-xs leading-5 overflow-x-auto border border-slate-800">
            {rlsSqlBlueprint}
          </pre>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-5">
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Production RLS Gotchas Demonstrated Above
            </div>
            <p>
              • <strong>Use <code className="font-mono">SET LOCAL</code>, never <code className="font-mono">SET</code>:</strong> With PgBouncer in transaction pooling mode, session-level <code className="font-mono">SET</code> leaks the previous tenant&apos;s ID onto the next customer&apos;s request.
            </p>
            <p>
              • <strong>Always enable <code className="font-mono">FORCE ROW LEVEL SECURITY</code>:</strong> Try switching the role to <code className="font-mono">table_owner</code> and toggling FORCE RLS off to see how owners silently bypass policies.
            </p>
            <p>
              • <strong>Index <code className="font-mono">tenant_id</code> first:</strong> Adding a composite index <code className="font-mono">(tenant_id, created_at)</code> lets the engine push the RLS barrier straight into an Index Scan instead of filtering a full Seq Scan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
