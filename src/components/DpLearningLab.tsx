import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, Code2, Lightbulb, RotateCcw } from 'lucide-react';
import { useAccountState } from '../hooks/useAccountState';
import { DP_PRACTICE_PROBLEMS } from '../data/dpPracticeProblems';

export type DpGuidedLesson = { title: string; idea: string; state: string; recurrence: string; base: string; order: string; complexity: string; java: string; checkpoint: string };
export const DP_GUIDED_LESSONS: DpGuidedLesson[] = [
  { title: '1. What DP actually means', idea: 'Dynamic Programming means solving a smaller question once, saving its answer, and reusing it. Imagine climbing stairs: to reach step n, your last move came from n−1 or n−2. Those smaller answers repeat, so cache them.', state: 'dp[i] = number of different ways to reach stair i.', recurrence: 'dp[i] = dp[i - 1] + dp[i - 2]', base: 'dp[0] = dp[1] = 1 for the recurrence; n must be nonnegative.', order: 'Calculate from i = 2 up to n because each answer needs the previous two.', complexity: 'O(n) additions and O(1) auxiliary space for the rolling version; the long result is checked and the sample accepts n in 0..91.', java: "long climbStairs(int n) {\n    if (n < 0 || n > 91) throw new IllegalArgumentException(\"n must be 0..91 for long\");\n    if (n <= 1) return 1L;\n    long twoBack = 1L, oneBack = 1L;\n    for (int i = 2; i <= n; i++) {\n        long current = Math.addExact(oneBack, twoBack);\n        twoBack = oneBack;\n        oneBack = current;\n    }\n    return oneBack;\n}", checkpoint: 'Can you explain why the answer for step 5 depends only on steps 4 and 3?' },
  { title: '2. Memoization: recursion + cache', idea: 'First write the natural recursive question. Before solving a state, check whether its answer is already stored. This keeps the easy-to-understand recursive structure while removing repeated work.', state: 'solve(i) = number of ways to reach stair i.', recurrence: 'solve(i) = solve(i - 1) + solve(i - 2)', base: 'For n=0 or 1 return 1. Allocate memo with n+1 entries and fill with -1; n must be 0..91.', order: 'The call stack discovers dependencies on demand. Each state is fully calculated once.', complexity: 'O(n) arithmetic operations; O(n) memo plus O(n) recursion stack. The long result is checked; n is limited to 0..91.', java: "long solve(int n, long[] memo) {\n    if (n < 0 || n > 91 || memo == null || memo.length <= n)\n        throw new IllegalArgumentException(\"n must be 0..91 and memo length n+1\");\n    if (n <= 1) return 1L;\n    if (memo[n] != -1L) return memo[n];\n    memo[n] = Math.addExact(solve(n - 1, memo), solve(n - 2, memo));\n    return memo[n];\n}\n// Allocate n+1 entries and fill them with -1 before calling.", checkpoint: 'Why does the cache turn an exponential recursion tree into only n distinct calculations?' },
  { title: '3. Tabulation: build answers bottom-up', idea: 'Instead of asking recursion to discover smaller states, build the table in dependency order. Start with known answers and move toward the target.', state: 'dp[i] = best/number of ways for the prefix ending at i (define the exact meaning for each problem).', recurrence: 'Write the transition using already-computed smaller states.', base: 'Initialise the smallest valid states explicitly before the loop.', order: 'Draw arrows from dependencies to the state. The loop order must process every dependency first.', complexity: 'O(n) checked additions and O(n) table space for this example; the sample limits n to 0..91.', java: "long climbStairsTabulation(int n) {\n    if (n < 0 || n > 91) throw new IllegalArgumentException(\"n must be 0..91 for long\");\n    long[] dp = new long[n + 1];\n    dp[0] = 1L;\n    if (n >= 1) dp[1] = 1L;\n    for (int i = 2; i <= n; i++) {\n        dp[i] = Math.addExact(dp[i - 1], dp[i - 2]);\n    }\n    return dp[n];\n}", checkpoint: 'If dp[i] reads dp[i-1], why must i-1 be calculated first?' },
  { title: '4. Choose / skip: House Robber', idea: 'At each house, choose: rob it and skip the previous house, or skip it and keep the best previous answer. DP compares all legal choices instead of guessing greedily.', state: 'dp[i] = maximum money obtainable from houses 0 through i.', recurrence: 'dp[i] = max(dp[i - 1], money[i] + dp[i - 2])', base: 'dp[0] = money[0]. For one-indexed prefix form: dp[0] = 0, dp[1] = money[0].', order: 'Move left to right. Each state depends on the previous one and two.', complexity: 'O(n) time and O(1) auxiliary space; checked long addition. Empty or all-negative input returns 0 because choosing no house is allowed.', java: "long rob(int[] a) {\n    long twoBack = 0L, oneBack = 0L;\n    for (int money : a) {\n        long take = Math.addExact(twoBack, (long) money);\n        long current = Math.max(oneBack, take);\n        twoBack = oneBack;\n        oneBack = current;\n    }\n    return oneBack;\n}", checkpoint: 'What breaks if you use money[i] + dp[i-1] without skipping the adjacent house?' },
  { title: '5. Grid DP: paths and costs', idea: 'A cell is a state. If you can arrive only from above or from the left, those are the only predecessor states. Obstacles remove a transition; minimum cost changes addition into a min choice.', state: 'For path counting, dp[r][c] is the number of paths to (r,c). Minimum-cost grid DP uses a separate cost state and transition.', recurrence: 'Path count: dp[r][c] = dp[r-1][c] + dp[r][c-1]. Minimum cost: grid[r][c] + min(top, left).', base: 'Start cell has one path (or its own cost). First row/column have only one possible direction; blocked cells are unreachable.', order: 'Row by row, top to bottom and left to right, so top and left are ready.', complexity: 'O(m×n) checked additions and O(n) space for path count; overflow throws instead of wrapping. Use BigInteger for larger exact counts.', java: "long uniquePaths(int m, int n) {\n    if (m <= 0 || n <= 0) throw new IllegalArgumentException(\"dimensions must be positive\");\n    long[] dp = new long[n];\n    Arrays.fill(dp, 1L);\n    for (int r = 1; r < m; r++) {\n        for (int c = 1; c < n; c++) {\n            dp[c] = Math.addExact(dp[c], dp[c - 1]);\n        }\n    }\n    return dp[n - 1];\n}", checkpoint: 'Why does dp[c] still represent the cell above while dp[c-1] already represents the cell on the left?' },
  { title: '6. Knapsack: the loop direction matters', idea: 'For each item, decide whether to take it. In 0/1 knapsack each item can be used once; in unbounded knapsack it may be reused. A one-dimensional array needs a loop direction that preserves the correct previous/current layer.', state: 'dp[c] = maximum value achievable with capacity c after processing some items.', recurrence: '0/1: max(dp[c], value + dp[c-weight]). Unbounded: same formula, but the current item may feed later capacities.', base: 'dp[c] = 0 for all capacities when no items have been processed.', order: '0/1: capacity descends from W to weight. Unbounded: capacity ascends from weight to W.', complexity: 'O(items×W) checked updates and O(W) long space; pseudo-polynomial. Capacity W must be practical to allocate.', java: "long knapsack01(int[] weights, int[] values, int W) {\n    if (W < 0 || weights.length != values.length)\n        throw new IllegalArgumentException(\"invalid capacity or item arrays\");\n    long[] dp = new long[W + 1];\n    for (int i = 0; i < weights.length; i++) {\n        int weight = weights[i];\n        if (weight < 0) throw new IllegalArgumentException(\"negative weight\");\n        for (int c = W; c >= weight; c--) {\n            long take = Math.addExact(dp[c - weight], (long) values[i]);\n            dp[c] = Math.max(dp[c], take);\n        }\n    }\n    return dp[W];\n}", checkpoint: 'What unwanted reuse happens if a 0/1 knapsack capacity loop runs upward?' },
  { title: '7. Strings: LCS and two-dimensional states', idea: 'When two prefixes interact, use two indices. Compare the last characters: if equal, extend the common subsequence; otherwise discard one side and keep the better result.', state: 'dp[i][j] = LCS length between the first i characters of A and first j characters of B.', recurrence: 'If A[i-1] == B[j-1], 1 + dp[i-1][j-1]; otherwise max(dp[i-1][j], dp[i][j-1]).', base: 'dp[0][j] = 0 and dp[i][0] = 0 because an empty string has no non-empty common subsequence.', order: 'Increase i and j from 1. The top, left and diagonal dependencies are already available.', complexity: 'O(n×m) time and O(n×m) space in Unicode code points; code-point matching is not grapheme-cluster matching.', java: "int lcsLength(String a, String b) {\n    int[] acp = a.codePoints().toArray();\n    int[] bcp = b.codePoints().toArray();\n    int[][] dp = new int[acp.length + 1][bcp.length + 1];\n    for (int i = 1; i <= acp.length; i++) {\n        for (int j = 1; j <= bcp.length; j++) {\n            if (acp[i - 1] == bcp[j - 1])\n                dp[i][j] = 1 + dp[i - 1][j - 1];\n            else\n                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n        }\n    }\n    return dp[acp.length][bcp.length];\n}", checkpoint: 'Why do we use i-1 and j-1 to read characters but i and j to index the DP table?' },
  { title: '8. Advanced patterns: intervals, trees, bitmasks', idea: 'Once one-dimensional, grid, knapsack and string DP feel natural, the same state-and-transition method extends to more complex shapes.', state: 'Interval DP: dp[l][r] describes a range. Tree DP: dp[node][choice/state] describes a subtree. Bitmask DP: dp[mask][last] describes a visited subset and endpoint.', recurrence: 'Enumerate the final split, root choice, or next unvisited element; combine valid smaller states.', base: 'Use the smallest interval, leaf node, empty mask or single-element subset as base states.', order: 'Intervals by increasing length; trees postorder; masks in increasing number of set bits or numeric order when dependencies are smaller masks.', complexity: 'For split-based interval DP: O(n³) time and O(n²) table space; tree/bitmask bounds depend on states and transitions.', java: "/* Split-based interval DP skeleton; transition varies by problem. */\nfor (int len = 2; len <= n; len++) {\n    for (int l = 0; l + len <= n; l++) {\n        int r = l + len - 1;\n        // For a split recurrence, try k in [l, r-1].\n        for (int k = l; k < r; k++) {\n            // combine smaller interval states\n        }\n    }\n}", checkpoint: 'What is the meaning of one DP cell before you decide its recurrence?' }
];



const stages = ['Understand the question', 'Define the state', 'Write the transition', 'Set base cases', 'Choose calculation order', 'Code and test', 'Analyse complexity'];
export function DpLearningLab() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stair, setStair] = useState(6);
  const [showAnswer, setShowAnswer] = useState(false);
  const [expandedProblem, setExpandedProblem] = useState<string | null>(null);
  const [completed, setCompleted] = useAccountState<string[]>(
    'dp-practice-completed',
    [],
    'patternforge-dp-practice-v1'
  );
  const [filter, setFilter] = useState('All');
  const validProblemNames = useMemo(() => new Set(DP_PRACTICE_PROBLEMS.map((problem) => problem.name)), []);
  const completedSet = useMemo(() => new Set(completed.filter((name) => validProblemNames.has(name))), [completed, validProblemNames]);
  const doneCount = completedSet.size;
  const lesson = DP_GUIDED_LESSONS[lessonIndex];
  const fib = useMemo(() => { const a = [1, 1]; for (let i = 2; i <= stair; i++) a.push(a[i - 1] + a[i - 2]); return a.slice(0, stair + 1); }, [stair]);
  const groups = ['All', 'Warm-up', 'Core', 'Challenge', 'Advanced'];
  const visibleProblems = DP_PRACTICE_PROBLEMS.filter((problem) => filter === 'All' || problem.level === filter);
  const toggle = (item: string) =>
    setCompleted((old) => (old.includes(item) ? old.filter((x) => x !== item) : [...new Set([...old, item])]));
  return <section className="space-y-5">
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-300"><Lightbulb className="h-4 w-4" /> Interactive DP learning path</div>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Understand DP one decision at a time</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Do not memorise 20 formulas. Learn one repeatable recipe: state → choices → recurrence → base cases → order → complexity. Start with tiny examples, then increase the pattern difficulty.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-4">{['1. Describe a smaller question','2. Reuse its answer','3. Combine smaller answers','4. Build the final answer'].map((x) => <div key={x} className="rounded-lg bg-white/10 p-3 text-xs font-semibold">{x}</div>)}</div>
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-indigo-600">See the answers grow</div><h3 className="mt-1 text-lg font-bold">Climbing stairs visualiser</h3></div><button type="button" onClick={() => setStair(6)} className="inline-flex items-center gap-1 text-xs text-slate-500"><RotateCcw className="h-3.5 w-3.5" /> Reset</button></div>
        <p className="mt-2 text-sm text-slate-500">Each stair can be reached from the previous one or two stairs. Move the slider and inspect how every answer reuses earlier answers.</p>
        <input aria-label="Number of stairs" type="range" min="1" max="10" value={stair} onChange={(e) => setStair(Number(e.target.value))} className="mt-4 w-full accent-indigo-600" />
        <div className="flex justify-between text-xs text-slate-500"><span>1 stair</span><strong>{stair} stairs</strong><span>10 stairs</span></div>
        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">{fib.map((v, i) => <div key={i} className={i === stair ? 'rounded-xl border-2 border-indigo-500 bg-indigo-50 p-3 text-center dark:bg-indigo-950' : 'rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700'}><div className="text-[10px] text-slate-400">dp[{i}]</div><div className="mt-1 text-lg font-bold tabular-nums">{v}</div></div>)}</div>
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{stair <= 1 ? `Base case: dp[${stair}] = 1 way.` : `For ${stair} stairs: dp[${stair}] = dp[${stair - 1}] + dp[${stair - 2}] = ${fib[stair]} ways.`}</p>
      </article>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">The DP recipe</div><h3 className="mt-1 text-lg font-bold">Ask these 7 questions</h3>
        <ol className="mt-4 space-y-3">{stages.map((s, i) => <li key={s} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{i + 1}</span><span>{s}</span></li>)}</ol>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">If you cannot explain what dp[i] means in one sentence, stop. Do not start coding yet.</p>
      </article>
    </div>

    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Guided lessons · {lessonIndex + 1} of {DP_GUIDED_LESSONS.length}</div><h3 className="mt-1 text-xl font-bold">{lesson.title}</h3></div><div className="flex gap-2"><button type="button" disabled={lessonIndex === 0} onClick={() => { setLessonIndex((x) => x - 1); setShowAnswer(false); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-30"><ChevronLeft className="inline h-4 w-4" /> Back</button><button type="button" disabled={lessonIndex === DP_GUIDED_LESSONS.length - 1} onClick={() => { setLessonIndex((x) => x + 1); setShowAnswer(false); }} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-30">Next <ChevronRight className="inline h-4 w-4" /></button></div></div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{lesson.idea}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{[['State', lesson.state],['Transition / recurrence', lesson.recurrence],['Base cases', lesson.base],['Evaluation order', lesson.order],['Complexity', lesson.complexity]].map(([title, body]) => <div key={title} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">{title}</h4><p className="mt-2 text-sm leading-relaxed">{body}</p></div>)}</div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><div className="flex items-center gap-2 border-b border-slate-200 p-3 text-sm font-semibold dark:border-slate-700"><Code2 className="h-4 w-4" /> Java example</div><pre tabIndex={0} aria-label={`Java code example for ${lesson.title}`} className="overflow-x-auto bg-slate-950 p-4 text-xs leading-relaxed text-emerald-200"><code>{lesson.java}</code></pre></div>
      <div className="mt-4 rounded-xl border border-indigo-200 p-4 dark:border-indigo-900"><div className="flex items-center gap-2 text-sm font-bold"><BookOpen className="h-4 w-4 text-indigo-600" /> Check your understanding</div><p className="mt-2 text-sm">{lesson.checkpoint}</p><button type="button" onClick={() => setShowAnswer((x) => !x)} aria-expanded={showAnswer} aria-controls="dp-lesson-hint" className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">{showAnswer ? 'Hide hint' : 'Show hint'}</button><div id="dp-lesson-hint" hidden={!showAnswer}>{showAnswer ? <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Trace the recurrence with a tiny input (0, 1, 2 or 3). Write down exactly what each state means, which earlier states it reads, and why those states are ready before this one.</p> : null}</div></div>
      <div className="mt-4 flex flex-wrap gap-2">{DP_GUIDED_LESSONS.map((x, i) => <button key={x.title} onClick={() => { setLessonIndex(i); setShowAnswer(false); }} aria-label={x.title} className={i === lessonIndex ? 'h-2.5 w-8 rounded-full bg-indigo-600' : 'h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600'} />)}</div>
    </article>

    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Practice roadmap</div><h3 className="mt-1 text-xl font-bold">{DP_PRACTICE_PROBLEMS.length} problems in learning order</h3><p className="mt-1 text-xs text-slate-500">Solve in order. Mark complete only after you can derive the state and recurrence without hints.</p></div><span className="text-sm font-bold tabular-nums">{doneCount}/{DP_PRACTICE_PROBLEMS.length}</span></div>
      <div className="mt-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(g)}
            aria-pressed={filter === g}
            className={
              filter === g
                ? 'rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white'
                : 'rounded-md border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300'
            }
          >
            {g}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {visibleProblems.map(([level, name, goal]) => (
          <div
            key={name}
            className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
          >
            <button
              type="button"
              onClick={() => toggle(name)}
              aria-label={'Mark ' + name + ' complete'}
              className={completed.includes(name) ? 'mt-0.5 text-emerald-500' : 'mt-0.5 text-slate-300'}
            >
              <CheckCircle2 className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{name}</span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">· {level}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{goal}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  </section>;
}
