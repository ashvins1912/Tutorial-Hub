import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';

export const SPECIALIST_9_ALGORITHMS: AlgorithmDefinition[] = [
  // 46. Monotonic Deque (Sliding Window Extrema)
  {
    id: 'monotonic-deque',
    name: 'Monotonic Deque (Sliding Window Extrema)',
    shortName: 'Monotonic Deque',
    category: 'Array & String Patterns',
    visualType: 'monotonic-stack',
    tagline: 'Track the maximum or minimum of every size-K sliding window in true O(N) time.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K)',
    complexityLeap: 'O(N·K) per-window scan or O(N log K) heap → O(N) amortized double-ended queue',
    coreIdea:
      'Store array INDICES in a double-ended queue sorted in strictly decreasing order of value. Expire indices that fall off the left of the window from the front, and evict smaller (dominated) values from the back before pushing the new index—so the front is ALWAYS the current window maximum in O(1).',
    mentalModelSteps: [
      'Maintain a deque of indices whose values stay strictly decreasing from front to back.',
      'Step 1 (Expire Front): If deque[0] <= i - k, shift it out because it left the window.',
      'Step 2 (Evict Dominated Back): While nums[deque.back] <= nums[i], pop from back because nums[i] is both larger AND expires later.',
      'Step 3 (Push & Read): Push i to back; once i >= k - 1, record nums[deque[0]] as the window maximum.',
    ],
    loopInvariant:
      'At the end of iteration i, every index in the deque lies inside [i - k + 1, i], indices increase front-to-back, and their values strictly decrease front-to-back.',
    whenToUse: [
      'Maximum or minimum over every contiguous sliding window of fixed size K in O(N).',
      'Longest subarray where max(window) - min(window) <= limit (using two monotonic deques).',
      'DP transitions taking max/min over a sliding window dp[i - k .. i - 1] (Jump Game VI, Constrained Subsequence Sum).',
    ],
    whenItFails:
      'Do not use when elements are queried over arbitrary non-sliding ranges [L, R] (use Segment Tree / Sparse Table) or when you need the median instead of min/max (use Dual Heaps).',
    linkedTopics: ['Sliding Window', 'Monotonic Stack'],
    linkedProblemSlugs: ['longest-substring-without-repeating', 'daily-temperatures', 'minimum-window-substring'],
    templates: {
      python: `from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq = deque()  # stores indices with decreasing values
    out = []
    for i, val in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= val:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      js: `function maxSlidingWindow(nums, k) {
  const dq = []; // indices with strictly decreasing values
  let head = 0;
  const out = [];
  for (let i = 0; i < nums.length; i++) {
    if (head < dq.length && dq[head] <= i - k) head++;
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) {
      dq.pop();
    }
    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}`,
      java: `public int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>();
    int[] out = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1) out[i - k + 1] = nums[dq.peekFirst()];
    }
    return out;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Seed First Window [1, 3, -1] (k = 3)',
        explanation: 'i=0 pushes 1; i=1 sees 3 >= 1 so 1 is evicted permanently; i=2 pushes -1 behind 3. Window max is front = 3.',
        invariantCheck: 'Deque values [3, -1] are strictly decreasing; all indices inside [0..2].',
        variables: [{ name: 'i', value: '2' }, { name: 'deque idx', value: '[1, 2]' }, { name: 'out', value: '[3]' }],
        array: [1, 3, -1, -3, 5, 3],
        windowRange: [0, 2],
        pointers: [{ label: 'i', index: 2, tone: 'sky' }],
        stackItems: [{ label: 'idx 1 (3)', sub: 'front MAX', active: true }, { label: 'idx 2 (-1)', sub: 'backup' }],
      },
      {
        step: 2,
        title: 'Slide to [3, -1, -3]: Keep Decreasing Tail',
        explanation: 'idx 1 is still inside [1..3] (1 > 3 - 3). -3 < -1 so append idx 3. Window max remains front = 3.',
        invariantCheck: 'Deque values [3, -1, -3] stay strictly decreasing.',
        variables: [{ name: 'i', value: '3' }, { name: 'deque idx', value: '[1, 2, 3]' }, { name: 'out', value: '[3, 3]' }],
        array: [1, 3, -1, -3, 5, 3],
        windowRange: [1, 3],
        pointers: [{ label: 'i', index: 3, tone: 'sky' }],
        stackItems: [{ label: 'idx 1 (3)', sub: 'front MAX', active: true }, { label: 'idx 2 (-1)', sub: 'mid' }, { label: 'idx 3 (-3)', sub: 'back' }],
      },
      {
        step: 3,
        title: 'Slide to [-1, -3, 5]: Expire Front + Evict All Smaller',
        explanation: 'idx 1 <= 4 - 3 expires from front. Then 5 >= -3 and 5 >= -1, evicting BOTH from back! Deque holds only [idx 4 (5)].',
        invariantCheck: 'Every element is pushed once and popped at most once → O(N) total.',
        variables: [{ name: 'i', value: '4' }, { name: 'deque idx', value: '[4]' }, { name: 'out', value: '[3, 3, 5]' }],
        array: [1, 3, -1, -3, 5, 3],
        windowRange: [2, 4],
        pointers: [{ label: 'i', index: 4, tone: 'emerald' }],
        matchedIndices: [4],
        stackItems: [{ label: 'idx 4 (5)', sub: 'front MAX', active: true }],
      },
      {
        step: 4,
        title: 'Final Window [-3, 5, 3]: Push 3 Behind 5 → Max = 5',
        explanation: 'idx 4 is valid in [3..5]. 3 < 5 so push idx 5 as backup. Output complete: [3, 3, 5, 5].',
        invariantCheck: 'Total push + pop operations <= 2N across entire array.',
        variables: [{ name: 'i', value: '5' }, { name: 'deque idx', value: '[4, 5]' }, { name: 'out', value: '[3, 3, 5, 5]' }],
        array: [1, 3, -1, -3, 5, 3],
        windowRange: [3, 5],
        pointers: [{ label: 'i', index: 5, tone: 'emerald' }],
        matchedIndices: [4],
        stackItems: [{ label: 'idx 4 (5)', sub: 'front MAX', active: true }, { label: 'idx 5 (3)', sub: 'backup' }],
      },
    ],
  },

  // 47. 0-1 BFS (Deque Shortest Path)
  {
    id: 'zero-one-bfs',
    name: '0-1 BFS (Deque Shortest Path)',
    shortName: '0-1 BFS',
    category: 'Advanced Graph Algorithms',
    visualType: 'weighted-network',
    tagline: 'Compute shortest paths on graphs with edge weights strictly in {0, 1} in O(V + E)—beating Dijkstra.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    complexityLeap: 'O((V + E) log V) Dijkstra heap → O(V + E) double-ended queue without log V overhead',
    coreIdea:
      'When every edge costs either 0 or 1, the deque only ever holds vertices at distance d or d + 1. Push weight-0 neighbors to the FRONT of the deque (same distance wave) and weight-1 neighbors to the BACK (next distance wave) to preserve exact shortest-first order in O(1).',
    mentalModelSteps: [
      'Initialize dist[src] = 0, all other dist = Infinity, and push src to a deque.',
      'Pop node u from the FRONT of the deque (guaranteed minimum unsettled distance).',
      'For each edge (u, v, w) where w ∈ {0, 1}: if dist[u] + w < dist[v], update dist[v] = dist[u] + w.',
      'If w == 0, push v to the FRONT (same cost wave); if w == 1, push v to the BACK (cost + 1 wave).',
    ],
    loopInvariant:
      'At every iteration, the deque contains distances in non-decreasing order consisting of at most two distinct values: d (at front) and d + 1 (at back).',
    whenToUse: [
      'Shortest path in a grid where moving along an arrow costs 0 and flipping an arrow costs 1 (LC 1368).',
      'Minimum obstacles to remove to reach corner of a binary grid (empty cell = 0, wall = 1, LC 2290).',
      'Switching graph states where free transitions cost 0 and paid transitions cost 1.',
    ],
    whenItFails:
      'Fails immediately if any edge weight is outside {0, 1} (e.g., weights 2, 5, or negative weights). Upgrade to Dijkstra for general non-negative weights or Bellman-Ford for negative weights.',
    linkedTopics: ['Union-Find & Shortest Path', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['network-delay-time', 'swim-in-rising-water', 'word-ladder'],
    templates: {
      python: `from collections import deque

def zero_one_bfs(n: int, adj: list[list[tuple[int, int]]], src: int) -> list[int]:
    dist = [float('inf')] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        u = dq.popleft()
        for v, w in adj[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist`,
      js: `function zeroOneBfs(n, adj, src) {
  const dist = Array(n).fill(Infinity);
  dist[src] = 0;
  const dq = [src];
  while (dq.length) {
    const u = dq.shift();
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        if (w === 0) dq.unshift(v);
        else dq.push(v);
      }
    }
  }
  return dist;
}`,
      java: `public int[] zeroOneBfs(int n, List<int[]>[] adj, int src) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;
    Deque<Integer> dq = new ArrayDeque<>();
    dq.offerFirst(src);
    while (!dq.isEmpty()) {
        int u = dq.pollFirst();
        for (int[] e : adj[u]) {
            int v = e[0], w = e[1];
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                if (w == 0) dq.offerFirst(v);
                else dq.offerLast(v);
            }
        }
    }
    return dist;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Seed Source S at Distance 0',
        explanation: 'Start with deque = [S]. Free edges (w=0) go to FRONT; paid edges (w=1) go to BACK.',
        invariantCheck: 'Deque holds single distance wave d = 0.',
        variables: [{ name: 'pop front', value: 'S (0)' }, { name: 'deque', value: '[S]' }],
        activeNodes: ['S'],
        nodeBadges: { S: '0', A: '∞', B: '∞', T: '∞' },
        graphSpec: {
          caption: 'Binary-Weight Graph (w ∈ {0, 1})',
          nodes: [
            { id: 'S', x: 70, y: 110 },
            { id: 'A', x: 200, y: 55 },
            { id: 'B', x: 200, y: 165 },
            { id: 'T', x: 330, y: 110 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '1', directed: true },
            { u: 'S', v: 'B', label: '0', directed: true },
            { u: 'A', v: 'T', label: '1', directed: true },
            { u: 'B', v: 'T', label: '0', directed: true },
          ],
        },
      },
      {
        step: 2,
        title: 'Relax S: Push B(0) to FRONT, A(1) to BACK',
        explanation: 'Edge S→A has w=1 → append A to back. Edge S→B has w=0 → push B to FRONT so B settles before A!',
        invariantCheck: 'Deque = [B(0), A(1)] stays sorted without any heap log factor.',
        variables: [{ name: 'w=0 front', value: 'B(0)' }, { name: 'w=1 back', value: 'A(1)' }, { name: 'deque', value: '[B, A]' }],
        visitedNodes: ['S'],
        activeNodes: ['B', 'A'],
        activeEdges: ['S-B', 'S-A'],
        nodeBadges: { S: '0', A: '1', B: '0', T: '∞' },
        graphSpec: {
          caption: 'w=0 jumps to front · w=1 queues at back',
          nodes: [
            { id: 'S', x: 70, y: 110 },
            { id: 'A', x: 200, y: 55 },
            { id: 'B', x: 200, y: 165 },
            { id: 'T', x: 330, y: 110 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '1', directed: true },
            { u: 'S', v: 'B', label: '0', directed: true },
            { u: 'A', v: 'T', label: '1', directed: true },
            { u: 'B', v: 'T', label: '0', directed: true },
          ],
        },
      },
      {
        step: 3,
        title: 'Pop B(0) → Free Edge B→T Pushes T(0) to FRONT',
        explanation: 'B settles at cost 0 and discovers T via w=0! T jumps ahead of A(1) straight to the front.',
        invariantCheck: 'dist[T] = 0 discovered before inspecting any d = 1 node.',
        variables: [{ name: 'pop front', value: 'B (0)' }, { name: 'dist[T]', value: '0' }, { name: 'deque', value: '[T, A]' }],
        visitedNodes: ['S', 'B'],
        activeNodes: ['T'],
        activeEdges: ['B-T'],
        nodeBadges: { S: '0', A: '1', B: '0', T: '0' },
        graphSpec: {
          caption: 'Zero-cost path S → B → T settles at cost 0',
          nodes: [
            { id: 'S', x: 70, y: 110 },
            { id: 'A', x: 200, y: 55 },
            { id: 'B', x: 200, y: 165 },
            { id: 'T', x: 330, y: 110 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '1', directed: true },
            { u: 'S', v: 'B', label: '0', directed: true },
            { u: 'A', v: 'T', label: '1', directed: true },
            { u: 'B', v: 'T', label: '0', directed: true },
          ],
        },
      },
      {
        step: 4,
        title: 'Settle T(0) & Skip Worse Path via A(1)',
        explanation: 'A→T yields 1 + 1 = 2 which is not < dist[T] = 0, so T is untouched. Complete in linear O(V + E)!',
        invariantCheck: 'Every vertex settled with exact shortest binary-weight distance.',
        variables: [{ name: 'dist', value: '[S:0, A:1, B:0, T:0]' }, { name: 'time', value: 'O(V + E)' }],
        visitedNodes: ['S', 'B', 'T', 'A'],
        nodeBadges: { S: '0', A: '1', B: '0', T: '0' },
        graphSpec: {
          caption: 'All shortest distances finalized in O(V + E)',
          nodes: [
            { id: 'S', x: 70, y: 110 },
            { id: 'A', x: 200, y: 55 },
            { id: 'B', x: 200, y: 165 },
            { id: 'T', x: 330, y: 110 },
          ],
          edges: [
            { u: 'S', v: 'A', label: '1', directed: true },
            { u: 'S', v: 'B', label: '0', directed: true },
            { u: 'A', v: 'T', label: '1', directed: true },
            { u: 'B', v: 'T', label: '0', directed: true },
          ],
        },
      },
    ],
  },

  // 48. Bidirectional BFS
  {
    id: 'bidirectional-bfs',
    name: 'Bidirectional BFS (Meet-in-Middle Wave)',
    shortName: 'Bidirectional BFS',
    category: 'Tree & Graph Traversal',
    visualType: 'weighted-network',
    tagline: 'Expand unweighted BFS from BOTH start and target simultaneously, slashing O(b^d) states to O(b^(d/2)).',
    timeComplexity: 'O(b^(d/2))',
    spaceComplexity: 'O(b^(d/2))',
    complexityLeap: 'O(b^d) single-source explosion → O(2 · b^(d/2)) colliding frontiers',
    coreIdea:
      'When both start and target states are known upfront in an unweighted graph, expand two hash sets (frontWave and backWave). Always expand the SMALLER frontier by one level; the moment a generated neighbor exists in the opposite frontier, the shortest path is found.',
    mentalModelSteps: [
      'Confirm target exists in the valid state space; initialize front = {start}, back = {target}, visited = {start, target}.',
      'At each step, if front.size > back.size, swap(front, back) so we always expand the cheaper frontier.',
      'Build nextWave from all valid 1-step neighbors of nodes in front.',
      'If any neighbor is inside back, return steps + 1 immediately; otherwise mark visited and set front = nextWave.',
    ],
    loopInvariant:
      'After k total frontier expansions, front and back cover radii r1 and r2 with r1 + r2 = k; first overlap occurs at the exact minimum distance.',
    whenToUse: [
      'Word Ladder (LC 127) and Open the Lock (LC 752) where branching factor b is huge and target is known.',
      'Shortest path between two specific users in a massive social graph (degrees of separation).',
      'Unweighted puzzle state graphs (sliding puzzle, knight moves) with reversible transitions.',
    ],
    whenItFails:
      'Cannot be used when the target state is unknown (e.g., "nearest exit" or multi-destination search) or when reverse edges cannot be generated cleanly.',
    linkedTopics: ['Union-Find & Shortest Path', 'Graphs & Topo Sort'],
    linkedProblemSlugs: ['word-ladder', 'find-if-path-exists', 'flood-fill'],
    templates: {
      python: `def ladder_length(begin: str, end: str, word_list: list[str]) -> int:
    words = set(word_list)
    if end not in words:
        return 0
    front, back = {begin}, {end}
    steps = 1
    while front and back:
        if len(front) > len(back):
            front, back = back, front
        nxt = set()
        for w in front:
            for i in range(len(w)):
                for ch in 'abcdefghijklmnopqrstuvwxyz':
                    cand = w[:i] + ch + w[i+1:]
                    if cand in back:
                        return steps + 1
                    if cand in words:
                        words.remove(cand)
                        nxt.add(cand)
        front = nxt
        steps += 1
    return 0`,
      js: `function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  let front = new Set([beginWord]);
  let back = new Set([endWord]);
  words.delete(beginWord);
  words.delete(endWord);
  let steps = 1;
  while (front.size && back.size) {
    if (front.size > back.size) [front, back] = [back, front];
    const next = new Set();
    for (const w of front) {
      for (let i = 0; i < w.length; i++) {
        for (let c = 97; c <= 122; c++) {
          const cand = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);
          if (back.has(cand)) return steps + 1;
          if (words.has(cand)) {
            words.delete(cand);
            next.add(cand);
          }
        }
      }
    }
    front = next;
    steps++;
  }
  return 0;
}`,
      java: `public int ladderLength(String begin, String end, List<String> wordList) {
    Set<String> dict = new HashSet<>(wordList);
    if (!dict.contains(end)) return 0;
    Set<String> front = new HashSet<>(List.of(begin));
    Set<String> back = new HashSet<>(List.of(end));
    dict.remove(begin); dict.remove(end);
    int steps = 1;
    while (!front.isEmpty() && !back.isEmpty()) {
        if (front.size() > back.size()) { var t = front; front = back; back = t; }
        Set<String> next = new HashSet<>();
        for (String w : front) {
            char[] arr = w.toCharArray();
            for (int i = 0; i < arr.length; i++) {
                char orig = arr[i];
                for (char c = 'a'; c <= 'z'; c++) {
                    arr[i] = c;
                    String cand = new String(arr);
                    if (back.contains(cand)) return steps + 1;
                    if (dict.remove(cand)) next.add(cand);
                }
                arr[i] = orig;
            }
        }
        front = next;
        steps++;
    }
    return 0;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Initialize Dual Frontiers: front={hit}, back={cog}',
        explanation: 'Instead of growing one giant circle of radius 4 from "hit", grow two tiny circles from "hit" and "cog".',
        invariantCheck: 'steps = 1; both frontiers size 1.',
        variables: [{ name: 'front', value: '{hit}' }, { name: 'back', value: '{cog}' }, { name: 'steps', value: '1' }],
        activeNodes: ['hit', 'cog'],
        nodeBadges: { hit: 'F0', hot: '?', dot: '?', dog: '?', cog: 'B0' },
        graphSpec: {
          caption: 'Word Ladder Bidirectional Frontier',
          nodes: [
            { id: 'hit', x: 55, y: 110 },
            { id: 'hot', x: 135, y: 110 },
            { id: 'dot', x: 215, y: 65 },
            { id: 'dog', x: 295, y: 65 },
            { id: 'cog', x: 365, y: 110 },
          ],
          edges: [
            { u: 'hit', v: 'hot' },
            { u: 'hot', v: 'dot' },
            { u: 'dot', v: 'dog' },
            { u: 'dog', v: 'cog' },
          ],
        },
      },
      {
        step: 2,
        title: 'Expand Front (hit → hot) · steps = 2',
        explanation: '1-letter mutation from "hit" discovers "hot". Remove "hot" from dictionary to mark visited.',
        invariantCheck: 'Front radius = 1, Back radius = 0.',
        variables: [{ name: 'front', value: '{hot}' }, { name: 'back', value: '{cog}' }, { name: 'steps', value: '2' }],
        visitedNodes: ['hit'],
        activeNodes: ['hot', 'cog'],
        activeEdges: ['hit-hot'],
        nodeBadges: { hit: 'F0', hot: 'F1', dot: '?', dog: '?', cog: 'B0' },
        graphSpec: {
          caption: 'Front expands 1 hop to hot',
          nodes: [
            { id: 'hit', x: 55, y: 110 },
            { id: 'hot', x: 135, y: 110 },
            { id: 'dot', x: 215, y: 65 },
            { id: 'dog', x: 295, y: 65 },
            { id: 'cog', x: 365, y: 110 },
          ],
          edges: [
            { u: 'hit', v: 'hot' },
            { u: 'hot', v: 'dot' },
            { u: 'dot', v: 'dog' },
            { u: 'dog', v: 'cog' },
          ],
        },
      },
      {
        step: 3,
        title: 'Expand Smaller Back (cog → dog) · steps = 3',
        explanation: 'Swap to expand back frontier {cog} → discovers "dog". Both waves now sit one hop apart.',
        invariantCheck: 'Always expanding min(|front|, |back|) keeps search tree balanced.',
        variables: [{ name: 'front', value: '{hot}' }, { name: 'back', value: '{dog}' }, { name: 'steps', value: '3' }],
        visitedNodes: ['hit', 'cog'],
        activeNodes: ['hot', 'dog'],
        activeEdges: ['dog-cog'],
        nodeBadges: { hit: 'F0', hot: 'F1', dot: '?', dog: 'B1', cog: 'B0' },
        graphSpec: {
          caption: 'Back wave advances inward to dog',
          nodes: [
            { id: 'hit', x: 55, y: 110 },
            { id: 'hot', x: 135, y: 110 },
            { id: 'dot', x: 215, y: 65 },
            { id: 'dog', x: 295, y: 65 },
            { id: 'cog', x: 365, y: 110 },
          ],
          edges: [
            { u: 'hit', v: 'hot' },
            { u: 'hot', v: 'dot' },
            { u: 'dot', v: 'dog' },
            { u: 'dog', v: 'cog' },
          ],
        },
      },
      {
        step: 4,
        title: 'Waves Collide at "dot" → Shortest Length = 5!',
        explanation: 'Front expands hot→dot (steps=4), then dot→dog hits back={dog}! Return 4 + 1 = 5 immediately.',
        invariantCheck: 'Collision guarantees exact shortest unweighted path length.',
        variables: [{ name: 'meet', value: 'dot ↔ dog' }, { name: 'answer', value: '5' }],
        visitedNodes: ['hit', 'hot', 'dot', 'dog', 'cog'],
        activeEdges: ['hot-dot', 'dot-dog'],
        nodeBadges: { hit: '1', hot: '2', dot: '3', dog: '4', cog: '5' },
        graphSpec: {
          caption: 'Frontiers collide: hit → hot → dot → dog → cog (length 5)',
          nodes: [
            { id: 'hit', x: 55, y: 110 },
            { id: 'hot', x: 135, y: 110 },
            { id: 'dot', x: 215, y: 65 },
            { id: 'dog', x: 295, y: 65 },
            { id: 'cog', x: 365, y: 110 },
          ],
          edges: [
            { u: 'hit', v: 'hot' },
            { u: 'hot', v: 'dot' },
            { u: 'dot', v: 'dog' },
            { u: 'dog', v: 'cog' },
          ],
        },
      },
    ],
  },

  // 49. Kruskal's MST (Sorted Edges + DSU)
  {
    id: 'kruskals-mst',
    name: 'Kruskal’s Minimum Spanning Tree (DSU)',
    shortName: 'Kruskal MST',
    category: 'Advanced Graph Algorithms',
    visualType: 'weighted-network',
    tagline: 'Sort all edges by weight and greedily accept every edge that bridges two disconnected DSU components.',
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V + E)',
    complexityLeap: 'Exponential subset of spanning trees → O(E log E) greedy edge sort + O(α(V)) DSU cycle check',
    coreIdea:
      'Sort every undirected edge from cheapest to most expensive. Walk the sorted edge list using Union-Find (DSU): if the two endpoints belong to different components, accept the edge into the MST and union them; otherwise skip it because it would form a cycle. Stop as soon as V - 1 edges are accepted.',
    mentalModelSteps: [
      'Sort all edges [u, v, weight] ascending by weight in O(E log E).',
      'Initialize a Union-Find (DSU) with V isolated vertices.',
      'For each edge (u, v, w): if find(u) != find(v), union them, add w to totalCost, and increment edgesUsed.',
      'Stop early once edgesUsed == V - 1; if edgesUsed < V - 1 after scanning all edges, the graph is disconnected.',
    ],
    loopInvariant:
      'By the Cut Property, every accepted cheapest cross-component edge belongs to at least one optimal Minimum Spanning Tree.',
    whenToUse: [
      'Sparse graphs given directly as an edge list (Connecting Cities With Minimum Cost, LC 1135).',
      'Finding critical / pseudo-critical MST edges (LC 1489) or minimum spanning forest with K components.',
      'Water distribution / cable wiring where edges have fixed installation costs.',
    ],
    whenItFails:
      'On dense complete graphs (E ≈ V² like LC 1584 with V=1000 points), generating & sorting all V² edges uses O(V²) memory—Prim’s MST without storing all edges uses O(V) space and runs faster.',
    linkedTopics: ['Union-Find & Shortest Path'],
    linkedProblemSlugs: ['find-if-path-exists', 'network-delay-time', 'swim-in-rising-water'],
    templates: {
      python: `def kruskal_mst(n: int, edges: list[list[int]]) -> int:
    edges.sort(key=lambda e: e[2])
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = used = 0
    for u, v, w in edges:
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            used += 1
            if used == n - 1:
                return total
    return -1`,
      js: `function kruskalMst(n, edges) {
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let total = 0, used = 0;
  for (const [u, v, w] of sorted) {
    const ru = find(u), rv = find(v);
    if (ru !== rv) {
      parent[ru] = rv;
      total += w;
      used++;
      if (used === n - 1) return total;
    }
  }
  return n <= 1 ? 0 : -1;
}`,
      java: `public int kruskalMst(int n, int[][] edges) {
    Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
    int[] p = new int[n];
    for (int i = 0; i < n; i++) p[i] = i;
    int total = 0, used = 0;
    for (int[] e : edges) {
        int ru = find(p, e[0]), rv = find(p, e[1]);
        if (ru != rv) {
            p[ru] = rv;
            total += e[2];
            if (++used == n - 1) return total;
        }
    }
    return n <= 1 ? 0 : -1;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Sort All Edges Ascending by Cost',
        explanation: 'Sorted order: (A-B:1), (B-C:2), (A-C:3), (C-D:4), (B-D:5). Each vertex starts in its own DSU set.',
        invariantCheck: '4 vertices need exactly V - 1 = 3 acyclic edges.',
        variables: [{ name: 'edgesUsed', value: '0 / 3' }, { name: 'mstCost', value: '0' }],
        nodeBadges: { A: 'set A', B: 'set B', C: 'set C', D: 'set D' },
        graphSpec: {
          caption: 'Undirected Weighted Graph (4 vertices)',
          nodes: [
            { id: 'A', x: 80, y: 65 },
            { id: 'B', x: 210, y: 65 },
            { id: 'C', x: 210, y: 165 },
            { id: 'D', x: 340, y: 115 },
          ],
          edges: [
            { u: 'A', v: 'B', label: '1' },
            { u: 'B', v: 'C', label: '2' },
            { u: 'A', v: 'C', label: '3' },
            { u: 'C', v: 'D', label: '4' },
            { u: 'B', v: 'D', label: '5' },
          ],
        },
      },
      {
        step: 2,
        title: 'Accept Cheapest Edges (A-B:1) & (B-C:2)',
        explanation: 'find(A) != find(B) → accept cost 1. Next find(B) != find(C) → accept cost 2. Component {A,B,C} formed.',
        invariantCheck: 'No cycles created; mstCost = 3, edgesUsed = 2.',
        variables: [{ name: 'accepted', value: 'A-B(1), B-C(2)' }, { name: 'mstCost', value: '3' }],
        visitedNodes: ['A', 'B', 'C'],
        activeEdges: ['A-B', 'B-C'],
        nodeBadges: { A: 'root A', B: 'root A', C: 'root A', D: 'set D' },
        graphSpec: {
          caption: 'Two lightest edges merge {A, B, C}',
          nodes: [
            { id: 'A', x: 80, y: 65 },
            { id: 'B', x: 210, y: 65 },
            { id: 'C', x: 210, y: 165 },
            { id: 'D', x: 340, y: 115 },
          ],
          edges: [
            { u: 'A', v: 'B', label: '1' },
            { u: 'B', v: 'C', label: '2' },
            { u: 'A', v: 'C', label: '3', dashed: true },
            { u: 'C', v: 'D', label: '4' },
            { u: 'B', v: 'D', label: '5' },
          ],
        },
      },
      {
        step: 3,
        title: 'Reject Cycle Edge (A-C:3) via DSU in O(1)',
        explanation: 'find(A) === find(C) === root A! Accepting A-C would create a cycle A-B-C-A, so skip it immediately.',
        invariantCheck: 'DSU rejects cycle edges in O(α(V)) amortized time.',
        variables: [{ name: 'skipped', value: 'A-C (cycle!)' }, { name: 'mstCost', value: '3' }],
        visitedNodes: ['A', 'B', 'C'],
        activeEdges: ['A-B', 'B-C'],
        nodeBadges: { A: 'root A', B: 'root A', C: 'root A', D: 'set D' },
        graphSpec: {
          caption: 'Edge A-C (3) rejected: both endpoints share root A',
          nodes: [
            { id: 'A', x: 80, y: 65 },
            { id: 'B', x: 210, y: 65 },
            { id: 'C', x: 210, y: 165 },
            { id: 'D', x: 340, y: 115 },
          ],
          edges: [
            { u: 'A', v: 'B', label: '1' },
            { u: 'B', v: 'C', label: '2' },
            { u: 'A', v: 'C', label: '3 ✗', dashed: true },
            { u: 'C', v: 'D', label: '4' },
            { u: 'B', v: 'D', label: '5' },
          ],
        },
      },
      {
        step: 4,
        title: 'Accept (C-D:4) → 3 Edges Complete MST = 7!',
        explanation: 'find(C) != find(D) → accept cost 4. edgesUsed hits V - 1 = 3, so stop early without inspecting B-D(5)!',
        invariantCheck: 'Optimal MST total weight = 1 + 2 + 4 = 7.',
        variables: [{ name: 'edgesUsed', value: '3 / 3' }, { name: 'mstCost', value: '7' }],
        visitedNodes: ['A', 'B', 'C', 'D'],
        activeEdges: ['A-B', 'B-C', 'C-D'],
        nodeBadges: { A: 'MST', B: 'MST', C: 'MST', D: 'MST' },
        graphSpec: {
          caption: 'MST Complete: A-B(1) + B-C(2) + C-D(4) = 7',
          nodes: [
            { id: 'A', x: 80, y: 65 },
            { id: 'B', x: 210, y: 65 },
            { id: 'C', x: 210, y: 165 },
            { id: 'D', x: 340, y: 115 },
          ],
          edges: [
            { u: 'A', v: 'B', label: '1' },
            { u: 'B', v: 'C', label: '2' },
            { u: 'C', v: 'D', label: '4' },
          ],
        },
      },
    ],
  },

  // 50. Bipartite Graph Coloring (2-Coloring BFS/DFS)
  {
    id: 'bipartite-graph-coloring',
    name: 'Bipartite Graph 2-Coloring',
    shortName: 'Bipartite 2-Color',
    category: 'Tree & Graph Traversal',
    visualType: 'weighted-network',
    tagline: 'Split vertices into two conflict-free teams (or detect an odd-length cycle) in linear O(V + E) time.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    complexityLeap: 'O(2^V) subset team assignments → O(V + E) greedy opposite-color BFS/DFS',
    coreIdea:
      'A graph can be divided into two independent sets if and only if it has NO odd-length cycle. Walk every disconnected component assigning color 0 to the seed node and color 1 - color[u] to every neighbor; any edge connecting two nodes of the SAME color proves an odd cycle and fails bipartition.',
    mentalModelSteps: [
      'Allocate color[0..V-1] initialized to -1 (unvisited).',
      'Loop over EVERY vertex i = 0..V-1 (critical for disconnected components!); if color[i] == -1, set color[i] = 0 and enqueue i.',
      'Pop u and inspect every neighbor v: if color[v] == -1, paint color[v] = 1 - color[u] and enqueue v.',
      'If color[v] == color[u], an odd-cycle conflict exists → immediately return false.',
    ],
    loopInvariant:
      'Every explored edge connects opposite colors (0 ↔ 1) until either all edges pass or a same-color conflict proves an odd cycle.',
    whenToUse: [
      'Is Graph Bipartite? (LC 785) and Possible Bipartition with dislike pairs (LC 886).',
      'Checking whether a constraint graph has an odd-length cycle before running maximum bipartite matching.',
      'Scheduling conflicting tasks into two shifts/machines without overlap.',
    ],
    whenItFails:
      'Only answers 2-colorability in linear time; deciding 3-colorability (k >= 3) is NP-Complete and requires Backtracking / SAT solvers.',
    linkedTopics: ['Graphs & Topo Sort'],
    linkedProblemSlugs: ['find-if-path-exists', 'course-schedule-ii', 'flood-fill'],
    templates: {
      python: `from collections import deque

def is_bipartite(graph: list[list[int]]) -> bool:
    color = [-1] * len(graph)
    for start in range(len(graph)):
        if color[start] != -1:
            continue
        color[start] = 0
        q = deque([start])
        while q:
            u = q.popleft()
            for v in graph[u]:
                if color[v] == -1:
                    color[v] = 1 - color[u]
                    q.append(v)
                elif color[v] == color[u]:
                    return False
    return True`,
      js: `function isBipartite(graph) {
  const color = Array(graph.length).fill(-1);
  for (let i = 0; i < graph.length; i++) {
    if (color[i] !== -1) continue;
    color[i] = 0;
    const q = [i];
    for (let head = 0; head < q.length; head++) {
      const u = q[head];
      for (const v of graph[u]) {
        if (color[v] === -1) {
          color[v] = 1 - color[u];
          q.push(v);
        } else if (color[v] === color[u]) {
          return false;
        }
      }
    }
  }
  return true;
}`,
      java: `public boolean isBipartite(int[][] graph) {
    int[] color = new int[graph.length];
    Arrays.fill(color, -1);
    for (int i = 0; i < graph.length; i++) {
        if (color[i] != -1) continue;
        color[i] = 0;
        Deque<Integer> q = new ArrayDeque<>();
        q.offer(i);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : graph[u]) {
                if (color[v] == -1) { color[v] = 1 - color[u]; q.offer(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Seed Node 0 with Color A (0)',
        explanation: 'Start BFS on unvisited component at node 0 and assign Team A (0). Neighbors must become Team B (1).',
        invariantCheck: 'All unvisited nodes start at -1; loop checks every component.',
        variables: [{ name: 'u', value: '0' }, { name: 'color[0]', value: 'A (0)' }],
        activeNodes: ['0'],
        nodeBadges: { '0': 'A', '1': '?', '2': '?', '3': '?' },
        graphSpec: {
          caption: '4-Cycle Even Graph (Bipartite Test)',
          nodes: [
            { id: '0', x: 100, y: 65 },
            { id: '1', x: 280, y: 65 },
            { id: '2', x: 280, y: 165 },
            { id: '3', x: 100, y: 165 },
          ],
          edges: [
            { u: '0', v: '1' },
            { u: '1', v: '2' },
            { u: '2', v: '3' },
            { u: '3', v: '0' },
          ],
        },
      },
      {
        step: 2,
        title: 'Paint Neighbors 1 & 3 Opposite Color B (1)',
        explanation: 'From 0 (A), paint uncolored neighbors 1 and 3 as B (1) and enqueue both.',
        invariantCheck: 'Edges (0,1) and (0,3) connect A ↔ B cleanly.',
        variables: [{ name: 'queue', value: '[1, 3]' }, { name: 'colors', value: '[A, B, ?, B]' }],
        visitedNodes: ['0'],
        activeNodes: ['1', '3'],
        activeEdges: ['0-1', '3-0'],
        nodeBadges: { '0': 'A', '1': 'B', '2': '?', '3': 'B' },
        graphSpec: {
          caption: 'Neighbors of A receive Team B',
          nodes: [
            { id: '0', x: 100, y: 65 },
            { id: '1', x: 280, y: 65 },
            { id: '2', x: 280, y: 165 },
            { id: '3', x: 100, y: 165 },
          ],
          edges: [
            { u: '0', v: '1' },
            { u: '1', v: '2' },
            { u: '2', v: '3' },
            { u: '3', v: '0' },
          ],
        },
      },
      {
        step: 3,
        title: 'Pop 1(B) → Paint Node 2 as Team A (0)',
        explanation: 'Node 1 (B) sees neighbor 0 (A, OK) and unvisited node 2 → paint 2 as A (0).',
        invariantCheck: 'Still zero same-color edges.',
        variables: [{ name: 'u', value: '1 (B)' }, { name: 'color[2]', value: 'A (0)' }],
        visitedNodes: ['0', '1'],
        activeNodes: ['2'],
        activeEdges: ['1-2'],
        nodeBadges: { '0': 'A', '1': 'B', '2': 'A', '3': 'B' },
        graphSpec: {
          caption: 'Node 2 receives Team A from neighbor 1 (B)',
          nodes: [
            { id: '0', x: 100, y: 65 },
            { id: '1', x: 280, y: 65 },
            { id: '2', x: 280, y: 165 },
            { id: '3', x: 100, y: 165 },
          ],
          edges: [
            { u: '0', v: '1' },
            { u: '1', v: '2' },
            { u: '2', v: '3' },
            { u: '3', v: '0' },
          ],
        },
      },
      {
        step: 4,
        title: 'Verify Edge (3, 2): B ≠ A → Bipartite Confirmed!',
        explanation: 'Pop 3 (B) and check neighbor 2 (A): opposite colors! No odd cycle exists → return true.',
        invariantCheck: 'Teams {0, 2} and {1, 3} have zero internal conflicts.',
        variables: [{ name: 'team A', value: '{0, 2}' }, { name: 'team B', value: '{1, 3}' }, { name: 'result', value: 'true' }],
        visitedNodes: ['0', '1', '2', '3'],
        activeEdges: ['2-3'],
        nodeBadges: { '0': 'A', '1': 'B', '2': 'A', '3': 'B' },
        graphSpec: {
          caption: 'Valid 2-Coloring: Every edge crosses A ↔ B',
          nodes: [
            { id: '0', x: 100, y: 65 },
            { id: '1', x: 280, y: 65 },
            { id: '2', x: 280, y: 165 },
            { id: '3', x: 100, y: 165 },
          ],
          edges: [
            { u: '0', v: '1' },
            { u: '1', v: '2' },
            { u: '2', v: '3' },
            { u: '3', v: '0' },
          ],
        },
      },
    ],
  },

  // 51. Sweep Line / Difference Events
  {
    id: 'sweep-line-events',
    name: 'Sweep Line & Event Sorting',
    shortName: 'Sweep Line',
    category: 'Searching & Sorting',
    visualType: 'greedy-intervals',
    tagline: 'Convert overlapping intervals into (+1 start, -1 end) timeline events to compute peak concurrency in O(N log N).',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N·T) per-minute timeline simulation → O(N log N) sparse event sweep (handles coordinates up to 10^9)',
    coreIdea:
      'Instead of allocating an array across time [0..10^9], emit two events per interval [start, end): (start, +1) and (end, -1). Sort events by timestamp (with -1 BEFORE +1 on ties for half-open intervals) and sweep a running active counter to find peak rooms, merged spans, or skyline heights.',
    mentalModelSteps: [
      'For every interval [start, end), emit two events: [start, +1] and [end, -1].',
      'Sort events by time ascending; break ties carefully (-1 before +1 for half-open [start, end) so departing meetings free rooms first).',
      'Sweep left-to-right accumulating active += delta and tracking maxActive = max(maxActive, active).',
      'When active transitions 0 → >0 or >0 → 0, you also capture exact union interval boundaries!',
    ],
    loopInvariant:
      'After processing all events at timestamp t, `active` equals the exact number of live intervals covering t.',
    whenToUse: [
      'Meeting Rooms II (LC 253) — minimum conference rooms required simultaneously.',
      'Car Pooling / My Calendar II / III with huge timestamps up to 10^9 where a flat Difference Array OOMs.',
      'The Skyline Problem (LC 218) and Rectangle Area Union (2D coordinate compression + sweep line).',
    ],
    whenItFails:
      'Sweep line is offline (requires sorting all events upfront). For online interleaved queries + updates, use a Balanced BST (TreeMap) or Dynamic Lazy Segment Tree.',
    linkedTopics: ['Heaps & Intervals'],
    linkedProblemSlugs: ['merge-intervals', 'kth-largest-in-stream', 'find-median-from-data-stream'],
    templates: {
      python: `def min_meeting_rooms(intervals: list[list[int]]) -> int:
    events = []
    for start, end in intervals:
        events.append((start, 1))
        events.append((end, -1))
    # Sort by time; on tie, -1 (end) comes before +1 (start)
    events.sort(key=lambda e: (e[0], e[1]))
    active = peak = 0
    for _, delta in events:
        active += delta
        peak = max(peak, active)
    return peak`,
      js: `function minMeetingRooms(intervals) {
  const events = [];
  for (const [s, e] of intervals) {
    events.push([s, 1], [e, -1]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let active = 0, peak = 0;
  for (const [, delta] of events) {
    active += delta;
    if (active > peak) peak = active;
  }
  return peak;
}`,
      java: `public int minMeetingRooms(int[][] intervals) {
    List<int[]> events = new ArrayList<>();
    for (int[] iv : intervals) {
        events.add(new int[]{iv[0], 1});
        events.add(new int[]{iv[1], -1});
    }
    events.sort((a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));
    int active = 0, peak = 0;
    for (int[] e : events) {
        active += e[1];
        peak = Math.max(peak, active);
    }
    return peak;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Emit & Sort Events for [0,30], [5,10], [15,20]',
        explanation: 'Events sorted by (time, delta): (0,+1), (5,+1), (10,-1), (15,+1), (20,-1), (30,-1).',
        invariantCheck: 'On timestamp ties, -1 fires before +1 so freed rooms are immediately reused.',
        variables: [{ name: 'time', value: '0' }, { name: 'active', value: '1' }, { name: 'peak', value: '1' }],
        intervals: [
          { id: '[0,30]', start: 0, end: 30, status: 'active' },
          { id: '[5,10]', start: 5, end: 10, status: 'pending' },
          { id: '[15,20]', start: 15, end: 20, status: 'pending' },
        ],
      },
      {
        step: 2,
        title: 't = 5 (+1): Peak Concurrency Reaches 2 Rooms',
        explanation: 'Meeting [5,10] starts while [0,30] is still running → active = 2, peak = 2.',
        invariantCheck: 'active = 2 matches both live overlapping intervals.',
        variables: [{ name: 'time', value: '5' }, { name: 'active', value: '2' }, { name: 'peak', value: '2' }],
        intervals: [
          { id: '[0,30]', start: 0, end: 30, status: 'selected' },
          { id: '[5,10]', start: 5, end: 10, status: 'active' },
          { id: '[15,20]', start: 15, end: 20, status: 'pending' },
        ],
      },
      {
        step: 3,
        title: 't = 10 (-1) Frees Room → t = 15 (+1) Reuses It',
        explanation: 'At t=10 active drops to 1; at t=15 [15,20] raises active back to 2 without needing a 3rd room.',
        invariantCheck: 'Peak stays 2 because rooms freed before t=15 are reused.',
        variables: [{ name: 'time', value: '15' }, { name: 'active', value: '2' }, { name: 'peak', value: '2' }],
        intervals: [
          { id: '[0,30]', start: 0, end: 30, status: 'selected' },
          { id: '[5,10]', start: 5, end: 10, status: 'reused' },
          { id: '[15,20]', start: 15, end: 20, status: 'active' },
        ],
      },
      {
        step: 4,
        title: 'Sweep Finishes at t = 30 → Peak = 2 Rooms',
        explanation: 'Events (20,-1) and (30,-1) bring active cleanly back to 0. Minimum conference rooms = 2.',
        invariantCheck: 'Total sum of deltas == 0; peak = 2 proven optimal.',
        variables: [{ name: 'time', value: '30' }, { name: 'active', value: '0' }, { name: 'answer', value: '2' }],
        intervals: [
          { id: '[0,30]', start: 0, end: 30, status: 'selected' },
          { id: '[5,10]', start: 5, end: 10, status: 'selected' },
          { id: '[15,20]', start: 15, end: 20, status: 'selected' },
        ],
      },
    ],
  },

  // 52. Dual Heaps (Streaming Median)
  {
    id: 'dual-heaps-median',
    name: 'Dual Heaps (Streaming Median)',
    shortName: 'Dual Heaps',
    category: 'Searching & Sorting',
    visualType: 'stream-partition',
    tagline: 'Balance a Lower Max-Heap and Upper Min-Heap so the live median is always exposed in O(1).',
    timeComplexity: 'O(log N) add · O(1) median',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N log N) re-sort per stream arrival → O(log N) insert + O(1) instant median read',
    coreIdea:
      'Split all numbers seen so far into two equal halves: `lo` (a Max-Heap holding the smaller half) and `hi` (a Min-Heap holding the larger half). Maintain two invariants: every element in `lo` <= every element in `hi`, and `lo.size` is equal to `hi.size` or `hi.size + 1`. The median is immediately `lo.top` (odd count) or `(lo.top + hi.top) / 2` (even count).',
    mentalModelSteps: [
      'Push every incoming num into `lo` (Max-Heap) first.',
      'Immediately move `lo.pop()` (its largest element) into `hi` (Min-Heap) to guarantee ordering `lo <= hi`.',
      'If `hi.size > lo.size`, pop `hi.top` and push it back into `lo` to maintain size balance.',
      'Read median in O(1): `lo.top` when `lo.size > hi.size`, else `(lo.top + hi.top) / 2`.',
    ],
    loopInvariant:
      'After every addNum: max(lo) <= min(hi) AND 0 <= lo.size - hi.size <= 1.',
    whenToUse: [
      'Find Median from Data Stream (LC 295) — online percentiles & latency P50 monitors.',
      'Sliding Window Median (LC 480) — Dual Heaps combined with lazy deletion HashMap.',
      'IPO Maximize Capital (LC 502) — Min-Heap of locked projects feeding a Max-Heap of affordable profits.',
    ],
    whenItFails:
      'If values lie in a tiny bounded integer range (e.g., 0..100), a fixed-size frequency array computes median in O(1) without heap overhead.',
    linkedTopics: ['Heaps & Intervals'],
    linkedProblemSlugs: ['find-median-from-data-stream', 'kth-largest-in-stream', 'merge-k-sorted-lists'],
    templates: {
      python: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap via negation
        self.hi = []  # min-heap

    def add_num(self, num: int) -> None:
        heapq.heappush(self.lo, -num)
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def find_median(self) -> float:
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])
        return (-self.lo[0] + self.hi[0]) / 2.0`,
      js: `// Running stream medians using balanced Max-Heap (lo) & Min-Heap (hi)
function streamingMedians(nums) {
  const lo = [], hi = [], out = [];
  const pushLo = (x) => { lo.push(x); lo.sort((a, b) => b - a); };
  const pushHi = (x) => { hi.push(x); hi.sort((a, b) => a - b); };
  for (const x of nums) {
    pushLo(x);
    pushHi(lo.shift());
    if (hi.length > lo.length) pushLo(hi.shift());
    out.push(lo.length > hi.length ? lo[0] : (lo[0] + hi[0]) / 2);
  }
  return out;
}`,
      java: `class MedianFinder {
    PriorityQueue<Integer> lo = new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> hi = new PriorityQueue<>();
    public void addNum(int num) {
        lo.offer(num);
        hi.offer(lo.poll());
        if (hi.size() > lo.size()) lo.offer(hi.poll());
    }
    public double findMedian() {
        return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
    }
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Add 5 → Push lo, Spill to hi, Rebalance to lo',
        explanation: '3-step invariant dance places 5 into lo=[5], hi=[]. Odd count → median = lo.top = 5.',
        invariantCheck: 'lo.size (1) - hi.size (0) == 1.',
        variables: [{ name: 'lo (Max)', value: '[5]' }, { name: 'hi (Min)', value: '[]' }, { name: 'median', value: '5' }],
        array: [5],
        matchedIndices: [0],
      },
      {
        step: 2,
        title: 'Add 15 → lo=[5], hi=[15] → Median = 10',
        explanation: 'Push 15 to lo ([15,5]), spill max (15) to hi ([15]). Sizes equal (1 == 1) → median = (5 + 15) / 2 = 10.',
        invariantCheck: 'max(lo)=5 <= min(hi)=15; balanced sizes.',
        variables: [{ name: 'lo (Max)', value: '[5]' }, { name: 'hi (Min)', value: '[15]' }, { name: 'median', value: '10' }],
        array: [5, 15],
        matchedIndices: [0, 1],
      },
      {
        step: 3,
        title: 'Add 1 → lo=[5, 1], hi=[15] → Median = 5',
        explanation: 'Push 1 to lo, spill max (5) to hi ([5,15]), rebalance min (5) back to lo ([5,1]). Median = lo.top = 5.',
        invariantCheck: 'Ordering max(lo)=5 <= min(hi)=15 preserved without manual branching.',
        variables: [{ name: 'lo (Max)', value: '[5, 1]' }, { name: 'hi (Min)', value: '[15]' }, { name: 'median', value: '5' }],
        array: [1, 5, 15],
        matchedIndices: [1],
      },
      {
        step: 4,
        title: 'Add 3 → lo=[3, 1], hi=[5, 15] → Median = 4',
        explanation: 'Push 3 to lo ([5,3,1]), spill 5 to hi ([5,15]). Sizes balanced (2 == 2) → median = (3 + 5) / 2 = 4!',
        invariantCheck: 'Every arrival handled in O(log N) with O(1) median readout.',
        variables: [{ name: 'lo (Max)', value: '[3, 1]' }, { name: 'hi (Min)', value: '[5, 15]' }, { name: 'median', value: '4' }],
        array: [1, 3, 5, 15],
        matchedIndices: [1, 2],
      },
    ],
  },

  // 53. LIS Patience Sorting (O(N log N))
  {
    id: 'lis-patience-sorting',
    name: 'LIS Patience Sorting (Binary Search on Tails)',
    shortName: 'LIS O(N log N)',
    category: 'Advanced Dynamic Programming',
    visualType: 'binary-search',
    tagline: 'Optimize O(N²) Longest Increasing Subsequence down to O(N log N) by maintaining minimal subsequence tails.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N²) pairwise DP scan → O(N log N) lower_bound binary search over monotonic tails',
    coreIdea:
      'Maintain an array `tails` where `tails[k]` is the SMALLEST possible ending value of any strictly increasing subsequence of length `k + 1`. Because `tails` is always strictly sorted, for each new number `x`, binary search (`lower_bound`) the first slot >= x and replace it (or append if x exceeds all tails).',
    mentalModelSteps: [
      'Initialize an empty sorted array `tails = []`.',
      'For each number `x` in `nums`, binary search the smallest index `idx` where `tails[idx] >= x` (`lower_bound`).',
      'If `idx == tails.length`, append `x` (extending the longest increasing subsequence by 1!).',
      'Otherwise overwrite `tails[idx] = x` (keeping length identical while making future extensions easier). Final answer = `tails.length`.',
    ],
    loopInvariant:
      'At every step, `tails` is strictly increasing and `tails[k]` holds the minimum possible tail value among all increasing subsequences of length k + 1 seen so far.',
    whenToUse: [
      'Longest Increasing Subsequence (LC 300) when N <= 10^5 (O(N²) DP times out).',
      'Russian Doll Envelopes (LC 354) — sort width ASC, height DESC, then run O(N log N) LIS on height.',
      'Minimum Operations to Make Array K-Increasing (LC 2111) using upper_bound for non-decreasing.',
    ],
    whenItFails:
      'Note that `tails` gives the exact LENGTH, not always the valid elements of the actual subsequence (because overwrites can swap earlier values). To reconstruct the sequence itself, track predecessor indices.',
    linkedTopics: ['Dynamic Programming', 'Modified Binary Search'],
    linkedProblemSlugs: ['coin-change', 'binary-search-classic', 'edit-distance'],
    templates: {
      python: `from bisect import bisect_left

def length_of_lis(nums: list[int]) -> int:
    tails = []
    for x in nums:
        idx = bisect_left(tails, x)
        if idx == len(tails):
            tails.append(x)
        else:
            tails[idx] = x
    return len(tails)`,
      js: `function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}`,
      java: `public int lengthOfLIS(int[] nums) {
    int[] tails = new int[nums.length];
    int size = 0;
    for (int x : nums) {
        int lo = 0, hi = size;
        while (lo < hi) {
            int mid = (lo + hi) >>> 1;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;
        if (lo == size) size++;
    }
    return size;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Process 10, 9, 2 → Keep Smallest Length-1 Tail',
        explanation: '10 starts tails=[10]. 9 replaces 10 → [9]. 2 replaces 9 → [2]. Smaller tail maximizes room for future numbers.',
        invariantCheck: 'tails = [2] is strictly sorted; LIS length = 1.',
        variables: [{ name: 'x', value: '2' }, { name: 'tails', value: '[2]' }, { name: 'LIS', value: '1' }],
        array: [2],
        pointers: [{ label: 'idx=0', index: 0, tone: 'sky' }],
      },
      {
        step: 2,
        title: 'Process 5, 3 → Append 5, Then Tighten Length-2 Tail to 3',
        explanation: '5 > 2 appends → [2, 5]. Next 3 finds lower_bound idx=1 (5 >= 3) and replaces 5 → [2, 3].',
        invariantCheck: '[2, 3] is strictly easier to extend than [2, 5]!',
        variables: [{ name: 'x', value: '3' }, { name: 'tails', value: '[2, 3]' }, { name: 'LIS', value: '2' }],
        array: [2, 3],
        pointers: [{ label: 'idx=1', index: 1, tone: 'amber' }],
      },
      {
        step: 3,
        title: 'Process 7 & 101 → Extend LIS to Length 4!',
        explanation: '7 > 3 appends → [2, 3, 7]. 101 > 7 appends → [2, 3, 7, 101].',
        invariantCheck: 'Each element takes O(log L) binary search.',
        variables: [{ name: 'x', value: '101' }, { name: 'tails', value: '[2, 3, 7, 101]' }, { name: 'LIS', value: '4' }],
        array: [2, 3, 7, 101],
        matchedIndices: [0, 1, 2, 3],
        pointers: [{ label: 'append', index: 3, tone: 'emerald' }],
      },
      {
        step: 4,
        title: 'Process 18 → Tightens Length-4 Tail to 18 · Answer = 4',
        explanation: 'lower_bound(18) = 3 replaces 101 → [2, 3, 7, 18]. Final LIS length = tails.length = 4.',
        invariantCheck: 'Total time O(N log N) cleanly scales to N = 10^5.',
        variables: [{ name: 'x', value: '18' }, { name: 'tails', value: '[2, 3, 7, 18]' }, { name: 'answer', value: '4' }],
        array: [2, 3, 7, 18],
        matchedIndices: [0, 1, 2, 3],
        pointers: [{ label: 'idx=3', index: 3, tone: 'emerald' }],
      },
    ],
  },

  // 54. Meet in the Middle
  {
    id: 'meet-in-the-middle',
    name: 'Meet in the Middle (Half-Space Split)',
    shortName: 'Meet in Middle',
    category: 'Optimization & Decision Making',
    visualType: 'two-pointers',
    tagline: 'Solve N ≈ 40 subset-sum problems by splitting 2^40 into two 2^20 halves and combining with Binary Search / Two Pointers.',
    timeComplexity: 'O(N · 2^(N/2))',
    spaceComplexity: 'O(2^(N/2))',
    complexityLeap: 'O(2^40 ≈ 10^12 TLE) brute subset enumeration → O(2^20 ≈ 10^6) split + binary search',
    coreIdea:
      'When N ≈ 34–42 is too big for O(2^N) backtracking and values are too huge (10^9) for pseudo-polynomial DP, cut the array in half! Enumerate all 2^(N/2) subset sums for the Left half and Right half independently, sort Right sums, and binary search the closest complement for every Left sum.',
    mentalModelSteps: [
      'Split nums into left = nums[0 .. N/2) and right = nums[N/2 .. N).',
      'Generate all 2^(N/2) subset sums for leftSums and rightSums (each <= ~10^6 when N <= 40).',
      'Sort rightSums ascending in O(2^(N/2) · N/2).',
      'For every sL in leftSums, binary search target - sL in rightSums (or sweep sorted leftSums & rightSums with Two Pointers) to find exact or closest sum.',
    ],
    loopInvariant:
      'Every full subset of nums decomposes uniquely into one subset from Left + one subset from Right, so checking all pairs via binary search explores all 2^N subsets implicitly.',
    whenToUse: [
      'Closest Subsequence Sum (LC 1755) — N <= 40 with values up to ±10^7.',
      'Partition Array Into Two Arrays to Minimize Sum Difference (LC 2035) — group half-sums by popcount k.',
      '4Sum II (LC 454) — classic O(N²) half-space HashMap split beating O(N^4).',
    ],
    whenItFails:
      'Memory grows as O(2^(N/2)): beyond N ≈ 46, even 2^23 (~8M) entries become tight in RAM. When sum range S is small, O(N · S) DP beats Meet in the Middle.',
    linkedTopics: ['Backtracking & Tries', 'Modified Binary Search'],
    linkedProblemSlugs: ['subsets', 'binary-search-classic', 'two-sum'],
    templates: {
      python: `from bisect import bisect_left

def min_abs_difference(nums: list[int], goal: int) -> int:
    def gen(arr):
        sums = [0]
        for x in arr:
            sums += [s + x for s in sums]
        return sums
    mid = len(nums) // 2
    left = gen(nums[:mid])
    right = sorted(gen(nums[mid:]))
    best = abs(goal)
    for s in left:
        need = goal - s
        i = bisect_left(right, need)
        if i < len(right):
            best = min(best, abs(s + right[i] - goal))
        if i > 0:
            best = min(best, abs(s + right[i - 1] - goal))
    return best`,
      js: `function minAbsDifference(nums, goal) {
  const gen = (arr) => {
    let sums = [0];
    for (const x of arr) {
      const next = [];
      for (const s of sums) next.push(s + x);
      sums = sums.concat(next);
    }
    return sums;
  };
  const mid = nums.length >> 1;
  const left = gen(nums.slice(0, mid));
  const right = gen(nums.slice(mid)).sort((a, b) => a - b);
  let best = Math.abs(goal);
  for (const s of left) {
    const need = goal - s;
    let lo = 0, hi = right.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (right[m] < need) lo = m + 1;
      else hi = m;
    }
    if (lo < right.length) best = Math.min(best, Math.abs(s + right[lo] - goal));
    if (lo > 0) best = Math.min(best, Math.abs(s + right[lo - 1] - goal));
    if (best === 0) return 0;
  }
  return best;
}`,
      java: `public int minAbsDifference(int[] nums, int goal) {
    int n = nums.length, mid = n / 2;
    int[] left = gen(nums, 0, mid), right = gen(nums, mid, n);
    Arrays.sort(right);
    int best = Math.abs(goal);
    for (int s : left) {
        int idx = Arrays.binarySearch(right, goal - s);
        if (idx >= 0) return 0;
        int ins = -idx - 1;
        if (ins < right.length) best = Math.min(best, Math.abs(s + right[ins] - goal));
        if (ins > 0) best = Math.min(best, Math.abs(s + right[ins - 1] - goal));
    }
    return best;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Split [5, -7, 3, 5] (goal = 6) Into Two Halves',
        explanation: 'Left half [5, -7] generates 2^2 = 4 sums. Right half [3, 5] generates 2^2 = 4 sums.',
        invariantCheck: '2^(N/2) + 2^(N/2) drops exponent by half.',
        variables: [{ name: 'leftHalf', value: '[5, -7]' }, { name: 'rightHalf', value: '[3, 5]' }, { name: 'goal', value: '6' }],
        array: [5, -7, 3, 5],
        pointers: [{ label: 'mid', index: 2, tone: 'sky' }],
      },
      {
        step: 2,
        title: 'Enumerate & Sort Right Subset Sums',
        explanation: 'leftSums = [0, 5, -7, -2]. rightSums sorted = [0, 3, 5, 8]. Ready for O(log 2^(N/2)) complement lookup.',
        invariantCheck: 'Sorted rightSums enables binary search or two-pointer merge.',
        variables: [{ name: 'leftSums', value: '[0, 5, -7, -2]' }, { name: 'rightSorted', value: '[0, 3, 5, 8]' }],
        array: [0, 3, 5, 8],
        highlightIndices: [0, 1, 2, 3],
      },
      {
        step: 3,
        title: 'Query sL = -2 → Need 6 - (-2) = 8 → Exact Hit!',
        explanation: 'Binary search finds 8 in rightSums! Subset {-7, 5} + {3, 5} = -2 + 8 = 6 → diff = 0!',
        invariantCheck: 'Exact 0 error terminates immediately.',
        variables: [{ name: 'sL', value: '-2' }, { name: 'need', value: '8' }, { name: 'bestDiff', value: '0' }],
        array: [0, 3, 5, 8],
        matchedIndices: [3],
        pointers: [{ label: 'hit=8', index: 3, tone: 'emerald' }],
      },
      {
        step: 4,
        title: 'Why It Scales to N = 40',
        explanation: 'Brute 2^40 ≈ 1 trillion ops times out; Meet in the Middle does ~1M × 20 ≈ 2×10^7 ops in < 100ms.',
        invariantCheck: 'Square-root reduction of exponential state space: √(2^N) = 2^(N/2).',
        variables: [{ name: '2^40 brute', value: '10^12 TLE' }, { name: '2^20 split', value: '10^6 PASS' }],
        array: [0, 3, 5, 8],
        matchedIndices: [3],
      },
    ],
  },
];

export const SPECIALIST_9_PRACTICE: Record<string, AlgorithmPracticeSpec> = {
  'monotonic-deque': {
    algorithmId: 'monotonic-deque',
    functionName: 'maxSlidingWindow',
    title: 'Implement Sliding Window Maximum (O(N) Monotonic Deque)',
    prompt: 'Return an array of the maximum value inside every contiguous sliding window of size k.',
    structuredSteps: [
      { step: 'Expire front', detail: 'Advance head pointer when dq[head] <= i - k.' },
      { step: 'Evict smaller back', detail: 'Pop back indices while nums[dq.back] <= nums[i].' },
      { step: 'Record max', detail: 'Push i; once i >= k - 1 push nums[dq[head]].' },
    ],
    starterCode: `function maxSlidingWindow(nums, k) {\n  // TODO: maintain decreasing deque of indices\n  return [];\n}`,
    solutionCode: `function maxSlidingWindow(nums, k) {\n  const dq = [];\n  let head = 0;\n  const out = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (head < dq.length && dq[head] <= i - k) head++;\n    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();\n    dq.push(i);\n    if (i >= k - 1) out.push(nums[dq[head]]);\n  }\n  return out;\n}`,
    testCases: [
      { label: 'Classic LC 239', args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
      { label: 'Window k = 1', args: [[4, -2], 1], expected: [4, -2] },
      { label: 'Strictly decreasing', args: [[9, 7, 5, 3, 1], 3], expected: [9, 7, 5] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '239', title: 'Sliding Window Maximum', difficulty: 'Hard', focus: 'Exact O(N) decreasing deque template.' },
      { platform: 'LeetCode', number: '1438', title: 'Longest Subarray With Abs Diff <= Limit', difficulty: 'Medium', focus: 'Dual monotonic deques (max + min).' },
    ],
  },
  'zero-one-bfs': {
    algorithmId: 'zero-one-bfs',
    functionName: 'zeroOneShortestPath',
    title: 'Implement 0-1 BFS Shortest Path (Binary-Weight Graph)',
    prompt: 'Given n nodes (0..n-1), directed edges [u, v, w] with w ∈ {0, 1}, and target, return minimum cost from 0 to target (or -1 if unreachable).',
    structuredSteps: [
      { step: 'Build adjacency list', detail: 'Group outgoing [v, w] edges per node u.' },
      { step: 'Deque push rule', detail: 'On relaxation: w === 0 → unshift(v); w === 1 → push(v).' },
      { step: 'Return dist[target]', detail: 'Return -1 if dist[target] remains Infinity.' },
    ],
    starterCode: `function zeroOneShortestPath(n, edges, target) {\n  // TODO: 0-1 BFS using deque front/back push\n  return -1;\n}`,
    solutionCode: `function zeroOneShortestPath(n, edges, target) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of edges) adj[u].push([v, w]);\n  const dist = Array(n).fill(Infinity);\n  dist[0] = 0;\n  const dq = [0];\n  while (dq.length) {\n    const u = dq.shift();\n    for (const [v, w] of adj[u]) {\n      if (dist[u] + w < dist[v]) {\n        dist[v] = dist[u] + w;\n        if (w === 0) dq.unshift(v);\n        else dq.push(v);\n      }\n    }\n  }\n  return dist[target] === Infinity ? -1 : dist[target];\n}`,
    testCases: [
      { label: 'Free detour beats direct paid edge', args: [4, [[0, 1, 1], [0, 2, 0], [1, 3, 1], [2, 3, 0]], 3], expected: 0 },
      { label: 'Mixed 0/1 path', args: [4, [[0, 1, 1], [1, 2, 0], [2, 3, 1], [0, 3, 1]], 3], expected: 1 },
      { label: 'Unreachable node', args: [3, [[0, 1, 0]], 2], expected: -1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '2290', title: 'Minimum Obstacle Removal to Reach Corner', difficulty: 'Hard', focus: 'Empty cell = 0, wall = 1 grid 0-1 BFS.' },
      { platform: 'LeetCode', number: '1368', title: 'Min Cost to Make One Valid Path in Grid', difficulty: 'Hard', focus: 'Follow arrow = 0, change arrow = 1.' },
    ],
  },
  'bidirectional-bfs': {
    algorithmId: 'bidirectional-bfs',
    functionName: 'wordLadderLength',
    title: 'Implement Bidirectional BFS Word Ladder',
    prompt: 'Return the shortest transformation sequence length from beginWord to endWord changing one letter at a time using wordList (or 0 if impossible).',
    structuredSteps: [
      { step: 'Validate endWord', detail: 'If endWord is not in wordSet, return 0 immediately.' },
      { step: 'Expand smaller frontier', detail: 'Swap front and back whenever front.size > back.size.' },
      { step: 'Detect collision', detail: 'If any 1-char mutation exists in back, return steps + 1.' },
    ],
    starterCode: `function wordLadderLength(beginWord, endWord, wordList) {\n  // TODO: two-frontier bidirectional BFS\n  return 0;\n}`,
    solutionCode: `function wordLadderLength(beginWord, endWord, wordList) {\n  const words = new Set(wordList);\n  if (!words.has(endWord)) return 0;\n  let front = new Set([beginWord]);\n  let back = new Set([endWord]);\n  words.delete(beginWord);\n  words.delete(endWord);\n  let steps = 1;\n  while (front.size && back.size) {\n    if (front.size > back.size) [front, back] = [back, front];\n    const next = new Set();\n    for (const w of front) {\n      for (let i = 0; i < w.length; i++) {\n        for (let c = 97; c <= 122; c++) {\n          const cand = w.slice(0, i) + String.fromCharCode(c) + w.slice(i + 1);\n          if (back.has(cand)) return steps + 1;\n          if (words.has(cand)) {\n            words.delete(cand);\n            next.add(cand);\n          }\n        }\n      }\n    }\n    front = next;\n    steps++;\n  }\n  return 0;\n}`,
    testCases: [
      { label: 'Classic LC 127 hit -> cog', args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], expected: 5 },
      { label: 'Missing target returns 0', args: ['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], expected: 0 },
      { label: 'One-step match', args: ['a', 'c', ['a', 'b', 'c']], expected: 2 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '127', title: 'Word Ladder', difficulty: 'Hard', focus: 'Two-end BFS cuts runtime dramatically.', trainerSlug: 'word-ladder' },
      { platform: 'LeetCode', number: '752', title: 'Open the Lock', difficulty: 'Medium', focus: 'State-space bidirectional shortest path.' },
    ],
  },
  'kruskals-mst': {
    algorithmId: 'kruskals-mst',
    functionName: 'kruskalMstCost',
    title: 'Implement Kruskal’s Minimum Spanning Tree (DSU)',
    prompt: 'Given n vertices (0..n-1) and undirected weighted edges [u, v, w], return the minimum spanning tree total weight, or -1 if disconnected.',
    structuredSteps: [
      { step: 'Sort edges', detail: 'Sort edge list ascending by weight w.' },
      { step: 'Union non-cycle edges', detail: 'If find(u) !== find(v), union, add w, increment used.' },
      { step: 'Check connectivity', detail: 'Return total once used === n - 1, else -1.' },
    ],
    starterCode: `function kruskalMstCost(n, edges) {\n  // TODO: sort edges + DSU\n  return -1;\n}`,
    solutionCode: `function kruskalMstCost(n, edges) {\n  if (n <= 1) return 0;\n  const sorted = [...edges].sort((a, b) => a[2] - b[2]);\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));\n  let total = 0, used = 0;\n  for (const [u, v, w] of sorted) {\n    const ru = find(u), rv = find(v);\n    if (ru !== rv) {\n      parent[ru] = rv;\n      total += w;\n      used++;\n      if (used === n - 1) return total;\n    }\n  }\n  return -1;\n}`,
    testCases: [
      { label: '4-node graph with cycle edge', args: [4, [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4], [1, 3, 5]]], expected: 7 },
      { label: 'Disconnected returns -1', args: [4, [[0, 1, 2], [2, 3, 3]]], expected: -1 },
      { label: 'Single node returns 0', args: [1, []], expected: 0 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '1135', title: 'Connecting Cities With Minimum Cost', difficulty: 'Medium', focus: 'Direct Kruskal MST on edge list.' },
      { platform: 'LeetCode', number: '1584', title: 'Min Cost to Connect All Points', difficulty: 'Medium', focus: 'Compare Kruskal vs Prim on dense graphs.' },
    ],
  },
  'bipartite-graph-coloring': {
    algorithmId: 'bipartite-graph-coloring',
    functionName: 'isBipartiteGraph',
    title: 'Implement Bipartite 2-Coloring Check',
    prompt: 'Given an undirected adjacency list graph, return true iff vertices can be partitioned into 2 sets with no edge inside the same set.',
    structuredSteps: [
      { step: 'Outer component loop', detail: 'Seed BFS/DFS for every uncolored node i (color[i] === -1).' },
      { step: 'Alternate colors', detail: 'Paint unvisited neighbor v with 1 - color[u].' },
      { step: 'Detect odd cycle', detail: 'Return false immediately if color[v] === color[u].' },
    ],
    starterCode: `function isBipartiteGraph(graph) {\n  // TODO: 2-coloring across all components\n  return false;\n}`,
    solutionCode: `function isBipartiteGraph(graph) {\n  const color = Array(graph.length).fill(-1);\n  for (let i = 0; i < graph.length; i++) {\n    if (color[i] !== -1) continue;\n    color[i] = 0;\n    const q = [i];\n    for (let h = 0; h < q.length; h++) {\n      const u = q[h];\n      for (const v of graph[u]) {\n        if (color[v] === -1) {\n          color[v] = 1 - color[u];\n          q.push(v);\n        } else if (color[v] === color[u]) {\n          return false;\n        }\n      }\n    }\n  }\n  return true;\n}`,
    testCases: [
      { label: '4-cycle is bipartite', args: [[[1, 3], [0, 2], [1, 3], [0, 2]]], expected: true },
      { label: 'Triangle odd cycle fails', args: [[[1, 2], [0, 2], [0, 1]]], expected: false },
      { label: 'Disconnected with odd component fails', args: [[[1], [0], [3, 4], [2, 4], [2, 3]]], expected: false },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '785', title: 'Is Graph Bipartite?', difficulty: 'Medium', focus: 'Canonical 2-coloring BFS across disconnected components.' },
      { platform: 'LeetCode', number: '886', title: 'Possible Bipartition', difficulty: 'Medium', focus: 'Build undirected dislike graph and 2-color.' },
    ],
  },
  'sweep-line-events': {
    algorithmId: 'sweep-line-events',
    functionName: 'minMeetingRooms',
    title: 'Implement Sweep Line Peak Concurrency (Meeting Rooms II)',
    prompt: 'Given meeting intervals [start, end), return the minimum number of conference rooms required simultaneously.',
    structuredSteps: [
      { step: 'Emit delta events', detail: 'Push [start, +1] and [end, -1] for every interval.' },
      { step: 'Tie-break sort', detail: 'Sort by timestamp asc; break ties with -1 before +1.' },
      { step: 'Track peak active', detail: 'Accumulate active += delta and track max(peak, active).' },
    ],
    starterCode: `function minMeetingRooms(intervals) {\n  // TODO: sort (+1/-1) timeline events\n  return 0;\n}`,
    solutionCode: `function minMeetingRooms(intervals) {\n  const events = [];\n  for (const [s, e] of intervals) {\n    events.push([s, 1], [e, -1]);\n  }\n  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n  let active = 0, peak = 0;\n  for (const [, d] of events) {\n    active += d;\n    if (active > peak) peak = active;\n  }\n  return peak;\n}`,
    testCases: [
      { label: 'Classic LC 253', args: [[[0, 30], [5, 10], [15, 20]]], expected: 2 },
      { label: 'Back-to-back touching meetings reuse room', args: [[[0, 10], [10, 20], [20, 30]]], expected: 1 },
      { label: 'All overlapping', args: [[[1, 5], [2, 6], [3, 7]]], expected: 3 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '253', title: 'Meeting Rooms II', difficulty: 'Medium', focus: 'Event sort tie-breaking (-1 before +1).' },
      { platform: 'LeetCode', number: '1094', title: 'Car Pooling', difficulty: 'Medium', focus: 'Weighted (+passengers / -passengers) sweep line.' },
    ],
  },
  'dual-heaps-median': {
    algorithmId: 'dual-heaps-median',
    functionName: 'runningMedians',
    title: 'Implement Dual-Heap Running Medians',
    prompt: 'Given an incoming stream array nums, return an array where result[i] is the exact median of nums[0..i].',
    structuredSteps: [
      { step: 'Push lower Max-Heap', detail: 'Insert x into lower half and spill its max into upper Min-Heap.' },
      { step: 'Rebalance sizes', detail: 'If upper.size > lower.size, move upper min back to lower.' },
      { step: 'Read median O(1)', detail: 'Return lo[0] (odd) or (lo[0] + hi[0]) / 2 (even).' },
    ],
    starterCode: `function runningMedians(nums) {\n  // TODO: maintain balanced lower Max-Heap and upper Min-Heap\n  return [];\n}`,
    solutionCode: `function runningMedians(nums) {\n  const lo = [], hi = [], out = [];\n  const pushLo = (x) => { lo.push(x); lo.sort((a, b) => b - a); };\n  const pushHi = (x) => { hi.push(x); hi.sort((a, b) => a - b); };\n  for (const x of nums) {\n    pushLo(x);\n    pushHi(lo.shift());\n    if (hi.length > lo.length) pushLo(hi.shift());\n    out.push(lo.length > hi.length ? lo[0] : (lo[0] + hi[0]) / 2);\n  }\n  return out;\n}`,
    testCases: [
      { label: 'Stream [5, 15, 1, 3]', args: [[5, 15, 1, 3]], expected: [5, 10, 5, 4] },
      { label: 'Negative & duplicate values', args: [[-1, -2, -3, -4]], expected: [-1, -1.5, -2, -2.5] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '295', title: 'Find Median from Data Stream', difficulty: 'Hard', focus: 'Core Dual-Heaps invariant.', trainerSlug: 'find-median-from-data-stream' },
      { platform: 'LeetCode', number: '480', title: 'Sliding Window Median', difficulty: 'Hard', focus: 'Dual Heaps + lazy deletion map.' },
    ],
  },
  'lis-patience-sorting': {
    algorithmId: 'lis-patience-sorting',
    functionName: 'lengthOfLIS',
    title: 'Implement O(N log N) Longest Increasing Subsequence',
    prompt: 'Return the length of the longest strictly increasing subsequence in nums using binary search on tails.',
    structuredSteps: [
      { step: 'Binary search lower_bound', detail: 'Find first index lo where tails[lo] >= x.' },
      { step: 'Replace or append', detail: 'Set tails[lo] = x (extends array when lo === tails.length).' },
      { step: 'Return length', detail: 'tails.length equals the exact LIS length.' },
    ],
    starterCode: `function lengthOfLIS(nums) {\n  // TODO: O(N log N) patience sorting tails array\n  return 0;\n}`,
    solutionCode: `function lengthOfLIS(nums) {\n  const tails = [];\n  for (const x of nums) {\n    let lo = 0, hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < x) lo = mid + 1;\n      else hi = mid;\n    }\n    tails[lo] = x;\n  }\n  return tails.length;\n}`,
    testCases: [
      { label: 'Classic LC 300', args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
      { label: 'All identical (strictly increasing)', args: [[7, 7, 7, 7]], expected: 1 },
      { label: 'Empty array', args: [[]], expected: 0 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '300', title: 'Longest Increasing Subsequence', difficulty: 'Medium', focus: 'O(N log N) lower_bound on tails.' },
      { platform: 'LeetCode', number: '354', title: 'Russian Doll Envelopes', difficulty: 'Hard', focus: '2D sort (w asc, h desc) + LIS.' },
    ],
  },
  'meet-in-the-middle': {
    algorithmId: 'meet-in-the-middle',
    functionName: 'minAbsDifference',
    title: 'Implement Meet-in-the-Middle Closest Subsequence Sum',
    prompt: 'Given nums and integer goal, return the minimum possible value of |sum(subsequence) - goal|.',
    structuredSteps: [
      { step: 'Split & enumerate halves', detail: 'Generate all 2^(N/2) subset sums for left and right halves.' },
      { step: 'Sort right sums', detail: 'Sort rightSums ascending for binary search.' },
      { step: 'Check adjacent matches', detail: 'Binary search goal - sL and test indices lo and lo - 1.' },
    ],
    starterCode: `function minAbsDifference(nums, goal) {\n  // TODO: half-space split + binary search\n  return 0;\n}`,
    solutionCode: `function minAbsDifference(nums, goal) {\n  const gen = (arr) => {\n    let sums = [0];\n    for (const x of arr) {\n      const next = [];\n      for (const s of sums) next.push(s + x);\n      sums = sums.concat(next);\n    }\n    return sums;\n  };\n  const mid = nums.length >> 1;\n  const left = gen(nums.slice(0, mid));\n  const right = gen(nums.slice(mid)).sort((a, b) => a - b);\n  let best = Math.abs(goal);\n  for (const s of left) {\n    const need = goal - s;\n    let lo = 0, hi = right.length;\n    while (lo < hi) {\n      const m = (lo + hi) >> 1;\n      if (right[m] < need) lo = m + 1;\n      else hi = m;\n    }\n    if (lo < right.length) best = Math.min(best, Math.abs(s + right[lo] - goal));\n    if (lo > 0) best = Math.min(best, Math.abs(s + right[lo - 1] - goal));\n    if (best === 0) return 0;\n  }\n  return best;\n}`,
    testCases: [
      { label: 'Classic LC 1755 exact hit', args: [[5, -7, 3, 5], 6], expected: 0 },
      { label: 'Closest non-zero gap', args: [[7, -9, 15, -2], -5], expected: 1 },
      { label: 'Empty subset beats large numbers', args: [[1, 2, 3], -7], expected: 7 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: '1755', title: 'Closest Subsequence Sum', difficulty: 'Hard', focus: 'Canonical N <= 40 Meet in the Middle.' },
      { platform: 'LeetCode', number: '2035', title: 'Partition Array to Minimize Sum Diff', difficulty: 'Hard', focus: 'Half-split grouped by subset size k.' },
    ],
  },
};
