export type LeetCode75Difficulty = 'Easy' | 'Medium';
export interface LeetCode75Problem {
  number: number;
  title: string;
  difficulty: LeetCode75Difficulty;
  category: string;
  slug: string;
}
const groups: [string, [string, LeetCode75Difficulty, string][]][] = [
  ['Array / String', [
    ['Merge Strings Alternately','Easy','merge-strings-alternately'],['Greatest Common Divisor of Strings','Easy','greatest-common-divisor-of-strings'],['Kids With the Greatest Number of Candies','Easy','kids-with-the-greatest-number-of-candies'],['Can Place Flowers','Easy','can-place-flowers'],['Reverse Vowels of a String','Easy','reverse-vowels-of-a-string'],['Reverse Words in a String','Medium','reverse-words-in-a-string'],['Product of Array Except Self','Medium','product-of-array-except-self'],['Increasing Triplet Subsequence','Medium','increasing-triplet-subsequence'],['String Compression','Medium','string-compression'],
  ]],
  ['Two Pointers', [
    ['Move Zeroes','Easy','move-zeroes'],['Is Subsequence','Easy','is-subsequence'],['Container With Most Water','Medium','container-with-most-water'],['Max Number of K-Sum Pairs','Medium','max-number-of-k-sum-pairs'],
  ]],
  ['Sliding Window', [
    ['Maximum Average Subarray I','Easy','maximum-average-subarray-i'],['Maximum Number of Vowels in a Substring of Given Length','Medium','maximum-number-of-vowels-in-a-substring-of-given-length'],['Max Consecutive Ones III','Medium','max-consecutive-ones-iii'],["Longest Subarray of 1's After Deleting One Element",'Medium','longest-subarray-of-1s-after-deleting-one-element'],
  ]],
  ['Prefix Sum', [['Find the Highest Altitude','Easy','find-the-highest-altitude'],['Find Pivot Index','Easy','find-pivot-index']]],
  ['Hash Map / Set', [['Find the Difference of Two Arrays','Easy','find-the-difference-of-two-arrays'],['Unique Number of Occurrences','Easy','unique-number-of-occurrences'],['Determine if Two Strings Are Close','Medium','determine-if-two-strings-are-close'],['Equal Row and Column Pairs','Medium','equal-row-and-column-pairs']]],
  ['Stack', [['Removing Stars From a String','Medium','removing-stars-from-a-string'],['Asteroid Collision','Medium','asteroid-collision'],['Decode String','Medium','decode-string']]],
  ['Queue', [['Number of Recent Calls','Easy','number-of-recent-calls'],['Dota2 Senate','Medium','dota2-senate']]],
  ['Linked List', [['Delete the Middle Node of a Linked List','Medium','delete-the-middle-node-of-a-linked-list'],['Odd Even Linked List','Medium','odd-even-linked-list'],['Reverse Linked List','Easy','reverse-linked-list'],['Maximum Twin Sum of a Linked List','Medium','maximum-twin-sum-of-a-linked-list']]],
  ['Binary Tree - DFS', [['Maximum Depth of Binary Tree','Easy','maximum-depth-of-binary-tree'],['Leaf-Similar Trees','Easy','leaf-similar-trees'],['Count Good Nodes in Binary Tree','Medium','count-good-nodes-in-binary-tree'],['Path Sum III','Medium','path-sum-iii'],['Longest ZigZag Path in a Binary Tree','Medium','longest-zigzag-path-in-a-binary-tree'],['Lowest Common Ancestor of a Binary Tree','Medium','lowest-common-ancestor-of-a-binary-tree']]],
  ['Binary Tree - BFS', [['Binary Tree Right Side View','Medium','binary-tree-right-side-view'],['Maximum Level Sum of a Binary Tree','Medium','maximum-level-sum-of-a-binary-tree']]],
  ['Binary Search Tree', [['Search in a Binary Search Tree','Easy','search-in-a-binary-search-tree'],['Delete Node in a BST','Medium','delete-node-in-a-bst']]],
  ['Graphs - DFS', [['Keys and Rooms','Medium','keys-and-rooms'],['Number of Provinces','Medium','number-of-provinces'],['Reorder Routes to Make All Paths Lead to the City Zero','Medium','reorder-routes-to-make-all-paths-lead-to-the-city-zero'],['Evaluate Division','Medium','evaluate-division']]],
  ['Graphs - BFS', [['Nearest Exit from Entrance in Maze','Medium','nearest-exit-from-entrance-in-maze'],['Rotting Oranges','Medium','rotting-oranges']]],
  ['Heap / Priority Queue', [['Kth Largest Element in an Array','Medium','kth-largest-element-in-an-array'],['Smallest Number in Infinite Set','Medium','smallest-number-in-infinite-set'],['Maximum Subsequence Score','Medium','maximum-subsequence-score'],['Total Cost to Hire K Workers','Medium','total-cost-to-hire-k-workers']]],
  ['Binary Search', [['Guess Number Higher or Lower','Easy','guess-number-higher-or-lower'],['Successful Pairs of Spells and Potions','Medium','successful-pairs-of-spells-and-potions'],['Find Peak Element','Medium','find-peak-element'],['Koko Eating Bananas','Medium','koko-eating-bananas']]],
  ['Backtracking', [['Letter Combinations of a Phone Number','Medium','letter-combinations-of-a-phone-number'],['Combination Sum III','Medium','combination-sum-iii']]],
  ['DP - 1D', [['N-th Tribonacci Number','Easy','n-th-tribonacci-number'],['Min Cost Climbing Stairs','Easy','min-cost-climbing-stairs'],['House Robber','Medium','house-robber'],['Domino and Tromino Tiling','Medium','domino-and-tromino-tiling']]],
  ['DP - Multidimensional', [['Unique Paths','Medium','unique-paths'],['Longest Common Subsequence','Medium','longest-common-subsequence'],['Best Time to Buy and Sell Stock with Transaction Fee','Medium','best-time-to-buy-and-sell-stock-with-transaction-fee'],['Edit Distance','Medium','edit-distance']]],
  ['Bit Manipulation', [['Counting Bits','Easy','counting-bits'],['Single Number','Easy','single-number'],['Minimum Flips to Make a OR b Equal to c','Medium','minimum-flips-to-make-a-or-b-equal-to-c']]],
  ['Trie', [['Implement Trie (Prefix Tree)','Medium','implement-trie-prefix-tree'],['Search Suggestions System','Medium','search-suggestions-system']]],
  ['Intervals', [['Non-overlapping Intervals','Medium','non-overlapping-intervals'],['Minimum Number of Arrows to Burst Balloons','Medium','minimum-number-of-arrows-to-burst-balloons']]],
  ['Monotonic Stack', [['Daily Temperatures','Medium','daily-temperatures'],['Online Stock Span','Medium','online-stock-span']]],
];
export const LEETCODE_75_PROBLEMS: LeetCode75Problem[] = groups.flatMap(([category, items]) => items.map(([title, difficulty, slug]) => ({ number: 0, title, difficulty, category, slug }))).map((problem, index) => ({ ...problem, number: index + 1 }));
export const LEETCODE_75_CATEGORIES = groups.map(([category]) => category);
export const leetCode75Url = (slug: string) => `https://leetcode.com/problems/${slug}/`;
