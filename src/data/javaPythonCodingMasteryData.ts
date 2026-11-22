export type CodingMasteryLevel = 'Basics' | 'Intermediate' | 'Advanced';

export interface ExecutionTraceStep {
  step: number;
  highlightLinePy: number;
  highlightLineJava: number;
  action: string;
  stackFrame: { name: string; value: string; type: string }[];
  heapObjects: { ref: string; label: string; detail: string }[];
  consoleOut: string;
}

export interface CodingMasteryLesson {
  id: string;
  number: number;
  level: CodingMasteryLevel;
  category: string;
  title: string;
  subtitle: string;
  readTime: string;
  mentalModel: string;
  whySeniorsCare: string;
  pythonIdiomatic: string;
  pythonAntiPattern: string;
  pythonPitfallNote: string;
  javaIdiomatic: string;
  javaAntiPattern: string;
  javaPitfallNote: string;
  keyDifferences: {
    aspect: string;
    python: string;
    java: string;
  }[];
  traceScenarioTitle: string;
  traceSteps: ExecutionTraceStep[];
  quickCheck: {
    question: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
  };
}

export const JAVA_PYTHON_MASTERY_LESSONS: CodingMasteryLesson[] = [
  {
    id: 'jp-01-types-memory',
    number: 1,
    level: 'Basics',
    category: 'Foundations & Memory',
    title: 'Variables, Types & Stack vs. Heap Memory',
    subtitle: 'Understand name-binding references in Python vs. primitives and object references in Java.',
    readTime: '6 min',
    mentalModel:
      'In Python, EVERY value (even an integer) is a PyObject on the heap and variables are sticky-note references pointing to it. In Java, primitives (int, long, double, boolean) live directly on the thread stack, while objects live on the heap and variables hold pointers to them.',
    whySeniorsCare:
      'Understanding aliasing and value-vs-reference semantics prevents subtle shared-state bugs, unnecessary autoboxing GC pressure in hot Java loops, and accidental list mutation in Python.',
    pythonIdiomatic: `from dataclasses import dataclass

# Modern Python 3.13+: Explicit type hints + immutable tuple/dataclass
@dataclass(frozen=True, slots=True)
class OrderTotal:
    currency: str
    cents: int

def apply_discount(order: OrderTotal, pct: int) -> OrderTotal:
    discounted = order.cents - (order.cents * pct // 100)
    return OrderTotal(currency=order.currency, cents=discounted)

base = OrderTotal("USD", 5000)
promo = apply_discount(base, 10)
print(f"{base.cents} -> {promo.cents}")  # 5000 -> 4500`,
    pythonAntiPattern: `# Anti-pattern: Using float for money & mutating shared dict in place
def apply_discount_bad(order, pct):
    order["amount"] = order["amount"] * (1 - pct / 100)
    return order

base = {"currency": "USD", "amount": 50.0}
promo = apply_discount_bad(base, 10)  # Silently mutates base too!`,
    pythonPitfallNote:
      'Binary floats suffer precision drift (0.1 + 0.2 == 0.30000000000000004), and mutating a dict parameter aliases and corrupts the caller object.',
    javaIdiomatic: `// Modern Java 21+: Immutable record + primitive long cents (no boxing)
public record OrderTotal(String currency, long cents) {
    public OrderTotal applyDiscount(int pct) {
        long discounted = cents - (cents * pct / 100L);
        return new OrderTotal(currency, discounted);
    }
}

var base = new OrderTotal("USD", 5000L);
var promo = base.applyDiscount(10);
System.out.printf("%d -> %d%n", base.cents(), promo.cents()); // 5000 -> 4500`,
    javaAntiPattern: `// Anti-pattern: Autoboxing Long in hot loops & comparing wrappers with ==
Long a = 5000L;
Long b = 5000L;
boolean same = (a == b); // FALSE! Integer/Long cache only covers -128..127
double money = 0.1 + 0.2; // 0.30000000000000004`,
    javaPitfallNote:
      'Using == on boxed Integer/Long compares heap references rather than numeric values outside [-128, 127]. Always use primitives or .equals().',
    keyDifferences: [
      {
        aspect: 'Numbers & Primitives',
        python: 'Arbitrary-precision int (never overflows, always heap PyObject)',
        java: 'Fixed-width stack primitives (int 32-bit, long 64-bit) — zero heap allocation',
      },
      {
        aspect: 'Type Checking',
        python: 'Dynamic at runtime; static via mypy / pyright type annotations',
        java: 'Strict compile-time static typing with local `var` inference',
      },
      {
        aspect: 'Immutable Value Carrier',
        python: '@dataclass(frozen=True, slots=True)',
        java: 'public record Name(Type field) {}',
      },
    ],
    traceScenarioTitle: 'Trace: Immutable Value Creation & Discount Calculation',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 11,
        highlightLineJava: 9,
        action: 'Allocate immutable OrderTotal("USD", 5000) on the heap and bind local reference `base`.',
        stackFrame: [{ name: 'base', value: '-> #obj1', type: 'OrderTotal' }],
        heapObjects: [{ ref: '#obj1', label: 'OrderTotal', detail: 'currency="USD", cents=5000 (immutable)' }],
        consoleOut: '(waiting)',
      },
      {
        step: 2,
        highlightLinePy: 8,
        highlightLineJava: 3,
        action: 'Enter apply_discount / applyDiscount frame. Compute integer math: 5000 - (5000 * 10 / 100) = 4500.',
        stackFrame: [
          { name: 'base', value: '-> #obj1', type: 'OrderTotal' },
          { name: 'pct', value: '10', type: 'int' },
          { name: 'discounted', value: '4500', type: 'int / long' },
        ],
        heapObjects: [{ ref: '#obj1', label: 'OrderTotal', detail: 'currency="USD", cents=5000' }],
        consoleOut: '(computing 4500)',
      },
      {
        step: 3,
        highlightLinePy: 12,
        highlightLineJava: 10,
        action: 'Return a brand-new OrderTotal(#obj2). Original `base` (#obj1) stays untouched — zero side effects.',
        stackFrame: [
          { name: 'base', value: '-> #obj1', type: 'OrderTotal' },
          { name: 'promo', value: '-> #obj2', type: 'OrderTotal' },
        ],
        heapObjects: [
          { ref: '#obj1', label: 'OrderTotal', detail: 'currency="USD", cents=5000' },
          { ref: '#obj2', label: 'OrderTotal', detail: 'currency="USD", cents=4500' },
        ],
        consoleOut: '5000 -> 4500',
      },
    ],
    quickCheck: {
      question: 'In Java, what does `Integer.valueOf(200) == Integer.valueOf(200)` evaluate to?',
      options: [
        { id: 'a', text: 'true, because both wrap the integer 200' },
        { id: 'b', text: 'false, because 200 is outside the -128..127 Integer cache and == checks reference identity' },
        { id: 'c', text: 'Compile-time error because == cannot be used on objects' },
      ],
      correctId: 'b',
      explanation:
        'Java caches boxed Integers from -128 to 127. For 200, two distinct heap objects are allocated, so `==` returns false. Use `.equals()` or unboxed `int`.',
    },
  },
  {
    id: 'jp-02-control-pattern-matching',
    number: 2,
    level: 'Basics',
    category: 'Control Flow & Pattern Matching',
    title: 'Structural Pattern Matching & Exhaustive Branching',
    subtitle: 'Replace fragile nested if/elif chains with Python match/case and Java 21 sealed switch expressions.',
    readTime: '6 min',
    mentalModel:
      'Pattern matching checks BOTH the shape/type of data AND binds its inner fields in one step. Paired with guards (`if` in Python, `when` in Java), it turns messy branching into declarative, self-documenting rules.',
    whySeniorsCare:
      'Java 21 sealed interfaces + switch expressions force the compiler to verify every state is handled—adding a new event type immediately highlights every place in the codebase that must be updated.',
    pythonIdiomatic: `from dataclasses import dataclass

@dataclass(frozen=True)
class Paid:
    amount: int
@dataclass(frozen=True)
class Refunded:
    amount: int
    reason: str

def summarize(event: Paid | Refunded) -> str:
    match event:
        case Paid(amount=amt) if amt >= 10000:
            return f"VIP payment: \${amt / 100:.2f}"
        case Paid(amount=amt):
            return f"Standard payment: \${amt / 100:.2f}"
        case Refunded(amount=amt, reason=r):
            return f"Refund \${amt / 100:.2f} ({r})"`,
    pythonAntiPattern: `# Anti-pattern: Deep isinstance chains + manual attribute lookups
def summarize_bad(event):
    if isinstance(event, dict) and event.get("type") == "paid":
        if event["amount"] >= 10000:
            return "VIP"
        return "Standard"
    elif isinstance(event, dict) and event.get("type") == "refund":
        return "Refund"
    return "Unknown"  # Silently swallows new event variants!`,
    pythonPitfallNote:
      'A catch-all `else: return "Unknown"` hides missing cases when new domain events are added. Pair Union types with `assert_never()` so mypy/pyright checks exhaustiveness.',
    javaIdiomatic: `// Java 21+: Sealed hierarchy + exhaustive switch with record deconstruction
sealed interface PaymentEvent permits Paid, Refunded {}
record Paid(long amount) implements PaymentEvent {}
record Refunded(long amount, String reason) implements PaymentEvent {}

static String summarize(PaymentEvent event) {
    return switch (event) {
        case Paid(long amt) when amt >= 10_000 -> "VIP payment: $" + (amt / 100.0);
        case Paid(long amt)                    -> "Standard payment: $" + (amt / 100.0);
        case Refunded(long amt, String r)      -> "Refund $" + (amt / 100.0) + " (" + r + ")";
    }; // No default needed — compiler proves exhaustiveness!
}`,
    javaAntiPattern: `// Anti-pattern: Legacy switch without break or manual instanceof casts
String summarizeOld(Object event) {
    if (event instanceof Paid) {
        Paid p = (Paid) event;
        return "Paid " + p.amount();
    } else if (event instanceof Refunded) {
        Refunded r = (Refunded) event;
        return "Refund " + r.amount();
    }
    return null; // NullPointerException waiting to happen
}`,
    javaPitfallNote:
      'Legacy statement switches risk silent fall-through bugs when `break` is forgotten, and manual casts clutter business logic.',
    keyDifferences: [
      {
        aspect: 'Guard Syntax',
        python: 'case Paid(amount=a) if a >= 10000:',
        java: 'case Paid(long a) when a >= 10_000 ->',
      },
      {
        aspect: 'Exhaustiveness Guarantee',
        python: 'Checked statically by mypy/pyright using typing.assert_never',
        java: 'Enforced natively by javac on sealed interfaces & enums',
      },
      {
        aspect: 'Return Value',
        python: 'match is a statement (use return inside branches)',
        java: 'switch is an expression that directly evaluates to a value',
      },
    ],
    traceScenarioTitle: 'Trace: Deconstructing Paid(12500) Through Pattern Guards',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 12,
        highlightLineJava: 7,
        action: 'Evaluate subject `event` = Paid(amount=12500) against the first pattern arm.',
        stackFrame: [{ name: 'event', value: 'Paid(12500)', type: 'PaymentEvent' }],
        heapObjects: [{ ref: '#ev1', label: 'Paid', detail: 'amount=12500' }],
        consoleOut: '(matching arm 1)',
      },
      {
        step: 2,
        highlightLinePy: 13,
        highlightLineJava: 8,
        action: 'Shape matches `Paid`, bind `amt = 12500`, then test guard `amt >= 10000` -> TRUE.',
        stackFrame: [
          { name: 'event', value: 'Paid(12500)', type: 'PaymentEvent' },
          { name: 'amt', value: '12500', type: 'int / long' },
        ],
        heapObjects: [{ ref: '#ev1', label: 'Paid', detail: 'amount=12500' }],
        consoleOut: '(guard passed)',
      },
      {
        step: 3,
        highlightLinePy: 14,
        highlightLineJava: 8,
        action: 'Short-circuit remaining arms and return formatted VIP summary string.',
        stackFrame: [{ name: 'return', value: '"VIP payment: $125.00"', type: 'String' }],
        heapObjects: [{ ref: '#str1', label: 'String', detail: '"VIP payment: $125.00"' }],
        consoleOut: 'VIP payment: $125.00',
      },
    ],
    quickCheck: {
      question: 'Why is omitting the `default` branch preferred when switching over a Java 21 `sealed interface`?',
      options: [
        { id: 'a', text: 'It makes bytecode run 10x faster' },
        { id: 'b', text: 'If someone adds a new permitted subtype later, javac fails compilation until every switch handles it' },
        { id: 'c', text: 'Java 21 forbids default branches in switch expressions' },
      ],
      correctId: 'b',
      explanation:
        'Without a catch-all `default`, adding a new permitted subclass triggers a compile-time error in every switch expression, guaranteeing zero missed states.',
    },
  },
  {
    id: 'jp-03-functions-closures-streams',
    number: 3,
    level: 'Basics',
    category: 'Functions & Data Pipelines',
    title: 'Functions, Comprehensions, Lambdas & Streams',
    subtitle: 'Transform and aggregate collections cleanly without off-by-one loops or side effects.',
    readTime: '7 min',
    mentalModel:
      'Think of data transformations as an assembly line: Filter what qualifies -> Transform each item -> Collect/Aggregate the result. Python favors readable comprehensions and generator expressions; Java favors Stream pipelines.',
    whySeniorsCare:
      'Declarative pipelines are easier to read, test, and compose—and knowing when a pipeline is lazy vs. eager prevents loading millions of rows into RAM.',
    pythonIdiomatic: `from collections import defaultdict

orders = [("us", 120), ("eu", 80), ("us", 200), ("eu", 45)]

# Idiomatic comprehension + generator expression (lazy sum)
high_value = [amt for _, amt in orders if amt >= 100]
total_us = sum(amt for region, amt in orders if region == "us")

# Grouping cleanly with defaultdict
by_region: dict[str, int] = defaultdict(int)
for region, amt in orders:
    by_region[region] += amt`,
    pythonAntiPattern: `# Anti-pattern: Mutable default argument + building temp list inside sum()
def add_item(item, bucket=[]):   # BUG: bucket is created ONCE at function definition!
    bucket.append(item)
    return bucket

# Wastes RAM building an intermediate list just to sum it
total = sum([x * 2 for x in range(10_000_000)])`,
    pythonPitfallNote:
      'Never use `bucket=[]` as a default parameter—every call shares the exact same list object! Always use `bucket: list[str] | None = None`.',
    javaIdiomatic: `import java.util.*;
import java.util.stream.Collectors;

record Sale(String region, int amount) {}

var orders = List.of(
    new Sale("us", 120), new Sale("eu", 80),
    new Sale("us", 200), new Sale("eu", 45)
);

// Lazy Stream pipeline: filter -> mapToInt (no boxing!) -> sum
int totalUs = orders.stream()
    .filter(s -> s.region().equals("us"))
    .mapToInt(Sale::amount)
    .sum();

Map<String, Integer> byRegion = orders.stream()
    .collect(Collectors.groupingBy(Sale::region, Collectors.summingInt(Sale::amount)));`,
    javaAntiPattern: `// Anti-pattern: Mutating external state inside stream.forEach()
List<Integer> results = new ArrayList<>();
orders.parallelStream().forEach(s -> {
    if (s.amount() >= 100) results.add(s.amount()); // Race condition! Not thread-safe!
});`,
    javaPitfallNote:
      'Mutating an external ArrayList inside `parallelStream().forEach()` causes lost elements or `ArrayIndexOutOfBoundsException`. Always use `.toList()` or `.collect(...)`.',
    keyDifferences: [
      {
        aspect: 'Lazy Pipeline',
        python: 'Generator expression `(x for x in src if cond)`',
        java: '`list.stream().filter(...).map(...)` (executes only on terminal op)',
      },
      {
        aspect: 'Closure Variable Capture',
        python: 'Captures variables by reference (watch late binding in loops!)',
        java: 'Lambdas require captured local variables to be effectively final',
      },
      {
        aspect: 'Immutable Result List',
        python: '`tuple(...)` or list comprehension',
        java: 'Java 16+ `.toList()` returns an unmodifiable List',
      },
    ],
    traceScenarioTitle: 'Trace: Single-Pass Lazy Filter & Sum Pipeline',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 7,
        highlightLineJava: 12,
        action: 'Pull item 0: ("us", 120). Predicate region == "us" is TRUE -> accumulate 0 + 120 = 120.',
        stackFrame: [
          { name: 'current', value: '("us", 120)', type: 'Sale' },
          { name: 'accumulator', value: '120', type: 'int' },
        ],
        heapObjects: [{ ref: '#orders', label: 'List[4]', detail: 'No intermediate filtered list allocated!' }],
        consoleOut: 'acc = 120',
      },
      {
        step: 2,
        highlightLinePy: 7,
        highlightLineJava: 13,
        action: 'Pull item 1: ("eu", 80). Predicate region == "us" is FALSE -> dropped immediately.',
        stackFrame: [
          { name: 'current', value: '("eu", 80)', type: 'Sale' },
          { name: 'accumulator', value: '120', type: 'int' },
        ],
        heapObjects: [{ ref: '#orders', label: 'List[4]', detail: 'Zero GC churn' }],
        consoleOut: 'acc = 120 (skipped eu)',
      },
      {
        step: 3,
        highlightLinePy: 7,
        highlightLineJava: 15,
        action: 'Pull item 2: ("us", 200) -> acc = 320. Pull item 3: ("eu", 45) -> skipped. Terminal sum = 320.',
        stackFrame: [{ name: 'total_us / totalUs', value: '320', type: 'int' }],
        heapObjects: [{ ref: '#orders', label: 'List[4]', detail: 'O(1) extra memory' }],
        consoleOut: '320',
      },
    ],
    quickCheck: {
      question: 'What happens if you define `def append_tag(tag, tags=[]): tags.append(tag); return tags` and call it twice with `"a"` then `"b"`?',
      options: [
        { id: 'a', text: 'First call returns ["a"], second call returns ["b"]' },
        { id: 'b', text: 'First call returns ["a"], second call returns ["a", "b"] because default args are evaluated once at def time' },
        { id: 'c', text: 'Python raises a TypeError at runtime' },
      ],
      correctId: 'b',
      explanation:
        'Python evaluates default parameter expressions once when the `def` statement executes, not on each function call. Always default to `None` and initialize inside the body.',
    },
  },
  {
    id: 'jp-04-collections-hashing',
    number: 4,
    level: 'Basics',
    category: 'Core Data Structures',
    title: 'Collections Complexity & Hash Contracts',
    subtitle: 'Choose O(1) lookups over O(n) scans and protect dict/HashMap invariants.',
    readTime: '7 min',
    mentalModel:
      'Every collection trades memory layout for operation speed: dynamic arrays (`list`/`ArrayList`) give O(1) index access but O(n) front-removal; deques give O(1) both ends; hash tables (`dict`/`HashMap`) give O(1) key lookup only when hash codes remain stable.',
    whySeniorsCare:
      'A single `if user_id in active_users_list:` inside a loop turns a 10ms endpoint into a 4-second O(N^2) outage. Worse, mutating a HashMap key silently loses data inside the bucket table.',
    pythonIdiomatic: `from collections import deque, Counter

# O(1) FIFO queue using deque (never list.pop(0)!)
queue: deque[str] = deque(["job-1", "job-2"])
queue.append("job-3")
first = queue.popleft()  # O(1)

# O(1) membership check with set & frequency counting with Counter
blocked_ips = {"10.0.0.5", "10.0.0.9"}
is_blocked = "10.0.0.5" in blocked_ips  # O(1) hash lookup
top_errors = Counter(["502", "500", "502", "429"]).most_common(2)`,
    pythonAntiPattern: `# Anti-pattern: O(n) front pop & O(n) list membership inside loop
queue = list(range(100_000))
while queue:
    queue.pop(0)  # Shifts all remaining elements every iteration -> O(N^2)!`,
    pythonPitfallNote:
      'Python `list.pop(0)` shifts every element left in C memory. For queues or sliding windows, always use `collections.deque`.',
    javaIdiomatic: `import java.util.*;

// Prefer ArrayDeque over legacy LinkedList (better CPU cache locality)
Deque<String> queue = new ArrayDeque<>();
queue.offerLast("job-1");
queue.offerLast("job-2");
String first = queue.pollFirst(); // O(1)

// Frequency map cleanly with Map.merge()
Map<String, Integer> counts = new HashMap<>();
for (String code : List.of("502", "500", "502", "429")) {
    counts.merge(code, 1, Integer::sum);
}`,
    javaAntiPattern: `// Anti-pattern: Overriding equals() without hashCode() or mutating a Map key
class MutableKey {
    String id;
    // Missing hashCode() -> HashMap puts equal objects in DIFFERENT buckets!
}
// Also avoid Stack<T> (synchronized legacy Vector) & LinkedList queues`,
    javaPitfallNote:
      'In Java, if `a.equals(b)` is true, `a.hashCode() == b.hashCode()` MUST hold. Using Java `record` keys automatically generates correct immutable `equals()` and `hashCode()`.',
    keyDifferences: [
      {
        aspect: 'Insertion Order in Hash Maps',
        python: '`dict` preserves insertion order by language spec (compact array + index table)',
        java: '`HashMap` is unordered; use `LinkedHashMap` for insertion/LRU order',
      },
      {
        aspect: 'Queue Implementation',
        python: '`collections.deque` (doubly-linked blocks of 64 pointers)',
        java: '`ArrayDeque` (resizable circular array — faster than LinkedList)',
      },
      {
        aspect: 'Hash Collision Defense',
        python: 'Open addressing with randomized SipHash keys',
        java: 'Separate chaining that treeifies bucket into Red-Black Tree at 8+ collisions',
      },
    ],
    traceScenarioTitle: 'Trace: HashMap / dict Key Lookup vs. O(n) Linear Scan',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 9,
        highlightLineJava: 11,
        action: 'Compute hash("502") -> 0x4A19F3. Mask with table capacity (cap - 1) to get bucket slot #3.',
        stackFrame: [
          { name: 'key', value: '"502"', type: 'String' },
          { name: 'bucketIdx', value: '3', type: 'int' },
        ],
        heapObjects: [{ ref: '#table[3]', label: 'Bucket #3', detail: 'Entry("502" -> 1)' }],
        consoleOut: '(O(1) slot jump)',
      },
      {
        step: 2,
        highlightLinePy: 10,
        highlightLineJava: 12,
        action: 'Compare key equality in bucket #3 ("502".equals("502") == true). Merge value 1 + 1 -> 2.',
        stackFrame: [{ name: 'newValue', value: '2', type: 'int' }],
        heapObjects: [{ ref: '#table[3]', label: 'Bucket #3', detail: 'Entry("502" -> 2)' }],
        consoleOut: '{"502": 2, "500": 1, "429": 1}',
      },
    ],
    quickCheck: {
      question: 'Why does Java recommend `ArrayDeque` over `LinkedList` for stacks and queues?',
      options: [
        { id: 'a', text: 'ArrayDeque is thread-safe out of the box' },
        { id: 'b', text: 'ArrayDeque uses a contiguous circular array with zero per-node wrapper allocation and much better CPU cache locality' },
        { id: 'c', text: 'LinkedList cannot remove from the head in O(1)' },
      ],
      correctId: 'b',
      explanation:
        '`LinkedList` allocates a separate heap Node object per element and chases random memory pointers, hurting L1/L2 CPU cache hit rates compared to `ArrayDeque`.',
    },
  },
  {
    id: 'jp-05-oop-protocols-composition',
    number: 5,
    level: 'Intermediate',
    category: 'Modern OOP & Contracts',
    title: 'Protocols, Interfaces & Composition Over Inheritance',
    subtitle: 'Decouple business logic using Python structural typing (Protocol) and Java interfaces + DI.',
    readTime: '8 min',
    mentalModel:
      'Deep inheritance trees (`Animal -> Mammal -> Dog -> ServiceDog`) break when requirements cross-cut hierarchies. Composition plugs small, single-responsibility capabilities (interfaces/protocols) into a class via its constructor.',
    whySeniorsCare:
      'Constructor injection against a small interface lets you swap a real Stripe/PostgreSQL client for an in-memory fake in unit tests with zero mocking magic.',
    pythonIdiomatic: `from typing import Protocol

class Notifier(Protocol):
    def send(self, user_id: str, message: str) -> None: ...

class SlackNotifier:
    def send(self, user_id: str, message: str) -> None:
        print(f"[Slack -> {user_id}] {message}")

class AlertService:
    # Composition + structural typing: no inheritance from Notifier required!
    def __init__(self, notifier: Notifier) -> None:
        self._notifier = notifier

    def trigger_p1(self, oncall: str) -> None:
        self._notifier.send(oncall, "Checkout p99 > 800ms")`,
    pythonAntiPattern: `# Anti-pattern: Hardcoded concrete dependency inside constructor
class AlertServiceBad:
    def __init__(self):
        self.client = RealPagerDutyClient(api_key="live-key") # Untestable without monkeypatching!`,
    pythonPitfallNote:
      'Hardcoding infrastructure clients inside `__init__` forces brittle monkeypatching in tests. Pass dependencies in and type them with `typing.Protocol`.',
    javaIdiomatic: `// Java 21+: Functional/Small Interface + Constructor Injection
public interface Notifier {
    void send(String userId, String message);
}

public final class AlertService {
    private final Notifier notifier;

    public AlertService(Notifier notifier) {
        this.notifier = java.util.Objects.requireNonNull(notifier);
    }

    public void triggerP1(String oncall) {
        notifier.send(oncall, "Checkout p99 > 800ms");
    }
}
// In tests, pass a 1-line lambda because Notifier is a FunctionalInterface:
// var svc = new AlertService((u, m) -> sent.add(u + ":" + m));`,
    javaAntiPattern: `// Anti-pattern: Field injection & deep inheritance hierarchy
class BaseService extends AbstractLoggerService {
    @Autowired private PagerDutyClient client; // Hidden dependency, hard to test without Spring context!
}`,
    javaPitfallNote:
      'Field injection hides dependencies and allows partially constructed objects. Always use `private final` fields with constructor injection.',
    keyDifferences: [
      {
        aspect: 'Interface Satisfaction',
        python: 'Structural (`Protocol` / duck typing) — no explicit `implements` needed',
        java: 'Nominal (`implements Notifier`) or lambda for single-method interfaces',
      },
      {
        aspect: 'Encapsulation',
        python: 'Convention-based (`_internal`) + `@property` descriptors',
        java: 'Enforced by compiler/JVM (`private`, `package-private`, `protected`, `public`)',
      },
      {
        aspect: 'Finality & Safety',
        python: '`@final` decorator (static checker hint)',
        java: '`final class` / `sealed interface` enforced at compile & bytecode verification',
      },
    ],
    traceScenarioTitle: 'Trace: Polymorphic Dispatch via Injected Notifier',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 12,
        highlightLineJava: 9,
        action: 'Construct AlertService by injecting concrete SlackNotifier (or test lambda).',
        stackFrame: [{ name: 'svc', value: '-> #svc1', type: 'AlertService' }],
        heapObjects: [
          { ref: '#svc1', label: 'AlertService', detail: 'notifier -> #slack1' },
          { ref: '#slack1', label: 'SlackNotifier', detail: 'implements Notifier.send()' },
        ],
        consoleOut: '(wired)',
      },
      {
        step: 2,
        highlightLinePy: 16,
        highlightLineJava: 14,
        action: 'Call svc.triggerP1("alice"). Runtime dispatches `send()` dynamically to #slack1.',
        stackFrame: [
          { name: 'this', value: '#svc1', type: 'AlertService' },
          { name: 'oncall', value: '"alice"', type: 'String' },
        ],
        heapObjects: [{ ref: '#slack1', label: 'SlackNotifier.send', detail: 'invoked via vtable / method lookup' }],
        consoleOut: '[Slack -> alice] Checkout p99 > 800ms',
      },
    ],
    quickCheck: {
      question: 'Why does Python `typing.Protocol` beat `abc.ABC` when integrating third-party classes?',
      options: [
        { id: 'a', text: 'Protocol lets any class with matching method signatures qualify without modifying or subclassing the third-party class' },
        { id: 'b', text: 'Protocol compiles Python to C' },
        { id: 'c', text: 'ABC classes cannot define methods' },
      ],
      correctId: 'a',
      explanation:
        'Structural subtyping (`Protocol`) checks method signatures statically without requiring the implementing class to inherit from your base class.',
    },
  },
  {
    id: 'jp-06-errors-resources',
    number: 6,
    level: 'Intermediate',
    category: 'Reliability & Resource Safety',
    title: 'Exceptions, Context Managers & Try-With-Resources',
    subtitle: 'Prevent file/socket leaks and preserve root-cause exception chains in production.',
    readTime: '6 min',
    mentalModel:
      'Every open file handle, DB connection, or lock is a finite OS resource. Deterministic cleanup blocks (`with` in Python, `try-with-resources` in Java) guarantee `.close()` / `__exit__()` runs even when an exception unwinds the stack.',
    whySeniorsCare:
      'Swallowing exceptions or forgetting to close HTTP/DB connections causes silent connection-pool exhaustion (`HikariPool timeout` or `Too many open files`) hours after deploy.',
    pythonIdiomatic: `from contextlib import contextmanager
from typing import Iterator

class PaymentDeclinedError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code

@contextmanager
def timed_operation(name: str) -> Iterator[None]:
    print(f"start {name}")
    try:
        yield
    finally:
        print(f"cleanup {name}")  # Always runs, even on exception!

with timed_operation("charge_card"):
    try:
        raise TimeoutError("gateway timeout")
    except TimeoutError as exc:
        raise PaymentDeclinedError("GW_TIMEOUT", "Charge timed out") from exc`,
    pythonAntiPattern: `# Anti-pattern: Bare except swallows KeyboardInterrupt & loses stack trace
try:
    process_payment()
except:            # NEVER use bare except!
    pass           # Silent failure — worst debugging nightmare`,
    pythonPitfallNote:
      'Always catch specific exceptions (`except ValueError as e:`) and re-raise with `raise DomainError(...) from e` to keep the original traceback intact.',
    javaIdiomatic: `import java.io.*;
import java.nio.file.*;

// Java try-with-resources closes AutoCloseable even when an exception is thrown
public static String readFirstLine(Path path) {
    try (BufferedReader reader = Files.newBufferedReader(path)) {
        return reader.readLine();
    } catch (IOException e) {
        // Wrap checked exception with full cause preserved!
        throw new UncheckedIOException("Failed reading config: " + path, e);
    }
}`,
    javaAntiPattern: `// Anti-pattern: Returning null or swallowing exception with printStackTrace
try {
    BufferedReader r = Files.newBufferedReader(path);
    return r.readLine(); // Leaks FD if readLine() throws before r.close()!
} catch (Exception e) {
    e.printStackTrace();
    return null;
}`,
    javaPitfallNote:
      'If both the `try` body and `close()` throw, `try-with-resources` preserves the primary exception and attaches the close failure via `addSuppressed()`, unlike manual `finally` blocks.',
    keyDifferences: [
      {
        aspect: 'Checked vs Unchecked',
        python: 'All exceptions are unchecked at compile time',
        java: 'Checked (`IOException`) must be declared/caught; Unchecked (`RuntimeException`) propagate freely',
      },
      {
        aspect: 'Deterministic Cleanup',
        python: '`with expr as x:` calls `__enter__` and `__exit__`',
        java: '`try (AutoCloseable x = ...) {}` calls `x.close()` in reverse declaration order',
      },
      {
        aspect: 'Cause Chaining',
        python: '`raise DomainError("msg") from original_exc`',
        java: '`throw new DomainException("msg", originalExc)`',
      },
    ],
    traceScenarioTitle: 'Trace: Stack Unwinding & Guaranteed Resource Cleanup',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 17,
        highlightLineJava: 6,
        action: 'Enter resource scope (`with` / `try-with-resources`). Acquire handle #fd42.',
        stackFrame: [{ name: 'resource', value: '#fd42 (OPEN)', type: 'AutoCloseable / Ctx' }],
        heapObjects: [{ ref: '#fd42', label: 'OS Handle', detail: 'Status: OPEN' }],
        consoleOut: 'start charge_card',
      },
      {
        step: 2,
        highlightLinePy: 19,
        highlightLineJava: 9,
        action: 'Exception raised inside block! Normal execution aborts and stack begins unwinding.',
        stackFrame: [{ name: 'exc', value: 'TimeoutError / IOException', type: 'Exception' }],
        heapObjects: [{ ref: '#fd42', label: 'OS Handle', detail: 'Pending cleanup...' }],
        consoleOut: 'exception thrown -> unwinding',
      },
      {
        step: 3,
        highlightLinePy: 15,
        highlightLineJava: 6,
        action: 'Runtime invokes `finally` / `close()` automatically BEFORE propagating wrapped exception.',
        stackFrame: [{ name: 'propagated', value: 'PaymentDeclinedError(cause=TimeoutError)', type: 'DomainError' }],
        heapObjects: [{ ref: '#fd42', label: 'OS Handle', detail: 'Status: CLOSED (0 leaks)' }],
        consoleOut: 'cleanup charge_card -> raised with cause',
      },
    ],
    quickCheck: {
      question: 'In Python, what is the critical difference between `raise DomainError("x")` vs `raise DomainError("x") from err` inside an `except` block?',
      options: [
        { id: 'a', text: 'There is no difference' },
        { id: 'b', text: '`from err` explicitly chains `__cause__` so logs clearly show the direct root cause rather than an accidental nested exception' },
        { id: 'c', text: '`from err` suppresses the original traceback' },
      ],
      correctId: 'b',
      explanation:
        'Using `from err` sets `__cause__` explicitly, communicating intentional exception translation while preserving the full root-cause stack trace.',
    },
  },
  {
    id: 'jp-07-generators-lazy-streams',
    number: 7,
    level: 'Intermediate',
    category: 'Streaming & Lazy Evaluation',
    title: 'Generators, Iterators & O(1) Memory Data Streaming',
    subtitle: 'Process multi-gigabyte log files and DB cursors one chunk at a time without OOM crashes.',
    readTime: '7 min',
    mentalModel:
      'A generator function (`yield`) pauses its entire stack frame mid-execution and hands back one item on demand. Java `Stream` and `Iterator` similarly pull one element through all stages only when downstream asks for it.',
    whySeniorsCare:
      'Loading a 10 GB CSV with `readlines()` or `Files.readAllLines()` immediately triggers Kubernetes `OOMKilled (Exit 137)`. Streaming keeps heap usage flat at a few kilobytes regardless of file size.',
    pythonIdiomatic: `from pathlib import Path
from typing import Iterator

def stream_error_lines(log_path: Path) -> Iterator[str]:
    # O(1) RAM: Reads and yields ONE line at a time
    with log_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            if "ERROR" in line:
                yield line.strip()

# Pull only the first 5 errors, then stop reading the file immediately!
from itertools import islice
first_five = list(islice(stream_error_lines(Path("app.log")), 5))`,
    pythonAntiPattern: `# Anti-pattern: Eagerly materializing a huge file into a list
def load_all_errors(log_path):
    lines = open(log_path).readlines()  # 10 GB file -> Instant OOMKilled!
    return [l for l in lines if "ERROR" in l]`,
    pythonPitfallNote:
      'A generator can only be iterated ONCE. If you need multiple passes, re-create the generator or buffer only the small aggregated summary.',
    javaIdiomatic: `import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Stream;

// Files.lines() returns a LAZY Stream backed by a file descriptor (must close!)
public static List<String> firstFiveErrors(Path logPath) throws IOException {
    try (Stream<String> lines = Files.lines(logPath)) {
        return lines
            .filter(line -> line.contains("ERROR"))
            .map(String::trim)
            .limit(5)     // Short-circuits: stops reading file after 5th match!
            .toList();
    }
}`,
    javaAntiPattern: `// Anti-pattern: Files.readAllLines() loads entire file into Heap List<String>
List<String> all = Files.readAllLines(logPath); // OutOfMemoryError on large logs!
// Also forgetting try-with-resources around Files.lines() leaks the OS file handle!`,
    javaPitfallNote:
      'Always wrap `Files.lines()` in `try (Stream<String> s = ...)` because I/O-backed Streams hold an open OS file descriptor.',
    keyDifferences: [
      {
        aspect: 'Suspension Primitive',
        python: '`yield` suspends generator frame natively in CPython',
        java: '`Iterator<T>` / `Spliterator<T>` state machine or `Stream.generate()`',
      },
      {
        aspect: 'Short-Circuiting',
        python: '`itertools.islice(gen, 5)` or `next(gen, default)`',
        java: '`.limit(5)`, `.findFirst()`, `.anyMatch(...)`',
      },
      {
        aspect: 'Stream Resource Closure',
        python: '`with` inside generator closes file when generator finishes or is closed',
        java: 'Wrap I/O `Stream` directly in `try (Stream<String> s = ...)`',
      },
    ],
    traceScenarioTitle: 'Trace: Short-Circuit Streaming on a 10M-Line Log File',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 7,
        highlightLineJava: 8,
        action: 'Open file stream. Buffer holds only 1 line (~120 bytes) in memory.',
        stackFrame: [{ name: 'matches', value: '0 / 5', type: 'int' }],
        heapObjects: [{ ref: '#buf', label: 'LineBuffer', detail: '8 KB I/O buffer (flat RAM)' }],
        consoleOut: 'scanning line 1...',
      },
      {
        step: 2,
        highlightLinePy: 9,
        highlightLineJava: 10,
        action: 'Line 42 contains "ERROR" -> yield/emit immediately downstream without scanning ahead.',
        stackFrame: [{ name: 'matches', value: '1 / 5', type: 'int' }],
        heapObjects: [{ ref: '#res', label: 'ResultList', detail: 'size=1' }],
        consoleOut: 'yielded ERROR #1',
      },
      {
        step: 3,
        highlightLinePy: 13,
        highlightLineJava: 12,
        action: '5th match collected! `islice` / `.limit(5)` closes stream immediately — 9.99M lines never read.',
        stackFrame: [{ name: 'matches', value: '5 / 5 (DONE)', type: 'int' }],
        heapObjects: [{ ref: '#res', label: 'ResultList', detail: 'size=5 · Peak RAM < 64 KB' }],
        consoleOut: 'Stopped early with 5 errors',
      },
    ],
    quickCheck: {
      question: 'Why must `Files.lines(path)` in Java be placed inside a `try-with-resources` block?',
      options: [
        { id: 'a', text: 'Because `Files.lines()` holds an underlying OS file channel that will leak until GC if not closed' },
        { id: 'b', text: 'Because Java Streams always throw NullPointerException otherwise' },
        { id: 'c', text: 'Because `limit(5)` requires try-with-resources to compile' },
      ],
      correctId: 'a',
      explanation:
        'Collection-backed Streams do not need closing, but I/O-backed Streams like `Files.lines()` and `Files.walk()` own OS file descriptors and must be closed.',
    },
  },
  {
    id: 'jp-08-decorators-annotations',
    number: 8,
    level: 'Intermediate',
    category: 'Metaprogramming & Cross-Cutting',
    title: 'Decorators, Metadata & Cross-Cutting Concerns',
    subtitle: 'Add retry logic, timing, and auth cleanly using Python decorators and Java functional wrappers / AOP.',
    readTime: '7 min',
    mentalModel:
      'Cross-cutting concerns (logging, retries, metrics, auth) should wrap business functions from the outside instead of being copy-pasted inside every method. Python uses higher-order `@decorator` functions; Java uses functional wrappers, dynamic proxies, or Spring AOP annotations.',
    whySeniorsCare:
      'Forgetting `@functools.wraps(fn)` in Python destroys function names, docstrings, and FastAPI/pytest signatures; overusing reflection in Java slows startup and breaks GraalVM native images.',
    pythonIdiomatic: `import functools
import time
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

def retry(max_attempts: int = 3) -> Callable[[Callable[P, R]], Callable[P, R]]:
    def decorator(fn: Callable[P, R]) -> Callable[P, R]:
        @functools.wraps(fn)  # Preserves __name__, __doc__, and type signature!
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except TransientError:
                    if attempt == max_attempts:
                        raise
                    time.sleep(0.1 * attempt)
            raise RuntimeError("unreachable")
        return wrapper
    return decorator`,
    pythonAntiPattern: `# Anti-pattern: Missing @functools.wraps loses metadata & breaks introspection
def bad_decorator(fn):
    def wrapper(*args, **kwargs):
        return fn(*args, **kwargs)
    return wrapper  # fn.__name__ becomes "wrapper"!`,
    pythonPitfallNote:
      'Always apply `@functools.wraps(fn)` and `ParamSpec` so IDEs, `mypy`, OpenAPI generators, and stack traces see the original function signature.',
    javaIdiomatic: `import java.util.function.Supplier;

// Modern Java: Zero-reflection composable functional decorator (GraalVM friendly!)
public final class RetryPolicy {
    public static <T> T execute(int maxAttempts, Supplier<T> action) {
        RuntimeException last = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return action.get();
            } catch (RuntimeException ex) {
                last = ex;
                if (attempt == maxAttempts) break;
            }
        }
        throw last;
    }
}

// Clean call site without reflection or proxy overhead:
String body = RetryPolicy.execute(3, () -> httpClient.fetchProfile(userId));`,
    javaAntiPattern: `// Anti-pattern: Calling an @Retryable / @Transactional method on 'this' inside the same Spring bean
public void outer() {
    this.innerTransactional(); // BYPASSES Spring AOP proxy completely! Annotation never fires!
}`,
    javaPitfallNote:
      'In Spring Boot, proxy-based annotations (`@Transactional`, `@Cacheable`, `@Retryable`) ONLY trigger on external bean calls—self-invocation (`this.method()`) bypasses the proxy silently.',
    keyDifferences: [
      {
        aspect: 'Mechanism',
        python: 'First-class runtime function wrapping via `@decorator` syntax',
        java: 'Compile-time/runtime `@Annotation` + Proxy/AOP, or explicit `Supplier<T>` higher-order wrapper',
      },
      {
        aspect: 'Type Preservation',
        python: '`ParamSpec` + `@functools.wraps`',
        java: 'Generic `<T>` method signatures verified at compile time',
      },
      {
        aspect: 'Common Production Trap',
        python: 'Missing `@functools.wraps` breaks FastAPI/Click/logging',
        java: 'Self-invocation bypasses Spring dynamic proxies',
      },
    ],
    traceScenarioTitle: 'Trace: Retry Wrapper Handling Transient Network Blip',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 12,
        highlightLineJava: 7,
        action: 'Attempt 1 invokes wrapped function -> downstream raises TransientError (HTTP 503).',
        stackFrame: [
          { name: 'attempt', value: '1 / 3', type: 'int' },
          { name: 'status', value: '503 Transient', type: 'Error' },
        ],
        heapObjects: [{ ref: '#fn', label: 'Wrapped Action', detail: 'fetchProfile(userId)' }],
        consoleOut: 'attempt 1 failed -> backoff 100ms',
      },
      {
        step: 2,
        highlightLinePy: 14,
        highlightLineJava: 9,
        action: 'Attempt 2 invokes wrapped function -> succeeds with HTTP 200 and returns payload directly.',
        stackFrame: [
          { name: 'attempt', value: '2 / 3', type: 'int' },
          { name: 'return', value: '{"id":"u42"}', type: 'String' },
        ],
        heapObjects: [{ ref: '#res', label: 'Payload', detail: '{"id":"u42"}' }],
        consoleOut: 'attempt 2 succeeded -> 200 OK',
      },
    ],
    quickCheck: {
      question: 'Why does calling `this.saveOrder()` (annotated with `@Transactional`) from another method inside the same Spring service class fail to start a transaction?',
      options: [
        { id: 'a', text: 'Spring disables transactions for private methods only' },
        { id: 'b', text: 'Spring AOP wraps the bean in a proxy; calling `this.` bypasses the proxy and jumps straight to the raw target method' },
        { id: 'c', text: 'Java annotations cannot run inside classes' },
      ],
      correctId: 'b',
      explanation:
        'Proxy-based AOP intercepts calls entering through the proxy object. Self-calls via `this` never pass through the proxy interceptor.',
    },
  },
  {
    id: 'jp-09-concurrency-async-virtual-threads',
    number: 9,
    level: 'Advanced',
    category: 'Concurrency & High Throughput',
    title: 'Python asyncio TaskGroup vs. Java 21 Virtual Threads',
    subtitle: 'Scale to 50,000+ concurrent I/O calls cleanly with structured concurrency and zero thread starvation.',
    readTime: '9 min',
    mentalModel:
      'Python `asyncio` runs thousands of coroutines cooperatively on a single event loop (`await` yields control). Java 21 Virtual Threads (Project Loom) let you write simple blocking-style code while the JVM automatically parks and unmounts virtual threads off OS carrier threads during I/O.',
    whySeniorsCare:
      'Blocking the Python event loop with `time.sleep()` or sync `requests.get()` freezes ALL concurrent users. In Java 21, calling blocking I/O inside a `synchronized` block can pin the OS carrier thread (fixed in JDK 24; use `ReentrantLock` in JDK 21).',
    pythonIdiomatic: `import asyncio

async def fetch_service(name: str, delay: float) -> str:
    await asyncio.sleep(delay)  # Non-blocking yield to event loop
    return f"{name}:ok"

async def load_dashboard() -> list[str]:
    # Python 3.11+ Structured Concurrency: cancels siblings if one task fails!
    async with asyncio.TaskGroup() as tg:
        t_profile = tg.create_task(fetch_service("profile", 0.05))
        t_orders  = tg.create_task(fetch_service("orders", 0.08))
    return [t_profile.result(), t_orders.result()]`,
    pythonAntiPattern: `# Anti-pattern: Calling blocking I/O inside async def stalls entire event loop!
async def bad_handler():
    import requests
    return requests.get("https://api.example.com").json()  # FREEZES all other requests!`,
    pythonPitfallNote:
      'Inside `async def`, always use async libraries (`httpx`, `asyncpg`) or offload unavoidable blocking/CPU work via `asyncio.to_thread()` or `ProcessPoolExecutor` (or Python 3.13t No-GIL threads).',
    javaIdiomatic: `import java.util.concurrent.*;

// Java 21 LTS: Virtual Threads — 100,000+ concurrent tasks with ~1KB stack each!
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<String> profile = executor.submit(() -> fetchService("profile"));
    Future<String> orders  = executor.submit(() -> fetchService("orders"));
    String combined = profile.get() + " | " + orders.get();
    System.out.println(combined);
} // Auto-closes and waits for all submitted virtual tasks to complete`,
    javaAntiPattern: `// Anti-pattern: Pooling virtual threads or pinning carrier thread in JDK 21
ExecutorService bad = Executors.newFixedThreadPool(10, Thread.ofVirtual().factory()); // NEVER pool virtual threads!
synchronized (lock) {
    httpClient.send(req, handler); // Pins OS carrier thread in Java 21 -> use ReentrantLock!
}`,
    javaPitfallNote:
      'Virtual threads are cheap throwaway tasks—never pool them. Use a `Semaphore` to bound downstream DB concurrency instead of a fixed thread pool.',
    keyDifferences: [
      {
        aspect: 'Concurrency Model',
        python: 'Cooperative single-threaded Event Loop (`async`/`await`); CPU parallelism via multiprocessing or 3.13t No-GIL',
        java: 'M:N Virtual Threads mounted on ForkJoinPool OS carrier threads (true multi-core parallelism)',
      },
      {
        aspect: 'Footprint per Concurrent Task',
        python: '~1–2 KB coroutine frame on heap',
        java: '~1 KB resizable continuation stack on heap (vs ~1 MB for OS platform thread)',
      },
      {
        aspect: 'Structured Lifetime',
        python: '`async with asyncio.TaskGroup() as tg:`',
        java: '`try (var exec = Executors.newVirtualThreadPerTaskExecutor())` / `StructuredTaskScope`',
      },
    ],
    traceScenarioTitle: 'Trace: Fan-Out 2 Downstream Calls in Parallel (80ms Total, Not 130ms)',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 9,
        highlightLineJava: 5,
        action: 'Spawn both tasks concurrently (`profile` 50ms, `orders` 80ms). Neither blocks the OS thread.',
        stackFrame: [
          { name: 't_profile', value: 'RUNNING (I/O wait)', type: 'Task / VThread' },
          { name: 't_orders', value: 'RUNNING (I/O wait)', type: 'Task / VThread' },
        ],
        heapObjects: [{ ref: '#carrier', label: 'EventLoop / Carrier-1', detail: 'Free to serve 10,000+ other requests' }],
        consoleOut: 't=0ms: dispatched both calls',
      },
      {
        step: 2,
        highlightLinePy: 10,
        highlightLineJava: 6,
        action: 'At t=50ms, `profile` socket wakes up -> resolves `"profile:ok"`. `orders` still awaiting I/O.',
        stackFrame: [
          { name: 't_profile', value: 'DONE ("profile:ok")', type: 'Task / VThread' },
          { name: 't_orders', value: 'WAITING (30ms left)', type: 'Task / VThread' },
        ],
        heapObjects: [{ ref: '#carrier', label: 'EventLoop / Carrier-1', detail: 'Resumed profile continuation' }],
        consoleOut: 't=50ms: profile ready',
      },
      {
        step: 3,
        highlightLinePy: 12,
        highlightLineJava: 7,
        action: 'At t=80ms, `orders` resolves -> TaskGroup / Executor joins cleanly. Total wall time = max(50, 80) = 80ms.',
        stackFrame: [{ name: 'result', value: '["profile:ok", "orders:ok"]', type: 'Result' }],
        heapObjects: [{ ref: '#res', label: 'Dashboard', detail: 'Latency saved: 50ms (38% faster)' }],
        consoleOut: 't=80ms: profile:ok | orders:ok',
      },
    ],
    quickCheck: {
      question: 'In Java 21, how should you limit concurrent database connections when using `Executors.newVirtualThreadPerTaskExecutor()`?',
      options: [
        { id: 'a', text: 'Create a fixed pool of 20 virtual threads' },
        { id: 'b', text: 'Use a `Semaphore(20)` (or HikariCP connection pool) while still spawning one virtual thread per request' },
        { id: 'c', text: 'Wrap every JDBC call in a `synchronized` block' },
      ],
      correctId: 'b',
      explanation:
        'Virtual threads should never be pooled. Constrain scarce downstream resources (like DB connections) with a `Semaphore` or connection pool.',
    },
  },
  {
    id: 'jp-10-memory-gc-performance',
    number: 10,
    level: 'Advanced',
    category: 'Memory & Performance Engineering',
    title: 'Memory Layout, Garbage Collection & Allocation Profiling',
    subtitle: 'Cut RAM usage by 60%+ with Python __slots__ and tune JVM Generational ZGC & escape analysis.',
    readTime: '8 min',
    mentalModel:
      'CPython frees objects immediately when their reference count hits zero, plus a cyclic GC for reference cycles. The JVM allocates in ultra-fast Thread-Local Allocation Buffers (TLABs) and uses generational collectors (G1GC / Generational ZGC) to sweep dead short-lived objects in sub-millisecond pauses.',
    whySeniorsCare:
      'Every normal Python object carries a per-instance `__dict__` (~152+ bytes overhead). At 5 million cached items, adding `slots=True` saves > 600 MB RAM. On the JVM, allocating short-lived objects is cheap—long-lived caches that survive into Old Gen are what trigger GC pauses.',
    pythonIdiomatic: `from dataclasses import dataclass

# slots=True eliminates per-instance __dict__ -> ~55% less RAM & faster attribute access!
@dataclass(slots=True, frozen=True)
class Point3D:
    x: float
    y: float
    z: float

# Use array/memoryview for dense numeric buffers instead of list[float]
from array import array
readings = array("d", [1.2, 3.4, 5.6])  # 8 bytes/float contiguous C buffer`,
    pythonAntiPattern: `# Anti-pattern: Storing millions of plain dicts or unslotted objects in memory
class HeavyPoint:
    def __init__(self, x, y, z):
        self.x, self.y, self.z = x, y, z  # Allocates full dynamic __dict__ per instance!`,
    pythonPitfallNote:
      'Profile memory with `tracemalloc` before guessing. Watch for circular references keeping objects alive until cyclic GC runs (`weakref` breaks parent-child cycles).',
    javaIdiomatic: `// Java 21+: Small immutable objects qualify for C2 JIT Escape Analysis (scalar replacement)
// Run low-latency microservices with Generational ZGC (< 1ms pauses):
// java -XX:+UseZGC -XX:+ZGenerational -Xms512m -Xmx512m -jar app.jar

record Point3D(double x, double y, double z) {
    double magnitudeSquared() {
        return x * x + y * y + z * z;
    }
}

// StringBuilder / compact strings (1 byte/char Latin-1 in JDK 9+)
public static String joinIds(int[] ids) {
    var sb = new StringBuilder(ids.length * 8);
    for (int id : ids) sb.append(id).append(',');
    return sb.toString();
}`,
    javaAntiPattern: `// Anti-pattern: String concatenation with += inside a loop allocates O(N^2) char arrays
String csv = "";
for (int i = 0; i < 50_000; i++) {
    csv += i + ","; // Copies the entire growing string on EVERY iteration!
}`,
    javaPitfallNote:
      'In Kubernetes containers, always set `-XX:MaxRAMPercentage=75.0` (never leave heap unbounded) so JVM metaspace + native threads stay safely below the pod memory limit.',
    keyDifferences: [
      {
        aspect: 'Reclamation Strategy',
        python: 'Immediate reference counting + 3-generation cyclic GC',
        java: 'Tracing generational GC (G1GC default; Generational ZGC for < 1ms p99)',
      },
      {
        aspect: 'Memory Optimization Lever',
        python: '`@dataclass(slots=True)`, `array.array`, `numpy` contiguous buffers',
        java: 'Primitive arrays (`double[]`), `StringBuilder`, Escape Analysis, `-XX:+UseZGC`',
      },
      {
        aspect: 'Built-in Profiler',
        python: '`tracemalloc`, `cProfile`, `py-spy`',
        java: 'Java Flight Recorder (`jfr`), `async-profiler`, VisualVM',
      },
    ],
    traceScenarioTitle: 'Trace: Memory Footprint — Plain Class vs. __slots__ / JVM TLAB',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 4,
        highlightLineJava: 5,
        action: 'Allocate 1,000,000 Point3D instances. Unslotted Python creates 1M hash tables (~240 MB).',
        stackFrame: [{ name: 'count', value: '1,000,000', type: 'int' }],
        heapObjects: [
          { ref: '#py-dict', label: 'Plain Python Class', detail: '~240 MB (object + __dict__)' },
          { ref: '#py-slots', label: 'Python slots=True', detail: '~64 MB (fixed C struct)' },
        ],
        consoleOut: 'Saved ~176 MB with slots=True',
      },
      {
        step: 2,
        highlightLinePy: 11,
        highlightLineJava: 6,
        action: 'In Java C2 JIT, non-escaping `new Point3D(x,y,z)` is scalar-replaced into CPU registers (0 heap bytes!).',
        stackFrame: [
          { name: 'reg_x', value: '1.2', type: 'double (CPU reg)' },
          { name: 'reg_y', value: '3.4', type: 'double (CPU reg)' },
        ],
        heapObjects: [{ ref: '#tlab', label: 'JVM Heap', detail: '0 bytes allocated via Escape Analysis' }],
        consoleOut: 'Zero GC pressure in hot loop',
      },
    ],
    quickCheck: {
      question: 'Why does `@dataclass(slots=True)` dramatically cut memory usage when creating millions of Python objects?',
      options: [
        { id: 'a', text: 'It compresses strings with gzip' },
        { id: 'b', text: 'It replaces each instance’s dynamic `__dict__` hash table with fixed-offset C struct slots' },
        { id: 'c', text: 'It disables Python garbage collection' },
      ],
      correctId: 'b',
      explanation:
        'Without `__slots__`, every Python object allocates a separate dictionary to hold attributes. Fixed slots store attribute pointers directly in the object struct.',
    },
  },
  {
    id: 'jp-11-production-apis-validation',
    number: 11,
    level: 'Advanced',
    category: 'Backend API Engineering',
    title: 'Type-Safe REST APIs: FastAPI + Pydantic v2 vs. Spring Boot 3',
    subtitle: 'Validate untrusted JSON boundaries at the edge and return structured RFC 7807 / 422 errors.',
    readTime: '8 min',
    mentalModel:
      'Never let raw unvalidated maps/JSON enter your domain logic. Parse and validate at the HTTP boundary into strict typed DTOs (Pydantic v2 BaseModel in Python; Java Records + Bean Validation in Spring Boot 3).',
    whySeniorsCare:
      'Boundary validation eliminates entire classes of security vulnerabilities (mass assignment, injection, NaN/negative price attacks) and auto-generates accurate OpenAPI specs for frontend teams.',
    pythonIdiomatic: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class CreateOrderRequest(BaseModel):
    sku: str = Field(min_length=3, max_length=32, pattern=r"^[A-Z0-9-]+$")
    quantity: int = Field(ge=1, le=100)

class OrderResponse(BaseModel):
    order_id: str
    status: str

@app.post("/api/v1/orders", response_model=OrderResponse, status_code=201)
async def create_order(payload: CreateOrderRequest) -> OrderResponse:
    if payload.sku == "OUT-OF-STOCK":
        raise HTTPException(status_code=409, detail="Item currently unavailable")
    return OrderResponse(order_id="ord_901", status="CONFIRMED")`,
    pythonAntiPattern: `# Anti-pattern: Accepting raw dict and directly forwarding to ORM/DB
@app.post("/orders")
async def create_bad(body: dict):
    # Attacker can pass {"role": "ADMIN", "price": -999}!
    return db.insert("orders", body)`,
    pythonPitfallNote:
      'Never pass a raw `dict` directly into database inserts (mass assignment vulnerability). Always validate with Pydantic v2 (Rust-powered `pydantic-core`).',
    javaIdiomatic: `import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

public record CreateOrderRequest(
    @NotBlank @Pattern(regexp = "^[A-Z0-9-]{3,32}$") String sku,
    @Min(1) @Max(100) int quantity
) {}

public record OrderResponse(String orderId, String status) {}

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    @PostMapping
    public ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new OrderResponse("ord_901", "CONFIRMED"));
    }
}`,
    javaAntiPattern: `// Anti-pattern: Exposing JPA @Entity directly as REST request/response
@PostMapping("/orders")
public OrderEntity create(@RequestBody OrderEntity entity) {
    // Exposes internal DB columns, triggers lazy-loading JSON crashes & mass assignment!
    return repo.save(entity);
}`,
    javaPitfallNote:
      'Always separate API Record DTOs from JPA `@Entity` classes to avoid LazyInitializationException, schema coupling, and mass-assignment exploits.',
    keyDifferences: [
      {
        aspect: 'Validation Engine',
        python: 'Pydantic v2 (`pydantic-core` compiled in Rust — validates & serializes fast)',
        java: 'Jakarta Bean Validation (`@Valid`, `@NotBlank`, `@Min`) + Jackson Records',
      },
      {
        aspect: 'Error Response Standard',
        python: 'Auto HTTP 422 JSON with field-level `loc`, `msg`, `type`',
        java: 'Spring Boot 3 native RFC 7807 `ProblemDetail` (`application/problem+json`)',
      },
      {
        aspect: 'API Documentation',
        python: 'Built-in OpenAPI 3.1 + Swagger UI at `/docs`',
        java: '`springdoc-openapi-starter-webmvc-ui` generates OpenAPI 3.1',
      },
    ],
    traceScenarioTitle: 'Trace: Boundary Validation Rejecting Malicious Payload Before DB',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 15,
        highlightLineJava: 17,
        action: 'Client sends `POST /api/v1/orders` with `{"sku":"SKU-1","quantity":-5}`.',
        stackFrame: [{ name: 'rawJson', value: '{"sku":"SKU-1","quantity":-5}', type: 'HTTP Body' }],
        heapObjects: [{ ref: '#req', label: 'HTTP Boundary', detail: 'Parsing JSON -> DTO' }],
        consoleOut: 'POST /api/v1/orders',
      },
      {
        step: 2,
        highlightLinePy: 8,
        highlightLineJava: 8,
        action: 'Validator checks `quantity >= 1`. Fails immediately (-5 < 1). Controller body & DB never execute!',
        stackFrame: [{ name: 'status', value: '422 / 400 Bad Request', type: 'HTTP Status' }],
        heapObjects: [{ ref: '#err', label: 'ValidationError', detail: 'field="quantity": must be >= 1' }],
        consoleOut: 'HTTP 422 rejected at edge (0 DB queries)',
      },
    ],
    quickCheck: {
      question: 'Why should you NEVER accept a JPA `@Entity` or raw Python `dict` directly in a POST endpoint and save it to the database?',
      options: [
        { id: 'a', text: 'Because JSON cannot represent database columns' },
        { id: 'b', text: 'Attackers can inject unexpected fields (mass assignment like `isAdmin: true`) and tight DB-to-API coupling breaks clients on schema changes' },
        { id: 'c', text: 'Because Spring Boot and FastAPI refuse to compile without DTOs' },
      ],
      correctId: 'b',
      explanation:
        'Explicit request/response DTOs (`BaseModel` / `record`) whitelist exact fields, enforce constraints, and decouple public API contracts from internal DB tables.',
    },
  },
  {
    id: 'jp-12-testing-debugging',
    number: 12,
    level: 'Advanced',
    category: 'Testing & Production Quality',
    title: 'Parameterized Testing, Fakes & Deterministic Clocks',
    subtitle: 'Write fast, flake-free unit tests with pytest parametrize and JUnit 5 + injected Clocks.',
    readTime: '6 min',
    mentalModel:
      'Flaky tests destroy engineering velocity. The two biggest sources of flakes are real wall-clock time (`datetime.now()` / `Instant.now()`) and real network calls. Inject a `Clock` and use table-driven parameterized tests for edge cases.',
    whySeniorsCare:
      'A single parameterized test cleanly covers 10 boundary cases (0, negative, leap year, midnight rollover, overflow) in 15 lines and runs in under 5 milliseconds.',
    pythonIdiomatic: `import pytest
from datetime import datetime, timezone

@pytest.mark.parametrize(
    "cents, pct, expected",
    [
        (5000, 10, 4500),
        (5000, 0, 5000),
        (5000, 100, 0),
        (99, 10, 90),  # Integer floor behavior verified
    ],
)
def test_apply_discount_table(cents: int, pct: int, expected: int) -> None:
    order = OrderTotal("USD", cents)
    assert apply_discount(order, pct).cents == expected`,
    pythonAntiPattern: `# Anti-pattern: Real sleep & wall-clock time inside unit tests
def test_expiry_flaky():
    token = create_token(ttl_seconds=1)
    time.sleep(1.1)              # Slows CI and flakes under CPU contention!
    assert token.is_expired()`,
    pythonPitfallNote:
      'Never use `time.sleep()` in unit tests. Inject a callable `clock: Callable[[], datetime]` or use `freezegun` / `time-machine` so expiry tests run in 0.1ms.',
    javaIdiomatic: `import java.time.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class OrderTotalTest {
    @ParameterizedTest
    @CsvSource({
        "5000, 10, 4500",
        "5000,  0, 5000",
        "5000, 100, 0"
    })
    void appliesDiscountDeterministically(long cents, int pct, long expected) {
        var order = new OrderTotal("USD", cents);
        assertEquals(expected, order.applyDiscount(pct).cents());
    }

    // Inject java.time.Clock.fixed(...) for zero-flake expiration tests!
    Clock fixedClock = Clock.fixed(Instant.parse("2026-05-01T00:00:00Z"), ZoneOffset.UTC);
}`,
    javaAntiPattern: `// Anti-pattern: Hardcoding Instant.now() inside business logic
public boolean isExpired() {
    return Instant.now().isAfter(expiresAt); // Impossible to test deterministically!
}`,
    javaPitfallNote:
      'Inject `java.time.Clock` into services (`Clock.systemUTC()` in prod, `Clock.fixed(...)` in tests) to make time-sensitive logic 100% deterministic.',
    keyDifferences: [
      {
        aspect: 'Table-Driven Tests',
        python: '`@pytest.mark.parametrize("a,b,out", [...])`',
        java: '`@ParameterizedTest` with `@CsvSource` or `@MethodSource` (JUnit 5)',
      },
      {
        aspect: 'Test Fixtures & Setup',
        python: 'Composable `@pytest.fixture` dependency injection',
        java: '`@BeforeEach`, test builders, and JUnit 5 Extensions',
      },
      {
        aspect: 'Integration DB Testing',
        python: '`testcontainers-python` spins up real Postgres/Redis in Docker',
        java: 'Testcontainers + Spring Boot `@ServiceConnection`',
      },
    ],
    traceScenarioTitle: 'Trace: Parameterized Boundary Test Matrix Execution',
    traceSteps: [
      {
        step: 1,
        highlightLinePy: 7,
        highlightLineJava: 9,
        action: 'Case 1: `(5000, 10) -> 4500`. Assertion passes in 0.2ms.',
        stackFrame: [
          { name: 'case', value: '#1 (5000, 10%)', type: 'ParamRow' },
          { name: 'result', value: 'PASS', type: 'Assert' },
        ],
        heapObjects: [{ ref: '#clock', label: 'FixedClock', detail: '2026-05-01T00:00:00Z' }],
        consoleOut: 'PASS [1/3] 5000 - 10% = 4500',
      },
      {
        step: 2,
        highlightLinePy: 9,
        highlightLineJava: 11,
        action: 'Cases 2 & 3 verify 0% and 100% boundary edges cleanly. Entire suite finishes < 2ms.',
        stackFrame: [
          { name: 'passed', value: '3 / 3', type: 'Summary' },
          { name: 'duration', value: '1.4ms', type: 'Elapsed' },
        ],
        heapObjects: [{ ref: '#suite', label: 'TestRunner', detail: '0 sleeps · 0 network flakes' }],
        consoleOut: '3 passed in 1.4ms (100% deterministic)',
      },
    ],
    quickCheck: {
      question: 'What is the cleanest way to unit-test a token expiration service without `Thread.sleep()` or `time.sleep()`?',
      options: [
        { id: 'a', text: 'Increase the CI timeout to 10 minutes' },
        { id: 'b', text: 'Inject a `Clock` (Java `java.time.Clock.fixed`) or time-provider callable so tests control time instantaneously' },
        { id: 'c', text: 'Skip testing expiration logic' },
      ],
      correctId: 'b',
      explanation:
        'Injecting a `Clock` makes time-dependent logic deterministic, instant, and immune to CI scheduler jitter.',
    },
  },
];
