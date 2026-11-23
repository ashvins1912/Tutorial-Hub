export type EvolutionTrack = 'java-to-java' | 'python-to-python' | 'java-to-python';

export interface VersionStage {
  versionLabel: string;
  eraTag: string;
  headline: string;
  syntaxChanges: string[];
  code: string;
  runtimeImpact: string;
}

export interface EvolutionQuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
}

export interface EvolutionGoalRule {
  id: string;
  label: string;
  hint: string;
  test: (code: string) => boolean;
}

export interface EvolutionMicroGoal {
  id: string;
  goalTitle: string;
  prompt: string;
  language: 'java' | 'python';
  starterCode: string;
  quickSnippets: { label: string; snippet: string }[];
  rules: EvolutionGoalRule[];
  referenceSolution: string;
}

export interface VersionEvolutionTopic {
  id: string;
  track: EvolutionTrack;
  number: number;
  title: string;
  shortTitle: string;
  category: string;
  summary: string;
  whyItEvolved: string;
  stages: VersionStage[];
  mermaidDfd: string;
  correlatedQuiz: EvolutionQuizQuestion;
  microGoal: EvolutionMicroGoal;
}

export const VERSION_EVOLUTION_TOPICS: VersionEvolutionTopic[] = [
  /* ======================================================================== */
  /* TRACK 1: JAVA -> JAVA VERSION EVOLUTION (JAVA 1.0 -> 5 -> 8 -> 17 -> 21) */
  /* ======================================================================== */
  {
    id: 'evo-j2j-collections-loops',
    track: 'java-to-java',
    number: 1,
    title: 'Java 1.2 -> Java 5 -> Java 8 -> Java 21: Loops, Generics & Stream Pipelines',
    shortTitle: 'Java Loops & Streams',
    category: 'Syntax & Style Evolution',
    summary:
      'Watch how filtering and transforming a list evolved from unsafe raw Collections + Iterator casts (Java 1.2) to Generics/For-Each (Java 5), Lambdas/Streams (Java 8), and concise .toList() (Java 16/21).',
    whyItEvolved:
      'Eliminated runtime ClassCastException bugs, removed verbose Iterator boilerplate, and turned imperative mutation into declarative, parallelizable data pipelines.',
    stages: [
      {
        versionLabel: 'Java 1.2–1.4',
        eraTag: 'Raw Collections + Casts',
        headline: 'Untyped ArrayList, Explicit Iterator & Manual Type Casting',
        syntaxChanges: [
          'Raw List held Object references—no compile-time type safety',
          'Required explicit Iterator while-loop and (String) cast',
          'Manual ArrayList creation and mutation',
        ],
        code: `List result = new ArrayList();
Iterator it = names.iterator();
while (it.hasNext()) {
    String name = (String) it.next();
    if (name.length() > 3) {
        result.add(name.toUpperCase());
    }
}`,
        runtimeImpact: 'Runtime ClassCastException if a non-String entered the list.',
      },
      {
        versionLabel: 'Java 5–7',
        eraTag: 'Generics + Enhanced For-Each',
        headline: 'Compile-Time Type Parameters (<String>), Diamond <> & For-Each',
        syntaxChanges: [
          'Generics List<String> catch wrong element types at compile time',
          'Enhanced for (String name : names) hides Iterator boilerplate',
          'Java 7 diamond operator new ArrayList<>() removes duplicate type',
        ],
        code: `List<String> result = new ArrayList<>();
for (String name : names) {
    if (name.length() > 3) {
        result.add(name.toUpperCase());
    }
}`,
        runtimeImpact: 'Zero cast bugs; still allocates mutable intermediate list eagerly.',
      },
      {
        versionLabel: 'Java 8–21+ LTS',
        eraTag: 'Lambdas + Streams + .toList()',
        headline: 'Declarative Stream Pipeline, Method References & Unmodifiable .toList()',
        syntaxChanges: [
          'Lambdas (n -> ...) and Method References (String::toUpperCase)',
          'Lazy intermediate filter/map stages fused in a single pass',
          'Java 16+ .toList() replaces verbose .collect(Collectors.toList())',
        ],
        code: `var result = names.stream()
    .filter(n -> n.length() > 3)
    .map(String::toUpperCase)
    .toList();`,
        runtimeImpact: 'Single-pass fused pipeline returning an immutable list.',
      },
    ],
    mermaidDfd: `flowchart LR
  J14["Java 1.4: Raw List + Cast"] -->|"Java 5 Generics"| J5["Java 5/7: List<String> + For-Each"]
  J5 -->|"Java 8 Lambdas"| J8["Java 8: Stream + Collectors"]
  J8 -->|"Java 16/21"| J21["Java 21: var + Method Ref + .toList()"]`,
    correlatedQuiz: {
      id: 'q-evo-j2j-1',
      question: 'What bug did Java 5 Generics (`List<String>`) eliminate compared to Java 1.4 raw `List`?',
      options: [
        { id: 'a', text: 'NullPointerException on empty lists' },
        { id: 'b', text: 'Runtime ClassCastException caused by inserting wrong object types into raw collections' },
        { id: 'c', text: 'StackOverflowError in loops' },
      ],
      correctId: 'b',
      explanation: 'Generics enforce element types at compile time so invalid inserts fail in `javac` instead of crashing at runtime during `(String) it.next()`.',
    },
    microGoal: {
      id: 'goal-j2j-stream',
      goalTitle: 'Upgrade Java 5 Loop -> Java 16/21 Stream Pipeline',
      prompt: 'Rewrite the imperative loop into a Java Stream using `.filter(...)`, `.map(String::toUpperCase)`, and `.toList()`.',
      language: 'java',
      starterCode: `List<String> out = new ArrayList<>();
for (String s : tags) {
    if (s.length() >= 4) {
        out.add(s.toUpperCase());
    }
}`,
      quickSnippets: [
        { label: '.stream().filter().map().toList()', snippet: 'var out = tags.stream()\n    .filter(s -> s.length() >= 4)\n    .map(String::toUpperCase)\n    .toList();' },
      ],
      rules: [
        {
          id: 'use-stream',
          label: 'Start a pipeline with tags.stream()',
          hint: 'Call tags.stream() to create the stream.',
          test: (code) => /tags\.stream\s*\(\s*\)/.test(code),
        },
        {
          id: 'filter-map-tolist',
          label: 'Chain .filter(...), .map(...), and .toList()',
          hint: 'Use .filter(s -> s.length() >= 4).map(String::toUpperCase).toList().',
          test: (code) => /\.filter\s*\(/.test(code) && /\.map\s*\(/.test(code) && /\.toList\s*\(\s*\)/.test(code),
        },
      ],
      referenceSolution: `var out = tags.stream()
    .filter(s -> s.length() >= 4)
    .map(String::toUpperCase)
    .toList();`,
    },
  },
  {
    id: 'evo-j2j-pojo-records-switch',
    track: 'java-to-java',
    number: 2,
    title: 'Java 1+ -> Java 14 -> Java 17/21: POJOs & instanceof -> Records, Sealed Types & Switch Patterns',
    shortTitle: 'POJOs -> Records & Switch',
    category: 'Data Modeling & Branching',
    summary:
      'See 45 lines of immutable POJO boilerplate plus error-prone `instanceof` casting shrink to 4 lines of compiler-verified Sealed Interfaces, Records, and exhaustive Switch expressions.',
    whyItEvolved:
      'Data carriers and algebraic sum types (Result, PaymentEvent) were verbose and forgot cases during refactors. Sealed + Record + Switch Pattern Matching makes missing branches a compile error.',
    stages: [
      {
        versionLabel: 'Java 1+ – 11',
        eraTag: 'Verbose POJO + instanceof Cast',
        headline: 'Manual Constructors, Getters, equals/hashCode & Multi-Line instanceof',
        syntaxChanges: [
          'Every value class needed fields, constructor, getters, equals, hashCode, toString',
          'Checking subtypes required `if (e instanceof Card) { Card c = (Card) e; }`',
          'Forgetting a new subtype compiled silently and fell into `else`',
        ],
        code: `if (payment instanceof CardPay) {
    CardPay c = (CardPay) payment;
    return "Card:" + c.getLast4();
} else if (payment instanceof UpiPay) {
    UpiPay u = (UpiPay) payment;
    return "UPI:" + u.getVpa();
} else {
    throw new IllegalArgumentException("Unknown");
}`,
        runtimeImpact: 'High boilerplate; adding a 3rd payment type silently breaks at runtime.',
      },
      {
        versionLabel: 'Java 16–17 LTS',
        eraTag: 'Records + Sealed Interfaces',
        headline: '1-Line Immutable Value Records & Closed Type Hierarchies',
        syntaxChanges: [
          '`record CardPay(String last4)` auto-generates constructor, accessors, equals, hashCode, toString',
          '`sealed interface Payment permits CardPay, UpiPay` closes the hierarchy',
          'Pattern `instanceof CardPay c` binds variable without manual cast',
        ],
        code: `sealed interface Payment permits CardPay, UpiPay {}
record CardPay(String last4) implements Payment {}
record UpiPay(String vpa) implements Payment {}

if (payment instanceof CardPay c) {
    return "Card:" + c.last4();
}`,
        runtimeImpact: '90% less code; immutable & hash-safe by default.',
      },
      {
        versionLabel: 'Java 21+ LTS',
        eraTag: 'Exhaustive Record Pattern Switch',
        headline: 'Deconstructing Record Patterns in Switch Expressions (No default Needed!)',
        syntaxChanges: [
          'Deconstructs fields directly inside `case CardPay(var last4) ->`',
          'Compiler proves exhaustiveness across all sealed permits—no unreachable default',
          'Switch is an expression returning a value with arrow `->` (zero fall-through bugs)',
        ],
        code: `String label = switch (payment) {
    case CardPay(var last4) -> "Card:" + last4;
    case UpiPay(var vpa)    -> "UPI:" + vpa;
};`,
        runtimeImpact: 'Compile-time exhaustiveness guarantee + invokedynamic TypeSwitch.',
      },
    ],
    mermaidDfd: `flowchart LR
  POJO["Java 1-11: POJO + instanceof Cast"] -->|"Java 16/17"| REC["Java 17: sealed + record"]
  REC -->|"Java 21 JEP 440/441"| SW["Java 21: Exhaustive Record Switch"]
  SW -->|"Compile-Time Proof"| SAFE["Zero Unhandled Subtypes"]`,
    correlatedQuiz: {
      id: 'q-evo-j2j-2',
      question: 'Why does a Java 21 `switch` over a `sealed interface` NOT need a `default` branch?',
      options: [
        { id: 'a', text: 'Java 21 ignores unmatched cases and returns null' },
        { id: 'b', text: 'The compiler knows the exact closed set of permitted subtypes and verifies every one is handled' },
        { id: 'c', text: 'Records can only ever have one subtype' },
      ],
      correctId: 'b',
      explanation: 'Because `sealed ... permits` enumerates all legal subtypes, `javac` proves exhaustiveness and immediately flags a compile error if a new subtype is added later.',
    },
    microGoal: {
      id: 'goal-j2j-record',
      goalTitle: 'Modernize Java POJO -> Java 17/21 Record + Arrow Switch',
      prompt: 'Declare `record Order(String id, int qty) {}` and write an arrow `switch (status)` expression returning `"OK"` or `"WAIT"`.',
      language: 'java',
      starterCode: `// TODO: replace verbose class with record Order(String id, int qty) {}
public class Order {
    private final String id;
    private final int qty;
    public Order(String id, int qty) { this.id = id; this.qty = qty; }
}`,
      quickSnippets: [
        { label: 'record Order', snippet: 'record Order(String id, int qty) {}' },
        { label: 'Arrow switch', snippet: 'String msg = switch (status) {\n    case "PAID" -> "OK";\n    default -> "WAIT";\n};' },
      ],
      rules: [
        {
          id: 'use-record',
          label: 'Define immutable `record Order(String id, int qty) {}`',
          hint: 'Use the `record` keyword instead of `public class Order`.',
          test: (code) => /\brecord\s+Order\s*\(\s*String\s+id\s*,\s*int\s+qty\s*\)/.test(code),
        },
        {
          id: 'use-arrow-switch',
          label: 'Use modern arrow switch expression (`case ... ->`)',
          hint: 'Write `switch (status) { case "PAID" -> "OK"; default -> "WAIT"; };`.',
          test: (code) => /switch\s*\([^)]+\)\s*\{[\s\S]*case[\s\S]*->/.test(code),
        },
      ],
      referenceSolution: `record Order(String id, int qty) {}

String msg = switch (status) {
    case "PAID" -> "OK";
    default -> "WAIT";
};`,
    },
  },
  {
    id: 'evo-j2j-resources-threads',
    track: 'java-to-java',
    number: 3,
    title: 'Java 1+ -> Java 7 -> Java 21: Resource Cleanup & OS Threads -> Virtual Threads',
    shortTitle: 'Java Resources & Threads',
    category: 'I/O & Concurrency Evolution',
    summary:
      'Trace how Java moved from leaky nested `try/finally` close blocks and heavyweight OS threads (`new Thread`) to `try-with-resources` (Java 7), `ExecutorService` (Java 5), and lightweight Virtual Threads (Java 21).',
    whyItEvolved:
      'Nested `close()` calls hid real exceptions and leaked handles, while 1MB-stack OS threads capped servers at a few thousand concurrent blocking connections.',
    stages: [
      {
        versionLabel: 'Java 1+ – 6',
        eraTag: 'Manual finally + Raw Thread',
        headline: 'Verbose Nested try/finally Close & Unbounded new Thread()',
        syntaxChanges: [
          'Manual null checks and nested try/catch inside finally to close streams',
          'Spawning `new Thread(runnable).start()` creates a heavy ~1MB OS kernel thread',
        ],
        code: `BufferedReader br = null;
try {
    br = new BufferedReader(new FileReader("a.txt"));
    return br.readLine();
} finally {
    if (br != null) br.close();
}`,
        runtimeImpact: 'If close() throws, it masks the primary exception; raw threads exhaust RAM.',
      },
      {
        versionLabel: 'Java 7–11',
        eraTag: 'try-with-resources + Thread Pools',
        headline: 'AutoCloseable Scopes & Bounded ExecutorService Pools',
        syntaxChanges: [
          'try (var br = Files.newBufferedReader(...)) closes automatically with suppressed exception tracking',
          'Executors.newFixedThreadPool(16) reuses OS threads safely',
        ],
        code: `try (var br = Files.newBufferedReader(Path.of("a.txt"))) {
    return br.readLine();
}`,
        runtimeImpact: 'Zero leaked file descriptors; fixed pool prevents OOM but limits blocking concurrency.',
      },
      {
        versionLabel: 'Java 21+ LTS',
        eraTag: 'AutoCloseable Virtual Thread Executor',
        headline: '100,000+ Lightweight Virtual Threads Mounted on Carrier Pool',
        syntaxChanges: [
          'ExecutorService itself implements AutoCloseable in Java 19+ (use inside try-with-resources!)',
          'Executors.newVirtualThreadPerTaskExecutor() unmounts virtual threads during I/O waits',
        ],
        code: `try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    var f1 = exec.submit(() -> fetchUser(id));
    var f2 = exec.submit(() -> fetchOrders(id));
    return combine(f1.get(), f2.get());
}`,
        runtimeImpact: 'Simple blocking style achieves async/reactive throughput with KB-sized heap stacks.',
      },
    ],
    mermaidDfd: `flowchart LR
  J1["Java 1-6: Manual finally + OS Thread"] -->|"Java 7 AutoCloseable"| J7["Java 7: try-with-resources + Pool"]
  J7 -->|"Java 19/21 Loom"| J21["Java 21: try (VirtualThreadExecutor)"]
  J21 -->|"Unmount on I/O"| SCALE["100k+ Concurrent Tasks"]`,
    correlatedQuiz: {
      id: 'q-evo-j2j-3',
      question: 'Why can Java 21 `Executors.newVirtualThreadPerTaskExecutor()` be placed directly inside a `try (...)` header?',
      options: [
        { id: 'a', text: 'Because ExecutorService extends AutoCloseable (since Java 19), guaranteeing graceful shutdown and task completion on block exit' },
        { id: 'b', text: 'Because Virtual Threads never throw exceptions' },
        { id: 'c', text: 'Because try-with-resources disables garbage collection' },
      ],
      correctId: 'a',
      explanation: 'Since Java 19, `ExecutorService.close()` waits for submitted tasks to finish and shuts down the executor cleanly—preventing leaked threads.',
    },
    microGoal: {
      id: 'goal-j2j-vthread',
      goalTitle: 'Upgrade to Scoped Java 21 Virtual Thread Executor',
      prompt: 'Wrap `Executors.newVirtualThreadPerTaskExecutor()` inside a `try (...)` block and submit a task.',
      language: 'java',
      starterCode: `// TODO: replace raw Thread with scoped virtual thread executor
new Thread(() -> processOrder()).start();`,
      quickSnippets: [
        { label: 'try (VirtualThreadExecutor)', snippet: 'try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {\n    exec.submit(() -> processOrder());\n}' },
      ],
      rules: [
        {
          id: 'use-vthread-exec',
          label: 'Use Executors.newVirtualThreadPerTaskExecutor()',
          hint: 'Instantiate `var exec = Executors.newVirtualThreadPerTaskExecutor()` in try (...).',
          test: (code) => /Executors\.newVirtualThreadPerTaskExecutor\s*\(\s*\)/.test(code),
        },
        {
          id: 'scoped-try',
          label: 'Wrap the executor inside `try (...)` and call `exec.submit(...)`',
          hint: 'Place the executor in try-with-resources so it auto-closes cleanly.',
          test: (code) => /\btry\s*\([\s\S]*newVirtualThreadPerTaskExecutor/.test(code) && /\.submit\s*\(/.test(code),
        },
      ],
      referenceSolution: `try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    exec.submit(() -> processOrder());
}`,
    },
  },

  /* ======================================================================== */
  /* TRACK 2: PYTHON -> PYTHON EVOLUTION (PYTHON 1/2 -> 3.0 -> 3.6 -> 3.10+)  */
  /* ======================================================================== */
  {
    id: 'evo-p2p-strings-division-print',
    track: 'python-to-python',
    number: 4,
    title: 'Python 1/2 -> Python 3.0 -> Python 3.6+: Print, Integer Division, Unicode & f-Strings',
    shortTitle: 'Python 2 -> 3 & f-Strings',
    category: 'Core Syntax & String Evolution',
    summary:
      'Understand the most important Python version transitions: `print` statement to function, `/` true division vs `//` floor division, strict `str` vs `bytes`, and `%` / `.format()` evolving into ultra-fast f-strings.',
    whyItEvolved:
      'Python 2 silently truncated `5 / 2` to `2` and mixed raw bytes with text, causing subtle math and Unicode crashes. Python 3 made text/bytes explicit and f-strings eliminated formatting clutter.',
    stages: [
      {
        versionLabel: 'Python 0.9–2.7',
        eraTag: 'Legacy Statement Era',
        headline: 'print Statement, Truncating /, %-Formatting & Mixed ASCII/Unicode',
        syntaxChanges: [
          '`print "hi"` was a special keyword statement, not a function',
          '`5 / 2` returned `2` (integer truncation!) instead of `2.5`',
          '`"%s: %d" % (name, score)` broke easily on tuple arguments',
        ],
        code: `# Python 2 Legacy (DO NOT WRITE TODAY)
avg = 5 / 2              # 2 (surprise truncation!)
print "Avg for %s is %.1f" % (user, avg)
for i in xrange(1000):   # Needed xrange for lazy iteration
    pass`,
        runtimeImpact: 'Implicit ASCII decode crashes & unexpected floor division bugs.',
      },
      {
        versionLabel: 'Python 3.0–3.5',
        eraTag: 'Clean Unicode & Lazy Built-ins',
        headline: 'print() Function, True Division /, Lazy range() & .format()',
        syntaxChanges: [
          '`print(...)` is a real function supporting `sep=`, `end=`, `file=`',
          '`5 / 2 == 2.5` always; use `5 // 2 == 2` when you explicitly want floor division',
          '`range()`, `zip()`, `map()` are lazy O(1) iterators by default',
        ],
        code: `# Python 3.0–3.5
avg = 5 / 2              # 2.5 (true division); 5 // 2 == 2
print("Avg for {} is {:.1f}".format(user, avg))
for i in range(1000):    # Lazy O(1) memory built-in!
    pass`,
        runtimeImpact: 'Zero Unicode/bytes ambiguity and predictable arithmetic.',
      },
      {
        versionLabel: 'Python 3.6–3.13+',
        eraTag: 'f-Strings + Debug `=` + Type Hints',
        headline: 'Inline f-Strings (PEP 498), `f"{val=}"` Debug Syntax & Modern Typing',
        syntaxChanges: [
          '`f"Avg for {user} is {avg:.1f}"` compiles to fast FORMAT_VALUE bytecode',
          'Python 3.8+ `f"{avg=}"` prints both variable name and value for instant debugging',
          'Python 3.12+ lifts quote-nesting limits inside f-strings (PEP 701)',
        ],
        code: `# Modern Python 3.6–3.13+
avg: float = 5 / 2
print(f"Avg for {user} is {avg:.1f}")
print(f"{user=}, {avg=:.2f}")  # Instant self-documenting debug output`,
        runtimeImpact: 'Up to 2x faster formatting than .format() or % with maximum readability.',
      },
    ],
    mermaidDfd: `flowchart LR
  P2["Python 2: print stmt, 5/2==2, % fmt"] -->|"Python 3.0"| P3["Python 3: print(), True /, UTF-8 str"]
  P3 -->|"Python 3.6 PEP 498"| FSTR["f-Strings + Type Hints"]
  FSTR -->|"Python 3.8-3.13"| MOD["f'{x=}' Debug + PEP 701"]`,
    correlatedQuiz: {
      id: 'q-evo-p2p-1',
      question: 'In Python 3, what do `7 / 2` and `7 // 2` evaluate to respectively?',
      options: [
        { id: 'a', text: '3 and 3.5' },
        { id: 'b', text: '3.5 (true float division) and 3 (explicit floor division)' },
        { id: 'c', text: 'Both return 3' },
      ],
      correctId: 'b',
      explanation: 'Python 3 fixed Python 2’s silent truncation bug: `/` always performs true floating-point division, while `//` explicitly requests floor integer division.',
    },
    microGoal: {
      id: 'goal-p2p-fstring',
      goalTitle: 'Modernize Python 2 Code -> Python 3 f-String & True/Floor Division',
      prompt: 'Upgrade the Python 2 snippet to use `print(...)`, an f-string, explicit `//` floor division, and `range(...)`.',
      language: 'python',
      starterCode: `# Legacy Python 2 style
pages = 15 / 4
print "Pages: %d for %s" % (pages, topic)`,
      quickSnippets: [
        { label: 'Floor // + f-string', snippet: 'pages = 15 // 4\nprint(f"Pages: {pages} for {topic}")' },
      ],
      rules: [
        {
          id: 'floor-div',
          label: 'Use explicit `15 // 4` floor division',
          hint: 'Change `15 / 4` to `15 // 4` so integer division intent is explicit.',
          test: (code) => /15\s*\/\/\s*4/.test(code),
        },
        {
          id: 'print-fstring',
          label: 'Use `print(f"...")` instead of Python 2 `print "..." % (...)`',
          hint: 'Write `print(f"Pages: {pages} for {topic}")`.',
          test: (code) => /print\s*\(\s*f['"][^'"]*\{pages\}[^'"]*\{topic\}[^'"]*['"]\s*\)/.test(code),
        },
      ],
      referenceSolution: `pages = 15 // 4
print(f"Pages: {pages} for {topic}")`,
    },
  },
  {
    id: 'evo-p2p-classes-typing-match',
    track: 'python-to-python',
    number: 5,
    title: 'Python 2/3.5 -> Python 3.7 -> Python 3.10–3.13+: Boilerplate Classes -> Dataclasses, `|` Unions & `match/case`',
    shortTitle: 'Dataclasses, Types & match',
    category: 'Data Models & Pattern Matching',
    summary:
      'Follow Python’s clean evolution from hand-written `__init__` + `Optional[List[str]]` + `if/elif` chains into `@dataclass(frozen=True, slots=True)`, native `list[str] | None` types, and structural `match/case`.',
    whyItEvolved:
      'Eliminated repetitive class boilerplate, removed `from typing import List, Dict, Optional, Union` import noise, and enabled structural destructuring for nested JSON/AST/event payloads.',
    stages: [
      {
        versionLabel: 'Python 2.7–3.6',
        eraTag: 'Manual __init__ + typing.Optional',
        headline: 'Hand-Written Classes, typing.List/Union & isinstance Chains',
        syntaxChanges: [
          'Manual `__init__`, `__repr__`, `__eq__` methods',
          'Required `from typing import List, Optional, Union`',
          'Verbose `if isinstance(evt, dict) and evt.get("type") == ...`',
        ],
        code: `from typing import Optional, List

class Event:
    def __init__(self, kind: str, tags: Optional[List[str]] = None):
        self.kind = kind
        self.tags = tags or []`,
        runtimeImpact: 'Verbose typing imports; lacks auto-generated __eq__/__repr__.',
      },
      {
        versionLabel: 'Python 3.7–3.9',
        eraTag: '@dataclass + Built-in Generics',
        headline: '@dataclass Auto-Synthesis & Native `list[str]` (PEP 585)',
        syntaxChanges: [
          '@dataclass synthesizes __init__, __repr__, __eq__ (and __hash__ if frozen=True)',
          'Python 3.9+ lets you write `list[str]` and `dict[str, int]` directly without `typing.List`',
        ],
        code: `from dataclasses import dataclass, field

@dataclass(frozen=True)
class Event:
    kind: str
    tags: tuple[str, ...] = ()`,
        runtimeImpact: 'Immutable, hashable, concise value objects.',
      },
      {
        versionLabel: 'Python 3.10–3.13+',
        eraTag: 'slots=True, `|` Unions & match/case',
        headline: 'Slotted Dataclasses, `X | None` Syntax & Structural Pattern Matching',
        syntaxChanges: [
          '`@dataclass(frozen=True, slots=True)` cuts per-object RAM ~40%',
          'PEP 604 `str | None` replaces `Optional[str]`',
          'PEP 634 `match/case` destructures dataclasses, dicts, and sequences cleanly',
        ],
        code: `@dataclass(frozen=True, slots=True)
class Event:
    kind: str
    payload: str | None = None

match event:
    case Event(kind="PAID", payload=ref) if ref is not None:
        handle_paid(ref)
    case Event(kind="CANCELLED"):
        handle_cancel()`,
        runtimeImpact: 'Low RAM footprint + expressive structural destructuring.',
      },
    ],
    mermaidDfd: `flowchart LR
  OLD["Py 3.5: Manual __init__ + Optional[List]"] -->|"Py 3.7-3.9"| DC["@dataclass + Built-in list[str]"]
  DC -->|"Py 3.10-3.13"| MATCH["slots=True + str | None + match/case"]`,
    correlatedQuiz: {
      id: 'q-evo-p2p-2',
      question: 'In Python 3.10+, what does `user_id: int | None = None` replace from Python 3.5–3.9?',
      options: [
        { id: 'a', text: 'A bitwise OR operation executed at runtime' },
        { id: 'b', text: '`from typing import Optional; user_id: Optional[int] = None`' },
        { id: 'c', text: 'A Python 2 exception handler' },
      ],
      correctId: 'b',
      explanation: 'PEP 604 introduced the clean `X | Y` union operator in type annotations, replacing verbose `Union[X, Y]` and `Optional[X]` imports.',
    },
    microGoal: {
      id: 'goal-p2p-modern-dc',
      goalTitle: 'Upgrade to Python 3.10+ Slotted Dataclass & `|` Union Type',
      prompt: 'Convert the legacy class into `@dataclass(frozen=True, slots=True)` with `note: str | None = None`.',
      language: 'python',
      starterCode: `from typing import Optional

class Ticket:
    def __init__(self, code: str, note: Optional[str] = None):
        self.code = code
        self.note = note`,
      quickSnippets: [
        { label: '@dataclass(frozen=True, slots=True)', snippet: 'from dataclasses import dataclass\n\n@dataclass(frozen=True, slots=True)\nclass Ticket:\n    code: str\n    note: str | None = None' },
      ],
      rules: [
        {
          id: 'slotted-dc',
          label: 'Use `@dataclass(frozen=True, slots=True)`',
          hint: 'Decorate Ticket with `@dataclass(frozen=True, slots=True)`.',
          test: (code) => /@dataclass\s*\([^)]*frozen\s*=\s*True[^)]*slots\s*=\s*True/.test(code) || /@dataclass\s*\([^)]*slots\s*=\s*True[^)]*frozen\s*=\s*True/.test(code),
        },
        {
          id: 'pipe-union',
          label: 'Replace `Optional[str]` with modern `str | None = None`',
          hint: 'Write `note: str | None = None`.',
          test: (code) => /note\s*:\s*str\s*\|\s*None\s*=\s*None/.test(code),
        },
      ],
      referenceSolution: `from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Ticket:
    code: str
    note: str | None = None`,
    },
  },
  {
    id: 'evo-p2p-concurrency-nogil',
    track: 'python-to-python',
    number: 6,
    title: 'Python 2/3.4 -> Python 3.11 -> Python 3.13+: Callbacks & GIL -> TaskGroup & Free-Threaded No-GIL',
    shortTitle: 'Python Async & No-GIL',
    category: 'Concurrency Evolution',
    summary:
      'Trace Python’s async & parallel journey: from raw `threading.Thread` (GIL-bound) and `@asyncio.coroutine / yield from` (3.4) to `async/await` (3.5), structured `asyncio.TaskGroup` (3.11+), and Free-Threaded No-GIL `3.13t` (PEP 703).',
    whyItEvolved:
      'Unstructured `asyncio.gather` leaked orphan tasks on errors, and the Global Interpreter Lock (GIL) historically forced CPU-bound workloads into multi-process copies.',
    stages: [
      {
        versionLabel: 'Python 3.4',
        eraTag: 'Generator Coroutines',
        headline: '@asyncio.coroutine & yield from + Unstructured gather()',
        syntaxChanges: [
          'Coroutines reused generator `yield from` syntax',
          'Manual event loop boilerplate `asyncio.get_event_loop().run_until_complete(...)`',
        ],
        code: `@asyncio.coroutine
def fetch_all():
    res = yield from asyncio.gather(call_a(), call_b())
    return res`,
        runtimeImpact: 'Confused generators with coroutines; failed tasks could orphan sibling work.',
      },
      {
        versionLabel: 'Python 3.7–3.10',
        eraTag: 'async/await + asyncio.run()',
        headline: 'Native Coroutines & One-Line `asyncio.run()`',
        syntaxChanges: [
          'Dedicated `async def` and `await` keywords',
          '`asyncio.run(main())` manages event loop creation and teardown cleanly',
        ],
        code: `async def fetch_all():
    return await asyncio.gather(call_a(), call_b())

asyncio.run(fetch_all())`,
        runtimeImpact: 'Clean syntax, but `gather()` still does not automatically cancel sibling tasks cleanly in all failure paths.',
      },
      {
        versionLabel: 'Python 3.11–3.13+',
        eraTag: 'Structured TaskGroup + PEP 703 No-GIL',
        headline: 'Structured Concurrency (`async with TaskGroup`) + True Multi-Core Threads (3.13t)',
        syntaxChanges: [
          '`async with asyncio.TaskGroup() as tg:` guarantees all tasks finish or cancel together',
          'Handles multiple concurrent failures cleanly via `except*` (PEP 654 ExceptionGroup)',
          'Python 3.13t experimental No-GIL build lets threads scale CPU work across cores',
        ],
        code: `async def fetch_all():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(call_a())
        t2 = tg.create_task(call_b())
    return t1.result(), t2.result()`,
        runtimeImpact: 'Zero orphan background tasks + structured error cancellation.',
      },
    ],
    mermaidDfd: `flowchart LR
  Y34["Py 3.4: yield from"] -->|"Py 3.5/3.7"| AW["async/await + asyncio.run()"]
  AW -->|"Py 3.11 Structured"| TG["async with asyncio.TaskGroup()"]
  TG -->|"Py 3.13t PEP 703"| NOGIL["Free-Threaded Multi-Core Option"]`,
    correlatedQuiz: {
      id: 'q-evo-p2p-3',
      question: 'What critical reliability guarantee does `async with asyncio.TaskGroup() as tg:` add over firing detached `asyncio.create_task()` calls?',
      options: [
        { id: 'a', text: 'It automatically compiles Python to C++' },
        { id: 'b', text: 'All sibling tasks are awaited before exit—and if one raises an error, siblings are automatically cancelled (zero orphan leaks)' },
        { id: 'c', text: 'It disables all network timeouts' },
      ],
      correctId: 'b',
      explanation: 'Structured concurrency ties task lifetimes to a lexical `async with` scope, preventing silent background task leaks and propagating errors cleanly via ExceptionGroup.',
    },
    microGoal: {
      id: 'goal-p2p-taskgroup',
      goalTitle: 'Upgrade asyncio.gather -> Structured asyncio.TaskGroup',
      prompt: 'Rewrite the function using `async with asyncio.TaskGroup() as tg:` and `tg.create_task(...)`.',
      language: 'python',
      starterCode: `async def load_dashboard():
    return await asyncio.gather(get_user(), get_stats())`,
      quickSnippets: [
        { label: 'TaskGroup block', snippet: 'async def load_dashboard():\n    async with asyncio.TaskGroup() as tg:\n        u = tg.create_task(get_user())\n        s = tg.create_task(get_stats())\n    return u.result(), s.result()' },
      ],
      rules: [
        {
          id: 'use-tg',
          label: 'Enter a structured `async with asyncio.TaskGroup() as tg:` scope',
          hint: 'Use `async with asyncio.TaskGroup() as tg:`.',
          test: (code) => /async\s+with\s+asyncio\.TaskGroup\s*\(\s*\)\s+as\s+\w+\s*:/.test(code),
        },
        {
          id: 'create-tasks',
          label: 'Schedule both coroutines via `tg.create_task(...)` and read `.result()`',
          hint: 'Call `tg.create_task(get_user())` and `tg.create_task(get_stats())`, then return `.result()`.',
          test: (code) => /\.create_task\s*\(\s*get_user/.test(code) && /\.create_task\s*\(\s*get_stats/.test(code) && /\.result\s*\(\s*\)/.test(code),
        },
      ],
      referenceSolution: `async def load_dashboard():
    async with asyncio.TaskGroup() as tg:
        u = tg.create_task(get_user())
        s = tg.create_task(get_stats())
    return u.result(), s.result()`,
    },
  },

  /* ======================================================================== */
  /* TRACK 3: JAVA -> PYTHON CORRELATED CROSS-LANGUAGE EVOLUTION              */
  /* ======================================================================== */
  {
    id: 'evo-j2p-correlated-models',
    track: 'java-to-python',
    number: 7,
    title: 'Java -> Python Correlated Evolution: Data Carriers, Pattern Matching & Pipelines',
    shortTitle: 'Java -> Python Data & Match',
    category: 'Cross-Language Correlation',
    summary:
      'Compare how BOTH ecosystems converged on the exact same modern design pillars: immutable value types (`record` ↔ `@dataclass(frozen=True)`), structural matching (`switch` ↔ `match/case`), and concise pipelines (`Stream` ↔ comprehension/generator).',
    whyItEvolved:
      'Seeing the 1-to-1 correlation lets Java engineers become fluent in Python (and vice versa) in days instead of months because the underlying computer science abstractions are identical!',
    stages: [
      {
        versionLabel: 'Java 21 LTS',
        eraTag: 'Nominal Static Power',
        headline: 'Sealed Record + Exhaustive Switch + Stream Pipeline',
        syntaxChanges: [
          'Compile-time nominal type verification via `sealed` & `record`',
          'Stream `.filter().map().toList()` executes lazily in JVM JIT',
        ],
        code: `record Item(String sku, int price) {}

var premium = items.stream()
    .filter(i -> i.price() >= 50)
    .map(Item::sku)
    .toList();`,
        runtimeImpact: 'Compiled bytecode with JIT escape analysis & zero reflection.',
      },
      {
        versionLabel: 'Python 3.10–3.13+',
        eraTag: 'Expressive Structural Power',
        headline: 'Slotted Frozen Dataclass + List Comprehension + match/case',
        syntaxChanges: [
          '1-to-1 equivalent: `@dataclass(frozen=True, slots=True)` matches Java `record`',
          'Comprehension `[i.sku for i in items if i.price >= 50]` replaces `.stream().filter().map().toList()`',
        ],
        code: `@dataclass(frozen=True, slots=True)
class Item:
    sku: str
    price: int

premium = [i.sku for i in items if i.price >= 50]`,
        runtimeImpact: 'Compact C-slot instances + concise single-line readability.',
      },
    ],
    mermaidDfd: `flowchart LR
  JREC["Java: record + sealed switch"] -->|"1-to-1 Concept Map"| PDC["Python: @dataclass(frozen=True) + match"]
  JSTR["Java: .stream().filter().map()"] -->|"1-to-1 Concept Map"| PCOMP["Python: Comprehension / Generator"]
  JTWR["Java: try-with-resources"] -->|"1-to-1 Concept Map"| PWITH["Python: with Context Manager"]`,
    correlatedQuiz: {
      id: 'q-evo-j2p-1',
      question: 'Which Python construct is the closest 1-to-1 equivalent of a Java 16+ `record User(String id, int age) {}`?',
      options: [
        { id: 'a', text: 'A plain mutable Python `dict`' },
        { id: 'b', text: '`@dataclass(frozen=True, slots=True)` — immutable, auto-generated equality, hash, and repr' },
        { id: 'c', text: 'A global list of strings' },
      ],
      correctId: 'b',
      explanation: 'Both Java `record` and Python `@dataclass(frozen=True, slots=True)` generate immutable value semantics, readable string representation, structural equality, and safe hashing.',
    },
    microGoal: {
      id: 'goal-j2p-port-stream',
      goalTitle: 'Port Java 21 Record + Stream -> Pythonic Dataclass + Comprehension',
      prompt: 'Translate the Java `record` + `.stream().filter().map().toList()` into a Python `@dataclass(frozen=True)` and list comprehension.',
      language: 'python',
      starterCode: `# Port this Java:
# record Book(String title, int pages) {}
# var longTitles = books.stream().filter(b -> b.pages() > 300).map(Book::title).toList();

from dataclasses import dataclass

# TODO: write @dataclass(frozen=True) Book and long_titles comprehension`,
      quickSnippets: [
        { label: 'Frozen Book + Comprehension', snippet: 'from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Book:\n    title: str\n    pages: int\n\nlong_titles = [b.title for b in books if b.pages > 300]' },
      ],
      rules: [
        {
          id: 'frozen-book',
          label: 'Define `@dataclass(frozen=True)` class Book with title and pages',
          hint: 'Use `@dataclass(frozen=True)` on `class Book:` with `title: str` and `pages: int`.',
          test: (code) => /@dataclass\s*\([^)]*frozen\s*=\s*True/.test(code) && /class\s+Book\b/.test(code),
        },
        {
          id: 'list-comp',
          label: 'Build `long_titles` with a Python list comprehension filtering `b.pages > 300`',
          hint: 'Write `long_titles = [b.title for b in books if b.pages > 300]`.',
          test: (code) => /long_titles\s*=\s*\[[^\]]*\.title\s+for\s+\w+\s+in\s+books\s+if\s+\w+\.pages\s*>\s*300\s*\]/.test(code),
        },
      ],
      referenceSolution: `from dataclasses import dataclass

@dataclass(frozen=True)
class Book:
    title: str
    pages: int

long_titles = [b.title for b in books if b.pages > 300]`,
    },
  },
  {
    id: 'evo-j2p-correlated-concurrency',
    track: 'java-to-python',
    number: 8,
    title: 'Java -> Python Correlated Concurrency: Loom Virtual Threads vs. Python asyncio & ProcessPool',
    shortTitle: 'Java -> Python Concurrency',
    category: 'Cross-Language Concurrency',
    summary:
      'Correlate Java’s true multi-core JVM threads + Loom Virtual Threads directly with Python’s asyncio event loop (I/O-bound) and ProcessPoolExecutor / 3.13t No-GIL (CPU-bound) so you always pick the exact right primitive.',
    whyItEvolved:
      'Many Java developers write `threading.Thread` in Python expecting 8-core CPU speedup—only to hit the GIL! Mapping Java concurrency primitives cleanly to Python prevents catastrophic production bottlenecks.',
    stages: [
      {
        versionLabel: 'Java (Platform + Loom)',
        eraTag: 'True Multi-Core + Virtual I/O',
        headline: 'Virtual Threads for High-Fanout I/O; Fixed OS Pool for CPU Math',
        syntaxChanges: [
          'JVM has NO global interpreter lock—every OS thread executes Java bytecode in parallel across CPU cores',
          'Java 21 Virtual Threads scale 100k+ blocking I/O calls cleanly',
        ],
        code: `// Java: I/O fan-out with Virtual Threads
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    var a = exec.submit(() -> httpGet("/orders"));
    var b = exec.submit(() -> httpGet("/profile"));
    return merge(a.get(), b.get());
}`,
        runtimeImpact: 'Preemptive OS scheduling for CPU + cooperative carrier unmounting for I/O.',
      },
      {
        versionLabel: 'Python (asyncio + ProcessPool)',
        eraTag: 'Cooperative Event Loop + Multi-Core',
        headline: 'asyncio.TaskGroup for High-Fanout I/O; ProcessPool / 3.13t for CPU Math',
        syntaxChanges: [
          'Use `async with asyncio.TaskGroup()` for 10k+ concurrent network calls on 1 thread',
          'Use `ProcessPoolExecutor` (or free-threaded 3.13t) for pure-Python CPU parallelism',
        ],
        code: `# Python: I/O fan-out with Structured TaskGroup
async def load_all():
    async with asyncio.TaskGroup() as tg:
        a = tg.create_task(http_get("/orders"))
        b = tg.create_task(http_get("/profile"))
    return merge(a.result(), b.result())`,
        runtimeImpact: 'Single-thread cooperative switching at microsecond cost for I/O.',
      },
    ],
    mermaidDfd: `flowchart LR
  IO["Workload: High-Fanout Network I/O"] -->|"Java 21"| JV["Virtual Threads (Unmount on Block)"]
  IO -->|"Python 3.11+"| PA["asyncio.TaskGroup (Event Loop)"]
  CPU["Workload: Heavy CPU Compute"] -->|"Java 1+"| JC["Fixed ThreadPool (True Multi-Core)"]
  CPU -->|"Python"| PC["ProcessPoolExecutor / 3.13t No-GIL"]`,
    correlatedQuiz: {
      id: 'q-evo-j2p-2',
      question: 'A Java engineer migrates a CPU-heavy image hashing loop to Python using 8 `threading.Thread` workers on standard CPython (with GIL), but throughput does NOT speed up. Why?',
      options: [
        { id: 'a', text: 'Python threads cannot run loops' },
        { id: 'b', text: 'Standard CPython’s GIL allows only one thread to execute Python bytecode at a time; use ProcessPoolExecutor (or free-threaded 3.13t) for CPU parallelism' },
        { id: 'c', text: 'asyncio automatically disabled the threads' },
      ],
      correctId: 'b',
      explanation: 'Unlike the JVM, standard CPython serializes Python bytecode under the GIL. Threads accelerate I/O (GIL releases during socket/file waits), while CPU-bound Python needs ProcessPoolExecutor, C/NumPy extensions, or 3.13t No-GIL.',
    },
    microGoal: {
      id: 'goal-j2p-cpu-pool',
      goalTitle: 'Choose the Right Multi-Core Python Pool for CPU Compute',
      prompt: 'Replace the GIL-bound `ThreadPoolExecutor` with a scoped `ProcessPoolExecutor` inside a `with` block and guard it with `if __name__ == "__main__":`.',
      language: 'python',
      starterCode: `from concurrent.futures import ThreadPoolExecutor

def heavy_hash(n):
    return sum(i * i for i in range(n))

# TODO: use ProcessPoolExecutor inside with + __main__ guard
with ThreadPoolExecutor() as pool:
    results = list(pool.map(heavy_hash, [50000, 60000]))`,
      quickSnippets: [
        { label: 'ProcessPoolExecutor + __main__', snippet: 'from concurrent.futures import ProcessPoolExecutor\n\ndef heavy_hash(n):\n    return sum(i * i for i in range(n))\n\nif __name__ == "__main__":\n    with ProcessPoolExecutor() as pool:\n        results = list(pool.map(heavy_hash, [50000, 60000]))' },
      ],
      rules: [
        {
          id: 'use-process-pool',
          label: 'Use `ProcessPoolExecutor` instead of `ThreadPoolExecutor` for CPU-bound Python work',
          hint: 'Import and instantiate `ProcessPoolExecutor()` inside `with`.',
          test: (code) => /ProcessPoolExecutor/.test(code) && !/ThreadPoolExecutor/.test(code),
        },
        {
          id: 'guard-main',
          label: 'Protect multiprocessing spawn with `if __name__ == "__main__":`',
          hint: 'Wrap the `with ProcessPoolExecutor()` block inside `if __name__ == "__main__":`.',
          test: (code) => /if\s+__name__\s*==\s*['"]__main__['"]\s*:/.test(code),
        },
      ],
      referenceSolution: `from concurrent.futures import ProcessPoolExecutor

def heavy_hash(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    with ProcessPoolExecutor() as pool:
        results = list(pool.map(heavy_hash, [50000, 60000]))`,
    },
  },
];
