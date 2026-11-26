export interface EverydayDsaAnalogy {
  id: string;
  structure: string;
  indianAnalogy: string;
  mentalModel: string;
  timeHighlight: string;
  classicInterviewUse: string;
}

export interface DsaHandwrittenTrack {
  id: 'analogies-mindset' | 'strings-java' | 'python-heaps' | 'python-greedy' | 'trees-bs-bits';
  title: string;
  shortTitle: string;
  languageTag: string;
  summary: string;
  sections: {
    id: string;
    heading: string;
    plainExplanation: string;
    keyPoints: string[];
    formulaOrRule?: string;
    indianExample?: string;
    codeSnippet?: {
      title: string;
      language: 'python' | 'java';
      code: string;
      contextHint: string;
    };
  }[];
  interviewChecklist: { q: string; a: string }[];
}

export const EVERYDAY_INDIAN_DSA_ANALOGIES: EverydayDsaAnalogy[] = [
  {
    id: 'an-stack',
    structure: 'Stack (LIFO)',
    indianAnalogy: 'Stack of steel plates in a college mess / canteen',
    mentalModel: 'You always place a washed plate on TOP and pick the TOP plate first (Last-In, First-Out).',
    timeHighlight: 'push / pop / peek: O(1)',
    classicInterviewUse: 'Valid Parentheses, Next Greater Element, Undo/Redo, Monotonic Stack',
  },
  {
    id: 'an-queue',
    structure: 'Queue (FIFO)',
    indianAnalogy: 'Bank / Railway ticket counter line',
    mentalModel: 'Whoever joins the line first gets served first (First-In, First-Out).',
    timeHighlight: 'enqueue / dequeue: O(1)',
    classicInterviewUse: 'BFS Shortest Path, Level-Order Tree Traversal, Task Schedulers',
  },
  {
    id: 'an-heap',
    structure: 'Heap / Priority Queue',
    indianAnalogy: 'Cricket knockout tournament bracket / Hospital triage',
    mentalModel: 'You do not need every player fully sorted—you only need the #1 champion (min or max) at the top in O(1), and re-crowning takes O(log n).',
    timeHighlight: 'peek O(1) · push/pop O(log n) · heapify O(n)',
    classicInterviewUse: 'Top K Frequent, Kth Largest, Merge K Sorted Lists, Median of Stream',
  },
  {
    id: 'an-hashmap',
    structure: 'HashMap / Dictionary',
    indianAnalogy: 'Roll-number to Student record register / English Dictionary',
    mentalModel: 'Jump directly to the exact shelf using a hash key instead of checking every page from page 1.',
    timeHighlight: 'Average lookup / insert: O(1)',
    classicInterviewUse: 'Two Sum, Frequency Counter, Subarray Sum = K, Group Anagrams',
  },
  {
    id: 'an-linked-list',
    structure: 'Linked List',
    indianAnalogy: 'Indian Railways train bogies coupled one after another',
    mentalModel: 'Each coach only knows the next coach—inserting or detaching a bogie just updates 2 couplings (O(1)), no shifting seats!',
    timeHighlight: 'Insert/Delete at pointer O(1) · Search O(n)',
    classicInterviewUse: 'Reverse List, LRU Cache (DLL + HashMap), Cycle Detection',
  },
  {
    id: 'an-fast-slow',
    structure: 'Fast & Slow Pointers',
    indianAnalogy: 'Two runners jogging on a circular stadium track',
    mentalModel: 'If the track is a straight road, the faster runner reaches the end first. If the track is a loop, the faster runner MUST lap and meet the slower runner!',
    timeHighlight: 'Time O(n) · Extra Space O(1)',
    classicInterviewUse: 'Linked List Cycle (Floyd), Find Middle Node, Duplicate Number',
  },
];

export const DSA_HANDWRITTEN_TRACKS: DsaHandwrittenTrack[] = [
  {
    id: 'analogies-mindset',
    title: 'Everyday Indian Analogies & Scientific Study Framework',
    shortTitle: 'Analogies & Study Method',
    languageTag: 'Concept First',
    summary:
      'Master DSA faster by linking every data structure to an everyday Indian analogy and applying Polya\'s 4-step solver + Metacognition from learner psychology.',
    sections: [
      {
        id: 'learner-polya-metacognition',
        heading: 'How Top Coders Think: Polya\'s 4 Steps + Metacognition (Plan → Monitor → Evaluate)',
        plainExplanation:
          'Most students open LeetCode, stare for 2 minutes, panic, and immediately read the solution—which builds zero problem-solving muscle. Follow a calm, repeatable thinking loop instead.',
        keyPoints: [
          '1. Polya Step 1 — Understand: Restate input/output constraints (`n ≤ 10^5` means O(n²) will TLE; you need O(n log n) or O(n)).',
          '2. Polya Step 2 — Devise a Plan (Schema Activation): Ask "Which pattern does this resemble? Sliding Window? Heap? Binary Search on Answer?" (Piaget\'s Assimilation & Accommodation).',
          '3. Polya Step 3 — Carry Out & Monitor (Flavell\'s Metacognition): Dry-run your logic on a tiny 4-element test case BEFORE coding. Watch pointer invariants every step.',
          '4. Polya Step 4 — Look Back & Evaluate: Check edge cases (empty array, 1 element, duplicates, negatives), state Time & Space complexity, and note the 1-line "Aha!" trigger (Kohler\'s Insight Learning) in your revision notebook.',
        ],
        formulaOrRule: 'Input Size Hint: n ≤ 20 → Backtracking/Bitmask · n ≤ 10³ → O(n²) · n ≤ 10⁵ → O(n log n) or O(n) · n ≤ 10⁹ → O(log n)',
        indianExample:
          'Just like preparing for JEE/GATE: blindly reading 200 solved answers feels comfortable, but actively solving 30 core pattern problems with post-test mistake analysis actually builds exam speed.',
      },
    ],
    interviewChecklist: [
      {
        q: 'What should you do in the first 3 minutes of any coding interview?',
        a: 'Clarify edge cases and constraints, walk through 1 small example by hand, confirm the brute-force complexity first, and only then explain the optimal pattern before writing code.',
      },
      {
        q: 'How can the input constraint `n` immediately tell you which time complexity is required?',
        a: 'An online judge executes roughly 10^8 simple operations per second: `n <= 20` allows exponential backtracking, `n <= 10^3` allows O(n^2), `n <= 10^5` requires O(n log n) or O(n), and `n <= 10^9` requires O(log n) or O(1) math.',
      },
    ],
  },
  {
    id: 'strings-java',
    title: 'String Algorithms in Java (StringBuilder, 12 Classics, Rabin-Karp & KMP)',
    shortTitle: 'String Algos (Java)',
    languageTag: 'Java',
    summary:
      'Everything from Java String immutability (`String` vs `StringBuilder` vs `StringBuffer`) to 12 interview favorites and O(n+m) pattern matching with KMP & LPS arrays.',
    sections: [
      {
        id: 'java-string-internals',
        heading: 'String vs StringBuilder vs StringBuffer (Java Interview Must-Know)',
        plainExplanation:
          'In Java, `String` is immutable (stored in the String Pool). Doing `s = s + ch` inside a loop creates N brand-new string copies, turning an O(n) loop into O(n²)!',
        keyPoints: [
          'String: Immutable, thread-safe, cached in String Pool. Great for constants/keys, terrible for loop concatenation.',
          'StringBuilder: Mutable, NOT synchronized, FASTEST! Use this 99% of the time inside coding interviews and single-threaded methods.',
          'StringBuffer: Mutable, synchronized (thread-safe), slightly slower due to method locks. Rarely needed today.',
          '12 Must-Practice String Classics: Reverse String, Palindrome Check, Valid Anagram (26-int array), First Non-Repeating Char, Remove Duplicates, Count Vowels/Consonants, String Rotation (`(s1+s1).contains(s2)`), Longest Common Prefix, Longest Substring Without Repeating Chars, Valid Parentheses, String Compression (`a3b2c1`), and Group Anagrams.',
        ],
        formulaOrRule: 'Loop Concat: String = O(n²) copies  |  StringBuilder = O(n) amortized  |  Rotation trick: (s1 + s1).contains(s2)',
        indianExample:
          'Immutable `String` is like printing a fresh aadhaar card every time you edit 1 digit. `StringBuilder` is like writing on a whiteboard you can update in place.',
      },
      {
        id: 'string-matching-kmp',
        heading: 'Pattern Matching: Naive vs Rabin-Karp (Rolling Hash) vs KMP (LPS Array)',
        plainExplanation:
          'When searching for a pattern `P` (length m) inside a big text `T` (length n), Naive matching slides back on every mismatch in O(n·m). Rabin-Karp uses a rolling hash, and KMP never moves the text pointer backwards!',
        keyPoints: [
          'Naive Search: Check every starting index in O(n·m) worst-case time, which degrades badly on repetitive text such as searching `"aaab"` inside `"aaaaaaaaab"`.',
          'Rabin-Karp: Compute a rolling hash of each m-length window in O(1); only compare characters when hashes match. Average O(n+m), great for finding multiple patterns (plagiarism check).',
          'KMP (Knuth-Morris-Pratt): Precompute the LPS array (`Longest Proper Prefix which is also a Suffix`) of pattern `P` in O(m). On a mismatch at `j`, jump `j = lps[j - 1]` instead of resetting `i`! Guaranteed O(n + m) worst case.',
        ],
        formulaOrRule: 'Naive: O(n·m)  |  Rabin-Karp: Avg O(n+m), Worst O(n·m)  |  KMP: Guaranteed O(n+m) time, O(m) space',
        codeSnippet: {
          title: 'KMP Pattern Search & LPS Array in Java — Guaranteed O(n + m)',
          language: 'java',
          contextHint: 'Computes the LPS table once so the text index i never steps backwards.',
          code: `public class KmpMatcher {
    public static int[] buildLps(String pat) {
        int[] lps = new int[pat.length()];
        int len = 0, i = 1;
        while (i < pat.length()) {
            if (pat.charAt(i) == pat.charAt(len)) {
                lps[i++] = ++len;
            } else if (len > 0) {
                len = lps[len - 1]; // Fallback without resetting i
            } else {
                lps[i++] = 0;
            }
        }
        return lps;
    }

    public static int searchFirst(String text, String pat) {
        int[] lps = buildLps(pat);
        int i = 0, j = 0;
        while (i < text.length()) {
            if (text.charAt(i) == pat.charAt(j)) {
                i++; j++;
                if (j == pat.length()) return i - j; // Match found!
            } else if (j > 0) {
                j = lps[j - 1]; // Reuse already matched prefix
            } else {
                i++;
            }
        }
        return -1;
    }
}`,
        },
      },
    ],
    interviewChecklist: [
      {
        q: 'Why does `(s1 + s1).contains(s2)` check string rotation in O(n)?',
        a: 'If `s1` and `s2` have equal length, every possible circular shift of `s1` appears as a contiguous substring inside `s1 + s1`.',
      },
      {
        q: 'What does `lps[k]` mean in KMP?',
        a: 'It is the length of the longest proper prefix of `pattern[0..k]` that is also a suffix of `pattern[0..k]`, telling KMP exactly how far back to shift the pattern on a mismatch.',
      },
    ],
  },
  {
    id: 'python-heaps',
    title: 'Python Heaps & Priority Queues (`heapq` Complete Mastery)',
    shortTitle: 'Python Heaps (heapq)',
    languageTag: 'Python',
    summary:
      'Master Python\'s `heapq` min-heap module, max-heap negation trick, and the 5 guaranteed interview patterns (Kth Largest, Top K Frequent, Merge K Lists, Two-Heap Median).',
    sections: [
      {
        id: 'heapq-toolkit',
        heading: 'Complete `heapq` Toolkit & Max-Heap Trick',
        plainExplanation:
          'Python\'s built-in `heapq` gives you a super-fast Min-Heap backed by a plain Python list (smallest item always sits at `heap[0]`). To get a Max-Heap, simply negate numbers (`-x`) on push and negate back on pop!',
        keyPoints: [
          '`heapq.heapify(arr)` — turns any existing list into a valid min-heap in-place in O(n) linear time (faster than pushing n times in O(n log n)!).',
          '`heapq.heappush(h, x)` / `heapq.heappop(h)` — insert or remove smallest element in O(log n).',
          '`heapq.heappushpop(h, x)` — pushes `x` then pops smallest in one combined fast step (great for keeping a fixed size-K heap!).',
          '`heapq.heapreplace(h, x)` — pops smallest first then pushes `x`.',
          '`heapq.nlargest(k, arr)` & `heapq.nsmallest(k, arr)` — clean one-liners for Top-K queries.',
          '5 Must-Know Patterns: (1) Heap Sort O(n log n), (2) Kth Largest → maintain Min-Heap of size K (`heap[0]` is answer!), (3) Top K Frequent → Counter + size-K Min-Heap, (4) Merge K Sorted Lists → push `(val, list_idx, node)` tuple, (5) Median from Data Stream → Max-Heap (`low`) + Min-Heap (`high`) balanced within 1 item!',
        ],
        formulaOrRule: 'Array index math (0-based): parent = (i-1)//2  |  left = 2*i + 1  |  right = 2*i + 2',
        codeSnippet: {
          title: 'Two-Heap Running Median & Size-K Min-Heap Kth Largest in Python',
          language: 'python',
          contextHint: 'Classic Python heapq idioms used in Amazon, Flipkart, and Google coding rounds.',
          code: `import heapq

def kth_largest(nums: list[int], k: int) -> int:
    # Keep ONLY the k biggest elements in a Min-Heap -> top is Kth largest!
    min_heap = nums[:k]
    heapq.heapify(min_heap)                # O(k)
    for num in nums[k:]:
        if num > min_heap[0]:
            heapq.heapreplace(min_heap, num)  # O(log k)
    return min_heap[0]

class MedianFinder:
    def __init__(self):
        self.low = []   # Max-heap (store negatives) for smaller half
        self.high = []  # Min-heap for larger half

    def add_num(self, num: int) -> None:
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2.0`,
        },
      },
    ],
    interviewChecklist: [
      {
        q: 'Why do we use a MIN-heap (not a max-heap) to find the Kth LARGEST element?',
        a: 'A size-K min-heap acts like a VIP club of the K biggest numbers seen so far. Its root `heap[0]` is the smallest VIP—so any newcomer smaller than `heap[0]` is ignored in O(1), keeping memory at O(k) and time at O(n log k)!',
      },
      {
        q: 'Why is `heapq.heapify(arr)` O(n) linear time instead of O(n log n)?',
        a: 'Bottom-up `heapify` skips all leaf nodes (half the array) and only sifts higher nodes down a tiny distance on average. Summing the geometric series across all tree levels converges tightly to O(n).',
      },
    ],
  },
  {
    id: 'python-greedy',
    title: 'Python Greedy Algorithms (Indian Coins, Railway Platforms, Intervals & Huffman)',
    shortTitle: 'Greedy Algos (Python)',
    languageTag: 'Python',
    summary:
      'Learn when the locally best choice guarantees the globally best answer—covering Indian Coin Change, Activity Selection, Fractional Knapsack, Job Sequencing, Minimum Railway Platforms, Jump Game, Gas Station, and Greedy vs DP.',
    sections: [
      {
        id: 'greedy-core-problems',
        heading: 'Greedy Choice Property, Indian Coin Change & Minimum Railway Platforms',
        plainExplanation:
          'A Greedy algorithm makes the smartest-looking choice right now without worrying about undoing it later. It ONLY works when the problem has both Optimal Substructure AND the Greedy Choice Property!',
        keyPoints: [
          'Indian Coin Change (₹10, ₹5, ₹2, ₹1): Always pick the largest coin ≤ remaining amount. For ₹28 → 10+10+5+2+1 (5 coins). Caution: For weird coin sets like `{1, 3, 4}` making `6`, Greedy picks `4+1+1` (3 coins) while DP finds `3+3` (2 coins)!',
          'Activity Selection & Non-Overlapping Intervals: Sort by EARLIEST END TIME! Picking the meeting that finishes earliest leaves maximum room for remaining meetings.',
          'Fractional Knapsack: Sort items by highest `value / weight` ratio and fill greedily (unlike 0/1 Knapsack, which needs DP).',
          'Job Sequencing with Deadlines: Sort by highest profit descending and schedule each job into the latest free slot ≤ its deadline.',
          'Minimum Railway Platforms (Indian Railways Favorite!): Sort `arrivals[]` and `departures[]` separately, then walk with two pointers: arrival needs `+1` platform, departure frees `-1` platform; track the peak!',
          'Jump Game (track `farthest` reachable index), Gas Station (if `sum(gas) < sum(cost)` return -1; whenever tank dips < 0 reset start to `i+1`), and Huffman Coding (Min-Heap merges 2 smallest frequencies repeatedly for optimal prefix-free compression).',
        ],
        formulaOrRule: 'Greedy vs DP: Greedy makes 1 irreversible local pick (fast O(n log n)); DP explores overlapping subproblems when local picks can mislead.',
        indianExample:
          'At New Delhi Railway Station, if Rajdhani arrives at 09:00 and departs at 09:40 while Shatabdi arrives at 09:10, sorting arrival and departure timelines tells you the exact minimum number of platforms needed so no train waits outside.',
        codeSnippet: {
          title: 'Minimum Railway Platforms & Activity Selection in Python',
          language: 'python',
          contextHint: 'Two classic Indian coding interview Greedy problems in clean O(n log n) Python.',
          code: `def min_railway_platforms(arrivals: list[int], departures: list[int]) -> int:
    arr = sorted(arrivals)
    dep = sorted(departures)
    i = j = 0
    current = peak = 0
    while i < len(arr) and j < len(dep):
        if arr[i] <= dep[j]:      # Next event is a train arriving
            current += 1
            peak = max(peak, current)
            i += 1
        else:                     # A train departed -> platform freed
            current -= 1
            j += 1
    return peak

def max_non_overlapping_activities(intervals: list[tuple[int, int]]) -> int:
    # Always sort by finish time!
    intervals.sort(key=lambda x: x[1])
    count, last_end = 0, float('-inf')
    for start, end in intervals:
        if start >= last_end:
            count += 1
            last_end = end
    return count`,
        },
      },
    ],
    interviewChecklist: [
      {
        q: 'Why does Activity Selection sort by END time instead of START time or shortest duration?',
        a: 'A short meeting right in the middle can block two longer meetings, and an early-starting meeting might run all day. Finishing earliest strictly maximizes the remaining timeline for future activities.',
      },
      {
        q: 'How can you quickly test whether a Greedy strategy is wrong and Dynamic Programming is required?',
        a: 'Construct a tiny 3-item counterexample—such as making amount 6 from coins `{1, 3, 4}` where Greedy picks `4+1+1` (3 coins) instead of `3+3` (2 coins). One counterexample immediately proves you need DP.',
      },
    ],
  },
  {
    id: 'trees-bs-bits',
    title: 'Binary Trees (Python), Binary Search on Answer, Bit Tricks & Graph Lemma',
    shortTitle: 'Trees, BS-on-Answer & Bits',
    languageTag: 'Python',
    summary:
      'High-yield handwritten cheat sheets: 5 Binary Tree types & formulas, Diameter & LCA in Python, Binary Search on Answer (Aggressive Cows / Koko Bananas / M Bouquets), Bit Manipulation, and Graph Handshaking Lemma.',
    sections: [
      {
        id: 'binary-tree-formulas',
        heading: 'Binary Tree Types, Key Formulas, Balanced Check, Diameter & LCA',
        plainExplanation:
          'A Binary Tree lets every node have at most 2 children (left & right). Almost every tree interview problem is a clean post-order DFS returning height or subtree info upwards in O(n)!',
        keyPoints: [
          '5 Tree Types: Full (0 or 2 children), Complete (all levels full except possibly last filled left-to-right — used by Heaps!), Perfect (all internal have 2 children, all leaves at same level), Balanced (`|height(L) - height(R)| ≤ 1` everywhere), Skewed (all nodes lean one way → O(n) worst case).',
          '3 Golden Tree Formulas: Max nodes at level `l` = `2^l`; Max total nodes of height `h` (root=0) = `2^(h+1) - 1`; In any Full Binary Tree, leaves `n0 = n2 + 1`.',
          '4 Traversals: Inorder (L-Root-R → gives sorted order on a BST!), Preorder (Root-L-R → serialize/copy tree), Postorder (L-R-Root → delete tree / compute height & diameter bottom-up), Level-Order BFS (Queue).',
          'Height vs Depth: Depth counts edges DOWN from Root to node; Height counts edges UP from deepest leaf to node.',
        ],
        formulaOrRule: 'Max nodes at level l = 2^l  |  Max total nodes = 2^(h+1) - 1  |  Full BT leaves: n0 = n2 + 1',
        codeSnippet: {
          title: 'Binary Tree Diameter & Lowest Common Ancestor (LCA) in O(n) Python',
          language: 'python',
          contextHint: 'Bottom-up post-order DFS patterns that solve 80% of Binary Tree interview questions.',
          code: `def diameter_of_binary_tree(root) -> int:
    best = 0
    def height(node) -> int:
        nonlocal best
        if not node:
            return 0
        lh = height(node.left)
        rh = height(node.right)
        best = max(best, lh + rh)      # Longest path through this node
        return 1 + max(lh, rh)         # Return height upward
    height(root)
    return best

def lowest_common_ancestor(root, p, q):
    if not root or root == p or root == q:
        return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root                    # p and q split on opposite sides -> LCA!
    return left or right`,
        },
      },
      {
        id: 'bs-answer-bits-graph',
        heading: 'Binary Search on Answer + Bit Manipulation + Graph Handshaking Lemma',
        plainExplanation:
          'Whenever a problem asks for "Minimize the Maximum" or "Maximize the Minimum" and you can write a quick `can_do(mid)` checker, Binary Search directly on the answer range `[low, high]` in O(n log Range)!',
        keyPoints: [
          'Binary Search on Answer Classics: Aggressive Cows (maximize minimum stall distance), Koko Eating Bananas (minimize eating speed `k` within `H` hours), Minimum Days to Make `M` Bouquets, Allocate Minimum Book Pages.',
          'Bit Manipulation Tricks: Check odd `(n & 1) == 1`; Turn off rightmost set bit `n & (n - 1)` (counts set bits in Brian Kernighan\'s algo & checks Power of 2 when `n > 0 and (n & (n - 1)) == 0`); Find single unique number via XOR (`a ^ a = 0`, `a ^ 0 = a`).',
          'Graph Handshaking Lemma: In any undirected graph, sum of all vertex degrees equals `2 * E` (twice the number of edges) — which also proves there is always an EVEN number of odd-degree vertices!',
        ],
        formulaOrRule: 'Power of 2: n > 0 && (n & (n-1)) == 0  |  XOR Cancel: a ^ a = 0  |  Handshaking Lemma: Σ deg(v) = 2E',
        indianExample:
          'Think of Aggressive Cows like placing `C` chai stalls along a highway so no two stalls are too close: test `mid = 500m`, greedily place stalls—if all fit, try a bigger gap (`low = mid + 1`), else shrink (`high = mid - 1`).',
      },
    ],
    interviewChecklist: [
      {
        q: 'How do you instantly recognize a "Binary Search on Answer" problem?',
        a: 'Look for monotonic feasibility ("if speed K works, then K+1 also works") paired with wording like "minimum possible maximum", "maximum possible minimum", or "least days/capacity needed".',
      },
      {
        q: 'How does `n & (n - 1)` check whether a positive integer `n` is a Power of 2 in O(1)?',
        a: 'Subtracting 1 flips the rightmost `1` bit to `0` and turns all trailing `0` bits into `1`, so `n & (n - 1)` clears exactly the lowest set bit. A Power of 2 has only ONE set bit, so clearing it leaves `0`.',
      },
    ],
  },
];
