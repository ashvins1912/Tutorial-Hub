import type { TopView } from '../store/usePatternForgeStore';

export type KnowledgeTier = 'Foundation (Beginner)' | 'Core Engineering (Intermediate)' | 'Distributed Scale (Advanced)';

export interface StudioCrossLink {
  targetView: TopView;
  label: string;
  relationship: 'Prerequisite' | 'Deep Dive' | 'Applies In';
  reason: string;
}

export interface StudioKnowledgeProfile {
  viewId: TopView;
  title: string;
  tier: KnowledgeTier;
  plainEnglishSummary: string;
  standardDefinition: string;
  practiceTip: string;
  links: StudioCrossLink[];
}

export const STUDIO_KNOWLEDGE_PROFILES: Record<string, StudioKnowledgeProfile> = {
  'db-internals': {
    viewId: 'db-internals',
    title: 'Database Internals, SQL & Storage Engines',
    tier: 'Core Engineering (Intermediate)',
    plainEnglishSummary:
      'Learn how databases actually save your data on disk, find rows in milliseconds using indexes, keep concurrent users from corrupting each other, and stream changes safely.',
    standardDefinition:
      'Covers relational algebra (DDL/DML/DQL/Joins/Windows), B+ Tree and LSM-Tree storage layouts, Cost-Based Query Optimization, MVCC + ARIES WAL crash recovery, Row-Level Security, and CDC.',
    practiceTip:
      'Start with Visual DFD & Animations, run queries in SQL Basics & Joins Optimizer, then stress-test Deadlock, PITR & RLS.',
    links: [
      {
        targetView: 'system-design',
        label: 'System Design Studio',
        relationship: 'Applies In',
        reason: 'See how B+ Trees, read replicas, and sharding scale to 100k+ QPS.',
      },
      {
        targetView: 'languages',
        label: 'Python 3.13 & Java 21',
        relationship: 'Prerequisite',
        reason: 'Compare HashMap / dict O(1) hashing against on-disk B+ Tree page search.',
      },
      {
        targetView: 'full-stack',
        label: 'Full-Stack Systems Lab',
        relationship: 'Deep Dive',
        reason: 'Trace connection pools (PgBouncer / HikariCP), ORMs, and NVMe I/O physics.',
      },
      {
        targetView: 'schemas',
        label: 'DB & API Schemas',
        relationship: 'Applies In',
        reason: 'Inspect production Mongoose/REST document schemas and API contracts.',
      },
    ],
  },
  'system-design': {
    viewId: 'system-design',
    title: 'System Design & Distributed Architecture',
    tier: 'Distributed Scale (Advanced)',
    plainEnglishSummary:
      'Design apps that keep working smoothly even when millions of users click at once or servers crash—using load balancers, caches, queues, replicas, and smart partitioning.',
    standardDefinition:
      'End-to-end distributed systems engineering across L4/L7 traffic routing, caching & stampede control, database sharding & replication, CAP/PACELC trade-offs, Raft consensus, and observability.',
    practiceTip:
      'Simulate traffic in Live Traffic Playground, step through DB & System DFDs, then check Master Roadmap & Deep Academy.',
    links: [
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Prerequisite',
        reason: 'Master indexes, MVCC, WAL, PITR, and SQL query plans powering your data tier.',
      },
      {
        targetView: 'full-stack',
        label: 'Full-Stack Systems Lab',
        relationship: 'Deep Dive',
        reason: 'Map high-level blocks down to Tomcat/Netty/Uvicorn threads, RAM, and GPUs.',
      },
      {
        targetView: 'fuzzy-search',
        label: 'N-Gram Search Lab',
        relationship: 'Applies In',
        reason: 'See how inverted indexes, trigram pruning, and Bloom filters power 10M-doc search.',
      },
      {
        targetView: 'ai-engineering',
        label: 'AI Engineering Studio',
        relationship: 'Applies In',
        reason: 'Extend distributed architectures with RAG pipelines, vector indexes, and LLM serving.',
      },
    ],
  },
  languages: {
    viewId: 'languages',
    title: 'Python 3.13+ & Java 21+ Mastery',
    tier: 'Foundation (Beginner)',
    plainEnglishSummary:
      'Master modern Python and Java side-by-side—from variables, OOP, and built-in collections to how threads, locks, and memory really execute under the hood.',
    standardDefinition:
      'Comparative runtime architecture covering CPython 3.13 (bytecode, GIL vs 3.13t free-threading, compact dicts) and JVM Java 21+ (Records, Sealed types, HashMap treeification, ZGC, Virtual Threads).',
    practiceTip:
      'Watch a Visual Lifecycle DFD first, test collisions and locks in Collections & Threads Lab, then pass the live syntax drills.',
    links: [
      {
        targetView: 'ood',
        label: 'OOPs & OOD Studio',
        relationship: 'Deep Dive',
        reason: 'Apply Python ABCs and Java Interfaces/Records to SOLID & GoF design patterns.',
      },
      {
        targetView: 'algorithms',
        label: 'Algorithms Studio',
        relationship: 'Applies In',
        reason: 'Use lists, HashMaps, heaps, and deques to solve Big-Tech algorithmic patterns.',
      },
      {
        targetView: 'full-stack',
        label: 'Full-Stack Systems Lab',
        relationship: 'Applies In',
        reason: 'See how FastAPI/Uvicorn and Spring Boot/Tomcat schedule your Python & Java code.',
      },
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Deep Dive',
        reason: 'Connect in-memory lock contention and hashing to database locks and indexes.',
      },
    ],
  },
  'full-stack': {
    viewId: 'full-stack',
    title: 'Full-Stack Systems, Frameworks & AI/LLM Hardware',
    tier: 'Distributed Scale (Advanced)',
    plainEnglishSummary:
      'Follow a single user click all the way from browser and web framework threads down to CPU caches, GPU memory bandwidth, and database disk pages.',
    standardDefinition:
      'Vertical systems stack tracing L7 proxies, 10 backend frameworks (Spring Boot, FastAPI, Django, NestJS, Go, Rust, .NET, Rails), VM runtimes, PagedAttention KV-cache GPU serving, and SRE runbooks.',
    practiceTip:
      'Play the 6-frame Synchronized Storyboard first, compare frameworks in the 10-Framework Matrix, then inspect GPU physics & runbooks.',
    links: [
      {
        targetView: 'languages',
        label: 'Python 3.13 & Java 21',
        relationship: 'Prerequisite',
        reason: 'Review CPython GIL / asyncio and JVM Virtual Threads behind FastAPI and Spring Boot.',
      },
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Deep Dive',
        reason: 'Dive deeper into Postgres Buffer Pool, WAL fsync, and SQL query optimization.',
      },
      {
        targetView: 'system-design',
        label: 'System Design Studio',
        relationship: 'Applies In',
        reason: 'Scale single-node framework internals horizontally across load-balanced clusters.',
      },
      {
        targetView: 'ai-engineering',
        label: 'AI Engineering Studio',
        relationship: 'Deep Dive',
        reason: 'Explore end-to-end RAG, agent workflows, evaluation, and AI DFD blueprints.',
      },
    ],
  },
  ood: {
    viewId: 'ood',
    title: 'OOPs, SOLID & Object-Oriented Design Patterns',
    tier: 'Core Engineering (Intermediate)',
    plainEnglishSummary:
      'Learn how to structure code into clean, reusable classes and interfaces so adding new features does not break existing working code.',
    standardDefinition:
      'Object-Oriented Programming pillars, SOLID design principles, and GoF creational/structural/behavioral patterns illustrated with runtime object-graph animations and clean vs. anti-pattern comparisons.',
    practiceTip:
      'Start with the 4 OOP pillars, step through SOLID anti-pattern vs. clean animations, then practice real Low-Level Design (LLD) patterns.',
    links: [
      {
        targetView: 'languages',
        label: 'Python 3.13 & Java 21',
        relationship: 'Prerequisite',
        reason: 'See exact Java 21 Sealed Classes/Interfaces and Python MRO/ABCs syntax.',
      },
      {
        targetView: 'system-design',
        label: 'System Design Studio',
        relationship: 'Applies In',
        reason: 'Scale Observer, Strategy, and Command patterns into Pub/Sub, CQRS, and Sagas.',
      },
      {
        targetView: 'algorithms',
        label: 'Algorithms Studio',
        relationship: 'Applies In',
        reason: 'Combine clean data structure encapsulation with optimal algorithmic complexity.',
      },
    ],
  },
  algorithms: {
    viewId: 'algorithms',
    title: 'Algorithms, Complexity & Problem-Solving Patterns',
    tier: 'Foundation (Beginner)',
    plainEnglishSummary:
      'Stop memorizing random solutions—recognize the exact clues in a problem statement that point to Two Pointers, Sliding Window, BFS/DFS, Binary Search, or Dynamic Programming.',
    standardDefinition:
      'Algorithmic pattern taxonomy with Big-O complexity proofs, brute-force-to-optimal upgrade traces, interactive sorting & recursion labs, and architectural algorithm blueprints.',
    practiceTip:
      'Use Mental Model + Upgrade Trace first, test your instincts in Pattern Drill, then practice in the Logic Solver.',
    links: [
      {
        targetView: 'languages',
        label: 'Python 3.13 & Java 21',
        relationship: 'Prerequisite',
        reason: 'Master list, deque, heapq, ArrayList, HashMap, and PriorityQueue operations.',
      },
      {
        targetView: 'fuzzy-search',
        label: 'N-Gram Search Lab',
        relationship: 'Deep Dive',
        reason: 'Apply Dynamic Programming (Edit Distance), Tries, and Hashing to real search engines.',
      },
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Applies In',
        reason: 'See how B+ Trees, Hash Joins, Merge Joins, and Timsort run inside real databases.',
      },
      {
        targetView: 'solver',
        label: 'Universal Logic Solver',
        relationship: 'Applies In',
        reason: 'Paste any coding prompt and break it down step-by-step from brute force to optimal.',
      },
    ],
  },
  'fuzzy-search': {
    viewId: 'fuzzy-search',
    title: 'N-Gram, Edit Distance & Fuzzy Search Algorithms',
    tier: 'Core Engineering (Intermediate)',
    plainEnglishSummary:
      'Discover how Google and e-commerce search bars still find "Apple iPhone" in milliseconds even when a shopper types "aple iphon".',
    standardDefinition:
      'Information retrieval pipeline spanning character/word n-gram tokenization, Jaccard/Cosine/Tversky similarity, Levenshtein/Damerau DP edit distance, BK-Trees, and inverted-index candidate pruning.',
    practiceTip:
      'Type typo pairs into the live sandbox, test candidate reduction in Pruning Logic Simulator, then review the 10M Product Search case study.',
    links: [
      {
        targetView: 'algorithms',
        label: 'Algorithms Studio',
        relationship: 'Prerequisite',
        reason: 'Review Dynamic Programming tables, Tries, and Hash Maps used in fuzzy matching.',
      },
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Applies In',
        reason: 'Compare SQL LIKE %wildcards% (Seq Scan) against GIN trigram inverted indexes.',
      },
      {
        targetView: 'system-design',
        label: 'System Design Studio',
        relationship: 'Applies In',
        reason: 'Scale search pipelines across sharded inverted indexes and edge autocomplete caches.',
      },
    ],
  },
  'ai-engineering': {
    viewId: 'ai-engineering',
    title: 'AI Engineering, RAG Pipelines & LLM Systems',
    tier: 'Distributed Scale (Advanced)',
    plainEnglishSummary:
      'Build reliable AI applications step-by-step: chunk documents, store embeddings in vector databases, retrieve tenant-safe context, and evaluate answers before shipping.',
    standardDefinition:
      'Production LLM architecture covering semantic chunking, hybrid dense+BM25 retrieval, reranking, HNSW vector search, agentic tool loops, guardrails, and grounded evaluation.',
    practiceTip:
      'Trace the animated AI DFD Visualizer first, compare retrieval trade-offs, then connect to GPU KV-Cache physics in Full-Stack Lab.',
    links: [
      {
        targetView: 'full-stack',
        label: 'Full-Stack Systems Lab',
        relationship: 'Deep Dive',
        reason: 'Inspect vLLM PagedAttention, FP8 quantization, and GPU HBM3 memory walls.',
      },
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Prerequisite',
        reason: 'Enforce Multi-Tenant Row-Level Security (RLS) + pgvector HNSW + CDC sync.',
      },
      {
        targetView: 'fuzzy-search',
        label: 'N-Gram Search Lab',
        relationship: 'Applies In',
        reason: 'Combine lexical BM25 / trigram matching with vector embeddings for hybrid search.',
      },
    ],
  },
  schemas: {
    viewId: 'schemas',
    title: 'Database Schemas & REST API Contracts',
    tier: 'Core Engineering (Intermediate)',
    plainEnglishSummary:
      'See how frontend screens, REST API endpoints, validation rules, and database collections fit together into one clean contract.',
    standardDefinition:
      'Schema-first application modeling using Mongoose document schemas, compound indexes, referential links, and RESTful resource endpoints.',
    practiceTip:
      'Trace the Client -> API -> Schema -> Index DFD below, then test relational DDL/DML and indexing hands-on in DB Internals.',
    links: [
      {
        targetView: 'db-internals',
        label: 'DB Internals & SQL',
        relationship: 'Deep Dive',
        reason: 'Compare MongoDB document schemas with PostgreSQL relational DDL, Joins & Indexes.',
      },
      {
        targetView: 'system-design',
        label: 'System Design Studio',
        relationship: 'Applies In',
        reason: 'Place API gateways, caches, and read replicas in front of these schema contracts.',
      },
      {
        targetView: 'full-stack',
        label: 'Full-Stack Systems Lab',
        relationship: 'Applies In',
        reason: 'See Express/NestJS, Spring Boot, and FastAPI controllers serving these endpoints.',
      },
    ],
  },
};

export interface LearningPathStage {
  stageNumber: string;
  tier: KnowledgeTier;
  title: string;
  summary: string;
  items: {
    viewId: TopView;
    label: string;
    whatYouLearn: string;
  }[];
}

export const BEGINNER_TO_ADVANCED_PATH: LearningPathStage[] = [
  {
    stageNumber: '01',
    tier: 'Foundation (Beginner)',
    title: 'Programming, Data Structures & Algorithmic Thinking',
    summary: 'Build rock-solid language fluency and stop guessing on coding problems.',
    items: [
      {
        viewId: 'languages',
        label: 'Python 3.13 & Java 21',
        whatYouLearn: 'Variables, OOP, Collections internals, Multithreading & Live Syntax Labs.',
      },
      {
        viewId: 'algorithms',
        label: 'Algorithms Studio',
        whatYouLearn: 'Core patterns, Big-O proofs, Sorting/Recursion labs & brute-to-optimal traces.',
      },
      {
        viewId: 'workspace',
        label: 'DSA Curriculum',
        whatYouLearn: 'Guided step-by-step problem solving with visual sandboxes and logic blocks.',
      },
    ],
  },
  {
    stageNumber: '02',
    tier: 'Core Engineering (Intermediate)',
    title: 'Clean Design, SQL Mastery, Databases & Search',
    summary: 'Transition from single files to maintainable software, fast queries, and real storage engines.',
    items: [
      {
        viewId: 'ood',
        label: 'OOPs & OOD Studio',
        whatYouLearn: 'SOLID principles, GoF design patterns & animated object-graph lifecycles.',
      },
      {
        viewId: 'db-internals',
        label: 'DB Internals & SQL',
        whatYouLearn: 'SQL Operators/Joins/Optimizer, B+ Tree/LSM DFDs, Deadlocks, PITR & RLS.',
      },
      {
        viewId: 'fuzzy-search',
        label: 'N-Gram Search Lab',
        whatYouLearn: 'Typo-tolerant search, edit distance DP, inverted indexes & candidate pruning.',
      },
    ],
  },
  {
    stageNumber: '03',
    tier: 'Distributed Scale (Advanced)',
    title: 'Distributed Systems, Full-Stack Physics & AI/LLM Scale',
    summary: 'Architect fault-tolerant multi-region platforms from CPU/GPU silicon to cloud scale.',
    items: [
      {
        viewId: 'system-design',
        label: 'System Design Studio',
        whatYouLearn: 'Live traffic playground, DB & System DFDs, Sharding, CAP/PACELC & Deep Academy.',
      },
      {
        viewId: 'full-stack',
        label: 'Full-Stack Lab',
        whatYouLearn: '10 backend frameworks, VMs, GPU HBM3 inference engines & SRE failure runbooks.',
      },
      {
        viewId: 'ai-engineering',
        label: 'AI Engineering Studio',
        whatYouLearn: 'RAG DFDs, hybrid vector search, guardrails, agents & evaluation pipelines.',
      },
    ],
  },
];
