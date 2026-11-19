/**
 * Canonical additions from the 293-question topic-wise interview inventory.
 * These canonical records receive five-stage topic blueprints at startup. Official
 * statements/examples/constraints and accepted code remain explicitly unverified.
 * The startup importer is idempotent and the authoring API can enrich them later.
 */
export type MasterProblemSeed = { slug: string; title: string; topicId: string; topic: string; difficulty: 'Easy'|'Medium'|'Hard'; catalogStatus: 'review'; contentStatus: 'in-progress'; aliases: string[]; relatedTitles: string[] };

const TOPIC_ROWS: Array<[string,string,string[]]> = [["arrays","Arrays",["Two Sum","Best Time to Buy and Sell Stock","Contains Duplicate","Maximum Subarray (Kadane's Algorithm)","Product of Array Except Self","Maximum Product Subarray","Find the Missing Number","Find All Duplicates in an Array","Majority Element","Majority Element II","Merge Sorted Array","Rotate Array","Sort Colors","Next Permutation","Trapping Rain Water","Container With Most Water","Subarray Sum Equals K","Maximum Circular Subarray Sum","First Missing Positive","Set Matrix Zeroes"]],["strings","Strings",["Valid Anagram","Valid Palindrome","Longest Common Prefix","Reverse Words in a String","Longest Substring Without Repeating Characters","Longest Palindromic Substring","Group Anagrams","Longest Repeating Character Replacement","Minimum Window Substring","String to Integer (atoi)","Find the First Occurrence in a String","Roman to Integer","Integer to Roman","Encode and Decode Strings","Valid Parentheses","Multiply Strings","Reorganize String","Palindromic Substrings"]],["two-pointers","Two Pointers",["Two Sum II – Input Array Is Sorted","3Sum","4Sum","Container With Most Water","Trapping Rain Water","Remove Duplicates from Sorted Array","Remove Element","Move Zeroes","Squares of a Sorted Array","Sort Colors","Valid Palindrome II","Backspace String Compare"]],["sliding-window","Sliding Window",["Maximum Sum Subarray of Size K","Longest Substring Without Repeating Characters","Minimum Size Subarray Sum","Longest Repeating Character Replacement","Permutation in String","Find All Anagrams in a String","Minimum Window Substring","Sliding Window Maximum","Maximum Number of Vowels in a Substring","Subarrays with K Different Integers","Fruit Into Baskets","Longest Subarray of 1s After Deleting One Element"]],["hashing","Hashing",["Two Sum","Group Anagrams","Top K Frequent Elements","Longest Consecutive Sequence","Subarray Sum Equals K","Isomorphic Strings","Word Pattern","Happy Number","Intersection of Two Arrays","Design HashMap","LRU Cache","Insert Delete GetRandom O(1)"]],["binary-search","Binary Search",["Binary Search","Search Insert Position","First and Last Position of Element","Search in Rotated Sorted Array","Find Minimum in Rotated Sorted Array","Find Peak Element","Find Single Element in a Sorted Array","Search a 2D Matrix","Koko Eating Bananas","Capacity to Ship Packages Within D Days","Median of Two Sorted Arrays","Split Array Largest Sum","Aggressive Cows","Allocate Minimum Number of Pages"]],["linked-lists","Linked Lists",["Reverse Linked List","Middle of the Linked List","Linked List Cycle","Linked List Cycle II","Merge Two Sorted Lists","Remove Nth Node From End","Add Two Numbers","Reorder List","Reverse Nodes in K-Group","Copy List with Random Pointer","Intersection of Two Linked Lists","Palindrome Linked List","Sort List","LRU Cache","Rotate List"]],["stack-queue","Stack and Queue",["Valid Parentheses","Min Stack","Implement Queue Using Stacks","Implement Stack Using Queues","Daily Temperatures","Next Greater Element I","Next Greater Element II","Largest Rectangle in Histogram","Online Stock Span","Evaluate Reverse Polish Notation","Asteroid Collision","Simplify Path","Basic Calculator","Sliding Window Maximum"]],["binary-trees","Binary Trees",["Maximum Depth of Binary Tree","Invert Binary Tree","Same Tree","Symmetric Tree","Diameter of Binary Tree","Balanced Binary Tree","Binary Tree Level Order Traversal","Zigzag Level Order Traversal","Right Side View","Lowest Common Ancestor","Binary Tree Maximum Path Sum","Construct Tree from Preorder and Inorder","Serialize and Deserialize Binary Tree","Vertical Order Traversal","Boundary Traversal","Path Sum II","Flatten Binary Tree to Linked List"]],["bst","Binary Search Tree",["Search in a BST","Insert into a BST","Delete Node in a BST","Validate Binary Search Tree","Kth Smallest Element in a BST","Lowest Common Ancestor of BST","Convert Sorted Array to BST","BST Iterator","Recover Binary Search Tree","Two Sum IV – Input Is a BST"]],["heaps","Heap / Priority Queue",["Kth Largest Element in an Array","Top K Frequent Elements","K Closest Points to Origin","Find Median from Data Stream","Merge K Sorted Lists","Last Stone Weight","Task Scheduler","Reorganize String","Kth Smallest Element in a Sorted Matrix","Find K Pairs with Smallest Sums"]],["backtracking","Recursion and Backtracking",["Subsets","Subsets II","Permutations","Permutations II","Combination Sum","Combination Sum II","Letter Combinations of a Phone Number","Generate Parentheses","Word Search","N-Queens","Sudoku Solver","Palindrome Partitioning","Rat in a Maze","M-Coloring Problem","Word Break II"]],["dynamic-programming","Dynamic Programming",["Climbing Stairs","Fibonacci Number","Min Cost Climbing Stairs","House Robber","House Robber II","Coin Change","Coin Change II","Longest Increasing Subsequence","Longest Common Subsequence","Edit Distance","Unique Paths","Minimum Path Sum","Partition Equal Subset Sum","Target Sum","Word Break","Decode Ways","Maximum Product Subarray","Palindromic Substrings","Longest Palindromic Subsequence","0/1 Knapsack","Rod Cutting","Matrix Chain Multiplication","Burst Balloons","Regular Expression Matching","Best Time to Buy and Sell Stock III"]],["graphs","Graph Algorithms",["Number of Islands","Clone Graph","Course Schedule","Course Schedule II","Rotting Oranges","Flood Fill","Pacific Atlantic Water Flow","Graph Valid Tree","Number of Connected Components","Redundant Connection","Word Ladder","Accounts Merge","Network Delay Time","Cheapest Flights Within K Stops","Path With Minimum Effort","Min Cost to Connect All Points","Alien Dictionary","Reconstruct Itinerary"]],["greedy","Greedy",["Jump Game","Jump Game II","Gas Station","Candy","Assign Cookies","Non-overlapping Intervals","Merge Triplets to Form Target Triplet","Partition Labels","Minimum Number of Arrows to Burst Balloons","Hand of Straights","Task Scheduler","Job Sequencing Problem"]],["trie","Trie",["Implement Trie","Design Add and Search Words Data Structure","Word Search II","Replace Words","Longest Word in Dictionary","Maximum XOR of Two Numbers in an Array","Search Suggestions System"]],["bit-manipulation","Bit Manipulation",["Single Number","Number of 1 Bits","Counting Bits","Reverse Bits","Missing Number","Sum of Two Integers","Single Number II","Single Number III","Power of Two","Subsets Using Bitmasking","Bitwise AND of Numbers Range","XOR Queries of a Subarray"]],["intervals","Intervals",["Merge Intervals","Insert Interval","Non-overlapping Intervals","Meeting Rooms","Meeting Rooms II","Minimum Number of Arrows to Burst Balloons","Employee Free Time","My Calendar I","My Calendar II","Minimum Interval to Include Each Query"]],["prefix-sum","Prefix Sum and Difference Array",["Range Sum Query – Immutable","Range Sum Query 2D – Immutable","Subarray Sum Equals K","Continuous Subarray Sum","Product of Array Except Self","Find Pivot Index","Corporate Flight Bookings","Maximum Size Subarray Sum Equals K","Count Number of Nice Subarrays","Minimum Operations to Reduce X to Zero"]],["sorting","Sorting",["Bubble Sort","Selection Sort","Insertion Sort","Merge Sort","Quick Sort","Heap Sort","Counting Sort","Radix Sort","Sort an Array","Kth Largest Element"]],["advanced-data-structures","Advanced Data Structures",["Implement LRU Cache","Implement LFU Cache","Design Twitter","Find Median from Data Stream","Range Sum Query – Mutable","Implement Segment Tree","Fenwick Tree (Binary Indexed Tree)","Design Skiplist","Design Underground System","All O(1) Data Structure"]],["mathematics","Mathematical Algorithms",["Count Primes","Sieve of Eratosthenes","GCD and LCM","Power(x, n)","Factorial Trailing Zeroes","Excel Sheet Column Number","Happy Number","Pow(x, n)","Integer Break","Reverse Integer"]]];

const PARTIAL_TITLE_RELATIONS: Record<string,string[]> = {
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

// Only genuine title variants are eligible for automatic alias resolution.
// Similar-but-different interview questions stay separate records.
const EXACT_TITLE_ALIASES: Record<string,string[]> = {
  'sort-colors': ['Sort Colors — Dutch National Flag'],
  'burst-balloons': ['Burst Balloons (#312)'],
  'design-add-and-search-words-data-structure': ['Add and Search Words (#211)'],
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
    const titleKey = slugify(title);
    const slug = `${topicId}-${titleKey}`;
    return {
      slug,
      title,
      topicId,
      topic,
      difficulty: inferDifficulty(title),
      catalogStatus: 'review' as const,
      contentStatus: 'in-progress' as const,
      aliases: EXACT_TITLE_ALIASES[titleKey] ?? [],
      relatedTitles: PARTIAL_TITLE_RELATIONS[titleKey] ?? [],
    };
  })
);

export const MASTER_INTERVIEW_PROBLEM_ADDITION_COUNT = MASTER_INTERVIEW_PROBLEM_ADDITIONS.length;
