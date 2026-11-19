import type { OodConcept } from './oodTypes';

export const EXTENDED_GOF_PATTERNS: OodConcept[] = [
  // ==========================================================================
  // CREATIONAL: PROTOTYPE PATTERN
  // ==========================================================================
  {
    id: 'pattern-prototype',
    track: 'creational',
    trackLabel: 'Creational Patterns',
    title: 'Prototype Pattern (Cloning Complex Objects)',
    shortTitle: 'Prototype Pattern',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Create new objects by cloning a pre-configured prototype instance instead of re-running an expensive constructor or copying private fields manually.',
    realWorldAnalogy:
      'Instead of redrawing a complex resume layout from scratch for every job application, you click "Duplicate Document" on your master template and edit only the company name.',
    whyItMatters:
      'When object initialization requires DB queries, file parsing, or dozens of private config fields, cloning a ready-made prototype gives O(1) instantiation and preserves encapsulation.',
    keyTakeaways: [
      'The object itself implements clone(), so callers never need to know its concrete subclass or private fields.',
      'Always distinguish Shallow Copy (shares nested object pointers!) from Deep Copy (clones nested objects safely).',
      'Pairs with a Prototype Registry (map of named presets) for spawning game enemies, UI templates, or document styles.',
    ],
    commonMistakes: [
      'Returning a shallow copy when the object contains mutable lists or maps—editing the clone corrupts the original template!',
      'Using Prototype for simple 2-field DTOs where a normal constructor is clearer and faster.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · EXPENSIVE & TIGHT',
        title: 'Rebuilding From Scratch Repeats Heavy Setup & Leaks Internals',
        caption:
          'Caller manually queries config, checks concrete type, and tries to copy private fields one by one.',
        nodes: [
          {
            id: 'caller',
            label: 'GameSpawner',
            sublabel: 'Needs Goblin #2',
            x: 16,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'db',
            label: 'AssetLoader',
            sublabel: 'Reloads 40MB mesh!',
            x: 52,
            y: 24,
            kind: 'broken',
            state: 'error',
          },
          {
            id: 'g2',
            label: 'new Goblin()',
            sublabel: 'Slow + fragile copy',
            x: 84,
            y: 50,
            kind: 'broken',
            state: 'warn',
            fields: ['mesh: reload()', 'ai: recompile()'],
          },
        ],
        edges: [
          { from: 'caller', to: 'db', label: 'heavy I/O', style: 'blocked', active: true },
          { from: 'db', to: 'g2', label: '220ms lag', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Spawn Latency', value: '220 ms (reloads disk)', tone: 'bad' },
          { key: 'Private Field Access', value: 'Broken / coupled', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · DEEP CLONE',
        title: 'Prototype Registry Clones Pre-Loaded Instance in Microseconds',
        caption:
          'GameSpawner asks the Prototype interface for clone(). The prototype returns an independent deep copy with shared immutable mesh references.',
        nodes: [
          {
            id: 'caller',
            label: 'GameSpawner',
            sublabel: 'registry.get("goblin")',
            x: 16,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'proto',
            label: 'GoblinPrototype',
            sublabel: 'Pre-loaded Template',
            x: 50,
            y: 30,
            kind: 'interface',
            state: 'highlight',
            fields: ['hp: 100', 'loot: ["coin"]'],
          },
          {
            id: 'clone',
            label: 'GoblinClone #2',
            sublabel: 'Independent Heap Copy',
            x: 84,
            y: 66,
            kind: 'object',
            state: 'success',
            fields: ['hp: 100 (own)', 'loot: ["coin"] (new list)'],
          },
        ],
        edges: [
          { from: 'caller', to: 'proto', label: 'clone()', style: 'call', active: true },
          { from: 'proto', to: 'clone', label: 'deep copy', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Spawn Latency', value: '0.02 ms (in-memory)', tone: 'good' },
          { key: 'Mutating Clone Loot', value: 'Template untouched', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Manual Re-Construction & Shallow Reference Leak',
      goodLabel: 'Prototype Interface with Safe Deep Clone',
      explanation:
        'Each class owns its own clone() logic, safely deep-copying mutable sub-objects (like inventory lists) while letting callers duplicate any subtype through a single Prototype interface.',
      python: {
        bad: `class Enemy:
    def __init__(self, hp, skills):
        self.hp = hp
        self.skills = skills  # mutable list!

base = Enemy(100, ["slash"])
# Shallow bug: shares exact same skills list!
copy = Enemy(base.hp, base.skills)
copy.skills.append("fire")
# base.skills is now ["slash", "fire"]!`,
        good: `import copy
from abc import ABC, abstractmethod

class Prototype(ABC):
    @abstractmethod
    def clone(self): ...

class Enemy(Prototype):
    def __init__(self, hp: int, skills: list[str]):
        self.hp = hp
        self.skills = skills

    def clone(self) -> "Enemy":
        return Enemy(self.hp, copy.deepcopy(self.skills))

goblin_proto = Enemy(100, ["slash"])
g2 = goblin_proto.clone()
g2.skills.append("fire")  # goblin_proto stays ["slash"]!`,
      },
      java: {
        bad: `// Manual field copy fails on subclasses & shares mutable lists
Enemy copy = new Enemy(base.hp, base.skills);
copy.skills.add("fire"); // Mutates base.skills!`,
        good: `interface Prototype<T> {
    T cloneCopy();
}

class Enemy implements Prototype<Enemy> {
    private int hp;
    private List<String> skills;

    public Enemy(int hp, List<String> skills) {
        this.hp = hp;
        this.skills = new ArrayList<>(skills);
    }

    @Override
    public Enemy cloneCopy() {
        return new Enemy(this.hp, new ArrayList<>(this.skills));
    }
}`,
      },
      typescript: {
        bad: `// Shallow spread shares nested array references!
const base = { hp: 100, skills: ['slash'] };
const copy = { ...base };
copy.skills.push('fire'); // Corrupts base.skills!`,
        good: `interface Prototype<T> {
  clone(): T;
}

class Enemy implements Prototype<Enemy> {
  constructor(public hp: number, public skills: string[]) {}

  clone(): Enemy {
    return new Enemy(this.hp, [...this.skills]);
  }
}

const proto = new Enemy(100, ['slash']);
const g2 = proto.clone();
g2.skills.push('fire'); // proto.skills remains ['slash']`,
      },
    },
    interviewQa: [
      {
        question: 'What is the biggest bug developers introduce when implementing Prototype?',
        answer:
          'Accidental shallow copying. If an object holds mutable collections or child objects and clone() copies only references, mutating the clone silently mutates the prototype template for all future clones.',
      },
      {
        question: 'How does Prototype differ from Factory Method?',
        answer:
          'Factory Method builds a brand-new instance via a constructor/subclass hierarchy. Prototype duplicates an already-initialized object at runtime, avoiding expensive setup or complex constructor arguments.',
      },
    ],
    quiz: {
      question: 'When is the Prototype pattern the strongest Creational choice?',
      options: [
        {
          id: 'a',
          text: 'When creating an object from scratch is expensive or depends on runtime state, and you want fast independent copies',
          isCorrect: true,
          explanation: 'Correct! Prototype clones pre-configured instances without coupling callers to concrete classes.',
        },
        {
          id: 'b',
          text: 'When you need strictly one global instance across the entire app',
          isCorrect: false,
          explanation: 'That is the Singleton pattern.',
        },
        {
          id: 'c',
          text: 'When you want to restrict callers from ever copying objects',
          isCorrect: false,
          explanation: 'Prototype specifically enables copying.',
        },
        {
          id: 'd',
          text: 'When you want to replace an incompatible API signature',
          isCorrect: false,
          explanation: 'That is the Adapter pattern.',
        },
      ],
    },
  },

  // ==========================================================================
  // STRUCTURAL: PROXY PATTERN
  // ==========================================================================
  {
    id: 'pattern-proxy',
    track: 'structural',
    trackLabel: 'Structural Patterns',
    title: 'Proxy Pattern (Protection, Caching & Lazy Virtual Proxy)',
    shortTitle: 'Proxy Pattern',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Place a substitute object with the exact same interface in front of a real service to control access, cache results, or delay expensive initialization.',
    realWorldAnalogy:
      'A corporate security receptionist (Proxy) sits in front of the CEO (Real Service). Visitors talk to the receptionist first—routine questions get answered immediately from a FAQ sheet (Cache), and unauthorized visitors are turned away (Protection) without ever disturbing the CEO.',
    whyItMatters:
      'Proxy lets you add authentication, rate limiting, response caching, or lazy loading of heavy resources without modifying either the client or the real service.',
    keyTakeaways: [
      'Proxy implements the SAME interface as the RealSubject, so the client does not even know a proxy is in between.',
      'Four classic types: Virtual Proxy (lazy load), Protection Proxy (auth/ACL), Caching Proxy (memoize DB/API calls), Remote Proxy (RPC stub).',
      'Difference from Decorator: Decorator stacks extra behaviors chosen by the caller; Proxy manages lifecycle/access to a specific target internally.',
    ],
    commonMistakes: [
      'Making the Proxy expose a different method signature than the RealService, forcing clients to rewrite call sites.',
      'Forgetting cache invalidation or TTL in a Caching Proxy, serving stale data forever.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · CACHE MISS',
        title: 'Proxy Checks Auth & Cache -> Forwards First Request to Real DB',
        caption:
          'Client calls VideoService.getVideo("v42"). The CachingProxy verifies permissions, sees a cache miss, delegates to RealVideoService, and caches the result.',
        nodes: [
          {
            id: 'cli',
            label: 'WebClient',
            sublabel: 'getVideo("v42")',
            x: 14,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'pxy',
            label: 'VideoCachingProxy',
            sublabel: 'Auth OK · Cache MISS',
            x: 50,
            y: 50,
            kind: 'gate',
            state: 'highlight',
            fields: ['cache: {}'],
          },
          {
            id: 'real',
            label: 'RealVideoService',
            sublabel: 'Downloads 4K stream',
            x: 86,
            y: 50,
            kind: 'object',
            state: 'active',
          },
        ],
        edges: [
          { from: 'cli', to: 'pxy', label: 'request', style: 'call', active: true },
          { from: 'pxy', to: 'real', label: 'miss -> fetch', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Cache Status', value: 'MISS (stored v42)', tone: 'warn' },
          { key: 'Latency', value: '180 ms (origin fetch)', tone: 'neutral' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · CACHE HIT',
        title: 'Second Request Served Instantly From Proxy — Real Service Untouched',
        caption:
          'Next caller requests "v42". Proxy returns the cached payload in 1ms without waking the heavy RealVideoService.',
        nodes: [
          {
            id: 'cli',
            label: 'WebClient',
            sublabel: 'getVideo("v42")',
            x: 16,
            y: 50,
            kind: 'client',
            state: 'success',
          },
          {
            id: 'pxy',
            label: 'VideoCachingProxy',
            sublabel: 'Cache HIT! Returns fast',
            x: 52,
            y: 50,
            kind: 'gate',
            state: 'success',
            fields: ['cache["v42"]: ready'],
          },
          {
            id: 'real',
            label: 'RealVideoService',
            sublabel: 'Idle (0 load)',
            x: 86,
            y: 50,
            kind: 'object',
            state: 'idle',
          },
        ],
        edges: [
          { from: 'cli', to: 'pxy', label: '1ms hit!', style: 'call', active: true },
          { from: 'pxy', to: 'real', label: 'skipped', style: 'dashed', active: false },
        ],
        stateWatch: [
          { key: 'Cache Status', value: 'HIT (origin spared)', tone: 'good' },
          { key: 'Latency', value: '1 ms (180× faster)', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Client Mixes Caching, Auth & Business Calls Directly',
      goodLabel: 'Transparent Caching & Protection Proxy',
      explanation:
        'VideoProxy implements the exact same VideoService interface. The client stays clean, while access control and memoization live safely inside the proxy.',
      python: {
        bad: `# Every caller repeats auth + cache logic!
def load_video(user, vid, cache, service):
    if not user.is_subscribed:
        raise PermissionError("Denied")
    if vid not in cache:
        cache[vid] = service.fetch(vid)
    return cache[vid]`,
        good: `from typing import Protocol

class VideoService(Protocol):
    def get_video(self, vid: str) -> bytes: ...

class RealVideoService:
    def get_video(self, vid: str) -> bytes:
        return f"4K_STREAM:{vid}".encode()

class VideoProxy:
    def __init__(self, real: VideoService, is_allowed: bool):
        self._real = real
        self._is_allowed = is_allowed
        self._cache: dict[str, bytes] = {}

    def get_video(self, vid: str) -> bytes:
        if not self._is_allowed:
            raise PermissionError("Subscription required")
        if vid not in self._cache:
            self._cache[vid] = self._real.get_video(vid)
        return self._cache[vid]`,
      },
      java: {
        bad: `// Auth & caching scattered across UI controllers
if (user.canWatch()) {
    if (!cache.containsKey(id)) cache.put(id, real.getVideo(id));
    return cache.get(id);
}`,
        good: `interface VideoService {
    byte[] getVideo(String id);
}

class VideoProxy implements VideoService {
    private final VideoService real;
    private final boolean allowed;
    private final Map<String, byte[]> cache = new HashMap<>();

    public VideoProxy(VideoService real, boolean allowed) {
        this.real = real;
        this.allowed = allowed;
    }

    @Override
    public byte[] getVideo(String id) {
        if (!allowed) throw new SecurityException("Denied");
        return cache.computeIfAbsent(id, real::getVideo);
    }
}`,
      },
      typescript: {
        bad: `// Client tightly coupled to origin service + cache map
if (!cache.has(id)) cache.set(id, await origin.getVideo(id));`,
        good: `interface VideoService {
  getVideo(id: string): string;
}

class VideoProxy implements VideoService {
  private cache = new Map<string, string>();
  constructor(private real: VideoService, private allowed: boolean) {}

  getVideo(id: string): string {
    if (!this.allowed) throw new Error('Access denied');
    if (!this.cache.has(id)) {
      this.cache.set(id, this.real.getVideo(id));
    }
    return this.cache.get(id)!;
  }
}`,
      },
    },
    interviewQa: [
      {
        question: 'How is Proxy different from Decorator if both implement the same interface and wrap a target?',
        answer:
          'Intent & control: Decorator lets the caller dynamically stack multiple layers of extra behavior (new Retry(new Log(service))). Proxy typically controls access, caching, or lazy instantiation of a specific underlying subject—often creating or managing the real object itself.',
      },
      {
        question: 'Give two real-world frameworks that rely heavily on Proxy.',
        answer:
          'Spring AOP / Hibernate (lazy-loading entity proxies and @Transactional interceptors) and JavaScript ES6 Proxy (used by Vue 3 reactivity to intercept property reads/writes).',
      },
    ],
    quiz: {
      question: 'You have a heavy 200MB ML model that should only load into RAM the first time predict() is actually called. Which Proxy type solves this?',
      options: [
        {
          id: 'a',
          text: 'Virtual Proxy (Lazy Initialization Proxy)',
          isCorrect: true,
          explanation: 'Correct! A Virtual Proxy delays creating the expensive real object until its method is actually invoked.',
        },
        {
          id: 'b',
          text: 'Adapter Pattern',
          isCorrect: false,
          explanation: 'Adapter translates incompatible interfaces; it does not focus on lazy lifecycle control.',
        },
        {
          id: 'c',
          text: 'Builder Pattern',
          isCorrect: false,
          explanation: 'Builder constructs step-by-step configurations, not transparent lazy loading.',
        },
        {
          id: 'd',
          text: 'Iterator Pattern',
          isCorrect: false,
          explanation: 'Iterator traverses collections sequentially.',
        },
      ],
    },
  },

  // ==========================================================================
  // STRUCTURAL: COMPOSITE & BRIDGE PATTERNS
  // ==========================================================================
  {
    id: 'pattern-composite-bridge',
    track: 'structural',
    trackLabel: 'Structural Patterns',
    title: 'Composite & Bridge Patterns (Trees & Two-Axis Decoupling)',
    shortTitle: 'Composite & Bridge',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Composite treats individual items and nested groups uniformly as a tree; Bridge splits two independent dimensions (like Shape × Renderer) so classes grow by M + N instead of M × N.',
    realWorldAnalogy:
      'Composite is a file system: calling getSize() works identically on a single File or a Folder containing 50 nested Folders. Bridge is a TV Remote (Abstraction) paired with any TV Brand (Implementation)—you can upgrade remotes without rewriting TVs.',
    whyItMatters:
      'Composite powers DOM trees, UI component hierarchies, org charts, and expression parsers. Bridge prevents combinatorial class explosion when a domain varies along two orthogonal axes.',
    keyTakeaways: [
      'Composite: Leaf (File) and Container (Folder) share one common Component interface (size(), render()).',
      'Composite eliminates ugly `if (item instanceof Folder)` recursion checks in client code.',
      'Bridge: Replace `VectorCircle, RasterCircle, VectorSquare, RasterSquare` (M×N) with `Shape(renderer)` (M+N).',
    ],
    commonMistakes: [
      'Forcing Leaf nodes in Composite to throw UnsupportedOperationException on add()/remove() if the interface is too fat (keep mutation methods on Composite when possible).',
      'Confusing Bridge with Adapter: Bridge is planned upfront to separate two varying hierarchies; Adapter retrofits an existing incompatible class later.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'COMPOSITE · UNIFORM TREE',
        title: 'Client Calls getSize() Once — Folders Recursively Sum Leaves',
        caption:
          'Both File (Leaf) and Folder (Composite) implement FileSystemNode. Calling root.getSize() cleanly cascades down the tree without type checks.',
        nodes: [
          {
            id: 'root',
            label: 'Folder: /src',
            sublabel: 'Composite Node',
            x: 50,
            y: 22,
            kind: 'interface',
            state: 'active',
            fields: ['getSize() -> 35 KB'],
          },
          {
            id: 'f1',
            label: 'File: App.tsx',
            sublabel: 'Leaf (10 KB)',
            x: 20,
            y: 72,
            kind: 'object',
            state: 'success',
          },
          {
            id: 'sub',
            label: 'Folder: /data',
            sublabel: 'Composite (25 KB)',
            x: 62,
            y: 62,
            kind: 'object',
            state: 'highlight',
          },
          {
            id: 'f2',
            label: 'File: db.json',
            sublabel: 'Leaf (25 KB)',
            x: 86,
            y: 80,
            kind: 'object',
            state: 'success',
          },
        ],
        edges: [
          { from: 'root', to: 'f1', label: '10 KB', style: 'call', active: true },
          { from: 'root', to: 'sub', label: '25 KB', style: 'call', active: true },
          { from: 'sub', to: 'f2', label: '25 KB', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Client Type Checks', value: '0 instanceof calls', tone: 'good' },
          { key: 'Total /src Size', value: '35 KB (recursive)', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'BRIDGE · M + N SCALING',
        title: 'Bridge Decouples Shape Abstraction From Rendering Engine',
        caption:
          'Instead of 3 Shapes × 3 Renderers = 9 subclasses, Shape holds a Renderer bridge reference—only 3 + 3 = 6 clean classes!',
        nodes: [
          {
            id: 'circle',
            label: 'Circle (Abstraction)',
            sublabel: 'has-a Renderer',
            x: 22,
            y: 30,
            kind: 'class',
            state: 'active',
          },
          {
            id: 'square',
            label: 'Square (Abstraction)',
            sublabel: 'has-a Renderer',
            x: 22,
            y: 72,
            kind: 'class',
            state: 'idle',
          },
          {
            id: 'bridge',
            label: '«Renderer» Bridge',
            sublabel: 'drawCircle(), drawRect()',
            x: 54,
            y: 50,
            kind: 'interface',
            state: 'highlight',
          },
          {
            id: 'svg',
            label: 'SvgRenderer',
            sublabel: 'Vector DOM',
            x: 84,
            y: 30,
            kind: 'object',
            state: 'success',
          },
          {
            id: 'gpu',
            label: 'WebGLRenderer',
            sublabel: 'GPU Shaders',
            x: 84,
            y: 72,
            kind: 'object',
            state: 'success',
          },
        ],
        edges: [
          { from: 'circle', to: 'bridge', label: 'delegates', style: 'call', active: true },
          { from: 'square', to: 'bridge', label: 'delegates', style: 'solid', active: false },
          { from: 'bridge', to: 'svg', label: 'impl', style: 'inherit', active: true },
          { from: 'bridge', to: 'gpu', label: 'impl', style: 'inherit', active: false },
        ],
        stateWatch: [
          { key: 'Class Count (5×4)', value: '9 classes (not 20!)', tone: 'good' },
          { key: 'Add CanvasRenderer', value: '+1 class, 0 edits', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Type-Checking Tree Traversal & M×N Subclass Explosion',
      goodLabel: 'Uniform Composite Node Interface',
      explanation:
        'By giving both Leaf (FileItem) and Composite (FolderItem) the same size() contract, any tree depth resolves cleanly in 3 lines without isinstance/type switches.',
      python: {
        bad: `def total_size(node):
    if isinstance(node, dict):  # folder
        return sum(total_size(c) for c in node["children"])
    elif isinstance(node, int): # file
        return node
    # Adding Symlink breaks every function using isinstance!`,
        good: `from abc import ABC, abstractmethod

class FsNode(ABC):
    @abstractmethod
    def size(self) -> int: ...

class FileNode(FsNode):
    def __init__(self, bytes_len: int):
        self._bytes = bytes_len
    def size(self) -> int:
        return self._bytes

class FolderNode(FsNode):
    def __init__(self, children: list[FsNode]):
        self._children = children
    def size(self) -> int:
        return sum(child.size() for child in self._children)`,
      },
      java: {
        bad: `// Fragile instanceof branching across the codebase
int totalSize(Object item) {
    if (item instanceof FileObj f) return f.bytes;
    if (item instanceof FolderObj d) { /* manual loop */ }
    throw new IllegalArgumentException();
}`,
        good: `interface FsNode {
    int size();
}

record FileNode(int bytes) implements FsNode {
    public int size() { return bytes; }
}

class FolderNode implements FsNode {
    private final List<FsNode> children;
    public FolderNode(List<FsNode> children) { this.children = children; }
    public int size() {
        return children.stream().mapToInt(FsNode::size).sum();
    }
}`,
      },
      typescript: {
        bad: `// Client must know every node tag to compute size
function getSize(node: any): number {
  if (node.type === 'file') return node.bytes;
  if (node.type === 'folder') return node.items.reduce((a, c) => a + getSize(c), 0);
  return 0;
}`,
        good: `interface FsNode {
  size(): number;
}

class FileNode implements FsNode {
  constructor(private bytes: number) {}
  size() { return this.bytes; }
}

class FolderNode implements FsNode {
  constructor(private children: FsNode[]) {}
  size() {
    return this.children.reduce((sum, c) => sum + c.size(), 0);
  }
}`,
      },
    },
    interviewQa: [
      {
        question: 'When should you recognize a Composite pattern opportunity in an interview?',
        answer:
          'Whenever the problem describes a recursive part-whole hierarchy—files/folders, menu/submenus, boxes inside shipping boxes, nested comments, or math expression ASTs—where the same operation applies to both single items and groups.',
      },
      {
        question: 'How do you spot when to use the Bridge pattern?',
        answer:
          'When you see two independent reasons a class hierarchy is multiplying (e.g., NotificationType: Alert/Promo × Channel: Email/SMS/Push). Composition via Bridge turns M × N classes into M + N.',
      },
    ],
    quiz: {
      question: 'You have 4 Notification types (Alert, Invoice, Promo, OTP) and 3 Delivery Channels (Email, SMS, Push). Which pattern avoids writing 12 subclasses?',
      options: [
        {
          id: 'a',
          text: 'Bridge Pattern (Notification holds a DeliveryChannel reference)',
          isCorrect: true,
          explanation: 'Correct! Bridge separates the Notification abstraction from the DeliveryChannel implementation (4 + 3 = 7 classes instead of 12).',
        },
        {
          id: 'b',
          text: 'Singleton Pattern',
          isCorrect: false,
          explanation: 'Singleton only restricts instance count to one.',
        },
        {
          id: 'c',
          text: 'Prototype Pattern',
          isCorrect: false,
          explanation: 'Prototype clones instances; it does not decouple orthogonal hierarchies.',
        },
        {
          id: 'd',
          text: 'Observer Pattern',
          isCorrect: false,
          explanation: 'Observer broadcasts events to subscribers.',
        },
      ],
    },
  },

  // ==========================================================================
  // STRUCTURAL: FLYWEIGHT PATTERN
  // ==========================================================================
  {
    id: 'pattern-flyweight',
    track: 'structural',
    trackLabel: 'Structural Patterns',
    title: 'Flyweight Pattern (Sharing Immutable State at Scale)',
    shortTitle: 'Flyweight Pattern',
    difficulty: 'Advanced',
    oneSentenceRule:
      'Slash RAM usage when creating millions of similar objects by splitting heavy shared Immutable (Intrinsic) state into a pooled Flyweight and keeping only tiny unique (Extrinsic) coordinates per instance.',
    realWorldAnalogy:
      'In a 500-page book, the letter "e" appears 60,000 times—yet your OS stores the font glyph outline for "e" ONCE in memory (Intrinsic) and only stores each letter’s (row, col) position (Extrinsic).',
    whyItMatters:
      'Essential for text editors, map tiles, game forests/particles, and Java/Python String/Integer interning pools where naive object duplication causes OutOfMemoryError.',
    keyTakeaways: [
      'Intrinsic State = immutable, heavy, shared across thousands of instances (font mesh, tree texture, color palette).',
      'Extrinsic State = lightweight, unique per instance, passed into methods or held in tiny structs (x, y, size).',
      'A FlyweightFactory caches and returns existing shared Flyweight objects instead of allocating duplicates.',
    ],
    commonMistakes: [
      'Allowing mutable fields inside a shared Flyweight—mutating one tree’s color accidentally paints all 1,000,000 trees!',
      'Using Flyweight prematurely when you only have a few hundred objects (adds complexity without meaningful memory gain).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · RAM EXPLOSION',
        title: '100,000 Trees Each Store Their Own 2MB Texture -> OOM Crash!',
        caption:
          'Every Tree instance duplicates identical Oak mesh and bark texture bytes on the Heap, consuming gigabytes of RAM.',
        nodes: [
          {
            id: 't1',
            label: 'Tree #1 (x=10, y=5)',
            sublabel: '2MB Oak Texture',
            x: 20,
            y: 35,
            kind: 'broken',
            state: 'error',
          },
          {
            id: 't2',
            label: 'Tree #2 (x=42, y=9)',
            sublabel: '2MB Oak Texture (dup!)',
            x: 50,
            y: 35,
            kind: 'broken',
            state: 'error',
          },
          {
            id: 't3',
            label: 'Tree #100,000',
            sublabel: '2MB Oak Texture (dup!)',
            x: 82,
            y: 35,
            kind: 'broken',
            state: 'error',
          },
          {
            id: 'ram',
            label: 'Heap Memory',
            sublabel: '200 GB Required -> CRASH',
            x: 50,
            y: 78,
            kind: 'memory',
            state: 'error',
          },
        ],
        edges: [
          { from: 't1', to: 'ram', style: 'blocked', active: true },
          { from: 't2', to: 'ram', style: 'blocked', active: true },
          { from: 't3', to: 'ram', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Tree Objects', value: '100,000 instances', tone: 'neutral' },
          { key: 'Heap RAM Used', value: '200 GB (OOM!)', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · FLYWEIGHT POOL',
        title: '100,000 Tiny Tree Coordinates Share ONE 2MB OakType Flyweight',
        caption:
          'Each Tree holds only (x, y) + a pointer to the immutable OakType from TreeTypeFactory. Memory drops by 99.9%!',
        nodes: [
          {
            id: 't1',
            label: 'Tree #1',
            sublabel: '(x=10, y=5) · 16B',
            x: 18,
            y: 26,
            kind: 'object',
            state: 'active',
          },
          {
            id: 't2',
            label: 'Tree #2',
            sublabel: '(x=42, y=9) · 16B',
            x: 50,
            y: 26,
            kind: 'object',
            state: 'active',
          },
          {
            id: 't3',
            label: 'Tree #100,000',
            sublabel: '(x=88, y=4) · 16B',
            x: 82,
            y: 26,
            kind: 'object',
            state: 'active',
          },
          {
            id: 'fw',
            label: 'OakType (Flyweight)',
            sublabel: '1× Shared 2MB Texture (Immutable)',
            x: 50,
            y: 76,
            kind: 'memory',
            state: 'success',
            fields: ['mesh: oak.obj', 'color: #2e7d32'],
          },
        ],
        edges: [
          { from: 't1', to: 'fw', label: 'ref', style: 'call', active: true },
          { from: 't2', to: 'fw', label: 'ref', style: 'call', active: true },
          { from: 't3', to: 'fw', label: 'ref', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Shared Textures', value: '1 OakType (2 MB)', tone: 'good' },
          { key: 'Total Heap RAM', value: '3.6 MB (55,000× less!)', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Duplicating Heavy Texture Per Instance',
      goodLabel: 'Flyweight Factory Sharing Intrinsic State',
      explanation:
        'TreeTypeFactory caches immutable TreeType instances by key. Each Tree stores only its unique (x, y) extrinsic coordinates and delegates drawing to the shared Flyweight.',
      python: {
        bad: `class Tree:
    def __init__(self, x, y, name, texture_bytes):
        self.x, self.y = x, y
        self.name = name
        self.texture_bytes = texture_bytes  # 2MB copied 100k times!`,
        good: `class TreeType:  # Immutable Flyweight (Intrinsic)
    def __init__(self, name: str, color: str):
        self.name = name
        self.color = color

    def draw(self, x: int, y: int) -> str:
        return f"Draw {self.name}({self.color}) at ({x},{y})"

class TreeFactory:
    _pool: dict[tuple[str, str], TreeType] = {}

    @classmethod
    def get_type(cls, name: str, color: str) -> TreeType:
        key = (name, color)
        if key not in cls._pool:
            cls._pool[key] = TreeType(name, color)
        return cls._pool[key]

class Tree:  # Lightweight Context (Extrinsic)
    def __init__(self, x: int, y: int, tree_type: TreeType):
        self.x, self.y, self.type = x, y, tree_type`,
      },
      java: {
        bad: `// Every tree allocates a brand new texture array
class Tree {
    int x, y;
    byte[] texture = loadTexture("oak.png");
}`,
        good: `record TreeType(String name, String color) {} // Intrinsic

class TreeFactory {
    private static final Map<String, TreeType> POOL = new HashMap<>();
    static TreeType get(String name, String color) {
        return POOL.computeIfAbsent(name + color, k -> new TreeType(name, color));
    }
}

class Tree { // Extrinsic only
    final int x, y;
    final TreeType type;
    Tree(int x, int y, TreeType type) { this.x = x; this.y = y; this.type = type; }
}`,
      },
      typescript: {
        bad: `// Repeats identical style/mesh data across 100,000 entries
const trees = coords.map(([x, y]) => ({ x, y, texture: loadHeavyTexture('oak') }));`,
        good: `class TreeType {
  constructor(readonly name: string, readonly color: string) {}
  draw(x: number, y: number) {
    return \`\${this.name}@(\${x},\${y})\`;
  }
}

class TreeFactory {
  private static pool = new Map<string, TreeType>();
  static get(name: string, color: string): TreeType {
    const key = \`\${name}:\${color}\`;
    if (!this.pool.has(key)) this.pool.set(key, new TreeType(name, color));
    return this.pool.get(key)!;
  }
}`,
      },
    },
    interviewQa: [
      {
        question: 'Why MUST intrinsic state in a Flyweight be immutable?',
        answer:
          'Because thousands of objects share the exact same Flyweight pointer in RAM. If any caller mutates a field inside the Flyweight, it silently corrupts every other instance sharing it.',
      },
      {
        question: 'Name a built-in example of Flyweight in Java or Python.',
        answer:
          'Java’s Integer.valueOf(-128..127) cache and String Constant Pool, or Python’s small integer cache (-5..256) and string interning.',
      },
    ],
    quiz: {
      question: 'In a rich text editor storing 500,000 characters using Flyweight, which property belongs in the SHARED Intrinsic Flyweight?',
      options: [
        {
          id: 'a',
          text: 'The immutable font family, glyph vector outline, and weight',
          isCorrect: true,
          explanation: 'Correct! Glyph outlines and font metadata are heavy, immutable, and repeated across thousands of characters.',
        },
        {
          id: 'b',
          text: 'Each character’s unique line number and column cursor offset',
          isCorrect: false,
          explanation: 'Position is unique per character, so it is Extrinsic state.',
        },
        {
          id: 'c',
          text: 'Whether the user currently highlighted that single character',
          isCorrect: false,
          explanation: 'Mutable per-character selection state cannot be shared across all instances of the letter "a".',
        },
        {
          id: 'd',
          text: 'A mutable undo stack per character',
          isCorrect: false,
          explanation: 'Flyweights must never hold mutable per-instance history.',
        },
      ],
    },
  },

  // ==========================================================================
  // BEHAVIORAL: CHAIN OF RESPONSIBILITY
  // ==========================================================================
  {
    id: 'pattern-chain-of-responsibility',
    track: 'behavioral',
    trackLabel: 'Behavioral Patterns',
    title: 'Chain of Responsibility (Middleware & Request Pipelines)',
    shortTitle: 'Chain of Responsibility',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Pass a request sequentially through a chain of independent handlers, where each handler either processes/short-circuits the request or forwards it to `next.handle()`.',
    realWorldAnalogy:
      'Airport security checkpoints: Ticket Check -> Bag X-Ray -> Passport Control -> Boarding Gate. If any station rejects you, the chain stops immediately; otherwise you move to the next station.',
    whyItMatters:
      'Powers Express.js middleware, Java Servlet Filters, logging pipelines, fraud checks, and approval workflows—keeping each cross-cutting rule small, testable, and reorderable.',
    keyTakeaways: [
      'Decouples the request sender from knowing which specific handler will reject or complete the request.',
      'Each handler obeys Single Responsibility (Auth only checks tokens; RateLimit only checks quota).',
      'You can reorder, add, or remove pipeline stages dynamically at startup without touching handler internals.',
    ],
    commonMistakes: [
      'Forgetting to call `next.handle(req)` in a passing handler, causing requests to hang silently.',
      'Creating circular chains (`A -> B -> A`) that trigger infinite recursion / stack overflow.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · PIPELINE PASS',
        title: 'Valid Request Flows Through Auth -> RateLimit -> Controller',
        caption:
          'Each middleware validates its single concern and calls next.handle(req) until the core handler executes.',
        nodes: [
          {
            id: 'req',
            label: 'POST /orders',
            sublabel: 'JWT valid · 3/100 req',
            x: 12,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'auth',
            label: '1. AuthHandler',
            sublabel: 'Token OK -> next()',
            x: 38,
            y: 50,
            kind: 'gate',
            state: 'success',
          },
          {
            id: 'rl',
            label: '2. RateLimitHandler',
            sublabel: 'Under quota -> next()',
            x: 64,
            y: 50,
            kind: 'gate',
            state: 'success',
          },
          {
            id: 'ctrl',
            label: '3. OrderHandler',
            sublabel: '201 Created!',
            x: 89,
            y: 50,
            kind: 'object',
            state: 'success',
          },
        ],
        edges: [
          { from: 'req', to: 'auth', style: 'call', active: true },
          { from: 'auth', to: 'rl', label: 'next()', style: 'call', active: true },
          { from: 'rl', to: 'ctrl', label: 'next()', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Pipeline Result', value: '201 Created (all passed)', tone: 'good' },
          { key: 'Coupling', value: 'Each handler isolated', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · SHORT-CIRCUIT',
        title: 'Quota Exceeded -> RateLimitHandler Stops Chain Immediately',
        caption:
          'When a handler rejects a request, it returns HTTP 429 immediately—protecting OrderHandler from unnecessary DB work.',
        nodes: [
          {
            id: 'req',
            label: 'POST /orders',
            sublabel: 'JWT valid · 101/100 req',
            x: 12,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'auth',
            label: '1. AuthHandler',
            sublabel: 'Token OK -> next()',
            x: 38,
            y: 50,
            kind: 'gate',
            state: 'success',
          },
          {
            id: 'rl',
            label: '2. RateLimitHandler',
            sublabel: 'STOP! Return 429',
            x: 64,
            y: 50,
            kind: 'gate',
            state: 'error',
          },
          {
            id: 'ctrl',
            label: '3. OrderHandler',
            sublabel: 'Never called (Safe)',
            x: 89,
            y: 50,
            kind: 'object',
            state: 'idle',
          },
        ],
        edges: [
          { from: 'req', to: 'auth', style: 'call', active: true },
          { from: 'auth', to: 'rl', label: 'next()', style: 'call', active: true },
          { from: 'rl', to: 'ctrl', label: 'BLOCKED', style: 'blocked', active: false },
        ],
        stateWatch: [
          { key: 'Pipeline Result', value: '429 Too Many Requests', tone: 'bad' },
          { key: 'Downstream Load', value: '0 DB queries executed', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Giant Nested If-Else Guard Pyramid',
      goodLabel: 'Composable Chain of Responsibility Handlers',
      explanation:
        'Each security or validation rule becomes a standalone Handler class linked via setNext(). Adding a new GeoBlockHandler takes zero edits to Auth or RateLimit.',
      python: {
        bad: `def handle_request(req):
    if not req.token:
        return 401
    if req.count > 100:
        return 429
    if req.amount > 10000 and not req.mfa:
        return 403
    return create_order(req)`,
        good: `class Handler:
    def __init__(self, next_handler=None):
        self._next = next_handler

    def handle(self, req: dict) -> str:
        return self._next.handle(req) if self._next else "200 OK"

class AuthHandler(Handler):
    def handle(self, req: dict) -> str:
        if not req.get("token"):
            return "401 Unauthorized"
        return super().handle(req)

class RateLimitHandler(Handler):
    def handle(self, req: dict) -> str:
        if req.get("rpm", 0) > 100:
            return "429 Too Many Requests"
        return super().handle(req)

chain = AuthHandler(RateLimitHandler())
result = chain.handle({"token": "jwt", "rpm": 12})`,
      },
      java: {
        bad: `// Monolithic method hard to test or reorder
int handle(Request req) {
    if (!authOk(req)) return 401;
    if (!rateOk(req)) return 429;
    return process(req);
}`,
        good: `abstract class Handler {
    protected Handler next;
    public Handler linkWith(Handler next) {
        this.next = next;
        return next;
    }
    public abstract String handle(Map<String, Object> req);
    protected String passNext(Map<String, Object> req) {
        return next == null ? "200 OK" : next.handle(req);
    }
}

class AuthHandler extends Handler {
    public String handle(Map<String, Object> req) {
        if (!req.containsKey("token")) return "401";
        return passNext(req);
    }
}`,
      },
      typescript: {
        bad: `function handle(req: Req) {
  if (!req.token) return 401;
  if (req.rpm > 100) return 429;
  return 200;
}`,
        good: `abstract class Handler {
  private next?: Handler;
  setNext(h: Handler): Handler { this.next = h; return h; }
  handle(req: { token?: string; rpm: number }): string {
    return this.next ? this.next.handle(req) : '200 OK';
  }
}

class AuthHandler extends Handler {
  handle(req: { token?: string; rpm: number }): string {
    if (!req.token) return '401 Unauthorized';
    return super.handle(req);
  }
}`,
      },
    },
    interviewQa: [
      {
        question: 'Where do you see Chain of Responsibility every day in backend web development?',
        answer:
          'Express.js middleware (`app.use((req, res, next) => ...)`), Spring Security Filter Chains, and gRPC interceptors are textbook Chain of Responsibility implementations.',
      },
      {
        question: 'Can multiple handlers process the same request instead of stopping at the first one?',
        answer:
          'Yes! That variant is called an Intercepting Filter or Pipeline (e.g., Logger logs and passes on, CORS adds headers and passes on, Auth rejects or passes on).',
      },
    ],
    quiz: {
      question: 'Which Behavioral pattern models Express.js middleware (`auth -> rateLimit -> validator -> controller`)?',
      options: [
        {
          id: 'a',
          text: 'Chain of Responsibility',
          isCorrect: true,
          explanation: 'Correct! Each middleware either short-circuits with an error response or forwards to next().',
        },
        {
          id: 'b',
          text: 'Flyweight Pattern',
          isCorrect: false,
          explanation: 'Flyweight optimizes RAM by sharing immutable objects.',
        },
        {
          id: 'c',
          text: 'Builder Pattern',
          isCorrect: false,
          explanation: 'Builder constructs complex objects step by step.',
        },
        {
          id: 'd',
          text: 'Prototype Pattern',
          isCorrect: false,
          explanation: 'Prototype clones pre-existing objects.',
        },
      ],
    },
  },

  // ==========================================================================
  // BEHAVIORAL: COMMAND PATTERN
  // ==========================================================================
  {
    id: 'pattern-command',
    track: 'behavioral',
    trackLabel: 'Behavioral Patterns',
    title: 'Command Pattern (Undo/Redo, Queues & Macro Actions)',
    shortTitle: 'Command Pattern',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Wrap every action/request into a standalone Command object with `execute()` and `undo()`, so actions can be queued, logged, retried, or reversed like data.',
    realWorldAnalogy:
      'A restaurant order slip: You tell the waiter (Invoker) what you want; the waiter writes a Ticket (Command) and clips it to the kitchen queue. The Chef (Receiver) executes tickets in order—and if you cancel, the ticket can be pulled back.',
    whyItMatters:
      'Turns method calls into first-class objects—unlocking Ctrl+Z Undo/Redo stacks in editors, transactional rollback, background job queues, and reusable UI toolbar/shortcut bindings.',
    keyTakeaways: [
      'Four roles: Invoker (Button/Shortcut) -> Command (`execute()` / `undo()`) -> Receiver (Document/Account) <- Client wires them.',
      'Push executed Command objects onto a History Stack; popping calls `cmd.undo()` to reverse state cleanly.',
      'MacroCommand combines a list of Commands so one click runs and undoes an entire batch.',
    ],
    commonMistakes: [
      'Putting business logic directly inside UI Button click handlers—making keyboard shortcuts, macros, and undo impossible to reuse.',
      'Forgetting to save the minimal previous state snapshot inside the Command before mutating the Receiver, making `undo()` inaccurate.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · EXECUTE & PUSH',
        title: 'Editor Runs InsertTextCommand -> Saved to Undo History Stack',
        caption:
          'Toolbar/Shortcut invokes InsertTextCommand("World"). It mutates Document and pushes itself onto the UndoStack.',
        nodes: [
          {
            id: 'inv',
            label: 'EditorInvoker',
            sublabel: 'run(cmd)',
            x: 14,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'cmd',
            label: 'InsertTextCmd',
            sublabel: 'text=" World"',
            x: 46,
            y: 30,
            kind: 'interface',
            state: 'highlight',
            fields: ['execute()', 'undo()'],
          },
          {
            id: 'doc',
            label: 'Document (Receiver)',
            sublabel: '"Hello World"',
            x: 84,
            y: 30,
            kind: 'object',
            state: 'success',
          },
          {
            id: 'stk',
            label: 'UndoStack',
            sublabel: '[Insert(" World")]',
            x: 64,
            y: 78,
            kind: 'memory',
            state: 'highlight',
          },
        ],
        edges: [
          { from: 'inv', to: 'cmd', label: 'execute()', style: 'call', active: true },
          { from: 'cmd', to: 'doc', label: 'append()', style: 'call', active: true },
          { from: 'inv', to: 'stk', label: 'push(cmd)', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Document Text', value: '"Hello World"', tone: 'good' },
          { key: 'Undo Stack Depth', value: '1 command', tone: 'neutral' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · CTRL+Z UNDO',
        title: 'User Presses Ctrl+Z -> Pop Command & Call cmd.undo()',
        caption:
          'EditorInvoker pops the top command and invokes undo(). InsertTextCommand slices off the exact characters it added—zero coupling to Document internals!',
        nodes: [
          {
            id: 'inv',
            label: 'EditorInvoker',
            sublabel: 'undoLast()',
            x: 14,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'stk',
            label: 'UndoStack',
            sublabel: 'pop() -> []',
            x: 46,
            y: 76,
            kind: 'memory',
            state: 'active',
          },
          {
            id: 'cmd',
            label: 'InsertTextCmd',
            sublabel: 'undo() deletes 6 chars',
            x: 52,
            y: 28,
            kind: 'interface',
            state: 'highlight',
          },
          {
            id: 'doc',
            label: 'Document (Receiver)',
            sublabel: '"Hello" restored!',
            x: 86,
            y: 44,
            kind: 'object',
            state: 'success',
          },
        ],
        edges: [
          { from: 'inv', to: 'stk', label: 'pop()', style: 'call', active: true },
          { from: 'stk', to: 'cmd', label: 'cmd.undo()', style: 'call', active: true },
          { from: 'cmd', to: 'doc', label: 'revert', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Document Text', value: '"Hello" (restored!)', tone: 'good' },
          { key: 'Redo Stack', value: '[Insert(" World")]', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Direct Mutations With No Undo or Queueing Support',
      goodLabel: 'Command Objects With Reversible History Stack',
      explanation:
        'Each user edit is an object implementing execute() and undo(). The EditorHistory invoker manages Undo/Redo cleanly for any number of command types.',
      python: {
        bad: `# Direct mutation loses history — how do you undo?
doc_text = "Hello"
doc_text += " World"
# Must write custom inverse logic for every button!`,
        good: `from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self) -> None: ...
    @abstractmethod
    def undo(self) -> None: ...

class Document:
    def __init__(self, text=""): self.text = text

class AppendCommand(Command):
    def __init__(self, doc: Document, chunk: str):
        self.doc, self.chunk = doc, chunk
    def execute(self):
        self.doc.text += self.chunk
    def undo(self):
        self.doc.text = self.doc.text[:-len(self.chunk)]

class Editor:
    def __init__(self): self.history: list[Command] = []
    def run(self, cmd: Command):
        cmd.execute()
        self.history.append(cmd)
    def undo(self):
        if self.history: self.history.pop().undo()`,
      },
      java: {
        bad: `// Tight coupling between UI button and document mutation
saveBtn.onClick(() -> doc.append(" World")); // Cannot undo or log`,
        good: `interface Command {
    void execute();
    void undo();
}

class AppendCommand implements Command {
    private final StringBuilder doc;
    private final String chunk;
    AppendCommand(StringBuilder doc, String chunk) {
        this.doc = doc; this.chunk = chunk;
    }
    public void execute() { doc.append(chunk); }
    public void undo() { doc.delete(doc.length() - chunk.length(), doc.length()); }
}`,
      },
      typescript: {
        bad: `let text = 'Hello';
text += ' World'; // No clean undo/redo or macro replay`,
        good: `interface Command {
  execute(): void;
  undo(): void;
}

class AppendCmd implements Command {
  constructor(private doc: { text: string }, private chunk: string) {}
  execute() { this.doc.text += this.chunk; }
  undo() { this.doc.text = this.doc.text.slice(0, -this.chunk.length); }
}

class HistoryInvoker {
  private stack: Command[] = [];
  run(cmd: Command) { cmd.execute(); this.stack.push(cmd); }
  undo() { this.stack.pop()?.undo(); }
}`,
      },
    },
    interviewQa: [
      {
        question: 'How would you support BOTH Undo and Redo using Command?',
        answer:
          'Maintain two stacks: `undoStack` and `redoStack`. Executing a new command pushes to `undoStack` and clears `redoStack`. Calling `undo()` pops from `undoStack`, calls `cmd.undo()`, and pushes it onto `redoStack`. Calling `redo()` pops from `redoStack`, calls `cmd.execute()`, and pushes back to `undoStack`.',
      },
      {
        question: 'When should you pair Command with the Memento pattern?',
        answer:
          'When an operation is hard to invert mathematically (like blurring an image or sorting a table). The Command stores a lightweight Memento snapshot of the Receiver before executing so `undo()` restores the snapshot directly.',
      },
    ],
    quiz: {
      question: 'You are designing a Figma-like canvas editor that needs multi-level Undo/Redo, keyboard shortcut remapping, and macro recording. Which Behavioral pattern is the backbone?',
      options: [
        {
          id: 'a',
          text: 'Command Pattern',
          isCorrect: true,
          explanation: 'Correct! Encapsulating each edit as a Command object enables undo/redo stacks, macro replay, and decoupled UI bindings.',
        },
        {
          id: 'b',
          text: 'Adapter Pattern',
          isCorrect: false,
          explanation: 'Adapter converts one interface into another.',
        },
        {
          id: 'c',
          text: 'Facade Pattern',
          isCorrect: false,
          explanation: 'Facade provides a simplified entry point over a subsystem.',
        },
        {
          id: 'd',
          text: 'Bridge Pattern',
          isCorrect: false,
          explanation: 'Bridge decouples two independent inheritance dimensions.',
        },
      ],
    },
  },

  // ==========================================================================
  // BEHAVIORAL: TEMPLATE METHOD PATTERN
  // ==========================================================================
  {
    id: 'pattern-template-method',
    track: 'behavioral',
    trackLabel: 'Behavioral Patterns',
    title: 'Template Method Pattern (Fixed Algorithm Skeleton + Hooks)',
    shortTitle: 'Template Method',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Define the invariant step-by-step skeleton of an algorithm in a base class, while letting subclasses override only the specific customizable steps.',
    realWorldAnalogy:
      'A coffee/tea recipe card: (1) Boil water, (2) Brew ingredient [customizable], (3) Pour in cup, (4) Add condiments [optional hook]. Steps 1 and 3 never change; only step 2 differs between Coffee and Tea.',
    whyItMatters:
      'Eliminates copy-pasted boilerplate across similar pipelines (CSV vs JSON data miners, HTTP framework lifecycle hooks, JUnit setUp/test/tearDown) while guaranteeing step order cannot be broken.',
    keyTakeaways: [
      'The base `run()` / `process()` method is marked `final` (or non-overridable) so subclasses cannot accidentally skip critical steps like cleanup or auth.',
      'Follows the "Hollywood Principle": "Don’t call us, we’ll call you" — the base class orchestrates calls to subclass hooks.',
      'Template Method uses inheritance (static); Strategy uses composition (swappable at runtime).',
    ],
    commonMistakes: [
      'Creating too many abstract steps (10+ hooks), making every tiny subclass painful to write.',
      'Using Template Method when you need to swap behavior dynamically at runtime—use Strategy instead!',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'SKELETON · LOCKED ORDER',
        title: 'Base DataMiner Enforces 4-Step Pipeline Order',
        caption:
          'DataMiner.mine() always runs openFile() -> parse() -> analyze() -> closeFile(). Subclasses only implement parse()!',
        nodes: [
          {
            id: 'base',
            label: 'DataMiner (Abstract)',
            sublabel: 'final mine(path)',
            x: 20,
            y: 50,
            kind: 'interface',
            state: 'highlight',
            fields: ['1. openFile() [fixed]', '2. parse() [override]', '3. closeFile() [fixed]'],
          },
          {
            id: 'csv',
            label: 'CsvDataMiner',
            sublabel: 'Overrides parse() only',
            x: 78,
            y: 28,
            kind: 'object',
            state: 'success',
            fields: ['parse(): split(",")'],
          },
          {
            id: 'pdf',
            label: 'PdfDataMiner',
            sublabel: 'Overrides parse() only',
            x: 78,
            y: 74,
            kind: 'object',
            state: 'active',
            fields: ['parse(): ocrExtract()'],
          },
        ],
        edges: [
          { from: 'base', to: 'csv', label: 'calls parse()', style: 'call', active: true },
          { from: 'base', to: 'pdf', label: 'calls parse()', style: 'call', active: false },
        ],
        stateWatch: [
          { key: 'Duplicated Cleanup Code', value: '0 lines (owned by base)', tone: 'good' },
          { key: 'Step Ordering Safety', value: 'Guaranteed by base', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Duplicated Pipeline Skeleton Across Every Format',
      goodLabel: 'Template Method Base + Minimal Subclass Hooks',
      explanation:
        'open(), summarize(), and close() live once in DataMiner. CsvMiner and JsonMiner only override parse(), preventing resource leaks and duplicated boilerplate.',
      python: {
        bad: `class CsvMiner:
    def mine(self, path):
        f = open(path)          # Duplicated!
        rows = [l.split(",") for l in f]
        f.close()               # Duplicated!
        return len(rows)

class JsonMiner:
    def mine(self, path):
        f = open(path)          # Duplicated!
        rows = json.load(f)
        f.close()               # Easy to forget!
        return len(rows)`,
        good: `from abc import ABC, abstractmethod

class DataMiner(ABC):
    def mine(self, raw: str) -> int:  # Template Method
        cleaned = raw.strip()
        records = self.parse(cleaned)  # Subclass hook
        return len(records)

    @abstractmethod
    def parse(self, data: str) -> list: ...

class CsvMiner(DataMiner):
    def parse(self, data: str) -> list:
        return [line.split(",") for line in data.splitlines()]`,
      },
      java: {
        bad: `// Every importer repeats open/validate/close boilerplate`,
        good: `abstract class DataMiner {
    public final int mine(String raw) { // final locks step order!
        String cleaned = raw.trim();
        List<String> rows = parse(cleaned);
        return rows.size();
    }
    protected abstract List<String> parse(String data);
}

class CsvMiner extends DataMiner {
    @Override
    protected List<String> parse(String data) {
        return List.of(data.split("\\n"));
    }
}`,
      },
      typescript: {
        bad: `// Each format re-implements identical trim, logging, and error handling`,
        good: `abstract class DataMiner {
  mine(raw: string): number {
    const cleaned = raw.trim();
    const records = this.parse(cleaned);
    return records.length;
  }
  protected abstract parse(data: string): string[];
}

class CsvMiner extends DataMiner {
  protected parse(data: string): string[] {
    return data.split('\\n');
  }
}`,
      },
    },
    interviewQa: [
      {
        question: 'Template Method vs Strategy — how do you pick between them?',
        answer:
          'Use Template Method when the overall multi-step algorithm skeleton is fixed and subclasses only customize 1–2 internal steps via inheritance. Use Strategy when you want to swap the entire algorithm dynamically at runtime via composition.',
      },
      {
        question: 'What is a "Hook" method in Template Method?',
        answer:
          'A concrete base-class method with a default empty or simple implementation (e.g., `onAfterSave() {}`) that subclasses MAY optionally override without being forced to.',
      },
    ],
    quiz: {
      question: 'Why is the Template Method in the base class often marked `final` (in Java/C++)?',
      options: [
        {
          id: 'a',
          text: 'To prevent subclasses from altering the guaranteed sequence of invariant algorithm steps',
          isCorrect: true,
          explanation: 'Correct! Subclasses should only customize the designated hook steps, not break the pipeline order.',
        },
        {
          id: 'b',
          text: 'To prevent anyone from creating subclasses at all',
          isCorrect: false,
          explanation: 'Making the class final would block subclassing; making only the template method final locks the skeleton.',
        },
        {
          id: 'c',
          text: 'To turn the class into a Singleton',
          isCorrect: false,
          explanation: 'Final methods are unrelated to Singleton.',
        },
        {
          id: 'd',
          text: 'To avoid using RAM on the Heap',
          isCorrect: false,
          explanation: 'Final controls overriding, not Heap allocation.',
        },
      ],
    },
  },

  // ==========================================================================
  // BEHAVIORAL: ITERATOR & MEDIATOR PATTERNS
  // ==========================================================================
  {
    id: 'pattern-iterator-mediator',
    track: 'behavioral',
    trackLabel: 'Behavioral Patterns',
    title: 'Iterator & Mediator Patterns (Uniform Traversal & Hub Decoupling)',
    shortTitle: 'Iterator & Mediator',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Iterator traverses any data structure sequentially without exposing its internal layout; Mediator replaces tangled N×N many-to-many object references with a single central coordinator.',
    realWorldAnalogy:
      'Iterator is a TV "Next Channel" button—it works the same whether channels are stored in an array, tree, or satellite stream. Mediator is an Air Traffic Control Tower: 20 airplanes never radio each other directly; they all talk through 1 tower.',
    whyItMatters:
      'Iterator powers `for..of`, Python generators, and paginated API cursors. Mediator tames complex UI forms, chat rooms, and microservice orchestrators where N components would otherwise need N(N-1)/2 links.',
    keyTakeaways: [
      'Iterator: Separates traversal state (current pointer/stack) from the collection itself, allowing multiple simultaneous traversals.',
      'Mediator: Reduces N×(N-1)/2 chaotic peer-to-peer dependencies down to N clean connections to one hub.',
      'Watch out: Don’t let the Mediator turn into an unmaintainable "God Object"—keep each colleague responsible for its own domain state.',
    ],
    commonMistakes: [
      'Modifying a collection while iterating over it without fail-fast checks or snapshot iteration (ConcurrentModificationException).',
      'Dumping all business logic into a Mediator instead of keeping it strictly as a coordination router.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'ITERATOR · HIDDEN STRUCTURE',
        title: 'Client Uses hasNext() / next() — Blind to Tree vs Graph Internals',
        caption:
          'Whether iterating a Binary Tree (in-order stack) or a paginated DB cursor, the client writes one clean loop.',
        nodes: [
          {
            id: 'cli',
            label: 'ReportPrinter',
            sublabel: 'while (it.hasNext())',
            x: 16,
            y: 50,
            kind: 'client',
            state: 'active',
          },
          {
            id: 'it',
            label: '«Iterator» Cursor',
            sublabel: 'hasNext() / next()',
            x: 50,
            y: 50,
            kind: 'interface',
            state: 'highlight',
            fields: ['stack: [Node5, Node8]'],
          },
          {
            id: 'col',
            label: 'BinarySearchTree',
            sublabel: 'Private nodes hidden',
            x: 84,
            y: 50,
            kind: 'object',
            state: 'success',
          },
        ],
        edges: [
          { from: 'cli', to: 'it', label: 'next() -> 5', style: 'call', active: true },
          { from: 'it', to: 'col', label: 'reads internal', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Exposed Tree Pointers', value: 'None (encapsulated)', tone: 'good' },
          { key: 'Multiple Cursors', value: 'Supported independently', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'MEDIATOR · HUB TOPOLOGY',
        title: 'Air Traffic Control Tower Replaces N×N Mesh With Star Hub',
        caption:
          'Flight A, B, and C only notify the ATC Mediator. ATC coordinates runway locks without planes knowing about each other.',
        nodes: [
          {
            id: 'f1',
            label: 'Flight AA-101',
            sublabel: 'Requests Landing',
            x: 18,
            y: 26,
            kind: 'object',
            state: 'active',
          },
          {
            id: 'f2',
            label: 'Flight UA-204',
            sublabel: 'Holding Pattern',
            x: 18,
            y: 76,
            kind: 'object',
            state: 'idle',
          },
          {
            id: 'atc',
            label: 'ATC Tower (Mediator)',
            sublabel: 'Runway Coordinator',
            x: 54,
            y: 50,
            kind: 'gate',
            state: 'highlight',
            fields: ['runwayFree: true'],
          },
          {
            id: 'f3',
            label: 'Ground Crew',
            sublabel: 'Prepares Gate B4',
            x: 86,
            y: 50,
            kind: 'object',
            state: 'success',
          },
        ],
        edges: [
          { from: 'f1', to: 'atc', label: 'requestLand()', style: 'call', active: true },
          { from: 'atc', to: 'f2', label: 'hold()', style: 'call', active: true },
          { from: 'atc', to: 'f3', label: 'prepGate()', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Connections (10 planes)', value: '10 (vs 45 N×N mesh!)', tone: 'good' },
          { key: 'Plane-to-Plane Coupling', value: 'Zero direct refs', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Tangled Many-to-Many Peer References',
      goodLabel: 'Central ChatRoom Mediator + Clean Iterator',
      explanation:
        'Users never hold references to every other User—they only know the ChatMediator. Meanwhile, custom collections expose a uniform Iterator so callers never touch internal storage.',
      python: {
        bad: `# N×N spaghetti: every User stores & notifies every peer directly
class User:
    def send(self, msg, peers):
        for p in peers:
            p.receive(msg)  # Tightly coupled!`,
        good: `class ChatRoomMediator:
    def __init__(self):
        self._users: list["User"] = []
    def join(self, user: "User"):
        self._users.append(user)
    def broadcast(self, sender: str, msg: str):
        for u in self._users:
            if u.name != sender:
                u.receive(sender, msg)

class User:
    def __init__(self, name: str, room: ChatRoomMediator):
        self.name, self.room = name, room
        room.join(self)
    def send(self, msg: str):
        self.room.broadcast(self.name, msg)
    def receive(self, sender: str, msg: str):
        print(f"{self.name} got from {sender}: {msg}")`,
      },
      java: {
        bad: `// Every UI widget directly calls 5 sibling widgets on change`,
        good: `interface ChatMediator {
    void send(String msg, User sender);
    void addUser(User user);
}

class ChatRoom implements ChatMediator {
    private final List<User> users = new ArrayList<>();
    public void addUser(User u) { users.add(u); }
    public void send(String msg, User sender) {
        for (User u : users) {
            if (u != sender) u.receive(msg);
        }
    }
}`,
      },
      typescript: {
        bad: `// Checkbox directly mutates SubmitButton, Tooltip, and PriceInput`,
        good: `interface Mediator {
  notify(sender: string, event: string): void;
}

class CheckoutDialogMediator implements Mediator {
  notify(sender: string, event: string) {
    if (sender === 'GiftCheckbox' && event === 'checked') {
      // Coordinate GiftMessageInput + WrapFee cleanly in one place
    }
  }
}`,
      },
    },
    interviewQa: [
      {
        question: 'How does Mediator differ from Observer?',
        answer:
          'Observer is one-to-many dynamic pub/sub where subjects broadcast events to independent subscribers. Mediator centralizes complex multi-way interaction rules between peers (like a flight tower or checkout dialog) so peers never talk directly.',
      },
      {
        question: 'How do you implement a lazy Iterator over a Binary Search Tree in O(H) memory?',
        answer:
          'Push the leftmost spine onto an explicit Stack. On `next()`, pop the top node, push the leftmost spine of its right subtree, and return the popped value. Amortized O(1) per step and O(H) space!',
      },
    ],
    quiz: {
      question: 'An enterprise checkout form has 8 interactive widgets (coupon box, country dropdown, tax field, gift wrap toggle, submit button) that all affect each other. Which pattern eliminates the tangled 8×8 dependency web?',
      options: [
        {
          id: 'a',
          text: 'Mediator Pattern (a CheckoutFormMediator coordinates widget events)',
          isCorrect: true,
          explanation: 'Correct! Widgets notify only the Mediator, turning an N×N spiderweb into clean N-to-1 coordination.',
        },
        {
          id: 'b',
          text: 'Prototype Pattern',
          isCorrect: false,
          explanation: 'Prototype clones objects rather than coordinating peer interactions.',
        },
        {
          id: 'c',
          text: 'Flyweight Pattern',
          isCorrect: false,
          explanation: 'Flyweight shares immutable data to save RAM.',
        },
        {
          id: 'd',
          text: 'Factory Method',
          isCorrect: false,
          explanation: 'Factory Method handles object creation, not runtime peer coordination.',
        },
      ],
    },
  },
];
