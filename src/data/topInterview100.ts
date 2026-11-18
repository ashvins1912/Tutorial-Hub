export type Top100Difficulty = 'Easy' | 'Medium' | 'Hard';
export interface Top100Problem { number: number; title: string; difficulty: Top100Difficulty; category: string; slug: string; }
const groups: [string, [string, Top100Difficulty, string?][]][] = [
['Backtracking',[
['Letter Combinations of a Phone Number','Medium'],['Generate Parentheses','Medium'],['Combination Sum','Medium'],['Permutations','Medium'],['N-Queens','Hard'],['Subsets','Medium'],['Word Search','Medium'],['Palindrome Partitioning','Medium']]],
['Binary Search',[
['Median of Two Sorted Arrays','Hard'],['Search in Rotated Sorted Array','Medium'],['Find First and Last Position of Element in Sorted Array','Medium'],['Search Insert Position','Easy'],['Search a 2D Matrix','Medium'],['Binary Tree Maximum Path Sum','Hard'],['Find Minimum in Rotated Sorted Array','Medium']]],
['Binary Tree',[
['Binary Tree Inorder Traversal','Easy'],['Validate Binary Search Tree','Medium'],['Symmetric Tree','Easy'],['Binary Tree Level Order Traversal','Medium'],['Maximum Depth of Binary Tree','Easy'],['Construct Binary Tree from Preorder and Inorder Traversal','Medium'],['Convert Sorted Array to Binary Search Tree','Easy'],['Flatten Binary Tree to Linked List','Medium'],['Binary Tree Right Side View','Medium'],['Invert Binary Tree','Easy'],['Kth Smallest Element in a BST','Medium'],['Lowest Common Ancestor of a Binary Tree','Medium'],['Path Sum III','Medium'],['Diameter of Binary Tree','Easy']]],
['Dynamic Programming',[
['Longest Palindromic Substring','Medium'],['Longest Valid Parentheses','Hard'],['Unique Paths','Medium'],['Minimum Path Sum','Medium'],['Climbing Stairs','Easy'],['Edit Distance','Medium'],["Pascal's Triangle",'Easy'],['Word Break','Medium'],['Maximum Product Subarray','Medium'],['House Robber','Medium'],['Perfect Squares','Medium'],['Longest Increasing Subsequence','Medium'],['Coin Change','Medium'],['Partition Equal Subset Sum','Medium'],['Longest Common Subsequence','Medium']]],
['Graph',[
['Number of Islands','Medium'],['Course Schedule','Medium'],['Rotting Oranges','Medium']]],
['Greedy',[
['Jump Game II','Medium'],['Jump Game','Medium'],['Best Time to Buy and Sell Stock','Easy'],['Partition Labels','Medium']]],
['Hashing',[
['Two Sum','Easy'],['Group Anagrams','Medium'],['Longest Consecutive Sequence','Medium'],['Subarray Sum Equals K','Medium']]],
['Heap',[
['Kth Largest Element in an Array','Medium'],['Find Median from Data Stream','Hard'],['Top K Frequent Elements','Medium']]],
['Linked Lists',[
['Add Two Numbers','Medium'],['Remove Nth Node From End of List','Medium'],['Merge Two Sorted Lists','Easy'],['Merge k Sorted Lists','Hard'],['Swap Nodes in Pairs','Medium'],['Reverse Nodes in k-Group','Hard'],['Copy List with Random Pointer','Medium'],['Linked List Cycle','Easy'],['Linked List Cycle II','Medium'],['LRU Cache','Medium'],['Sort List','Medium'],['Intersection of Two Linked Lists','Easy'],['Reverse Linked List','Easy'],['Palindrome Linked List','Easy']]],
['Matrix',[
['Rotate Image','Medium'],['Spiral Matrix','Medium'],['Set Matrix Zeroes','Medium'],['Search a 2D Matrix II','Medium']]],
['Sliding Window',[
['Longest Substring Without Repeating Characters','Medium'],['Minimum Window Substring','Hard'],['Sliding Window Maximum','Hard'],['Find All Anagrams in a String','Medium']]],
['Stack',[
['Valid Parentheses','Easy'],['Largest Rectangle in Histogram','Hard'],['Min Stack','Medium'],['Decode String','Medium'],['Daily Temperatures','Medium']]],
['Two Pointers',[
['Container With Most Water','Medium'],['3Sum','Medium'],['Trapping Rain Water','Hard'],['Move Zeroes','Easy']]],
['Trie',[
['Implement Trie (Prefix Tree)','Medium']]],
['Misc',[
['Next Permutation','Medium'],['First Missing Positive','Hard'],['Maximum Subarray','Medium'],['Merge Intervals','Medium'],['Sort Colors','Medium'],['Single Number','Easy'],['Majority Element','Easy'],['Rotate Array','Medium'],['Product of Array Except Self','Medium'],['Find the Duplicate Number','Medium']]]
];
const slugify = (title: string) => title.toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const TOP_INTERVIEW_100: Top100Problem[] = groups.flatMap(([category, items]) => items.map(([title,difficulty,slug]) => ({ number: 0, title, difficulty, category, slug: slug || slugify(title) }))).map((problem,index) => ({...problem,number:index+1}));
export const TOP_INTERVIEW_100_CATEGORIES = groups.map(([category]) => category);
export const topInterview100Url = (slug: string) => `https://leetcode.com/problems/${slug}/`;
