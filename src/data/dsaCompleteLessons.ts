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
    interviewChecks: ['Why is binary search logarithmic?', 'What is the difference between O(n) auxiliary space and O(n) total space?', 'How do you prove a loop invariant?', 'When can average-case hash lookup degrade?']
  },
  {
    id: 'arrays', sourcePages: [1], title: '2. Arrays', promise: 'Master indexed storage, traversal, in-place transformations and range-query patterns.',
    mentalModel: 'An array is a row of indexed cells. Random access is cheap because the address of an element can be calculated directly; inserting in the middle is expensive because later elements may need to shift.',
    concepts: ['Static arrays vs dynamic arrays and amortized resizing.', 'Traversal, indexing, update, insertion and deletion costs.', 'Subarray (contiguous) vs subsequence (order-preserving, gaps allowed) vs subset.', 'In-place mutation, read/write pointers and stable compaction.', 'Sorting, frequency tables, hash maps and prefix aggregates.', '2D arrays: row/column indexing, bounds and coordinate transforms.', 'Range sums, prefix sums, difference arrays and prefix XOR.', 'Array invariants: processed prefix, unprocessed suffix and write boundary.'],
    recognition: ['The prompt says contiguous range, subarray, in-place, rotate, partition or range query.', 'You need many indexed reads or one-pass processing.', 'Repeated range sums or range updates appear.', 'Constraints rule out checking every pair or every subarray.'],
    method: ['Clarify whether mutation is allowed and whether order must be preserved.', 'Write the direct nested-loop solution and count repeated work.', 'For repeated sums, build prefix[i+1] = prefix[i] + a[i].', 'For in-place filtering, maintain a write index for the next valid element.', 'For many range additions, add at l and subtract after r in a difference array, then prefix-scan.', 'Prove index boundaries with half-open ranges [l, r).'],
    workedExample: ['Range sum from l through r inclusive: prefix[k] stores the sum of the first k elements.', 'Build prefix in O(n): prefix[0]=0; prefix[i+1]=prefix[i]+a[i].', 'Answer is prefix[r+1]−prefix[l], O(1) per query.', 'For a half-open range [l,r), use prefix[r]−prefix[l]. Choose one convention and use it consistently.'],
    complexity: ['Index read/write: O(1).', 'Full scan: O(n).', 'Insert/delete at arbitrary index: O(n) due to shifts.', 'Prefix preprocessing O(n), each range sum O(1), storage O(n).', 'Sorting usually O(n log n); in-place status depends on the algorithm and language implementation.'],
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
      { language: 'Python 3', title: 'Prefix sums and range queries', code: 'def build_prefix(values):\n    prefix = [0]\n    for value in values:\n        prefix.append(prefix[-1] + value)\n    return prefix\n\ndef sum_range(prefix, left, right_exclusive):\n    if left < 0 or right_exclusive < left or right_exclusive >= len(prefix):\n        raise IndexError(\"invalid range\")\n    return prefix[right_exclusive] - prefix[left]', explanation: 'Python integers grow as needed, but the invariant is the same. The right endpoint is exclusive, matching Python slicing.' }
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
      'Understand object references, null, heap allocation and mutation in Java.',
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
    ],
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
    interviewChecks: ['Why is a monotonic stack linear overall?', 'Why store indices in a sliding-window deque?', 'What is the equality rule for duplicate heights?', 'How does a two-stack queue achieve amortized O(1)?']
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
    interviewChecks: ['What exactly does lower_bound return?', 'Why does the answer-space predicate need monotonicity?', 'How do you prevent an infinite loop?', 'What changes when duplicates exist in a rotated array?']
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
    interviewChecks: ['What property makes pointer movement safe?', 'Why does a positive-number sum window shrink correctly?', 'How do you count exactly K distinct values?', 'When is sorting incompatible with the problem?']
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
    interviewChecks: ['What is the recursive contract?', 'Why can diameter require a global answer?', 'What is the difference between depth and height?', 'When is BFS preferable to DFS?']
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
    interviewChecks: ['Why are local parent-child checks insufficient?', 'What is the inorder successor?', 'What is the worst-case height?', 'When would a heap be a better fit?']
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
    interviewChecks: ['Why is heapify O(n)?', 'Why does Top K largest use a min-heap?', 'What information belongs in a K-way merge heap entry?', 'Why is a heap not a sorted array?']
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
    interviewChecks: ['What is the complete state?', 'Why must you undo a choice?', 'When is duplicate skipping safe?', 'What is the difference between pruning and memoization?']
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
    interviewChecks: ['What is the greedy-choice property?', 'Give an exchange argument.', 'Why does earliest finish work for interval scheduling?', 'How do you know DP is needed instead?']
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
    interviewChecks: ['What information does your state represent?', 'Why are the subproblems overlapping?', 'Why is the evaluation order valid?', 'Why does 0/1 knapsack iterate capacity downward?', 'What makes knapsack pseudo-polynomial?']
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
    interviewChecks: ['When does BFS give shortest paths?', 'Why can Dijkstra fail with negative edges?', 'How does Kahn detect a cycle?', 'What does DSU represent?', 'How is an MST different from a shortest-path tree?']
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
    ]
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
    ]
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
