export interface DsaLesson {
  id: string;
  title: string;
  sourcePages?: number[];
  promise: string;
  mentalModel: string;
  concepts: string[];
  recognition: string[];
  method: string[];
  workedExample: string[];
  complexity: string[];
  pitfalls: string[];
  practice: { level: 'Warm-up' | 'Core' | 'Challenge' | 'Transfer'; task: string; goal: string }[];
  interviewChecks: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
  deepDive?: string[];
  correctness?: string[];
  implementationSteps?: string[];
  codeExamples?: { language: string; title: string; code: string; explanation: string }[];
  traceExercises?: string[];
  realWorldApplications?: string[];
  assessment?: string[];
  revisionPrompts?: string[];
}

export const DSA_COMPLETE_LESSONS: DsaLesson[] = [
  {
    id: 'foundation', sourcePages: [1], title: '1. Foundation', promise: 'Build the reasoning tools used by every data structure and algorithm.',
    mentalModel: 'An algorithm is a precise plan. Data structures decide how information is stored; algorithms decide how that information is processed. Before coding, translate the problem into inputs, outputs, constraints, invariants and edge cases.',
    concepts: [
      'Problem decomposition: restate the task, identify input/output, constraints, assumptions and examples.',
      'Time complexity: count how work grows with n. O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!).',
      'Space complexity: distinguish input storage, auxiliary memory, output memory and recursion stack.',
      'Asymptotic notation: Big-O upper bound, Big-Theta tight bound, Big-Omega lower bound; discuss worst/average/best case.',
      'Arrays, references and memory: contiguous storage vs linked nodes; value vs reference semantics.',
      'Recursion: base case, progress toward base case, recursive hypothesis, call stack and recurrence.',
      'Correctness: loop invariant, induction, pre/postconditions, termination and counterexamples.',
      'Integer safety: overflow, division, modulo with negatives, bounds, null and empty input.',
      'Testing: normal, boundary, duplicate, sorted, reverse, negative, large and adversarial cases.'
    ],
    recognition: ['A prompt includes constraints such as n ≤ 10⁵ or memory limits.', 'You need to justify why a loop or recursion is correct.', 'Two solutions work but have different growth rates.', 'A solution passes examples but fails hidden edge cases.'],
    method: ['Restate the problem and write one tiny example plus one boundary example.', 'Estimate the largest feasible complexity from n and the time limit; treat estimates as guidance, not a guarantee.', 'Write a brute-force solution first and state its time/space cost.', 'Identify repeated work or expensive operations; choose a data structure or invariant that removes it.', 'State the invariant before coding. Explain initialization, preservation and termination.', 'Test empty, singleton, duplicate, extreme and adversarial cases; then prove the result.'],
    workedExample: ['Task: determine whether an array contains a duplicate.', 'Brute force compares every pair: O(n²) time, O(1) extra space.', 'Improvement: maintain a set of values already seen. Before inserting x, test membership; a hit proves a duplicate.', 'Expected complexity: O(n) time and O(n) extra space with a hash set. The expected qualifier matters because hash operations are not a deterministic O(1) worst-case guarantee.', 'Invariant: before processing index i, the set contains exactly the distinct values from indices 0 through i−1.'],
    complexity: ['One loop over n items: O(n). Nested full loops: often O(n²), but inspect actual bounds.', 'Repeatedly halve/double a search space: O(log n).', 'Sorting plus a linear scan: O(n log n).', 'A recursion tree has one node per call; sum work by level and account for stack depth.', 'Amortized analysis averages a sequence of operations, not a single operation (e.g. dynamic-array append).'],
    pitfalls: ['Dropping constants is not permission to ignore large constants in real systems.', 'O(n + m) is not O(n) when n and m are independent.', 'Auxiliary space and total space are different.', 'A recursive algorithm may use O(depth) stack even when it allocates no explicit collection.', 'Never claim correctness only because sample tests pass.'],
    practice: [
      {level:'Warm-up',task:'Classify single, nested, triangular and halving loops.',goal:'Explain the count, not just name the Big-O.'},
      {level:'Warm-up',task:'Find min, max and sum in one pass.',goal:'Write the loop invariant and handle an empty array contract.'},
      {level:'Core',task:'Compare pairwise duplicate detection with a hash-set solution.',goal:'Derive the time/space trade-off.'},
      {level:'Challenge',task:'Analyse recursive binary search and merge sort.',goal:'Write and solve their recurrences.'},
      {level:'Transfer',task:'Given a new n limit and memory budget, choose a feasible approach.',goal:'Defend assumptions and test strategy.'}
    ],
    interviewChecks: ['Why is binary search logarithmic?', 'What is the difference between O(n) auxiliary space and O(n) total space?', 'How do you prove a loop invariant?', 'When can average-case hash lookup degrade?'],
    learningOutcomes: ["Translate a prompt into inputs, outputs, constraints and assumptions.","Estimate time and space growth and distinguish input, auxiliary, output and recursion memory.","Write and preserve loop/recursion invariants and prove termination.","Choose data structures by required operations and complexity.","Design boundary, adversarial and property-oriented tests before trusting an implementation."],
    prerequisites: ["Basic programming syntax, variables, loops, conditions and functions.","Comfort with arrays and simple recursion.","No advanced mathematics required; logarithms and powers are introduced as needed."],
    deepDive: ["Big-O is an asymptotic upper bound; Big-Theta is a tight bound and Big-Omega a lower bound. State the input-size variable and case being analysed.","Count dominant operations rather than measuring one run. Nested loops are not automatically quadratic if their total iterations are bounded linearly.","Auxiliary space excludes input and often excludes required output; recursion stack must be counted separately. State the convention used.","An invariant has initialization, preservation and termination. A correct loop must establish it before the first iteration, maintain it after each iteration and use it to justify the final result.","A recursive function needs a base case, progress toward it and a contract relating the answer to smaller inputs. Recursion depth can be linear and overflow the call stack.","Brute force is a useful correctness baseline. Improve it by identifying repeated work, exploitable order, state reuse or a stronger data structure—not by guessing a pattern.","Integer overflow, negative modulo, null, empty collections and inclusive/exclusive boundaries are part of correctness, not minor implementation details.","Testing examples is insufficient. Add boundary, duplicate, sorted/reverse, negative, maximum-constraint and adversarial cases; use differential or property tests where possible."],
    correctness: ["Precondition/postcondition: state what must be true before an algorithm runs and what it guarantees on return.","Loop proof: establish initialization, preservation and termination for the chosen invariant.","Recursion proof: use induction on input size, proving base cases and the inductive step.","Counterexample method: a single valid input that violates the claimed output disproves an incorrect approach."],
    implementationSteps: ["Restate the task and define exact input/output semantics.","Extract constraints and estimate feasible complexity before choosing an approach.","Write brute force and a small trace to establish a correctness baseline.","Identify the expensive repeated work and choose an invariant/data structure to remove it.","Prove the invariant or recurrence before coding the optimized version.","Choose integer widths and bounds from constraints.","Test normal, boundary, duplicate, negative, extreme and adversarial cases.","Explain time, auxiliary space, output space and recursion stack separately."],
    codeExamples: [{"language":"Java 21","title":"A loop with an explicit invariant","code":"static int firstIndexOf(int[] values, int target) {\\n    int i = 0;\\n    // Invariant: every index in [0, i) has been checked and is not target.\\n    while (i < values.length && values[i] != target) i++;\\n    return i == values.length ? -1 : i;\\n}","explanation":"At each iteration the checked prefix grows by one. On termination either the first match is at i or the entire array was checked. O(n) time and O(1) auxiliary space."}],
    traceExercises: ["For a linear search, write the checked-prefix invariant before and after each iteration.","Compare nested-loop pair checking with a set-based scan and count operations on n=5.","Classify memory used by an input array, a result list and a recursive call stack."],
    realWorldApplications: ["Code review and complexity estimation.","Debugging boundary and state bugs.","Selecting data structures for production services.","Building reliable test suites for APIs and algorithms."],
    assessment: ["State the difference between O, Theta and Omega with an example.","Write initialization, preservation and termination for a loop invariant.","Explain why output memory and auxiliary memory are reported separately.","Choose a feasible algorithm from an input constraint and justify the estimate.","Design boundary and adversarial tests for a given algorithm."],
    revisionPrompts: ["Explain loop invariants without using memorized textbook wording.","After two days, prove a simple loop correct using initialization/preservation/termination.","After one week, estimate complexity and memory for three alternative solutions.","For each new problem, write constraints, invariant and edge cases before code."]
  },
  {
    id: 'arrays', sourcePages: [1], title: '2. Arrays', promise: 'Master indexed storage, traversal, in-place transformations and range-query patterns.',
    mentalModel: 'An array is a row of indexed cells. Random access is cheap because the address of an element can be calculated directly; inserting in the middle is expensive because later elements may need to shift.',
    concepts: ['Static arrays vs dynamic arrays and amortized resizing.', 'Traversal, indexing, update, insertion and deletion costs.', 'Subarray (contiguous) vs subsequence (order-preserving, gaps allowed) vs subset.', 'In-place mutation, read/write pointers and stable compaction.', 'Sorting, frequency tables, hash maps and prefix aggregates.', '2D arrays: row/column indexing, bounds and coordinate transforms.', 'Range sums, prefix sums, difference arrays and prefix XOR.', 'Array invariants: processed prefix, unprocessed suffix and write boundary.'],
    recognition: ['The prompt says contiguous range, subarray, in-place, rotate, partition or range query.', 'You need many indexed reads or one-pass processing.', 'Repeated range sums or range updates appear.', 'Constraints rule out checking every pair or every subarray.'],
    method: ['Clarify whether mutation is allowed and whether order must be preserved.', 'Write the direct nested-loop solution and count repeated work.', 'For repeated sums, build prefix[i+1] = prefix[i] + a[i].', 'For in-place filtering, maintain a write index for the next valid element.', 'For many offline range additions, add at l and subtract after inclusive r in an n+1 difference array, then prefix-scan once; this is not the same workload as online range queries.', 'Prove index boundaries with half-open ranges [l, r).'],
    workedExample: ['Range sum from l through r inclusive: prefix[k] stores the sum of the first k elements.', 'Build prefix in O(n): prefix[0]=0; prefix[i+1]=prefix[i]+a[i].', 'Answer is prefix[r+1]−prefix[l], O(1) per query.', 'For a half-open range [l,r), use prefix[r]−prefix[l]. Choose one convention and use it consistently.'],
    complexity: ['Index read/write: O(1).', 'Full scan: O(n).', 'Insert/delete at arbitrary index: O(n) due to shifts.', 'Prefix preprocessing O(n), each static range-sum query O(1), storage O(n).',
      'Difference-array batch: O(n + u) time and O(n) extra space for n values and u offline range updates; it is not a replacement for arbitrary online range queries.', 'Sorting usually O(n log n); in-place status depends on the algorithm and language implementation.'],
    pitfalls: ['Off-by-one errors around inclusive endpoints.', 'Confusing a subarray with a subsequence.', 'Overwriting an unread value during in-place compaction.', 'Assuming a prefix-sum hash-map method works without considering integer range and initial prefix 0.', 'Using a difference array without applying the final prefix accumulation.'],
    practice: [
      {level:'Warm-up',task:'Find min/max, reverse an array and rotate by k.',goal:'Use indices safely and reduce k modulo n.'},
      {level:'Core',task:'Remove duplicates from a sorted array in-place.',goal:'Use read/write pointers and preserve order.'},
      {level:'Core',task:'Answer many range-sum queries.',goal:'Build and query prefix sums.'},
      {level:'Challenge',task:'Count subarrays whose sum equals k.',goal:'Use prefix sums plus a frequency map; include prefix 0.'},
      {level:'Transfer',task:'Apply many range increments, then return the final array.',goal:'Use a difference array and reason about endpoint updates.'}
    ],
    interviewChecks: ['Why is dynamic-array append amortized O(1)?', 'When is a prefix sum insufficient?', 'How do you preserve unread elements during compaction?', 'What changes when values can be negative?'],

    learningOutcomes: [
      'Explain contiguous indexed storage, array bounds, fixed arrays and dynamic-array resizing.',
      'Choose between an array, dynamic array, prefix aggregate, difference array and hash-based approach from operation requirements.',
      'Implement traversal, insertion, deletion, reversal, rotation and stable in-place compaction without losing unread values.',
      'Derive prefix-sum and difference-array formulas and use endpoint conventions consistently.',
      'Analyse time and auxiliary space, including preprocessing, recursion and output storage.',
      'Test empty, singleton, duplicate-heavy, negative-value, overflow and boundary-index cases.'
    ],
    prerequisites: [
      'Programming fundamentals: variables, loops, conditionals, functions and integer arithmetic.',
      'Zero-based indexing, references and basic memory/address intuition.',
      'Big-O time and auxiliary-space analysis; revisit Foundation if these are unfamiliar.'
    ],
    deepDive: [
      'Memory model: an array stores a contiguous sequence of same-typed elements. The address of element i is base + i × elementSize; this explains constant-time random access and why an index must be within [0,n).',
      'Fixed-size arrays cannot grow in place. Dynamic arrays maintain a logical size and a larger capacity; when capacity is exhausted, they allocate a larger backing array and copy elements. Geometric growth makes append O(1) amortized, although an individual resize costs O(n).',
      'Operation costs depend on where work occurs: indexed read/write is O(1); traversal is O(n); insertion or deletion in the middle shifts up to O(n) elements; searching an unsorted array is O(n).',
      'A subarray is contiguous, a subsequence preserves order but may skip positions, and a subset ignores order. These terms are not interchangeable.',
      'For stable in-place compaction, use a read pointer to inspect original elements and a write pointer to place retained values. Maintain 0 <= write <= read+1; never overwrite an element that has not yet been read.',
      'Prefix sums answer repeated static range-sum queries. Define prefix[0]=0 and prefix[i+1]=prefix[i]+a[i]; sum over half-open [l,r) is prefix[r]-prefix[l].',
      'A difference array supports many range additions. For an inclusive update [l,r] by delta, add delta at diff[l] and subtract it at diff[r+1] using an n+1 sentinel array; one prefix scan reconstructs the values.',
      'A prefix-sum frequency map counts subarrays even when values are negative. For each current prefix p, add the number of earlier prefixes equal to p-k, then record p. Seed frequency[0]=1 to count ranges beginning at index zero.',
      'Two-dimensional arrays require explicit row and column bounds. Jagged arrays may have different row lengths; do not assume a rectangular shape unless the input contract guarantees it.',
      'Integer range is part of correctness: use a wider accumulator when the sum of n values can exceed the element type, even if each value fits.'
    ],
    correctness: [
      'Traversal invariant: before processing index i, every index smaller than i has been processed exactly once and no index greater than or equal to i has been skipped.',
      'Stable compaction invariant: before reading index i, prefix [0,write) contains exactly the retained elements among [0,i), in their original relative order.',
      'Prefix invariant: after processing the first i elements, prefix[i] equals the sum of a[0] through a[i-1]. Thus prefix[r]-prefix[l] leaves exactly a[l] through a[r-1].',
      'Difference-array invariant: after applying boundary deltas and taking a prefix sum, each position contains the sum of every update whose interval covers that position.',
      'Rotation invariant: each original element moves to its destination index modulo n; normalize k and handle n=0 before modulo or indexing.',
      'For each implementation, state whether input is mutated, order is preserved and returned values alias original storage.'
    ],
    implementationSteps: [
      'Use int[] in Java when size is known and fixed; use ArrayList<Integer> when growth is required. ArrayList<Integer> stores boxed references rather than primitive int values.',
      'Use long[] for prefix sums if the maximum accumulated total can exceed the 32-bit integer range.',
      'For in-place removal, use a write index and return the new logical length; do not repeatedly remove from the middle of an ArrayList inside a loop.',
      'Expose range queries with explicit names such as sumRange(leftInclusive, rightExclusive) so endpoint conventions are visible.',
      'For difference-array updates, allocate n+1 entries when an update may write at index n as a sentinel, then materialize only the first n values.',
      'Normalize oversized rotation shifts and avoid modulo by zero for empty arrays.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Prefix sums and half-open range queries', code: 'static long[] buildPrefix(int[] values) {\n    long[] prefix = new long[values.length + 1];\n    for (int i = 0; i < values.length; i++) {\n        prefix[i + 1] = prefix[i] + values[i];\n    }\n    return prefix;\n}\n\nstatic long sumRange(long[] prefix, int left, int rightExclusive) {\n    if (left < 0 || rightExclusive < left || rightExclusive >= prefix.length) {\n        throw new IndexOutOfBoundsException();\n    }\n    return prefix[rightExclusive] - prefix[left];\n}', explanation: 'prefix[i] is the sum of the first i values. A query [left,rightExclusive) subtracts the prefix before left from the prefix at the right boundary. rightExclusive == n is valid.' },
      { language: 'Java 21', title: 'Stable in-place compaction', code: 'static int removeValue(int[] values, int target) {\n    int write = 0;\n    for (int read = 0; read < values.length; read++) {\n        if (values[read] != target) {\n            values[write++] = values[read];\n        }\n    }\n    return write;\n}', explanation: 'The read pointer visits each original element once. The write pointer never moves ahead of read, so unread values are not overwritten. The retained prefix preserves original order.' },
      { language: 'Java 21', title: 'Difference array for offline range additions', code: 'static long[] applyRangeAdds(int[] values, int[][] updates) {\n    long[] diff = new long[values.length + 1];\n    for (int i = 0; i < values.length; i++) diff[i] += values[i];\n    for (int[] update : updates) {\n        int left = update[0], rightInclusive = update[1], delta = update[2];\n        if (left < 0 || rightInclusive < left || rightInclusive >= values.length) throw new IndexOutOfBoundsException();\n        diff[left] += delta;\n        diff[rightInclusive + 1] -= delta;\n    }\n    long[] result = new long[values.length];\n    long running = 0;\n    for (int i = 0; i < values.length; i++) {\n        running += diff[i];\n        result[i] = running;\n    }\n    return result;\n}', explanation: 'Each inclusive update writes only two boundary deltas. A final prefix scan applies all updates in O(n + u) time and O(n) extra space. The n+1 sentinel makes rightInclusive + 1 safe when the update ends at the final element.' },
      { language: 'Python 3', title: 'Prefix sums and range queries', code: 'def build_prefix(values):\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    return prefix\n\ndef sum_range(prefix, left, right_exclusive):\n    if left < 0 or right_exclusive < left or right_exclusive >= len(prefix):\n        raise IndexError(\"invalid range\")\n    return prefix[right_exclusive] - prefix[left]', explanation: 'Python integers grow as needed, but the invariant is the same. The right endpoint is exclusive, matching Python slicing.' },
      { language: 'Python 3', title: 'Difference array for offline range additions', code: 'def apply_range_adds(values, updates):\n    diff = [0] * (len(values) + 1)\n    for i, value in enumerate(values):\n        diff[i] += value\n    for left, right_inclusive, delta in updates:\n        if left < 0 or right_inclusive < left or right_inclusive >= len(values):\n            raise IndexError("invalid update range")\n        diff[left] += delta\n        diff[right_inclusive + 1] -= delta\n    result = []\n    running = 0\n    for i in range(len(values)):\n        running += diff[i]\n        result.append(running)\n    return result', explanation: 'Boundary deltas encode each inclusive update; one prefix scan materializes the final values. Runtime is O(n + u), where u is the number of updates.' }
    ],
    traceExercises: [
      'Predict every prefix value for [3,-2,5,1]. Answer the sum over [1,4) and explain why negative values do not break the formula.',
      'Trace stable compaction for [3,2,2,4,2,5] while removing 2. Record read and write before and after every iteration.',
      'Apply +4 to inclusive range [1,3] and -2 to [2,4] using a difference array. Show boundary deltas and reconstructed values.',
      'Rotate [10,20,30,40,50] right by 7. Normalize the shift, calculate each destination and verify by tracing the reverse operation.'
    ],
    realWorldApplications: [
      'Image processing and matrix computation use indexed contiguous storage for predictable access and cache locality.',
      'Analytics dashboards use prefix aggregates to answer many range totals over a fixed time series.',
      'Batch updates to inventory, scores or capacity ranges can be represented with difference arrays and materialized in one scan.',
      'Stable filtering removes unwanted records while preserving the order of the remaining records.',
      'Circular buffers use array indexing with modular arithmetic for telemetry, streaming and bounded producer-consumer pipelines.'
    ],
    assessment: [
      'Explain why an array read is O(1), while inserting at index zero is O(n). Include address calculation and shift work.',
      'Remove duplicates from a sorted array in-place while preserving order. State the loop invariant and test empty and singleton inputs.',
      'Given negative values and many range-sum queries, choose prefix sums and prove the query formula.',
      'Given many range increments followed by one final read, derive a difference-array solution and handle an update ending at n-1.',
      'Given n and maximum absolute value where the total can exceed 32-bit range, identify every accumulator that must use long.',
      'Compare prefix sums, sliding windows and prefix-sum frequency maps for three different subarray tasks. State each method’s assumptions.'
    ],
    revisionPrompts: [
      'Without looking, derive prefix[r]-prefix[l] for half-open interval [l,r).',
      'Explain subarray, subsequence and subset with one example each.',
      'Why is dynamic-array append amortized O(1) rather than worst-case O(1)?',
      'Describe the read/write pointer invariant that makes stable compaction safe.',
      'When do negative numbers invalidate a usual positive-sum sliding-window strategy but still allow prefix-sum methods?',
      'Review after 1, 3, 7, 14 and 30 days using a fresh array example rather than memorizing the same trace.'
    ]
  },
  {
    id: 'linked-list', sourcePages: [11], title: '3. Linked List', promise: 'Reason confidently about nodes, references, pointer rewiring, cycles and list transformations.',
    mentalModel: 'A linked list is a chain of nodes. Each node stores a value and a reference to the next node. You do not jump to index i; you follow links. The key skill is preserving references while rewiring edges.',
    concepts: ['Singly vs doubly linked lists; head, tail and null termination.', 'Traversal and why indexed access is O(n).', 'Insertion/deletion after a known node vs searching for a node.', 'Dummy/sentinel nodes to remove head special cases.', 'Reverse iteratively and recursively.', 'Fast/slow pointers for middle and cycle detection.', 'Floyd cycle entry derivation.', 'Merge two sorted lists; split with slow/fast pointers.', 'LRU cache connection: hash map + doubly linked list.'],
    recognition: ['The input is a node head and asks to reverse, merge, partition or detect a cycle.', 'Frequent insert/delete operations occur when the node is already known.', 'You need the middle, kth-from-end or cycle entry.'],
    method: ['Draw nodes as boxes and arrows; mark head and null.', 'Before changing a link, save the next reference if it is still needed.', 'Use a dummy node when the result head may change.', 'For reversal, maintain previous, current and next; reverse one edge per iteration.', 'For cycle detection, move slow by one and fast by two; only compare after safe advancement.', 'State what each pointer represents at the top of every loop.'],
    workedExample: ['Reverse A → B → C → null.', 'Start prev=null, curr=A. Save next=B; set A.next=prev; advance prev=A, curr=B.', 'Repeat: B.next=A, then C.next=B. Stop when curr=null.', 'Return prev (C). Time O(n), extra space O(1).', 'Invariant: prev is the reversed prefix; curr is the first node of the not-yet-reversed suffix.'],
    complexity: ['Search/traversal: O(n).', 'Insert/delete after a known node: O(1). Finding that node still costs O(n).', 'Reverse: O(n) time, O(1) iterative extra space; recursive version uses O(n) call stack.', 'Floyd cycle detection: O(n) time, O(1) space.'],
    pitfalls: ['Losing the rest of the list by overwriting next too early.', 'Returning the old head after reversal.', 'Null dereference when fast.next is null.', 'Creating a cycle accidentally while merging or reversing.', 'Assuming linked lists are faster than arrays for all insertions; locating the position is still costly.'],
    practice: [
      {level:'Warm-up',task:'Traverse, count nodes and search for a value.',goal:'Handle null head and one node.'},
      {level:'Core',task:'Reverse a singly linked list.',goal:'Explain the three-pointer invariant.'},
      {level:'Core',task:'Find the middle and detect a cycle.',goal:'Derive fast/slow pointer movement.'},
      {level:'Challenge',task:'Find cycle entry and merge two sorted lists.',goal:'Prove pointer alignment and preserve sorted order.'},
      {level:'Transfer',task:'Reverse nodes in groups of k.',goal:'Separate a complete group from the remaining suffix safely.'}
    ],
    interviewChecks: ['Why does Floyd’s algorithm meet inside a cycle?', 'Why use a dummy node?', 'What is the difference between deleting a node and finding the node to delete?', 'How do you avoid losing the suffix while reversing?'],
    learningOutcomes: [
      'Model singly, doubly and circular linked lists using nodes and explicit reference invariants.',
      'Derive the time cost of traversal, indexed access, insertion and deletion, distinguishing a known node from a searched-for position.',
      'Implement traversal, insertion, deletion and reversal without losing references or introducing accidental cycles.',
      'Use sentinel nodes to simplify head/tail boundary cases and merge operations.',
      'Explain and implement fast/slow pointer techniques for middle nodes and Floyd cycle detection.',
      'Compare linked lists with arrays and identify when a hash-map plus doubly linked list is useful.'
    ],
    prerequisites: [
      'Understand object references, null/None, heap allocation and mutation in your chosen language; distinguish object identity from equal values.',
      'Be comfortable with loops, conditions and O(1)/O(n) complexity.',
      'Review arrays to compare contiguous indexing with pointer traversal.',
      'Know that two variables can refer to the same mutable node object.'
    ],
    deepDive: [
      'A singly linked list node contains a value and one next reference. The head is the only entry point; the final node points to null. A list with no nodes has head = null.',
      'A doubly linked list stores next and previous references. It supports local removal when a node reference is known, but every insertion/removal must update both directions consistently.',
      'A circular list links the tail back to the head (or uses a sentinel). Traversal must stop by detecting a return to the start or by using a known size; waiting for null never terminates.',
      'Array indexing is O(1) because the address is computed from a base and offset. Linked-list access at index i follows i links and is O(i); there is no constant-time random access.',
      'Insertion after a known node is O(1): connect the new node to the old successor, then connect the predecessor to the new node. Searching for the predecessor remains O(n).',
      'Deletion in a singly linked list usually requires the predecessor so it can bypass the removed node. A head deletion is special unless a dummy node is used. Copying the next value into a node is not a general substitute because it cannot delete the tail and changes node identity semantics.',
      'A dummy/sentinel node is a permanent node before the logical head. It gives head insertion and deletion the same pointer-rewiring shape as interior operations. Do not expose the sentinel as data.',
      'Iterative reversal maintains three references: prev is the reversed prefix, curr is the first unprocessed node, and next temporarily saves the remaining suffix before curr.next is overwritten.',
      'Floyd cycle detection advances slow by one and fast by two. If a cycle exists, the relative speed is one node per iteration, so their distance modulo cycle length eventually becomes zero.',
      'After a meeting, reset one pointer to head and move both one step at a time. Their distances to the cycle entry are congruent modulo the cycle length, so they meet at the entry.',
      'For kth-from-end, a lead pointer advances k nodes before a follower starts. Maintaining a k-node gap makes the follower land at the required position when the lead reaches the end; define whether k is one-based.',
      'Merging sorted lists uses a dummy tail. At each step, append the smaller current node; the chosen prefix remains sorted and contains the smallest items processed so far.',
      'An LRU cache combines a hash map for O(1) average key lookup with a doubly linked list for O(1) removal and movement of a known node to the most-recently-used end.',
      'Pointer algorithms should specify ownership and mutation. Reusing nodes is O(1) auxiliary space but mutates inputs; creating new nodes costs O(n) output storage and preserves the originals.'
    ],
    correctness: [
      'Reversal invariant: prev is exactly the reversed prefix of the original list, curr is the first node of the untouched suffix, and no node is lost because next is saved before rewiring.',
      'Each reversal iteration moves exactly one node from the untouched suffix to the front of the reversed prefix. When curr becomes null, prev is the complete reversed list.',
      'Cycle detection: if a cycle has length L, fast gains one node per iteration relative to slow; the relative offset ranges modulo L and must eventually be zero.',
      'Cycle-entry proof: after a meeting, the distance from head to entry and the distance from the meeting point to entry differ by a multiple of the cycle length; moving both pointers one step preserves alignment until entry.',
      'Merge invariant: the output prefix is sorted and contains the smallest nodes among the prefixes consumed from both inputs; choosing the smaller head preserves sorted order.',
      'Sentinel invariant: the sentinel always precedes the logical result, so updating tail.next never requires a separate empty-result branch.'
    ],
    implementationSteps: [
      'Draw every node as a box and every reference as a directed arrow. Label head, tail, null and any sentinel.',
      'Write down whether the operation mutates existing nodes or allocates new nodes; preserve node identity when required.',
      'Before overwriting a next reference, save the successor if any unprocessed node remains reachable only through it.',
      'For deletion, identify the predecessor and define behavior for empty list, head, tail and missing value.',
      'For reversal, name prev, curr and next according to their invariant roles; advance only after the edge has been rewired.',
      'For fast/slow loops, guard fast != null and fast.next != null before reading fast.next.next.',
      'For cycle-entry logic, handle the no-cycle case before resetting pointers.',
      'Test with null, singleton, two nodes, duplicates, tail operations, self-loop and a cycle beginning at the head or in the middle.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Iterative reversal and Floyd cycle detection', code: `static final class Node {
    int value;
    Node next;
    Node(int value) { this.value = value; }
}

static Node reverse(Node head) {
    Node previous = null;
    Node current = head;
    while (current != null) {
        Node next = current.next; // save the untouched suffix
        current.next = previous;  // reverse one edge
        previous = current;
        current = next;
    }
    return previous;
}

static boolean hasCycle(Node head) {
    Node slow = head;
    Node fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`, explanation: 'Reversal is O(n) time and O(1) auxiliary space; it mutates the original nodes. Floyd detection is O(n) time and O(1) space. The identity comparison is intentional: two references meet only when they point to the same node object.' }

      { language: 'JavaScript (Node.js)', title: 'Iterative reversal and Floyd cycle detection', code: `class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

function reverse(head) {
  let previous = null;
  let current = head;
  while (current !== null) {
    const next = current.next; // save the untouched suffix
    current.next = previous;
    previous = current;
    current = next;
  }
  return previous;
}

function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // compare node identity
  }
  return false;
}`, explanation: 'The algorithm is the same as the Java version: O(n) time and O(1) auxiliary space. JavaScript strict equality compares object identity here, not node values. Reversal mutates the original nodes.' },
      { language: 'Python 3', title: 'Iterative reversal and Floyd cycle detection', code: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

def reverse(head):
    previous = None
    current = head
    while current is not None:
        next_node = current.next  # save the untouched suffix
        current.next = previous
        previous = current
        current = next_node
    return previous

def has_cycle(head):
    slow = head
    fast = head
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:  # compare object identity
            return True
    return False`, explanation: 'The algorithm takes O(n) time and O(1) auxiliary space. Python identity comparison with is is intentional: equal values do not mean two references point to the same node. Reversal mutates the original nodes.' },    ],
    traceExercises: [
      'Reverse A → B → C → null. After each iteration, draw prev, curr, next and all next arrows.',
      'Run slow/fast on a five-node acyclic list. Record each pointer before and after every iteration and show why the null guard is required.',
      'Create a cycle where node 4 points to node 2. Trace the meeting phase and then the reset-to-head phase until the entry is found.',
      'Merge 1 → 4 → 7 with 2 → 3 → 8. Record the dummy tail after each selected node and verify the output prefix remains sorted.'
    ],
    realWorldApplications: [
      'LRU caches use a hash map plus doubly linked list to support average O(1) lookup and recency updates.',
      'Schedulers and round-robin processing can use circular linked structures when traversal repeatedly wraps around.',
      'Memory allocators and free lists link reusable blocks without requiring contiguous storage.',
      'Undo/redo histories can use doubly linked navigation between adjacent states.',
      'Graph adjacency structures and intrusive lists use references when nodes participate in multiple relationships.'
    ],
    assessment: [
      'Explain why inserting after a known node is O(1) but inserting at an arbitrary index is O(n).',
      'Implement iterative reversal and state the loop invariant before the first iteration and after each iteration.',
      'Prove Floyd meeting for a cycle of length L and derive the reset-to-head cycle-entry procedure.',
      'Compare singly and doubly linked list deletion when the target node reference is already known.',
      'Design a merge of two sorted lists and explain whether it reuses nodes or allocates new ones.',
      'List the pointer updates required to move a node to the front of an LRU doubly linked list.',
      'Test empty, singleton, two-node, duplicate-value, self-loop, head-cycle and middle-cycle cases.'
    ],
    revisionPrompts: [
      'Draw a singly and doubly linked node from memory and label every reference.',
      'Reconstruct the three-pointer reversal algorithm without looking at code.',
      'Explain the fast/slow relative-speed argument using a cycle of length five.',
      'After two days, implement cycle detection and cycle-entry lookup and test a self-loop.',
      'After one week, compare array and linked-list operations with both asymptotic cost and memory-locality trade-offs.',
      'Explain how a hash map plus doubly linked list gives an LRU cache O(1) average operations.'
    ]
  },
  {
    id: 'strings', sourcePages: [2], title: '4. Strings', promise: 'Solve character, substring, palindrome, parsing and pattern-matching problems safely.',
    mentalModel: 'A string is a sequence of symbols. Many languages treat strings as immutable, so repeated concatenation can copy data. Decide whether the task concerns bytes, code units, Unicode code points or user-perceived grapheme clusters.',
    concepts: ['String immutability and efficient builders/buffers.', 'Character arrays, frequency arrays and hash maps.', 'ASCII assumptions vs Unicode and normalization.', 'Substring vs subsequence.', 'Palindrome checks with two pointers and frequency parity.', 'Anagrams and canonical representations.', 'Parsing, tokenization and delimiter handling.', 'Naive matching, KMP prefix function, Z algorithm and rolling hash (advanced).'],
    recognition: ['The task mentions anagram, palindrome, substring, subsequence, pattern match or character counts.', 'You need to compare two strings under reordering or normalization.', 'A naive repeated substring search is too slow.'],
    method: ['Clarify the character model and case/space/punctuation rules.', 'For fixed alphabets, use a frequency array; otherwise use a map.', 'For palindrome, compare mirrored positions or use a center expansion.', 'For sliding substring constraints, maintain a window and character counts.', 'For repeated exact pattern matching, begin with a simple scan, then use KMP/Z when constraints justify it.', 'Build output with StringBuilder or a mutable buffer in languages where concatenation copies.'],
    workedExample: ['Anagram check: if lengths differ, return false.', 'Count each character in the first string; decrement for each character in the second.', 'If any count becomes negative or any final count is nonzero, they are not anagrams.', 'Time O(n), extra space O(Σ) for a fixed alphabet or O(distinct characters) for a map.', 'If Unicode normalization or case folding matters, normalize both inputs before counting.'],
    complexity: ['One pass with a frequency table: O(n + Σ), often O(n) for a fixed alphabet.', 'Sort both strings: O(n log n) time.', 'Center expansion for all palindromic substrings: O(n²) time, O(1) extra space.', 'KMP pattern matching: O(n + m) time and O(m) prefix table.'],
    pitfalls: ['Assuming every language indexes Unicode by visible character.', 'Using repeated immutable concatenation in a loop.', 'Forgetting empty strings and unequal lengths.', 'Confusing substring with subsequence.', 'Incorrectly resetting a frequency window after a mismatch.'],
    practice: [
      {level:'Warm-up',task:'Reverse words and validate a palindrome.',goal:'Define treatment of spaces and punctuation.'},
      {level:'Core',task:'Group anagrams and find the first unique character.',goal:'Choose a canonical key or frequency map.'},
      {level:'Core',task:'Longest substring without repeating characters.',goal:'Maintain a valid variable-size window.'},
      {level:'Challenge',task:'Find all anagram start indices and implement KMP.',goal:'Track counts and prefix-function fallback.'},
      {level:'Transfer',task:'Adapt a string algorithm to Unicode-aware input.',goal:'State normalization and indexing assumptions.'}
    ],
    interviewChecks: ['When is a frequency array preferable to sorting?', 'What does KMP remember after a mismatch?', 'Why can string concatenation become quadratic?', 'What does “character” mean in the chosen language?'],
    learningOutcomes: [
      'Choose the correct character model: ASCII, UTF-16 code unit, Unicode code point or grapheme cluster, and state any normalization assumptions.',
      'Distinguish substring, subsequence, prefix and suffix and select an algorithm that matches the required relationship.',
      'Solve anagram, frequency, palindrome and uniqueness tasks using arrays or maps with justified alphabet assumptions.',
      'Use two pointers and sliding windows while maintaining a precise window invariant.',
      'Explain why naive pattern matching can be O(nm) and derive KMP fallback using the longest proper prefix that is also a suffix.',
      'Implement string processing without accidental quadratic copying and test empty, repeated and Unicode input.'
    ],
    prerequisites: [
      'Array indexing and traversal; be able to trace left/right indices and half-open ranges.',
      'Hash maps and frequency counting; review the Set/Map lesson when alphabet size is not fixed.',
      'Two pointers and sliding-window fundamentals for substring constraints.',
      'Basic modular reasoning and prefix/suffix vocabulary; no advanced string theory is assumed.'
    ],
    deepDive: [
      'A string is an ordered sequence, but the unit exposed by an API is language-specific. Java String indices address UTF-16 code units; codePointAt/codePoints operate on Unicode code points. A user-perceived grapheme such as an emoji with a modifier may contain multiple code points. Never call an index a character index without stating the model.',
      'Canonical equivalence matters: a visually identical accented character can be encoded as one precomposed code point or a base letter plus combining mark. Normalize both inputs (for example NFC) only when the problem defines canonical equivalence; normalization changes the comparison contract.',
      'A substring is contiguous; a subsequence preserves order but may skip positions. “abc” is a subsequence of “axbyc” but not a substring. Prefixes start at index 0; suffixes end at the final index.',
      'Frequency counting compares multisets. For a known small alphabet, an integer array gives O(1) indexed updates; for general code points, use a map. Sorting is simpler but costs O(n log n).',
      'Palindrome checking compares symmetric positions. A two-pointer scan is O(n) time and O(1) auxiliary space when the comparison rule is already defined. Ignoring punctuation or case is a separate normalization/filtering step, not an implicit property.',
      'A variable window represents a contiguous candidate range [left, right). Its invariant describes exactly what is valid inside the window. Expand right to include new input; move left only enough to restore validity. Each pointer advances at most n times.',
      'Naive pattern matching tries every alignment and may compare m characters at each of n-m+1 starts, giving O(nm). KMP avoids rechecking text by retaining the longest prefix of the pattern that is also a suffix of the matched portion.',
      'The KMP prefix-function value pi[i] is the length of the longest proper border of pattern[0..i]. On mismatch, set j = pi[j-1] repeatedly; do not move the text index backward. Each fallback strictly decreases j, yielding linear total work.',
      'Repeated immutable concatenation can copy the accumulated prefix on every iteration, producing quadratic total copying. Use StringBuilder in Java or a list plus join in Python when building many pieces.',
      'Hashing-based matching can be fast but rolling hashes may collide. Verify candidate matches when correctness must be deterministic, or prefer KMP/Z for exact linear-time matching.',
      'Complexity must include preprocessing and output. KMP is O(n+m) time and O(m) auxiliary space; returning all matched positions additionally requires O(k) output space.'
    ],
    correctness: [
      'Anagram frequency invariant: after processing the first i code points of each input, each map entry equals the difference between counts in the two processed prefixes. Equal lengths and all-zero final differences imply equal multisets.',
      'Palindrome invariant: before each comparison, all positions outside [left, right] have already been verified as matching mirror pairs. Advancing both ends preserves the invariant.',
      'Sliding-window invariant: after each left-boundary adjustment, the current half-open window satisfies the stated constraint; the algorithm records answers only for valid windows.',
      'KMP invariant: before comparing pattern[j] with the current text code point, pattern[0..j) is the longest prefix that matches a suffix ending immediately before the current text position.',
      'KMP prefix fallback is safe because any shorter valid continuation must be a border of the already matched prefix; pi[j-1] selects the longest such candidate without skipping a possible match.',
      'Termination: text and pattern scan indices only advance, while each KMP fallback strictly reduces j. Therefore the scan terminates after O(n+m) aggregate transitions.'
    ],
    implementationSteps: [
      'Write down whether comparison is case-sensitive, whitespace-sensitive, punctuation-sensitive and normalization-sensitive.',
      'Choose a representation: char/code unit, code point, grapheme segment, fixed alphabet array or map. Keep index units consistent throughout.',
      'Define empty-input behavior and whether the empty pattern matches at every boundary or only once.',
      'State the invariant before coding: frequency difference, mirrored prefix, valid window or KMP matched-prefix length.',
      'Prefer half-open ranges [left, right) for substring windows; document conversion when an API uses inclusive endpoints.',
      'For KMP, build the prefix table independently, then scan text with the fallback loop. Test repeated-prefix patterns such as “aaaaab”.',
      'Use StringBuilder or an equivalent mutable buffer for repeated output construction.',
      'Test supplementary Unicode code points, combining marks and normalization only when the product/problem contract requires them.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Code-point-aware anagram check', code: `static boolean areAnagrams(String first, String second) {
    int[] a = first.codePoints().toArray();
    int[] b = second.codePoints().toArray();
    if (a.length != b.length) return false;

    Map<Integer, Integer> counts = new HashMap<>();
    for (int cp : a) counts.merge(cp, 1, Integer::sum);
    for (int cp : b) {
        int remaining = counts.getOrDefault(cp, 0) - 1;
        if (remaining < 0) return false;
        if (remaining == 0) counts.remove(cp);
        else counts.put(cp, remaining);
    }
    return counts.isEmpty();
}`, explanation: 'Counts Unicode code points rather than UTF-16 code units. This compares exact code-point sequences as multisets; it intentionally does not perform case folding or Unicode normalization. Time O(n), auxiliary space O(u), where u is the number of distinct code points.' },
      { language: 'Java 21', title: 'KMP exact pattern search', code: `static int[] prefixFunction(String pattern) {
    int[] pi = new int[pattern.length()];
    for (int i = 1, j = 0; i < pattern.length(); i++) {
        while (j > 0 && pattern.charAt(i) != pattern.charAt(j)) {
            j = pi[j - 1];
        }
        if (pattern.charAt(i) == pattern.charAt(j)) j++;
        pi[i] = j;
    }
    return pi;
}

static int[] kmpMatches(String text, String pattern) {
    List<Integer> matches = new ArrayList<>();
    if (pattern.isEmpty()) {
        for (int i = 0; i <= text.length(); i++) matches.add(i);
        return matches.stream().mapToInt(Integer::intValue).toArray();
    }
    int[] pi = prefixFunction(pattern);
    for (int i = 0, j = 0; i < text.length(); i++) {
        while (j > 0 && text.charAt(i) != pattern.charAt(j)) j = pi[j - 1];
        if (text.charAt(i) == pattern.charAt(j)) j++;
        if (j == pattern.length()) {
            matches.add(i - j + 1);
            j = pi[j - 1];
        }
    }
    return matches.stream().mapToInt(Integer::intValue).toArray();
}`, explanation: 'This version searches UTF-16 code units and returns UTF-16 offsets, matching Java String indexing. It is exact and deterministic. Prefix construction is O(m); scanning is O(n); total O(n+m) time and O(m+k) space including returned match positions.' },
      { language: 'Python 3', title: 'Palindrome under an explicit ASCII alphanumeric rule', code: `def is_ascii_alphanumeric_palindrome(value: str) -> bool:
    filtered = [ch.lower() for ch in value if ch.isascii() and ch.isalnum()]
    left, right = 0, len(filtered) - 1
    while left < right:
        if filtered[left] != filtered[right]:
            return False
        left += 1
        right -= 1
    return True`, explanation: 'The filtering rule is deliberately ASCII-only and ignores punctuation and case. It uses O(n) time and O(n) extra space for the filtered list. A streaming two-pointer implementation over a normalized buffer can reduce auxiliary space.' }
    ],
    traceExercises: [
      'Anagram trace: first = “aab”, second = “aba”. Write the count map after each code point and explain why the final map is empty.',
      'KMP trace: pattern = “ababaca”. Build pi one position at a time; show the fallback when the next symbol mismatches after matching “ababa”.',
      'Window trace: text = “pwwkew”. Record [left, right), the current set of characters and the best length after every expansion and shrink.',
      'Unicode trace: compare “é” as U+00E9 with “e” + U+0301. Explain why exact code-point comparison differs before NFC normalization.'
    ],
    realWorldApplications: [
      'Search boxes and autocomplete: prefix matching, tokenization, case policy and Unicode normalization.',
      'Log/event processing: parsing delimiters, extracting fields and detecting repeated identifiers.',
      'Deduplication and identity matching: canonicalization must be explicit to avoid treating distinct identifiers as equal.',
      'Text editors and diff tools: substring search, incremental scanning and efficient output buffers.',
      'Security-sensitive validation: avoid ambiguous normalization rules and test visually confusable or differently encoded input.'
    ],
    assessment: [
      'Explain with a concrete example why a subsequence need not be a substring; give the time complexity of checking a candidate subsequence.',
      'Implement an anagram check for arbitrary Unicode code points and state whether normalization and case folding are included.',
      'For pattern = “ababaca”, derive the prefix-function table and justify each fallback.',
      'Compare naive matching, KMP and rolling hash on worst-case repeated-prefix input. Include preprocessing and auxiliary space.',
      'Design a longest-substring-without-repeating-characters algorithm and state its window invariant.',
      'Identify the indexing unit used by Java String and explain what offset a returned match index represents.',
      'Create tests for empty pattern, empty text, repeated characters, overlapping matches, supplementary code points and combining marks.'
    ],
    revisionPrompts: [
      'Without notes, distinguish substring, subsequence, prefix and suffix with one example each.',
      'Re-derive the anagram frequency invariant and explain why a negative count can reject early.',
      'Draw the KMP prefix table for “aaaaab” and explain why naive matching repeats work.',
      'State the exact window invariant for the longest unique substring problem.',
      'After two days, implement KMP from memory and test overlapping matches.',
      'After one week, explain Java UTF-16 indexing versus Unicode code-point iteration without using the phrase “one char equals one character”.'
    ]
  },
  {
    id: 'stacks-queues', sourcePages: [6, 7], title: '5. Stack and Queues', promise: 'Use LIFO/FIFO order, monotonic structures and deques to process sequences and frontiers.',
    mentalModel: 'A stack processes the most recently added item first (LIFO); a queue processes the earliest item first (FIFO). A deque supports both ends. A monotonic stack/deque keeps candidates in sorted order so dominated candidates can be discarded.',
    concepts: ['Stack operations push/pop/peek and balanced delimiters.', 'Queue operations enqueue/dequeue and circular-array implementation.', 'Deque and sliding-window extrema.', 'Monotonic increasing/decreasing stack.', 'Next greater/smaller element, stock span and histogram area.', 'BFS queue frontier and level boundaries.', 'Amortized proof: each item enters and leaves a monotonic structure at most once.'],
    recognition: ['Nested structure or undo/history suggests stack.', 'First-in-first-out processing or level traversal suggests queue.', 'Next greater/smaller or contribution boundaries suggest monotonic stack.', 'Window maximum/minimum suggests monotonic deque.'],
    method: ['Identify which end must be processed next.', 'For delimiters, push opening symbols and validate matching closes.', 'For next-greater, scan once; while stack top is dominated by current value, resolve it.', 'For a window, evict indices outside the left boundary and remove dominated values from the back.', 'Store indices rather than values when expiry or distance matters.', 'Decide strict vs non-strict comparison carefully to handle duplicates.'],
    workedExample: ['Next greater element to the right: scan left to right and keep unresolved indices in a decreasing stack of values.', 'For current x, pop while a[stack.top] < x; x is the next greater value for each popped index.', 'Push current index. Remaining indices have no greater value to their right.', 'Each index is pushed once and popped once: O(n) time, O(n) space. For next greater-or-equal, change the comparison deliberately.'],
    complexity: ['Stack/queue push and pop: O(1) amortized for standard implementations.', 'Monotonic stack: O(n) total time because each index is pushed/popped at most once.', 'Sliding-window max with deque: O(n) time, O(k) space.', 'BFS: O(V + E) with adjacency lists.'],
    pitfalls: ['Popping the wrong comparison direction.', 'Using values instead of indices when window expiry is needed.', 'Forgetting empty-stack checks.', 'Mishandling duplicate values with strict/non-strict comparisons.', 'Using an array queue with costly front deletion.'],
    practice: [
      {level:'Warm-up',task:'Validate parentheses and evaluate postfix notation.',goal:'Model push/pop and malformed input.'},
      {level:'Core',task:'Implement queue using two stacks.',goal:'Explain amortized O(1) dequeue.'},
      {level:'Core',task:'Next greater element and stock span.',goal:'Choose monotonic direction and equality rule.'},
      {level:'Challenge',task:'Largest rectangle in histogram.',goal:'Use previous/next smaller boundaries.'},
      {level:'Transfer',task:'Maximum of every window of size k.',goal:'Use index deque with expiry and domination.'}
    ],
    interviewChecks: ['Why is a monotonic stack linear overall?', 'Why store indices in a sliding-window deque?', 'What is the equality rule for duplicate heights?', 'How does a two-stack queue achieve amortized O(1)?'],
    learningOutcomes: [
      'Choose stack, queue or deque based on the required processing order and end operations.',
      'Implement delimiter validation and queue-via-two-stacks with clear empty-state behavior.',
      'Derive monotonic stack direction and strictness from the exact next-greater/smaller requirement.',
      'Use index deques for sliding-window extrema with expiry and duplicate handling.',
      'Prove linear total work by accounting for each index entering and leaving a monotonic structure at most once.',
      'Explain queue frontiers in BFS and why adjacency-list BFS costs O(V+E).'
    ],
    prerequisites: [
      'Understand arrays, indices and dynamic collections.',
      'Be comfortable with loops, nested conditions and amortized versus worst-case cost.',
      'Know graph vertices and edges before using queues for BFS.',
      'Understand how a stack differs from a queue in removal order.'
    ],
    deepDive: [
      'A stack is LIFO: the last inserted item is the first removed. Push and pop occur at one end. A queue is FIFO: enqueue at the back and dequeue at the front. A deque supports insertion and removal at both ends.',
      'Array-backed stacks use a size/top index. A queue should use head and tail indices or a circular buffer; removing index zero from a dynamic array shifts remaining items and can make repeated dequeue quadratic.',
      'A circular queue maps logical positions to physical positions with modulo capacity. Track size explicitly or reserve one slot to distinguish full from empty; document which convention is used.',
      'For balanced delimiters, push opening tokens. A closing token is valid only if the stack is nonempty and its top is the matching opener. At end, the stack must be empty. This catches premature closes and unclosed opens.',
      'A queue implemented with two stacks has input and output stacks. Push only to input. When output is empty, transfer all input items; this reverses their order so the oldest item becomes the output top.',
      'The two-stack queue has O(1) amortized dequeue: each item is pushed to input once, transferred once, and popped from output once. A single operation can cost O(n), so do not describe each dequeue as worst-case O(1).',
      'A monotonic stack stores unresolved indices whose values are increasing or decreasing. When a new value resolves older candidates, pop them and record the answer. The stack invariant depends on whether the task asks for greater, greater-or-equal, smaller or smaller-or-equal.',
      'Strict versus non-strict comparisons determine duplicate behavior. For next strictly greater, pop while top value < current; equal values remain unresolved. For next greater-or-equal, pop while top value <= current.',
      'A sliding-window maximum deque stores indices in decreasing value order. Before inserting i, remove expired indices from the front; remove dominated values from the back; then append i. The front is the maximum index/value candidate.',
      'Each index enters a monotonic stack/deque once and leaves at most once. Although a while loop is nested inside a for loop, aggregate pushes and pops are O(n), not O(n²).',
      'For histogram area, each bar is popped when a smaller bar establishes its right boundary; the new stack top gives its left boundary. Width is right - left - 1. Equal-height policy must be consistent to avoid missing maximal spans.',
      'BFS uses a FIFO queue to process vertices in nondecreasing distance from the source in an unweighted graph. Mark vertices visited when enqueued to prevent duplicate queue entries and repeated work.'
    ],
    correctness: [
      'Delimiter invariant: after processing each prefix, the stack contains exactly the unmatched opening delimiters in their nesting order. A mismatched close proves the prefix invalid; an empty final stack proves all opens matched.',
      'Two-stack queue invariant: output stack, from top downward, contains the oldest queued elements; input stack contains newer elements. Transfer occurs only when output is empty, preserving FIFO order.',
      'Monotonic next-greater invariant: indices in the stack are unresolved and their values are monotonic. When current value pops an index, current is the first qualifying value to its right because every intervening value was too small to pop it earlier.',
      'Sliding-window deque invariant: indices are increasing, all indices are inside the current window, and values are decreasing from front to back. Therefore the front is the maximum of the window.',
      'Amortized bound: every index is pushed once and popped no more than once; total stack/deque mutations are bounded by 2n, proving O(n) aggregate time.',
      'BFS invariant: when a vertex is dequeued, its recorded distance is the shortest path length from the source in an unweighted graph because vertices are processed by nondecreasing frontier distance.'
    ],
    implementationSteps: [
      'Write down the required removal order (LIFO, FIFO or either end) before choosing the data structure.',
      'Define empty and full behavior for bounded array implementations; avoid ambiguous head/tail conventions.',
      'For delimiter validation, map each closer to its exact opener and reject unknown tokens if the input grammar requires it.',
      'For a two-stack queue, transfer input to output only when output is empty.',
      'For monotonic structures, state the invariant and decide whether equal values should remain or be removed.',
      'Store indices when answers depend on positions, window expiry or widths; store values only when position is irrelevant.',
      'For sliding windows, expire from the front before reading the answer and remove dominated candidates from the back before appending.',
      'For BFS, mark visited at enqueue time and test disconnected graphs, self-loops and duplicate edges.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Queue implemented with two stacks', code: `static final class TwoStackQueue {
    private final Deque<Integer> incoming = new ArrayDeque<>();
    private final Deque<Integer> outgoing = new ArrayDeque<>();

    void offer(int value) {
        incoming.push(value);
    }

    int poll() {
        moveIfNeeded();
        if (outgoing.isEmpty()) throw new NoSuchElementException("queue is empty");
        return outgoing.pop();
    }

    private void moveIfNeeded() {
        if (outgoing.isEmpty()) {
            while (!incoming.isEmpty()) outgoing.push(incoming.pop());
        }
    }

    boolean isEmpty() {
        return incoming.isEmpty() && outgoing.isEmpty();
    }
}`, explanation: 'Offer is O(1). Poll is O(1) amortized and O(n) worst-case for the transfer operation. Each element crosses from incoming to outgoing at most once.' },
      { language: 'Java 21', title: 'Sliding-window maximum with an index deque', code: `static int[] slidingMaximum(int[] values, int k) {
    if (k <= 0 || k > values.length) throw new IllegalArgumentException("invalid window");
    int[] answer = new int[values.length - k + 1];
    Deque<Integer> candidates = new ArrayDeque<>();

    for (int right = 0; right < values.length; right++) {
        int left = right - k + 1;
        while (!candidates.isEmpty() && candidates.peekFirst() < left) {
            candidates.removeFirst();
        }
        while (!candidates.isEmpty()
                && values[candidates.peekLast()] <= values[right]) {
            candidates.removeLast();
        }
        candidates.addLast(right);
        if (left >= 0) answer[left] = values[candidates.peekFirst()];
    }
    return answer;
}`, explanation: 'Indices increase from front to back and their values decrease. Expiry removes indices left of the current window; removing <= values from the back keeps the newest equal maximum. O(n) time and O(k) auxiliary space.' }
    ],
    traceExercises: [
      'Queue trace: enqueue 1, 2, 3; dequeue twice; enqueue 4; dequeue twice. Show both internal stacks after every operation.',
      'Next-greater trace: [2, 1, 2, 4, 3]. Show stack indices and which answer is assigned on every pop.',
      'Window maximum trace: [1, 3, -1, -3, 5, 3, 6, 7], k=3. Record expired indices and back removals for each right endpoint.',
      'Duplicate trace: [5, 5, 4], k=2. Explain why <= removes the older equal candidate without changing the maximum.'
    ],
    realWorldApplications: [
      'Call stacks and undo histories naturally follow LIFO order.',
      'Task queues and message brokers process work in FIFO order when fairness/order matters.',
      'BFS queues support shortest-hop routing and level-order exploration.',
      'Monotonic deques support rolling maximum/minimum metrics in telemetry and time-series processing.',
      'Expression parsers use stacks to validate nesting and evaluate postfix expressions.'
    ],
    assessment: [
      'Implement balanced-parentheses validation and explain the stack contents after every input prefix.',
      'Prove the two-stack queue preserves FIFO order and state worst-case versus amortized operation costs.',
      'For next strictly greater element, explain why the comparison is < rather than <=.',
      'Implement sliding-window maximum using indices and prove the front is always the maximum.',
      'Derive the O(n) aggregate bound for a monotonic stack despite a nested while loop.',
      'Explain why marking BFS vertices visited at enqueue time prevents duplicate processing.',
      'Test empty input, invalid k, all-equal values, increasing/decreasing arrays and duplicate candidates.'
    ],
    revisionPrompts: [
      'From memory, distinguish stack, queue and deque with one operation sequence each.',
      'Draw both stacks after a sequence of queue operations and explain the transfer rule.',
      'Re-derive the monotonic-deque invariant for a maximum window.',
      'After two days, solve next-greater and histogram-area problems, stating the equality policy.',
      'After one week, explain the aggregate 2n push/pop argument without saying “the loop is obviously linear”.',
      'Implement BFS and sliding-window maximum without notes and test duplicates and boundary windows.'
    ]
  },
  {
    id: 'binary-search', sourcePages: [14], title: '6. Binary Search Algorithm', promise: 'Search sorted data and monotonic answer spaces with explicit invariants.',
    mentalModel: 'Binary search works when the search space is ordered and each comparison lets you discard a half that cannot contain the answer. It is not merely “use mid”; the invariant and boundary convention define correctness.',
    concepts: ['Exact search in sorted arrays.', 'Lower bound: first index with a[i] ≥ target; upper bound: first index with a[i] > target.', 'First/last occurrence and insertion position.', 'Rotated sorted arrays and identifying the sorted half.', 'Binary search on answer using a monotonic feasible predicate.', 'Integer overflow-safe midpoint and termination.', 'Unknown-size/exponential search and floating-point tolerance.'],
    recognition: ['Input is sorted or a predicate changes monotonically from false to true.', 'Need first/last position, minimum feasible capacity or maximum feasible rate.', 'A brute-force answer scan can be replaced by a feasibility test.'],
    method: ['Define the answer interval and whether endpoints are inclusive.', 'Write the invariant (e.g. answer lies in [lo, hi)).', 'Use mid = lo + (hi - lo) / 2 to avoid overflow in fixed-width languages.', 'For lower bound, if a[mid] ≥ target, keep mid by setting hi=mid; otherwise lo=mid+1.', 'For answer search, prove the predicate is monotonic before binary searching.', 'Check termination and test 0/1 length, absent target and all-equal values.'],
    workedExample: ['Lower bound on [1,2,2,2,5] for target 2.', 'Maintain half-open interval [lo, hi) initially [0,n).', 'If a[mid] ≥ 2, set hi=mid; otherwise set lo=mid+1.', 'When lo==hi, that index is the first position whose value is at least 2 (index 1).', 'Time O(log n), extra space O(1).'],
    complexity: ['Sorted-array search: O(log n) time, O(1) iterative extra space.', 'Answer-space search: O(log R × cost(check)) where R is the numeric search range.', 'Recursive binary search uses O(log n) stack; iterative uses O(1).'],
    pitfalls: ['Infinite loops from inconsistent inclusive/exclusive boundaries.', 'Searching a non-monotonic predicate.', 'Returning mid without validating the desired boundary.', 'Overflow in (lo+hi)/2.', 'Incorrect rotated-array logic when duplicates make both halves appear equal.'],
    practice: [
      {level:'Warm-up',task:'Implement exact search and insertion position.',goal:'Use one consistent interval convention.'},
      {level:'Core',task:'Find first and last occurrence in duplicates.',goal:'Implement lower and upper bound.'},
      {level:'Core',task:'Search in a rotated sorted array.',goal:'Identify which half is sorted.'},
      {level:'Challenge',task:'Minimum ship capacity to deliver within D days.',goal:'Define and prove a monotonic feasibility check.'},
      {level:'Transfer',task:'Find minimum rate or maximum minimum distance.',goal:'Choose answer bounds and binary-search direction.'}
    ],
    interviewChecks: ['What exactly does lower_bound return?', 'Why does the answer-space predicate need monotonicity?', 'How do you prevent an infinite loop?', 'What changes when duplicates exist in a rotated array?'],
    learningOutcomes: ["Define exact-search, lower-bound and upper-bound contracts using half-open intervals.","Maintain a binary-search invariant and prove that each iteration preserves the answer region.","Implement first/last occurrence and insertion positions without off-by-one errors.","Search a monotonic answer space only after proving predicate monotonicity.","Analyse O(log n) iterations and include feasibility-check cost for answer-space search."],
    prerequisites: ["Sorted arrays and array indexing.","Boolean predicates and interval boundaries.","Integer overflow and logarithmic complexity."],
    deepDive: ["Lower bound returns the first index i with a[i] >= target; upper bound returns the first index with a[i] > target. Both may return n, so callers must check bounds before indexing.","For [lo,hi), the invariant is that the answer lies in the remaining interval and hi is an exclusive boundary. If a[mid] qualifies, hi=mid retains mid; otherwise lo=mid+1 discards it.","Use lo+(hi-lo)/2 to avoid overflow in lo+hi. The loop terminates because each branch strictly shrinks the interval.","Rotated arrays require identifying a sorted half; duplicates can make the decision ambiguous and may force lo++ with O(n) worst-case behavior.","Binary search on answer requires a monotone predicate. For minimum feasible x, false values precede true values; search for the first true boundary.","For floating-point answers, define absolute/relative tolerance or a fixed iteration count; do not compare floating-point values for exact equality."],
    correctness: ["Interval invariant: before each iteration, the desired boundary remains in [lo,hi].","When predicate(mid) is true for first-true search, the first true cannot be to the right of mid, so hi=mid is safe; otherwise lo=mid+1.","Termination follows because the nonnegative interval length strictly decreases; at lo==hi the boundary is uniquely determined."],
    implementationSteps: ["Write the contract in words: exact index, first >= target, last <= target or first feasible answer.","Choose [lo,hi) and initialize hi=n.","Compute midpoint safely and update only according to the invariant.","Check lo<n before reading a[lo].","For answer search, implement and independently test the feasibility predicate first.","Test empty, singleton, all equal, absent target, duplicates at both ends and integer extremes."],
    codeExamples: [{"language":"Java 21","title":"Lower bound in a sorted array","code":"static int lowerBound(int[] values, int target) {\\n    int lo = 0, hi = values.length;\\n    while (lo < hi) {\\n        int mid = lo + (hi - lo) / 2;\\n        if (values[mid] >= target) hi = mid;\\n        else lo = mid + 1;\\n    }\\n    return lo;\\n}","explanation":"Returns the first index whose value is at least target, or n if none exists. O(log n) time and O(1) auxiliary space."}],
    traceExercises: ["Trace lowerBound([1,2,2,2,5],2) with lo,hi,mid each iteration.","Trace target 6 in [1,3,5] and explain why returning n is valid.","For a first-true predicate over [0,100], show each interval update."],
    realWorldApplications: ["Database index range scans and insertion positions.","Capacity/rate planning using a monotone feasibility check.","Version and timestamp boundary lookup.","Threshold selection in scheduling and resource allocation."],
    assessment: ["Implement lower and upper bound and state their exact postconditions.","Prove why hi=mid is required when mid qualifies in first-true search.","Explain when binary search on a rotated array may degrade to O(n).","Derive total complexity when each feasibility check costs O(n).","Test empty arrays, duplicates and absent boundaries."],
    revisionPrompts: ["Recreate the [lo,hi) lower-bound loop from memory.","Explain the invariant in one sentence before describing code.","After two days, implement first/last occurrence and test all-equal arrays.","After one week, prove a first-true answer search and include predicate cost."]
  },
  {
    id: 'two-pointers-window', sourcePages: [3, 4, 12], title: '7. Two Pointers & Sliding Window', promise: 'Exploit order and contiguous ranges without repeatedly rescanning data.',
    mentalModel: 'Two pointers coordinate positions. Sliding window is a special two-pointer technique for a contiguous interval whose state can be updated as its boundaries move. Pointer movement must be justified by a property, not guessed.',
    concepts: ['Opposite-direction pointers on sorted arrays and palindromes.', 'Same-direction read/write pointers for compaction and partition.', 'Fast/slow pointers for cycles and middle positions.', 'Fixed-size sliding windows.', 'Variable-size windows with a validity invariant.', 'Frequency maps for distinct-count and anagram windows.', 'At-most K transformation to exactly K = atMost(K) − atMost(K−1).', 'Prefix sums or other methods when negative values invalidate greedy shrinking.'],
    recognition: ['Sorted pair/triplet sum, palindrome, in-place removal or partition.', 'Longest/shortest contiguous substring/subarray with a maintainable constraint.', 'A range expands on the right and can be repaired by moving the left boundary.'],
    method: ['For opposite pointers, sort if allowed and explain how order justifies movement.', 'For read/write, keep the prefix [0,write) as the valid output.', 'For a fixed window, add incoming and remove outgoing element.', 'For variable windows, state what makes a window valid and prove moving left can restore validity.', 'For at-most K, update counts and shrink while distinct/count constraint is violated.', 'If negative values break monotonicity, switch to prefix sums, a deque or another valid method.'],
    workedExample: ['Longest substring with at most K distinct characters.', 'Expand right and increment the incoming character count.', 'While distinct character count exceeds K, decrement the left character and remove zero-count keys.', 'Update the best length after the window is valid.', 'Each index enters and exits at most once: O(n) expected time with a hash map, O(min(n, alphabet)) state.'],
    complexity: ['Classic two-pointer scan: O(n) after any required sort; sorting adds O(n log n).', 'Sliding window: O(n) when each boundary moves only forward and updates are O(1) expected.', 'Frequency map space: O(alphabet) or O(n), depending on the character/value domain.'],
    pitfalls: ['Sliding-window shrink logic is not universally valid with negative numbers.', 'Sorting can destroy original index order when indices are part of the answer.', 'Forgetting duplicate skipping in 3Sum.', 'Updating the answer while the window is invalid.', 'Confusing fixed-size and variable-size window invariants.'],
    practice: [
      {level:'Warm-up',task:'Pair sum in a sorted array and palindrome validation.',goal:'Explain why each pointer movement is safe.'},
      {level:'Core',task:'Remove duplicates in-place and solve 3Sum.',goal:'Use write pointer and duplicate skipping.'},
      {level:'Core',task:'Maximum sum of a fixed-size subarray.',goal:'Update by adding one and removing one.'},
      {level:'Challenge',task:'Minimum window substring.',goal:'Track required vs formed counts and shrink only when valid.'},
      {level:'Transfer',task:'Subarray sum equals K with negative numbers.',goal:'Recognise why a simple sliding window fails and use prefix sums.'}
    ],
    interviewChecks: ['What property makes pointer movement safe?', 'Why does a positive-number sum window shrink correctly?', 'How do you count exactly K distinct values?', 'When is sorting incompatible with the problem?'],
    learningOutcomes: [
      'Choose opposite-direction or same-direction pointers based on ordering, pairing, palindrome or compaction requirements.',
      'Implement fixed and variable sliding windows with explicit validity invariants.',
      'Use frequency maps for distinct-count windows and derive exactly-K counts from atMost(K)-atMost(K-1).',
      'Prove linear total pointer movement and account for hash-map update costs.',
      'Recognize when negative values invalidate greedy window shrinking and select prefix sums or a deque instead.',
      'Include sorting and index-preservation costs when preparing two-pointer input.'
    ],
    prerequisites: [
      'Understand arrays, strings, indexing and half-open intervals.',
      'Know hash maps and frequency counting.',
      'Understand sorted order, prefix sums and basic amortized analysis.',
      'Distinguish contiguous subarrays/substrings from subsequences.'
    ],
    deepDive: [
      'Opposite-direction pointers are safe when sorted order proves one endpoint cannot participate in a valid answer. For pair sum, if the smallest-plus-largest is too small, the smallest value cannot pair with any remaining right endpoint.',
      'Same-direction read/write pointers separate processed output from unprocessed input. The prefix [0,write) is the retained result; every read position is examined once.',
      'A fixed window of length k updates its state by adding the entering value and removing the leaving value. Recomputing all k values at every step costs O(nk) instead of O(n).',
      'A variable window is commonly represented as [left,right). The algorithm expands right, updates state, repairs validity by advancing left, and records an answer only when the window satisfies the required condition.',
      'For at most K distinct values, maintain a frequency map and a distinct counter. Shrink while distinct>K; remove a key when its count reaches zero.',
      'Exactly K distinct subarrays can be counted as atMost(K)-atMost(K-1). The transformation works because every subarray with fewer than K distinct values appears in both counts and cancels.',
      'For longest substring without repeats, lastSeen stores the latest index. Move left to max(left,lastSeen+1) so the left boundary never moves backward.',
      'For minimum length with positive numbers and sum>=target, expand until valid and then shrink while valid. Positivity ensures removing a value cannot increase the sum; negative values destroy this monotonicity.',
      'When values may be negative, use prefix sums and an appropriate data structure such as a monotonic deque for shortest-subarray constraints. Do not apply a positive-only window proof.',
      'Sorting can enable two-pointer scans but costs O(n log n) and may destroy original order. Preserve original indices in records when the result contract needs them.',
      'Each pointer moves only forward and at most n positions. Nested while loops remain O(n) when every iteration advances a pointer that never retreats.',
      'Duplicate skipping in 3Sum prevents duplicate output tuples; it is separate from the proof that the two-pointer movement is safe.'
    ],
    correctness: [
      'Sorted pair invariant: every unexamined candidate pair lies within [left,right]. A sum below target proves the current left value cannot pair with any remaining right-side value, so discarding it is safe.',
      'Fixed-window invariant: after each update, the running aggregate equals exactly the current k-element window.',
      'At-most-K invariant: after shrinking, the current window contains no more than K distinct keys; each right endpoint contributes the number of valid suffix windows ending there.',
      'Exactly-K identity: sets of subarrays counted by atMost(K-1) are a subset of those counted by atMost(K); their difference contains precisely those with exactly K distinct values.',
      'Longest-unique invariant: after each right step, the current window contains no repeated symbol because left is moved beyond the previous occurrence and never moves backward.',
      'Linear-time bound: each endpoint advances at most n times; every frequency-map insertion/removal is associated with a boundary movement.'
    ],
    implementationSteps: [
      'Write assumptions: sorted or unsorted, positive or signed values, contiguous or non-contiguous, and whether input mutation is allowed.',
      'Choose [left,right] or [left,right) and keep the corresponding size formula consistent.',
      'For opposite pointers, prove why the endpoint being moved can be discarded.',
      'For fixed windows, validate k and update by one incoming and one outgoing element.',
      'For variable windows, define validity and state whether the answer is recorded before or after shrinking.',
      'For distinct-count windows, update counts and distinct count only on zero-to-one or one-to-zero transitions.',
      'For exactly K, implement both atMost passes and guard K<=0.',
      'If negatives are allowed, challenge the shrinking proof and use prefix-sum techniques when needed.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Maximum sum of a fixed-size window', code: `static long maximumWindowSum(int[] values, int k) {
    if (k <= 0 || k > values.length) throw new IllegalArgumentException("invalid k");
    long sum = 0L;
    for (int i = 0; i < k; i++) sum += values[i];
    long best = sum;
    for (int right = k; right < values.length; right++) {
        sum += values[right] - values[right - k];
        best = Math.max(best, sum);
    }
    return best;
}`, explanation: 'The running sum always represents exactly k values. Each value enters and leaves once: O(n) time and O(1) extra space.' },
      { language: 'Java 21', title: 'Count subarrays with exactly K distinct values', code: `static long exactlyKDistinct(int[] values, int k) {
    if (k <= 0) return 0L;
    return atMostKDistinct(values, k) - atMostKDistinct(values, k - 1);
}

static long atMostKDistinct(int[] values, int k) {
    Map<Integer, Integer> counts = new HashMap<>();
    int left = 0, distinct = 0;
    long total = 0L;
    for (int right = 0; right < values.length; right++) {
        int value = values[right];
        if (counts.getOrDefault(value, 0) == 0) distinct++;
        counts.merge(value, 1, Integer::sum);
        while (distinct > k) {
            int outgoing = values[left++];
            int remaining = counts.get(outgoing) - 1;
            if (remaining == 0) {
                counts.remove(outgoing);
                distinct--;
            } else counts.put(outgoing, remaining);
        }
        total += right - left + 1L;
    }
    return total;
}`, explanation: 'For each right endpoint, there are right-left+1 valid suffix windows with at most K distinct values. Expected O(n) time and O(u) map space.' }
    ],
    traceExercises: [
      'Fixed-window trace: [2,1,5,1,3,2], k=3. Record incoming, outgoing, sum and best.',
      'At-most-K trace: [1,2,1,2,3], K=2. Show counts, distinct and left after every right expansion.',
      'Exactly-K trace: use the same array with K=2. Calculate atMost(2), atMost(1) and their difference.',
      'Counterexample: [4,-5,3], target=3. Explain why removing a left value can increase the sum.'
    ],
    realWorldApplications: [
      'Rolling telemetry and financial metrics over fixed time/count windows.',
      'Text processing for unique substrings, bounded vocabularies and minimum covering windows.',
      'Streaming event analytics that count distinct users or event types in a moving range.',
      'In-place filtering and compaction while preserving relative order.',
      'Sorted dataset joins and pair searches without nested full scans.'
    ],
    assessment: [
      'Prove a sorted pair-sum pointer movement and include sorting cost when applicable.',
      'Implement a fixed-size window and state its exact aggregate invariant.',
      'Derive exactly-K distinct as atMost(K)-atMost(K-1) and explain why the sets cancel.',
      'Implement atMost-K distinct and prove the right-left+1 contribution.',
      'Explain why positive values permit a sum-based shrink rule but negative values may invalidate it.',
      'Give an amortized proof for nested expand/shrink loops.',
      'Choose between sliding window and prefix-sum/deque methods for signed input.'
    ],
    revisionPrompts: [
      'Write the invariant for opposite pointers, read/write compaction and fixed windows.',
      'Reconstruct the atMost(K) counting formula without notes.',
      'Explain the positivity assumption behind minimum-size sum windows.',
      'After two days, solve longest unique substring and exactly-K distinct subarrays.',
      'After one week, create a negative-number counterexample to an invalid sliding-window approach.',
      'Explain why nested pointer loops can still be linear using total pointer movement.'
    ]
  },
  {
    id: 'binary-tree', sourcePages: [17], title: '8. Binary Tree', promise: 'Master recursive structure, iterative traversals, level order, paths and tree construction.',
    mentalModel: 'A binary tree is a node with up to two child trees. Many tree algorithms are recursive because a subtree is itself a tree. Decide whether information flows top-down (carry state) or bottom-up (return an aggregate).',
    concepts: ['Root, leaf, depth, height, subtree and balanced tree.', 'Preorder, inorder, postorder and level-order BFS.', 'Recursive DFS and iterative stack traversals.', 'Height, diameter, balance and maximum path sum.', 'Root-to-leaf path, path sum and path construction.', 'Lowest common ancestor.', 'Build tree from traversal pairs with index maps.', 'Serialize/deserialize and null markers.', 'Morris traversal concept and O(1) auxiliary traversal.'],
    recognition: ['The input is a root node and asks about paths, depth, subtree or ancestors.', 'A result depends on child subtree results.', 'Level-by-level output or minimum edge distance is required.'],
    method: ['Define exactly what a recursive call returns.', 'Write the null/base case first.', 'For bottom-up problems, combine left and right results at the current node.', 'For top-down problems, pass accumulated state to children.', 'For BFS, process the queue size captured at the start of each level.', 'For LCA, state assumptions about node presence and unique values.'],
    workedExample: ['Height in nodes: height(null)=0.', 'For a node, left=height(node.left), right=height(node.right).', 'Return 1 + max(left,right).', 'Each node is visited once: O(n) time, O(h) recursion stack where h is tree height.', 'A skewed tree has h=n; a balanced tree has h=O(log n).'],
    complexity: ['Traversal and most one-pass aggregates: O(n).', 'Recursive DFS stack: O(h).', 'BFS queue: O(w), where w is maximum tree width.', 'Build from traversals: O(n) expected with a value-to-index map; avoid repeated linear scans.'],
    pitfalls: ['Confusing node height with edge height.', 'Assuming the tree is balanced.', 'Using a global variable when a return value is clearer.', 'Capturing a changing queue size inside level-order traversal.', 'Assuming unique node values when reconstruction requires them.'],
    practice: [
      {level:'Warm-up',task:'Implement preorder, inorder, postorder and level order.',goal:'Compare recursion and explicit stacks.'},
      {level:'Core',task:'Maximum depth, invert tree and balanced-tree check.',goal:'Return subtree information bottom-up.'},
      {level:'Core',task:'Path sum and diameter.',goal:'Distinguish global answer from recursive return.'},
      {level:'Challenge',task:'Lowest common ancestor and build tree from traversals.',goal:'State node-presence and uniqueness assumptions.'},
      {level:'Transfer',task:'Serialize and deserialize a tree.',goal:'Design an unambiguous format including null children.'}
    ],
    interviewChecks: ['What is the recursive contract?', 'Why can diameter require a global answer?', 'What is the difference between depth and height?', 'When is BFS preferable to DFS?'],
    learningOutcomes: ["Explain tree terminology, height/depth and recursive subtree structure.","Implement recursive and iterative DFS plus level-order BFS.","Choose top-down state passing or bottom-up subtree aggregation.","Derive time and stack/queue space for skewed and balanced trees.","Handle path, diameter, balance and ancestor problems with explicit contracts."],
    prerequisites: ["Recursion, stacks, queues and references.","Basic graph traversal and asymptotic analysis.","Null/base-case reasoning."],
    deepDive: ["A subtree is itself a binary tree, which makes recursive decomposition natural. A recursive contract should say exactly what the call returns for the subtree rooted at its node.","Depth counts edges from root to node; height may count edges or nodes. State the convention: this lesson uses height(null)=0 and leaf height=1.","Preorder visits node-left-right, inorder left-node-right and postorder left-right-node. Level order uses a queue and captures the current queue size to delimit one level.","Top-down algorithms pass accumulated information such as depth or path sum. Bottom-up algorithms return information such as height, balance status or best downward path.","Diameter is the maximum number of edges on a path between two nodes. At each node, left height + right height is a candidate; the global maximum can be updated while returning height.","A skewed tree has height n, so recursive DFS may use O(n) stack and risk stack overflow. Balanced trees have O(log n) height.","Reconstructing a tree from traversals needs unique values for the standard index-map method; duplicates require extra disambiguating information."],
    correctness: ["Traversal correctness follows by visiting each node exactly once and recursively/iteratively scheduling its defined children.","Height invariant: the returned value is the height of the current subtree; null returns zero and a node returns one plus the larger child height.","Diameter invariant: every path's highest node is its LCA; the path through that node has length leftHeight+rightHeight, so considering every node covers the optimal path."],
    implementationSteps: ["Define null behavior and whether height counts nodes or edges.","Choose recursive DFS, explicit stack or queue based on traversal order and depth risk.","For bottom-up tasks, specify returned subtree information before writing recursion.","For level order, capture queue size before processing a level.","For diameter/balance, combine child results in one traversal where possible.","Test empty, singleton, skewed, complete, duplicate-valued and asymmetric trees."],
    codeExamples: [{"language":"Java 21","title":"Height and diameter in one postorder traversal","code":"static final class Node { int value; Node left, right; Node(int v) { value = v; } }\\nstatic int diameter = 0;\\nstatic int height(Node node) {\\n    if (node == null) return 0;\\n    int left = height(node.left), right = height(node.right);\\n    diameter = Math.max(diameter, left + right);\\n    return 1 + Math.max(left, right);\\n}","explanation":"Height is measured in nodes; diameter is measured in edges. Reset the accumulator before each independent tree. O(n) time and O(h) recursion stack."}],
    traceExercises: ["Compute heights and diameter candidates for a root with left chain length 2 and right chain length 3.","Trace level order on an asymmetric tree and record the queue at each level.","Compare recursion stack depth for a balanced tree and a chain of n nodes."],
    realWorldApplications: ["Hierarchical file systems and organizational structures.","Expression trees and syntax trees in compilers.","Decision trees and nested UI component structures.","Routing and indexing structures."],
    assessment: ["Explain the difference between depth and height under a stated convention.","Implement level-order traversal without mixing adjacent levels.","Prove one-pass diameter calculation is O(n).","State worst-case recursion space for a skewed tree.","Explain why traversal reconstruction requires unique values for the usual method."],
    revisionPrompts: ["Draw preorder, inorder, postorder and level-order for one tree.","Re-derive the height recurrence and diameter candidate.","After two days, implement balance and diameter in one postorder traversal.","After one week, explain top-down versus bottom-up tree recursion."]
  },
  {
    id: 'bst', sourcePages: [18], title: '9. Binary Search Tree', promise: 'Use ordered tree invariants for search, insertion, deletion and order statistics.',
    mentalModel: 'A BST maintains a global ordering: every key in a node’s left subtree is smaller and every key in its right subtree is larger (or follows a clearly defined duplicate policy). Inorder traversal therefore produces sorted order.',
    concepts: ['BST invariant and duplicate-key policy.', 'Search and insertion.', 'Deletion: leaf, one child, two children using successor/predecessor.', 'Validate BST using lower/upper bounds.', 'Inorder traversal, kth smallest/largest.', 'Predecessor and successor.', 'Balanced BSTs: AVL and Red-Black tree concepts.', 'BST vs heap vs hash map use cases.'],
    recognition: ['Need ordered membership, predecessor/successor or kth smallest.', 'Input is a BST and asks for range or sorted traversal.', 'Need dynamic insert/delete while retaining order.'],
    method: ['Write the global range allowed at each node, not only a parent comparison.', 'Search by comparing target and following one child.', 'For validation, pass exclusive/inclusive bounds according to duplicate policy.', 'For two-child deletion, replace with inorder successor (minimum in right subtree) or predecessor.', 'For kth smallest, use inorder with a counter or augment subtree sizes.', 'Discuss worst-case skew and balancing.'],
    workedExample: ['Validate BST with bounds: start at (−∞,+∞).', 'At node x, require low < x < high for a strict BST.', 'Recurse left with (low,x) and right with (x,high).', 'This catches a deep descendant that violates an ancestor even if it is correctly ordered relative to its parent.', 'Time O(n), recursion O(h).'],
    complexity: ['Search/insert/delete: O(h), where h is tree height.', 'Balanced BST: O(log n); skewed BST: O(n).', 'Inorder traversal: O(n).', 'Kth smallest via inorder: O(h+k) with early stop; augmented subtree sizes can give O(h).'],
    pitfalls: ['Checking only immediate children during validation.', 'Ignoring duplicate policy.', 'Losing a subtree during deletion.', 'Assuming an ordinary BST stays balanced.', 'Confusing BST ordering with heap ordering.'],
    practice: [
      {level:'Warm-up',task:'Search and insert a key.',goal:'Maintain the BST ordering invariant.'},
      {level:'Core',task:'Validate BST and find kth smallest.',goal:'Use global bounds and inorder sequence.'},
      {level:'Core',task:'Find predecessor and successor.',goal:'Use subtree extrema and ancestor path.'},
      {level:'Challenge',task:'Delete a node with zero, one and two children.',goal:'Preserve both subtrees and ordering.'},
      {level:'Transfer',task:'Support frequent kth-smallest queries.',goal:'Augment each node with subtree size.'}
    ],
    interviewChecks: ['Why are local parent-child checks insufficient?', 'What is the inorder successor?', 'What is the worst-case height?', 'When would a heap be a better fit?'],
    learningOutcomes: ["Maintain the global BST ordering invariant through search, insertion and deletion.","Validate using inherited lower/upper bounds rather than parent-only checks.","Implement two-child deletion using successor or predecessor.","Use inorder traversal for sorted order and order statistics.","Compare balanced and skewed height and distinguish BST, heap and hash map."],
    prerequisites: ["Binary tree traversal and recursion.","Comparator/equality semantics.","Big-O and height analysis."],
    deepDive: ["The BST invariant is global: every key in a node's left subtree is smaller and every key in its right subtree is larger under the chosen strict ordering.","Validation must carry bounds down the recursion. A node may be correctly ordered relative to its parent but violate an ancestor's constraint.","Inorder traversal of a strict BST is strictly increasing. This gives a validation alternative but must handle duplicate policy consistently.","Deletion of a leaf removes it directly; deletion with one child returns that child; deletion with two children replaces the node with the minimum key in its right subtree (successor) or maximum in left.","Search, insertion and deletion take O(h). An ordinary BST can become a chain with h=n; balancing maintains O(log n) height.","A heap guarantees only parent-child priority order, not sorted inorder semantics. A hash map offers membership by key but no ordered predecessor/successor queries."],
    correctness: ["Search correctness: the BST invariant proves the target, if present, can only lie in the selected child subtree.","Validation correctness: inherited bounds encode every ancestor constraint, so a node is accepted only if it satisfies the entire path's ordering requirements.","Successor deletion correctness: the minimum key in the right subtree is greater than all left-subtree keys and no greater than any remaining right-subtree key, preserving order after replacement."],
    implementationSteps: ["Choose strict or duplicate-allowing ordering semantics.","Write recursive search with the invariant that all candidate keys lie in the current subtree.","Validate by passing exclusive or inclusive lower/upper bounds.","For two-child deletion, find successor, copy/replace its key and remove successor from right subtree.","State O(h) and discuss balanced versus skewed cases.","Test root deletion, leaf, one child, two children, duplicates and extreme keys."],
    codeExamples: [{"language":"Java 21","title":"Validate a strict BST with global bounds","code":"static boolean isValid(Node node, long low, long high) {\\n    if (node == null) return true;\\n    if (node.value <= low || node.value >= high) return false;\\n    return isValid(node.left, low, node.value)\\n        && isValid(node.right, node.value, high);\\n}","explanation":"Use long bounds so Integer.MIN_VALUE and MAX_VALUE remain valid node values. O(n) time and O(h) recursion space."}],
    traceExercises: ["Trace validation for root 10, left 5 with right child 12; identify the ancestor bound violation.","Delete a two-child node and show successor removal and resulting inorder traversal.","Insert sorted values 1..5 and compare tree height with inserting median-first."],
    realWorldApplications: ["Ordered in-memory indexes and symbol tables.","Range queries and predecessor/successor lookup.","Balanced search trees in database and runtime libraries.","Maintaining sorted dynamic sets."],
    assessment: ["Explain why parent-only validation is insufficient.","Implement validation with strict global bounds.","Describe all three deletion cases and prove successor replacement preserves order.","Compare O(h) behavior for balanced and skewed trees.","Explain why a heap is not a replacement for a BST."],
    revisionPrompts: ["Reconstruct global-bound validation from memory.","Draw deletion for leaf, one-child and two-child nodes.","After two days, implement kth smallest using inorder traversal.","After one week, compare BST, heap and hash map by operations and guarantees."]
  },
  {
    id: 'heap', sourcePages: [8], title: '10. Heap', promise: 'Use priority queues for repeated extrema, Top K, scheduling and K-way merge.',
    mentalModel: 'A binary heap is a complete binary tree stored compactly in an array. The heap property guarantees the root is the minimum (min-heap) or maximum (max-heap), but the rest of the array is not fully sorted.',
    concepts: ['Complete binary tree and array index formulas.', 'Min-heap vs max-heap.', 'Sift-up and sift-down.', 'Insert, peek and extract.', 'Bottom-up heapify is O(n).', 'Top K largest/smallest and bounded heaps.', 'K-way merge with one candidate per sorted source.', 'Two heaps for running median.', 'Lazy deletion and stale heap entries.'],
    recognition: ['Repeatedly need the next smallest/largest item.', 'Need Top K without sorting everything.', 'Merge K sorted lists or streams.', 'Need a dynamic median or priority scheduling.'],
    method: ['Choose min or max root based on what must be removed.', 'For Top K largest, keep a min-heap of size K; root is the weakest retained candidate.', 'For K-way merge, store (value, source, index) and push the next item from the same source after pop.', 'Use lazy deletion when arbitrary removal is not supported.', 'Distinguish heap construction from repeated insertion.'],
    workedExample: ['Find K largest values: maintain a min-heap of at most K values.', 'Insert the first K values. For each later x, if x > heap.peek(), remove root and insert x.', 'At all times the heap contains the K largest values seen so far.', 'Time O(n log K), extra space O(K); sorting all values costs O(n log n).'],
    complexity: ['Peek: O(1).', 'Insert/extract: O(log n).', 'Bottom-up heapify: O(n).', 'Top K bounded heap: O(n log K), O(K) space.', 'K-way merge: O(N log K), O(K) heap space for K sorted sources and N total elements.'],
    pitfalls: ['Using the wrong heap orientation for Top K.', 'Assuming heap array is sorted.', 'Building heap with n insertions and claiming O(n) instead of O(n log n).', 'Forgetting deterministic tie-breakers for equal priorities.', 'Pushing all K lists at once instead of one current candidate per list.'],
    practice: [
      {level:'Warm-up',task:'Implement min-heap insert and extract.',goal:'Trace parent/child indices.'},
      {level:'Core',task:'Kth largest and Top K frequent elements.',goal:'Bound heap size and choose orientation.'},
      {level:'Core',task:'Merge K sorted lists.',goal:'Store source identity and advance only that source.'},
      {level:'Challenge',task:'Find median from a data stream.',goal:'Balance max-heap lower half and min-heap upper half.'},
      {level:'Transfer',task:'Design a scheduler with priorities and cancellations.',goal:'Use tie-breakers and lazy invalidation.'}
    ],
    interviewChecks: ['Why is heapify O(n)?', 'Why does Top K largest use a min-heap?', 'What information belongs in a K-way merge heap entry?', 'Why is a heap not a sorted array?'],
    learningOutcomes: [
      'Explain the complete-tree shape property and min/max heap-order property separately.',
      'Derive parent/child array indices and trace sift-up and sift-down operations.',
      'Distinguish O(n) bottom-up heap construction from n repeated O(log n) insertions.',
      'Choose heap orientation and capacity for Top K largest/smallest problems.',
      'Design K-way merge and running-median solutions using explicit heap entry metadata.',
      'Handle ties, stale entries and unsupported arbitrary deletion safely.'
    ],
    prerequisites: [
      'Understand binary trees, array indexing and complete binary trees.',
      'Know logarithms and why the height of a complete binary tree is O(log n).',
      'Be comfortable with sorting and asymptotic comparison.',
      'Understand comparator ordering and stable tie-breaker requirements.'
    ],
    deepDive: [
      'A binary heap is a complete binary tree: every level except possibly the last is full, and the last level fills from left to right. This shape allows compact array storage without explicit child references.',
      'For zero-based array index i, left child is 2i+1, right child is 2i+2 and parent is floor((i-1)/2) for i>0. These formulas describe shape, not priority ordering.',
      'A min-heap guarantees parent <= children, so the minimum is at index 0. A max-heap reverses the comparison. Siblings and different subtrees are not globally sorted.',
      'Sift-up repairs a newly appended leaf by swapping it with its parent while it violates heap order. At most the tree height swaps occur, so insert is O(log n).',
      'Sift-down repairs a root after extraction by swapping with the better child (smaller for min-heap, larger for max-heap) until heap order is restored. Extract is O(log n).',
      'Bottom-up heapify starts at the last internal node and sifts down in reverse level order. Most nodes are near leaves and move only a few levels; summing height-weighted work gives O(n), not O(n log n).',
      'For Top K largest, a min-heap of size K keeps the weakest retained item at the root. A new item replaces it only when larger. For Top K smallest, use a max-heap of size K.',
      'A K-way merge heap stores one current candidate per nonempty sorted source. After removing the smallest candidate, advance only its source and insert its next item. With K sources and N total items, work is O(N log K).',
      'Running median uses a max-heap for the lower half and a min-heap for the upper half. Keep sizes equal or lower size one larger; the median is read from the roots.',
      'PriorityQueue does not support efficient arbitrary removal by value. Lazy deletion stores invalidation/version metadata and discards stale roots when they reach the top; periodic rebuilds may be needed if stale entries grow without bound.',
      'Equal priorities need a deterministic tie-breaker when reproducible order matters. A tuple such as (priority, sequenceNumber, payload) prevents accidental comparison of payload objects.',
      'Heap operations are logarithmic in heap size, not in the number of distinct priorities. If all priorities are equal, shape and ordering still follow the same heap operations.'
    ],
    correctness: [
      'Sift-up invariant: the subtree rooted at the inserted node is heap-ordered except possibly along its path to the root; swapping with a violating parent moves the only possible violation upward.',
      'Sift-down invariant: before each iteration, all subtrees below the current node satisfy heap order; selecting the better child ensures the swap restores the parent relation at the previous position.',
      'Top K invariant: after processing each input prefix, the bounded min-heap contains the K largest values seen so far (or all seen values when fewer than K exist). Its root is the smallest retained value.',
      'K-way merge invariant: the heap contains the smallest not-yet-emitted item from each nonempty source. Therefore its root is the globally smallest remaining item.',
      'Running-median invariant: every value in lower heap is <= every value in upper heap, and heap sizes differ by at most one. Root(s) therefore identify the median.',
      'Heapify correctness follows because children are already heap-ordered when a parent is sifted down in reverse level order; after processing all internal nodes, the entire tree satisfies heap order.'
    ],
    implementationSteps: [
      'Specify min-heap or max-heap in terms of the item that must be extracted first.',
      'Write the zero-based index formulas and verify them on a small array before implementing custom heap logic.',
      'For insertion, append then sift up; for extraction, save root, move last item to root, remove last slot and sift down.',
      'When implementing sift-down, compare both existing children and swap with the better child, not simply the left child.',
      'For Top K, cap heap size at K and explain why the root is the weakest retained candidate.',
      'For K-way merge, store source index and next position with each heap entry.',
      'For duplicate priorities, define a deterministic tie-breaker if order matters.',
      'Test empty heap, singleton, duplicate priorities, ascending/descending input, K=1, K=n and invalid K.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Top K largest values with a bounded min-heap', code: `static int[] topKLargest(int[] values, int k) {
    if (k < 0 || k > values.length) throw new IllegalArgumentException("invalid k");
    if (k == 0) return new int[0];

    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int value : values) {
        if (minHeap.size() < k) {
            minHeap.offer(value);
        } else if (value > minHeap.peek()) {
            minHeap.poll();
            minHeap.offer(value);
        }
    }
    return minHeap.stream().mapToInt(Integer::intValue).toArray();
}`, explanation: 'The min-heap root is the smallest of the retained K candidates. Each input item causes at most one O(log K) update. Total O(n log K) time and O(K) auxiliary space. Returned order is heap iteration order, not sorted order.' },
      { language: 'Java 21', title: 'Merge K sorted arrays', code: `record Entry(int value, int source, int index) {}

static int[] mergeKSorted(int[][] arrays) {
    PriorityQueue<Entry> heap = new PriorityQueue<>(
        Comparator.comparingInt(Entry::value)
                  .thenComparingInt(Entry::source)
    );
    int total = 0;
    for (int source = 0; source < arrays.length; source++) {
        total += arrays[source].length;
        if (arrays[source].length > 0) {
            heap.offer(new Entry(arrays[source][0], source, 0));
        }
    }

    int[] merged = new int[total];
    int out = 0;
    while (!heap.isEmpty()) {
        Entry smallest = heap.poll();
        merged[out++] = smallest.value();
        int nextIndex = smallest.index() + 1;
        int[] source = arrays[smallest.source()];
        if (nextIndex < source.length) {
            heap.offer(new Entry(source[nextIndex], smallest.source(), nextIndex));
        }
    }
    return merged;
}`, explanation: 'The heap has at most one candidate per source. Each output removes one candidate and inserts at most one successor. O(N log K) time and O(K) heap space, excluding the output array.' }
    ],
    traceExercises: [
      'Insert 7, 3, 9, 1, 6 into a min-heap. Draw the array after each append and sift-up.',
      'Extract twice from [1, 3, 6, 7, 9]. Show the replacement root and each sift-down choice.',
      'For Top 3 largest in [4, 1, 9, 2, 8, 3], record the heap after each processed value and explain every rejection.',
      'Merge [1, 4, 9], [1, 3, 8], [2, 6]. Record heap entries as (value, source, index) after every extraction.'
    ],
    realWorldApplications: [
      'Operating-system and application schedulers select the next task by priority.',
      'Streaming analytics maintain Top K items without sorting the entire history.',
      'Search engines and recommendation systems merge ranked result streams.',
      'Event simulation uses a min-heap ordered by next event time.',
      'Monitoring systems compute running medians from latency and metric streams.'
    ],
    assessment: [
      'Prove bottom-up heapify is O(n) using the number of nodes at each height.',
      'Explain why a heap array is not sorted and identify the only guaranteed extremum.',
      'Implement Top K largest and justify min-heap orientation and bounded size.',
      'Design K-way merge and explain why only one candidate per source is sufficient.',
      'State and maintain the two-heap invariant for a running median.',
      'Explain how lazy deletion works and when stale heap entries may become a memory issue.',
      'Test duplicates, empty sources, one source, invalid K and all-equal priorities.'
    ],
    revisionPrompts: [
      'Write parent/left/right index formulas from memory and derive them from a tree level.',
      'Trace sift-up and sift-down on a five-element heap.',
      'Re-derive the O(n) heapify argument by summing nodes weighted by height.',
      'After two days, implement Top K largest and explain why the root is the weakest retained value.',
      'After one week, solve K-way merge and running median while stating their invariants.',
      'Explain the difference between heap order and total sorted order in one minute.'
    ]
  },
  {
    id: 'backtracking', title: '11. Backtracking', promise: 'Explore combinatorial choices systematically and prune only when safe.',
    mentalModel: 'Backtracking builds a partial solution, explores one choice, then undoes it before trying another. The search tree represents decisions. Pruning removes a branch only when it cannot produce a valid or better answer.',
    concepts: ['State, choices, constraints, goal and undo operation.', 'Subsets, combinations and permutations.', 'Choose–explore–unchoose template.', 'Duplicate handling after sorting.', 'Constraint propagation and early pruning.', 'N-Queens, Sudoku and word search.', 'Branch and bound for optimization.', 'Memoization when different paths reach the same state.', 'Meet in the middle for moderate n.'],
    recognition: ['Need all valid combinations/permutations/subsets.', 'Small n but exponential possibilities.', 'Constraints make many partial choices impossible.', 'Need a witness configuration rather than only a count.'],
    method: ['Define state completely: index, chosen elements, remaining capacity, used set, etc.', 'List choices available at this state.', 'Reject invalid states before recursing.', 'Make a choice, recurse, then undo exactly that change.', 'For duplicates, sort and skip equal choices at the same recursion depth.', 'Estimate branching factor and depth; add pruning or memoization only with a correctness argument.'],
    workedExample: ['Subsets of [a,b]: at each index choose include or exclude.', 'At index i, recurse without a[i], then recurse with a[i] added to the path.', 'At i==n, emit a copy of the path.', 'There are 2ⁿ subsets; output itself requires Θ(n·2ⁿ) total element storage if every subset is materialized.', 'Never store the mutable path reference directly; copy it at the base case.'],
    complexity: ['Permutations: O(n!) leaves, often O(n·n!) including output copying.', 'Subsets: O(2ⁿ) leaves, O(n) recursion depth.', 'Pruning improves practical search but may not change worst-case exponential complexity.', 'Memoization can reduce repeated states when the state space is much smaller than the search tree.'],
    pitfalls: ['Forgetting to undo mutable state.', 'Emitting the same result multiple times when duplicates exist.', 'Pruning based on intuition rather than a proven impossibility condition.', 'Not copying a path before adding it to results.', 'Using backtracking where a polynomial greedy/DP solution exists.'],
    practice: [
      {level:'Warm-up',task:'Generate all subsets and permutations.',goal:'Trace the recursion tree and undo step.'},
      {level:'Core',task:'Combination Sum and choose k numbers.',goal:'Control start index and reuse policy.'},
      {level:'Core',task:'Generate unique permutations with duplicates.',goal:'Skip duplicates at the same depth.'},
      {level:'Challenge',task:'N-Queens and Sudoku solver.',goal:'Use constraint checks and safe pruning.'},
      {level:'Transfer',task:'Count solutions instead of listing them.',goal:'Change the return contract and consider memoization.'}
    ],
    interviewChecks: ['What is the complete state?', 'Why must you undo a choice?', 'When is duplicate skipping safe?', 'What is the difference between pruning and memoization?'],
    learningOutcomes: ["Define a complete search state, choices, constraints and terminal condition.","Implement choose-explore-unchoose while restoring mutable state.","Avoid duplicate outputs using sorted choices and same-depth skipping.","Prove pruning safe by showing a branch cannot yield a valid solution.","Estimate search-tree and output-sensitive complexity."],
    prerequisites: ["Recursion and call-stack behavior.","Arrays/lists/sets and mutable state.","Basic combinatorics and constraint reasoning."],
    deepDive: ["Backtracking explores a decision tree. A state must contain every fact that affects future legal choices; omitting history can merge states that are not equivalent.","The canonical pattern is choose, recurse, unchoose. Every mutation made before recursion must be restored on every return path, including early exits.","Subsets make two choices per element and produce 2^n leaves. Permutations have n! leaves; materializing each length-n result costs Θ(n·n!).","For duplicate values, sort first and skip equal candidates at the same recursion depth. Do not skip equal values globally because identical values may be used at different positions when multiplicity permits.","Pruning is valid only when a partial state cannot possibly lead to a valid solution. A heuristic that merely seems unlikely is not a correctness argument.","Memoization is useful when different decision paths reach the same fully described state. It does not help when all states are unique.","Branch and bound uses a proven optimistic bound to discard branches that cannot beat the best known solution."],
    correctness: ["Search completeness: every valid solution has a sequence of choices represented by one root-to-leaf path in the decision tree.","Soundness: a result is emitted only at a terminal state satisfying all constraints.","Undo invariant: after returning from a recursive child, the mutable path/state equals exactly the parent state before the choice.","Pruning safety: a branch is removed only when its state cannot reach any valid solution (or cannot improve the incumbent for optimization)."],
    implementationSteps: ["Write state variables and prove they contain all future-relevant information.","List choices in a deterministic order.","Check invalid states before descending and terminal states before emitting results.","Apply one choice, recurse, then undo exactly that choice.","Copy mutable paths when storing results.","Sort and skip duplicates at the correct recursion depth if unique combinations are required.","Estimate exponential output and guard recursion depth/input constraints."],
    codeExamples: [{"language":"Java 21","title":"Generate all subsets with choose/explore/unchoose","code":"static void subsets(int[] values, int index, List<Integer> path, List<List<Integer>> out) {\\n    if (index == values.length) { out.add(new ArrayList<>(path)); return; }\\n    subsets(values, index + 1, path, out);\\n    path.add(values[index]);\\n    subsets(values, index + 1, path, out);\\n    path.remove(path.size() - 1);\\n}","explanation":"Each element is excluded or included. There are 2^n leaves and Θ(n·2^n) total copied output elements. Recursion depth O(n)."}],
    traceExercises: ["Draw the full decision tree for subsets of [a,b].","Trace the path list before and after each recursive return for [1,2].","For [1,1,2], show why duplicate skipping is depth-local rather than global."],
    realWorldApplications: ["Constraint solvers and puzzle engines.","Configuration and test-case generation.","Scheduling and resource allocation search.","Compiler optimization and combinatorial planning."],
    assessment: ["Identify the complete state for a combination-sum problem.","Explain why every mutation needs an undo operation.","Prove a chosen pruning condition is safe.","Derive output-sensitive complexity for all subsets.","Explain same-depth duplicate skipping."],
    revisionPrompts: ["Write choose/explore/unchoose from memory.","Trace a mutable path and verify restoration after each child.","After two days, implement unique subsets with duplicates.","After one week, justify a pruning rule with a proof."]
  },
  {
    id: 'greedy', sourcePages: [5], title: '12. Greedy Algorithm', promise: 'Recognise when local decisions can be proven to produce a global optimum.',
    mentalModel: 'A greedy algorithm commits to a locally attractive choice and does not reconsider it. This is powerful only when the problem has a structure that makes the choice safe. A plausible heuristic is not a proof.',
    concepts: ['Greedy-choice property and optimal substructure.', 'Exchange argument: transform an optimal solution to include the greedy choice.', 'Stays-ahead proof and cut property.', 'Interval scheduling by earliest finish.', 'Minimum platforms/meeting rooms via event ordering.', 'Jump Game reachability.', 'Huffman coding.', 'Greedy vs DP: coin systems and counterexamples.', 'Tie-breaking and sorting invariants.'],
    recognition: ['The task asks for a maximum number of compatible intervals or minimum resources.', 'A sorted order may make one decision dominate alternatives.', 'A local choice can be exchanged into an optimal solution without worsening it.'],
    method: ['Propose the greedy choice and define the remaining subproblem.', 'Try tiny counterexamples, especially ties and awkward values.', 'State the exchange or stays-ahead argument formally.', 'Show that after choosing greedily, the residual problem has the same structure.', 'Sort once if needed and account for sorting complexity.', 'If no proof emerges, compare with DP or graph search rather than assuming greedy works.'],
    workedExample: ['Maximum number of non-overlapping intervals: sort by increasing finish time.', 'Choose the first interval; then repeatedly choose the next interval whose start is at least the finish of the last chosen interval (for half-open intervals).', 'Exchange proof: among all optimal schedules, replace its first interval with the globally earliest-finishing interval. This cannot reduce room for later intervals.', 'Repeat on the remaining compatible intervals.', 'Time O(n log n) for sorting, O(n) scan. Boundary comparison changes for closed intervals.'],
    complexity: ['Often O(n log n) due to sorting plus O(n) scan.', 'Some greedy scans are O(n) when input is already ordered.', 'Huffman with a priority queue: O(n log n).'],
    pitfalls: ['Assuming a locally largest/smallest choice is always optimal.', 'Ignoring interval endpoint semantics.', 'Using earliest start instead of earliest finish for interval scheduling.', 'Forgetting a counterexample to greedy coin change.', 'Failing to prove that a greedy choice leaves an optimal residual problem.'],
    practice: [
      {level:'Warm-up',task:'Choose maximum non-overlapping intervals.',goal:'Sort by finish and articulate exchange proof.'},
      {level:'Core',task:'Jump Game and minimum jumps.',goal:'Maintain farthest reachable boundary.'},
      {level:'Core',task:'Assign cookies or schedule tasks.',goal:'Sort both sides and justify matching order.'},
      {level:'Challenge',task:'Huffman coding.',goal:'Repeatedly merge two smallest frequencies.'},
      {level:'Transfer',task:'Test a proposed greedy coin strategy.',goal:'Find a counterexample or prove the denomination assumptions.'}
    ],
    interviewChecks: ['What is the greedy-choice property?', 'Give an exchange argument.', 'Why does earliest finish work for interval scheduling?', 'How do you know DP is needed instead?'],
    learningOutcomes: [
      'Distinguish a proven greedy algorithm from an intuitive but unsupported local heuristic.',
      'Use exchange, stays-ahead or cut-property arguments to justify greedy choices.',
      'Implement interval scheduling with explicit open/closed endpoint semantics.',
      'Recognize when a greedy scan preserves an optimal residual subproblem.',
      'Construct counterexamples when a greedy choice is unsafe and compare with dynamic programming.',
      'Account for sorting, priority-queue operations and tie-breaking in complexity.'
    ],
    prerequisites: [
      'Understand sorting, intervals and comparator ordering.',
      'Know basic induction and proof by contradiction.',
      'Understand dynamic programming at a high level as an alternative when local choices cannot be proven safe.',
      'Be comfortable with priority queues for Huffman-style algorithms.'
    ],
    deepDive: [
      'Greedy commits to a locally selected choice and does not revisit it. The algorithm is correct only when a proof shows that some optimal solution can contain that choice.',
      'The greedy-choice property says there exists an optimal solution beginning with the greedy choice. Optimal substructure says the remaining part of that solution is optimal for the residual problem.',
      'An exchange argument starts with an optimal solution and replaces one of its choices with the greedy choice without making the solution worse. The residual problem then has the same form.',
      'A stays-ahead proof compares greedy and optimal partial solutions after each step and shows the greedy solution is never behind under a carefully chosen measure.',
      'For unweighted interval scheduling, choosing the compatible interval with earliest finish leaves at least as much time as any other first choice. Replace the first interval of an optimal schedule with it, then repeat.',
      'Endpoint semantics matter. For half-open intervals [start,end), an interval beginning exactly when the previous one ends is compatible (start>=lastEnd). For closed intervals, that equality may represent overlap.',
      'Sorting by earliest start is not generally optimal for maximum interval count; a long early interval can block several short later intervals. Earliest finish is justified by the exchange argument.',
      'Jump Game maintains the farthest index reachable from the processed prefix. If the current index is beyond that boundary, the destination is unreachable; otherwise extend the boundary.',
      'Minimum jumps can be solved by expanding BFS-like layers greedily: currentEnd is the end of the current jump layer and farthest is the next layer boundary. Increment jumps when the scan reaches currentEnd.',
      'Huffman coding repeatedly combines the two smallest frequencies. The prefix-code tree structure admits an exchange argument: the two least frequent symbols can be placed as deepest siblings in some optimal tree.',
      'Greedy coin change is not universally optimal. For denominations [1,3,4] and amount 6, greedy takes 4+1+1 (three coins) while optimal is 3+3 (two coins).',
      'A greedy proof must include ties. If multiple choices share a key, define whether any tie is safe or use a deterministic secondary ordering.',
      'If the local choice cannot be exchanged into an optimum and no stays-ahead/cut proof applies, investigate DP or graph search. Do not turn a failed proof into an assumption.'
    ],
    correctness: [
      'Interval scheduling exchange invariant: after selecting the earliest-finishing compatible interval, there exists an optimal schedule whose first selected interval is that greedy interval.',
      'Residual optimality: after fixing the greedy interval, the remaining chosen intervals form an optimal schedule among intervals starting at or after its finish; otherwise replacing the residual would improve the original solution.',
      'Jump Game invariant: after processing all indices up to the current scan position, farthest is the maximum reachable index from any processed reachable position.',
      'Minimum-jumps layer invariant: currentEnd is the farthest position reachable using the current number of jumps; farthest is the furthest boundary reachable with one additional jump.',
      'Huffman invariant: after each merge, the priority queue represents the remaining forest of optimal subtrees; merging the two minimum weights is a safe sibling choice.',
      'Counterexample correctness: a single valid input where greedy produces a worse objective than another feasible solution disproves a universal greedy claim.'
    ],
    implementationSteps: [
      'State the objective and the candidate local choice in precise terms.',
      'Try the smallest inputs and tie cases to search for counterexamples before coding.',
      'Choose a proof technique: exchange, stays-ahead, cut property or a problem-specific invariant.',
      'Define the residual subproblem and prove it has the same structure after the greedy choice.',
      'Sort once with a comparator that encodes the proven choice; state tie-breaking and interval endpoint semantics.',
      'For interval scheduling, update lastEnd only after accepting an interval.',
      'For Jump Game, ignore unreachable positions and update the farthest reachable boundary.',
      'If no proof is available, compare against DP or exhaustive search on small random cases.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Maximum number of non-overlapping half-open intervals', code: `record Interval(int start, int end) {}

static int maximumCompatibleIntervals(List<Interval> intervals) {
    List<Interval> ordered = new ArrayList<>(intervals);
    ordered.sort(Comparator.comparingInt(Interval::end)
                           .thenComparingInt(Interval::start));
    int selected = 0;
    int lastEnd = Integer.MIN_VALUE;
    for (Interval interval : ordered) {
        if (interval.start() >= lastEnd) {
            selected++;
            lastEnd = interval.end();
        }
    }
    return selected;
}`, explanation: 'The code assumes valid half-open intervals with start<=end. Sorting costs O(n log n); the scan is O(n). The exchange argument proves earliest finish is a safe first choice.' },
      { language: 'Java 21', title: 'Jump Game reachability', code: `static boolean canReachEnd(int[] jumps) {
    if (jumps.length == 0) return false;
    long farthest = 0L;
    for (int i = 0; i < jumps.length; i++) {
        if (i > farthest) return false;
        farthest = Math.max(farthest, (long) i + jumps[i]);
        if (farthest >= jumps.length - 1) return true;
    }
    return true;
}`, explanation: 'The farthest boundary summarizes all reachable positions in the processed prefix. O(n) time and O(1) auxiliary space. Inputs are assumed to contain nonnegative jump lengths.' }
    ],
    traceExercises: [
      'Interval trace: [1,3), [2,4), [3,5), [0,7), [5,6). Sort by finish and record accepted intervals.',
      'Jump Game trace: [2,3,1,1,4] and [3,2,1,0,4]. Record i and farthest after each reachable index.',
      'Coin counterexample: denominations [1,3,4], amount 6. Compare greedy and optimal solutions.',
      'Tie trace: two intervals share the same end time. Explain why either can be selected for the maximum-count objective.'
    ],
    realWorldApplications: [
      'Meeting and resource scheduling where the objective is to maximize compatible jobs.',
      'Data compression using Huffman prefix codes.',
      'Reachability and minimum-jump planning across bounded transitions.',
      'Task assignment when sorted priorities admit a proven matching strategy.',
      'Network algorithms use cut properties for minimum spanning tree greedy choices.'
    ],
    assessment: [
      'Give an exchange proof for earliest-finish interval scheduling.',
      'Explain why earliest-start scheduling can fail and construct a counterexample.',
      'Implement Jump Game and state the farthest-reach invariant.',
      'Show a denomination system where greedy coin change is suboptimal.',
      'Compare exchange and stays-ahead proofs and identify which fits interval scheduling.',
      'Explain how endpoint semantics change the interval compatibility comparison.',
      'State when you would stop pursuing greedy and investigate DP.'
    ],
    revisionPrompts: [
      'State the greedy-choice property and optimal-substructure requirement from memory.',
      'Reconstruct the interval scheduling exchange argument.',
      'Find a counterexample to a greedy heuristic before attempting to prove it.',
      'After two days, implement Jump Game and trace the farthest boundary.',
      'After one week, explain Huffman’s two-smallest merge choice at a high level.',
      'For a new greedy problem, write the proof before presenting the implementation.'
    ]
  },
  {
    id: 'dynamic-programming', sourcePages: [20], title: '13. Dynamic Programming', promise: 'Turn repeated recursive subproblems into a precise state and recurrence.',
    mentalModel: 'DP is systematic reuse of answers to overlapping subproblems. The central work is not filling a table; it is defining a state that contains exactly the information needed to make future decisions.',
    concepts: ['Overlapping subproblems and optimal substructure.', 'SRTBOT: state, recurrence, base case, order, answer, time.', 'Memoization (top-down) vs tabulation (bottom-up).', '1D DP: Fibonacci, climbing stairs, house robber.', 'Grid DP: paths, obstacles and minimum cost.', 'Knapsack: 0/1 vs unbounded; loop direction matters.', 'Subset sum, partition and coin change.', 'String DP: LCS, edit distance, LIS and palindromes.', 'Interval DP and tree DP.', 'State compression, bitmask DP and optimization.'],
    recognition: ['The problem asks count/minimum/maximum over repeated choices.', 'Recursive branches revisit the same parameter combinations.', 'A solution depends on smaller prefixes, capacities, intervals or subtrees.', 'Greedy choices fail but optimal substructure exists.'],
    method: ['Start with a recursive definition in plain language.', 'Choose state variables that fully determine the subproblem; avoid missing history.', 'Write recurrence from the choices available at a state.', 'Set base cases for empty/small states.', 'Draw dependencies and choose a valid evaluation order.', 'Prove each transition considers all legal choices and no illegal choice.', 'Count states × transitions; optimize space only after the recurrence is correct.'],
    workedExample: ['0/1 Knapsack: dp[i][c] = maximum value using the first i items with capacity c.', 'Base: dp[0][c]=0 and dp[i][0]=0.', 'If weight[i] > c, skip: dp[i][c]=dp[i−1][c]. Otherwise max(skip, value[i]+dp[i−1][c−weight[i]]).', 'Time O(nW), space O(nW); compress to O(W) by iterating capacity downward.', 'For unbounded knapsack, capacity often iterates upward so the current item can be reused.'],
    complexity: ['Typical 1D DP: O(n) states with O(1) transitions.', 'Grid DP: O(rows×cols) states.', '0/1 knapsack: O(nW), pseudo-polynomial because W is numeric capacity, not its bit length.', 'LCS: O(nm) time and O(nm) space; length-only can use O(min(n,m)) space.', 'Bitmask DP often O(2ⁿ·poly(n)); n must be small.'],
    pitfalls: ['Defining a state that omits information needed for future decisions.', 'Wrong base cases or transition order.', 'Confusing 0/1 and unbounded knapsack loop direction.', 'Overwriting a previous row/column before all dependent states use it.', 'Calling pseudo-polynomial complexity polynomial in input bit length.', 'Optimizing memory before understanding dependency direction.'],
    practice: [
      {level:'Warm-up',task:'Climbing stairs and house robber.',goal:'Write state, recurrence and base cases.'},
      {level:'Core',task:'Unique paths and minimum grid path sum.',goal:'Read dependencies from top/left.'},
      {level:'Core',task:'0/1 knapsack, subset sum and coin change.',goal:'Explain loop direction and item reuse.'},
      {level:'Challenge',task:'Longest common subsequence and edit distance.',goal:'Define two-index state and transitions.'},
      {level:'Transfer',task:'Choose a DP state for a new constrained sequence problem.',goal:'Derive recurrence before coding and justify complexity.'}
    ],
    interviewChecks: ['What information does your state represent?', 'Why are the subproblems overlapping?', 'Why is the evaluation order valid?', 'Why does 0/1 knapsack iterate capacity downward?', 'What makes knapsack pseudo-polynomial?'],
    learningOutcomes: ["Define DP state so it contains all information needed for future decisions.","Derive recurrence, base cases, evaluation order and final answer.","Prove transition correctness using optimal substructure or counting decomposition.","Distinguish memoization from tabulation and justify state compression.","Analyse states × transitions and identify pseudo-polynomial complexity."],
    prerequisites: ["Recursion and recurrence relations.","Arrays, loops and basic combinatorics.","Greedy versus exhaustive search intuition."],
    deepDive: ["A DP state is a subproblem identity. If two histories produce the same state, their remaining optimal/counting problem must be equivalent for memoization to be valid.","SRTBOT: state, recurrence, base case, order, answer and time. Define each explicitly before writing a table.","For 0/1 knapsack, each item is used at most once, so a one-dimensional capacity loop runs downward. For unbounded knapsack, upward iteration permits reuse of the current item.","Top-down memoization follows only reached states but adds call-stack cost. Bottom-up tabulation makes dependency order explicit and avoids recursion depth.","Space compression is valid only when overwritten values are no longer needed by future transitions. Derive the dependency direction before reducing dimensions.","O(nW) knapsack is pseudo-polynomial: W is a numeric magnitude, whose representation requires only O(log W) bits.","LCS state dp[i][j] describes prefixes of lengths i and j; equal terminal symbols extend the diagonal, otherwise take the better of dropping one terminal symbol."],
    correctness: ["State sufficiency: histories mapped to the same state have identical remaining choices and costs, so reusing one computed result is valid.","Transition proof: every legal solution's first/last decision is represented by one recurrence branch, and each branch combines valid smaller subproblems.","Evaluation-order proof: every dependency is computed before the state that consumes it.","Space-compression proof: loop direction preserves the old-row/old-item values required by the recurrence."],
    implementationSteps: ["Write a recursive brute-force definition in plain language.","Identify repeated subproblems and define a minimal sufficient state.","Derive recurrence from exhaustive legal choices.","Set base cases for empty/minimal states.","Draw dependency arrows and choose memoization or a valid topological table order.","Count states and transitions; state memory and recursion costs.","Compress space only after proving overwritten states are dead.","Test zero capacity, empty input, repeated values, impossible states and large constraints."],
    codeExamples: [{"language":"Java 21","title":"0/1 knapsack with one-dimensional compression","code":"static int knapsack01(int[] weight, int[] value, int capacity) {\\n    int[] dp = new int[capacity + 1];\\n    for (int i = 0; i < weight.length; i++) {\\n        for (int c = capacity; c >= weight[i]; c--) {\\n            dp[c] = Math.max(dp[c], value[i] + dp[c - weight[i]]);\\n        }\\n    }\\n    return dp[capacity];\\n}","explanation":"Descending capacity ensures each item contributes at most once. O(nW) time and O(W) space; pseudo-polynomial in capacity."}],
    traceExercises: ["Fill a 0/1 knapsack table for weights [1,3,4], values [15,20,30], capacity 4.","Compare descending and ascending capacity loops for one item of weight 2 and value 3.","Draw the dependency DAG for a small LCS table."],
    realWorldApplications: ["Resource allocation and budget planning.","Sequence comparison in diff tools and bioinformatics.","Route and grid optimization with overlapping subproblems.","Scheduling and inventory decisions."],
    assessment: ["Define state and recurrence for a stated optimization problem.","Explain why 0/1 knapsack iterates capacity downward.","Prove that a proposed state is sufficient or identify missing history.","Calculate states × transitions and classify pseudo-polynomial complexity.","Justify a space optimization from dependency order."],
    revisionPrompts: ["Recreate SRTBOT for 0/1 knapsack.","Explain state sufficiency using two different histories reaching one state.","After two days, implement memoized and tabulated versions of a small DP.","After one week, derive a recurrence before writing any table."]
  },
  {
    id: 'graphs', sourcePages: [19], title: '14. Graphs', promise: 'Model relationships and master traversal, connectivity, ordering and shortest paths.',
    mentalModel: 'A graph is a set of vertices connected by edges. Most graph problems become manageable after choosing a representation, defining what a state means, and selecting an algorithm that matches edge direction and weight assumptions.',
    concepts: ['Directed/undirected, weighted/unweighted, cyclic/acyclic, connected/disconnected.', 'Adjacency list vs adjacency matrix; edge list.', 'BFS for unweighted shortest paths and multi-source traversal.', 'DFS for components, cycle detection and finishing order.', 'Grid-to-graph modelling and state-expanded BFS.', 'Topological sorting with Kahn or DFS; DAG dependency order.', 'Union-Find with path compression and union by size/rank.', 'Dijkstra for non-negative weights; Bellman-Ford for negative edges.', 'Floyd-Warshall for all-pairs shortest paths.', 'Minimum spanning tree: Kruskal and Prim.', 'SCC, bridges and articulation points (advanced).'],
    recognition: ['The prompt describes networks, dependencies, routes, transformations or reachability.', 'Need minimum number of edges in an unweighted graph.', 'Need a valid dependency order or detect a cycle.', 'Need repeated connectivity merges or minimum-cost connection.', 'Edge weights determine shortest-path algorithm choice.'],
    method: ['Identify vertices, edges, direction, weight and graph size.', 'Choose adjacency list for sparse graphs; matrix for dense/small graphs or constant-time edge checks.', 'For BFS, mark visited when enqueuing to prevent duplicate queue entries.', 'For DFS, track recursion/explicit stack and distinguish visited from active-path state for directed cycles.', 'For topological order, count indegrees and process zero-indegree vertices; fewer than V outputs means a cycle.', 'For shortest paths, check weights first: BFS if unweighted, Dijkstra if all weights nonnegative, Bellman-Ford if negative edges may occur.', 'For MST, use Kruskal + DSU or Prim; distinguish MST from shortest-path tree.'],
    workedExample: ['Unweighted shortest path from source s: initialise dist[s]=0 and enqueue s.', 'Pop u; for each unvisited neighbour v, set dist[v]=dist[u]+1, parent[v]=u, then enqueue v.', 'Because BFS explores by nondecreasing distance in layers, the first discovery gives the minimum edge count.', 'Time O(V+E), space O(V) with adjacency lists.', 'Reconstruct a path by following parent pointers backward from target.'],
    complexity: ['Adjacency list storage: O(V+E); matrix storage: O(V²).', 'BFS/DFS: O(V+E).', 'Topological sort: O(V+E).', 'DSU operations: near-constant amortized with path compression and union by size/rank.', 'Dijkstra with binary heap: O((V+E) log V) commonly stated for adjacency lists.', 'Bellman-Ford: O(VE); Floyd-Warshall: O(V³).', 'Kruskal: O(E log E); Prim with heap: O((V+E) log V).'],
    pitfalls: ['Using Dijkstra with negative edge weights.', 'Marking BFS visited only after dequeue and creating duplicate work.', 'Confusing directed and undirected cycle detection.', 'Assuming every graph is connected.', 'Using a topological sort on a cyclic graph.', 'Confusing minimum spanning tree with shortest paths from one source.'],
    practice: [
      {level:'Warm-up',task:'Represent a graph and traverse with BFS/DFS.',goal:'Handle isolated vertices and disconnected components.'},
      {level:'Core',task:'Count islands and find unweighted shortest path.',goal:'Model grid cells as vertices and mark on enqueue.'},
      {level:'Core',task:'Course Schedule / dependency ordering.',goal:'Use indegrees and detect cycles.'},
      {level:'Challenge',task:'Network delay, negative edges and minimum spanning tree.',goal:'Select Dijkstra, Bellman-Ford, Kruskal or Prim by assumptions.'},
      {level:'Transfer',task:'Solve a graph problem with an extra state such as stops, keys or parity.',goal:'Expand the state graph and bound its size.'}
    ],
    interviewChecks: ['When does BFS give shortest paths?', 'Why can Dijkstra fail with negative edges?', 'How does Kahn detect a cycle?', 'What does DSU represent?', 'How is an MST different from a shortest-path tree?'],
    learningOutcomes: ["Model vertices, edges, direction, weights and graph representation from a problem statement.","Choose BFS, DFS, topological sort, DSU or shortest-path algorithm based on graph properties.","Prove BFS shortest-hop correctness and distinguish directed-cycle detection states.","Select Dijkstra only for nonnegative weights and explain negative-edge alternatives.","Analyse O(V+E), representation space and algorithm-specific complexity."],
    prerequisites: ["Queues, stacks, recursion and hash sets.","Arrays/matrices and adjacency representations.","Basic shortest-path and ordering vocabulary."],
    deepDive: ["An adjacency list stores outgoing neighbors and uses O(V+E) space; an adjacency matrix uses O(V²) space and supports constant-time edge existence checks.","BFS explores layers in nondecreasing number of edges. Marking visited when enqueuing prevents multiple queue insertions for the same vertex.","DFS uses recursion or an explicit stack. For directed cycle detection, distinguish unvisited, active (on current path) and completed vertices; an edge to active means a cycle.","Topological ordering exists only for a DAG. Kahn's algorithm repeatedly removes indegree-zero vertices; fewer than V outputs proves a directed cycle remains.","Dijkstra requires nonnegative edge weights. Bellman-Ford supports negative edges and can detect reachable negative cycles; Floyd-Warshall computes all-pairs distances in O(V³).","A minimum spanning tree connects all vertices of a connected undirected weighted graph with minimum total edge weight. It is not a shortest-path tree from a chosen source.","DSU with path compression and union by size/rank supports near-constant amortized connectivity operations and is central to Kruskal's algorithm."],
    correctness: ["BFS invariant: when a vertex is first enqueued, its distance is the shortest possible edge count because all smaller-distance layers have already been processed.","Kahn invariant: every emitted vertex has all incoming neighbors already emitted; if vertices remain, the remaining directed subgraph contains a cycle.","Dijkstra invariant: when the smallest tentative-distance vertex is finalized, no path through an unfinalized vertex can improve it when all edge weights are nonnegative.","Kruskal correctness follows from the cut property: the lightest safe edge crossing a cut can be included in some minimum spanning tree."],
    implementationSteps: ["List vertices and edge semantics, including whether parallel edges/self-loops are allowed.","Choose adjacency list for sparse graphs and matrix for dense/small graphs.","For BFS, initialize distance/parent and mark visited at enqueue time.","For DFS cycle detection, track active recursion path separately from completed nodes.","For topological sort, calculate indegrees and compare output count with V.","Choose shortest-path algorithm only after checking edge-weight constraints.","Test disconnected graphs, isolated vertices, cycles, parallel edges and negative weights."],
    codeExamples: [{"language":"Java 21","title":"BFS shortest distances in an unweighted graph","code":"static int[] bfsDistances(List<List<Integer>> graph, int source) {\\n    int[] distance = new int[graph.size()];\\n    Arrays.fill(distance, -1);\\n    ArrayDeque<Integer> queue = new ArrayDeque<>();\\n    distance[source] = 0; queue.add(source);\\n    while (!queue.isEmpty()) {\\n        int u = queue.remove();\\n        for (int v : graph.get(u)) {\\n            if (distance[v] == -1) {\\n                distance[v] = distance[u] + 1;\\n                queue.add(v);\\n            }\\n        }\\n    }\\n    return distance;\\n}","explanation":"Returns -1 for unreachable vertices. O(V+E) time and O(V) auxiliary space, excluding adjacency storage."}],
    traceExercises: ["Trace BFS layers on a graph with a cycle and one disconnected component.","Run Kahn's algorithm and show indegrees after each removal.","Compare Dijkstra and Bellman-Ford on a graph containing one negative edge."],
    realWorldApplications: ["Network routing and reachability.","Build systems and dependency scheduling.","Social network connections and recommendation graphs.","Road/transport networks and infrastructure planning."],
    assessment: ["Choose a graph representation for sparse and dense inputs.","Prove BFS returns shortest unweighted distances.","Explain why visited-on-dequeue can cause duplicate queue entries.","Select a shortest-path algorithm for negative and nonnegative weights.","Explain how Kahn detects cycles and distinguish MST from shortest-path tree."],
    revisionPrompts: ["Draw adjacency list and matrix for one directed weighted graph.","Re-derive BFS layer correctness.","After two days, implement topological sort and cycle detection.","After one week, explain algorithm selection from edge-weight constraints."]
  },
  {
    id: 'two-dimensional-arrays', sourcePages: [1], title: '15. 2D Arrays & Matrix', promise: 'Master matrix indexing, traversal, transformations, searching, submatrix queries and grid algorithms.',
    mentalModel: 'A matrix is a grid addressed by (row, column). Most bugs come from mixing row and column counts, inconsistent boundaries, or assuming the matrix is square. Treat a cell as a graph vertex when movement and reachability matter; treat a rectangle as a range when aggregation matters.',
    concepts: [
      'Representation: int[][], rows = matrix.length, columns = rows == 0 ? 0 : matrix[0].length; rectangular and ragged arrays are different contracts.',
      'Indexing: matrix[r][c]; valid rows are [0, rows), valid columns are [0, cols). Always use rows for the outer loop and columns for the inner loop.',
      'Traversal: row-major, column-major, diagonals, boundary, zigzag and spiral.',
      'Coordinate transforms: transpose maps (r,c) to (c,r); clockwise rotation maps old (r,c) to (c, rows−1−r) for rectangular output dimensions.',
      'In-place transformations: transpose a square matrix across the diagonal; rotate a square matrix by transpose + reverse each row.',
      'Matrix search: linear scan, per-row binary search, flattened binary search when globally sorted, staircase search for row-and-column sorted matrices.',
      '2D prefix sum: prefix[r+1][c+1] stores the sum of rectangle [0,r] × [0,c]; use inclusion-exclusion for any rectangle.',
      '2D difference arrays: four corner updates represent adding a value to a rectangular region, followed by 2D prefix accumulation.',
      'Grid as graph: four/eight directions, bounds checks, visited marking, BFS, DFS and multi-source BFS.',
      'Grid DP: state at (r,c), transitions from predecessor cells, obstacles, path counts and minimum costs.',
      'Advanced matrix optimisation: compress row pairs and apply Kadane; monotonic stacks for maximal rectangle; binary search on answer for sorted matrix statistics.'
    ],
    recognition: [
      'The input is a grid, image, board, map, table or matrix with row/column coordinates.',
      'The prompt asks for spiral, diagonal, boundary, rotation, transpose, zeroing or in-place transformation.',
      'Rows and columns are sorted, or all values are globally sorted, which enables different binary-search strategies.',
      'Many rectangle-sum queries suggest a 2D prefix sum; many rectangle updates suggest a 2D difference array.',
      'Movement between adjacent cells suggests BFS/DFS; count/minimum-cost paths suggests grid DP.',
      'Maximum-sum rectangle suggests fixing a pair of boundaries, compressing one dimension and applying 1D Kadane.'
    ],
    method: [
      'Read the shape constraints first: square, rectangular, empty, ragged, sorted by rows, sorted by both axes, or globally sorted.',
      'Name rows and cols separately. Check rows == 0 before reading matrix[0].length; do not assume rows == cols.',
      'Write the valid coordinate condition once: 0 <= r && r < rows && 0 <= c && c < cols.',
      'For traversal, define the exact order and use a visited set only when the traversal can revisit cells; spiral traversal instead maintains shrinking boundaries.',
      'For transformations, write the old-coordinate to new-coordinate mapping before coding and test a 2×3 matrix, not only a square matrix.',
      'For rectangle sums, adopt half-open coordinates [r1,r2) × [c1,c2) and derive inclusion-exclusion consistently.',
      'For grid graph problems, define allowed directions, when a cell becomes visited, and whether BFS is unweighted shortest path.',
      'For DP, define dp[r][c] in one sentence, list legal predecessor states, set first-row/first-column base cases, then choose a valid evaluation order.',
      'Test 0×0, 1×1, 1×N, N×1, rectangular, duplicate, blocked-start/end and boundary-touching cases.'
    ],
    workedExample: [
      '2D prefix sum: define P[r+1][c+1] as the sum of all matrix cells with row ≤ r and column ≤ c.',
      'Build with P[r+1][c+1] = matrix[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]. The subtraction removes the top-left overlap counted twice.',
      'For half-open rectangle [r1,r2) × [c1,c2), sum = P[r2][c2] − P[r1][c2] − P[r2][c1] + P[r1][c1].',
      'Preprocessing is O(rows×cols), each rectangle query is O(1), and prefix storage is O(rows×cols).',
      'Java implementation detail: use long[][] if the sum of many large integers can exceed the int range.'
    ],
    complexity: [
      'Full traversal, transpose, zeroing and spiral output: O(rows×cols) time.',
      'Staircase search in a matrix sorted by rows and columns: O(rows+cols) time, O(1) extra space.',
      'Binary search over a globally sorted rectangular matrix: O(log(rows×cols)) time.',
      '2D prefix build: O(rows×cols); each range query O(1); extra space O(rows×cols).',
      'Grid BFS/DFS: O(rows×cols) time and O(rows×cols) worst-case visited/frontier space.',
      'Grid DP: usually O(rows×cols) time; space can often be reduced to O(cols) when only the previous row is needed.',
      'Maximum sum rectangle by row-pair compression: O(min(rows,cols)² × max(rows,cols)) with the smaller dimension paired.'
    ],
    pitfalls: [
      'Using matrix[0].length before checking whether the matrix has zero rows.',
      'Swapping row and column bounds or using rows for both dimensions.',
      'Assuming a rectangular matrix is square when transposing or rotating in place.',
      'Double-counting the centre when summing both diagonals in an odd-sized square matrix.',
      'Using flattened binary search when rows are individually sorted but row ranges overlap.',
      'Applying staircase search when only rows or only columns are sorted.',
      'Off-by-one errors in 2D prefix inclusion-exclusion; define half-open ranges.',
      'Marking a BFS cell visited only after dequeue and enqueuing it repeatedly.',
      'Forgetting to restore a cell during backtracking word search.',
      'Using int for potentially large prefix or submatrix sums.'
    ],
    practice: [
      {level:'Warm-up',task:'Matrix traversal, row/column sums, diagonals and boundary traversal.',goal:'Use independent row/column bounds; handle rectangular and one-row matrices.'},
      {level:'Core',task:'Spiral Matrix, Transpose Matrix, Rotate Image and Set Matrix Zeroes.',goal:'Maintain boundary invariants and derive coordinate transforms.'},
      {level:'Core',task:'Search a 2D Matrix and Search a 2D Matrix II.',goal:'Distinguish globally sorted from row-and-column sorted assumptions.'},
      {level:'Challenge',task:'2D Range Sum Query, Number of Islands, Rotting Oranges and Word Search.',goal:'Choose prefix sums, BFS/DFS or backtracking from the problem structure.'},
      {level:'Transfer',task:'Count submatrices with target sum, maximal rectangle and shortest path in a binary matrix.',goal:'Combine 2D compression, prefix maps, monotonic stacks and BFS.'}
    ],
    interviewChecks: [
      'How do you safely handle an empty or rectangular matrix in Java?',
      'When can a matrix be treated as one flattened sorted array?',
      'Why does staircase search take O(rows+cols)?',
      'Derive the four terms in a 2D prefix-sum rectangle query.',
      'Why mark a BFS cell visited when it is enqueued?',
      'How would you reduce the space of a grid DP to O(cols)?'
    ],
    learningOutcomes: ["Index rectangular and ragged arrays safely using independent row/column bounds.","Implement traversal and coordinate transformations with explicit dimension changes.","Choose matrix-search strategy from the actual sortedness guarantee.","Derive 2D prefix-sum inclusion-exclusion for rectangle queries.","Model grids as graphs or DP states when movement/path constraints require it."],
    prerequisites: ["One-dimensional arrays and nested loops.","Coordinate pairs and boundary checks.","Prefix sums and BFS/DFS basics."],
    deepDive: ["For a rectangular matrix, rows=matrix.length and columns=rows==0?0:matrix[0].length. Ragged arrays require checking each row's own length.","Transpose maps old (r,c) to new (c,r), swapping dimensions. Clockwise rotation of an R×C matrix produces C×R coordinates (c,R-1-r).","A flattened binary search is valid only when rows are globally ordered such that each row's first value exceeds the previous row's last. Row-and-column sorted matrices support staircase search instead.","Define prefix[r+1][c+1] as the sum over rows [0,r] and columns [0,c]. Rectangle [r1,r2)×[c1,c2) is P[r2][c2]-P[r1][c2]-P[r2][c1]+P[r1][c1].","A grid becomes a graph when cells are vertices and legal moves are edges. BFS gives shortest move count in unweighted grids; DFS handles reachability; DP handles acyclic movement dependencies.","In-place transpose/rotation has square-matrix constraints; rectangular transformations usually require a new array or a more complex cycle permutation."],
    correctness: ["Traversal correctness follows from visiting every valid coordinate exactly once under the specified row/column bounds.","Coordinate-transform correctness can be checked by mapping corners and proving the transform is bijective over the new dimensions.","Prefix-sum inclusion-exclusion adds the desired rectangle once while subtracting the two excess strips and adding back their overlap."],
    implementationSteps: ["State rectangular versus ragged input contract and empty-matrix behavior.","Use rows for row loops and columns for column loops; check bounds before indexing.","Write coordinate transforms algebraically and verify all four corners.","Choose search algorithm from global sortedness versus per-row/column sortedness.","Build prefix dimensions (R+1)×(C+1) and use half-open rectangle boundaries.","For grid traversal, mark visited before enqueue/push to prevent duplicate work.","Test zero rows, zero columns, non-square, ragged, one-row and one-column cases."],
    codeExamples: [{"language":"Java 21","title":"2D prefix sum rectangle query","code":"static long[][] buildPrefix(int[][] a) {\\n    int rows = a.length, cols = rows == 0 ? 0 : a[0].length;\\n    long[][] p = new long[rows + 1][cols + 1];\\n    for (int r = 0; r < rows; r++) {\\n        for (int c = 0; c < cols; c++) {\\n            p[r + 1][c + 1] = a[r][c] + p[r][c + 1] + p[r + 1][c] - p[r][c];\\n        }\\n    }\\n    return p;\\n}\\nstatic long sum(long[][] p, int r1, int c1, int r2, int c2) {\\n    return p[r2][c2] - p[r1][c2] - p[r2][c1] + p[r1][c1];\\n}","explanation":"The query uses half-open coordinates [r1,r2)×[c1,c2). Build O(RC), query O(1), storage O(RC). Assumes a rectangular matrix."}],
    traceExercises: ["Map every coordinate of a 2×3 matrix through clockwise rotation.","Compute prefix values and query rectangle [1,3)×[0,2) in a small matrix.","Trace staircase search from the top-right corner of a row/column-sorted matrix."],
    realWorldApplications: ["Image processing and pixel grids.","Spreadsheet and financial range aggregation.","Maps, mazes and board-game movement.","Scientific and geographic raster data."],
    assessment: ["Explain why row and column counts must be treated independently.","Derive the clockwise rotation coordinate formula for R×C.","State the exact condition for flattened binary search.","Derive 2D prefix rectangle inclusion-exclusion.","Choose BFS versus DP for two different grid movement problems."],
    revisionPrompts: ["Recreate 2D prefix query formula without notes.","Test coordinate transforms on a non-square matrix.","After two days, implement spiral traversal and staircase search.","After one week, explain when a grid is a graph and when it is a DP table."]
  },

  {
    id: 'queue-deep-dive',
    title: '16. Queue, Deque & Circular Queue',
    sourcePages: [7],
    promise: 'Understand FIFO processing, queue implementations, circular buffers and when a deque is more useful than a basic queue.',
    mentalModel: 'A queue is a line with two controlled ends: new work joins at the rear and the oldest eligible work leaves at the front. The invariant is ordering by arrival, unless the problem explicitly defines priorities or both-end operations.',
    concepts: [
      'FIFO means first-in, first-out: enqueue adds at the rear; dequeue removes from the front; peek reads the front without removing it.',
      'An array queue with a moving front index avoids shifting every remaining element after dequeue, but needs compaction or a circular-buffer strategy to reuse freed slots.',
      'A circular queue treats a fixed array as a ring. Advance an index with (index + 1) % capacity; track size explicitly or reserve one empty slot to distinguish full from empty.',
      'A linked-list queue keeps head and tail references: enqueue at tail and dequeue at head are O(1) when both references are maintained.',
      'A deque supports insertion and removal at both ends; it is useful for sliding-window maximum, 0-1 BFS and monotonic queue patterns.',
      'A priority queue is not FIFO: removal follows priority ordering and is commonly implemented with a heap.',
      'Breadth-first search uses a FIFO queue so nodes are processed in nondecreasing distance in an unweighted graph.',
      'In Java, ArrayDeque is a strong default for ordinary queue/deque operations; PriorityQueue is for priority ordering.'
    ],
    recognition: [
      'The prompt says process tasks in arrival order, level by level, or in waves.',
      'You need the shortest number of edges in an unweighted graph: use BFS with a queue.',
      'A fixed-capacity producer/consumer buffer must reuse storage without shifting elements.',
      'A sliding-window maximum needs to add at the right and discard expired candidates from the left.',
      'The problem requires both-end operations; consider a deque rather than forcing a plain queue.'
    ],
    method: [
      'Define the queue contract: which end receives, which end removes, whether capacity is bounded and what empty/full behavior means.',
      'Choose an implementation from the required operations: ArrayDeque, linked list, circular array or heap for priority order.',
      'For a circular array, maintain head and size. The rear insertion slot is (head + size) % capacity; after removal, head becomes (head + 1) % capacity.',
      'Check empty and full before mutating state. Decide whether invalid operations return a sentinel, throw, or are prevented by the caller.',
      'For BFS, mark a vertex visited when it is enqueued—not when dequeued—to prevent duplicate queue entries.',
      'For a monotonic deque, remove dominated elements from the back, then expired indices from the front, and read the best candidate at the front.'
    ],
    workedExample: [
      'Circular queue, capacity 4: enqueue A, B, C. The logical order is [A,B,C], head=0 and size=3.',
      'Dequeue A: return A, set head=(0+1)%4=1 and size=2. The freed physical slot at index 0 can be reused.',
      'Enqueue D and E: D uses (1+2)%4=3; E uses (1+3)%4=0. The physical array wrapped, but logical order is [B,C,D,E].',
      'The queue is full because size=4. Dequeue B moves head to 2; enqueue F uses (2+3)%4=1. Logical order becomes [C,D,E,F].',
      'Invariant: the queue contains exactly size elements, and the element at (head+i)%capacity is the i-th logical element for 0 <= i < size.'
    ],
    complexity: [
      'ArrayDeque or linked-list enqueue, dequeue and peek: O(1) amortized/constant under the usual implementation contract.',
      'Circular-array enqueue and dequeue: O(1); storage O(capacity).',
      'A naive array queue that shifts all remaining elements on dequeue has O(n) dequeue cost.',
      'Priority queue offer and poll: O(log n); peek: O(1); bottom-up heap construction: O(n).',
      'BFS with adjacency lists: O(V+E) time and O(V) auxiliary space including visited state and queue.'
    ],
    pitfalls: [
      'Confusing a queue with a priority queue; FIFO order and priority order are different contracts.',
      'Using array remove-at-zero repeatedly and accidentally making dequeue O(n).',
      'Failing to distinguish empty from full in a circular buffer when head equals tail; track size or reserve a slot.',
      'Forgetting modulo wraparound or mishandling negative remainder values.',
      'Marking BFS nodes visited only after dequeue, which allows duplicate enqueues.',
      'Removing the wrong end of a deque in a monotonic-queue solution.',
      'Assuming ordinary BFS gives shortest paths in weighted graphs with differing edge weights.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Implement a queue with enqueue, dequeue, peek, isEmpty and size using a linked list.', goal: 'Maintain head and tail correctly, including empty and one-element transitions.' },
      { level: 'Core', task: 'Implement a circular queue with a fixed array and wraparound indices.', goal: 'Prove the head/size invariant and handle full and empty boundaries.' },
      { level: 'Core', task: 'Binary Tree Level Order Traversal and Number of Recent Calls.', goal: 'Use FIFO order to process levels or a rolling time window.' },
      { level: 'Challenge', task: 'Sliding Window Maximum with a deque.', goal: 'Maintain decreasing candidate values and expire indices safely.' },
      { level: 'Transfer', task: 'Compare BFS, 0-1 BFS and Dijkstra on graphs with different edge-weight assumptions.', goal: 'Choose the frontier data structure from the edge-weight model.' }
    ],
    interviewChecks: [
      'Why is ArrayDeque generally preferred over repeatedly removing index zero from an array-backed list?',
      'How do you distinguish full and empty states in a circular queue?',
      'Why should BFS mark a node visited when it is enqueued?',
      'When is a deque required instead of a normal queue?',
      'Why does ordinary BFS not guarantee shortest weighted paths when edge weights differ?',
      'What invariant proves circular queue order after wraparound?'
    ],
    learningOutcomes: ["Implement FIFO queue operations with array, linked-list and circular-buffer representations.","Derive head/tail/size invariants and distinguish full from empty states.","Choose deque for two-ended and monotonic-window problems.","Explain amortized behavior and BFS queue ordering.","Handle capacity, wraparound and empty-queue edge cases."],
    prerequisites: ["Array indexing and modulo.","Linked-list head/tail references.","BFS and basic graph traversal."],
    deepDive: ["A queue's abstract contract is FIFO, independent of implementation. Enqueue adds at rear; dequeue removes front; peek reads the oldest item.","A moving-front array queue avoids shifting on each removal but eventually needs compaction or circular reuse. A circular queue maps indices modulo capacity.","With head and size, the rear insertion slot is (head+size)%capacity. After removal, head=(head+1)%capacity and size decreases. Size explicitly distinguishes empty and full when capacity is fixed.","A linked queue needs both head and tail references for O(1) enqueue and dequeue. Removing the final item must set tail to null as well as head.","A deque supports both-end insertion/removal. Monotonic deque algorithms store candidate indices and remove expired indices from the front and dominated indices from the back.","BFS uses FIFO to process vertices by nondecreasing distance. Marking visited when enqueued ensures each vertex enters the queue once.","A priority queue is not a FIFO queue. It removes by priority, commonly with O(log n) insertion and removal using a heap."],
    correctness: ["Circular-buffer invariant: size is between zero and capacity; logical element k is stored at (head+k)%capacity.","Enqueue preserves order by writing at (head+size)%capacity before increasing size.","Dequeue preserves order by reading head, advancing it modulo capacity and decreasing size.","BFS correctness follows from FIFO frontier order: every distance-d vertex is processed before any distance-(d+1) vertex."],
    implementationSteps: ["Choose bounded/unbounded capacity and specify overflow behavior.","Choose array, circular buffer, linked list or standard deque according to operation needs.","For circular buffer, maintain head and size consistently and compute tail from both.","For linked queue, update both head and tail when queue transitions empty/nonempty.","For BFS, mark visited when enqueueing, not after dequeueing.","For sliding-window deque, store indices and state the monotonic invariant.","Test wraparound, full/empty, singleton removal, repeated enqueue/dequeue and duplicate values."],
    codeExamples: [{"language":"Java 21","title":"Fixed-capacity circular queue","code":"static final class CircularQueue {\\n    private final int[] data; private int head = 0, size = 0;\\n    CircularQueue(int capacity) {\\n        if (capacity <= 0) throw new IllegalArgumentException();\\n        data = new int[capacity];\\n    }\\n    boolean offer(int value) {\\n        if (size == data.length) return false;\\n        data[(head + size) % data.length] = value; size++; return true;\\n    }\\n    int poll() {\\n        if (size == 0) throw new NoSuchElementException();\\n        int value = data[head]; head = (head + 1) % data.length; size--; return value;\\n    }\\n}","explanation":"Uses head plus size to distinguish full and empty. Offer/poll are O(1); storage is O(capacity). A full queue rejects offer without overwriting existing values."}],
    traceExercises: ["Use capacity 3: enqueue 10,20,30; dequeue twice; enqueue 40,50; show head, size and physical array after each step.","Compare linked queue head/tail after removing its only element.","Trace BFS and record queue contents by distance layer."],
    realWorldApplications: ["Producer-consumer buffers and bounded work queues.","Network packet and event processing.","BFS in maps, dependency graphs and social networks.","Rolling-window extrema in monitoring systems."],
    assessment: ["Derive circular queue tail index from head and size.","Explain how size distinguishes full from empty.","Implement queue operations and prove FIFO preservation.","Explain why BFS marks visited at enqueue time.","Choose queue versus deque versus priority queue for three use cases."],
    revisionPrompts: ["Draw the circular buffer and trace wraparound without code.","Re-derive the head/size invariant.","After two days, implement a bounded circular queue and test full/empty transitions.","After one week, compare queue, deque and priority queue by their ordering contract."]
  },
  {
    id: 'sorting-algorithms',
    title: '17. Sorting Algorithms & Stability',
    sourcePages: [13],
    promise: 'Compare elementary and efficient sorting methods by mechanics, stability, memory use and input characteristics.',
    mentalModel: 'Sorting is not just putting values in order. Each algorithm reduces disorder differently: exchange neighbours, select the next minimum, insert into a sorted prefix, divide and merge, partition around a pivot, or repeatedly extract from a heap. The right choice depends on input size, existing order, memory limits and stability requirements.',
    concepts: [
      'Bubble sort compares adjacent elements and swaps an out-of-order pair; after each pass, the largest remaining value reaches its final position.',
      'Selection sort finds the minimum in the unsorted suffix and places it next; it performs O(n²) comparisons but only O(n) swaps.',
      'Insertion sort grows a sorted prefix by shifting larger values right and inserting the next key; it is adaptive on small or nearly sorted inputs.',
      'Merge sort divides the array, recursively sorts both halves and merges them; its time is O(n log n) and array implementation usually needs O(n) auxiliary space.',
      'Quick sort partitions around a pivot and recursively sorts the partitions; average time is O(n log n), worst case O(n²).',
      'Heap sort builds a heap and repeatedly extracts the maximum or minimum; it gives O(n log n) worst-case time with O(1) auxiliary array space in an in-place implementation.',
      'Stability preserves the relative order of records with equal keys. This matters when sorting structured records by multiple keys.',
      'In-place describes auxiliary storage, not whether the algorithm mutates input. State the convention when comparing implementations.',
      'Comparison sorts have an Ω(n log n) lower bound in the general comparison model; non-comparison methods rely on assumptions about key representation.'
    ],
    recognition: [
      'Small input or nearly sorted input can make insertion sort a practical choice.',
      'A guaranteed O(n log n) upper bound is needed and extra memory is acceptable: consider merge sort.',
      'Worst-case O(n log n) with in-place array storage is important: consider heap sort.',
      'Average speed and practical cache behavior matter, and pivot strategy can be controlled: consider quick sort.',
      'Equal-key record order must be retained: choose a stable implementation or add an explicit tie-break key.',
      'The task asks for only the k smallest/largest values; a heap or selection approach may avoid fully sorting all n values.'
    ],
    method: [
      'Clarify ascending/descending order, duplicate handling, stability requirements, mutation constraints and whether input may already be partially sorted.',
      'Use the simplest correct baseline, then compare its growth rate with the input constraint.',
      'For bubble, selection and insertion, trace the sorted and unsorted regions after each outer iteration.',
      'For merge sort, prove each recursive half is sorted before merging and that merge chooses the smallest remaining head.',
      'For quick sort, state the exact partition invariant and ensure recursive ranges strictly shrink.',
      'For heap sort, verify the heap invariant after every extraction and distinguish zero-based child indices 2*i+1 and 2*i+2.',
      'Benchmark only after correctness tests; compare random, sorted, reverse-sorted, duplicate-heavy and nearly sorted inputs.'
    ],
    workedExample: [
      'Insertion sort on [5,2,4,1]: start with sorted prefix [5]. Insert 2 by shifting 5 right, giving [2,5,4,1].',
      'Insert 4: shift 5 right and place 4, giving [2,4,5,1]. Insert 1: shift 5, 4 and 2, giving [1,2,4,5].',
      'Invariant after pass i: positions 0 through i are sorted and contain exactly the original first i+1 values.',
      'For merge sort, [5,2] becomes [2,5] and [4,1] becomes [1,4]; merging the sorted halves produces [1,2,4,5].',
      'For quick sort, do not assume a pivot gives balanced partitions. A pivot that repeatedly leaves one empty side causes recursion depth O(n).'
    ],
    complexity: [
      'Bubble sort: O(n²) average/worst; O(n) best with early exit; O(1) auxiliary space; stable if equal items are not swapped.',
      'Selection sort: O(n²) comparisons in all cases; O(1) auxiliary space; typically unstable.',
      'Insertion sort: O(n²) average/worst and O(n) best on sorted input; O(1) auxiliary space; stable if equal items are not shifted past.',
      'Merge sort: O(n log n) best/average/worst; O(n) auxiliary array space; stable with left-first tie handling.',
      'Quick sort: O(n log n) average, O(n²) worst; recursion stack O(log n) average and O(n) worst; not generally stable.',
      'Heap sort: O(n log n) best/average/worst; O(1) auxiliary array space for iterative in-place heap sort; unstable.'
    ],
    pitfalls: [
      'Calling an algorithm stable without checking how equal keys are handled in the implementation.',
      'Assuming quick sort is always O(n log n); adversarial pivots can produce O(n²).',
      'Forgetting to advance one side correctly while merging two sorted halves.',
      'Changing stability with careless <= versus < comparisons in insertion or merge logic.',
      'Building a heap by repeated insertion when bottom-up heapify can be O(n).',
      'Ignoring allocation, cache locality, recursion depth and input distribution when comparing algorithms.',
      'Calling an algorithm O(1) space while omitting its recursion stack or temporary arrays.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Trace bubble, selection and insertion sort on the same short array.', goal: 'Identify each algorithm’s sorted region and comparison/swap behavior.' },
      { level: 'Core', task: 'Implement insertion sort and merge sort in Java.', goal: 'Preserve stability and test empty, singleton, duplicate and sorted inputs.' },
      { level: 'Core', task: 'Implement quick sort with a documented partition invariant.', goal: 'Handle duplicates and ensure recursive ranges shrink.' },
      { level: 'Challenge', task: 'Implement heap sort and compare it with merge sort.', goal: 'Prove heap restoration after extraction and account for memory.' },
      { level: 'Transfer', task: 'Sort records by two keys while preserving original order for equal keys.', goal: 'Explain when stability is required and how stable multi-key ordering works.' }
    ],
    interviewChecks: [
      'Why is insertion sort often effective on nearly sorted data?',
      'Which listed algorithms are stable in their standard forms, and which implementation details matter?',
      'Why can quick sort degrade to O(n²)?',
      'How does bottom-up heap construction achieve O(n)?',
      'When would you choose merge sort over heap sort?',
      'What assumptions are behind the comparison-sorting lower bound?'
    ],
    learningOutcomes: [
      'Compare bubble, selection, insertion, merge, quick and heap sort by time, memory, stability and adaptiveness.',
      'Explain stability using records with equal keys and identify the exact comparison rule that preserves it.',
      'Trace sorted-region and partition invariants for elementary and divide-and-conquer sorts.',
      'Derive merge sort O(n log n) and quick sort average/worst-case bounds.',
      'Choose an algorithm based on constraints rather than memorizing a single “best sort”.',
      'Account for recursion stack, temporary arrays, mutation and comparison-model assumptions.'
    ],
    prerequisites: [
      'Understand arrays, indexing, loops and recursion.',
      'Know logarithms and recurrence intuition for divide-and-conquer algorithms.',
      'Understand comparator ordering and duplicate keys.',
      'Review heap shape/order before heap sort.'
    ],
    deepDive: [
      'Bubble sort repeatedly swaps adjacent inversions; after pass p, the largest p values are fixed at the right. An early-exit flag makes already sorted input O(n), but average and worst cases remain O(n²).',
      'Selection sort scans the unsorted suffix for its minimum and performs at most n-1 swaps. It still performs O(n²) comparisons even on sorted input and is generally unstable because a long-distance swap can reorder equal records.',
      'Insertion sort maintains a sorted prefix. It shifts only values greater than the inserted key, so equal values retain order. Its work is proportional to the number of inversions and is excellent for small or nearly sorted arrays.',
      'Merge sort divides until single-element ranges, then merges two sorted halves. At each recursion level total merge work is O(n), and there are O(log n) levels, giving O(n log n) time and O(n) auxiliary array space.',
      'A stable merge chooses from the left half when keys compare equal. Choosing from the right on equality can reverse the original relative order of equal-key records.',
      'Quick sort partitions around a pivot. Average partition balance yields O(n log n), but repeated highly unbalanced partitions produce O(n²) time and O(n) recursion depth. Duplicate-heavy input benefits from three-way partitioning.',
      'Heap sort first builds a heap and then repeatedly moves the root to its final array position. It gives O(n log n) worst-case time and O(1) auxiliary array space when implemented iteratively, but is not stable.',
      'The comparison-sorting Ω(n log n) lower bound applies to general comparison-based sorting of distinct keys. Counting/radix methods can beat it only by using assumptions about key representation and range.',
      'In-place and stable are independent properties. A stable algorithm may need O(n) temporary storage; an in-place algorithm may reorder equal keys.',
      'Library sort implementations may use hybrid strategies and implementation-specific guarantees. When relying on a library, distinguish the documented contract from a textbook algorithm’s mechanics.'
    ],
    correctness: [
      'Insertion invariant: before inserting index i, the prefix [0,i) is sorted and contains exactly the original first i elements; shifting larger values and placing the key preserves that property.',
      'Merge invariant: before each merge step, the output prefix contains the smallest consumed elements from both halves in sorted order; selecting the smaller current head preserves sortedness.',
      'Stable-merge invariant: when equal keys are available from both halves, taking the left item first preserves their original cross-half order.',
      'Quick-sort partition invariant: after partitioning, every item in the left region satisfies the pivot-side relation and every item in the right region satisfies the opposite relation; recursive ranges exclude the settled pivot region.',
      'Heap-sort invariant: the suffix beyond the active heap boundary is in final sorted order, and the active prefix satisfies heap order before the next extraction.',
      'Termination: each recursive sort call operates on strictly smaller ranges; each merge consumes one item from a half on every iteration.'
    ],
    implementationSteps: [
      'Record whether input may be mutated, whether stability is required and whether auxiliary memory is limited.',
      'Choose a simple baseline and estimate n² versus n log n work for the actual constraints.',
      'For insertion sort, shift only strictly greater elements to preserve equal-key order.',
      'For merge sort, use half-open ranges [left,right), ensure each recursive call shrinks and take from the left on ties.',
      'For quick sort, document the partition convention and test duplicate-heavy and adversarial pivot inputs.',
      'For heap sort, verify the active heap boundary and sift-down child selection.',
      'Include recursion stack and temporary buffers in space analysis.',
      'Test empty, singleton, sorted, reverse-sorted, all-equal, duplicate-heavy and extreme-value arrays.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Stable merge sort for integer arrays', code: `static void stableMergeSort(int[] values) {
    if (values.length < 2) return;
    int[] buffer = new int[values.length];
    mergeSort(values, buffer, 0, values.length);
}

static void mergeSort(int[] values, int[] buffer, int left, int right) {
    if (right - left < 2) return;
    int middle = left + (right - left) / 2;
    mergeSort(values, buffer, left, middle);
    mergeSort(values, buffer, middle, right);

    int i = left, j = middle, out = left;
    while (i < middle && j < right) {
        if (values[i] <= values[j]) buffer[out++] = values[i++];
        else buffer[out++] = values[j++];
    }
    while (i < middle) buffer[out++] = values[i++];
    while (j < right) buffer[out++] = values[j++];
    System.arraycopy(buffer, left, values, left, right - left);
}`, explanation: 'Half-open ranges avoid ambiguous endpoints. Taking from the left on equality is the stability rule. O(n log n) time, O(n) buffer and O(log n) recursion stack.' }
    ],
    traceExercises: [
      'Insertion trace: [5,2,4,1]. Show the sorted prefix and every shift after each pass.',
      'Merge trace: merge [2,5,7] and [1,5,8]. Show the output and explain which 5 is copied first for stability.',
      'Quick-sort trace: use a pivot on [3,3,3,3]. Explain how a two-way partition can degrade and why three-way partition helps.',
      'Heap-sort trace: show the active heap and sorted suffix after each root extraction.'
    ],
    realWorldApplications: [
      'Stable multi-key sorting of records, such as sorting employees by department and then preserving salary order.',
      'Database query engines choose sort strategies based on memory, input order and external-storage constraints.',
      'Small nearly sorted batches benefit from insertion-style algorithms.',
      'External merge sort processes datasets larger than memory using sorted runs and sequential merging.',
      'Top-K tasks often use heaps or selection instead of fully sorting every item.'
    ],
    assessment: [
      'Compare all six listed algorithms by best, average and worst time, auxiliary space and stability.',
      'Prove the insertion-sort prefix invariant and explain why shifting only greater elements preserves stability.',
      'Derive merge sort O(n log n) time and identify its auxiliary storage.',
      'Give a quick-sort input/pivot pattern that produces O(n²) work.',
      'Explain why heap sort is in-place but unstable.',
      'State the assumptions behind the comparison-sorting lower bound and when non-comparison sorts differ.',
      'Write tests that detect instability in a record-sorting implementation.'
    ],
    revisionPrompts: [
      'Draw the sorted/unsorted regions for bubble, selection and insertion sort from memory.',
      'Re-derive the merge recurrence and the left-first tie rule.',
      'Explain quick-sort worst case and heap-sort memory trade-off without notes.',
      'After two days, implement stable merge sort and test duplicate records.',
      'After one week, choose a sort for three scenarios and defend the choice using constraints.',
      'Explain why “in-place” does not imply “stable”.'
    ]
  },
  {
    id: 'searching-algorithms',
    title: '18. Searching: Linear, Binary & Boundaries',
    sourcePages: [14],
    promise: 'Select a search method from ordering guarantees and reason precisely about loop boundaries and duplicates.',
    mentalModel: 'Searching eliminates candidates while preserving the possibility that the answer remains. Linear search removes one candidate at a time. Binary search removes roughly half only when ordering or a monotonic property justifies that elimination.',
    concepts: [
      'Linear search checks candidates sequentially and works on unsorted collections; scanning left to right returns the first matching index.',
      'Binary search requires a sorted range or monotonic predicate. Its O(log n) time comes from halving the remaining candidate interval.',
      'Closed interval [low,high] and half-open interval [low,high) are both valid; mixing update rules causes off-by-one bugs.',
      'For a closed interval, use while (low <= high), discard mid with low=mid+1 or high=mid-1, and compute mid as low+(high-low)/2.',
      'Lower bound finds the first index with value >= target; upper bound finds the first index with value > target. Their difference counts duplicates.',
      'An arbitrary-match search and a first-occurrence search are different contracts; duplicates require an explicit boundary search.',
      'Binary search over an answer space is related but distinct: it searches a monotonic feasibility predicate rather than array values.'
    ],
    recognition: [
      'The collection is unsorted and modest in size: linear search is simple and correct.',
      'The collection is sorted and supports random access: binary search reduces comparisons to O(log n).',
      'The task asks for first/last occurrence, insertion position or count of a value in sorted data.',
      'A predicate changes once from false to true or true to false across an ordered domain.',
      'A linked list lacks O(1) random access, so textbook array binary search does not provide its usual O(log n) total time.'
    ],
    method: [
      'Write the exact contract: any match, first match, last match, lower bound, upper bound or insertion position.',
      'Choose one interval convention and write its invariant before coding.',
      'For a closed interval, initialise high=n-1; while low<=high; after a non-answer mid, remove it with mid+1 or mid-1.',
      'For lower bound, if a[mid]>=target, move high left; otherwise move low right.',
      'For upper bound, move high left only when a[mid]>target; otherwise move low right.',
      'Test empty, one-element, target below minimum, target above maximum, all-equal, duplicates at both ends and absent target.'
    ],
    workedExample: [
      'Find first occurrence of 4 in [1,2,4,4,4,7,9]. Start low=0, high=6 and candidate=-1.',
      'mid=3 gives 4: record candidate=3 and continue left with high=2. mid=1 gives 2: move low=2. mid=2 gives 4: update candidate=2 and continue left.',
      'The loop ends with candidate=2. The search returns the leftmost matching index, not merely any occurrence.',
      'Lower bound can return n when every element is smaller than target; do not index the array without checking that boundary.'
    ],
    complexity: [
      'Linear search: O(n) worst-case time and O(1) auxiliary space.',
      'Binary search on a random-access sorted array: O(log n) time and O(1) iterative auxiliary space.',
      'Recursive binary search: O(log n) call-stack space.',
      'Lower bound and upper bound each take O(log n); counting duplicates by their difference remains O(log n).',
      'Sorting an unsorted array solely for one search usually costs O(n log n); linear search may be better unless repeated queries justify preprocessing.'
    ],
    pitfalls: [
      'Using binary search without a sorted array or monotonic predicate.',
      'Mixing closed and half-open interval conditions or updates.',
      'Using mid=(low+high)/2 where the sum can overflow; prefer low+(high-low)/2.',
      'Returning immediately on equality when the task asks for first or last occurrence.',
      'Reading a[mid] when low==n after a lower-bound search.',
      'Assuming binary search on a linked list is O(log n) when reaching each midpoint requires traversal.',
      'Sorting once for a single query without accounting for preprocessing cost.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Implement linear search and iterative binary search.', goal: 'State preconditions and test missing targets and boundary indices.' },
      { level: 'Core', task: 'Find First and Last Position of Element in Sorted Array.', goal: 'Implement two boundary searches rather than relying on an arbitrary match.' },
      { level: 'Core', task: 'Search Insert Position and Count Occurrences in a Sorted Array.', goal: 'Use lower bound and upper bound consistently.' },
      { level: 'Challenge', task: 'Search in Rotated Sorted Array and Find Minimum in Rotated Sorted Array.', goal: 'Identify which half retains a sorted-order invariant.' },
      { level: 'Transfer', task: 'Search a 2D matrix under two different ordering guarantees.', goal: 'Choose flattened binary search only for globally sorted row-major order; use staircase search for row/column monotonicity.' }
    ],
    interviewChecks: [
      'What is the invariant of your chosen binary-search interval?',
      'How do lower bound and upper bound differ?',
      'Why can binary search return n as a valid insertion position?',
      'When is sorting before searching worthwhile?',
      'Why is binary search not automatically O(log n) on a linked list?',
      'How would you prove that each loop iteration strictly shrinks the candidate interval?'
    ],
    learningOutcomes: [
      'Choose linear or binary search based on ordering, access pattern and preprocessing cost.',
      'Implement lower bound and upper bound with a consistent half-open interval invariant.',
      'Derive first occurrence, insertion position and duplicate count from boundary searches.',
      'Prove binary search terminates because the candidate interval strictly shrinks.',
      'Avoid overflow and out-of-range access in midpoint and boundary calculations.',
      'Explain why random access is part of the usual O(log n) binary-search cost.'
    ],
    prerequisites: [
      'Understand sorted arrays, array indices and half-open intervals.',
      'Know loop invariants and logarithmic growth.',
      'Be comfortable with duplicates and insertion positions.',
      'Review binary search on answer for monotonic predicates over non-array domains.'
    ],
    deepDive: [
      'Linear search needs no ordering and checks at most n values. It is often the best choice for a single lookup in an unsorted collection because sorting first would add O(n log n) preprocessing.',
      'Binary search works because sorted order or a monotonic predicate lets one comparison eliminate an entire half of the remaining candidates.',
      'For a half-open interval [low,high), maintain that the answer boundary is within the interval or at high; initialise [0,n), compute mid=low+(high-low)/2 and continue while low<high.',
      'Lower bound is the first index i where a[i]>=target. If a[mid]>=target, the boundary is at mid or earlier, so high=mid; otherwise it is after mid, so low=mid+1.',
      'Upper bound is the first index i where a[i]>target. Its comparison differs only at equality: equal values remain on the left side of the candidate boundary.',
      'The number of occurrences of target in sorted data is upperBound(target)-lowerBound(target). Either boundary may equal n, which is a valid insertion position but not a valid array index.',
      'A closed interval [low,high] is also valid, but its loop condition and updates differ. Do not mix high=mid with a closed interval when mid may not move.',
      'Midpoint low+(high-low)/2 avoids overflow from low+high when indices are large. In languages with unsigned or unusual integer semantics, still verify the chosen type.',
      'Binary search on a linked list does not achieve the usual O(log n) time because finding each midpoint requires traversal. The random-access array assumption is essential.',
      'Repeated queries on unsorted data may justify sorting once and then using binary search; include O(n log n) preprocessing and any mapping needed to recover original indices.',
      'Rotated-array search works by identifying which half is sorted, then checking whether the target lies within that half’s value range. Duplicates can make the sorted half ambiguous and degrade worst-case time.',
      'A monotonic predicate search uses the same boundary mechanics but the predicate, not array equality, defines the first true/false boundary.'
    ],
    correctness: [
      'Lower-bound invariant: all indices below low have values < target; all indices at or above high have values >= target. The first qualifying index remains inside [low,high).',
      'Upper-bound invariant: all indices below low have values <= target; all indices at or above high have values > target.',
      'Each iteration sets either low=mid+1 or high=mid, strictly reducing the half-open interval while preserving the boundary.',
      'When low==high, the interval is empty and that index is the unique boundary satisfying the invariant.',
      'Occurrence-count correctness follows because matching values occupy the contiguous sorted range [lowerBound,upperBound).',
      'The algorithm never reads outside the array because mid is computed only while low<high and high<=n; a returned n is handled as a boundary, not dereferenced.'
    ],
    implementationSteps: [
      'Write the result contract first: any index, first index, last index, lower bound, upper bound or count.',
      'Choose half-open [low,high) and initialise low=0, high=n.',
      'Compute mid as low+(high-low)/2.',
      'For lower bound, move high=mid when a[mid]>=target; otherwise move low=mid+1.',
      'For upper bound, move high=mid when a[mid]>target; otherwise move low=mid+1.',
      'Return the boundary even when it equals n; check before indexing it.',
      'For a single unsorted query, compare linear scan cost with sorting plus binary search.',
      'Test empty, singleton, all-equal, duplicates, absent targets and targets outside the data range.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Lower bound, upper bound and occurrence count', code: `static int lowerBound(int[] values, int target) {
    int low = 0, high = values.length;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (values[mid] >= target) high = mid;
        else low = mid + 1;
    }
    return low;
}

static int upperBound(int[] values, int target) {
    int low = 0, high = values.length;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (values[mid] > target) high = mid;
        else low = mid + 1;
    }
    return low;
}

static int countOccurrences(int[] values, int target) {
    return upperBound(values, target) - lowerBound(values, target);
}`, explanation: 'Both searches use half-open [low,high) and return a boundary in [0,n], including n. Each iteration halves the interval, giving O(log n) time and O(1) auxiliary space.' }
    ],
    traceExercises: [
      'Lower-bound trace: [1,2,4,4,4,7,9], target=4. Record low, high and mid until convergence.',
      'Upper-bound trace: use the same array and target. Identify the exact comparison that differs.',
      'Boundary trace: search for 10 in [1,2,4]. Explain why returning 3 is valid but reading values[3] is not.',
      'Preprocessing decision: compare one linear query with 1000 queries on an initially unsorted array; include sorting cost.'
    ],
    realWorldApplications: [
      'Database indexes locate the first key at or above a requested value.',
      'Autocomplete finds the range of sorted terms sharing a prefix.',
      'Scheduling and capacity planning find insertion positions in sorted timelines.',
      'Version and release selection find the first compatible build under a monotonic constraint.',
      'Time-series analysis locates the first sample at or after a timestamp.'
    ],
    assessment: [
      'Implement lower bound and upper bound and explain their different equality comparisons.',
      'Prove both interval invariants and show that each loop iteration strictly shrinks the range.',
      'Explain why n is a valid boundary result and how callers must guard it.',
      'Compare one linear lookup against sorting plus repeated binary searches.',
      'Explain why binary search on a linked list does not provide O(log n) total time.',
      'Derive duplicate count from the two boundary positions.',
      'Test empty arrays, all-equal arrays, missing targets and extreme index arithmetic.'
    ],
    revisionPrompts: [
      'Write lower-bound and upper-bound invariants from memory.',
      'Explain the half-open interval and why high begins at n.',
      'After two days, implement first/last occurrence and count duplicates.',
      'After one week, compare binary search on a sorted array with searching a linked list.',
      'Derive the O(log n) bound from repeated halving.',
      'Explain how a monotonic predicate turns the same boundary search into answer-space search.'
    ]
  },
  {
    id: 'binary-search-on-answer',
    title: '19. Binary Search on the Answer',
    sourcePages: [15],
    promise: 'Turn optimisation problems into a monotonic yes/no decision and binary-search the smallest or largest feasible answer.',
    mentalModel: 'Do not binary-search the input array when the unknown is a numeric answer. Guess a candidate answer, ask whether it is feasible, and use the monotonic direction of feasibility to eliminate half of the answer range.',
    concepts: [
      'A feasibility function answers whether a candidate capacity, speed, time, distance or threshold satisfies every constraint.',
      'For minimisation, feasible answers often form a suffix: once a capacity is large enough, every larger capacity remains feasible. Search for first true.',
      'For maximisation, feasible answers often form a prefix: once a value is too large, every larger value remains infeasible. Search for last true.',
      'The search interval must be a proven lower and upper bound on the answer, not guessed constants.',
      'The feasibility check must be correct and usually cheaper than enumerating every possible answer.',
      'Total complexity is O(log R * C), where R is answer-range width and C is the cost of one feasibility check.',
      'Integer arithmetic matters: use overflow-safe midpoint formulas and safe ceiling division.'
    ],
    recognition: [
      'The question asks for minimum capacity, minimum speed, minimum time or maximum achievable threshold.',
      'A candidate answer can be validated by a greedy or counting simulation.',
      'If answer x is feasible, every answer greater than x is also feasible (or the reverse direction is provable).',
      'Brute force tries every integer answer, while a feasibility check can evaluate one candidate efficiently.'
    ],
    method: [
      'Define the answer variable and whether the task is first-true (minimise) or last-true (maximise).',
      'Prove monotonicity: explain why feasibility at x implies feasibility for all larger or smaller values.',
      'Derive low and high from constraints. For capacity, low can be max(item) and high can be sum(items).',
      'Write a pure can(mid) function that simulates the candidate without mutating shared input.',
      'Use a first-true or last-true binary-search template with a clear invariant and termination condition.',
      'Validate the returned boundary by checking the candidate and its adjacent integer when possible.'
    ],
    workedExample: [
      'Minimum ship capacity: weights=[1,2,3,4,5], D=3. Lower bound=max(weights)=5; upper bound=sum(weights)=15.',
      'For capacity 9, greedy packing gives [1,2,3] then [4,5], so 2 days are needed and 9 is feasible.',
      'For capacity 6, packing gives [1,2,3], [4], [5], so 3 days are needed and 6 is feasible.',
      'For capacity 5, packing gives [1,2], [3], [4], [5], so 4 days are needed and 5 is infeasible.',
      'Feasibility is monotonic: increasing capacity cannot increase required days. The smallest feasible capacity is 6.',
      'A check starts a new day only when currentLoad+weight exceeds capacity; preserve input order because shipment order is part of the constraint.'
    ],
    complexity: [
      'Let R=high-low+1 and C be feasibility-check cost. Binary search performs O(log R) checks, for O(C log R) total time.',
      'Shipping capacity: O(n log(sum(weights)-max(weights)+1)) time and O(1) extra space.',
      'Minimum eating speed: O(n log(maxPile)) time when each check sums required hours over n piles.',
      'Maximum minimum distance: sorting costs O(n log n), each greedy feasibility check O(n), and answer search O(log R).',
      'Use long for sums or products when constraints can exceed 32-bit integer range.'
    ],
    pitfalls: [
      'Failing to prove monotonicity; a binary-search template cannot rescue a non-monotonic predicate.',
      'Choosing low=0 when zero is impossible, or choosing high without proving it is a safe bound.',
      'Returning the last midpoint instead of the first feasible boundary for minimisation.',
      'Writing a feasibility check that changes input or carries state between calls.',
      'Using floor division where ceiling division is required.',
      'Overflow in sum bounds, products or midpoint calculation.',
      'Sorting inside every feasibility call when one pre-sort is enough.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Implement first-true and last-true binary search over a monotonic boolean predicate.', goal: 'Make the boundary invariant explicit and handle all-false/all-true ranges.' },
      { level: 'Core', task: 'Koko Eating Bananas and Capacity To Ship Packages Within D Days.', goal: 'Derive bounds and implement a linear feasibility check.' },
      { level: 'Core', task: 'Minimum Number of Days to Make m Bouquets.', goal: 'Convert a threshold into a count of consecutive feasible groups.' },
      { level: 'Challenge', task: 'Aggressive Cows / maximise minimum distance.', goal: 'Sort once and use a greedy placement feasibility predicate.' },
      { level: 'Transfer', task: 'Find the smallest threshold that satisfies a custom resource budget.', goal: 'Define monotonic predicate, prove direction and derive safe numeric bounds.' }
    ],
    interviewChecks: [
      'What exactly is being binary-searched: input values or a candidate answer?',
      'Prove why feasibility is monotonic for the problem you selected.',
      'How do you derive tight safe low and high bounds?',
      'Why is the answer returned by first-true different from the final midpoint?',
      'What is the cost of one feasibility check and the total complexity?',
      'Which intermediate values need 64-bit arithmetic?'
    ],
    learningOutcomes: [
      'Recognize optimization problems that can be expressed as a monotonic feasibility predicate.',
      'Distinguish first-true minimization from last-true maximization.',
      'Derive safe lower and upper bounds from input constraints.',
      'Implement a pure feasibility check and prove its correctness separately from the binary search.',
      'State the O(C log R) total complexity, including sorting/preprocessing and each check cost.',
      'Use overflow-safe arithmetic and correct ceiling division.'
    ],
    prerequisites: [
      'Understand lower/upper-bound binary search on sorted data.',
      'Know greedy scans and how to count groups, days or resource usage.',
      'Be comfortable with integer division, ceiling division and 64-bit sums.',
      'Understand that monotonic means one-way transition, not merely “usually increasing”.'
    ],
    deepDive: [
      'The unknown is a candidate answer such as capacity, speed, time or minimum distance. The algorithm asks a yes/no question about that candidate rather than searching the original array.',
      'For a minimization problem, feasible candidates often form false...false,true...true. The answer is the first true candidate. For maximization, candidates often form true...true,false...false and the answer is the last true.',
      'Monotonicity must be proved from the problem semantics. For shipping, increasing capacity cannot require more days under the same greedy packing order. For minimum speed, increasing speed cannot increase the hours required.',
      'Bounds must be safe and justified. Shipping capacity cannot be below the heaviest package and never needs to exceed the sum of all weights if at least one day is available.',
      'The feasibility function should be deterministic and side-effect free. It should not sort or mutate shared input during each binary-search iteration.',
      'For shipping capacity, scan weights in original order, start a new day only when adding the next package exceeds capacity, and reject if days used exceed D.',
      'The binary-search invariant for first true is that all values below low are false and all values at or above high are true; with a closed search over a proven feasible high, maintain low as infeasible and high as feasible.',
      'A safe midpoint is low+(high-low)/2. For first true, use mid and move high=mid when feasible, otherwise low=mid+1. The loop ends at the first feasible value.',
      'Ceiling division for positive a and b can be written a/b + (a%b==0 ? 0 : 1), avoiding a+b-1 overflow. Define behavior for zero and negative values separately.',
      'Total time is preprocessing plus O(log R) feasibility calls. If each call is O(n), total is O(n log R); if sorting is required once, add O(n log n).',
      'A feasibility function can itself use greedy reasoning. Its proof is separate: first prove the greedy check answers feasibility correctly, then prove binary search finds the boundary.',
      'If all candidates are feasible or none are feasible, boundary templates still need a documented contract. Ensure the derived high is feasible or return an explicit no-solution result.'
    ],
    correctness: [
      'Shipping feasibility invariant: after processing each prefix of packages, daysUsed and currentLoad describe the greedy earliest packing of that prefix under capacity C; starting a new day exactly when the next package would overflow minimizes the number of days.',
      'Monotonicity proof: any packing valid at capacity C remains valid at every capacity C2>=C, so feasible answers form a suffix.',
      'First-true invariant: every candidate below low is known infeasible and every candidate at or above high is known feasible; choosing mid and retaining the appropriate half preserves the boundary.',
      'Termination: each iteration strictly decreases high-low; when low==high, the unique remaining boundary is the minimum feasible capacity.',
      'Bounds correctness: max(weights) is necessary because no package can be split; sum(weights) is sufficient because all packages fit in one day at that capacity.',
      'Complexity correctness: at most ceil(log2(R)) boundary reductions occur and each feasibility scan visits n weights once, giving O(n log R) time after bounds are computed.'
    ],
    implementationSteps: [
      'Name the candidate answer and write the feasibility question in one sentence.',
      'Decide first true or last true and draw the false/true transition.',
      'Prove monotonicity from the constraints before writing binary search.',
      'Derive low and high mathematically; verify high is feasible when using first-true.',
      'Implement can(candidate) independently and test it on hand-worked candidates.',
      'Use long for totals and midpoint arithmetic when bounds may exceed int.',
      'Keep preprocessing outside the feasibility function.',
      'After search, validate the returned answer and its adjacent candidate when the domain permits.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Minimum ship capacity within D days', code: `static long minimumCapacity(int[] weights, int days) {
    if (weights.length == 0 || days <= 0) {
        throw new IllegalArgumentException("non-empty weights and positive days required");
    }
    long low = 0L, high = 0L;
    for (int weight : weights) {
        if (weight <= 0) throw new IllegalArgumentException("weights must be positive");
        low = Math.max(low, weight);
        high += weight;
    }

    while (low < high) {
        long capacity = low + (high - low) / 2;
        if (canShip(weights, days, capacity)) high = capacity;
        else low = capacity + 1;
    }
    return low;
}

static boolean canShip(int[] weights, int days, long capacity) {
    int usedDays = 1;
    long load = 0L;
    for (int weight : weights) {
        if (load + weight > capacity) {
            usedDays++;
            load = 0L;
        }
        load += weight;
        if (usedDays > days) return false;
    }
    return true;
}`, explanation: 'The search is first-true over [max(weight), sum(weight)]. The feasibility scan preserves package order and counts required days. O(n log(sum-max+1)) time and O(1) auxiliary space.' }
    ],
    traceExercises: [
      'For weights [1,2,3,4,5] and D=3, trace feasibility at capacities 5, 6, 9 and 15.',
      'Draw the false/true predicate over integer capacities 5 through 15 and identify the first true.',
      'For a minimization problem, show why setting high=mid on feasible and low=mid+1 on infeasible cannot skip the answer.',
      'Create an all-feasible and an all-infeasible predicate and explain which bound assumptions or no-solution checks are required.'
    ],
    realWorldApplications: [
      'Capacity planning: minimum machine or shipment capacity to meet a deadline.',
      'Rate limiting and throughput: minimum processing speed to complete a workload within a time budget.',
      'Manufacturing: minimum production rate or maximum allowed defect threshold.',
      'Network planning: maximize minimum separation or bandwidth allocation under constraints.',
      'Resource scheduling: find the smallest budget or time threshold that makes a plan feasible.'
    ],
    assessment: [
      'Explain the difference between searching an input array and searching a numeric answer domain.',
      'Prove monotonicity for shipping capacity and derive its safe bounds.',
      'Implement first-true binary search and state its invariant.',
      'Implement the shipping feasibility check and justify why greedy packing minimizes days for a fixed capacity.',
      'Derive total complexity when each feasibility check is O(n) and answer range width is R.',
      'Explain why sorting inside every feasibility call is wasteful when one pre-sort suffices.',
      'Test boundary candidates, one package, days=1, days>=n and sums near 32-bit limits.'
    ],
    revisionPrompts: [
      'Write first-true and last-true templates from memory and label their invariants.',
      'For a new optimization problem, write the feasibility predicate before writing any loop.',
      'Re-derive shipping lower and upper bounds and prove monotonicity.',
      'After two days, solve Koko Eating Bananas and compare its feasibility function with shipping.',
      'After one week, solve a maximize-minimum-distance problem and explain why its predicate direction is reversed.',
      'State the total complexity as preprocessing + number of checks × cost per check.'
    ]
  },
  {
    id: 'bit-manipulation',
    title: '20. Bit Manipulation & Binary Tricks',
    sourcePages: [16],
    promise: 'Reason about integer representations and use bitwise operations to encode flags, test parity and solve XOR-based problems.',
    mentalModel: 'An integer is represented by bits. Bitwise operations act on corresponding positions independently, so many operations become compact transformations of a fixed-width binary representation. Correctness depends on language integer width and signed-number rules.',
    concepts: [
      'AND (&) keeps a bit set only when both inputs have it; OR (|) sets a bit when either input has it; XOR (^) sets a bit when inputs differ.',
      'NOT (~) flips every bit in the fixed-width representation. For signed two’s-complement integers, ~x equals -x-1.',
      'Left shift (x << k) moves bits toward higher positions; right-shift behavior for negative values differs by language and operator.',
      'Check bit k with (x & (1 << k)) != 0; set with x | (1 << k); clear with x & ~(1 << k); toggle with x ^ (1 << k).',
      'The least significant set bit is isolated by x & -x for two’s-complement integer arithmetic, subject to width and overflow semantics.',
      'For nonnegative x, x & (x-1) removes its lowest set bit. Repeating this counts set bits in O(number of set bits).',
      'A positive power of two has exactly one set bit, so x>0 && (x & (x-1))==0.',
      'XOR is associative and commutative, with x^x=0 and x^0=x. This explains single-number patterns when other values occur in pairs.',
      'A bitmask can represent a subset of a small universe: bit i indicates whether item i is selected. This enables compact subset DP.'
    ],
    recognition: [
      'The task asks for parity, a power-of-two check, set-bit count or a particular bit flag.',
      'Every value appears twice except one, or pairs cancel under XOR.',
      'A small set of boolean features must be represented compactly as a mask.',
      'The problem asks for all subsets of n small-indexed elements and bitmask DP may be feasible.',
      'A repeated operation removes the lowest set bit or extracts a power-of-two factor.'
    ],
    method: [
      'Write the integer width and signedness assumption. Do not reason about an abstract infinite bit string when the language uses fixed-width integers.',
      'Convert a small example to binary and label bit positions from zero at the least significant bit.',
      'Apply the truth table for AND, OR and XOR one position at a time.',
      'For a bit test, build the mask with a sufficiently wide type before shifting; in Java use 1L when the target bit may exceed int width.',
      'For XOR cancellation, group equal values and apply x^x=0; verify that input multiplicities match the proof.',
      'For subset masks, define the mapping from element index to bit position and check maximum n against type width.',
      'Test zero, negative values, the highest supported bit and shift counts at or beyond type width according to the language contract.'
    ],
    workedExample: [
      'Set x=10, binary 1010. The lowest set bit is 0010; x & -x isolates 0010.',
      'Clear the lowest set bit: 1010 & 1001 = 1000. The number of set bits falls from two to one.',
      'Check bit 3: 1010 & 1000 = 1000, so bit 3 is set. Toggle bit 1: 1010 ^ 0010 = 1000.',
      'Single number: [4,1,2,1,2]. XOR all values: 4^1^2^1^2 = 4 because equal pairs cancel.',
      'Power of two: 8 is 1000 and 8&(8-1)=1000&0111=0; 10 is 1010 and 10&9=1010&1001=1000, not zero.'
    ],
    complexity: [
      'A fixed number of bitwise operations on a machine integer is O(1) time and O(1) extra space.',
      'Brian Kernighan set-bit counting runs O(k), where k is number of set bits; a fixed-width loop is O(W).',
      'XOR single-number scan: O(n) time and O(1) extra space.',
      'Enumerating all subsets by masks takes O(2^n) masks; processing each mask can add another O(n) factor.',
      'Bitmask DP commonly uses O(2^n) states, with transition cost depending on candidates per state.'
    ],
    pitfalls: [
      'Confusing logical operators (&&, ||) with bitwise operators (&, |).',
      'Using 1 << k when k may reach or exceed the width of a 32-bit int; use an appropriate wider type and validate shift counts.',
      'Assuming bitwise NOT produces a nonnegative value; signed fixed-width integers use two’s-complement representation.',
      'Applying XOR cancellation when values do not have the required multiplicities.',
      'Forgetting that Java right shift >> sign-extends while >>> zero-fills; other languages have their own signed-shift rules.',
      'Using a bitmask for a universe too large for the chosen integer type; use a bit set or another representation.',
      'Treating negative integers as if they had a finite, language-independent binary representation.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Check, set, clear and toggle the k-th bit of an integer.', goal: 'Draw the mask and verify the operation on positive and zero values.' },
      { level: 'Core', task: 'Single Number, Number of 1 Bits and Power of Two.', goal: 'Derive each solution from XOR or lowest-set-bit identities.' },
      { level: 'Core', task: 'Counting Bits for every value from 0 to n.', goal: 'Relate bit counts using x&(x-1) or x>>1.' },
      { level: 'Challenge', task: 'Single Number II and Single Number III.', goal: 'Use bit counts or a separating XOR bit and state multiplicity assumptions.' },
      { level: 'Transfer', task: 'Represent a small feature set as a bitmask and enumerate all subsets.', goal: 'Define index-to-bit mapping and justify the 2^n state space.' }
    ],
    interviewChecks: [
      'Why does x&(x-1) remove exactly one set bit?',
      'Why does XOR cancel duplicate pairs?',
      'What is the difference between checking, setting, clearing and toggling a bit?',
      'Why must type width be considered before shifting?',
      'When is bitmask DP practical and when does 2^n become too large?',
      'What changes when the input integer is negative?'
    ],
    learningOutcomes: [
      'Apply AND, OR, XOR, NOT and shifts using a clearly stated fixed-width integer model.',
      'Implement bit test, set, clear, toggle, parity, power-of-two and set-bit counting operations.',
      'Prove XOR cancellation and lowest-set-bit identities rather than memorizing them.',
      'Choose a sufficiently wide integer type and validate shift positions.',
      'Represent small subsets with bitmasks and estimate the exponential state-space cost.',
      'Explain signed right-shift behavior and why negative values need explicit language semantics.'
    ],
    prerequisites: [
      'Understand binary place values and positional notation.',
      'Know integer types, signedness and overflow at a basic level.',
      'Be comfortable with boolean logic and algebraic identities.',
      'Understand arrays and index-to-bit mappings.'
    ],
    deepDive: [
      'Bit positions are numbered from zero at the least significant bit. A fixed-width integer has a finite number of positions; shifts and NOT operate within the language-defined representation.',
      'AND returns 1 only when both corresponding bits are 1; OR returns 1 when either is 1; XOR returns 1 when the bits differ. XOR is addition modulo two at each bit without carry.',
      'For a mask 1<<k, test with (x&mask)!=0, set with x|mask, clear with x&~mask and toggle with x^mask. In Java use 1L for long masks and validate k against the width.',
      'In two’s-complement arithmetic, -x is formed by inverting bits and adding one. Therefore x&-x isolates the lowest set bit for nonzero x under the fixed-width integer rules.',
      'The identity x&(x-1) removes the lowest set bit. If x ends in t trailing zeroes followed by a one, subtracting one flips that one and all trailing zeroes; AND clears the changed suffix while preserving higher set bits.',
      'Brian Kernighan counting repeatedly applies x&=x-1. The loop runs once per set bit, so it is O(popcount(x)); for a fixed W-bit type it is bounded by W iterations.',
      'A positive power of two has one set bit. The x>0 guard is essential because zero also satisfies x&(x-1)==0.',
      'XOR cancellation follows associativity, commutativity, x^x=0 and x^0=x. A single-number scan works only when every other value appears an even number of times under the specified equality.',
      'Java >> is arithmetic right shift and preserves the sign bit; >>> is logical right shift and fills with zeroes. Left shift discards bits shifted beyond the fixed width.',
      'Shift counts are language-specific. Java masks shift distances for int/long rather than treating every large shift as an error; validate inputs instead of relying on that behavior.',
      'A bitmask for n boolean choices uses bit i for choice i and has 2^n possible masks. This is practical only for small n; memory and transition count grow exponentially.',
      'For subset enumeration, mask from 0 to (1<<n)-1 is safe only when n is below the chosen type width and the shift expression itself cannot overflow. Use long masks and explicit limits when appropriate.',
      'Bit operations can be concise but are not automatically clearer or faster than ordinary arithmetic. Name masks and explain the representation in maintainable code.'
    ],
    correctness: [
      'Bit-test correctness: mask has exactly bit k set, so x&mask is nonzero if and only if x has bit k set.',
      'Set/clear/toggle correctness follows the truth table at bit k while all other mask bits are zero; unrelated positions remain unchanged.',
      'Lowest-set-bit identity: two’s-complement -x preserves the least significant one-bit position while complementing higher relevant bits; AND retains exactly that least set bit.',
      'Kernighan invariant: after t iterations, exactly t of the original set bits have been removed; the loop ends when no set bits remain.',
      'XOR single-number correctness: every paired value contributes x^x=0 and the unpaired value remains because y^0=y.',
      'Subset-mask correctness: each of n bit positions independently encodes inclusion/exclusion, giving a one-to-one mapping between bitmasks and subsets.'
    ],
    implementationSteps: [
      'State the language, integer width and signedness before writing bit formulas.',
      'Draw the binary representation and label the target bit position.',
      'Create masks using the intended type, such as 1L for Java long operations.',
      'Validate shift counts and the maximum subset size before shifting.',
      'Use x>0 for power-of-two checks and document behavior for negative inputs.',
      'For XOR patterns, verify the exact multiplicity condition before applying cancellation.',
      'Use unsigned/logical right shift only when zero-fill semantics are intended.',
      'Test zero, one, negative values, highest supported bit, repeated values and boundary shift counts.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Bit operations and set-bit count', code: `static boolean isBitSet(int value, int bit) {
    if (bit < 0 || bit >= Integer.SIZE) throw new IllegalArgumentException("invalid bit");
    return (value & (1 << bit)) != 0;
}

static int countSetBits(int value) {
    int count = 0;
    while (value != 0) {
        value &= value - 1;
        count++;
    }
    return count;
}

static boolean isPositivePowerOfTwo(int value) {
    return value > 0 && (value & (value - 1)) == 0;
}

static int singleNumber(int[] values) {
    int result = 0;
    for (int value : values) result ^= value;
    return result;
}`, explanation: 'The set-bit loop works on the fixed-width two’s-complement representation too, terminating after at most Integer.SIZE iterations. The power-of-two check deliberately excludes zero and negatives.' },
      { language: 'Java 21', title: 'Enumerate subsets with a long bitmask', code: `static List<List<Integer>> subsets(int[] values) {
    if (values.length >= Long.SIZE - 1) {
        throw new IllegalArgumentException("too many elements for this mask demo");
    }
    long limit = 1L << values.length;
    List<List<Integer>> result = new ArrayList<>();
    for (long mask = 0; mask < limit; mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int bit = 0; bit < values.length; bit++) {
            if ((mask & (1L << bit)) != 0) subset.add(values[bit]);
        }
        result.add(subset);
    }
    return result;
}`, explanation: 'Each mask represents one subset. There are 2^n masks and scanning n bits per mask costs O(n*2^n) time plus output storage. The guard prevents shift-width misuse; practical memory limits are much smaller than the type limit.' }
    ],
    traceExercises: [
      'For x=10 (1010), calculate x&-x, x&(x-1), x|0010 and x^0010.',
      'Run Kernighan counting on 10110100 and show the value after each iteration.',
      'XOR [4,1,2,1,2] from left to right and show the cancellation pairs.',
      'For values [a,b,c], list masks 000 through 111 and the subset represented by each.'
    ],
    realWorldApplications: [
      'Permission flags and compact feature configuration.',
      'Network protocols and file formats that pack fields into fixed-width words.',
      'Subset dynamic programming for small state spaces.',
      'Parity checks, checksums and low-level error-detection primitives.',
      'Efficient set membership when the universe is small and dense.'
    ],
    assessment: [
      'Derive why x&(x-1) removes exactly the lowest set bit.',
      'Prove XOR single-number behavior and state the required multiplicity condition.',
      'Implement test, set, clear and toggle for a bit and explain what happens at the type boundary.',
      'Explain Java >> versus >>> for a negative integer.',
      'Count set bits and derive the O(popcount(x)) bound.',
      'Enumerate subsets with a bitmask and explain why the state count is 2^n.',
      'Identify unsafe shifts and explain how type width changes the result.'
    ],
    revisionPrompts: [
      'Write the AND/OR/XOR truth tables from memory.',
      'Re-derive x&(x-1) and x&-x using a binary example.',
      'Explain the XOR cancellation proof in one minute.',
      'After two days, implement set-bit count, power-of-two and single-number checks.',
      'After one week, enumerate subsets and estimate time/memory for n=10, 20 and 30.',
      'Explain signed versus logical right shift in Java with a negative value.'
    ]
  },


  {
    id: 'hash-set',
    title: '21. Set & Hash Set',
    sourcePages: [9],
    promise: 'Use uniqueness and membership checks to remove duplicate work and turn repeated linear scans into expected constant-time lookups.',
    mentalModel: 'A set stores membership, not positions or duplicate counts. Think of it as a collection of keys where each key is either present or absent. A hash set uses a hash function to choose a bucket, then resolves collisions while preserving the set contract.',
    concepts: [
      'A mathematical set contains unique elements; adding an existing element leaves the set unchanged.',
      'Hashing maps a key to a hash code and then to a bucket index. A hash code is not a unique identifier; distinct keys may collide.',
      'A hash set must use equality as well as hashing. Equal keys must have equal hash codes, and collisions must be resolved by the implementation.',
      'Average add, remove and contains are expected O(1) under a suitable hash distribution; worst-case behavior can degrade when collisions are severe.',
      'A tree-based set maintains sorted order and commonly provides O(log n) add, remove and lookup; it is not interchangeable with a hash set when ordering matters.',
      'Set algebra includes union, intersection, difference and symmetric difference; many interview problems use these ideas implicitly.',
      'Deduplication preserves one representative per equality class. If original order must be preserved, choose an insertion-ordered set or a separate output list.',
      'For pair-sum and complement problems, a set can answer whether the needed counterpart has already appeared.'
    ],
    recognition: [
      'The task asks whether an element has appeared before or whether a collection contains duplicates.',
      'You need fast membership checks while scanning a sequence.',
      'The output should contain unique values or distinct intersections.',
      'A brute-force nested loop repeatedly checks whether a value exists in a growing collection.',
      'The problem asks for a longest sequence or chain where membership, not sorted position, is the key operation.'
    ],
    method: [
      'Identify the equality key: the full value, a normalized string, a tuple or a derived property.',
      'Choose hash set when ordering is irrelevant; choose a sorted set when ordered traversal or predecessor/successor queries are required.',
      'For a one-pass duplicate check, add each value and stop when add reports it was already present (or when contains is true).',
      'For pair-sum, decide whether to check the complement before inserting the current value so an element is not reused unless allowed.',
      'For intersection, iterate the smaller set or input and test membership in the other set.',
      'State expected versus worst-case complexity and account for O(n) additional storage.'
    ],
    workedExample: [
      'Input [4,1,2,1,3,4]. Start with empty set {}.',
      'Read 4: it is absent, insert it -> {4}. Read 1 -> {4,1}. Read 2 -> {4,1,2}.',
      'Read the second 1: it is already present, so a duplicate is found immediately.',
      'For unique output while preserving first-seen order, append only when set.add(value) returns true; output is [4,1,2,3].',
      'For two-sum, with target 9 and values [2,7], when 7 arrives the set contains 2, so complement 9-7=2 is found.'
    ],
    complexity: [
      'HashSet add, remove and contains: expected O(1), worst-case can degrade with pathological collisions.',
      'Building a set from n values: expected O(n) time and O(n) space.',
      'Set intersection by scanning the smaller set and probing the larger: expected O(min(n,m)) time after both sets exist.',
      'TreeSet add, remove and contains: O(log n); sorted traversal O(n).',
      'Deduplication of n items with a hash set: expected O(n) time and O(n) additional space.'
    ],
    pitfalls: [
      'Assuming hash codes are unique or comparing hash codes instead of using equality.',
      'Using mutable objects as hash keys and then changing fields that affect equals/hashCode after insertion.',
      'Relying on iteration order from a hash set when the language/library does not guarantee it.',
      'Forgetting that case normalization or whitespace normalization changes the equality definition.',
      'Using a set when multiplicity matters; a frequency map is required when counts affect the answer.',
      'Claiming strict O(1) worst-case complexity instead of expected/amortized behavior.',
      'In pair-sum, inserting before checking can accidentally allow an element to pair with itself when that is disallowed.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Contains Duplicate and Remove Duplicates from an Array.', goal: 'Explain why membership is the key operation and state the extra-space cost.' },
      { level: 'Core', task: 'Intersection of Two Arrays and Happy Number.', goal: 'Use membership to detect overlap or repeated states.' },
      { level: 'Core', task: 'Longest Consecutive Sequence.', goal: 'Start a run only when its predecessor is absent and avoid sorting.' },
      { level: 'Challenge', task: 'Two Sum with a one-pass hash set/map strategy.', goal: 'Prove the scan order avoids reusing the same index.' },
      { level: 'Transfer', task: 'Deduplicate records by a normalized composite key while preserving first-seen order.', goal: 'Define equality and choose a collection that satisfies output-order requirements.' }
    ],
    interviewChecks: [
      'Why is a hash set expected O(1), not guaranteed O(1) worst case?',
      'Why must equal objects have equal hash codes?',
      'When would a TreeSet be better than a HashSet?',
      'How do you preserve input order while deduplicating?',
      'Why is a frequency map required instead of a set for some anagram problems?',
      'How do you avoid pairing an element with itself in a one-pass complement search?'
    ],
    learningOutcomes: [
      'Define set membership through equality and explain why a hash code alone cannot establish identity.',
      'Choose HashSet, insertion-ordered set or sorted set according to lookup and iteration requirements.',
      'Implement deduplication, intersection and complement lookup while preserving any required input order.',
      'Distinguish expected hash-table complexity from collision-dependent worst cases.',
      'Explain the equals/hashCode contract and why mutable keys are dangerous.',
      'Recognize when multiplicity requires a frequency map rather than a set.'
    ],
    prerequisites: [
      'Understand arrays, iteration, equality and object identity.',
      'Know expected O(1) versus O(log n) lookup at a high level.',
      'Understand that duplicate values can be equal even when they are different object instances.',
      'Review the Map lesson when counts or key-to-value associations are required.'
    ],
    deepDive: [
      'A set represents membership: each equality class appears at most once. It does not represent multiplicity or positional order unless the concrete implementation explicitly provides an iteration-order contract.',
      'A hash set computes a hash code to select a bucket, then uses equality to distinguish keys within that bucket. Hash collisions are normal and do not imply that two keys are equal.',
      'The hash contract requires equal objects to have equal hash codes. Unequal objects may share a hash code. Violating the contract can make lookup fail even when an apparently equal key was inserted.',
      'HashSet offers expected O(1) add, contains and remove under a suitable distribution. This is not an unconditional worst-case guarantee; collisions and implementation details matter.',
      'TreeSet maintains comparator order and typically provides O(log n) add, contains and remove. Its comparator must be consistent with the equality semantics expected by the application.',
      'LinkedHashSet preserves insertion iteration order while retaining hash-based membership. It is useful when deduplication should keep the first-seen order.',
      'Set union combines all distinct members; intersection keeps members present in both; difference keeps members in the first but not the second; symmetric difference keeps members present in exactly one.',
      'For pair-sum, check whether target-current exists before adding current when the same array position cannot be reused. This makes the scan invariant precise: the set contains only earlier elements.',
      'For longest consecutive sequence, begin expanding only at values whose predecessor is absent. Each consecutive run is then traversed from its unique start, avoiding repeated full-run scans.',
      'A set discards counts. If a task asks whether one string has enough copies of each symbol to form another, use a frequency map or decrementing multiset representation.',
      'Keys should be immutable with respect to equality and hashing while stored. Changing a field used by equals/hashCode can leave the object in a bucket that future lookup no longer searches.',
      'Normalization is part of the equality definition. Case-folded or whitespace-normalized membership must normalize consistently both when inserting and when querying.'
    ],
    correctness: [
      'Deduplication invariant: after processing the first i values, the membership set contains exactly the distinct values in that prefix, and the output contains their first occurrences in original order.',
      'One-pass pair-sum invariant: before processing index i, the set contains exactly the values at indices less than i. A found complement therefore uses a different index.',
      'Intersection invariant: every emitted value belongs to both input sets, and every distinct value in the smaller set that belongs to the larger is emitted once.',
      'Longest-consecutive invariant: a run is expanded only from its minimum value because only that value has no predecessor in the set; runs cannot be counted from an interior point.',
      'Hash correctness depends on the equality/hashCode contract: equal keys route to compatible lookup buckets, and equality resolves collisions within a bucket.'
    ],
    implementationSteps: [
      'Write the exact equality rule for the key, including normalization and composite-key fields.',
      'Choose HashSet for membership, LinkedHashSet for first-seen iteration order, or TreeSet for sorted order.',
      'For deduplication, append to output only when add returns true.',
      'For pair-sum, query the complement before insertion unless reusing the same index is explicitly permitted.',
      'For intersection, consider iterating the smaller collection and probing the larger one.',
      'For mutable domain objects, prefer immutable key records or derive a stable immutable key.',
      'State expected time, worst-case caveat and auxiliary storage in the solution explanation.',
      'Test duplicates, negative values, empty input, equal-but-distinct objects and normalization boundaries.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Stable deduplication and one-pass pair lookup', code: `static int[] uniqueInFirstSeenOrder(int[] values) {
    Set<Integer> seen = new LinkedHashSet<>();
    for (int value : values) seen.add(value);
    return seen.stream().mapToInt(Integer::intValue).toArray();
}

static boolean hasPairWithSum(int[] values, int target) {
    Set<Integer> earlier = new HashSet<>();
    for (int value : values) {
        int complement = target - value;
        if (earlier.contains(complement)) return true;
        earlier.add(value);
    }
    return false;
}`, explanation: 'Stable deduplication uses LinkedHashSet to preserve first-seen order. The pair lookup illustrates the earlier-values invariant and answers existence in expected O(n) time with O(n) space. Use a map instead when the actual matching indices must be returned.' }
    ],
    traceExercises: [
      'Trace LinkedHashSet on [4,1,2,1,3,4]. Show membership and output after each input.',
      'For target 9 and values [2,7,2], show the earlier-values set before each iteration and explain when the pair is found.',
      'Compute union, intersection, difference and symmetric difference for A={1,2,3} and B={3,4}.',
      'Give two unequal keys with the same hash code and explain why both can still coexist in a correct hash set.'
    ],
    realWorldApplications: [
      'Deduplicating event IDs while preserving the order in which events first arrived.',
      'Permission and feature-flag membership checks.',
      'Detecting repeated states in graph traversal and cycle-sensitive simulations.',
      'Finding shared tags, categories or identifiers between datasets.',
      'Maintaining a visited set in BFS/DFS to avoid processing a node repeatedly.'
    ],
    assessment: [
      'Explain why a hash code is not a unique identifier and describe collision resolution at the contract level.',
      'Choose between HashSet, LinkedHashSet and TreeSet for three different ordering requirements.',
      'Prove that checking a complement before insertion prevents same-index reuse in one-pass pair-sum.',
      'Implement stable deduplication and state its time and space complexity.',
      'Explain why a set cannot solve a multiplicity-sensitive anagram requirement by itself.',
      'Describe a failure mode caused by mutating a field used by equals/hashCode after insertion.',
      'Test empty, duplicate-heavy, negative and equal-but-distinct values.'
    ],
    revisionPrompts: [
      'State the equals/hashCode contract from memory and give a collision example.',
      'Re-derive the one-pass pair-sum invariant and explain why operation order matters.',
      'Compare HashSet, LinkedHashSet and TreeSet by order and expected operation cost.',
      'After two days, solve Longest Consecutive Sequence and justify why each value is expanded at most once.',
      'After one week, explain when a set must be replaced by a frequency map.',
      'Write a stable deduplication implementation without notes and test duplicate-heavy input.'
    ]
  },
  {
    id: 'hash-map',
    title: '22. Map & Hash Map',
    sourcePages: [10],
    promise: 'Model key-to-value relationships and use frequency, index and grouping maps to solve counting and lookup problems.',
    mentalModel: 'A map stores an association: for a key, remember the value that answers a later question. The key defines identity; the value stores information such as a count, last-seen index, accumulated sum or grouped records.',
    concepts: [
      'A map stores key-value pairs with unique keys. Inserting an existing key replaces its previous value unless the operation explicitly accumulates.',
      'Frequency maps count occurrences: increment with getOrDefault(key,0)+1 or an equivalent language idiom.',
      'Index maps store where a value was last seen; this supports duplicate-distance and prefix-sum lookup patterns.',
      'Grouping maps associate each key with a collection of values, such as grouping words by a normalized anagram signature.',
      'Hash maps use hashing and equality for expected O(1) put/get/remove; tree maps keep keys ordered with O(log n) operations.',
      'A map is not automatically safe for concurrent mutation. Choose concurrent collections or external synchronization when multiple threads write.',
      'Prefix-sum plus map transforms subarray-sum counting into a lookup of how many previous prefixes equal currentPrefix-target.',
      'For two-sum, store value -> index and check the complement before inserting the current value to prevent reusing the same element.'
    ],
    recognition: [
      'The problem asks for counts, frequencies, first/last occurrence or a mapping from one representation to another.',
      'You need to group records by a derived key.',
      'A repeated linear search asks whether a previous prefix, complement or state has occurred.',
      'The result depends on how many times a key appears, not merely whether it exists.',
      'You need to remember the latest index or accumulated state while scanning once.'
    ],
    method: [
      'Define the key precisely and ensure it is immutable or has stable equality/hash behavior.',
      'Decide what the value represents: count, index, sum, list, state or another aggregate.',
      'Choose update semantics: overwrite, increment, append, keep earliest, keep latest or merge.',
      'For one-pass complement lookup, query before inserting the current item when same-index reuse is invalid.',
      'For prefix sums, seed the map with prefix 0 occurring once before scanning so subarrays beginning at index 0 are counted.',
      'Use long for prefix sums and counts when constraints can exceed 32-bit ranges; use a sorted map only when key order is required.'
    ],
    workedExample: [
      'Frequency count for [a,b,a,c,b,a]: start {}. Read a -> {a:1}; b -> {a:1,b:1}; a -> {a:2,b:1}.',
      'Continue c, b, a -> {a:3,b:2,c:1}. The map records multiplicity that a set would discard.',
      'Two Sum on [2,7,11,15], target 9: at index 0 store 2->0. At index 1, complement 2 exists, so return [0,1].',
      'Subarray sum k: keep prefix frequency map {0:1}. For each current prefix p, add freq[p-k] to answer, then increment freq[p].',
      'The order matters: query the previous prefix count before recording the current prefix so only earlier positions are used.'
    ],
    complexity: [
      'HashMap put, get and remove: expected O(1), with collision-dependent worst-case behavior.',
      'Frequency map for n values: expected O(n) time and O(u) space, where u is the number of distinct keys.',
      'Grouping n records: expected O(n) map operations plus the cost of building and storing each group.',
      'Prefix-sum frequency counting: expected O(n) time and O(n) space.',
      'TreeMap lookup/update: O(log u) when ordered key traversal is required.'
    ],
    pitfalls: [
      'Using put when the intended operation is increment or merge, silently overwriting earlier counts.',
      'Confusing containsKey with a null value when null values are allowed by the chosen map.',
      'Forgetting to seed prefix-sum frequency with 0 -> 1.',
      'Updating the map before querying it in a one-pass pair problem and accidentally reusing the current element.',
      'Using int for prefix sums when values and n can overflow it.',
      'Choosing a map without defining what duplicate keys mean.',
      'Mutating a key object after insertion so its hash/equality behavior changes.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Valid Anagram and First Unique Character in a String.', goal: 'Build and compare frequency maps with explicit count updates.' },
      { level: 'Core', task: 'Two Sum and Ransom Note.', goal: 'Use complement lookup and decrementing frequency counts.' },
      { level: 'Core', task: 'Group Anagrams and Top K Frequent Elements.', goal: 'Choose stable grouping keys and combine maps with heaps or buckets.' },
      { level: 'Challenge', task: 'Subarray Sum Equals K.', goal: 'Derive prefix-sum frequency counting and handle zero-prefix initialization.' },
      { level: 'Transfer', task: 'Find the longest interval satisfying a custom prefix-difference condition.', goal: 'Choose whether the map should store frequency, earliest index or latest index.' }
    ],
    interviewChecks: [
      'When is a map required where a set is insufficient?',
      'What is the difference between overwriting a key and incrementing its count?',
      'Why is the initial prefix-sum entry 0 -> 1 required?',
      'Why should Two Sum check the complement before inserting the current value?',
      'When would you choose a TreeMap over a HashMap?',
      'What happens if a mutable key changes after insertion?'
    ],
    learningOutcomes: [
      'Model key-to-value relationships and select values that represent counts, indices, earliest/latest positions or grouped records.',
      'Implement frequency counting, complement lookup and prefix-sum frequency counting.',
      'Choose HashMap versus TreeMap based on expected lookup and ordered traversal requirements.',
      'Preserve correct update semantics: overwrite, increment, merge, append, keep earliest or keep latest.',
      'Derive the prefix-sum invariant for counting subarrays whose sum equals a target.',
      'State integer-width and hash/equality assumptions explicitly.'
    ],
    prerequisites: [
      'Understand arrays, iteration, equality and set membership.',
      'Know prefix sums and basic arithmetic over integer ranges.',
      'Be comfortable with arrays of indices and the difference between an index and a count.',
      'Review the Set lesson for hash collisions and equality/hashCode behavior.'
    ],
    deepDive: [
      'A map stores one value for each key according to the map implementation’s key-equality semantics. Inserting an existing key usually replaces its value; accumulation requires an explicit merge or increment.',
      'A frequency map stores key -> count. Each occurrence increments a value; this preserves multiplicity that a set would discard.',
      'An index map stores key -> position. Keeping the first index, last index or all indices are different algorithms; choose the update rule from the required output.',
      'A grouping map stores key -> collection. The key is a derived grouping signature, while the value accumulates all records sharing that signature.',
      'HashMap put/get/remove are expected O(1) under a suitable hash distribution, with collision-dependent worst-case behavior. TreeMap provides ordered keys with O(log u) operations for u distinct keys.',
      'Two Sum checks the complement before inserting the current value. Store value -> index to retrieve the actual pair in expected O(n) time and avoid pairing an index with itself.',
      'Prefix sums define P[j] as the sum of elements before index j. A subarray [i,j) has sum k exactly when P[j]-P[i]=k, so the current prefix p needs earlier prefixes equal to p-k.',
      'For subarray-sum counting, initialize frequency[0]=1 to represent the empty prefix before the array. At each position, add frequency[p-k] to the answer before incrementing frequency[p].',
      'The query-before-update order ensures only earlier prefixes are counted. Updating first can count the current prefix as its own start, especially visible when k=0.',
      'Prefix sums and answers may exceed 32-bit integer range even when each element fits in int. Use long for cumulative sums and counts when constraints require it.',
      'A map’s null semantics vary by implementation. Prefer getOrDefault, containsKey or explicit Optional-like logic when null is a valid stored value.',
      'Mutable keys can become unreachable if their equality/hash behavior changes after insertion. Use immutable keys such as records or normalized strings.',
      'A concurrent map is needed when multiple threads mutate shared mappings; an ordinary HashMap does not make compound read-modify-write operations atomic.'
    ],
    correctness: [
      'Frequency invariant: after processing a prefix, map[key] equals the number of occurrences of key in exactly that prefix.',
      'Two Sum invariant: before processing index i, each stored value maps to a previously seen index; a found complement therefore returns two distinct indices.',
      'Prefix-frequency invariant: before querying position j, the map stores counts of prefix sums P[i] for i<j. The number of subarrays ending at j with sum k is exactly frequency[P[j]-k].',
      'Seeding frequency[0]=1 accounts for subarrays that begin at array index zero because their starting prefix is the empty prefix P[0].',
      'Query-before-increment preserves the earlier-prefix invariant and prevents the current prefix from being counted as its own predecessor.',
      'Grouping invariant: after processing each record, the bucket for its derived key contains exactly the processed records with that key.'
    ],
    implementationSteps: [
      'Define the key and value meaning in one sentence before coding.',
      'Choose update semantics explicitly: overwrite, increment, append, minimum/maximum index or merge.',
      'Use getOrDefault/merge for counts and a stable immutable key.',
      'For Two Sum, query the complement before storing the current value and use a map when the matching index is needed.',
      'For subarray sum, seed prefix frequency with 0 -> 1; query p-k before incrementing frequency[p].',
      'Use long for prefix sums and answer counts when the input constraints can overflow int.',
      'Choose TreeMap only when sorted-key iteration or range queries justify O(log u) operations.',
      'Test empty input, zeros, negative values, duplicate keys, overflow boundaries and null policy.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Subarray sum equals k using prefix frequencies', code: `static long countSubarraysWithSum(int[] values, long target) {
    Map<Long, Long> prefixFrequency = new HashMap<>();
    prefixFrequency.put(0L, 1L);
    long prefix = 0L;
    long answer = 0L;

    for (int value : values) {
        prefix += value;
        answer += prefixFrequency.getOrDefault(prefix - target, 0L);
        prefixFrequency.merge(prefix, 1L, Long::sum);
    }
    return answer;
}`, explanation: 'Before each query, the map contains only earlier prefix sums. Querying prefix-target counts valid starts; then the current prefix is recorded for future endpoints. Expected O(n) time and O(n) space; long avoids common 32-bit overflow.' },
      { language: 'Java 21', title: 'Two Sum with value-to-index mapping', code: `static int[] twoSum(int[] values, int target) {
    Map<Integer, Integer> earlierIndex = new HashMap<>();
    for (int i = 0; i < values.length; i++) {
        int complement = target - values[i];
        Integer j = earlierIndex.get(complement);
        if (j != null) return new int[]{j, i};
        earlierIndex.putIfAbsent(values[i], i);
    }
    return new int[0];
}`, explanation: 'Lookup occurs before insertion so an element cannot pair with itself. putIfAbsent retains the earliest index for duplicate values. Expected O(n) time and O(n) space.' }
    ],
    traceExercises: [
      'Frequency trace: process [a,b,a,c,b,a] and write the full map after each item.',
      'Two Sum trace: [2,7,11,15], target 9. Show complement, map lookup and insertion at each index.',
      'Prefix trace: values=[1,1,1], k=2. Show prefix, required prefix, answer increment and map after every element.',
      'Zero-sum trace: values=[0,0], k=0. Explain why querying before increment counts exactly three non-empty subarrays.'
    ],
    realWorldApplications: [
      'Counting events by type, user, status or time bucket.',
      'Caching records by stable identifier for expected constant-time lookup.',
      'Grouping transactions, logs or products by a derived category.',
      'Streaming analytics that count occurrences or rolling prefix-state frequencies.',
      'Indexing the latest known position of an item in text or event streams.'
    ],
    assessment: [
      'Explain the difference between a set and a frequency map using an input with duplicates.',
      'Implement Two Sum and prove the map never returns the same index twice.',
      'Derive the prefix-frequency equation for subarray sum k from P[j]-P[i]=k.',
      'Explain why the map must begin with 0 -> 1 and why query must precede increment.',
      'Trace [0,0] with k=0 and show why the answer is three.',
      'Choose long or int for prefix sums and answer counts based on explicit constraints.',
      'Compare HashMap and TreeMap for an application that needs sorted key ranges.'
    ],
    revisionPrompts: [
      'Re-derive frequency counting and Two Sum update semantics without notes.',
      'Write the prefix-sum subarray equation and solve it for the required earlier prefix.',
      'Explain the empty-prefix seed using a subarray that begins at index zero.',
      'After two days, implement Subarray Sum Equals K and test negative values and zeros.',
      'After one week, explain how a map can store a count, earliest index or latest index and why those choices differ.',
      'Review the equals/hashCode contract and describe why immutable map keys are safer.'
    ]
  },
  {
    id: 'fast-slow-pointers',
    title: '23. Fast & Slow Pointers',
    sourcePages: [12],
    promise: 'Use pointers moving at different speeds to detect cycles, locate midpoints and reason about linked-list structure in constant extra space.',
    mentalModel: 'Two pointers share a traversal but advance at different rates. Their relative motion reveals structure: if a cycle exists, the faster pointer eventually catches the slower one; in a linear list, the fast pointer reaches the end first.',
    concepts: [
      'Slow pointer advances one node per iteration; fast pointer advances two. Always check fast and fast.next before dereferencing fast.next.next.',
      'In an acyclic list, fast reaches null (or its next reaches null); slow is then at or near the midpoint depending on list length and loop condition.',
      'In a cyclic list, the relative speed is one node per iteration. The pointers move around a finite cycle, so they eventually meet.',
      'Floyd cycle detection uses O(1) extra space and O(n) time; a visited set is simpler but needs O(n) extra space.',
      'After a meeting inside a cycle, reset one pointer to head and move both one step at a time; their next meeting identifies the cycle entry under Floyd’s assumptions.',
      'For even-length lists, define whether the desired middle is the first or second middle; the loop condition determines the result.',
      'Fast/slow pointers also help with palindrome linked lists when combined with reversing the second half and restoring the list afterward.'
    ],
    recognition: [
      'The input is a linked list and asks whether a cycle exists or where it begins.',
      'The task asks for the middle node in one pass without computing length first.',
      'The prompt asks for a constant-extra-space solution instead of a visited set.',
      'A repeated next-pointer function forms a sequence that may eventually repeat a state.',
      'A palindrome-list check needs the midpoint and a reversed second half.'
    ],
    method: [
      'Draw a small odd-length list and an even-length list, then decide which middle node the problem expects.',
      'Before each iteration, ensure fast and fast.next are non-null before advancing fast by two.',
      'For cycle detection, advance slow once and fast twice; compare node identity, not node values.',
      'For cycle entry, after the meeting reset one pointer to head and advance both one step; explain the distance relationship in the proof.',
      'For palindrome checking, find the midpoint, reverse the second half, compare corresponding values and restore the original links if mutation is not allowed.',
      'Test empty, one-node, two-node, odd-length, even-length, self-loop and cycle-at-head inputs.'
    ],
    workedExample: [
      'Acyclic list 1->2->3->4->5: start slow=1, fast=1. After one iteration slow=2 and fast=3; after two, slow=3 and fast=5; fast.next is null, so slow is the middle.',
      'Cycle list 1->2->3->4->5->3: slow advances 1 edge per round and fast 2. Their relative gap changes by one edge each round around the 3-node cycle, so they eventually meet.',
      'For cycle entry, let the non-cycle distance be μ and cycle length λ. At a meeting, the fast pointer has travelled twice the slow distance; resetting one pointer to head and moving both one step makes them meet after μ steps.',
      'For [1,2,3,2,1], find the middle, reverse the second half and compare 1 with 1, then 2 with 2. Restore links if the caller expects the original list.'
    ],
    complexity: [
      'Cycle detection: O(n) time and O(1) auxiliary space.',
      'Finding the middle node: O(n) time and O(1) auxiliary space.',
      'Finding cycle entry after detection: O(n) additional time and O(1) space.',
      'Palindrome linked-list check: O(n) time and O(1) auxiliary space when reversing the second half in place.',
      'A visited-set cycle check is O(n) expected time and O(n) extra space.'
    ],
    pitfalls: [
      'Dereferencing fast.next.next without first checking fast and fast.next.',
      'Comparing node values instead of node identity for cycle detection.',
      'Using the wrong loop condition and returning the wrong middle for even-length lists.',
      'Forgetting to restore the second half after a palindrome check when mutation is not allowed.',
      'Assuming fast/slow pointers work on arbitrary arrays without a defined next-state function.',
      'Applying Floyd’s cycle-entry reset proof without using the standard one-step/two-step speed relationship.',
      'Failing to handle an empty list or a one-node self-cycle.'
    ],
    practice: [
      { level: 'Warm-up', task: 'Find the middle of a linked list for odd and even lengths.', goal: 'State which middle is returned and justify the loop condition.' },
      { level: 'Core', task: 'Linked List Cycle and Linked List Cycle II.', goal: 'Detect a meeting and derive the cycle entry location.' },
      { level: 'Core', task: 'Palindrome Linked List.', goal: 'Combine midpoint detection, second-half reversal and restoration.' },
      { level: 'Challenge', task: 'Find the duplicate number using the array as a next-pointer function.', goal: 'Map values to next indices and apply cycle detection under problem constraints.' },
      { level: 'Transfer', task: 'Analyse a custom deterministic state-transition function for a repeated state.', goal: 'Identify the cycle assumptions and determine whether Floyd’s algorithm applies.' }
    ],
    interviewChecks: [
      'Why do fast and slow pointers eventually meet inside a cycle?',
      'How do you choose the loop condition for first-middle versus second-middle?',
      'Why compare node references instead of values?',
      'Explain the cycle-entry reset step using μ and λ.',
      'How can you check a linked-list palindrome with O(1) extra space?',
      'When would a visited set be a better engineering choice despite using more memory?'
    ],
    learningOutcomes: [
      'Choose loop conditions for first-middle or second-middle behavior on odd and even linked lists.',
      'Implement Floyd cycle detection and cycle-entry lookup using node identity.',
      'Prove why relative speed guarantees a meeting and derive the reset-to-head entry procedure.',
      'Use fast/slow pointers for palindrome checks while preserving or restoring list structure.',
      'Recognize when Floyd applies to a deterministic next-state function and when a visited set is preferable.',
      'State O(n) time and O(1) auxiliary-space bounds and handle all boundary shapes.'
    ],
    prerequisites: [
      'Understand singly linked-list nodes and reference identity.',
      'Know null checks and safe pointer traversal.',
      'Review linked-list reversal and pointer invariants.',
      'Understand modular distance around a finite cycle.'
    ],
    deepDive: [
      'Slow advances one edge and fast advances two. In an acyclic list, fast reaches the end first; in a cycle, the relative speed is one edge per round.',
      'Once both pointers are inside a cycle of length λ, their relative offset changes by one modulo λ each iteration. It must eventually become zero, so they meet.',
      'Let μ be the distance from head to cycle entry and λ the cycle length. At a meeting, fast has travelled twice slow’s distance, so the difference in travelled distance is a multiple of λ.',
      'After a meeting, reset one pointer to head and move both one edge per iteration. The distance relationship modulo λ makes them meet at the cycle entry after μ steps.',
      'Middle-node selection depends on the loop condition. while(fast!=null && fast.next!=null) with slow one/fast two returns the second middle for even length; stricter alternatives return the first.',
      'For a palindrome check, reverse the second half, compare values, then restore the reversed half if callers expect the list unchanged. A temporary mutation must be documented.',
      'Floyd can also detect cycles in a deterministic function f(state) when each state has exactly one next state and the state space is finite. It does not directly apply to branching transitions.',
      'Cycle detection compares references, not node values. Two distinct nodes can carry equal values without being the same point in the cycle.',
      'A visited set can be clearer and can identify the repeated state directly, but uses O(n) memory. Floyd trades implementation subtlety for O(1) auxiliary space.',
      'The total traversal is linear: the meeting phase and entry phase each advance pointers at most proportional to the non-cycle prefix plus cycle length.'
    ],
    correctness: [
      'Meeting proof: inside a cycle of length λ, fast gains one position per iteration relative to slow. Modular positions must coincide within at most λ iterations.',
      'Entry proof: if slow has travelled t edges at meeting, fast has travelled 2t; their distance difference t is a multiple of λ. Resetting one pointer to head aligns both distances to the entry modulo λ.',
      'Second-middle invariant: after each iteration slow advances one node and fast two; when fast cannot advance two more, slow has advanced floor(n/2) steps, landing at the second middle for even n.',
      'Palindrome comparison correctness: reversing the second half pairs nodes from opposite ends; equality of every corresponding value establishes palindrome symmetry.',
      'Restoration correctness: reversing the same second-half segment again restores the original next links after comparison.',
      'Identity correctness: cycle meeting is a property of pointer location, so reference equality is required even when node values repeat.'
    ],
    implementationSteps: [
      'Choose and document first-middle or second-middle behavior for even-length input.',
      'Guard fast and fast.next before advancing fast by two.',
      'Compare node references with ==, never values, for cycle detection.',
      'For entry lookup, run the standard reset-to-head phase only after a meeting has been found.',
      'For palindrome checks, define the second-half start and whether the original list must be restored.',
      'Save or reconnect links carefully when reversing the second half.',
      'For state-transition cycles, verify the next-state function is deterministic and the state space is finite.',
      'Test null, singleton, two nodes, odd/even length, self-loop, head cycle and middle cycle.'
    ],
    codeExamples: [
      { language: 'Java 21', title: 'Find cycle entry and second middle', code: `static final class Node {
    int value;
    Node next;
    Node(int value) { this.value = value; }
}

static Node cycleEntry(Node head) {
    Node slow = head, fast = head;
    do {
        if (fast == null || fast.next == null) return null;
        slow = slow.next;
        fast = fast.next.next;
    } while (slow != fast);

    Node fromHead = head;
    while (fromHead != slow) {
        fromHead = fromHead.next;
        slow = slow.next;
    }
    return fromHead;
}

static Node secondMiddle(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`, explanation: 'Cycle entry uses reference identity and O(1) auxiliary space. secondMiddle returns the second of two middle nodes for even-length lists; for odd length it returns the unique middle. Both run in O(n) time.' }
    ],
    traceExercises: [
      'Trace slow and fast on 1→2→3→4→5→null and identify the returned middle.',
      'Trace the meeting and reset phases for 1→2→3→4→5→3. Label μ and λ.',
      'Compare first-middle and second-middle loop conditions on a four-node list.',
      'Reverse and restore the second half of [1,2,3,2,1], showing every changed next reference.'
    ],
    realWorldApplications: [
      'Detecting loops in linked data structures and pointer-based workflows.',
      'Finding repeated states in deterministic simulations or functional state transitions.',
      'Identifying duplicate-number cycles when problem constraints define an index transition.',
      'Validating linked-list structures in memory and data-processing systems.',
      'Palindrome checks and midpoint-based divide-and-conquer list operations.'
    ],
    assessment: [
      'Prove Floyd’s meeting phase using relative speed and cycle length.',
      'Derive the cycle-entry reset step using μ and λ.',
      'Implement first-middle and second-middle variants and explain their even-length behavior.',
      'Explain why node identity, not value equality, is required.',
      'Design a palindrome-list check and restore the original links.',
      'State the deterministic-transition assumptions required for Floyd’s algorithm.',
      'Compare Floyd with a visited set by memory, clarity and information returned.'
    ],
    revisionPrompts: [
      'Draw a cycle and label μ, λ, slow distance and fast distance.',
      'Re-derive the reset-to-head argument without notes.',
      'Write the null guard for fast-pointer advancement from memory.',
      'After two days, implement cycle entry and test a self-loop and a middle cycle.',
      'After one week, implement palindrome checking and verify the list is restored.',
      'Explain when Floyd is invalid because a state can have multiple successors.'
    ]
  },

];

export const DSA_LESSON_STEPS = [
  'Understand the problem and constraints',
  'Build a mental model and trace an example',
  'Recognise when the technique applies (and when it does not)',
  'Derive from brute force',
  'Implement and test edge cases',
  'Prove correctness with an invariant or recurrence',
  'Analyse time and space complexity',
  'Practise independently and transfer to a new problem'
];
