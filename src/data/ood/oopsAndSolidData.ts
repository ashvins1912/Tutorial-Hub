import type { OodConcept } from './oodTypes';

export const OOPS_AND_SOLID_CONCEPTS: OodConcept[] = [
  // ==========================================================================
  // TRACK 1: OOPs CORE PILLARS & MEMORY MECHANICS (6 Topics)
  // ==========================================================================
  {
    id: 'oop-classes-memory',
    track: 'oops',
    trackLabel: 'OOPs Pillars',
    title: 'Classes, Objects & Stack vs Heap Memory',
    shortTitle: 'Classes & Memory',
    difficulty: 'Beginner',
    oneSentenceRule:
      'A Class is a zero-memory blueprint; calling its constructor allocates an actual Object on the Heap and stores a reference pointer on the Stack.',
    realWorldAnalogy:
      'An architectural house blueprint (Class) takes almost no space. Each real house built from it (Object) sits on its own plot of land (Heap), and your GPS address card (Stack reference) points to that house.',
    whyItMatters:
      'Understanding references vs copies prevents 80% of mutation bugs, explains null-pointer exceptions, and clarifies why passing an object to a function lets it mutate Heap state.',
    keyTakeaways: [
      'Local variables & method frames live on the fast LIFO Stack; object instances live on the Heap.',
      'Assigning b = a copies the reference pointer, NOT the object—both point to the same Heap instance.',
      'Constructors guarantee an object starts in a valid state; static fields belong to the Class itself, shared by all objects.',
    ],
    commonMistakes: [
      'Thinking b = a creates an independent clone of an object.',
      'Leaving constructors unvalidated so objects exist in half-broken states.',
      'Overusing mutable static state, causing hidden race conditions across tests and threads.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · BLUEPRINT',
        title: 'Class Definition Loaded (No Instance Yet)',
        caption:
          'The runtime loads class Car { speed, drive() } into Method/Class metadata. Zero Car objects exist on the Heap yet.',
        nodes: [
          { id: 'cls', label: 'Class: Car', sublabel: 'Blueprint in Metadata', x: 25, y: 50, kind: 'class', state: 'highlight', fields: ['speed: int', 'drive()'] },
          { id: 'stack', label: 'Call Stack', sublabel: 'main() frame', x: 75, y: 28, kind: 'memory', state: 'idle', fields: ['(empty)'] },
          { id: 'heap', label: 'Heap Memory', sublabel: 'Object storage', x: 75, y: 74, kind: 'memory', state: 'idle', fields: ['(no Car allocated)'] },
        ],
        edges: [],
        stateWatch: [
          { key: 'Heap Objects', value: '0', tone: 'neutral' },
          { key: 'Stack Pointer', value: 'none', tone: 'neutral' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · ALLOCATE',
        title: 'new Car(60) Allocates on Heap & Returns Pointer',
        caption:
          'Calling Car c1 = new Car(60) reserves memory at Heap address 0x4A1, runs the constructor, and writes pointer 0x4A1 into Stack variable c1.',
        nodes: [
          { id: 'cls', label: 'Class: Car', sublabel: 'Constructor invoked', x: 18, y: 50, kind: 'class', state: 'active', fields: ['Car(60)'] },
          { id: 'stack', label: 'Stack: main()', sublabel: 'Local reference', x: 52, y: 26, kind: 'memory', state: 'highlight', fields: ['c1 -> 0x4A1'] },
          { id: 'obj1', label: 'Heap @ 0x4A1', sublabel: 'Car instance', x: 82, y: 66, kind: 'object', state: 'success', fields: ['speed = 60'] },
        ],
        edges: [
          { from: 'cls', to: 'obj1', label: 'allocates', style: 'dashed', active: true },
          { from: 'stack', to: 'obj1', label: 'points to 0x4A1', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'c1 (Stack)', value: '0x4A1', tone: 'good' },
          { key: 'Heap[0x4A1].speed', value: '60', tone: 'good' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · ALIASING',
        title: 'Car c2 = c1 Copies the Reference, Not the Object',
        caption:
          'Assigning c2 = c1 puts the exact same address 0x4A1 into c2. Mutating c2.speed = 95 immediately changes what c1 sees!',
        nodes: [
          { id: 'stack1', label: 'Stack: c1', sublabel: 'ref -> 0x4A1', x: 25, y: 28, kind: 'memory', state: 'active', fields: ['0x4A1'] },
          { id: 'stack2', label: 'Stack: c2', sublabel: 'ref -> 0x4A1', x: 25, y: 72, kind: 'memory', state: 'highlight', fields: ['0x4A1'] },
          { id: 'obj1', label: 'Heap @ 0x4A1', sublabel: 'Shared Car Object', x: 75, y: 50, kind: 'object', state: 'active', fields: ['speed = 95 (mutated!)'] },
        ],
        edges: [
          { from: 'stack1', to: 'obj1', label: 'reads 95', style: 'solid', active: true },
          { from: 'stack2', to: 'obj1', label: 'writes 95', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'c1 == c2', value: 'true (same ref)', tone: 'warn' },
          { key: 'c1.speed', value: '95', tone: 'warn' },
        ],
      },
      {
        stepNumber: 4,
        badge: 'STEP 4 · CLEANUP',
        title: 'Unreferenced Heap Objects Are Garbage Collected',
        caption:
          'When main() finishes, stack frames pop and 0x4A1 has 0 incoming references. The Garbage Collector safely reclaims the Heap slot.',
        nodes: [
          { id: 'stack', label: 'Call Stack', sublabel: 'main() popped', x: 25, y: 50, kind: 'memory', state: 'idle', fields: ['0 references'] },
          { id: 'obj1', label: 'Heap @ 0x4A1', sublabel: 'Unreachable -> GC Reclaimed', x: 75, y: 50, kind: 'object', state: 'success', fields: ['freed safely'] },
        ],
        edges: [
          { from: 'stack', to: 'obj1', label: '0 live refs', style: 'dashed', active: false },
        ],
        stateWatch: [
          { key: 'Reachable Refs', value: '0', tone: 'good' },
          { key: 'GC Action', value: 'Reclaim 0x4A1', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Unvalidated State & Accidental Aliasing',
      goodLabel: 'Validated Constructor & Explicit Copy',
      explanation:
        'Validating inside the constructor stops invalid objects from ever existing, and providing an explicit clone/copy avoids accidental shared mutation.',
      python: {
        bad: `class Car:\n    def __init__(self, speed):\n        self.speed = speed  # Allows -500!\n\nc1 = Car(60)\nc2 = c1            # Same Heap object!\nc2.speed = -50     # Corrupts c1 too`,
        good: `class Car:\n    def __init__(self, speed: int):\n        if speed < 0:\n            raise ValueError("Speed cannot be negative")\n        self._speed = speed\n\n    def clone(self) -> "Car":\n        return Car(self._speed)  # Independent Heap object`,
      },
      java: {
        bad: `class Car {\n    public int speed; // Unprotected\n}\nCar c1 = new Car();\nc1.speed = 60;\nCar c2 = c1;       // Alias!\nc2.speed = -50;    // Corrupts c1`,
        good: `class Car {\n    private final int speed;\n    public Car(int speed) {\n        if (speed < 0) throw new IllegalArgumentException("speed < 0");\n        this.speed = speed;\n    }\n    public Car withSpeed(int next) { return new Car(next); }\n}`,
      },
      typescript: {
        bad: `class Car {\n  speed: number;\n  constructor(speed: number) { this.speed = speed; }\n}\nconst c1 = new Car(60);\nconst c2 = c1; // Alias to same heap object\nc2.speed = -50;`,
        good: `class Car {\n  constructor(private readonly speed: number) {\n    if (speed < 0) throw new Error('Speed must be >= 0');\n  }\n  withSpeed(next: number): Car {\n    return new Car(next); // Fresh immutable instance\n  }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Is Java/Python/JS pass-by-value or pass-by-reference for objects?',
        answer:
          'Strictly pass-by-value of the reference! The function receives a copy of the pointer address, so mutating fields on that object affects the caller, but reassigning the parameter variable itself does not rebind the caller variable.',
      },
      {
        question: 'When should a field or method be static?',
        answer:
          'Only when it represents a pure constant, factory helper, or shared class-level invariant independent of any specific object instance (e.g., Math.max or Currency.USD). Avoid mutable static state because it behaves like a global variable.',
      },
    ],
    quiz: {
      question: 'After running `a = new User("Sam"); b = a; b.name = "Alex";`, what is `a.name` and why?',
      options: [
        { id: 'a', text: '"Alex" — both a and b hold pointers to the same Heap object', isCorrect: true, explanation: 'Correct! Assigning b = a copies the Heap reference address, not the object bytes.' },
        { id: 'b', text: '"Sam" — assignment deep-copies the object automatically', isCorrect: false, explanation: 'Object assignment in Java, Python, and TypeScript copies only the reference pointer.' },
        { id: 'c', text: 'Null — b takes ownership and clears a', isCorrect: false, explanation: 'Garbage-collected OOP languages allow multiple stack references to alias one Heap object.' },
        { id: 'd', text: 'Compile error because objects cannot be reassigned', isCorrect: false, explanation: 'Reassigning reference variables is completely valid unless declared final/const.' },
      ],
    },
  },

  {
    id: 'oop-encapsulation',
    track: 'oops',
    trackLabel: 'OOPs Pillars',
    title: 'Encapsulation & Invariant Protection',
    shortTitle: 'Encapsulation',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Bundle data with the methods that control it, hide internal fields as private, and allow changes only through validated domain operations.',
    realWorldAnalogy:
      'A bank vault does not let customers walk in and edit their ledger balance with a pen. You interact through a teller (withdraw/deposit method) who enforces balance and daily-limit rules.',
    whyItMatters:
      'Encapsulation protects business invariants (like "balance can never go negative") in ONE place so no external caller can accidentally corrupt object state.',
    keyTakeaways: [
      'Encapsulation is NOT just private fields + blind getters/setters—it is exposing behavior (withdraw) instead of raw data mutation (setBalance).',
      'Keeps internal representation free to change (e.g., storing cents as int instead of float) without breaking callers.',
      'Prevents defensive duplication of validation checks scattered across 20 files.',
    ],
    commonMistakes: [
      'Making every field private then blindly generating public getX/setX for all of them (anemic data bag).',
      'Returning mutable internal lists directly from a getter so callers can call list.clear() externally.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · BROKEN',
        title: 'Public Field Allows Direct Corruption',
        caption:
          'When account.balance is public, any module can write account.balance = -9999, silently violating the bank invariant.',
        nodes: [
          { id: 'caller', label: 'CheckoutService', sublabel: 'External caller', x: 20, y: 50, kind: 'client', state: 'active' },
          { id: 'acct', label: 'BankAccount', sublabel: 'public balance!', x: 75, y: 50, kind: 'broken', state: 'error', fields: ['public balance = -9999'] },
        ],
        edges: [
          { from: 'caller', to: 'acct', label: 'balance = -9999', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Invariant (balance >= 0)', value: 'VIOLATED', tone: 'bad' },
          { key: 'balance', value: '-9999', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · PROTECTED',
        title: 'Private State Behind a Validation Gate',
        caption:
          'Now balance is private. External code can only invoke withdraw(amount), which routes through an invariant guard.',
        nodes: [
          { id: 'caller', label: 'CheckoutService', sublabel: 'Calls withdraw(500)', x: 18, y: 50, kind: 'client', state: 'active' },
          { id: 'gate', label: 'withdraw() Gate', sublabel: 'Check: 0 < amt <= bal', x: 50, y: 50, kind: 'gate', state: 'highlight' },
          { id: 'vault', label: 'Private State', sublabel: '#balanceCents', x: 82, y: 50, kind: 'object', state: 'idle', fields: ['balance = 200'] },
        ],
        edges: [
          { from: 'caller', to: 'gate', label: 'withdraw(500)', style: 'call', active: true },
          { from: 'gate', to: 'vault', label: 'inspect 200', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Request', value: 'withdraw(500)', tone: 'neutral' },
          { key: 'Guard Check', value: '500 <= 200 ? FALSE', tone: 'warn' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · REJECT INVALID',
        title: 'Invalid Mutation Blocked Before Touching Data',
        caption:
          'Because 500 > 200, the gate throws InsufficientFundsError. The private balance remains completely untouched at 200.',
        nodes: [
          { id: 'caller', label: 'CheckoutService', sublabel: 'Receives Error', x: 18, y: 50, kind: 'client', state: 'error' },
          { id: 'gate', label: 'withdraw() Gate', sublabel: 'BLOCKED!', x: 50, y: 50, kind: 'gate', state: 'error' },
          { id: 'vault', label: 'Private State', sublabel: 'Protected!', x: 82, y: 50, kind: 'object', state: 'success', fields: ['balance = 200 (safe)'] },
        ],
        edges: [
          { from: 'caller', to: 'gate', label: 'blocked', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Result', value: 'InsufficientFundsError', tone: 'warn' },
          { key: 'balance', value: '200 (unchanged)', tone: 'good' },
        ],
      },
      {
        stepNumber: 4,
        badge: 'STEP 4 · SAFE UPDATE',
        title: 'Valid withdraw(75) Succeeds Atomically',
        caption:
          'A valid withdraw(75) passes the guard, updates private state to 125, and logs an audit entry inside the object.',
        nodes: [
          { id: 'caller', label: 'CheckoutService', sublabel: 'Calls withdraw(75)', x: 18, y: 50, kind: 'client', state: 'success' },
          { id: 'gate', label: 'withdraw() Gate', sublabel: '75 <= 200 PASS', x: 50, y: 50, kind: 'gate', state: 'success' },
          { id: 'vault', label: 'Private State', sublabel: 'Updated safely', x: 82, y: 50, kind: 'object', state: 'success', fields: ['balance = 125'] },
        ],
        edges: [
          { from: 'caller', to: 'gate', label: 'withdraw(75)', style: 'call', active: true },
          { from: 'gate', to: 'vault', label: 'commit 125', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Invariant', value: 'PRESERVED', tone: 'good' },
          { key: 'balance', value: '125', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Exposed Mutable Data Bag',
      goodLabel: 'True Behavioral Encapsulation',
      explanation:
        'Replace raw setBalance() with domain methods like withdraw() and deposit() so every state change enforces the invariant.',
      python: {
        bad: `class BankAccount:\n    def __init__(self, balance):\n        self.balance = balance\n\nacct = BankAccount(200)\nacct.balance -= 500  # Silent negative balance!`,
        good: `class BankAccount:\n    def __init__(self, balance: int):\n        self.__balance = max(0, balance)\n\n    def withdraw(self, amount: int) -> None:\n        if amount <= 0 or amount > self.__balance:\n            raise ValueError("Insufficient funds")\n        self.__balance -= amount`,
      },
      java: {
        bad: `class BankAccount {\n    public int balance = 200;\n}\n// Anywhere in codebase:\naccount.balance = -500;`,
        good: `class BankAccount {\n    private int balance;\n    public BankAccount(int initial) { this.balance = Math.max(0, initial); }\n    public void withdraw(int amount) {\n        if (amount <= 0 || amount > balance) throw new IllegalStateException("Insufficient funds");\n        this.balance -= amount;\n    }\n    public int getBalance() { return balance; }\n}`,
      },
      typescript: {
        bad: `class BankAccount {\n  balance = 200;\n}\nconst acct = new BankAccount();\nacct.balance = -500; // Invariant destroyed`,
        good: `class BankAccount {\n  #balance: number;\n  constructor(initial: number) { this.#balance = Math.max(0, initial); }\n  withdraw(amount: number): void {\n    if (amount <= 0 || amount > this.#balance) throw new Error('Insufficient funds');\n    this.#balance -= amount;\n  }\n  get balance(): number { return this.#balance; }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'What is the difference between Encapsulation and Abstraction?',
        answer:
          'Encapsulation is HOW you protect and bundle internal state (access modifiers, private fields, validation gates). Abstraction is WHAT you expose—hiding complex implementation details behind a simple contract/interface.',
      },
      {
        question: 'Why is returning a private ArrayList directly from a getter an encapsulation leak?',
        answer:
          'Because callers receive a reference to the internal Heap list and can call getItems().clear(), bypassing all validation. Return an unmodifiable view or defensive copy instead.',
      },
    ],
    quiz: {
      question: 'Which design best demonstrates true Encapsulation?',
      options: [
        { id: 'a', text: 'Private fields with domain methods like withdraw() and deposit() that enforce invariants', isCorrect: true, explanation: 'Correct! Behavioral methods protect invariants in one place.' },
        { id: 'b', text: 'Private fields with auto-generated public setters for every single field', isCorrect: false, explanation: 'Unrestricted setters expose internal state just like public fields.' },
        { id: 'c', text: 'Public fields accompanied by comments asking callers not to set negative values', isCorrect: false, explanation: 'Comments are not enforced by the runtime or compiler.' },
        { id: 'd', text: 'Putting all fields into a global dictionary', isCorrect: false, explanation: 'Global shared dictionaries destroy ownership and encapsulation.' },
      ],
    },
  },

  {
    id: 'oop-abstraction',
    track: 'oops',
    trackLabel: 'OOPs Pillars',
    title: 'Abstraction, Interfaces & Abstract Classes',
    shortTitle: 'Abstraction',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Expose only WHAT an object can do (its contract) while hiding HOW it accomplishes it internally.',
    realWorldAnalogy:
      'A car steering wheel and gas pedal are an Abstraction: you press gas to accelerate without knowing whether a petrol engine, hybrid, or Tesla electric motor sits under the hood.',
    whyItMatters:
      'Abstraction lets teams swap Stripe for Razorpay, or PostgreSQL for DynamoDB, without rewriting business logic because callers talk only to the clean interface.',
    keyTakeaways: [
      'Interface = pure capability contract ("can charge()", "can serialize()"); a class can implement many interfaces.',
      'Abstract Class = partial shared base with common state + template methods; a class can extend only one.',
      'Prefer interfaces for behavioral contracts across unrelated classes; use abstract classes only for genuine shared base state.',
    ],
    commonMistakes: [
      'Leaking implementation details into interface names (e.g., saveToMySqlTable() instead of saveOrder()).',
      'Creating a single-implementation interface prematurely when no swap/mocking need exists (YAGNI).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · CONTRACT',
        title: 'Client Talks Only to PaymentGateway Interface',
        caption:
          'Checkout calls gateway.charge(amount). It has zero knowledge of HTTP retries, TLS handshakes, or vendor SDKs.',
        nodes: [
          { id: 'client', label: 'CheckoutFlow', sublabel: 'Calls charge($49)', x: 18, y: 50, kind: 'client', state: 'active' },
          { id: 'iface', label: '«interface» PaymentGateway', sublabel: 'charge(amount): Receipt', x: 52, y: 50, kind: 'interface', state: 'highlight' },
          { id: 'impl', label: 'StripeGateway', sublabel: 'Hidden SDK, retries, webhooks', x: 85, y: 50, kind: 'class', state: 'idle' },
        ],
        edges: [
          { from: 'client', to: 'iface', label: 'charge(49)', style: 'call', active: true },
          { from: 'impl', to: 'iface', label: 'implements', style: 'inherit', active: false },
        ],
        stateWatch: [
          { key: 'Caller Knows', value: 'charge(amount) only', tone: 'good' },
          { key: 'Hidden Complexity', value: 'OAuth + TLS + Retry', tone: 'neutral' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · HIDDEN EXECUTION',
        title: 'Concrete Implementation Handles Dirty Plumbing',
        caption:
          'Behind the interface wall, StripeGateway signs HMAC headers, calls Stripe REST API, and translates errors into a standard Receipt.',
        nodes: [
          { id: 'client', label: 'CheckoutFlow', sublabel: 'Waits for Receipt', x: 18, y: 50, kind: 'client', state: 'idle' },
          { id: 'iface', label: '«interface» PaymentGateway', sublabel: 'Stable boundary', x: 52, y: 50, kind: 'interface', state: 'active' },
          { id: 'impl', label: 'StripeGateway', sublabel: 'HMAC -> POST /v1/charges', x: 85, y: 50, kind: 'class', state: 'success', fields: ['retry=3', '200 OK'] },
        ],
        edges: [
          { from: 'iface', to: 'impl', label: 'executes internally', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Active Provider', value: 'StripeGateway', tone: 'good' },
          { key: 'CheckoutFlow Edits', value: '0 lines', tone: 'good' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · ZERO-IMPACT SWAP',
        title: 'Swap Stripe for Razorpay or MockGateway Seamlessly',
        caption:
          'When expanding to India or running unit tests, plug in RazorpayGateway or MockGateway. CheckoutFlow does not change a single character!',
        nodes: [
          { id: 'client', label: 'CheckoutFlow', sublabel: 'Unchanged!', x: 18, y: 50, kind: 'client', state: 'success' },
          { id: 'iface', label: '«interface» PaymentGateway', sublabel: 'charge(amount)', x: 52, y: 50, kind: 'interface', state: 'highlight' },
          { id: 'impl2', label: 'RazorpayGateway', sublabel: 'Swapped in via DI', x: 85, y: 28, kind: 'class', state: 'success' },
          { id: 'mock', label: 'MockGateway', sublabel: 'Fast offline unit tests', x: 85, y: 74, kind: 'class', state: 'active' },
        ],
        edges: [
          { from: 'client', to: 'iface', label: 'same call', style: 'call', active: true },
          { from: 'impl2', to: 'iface', label: 'implements', style: 'inherit', active: true },
          { from: 'mock', to: 'iface', label: 'implements', style: 'inherit', active: true },
        ],
        stateWatch: [
          { key: 'CheckoutFlow Diff', value: '0 lines changed', tone: 'good' },
          { key: 'Testability', value: 'Instant Mock Swap', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Leaking Concrete Vendor Plumbing',
      goodLabel: 'Clean Interface Abstraction',
      explanation:
        'Hiding vendor API setup behind a PaymentGateway interface isolates business checkout code from third-party SDK changes.',
      python: {
        bad: `def checkout(total):\n    # Caller directly coupled to Stripe internals\n    client = StripeSDK(api_key="sk_live", retries=3)\n    client.create_payment_intent(amount_cents=total * 100, currency="usd")`,
        good: `from abc import ABC, abstractmethod\n\nclass PaymentGateway(ABC):\n    @abstractmethod\n    def charge(self, amount: int) -> bool: ...\n\ndef checkout(total: int, gateway: PaymentGateway) -> bool:\n    return gateway.charge(total)  # Clean abstraction!`,
      },
      java: {
        bad: `void checkout(int total) {\n    StripeClient stripe = new StripeClient("sk_live");\n    stripe.postChargeCents(total * 100, "USD");\n}`,
        good: `interface PaymentGateway {\n    boolean charge(int amount);\n}\n\nclass CheckoutService {\n    private final PaymentGateway gateway;\n    CheckoutService(PaymentGateway gateway) { this.gateway = gateway; }\n    boolean checkout(int total) { return gateway.charge(total); }\n}`,
      },
      typescript: {
        bad: `function checkout(total: number) {\n  const sdk = new StripeSdk({ retries: 3 });\n  return sdk.post('/v1/charges', { cents: total * 100 });\n}`,
        good: `interface PaymentGateway {\n  charge(amount: number): Promise<boolean>;\n}\n\nfunction checkout(total: number, gateway: PaymentGateway) {\n  return gateway.charge(total);\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Interface vs Abstract Class — when do you choose each?',
        answer:
          'Choose an Interface when unrelated classes share a capability (Comparable, Serializable, PaymentGateway) or when you need multiple inheritance of types. Choose an Abstract Class when closely related classes share common state, constructor logic, or a skeleton algorithm (Template Method).',
      },
      {
        question: 'What is a "leaky abstraction"?',
        answer:
          'When hidden implementation details bleed through the contract—for example, a generic StorageRepository throwing raw SQLException instead of a domain StorageException.',
      },
    ],
    quiz: {
      question: 'When should you prefer an Interface over an Abstract Class?',
      options: [
        { id: 'a', text: 'When defining a shared capability contract that multiple unrelated classes can implement', isCorrect: true, explanation: 'Correct! Interfaces model "can-do" contracts cleanly without forcing a shared class hierarchy.' },
        { id: 'b', text: 'When you want to store mutable private instance fields shared by subclasses', isCorrect: false, explanation: 'Interfaces cannot hold mutable instance state; Abstract Classes do.' },
        { id: 'c', text: 'When you want to prevent polymorphism', isCorrect: false, explanation: 'Interfaces are one of the primary enablers of polymorphism.' },
        { id: 'd', text: 'Interfaces are faster than classes at runtime', isCorrect: false, explanation: 'Choice is architectural (contract vs shared state), not micro-optimization.' },
      ],
    },
  },

  {
    id: 'oop-inheritance-composition',
    track: 'oops',
    trackLabel: 'OOPs Pillars',
    title: 'Inheritance vs Composition Over Inheritance',
    shortTitle: 'Inheritance & Composition',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Use Inheritance only for true permanent "IS-A" hierarchies; prefer Composition ("HAS-A" pluggable parts) to combine behaviors without brittle class explosions.',
    realWorldAnalogy:
      'Instead of building 12 separate car classes (ElectricAutoCar, GasManualCar, HybridAutoCar...), build ONE Car composed of a swappable Engine + swappable Transmission.',
    whyItMatters:
      'Deep inheritance trees suffer from the "Fragile Base Class" problem: editing a parent method silently breaks grandchildren. Composition lets you mix and swap behaviors at runtime.',
    keyTakeaways: [
      'Inheritance creates tight compile-time coupling; Composition creates loose runtime pluggability.',
      'Class explosion: 3 engines × 3 transmissions = 9 subclasses with inheritance, vs 6 tiny composable classes with composition.',
      'Ask: "Can this trait change at runtime?" If yes (e.g., User role or Robot movement mode), use Composition!',
    ],
    commonMistakes: [
      'Extending a class just to reuse 1 helper method (e.g., Stack extending ArrayList in legacy Java—exposing remove(index)!).',
      'Creating 5+ levels of nested inheritance where nobody can trace which method runs.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · CLASS EXPLOSION',
        title: 'Rigid Inheritance Tree Explodes Combinatorially',
        caption:
          'Adding Flyable + Swimmable + Laser abilities via inheritance forces awkward combinations like FlyingSwimmingDuck and fragile overrides.',
        nodes: [
          { id: 'base', label: 'Duck (Base)', sublabel: 'fly(), swim()', x: 50, y: 18, kind: 'class', state: 'active' },
          { id: 'c1', label: 'MallardDuck', sublabel: 'flies + swims', x: 20, y: 68, kind: 'class', state: 'idle' },
          { id: 'c2', label: 'RubberDuck', sublabel: 'fly() throws Error!', x: 50, y: 68, kind: 'broken', state: 'error' },
          { id: 'c3', label: 'RocketDuck', sublabel: 'duplicates code', x: 80, y: 68, kind: 'broken', state: 'error' },
        ],
        edges: [
          { from: 'c1', to: 'base', label: 'extends', style: 'inherit', active: false },
          { from: 'c2', to: 'base', label: 'breaks fly()', style: 'blocked', active: true },
          { from: 'c3', to: 'base', label: 'overrides all', style: 'inherit', active: true },
        ],
        stateWatch: [
          { key: 'Coupling', value: 'Tight (Fragile Base)', tone: 'bad' },
          { key: 'RubberDuck.fly()', value: 'UnsupportedError!', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · COMPOSITION',
        title: 'Compose Small Pluggable Behavior Objects',
        caption:
          'One Duck class HAS-A FlyBehavior and HAS-A QuackBehavior. RubberDuck gets NoFly; RocketDuck gets JetFly—zero broken overrides!',
        nodes: [
          { id: 'duck', label: 'Duck', sublabel: 'HAS-A behaviors', x: 24, y: 50, kind: 'object', state: 'highlight', fields: ['flyer: FlyBehavior', 'quacker: Quack'] },
          { id: 'fly', label: 'JetFly / NoFly', sublabel: 'Pluggable Strategy', x: 76, y: 28, kind: 'interface', state: 'success' },
          { id: 'quack', label: 'Squeak / Quack', sublabel: 'Pluggable Strategy', x: 76, y: 72, kind: 'interface', state: 'success' },
        ],
        edges: [
          { from: 'duck', to: 'fly', label: 'delegates fly()', style: 'call', active: true },
          { from: 'duck', to: 'quack', label: 'delegates sound()', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Runtime Swap', value: 'duck.setFlyer(JetFly)', tone: 'good' },
          { key: 'Subclasses Needed', value: '0 extra classes!', tone: 'good' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · RUNTIME UPGRADE',
        title: 'Swap Capabilities Dynamically Without Changing Class',
        caption:
          'At runtime, a Duck can upgrade from WingFly to JetFly simply by swapping its composed reference—impossible with static inheritance!',
        nodes: [
          { id: 'duck', label: 'duckInstance', sublabel: 'Same Heap Object', x: 24, y: 50, kind: 'object', state: 'success', fields: ['flyer -> JetFly'] },
          { id: 'old', label: 'WingFly', sublabel: 'Detached', x: 76, y: 26, kind: 'class', state: 'idle' },
          { id: 'new', label: 'JetFly', sublabel: 'Active at Runtime!', x: 76, y: 74, kind: 'class', state: 'success' },
        ],
        edges: [
          { from: 'duck', to: 'old', label: 'detached', style: 'dashed', active: false },
          { from: 'duck', to: 'new', label: 'active delegate', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Flexibility', value: 'Dynamic Runtime Swap', tone: 'good' },
          { key: 'Fragile Base Risk', value: 'Eliminated', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Inheritance Abuse (Stack extends Array)',
      goodLabel: 'Clean Composition (Stack HAS-A List)',
      explanation:
        'Composing an internal list inside Stack exposes only push/pop/peek instead of accidentally inheriting insertAt(0) from Array.',
      python: {
        bad: `class Stack(list):\n    def push(self, item):\n        self.append(item)\n# Leak! Caller can call stack.insert(0, 99) and break LIFO!`,
        good: `class Stack:\n    def __init__(self):\n        self._items: list = []  # Composition (HAS-A)\n    def push(self, item) -> None: self._items.append(item)\n    def pop(self): return self._items.pop()`,
      },
      java: {
        bad: `class MyStack<T> extends ArrayList<T> {\n    void push(T x) { add(x); }\n    // Leaks add(0, x) & remove(2) from ArrayList!\n}`,
        good: `class MyStack<T> {\n    private final Deque<T> items = new ArrayDeque<>();\n    public void push(T x) { items.push(x); }\n    public T pop() { return items.pop(); }\n}`,
      },
      typescript: {
        bad: `class MyStack<T> extends Array<T> {\n  // Exposes shift(), splice(), unshift() — breaks LIFO contract!\n}`,
        good: `class MyStack<T> {\n  private readonly items: T[] = [];\n  push(item: T): void { this.items.push(item); }\n  pop(): T | undefined { return this.items.pop(); }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'Why does Gang of Four famously say "Favor Object Composition over Class Inheritance"?',
        answer:
          'Inheritance breaks encapsulation because subclasses depend on parent internals ("white-box reuse") and locks behavior at compile time. Composition ("black-box reuse") depends only on clean interfaces and allows runtime swapping.',
      },
      {
        question: 'When IS inheritance actually the right choice?',
        answer:
          'When there is a permanent, stable taxonomy where every subclass satisfies Liskov Substitution (e.g., HttpException -> NotFoundException, or UI Component lifecycle base class).',
      },
    ],
    quiz: {
      question: 'You have 4 notification channels and 3 retry policies. What happens if you model every combination with inheritance?',
      options: [
        { id: 'a', text: 'A combinatorial explosion of 12 rigid subclasses instead of 4 channels composed with 3 retry objects', isCorrect: true, explanation: 'Correct! Composition scales additively (4 + 3 = 7) instead of multiplicatively (4 × 3 = 12).' },
        { id: 'b', text: 'Only 1 class is needed', isCorrect: false, explanation: 'Inheritance forces a subclass per combination.' },
        { id: 'c', text: 'Retry policies become swappable at runtime automatically', isCorrect: false, explanation: 'Inheritance binds behavior statically at compile time.' },
        { id: 'd', text: 'It eliminates all interfaces', isCorrect: false, explanation: 'It increases coupling and boilerplate dramatically.' },
      ],
    },
  },

  {
    id: 'oop-polymorphism',
    track: 'oops',
    trackLabel: 'OOPs Pillars',
    title: 'Polymorphism & Runtime Dynamic Dispatch (VTable)',
    shortTitle: 'Polymorphism',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'One unified method call (shape.area()) automatically executes different concrete code depending on the actual runtime object type.',
    realWorldAnalogy:
      'A universal remote "PLAY" button sends the exact same signal. A TV plays a movie, a speaker plays music, and a game console resumes a game—each device responds in its own way.',
    whyItMatters:
      'Polymorphism eliminates sprawling `if (type == "CIRCLE") ... else if (type == "RECT")` chains so new types work everywhere automatically.',
    keyTakeaways: [
      'Compile-time Polymorphism (Method Overloading): same method name, different parameter signatures—resolved at compile time.',
      'Runtime Polymorphism (Method Overriding): resolved at runtime via the object’s Virtual Method Table (vtable) pointer.',
      'Enables loops like `for (Shape s : shapes) total += s.area()` that never break when Triangle is added later.',
    ],
    commonMistakes: [
      'Writing `instanceof` / `typeof` switch statements inside caller code, defeating polymorphism completely.',
      'Assuming private or static methods can be polymorphically overridden (they are statically bound!).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'STEP 1 · UNIFIED LOOP',
        title: 'Caller Invokes shape.area() on a Mixed List',
        caption:
          'The renderer loops over List<Shape> containing Circle, Rectangle, and Triangle. It never checks instanceof!',
        nodes: [
          { id: 'loop', label: 'Renderer Loop', sublabel: 'for s in shapes: s.area()', x: 18, y: 50, kind: 'client', state: 'highlight' },
          { id: 'c', label: 'Circle(r=5)', sublabel: 'vtable -> Circle.area', x: 80, y: 20, kind: 'object', state: 'idle' },
          { id: 'r', label: 'Rect(4x6)', sublabel: 'vtable -> Rect.area', x: 80, y: 50, kind: 'object', state: 'idle' },
          { id: 't', label: 'Triangle(3,8)', sublabel: 'vtable -> Tri.area', x: 80, y: 80, kind: 'object', state: 'idle' },
        ],
        edges: [
          { from: 'loop', to: 'c', label: 'Shape ref', style: 'dashed', active: false },
          { from: 'loop', to: 'r', label: 'Shape ref', style: 'dashed', active: false },
          { from: 'loop', to: 't', label: 'Shape ref', style: 'dashed', active: false },
        ],
        stateWatch: [
          { key: 'if/else branches', value: '0', tone: 'good' },
          { key: 'Dispatch Mode', value: 'Runtime VTable', tone: 'neutral' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'STEP 2 · DISPATCH #1',
        title: 'Runtime Resolves Circle.area() -> 78.54',
        caption:
          'Item 0 is a Circle on the Heap. Dynamic dispatch follows its vtable pointer directly to π·r² = 78.54.',
        nodes: [
          { id: 'loop', label: 'Renderer Loop', sublabel: 's = shapes[0]', x: 18, y: 50, kind: 'client', state: 'active' },
          { id: 'vtable', label: 'VTable Lookup', sublabel: 'Circle::area()', x: 50, y: 24, kind: 'gate', state: 'highlight' },
          { id: 'c', label: 'Circle(r=5)', sublabel: 'returns 78.54', x: 82, y: 24, kind: 'object', state: 'success' },
          { id: 'r', label: 'Rect(4x6)', sublabel: 'waiting', x: 82, y: 70, kind: 'object', state: 'idle' },
        ],
        edges: [
          { from: 'loop', to: 'vtable', label: 's.area()', style: 'call', active: true },
          { from: 'vtable', to: 'c', label: 'π * 25', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Resolved Method', value: 'Circle.area()', tone: 'good' },
          { key: 'Return Value', value: '78.54', tone: 'good' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · DISPATCH #2',
        title: 'Same Line of Code Resolves Rect.area() -> 24',
        caption:
          'The exact same call s.area() now inspects item 1, follows Rectangle’s vtable, and computes w * h = 24.',
        nodes: [
          { id: 'loop', label: 'Renderer Loop', sublabel: 's = shapes[1]', x: 18, y: 50, kind: 'client', state: 'active' },
          { id: 'vtable', label: 'VTable Lookup', sublabel: 'Rect::area()', x: 50, y: 70, kind: 'gate', state: 'highlight' },
          { id: 'c', label: 'Circle(r=5)', sublabel: 'done (78.54)', x: 82, y: 24, kind: 'object', state: 'idle' },
          { id: 'r', label: 'Rect(4x6)', sublabel: 'returns 24', x: 82, y: 70, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'loop', to: 'vtable', label: 's.area()', style: 'call', active: true },
          { from: 'vtable', to: 'r', label: '4 * 6', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Resolved Method', value: 'Rectangle.area()', tone: 'good' },
          { key: 'Total Area', value: '102.54', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Procedural Type-Checking Switch',
      goodLabel: 'Polymorphic Dynamic Dispatch',
      explanation:
        'Each shape owns its own area() formula so totalArea() never needs editing when Hexagon or Ellipse is introduced.',
      python: {
        bad: `def total_area(shapes):\n    total = 0\n    for s in shapes:\n        if s["type"] == "circle": total += 3.14 * s["r"] ** 2\n        elif s["type"] == "rect": total += s["w"] * s["h"]\n    return total`,
        good: `class Shape:\n    def area(self) -> float: raise NotImplementedError\n\nclass Circle(Shape):\n    def __init__(self, r: float): self.r = r\n    def area(self) -> float: return 3.14159 * self.r * self.r\n\ndef total_area(shapes: list[Shape]) -> float:\n    return sum(s.area() for s in shapes)`,
      },
      java: {
        bad: `double totalArea(List<Object> shapes) {\n    double sum = 0;\n    for (Object s : shapes) {\n        if (s instanceof Circle c) sum += Math.PI * c.r * c.r;\n        else if (s instanceof Rect r) sum += r.w * r.h;\n    }\n    return sum;\n}`,
        good: `interface Shape { double area(); }\nrecord Circle(double r) implements Shape { public double area() { return Math.PI * r * r; } }\nrecord Rect(double w, double h) implements Shape { public double area() { return w * h; } }\n\ndouble totalArea(List<Shape> shapes) {\n    return shapes.stream().mapToDouble(Shape::area).sum();\n}`,
      },
      typescript: {
        bad: `function totalArea(shapes: any[]) {\n  return shapes.reduce((sum, s) =>\n    s.kind === 'circle' ? sum + Math.PI * s.r * s.r : sum + s.w * s.h, 0);\n}`,
        good: `interface Shape { area(): number; }\nclass Circle implements Shape {\n  constructor(private r: number) {}\n  area() { return Math.PI * this.r * this.r; }\n}\nconst totalArea = (shapes: Shape[]) => shapes.reduce((s, x) => s + x.area(), 0);`,
      },
    },
    interviewQa: [
      {
        question: 'How does the JVM or C++ runtime implement runtime polymorphism under the hood?',
        answer:
          'Every object header carries a hidden pointer to its class’s virtual method table (vtable). Calling an overridden method indexes into that vtable at runtime to jump to the concrete implementation.',
      },
      {
        question: 'Overloading vs Overriding — what is the core difference?',
        answer:
          'Overloading is two methods with the same name and different parameter lists in the same class (resolved at compile time). Overriding is a subclass redefining an inherited method with the exact same signature (resolved at runtime).',
      },
    ],
    quiz: {
      question: 'Why does replacing `if (obj instanceof ...)` chains with Polymorphism improve maintainability?',
      options: [
        { id: 'a', text: 'Adding a new subtype requires zero edits to existing caller loops', isCorrect: true, explanation: 'Correct! Callers invoke the interface method and new types plug in seamlessly.' },
        { id: 'b', text: 'It eliminates Heap memory allocation completely', isCorrect: false, explanation: 'Objects still live on the Heap.' },
        { id: 'c', text: 'It forces all classes to share one concrete base class', isCorrect: false, explanation: 'Interfaces allow polymorphism without concrete inheritance.' },
        { id: 'd', text: 'It runs without method lookup', isCorrect: false, explanation: 'Runtime polymorphism uses dynamic vtable dispatch.' },
      ],
    },
  },

  {
    id: 'oop-relationships',
    track: 'oops',
    trackLabel: 'OOPs Pillars',
    title: 'Association, Aggregation & Composition (UML Lifecycle)',
    shortTitle: 'Object Relationships',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Association = "uses/knows", Aggregation = "has-a (independent lifecycle)", Composition = "owns-a (child dies with parent)".',
    realWorldAnalogy:
      'Teacher & Student = Association (both exist independently). Team & Players = Aggregation (dissolve the team, players still exist). House & Rooms = Composition (demolish the house, rooms cease to exist).',
    whyItMatters:
      'Every Low-Level OOD interview expects you to draw and justify ownership lifecycles—deciding whether deleting an Order cascades to LineItems (Composition) vs Customers (Association).',
    keyTakeaways: [
      'Association (weakest): two objects communicate without owning each other (Driver <-> Car).',
      'Aggregation (hollow diamond ◇): container holds references to objects created outside (Playlist ◇— Songs).',
      'Composition (filled diamond ◆): parent creates and exclusively owns child parts (Order ◆— OrderItems).',
    ],
    commonMistakes: [
      'Confusing Aggregation and Composition in UML class diagrams.',
      'Deleting shared referenced entities when only a container was removed (accidental cascade delete).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: '1 · ASSOCIATION',
        title: 'Association: Independent Peers Communicating',
        caption:
          'Doctor and Patient know about each other during an appointment, but neither owns the other’s lifecycle.',
        nodes: [
          { id: 'a', label: 'Doctor', sublabel: 'Independent lifecycle', x: 25, y: 50, kind: 'object', state: 'active' },
          { id: 'b', label: 'Patient', sublabel: 'Independent lifecycle', x: 75, y: 50, kind: 'object', state: 'active' },
        ],
        edges: [
          { from: 'a', to: 'b', label: 'treats (Association)', style: 'solid', active: true },
        ],
        stateWatch: [
          { key: 'Ownership', value: 'None', tone: 'neutral' },
          { key: 'If Doctor Deleted', value: 'Patient survives', tone: 'good' },
        ],
      },
      {
        stepNumber: 2,
        badge: '2 · AGGREGATION ◇',
        title: 'Aggregation: Whole References External Parts',
        caption:
          'A Playlist holds Song references passed in from the MusicLibrary. Deleting the Playlist leaves every Song alive.',
        nodes: [
          { id: 'p', label: 'Playlist ◇', sublabel: 'Container deleted!', x: 24, y: 50, kind: 'broken', state: 'warn' },
          { id: 's1', label: 'Song A', sublabel: 'Still alive in Library!', x: 76, y: 30, kind: 'object', state: 'success' },
          { id: 's2', label: 'Song B', sublabel: 'Still alive in Library!', x: 76, y: 70, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'p', to: 's1', label: 'weak ref ◇', style: 'dashed', active: true },
          { from: 'p', to: 's2', label: 'weak ref ◇', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Relationship', value: 'Aggregation (HAS-A)', tone: 'good' },
          { key: 'Song Lifecycle', value: 'Independent', tone: 'good' },
        ],
      },
      {
        stepNumber: 3,
        badge: '3 · COMPOSITION ◆',
        title: 'Composition: Strict Ownership & Cascade Lifecycle',
        caption:
          'An Order creates and exclusively owns its OrderLineItems. Deleting the Order destroys its LineItems together.',
        nodes: [
          { id: 'o', label: 'Order ◆', sublabel: 'Exclusive Owner', x: 24, y: 50, kind: 'class', state: 'highlight' },
          { id: 'i1', label: 'OrderItem #1', sublabel: 'Bound to Order', x: 76, y: 30, kind: 'object', state: 'active' },
          { id: 'i2', label: 'OrderItem #2', sublabel: 'Bound to Order', x: 76, y: 70, kind: 'object', state: 'active' },
        ],
        edges: [
          { from: 'o', to: 'i1', label: 'owns ◆', style: 'call', active: true },
          { from: 'o', to: 'i2', label: 'owns ◆', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'Relationship', value: 'Composition (PART-OF)', tone: 'good' },
          { key: 'Delete Order', value: 'Cascades to Items', tone: 'warn' },
        ],
      },
    ],
    code: {
      badLabel: 'Leaking Internal Composed Parts',
      goodLabel: 'Clear Aggregation vs Composition Boundaries',
      explanation:
        'Accept external references via constructor for Aggregation (Song), and construct owned parts internally for Composition (OrderItem).',
      python: {
        bad: `# Mixing lifecycles: Playlist destroys external Song objects\nclass Playlist:\n    def delete(self):\n        for s in self.songs: s.permanently_erase()`,
        good: `class Playlist:  # Aggregation: songs live independently\n    def __init__(self, songs: list[Song]): self.songs = list(songs)\n\nclass Order:     # Composition: owns its line items\n    def __init__(self): self._items: list[OrderItem] = []\n    def add_item(self, sku: str, qty: int):\n        self._items.append(OrderItem(sku, qty))`,
      },
      java: {
        bad: `class Order {\n    public List<OrderItem> items; // External callers create/share items across orders\n}`,
        good: `class Order {\n    private final List<OrderItem> items = new ArrayList<>();\n    public void addItem(String sku, int qty) {\n        items.add(new OrderItem(sku, qty)); // Composition: created & owned by Order\n    }\n}`,
      },
      typescript: {
        bad: `class Playlist {\n  constructor(public songs: Song[]) {}\n  destroy() { this.songs.forEach(s => s.deleteFromDb()); }\n}`,
        good: `class Playlist { // Aggregation\n  constructor(private readonly songs: Song[]) {}\n}\nclass Order { // Composition\n  private readonly items: OrderItem[] = [];\n  addItem(sku: string, qty: number) { this.items.push(new OrderItem(sku, qty)); }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'In a Parking Lot OOD interview, what is the relationship between ParkingLot, Floor, and Car?',
        answer:
          'ParkingLot ◆— Floor is Composition (floors cannot exist without the lot). ParkingSpot ◇— Car is Aggregation/Association (cars drive in and out with completely independent lifecycles).',
      },
    ],
    quiz: {
      question: 'Which pair is the clearest example of Composition (strict lifecycle ownership)?',
      options: [
        { id: 'a', text: 'ShoppingCart and CartLineItem (line items only exist inside that cart)', isCorrect: true, explanation: 'Correct! Destroying the cart destroys its CartLineItems.' },
        { id: 'b', text: 'Department and Professor (professors survive if a department merges)', isCorrect: false, explanation: 'That is Aggregation—independent lifecycles.' },
        { id: 'c', text: 'Uber Driver and Rider', isCorrect: false, explanation: 'That is a temporary Association.' },
        { id: 'd', text: 'Library and Book', isCorrect: false, explanation: 'Books can move to another library (Aggregation).' },
      ],
    },
  },

  // ==========================================================================
  // TRACK 2: SOLID & CORE DESIGN PRINCIPLES (7 Topics)
  // ==========================================================================
  {
    id: 'solid-srp',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'S — Single Responsibility Principle (SRP)',
    shortTitle: 'SRP (Single Resp.)',
    difficulty: 'Beginner',
    oneSentenceRule:
      'A class or module should have ONE cohesive reason to change—tied to a single business actor or concern.',
    realWorldAnalogy:
      'In a restaurant, the Chef cooks, the Waiter takes orders, and the Cashier handles billing. If one person did all three, updating the POS billing system would stall the kitchen.',
    whyItMatters:
      'God classes cause merge conflicts, brittle side effects, and impossible unit tests. Splitting responsibilities keeps every class small, testable, and safe to evolve.',
    keyTakeaways: [
      'SRP does NOT mean "a class can only have 1 method"—it means all methods serve ONE cohesive responsibility.',
      'Test for SRP: describe the class without using the word "AND". ("Validates orders AND saves to SQL AND emails PDF receipts" = 3 classes!).',
      'Each separated class can be unit-tested in isolation with zero unrelated mocks.',
    ],
    commonMistakes: [
      'Over-fragmenting into 50 single-line classes (excessive indirection).',
      'Mixing domain calculation, database SQL queries, and email/HTTP formatting in the same class.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · GOD CLASS',
        title: 'InvoiceManager Does Everything (3 Reasons to Change)',
        caption:
          'Tax rules change? Edit InvoiceManager. Switch DB? Edit InvoiceManager. New PDF layout? Edit InvoiceManager -> merge conflicts & regressions!',
        nodes: [
          { id: 'god', label: 'InvoiceManager (God Class)', sublabel: '3 tangled responsibilities', x: 50, y: 50, kind: 'broken', state: 'error', fields: ['calculateTax()', 'saveToPostgres()', 'renderPdfAndEmail()'] },
        ],
        edges: [],
        stateWatch: [
          { key: 'Reasons to Change', value: '3 (Finance, DB, Email)', tone: 'bad' },
          { key: 'Unit Test Needs', value: 'Live DB + SMTP!', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · COHESIVE SPLIT',
        title: 'Split Into 3 Focused Single-Purpose Collaborators',
        caption:
          'TaxCalculator handles pure math, InvoiceRepository handles DB storage, and InvoiceNotifier sends emails. Each changes independently!',
        nodes: [
          { id: 'orch', label: 'InvoiceService', sublabel: 'Coordinates workflow', x: 20, y: 50, kind: 'client', state: 'highlight' },
          { id: 'tax', label: 'TaxCalculator', sublabel: 'Pure math (0 deps)', x: 76, y: 20, kind: 'class', state: 'success' },
          { id: 'repo', label: 'InvoiceRepo', sublabel: 'DB persistence only', x: 76, y: 50, kind: 'class', state: 'success' },
          { id: 'mail', label: 'InvoiceNotifier', sublabel: 'Email/PDF only', x: 76, y: 80, kind: 'class', state: 'success' },
        ],
        edges: [
          { from: 'orch', to: 'tax', label: '1. compute', style: 'call', active: true },
          { from: 'orch', to: 'repo', label: '2. save', style: 'call', active: true },
          { from: 'orch', to: 'mail', label: '3. notify', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'TaxCalculator Test', value: '1ms pure unit test', tone: 'good' },
          { key: 'Blast Radius', value: 'Isolated to 1 class', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'God Class Mixing Tax, DB & Email',
      goodLabel: 'Separated Cohesive Classes',
      explanation:
        'Separating math, storage, and email lets you test TaxCalculator in 1ms without spinning up Postgres or an SMTP server.',
      python: {
        bad: `class Invoice:\n    def process(self, items, email):\n        total = sum(items) * 1.18\n        db.execute("INSERT INTO invoices ...", total)\n        smtp.send(email, f"Paid {total}")`,
        good: `class TaxCalculator:\n    def total_with_tax(self, items: list[float]) -> float:\n        return sum(items) * 1.18\n\nclass InvoiceRepo:\n    def save(self, total: float): ...\n\nclass InvoiceNotifier:\n    def send_receipt(self, email: str, total: float): ...`,
      },
      java: {
        bad: `class InvoiceManager {\n    void process(List<Double> items, String email) {\n        double total = items.stream().mapToDouble(Double::doubleValue).sum() * 1.18;\n        jdbc.update("INSERT ...", total);\n        mailer.send(email, "Receipt: " + total);\n    }\n}`,
        good: `class TaxCalculator { double compute(List<Double> items) { return items.stream().mapToDouble(Double::doubleValue).sum() * 1.18; } }\nclass InvoiceRepo { void save(double total) { /* DB only */ } }\nclass InvoiceNotifier { void send(String email, double total) { /* Email only */ } }`,
      },
      typescript: {
        bad: `class InvoiceManager {\n  async process(items: number[], email: string) {\n    const total = items.reduce((a, b) => a + b, 0) * 1.18;\n    await db.insert('invoices', { total });\n    await mailer.send(email, \`Paid \${total}\`);\n  }\n}`,
        good: `class TaxCalculator { total(items: number[]) { return items.reduce((a, b) => a + b, 0) * 1.18; } }\nclass InvoiceRepo { save(total: number) { /* DB only */ } }\nclass InvoiceNotifier { send(email: string, total: number) { /* Email only */ } }`,
      },
    },
    interviewQa: [
      {
        question: 'Does SRP mean every class should have only one method?',
        answer:
          'No! A UserRepository can have findById, save, and delete—all serving the single responsibility of user persistence. SRP is about cohesion and single actor/reason to change, not method count.',
      },
    ],
    quiz: {
      question: 'What is the clearest sign that a class violates Single Responsibility Principle (SRP)?',
      options: [
        { id: 'a', text: 'Changes to unrelated concerns (like DB schema AND email formatting) both force edits to the same class', isCorrect: true, explanation: 'Correct! Multiple independent reasons to change indicate tangled responsibilities.' },
        { id: 'b', text: 'The class has more than 3 methods', isCorrect: false, explanation: 'A cohesive class can have many related methods.' },
        { id: 'c', text: 'The class uses private fields', isCorrect: false, explanation: 'Private fields are good encapsulation.' },
        { id: 'd', text: 'The class implements an interface', isCorrect: false, explanation: 'Implementing interfaces supports abstraction and DIP.' },
      ],
    },
  },

  {
    id: 'solid-ocp',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'O — Open / Closed Principle (OCP)',
    shortTitle: 'OCP (Open/Closed)',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Software entities should be OPEN for extension (adding new behaviors), but CLOSED for modification (do not keep editing tested core code).',
    realWorldAnalogy:
      'A USB-C port is CLOSED for modification (you never solder wires inside your laptop) yet OPEN for extension (plug in a mouse, monitor, SSD, or microphone).',
    whyItMatters:
      'Every time you open a battle-tested PricingEngine to add `else if (type == "VIP_FESTIVAL")`, you risk breaking existing promo codes. Extensions isolate risk to new classes.',
    keyTakeaways: [
      'Spot OCP violations by looking for growing `if/else` or `switch` blocks on type strings.',
      'Fix OCP violations using Interfaces + Polymorphism (Strategy / Plugin pattern).',
      'New features become additive (new file + new unit tests) with zero edits to core logic.',
    ],
    commonMistakes: [
      'Adding `switch (discountType)` across 4 different services so every new promo requires touching 4 files.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · MODIFICATION RISK',
        title: 'Growing if/else Inside Core PricingEngine',
        caption:
          'Adding a new "BlackFriday" discount forces editing tested code inside PricingEngine, risking regressions on Student & Seasonal discounts.',
        nodes: [
          { id: 'eng', label: 'PricingEngine (Modified!)', sublabel: 'if REGULAR / else if VIP / else if ...', x: 50, y: 50, kind: 'broken', state: 'error', fields: ['Edit #14 -> Regression risk!'] },
        ],
        edges: [],
        stateWatch: [
          { key: 'Core File Edits', value: 'Every new promo!', tone: 'bad' },
          { key: 'Regression Risk', value: 'High', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · PLUGIN SLOT',
        title: 'PricingEngine Depends on DiscountPolicy Interface',
        caption:
          'PricingEngine is now CLOSED—it just calls policy.apply(price). StudentDiscount and VipDiscount plug in cleanly.',
        nodes: [
          { id: 'eng', label: 'PricingEngine', sublabel: 'CLOSED (Never edited)', x: 18, y: 50, kind: 'client', state: 'success' },
          { id: 'iface', label: '«interface» DiscountPolicy', sublabel: 'apply(price)', x: 50, y: 50, kind: 'interface', state: 'highlight' },
          { id: 'p1', label: 'StudentDiscount', sublabel: '-15%', x: 84, y: 26, kind: 'class', state: 'idle' },
          { id: 'p2', label: 'VipDiscount', sublabel: '-25%', x: 84, y: 74, kind: 'class', state: 'idle' },
        ],
        edges: [
          { from: 'eng', to: 'iface', label: 'apply(price)', style: 'call', active: true },
          { from: 'p1', to: 'iface', label: 'impl', style: 'inherit', active: false },
          { from: 'p2', to: 'iface', label: 'impl', style: 'inherit', active: false },
        ],
        stateWatch: [
          { key: 'PricingEngine Diff', value: '0 lines', tone: 'good' },
        ],
      },
      {
        stepNumber: 3,
        badge: 'STEP 3 · ADD NEW FEATURE',
        title: 'Plug In FestivalDiscount With Zero Core Edits',
        caption:
          'Add FestivalDiscount.ts implementing DiscountPolicy. Existing tested classes remain untouched!',
        nodes: [
          { id: 'eng', label: 'PricingEngine', sublabel: '0 edits!', x: 18, y: 50, kind: 'client', state: 'success' },
          { id: 'iface', label: '«interface» DiscountPolicy', sublabel: 'apply(price)', x: 50, y: 50, kind: 'interface', state: 'highlight' },
          { id: 'p3', label: 'FestivalDiscount (NEW)', sublabel: '-40% cap $50', x: 84, y: 50, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'eng', to: 'iface', label: 'apply(price)', style: 'call', active: true },
          { from: 'p3', to: 'iface', label: 'plugged in!', style: 'inherit', active: true },
        ],
        stateWatch: [
          { key: 'New Feature', value: 'Additive file only', tone: 'good' },
          { key: 'Existing Tests', value: '100% Untouched', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Modifying Core Switch Every Sprint',
      goodLabel: 'Open for Extension via DiscountPolicy',
      explanation:
        'Turning conditional branches into DiscountPolicy implementations keeps PricingEngine permanently closed to modification.',
      python: {
        bad: `def apply_discount(price, kind):\n    if kind == "student": return price * 0.85\n    elif kind == "vip": return price * 0.75\n    # Must edit this function for every new promo!`,
        good: `class DiscountPolicy:\n    def apply(self, price: float) -> float: raise NotImplementedError\n\nclass FestivalDiscount(DiscountPolicy):\n    def apply(self, price: float) -> float: return max(0, price - min(price * 0.4, 50))\n\ndef checkout(price: float, policy: DiscountPolicy) -> float:\n    return policy.apply(price)`,
      },
      java: {
        bad: `double discount(double price, String type) {\n    if (type.equals("VIP")) return price * 0.75;\n    if (type.equals("STUDENT")) return price * 0.85;\n    return price;\n}`,
        good: `interface DiscountPolicy { double apply(double price); }\nclass FestivalDiscount implements DiscountPolicy {\n    public double apply(double p) { return p - Math.min(p * 0.4, 50); }\n}\ndouble checkout(double price, DiscountPolicy policy) { return policy.apply(price); }`,
      },
      typescript: {
        bad: `function discount(price: number, kind: string) {\n  if (kind === 'VIP') return price * 0.75;\n  if (kind === 'STUDENT') return price * 0.85;\n  return price;\n}`,
        good: `interface DiscountPolicy { apply(price: number): number; }\nclass FestivalDiscount implements DiscountPolicy {\n  apply(price: number) { return price - Math.min(price * 0.4, 50); }\n}\nconst checkout = (price: number, policy: DiscountPolicy) => policy.apply(price);`,
      },
    },
    interviewQa: [
      {
        question: 'Does OCP mean you can never fix bugs in an existing class?',
        answer:
          'Of course you edit a class to fix bugs! OCP means you should not have to modify stable, working core logic merely to add a new variant or rule.',
      },
    ],
    quiz: {
      question: 'Which pattern most commonly enforces the Open/Closed Principle?',
      options: [
        { id: 'a', text: 'Strategy / Interface-based Polymorphism so new behaviors plug in as new classes', isCorrect: true, explanation: 'Correct! Strategy lets you extend behavior additively without modifying the host class.' },
        { id: 'b', text: 'Adding more else-if branches inside one central utility function', isCorrect: false, explanation: 'That directly violates OCP.' },
        { id: 'c', text: 'Making every field public', isCorrect: false, explanation: 'Public fields violate encapsulation, not OCP.' },
        { id: 'd', text: 'Using Singleton everywhere', isCorrect: false, explanation: 'Singleton restricts instantiation; it does not provide extensibility.' },
      ],
    },
  },

  {
    id: 'solid-lsp',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'L — Liskov Substitution Principle (LSP)',
    shortTitle: 'LSP (Substitution)',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Any subclass must be safely substitutable for its parent type without breaking expectations, throwing surprise errors, or weakening contracts.',
    realWorldAnalogy:
      'If a coffee machine expects any AA Battery, sliding in a rechargeable AA Battery must work seamlessly. A dummy plastic battery that throws "NotSupported" breaks substitution.',
    whyItMatters:
      'Classic trap: `Square extends Rectangle` seems true in math, yet `rect.setWidth(5); rect.setHeight(4)` expects area = 20, while Square mutates both sides and returns 16!',
    keyTakeaways: [
      'Subtypes must honor the parent’s behavioral contract, not just its method names.',
      'Red flag for LSP violation: throwing `UnsupportedOperationException` in an overridden method (e.g., Penguin.fly()).',
      'Fix LSP violations by modeling shared abstractions accurately (Shape interface instead of Square extends Rectangle; Bird vs FlyingBird).',
    ],
    commonMistakes: [
      'Modeling real-world math nouns with mutable inheritance (Square extends Rectangle).',
      'Having ReadOnlyFile extend WritableFile and throwing an exception inside write().',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · LSP TRAP',
        title: 'Square Extends Mutable Rectangle Breaks Contract',
        caption:
          'Test expects Rectangle: setWidth(5) then setHeight(4) -> area MUST be 20. Passing Square silently overwrites width to 4 -> area = 16!',
        nodes: [
          { id: 'test', label: 'resizeTest(Rectangle r)', sublabel: 'r.setW(5); r.setH(4); assert(20)', x: 20, y: 50, kind: 'client', state: 'active' },
          { id: 'sq', label: 'Square extends Rect', sublabel: 'setH(4) overwrites W=4!', x: 76, y: 50, kind: 'broken', state: 'error', fields: ['area() = 16 != 20!'] },
        ],
        edges: [
          { from: 'test', to: 'sq', label: 'ASSERTION FAILED', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Expected Area', value: '20', tone: 'neutral' },
          { key: 'Actual Square Area', value: '16 (BROKEN!)', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · CLEAN CONTRACT',
        title: 'Both Implement Immutable Shape Interface',
        caption:
          'Rectangle and Square are sibling implementations of Shape { area() }. Neither promises contradictory mutable setters!',
        nodes: [
          { id: 'iface', label: '«interface» Shape', sublabel: 'area(): number', x: 50, y: 20, kind: 'interface', state: 'highlight' },
          { id: 'rect', label: 'Rectangle(5, 4)', sublabel: 'area() -> 20', x: 25, y: 74, kind: 'object', state: 'success' },
          { id: 'sq', label: 'Square(4)', sublabel: 'area() -> 16', x: 75, y: 74, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'rect', to: 'iface', label: 'implements', style: 'inherit', active: true },
          { from: 'sq', to: 'iface', label: 'implements', style: 'inherit', active: true },
        ],
        stateWatch: [
          { key: 'Substitutability', value: '100% Safe', tone: 'good' },
          { key: 'Surprise Exceptions', value: '0', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Penguin Throws on Inherited fly()',
      goodLabel: 'Accurate Capability Hierarchy',
      explanation:
        'Only birds that genuinely fly implement Flyable, so callers never receive an unexpected UnsupportedOperationException.',
      python: {
        bad: `class Bird:\n    def fly(self): return "flying"\n\nclass Penguin(Bird):\n    def fly(self): raise NotImplementedError("Penguins can't fly!")`,
        good: `class Bird:\n    def eat(self): return "eating"\n\nclass FlyingBird(Bird):\n    def fly(self): return "flying"\n\nclass Penguin(Bird):\n    def swim(self): return "swimming"`,
      },
      java: {
        bad: `class Bird { void fly() {} }\nclass Penguin extends Bird {\n    @Override void fly() { throw new UnsupportedOperationException(); }\n}`,
        good: `interface Bird { void eat(); }\ninterface Flyable extends Bird { void fly(); }\nclass Sparrow implements Flyable { public void eat() {} public void fly() {} }\nclass Penguin implements Bird { public void eat() {} void swim() {} }`,
      },
      typescript: {
        bad: `class Bird { fly() { return 'flying'; } }\nclass Penguin extends Bird {\n  fly(): never { throw new Error('Cannot fly'); } // Breaks LSP!\n}`,
        good: `interface Bird { eat(): void; }\ninterface FlyableBird extends Bird { fly(): void; }\nclass Penguin implements Bird { eat() {} swim() {} }`,
      },
    },
    interviewQa: [
      {
        question: 'Why does mathematical "Square IS-A Rectangle" fail in OOP?',
        answer:
          'In math, shapes are immutable values. In mutable OOP, Rectangle promises independent width and height mutations, which Square cannot honor without breaking its own equal-sides invariant.',
      },
    ],
    quiz: {
      question: 'Which code smell almost always signals a Liskov Substitution Principle (LSP) violation?',
      options: [
        { id: 'a', text: 'A subclass overriding a parent method solely to throw UnsupportedOperationException', isCorrect: true, explanation: 'Correct! Callers expecting the parent contract will crash when handed that subclass.' },
        { id: 'b', text: 'A class having a constructor with 2 parameters', isCorrect: false, explanation: 'Constructor parameters do not violate LSP.' },
        { id: 'c', text: 'Two classes implementing the same interface', isCorrect: false, explanation: 'That is standard polymorphism.' },
        { id: 'd', text: 'Using private helper methods inside a subclass', isCorrect: false, explanation: 'Private helpers are valid encapsulation.' },
      ],
    },
  },

  {
    id: 'solid-isp',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'I — Interface Segregation Principle (ISP)',
    shortTitle: 'ISP (Segregation)',
    difficulty: 'Beginner',
    oneSentenceRule:
      'Never force a class to implement bloated "fat" interfaces containing methods it does not need—split into small role-specific interfaces.',
    realWorldAnalogy:
      'A restaurant menu splits into Drinks, Mains, and Vegan menus instead of handing every customer a 400-page encyclopedia where 95% does not apply.',
    whyItMatters:
      'Fat interfaces force dummy empty methods, create LSP traps, and cause cascading recompilations whenever an unrelated method changes.',
    keyTakeaways: [
      'Many small, client-specific interfaces beat one giant all-purpose interface.',
      'Classes compose only the exact roles they support (e.g., `implements Printer, Scanner`).',
      'ISP prevents accidental LSP violations by removing unimplementable methods from contracts.',
    ],
    commonMistakes: [
      'Designing a mega `Worker` interface with `code()`, `design()`, `manageBudget()`, and `driveDeliveryTruck()`.',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · FAT INTERFACE',
        title: 'MultiFunctionMachine Forces BasicPrinter to Stub Fax & Scan',
        caption:
          'BasicPrinter only prints, yet the giant Machine interface forces it to implement scan() and fax() with throw Error()!',
        nodes: [
          { id: 'fat', label: '«interface» AllInOneMachine', sublabel: 'print(), scan(), fax(), staple()', x: 50, y: 22, kind: 'broken', state: 'error' },
          { id: 'bp', label: 'BasicPrinter', sublabel: 'scan() -> THROW! fax() -> THROW!', x: 50, y: 74, kind: 'broken', state: 'error' },
        ],
        edges: [
          { from: 'bp', to: 'fat', label: 'forced to implement 3 unused methods', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Unused Stubs', value: '3 dead methods', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · ROLE INTERFACES',
        title: 'Segregate Into Printable, Scannable & Faxable',
        caption:
          'BasicPrinter implements ONLY Printable. OfficeCopier implements Printable + Scannable. Clean, zero dead code!',
        nodes: [
          { id: 'ip', label: '«interface» Printable', sublabel: 'print()', x: 24, y: 22, kind: 'interface', state: 'highlight' },
          { id: 'is', label: '«interface» Scannable', sublabel: 'scan()', x: 76, y: 22, kind: 'interface', state: 'highlight' },
          { id: 'bp', label: 'BasicPrinter', sublabel: 'print() only', x: 24, y: 74, kind: 'object', state: 'success' },
          { id: 'oc', label: 'OfficeCopier', sublabel: 'print() + scan()', x: 76, y: 74, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'bp', to: 'ip', label: 'impl', style: 'inherit', active: true },
          { from: 'oc', to: 'ip', label: 'impl', style: 'inherit', active: true },
          { from: 'oc', to: 'is', label: 'impl', style: 'inherit', active: true },
        ],
        stateWatch: [
          { key: 'Dead Stubs', value: '0', tone: 'good' },
          { key: 'Coupling', value: 'Minimal & Role-Scoped', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Fat Interface Forcing Dummy Stubs',
      goodLabel: 'Lean Role-Specific Interfaces',
      explanation:
        'Splitting AllInOne into Printable and Scannable keeps BasicPrinter clean and lets OfficeCopier compose both.',
      python: {
        bad: `class Machine(ABC):\n    @abstractmethod def print(self): ...\n    @abstractmethod def scan(self): ...\n\nclass BasicPrinter(Machine):\n    def print(self): print("Printing")\n    def scan(self): raise NotImplementedError()`,
        good: `class Printable(ABC):\n    @abstractmethod def print_doc(self): ...\n\nclass Scannable(ABC):\n    @abstractmethod def scan_doc(self): ...\n\nclass BasicPrinter(Printable):\n    def print_doc(self): print("Printing")`,
      },
      java: {
        bad: `interface Machine { void print(); void scan(); void fax(); }\nclass BasicPrinter implements Machine {\n    public void print() {}\n    public void scan() { throw new UnsupportedOperationException(); }\n    public void fax() { throw new UnsupportedOperationException(); }\n}`,
        good: `interface Printable { void print(); }\ninterface Scannable { void scan(); }\nclass BasicPrinter implements Printable { public void print() {} }\nclass OfficeCopier implements Printable, Scannable {\n    public void print() {}\n    public void scan() {}\n}`,
      },
      typescript: {
        bad: `interface Machine { print(): void; scan(): void; fax(): void; }\nclass BasicPrinter implements Machine {\n  print() {}\n  scan() { throw new Error('N/A'); }\n  fax() { throw new Error('N/A'); }\n}`,
        good: `interface Printable { print(): void; }\ninterface Scannable { scan(): void; }\nclass BasicPrinter implements Printable { print() {} }\nclass OfficeCopier implements Printable, Scannable { print() {} scan() {} }`,
      },
    },
    interviewQa: [
      {
        question: 'How do SRP and ISP relate to each other?',
        answer:
          'SRP applies to class implementations (one reason to change internally); ISP applies to interfaces from the client’s point of view (clients should not see methods they never call).',
      },
    ],
    quiz: {
      question: 'What is the primary goal of the Interface Segregation Principle (ISP)?',
      options: [
        { id: 'a', text: 'Prevent classes from depending on interface methods they do not use', isCorrect: true, explanation: 'Correct! Small role interfaces keep implementations clean and decoupled.' },
        { id: 'b', text: 'Merge all project interfaces into one central super-interface', isCorrect: false, explanation: 'That is the exact opposite of ISP.' },
        { id: 'c', text: 'Ban interfaces in favor of concrete classes', isCorrect: false, explanation: 'ISP encourages smaller, focused interfaces.' },
        { id: 'd', text: 'Require every method to be static', isCorrect: false, explanation: 'ISP is about interface cohesion, not static methods.' },
      ],
    },
  },

  {
    id: 'solid-dip',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'D — Dependency Inversion Principle (DIP)',
    shortTitle: 'DIP (Dep. Inversion)',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'High-level business logic must NOT depend on low-level concrete drivers (MySQL, Stripe)—BOTH should depend on an abstraction (interface), injected from outside.',
    realWorldAnalogy:
      'A lamp does not solder itself directly to the power plant’s copper cables. Both the lamp and the wall wiring depend on a standard wall-outlet interface.',
    whyItMatters:
      'DIP + Dependency Injection (DI) is the backbone of modern testable backend architecture (Spring, NestJS, Clean Architecture). You can test business logic in milliseconds with an InMemoryRepository.',
    keyTakeaways: [
      'Never do `new MySqlDatabase()` directly inside core OrderService business logic.',
      'Pass dependencies through the constructor (`constructor(repo: OrderRepository)`).',
      'The arrow of source-code dependency INVERTS: MySqlOrderRepo now points UP to OrderRepository owned by the domain!',
    ],
    commonMistakes: [
      'Confusing Dependency Inversion (the principle) with Dependency Injection (the technique of passing dependencies via constructor).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · DIRECT COUPLING',
        title: 'OrderService Hard-Codes new MySqlDatabase()',
        caption:
          'High-level OrderService points directly down to low-level MySqlDatabase. Switching to Postgres or writing fast offline tests is painful.',
        nodes: [
          { id: 'svc', label: 'OrderService (High-Level)', sublabel: 'new MySqlDatabase()', x: 50, y: 24, kind: 'broken', state: 'error' },
          { id: 'db', label: 'MySqlDatabase (Low-Level)', sublabel: 'Concrete SQL driver', x: 50, y: 76, kind: 'class', state: 'active' },
        ],
        edges: [
          { from: 'svc', to: 'db', label: 'hard-coded coupling', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Dependency Arrow', value: 'High -> Low (Rigid)', tone: 'bad' },
          { key: 'Offline Unit Test', value: 'Impossible without MySQL', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · INVERTED ARROW',
        title: 'Both Depend on OrderRepository Interface',
        caption:
          'OrderService depends on «interface» OrderRepository. MySqlRepo & InMemoryRepo implement it and are injected via constructor!',
        nodes: [
          { id: 'svc', label: 'OrderService', sublabel: 'Injected via constructor', x: 18, y: 50, kind: 'client', state: 'success' },
          { id: 'port', label: '«interface» OrderRepo', sublabel: 'save(order)', x: 52, y: 50, kind: 'interface', state: 'highlight' },
          { id: 'mysql', label: 'PostgresOrderRepo', sublabel: 'Production adapter', x: 85, y: 26, kind: 'class', state: 'active' },
          { id: 'mem', label: 'InMemoryOrderRepo', sublabel: '1ms Test double', x: 85, y: 74, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'svc', to: 'port', label: 'depends on', style: 'call', active: true },
          { from: 'mysql', to: 'port', label: 'implements (inverted!)', style: 'inherit', active: true },
          { from: 'mem', to: 'port', label: 'implements (inverted!)', style: 'inherit', active: true },
        ],
        stateWatch: [
          { key: 'Dependency Arrow', value: 'Inverted to Interface', tone: 'good' },
          { key: 'Test Runtime', value: '< 1ms InMemory', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Hard-Coded Low-Level Driver',
      goodLabel: 'Constructor-Injected Interface (DIP)',
      explanation:
        'Injecting OrderRepository via the constructor flips ownership so OrderService has zero imports from Postgres or Mongo.',
      python: {
        bad: `class OrderService:\n    def __init__(self):\n        self.db = MySqlDriver("localhost")  # Tightly coupled!\n    def place(self, order): self.db.insert_row(order)`,
        good: `class OrderRepo(ABC):\n    @abstractmethod def save(self, order: dict) -> None: ...\n\nclass OrderService:\n    def __init__(self, repo: OrderRepo):  # Injected abstraction\n        self.repo = repo\n    def place(self, order: dict): self.repo.save(order)`,
      },
      java: {
        bad: `class OrderService {\n    private final MySqlRepo db = new MySqlRepo();\n    void place(Order o) { db.save(o); }\n}`,
        good: `interface OrderRepo { void save(Order o); }\nclass OrderService {\n    private final OrderRepo repo;\n    OrderService(OrderRepo repo) { this.repo = repo; }\n    void place(Order o) { repo.save(o); }\n}`,
      },
      typescript: {
        bad: `class OrderService {\n  private db = new PostgresDriver();\n  place(order: Order) { return this.db.query('INSERT ...'); }\n}`,
        good: `interface OrderRepo { save(order: Order): Promise<void>; }\nclass OrderService {\n  constructor(private readonly repo: OrderRepo) {}\n  place(order: Order) { return this.repo.save(order); }\n}`,
      },
    },
    interviewQa: [
      {
        question: 'What is the difference between DIP, Dependency Injection (DI), and IoC Container?',
        answer:
          'DIP is the design principle (depend on abstractions). DI is the pattern of passing dependencies in (constructor/method injection) instead of calling `new`. An IoC Container (like Spring) is a framework that wires DI automatically.',
      },
    ],
    quiz: {
      question: 'How does Dependency Inversion (DIP) make backend services easier to unit-test?',
      options: [
        { id: 'a', text: 'You can inject a fast in-memory fake/mock implementing the repository interface without touching a real database', isCorrect: true, explanation: 'Correct! Decoupling via an interface makes swapping real drivers for test doubles trivial.' },
        { id: 'b', text: 'It automatically generates database migrations', isCorrect: false, explanation: 'DIP is about source-code decoupling, not migrations.' },
        { id: 'c', text: 'It removes the need for constructors', isCorrect: false, explanation: 'Constructor injection is the most common way to apply DIP.' },
        { id: 'd', text: 'It makes all methods global', isCorrect: false, explanation: 'Global state makes testing harder.' },
      ],
    },
  },

  {
    id: 'principle-dry-kiss-yagni',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'DRY, KISS & YAGNI — Pragmatic Engineering Guardrails',
    shortTitle: 'DRY · KISS · YAGNI',
    difficulty: 'Beginner',
    oneSentenceRule:
      'DRY = Single source of truth for knowledge; KISS = Simplest working design wins; YAGNI = Never build speculative abstractions before they are needed.',
    realWorldAnalogy:
      'Pack only the gear for today’s hike (YAGNI), keep your pack easy to open (KISS), and carry ONE master map instead of 3 hand-drawn copies that go out of sync (DRY).',
    whyItMatters:
      'Junior engineers often over-engineer ("AbstractFactoryBuilderProxy" for 1 class), violating KISS & YAGNI, OR copy-paste tax formulas across 5 files, violating DRY. Mastery is balancing all three.',
    keyTakeaways: [
      'DRY applies to BUSINESS KNOWLEDGE (rules/constants), not accidental similarity between two unrelated modules.',
      'Wrong abstraction is worse than duplication—wait for the "Rule of Three" before extracting a shared helper.',
      'KISS & YAGNI protect teams from maintenance debt caused by unused "just-in-case" frameworks.',
    ],
    commonMistakes: [
      'Forcing two unrelated features into one messy shared function just because 4 lines look similar (Bad DRY).',
      'Building multi-tenant plugin engines when the product has 1 tenant (YAGNI violation).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'TRAP · OVER-ENGINEERING',
        title: 'Violating KISS & YAGNI With Speculative Layers',
        caption:
          'A simple email sender wrapped in 5 unused factory/proxy layers slows onboarding and adds bugs for requirements that never arrive.',
        nodes: [
          { id: 'c', label: 'App', sublabel: 'Wants to send email', x: 14, y: 50, kind: 'client', state: 'active' },
          { id: 'f1', label: 'AbstractBrokerFactory', sublabel: 'Unused layer', x: 42, y: 50, kind: 'broken', state: 'error' },
          { id: 'f2', label: 'DynamicStrategyProxy', sublabel: 'Unused layer', x: 70, y: 50, kind: 'broken', state: 'error' },
          { id: 's', label: 'sendEmail()', sublabel: '3 actual lines', x: 90, y: 50, kind: 'object', state: 'idle' },
        ],
        edges: [
          { from: 'c', to: 'f1', label: 'hop 1', style: 'blocked', active: true },
          { from: 'f1', to: 'f2', label: 'hop 2', style: 'blocked', active: true },
          { from: 'f2', to: 's', label: 'hop 3', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Complexity', value: 'Bloated (4 files)', tone: 'bad' },
          { key: 'YAGNI Check', value: 'FAILED', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'CLEAN · PRAGMATIC BALANCE',
        title: 'Direct, Readable, Single-Source-of-Truth Design',
        caption:
          'One clean Mailer interface + one shared TAX_RATE constant. Simple to read today (KISS), one truth (DRY), extensible when a real second provider arrives (YAGNI).',
        nodes: [
          { id: 'c', label: 'OrderService', sublabel: 'Clean & readable', x: 24, y: 50, kind: 'client', state: 'success' },
          { id: 'tax', label: 'TAX_RATE = 0.18', sublabel: 'DRY Single Truth', x: 76, y: 28, kind: 'object', state: 'success' },
          { id: 'mail', label: 'sendEmail()', sublabel: 'KISS Direct Call', x: 76, y: 72, kind: 'object', state: 'success' },
        ],
        edges: [
          { from: 'c', to: 'tax', label: 'reads truth', style: 'call', active: true },
          { from: 'c', to: 'mail', label: 'direct call', style: 'call', active: true },
        ],
        stateWatch: [
          { key: 'DRY / KISS / YAGNI', value: 'BALANCED', tone: 'good' },
          { key: 'Onboarding Time', value: 'Seconds', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Duplicated Magic Numbers (Violates DRY)',
      goodLabel: 'Single Source of Truth + Simple Function',
      explanation:
        'Centralize business constants once without inventing unnecessary factory hierarchies.',
      python: {
        bad: `def cart_tax(subtotal): return subtotal * 0.18\ndef invoice_tax(subtotal): return subtotal * 0.18\n# Tax changes to 20% -> one file gets forgotten!`,
        good: `VAT_RATE = 0.18  # Single source of truth (DRY + KISS)\ndef compute_tax(subtotal: float) -> float:\n    return round(subtotal * VAT_RATE, 2)`,
      },
      java: {
        bad: `double cartTax(double x) { return x * 0.18; }\ndouble refundTax(double x) { return x * 0.18; }`,
        good: `final class TaxRules {\n    static final double VAT_RATE = 0.18;\n    static double compute(double subtotal) { return subtotal * VAT_RATE; }\n}`,
      },
      typescript: {
        bad: `const cartTax = (s: number) => s * 0.18;\nconst invoiceTax = (s: number) => s * 0.18;`,
        good: `export const VAT_RATE = 0.18;\nexport const computeTax = (subtotal: number) => Number((subtotal * VAT_RATE).toFixed(2));`,
      },
    },
    interviewQa: [
      {
        question: 'When is duplicating code actually BETTER than DRY?',
        answer:
          'When two pieces of code belong to different bounded contexts that merely look similar today but will evolve independently (e.g., Customer Address validation vs Warehouse Shipping Address validation).',
      },
    ],
    quiz: {
      question: 'Which scenario best illustrates a YAGNI ("You Aren’t Gonna Need It") violation?',
      options: [
        { id: 'a', text: 'Spending 2 weeks building a custom plugin DSL for a feature no customer has requested yet', isCorrect: true, explanation: 'Correct! Build for proven requirements first, keep code clean so you can refactor later.' },
        { id: 'b', text: 'Writing unit tests for checkout payment logic', isCorrect: false, explanation: 'Unit tests protect real production logic.' },
        { id: 'c', text: 'Extracting a shared VAT_RATE constant used in 4 places', isCorrect: false, explanation: 'That is healthy DRY.' },
        { id: 'd', text: 'Validating user input at API boundaries', isCorrect: false, explanation: 'Input validation is essential security hygiene.' },
      ],
    },
  },

  {
    id: 'principle-lod',
    track: 'solid',
    trackLabel: 'SOLID & Principles',
    title: 'Law of Demeter (Principle of Least Knowledge)',
    shortTitle: 'Law of Demeter',
    difficulty: 'Intermediate',
    oneSentenceRule:
      'Talk only to your immediate friends—avoid "train-wreck" chains like `order.getCustomer().getWallet().getBalance()`.',
    realWorldAnalogy:
      'When paying a cashier, you hand them $20 (Tell, Don’t Ask). The cashier does NOT reach into your pocket, pull out your wallet, open the zipper, and take cash themselves.',
    whyItMatters:
      'Train-wreck chains couple a caller to the internal object graph 3 levels deep. Refactoring `Wallet` breaks every distant service that poked into it.',
    keyTakeaways: [
      'Follow "Tell, Don’t Ask": call `customer.pay(amount)` instead of asking for `customer.getWallet().deduct(amount)`.',
      'Note: Fluent builders (`list.filter(...).map(...)`) are NOT LoD violations because every call returns the same stream/builder abstraction.',
      'Reduces NullPointerExceptions across deep object graphs.',
    ],
    commonMistakes: [
      'Reaching through 3+ getters across domain entities (`a.getB().getC().mutate()`).',
    ],
    frames: [
      {
        stepNumber: 1,
        badge: 'BEFORE · TRAIN WRECK',
        title: 'Cashier Reaches Deep Into Customer’s Wallet',
        caption:
          'Checkout calls customer.getWallet().getCard().charge(50). If Wallet structure changes, Checkout crashes!',
        nodes: [
          { id: 'chk', label: 'Checkout', sublabel: 'Coupled to 3 classes!', x: 14, y: 50, kind: 'broken', state: 'error' },
          { id: 'cust', label: 'Customer', sublabel: '.getWallet()', x: 40, y: 50, kind: 'object', state: 'warn' },
          { id: 'wal', label: 'Wallet', sublabel: '.getCard()', x: 66, y: 50, kind: 'object', state: 'warn' },
          { id: 'card', label: 'Card', sublabel: '.charge(50)', x: 88, y: 50, kind: 'object', state: 'error' },
        ],
        edges: [
          { from: 'chk', to: 'cust', label: '1', style: 'blocked', active: true },
          { from: 'cust', to: 'wal', label: '2', style: 'blocked', active: true },
          { from: 'wal', to: 'card', label: '3', style: 'blocked', active: true },
        ],
        stateWatch: [
          { key: 'Coupled Classes', value: '3 deep (Brittle)', tone: 'bad' },
        ],
      },
      {
        stepNumber: 2,
        badge: 'AFTER · TELL, DON’T ASK',
        title: 'Checkout Talks Only to Customer.pay(50)',
        caption:
          'Checkout delegates cleanly to customer.pay(50). Customer internally coordinates its Wallet—Checkout knows nothing about Wallet or Card.',
        nodes: [
          { id: 'chk', label: 'Checkout', sublabel: 'Calls customer.pay(50)', x: 20, y: 50, kind: 'client', state: 'success' },
          { id: 'cust', label: 'Customer', sublabel: 'Immediate Friend', x: 54, y: 50, kind: 'object', state: 'highlight' },
          { id: 'wal', label: 'Private Wallet', sublabel: 'Hidden inside Customer', x: 85, y: 50, kind: 'object', state: 'idle' },
        ],
        edges: [
          { from: 'chk', to: 'cust', label: 'pay(50)', style: 'call', active: true },
          { from: 'cust', to: 'wal', label: 'internal delegate', style: 'dashed', active: true },
        ],
        stateWatch: [
          { key: 'Checkout Coupling', value: '1 immediate friend', tone: 'good' },
          { key: 'Refactor Safety', value: 'Wallet freely changeable', tone: 'good' },
        ],
      },
    ],
    code: {
      badLabel: 'Train-Wreck Getter Chain',
      goodLabel: 'Tell, Don’t Ask Delegation',
      explanation:
        'Move the payment deduction onto Customer so Checkout only talks to its direct collaborator.',
      python: {
        bad: `# Checkout reaches inside Customer -> Wallet\nif customer.get_wallet().get_balance() >= 50:\n    customer.get_wallet().deduct(50)`,
        good: `class Customer:\n    def pay(self, amount: int) -> None:\n        self._wallet.deduct(amount)\n\n# Checkout talks only to Customer\ncustomer.pay(50)`,
      },
      java: {
        bad: `if (customer.getWallet().getBalance() >= 50) {\n    customer.getWallet().deduct(50);\n}`,
        good: `class Customer {\n    void pay(int amount) { wallet.deduct(amount); }\n}\n// Caller:\ncustomer.pay(50);`,
      },
      typescript: {
        bad: `if (customer.getWallet().getBalance() >= 50) {\n  customer.getWallet().deduct(50);\n}`,
        good: `class Customer {\n  pay(amount: number) { this.wallet.deduct(amount); }\n}\ncustomer.pay(50);`,
      },
    },
    interviewQa: [
      {
        question: 'Is `arr.filter(...).map(...).reduce(...)` a Law of Demeter violation?',
        answer:
          'No! Every chained method operates on the same Array/Stream data structure contract rather than reaching across unrelated domain objects.',
      },
    ],
    quiz: {
      question: 'Which line violates the Law of Demeter?',
      options: [
        { id: 'a', text: 'order.getCustomer().getAddress().getZipCode().trim()', isCorrect: true, explanation: 'Correct! Reaching across 3 domain objects couples the caller to Customer and Address internals. Expose order.getShippingZip() instead.' },
        { id: 'b', text: 'customer.pay(50)', isCorrect: false, explanation: 'Single-hop delegation follows Tell, Don’t Ask.' },
        { id: 'c', text: 'numbers.filter(n => n > 0).map(n => n * 2)', isCorrect: false, explanation: 'Fluent collection pipelines stay on the same collection type.' },
        { id: 'd', text: 'Math.max(a, b)', isCorrect: false, explanation: 'Pure utility call.' },
      ],
    },
  },
];
