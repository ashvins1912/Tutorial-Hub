import type {
  LangVisualFlow,
  LanguageConcept,
  LanguagePracticeChallenge,
  LanguageQuizQuestion,
} from './languagesTutorialData';

/* ============================================================================
   PART 1: "HOW TO THINK IN PYTHON FROM JAVA" — 10 INTERACTIVE MINDSET MODULES
   ============================================================================ */

export type ThinkingTier =
  | 'Mindset Shift'
  | 'Core Idioms'
  | 'Data & Flow'
  | 'OOP & Safety'
  | 'Runtime & Scale';

export interface ThinkingStepTrace {
  stepNumber: number;
  stage: 'parse' | 'bind' | 'dispatch' | 'output';
  title: string;
  javaMentalModel: string;
  pythonMentalModel: string;
  memoryDifference: string;
}

export interface ThinkingRefactorRule {
  id: string;
  label: string;
  hint: string;
  test: (code: string) => boolean;
}

export interface JavaToPythonModule {
  id: string;
  number: number;
  tier: ThinkingTier;
  title: string;
  shortTitle: string;
  javaHabit: string;
  pythonicPrinciple: string;
  versionScope: string;
  plainEnglishAnalogy: string;
  formalExplanation: string;
  javaCode: string;
  javaAccentedPython: string;
  whyAntiPatternHurts: string;
  pythonicCode: string;
  whyPythonicWins: string;
  keyMentalShifts: { javaWay: string; pythonWay: string; why: string }[];
  traceSteps: ThinkingStepTrace[];
  mermaidDfd: string;
  mindsetCheck: {
    question: string;
    options: { id: string; text: string }[];
    correctId: string;
    explanation: string;
  };
  refactorDrill: {
    prompt: string;
    starterCode: string;
    quickBlocks: { label: string; snippet: string }[];
    rules: ThinkingRefactorRule[];
    referenceSolution: string;
  };
}

export const JAVA_TO_PYTHON_MODULES: JavaToPythonModule[] = [
  {
    id: 'j2p-entry-boilerplate',
    number: 1,
    tier: 'Mindset Shift',
    title: 'From Mandatory Class & main() to Top-Level Modules & __name__',
    shortTitle: 'Modules vs Class main()',
    javaHabit: 'Wrapping every helper function inside a public class with public static void main(String[] args).',
    pythonicPrinciple: 'A .py file IS already a module namespace. Write top-level functions directly and guard CLI execution with if __name__ == "__main__":.',
    versionScope: 'Java 1+ Core ↔ Python 0+ Core',
    plainEnglishAnalogy:
      'In Java, even a sticky note must live inside a labeled filing cabinet (a class). In Python, the file itself is already the folder—you only create a class when you truly need bundled mutable state plus behavior.',
    formalExplanation:
      'Java enforces class-based nominal encapsulation (JLS §7–8): every executable method belongs to a class type compiled into a .class file. Python treats every module (.py) as a first-class runtime object with its own global symbol dictionary (__dict__). Top-level code executes sequentially on import unless guarded by if __name__ == "__main__":.',
    javaCode: `public class GreetingApp {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("Asha"));
    }
}`,
    javaAccentedPython: `# Anti-pattern: Java-style utility class wrapper in Python
class GreetingApp:
    @staticmethod
    def greet(name):
        return "Hello, " + name + "!"

    @staticmethod
    def main():
        print(GreetingApp.greet("Asha"))

GreetingApp.main()  # Runs even if another file imports this!`,
    whyAntiPatternHurts:
      'Creating a class solely to hold @staticmethod functions adds indirection without state, and calling main() unconditionally breaks unit tests and imports because importing the file executes side effects.',
    pythonicCode: `# Pythonic: module IS the namespace; guard CLI entry point
def greet(name: str) -> str:
    return f"Hello, {name}!"

if __name__ == "__main__":
    print(greet("Asha"))`,
    whyPythonicWins:
      'Functions live directly in the module namespace for clean imports (from greeting import greet), while __name__ == "__main__" ensures CLI logic runs only when executed directly.',
    keyMentalShifts: [
      {
        javaWay: 'public class MathUtils { public static int add(...) }',
        pythonWay: 'math_utils.py with top-level def add(...):',
        why: 'Modules replace stateless utility classes in Python.',
      },
      {
        javaWay: 'public static void main(String[] args)',
        pythonWay: 'if __name__ == "__main__":',
        why: 'Separates reusable library imports from script execution.',
      },
      {
        javaWay: 'String + concatenation inside methods',
        pythonWay: 'f"Hello, {name}!" (or .format() in older Python)',
        why: 'Cleaner interpolation and faster CPython formatting opcode.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Load Source & Build Namespace',
        javaMentalModel: 'javac compiles GreetingApp.java into GreetingApp.class before execution.',
        pythonMentalModel: 'CPython parses greeting.py into bytecode and creates a module dict.',
        memoryDifference: 'Java requires a class metadata entry in Metaspace; Python allocates a single module dict.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Bind Function / Method Symbol',
        javaMentalModel: 'JVM resolves static method GreetingApp.greet(String) in class constant pool.',
        pythonMentalModel: 'def greet(...) creates a function object on the heap and binds key "greet" in module globals.',
        memoryDifference: 'In Python, functions are heap objects you can pass around like any variable.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Entry-Point Guard Check',
        javaMentalModel: 'java GreetingApp invokes public static void main(String[]) directly.',
        pythonMentalModel: 'Interpreter sets __name__ = "__main__" when run directly, or "greeting" when imported.',
        memoryDifference: 'Zero extra class wrapper allocation; import stays side-effect free.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Format & Print Result',
        javaMentalModel: 'invokedynamic / StringBuilder formats "Hello, Asha!" and writes to System.out.',
        pythonMentalModel: 'FORMAT_VALUE builds the Unicode str and sys.stdout.write emits the line.',
        memoryDifference: 'Both produce an immutable string object and flush to stdout.',
      },
    ],
    mermaidDfd: `flowchart LR
  JSRC["Java: Class File"] -->|"javac"| JCLS["Bytecode .class"]
  JCLS -->|"JVM main()"| JOUT["Static Method Dispatch"]
  PSRC["Python: .py Module"] -->|"AST + Bytecode"| PMOD["Module Namespace Dict"]
  PMOD -->|"__name__ == __main__"| POUT["Direct Function Call"]`,
    mindsetCheck: {
      question: 'You need three stateless helper functions for invoice tax calculation in Python. What is the most Pythonic structure?',
      options: [
        { id: 'a', text: 'Create class TaxUtils with three @staticmethod methods' },
        { id: 'b', text: 'Put the three functions directly at module top level in tax_utils.py' },
        { id: 'c', text: 'Instantiate a Singleton TaxUtils object on import' },
      ],
      correctId: 'b',
      explanation: 'In Python, a module file already acts as a singleton namespace. Stateless utility classes are unnecessary Java boilerplate.',
    },
    refactorDrill: {
      prompt: 'Refactor the Java-accented utility class into a clean Python module with a top-level function and an import-safe __main__ guard.',
      starterCode: `class PricingHelper:
    @staticmethod
    def apply_tax(amount):
        return amount * 1.18

print(PricingHelper.apply_tax(100))`,
      quickBlocks: [
        { label: 'def apply_tax', snippet: 'def apply_tax(amount: float) -> float:\n    return amount * 1.18' },
        { label: '__main__ guard', snippet: 'if __name__ == "__main__":\n    print(apply_tax(100))' },
      ],
      rules: [
        {
          id: 'no-wrapper-class',
          label: 'Remove the unnecessary PricingHelper utility class',
          hint: 'Define apply_tax directly at module level without a class wrapper.',
          test: (code) => !/\bclass\s+PricingHelper\b/.test(code),
        },
        {
          id: 'top-level-def',
          label: 'Define top-level def apply_tax(...)',
          hint: 'Use def apply_tax(amount): at column 0.',
          test: (code) => /^def\s+apply_tax\s*\(/m.test(code),
        },
        {
          id: 'main-guard',
          label: 'Guard the print call with if __name__ == "__main__":',
          hint: 'Wrap print(apply_tax(100)) inside if __name__ == "__main__":.',
          test: (code) => /if\s+__name__\s*==\s*['"]__main__['"]\s*:/.test(code),
        },
      ],
      referenceSolution: `def apply_tax(amount: float) -> float:
    return amount * 1.18

if __name__ == "__main__":
    print(apply_tax(100))`,
    },
  },
  {
    id: 'j2p-loops-iteration',
    number: 2,
    tier: 'Core Idioms',
    title: 'From Index Loops (for int i = 0) to Iterables, enumerate() & zip()',
    shortTitle: 'Loops vs enumerate/zip',
    javaHabit: 'Writing C-style index loops with i = 0; i < list.size(); i++ and calling list.get(i).',
    pythonicPrinciple: 'Iterate directly over elements. Use enumerate() when you need the index, zip() to walk two sequences together, and slicing for sub-ranges.',
    versionScope: 'Java 1+ Core ↔ Python 0+ Core',
    plainEnglishAnalogy:
      'In Java, a classic for-loop walks down a hallway counting door numbers (0, 1, 2) and opening each door. In Python, the hallway hands you each item directly—and enumerate() pins a numbered tag on it only when you ask.',
    formalExplanation:
      'Python’s for-loop is strictly a foreach loop powered by the Iterator Protocol (__iter__ and __next__). Calling range(len(seq)) manually forces repeated __getitem__ index lookups, breaks on non-indexable iterables (sets, generators, files), and adds off-by-one bug surface.',
    javaCode: `List<String> names = List.of("Ana", "Ben", "Cid");
List<Integer> scores = List.of(92, 85, 98);

for (int i = 0; i < names.size(); i++) {
    System.out.println((i + 1) + ". " + names.get(i) + ": " + scores.get(i));
}`,
    javaAccentedPython: `# Anti-pattern: C/Java-style manual index loop
names = ["Ana", "Ben", "Cid"]
scores = [92, 85, 98]

i = 0
while i < len(names):
    print(str(i + 1) + ". " + names[i] + ": " + str(scores[i]))
    i += 1`,
    whyAntiPatternHurts:
      'Manual counters (i += 1) and range(len(names)) fail on generators or sets, clutter business logic with indexing mechanics, and invite IndexError if two lists differ in length.',
    pythonicCode: `# Pythonic: direct iteration with enumerate() + zip()
names = ["Ana", "Ben", "Cid"]
scores = [92, 85, 98]

for rank, (name, score) in enumerate(zip(names, scores), start=1):
    print(f"{rank}. {name}: {score}")`,
    whyPythonicWins:
      'enumerate(..., start=1) handles 1-based ranking cleanly, zip() pairs sequences lazily in O(1) extra memory, and tuple unpacking eliminates every bracket lookup.',
    keyMentalShifts: [
      {
        javaWay: 'for (int i = 0; i < arr.length; i++)',
        pythonWay: 'for item in arr:',
        why: 'Zero index variables unless index is genuinely needed.',
      },
      {
        javaWay: 'Track int idx separately during iteration',
        pythonWay: 'for idx, item in enumerate(arr, start=1):',
        why: 'Atomic index + element unpacking works on any iterable.',
      },
      {
        javaWay: 'arr.get(i) and other.get(i) in lockstep',
        pythonWay: 'for a, b in zip(arr, other):',
        why: 'Safe lockstep traversal without length mismatch crashes.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Initialize Loop State',
        javaMentalModel: 'Stack allocates primitive int i = 0 and reads list.size().',
        pythonMentalModel: 'zip(names, scores) creates a lazy C-level iterator; enumerate wraps it with counter=1.',
        memoryDifference: 'No intermediate combined list is allocated—zip yields pairs on demand.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Fetch Next Element',
        javaMentalModel: 'Evaluates i < size, then calls names.get(i) and scores.get(i) with bounds checks.',
        pythonMentalModel: 'Single FOR_ITER opcode calls next() and unpacks (rank, (name, score)).',
        memoryDifference: 'C-level pointer traversal avoids repeated Python-level indexing bytecode.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Emit Formatted Row',
        javaMentalModel: 'Concatenates strings and autoboxed integers.',
        pythonMentalModel: 'f-string formats rank, name, score directly in C.',
        memoryDifference: 'Zero manual str() conversions required.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Graceful Loop Termination',
        javaMentalModel: 'i reaches size; condition i < size evaluates false.',
        pythonMentalModel: 'Iterator raises internal StopIteration; loop exits cleanly.',
        memoryDifference: 'Works identically for lists, tuples, files, DB cursors, and generators.',
      },
    ],
    mermaidDfd: `flowchart LR
  IN["Sequences: names + scores"] -->|"zip()"| ZIP["Lazy Pair Iterator"]
  ZIP -->|"enumerate(start=1)"| ENUM["Rank + Pair Stream"]
  ENUM -->|"Tuple Unpack"| FMT["f-String Format"]
  FMT -->|"stdout"| OUT["1. Ana: 92 ..."]`,
    mindsetCheck: {
      question: 'Why does idiomatic Python discourage `for i in range(len(items)):` when you only need values and positions?',
      options: [
        { id: 'a', text: 'Python does not support the range() function on lists' },
        { id: 'b', text: 'enumerate() works on any iterable (including generators/files) and avoids manual indexing bugs' },
        { id: 'c', text: 'range() always copies the entire list into RAM' },
      ],
      correctId: 'b',
      explanation: 'enumerate() consumes the iterator protocol directly—so it works on generators, files, sets, and lists alike with cleaner readability.',
    },
    refactorDrill: {
      prompt: 'Replace the manual index loop with Pythonic enumerate() and zip().',
      starterCode: `cities = ["Tokyo", "Delhi", "Paris"]
temps = [22, 34, 18]
for i in range(len(cities)):
    print(i + 1, cities[i], temps[i])`,
      quickBlocks: [
        { label: 'enumerate + zip', snippet: 'for idx, (city, temp) in enumerate(zip(cities, temps), start=1):\n    print(f"{idx}. {city}: {temp}C")' },
      ],
      rules: [
        {
          id: 'use-enumerate',
          label: 'Use enumerate(...) instead of range(len(...))',
          hint: 'Wrap the zipped sequence in enumerate(..., start=1).',
          test: (code) => /\benumerate\s*\(/.test(code) && !/range\s*\(\s*len\s*\(/.test(code),
        },
        {
          id: 'use-zip',
          label: 'Pair cities and temps with zip(cities, temps)',
          hint: 'Use zip(cities, temps) to avoid indexing both lists.',
          test: (code) => /\bzip\s*\(\s*cities\s*,\s*temps\s*\)/.test(code),
        },
      ],
      referenceSolution: `cities = ["Tokyo", "Delhi", "Paris"]
temps = [22, 34, 18]
for idx, (city, temp) in enumerate(zip(cities, temps), start=1):
    print(f"{idx}. {city}: {temp}C")`,
    },
  },
  {
    id: 'j2p-comprehensions-generators',
    number: 3,
    tier: 'Data & Flow',
    title: 'From Loops & Java Streams to Comprehensions & Lazy Generators',
    shortTitle: 'Comprehensions & Generators',
    javaHabit: 'Allocating an empty ArrayList, looping with if + .add(), or chaining .stream().filter().map().toList().',
    pythonicPrinciple: 'Use list/dict/set comprehensions for concise materialization, and generator expressions (...) or yield for O(1)-memory streaming.',
    versionScope: 'Java 1+ / 8+ Streams ↔ Python 2+/3+ Core',
    plainEnglishAnalogy:
      'Building a filtered list in Java is like carrying an empty basket and dropping apples in one by one. A Python comprehension describes the exact basket in one declarative sentence—and a generator hands you one apple at a time without needing a basket at all!',
    formalExplanation:
      'Python list comprehensions execute the append step with a dedicated LIST_APPEND bytecode instruction rather than repeated attribute lookups on list.append. Replacing [...] with (...) turns eager O(n) memory materialization into a lazy O(1)-memory generator iterator equivalent to a Java Stream.',
    javaCode: `// Java 8+ Stream (or Java 1+ loop with new ArrayList<>())
List<Integer> evenSquares = nums.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .toList();

int total = nums.stream()
    .filter(n -> n % 2 == 0)
    .mapToInt(n -> n * n)
    .sum();`,
    javaAccentedPython: `# Anti-pattern: verbose accumulator loop + wasted intermediate list
even_squares = []
for n in nums:
    if n % 2 == 0:
        even_squares.append(n * n)

# Even worse for sum: allocates full list just to add numbers!
total = sum([n * n for n in nums if n % 2 == 0])`,
    whyAntiPatternHurts:
      'Imperative .append() loops perform repeated method attribute lookups in Python bytecode, and wrapping a list comprehension inside sum([...]) wastes O(n) RAM on a temporary list.',
    pythonicCode: `# Pythonic: list comprehension when you need the list
even_squares = [n * n for n in nums if n % 2 == 0]

# Generator expression: O(1) extra memory (lazy streaming!)
total = sum(n * n for n in nums if n % 2 == 0)`,
    whyPythonicWins:
      'Comprehensions fuse filter + map into one readable expression with fast CPython bytecode; generator expressions inside sum(), any(), all(), or max() process millions of rows in constant O(1) memory.',
    keyMentalShifts: [
      {
        javaWay: 'stream().filter(p).map(f).toList()',
        pythonWay: '[f(x) for x in data if p(x)]',
        why: 'Comprehensions are more idiomatic and faster than map()/filter() + lambda in Python.',
      },
      {
        javaWay: 'Collectors.toMap(k, v)',
        pythonWay: '{k(x): v(x) for x in data}',
        why: 'First-class dict and set comprehensions built into syntax.',
      },
      {
        javaWay: 'Lazy Stream pipeline terminating in .sum() / .anyMatch()',
        pythonWay: 'sum(x for x in data if ...) / any(...)',
        why: 'Generator expressions evaluate lazily with O(1) auxiliary memory.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Declare Pipeline Expression',
        javaMentalModel: 'Creates Stream pipeline head + StatelessOp filter/map stages.',
        pythonMentalModel: 'Generator expression compiles into a lightweight code frame (zero elements evaluated yet).',
        memoryDifference: 'Both defer work until a terminal consumer pulls values.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Pull One Element at a Time',
        javaMentalModel: 'Spliterator pushes element through filter predicate sink.',
        pythonMentalModel: 'sum() calls next() on the generator, which resumes until yield.',
        memoryDifference: 'Peak RAM stays O(1) even for 10 million input numbers.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Transform & Accumulate',
        javaMentalModel: 'IntStream avoids boxing overhead with primitive int accumulator.',
        pythonMentalModel: 'sum() accumulates directly in C loop without creating a temporary list.',
        memoryDifference: 'No garbage-collection spike from temporary collection resizing.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Return Final Aggregate',
        javaMentalModel: 'Terminal .sum() closes pipeline and returns primitive int.',
        pythonMentalModel: 'Generator exhausts via StopIteration; sum() returns exact arbitrary-precision int.',
        memoryDifference: 'Python int never overflows 32-bit/64-bit bounds.',
      },
    ],
    mermaidDfd: `flowchart LR
  SRC["Input Iterable"] -->|"next()"| FLT["Predicate: n % 2 == 0"]
  FLT -->|"Pass"| MAP["Transform: n * n"]
  MAP -->|"Yield O(1) RAM"| SUM["Terminal Consumer: sum()"]
  SUM -->|"Result"| OUT["Arbitrary-Precision Int"]`,
    mindsetCheck: {
      question: 'What is the key memory difference between `sum([x*x for x in range(10_000_000)])` and `sum(x*x for x in range(10_000_000))`?',
      options: [
        { id: 'a', text: 'None; Python optimizes both identically' },
        { id: 'b', text: 'The bracketed version allocates a 10M-element list in RAM first; the generator expression uses O(1) memory' },
        { id: 'c', text: 'The generator expression cannot be passed to sum()' },
      ],
      correctId: 'b',
      explanation: 'Square brackets build the full list in memory before sum() even starts. Dropping the brackets creates a lazy generator expression that streams values in O(1) RAM.',
    },
    refactorDrill: {
      prompt: 'Convert the Java-style accumulator loop into a single O(1)-memory generator expression passed to sum().',
      starterCode: `prices = [12, 45, 8, 120, 30]
discounted = []
for p in prices:
    if p >= 20:
        discounted.append(p * 0.9)
total = sum(discounted)`,
      quickBlocks: [
        { label: 'Generator sum()', snippet: 'total = sum(p * 0.9 for p in prices if p >= 20)' },
      ],
      rules: [
        {
          id: 'no-append-loop',
          label: 'Eliminate the manual discounted.append(...) loop',
          hint: 'Replace the loop with a single generator expression inside sum(...).',
          test: (code) => !/\.append\s*\(/.test(code),
        },
        {
          id: 'generator-sum',
          label: 'Use a lazy generator expression inside sum(...)',
          hint: 'Write sum(p * 0.9 for p in prices if p >= 20) without square brackets.',
          test: (code) => /sum\s*\(\s*[^[\]]+\bfor\b.+\bin\s+prices\b.+\bif\b/.test(code),
        },
      ],
      referenceSolution: `prices = [12, 45, 8, 120, 30]
total = sum(p * 0.9 for p in prices if p >= 20)`,
    },
  },
  {
    id: 'j2p-none-truthiness-eafp',
    number: 4,
    tier: 'Mindset Shift',
    title: 'From null Checks & LBYL to None, Truthiness & EAFP',
    shortTitle: 'EAFP vs LBYL & None',
    javaHabit: 'Writing defensive pre-checks everywhere (if (map != null && map.containsKey(k) && list.size() > 0)) — Look Before You Leap (LBYL).',
    pythonicPrinciple: 'Check emptiness via truthiness (if items:), check identity for None (is None), use dict.get(), and prefer EAFP ("Easier to Ask Forgiveness than Permission").',
    versionScope: 'Java 1+ Core ↔ Python 0+ Core',
    plainEnglishAnalogy:
      'Java checks the lock, peeks through the window, and verifies the key shape before turning the handle (LBYL). Python simply tries opening the door inside try/except (EAFP)—which is also safer under concurrency because state cannot change between check and action!',
    formalExplanation:
      'In Java, checking map.containsKey(k) before map.get(k) performs two hash probes (and can race across threads), whereas exceptions carry expensive stack-trace fill costs. In Python, try blocks with no exception have near-zero overhead (PEP 659 zero-cost tables in 3.11+), making EAFP fast, atomic, and idiomatic.',
    javaCode: `if (user != null && user.getRoles() != null && !user.getRoles().isEmpty()) {
    String role = config.containsKey("role") ? config.get("role") : "guest";
    System.out.println(role);
}`,
    javaAccentedPython: `# Anti-pattern: Java-style == None, len() > 0, and double dict lookup
if user != None and len(roles) > 0:
    if "role" in config:
        role = config["role"]
    else:
        role = "guest"
    print(role)`,
    whyAntiPatternHurts:
      'Using == None invokes custom __eq__ hooks (which can break or lie on NumPy/ORM objects); len(roles) > 0 is noisier than truthiness; checking "role" in config before config["role"] hashes the key twice.',
    pythonicCode: `# Pythonic: "is not None", truthiness, and single-probe dict.get()
if user is not None and roles:
    role = config.get("role", "guest")
    print(role)

# EAFP when parsing or reading files/keys
try:
    port = int(config["port"])
except (KeyError, ValueError):
    port = 8080`,
    whyPythonicWins:
      'is / is not None compares singleton object identity in O(1), empty containers are naturally falsy, dict.get() probes once, and try/except handles missing/invalid inputs atomically.',
    keyMentalShifts: [
      {
        javaWay: 'x == null / x != null',
        pythonWay: 'x is None / x is not None',
        why: 'None is a singleton; identity comparison cannot be overridden by __eq__.',
      },
      {
        javaWay: 'if (list.size() > 0)',
        pythonWay: 'if items:',
        why: 'Empty lists, dicts, sets, strings, and 0 are falsy by language protocol (__bool__/__len__).',
      },
      {
        javaWay: 'if (map.containsKey(k)) v = map.get(k);',
        pythonWay: 'v = mapping.get(k, default) or try/except KeyError',
        why: 'Avoids duplicate hash lookups and TOCTOU check-then-act races.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Identity Check vs Equality',
        javaMentalModel: 'JVM checks null reference pointer directly (ifnull bytecode).',
        pythonMentalModel: 'is not None compares C pointer address against Py_None singleton (IS_OP).',
        memoryDifference: 'Zero method dispatch; avoids calling user.__eq__(None).',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Truthiness Protocol',
        javaMentalModel: 'Java if(...) strictly requires a boolean primitive expression.',
        pythonMentalModel: 'Python calls bool(roles) → roles.__len__() != 0 automatically.',
        memoryDifference: 'Uniform emptiness check across list, tuple, set, dict, str, and custom containers.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Single Hash Probe (EAFP / .get)',
        javaMentalModel: 'containsKey + get hashes key twice unless Map.getOrDefault is used.',
        pythonMentalModel: 'config.get("role", "guest") hashes once and returns default on miss.',
        memoryDifference: 'Zero double-hashing; zero KeyError allocation on expected defaults.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Fallback Recovery',
        javaMentalModel: 'try/catch in Java builds a full stack trace if thrown frequently.',
        pythonMentalModel: 'Zero-cost exception table handles happy path at full speed and catches fallback cleanly.',
        memoryDifference: 'Predictable fallback value with atomic failure handling.',
      },
    ],
    mermaidDfd: `flowchart LR
  REQ["Incoming Dict + User"] -->|"is not None"| CHK["Identity + Truthiness Check"]
  CHK -->|"Single Hash Probe"| GET["config.get('role', 'guest')"]
  GET -->|"Try Parse"| TRY["EAFP: int(config['port'])"]
  TRY -.->|"KeyError / ValueError"| FALL["Fallback Port: 8080"]
  TRY -->|"Valid"| OK["Ready Service Config"]`,
    mindsetCheck: {
      question: 'Why should you always write `if value is None:` instead of `if value == None:` in Python?',
      options: [
        { id: 'a', text: '== None is a syntax error in Python 3' },
        { id: 'b', text: 'is checks singleton pointer identity in O(1) and cannot be broken by custom __eq__ implementations' },
        { id: 'c', text: 'is converts None into False automatically' },
      ],
      correctId: 'b',
      explanation: 'Custom objects (like pandas Series, NumPy arrays, or SQLAlchemy expressions) override __eq__, which can raise errors or return non-booleans with == None. Identity check `is None` is always exact and fast.',
    },
    refactorDrill: {
      prompt: 'Clean up the Java-accented null, length, and double-lookup checks into Pythonic idioms.',
      starterCode: `if profile != None and len(tags) > 0:
    if "tier" in profile:
        tier = profile["tier"]
    else:
        tier = "free"`,
      quickBlocks: [
        { label: 'is not None + truthiness', snippet: 'if profile is not None and tags:' },
        { label: 'dict.get()', snippet: '    tier = profile.get("tier", "free")' },
      ],
      rules: [
        {
          id: 'is-not-none',
          label: 'Use `profile is not None` instead of `!= None`',
          hint: 'Compare None by identity with `is not None`.',
          test: (code) => /profile\s+is\s+not\s+None/.test(code) && !/!=\s*None/.test(code),
        },
        {
          id: 'truthy-tags',
          label: 'Use truthiness `and tags:` instead of `len(tags) > 0`',
          hint: 'Replace `len(tags) > 0` with `tags`.',
          test: (code) => /\band\s+tags\s*:/.test(code) && !/len\s*\(\s*tags\s*\)/.test(code),
        },
        {
          id: 'dict-get',
          label: 'Use single-lookup `profile.get("tier", "free")`',
          hint: 'Replace the if/else membership check with profile.get("tier", "free").',
          test: (code) => /profile\.get\(\s*['"]tier['"]\s*,\s*['"]free['"]\s*\)/.test(code),
        },
      ],
      referenceSolution: `if profile is not None and tags:
    tier = profile.get("tier", "free")`,
    },
  },
  {
    id: 'j2p-duck-typing-protocols',
    number: 5,
    tier: 'OOP & Safety',
    title: 'From Interfaces, Overloading & Getters to Duck Typing, @property & Default Args',
    shortTitle: 'Duck Typing & @property',
    javaHabit: 'Writing private fields with getX()/setX(), 4 overloaded constructors, and rigid interface hierarchies before writing any logic.',
    pythonicPrinciple: 'Start with plain public attributes (upgrade transparently to @property later if validation is needed), replace overloading with default/keyword args, and rely on Duck Typing + Protocol.',
    versionScope: 'Java 1+ Core ↔ Python 0+ / 3.8+ Protocol',
    plainEnglishAnalogy:
      'In Java, a bird must carry a signed "Flyable" passport to enter the sky. In Python, if it has a .fly() method and flaps, it flies! And instead of wrapping every field in getAge()/setAge() "just in case", Python lets you access user.age directly and intercept it later with @property without breaking a single caller.',
    formalExplanation:
      'Java uses nominal subtyping (implements Interface) and compile-time method overloading (resolved by static parameter arity/types). Python uses structural subtyping (Duck Typing at runtime, typing.Protocol for static type checkers like mypy/pyright) and descriptor-backed @property hooks to preserve uniform attribute access syntax.',
    javaCode: `public class Account {
    private double balance;

    public Account() { this(0.0); }
    public Account(double initial) { setBalance(initial); }

    public double getBalance() { return balance; }
    public void setBalance(double amount) {
        if (amount < 0) throw new IllegalArgumentException("Negative");
        this.balance = amount;
    }
}`,
    javaAccentedPython: `# Anti-pattern: Java getters/setters + fake overloading
class Account:
    def __init__(self, initial):
        self.__balance = 0.0
        self.set_balance(initial)

    def get_balance(self):
        return self.__balance

    def set_balance(self, amount):
        if amount < 0:
            raise ValueError("Negative")
        self.__balance = amount`,
    whyAntiPatternHurts:
      'Java-style get_balance()/set_balance() breaks idiomatic attribute access, double-underscore name mangling (__balance) surprises subclasses, and Python does not support multiple __init__ overloads (the second definition overwrites the first!).',
    pythonicCode: `# Pythonic: default args + @property descriptor (zero caller breakage!)
class Account:
    def __init__(self, balance: float = 0.0) -> None:
        self.balance = balance  # Routes through @balance.setter!

    @property
    def balance(self) -> float:
        return self._balance

    @balance.setter
    def balance(self, amount: float) -> None:
        if amount < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = amount`,
    whyPythonicWins:
      'One __init__(balance=0.0) replaces overloaded constructors, callers write clean acc.balance = 50, and @property enforces invariants transparently through the descriptor protocol.',
    keyMentalShifts: [
      {
        javaWay: 'Multiple overloaded constructors/methods',
        pythonWay: 'Default parameter values & keyword arguments',
        why: 'Python namespaces map one name to one function object—defaults replace overloads.',
      },
      {
        javaWay: 'private field + getField() / setField()',
        pythonWay: 'Public attribute now → @property later if validation is needed',
        why: 'Callers never change syntax when validation is added later.',
      },
      {
        javaWay: 'class Foo implements Closeable, Comparable',
        pythonWay: 'Implement __enter__/__exit__ or __lt__ (Duck Typing / Protocol)',
        why: 'Behavior protocols decouple classes without inheritance trees.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Instantiate Object',
        javaMentalModel: 'new Account() resolves 0-arg overload, chaining this(0.0).',
        pythonMentalModel: 'Account() binds default balance=0.0 and calls __init__(self, 0.0).',
        memoryDifference: 'Single function object in Python class dict instead of multiple bytecode descriptors.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Assign Attribute with Validation',
        javaMentalModel: 'Must explicitly call acc.setBalance(100) to trigger guard.',
        pythonMentalModel: 'acc.balance = 100 intercepts assignment via property.__set__ descriptor.',
        memoryDifference: 'Validation runs automatically even inside __init__ via self.balance = balance.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Read Attribute',
        javaMentalModel: 'acc.getBalance() invokes virtual getter method (inlined by JIT).',
        pythonMentalModel: 'acc.balance invokes property.__get__ returning self._balance.',
        memoryDifference: 'Uniform dot-access syntax for both plain fields and computed properties.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Reject Invalid State',
        javaMentalModel: 'Throws IllegalArgumentException on negative amount.',
        pythonMentalModel: 'Raises ValueError immediately before mutating self._balance.',
        memoryDifference: 'Object invariant stays protected in both languages with half the boilerplate in Python.',
      },
    ],
    mermaidDfd: `flowchart LR
  CALL["acc.balance = 100"] -->|"STORE_ATTR"| DESC["@property Descriptor"]
  DESC -->|"amount < 0?"| GUARD["Invariant Guard"]
  GUARD -->|"Invalid"| ERR["Raise ValueError"]
  GUARD -->|"Valid"| STORE["self._balance = 100"]`,
    mindsetCheck: {
      question: 'What happens in Python if you define two `def send(...)` methods with different parameter counts inside the same class (like Java overloading)?',
      options: [
        { id: 'a', text: 'Python dispatches to the matching overload automatically at runtime' },
        { id: 'b', text: 'The second `def send` overwrites the first one in the class dictionary' },
        { id: 'c', text: 'Python raises a compile-time DuplicateMethodError' },
      ],
      correctId: 'b',
      explanation: 'A Python class body executes top-to-bottom into a dictionary. Defining the same method name twice overwrites the earlier binding. Use default arguments, keyword arguments, or @functools.singledispatch instead.',
    },
    refactorDrill: {
      prompt: 'Convert the Java-style getter/setter Temperature class into a Pythonic @property with a default celsius=0.0 parameter.',
      starterCode: `class Temperature:
    def __init__(self, celsius):
        self.set_celsius(celsius)

    def get_celsius(self):
        return self._celsius

    def set_celsius(self, value):
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value`,
      quickBlocks: [
        { label: '@property getter', snippet: '    @property\n    def celsius(self) -> float:\n        return self._celsius' },
        { label: '@celsius.setter', snippet: '    @celsius.setter\n    def celsius(self, value: float) -> None:\n        if value < -273.15:\n            raise ValueError("Below absolute zero")\n        self._celsius = value' },
      ],
      rules: [
        {
          id: 'default-arg',
          label: 'Provide default argument celsius: float = 0.0 (or celsius=0.0) in __init__',
          hint: 'Use def __init__(self, celsius=0.0): to eliminate extra overloads.',
          test: (code) => /def\s+__init__\s*\(\s*self\s*,\s*celsius[^)]*=\s*0/.test(code),
        },
        {
          id: 'use-property',
          label: 'Use @property and @celsius.setter instead of get_celsius/set_celsius',
          hint: 'Decorate def celsius(self) with @property and the setter with @celsius.setter.',
          test: (code) => /@property/.test(code) && /@celsius\.setter/.test(code),
        },
      ],
      referenceSolution: `class Temperature:
    def __init__(self, celsius: float = 0.0) -> None:
        self.celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        if value < -273.15:
            raise ValueError("Below absolute zero")
        self._celsius = value`,
    },
  },
  {
    id: 'j2p-strings-collections',
    number: 6,
    tier: 'Core Idioms',
    title: 'From StringBuilder & HashMap Boilerplate to "".join(), Counter & defaultdict',
    shortTitle: 'Strings & Collections Idioms',
    javaHabit: 'Using StringBuilder in a loop and writing map.put(k, map.getOrDefault(k, 0) + 1) or computeIfAbsent for grouping.',
    pythonicPrinciple: 'Build strings in O(n) with "".join(parts), count frequencies in one line with collections.Counter, and group items cleanly with defaultdict(list).',
    versionScope: 'Java 1+ / 8+ Core ↔ Python 2+/3+ Standard Library',
    plainEnglishAnalogy:
      'Think of Python’s standard library collections as pre-built Swiss-Army blades: instead of hand-coding a frequency map or grouping check every week, Counter and defaultdict turn 8 lines of Java boilerplate into 1 crystal-clear line.',
    formalExplanation:
      'Strings are immutable in both Java and Python, making repeated += inside a loop O(n²) character copies without StringBuilder (Java) or "".join() (Python). In Python, "".join(iterable) performs a two-pass C calculation (exact total length + single contiguous buffer allocation), and collections.Counter / defaultdict push counting and bucket initialization into C.',
    javaCode: `// Frequency count + grouping + O(n) string join
Map<String, Integer> counts = new HashMap<>();
for (String word : words) {
    counts.put(word, counts.getOrDefault(word, 0) + 1);
}

StringBuilder sb = new StringBuilder();
for (int i = 0; i < words.size(); i++) {
    if (i > 0) sb.append(", ");
    sb.append(words.get(i));
}`,
    javaAccentedPython: `# Anti-pattern: O(n^2) string += and manual dict counting
counts = {}
for word in words:
    if word in counts:
        counts[word] = counts[word] + 1
    else:
        counts[word] = 1

result = ""
for i in range(len(words)):
    if i > 0:
        result = result + ", "
    result = result + words[i]`,
    whyAntiPatternHurts:
      'Repeated string concatenation can degrade to O(n²) allocations, and manual if-else dict initialization duplicates logic that Counter executes faster in C.',
    pythonicCode: `from collections import Counter, defaultdict

# O(n) C-backed frequency counter
counts = Counter(words)

# O(n) single-allocation string join
result = ", ".join(words)

# Clean grouping by first letter
by_letter = defaultdict(list)
for word in words:
    by_letter[word[0]].append(word)`,
    whyPythonicWins:
      'Counter(words) counts frequencies in C and provides .most_common(k) out of the box; ", ".join(words) allocates the exact output buffer once in O(n); defaultdict(list) eliminates key-presence checks.',
    keyMentalShifts: [
      {
        javaWay: 'new StringBuilder() + loop + if (i > 0) append(", ")',
        pythonWay: '", ".join(items)',
        why: 'Exact O(n) two-pass allocation with zero trailing-delimiter edge cases.',
      },
      {
        javaWay: 'map.put(k, map.getOrDefault(k, 0) + 1)',
        pythonWay: 'Counter(items)',
        why: 'C-accelerated counting + arithmetic (+, -, &) + .most_common(k).',
      },
      {
        javaWay: 'map.computeIfAbsent(k, _ -> new ArrayList<>()).add(v)',
        pythonWay: 'groups = defaultdict(list); groups[k].append(v)',
        why: 'Zero lambda allocation on missing keys.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Import Standard Library Power Tools',
        javaMentalModel: 'Uses java.util.HashMap and java.lang.StringBuilder.',
        pythonMentalModel: 'Imports C-implemented Counter and defaultdict from collections.',
        memoryDifference: 'Both reuse battle-tested standard library data structures.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Aggregate Frequencies in O(n)',
        javaMentalModel: 'Boxes int → Integer on every increment in HashMap<String, Integer>.',
        pythonMentalModel: 'Counter increments counts in a C helper (_count_elements) in one pass.',
        memoryDifference: 'Single hash probe per word instead of containsKey + get + put.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Join Strings in O(n)',
        javaMentalModel: 'StringBuilder doubles backing char[]/byte[] as capacity grows.',
        pythonMentalModel: '", ".join(words) computes exact final byte length first, allocates once, copies.',
        memoryDifference: 'Zero resizing reallocations during join.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Produce Ranked & Joined Results',
        javaMentalModel: 'Must stream entrySet().sorted() to find top-K frequent words.',
        pythonMentalModel: 'counts.most_common(3) uses heapq.nlargest in O(n log k).',
        memoryDifference: 'Cleaner code AND optimal algorithmic complexity.',
      },
    ],
    mermaidDfd: `flowchart LR
  W["Word Stream"] -->|"C _count_elements"| CNT["collections.Counter"]
  W -->|"2-Pass Exact Alloc"| JOIN["', '.join(words)"]
  CNT -->|"heapq.nlargest"| TOP["Top-K Frequent Words"]
  JOIN -->|"Single Str Buffer"| OUT["O(n) Joined Output"]`,
    mindsetCheck: {
      question: 'Why is `"".join(chunks)` preferred over `s += chunk` inside a Python loop?',
      options: [
        { id: 'a', text: 'Python strings do not support the + operator' },
        { id: 'b', text: '"".join() calculates total size upfront and allocates the final string buffer once in O(n)' },
        { id: 'c', text: '"".join() mutates strings in place without creating a new object' },
      ],
      correctId: 'b',
      explanation: 'Python str objects are immutable. "".join() computes exact length and encoding width upfront, allocates once, and copies every chunk in O(n) time.',
    },
    refactorDrill: {
      prompt: 'Replace the manual dict counter and += string loop with Counter and ", ".join().',
      starterCode: `tags = ["api", "db", "api", "cache"]
freq = {}
for t in tags:
    freq[t] = freq.get(t, 0) + 1
csv = ""
for t in tags:
    csv += t + ","`,
      quickBlocks: [
        { label: 'Counter(tags)', snippet: 'from collections import Counter\nfreq = Counter(tags)' },
        { label: '",".join(tags)', snippet: 'csv = ",".join(tags)' },
      ],
      rules: [
        {
          id: 'use-counter',
          label: 'Use Counter(tags) for frequency counting',
          hint: 'Import Counter from collections and compute freq = Counter(tags).',
          test: (code) => /\bCounter\s*\(\s*tags\s*\)/.test(code),
        },
        {
          id: 'use-join',
          label: 'Use ",".join(tags) instead of += in a loop',
          hint: 'Replace the string += loop with ",".join(tags).',
          test: (code) => /\.join\s*\(\s*tags\s*\)/.test(code) && !/\+=\s*t/.test(code),
        },
      ],
      referenceSolution: `from collections import Counter

tags = ["api", "db", "api", "cache"]
freq = Counter(tags)
csv = ",".join(tags)`,
    },
  },
  {
    id: 'j2p-mutability-aliasing',
    number: 7,
    tier: 'OOP & Safety',
    title: 'Variables as Labels: Aliasing, Shallow vs Deep Copy & Mutable Default Traps',
    shortTitle: 'Name Binding & Mutability',
    javaHabit: 'Thinking of variables as typed memory boxes (int a = 5; int b = a;) and assuming default arguments are recreated per call.',
    pythonicPrinciple: 'Python variables are sticky-note labels attached to heap objects. Never use a mutable list/dict as a default parameter value—use None instead.',
    versionScope: 'Java 1+ Core ↔ Python 0+ Core',
    plainEnglishAnalogy:
      'In Java, primitive variables are boxes holding values directly. In Python, EVERY variable is a sticky note pointing to an object on the table. Writing b = a puts a second sticky note on the SAME list—and writing def add(x, bucket=[]) tapes ONE shared bucket to the function definition forever!',
    formalExplanation:
      'Python evaluates function default arguments ONCE at def execution time and stores them in fn.__defaults__. Mutating a default list/dict leaks state across every subsequent call. Similarly, assignment (b = a) binds a new name to the identical object reference (id(a) == id(b)); use list.copy()/dict.copy() for shallow copies and copy.deepcopy() for nested structures.',
    javaCode: `// Java: each call allocates a fresh ArrayList when overloaded
public List<String> addTag(String tag) {
    return addTag(tag, new ArrayList<>());
}
public List<String> addTag(String tag, List<String> bucket) {
    bucket.add(tag);
    return bucket;
}`,
    javaAccentedPython: `# CLASSIC BUG: mutable default list shared across ALL calls!
def add_tag(tag, bucket=[]):
    bucket.append(tag)
    return bucket

print(add_tag("fast"))   # ['fast']
print(add_tag("safe"))   # ['fast', 'safe'] <-- SURPRISE LEAK!`,
    whyAntiPatternHurts:
      'The [] object is allocated ONCE when Python executes the `def` statement, not when `add_tag()` is called. Every caller without an explicit bucket silently mutates the exact same list!',
    pythonicCode: `# Pythonic: use None sentinel and allocate fresh list inside call
def add_tag(tag: str, bucket: list[str] | None = None) -> list[str]:
    if bucket is None:
        bucket = []
    bucket.append(tag)
    return bucket

print(add_tag("fast"))  # ['fast']
print(add_tag("safe"))  # ['safe']`,
    whyPythonicWins:
      'None is immutable and cheap; allocating [] inside the function body guarantees a brand-new heap list on every call unless the caller explicitly passes an existing container.',
    keyMentalShifts: [
      {
        javaWay: 'int a = 5; int b = a; (independent stack slot)',
        pythonWay: 'a = [1, 2]; b = a (two labels pointing to SAME heap list)',
        why: 'Use b = a.copy() or copy.deepcopy(a) whenever independent mutation is needed.',
      },
      {
        javaWay: 'Overload allocates new ArrayList<>() on each call',
        pythonWay: 'def fn(items=None): items = [] if items is None else items',
        why: 'Default values in Python are evaluated once at function definition time.',
      },
      {
        javaWay: 'Collections.unmodifiableList(...) / List.of(...)',
        pythonWay: 'tuple for fixed records; frozenset for immutable sets',
        why: 'Tuples are hashable (valid dict keys) and use less RAM than lists.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Function Definition Time (def)',
        javaMentalModel: 'Overloaded methods are compiled; no ArrayList exists yet.',
        pythonMentalModel: 'Python evaluates default expressions NOW and stores None in add_tag.__defaults__.',
        memoryDifference: 'If you put [] in def, that single list lives inside add_tag.__defaults__ forever.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'First Call: add_tag("fast")',
        javaMentalModel: 'new ArrayList<>() allocates heap list #1.',
        pythonMentalModel: 'bucket is None → allocates fresh heap list #1 and appends "fast".',
        memoryDifference: 'Clean isolation per invocation.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Second Call: add_tag("safe")',
        javaMentalModel: 'new ArrayList<>() allocates heap list #2.',
        pythonMentalModel: 'bucket is None → allocates fresh heap list #2 (completely distinct id()).',
        memoryDifference: 'Zero cross-request state contamination (critical in web servers!).',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Explicit Caller Bucket Supported',
        javaMentalModel: 'addTag("x", existing) mutates caller list.',
        pythonMentalModel: 'add_tag("x", existing) skips None branch and appends to existing.',
        memoryDifference: 'Same flexibility as Java overloading in a single function.',
      },
    ],
    mermaidDfd: `flowchart LR
  DEF["def add_tag(tag, bucket=None)"] -->|"Stored in __defaults__"| SENT["Immutable Sentinel: None"]
  CALL1["Call 1: add_tag('fast')"] -->|"bucket is None"| L1["Fresh List #1: ['fast']"]
  CALL2["Call 2: add_tag('safe')"] -->|"bucket is None"| L2["Fresh List #2: ['safe']"]
  SENT -.->|"Safe Isolation"| L1
  SENT -.->|"Safe Isolation"| L2`,
    mindsetCheck: {
      question: 'Why does `def append_item(x, items=[]): items.append(x); return items` cause bugs in production?',
      options: [
        { id: 'a', text: 'Lists cannot be passed as function parameters in Python' },
        { id: 'b', text: 'The default list is created once at `def` time and reused across every subsequent call' },
        { id: 'c', text: 'append() returns None instead of the list' },
      ],
      correctId: 'b',
      explanation: 'Python evaluates default parameter values once when defining the function, not on each call. Always default mutable args to None and instantiate inside the function.',
    },
    refactorDrill: {
      prompt: 'Fix the mutable default dictionary bug using the None sentinel pattern.',
      starterCode: `def record_metric(name, value, store={}):
    store[name] = value
    return store`,
      quickBlocks: [
        { label: 'None sentinel', snippet: 'def record_metric(name, value, store=None):\n    if store is None:\n        store = {}\n    store[name] = value\n    return store' },
      ],
      rules: [
        {
          id: 'default-none',
          label: 'Replace store={} default with store=None',
          hint: 'Change the signature parameter to store=None.',
          test: (code) => /def\s+record_metric\s*\([^)]*store[^)]*=\s*None/.test(code) && !/store\s*=\s*\{\}/.test(code),
        },
        {
          id: 'init-dict',
          label: 'Initialize a fresh {} inside the function when store is None',
          hint: 'Add `if store is None: store = {}`.',
          test: (code) => /if\s+store\s+is\s+None\s*:/.test(code) && /store\s*=\s*\{\}/.test(code),
        },
      ],
      referenceSolution: `def record_metric(name, value, store=None):
    if store is None:
        store = {}
    store[name] = value
    return store`,
    },
  },
  {
    id: 'j2p-context-managers',
    number: 8,
    tier: 'OOP & Safety',
    title: 'From try-with-resources & AutoCloseable to `with` Context Managers',
    shortTitle: 'try-with-resources vs with',
    javaHabit: 'Implementing AutoCloseable on a class and wrapping file/DB handles in try (var r = ...) { ... }.',
    pythonicPrinciple: 'Always wrap files, locks, sockets, and transactions in `with ...:` — and write custom resource guards in 5 lines using @contextmanager + yield.',
    versionScope: 'Java 7+ try-with-resources ↔ Python 2.5+/3+ Core',
    plainEnglishAnalogy:
      'Think of `with` like a hotel keycard slot by the door: the moment you walk in (__enter__), the lights turn on; the moment you leave (__exit__)—even if an alarm goes off (an exception)—the power shuts off cleanly so nothing leaks.',
    formalExplanation:
      'Java’s try-with-resources invokes AutoCloseable.close() deterministically on block exit. Python’s `with` statement executes __enter__() on entry and guarantees __exit__(exc_type, exc_val, exc_tb) on exit. Using contextlib.contextmanager lets any generator with a single `yield` inside `try/finally` act as a full context manager without boilerplate classes.',
    javaCode: `try (BufferedReader br = Files.newBufferedReader(Path.of("orders.csv"))) {
    String line;
    while ((line = br.readLine()) != null) {
        process(line);
    }
} // br.close() guaranteed even if process() throws`,
    javaAccentedPython: `# Anti-pattern: manual open() + close() (leaks file descriptor on error!)
f = open("orders.csv", "r", encoding="utf-8")
for line in f:
    process(line)
f.close()  # NEVER RUNS if process(line) raises an exception!`,
    whyAntiPatternHurts:
      'If process(line) throws an exception, f.close() is skipped, leaking OS file descriptors (and risking unflushed write buffers on PyPy/Jython or under high concurrency).',
    pythonicCode: `from pathlib import Path

# Pythonic: deterministic cleanup + lazy line-by-line iteration
with Path("orders.csv").open("r", encoding="utf-8") as f:
    for line in f:
        process(line)  # O(1) RAM streaming; f.close() guaranteed!`,
    whyPythonicWins:
      'The `with` block guarantees deterministic file closure even on exceptions, Path handles cross-platform OS separators cleanly, and iterating directly over `f` streams one line at a time in O(1) RAM.',
    keyMentalShifts: [
      {
        javaWay: 'try (BufferedReader br = ...) { ... }',
        pythonWay: 'with open(path, encoding="utf-8") as f:',
        why: 'Deterministic close via __enter__/__exit__ protocol.',
      },
      {
        javaWay: 'lock.lock(); try { ... } finally { lock.unlock(); }',
        pythonWay: 'with lock:',
        why: 'Python Lock, RLock, and Semaphore natively implement context managers!',
      },
      {
        javaWay: 'Custom class implementing AutoCloseable',
        pythonWay: '@contextmanager def managed(): setup(); try: yield finally: teardown()',
        why: 'Zero boilerplate class for custom timers, DB transactions, or temp dirs.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Enter Managed Scope',
        javaMentalModel: 'JVM initializes resource inside try(...) header.',
        pythonMentalModel: 'BEFORE_WITH opcode calls resource.__enter__() and binds `as f`.',
        memoryDifference: 'File descriptor acquired and registered with exit handler.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Stream Lines in O(1) Memory',
        javaMentalModel: 'br.readLine() buffers chunks and returns each line until null.',
        pythonMentalModel: 'for line in f uses C buffered I/O iterator without loading full file.',
        memoryDifference: 'Avoids f.read() / Files.readString() O(file_size) RAM spike.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Exception Unwinding Protection',
        javaMentalModel: 'Suppressed exceptions attach if close() also throws.',
        pythonMentalModel: 'CPython invokes __exit__(exc_type, exc_val, exc_tb) during unwinding.',
        memoryDifference: 'Cleanup executes deterministically before stack frame pops.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Release OS Handle',
        javaMentalModel: 'AutoCloseable.close() releases kernel FD immediately.',
        pythonMentalModel: 'f.__exit__() flushes buffers and releases kernel FD immediately.',
        memoryDifference: 'Zero leaked sockets, locks, or file descriptors.',
      },
    ],
    mermaidDfd: `flowchart LR
  OPEN["with open('orders.csv') as f"] -->|"__enter__()"| FD["Kernel File Descriptor"]
  FD -->|"for line in f (O(1) RAM)"| PROC["process(line)"]
  PROC -->|"Normal Exit"| EXIT["__exit__() Flush & Close"]
  PROC -.->|"Exception Raised"| EXIT
  EXIT -->|"FD Released"| DONE["Zero Resource Leak"]`,
    mindsetCheck: {
      question: 'Which Python line safely acquires and releases a `threading.Lock()` identically to Java’s `lock.lock(); try { ... } finally { lock.unlock(); }`?',
      options: [
        { id: 'a', text: 'using lock:' },
        { id: 'b', text: 'with lock:' },
        { id: 'c', text: 'synchronized(lock):' },
      ],
      correctId: 'b',
      explanation: 'Python’s threading.Lock, RLock, Condition, and Semaphore all implement __enter__ (acquire) and __exit__ (release), so `with lock:` guarantees unlock even if an exception occurs.',
    },
    refactorDrill: {
      prompt: 'Rewrite the leaky open()/close() file reader using a `with` context manager and lazy line iteration.',
      starterCode: `f = open("events.log", "r", encoding="utf-8")
lines = f.readlines()
for line in lines:
    print(line.strip())
f.close()`,
      quickBlocks: [
        { label: 'with open(...)', snippet: 'with open("events.log", "r", encoding="utf-8") as f:\n    for line in f:\n        print(line.strip())' },
      ],
      rules: [
        {
          id: 'use-with',
          label: 'Wrap open(...) in a `with ... as f:` context manager',
          hint: 'Use `with open("events.log", "r", encoding="utf-8") as f:`.',
          test: (code) => /\bwith\s+open\s*\([^)]+\)\s+as\s+\w+\s*:/.test(code),
        },
        {
          id: 'no-readlines',
          label: 'Stream directly with `for line in f:` instead of loading full RAM with readlines()',
          hint: 'Remove f.readlines() and f.close() and iterate directly over f.',
          test: (code) => !/\.readlines\s*\(/.test(code) && !/\.close\s*\(/.test(code),
        },
      ],
      referenceSolution: `with open("events.log", "r", encoding="utf-8") as f:
    for line in f:
        print(line.strip())`,
    },
  },
  {
    id: 'j2p-first-class-functions',
    number: 9,
    tier: 'Data & Flow',
    title: 'From Strategy Classes & Comparators to First-Class Functions & key= Callables',
    shortTitle: 'First-Class Functions',
    javaHabit: 'Creating a Strategy interface plus 3 concrete classes or a verbose Comparator<User> just to customize sorting or behavior.',
    pythonicPrinciple: 'Functions are first-class objects in Python. Pass functions directly in dicts/arguments, sort with key=lambda or operator.attrgetter, and wrap behavior with decorators.',
    versionScope: 'Java 1+ / 8+ Lambdas ↔ Python 0+ Core',
    plainEnglishAnalogy:
      'In Java 1–7 you had to wrap a verb (an action) inside a noun (an interface class) just to hand it to another method. In Python, verbs are first-class citizens—you can store functions inside a dictionary like a dispatch table and call `handlers[event](payload)` directly!',
    formalExplanation:
      'Because Python functions are heap objects implementing __call__, patterns that require Strategy, Command, or Factory hierarchies in classical Java collapse into plain callable parameters or dict dispatch tables. Python’s Timsort uses a Decorate-Sort-Undecorate key function (`key=`) computed once per element (O(n) key calls) rather than Java’s pairwise Comparator (O(n log n) calls).',
    javaCode: `// Java Comparator sorting + Strategy dispatch
users.sort(Comparator.comparingInt(User::getScore).reversed()
                     .thenComparing(User::getName));

Map<String, Function<Double, Double>> pricing = Map.of(
    "vip", amount -> amount * 0.8,
    "std", amount -> amount
);`,
    javaAccentedPython: `# Anti-pattern: manual Strategy class hierarchy + cmp_to_key
class DiscountStrategy:
    def apply(self, amount): raise NotImplementedError

class VipStrategy(DiscountStrategy):
    def apply(self, amount): return amount * 0.8

class StdStrategy(DiscountStrategy):
    def apply(self, amount): return amount`,
    whyAntiPatternHurts:
      'Creating single-method Strategy classes in Python duplicates what plain functions already do natively with zero class boilerplate and faster dispatch.',
    pythonicCode: `# Pythonic: function dispatch table + Timsort key tuple!
def vip_price(amount: float) -> float:
    return amount * 0.8

def std_price(amount: float) -> float:
    return amount

PRICING = {"vip": vip_price, "std": std_price}
final = PRICING["vip"](250.0)

# Multi-key Timsort: score descending, then name ascending
ranked = sorted(users, key=lambda u: (-u.score, u.name))`,
    whyPythonicWins:
      'Tuple keys `(-u.score, u.name)` express multi-field sorting in one expression, `key=` runs O(n) times instead of O(n log n) comparator callbacks, and function dicts replace Strategy boilerplate.',
    keyMentalShifts: [
      {
        javaWay: 'Single-method Strategy interface + 4 subclasses',
        pythonWay: 'Pass plain functions or store them in a dict dispatch table',
        why: 'Functions are objects with __call__—no wrapper class required.',
      },
      {
        javaWay: 'Comparator.comparing(...).thenComparing(...)',
        pythonWay: 'sorted(items, key=lambda x: (-x.score, x.name))',
        why: 'Python compares tuples lexicographically and evaluates key once per item.',
      },
      {
        javaWay: 'Proxy / AOP Aspect class for logging or timing',
        pythonWay: '@functools.wraps decorator wrapping any function',
        why: 'Clean, composable cross-cutting wrappers in 6 lines.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Store Function References (Not Calls!)',
        javaMentalModel: 'Method references (User::getScore) compile to invokedynamic functional interfaces.',
        pythonMentalModel: 'PRICING = {"vip": vip_price} stores function object pointers in dict slots.',
        memoryDifference: 'Notice no () after vip_price—you pass the function object itself.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'O(1) Strategy Dispatch',
        javaMentalModel: 'Looks up Strategy object in Map and invokes .apply(250.0).',
        pythonMentalModel: 'PRICING["vip"](250.0) fetches callable in O(1) and calls it directly.',
        memoryDifference: 'Zero wrapper instance allocation.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Timsort Key Extraction',
        javaMentalModel: 'Comparator compares pairs up to O(n log n) times during Timsort.',
        pythonMentalModel: 'Python computes key tuple (-u.score, u.name) exactly once per user (O(n)).',
        memoryDifference: 'Faster C-level tuple comparisons inside Timsort.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Stable Sorted Output',
        javaMentalModel: 'List.sort() mutates in place; Stream.sorted() returns new sequence.',
        pythonMentalModel: 'sorted(users, ...) returns a new list; users.sort(...) mutates in place (returns None!).',
        memoryDifference: 'Remember: list.sort() returns None by design to signal in-place mutation.',
      },
    ],
    mermaidDfd: `flowchart LR
  TBL["Function Dict: PRICING"] -->|"O(1) Lookup"| FN["Callable: vip_price"]
  FN -->|"Invoke(250.0)"| RES["200.0"]
  USR["Users List"] -->|"O(n) Key Extract"| KEY["Tuple Key: (-score, name)"]
  KEY -->|"Stable Timsort"| SORT["Ranked Users List"]`,
    mindsetCheck: {
      question: 'What does `result = my_list.sort()` assign to `result` in Python?',
      options: [
        { id: 'a', text: 'A brand-new sorted copy of my_list' },
        { id: 'b', text: 'None — because .sort() mutates my_list in place; use sorted(my_list) for a new list' },
        { id: 'c', text: 'The length of my_list' },
      ],
      correctId: 'b',
      explanation: 'Python follows Command-Query Separation on built-in mutators: list.sort(), list.reverse(), and list.append() mutate in place and return None so you never confuse mutation with copying.',
    },
    refactorDrill: {
      prompt: 'Sort `products` by price ascending, then by name ascending, returning a new list without mutating `products`.',
      starterCode: `products = [("Mouse", 25), ("Cable", 10), ("Adapter", 10)]
# TODO: use sorted() with a tuple key (price, name)
ordered = products`,
      quickBlocks: [
        { label: 'sorted() with tuple key', snippet: 'ordered = sorted(products, key=lambda p: (p[1], p[0]))' },
      ],
      rules: [
        {
          id: 'use-sorted',
          label: 'Use sorted(products, ...) to return a new list without mutating products',
          hint: 'Call sorted(products, key=...) instead of products.sort().',
          test: (code) => /\bsorted\s*\(\s*products\b/.test(code),
        },
        {
          id: 'tuple-key',
          label: 'Provide a tuple key `(p[1], p[0])` for price then name',
          hint: 'Use key=lambda p: (p[1], p[0]).',
          test: (code) => /key\s*=\s*lambda\s+\w+\s*:\s*\(\s*\w+\[1\]\s*,\s*\w+\[0\]\s*\)/.test(code),
        },
      ],
      referenceSolution: `products = [("Mouse", 25), ("Cable", 10), ("Adapter", 10)]
ordered = sorted(products, key=lambda p: (p[1], p[0]))`,
    },
  },
  {
    id: 'j2p-equality-hashing-dunders',
    number: 10,
    tier: 'Runtime & Scale',
    title: 'From toString/equals/hashCode to Dunder Protocols (__repr__, __eq__, __hash__) & Dataclasses',
    shortTitle: 'Dunders & Data Models',
    javaHabit: 'Writing boilerplate equals(), hashCode(), toString() overrides (or Java 16+ record) so objects work cleanly in HashMap/HashSet.',
    pythonicPrinciple: 'Python hooks into operators and built-ins via double-underscore ("dunder") protocols—and @dataclass(frozen=True) auto-generates __init__, __repr__, __eq__, and __hash__ in 3 lines.',
    versionScope: 'Java 1+ Object / 16+ record ↔ Python 0+ Dunders / 3.7+ dataclass',
    plainEnglishAnalogy:
      'In Java, Object defines `toString()`, `equals()`, and `hashCode()`. In Python, those exact hooks are `__repr__`, `__eq__`, and `__hash__`—and just like Java `record`, `@dataclass(frozen=True)` writes all of them for you cleanly and bug-free!',
    formalExplanation:
      'Both Java and Python enforce the fundamental Hash Contract: if a == b, then hash(a) == hash(b). In Python, defining __eq__ on a mutable class automatically sets __hash__ = None (making it unhashable) to protect dict/set invariants from silent bucket corruption—preventing a classic Java HashMap key-mutation bug!',
    javaCode: `// Java 1+ POJO (or Java 16+ record Point(int x, int y) {})
public final class Point {
    public final int x, y;
    public Point(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) { ... }
    @Override public int hashCode() { return Objects.hash(x, y); }
    @Override public String toString() { return "Point(" + x + "," + y + ")"; }
}`,
    javaAccentedPython: `# Anti-pattern: hand-writing verbose __init__, __eq__, __repr__
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"
    def __eq__(self, other):
        return isinstance(other, Point) and self.x == other.x and self.y == other.y
    # Forgot __hash__ -> TypeError when placed in a set or dict key!`,
    whyAntiPatternHurts:
      'Hand-writing boilerplate methods invites drift when you add a new field, and defining __eq__ without immutability disables __hash__.',
    pythonicCode: `from dataclasses import dataclass

# Pythonic: immutable, hashable, zero-boilerplate value object!
@dataclass(frozen=True, slots=True)
class Point:
    x: int
    y: int

visited = {Point(1, 2), Point(1, 2)}  # Length 1! Works in set & dict keys`,
    whyPythonicWins:
      '@dataclass(frozen=True, slots=True) auto-generates __init__, __repr__, __eq__, and __hash__, rejects accidental mutation, and saves ~40% per-instance RAM by replacing __dict__ with fixed C slots.',
    keyMentalShifts: [
      {
        javaWay: 'toString() / equals() / hashCode()',
        pythonWay: '__repr__() / __eq__() / __hash__()',
        why: 'Direct 1-to-1 conceptual mapping onto Python’s data model.',
      },
      {
        javaWay: 'Java 16+ record Point(int x, int y) {}',
        pythonWay: '@dataclass(frozen=True, slots=True) class Point:',
        why: 'Immutable, value-compared, hashable, compact memory footprint.',
      },
      {
        javaWay: 'HashMap silently loses key if mutable field changes',
        pythonWay: 'Mutable classes with __eq__ automatically set __hash__ = None',
        why: 'Python prevents hash-bucket corruption loudly at insert time.',
      },
    ],
    traceSteps: [
      {
        stepNumber: 1,
        stage: 'parse',
        title: 'Generate Value Methods',
        javaMentalModel: 'javac synthesizes constructor, accessors, equals, hashCode, toString for record.',
        pythonMentalModel: '@dataclass decorator inspects type annotations and synthesizes dunder methods at class creation.',
        memoryDifference: 'slots=True removes per-instance __dict__, matching compact fixed-slot object layouts.',
      },
      {
        stepNumber: 2,
        stage: 'bind',
        title: 'Compute Hash Bucket',
        javaMentalModel: 'Objects.hash(x, y) computes 32-bit int hash for HashSet bucket.',
        pythonMentalModel: 'Point.__hash__ hashes tuple (self.x, self.y) for set open-addressing table.',
        memoryDifference: 'Immutability guarantees hash never drifts after insertion.',
      },
      {
        stepNumber: 3,
        stage: 'dispatch',
        title: 'Deduplicate Equal Instances',
        javaMentalModel: 'HashSet checks hashCode() then equals() → rejects duplicate Point(1, 2).',
        pythonMentalModel: 'set checks hash() then __eq__() → keeps single Point(1, 2).',
        memoryDifference: 'Identical mathematical contract across both runtimes.',
      },
      {
        stepNumber: 4,
        stage: 'output',
        title: 'Readable Debug Representation',
        javaMentalModel: 'System.out.println(p) calls p.toString().',
        pythonMentalModel: 'print(p) / debugger calls p.__repr__() → "Point(x=1, y=2)".',
        memoryDifference: 'Never see unreadable `Point@5e2de80c` memory addresses again.',
      },
    ],
    mermaidDfd: `flowchart LR
  DEC["@dataclass(frozen=True, slots=True)"] -->|"Synthesizes"| DUND["__init__ + __repr__ + __eq__ + __hash__"]
  DUND -->|"Compact Memory"| SLOT["Fixed C Slots (No __dict__)"]
  DUND -->|"Hash Contract"| SET["Safe Dict Key / Set Element"]
  SLOT -->|"Read/Hash"| OUT["O(1) Value Equality & Lookup"]`,
    mindsetCheck: {
      question: 'Why does adding `frozen=True` to `@dataclass` make instances usable as dictionary keys and set elements?',
      options: [
        { id: 'a', text: 'Because frozen dataclasses are stored on the CPU stack' },
        { id: 'b', text: 'Because immutability allows Python to safely auto-generate __hash__ without risking bucket corruption' },
        { id: 'c', text: 'Because frozen dataclasses bypass __eq__ completely' },
      ],
      correctId: 'b',
      explanation: 'Hash keys must not mutate their hash value while inside a dict or set. frozen=True enforces immutability so @dataclass can safely synthesize __hash__.',
    },
    refactorDrill: {
      prompt: 'Turn this boilerplate class into an immutable, hashable Pythonic value object using @dataclass(frozen=True).',
      starterCode: `class Coordinate:
    def __init__(self, lat, lng):
        self.lat = lat
        self.lng = lng`,
      quickBlocks: [
        { label: 'import dataclass', snippet: 'from dataclasses import dataclass' },
        { label: '@dataclass(frozen=True)', snippet: '@dataclass(frozen=True)\nclass Coordinate:\n    lat: float\n    lng: float' },
      ],
      rules: [
        {
          id: 'import-dc',
          label: 'Import dataclass from dataclasses',
          hint: 'Add `from dataclasses import dataclass`.',
          test: (code) => /from\s+dataclasses\s+import\s+dataclass/.test(code),
        },
        {
          id: 'frozen-dc',
          label: 'Decorate Coordinate with @dataclass(frozen=True...)',
          hint: 'Use @dataclass(frozen=True) and declare lat: float and lng: float.',
          test: (code) => /@dataclass\s*\([^)]*frozen\s*=\s*True/.test(code) && /lat\s*:\s*float/.test(code) && /lng\s*:\s*float/.test(code),
        },
      ],
      referenceSolution: `from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class Coordinate:
    lat: float
    lng: float`,
    },
  },
];

/* ============================================================================
   PART 2: 6 NEW VERSION-AGNOSTIC CORE VISUAL FLOWS (JAVA 1+ & PYTHON 0+ GAPS)
   ============================================================================ */

export const CORE_LANGUAGE_VISUAL_FLOWS: LangVisualFlow[] = [
  {
    id: 'core-py-name-binding',
    language: 'python',
    level: 'Basic',
    category: 'Python 0+ Core Foundations',
    shortTitle: 'Name Binding & Aliasing',
    title: 'Python 0+ Core: Variables as Labels, Aliasing, Mutability & Shallow vs. Deep Copy',
    tagline: 'See why `b = a` shares the exact same list object in Python—and how copying separates them safely.',
    standardDefinition:
      'In Python (all versions 0+ through 3.x), variables are untyped name bindings in a frame namespace pointing to typed PyObject instances on the heap. Assignment binds references (aliasing); mutating a shared mutable object (list/dict/set) is visible through every alias.',
    algorithmName: 'Reference Binding + Reference Count Increment + Shallow/Deep Graph Copy',
    complexity: 'Alias assignment O(1) · Shallow copy O(n) · Deep copy O(nodes + edges)',
    nodes: [
      { id: 'frame', label: 'Stack Frame', sublabel: 'a, b Names', x: 85, y: 120, kind: 'source' },
      { id: 'list1', label: 'Heap List #1', sublabel: '[10, 20, 30]', x: 280, y: 68, kind: 'memory' },
      { id: 'mutate', label: 'b.append(40)', sublabel: 'In-Place Mutate', x: 470, y: 68, kind: 'process' },
      { id: 'copyop', label: 'a.copy()', sublabel: 'New Heap Slot', x: 280, y: 185, kind: 'runtime' },
      { id: 'list2', label: 'Heap List #2', sublabel: 'Independent Copy', x: 485, y: 185, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'frame', to: 'list1', label: 'a = [10,20]; b = a' },
      { id: 'e2', from: 'list1', to: 'mutate', label: 'Shared Ref' },
      { id: 'e3', from: 'frame', to: 'copyop', label: 'c = a.copy()' },
      { id: 'e4', from: 'copyop', to: 'list2', label: 'New PyListObject' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Create List & Bind Label `a`',
        plainEnglish: 'Python allocates a list object [10, 20] on the heap and sticks the label "a" onto it.',
        technicalDetail: 'PyListObject allocated with ob_refcnt = 1; frame locals table stores pointer under name "a".',
        activeNodeIds: ['frame', 'list1'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'refcnt=1',
        metrics: [{ label: 'a id()', value: '0x7f01' }, { label: 'Ref Count', value: '1' }],
      },
      {
        stepNumber: 2,
        title: '2. Alias Assignment `b = a`',
        plainEnglish: 'No list is copied! Python simply sticks a second label "b" onto the exact same heap list.',
        technicalDetail: 'STORE_FAST copies pointer only in O(1); ob_refcnt increments to 2 (`a is b` is True).',
        activeNodeIds: ['frame', 'list1'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'a is b',
        metrics: [{ label: 'a is b', value: 'True' }, { label: 'Ref Count', value: '2' }],
      },
      {
        stepNumber: 3,
        title: '3. Mutate via `b.append(40)`',
        plainEnglish: 'Appending through `b` changes the shared list—so reading `a` immediately shows 40 too!',
        technicalDetail: 'list.append mutates underlying PyObject* array in place; all aliases observe the update.',
        activeNodeIds: ['list1', 'mutate'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'in-place',
        metrics: [{ label: 'a value', value: '[10, 20, 40]' }, { label: 'Copy Cost', value: '0 bytes' }],
      },
      {
        stepNumber: 4,
        title: '4. Isolate with `c = a.copy()`',
        plainEnglish: 'Calling .copy() (or copy.deepcopy() for nested lists) allocates a brand-new list so mutations stay isolated.',
        technicalDetail: 'Allocates distinct PyListObject at 0x7f99; `c is a` is False while `c == a` is True.',
        activeNodeIds: ['frame', 'copyop', 'list2'],
        activeEdgeIds: ['e3', 'e4'],
        packetEdgeId: 'e4',
        packetLabel: 'new obj',
        metrics: [{ label: 'c is a', value: 'False' }, { label: 'c == a', value: 'True' }],
      },
    ],
    asciiDfd: {
      level0: '[Name Assignment] --> (Python Frame Bindings) --> [Heap PyObjects]',
      level1: 'Frame(a, b) --[same ptr]--> HeapList#1 --[b.append]--> Mutates Both\nFrame(c) --[a.copy()]--> HeapList#2 (Isolated)',
    },
  },
  {
    id: 'core-java-stack-heap-strings',
    language: 'java',
    level: 'Basic',
    category: 'Java 1+ Core Foundations',
    shortTitle: 'Stack, Heap & String Pool',
    title: 'Java 1+ Core: Stack Primitives, Heap Objects, String Pool & Pass-by-Value',
    tagline: 'Visualize why `int` lives directly on the thread stack, why `"hi" == "hi"` vs `new String("hi")` differ, and how Java passes references by value.',
    standardDefinition:
      'Every Java thread owns a private JVM Stack storing primitive values (int, long, double, boolean) and object reference pointers, while all objects and arrays live on the shared Heap. String literals are interned inside the Heap String Constant Pool.',
    algorithmName: 'JVM Frame Slot Allocation + Constant Pool Interning + Reference-By-Value Copy',
    complexity: 'Stack primitive access O(1) zero-GC · String literal lookup O(1) interned',
    nodes: [
      { id: 'stack', label: 'Thread Stack', sublabel: 'int x=42, ref s1', x: 85, y: 120, kind: 'source' },
      { id: 'pool', label: 'String Pool', sublabel: 'Interned "java"', x: 285, y: 65, kind: 'memory' },
      { id: 'heap', label: 'JVM Heap', sublabel: 'new String("java")', x: 285, y: 185, kind: 'memory' },
      { id: 'eq', label: '== vs .equals()', sublabel: 'Ptr vs Value', x: 510, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'stack', to: 'pool', label: 's1, s2 = "java"' },
      { id: 'e2', from: 'stack', to: 'heap', label: 's3 = new String()' },
      { id: 'e3', from: 'pool', to: 'eq', label: 's1 == s2 (true)' },
      { id: 'e4', from: 'heap', to: 'eq', label: 's1 == s3 (false!)' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Primitives Live Directly on Stack',
        plainEnglish: '`int count = 42` stores the actual number 42 inside the method’s stack frame—no heap object, no GC needed!',
        technicalDetail: 'JVM bytecode `bipush 42; istore_1` writes 32 bits directly into local variable slot 1.',
        activeNodeIds: ['stack'],
        activeEdgeIds: [],
        metrics: [{ label: 'Heap Alloc', value: '0 bytes' }, { label: 'Slot Size', value: '4 bytes' }],
      },
      {
        stepNumber: 2,
        title: '2. String Literals Share the String Pool',
        plainEnglish: 'Both `s1 = "java"` and `s2 = "java"` point to the exact same interned String object in the String Pool.',
        technicalDetail: 'LDC loads canonical constant-pool reference; `s1 == s2` compares identical memory addresses.',
        activeNodeIds: ['stack', 'pool'],
        activeEdgeIds: ['e1', 'e3'],
        packetEdgeId: 'e1',
        packetLabel: 'interned',
        metrics: [{ label: 's1 == s2', value: 'true' }, { label: 'Objects', value: '1 shared' }],
      },
      {
        stepNumber: 3,
        title: '3. `new String("java")` Forces a Distinct Heap Object',
        plainEnglish: 'Calling `new String(...)` allocates a second object on the Heap—so `==` returns false even though the text is identical!',
        technicalDetail: 'Reference comparison (`if_acmpeq`) compares pointers; always use `.equals()` for String content equality.',
        activeNodeIds: ['stack', 'heap', 'eq'],
        activeEdgeIds: ['e2', 'e4'],
        packetEdgeId: 'e4',
        packetLabel: 'ptr != ptr',
        metrics: [{ label: 's1 == s3', value: 'false' }, { label: 's1.equals(s3)', value: 'true' }],
      },
      {
        stepNumber: 4,
        title: '4. Always Use `.equals()` (or `Objects.equals`)',
        plainEnglish: 'To compare values safely—even if a variable might be null—use `Objects.equals(s1, s3)`.',
        technicalDetail: 'Objects.equals short-circuits on identity, guards null safely, and delegates to String.equals byte[] comparison.',
        activeNodeIds: ['eq'],
        activeEdgeIds: ['e3', 'e4'],
        metrics: [{ label: 'Null-Safe', value: 'Objects.equals' }, { label: 'Bug Risk', value: 'Eliminated' }],
      },
    ],
    asciiDfd: {
      level0: '[Java Method Vars] --> (JVM Stack + Heap String Pool) --> [Identity vs Equality]',
      level1: 'Stack(x=42) -> Value in slot\nStack(s1,s2) -> StringPool("java") [== true]\nStack(s3) -> Heap(new String) [== false, .equals true]',
    },
  },
  {
    id: 'core-py-iterator-generator',
    language: 'python',
    level: 'Basic',
    category: 'Python 0+ Core Foundations',
    shortTitle: 'Iterators & Lazy yield',
    title: 'Python 0+ Core: Iterator Protocol, Slicing & Lazy `yield` Streaming Pipeline',
    tagline: 'Watch how `yield` pauses a function’s stack frame mid-execution to stream 10 million records using O(1) memory.',
    standardDefinition:
      'Any object implementing __iter__() and __next__() obeys Python’s Iterator Protocol. Generator functions containing `yield` compile into resumable heap frames that suspend local state between iterations and terminate via StopIteration.',
    algorithmName: 'Resumable Coroutine Frame Suspension + Pull-Based Lazy Streaming',
    complexity: 'Time O(n) total · Auxiliary Memory O(1) regardless of stream length',
    nodes: [
      { id: 'file', label: 'Log File Stream', sublabel: '10M Rows on Disk', x: 80, y: 120, kind: 'source' },
      { id: 'gen', label: 'Generator (yield)', sublabel: 'Paused Frame', x: 260, y: 120, kind: 'runtime' },
      { id: 'flt', label: 'Filter Stage', sublabel: 'if "ERROR" in row', x: 440, y: 120, kind: 'process' },
      { id: 'out', label: 'Consumer Loop', sublabel: 'for err in pipe:', x: 600, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'file', to: 'gen', label: '1 line' },
      { id: 'e2', from: 'gen', to: 'flt', label: 'yield row' },
      { id: 'e3', from: 'flt', to: 'out', label: 'next() match' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Calling Generator Does NOT Run Body Yet',
        plainEnglish: 'Calling `read_errors(path)` instantly returns a generator object without reading a single byte from disk.',
        technicalDetail: 'CPython allocates a PyGenObject holding an unstarted frame and instruction pointer (f_lasti).',
        activeNodeIds: ['gen'],
        activeEdgeIds: [],
        metrics: [{ label: 'Lines Read', value: '0' }, { label: 'RAM Used', value: '~200 bytes' }],
      },
      {
        stepNumber: 2,
        title: '2. Consumer Pulls `next()`',
        plainEnglish: 'The `for` loop asks for one item. The generator wakes up, reads one line, and hits `yield`.',
        technicalDetail: 'Frame resumes until YIELD_VALUE suspends execution and hands the single string to caller.',
        activeNodeIds: ['file', 'gen'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'row #1',
        metrics: [{ label: 'Buffer', value: '1 line' }, { label: 'Memory', value: 'O(1)' }],
      },
      {
        stepNumber: 3,
        title: '3. Chain Lazy Filter Stage',
        plainEnglish: 'Chained generator expressions pass only matching ERROR lines downstream without ever allocating a giant list.',
        technicalDetail: 'Pull-based pipeline composes cleanly: each next() propagates upstream just enough to yield 1 match.',
        activeNodeIds: ['gen', 'flt', 'out'],
        activeEdgeIds: ['e2', 'e3'],
        packetEdgeId: 'e3',
        packetLabel: 'ERROR',
        metrics: [{ label: 'Peak RAM', value: 'Constant O(1)' }, { label: 'Early Exit', value: 'Instant break' }],
      },
    ],
    asciiDfd: {
      level0: '[Large Disk File] --> (Lazy Generator Pipeline) --> [O(1) RAM Consumer]',
      level1: 'FileLineIter -> yield line -> FilterGen(ERROR) -> Consumer.next() -> StopIteration',
    },
  },
  {
    id: 'core-java-javac-jvm-basics',
    language: 'java',
    level: 'Basic',
    category: 'Java 1+ Core Foundations',
    shortTitle: 'javac -> Bytecode -> JVM',
    title: 'Java 1+ Core Lifecycle: Source (.java) -> javac -> Bytecode (.class) -> ClassLoader -> JVM Execution',
    tagline: 'Understand "Write Once, Run Anywhere" from first principles: how Java compiles statically before executing safely on any OS.',
    standardDefinition:
      'The Java toolchain separates compile-time static type verification (`javac` emitting platform-independent JVM bytecode `.class` files) from runtime execution (ClassLoader loading/verification, Bytecode Interpreter, and JIT native compilation on the host CPU).',
    algorithmName: 'Static Type Checking + Bytecode Verification + Stack-Machine Interpretation',
    complexity: 'Compile-time type errors caught before deploy · O(1) verified bytecode dispatch',
    nodes: [
      { id: 'src', label: 'Source (.java)', sublabel: 'Static Types', x: 80, y: 120, kind: 'source' },
      { id: 'javac', label: 'javac Compiler', sublabel: 'Type Check', x: 235, y: 120, kind: 'process' },
      { id: 'cls', label: 'Bytecode (.class)', sublabel: 'OS-Neutral', x: 395, y: 120, kind: 'memory' },
      { id: 'jvm', label: 'ClassLoader + JVM', sublabel: 'Verify & Run', x: 565, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'src', to: 'javac', label: 'Parse & Check' },
      { id: 'e2', from: 'javac', to: 'cls', label: 'Emit Opcodes' },
      { id: 'e3', from: 'cls', to: 'jvm', label: 'Load & Verify' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Static Type Checking by `javac`',
        plainEnglish: 'Before your program ever runs, `javac` checks every variable type, method signature, and import.',
        technicalDetail: 'Catches mismatched types, missing returns, and undefined symbols at compile time rather than in production.',
        activeNodeIds: ['src', 'javac'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: 'AST Check',
        metrics: [{ label: 'Type Safety', value: 'Compile-Time' }, { label: 'Target', value: 'JVM Spec' }],
      },
      {
        stepNumber: 2,
        title: '2. Emit Portable `.class` Bytecode',
        plainEnglish: 'The same `.class` or `.jar` file runs unchanged on Linux, macOS, Windows, ARM, or x86.',
        technicalDetail: 'Bytecode instructions (iload, invokevirtual, return) target the abstract JVM stack machine.',
        activeNodeIds: ['javac', 'cls'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: '.class JAR',
        metrics: [{ label: 'Portability', value: 'Any OS/CPU' }, { label: 'Format', value: '0xCAFEBABE' }],
      },
      {
        stepNumber: 3,
        title: '3. ClassLoader Verification & Execution',
        plainEnglish: 'The JVM loads classes lazily on first use, verifies memory safety, interprets bytecode, and compiles hot loops to native machine code.',
        technicalDetail: 'Bytecode verifier prevents illegal pointer casts and stack overflows; JIT compiles hot methods for C++-class speed.',
        activeNodeIds: ['cls', 'jvm'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: 'Native JIT',
        metrics: [{ label: 'Memory Safe', value: 'Verified' }, { label: 'Hot Loops', value: 'Native CPU' }],
      },
    ],
    asciiDfd: {
      level0: '[.java Source] --> (javac + JVM Runtime) --> [Native CPU Execution]',
      level1: 'App.java --[javac]--> App.class --[ClassLoader/Verifier]--> Interpreter --> JIT Native Code',
    },
  },
  {
    id: 'core-java-stringbuilder-perf',
    language: 'java',
    level: 'Intermediate',
    category: 'Java 1+ Core Foundations',
    shortTitle: 'StringBuilder O(n) Buffer',
    title: 'Java 1+ Core: Why Loop `s += x` is O(n²) vs. `StringBuilder` O(n) Amortized Buffer',
    tagline: 'See the exact memory allocation difference between immutable String copies in a loop and a mutable resizable buffer.',
    standardDefinition:
      'Because Java String is immutable, concatenating inside a loop allocates a fresh backing array and copies all previous characters on every iteration (O(n²) time and garbage). StringBuilder maintains a mutable resizable byte[]/char[] buffer with 2x geometric growth for O(n) amortized cost.',
    algorithmName: 'Geometric Array Doubling (Amortized O(1) Append)',
    complexity: 'Loop `+=`: O(n²) time & GC · StringBuilder: O(n) time & 1 final String',
    nodes: [
      { id: 'loop', label: 'For Loop (n=10k)', sublabel: 'Append Tokens', x: 85, y: 120, kind: 'source' },
      { id: 'bad', label: 'String s += x', sublabel: '10k Dead Copies', x: 295, y: 65, kind: 'process' },
      { id: 'sb', label: 'StringBuilder', sublabel: 'Mutable byte[]', x: 295, y: 185, kind: 'memory' },
      { id: 'out', label: 'sb.toString()', sublabel: '1 Final String', x: 520, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'loop', to: 'bad', label: 'O(n^2) Copies' },
      { id: 'e2', from: 'loop', to: 'sb', label: 'O(1) Amortized' },
      { id: 'e3', from: 'sb', to: 'out', label: 'Single Freeze' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. The O(n²) Trap: `s += item` Inside a Loop',
        plainEnglish: 'Every time you write `s += item`, Java copies every character accumulated so far into a brand-new String and throws the old one away.',
        technicalDetail: 'Total characters copied = 1 + 2 + 3 + ... + n = n(n+1)/2 = O(n²), triggering heavy Young-Gen GC.',
        activeNodeIds: ['loop', 'bad'],
        activeEdgeIds: ['e1'],
        packetEdgeId: 'e1',
        packetLabel: '50M copies!',
        metrics: [{ label: 'n=10,000', value: '~50M char copies' }, { label: 'Time', value: 'O(n²)' }],
      },
      {
        stepNumber: 2,
        title: '2. `StringBuilder.append()` Writes In Place',
        plainEnglish: 'StringBuilder reserves a mutable array and writes new characters directly to the end, doubling capacity only ~14 times for 10,000 items.',
        technicalDetail: 'Geometric resizing ensures total copied elements < 2n (amortized O(1) per append).',
        activeNodeIds: ['loop', 'sb'],
        activeEdgeIds: ['e2'],
        packetEdgeId: 'e2',
        packetLabel: 'in-place',
        metrics: [{ label: 'Resizes', value: 'O(log n)' }, { label: 'Amortized', value: 'O(1)/append' }],
      },
      {
        stepNumber: 3,
        title: '3. Freeze Once with `sb.toString()`',
        plainEnglish: 'When the loop finishes, `toString()` creates one clean immutable String (identical to Python’s `"".join(parts)`!).',
        technicalDetail: 'Pre-sizing `new StringBuilder(expectedLen)` eliminates even the O(log n) resizes.',
        activeNodeIds: ['sb', 'out'],
        activeEdgeIds: ['e3'],
        packetEdgeId: 'e3',
        packetLabel: '1 String',
        metrics: [{ label: 'Total Time', value: 'O(n)' }, { label: 'Python Equiv', value: '"".join()' }],
      },
    ],
    asciiDfd: {
      level0: '[String Loop Tokens] --> (Mutable StringBuilder Buffer) --> [Immutable String]',
      level1: 'Loop -> StringBuilder.append() [O(1) amortized] -> sb.toString() [1 alloc, O(n) total]',
    },
  },
  {
    id: 'core-py-exception-unwinding',
    language: 'python',
    level: 'Intermediate',
    category: 'Python 0+ Core Foundations',
    shortTitle: 'Exceptions & Stack Unwind',
    title: 'Python 0+ Core: Exception Unwinding, `try/except/else/finally` & `with` Cleanup',
    tagline: 'Trace how an exception climbs up the call stack, invokes `__exit__` & `finally`, and lands cleanly in a specific `except` handler.',
    standardDefinition:
      'When an exception is raised in Python, normal execution halts and the VM unwinds call-stack frames upward until a matching `except` clause handles it. `else` runs strictly when `try` succeeds; `finally` and `with` `__exit__` hooks execute unconditionally.',
    algorithmName: 'Zero-Cost Exception Table Lookup + Deterministic Stack Frame Unwinding',
    complexity: 'Happy path O(1) zero overhead · Unwind O(call_stack_depth)',
    nodes: [
      { id: 'try', label: 'try: Block', sublabel: 'Risky Parse/IO', x: 85, y: 120, kind: 'source' },
      { id: 'exc', label: 'except ValueError', sublabel: 'Specific Catch', x: 295, y: 60, kind: 'process' },
      { id: 'els', label: 'else: Block', sublabel: 'Runs Only If OK', x: 295, y: 185, kind: 'runtime' },
      { id: 'fin', label: 'finally / __exit__', sublabel: 'Always Runs', x: 525, y: 120, kind: 'output' },
    ],
    edges: [
      { id: 'e1', from: 'try', to: 'exc', label: 'On Error' },
      { id: 'e2', from: 'try', to: 'els', label: 'No Error' },
      { id: 'e3', from: 'exc', to: 'fin', label: 'Guaranteed' },
      { id: 'e4', from: 'els', to: 'fin', label: 'Guaranteed' },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '1. Execute Minimal `try:` Block',
        plainEnglish: 'Keep only the exact line that can fail inside `try:` so you never accidentally swallow an unrelated bug.',
        technicalDetail: 'CPython records instruction offset ranges in an exception table; no runtime setup cost on happy path.',
        activeNodeIds: ['try'],
        activeEdgeIds: [],
        metrics: [{ label: 'Happy Cost', value: 'Zero overhead' }, { label: 'Scope', value: 'Minimal lines' }],
      },
      {
        stepNumber: 2,
        title: '2. Branch on Outcome (`except` vs `else`)',
        plainEnglish: 'If parsing fails, `except ValueError` handles it (never use bare `except:`). If parsing succeeds, `else:` runs!',
        technicalDetail: 'Keeping post-parse logic inside `else:` prevents accidentally catching ValueErrors thrown by later logic.',
        activeNodeIds: ['try', 'exc', 'els'],
        activeEdgeIds: ['e1', 'e2'],
        packetEdgeId: 'e1',
        packetLabel: 'ValueError',
        metrics: [{ label: 'Rule', value: 'Catch Specific' }, { label: 'else Runs', value: 'Only on OK' }],
      },
      {
        stepNumber: 3,
        title: '3. Unconditional `finally` & Context Manager `__exit__`',
        plainEnglish: 'Whether the block succeeded, caught an error, or returned early, `finally:` and `with` cleanup ALWAYS run.',
        technicalDetail: 'Guarantees deterministic lock release, DB rollback, or file handle closure before stack frame exits.',
        activeNodeIds: ['fin'],
        activeEdgeIds: ['e3', 'e4'],
        packetEdgeId: 'e3',
        packetLabel: 'cleanup',
        metrics: [{ label: 'Cleanup', value: '100% Guaranteed' }, { label: 'Java Equiv', value: 'try/catch/finally' }],
      },
    ],
    asciiDfd: {
      level0: '[Risky Operation] --> (try / except / else / finally) --> [Safe State + Cleanup]',
      level1: 'try -> [Error] -> except SpecificError -> finally\ntry -> [OK] -> else -> finally',
    },
  },
];

/* ============================================================================
   PART 3: 10 NEW VERSION-AGNOSTIC CORE CONCEPTS (JAVA 1+ & PYTHON 0+ GAPS)
   ============================================================================ */

export const CORE_FOUNDATION_CONCEPTS: LanguageConcept[] = [
  {
    id: 'core-java-primitives-equality',
    language: 'java',
    versionTag: 'Java 1+ Core',
    level: 'Basic',
    category: 'Core Foundations (All Versions)',
    title: 'Primitives vs. Wrapper Objects, Autoboxing & == vs. .equals()',
    simpleEnglish:
      'Primitives (int, double, boolean, char) store raw numbers right on the stack for blazing speed. Wrappers (Integer, Double) are heap objects—so `==` checks whether two pointers point to the same box, while `.equals()` checks whether the numbers inside match!',
    standardDefinition:
      'Java separates 8 primitive value types from reference types. Autoboxing caches Integer values in [-128, 127], causing `Integer a = 127; b = 127; a == b` to be true while `128 == 128` is false. Always use `.equals()` or `Objects.equals()` for object value equality.',
    realWorldApplication:
      'Prevents subtle production bugs when comparing database IDs (`Long userId`), currency amounts (`BigDecimal`), or enum/string keys across Java 1 through Java 21+.',
    runtimeAndComplexity: 'Primitive ops O(1) stack · Boxing allocates 16-byte heap header + GC cost',
    commonTrap:
      'Comparing `Long id1 == Long id2` works in unit tests with small IDs (1, 2, 10) due to the -128..127 cache, then silently fails in production when IDs exceed 127!',
    clearSolution:
      'Use primitives (`long`, `int`) in hot loops and `Objects.equals(id1, id2)` for all boxed/object comparisons.',
    codeExample: `import java.util.Objects;

Long idA = 1000L;
Long idB = 1000L;

boolean wrong = (idA == idB);            // false! (Different heap objects)
boolean right = Objects.equals(idA, idB); // true! (Null-safe value equality)

// Prefer primitives in math loops to avoid boxing GC churn
long sum = 0L;
for (int i = 0; i < 100_000; i++) {
    sum += i;
}`,
    relatedFlowId: 'core-java-stack-heap-strings',
  },
  {
    id: 'core-java-strings-builder',
    language: 'java',
    versionTag: 'Java 1+ Core',
    level: 'Basic',
    category: 'Core Foundations (All Versions)',
    title: 'String Immutability, String Pool, StringBuilder & UTF-16/UTF-8 Encoding',
    simpleEnglish:
      'Once created, a Java String can never be changed. Joining strings with `+` inside a loop forces Java to copy the entire growing string over and over—use `StringBuilder` inside loops and specify `StandardCharsets.UTF_8` on every byte conversion!',
    standardDefinition:
      'Strings are immutable objects backed by a compact byte[] (Java 9+) or char[] (Java 1–8). String literals are interned in the String Constant Pool. Loop concatenation requires StringBuilder (amortized O(1) append) or String.join() for O(n) total work.',
    realWorldApplication:
      'Building CSV exports, SQL query clauses, JSON logs, and HTTP headers without causing GC storms or platform-dependent encoding corruption.',
    runtimeAndComplexity: 'StringBuilder O(n) total · Loop `+=` O(n²) time & heap churn',
    commonTrap:
      'Calling `str.getBytes()` without `StandardCharsets.UTF_8` produces garbled non-ASCII characters across Windows vs. Linux servers.',
    clearSolution:
      'Use `StringBuilder` (or `String.join(",", list)`) for loops and always pass `StandardCharsets.UTF_8` explicitly.',
    codeExample: `import java.nio.charset.StandardCharsets;
import java.util.List;

// 1. O(n) loop assembly with pre-sized StringBuilder
StringBuilder sb = new StringBuilder(128);
for (int i = 0; i < 5; i++) {
    if (i > 0) sb.append(", ");
    sb.append("item-").append(i);
}

// 2. Clean delimiter join + explicit UTF-8 bytes
String csv = String.join(",", List.of("tokyo", "delhi", "paris"));
byte[] utf8 = csv.getBytes(StandardCharsets.UTF_8);`,
    relatedFlowId: 'core-java-stringbuilder-perf',
  },
  {
    id: 'core-java-control-arrays',
    language: 'java',
    versionTag: 'Java 1+ Core',
    level: 'Basic',
    category: 'Core Foundations (All Versions)',
    title: 'Control Flow, Arrays, Method Overloading & Pass-by-Value of References',
    simpleEnglish:
      'Java is ALWAYS pass-by-value! For primitives, methods get a copy of the number. For objects, methods get a copy of the pointer—so mutating fields inside the object is visible outside, but reassigning the parameter variable never changes the caller’s variable.',
    standardDefinition:
      'JLS §8.4.1 defines strict call-by-value parameter passing for both primitives and object references. Fixed-size contiguous arrays (`int[]`) offer O(1) random access with zero boxing overhead, while `Arrays.sort` / `Arrays.binarySearch` supply core algorithms.',
    realWorldApplication:
      'Explains why `swap(a, b)` fails on primitives/references, why defensive copies protect mutable arrays, and how to write zero-allocation numeric algorithms.',
    runtimeAndComplexity: 'Array index O(1) · Arrays.sort Dual-Pivot Quicksort O(n log n)',
    commonTrap:
      'Modifying a caller’s `List` or `int[]` passed into a constructor without copying lets external code silently corrupt your object’s internal state.',
    clearSolution:
      'Make defensive copies (`Arrays.copyOf`, `List.copyOf`) at constructor boundaries and remember reassigning a parameter only updates the local stack slot.',
    codeExample: `import java.util.Arrays;

int[] scores = {91, 78, 88, 95};
Arrays.sort(scores);                          // [78, 88, 91, 95]
int idx = Arrays.binarySearch(scores, 91);    // 2 (O(log n))

// Defensive copy prevents external mutation
int[] safeCopy = Arrays.copyOf(scores, scores.length);`,
    relatedFlowId: 'core-java-javac-jvm-basics',
  },
  {
    id: 'core-java-io-packages',
    language: 'java',
    versionTag: 'Java 1+ / 7+ Core',
    level: 'Intermediate',
    category: 'Core Foundations (All Versions)',
    title: 'Packages, Classpath/JARs & Streaming File I/O (BufferedReader & NIO Paths)',
    simpleEnglish:
      'Java organizes code into reverse-domain packages (`com.acme.orders`) compiled by `javac` into `.class` files bundled as `.jar` archives. For files, never load a 2GB log into RAM—stream it line by line with `BufferedReader` inside `try-with-resources`.',
    standardDefinition:
      'Packages provide access control (`public`, `protected`, package-private, `private`) and namespace isolation on the Classpath/Modulepath. `java.nio.file.Files` + `BufferedReader` stream UTF-8 files in O(1) memory with deterministic AutoCloseable cleanup.',
    realWorldApplication:
      'Building CLI ETL utilities, log analyzers, and Maven/Gradle microservices that process multi-gigabyte CSV/JSONL files reliably.',
    runtimeAndComplexity: 'Buffered streaming O(1) heap · O(n) sequential disk throughput',
    commonTrap:
      'Using `Files.readAllLines()` on huge files triggers `OutOfMemoryError: Java heap space`.',
    clearSolution:
      'Use `try (var br = Files.newBufferedReader(path, UTF_8))` or `try (var lines = Files.lines(path))` so both memory and file handles stay bounded.',
    codeExample: `import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

Path logPath = Path.of("app.log");
long errorCount = 0;

try (BufferedReader br = Files.newBufferedReader(logPath, StandardCharsets.UTF_8)) {
    String line;
    while ((line = br.readLine()) != null) {
        if (line.contains("ERROR")) errorCount++;
    }
}`,
    relatedFlowId: 'core-java-javac-jvm-basics',
  },
  {
    id: 'core-java-algo-idioms',
    language: 'java',
    versionTag: 'Java 1+ / 8+ Core',
    level: 'Intermediate',
    category: 'Collections & Algorithms Core',
    title: 'Essential Problem-Solving Idioms: Comparators, Heaps, Deques & Hash Counting',
    simpleEnglish:
      'To solve interviews and production backend problems confidently in Java, master 4 bread-and-butter patterns: `HashMap.merge` for counting, `ArrayDeque` for stacks/queues (never legacy `Stack`!), `PriorityQueue` for Top-K heaps, and `Comparator` for custom sorting.',
    standardDefinition:
      'Legacy synchronized classes (`Vector`, `Stack`, `Hashtable`) acquire locks on every operation and are superseded by `ArrayList`, `ArrayDeque`, and `HashMap`. `PriorityQueue` provides a binary min-heap (pass `Comparator.reverseOrder()` for max-heap).',
    realWorldApplication:
      'Powers rate-limiter sliding windows, Dijkstra shortest paths, Top-K leaderboards, and BFS graph traversal in production Java services.',
    runtimeAndComplexity: 'Heap push/pop O(log k) · ArrayDeque O(1) · HashMap.merge O(1) avg',
    commonTrap:
      'Writing `(a, b) -> b - a` in a Comparator overflows 32-bit `int` when comparing negative and positive extremes!',
    clearSolution:
      'Always use `Integer.compare(b, a)` or `Comparator.comparingInt(...)` to guarantee overflow-free ordering.',
    codeExample: `import java.util.*;

// 1. Safe overflow-free Max-Heap (Top-K)
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));

// 2. Stack & Queue with ArrayDeque (faster than legacy Stack/LinkedList)
Deque<String> stack = new ArrayDeque<>();
stack.push("frame-1");

// 3. One-line frequency counting
Map<String, Integer> freq = new HashMap<>();
for (String w : List.of("go", "java", "java")) {
    freq.merge(w, 1, Integer::sum);
}`,
    relatedFlowId: 'java-collections-hashmap',
  },
  {
    id: 'core-py-objects-truthiness',
    language: 'python',
    versionTag: 'Python 0+ Core',
    level: 'Basic',
    category: 'Core Foundations (All Versions)',
    title: 'Everything Is an Object: Dynamic Binding, Arbitrary-Precision int, Truthiness & is vs. ==',
    simpleEnglish:
      'Python has no primitive vs. wrapper split—every number, string, function, and class is an object on the heap! Integers never overflow (`10**100` just works), empty collections count as False, and you use `==` for equal values vs. `is` strictly for `None` or identical objects.',
    standardDefinition:
      'All values in Python inherit from `object` with runtime type metadata (`type(x)`), unique identity (`id(x)`), and value. Arbitrary-precision `int` scales dynamically beyond 64 bits. Truthiness evaluates `__bool__()` or `__len__() != 0`.',
    realWorldApplication:
      'Eliminates integer overflow bugs in cryptography/finance math and enables clean guard clauses (`if items:`, `if user is None:`) across every Python codebase.',
    runtimeAndComplexity: 'Object ref bind O(1) · `is` pointer compare O(1) · BigInt scales with digit limbs',
    commonTrap:
      'Using `is` to compare strings or numbers (`a is 1000` is False even though small ints -5..256 are cached—the exact Python cousin of Java’s Integer cache trap!).',
    clearSolution:
      'Use `==` for all value comparisons (numbers, strings, lists) and reserve `is` / `is not` strictly for `None`, `True`, `False`, or singleton sentinels.',
    codeExample: `big = 2 ** 256                 # Arbitrary precision: zero overflow!
a, b = 1000, 1000
assert a == b                  # Value equality: True
# Never write: a is b          # Identity check is unreliable for ints!

items = []
if not items:                  # Idiomatic truthiness check
    print("Empty collection")

token = None
if token is None:              # Always compare None with 'is'
    print("Missing token")`,
    relatedFlowId: 'core-py-name-binding',
  },
  {
    id: 'core-py-slicing-unpacking',
    language: 'python',
    level: 'Basic',
    versionTag: 'Python 0+ Core',
    category: 'Core Foundations (All Versions)',
    title: 'Control Flow, Slicing (start:stop:step), Tuple Unpacking & Star Expressions',
    simpleEnglish:
      'Python lets you grab sub-lists, reverse sequences (`seq[::-1]`), swap two variables without a temp variable (`a, b = b, a`), and peel head/tail elements with star unpacking (`first, *middle, last = data`) in one crystal-clear line!',
    standardDefinition:
      'Extended slice syntax `seq[start:stop:step]` safely clamps out-of-bounds indices without raising IndexError and returns a shallow subsequence copy. Iterable unpacking assigns elements positionally with optional starred catch-all target (`*rest`, PEP 3132).',
    realWorldApplication:
      'Parsing CSV rows, paginating lists, reversing windows, and swapping pointers in two-pointer algorithms cleanly without temporary variables.',
    runtimeAndComplexity: 'Tuple swap O(1) · Slice `seq[i:j]` O(j - i) shallow copy',
    commonTrap:
      'Slicing inside a recursive algorithm (`dfs(arr[1:])`) copies O(n) elements on every call, turning an O(n) recursion into O(n²)!',
    clearSolution:
      'Pass start/end integer indices `(arr, lo, hi)` in recursion or tight loops, and use slicing when copying a bounded window.',
    codeExample: `# Swap without temp variable
left, right = 10, 99
left, right = right, left

# Slicing: last 3 items & reversed copy
nums = [10, 20, 30, 40, 50]
last_three = nums[-3:]       # [30, 40, 50]
reversed_nums = nums[::-1]   # [50, 40, 30, 20, 10]

# Star unpacking (head, body, tail)
first, *middle, last = nums  # first=10, middle=[20,30,40], last=50`,
    relatedFlowId: 'core-py-iterator-generator',
  },
  {
    id: 'core-py-strings-bytes-encoding',
    language: 'python',
    versionTag: 'Python 0+ / 3+ Core',
    level: 'Basic',
    category: 'Core Foundations (All Versions)',
    title: 'Strings (str) vs. Bytes (bytes), UTF-8 Encoding & O(n) "".join()',
    simpleEnglish:
      'In Python, `str` is human text (Unicode characters) and `bytes` is raw 0–255 network/file data. You `.encode("utf-8")` text into bytes when sending over a socket or file, and `.decode("utf-8")` bytes back into text when reading!',
    standardDefinition:
      'Python 3 enforces a strict boundary between Unicode text (`str`, stored compactly via PEP 393 flexible representation) and immutable raw octets (`bytes`) / mutable `bytearray`. String assembly in loops must use `"".join(parts)` for O(n) allocation.',
    realWorldApplication:
      'Prevents `UnicodeDecodeError` and `TypeError: can’t concat str to bytes` when handling HTTP payloads, JWT tokens, cryptography hashes, and CSV files.',
    runtimeAndComplexity: '"".join(parts) O(n) two-pass alloc · encode/decode O(n)',
    commonTrap:
      'Mixing `str` and `bytes` or opening files without `encoding="utf-8"`, causing crashes on emojis or international characters on Windows.',
    clearSolution:
      'Decode bytes to `str` immediately at your I/O boundary, work purely in `str` internally, and encode back to UTF-8 bytes on output.',
    codeExample: `# Explicit text <-> bytes boundary
message = "Order #42 confirmed ✓"
raw_bytes: bytes = message.encode("utf-8")
decoded: str = raw_bytes.decode("utf-8")

# O(n) string building (Python's StringBuilder equivalent)
parts = [f"k{i}={i*10}" for i in range(4)]
query_string = "&".join(parts)  # "k0=0&k1=10&k2=20&k3=30"`,
    relatedFlowId: 'core-py-name-binding',
  },
  {
    id: 'core-py-files-json-venv',
    language: 'python',
    versionTag: 'Python 0+ / 3.4+ Core',
    level: 'Intermediate',
    category: 'Core Foundations (All Versions)',
    title: 'Modules, __name__ == "__main__", pathlib File I/O, JSON & Virtual Environments',
    simpleEnglish:
      'Every `.py` file is a module you can import. Isolate each project’s packages in a virtual environment (`python -m venv .venv`), use `pathlib.Path` for cross-platform file paths, and read/write JSON cleanly inside `with` blocks.',
    standardDefinition:
      'Python resolves imports via `sys.modules` cache and `sys.path`. Virtual environments (`venv`) isolate site-packages per project (analogous to per-project Maven/Gradle dependencies). `pathlib.Path` provides object-oriented OS-neutral filesystem operations.',
    realWorldApplication:
      'Foundational workflow for every real Python backend, automation script, CLI tool, and data pipeline.',
    runtimeAndComplexity: 'Module import cached O(1) in sys.modules · Streaming I/O O(1) RAM',
    commonTrap:
      'Installing packages globally with `pip install` breaks other projects with conflicting versions, and naming your script `json.py` or `random.py` shadows the standard library!',
    clearSolution:
      'Always activate a local `.venv`, pin dependencies in `pyproject.toml`/`requirements.txt`, and never name files after standard-library modules.',
    codeExample: `import json
from pathlib import Path

def save_config(path: Path, data: dict) -> None:
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def load_config(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)

if __name__ == "__main__":
    cfg = Path("settings.json")
    save_config(cfg, {"env": "prod", "retries": 3})`,
    relatedFlowId: 'core-py-exception-unwinding',
  },
  {
    id: 'core-py-algo-stdlib',
    language: 'python',
    versionTag: 'Python 0+ Core',
    level: 'Intermediate',
    category: 'Collections & Algorithms Core',
    title: 'Problem-Solving Power Tools: heapq, bisect, itertools & functools.lru_cache',
    simpleEnglish:
      'Python’s standard library ships with C-fast algorithmic building blocks: `heapq` for min-heaps, `bisect` for O(log n) binary search, `itertools` for lazy combinations/grouping, and `@lru_cache` to turn exponential recursion into instant memoized DP!',
    standardDefinition:
      '`heapq` operates in-place on standard Python lists as a binary min-heap (negate keys for max-heap). `bisect_left/right` execute binary search in C. `functools.lru_cache(maxsize=None)` caches deterministic function return values in O(1) hash lookup.',
    realWorldApplication:
      'Used daily for Top-K ranking, rate-limit timestamp lookups, dynamic programming memoization, and streaming ETL window aggregations.',
    runtimeAndComplexity: 'heapq O(log n) · bisect O(log n) · lru_cache lookup O(1)',
    commonTrap:
      'Calling `list.pop(0)` as a queue is O(n) (shifts every element!), and forgetting `maxsize` on `@lru_cache` for unbounded user inputs causes memory leaks.',
    clearSolution:
      'Use `collections.deque.popleft()` for O(1) queues, `heapq` for priority queues, and set an explicit `maxsize=1024` on `@lru_cache` in long-running servers.',
    codeExample: `import bisect
import heapq
from functools import lru_cache

# 1. Binary search in sorted list — O(log n)
sorted_ts = [100, 250, 400, 900]
pos = bisect.bisect_left(sorted_ts, 300)  # index 2

# 2. Top-2 smallest elements via min-heap
heap = [42, 7, 19, 3, 25]
heapq.heapify(heap)                       # O(n)
smallest = heapq.heappop(heap)            # 3 in O(log n)

# 3. Memoized DP in 1 decorator
@lru_cache(maxsize=1024)
def fib(n: int) -> int:
    return n if n < 2 else fib(n - 1) + fib(n - 2)`,
    relatedFlowId: 'py-collections-internals',
  },
];

/* ============================================================================
   PART 4: 4 NEW ZERO-TO-HERO & JAVA->PYTHON PRACTICE CHALLENGES
   ============================================================================ */

export const CORE_PRACTICE_CHALLENGES: LanguagePracticeChallenge[] = [
  {
    id: 'prac-core-java-stringbuilder-equals',
    number: 11,
    language: 'java',
    level: 'Basic',
    title: 'Java 1+ Core: Safe Value Equality & O(n) StringBuilder Loop',
    scenario:
      'A legacy Java service compares two boxed Long order IDs with `==` (failing above 127) and builds a comma-separated report using `+=` inside a loop.',
    goal:
      'Fix equality with `Objects.equals(...)` and assemble the CSV string in O(n) using `StringBuilder`.',
    starterCode: `import java.util.*;

public class ReportFix {
    public static boolean sameOrder(Long a, Long b) {
        // TODO: use Objects.equals(a, b)
        return a == b;
    }

    public static String joinIds(List<Long> ids) {
        // TODO: use StringBuilder instead of +=
        return "";
    }
}`,
    buildingBlocks: [
      { label: 'Objects.equals(a, b)', snippet: 'return Objects.equals(a, b);' },
      { label: 'StringBuilder loop', snippet: 'StringBuilder sb = new StringBuilder();\nfor (int i = 0; i < ids.size(); i++) {\n    if (i > 0) sb.append(",");\n    sb.append(ids.get(i));\n}\nreturn sb.toString();' },
    ],
    rules: [
      {
        id: 'use-objects-equals',
        label: 'Replace `a == b` with null-safe `Objects.equals(a, b)`',
        hint: 'Use Objects.equals(a, b) inside sameOrder.',
        test: (code) => /Objects\.equals\s*\(\s*a\s*,\s*b\s*\)/.test(code) && !/return\s+a\s*==\s*b/.test(code),
      },
      {
        id: 'use-sb',
        label: 'Use StringBuilder and .append(...) with .toString()',
        hint: 'Instantiate new StringBuilder(), append elements, and return sb.toString().',
        test: (code) => /new\s+StringBuilder\s*\(/.test(code) && /\.append\s*\(/.test(code) && /\.toString\s*\(\s*\)/.test(code),
      },
    ],
    referenceSolution: `import java.util.*;

public class ReportFix {
    public static boolean sameOrder(Long a, Long b) {
        return Objects.equals(a, b);
    }

    public static String joinIds(List<Long> ids) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < ids.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(ids.get(i));
        }
        return sb.toString();
    }
}`,
    whyItWorks:
      'Objects.equals compares Long values safely even for IDs > 127 or nulls, and StringBuilder writes into a resizable buffer in O(n) amortized time instead of O(n²) copies.',
  },
  {
    id: 'prac-core-py-java-to-python-refactor',
    number: 12,
    language: 'python',
    level: 'Basic',
    title: 'Java -> Python Thinking: Refactor Index Loop & Mutable Default',
    scenario:
      'A Java engineer learning Python wrote a mutable default list `bucket=[]` and an index loop `range(len(names))`.',
    goal:
      'Fix the mutable default with `None` and rewrite the loop cleanly using `enumerate(..., start=1)`.',
    starterCode: `def format_leaderboard(names, bucket=[]):
    for i in range(len(names)):
        bucket.append(str(i + 1) + ". " + names[i])
    return bucket`,
    buildingBlocks: [
      { label: 'None sentinel', snippet: 'def format_leaderboard(names, bucket=None):\n    if bucket is None:\n        bucket = []' },
      { label: 'enumerate loop', snippet: '    for rank, name in enumerate(names, start=1):\n        bucket.append(f"{rank}. {name}")\n    return bucket' },
    ],
    rules: [
      {
        id: 'none-default',
        label: 'Use `bucket=None` and initialize `bucket = []` inside the function',
        hint: 'Never put `bucket=[]` in the `def` header; default to `None` and check `if bucket is None:`.',
        test: (code) => /bucket\s*=\s*None/.test(code) && /if\s+bucket\s+is\s+None/.test(code) && !/bucket\s*=\s*\[\]/.test(code.split('\n')[0] || ''),
      },
      {
        id: 'use-enumerate',
        label: 'Replace `range(len(names))` with `enumerate(names, start=1)`',
        hint: 'Iterate directly with `for rank, name in enumerate(names, start=1):`.',
        test: (code) => /\benumerate\s*\(\s*names/.test(code) && !/range\s*\(\s*len\s*\(/.test(code),
      },
    ],
    referenceSolution: `def format_leaderboard(names, bucket=None):
    if bucket is None:
        bucket = []
    for rank, name in enumerate(names, start=1):
        bucket.append(f"{rank}. {name}")
    return bucket`,
    whyItWorks:
      'Replacing bucket=[] with None prevents state leaking between function calls, while enumerate(..., start=1) works on any iterable cleanly without manual indexing.',
  },
  {
    id: 'prac-core-py-with-generator',
    number: 13,
    language: 'python',
    level: 'Intermediate',
    title: 'Python 0+ Core: O(1) RAM File Streaming with `with` & Generator',
    scenario:
      'An analytics script crashes with OutOfMemoryError because it reads an entire 4GB CSV into a list before summing error lines.',
    goal:
      'Write a `count_errors(path)` function using `with open(...) as f:` and a lazy generator expression inside `sum(...)`.',
    starterCode: `def count_errors(path: str) -> int:
    # TODO: use with open(...) and lazy sum(1 for line in f if "ERROR" in line)
    return 0`,
    buildingBlocks: [
      { label: 'with open(...)', snippet: '    with open(path, "r", encoding="utf-8") as f:' },
      { label: 'lazy sum generator', snippet: '        return sum(1 for line in f if "ERROR" in line)' },
    ],
    rules: [
      {
        id: 'with-open',
        label: 'Open the file safely using `with open(...) as f:`',
        hint: 'Use a `with` context manager so the OS file handle always closes.',
        test: (code) => /\bwith\s+open\s*\([^)]+\)\s+as\s+\w+\s*:/.test(code),
      },
      {
        id: 'lazy-sum',
        label: 'Use a lazy generator expression inside `sum(...)`',
        hint: 'Write `return sum(1 for line in f if "ERROR" in line)`.',
        test: (code) => /sum\s*\(\s*1\s+for\s+\w+\s+in\s+\w+\s+if\b/.test(code),
      },
    ],
    referenceSolution: `def count_errors(path: str) -> int:
    with open(path, "r", encoding="utf-8") as f:
        return sum(1 for line in f if "ERROR" in line)`,
    whyItWorks:
      'The `with` statement guarantees deterministic file closure, and `sum(1 for line in f ...)` streams one line at a time using O(1) RAM.',
  },
  {
    id: 'prac-core-java-heap-deque',
    number: 14,
    language: 'java',
    level: 'Intermediate',
    title: 'Java 1+ Core: Overflow-Safe PriorityQueue & ArrayDeque',
    scenario:
      'Build a Top-K priority helper that avoids integer subtraction overflow in Comparator and uses `ArrayDeque` instead of legacy synchronized `Stack`.',
    goal:
      'Create a max-heap `PriorityQueue<Integer>` using `Integer.compare(b, a)` and a stack using `ArrayDeque<String>`.',
    starterCode: `import java.util.*;

public class CoreDsLab {
    public static void setup() {
        // TODO: PriorityQueue with Integer.compare(b, a)
        // TODO: Deque<String> using ArrayDeque
    }
}`,
    buildingBlocks: [
      { label: 'Safe Max-Heap', snippet: 'PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));' },
      { label: 'ArrayDeque Stack', snippet: 'Deque<String> stack = new ArrayDeque<>();\nstack.push("task-1");' },
    ],
    rules: [
      {
        id: 'safe-comparator',
        label: 'Use Integer.compare(b, a) (or Comparator.reverseOrder()) for PriorityQueue',
        hint: 'Avoid `b - a` overflow; use `(a, b) -> Integer.compare(b, a)`.',
        test: (code) => /new\s+PriorityQueue/.test(code) && /(Integer\.compare|Comparator\.reverseOrder)/.test(code),
      },
      {
        id: 'use-arraydeque',
        label: 'Use ArrayDeque instead of legacy Stack',
        hint: 'Declare `Deque<String> stack = new ArrayDeque<>();`.',
        test: (code) => /new\s+ArrayDeque/.test(code) && !/new\s+Stack/.test(code),
      },
    ],
    referenceSolution: `import java.util.*;

public class CoreDsLab {
    public static void setup() {
        PriorityQueue<Integer> maxHeap = new PriorityQueue<>((a, b) -> Integer.compare(b, a));
        Deque<String> stack = new ArrayDeque<>();
        stack.push("task-1");
    }
}`,
    whyItWorks:
      'Integer.compare handles extreme negative/positive int bounds without overflow, and ArrayDeque avoids the per-call monitor locking overhead of legacy java.util.Stack.',
  },
];

/* ============================================================================
   PART 5: 6 NEW CORE & JAVA->PYTHON MASTERY QUIZ QUESTIONS
   ============================================================================ */

export const CORE_QUIZ_QUESTIONS: LanguageQuizQuestion[] = [
  {
    id: 'quiz-core-java-integer-cache',
    language: 'java',
    level: 'Basic',
    topic: 'Java 1+ Core: Primitives, Boxing & Equality',
    question: 'In Java, why does `Integer a = 100, b = 100; a == b` return `true`, whereas `Integer x = 200, y = 200; x == y` returns `false`?',
    codeSnippet: `Integer a = 100, b = 100; // a == b is true\nInteger x = 200, y = 200; // x == y is false`,
    options: [
      { id: 'a', text: 'Java only supports integers up to 127 in wrapper classes' },
      { id: 'b', text: 'Integer.valueOf() caches instances in [-128, 127], so 100 reuses one object while 200 allocates two distinct heap objects' },
      { id: 'c', text: 'The == operator compares values for numbers under 128 and strings above 128' },
    ],
    correctOptionId: 'b',
    simpleExplanation:
      'Java caches small boxed Integer objects (-128 to 127) to save memory. For 200, two separate objects are created, so pointer equality `==` returns false. Always use `.equals()` or `Objects.equals()`!',
    technicalNote: 'JLS §5.1.7 mandates boxing cache coverage for at least -128..127.',
  },
  {
    id: 'quiz-core-py-mutable-default',
    language: 'python',
    level: 'Basic',
    topic: 'Python 0+ Core: Name Binding & Default Args',
    question: 'What is printed by the second call below?',
    codeSnippet: `def add(item, bag=[]):\n    bag.append(item)\n    return bag\n\nadd("a")\nprint(add("b"))`,
    options: [
      { id: 'a', text: '["b"]' },
      { id: 'b', text: '["a", "b"]' },
      { id: 'c', text: 'TypeError: default argument is immutable' },
    ],
    correctOptionId: 'b',
    simpleExplanation:
      'Python evaluates `bag=[]` once when the function is defined—not each time it is called! So both calls share the exact same list. Fix it with `bag=None` and `if bag is None: bag = []`.',
    technicalNote: 'Default parameter values are stored on `add.__defaults__` at function definition time.',
  },
  {
    id: 'quiz-core-j2p-eafp',
    language: 'python',
    level: 'Basic',
    topic: 'Thinking in Python from Java: EAFP vs. LBYL',
    question: 'A Java developer writes `if key in d: val = d[key]` in Python. What is the more Pythonic single-lookup replacement when you want a fallback default?',
    options: [
      { id: 'a', text: 'val = d.get(key, default)' },
      { id: 'b', text: 'val = d.containsKey(key) ? d[key] : default' },
      { id: 'c', text: 'val = d.fetchOrNull(key)' },
    ],
    correctOptionId: 'a',
    simpleExplanation:
      '`d.get(key, default)` hashes the key once instead of twice and cleanly returns your fallback if the key is absent.',
    technicalNote: 'For rare missing keys or atomic parse/IO steps, Python also favors EAFP (`try: ... except KeyError:`).',
  },
  {
    id: 'quiz-core-java-pass-by-value',
    language: 'java',
    level: 'Basic',
    topic: 'Java 1+ Core: Parameter Passing',
    question: 'If you pass a `List<String> list` to a Java method and the method runs `list = new ArrayList<>();`, what happens to the caller’s variable?',
    options: [
      { id: 'a', text: 'The caller’s variable now points to the new empty ArrayList' },
      { id: 'b', text: 'Nothing — Java passes object references by value, so reassigning the parameter only changes the local copy' },
      { id: 'c', text: 'Java throws an UnsupportedOperationException' },
    ],
    correctOptionId: 'b',
    simpleExplanation:
      'Java always passes a copy of the pointer. Mutating the object (`list.add("x")`) affects the shared heap list, but reassigning the parameter (`list = ...`) only moves the method’s local copy.',
    technicalNote: 'Python behaves identically here: rebinding a parameter name inside a function never rebinds the caller’s variable.',
  },
  {
    id: 'quiz-core-py-sort-return',
    language: 'python',
    level: 'Intermediate',
    topic: 'Thinking in Python from Java: Mutation vs Copies',
    question: 'What is the value of `out` after running `nums = [3, 1, 2]; out = nums.sort()`?',
    options: [
      { id: 'a', text: '[1, 2, 3]' },
      { id: 'b', text: 'None' },
      { id: 'c', text: '[3, 1, 2]' },
    ],
    correctOptionId: 'b',
    simpleExplanation:
      '`nums.sort()` sorts `nums` in place and returns `None` intentionally to remind you it mutated the original list. Use `out = sorted(nums)` whenever you want a new sorted list returned.',
    technicalNote: 'Command-Query Separation applies across Python built-in mutators (.sort, .reverse, .append, .extend).',
  },
  {
    id: 'quiz-core-java-stringbuilder',
    language: 'java',
    level: 'Intermediate',
    topic: 'Java 1+ Core: Strings & Complexity',
    question: 'What is the time complexity of concatenating `n` short strings using `result += word;` inside a Java `for` loop (vs. `StringBuilder`)?',
    options: [
      { id: 'a', text: 'O(n) for both' },
      { id: 'b', text: 'O(n²) for `+=` in a loop vs. O(n) amortized for `StringBuilder`' },
      { id: 'c', text: 'O(log n) for `+=` and O(n) for `StringBuilder`' },
    ],
    correctOptionId: 'b',
    simpleExplanation:
      'Because Strings are immutable, each `+=` allocates a larger array and copies every character from previous iterations (1 + 2 + ... + n = O(n²)). `StringBuilder` (and Python’s `"".join()`) runs in O(n).',
    technicalNote: 'Pre-sizing `new StringBuilder(capacity)` avoids even the O(log n) buffer doublings.',
  },
];
