import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ARRAYS_BATCH_01 } from '../../server/seed/verifiedProblemBatches/arraysBatch01.ts';

const cases = {
  'arrays-two-sum': [
    { args:[[2,7,11,15],9], expected:[0,1] },
    { args:[[3,2,4],6], expected:[1,2] },
    { args:[[3,3],6], expected:[0,1] },
    { args:[[-3,4,3,90],0], expected:[0,2] },
  ],
  'arrays-best-time-to-buy-and-sell-stock': [
    { args:[[7,1,5,3,6,4]], expected:5 },
    { args:[[7,6,4,3,1]], expected:0 },
    { args:[[1]], expected:0 },
    { args:[[1,2]], expected:1 },
    { args:[[2,1,2,1,3]], expected:2 },
  ],
  'arrays-contains-duplicate': [
    { args:[[1,2,3,1]], expected:true },
    { args:[[1,2,3,4]], expected:false },
    { args:[[1,1,1,3,3,4,3,2,4,2]], expected:true },
    { args:[[-1000000000,1000000000]], expected:false },
    { args:[[0,0]], expected:true },
  ],
  'arrays-maximum-subarray-kadanes-algorithm': [
    { args:[[-2,1,-3,4,-1,2,1,-5,4]], expected:6 },
    { args:[[1]], expected:1 },
    { args:[[5,4,-1,7,8]], expected:23 },
    { args:[[-2,-1]], expected:-1 },
    { args:[[0,0]], expected:0 },
  ],
  'arrays-product-of-array-except-self': [
    { args:[[1,2,3,4]], expected:[24,12,8,6] },
    { args:[[-1,1,0,-3,3]], expected:[0,0,9,0,0] },
    { args:[[2,3]], expected:[3,2] },
    { args:[[0,4,0]], expected:[0,0,0] },
  ],
};

const methods = {
  'arrays-two-sum':{java:'twoSum',python:'twoSum',javascript:'twoSum',javaType:'int[]'},
  'arrays-best-time-to-buy-and-sell-stock':{java:'maxProfit',python:'maxProfit',javascript:'maxProfit',javaType:'int'},
  'arrays-contains-duplicate':{java:'containsDuplicate',python:'containsDuplicate',javascript:'containsDuplicate',javaType:'boolean'},
  'arrays-maximum-subarray-kadanes-algorithm':{java:'maxSubArray',python:'maxSubArray',javascript:'maxSubArray',javaType:'int'},
  'arrays-product-of-array-except-self':{java:'productExceptSelf',python:'productExceptSelf',javascript:'productExceptSelf',javaType:'int[]'},
};

function run(command,args,options={}) {
  const result=spawnSync(command,args,{encoding:'utf8',...options});
  if(result.status!==0) throw new Error(`${command} failed: ${result.stderr || result.stdout}`);
  return result.stdout.trim();
}
function normalize(value) { return JSON.stringify(value); }

let total=0;
for (const problem of ARRAYS_BATCH_01) {
  const vectors=cases[problem.slug];
  assert.ok(vectors?.length,'Missing executable cases for '+problem.slug);
  const method=methods[problem.slug];

  // Execute the exact JavaScript submission stored in the lesson payload.
  const jsFn=new Function(`${problem.stages.implement.javascript}; return ${method.javascript};`)();
  for (const test of vectors) {
    assert.equal(normalize(jsFn(...test.args)),normalize(test.expected),problem.title+' JavaScript '+JSON.stringify(test.args));
    total++;
  }

  // Compile and execute the exact Java submission stored in the lesson payload.
  const javaDir=mkdtempSync(path.join(tmpdir(),'dsa-java-'));
  try {
    const javaMain=method.javaType==='int[]'
      ? `System.out.print(java.util.Arrays.toString(result));`
      : `System.out.print(result);`;
    const invocation=problem.slug==='arrays-two-sum'
      ? `int[] result = solution.twoSum(nums, Integer.parseInt(args[1])); ${javaMain}`
      : `var result = solution.${method.java}(nums); ${javaMain}`;
    const runner=`class Runner { public static void main(String[] args) { int[] nums=java.util.Arrays.stream(args[0].split(",")).mapToInt(Integer::parseInt).toArray(); Solution solution=new Solution(); ${invocation} } }`;
    writeFileSync(path.join(javaDir,'Solution.java'),problem.stages.implement.java+'\n'+runner);
    run('javac',['Solution.java'],{cwd:javaDir});
    for (const test of vectors) {
      const args=[test.args[0].join(',')];
      if(test.args.length>1)args.push(String(test.args[1]));
      const output=run('java',['Runner',...args],{cwd:javaDir}).replace(/\s/g,'');
      const expected=Array.isArray(test.expected)?'['+test.expected.join(',')+']':String(test.expected);
      assert.equal(output,expected,problem.title+' Java '+JSON.stringify(test.args));
      total++;
    }
  } finally { rmSync(javaDir,{recursive:true,force:true}); }

  // Execute the exact Python submission stored in the lesson payload.
  const pyDir=mkdtempSync(path.join(tmpdir(),'dsa-python-'));
  try {
    const harness=`\nimport json,sys\nargs=json.load(sys.stdin)\nresult=Solution().${method.python}( *args )\nprint(json.dumps(result))\n`;
    const file=path.join(pyDir,'test_solution.py');
    writeFileSync(file,problem.stages.implement.python+harness);
    for (const test of vectors) {
      const output=run('python3',[file],{input:JSON.stringify(test.args)});
      assert.equal(output,normalize(test.expected),problem.title+' Python '+JSON.stringify(test.args));
      total++;
    }
  } finally { rmSync(pyDir,{recursive:true,force:true}); }
}
console.log(`Verified ${ARRAYS_BATCH_01.length} problems across Java, JavaScript and Python: ${total} executable checks passed.`);
