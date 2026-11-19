export type SortAlgorithmKey = 'bubble' | 'merge' | 'quick';
export type ArrayPresetKey = 'random' | 'reverse' | 'nearly-sorted' | 'duplicates';

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
