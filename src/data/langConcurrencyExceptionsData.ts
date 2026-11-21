export type MasteryTrackGroup = 'oop-exceptions-collections' | 'threads-futures-concurrency';

export interface ConceptDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

export interface ConceptDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface ConceptDfdStep {
  step: number;
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetLabel: string;
}

export interface LangDeepDiveModule {
  id: string;
  number: string;
  group: MasteryTrackGroup;
  shortTitle: string;
  title: string;
  summary: string;
  simpleEnglish: string;
  technicalInternals: string;
  keyComparison: { aspect: string; python: string; java: string }[];
  dfdNodes: ConceptDfdNode[];
  dfdEdges: ConceptDfdEdge[];
  dfdSteps: ConceptDfdStep[];
  pythonCode: string;
  javaCode: string;
  pitfall: string;
  bestPractice: string;
}

export const LANG_CONCURRENCY_EXCEPTIONS_MODULES: LangDeepDiveModule[] = [
  {
    id: 'methods-dispatch',
    number: '01',
    group: 'oop-exceptions-collections',
    shortTitle: 'Methods & Dispatch',
    title: 'Methods, Overloading, Overriding, Descriptors & Dynamic Dispatch',
    summary:
      'Master how Java resolves static overloading at compile time vs runtime vtable overriding, and how Python binds methods via descriptors, *args/**kwargs, and @classmethod.',
    simpleEnglish:
      'Think of overloading like a coffee machine with two buttons labeled "Brew" (one takes 1 cup, one takes 2 cups) chosen before you even press start. Overriding is when a specialized subclass replaces the parent’s recipe, and the runtime picks the right recipe based on the real object in memory.',
    technicalInternals:
      'Java resolves overloaded signatures statically at javac compile time (early binding) and dispatches overridden instance methods dynamically via JVM invokevirtual vtable lookup (late binding). Python has no signature overloading (use @singledispatch or default args); functions are descriptor objects whose __get__(obj, cls) dynamically binds self at attribute lookup time.',
    keyComparison: [
      {
        aspect: 'Overloading',
        python: 'Default args, *args/**kwargs, @functools.singledispatch, @typing.overload',
        java: 'Compile-time method signature overloading (same name, different param types)',
      },
      {
        aspect: 'Overriding Dispatch',
        python: 'Dynamic MRO lookup + Descriptor __get__ binding self',
        java: 'JVM invokevirtual vtable array index O(1) lookup (@Override)',
      },
      {
        aspect: 'Class vs Static',
        python: '@classmethod receives cls; @staticmethod receives neither self nor cls',
        java: 'static methods bind at compile time (invokestatic); cannot be overridden',
      },
    ],
    dfdNodes: [
      { id: 'call', label: 'Method Call Site', sublabel: 'svc.charge(amt)', x: 82, y: 112 },
      { id: 'res', label: 'Compile / Lookup', sublabel: 'Overload / MRO', x: 248, y: 60 },
      { id: 'vt', label: 'vtable / Descriptor', sublabel: 'Bind Receiver', x: 422, y: 162 },
      { id: 'exec', label: 'Target Method Frame', sublabel: 'Execute Body', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'call', to: 'res', label: 'Resolve Name' },
      { id: 'e2', from: 'res', to: 'vt', label: 'Dispatch Slot' },
      { id: 'e3', from: 'vt', to: 'exec', label: 'Push Frame' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Call-Site Invocation & Receiver Inspection',
        plainEnglish: 'The program calls pay.charge(50) on a variable typed as a base interface or parent class.',
        technicalDetail: 'JVM reads receiver object header Klass*; CPython reads Py_TYPE(obj)->tp_mro.',
        activeNodeIds: ['call', 'res'],
        activeEdgeIds: ['e1'],
        packetLabel: 'INVOKE',
      },
      {
        step: 2,
        title: 'vtable Index / Python Descriptor Binding',
        plainEnglish: 'The runtime checks the actual subclass blueprint in memory and grabs its overridden method pointer.',
        technicalDetail: 'JVM jumps to Klass->vtable[slot] in O(1); Python invokes Function.__get__(instance, cls) creating a bound method.',
        activeNodeIds: ['res', 'vt'],
        activeEdgeIds: ['e2'],
        packetLabel: 'VTABLE / MRO',
      },
      {
        step: 3,
        title: 'Push Stack Frame & Execute Specialized Logic',
        plainEnglish: 'The subclass implementation runs with self / this pointing to the concrete instance on the Heap.',
        technicalDetail: 'HotSpot JIT monomorphic inline cache devirtualizes & inlines the call completely if 1 subclass dominates.',
        activeNodeIds: ['vt', 'exec'],
        activeEdgeIds: ['e3'],
        packetLabel: 'RUN TARGET',
      },
    ],
    pythonCode: `from functools import singledispatch

class PaymentGateway:
    tax_rate = 0.08

    def charge(self, amount: float) -> str:
        return f"Base charge: \${amount:.2f}"

    @classmethod
    def with_tax(cls, amount: float) -> float:
        return round(amount * (1 + cls.tax_rate), 2)

    @staticmethod
    def validate_currency(code: str) -> bool:
        return len(code) == 3 and code.isupper()

class StripeGateway(PaymentGateway):
    def charge(self, amount: float) -> str:  # Dynamic override
        parent_msg = super().charge(amount)
        return f"Stripe -> {parent_msg} (with tax: \${self.with_tax(amount)})"

# Runtime type-based overloading via @singledispatch
@singledispatch
def format_receipt(value) -> str:
    return f"Generic: {value}"

@format_receipt.register(int)
def _(value: int) -> str:
    return f"Cents receipt: {value}c"

@format_receipt.register(float)
def _(value: float) -> str:
    return f"Dollars receipt: \${value:.2f}"`,
    javaCode: `public class MethodDispatchDemo {
    static class PaymentGateway {
        // Compile-time Overloading (different parameter lists)
        String charge(double amount) {
            return charge(amount, "USD");
        }
        String charge(double amount, String currency) {
            return "Base " + currency + " " + amount;
        }
    }

    static class StripeGateway extends PaymentGateway {
        // Runtime Overriding (dynamic dispatch via vtable)
        @Override
        String charge(double amount, String currency) {
            return "Stripe -> " + super.charge(amount, currency);
        }
    }

    public static void main(String[] args) {
        PaymentGateway gw = new StripeGateway(); // Upcast
        // invokevirtual picks StripeGateway.charge at runtime!
        System.out.println(gw.charge(99.50, "USD"));
    }
}`,
    pitfall:
      'In Java, hiding a static method in a subclass is NOT overriding—calling Base.foo() on a Sub reference still executes Base.foo() because static calls bind at compile time.',
    bestPractice:
      'Always annotate overridden Java methods with @Override (and Python 3.12+ with @typing.override) so the compiler/type-checker catches accidental signature typos immediately.',
  },
  {
    id: 'abstraction-polymorphism-inheritance',
    number: '02',
    group: 'oop-exceptions-collections',
    shortTitle: 'Abstraction & Polymorphism',
    title: 'Abstraction, Polymorphism, Sealed Inheritance & Structural Protocols',
    summary:
      'Design extensible APIs using Java interfaces, abstract classes, and sealed pattern matching alongside Python ABCs, Protocols (duck typing), and composition.',
    simpleEnglish:
      'Abstraction hides messy wiring behind a clean steering wheel (interface). Inheritance lets subclasses share core code ("is-a"), while Polymorphism lets one function drive a Tesla, Truck, or Bus through the exact same steering wheel without caring what engine sits underneath!',
    technicalInternals:
      'Java enforces nominal subtyping (implements/extends) with single class inheritance + multiple interfaces (default methods + sealed permits for exhaustive switch). Python supports both nominal ABCs (abc.ABC + @abstractmethod enforced at instantiation) and structural typing (typing.Protocol checked statically by mypy/pyright without inheriting!).',
    keyComparison: [
      {
        aspect: 'Interface / Contract',
        python: 'ABC (@abstractmethod) for nominal; typing.Protocol for structural duck typing',
        java: 'interface (multiple allowed, default/private methods) + abstract class (shared state)',
      },
      {
        aspect: 'Closed Hierarchies',
        python: 'Union types (Card | Upi | Wire) + match/case structural pattern matching',
        java: 'Java 21 sealed interface + record subclasses + exhaustive switch expressions',
      },
      {
        aspect: 'Multiple Inheritance',
        python: 'Supported cleanly via C3 Linearization MRO (mixins)',
        java: 'Single class extends, multiple interface implements (avoids diamond state bug)',
      },
    ],
    dfdNodes: [
      { id: 'iface', label: 'Abstract Contract', sublabel: 'Interface / Protocol', x: 82, y: 112 },
      { id: 'sub', label: 'Concrete Subtypes', sublabel: 'Card / UPI / Wire', x: 252, y: 60 },
      { id: 'poly', label: 'Polymorphic Service', sublabel: 'List<Notifier>', x: 424, y: 162 },
      { id: 'match', label: 'Exhaustive Switch', sublabel: 'Sealed / match', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'iface', to: 'sub', label: 'Implements' },
      { id: 'e2', from: 'sub', to: 'poly', label: 'Upcast Ref' },
      { id: 'e3', from: 'poly', to: 'match', label: 'Dispatch / Match' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Define Minimal Abstract Contract',
        plainEnglish: 'Declare WHAT operations must exist (send, validate) without exposing HOW each channel works.',
        technicalDetail: 'Reduces coupling: callers depend only on interface bytecode / Protocol signature.',
        activeNodeIds: ['iface', 'sub'],
        activeEdgeIds: ['e1'],
        packetLabel: 'CONTRACT',
      },
      {
        step: 2,
        title: 'Polymorphic Collection Substitution (LSP)',
        plainEnglish: 'Store Email, SMS, and Push objects in one unified list and call send() uniformly on all of them.',
        technicalDetail: 'Liskov Substitution Principle guarantees every concrete subtype honors preconditions and invariants.',
        activeNodeIds: ['sub', 'poly'],
        activeEdgeIds: ['e2'],
        packetLabel: 'LSP DISPATCH',
      },
      {
        step: 3,
        title: 'Sealed Algebraic Exhaustive Matching',
        plainEnglish: 'When modeling fixed domain states (Paid, Refunded, Failed), sealed types make the compiler warn you if you forget a case.',
        technicalDetail: 'Java 21 switch pattern matching deconstructs records with zero casting; Python match/case matches dataclass patterns.',
        activeNodeIds: ['poly', 'match'],
        activeEdgeIds: ['e3'],
        packetLabel: 'SEALED MATCH',
      },
    ],
    pythonCode: `from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Protocol

# 1. Structural Abstraction (No inheritance required!)
class Notifier(Protocol):
    def send(self, msg: str) -> str: ...

# 2. Nominal Abstract Base Class (shared template logic)
class BaseChannel(ABC):
    @abstractmethod
    def send(self, msg: str) -> str: ...

class EmailChannel(BaseChannel):
    def send(self, msg: str) -> str:
        return f"EMAIL -> {msg}"

class SlackWebhook:  # Satisfies Notifier Protocol via duck typing!
    def send(self, msg: str) -> str:
        return f"SLACK -> {msg}"

# 3. Closed ADT + Structural Pattern Matching
@dataclass(frozen=True)
class Paid:
    tx_id: str
@dataclass(frozen=True)
class Failed:
    reason: str

def audit(event: Paid | Failed) -> str:
    match event:
        case Paid(tx_id=tx): return f"Ledger OK: {tx}"
        case Failed(reason=r): return f"Alert Ops: {r}"`,
    javaCode: `// Java 21 Sealed Hierarchy + Records + Exhaustive Pattern Switch
public sealed interface PaymentEvent permits Paid, Failed {}
public record Paid(String txId, double amount) implements PaymentEvent {}
public record Failed(String reason, boolean retryable) implements PaymentEvent {}

// Interface Abstraction + Polymorphism
interface Notifier {
    String send(String message);
    default String sendUrgent(String msg) { return "[URGENT] " + send(msg); }
}

class EmailNotifier implements Notifier {
    @Override public String send(String msg) { return "EMAIL: " + msg; }
}

public class PolymorphismDemo {
    static String audit(PaymentEvent event) {
        return switch (event) {
            case Paid(var tx, var amt) -> "Settled " + tx + " ($" + amt + ")";
            case Failed(var r, var retry) -> retry ? "Retry: " + r : "DLQ: " + r;
        };
    }
}`,
    pitfall:
      'Deep inheritance trees (A -> B -> C -> D) create the Fragile Base Class problem where changing a parent field breaks distant grandchildren.',
    bestPractice:
      'Favor Composition + small Interfaces/Protocols ("has-a") over deep class inheritance ("is-a"); use Java 21 sealed interfaces for closed domain variants.',
  },
  {
    id: 'errors-exceptions',
    number: '03',
    group: 'oop-exceptions-collections',
    shortTitle: 'Errors & Exceptions',
    title: 'Error & Exception Handling: Hierarchy, Stack Unwinding, try-with-resources & ExceptionGroup',
    summary:
      'Understand Checked vs Unchecked exceptions, JVM Exception Tables, Python try/except/else/finally, context managers, and concurrent ExceptionGroups.',
    simpleEnglish:
      'When something goes wrong deep inside a function call, throwing an exception acts like pulling an emergency cord: the runtime stops normal execution and walks back up the Call Stack ripping off frames until it finds a matching catch/except safety net—while ALWAYS running cleanup blocks (finally / with) so files and DB sockets never leak!',
    technicalInternals:
      'Java separates Throwable into unrecoverable Error (OutOfMemoryError, StackOverflowError), compile-time Checked Exception (IOException, SQLException), and Unchecked RuntimeException (NullPointerException). JVM stores a zero-cost Exception Table in bytecode so try blocks cost 0ns when no exception is thrown. Python uses BaseException -> Exception with try/except/else/finally, chained causes (raise X from err), and Python 3.11+ ExceptionGroup + except* for parallel task failures.',
    keyComparison: [
      {
        aspect: 'Checked vs Unchecked',
        python: 'All exceptions are unchecked (EAFP: Easier to Ask Forgiveness than Permission)',
        java: 'Checked (must declare throws or catch) vs Unchecked RuntimeException',
      },
      {
        aspect: 'Deterministic Cleanup',
        python: 'with open(...) as f: (__enter__ / __exit__ Context Manager)',
        java: 'try (var conn = ds.getConnection()) { ... } (AutoCloseable + Suppressed Exceptions)',
      },
      {
        aspect: 'Multi-Error / Chaining',
        python: 'raise DomainError() from e; ExceptionGroup + except* for asyncio.TaskGroup',
        java: 'new DomainException("msg", cause); getSuppressed() from try-with-resources',
      },
    ],
    dfdNodes: [
      { id: 'throw', label: 'Throw / Raise Site', sublabel: 'Build StackTrace', x: 82, y: 112 },
      { id: 'unwind', label: 'Stack Unwinding', sublabel: 'Scan ExceptionTbl', x: 252, y: 60 },
      { id: 'clean', label: 'AutoClose / finally', sublabel: 'Release Sockets', x: 424, y: 162 },
      { id: 'catch', label: 'Handler / Recovery', sublabel: 'catch / except*', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'throw', to: 'unwind', label: 'Create Throwable' },
      { id: 'e2', from: 'unwind', to: 'clean', label: 'Unwind Frames' },
      { id: 'e3', from: 'clean', to: 'catch', label: 'Match Type' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Exception Allocation & Stack Snapshot',
        plainEnglish: 'When an invalid state occurs, the runtime creates an exception object capturing the exact line numbers and call stack.',
        technicalDetail: 'Throwable.fillInStackTrace() walks active frames (expensive—never use exceptions for normal control flow!).',
        activeNodeIds: ['throw', 'unwind'],
        activeEdgeIds: ['e1'],
        packetLabel: 'THROW ERR',
      },
      {
        step: 2,
        title: 'Stack Unwinding & Guaranteed Resource Cleanup',
        plainEnglish: 'Each frame is popped while running finally / __exit__ / AutoCloseable.close() so database connections and locks always release.',
        technicalDetail: 'Java try-with-resources attaches close() failures via addSuppressed() instead of masking the primary exception.',
        activeNodeIds: ['unwind', 'clean'],
        activeEdgeIds: ['e2'],
        packetLabel: 'CLOSE() SAFE',
      },
      {
        step: 3,
        title: 'Typed Handler Match & Graceful Recovery',
        plainEnglish: 'Execution resumes inside the first matching catch/except block, logging context or returning a fallback.',
        technicalDetail: 'Zero-cost exception tables ensure the happy path executes zero extra instructions until an error actually throws.',
        activeNodeIds: ['clean', 'catch'],
        activeEdgeIds: ['e3'],
        packetLabel: 'RECOVER',
      },
    ],
    pythonCode: `class InsufficientFundsError(Exception):
    def __init__(self, balance: float, needed: float) -> None:
        super().__init__(f"Balance \${balance:.2f} < needed \${needed:.2f}")
        self.balance = balance
        self.needed = needed

def withdraw(balance: float, amount: float) -> float:
    try:
        if amount <= 0:
            raise ValueError("Withdrawal must be positive")
        if amount > balance:
            raise InsufficientFundsError(balance, amount)
    except ValueError as err:
        # Preserve original traceback via explicit exception chaining
        raise RuntimeError("Invalid ledger input") from err
    else:
        # Runs ONLY if try succeeded without raising!
        return balance - amount
    finally:
        # Always executes (even on return or exception)
        pass

# Python 3.11+ Concurrent ExceptionGroup handling with except*
def handle_batch_errors():
    try:
        raise ExceptionGroup("batch", [ValueError("bad id"), TimeoutError("db")])
    except* ValueError as eg:
        print(f"Validation errors: {len(eg.exceptions)}")
    except* TimeoutError as eg:
        print(f"Transient timeouts: {len(eg.exceptions)}")`,
    javaCode: `import java.io.*;

// Custom Unchecked Domain Exception preserving cause chain
class PaymentDeclinedException extends RuntimeException {
    private final String code;
    PaymentDeclinedException(String code, String msg, Throwable cause) {
        super(msg, cause);
        this.code = code;
    }
    String code() { return code; }
}

public class ExceptionHandlingDemo {
    static String readFirstLine(String path) {
        // try-with-resources guarantees AutoCloseable.close() even on exception!
        try (var reader = new BufferedReader(new FileReader(path))) {
            return reader.readLine();
        } catch (FileNotFoundException e) {
            throw new PaymentDeclinedException("CONFIG_MISSING", "Missing config", e);
        } catch (IOException | SecurityException e) { // Multi-catch
            throw new UncheckedIOException("IO failure reading " + path,
                e instanceof IOException io ? io : new IOException(e));
        }
    }
}`,
    pitfall:
      'Swallowing exceptions with empty `except Exception: pass` or `catch (Exception e) {}` hides silent data corruption and makes production incidents impossible to debug.',
    bestPractice:
      'Catch specific exception types, always wrap resources in `with` / `try-with-resources`, preserve original root causes (`from err` / `cause`), and never use exceptions for expected branching.',
  },
  {
    id: 'collection-framework',
    number: '04',
    group: 'oop-exceptions-collections',
    shortTitle: 'Collection Framework',
    title: 'Collection Framework Deep Architecture: Lists, Sets, Queues, Maps, Concurrent & Streams',
    summary:
      'Choose the exact O(1)/O(log n) collection for every workload across Java Collections Framework (List, Set, Deque, Map, ConcurrentHashMap, Streams) and Python collections.',
    simpleEnglish:
      'Every collection is a specialized storage cabinet: use Dynamic Arrays (ArrayList/list) for fast indexed access, Hash Sets/Maps (HashMap/dict) for instant O(1) key lookups, Deques (ArrayDeque/deque) for queues & sliding windows, TreeMaps/Heaps for sorted priority order, and ConcurrentHashMap when multiple threads write simultaneously!',
    technicalInternals:
      'Java separates Collection<E> (List, Set, Queue, Deque) from Map<K,V>, offering immutable factories (List.of, Map.of), O(log n) Red-Black TreeMap/TreeSet, lock-striped CAS ConcurrentHashMap, and lazy Stream pipelines. Python provides C-optimized list, tuple, set, compact insertion-ordered dict, collections.deque (block-linked C array), defaultdict, Counter, heapq, and bisect.',
    keyComparison: [
      {
        aspect: 'Dynamic Array / Queue',
        python: 'list (dynamic array), collections.deque (O(1) both ends)',
        java: 'ArrayList (1.5x growth), ArrayDeque (circular array, faster than LinkedList)',
      },
      {
        aspect: 'Hash Map & Ordered Map',
        python: 'dict (insertion-ordered open addressing), defaultdict, Counter',
        java: 'HashMap (buckets + Red-Black tree >= 8), LinkedHashMap (LRU), TreeMap (sorted)',
      },
      {
        aspect: 'Thread-Safe Collections',
        python: 'queue.Queue (thread-safe FIFO), collections.deque atomic append/popleft',
        java: 'ConcurrentHashMap (CAS + per-bin lock), CopyOnWriteArrayList, BlockingQueue',
      },
    ],
    dfdNodes: [
      { id: 'seq', label: 'Sequence / Queue', sublabel: 'ArrayList / Deque', x: 82, y: 112 },
      { id: 'hash', label: 'Hash Containers', sublabel: 'HashMap / dict', x: 252, y: 60 },
      { id: 'ord', label: 'Sorted / Priority', sublabel: 'TreeMap / Heap', x: 424, y: 162 },
      { id: 'conc', label: 'Concurrent & Stream', sublabel: 'CHM / Lazy Pipe', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'seq', to: 'hash', label: 'Index -> O(1) Key' },
      { id: 'e2', from: 'hash', to: 'ord', label: 'Order / Top-K' },
      { id: 'e3', from: 'ord', to: 'conc', label: 'Thread-Safe Pipe' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Contiguous Sequences & Circular Deques',
        plainEnglish: 'Store sequential items in cache-friendly arrays; switch to Deque whenever you need O(1) queue pop from the front.',
        technicalDetail: 'ArrayList & Python list avoid pointer chasing; ArrayDeque beats LinkedList on both RAM and CPU L1 cache hits.',
        activeNodeIds: ['seq', 'hash'],
        activeEdgeIds: ['e1'],
        packetLabel: 'O(1) INDEX',
      },
      {
        step: 2,
        title: 'O(1) Hash Lookup vs O(log n) Sorted Range Trees',
        plainEnglish: 'Use HashMap/dict for exact key lookup, LinkedHashMap for LRU caches, and TreeMap/heapq when you need min/max or range queries.',
        technicalDetail: 'Java 8+ HashMap treeifies colliding buckets >= 8 into Red-Black Trees to guarantee O(log n) DoS resistance.',
        activeNodeIds: ['hash', 'ord'],
        activeEdgeIds: ['e2'],
        packetLabel: 'HASH / TREE',
      },
      {
        step: 3,
        title: 'Concurrent Collections & Lazy Stream Aggregation',
        plainEnglish: 'In multi-threaded servers, replace HashMap with ConcurrentHashMap so threads update different buckets in parallel without global locks.',
        technicalDetail: 'ConcurrentHashMap uses lock-free volatile reads + CAS empty-bin inserts + per-bucket synchronized lock.',
        activeNodeIds: ['ord', 'conc'],
        activeEdgeIds: ['e3'],
        packetLabel: 'CAS / STREAM',
      },
    ],
    pythonCode: `from collections import Counter, defaultdict, deque
import heapq

# 1. O(1) Double-Ended Queue (Sliding Window / BFS)
window: deque[int] = deque(maxlen=3)
for x in [10, 20, 30, 40]:
    window.append(x)  # Auto-evicts 10 -> deque([20, 30, 40])

# 2. Grouping + Frequency Counting
orders = [("us", 50), ("eu", 30), ("us", 70), ("apac", 40)]
by_region: dict[str, list[int]] = defaultdict(list)
for region, amt in orders:
    by_region[region].append(amt)

top_regions = Counter(r for r, _ in orders).most_common(2)

# 3. Min-Heap Priority Queue (Top-K largest in O(N log K))
largest_two = heapq.nlargest(2, orders, key=lambda o: o[1])`,
    javaCode: `import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

public class CollectionsFrameworkDemo {
    record Order(String region, int amount) {}

    public static void main(String[] args) {
        List<Order> orders = List.of( // Immutable factory
            new Order("US", 50), new Order("EU", 30), new Order("US", 70)
        );

        // 1. Stream grouping + summing into Map
        Map<String, Integer> totals = orders.stream().collect(
            Collectors.groupingBy(Order::region, Collectors.summingInt(Order::amount))
        );

        // 2. O(1) Circular Queue / Stack (preferred over LinkedList/Stack)
        Deque<String> queue = new ArrayDeque<>();
        queue.offerLast("job-1");
        String next = queue.pollFirst();

        // 3. Thread-Safe Atomic Counters via ConcurrentHashMap
        var hits = new ConcurrentHashMap<String, Long>();
        hits.merge("/api/orders", 1L, Long::sum); // Atomic per-key update!

        // 4. Sorted Range Map (O(log n) ceilingKey / subMap)
        NavigableMap<Integer, String> tiers = new TreeMap<>(Map.of(0, "Free", 100, "Pro"));
        String plan = tiers.floorEntry(120).getValue(); // "Pro"
    }
}`,
    pitfall:
      'Calling `list.pop(0)` in Python or `ArrayList.remove(0)` in Java inside a loop shifts every remaining element — turning an O(N) algorithm into O(N²)!',
    bestPractice:
      'Use `deque` / `ArrayDeque` for queues, `ConcurrentHashMap` for shared concurrent state, and `Immutable` views (`List.of`, `tuple`) across thread boundaries.',
  },
  {
    id: 'threads-threadpool',
    number: '05',
    group: 'threads-futures-concurrency',
    shortTitle: 'Threads & Thread Pools',
    title: 'Multithreading, ThreadPoolExecutor Sizing, Rejection Policies & Java 21 Virtual Threads',
    summary:
      'Understand OS Thread creation overhead, ThreadPoolExecutor core/max/queue mechanics, Python ThreadPoolExecutor vs ProcessPoolExecutor (GIL / No-GIL), and Java 21 Virtual Threads.',
    simpleEnglish:
      'Creating a brand-new OS thread for every request is like hiring and firing a new employee for every single email—slow and expensive (~1MB stack RAM each!). A Thread Pool keeps a reusable team waiting by a bounded inbox queue; when work arrives, an idle worker grabs it instantly!',
    technicalInternals:
      'Java ThreadPoolExecutor obeys a strict 4-step admission order: (1) spawn up to corePoolSize -> (2) enqueue in workQueue until full -> (3) spawn temporary workers up to maximumPoolSize -> (4) invoke RejectedExecutionHandler (AbortPolicy, CallerRunsPolicy). Java 21 Virtual Threads (Executors.newVirtualThreadPerTaskExecutor) multiplex millions of heap continuations over ForkJoinPool OS carrier threads. Python uses ThreadPoolExecutor for I/O-bound work (GIL released on sockets) and ProcessPoolExecutor (or 3.13t free-threaded) for CPU-bound work.',
    keyComparison: [
      {
        aspect: 'Thread Pool API',
        python: 'concurrent.futures.ThreadPoolExecutor / ProcessPoolExecutor (with context)',
        java: 'ThreadPoolExecutor, Executors.newFixedThreadPool / newVirtualThreadPerTaskExecutor',
      },
      {
        aspect: 'CPU vs I/O Bound',
        python: 'I/O -> ThreadPool / asyncio; CPU -> ProcessPool (bypasses GIL) or 3.13t No-GIL',
        java: 'CPU -> Fixed pool (= CPU cores); I/O -> Virtual Threads (never pool them!)',
      },
      {
        aspect: 'Backpressure Policy',
        python: 'Bounded Semaphore + queue.Queue(maxsize=N) around submit()',
        java: 'ArrayBlockingQueue(cap) + CallerRunsPolicy (natural sender backpressure)',
      },
    ],
    dfdNodes: [
      { id: 'sub', label: 'Task Submission', sublabel: 'submit(Runnable)', x: 82, y: 112 },
      { id: 'q', label: 'Bounded WorkQueue', sublabel: 'ArrayBlockingQueue', x: 252, y: 60 },
      { id: 'pool', label: 'Worker Pool', sublabel: 'Core -> Max Threads', x: 424, y: 162 },
      { id: 'rej', label: 'Backpressure / Done', sublabel: 'CallerRuns / Result', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'sub', to: 'q', label: 'Core Busy -> Queue' },
      { id: 'e2', from: 'q', to: 'pool', label: 'Worker Poll()' },
      { id: 'e3', from: 'pool', to: 'rej', label: 'Complete / Reject' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Task Submitted to ExecutorService',
        plainEnglish: 'Your code hands a task to the pool instead of starting a raw OS thread.',
        technicalDetail: 'If activeWorkers < corePoolSize, starts a core worker immediately; otherwise offers to bounded workQueue.',
        activeNodeIds: ['sub', 'q'],
        activeEdgeIds: ['e1'],
        packetLabel: 'SUBMIT TASK',
      },
      {
        step: 2,
        title: 'Worker Dequeues & Executes Task on OS / Carrier Core',
        plainEnglish: 'An idle worker thread pulls the next task from the queue and runs it without thread-creation overhead.',
        technicalDetail: 'If queue is FULL and workers < maxPoolSize, spawns burst workers that terminate after keepAliveTime.',
        activeNodeIds: ['q', 'pool'],
        activeEdgeIds: ['e2'],
        packetLabel: 'POLL WORKER',
      },
      {
        step: 3,
        title: 'Graceful Shutdown or Backpressure Rejection',
        plainEnglish: 'If both queue and max threads are full, CallerRunsPolicy forces the producer thread to run the task—naturally slowing traffic down!',
        technicalDetail: 'Always close pools via try-with-resources / with ThreadPoolExecutor() so threads drain cleanly without leaking.',
        activeNodeIds: ['pool', 'rej'],
        activeEdgeIds: ['e3'],
        packetLabel: 'BACKPRESSURE',
      },
    ],
    pythonCode: `from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import math

def fetch_price(ticker: str) -> tuple[str, float]:
    # I/O-bound: CPython releases GIL during socket wait!
    return ticker, 142.50

def heavy_cpu(n: int) -> int:
    # CPU-bound: run in ProcessPoolExecutor to use all CPU cores
    return sum(math.isqrt(i) for i in range(n))

# Context manager guarantees graceful shutdown (wait=True)
with ThreadPoolExecutor(max_workers=8, thread_name_prefix="io-pool") as io_pool:
    prices = list(io_pool.map(fetch_price, ["AAPL", "GOOG", "MSFT"]))

with ProcessPoolExecutor(max_workers=4) as cpu_pool:
    totals = list(cpu_pool.map(heavy_cpu, [50_000, 50_000]))`,
    javaCode: `import java.util.concurrent.*;

public class ThreadPoolMastery {
    public static void main(String[] args) throws Exception {
        // 1. Production Bounded ThreadPoolExecutor (NEVER unbounded!)
        var pool = new ThreadPoolExecutor(
            4,                              // corePoolSize
            8,                              // maximumPoolSize
            30, TimeUnit.SECONDS,           // idle burst thread keepAlive
            new ArrayBlockingQueue<>(100),  // bounded queue prevents OOM!
            new ThreadPoolExecutor.CallerRunsPolicy() // natural backpressure
        );
        try (pool) { // Java 19+ ExecutorService implements AutoCloseable!
            Future<String> f = pool.submit(() -> "Handled on " + Thread.currentThread());
            System.out.println(f.get(2, TimeUnit.SECONDS));
        }

        // 2. Java 21 Virtual Threads for high-concurrency I/O (no pooling needed!)
        try (var vExec = Executors.newVirtualThreadPerTaskExecutor()) {
            vExec.submit(() -> System.out.println("Virtual: " + Thread.currentThread().isVirtual()));
        }
    }
}`,
    pitfall:
      'Using `Executors.newFixedThreadPool()` in Java creates an UNBOUNDED LinkedBlockingQueue (Integer.MAX_VALUE) — under a traffic spike, millions of queued tasks will trigger OutOfMemoryError!',
    bestPractice:
      'Always construct an explicit `ThreadPoolExecutor` with a bounded `ArrayBlockingQueue` + `CallerRunsPolicy`, or use Java 21 Virtual Threads bounded by a `Semaphore` for I/O.',
  },
  {
    id: 'future-callable-timeouts',
    number: '06',
    group: 'threads-futures-concurrency',
    shortTitle: 'Future & Callable',
    title: 'Callable, Future, Cancellation, Timeouts & as_completed() Fan-In',
    summary:
      'Track asynchronous return values and exceptions with Java Future/Callable and Python concurrent.futures.Future, handle timeouts safely, and understand why blocking Future.get() led to CompletableFuture.',
    simpleEnglish:
      'A Future is a restaurant buzzer (receipt) handed to you immediately when you place an order. You can do other work while the kitchen cooks—then check if it is done, wait with a timeout, or cancel the order. The catch? Calling future.get() freezes your current thread until the buzzer rings!',
    technicalInternals:
      'Java Callable<V> returns a value and may throw checked Exceptions (unlike Runnable). Submitting it returns a FutureTask<V> wrapping an atomic state machine (NEW -> COMPLETING -> NORMAL | EXCEPTIONAL | CANCELLED) with a LockSupport wait-stack (Treiber stack) of blocked callers. Python concurrent.futures.Future provides result(timeout), cancel(), add_done_callback(), and as_completed() to stream results as each task finishes.',
    keyComparison: [
      {
        aspect: 'Task Interface',
        python: 'Any callable passed to executor.submit(fn, *args)',
        java: 'Callable<V> (returns V, throws Exception) vs Runnable (void)',
      },
      {
        aspect: 'Fetching & Timeout',
        python: 'fut.result(timeout=2.0) raises TimeoutError; cancel() stops pending tasks',
        java: 'fut.get(2, SECONDS) throws TimeoutException; cancel(true) interrupts running thread',
      },
      {
        aspect: 'Streaming First Done',
        python: 'for f in concurrent.futures.as_completed(futures): ...',
        java: 'ExecutorCompletionService<V> wraps Executor with a completion BlockingQueue',
      },
    ],
    dfdNodes: [
      { id: 'call', label: 'Submit Callable', sublabel: 'Return Future<V>', x: 82, y: 112 },
      { id: 'fsm', label: 'FutureTask FSM', sublabel: 'NEW -> RUNNING', x: 252, y: 60 },
      { id: 'wait', label: 'Caller .get(2s)', sublabel: 'Park / Timeout', x: 424, y: 162 },
      { id: 'res', label: 'Outcome / Cancel', sublabel: 'Value | Exception', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'call', to: 'fsm', label: 'Hand Receipt' },
      { id: 'e2', from: 'fsm', to: 'wait', label: 'Await / Poll' },
      { id: 'e3', from: 'wait', to: 'res', label: 'Unpark / Cancel' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Submit Callable & Receive Immediate Future Receipt',
        plainEnglish: 'The caller submits work to the pool and immediately gets a Future handle without waiting for the task to finish.',
        technicalDetail: 'FutureTask allocates a lightweight state object (state = NEW) and queues it onto the Executor.',
        activeNodeIds: ['call', 'fsm'],
        activeEdgeIds: ['e1'],
        packetLabel: 'FUTURE<V>',
      },
      {
        step: 2,
        title: 'Bounded Wait or Callback Registration',
        plainEnglish: 'Caller waits with a strict timeout (or streams results via as_completed) so a hung remote API never blocks forever.',
        technicalDetail: 'On timeout, call future.cancel(true) to deliver Thread.interrupt() so the worker stops wasting CPU/sockets.',
        activeNodeIds: ['fsm', 'wait'],
        activeEdgeIds: ['e2'],
        packetLabel: 'GET(2s)',
      },
      {
        step: 3,
        title: 'Atomic Completion & Unpark Waiters',
        plainEnglish: 'Worker stores the return value (or wrapped ExecutionException) and wakes up any waiting caller thread.',
        technicalDetail: 'CAS transitions state NEW -> COMPLETING -> NORMAL and calls LockSupport.unpark() on waiting Treiber stack nodes.',
        activeNodeIds: ['wait', 'res'],
        activeEdgeIds: ['e3'],
        packetLabel: 'UNPARK OK',
      },
    ],
    pythonCode: `from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError
import time

def query_mirror(region: str, delay: float) -> str:
    time.sleep(delay)
    return f"{region}: 200 OK ({delay}s)"

with ThreadPoolExecutor(max_workers=3) as pool:
    futures = {
        pool.submit(query_mirror, "us-east", 0.4): "us-east",
        pool.submit(query_mirror, "eu-west", 0.1): "eu-west",
        pool.submit(query_mirror, "ap-south", 0.25): "ap-south",
    }

    # Stream results in exact finish order (eu-west -> ap-south -> us-east)!
    for fut in as_completed(futures, timeout=1.5):
        region = futures[fut]
        try:
            print("Finished:", fut.result(timeout=0.5))
        except TimeoutError:
            fut.cancel()
            print(f"{region} timed out!")`,
    javaCode: `import java.util.concurrent.*;

public class FutureTimeoutDemo {
    public static void main(String[] args) throws Exception {
        try (ExecutorService pool = Executors.newFixedThreadPool(3)) {
            Callable<Integer> priceTask = () -> {
                Thread.sleep(150);
                return 499;
            };

            Future<Integer> future = pool.submit(priceTask);
            try {
                // ALWAYS pass a timeout to prevent eternal thread starvation!
                Integer price = future.get(500, TimeUnit.MILLISECONDS);
                System.out.println("Price = $" + price);
            } catch (TimeoutException e) {
                future.cancel(true); // Interrupt worker thread cleanly
                System.out.println("Cancelled slow request");
            } catch (ExecutionException e) {
                System.out.println("Task threw: " + e.getCause().getMessage());
            }
        }
    }
}`,
    pitfall:
      'Calling `future.get()` with NO timeout blocks the calling thread indefinitely if a downstream database or HTTP socket hangs.',
    bestPractice:
      'Always pass a strict timeout (`get(timeout, unit)`), call `cancel(true)` on timeout, and use `CompletableFuture` or `asyncio.TaskGroup` whenever you need to chain or combine multiple async calls.',
  },
  {
    id: 'completable-future-async',
    number: '07',
    group: 'threads-futures-concurrency',
    shortTitle: 'CompletableFuture & Async',
    title: 'CompletableFuture Pipelines (thenApply, thenCompose, thenCombine, allOf) & Python asyncio.TaskGroup',
    summary:
      'Build non-blocking async DAG pipelines with fan-out/fan-in, error recovery (exceptionally/handle), timeouts (orTimeout), custom Executors, and structured concurrency.',
    simpleEnglish:
      'Unlike plain Future (where you must stop and wait before starting Step 2), CompletableFuture lets you wire an entire assembly line upfront: "Fetch User -> then fetch their Orders AND Credit Score IN PARALLEL -> combine both -> if anything fails, return a safe fallback -> timeout after 2s!" No thread sits blocked waiting!',
    technicalInternals:
      'Java CompletableFuture implements both Future<T> and CompletionStage<T>, attaching a lock-free Treiber stack of dependent Completion actions fired automatically when the stage completes. Always distinguish thenApply (synchronous transform T->U) from thenCompose (flatMap T->CF<U>), and pass a custom Executor to supplyAsync(..., ioPool) so blocking I/O does not starve ForkJoinPool.commonPool(). In Python 3.11+, asyncio.TaskGroup provides structured concurrency—automatically cancelling sibling tasks if one raises an exception.',
    keyComparison: [
      {
        aspect: 'Transform vs FlatMap',
        python: 'await step1() then await step2(res) inside async def coroutine',
        java: 'thenApply (T -> U) vs thenCompose (T -> CompletableFuture<U>)',
      },
      {
        aspect: 'Parallel Fan-Out / Fan-In',
        python: 'async with asyncio.TaskGroup() as tg: t1 = tg.create_task(...); t2 = ...',
        java: 'thenCombine(other, fn), CompletableFuture.allOf(f1, f2), anyOf(f1, f2)',
      },
      {
        aspect: 'Error Recovery & Timeout',
        python: 'try/except* around TaskGroup; async with asyncio.timeout(2.0):',
        java: '.orTimeout(2, SECONDS).exceptionally(ex -> fallback) / .handle((v, ex) -> ...)',
      },
    ],
    dfdNodes: [
      { id: 'sup', label: 'supplyAsync(ioPool)', sublabel: 'Fetch User', x: 76, y: 112 },
      { id: 'fan', label: 'thenCompose + FanOut', sublabel: 'Orders || Credit', x: 248, y: 60 },
      { id: 'comb', label: 'thenCombine / allOf', sublabel: 'Join Parallel DAG', x: 424, y: 162 },
      { id: 'rec', label: 'orTimeout + Handle', sublabel: 'Fallback / Output', x: 586, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'sup', to: 'fan', label: 'User Ready' },
      { id: 'e2', from: 'fan', to: 'comb', label: '2 Async Calls' },
      { id: 'e3', from: 'comb', to: 'rec', label: 'Merged DTO' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Launch Root Stage on Dedicated I/O Executor',
        plainEnglish: 'Starts fetching the user asynchronously on an I/O thread pool without blocking the caller.',
        technicalDetail: 'Passing custom ioPool prevents blocking calls from exhausting ForkJoinPool.commonPool() used by parallel streams.',
        activeNodeIds: ['sup', 'fan'],
        activeEdgeIds: ['e1'],
        packetLabel: 'SUPPLY ASYNC',
      },
      {
        step: 2,
        title: 'FlatMap & Parallel Fan-Out (Orders + Credit Score)',
        plainEnglish: 'Once User arrives, fires Orders and Credit Score API calls at the exact same time—cutting total wait in half!',
        technicalDetail: 'thenCompose flattens nested CompletableFuture<CompletableFuture<T>> into CompletableFuture<T>.',
        activeNodeIds: ['fan', 'comb'],
        activeEdgeIds: ['e2'],
        packetLabel: 'FAN-OUT 2x',
      },
      {
        step: 3,
        title: 'Fan-In Join, Timeout Guard & Exception Recovery',
        plainEnglish: 'Combines both responses into one Checkout object; if Credit API times out, exceptionally() substitutes a safe default.',
        technicalDetail: 'Completion stack propagates either result or CompletionException downstream; orTimeout() triggers ScheduledThreadPool timer.',
        activeNodeIds: ['comb', 'rec'],
        activeEdgeIds: ['e3'],
        packetLabel: 'COMBINE + OK',
      },
    ],
    pythonCode: `import asyncio

async def fetch_user(uid: int) -> dict:
    await asyncio.sleep(0.05)
    return {"id": uid, "tier": "PRO"}

async def fetch_orders(uid: int) -> list[str]:
    await asyncio.sleep(0.08)
    return ["ORD-101", "ORD-205"]

async def fetch_credit(uid: int) -> int:
    await asyncio.sleep(0.06)
    return 780

async def build_dashboard(uid: int) -> dict:
    user = await fetch_user(uid)
    # Python 3.11+ Structured Concurrency + Deadline Timeout
    try:
        async with asyncio.timeout(1.5):
            async with asyncio.TaskGroup() as tg:
                orders_task = tg.create_task(fetch_orders(user["id"]))
                credit_task = tg.create_task(fetch_credit(user["id"]))
        return {
            "user": user,
            "orders": orders_task.result(),
            "credit": credit_task.result(),
        }
    except TimeoutError:
        return {"user": user, "orders": [], "credit": 0, "degraded": True}`,
    javaCode: `import java.util.concurrent.*;

public class CompletableFuturePipeline {
    public static void main(String[] args) {
        try (ExecutorService ioPool = Executors.newVirtualThreadPerTaskExecutor()) {

            CompletableFuture<String> userF =
                CompletableFuture.supplyAsync(() -> "user-42", ioPool);

            // Parallel fan-out using thenCompose + thenCombine
            CompletableFuture<String> dashboardF = userF.thenCompose(uid -> {
                var ordersF = CompletableFuture.supplyAsync(() -> "Orders[" + uid + "]", ioPool);
                var creditF = CompletableFuture.supplyAsync(() -> 790, ioPool)
                    .completeOnTimeout(650, 300, TimeUnit.MILLISECONDS); // Safe fallback!

                return ordersF.thenCombine(creditF,
                    (orders, score) -> orders + " | Credit=" + score);
            })
            .orTimeout(2, TimeUnit.SECONDS)
            .exceptionally(ex -> "Degraded Dashboard: " + ex.getMessage());

            System.out.println(dashboardF.join());
        }
    }
}`,
    pitfall:
      'Running blocking JDBC/HTTP calls inside `CompletableFuture.supplyAsync(fn)` WITHOUT passing a custom Executor starves the global `ForkJoinPool.commonPool()` (size = CPU cores - 1)!',
    bestPractice:
      'Always pass an explicit I/O `Executor` (or Virtual Thread Executor in Java 21) to `supplyAsync`, prefer `thenCompose` over nested `get()`, and bound every pipeline with `orTimeout` / `asyncio.timeout`.',
  },
  {
    id: 'locks-atomics-sync',
    number: '08',
    group: 'threads-futures-concurrency',
    shortTitle: 'Locks, Atomics & Sync',
    title: 'Synchronization Primitives: Locks, Semaphores, Latches, Volatile & Lock-Free CAS Atomics',
    summary:
      'Prevent race conditions and deadlocks using ReentrantLock, ReadWriteLock, Semaphore, CountDownLatch, volatile happens-before memory visibility, and CPU Compare-And-Swap (CAS) atomics.',
    simpleEnglish:
      'When two threads run `count = count + 1` at the same instant, both can read 5 and write 6—losing an update! Locks put a bathroom key on shared data (1 thread at a time), Semaphores act like a parking garage gate allowing N cars inside, and Atomics use a single hardware CPU instruction (CAS) to update safely without blocking!',
    technicalInternals:
      'Java Memory Model (JMM) defines happens-before visibility edges: `volatile` inserts CPU memory barriers (LoadLoad/StoreStore) preventing stale L1 cache reads; `AtomicInteger` / `LongAdder` execute hardware Compare-And-Swap (`LOCK CMPXCHG` on x86) without OS mutex syscalls; `ReentrantLock`, `Semaphore`, and `CountDownLatch` build on AbstractQueuedSynchronizer (AQS — CLH FIFO wait queue). Python provides `threading.Lock`, `RLock`, `Semaphore`, `Event`, `Condition`, and `asyncio.Semaphore` for bounding concurrent coroutines.',
    keyComparison: [
      {
        aspect: 'Mutual Exclusion',
        python: 'threading.Lock / RLock (with lock:); asyncio.Lock for coroutines',
        java: 'synchronized (monitor) / ReentrantLock (tryLock + fairness + Condition)',
      },
      {
        aspect: 'Concurrency Bounding',
        python: 'threading.Semaphore(N) / asyncio.Semaphore(N) (bulkhead limit)',
        java: 'Semaphore(N), ReadWriteLock / StampedLock (many readers, 1 writer)',
      },
      {
        aspect: 'Coordination & Lock-Free',
        python: 'threading.Event, Barrier, queue.Queue (thread-safe handoff)',
        java: 'CountDownLatch, CyclicBarrier, volatile, AtomicInteger, LongAdder (striped CAS)',
      },
    ],
    dfdNodes: [
      { id: 'race', label: 'Concurrent Threads', sublabel: 'T1 & T2 Contend', x: 82, y: 112 },
      { id: 'aqs', label: 'AQS / Semaphore', sublabel: 'Permit / FIFO Wait', x: 252, y: 60 },
      { id: 'cas', label: 'CPU CAS / Barrier', sublabel: 'LOCK CMPXCHG', x: 424, y: 162 },
      { id: 'safe', label: 'Consistent State', sublabel: 'Happens-Before OK', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'race', to: 'aqs', label: 'Acquire / tryLock' },
      { id: 'e2', from: 'aqs', to: 'cas', label: 'Atomic State CAS' },
      { id: 'e3', from: 'cas', to: 'safe', label: 'Memory Flush' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Contention & Admission Gate (Lock / Semaphore)',
        plainEnglish: 'Multiple threads try to enter a critical section or call a rate-limited API; the Lock or Semaphore admits only allowed permits.',
        technicalDetail: 'AQS attempts fast-path CAS on volatile state int; losing threads park cleanly in a CLH FIFO node queue.',
        activeNodeIds: ['race', 'aqs'],
        activeEdgeIds: ['e1'],
        packetLabel: 'ACQUIRE',
      },
      {
        step: 2,
        title: 'Hardware Compare-And-Swap (CAS) & Memory Fence',
        plainEnglish: 'Atomic counters update memory in a single indivisible CPU step ("if still 5, swap to 6; else retry") with zero OS thread sleep.',
        technicalDetail: 'LongAdder stripes counters into per-CPU-core cells to eliminate L1 cache-line ping-pong under high contention.',
        activeNodeIds: ['aqs', 'cas'],
        activeEdgeIds: ['e2'],
        packetLabel: 'CAS CMPXCHG',
      },
      {
        step: 3,
        title: 'Unlock & Happens-Before Cache Coherence Flush',
        plainEnglish: 'Releasing the lock flushes CPU caches so the very next thread is guaranteed to see the newest updated value.',
        technicalDetail: 'Always unlock inside finally / with-block and acquire multiple locks in a strict global ID order to prevent Deadlocks!',
        activeNodeIds: ['cas', 'safe'],
        activeEdgeIds: ['e3'],
        packetLabel: 'RELEASE OK',
      },
    ],
    pythonCode: `import asyncio
import threading

# 1. Thread-Safe Counter with Reentrant Lock + Deadlock-Free Ordering
class Account:
    def __init__(self, acc_id: int, balance: int) -> None:
        self.id = acc_id
        self.balance = balance
        self.lock = threading.Lock()

def transfer(src: Account, dst: Account, amount: int) -> None:
    # Always lock lowest ID first -> mathematically prevents Deadlock!
    first, second = (src, dst) if src.id < dst.id else (dst, src)
    with first.lock, second.lock:
        if src.balance >= amount:
            src.balance -= amount
            dst.balance += amount

# 2. Async Bulkhead Concurrency Limiter (max 5 in-flight HTTP calls)
sem = asyncio.Semaphore(5)

async def call_upstream(item_id: int) -> str:
    async with sem:
        await asyncio.sleep(0.05)
        return f"fetched-{item_id}"`,
    javaCode: `import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.concurrent.locks.*;

public class SyncPrimitivesDemo {
    private final LongAdder requests = new LongAdder(); // High-contention CAS counter
    private final Semaphore apiBulkhead = new Semaphore(10); // Max 10 concurrent calls
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private volatile boolean shutdownRequested = false; // Visibility barrier across cores

    String protectedApiCall() throws InterruptedException {
        requests.increment();
        if (!apiBulkhead.tryAcquire(200, TimeUnit.MILLISECONDS)) {
            return "429 Bulkhead Full";
        }
        try {
            return "200 Downstream OK";
        } finally {
            apiBulkhead.release(); // ALWAYS release in finally!
        }
    }

    // CountDownLatch: wait until N startup services report ready
    void awaitStartup(int services) throws InterruptedException {
        var ready = new CountDownLatch(services);
        // Each service calls ready.countDown() when initialized
        ready.await(5, TimeUnit.SECONDS);
    }
}`,
    pitfall:
      'Holding a `synchronized` monitor lock across a blocking I/O call on Java 21 Virtual Threads pins the underlying OS carrier thread (fixed in JDK 24 JEP 491, but in Java 21 use `ReentrantLock`!).',
    bestPractice:
      'Use `ReentrantLock` over `synchronized` around I/O in Java 21, `LongAdder` for high-contention metrics, `Semaphore` as an async bulkhead, and strict lock ordering to eliminate deadlocks.',
  },
];
