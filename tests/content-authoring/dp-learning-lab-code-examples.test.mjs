import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = readFileSync(path.join(root, 'src/components/DpLearningLab.tsx'), 'utf8');
const javaLiterals = [];
for (let position = 0; (position = source.indexOf('java: "', position)) >= 0;) {
  const quoteStart = position + 6;
  let end = quoteStart + 1;
  let escaped = false;
  for (; end < source.length; end++) {
    if (escaped) escaped = false;
    else if (source[end] === '\\') escaped = true;
    else if (source[end] === '"') break;
  }
  javaLiterals.push(JSON.parse(source.slice(quoteStart, end + 1)));
  position = end + 1;
}
const hasJdk = spawnSync('javac', ['-version'], { encoding: 'utf8' }).status === 0;

test('DP Java examples compile and selected recurrences pass edge cases', { skip: !hasJdk }, () => {
  assert.equal(javaLiterals.length, 8, 'all eight guided lesson code examples must be inventoried');
  const advanced = javaLiterals[7];
  const methods = javaLiterals.slice(0, 7).join('\n');
  const classSource = `import java.util.*;
class DpCourseSnippet {
${methods}
  void intervalSkeleton(int n) {
    int[][] dp = new int[n][n];
${advanced}
  }
  public static void main(String[] args) {
    DpCourseSnippet d = new DpCourseSnippet();
    if (d.climbStairs(3) != 3L || d.climbStairs(0) != 1L) throw new AssertionError("climbing stairs");
    if (d.climbStairs(91) != 7540113804746346429L) throw new AssertionError("long boundary");
    if (d.climbStairsTabulation(5) != 8L) throw new AssertionError("tabulation");
    long[] memo = new long[6]; Arrays.fill(memo, -1L);
    if (d.solve(5, memo) != 8L) throw new AssertionError("memoization");
    if (d.rob(new int[]{2,7,9,3,1}) != 12L) throw new AssertionError("house robber");
    if (d.uniquePaths(3, 7) != 28L) throw new AssertionError("unique paths");
    if (d.knapsack01(new int[]{1,3,4}, new int[]{15,20,30}, 4) != 35L) throw new AssertionError("knapsack");
    if (d.lcsLength("😀a", "😀b") != 1) throw new AssertionError("Unicode code-point LCS");
    boolean badN = false; try { d.climbStairs(92); } catch (IllegalArgumentException expected) { badN = true; }
    if (!badN) throw new AssertionError("stairs bound");
    boolean badMemo = false; try { d.solve(3, new long[3]); } catch (IllegalArgumentException expected) { badMemo = true; }
    if (!badMemo) throw new AssertionError("memo length bound");
    boolean badGrid = false; try { d.uniquePaths(0, 3); } catch (IllegalArgumentException expected) { badGrid = true; }
    if (!badGrid) throw new AssertionError("grid dimensions");
    boolean overflow = false; try { d.uniquePaths(100, 100); } catch (ArithmeticException expected) { overflow = true; }
    if (!overflow) throw new AssertionError("path count overflow must be detected");
    d.intervalSkeleton(4);
    System.out.println("DP Java examples passed");
  }
}`;
  const dir = mkdtempSync(path.join(os.tmpdir(), 'dp-course-audit-'));
  try {
    const file = path.join(dir, 'DpCourseSnippet.java');
    writeFileSync(file, classSource, 'utf8');
    execFileSync('javac', ['-d', dir, file], { stdio: 'pipe' });
    const output = execFileSync('java', ['-cp', dir, 'DpCourseSnippet'], { encoding: 'utf8' });
    assert.match(output, /DP Java examples passed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
