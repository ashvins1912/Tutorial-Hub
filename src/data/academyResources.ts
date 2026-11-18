export interface TopicResourceRecord {
  topicId: string;
  topicTitle: string;
  tier: string;
  coverageChecklist: {
    subConcept: string;
    isCore: boolean;
    intuitionSummary: string;
  }[];
  curatedLinks: {
    academicLecture: {
      institution: string;
      courseCode: string;
      professor: string;
      title: string;
      url: string;
      watchForBullets: string[];
    };
    visualExplainer: {
      educator: string;
      title: string;
      url: string;
      bestFor: string;
    };
    sheetsAndRoadmaps: {
      platform: string;
      title: string;
      url: string;
    }[];
  };
  analyticalBlueprint: {
    constraintRule: string;
    loopInvariant: string;
    bottleneckPattern: string;
  };
}

export const TOPIC_RESOURCES: TopicResourceRecord[] = [
  {
    topicId: 'arrays-hashing',
    topicTitle: 'Arrays, Hashing & Lookup Compression',
    tier: 'Noob -> Apprentice',
    coverageChecklist: [
      { subConcept: 'Contiguous Memory & O(1) Indexing', isCore: true, intuitionSummary: 'Index arithmetic jumps directly to address base + i * size.' },
      { subConcept: 'Collision-Resistant Hash Functions & Load Factor', isCore: true, intuitionSummary: 'Expected O(1) lookup trades O(N) extra space to eliminate inner scans.' },
      { subConcept: 'Frequency Maps vs Complement Maps', isCore: true, intuitionSummary: 'Store counts for anagrams/duplicates; store value->index for pair sums.' },
      { subConcept: 'Prefix Sum Accumulation', isCore: false, intuitionSummary: 'Range sum [L..R] = prefix[R] - prefix[L-1] in O(1).' },
    ],
    curatedLinks: {
      academicLecture: {
        institution: 'MIT OpenCourseWare',
        courseCode: '6.006',
        professor: 'Erik Demaine & Jason Ku',
        title: 'Hashing (Lecture 4: Direct Access & Hash Tables)',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        watchForBullets: [
          'Why direct access arrays waste memory on large key universes',
          'Universal hashing & chaining expected O(1) proof',
          'Amortized table doubling when load factor exceeds capacity',
        ],
      },
      visualExplainer: {
        educator: 'VisuAlgo',
        title: 'Hash Table (Linear Probing & Separate Chaining)',
        url: 'https://visualgo.net/en/hashtable',
        bestFor: 'Visualizing bucket collisions and load-factor rehashing in real time.',
      },
      sheetsAndRoadmaps: [
        { platform: 'Striver A2Z Sheet', title: 'Step 3: Arrays (Easy -> Medium -> Hard)', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' },
        { platform: 'AlgoMaster', title: 'Top 20 Coding Patterns — HashMap & Prefix Sum', url: 'https://algomaster.io/' },
        { platform: 'NamasteDev DSA', title: 'Arrays & Time-Space Tradeoffs Foundation', url: 'https://namastedev.com/' },
      ],
    },
    analyticalBlueprint: {
      constraintRule: 'Unsorted input with N <= 10^5 forbids O(N^2) pair scans -> trade O(N) space for HashMap.',
      loopInvariant: 'Map always holds elements strictly before index i so an element never pairs with itself.',
      bottleneckPattern: 'Inner linear search asking "have I seen (target - x)?"',
    },
  },
  {
    topicId: 'sliding-window',
    topicTitle: 'Sliding Window & Two Pointers',
    tier: 'Practitioner',
    coverageChecklist: [
      { subConcept: 'Fixed-Size Window vs Dynamic Expand/Shrink', isCore: true, intuitionSummary: 'Fixed windows slide both L and R together; dynamic windows expand R and shrink L on violation.' },
      { subConcept: 'Monotonic Validity Property', isCore: true, intuitionSummary: 'Valid only when adding elements keeps condition monotonic (breaks with negative numbers).' },
      { subConcept: 'Stale Map Guard (Math.max(left, lastIdx + 1))', isCore: true, intuitionSummary: 'Never allow the left boundary to jump backward on old characters.' },
      { subConcept: 'Converging Two Pointers (L=0, R=n-1)', isCore: true, intuitionSummary: 'Eliminate O(N) auxiliary arrays by advancing whichever wall is shorter or smaller.' },
    ],
    curatedLinks: {
      academicLecture: {
        institution: 'Princeton University',
        courseCode: 'COS 226',
        professor: 'Robert Sedgewick & Kevin Wayne',
        title: 'Algorithms — Analysis of Linear & Amortized Pointer Scans',
        url: 'https://algs4.cs.princeton.edu/home/',
        watchForBullets: [
          'Amortized 2N pointer movements proof',
          'Why monotonic invariants guarantee optimal sub-ranges are never skipped',
        ],
      },
      visualExplainer: {
        educator: 'NeetCode',
        title: 'Sliding Window & Two Pointers Visual Breakdown',
        url: 'https://neetcode.io/roadmap',
        bestFor: 'Spotting exact expand/shrink loop conditions across string & array problems.',
      },
      sheetsAndRoadmaps: [
        { platform: 'AlgoMaster', title: 'Sliding Window & Two Pointers Golden Templates', url: 'https://algomaster.io/' },
        { platform: 'Striver A2Z Sheet', title: 'Step 10: Sliding Window & Two Pointer Combined', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' },
        { platform: 'NamasteDev DSA', title: 'Two Pointers & Sliding Window Mastery', url: 'https://namastedev.com/' },
      ],
    },
    analyticalBlueprint: {
      constraintRule: '"Contiguous subarray/substring" + N <= 10^5 -> O(N) dynamic window.',
      loopInvariant: 'After shrinking Left, [left..right] always satisfies the problem invariant.',
      bottleneckPattern: 'Discarding valid overlapping prefixes and restarting inner loop j = i.',
    },
  },
  {
    topicId: 'monotonic-stack',
    topicTitle: 'Stacks & Monotonic Stack',
    tier: 'Practitioner',
    coverageChecklist: [
      { subConcept: 'LIFO Ordering & Next Greater/Smaller Trigger', isCore: true, intuitionSummary: 'Pop elements whenever the incoming value resolves their waiting condition.' },
      { subConcept: 'Storing Indices Instead of Raw Values', isCore: true, intuitionSummary: 'Index i gives both temps[i] AND distance (i - prevIndex).' },
      { subConcept: 'Amortized O(N) Push/Pop Proof', isCore: true, intuitionSummary: 'Each index is pushed once and popped at most once -> <= 2N total operations.' },
    ],
    curatedLinks: {
      academicLecture: {
        institution: 'MIT OpenCourseWare',
        courseCode: '6.006',
        professor: 'Jason Ku',
        title: 'Sequences & Amortized Stack Operations',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        watchForBullets: [
          'Aggregate amortized analysis proving nested while-loop still runs in O(N) total',
          'Maintaining monotonic invariants across dynamic sequence scans',
        ],
      },
      visualExplainer: {
        educator: 'VisuAlgo',
        title: 'Stack & Monotonic Sequence Visualizer',
        url: 'https://visualgo.net/en/list',
        bestFor: 'Watching LIFO push/pop frames resolve unresolved elements.',
      },
      sheetsAndRoadmaps: [
        { platform: 'Striver A2Z Sheet', title: 'Step 9: Stack and Queues (Monotonic Problems)', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' },
        { platform: 'AlgoMaster', title: 'Monotonic Stack Pattern Guide', url: 'https://algomaster.io/' },
        { platform: 'NamasteDev DSA', title: 'Stack & Queue Real-World Patterns', url: 'https://namastedev.com/' },
      ],
    },
    analyticalBlueprint: {
      constraintRule: '"Next greater / warmer / taller element" + N <= 10^5 -> Monotonic Decreasing Stack.',
      loopInvariant: 'Elements on the stack remain strictly decreasing until resolved by a larger arrival.',
      bottleneckPattern: 'Re-scanning the same decreasing streak repeatedly from each index.',
    },
  },
  {
    topicId: 'dp-1d',
    topicTitle: '1D/2D Dynamic Programming & SRTBOT',
    tier: 'Pro',
    coverageChecklist: [
      { subConcept: 'Greedy Counterexample Testing', isCore: true, intuitionSummary: 'Test small inputs like coins=[1,3,4], target=6 to prove greedy fails.' },
      { subConcept: 'SRTBOT 6-Step Framework', isCore: true, intuitionSummary: 'Subproblems, Relate, Topological Order, Base Cases, Original, Time.' },
      { subConcept: 'Top-Down Memoization vs Bottom-Up Tabulation', isCore: true, intuitionSummary: 'Memoization caches recursion; tabulation iterates in topological order.' },
      { subConcept: 'Space Optimization Rolling Variables', isCore: false, intuitionSummary: 'Compress O(N*M) grid to O(M) 1D array when row i depends only on row i-1.' },
    ],
    curatedLinks: {
      academicLecture: {
        institution: 'MIT OpenCourseWare',
        courseCode: '6.006',
        professor: 'Erik Demaine',
        title: 'Dynamic Programming I: SRTBOT Framework',
        url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
        watchForBullets: [
          'The 6-step SRTBOT recipe for turning brute recursion into polynomial DP',
          'Why topological DAG order eliminates cyclic dependencies',
          'Computing DP time = (# subproblems) x (time per subproblem)',
        ],
      },
      visualExplainer: {
        educator: 'Abdul Bari',
        title: 'Dynamic Programming & Memoization vs Tabulation',
        url: 'https://www.youtube.com/@abdul_bari',
        bestFor: 'Step-by-step recursion tree pruning and recurrence table construction.',
      },
      sheetsAndRoadmaps: [
        { platform: 'Stanford CS161', title: 'Dynamic Programming & Optimal Substructure Notes', url: 'https://web.stanford.edu/class/archive/cs/cs161/cs161.1168/' },
        { platform: 'Striver A2Z Sheet', title: 'Step 16: Dynamic Programming (56 Problems)', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/' },
        { platform: 'AlgoMaster', title: 'DP Patterns & State Compression', url: 'https://algomaster.io/' },
      ],
    },
    analyticalBlueprint: {
      constraintRule: '"Minimum/maximum ways" where greedy fails + overlapping subproblems -> DP Table.',
      loopInvariant: 'Before solving state a, all smaller sub-states (a - c) already store optimal values.',
      bottleneckPattern: 'Exponential O(C^A) recursion recomputing identical sub-amounts.',
    },
  },
];

export interface GoldenPatternTemplate {
  id: string;
  name: string;
  tier: string;
  whenToUse: [string, string, string];
  mustSolve: { title: string; sheet: string }[];
  templates: {
    java: string;
    js: string;
    python: string;
  };
}

export const GOLDEN_PATTERN_TEMPLATES: GoldenPatternTemplate[] = [
  {
    id: 'prefix-sum',
    name: '1. Prefix Sum + HashMap',
    tier: 'Apprentice',
    whenToUse: [
      'Subarray sum equals target K with negative numbers allowed',
      'Multiple immutable range sum queries [L..R]',
      'Need O(N) single pass without sliding-window monotonicity',
    ],
    mustSolve: [
      { title: 'Subarray Sum Equals K', sheet: 'Blind 75 / AlgoMaster' },
      { title: 'Product of Array Except Self', sheet: 'NeetCode 150' },
      { title: 'Contiguous Array', sheet: 'Striver A2Z' },
    ],
    templates: {
      python: `def prefix_pattern(nums, k):
    prefix_counts = {0: 1}
    curr_sum = ans = 0
    for x in nums:
        curr_sum += x
        # // FILL LOGIC HERE: check (curr_sum - k) in prefix_counts
        ans += prefix_counts.get(curr_sum - k, 0)
        prefix_counts[curr_sum] = prefix_counts.get(curr_sum, 0) + 1
    return ans`,
      js: `function prefixPattern(nums, k) {
  const prefixCounts = new Map([[0, 1]]);
  let currSum = 0, ans = 0;
  for (const x of nums) {
    currSum += x;
    // FILL LOGIC HERE: accumulate matches for (currSum - k)
    ans += prefixCounts.get(currSum - k) ?? 0;
    prefixCounts.set(currSum, (prefixCounts.get(currSum) ?? 0) + 1);
  }
  return ans;
}`,
      java: `public int prefixPattern(int[] nums, int k) {
  Map<Integer, Integer> prefixCounts = new HashMap<>();
  prefixCounts.put(0, 1);
  int currSum = 0, ans = 0;
  for (int x : nums) {
    currSum += x;
    // FILL LOGIC HERE: add count of (currSum - k)
    ans += prefixCounts.getOrDefault(currSum - k, 0);
    prefixCounts.put(currSum, prefixCounts.getOrDefault(currSum, 0) + 1);
  }
  return ans;
}`,
    },
  },
  {
    id: 'two-pointers',
    name: '2. Converging Two Pointers',
    tier: 'Practitioner',
    whenToUse: [
      'Sorted array pair/triplet sums in O(1) space',
      'Symmetry checks (palindromes) or container/water boundaries',
      'In-place partitioning without extra arrays',
    ],
    mustSolve: [
      { title: 'Two Sum II (Sorted)', sheet: 'NeetCode 150' },
      { title: '3Sum', sheet: 'Blind 75 / Striver A2Z' },
      { title: 'Trapping Rain Water', sheet: 'AlgoMaster / Grind 75' },
    ],
    templates: {
      python: `def two_pointers(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        # // FILL LOGIC HERE: evaluate condition on arr[left], arr[right]
        if arr[left] + arr[right] == target:
            return [left, right]
        elif arr[left] + arr[right] < target:
            left += 1
        else:
            right -= 1
    return []`,
      js: `function twoPointers(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    // FILL LOGIC HERE: compare window endpoints
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return [];
}`,
      java: `public int[] twoPointers(int[] arr, int target) {
  int left = 0, right = arr.length - 1;
  while (left < right) {
    // FILL LOGIC HERE: evaluate arr[left] and arr[right]
    int sum = arr[left] + arr[right];
    if (sum == target) return new int[]{left, right};
    if (sum < target) left++;
    else right--;
  }
  return new int[]{};
}`,
    },
  },
  {
    id: 'sliding-window',
    name: '3. Dynamic Sliding Window',
    tier: 'Practitioner',
    whenToUse: [
      'Longest or shortest contiguous subarray/substring',
      'Monotonic validity condition (expanding worsens/improves consistently)',
      'Input size N <= 10^5 demanding O(N) pass',
    ],
    mustSolve: [
      { title: 'Longest Substring Without Repeating Characters', sheet: 'Blind 75' },
      { title: 'Minimum Window Substring', sheet: 'NeetCode 150' },
      { title: 'Longest Repeating Character Replacement', sheet: 'AlgoMaster' },
    ],
    templates: {
      python: `def sliding_window(s):
    window = {}
    left = best = 0
    for right, ch in enumerate(s):
        window[ch] = window.get(ch, 0) + 1
        # // FILL LOGIC HERE: shrink left while window violates invariant
        while window[ch] > 1:
            window[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best`,
      js: `function slidingWindow(s) {
  const window = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    window.set(ch, (window.get(ch) ?? 0) + 1);
    // FILL LOGIC HERE: shrink left until window is valid
    while (window.get(ch) > 1) {
      window.set(s[left], window.get(s[left]) - 1);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      java: `public int slidingWindow(String s) {
  Map<Character, Integer> window = new HashMap<>();
  int left = 0, best = 0;
  for (int right = 0; right < s.length(); right++) {
    char ch = s.charAt(right);
    window.put(ch, window.getOrDefault(ch, 0) + 1);
    // FILL LOGIC HERE: shrink left while invariant is broken
    while (window.get(ch) > 1) {
      char lChar = s.charAt(left++);
      window.put(lChar, window.get(lChar) - 1);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
    },
  },
  {
    id: 'fast-slow',
    name: '4. Fast & Slow Pointers',
    tier: 'Strategist',
    whenToUse: [
      'Detect cycle or cycle entry node in Linked List / sequence',
      'Find middle node in a single O(1)-space pass',
      'Happy Number / duplicate number cycle detection',
    ],
    mustSolve: [
      { title: 'Linked List Cycle II', sheet: 'Striver A2Z' },
      { title: 'Middle of the Linked List', sheet: 'NamasteDev DSA' },
      { title: 'Find the Duplicate Number', sheet: 'NeetCode 150' },
    ],
    templates: {
      python: `def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        # // FILL LOGIC HERE: check pointer collision
        if slow == fast:
            return True
    return False`,
      js: `function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    // FILL LOGIC HERE: check meeting point
    if (slow === fast) return true;
  }
  return false;
}`,
      java: `public boolean hasCycle(ListNode head) {
  ListNode slow = head, fast = head;
  while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    // FILL LOGIC HERE: return true on collision
    if (slow == fast) return true;
  }
  return false;
}`,
    },
  },
  {
    id: 'linked-list-reversal',
    name: '5. In-Place Linked List Reversal',
    tier: 'Strategist',
    whenToUse: [
      'Reverse full list, sublist [L..R], or K-group nodes in O(1) space',
      'Palindrome linked list check without extra array',
      'Reorder list halves',
    ],
    mustSolve: [
      { title: 'Reverse Linked List', sheet: 'Blind 75' },
      { title: 'Reverse Nodes in k-Group', sheet: 'Striver A2Z' },
      { title: 'Reorder List', sheet: 'NeetCode 150' },
    ],
    templates: {
      python: `def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        # // FILL LOGIC HERE: rewire pointer backward
        curr.next = prev
        prev, curr = curr, nxt
    return prev`,
      js: `function reverseList(head) {
  let prev = null, curr = head;
  while (curr) {
    const nxt = curr.next;
    // FILL LOGIC HERE: flip curr.next to prev
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
      java: `public ListNode reverseList(ListNode head) {
  ListNode prev = null, curr = head;
  while (curr != null) {
    ListNode nxt = curr.next;
    // FILL LOGIC HERE: point curr.next to prev
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
    },
  },
  {
    id: 'monotonic-stack',
    name: '6. Monotonic Stack',
    tier: 'Practitioner',
    whenToUse: [
      'Next greater or next smaller element to the right/left',
      'Histogram max area or span problems',
      'Unresolved items waiting for a threshold trigger',
    ],
    mustSolve: [
      { title: 'Daily Temperatures', sheet: 'NeetCode 150' },
      { title: 'Largest Rectangle in Histogram', sheet: 'Striver A2Z' },
      { title: 'Next Greater Element I', sheet: 'AlgoMaster' },
    ],
    templates: {
      python: `def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []
    for i, val in enumerate(nums):
        # // FILL LOGIC HERE: pop resolved indices
        while stack and val > nums[stack[-1]]:
            idx = stack.pop()
            ans[idx] = val
        stack.append(i)
    return ans`,
      js: `function nextGreater(nums) {
  const ans = new Array(nums.length).fill(-1);
  const stack = [];
  for (let i = 0; i < nums.length; i++) {
    // FILL LOGIC HERE: resolve waiting stack tops
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      ans[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return ans;
}`,
      java: `public int[] nextGreater(int[] nums) {
  int[] ans = new int[nums.length];
  Arrays.fill(ans, -1);
  Deque<Integer> stack = new ArrayDeque<>();
  for (int i = 0; i < nums.length; i++) {
    // FILL LOGIC HERE: pop colder/smaller indices
    while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
      ans[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return ans;
}`,
    },
  },
  {
    id: 'top-k-heap',
    name: '7. Top-K Elements (Min/Max Heap)',
    tier: 'Strategist',
    whenToUse: [
      'Kth largest/smallest or Top K frequent elements',
      'Merge K sorted lists or streaming median',
      'N up to 10^5 where full O(N log N) sort is overkill -> O(N log K)',
    ],
    mustSolve: [
      { title: 'Kth Largest Element in an Array', sheet: 'Grind 75' },
      { title: 'Top K Frequent Elements', sheet: 'Blind 75' },
      { title: 'Merge K Sorted Lists', sheet: 'NeetCode 150' },
    ],
    templates: {
      python: `import heapq
def top_k(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        # // FILL LOGIC HERE: evict smallest when size exceeds k
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
      js: `// Use a MinHeap class of bounded size k
function topK(nums, k, minHeap) {
  for (const x of nums) {
    minHeap.push(x);
    // FILL LOGIC HERE: keep heap bounded to size k
    if (minHeap.size() > k) minHeap.pop();
  }
  return minHeap.peek();
}`,
      java: `public int topK(int[] nums, int k) {
  PriorityQueue<Integer> pq = new PriorityQueue<>();
  for (int x : nums) {
    pq.offer(x);
    // FILL LOGIC HERE: maintain bounded min-heap of size k
    if (pq.size() > k) pq.poll();
  }
  return pq.peek();
}`,
    },
  },
  {
    id: 'overlapping-intervals',
    name: '8. Overlapping Intervals Sweep',
    tier: 'Strategist',
    whenToUse: [
      'Merge overlapping intervals or insert new interval',
      'Count minimum meeting rooms or erase minimum overlaps',
      'Sort by start time (merge) or end time (greedy max non-overlapping)',
    ],
    mustSolve: [
      { title: 'Merge Intervals', sheet: 'Blind 75' },
      { title: 'Non-overlapping Intervals', sheet: 'AlgoMaster' },
      { title: 'Meeting Rooms II', sheet: 'NeetCode 150' },
    ],
    templates: {
      python: `def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        # // FILL LOGIC HERE: merge if start <= merged[-1][1]
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`,
      js: `function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    // FILL LOGIC HERE: check overlap against last interval
    if (start <= merged[merged.length - 1][1]) {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}`,
      java: `public int[][] mergeIntervals(int[][] intervals) {
  Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
  List<int[]> merged = new ArrayList<>();
  merged.add(intervals[0]);
  for (int i = 1; i < intervals.length; i++) {
    int[] last = merged.get(merged.size() - 1);
    // FILL LOGIC HERE: merge or append interval
    if (intervals[i][0] <= last[1]) last[1] = Math.max(last[1], intervals[i][1]);
    else merged.add(intervals[i]);
  }
  return merged.toArray(new int[0][]);
}`,
    },
  },
  {
    id: 'modified-binary-search',
    name: '9. Modified Binary Search (On Answer)',
    tier: 'Practitioner',
    whenToUse: [
      'Sorted or rotated sorted array lookup in O(log N)',
      'Minimize the maximum or maximize the minimum feasible threshold',
      'Monotonic boolean predicate f(mid) -> False, False, True, True',
    ],
    mustSolve: [
      { title: 'Search in Rotated Sorted Array', sheet: 'Blind 75' },
      { title: 'Koko Eating Bananas', sheet: 'NeetCode 150' },
      { title: 'Capacity To Ship Packages Within D Days', sheet: 'Striver A2Z' },
    ],
    templates: {
      python: `def binary_search_answer(low, high, feasible):
    ans = high
    while low <= high:
        mid = low + (high - low) // 2
        # // FILL LOGIC HERE: tighten upper bound if feasible(mid)
        if feasible(mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans`,
      js: `function binarySearchAnswer(low, high, feasible) {
  let ans = high;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    // FILL LOGIC HERE: halve search space using monotonic predicate
    if (feasible(mid)) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return ans;
}`,
      java: `public int binarySearchAnswer(int low, int high) {
  int ans = high;
  while (low <= high) {
    int mid = low + (high - low) / 2;
    // FILL LOGIC HERE: check monotonic feasibility(mid)
    if (feasible(mid)) {
      ans = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return ans;
}`,
    },
  },
  {
    id: 'tree-dfs-bfs',
    name: '10. Tree DFS & Level-Order BFS',
    tier: 'Strategist',
    whenToUse: [
      'Level-by-level traversal, right-side view, or shortest depth (BFS)',
      'Path sums, diameter, LCA, or subtree validation (Postorder DFS)',
      'Return tuple/info upward from left and right subtrees in O(N)',
    ],
    mustSolve: [
      { title: 'Binary Tree Level Order Traversal', sheet: 'Blind 75' },
      { title: 'Lowest Common Ancestor of a Binary Tree', sheet: 'Grind 75' },
      { title: 'Diameter of Binary Tree', sheet: 'Striver A2Z' },
    ],
    templates: {
      python: `def dfs(node):
    if not node:
        return 0
    left = dfs(node.left)
    right = dfs(node.right)
    # // FILL LOGIC HERE: combine left & right subtree results
    return 1 + max(left, right)`,
      js: `function dfs(node) {
  if (!node) return 0;
  const left = dfs(node.left);
  const right = dfs(node.right);
  // FILL LOGIC HERE: postorder combine
  return 1 + Math.max(left, right);
}`,
      java: `public int dfs(TreeNode node) {
  if (node == null) return 0;
  int left = dfs(node.left);
  int right = dfs(node.right);
  // FILL LOGIC HERE: combine subtree metrics
  return 1 + Math.max(left, right);
}`,
    },
  },
  {
    id: 'graph-shortest-path',
    name: '11. Graph BFS, Topo Sort & Dijkstra',
    tier: 'Strategist -> Pro',
    whenToUse: [
      'Unweighted shortest path or multi-source grid spread (BFS)',
      'Prerequisite / cycle detection on DAG (Kahn In-Degree Topo Sort)',
      'Weighted non-negative shortest paths (Dijkstra Min-Heap)',
    ],
    mustSolve: [
      { title: 'Course Schedule II', sheet: 'NeetCode 150' },
      { title: 'Rotting Oranges', sheet: 'Grind 75' },
      { title: 'Network Delay Time', sheet: 'AlgoMaster' },
    ],
    templates: {
      python: `from collections import deque
def kahn_topo(n, adj, indegree):
    q = deque([i for i in range(n) if indegree[i] == 0])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        # // FILL LOGIC HERE: decrement neighbor indegrees
        for v in adj[u]:
            indegree[v] -= 1
            if indegree[v] == 0: q.append(v)
    return order if len(order) == n else []`,
      js: `function kahnTopo(n, adj, indegree) {
  const q = [];
  for (let i = 0; i < n; i++) if (indegree[i] === 0) q.push(i);
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    // FILL LOGIC HERE: peel zero-indegree neighbors
    for (const v of adj[u]) if (--indegree[v] === 0) q.push(v);
  }
  return order.length === n ? order : [];
}`,
      java: `public int[] kahnTopo(int n, List<List<Integer>> adj, int[] indegree) {
  Queue<Integer> q = new ArrayDeque<>();
  for (int i = 0; i < n; i++) if (indegree[i] == 0) q.offer(i);
  int[] order = new int[n]; int idx = 0;
  while (!q.isEmpty()) {
    int u = q.poll();
    order[idx++] = u;
    // FILL LOGIC HERE: decrement neighbor indegrees
    for (int v : adj.get(u)) if (--indegree[v] == 0) q.offer(v);
  }
  return idx == n ? order : new int[0];
}`,
    },
  },
  {
    id: 'backtracking-dp',
    name: '12. Backtracking & 1D/2D DP (SRTBOT)',
    tier: 'Pro',
    whenToUse: [
      'Generate all valid subsets/permutations with constraint pruning (N <= 20)',
      'Count ways or min/max cost with overlapping subproblems',
      'Greedy fails due to future choice interactions',
    ],
    mustSolve: [
      { title: 'Coin Change', sheet: 'Blind 75 / AlgoMaster' },
      { title: 'Combination Sum', sheet: 'NeetCode 150' },
      { title: 'Edit Distance', sheet: 'Striver A2Z' },
    ],
    templates: {
      python: `def dp_1d(coins, amount):
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0
    for a in range(1, amount + 1):
        for c in coins:
            # // FILL LOGIC HERE: state recurrence relation
            if a - c >= 0:
                dp[a] = min(dp[a], 1 + dp[a - c])
    return dp[amount] if dp[amount] <= amount else -1`,
      js: `function dp1D(coins, amount) {
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      // FILL LOGIC HERE: state transition dp[a]
      if (a - c >= 0) dp[a] = Math.min(dp[a], 1 + dp[a - c]);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
      java: `public int dp1D(int[] coins, int amount) {
  int[] dp = new int[amount + 1];
  Arrays.fill(dp, amount + 1);
  dp[0] = 0;
  for (int a = 1; a <= amount; a++) {
    for (int c : coins) {
      // FILL LOGIC HERE: transition from smaller subproblem
      if (a - c >= 0) dp[a] = Math.min(dp[a], 1 + dp[a - c]);
    }
  }
  return dp[amount] > amount ? -1 : dp[amount];
}`,
    },
  },
];

export interface SrtbotWorksheetConfig {
  problemId: string;
  steps: {
    key: 'S' | 'R' | 'T' | 'B' | 'O' | 'T_time';
    letter: string;
    title: string;
    prompt: string;
    options: { id: string; text: string; isCorrect: boolean; feedback: string }[];
  }[];
}

export const COIN_CHANGE_SRTBOT: SrtbotWorksheetConfig = {
  problemId: 'coin-change',
  steps: [
    {
      key: 'S',
      letter: 'S',
      title: 'Subproblems',
      prompt: 'How do we define dp[a]?',
      options: [
        { id: 's1', text: 'Minimum number of coins needed to sum exactly to amount a (0 <= a <= amount)', isCorrect: true, feedback: 'Exact state definition! Only remaining amount matters.' },
        { id: 's2', text: 'Number of permutations of coins used so far', isCorrect: false, feedback: 'We want minimum coin count, not permutation count.' },
      ],
    },
    {
      key: 'R',
      letter: 'R',
      title: 'Relate (Recurrence)',
      prompt: 'How does dp[a] depend on smaller subproblems?',
      options: [
        { id: 'r1', text: 'dp[a] = min over all coins c <= a of (1 + dp[a - c])', isCorrect: true, feedback: 'Correct! Taking coin c uses 1 coin plus optimal answer for (a - c).' },
        { id: 'r2', text: 'dp[a] = 1 + dp[a - maxCoin]', isCorrect: false, feedback: 'Taking only the largest coin is Greedy and fails on [1,3,4], target=6.' },
      ],
    },
    {
      key: 'T',
      letter: 'T',
      title: 'Topological Order',
      prompt: 'In what order must states be computed so dependencies are ready?',
      options: [
        { id: 't1', text: 'Increasing amount: a = 1, 2, ..., amount', isCorrect: true, feedback: 'Every (a - c) < a is already finalized!' },
        { id: 't2', text: 'Decreasing amount: a = amount down to 1', isCorrect: false, feedback: 'Decreasing order reads uninitialized dp[a - c] entries.' },
      ],
    },
    {
      key: 'B',
      letter: 'B',
      title: 'Base Cases',
      prompt: 'What is dp[0] and default unreachable sentinel?',
      options: [
        { id: 'b1', text: 'dp[0] = 0 coins; initialize others to amount + 1 (Infinity)', isCorrect: true, feedback: 'Zero coins make sum 0, and amount + 1 acts as safe Infinity.' },
        { id: 'b2', text: 'dp[0] = 1 coin; initialize others to 0', isCorrect: false, feedback: 'Initializing to 0 causes min() to always pick 0.' },
      ],
    },
    {
      key: 'O',
      letter: 'O',
      title: 'Original Problem',
      prompt: 'Where does the final answer live?',
      options: [
        { id: 'o1', text: 'dp[amount] (or -1 if dp[amount] > amount)', isCorrect: true, feedback: 'Spot on!' },
        { id: 'o2', text: 'max(dp[0..amount])', isCorrect: false, feedback: 'We want the exact target amount, not the maximum across sub-amounts.' },
      ],
    },
    {
      key: 'T_time',
      letter: 'T',
      title: 'Time Complexity',
      prompt: 'What is (# subproblems) x (work per subproblem)?',
      options: [
        { id: 'tt1', text: 'O(amount * coins.length) time, O(amount) space', isCorrect: true, feedback: 'Yes! Polynomial instead of exponential O(C^A).' },
        { id: 'tt2', text: 'O(2^amount) time', isCorrect: false, feedback: 'Memoization/tabulation collapses the exponential tree.' },
      ],
    },
  ],
};
