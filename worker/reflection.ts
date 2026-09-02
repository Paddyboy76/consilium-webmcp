export const CAAR_KEYS=['q1_today_intent','q2_top_win','q3_top_failure','q4_pattern_notice','q5_tomorrow_priority','q6_if_then_plan'] as const;
export type CaarKey=typeof CAAR_KEYS[number];
export type GoalReflectionInput={goal_id:string;status:'achieved'|'missed'|'not_reviewed';why_failed?:string;adaptation?:string};
export type ReflectionInput={journal:string;biometrics:{sleep_hours:number;energy_level:number;stress_level:number;resting_hr?:number|null};caar:Record<CaarKey,string>;goal_reflections:GoalReflectionInput[]};

const meaningful=(value:unknown,min:number,max=2000)=>typeof value==='string'&&value.trim().length>=min&&value.trim().length<=max;
export function validateReflection(value:Record<string,unknown>):{ok:true;value:ReflectionInput}|{ok:false;fieldErrors:Record<string,string>} {
  const errors:Record<string,string>={},journal=value.journal,biometrics=value.biometrics,caar=value.caar,goals=value.goal_reflections;
  if(!meaningful(journal,40,4000))errors.journal='Daily anchor journal must contain at least 40 meaningful characters.';
  if(!biometrics||typeof biometrics!=='object'||Array.isArray(biometrics))errors.biometrics='Biometrics are required.';
  const bio=(biometrics??{}) as Record<string,unknown>,sleep=Number(bio.sleep_hours),energy=Number(bio.energy_level),stress=Number(bio.stress_level),hr=bio.resting_hr==null||bio.resting_hr===''?null:Number(bio.resting_hr);
  if(!Number.isFinite(sleep)||sleep<0||sleep>24)errors['biometrics.sleep_hours']='Sleep hours must be between 0 and 24.';
  if(!Number.isInteger(energy)||energy<1||energy>10)errors['biometrics.energy_level']='Energy must be an integer from 1 to 10.';
  if(!Number.isInteger(stress)||stress<1||stress>10)errors['biometrics.stress_level']='Stress must be an integer from 1 to 10.';
  if(hr!==null&&(!Number.isInteger(hr)||hr<30||hr>200))errors['biometrics.resting_hr']='Resting heart rate must be blank or an integer from 30 to 200.';
  if(!caar||typeof caar!=='object'||Array.isArray(caar))errors.caar='All six CAAR answers are required.';
  const answers=(caar??{}) as Record<string,unknown>;
  for(const key of CAAR_KEYS)if(!meaningful(answers[key],15,2000))errors[`caar.${key}`]='Answer must contain at least 15 meaningful characters.';
  if(!Array.isArray(goals)||goals.length<1)errors.goal_reflections='At least one active Today goal must be explicitly reviewed.';
  const seen=new Set<string>();
  if(Array.isArray(goals))goals.forEach((raw,index)=>{
    if(!raw||typeof raw!=='object'||Array.isArray(raw)){errors[`goal_reflections.${index}`]='Goal reflection must be an object.';return}
    const goal=raw as Record<string,unknown>,id=typeof goal.goal_id==='string'?goal.goal_id.trim():'',status=goal.status;
    if(!id)errors[`goal_reflections.${index}.goal_id`]='A canonical goal ID is required.';
    else if(seen.has(id))errors[`goal_reflections.${index}.goal_id`]='Each goal may be reviewed only once.';else seen.add(id);
    if(!['achieved','missed','not_reviewed'].includes(String(status)))errors[`goal_reflections.${index}.status`]='Status must be achieved, missed, or not_reviewed.';
    if(status==='missed'){
      if(!meaningful(goal.why_failed,15,1200))errors[`goal_reflections.${index}.why_failed`]='Missed goals require a specific reason of at least 15 characters.';
      if(!meaningful(goal.adaptation,15,1200))errors[`goal_reflections.${index}.adaptation`]='Missed goals require a Version-2 adaptation of at least 15 characters.';
    }
  });
  if(Object.keys(errors).length)return {ok:false,fieldErrors:errors};
  return {ok:true,value:{journal:String(journal).trim(),biometrics:{sleep_hours:sleep,energy_level:energy,stress_level:stress,resting_hr:hr},caar:Object.fromEntries(CAAR_KEYS.map(key=>[key,String(answers[key]).trim()])) as Record<CaarKey,string>,goal_reflections:(goals as Record<string,unknown>[]).map(goal=>({goal_id:String(goal.goal_id).trim(),status:goal.status as GoalReflectionInput['status'],why_failed:typeof goal.why_failed==='string'?goal.why_failed.trim():undefined,adaptation:typeof goal.adaptation==='string'?goal.adaptation.trim():undefined}))}};
}

export function selectBriefPriority<T extends {id:string;title:string;why_text:string;progress:number;horizon:string}>(missions:T[],goalOutcomes:{goal_id:string;status:string;adaptation:string|null;why_failed:string|null;id:string}[]){
  const outcomeByGoal=new Map(goalOutcomes.map(outcome=>[outcome.goal_id,outcome]));
  return [...missions].sort((a,b)=>{
    const weight=(mission:T)=>outcomeByGoal.get(mission.id)?.status==='missed'?0:mission.horizon==='today'?1:2;
    return weight(a)-weight(b)||a.progress-b.progress||a.id.localeCompare(b.id);
  });
}
