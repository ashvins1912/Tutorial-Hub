import { BIG_TECH_36_PROBLEMS, BIG_TECH_TOPICS } from '../seed/bigTechTopicSeed';
import {
  BigTechCompany,
  BigTechProblem,
  BigTechTopicCategory,
  CompanySprint,
  SprintDaySchedule,
  SprintTask,
} from '../../src/types/dsa';

export interface CompanySprintMeta {
  company: BigTechCompany;
  tagline: string;
  topPatterns: BigTechTopicCategory[];
  weights: Record<string, number>;
  insiderTips: string[];
}

export const COMPANY_SPRINT_META: Record<BigTechCompany, CompanySprintMeta> = {
  Google: {
    company: 'Google',
    tagline: 'Graph state transitions, DP invariants & strict complexity proofs.',
    topPatterns: ['Graphs & Topo Sort', 'Dynamic Programming', 'Modified Binary Search'],
    weights: {
      'Graphs & Topo Sort': 25,
      'Dynamic Programming': 25,
      'Modified Binary Search': 15,
      'Union-Find & Shortest Path': 15,
      'Trees DFS/BFS': 10,
      'Sliding Window': 10,
    },
    insiderTips: [
      'Google interviewers heavily test state transitions and edge cases on disconnected components.',
      'Always prove why your binary search monotonic predicate holds before writing a single line of code.',
      'Expect a constraint twist mid-problem that forces you to drop extra space or shift from DFS to DP.',
    ],
  },
  Meta: {
    company: 'Meta',
    tagline: 'High-speed 2-problem accuracy: Trees, Sliding Window, Intervals & Prefix Sums.',
    topPatterns: ['Trees DFS/BFS', 'Arrays & Prefix Sum', 'Heaps & Intervals'],
    weights: {
      'Trees DFS/BFS': 25,
      'Arrays & Prefix Sum': 20,
      'Heaps & Intervals': 20,
      'Sliding Window': 15,
      'Two Pointers': 10,
      'Graphs & Topo Sort': 10,
    },
    insiderTips: [
      'Meta requires solving 2 mediums in 35–40 minutes with zero syntax bugs and instant dry-run verification.',
      'Explain your O(1) space invariant clearly—Meta interviewers frequently probe Tree recursion depth and null guards.',
      'Before coding, explicitly state edge cases: empty input, negative values, and duplicate targets.',
    ],
  },
  Amazon: {
    company: 'Amazon',
    tagline: 'Leadership-framed trade-offs, Trees/BFS, Heaps, Design-DSA (LRU) & Graphs.',
    topPatterns: ['Trees DFS/BFS', 'Graphs & Topo Sort', 'Linked Lists'],
    weights: {
      'Trees DFS/BFS': 25,
      'Graphs & Topo Sort': 20,
      'Linked Lists': 20,
      'Heaps & Intervals': 15,
      'Dynamic Programming': 10,
      'Backtracking & Tries': 10,
    },
    insiderTips: [
      'Amazon tests modular, production-clean code—extract helper methods and explain OOP boundaries on LRU/Trie.',
      'Start with the Brute Force baseline explicitly, quantify its O(N²) bottleneck, then pitch the Optimal structure.',
      'Expect follow-ups around streaming scale, bounded memory, and real-world system analogies.',
    ],
  },
  Microsoft: {
    company: 'Microsoft',
    tagline: 'Clean pointer manipulation, Recursion, Linked Lists, Monotonic Stacks & DP.',
    topPatterns: ['Linked Lists', 'Trees DFS/BFS', 'Dynamic Programming'],
    weights: {
      'Linked Lists': 20,
      'Trees DFS/BFS': 20,
      'Dynamic Programming': 20,
      'Arrays & Prefix Sum': 15,
      'Modified Binary Search': 15,
      'Monotonic Stack': 10,
    },
    insiderTips: [
      'Microsoft values bug-free pointer manipulation and thorough boundary testing (empty, 1-node, cycles).',
      'Walk through a concrete 4-element dry run out loud before announcing completion.',
      'Articulate both iterative and recursive trade-offs when working with Trees or Linked Lists.',
    ],
  },
  Apple: {
    company: 'Apple',
    tagline: 'System-friendly memory efficiency, Tries, Intervals, Streams & Two Pointers.',
    topPatterns: ['Heaps & Intervals', 'Backtracking & Tries', 'Two Pointers'],
    weights: {
      'Heaps & Intervals': 20,
      'Backtracking & Tries': 20,
      'Two Pointers': 20,
      'Linked Lists': 15,
      'Sliding Window': 15,
      'Dynamic Programming': 10,
    },
    insiderTips: [
      'Apple interviewers probe space complexity, cache locality, and avoiding unnecessary heap allocations.',
      'Show awareness of character-set bounds (ASCII vs Unicode) and integer overflow guards.',
      'Be ready to connect algorithmic data structures (Trie, LRU, Dual Heap) to device-level constraints.',
    ],
  },
};

function getCompanyFreq(p: BigTechProblem, company: BigTechCompany): number {
  return p.bigTechFrequency.find((f) => f.company === company)?.frequencyScore ?? 70;
}

function getWeightedScore(
  p: BigTechProblem,
  company: BigTechCompany,
  weights: Record<string, number>
): number {
  const freq = getCompanyFreq(p, company);
  const topicBoost = weights[p.topicCategory] ?? 5;
  return freq + topicBoost * 0.65;
}

function makeTask(
  dayNumber: number,
  idx: number,
  taskType: SprintTask['taskType'],
  problem: BigTechProblem,
  estimatedMinutes: number,
  customTwist?: string
): SprintTask {
  return {
    taskId: `d${dayNumber}-t${idx}-${problem.slug}`,
    taskType,
    problemId: problem.slug,
    problemSlug: problem.slug,
    problemNumber: problem.number,
    problemTitle: problem.title,
    difficulty: problem.difficulty,
    topicCategory: problem.topicCategory,
    twistConstraint: customTwist ?? problem.interviewSolutionLadder.interviewerFollowUp.twist,
    isCompleted: false,
    scoreEarned: 0,
    estimatedMinutes,
    labProblemId: problem.labProblemId,
  };
}

export function generate14DaySprint(
  userId: string,
  targetCompany: BigTechCompany,
  dailyMinutesBudget: 60 | 120
): CompanySprint {
  const meta = COMPANY_SPRINT_META[targetCompany];

  // 1. Sort problem pools by company frequency + topic weighting
  const sortForCompany = (list: BigTechProblem[]) =>
    [...list].sort(
      (a, b) =>
        getWeightedScore(b, targetCompany, meta.weights) -
        getWeightedScore(a, targetCompany, meta.weights)
    );

  const easyPool = sortForCompany(BIG_TECH_36_PROBLEMS.filter((p) => p.difficulty === 'Easy'));
  const mediumPool = sortForCompany(BIG_TECH_36_PROBLEMS.filter((p) => p.difficulty === 'Medium'));
  const hardPool = sortForCompany(BIG_TECH_36_PROBLEMS.filter((p) => p.difficulty === 'Hard'));
  const topOverall = sortForCompany(BIG_TECH_36_PROBLEMS);

  const pickNext = (pool: BigTechProblem[], cursor: { idx: number }): BigTechProblem => {
    const item = pool[cursor.idx % pool.length];
    cursor.idx += 1;
    return item;
  };

  const easyCursor = { idx: 0 };
  const medCursor = { idx: 0 };
  const hardCursor = { idx: 0 };
  const assignedHistory: BigTechProblem[] = [];

  const topicLookup = new Map(BIG_TECH_TOPICS.map((t) => [t.topicCategory, t]));
  const spacedRecallDays = new Set([4, 7, 10, 13]);
  const dailySchedule: SprintDaySchedule[] = [];

  for (let day = 1; day <= 14; day++) {
    if (day === 14) {
      // Day 14: Exclusive 45-Min Simulated Interview with top 2 most frequently asked problems
      const mockCandidates = topOverall.filter((p) => p.difficulty !== 'Easy').slice(0, 2);
      const mockTasks: SprintTask[] = mockCandidates.map((prob, idx) =>
        makeTask(
          14,
          idx + 1,
          'Mock45Sim',
          prob,
          22,
          prob.interviewSolutionLadder.interviewerFollowUp.twist
        )
      );

      dailySchedule.push({
        dayNumber: 14,
        phaseTitle: 'Day 14: 45-Minute Simulated Big Tech Interview',
        focusPattern: `${targetCompany} High-Frequency Final Mock`,
        patternTriggerReminder:
          'Clarify constraints in 90s -> pitch Brute vs Optimal -> write clean invariant code -> pass twist.',
        companyInsiderTip: `${targetCompany} Simulation: Treat both questions as a continuous 45-minute loop with zero hints.`,
        isUnlocked: false,
        tasks: mockTasks,
      });
      continue;
    }

    const tasks: SprintTask[] = [];
    let phaseTitle = '';

    if (day <= 3) {
      // Days 1-3: Easy Foundation & Signal Recognition
      phaseTitle = `Days 1–3: ${targetCompany} Signal Foundations`;
      const p1 = pickNext(easyPool, easyCursor);
      const p2 = pickNext(easyPool, easyCursor);
      tasks.push(makeTask(day, 1, 'PatternWarmup', p1, 20));
      tasks.push(makeTask(day, 2, 'CoreProblem', p2, 30));
      assignedHistory.push(p1, p2);

      if (dailyMinutesBudget === 120) {
        const p3 = pickNext(mediumPool, medCursor);
        tasks.push(makeTask(day, 3, 'BlindArena', p3, 40));
        assignedHistory.push(p3);
      }
    } else if (day <= 9) {
      // Days 4-9: Medium Core Pattern Mastery
      phaseTitle = `Days 4–9: ${targetCompany} Core Medium Patterns`;
      const p1 = pickNext(mediumPool, medCursor);
      const p2 = pickNext(mediumPool, medCursor);
      tasks.push(makeTask(day, 1, 'CoreProblem', p1, 30));

      if (spacedRecallDays.has(day) && assignedHistory.length > 0) {
        const recallTarget = assignedHistory[(day * 2) % assignedHistory.length];
        tasks.push(
          makeTask(
            day,
            2,
            'SpacedRecall',
            recallTarget,
            25,
            `Twist Mutation: ${recallTarget.interviewSolutionLadder.interviewerFollowUp.twist}`
          )
        );
      } else {
        tasks.push(makeTask(day, 2, 'CoreProblem', p2, 30));
        assignedHistory.push(p2);
      }
      assignedHistory.push(p1);

      if (dailyMinutesBudget === 120) {
        const p3 = pickNext(mediumPool, medCursor);
        tasks.push(makeTask(day, 3, 'BlindArena', p3, 40));
        assignedHistory.push(p3);
      }
    } else {
      // Days 10-13: Hard & Multi-Pattern Fusion
      phaseTitle = `Days 10–13: ${targetCompany} Hard & Fusion Bar`;
      const p1 = pickNext(hardPool, hardCursor);
      tasks.push(makeTask(day, 1, 'CoreProblem', p1, 35));

      if (spacedRecallDays.has(day) && assignedHistory.length > 0) {
        const recallTarget = assignedHistory[(day + 3) % assignedHistory.length];
        tasks.push(
          makeTask(
            day,
            2,
            'SpacedRecall',
            recallTarget,
            25,
            `Twist Mutation: ${recallTarget.interviewSolutionLadder.interviewerFollowUp.twist}`
          )
        );
      } else {
        const p2 = pickNext(mediumPool, medCursor);
        tasks.push(makeTask(day, 2, 'CoreProblem', p2, 25));
        assignedHistory.push(p2);
      }
      assignedHistory.push(p1);

      if (dailyMinutesBudget === 120) {
        const p3 = pickNext(hardPool, hardCursor);
        tasks.push(makeTask(day, 3, 'BlindArena', p3, 45));
        assignedHistory.push(p3);
      }
    }

    const primaryTopic = tasks[0].topicCategory;
    const topicMeta = topicLookup.get(primaryTopic);
    const triggerText = topicMeta
      ? `Triggers: ${topicMeta.keywordTriggers.slice(0, 2).join(' · ')} — ${topicMeta.coreInvariant}`
      : 'Spot constraints first to rule out quadratic bottlenecks.';

    dailySchedule.push({
      dayNumber: day,
      phaseTitle,
      focusPattern: primaryTopic,
      patternTriggerReminder: triggerText,
      companyInsiderTip: meta.insiderTips[(day - 1) % meta.insiderTips.length],
      isUnlocked: day === 1,
      tasks,
    });
  }

  return {
    id: `sprint-${targetCompany.toLowerCase()}-${Date.now()}`,
    userId,
    targetCompany,
    dailyMinutesBudget,
    startDate: new Date().toISOString(),
    currentDay: 1,
    companyPatternWeights: meta.weights,
    dailySchedule,
    completionPct: 0,
    readinessScore: 28,
  };
}

export function computeSprintMetrics(sprint: CompanySprint): {
  completionPct: number;
  readinessScore: number;
} {
  const allTasks = sprint.dailySchedule.flatMap((d) => d.tasks);
  const completedTasks = allTasks.filter((t) => t.isCompleted);
  const completionPct = allTasks.length
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;

  const recallTasks = allTasks.filter((t) => t.taskType === 'SpacedRecall');
  const recallCompleted = recallTasks.filter((t) => t.isCompleted).length;
  const recallRetention = recallTasks.length ? recallCompleted / recallTasks.length : 1;

  const avgScore = completedTasks.length
    ? completedTasks.reduce((acc, t) => acc + (t.scoreEarned || 85), 0) / completedTasks.length
    : 75;

  const readinessScore = Math.min(
    100,
    Math.round(25 + completionPct * 0.45 + (avgScore / 100) * 18 + recallRetention * 12)
  );

  return { completionPct, readinessScore };
}
