export interface TrickyPatternTemplate {
  patternId: string;
  patternNumber: number;
  title: string;
  subtitle: string;
  frictionLevel: 'High Friction' | 'Interview Trap' | 'Core Engine';
  whenToUse: string;
  keyInvariant: string;
  complexity: string;
  commonPitfalls: string[];
  code: {
    python: string;
    typescript: string;
    java: string;
  };
}

export const DSA28_TRICKY_TEMPLATES: TrickyPatternTemplate[] = [
  {
    patternId: 'binary-search-on-answer',
    patternNumber: 16,
    title: 'Binary Search on Answer',
    subtitle: 'Find the minimum feasible threshold over a monotonic predicate',
    frictionLevel: 'Interview Trap',
    whenToUse:
      'Use when asked to "minimize the maximum" or "maximize the minimum" and you can write an O(n) greedy canFinish(mid) validator.',
    keyInvariant:
      'Invariant: all values < lo are infeasible; all values >= hi are feasible (for finding the minimum valid answer). Loop terminates when lo == hi.',
    complexity: 'Time O(n log(hi - lo)) · Space O(1)',
    commonPitfalls: [
      'Mixing lo <= hi with hi = mid causes an infinite loop — always pair lo < hi with hi = mid and lo = mid + 1.',
      'For maximizing the answer (True...True -> False...False), bias mid upward: mid = lo + (hi - lo + 1) // 2.',
      'Tightly bound [lo, hi] (e.g., [max(weights), sum(weights)]) to avoid invalid mid = 0 divisions.',
    ],
    code: {
      python: `def min_feasible_answer(nums: list[int], limit: int) -> int:
    def is_feasible(cap: int) -> bool:
        groups, current = 1, 0
        for x in nums:
            if current + x > cap:
                groups += 1
                current = x
            else:
                current += x
        return groups <= limit

    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if is_feasible(mid):
            hi = mid          # mid works; keep it in search space
        else:
            lo = mid + 1      # mid fails; strictly discard it
    return lo`,
      typescript: `export function minFeasibleAnswer(nums: number[], limit: number): number {
  const isFeasible = (cap: number): boolean => {
    let groups = 1;
    let current = 0;
    for (const x of nums) {
      if (current + x > cap) {
        groups++;
        current = x;
      } else {
        current += x;
      }
    }
    return groups <= limit;
  };

  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);

  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (isFeasible(mid)) {
      hi = mid;       // keep feasible mid
    } else {
      lo = mid + 1;   // discard infeasible mid
    }
  }
  return lo;
}`,
      java: `public int minFeasibleAnswer(int[] nums, int limit) {
    int lo = 0, hi = 0;
    for (int x : nums) {
        lo = Math.max(lo, x);
        hi += x;
    }

    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (isFeasible(nums, limit, mid)) {
            hi = mid;       // mid is feasible; shrink right bound
        } else {
            lo = mid + 1;   // mid fails; strictly move left bound
        }
    }
    return lo;
}

private boolean isFeasible(int[] nums, int limit, int cap) {
    int groups = 1, current = 0;
    for (int x : nums) {
        if (current + x > cap) {
            groups++;
            current = x;
        } else {
            current += x;
        }
    }
    return groups <= limit;
}`,
    },
  },
  {
    patternId: 'union-find-disjoint-set',
    patternNumber: 25,
    title: 'Union-Find (Path Compression + Union by Rank)',
    subtitle: 'Dynamic connectivity, cycle detection & Kruskal MST in O(α(n))',
    frictionLevel: 'Core Engine',
    whenToUse:
      'Use when edges arrive dynamically in an undirected graph, when merging equivalence classes, or when detecting redundant cycle-creating edges.',
    keyInvariant:
      'find(x) flattens every visited node straight to its component root; union(a, b) attaches the shallower tree under the taller root and returns false on cycles.',
    complexity: 'Time O(α(n)) per op · Space O(n)',
    commonPitfalls: [
      'Comparing parent[a] == parent[b] directly instead of calling find(a) == find(b) misses uncompressed paths.',
      'Forgetting to return false when rootA == rootB breaks cycle detection (Redundant Connection).',
      'Not tracking a live component count forces an extra O(n) root-counting loop at the end.',
    ],
    code: {
      python: `class UnionFind:
    def __init__(self, n: int) -> None:
        self.parent = list(range(n))
        self.rank = [0] * n
        self.components = n

    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # path compression
        return self.parent[x]

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False  # cycle detected / already connected
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        self.components -= 1
        return True`,
      typescript: `export class UnionFind {
  private parent: number[];
  private rank: number[];
  public components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.components = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(a: number, b: number): boolean {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return false; // already connected (cycle)

    if (this.rank[ra] < this.rank[rb]) {
      [ra, rb] = [rb, ra];
    }
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) {
      this.rank[ra]++;
    }
    this.components--;
    return true;
  }
}`,
      java: `class UnionFind {
    private final int[] parent;
    private final int[] rank;
    public int components;

    public UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]); // path compression
        }
        return parent[x];
    }

    public boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false; // cycle detected
        if (rank[ra] < rank[rb]) {
            int tmp = ra; ra = rb; rb = tmp;
        }
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        components--;
        return true;
    }
}`,
    },
  },
  {
    patternId: 'backtracking',
    patternNumber: 27,
    title: 'Backtracking (Subsets, Combinations & Duplicate Pruning)',
    subtitle: 'Choose -> Explore -> Unchoose with sorted sibling deduplication',
    frictionLevel: 'High Friction',
    whenToUse:
      'Use whenever you must enumerate all valid configurations (subsets, combinations, permutations, N-Queens, or 2D grid word search).',
    keyInvariant:
      'Sort first. Inside the sibling loop at depth start, skip i > start && nums[i] == nums[i - 1] so duplicate values never spawn identical subtrees.',
    complexity: 'Time O(n · 2^n) subsets · O(n · n!) permutations',
    commonPitfalls: [
      'Pushing the mutable path reference instead of a snapshot copy (path.slice() / path[:]) corrupts every recorded result.',
      'Skipping nums[i] == nums[i - 1] with i > 0 instead of i > start accidentally blocks valid deeper choices.',
      'Forgetting to undo state (path.pop() or restoring board[r][c]) leaks choices into sibling branches.',
    ],
    code: {
      python: `def combination_sum_unique(candidates: list[int], target: int) -> list[list[int]]:
    candidates.sort()
    res: list[list[int]] = []
    path: list[int] = []

    def dfs(start: int, remaining: int) -> None:
        if remaining == 0:
            res.append(path.copy())  # snapshot copy!
            return

        for i in range(start, len(candidates)):
            # Skip duplicate siblings at the SAME recursion depth
            if i > start and candidates[i] == candidates[i - 1]:
                continue
            if candidates[i] > remaining:
                break  # sorted pruning

            path.append(candidates[i])          # 1. Choose
            dfs(i + 1, remaining - candidates[i])  # 2. Explore (use i to allow reuse)
            path.pop()                          # 3. Unchoose

    dfs(0, target)
    return res`,
      typescript: `export function combinationSumUnique(candidates: number[], target: number): number[][] {
  candidates.sort((a, b) => a - b);
  const res: number[][] = [];
  const path: number[] = [];

  const dfs = (start: number, remaining: number): void => {
    if (remaining === 0) {
      res.push([...path]); // snapshot copy
      return;
    }

    for (let i = start; i < candidates.length; i++) {
      if (i > start && candidates[i] === candidates[i - 1]) continue; // skip sibling dup
      if (candidates[i] > remaining) break; // sorted early exit

      path.push(candidates[i]);             // 1. Choose
      dfs(i + 1, remaining - candidates[i]); // 2. Explore (pass i if reuse allowed)
      path.pop();                           // 3. Unchoose
    }
  };

  dfs(0, target);
  return res;
}`,
      java: `public List<List<Integer>> combinationSumUnique(int[] candidates, int target) {
    Arrays.sort(candidates);
    List<List<Integer>> res = new ArrayList<>();
    dfs(candidates, 0, target, new ArrayList<>(), res);
    return res;
}

private void dfs(int[] nums, int start, int rem, List<Integer> path, List<List<Integer>> res) {
    if (rem == 0) {
        res.add(new ArrayList<>(path)); // snapshot copy
        return;
    }
    for (int i = start; i < nums.length; i++) {
        if (i > start && nums[i] == nums[i - 1]) continue; // skip sibling duplicate
        if (nums[i] > rem) break; // sorted pruning

        path.add(nums[i]);                 // 1. Choose
        dfs(nums, i + 1, rem - nums[i], path, res); // 2. Explore
        path.remove(path.size() - 1);      // 3. Unchoose
    }
}`,
    },
  },
  {
    patternId: 'dynamic-sliding-window',
    patternNumber: 6,
    title: 'Dynamic Sliding Window (Minimum Window Substring)',
    subtitle: 'Expand right to satisfy, shrink left while valid',
    frictionLevel: 'High Friction',
    whenToUse:
      'Use for shortest or longest contiguous subarrays/substrings whose validity changes monotonically as pointers advance.',
    keyInvariant:
      'Maintain a single formed == required counter instead of rescanning the frequency map on every step, keeping total runtime strictly O(|s| + |t|).',
    complexity: 'Time O(|s| + |t|) · Space O(|Σ|)',
    commonPitfalls: [
      'Comparing frequency maps in O(26) or O(|t|) inside the loop degrades efficiency and adds edge-case bugs.',
      'Using != instead of exact equality transitions (have[c] == need[c]) double-increments formed.',
      'Forgetting to check if bestLen stayed Infinity when no valid window exists.',
    ],
    code: {
      python: `from collections import Counter

def min_window(s: str, t: str) -> str:
    if not s or not t:
        return ""
    need = Counter(t)
    have: dict[str, int] = {}
    formed, required = 0, len(need)
    best = (float("inf"), 0, 0)
    left = 0

    for right, ch in enumerate(s):
        have[ch] = have.get(ch, 0) + 1
        if ch in need and have[ch] == need[ch]:
            formed += 1

        while formed == required:
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            out = s[left]
            have[out] -= 1
            if out in need and have[out] < need[out]:
                formed -= 1
            left += 1

    return "" if best[0] == float("inf") else s[best[1] : best[2] + 1]`,
      typescript: `export function minWindow(s: string, t: string): string {
  if (!s || !t) return '';
  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);

  const have = new Map<string, number>();
  let formed = 0;
  const required = need.size;
  let bestLen = Infinity;
  let bestStart = 0;
  let left = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    have.set(ch, (have.get(ch) ?? 0) + 1);
    if (need.has(ch) && have.get(ch) === need.get(ch)) {
      formed++;
    }

    while (formed === required) {
      if (right - left + 1 < bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const out = s[left++];
      have.set(out, (have.get(out) ?? 0) - 1);
      if (need.has(out) && (have.get(out) ?? 0) < (need.get(out) ?? 0)) {
        formed--;
      }
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}`,
      java: `public String minWindow(String s, String t) {
    if (s.isEmpty() || t.isEmpty()) return "";
    int[] need = new int[128], have = new int[128];
    int required = 0;
    for (char c : t.toCharArray()) {
        if (need[c]++ == 0) required++;
    }

    int formed = 0, left = 0, bestLen = Integer.MAX_VALUE, bestStart = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (++have[c] == need[c]) formed++;

        while (formed == required) {
            if (right - left + 1 < bestLen) {
                bestLen = right - left + 1;
                bestStart = left;
            }
            char out = s.charAt(left++);
            if (have[out]-- == need[out]) formed--;
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
}`,
    },
  },
  {
    patternId: 'prefix-sum-difference-array',
    patternNumber: 2,
    title: 'Prefix Sum + HashMap (Subarray Sum Equals K)',
    subtitle: 'Count target subarrays in O(n) even with negative numbers',
    frictionLevel: 'Interview Trap',
    whenToUse:
      'Use instead of Sliding Window whenever the array can contain negative numbers or zeroes and you need subarrays matching a sum or remainder.',
    keyInvariant:
      'Seed countMap with {0: 1} before scanning. Look up (prefix - k) BEFORE inserting the current prefix into countMap so k = 0 never self-matches.',
    complexity: 'Time O(n) · Space O(n)',
    commonPitfalls: [
      'Forgetting {0: 1} drops every valid subarray that starts at index 0.',
      'Updating countMap[prefix] before querying countMap[prefix - k] fails catastrophically when k == 0.',
      'In modulo problems, forgetting ((prefix % k) + k) % k produces negative keys in JS/Java.',
    ],
    code: {
      python: `def subarray_sum_equals_k(nums: list[int], k: int) -> int:
    counts = {0: 1}  # empty prefix before index 0
    prefix = 0
    total = 0

    for x in nums:
        prefix += x
        total += counts.get(prefix - k, 0)  # query BEFORE updating!
        counts[prefix] = counts.get(prefix, 0) + 1

    return total`,
      typescript: `export function subarraySumEqualsK(nums: number[], k: number): number {
  const counts = new Map<number, number>([[0, 1]]);
  let prefix = 0;
  let total = 0;

  for (const x of nums) {
    prefix += x;
    total += counts.get(prefix - k) ?? 0; // query before inserting
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
  }
  return total;
}`,
      java: `public int subarraySumEqualsK(int[] nums, int k) {
    Map<Integer, Integer> counts = new HashMap<>();
    counts.put(0, 1); // empty prefix
    int prefix = 0, total = 0;

    for (int x : nums) {
        prefix += x;
        total += counts.getOrDefault(prefix - k, 0); // query before put
        counts.merge(prefix, 1, Integer::sum);
    }
    return total;
}`,
    },
  },
  {
    patternId: 'in-place-linked-list-reversal',
    patternNumber: 12,
    title: 'In-Place Linked List Reversal (k-Group)',
    subtitle: 'Rewire k-node segments cleanly with dummy + groupPrev anchors',
    frictionLevel: 'High Friction',
    whenToUse:
      'Use when rewiring sub-segments or k-groups in O(1) space without losing head/tail pointers.',
    keyInvariant:
      'Keep groupPrev pointing right before the k-block and groupNext pointing right after the k-block. Initialize prev = groupNext so the reversed tail links automatically.',
    complexity: 'Time O(n) · Space O(1)',
    commonPitfalls: [
      'Reversing a trailing block with fewer than k nodes instead of checking kth exists first.',
      'Forgetting to save oldGroupHead = groupPrev.next before updating groupPrev.next = kth.',
      'Not advancing groupPrev = oldGroupHead (which became the new tail of the reversed group).',
    ],
    code: {
      python: `def reverse_k_group(head, k: int):
    dummy = ListNode(0, head)
    group_prev = dummy

    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next

        group_next = kth.next
        prev, curr = group_next, group_prev.next
        while curr is not group_next:
            nxt = curr.next
            curr.next = prev
            prev = curr
            curr = nxt

        new_tail = group_prev.next
        group_prev.next = kth
        group_prev = new_tail`,
      typescript: `export function reverseKGroup(head: ListNode | null, k: number): ListNode | null {
  const dummy = new ListNode(0, head);
  let groupPrev = dummy;

  while (true) {
    let kth: ListNode | null = groupPrev;
    for (let i = 0; i < k; i++) {
      kth = kth?.next ?? null;
      if (!kth) return dummy.next;
    }

    const groupNext = kth.next;
    let prev: ListNode | null = groupNext;
    let curr: ListNode | null = groupPrev.next;

    while (curr !== groupNext && curr !== null) {
      const nxt = curr.next;
      curr.next = prev;
      prev = curr;
      curr = nxt;
    }

    const newTail = groupPrev.next!;
    groupPrev.next = kth;
    groupPrev = newTail;
  }
}`,
      java: `public ListNode reverseKGroup(ListNode head, int k) {
    ListNode dummy = new ListNode(0, head);
    ListNode groupPrev = dummy;

    while (true) {
        ListNode kth = groupPrev;
        for (int i = 0; i < k; i++) {
            kth = kth.next;
            if (kth == null) return dummy.next;
        }

        ListNode groupNext = kth.next;
        ListNode prev = groupNext, curr = groupPrev.next;
        while (curr != groupNext) {
            ListNode nxt = curr.next;
            curr.next = prev;
            prev = curr;
            curr = nxt;
        }

        ListNode newTail = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = newTail;
    }
}`,
    },
  },
  {
    patternId: 'monotonic-stack',
    patternNumber: 13,
    title: 'Monotonic Stack (Next Greater & Histogram Boundaries)',
    subtitle: 'Resolve left and right smaller/greater spans in one O(n) pass',
    frictionLevel: 'Interview Trap',
    whenToUse:
      'Use when every bar or element needs the nearest strictly greater or smaller neighbor on its left and/or right.',
    keyInvariant:
      'Store indices (not raw values) in increasing height order. Appending a virtual 0 height at i == n forces every remaining bar on the stack to flush and score.',
    complexity: 'Time O(n) · Space O(n)',
    commonPitfalls: [
      'Pushing values instead of indices makes width computation (i - stack.top() - 1) impossible.',
      'Forgetting the trailing sentinel 0 leaves ascending bars unscored on the stack.',
      'In duplicate-element contribution problems (Sum of Subarray Minimums), use < on one side and <= on the other.',
    ],
    code: {
      python: `def largest_rectangle_area(heights: list[int]) -> int:
    stack: list[int] = []  # monotonic increasing bar indices
    best = 0
    n = len(heights)

    for i in range(n + 1):
        curr_h = 0 if i == n else heights[i]
        while stack and heights[stack[-1]] > curr_h:
            h = heights[stack.pop()]
            left_bound = stack[-1] if stack else -1
            width = i - left_bound - 1
            best = max(best, h * width)
        stack.append(i)

    return best`,
      typescript: `export function largestRectangleArea(heights: number[]): number {
  const stack: number[] = [];
  let best = 0;

  for (let i = 0; i <= heights.length; i++) {
    const currH = i === heights.length ? 0 : heights[i];
    while (stack.length > 0 && heights[stack[stack.length - 1]] > currH) {
      const h = heights[stack.pop()!];
      const leftBound = stack.length > 0 ? stack[stack.length - 1] : -1;
      const width = i - leftBound - 1;
      best = Math.max(best, h * width);
    }
    stack.push(i);
  }
  return best;
}`,
      java: `public int largestRectangleArea(int[] heights) {
    Deque<Integer> stack = new ArrayDeque<>();
    int best = 0, n = heights.length;

    for (int i = 0; i <= n; i++) {
        int currH = (i == n) ? 0 : heights[i];
        while (!stack.isEmpty() && heights[stack.peek()] > currH) {
            int h = heights[stack.pop()];
            int leftBound = stack.isEmpty() ? -1 : stack.peek();
            best = Math.max(best, h * (i - leftBound - 1));
        }
        stack.push(i);
    }
    return best;
}`,
    },
  },
  {
    patternId: 'monotonic-deque',
    patternNumber: 14,
    title: 'Monotonic Deque (Sliding Window Maximum)',
    subtitle: 'O(1) amortized window extrema via front expiry + back pruning',
    frictionLevel: 'Interview Trap',
    whenToUse:
      'Use when querying max/min over a moving window of length k or accelerating sliding-range DP recurrences.',
    keyInvariant:
      'Indices in the deque stay strictly increasing from front to back while their values stay strictly decreasing. Front is always the active window maximum.',
    complexity: 'Time O(n) · Space O(k)',
    commonPitfalls: [
      'Calling Array.shift() on a JS array degrades to O(nk) on worst-case inputs — use a head pointer or ring buffer.',
      'Checking deque[head] < i - k instead of <= i - k retains an index from the previous window.',
      'Recording answers before i >= k - 1 emits partial-window values.',
    ],
    code: {
      python: `from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()  # stores indices in decreasing value order
    out: list[int] = []

    for i, val in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()                       # 1. Evict expired front
        while dq and nums[dq[-1]] <= val:
            dq.pop()                           # 2. Drop dominated back
        dq.append(i)                           # 3. Push current index
        if i >= k - 1:
            out.append(nums[dq[0]])            # 4. Front is window max

    return out`,
      typescript: `export function maxSlidingWindow(nums: number[], k: number): number[] {
  const dq: number[] = []; // ring-like array using head index for O(1) pop-front
  let head = 0;
  const out: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    if (head < dq.length && dq[head] <= i - k) {
      head++;                                      // 1. Evict expired front
    }
    while (head < dq.length && nums[dq[dq.length - 1]] <= nums[i]) {
      dq.pop();                                    // 2. Drop dominated back
    }
    dq.push(i);                                    // 3. Push current index
    if (i >= k - 1) {
      out.push(nums[dq[head]]);                    // 4. Front is window max
    }
  }
  return out;
}`,
      java: `public int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> dq = new ArrayDeque<>();
    int[] out = new int[nums.length - k + 1];

    for (int i = 0; i < nums.length; i++) {
        if (!dq.isEmpty() && dq.peekFirst() <= i - k) {
            dq.pollFirst();                        // 1. Evict expired front
        }
        while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) {
            dq.pollLast();                         // 2. Drop dominated back
        }
        dq.offerLast(i);                           // 3. Push current index
        if (i >= k - 1) {
            out[i - k + 1] = nums[dq.peekFirst()]; // 4. Front is window max
        }
    }
    return out;
}`,
    },
  },
  {
    patternId: 'modified-binary-search',
    patternNumber: 15,
    title: 'Modified Binary Search (Rotated Sorted Array)',
    subtitle: 'Identify the guaranteed sorted half around mid before narrowing',
    frictionLevel: 'Interview Trap',
    whenToUse:
      'Use when searching in rotated sorted arrays, mountain/bitonic arrays, or locating exact boundary indices in O(log n).',
    keyInvariant:
      'At least one of [lo..mid] or [mid..hi] is strictly sorted. Use <= on nums[lo] <= nums[mid] so 2-element ranges resolve cleanly.',
    complexity: 'Time O(log n) · Space O(1)',
    commonPitfalls: [
      'Using < instead of <= in nums[lo] <= nums[mid] breaks when lo == mid (2 elements left).',
      'Testing target against unsorted bounds instead of the identified sorted half.',
      'If duplicates are allowed (LC #81), shrink lo++ and hi-- when nums[lo] == nums[mid] == nums[hi].',
    ],
    code: {
      python: `def search_rotated(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if nums[mid] == target:
            return mid

        if nums[lo] <= nums[mid]:  # Left half [lo..mid] is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                      # Right half [mid..hi] is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      typescript: `export function searchRotated(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) { // Left half is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    } else {                     // Right half is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
  }
  return -1;
}`,
      java: `public int searchRotated(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;

        if (nums[lo] <= nums[mid]) { // Left half is sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                     // Right half is sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`,
    },
  },
  {
    patternId: 'two-heaps',
    patternNumber: 18,
    title: 'Two Heaps (Streaming Median)',
    subtitle: 'Maintain low max-heap and high min-heap with size diff <= 1',
    frictionLevel: 'High Friction',
    whenToUse:
      'Use for streaming medians, dynamic percentiles, or two-stage greedy scheduling where items unlock from one priority order into another.',
    keyInvariant:
      'Every value in low (max-heap) <= every value in high (min-heap), and len(low) is always equal to len(high) or len(high) + 1.',
    complexity: 'Time O(log n) add · O(1) median · Space O(n)',
    commonPitfalls: [
      'Pushing straight into high without passing through low can violate the ordering invariant max(low) <= min(high).',
      'In Python, forgetting to negate values pushed into the max-heap (low) silently makes it a min-heap.',
      'Using integer division instead of / 2.0 on even counts truncates the median.',
    ],
    code: {
      python: `import heapq

class MedianFinder:
    def __init__(self) -> None:
        self.low: list[int] = []   # max-heap (negated values)
        self.high: list[int] = []  # min-heap

    def add_num(self, num: int) -> None:
        # 1. Always push into low, then move largest of low to high
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))

        # 2. Keep len(low) >= len(high)
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2.0`,
      typescript: `// Assumes standard binary heap helper Heap<number>(comparator)
export class MedianFinder {
  private low = new Heap<number>((a, b) => b - a);  // max-heap (lower half)
  private high = new Heap<number>((a, b) => a - b); // min-heap (upper half)

  addNum(num: number): void {
    this.low.push(num);
    this.high.push(this.low.pop()!); // guarantees max(low) <= min(high)

    if (this.high.size() > this.low.size()) {
      this.low.push(this.high.pop()!); // keep low.size >= high.size
    }
  }

  findMedian(): number {
    if (this.low.size() > this.high.size()) {
      return this.low.peek()!;
    }
    return (this.low.peek()! + this.high.peek()!) / 2;
  }
}`,
      java: `class MedianFinder {
    private final PriorityQueue<Integer> low = new PriorityQueue<>(Collections.reverseOrder());
    private final PriorityQueue<Integer> high = new PriorityQueue<>();

    public void addNum(int num) {
        low.offer(num);
        high.offer(low.poll()); // enforce max(low) <= min(high)
        if (high.size() > low.size()) {
            low.offer(high.poll()); // keep low.size >= high.size
        }
    }

    public double findMedian() {
        if (low.size() > high.size()) return low.peek();
        return (low.peek() + high.peek()) / 2.0;
    }
}`,
    },
  },
  {
    patternId: 'k-way-merge',
    patternNumber: 19,
    title: 'K-Way Merge (Min-Heap Frontier)',
    subtitle: 'Merge K sorted lists or matrix rows with an O(k) heap frontier',
    frictionLevel: 'Core Engine',
    whenToUse:
      'Use whenever you have K sorted arrays, linked lists, or matrix rows and need their global sorted order or Kth smallest element.',
    keyInvariant:
      'The min-heap holds at most one active head element from each of the K streams. Pop the global min and immediately replenish from that exact stream.',
    complexity: 'Time O(N log k) · Space O(k)',
    commonPitfalls: [
      'In Python heapq, pushing (node.val, node) crashes with TypeError on ties — include a tie-breaker index: (node.val, idx, node).',
      'Forgetting to skip empty/null input lists when seeding the initial heap.',
      'Re-inserting already-visited (row, col) pairs in 2D matrix merges when expanding both right and down without a visited guard.',
    ],
    code: {
      python: `import heapq

def merge_k_lists(lists: list) -> object:
    heap = []
    for idx, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, idx, node))  # idx breaks ties safely

    dummy = tail = ListNode(0)
    while heap:
        _, idx, node = heapq.heappop(heap)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(heap, (node.next.val, idx, node.next))
    return dummy.next`,
      typescript: `export function mergeKSortedArrays(arrays: number[][]): number[] {
  // Heap stores [value, listIdx, elemIdx]
  const heap = new Heap<[number, number, number]>((a, b) => a[0] - b[0]);
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) heap.push([arrays[i][0], i, 0]);
  }

  const merged: number[] = [];
  while (heap.size() > 0) {
    const [val, listIdx, elemIdx] = heap.pop()!;
    merged.push(val);
    if (elemIdx + 1 < arrays[listIdx].length) {
      heap.push([arrays[listIdx][elemIdx + 1], listIdx, elemIdx + 1]);
    }
  }
  return merged;
}`,
      java: `public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a.val));
    for (ListNode head : lists) {
        if (head != null) pq.offer(head);
    }

    ListNode dummy = new ListNode(0), tail = dummy;
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        tail.next = node;
        tail = tail.next;
        if (node.next != null) pq.offer(node.next);
    }
    return dummy.next;
}`,
    },
  },
  {
    patternId: 'trie-prefix-tree',
    patternNumber: 22,
    title: 'Trie (Prefix Tree)',
    subtitle: 'O(L) prefix indexing for autocomplete, wildcard match & Word Search II',
    frictionLevel: 'Core Engine',
    whenToUse:
      'Use when matching many words by shared prefix, handling "." wildcards, or pruning multi-word DFS over a character grid.',
    keyInvariant:
      'Walking a prefix only checks node existence; exact word lookup additionally verifies curr.isEnd === true.',
    complexity: 'Time O(L) per operation · Space O(total inserted chars)',
    commonPitfalls: [
      'Returning true for search("app") when only "apple" was inserted because isEnd was not checked.',
      'Not pruning empty leaf nodes after matching a word in Word Search II causes TLE on large boards.',
      'Using a fixed 26-slot array when input contains uppercase, digits, or Unicode (use Map/dict instead).',
    ],
    code: {
      python: `class TrieNode:
    __slots__ = ("children", "is_end")
    def __init__(self) -> None:
        self.children: dict[str, TrieNode] = {}
        self.is_end = False

class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def _walk(self, prefix: str) -> TrieNode | None:
        node = self.root
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None`,
      typescript: `class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
}

export class Trie {
  private root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
  }

  private walk(prefix: string): TrieNode | null {
    let node: TrieNode | undefined = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word: string): boolean {
    return this.walk(word)?.isEnd ?? false;
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== null;
  }
}`,
      java: `class Trie {
    private static class Node {
        Node[] next = new Node[26];
        boolean isEnd;
    }
    private final Node root = new Node();

    public void insert(String word) {
        Node curr = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (curr.next[i] == null) curr.next[i] = new Node();
            curr = curr.next[i];
        }
        curr.isEnd = true;
    }

    private Node walk(String s) {
        Node curr = root;
        for (char c : s.toCharArray()) {
            curr = curr.next[c - 'a'];
            if (curr == null) return null;
        }
        return curr;
    }

    public boolean search(String word) {
        Node n = walk(word);
        return n != null && n.isEnd;
    }

    public boolean startsWith(String prefix) {
        return walk(prefix) != null;
    }
}`,
    },
  },
  {
    patternId: 'graph-bfs-multi-source',
    patternNumber: 23,
    title: 'Multi-Source Graph BFS',
    subtitle: 'Simultaneous wave propagation for shortest unweighted grid distances',
    frictionLevel: 'Core Engine',
    whenToUse:
      'Use when spreading state from multiple starting cells at once (Rotting Oranges, 01 Matrix, Walls & Gates) or finding minimum steps in an unweighted grid.',
    keyInvariant:
      'Enqueue ALL starting sources at step 0 and mark neighbors visited AT ENQUEUE TIME so no cell is ever pushed into the queue twice.',
    complexity: 'Time O(R · C) · Space O(R · C)',
    commonPitfalls: [
      'Marking visited on pop instead of on enqueue causes exponential duplicate pushes in grids (MLE / TLE).',
      'Counting an extra wave when the final queue layer has no fresh neighbors left.',
      'Not checking for remaining unreachable fresh targets after the queue empties.',
    ],
    code: {
      python: `from collections import deque

def oranges_rotting(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    q: deque[tuple[int, int]] = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while q and fresh > 0:
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2  # mark visited ON ENQUEUE
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1

    return minutes if fresh == 0 else -1`,
      typescript: `export function orangesRotting(grid: number[][]): number {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: Array<[number, number]> = [];
  let head = 0;
  let fresh = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  let minutes = 0;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  while (head < queue.length && fresh > 0) {
    const levelSize = queue.length - head;
    for (let i = 0; i < levelSize; i++) {
      const [r, c] = queue[head++];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          grid[nr][nc] = 2; // mark visited immediately on enqueue
          fresh--;
          queue.push([nr, nc]);
        }
      }
    }
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}`,
      java: `public int orangesRotting(int[][] grid) {
    int rows = grid.length, cols = grid[0].length, fresh = 0;
    Queue<int[]> q = new ArrayDeque<>();
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) q.offer(new int[]{r, c});
            else if (grid[r][c] == 1) fresh++;
        }
    }

    int minutes = 0;
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!q.isEmpty() && fresh > 0) {
        for (int size = q.size(); size > 0; size--) {
            int[] cur = q.poll();
            for (int[] d : dirs) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2; // mark on enqueue
                    fresh--;
                    q.offer(new int[]{nr, nc});
                }
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`,
    },
  },
  {
    patternId: 'topological-sort',
    patternNumber: 24,
    title: "Topological Sort (Kahn's BFS Algorithm)",
    subtitle: 'Dependency ordering & directed cycle detection in O(V + E)',
    frictionLevel: 'Core Engine',
    whenToUse:
      'Use whenever tasks, courses, or characters have directed prerequisite edges and you need a valid order or cycle check.',
    keyInvariant:
      'A node enters the queue the exact moment its indegree hits 0. If the resulting order has fewer than V nodes, a directed cycle exists.',
    complexity: 'Time O(V + E) · Space O(V + E)',
    commonPitfalls: [
      'Reversing prerequisite edge direction: [course, prereq] means prereq -> course, so indegree[course]++.',
      'Forgetting to check order.length === numNodes silently returns a partial order when a cycle exists.',
      'In Alien Dictionary, forgetting the prefix invalidity check ("abc" before "ab" -> impossible).',
    ],
    code: {
      python: `from collections import deque

def topo_sort_kahn(num_nodes: int, prerequisites: list[list[int]]) -> list[int]:
    adj: list[list[int]] = [[] for _ in range(num_nodes)]
    indegree = [0] * num_nodes

    for course, prereq in prerequisites:
        adj[prereq].append(course)
        indegree[course] += 1

    q = deque(i for i in range(num_nodes) if indegree[i] == 0)
    order: list[int] = []

    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0:
                q.append(v)

    return order if len(order) == num_nodes else []  # [] signals a cycle`,
      typescript: `export function topoSortKahn(numNodes: number, prerequisites: number[][]): number[] {
  const adj: number[][] = Array.from({ length: numNodes }, () => []);
  const indegree = new Array<number>(numNodes).fill(0);

  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course);
    indegree[course]++;
  }

  const queue: number[] = [];
  for (let i = 0; i < numNodes; i++) {
    if (indegree[i] === 0) queue.push(i);
  }

  const order: number[] = [];
  let head = 0;
  while (head < queue.length) {
    const u = queue[head++];
    order.push(u);
    for (const v of adj[u]) {
      if (--indegree[v] === 0) queue.push(v);
    }
  }
  return order.length === numNodes ? order : [];
}`,
      java: `public int[] topoSortKahn(int numNodes, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < numNodes; i++) adj.add(new ArrayList<>());
    int[] indegree = new int[numNodes];

    for (int[] e : prerequisites) {
        adj.get(e[1]).add(e[0]);
        indegree[e[0]]++;
    }

    Queue<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < numNodes; i++) {
        if (indegree[i] == 0) q.offer(i);
    }

    int[] order = new int[numNodes];
    int idx = 0;
    while (!q.isEmpty()) {
        int u = q.poll();
        order[idx++] = u;
        for (int v : adj.get(u)) {
            if (--indegree[v] == 0) q.offer(v);
        }
    }
    return idx == numNodes ? order : new int[0];
}`,
    },
  },
  {
    patternId: 'shortest-path-weighted',
    patternNumber: 26,
    title: 'Dijkstra Shortest Path (Lazy Heap + Stale Skip)',
    subtitle: 'Minimum-cost paths on weighted graphs with non-negative edges',
    frictionLevel: 'High Friction',
    whenToUse:
      'Use for shortest weighted paths when all edge weights >= 0. Switch to K-round Bellman-Ford when negative weights or a K-stop cap applies.',
    keyInvariant:
      'Skip any popped (d, u) where d > dist[u]. The first time a node is popped with d == dist[u], its shortest distance from src is permanently finalized.',
    complexity: 'Time O((V + E) log V) · Space O(V + E)',
    commonPitfalls: [
      'Omitting the stale-entry check (if d > dist[u]: continue) re-expands edges needlessly and causes TLE on dense graphs.',
      'Running Dijkstra on negative edge weights yields wrong answers — use Bellman-Ford instead.',
      'In Cheapest Flights Within K Stops, relaxing directly into dist[] lets multiple flights chain inside one stop round.',
    ],
    code: {
      python: `import heapq

def dijkstra(n: int, edges: list[tuple[int, int, int]], src: int) -> list[int]:
    adj: list[list[tuple[int, int]]] = [[] for _ in range(n)]
    for u, v, w in edges:
        adj[u].append((v, w))

    dist = [float("inf")] * n
    dist[src] = 0
    heap: list[tuple[int, int]] = [(0, src)]

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue  # stale heap entry — skip!
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(heap, (nd, v))

    return dist`,
      typescript: `export function dijkstra(
  n: number,
  edges: Array<[number, number, number]>,
  src: number
): number[] {
  const adj: Array<Array<[number, number]>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) adj[u].push([v, w]);

  const dist = new Array<number>(n).fill(Infinity);
  dist[src] = 0;
  const heap = new Heap<[number, number]>((a, b) => a[0] - b[0]);
  heap.push([0, src]);

  while (heap.size() > 0) {
    const [d, u] = heap.pop()!;
    if (d > dist[u]) continue; // skip stale entry

    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd < dist[v]) {
        dist[v] = nd;
        heap.push([nd, v]);
      }
    }
  }
  return dist;
}`,
      java: `public int[] dijkstra(int n, int[][] edges, int src) {
    List<List<int[]>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    for (int[] e : edges) adj.get(e[0]).add(new int[]{e[1], e[2]});

    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[src] = 0;

    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));
    pq.offer(new int[]{0, src});

    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int d = cur[0], u = cur[1];
        if (d > dist[u]) continue; // skip stale entry

        for (int[] next : adj.get(u)) {
            int v = next[0], nd = d + next[1];
            if (nd < dist[v]) {
                dist[v] = nd;
                pq.offer(new int[]{nd, v});
            }
        }
    }
    return dist;
}`,
    },
  },
  {
    patternId: 'dynamic-programming',
    patternNumber: 28,
    title: 'Dynamic Programming (0/1 Knapsack vs. Unbounded & 2D LCS)',
    subtitle: 'Loop direction decides reuse; rolling 1D cuts memory',
    frictionLevel: 'High Friction',
    whenToUse:
      'Use when optimal substructure and overlapping subproblems exist — coins, subset sums, string alignment, LIS, and interval splits.',
    keyInvariant:
      '0/1 Knapsack iterates capacity BACKWARD (each item used once); Unbounded Knapsack iterates capacity FORWARD (items reusable).',
    complexity: 'Time O(items · capacity) · Space O(capacity)',
    commonPitfalls: [
      'Iterating forward on 0/1 Knapsack (Partition Equal Subset Sum) accidentally reuses the same element multiple times.',
      'Swapping outer/inner loops in Coin Change II counts permutations instead of combinations.',
      'Using Infinity + 1 in Java with Integer.MAX_VALUE causes integer overflow — use amount + 1 as the sentinel.',
    ],
    code: {
      python: `# 1) Unbounded Knapsack (Coin Change — forward capacity loop)
def coin_change(coins: list[int], amount: int) -> int:
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for c in coins:
        for a in range(c, amount + 1):  # forward = unlimited reuse
            dp[a] = min(dp[a], 1 + dp[a - c])
    return -1 if dp[amount] > amount else dp[amount]

# 2) 0/1 Knapsack (Partition Equal Subset Sum — backward capacity loop)
def can_partition(nums: list[int]) -> bool:
    total = sum(nums)
    if total % 2 != 0:
        return False
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for x in nums:
        for s in range(target, x - 1, -1):  # backward = use x at most once
            dp[s] = dp[s] or dp[s - x]
    return dp[target]`,
      typescript: `// 1) Unbounded Knapsack (Coin Change — forward capacity loop)
export function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) {
      dp[a] = Math.min(dp[a], 1 + dp[a - c]);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}

// 2) 0/1 Knapsack (Partition Equal Subset Sum — backward capacity loop)
export function canPartition(nums: number[]): boolean {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const dp = new Array<boolean>(target + 1).fill(false);
  dp[0] = true;
  for (const x of nums) {
    for (let s = target; s >= x; s--) {
      dp[s] = dp[s] || dp[s - x];
    }
  }
  return dp[target];
}`,
      java: `// 1) Unbounded Knapsack (Coin Change — forward capacity loop)
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1); // safe sentinel (no MAX_VALUE overflow)
    dp[0] = 0;
    for (int c : coins) {
        for (int a = c; a <= amount; a++) {
            dp[a] = Math.min(dp[a], 1 + dp[a - c]);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

// 2) 0/1 Knapsack (Partition Equal Subset Sum — backward capacity loop)
public boolean canPartition(int[] nums) {
    int total = 0;
    for (int x : nums) total += x;
    if (total % 2 != 0) return false;
    int target = total / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int x : nums) {
        for (int s = target; s >= x; s--) {
            dp[s] = dp[s] || dp[s - x];
        }
    }
    return dp[target];
}`,
    },
  },
];
