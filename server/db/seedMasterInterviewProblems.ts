import { InterviewProblem } from '../models/InterviewProblem';
import { MASTER_INTERVIEW_PROBLEM_ADDITIONS } from './masterInterviewProblemSeed';
import { normalizeProblemTitle } from '../services/problemResolutionService';
import { isMongoConnected } from '../db/connectMongo';

let completed=false;

/**
 * Idempotent startup import. Uses topic + normalized title as the stable identity,
 * preserves authored fields, and only fills catalog metadata on existing records.
 */
export async function seedMasterInterviewProblems():Promise<void>{
  if(completed || !isMongoConnected())return;
  try{
    let inserted=0,existing=0;
    for(const item of MASTER_INTERVIEW_PROBLEM_ADDITIONS){
      const normalizedTitle=normalizeProblemTitle(item.title);
      const result=await InterviewProblem.updateOne(
        {topicId:item.topicId,normalizedTitle},
        {$setOnInsert:{
          ...item,normalizedTitle,examples:[],constraints:[],stages:{},
          source:{kind:'293-question-master-inventory'}
        }},
        {upsert:true,runValidators:true}
      );
      if(result.upsertedCount)inserted++;else existing++;
    }
    completed=true;
    console.log(`[Problem Catalog] Startup import complete: ${inserted} inserted, ${existing} already present, ${MASTER_INTERVIEW_PROBLEM_ADDITIONS.length} source rows.`);
  }catch(error){
    console.error('[Problem Catalog] Startup import failed; server will continue and retry on next process start:',error instanceof Error?error.message:String(error));
  }
}
