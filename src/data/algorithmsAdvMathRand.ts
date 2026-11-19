import type { AlgorithmDefinition } from './algorithmsCatalog';
import type { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';

export const ADV_MATH_RAND_ALGORITHMS: AlgorithmDefinition[] = [
  // =========================================================================
  // CATEGORY 10: NUMBER THEORY & GEOMETRY (4)
  // =========================================================================

  // 40. Sieve of Eratosthenes & Segmented Sieve
  {
    id: 'sieve-of-eratosthenes',
    name: 'Sieve of Eratosthenes & Segmented Sieve',
    shortName: 'Prime Sieve',
    category: 'Number Theory & Geometry',
    visualType: 'number-sieve',
    tagline: 'Generate all prime numbers up to N in O(N log log N) by crossing out prime multiples starting at p².',
    timeComplexity: 'O(N log log N)',
    spaceComplexity: 'O(N) · O(√R) Segmented',
    complexityLeap: 'O(N√N) trial division → near-linear O(N log log N) prime marking',
    coreIdea:
      'Maintain boolean isPrime[0..N]. For each unmarked p up to √N, mark multiples p², p² + p, p² + 2p, ... as composite (every smaller multiple k·p with k < p was already crossed out by k’s prime factors!). For huge ranges [L, R] up to 10¹², a Segmented Sieve uses primes up to √R to sieve [L, R] in O(R - L) memory.',
    mentalModelSteps: [
      'Initialize isPrime[0..N] = true; mark 0 and 1 false.',
      'Loop p from 2 while p * p <= N: skip if !isPrime[p].',
      'Inner loop starts at m = p * p (not 2*p!), stepping by +p to mark composites.',
      'Segmented Sieve for [L, R]: sieve base primes up to √R, then mark first multiple ceil(L / p) * p inside [L, R].',
    ],
    loopInvariant: 'When the outer loop reaches p, every composite ≤ p² - 1 has already been marked false.',
    whenToUse: [
      'Count Primes (LC 204) & Fastest prime factorization via Smallest Prime Factor (SPF) sieve',
      'Segmented Sieve for primes inside huge intervals [L, R] where R ≤ 10¹² and R - L ≤ 10⁶',
    ],
    whenItFails: 'For testing primality of a single huge 64-bit integer (e.g., 10¹⁸), use deterministic Miller-Rabin instead of sieving.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['two-sum', 'first-missing-positive', 'product-of-array-except-self'],
    templates: {
      python: `def sieve(n):
    if n < 2: return []
    prime = [True] * (n + 1)
    prime[0] = prime[1] = False
    p = 2
    while p * p <= n:
        if prime[p]:
            for m in range(p * p, n + 1, p):
                prime[m] = False
        p += 1
    return [i for i, ok in enumerate(prime) if ok]`,
      js: `function sievePrimes(n) {
  if (n < 2) return [];
  const isPrime = new Uint8Array(n + 1).fill(1);
  isPrime[0] = isPrime[1] = 0;
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let m = p * p; m <= n; m += p) isPrime[m] = 0;
    }
  }
  const out = [];
  for (let i = 2; i <= n; i++) if (isPrime[i]) out.push(i);
  return out;
}`,
      java: `for (int p = 2; p * p <= n; p++)
  if (isPrime[p]) for (int m = p * p; m <= n; m += p) isPrime[m] = false;`,
    },
    frames: [
      {
        step: 1,
        title: 'p = 2 (Prime!): Cross Out Even Multiples Starting at 2² = 4',
        explanation: 'Marks 4, 6, 8, 10, 12, 14, 16, 18, 20 composite in one sweep!',
        invariantCheck: 'All composites with factor 2 eliminated.',
        variables: [{ name: 'prime p', value: '2' }, { name: 'start at p²', value: '4' }],
        array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        matchedIndices: [0], eliminatedIndices: [2, 4, 6, 8, 10, 12, 14, 16, 18],
        pointers: [{ label: 'p=2', index: 0, tone: 'emerald' }],
      },
      {
        step: 2,
        title: 'p = 3 (Prime!): Start at 3² = 9 → Cross Out 9, 12, 15, 18',
        explanation: '6 was already crossed out by 2! Starting at p² = 9 eliminates 9 and 15 cleanly.',
        invariantCheck: 'Next candidate p = 4 is already crossed out → skipped!',
        variables: [{ name: 'prime p', value: '3' }, { name: 'start at p²', value: '9' }],
        array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        matchedIndices: [0, 1], highlightIndices: [7, 13],
        eliminatedIndices: [2, 4, 6, 7, 8, 10, 12, 13, 14, 16, 18],
        pointers: [{ label: 'p=3', index: 1, tone: 'emerald' }],
      },
      {
        step: 3,
        title: 'p = 5: Since 5² = 25 > 20, STOP! All 8 Primes ≤ 20 Confirmed!',
        explanation: 'No composite ≤ 20 can have smallest prime factor ≥ 5. Remaining unmarked cells = [2, 3, 5, 7, 11, 13, 17, 19]!',
        invariantCheck: 'Stopping at √N gives O(N log log N) total markings.',
        variables: [{ name: 'p² > N', value: '25 > 20 → DONE' }, { name: 'primes ≤ 20', value: '8 primes ✓' }],
        array: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        matchedIndices: [0, 1, 3, 5, 9, 11, 15, 17],
        eliminatedIndices: [2, 4, 6, 7, 8, 10, 12, 13, 14, 16, 18],
        hashEntries: [{ key: 'Primes ≤ 20', val: '2, 3, 5, 7, 11, 13, 17, 19', hit: true }],
      },
    ],
  },

  // 41. Euclidean & Extended Euclidean Algorithms
  {
    id: 'euclidean-extended-gcd',
    name: 'Euclidean & Extended Euclidean (GCD / Inverse)',
    shortName: 'Extended GCD',
    category: 'Number Theory & Geometry',
    visualType: 'number-sieve',
    tagline: 'Compute GCD(a, b) and Bezout coefficients a·x + b·y = g (modular inverse!) in O(log min(a, b)).',
    timeComplexity: 'O(log min(a, b))',
    spaceComplexity: 'O(1) iter · O(log) rec',
    complexityLeap: 'O(min(a,b)) divisor search → logarithmic O(log N) Euclidean remainder collapse',
    coreIdea:
      'Because gcd(a, b) === gcd(b, a % b), every two remainder steps cut the numbers by at least half! Extended GCD unwinds the recursion to produce integers (x, y) satisfying a·x + b·y = gcd(a, b). When gcd(a, m) == 1, (x % m + m) % m is the exact MODULAR INVERSE of a mod m!',
    mentalModelSteps: [
      'Base case: when b === 0, return { g: a, x: 1, y: 0 } since a·1 + 0·0 = a.',
      'Recurse on (b, a % b) to get { g, x1, y1 } satisfying b·x1 + (a % b)·y1 = g.',
      'Substitute a % b = a - floor(a / b) * b to derive: x = y1 and y = x1 - floor(a / b) * y1!',
      'Modular Inverse a⁻¹ mod m exists iff g === 1, equal to ((x % m) + m) % m.',
    ],
    loopInvariant: 'At every unwinding level, a·x + b·y === gcd(a, b) holds identically.',
    whenToUse: [
      'Modular inverse when modulus m is NOT prime (Fermat’s Little Theorem requires prime m; Extended GCD works for ANY coprime m!)',
      'Solving Linear Diophantine Equations ax + by = c & Chinese Remainder Theorem (CRT)',
      'Water and Jug Problem (LC 365 — Bezout’s Identity: target % gcd(x, y) == 0)',
    ],
    whenItFails: 'Modular inverse does NOT exist if gcd(a, m) > 1.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['two-sum', 'subarray-sum-equals-k', 'climbing-stairs'],
    templates: {
      python: `def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    return g, y1, x1 - (a // b) * y1

def mod_inverse(a, m):
    g, x, _ = extended_gcd(a, m)
    return (x % m) if g == 1 else -1`,
      js: `function extendedGcd(a, b) {
  if (b === 0) return [a, 1, 0];
  const [g, x1, y1] = extendedGcd(b, a % b);
  return [g, y1, x1 - Math.floor(a / b) * y1];
}
function modInverse(a, m) {
  const [g, x] = extendedGcd(a, m);
  return g === 1 ? ((x % m) + m) % m : -1;
}`,
      java: `// Returns {g, x, y} where a*x + b*y = g
long[] extGcd(long a, long b) {
  if (b == 0) return new long[]{a, 1, 0};
  long[] r = extGcd(b, a % b);
  return new long[]{r[0], r[2], r[1] - (a / b) * r[2]};
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Forward Division Cascade: Find 7⁻¹ mod 26 via extGcd(7, 26)',
        explanation: '26 = 3·7 + 5 → 7 = 1·5 + 2 → 5 = 2·2 + 1 → 2 = 2·1 + 0. GCD = 1 (inverse exists!).',
        invariantCheck: 'Remainders plunge exponentially: 26 → 7 → 5 → 2 → 1 → 0.',
        variables: [{ name: 'a, m', value: '7, 26' }, { name: 'gcd(7, 26)', value: '1 (Coprime!)' }],
        array: ['(7,26)', '(26,7)', '(7,5)', '(5,2)', '(2,1)', '(1,0)'],
        secondaryArray: ['q=0', 'q=3', 'q=1', 'q=2', 'q=2', 'BASE'],
        matchedIndices: [5],
        pointers: [{ label: 'BASE', index: 5, tone: 'emerald' }],
      },
      {
        step: 2,
        title: 'Back-Substitute Bezout Identity: 7·(-11) + 26·(3) = 1!',
        explanation: 'Unwinding x = y1, y = x1 - q·y1 produces x = -11, y = 3. Check: -77 + 78 = 1!',
        invariantCheck: 'a·x + m·y = 1 holds at root.',
        variables: [{ name: 'x / y', value: '-11 / 3' }, { name: 'check', value: '7(-11) + 26(3) = 1 ✓' }],
        array: ['(-11,3)', '(3,-11)', '(-2,3)', '(1,-2)', '(0,1)', '(1,0)'],
        secondaryArray: ['7x+26y', '26x+7y', '7x+5y', '5x+2y', '2x+1y', '1x+0y'],
        highlightIndices: [0, 1, 2],
        pointers: [{ label: 'ROOT', index: 0, tone: 'sky' }],
      },
      {
        step: 3,
        title: 'Normalize Positive Mod 26: (-11 + 26) % 26 = 15 (7 × 15 = 105 ≡ 1 mod 26)!',
        explanation: '15 is the exact modular inverse of 7 modulo 26 (essential for Affine ciphers & combinatorics!).',
        invariantCheck: '(7 × 15) % 26 === 105 % 26 === 1.',
        variables: [{ name: '7⁻¹ mod 26', value: '15 ✓' }, { name: 'verify', value: '7×15 = 105 ≡ 1' }],
        array: ['7', '×', '15', '=', '105', '≡ 1'],
        secondaryArray: ['a', '·', 'a⁻¹', '', 'mod 26', 'HIT'],
        matchedIndices: [0, 2, 5],
        hashEntries: [{ key: 'modInverse(7, 26)', val: '15 (7×15 ≡ 1 mod 26)', hit: true }],
      },
    ],
  },

  // 42. Modular Exponentiation (Binary Exponentiation)
  {
    id: 'modular-exponentiation',
    name: 'Modular Exponentiation (Binary Squaring)',
    shortName: 'Mod Exponentiation',
    category: 'Number Theory & Geometry',
    visualType: 'number-sieve',
    tagline: 'Compute (a^b) mod m in O(log b) via binary bit decomposition and repeated squaring.',
    timeComplexity: 'O(log b)',
    spaceComplexity: 'O(1)',
    complexityLeap: 'O(b) multiplications (impossible for b = 10¹⁸) → ≤ 60 squarings in O(log b)',
    coreIdea:
      'Decompose exponent b in binary (e.g., 13 = 1101₂ = 8 + 4 + 1). Square the base each bit step (a¹, a², a⁴, a⁸ mod m) and multiply into `res` ONLY when the current lowest bit `(b & 1) === 1`!',
    mentalModelSteps: [
      'Initialize res = 1 % m and base = ((a % m) + m) % m.',
      'While b > 0: if b is odd (b & 1), set res = (res * base) % m.',
      'Square base = (base * base) % m and halve exponent b >>= 1 (or BigInt for 64-bit safety!).',
      'Bonus: By Fermat’s Little Theorem, when p is prime, a⁻¹ mod p = modPow(a, p - 2, p)!',
    ],
    loopInvariant: 'At every iteration, res · (base^b) ≡ a^b₀ (mod m).',
    whenToUse: [
      'Pow(x, n) (LC 50), Count Good Numbers (LC 1922), RSA Cryptography',
      'Fast Matrix Exponentiation for O(log N) Fibonacci / Linear Recurrences',
      'Fermat modular inverse a^(p-2) mod p for nCr combinatorics mod 10⁹+7',
    ],
    whenItFails: 'In JS, multiplying two 10⁹ numbers overflows 2⁵³ safe integer precision — use BigInt whenever m > 10⁷!',
    linkedTopics: ['Modified Binary Search', 'Dynamic Programming'],
    linkedProblemSlugs: ['binary-search-classic', 'climbing-stairs', 'coin-change'],
    templates: {
      python: `def mod_pow(base, exp, mod):
    res = 1 % mod
    base %= mod
    while exp > 0:
        if exp & 1:
            res = (res * base) % mod
        base = (base * base) % mod
        exp >>= 1
    return res`,
      js: `function modPow(base, exp, mod) {
  let res = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp), m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) res = (res * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(res);
}`,
      java: `long modPow(long a, long b, long m) {
  long res = 1 % m; a %= m;
  while (b > 0) { if ((b & 1) == 1) res = (res * a) % m; a = (a * a) % m; b >>= 1; }
  return res;
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Compute 3¹³ mod 100 → Binary 13 = 1101₂ (Bits 8 + 4 + 1)',
        explanation: 'Instead of 13 multiplications, compute 3¹, 3², 3⁴, 3⁸ mod 100 in just 4 squarings!',
        invariantCheck: '3¹³ = 3⁸ × 3⁴ × 3¹.',
        variables: [{ name: 'exp = 13', value: '1101₂' }, { name: 'res', value: '1' }],
        array: ['bit 0 (1)', 'bit 1 (0)', 'bit 2 (1)', 'bit 3 (1)'],
        secondaryArray: ['3¹ = 3', '3² = 9', '3⁴ = 81', '3⁸ = 61'],
        pointers: [{ label: 'e=13', index: 0, tone: 'sky' }], highlightIndices: [0],
      },
      {
        step: 2,
        title: 'Bit 0 = 1 (×3 → res=3) · Bit 1 = 0 (skip) · Bit 2 = 1 (×81 → res=43)',
        explanation: 'Bit 0 multiplies res = 1×3 = 3. Bit 1 is 0 so skip 9. Bit 2 multiplies res = (3×81) % 100 = 43!',
        invariantCheck: 'Invariant: 43 × (61¹) ≡ 3¹³ (mod 100).',
        variables: [{ name: 'res so far', value: '43 (= 3⁵ mod 100)' }, { name: 'next base', value: '81² % 100 = 61' }],
        array: ['bit 0 (1)', 'bit 1 (0)', 'bit 2 (1)', 'bit 3 (1)'],
        secondaryArray: ['×3 → 3', 'skip', '×81 → 43', 'pending 61'],
        matchedIndices: [0, 2], eliminatedIndices: [1], highlightIndices: [3],
        pointers: [{ label: 'e=1', index: 3, tone: 'amber' }],
      },
      {
        step: 3,
        title: 'Bit 3 = 1 (×61) → (43 × 61) % 100 = 23! (3¹³ = 1,594,323)',
        explanation: '43 × 61 = 2623 ≡ 23 (mod 100)! Exact last two digits of 3¹³ found in 4 iterations!',
        invariantCheck: 'Finished in ⌊log₂ 13⌋ + 1 = 4 steps.',
        variables: [{ name: '3¹³ mod 100', value: '23 ✓' }, { name: 'iterations', value: '4 (O(log b))' }],
        array: ['bit 0 (1)', 'bit 1 (0)', 'bit 2 (1)', 'bit 3 (1)'],
        secondaryArray: ['×3', 'skip', '×81', '×61 → 23 ✓'],
        matchedIndices: [0, 2, 3], eliminatedIndices: [1],
        hashEntries: [{ key: 'modPow(3, 13, 100)', val: '23', hit: true }],
      },
    ],
  },

  // 43. Graham Scan / Andrew's Monotone Chain (Convex Hull)
  {
    id: 'convex-hull-graham-scan',
    name: 'Graham Scan / Monotone Chain (Convex Hull)',
    shortName: 'Convex Hull',
    category: 'Number Theory & Geometry',
    visualType: 'geometry-hull',
    tagline: 'Wrap a tightest 2D convex polygon around N points in O(N log N) using cross-product turns.',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    complexityLeap: 'O(N³) edge-pair testing → O(N log N) sorted stack sweep with O(1) cross-product turns',
    coreIdea:
      'Andrew’s Monotone Chain sorts points lexicographically by (x, y), then builds the LOWER hull left-to-right and UPPER hull right-to-left. Whenever the last 3 points (A, B, C) make a clockwise right turn (cross(A, B, C) < 0), pop the concave middle point B!',
    mentalModelSteps: [
      'Sort all points by x ascending, then y ascending.',
      'Define cross(O, A, B) = (A.x - O.x)*(B.y - O.y) - (A.y - O.y)*(B.x - O.x) (>0 = CCW left turn, <0 = CW right turn).',
      'Build Lower Hull scanning left-to-right: pop while cross(H[-2], H[-1], P) <= 0 (or < 0 to keep collinear boundary points).',
      'Build Upper Hull scanning right-to-left with the exact same stack loop; concatenate lower[:-1] + upper[:-1]!',
    ],
    loopInvariant: 'Every consecutive triple on the active hull stack makes a strict counter-clockwise (convex) turn.',
    whenToUse: [
      'Erect the Fence (LC 587 — exact Convex Hull boundary including collinear points)',
      'Rotating Calipers (Farthest Pair of Points / Minimum Bounding Rectangle)',
      'Collision detection & GIS spatial boundary computation',
    ],
    whenItFails: 'Always use integer cross products (no atan2 floating-point angle drift!) and watch whether collinear points on edges should be kept (< 0) or discarded (<= 0).',
    linkedTopics: ['Monotonic Stack'],
    linkedProblemSlugs: ['largest-rectangle-in-histogram', 'daily-temperatures', 'container-with-most-water'],
    templates: {
      python: `def convex_hull(points):
    pts = sorted(set(map(tuple, points)))
    if len(pts) <= 1: return pts
    cross = lambda o, a, b: (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0: lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0: upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]`,
      js: `function convexHull(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length <= 2) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}`,
      java: `long cross(int[] o, int[] a, int[] b) {
  return (long)(a[0]-o[0])*(b[1]-o[1]) - (long)(a[1]-o[1])*(b[0]-o[0]);
}`,
    },
    frames: [
      {
        step: 1,
        title: 'Sort Points Left-to-Right: P0(1,3), P1(2,5), P2(3,3), P3(4,1), P4(6,4)',
        explanation: 'Lexicographical sort avoids slow/imprecise polar angles (atan2). Begin Lower Hull sweep from P0.',
        invariantCheck: 'Leftmost point P0(1,3) is guaranteed to lie on the Convex Hull.',
        variables: [{ name: 'sorted pts', value: '5 points' }, { name: 'lower stack', value: '[P0, P2]' }],
        geometrySpec: {
          mode: 'hull',
          caption: '2D Coordinate Plane — Andrew’s Monotone Chain Sweep',
          points: [
            { x: 1, y: 3, label: 'P0', highlight: true }, { x: 2, y: 5, label: 'P1' },
            { x: 3, y: 3, label: 'P2', highlight: true }, { x: 4, y: 1, label: 'P3' }, { x: 6, y: 4, label: 'P4' },
          ],
          hullPath: [[1, 3], [3, 3]],
        },
      },
      {
        step: 2,
        title: 'Cross(P0, P2, P3) < 0 (Clockwise!) → Pop Concave Interior Point P2!',
        explanation: 'Turning from P0→P2→P3 bends CLOCKWISE (right turn), proving P2 sits INSIDE the hull! Pop P2 and connect P0→P3 directly!',
        invariantCheck: 'Stack pops interior points in O(1) amortized.',
        variables: [{ name: 'cross(P0,P2,P3)', value: '-4 < 0 (CW → POP P2)' }, { name: 'lower hull', value: '[P0, P3, P4]' }],
        geometrySpec: {
          mode: 'hull',
          caption: 'Clockwise turn pops P2(3,3) → Lower Hull [P0, P3, P4]',
          points: [
            { x: 1, y: 3, label: 'P0', highlight: true }, { x: 2, y: 5, label: 'P1' },
            { x: 3, y: 3, label: 'P2 ✕', pruned: true }, { x: 4, y: 1, label: 'P3', highlight: true }, { x: 6, y: 4, label: 'P4', highlight: true },
          ],
          hullPath: [[1, 3], [4, 1], [6, 4]],
        },
      },
      {
        step: 3,
        title: 'Upper Hull Sweep Right-to-Left → Closed Convex Hull [P0, P3, P4, P1]!',
        explanation: 'Upper sweep P4 → P1 → P0 closes the convex polygon around interior point P2 in O(N log N)!',
        invariantCheck: 'All 4 hull edges turn strictly counter-clockwise.',
        variables: [{ name: 'hull vertices', value: '4 (P0, P3, P4, P1)' }, { name: 'interior', value: 'P2 excluded' }],
        geometrySpec: {
          mode: 'hull',
          caption: 'Complete Convex Hull Polygon (4 vertices, CCW order)',
          points: [
            { x: 1, y: 3, label: 'P0', highlight: true }, { x: 2, y: 5, label: 'P1', highlight: true },
            { x: 3, y: 3, label: 'P2', pruned: true }, { x: 4, y: 1, label: 'P3', highlight: true }, { x: 6, y: 4, label: 'P4', highlight: true },
          ],
          hullPath: [[1, 3], [4, 1], [6, 4], [2, 5], [1, 3]],
        },
      },
    ],
  },

  // =========================================================================
  // CATEGORY 11: RANDOMIZED & HEURISTIC ALGORITHMS (2)
  // =========================================================================

  // 44. Reservoir Sampling
  {
    id: 'reservoir-sampling',
    name: 'Reservoir Sampling (Algorithm R)',
    shortName: 'Reservoir Sampling',
    category: 'Randomized & Heuristic Algorithms',
    visualType: 'stream-partition',
    tagline: 'Uniformly sample k items from an unbounded stream of unknown length N in O(N) time & O(k) space.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(k)',
    complexityLeap: 'O(N) buffering entire petabyte stream → O(k) single-pass exact uniform probability k/N',
    coreIdea:
      'Fill the reservoir with the first k stream items. For each subsequent item at 0-based index i ≥ k, draw a random integer j ∈ [0, i]. If j < k, replace reservoir[j] = stream[i]! By mathematical induction, EVERY item seen so far has exact probability k / (i + 1) of sitting in the reservoir!',
    mentalModelSteps: [
      'Copy the first k elements directly into reservoir[0..k-1].',
      'For each arriving element stream[i] (i = k, k+1, ...): pick uniform random integer j in [0, i].',
      'If j < k, overwrite reservoir[j] = stream[i] (probability k / (i + 1)).',
      'Induction proof: old item survives step i with prob (k/i) · (1 - 1/(i+1)) = k/(i+1)!',
    ],
    loopInvariant: 'After reading i + 1 elements, every element seen so far is in the reservoir with exact probability k / (i + 1).',
    whenToUse: [
      'Linked List Random Node (LC 382) & Random Pick Index (LC 398)',
      'Distributed log sampling / A-B telemetry sampling over infinite Kafka streams',
    ],
    whenItFails: 'For huge streams where k << N, Algorithm L skips elements geometrically in O(k(1 + log(N/k))) instead of generating N random numbers.',
    linkedTopics: ['Linked Lists', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['linked-list-cycle', 'reverse-linked-list', 'two-sum'],
    templates: {
      python: `import random

def reservoir_sample(stream, k):
    res = []
    for i, item in enumerate(stream):
        if i < k:
            res.append(item)
        else:
            j = random.randint(0, i)
            if j < k:
                res[j] = item
    return res`,
      js: `function reservoirSample(stream, k) {
  const res = [];
  for (let i = 0; i < stream.length; i++) {
    if (i < k) res.push(stream[i]);
    else {
      const j = Math.floor(Math.random() * (i + 1));
      if (j < k) res[j] = stream[i];
    }
  }
  return res;
}`,
      java: `int j = rand.nextInt(i + 1);
if (j < k) res[j] = stream[i];`,
    },
    frames: [
      {
        step: 1,
        title: 'Fill Initial Reservoir (k = 2) With First 2 Stream Items [A, B]',
        explanation: 'Before i = 2 arrives, reservoir holds [A, B] with survival probability 2/2 = 100%.',
        invariantCheck: 'Every seen item has probability min(1, k / count).',
        variables: [{ name: 'k', value: '2' }, { name: 'reservoir', value: '[A, B]' }, { name: 'P(each)', value: '100%' }],
        array: ['A', 'B', 'C', 'D', 'E', 'F'], secondaryArray: ['in R', 'in R', 'wait', 'wait', 'wait', 'wait'],
        matchedIndices: [0, 1], windowRange: [0, 1],
        hashEntries: [{ key: 'slot 0', val: 'A' }, { key: 'slot 1', val: 'B' }],
      },
      {
        step: 2,
        title: 'Item C (i = 2) Arrives: Draw j ∈ [0..2] → j = 1 (< 2) → Swap B with C!',
        explanation: 'C enters with prob 2/3! A survives with prob 1 × (1 - 1/3) = 2/3; B survives with prob 2/3!',
        invariantCheck: 'All 3 items {A, B, C} now share exact probability 2/3!',
        variables: [{ name: 'i = 2 (C)', value: 'rand j = 1 < 2' }, { name: 'reservoir', value: '[A, C]' }, { name: 'P(each)', value: '2 / 3 (66.7%)' }],
        array: ['A', 'B', 'C', 'D', 'E', 'F'], secondaryArray: ['in R', 'evict', 'in R', 'wait', 'wait', 'wait'],
        matchedIndices: [0, 2], eliminatedIndices: [1], pointers: [{ label: 'i=2', index: 2, tone: 'emerald' }],
        hashEntries: [{ key: 'slot 0', val: 'A' }, { key: 'slot 1', val: 'C (NEW!)', hit: true }],
      },
      {
        step: 3,
        title: 'Stream Ends at F (i = 5): Every Item Had Exact 2/6 = 33.3% Chance!',
        explanation: 'D (j=3 ≥ 2 skip), E (j=0 → replaces A), F (j=4 ≥ 2 skip). Final sample [E, C] in O(k) memory!',
        invariantCheck: 'Zero knowledge of N was needed upfront.',
        variables: [{ name: 'stream seen', value: 'N = 6' }, { name: 'final sample', value: '[E, C]' }, { name: 'P(each)', value: '2 / 6 (33.3%)' }],
        array: ['A', 'B', 'C', 'D', 'E', 'F'], secondaryArray: ['evict', 'evict', 'in R', 'skip', 'in R', 'skip'],
        matchedIndices: [2, 4], eliminatedIndices: [0, 1, 3, 5], pointers: [{ label: 'end', index: 5, tone: 'sky' }],
        hashEntries: [{ key: 'slot 0', val: 'E', hit: true }, { key: 'slot 1', val: 'C', hit: true }],
      },
    ],
  },

  // 45. Quickselect (Hoare's Selection Algorithm)
  {
    id: 'quickselect',
    name: 'Quickselect (Randomized K-th Element)',
    shortName: 'Quickselect',
    category: 'Randomized & Heuristic Algorithms',
    visualType: 'stream-partition',
    tagline: 'Find the k-th smallest/largest element in an unsorted array in O(N) average time & O(1) space.',
    timeComplexity: 'O(N) avg · O(N²) worst',
    spaceComplexity: 'O(1) iterative',
    complexityLeap: 'O(N log N) full sort → O(N) expected work by recursing on ONLY ONE partition side',
    coreIdea:
      'Pick a RANDOM pivot (defeating adversarial sorted inputs!) and Lomuto/Hoare-partition the array into [< pivot | pivot | > pivot]. Now pivot sits at its final sorted index `p`. If `p === targetIdx`, DONE! Otherwise discard the entire opposite side — summing N + N/2 + N/4 + ... = 2N = O(N)!',
    mentalModelSteps: [
      'Convert "k-th largest" into 0-based target index `target = n - k` (or `k - 1` for k-th smallest).',
      'Choose a RANDOM pivot index in [lo, hi] and swap it to hi (prevents O(N²) on sorted arrays!).',
      'Partition [lo..hi] into elements <= pivot on the left and > pivot on the right; place pivot at `p`.',
      'If p === target return nums[p]; if p < target set lo = p + 1; else set hi = p - 1!',
    ],
    loopInvariant: 'The true k-th element ALWAYS resides inside the active range [lo, hi].',
    whenToUse: [
      'Kth Largest Element in an Array (LC 215) & K Closest Points to Origin (LC 973)',
      'Top K Frequent Elements (LC 347 — O(N) Quickselect on frequency pairs)',
      'Exact median computation in O(N) expected time',
    ],
    whenItFails: 'Arrays with millions of identical duplicates degrade basic Lomuto partition to O(N²) — use 3-Way Dutch National Flag partition (<, ==, >) for duplicate-heavy inputs!',
    linkedTopics: ['Heaps & Intervals', 'Two Pointers'],
    linkedProblemSlugs: ['kth-largest-in-stream', 'find-median-from-data-stream', 'container-with-most-water'],
    templates: {
      python: `import random
def quickselect(nums, k_idx):  # 0-based k-th smallest
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        piv_i = random.randint(lo, hi)
        nums[piv_i], nums[hi] = nums[hi], nums[piv_i]
        pivot, store = nums[hi], lo
        for i in range(lo, hi):
            if nums[i] <= pivot:
                nums[store], nums[i] = nums[i], nums[store]
                store += 1
        nums[store], nums[hi] = nums[hi], nums[store]
        if store == k_idx: return nums[store]
        if store < k_idx: lo = store + 1
        else: hi = store - 1`,
      js: `function quickselectKthSmallest(nums, k) {
  let lo = 0, hi = nums.length - 1, target = k - 1;
  while (lo <= hi) {
    const pivIdx = lo + ((hi - lo) >> 1);
    [nums[pivIdx], nums[hi]] = [nums[hi], nums[pivIdx]];
    const pivot = nums[hi];
    let store = lo;
    for (let i = lo; i < hi; i++) {
      if (nums[i] <= pivot) { [nums[store], nums[i]] = [nums[i], nums[store]]; store++; }
    }
    [nums[store], nums[hi]] = [nums[hi], nums[store]];
    if (store === target) return nums[store];
    if (store < target) lo = store + 1;
    else hi = store - 1;
  }
  return nums[target];
}`,
      java: `// Geometric series N + N/2 + N/4 + ... = 2N -> O(N) expected time`,
    },
    frames: [
      {
        step: 1,
        title: 'Find 3rd Smallest (target idx = 2) in [7, 2, 9, 4, 1, 6, 5]',
        explanation: 'Pick pivot = 5. Partition into elements ≤ 5 on left and > 5 on right.',
        invariantCheck: 'Active search range is [0..6].',
        variables: [{ name: 'target idx', value: '2 (3rd smallest)' }, { name: 'pivot', value: '5' }],
        array: [7, 2, 9, 4, 1, 6, 5], secondaryArray: ['', '', '', '', '', '', 'PIV'],
        pointers: [{ label: 'piv', index: 6, tone: 'amber' }], windowRange: [0, 6],
      },
      {
        step: 2,
        title: 'Pivot 5 Lands at Index 3 (> target 2) → Discard Right Half [3..6]!',
        explanation: 'Partitioned: [2, 4, 1 | 5 | 9, 6, 7]. Since pivot index 3 > 2, elements [5, 9, 6, 7] are permanently eliminated!',
        invariantCheck: '4 of 7 elements eliminated in a single linear pass!',
        variables: [{ name: 'pivot idx', value: '3 > 2 (go left)' }, { name: 'active range', value: '[0..2]' }],
        array: [2, 4, 1, 5, 9, 6, 7], secondaryArray: ['≤5', '≤5', '≤5', 'PIV', '>5', '>5', '>5'],
        eliminatedIndices: [3, 4, 5, 6], windowRange: [0, 2],
        pointers: [{ label: 'lo', index: 0, tone: 'sky' }, { label: 'hi', index: 2, tone: 'sky' }],
      },
      {
        step: 3,
        title: 'Partition [2, 4, 1] Around Pivot 4 → Lands at Index 2 == Target! Answer = 4!',
        explanation: 'Left slice partitions to [2, 1, 4]. Pivot 4 lands right on target index 2 → return 4 without EVER sorting [2, 1] or [9, 6, 7]!',
        invariantCheck: 'O(N) average work: 7 + 3 = 10 ops!',
        variables: [{ name: 'pivot idx', value: '2 === target ✓' }, { name: '3rd smallest', value: '4 ✓' }],
        array: [2, 1, 4, 5, 9, 6, 7], secondaryArray: ['', '', 'HIT!', '', '', '', ''],
        matchedIndices: [2], eliminatedIndices: [0, 1, 3, 4, 5, 6],
        pointers: [{ label: 'HIT', index: 2, tone: 'emerald' }],
      },
    ],
  },
];

export const ADV_MATH_RAND_PRACTICE: Record<string, AlgorithmPracticeSpec> = {
  'sieve-of-eratosthenes': {
    algorithmId: 'sieve-of-eratosthenes',
    functionName: 'sievePrimes',
    title: 'Sieve of Eratosthenes Prime Generator',
    prompt: 'Return a sorted array of all prime numbers <= n in O(N log log N) time.',
    structuredSteps: [
      { step: '1. Allocate Boolean Table', detail: 'Create isPrime[0..n] = 1 with 0 and 1 marked 0.' },
      { step: '2. Mark Multiples From p²', detail: 'For p = 2..sqrt(n), if isPrime[p], mark m = p*p, p*p+p, ... as 0.' },
      { step: '3. Collect Remaining Primes', detail: 'Push every index i >= 2 where isPrime[i] === 1.' },
    ],
    starterCode: `function sievePrimes(n) {
  if (n < 2) return [];
  // TODO: Sieve multiples starting at p * p
  return [];
}`,
    solutionCode: `function sievePrimes(n) {
  if (n < 2) return [];
  const isPrime = new Uint8Array(n + 1).fill(1);
  isPrime[0] = isPrime[1] = 0;
  for (let p = 2; p * p <= n; p++) {
    if (isPrime[p]) {
      for (let m = p * p; m <= n; m += p) isPrime[m] = 0;
    }
  }
  const out = [];
  for (let i = 2; i <= n; i++) if (isPrime[i]) out.push(i);
  return out;
}`,
    testCases: [
      { label: 'Primes ≤ 20', args: [20], expected: [2, 3, 5, 7, 11, 13, 17, 19] },
      { label: 'n = 2 edge case', args: [2], expected: [2] },
      { label: 'n < 2 returns empty', args: [1], expected: [] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 204', title: 'Count Primes', difficulty: 'Medium', focus: 'Standard Sieve of Eratosthenes' },
      { platform: 'LeetCode', number: 'LC 2523', title: 'Closest Prime Numbers in Range', difficulty: 'Medium', focus: 'Sieve + adjacent prime gap scan' },
      { platform: 'CSES', number: 'CSES 1713', title: 'Counting Divisors', difficulty: 'Easy', focus: 'Smallest Prime Factor (SPF) sieve' },
    ],
  },
  'euclidean-extended-gcd': {
    algorithmId: 'euclidean-extended-gcd',
    functionName: 'modInverse',
    title: 'Modular Inverse via Extended Euclidean Algorithm',
    prompt: 'Using Extended GCD (a*x + m*y = g), return the smallest non-negative modular inverse of a modulo m, or -1 if gcd(a, m) !== 1.',
    structuredSteps: [
      { step: '1. Extended GCD Base Case', detail: 'When b === 0 return [a, 1, 0].' },
      { step: '2. Back-Substitute x, y', detail: 'Recurse on (b, a % b) and return [g, y1, x1 - floor(a/b) * y1].' },
      { step: '3. Normalize Modulo m', detail: 'If g !== 1 return -1; else return ((x % m) + m) % m.' },
    ],
    starterCode: `function modInverse(a, m) {
  // TODO: Implement extendedGcd(a, m) and return positive inverse mod m (or -1)
  return -1;
}`,
    solutionCode: `function modInverse(a, m) {
  function extGcd(x, y) {
    if (y === 0) return [x, 1, 0];
    const [g, x1, y1] = extGcd(y, x % y);
    return [g, y1, x1 - Math.floor(x / y) * y1];
  }
  const [g, x] = extGcd(a, m);
  return g === 1 ? ((x % m) + m) % m : -1;
}`,
    testCases: [
      { label: '7⁻¹ mod 26 = 15', args: [7, 26], expected: 15 },
      { label: '3⁻¹ mod 11 = 4', args: [3, 11], expected: 4 },
      { label: 'Non-coprime (6, 9) returns -1', args: [6, 9], expected: -1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 365', title: 'Water and Jug Problem', difficulty: 'Medium', focus: 'Bezout’s Identity target % gcd(x, y) == 0' },
      { platform: 'LeetCode', number: 'LC 1250', title: 'Check If It Is a Good Array', difficulty: 'Hard', focus: 'Generalized Bezout gcd == 1' },
      { platform: 'CSES', number: 'CSES 1081', title: 'Common Divisors', difficulty: 'Medium', focus: 'GCD & divisor frequency' },
    ],
  },
  'modular-exponentiation': {
    algorithmId: 'modular-exponentiation',
    functionName: 'modPow',
    title: 'Binary Modular Exponentiation (BigInt Safe)',
    prompt: 'Compute (base^exp) % mod in O(log exp) time using binary squaring (handle large exponents safely).',
    structuredSteps: [
      { step: '1. Convert to BigInt', detail: 'Cast base, exp, mod to BigInt so intermediate squares never lose 53-bit float precision.' },
      { step: '2. Multiply on Odd Bits', detail: 'While e > 0n: if (e & 1n) res = (res * b) % m.' },
      { step: '3. Square & Shift', detail: 'Set b = (b * b) % m and e >>= 1n; return Number(res).' },
    ],
    starterCode: `function modPow(base, exp, mod) {
  // TODO: Compute (base^exp) % mod in O(log exp) using binary exponentiation
  return 0;
}`,
    solutionCode: `function modPow(base, exp, mod) {
  let res = 1n, b = BigInt(base) % BigInt(mod), e = BigInt(exp), m = BigInt(mod);
  while (e > 0n) {
    if (e & 1n) res = (res * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return Number(res);
}`,
    testCases: [
      { label: '3¹³ mod 100 = 23', args: [3, 13, 100], expected: 23 },
      { label: '2³⁰ mod 1000000007', args: [2, 30, 1000000007], expected: 73741817 },
      { label: 'Exponent 0 returns 1', args: [99, 0, 13], expected: 1 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 50', title: 'Pow(x, n)', difficulty: 'Medium', focus: 'Binary exponentiation with negative n' },
      { platform: 'LeetCode', number: 'LC 1922', title: 'Count Good Numbers', difficulty: 'Medium', focus: 'modPow(5, evens, MOD) * modPow(4, odds, MOD)' },
      { platform: 'CSES', number: 'CSES 1095', title: 'Exponentiation', difficulty: 'Easy', focus: 'Fast O(log b) modular power' },
    ],
  },
  'convex-hull-graham-scan': {
    algorithmId: 'convex-hull-graham-scan',
    functionName: 'convexHullCount',
    title: 'Andrew’s Monotone Chain Convex Hull Vertices',
    prompt: 'Given 2D points [[x, y], ...], compute the strict Convex Hull (discarding collinear interior edge points) and return the number of hull vertices.',
    structuredSteps: [
      { step: '1. Sort by (x, y)', detail: 'Sort deduplicated points lexicographically by x, then y.' },
      { step: '2. Build Lower & Upper Hulls', detail: 'Pop while cross(H[-2], H[-1], p) <= 0 on both forward and reverse sweeps.' },
      { step: '3. Concatenate & Count', detail: 'Drop duplicate endpoints from lower/upper and return total hull vertex count.' },
    ],
    starterCode: `function convexHullCount(points) {
  // TODO: Andrew's Monotone Chain -> return number of strict convex hull vertices
  return 0;
}`,
    solutionCode: `function convexHullCount(points) {
  const uniq = Array.from(new Map(points.map((p) => [p[0] + ',' + p[1], p])).values());
  uniq.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (uniq.length <= 2) return uniq.length;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of uniq) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = uniq.length - 1; i >= 0; i--) {
    const p = uniq[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  return lo.length - 1 + up.length - 1;
}`,
    testCases: [
      { label: '4 hull vertices + 1 interior point → 4', args: [[[1, 3], [2, 5], [3, 3], [4, 1], [6, 4]]], expected: 4 },
      { label: 'Square with 2 interior points → 4', args: [[[0, 0], [4, 0], [4, 4], [0, 4], [2, 2], [1, 3]]], expected: 4 },
      { label: 'Triangle → 3', args: [[[0, 0], [3, 0], [1, 2]]], expected: 3 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 587', title: 'Erect the Fence', difficulty: 'Hard', focus: 'Monotone Chain keeping collinear boundary points (< 0)' },
      { platform: 'CSES', number: 'CSES 2195', title: 'Convex Hull', difficulty: 'Hard', focus: 'Exact integer cross-product Monotone Chain' },
      { platform: 'LeetCode', number: 'LC 84', title: 'Largest Rectangle in Histogram', difficulty: 'Hard', focus: 'Monotonic stack geometric discipline', trainerSlug: 'largest-rectangle-in-histogram' },
    ],
  },
  'reservoir-sampling': {
    algorithmId: 'reservoir-sampling',
    functionName: 'deterministicReservoirSample',
    title: 'Algorithm R Reservoir Sampling (Deterministic Random Sequence)',
    prompt: 'Implement Algorithm R: fill first k items into reservoir, then for each i >= k, let j = Math.floor(randSeq[i - k] * (i + 1)); if j < k, set reservoir[j] = stream[i].',
    structuredSteps: [
      { step: '1. Seed First k Items', detail: 'Copy stream[0..k-1] into reservoir.' },
      { step: '2. Map Uniform Draw to [0..i]', detail: 'For i = k..n-1 compute j = Math.floor(randSeq[i - k] * (i + 1)).' },
      { step: '3. Conditional Replace', detail: 'If j < k, set reservoir[j] = stream[i] and return reservoir.' },
    ],
    starterCode: `function deterministicReservoirSample(stream, k, randSeq) {
  // TODO: Algorithm R using randSeq[i - k] in [0, 1) for deterministic testing
  return [];
}`,
    solutionCode: `function deterministicReservoirSample(stream, k, randSeq) {
  const res = stream.slice(0, k);
  for (let i = k; i < stream.length; i++) {
    const j = Math.floor(randSeq[i - k] * (i + 1));
    if (j < k) res[j] = stream[i];
  }
  return res;
}`,
    testCases: [
      { label: 'Matches animated trace [E, C]', args: [['A', 'B', 'C', 'D', 'E', 'F'], 2, [0.4, 0.8, 0.1, 0.7]], expected: ['E', 'C'] },
      { label: 'k = 1 picks last item when r = 0', args: [[10, 20, 30, 40], 1, [0.0, 0.0, 0.0]], expected: [40] },
      { label: 'Never replaces when r near 1', args: [[1, 2, 3, 4], 2, [0.99, 0.99]], expected: [1, 2] },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 382', title: 'Linked List Random Node', difficulty: 'Medium', focus: 'k = 1 Reservoir Sampling over unknown-length list' },
      { platform: 'LeetCode', number: 'LC 398', title: 'Random Pick Index', difficulty: 'Medium', focus: 'Reservoir Sampling over matching target indices' },
      { platform: 'LeetCode', number: 'LC 141', title: 'Linked List Cycle', difficulty: 'Easy', focus: 'O(1)-space single-pass stream discipline', trainerSlug: 'linked-list-cycle' },
    ],
  },
  'quickselect': {
    algorithmId: 'quickselect',
    functionName: 'kthLargestQuickselect',
    title: 'Quickselect K-th Largest Element (O(N) Average)',
    prompt: 'Given an unsorted array nums and integer k (1-indexed), return the k-th LARGEST element using Quickselect partition without calling nums.sort().',
    structuredSteps: [
      { step: '1. Map to 0-Based Target', detail: 'k-th largest equals target index (nums.length - k) in ascending order.' },
      { step: '2. Partition Around Pivot', detail: 'Move elements <= pivot left of store index, then swap pivot into store.' },
      { step: '3. Shrink to One Half', detail: 'If store === target return nums[store]; else narrow lo = store + 1 or hi = store - 1.' },
    ],
    starterCode: `function kthLargestQuickselect(nums, k) {
  let lo = 0, hi = nums.length - 1, target = nums.length - k;
  // TODO: Iterative Lomuto partition narrowing [lo, hi] toward target
  return -1;
}`,
    solutionCode: `function kthLargestQuickselect(nums, k) {
  let lo = 0, hi = nums.length - 1, target = nums.length - k;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
    const piv = nums[hi];
    let store = lo;
    for (let i = lo; i < hi; i++) {
      if (nums[i] <= piv) { [nums[store], nums[i]] = [nums[i], nums[store]]; store++; }
    }
    [nums[store], nums[hi]] = [nums[hi], nums[store]];
    if (store === target) return nums[store];
    if (store < target) lo = store + 1;
    else hi = store - 1;
  }
  return nums[target];
}`,
    testCases: [
      { label: '2nd largest of [3,2,1,5,6,4] → 5', args: [[3, 2, 1, 5, 6, 4], 2], expected: 5 },
      { label: '4th largest with duplicates → 4', args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4 },
      { label: 'Single element array', args: [[42], 1], expected: 42 },
    ],
    platformDrills: [
      { platform: 'LeetCode', number: 'LC 215', title: 'Kth Largest Element in an Array', difficulty: 'Medium', focus: '3-way Quickselect for duplicate resistance' },
      { platform: 'LeetCode', number: 'LC 973', title: 'K Closest Points to Origin', difficulty: 'Medium', focus: 'O(N) Quickselect on squared Euclidean distance' },
      { platform: 'LeetCode', number: 'LC 703', title: 'Kth Largest Element in a Stream', difficulty: 'Easy', focus: 'Static Quickselect vs streaming Min-Heap', trainerSlug: 'kth-largest-in-stream' },
    ],
  },
};
