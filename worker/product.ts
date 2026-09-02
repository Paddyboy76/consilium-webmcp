type ProductBindings={DB:D1Database};
const DEMO_AREAS=[
  ['vocation','Vocation','Build work that is useful, ethical, and economically durable.','#f97316'],
  ['health','Health','Protect energy, strength, and recovery as operating capacity.','#22c55e'],
  ['relationships','Relationships','Invest attention in the people who make life meaningful.','#a855f7'],
  ['learning','Learning','Turn study into tested judgment and reusable capability.','#06b6d4']
] as const;
const DEMO_MISSIONS=[
  ['pilot','vocation','project','Validate accessibility audit pilot','Prove demand before expanding the studio.','quarterly','active',62,'2026-10-15'],
  ['outreach','vocation','goal','Send three evidence-led pilot invitations','Direct conversations create better evidence than polishing.','weekly','active',33,'2026-09-06'],
  ['delivery','vocation','goal','Deliver the Acme accessibility findings','Keep the existing client promise before seeking novelty.','today','active',70,'2026-09-02'],
  ['strength','health','project','Rebuild durable strength and sleep','Energy is a constraint on every other mission.','quarterly','active',48,'2026-11-30'],
  ['walk','health','goal','Walk outside after lunch four times','A small recovery cue prevents the afternoon collapse.','weekly','active',50,'2026-09-06'],
  ['family','relationships','goal','Call Mum without multitasking','Attention is the outcome, not merely making the call.','weekly','active',0,'2026-09-06'],
  ['writing','learning','project','Publish the field-notes essay series','Writing forces tested learning into a useful form.','yearly','active',28,'2026-12-20'],
  ['essay','learning','goal','Draft the counterexample section','The argument needs disconfirming evidence, not another summary.','today','active',40,'2026-09-02']
] as const;

const clean=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):'';
const uuid=(prefix:string)=>`${prefix}-${crypto.randomUUID()}`;
const payload=(value:unknown)=>JSON.stringify(value);

export async function seedProduct(db:D1Database,session:string){
  const areaCount=await db.prepare('SELECT COUNT(*) count FROM life_areas WHERE session_id=?').bind(session).first<{count:number}>();
  if((areaCount?.count??0)>0)return;
  const areaRows=DEMO_AREAS.map(([slug,name,purpose,accent],position)=>db.prepare('INSERT INTO life_areas(id,session_id,name,purpose,accent,position,created_at) VALUES(?,?,?,?,?,?,?)').bind(`${session}-${slug}`,session,name,purpose,accent,position,'2026-06-01T08:00:00Z'));
  const missionRows=DEMO_MISSIONS.map(([slug,area,kind,title,why,horizon,status,progress,target])=>db.prepare('INSERT INTO missions(id,session_id,area_id,kind,title,why_text,horizon,status,progress,target_date,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(`${session}-${slug}`,session,`${session}-${area}`,kind,title,why,horizon,status,progress,target,'2026-06-01T08:00:00Z'));
  await db.batch([...areaRows,...missionRows]);
  await db.batch([
    db.prepare('INSERT INTO progress_logs VALUES(?,?,?,?,?,?,?)').bind(`${session}-log-pilot`,session,`${session}-pilot`,'partial',62,'Two discovery calls confirmed the reporting pain; one buyer would not pay without a sample.','2026-08-27T16:30:00Z'),
    db.prepare('INSERT INTO progress_logs VALUES(?,?,?,?,?,?,?)').bind(`${session}-log-delivery`,session,`${session}-delivery`,'progress',70,'Keyboard and contrast review complete; screen-reader findings still need evidence.','2026-09-01T15:20:00Z'),
    db.prepare('INSERT INTO progress_logs VALUES(?,?,?,?,?,?,?)').bind(`${session}-log-failure`,session,`${session}-outreach`,'failure',33,'Used the protected block to redesign the landing page; sent no invitation.','2026-08-31T10:10:00Z'),
    db.prepare('INSERT INTO progress_logs VALUES(?,?,?,?,?,?,?)').bind(`${session}-log-walk`,session,`${session}-walk`,'success',50,'Two lunch walks reduced the usual 15:00 energy dip.','2026-09-01T13:15:00Z'),
    db.prepare('INSERT INTO reflections VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(`${session}-reflection-seed`,session,`${session}-outreach`,'Completed the client audit evidence pass.','Avoided pilot outreach despite reserving the hour.','Opened the design file and refined presentation details instead of sending the prepared message.','The send created exposure to rejection; polishing felt productive and controllable.','Protected time is insufficient when the first action remains ambiguous or emotionally costly.','Open the contact list the night before and send one plain invitation before opening design tools.','Send one invitation at 09:00, then finish the client screen-reader findings.','2026-09-01T20:40:00Z')
  ]);
}

async function productState(db:D1Database,session:string){
  const [areas,missions,logs,reflections,briefs,calls]=await db.batch([
    db.prepare('SELECT * FROM life_areas WHERE session_id=? ORDER BY position').bind(session),
    db.prepare('SELECT * FROM missions WHERE session_id=? ORDER BY CASE horizon WHEN \'today\' THEN 0 WHEN \'weekly\' THEN 1 WHEN \'quarterly\' THEN 2 ELSE 3 END, created_at').bind(session),
    db.prepare('SELECT p.*,m.title mission_title,a.name area_name FROM progress_logs p JOIN missions m ON m.id=p.mission_id JOIN life_areas a ON a.id=m.area_id WHERE p.session_id=? ORDER BY occurred_at DESC LIMIT 30').bind(session),
    db.prepare('SELECT r.*,m.title mission_title,a.name area_name FROM reflections r LEFT JOIN missions m ON m.id=r.mission_id LEFT JOIN life_areas a ON a.id=m.area_id WHERE r.session_id=? ORDER BY occurred_at DESC LIMIT 20').bind(session),
    db.prepare('SELECT * FROM morning_briefs WHERE session_id=? ORDER BY generated_at DESC LIMIT 1').bind(session),
    db.prepare('SELECT * FROM webmcp_calls WHERE session_id=? ORDER BY created_at DESC LIMIT 1').bind(session)
  ]);
  return {areas:areas!.results,missions:missions!.results,progressLogs:logs!.results,reflections:reflections!.results,morningBrief:briefs!.results[0]??null,lastWebmcpCall:calls!.results[0]??null,synthetic:true};
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
    const input=await body(),missionId=clean(input.missionId,120),note=clean(input.note,800),progress=Number(input.progress),result=String(input.result);
    if(!missionId||note.length<3||!Number.isInteger(progress)||progress<0||progress>100||!['progress','success','partial','failure'].includes(result))return reply({error:'INVALID_PROGRESS'},400);
    const owned=await env.DB.prepare('SELECT id FROM missions WHERE id=? AND session_id=?').bind(missionId,session).first();if(!owned)return reply({error:'MISSION_NOT_FOUND'},404);
    const output={id:uuid('progress'),missionId,result,progress};await env.DB.batch([env.DB.prepare('INSERT INTO progress_logs VALUES(?,?,?,?,?,?,datetime(\'now\'))').bind(output.id,session,missionId,result,progress,note),env.DB.prepare('UPDATE missions SET progress=?,status=? WHERE id=? AND session_id=?').bind(progress,result==='success'&&progress===100?'completed':'active',missionId,session)]);await audit(env.DB,session,'log_progress',input,output);return reply(output,201);
  }
  if(url.pathname==='/api/reflections'&&request.method==='POST'){
    const input=await body(),fields=['achieved','failed','happened','why','lesson','adaptation','tomorrow'] as const,values=fields.map(key=>clean(input[key],1000));if(values.some(v=>v.length<3))return reply({error:'INCOMPLETE_REFLECTION'},400);
    const missionId=clean(input.missionId,120)||null;if(missionId&&!await env.DB.prepare('SELECT id FROM missions WHERE id=? AND session_id=?').bind(missionId,session).first())return reply({error:'MISSION_NOT_FOUND'},404);
    const output={id:uuid('reflection'),missionId,adaptation:values[5],tomorrow:values[6]};await env.DB.prepare('INSERT INTO reflections VALUES(?,?,?,?,?,?,?,?,?,?,datetime(\'now\'))').bind(output.id,session,missionId,...values).run();await audit(env.DB,session,'record_evening_reflection',input,output);return reply(output,201);
  }
  if(url.pathname==='/api/briefs/generate'&&request.method==='POST'){
    const failed=await env.DB.prepare("SELECT r.id,r.occurred_at,r.adaptation,r.tomorrow,r.failed,m.title mission_title FROM reflections r LEFT JOIN missions m ON m.id=r.mission_id WHERE r.session_id=? ORDER BY r.occurred_at DESC LIMIT 3").bind(session).all<{id:string;occurred_at:string;adaptation:string;tomorrow:string;failed:string;mission_title:string|null}>();
    const missions=await env.DB.prepare("SELECT id,title,why_text,progress,horizon FROM missions WHERE session_id=? AND status='active' ORDER BY CASE horizon WHEN 'today' THEN 0 WHEN 'weekly' THEN 1 ELSE 2 END, progress DESC LIMIT 4").bind(session).all<{id:string;title:string;why_text:string;progress:number;horizon:string}>();
    const reflection=failed.results[0],priorities=missions.results.slice(0,3).map((m,index)=>({rank:index+1,missionId:m.id,title:m.title,why:index===0&&reflection?`Last reflection changed the plan: ${reflection.tomorrow}`:`${m.why_text} Current progress: ${m.progress}%.`,evidenceIds:reflection&&index===0?[reflection.id]:[m.id]}));
    const output={id:uuid('brief'),generatedAt:new Date().toISOString(),headline:reflection?'Act on the adaptation before returning to comfortable work.':'Protect the smallest outcome that creates evidence.',priorities,evidence:failed.results.map(r=>({id:r.id,date:r.occurred_at,type:'reflection',excerpt:r.adaptation,counterevidence:r.failed})),mode:'deterministic-history-grounded'};
    await env.DB.prepare('INSERT INTO morning_briefs VALUES(?,?,?,?,?,?,?)').bind(output.id,session,output.generatedAt,output.headline,payload(priorities),payload(output.evidence),output.mode).run();await audit(env.DB,session,'generate_morning_brief',{},output);return reply(output,201);
  }
  if(url.pathname==='/api/council/appointments'&&request.method==='POST'){
    const input=await body(),ids=Array.isArray(input.advisorIds)?input.advisorIds.filter(x=>typeof x==='string').slice(0,3):[];if(!ids.length)return reply({error:'INVALID_APPOINTMENT'},400);
    const packs=await env.DB.prepare(`SELECT id,advisor_id FROM source_packs WHERE advisor_id IN (${ids.map(()=>'?').join(',')})`).bind(...ids).all<{id:string;advisor_id:string}>();if(packs.results.length!==ids.length)return reply({error:'ADVISOR_NOT_FOUND'},404);
    await env.DB.batch([env.DB.prepare("UPDATE council_appointments SET ended_at=datetime('now') WHERE user_id='demo-user' AND ended_at IS NULL"),...packs.results.map(row=>env.DB.prepare("INSERT INTO council_appointments(id,user_id,advisor_id,pack_id,appointed_at,provenance) VALUES(?,'demo-user',?,?,datetime('now'),'explicit demo appointment')").bind(uuid('appointment'),row.advisor_id,row.id))]);const output={appointed:ids};await audit(env.DB,session,'appoint_council',input,output);return reply(output);
  }
  return null;
}
