import { AlgorithmDefinition } from './algorithmsCatalog';
import { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';
import { hydrateMasterAlgorithms, hydrateMasterPractice } from './algorithmMasterMetadata';

export const MASTER_CORE_11_ALGORITHMS: AlgorithmDefinition[] = hydrateMasterAlgorithms([
  // #1 Linear Search
  {
    id: 'linear-search',
    name: 'Linear Search (Sentinel & Unsorted Scan)',
    shortName: 'Linear Search',
    category: 'Searching & Sorting',
    difficulty: 'Core',
    visualType: 'two-pointers',
    tagline: 'Scan elements sequentially from index 0 to N−1 with O(1) space — optimal when data is unsorted or streamed once.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    mentalModel:
      'Imagine checking keys on a keyring one by one until one opens the lock. Because the array has no ordering guarantee, no element can be skipped without risking a false negative.',
    coreInvariant:
      'At index i, every element in [0..i−1] has been verified not to match the target; placing a sentinel at arr[N] eliminates the per-step bounds check.',
    whenToUse: [
      'Input array or linked list is unsorted and queried only once (sorting would cost O(N log N)).',
      'Small collections (N ≤ 32) where CPU cache locality beats binary search branch mispredictions.',
      'Streaming or linked-list data without random access indexing.',
    ],
    whenItFails:
      'Fails latency SLAs when N is large and queried repeatedly (M queries cost O(M·N)); build a Hash Set for O(1) lookups or sort + Binary Search for O((N+M) log N).',
    linkedTopics: ['Arrays & Prefix Sum', 'Two Pointers'],
    linkedProblemSlugs: ['two-sum', 'contains-duplicate', 'find-if-path-exists'],
    templates: {
      python: `def linear_search(nums: list[int], target: int) -> int:
    for i, val in enumerate(nums):
        if val == target:
            return i
    return -1`,
      js: `function linearSearch(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
      java: `int linearSearch(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Initialize Scan Pointer at Index 0',
        explanation: 'Start at i=0 searching for target=19 in unsorted array [14, 7, 23, 19, 5].',
        invariantCheck: 'Checked prefix [] contains no match.',
        variables: [{ name: 'i', value: '0' }, { name: 'target', value: '19' }, { name: 'nums[i]', value: '14' }],
        array: [14, 7, 23, 19, 5],
        pointers: [{ label: 'i', index: 0, tone: 'sky' }],
        highlightIndices: [0],
      },
      {
        step: 2,
        title: 'Advance Past Mismatches',
        explanation: '14 ≠ 19 and 7 ≠ 19. Advance i=2 to inspect 23.',
        invariantCheck: 'Prefix [14, 7] verified ≠ 19.',
        variables: [{ name: 'i', value: '2' }, { name: 'nums[i]', value: '23' }, { name: 'match', value: 'false' }],
        array: [14, 7, 23, 19, 5],
        pointers: [{ label: 'i', index: 2, tone: 'sky' }],
        eliminatedIndices: [0, 1],
        highlightIndices: [2],
      },
      {
        step: 3,
        title: 'Target Found at Index 3',
        explanation: 'nums[3] == 19 matches target! Early-exit immediately without scanning index 4.',
        invariantCheck: 'First occurrence invariant satisfied at index 3.',
        variables: [{ name: 'i', value: '3' }, { name: 'nums[3]', value: '19' }, { name: 'return', value: '3' }],
        array: [14, 7, 23, 19, 5],
        pointers: [{ label: 'hit', index: 3, tone: 'emerald' }],
        eliminatedIndices: [0, 1, 2],
        matchedIndices: [3],
      },
      {
        step: 4,
        title: 'Early Return Complete',
        explanation: 'Total comparisons = 4 (average N/2 for hits, N for misses). Zero auxiliary memory used.',
        invariantCheck: 'O(N) worst-case time, O(1) space.',
        variables: [{ name: 'result', value: '3' }, { name: 'comparisons', value: '4' }],
        array: [14, 7, 23, 19, 5],
        matchedIndices: [3],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: 'Find Index of First Occurrence', difficulty: 'Easy', whyThisFits: 'Sequential scan with early exit.' },
      { platform: 'HackerRank', title: 'Linear Search with Sentinel', difficulty: 'Easy', whyThisFits: 'Eliminates bounds check inside tight loops.' },
    ],
  },

  // #3 Interpolation Search
  {
    id: 'interpolation-search',
    name: 'Interpolation Search (Uniform Probe)',
    shortName: 'Interpolation',
    category: 'Searching & Sorting',
    difficulty: 'Core',
    visualType: 'binary-search',
    tagline: 'Jump directly to the estimated value position in uniformly distributed sorted arrays in O(log log N) expected time.',
    timeComplexity: 'O(log log N) avg · O(N) worst',
    spaceComplexity: 'O(1)',
    mentalModel:
      'When looking up "Zimmerman" in a phone book, you do not open to the middle ("M") like Binary Search—you open straight near the back. Interpolation Search estimates the probe index linearly from target value.',
    coreInvariant:
      'If target exists, it lies in [lo..hi] with arr[lo] ≤ target ≤ arr[hi]; probe pos = lo + floor((target − arr[lo]) * (hi − lo) / (arr[hi] − arr[lo])).',
    whenToUse: [
      'Large sorted numeric arrays with roughly uniform key spacing (timestamps, sequential IDs, sensor readings).',
      'Expensive page/disk reads where minimizing probe count from 20 (log₂ 1M) down to ~4 (log log 1M) matters.',
      'Sorted database column indexes with known min/max histograms.',
    ],
    whenItFails:
      'Degrades to O(N) on exponentially skewed distributions (e.g., [1, 2, 4, 8, ..., 2^30]) where the linear estimate hugs one boundary. Fall back to Binary Search or Exponential Search for skewed data.',
    linkedTopics: ['Modified Binary Search'],
    linkedProblemSlugs: ['binary-search-classic', 'search-in-rotated-sorted-array'],
    templates: {
      python: `def interpolation_search(arr: list[int], target: int) -> int:
    lo, hi = 0, len(arr) - 1
    while lo <= hi and arr[lo] <= target <= arr[hi]:
        if arr[lo] == arr[hi]:
            return lo if arr[lo] == target else -1
        pos = lo + (target - arr[lo]) * (hi - lo) // (arr[hi] - arr[lo])
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1
    return -1`,
      js: `function interpolationSearch(arr, target) {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi && arr[lo] <= target && target <= arr[hi]) {
    if (arr[lo] === arr[hi]) return arr[lo] === target ? lo : -1;
    const pos = lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}`,
      java: `int interpolationSearch(int[] arr, int target) {
    int lo = 0, hi = arr.length - 1;
    while (lo <= hi && arr[lo] <= target && target <= arr[hi]) {
        if (arr[lo] == arr[hi]) return arr[lo] == target ? lo : -1;
        int pos = lo + (int)(((long)(target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) lo = pos + 1;
        else hi = pos - 1;
    }
    return -1;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Check Bounds & Compute Linear Estimate',
        explanation: 'Search target=70 in uniform array [10, 20, 30, 40, 50, 60, 70, 80]. Range [10..80] contains 70.',
        invariantCheck: 'arr[lo]=10 ≤ 70 ≤ arr[hi]=80 holds.',
        variables: [{ name: 'lo', value: '0' }, { name: 'hi', value: '7' }, { name: 'target', value: '70' }],
        array: [10, 20, 30, 40, 50, 60, 70, 80],
        pointers: [{ label: 'lo', index: 0, tone: 'sky' }, { label: 'hi', index: 7, tone: 'amber' }],
        windowRange: [0, 7],
      },
      {
        step: 2,
        title: 'Probe Formula Jumps Straight to Index 6',
        explanation: 'pos = 0 + floor((70−10) * 7 / (80−10)) = floor(420/70) = 6. Binary search would have probed index 3 first!',
        invariantCheck: 'Linear value interpolation hits exact bucket on uniform data.',
        variables: [{ name: 'pos', value: '6' }, { name: 'arr[6]', value: '70' }],
        array: [10, 20, 30, 40, 50, 60, 70, 80],
        pointers: [{ label: 'pos', index: 6, tone: 'emerald' }],
        highlightIndices: [6],
      },
      {
        step: 3,
        title: 'Single-Probe Exact Match',
        explanation: 'arr[6] == 70! Found in 1 comparison instead of 3 binary search hops.',
        invariantCheck: 'Guards against division-by-zero via arr[lo] === arr[hi] check.',
        variables: [{ name: 'return', value: '6' }, { name: 'probes', value: '1' }],
        array: [10, 20, 30, 40, 50, 60, 70, 80],
        matchedIndices: [6],
      },
      {
        step: 4,
        title: 'Fallback Awareness on Skewed Keys',
        explanation: 'If keys are skewed, hybrid Interpolation + Binary Search bounds worst-case to O(log N).',
        invariantCheck: 'O(log log N) expected on uniform data.',
        variables: [{ name: 'status', value: 'FOUND @ 6' }],
        array: [10, 20, 30, 40, 50, 60, 70, 80],
        matchedIndices: [6],
      },
    ],
    platformDrills: [
      { platform: 'GeeksforGeeks', title: 'Interpolation Search on Uniform IDs', difficulty: 'Easy', whyThisFits: 'Direct benchmark comparing probe counts vs Binary Search.' },
      { platform: 'LeetCode', title: 'Search Insert Position (Uniform Variant)', difficulty: 'Easy', whyThisFits: 'Illustrates value-proportional index probing.' },
    ],
  },

  // #7 Bubble, Insertion, & Selection Sort
  {
    id: 'elementary-sorts',
    name: 'Elementary Sorts (Insertion, Selection & Bubble)',
    shortName: 'Insertion / Bubble',
    category: 'Searching & Sorting',
    difficulty: 'Core',
    visualType: 'two-pointers',
    tagline: 'In-place O(N²) sorting foundations — Insertion Sort runs in O(N) on nearly sorted data and powers TimSort/Introsort base cases.',
    timeComplexity: 'O(N²) worst · O(N) Insertion best',
    spaceComplexity: 'O(1)',
    mentalModel:
      'Insertion Sort mirrors sorting playing cards in your hand: pick the next card and slide larger cards right until it drops into its sorted slot. Selection Sort minimizes swaps to at most N−1.',
    coreInvariant:
      'At iteration i of Insertion Sort, the subarray arr[0..i−1] is always sorted and contains the exact same elements originally in [0..i−1].',
    whenToUse: [
      'Small arrays (N ≤ 32) as the cutoff base case inside Merge Sort, Quick Sort (Introsort), and Python/Java TimSort.',
      'Nearly sorted streams (at most K inversions → Insertion Sort runs in O(N + K) linear time!).',
      'Flash/EEPROM memory where writes are expensive → Selection Sort performs at most N−1 swaps.',
    ],
    whenItFails:
      'Unusable for large random arrays (N > 10,000 causes ~10⁸ operations); use Merge Sort, TimSort, Quick Sort, or Radix Sort.',
    linkedTopics: ['Arrays & Prefix Sum', 'Two Pointers'],
    linkedProblemSlugs: ['sort-colors', 'merge-intervals'],
    templates: {
      python: `def insertion_sort(nums: list[int]) -> list[int]:
    arr = list(nums)
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
      js: `function insertionSort(nums) {
  const arr = [...nums];
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
      java: `void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Pick Key=2 at Index 1',
        explanation: 'Prefix [5] is trivially sorted. Pick key=2 and compare against 5.',
        invariantCheck: 'arr[0..0] is sorted.',
        variables: [{ name: 'i', value: '1' }, { name: 'key', value: '2' }, { name: 'j', value: '0' }],
        array: [5, 2, 4, 1, 3],
        pointers: [{ label: 'j', index: 0, tone: 'amber' }, { label: 'i', index: 1, tone: 'sky' }],
        highlightIndices: [0, 1],
      },
      {
        step: 2,
        title: 'Shift 5 Right & Place 2',
        explanation: '5 > 2 so shift 5 to index 1, drop key=2 at index 0 → [2, 5, 4, 1, 3]. Next key=4 shifts 5 right.',
        invariantCheck: 'arr[0..2] = [2, 4, 5] is sorted and stable.',
        variables: [{ name: 'i', value: '2' }, { name: 'key', value: '4' }, { name: 'sortedPrefix', value: '[2,4,5]' }],
        array: [2, 4, 5, 1, 3],
        pointers: [{ label: 'i', index: 2, tone: 'emerald' }],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 3,
        title: 'Insert Key=1 Across Sorted Prefix',
        explanation: '1 is smaller than 5, 4, and 2 — shift all three right and drop 1 at index 0.',
        invariantCheck: 'arr[0..3] = [1, 2, 4, 5] maintains relative order of equal keys (stable).',
        variables: [{ name: 'i', value: '3' }, { name: 'key', value: '1' }, { name: 'shifts', value: '3' }],
        array: [1, 2, 4, 5, 3],
        pointers: [{ label: 'drop', index: 0, tone: 'emerald' }],
        matchedIndices: [0, 1, 2, 3],
      },
      {
        step: 4,
        title: 'Insert Final Key=3 → Fully Sorted',
        explanation: 'Shift 5 and 4 right, place 3 at index 2 → [1, 2, 3, 4, 5]. In-place & stable.',
        invariantCheck: 'All N elements sorted with O(1) extra space.',
        variables: [{ name: 'result', value: '[1,2,3,4,5]' }, { name: 'stable', value: 'true' }],
        array: [1, 2, 3, 4, 5],
        matchedIndices: [0, 1, 2, 3, 4],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '147. Insertion Sort List', difficulty: 'Medium', whyThisFits: 'In-place pointer insertion on linked lists.' },
      { platform: 'LeetCode', title: '75. Sort Colors', difficulty: 'Medium', whyThisFits: 'Contrasts O(N²) sorts vs 3-way partition.' },
    ],
  },

  // #6 & #24 Heapify (Up/Down), Build-Heap & Heap Sort
  {
    id: 'heapify-heapsort',
    name: 'Heapify (Up/Down), Build-Heap & Heap Sort',
    shortName: 'Heapify & HeapSort',
    category: 'Searching & Sorting',
    difficulty: 'Core',
    visualType: 'tree-structure',
    tagline: 'Build a binary heap bottom-up in O(N) linear time via Floyd sift-down, then extract max in-place for guaranteed O(N log N) Heap Sort.',
    timeComplexity: 'O(N) Build · O(N log N) Sort',
    spaceComplexity: 'O(1) in-place',
    mentalModel:
      'Store a complete binary tree flat in an array (children of i are 2i+1, 2i+2). Half the nodes are already valid 1-node leaf heaps, so bottom-up sift-down builds the entire heap in linear O(N) time!',
    coreInvariant:
      'Max-Heap Property: for every node i ≥ 0, arr[i] ≥ arr[2i+1] and arr[i] ≥ arr[2i+2]. During Heap Sort, arr[end..N−1] holds the finalized largest elements.',
    whenToUse: [
      'Strict O(1) auxiliary space + guaranteed O(N log N) worst-case time (zero Quick Sort O(N²) risk).',
      'Embedded / real-time systems (Linux kernel `sort()` uses Heap Sort; Introsort falls back to Heap Sort when recursion depth > 2 log N).',
      'Bulk priority queue initialization: `heapq.heapify(arr)` is O(N), strictly faster than N insertions O(N log N).',
    ],
    whenItFails:
      'Heap Sort is NOT stable (equal elements can reorder) and suffers poor CPU cache locality due to jumping to 2i+1; Merge Sort / TimSort win when stability or cache friendliness matters.',
    linkedTopics: ['Heaps & Intervals'],
    linkedProblemSlugs: ['kth-largest-in-stream', 'merge-k-sorted-lists', 'find-median-from-data-stream'],
    templates: {
      python: `def heap_sort(nums: list[int]) -> list[int]:
    a = list(nums)
    n = len(a)
    def sift_down(i: int, size: int) -> None:
        while True:
            largest, l, r = i, 2 * i + 1, 2 * i + 2
            if l < size and a[l] > a[largest]: largest = l
            if r < size and a[r] > a[largest]: largest = r
            if largest == i: break
            a[i], a[largest] = a[largest], a[i]
            i = largest
    for i in range(n // 2 - 1, -1, -1):
        sift_down(i, n)
    for end in range(n - 1, 0, -1):
        a[0], a[end] = a[end], a[0]
        sift_down(0, end)
    return a`,
      js: `function heapSort(nums) {
  const a = [...nums], n = a.length;
  const siftDown = (i, size) => {
    while (true) {
      let largest = i, l = 2 * i + 1, r = 2 * i + 2;
      if (l < size && a[l] > a[largest]) largest = l;
      if (r < size && a[r] > a[largest]) largest = r;
      if (largest === i) break;
      [a[i], a[largest]] = [a[largest], a[i]];
      i = largest;
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    siftDown(0, end);
  }
  return a;
}`,
      java: `void heapSort(int[] a) {
    int n = a.length;
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);
    for (int end = n - 1; end > 0; end--) {
        int tmp = a[0]; a[0] = a[end]; a[end] = tmp;
        siftDown(a, 0, end);
    }
}
void siftDown(int[] a, int i, int size) {
    while (true) {
        int largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest == i) break;
        int t = a[i]; a[i] = a[largest]; a[largest] = t;
        i = largest;
    }
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Floyd Bottom-Up Build-Heap Start',
        explanation: 'Start from last internal node floor(5/2)−1 = 1 on [3, 9, 2, 1, 4]. Leaves [2, 1, 4] are already valid heaps.',
        invariantCheck: 'All subtrees rooted at i > 1 satisfy Max-Heap invariant.',
        variables: [{ name: 'i', value: '1' }, { name: 'heapSize', value: '5' }],
        array: [3, 9, 2, 1, 4],
        highlightIndices: [1, 3, 4],
      },
      {
        step: 2,
        title: 'Sift Down Root Index 0 → Valid Max-Heap',
        explanation: 'Compare root 3 with children 9 and 2; swap 3↔9, then compare 3 with children 1 and 4; swap 3↔4 → [9, 4, 2, 1, 3].',
        invariantCheck: 'Entire array [9, 4, 2, 1, 3] is now a valid Max-Heap in O(N) total swaps.',
        variables: [{ name: 'root', value: '9' }, { name: 'heap', value: '[9,4,2,1,3]' }],
        array: [9, 4, 2, 1, 3],
        matchedIndices: [0],
        highlightIndices: [1, 4],
      },
      {
        step: 3,
        title: 'Swap Max Root to End & Shrink Heap',
        explanation: 'Swap arr[0]=9 with arr[4]=3, lock index 4 as sorted, sift down 3 inside size=4 → [4, 3, 2, 1 | 9].',
        invariantCheck: 'Suffix [9] is permanently in final sorted position.',
        variables: [{ name: 'end', value: '4' }, { name: 'extracted', value: '9' }],
        array: [4, 3, 2, 1, 9],
        matchedIndices: [4],
        highlightIndices: [0, 1],
      },
      {
        step: 4,
        title: 'Repeat Extract-Max Until Sorted',
        explanation: 'Extracting 4, 3, 2 leaves [1, 2, 3, 4, 9] completely sorted in-place with O(1) memory.',
        invariantCheck: 'Guaranteed O(N log N) worst-case time, O(1) space.',
        variables: [{ name: 'result', value: '[1,2,3,4,9]' }],
        array: [1, 2, 3, 4, 9],
        matchedIndices: [0, 1, 2, 3, 4],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '912. Sort an Array (O(1) Space)', difficulty: 'Medium', whyThisFits: 'Heap Sort passes strict worst-case anti-quicksort test cases.' },
      { platform: 'LeetCode', title: '215. Kth Largest Element', difficulty: 'Medium', whyThisFits: 'Build-heap O(N) + K pop operations O(K log N).' },
    ],
  },

  // #8 Counting Sort & Radix Sort
  {
    id: 'counting-radix-sort',
    name: 'Counting Sort & LSD Radix Sort',
    shortName: 'Counting & Radix',
    category: 'Searching & Sorting',
    difficulty: 'Core',
    visualType: 'array-cells-bit',
    tagline: 'Break the Ω(N log N) comparison lower bound by bucketing integer keys digit-by-digit in O(d · (N + b)) linear time.',
    timeComplexity: 'O(N + K) Counting · O(d(N + b)) Radix',
    spaceComplexity: 'O(N + b)',
    mentalModel:
      'Instead of asking "is A < B?", sort postal mail by dropping letters into bins by least-significant digit first (ones, then tens, then hundreds) using a stable Counting Sort at each pass.',
    coreInvariant:
      'After pass p of LSD Radix Sort, the array is stably sorted by the lowest p digits; traversing input backwards during Counting Sort preserves relative order of ties.',
    whenToUse: [
      'Sorting fixed-width integers (32/64-bit IDs, IPv4 addresses, timestamps, RGB pixels) where d is small constant.',
      'Maximum Gap (LC 164), Suffix Array doubling step, and GPU parallel sorting.',
      'Bounded small integer ranges (e.g., ages 0..150, ASCII characters 0..127).',
    ],
    whenItFails:
      'Counting Sort blows up memory if max(arr) − min(arr) = 10⁹ (use Radix Sort instead); neither handles arbitrary floating-point/custom comparator objects without bit-level key encoding.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['sort-colors', 'contains-duplicate'],
    templates: {
      python: `def radix_sort(nums: list[int]) -> list[int]:
    if not nums: return []
    arr = list(nums)
    max_val, exp = max(arr), 1
    while max_val // exp > 0:
        count = [0] * 10
        out = [0] * len(arr)
        for x in arr: count[(x // exp) % 10] += 1
        for i in range(1, 10): count[i] += count[i - 1]
        for x in reversed(arr):
            d = (x // exp) % 10
            count[d] -= 1
            out[count[d]] = x
        arr = out
        exp *= 10
    return arr`,
      js: `function radixSort(nums) {
  if (nums.length <= 1) return [...nums];
  let arr = [...nums];
  const maxVal = Math.max(...arr);
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const count = new Array(10).fill(0);
    const out = new Array(arr.length);
    for (const x of arr) count[Math.floor(x / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--) {
      const d = Math.floor(arr[i] / exp) % 10;
      out[--count[d]] = arr[i];
    }
    arr = out;
  }
  return arr;
}`,
      java: `int[] radixSort(int[] nums) {
    int[] arr = nums.clone();
    int maxVal = 0;
    for (int x : arr) maxVal = Math.max(maxVal, x);
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        int[] count = new int[10], out = new int[arr.length];
        for (int x : arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = arr.length - 1; i >= 0; i--) {
            int d = (arr[i] / exp) % 10;
            out[--count[d]] = arr[i];
        }
        arr = out;
    }
    return arr;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Input Non-Negative Keys',
        explanation: 'Sort [170, 45, 75, 90, 2, 24] without a single element-to-element `<` comparison.',
        invariantCheck: 'maxVal = 170 → 3 decimal passes (exp = 1, 10, 100).',
        variables: [{ name: 'exp', value: '1 (ones)' }, { name: 'digits', value: '3' }],
        array: [170, 45, 75, 90, 2, 24],
        highlightIndices: [0, 1, 2, 3, 4, 5],
      },
      {
        step: 2,
        title: 'Pass 1: Stable Counting Sort by Ones Digit',
        explanation: 'Ones digits [0,5,5,0,2,4] → stably ordered as [170, 90, 2, 24, 45, 75]. Notice 170 stays before 90 and 45 before 75!',
        invariantCheck: 'Prefix-sum count array + right-to-left placement guarantees stability.',
        variables: [{ name: 'exp', value: '1' }, { name: 'order', value: '0,0,2,4,5,5' }],
        array: [170, 90, 2, 24, 45, 75],
        matchedIndices: [0, 1, 2, 3, 4, 5],
      },
      {
        step: 3,
        title: 'Pass 2: Stable Sort by Tens Digit',
        explanation: 'Tens digits [7,9,0,2,4,7] → [2, 24, 45, 170, 75, 90]. Notice 170 precedes 75 because 0 < 5 from Pass 1!',
        invariantCheck: 'Array is now completely sorted by last 2 digits.',
        variables: [{ name: 'exp', value: '10' }, { name: 'order', value: '0,2,4,7,7,9' }],
        array: [2, 24, 45, 170, 75, 90],
        highlightIndices: [3, 4],
      },
      {
        step: 4,
        title: 'Pass 3: Stable Sort by Hundreds Digit → Sorted',
        explanation: 'Hundreds digits [0,0,0,1,0,0] → [2, 24, 45, 75, 90, 170] in O(3·(N+10)) linear time.',
        invariantCheck: 'All 3 digit positions sorted stably.',
        variables: [{ name: 'exp', value: '100' }, { name: 'result', value: '[2,24,45,75,90,170]' }],
        array: [2, 24, 45, 75, 90, 170],
        matchedIndices: [0, 1, 2, 3, 4, 5],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '164. Maximum Gap', difficulty: 'Medium', whyThisFits: 'Requires strict O(N) time sorting via Radix or Bucket Sort.' },
      { platform: 'LeetCode', title: '1122. Relative Sort Array', difficulty: 'Easy', whyThisFits: 'Counting Sort over bounded [0..1000] frequencies.' },
    ],
  },

  // #15 In-Place Linked List Reversal
  {
    id: 'linked-list-reversal',
    name: 'In-Place Linked List Reversal (3-Pointer)',
    shortName: 'List Reversal',
    category: 'Array & String Patterns',
    difficulty: 'Core',
    visualType: 'fast-slow',
    tagline: 'Flip every next pointer in a single O(N) pass using prev, curr, and nextTemp with zero extra nodes allocated.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    mentalModel:
      'Think of reversing train car couplings one car at a time: before detaching curr from nextTemp, grab nextTemp in your right hand so the rest of the train does not drift away!',
    coreInvariant:
      'Before each step, prev points to the head of the already-reversed prefix, and curr points to the head of the untouched remaining suffix.',
    whenToUse: [
      'Reverse entire list (LC 206), sublist [left..right] (LC 92), or K-node groups (LC 25).',
      'Palindrome Linked List (LC 234) and Reorder List (LC 143) combined with Fast & Slow midpoint finding.',
      'Memory-constrained systems where recursive reversal O(N) call stack risks stack overflow.',
    ],
    whenItFails:
      'Cannot be applied safely if concurrent readers are traversing the list without synchronization (use Persistent Path Copying or Lock-Free RCU instead).',
    linkedTopics: ['Linked Lists', 'Two Pointers'],
    linkedProblemSlugs: ['reverse-linked-list', 'linked-list-cycle'],
    templates: {
      python: `def reverse_list(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      js: `function reverseListArray(values) {
  // Simulates 3-pointer in-place link flipping on node array
  let prev = -1, curr = 0;
  const nextPtr = values.map((_, i) => (i + 1 < values.length ? i + 1 : -1));
  while (curr !== -1) {
    const nxt = nextPtr[curr];
    nextPtr[curr] = prev;
    prev = curr;
    curr = nxt;
  }
  const out = [];
  for (let p = prev; p !== -1; p = nextPtr[p]) out.push(values[p]);
  return out;
}`,
      java: `ListNode reverseList(ListNode head) {
    ListNode prev = null, curr = head;
    while (curr != null) {
        ListNode nxt = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nxt;
    }
    return prev;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Initialize prev=null, curr=head(10)',
        explanation: 'List: 10 → 20 → 30 → 40 → null. Save nxt=20 before mutating 10.next.',
        invariantCheck: 'Reversed prefix = empty; untouched suffix = 10→20→30→40.',
        variables: [{ name: 'prev', value: 'null' }, { name: 'curr', value: '10' }, { name: 'nxt', value: '20' }],
        array: [10, 20, 30, 40],
        pointers: [{ label: 'curr', index: 0, tone: 'sky' }, { label: 'nxt', index: 1, tone: 'amber' }],
        highlightIndices: [0],
      },
      {
        step: 2,
        title: 'Flip 10 → null, Advance to 20',
        explanation: 'Set 10.next = null, prev = 10, curr = 20. Now save nxt = 30 and flip 20.next = 10.',
        invariantCheck: 'Prefix 20→10→null reversed; suffix 30→40 intact.',
        variables: [{ name: 'prev', value: '10' }, { name: 'curr', value: '20' }, { name: 'nxt', value: '30' }],
        array: [10, 20, 30, 40],
        pointers: [{ label: 'prev', index: 0, tone: 'emerald' }, { label: 'curr', index: 1, tone: 'sky' }, { label: 'nxt', index: 2, tone: 'amber' }],
        matchedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 3,
        title: 'Flip 30 → 20 → 10, Advance to 40',
        explanation: 'Set 30.next = 20, prev = 30, curr = 40. Save nxt = null.',
        invariantCheck: 'Prefix 30→20→10 reversed; only tail 40 remains.',
        variables: [{ name: 'prev', value: '30' }, { name: 'curr', value: '40' }, { name: 'nxt', value: 'null' }],
        array: [10, 20, 30, 40],
        pointers: [{ label: 'prev', index: 2, tone: 'emerald' }, { label: 'curr', index: 3, tone: 'sky' }],
        matchedIndices: [0, 1, 2],
        highlightIndices: [3],
      },
      {
        step: 4,
        title: 'curr=null → Return New Head prev=40',
        explanation: 'Final reversed chain: 40 → 30 → 20 → 10 → null in O(N) time and O(1) auxiliary space.',
        invariantCheck: 'Zero nodes allocated; original head 10 points to null (no cycle!).',
        variables: [{ name: 'newHead', value: '40' }, { name: 'order', value: '40→30→20→10' }],
        array: [40, 30, 20, 10],
        matchedIndices: [0, 1, 2, 3],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '206. Reverse Linked List', difficulty: 'Easy', whyThisFits: 'Canonical 3-pointer reversal invariant.' },
      { platform: 'LeetCode', title: '25. Reverse Nodes in k-Group', difficulty: 'Hard', whyThisFits: 'Composes 3-pointer reversal with dummy head reconnection.' },
    ],
  },

  // #16 Shunting-Yard Algorithm (Expression Parsing)
  {
    id: 'shunting-yard-parser',
    name: 'Shunting-Yard Algorithm (Expression Parser)',
    shortName: 'Shunting-Yard',
    category: 'Array & String Patterns',
    difficulty: 'Core',
    visualType: 'monotonic-stack',
    tagline: 'Dijkstra’s operator-stack railroad yard that converts infix math expressions into Reverse Polish Notation (RPN) in O(N).',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Picture a train switching yard: numbers roll straight onto the output track, while operators wait on a side-track stack until a lower-precedence operator or closing parenthesis flushes them out.',
    coreInvariant:
      'Inside any parenthesis scope on the operator stack, operator precedences are strictly increasing (for left-associative ops), guaranteeing higher-precedence ops emit first.',
    whenToUse: [
      'Basic Calculator I / II / III (LC 224, 227, 772) with parentheses, +, −, *, /, and unary negation.',
      'Compiler front-ends, spreadsheet formula engines, and SQL WHERE expression evaluators.',
      'Converting human infix formulas into stack-machine bytecode or ASTs without recursive descent.',
    ],
    whenItFails:
      'Insufficient alone for full context-free programming grammars with statements, blocks, and type ambiguity—use recursive descent or LR/LALR parsers.',
    linkedTopics: ['Monotonic Stack'],
    linkedProblemSlugs: ['valid-parentheses', 'daily-temperatures'],
    templates: {
      python: `def infix_to_rpn(tokens: list[str]) -> list[str]:
    prec = {'+': 1, '-': 1, '*': 2, '/': 2}
    out, ops = [], []
    for tok in tokens:
        if tok.lstrip('-').isdigit():
            out.append(tok)
        elif tok == '(':
            ops.append(tok)
        elif tok == ')':
            while ops and ops[-1] != '(':
                out.append(ops.pop())
            ops.pop()
        else:
            while ops and ops[-1] in prec and prec[ops[-1]] >= prec[tok]:
                out.append(ops.pop())
            ops.append(tok)
    while ops:
        out.append(ops.pop())
    return out`,
      js: `function evalInfix(expr) {
  const tokens = expr.match(/\\d+|[()+\\-*/]/g) || [];
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const rpn = [], ops = [];
  for (const t of tokens) {
    if (/^\\d+$/.test(t)) rpn.push(t);
    else if (t === '(') ops.push(t);
    else if (t === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') rpn.push(ops.pop());
      ops.pop();
    } else {
      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) rpn.push(ops.pop());
      ops.push(t);
    }
  }
  while (ops.length) rpn.push(ops.pop());
  const st = [];
  for (const t of rpn) {
    if (/^\\d+$/.test(t)) st.push(Number(t));
    else {
      const b = st.pop(), a = st.pop();
      if (t === '+') st.push(a + b);
      else if (t === '-') st.push(a - b);
      else if (t === '*') st.push(a * b);
      else st.push(Math.trunc(a / b));
    }
  }
  return st[0];
}`,
      java: `List<String> toRpn(List<String> tokens) {
    Map<String, Integer> prec = Map.of("+", 1, "-", 1, "*", 2, "/", 2);
    List<String> out = new ArrayList<>();
    Deque<String> ops = new ArrayDeque<>();
    for (String t : tokens) {
        if (Character.isDigit(t.charAt(0))) out.add(t);
        else if (t.equals("(")) ops.push(t);
        else if (t.equals(")")) {
            while (!ops.peek().equals("(")) out.add(ops.pop());
            ops.pop();
        } else {
            while (!ops.isEmpty() && prec.getOrDefault(ops.peek(), 0) >= prec.get(t))
                out.add(ops.pop());
            ops.push(t);
        }
    }
    while (!ops.isEmpty()) out.add(ops.pop());
    return out;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Read "3" and "+"',
        explanation: 'Expression: 3 + 4 * 2. Operand 3 goes straight to RPN output; operator + waits on operator stack.',
        invariantCheck: 'Stack holds pending operators in strictly increasing precedence.',
        variables: [{ name: 'token', value: '+' }, { name: 'rpn', value: '[3]' }],
        array: ['3', '+', '4', '*', '2'],
        highlightIndices: [0, 1],
        stackItems: [{ label: '+', sub: 'prec=1', active: true }],
        outputSeq: ['3'],
      },
      {
        step: 2,
        title: 'Read "4" and Higher-Precedence "*"',
        explanation: '4 goes to output. Since prec(*) = 2 > prec(+) = 1, push * directly on top of + without popping.',
        invariantCheck: 'Monotonic stack precedence [1, 2] preserved.',
        variables: [{ name: 'token', value: '*' }, { name: 'rpn', value: '[3, 4]' }],
        array: ['3', '+', '4', '*', '2'],
        highlightIndices: [2, 3],
        stackItems: [{ label: '+', sub: 'prec=1' }, { label: '*', sub: 'prec=2', active: true }],
        outputSeq: ['3', '4'],
      },
      {
        step: 3,
        title: 'Read "2" and Flush Operator Stack',
        explanation: '2 goes to output. End of expression flushes * then + → RPN = [3, 4, 2, *, +].',
        invariantCheck: 'Every token pushed and popped at most once → O(N).',
        variables: [{ name: 'rpn', value: '3 4 2 * +' }],
        array: ['3', '+', '4', '*', '2'],
        matchedIndices: [0, 1, 2, 3, 4],
        stackItems: [],
        outputSeq: ['3', '4', '2', '*', '+'],
      },
      {
        step: 4,
        title: 'Evaluate RPN Left-to-Right → 11',
        explanation: '4 * 2 = 8, then 3 + 8 = 11. Zero ambiguity and zero recursion overhead.',
        invariantCheck: 'Parentheses and precedence fully resolved in linear time.',
        variables: [{ name: 'result', value: '11' }],
        array: ['3', '4', '2', '*', '+'],
        matchedIndices: [0, 1, 2, 3, 4],
        outputSeq: ['11'],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '227. Basic Calculator II', difficulty: 'Medium', whyThisFits: 'Direct precedence evaluation without parentheses.' },
      { platform: 'LeetCode', title: '772. Basic Calculator III', difficulty: 'Hard', whyThisFits: 'Full Shunting-Yard with nested parentheses and division.' },
    ],
  },

  // #20 AVL & Red-Black Tree Rotations
  {
    id: 'avl-red-black-trees',
    name: 'AVL & Red-Black Self-Balancing Tree Rotations',
    shortName: 'AVL & Red-Black',
    category: 'Tree & Graph Traversal',
    difficulty: 'Core',
    visualType: 'tree-structure',
    tagline: 'Maintain O(log N) worst-case BST height on skewed inserts via O(1) Left/Right pointer rotations and balance invariants.',
    timeComplexity: 'O(log N) search/insert/delete',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Inserting 10→20→30 turns a plain BST into a linked list. A single Left Rotation lifts 20 to the root and drops 10 to its left—preserving in-order sequence (10 < 20 < 30) while slashing height!',
    coreInvariant:
      'AVL: |height(L) − height(R)| ≤ 1 at every node (stricter reads). Red-Black: equal black-height on all root-to-leaf paths & no consecutive red nodes (fewer rotations on writes, max height ≤ 2 log₂(N+1)).',
    whenToUse: [
      'Ordered in-memory dictionaries supporting predecessor, successor, floor/ceiling, and range iteration (Java TreeMap, C++ std::map, Linux CFS scheduler & epoll use Red-Black Trees).',
      'Read-heavy ordered maps where slightly shorter tree height beats write speed (AVL Trees).',
      'Dynamic order statistics when augmented with subtree sizes.',
    ],
    whenItFails:
      'Poor fit for disk/SSD database storage because 2-way branching causes excessive random page I/Os—use high-fanout B+ Trees for disk storage or Hash Maps when ordering is unnecessary.',
    linkedTopics: ['Trees DFS/BFS', 'Modified Binary Search'],
    linkedProblemSlugs: ['validate-binary-search-tree', 'lowest-common-ancestor-bst'],
    templates: {
      python: `def rotate_left(z):
    y = z.right
    T2 = y.left
    y.left = z
    z.right = T2
    z.h = 1 + max(height(z.left), height(z.right))
    y.h = 1 + max(height(y.left), height(y.right))
    return y`,
      js: `function avlInsertSequence(keys) {
  const h = (n) => (n ? n.h : 0);
  const upd = (n) => { n.h = 1 + Math.max(h(n.l), h(n.r)); return n; };
  const rotR = (y) => { const x = y.l; y.l = x.r; x.r = upd(y); return upd(x); };
  const rotL = (x) => { const y = x.r; x.r = y.l; y.l = upd(x); return upd(y); };
  const ins = (n, k) => {
    if (!n) return { k, l: null, r: null, h: 1 };
    if (k < n.k) n.l = ins(n.l, k);
    else if (k > n.k) n.r = ins(n.r, k);
    else return n;
    upd(n);
    const bf = h(n.l) - h(n.r);
    if (bf > 1 && k < n.l.k) return rotR(n);
    if (bf < -1 && k > n.r.k) return rotL(n);
    if (bf > 1 && k > n.l.k) { n.l = rotL(n.l); return rotR(n); }
    if (bf < -1 && k < n.r.k) { n.r = rotR(n.r); return rotL(n); }
    return n;
  };
  let root = null;
  for (const k of keys) root = ins(root, k);
  const pre = [];
  const walk = (n) => { if (!n) return; pre.push(n.k); walk(n.l); walk(n.r); };
  walk(root);
  return { root: root ? root.k : null, height: h(root), preorder: pre };
}`,
      java: `Node rotateLeft(Node z) {
    Node y = z.right;
    Node t2 = y.left;
    y.left = z;
    z.right = t2;
    z.h = 1 + Math.max(h(z.left), h(z.right));
    y.h = 1 + Math.max(h(y.left), h(y.right));
    return y;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Right-Right Imbalance After Inserting 10, 20, 30',
        explanation: 'Node 10 has balance factor h(L)−h(R) = 0 − 2 = −2 (RR case). Unbalanced height = 3.',
        invariantCheck: 'BST ordering 10 < 20 < 30 holds, but AVL invariant |bf| ≤ 1 is violated at root 10.',
        variables: [{ name: 'root', value: '10' }, { name: 'bf(10)', value: '-2 (RR)' }],
        array: [10, 20, 30],
        highlightIndices: [0, 1, 2],
      },
      {
        step: 2,
        title: 'Execute Single Left Rotation at Node 10',
        explanation: 'Promote 20 as new root, attach 10 as 20.left, and re-attach 20.oldLeft as 10.right in O(1) pointer swaps.',
        invariantCheck: 'In-order traversal remains [10, 20, 30]; height drops from 3 to 2!',
        variables: [{ name: 'newRoot', value: '20' }, { name: 'bf(20)', value: '0' }, { name: 'height', value: '2' }],
        array: [20, 10, 30],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 3,
        title: 'Insert 40, then 50 → Local RR Rotation at 30',
        explanation: 'Inserting 40 keeps |bf| ≤ 1; inserting 50 breaks balance at 30 (bf=−2). Left-rotate 30 → 40 becomes right child of 20.',
        invariantCheck: 'Local rotation fixes subtree without touching root 20.',
        variables: [{ name: 'rotatedAt', value: '30→40' }, { name: 'height', value: '3' }],
        array: [20, 10, 40, 30, 50],
        highlightIndices: [2, 3, 4],
      },
      {
        step: 4,
        title: 'AVL vs Red-Black Trade-off Summary',
        explanation: 'AVL trees have a tighter height bound (about 1.44 log₂ N for large N), which can shorten search paths; actual read speed depends on implementation and workload. Red-Black insertion uses at most two rotations, while deletion has a different bound.',
        invariantCheck: 'All operations bounded strictly by O(log N).',
        variables: [{ name: 'avlMaxH', value: '1.44 logN' }, { name: 'rbMaxH', value: '2 logN' }],
        array: [20, 10, 40, 30, 50],
        matchedIndices: [0, 1, 2, 3, 4],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1382. Balance a Binary Search Tree', difficulty: 'Medium', whyThisFits: 'Tests height-balanced BST construction and invariants.' },
      { platform: 'LeetCode', title: '729. My Calendar I (TreeMap)', difficulty: 'Medium', whyThisFits: 'Production Red-Black Tree floor/ceiling interval lookups.' },
    ],
  },

  // #22 Huffman Coding
  {
    id: 'huffman-coding',
    name: 'Huffman Coding (Optimal Prefix-Free Tree)',
    shortName: 'Huffman Coding',
    category: 'Optimization & Decision Making',
    difficulty: 'Core',
    visualType: 'heap-intervals',
    tagline: 'Assign shorter bit-codes to frequent symbols and longer codes to rare symbols using a Greedy Min-Heap merge tree.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Think of Morse code: frequent letter "E" gets a single dot (`.`), while rare "Q" gets `--.-`. Huffman repeatedly merges the two least-frequent symbols into a parent node so rare symbols sink deepest.',
    coreInvariant:
      'Prefix-Free Property: each symbol is assigned to a leaf, so no codeword is a prefix of another. This lets a decoder read the bit stream without separators; decoding time still grows with the number of bits read.',
    whenToUse: [
      'Lossless entropy coding inside DEFLATE / gzip / ZIP, PNG, JPEG, and HTTP/2 HPACK headers.',
      'Optimal merge patterns: Minimum Cost to Connect Sticks (LC 1167) and Merge Files with Minimum Cost.',
      'Variable-length encoding where symbol frequencies are skewed.',
    ],
    whenItFails:
      'Suboptimal for uniform distributions (where fixed-length bits already match entropy) or when symbols have strong sequential patterns—combine with LZ77/LZW first (like gzip = LZ77 + Huffman).',
    linkedTopics: ['Heaps & Intervals', 'Trees DFS/BFS'],
    linkedProblemSlugs: ['kth-largest-in-stream', 'merge-k-sorted-lists'],
    templates: {
      python: `import heapq

def huffman_total_bits(freqs: list[int]) -> int:
    if len(freqs) <= 1:
        return sum(freqs)
    heap = list(freqs)
    heapq.heapify(heap)
    total_bits = 0
    while len(heap) > 1:
        a, b = heapq.heappop(heap), heapq.heappop(heap)
        merged = a + b
        total_bits += merged
        heapq.heappush(heap, merged)
    return total_bits`,
      js: `function huffmanEncodedBits(freqs) {
  if (freqs.length <= 1) return freqs[0] || 0;
  const heap = [...freqs].sort((a, b) => a - b);
  let totalBits = 0;
  while (heap.length > 1) {
    const a = heap.shift();
    const b = heap.shift();
    const merged = a + b;
    totalBits += merged;
    let idx = heap.findIndex((x) => x > merged);
    if (idx === -1) heap.push(merged);
    else heap.splice(idx, 0, merged);
  }
  return totalBits;
}`,
      java: `int huffmanTotalBits(int[] freqs) {
    PriorityQueue<Integer> pq = new PriorityQueue<>();
    for (int f : freqs) pq.offer(f);
    int total = 0;
    while (pq.size() > 1) {
        int merged = pq.poll() + pq.poll();
        total += merged;
        pq.offer(merged);
    }
    return total;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Push Symbol Frequencies into Min-Heap',
        explanation: 'Symbols A:45, B:13, C:12, D:5, E:9. Min-Heap orders smallest two leaves at the top: D(5) and E(9).',
        invariantCheck: 'Greedy exchange argument proves two rarest symbols must be deepest siblings.',
        variables: [{ name: 'heap', value: '[5, 9, 12, 13, 45]' }, { name: 'totalBits', value: '0' }],
        array: [5, 9, 12, 13, 45],
        highlightIndices: [0, 1],
      },
      {
        step: 2,
        title: 'Merge Two Smallest: 5 + 9 = 14',
        explanation: 'Pop 5 and 9, push internal node 14. Total weighted path cost += 14.',
        invariantCheck: 'Every symbol under node 14 gains +1 bit depth.',
        variables: [{ name: 'merged', value: '14' }, { name: 'heap', value: '[12, 13, 14, 45]' }, { name: 'totalBits', value: '14' }],
        array: [12, 13, 14, 45],
        highlightIndices: [0, 1],
      },
      {
        step: 3,
        title: 'Merge 12 + 13 = 25, then 14 + 25 = 39',
        explanation: 'Pop 12 & 13 → push 25 (cost=39). Next pop 14 & 25 → push 39 (cost=78).',
        invariantCheck: 'Frequent symbol A(45) remains untouched near the top of the tree!',
        variables: [{ name: 'heap', value: '[39, 45]' }, { name: 'totalBits', value: '78' }],
        array: [39, 45],
        highlightIndices: [0, 1],
      },
      {
        step: 4,
        title: 'Final Merge 39 + 45 = 84 → Optimal Codebook',
        explanation: 'A gets 1-bit code `0`; rarer symbols get 3–4 bits. Total = 162 bits vs 252 fixed 3-bit bits (36% savings)!',
        invariantCheck: 'Guaranteed minimum average codeword length among all prefix-free codes.',
        variables: [{ name: 'totalBits', value: '162' }, { name: 'savings', value: '35.7%' }],
        array: [84],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1167. Minimum Cost to Connect Sticks', difficulty: 'Medium', whyThisFits: 'Isomorphic to Huffman weighted external path length.' },
      { platform: 'HackerRank', title: 'Tree: Huffman Decoding', difficulty: 'Medium', whyThisFits: 'Prefix-free bit-stream traversal from root to leaf.' },
    ],
  },

  // #23 Trie Prefix Search & Auto-Complete
  {
    id: 'trie-prefix-autocomplete',
    name: 'Trie Prefix Tree & Ranked Auto-Complete',
    shortName: 'Trie Auto-Complete',
    category: 'Tree & Graph Traversal',
    difficulty: 'Core',
    visualType: 'tree-structure',
    tagline: 'Index strings character-by-character so prefix search and top-K autocomplete run in O(L) time independent of dictionary size N.',
    timeComplexity: 'O(L) insert/search',
    spaceComplexity: 'O(Total Chars · Σ)',
    mentalModel:
      'Think of a dictionary organized as a tree of letters: "app", "apple", and "apply" share the single path a→p→p instead of repeating the prefix three times.',
    coreInvariant:
      'Every node at depth d represents the exact prefix formed by characters along the root-to-node path; `isWord` marks complete dictionary entries.',
    whenToUse: [
      'Search-bar autocomplete, spell checkers, and T9 predictive keyboards.',
      'IP longest-prefix routing tables (Radix / Compressed Patricia Tries).',
      'Word Search II (LC 212) — pruning DFS grid branches immediately when no dictionary word starts with the current prefix.',
    ],
    whenItFails:
      'High memory footprint for sparse alphabets (26-pointer arrays per node waste RAM)—use HashMap children or a Compressed Radix Tree / DAWG when memory is tight.',
    linkedTopics: ['Backtracking & Tries', 'Trees DFS/BFS'],
    linkedProblemSlugs: ['implement-trie', 'word-search'],
    templates: {
      python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_word = True
    def starts_with(self, prefix: str) -> list[str]:
        node = self.root
        for ch in prefix:
            if ch not in node.children: return []
            node = node.children[ch]
        res = []
        def dfs(n, path):
            if n.is_word: res.append(path)
            for c in sorted(n.children): dfs(n.children[c], path + c)
        dfs(node, prefix)
        return res`,
      js: `function trieAutocomplete(words, prefix) {
  const root = { children: {}, isWord: false };
  for (const w of words) {
    let cur = root;
    for (const ch of w) {
      if (!cur.children[ch]) cur.children[ch] = { children: {}, isWord: false };
      cur = cur.children[ch];
    }
    cur.isWord = true;
  }
  let cur = root;
  for (const ch of prefix) {
    if (!cur.children[ch]) return [];
    cur = cur.children[ch];
  }
  const out = [];
  const dfs = (node, path) => {
    if (node.isWord) out.push(path);
    for (const ch of Object.keys(node.children).sort()) dfs(node.children[ch], path + ch);
  };
  dfs(cur, prefix);
  return out;
}`,
      java: `class TrieNode {
    Map<Character, TrieNode> next = new HashMap<>();
    boolean isWord;
}
void insert(TrieNode root, String w) {
    TrieNode cur = root;
    for (char c : w.toCharArray())
        cur = cur.next.computeIfAbsent(c, k -> new TrieNode());
    cur.isWord = true;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Insert "app", "apple", "apt", "bat"',
        explanation: 'Root branches into `a` and `b`. Words sharing prefix `ap` reuse the exact same nodes.',
        invariantCheck: 'Shared prefixes stored once; `isWord` flags terminate valid words.',
        variables: [{ name: 'words', value: '4' }, { name: 'sharedPrefix', value: 'ap' }],
        array: ['root', 'a', 'p', 'p*', 'l', 'e*'],
        highlightIndices: [0, 1, 2],
      },
      {
        step: 2,
        title: 'Query Prefix "ap" in O(2) Hops',
        explanation: 'Follow root → `a` → `p`. Even with 10 million words in the Trie, locating the prefix node takes only L=2 steps!',
        invariantCheck: 'Lookup time depends strictly on prefix length L, not total dictionary size N.',
        variables: [{ name: 'prefix', value: '"ap"' }, { name: 'hops', value: '2' }],
        array: ['root', 'a', 'p', 'p*', 't*'],
        matchedIndices: [1, 2],
      },
      {
        step: 3,
        title: 'Collect Subtree Completions in Lexicographical Order',
        explanation: 'DFS under node `p` emits ["app", "apple", "apt"] while completely ignoring the `b` ("bat") branch.',
        invariantCheck: 'Walking the trie to the prefix node costs O(L). A cached top-three list can make returning those suggestions constant-time after the walk, but cache updates and output costs still apply.',
        variables: [{ name: 'matches', value: '["app","apple","apt"]' }],
        array: ['app', 'apple', 'apt'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 4,
        title: 'Miss Early-Exit on "az"',
        explanation: 'Node `a` has no child `z` → return [] immediately at depth 1.',
        invariantCheck: 'Early termination powers fast backtracking pruning (Word Search II).',
        variables: [{ name: 'prefix', value: '"az"' }, { name: 'result', value: '[]' }],
        array: ['root', 'a', '×z'],
        eliminatedIndices: [2],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '208. Implement Trie (Prefix Tree)', difficulty: 'Medium', whyThisFits: 'Canonical insert/search/startsWith contract.' },
      { platform: 'LeetCode', title: '212. Word Search II', difficulty: 'Hard', whyThisFits: 'Combines Trie + Grid DFS pruning for massive speedup.' },
    ],
  },

  // #34 Hash Tables: Chaining & Open Addressing
  {
    id: 'hash-table-probing',
    name: 'Hash Tables (Chaining & Open Addressing)',
    shortName: 'Hash Table Probing',
    category: 'Array & String Patterns',
    difficulty: 'Core',
    visualType: 'prefix-hash',
    tagline: 'Achieve O(1) average lookup by resolving hash collisions via Separate Chaining, Linear/Quadratic Probing, or Double Hashing.',
    timeComplexity: 'O(1) avg · O(N) worst',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Think of hotel parking slots: Separate Chaining stacks cars in a linked lane at slot h(k), while Open Addressing drives forward to the next open slot (h(k)+i) mod M and leaves a "tombstone" marker on deletion.',
    coreInvariant:
      'Keep load factor α = N / M below threshold (≤ 0.7 for open addressing) via 2× resizing; linear probing searches stop only at a truly EMPTY slot—never at a DELETED tombstone!',
    whenToUse: [
      'O(1) key-value lookup, deduplication, frequency counting, and caching.',
      'Open Addressing (Robin Hood / SwissTable / Python dict) when CPU cache locality matters most.',
      'Separate Chaining (Java HashMap — upgrades long chains ≥ 8 to Red-Black Trees!) when load factor exceeds 0.75 or keys are large.',
    ],
    whenItFails:
      'No ordered range queries (use B+ Tree or Red-Black Tree), and pathological adversarial hash collisions cause O(N) DoS unless randomized hashing (SipHash) or treeified buckets are used.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['two-sum', 'group-anagrams', 'contains-duplicate'],
    templates: {
      python: `class LinearProbeMap:
    TOMBSTONE = object()
    def __init__(self, cap: int = 8):
        self.cap = cap
        self.keys = [None] * cap
        self.vals = [None] * cap
    def put(self, k: int, v: int) -> None:
        idx = k % self.cap
        while self.keys[idx] not in (None, self.TOMBSTONE, k):
            idx = (idx + 1) % self.cap
        self.keys[idx], self.vals[idx] = k, v`,
      js: `function linearProbeInsert(keys, tableSize) {
  const table = new Array(tableSize).fill(null);
  let collisions = 0;
  for (const k of keys) {
    let idx = ((k % tableSize) + tableSize) % tableSize;
    while (table[idx] !== null && table[idx] !== k) {
      collisions++;
      idx = (idx + 1) % tableSize;
    }
    table[idx] = k;
  }
  return { table, collisions };
}`,
      java: `// Double Hashing probe sequence eliminates primary & secondary clustering:
// index(i) = (h1(k) + i * h2(k)) % M   where h2(k) = R - (k % R) != 0`,
    },
    frames: [
      {
        step: 1,
        title: 'Hash Key 12 into Table Size M=7',
        explanation: 'h(12) = 12 % 7 = 5. Slot 5 is empty → insert 12 directly with 0 collisions.',
        invariantCheck: 'Load factor α = 1/7 ≈ 0.14.',
        variables: [{ name: 'key', value: '12' }, { name: 'h(12)', value: '5' }, { name: 'collisions', value: '0' }],
        array: ['·', '·', '·', '·', '·', 12, '·'],
        matchedIndices: [5],
      },
      {
        step: 2,
        title: 'Collision on Key 19 (19 % 7 = 5)',
        explanation: 'Slot 5 is occupied by 12! Linear probing checks (5+1)%7 = 6 (empty) → places 19 at slot 6.',
        invariantCheck: 'Contiguous probe cluster [5, 6] formed; 1 collision recorded.',
        variables: [{ name: 'key', value: '19' }, { name: 'h(19)', value: '5' }, { name: 'placedAt', value: '6' }],
        array: ['·', '·', '·', '·', '·', 12, 19],
        highlightIndices: [5],
        matchedIndices: [6],
      },
      {
        step: 3,
        title: 'Wrap-Around Probe for Key 26 (26 % 7 = 5)',
        explanation: 'Slots 5 and 6 are full → wraps around modulo 7 to slot 0! Double hashing reduces this primary clustering.',
        invariantCheck: 'Search for 26 follows probe chain 5 → 6 → 0.',
        variables: [{ name: 'key', value: '26' }, { name: 'placedAt', value: '0' }, { name: 'collisions', value: '3' }],
        array: [26, '·', '·', '·', '·', 12, 19],
        matchedIndices: [0],
        highlightIndices: [5, 6],
      },
      {
        step: 4,
        title: 'Deletion Requires Tombstone Marker',
        explanation: 'Deleting 19 must write TOMBSTONE at slot 6 (not null), otherwise searching for 26 would stop early at slot 6 and return NOT FOUND!',
        invariantCheck: 'Rehash at α > 0.7 clears tombstones and restores O(1) probes.',
        variables: [{ name: 'slot[6]', value: 'TOMBSTONE' }, { name: 'find(26)', value: 'index 0 ✓' }],
        array: [26, '·', '·', '·', '·', 12, '†'],
        eliminatedIndices: [6],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '706. Design HashMap', difficulty: 'Easy', whyThisFits: 'Builds collision handling and dynamic resizing from scratch.' },
      { platform: 'LeetCode', title: '380. Insert Delete GetRandom O(1)', difficulty: 'Medium', whyThisFits: 'Combines Hash Table + dynamic array swap-with-last.' },
    ],
  },
]);

export const MASTER_CORE_11_PRACTICE: Record<string, AlgorithmPracticeSpec> = hydrateMasterPractice({
  'linear-search': {
    algorithmId: 'linear-search',
    title: 'First Match Linear Search',
    functionName: 'linearSearch',
    prompt: 'Return the first index of `target` in an unsorted integer array `nums`, or `-1` if absent.',
    structuredSteps: [
      { step: '1. Iterate Sequentially', detail: 'Loop index i from 0 to nums.length - 1.' },
      { step: '2. Early Return on Match', detail: 'Return i immediately when nums[i] === target to preserve first-occurrence semantics.' },
      { step: '3. Exhausted Fallback', detail: 'Return -1 after the loop finishes without a match.' },
    ],
    starterCode: `function linearSearch(nums, target) {\n  // TODO: scan sequentially and return first index or -1\n  return -1;\n}`,
    solutionCode: `function linearSearch(nums, target) {\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] === target) return i;\n  }\n  return -1;\n}`,
    testCases: [
      { label: 'Unsorted hit', args: [[14, 7, 23, 19, 5], 19], expected: 3 },
      { label: 'Duplicate returns first', args: [[4, 9, 4, 2], 4], expected: 0 },
      { label: 'Missing value', args: [[1, 2, 3], 9], expected: -1 },
    ],
  },
  'interpolation-search': {
    algorithmId: 'interpolation-search',
    title: 'Uniform Array Interpolation Search',
    functionName: 'interpolationSearch',
    prompt: 'Implement Interpolation Search on a sorted integer array `arr` to find `target` (or return `-1`). Guard against division by zero when `arr[lo] === arr[hi]`.',
    structuredSteps: [
      { step: '1. Value-Range Guard', detail: 'Loop while lo <= hi && arr[lo] <= target && target <= arr[hi].' },
      { step: '2. Zero-Denominator Guard', detail: 'If arr[lo] === arr[hi], return arr[lo] === target ? lo : -1.' },
      { step: '3. Linear Probe & Narrow', detail: 'Compute pos = lo + Math.floor((target - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo])) and shrink bounds.' },
    ],
    starterCode: `function interpolationSearch(arr, target) {\n  // TODO: implement interpolation search\n  return -1;\n}`,
    solutionCode: `function interpolationSearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi && arr[lo] <= target && target <= arr[hi]) {\n    if (arr[lo] === arr[hi]) return arr[lo] === target ? lo : -1;\n    const pos = lo + Math.floor(((target - arr[lo]) * (hi - lo)) / (arr[hi] - arr[lo]));\n    if (arr[pos] === target) return pos;\n    if (arr[pos] < target) lo = pos + 1;\n    else hi = pos - 1;\n  }\n  return -1;\n}`,
    testCases: [
      { label: 'Uniform exact hit', args: [[10, 20, 30, 40, 50, 60, 70, 80], 70], expected: 6 },
      { label: 'All identical values', args: [[5, 5, 5, 5], 5], expected: 0 },
      { label: 'Out of bounds miss', args: [[10, 20, 30], 25], expected: -1 },
    ],
  },
  'elementary-sorts': {
    algorithmId: 'elementary-sorts',
    title: 'In-Place Stable Insertion Sort',
    functionName: 'insertionSort',
    prompt: 'Return a new sorted ascending array using Insertion Sort by shifting larger elements right.',
    structuredSteps: [
      { step: '1. Copy Input', detail: 'Clone nums so caller data is not mutated unexpectedly.' },
      { step: '2. Shift Larger Prefix', detail: 'For each i from 1..n-1, shift arr[j] > key rightwards.' },
      { step: '3. Drop Key', detail: 'Place key at arr[j + 1] to preserve stability.' },
    ],
    starterCode: `function insertionSort(nums) {\n  // TODO: return sorted array via Insertion Sort\n  return [...nums];\n}`,
    solutionCode: `function insertionSort(nums) {\n  const arr = [...nums];\n  for (let i = 1; i < arr.length; i++) {\n    const key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j--;\n    }\n    arr[j + 1] = key;\n  }\n  return arr;\n}`,
    testCases: [
      { label: 'Classic unsorted', args: [[5, 2, 4, 1, 3]], expected: [1, 2, 3, 4, 5] },
      { label: 'Nearly sorted with duplicates', args: [[1, 3, 2, 3, 4]], expected: [1, 2, 3, 3, 4] },
      { label: 'Negative numbers', args: [[-3, 0, -5, 2]], expected: [-5, -3, 0, 2] },
    ],
  },
  'heapify-heapsort': {
    algorithmId: 'heapify-heapsort',
    title: 'Bottom-Up Build-Heap & Heap Sort',
    functionName: 'heapSort',
    prompt: 'Sort `nums` ascending using Floyd bottom-up Max-Heap build O(N) followed by in-place extract-max.',
    structuredSteps: [
      { step: '1. Write siftDown(i, size)', detail: 'Compare node i with children 2i+1 and 2i+2; swap with largest child and repeat.' },
      { step: '2. Build Max-Heap', detail: 'Call siftDown from Math.floor(n/2)-1 down to 0.' },
      { step: '3. Extract Max Loop', detail: 'Swap root a[0] with a[end], shrink heap size to end, and siftDown(0, end).' },
    ],
    starterCode: `function heapSort(nums) {\n  // TODO: implement bottom-up heapify + heap sort\n  return [...nums];\n}`,
    solutionCode: `function heapSort(nums) {\n  const a = [...nums], n = a.length;\n  const siftDown = (i, size) => {\n    while (true) {\n      let largest = i, l = 2 * i + 1, r = 2 * i + 2;\n      if (l < size && a[l] > a[largest]) largest = l;\n      if (r < size && a[r] > a[largest]) largest = r;\n      if (largest === i) break;\n      [a[i], a[largest]] = [a[largest], a[i]];\n      i = largest;\n    }\n  };\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);\n  for (let end = n - 1; end > 0; end--) {\n    [a[0], a[end]] = [a[end], a[0]];\n    siftDown(0, end);\n  }\n  return a;\n}`,
    testCases: [
      { label: 'Standard 5-element array', args: [[3, 9, 2, 1, 4]], expected: [1, 2, 3, 4, 9] },
      { label: 'Reverse sorted', args: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
      { label: 'Negatives & duplicates', args: [[-1, 5, -1, 0, 2]], expected: [-1, -1, 0, 2, 5] },
    ],
  },
  'counting-radix-sort': {
    algorithmId: 'counting-radix-sort',
    title: 'LSD Base-10 Radix Sort',
    functionName: 'radixSort',
    prompt: 'Sort an array of non-negative integers `nums` in linear time using LSD Radix Sort (stable Counting Sort per digit).',
    structuredSteps: [
      { step: '1. Determine Max Exponent', detail: 'Loop exp = 1, 10, 100... while Math.floor(maxVal / exp) > 0.' },
      { step: '2. Frequency + Prefix Sums', detail: 'Count digits 0..9 and compute cumulative prefix counts.' },
      { step: '3. Reverse Placement', detail: 'Iterate i from n-1 down to 0 so ties keep previous pass ordering.' },
    ],
    starterCode: `function radixSort(nums) {\n  // TODO: implement LSD Radix Sort\n  return [...nums];\n}`,
    solutionCode: `function radixSort(nums) {\n  if (nums.length <= 1) return [...nums];\n  let arr = [...nums];\n  const maxVal = Math.max(...arr);\n  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {\n    const count = new Array(10).fill(0);\n    const out = new Array(arr.length);\n    for (const x of arr) count[Math.floor(x / exp) % 10]++;\n    for (let i = 1; i < 10; i++) count[i] += count[i - 1];\n    for (let i = arr.length - 1; i >= 0; i--) {\n      const d = Math.floor(arr[i] / exp) % 10;\n      out[--count[d]] = arr[i];\n    }\n    arr = out;\n  }\n  return arr;\n}`,
    testCases: [
      { label: 'Multi-digit array', args: [[170, 45, 75, 90, 2, 24]], expected: [2, 24, 45, 75, 90, 170] },
      { label: 'Includes zero & ties', args: [[0, 100, 10, 0, 5]], expected: [0, 0, 5, 10, 100] },
      { label: 'Single item', args: [[42]], expected: [42] },
    ],
  },
  'linked-list-reversal': {
    algorithmId: 'linked-list-reversal',
    title: 'In-Place 3-Pointer Linked List Reversal',
    functionName: 'reverseListArray',
    prompt: 'Simulate a singly linked list with a `nextPtr` index array and reverse all pointers in-place using `prev`, `curr`, and `nxt`, returning the traversed reversed values.',
    structuredSteps: [
      { step: '1. Build Next Pointers', detail: 'Initialize nextPtr[i] = i + 1 (and -1 for the tail).' },
      { step: '2. 3-Pointer Flip Loop', detail: 'Save nxt = nextPtr[curr], set nextPtr[curr] = prev, advance prev = curr, curr = nxt.' },
      { step: '3. Traverse From New Head', detail: 'Walk from prev following nextPtr until -1 to collect reversed values.' },
    ],
    starterCode: `function reverseListArray(values) {\n  // TODO: flip next pointers in-place and return reversed sequence\n  return [];\n}`,
    solutionCode: `function reverseListArray(values) {\n  if (values.length === 0) return [];\n  let prev = -1, curr = 0;\n  const nextPtr = values.map((_, i) => (i + 1 < values.length ? i + 1 : -1));\n  while (curr !== -1) {\n    const nxt = nextPtr[curr];\n    nextPtr[curr] = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  const out = [];\n  for (let p = prev; p !== -1; p = nextPtr[p]) out.push(values[p]);\n  return out;\n}`,
    testCases: [
      { label: '4-node chain', args: [[10, 20, 30, 40]], expected: [40, 30, 20, 10] },
      { label: 'Single node', args: [[7]], expected: [7] },
      { label: 'Empty list', args: [[]], expected: [] },
    ],
  },
  'shunting-yard-parser': {
    algorithmId: 'shunting-yard-parser',
    title: 'Shunting-Yard Infix Expression Evaluator',
    functionName: 'evalInfix',
    prompt: 'Parse and evaluate an infix arithmetic string `expr` supporting `+`, `-`, `*`, `/` (truncating toward zero) and parentheses `(...)` via Shunting-Yard → RPN.',
    structuredSteps: [
      { step: '1. Tokenize', detail: 'Extract multi-digit integers and operator/paren tokens.' },
      { step: '2. Shunting-Yard to RPN', detail: 'Use precedence map {+:1, -:1, *:2, /:2} and operator stack.' },
      { step: '3. Evaluate RPN Stack', detail: 'Push numbers; pop b then a on operators and push result.' },
    ],
    starterCode: `function evalInfix(expr) {\n  // TODO: convert infix to RPN and evaluate\n  return 0;\n}`,
    solutionCode: `function evalInfix(expr) {\n  const tokens = expr.match(/\\d+|[()+\\-*/]/g) || [];\n  const prec = { '+': 1, '-': 1, '*': 2, '/': 2 };\n  const rpn = [], ops = [];\n  for (const t of tokens) {\n    if (/^\\d+$/.test(t)) rpn.push(t);\n    else if (t === '(') ops.push(t);\n    else if (t === ')') {\n      while (ops.length && ops[ops.length - 1] !== '(') rpn.push(ops.pop());\n      ops.pop();\n    } else {\n      while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) rpn.push(ops.pop());\n      ops.push(t);\n    }\n  }\n  while (ops.length) rpn.push(ops.pop());\n  const st = [];\n  for (const t of rpn) {\n    if (/^\\d+$/.test(t)) st.push(Number(t));\n    else {\n      const b = st.pop(), a = st.pop();\n      if (t === '+') st.push(a + b);\n      else if (t === '-') st.push(a - b);\n      else if (t === '*') st.push(a * b);\n      else st.push(Math.trunc(a / b));\n    }\n  }\n  return st[0];\n}`,
    testCases: [
      { label: 'Operator precedence', args: ['3 + 4 * 2'], expected: 11 },
      { label: 'Nested parentheses', args: ['(3 + 4) * (10 - 6) / 2'], expected: 14 },
      { label: 'Left-associative subtraction', args: ['20 - 5 - 3'], expected: 12 },
    ],
  },
  'avl-red-black-trees': {
    algorithmId: 'avl-red-black-trees',
    title: 'AVL Self-Balancing Insert & Rotation Engine',
    functionName: 'avlInsertSequence',
    prompt: 'Insert `keys` sequentially into an AVL tree performing LL, RR, LR, and RL rotations, and return `{ root, height, preorder }`.',
    structuredSteps: [
      { step: '1. Height & Rotations', detail: 'Implement rotL and rotR updating heights bottom-up.' },
      { step: '2. Balance Factor Check', detail: 'Compute bf = h(left) - h(right) after recursive BST insert.' },
      { step: '3. Apply 4 Rotation Cases', detail: 'Handle LL (rotR), RR (rotL), LR (rotL left + rotR), RL (rotR right + rotL).' },
    ],
    starterCode: `function avlInsertSequence(keys) {\n  // TODO: return { root, height, preorder }\n  return { root: null, height: 0, preorder: [] };\n}`,
    solutionCode: `function avlInsertSequence(keys) {\n  const h = (n) => (n ? n.h : 0);\n  const upd = (n) => { n.h = 1 + Math.max(h(n.l), h(n.r)); return n; };\n  const rotR = (y) => { const x = y.l; y.l = x.r; x.r = upd(y); return upd(x); };\n  const rotL = (x) => { const y = x.r; x.r = y.l; y.l = upd(x); return upd(y); };\n  const ins = (n, k) => {\n    if (!n) return { k, l: null, r: null, h: 1 };\n    if (k < n.k) n.l = ins(n.l, k);\n    else if (k > n.k) n.r = ins(n.r, k);\n    else return n;\n    upd(n);\n    const bf = h(n.l) - h(n.r);\n    if (bf > 1 && k < n.l.k) return rotR(n);\n    if (bf < -1 && k > n.r.k) return rotL(n);\n    if (bf > 1 && k > n.l.k) { n.l = rotL(n.l); return rotR(n); }\n    if (bf < -1 && k < n.r.k) { n.r = rotR(n.r); return rotL(n); }\n    return n;\n  };\n  let root = null;\n  for (const k of keys) root = ins(root, k);\n  const pre = [];\n  const walk = (n) => { if (!n) return; pre.push(n.k); walk(n.l); walk(n.r); };\n  walk(root);\n  return { root: root ? root.k : null, height: h(root), preorder: pre };\n}`,
    testCases: [
      { label: 'RR rotation (10,20,30)', args: [[10, 20, 30]], expected: { root: 20, height: 2, preorder: [20, 10, 30] } },
      { label: 'LR double rotation (30,10,20)', args: [[30, 10, 20]], expected: { root: 20, height: 2, preorder: [20, 10, 30] } },
      { label: '7 sorted keys balanced to height 3', args: [[1, 2, 3, 4, 5, 6, 7]], expected: { root: 4, height: 3, preorder: [4, 2, 1, 3, 6, 5, 7] } },
    ],
  },
  'huffman-coding': {
    algorithmId: 'huffman-coding',
    title: 'Optimal Huffman Total Encoded Bit Length',
    functionName: 'huffmanEncodedBits',
    prompt: 'Given symbol frequencies `freqs`, return the minimum total number of encoded bits needed to encode all occurrences using an optimal Huffman tree.',
    structuredSteps: [
      { step: '1. Base Case', detail: 'If 0 or 1 symbol, return freqs[0] || 0.' },
      { step: '2. Greedy Min-Two Merge', detail: 'Repeatedly pop the two smallest frequencies a, b and add merged = a + b to totalBits.' },
      { step: '3. Re-Insert Merged Node', detail: 'Push merged back into the min-priority queue until 1 root remains.' },
    ],
    starterCode: `function huffmanEncodedBits(freqs) {\n  // TODO: return optimal Huffman encoded bit count\n  return 0;\n}`,
    solutionCode: `function huffmanEncodedBits(freqs) {\n  if (freqs.length <= 1) return freqs[0] || 0;\n  const heap = [...freqs].sort((a, b) => a - b);\n  let totalBits = 0;\n  while (heap.length > 1) {\n    const a = heap.shift();\n    const b = heap.shift();\n    const merged = a + b;\n    totalBits += merged;\n    let idx = heap.findIndex((x) => x > merged);\n    if (idx === -1) heap.push(merged);\n    else heap.splice(idx, 0, merged);\n  }\n  return totalBits;\n}`,
    testCases: [
      { label: 'CLRS classic 5-symbol set', args: [[45, 13, 12, 5, 9]], expected: 162 },
      { label: 'Equal frequencies (4 symbols)', args: [[10, 10, 10, 10]], expected: 80 },
      { label: 'Single symbol', args: [[7]], expected: 7 },
    ],
  },
  'trie-prefix-autocomplete': {
    algorithmId: 'trie-prefix-autocomplete',
    title: 'Lexicographical Trie Auto-Complete',
    functionName: 'trieAutocomplete',
    prompt: 'Insert all `words` into a Trie and return all words matching `prefix` in sorted alphabetical order.',
    structuredSteps: [
      { step: '1. Insert Words', detail: 'Walk each character creating child nodes and setting isWord = true at the end.' },
      { step: '2. Navigate Prefix', detail: 'Walk prefix characters; return [] immediately if any character is missing.' },
      { step: '3. Sorted Subtree DFS', detail: 'Traverse child keys in alphabetical order collecting every node where isWord === true.' },
    ],
    starterCode: `function trieAutocomplete(words, prefix) {\n  // TODO: return sorted autocomplete matches for prefix\n  return [];\n}`,
    solutionCode: `function trieAutocomplete(words, prefix) {\n  const root = { children: {}, isWord: false };\n  for (const w of words) {\n    let cur = root;\n    for (const ch of w) {\n      if (!cur.children[ch]) cur.children[ch] = { children: {}, isWord: false };\n      cur = cur.children[ch];\n    }\n    cur.isWord = true;\n  }\n  let cur = root;\n  for (const ch of prefix) {\n    if (!cur.children[ch]) return [];\n    cur = cur.children[ch];\n  }\n  const out = [];\n  const dfs = (node, path) => {\n    if (node.isWord) out.push(path);\n    for (const ch of Object.keys(node.children).sort()) dfs(node.children[ch], path + ch);\n  };\n  dfs(cur, prefix);\n  return out;\n}`,
    testCases: [
      { label: 'Prefix "ap"', args: [['apple', 'app', 'bat', 'apt'], 'ap'], expected: ['app', 'apple', 'apt'] },
      { label: 'Prefix miss', args: [['apple', 'app'], 'az'], expected: [] },
      { label: 'Empty prefix returns all sorted', args: [['cat', 'ant', 'bat'], ''], expected: ['ant', 'bat', 'cat'] },
    ],
  },
  'hash-table-probing': {
    algorithmId: 'hash-table-probing',
    title: 'Open Addressing Linear Probing Simulator',
    functionName: 'linearProbeInsert',
    prompt: 'Insert `keys` into a hash table of size `tableSize` using `h(k) = k % tableSize` with linear probing. Return `{ table, collisions }`.',
    structuredSteps: [
      { step: '1. Allocate Fixed Table', detail: 'Initialize an array of length tableSize filled with null.' },
      { step: '2. Probe On Collision', detail: 'While slot is occupied by a different key, increment collisions and step (idx + 1) % tableSize.' },
      { step: '3. Place Key', detail: 'Write key into the free slot and return final table and collision count.' },
    ],
    starterCode: `function linearProbeInsert(keys, tableSize) {\n  // TODO: simulate linear probing and count collisions\n  return { table: [], collisions: 0 };\n}`,
    solutionCode: `function linearProbeInsert(keys, tableSize) {\n  const table = new Array(tableSize).fill(null);\n  let collisions = 0;\n  for (const k of keys) {\n    let idx = ((k % tableSize) + tableSize) % tableSize;\n    while (table[idx] !== null && table[idx] !== k) {\n      collisions++;\n      idx = (idx + 1) % tableSize;\n    }\n    table[idx] = k;\n  }\n  return { table, collisions };\n}`,
    testCases: [
      { label: 'Wrap-around collision chain', args: [[12, 19, 26], 7], expected: { table: [26, null, null, null, null, 12, 19], collisions: 3 } },
      { label: 'Zero collisions', args: [[1, 2, 3], 5], expected: { table: [null, 1, 2, 3, null], collisions: 0 } },
    ],
  },
});
