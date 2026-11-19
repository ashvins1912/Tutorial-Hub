import express, { Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { InterviewProblem } from '../models/InterviewProblem';
import { resolveAndUpsertProblem } from '../services/problemResolutionService';
import type { ProblemInput } from '../services/problemResolutionService';
import { isMongoConnected } from '../db/connectMongo';

const router=express.Router();
function requireCatalogAdmin(req:Request,res:Response,next:express.NextFunction){
  const expected=process.env.PROBLEM_CATALOG_ADMIN_TOKEN?.trim();
  if(!expected)return res.status(503).json({error:'Problem catalog writes are disabled. Configure PROBLEM_CATALOG_ADMIN_TOKEN.'});
  const supplied=req.header('x-problem-catalog-token');
  const matches=!!supplied && Buffer.byteLength(supplied)===Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(supplied),Buffer.from(expected));
  if(!matches)return res.status(401).json({error:'Unauthorized problem catalog write.'});
  next();
}
function validInput(body:any): body is ProblemInput {
  return !!body && typeof body.title==='string' && body.title.trim().length>0 &&
    typeof body.topicId==='string' && body.topicId.trim().length>0 &&
    typeof body.topic==='string' && body.topic.trim().length>0;
}
function hasCompleteLesson(body:any):boolean {
  const stages=body?.stages??{};
  const implementation=stages.implement??{};
  const checks=body?.authoringMetadata?.qualityChecks??{};
  const authoringStatus=body?.authoringMetadata?.status;
  const requiredChecks=['statement','examples','constraints','java','javascript','python','tests','animation','complexity'];
  const sourceReference=body?.source?.reference;
  return typeof body?.statement==='string' && body.statement.trim().length>40 &&
    Array.isArray(body.examples) && body.examples.length>0 &&
    Array.isArray(body.constraints) && body.constraints.length>0 &&
    typeof sourceReference==='string' && sourceReference.startsWith('https://leetcode.com/problems/') &&
    ['java','javascript','python'].every((language:string)=>typeof implementation[language]==='string' && implementation[language].trim().length>40) &&
    implementation.languageStatus==='verified-submissions' &&
    Array.isArray(stages.practice?.testCases) && stages.practice.testCases.length>0 &&
    Array.isArray(stages.visualize?.animationSteps) && stages.visualize.animationSteps.length>=4 &&
    typeof stages.master?.proof==='string' && !!stages.master.timeComplexity && !!stages.master.spaceComplexity &&
    authoringStatus==='validated' && requiredChecks.every((key:string)=>checks[key]===true);
}

// GET /api/interview-problems?topicId=&q=&contentStatus=&page=&limit=
router.get('/',async(req:Request,res:Response)=>{
  if(!isMongoConnected())return res.status(503).json({error:'MongoDB is required for the interview problem catalog.'});
  const page=Math.max(1,Number(req.query.page)||1),limit=Math.min(100,Math.max(1,Number(req.query.limit)||30));
  const filter:any={};
  if(req.query.topicId)filter.topicId=String(req.query.topicId);
  if(req.query.contentStatus)filter.contentStatus=String(req.query.contentStatus);
  if(req.query.q){
    const query=String(req.query.q).slice(0,100);
    filter.$or=[{title:{$regex:query,$options:'i'}},{statement:{$regex:query,$options:'i'}}];
  }
  const [problems,total]=await Promise.all([
    InterviewProblem.find(filter).sort({topic:1,title:1}).skip((page-1)*limit).limit(limit).lean(),
    InterviewProblem.countDocuments(filter)
  ]);
  res.json({problems,total,page,limit,pages:Math.ceil(total/limit)});
});

// GET /api/interview-problems/:slug
router.get('/:slug',async(req:Request,res:Response)=>{
  if(!isMongoConnected())return res.status(503).json({error:'MongoDB is required for the interview problem catalog.'});
  const problem=await InterviewProblem.findOne({slug:req.params.slug}).lean();
  if(!problem)return res.status(404).json({error:'Problem not found'});
  res.json({problem});
});

// POST /api/interview-problems/upsert — idempotent create/update with conservative hybrid matching.
router.post('/upsert',requireCatalogAdmin,async(req:Request,res:Response)=>{
  if(!isMongoConnected())return res.status(503).json({error:'MongoDB is required for catalog writes.'});
  if(!validInput(req.body))return res.status(400).json({error:'title, topicId and topic are required.'});
  if(req.body.contentStatus==='validated' && !hasCompleteLesson(req.body))return res.status(400).json({error:'A problem cannot be validated until its statement, examples, constraints and all five learning stages are supplied.'});
  const result=await resolveAndUpsertProblem(req.body);
  if(result.action==='review')return res.status(409).json(result);
  res.status(result.action==='created'?201:200).json(result);
});

// PATCH /api/interview-problems/:slug — enrich a known record without changing its identity.
router.patch('/:slug',requireCatalogAdmin,async(req:Request,res:Response)=>{
  if(!isMongoConnected())return res.status(503).json({error:'MongoDB is required for catalog writes.'});
  const allowed=['statement','examples','constraints','stages','difficulty','contentStatus','aliases','relatedTitles','source','authoringMetadata'];
  const update:any={};
  for(const key of allowed)if(req.body?.[key]!==undefined)update[key]=req.body[key];
  if(!Object.keys(update).length)return res.status(400).json({error:'No editable problem fields supplied.'});
  const current=await InterviewProblem.findOne({slug:req.params.slug});
  if(!current)return res.status(404).json({error:'Problem not found'});
  if(update.contentStatus==='validated') {
    const merged={
      statement:update.statement??current.statement,
      examples:update.examples??current.examples,
      constraints:update.constraints??current.constraints,
      stages:update.stages??current.stages,
      source:update.source??current.source,
      authoringMetadata:update.authoringMetadata??current.authoringMetadata
    };
    if(!hasCompleteLesson(merged))
      return res.status(400).json({error:'Validation requires an official LeetCode source, statement, examples, constraints, three problem-specific language submissions, executable test evidence, at least four animation steps, a correctness proof, complexity analysis, and all quality checks.'});
  }
  if(update.contentStatus)update.catalogStatus=update.contentStatus==='validated'?'authored':'inventory';
  const problem=await InterviewProblem.findOneAndUpdate({slug:req.params.slug},{$set:update},{new:true,runValidators:true});
  res.json({problem});
});

export default router;
