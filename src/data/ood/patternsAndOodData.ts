import type { OodConcept } from './oodTypes';

export const PATTERNS_AND_OOD_CONCEPTS: OodConcept[] = [
  // ==========================================================================
  // TRACK 3: ESSENTIAL GoF DESIGN PATTERNS (7 Topics)
  // ==========================================================================
  {
    id: 'pattern-factory',
    track: 'creational',
    trackLabel: 'Creational Patterns',
    title: 'Factory Method & Abstract Factory',
    shortTitle: 'Factory Pattern',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Centralize complex object creation behind a Factory method so callers request an abstraction without calling `new ConcreteClass()` everywhere.',
    realWorldAnalogy:
      'You tell a logistics dispatcher "deliver this package across the ocean"—the dispatcher decides whether to instantiate a Ship, CargoPlane, or Truck.',
    whyItMatters:
      'Isolates constructor arguments, env-based selection, and object pooling in ONE factory instead of repeating `if (env == ...)` across 15 services.',
    keyTakeaways: [
      'Simple/Factory Method creates ONE product type (NotificationFactory -> Email/SMS/Push).',
      'Abstract Factory creates FAMILIES of matching products (DarkThemeFactory -> DarkButton + DarkInput).',
      'Pairs naturally with Open/Closed Principle by registering creators in a map.',
    ],
    commonMistakes: [
      'Wrapping trivial `new Point(x, y)` in a factory when there is only one concrete class.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · REQUEST',
        title: 'Client Asks NotificationFactory for "SMS"',
        caption:
          'AlertService asks NotificationFactory.create("sms") without importing SmsSender or knowing its Twilio API keys.',
        nodes: [
          { id: 'cli', label: 'AlertService', sublabel: 'create("sms")', x: 18, y: 50, kind: 'client', state: 'active' },
          { id: 'fac', label: 'NotificationFactory', sublabel: 'Creation Dispatcher', x: 52, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'sms', label: 'SmsNotifier', sublabel: 'Twilio config wired', x: 84, y: 26, kind: 'class', state: 'idle' },
          { id: 'mail', label: 'EmailNotifier', sublabel: 'SMTP config wired', x: 84, y: 74, kind: 'class', state: 'idle' },
        ],
        edges: [
          { from: 'cli', to: 'fac', label: 'create("sms")', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Caller Imports', value: 'Notifier interface only', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · INSTANTIATE',
        title: 'Factory Constructs & Configures Concrete SmsNotifier',
        caption:
          'The factory looks up "sms" in its registry, injects credentials, and returns the instance typed as «interface» Notifier.',
        nodes: [
          { id: 'cli', label: 'AlertService', sublabel: 'Receives Notifier', x: 18, y: 50, kind: 'client', state: 'success' },
          { id: 'fac', label: 'NotificationFactory', sublabel: 'Built SmsNotifier', x: 52, y: 50, kind: 'gate', state: 'success' },
          { id: 'sms', label: 'SmsNotifier', sublabel: 'Returned as Notifier', x: 84, y: 26, kind: 'object', state: 'success' },
          { id: 'mail', label: 'EmailNotifier', sublabel: 'Unused', x: 84, y: 74, kind: 'class', state: 'idle' },
        ],
        edges: [
          { from: 'fac', to: 'sms', label: 'new SmsNotifier()', style: 'call', active: true },
          { from: 'sms', to: 'cli', label: 'returns Notifier', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Returned Type', value: 'Notifier (Abstraction)', tone: 'good' },
          { key: 'Runtime Instance', value: 'SmsNotifier', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Scattered Creation Conditionals',
      goodLabel: 'Registry-Backed Factory',
      explanation:
        'A map-backed Factory centralizes instantiation and lets new channels register without editing callers.',
      python: {
        bad: `# Repeated in 10 controllers:\nif channel == "sms": n = SmsNotifier(TWILIO_KEY)\nelif channel == "email": n = EmailNotifier(SMTP_URL)`,
        good: `CREATORS = {"sms": SmsNotifier, "email": EmailNotifier}\n\ndef create_notifier(channel: str) -> Notifier:\n    cls = CREATORS.get(channel)\n    if not cls: raise ValueError(f"Unknown channel {channel}")\n    return cls()`,
      },
      java: {
        bad: `Notifier n = channel.equals("sms") ? new SmsNotifier() : new EmailNotifier();`,
        good: `class NotifierFactory {\n    private static final Map<String, Supplier<Notifier>> REG = Map.of(\n        "sms", SmsNotifier::new, "email", EmailNotifier::new\n    );\n    static Notifier create(String ch) {\n        return Optional.ofNullable(REG.get(ch)).orElseThrow().get();\n    }\n}`,
      },
      typescript: {
        bad: `const n = ch === 'sms' ? new SmsNotifier() : new EmailNotifier();`,
        good: `const registry: Record<string, () => Notifier> = {\n  sms: () => new SmsNotifier(),\n  email: () => new EmailNotifier(),\n};\nexport const createNotifier = (ch: string) => registry[ch]();`,
      },
    },
    interviewQa: [
      {
        question: 'Factory Method vs Abstract Factory — what is the difference?',
        answer:
          'Factory Method creates ONE product via a method/subclass. Abstract Factory creates a FAMILY of related objects guaranteed to match each other (e.g., PostgresConnection + PostgresCommand).',
      },
    ],
    quiz: {
      question: 'When is the Factory pattern most useful?',
      options: [
        { id: 'a', text: 'When the concrete class to instantiate is decided dynamically at runtime based on config or input', isCorrect: true, explanation: 'Correct! Factories decouple callers from knowing which concrete subclass to construct.' },
        { id: 'b', text: 'When an object has 1 field and no subclasses', isCorrect: false, explanation: 'Direct constructor call is simpler (KISS).' },
        { id: 'c', text: 'To enforce only 1 instance globally', isCorrect: false, explanation: 'That is Singleton.' },
        { id: 'd', text: 'To broadcast events to subscribers', isCorrect: false, explanation: 'That is Observer.' },
      ],
    },
  },

  {
    id: 'pattern-builder',
    track: 'creational',
    trackLabel: 'Creational Patterns',
    title: 'Builder Pattern (Fluent Step-by-Step Assembly)',
    shortTitle: 'Builder Pattern',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Construct complex immutable objects with many optional parameters step-by-step instead of confusing 10-argument constructors.',
    realWorldAnalogy:
      'Ordering a custom Subway sandwich: choose bread, add protein, optionally add cheese/veggies/sauce, then finalize `.build()`.',
    whyItMatters:
      'Eliminates "telescoping constructors" like `new HttpRequest(url, "POST", null, null, 3000, true, false)` where swapping two booleans causes silent production bugs.',
    keyTakeaways: [
      'Each fluent setter returns `this`, allowing readable chaining.',
      'Calling `.build()` validates cross-field invariants once and returns a clean, immutable final object.',
      'Widely used in Java (`StringBuilder`, `HttpRequest.newBuilder()`), query builders, and test data fixtures.',
    ],
    commonMistakes: [
      'Forgetting to validate required fields inside `.build()`.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · TELESCOPING ARGS',
        title: 'Unreadable 7-Parameter Constructor',
        caption:
          'new HttpReq("https://api", "POST", null, 5000, true, false, 3) — What is true? What is false? Easy to swap arguments by mistake!',
        nodes: [
          { id: 'bad', label: 'new HttpReq(url, "POST", null, 5000, true, false, 3)', sublabel: 'Positional ambiguity!', x: 50, y: 50, kind: 'broken', state: 'error' },
        ],
        edges: [],
        stateWatch: [
          { key: 'Readability', value: 'Poor (magic booleans)', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · FLUENT ASSEMBLY',
        title: 'Chain Named Optional Steps on Builder',
        caption:
          'HttpRequestBuilder collects url, timeout(5000), and retries(3) cleanly with self-documenting names.',
        nodes: [
          { id: 'b', label: 'HttpRequestBuilder', sublabel: 'Collecting config...', x: 26, y: 50, kind: 'gate', state: 'highlight', fields: ['.url("/orders")', '.timeout(5000)', '.retries(3)'] },
          { id: 'out', label: 'HttpRequest (Immutable)', sublabel: 'Validated on .build()', x: 78, y: 50, kind: 'object', state: 'success', fields: ['frozen & valid!'] },
        ],
        edges: [
          { from: 'b', to: 'out', label: '.build() validates & freezes', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Immutability', value: 'Frozen final object', tone: 'good' },
          { key: 'Self-Documenting', value: '100% Clear', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Telescoping Positional Constructor',
      goodLabel: 'Fluent Validated Builder',
      explanation:
        'Builder turns cryptic positional arguments into readable named calls and validates invariants on build().',
      python: {
        bad: `req = HttpRequest("/pay", "POST", None, 5000, True, False, 3)`,
        good: `class HttpRequestBuilder:\n    def __init__(self, url: str):\n        self._url, self._timeout, self._retries = url, 3000, 0\n    def timeout(self, ms: int): self._timeout = ms; return self\n    def retries(self, n: int): self._retries = n; return self\n    def build(self) -> HttpRequest:\n        return HttpRequest(self._url, self._timeout, self._retries)`,
      },
      java: {
        bad: `new HttpReq("/pay", "POST", null, 5000, true, false, 3);`,
        good: `HttpReq req = new HttpReq.Builder("/pay")\n    .method("POST")\n    .timeoutMs(5000)\n    .retries(3)\n    .build();`,
      },
      typescript: {
        bad: `new HttpReq('/pay', 'POST', undefined, 5000, true, false, 3);`,
        good: `const req = new HttpReqBuilder('/pay')\n  .method('POST')\n  .timeoutMs(5000)\n  .retries(3)\n  .build();`,
      },
    },
    interviewQa: [
      {
        question: 'When should you prefer Builder over plain options objects (in TypeScript/Python)?',
        answer:
          'When construction requires multi-step conditional logic, cross-field validation, or step-by-step accumulation across functions before freezing an immutable object.',
      },
    ],
    quiz: {
      question: 'What key problem does the Builder pattern solve?',
      options: [
        { id: 'a', text: 'Telescoping constructors with many optional parameters while keeping the final object immutable', isCorrect: true, explanation: 'Correct! Builder separates step-by-step configuration from the immutable product.' },
        { id: 'b', text: 'Sharing one global instance across threads', isCorrect: false, explanation: 'That is Singleton.' },
        { id: 'c', text: 'Wrapping incompatible legacy APIs', isCorrect: false, explanation: 'That is Adapter.' },
        { id: 'd', text: 'Notifying observers of state changes', isCorrect: false, explanation: 'That is Observer.' },
      ],
    },
  },

  {
    id: 'pattern-singleton',
    track: 'creational',
    trackLabel: 'Creational Patterns',
    title: 'Thread-Safe Singleton & Double-Checked Locking',
    shortTitle: 'Singleton',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Guarantee a class has at most ONE shared instance across the entire process with a global access point—safely synchronized under multithreading.',
    realWorldAnalogy:
      'An airport has exactly ONE Air Traffic Control Tower coordinating every runway. Two separate towers with conflicting state would cause collisions.',
    whyItMatters:
      'Essential for database connection pools, config registries, and logger sinks—AND interviewers love testing thread-safety (volatile + double-checked locking) and testability tradeoffs.',
    keyTakeaways: [
      'Private constructor prevents external `new Singleton()`.',
      'Naive `if (instance == null) instance = new ...` fails under concurrency: 2 threads pass the check simultaneously and create 2 objects!',
      'Prefer Dependency Injection singleton scope (1 shared instance injected via DI) over static `Singleton.getInstance()` to keep unit testing easy.',
    ],
    commonMistakes: [
      'Omitting `volatile` in Java Double-Checked Locking (instruction reordering can expose a half-constructed object!).',
      'Using Singleton as a disguised global mutable bag, breaking parallel tests.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'RACE CONDITION (UNSAFE)',
        title: 'Two Threads Enter Naive getInstance() Simultaneously',
        caption:
          'Thread A and Thread B both see instance == null at the same microsecond and allocate TWO separate connection pools!',
        nodes: [
          { id: 't1', label: 'Thread A', sublabel: 'sees null -> new Pool()', x: 20, y: 26, kind: 'client', state: 'error' },
          { id: 't2', label: 'Thread B', sublabel: 'sees null -> new Pool()', x: 20, y: 74, kind: 'client', state: 'error' },
          { id: 'p1', label: 'Pool #1', sublabel: 'Duplicate!', x: 80, y: 26, kind: 'broken', state: 'error' },
          { id: 'p2', label: 'Pool #2', sublabel: 'Duplicate!', x: 80, y: 74, kind: 'broken', state: 'error' },
        ],
        edges: [
          { from: 't1', to: 'p1', label: 'alloc #1', style: 'blocked', active: true },
          { from: 't2', to: 'p2', label: 'alloc #2', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Instances Created', value: '2 (BUG!)', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'THREAD-SAFE LOCK',
        title: 'Double-Checked Locking Guards First Creation Only',
        caption:
          'Thread A acquires mutex, checks null again, creates volatile Pool #1. Thread B enters lock, sees Pool #1 exists, and reuses it. Future calls skip the lock!',
        nodes: [
          { id: 't1', label: 'Thread A', sublabel: 'Acquires Lock', x: 18, y: 28, kind: 'client', state: 'success' },
          { id: 't2', label: 'Thread B', sublabel: 'Waits -> Reuses', x: 18, y: 72, kind: 'client', state: 'active' },
          { id: 'lock', label: 'Mutex + volatile', sublabel: 'Double-Check Gate', x: 52, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'pool', label: 'Single Pool @ 0x9F0', sublabel: 'Exactly 1 Instance', x: 85, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 't1', to: 'lock', label: 'lock', style: 'call', active: true },
          { from: 't2', to: 'lock', label: 'waits', style: 'dashed', active: true },
          { from: 'lock', to: 'pool', label: 'returns 0x9F0', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Instances Created', value: '1 (Guaranteed)', tone: 'good' },
          { key: 'Steady-State Lock Cost', value: '0 (Fast Path)', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Thread-Unsafe Lazy Singleton',
      goodLabel: 'Thread-Safe Double-Checked / Holder Pattern',
      explanation:
        'Use synchronization + volatile (or JVM Bill Pugh static holder / Python Lock) so only one instance can ever be created.',
      python: {
        bad: `class Pool:\n    _inst = None\n    @classmethod\n    def get(cls):\n        if cls._inst is None: cls._inst = cls()  # Race!\n        return cls._inst`,
        good: `import threading\nclass Pool:\n    _inst = None\n    _lock = threading.Lock()\n    @classmethod\n    def get(cls):\n        if cls._inst is None:\n            with cls._lock:\n                if cls._inst is None: cls._inst = cls()\n        return cls._inst`,
      },
      java: {
        bad: `class Pool {\n    private static Pool inst;\n    static Pool get() {\n        if (inst == null) inst = new Pool(); // Race!\n        return inst;\n    }\n}`,
        good: `class Pool {\n    private Pool() {}\n    private static class Holder { static final Pool INST = new Pool(); }\n    public static Pool get() { return Holder.INST; } // Thread-safe & lazy!\n}`,
      },
      typescript: {
        bad: `export let pool: Pool; // Anyone can overwrite`,
        good: `class Pool {\n  private static instance: Pool | null = null;\n  private constructor() {}\n  static getInstance(): Pool {\n    if (!Pool.instance) Pool.instance = new Pool();\n    return Pool.instance;\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Why is Singleton sometimes considered an anti-pattern?',
        answer:
          'Static `Singleton.getInstance()` hides dependencies and carries global state between unit tests. Modern apps prefer registering one shared instance inside a Dependency Injection container instead.',
      },
    ],
    quiz: {
      question: 'In Java Double-Checked Locking, why MUST the static instance field be marked `volatile`?',
      options: [
        { id: 'a', text: 'To prevent CPU/compiler instruction reordering from exposing a partially initialized object to another thread', isCorrect: true, explanation: 'Correct! Without volatile, another thread could read a non-null reference before the constructor finishes.' },
        { id: 'b', text: 'To allow garbage collection every second', isCorrect: false, explanation: 'volatile governs visibility and memory barriers, not GC frequency.' },
        { id: 'c', text: 'To make the constructor public', isCorrect: false, explanation: 'Constructors stay private in Singleton.' },
        { id: 'd', text: 'To create one instance per thread', isCorrect: false, explanation: 'That would be ThreadLocal, not Singleton.' },
      ],
    },
  },

  {
    id: 'pattern-adapter-facade',
    track: 'structural',
    trackLabel: 'Structural Patterns',
    title: 'Adapter & Facade Structural Patterns',
    shortTitle: 'Adapter & Facade',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Adapter translates one incompatible interface into the interface your app expects; Facade hides a complex multi-service subsystem behind one simple entry method.',
    realWorldAnalogy:
      'Adapter = a US-to-EU travel power plug converter. Facade = a hotel concierge who books your taxi, dinner, and museum tickets from ONE phone call.',
    whyItMatters:
      'Adapter lets you integrate legacy XML/third-party SDKs cleanly without polluting your domain models; Facade keeps controllers thin and readable.',
    keyTakeaways: [
      'Adapter changes the SHAPE of an existing interface to match a target contract (1-to-1 translation).',
      'Facade SIMPLIFIES a complex workflow across 4–6 subsystems into 1 clean high-level API.',
      'Both protect core domain code from third-party or subsystem churn.',
    ],
    commonMistakes: [
      'Confusing Adapter (interface translation) with Decorator (adding new behavior while keeping the same interface).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'ADAPTER · TRANSLATE',
        title: 'Adapter Bridges Incompatible Legacy SDK',
        caption:
          'App calls analytics.track(event). LegacyXmlTracker only understands sendXml("<e/>"). XmlAnalyticsAdapter translates cleanly between them!',
        nodes: [
          { id: 'app', label: 'App Code', sublabel: 'track({ name })', x: 16, y: 50, kind: 'client', state: 'active' },
          { id: 'adp', label: 'XmlAnalyticsAdapter', sublabel: 'JSON -> XML bridge', x: 50, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'leg', label: 'LegacyXmlTracker', sublabel: 'sendXml("<event/>")', x: 84, y: 50, kind: 'class', state: 'success' },
        ],
        edges: [
          { from: 'app', to: 'adp', label: 'track(json)', style: 'call', active: true },
          { from: 'adp', to: 'leg', label: 'sendXml(xml)', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Legacy Code Edited', value: '0 lines', tone: 'good' },
          { key: 'App Code Polluted', value: '0 XML imports', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'FACADE · SIMPLIFY',
        title: 'CheckoutFacade Orchestrates 3 Subsystems in 1 Call',
        caption:
          'Instead of making UI/Controllers coordinate Inventory + Payment + Shipping directly, CheckoutFacade.placeOrder() handles all three cleanly.',
        nodes: [
          { id: 'cli', label: 'OrderController', sublabel: 'facade.placeOrder()', x: 16, y: 50, kind: 'client', state: 'active' },
          { id: 'fac', label: 'CheckoutFacade', sublabel: 'Single Clean Entry', x: 48, y: 50, kind: 'interface', state: 'highlight' },
          { id: 's1', label: 'InventorySvc', sublabel: 'reserve()', x: 84, y: 20, kind: 'object', state: 'success' },
          { id: 's2', label: 'PaymentSvc', sublabel: 'charge()', x: 84, y: 50, kind: 'object', state: 'success' },
          { id: 's3', label: 'ShippingSvc', sublabel: 'dispatch()', x: 84, y: 80, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'cli', to: 'fac', label: '1 simple call', style: 'call', active: true },
          { from: 'fac', to: 's1', label: '1', style: 'solid', active: true },
          { from: 'fac', to: 's2', label: '2', style: 'solid', active: true },
          { from: 'fac', to: 's3', label: '3', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Caller Complexity', value: '1 method call', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Calling Legacy XML Directly Everywhere',
      goodLabel: 'Clean Adapter Wrapper',
      explanation:
        'Wrap the incompatible third-party library once inside an Adapter that implements your clean internal interface.',
      python: {
        bad: `# Domain code manually builds XML strings:\nlegacy.send_xml(f"<event>{name}</event>")`,
        good: `class XmlAnalyticsAdapter(Analytics):\n    def __init__(self, legacy: LegacyXmlTracker): self._legacy = legacy\n    def track(self, name: str) -> None:\n        self._legacy.send_xml(f"<event>{name}</event>")`,
      },
      java: {
        bad: `legacy.sendXml("<event>" + name + "</event>");`,
        good: `class XmlAnalyticsAdapter implements Analytics {\n    private final LegacyXmlTracker legacy;\n    XmlAnalyticsAdapter(LegacyXmlTracker l) { this.legacy = l; }\n    public void track(String name) { legacy.sendXml("<event>" + name + "</event>"); }\n}`,
      },
      typescript: {
        bad: `legacy.sendXml(\`<event>\${name}</event>\`);`,
        good: `class XmlAnalyticsAdapter implements Analytics {\n  constructor(private legacy: LegacyXmlTracker) {}\n  track(name: string) { this.legacy.sendXml(\`<event>\${name}</event>\`); }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Adapter vs Facade — how do you explain the difference in one sentence?',
        answer:
          'Adapter makes an incompatible interface match an existing contract; Facade invents a brand-new simplified interface over a complex group of subsystems.',
      },
    ],
    quiz: {
      question: 'You must integrate a legacy SOAP billing library into a modern REST service expecting `BillingPort.charge()`. Which pattern fits best?',
      options: [
        { id: 'a', text: 'Adapter Pattern', isCorrect: true, explanation: 'Correct! Adapter translates your BillingPort contract into the legacy SOAP calls.' },
        { id: 'b', text: 'Observer Pattern', isCorrect: false, explanation: 'Observer is for pub-sub event notifications.' },
        { id: 'c', text: 'Builder Pattern', isCorrect: false, explanation: 'Builder is for complex multi-step construction.' },
        { id: 'd', text: 'State Pattern', isCorrect: false, explanation: 'State models finite state transitions.' },
      ],
    },
  },

  {
    id: 'pattern-decorator',
    track: 'structural',
    trackLabel: 'Structural Patterns',
    title: 'Decorator Pattern (Dynamic Runtime Layering)',
    shortTitle: 'Decorator Pattern',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Wrap an object in stackable layers that share the exact same interface, adding cross-cutting behaviors (Caching, Logging, Retries, Compression) dynamically at runtime.',
    realWorldAnalogy:
      'Wearing clothes for winter: T-shirt → Sweater → Rain Jacket. Each layer wraps the previous one without changing who you are, and you can stack or remove layers dynamically.',
    whyItMatters:
      'Powers Java `BufferedInputStream(GZIPInputStream(FileInputStream))`, HTTP middleware, and caching/retry wrappers—avoiding subclass combinations like `CachedLoggedRetryingHttpClient`.',
    keyTakeaways: [
      'A Decorator BOTH implements the target interface AND holds a reference to an inner instance of that same interface.',
      'Order of wrapping matters! `Retry(Timeout(HttpClient))` retries timed-out requests; `Timeout(Retry(HttpClient))` bounds total retry time.',
      'Follows Open/Closed Principle: add Logging or Metrics without touching core HttpClient.',
    ],
    commonMistakes: [
      'Stacking 8 invisible decorators so debugging stack traces becomes confusing.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · LAYERED PIPELINE',
        title: 'Request Enters Logging -> Cache -> HttpClient Stack',
        caption:
          'Caller invokes client.fetch("/users"). Each decorator runs its before-hook and delegates inward to the next layer.',
        nodes: [
          { id: 'cli', label: 'Service', sublabel: 'fetch("/users")', x: 12, y: 50, kind: 'client', state: 'active' },
          { id: 'log', label: 'LoggingDecorator', sublabel: 'Logs start & latency', x: 37, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'cac', label: 'CacheDecorator', sublabel: 'Cache MISS -> forward', x: 63, y: 50, kind: 'gate', state: 'active' },
          { id: 'core', label: 'RealHttpClient', sublabel: 'GET /users -> 200 OK', x: 88, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'cli', to: 'log', label: '1', style: 'call', active: true },
          { from: 'log', to: 'cac', label: '2', style: 'call', active: true },
          { from: 'cac', to: 'core', label: '3', style: 'call', active: true },
        ],
        stateWatch: [
          { key: '1st Call', value: 'Cache MISS -> Network', tone: 'neutral' },
          { key: 'RealHttpClient Edits', value: '0 lines', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · SHORT-CIRCUIT HIT',
        title: 'Second Call Hits CacheDecorator Immediately',
        caption:
          'CacheDecorator serves the cached response in 0.2ms without waking RealHttpClient, while LoggingDecorator still logs latency!',
        nodes: [
          { id: 'cli', label: 'Service', sublabel: 'fetch("/users")', x: 12, y: 50, kind: 'client', state: 'success' },
          { id: 'log', label: 'LoggingDecorator', sublabel: 'Logged: 0.2ms', x: 37, y: 50, kind: 'gate', state: 'success' },
          { id: 'cac', label: 'CacheDecorator', sublabel: 'CACHE HIT!', x: 63, y: 50, kind: 'gate', state: 'success' },
          { id: 'core', label: 'RealHttpClient', sublabel: 'Skipped (Saved!)', x: 88, y: 50, kind: 'object', state: 'idle' },
        ],
        edges: [
          { from: 'cli', to: 'log', label: '1', style: 'call', active: true },
          { from: 'log', to: 'cac', label: '2 HIT', style: 'call', active: true },
        ],
        stateWatch: [
          { key: '2nd Call', value: '0.2ms Cache Hit', tone: 'good' },
          { key: 'Subclasses Created', value: '0 combo classes', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Subclass Explosion for Combinations',
      goodLabel: 'Composable Runtime Decorators',
      explanation:
        'Wrapping a base DataSource with CacheDecorator and LoggingDecorator composes any combination dynamically.',
      python: {
        bad: `class CachedHttpClient(HttpClient): ...\nclass LoggedCachedHttpClient(CachedHttpClient): ...\nclass RetryingLoggedCachedHttpClient(...): ...`,
        good: `class CacheDecorator(Fetcher):\n    def __init__(self, inner: Fetcher):\n        self._inner, self._cache = inner, {}\n    def fetch(self, url: str) -> str:\n        if url not in self._cache:\n            self._cache[url] = self._inner.fetch(url)\n        return self._cache[url]`,
      },
      java: {
        bad: `class LoggedCachedRetryingClient extends CachedClient { /* rigid! */ }`,
        good: `class CacheDecorator implements Fetcher {\n    private final Fetcher inner;\n    private final Map<String, String> cache = new HashMap<>();\n    CacheDecorator(Fetcher inner) { this.inner = inner; }\n    public String fetch(String url) { return cache.computeIfAbsent(url, inner::fetch); }\n}`,
      },
      typescript: {
        bad: `class LoggedCachedClient extends CachedClient { /* rigid */ }`,
        good: `class CacheDecorator implements Fetcher {\n  private cache = new Map<string, string>();\n  constructor(private inner: Fetcher) {}\n  async fetch(url: string) {\n    if (!this.cache.has(url)) this.cache.set(url, await this.inner.fetch(url));\n    return this.cache.get(url)!;\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Decorator vs Proxy — they look almost identical in UML, so what is the difference?',
        answer:
          'Intent! Decorator adds or stacks new behavioral layers dynamically (chosen by the caller). Proxy controls access to a subject (lazy loading, auth guard, remote RPC) while usually hiding the real subject from the caller.',
      },
    ],
    quiz: {
      question: 'Which statement is true about the Decorator pattern?',
      options: [
        { id: 'a', text: 'A decorator implements the same interface as the object it wraps so layers can be stacked arbitrarily', isCorrect: true, explanation: 'Correct! Sharing the same interface makes decorators transparent and stackable.' },
        { id: 'b', text: 'Decorators change the method signature to an incompatible interface', isCorrect: false, explanation: 'Changing the interface is the Adapter pattern.' },
        { id: 'c', text: 'Only one decorator can wrap an object at a time', isCorrect: false, explanation: 'Multiple decorators can wrap each other like Russian nesting dolls.' },
        { id: 'd', text: 'Decorators require static methods', isCorrect: false, explanation: 'Decorators rely on instance composition and polymorphism.' },
      ],
    },
  },

  {
    id: 'pattern-strategy',
    track: 'behavioral',
    trackLabel: 'Behavioral Patterns',
    title: 'Strategy Pattern (Swappable Algorithm Cartridges)',
    shortTitle: 'Strategy Pattern',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Encapsulate a family of interchangeable algorithms behind one interface so the host Context can swap strategies at runtime.',
    realWorldAnalogy:
      'Google Maps Navigation is the Context; Driving, Walking, Transit, and Cycling are swappable Route Strategies you toggle with one tap.',
    whyItMatters:
      'The #1 most asked behavioral pattern in Low-Level OOD interviews (Parking Fee Strategy, Eviction Strategy in Cache, Surge Pricing Strategy, Sorting Strategy).',
    keyTakeaways: [
      'Context delegates the variable part of its job to a Strategy interface.',
      'Strategies can be swapped mid-flight (e.g., switching from NormalPricing to SurgePricing during peak hours).',
      'Directly implements Open/Closed Principle and Composition Over Inheritance.',
    ],
    commonMistakes: [
      'Creating a Strategy interface when there is only 1 algorithm that will never vary.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · CONTEXT + CARTRIDGE',
        title: 'Navigator Context Delegates to FastestRouteStrategy',
        caption:
          'Navigator does not contain Dijkstra or A* math itself—it calls currentStrategy.buildRoute(A, B).',
        nodes: [
          { id: 'ctx', label: 'Navigator (Context)', sublabel: 'strategy.route(A, B)', x: 20, y: 50, kind: 'object', state: 'highlight' },
          { id: 's1', label: 'DrivingStrategy', sublabel: 'Active (22 min)', x: 80, y: 24, kind: 'class', state: 'success' },
          { id: 's2', label: 'TransitStrategy', sublabel: 'Standby', x: 80, y: 52, kind: 'class', state: 'idle' },
          { id: 's3', label: 'WalkingStrategy', sublabel: 'Standby', x: 80, y: 80, kind: 'class', state: 'idle' },
        ],
        edges: [
          { from: 'ctx', to: 's1', label: 'active strategy', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Active Strategy', value: 'DrivingStrategy', tone: 'good' },
          { key: 'ETA', value: '22 min', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · HOT-SWAP',
        title: 'User Taps Transit -> Hot-Swap Without Restarting Context',
        caption:
          'Calling navigator.setStrategy(new TransitStrategy()) immediately swaps routing logic with zero conditional branches.',
        nodes: [
          { id: 'ctx', label: 'Navigator (Context)', sublabel: 'Same instance!', x: 20, y: 50, kind: 'object', state: 'success' },
          { id: 's1', label: 'DrivingStrategy', sublabel: 'Idle', x: 80, y: 24, kind: 'class', state: 'idle' },
          { id: 's2', label: 'TransitStrategy', sublabel: 'Swapped IN (31 min)', x: 80, y: 52, kind: 'class', state: 'success' },
          { id: 's3', label: 'WalkingStrategy', sublabel: 'Standby', x: 80, y: 80, kind: 'class', state: 'idle' },
        ],
        edges: [
          { from: 'ctx', to: 's2', label: 'hot-swapped!', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Active Strategy', value: 'TransitStrategy', tone: 'good' },
          { key: 'Navigator Edits', value: '0 lines', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Hard-Coded Algorithm Switch',
      goodLabel: 'Pluggable Strategy Context',
      explanation:
        'Each pricing or routing rule lives in its own clean Strategy class that can be swapped dynamically.',
      python: {
        bad: `def compute_fee(hours, mode):\n    if mode == "hourly": return hours * 5\n    elif mode == "flat": return 20`,
        good: `class FeeStrategy(ABC):\n    @abstractmethod def fee(self, hours: int) -> int: ...\n\nclass HourlyFee(FeeStrategy):\n    def fee(self, hours: int) -> int: return hours * 5\n\nclass FlatDayFee(FeeStrategy):\n    def fee(self, hours: int) -> int: return 20`,
      },
      java: {
        bad: `int fee(int hrs, String mode) { return mode.equals("FLAT") ? 20 : hrs * 5; }`,
        good: `interface FeeStrategy { int fee(int hours); }\nFeeStrategy hourly = h -> h * 5;\nFeeStrategy flat = h -> 20;`,
      },
      typescript: {
        bad: `const fee = (h: number, mode: string) => mode === 'flat' ? 20 : h * 5;`,
        good: `type FeeStrategy = (hours: number) => number;\nconst hourlyFee: FeeStrategy = (h) => h * 5;\nconst flatDayFee: FeeStrategy = () => 20;`,
      },
    },
    interviewQa: [
      {
        question: 'Strategy vs State Pattern — what distinguishes them?',
        answer:
          'In Strategy, the CLIENT chooses and swaps the algorithm from outside, and strategies don’t know about each other. In State, the OBJECT transitions itself automatically between states (e.g., Order: Pending -> Paid -> Shipped).',
      },
    ],
    quiz: {
      question: 'In a Cache design interview, you want to support LRU, LFU, and FIFO eviction policies cleanly. Which pattern is ideal?',
      options: [
        { id: 'a', text: 'Strategy Pattern (EvictionStrategy)', isCorrect: true, explanation: 'Correct! EvictionStrategy lets the Cache swap eviction rules cleanly.' },
        { id: 'b', text: 'Singleton Pattern', isCorrect: false, explanation: 'Singleton restricts instance count.' },
        { id: 'c', text: 'Adapter Pattern', isCorrect: false, explanation: 'Adapter translates incompatible third-party interfaces.' },
        { id: 'd', text: 'Flyweight Pattern', isCorrect: false, explanation: 'Flyweight shares immutable intrinsic memory.' },
      ],
    },
  },

  {
    id: 'pattern-observer-state',
    track: 'behavioral',
    trackLabel: 'Behavioral Patterns',
    title: 'Observer (Pub-Sub) & State Machine Patterns',
    shortTitle: 'Observer & State',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Observer broadcasts state changes to subscribed listeners without tight coupling; State Machine encapsulates behavior per lifecycle phase to eliminate giant status switches.',
    realWorldAnalogy:
      'Observer = subscribing to a YouTube channel (new video triggers instant push to all subscribers). State Machine = a traffic light where Green can ONLY transition to Yellow, never directly to Red.',
    whyItMatters:
      'Observer drives UI reactivity, Kafka/EventBus microservices, and stock tickers. State Machine drives Vending Machines, Order Lifecycles, and Elevator Controllers cleanly.',
    keyTakeaways: [
      'Observer decouples the Subject (OrderPlaced) from downstream side effects (Email, Analytics, LoyaltyPoints).',
      'Always provide `unsubscribe()` to avoid memory leaks ("lapsed listener" leak).',
      'State Pattern puts each state’s allowed transitions inside its own State class so invalid transitions (e.g. shipping a Cancelled order) are impossible.',
    ],
    commonMistakes: [
      'Forgetting to unsubscribe destroyed UI components from an Observer bus (memory leak).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'OBSERVER · BROADCAST',
        title: 'OrderPlaced Event Pulses to 3 Independent Subscribers',
        caption:
          'OrderService publishes ONE event. Emailer, Analytics, and LoyaltyService react independently—adding a 4th listener requires 0 edits to OrderService!',
        nodes: [
          { id: 'pub', label: 'OrderService (Subject)', sublabel: 'emit("ORDER_PAID")', x: 20, y: 50, kind: 'event', state: 'highlight' },
          { id: 's1', label: 'EmailListener', sublabel: 'Sends receipt', x: 80, y: 20, kind: 'object', state: 'success' },
          { id: 's2', label: 'AnalyticsListener', sublabel: 'Logs revenue', x: 80, y: 50, kind: 'object', state: 'success' },
          { id: 's3', label: 'LoyaltyListener', sublabel: '+100 points', x: 80, y: 80, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'pub', to: 's1', label: 'notify()', style: 'call', active: true },
          { from: 'pub', to: 's2', label: 'notify()', style: 'call', active: true },
          { from: 'pub', to: 's3', label: 'notify()', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Coupling', value: 'Loose (Event-Driven)', tone: 'good' },
          { key: 'Listeners Notified', value: '3', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STATE MACHINE · TRANSITIONS',
        title: 'Order Lifecycle Enforces Valid Transitions Only',
        caption:
          'Draft -> Paid -> Shipped -> Delivered. Calling ship() while in Draft is rejected cleanly by DraftState instead of messy boolean flags!',
        nodes: [
          { id: 'd', label: 'DraftState', sublabel: 'pay() allowed', x: 16, y: 50, kind: 'object', state: 'idle' },
          { id: 'p', label: 'PaidState', sublabel: 'Active · ship() allowed', x: 48, y: 50, kind: 'object', state: 'highlight' },
          { id: 'sh', label: 'ShippedState', sublabel: 'deliver() allowed', x: 82, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'd', to: 'p', label: 'pay()', style: 'solid', active: true },
          { from: 'p', to: 'sh', label: 'ship()', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Current State', value: 'PaidState', tone: 'good' },
          { key: 'Illegal Transitions', value: 'Blocked by State', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Tightly Coupled Side Effects',
      goodLabel: 'Decoupled EventBus Observer',
      explanation:
        'Publishing an event lets new features subscribe without modifying OrderService.',
      python: {
        bad: `def complete_order(order):\n    email.send(order)\n    analytics.track(order)\n    loyalty.credit(order)  # Keeps growing!`,
        good: `class EventBus:\n    def __init__(self): self._subs = []\n    def subscribe(self, fn): self._subs.append(fn)\n    def publish(self, event): [fn(event) for fn in self._subs]`,
      },
      java: {
        bad: `void complete(Order o) { email.send(o); analytics.log(o); loyalty.add(o); }`,
        good: `interface OrderListener { void onPaid(Order o); }\nclass OrderEventBus {\n    private final List<OrderListener> listeners = new ArrayList<>();\n    void subscribe(OrderListener l) { listeners.add(l); }\n    void publish(Order o) { listeners.forEach(l -> l.onPaid(o)); }\n}`,
      },
      typescript: {
        bad: `function complete(o: Order) { email(o); analytics(o); loyalty(o); }`,
        good: `type Listener = (o: Order) => void;\nclass OrderBus {\n  private subs = new Set<Listener>();\n  subscribe(fn: Listener) { this.subs.add(fn); return () => this.subs.delete(fn); }\n  emit(o: Order) { this.subs.forEach((fn) => fn(o)); }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'What is the subtle difference between Observer and Pub-Sub?',
        answer:
          'In classic Observer, the Subject directly holds a list of Observer references. In Pub-Sub, a message broker/event bus sits in the middle so Publishers and Subscribers don’t even know each other exist.',
      },
    ],
    quiz: {
      question: 'Why should an Observer subscription return an `unsubscribe()` handle?',
      options: [
        { id: 'a', text: 'To prevent memory leaks when short-lived listeners are destroyed while the Subject stays alive', isCorrect: true, explanation: 'Correct! Otherwise the Subject holds strong references to dead listeners forever.' },
        { id: 'b', text: 'To double event throughput', isCorrect: false, explanation: 'It prevents leaked references and ghost callbacks.' },
        { id: 'c', text: 'To disable polymorphism', isCorrect: false, explanation: 'Observer relies on polymorphic listener callbacks.' },
        { id: 'd', text: 'To force synchronous disk writes', isCorrect: false, explanation: 'Unrelated to disk I/O.' },
      ],
    },
  },

  // ==========================================================================
  // TRACK 4: LOW-LEVEL OOD INTERVIEW BLUEPRINTS (4 Systems)
  // ==========================================================================
  {
    id: 'ood-parking-lot',
    track: 'ood-systems',
    trackLabel: 'OOD Systems',
    title: 'OOD Blueprint: Multi-Floor Parking Lot System',
    shortTitle: 'Parking Lot OOD',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Decompose into ParkingLot ◆— Floors ◆— Spots, plug in SpotAllocationStrategy + FeeStrategy, and guard spot assignment with atomic locking.',
    realWorldAnalogy:
      'Entry kiosk prints a timestamped ticket after reserving the nearest compatible spot; exit kiosk computes fees using a pluggable hourly/weekend rate card and frees the spot.',
    whyItMatters:
      'The #1 most asked Low-Level OOD machine-coding question at Amazon, Uber, and Microsoft—tests Composition, Strategy, Factory, and Concurrency together.',
    keyTakeaways: [
      'Core Entities: Vehicle (Motorcycle/Car/Truck), ParkingSpot (Compact/Regular/Large), ParkingFloor, Ticket, EntryGate, ExitGate.',
      'SpotAllocationStrategy (NearestToEntrance vs EvenFloorSpread) uses Strategy Pattern for OCP.',
      'Concurrency: Two entry gates racing for the last free spot MUST synchronize spot reservation (ReentrantLock or atomic compare-and-set).',
    ],
    commonMistakes: [
      'Hard-coding pricing formulas inside ExitGate instead of injecting FeeStrategy.',
      'Forgetting concurrency when 2 entry gates allocate the same last spot simultaneously.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · ENTRY GATE',
        title: 'Car Arrives -> SpotAllocationStrategy Finds Nearest Spot',
        caption:
          'EntryGate asks AllocationStrategy (min-heap of free regular spots) for the closest available spot on Floor 1.',
        nodes: [
          { id: 'car', label: 'Car (Regular)', sublabel: 'Arrives at Gate A', x: 15, y: 50, kind: 'client', state: 'active' },
          { id: 'strat', label: 'NearestSpotStrategy', sublabel: 'O(log S) Min-Heap', x: 50, y: 26, kind: 'interface', state: 'highlight' },
          { id: 'spot', label: 'Spot F1-R04', sublabel: 'FREE -> LOCKED', x: 84, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'car', to: 'strat', label: 'findSpot(CAR)', style: 'call', active: true },
          { from: 'strat', to: 'spot', label: 'atomic reserve()', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Spot F1-R04', value: 'OCCUPIED (Atomic)', tone: 'good' },
          { key: 'Lookup Time', value: 'O(log S)', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · TICKET ISSUED',
        title: 'Immutable Ticket Links Vehicle, Spot & Entry Time',
        caption:
          'EntryGate issues Ticket #T-402 storing entryTimestamp and spotId, lifting the entry barrier.',
        nodes: [
          { id: 'gate', label: 'EntryGate', sublabel: 'Issues Ticket', x: 22, y: 50, kind: 'gate', state: 'active' },
          { id: 'tkt', label: 'Ticket #T-402', sublabel: 'spot=F1-R04, in=10:00', x: 54, y: 50, kind: 'object', state: 'highlight' },
          { id: 'spot', label: 'Spot F1-R04', sublabel: 'Car Parked', x: 84, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'gate', to: 'tkt', label: 'creates', style: 'call', active: true },
          { from: 'tkt', to: 'spot', label: 'references', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Ticket ID', value: 'T-402', tone: 'good' },
          { key: 'Entry Time', value: '10:00 AM', tone: 'neutral' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · EXIT & FEE',
        title: 'ExitGate Computes Fee via Strategy & Releases Spot',
        caption:
          'At 12:30 PM, ExitGate delegates to HourlyFeeStrategy (3 hrs -> $15), processes PaymentGateway, and pushes F1-R04 back into the free heap!',
        nodes: [
          { id: 'exit', label: 'ExitGate', sublabel: 'Scans T-402', x: 16, y: 50, kind: 'gate', state: 'active' },
          { id: 'fee', label: 'HourlyFeeStrategy', sublabel: '3h × $5 = $15', x: 50, y: 26, kind: 'interface', state: 'highlight' },
          { id: 'pay', label: 'PaymentGateway', sublabel: 'Card Approved', x: 50, y: 76, kind: 'interface', state: 'success' },
          { id: 'spot', label: 'Spot F1-R04', sublabel: 'FREE again!', x: 85, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'exit', to: 'fee', label: 'compute(T-402)', style: 'call', active: true },
          { from: 'exit', to: 'pay', label: 'charge($15)', style: 'call', active: true },
          { from: 'exit', to: 'spot', label: 'release()', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Fee Charged', value: '$15.00', tone: 'good' },
          { key: 'Spot F1-R04', value: 'AVAILABLE', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Monolithic ParkingLot With Global Arrays',
      goodLabel: 'Modular Strategy + Atomic Spot Allocation',
      explanation:
        'Separating SpotAllocationStrategy and FeeStrategy lets you add EV charging spots or weekend surge rates without modifying Entry/Exit gates.',
      python: {
        bad: `class ParkingLot:\n    # One 500-line class handling spots, pricing, payments, and gates!`,
        good: `class ParkingLot:\n    def __init__(self, allocator: SpotAllocator, fee_strategy: FeeStrategy):\n        self._allocator = allocator\n        self._fee_strategy = fee_strategy\n        self._lock = threading.Lock()\n\n    def park(self, vehicle: Vehicle) -> Ticket:\n        with self._lock:\n            spot = self._allocator.reserve_spot(vehicle.size)\n            return Ticket.issue(vehicle, spot)`,
      },
      java: {
        bad: `class ParkingLot { /* mixes floor loops, hourly math, and card SDK */ }`,
        good: `class ParkingLot {\n    private final SpotAllocator allocator;\n    private final FeeStrategy feeStrategy;\n    private final ReentrantLock lock = new ReentrantLock();\n\n    public Ticket park(Vehicle v) {\n        lock.lock();\n        try { return Ticket.create(v, allocator.reserve(v.type())); }\n        finally { lock.unlock(); }\n    }\n}`,
      },
      typescript: {
        bad: `class ParkingLot { /* single giant god class */ }`,
        good: `class ParkingLot {\n  constructor(\n    private readonly allocator: SpotAllocator,\n    private readonly feeStrategy: FeeStrategy\n  ) {}\n  park(vehicle: Vehicle): Ticket {\n    const spot = this.allocator.reserve(vehicle.type);\n    return new Ticket(vehicle, spot, Date.now());\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'How do you find the nearest free spot to an entrance in O(log N) instead of O(N) scanning?',
        answer:
          'Maintain one Min-Heap per (EntryGate, SpotType) ordered by distance from that gate. Reserving pops the top in O(log N); freeing pushes back in O(log N).',
      },
    ],
    quiz: {
      question: 'Which design pattern lets a Parking Lot support Hourly, Weekend-Flat, and EV-Charging rates cleanly?',
      options: [
        { id: 'a', text: 'Strategy Pattern (FeeStrategy)', isCorrect: true, explanation: 'Correct! FeeStrategy makes pricing policies interchangeable without editing ExitGate.' },
        { id: 'b', text: 'Singleton Pattern', isCorrect: false, explanation: 'Singleton does not model interchangeable algorithms.' },
        { id: 'c', text: 'Iterator Pattern', isCorrect: false, explanation: 'Iterator traverses collections.' },
        { id: 'd', text: 'Flyweight Pattern', isCorrect: false, explanation: 'Flyweight shares intrinsic immutable data.' },
      ],
    },
  },

  {
    id: 'ood-elevator',
    track: 'ood-systems',
    trackLabel: 'OOD Systems',
    title: 'OOD Blueprint: Multi-Elevator Dispatch & State System',
    shortTitle: 'Elevator System OOD',
    difficulty: 'Advanced',
    oneSentenceRule:
      'Separate External Hall Requests, ElevatorCar State Machine (IDLE/UP/DOWN/MAINTENANCE), and a pluggable DispatchScheduler (SCAN / LOOK algorithm).',
    realWorldAnalogy:
      'Like a disk-arm LOOK algorithm: an elevator moving UP services all upward floor requests in ascending order before reversing DOWN—minimizing wasted back-and-forth trips.',
    whyItMatters:
      'Tests State Machine design, Priority Queues (Min-Heap for UP, Max-Heap for DOWN), Strategy for dispatch scheduling, and Observer for floor display panels.',
    keyTakeaways: [
      'Each ElevatorCar owns a Min-Heap (`upStops`) and Max-Heap (`downStops`) for O(log F) next-stop ordering.',
      'DispatcherStrategy picks the best elevator (same direction passing floor > idle closest > least loaded).',
      'Floor displays subscribe via Observer Pattern whenever `currentFloor` or `direction` updates.',
    ],
    commonMistakes: [
      'Using a naive FIFO Queue (causes the elevator to zig-zag floor 1 -> 10 -> 2 -> 9 endlessly).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · HALL CALL',
        title: 'Passenger Presses UP on Floor 4 -> Dispatcher Evaluates Cars',
        caption:
          'Dispatcher checks Car A (Floor 2, moving UP -> passing Floor 4!) vs Car B (Floor 9, moving DOWN). Car A wins!',
        nodes: [
          { id: 'btn', label: 'Floor 4 HallButton', sublabel: 'Request(4, UP)', x: 16, y: 50, kind: 'event', state: 'active' },
          { id: 'disp', label: 'LookDispatcher', sublabel: 'Scoring Cars...', x: 50, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'ca', label: 'Car A (Floor 2 ↑)', sublabel: 'SELECTED!', x: 84, y: 26, kind: 'object', state: 'success', fields: ['upHeap: [4, 7]'] },
          { id: 'cb', label: 'Car B (Floor 9 ↓)', sublabel: 'Opposite dir', x: 84, y: 74, kind: 'object', state: 'idle', fields: ['downHeap: [3, 1]'] },
        ],
        edges: [
          { from: 'btn', to: 'disp', label: 'dispatch(4, UP)', style: 'call', active: true },
          { from: 'disp', to: 'ca', label: 'addStop(4)', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Assigned Car', value: 'Car A (Same Direction)', tone: 'good' },
          { key: 'Car A upHeap', value: '[4, 7]', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · MOVE & NOTIFY',
        title: 'Car A Pops Floor 4 -> Observers Update Floor Displays',
        caption:
          'Car A transitions MOVING_UP -> DOORS_OPEN at Floor 4 and notifies all subscribed DisplayPanels via Observer.',
        nodes: [
          { id: 'ca', label: 'Car A (State: OPEN)', sublabel: 'Arrived Floor 4', x: 26, y: 50, kind: 'object', state: 'success', fields: ['nextUp: [7]'] },
          { id: 'd1', label: 'Lobby Display', sublabel: 'Car A · Fl 4 ↑', x: 78, y: 28, kind: 'object', state: 'highlight' },
          { id: 'd2', label: 'Cabin Display', sublabel: 'Floor 4 · Open', x: 78, y: 72, kind: 'object', state: 'highlight' },
        ],
        edges: [
          { from: 'ca', to: 'd1', label: 'onFloorChanged(4)', style: 'call', active: true },
          { from: 'ca', to: 'd2', label: 'onFloorChanged(4)', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'State', value: 'DOORS_OPEN', tone: 'good' },
          { key: 'Next Stop', value: 'Floor 7', tone: 'neutral' },
        ],
      },
    ],
    code: {
      badLabel: 'FIFO Queue Causing Zig-Zag Starvation',
      goodLabel: 'LOOK Dual-Heap Elevator Car',
      explanation:
        'Separate sorted upStops (min-heap) and downStops (max-heap) sweep cleanly in one direction before reversing.',
      python: {
        bad: `class Elevator:\n    def __init__(self): self.queue = deque()  # Zig-zags 1->10->2->9!`,
        good: `import heapq\nclass ElevatorCar:\n    def __init__(self): self.floor, self.up, self.down = 0, [], []\n    def add_stop(self, target: int):\n        if target >= self.floor: heapq.heappush(self.up, target)\n        else: heapq.heappush(self.down, -target)`,
      },
      java: {
        bad: `Queue<Integer> stops = new LinkedList<>(); // Inefficient FIFO`,
        good: `class ElevatorCar {\n    int floor = 0;\n    PriorityQueue<Integer> upStops = new PriorityQueue<>();\n    PriorityQueue<Integer> downStops = new PriorityQueue<>(Collections.reverseOrder());\n    void addStop(int f) { if (f >= floor) upStops.add(f); else downStops.add(f); }\n}`,
      },
      typescript: {
        bad: `const stops: number[] = []; // FIFO zig-zags`,
        good: `class ElevatorCar {\n  floor = 0;\n  upStops: number[] = [];\n  downStops: number[] = [];\n  addStop(target: number) {\n    if (target >= this.floor) this.upStops = [...new Set([...this.upStops, target])].sort((a, b) => a - b);\n    else this.downStops = [...new Set([...this.downStops, target])].sort((a, b) => b - a);\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Why is LOOK preferred over pure SCAN for elevators?',
        answer:
          'SCAN travels all the way to the top/bottom floor even if nobody requested it. LOOK reverses as soon as there are no further requests in the current direction.',
      },
    ],
    quiz: {
      question: 'Which data structure pair lets an ElevatorCar efficiently serve stops in LOOK order?',
      options: [
        { id: 'a', text: 'A Min-Heap for UP stops and a Max-Heap for DOWN stops', isCorrect: true, explanation: 'Correct! Min-Heap pops the nearest floor going up; Max-Heap pops the nearest floor going down.' },
        { id: 'b', text: 'A single LIFO Stack', isCorrect: false, explanation: 'A stack causes severe starvation and zig-zagging.' },
        { id: 'c', text: 'A HashSet with random iteration', isCorrect: false, explanation: 'HashSets have no floor ordering.' },
        { id: 'd', text: 'A single FIFO Queue', isCorrect: false, explanation: 'FIFO wastes movement bouncing up and down.' },
      ],
    },
  },

  {
    id: 'ood-rate-limiter',
    track: 'ood-systems',
    trackLabel: 'OOD Systems',
    title: 'OOD Blueprint: Pluggable API Rate Limiter',
    shortTitle: 'Rate Limiter OOD',
    difficulty: 'Advanced',
    oneSentenceRule:
      'Expose a single `RateLimiter.allow(clientId)` interface backed by swappable TokenBucket or SlidingWindowLog strategies and per-client thread-safe state.',
    realWorldAnalogy:
      'A bouncer holding a bucket that refills with 10 entry tokens every minute: each visitor takes 1 token; if the bucket is empty, they wait until the next refill.',
    whyItMatters:
      'Directly bridges Low-Level OOD with Distributed System Design—shows Strategy + Factory + Decorator (HTTP middleware) + lazy timestamp refill with zero background timer threads.',
    keyTakeaways: [
      'Lazy Refill Trick: compute tokens earned since `lastRefillTs` on demand (`elapsed * rate`)—no background cron thread needed per user!',
      'Strategy lets routes pick TokenBucket (burst-friendly) vs SlidingWindowCounter (strict ceiling).',
      'Guard per-client bucket updates with fine-grained per-key locking (or Redis Lua script in distributed mode).',
    ],
    commonMistakes: [
      'Spawning a background timer thread per user to refill buckets (OOM at 1M users!).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · LAZY REFILL',
        title: 'Request Arrives -> Compute Refilled Tokens On Demand',
        caption:
          'Client "u-42" calls /api/search after 2s. TokenBucket lazily adds elapsed(2s) × rate(2/s) = +4 tokens (capped at capacity 5).',
        nodes: [
          { id: 'req', label: 'API Request (u-42)', sublabel: 't = 12.0s', x: 16, y: 50, kind: 'client', state: 'active' },
          { id: 'rl', label: 'TokenBucketLimiter', sublabel: 'Lazy Refill Math', x: 50, y: 50, kind: 'gate', state: 'highlight', fields: ['tokens: 1 + 4 = 5'] },
          { id: 'api', label: 'SearchHandler', sublabel: 'Protected Service', x: 84, y: 50, kind: 'object', state: 'idle' },
        ],
        edges: [
          { from: 'req', to: 'rl', label: 'allow("u-42")', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Tokens Available', value: '5 / 5', tone: 'good' },
          { key: 'Background Timers', value: '0 (Lazy Math)', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · ALLOW OR 429',
        title: 'Consume 1 Token -> Forward (Or Reject 429 When Empty)',
        caption:
          'Tokens >= 1, so 1 token is consumed (4 left) and request proceeds to SearchHandler. When tokens < 1, immediately return HTTP 429!',
        nodes: [
          { id: 'req', label: 'API Request (u-42)', sublabel: 'Allowed!', x: 16, y: 50, kind: 'client', state: 'success' },
          { id: 'rl', label: 'TokenBucketLimiter', sublabel: 'tokens = 4 left', x: 50, y: 50, kind: 'gate', state: 'success' },
          { id: 'api', label: 'SearchHandler', sublabel: '200 OK', x: 84, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'req', to: 'rl', label: 'allow -> true', style: 'call', active: true },
          { from: 'rl', to: 'api', label: 'forwarded', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Decision', value: 'ALLOW (200 OK)', tone: 'good' },
          { key: 'Remaining Tokens', value: '4', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Background Thread Per User (Unscalable)',
      goodLabel: 'O(1) Lazy-Refill Token Bucket Strategy',
      explanation:
        'Computing refilled tokens from `(now - lastTs) * refillRate` achieves O(1) time and zero background threads.',
      python: {
        bad: `# Spawning a timer thread per user crashes at 100k users!`,
        good: `import time\nclass TokenBucket:\n    def __init__(self, cap: float, rate: float):\n        self.cap, self.rate, self.tokens, self.last = cap, rate, cap, time.monotonic()\n    def allow(self) -> bool:\n        now = time.monotonic()\n        self.tokens = min(self.cap, self.tokens + (now - self.last) * self.rate)\n        self.last = now\n        if self.tokens >= 1:\n            self.tokens -= 1\n            return True\n        return False`,
      },
      java: {
        bad: `// ScheduledExecutor per user -> OOM!`,
        good: `class TokenBucket {\n    private final double cap, rate;\n    private double tokens; private long lastNs = System.nanoTime();\n    TokenBucket(double cap, double rate) { this.cap = cap; this.rate = rate; this.tokens = cap; }\n    synchronized boolean allow() {\n        long now = System.nanoTime();\n        tokens = Math.min(cap, tokens + ((now - lastNs) / 1e9) * rate);\n        lastNs = now;\n        if (tokens >= 1) { tokens -= 1; return true; }\n        return false;\n    }\n}`,
      },
      typescript: {
        bad: `setInterval(() => bucket.tokens++, 1000); // Leaks timers!`,
        good: `class TokenBucket {\n  private tokens: number; private last = Date.now();\n  constructor(private cap: number, private ratePerSec: number) { this.tokens = cap; }\n  allow(): boolean {\n    const now = Date.now();\n    this.tokens = Math.min(this.cap, this.tokens + ((now - this.last) / 1000) * this.ratePerSec);\n    this.last = now;\n    if (this.tokens >= 1) { this.tokens -= 1; return true; }\n    return false;\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'How do you scale this in-memory OOD Rate Limiter across 20 stateless API servers?',
        answer:
          'Swap the local BucketStore adapter for a RedisRateLimitStore executing an atomic Lua script (`HMGET` + refill math + `HMSET` + `EXPIRE`) so all 20 servers share one race-free counter.',
      },
    ],
    quiz: {
      question: 'Why does a production Token Bucket calculate token refills lazily on each incoming request?',
      options: [
        { id: 'a', text: 'It eliminates background refill timers/threads, running in O(1) time per request for millions of users', isCorrect: true, explanation: 'Correct! Lazy timestamp math scales effortlessly without timer overhead.' },
        { id: 'b', text: 'Because timestamps are always integers', isCorrect: false, explanation: 'Fractional elapsed seconds work cleanly with floating-point math.' },
        { id: 'c', text: 'To allow unlimited requests during traffic spikes', isCorrect: false, explanation: 'Tokens are strictly capped at capacity.' },
        { id: 'd', text: 'Because Token Bucket cannot reject requests', isCorrect: false, explanation: 'It returns false (HTTP 429) whenever tokens < 1.' },
      ],
    },
  },

  {
    id: 'ood-payment-orchestrator',
    track: 'ood-systems',
    trackLabel: 'OOD Systems',
    title: 'OOD Blueprint: Payment & Notification Orchestrator (All SOLID Together)',
    shortTitle: 'Payment System OOD',
    difficulty: 'Advanced',
    oneSentenceRule:
      'Combine Factory (pick gateway) + Decorator (idempotency & retry) + DIP (abstract ports) + Observer (receipt & audit events) into one production-grade architecture.',
    realWorldAnalogy:
      'A modern airport terminal: check-in routes you to the right airline (Factory), security wraps every passenger (Decorator), and boarding status updates all screens & apps simultaneously (Observer).',
    whyItMatters:
      'Shows senior-level synthesis: how SOLID principles and GoF patterns interlock cleanly in real backend microservices without over-engineering.',
    keyTakeaways: [
      'IdempotencyDecorator prevents accidental double-charging when clients retry timed-out payment requests.',
      'GatewayFactory selects Stripe/UPI/PayPal dynamically based on payment method.',
      'Observer EventBus decouples ReceiptEmailer, FraudLedger, and OrderFulfillment from the payment critical path.',
    ],
    commonMistakes: [
      'Calling email/analytics synchronously inside the payment transaction so an email outage fails the checkout!',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · IDEMPOTENCY GUARD',
        title: 'IdempotencyDecorator Checks Duplicate Key First',
        caption:
          'Checkout sends idempotencyKey="pay-881". If already processed, return the cached Receipt immediately—never double-charge!',
        nodes: [
          { id: 'chk', label: 'CheckoutAPI', sublabel: 'key="pay-881"', x: 16, y: 50, kind: 'client', state: 'active' },
          { id: 'idem', label: 'IdempotencyDecorator', sublabel: 'New key -> proceed', x: 50, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'fac', label: 'GatewayFactory', sublabel: 'Resolves Stripe/UPI', x: 84, y: 50, kind: 'interface', state: 'idle' },
        ],
        edges: [
          { from: 'chk', to: 'idem', label: 'charge(req)', style: 'call', active: true },
          { from: 'idem', to: 'fac', label: 'forward once', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Double-Charge Risk', value: 'Eliminated', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · EXECUTE + BROADCAST',
        title: 'Gateway Charges -> EventBus Notifies Downstream Async',
        caption:
          'StripeGateway succeeds, IdempotencyDecorator caches Receipt, and PaymentBus notifies ReceiptEmailer & Ledger independently!',
        nodes: [
          { id: 'gw', label: 'StripeGateway', sublabel: 'Charged $99 OK', x: 18, y: 50, kind: 'object', state: 'success' },
          { id: 'bus', label: 'PaymentEventBus', sublabel: 'emit(PAID)', x: 50, y: 50, kind: 'event', state: 'highlight' },
          { id: 'o1', label: 'ReceiptEmailer', sublabel: 'Async email', x: 84, y: 26, kind: 'object', state: 'success' },
          { id: 'o2', label: 'AuditLedger', sublabel: 'Writes journal', x: 84, y: 74, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'gw', to: 'bus', label: 'publish', style: 'call', active: true },
          { from: 'bus', to: 'o1', label: 'notify', style: 'solid', active: true },
          { from: 'bus', to: 'o2', label: 'notify', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Patterns Combined', value: 'Factory + Decorator + Observer', tone: 'good' },
          { key: 'Email Outage Impact', value: '0% on Checkout', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'All-In-One Risky Checkout Function',
      goodLabel: 'Idempotent Decorator + Factory + EventBus',
      explanation:
        'Composing IdempotencyDecorator around a Factory-selected Gateway and emitting events keeps payments atomic, safe, and extensible.',
      python: {
        bad: `def pay(req):\n    stripe.charge(req.amount)  # Double-charges on retry!\n    smtp.send(req.email)       # Email crash fails payment!`,
        good: `class IdempotentGateway(PaymentGateway):\n    def __init__(self, inner: PaymentGateway, store: dict, bus: EventBus):\n        self._inner, self._store, self._bus = inner, store, bus\n    def charge(self, key: str, amount: int) -> Receipt:\n        if key in self._store: return self._store[key]\n        receipt = self._inner.charge(key, amount)\n        self._store[key] = receipt\n        self._bus.publish(receipt)\n        return receipt`,
      },
      java: {
        bad: `void pay(Req r) { stripe.charge(r); mailer.send(r); }`,
        good: `class IdempotentGateway implements PaymentGateway {\n    private final PaymentGateway inner; private final Map<String, Receipt> seen;\n    public Receipt charge(String key, int amt) {\n        return seen.computeIfAbsent(key, k -> inner.charge(k, amt));\n    }\n}`,
      },
      typescript: {
        bad: `async function pay(r: Req) { await stripe.charge(r); await mailer.send(r); }`,
        good: `class IdempotentGateway implements PaymentGateway {\n  private seen = new Map<string, Receipt>();\n  constructor(private inner: PaymentGateway, private bus: EventBus) {}\n  async charge(key: string, amount: number) {\n    if (this.seen.has(key)) return this.seen.get(key)!;\n    const receipt = await this.inner.charge(key, amount);\n    this.seen.set(key, receipt);\n    this.bus.emit(receipt);\n    return receipt;\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Why must ReceiptEmailer be decoupled via Observer/EventBus instead of called inside the payment method?',
        answer:
          'Payment capture is a critical financial mutation; email is a retryable side effect. If the payment/order transaction commits independently and email is queued durably (for example, through an outbox), SMTP downtime need not fail the payment response or roll back the committed payment. Delivery still requires retries, monitoring and idempotency.',
      },
    ],
    quiz: {
      question: 'Which pattern cleanly wraps any PaymentGateway to prevent accidental double-charges on network retries?',
      options: [
        { id: 'a', text: 'Decorator Pattern (IdempotencyDecorator)', isCorrect: true, explanation: 'Correct! IdempotencyDecorator transparently wraps any PaymentGateway without altering gateway code.' },
        { id: 'b', text: 'Builder Pattern', isCorrect: false, explanation: 'Builder constructs complex objects.' },
        { id: 'c', text: 'Prototype Pattern', isCorrect: false, explanation: 'Prototype clones objects.' },
        { id: 'd', text: 'Singleton Pattern', isCorrect: false, explanation: 'Singleton restricts instance count.' },
      ],
    },
  },
];
