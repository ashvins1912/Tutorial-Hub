import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  RotateCcw,
  Sparkles,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { usePatternForgeStore } from '../store/usePatternForgeStore';
import { PROBLEMS } from '../data/problems';
import { PairProgrammingCanvas } from './PairProgrammingCanvas';

interface PairUser {
  userId: string;
  name: string;
  color: string;
  initials: string;
  cursor: { x: number; y: number } | null;
}

interface CanvasStroke {
  id: string;
  userId: string;
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

const MOCK_IDENTITIES = [
  { name: 'Alex Chen', initials: 'AC', color: '#0284c7' },
  { name: 'Priya Nair', initials: 'PN', color: '#059669' },
  { name: 'Jordan Lee', initials: 'JL', color: '#d97706' },
  { name: 'Samira Khan', initials: 'SK', color: '#e11d48' },
];

function getOrCreateLocalIdentity(): PairUser {
  const storageKey = 'patternforge_pair_mock_user';
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return JSON.parse(existing) as PairUser;
  } catch {
    // ignore sessionStorage error
  }
  const pick = MOCK_IDENTITIES[Math.floor(Math.random() * MOCK_IDENTITIES.length)];
  const created: PairUser = {
    userId: `usr-${Math.random().toString(36).slice(2, 7)}`,
    name: pick.name,
    initials: pick.initials,
    color: pick.color,
    cursor: null,
  };
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(created));
  } catch {
    // ignore
  }
  return created;
}

export function VisualSandbox() {
  const activeProblemId = usePatternForgeStore((s) => s.activeProblemId);
  const progress = usePatternForgeStore((s) => s.problemProgress[s.activeProblemId]);
  const markSandboxSolved = usePatternForgeStore((s) => s.markSandboxSolved);
  const setPolyaStep = usePatternForgeStore((s) => s.setPolyaStep);

  const problem = PROBLEMS.find((p) => p.id === activeProblemId) ?? PROBLEMS[0];
  const cfg = problem.sandboxConfig;

  // Pair Programming WebSocket & Mock Identity state
  const [pairMode, setPairMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('room');
  });
  const [roomId, setRoomId] = useState<string>(() => {
    if (typeof window === 'undefined') return `${problem.id}-pair`;
    return new URLSearchParams(window.location.search).get('room') || `${problem.id}-pair`;
  });
  const [localUser, setLocalUser] = useState<PairUser>(() => getOrCreateLocalIdentity());
  const [roomUsers, setRoomUsers] = useState<PairUser[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [drawMode, setDrawMode] = useState(false);
  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Two Sum local state
  const [tsMap, setTsMap] = useState<Record<number, number>>({});
  const [tsSelected, setTsSelected] = useState<number[]>([]);
  const [tsStatus, setTsStatus] = useState(
    'Click array cells from left to right to inspect complements.'
  );

  // Sliding Window local state
  const [swL, setSwL] = useState(0);
  const [swR, setSwR] = useState(0);
  const [swBest, setSwBest] = useState(1);

  // Monotonic Stack local state
  const [msIdx, setMsIdx] = useState(0);
  const [msStack, setMsStack] = useState<number[]>([]);
  const [msAns, setMsAns] = useState<number[]>(() =>
    new Array(cfg.sampleArray?.length ?? 7).fill(0)
  );

  // Rain Water local state
  const [rwL, setRwL] = useState(0);
  const [rwR, setRwR] = useState((cfg.sampleArray?.length ?? 12) - 1);
  const [rwLMax, setRwLMax] = useState(0);
  const [rwRMax, setRwRMax] = useState(0);
  const [rwWaterByBar, setRwWaterByBar] = useState<Record<number, number>>({});
  const [rwWarning, setRwWarning] = useState<string | null>(null);

  // Coin Change DP local state
  const [ccDp, setCcDp] = useState<(number | null)[]>([0, null, null, null, null, null, null]);
  const [ccActiveAmount, setCcActiveAmount] = useState(1);

  const applySharedSandboxState = useCallback(
    (s: any) => {
      if (!s || s.problemId !== problem.id) return;
      if (s.tsMap !== undefined) setTsMap(s.tsMap);
      if (s.tsSelected !== undefined) setTsSelected(s.tsSelected);
      if (s.tsStatus !== undefined) setTsStatus(s.tsStatus);
      if (s.swL !== undefined) setSwL(s.swL);
      if (s.swR !== undefined) setSwR(s.swR);
      if (s.swBest !== undefined) setSwBest(s.swBest);
      if (s.msIdx !== undefined) setMsIdx(s.msIdx);
      if (s.msStack !== undefined) setMsStack(s.msStack);
      if (s.msAns !== undefined) setMsAns(s.msAns);
      if (s.rwL !== undefined) setRwL(s.rwL);
      if (s.rwR !== undefined) setRwR(s.rwR);
      if (s.rwLMax !== undefined) setRwLMax(s.rwLMax);
      if (s.rwRMax !== undefined) setRwRMax(s.rwRMax);
      if (s.rwWaterByBar !== undefined) setRwWaterByBar(s.rwWaterByBar);
      if (s.rwWarning !== undefined) setRwWarning(s.rwWarning);
      if (s.ccDp !== undefined) setCcDp(s.ccDp);
      if (s.ccActiveAmount !== undefined) setCcActiveAmount(s.ccActiveAmount);
    },
    [problem.id]
  );

  // Manage WebSocket connection when Pair Mode is enabled
  useEffect(() => {
    if (!pairMode) {
      wsRef.current?.close();
      wsRef.current = null;
      setWsConnected(false);
      setRoomUsers([]);
      return;
    }

    let cancelled = false;
    let reconnectTimer: number | null = null;

    const connect = () => {
      if (cancelled) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(
        `${proto}//${window.location.host}/ws/pair?room=${encodeURIComponent(roomId)}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        ws.send(JSON.stringify({ type: 'user:join', user: localUser }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'room:init') {
            setRoomUsers(msg.users || []);
            setStrokes(msg.strokes || []);
            if (msg.sandboxState) applySharedSandboxState(msg.sandboxState);
          } else if (msg.type === 'user:joined' || msg.type === 'user:left') {
            setRoomUsers(msg.users || []);
          } else if (msg.type === 'cursor:moved') {
            setRoomUsers((prev) =>
              prev.map((u) => (u.userId === msg.userId ? { ...u, cursor: msg.cursor } : u))
            );
          } else if (msg.type === 'stroke:added' && msg.stroke) {
            setStrokes((prev) =>
              prev.some((s) => s.id === msg.stroke.id) ? prev : [...prev, msg.stroke]
            );
          } else if (msg.type === 'canvas:cleared') {
            setStrokes([]);
          } else if (msg.type === 'sandbox:synced') {
            applySharedSandboxState(msg.sandboxState);
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (!cancelled) {
          reconnectTimer = window.setTimeout(connect, 2000);
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [pairMode, roomId, localUser, applySharedSandboxState]);

  const emitSandboxSync = (patch: Record<string, unknown>) => {
    if (!pairMode || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'sandbox:sync',
        sandboxState: {
          problemId: problem.id,
          updatedBy: localUser.userId,
          ...patch,
        },
      })
    );
  };

  const remoteUsers = useMemo(
    () => roomUsers.filter((u) => u.userId !== localUser.userId),
    [roomUsers, localUser.userId]
  );

  const cycleMockIdentity = () => {
    const idx = MOCK_IDENTITIES.findIndex((m) => m.name === localUser.name);
    const nextMock = MOCK_IDENTITIES[(idx + 1) % MOCK_IDENTITIES.length];
    const nextUser: PairUser = {
      ...localUser,
      name: nextMock.name,
      initials: nextMock.initials,
      color: nextMock.color,
    };
    setLocalUser(nextUser);
    try {
      sessionStorage.setItem('patternforge_pair_mock_user', JSON.stringify(nextUser));
    } catch {
      // ignore
    }
  };

  const handleCopyRoomLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // ignore clipboard errors
    }
  };

  const resetAll = () => {
    const emptyAns = new Array(cfg.sampleArray?.length ?? 7).fill(0);
    const defaultRwR = (cfg.sampleArray?.length ?? 12) - 1;
    setTsMap({});
    setTsSelected([]);
    setTsStatus('Click array cells from left to right to inspect complements.');
    setSwL(0);
    setSwR(0);
    setSwBest(1);
    setMsIdx(0);
    setMsStack([]);
    setMsAns(emptyAns);
    setRwL(0);
    setRwR(defaultRwR);
    setRwLMax(0);
    setRwRMax(0);
    setRwWaterByBar({});
    setRwWarning(null);
    setCcDp([0, null, null, null, null, null, null]);
    setCcActiveAmount(1);

    emitSandboxSync({
      tsMap: {},
      tsSelected: [],
      tsStatus: 'Click array cells from left to right to inspect complements.',
      swL: 0,
      swR: 0,
      swBest: 1,
      msIdx: 0,
      msStack: [],
      msAns: emptyAns,
      rwL: 0,
      rwR: defaultRwR,
      rwLMax: 0,
      rwRMax: 0,
      rwWaterByBar: {},
      rwWarning: null,
      ccDp: [0, null, null, null, null, null, null],
      ccActiveAmount: 1,
    });
  };

  // Two Sum Handler
  const handleTwoSumClick = (idx: number) => {
    const arr = cfg.sampleArray ?? [2, 11, 7, 15];
    const target = cfg.targetSum ?? 9;
    const val = arr[idx];
    const comp = target - val;
    if (tsMap[comp] !== undefined && tsMap[comp] !== idx) {
      const nextSelected = [tsMap[comp], idx];
      const nextStatus = `HashMap hit! Needed ${comp} for ${val}; found at index ${tsMap[comp]}. Pair [${tsMap[comp]}, ${idx}] = ${target}.`;
      setTsSelected(nextSelected);
      setTsStatus(nextStatus);
      markSandboxSolved();
      emitSandboxSync({ tsMap, tsSelected: nextSelected, tsStatus: nextStatus });
    } else {
      const nextMap = { ...tsMap, [val]: idx };
      const nextSelected = [idx];
      const nextStatus = `Checked map[${comp}] -> miss. Stored map[${val}] = ${idx}.`;
      setTsMap(nextMap);
      setTsSelected(nextSelected);
      setTsStatus(nextStatus);
      emitSandboxSync({ tsMap: nextMap, tsSelected: nextSelected, tsStatus: nextStatus });
    }
  };

  // Sliding Window Handlers
  const swStr = cfg.sampleString ?? 'abcabcbb';
  const swWindowSlice = swStr.slice(swL, swR + 1).split('');
  const swHasDup = new Set(swWindowSlice).size !== swWindowSlice.length;

  const handleSwExpand = () => {
    if (swR >= swStr.length - 1 || swHasDup) return;
    const nextR = swR + 1;
    setSwR(nextR);
    const nextSlice = swStr.slice(swL, nextR + 1).split('');
    let nextBest = swBest;
    if (new Set(nextSlice).size === nextSlice.length) {
      nextBest = Math.max(swBest, nextR - swL + 1);
      setSwBest(nextBest);
      if (nextBest >= 3 && nextR >= 3) markSandboxSolved();
    }
    emitSandboxSync({ swL, swR: nextR, swBest: nextBest });
  };

  const handleSwShrink = () => {
    if (swL >= swR) return;
    const nextL = swL + 1;
    setSwL(nextL);
    const nextSlice = swStr.slice(nextL, swR + 1).split('');
    let nextBest = swBest;
    if (new Set(nextSlice).size === nextSlice.length) {
      nextBest = Math.max(swBest, swR - nextL + 1);
      setSwBest(nextBest);
      if (nextL >= 1) markSandboxSolved();
    }
    emitSandboxSync({ swL: nextL, swR, swBest: nextBest });
  };

  // Monotonic Stack Handler
  const handleMsStep = () => {
    const temps = cfg.sampleArray ?? [73, 74, 75, 71, 69, 72, 76];
    if (msIdx >= temps.length) return;
    const nextStack = [...msStack];
    const nextAns = [...msAns];
    while (nextStack.length > 0 && temps[msIdx] > temps[nextStack[nextStack.length - 1]]) {
      const popped = nextStack.pop()!;
      nextAns[popped] = msIdx - popped;
    }
    nextStack.push(msIdx);
    const nextIdx = msIdx + 1;
    setMsStack(nextStack);
    setMsAns(nextAns);
    setMsIdx(nextIdx);
    if (nextIdx >= temps.length - 1) markSandboxSolved();
    emitSandboxSync({ msIdx: nextIdx, msStack: nextStack, msAns: nextAns });
  };

  // Rain Water Handlers
  const handleRwStep = (side: 'L' | 'R') => {
    const h = cfg.sampleArray ?? [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
    if (rwL >= rwR) return;
    if (side === 'L' && h[rwL] > h[rwR]) {
      const warn = `Pause: height[L]=${h[rwL]} is taller than height[R]=${h[rwR]}. Step the SHORTER wall (R) so water cannot leak!`;
      setRwWarning(warn);
      emitSandboxSync({ rwWarning: warn });
      return;
    }
    if (side === 'R' && h[rwR] > h[rwL]) {
      const warn = `Pause: height[R]=${h[rwR]} is taller than height[L]=${h[rwL]}. Step the SHORTER wall (L) so water cannot leak!`;
      setRwWarning(warn);
      emitSandboxSync({ rwWarning: warn });
      return;
    }
    setRwWarning(null);
    if (side === 'L') {
      const newLMax = Math.max(rwLMax, h[rwL]);
      const trapped = Math.max(0, newLMax - h[rwL]);
      const nextWater = { ...rwWaterByBar, [rwL]: trapped };
      const nextL = rwL + 1;
      setRwLMax(newLMax);
      setRwWaterByBar(nextWater);
      setRwL(nextL);
      if (nextL >= rwR) markSandboxSolved();
      emitSandboxSync({ rwL: nextL, rwLMax: newLMax, rwWaterByBar: nextWater, rwWarning: null });
    } else {
      const newRMax = Math.max(rwRMax, h[rwR]);
      const trapped = Math.max(0, newRMax - h[rwR]);
      const nextWater = { ...rwWaterByBar, [rwR]: trapped };
      const nextR = rwR - 1;
      setRwRMax(newRMax);
      setRwWaterByBar(nextWater);
      setRwR(nextR);
      if (rwL >= nextR) markSandboxSolved();
      emitSandboxSync({ rwR: nextR, rwRMax: newRMax, rwWaterByBar: nextWater, rwWarning: null });
    }
  };

  // Coin Change DP Handler
  const handleCcComputeNext = () => {
    if (ccActiveAmount > 6) return;
    const coins = cfg.sampleArray ?? [1, 3, 4];
    let best = Infinity;
    for (const c of coins) {
      if (ccActiveAmount - c >= 0) {
        const prev = ccDp[ccActiveAmount - c];
        if (prev !== null) best = Math.min(best, 1 + prev);
      }
    }
    const next = [...ccDp];
    next[ccActiveAmount] = best;
    const nextAmount = ccActiveAmount + 1;
    setCcDp(next);
    if (ccActiveAmount === 6) markSandboxSolved();
    setCcActiveAmount(nextAmount);
    emitSandboxSync({ ccDp: next, ccActiveAmount: nextAmount });
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-6 space-y-5">
      {/* Toolbar Header + Pair Programming Presence Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
            HANDS-ON DRY-RUN SANDBOX
          </p>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Solve the Small Sample by Hand
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{cfg.instruction}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPairMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              pairMode
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            {pairMode ? 'Pair Mode Active' : 'Pair Programming'}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => setPolyaStep('plan')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            Lock Loop Invariant
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Pair Programming Presence Toolbar (Shown when Pair Mode is enabled) */}
      {pairMode && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 font-mono font-semibold ${
                wsConnected
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {wsConnected ? (
                <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {wsConnected ? 'WS CONNECTED' : 'CONNECTING...'}
            </span>

            {/* Local User Avatar */}
            <button
              type="button"
              onClick={cycleMockIdentity}
              title="Click to switch mock user profile"
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <span
                className="w-5 h-5 rounded-md text-[10px] font-mono font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: localUser.color }}
              >
                {localUser.initials}
              </span>
              <span className="font-semibold">{localUser.name}</span>
              <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400">[LOCAL]</span>
            </button>

            {/* Remote Connected Users */}
            {remoteUsers.length > 0 ? (
              remoteUsers.map((peer) => (
                <div
                  key={peer.userId}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100"
                >
                  <span
                    className="w-5 h-5 rounded-md text-[10px] font-mono font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: peer.color }}
                  >
                    {peer.initials}
                  </span>
                  <span className="font-semibold">{peer.name}</span>
                  <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                    [REMOTE]
                  </span>
                </div>
              ))
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Waiting for remote peer — open Room link in a 2nd tab to dry-run together.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="pair-room-id" className="text-[11px] font-mono text-slate-500">
              Room:
            </label>
            <input
              id="pair-room-id"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-32 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={handleCopyRoomLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {copiedLink ? (
                <Check className="w-3 h-3 text-emerald-500" aria-hidden="true" />
              ) : (
                <Copy className="w-3 h-3" aria-hidden="true" />
              )}
              {copiedLink ? 'Copied URL' : 'Copy Invite'}
            </button>
          </div>
        </div>
      )}

      {/* Sandbox Interactive Canvas + WebSocket PairProgrammingCanvas Overlay */}
      <div className="relative p-6 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <PairProgrammingCanvas
          active={pairMode}
          drawMode={drawMode}
          onToggleDrawMode={setDrawMode}
          localUser={localUser}
          remoteUsers={remoteUsers}
          strokes={strokes}
          onAddStroke={(stroke: CanvasStroke) => {
            setStrokes((prev) => (prev.some((s) => s.id === stroke.id) ? prev : [...prev, stroke]));
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'stroke:add', stroke }));
            }
          }}
          onClearStrokes={() => {
            setStrokes([]);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'canvas:clear' }));
            }
          }}
          onMoveCursor={(cursor: { x: number; y: number } | null) => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'cursor:move', cursor }));
            }
          }}
        />

        {cfg.type === 'two-sum' && (
          <div className="space-y-5 relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {(cfg.sampleArray ?? [2, 11, 7, 15]).map((val, idx) => {
                const isSelected = tsSelected.includes(idx);
                const isInMap = tsMap[val] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTwoSumClick(idx)}
                    className={`w-24 h-24 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                        : isInMap
                          ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-500'
                    }`}
                  >
                    <span className="text-xs font-mono text-slate-400">idx {idx}</span>
                    <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {val}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      need {(cfg.targetSum ?? 9) - val}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">{tsStatus}</p>
              <div className="font-mono text-xs text-sky-700 dark:text-sky-300 shrink-0">
                seen Map: {JSON.stringify(tsMap)}
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'sliding-window' && (
          <div className="space-y-5 relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {swStr.split('').map((ch, idx) => {
                const inWin = idx >= swL && idx <= swR;
                const isL = idx === swL;
                const isR = idx === swR;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-14 h-16 rounded-lg border flex flex-col items-center justify-center font-mono ${
                        inWin
                          ? swHasDup
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px]">{idx}</span>
                      <span className="text-xl font-bold">{ch}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 h-4">
                      {isL && isR ? 'L,R' : isL ? 'L' : isR ? 'R' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-sm">
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                  Window [{swL}..{swR}] = &ldquo;{swStr.slice(swL, swR + 1)}&rdquo;
                </span>
                <span className="mx-2 text-slate-400">·</span>
                <span
                  className={
                    swHasDup
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  }
                >
                  {swHasDup ? 'DUPLICATE DETECTED (Shrink Left)' : `VALID · Best Length = ${swBest}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSwShrink}
                  disabled={swL >= swR}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Shrink Left (L++)
                </button>
                <button
                  type="button"
                  onClick={handleSwExpand}
                  disabled={swR >= swStr.length - 1 || swHasDup}
                  className="px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-700 transition-colors"
                >
                  Expand Right (R++)
                </button>
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'monotonic-stack' && (
          <div className="space-y-5 relative z-10">
            <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
              {(cfg.sampleArray ?? [73, 74, 75, 71, 69, 72, 76]).map((temp, i) => {
                const processed = i < msIdx;
                const onStack = msStack.includes(i);
                const isCurrent = i === msIdx;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-center font-mono ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                        : onStack
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                          : processed
                            ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">Day {i}</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{temp}°</div>
                    <div className="text-[11px] mt-1 text-slate-600 dark:text-slate-300">
                      ans: {msAns[i]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Monotonic Decreasing Stack (indices): [
                {msStack.map((i) => `${i}(${(cfg.sampleArray ?? [])[i]}°)`).join(' , ')}]
              </div>
              <button
                type="button"
                onClick={handleMsStep}
                disabled={msIdx >= (cfg.sampleArray?.length ?? 7)}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-700 transition-colors"
              >
                {msIdx >= (cfg.sampleArray?.length ?? 7)
                  ? 'All Days Processed'
                  : `Process Day ${msIdx}`}
              </button>
            </div>
          </div>
        )}

        {cfg.type === 'rain-water' && (
          <div className="space-y-5 relative z-10">
            <div className="flex items-end justify-center gap-2 h-44 pt-4">
              {(cfg.sampleArray ?? []).map((barH, idx) => {
                const water = rwWaterByBar[idx] ?? 0;
                const isL = idx === rwL;
                const isR = idx === rwR;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className="flex flex-col-reverse w-9 sm:w-11 h-32 justify-start items-stretch">
                      <div
                        style={{ height: `${barH * 28}px` }}
                        className={`rounded-t-sm transition-all ${
                          isL || isR
                            ? 'bg-sky-600 dark:bg-sky-400'
                            : 'bg-slate-700 dark:bg-slate-600'
                        }`}
                      />
                      {water > 0 && (
                        <div
                          style={{ height: `${water * 28}px` }}
                          className="bg-cyan-400/75 dark:bg-cyan-500/60 border-t border-cyan-600 flex items-center justify-center text-[10px] font-mono font-bold text-slate-900 dark:text-white"
                        >
                          +{water}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 h-4">
                      {isL && isR ? 'L,R' : isL ? 'L' : isR ? 'R' : idx}
                    </span>
                  </div>
                );
              })}
            </div>
            {rwWarning && (
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg p-3">
                {rwWarning}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                leftMax = {rwLMax} · rightMax = {rwRMax} · Trapped ={' '}
                {Object.values(rwWaterByBar).reduce((a, b) => a + b, 0)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRwStep('L')}
                  disabled={rwL >= rwR}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Step Left (L++)
                </button>
                <button
                  type="button"
                  onClick={() => handleRwStep('R')}
                  disabled={rwL >= rwR}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Step Right (R--)
                </button>
              </div>
            </div>
          </div>
        )}

        {cfg.type === 'coin-change' && (
          <div className="space-y-5 relative z-10">
            <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
              {ccDp.map((val, amt) => {
                const isNext = amt === ccActiveAmount;
                return (
                  <div
                    key={amt}
                    className={`p-3 rounded-lg border text-center font-mono ${
                      isNext
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50'
                        : val !== null
                          ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-[11px] text-slate-500">dp[{amt}]</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
                      {val === null ? '?' : val}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Coins: [1, 3, 4] · Greedy on 6 gives 4+1+1 (3 coins), whereas dp[6] = 1 + dp[3] = 2 coins!
              </div>
              <button
                type="button"
                onClick={handleCcComputeNext}
                disabled={ccActiveAmount > 6}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold disabled:opacity-40 hover:bg-sky-700 transition-colors"
              >
                {ccActiveAmount > 6 ? 'DP Table Complete' : `Compute dp[${ccActiveAmount}]`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Insight Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          {progress.sandboxSolved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                Dry-run intuition verified! Proceed to Plan (Loop Invariant) or build your logic blocks.
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Hint: {cfg.hint}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
