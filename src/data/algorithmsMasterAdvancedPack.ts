import { AlgorithmDefinition } from './algorithmsCatalog';
import { AlgorithmPracticeSpec } from './algorithmsPracticeExtras';
import { hydrateMasterAlgorithms, hydrateMasterPractice } from './algorithmMasterMetadata';

export const MASTER_ADV_18_ALGORITHMS: AlgorithmDefinition[] = hydrateMasterAlgorithms([
  // #37 Splay Tree Rotations
  {
    id: 'splay-tree-rotations',
    name: 'Splay Tree (Amortized Self-Adjusting BST)',
    shortName: 'Splay Tree',
    category: 'Range Queries & Advanced Trees',
    difficulty: 'Advanced',
    visualType: 'tree-structure',
    tagline: 'Move every accessed node to the root via Zig, Zig-Zig, and Zig-Zag rotations—with O(log N) amortized time per access; accessing a node that is already the root takes O(1), while an individual access can take O(N).',
    timeComplexity: 'O(log N) amortized',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Think of a stack of papers on your desk where whenever you read a document, you pull it straight to the top—and subtly reorganize the middle pile so frequently read files stay one step away.',
    coreInvariant:
      'Zig-Zig rotates the parent FIRST (not the child!) to halve long skewed paths; potential function Φ = Σ log₂(size(x)) proves O(log N) amortized cost per splay without storing height or color bits.',
    whenToUse: [
      'Highly skewed 80/20 access distributions (caches, garbage collectors, GCC memory allocators, Windows NT virtual memory).',
      'Link-Cut Trees (dynamic connectivity & dynamic forest queries) where Splay Trees represent preferred paths.',
      'Rope data structures supporting O(log N) amortized split and concatenate.',
    ],
    whenItFails:
      'Do not use in strict real-time latency systems or concurrent read-heavy workloads—a single worst-case access can take O(N) time and mutates tree structure on reads (preventing shared read locks).',
    linkedTopics: ['Trees DFS/BFS'],
    linkedProblemSlugs: ['validate-binary-search-tree', 'lowest-common-ancestor-bst'],
    templates: {
      python: `# Splay brings x to root using Zig, Zig-Zig (parent first!), or Zig-Zag
def splay(x):
    while x.parent:
        p = x.parent
        g = p.parent
        if not g:                     # Zig
            rotate(x)
        elif (g.left == p) == (p.left == x):  # Zig-Zig (rotate parent first!)
            rotate(p); rotate(x)
        else:                         # Zig-Zag (rotate x twice)
            rotate(x); rotate(x)`,
      js: `function splayAccess(keys, target) {
  // Simulates BST insert + splay(target) bringing target to root
  const nodes = {};
  let root = null;
  const setChild = (p, side, c) => { if (p) p[side] = c; if (c) c.p = p; };
  const rotate = (x) => {
    const p = x.p, g = p.p;
    const isLeft = p.l === x;
    if (isLeft) { setChild(p, 'l', x.r); setChild(x, 'r', p); }
    else { setChild(p, 'r', x.l); setChild(x, 'l', p); }
    x.p = g;
    if (!g) root = x;
    else if (g.l === p) g.l = x;
    else g.r = x;
  };
  const splay = (x) => {
    while (x.p) {
      const p = x.p, g = p.p;
      if (!g) rotate(x);
      else if ((g.l === p) === (p.l === x)) { rotate(p); rotate(x); }
      else { rotate(x); rotate(x); }
    }
  };
  for (const k of keys) {
    const n = { k, l: null, r: null, p: null };
    nodes[k] = n;
    if (!root) { root = n; continue; }
    let cur = root;
    while (true) {
      if (k < cur.k) { if (!cur.l) { setChild(cur, 'l', n); break; } cur = cur.l; }
      else { if (!cur.r) { setChild(cur, 'r', n); break; } cur = cur.r; }
    }
  }
  if (nodes[target]) splay(nodes[target]);
  return { newRoot: root ? root.k : null, leftChild: root?.l?.k ?? null, rightChild: root?.r?.k ?? null };
}`,
      java: `// Zig-Zig rotates parent before x; Zig-Zag rotates x twice.
// Zero extra balance bits needed per node!`,
    },
    frames: [
      {
        step: 1,
        title: 'Deep Skewed Access on Target=10',
        explanation: 'Chain 40 → 30 → 20 → 10 (all left children). Accessing 10 triggers Zig-Zig double rotations.',
        invariantCheck: 'BST in-order [10, 20, 30, 40] must remain intact after every rotation.',
        variables: [{ name: 'target', value: '10' }, { name: 'case', value: 'Zig-Zig (LL)' }],
        array: [40, 30, 20, 10],
        highlightIndices: [1, 2, 3],
      },
      {
        step: 2,
        title: 'Zig-Zig Step 1: Rotate Parent (20) Above Grandparent (30)',
        explanation: 'CRITICAL: Rotating 20 first (not 10!) compresses chain depth by half—single rotations alone would stay O(N)!',
        invariantCheck: 'Parent-first rotation drops subtree potential Φ.',
        variables: [{ name: 'rotated', value: '20↑30' }, { name: 'root', value: '40' }],
        array: [40, 20, 10, 30],
        highlightIndices: [1, 2],
      },
      {
        step: 3,
        title: 'Zig-Zig Step 2 + Final Zig → Target 10 Becomes Root',
        explanation: 'Rotate 10 above 20, then final Zig rotates 10 above 40. 10 is now at depth 0!',
        invariantCheck: 'Repeated queries for hot key 10 now complete in O(1) time.',
        variables: [{ name: 'newRoot', value: '10' }, { name: 'rightChild', value: '40' }],
        array: [10, 40, 20, 30],
        matchedIndices: [0],
      },
      {
        step: 4,
        title: 'Amortized O(log N) Working-Set Property',
        explanation: 'Hot working-set of W keys achieves O(log W) access without manual cache tuning.',
        invariantCheck: 'Zero balance/color fields stored in any node.',
        variables: [{ name: 'amortized', value: 'O(log N)' }, { name: 'hotHit', value: 'O(1)' }],
        array: [10, 40, 20, 30],
        matchedIndices: [0, 1, 2, 3],
      },
    ],
    platformDrills: [
      { platform: 'Codeforces', title: 'Splay Tree Dynamic Sequence & Reverse', difficulty: 'Hard', whyThisFits: 'Implicit-key Splay Tree supports range reverse in O(log N) amortized.' },
      { platform: 'SPOJ', title: 'QTREE / Dynamic Trees (Link-Cut)', difficulty: 'Hard', whyThisFits: 'Splay Trees are the core engine inside Link-Cut Trees.' },
    ],
  },

  // #38 K-D Trees (Nearest Neighbor Search)
  {
    id: 'kd-tree-nearest-neighbor',
    name: 'K-D Tree (Nearest Neighbor Spatial Search)',
    shortName: 'K-D Tree',
    category: 'Range Queries & Advanced Trees',
    difficulty: 'Advanced',
    visualType: 'geometry-hull',
    tagline: 'Partition K-dimensional space with alternating axis-aligned hyperplanes to prune distant subtrees during nearest-neighbor queries.',
    timeComplexity: 'O(log N) avg · O(N) worst',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Cut a 2D map vertically by X median, then cut each half horizontally by Y median, alternating X/Y down the tree. If the other side of a cut line is farther than your best distance so far, skip that entire branch!',
    coreInvariant:
      'At depth d, split axis = d % k. Explore the near child first to shrink bestDist; visit the far child ONLY if |query[axis] − node[axis]| < bestDist.',
    whenToUse: [
      'Low-dimensional nearest-neighbor search (k ≤ 10): GPS driver lookup, 3D ray-tracing, robotics LiDAR point clouds.',
      'Orthogonal range queries (find all stores inside a lat/lng bounding box).',
      'K-Nearest Neighbors (KNN) acceleration in scikit-learn for low-D datasets.',
    ],
    whenItFails:
      'Suffers the Curse of Dimensionality for k > 20 (e.g., 1536-D LLM embeddings) where hyperspheres intersect nearly every split plane—use HNSW or IVF-PQ approximate vector indexes instead.',
    linkedTopics: ['Trees DFS/BFS', 'Modified Binary Search'],
    linkedProblemSlugs: ['kth-largest-in-stream', 'binary-search-classic'],
    templates: {
      python: `def kd_nearest(node, target, depth=0, best=None):
    if node is None: return best
    axis = depth % len(target)
    d2 = sum((a - b) ** 2 for a, b in zip(node.pt, target))
    if best is None or d2 < best[0]:
        best = (d2, node.pt)
    diff = target[axis] - node.pt[axis]
    near, far = (node.left, node.right) if diff < 0 else (node.right, node.left)
    best = kd_nearest(near, target, depth + 1, best)
    if diff * diff < best[0]:
        best = kd_nearest(far, target, depth + 1, best)
    return best`,
      js: `function kdTreeNearest(points, target) {
  const build = (pts, depth) => {
    if (!pts.length) return null;
    const axis = depth % 2;
    const sorted = [...pts].sort((a, b) => a[axis] - b[axis]);
    const mid = Math.floor(sorted.length / 2);
    return {
      pt: sorted[mid],
      left: build(sorted.slice(0, mid), depth + 1),
      right: build(sorted.slice(mid + 1), depth + 1),
    };
  };
  const root = build(points, 0);
  let bestPt = null, bestDist2 = Infinity;
  const search = (node, depth) => {
    if (!node) return;
    const dx = node.pt[0] - target[0], dy = node.pt[1] - target[1];
    const d2 = dx * dx + dy * dy;
    if (d2 < bestDist2) { bestDist2 = d2; bestPt = node.pt; }
    const axis = depth % 2;
    const diff = target[axis] - node.pt[axis];
    const [near, far] = diff < 0 ? [node.left, node.right] : [node.right, node.left];
    search(near, depth + 1);
    if (diff * diff < bestDist2) search(far, depth + 1);
  };
  search(root, 0);
  return bestPt;
}`,
      java: `// Prune far branch whenever (target[axis] - node.pt[axis])^2 >= bestDistSq`,
    },
    frames: [
      {
        step: 1,
        title: 'Split Root on X-Axis Median',
        explanation: 'Points [(2,3),(5,4),(9,6),(4,7),(8,1),(7,2)]. X-median (7,2) splits plane into Left (x<7) and Right (x≥7).',
        invariantCheck: 'Depth 0 splits X; Depth 1 splits Y; Depth 2 splits X.',
        variables: [{ name: 'axis', value: 'X (depth=0)' }, { name: 'root', value: '(7,2)' }, { name: 'query', value: '(9,2)' }],
        array: ['(2,3)', '(4,7)', '(5,4)', '(7,2)*', '(8,1)', '(9,6)'],
        highlightIndices: [3],
      },
      {
        step: 2,
        title: 'Descend Near Child First (x=9 ≥ 7 → Right)',
        explanation: 'Query (9,2) goes right to Y-split node (9,6), then down to (8,1). dist²((8,1),(9,2)) = 2 → bestDist² = 2!',
        invariantCheck: 'Searching near branch first tightens hypersphere radius aggressively.',
        variables: [{ name: 'bestPt', value: '(8,1)' }, { name: 'bestDist²', value: '2' }],
        array: ['(7,2)', '(9,6)', '(8,1)'],
        matchedIndices: [2],
      },
      {
        step: 3,
        title: 'Prune Entire Left Subtree at Root!',
        explanation: 'Distance from query x=9 to split line x=7 is |9−7|² = 4 ≥ bestDist²(2) → impossible for ANY left point to beat (8,1)!',
        invariantCheck: 'Pruned 50% of points in O(1) plane-distance check.',
        variables: [{ name: 'planeDist²', value: '4' }, { name: 'bestDist²', value: '2' }, { name: 'pruned', value: 'Left Subtree ✓' }],
        array: ['[PRUNED Left]', '(7,2)', '(8,1)*'],
        eliminatedIndices: [0],
        matchedIndices: [2],
      },
      {
        step: 4,
        title: 'Exact Nearest Neighbor Returned: (8, 1)',
        explanation: 'The search returns the exact nearest neighbor when the pruning bound and distance comparisons are implemented correctly. A balanced k-d tree can be efficient on favorable, low-dimensional data, but nearest-neighbor search has O(N) worst-case behavior and can visit many points in high dimensions.',
        invariantCheck: 'Exact result (assuming correct distance and pruning calculations).',
        variables: [{ name: 'nearest', value: '(8, 1)' }, { name: 'dist', value: '√2 ≈ 1.41' }],
        array: ['(8,1)'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '973. K Closest Points to Origin', difficulty: 'Medium', whyThisFits: 'Static origin uses Quickselect; dynamic queries use K-D Tree.' },
      { platform: 'System Design', title: 'Uber / Yelp Nearby Drivers (2D Spatial)', difficulty: 'Hard', whyThisFits: 'Compare K-D Tree vs Quadtree vs Geohash spatial indexing.' },
    ],
  },

  // #39 Quadtrees & Octrees
  {
    id: 'quadtree-octree-spatial',
    name: 'Quadtrees & Octrees (2D/3D Spatial Subdivision)',
    shortName: 'Quadtree / Octree',
    category: 'Range Queries & Advanced Trees',
    difficulty: 'Advanced',
    visualType: 'matrix-grid',
    tagline: 'Recursively split dense 2D quadrants (4 children) or 3D octants (8 children) so sparse regions stay compact while hot zones zoom in.',
    timeComplexity: 'O(log N + K) range query',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Think of zooming into Google Maps: ocean tiles stay a single giant square, while downtown Manhattan subdivides recursively into NW/NE/SW/SE quadrants until each tile holds ≤ capacity pins.',
    coreInvariant:
      'Every leaf quadrant holds at most C points (or reaches max depth); range queries immediately skip any quadrant whose bounding box does not intersect the query rectangle.',
    whenToUse: [
      'Dynamic 2D geospatial indexing (ride-sharing proximity, map tile servers, collision detection in 2D game engines).',
      '3D graphics & voxel engines (Octrees for frustum culling, Minecraft/CAD spatial queries, Barnes-Hut N-body physics).',
      'Lossless/lossy image compression merging uniform pixel regions (LC 427 Construct Quad Tree).',
    ],
    whenItFails:
      'Unbalanced depth if thousands of points cluster at one identical coordinate (enforce max depth); poorly suited beyond 3D since 2^d children explodes exponentially (use K-D Tree or R-Tree).',
    linkedTopics: ['Trees DFS/BFS'],
    linkedProblemSlugs: ['flood-fill', 'number-of-islands'],
    templates: {
      python: `class QuadTree:
    def __init__(self, x, y, w, h, cap=4):
        self.box = (x, y, w, h)
        self.cap, self.pts, self.children = cap, [], None
    def query(self, qx, qy, qw, qh, out):
        x, y, w, h = self.box
        if qx > x + w or qx + qw < x or qy > y + h or qy + qh < y:
            return
        for px, py in self.pts:
            if qx <= px <= qx + qw and qy <= py <= qy + qh:
                out.append((px, py))
        if self.children:
            for c in self.children: c.query(qx, qy, qw, qh, out)`,
      js: `function quadtreeRangeQuery(points, rect) {
  const [rx1, ry1, rx2, ry2] = rect;
  const makeNode = (x1, y1, x2, y2) => ({ x1, y1, x2, y2, pts: [], kids: null });
  const contains = (n, p) => p[0] >= n.x1 && p[0] <= n.x2 && p[1] >= n.y1 && p[1] <= n.y2;
  const insert = (n, p, cap = 2, depth = 0) => {
    if (!contains(n, p)) return false;
    if (!n.kids && (n.pts.length < cap || depth >= 8)) { n.pts.push(p); return true; }
    if (!n.kids) {
      const mx = (n.x1 + n.x2) / 2, my = (n.y1 + n.y2) / 2;
      n.kids = [
        makeNode(n.x1, n.y1, mx, my), makeNode(mx, n.y1, n.x2, my),
        makeNode(n.x1, my, mx, n.y2), makeNode(mx, my, n.x2, n.y2),
      ];
      for (const old of n.pts) for (const k of n.kids) if (insert(k, old, cap, depth + 1)) break;
      n.pts = [];
    }
    for (const k of n.kids) if (insert(k, p, cap, depth + 1)) return true;
    return false;
  };
  const root = makeNode(0, 0, 100, 100);
  for (const p of points) insert(root, p);
  const out = [];
  const query = (n) => {
    if (rx2 < n.x1 || rx1 > n.x2 || ry2 < n.y1 || ry1 > n.y2) return;
    for (const p of n.pts) if (p[0] >= rx1 && p[0] <= rx2 && p[1] >= ry1 && p[1] <= ry2) out.push(p);
    if (n.kids) for (const k of n.kids) query(k);
  };
  query(root);
  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}`,
      java: `// Octree extends Quadtree to 3D by splitting (x,y,z) midpoints into 8 child octants.`,
    },
    frames: [
      {
        step: 1,
        title: 'Insert Points into Root [0..100] × [0..100]',
        explanation: 'Capacity C=2. Inserting (10,15) and (20,25) fills root leaf. Third point (80,85) forces 4-way split!',
        invariantCheck: 'Every quadrant boundary is axis-aligned and disjoint.',
        variables: [{ name: 'capacity', value: '2' }, { name: 'points', value: '3' }],
        array: ['NW:[10,15],[20,25]', 'NE:[]', 'SW:[]', 'SE:[80,85]'],
        highlightIndices: [0, 3],
      },
      {
        step: 2,
        title: 'Dense Hotspot Triggers Recursive Subdivision',
        explanation: 'Inserting (12,18) into full NW quadrant splits ONLY NW into 4 sub-quadrants while NE/SW/SE stay depth 1!',
        invariantCheck: 'Adaptive resolution puts memory only where density exists.',
        variables: [{ name: 'subdivided', value: 'NW → 4 tiles' }, { name: 'emptyTiles', value: 'untouched' }],
        array: ['NW.nw(3)', 'NE(0)', 'SW(0)', 'SE(1)'],
        highlightIndices: [0],
      },
      {
        step: 3,
        title: 'Bounding-Box Intersection Prunes 3 Quadrants',
        explanation: 'Query box [0..30, 0..30] checks AABB overlap: NE, SW, SE do not intersect → skipped in O(1)!',
        invariantCheck: 'Zero points inspected outside intersecting tiles.',
        variables: [{ name: 'queryBox', value: '[0..30,0..30]' }, { name: 'pruned', value: 'NE, SW, SE' }],
        array: ['NW ✓', 'NE ×', 'SW ×', 'SE ×'],
        matchedIndices: [0],
        eliminatedIndices: [1, 2, 3],
      },
      {
        step: 4,
        title: 'Return Matching Spatial Points',
        explanation: 'Returns [(10,15), (12,18), (20,25)] in O(log N + K). In 3D, Octree uses 8 octants identically.',
        invariantCheck: 'Exact 2D/3D range query with spatial locality.',
        variables: [{ name: 'hits', value: '3' }],
        array: ['(10,15)', '(12,18)', '(20,25)'],
        matchedIndices: [0, 1, 2],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '427. Construct Quad Tree', difficulty: 'Medium', whyThisFits: 'Recursive 4-way uniform-grid compression.' },
      { platform: 'System Design', title: 'Proximity Service (Uber / Yelp Quadtree)', difficulty: 'Hard', whyThisFits: 'Dynamic leaf splitting/merging as drivers move.' },
    ],
  },

  // #45 Burrows-Wheeler Transform (BWT) & FM-Index
  {
    id: 'bwt-fm-index',
    name: 'Burrows-Wheeler Transform (BWT) & FM-Index',
    shortName: 'BWT & FM-Index',
    category: 'Advanced String Algorithms',
    difficulty: 'Advanced',
    visualType: 'stream-partition',
    tagline: 'Reversibly permute text so identical characters cluster into compressible runs—and enable O(P) compressed substring search via LF-Mapping.',
    timeComplexity: 'O(N) build via SA · O(P) FM-search',
    spaceComplexity: 'O(N) compressed',
    mentalModel:
      'Sort all cyclic rotations of "banana$" alphabetically and keep ONLY the last column ("annb$aa"). Magically, the i-th "a" in the Last column is the EXACT SAME "a" as the i-th "a" in the First column (LF-Mapping)!',
    coreInvariant:
      'Last-to-First (LF) Property: rank of character c in Last column L equals its rank in sorted First column F, enabling lossless inversion AND O(|P|) backward search in compressed memory.',
    whenToUse: [
      'bzip2 compression pipeline (BWT → Move-To-Front → Run-Length Encoding → Huffman).',
      'Genomics / DNA sequence alignment (Bowtie2, BWA align billions of reads against the 3GB human genome inside ~2GB RAM!).',
      'Compressed full-text indexes where Suffix Trees (40× text size) cannot fit in RAM.',
    ],
    whenItFails:
      'Random high-entropy binary data (encrypted/already-compressed files) yields no character clustering and gains zero compression.',
    linkedTopics: ['Arrays & Prefix Sum', 'Modified Binary Search'],
    linkedProblemSlugs: ['longest-substring-without-repeating', 'binary-search-classic'],
    templates: {
      python: `def bwt_encode(s: str) -> str:
    t = s + "$"
    rotations = sorted(t[i:] + t[:i] for i in range(len(t)))
    return "".join(r[-1] for r in rotations)`,
      js: `function bwtEncodeDecode(text) {
  const s = text + '$';
  const n = s.length;
  const rotations = Array.from({ length: n }, (_, i) => s.slice(i) + s.slice(0, i)).sort();
  const bwt = rotations.map((r) => r[n - 1]).join('');
  // Invert BWT using LF-Mapping in O(N)
  const first = bwt.split('').sort();
  const occBefore = new Array(n).fill(0);
  const totals = {};
  for (let i = 0; i < n; i++) {
    const ch = bwt[i];
    occBefore[i] = totals[ch] || 0;
    totals[ch] = occBefore[i] + 1;
  }
  const firstStart = {};
  for (let i = 0; i < n; i++) if (!(first[i] in firstStart)) firstStart[first[i]] = i;
  let row = bwt.indexOf('$');
  const chars = [];
  for (let i = 0; i < n - 1; i++) {
    row = firstStart[bwt[row]] + occBefore[row];
    chars.push(bwt[row]);
  }
  return { bwt, decoded: chars.reverse().join('') };
}`,
      java: `// FM-Index Backward Search: [lo, hi] = [C[c] + Occ(c, lo), C[c] + Occ(c, hi)]`,
    },
    frames: [
      {
        step: 1,
        title: 'Append Sentinel "$" & Sort All Cyclic Rotations',
        explanation: 'Input "banana$": sort all 7 cyclic shifts lexicographically to form the BWT matrix.',
        invariantCheck: 'Every row ends with the character immediately preceding its prefix.',
        variables: [{ name: 'input', value: '"banana$"' }, { name: 'rotations', value: '7' }],
        array: ['$banana', 'a$banan', 'ana$ban', 'anana$b', 'banana$', 'na$bana', 'nana$ba'],
        highlightIndices: [0, 1, 2, 3, 4, 5, 6],
      },
      {
        step: 2,
        title: 'Extract Last Column → "annb$aa"',
        explanation: 'Notice how "nn" and "aa" clustered together automatically! Real English text produces massive runs like "tttttt".',
        invariantCheck: 'BWT is 100% reversible without storing the full matrix.',
        variables: [{ name: 'BWT (L)', value: '"annb$aa"' }, { name: 'F (sorted)', value: '"$aaabnn"' }],
        array: ['a', 'n', 'n', 'b', '$', 'a', 'a'],
        matchedIndices: [1, 2, 5, 6],
      },
      {
        step: 3,
        title: 'FM-Index Backward Search for "ana"',
        explanation: 'Search right-to-left: `a` → range [1..3]; prepend `n` via C[n]+Occ(n) → [5..6]; prepend `a` → [2..3] → 2 matches!',
        invariantCheck: 'Each pattern character takes O(1) rank lookup → O(|P|) total!',
        variables: [{ name: 'pattern', value: '"ana"' }, { name: 'SA range', value: '[2..3]' }, { name: 'count', value: '2' }],
        array: ['ana$ban', 'anana$b'],
        matchedIndices: [0, 1],
      },
      {
        step: 4,
        title: 'Lossless Inversion via LF-Mapping',
        explanation: 'Follow LF pointers from "$" backwards N−1 times to reconstruct exact "banana".',
        invariantCheck: 'Decoded string === original input verified.',
        variables: [{ name: 'decoded', value: '"banana"' }],
        array: ['b', 'a', 'n', 'a', 'n', 'a'],
        matchedIndices: [0, 1, 2, 3, 4, 5],
      },
    ],
    platformDrills: [
      { platform: 'Rosalind', title: 'Burrows-Wheeler Transform & BWMatching', difficulty: 'Hard', whyThisFits: 'Classic bioinformatics FM-Index benchmark.' },
      { platform: 'Codeforces', title: 'Substring Count in Compressed Index', difficulty: 'Hard', whyThisFits: 'Shows how Suffix Array + BWT yields O(|P|) queries.' },
    ],
  },

  // #46 Lempel-Ziv-Welch (LZW) Compression
  {
    id: 'lzw-compression',
    name: 'Lempel-Ziv-Welch (LZW) Dictionary Compression',
    shortName: 'LZW Compression',
    category: 'Advanced String Algorithms',
    difficulty: 'Advanced',
    visualType: 'prefix-hash',
    tagline: 'Dynamically grow a phrase dictionary on-the-fly during a single O(N) pass so repeated substrings emit compact integer codes—without transmitting the dictionary!',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(Dictionary Size)',
    mentalModel:
      'Read text greedily matching the longest phrase already in your dictionary, emit its code, and add `phrase + nextChar` as the next code. The decoder rebuilds the exact same dictionary in lockstep!',
    coreInvariant:
      'Encoder and decoder initialize with the same base alphabet (codes 0..255); every emitted code allows the decoder to infer the exact new dictionary entry added one step earlier.',
    whenToUse: [
      'GIF images, TIFF, PDF streams, and Unix `compress` utility.',
      'Streaming lossless compression over repetitive structured text/logs without a two-pass frequency scan.',
      'Understanding adaptive dictionary coding foundations behind LZ77 / Zstandard / Brotli.',
    ],
    whenItFails:
      'Dictionary fills up on diverse/large streams unless cleared or LRU-evicted; modern general-purpose compressors (Zstd/LZ4) use sliding-window LZ77 + entropy coding for better ratios and speed.',
    linkedTopics: ['Arrays & Prefix Sum', 'Backtracking & Tries'],
    linkedProblemSlugs: ['group-anagrams', 'implement-trie'],
    templates: {
      python: `def lzw_encode(text: str) -> list[int]:
    dict_map = {chr(i): i for i in range(256)}
    next_code, w, out = 256, "", []
    for c in text:
        wc = w + c
        if wc in dict_map:
            w = wc
        else:
            out.append(dict_map[w])
            dict_map[wc] = next_code
            next_code += 1
            w = c
    if w: out.append(dict_map[w])
    return out`,
      js: `function lzwRoundTrip(text) {
  if (!text) return { codes: [], decoded: '' };
  const enc = new Map();
  for (let i = 0; i < 256; i++) enc.set(String.fromCharCode(i), i);
  let nextCode = 256, w = '';
  const codes = [];
  for (const c of text) {
    const wc = w + c;
    if (enc.has(wc)) w = wc;
    else {
      codes.push(enc.get(w));
      enc.set(wc, nextCode++);
      w = c;
    }
  }
  if (w) codes.push(enc.get(w));
  const dec = new Map();
  for (let i = 0; i < 256; i++) dec.set(i, String.fromCharCode(i));
  let dNext = 256, prev = dec.get(codes[0]), out = prev;
  for (let i = 1; i < codes.length; i++) {
    const k = codes[i];
    const entry = dec.has(k) ? dec.get(k) : prev + prev[0];
    out += entry;
    dec.set(dNext++, prev + entry[0]);
    prev = entry;
  }
  return { codes, decoded: out };
}`,
      java: `// Note the classic KwKwK decoder edge case: if k == nextCode, entry = prev + prev.charAt(0)!`,
    },
    frames: [
      {
        step: 1,
        title: 'Scan "ABABABA" — Emit A(65), Learn "AB"=256',
        explanation: 'Start with ASCII 0..255. "A" is known, "AB" is new → emit 65, insert "AB"→256, set w="B".',
        invariantCheck: 'Longest-match greedy phrase emitted before extending dictionary.',
        variables: [{ name: 'w', value: '"B"' }, { name: 'learned', value: '"AB":256' }, { name: 'codes', value: '[65]' }],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A'],
        highlightIndices: [0, 1],
      },
      {
        step: 2,
        title: 'Emit B(66), Learn "BA"=257',
        explanation: '"B" is known, "BA" is new → emit 66, insert "BA"→257, set w="A".',
        invariantCheck: 'Dictionary grows strictly by +1 entry per emitted code.',
        variables: [{ name: 'learned', value: '"BA":257' }, { name: 'codes', value: '[65,66]' }],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A'],
        highlightIndices: [1, 2],
      },
      {
        step: 3,
        title: 'Phrase Hit! Match "AB"=256, Learn "ABA"=258',
        explanation: '"AB" is already code 256! Next char "A" makes "ABA" (new) → emit 256 (compresses 2 chars into 1 code!) and add "ABA"→258.',
        invariantCheck: 'Compression ratio improves exponentially on repeated patterns.',
        variables: [{ name: 'emitted', value: '256 ("AB")' }, { name: 'learned', value: '"ABA":258' }],
        array: ['A', 'B', 'A', 'B', 'A', 'B', 'A'],
        matchedIndices: [2, 3],
      },
      {
        step: 4,
        title: 'Final Emit "ABA"=258 → 7 Chars Packed Into 4 Codes!',
        explanation: 'Codes = [65, 66, 256, 258]. Notice code 258 triggers the famous KwKwK self-referential decoder case: entry = prev + prev[0]!',
        invariantCheck: 'Lossless round-trip verified without transmitting any table.',
        variables: [{ name: 'codes', value: '[65,66,256,258]' }, { name: 'decoded', value: '"ABABABA"' }],
        array: [65, 66, 256, 258],
        matchedIndices: [0, 1, 2, 3],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '443. String Compression', difficulty: 'Medium', whyThisFits: 'Foundation for comparing RLE vs adaptive LZW dictionary coding.' },
      { platform: 'HackerRank', title: 'LZW Lossless Encoder/Decoder', difficulty: 'Hard', whyThisFits: 'Tests the subtle KwKwK decoder edge case.' },
    ],
  },

  // #48 Hopcroft-Karp & Hungarian Algorithm (Bipartite Matching)
  {
    id: 'hopcroft-karp-hungarian',
    name: 'Hopcroft-Karp & Hungarian Bipartite Matching',
    shortName: 'Bipartite Matching',
    category: 'Advanced Graph Algorithms',
    difficulty: 'Advanced',
    visualType: 'weighted-network',
    tagline: 'Find maximum cardinality matching in O(E√V) via Hopcroft-Karp multi-path BFS/DFS, or minimum-cost assignment in O(V³) via Hungarian potentials.',
    timeComplexity: 'O(E√V) Hopcroft-Karp · O(V³) Hungarian',
    spaceComplexity: 'O(V + E)',
    mentalModel:
      'Imagine assigning workers (Left) to tasks (Right): an augmenting path flips unmatched↔matched edges like dominoes, strictly increasing total matched pairs by +1. Hopcroft-Karp finds a whole batch of shortest vertex-disjoint augmenting paths per BFS phase!',
    coreInvariant:
      'Berge’s Theorem: a matching M is maximum if and only if no augmenting path exists between unmatched Left and unmatched Right vertices.',
    whenToUse: [
      'Job/rider/ad-slot assignment, exam seat scheduling, and minimum vertex cover in bipartite graphs (König’s Theorem).',
      'Weighted minimum-cost 1-to-1 assignment (Hungarian / Kuhn-Munkres): LC 1066 Campus Bikes II, multi-object tracking (SORT/DeepSORT).',
      'Large unweighted matching (V up to 10⁵) where plain DFS Kuhn O(VE) times out.',
    ],
    whenItFails:
      'Only valid on bipartite (2-colorable, no odd cycles) graphs—for general graphs with odd cycles, use Edmonds’ Blossom Algorithm.',
    linkedTopics: ['Graphs & Topo Sort', 'Union-Find & Shortest Path'],
    linkedProblemSlugs: ['course-schedule-ii', 'network-delay-time'],
    templates: {
      python: `# Hopcroft-Karp O(E * sqrt(V)) maximum unweighted bipartite matching
from collections import deque
def hopcroft_karp(n_left, n_right, adj):
    pair_u = [-1] * n_left
    pair_v = [-1] * n_right
    dist = [0] * n_left
    def bfs():
        q = deque()
        found = False
        for u in range(n_left):
            if pair_u[u] == -1: dist[u] = 0; q.append(u)
            else: dist[u] = -1
        while q:
            u = q.popleft()
            for v in adj[u]:
                pu = pair_v[v]
                if pu == -1: found = True
                elif dist[pu] == -1: dist[pu] = dist[u] + 1; q.append(pu)
        return found
    def dfs(u):
        for v in adj[u]:
            pu = pair_v[v]
            if pu == -1 or (dist[pu] == dist[u] + 1 and dfs(pu)):
                pair_u[u] = v; pair_v[v] = u; return True
        dist[u] = -1
        return False
    matched = 0
    while bfs():
        for u in range(n_left):
            if pair_u[u] == -1 and dfs(u): matched += 1
    return matched`,
      js: `function maxBipartiteMatching(nLeft, nRight, edges) {
  const adj = Array.from({ length: nLeft }, () => []);
  for (const [u, v] of edges) adj[u].push(v);
  const pairU = new Array(nLeft).fill(-1);
  const pairV = new Array(nRight).fill(-1);
  const dist = new Array(nLeft).fill(-1);
  const bfs = () => {
    const q = [];
    let found = false;
    for (let u = 0; u < nLeft; u++) {
      if (pairU[u] === -1) { dist[u] = 0; q.push(u); } else dist[u] = -1;
    }
    for (let h = 0; h < q.length; h++) {
      const u = q[h];
      for (const v of adj[u]) {
        const pu = pairV[v];
        if (pu === -1) found = true;
        else if (dist[pu] === -1) { dist[pu] = dist[u] + 1; q.push(pu); }
      }
    }
    return found;
  };
  const dfs = (u) => {
    for (const v of adj[u]) {
      const pu = pairV[v];
      if (pu === -1 || (dist[pu] === dist[u] + 1 && dfs(pu))) {
        pairU[u] = v; pairV[v] = u; return true;
      }
    }
    dist[u] = -1;
    return false;
  };
  let matched = 0;
  while (bfs()) {
    for (let u = 0; u < nLeft; u++) if (pairU[u] === -1 && dfs(u)) matched++;
  }
  return matched;
}`,
      java: `// Hungarian Algorithm maintains dual potentials u[i]+v[j] <= cost[i][j] for O(N^3) min-cost matching.`,
    },
    frames: [
      {
        step: 1,
        title: 'BFS Phase 1: Layer Shortest Augmenting Paths',
        explanation: '3 workers (L0,L1,L2) ↔ 3 jobs (R0,R1,R2). Phase 1 finds length-1 greedy matches: L0→R0 and L1→R1.',
        invariantCheck: 'All free left vertices start at BFS distance 0.',
        variables: [{ name: 'phase', value: '1' }, { name: 'matched', value: '2' }],
        array: ['L0↔R0', 'L1↔R1', 'L2:free', 'R2:free'],
        matchedIndices: [0, 1],
        highlightIndices: [2, 3],
      },
      {
        step: 2,
        title: 'BFS Phase 2 Discovers Length-3 Augmenting Path',
        explanation: 'L2 can only do R0, which is taken by L0, who can switch to R2! Path: L2 → R0 ⇒ L0 → R2.',
        invariantCheck: 'Alternating edges: unmatched (L2,R0), matched (R0,L0), unmatched (L0,R2).',
        variables: [{ name: 'path', value: 'L2→R0⇒L0→R2' }, { name: 'len', value: '3' }],
        array: ['L2→R0', 'R0⇒L0', 'L0→R2'],
        highlightIndices: [0, 1, 2],
      },
      {
        step: 3,
        title: 'Flip Alternating Path → Matching Size = 3!',
        explanation: 'Reassign L0↔R2 and assign L2↔R0. Matching grows from 2 to 3 (perfect matching!).',
        invariantCheck: 'Path length strictly increases across phases → at most O(√V) BFS phases!',
        variables: [{ name: 'matched', value: '3 / 3' }, { name: 'pairs', value: 'L0-R2, L1-R1, L2-R0' }],
        array: ['L0↔R2', 'L1↔R1', 'L2↔R0'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 4,
        title: 'Weighted Upgrade: Hungarian Dual Potentials',
        explanation: 'When edges have costs, Hungarian algorithm adjusts row/column potentials to find min-cost perfect matching in O(V³).',
        invariantCheck: 'No augmenting path remains → provably optimal.',
        variables: [{ name: 'unweighted', value: 'O(E√V)' }, { name: 'weighted', value: 'O(V³)' }],
        array: ['Optimal=3'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1349. Maximum Students Taking Exam', difficulty: 'Hard', whyThisFits: 'Independent set on bipartite grid via Hopcroft-Karp.' },
      { platform: 'LeetCode', title: '1947. Maximum Compatibility Score Sum', difficulty: 'Medium', whyThisFits: 'Weighted bipartite assignment (Hungarian / Bitmask DP).' },
    ],
  },

  // #49 Hierholzer's & Fleury's (Eulerian Paths)
  {
    id: 'eulerian-hierholzer',
    name: 'Hierholzer’s & Fleury’s (Eulerian Path & Circuit)',
    shortName: 'Eulerian Path',
    category: 'Advanced Graph Algorithms',
    difficulty: 'Advanced',
    visualType: 'dfs-stack',
    tagline: 'Visit every single edge of a graph exactly once in O(E) linear time via Hierholzer’s post-order DFS cycle splicing.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    mentalModel:
      'Trace edges until you hit a dead end—record that vertex on your return path (post-order!), then backtrack to splice in any unvisited side-loops seamlessly.',
    coreInvariant:
      'Directed Eulerian Path exists iff every node has in==out EXCEPT at most one start (out−in=1) and one end (in−out=1). Post-order append guarantees dead-end edges sit at the very end of the final itinerary!',
    whenToUse: [
      'LC 332 Reconstruct Itinerary (lexicographically smallest flight route using every ticket once!).',
      'LC 2097 Valid Arrangement of Pairs and LC 753 Cracking the Safe (De Bruijn sequences).',
      'DNA genome assembly from k-mers (De Bruijn graph Eulerian path), PCB drilling, and snowplow routing.',
    ],
    whenItFails:
      'Fails if graph is disconnected across edges or degree parity conditions are violated. Do NOT confuse with Hamiltonian Path (visiting every VERTEX once, which is NP-Complete!).',
    linkedTopics: ['Graphs & Topo Sort'],
    linkedProblemSlugs: ['course-schedule-ii', 'find-if-path-exists'],
    templates: {
      python: `from collections import defaultdict
def eulerian_itinerary(tickets: list[list[str]], start="JFK") -> list[str]:
    adj = defaultdict(list)
    for u, v in sorted(tickets, reverse=True):
        adj[u].append(v)
    route, stack = [], [start]
    while stack:
        while adj[stack[-1]]:
            stack.append(adj[stack[-1]].pop())
        route.append(stack.pop())
    return route[::-1]`,
      js: `function eulerianItinerary(tickets, start = 'JFK') {
  const adj = new Map();
  for (const [u, v] of [...tickets].sort((a, b) => (a[0] === b[0] ? b[1].localeCompare(a[1]) : a[0].localeCompare(b[0])))) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u).push(v);
  }
  const route = [], stack = [start];
  while (stack.length) {
    const top = stack[stack.length - 1];
    const nexts = adj.get(top);
    if (nexts && nexts.length) stack.push(nexts.pop());
    else route.push(stack.pop());
  }
  return route.reverse();
}`,
      java: `// Reverse-sort adjacency lists so pop() takes lexicographically smallest edge in O(1)!`,
    },
    frames: [
      {
        step: 1,
        title: 'Trap Dead-End First: JFK → KUL',
        explanation: 'Tickets: JFK→KUL, JFK→NRT, NRT→JFK. Greedy DFS picks alphabetical KUL first and gets stuck!',
        invariantCheck: 'Hierholzer’s does NOT panic on dead ends—it pushes KUL to post-order output.',
        variables: [{ name: 'stack', value: '[JFK, KUL]' }, { name: 'route', value: '[]' }],
        array: ['JFK', 'KUL (stuck!)'],
        stackItems: [{ label: 'JFK' }, { label: 'KUL', sub: '0 out-edges', active: true }],
      },
      {
        step: 2,
        title: 'Pop Dead End KUL to Route Tail',
        explanation: 'Pop KUL → route=[KUL]. Back at JFK, remaining edge JFK→NRT→JFK is still waiting!',
        invariantCheck: 'Dead end is placed at the final destination once reversed.',
        variables: [{ name: 'stack', value: '[JFK, NRT, JFK]' }, { name: 'route', value: '[KUL]' }],
        array: ['JFK', 'NRT', 'JFK'],
        stackItems: [{ label: 'JFK' }, { label: 'NRT' }, { label: 'JFK', active: true }],
      },
      {
        step: 3,
        title: 'Unwind Remaining Stack in Post-Order',
        explanation: 'All edges consumed! Popping stack yields route = [KUL, JFK, NRT, JFK].',
        invariantCheck: 'Every edge popped exactly once → O(E log E) with sorting, O(E) without.',
        variables: [{ name: 'postOrder', value: '[KUL,JFK,NRT,JFK]' }],
        array: ['KUL', 'JFK', 'NRT', 'JFK'],
        highlightIndices: [0, 1, 2, 3],
      },
      {
        step: 4,
        title: 'Reverse Post-Order → Valid Itinerary!',
        explanation: 'Reversed: JFK → NRT → JFK → KUL! Fleury’s algorithm takes O(E²) checking bridges; Hierholzer’s achieves O(E).',
        invariantCheck: 'Every ticket used exactly once in lexicographically smallest order.',
        variables: [{ name: 'itinerary', value: 'JFK→NRT→JFK→KUL' }],
        array: ['JFK', 'NRT', 'JFK', 'KUL'],
        matchedIndices: [0, 1, 2, 3],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '332. Reconstruct Itinerary', difficulty: 'Hard', whyThisFits: 'Canonical Hierholzer’s post-order Eulerian path.' },
      { platform: 'LeetCode', title: '2097. Valid Arrangement of Pairs', difficulty: 'Hard', whyThisFits: 'Direct Eulerian path on directed pair endpoints.' },
    ],
  },

  // #50 Tarjan's Bridge-Finding Algorithm
  {
    id: 'tarjan-bridges-articulation',
    name: 'Tarjan’s Bridge-Finding & Articulation Points',
    shortName: 'Tarjan Bridges',
    category: 'Advanced Graph Algorithms',
    difficulty: 'Advanced',
    visualType: 'weighted-network',
    tagline: 'Identify every single-point-of-failure network link (bridge) and router (articulation point) in one O(V + E) DFS pass using discovery & low-link times.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    mentalModel:
      'Think of bridges connecting islands: an edge (u→v) is a critical bridge if island v and its entire subtree have NO secret back-edge tunnel reaching u or any ancestor above u.',
    coreInvariant:
      'Bridge condition: `low[v] > disc[u]` strictly (for undirected DFS tree edge u→v, ignoring direct parent edge). Articulation point: `low[v] >= disc[u]` (or root with ≥ 2 DFS children).',
    whenToUse: [
      'LC 1192 Critical Connections in a Network (one of Amazon’s highest-frequency Hard graph problems).',
      'Network resilience engineering: finding single points of failure in fiber/datacenter topologies.',
      'Biconnected component decomposition and 2-edge-connected components.',
    ],
    whenItFails:
      'Watch out for parallel (duplicate) undirected edges between the same pair (u, v): ignore only ONE parent edge by edge-ID (not parent vertex ID!), otherwise a double link gets falsely flagged as a bridge.',
    linkedTopics: ['Graphs & Topo Sort', 'Union-Find & Shortest Path'],
    linkedProblemSlugs: ['find-if-path-exists', 'course-schedule-ii'],
    templates: {
      python: `def find_bridges(n: int, edges: list[list[int]]) -> list[list[int]]:
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    disc, low = [-1] * n, [0] * n
    timer, bridges = [0], []
    def dfs(u, parent):
        disc[u] = low[u] = timer[0]; timer[0] += 1
        for v in adj[u]:
            if v == parent: continue
            if disc[v] == -1:
                dfs(v, u)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append([min(u, v), max(u, v)])
            else:
                low[u] = min(low[u], disc[v])
    for i in range(n):
        if disc[i] == -1: dfs(i, -1)
    return bridges`,
      js: `function findBridges(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const disc = new Array(n).fill(-1), low = new Array(n).fill(0);
  let timer = 0;
  const bridges = [];
  const dfs = (u, parent) => {
    disc[u] = low[u] = timer++;
    for (const v of adj[u]) {
      if (v === parent) continue;
      if (disc[v] === -1) {
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > disc[u]) bridges.push([Math.min(u, v), Math.max(u, v)]);
      } else {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  };
  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i, -1);
  return bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}`,
      java: `// Strict inequality low[v] > disc[u] flags a Bridge; low[v] >= disc[u] flags an Articulation Point.`,
    },
    frames: [
      {
        step: 1,
        title: 'DFS Triangle 0−1−2 Discovers Back-Edge 2→0',
        explanation: 'disc: 0(0), 1(1), 2(2). Back-edge 2→0 drops low[2] = min(2, disc[0]=0) = 0, propagating low[1]=0.',
        invariantCheck: 'Since low[1]=0 ≤ disc[0]=0 and low[2]=0 ≤ disc[1]=1, NO edge in cycle 0-1-2 is a bridge!',
        variables: [{ name: 'disc', value: '[0,1,2,-]' }, { name: 'low', value: '[0,0,0,-]' }],
        array: ['0(0/0)', '1(1/0)', '2(2/0)', '3(-/-)'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 2,
        title: 'Explore Branch Edge 1 → 3',
        explanation: 'Node 3 gets disc[3]=3, low[3]=3. It has no back-edge to {0,1,2}.',
        invariantCheck: 'low[3]=3 > disc[1]=1 strictly!',
        variables: [{ name: 'disc[1]', value: '1' }, { name: 'low[3]', value: '3' }, { name: 'bridge?', value: '3 > 1 TRUE!' }],
        array: ['0(0/0)', '1(1/0)', '2(2/0)', '3(3/3)*'],
        highlightIndices: [1, 3],
      },
      {
        step: 3,
        title: 'Flag Critical Connection [1, 3]',
        explanation: 'Removing edge (1, 3) disconnects node 3 from the network! Node 1 is also an Articulation Point.',
        invariantCheck: 'Single O(V+E) DFS found every bridge without brute-force O(E·(V+E)) edge deletion.',
        variables: [{ name: 'bridges', value: '[[1, 3]]' }, { name: 'articulation', value: '[1]' }],
        array: ['Bridge: [1, 3]'],
        matchedIndices: [0],
      },
      {
        step: 4,
        title: 'Compare Bridge vs Articulation Rule',
        explanation: 'Bridge: low[v] > disc[u]. Non-root Articulation: low[v] >= disc[u]. Root Articulation: ≥2 DFS tree children.',
        invariantCheck: '100% linear O(V + E) time.',
        variables: [{ name: 'result', value: '[[1,3]]' }],
        array: ['[1, 3]'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1192. Critical Connections in a Network', difficulty: 'Hard', whyThisFits: 'Exact Tarjan’s Bridge-Finding interview problem.' },
      { platform: 'LeetCode', title: '1568. Minimum Number of Days to Disconnect Island', difficulty: 'Hard', whyThisFits: 'Uses Articulation Points to check 1-cut disconnect.' },
    ],
  },

  // #51 Johnson's Algorithm
  {
    id: 'johnsons-all-pairs',
    name: 'Johnson’s Algorithm (Sparse All-Pairs Shortest Path)',
    shortName: 'Johnson’s APSP',
    category: 'Advanced Graph Algorithms',
    difficulty: 'Advanced',
    visualType: 'weighted-network',
    tagline: 'Combine Bellman-Ford potential reweighting + V runs of Dijkstra to compute All-Pairs Shortest Paths with negative edges in O(V·E log V)!',
    timeComplexity: 'O(V·E log V)',
    spaceComplexity: 'O(V²)',
    mentalModel:
      'Think of re-leveling hilly terrain by adding elevation h[u] to every node: `w\'(u,v) = w(u,v) + h[u] − h[v] ≥ 0`. Every edge becomes non-negative WITHOUT changing which path is shortest, unlocking fast Dijkstra from every source!',
    coreInvariant:
      'Telescoping Path Sum: along any path s→...→t, intermediate h-potentials cancel completely: dist\'(s,t) = dist(s,t) + h[s] − h[t].',
    whenToUse: [
      'Sparse directed graphs (E ≪ V²) with negative edge weights where Floyd-Warshall O(V³) is too slow.',
      'Masterpiece showcase of ALGORITHM COMBINATION: Bellman-Ford (1×) + Dijkstra (V×).',
      'Arbitrage & difference-constraint network analysis across all pairs.',
    ],
    whenItFails:
      'Aborts if a negative-weight cycle exists (detected cleanly by Bellman-Ford). On dense graphs (E ≈ V²), Floyd-Warshall O(V³) has lower constant factors and simpler code.',
    linkedTopics: ['Union-Find & Shortest Path'],
    linkedProblemSlugs: ['network-delay-time', 'cheapest-flights-within-k-stops'],
    templates: {
      python: `# 1) Add super-source Q with 0-weight edge to all v
# 2) Run Bellman-Ford from Q to get potentials h[v] (abort on neg cycle)
# 3) Reweight edges: w'(u,v) = w(u,v) + h[u] - h[v] >= 0
# 4) Run Dijkstra from every u; restore dist(u,v) = d'(u,v) - h[u] + h[v]`,
      js: `function johnsonsAPSP(n, edges) {
  // Step 1 & 2: Bellman-Ford from virtual super-source (dist init 0 for all nodes)
  const h = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (h[u] + w < h[v]) {
        if (i === n - 1) return null; // Negative cycle!
        h[v] = h[u] + w;
        changed = true;
      }
    }
    if (!changed) break;
  }
  // Step 3: Reweight edges to guaranteed >= 0
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of edges) adj[u].push([v, w + h[u] - h[v]]);
  // Step 4: Dijkstra from each vertex + un-reweight
  const res = [];
  for (let s = 0; s < n; s++) {
    const dist = new Array(n).fill(Infinity);
    const vis = new Array(n).fill(false);
    dist[s] = 0;
    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) if (!vis[i] && (u === -1 || dist[i] < dist[u])) u = i;
      if (u === -1 || dist[u] === Infinity) break;
      vis[u] = true;
      for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
    res.push(dist.map((d, t) => (d === Infinity ? null : d - h[s] + h[t])));
  }
  return res;
}`,
      java: `// Reweighted edge w'(u,v) = w(u,v) + h[u] - h[v] >= 0 by triangle inequality h[v] <= h[u] + w(u,v)!`,
    },
    frames: [
      {
        step: 1,
        title: 'Attach Virtual Super-Source Q → All Nodes (w=0)',
        explanation: 'Graph has negative edge 1→2 (−4). Run 1 Bellman-Ford pass from Q to find node potentials h[].',
        invariantCheck: 'Triangle inequality guarantees h[v] ≤ h[u] + w(u,v) for every edge.',
        variables: [{ name: 'edges', value: '0→1(2), 1→2(-4), 2→0(5)' }, { name: 'h[]', value: '[0, 0, -4]' }],
        array: ['h[0]=0', 'h[1]=0', 'h[2]=-4'],
        highlightIndices: [2],
      },
      {
        step: 2,
        title: 'Reweight Edges: w\'(u,v) = w + h[u] − h[v] ≥ 0',
        explanation: '1→2 becomes −4 + 0 − (−4) = 0! 2→0 becomes 5 + (−4) − 0 = 1! Every edge is now ≥ 0!',
        invariantCheck: 'Zero negative edges remain → Dijkstra is now 100% valid!',
        variables: [{ name: 'w\'(0,1)', value: '2' }, { name: 'w\'(1,2)', value: '0' }, { name: 'w\'(2,0)', value: '1' }],
        array: ['0→1:2', '1→2:0', '2→0:1'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 3,
        title: 'Run V× Dijkstra on Non-Negative Graph',
        explanation: 'From 0: d\'=[0, 2, 2]. Un-reweight via d\' − h[0] + h[t] → true dists = [0, 2, −2]!',
        invariantCheck: 'Original shortest path preserved identically via telescoping sum.',
        variables: [{ name: 'from 0', value: '[0, 2, -2]' }, { name: 'from 1', value: '[1, 0, -4]' }],
        array: ['0:[0,2,-2]', '1:[1,0,-4]', '2:[5,7,0]'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 4,
        title: 'O(V·E log V) Beats Floyd-Warshall O(V³) on Sparse Graphs',
        explanation: 'For V=2000, E=6000: Johnson does ~1.3×10⁸ ops vs Floyd-Warshall’s 8×10⁹ ops (60× speedup!).',
        invariantCheck: 'Negative cycle detection built-in.',
        variables: [{ name: 'complexity', value: 'O(VE log V)' }],
        array: ['60× faster on sparse graphs'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1334. Find the City With Smallest Neighbors', difficulty: 'Medium', whyThisFits: 'Compare Floyd-Warshall vs V× Dijkstra / Johnson.' },
      { platform: 'SPOJ', title: 'JHNSN - Johnson’s Algorithm', difficulty: 'Hard', whyThisFits: 'Sparse all-pairs shortest path with negative edges.' },
    ],
  },

  // #53 Centroid Decomposition
  {
    id: 'centroid-decomposition',
    name: 'Centroid Decomposition (Divide & Conquer on Trees)',
    shortName: 'Centroid Decomp',
    category: 'Range Queries & Advanced Trees',
    difficulty: 'Advanced',
    visualType: 'tree-structure',
    tagline: 'Recursively split any N-node tree at its balanced centroid (every component ≤ N/2) to build a centroid tree of height ≤ log₂ N.',
    timeComplexity: 'O(N log N) build · O(log N) query',
    spaceComplexity: 'O(N)',
    mentalModel:
      'Just like Merge Sort splits an array at its midpoint for O(log N) recursion depth, Centroid Decomposition splits an arbitrary tree at its "center of gravity" node so every resulting piece has at most N/2 nodes!',
    coreInvariant:
      'Every path (u, v) in the original tree passes through a UNIQUE lowest common ancestor c in the Centroid Tree—allowing path-distance queries and updates in O(log N) by walking up centroid ancestors.',
    whenToUse: [
      'Counting tree paths of exact length K or ≤ K in O(N log N) (instead of O(N²)).',
      'Dynamic "paint node red / query nearest red node" on trees (Codeforces Xenia and Tree).',
      'Divide-and-conquer aggregation across all pairs of nodes in weighted trees.',
    ],
    whenItFails:
      'Does not support dynamic structural edge insertions/deletions (Link-Cut Tree) or path-range modifications along a chain (Heavy-Light Decomposition + Segment Tree).',
    linkedTopics: ['Trees DFS/BFS'],
    linkedProblemSlugs: ['lowest-common-ancestor-bst', 'binary-tree-max-path-sum'],
    templates: {
      python: `def find_centroid(u, parent, total, adj, removed, sz):
    for v in adj[u]:
        if v != parent and not removed[v] and sz[v] > total // 2:
            return find_centroid(v, u, total, adj, removed, sz)
    return u`,
      js: `function buildCentroidTree(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const removed = new Array(n).fill(false);
  const sz = new Array(n).fill(0);
  const parent = new Array(n).fill(-1);
  const getSize = (u, p) => {
    sz[u] = 1;
    for (const v of adj[u]) if (v !== p && !removed[v]) sz[u] += getSize(v, u);
    return sz[u];
  };
  const getCentroid = (u, p, total) => {
    for (const v of adj[u]) if (v !== p && !removed[v] && sz[v] > Math.floor(total / 2))
      return getCentroid(v, u, total);
    return u;
  };
  const decompose = (entry, pCentroid) => {
    const total = getSize(entry, -1);
    const c = getCentroid(entry, -1, total);
    removed[c] = true;
    parent[c] = pCentroid;
    for (const v of adj[c]) if (!removed[v]) decompose(v, c);
  };
  decompose(0, -1);
  return parent;
}`,
      java: `// Height of centroid tree is strictly <= floor(log2 N), so every node has O(log N) centroid ancestors!`,
    },
    frames: [
      {
        step: 1,
        title: 'Compute Subtree Sizes on 7-Node Tree',
        explanation: 'Line-like tree 0−1−2−3−4−5−6 (N=7). Walk into any child with sz[v] > floor(7/2)=3.',
        invariantCheck: 'Every tree has 1 or 2 centroids whose removal leaves all pieces ≤ N/2.',
        variables: [{ name: 'N', value: '7' }, { name: 'half', value: '3' }],
        array: [0, 1, 2, 3, 4, 5, 6],
        highlightIndices: [3],
      },
      {
        step: 2,
        title: 'Remove Root Centroid=3 → Two Halves of Size 3',
        explanation: 'Deleting node 3 splits tree into {0,1,2} (size 3 ≤ 3) and {4,5,6} (size 3 ≤ 3).',
        invariantCheck: 'Centroid root = 3 (parent[3] = −1).',
        variables: [{ name: 'centroid', value: '3' }, { name: 'leftPiece', value: '{0,1,2}' }, { name: 'rightPiece', value: '{4,5,6}' }],
        array: ['[0,1,2]', 'C=3*', '[4,5,6]'],
        matchedIndices: [1],
      },
      {
        step: 3,
        title: 'Recurse on Both Pieces → Centroids 1 & 5',
        explanation: 'Centroid of {0,1,2} is 1 (parent=3); centroid of {4,5,6} is 5 (parent=3).',
        invariantCheck: 'Remaining pieces are single leaves {0},{2},{4},{6} of size 1.',
        variables: [{ name: 'parent[1]', value: '3' }, { name: 'parent[5]', value: '3' }],
        array: ['0→1', '1→3', '2→1', '3→-1', '4→5', '5→3', '6→5'],
        matchedIndices: [1, 3, 5],
      },
      {
        step: 4,
        title: 'Height Reduced From 7 to 3 (≤ log₂ N)!',
        explanation: 'Every node now reaches root centroid in ≤ 2 hops → all-paths queries run in O(N log N)!',
        invariantCheck: 'parent = [1, 3, 1, -1, 5, 3, 5].',
        variables: [{ name: 'height', value: '3' }, { name: 'buildTime', value: 'O(N log N)' }],
        array: [1, 3, 1, -1, 5, 3, 5],
        matchedIndices: [0, 1, 2, 3, 4, 5, 6],
      },
    ],
    platformDrills: [
      { platform: 'Codeforces', title: '342E. Xenia and Tree', difficulty: 'Hard', whyThisFits: 'Canonical Centroid Tree nearest-red-node queries in O(log N).' },
      { platform: 'CSES', title: 'Fixed-Length Paths I & II', difficulty: 'Hard', whyThisFits: 'Counts all tree paths of length K in O(N log N).' },
    ],
  },

  // #55 Bloom Filters
  {
    id: 'bloom-filter',
    name: 'Bloom Filter (Probabilistic Bitset Membership)',
    shortName: 'Bloom Filter',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'bit-grid',
    tagline: 'Test membership in O(k) time with about 10 bits per key for an illustrative ~1% false-positive target; a correctly maintained standard filter without deletions has no false negatives for inserted keys.',
    timeComplexity: 'O(k) insert & query',
    spaceComplexity: 'O(m bits) ≈ 1.44 N log₂(1/ε)',
    mentalModel:
      'Think of marking k positions in an m-bit strip for every inserted item. If any required bit is 0, the item is definitely absent from the represented set. This no-false-negative property assumes a standard filter is built and updated correctly and that inserted bits are not cleared by deletions.',
    coreInvariant:
      'For a standard Bloom filter without deletions, if bit[h_i(x)] === 0 for any i ∈ [1..k], x was not inserted into the represented set. If all bits are 1, the item may still be absent (a false positive). The approximate optimal hash count is k = (m/n) ln 2.',
    whenToUse: [
      'RocksDB / Cassandra / LevelDB SSTable read filtering — can skip many disk reads for absent keys when the filter is sized for a low false-positive rate; savings depend on the workload and filter configuration.',
      'Chrome Safe Browsing URL blocklists, CDN one-hit-wonder cache admission filters, and web crawler deduplication.',
      'Distributed SQL Semi-Join pushdown (send tiny Bloom Filter over network instead of millions of join keys).',
    ],
    whenItFails:
      'Standard Bloom Filters CANNOT delete keys (clearing a bit breaks overlapping keys—use Counting Bloom Filter or Cuckoo Filter for deletions) and cannot enumerate stored items.',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['contains-duplicate', 'two-sum'],
    templates: {
      python: `class BloomFilter:
    def __init__(self, m: int):
        self.m = m
        self.bits = [0] * m
    def _hashes(self, key: str):
        h1 = sum((i + 1) * ord(c) for i, c in enumerate(key)) % self.m
        h2 = (sum(ord(c) * 31 for c in key) + 7) % self.m
        return [h1, h2]
    def add(self, key: str):
        for h in self._hashes(key): self.bits[h] = 1
    def might_contain(self, key: str) -> bool:
        return all(self.bits[h] == 1 for h in self._hashes(key))`,
      js: `function runBloomFilter(m, inserts, queries) {
  const bits = new Array(m).fill(0);
  const hashes = (s) => {
    let h1 = 0, h2 = 7;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = (h1 * 31 + c) % m;
      h2 = (h2 * 17 + c * (i + 1)) % m;
    }
    return [h1, h2, (h1 + h2) % m];
  };
  for (const key of inserts) for (const idx of hashes(key)) bits[idx] = 1;
  return queries.map((q) => hashes(q).every((idx) => bits[idx] === 1));
}`,
      java: `// Optimal bits m = -n * ln(p) / (ln 2)^2 (~9.6 bits/key for 1% false positive rate!)`,
    },
    frames: [
      {
        step: 1,
        title: 'Initialize m=10 Bit Array (All Zeros)',
        explanation: 'Tiny 10-bit filter uses 2 hash functions h1, h2. Zero keys stored yet.',
        invariantCheck: 'Every query returns FALSE (definitely absent).',
        variables: [{ name: 'm', value: '10 bits' }, { name: 'k', value: '2 hashes' }],
        array: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        step: 2,
        title: 'Insert "redis" → Set Bits 2 & 7',
        explanation: 'h1("redis")=2, h2("redis")=7. Flip bits[2]=1 and bits[7]=1. Actual string is NOT stored!',
        invariantCheck: 'Constant O(k) bit writes regardless of set size.',
        variables: [{ name: 'insert', value: '"redis"' }, { name: 'bitsSet', value: '2, 7' }],
        array: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
        matchedIndices: [2, 7],
      },
      {
        step: 3,
        title: 'Insert "kafka" → Set Bits 4 & 7 (Overlap!)',
        explanation: 'h1("kafka")=4, h2("kafka")=7. Bit 7 is shared by both "redis" and "kafka" — why standard delete is impossible!',
        invariantCheck: 'Set bits = {2, 4, 7}.',
        variables: [{ name: 'insert', value: '"kafka"' }, { name: 'bitsSet', value: '4, 7' }],
        array: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
        highlightIndices: [7],
        matchedIndices: [4],
      },
      {
        step: 4,
        title: 'Query "mongo" (bits 1, 4) → DEFINITELY ABSENT!',
        explanation: 'bit[1]==0 immediately proves "mongo" is NOT on disk — skip expensive SSTable I/O! If bits 2 & 4 hit on an unseen key, that is a False Positive.',
        invariantCheck: 'A standard Bloom filter without deletions has no false negatives for inserted items; positives may be false and require authoritative verification.',
        variables: [{ name: 'query', value: '"mongo"' }, { name: 'bit[1]', value: '0 → SKIP DISK' }],
        array: [0, 0, 1, 0, 1, 0, 0, 1, 0, 0],
        eliminatedIndices: [1],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'RocksDB / Cassandra Read Path Optimization', difficulty: 'Hard', whyThisFits: 'Bloom filters can avoid disk reads for many absent keys; the actual reduction depends on filter sizing, workload and false-positive rate.' },
      { platform: 'System Design', title: 'Web Crawler 10B URL Deduplicator', difficulty: 'Medium', whyThisFits: '10B URLs fit in ~12GB RAM vs 500GB HashSet.' },
    ],
  },

  // #56 Skip Lists
  {
    id: 'skip-list',
    name: 'Skip List (Probabilistic Multi-Level Express Lanes)',
    shortName: 'Skip List',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'fast-slow',
    tagline: 'Layer probabilistic express-lane pointers over a sorted linked list for O(log N) search/insert/delete without complex tree rotations.',
    timeComplexity: 'O(log N) expected',
    spaceComplexity: 'O(N) expected',
    mentalModel:
      'Think of a subway line: the Local track stops at every station, Express L1 skips every 2nd station, and Super-Express L2 jumps across the whole city—drop down a level only when the next stop overshoots your target!',
    coreInvariant:
      'Level 0 contains all N keys sorted; each node at level i flips a coin (p=0.5 or 0.25) to promote to level i+1, yielding expected height O(log N) and lock-free friendly local pointer updates.',
    whenToUse: [
      'Redis Sorted Sets (ZSET), LevelDB / RocksDB MemTables, and Java `ConcurrentSkipListMap`.',
      'Concurrent ordered maps where lock-free CAS on forward pointers beats Red-Black Tree global rebalancing locks.',
      'Fast O(log N) range scans `[L..R]` simply by walking Level-0 linked pointers once L is found.',
    ],
    whenItFails:
      'Higher pointer overhead per node than contiguous arrays/B+ Trees and worse CPU cache locality than B-Trees on single-threaded workloads.',
    linkedTopics: ['Linked Lists', 'Modified Binary Search'],
    linkedProblemSlugs: ['linked-list-cycle', 'binary-search-classic'],
    templates: {
      python: `# Search starts at top express lane and steps right while next.val < target, then drops 1 level
def search(head, max_lvl, target):
    curr = head
    for lvl in range(max_lvl - 1, -1, -1):
        while curr.forward[lvl] and curr.forward[lvl].val < target:
            curr = curr.forward[lvl]
    curr = curr.forward[0]
    return curr is not None and curr.val == target`,
      js: `function skipListSearchSteps(sortedVals, target) {
  // Deterministic power-of-2 towers simulate ideal skip list express lanes
  const n = sortedVals.length;
  const maxLvl = Math.max(1, Math.ceil(Math.log2(n + 1)));
  const levelOf = (i) => {
    let l = 1, x = i + 1;
    while (x % 2 === 0 && l < maxLvl) { l++; x /= 2; }
    return l;
  };
  const nodes = sortedVals.map((v, i) => ({ val: v, fwd: new Array(maxLvl).fill(null), lvl: levelOf(i) }));
  const head = { val: -Infinity, fwd: new Array(maxLvl).fill(null) };
  const last = new Array(maxLvl).fill(head);
  for (const node of nodes) {
    for (let l = 0; l < node.lvl; l++) {
      last[l].fwd[l] = node;
      last[l] = node;
    }
  }
  let curr = head, steps = 0;
  for (let l = maxLvl - 1; l >= 0; l--) {
    while (curr.fwd[l] && curr.fwd[l].val < target) {
      curr = curr.fwd[l];
      steps++;
    }
  }
  const hit = curr.fwd[0] !== null && curr.fwd[0].val === target;
  return { found: hit, hops: steps };
}`,
      java: `// Java ConcurrentSkipListMap provides lock-free O(log N) concurrent ordered operations.`,
    },
    frames: [
      {
        step: 1,
        title: 'Start on Express Lane L2 Searching for 19',
        explanation: 'Sorted list [3, 6, 9, 12, 17, 19, 25]. L2 express stops: HEAD → 12 → END. Jump straight to 12 in 1 hop!',
        invariantCheck: '12 < 19, so advance; next L2 is null → drop down to L1.',
        variables: [{ name: 'level', value: 'L2' }, { name: 'curr', value: '12' }, { name: 'hops', value: '1' }],
        array: [3, 6, 9, 12, 17, 19, 25],
        pointers: [{ label: 'L2', index: 3, tone: 'sky' }],
        highlightIndices: [3],
      },
      {
        step: 2,
        title: 'Drop to Lane L1: Check 12 → 17 → 25',
        explanation: '17 < 19 → hop to 17! Next L1 stop is 25 ≥ 19 (overshoot!) → drop to Local Lane L0.',
        invariantCheck: 'Skipped nodes 3, 6, 9 completely without touching them.',
        variables: [{ name: 'level', value: 'L1' }, { name: 'curr', value: '17' }, { name: 'hops', value: '2' }],
        array: [3, 6, 9, 12, 17, 19, 25],
        pointers: [{ label: 'L1', index: 4, tone: 'amber' }],
        eliminatedIndices: [0, 1, 2],
        highlightIndices: [4],
      },
      {
        step: 3,
        title: 'Local Lane L0: Step 17 → 19 (Exact Hit!)',
        explanation: 'curr.forward[0] == 19! Found target in just 2 express hops + 1 local check.',
        invariantCheck: 'Insert simply updates `update[0..newLvl]` forward pointers—zero rotations!',
        variables: [{ name: 'level', value: 'L0' }, { name: 'found', value: '19 ✓' }, { name: 'hops', value: '2' }],
        array: [3, 6, 9, 12, 17, 19, 25],
        matchedIndices: [5],
      },
      {
        step: 4,
        title: 'Range Scan [17..25] Walks L0 Directly',
        explanation: 'Once positioned at 17, reading K subsequent keys takes O(K) sequential pointer hops (Redis ZRANGEBYSCORE).',
        invariantCheck: 'O(log N + K) range query with simple concurrent locking.',
        variables: [{ name: 'range', value: '[17, 19, 25]' }],
        array: [17, 19, 25],
        matchedIndices: [0, 1, 2],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1206. Design Skiplist', difficulty: 'Hard', whyThisFits: 'Direct full Skip List insert/search/erase implementation.' },
      { platform: 'System Design', title: 'Redis Leaderboard (ZSET Skip List + Hash)', difficulty: 'Medium', whyThisFits: 'Combines HashMap O(1) lookup + Skip List O(log N) rank.' },
    ],
  },

  // #57 Count-Min Sketch
  {
    id: 'count-min-sketch',
    name: 'Count-Min Sketch (Streaming Heavy-Hitter Frequency)',
    shortName: 'Count-Min Sketch',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'matrix-grid',
    tagline: 'Estimate item frequencies across billions of streaming events in constant O(d·w) RAM by taking the MINIMUM across d independent hashed counters.',
    timeComplexity: 'O(d) update & query',
    spaceComplexity: 'O(d · w) = O((1/ε) ln(1/δ))',
    mentalModel:
      'It is a Bloom Filter upgraded from 1-bit flags to integer counters across d rows: hash collisions can only ADD noise to a cell, so taking `min(row_0, row_1, ..., row_{d-1})` strips away collision inflation!',
    coreInvariant:
      'One-Sided Overestimation Guarantee: `estimate(x) ≥ true_count(x)` for nonnegative updates without counter overflow. With the usual hash assumptions and chosen width/depth, the overestimate is at most `ε·N` with probability at least `1 − δ`, where N is the total update count.',
    whenToUse: [
      'Real-time Heavy Hitters / Top-K trending hashtags, DDoS IP rate limiting, and network packet telemetry.',
      'Caffeine / TinyLFU cache admission policy (estimates key recency/frequency in tiny fixed memory!).',
      'Distributed stream merging: add two sketches cell-by-cell (`C1 + C2`) because the sketch is linear!',
    ],
    whenItFails:
      'Poor accuracy on rare tail items (low-frequency keys get drowned out by ε·N noise from heavy hitters) and cannot handle negative decrements without Conservative Update / Count Sketch.',
    linkedTopics: ['Arrays & Prefix Sum', 'Heaps & Intervals'],
    linkedProblemSlugs: ['top-k-frequent-elements', 'kth-largest-in-stream'],
    templates: {
      python: `class CountMinSketch:
    def __init__(self, d=4, w=1024):
        self.d, self.w = d, w
        self.grid = [[0] * w for _ in range(d)]
    def _col(self, row, key):
        return (hash((row, key)) & 0x7fffffff) % self.w
    def add(self, key, count=1):
        for r in range(self.d): self.grid[r][self._col(r, key)] += count
    def query(self, key) -> int:
        return min(self.grid[r][self._col(r, key)] for r in range(self.d))`,
      js: `function countMinSketchEstimate(stream, queries, width = 16) {
  const seeds = [31, 131, 257];
  const grid = seeds.map(() => new Array(width).fill(0));
  const hashCol = (s, seed) => {
    let h = seed;
    for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) % width;
    return h;
  };
  for (const item of stream) {
    seeds.forEach((seed, r) => { grid[r][hashCol(item, seed)]++; });
  }
  return queries.map((q) => Math.min(...seeds.map((seed, r) => grid[r][hashCol(q, seed)])));
}`,
      java: `// Combine Count-Min Sketch + Min-Heap of size K to track Streaming Heavy Hitters in O(1) RAM!`,
    },
    frames: [
      {
        step: 1,
        title: 'Create d=3 × w=8 Counter Matrix',
        explanation: '3 independent hash rows track frequency of streaming events using only 24 integers total.',
        invariantCheck: 'Fixed memory independent of stream cardinality N.',
        variables: [{ name: 'd', value: '3 rows' }, { name: 'w', value: '8 cols' }],
        array: ['Row0:[0..0]', 'Row1:[0..0]', 'Row2:[0..0]'],
      },
      {
        step: 2,
        title: 'Increment Counters for "videoA" (×5) & "videoB" (×2)',
        explanation: 'Suppose row 0 collides "videoA" & "videoB" in col 3 (count=7), while rows 1 & 2 hash them to separate columns (5 and 2).',
        invariantCheck: 'Collisions only increase counters—never decrease them.',
        variables: [{ name: 'row0[col]', value: '7 (collision)' }, { name: 'row1[col]', value: '5' }, { name: 'row2[col]', value: '5' }],
        array: ['R0:7', 'R1:5', 'R2:5'],
        highlightIndices: [0],
        matchedIndices: [1, 2],
      },
      {
        step: 3,
        title: 'Query "videoA" → min(7, 5, 5) = 5 (Exact!)',
        explanation: 'Taking the minimum across all d rows rejects the collided bucket (7) and recovers exact count 5!',
        invariantCheck: 'Always satisfies estimate(x) ≥ true(x).',
        variables: [{ name: 'query', value: '"videoA"' }, { name: 'min(7,5,5)', value: '5 ✓' }],
        array: ['min(7, 5, 5) = 5'],
        matchedIndices: [0],
      },
      {
        step: 4,
        title: 'Linear Mergeability Across Distributed Shards',
        explanation: 'Sum sketches from 100 Kafka consumers cell-by-cell to get global Top-K heavy hitters without shuffling raw logs!',
        invariantCheck: 'CMS(A ∪ B) = CMS(A) + CMS(B).',
        variables: [{ name: 'space', value: 'KB vs GB' }],
        array: ['Shard1 + Shard2 = Global Sketch'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Top-K Trending Videos / DDoS Heavy Hitters', difficulty: 'Hard', whyThisFits: 'Pairs Count-Min Sketch + Min-Heap for bounded RAM.' },
      { platform: 'LeetCode', title: '347. Top K Frequent Elements (Streaming Follow-Up)', difficulty: 'Medium', whyThisFits: 'Exact HashMap breaks at 1B unique keys → switch to CMS.' },
    ],
  },

  // #58 HyperLogLog
  {
    id: 'hyperloglog',
    name: 'HyperLogLog (Streaming Distinct Cardinality)',
    shortName: 'HyperLogLog',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'bit-grid',
    tagline: 'Count 1 BILLION unique users with ~0.81% error using ONLY 12 KB of RAM (Redis PFADD/PFCOUNT) by tracking leading-zero runs across m registers.',
    timeComplexity: 'O(1) insert · O(m) count',
    spaceComplexity: 'O(m) ≈ 12 KB fixed',
    mentalModel:
      'Ten consecutive heads (`1111111111`) have probability 2⁻¹⁰ per independent trial, so about 2¹⁰ = 1,024 trials are expected before seeing that run. HyperLogLog hashes each item, uses part of the hash to select one of m = 2^p registers, and records the largest leading-zero rank in the remaining bits. A corrected harmonic-mean estimator combines the registers to reduce variance.',
    coreInvariant:
      'First p bits choose bucket j ∈ [0..m−1]; remaining bits count leading zeros ρ; harmonic mean E = α_m · m² · (Σ 2^{−M[j]})⁻¹ shrinks variance to σ ≈ 1.04 / √m.',
    whenToUse: [
      'Counting unique daily active users (DAU), unique search queries, unique IPs, or SQL `APPROX_COUNT_DISTINCT` in BigQuery/Presto/ClickHouse.',
      'Redis HyperLogLog (`PFADD`, `PFCOUNT`, `PFMERGE`) — unioning two HLLs is just element-wise `max(M1[j], M2[j])`!',
      'Exact HashSet of 10⁹ 64-bit IDs needs 8+ GB RAM; HLL needs 12 KB (650,000× memory reduction!).',
    ],
    whenItFails:
      'Cannot check individual membership (use Bloom Filter), cannot delete items, and cannot compute exact intersection cleanly (inclusion-exclusion amplifies error on tiny intersections).',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['contains-duplicate'],
    templates: {
      python: `# Redis uses p=14 (m=16,384 6-bit registers = 12 KB) for 0.81% standard error!
def hll_merge(reg_a: list[int], reg_b: list[int]) -> list[int]:
    return [max(a, b) for a, b in zip(reg_a, reg_b)]`,
      js: `function hyperLogLogEstimate(items, p = 4) {
  const m = 1 << p;
  const regs = new Array(m).fill(0);
  const hash32 = (str) => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  };
  for (const raw of items) {
    const h = hash32(String(raw));
    const bucket = h >>> (32 - p);
    const w = (h << p) >>> 0;
    const rho = w === 0 ? (32 - p + 1) : Math.clz32(w) + 1;
    if (rho > regs[bucket]) regs[bucket] = rho;
  }
  const alpha = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);
  let sum = 0, zeros = 0;
  for (const r of regs) { sum += Math.pow(2, -r); if (r === 0) zeros++; }
  let est = (alpha * m * m) / sum;
  if (est <= 2.5 * m && zeros > 0) est = m * Math.log(m / zeros); // LinearCounting small-range correction
  return Math.round(est);
}`,
      java: `// Union across shards: merged[j] = Math.max(hllA[j], hllB[j]) in O(m) with zero raw data!`,
    },
    frames: [
      {
        step: 1,
        title: 'Hash Incoming Event → Split into Bucket + Leading Zeros',
        explanation: '32-bit hash `1011 | 000101...`: first p=4 bits select bucket #11; remaining bits have 3 leading zeros → ρ = 4.',
        invariantCheck: 'Register M[11] stores max(M[11], ρ) — duplicates are idempotent!',
        variables: [{ name: 'bucket', value: '11' }, { name: 'leading0s', value: '3 → ρ=4' }],
        array: [1, 2, 1, 3, 2, 1, 2, 4],
        highlightIndices: [7],
      },
      {
        step: 2,
        title: 'Duplicates Leave Registers Unchanged',
        explanation: 'Seeing the exact same userId 1,000 times hashes to the same bucket and same ρ → zero inflation!',
        invariantCheck: 'Idempotent max() guarantees duplicates never skew cardinality.',
        variables: [{ name: 'duplicate', value: 'user_42' }, { name: 'registerChange', value: '0' }],
        array: [1, 2, 1, 3, 2, 1, 2, 4],
        matchedIndices: [7],
      },
      {
        step: 3,
        title: 'Harmonic Mean Dampens Lucky Outlier Buckets',
        explanation: 'Even if 1 bucket got lucky (ρ=9), harmonic mean Σ 2^{−M[j]} prevents a single outlier from exploding the estimate!',
        invariantCheck: 'Small-range empty buckets switch smoothly to LinearCounting m·ln(m/V).',
        variables: [{ name: 'stdError', value: '1.04 / √m' }, { name: 'RAM (m=16384)', value: '12 KB' }],
        array: ['Harmonic Mean', '0.81% error', '12 KB RAM'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 4,
        title: 'Multi-Region Union via Element-Wise Max',
        explanation: 'Combine US + EU + APAC unique visitors with `max(M_us[j], M_eu[j], M_apac[j])` in microseconds!',
        invariantCheck: 'Commutative, associative, idempotent merge (also a valid CRDT!).',
        variables: [{ name: 'mergeOp', value: 'max(A[j], B[j])' }],
        array: ['PFMERGE = O(m)'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'System Design', title: 'Unique View Counter at YouTube / Analytics Scale', difficulty: 'Hard', whyThisFits: 'Standard Redis HyperLogLog architecture.' },
      { platform: 'Database Internals', title: 'SQL APPROX_COUNT_DISTINCT Aggregation', difficulty: 'Medium', whyThisFits: 'Parallel worker HLL merge across distributed partitions.' },
    ],
  },

  // #59 Cache Replacement (LRU, LFU, ARC)
  {
    id: 'cache-lru-lfu-arc',
    name: 'Cache Replacement Policies (LRU, LFU & ARC)',
    shortName: 'LRU / LFU / ARC',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Core',
    visualType: 'prefix-hash',
    tagline: 'Serve hot reads in O(1) via HashMap + Doubly Linked List (LRU), frequency buckets (LFU), or scan-resistant self-tuning ghost lists (ARC).',
    timeComplexity: 'O(1) get & put',
    spaceComplexity: 'O(Capacity)',
    mentalModel:
      'LRU is a desk pile where touching a file moves it to the top and the dusty bottom file gets evicted. LFU tracks how many times each file was touched. ARC adapts between recency and frequency using resident and ghost lists, which can reduce scan pollution compared with plain LRU; it does not guarantee that hot entries are never evicted.',
    coreInvariant:
      'LRU: HashMap<Key, Node> gives O(1) pointer into Doubly Linked List for O(1) splice-to-head and O(1) tail eviction. LFU: HashMap<Freq, DLL> + `minFreq` pointer achieves O(1) tie-broken eviction.',
    whenToUse: [
      'LC 146 LRU Cache and LC 460 LFU Cache — two of the most frequently asked Senior/Staff coding interview problems.',
      'Database buffer pools (PostgreSQL Clock-Sweep, InnoDB midpoint-insertion LRU, ZFS ARC, Caffeine W-TinyLFU).',
      'CDN edge caching & application memoization layers.',
    ],
    whenItFails:
      'Pure LRU suffers catastrophic "scan pollution" when a sequential backup scan of N > C pages evicts every single hot working-set page—use ARC, LRU-K, or W-TinyLFU for database buffer pools!',
    linkedTopics: ['Linked Lists', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['lru-cache', 'reverse-linked-list'],
    templates: {
      python: `from collections import OrderedDict
class LRUCache:
    def __init__(self, cap: int):
        self.cap, self.od = cap, OrderedDict()
    def get(self, key: int) -> int:
        if key not in self.od: return -1
        self.od.move_to_end(key)
        return self.od[key]
    def put(self, key: int, val: int) -> None:
        if key in self.od: self.od.move_to_end(key)
        self.od[key] = val
        if len(self.od) > self.cap: self.od.popitem(last=False)`,
      js: `function runLruCacheOps(capacity, ops) {
  const map = new Map();
  const out = [];
  for (const [op, k, v] of ops) {
    if (op === 'get') {
      if (!map.has(k)) { out.push(-1); continue; }
      const val = map.get(k);
      map.delete(k);
      map.set(k, val);
      out.push(val);
    } else if (op === 'put') {
      if (map.has(k)) map.delete(k);
      else if (map.size >= capacity) map.delete(map.keys().next().value);
      map.set(k, v);
    }
  }
  return out;
}`,
      java: `// For O(1) LFU: keyToNode + freqToDLL + int minFreq (incremented only when freqToDLL[minFreq] empties).`,
    },
    frames: [
      {
        step: 1,
        title: 'Put (A=1), Put (B=2) into Capacity=2 Cache',
        explanation: 'HashMap points straight to DLL nodes. Order (MRU → LRU): [B, A].',
        invariantCheck: 'Head = Most Recently Used; Tail = Eviction Victim.',
        variables: [{ name: 'cap', value: '2' }, { name: 'order', value: 'B → A' }],
        array: ['B(MRU)', 'A(LRU)'],
        matchedIndices: [0, 1],
      },
      {
        step: 2,
        title: 'Get(A) Promotes A to MRU Head in O(1)',
        explanation: 'Unlink A using prev/next pointers and splice at Head → [A, B]. B is now the LRU victim!',
        invariantCheck: 'Zero list traversal needed thanks to HashMap<Key, Node>.',
        variables: [{ name: 'get(A)', value: '1' }, { name: 'order', value: 'A → B' }],
        array: ['A(MRU)', 'B(LRU)'],
        matchedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 3,
        title: 'Put(C=3) Evicts Tail B in O(1)',
        explanation: 'Cache full → pop Tail B, delete B from HashMap, insert C at Head → [C, A].',
        invariantCheck: 'Both HashMap and DLL remain strictly synchronized.',
        variables: [{ name: 'evicted', value: 'B' }, { name: 'order', value: 'C → A' }],
        array: ['C(MRU)', 'A(LRU)', '×B'],
        matchedIndices: [0, 1],
        eliminatedIndices: [2],
      },
      {
        step: 4,
        title: 'Upgrade to ARC / W-TinyLFU for Scan Resistance',
        explanation: 'ARC keeps ghost eviction histories B1/B2 to dynamically shift space between Recency (T1) and Frequency (T2) without manual tuning!',
        invariantCheck: 'Immune to sequential full-table scan cache thrashing.',
        variables: [{ name: 'T1', value: 'Recent' }, { name: 'T2', value: 'Frequent' }],
        array: ['T1(Recency)', 'T2(Frequency)', 'B1/B2 Ghosts'],
        matchedIndices: [0, 1, 2],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '146. LRU Cache', difficulty: 'Medium', whyThisFits: 'Canonical HashMap + Doubly Linked List O(1) cache.' },
      { platform: 'LeetCode', title: '460. LFU Cache', difficulty: 'Hard', whyThisFits: 'Frequency bucket DLL + O(1) minFreq tracking.' },
    ],
  },

  // #60 Buddy Memory Allocation
  {
    id: 'buddy-memory-allocator',
    name: 'Buddy Memory Allocation (Power-of-2 Split & Coalesce)',
    shortName: 'Buddy Allocator',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'array-cells-bit',
    tagline: 'Allocate memory in 2^k blocks and compute any block’s mergeable twin address in a single O(1) XOR (`addr ^ size`) for instant external-fragmentation coalescing.',
    timeComplexity: 'O(log M) alloc & free',
    spaceComplexity: 'O(log M) free lists',
    mentalModel:
      'Think of folding a 64 KB sheet of paper in half repeatedly (64 → 32 → 16 → 8 KB) until it fits a 7 KB request. When freed, check the exact twin half (`addr ^ size`)—if it is also free, glue them back up the chain!',
    coreInvariant:
      'Every block of size 2^k starts at a multiple of 2^k; its unique buddy sits at `buddyAddr = addr ^ (1 << k)`. Coalescing repeats upward while buddy is free.',
    whenToUse: [
      'Linux Kernel physical page frame allocator (`alloc_pages` / `__free_pages`).',
      'Real-time & embedded memory allocators needing bounded O(log M) allocation and fast coalescing.',
      'GPU texture / slab memory pools.',
    ],
    whenItFails:
      'High internal fragmentation for sizes slightly above a power of 2 (requesting 33 KB wastes 31 KB inside a 64 KB block)—Linux pairs Buddy Allocator for pages with a Slab/SLUB Allocator for small objects!',
    linkedTopics: ['Arrays & Prefix Sum'],
    linkedProblemSlugs: ['binary-search-classic', 'merge-intervals'],
    templates: {
      python: `# Compute buddy address in O(1) using bitwise XOR!
def buddy_address(addr: int, block_size: int) -> int:
    return addr ^ block_size`,
      js: `function buddyAllocateAndFree(totalSize, ops) {
  // freeLists: map from blockSize -> sorted array of start addresses
  const free = new Map();
  for (let s = 1; s <= totalSize; s *= 2) free.set(s, []);
  free.get(totalSize).push(0);
  const allocs = new Map();
  const out = [];
  for (const [op, id, req] of ops) {
    if (op === 'alloc') {
      let need = 1;
      while (need < req) need *= 2;
      let cur = need;
      while (cur <= totalSize && free.get(cur).length === 0) cur *= 2;
      if (cur > totalSize) { out.push(-1); continue; }
      let addr = free.get(cur).shift();
      while (cur > need) {
        cur /= 2;
        free.get(cur).push(addr + cur);
        free.get(cur).sort((a, b) => a - b);
      }
      allocs.set(id, { addr, size: need });
      out.push(addr);
    } else if (op === 'free' && allocs.has(id)) {
      let { addr, size } = allocs.get(id);
      allocs.delete(id);
      while (size < totalSize) {
        const buddy = addr ^ size;
        const list = free.get(size);
        const idx = list.indexOf(buddy);
        if (idx === -1) break;
        list.splice(idx, 1);
        addr = Math.min(addr, buddy);
        size *= 2;
      }
      free.get(size).push(addr);
      free.get(size).sort((a, b) => a - b);
    }
  }
  return out;
}`,
      java: `// buddyAddr = addr ^ blockSize works in O(1) because blocks are power-of-2 aligned!`,
    },
    frames: [
      {
        step: 1,
        title: 'Initial 64 KB Free Pool (Single Block @ 0)',
        explanation: 'Request A asks for 10 KB → round up to power-of-2 size 16 KB. Split 64 → [32, 32], then [16, 16, 32].',
        invariantCheck: 'Every block address is aligned to its size.',
        variables: [{ name: 'req A', value: '10 KB → 16 KB' }, { name: 'splits', value: '2' }],
        array: ['A:16KB@0', 'Free:16KB@16', 'Free:32KB@32'],
        matchedIndices: [0],
      },
      {
        step: 2,
        title: 'Allocate B (12 KB → 16 KB) at Buddy Address 16',
        explanation: 'The illustrative free list already contains a suitable 16 KB block at address 16, so the lookup can be constant-time in this simplified trace. Real allocator latency also depends on metadata, synchronization, fragmentation and the allocator implementation.',
        invariantCheck: 'A@0 and B@16 are buddies: 0 ^ 16 = 16 and 16 ^ 16 = 0.',
        variables: [{ name: 'A', value: '@0 (16KB)' }, { name: 'B', value: '@16 (16KB)' }],
        array: ['A:16KB@0', 'B:16KB@16', 'Free:32KB@32'],
        matchedIndices: [0, 1],
      },
      {
        step: 3,
        title: 'Free A@0 (Buddy B@16 Busy), Then Free B@16 → Coalesce!',
        explanation: 'Freeing B@16 checks buddy `16 ^ 16 = 0` (FREE!) → merges into 32KB@0! Then checks `0 ^ 32 = 32` (FREE!) → merges back into 64KB@0!',
        invariantCheck: 'Cascading O(1) XOR buddy checks fully heal fragmentation.',
        variables: [{ name: '16^16', value: '0 (merge!)' }, { name: '0^32', value: '32 (merge!)' }],
        array: ['Free:64KB@0 (Fully Coalesced!)'],
        matchedIndices: [0],
      },
      {
        step: 4,
        title: 'Linux Kernel Combo: Buddy + SLUB Slab Allocator',
        explanation: 'Buddy manages 4KB–4MB physical pages; SLUB carves fixed small objects inside pages to eliminate internal waste.',
        invariantCheck: 'O(log M) worst-case allocation and deallocation.',
        variables: [{ name: 'time', value: 'O(log M)' }],
        array: ['Buddy (Pages) + Slab (Objects)'],
        matchedIndices: [0],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '2502. Design Memory Allocator', difficulty: 'Medium', whyThisFits: 'Contrasts linear free-block scanning vs Buddy O(log M).' },
      { platform: 'Systems', title: 'Linux Kernel Page Frame Allocator', difficulty: 'Hard', whyThisFits: 'Canonical real-world Buddy System implementation.' },
    ],
  },

  // #61 Persistent Path Copying & Fat Node Versioning
  {
    id: 'persistent-data-structures',
    name: 'Persistent Data Structures (Path Copying & Fat Nodes)',
    shortName: 'Persistent Trees',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'tree-structure',
    tagline: 'Preserve every historical version of a tree or array with O(log N) time & space per update by copying only the O(log N) root-to-leaf path!',
    timeComplexity: 'O(log N) per version update',
    spaceComplexity: 'O(log N) per update',
    mentalModel:
      'Think of Git commits: when you edit 1 file inside a 10,000-file repository, Git does NOT duplicate all 10,000 files—it only creates new tree objects along the path to the root and shares 99.9% of unchanged subtrees!',
    coreInvariant:
      'Structural Sharing: old nodes are 100% immutable; creating version t+1 allocates strictly O(log N) new nodes along the modified path while pointing unchanged children to version t.',
    whenToUse: [
      'K-th smallest element in ANY subarray [L..R] in O(log N) via Persistent Segment Tree (`root[R] − root[L−1]`).',
      'Immutable functional collections (Clojure, Scala, Immer/Redux undo-redo), Git object graphs, and Btrfs/ZFS Copy-on-Write snapshots.',
      'Lock-free MVCC database snapshots where readers traverse old roots without ever blocking writers!',
    ],
    whenItFails:
      'Higher GC allocation churn and pointer chasing than mutable in-place structures; Fat Nodes add version-lookup binary search overhead on every pointer read.',
    linkedTopics: ['Trees DFS/BFS', 'Modified Binary Search'],
    linkedProblemSlugs: ['binary-search-classic', 'validate-binary-search-tree'],
    templates: {
      python: `class PNode:
    __slots__ = ("val", "left", "right")
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def update_persistent(node, l, r, idx, new_val):
    if l == r: return PNode(new_val)
    mid = (l + r) // 2
    if idx <= mid:
        left = update_persistent(node.left, l, mid, idx, new_val)
        return PNode(left.val + node.right.val, left, node.right)  # share right!
    right = update_persistent(node.right, mid + 1, r, idx, new_val)
    return PNode(node.left.val + right.val, node.left, right)      # share left!`,
      js: `function persistentArrayVersions(initial, updates, queries) {
  const n = initial.length;
  const build = (l, r) => {
    if (l === r) return { sum: initial[l], l: null, r: null };
    const m = (l + r) >> 1;
    const left = build(l, m), right = build(m + 1, r);
    return { sum: left.sum + right.sum, l: left, r: right };
  };
  const upd = (node, l, r, idx, val) => {
    if (l === r) return { sum: val, l: null, r: null };
    const m = (l + r) >> 1;
    if (idx <= m) {
      const nl = upd(node.l, l, m, idx, val);
      return { sum: nl.sum + node.r.sum, l: nl, r: node.r };
    }
    const nr = upd(node.r, m + 1, r, idx, val);
    return { sum: node.l.sum + nr.sum, l: node.l, r: nr };
  };
  const query = (node, l, r, ql, qr) => {
    if (qr < l || r < ql) return 0;
    if (ql <= l && r <= qr) return node.sum;
    const m = (l + r) >> 1;
    return query(node.l, l, m, ql, qr) + query(node.r, m + 1, r, ql, qr);
  };
  const roots = [build(0, n - 1)];
  for (const [ver, idx, val] of updates) roots.push(upd(roots[ver], 0, n - 1, idx, val));
  return queries.map(([ver, ql, qr]) => query(roots[ver], 0, n - 1, ql, qr));
}`,
      java: `// Path Copying allocates strictly O(log N) new nodes per version while sharing the other N - log N nodes!`,
    },
    frames: [
      {
        step: 1,
        title: 'Version 0: Build Immutable Segment Tree on [2, 5, 1, 4]',
        explanation: 'Root0(sum=12) → Left(7:[2,5]), Right(5:[1,4]). All nodes frozen forever.',
        invariantCheck: 'Version 0 can be read concurrently by unlimited threads with zero locks.',
        variables: [{ name: 'roots[0]', value: 'sum=12' }],
        array: ['R0(12)', 'L0(7)', 'R0_r(5)'],
        matchedIndices: [0, 1, 2],
      },
      {
        step: 2,
        title: 'Update Index 1 → 9 Creates Version 1 (Copy Only Left Path!)',
        explanation: 'Allocate leaf(9), new L1(11), new Root1(16). Root1.right REUSES existing R0_r(5) untouched!',
        invariantCheck: 'Only 3 nodes allocated (O(log N)) instead of copying whole tree.',
        variables: [{ name: 'roots[1]', value: 'sum=16' }, { name: 'shared', value: 'Right subtree (5)' }],
        array: ['R1(16)*', 'L1(11)*', 'Shared R0_r(5)'],
        highlightIndices: [0, 1],
        matchedIndices: [2],
      },
      {
        step: 3,
        title: 'Time-Travel Query Both Versions Simultaneously',
        explanation: 'query(ver=0, [0..3]) returns 12; query(ver=1, [0..3]) returns 16. Zero rollback cost!',
        invariantCheck: 'Full history accessible in O(log N) per query.',
        variables: [{ name: 'v0[0..3]', value: '12' }, { name: 'v1[0..3]', value: '16' }],
        array: ['v0:12', 'v1:16'],
        matchedIndices: [0, 1],
      },
      {
        step: 4,
        title: 'Branching History (Full Persistence)',
        explanation: 'Updates can branch off ANY older version v0 to create v2—just like Git branches and CoW filesystems!',
        invariantCheck: 'Space = O(N + U log N) for U versioned updates.',
        variables: [{ name: 'space', value: 'O(N + U log N)' }],
        array: ['v0 → v1', 'v0 → v2 (branch)'],
        matchedIndices: [0, 1],
      },
    ],
    platformDrills: [
      { platform: 'LeetCode', title: '1146. Snapshot Array', difficulty: 'Medium', whyThisFits: 'Fat-Node binary search versioning per array cell.' },
      { platform: 'SPOJ', title: 'MKTHNUM (K-th Number in Subarray)', difficulty: 'Hard', whyThisFits: 'Canonical Persistent Segment Tree interview/ICPC classic.' },
    ],
  },

  // #62 Lock-Free CAS Loops, Michael-Scott Queue & RCU
  {
    id: 'lockfree-cas-rcu',
    name: 'Lock-Free CAS, Michael-Scott Queue & RCU',
    shortName: 'Lock-Free CAS & RCU',
    category: 'Probabilistic & Memory Systems',
    difficulty: 'Advanced',
    visualType: 'stream-partition',
    tagline: 'Eliminate mutex deadlocks and reader blocking using atomic Compare-And-Swap (CAS) loops, helping pointers, and Read-Copy-Update (RCU) grace periods.',
    timeComplexity: 'O(1) uncontended · Wait-free RCU reads',
    spaceComplexity: 'O(N) + deferred reclamation',
    mentalModel:
      'CAS is an optimistic "check-and-stamp": read old value, compute new value, and ask the CPU hardware to swap ONLY if memory still equals old—else retry! RCU lets readers read with ZERO locks while writers publish a new copy and wait one grace period before freeing the old copy.',
    coreInvariant:
      'Lock-Freedom: even if a thread stalls mid-operation, at least one thread guarantees system-wide progress (Michael-Scott Queue threads help advance a lagging `tail` pointer!). Watch out for the ABA problem—solve with tagged version counters or Hazard Pointers.',
    whenToUse: [
      'High-throughput concurrent queues (Java `ConcurrentLinkedQueue` IS the Michael-Scott Queue!).',
      'Read-dominated kernel tables (99.9% reads): Linux routing tables, VFS dcache, and feature-flag configs use RCU for near-zero read overhead.',
      'Interrupt-safe & deadlock-immune systems where mutexes risk priority inversion.',
    ],
    whenItFails:
      'Heavy write contention on a single CAS word causes CPU cache-line bouncing (livelock/starvation); use sharded counters (Java `LongAdder`) or MCS/ticket locks under extreme write contention.',
    linkedTopics: ['Linked Lists', 'Arrays & Prefix Sum'],
    linkedProblemSlugs: ['reverse-linked-list', 'lru-cache'],
    templates: {
      python: `# Optimistic CAS loop pattern (hardware atomic cmpxchg)
def atomic_fetch_max(cell, candidate):
    while True:
        old = cell.load()
        if candidate <= old: return old
        if cell.compare_and_swap(expected=old, new=candidate):
            return candidate`,
      js: `function simulateCasQueueAndABA(ops) {
  // Simulates version-stamped CAS (value + tag) preventing ABA bugs
  let state = { val: 0, ver: 0 };
  let retries = 0;
  const log = [];
  for (const op of ops) {
    if (op.type === 'cas') {
      if (state.val === op.expectedVal && state.ver === op.expectedVer) {
        state = { val: op.newVal, ver: state.ver + 1 };
        log.push(true);
      } else {
        retries++;
        log.push(false);
      }
    } else if (op.type === 'add') {
      state = { val: state.val + op.delta, ver: state.ver + 1 };
    }
  }
  return { finalVal: state.val, version: state.ver, retries, log };
}`,
      java: `// Java AtomicStampedReference<T> pairs pointer + integer stamp to defeat the ABA problem!`,
    },
    frames: [
      {
        step: 1,
        title: 'Optimistic CAS Loop: Read Snapshot (val=10, ver=0)',
        explanation: 'Thread A and Thread B both read state (10, v0) with zero mutex acquired.',
        invariantCheck: 'No thread holds a lock → zero deadlock risk.',
        variables: [{ name: 'Thread A', value: 'saw (10,v0)' }, { name: 'Thread B', value: 'saw (10,v0)' }],
        array: ['State:(10, v0)'],
        highlightIndices: [0],
      },
      {
        step: 2,
        title: 'Thread B Wins Atomic CAS → (15, v1); Thread A Retries',
        explanation: 'Hardware CMPXCHG atomically updates (10,v0)→(15,v1). Thread A’s CAS fails safely and loops with fresh snapshot (15,v1).',
        invariantCheck: 'System-wide progress guaranteed (Lock-Free property).',
        variables: [{ name: 'B CAS', value: 'SUCCESS → (15,v1)' }, { name: 'A CAS', value: 'FAIL → retry' }],
        array: ['State:(15, v1)', 'A:Retry'],
        matchedIndices: [0],
        highlightIndices: [1],
      },
      {
        step: 3,
        title: 'ABA Trap Defeated by Monotonic Version Stamp',
        explanation: 'Even if val changes 10→20→10 while Thread A sleeps, version stamp jumped v0→v2, rejecting stale CAS!',
        invariantCheck: 'Tagged pointers / Hazard Pointers prevent use-after-free & ABA corruption.',
        variables: [{ name: 'expected', value: '(10,v0)' }, { name: 'actual', value: '(10,v2)' }, { name: 'ABA caught', value: 'YES ✓' }],
        array: ['(10,v0) ≠ (10,v2)'],
        matchedIndices: [0],
      },
      {
        step: 4,
        title: 'RCU: Copy → Atomic Pointer Publish → Grace Period Free',
        explanation: 'Writers build new config copy, flip pointer atomically, and wait until all active readers finish before freeing old copy.',
        invariantCheck: 'Readers execute zero atomic writes & zero memory barriers on x86.',
        variables: [{ name: 'readers', value: 'Wait-Free O(1)' }, { name: 'free', value: 'After Grace Period' }],
        array: ['Old(readers draining)', 'New(published)*'],
        matchedIndices: [1],
      },
    ],
    platformDrills: [
      { platform: 'Systems', title: 'Java ConcurrentLinkedQueue (Michael-Scott)', difficulty: 'Hard', whyThisFits: '2-CAS enqueue with tail-helping invariant.' },
      { platform: 'Systems', title: 'Linux Kernel RCU Read-Mostly Routing Table', difficulty: 'Hard', whyThisFits: 'Wait-free reads with grace-period reclamation.' },
    ],
  },
]);

export const MASTER_ADV_18_PRACTICE: Record<string, AlgorithmPracticeSpec> = hydrateMasterPractice({
  'splay-tree-rotations': {
    algorithmId: 'splay-tree-rotations',
    title: 'Splay Tree Zig-Zig / Zig-Zag Access',
    functionName: 'splayAccess',
    prompt: 'Insert `keys` into a BST, then splay `target` to the root using Zig, Zig-Zig (parent first), and Zig-Zag rotations. Return `{ newRoot, leftChild, rightChild }`.',
    structuredSteps: [
      { step: '1. BST Insert', detail: 'Insert each key maintaining parent pointers.' },
      { step: '2. Implement rotate(x)', detail: 'Lift x above its parent p and relink grandparent g.' },
      { step: '3. Splay Loop', detail: 'If !g: Zig; if same side: Zig-Zig (rotate p then x); else Zig-Zag (rotate x twice).' },
    ],
    starterCode: `function splayAccess(keys, target) {\n  // TODO: return { newRoot, leftChild, rightChild }\n  return { newRoot: null, leftChild: null, rightChild: null };\n}`,
    solutionCode: `function splayAccess(keys, target) {\n  const nodes = {};\n  let root = null;\n  const setChild = (p, side, c) => { if (p) p[side] = c; if (c) c.p = p; };\n  const rotate = (x) => {\n    const p = x.p, g = p.p;\n    if (p.l === x) { setChild(p, 'l', x.r); setChild(x, 'r', p); }\n    else { setChild(p, 'r', x.l); setChild(x, 'l', p); }\n    x.p = g;\n    if (!g) root = x;\n    else if (g.l === p) g.l = x;\n    else g.r = x;\n  };\n  const splay = (x) => {\n    while (x.p) {\n      const p = x.p, g = p.p;\n      if (!g) rotate(x);\n      else if ((g.l === p) === (p.l === x)) { rotate(p); rotate(x); }\n      else { rotate(x); rotate(x); }\n    }\n  };\n  for (const k of keys) {\n    const n = { k, l: null, r: null, p: null };\n    nodes[k] = n;\n    if (!root) { root = n; continue; }\n    let cur = root;\n    while (true) {\n      if (k < cur.k) { if (!cur.l) { setChild(cur, 'l', n); break; } cur = cur.l; }\n      else { if (!cur.r) { setChild(cur, 'r', n); break; } cur = cur.r; }\n    }\n  }\n  if (nodes[target]) splay(nodes[target]);\n  return { newRoot: root ? root.k : null, leftChild: root?.l?.k ?? null, rightChild: root?.r?.k ?? null };\n}`,
    testCases: [
      { label: 'Zig-Zig skewed left chain', args: [[30, 20, 10], 10], expected: { newRoot: 10, leftChild: null, rightChild: 20 } },
      { label: 'Zig-Zag middle key to root', args: [[30, 10, 20], 20], expected: { newRoot: 20, leftChild: 10, rightChild: 30 } },
    ],
  },
  'kd-tree-nearest-neighbor': {
    algorithmId: 'kd-tree-nearest-neighbor',
    title: '2D K-D Tree Nearest Neighbor Search',
    functionName: 'kdTreeNearest',
    prompt: 'Build a 2D K-D Tree from `points` (`[x, y][]`) and return the exact nearest neighbor point to `target` using branch-and-bound hyperplane pruning.',
    structuredSteps: [
      { step: '1. Build Alternating Axis Tree', detail: 'Split by depth % 2 median recursively.' },
      { step: '2. Near Branch First', detail: 'Compare target[axis] vs node.pt[axis] and recurse into near child.' },
      { step: '3. Hypersphere Pruning', detail: 'Only recurse into far child if diff * diff < bestDist2.' },
    ],
    starterCode: `function kdTreeNearest(points, target) {\n  // TODO: build 2D KD-tree and return nearest [x, y]\n  return null;\n}`,
    solutionCode: `function kdTreeNearest(points, target) {\n  const build = (pts, depth) => {\n    if (!pts.length) return null;\n    const axis = depth % 2;\n    const sorted = [...pts].sort((a, b) => a[axis] - b[axis]);\n    const mid = Math.floor(sorted.length / 2);\n    return { pt: sorted[mid], left: build(sorted.slice(0, mid), depth + 1), right: build(sorted.slice(mid + 1), depth + 1) };\n  };\n  const root = build(points, 0);\n  let bestPt = null, bestDist2 = Infinity;\n  const search = (node, depth) => {\n    if (!node) return;\n    const dx = node.pt[0] - target[0], dy = node.pt[1] - target[1];\n    const d2 = dx * dx + dy * dy;\n    if (d2 < bestDist2) { bestDist2 = d2; bestPt = node.pt; }\n    const axis = depth % 2;\n    const diff = target[axis] - node.pt[axis];\n    const [near, far] = diff < 0 ? [node.left, node.right] : [node.right, node.left];\n    search(near, depth + 1);\n    if (diff * diff < bestDist2) search(far, depth + 1);\n  };\n  search(root, 0);\n  return bestPt;\n}`,
    testCases: [
      { label: 'Classic 6-point 2D set', args: [[[2, 3], [5, 4], [9, 6], [4, 7], [8, 1], [7, 2]], [9, 2]], expected: [8, 1] },
      { label: 'Cross-boundary closest point', args: [[[0, 0], [10, 10], [4, 5], [6, 5]], [5.2, 5]], expected: [6, 5] },
    ],
  },
  'quadtree-octree-spatial': {
    algorithmId: 'quadtree-octree-spatial',
    title: 'Quadtree 2D Bounding-Box Range Query',
    functionName: 'quadtreeRangeQuery',
    prompt: 'Insert 2D `points` inside `[0..100, 0..100]` into a Quadtree (leaf capacity 2) and return all points inside `rect = [x1, y1, x2, y2]` sorted by x then y.',
    structuredSteps: [
      { step: '1. Subdivide Full Leaves', detail: 'Split a leaf into 4 quadrants (NW, NE, SW, SE) when exceeding capacity.' },
      { step: '2. AABB Overlap Pruning', detail: 'Skip any quadrant whose bounding box cannot intersect rect.' },
      { step: '3. Collect & Sort Hits', detail: 'Gather matching leaf points and return sorted.' },
    ],
    starterCode: `function quadtreeRangeQuery(points, rect) {\n  // TODO: build Quadtree and query rectangle [x1,y1,x2,y2]\n  return [];\n}`,
    solutionCode: `function quadtreeRangeQuery(points, rect) {\n  const [rx1, ry1, rx2, ry2] = rect;\n  const makeNode = (x1, y1, x2, y2) => ({ x1, y1, x2, y2, pts: [], kids: null });\n  const contains = (n, p) => p[0] >= n.x1 && p[0] <= n.x2 && p[1] >= n.y1 && p[1] <= n.y2;\n  const insert = (n, p, cap = 2, depth = 0) => {\n    if (!contains(n, p)) return false;\n    if (!n.kids && (n.pts.length < cap || depth >= 8)) { n.pts.push(p); return true; }\n    if (!n.kids) {\n      const mx = (n.x1 + n.x2) / 2, my = (n.y1 + n.y2) / 2;\n      n.kids = [makeNode(n.x1, n.y1, mx, my), makeNode(mx, n.y1, n.x2, my), makeNode(n.x1, my, mx, n.y2), makeNode(mx, my, n.x2, n.y2)];\n      for (const old of n.pts) for (const k of n.kids) if (insert(k, old, cap, depth + 1)) break;\n      n.pts = [];\n    }\n    for (const k of n.kids) if (insert(k, p, cap, depth + 1)) return true;\n    return false;\n  };\n  const root = makeNode(0, 0, 100, 100);\n  for (const p of points) insert(root, p);\n  const out = [];\n  const query = (n) => {\n    if (rx2 < n.x1 || rx1 > n.x2 || ry2 < n.y1 || ry1 > n.y2) return;\n    for (const p of n.pts) if (p[0] >= rx1 && p[0] <= rx2 && p[1] >= ry1 && p[1] <= ry2) out.push(p);\n    if (n.kids) for (const k of n.kids) query(k);\n  };\n  query(root);\n  return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n}`,
    testCases: [
      { label: 'NW hotspot query', args: [[[10, 15], [20, 25], [12, 18], [80, 85]], [0, 0, 30, 30]], expected: [[10, 15], [12, 18], [20, 25]] },
      { label: 'Empty quadrant query', args: [[[10, 15], [80, 85]], [40, 40, 60, 60]], expected: [] },
    ],
  },
  'bwt-fm-index': {
    algorithmId: 'bwt-fm-index',
    title: 'Burrows-Wheeler Encode & LF-Mapping Decode',
    functionName: 'bwtEncodeDecode',
    prompt: 'Compute the Burrows-Wheeler Transform (appending sentinel `"$"`) of `text` and invert it losslessly via LF-Mapping. Return `{ bwt, decoded }`.',
    structuredSteps: [
      { step: '1. Cyclic Rotations', detail: 'Generate all rotations of text + "$", sort them, and extract last characters as bwt.' },
      { step: '2. Build LF Tables', detail: 'Record per-character occurrence rank in L and starting offset of each char in sorted F.' },
      { step: '3. Walk LF Backwards', detail: 'Step from row of "$" using firstStart[ch] + occBefore[row] and reverse.' },
    ],
    starterCode: `function bwtEncodeDecode(text) {\n  // TODO: return { bwt, decoded }\n  return { bwt: '', decoded: '' };\n}`,
    solutionCode: `function bwtEncodeDecode(text) {\n  const s = text + '$';\n  const n = s.length;\n  const rotations = Array.from({ length: n }, (_, i) => s.slice(i) + s.slice(0, i)).sort();\n  const bwt = rotations.map((r) => r[n - 1]).join('');\n  const first = bwt.split('').sort();\n  const occBefore = new Array(n).fill(0);\n  const totals = {};\n  for (let i = 0; i < n; i++) {\n    const ch = bwt[i];\n    occBefore[i] = totals[ch] || 0;\n    totals[ch] = occBefore[i] + 1;\n  }\n  const firstStart = {};\n  for (let i = 0; i < n; i++) if (!(first[i] in firstStart)) firstStart[first[i]] = i;\n  let row = bwt.indexOf('$');\n  const chars = [];\n  for (let i = 0; i < n - 1; i++) {\n    row = firstStart[bwt[row]] + occBefore[row];\n    chars.push(bwt[row]);\n  }\n  return { bwt, decoded: chars.reverse().join('') };\n}`,
    testCases: [
      { label: 'Classic "banana"', args: ['banana'], expected: { bwt: 'annb$aa', decoded: 'banana' } },
      { label: 'Repeated "abracadabra"', args: ['abracadabra'], expected: { bwt: 'ard$rcaaaabb', decoded: 'abracadabra' } },
    ],
  },
  'lzw-compression': {
    algorithmId: 'lzw-compression',
    title: 'LZW Lossless Encoder & KwKwK-Safe Decoder',
    functionName: 'lzwRoundTrip',
    prompt: 'Compress ASCII string `text` with LZW (codes 0..255 pre-populated) and decompress back, handling the KwKwK edge case. Return `{ codes, decoded }`.',
    structuredSteps: [
      { step: '1. Greedy Dictionary Encode', detail: 'Extend w+c while in dict; otherwise emit code(w), add w+c, reset w=c.' },
      { step: '2. Mirror Decoder Table', detail: 'Track prev phrase and emit entry = dec.has(k) ? dec.get(k) : prev + prev[0].' },
      { step: '3. Verify Round-Trip', detail: 'Return emitted integer codes and exact reconstructed string.' },
    ],
    starterCode: `function lzwRoundTrip(text) {\n  // TODO: return { codes, decoded }\n  return { codes: [], decoded: '' };\n}`,
    solutionCode: `function lzwRoundTrip(text) {\n  if (!text) return { codes: [], decoded: '' };\n  const enc = new Map();\n  for (let i = 0; i < 256; i++) enc.set(String.fromCharCode(i), i);\n  let nextCode = 256, w = '';\n  const codes = [];\n  for (const c of text) {\n    const wc = w + c;\n    if (enc.has(wc)) w = wc;\n    else { codes.push(enc.get(w)); enc.set(wc, nextCode++); w = c; }\n  }\n  if (w) codes.push(enc.get(w));\n  const dec = new Map();\n  for (let i = 0; i < 256; i++) dec.set(i, String.fromCharCode(i));\n  let dNext = 256, prev = dec.get(codes[0]), out = prev;\n  for (let i = 1; i < codes.length; i++) {\n    const k = codes[i];\n    const entry = dec.has(k) ? dec.get(k) : prev + prev[0];\n    out += entry;\n    dec.set(dNext++, prev + entry[0]);\n    prev = entry;\n  }\n  return { codes, decoded: out };\n}`,
    testCases: [
      { label: 'Triggers KwKwK edge case', args: ['ABABABA'], expected: { codes: [65, 66, 256, 258], decoded: 'ABABABA' } },
      { label: 'Repeated run "AAAA"', args: ['AAAA'], expected: { codes: [65, 256, 65], decoded: 'AAAA' } },
    ],
  },
  'hopcroft-karp-hungarian': {
    algorithmId: 'hopcroft-karp-hungarian',
    title: 'Hopcroft-Karp Maximum Bipartite Matching',
    functionName: 'maxBipartiteMatching',
    prompt: 'Given `nLeft` left vertices, `nRight` right vertices, and bipartite `edges = [u, v][]`, return the maximum matching cardinality via Hopcroft-Karp.',
    structuredSteps: [
      { step: '1. Multi-Source BFS', detail: 'Layer all free left vertices at dist 0 to find shortest augmenting paths.' },
      { step: '2. Disjoint Augmenting DFS', detail: 'Follow strictly increasing dist layers to flip unmatched↔matched pairs.' },
      { step: '3. Repeat Phases', detail: 'Stop when BFS can no longer reach any free right vertex.' },
    ],
    starterCode: `function maxBipartiteMatching(nLeft, nRight, edges) {\n  // TODO: return maximum matching cardinality\n  return 0;\n}`,
    solutionCode: `function maxBipartiteMatching(nLeft, nRight, edges) {\n  const adj = Array.from({ length: nLeft }, () => []);\n  for (const [u, v] of edges) adj[u].push(v);\n  const pairU = new Array(nLeft).fill(-1), pairV = new Array(nRight).fill(-1), dist = new Array(nLeft).fill(-1);\n  const bfs = () => {\n    const q = []; let found = false;\n    for (let u = 0; u < nLeft; u++) { if (pairU[u] === -1) { dist[u] = 0; q.push(u); } else dist[u] = -1; }\n    for (let h = 0; h < q.length; h++) {\n      const u = q[h];\n      for (const v of adj[u]) {\n        const pu = pairV[v];\n        if (pu === -1) found = true;\n        else if (dist[pu] === -1) { dist[pu] = dist[u] + 1; q.push(pu); }\n      }\n    }\n    return found;\n  };\n  const dfs = (u) => {\n    for (const v of adj[u]) {\n      const pu = pairV[v];\n      if (pu === -1 || (dist[pu] === dist[u] + 1 && dfs(pu))) { pairU[u] = v; pairV[v] = u; return true; }\n    }\n    dist[u] = -1;\n    return false;\n  };\n  let matched = 0;\n  while (bfs()) for (let u = 0; u < nLeft; u++) if (pairU[u] === -1 && dfs(u)) matched++;\n  return matched;\n}`,
    testCases: [
      { label: 'Augmenting path unlocks 3/3 match', args: [3, 3, [[0, 0], [0, 2], [1, 1], [2, 0]]], expected: 3 },
      { label: 'Bottlenecked to 2 matches', args: [3, 3, [[0, 0], [1, 0], [2, 0], [2, 1]]], expected: 2 },
    ],
  },
  'eulerian-hierholzer': {
    algorithmId: 'eulerian-hierholzer',
    title: 'Hierholzer’s Lexicographical Itinerary',
    functionName: 'eulerianItinerary',
    prompt: 'Given directed flight `tickets = [from, to][]` starting at `start`, return the lexicographically smallest Eulerian path using every ticket exactly once.',
    structuredSteps: [
      { step: '1. Reverse-Sort Adjacency', detail: 'Sort outgoing neighbors descending so pop() yields smallest airport in O(1).' },
      { step: '2. Iterative DFS Stack', detail: 'Push next neighbor while available; otherwise pop dead end into route.' },
      { step: '3. Reverse Post-Order', detail: 'Return route.reverse() to put dead end at the itinerary tail.' },
    ],
    starterCode: `function eulerianItinerary(tickets, start = 'JFK') {\n  // TODO: implement Hierholzer's algorithm\n  return [];\n}`,
    solutionCode: `function eulerianItinerary(tickets, start = 'JFK') {\n  const adj = new Map();\n  for (const [u, v] of [...tickets].sort((a, b) => (a[0] === b[0] ? b[1].localeCompare(a[1]) : a[0].localeCompare(b[0])))) {\n    if (!adj.has(u)) adj.set(u, []);\n    adj.get(u).push(v);\n  }\n  const route = [], stack = [start];\n  while (stack.length) {\n    const top = stack[stack.length - 1];\n    const nexts = adj.get(top);\n    if (nexts && nexts.length) stack.push(nexts.pop());\n    else route.push(stack.pop());\n  }\n  return route.reverse();\n}`,
    testCases: [
      { label: 'Dead-end trap JFK→KUL', args: [[['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']], 'JFK'], expected: ['JFK', 'NRT', 'JFK', 'KUL'] },
      { label: 'Multi-cycle itinerary', args: [[['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']], 'JFK'], expected: ['JFK', 'ATL', 'JFK', 'SFO', 'ATL', 'SFO'] },
    ],
  },
  'tarjan-bridges-articulation': {
    algorithmId: 'tarjan-bridges-articulation',
    title: 'Tarjan’s Critical Bridges Finder',
    functionName: 'findBridges',
    prompt: 'Given an undirected graph of `n` nodes (`0..n-1`) and `edges`, return all bridge edges `[min(u,v), max(u,v)]` sorted lexicographically.',
    structuredSteps: [
      { step: '1. Discovery & Low-Link', detail: 'Assign disc[u] = low[u] = timer++ upon first visiting u.' },
      { step: '2. Back-Edge Relaxation', detail: 'Ignore parent; update low[u] = min(low[u], disc[v]) for visited neighbors.' },
      { step: '3. Bridge Check', detail: 'After DFS(v), if low[v] > disc[u] strictly, record [u, v] as a critical bridge.' },
    ],
    starterCode: `function findBridges(n, edges) {\n  // TODO: return sorted list of critical bridge edges\n  return [];\n}`,
    solutionCode: `function findBridges(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }\n  const disc = new Array(n).fill(-1), low = new Array(n).fill(0);\n  let timer = 0;\n  const bridges = [];\n  const dfs = (u, parent) => {\n    disc[u] = low[u] = timer++;\n    for (const v of adj[u]) {\n      if (v === parent) continue;\n      if (disc[v] === -1) {\n        dfs(v, u);\n        low[u] = Math.min(low[u], low[v]);\n        if (low[v] > disc[u]) bridges.push([Math.min(u, v), Math.max(u, v)]);\n      } else low[u] = Math.min(low[u], disc[v]);\n    }\n  };\n  for (let i = 0; i < n; i++) if (disc[i] === -1) dfs(i, -1);\n  return bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n}`,
    testCases: [
      { label: 'LC 1192 triangle + tail', args: [4, [[0, 1], [1, 2], [2, 0], [1, 3]]], expected: [[1, 3]] },
      { label: 'Tree: every edge is a bridge', args: [4, [[0, 1], [1, 2], [2, 3]]], expected: [[0, 1], [1, 2], [2, 3]] },
    ],
  },
  'johnsons-all-pairs': {
    algorithmId: 'johnsons-all-pairs',
    title: 'Johnson’s Reweighted All-Pairs Shortest Path',
    functionName: 'johnsonsAPSP',
    prompt: 'Compute the N×N all-pairs shortest-path matrix (using `null` for unreachable, or return `null` if a negative cycle exists) using Bellman-Ford potentials + Dijkstra.',
    structuredSteps: [
      { step: '1. Bellman-Ford Potentials', detail: 'Initialize h[0..n-1] = 0 and relax edges n times; detect negative cycle on pass n.' },
      { step: '2. Reweight Edges ≥ 0', detail: 'Set w\'(u,v) = w + h[u] - h[v] >= 0.' },
      { step: '3. V× Dijkstra + Restore', detail: 'Run Dijkstra from each s and restore true dist = d\' - h[s] + h[t].' },
    ],
    starterCode: `function johnsonsAPSP(n, edges) {\n  // TODO: return N x N shortest path matrix or null on negative cycle\n  return null;\n}`,
    solutionCode: `function johnsonsAPSP(n, edges) {\n  const h = new Array(n).fill(0);\n  for (let i = 0; i < n; i++) {\n    let changed = false;\n    for (const [u, v, w] of edges) {\n      if (h[u] + w < h[v]) {\n        if (i === n - 1) return null;\n        h[v] = h[u] + w;\n        changed = true;\n      }\n    }\n    if (!changed) break;\n  }\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of edges) adj[u].push([v, w + h[u] - h[v]]);\n  const res = [];\n  for (let s = 0; s < n; s++) {\n    const dist = new Array(n).fill(Infinity), vis = new Array(n).fill(false);\n    dist[s] = 0;\n    for (let k = 0; k < n; k++) {\n      let u = -1;\n      for (let i = 0; i < n; i++) if (!vis[i] && (u === -1 || dist[i] < dist[u])) u = i;\n      if (u === -1 || dist[u] === Infinity) break;\n      vis[u] = true;\n      for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;\n    }\n    res.push(dist.map((d, t) => (d === Infinity ? null : d - h[s] + h[t])));\n  }\n  return res;\n}`,
    testCases: [
      { label: 'Negative edge without negative cycle', args: [3, [[0, 1, 2], [1, 2, -4], [2, 0, 5]]], expected: [[0, 2, -2], [1, 0, -4], [5, 7, 0]] },
      { label: 'Negative cycle detection', args: [2, [[0, 1, -2], [1, 0, -1]]], expected: null },
    ],
  },
  'centroid-decomposition': {
    algorithmId: 'centroid-decomposition',
    title: 'Build Centroid Tree Parent Array',
    functionName: 'buildCentroidTree',
    prompt: 'Decompose an `n`-node undirected tree into its Centroid Tree and return the `parent` array (`-1` for the root centroid).',
    structuredSteps: [
      { step: '1. Subtree Sizes DFS', detail: 'Compute sizes of unremoved component reachable from entry node.' },
      { step: '2. Walk to Heavy Child', detail: 'Move to any child v with sz[v] > floor(total / 2) until none exists.' },
      { step: '3. Remove & Recurse', detail: 'Mark centroid removed, record parent[c] = pCentroid, and decompose all adjacent components.' },
    ],
    starterCode: `function buildCentroidTree(n, edges) {\n  // TODO: return centroid tree parent array\n  return [];\n}`,
    solutionCode: `function buildCentroidTree(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }\n  const removed = new Array(n).fill(false), sz = new Array(n).fill(0), parent = new Array(n).fill(-1);\n  const getSize = (u, p) => { sz[u] = 1; for (const v of adj[u]) if (v !== p && !removed[v]) sz[u] += getSize(v, u); return sz[u]; };\n  const getCentroid = (u, p, total) => {\n    for (const v of adj[u]) if (v !== p && !removed[v] && sz[v] > Math.floor(total / 2)) return getCentroid(v, u, total);\n    return u;\n  };\n  const decompose = (entry, pCentroid) => {\n    const total = getSize(entry, -1);\n    const c = getCentroid(entry, -1, total);\n    removed[c] = true; parent[c] = pCentroid;\n    for (const v of adj[c]) if (!removed[v]) decompose(v, c);\n  };\n  decompose(0, -1);\n  return parent;\n}`,
    testCases: [
      { label: '7-node path splits at 3 → 1, 5', args: [7, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]], expected: [1, 3, 1, -1, 5, 3, 5] },
      { label: 'Star graph centered at 0', args: [4, [[0, 1], [0, 2], [0, 3]]], expected: [-1, 0, 0, 0] },
    ],
  },
  'bloom-filter': {
    algorithmId: 'bloom-filter',
    title: '3-Hash Bitset Bloom Filter',
    functionName: 'runBloomFilter',
    prompt: 'Implement an `m`-bit Bloom Filter with 3 deterministic hashes, insert `inserts`, and return boolean membership results for `queries` (guaranteeing 0 false negatives).',
    structuredSteps: [
      { step: '1. Allocate m-Bit Array', detail: 'Initialize an array of length m filled with 0.' },
      { step: '2. Compute 3 Hash Indices', detail: 'Use h1, h2, and double-hashed (h1 + h2) % m.' },
      { step: '3. Insert & Query', detail: 'Set all 3 bits on insert; return true iff all 3 bits are 1 on query.' },
    ],
    starterCode: `function runBloomFilter(m, inserts, queries) {\n  // TODO: return boolean[] for each query\n  return [];\n}`,
    solutionCode: `function runBloomFilter(m, inserts, queries) {\n  const bits = new Array(m).fill(0);\n  const hashes = (s) => {\n    let h1 = 0, h2 = 7;\n    for (let i = 0; i < s.length; i++) {\n      const c = s.charCodeAt(i);\n      h1 = (h1 * 31 + c) % m;\n      h2 = (h2 * 17 + c * (i + 1)) % m;\n    }\n    return [h1, h2, (h1 + h2) % m];\n  };\n  for (const key of inserts) for (const idx of hashes(key)) bits[idx] = 1;\n  return queries.map((q) => hashes(q).every((idx) => bits[idx] === 1));\n}`,
    testCases: [
      { label: 'Zero false negatives & rejects missing', args: [64, ['redis', 'kafka', 'rocksdb'], ['redis', 'kafka', 'postgres']], expected: [true, true, false] },
    ],
  },
  'skip-list': {
    algorithmId: 'skip-list',
    title: 'Multi-Level Skip List Search & Hop Counter',
    functionName: 'skipListSearchSteps',
    prompt: 'Build a deterministic multi-level Skip List over `sortedVals` and search for `target`, returning `{ found, hops }`.',
    structuredSteps: [
      { step: '1. Assign Tower Levels', detail: 'Give index i a tower height based on trailing zeros of i+1.' },
      { step: '2. Link Express Lanes', detail: 'Wire forward pointers at each level from head across matching towers.' },
      { step: '3. Top-Down Express Search', detail: 'Step right on highest lane while next.val < target, then drop 1 level.' },
    ],
    starterCode: `function skipListSearchSteps(sortedVals, target) {\n  // TODO: return { found, hops }\n  return { found: false, hops: 0 };\n}`,
    solutionCode: `function skipListSearchSteps(sortedVals, target) {\n  const n = sortedVals.length;\n  const maxLvl = Math.max(1, Math.ceil(Math.log2(n + 1)));\n  const levelOf = (i) => { let l = 1, x = i + 1; while (x % 2 === 0 && l < maxLvl) { l++; x /= 2; } return l; };\n  const nodes = sortedVals.map((v, i) => ({ val: v, fwd: new Array(maxLvl).fill(null), lvl: levelOf(i) }));\n  const head = { val: -Infinity, fwd: new Array(maxLvl).fill(null) };\n  const last = new Array(maxLvl).fill(head);\n  for (const node of nodes) for (let l = 0; l < node.lvl; l++) { last[l].fwd[l] = node; last[l] = node; }\n  let curr = head, steps = 0;\n  for (let l = maxLvl - 1; l >= 0; l--) while (curr.fwd[l] && curr.fwd[l].val < target) { curr = curr.fwd[l]; steps++; }\n  return { found: curr.fwd[0] !== null && curr.fwd[0].val === target, hops: steps };\n}`,
    testCases: [
      { label: 'Express hit on 19', args: [[3, 6, 9, 12, 17, 19, 25], 19], expected: { found: true, hops: 2 } },
      { label: 'Missing value 18', args: [[3, 6, 9, 12, 17, 19, 25], 18], expected: { found: false, hops: 2 } },
    ],
  },
  'count-min-sketch': {
    algorithmId: 'count-min-sketch',
    title: 'Count-Min Sketch Streaming Estimator',
    functionName: 'countMinSketchEstimate',
    prompt: 'Process string `stream` into a 3-row Count-Min Sketch of `width` columns and return the minimum-row frequency estimate for each key in `queries`.',
    structuredSteps: [
      { step: '1. Allocate 3 × width Grid', detail: 'Use 3 independent hash seeds [31, 131, 257].' },
      { step: '2. Increment All 3 Rows', detail: 'For each event in stream, increment grid[r][hash(item, seed)].' },
      { step: '3. Query Minimum Across Rows', detail: 'Return Math.min across the 3 row counts for each queried key.' },
    ],
    starterCode: `function countMinSketchEstimate(stream, queries, width = 16) {\n  // TODO: return frequency estimates for queries\n  return [];\n}`,
    solutionCode: `function countMinSketchEstimate(stream, queries, width = 16) {\n  const seeds = [31, 131, 257];\n  const grid = seeds.map(() => new Array(width).fill(0));\n  const hashCol = (s, seed) => { let h = seed; for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) % width; return h; };\n  for (const item of stream) seeds.forEach((seed, r) => { grid[r][hashCol(item, seed)]++; });\n  return queries.map((q) => Math.min(...seeds.map((seed, r) => grid[r][hashCol(q, seed)])));\n}`,
    testCases: [
      { label: 'Heavy hitter accuracy', args: [['a', 'a', 'a', 'b', 'b', 'c'], ['a', 'b', 'z'], 32], expected: [3, 2, 0] },
    ],
  },
  'hyperloglog': {
    algorithmId: 'hyperloglog',
    title: 'HyperLogLog Distinct Cardinality Estimator',
    functionName: 'hyperLogLogEstimate',
    prompt: 'Implement HyperLogLog with `p` bucket bits (`m = 2^p` registers), FNV-1a 32-bit hashing, harmonic mean, and LinearCounting small-range correction.',
    structuredSteps: [
      { step: '1. Hash & Split Bits', detail: 'Extract bucket = h >>> (32 - p) and leading zeros rho = Math.clz32(h << p) + 1.' },
      { step: '2. Max Register Update', detail: 'Set regs[bucket] = Math.max(regs[bucket], rho).' },
      { step: '3. Harmonic Mean + Correction', detail: 'Compute alpha * m * m / sum(2^-r) with small-range m * ln(m / zeros).' },
    ],
    starterCode: `function hyperLogLogEstimate(items, p = 4) {\n  // TODO: return rounded distinct count estimate\n  return 0;\n}`,
    solutionCode: `function hyperLogLogEstimate(items, p = 4) {\n  const m = 1 << p;\n  const regs = new Array(m).fill(0);\n  const hash32 = (str) => { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16; return h >>> 0; };\n  for (const raw of items) {\n    const h = hash32(String(raw));\n    const bucket = h >>> (32 - p);\n    const w = (h << p) >>> 0;\n    const rho = w === 0 ? (32 - p + 1) : Math.clz32(w) + 1;\n    if (rho > regs[bucket]) regs[bucket] = rho;\n  }\n  const alpha = m === 16 ? 0.673 : m === 32 ? 0.697 : m === 64 ? 0.709 : 0.7213 / (1 + 1.079 / m);\n  let sum = 0, zeros = 0;\n  for (const r of regs) { sum += Math.pow(2, -r); if (r === 0) zeros++; }\n  let est = (alpha * m * m) / sum;\n  if (est <= 2.5 * m && zeros > 0) est = m * Math.log(m / zeros);\n  return Math.round(est);\n}`,
    testCases: [
      { label: 'Duplicates are idempotent', args: [['u1', 'u1', 'u1', 'u2', 'u2', 'u3'], 4], expected: 3 },
      { label: 'Empty stream returns 0', args: [[], 4], expected: 0 },
    ],
  },
  'cache-lru-lfu-arc': {
    algorithmId: 'cache-lru-lfu-arc',
    title: 'O(1) LRU Cache Engine',
    functionName: 'runLruCacheOps',
    prompt: 'Execute a sequence of `["put", k, v]` and `["get", k]` operations on an LRU cache of `capacity` and return the array of `get` outputs (`-1` on miss).',
    structuredSteps: [
      { step: '1. Track Recency Order', detail: 'Use Map insertion order (or HashMap + DLL) so oldest key sits first.' },
      { step: '2. Promote on Get/Put', detail: 'Delete and re-insert key to refresh recency in O(1).' },
      { step: '3. Evict LRU Tail', detail: 'When size exceeds capacity, evict map.keys().next().value.' },
    ],
    starterCode: `function runLruCacheOps(capacity, ops) {\n  // TODO: return array of get() outputs\n  return [];\n}`,
    solutionCode: `function runLruCacheOps(capacity, ops) {\n  const map = new Map();\n  const out = [];\n  for (const [op, k, v] of ops) {\n    if (op === 'get') {\n      if (!map.has(k)) { out.push(-1); continue; }\n      const val = map.get(k); map.delete(k); map.set(k, val); out.push(val);\n    } else if (op === 'put') {\n      if (map.has(k)) map.delete(k);\n      else if (map.size >= capacity) map.delete(map.keys().next().value);\n      map.set(k, v);\n    }\n  }\n  return out;\n}`,
    testCases: [
      { label: 'LC 146 classic trace', args: [2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]], expected: [1, -1, -1, 3, 4] },
    ],
  },
  'buddy-memory-allocator': {
    algorithmId: 'buddy-memory-allocator',
    title: 'Buddy Memory Allocator (Split & XOR Coalesce)',
    functionName: 'buddyAllocateAndFree',
    prompt: 'Simulate `["alloc", id, bytes]` and `["free", id]` on a `totalSize` power-of-2 pool using XOR buddy coalescing. Return the array of allocated start addresses (`-1` if out of memory).',
    structuredSteps: [
      { step: '1. Round Up Power of 2', detail: 'Find smallest 2^k >= req and split larger free blocks in half as needed.' },
      { step: '2. Track Active Allocations', detail: 'Store { addr, size } by allocation id.' },
      { step: '3. Cascading XOR Coalesce', detail: 'On free, while buddy = addr ^ size is in free[size], remove buddy and double size.' },
    ],
    starterCode: `function buddyAllocateAndFree(totalSize, ops) {\n  // TODO: return allocated addresses for each alloc op\n  return [];\n}`,
    solutionCode: `function buddyAllocateAndFree(totalSize, ops) {\n  const free = new Map();\n  for (let s = 1; s <= totalSize; s *= 2) free.set(s, []);\n  free.get(totalSize).push(0);\n  const allocs = new Map();\n  const out = [];\n  for (const [op, id, req] of ops) {\n    if (op === 'alloc') {\n      let need = 1; while (need < req) need *= 2;\n      let cur = need; while (cur <= totalSize && free.get(cur).length === 0) cur *= 2;\n      if (cur > totalSize) { out.push(-1); continue; }\n      let addr = free.get(cur).shift();\n      while (cur > need) { cur /= 2; free.get(cur).push(addr + cur); free.get(cur).sort((a, b) => a - b); }\n      allocs.set(id, { addr, size: need }); out.push(addr);\n    } else if (op === 'free' && allocs.has(id)) {\n      let { addr, size } = allocs.get(id); allocs.delete(id);\n      while (size < totalSize) {\n        const buddy = addr ^ size, list = free.get(size), idx = list.indexOf(buddy);\n        if (idx === -1) break;\n        list.splice(idx, 1); addr = Math.min(addr, buddy); size *= 2;\n      }\n      free.get(size).push(addr); free.get(size).sort((a, b) => a - b);\n    }\n  }\n  return out;\n}`,
    testCases: [
      { label: 'Split, free both buddies, reallocate full 64KB', args: [64, [['alloc', 'A', 10], ['alloc', 'B', 12], ['free', 'A'], ['free', 'B'], ['alloc', 'C', 60]]], expected: [0, 16, 0] },
    ],
  },
  'persistent-data-structures': {
    algorithmId: 'persistent-data-structures',
    title: 'Persistent Segment Tree (Path-Copying Versions)',
    functionName: 'persistentArrayVersions',
    prompt: 'Build version 0 from `initial`, apply `updates = [baseVer, idx, newVal][]` (creating versions 1, 2, ...), and answer range sum `queries = [ver, L, R][]`.',
    structuredSteps: [
      { step: '1. Immutable Build', detail: 'Create immutable Segment Tree nodes for version 0.' },
      { step: '2. Path-Copying Update', detail: 'Clone only the O(log N) nodes on the path to idx while sharing the sibling child.' },
      { step: '3. Query Any Version', detail: 'Run standard range-sum query starting from roots[ver].' },
    ],
    starterCode: `function persistentArrayVersions(initial, updates, queries) {\n  // TODO: return range-sum answers across historical versions\n  return [];\n}`,
    solutionCode: `function persistentArrayVersions(initial, updates, queries) {\n  const n = initial.length;\n  const build = (l, r) => { if (l === r) return { sum: initial[l], l: null, r: null }; const m = (l + r) >> 1; const left = build(l, m), right = build(m + 1, r); return { sum: left.sum + right.sum, l: left, r: right }; };\n  const upd = (node, l, r, idx, val) => { if (l === r) return { sum: val, l: null, r: null }; const m = (l + r) >> 1; if (idx <= m) { const nl = upd(node.l, l, m, idx, val); return { sum: nl.sum + node.r.sum, l: nl, r: node.r }; } const nr = upd(node.r, m + 1, r, idx, val); return { sum: node.l.sum + nr.sum, l: node.l, r: nr }; };\n  const query = (node, l, r, ql, qr) => { if (qr < l || r < ql) return 0; if (ql <= l && r <= qr) return node.sum; const m = (l + r) >> 1; return query(node.l, l, m, ql, qr) + query(node.r, m + 1, r, ql, qr); };\n  const roots = [build(0, n - 1)];\n  for (const [ver, idx, val] of updates) roots.push(upd(roots[ver], 0, n - 1, idx, val));\n  return queries.map(([ver, ql, qr]) => query(roots[ver], 0, n - 1, ql, qr));\n}`,
    testCases: [
      { label: 'Time-travel & branching versions', args: [[2, 5, 1, 4], [[0, 1, 9], [0, 3, 10]], [[0, 0, 3], [1, 0, 3], [2, 0, 3]]], expected: [12, 16, 18] },
    ],
  },
  'lockfree-cas-rcu': {
    algorithmId: 'lockfree-cas-rcu',
    title: 'Version-Stamped Atomic CAS (ABA-Proof)',
    functionName: 'simulateCasQueueAndABA',
    prompt: 'Simulate version-stamped Compare-And-Swap operations (`{type:"cas", expectedVal, expectedVer, newVal}` and `{type:"add", delta}`), returning `{ finalVal, version, retries, log }`.',
    structuredSteps: [
      { step: '1. Initialize Stamped Word', detail: 'Start state = { val: 0, ver: 0 }.' },
      { step: '2. Check Value AND Version', detail: 'Succeed only if both val and ver match; bump ver++ on every write.' },
      { step: '3. Count Stale Retries', detail: 'Increment retries and push false whenever ABA or concurrent modification changed ver.' },
    ],
    starterCode: `function simulateCasQueueAndABA(ops) {\n  // TODO: return { finalVal, version, retries, log }\n  return { finalVal: 0, version: 0, retries: 0, log: [] };\n}`,
    solutionCode: `function simulateCasQueueAndABA(ops) {\n  let state = { val: 0, ver: 0 }, retries = 0;\n  const log = [];\n  for (const op of ops) {\n    if (op.type === 'cas') {\n      if (state.val === op.expectedVal && state.ver === op.expectedVer) { state = { val: op.newVal, ver: state.ver + 1 }; log.push(true); }\n      else { retries++; log.push(false); }\n    } else if (op.type === 'add') state = { val: state.val + op.delta, ver: state.ver + 1 };\n  }\n  return { finalVal: state.val, version: state.ver, retries, log };\n}`,
    testCases: [
      { label: 'Detects ABA when val returns to 0 with bumped version', args: [[{ type: 'add', delta: 5 }, { type: 'add', delta: -5 }, { type: 'cas', expectedVal: 0, expectedVer: 0, newVal: 99 }, { type: 'cas', expectedVal: 0, expectedVer: 2, newVal: 99 }]], expected: { finalVal: 99, version: 3, retries: 1, log: [false, true] } },
    ],
  },
});
