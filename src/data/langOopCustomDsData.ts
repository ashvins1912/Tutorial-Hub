export type TutorialSkillLevel = 'Zero / Basic' | 'Intermediate' | 'Advanced';

export interface MiniDfdNode {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
}

export interface MiniDfdEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

export interface MiniDfdStep {
  step: number;
  title: string;
  plainEnglish: string;
  technicalDetail: string;
  activeNodeIds: string[];
  activeEdgeIds: string[];
  packetLabel: string;
}

export interface OopCodingModule {
  id: string;
  number: string;
  level: TutorialSkillLevel;
  title: string;
  shortTitle: string;
  summary: string;
  simpleEnglish: string;
  standardDefinition: string;
  howOopUsesInternalDs: string;
  dfdNodes: MiniDfdNode[];
  dfdEdges: MiniDfdEdge[];
  dfdSteps: MiniDfdStep[];
  pythonCode: string;
  javaCode: string;
  commonPitfall: string;
  bestPractice: string;
}

export type CustomDsId =
  | 'dynamic-array'
  | 'doubly-linked-list'
  | 'custom-hashmap'
  | 'circular-queue'
  | 'binary-min-heap'
  | 'binary-search-tree';

export interface CustomDsRule {
  id: string;
  label: string;
  hint: string;
  test: (code: string) => boolean;
}

export interface CustomDsBlueprint {
  id: CustomDsId;
  shortTitle: string;
  title: string;
  level: TutorialSkillLevel;
  tagline: string;
  simpleEnglish: string;
  standardDefinition: string;
  oopArchitectureNotes: string;
  complexityRows: { operation: string; average: string; worst: string; note: string }[];
  dfdNodes: MiniDfdNode[];
  dfdEdges: MiniDfdEdge[];
  dfdSteps: MiniDfdStep[];
  pythonCode: string;
  javaCode: string;
  starterPython: string;
  starterJava: string;
  pythonRules: CustomDsRule[];
  javaRules: CustomDsRule[];
}

export const OOP_CODING_MODULES: OopCodingModule[] = [
  {
    id: 'functions-call-stack',
    number: '01',
    level: 'Zero / Basic',
    title: 'Functions, Call Stack Frames, Closures & Lambdas',
    shortTitle: 'Functions & Stack Frames',
    summary:
      'Trace how every function call pushes a stack frame in RAM, passes object references, captures closure cells, and pops cleanly on return.',
    simpleEnglish:
      'Think of a function like a mini workbench recipe. Every time your program calls a function, the runtime stacks a fresh sticky note (a Stack Frame) on top of the Call Stack holding its local variables. When the function returns, that note is ripped off and thrown away immediately.',
    standardDefinition:
      'Procedural invocation allocates an activation record (stack frame) containing parameters, local variable slots, return address, and lexical closure bindings. Python passes object references by value (PyFrameObject on the CPython frame stack), while Java passes primitives and heap object references by value onto the JVM thread stack.',
    howOopUsesInternalDs:
      'The Call Stack itself is a LIFO Stack data structure! In Python, a function object also carries a Hash Table (__globals__) plus a Tuple (__closure__) of Cell objects for captured outer variables. In Java, the JVM Operand Stack and Local Variable Array inside each frame are fixed-size arrays verified at bytecode load time.',
    dfdNodes: [
      { id: 'caller', label: 'Caller Code', sublabel: 'discount(100)', x: 86, y: 112 },
      { id: 'stack', label: 'Call Stack (LIFO)', sublabel: 'Push Frame #2', x: 252, y: 58 },
      { id: 'heap', label: 'Heap Objects', sublabel: 'Closure / Ref', x: 422, y: 162 },
      { id: 'return', label: 'Pop & Return', sublabel: 'Result -> Caller', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'caller', to: 'stack', label: 'Invoke + Args' },
      { id: 'e2', from: 'stack', to: 'heap', label: 'Read Ref / Cell' },
      { id: 'e3', from: 'stack', to: 'return', label: 'Return Value' },
      { id: 'e4', from: 'heap', to: 'return', label: 'Object Ref' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Push New Stack Frame onto Call Stack',
        plainEnglish: 'Calling a function reserves a private pocket on top of the Call Stack for its local variables.',
        technicalDetail: 'CPython allocates a lightweight _PyInterpreterFrame; JVM pushes a Frame with LocalVariableTable[] and OperandStack[].',
        activeNodeIds: ['caller', 'stack'],
        activeEdgeIds: ['e1'],
        packetLabel: 'PUSH frame',
      },
      {
        step: 2,
        title: 'Resolve References & Closure Variables on Heap',
        plainEnglish: 'Local names point to objects living on the Heap—including outer variables captured by closures or lambdas.',
        technicalDetail: 'Python dereferences PyCellObject from __closure__; Java captures effectively-final values inside synthetic invokedynamic lambda fields.',
        activeNodeIds: ['stack', 'heap'],
        activeEdgeIds: ['e2'],
        packetLabel: 'LOAD_DEREF',
      },
      {
        step: 3,
        title: 'Pop Stack Frame & Deliver Return Value',
        plainEnglish: 'The function finishes, hands back the answer, and immediately frees its local stack memory in O(1).',
        technicalDetail: 'Stack pointer rewinds in O(1); unreferenced heap objects wait for refcount==0 (Python) or generational GC (JVM).',
        activeNodeIds: ['stack', 'heap', 'return'],
        activeEdgeIds: ['e3', 'e4'],
        packetLabel: 'POP -> 85.0',
      },
    ],
    pythonCode: `from collections.abc import Callable

# Zero-to-Pro Python 3.13+: Pure function, default guard, and lexical closure
def make_discount_engine(rate: float) -> Callable[[float], float]:
    """Returns a closure capturing 'rate' in a heap Cell object."""
    if not 0.0 <= rate <= 0.9:
        raise ValueError("Discount rate must be between 0% and 90%")

    def apply(price: float) -> float:
        return round(price * (1.0 - rate), 2)

    return apply

vip_price = make_discount_engine(0.15)
print(vip_price(200.0))        # 170.0
print(vip_price.__closure__[0].cell_contents)  # 0.15 (stored in heap Cell)`,
    javaCode: `import java.util.function.DoubleUnaryOperator;

// Zero-to-Pro Java 21+: Methods, effectively-final closures & invokedynamic lambdas
public final class DiscountEngine {
    public static DoubleUnaryOperator makeDiscount(double rate) {
        if (rate < 0.0 || rate > 0.9) {
            throw new IllegalArgumentException("Rate must be in [0.0, 0.9]");
        }
        // 'rate' is effectively final -> captured cleanly by JVM invokedynamic
        return price -> Math.round(price * (1.0 - rate) * 100.0) / 100.0;
    }

    public static void main(String[] args) {
        var vipPrice = makeDiscount(0.15);
        System.out.println(vipPrice.applyAsDouble(200.0)); // 170.0
    }
}`,
    commonPitfall:
      'In Python, writing `def add_item(x, items=[]):` creates ONE shared list at function definition time (not per call!). In Java, attempting to mutate a local variable captured inside a lambda fails compilation.',
    bestPractice:
      'Always use `items: list[T] | None = None` in Python and allocate inside the body; keep functions small, pure where possible, and pass explicit immutable values.',
  },
  {
    id: 'classes-object-memory',
    number: '02',
    level: 'Zero / Basic',
    title: 'Classes, Objects, Memory Layout & Constructors',
    shortTitle: 'Classes & Object Memory',
    summary:
      'Understand what really happens in RAM when you call `new Account(...)` in Java or `Account(...)` in Python—headers, `__dict__` vs `__slots__`, and Heap allocation.',
    simpleEnglish:
      'A Class is an architectural blueprint; an Object is a real house built from it on the Heap. Python objects normally keep their attributes inside a flexible dictionary (`__dict__`), whereas Java objects pack fields tightly next to a tiny 12-byte object header for maximum speed.',
    standardDefinition:
      'Instantiation allocates contiguous heap storage for instance fields plus a class metadata pointer (ob_type in CPython; Compressed Klass Pointer in HotSpot JVM). Python supports `__slots__` to replace per-instance hash tables with fixed C-struct member descriptors, cutting RAM usage by ~40–60%.',
    howOopUsesInternalDs:
      'By default, EVERY Python object owns a Hash Table (`obj.__dict__`) mapping field names to values! Adding `__slots__` replaces that Hash Table with a fixed-offset Array (tuple of descriptors). In Java, every object is already a fixed-offset struct whose field offsets are pre-computed in the Class Metadata table.',
    dfdNodes: [
      { id: 'ctor', label: 'Class Blueprint', sublabel: 'Account(id, bal)', x: 86, y: 112 },
      { id: 'alloc', label: 'Heap Allocator', sublabel: 'TLAB / pymalloc', x: 252, y: 58 },
      { id: 'layout', label: 'Object Memory', sublabel: 'Header + Fields', x: 422, y: 162 },
      { id: 'ref', label: 'Stack Variable', sublabel: 'acc -> 0x7F10', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'ctor', to: 'alloc', label: 'new / __new__' },
      { id: 'e2', from: 'alloc', to: 'layout', label: 'Zero & Init Fields' },
      { id: 'e3', from: 'layout', to: 'ref', label: 'Return Ptr' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Allocate Raw Object Memory on Heap',
        plainEnglish: 'The runtime grabs a fresh block of Heap memory big enough to store the object header and its fields.',
        technicalDetail: 'JVM bumps a pointer in thread-local TLAB (~2 ns); CPython allocates via pymalloc arena pools in __new__.',
        activeNodeIds: ['ctor', 'alloc'],
        activeEdgeIds: ['e1'],
        packetLabel: 'ALLOC 32B',
      },
      {
        step: 2,
        title: 'Attach Class Pointer & Populate Fields',
        plainEnglish: 'The constructor (`__init__` or `Account(...)`) fills in `owner` and `balance` and links the object back to its Class.',
        technicalDetail: 'JVM writes Mark Word + Klass pointer + primitive fields; Python writes attributes into __dict__ (Hash Table) or __slots__ offsets.',
        activeNodeIds: ['alloc', 'layout'],
        activeEdgeIds: ['e2'],
        packetLabel: 'INIT fields',
      },
      {
        step: 3,
        title: 'Bind Reference Address on Stack',
        plainEnglish: 'Your local variable `acc` only holds the memory address pointing to the Heap object—not a copy of the whole object.',
        technicalDetail: 'Both Python variables and Java object variables store 64-bit/compressed references pointing to the allocated heap instance.',
        activeNodeIds: ['layout', 'ref'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ref=0x7F10',
      },
    ],
    pythonCode: `from dataclasses import dataclass

# Using slots=True replaces per-instance __dict__ hash table with fixed C-struct offsets!
@dataclass(slots=True)
class BankAccount:
    account_id: str
    _balance_cents: int = 0

    def deposit(self, cents: int) -> None:
        if cents <= 0:
            raise ValueError("Deposit must be positive")
        self._balance_cents += cents

    @property
    def balance(self) -> float:
        return self._balance_cents / 100.0

acc = BankAccount("ACC-01", 50_00)
acc.deposit(25_50)
print(f"{acc.account_id}: \${acc.balance:.2f}")  # ACC-01: $75.50`,
    javaCode: `// Java 21+: Encapsulated class with immutable ID and validated state mutations
public final class BankAccount {
    private final String accountId;
    private long balanceCents; // stored as compact 8-byte primitive in heap object

    public BankAccount(String accountId, long initialCents) {
        if (initialCents < 0) throw new IllegalArgumentException("Negative balance");
        this.accountId = accountId;
        this.balanceCents = initialCents;
    }

    public void deposit(long cents) {
        if (cents <= 0) throw new IllegalArgumentException("Deposit must be positive");
        this.balanceCents += cents;
    }

    public double balance() {
        return balanceCents / 100.0;
    }
}`,
    commonPitfall:
      'Storing money in `float`/`double` causes binary rounding drift (`0.1 + 0.2 == 0.30000000000000004`), and creating millions of plain Python objects without `slots=True` wastes gigabytes on per-object `__dict__` hash tables.',
    bestPractice:
      'Store money as integer cents or `Decimal`/`BigDecimal`, validate invariants inside constructors, and use `@dataclass(slots=True)` in Python or `record` in Java for value objects.',
  },
  {
    id: 'encapsulation-inheritance-poly',
    number: '03',
    level: 'Intermediate',
    title: 'Encapsulation, Inheritance & Polymorphism (MRO vs vtable)',
    shortTitle: 'OOP Pillars, MRO & vtable',
    summary:
      'See how dynamic method dispatch works internally when calling `shape.area()`—Python C3 Linearization MRO chain lookup vs. Java O(1) vtable jump.',
    simpleEnglish:
      'Encapsulation hides sensitive internal fields behind safe methods. Polymorphism lets one line of code (`pay.charge()`) run different behavior depending on whether the object is a CreditCard or UPI wallet—without messy `if/else` chains.',
    standardDefinition:
      'Runtime polymorphism resolves virtual method targets via dynamic dispatch. Python traverses the class Method Resolution Order (C3 Linearization tuple `__mro__`) checking each class `__dict__` hash table (accelerated by inline specialization caches in 3.11+). HotSpot JVM indexes a flat per-class virtual method table (`vtable`) in O(1) and devirtualizes monomorphic call sites via JIT inline caches.',
    howOopUsesInternalDs:
      'Python stores the entire inheritance hierarchy as a pre-computed linear Tuple (`cls.__mro__`) built via a Topological Sort algorithm (C3 Linearization), and looks up method names inside each class’s Hash Table. Java compiles every class’s inheritable methods into a flat Array of function pointers (`vtable`) indexed by constant slot number for O(1) dispatch!',
    dfdNodes: [
      { id: 'call', label: 'Polymorphic Call', sublabel: 'payment.charge()', x: 86, y: 112 },
      { id: 'klass', label: 'Object Type Ptr', sublabel: 'ob_type / Klass', x: 252, y: 58 },
      { id: 'table', label: 'MRO / vtable', sublabel: 'C3 List | Array[i]', x: 422, y: 162 },
      { id: 'exec', label: 'Target Method', sublabel: 'Card.charge()', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'call', to: 'klass', label: 'Inspect Runtime Type' },
      { id: 'e2', from: 'klass', to: 'table', label: 'Lookup Slot / Dict' },
      { id: 'e3', from: 'table', to: 'exec', label: 'Jump to Code' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Read Object’s Runtime Type Pointer',
        plainEnglish: 'At runtime, the engine checks the real class badge stamped on the object header (e.g., CardPayment).',
        technicalDetail: 'JVM dereferences Klass* from the object header; CPython reads Py_TYPE(obj) pointer.',
        activeNodeIds: ['call', 'klass'],
        activeEdgeIds: ['e1'],
        packetLabel: 'type=Card',
      },
      {
        step: 2,
        title: 'Resolve Method via vtable (Java) or MRO (Python)',
        plainEnglish: 'Java jumps directly to index #3 in the class vtable array; Python scans its cached MRO class chain.',
        technicalDetail: 'Java invokevirtual performs O(1) vtable[slot]; Python 3.13 uses adaptive LOAD_ATTR_METHOD_WITH_VALUES inline cache.',
        activeNodeIds: ['klass', 'table'],
        activeEdgeIds: ['e2'],
        packetLabel: 'vtable[3]',
      },
      {
        step: 3,
        title: 'Invoke Concrete Implementation',
        plainEnglish: 'The exact overridden `charge()` method runs cleanly with `self`/`this` bound to the object.',
        technicalDetail: 'JIT compiler often inlines monomorphic/bimorphic calls completely, eliminating even the indirect jump.',
        activeNodeIds: ['table', 'exec'],
        activeEdgeIds: ['e3'],
        packetLabel: 'EXEC Card',
      },
    ],
    pythonCode: `from abc import ABC, abstractmethod

class PaymentMethod(ABC):
    @abstractmethod
    def charge(self, amount_cents: int) -> str: ...

class CardPayment(PaymentMethod):
    def __init__(self, last4: str) -> None:
        self._last4 = last4  # encapsulated internal state

    def charge(self, amount_cents: int) -> str:
        return f"Charged {amount_cents}c via Card ****{self._last4}"

class WalletPayment(PaymentMethod):
    def charge(self, amount_cents: int) -> str:
        return f"Charged {amount_cents}c via Instant Wallet"

def checkout(method: PaymentMethod, cents: int) -> str:
    return method.charge(cents)  # Polymorphic dispatch via MRO

print(CardPayment.__mro__)  # (CardPayment, PaymentMethod, ABC, object)`,
    javaCode: `// Java 21+: Sealed hierarchy + exhaustive pattern matching & vtable polymorphism
public sealed interface PaymentMethod permits CardPayment, WalletPayment {
    String charge(long amountCents);
}

public record CardPayment(String last4) implements PaymentMethod {
    @Override
    public String charge(long amountCents) {
        return "Charged " + amountCents + "c via Card ****" + last4;
    }
}

public record WalletPayment(String handle) implements PaymentMethod {
    @Override
    public String charge(long amountCents) {
        return "Charged " + amountCents + "c via Wallet " + handle;
    }
}

// O(1) dynamic dispatch via JVM interface/virtual method table:
// String receipt = method.charge(4999);`,
    commonPitfall:
      'Building deep 5-level inheritance trees (`Animal -> Mammal -> Pet -> Dog -> GuardDog`) creates fragile base-class bugs where changing one parent breaks unrelated subclasses.',
    bestPractice:
      'Favor Composition over Inheritance: inject small focused collaborators/interfaces (Strategy Pattern) and restrict inheritance hierarchies using Java `sealed` types or Python `Protocol`.',
  },
  {
    id: 'abstraction-interfaces-generics',
    number: '04',
    level: 'Intermediate',
    title: 'Abstraction, Interfaces, Protocols & Type-Safe Generics',
    shortTitle: 'Protocols, Interfaces & Generics',
    summary:
      'Write reusable, type-safe components and data structures using Python 3.12+ PEP 695 Generics + `Protocol` and Java 21+ `interface` + Generic Bounds (`<T extends Comparable<T>>`).',
    simpleEnglish:
      'An Interface or Protocol is a power-outlet specification: any device with the right plug works seamlessly. Generics (`Box<T>` or `Box[T]`) let you write ONE dynamic array or repository class that safely holds `User`, `Order`, or `Integer` without duplicate code.',
    standardDefinition:
      'Parametric polymorphism (Generics) decouples algorithm and container logic from concrete element types. Python uses PEP 695 type parameter syntax (`class Repo[T]`) checked statically by mypy/pyright alongside structural subtyping (`typing.Protocol`). Java enforces nominal subtyping (`implements`) and compile-time generic variance (PECS: Producer Extends, Consumer Super) compiled via type erasure.',
    howOopUsesInternalDs:
      'Generic data structures (`ArrayList<T>`, `HashMap<K, V>`, `dict[str, User]`) combine OOP encapsulation with parametric typing so internal arrays (`Object[]` in Java; `PyObject**` in Python) stay hidden behind safe, strongly typed APIs.',
    dfdNodes: [
      { id: 'contract', label: 'Interface / Protocol', sublabel: 'Repository[T]', x: 86, y: 112 },
      { id: 'typecheck', label: 'Type Checker', sublabel: 'javac / pyright', x: 252, y: 58 },
      { id: 'impl', label: 'Concrete Storage', sublabel: 'InMemory / SQL', x: 422, y: 162 },
      { id: 'client', label: 'Decoupled Service', sublabel: 'Depends on Contract', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'contract', to: 'typecheck', label: 'Verify Bounds <T>' },
      { id: 'e2', from: 'typecheck', to: 'impl', label: 'Bind Concrete Type' },
      { id: 'e3', from: 'impl', to: 'client', label: 'Injected Instance' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Define Minimal Contract with Generic Type Parameter',
        plainEnglish: 'Specify only what callers need (`save(item)` and `find(id)`) without exposing database or array details.',
        technicalDetail: 'Python Protocol enables structural duck-typing; Java interface enforces explicit nominal contract.',
        activeNodeIds: ['contract', 'typecheck'],
        activeEdgeIds: ['e1'],
        packetLabel: 'Repo<Order>',
      },
      {
        step: 2,
        title: 'Verify Type Safety Before Production',
        plainEnglish: 'The compiler/type-checker catches type mismatches (e.g., putting a `String` into an `Order` repo) before code ever runs.',
        technicalDetail: 'Java erases generic bounds to Object/UpperBound after inserting verified checkcast instructions; Python retains runtime __orig_bases__ metadata.',
        activeNodeIds: ['typecheck', 'impl'],
        activeEdgeIds: ['e2'],
        packetLabel: 'TYPE OK',
      },
      {
        step: 3,
        title: 'Swap Implementations Without Touching Business Logic',
        plainEnglish: 'Plug in an in-memory HashMap during unit tests and PostgreSQL in production without changing one line of caller code.',
        technicalDetail: 'Dependency Inversion Principle (SOLID "D") eliminates tight coupling between domain logic and storage engines.',
        activeNodeIds: ['impl', 'client'],
        activeEdgeIds: ['e3'],
        packetLabel: 'DI Ready',
      },
    ],
    pythonCode: `from typing import Protocol

# Python 3.12+ PEP 695 Generic Protocol (Structural Subtyping)
class Identifiable(Protocol):
    id: str

class Repository[T: Identifiable](Protocol):
    def save(self, entity: T) -> None: ...
    def get(self, entity_id: str) -> T | None: ...

class InMemoryRepo[T: Identifiable]:
    def __init__(self) -> None:
        self._store: dict[str, T] = {}  # Internal Hash Table!

    def save(self, entity: T) -> None:
        self._store[entity.id] = entity

    def get(self, entity_id: str) -> T | None:
        return self._store.get(entity_id)`,
    javaCode: `import java.util.*;

// Java 21+: Generic Interface + Bounded Type Parameter + Internal HashMap
public interface Identifiable {
    String id();
}

public interface Repository<T extends Identifiable> {
    void save(T entity);
    Optional<T> get(String id);
}

public final class InMemoryRepo<T extends Identifiable> implements Repository<T> {
    private final Map<String, T> store = new HashMap<>(); // Internal HashMap!

    @Override
    public void save(T entity) { store.put(entity.id(), entity); }

    @Override
    public Optional<T> get(String id) { return Optional.ofNullable(store.get(id)); }
}`,
    commonPitfall:
      'Using raw types (`List list = new ArrayList()`) in Java or `Any` everywhere in Python defeats type safety and turns compile-time errors into 3 AM production `ClassCastException` / `AttributeError` crashes.',
    bestPractice:
      'Parameterize every collection and custom data structure with explicit generic types (`<T>` / `[T]`) and prefer narrow interfaces over bloated "god" interfaces.',
  },
  {
    id: 'oop-uses-internal-ds',
    number: '05',
    level: 'Advanced',
    title: 'How OOP Internally Uses Data Structures Under the Hood',
    shortTitle: 'OOP’s Internal Data Structures',
    summary:
      'Pull back the curtain on Python and the JVM: see how Hash Tables, Dynamic Arrays, Trees, and Linked Lists literally power classes, objects, exceptions, and garbage collection.',
    simpleEnglish:
      'Data structures are not just interview puzzles—they are the actual engine inside OOP! Every time you write `user.name` in Python, Python runs a Hash Table lookup. Every time you call a method in Java, the JVM indexes an internal Array (`vtable`) and checks a String Pool Hash Table.',
    standardDefinition:
      'Object-oriented runtimes are built directly on classical data structures: Hash Tables power Python namespaces (`__dict__`, `globals()`, module cache `sys.modules`) and the JVM String Intern Table / SystemDictionary; Dynamic Arrays back JVM `vtable`, operand stacks, and Python C-tuples; Directed Acyclic Graphs & Tri-Color Worklists drive mark-sweep/G1/ZGC garbage collectors.',
    howOopUsesInternalDs:
      '1) Object Attributes -> Hash Table (`__dict__`) or Fixed Array (`__slots__` / JVM field layout). 2) Method Dispatch -> Topological Tuple (`__mro__`) + Hash Table (Python) or Array (`vtable`, Java). 3) Garbage Collection -> Graph BFS/DFS traversal from GC Roots using Mark Bitmaps and Region Queues!',
    dfdNodes: [
      { id: 'syntax', label: 'OOP Code', sublabel: 'obj.method(x)', x: 86, y: 112 },
      { id: 'dict', label: 'Hash Table', sublabel: '__dict__ / Intern', x: 252, y: 48 },
      { id: 'arr', label: 'Contiguous Array', sublabel: 'vtable / __slots__', x: 422, y: 112 },
      { id: 'gc', label: 'Graph + Queue', sublabel: 'GC Root Traversal', x: 582, y: 176 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'syntax', to: 'dict', label: 'Attr / Symbol Lookup' },
      { id: 'e2', from: 'syntax', to: 'arr', label: 'Slot / vtable Index' },
      { id: 'e3', from: 'dict', to: 'gc', label: 'Heap Object Graph' },
      { id: 'e4', from: 'arr', to: 'gc', label: 'Reachability Trace' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Namespace & Attribute Resolution -> Hash Table',
        plainEnglish: 'Accessing `order.total` in Python hashes `"total"` inside `order.__dict__` in O(1); Java resolves string literals via its interned Hash Table.',
        technicalDetail: 'CPython 3.11+ shares dict keys across instances of the same class (PEP 412 key-sharing dictionaries) to shrink memory.',
        activeNodeIds: ['syntax', 'dict'],
        activeEdgeIds: ['e1'],
        packetLabel: 'HASH("total")',
      },
      {
        step: 2,
        title: 'Fast Field & Method Indexing -> Contiguous Array',
        plainEnglish: 'Java’s `vtable` and Python’s `__slots__` replace string hashing with instant array-index arithmetic (`base + offset`).',
        technicalDetail: 'Direct offset addressing stays L1-cache-hot and eliminates hash computation on tight loops.',
        activeNodeIds: ['syntax', 'arr'],
        activeEdgeIds: ['e2'],
        packetLabel: '*(base + 16)',
      },
      {
        step: 3,
        title: 'Garbage Collection -> Graph Traversal (BFS/DFS)',
        plainEnglish: 'Every object reference is a directed graph edge. The Garbage Collector walks from Stack Roots to reclaim unreachable islands.',
        technicalDetail: 'CPython combines O(1) Reference Counting with a cyclic Doubly Linked List GC; JVM G1/ZGC runs concurrent tri-color marking.',
        activeNodeIds: ['dict', 'arr', 'gc'],
        activeEdgeIds: ['e3', 'e4'],
        packetLabel: 'MARK & SWEEP',
      },
    ],
    pythonCode: `# Inspecting the actual internal data structures powering Python OOP!
class Node:
    def __init__(self, value: int) -> None:
        self.value = value

n = Node(42)
print(type(n.__dict__))       # <class 'dict'>  -> Hash Table!
print(type(Node.__mro__))     # <class 'tuple'> -> Contiguous Array!
print(n.__dict__)             # {'value': 42}

# Under the hood, n.value executes roughly:
# 1. Check type(n).__dict__ for data descriptor
# 2. Hash lookup 'value' inside n.__dict__ (O(1))
# 3. Fallback to walking Node.__mro__ class dicts`,
    javaCode: `import java.util.*;

// How Java OOP collections & runtime rely on internal DS:
// - Object fields -> Fixed-offset struct in Heap
// - Methods -> Flat vtable array in Metaspace
// - String literals -> Native Hash Table (StringTable)
// - HashSet<T> -> Literally wraps an internal HashMap<T, PRESENT>!
public final class OopInternalsDemo {
    public static void main(String[] args) {
        // String Pool Hash Table interns identical literals to same pointer:
        String a = "patternforge";
        String b = "patternforge";
        System.out.println(a == b); // true (same interned Heap reference)

        // HashSet delegates 100% of its logic to an encapsulated HashMap!
        Set<String> tags = new HashSet<>();
        tags.add("oop");
        tags.add("jvm");
        System.out.println(tags.contains("oop")); // O(1) HashMap.containsKey()
    }
}`,
    commonPitfall:
      'Mutating a Python object’s fields that participate in `__hash__` (or Java `hashCode()`) AFTER inserting it into a `set`/`dict`/`HashMap` makes the object permanently "lost" in the wrong hash bucket!',
    bestPractice:
      'Keep dictionary/map keys immutable (Java `record` / `String`, Python `@dataclass(frozen=True)` / `tuple`), and understand which internal DS backs every abstraction you use.',
  },
  {
    id: 'collections-ecosystem',
    number: '06',
    level: 'Advanced',
    title: 'Built-In Collections Framework Mastery (Python 3.13+ vs Java 21+)',
    shortTitle: 'Collections Ecosystem Map',
    summary:
      'Choose the exact right collection every time by mapping your workload (random access, FIFO queue, O(1) lookup, sorted range, or Top-K heap) directly to Python & Java internals.',
    simpleEnglish:
      'Using a `list` as a queue (`pop(0)`) shifts every remaining element one by one—making 100,000 pops take 5 billion steps! Picking the right collection (`deque` / `ArrayDeque`, `dict` / `HashMap`, `heapq` / `PriorityQueue`) turns O(n²) lag into instant O(1) or O(log n) speed.',
    standardDefinition:
      'The Python standard collections (`list`, `dict`, `set`, `collections.deque`, `heapq`) and Java Collections Framework (`ArrayList`, `ArrayDeque`, `HashMap`, `LinkedHashMap`, `TreeMap`, `PriorityQueue`, `ConcurrentHashMap`) map abstract data types (ADTs) to cache-conscious memory layouts with strict amortized complexity guarantees.',
    howOopUsesInternalDs:
      'Java organizes collections via OOP interfaces (`SequencedCollection` new in Java 21, `List`, `Queue`, `Deque`, `Set`, `Map`) separated from concrete data structures (`ArrayList`, `LinkedList`, `ArrayDeque`, `HashMap`, `TreeMap`). Python exposes Duck-Typed ABCs in `collections.abc` (`Sequence`, `Mapping`, `MutableSet`).',
    dfdNodes: [
      { id: 'need', label: 'Access Pattern', sublabel: 'Index / Key / Top-K', x: 86, y: 112 },
      { id: 'seq', label: 'Array / Ring', sublabel: 'list / ArrayDeque', x: 262, y: 48 },
      { id: 'hash', label: 'Hash Table', sublabel: 'dict / HashMap', x: 432, y: 112 },
      { id: 'tree', label: 'Heap / RB-Tree', sublabel: 'heapq / TreeMap', x: 584, y: 176 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'need', to: 'seq', label: 'O(1) Index / Ends' },
      { id: 'e2', from: 'need', to: 'hash', label: 'O(1) Key Lookup' },
      { id: 'e3', from: 'need', to: 'tree', label: 'O(log n) Ordered' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Contiguous Arrays & Ring Buffers (O(1) Random / Ends)',
        plainEnglish: 'Use `list`/`ArrayList` for fast index reads and tail appends; use `deque`/`ArrayDeque` for O(1) Queue & Stack operations.',
        technicalDetail: 'CPU L1/L2 hardware prefetchers love contiguous memory—ArrayDeque beats LinkedList by 3–5× in real benchmarks.',
        activeNodeIds: ['need', 'seq'],
        activeEdgeIds: ['e1'],
        packetLabel: 'O(1) Cache-Hot',
      },
      {
        step: 2,
        title: 'Hash Tables for O(1) Membership & Frequency Counting',
        plainEnglish: 'Reach for `dict`/`set` in Python or `HashMap`/`HashSet` in Java whenever you ask "Have I seen X?" or map ID -> Record.',
        technicalDetail: 'Python 3.13 dict preserves insertion order by default; Java uses LinkedHashMap for insertion/LRU order and ConcurrentHashMap for lock-striped concurrency.',
        activeNodeIds: ['need', 'hash'],
        activeEdgeIds: ['e2'],
        packetLabel: 'O(1) Avg',
      },
      {
        step: 3,
        title: 'Heaps & Balanced Trees for Priority & Range Queries',
        plainEnglish: 'Use `heapq`/`PriorityQueue` to always grab the smallest/largest item fast, and `TreeMap` (Red-Black Tree) when you need sorted keys or range slices.',
        technicalDetail: 'Binary Heaps give O(log n) push/pop with compact array storage; Red-Black Trees maintain O(log n) floorKey/ceilingKey/subMap.',
        activeNodeIds: ['need', 'tree'],
        activeEdgeIds: ['e3'],
        packetLabel: 'O(log n)',
      },
    ],
    pythonCode: `from collections import Counter, defaultdict, deque
import heapq

# 1. O(1) FIFO Queue / Stack via deque (block-linked array)
q: deque[str] = deque(["req-1", "req-2"])
q.append("req-3")
first = q.popleft()  # O(1) — never use list.pop(0)!

# 2. O(1) Grouping & Counting via defaultdict / Counter (Hash Tables)
by_tier: defaultdict[str, list[str]] = defaultdict(list)
by_tier["gold"].append("alice")
freq = Counter(["ok", "ok", "err"])  # {'ok': 2, 'err': 1}

# 3. O(log n) Top-K Priority Queue via heapq (Min-Heap array)
latencies = [42, 11, 89, 5]
heapq.heapify(latencies)
fastest = heapq.heappop(latencies)   # 5`,
    javaCode: `import java.util.*;

// Java 21+ Collections Framework — Pick by Access Pattern!
public final class CollectionsTour {
    public static void main(String[] args) {
        // 1. O(1) Queue & Stack via ArrayDeque (Circular Array, faster than LinkedList!)
        Deque<String> queue = new ArrayDeque<>();
        queue.offerLast("req-1");
        queue.offerLast("req-2");
        String first = queue.pollFirst(); // O(1)

        // 2. O(1) Lookup + Insertion Order via LinkedHashMap (Java 21 SequencedMap!)
        SequencedMap<String, Integer> counts = new LinkedHashMap<>();
        counts.merge("ok", 1, Integer::sum);

        // 3. O(log n) Priority Queue (Min-Heap) & Sorted TreeMap (Red-Black Tree)
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(List.of(42, 11, 89, 5));
        int fastest = minHeap.poll(); // 5
        NavigableMap<Integer, String> timeline = new TreeMap<>();
        timeline.put(100, "deploy");
    }
}`,
    commonPitfall:
      'Using `java.util.LinkedList` for a queue/stack or `java.util.Stack` (legacy synchronized Vector!), or calling `item in huge_list` inside a Python loop (O(n²) hidden quadratic scan).',
    bestPractice:
      'Default to `ArrayDeque` / `deque` for queues & stacks, `HashMap` / `dict` for lookups, `PriorityQueue` / `heapq` for Top-K, and `TreeMap` for sorted range queries.',
  },
];

export const CUSTOM_DS_BLUEPRINTS: CustomDsBlueprint[] = [
  {
    id: 'dynamic-array',
    shortTitle: 'Dynamic Array',
    title: 'Custom Dynamic Array (MyArrayList<T> / DynamicArray[T])',
    level: 'Zero / Basic',
    tagline: 'Contiguous backing buffer + geometric resizing (amortized O(1) append)',
    simpleEnglish:
      'A Dynamic Array starts with a small fixed row of boxes (say 4). When you run out of boxes, it rents a new row twice as big (8 boxes), copies your items over once, and hands back the old row. Because doubling happens rarely, appending averages out to O(1) time!',
    standardDefinition:
      'Resizable random-access sequence wrapping a fixed-capacity contiguous buffer. Enforces invariant `0 <= size <= capacity`. When `size == capacity`, allocates a new array of size `capacity * growthFactor` (2× canonical, 1.5× in Java ArrayList, ~1.125× in CPython list), copies elements in O(n), and achieves O(1) amortized append by the accounting/potential method.',
    oopArchitectureNotes:
      'Encapsulates `_data` / `elementData` as private so callers cannot corrupt `size` vs `capacity`. Exposes clean bounds-checked `get(i)`, `set(i, val)`, `append(val)`, and `removeAt(i)` methods, clearing stale tail references on delete to prevent memory leaks (loitering).',
    complexityRows: [
      { operation: 'get(i) / set(i)', average: 'O(1)', worst: 'O(1)', note: 'Direct base + i * ptr_size address math' },
      { operation: 'append / addLast', average: 'O(1) amort.', worst: 'O(n)', note: 'O(n) only on geometric resize powers of 2' },
      { operation: 'insertAt(i) / removeAt(i)', average: 'O(n)', worst: 'O(n)', note: 'Shifts elements [i..size-1] right or left' },
      { operation: 'Space Overhead', average: 'O(n)', worst: '≤ 2× n', note: 'Contiguous memory -> ultra CPU cache friendly' },
    ],
    dfdNodes: [
      { id: 'api', label: 'append(val)', sublabel: 'Public Method', x: 86, y: 112 },
      { id: 'guard', label: 'Capacity Check', sublabel: 'size == cap ?', x: 252, y: 58 },
      { id: 'resize', label: 'Resize 2× + Copy', sublabel: 'New Contiguous Buf', x: 422, y: 162 },
      { id: 'write', label: 'Write buf[size++]', sublabel: 'O(1) Slot Store', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'api', to: 'guard', label: 'Check Invariant' },
      { id: 'e2', from: 'guard', to: 'resize', label: 'Full -> Grow 2×' },
      { id: 'e3', from: 'guard', to: 'write', label: 'Has Space (Fast)' },
      { id: 'e4', from: 'resize', to: 'write', label: 'Swap Buffer' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Check size == capacity Invariant',
        plainEnglish: 'Before dropping the new item into the array, check whether all pre-allocated slots are full.',
        technicalDetail: 'Single integer comparison (`this.size == this.data.length`) keeps the fast path branch-predicted.',
        activeNodeIds: ['api', 'guard'],
        activeEdgeIds: ['e1'],
        packetLabel: 'size==cap?',
      },
      {
        step: 2,
        title: 'Geometric Resize (Only When Full)',
        plainEnglish: 'If full, allocate a brand-new 2× larger contiguous array and copy the existing items over in one fast sweep.',
        technicalDetail: 'Total copies for N appends = 1 + 2 + 4 + ... + N/2 < N -> strictly O(1) amortized cost per append.',
        activeNodeIds: ['guard', 'resize'],
        activeEdgeIds: ['e2'],
        packetLabel: 'ALLOC 2×',
      },
      {
        step: 3,
        title: 'Store Element & Increment size',
        plainEnglish: 'Write the new value directly into `buffer[size]` and bump `size` by 1.',
        technicalDetail: 'Direct array offset write completes in ~1 CPU cycle once buffer is in L1 cache.',
        activeNodeIds: ['resize', 'write'],
        activeEdgeIds: ['e3', 'e4'],
        packetLabel: 'buf[size++]=v',
      },
    ],
    pythonCode: `from typing import Generic, TypeVar

T = TypeVar("T")

class DynamicArray(Generic[T]):
    """Custom Dynamic Array built on a fixed-size backing buffer."""
    def __init__(self, initial_capacity: int = 4) -> None:
        self._capacity = max(1, initial_capacity)
        self._size = 0
        self._data: list[T | None] = [None] * self._capacity

    def __len__(self) -> int:
        return self._size

    def get(self, index: int) -> T:
        if not 0 <= index < self._size:
            raise IndexError(f"Index {index} out of bounds [0, {self._size})")
        return self._data[index]  # type: ignore[return-value]

    def append(self, value: T) -> None:
        if self._size == self._capacity:
            self._resize(self._capacity * 2)
        self._data[self._size] = value
        self._size += 1

    def remove_at(self, index: int) -> T:
        removed = self.get(index)
        for i in range(index, self._size - 1):
            self._data[i] = self._data[i + 1]
        self._size -= 1
        self._data[self._size] = None  # prevent object loitering!
        return removed

    def _resize(self, new_capacity: int) -> None:
        new_buf: list[T | None] = [None] * new_capacity
        for i in range(self._size):
            new_buf[i] = self._data[i]
        self._data = new_buf
        self._capacity = new_capacity`,
    javaCode: `import java.util.Arrays;

public final class MyArrayList<T> {
    private Object[] data;
    private int size;

    public MyArrayList(int initialCapacity) {
        this.data = new Object[Math.max(1, initialCapacity)];
        this.size = 0;
    }

    public int size() { return size; }

    @SuppressWarnings("unchecked")
    public T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index + ", Size: " + size);
        }
        return (T) data[index];
    }

    public void add(T value) {
        if (size == data.length) {
            resize(data.length * 2); // Java ArrayList uses oldCap + (oldCap >> 1) (1.5x)
        }
        data[size++] = value;
    }

    public T removeAt(int index) {
        T removed = get(index);
        int moved = size - index - 1;
        if (moved > 0) {
            System.arraycopy(data, index + 1, data, index, moved);
        }
        data[--size] = null; // allow GC to reclaim removed reference!
        return removed;
    }

    private void resize(int newCapacity) {
        data = Arrays.copyOf(data, newCapacity);
    }
}`,
    starterPython: `class DynamicArray:
    def __init__(self, capacity: int = 4):
        self._capacity = capacity
        self._size = 0
        self._data = [None] * self._capacity

    def append(self, value):
        # TODO: Resize to 2x capacity when full, store value, increment _size
        pass

    def _resize(self, new_capacity: int):
        # TODO: Allocate new buffer, copy items, swap self._data
        pass`,
    starterJava: `import java.util.Arrays;

public class MyArrayList<T> {
    private Object[] data = new Object[4];
    private int size = 0;

    public void add(T value) {
        // TODO: Resize when size == data.length, then write data[size++] = value
    }

    private void resize(int newCapacity) {
        // TODO: Copy into a larger array
    }
}`,
    pythonRules: [
      { id: 'py-da-class', label: 'Defines DynamicArray class', hint: 'Declare `class DynamicArray` with `_data` and `_size`.', test: (c) => /class\s+DynamicArray/.test(c) },
      { id: 'py-da-full', label: 'Checks capacity before append', hint: 'Compare `self._size == self._capacity` inside `append`.', test: (c) => /_size\s*==\s*self\._capacity/.test(c) },
      { id: 'py-da-resize', label: 'Doubles capacity in _resize', hint: 'Call `self._resize(self._capacity * 2)` and copy items.', test: (c) => /_resize\s*\(/.test(c) && /\*\s*2/.test(c) },
      { id: 'py-da-inc', label: 'Stores item & increments _size', hint: 'Assign `self._data[self._size] = value` and `self._size += 1`.', test: (c) => /_data\[self\._size\]\s*=/.test(c) && /_size\s*\+=\s*1/.test(c) },
    ],
    javaRules: [
      { id: 'jv-da-class', label: 'Defines generic MyArrayList<T>', hint: 'Use `class MyArrayList<T>` with private `Object[] data`.', test: (c) => /class\s+MyArrayList<T>/.test(c) },
      { id: 'jv-da-full', label: 'Checks size == data.length', hint: 'Guard growth with `if (size == data.length)`.', test: (c) => /size\s*==\s*data\.length/.test(c) },
      { id: 'jv-da-copy', label: 'Resizes via Arrays.copyOf or manual copy', hint: 'Allocate larger array (`* 2` or `>> 1`) in `resize`.', test: (c) => /Arrays\.copyOf|new\s+Object\[/.test(c) && /(\*\s*2|>>\s*1)/.test(c) },
      { id: 'jv-da-write', label: 'Stores value & increments size', hint: 'Write `data[size++] = value;`.', test: (c) => /data\[size\+\+\]\s*=|size\+\+/.test(c) },
    ],
  },
  {
    id: 'doubly-linked-list',
    shortTitle: 'Doubly Linked List',
    title: 'Custom Doubly Linked List with Sentinels (MyLinkedList<T>)',
    level: 'Zero / Basic',
    tagline: 'Sentinel head/tail nodes + O(1) pointer rewiring without null-check bugs',
    simpleEnglish:
      'Think of train cars connected with front and back hooks (`prev` and `next`). Adding or unhooking a car at the front or back takes just 4 quick hook swaps—you never shift the other cars! Adding permanent dummy engine (`HEAD`) and caboose (`TAIL`) sentinels eliminates 100% of null-pointer crashes.',
    standardDefinition:
      'Pointer-linked linear sequence where each heap-allocated `Node<T>` stores `value`, `prev`, and `next` references. Sentinel dummy boundary nodes enforce uniform invariants: every real node always has non-null `prev` and `next`, enabling O(1) `addFirst`, `addLast`, `removeFirst`, `removeLast`, and `unlink(node)` (critical for O(1) LRU Cache eviction).',
    oopArchitectureNotes:
      'Declares a private static inner class `Node<T>` (Java) / `__slots__ = ("value", "prev", "next")` class `_Node` (Python) so raw pointers are never leaked to external callers, preserving list integrity and exact `size` count.',
    complexityRows: [
      { operation: 'addFirst / addLast', average: 'O(1)', worst: 'O(1)', note: '4 pointer assignments between sentinel & neighbor' },
      { operation: 'removeFirst / unlink(node)', average: 'O(1)', worst: 'O(1)', note: 'Zero element shifting; powers LRU Cache!' },
      { operation: 'get(index) / search(val)', average: 'O(n)', worst: 'O(n)', note: 'Must walk pointers; cache-unfriendly pointer chasing' },
      { operation: 'Per-Node Memory', average: '+2 ptrs', worst: '+2 ptrs', note: 'Extra prev/next references per stored item' },
    ],
    dfdNodes: [
      { id: 'op', label: 'addLast / unlink', sublabel: 'Node Operation', x: 86, y: 112 },
      { id: 'node', label: 'Allocate Node', sublabel: '[prev|val|next]', x: 252, y: 58 },
      { id: 'rewire', label: 'Rewire 4 Pointers', sublabel: 'p.next=n; n.prev=p', x: 422, y: 162 },
      { id: 'sent', label: 'HEAD ⇄ ... ⇄ TAIL', sublabel: 'Invariants Intact', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'op', to: 'node', label: 'Create / Locate' },
      { id: 'e2', from: 'node', to: 'rewire', label: 'Attach Neighbors' },
      { id: 'e3', from: 'rewire', to: 'sent', label: 'Update size ± 1' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Create Node or Locate Existing Reference',
        plainEnglish: 'Wrap the payload inside a small Node box holding `prev` and `next` pointers.',
        technicalDetail: 'Using `__slots__` in Python or `private static final class Node<T>` in Java minimizes per-node heap overhead.',
        activeNodeIds: ['op', 'node'],
        activeEdgeIds: ['e1'],
        packetLabel: 'new Node(x)',
      },
      {
        step: 2,
        title: 'Rewire Neighbor prev/next Links Safely',
        plainEnglish: 'Connect the new node to its left and right neighbors first, then update both neighbors to point at it.',
        technicalDetail: 'Sentinel `head` and `tail` guarantee `prev != null && next != null` even when the list is empty!',
        activeNodeIds: ['node', 'rewire'],
        activeEdgeIds: ['e2'],
        packetLabel: '4 ptr swaps',
      },
      {
        step: 3,
        title: 'Update Size & Preserve Bidirectional Chain',
        plainEnglish: 'Every forward `.next` pointer now matches its backward `.prev` pointer cleanly from HEAD to TAIL.',
        technicalDetail: 'On unlink, clearing `node.prev = node.next = null` helps generational garbage collectors reclaim dead nodes immediately.',
        activeNodeIds: ['rewire', 'sent'],
        activeEdgeIds: ['e3'],
        packetLabel: 'O(1) Done',
      },
    ],
    pythonCode: `from typing import Generic, TypeVar

T = TypeVar("T")

class _Node(Generic[T]):
    __slots__ = ("value", "prev", "next")
    def __init__(self, value: T | None = None) -> None:
        self.value: T | None = value
        self.prev: _Node[T] | None = None
        self.next: _Node[T] | None = None

class DoublyLinkedList(Generic[T]):
    """Sentinel-bounded Doubly Linked List with O(1) ends & unlink."""
    def __init__(self) -> None:
        self._head: _Node[T] = _Node()
        self._tail: _Node[T] = _Node()
        self._head.next = self._tail
        self._tail.prev = self._head
        self._size = 0

    def add_last(self, value: T) -> _Node[T]:
        node = _Node(value)
        prev = self._tail.prev
        assert prev is not None
        prev.next = node
        node.prev = prev
        node.next = self._tail
        self._tail.prev = node
        self._size += 1
        return node

    def unlink(self, node: _Node[T]) -> T:
        prev, nxt = node.prev, node.next
        assert prev is not None and nxt is not None
        prev.next = nxt
        nxt.prev = prev
        node.prev = node.next = None
        self._size -= 1
        return node.value  # type: ignore[return-value]`,
    javaCode: `import java.util.NoSuchElementException;

public final class MyLinkedList<T> {
    private static final class Node<T> {
        T value;
        Node<T> prev;
        Node<T> next;
        Node(T value) { this.value = value; }
    }

    private final Node<T> head = new Node<>(null); // sentinel
    private final Node<T> tail = new Node<>(null); // sentinel
    private int size = 0;

    public MyLinkedList() {
        head.next = tail;
        tail.prev = head;
    }

    public void addLast(T value) {
        Node<T> node = new Node<>(value);
        Node<T> prev = tail.prev;
        prev.next = node;
        node.prev = prev;
        node.next = tail;
        tail.prev = node;
        size++;
    }

    public T removeFirst() {
        if (size == 0) throw new NoSuchElementException("Empty list");
        return unlink(head.next);
    }

    private T unlink(Node<T> node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        node.prev = null;
        node.next = null;
        size--;
        return node.value;
    }
}`,
    starterPython: `class _Node:
    __slots__ = ("value", "prev", "next")
    def __init__(self, value=None):
        self.value = value
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self._head = _Node()
        self._tail = _Node()
        self._head.next = self._tail
        self._tail.prev = self._head
        self._size = 0

    def add_last(self, value):
        # TODO: Insert new _Node right before self._tail and update prev/next
        pass

    def unlink(self, node):
        # TODO: Rewire node.prev.next and node.next.prev in O(1)
        pass`,
    starterJava: `public class MyLinkedList<T> {
    private static final class Node<T> {
        T value; Node<T> prev; Node<T> next;
        Node(T v) { this.value = v; }
    }
    private final Node<T> head = new Node<>(null);
    private final Node<T> tail = new Node<>(null);
    private int size = 0;

    public MyLinkedList() { head.next = tail; tail.prev = head; }

    public void addLast(T value) {
        // TODO: Wire new Node between tail.prev and tail
    }
}`,
    pythonRules: [
      { id: 'py-ll-node', label: 'Defines Node with prev & next', hint: 'Use `_Node` holding `value`, `prev`, `next`.', test: (c) => /self\.prev/.test(c) && /self\.next/.test(c) },
      { id: 'py-ll-sent', label: 'Uses sentinel _head & _tail', hint: 'Link `self._head.next = self._tail` in `__init__`.', test: (c) => /_head\.next\s*=\s*self\._tail/.test(c) },
      { id: 'py-ll-add', label: 'Wires 4 links in add_last', hint: 'Update `prev.next = node`, `node.prev = prev`, `node.next = self._tail`, `self._tail.prev = node`.', test: (c) => /node\.next\s*=\s*self\._tail/.test(c) && /_tail\.prev\s*=\s*node/.test(c) },
      { id: 'py-ll-unlink', label: 'Implements O(1) unlink', hint: 'Connect `prev.next = nxt` and `nxt.prev = prev` and decrement `_size`.', test: (c) => /prev\.next\s*=/.test(c) && /_size\s*-=\s*1/.test(c) },
    ],
    javaRules: [
      { id: 'jv-ll-node', label: 'Encapsulates private static Node<T>', hint: 'Use `private static final class Node<T>` with prev/next.', test: (c) => /static.*class\s+Node<T>/.test(c) },
      { id: 'jv-ll-sent', label: 'Connects sentinel head <-> tail', hint: 'Initialize `head.next = tail; tail.prev = head;`.', test: (c) => /head\.next\s*=\s*tail/.test(c) && /tail\.prev\s*=\s*head/.test(c) },
      { id: 'jv-ll-add', label: 'Rewires tail.prev & node pointers in addLast', hint: 'Link `prev.next = node`, `node.prev = prev`, `node.next = tail`, `tail.prev = node`.', test: (c) => /node\.next\s*=\s*tail/.test(c) && /tail\.prev\s*=\s*node/.test(c) },
      { id: 'jv-ll-size', label: 'Tracks size accurately', hint: 'Increment `size++` on insert.', test: (c) => /size\+\+/.test(c) },
    ],
  },
  {
    id: 'custom-hashmap',
    shortTitle: 'Custom HashMap',
    title: 'Custom HashMap with Chaining & Rehashing (MyHashMap<K, V>)',
    level: 'Intermediate',
    tagline: 'Hash mixing + bitmask bucket indexing + separate chaining + 0.75 rehash',
    simpleEnglish:
      'A HashMap turns any key (like `"user_42"`) into an exact shelf number using a fast math formula (`hash & (cap - 1)`). If two keys land on the same shelf (a collision), they form a mini chain on that shelf. Once the shelves get 75% full, the map doubles in size and re-shelves every key so lookups stay O(1)!',
    standardDefinition:
      'Associative array implementing O(1) amortized `put`, `get`, and `remove` via power-of-two bucket table, bit-spread hashing (`h ^ (h >>> 16)`), separate chaining linked entries, and automatic 2× table rehashing when `size / capacity > 0.75`.',
    oopArchitectureNotes:
      'Relies on the OOP `equals`/`hashCode` contract (`__eq__`/`__hash__` in Python): equal keys MUST produce equal hashes! Encapsulates `Entry<K, V>` nodes inside a private `Entry[] buckets` array.',
    complexityRows: [
      { operation: 'put(k, v) / get(k)', average: 'O(1)', worst: 'O(n) / O(log n)*', note: '*Java 8+ treeifies chains >= 8 into Red-Black Tree' },
      { operation: 'remove(k)', average: 'O(1)', worst: 'O(n)', note: 'Unlinks matching Entry node inside bucket' },
      { operation: 'rehash(2× cap)', average: 'O(1) amort.', worst: 'O(n)', note: 'Triggered when loadFactor > 0.75' },
      { operation: 'Iteration Order', average: 'Unordered', worst: 'Bucket order', note: 'Add doubly-linked thread for LinkedHashMap order' },
    ],
    dfdNodes: [
      { id: 'key', label: 'put(key, val)', sublabel: 'Compute hash(k)', x: 86, y: 112 },
      { id: 'idx', label: 'Bitmask Index', sublabel: 'h & (cap - 1)', x: 252, y: 58 },
      { id: 'chain', label: 'Bucket Chain', sublabel: 'Scan / Upsert Node', x: 422, y: 162 },
      { id: 'rehash', label: 'Load > 0.75?', sublabel: 'Rehash 2× Table', x: 582, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'key', to: 'idx', label: 'Mix High Bits' },
      { id: 'e2', from: 'idx', to: 'chain', label: 'Jump to buckets[i]' },
      { id: 'e3', from: 'chain', to: 'rehash', label: 'Check Load Factor' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Mix Hash Bits & Compute Bucket Index',
        plainEnglish: 'Convert the key into a scrambled number and mask it into a valid bucket slot `[0 .. cap-1]` in 1 CPU cycle.',
        technicalDetail: 'Java mixes `(h = key.hashCode()) ^ (h >>> 16)` so high entropy bits participate in power-of-two `h & (cap - 1)` masking.',
        activeNodeIds: ['key', 'idx'],
        activeEdgeIds: ['e1'],
        packetLabel: 'idx = h & 7',
      },
      {
        step: 2,
        title: 'Walk Bucket Chain for Key Match or Prepend',
        plainEnglish: 'Check the tiny chain at `buckets[idx]`. If the key exists, overwrite its value; otherwise attach a new Entry node.',
        technicalDetail: 'Comparing cached `entry.hash == hash` before `Objects.equals(entry.key, key)` skips expensive string comparisons on collisions.',
        activeNodeIds: ['idx', 'chain'],
        activeEdgeIds: ['e2'],
        packetLabel: 'UPSERT node',
      },
      {
        step: 3,
        title: 'Check 0.75 Load Factor & Rehash if Crowded',
        plainEnglish: 'If more than 75% of buckets are occupied, double the array and re-place every node so chains stay ~1 item long.',
        technicalDetail: 'Power-of-two growth means every entry either stays at `idx` or moves to `idx + oldCap`—zero full modulo math needed!',
        activeNodeIds: ['chain', 'rehash'],
        activeEdgeIds: ['e3'],
        packetLabel: 'LOAD <= 0.75',
      },
    ],
    pythonCode: `from typing import Generic, TypeVar

K = TypeVar("K")
V = TypeVar("V")

class _Entry(Generic[K, V]):
    __slots__ = ("key", "value", "next")
    def __init__(self, key: K, value: V, nxt: "_Entry[K, V] | None" = None) -> None:
        self.key = key
        self.value = value
        self.next = nxt

class CustomHashMap(Generic[K, V]):
    """Separate-chaining HashMap with power-of-two bitmasking & 0.75 rehash."""
    def __init__(self, capacity: int = 8) -> None:
        self._capacity = capacity
        self._size = 0
        self._buckets: list[_Entry[K, V] | None] = [None] * self._capacity

    def _index(self, key: K) -> int:
        return hash(key) & (self._capacity - 1)

    def put(self, key: K, value: V) -> None:
        idx = self._index(key)
        curr = self._buckets[idx]
        while curr is not None:
            if curr.key == key:
                curr.value = value
                return
            curr = curr.next
        self._buckets[idx] = _Entry(key, value, self._buckets[idx])
        self._size += 1
        if self._size / self._capacity > 0.75:
            self._rehash(self._capacity * 2)

    def get(self, key: K) -> V | None:
        curr = self._buckets[self._index(key)]
        while curr is not None:
            if curr.key == key:
                return curr.value
            curr = curr.next
        return None

    def _rehash(self, new_cap: int) -> None:
        old_buckets = self._buckets
        self._capacity = new_cap
        self._buckets = [None] * new_cap
        self._size = 0
        for head in old_buckets:
            while head is not None:
                self.put(head.key, head.value)
                head = head.next`,
    javaCode: `import java.util.Objects;

public final class MyHashMap<K, V> {
    private static final class Entry<K, V> {
        final int hash;
        final K key;
        V value;
        Entry<K, V> next;
        Entry(int hash, K key, V value, Entry<K, V> next) {
            this.hash = hash; this.key = key; this.value = value; this.next = next;
        }
    }

    private Entry<K, V>[] buckets;
    private int size;

    @SuppressWarnings("unchecked")
    public MyHashMap(int capacity) {
        this.buckets = (Entry<K, V>[]) new Entry[Math.max(8, capacity)];
    }

    private static int spreadHash(Object key) {
        int h = (key == null) ? 0 : key.hashCode();
        return h ^ (h >>> 16);
    }

    public void put(K key, V value) {
        int h = spreadHash(key);
        int idx = h & (buckets.length - 1);
        for (Entry<K, V> e = buckets[idx]; e != null; e = e.next) {
            if (e.hash == h && Objects.equals(e.key, key)) {
                e.value = value;
                return;
            }
        }
        buckets[idx] = new Entry<>(h, key, value, buckets[idx]);
        if (++size > buckets.length * 0.75) {
            rehash(buckets.length * 2);
        }
    }

    public V get(K key) {
        int h = spreadHash(key);
        for (Entry<K, V> e = buckets[h & (buckets.length - 1)]; e != null; e = e.next) {
            if (e.hash == h && Objects.equals(e.key, key)) return e.value;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void rehash(int newCap) {
        Entry<K, V>[] old = buckets;
        buckets = (Entry<K, V>[]) new Entry[newCap];
        size = 0;
        for (Entry<K, V> head : old) {
            for (Entry<K, V> e = head; e != null; e = e.next) {
                put(e.key, e.value);
            }
        }
    }
}`,
    starterPython: `class _Entry:
    __slots__ = ("key", "value", "next")
    def __init__(self, key, value, nxt=None):
        self.key, self.value, self.next = key, value, nxt

class CustomHashMap:
    def __init__(self, capacity: int = 8):
        self._capacity = capacity
        self._size = 0
        self._buckets = [None] * capacity

    def _index(self, key) -> int:
        # TODO: Map hash(key) into [0, self._capacity - 1]
        pass

    def put(self, key, value):
        # TODO: Update existing node or insert new _Entry, then rehash if load > 0.75
        pass`,
    starterJava: `import java.util.Objects;

public class MyHashMap<K, V> {
    private static final class Entry<K, V> {
        final K key; V value; Entry<K, V> next;
        Entry(K k, V v, Entry<K, V> n) { key = k; value = v; next = n; }
    }
    @SuppressWarnings("unchecked")
    private Entry<K, V>[] buckets = (Entry<K, V>[]) new Entry[8];
    private int size = 0;

    public void put(K key, V value) {
        // TODO: Compute bucket index, scan chain, prepend Entry, rehash if > 0.75
    }
}`,
    pythonRules: [
      { id: 'py-hm-idx', label: 'Computes bucket index from hash(key)', hint: 'Use `hash(key) & (self._capacity - 1)` or `% self._capacity`.', test: (c) => /hash\s*\(\s*key\s*\)\s*(&|%)/.test(c) },
      { id: 'py-hm-walk', label: 'Walks collision chain in put()', hint: 'Loop `while curr` checking `curr.key == key`.', test: (c) => /while\s+\w+/.test(c) && /\.key\s*==\s*key/.test(c) },
      { id: 'py-hm-insert', label: 'Prepends new _Entry node', hint: 'Assign `self._buckets[idx] = _Entry(key, value, self._buckets[idx])`.', test: (c) => /_Entry\s*\(/.test(c) && /_buckets\[/.test(c) },
      { id: 'py-hm-rehash', label: 'Triggers rehash above 0.75 load', hint: 'Check `0.75` load factor and grow capacity.', test: (c) => /0\.75/.test(c) && /rehash/i.test(c) },
    ],
    javaRules: [
      { id: 'jv-hm-hash', label: 'Computes key hash & bucket index', hint: 'Use `hashCode()` with `& (buckets.length - 1)` or `%`.', test: (c) => /hashCode\s*\(\)/.test(c) && /buckets\.length/.test(c) },
      { id: 'jv-hm-walk', label: 'Checks existing keys with Objects.equals', hint: 'Walk `e = e.next` and compare `Objects.equals(e.key, key)`.', test: (c) => /Objects\.equals/.test(c) && /\.next/.test(c) },
      { id: 'jv-hm-insert', label: 'Creates new Entry in bucket', hint: 'Assign `buckets[idx] = new Entry<>(...)`.', test: (c) => /new\s+Entry/.test(c) && /buckets\[/.test(c) },
      { id: 'jv-hm-rehash', label: 'Rehashes when load > 0.75', hint: 'Check `0.75` and call `rehash(...)`.', test: (c) => /0\.75/.test(c) && /rehash/i.test(c) },
    ],
  },
  {
    id: 'circular-queue',
    shortTitle: 'Circular Queue / Deque',
    title: 'Custom Circular Array Queue & Stack (MyCircularQueue<T>)',
    level: 'Intermediate',
    tagline: 'Ring buffer with head/tail modulo wrap-around — true O(1) FIFO with zero shifting',
    simpleEnglish:
      'Imagine a circular conveyor belt with 8 trays. Instead of sliding all remaining items forward when you take from the front (`HEAD`), you simply move the `HEAD` pointer one tray clockwise (`(head + 1) % cap`). When `TAIL` hits tray 7, it smoothly wraps back around to tray 0!',
    standardDefinition:
      'Ring-buffer queue maintaining contiguous array storage with modular front (`head`) and rear (`tail`) indices. Achieves strict O(1) amortized `enqueue`, `dequeue`, and `peek` with superior spatial locality compared to pointer-linked queues; unwraps linearly during geometric 2× resize.',
    oopArchitectureNotes:
      'Separates the FIFO `Queue` interface from the underlying ring-buffer indexing math. Explicitly nulls out dequeued slots so completed task objects are eligible for immediate Garbage Collection.',
    complexityRows: [
      { operation: 'enqueue / offer', average: 'O(1) amort.', worst: 'O(n) resize', note: 'Writes at tail, wraps via (tail + 1) % cap' },
      { operation: 'dequeue / poll', average: 'O(1)', worst: 'O(1)', note: 'Reads at head, nulls slot, advances head' },
      { operation: 'peek', average: 'O(1)', worst: 'O(1)', note: 'Direct buffer[head] lookup' },
      { operation: 'CPU Cache Locality', average: 'Excellent', worst: 'Contiguous', note: 'Matches Java ArrayDeque & OS ring buffers' },
    ],
    dfdNodes: [
      { id: 'req', label: 'enqueue / dequeue', sublabel: 'FIFO Request', x: 86, y: 112 },
      { id: 'ring', label: 'Ring Buffer[0..N-1]', sublabel: 'Contiguous Array', x: 256, y: 58 },
      { id: 'mod', label: 'Modulo Wrap', sublabel: '(idx + 1) % cap', x: 426, y: 162 },
      { id: 'out', label: 'Zero-Shift Result', sublabel: 'O(1) FIFO', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'req', to: 'ring', label: 'Check size / Grow' },
      { id: 'e2', from: 'ring', to: 'mod', label: 'Advance head/tail' },
      { id: 'e3', from: 'mod', to: 'out', label: 'Return / Null Slot' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Write at tail or Read at head',
        plainEnglish: 'Enqueue places the item directly at `tail`; dequeue reads directly from `head` without touching any other slots.',
        technicalDetail: 'If `size == capacity`, allocate 2× buffer and copy `(head + i) % cap` into linear `[0..size-1]` order.',
        activeNodeIds: ['req', 'ring'],
        activeEdgeIds: ['e1'],
        packetLabel: 'buf[tail]=x',
      },
      {
        step: 2,
        title: 'Wrap Pointer Clockwise via Modulo',
        plainEnglish: 'When a pointer moves past the last slot, `(idx + 1) % capacity` wraps it neatly back to index 0.',
        technicalDetail: 'Power-of-two capacity allows replacing `% cap` with a 1-cycle bitwise AND `& (cap - 1)`.',
        activeNodeIds: ['ring', 'mod'],
        activeEdgeIds: ['e2'],
        packetLabel: '(tail+1)%8',
      },
      {
        step: 3,
        title: 'Clear Dequeued Slot & Return in O(1)',
        plainEnglish: 'Setting the popped slot to `None`/`null` prevents memory leaks while keeping FIFO throughput blazing fast.',
        technicalDetail: 'This exact ring-buffer architecture powers Java `ArrayDeque`, LMAX Disruptor, and Linux kernel `kfifo`.',
        activeNodeIds: ['mod', 'out'],
        activeEdgeIds: ['e3'],
        packetLabel: 'O(1) FIFO',
      },
    ],
    pythonCode: `from typing import Generic, TypeVar

T = TypeVar("T")

class CircularQueue(Generic[T]):
    """O(1) amortized FIFO Ring Buffer Queue with auto-grow."""
    def __init__(self, capacity: int = 8) -> None:
        self._cap = max(2, capacity)
        self._buf: list[T | None] = [None] * self._cap
        self._head = 0
        self._size = 0

    def enqueue(self, value: T) -> None:
        if self._size == self._cap:
            self._grow(self._cap * 2)
        tail = (self._head + self._size) % self._cap
        self._buf[tail] = value
        self._size += 1

    def dequeue(self) -> T:
        if self._size == 0:
            raise IndexError("dequeue from empty queue")
        item = self._buf[self._head]
        self._buf[self._head] = None  # release reference
        self._head = (self._head + 1) % self._cap
        self._size -= 1
        return item  # type: ignore[return-value]

    def _grow(self, new_cap: int) -> None:
        new_buf: list[T | None] = [None] * new_cap
        for i in range(self._size):
            new_buf[i] = self._buf[(self._head + i) % self._cap]
        self._buf, self._cap, self._head = new_buf, new_cap, 0`,
    javaCode: `import java.util.NoSuchElementException;

public final class MyCircularQueue<T> {
    private Object[] buf;
    private int head = 0;
    private int size = 0;

    public MyCircularQueue(int capacity) {
        this.buf = new Object[Math.max(2, capacity)];
    }

    public void enqueue(T value) {
        if (size == buf.length) grow(buf.length * 2);
        int tail = (head + size) % buf.length;
        buf[tail] = value;
        size++;
    }

    @SuppressWarnings("unchecked")
    public T dequeue() {
        if (size == 0) throw new NoSuchElementException("Empty queue");
        T item = (T) buf[head];
        buf[head] = null; // avoid GC loitering
        head = (head + 1) % buf.length;
        size--;
        return item;
    }

    private void grow(int newCap) {
        Object[] next = new Object[newCap];
        for (int i = 0; i < size; i++) {
            next[i] = buf[(head + i) % buf.length];
        }
        buf = next;
        head = 0;
    }
}`,
    starterPython: `class CircularQueue:
    def __init__(self, capacity: int = 8):
        self._cap = capacity
        self._buf = [None] * capacity
        self._head = 0
        self._size = 0

    def enqueue(self, value):
        # TODO: Compute tail = (self._head + self._size) % self._cap and store value
        pass

    def dequeue(self):
        # TODO: Pop from self._head, clear slot, wrap self._head modulo self._cap
        pass`,
    starterJava: `public class MyCircularQueue<T> {
    private Object[] buf = new Object[8];
    private int head = 0;
    private int size = 0;

    public void enqueue(T value) {
        // TODO: Place at (head + size) % buf.length and increment size
    }

    public T dequeue() {
        // TODO: Return buf[head], null slot, advance head = (head + 1) % buf.length
        return null;
    }
}`,
    pythonRules: [
      { id: 'py-cq-tail', label: 'Computes circular tail with modulo', hint: 'Compute `(self._head + self._size) % self._cap`.', test: (c) => /%\s*self\._cap/.test(c) },
      { id: 'py-cq-enq', label: 'Stores value & increments _size', hint: 'Write `self._buf[tail] = value` and `self._size += 1`.', test: (c) => /_buf\[/.test(c) && /_size\s*\+=\s*1/.test(c) },
      { id: 'py-cq-deq', label: 'Clears popped slot & advances _head', hint: 'Set `self._buf[self._head] = None` and wrap `self._head`.', test: (c) => /=\s*None/.test(c) && /_head\s*=/.test(c) },
    ],
    javaRules: [
      { id: 'jv-cq-tail', label: 'Wraps tail index via modulo', hint: 'Compute `(head + size) % buf.length`.', test: (c) => /%\s*buf\.length/.test(c) },
      { id: 'jv-cq-null', label: 'Clears dequeued slot to null', hint: 'Set `buf[head] = null;` before advancing `head`.', test: (c) => /buf\[head\]\s*=\s*null/.test(c) },
      { id: 'jv-cq-head', label: 'Advances head circularly & decrements size', hint: 'Update `head = (head + 1) % buf.length;` and `size--;`.', test: (c) => /head\s*=\s*\(head\s*\+\s*1\)/.test(c) && /size--/.test(c) },
    ],
  },
  {
    id: 'binary-min-heap',
    shortTitle: 'Binary Min-Heap',
    title: 'Custom Binary Min-Heap / Priority Queue (MyMinHeap<T>)',
    level: 'Advanced',
    tagline: 'Implicit complete tree packed in an array + O(log n) siftUp / siftDown',
    simpleEnglish:
      'A Min-Heap is a sports tournament bracket where the smallest number ALWAYS sits at the trophy spot (`index 0`). It looks like a tree, yet it is stored in a plain array with ZERO pointers: node `i`’s children always live at `2*i + 1` and `2*i + 2`!',
    standardDefinition:
      'Complete binary tree obeying the heap-order property (`parent <= children`) embedded implicitly inside a dynamic array. Supports O(1) `peek`, O(log n) `push` (`siftUp`), O(log n) `pop` (`siftDown`), and O(n) bottom-up Floyd `heapify`.',
    oopArchitectureNotes:
      'Accepts a `Comparator<T>` / `Comparable<T>` (Java) or key function (Python) via constructor dependency injection so the same heap serves Min-Heap, Max-Heap, Task Scheduler, or Dijkstra’s Shortest Path!',
    complexityRows: [
      { operation: 'peek() (min item)', average: 'O(1)', worst: 'O(1)', note: 'Always sits at index 0' },
      { operation: 'push(x) (siftUp)', average: 'O(log n)', worst: 'O(log n)', note: 'Bubbles up at most tree height log2(n)' },
      { operation: 'pop() (siftDown)', average: 'O(log n)', worst: 'O(log n)', note: 'Swaps root with last, sifts down to restore invariant' },
      { operation: 'Index Formulas', average: '0 pointers', worst: 'Array only', note: 'parent=(i-1)/2, left=2i+1, right=2i+2' },
    ],
    dfdNodes: [
      { id: 'op', label: 'push / pop', sublabel: 'Priority Op', x: 86, y: 112 },
      { id: 'arr', label: 'Implicit Array', sublabel: 'p=(i-1)/2, c=2i+1', x: 256, y: 58 },
      { id: 'sift', label: 'Sift Up / Down', sublabel: 'Swap Violation', x: 426, y: 162 },
      { id: 'root', label: 'Min @ Index [0]', sublabel: 'O(1) Peek Ready', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'op', to: 'arr', label: 'Append / Swap Last' },
      { id: 'e2', from: 'arr', to: 'sift', label: 'Restore Heap Order' },
      { id: 'e3', from: 'sift', to: 'root', label: 'Smallest on Top' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Place Item at End (push) or Move Last to Root (pop)',
        plainEnglish: 'Keep the tree shape perfectly packed with no gaps by always adding or removing at the very last array slot.',
        technicalDetail: 'Maintaining a complete binary tree guarantees height h = floor(log2(n)) strictly.',
        activeNodeIds: ['op', 'arr'],
        activeEdgeIds: ['e1'],
        packetLabel: 'heap.append(x)',
      },
      {
        step: 2,
        title: 'Sift Up or Sift Down Along Parent-Child Path',
        plainEnglish: 'Compare with parent `(i-1)//2` (on push) or smaller child `2i+1 / 2i+2` (on pop) and swap until ordered.',
        technicalDetail: 'Performs at most log2(n) comparisons—1,000,000 items require at most 20 swaps!',
        activeNodeIds: ['arr', 'sift'],
        activeEdgeIds: ['e2'],
        packetLabel: 'siftUp / Down',
      },
      {
        step: 3,
        title: 'Minimum Element Guaranteed at Index 0',
        plainEnglish: 'The smallest priority item now sits at `heap[0]`, ready for instant O(1) peeking.',
        technicalDetail: 'Powers OS thread schedulers, Kafka timer wheels, Top-K streams, and Dijkstra’s algorithm.',
        activeNodeIds: ['sift', 'root'],
        activeEdgeIds: ['e3'],
        packetLabel: 'heap[0] = MIN',
      },
    ],
    pythonCode: `class MinHeap:
    """Custom Binary Min-Heap packed inside a contiguous Python list."""
    def __init__(self) -> None:
        self._heap: list[int] = []

    def peek(self) -> int:
        if not self._heap:
            raise IndexError("empty heap")
        return self._heap[0]

    def push(self, val: int) -> None:
        self._heap.append(val)
        self._sift_up(len(self._heap) - 1)

    def pop(self) -> int:
        if not self._heap:
            raise IndexError("empty heap")
        self._heap[0], self._heap[-1] = self._heap[-1], self._heap[0]
        smallest = self._heap.pop()
        if self._heap:
            self._sift_down(0)
        return smallest

    def _sift_up(self, idx: int) -> None:
        while idx > 0:
            parent = (idx - 1) // 2
            if self._heap[idx] < self._heap[parent]:
                self._heap[idx], self._heap[parent] = self._heap[parent], self._heap[idx]
                idx = parent
            else:
                break

    def _sift_down(self, idx: int) -> None:
        n = len(self._heap)
        while True:
            left, right, smallest = 2 * idx + 1, 2 * idx + 2, idx
            if left < n and self._heap[left] < self._heap[smallest]:
                smallest = left
            if right < n and self._heap[right] < self._heap[smallest]:
                smallest = right
            if smallest == idx:
                break
            self._heap[idx], self._heap[smallest] = self._heap[smallest], self._heap[idx]
            idx = smallest`,
    javaCode: `import java.util.*;

public final class MyMinHeap<T extends Comparable<T>> {
    private final List<T> heap = new ArrayList<>();

    public T peek() {
        if (heap.isEmpty()) throw new NoSuchElementException("Empty heap");
        return heap.get(0);
    }

    public void push(T val) {
        heap.add(val);
        siftUp(heap.size() - 1);
    }

    public T pop() {
        if (heap.isEmpty()) throw new NoSuchElementException("Empty heap");
        swap(0, heap.size() - 1);
        T smallest = heap.remove(heap.size() - 1);
        if (!heap.isEmpty()) siftDown(0);
        return smallest;
    }

    private void siftUp(int i) {
        while (i > 0) {
            int parent = (i - 1) / 2;
            if (heap.get(i).compareTo(heap.get(parent)) < 0) {
                swap(i, parent);
                i = parent;
            } else break;
        }
    }

    private void siftDown(int i) {
        int n = heap.size();
        while (true) {
            int left = 2 * i + 1, right = 2 * i + 2, smallest = i;
            if (left < n && heap.get(left).compareTo(heap.get(smallest)) < 0) smallest = left;
            if (right < n && heap.get(right).compareTo(heap.get(smallest)) < 0) smallest = right;
            if (smallest == i) break;
            swap(i, smallest);
            i = smallest;
        }
    }

    private void swap(int a, int b) {
        T tmp = heap.get(a);
        heap.set(a, heap.get(b));
        heap.set(b, tmp);
    }
}`,
    starterPython: `class MinHeap:
    def __init__(self):
        self._heap = []

    def push(self, val: int):
        # TODO: Append val and bubble it up via parent = (idx - 1) // 2
        pass

    def _sift_up(self, idx: int):
        # TODO: Swap while idx > 0 and child < parent
        pass`,
    starterJava: `import java.util.*;

public class MyMinHeap<T extends Comparable<T>> {
    private final List<T> heap = new ArrayList<>();

    public void push(T val) {
        // TODO: Add to end and siftUp(heap.size() - 1)
    }

    private void siftUp(int i) {
        // TODO: Compare with parent = (i - 1) / 2 and swap if smaller
    }
}`,
    pythonRules: [
      { id: 'py-hp-push', label: 'Appends & calls _sift_up', hint: 'Call `self._heap.append(val)` then `self._sift_up(...)`.', test: (c) => /append\s*\(/.test(c) && /_sift_up\s*\(/.test(c) },
      { id: 'py-hp-parent', label: 'Computes parent = (idx - 1) // 2', hint: 'Use `(idx - 1) // 2` for 0-indexed parent.', test: (c) => /\(\s*\w+\s*-\s*1\s*\)\s*\/\/\s*2/.test(c) },
      { id: 'py-hp-swap', label: 'Swaps child & parent on violation', hint: 'Swap when `self._heap[idx] < self._heap[parent]`.', test: (c) => /<\s*self\._heap\[parent\]/.test(c) },
    ],
    javaRules: [
      { id: 'jv-hp-push', label: 'Adds to tail & calls siftUp', hint: 'Call `heap.add(val); siftUp(heap.size() - 1);`.', test: (c) => /heap\.add\s*\(/.test(c) && /siftUp\s*\(/.test(c) },
      { id: 'jv-hp-parent', label: 'Computes parent = (i - 1) / 2', hint: 'Use `(i - 1) / 2` inside `siftUp`.', test: (c) => /\(\s*\w+\s*-\s*1\s*\)\s*\/\s*2/.test(c) },
      { id: 'jv-hp-cmp', label: 'Compares with compareTo() < 0', hint: 'Use `.compareTo(...) < 0` to keep heap generic.', test: (c) => /compareTo\s*\(/.test(c) },
    ],
  },
  {
    id: 'binary-search-tree',
    shortTitle: 'Binary Search Tree',
    title: 'Custom Binary Search Tree (MyBST<K, V> / BinarySearchTree)',
    level: 'Advanced',
    tagline: 'Ordered left < node < right invariant + O(log n) search + sorted Inorder traversal',
    simpleEnglish:
      'At every fork in a Binary Search Tree, smaller keys go LEFT and larger keys go RIGHT. That simple rule cuts the remaining search space in half at every hop—just like opening a dictionary in the middle! Walking Left → Node → Right prints every key in perfect sorted order.',
    standardDefinition:
      'Linked hierarchical dictionary maintaining the global BST ordering invariant (`all keys in left subtree < node.key < all keys in right subtree`). Supports O(h) `search`, `insert`, `min/max`, `rangeQuery`, and 3-case `delete` (leaf, single child, or inorder-successor swap). Production stores (`TreeMap`, B+ Trees) add rotations to guarantee `h = O(log n)`.',
    oopArchitectureNotes:
      'Combines recursive OOP methods with immutable key ordering (`Comparable<K>`) and private `TreeNode` encapsulation, exposing clean `insert`, `contains`, and `inorder()` APIs.',
    complexityRows: [
      { operation: 'search / insert', average: 'O(log n)', worst: 'O(n)*', note: '*Degenerates on sorted input unless self-balancing (AVL/RB-Tree)' },
      { operation: 'delete (3 cases)', average: 'O(log n)', worst: 'O(n)', note: 'Replaces 2-child node with inorder successor' },
      { operation: 'inorder() traversal', average: 'O(n)', worst: 'O(n)', note: 'Produces ascending sorted output automatically' },
      { operation: 'Range Query [L, R]', average: 'O(log n + k)', worst: 'O(n)', note: 'Prunes entire subtrees outside [L, R]' },
    ],
    dfdNodes: [
      { id: 'query', label: 'search / insert(k)', sublabel: 'Start at Root', x: 86, y: 112 },
      { id: 'cmp', label: 'Compare k vs node', sublabel: 'k < cur ? L : R', x: 256, y: 58 },
      { id: 'branch', label: 'Descend Subtree', sublabel: 'Prune Half Tree', x: 426, y: 162 },
      { id: 'hit', label: 'Match / Attach Leaf', sublabel: 'Ordered Invariant', x: 584, y: 112 },
    ],
    dfdEdges: [
      { id: 'e1', from: 'query', to: 'cmp', label: 'Check Root' },
      { id: 'e2', from: 'cmp', to: 'branch', label: 'Go Left or Right' },
      { id: 'e3', from: 'branch', to: 'hit', label: 'Found / Null Leaf' },
    ],
    dfdSteps: [
      {
        step: 1,
        title: 'Compare Target Key Against Current Node',
        plainEnglish: 'Start at the Root and ask: is my key smaller (go left), bigger (go right), or equal (found!)?',
        technicalDetail: 'Iterative descent uses O(1) stack space, avoiding recursion depth limits on skewed trees.',
        activeNodeIds: ['query', 'cmp'],
        activeEdgeIds: ['e1'],
        packetLabel: 'cmp(k, cur)',
      },
      {
        step: 2,
        title: 'Prune Opposite Subtree Every Hop',
        plainEnglish: 'Choosing Left immediately discards 100% of the Right subtree—halving the search work at each level.',
        technicalDetail: 'Balanced trees (Java TreeMap Red-Black Tree) enforce height <= 2*log2(n+1).',
        activeNodeIds: ['cmp', 'branch'],
        activeEdgeIds: ['e2'],
        packetLabel: 'k < cur -> L',
      },
      {
        step: 3,
        title: 'Return Match or Attach New Leaf Preserving Order',
        plainEnglish: 'When we reach an empty `None`/`null` child slot on insert, attach the new node right there—sorted order stays 100% intact!',
        technicalDetail: 'Inorder traversal (`left -> visit -> right`) yields keys in strictly sorted ascending sequence.',
        activeNodeIds: ['branch', 'hit'],
        activeEdgeIds: ['e3'],
        packetLabel: 'ATTACH LEAF',
      },
    ],
    pythonCode: `class _TreeNode:
    __slots__ = ("key", "left", "right")
    def __init__(self, key: int) -> None:
        self.key = key
        self.left: _TreeNode | None = None
        self.right: _TreeNode | None = None

class BinarySearchTree:
    """Iterative O(h) insert/search + sorted inorder traversal."""
    def __init__(self) -> None:
        self._root: _TreeNode | None = None

    def insert(self, key: int) -> None:
        if self._root is None:
            self._root = _TreeNode(key)
            return
        curr = self._root
        while True:
            if key < curr.key:
                if curr.left is None:
                    curr.left = _TreeNode(key)
                    return
                curr = curr.left
            elif key > curr.key:
                if curr.right is None:
                    curr.right = _TreeNode(key)
                    return
                curr = curr.right
            else:
                return  # duplicate key ignored

    def contains(self, key: int) -> bool:
        curr = self._root
        while curr is not None:
            if key == curr.key:
                return True
            curr = curr.left if key < curr.key else curr.right
        return False

    def inorder(self) -> list[int]:
        out: list[int] = []
        def dfs(node: _TreeNode | None) -> None:
            if node is None:
                return
            dfs(node.left)
            out.append(node.key)
            dfs(node.right)
        dfs(self._root)
        return out`,
    javaCode: `import java.util.*;

public final class MyBST<K extends Comparable<K>> {
    private static final class Node<K> {
        final K key;
        Node<K> left, right;
        Node(K key) { this.key = key; }
    }

    private Node<K> root;

    public void insert(K key) {
        if (root == null) { root = new Node<>(key); return; }
        Node<K> curr = root;
        while (true) {
            int cmp = key.compareTo(curr.key);
            if (cmp < 0) {
                if (curr.left == null) { curr.left = new Node<>(key); return; }
                curr = curr.left;
            } else if (cmp > 0) {
                if (curr.right == null) { curr.right = new Node<>(key); return; }
                curr = curr.right;
            } else return;
        }
    }

    public boolean contains(K key) {
        Node<K> curr = root;
        while (curr != null) {
            int cmp = key.compareTo(curr.key);
            if (cmp == 0) return true;
            curr = (cmp < 0) ? curr.left : curr.right;
        }
        return false;
    }

    public List<K> inorder() {
        List<K> res = new ArrayList<>();
        dfs(root, res);
        return res;
    }

    private void dfs(Node<K> node, List<K> out) {
        if (node == null) return;
        dfs(node.left, out);
        out.add(node.key);
        dfs(node.right, out);
    }
}`,
    starterPython: `class _TreeNode:
    __slots__ = ("key", "left", "right")
    def __init__(self, key: int):
        self.key, self.left, self.right = key, None, None

class BinarySearchTree:
    def __init__(self):
        self._root = None

    def insert(self, key: int):
        # TODO: Walk left if key < curr.key else right, attach new _TreeNode
        pass

    def contains(self, key: int) -> bool:
        # TODO: Return True when key == curr.key, else descend left/right
        pass`,
    starterJava: `public class MyBST<K extends Comparable<K>> {
    private static final class Node<K> {
        final K key; Node<K> left, right;
        Node(K k) { this.key = k; }
    }
    private Node<K> root;

    public void insert(K key) {
        // TODO: Compare with compareTo() and attach left/right leaf
    }

    public boolean contains(K key) {
        // TODO: Traverse left/right until found or null
        return false;
    }
}`,
    pythonRules: [
      { id: 'py-bst-root', label: 'Handles empty root insert', hint: 'Check `if self._root is None:` and set `_TreeNode(key)`.', test: (c) => /_root\s+is\s+None/.test(c) },
      { id: 'py-bst-branch', label: 'Branches left/right on key comparison', hint: 'Compare `key < curr.key` and `key > curr.key`.', test: (c) => /curr\.left/.test(c) && /curr\.right/.test(c) },
      { id: 'py-bst-contains', label: 'Implements contains() lookup', hint: 'Return `True` on `key == curr.key`, else `False`.', test: (c) => /def\s+contains/.test(c) && /return\s+True/.test(c) },
    ],
    javaRules: [
      { id: 'jv-bst-cmp', label: 'Uses Comparable.compareTo()', hint: 'Compare `int cmp = key.compareTo(curr.key);`.', test: (c) => /compareTo\s*\(/.test(c) },
      { id: 'jv-bst-branch', label: 'Navigates curr.left and curr.right', hint: 'Branch on `cmp < 0` (left) and `cmp > 0` (right).', test: (c) => /curr\.left/.test(c) && /curr\.right/.test(c) },
      { id: 'jv-bst-contains', label: 'Implements contains() returning boolean', hint: 'Return `true` when `cmp == 0`.', test: (c) => /cmp\s*==\s*0/.test(c) && /return\s+true/.test(c) },
    ],
  },
];
