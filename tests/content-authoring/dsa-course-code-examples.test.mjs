import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { DSA_COMPLETE_LESSONS } from '../../src/data/dsaCompleteLessons.ts';

const hasJdk = spawnSync('javac', ['-version'], { encoding: 'utf8' }).status === 0;

function codeExample(lessonId, title) {
  const lesson = DSA_COMPLETE_LESSONS.find((item) => item.id === lessonId);
  const example = lesson?.codeExamples.find((item) => item.title === title);
  assert.ok(example?.code, lessonId + ': missing code example ' + title);
  return example.code;
}

test('Java DSA course examples handle integer overflow and repeated tree calls', { skip: !hasJdk }, () => {
  const twoSum = codeExample('hash-map', 'Two Sum with value-to-index mapping');
  const pairExists = codeExample('hash-set', 'Stable deduplication and one-pass pair lookup');
  const diameter = codeExample('binary-tree', 'Height and diameter in one postorder traversal');
  assert.match(twoSum, /long complement = \(long\) target - values\[i\]/);
  assert.match(pairExists, /long complement = \(long\) target - value/);
  assert.match(diameter, /int\[\] best = \{0\}/);
  assert.doesNotMatch(diameter, /static int diameter\s*=/);

  const source = `import java.util.*;
public class AuditCourseSnippets {
${twoSum}
${pairExists}
${diameter}
  public static void main(String[] args) {
    int[] falsePair = {Integer.MIN_VALUE, -1};
    if (twoSum(falsePair, Integer.MAX_VALUE).length != 0) throw new AssertionError("Two Sum overflow false positive");
    if (hasPairWithSum(falsePair, Integer.MAX_VALUE)) throw new AssertionError("pair-existence overflow false positive");
    int[] valid = twoSum(new int[]{2, 7, 11}, 9);
    if (valid.length != 2 || valid[0] != 0 || valid[1] != 1) throw new AssertionError("valid Two Sum pair");
    if (!hasPairWithSum(new int[]{2, 7, 11}, 9)) throw new AssertionError("valid pair-existence result");

    Node root = new Node(1); root.left = new Node(2); root.left.left = new Node(3); root.left.left.left = new Node(4);
    if (diameter(root) != 3) throw new AssertionError("tree diameter should be 3 edges");
    if (diameter(new Node(9)) != 0) throw new AssertionError("second call must not reuse previous diameter");
    if (diameter(null) != 0) throw new AssertionError("empty tree diameter");
    System.out.println("DSA Java examples passed");
  }
}`;
  const dir = mkdtempSync(path.join(os.tmpdir(), 'dsa-course-audit-'));
  try {
    const file = path.join(dir, 'AuditCourseSnippets.java');
    writeFileSync(file, source, 'utf8');
    execFileSync('javac', ['-d', dir, file], { stdio: 'pipe' });
    const output = execFileSync('java', ['-cp', dir, 'AuditCourseSnippets'], { encoding: 'utf8' });
    assert.match(output, /DSA Java examples passed/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
