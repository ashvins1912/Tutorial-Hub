import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  INVARIANT_PRESETS,
  type InvariantPresetId,
  type InvariantRow,
  applyInvariantMove,
  evaluateInvariantRow,
} from '../../core/step-generators/workspaceGenerators';

interface InvariantTrackerTableProps {
  initialPreset?: InvariantPresetId;
}

export const InvariantTrackerTable: React.FC<InvariantTrackerTableProps> = ({
  initialPreset = 'chessboard-parity',
}) => {
  const [presetId, setPresetId] = useState<InvariantPresetId>(initialPreset);
  const preset = useMemo(
    () => INVARIANT_PRESETS.find((p) => p.id === presetId) ?? INVARIANT_PRESETS[0],
    [presetId],
  );

  const [tuple, setTuple] = useState<number[]>(preset.initialTuple);
  const [history, setHistory] = useState<InvariantRow[]>(() => [
    evaluateInvariantRow(preset.id, preset.initialTuple, 0, 'Initial State'),
  ]);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);

  useEffect(() => {
    const nextPreset = INVARIANT_PRESETS.find((p) => p.id === initialPreset) ?? INVARIANT_PRESETS[0];
    setPresetId(nextPreset.id);
    setTuple(nextPreset.initialTuple);
    setHistory([evaluateInvariantRow(nextPreset.id, nextPreset.initialTuple, 0, 'Initial State')]);
    setBlockedMsg(null);
  }, [initialPreset]);

  const handleSwitchPreset = (nextId: InvariantPresetId) => {
    const nextPreset = INVARIANT_PRESETS.find((p) => p.id === nextId) ?? INVARIANT_PRESETS[0];
    setPresetId(nextPreset.id);
    setTuple(nextPreset.initialTuple);
    setHistory([evaluateInvariantRow(nextPreset.id, nextPreset.initialTuple, 0, 'Initial State')]);
    setBlockedMsg(null);
  };

  const handleMove = (moveId: string) => {
    const res = applyInvariantMove(preset.id, tuple, moveId);
    if (res.blockedReason) {
      setBlockedMsg(res.blockedReason);
      return;
    }
    setBlockedMsg(null);
    setTuple(res.nextTuple);
    setHistory((prev) => [
      ...prev,
      evaluateInvariantRow(preset.id, res.nextTuple, prev.length, res.actionLabel),
    ]);
  };

  const latest = history[history.length - 1];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Live Invariant & State-Transition Lab</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600 dark:text-slate-300">{preset.domainLabel}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {preset.title}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 p-1">
          {INVARIANT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSwitchPreset(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                preset.id === p.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {p.id === 'chessboard-parity'
                ? 'Chessboard Parity'
                : p.id === 'nim-xor'
                  ? 'Nim XOR'
                  : 'Chameleon Mod-3'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Invariant Formula Banner */}
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/70 dark:bg-indigo-950/40 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-800 dark:text-indigo-200">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Tracked Invariant Law</span>
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
            {preset.invariantFormula}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">{preset.goalStatement}</p>
        </div>

        {/* Live Tuple Counters + Interactive Moves */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-950/50">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Current State Tuple
            </h4>
            <div className="flex flex-wrap gap-3">
              {preset.tupleLabels.map((lbl, idx) => (
                <div
                  key={lbl}
                  className="flex-1 min-w-[84px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-center"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{lbl}</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {tuple[idx]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Test Legal Transitions
              </h4>
              <button
                type="button"
                onClick={() => handleSwitchPreset(preset.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preset.moves.map((mv) => (
                <button
                  key={mv.id}
                  type="button"
                  onClick={() => handleMove(mv.id)}
                  title={mv.description}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>{mv.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {blockedMsg && (
          <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-2.5 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{blockedMsg}</span>
          </div>
        )}

        {/* Latest Proof Observation */}
        <div
          className={`rounded-lg border p-3 text-xs flex items-center gap-2 font-medium ${
            latest.invariantHeld
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{latest.proofNote}</span>
        </div>

        {/* Live Transition History Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 px-3 font-semibold">#</th>
                <th className="py-2 px-3 font-semibold">Move</th>
                <th className="py-2 px-3 font-semibold">State</th>
                <th className="py-2 px-3 font-semibold">Sum</th>
                <th className="py-2 px-3 font-semibold">Parity</th>
                <th className="py-2 px-3 font-semibold">XOR</th>
                <th className="py-2 px-3 font-semibold">Invariant / Modulo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
              {history.map((row) => (
                <tr
                  key={row.step}
                  className={
                    row.step === latest.step
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-900 dark:text-slate-100'
                      : 'text-slate-700 dark:text-slate-300'
                  }
                >
                  <td className="py-2 px-3">{row.step}</td>
                  <td className="py-2 px-3 font-sans">{row.action}</td>
                  <td className="py-2 px-3">{row.stateDisplay}</td>
                  <td className="py-2 px-3">{row.sum}</td>
                  <td className="py-2 px-3">{row.parity}</td>
                  <td className="py-2 px-3 font-bold">{row.xorValue}</td>
                  <td className="py-2 px-3">
                    <span
                      className={
                        row.invariantHeld
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-amber-700 dark:text-amber-400 font-semibold'
                      }
                    >
                      {row.invariantHeld ? '✓ ' : '△ '}
                      {row.moduloLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
