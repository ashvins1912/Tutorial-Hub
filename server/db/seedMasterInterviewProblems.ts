import { InterviewProblem } from '../models/InterviewProblem';
import { MASTER_INTERVIEW_PROBLEM_ADDITIONS } from '../seed/masterInterviewProblemSeed';
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
    // Ensure the unique topic/title and slug indexes exist before any upserts.
    await InterviewProblem.init();
    const operations=MASTER_INTERVIEW_PROBLEM_ADDITIONS.map(item=>{
      const normalizedTitle=normalizeProblemTitle(item.title);
      return {
        updateOne:{
          filter:{topicId:item.topicId,normalizedTitle},
          update:{$setOnInsert:{
            ...item,normalizedTitle,examples:[],constraints:[],stages:{},
            source:{kind:'293-question-master-inventory'}
          }},
          upsert:true
        }
      };
    });
    const result=await InterviewProblem.bulkWrite(operations,{ordered:false});
    completed=true;
    console.log(`[Problem Catalog] Startup import complete: ${result.upsertedCount} inserted, ${result.matchedCount} already present, ${MASTER_INTERVIEW_PROBLEM_ADDITIONS.length} source rows.`);
  }catch(error){
    console.error('[Problem Catalog] Startup import failed; server will continue and retry on next process start:',error instanceof Error?error.message:String(error));
  }
}
