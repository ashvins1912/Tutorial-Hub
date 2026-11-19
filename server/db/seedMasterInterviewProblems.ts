import { InterviewProblem } from '../models/InterviewProblem';
import { MASTER_INTERVIEW_PROBLEM_ADDITIONS } from '../seed/masterInterviewProblemSeed';
import { buildMasterProblemLesson } from '../seed/masterProblemLessonAuthor';
import { normalizeProblemTitle } from '../services/problemResolutionService';
import { isMongoConnected } from '../db/connectMongo';

let completed=false;

/**
 * Idempotent startup import. Uses topic + normalized title as the stable identity,
 * preserves authored fields, and only fills catalog metadata on existing records.
 */
export async function seedMasterInterviewProblems():Promise<void>{
  if(completed || !isMongoConnected())return;
  if(MASTER_INTERVIEW_PROBLEM_ADDITIONS.length!==293)throw new Error('Master DSA inventory must contain exactly 293 questions.');
  const uniqueSlugs=new Set(MASTER_INTERVIEW_PROBLEM_ADDITIONS.map(item=>item.slug));
  if(uniqueSlugs.size!==MASTER_INTERVIEW_PROBLEM_ADDITIONS.length)throw new Error('Duplicate topic-scoped problem slug in master inventory.');
  try{
    await InterviewProblem.init();
    const operations=MASTER_INTERVIEW_PROBLEM_ADDITIONS.map(item=>{
      const normalizedTitle=normalizeProblemTitle(item.title);
      const lesson=buildMasterProblemLesson(item);
      return {
        updateOne:{
          filter:{topicId:item.topicId,normalizedTitle},
          // Pipeline $ifNull enriches missing fields but never replaces authored content.
          update:[{$set:{
            slug:{$ifNull:['$slug',item.slug]},
            title:{$ifNull:['$title',item.title]},
            normalizedTitle:{$ifNull:['$normalizedTitle',normalizedTitle]},
            topicId:{$ifNull:['$topicId',item.topicId]},
            topic:{$ifNull:['$topic',item.topic]},
            difficulty:{$ifNull:['$difficulty',item.difficulty]},
            aliases:{$ifNull:['$aliases',item.aliases]},
            relatedTitles:{$ifNull:['$relatedTitles',item.relatedTitles]},
            catalogStatus:{$cond:[{$eq:['$catalogStatus','authored']},'authored','review']},
            contentStatus:{$cond:[{$eq:['$contentStatus','validated']},'validated','in-progress']},
            statement:{$ifNull:['$statement',lesson.statement]},
            examples:{$ifNull:['$examples',[]]},
            constraints:{$ifNull:['$constraints',[]]},
            stages:{
              understand:{$ifNull:['$stages.understand',lesson.stages.understand]},
              visualize:{$ifNull:['$stages.visualize',lesson.stages.visualize]},
              implement:{$ifNull:['$stages.implement',lesson.stages.implement]},
              practice:{$ifNull:['$stages.practice',lesson.stages.practice]},
              master:{$ifNull:['$stages.master',lesson.stages.master]}
            },
            authoringMetadata:{$ifNull:['$authoringMetadata',lesson.authoringMetadata]},
            source:{$ifNull:['$source',{kind:'293-question-master-inventory'}]}
          }}],
          upsert:true
        }
      };
    });
    const result=await InterviewProblem.bulkWrite(operations,{ordered:false});
    completed=true;
    console.log(`[Problem Catalog] Five-stage authoring import complete: ${result.upsertedCount} inserted, ${result.matchedCount} enriched/preserved, ${MASTER_INTERVIEW_PROBLEM_ADDITIONS.length} questions.`);
  }catch(error){
    console.error('[Problem Catalog] Startup authoring import failed; server will continue and retry on next process start:',error instanceof Error?error.message:String(error));
  }
}
