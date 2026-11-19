/**
 * Canonical additions from the 293-question topic-wise interview inventory.
 * These records intentionally start as inventory drafts: no fabricated problem
 * statements, examples, constraints, or solutions are presented as authoritative.
 * The startup importer is idempotent and the authoring API can enrich them later.
 */
export type MasterProblemSeed = { slug: string; title: string; topicId: string; topic: string; difficulty: 'Easy'|'Medium'|'Hard'; catalogStatus: 'inventory'; contentStatus: 'needs-authoring'; aliases: string[] };

const TOPIC_ROWS: Array<[string,string,string[]]> = [["arrays","Arrays",["Contains Duplicate","Maximum Product Subarray","Find the Missing Number","Find All Duplicates in an Array","Majority Element","Majority Element II","Rotate Array","Next Permutation","Maximum Circular Subarray Sum"]],["strings","Strings",["Reverse Words in a String","Longest Palindromic Substring","String to Integer (atoi)","Find the First Occurrence in a String","Roman to Integer","Integer to Roman","Encode and Decode Strings","Multiply Strings","Reorganize String","Palindromic Substrings"]],["two-pointers","Two Pointers",["Two Sum II – Input Array Is Sorted","4Sum","Remove Duplicates from Sorted Array","Remove Element","Move Zeroes","Squares of a Sorted Array","Backspace String Compare"]],["sliding-window","Sliding Window",["Maximum Sum Subarray of Size K","Minimum Size Subarray Sum","Permutation in String","Find All Anagrams in a String","Maximum Number of Vowels in a Substring","Longest Subarray of 1s After Deleting One Element"]],["hashing","Hashing",["Top K Frequent Elements","Isomorphic Strings","Word Pattern","Happy Number","Intersection of Two Arrays","Design HashMap","Insert Delete GetRandom O(1)"]],["binary-search","Binary Search",["Search Insert Position","First and Last Position of Element","Find Minimum in Rotated Sorted Array","Find Peak Element","Find Single Element in a Sorted Array","Capacity to Ship Packages Within D Days","Split Array Largest Sum","Aggressive Cows","Allocate Minimum Number of Pages"]],["linked-lists","Linked Lists",["Middle of the Linked List","Merge Two Sorted Lists","Remove Nth Node From End","Add Two Numbers","Reorder List","Reverse Nodes in K-Group","Copy List with Random Pointer","Intersection of Two Linked Lists","Palindrome Linked List","Sort List","Rotate List"]],["stack-queue","Stack and Queue",["Implement Stack Using Queues","Evaluate Reverse Polish Notation","Asteroid Collision","Simplify Path","Basic Calculator"]],["binary-trees","Binary Trees",["Maximum Depth of Binary Tree","Invert Binary Tree","Same Tree","Symmetric Tree","Balanced Binary Tree","Zigzag Level Order Traversal","Right Side View","Construct Tree from Preorder and Inorder","Serialize and Deserialize Binary Tree","Vertical Order Traversal","Path Sum II","Flatten Binary Tree to Linked List"]],["bst","Binary Search Tree",["Search in a BST","Insert into a BST","Delete Node in a BST","Kth Smallest Element in a BST","Convert Sorted Array to BST","BST Iterator","Two Sum IV – Input Is a BST","Validate Binary Search Tree","Lowest Common Ancestor of BST","Recover Binary Search Tree"]],["heaps","Heap / Priority Queue",["Top K Frequent Elements","K Closest Points to Origin","Last Stone Weight","Reorganize String","Kth Smallest Element in a Sorted Matrix","Find K Pairs with Smallest Sums"]],["backtracking","Recursion and Backtracking",["Subsets II","Permutations II","Letter Combinations of a Phone Number","Generate Parentheses","Sudoku Solver","Palindrome Partitioning","Rat in a Maze","M-Coloring Problem","Word Break II","Permutations","Combination Sum II"]],["dynamic-programming","Dynamic Programming",["Fibonacci Number","Longest Common Subsequence","Partition Equal Subset Sum","Word Break","Decode Ways","Maximum Product Subarray","Palindromic Substrings","Longest Palindromic Subsequence","0/1 Knapsack","Rod Cutting","Matrix Chain Multiplication","Regular Expression Matching","Min Cost Climbing Stairs","House Robber II","Target Sum","Burst Balloons","Best Time to Buy and Sell Stock III"]],["graphs","Graph Algorithms",["Clone Graph","Graph Valid Tree","Number of Connected Components","Redundant Connection","Cheapest Flights Within K Stops","Path With Minimum Effort","Min Cost to Connect All Points","Alien Dictionary","Reconstruct Itinerary"]],["greedy","Greedy",["Jump Game II","Candy","Assign Cookies","Merge Triplets to Form Target Triplet","Partition Labels","Minimum Number of Arrows to Burst Balloons","Hand of Straights","Job Sequencing Problem"]],["trie","Trie",["Replace Words","Longest Word in Dictionary","Maximum XOR of Two Numbers in an Array","Search Suggestions System","Design Add and Search Words Data Structure"]],["bit-manipulation","Bit Manipulation",["Number of 1 Bits","Reverse Bits","Missing Number","Sum of Two Integers","Power of Two","Subsets Using Bitmasking","Bitwise AND of Numbers Range","XOR Queries of a Subarray","Single Number II"]],["intervals","Intervals",["Insert Interval","Minimum Number of Arrows to Burst Balloons","Employee Free Time","Minimum Interval to Include Each Query","Meeting Rooms","My Calendar I","My Calendar II"]],["prefix-sum","Prefix Sum and Difference Array",["Continuous Subarray Sum","Find Pivot Index","Count Number of Nice Subarrays","Minimum Operations to Reduce X to Zero","Maximum Size Subarray Sum Equals K"]],["sorting","Sorting",["Bubble Sort","Selection Sort","Insertion Sort","Quick Sort","Heap Sort","Counting Sort","Radix Sort","Sort an Array","Merge Sort","Kth Largest Element"]],["advanced-data-structures","Advanced Data Structures",["Implement LRU Cache","Implement LFU Cache","Design Twitter","Implement Segment Tree","Fenwick Tree (Binary Indexed Tree)","Design Skiplist","Design Underground System","All O(1) Data Structure"]],["mathematics","Mathematical Algorithms",["Count Primes","Sieve of Eratosthenes","GCD and LCM","Power(x, n)","Factorial Trailing Zeroes","Excel Sheet Column Number","Happy Number","Pow(x, n)","Integer Break","Reverse Integer"]]];

const PARTIAL_TITLE_ALIASES: Record<string,string[]> = {
  'sort-colors': ['Sort Colors — Dutch National Flag'],
  'next-greater-element-ii': ['Next Greater Element I'],
  'validate-binary-search-tree': ['Binary Search (Index & On Answer)'],
  'lowest-common-ancestor-of-bst': ['Lowest Common Ancestor (#236)'],
  'recover-binary-search-tree': ['Binary Search (Index & On Answer)'],
  'permutations': ['Permutations / Subsets II (#46 / #90)'],
  'combination-sum-ii': ['Combination Sum (#39)'],
  'min-cost-climbing-stairs': ['Climbing Stairs'],
  'house-robber-ii': ['House Robber'],
  'target-sum': ['Count Submatrices with Target Sum'],
  'burst-balloons': ['Burst Balloons (#312)', 'TSP Bitmask DP'],
  'best-time-to-buy-and-sell-stock-iii': ['Best Time to Buy and Sell Stock'],
  'design-add-and-search-words-data-structure': ['Add and Search Words (#211)'],
  'single-number-ii': ['Single Number (#136)'],
  'meeting-rooms': ['Meeting Rooms II (#253)'],
  'my-calendar-i': ['My Calendar III (#732)'],
  'my-calendar-ii': ['My Calendar III (#732)'],
  'maximum-size-subarray-sum-equals-k': ['Subarray Sum Equals K (#560)'],
  'merge-sort': ['Top-Down Stable Merge Sort (Divide & Conquer)'],
  'kth-largest-element': ['Kth Largest Element in an Array']
};

function slugify(value: string): string {
  return value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function inferDifficulty(title: string): 'Easy'|'Medium'|'Hard' {
  const hard = /hard|k-group|serialize|deserialize|sudoku|balloons|regular expression|median|calculator|lfu|segment tree|all o\(1\)|alien dictionary|itinerary|minimum window|reorganize|reverse nodes|knapsack|matrix chain|xor|4sum|employee free|minimum interval|word break ii/i;
  const easy = /contains duplicate|missing number|majority element$|valid|roman to integer|first occurrence|remove element|move zeroes|middle of|search in a bst|insert into a bst|power of two|number of 1 bits|reverse bits|bubble sort|selection sort|insertion sort|gcd|excel sheet|happy number|reverse integer|fibonacci|count primes/i;
  if (hard.test(title)) return 'Hard';
  if (easy.test(title)) return 'Easy';
  return 'Medium';
}

export const MASTER_INTERVIEW_PROBLEM_ADDITIONS: MasterProblemSeed[] = TOPIC_ROWS.flatMap(([topicId, topic, titles]) =>
  titles.map((title) => {
    const titleKey = slugify(title);\n    const slug = `${topicId}-${titleKey}`;
    return {
      slug,
      title,
      topicId,
      topic,
      difficulty: inferDifficulty(title),
      catalogStatus: 'inventory' as const,
      contentStatus: 'needs-authoring' as const,
      aliases: PARTIAL_TITLE_ALIASES[titleKey] ?? [],
    };
  })
);

export const MASTER_INTERVIEW_PROBLEM_ADDITION_COUNT = MASTER_INTERVIEW_PROBLEM_ADDITIONS.length;
