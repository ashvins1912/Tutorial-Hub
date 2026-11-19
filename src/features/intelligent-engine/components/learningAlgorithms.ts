export type TraceStep = { title: string; explanation: string; values: number[]; active: number[]; variables: Record<string, string | number> };

export function binarySearchTrace(values: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let left = 0, right = values.length - 1;
  while (left <= right && steps.length < 100) {
    const mid = Math.floor(left + (right - left) / 2);
    steps.push({ title: 'Compare the middle value', explanation: `Compare ${values[mid]} at index ${mid} with target ${target}.`, values: [...values], active: [mid], variables: { left, mid, right, target } });
    if (values[mid] === target) {
      steps.push({ title: 'Target found', explanation: `The target is at index ${mid}. Binary search stops.`, values: [...values], active: [mid], variables: { result: mid, comparisons: steps.length } });
      return steps;
    }
    if (values[mid] < target) {
      left = mid + 1;
      steps.push({ title: 'Discard the left half', explanation: 'The middle value is smaller, so continue in the right half.', values: [...values], active: [left, right].filter((i) => i >= 0 && i < values.length), variables: { left, right, target } });
    } else {
      right = mid - 1;
      steps.push({ title: 'Discard the right half', explanation: 'The middle value is larger, so continue in the left half.', values: [...values], active: [left, right].filter((i) => i >= 0 && i < values.length), variables: { left, right, target } });
    }
  }
  steps.push({ title: 'Target not found', explanation: 'The search interval is empty. Return -1.', values: [...values], active: [], variables: { result: -1, comparisons: steps.filter((s) => s.title === 'Compare the middle value').length } });
  return steps;
}

export function bubbleSortTrace(values: number[]): TraceStep[] {
  const result = [...values];
  const steps: TraceStep[] = [{ title: 'Initial array', explanation: 'Compare adjacent values and swap them when they are out of order.', values: [...result], active: [], variables: { pass: 0, swaps: 0 } }];
  let swaps = 0;
  for (let pass = 0; pass < result.length - 1 && steps.length < 100; pass++) {
    let changed = false;
    for (let index = 0; index < result.length - pass - 1 && steps.length < 100; index++) {
      const before = [...result];
      const shouldSwap = result[index] > result[index + 1];
      if (shouldSwap) { [result[index], result[index + 1]] = [result[index + 1], result[index]]; swaps++; changed = true; }
      steps.push({ title: shouldSwap ? 'Swap adjacent values' : 'Keep adjacent values', explanation: shouldSwap ? `${before[index]} is greater than ${before[index + 1]}, so swap them.` : `${before[index]} is not greater than ${before[index + 1]}, so keep the order.`, values: [...result], active: [index, index + 1], variables: { pass: pass + 1, comparisons: steps.length, swaps } });
    }
    if (!changed) break;
  }
  steps.push({ title: 'Array sorted', explanation: 'No more adjacent swaps are required.', values: [...result], active: [], variables: { swaps, result: 'sorted' } });
  return steps;
}

export function parseInput(raw: string): number[] {
  if (!raw.trim()) throw new Error('Enter comma-separated finite numbers.');
  const parts = raw.split(',').map((part) => part.trim());
  if (parts.some((part) => !part)) throw new Error('Enter comma-separated finite numbers.');
  const values = parts.map(Number);
  if (!values.length || values.some((value) => !Number.isFinite(value))) throw new Error('Enter comma-separated finite numbers.');
  if (values.length > 12) throw new Error('Use at most 12 values for a readable trace.');
  return values;
}
