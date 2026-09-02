import { chromium } from 'playwright';

const base=process.env.CONSILIUM_CAPTURE_URL??'http://127.0.0.1:8790';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto(`${base}/#council`,{waitUntil:'networkidle'});
await page.evaluate(()=>fetch('/api/reset',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}));await page.reload({waitUntil:'networkidle'});
await page.locator('#consult-form button').click();await page.locator('#propose').waitFor();
const before=await page.evaluate(()=>fetch('/api/context').then(response=>response.json()));
if(before.actions.length!==0)throw new Error('Expected unchanged application state before proposal.');
await page.locator('#propose').click();await page.locator('#commit-action').waitFor();
const staged=await page.evaluate(()=>fetch('/api/context').then(response=>response.json()));
if(!staged.pendingProposal||staged.actions.length!==0)throw new Error('Proposal gate failed to preserve application state.');
await Promise.all([page.waitForResponse(response=>response.url().endsWith('/api/actions/commit')&&response.status()===200),page.waitForResponse(response=>response.url().endsWith('/api/context')&&response.status()===200),page.locator('#commit-action').click()]);await page.waitForTimeout(150);
const expected={today:'EXPLICITLY COMMITTED ACTIONS',missions:'APPROVED PLAN CHANGES',brief:'HUMAN-APPROVED PLAN CHANGE'};
for(const view of Object.keys(expected)){await page.goto(`${base}/#${view}`);await page.waitForTimeout(100);const text=await page.locator(`#view-${view}`).textContent();if(!text?.includes(expected[view]))throw new Error(`Committed action absent from ${view}`)}
const replay=await page.evaluate(async proposalId=>{const response=await fetch('/api/actions/commit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({proposal_id:proposalId})});return response.status},staged.pendingProposal.id);
if(replay!==409)throw new Error(`Replay returned ${replay}`);
const finalState=await page.evaluate(()=>fetch('/api/context').then(response=>response.json()));
await browser.close();
console.log(JSON.stringify({consultationMode:'deterministic-test-fixture',proposalPersistedWithoutAction:true,commitCount:finalState.actions.length,replayStatus:replay,visibleViews:['today','missions','brief']}));
