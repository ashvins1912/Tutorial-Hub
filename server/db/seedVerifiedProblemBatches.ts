import { InterviewProblem } from '../models/InterviewProblem';
import { ARRAYS_BATCH_01 } from '../seed/verifiedProblemBatches/arraysBatch01';

function assertVerifiedBatchRecord(item:any):void {
  const stages=item.stages??{};
  const implementation=stages.implement??{};
  const checks=item.authoringMetadata?.qualityChecks??{};
  const requiredChecks=['statement','examples','constraints','java','javascript','python','tests','animation','complexity'];
  const complete=typeof item.statement==='string' && item.statement.trim().length>40 &&
    Array.isArray(item.examples) && item.examples.length>0 &&
    Array.isArray(item.constraints) && item.constraints.length>0 &&
    Array.isArray(item.sourceReferences) && item.sourceReferences.length>0 &&
    item.sourceReferences.every((url:string)=>url.startsWith('https://leetcode.com/problems/')) &&
    ['java','javascript','python'].every((language:string)=>typeof implementation[language]==='string' && implementation[language].trim().length>40) &&
    implementation.languageStatus==='verified-submissions' &&
    Array.isArray(stages.practice?.testCases) && stages.practice.testCases.length>0 &&
    Array.isArray(stages.visualize?.animationSteps) && stages.visualize.animationSteps.length>=4 &&
    typeof stages.master?.proof==='string' && !!stages.master.timeComplexity && !!stages.master.spaceComplexity &&
    requiredChecks.every((key:string)=>checks[key]===true);
  if(!complete)throw new Error(`Verified batch quality gate failed for ${item.slug}`);
}

/** Import only content that passed source, code, test, animation and complexity gates. */
export async function seedVerifiedProblemBatches():Promise<void> {
  if(ARRAYS_BATCH_01.length!==5)throw new Error('Arrays batch 01 must contain exactly five authored problems.');
  for(const item of ARRAYS_BATCH_01) {
    assertVerifiedBatchRecord(item);
    const updated=await InterviewProblem.findOneAndUpdate(
      {slug:item.slug,topicId:'arrays'},
      {$set:{
        statement:item.statement,
        examples:item.examples,
        constraints:item.constraints,
        difficulty:item.difficulty,
        stages:item.stages,
        contentStatus:'validated',
        catalogStatus:'authored',
        source:{kind:'official-leetcode',reference:item.sourceReferences[0]},
        authoringMetadata:{
          ...item.authoringMetadata,
          generation:'source-verified-batch',
          verifiedAt:'startup-quality-gate',
          status:'validated',
          missingEvidence:[]
        }
      }},
      {new:true,runValidators:true}
    );
    if(!updated)throw new Error(`Cannot validate ${item.slug}: canonical inventory record was not found.`);
  }
  console.log(`[Problem Catalog] Source-verified batch imported: ${ARRAYS_BATCH_01.length} Arrays problems validated.`);
}
