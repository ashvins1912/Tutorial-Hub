import { InterviewProblem } from '../models/InterviewProblem';

export type ProblemInput = {
  title: string; topicId: string; topic: string; difficulty?: 'Easy'|'Medium'|'Hard';
  slug?: string; aliases?: string[]; statement?: string;
  examples?: Array<{input:string;output:string;explanation?:string}>;
  constraints?: string[]; stages?: Record<string, unknown>;
  contentStatus?: 'needs-authoring'|'in-progress'|'validated';
  source?: {kind:string;reference?:string};
};
export type MatchCandidate = { slug:string; title:string; topicId:string; confidence:number; method:string };

export function normalizeProblemTitle(value: string): string {
  return value.normalize('NFKD').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\\s+/g, ' ');
}
function tokens(value:string): Set<string> { return new Set(normalizeProblemTitle(value).split(' ').filter(Boolean)); }
function tokenJaccard(a:string,b:string):number {
  const x=tokens(a), y=tokens(b); if(!x.size&&!y.size)return 1;
  const intersection=[...x].filter(v=>y.has(v)).length;
  return intersection/(x.size+y.size-intersection||1);
}
function ngramDice(a:string,b:string,n=3):number {
  const grams=(s:string)=>{const v=normalizeProblemTitle(s).replace(/ /g,'_'); const out=new Set<string>(); if(v.length<n)return new Set([v]); for(let i=0;i<=v.length-n;i++)out.add(v.slice(i,i+n)); return out;};
  const x=grams(a),y=grams(b); const overlap=[...x].filter(v=>y.has(v)).length;
  return 2*overlap/(x.size+y.size||1);
}
function editSimilarity(a:string,b:string):number {
  const x=normalizeProblemTitle(a),y=normalizeProblemTitle(b); if(x===y)return 1;
  const prev=Array.from({length:y.length+1},(_,i)=>i);
  for(let i=1;i<=x.length;i++){let diagonal=prev[0];prev[0]=i;for(let j=1;j<=y.length;j++){const above=prev[j];prev[j]=Math.min(prev[j]+1,prev[j-1]+1,diagonal+(x[i-1]===y[j-1]?0:1));diagonal=above;}}
  return 1-prev[y.length]/Math.max(x.length,y.length,1);
}
function scoreCandidate(input:ProblemInput, candidate:{title:string;topicId:string;aliases?:string[];slug:string}):MatchCandidate {
  const a=normalizeProblemTitle(input.title), b=normalizeProblemTitle(candidate.title);
  if(a===b)return {slug:candidate.slug,title:candidate.title,topicId:candidate.topicId,confidence:1,method:'normalized-exact'};
  if(candidate.topicId===input.topicId && (candidate.aliases??[]).some(alias=>normalizeProblemTitle(alias)===a))
    return {slug:candidate.slug,title:candidate.title,topicId:candidate.topicId,confidence:.985,method:'explicit-alias'};
  const topic=input.topicId===candidate.topicId?1:0;
  const confidence=.38*tokenJaccard(input.title,candidate.title)+.34*ngramDice(input.title,candidate.title)+.18*editSimilarity(input.title,candidate.title)+.10*topic;
  return {slug:candidate.slug,title:candidate.title,topicId:candidate.topicId,confidence:Number(confidence.toFixed(4)),method:'hybrid-token-ngram-edit-topic'};
}

export async function resolveAndUpsertProblem(input:ProblemInput) {
  const normalizedTitle=normalizeProblemTitle(input.title);
  const all=await InterviewProblem.find({}, {slug:1,title:1,topicId:1,aliases:1}).lean();
  const ranked=all.map(p=>scoreCandidate(input,p as any)).sort((a,b)=>b.confidence-a.confidence);
  const best=ranked[0];
  // Exact/explicit alias always wins. Fuzzy auto-update requires very high confidence,
  // same topic, and a clear margin over the runner-up.
  const second=ranked[1]?.confidence ?? 0;
  const safeFuzzy=best && best.topicId===input.topicId && best.confidence>=.96 && best.confidence-second>=.08;
  const shouldUpdate=!!best && (best.confidence===1 || best.method==='explicit-alias' || safeFuzzy);
  if(best && !shouldUpdate && best.confidence>=.82) {
    return {action:'review' as const,confidence:best.confidence,candidates:ranked.slice(0,5),message:'Potential duplicate; no record was changed. Confirm the match or submit as a distinct problem.'};
  }
  if(shouldUpdate) {
    const update:any={...input,normalizedTitle,catalogStatus:input.contentStatus==='validated'?'authored':'inventory',matchReview:{status:'clear',confidence:best.confidence,matchedSlug:best.slug,reason:best.method}};
    delete update.slug;
    const updated=await InterviewProblem.findOneAndUpdate({slug:best.slug},{$set:update,$addToSet:{aliases:{$each:input.aliases??[]}}},{new:true,runValidators:true});
    return {action:'updated' as const,confidence:best.confidence,problem:updated};
  }
  const slug=input.slug || `${input.topicId}-${normalizedTitle.replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
  const created=await InterviewProblem.findOneAndUpdate(
    {topicId:input.topicId,normalizedTitle},
    {$setOnInsert:{...input,slug,normalizedTitle,catalogStatus:'inventory',contentStatus:input.contentStatus??'needs-authoring',source:input.source??{kind:'problem-authoring-api'}}},
    {upsert:true,new:true,runValidators:true,setDefaultsOnInsert:true}
  );
  return {action:'created' as const,confidence:1,problem:created};
}
