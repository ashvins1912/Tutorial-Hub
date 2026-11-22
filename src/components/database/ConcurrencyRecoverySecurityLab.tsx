import { useState } from 'react';
import { GitBranch, HardDrive, Lock, LockOpen } from 'lucide-react';
import { withStudioBoundary } from '../hoc';
import { SegmentedTabBar } from '../ui';
import { OptimisticVsPessimisticLockLab } from './OptimisticVsPessimisticLockLab';
import { DeadlockWaitForVisualizer } from './DeadlockWaitForVisualizer';
import { PitrRecoveryPlayground } from './PitrRecoveryPlayground';
import { RowLevelSecurityVisualizer } from './RowLevelSecurityVisualizer';

type LiveLabTab = 'locking' | 'deadlock' | 'pitr' | 'rls';

const BoundedOptimisticVsPessimisticLockLab = withStudioBoundary(OptimisticVsPessimisticLockLab, {
  studioName: 'Optimistic vs Pessimistic Locking Simulator',
});
const BoundedDeadlockWaitForVisualizer = withStudioBoundary(DeadlockWaitForVisualizer, {
  studioName: 'Deadlock Wait-For Graph Visualizer',
});
const BoundedPitrRecoveryPlayground = withStudioBoundary(PitrRecoveryPlayground, {
  studioName: 'Point-in-Time Recovery (PITR) Playground',
});
const BoundedRowLevelSecurityVisualizer = withStudioBoundary(RowLevelSecurityVisualizer, {
  studioName: 'Row-Level Security (RLS) Visualizer',
});

export function ConcurrencyRecoverySecurityLab() {
  const [activeSubTab, setActiveSubTab] = useState<LiveLabTab>('locking');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Interactive Concurrency, Recovery &amp; Security Labs
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Hands-on visual simulations for row-lock deadlocks, WAL Point-in-Time Recovery, and multi-tenant Row-Level Security.
          </p>
        </div>

        <SegmentedTabBar<LiveLabTab>
          ariaLabel="Concurrency, recovery, and security visualizers"
          activeTab={activeSubTab}
          onChange={setActiveSubTab}
          tabs={[
            {
              id: 'locking',
              label: 'Optimistic vs Pessimistic Locks',
              shortLabel: 'Opt vs Pess',
              icon: LockOpen,
            },
            {
              id: 'deadlock',
              label: 'Deadlock Wait-For Graph',
              shortLabel: 'Deadlock',
              icon: GitBranch,
            },
            {
              id: 'pitr',
              label: 'PITR WAL Replay',
              shortLabel: 'PITR Replay',
              icon: HardDrive,
            },
            {
              id: 'rls',
              label: 'Row-Level Security (RLS)',
              shortLabel: 'RLS Filter',
              icon: Lock,
            },
          ]}
        />
      </div>

      {activeSubTab === 'locking' && <BoundedOptimisticVsPessimisticLockLab />}
      {activeSubTab === 'deadlock' && <BoundedDeadlockWaitForVisualizer />}
      {activeSubTab === 'pitr' && <BoundedPitrRecoveryPlayground />}
      {activeSubTab === 'rls' && <BoundedRowLevelSecurityVisualizer />}
    </div>
  );
}
