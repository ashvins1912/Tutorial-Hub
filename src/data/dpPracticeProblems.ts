export type DpPracticeProblem = { level: 'Warm-up' | 'Core' | 'Challenge' | 'Advanced'; name: string; goal: string; statement: string; example: string; hint: string };

export const DP_PRACTICE_PROBLEMS: DpPracticeProblem[] = [
  {
    "level": "Warm-up",
    "name": "Fibonacci Number",
    "goal": "Compare recursion, memoization and tabulation.",
    "statement": "Return the number F(n) in the Fibonacci sequence, where F(0)=0 and F(1)=1; each later value is the sum of the previous two values.",
    "example": "n=5 → 5",
    "hint": "Define F(i); combine F(i−1) and F(i−2). State overflow handling."
  },
  {
    "level": "Warm-up",
    "name": "Climbing Stairs",
    "goal": "Define dp[i] as ways to reach stair i.",
    "statement": "From stair 0, take 1 or 2 steps; count ways to reach n.",
    "example": "n=3 → 3",
    "hint": "Last move comes from n−1 or n−2; use dp[0]=dp[1]=1."
  },
  {
    "level": "Warm-up",
    "name": "Min Cost Climbing Stairs",
    "goal": "Change count into minimum cost.",
    "statement": "Pay cost[i] when stepping on i; start at 0 or 1 and reach beyond the last index.",
    "example": "cost=[10,15,20] → 15",
    "hint": "Treat the top as a position, not a paid stair."
  },
  {
    "level": "Core",
    "name": "House Robber",
    "goal": "Model take/skip choices.",
    "statement": "Maximise money from non-adjacent houses; choosing none is allowed.",
    "example": "[2,7,9,3,1] → 12",
    "hint": "Compare skip i with money[i]+best[i−2]."
  },
  {
    "level": "Core",
    "name": "House Robber II",
    "goal": "Split circular adjacency into two ranges.",
    "statement": "Houses form a circle; first and last are adjacent. Maximise non-adjacent sum.",
    "example": "[2,3,2] → 3",
    "hint": "For n>1 solve [0,n−2] and [1,n−1]."
  },
  {
    "level": "Core",
    "name": "Unique Paths",
    "goal": "Build a grid state from top and left.",
    "statement": "Count paths in an m×n grid moving only right or down.",
    "example": "m=3,n=7 → 28",
    "hint": "Each cell sums paths from above and left; guard numeric overflow."
  },
  {
    "level": "Core",
    "name": "Minimum Path Sum",
    "goal": "Change path count into minimum cost.",
    "statement": "Find minimum sum from top-left to bottom-right moving right/down.",
    "example": "[[1,3,1],[1,5,1],[4,2,1]] → 7",
    "hint": "Cell cost plus min of valid predecessors; initialise borders."
  },
  {
    "level": "Core",
    "name": "Decode Ways",
    "goal": "Use one- and two-digit transitions.",
    "statement": "Digits 1..26 map to A..Z; count decodings; zero cannot decode alone.",
    "example": "'226' → 3",
    "hint": "Add dp[i−1] for 1..9; dp[i−2] for 10..26."
  },
  {
    "level": "Core",
    "name": "Coin Change",
    "goal": "Separate minimum coins from combinations.",
    "statement": "Given positive denominations, return fewest coins to make amount; −1 if impossible. Reuse coins.",
    "example": "coins=[1,2,5], amount=11 → 3",
    "hint": "Minimise 1+dp[a−coin]; dp[0]=0, unreachable=sentinel."
  },
  {
    "level": "Core",
    "name": "Partition Equal Subset Sum",
    "goal": "Convert partition to 0/1 subset-sum.",
    "statement": "Can positive integers split into two subsets with equal sum?",
    "example": "[1,5,11,5] → true",
    "hint": "Odd total fails; target total/2; capacity loop descends."
  },
  {
    "level": "Challenge",
    "name": "Longest Increasing Subsequence",
    "goal": "Compare O(n²) DP with O(n log n) tails.",
    "statement": "Return longest strictly increasing subsequence length; elements need not be contiguous.",
    "example": "[10,9,2,5,3,7,101,18] → 4",
    "hint": "tails stores minimum tail per length; lower_bound replaces first tail ≥ x."
  },
  {
    "level": "Challenge",
    "name": "Longest Common Subsequence",
    "goal": "Use two-prefix state; reconstruct if needed.",
    "statement": "Return longest subsequence present in both strings in the same order.",
    "example": "'abcde','ace' → 3",
    "hint": "Equal chars extend diagonal; otherwise max(top,left)."
  },
  {
    "level": "Challenge",
    "name": "Edit Distance",
    "goal": "Model insert, delete and replace.",
    "statement": "Minimum insertions/deletions/substitutions to transform word1 into word2.",
    "example": "'horse','ros' → 3",
    "hint": "Equal chars copy diagonal; else 1+min(delete,insert,replace)."
  },
  {
    "level": "Challenge",
    "name": "Target Sum",
    "goal": "Transform signed choices into subset sum when valid.",
    "statement": "Count assignments of +/− to nonnegative numbers that sum to target.",
    "example": "[1,1,1,1,1], target=3 → 5",
    "hint": "Derive P=(sum+target)/2; check range and parity."
  },
  {
    "level": "Challenge",
    "name": "Stock with Cooldown",
    "goal": "Add holding, sold and rest states.",
    "statement": "Maximise stock profit with at most one share held and one-day cooldown after selling.",
    "example": "[1,2,3,0,2] → 3",
    "hint": "Track hold/sold/rest; a sale uses a prior holding state."
  },
  {
    "level": "Advanced",
    "name": "Burst Balloons",
    "goal": "Choose the last balloon in interval DP.",
    "statement": "Burst balloons in any order; score is current neighbors' product.",
    "example": "[3,1,5,8] → 167",
    "hint": "Add boundary 1s; choose k as last balloon in (l,r)."
  },
  {
    "level": "Advanced",
    "name": "Palindrome Partitioning II",
    "goal": "Precompute palindromes and optimise cuts.",
    "statement": "Split string into palindromic substrings with minimum cuts.",
    "example": "'aab' → 1",
    "hint": "Precompute palindrome[i][j]; minimise pieces, then subtract one."
  },
  {
    "level": "Advanced",
    "name": "Word Break",
    "goal": "Use prefix reachability and dictionary membership.",
    "statement": "Can string be segmented into dictionary words? Words may be reused.",
    "example": "'leetcode', ['leet','code'] → true",
    "hint": "dp[i] means prefix [0,i) is segmentable; test reachable j."
  },
  {
    "level": "Advanced",
    "name": "Regular Expression Matching",
    "goal": "Model string and pattern positions.",
    "statement": "Full match with '.' for any one char and '*' for zero or more of preceding token.",
    "example": "s='aa', p='a*' → true",
    "hint": "For x*, skip the pair or consume one matching char and stay on x*."
  },
  {
    "level": "Advanced",
    "name": "Traveling Salesperson / Assignment DP",
    "goal": "Use bitmask state for small n.",
    "statement": "Minimum tour from city 0 visiting each city once and returning to 0 in a weighted complete graph.",
    "example": "cost=[[0,10,15,20],[10,0,35,25],[15,35,0,30],[20,25,30,0]] → 80",
    "hint": "dp[mask][last]; transition to unvisited city. State count is exponential."
  }
];
