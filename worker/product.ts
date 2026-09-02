import { CAAR_KEYS, selectBriefPriority, validateReflection } from './reflection';
type ProductBindings={DB:D1Database};
export const CONSILIUM_DOMAINS=[
  ['PHY','Physical','Fuel, movement, and recovery for your body.','#ef6a3a'],
  ['MNT','Mental','Mental resilience, focus, and emotional regulation.','#d9a441'],
  ['SPR','Spiritual','Purpose, values, and inner alignment.','#a78bfa'],
  ['SOC','Social','Relationships, community, and social investment.','#ec7aa5'],
  ['FIN','Financial','Earning, saving, investing, and financial freedom.','#58a6ff'],
  ['VOC','Vocational','Career, craft, skills, and professional growth.','#f15023']
] as const;
const DEMO_MISSIONS=[
  ['physical-project','PHY','project','Build a resilient energy baseline','Consistent movement and recovery protect capacity for every other commitment.','quarterly','active',48,'2026-11-30'],
  ['physical-goal','PHY','goal','Take a recovery walk after lunch','A short outdoor reset tests whether movement restores afternoon attention.','today','active',50,'2026-09-03'],
  ['mental-project','MNT','project','Strengthen calm, deliberate focus','Attention regulation makes difficult work more sustainable.','quarterly','active',44,'2026-11-30'],
  ['mental-goal','MNT','goal','Complete one distraction-free focus block','A bounded session creates observable evidence about focus conditions.','today','active',60,'2026-09-03'],
  ['spiritual-project','SPR','project','Practice values-led weekly review','A regular review keeps choices aligned with stated values.','quarterly','active',35,'2026-11-30'],
  ['spiritual-goal','SPR','goal','Write the value behind today’s hardest choice','Naming the value turns vague intention into a testable decision guide.','today','active',25,'2026-09-03'],
  ['social-project','SOC','project','Invest in close relationships','Reliable, undivided attention strengthens the relationships that matter.','quarterly','active',52,'2026-11-30'],
  ['social-goal','SOC','goal','Call Mum without multitasking','Attention is the outcome, not merely making the call.','today','active',0,'2026-09-03'],
  ['financial-project','FIN','project','Create a durable monthly buffer','A visible buffer reduces fragility without relying on optimistic forecasts.','quarterly','active',40,'2026-11-30'],
  ['financial-goal','FIN','goal','Review recurring costs for one useful cut','One evidence-based adjustment is more useful than a vague austerity target.','today','active',30,'2026-09-03'],
  ['vocational-project','VOC','project','Validate accessibility audit pilot','Prove demand before expanding the studio.','quarterly','active',62,'2026-10-15'],
  ['vocational-goal','VOC','goal','Send one evidence-led pilot invitation','Direct conversation creates better evidence than polishing.','today','active',33,'2026-09-03']
] as const;

const LEGACY_MAPPINGS={health:'PHY',relationships:'SOC',vocation:'VOC'} as const;
const DOMAIN_BY_CODE=new Map(CONSILIUM_DOMAINS.map(domain=>[domain[0],domain]));

const clean=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):'';
const uuid=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`;
const payload=(value:unknown)=>JSON.stringify(value);

export async function seedProduct(db:D1Database,session:string){
  const existing=await db.prepare('SELECT id,name,code FROM life_areas WHERE session_id=? ORDER BY position').bind(session).all<{id:string;name:string;code:string|null}>();
  const byCode=new Map(existing.results.filter(area=>area.code).map(area=>[area.code!,area]));
  for(const area of existing.results){
    const legacyCode=LEGACY_MAPPINGS[area.id.slice(session.length+1) as keyof typeof LEGACY_MAPPINGS];
    if(!area.code&&legacyCode&&!byCode.has(legacyCode)){
      const canonical=DOMAIN_BY_CODE.get(legacyCode)!;
      await db.prepare('UPDATE life_areas SET code=?,name=?,purpose=?,accent=?,position=?,is_active=1,migration_json=? WHERE id=? AND session_id=?').bind(legacyCode,canonical[1],canonical[2],canonical[3],CONSILIUM_DOMAINS.findIndex(item=>item[0]===legacyCode),JSON.stringify({pass:4,from:area.name,to:canonical[1],reason:'semantically_defensible_legacy_mapping'}),area.id,session).run();
      byCode.set(legacyCode,{...area,code:legacyCode,name:canonical[1]});
    }
  }
  const legacyLearning=existing.results.find(area=>!area.code&&area.id===`${session}-learning`);
  if(legacyLearning){
    const vocational=byCode.get('VOC');
    if(vocational)await db.prepare('UPDATE missions SET area_id=? WHERE session_id=? AND area_id=?').bind(vocational.id,session,legacyLearning.id).run();
    await db.prepare('UPDATE life_areas SET is_active=0,migration_json=? WHERE id=? AND session_id=?').bind(JSON.stringify({pass:4,from:'Learning',to:'VOC',reason:'seeded writing and essay work is vocational; records retained and mission links preserved'}),legacyLearning.id,session).run();
  }
  for(const [position,domain] of CONSILIUM_DOMAINS.entries())if(!byCode.has(domain[0])){
    const [code,name,purpose,accent]=domain,id=`${session}-${code}`;
    await db.prepare('INSERT OR IGNORE INTO life_areas(id,session_id,name,purpose,accent,position,created_at,code,is_active,migration_json) VALUES(?,?,?,?,?,?,?, ?,1,?)').bind(id,session,name,purpose,accent,position,'2026-06-01T08:00:00Z',code,JSON.stringify({pass:4,origin:'canonical_consilium_domain'})).run();
    byCode.set(code,{id,name,code});
  }
  const missionRows=DEMO_MISSIONS.map(([slug,code,kind,title,why,horizon,status,progress,target])=>db.prepare('INSERT OR IGNORE INTO missions(id,session_id,area_id,kind,title,why_text,horizon,status,progress,target_date,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(`${session}-${slug}`,session,byCode.get(code)!.id,kind,title,why,horizon,status,progress,target,'2026-06-01T08:00:00Z'));
  await db.batch(missionRows);
  const signals=[
    ['PHY','success',50,'The lunch walk restored enough energy to finish the afternoon review.'],['MNT','progress',60,'A notification-free block produced forty focused minutes.'],['SPR','partial',25,'The value was named, but only after the decision had already been made.'],['SOC','failure',0,'The call was postponed when work expanded into the evening.'],['FIN','progress',30,'Two unused subscriptions were identified; cancellation is still pending.'],['VOC','failure',33,'The protected block went to polishing instead of sending the invitation.']
  ] as const;
  await db.batch(signals.flatMap(([code,result,progress,note],index)=>{
    const slug=DOMAIN_BY_CODE.get(code)![1].toLowerCase(),goal=`${session}-${slug}-goal`,reflection=`${session}-${slug}-reflection`,at=`2026-09-0${index<3?1:2}T${12+index}:10:00Z`;
    return [
      db.prepare('INSERT OR IGNORE INTO progress_logs VALUES(?,?,?,?,?,?,?)').bind(`${session}-${slug}-progress`,session,goal,result,progress,note,at),
      db.prepare('INSERT OR IGNORE INTO reflections VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(reflection,session,goal,`Made observable progress in ${slug} practice.`,result==='failure'?'The intended action did not happen.':'The full intended outcome was not yet complete.',note,result==='failure'?'Avoidance or competing work displaced the explicit cue.':'The first step worked, but the completion cue needs to be clearer.','Small actions produced more useful evidence than general intention.',`Put the smallest ${slug} action on the calendar with a visible trigger.`,`Run the adjusted ${slug} action before adding scope.`,at)
    ];
  }));
}

async function productState(db:D1Database,session:string){
  const [areas,missions,logs,journals,reflections,structuredReflections,goalReflections,facts,directives,briefs,calls]=await db.batch([
    db.prepare('SELECT * FROM life_areas WHERE session_id=? AND is_active=1 ORDER BY position').bind(session),
    db.prepare('SELECT * FROM missions WHERE session_id=? ORDER BY CASE horizon WHEN \'today\' THEN 0 WHEN \'weekly\' THEN 1 WHEN \'quarterly\' THEN 2 ELSE 3 END, created_at').bind(session),
    db.prepare('SELECT p.*,m.title mission_title,a.name area_name FROM progress_logs p JOIN missions m ON m.id=p.mission_id JOIN life_areas a ON a.id=m.area_id WHERE p.session_id=? ORDER BY occurred_at DESC LIMIT 30').bind(session),
    db.prepare('SELECT j.*,m.title mission_title,a.name area_name,a.code area_code FROM journal_entries j JOIN life_areas a ON a.id=j.area_id LEFT JOIN missions m ON m.id=j.mission_id WHERE j.session_id=? ORDER BY occurred_at DESC LIMIT 30').bind(session),
    db.prepare('SELECT r.*,m.title mission_title,a.name area_name FROM reflections r LEFT JOIN missions m ON m.id=r.mission_id LEFT JOIN life_areas a ON a.id=m.area_id WHERE r.session_id=? ORDER BY occurred_at DESC LIMIT 20').bind(session),
    db.prepare('SELECT * FROM nightly_reflections WHERE session_id=? ORDER BY accepted_at DESC LIMIT 20').bind(session),
    db.prepare('SELECT g.*,m.title goal_title,a.name area_name FROM goal_reflections g JOIN missions m ON m.id=g.goal_id JOIN life_areas a ON a.id=g.area_id WHERE g.session_id=? ORDER BY g.created_at DESC LIMIT 60').bind(session),
    db.prepare('SELECT * FROM reflection_facts WHERE session_id=? ORDER BY created_at DESC LIMIT 120').bind(session),
    db.prepare('SELECT * FROM tomorrow_directives WHERE session_id=? ORDER BY created_at DESC LIMIT 20').bind(session),
    db.prepare('SELECT * FROM morning_briefs WHERE session_id=? ORDER BY generated_at DESC LIMIT 1').bind(session),
    db.prepare('SELECT * FROM webmcp_calls WHERE session_id=? ORDER BY created_at DESC LIMIT 20').bind(session)
  ]);
  return {areas:areas!.results,missions:missions!.results,progressLogs:logs!.results,journalEntries:journals!.results,reflections:reflections!.results,nightlyReflections:structuredReflections!.results,goalReflections:goalReflections!.results,reflectionFacts:facts!.results,tomorrowDirectives:directives!.results,morningBrief:briefs!.results[0]??null,webmcpCalls:calls!.results,lastWebmcpCall:calls!.results[0]??null,synthetic:true};
}

async function audit(db:D1Database,session:string,tool:string,input:unknown,result:unknown){
  await db.prepare('INSERT INTO webmcp_calls VALUES(?,?,?,?,?,datetime(\'now\'))').bind(uuid('toolcall'),session,tool,payload(input),payload(result)).run();
}

export async function handleProduct(request:Request,env:ProductBindings,session:string,body:()=>Promise<Record<string,unknown>>):Promise<Response|null>{
  const url=new URL(request.url), reply=(data:unknown,status=200)=>new Response(payload(data),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
  await seedProduct(env.DB,session);
  if(url.pathname==='/api/product'&&request.method==='GET')return reply(await productState(env.DB,session));
  if(url.pathname==='/api/missions'&&request.method==='POST'){
    const input=await body(),title=clean(input.title,140),why=clean(input.why,500),areaId=clean(input.areaId,120),kind=input.kind==='project'?'project':'goal',horizon=['today','weekly','quarterly','yearly'].includes(String(input.horizon))?String(input.horizon):'weekly';
    if(title.length<3||why.length<3||!areaId)return reply({error:'INVALID_MISSION'},400);
    const owned=await env.DB.prepare('SELECT id FROM life_areas WHERE id=? AND session_id=?').bind(areaId,session).first();if(!owned)return reply({error:'AREA_NOT_FOUND'},404);
    const result={id:uuid(kind),title,kind,horizon,status:'active'};await env.DB.prepare('INSERT INTO missions(id,session_id,area_id,kind,title,why_text,horizon,status,progress,target_date,created_at) VALUES(?,?,?,?,?,?,?,\'active\',0,?,datetime(\'now\'))').bind(result.id,session,areaId,kind,title,why,horizon,clean(input.targetDate,10)||null).run();await audit(env.DB,session,'create_mission',input,result);return reply(result,201);
  }
  if(url.pathname==='/api/progress'&&request.method==='POST'){
    const input=await body(),missionId=clean(input.missionId,120),note=clean(input.note,800),progress=Number(input.progress),result=String(input.result),statusAfter=typeof input.statusAfter==='string'?input.statusAfter:((result==='success'&&progress===100)?'completed':'active');
    if(!missionId||note.length<3||!Number.isInteger(progress)||progress<0||progress>100||!['progress','success','partial','failure'].includes(result)||!['active','paused','completed'].includes(statusAfter))return reply({error:'INVALID_PROGRESS'},400);
    const owned=await env.DB.prepare('SELECT id FROM missions WHERE id=? AND session_id=?').bind(missionId,session).first();if(!owned)return reply({error:'MISSION_NOT_FOUND'},404);
    const output={id:uuid('progress'),missionId,result,progress,statusAfter};await env.DB.batch([env.DB.prepare('INSERT INTO progress_logs VALUES(?,?,?,?,?,?,datetime(\'now\'))').bind(output.id,session,missionId,result,progress,note),env.DB.prepare('UPDATE missions SET progress=?,status=? WHERE id=? AND session_id=?').bind(progress,statusAfter,missionId,session)]);await audit(env.DB,session,'log_progress',input,output);return reply(output,201);
  }
  if(url.pathname==='/api/journal'&&request.method==='POST'){
    const input=await body(),bodyText=clean(input.body,4000),areaId=clean(input.areaId,120),missionId=clean(input.missionId,120)||null,mood=String(input.mood);
    if(bodyText.length<20||!areaId||!['energized','steady','strained','reflective'].includes(mood))return reply({error:'INVALID_JOURNAL_ENTRY'},400);
    const area=await env.DB.prepare('SELECT id FROM life_areas WHERE id=? AND session_id=? AND is_active=1').bind(areaId,session).first();if(!area)return reply({error:'AREA_NOT_FOUND'},404);
    if(missionId){const mission=await env.DB.prepare('SELECT id FROM missions WHERE id=? AND area_id=? AND session_id=?').bind(missionId,areaId,session).first();if(!mission)return reply({error:'MISSION_NOT_FOUND'},404)}
    const output={id:uuid('journal'),areaId,missionId,mood,occurredAt:new Date().toISOString()};await env.DB.prepare('INSERT INTO journal_entries VALUES(?,?,?,?,?,?,?)').bind(output.id,session,areaId,missionId,bodyText,mood,output.occurredAt).run();await audit(env.DB,session,'record_journal_entry',input,output);return reply(output,201);
  }
  if(url.pathname==='/api/reflections'&&request.method==='POST'){
    const input=await body(),validated=validateReflection(input);if(!validated.ok)return reply({error:'INVALID_REFLECTION',fieldErrors:validated.fieldErrors},400);
    const value=validated.value,today=await env.DB.prepare("SELECT m.id,m.area_id FROM missions m WHERE m.session_id=? AND m.kind='goal' AND m.horizon='today' AND m.status='active' ORDER BY m.created_at").bind(session).all<{id:string;area_id:string}>(),todayById=new Map(today.results.map(goal=>[goal.id,goal]));
    const submitted=new Set(value.goal_reflections.map(goal=>goal.goal_id));for(const goal of value.goal_reflections)if(!todayById.has(goal.goal_id))return reply({error:'INVALID_REFLECTION',fieldErrors:{goal_reflections:`Goal ${goal.goal_id} is not an active Today goal owned by this session.`}},400);
    const missing=today.results.filter(goal=>!submitted.has(goal.id));if(missing.length)return reply({error:'INVALID_REFLECTION',fieldErrors:{goal_reflections:`Every active Today goal must be reviewed. Missing: ${missing.map(goal=>goal.id).join(', ')}`}},400);
    const sources=await env.DB.prepare("SELECT sc.id,sc.advisor_id,sp.title,sc.locator,sc.canonical_text excerpt FROM council_appointments ca JOIN source_chunks sc ON sc.pack_id=ca.pack_id JOIN source_packs sp ON sp.id=sc.pack_id WHERE ca.user_id='demo-user' AND ca.ended_at IS NULL AND sc.ordinal=0 ORDER BY ca.appointed_at,sc.advisor_id LIMIT 3").all<{id:string;advisor_id:string;title:string;locator:string;excerpt:string}>();
    const id=uuid('reflection'),now=new Date().toISOString(),missed=value.goal_reflections.filter(goal=>goal.status==='missed'),factValues=CAAR_KEYS.map((key,index)=>({id:uuid('fact'),type:['progress','friction','energy','success','misalignment','mission'][index],text:value.caar[key],key})),directives=[{id:uuid('directive'),directive:value.caar.q6_if_then_plan,rationale:missed[0]?.adaptation||'Selected from the explicit number-one mission and If-Then plan.',goalId:missed[0]?.goal_id??today.results[0]?.id??null}];
    const synthesis={summary:missed.length?`${missed.length} Today goal${missed.length===1?' was':'s were'} missed; tomorrow begins with the recorded Version-2 adaptation.`:'Reviewed goals show no reported miss; preserve the conditions associated with focused work.',directives:directives.map(item=>item.directive),evidence_ids:[id,...value.goal_reflections.map(goal=>goal.goal_id)],source_citations:sources.results,uncertainty:'This synthesis reflects self-report and stored goal state; source passages are interpretive lenses, not proof of personal causality.'};
    await env.DB.batch([
      env.DB.prepare('INSERT INTO nightly_reflections VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,session,value.journal,value.biometrics.sleep_hours,value.biometrics.energy_level,value.biometrics.stress_level,value.biometrics.resting_hr,JSON.stringify(value.caar),JSON.stringify(synthesis),now),
      ...value.goal_reflections.map(goal=>{const canonical=todayById.get(goal.goal_id)!;return env.DB.prepare('INSERT INTO goal_reflections VALUES(?,?,?,?,?,?,?,?,?)').bind(uuid('goal-reflection'),id,session,goal.goal_id,canonical.area_id,goal.status,goal.why_failed??null,goal.adaptation??null,now)}),
      ...factValues.map(fact=>env.DB.prepare('INSERT INTO reflection_facts VALUES(?,?,?,?,?,?,?,?,?)').bind(fact.id,id,session,today.results[0]!.id,today.results[0]!.area_id,fact.type,fact.text,fact.key,now)),
      ...missed.map(goal=>{const canonical=todayById.get(goal.goal_id)!;return env.DB.prepare('INSERT INTO reflection_facts VALUES(?,?,?,?,?,?,?,?,?)').bind(uuid('fact'),id,session,goal.goal_id,canonical.area_id,'adaptation',goal.adaptation,'goal_reflections.adaptation',now)}),
      ...directives.map(item=>{const areaId=item.goalId?todayById.get(item.goalId)?.area_id??null:null;return env.DB.prepare('INSERT INTO tomorrow_directives VALUES(?,?,?,?,?,?,?,?,?)').bind(item.id,id,session,item.goalId,areaId,item.directive,item.rationale,JSON.stringify([id,...(item.goalId?[item.goalId]:[])]),now)})
    ]);
    const output={id,accepted:true,synthesis,tomorrow_directives:directives.map(item=>({...item,evidence_ids:[id,...(item.goalId?[item.goalId]:[])]})),records:{goal_reflections:value.goal_reflections.length,facts:factValues.length+missed.length,directives:directives.length}};await audit(env.DB,session,'record_evening_reflection',input,output);return reply(output,201);
  }
  if(url.pathname==='/api/briefs/generate'&&request.method==='POST'){
    const latest=await env.DB.prepare('SELECT * FROM nightly_reflections WHERE session_id=? ORDER BY accepted_at DESC LIMIT 1').bind(session).first<{id:string;journal:string;sleep_hours:number;energy_level:number;stress_level:number;resting_hr:number|null;caar_json:string;accepted_at:string}>();
    const missions=await env.DB.prepare("SELECT id,title,why_text,progress,horizon FROM missions WHERE session_id=? AND status='active' ORDER BY created_at").bind(session).all<{id:string;title:string;why_text:string;progress:number;horizon:string}>(),outcomes=latest?await env.DB.prepare('SELECT id,goal_id,status,why_failed,adaptation FROM goal_reflections WHERE reflection_id=? ORDER BY id').bind(latest.id).all<{id:string;goal_id:string;status:string;why_failed:string|null;adaptation:string|null}>():{results:[]},logs=await env.DB.prepare('SELECT id,mission_id,result,note,occurred_at FROM progress_logs WHERE session_id=? ORDER BY occurred_at DESC LIMIT 8').bind(session).all<{id:string;mission_id:string;result:string;note:string;occurred_at:string}>(),previous=await env.DB.prepare("SELECT r.id,r.text FROM recommendations r JOIN consultations c ON c.id=r.consultation_id WHERE c.session_id=? ORDER BY r.created_at DESC LIMIT 2").bind(session).all<{id:string;text:string}>();
    const ordered=selectBriefPriority(missions.results,outcomes.results),missed=outcomes.results.filter(item=>item.status==='missed'),readiness=latest&&((latest.sleep_hours<6)||(latest.energy_level<=4)||(latest.stress_level>=8))?`Readiness caution: ${latest.sleep_hours}h sleep, energy ${latest.energy_level}/10, stress ${latest.stress_level}/10${latest.resting_hr?`, resting HR ${latest.resting_hr}`:''}. Reduce scope; this is a caution, not a diagnosis.`:'No strong readiness caution from the latest self-report.';
    const priorities=ordered.slice(0,3).map((mission,index)=>{const outcome=outcomes.results.find(item=>item.goal_id===mission.id),log=logs.results.find(item=>item.mission_id===mission.id),adaptation=outcome?.status==='missed'?outcome.adaptation:null,evidenceIds=[...(latest?[latest.id]:[]),mission.id,...(outcome?[outcome.id]:[]),...(log?[log.id]:[])];return {rank:index+1,missionId:mission.id,title:mission.title,why:adaptation?`This goal was missed; test the recorded adaptation: ${adaptation}`:log?`Recent ${log.result} evidence makes this active mission relevant: ${log.note}`:`Active ${mission.horizon} goal at ${mission.progress}% progress; selected without claiming a cause.`,evidenceIds,uncertainty:adaptation?'The adaptation is a self-reported hypothesis and still needs an outcome.':'Selection is based on active state and available progress evidence.'}});
    const pattern={claim:missed.length?`A current counterpattern is visible: ${missed.length} reviewed goal${missed.length===1?' was':'s were'} missed.`:'The latest review reports no missed Today goal.',supporting_ids:missed.map(item=>item.id),counterevidence_ids:outcomes.results.filter(item=>item.status==='achieved').map(item=>item.id),uncertainty:'One nightly reflection is insufficient to establish a recurring causal pattern.'},evidence=[...(latest?[{id:latest.id,date:latest.accepted_at,type:'nightly_reflection',excerpt:latest.journal,counterevidence:pattern.counterevidence_ids.join(', ')||'No achieved-goal counterevidence in this reflection.'}]:[]),...logs.results.slice(0,4).map(log=>({id:log.id,date:log.occurred_at,type:'progress',excerpt:log.note,counterevidence:log.result==='failure'?'Failure evidence':'Potential counterevidence'})),...previous.results.map(item=>({id:item.id,type:'earlier_recommendation',excerpt:item.text,counterevidence:'Outcome not asserted unless linked canonical evidence exists.'}))];
    const id=uuid('brief'),recommendationId=uuid('recommendation'),generatedAt=new Date().toISOString(),headline=priorities[0]?`Start with ${priorities[0].title}.`:'No active goal can be selected.',analysis={reflection_id:latest?.id??null,goal_performance:outcomes.results,pattern,readiness,priorities,earlier_recommendation_ids:previous.results.map(item=>item.id),advisor_citations:[],uncertainty:'Deterministic evidence-grounded fallback; no model-generated causal claims.'},output={id,generatedAt,headline,priorities,evidence,analysis,mode:'deterministic-canonical-fallback',recommendationId};
    await env.DB.batch([env.DB.prepare("INSERT INTO recommendations(id,user_id,consultation_id,text,producer,pipeline_hash,created_at) VALUES(?,'demo-user',NULL,?,'morning-brief',NULL,?)").bind(recommendationId,headline,generatedAt),env.DB.prepare('INSERT INTO morning_briefs(id,session_id,generated_at,headline,priorities_json,evidence_json,mode,analysis_json,recommendation_id) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,session,generatedAt,headline,payload(priorities),payload(evidence),output.mode,payload(analysis),recommendationId)]);await audit(env.DB,session,'generate_morning_brief',{},output);return reply(output,201);
  }
  if(url.pathname==='/api/council/appointments'&&request.method==='POST'){
    const input=await body(),ids=Array.isArray(input.advisorIds)?input.advisorIds.filter(x=>typeof x==='string').slice(0,3):[];if(!ids.length)return reply({error:'INVALID_APPOINTMENT'},400);
    const packs=await env.DB.prepare(`SELECT id,advisor_id FROM source_packs WHERE advisor_id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all<{id:string;advisor_id:string}>();if(packs.results.length!==ids.length)return reply({error:'ADVISOR_NOT_FOUND'},404);
    await env.DB.batch([env.DB.prepare("UPDATE council_appointments SET ended_at=datetime('now') WHERE user_id='demo-user' AND ended_at IS NULL"),...packs.results.map(row=>env.DB.prepare("INSERT INTO council_appointments(id,user_id,advisor_id,pack_id,appointed_at,provenance) VALUES(?,'demo-user',?,?,datetime('now'),'explicit demo appointment')").bind(uuid('appointment'),row.advisor_id,row.id))]);const output={appointed:ids};await audit(env.DB,session,'appoint_council',input,output);return reply(output);
  }
  return null;
}
