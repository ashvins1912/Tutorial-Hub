import type { CodeLanguage } from '../../types/dsa';

export type SortAlgorithmKey = 'bubble' | 'merge' | 'quick';
export type ArrayPresetKey = 'random' | 'reverse' | 'nearly-sorted' | 'duplicates';
export type SortCodePhase =
  | 'init'
  | 'compare'
  | 'swap'
  | 'early-exit'
  | 'write'
  | 'drain-left'
  | 'drain-right'
  | 'swap-left'
  | 'place-pivot'
  | 'done';

export interface SortCodeSpec {
  algorithm: SortAlgorithmKey;
  title: string;
  bestCase: string;
  averageCase: string;
  worstCase: string;
  space: string;
  stable: boolean;
  inPlace: boolean;
  invariant: string;
  interviewTip: string;
  code: Record<CodeLanguage, string[]>;
  highlightLines: Record<CodeLanguage, Partial<Record<SortCodePhase, number[]>>>;
}

export const SORTING_CODE_SPECS: Record<SortAlgorithmKey, SortCodeSpec> = {
  bubble: {
    algorithm: 'bubble',
    title: 'Bubble Sort (Early-Exit Optimized)',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    space: 'O(1)',
    stable: true,
    inPlace: true,
    invariant: 'After pass i, the last i + 1 elements a[n-1-i .. n-1] are in their final sorted positions.',
    interviewTip: 'Never use in production for large n, but the early-exit swapped flag turns nearly-sorted input into O(n).',
    code: {
      python: [
        'def bubble_sort(a: list[int]) -> list[int]:',
        '    n = len(a)',
        '    for i in range(n - 1):',
        '        swapped = False',
        '        for j in range(n - 1 - i):',
        '            if a[j] > a[j + 1]:',
        '                a[j], a[j + 1] = a[j + 1], a[j]',
        '                swapped = True',
        '        if not swapped:',
        '            break',
        '    return a',
      ],
      js: [
        'function bubbleSort(a) {',
        '  const n = a.length;',
        '  for (let i = 0; i < n - 1; i++) {',
        '    let swapped = false;',
        '    for (let j = 0; j < n - 1 - i; j++) {',
        '      if (a[j] > a[j + 1]) {',
        '        [a[j], a[j + 1]] = [a[j + 1], a[j]];',
        '        swapped = true;',
        '      }',
        '    }',
        '    if (!swapped) break;',
        '  }',
        '  return a;',
        '}',
      ],
      java: [
        'public static int[] bubbleSort(int[] a) {',
        '    int n = a.length;',
        '    for (int i = 0; i < n - 1; i++) {',
        '        boolean swapped = false;',
        '        for (int j = 0; j < n - 1 - i; j++) {',
        '            if (a[j] > a[j + 1]) {',
        '                int tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;',
        '                swapped = true;',
        '            }',
        '        }',
        '        if (!swapped) break;',
        '    }',
        '    return a;',
        '}',
      ],
    },
    highlightLines: {
      python: { init: [1, 2], compare: [5, 6], swap: [7, 8], 'early-exit': [9, 10], done: [11] },
      js: { init: [1, 2], compare: [5, 6], swap: [7, 8], 'early-exit': [11], done: [13] },
      java: { init: [1, 2], compare: [5, 6], swap: [7, 8], 'early-exit': [11], done: [13] },
    },
  },
  merge: {
    algorithm: 'merge',
    title: 'Merge Sort (Divide & Conquer)',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    space: 'O(n)',
    stable: true,
    inPlace: false,
    invariant: 'Before merge(lo, mid, hi), both a[lo..mid] and a[mid+1..hi] are independently sorted; using <= preserves stability.',
    interviewTip: 'Guaranteed O(n log n) worst case and stable — the go-to choice for Linked Lists, external disk sort, and counting inversions.',
    code: {
      python: [
        'def merge_sort(a: list[int], lo: int, hi: int) -> None:',
        '    if lo >= hi: return',
        '    mid = lo + (hi - lo) // 2',
        '    merge_sort(a, lo, mid)',
        '    merge_sort(a, mid + 1, hi)',
        '    left, right = a[lo:mid + 1], a[mid + 1:hi + 1]',
        '    i = j = 0; k = lo',
        '    while i < len(left) and j < len(right):',
        '        if left[i] <= right[j]:',
        '            a[k] = left[i]; i += 1',
        '        else:',
        '            a[k] = right[j]; j += 1',
        '        k += 1',
        '    while i < len(left): a[k] = left[i]; i += 1; k += 1',
        '    while j < len(right): a[k] = right[j]; j += 1; k += 1',
      ],
      js: [
        'function mergeSort(a, lo = 0, hi = a.length - 1) {',
        '  if (lo >= hi) return;',
        '  const mid = lo + Math.floor((hi - lo) / 2);',
        '  mergeSort(a, lo, mid);',
        '  mergeSort(a, mid + 1, hi);',
        '  const left = a.slice(lo, mid + 1), right = a.slice(mid + 1, hi + 1);',
        '  let i = 0, j = 0, k = lo;',
        '  while (i < left.length && j < right.length) {',
        '    if (left[i] <= right[j]) a[k++] = left[i++];',
        '    else a[k++] = right[j++];',
        '  }',
        '  while (i < left.length) a[k++] = left[i++];',
        '  while (j < right.length) a[k++] = right[j++];',
        '}',
      ],
      java: [
        'public static void mergeSort(int[] a, int lo, int hi) {',
        '    if (lo >= hi) return;',
        '    int mid = lo + (hi - lo) / 2;',
        '    mergeSort(a, lo, mid);',
        '    mergeSort(a, mid + 1, hi);',
        '    int[] left = Arrays.copyOfRange(a, lo, mid + 1);',
        '    int[] right = Arrays.copyOfRange(a, mid + 1, hi + 1);',
        '    int i = 0, j = 0, k = lo;',
        '    while (i < left.length && j < right.length) {',
        '        if (left[i] <= right[j]) a[k++] = left[i++];',
        '        else a[k++] = right[j++];',
        '    }',
        '    while (i < left.length) a[k++] = left[i++];',
        '    while (j < right.length) a[k++] = right[j++];',
        '}',
      ],
    },
    highlightLines: {
      python: { init: [1, 3, 4, 5], compare: [8, 9], write: [10, 12, 13], 'drain-left': [14], 'drain-right': [15], done: [1] },
      js: { init: [1, 3, 4, 5], compare: [8, 9], write: [9, 10], 'drain-left': [12], 'drain-right': [13], done: [14] },
      java: { init: [1, 3, 4, 5], compare: [9, 10], write: [10, 11], 'drain-left': [13], 'drain-right': [14], done: [15] },
    },
  },
  quick: {
    algorithm: 'quick',
    title: 'Quick Sort (Median-of-Three + Lomuto Partition)',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n²) rare',
    space: 'O(log n)',
    stable: false,
    inPlace: true,
    invariant: 'During partition(lo, hi), a[lo..store-1] < pivot and a[store..j-1] >= pivot; final swap locks pivot at index store.',
    interviewTip: 'Median-of-three pivot selection prevents O(n²) degradation on already-sorted or reverse-sorted inputs; same partition powers O(n) Quickselect (Kth Largest).',
    code: {
      python: [
        'def quick_sort(a: list[int], lo: int, hi: int) -> None:',
        '    if lo >= hi: return',
        '    mid = lo + (hi - lo) // 2',
        '    # Median-of-three places balanced pivot at a[hi]',
        '    if a[mid] < a[lo]: a[lo], a[mid] = a[mid], a[lo]',
        '    if a[hi] < a[lo]: a[lo], a[hi] = a[hi], a[lo]',
        '    if a[mid] < a[hi]: a[mid], a[hi] = a[hi], a[mid]',
        '    pivot, store = a[hi], lo',
        '    for j in range(lo, hi):',
        '        if a[j] < pivot:',
        '            a[store], a[j] = a[j], a[store]',
        '            store += 1',
        '    a[store], a[hi] = a[hi], a[store]',
        '    quick_sort(a, lo, store - 1)',
        '    quick_sort(a, store + 1, hi)',
      ],
      js: [
        'function quickSort(a, lo = 0, hi = a.length - 1) {',
        '  if (lo >= hi) return;',
        '  const mid = lo + Math.floor((hi - lo) / 2);',
        '  if (a[mid] < a[lo]) [a[lo], a[mid]] = [a[mid], a[lo]];',
        '  if (a[hi] < a[lo]) [a[lo], a[hi]] = [a[hi], a[lo]];',
        '  if (a[mid] < a[hi]) [a[mid], a[hi]] = [a[hi], a[mid]];',
        '  const pivot = a[hi];',
        '  let store = lo;',
        '  for (let j = lo; j < hi; j++) {',
        '    if (a[j] < pivot) {',
        '      [a[store], a[j]] = [a[j], a[store]];',
        '      store++;',
        '    }',
        '  }',
        '  [a[store], a[hi]] = [a[hi], a[store]];',
        '  quickSort(a, lo, store - 1);',
        '  quickSort(a, store + 1, hi);',
        '}',
      ],
      java: [
        'public static void quickSort(int[] a, int lo, int hi) {',
        '    if (lo >= hi) return;',
        '    int mid = lo + (hi - lo) / 2;',
        '    if (a[mid] < a[lo]) swap(a, lo, mid);',
        '    if (a[hi] < a[lo]) swap(a, lo, hi);',
        '    if (a[mid] < a[hi]) swap(a, mid, hi);',
        '    int pivot = a[hi], store = lo;',
        '    for (int j = lo; j < hi; j++) {',
        '        if (a[j] < pivot) {',
        '            swap(a, store, j);',
        '            store++;',
        '        }',
        '    }',
        '    swap(a, store, hi);',
        '    quickSort(a, lo, store - 1);',
        '    quickSort(a, store + 1, hi);',
        '}',
      ],
    },
    highlightLines: {
      python: { init: [1, 3, 8], compare: [9, 10], 'swap-left': [11, 12], 'place-pivot': [13, 14, 15], done: [1] },
      js: { init: [1, 3, 7, 8], compare: [9, 10], 'swap-left': [11, 12], 'place-pivot': [15, 16, 17], done: [18] },
      java: { init: [1, 3, 7], compare: [8, 9], 'swap-left': [10, 11], 'place-pivot': [14, 15, 16], done: [17] },
    },
  },
};

export interface SortStepFrame {
  step: number;
  array: number[];
  comparing: number[];
  swapping: number[];
  pivotIndex?: number;
  activeRange?: [number, number];
  sortedIndices: number[];
  comparisons: number;
  swaps: number;
  note: string;
  codePhase: SortCodePhase;
  vars?: Record<string, string | number>;
}

export interface SortTrace {
  algorithm: SortAlgorithmKey;
  name: string;
  complexity: string;
  worstCase: string;
  space: string;
  frames: SortStepFrame[];
  totalComparisons: number;
  totalSwaps: number;
}

export function generatePresetArray(size: number, preset: ArrayPresetKey, seed = 42): number[] {
  const n = Math.max(6, Math.min(32, size));
  if (preset === 'reverse') {
    return Array.from({ length: n }, (_, i) => Math.round(15 + ((n - i) / n) * 80));
  }
  if (preset === 'nearly-sorted') {
    const arr = Array.from({ length: n }, (_, i) => Math.round(15 + ((i + 1) / n) * 80));
    for (let i = 1; i < n - 1; i += 4) {
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    }
    return arr;
  }
  if (preset === 'duplicates') {
    const palette = [22, 42, 64, 86];
    let s = seed;
    return Array.from({ length: n }, () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return palette[s % palette.length];
    });
  }

  // Deterministic pseudo-random so clicking presets or reseeding is crisp
  let s = seed;
  return Array.from({ length: n }, () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return 12 + (s % 85);
  });
}

export function buildBubbleSortTrace(input: number[]): SortTrace {
  const a = [...input];
  const n = a.length;
  const frames: SortStepFrame[] = [];
  const sorted = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  frames.push({
    step: 0,
    array: [...a],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    comparisons: 0,
    swaps: 0,
    note: `Start Bubble Sort on ${n} elements — adjacent passes bubble the largest value to the end.`,
    codePhase: 'init',
    vars: { n },
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [j, j + 1],
        swapping: [],
        activeRange: [0, n - 1 - i],
        sortedIndices: Array.from(sorted),
        comparisons,
        swaps,
        note: `Compare a[${j}]=${a[j]} and a[${j + 1}]=${a[j + 1]}.`,
        codePhase: 'compare',
        vars: { i, j, 'a[j]': a[j], 'a[j+1]': a[j + 1], swapped: swappedInPass ? 'true' : 'false' },
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        swappedInPass = true;
        frames.push({
          step: frames.length,
          array: [...a],
          comparing: [],
          swapping: [j, j + 1],
          activeRange: [0, n - 1 - i],
          sortedIndices: Array.from(sorted),
          comparisons,
          swaps,
          note: `Swap ${a[j + 1]} ↔ ${a[j]} so larger value bubbles right.`,
          codePhase: 'swap',
          vars: { i, j, 'a[j]': a[j], 'a[j+1]': a[j + 1], swapped: 'true' },
        });
      }
    }
    sorted.add(n - 1 - i);
    if (!swappedInPass) {
      for (let k = 0; k < n; k++) sorted.add(k);
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [],
        swapping: [],
        sortedIndices: Array.from(sorted),
        comparisons,
        swaps,
        note: `Zero swaps on pass ${i + 1} — early exit! Array is already sorted.`,
        codePhase: 'early-exit',
        vars: { i, swapped: 'false' },
      });
      break;
    }
  }

  for (let k = 0; k < n; k++) sorted.add(k);
  frames.push({
    step: frames.length,
    array: [...a],
    comparing: [],
    swapping: [],
    sortedIndices: Array.from(sorted),
    comparisons,
    swaps,
    note: `Bubble Sort complete in ${comparisons} comparisons and ${swaps} swaps.`,
    codePhase: 'done',
    vars: { n, comparisons, swaps },
  });

  return {
    algorithm: 'bubble',
    name: 'Bubble Sort',
    complexity: 'O(n²)',
    worstCase: 'O(n²)',
    space: 'O(1)',
    frames,
    totalComparisons: comparisons,
    totalSwaps: swaps,
  };
}

export function buildMergeSortTrace(input: number[]): SortTrace {
  const a = [...input];
  const n = a.length;
  const frames: SortStepFrame[] = [];
  let comparisons = 0;
  let swaps = 0; // writes during merge

  frames.push({
    step: 0,
    array: [...a],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    comparisons: 0,
    swaps: 0,
    note: `Start Merge Sort on ${n} elements — recursively split halves and merge in O(n log n).`,
    codePhase: 'init',
    vars: { lo: 0, hi: n - 1 },
  });

  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0;
    let j = 0;
    let k = lo;

    while (i < left.length && j < right.length) {
      comparisons++;
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [lo + i, mid + 1 + j],
        swapping: [],
        activeRange: [lo, hi],
        sortedIndices: [],
        comparisons,
        swaps,
        note: `Merge [${lo}..${mid}] & [${mid + 1}..${hi}]: compare ${left[i]} vs ${right[j]}.`,
        codePhase: 'compare',
        vars: { lo, mid, hi, i, j, k, 'left[i]': left[i], 'right[j]': right[j] },
      });

      if (left[i] <= right[j]) {
        a[k] = left[i++];
      } else {
        a[k] = right[j++];
      }
      swaps++;
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [],
        swapping: [k],
        activeRange: [lo, hi],
        sortedIndices: [],
        comparisons,
        swaps,
        note: `Write smaller value ${a[k]} into merged slot index ${k}.`,
        codePhase: 'write',
        vars: { lo, mid, hi, i, j, k, 'a[k]': a[k] },
      });
      k++;
    }

    while (i < left.length) {
      a[k] = left[i++];
      swaps++;
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [],
        swapping: [k],
        activeRange: [lo, hi],
        sortedIndices: [],
        comparisons,
        swaps,
        note: `Copy remaining left element ${a[k]} into index ${k}.`,
        codePhase: 'drain-left',
        vars: { lo, mid, hi, i, k, 'a[k]': a[k] },
      });
      k++;
    }

    while (j < right.length) {
      a[k] = right[j++];
      swaps++;
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [],
        swapping: [k],
        activeRange: [lo, hi],
        sortedIndices: [],
        comparisons,
        swaps,
        note: `Copy remaining right element ${a[k]} into index ${k}.`,
        codePhase: 'drain-right',
        vars: { lo, mid, hi, j, k, 'a[k]': a[k] },
      });
      k++;
    }
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  sort(0, n - 1);

  frames.push({
    step: frames.length,
    array: [...a],
    comparing: [],
    swapping: [],
    sortedIndices: Array.from({ length: n }, (_, idx) => idx),
    comparisons,
    swaps,
    note: `Merge Sort complete in ${comparisons} comparisons and ${swaps} buffer writes (guaranteed O(n log n)).`,
    codePhase: 'done',
    vars: { n, comparisons, writes: swaps },
  });

  return {
    algorithm: 'merge',
    name: 'Merge Sort',
    complexity: 'O(n log n)',
    worstCase: 'O(n log n)',
    space: 'O(n)',
    frames,
    totalComparisons: comparisons,
    totalSwaps: swaps,
  };
}

export function buildQuickSortTrace(input: number[]): SortTrace {
  const a = [...input];
  const n = a.length;
  const frames: SortStepFrame[] = [];
  const sorted = new Set<number>();
  let comparisons = 0;
  let swaps = 0;

  frames.push({
    step: 0,
    array: [...a],
    comparing: [],
    swapping: [],
    sortedIndices: [],
    comparisons: 0,
    swaps: 0,
    note: `Start Quick Sort on ${n} elements — median-of-three pivot + in-place partitioning.`,
    codePhase: 'init',
    vars: { lo: 0, hi: n - 1 },
  });

  function partition(lo: number, hi: number): number {
    // Median-of-three pivot choice avoids O(n^2) on sorted/reverse arrays
    const mid = lo + Math.floor((hi - lo) / 2);
    if (a[mid] < a[lo]) {
      [a[lo], a[mid]] = [a[mid], a[lo]];
      swaps++;
    }
    if (a[hi] < a[lo]) {
      [a[lo], a[hi]] = [a[hi], a[lo]];
      swaps++;
    }
    if (a[mid] < a[hi]) {
      [a[mid], a[hi]] = [a[hi], a[mid]];
      swaps++;
    }

    const pivot = a[hi];
    let store = lo;

    for (let j = lo; j < hi; j++) {
      comparisons++;
      frames.push({
        step: frames.length,
        array: [...a],
        comparing: [j, hi],
        swapping: [],
        pivotIndex: hi,
        activeRange: [lo, hi],
        sortedIndices: Array.from(sorted),
        comparisons,
        swaps,
        note: `Partition [${lo}..${hi}] around pivot ${pivot}: compare a[${j}]=${a[j]}.`,
        codePhase: 'compare',
        vars: { lo, hi, pivot, store, j, 'a[j]': a[j] },
      });

      if (a[j] < pivot) {
        if (store !== j) {
          [a[store], a[j]] = [a[j], a[store]];
          swaps++;
          frames.push({
            step: frames.length,
            array: [...a],
            comparing: [],
            swapping: [store, j],
            pivotIndex: hi,
            activeRange: [lo, hi],
            sortedIndices: Array.from(sorted),
            comparisons,
            swaps,
            note: `a[${j}] < ${pivot} → swap into left partition index ${store}.`,
            codePhase: 'swap-left',
            vars: { lo, hi, pivot, store, j, 'a[store]': a[store] },
          });
        }
        store++;
      }
    }

    if (store !== hi) {
      [a[store], a[hi]] = [a[hi], a[store]];
      swaps++;
    }
    sorted.add(store);
    frames.push({
      step: frames.length,
      array: [...a],
      comparing: [],
      swapping: [store, hi],
      pivotIndex: store,
      activeRange: [lo, hi],
      sortedIndices: Array.from(sorted),
      comparisons,
      swaps,
      note: `Lock pivot ${pivot} into final sorted index ${store}.`,
      codePhase: 'place-pivot',
      vars: { lo, hi, pivot, store },
    });

    return store;
  }

  function sort(lo: number, hi: number) {
    if (lo > hi) return;
    if (lo === hi) {
      sorted.add(lo);
      return;
    }
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  }

  sort(0, n - 1);

  frames.push({
    step: frames.length,
    array: [...a],
    comparing: [],
    swapping: [],
    sortedIndices: Array.from({ length: n }, (_, idx) => idx),
    comparisons,
    swaps,
    note: `Quick Sort complete in ${comparisons} comparisons and ${swaps} in-place swaps.`,
    codePhase: 'done',
    vars: { n, comparisons, swaps },
  });

  return {
    algorithm: 'quick',
    name: 'Quick Sort',
    complexity: 'O(n log n)',
    worstCase: 'O(n²) rare',
    space: 'O(log n)',
    frames,
    totalComparisons: comparisons,
    totalSwaps: swaps,
  };
}
