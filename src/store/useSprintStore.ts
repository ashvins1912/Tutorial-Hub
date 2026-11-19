import { apiFetch } from '../lib/apiFetch';
import { create } from 'zustand';
import {
  BigTechCompany,
  BigTechProblem,
  BigTechTopicCategory,
  CompanySprint,
  SprintTask,
} from '../types/dsa';
import { BIG_TECH_36_PROBLEMS } from '../../server/seed/bigTechTopicSeed';
import { computeSprintMetrics } from '../../server/services/sprintGeneratorService';

const SPRINT_STORAGE_KEY = 'patternforge_active_sprint_v1';
const MASTERED_STORAGE_KEY = 'patternforge_bigtech_mastered_v1';

function loadSavedSprint(): CompanySprint | null {
  try {
    const raw = localStorage.getItem(SPRINT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompanySprint) : null;
  } catch {
    return null;
  }
}

function saveSprintLocal(sprint: CompanySprint | null) {
  try {
    if (sprint) localStorage.setItem(SPRINT_STORAGE_KEY, JSON.stringify(sprint));
    else localStorage.removeItem(SPRINT_STORAGE_KEY);
  } catch {
    // ignore storage quota
  }
}

function loadMasteredSlugs(): string[] {
  try {
    const raw = localStorage.getItem(MASTERED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveMasteredSlugs(slugs: string[]) {
  try {
    localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // ignore
  }
}

export interface ActiveSprintTaskContext {
  sprintId: string;
  dayNumber: number;
  taskId: string;
  problemSlug: string;
  taskType: SprintTask['taskType'];
  twistConstraint: string;
}

export interface RubricResult {
  problemSlug: string;
  clarifyScore: number;
  identifyScore: number;
  invariantScore: number;
  twistScore: number;
  overallScore: number;
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire';
}

interface SprintState {
  activeSprint: CompanySprint | null;
  selectedDayNumber: number;
  configuratorOpen: boolean;
  isCreatingSprint: boolean;

  // Big Tech 36 Bank & Trainer state
  selectedTopic: BigTechTopicCategory | 'All';
  selectedCompanyFilter: BigTechCompany | 'All';
  selectedDifficultyFilter: 'All' | 'Easy' | 'Medium' | 'Hard';
  activeTrainerSlug: string | null;
  activeRubricResult: RubricResult | null;
  masteredSlugs: string[];
  activeSprintTaskContext: ActiveSprintTaskContext | null;
  mock45Open: boolean;
  mock45DayNumber: number | null;
  sprintBannerMessage: string | null;

  // Actions
  setConfiguratorOpen: (open: boolean) => void;
  setSelectedDayNumber: (day: number) => void;
  setSelectedTopic: (topic: BigTechTopicCategory | 'All') => void;
  setSelectedCompanyFilter: (company: BigTechCompany | 'All') => void;
  setSelectedDifficultyFilter: (diff: 'All' | 'Easy' | 'Medium' | 'Hard') => void;
  openTrainerForProblem: (slug: string, sprintCtx?: ActiveSprintTaskContext | null) => void;
  closeTrainer: () => void;
  submitRubricResult: (result: RubricResult) => Promise<void>;
  clearRubricResult: () => void;
  openMock45ForDay: (dayNumber: number) => void;
  closeMock45: () => void;
  clearSprintBanner: () => void;

  // Sprint API + resilient local sync
  resetForUser: () => void;
  fetchActiveSprint: () => Promise<void>;
  createSprint: (
    targetCompany: BigTechCompany,
    dailyMinutesBudget: 60 | 120,
    userId?: string
  ) => Promise<void>;
  completeSprintTask: (
    dayNumber: number,
    taskId: string,
    scoreEarned?: number
  ) => Promise<{ unlockedNextDay: boolean }>;
  getProblemBySlug: (slug: string) => BigTechProblem | undefined;
}

export const useSprintStore = create<SprintState>((set, get) => ({
  activeSprint: null,
  selectedDayNumber: 1,
  configuratorOpen: false,
  isCreatingSprint: false,

  selectedTopic: 'Arrays & Prefix Sum',
  selectedCompanyFilter: 'All',
  selectedDifficultyFilter: 'All',
  activeTrainerSlug: null,
  activeRubricResult: null,
  masteredSlugs: typeof window !== 'undefined' ? loadMasteredSlugs() : [],
  activeSprintTaskContext: null,
  mock45Open: false,
  mock45DayNumber: null,
  sprintBannerMessage: null,

  setConfiguratorOpen: (open) => set({ configuratorOpen: open }),
  setSelectedDayNumber: (day) => set({ selectedDayNumber: day }),
  setSelectedTopic: (topic) => set({ selectedTopic: topic }),
  setSelectedCompanyFilter: (company) => set({ selectedCompanyFilter: company }),
  setSelectedDifficultyFilter: (diff) => set({ selectedDifficultyFilter: diff }),

  openTrainerForProblem: (slug, sprintCtx = null) =>
    set({
      activeTrainerSlug: slug,
      activeRubricResult: null,
      activeSprintTaskContext: sprintCtx,
    }),

  closeTrainer: () =>
    set({
      activeTrainerSlug: null,
      activeRubricResult: null,
      activeSprintTaskContext: null,
    }),

  submitRubricResult: async (result) => {
    const state = get();
    const updatedMastered = state.masteredSlugs.includes(result.problemSlug)
      ? state.masteredSlugs
      : [...state.masteredSlugs, result.problemSlug];
    saveMasteredSlugs(updatedMastered);

    set({
      masteredSlugs: updatedMastered,
      activeRubricResult: result,
    });

    if (state.activeSprintTaskContext) {
      await get().completeSprintTask(
        state.activeSprintTaskContext.dayNumber,
        state.activeSprintTaskContext.taskId,
        result.overallScore
      );
    }
  },

  clearRubricResult: () => set({ activeRubricResult: null }),

  openMock45ForDay: (dayNumber) => set({ mock45Open: true, mock45DayNumber: dayNumber }),
  closeMock45: () => set({ mock45Open: false, mock45DayNumber: null }),
  clearSprintBanner: () => set({ sprintBannerMessage: null }),

  resetForUser: () => set({
    activeSprint: null,
    selectedDayNumber: 1,
    isCreatingSprint: false,
    masteredSlugs: [],
    activeTrainerSlug: null,
    activeRubricResult: null,
    activeSprintTaskContext: null,
    sprintBannerMessage: null,
  }),

  fetchActiveSprint: async () => {
    try {
      const res = await apiFetch('/api/sprints/active');
      if (res.ok) {
        const data = await res.json();
        if (data.sprint) {
          saveSprintLocal(data.sprint);
          set({
            activeSprint: data.sprint,
            selectedDayNumber: data.sprint.currentDay,
          });
          return;
        }
        saveSprintLocal(null);
        set({ activeSprint: null, selectedDayNumber: 1 });
      } else {
        const payload = await res.json().catch(() => ({}));
        set({ sprintBannerMessage: payload.message || payload.error || 'Unable to load your sprint. Please retry.' });
      }
    } catch {
      set({ sprintBannerMessage: 'Unable to reach the learning API. Your sprint was not changed.' });
    }
  },

  createSprint: async (targetCompany, dailyMinutesBudget) => {
    set({ isCreatingSprint: true });
    let created: CompanySprint | null = null;

    try {
      const res = await apiFetch('/api/sprints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCompany, dailyMinutesBudget }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || payload.error || 'Sprint creation failed.');
      }
      const data = await res.json();
      created = data.sprint;
      if (!created) throw new Error('The API did not return a created sprint.');
    } catch (error) {
      set({
        isCreatingSprint: false,
        sprintBannerMessage: error instanceof Error ? error.message : 'Unable to create sprint. Please retry.',
      });
      return;
    }

    saveSprintLocal(created);
    set({
      activeSprint: created,
      selectedDayNumber: 1,
      configuratorOpen: false,
      isCreatingSprint: false,
      selectedCompanyFilter: targetCompany,
      sprintBannerMessage: `Locked in 14-Day ${targetCompany} Sprint (${dailyMinutesBudget} min/day). Day 1 War-Room unlocked!`,
    });
  },

  completeSprintTask: async (dayNumber, taskId, scoreEarned = 92) => {
    const state = get();
    const sprint = state.activeSprint;
    if (!sprint) return { unlockedNextDay: false };

    let updatedSprint: CompanySprint | null = null;
    let unlockedNextDay = false;

    try {
      const res = await apiFetch(`/api/sprints/${encodeURIComponent(sprint.id)}/complete-task`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayNumber, taskId, scoreEarned }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.message || payload.error || 'Unable to save sprint progress.');
      }
      const data = await res.json();
      updatedSprint = data.sprint;
      unlockedNextDay = Boolean(data.unlockedNextDay);
      if (!updatedSprint) throw new Error('The API did not return the updated sprint.');
    } catch (error) {
      set({ sprintBannerMessage: error instanceof Error ? error.message : 'Unable to save sprint progress.' });
      return { unlockedNextDay: false };
    }



    saveSprintLocal(updatedSprint);
    set({
      activeSprint: updatedSprint,
      selectedDayNumber: unlockedNextDay ? updatedSprint.currentDay : state.selectedDayNumber,
      sprintBannerMessage: unlockedNextDay
        ? `Day ${dayNumber} cleared! Day ${dayNumber + 1} War-Room is now unlocked.`
        : `Completed sprint task (${scoreEarned}% readiness signal).`,
    });

    return { unlockedNextDay };
  },

  getProblemBySlug: (slug) => BIG_TECH_36_PROBLEMS.find((p) => p.slug === slug),
}));
