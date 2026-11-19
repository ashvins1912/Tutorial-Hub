import { useState } from 'react';
import { Code2, PlusCircle, Sparkles, X } from 'lucide-react';
import type { CustomConceptInput } from '../../../core/intelligent-engine/intelligent-engine.types';

interface CreateTopicModalProps {
  open: boolean;
  onClose: () => void;
  onRegisterConcepts: (specs: CustomConceptInput[]) => void;
}

const PRESET_TEMPLATES: { label: string; spec: CustomConceptInput }[] = [
  {
    label: 'Bloom Filter',
    spec: {
      id: 'bloom-filter-probabilistic',
      title: 'Bloom Filter (Probabilistic Membership)',
      category: 'Probabilistic Data Structures',
      tags: ['bloom filter', 'hashing', 'bitset', 'cache', 'lsm-tree'],
      coreMentalModel:
        'Hash each key with k independent hash functions into a compact m-bit array to reject non-members in O(k) time with zero false negatives.',
      invariantRule:
        'If ANY of the k bit positions is 0, the element is 100% guaranteed absent; if all k are 1, it is probably present (tunable false-positive rate).',
      complexity: { time: 'O(k) insert & query', space: 'O(m bits)' },
      visualSpec: {
        inputs: ['Incoming Lookup Key', 'k Independent Hash Functions'],
        processes: [
          'Compute k Hash Indices mod m',
          'Probe Bitset Positions in Parallel',
          'Evaluate All-Ones Conjunction',
          'Short-Circuit Disk Read on Zero Bit',
        ],
        dataStores: ['m-Bit Compact Bitset Array', 'Backing SSTable / Database'],
        outputs: ['Definitely Absent OR Probably Present'],
        decisionBranches: [
          {
            condition: 'All k Bit Positions === 1',
            truePath: 'Proceed to Backing Store Lookup',
            falsePath: 'Return False Immediately (Zero Disk I/O)',
          },
        ],
      },
      sampleEdgeCases: ['false_positive_collision', 'delete_requires_counting_bloom'],
    },
  },
  {
    label: 'Token Bucket Rate Limiter',
    spec: {
      id: 'token-bucket-rate-limiter',
      title: 'Token Bucket Rate Limiter (Burst-Aware Throttling)',
      category: 'System Design & API Gateway',
      tags: ['rate limiter', 'token bucket', 'redis', 'lua', 'api gateway', 'throttling'],
      coreMentalModel:
        'Refill tokens continuously at rate R up to burst cap B; atomically consume 1 token per request inside a Redis Lua script.',
      invariantRule:
        'tokens = min(capacity, prevTokens + (now - lastRefill) * refillRate); allow iff tokens >= 1.',
      complexity: { time: 'O(1) atomic check', space: 'O(Active Clients)' },
      visualSpec: {
        inputs: ['HTTP Request + Client API Key', 'Current Monotonic Timestamp'],
        processes: [
          'Fetch (tokens, lastTimestamp) From Redis Hash',
          'Compute Lazy Refill Clamped to Burst Capacity',
          'Atomically Decrement Token if >= 1',
          'Emit Allow or HTTP 429 Retry-After',
        ],
        dataStores: ['Redis Client Bucket Hash', 'Atomic Lua Script Evaluator'],
        outputs: ['200 Forward to Upstream OR 429 Too Many Requests'],
        decisionBranches: [
          {
            condition: 'refilledTokens >= 1',
            truePath: 'Decrement 1 Token & Forward Request',
            falsePath: 'Reject With HTTP 429 + Retry-After Header',
          },
        ],
      },
      sampleEdgeCases: ['concurrent_burst_race_condition', 'clock_skew_monotonic_guard'],
    },
  },
  {
    label: 'Raft Leader Election',
    spec: {
      id: 'raft-leader-election',
      title: 'Raft Consensus (Term-Based Leader Election)',
      category: 'Distributed Consensus',
      tags: ['raft', 'consensus', 'quorum', 'leader election', 'distributed systems'],
      coreMentalModel:
        'Randomized election timeouts break symmetry; a candidate wins leadership only by securing a strict majority quorum with an up-to-date log.',
      invariantRule:
        'At most one leader can be elected in any given term because every server votes at most once per term and any two majorities overlap.',
      complexity: { time: 'O(N) RPCs per election', space: 'O(Log Entries)' },
      visualSpec: {
        inputs: ['Follower Election Timeout', 'RequestVote RPCs + Term Number'],
        processes: [
          'Increment currentTerm & Transition to Candidate',
          'Vote for Self & Broadcast RequestVote RPCs',
          'Validate Candidate Log Up-To-Date Check',
          'Promote to Leader on Majority Quorum & Send Heartbeats',
        ],
        dataStores: ['Persistent currentTerm & votedFor', 'Replicated Write-Ahead Log'],
        outputs: ['Elected Term Leader & Heartbeat Stream'],
        decisionBranches: [
          {
            condition: 'votesReceived > clusterSize / 2',
            truePath: 'Become Leader & Broadcast AppendEntries Heartbeat',
            falsePath: 'Step Down to Follower or Split-Vote Backoff',
          },
        ],
      },
      sampleEdgeCases: ['split_vote_randomized_timeout', 'stale_leader_higher_term_stepdown'],
    },
  },
];

export function CreateTopicModal({
  open,
  onClose,
  onRegisterConcepts,
}: CreateTopicModalProps) {
  const [mode, setMode] = useState<'form' | 'json'>('form');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Algorithms & Systems');
  const [tags, setTags] = useState('custom, pattern, algorithm');
  const [mentalModel, setMentalModel] = useState('');
  const [invariant, setInvariant] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('O(N log N)');
  const [spaceComplexity, setSpaceComplexity] = useState('O(N)');
  const [inputs, setInputs] = useState('Input Stream, Constraints');
  const [processes, setProcesses] = useState(
    'Parse & Normalize Input\nUpdate Primary Data Store\nCheck Core Invariant\nEmit Verified Result',
  );
  const [dataStores, setDataStores] = useState('Primary Index / Map, Auxiliary Queue');
  const [outputs, setOutputs] = useState('Optimal Computed Result');
  const [branchCondition, setBranchCondition] = useState('Invariant Satisfied');
  const [branchTrue, setBranchTrue] = useState('Commit Optimal Transition');
  const [branchFalse, setBranchFalse] = useState('Prune or Repair Window');

  const [jsonInput, setJsonInput] = useState(() =>
    JSON.stringify(PRESET_TEMPLATES[0].spec, null, 2),
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const applyPreset = (spec: CustomConceptInput) => {
    setTitle(spec.title);
    setCategory(spec.category);
    setTags(spec.tags.join(', '));
    setMentalModel(spec.coreMentalModel);
    setInvariant(spec.invariantRule);
    setTimeComplexity(spec.complexity.time);
    setSpaceComplexity(spec.complexity.space);
    setInputs(spec.visualSpec.inputs.join(', '));
    setProcesses(spec.visualSpec.processes.join('\n'));
    setDataStores(spec.visualSpec.dataStores.join(', '));
    setOutputs(spec.visualSpec.outputs.join(', '));
    const b = spec.visualSpec.decisionBranches[0];
    if (b) {
      setBranchCondition(b.condition);
      setBranchTrue(b.truePath);
      setBranchFalse(b.falsePath);
    }
    setJsonInput(JSON.stringify(spec, null, 2));
    setError(null);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !invariant.trim()) {
      setError('Please enter at least a Topic Title and Core Invariant Rule.');
      return;
    }
    const spec: CustomConceptInput = {
      id: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      title: title.trim(),
      category: category.trim() || 'Custom Concept',
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      coreMentalModel: mentalModel.trim() || invariant.trim(),
      invariantRule: invariant.trim(),
      complexity: {
        time: timeComplexity.trim() || 'O(N)',
        space: spaceComplexity.trim() || 'O(N)',
      },
      visualSpec: {
        inputs: inputs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        processes: processes
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        dataStores: dataStores
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        outputs: outputs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        decisionBranches: [
          {
            condition: branchCondition.trim() || 'Invariant Holds',
            truePath: branchTrue.trim() || 'Advance',
            falsePath: branchFalse.trim() || 'Repair State',
          },
        ],
      },
    };
    onRegisterConcepts([spec]);
    onClose();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput) as CustomConceptInput | CustomConceptInput[];
      const list = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length === 0 || !list[0].title || !list[0].visualSpec) {
        setError('JSON must contain title, invariantRule, and visualSpec fields.');
        return;
      }
      onRegisterConcepts(list);
      onClose();
    } catch (err) {
      setError(`Invalid JSON syntax: ${err instanceof Error ? err.message : 'Parse error'}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Hot-Plug New Concept or Import JSON Pack"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Extensible Knowledge Registry · Runtime Hot-Plug
            </div>
            <h2 className="text-base font-display font-bold text-slate-900 dark:text-slate-100">
              Create or Import a New Algorithm / System Concept
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close builder"
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick-fill Templates & Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setMode('form')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                  mode === 'form'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Guided Builder
              </button>
              <button
                type="button"
                onClick={() => setMode('json')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${
                  mode === 'json'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                JSON Pack Import
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" aria-hidden="true" />
                Auto-fill sample:
              </span>
              {PRESET_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyPreset(t.spec)}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-sky-500 font-medium"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-200">
              {error}
            </div>
          )}

          {mode === 'form' ? (
            <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Concept / Algorithm Title *
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Segment Tree Lazy Propagation"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Category</span>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Core Invariant Rule *
                </span>
                <input
                  type="text"
                  value={invariant}
                  onChange={(e) => setInvariant(e.target.value)}
                  placeholder="Mathematical or logical truth that guarantees optimality..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Core Mental Model
                </span>
                <textarea
                  rows={2}
                  value={mentalModel}
                  onChange={(e) => setMentalModel(e.target.value)}
                  placeholder="Plain-English intuition before any code..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Search Tags (comma)
                  </span>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Time Complexity
                  </span>
                  <input
                    type="text"
                    value={timeComplexity}
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Space Complexity
                  </span>
                  <input
                    type="text"
                    value={spaceComplexity}
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    DFD External Inputs (comma)
                  </span>
                  <input
                    type="text"
                    value={inputs}
                    onChange={(e) => setInputs(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    DFD Data Stores (comma)
                  </span>
                  <input
                    type="text"
                    value={dataStores}
                    onChange={(e) => setDataStores(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Process Stages (one step per line — synthesizes Flowchart + DFD + State Machine)
                </span>
                <textarea
                  rows={3}
                  value={processes}
                  onChange={(e) => setProcesses(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Branch Condition
                  </span>
                  <input
                    type="text"
                    value={branchCondition}
                    onChange={(e) => setBranchCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    YES Path Action
                  </span>
                  <input
                    type="text"
                    value={branchTrue}
                    onChange={(e) => setBranchTrue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    NO Path Action
                  </span>
                  <input
                    type="text"
                    value={branchFalse}
                    onChange={(e) => setBranchFalse(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Final Outputs (comma)
                </span>
                <input
                  type="text"
                  value={outputs}
                  onChange={(e) => setOutputs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
                >
                  Register Concept & Synthesize Diagrams
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Paste a single <code className="font-mono">CustomConceptInput</code> JSON object or an array of concepts to hot-plug into the N-gram registry immediately.
              </p>
              <textarea
                rows={14}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-950 text-sky-200 font-mono text-[11px] leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold hover:bg-slate-800 dark:hover:bg-sky-400"
                >
                  Import JSON Concept Pack
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
