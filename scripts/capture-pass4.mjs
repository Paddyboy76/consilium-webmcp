import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base=process.env.CONSILIUM_CAPTURE_URL??'http://127.0.0.1:8790',output='artifacts/pass4';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',error=>errors.push(error.message));

await page.goto(`${base}/#missions`,{waitUntil:'networkidle'});
const domains=await page.locator('.area[data-domain]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-domain')));
if(JSON.stringify(domains)!==JSON.stringify(['PHY','MNT','SPR','SOC','FIN','VOC']))throw new Error(`Unexpected domains: ${domains}`);
await page.screenshot({path:`${output}/six-domains-1440x900.png`,fullPage:true});
await page.setViewportSize({width:390,height:844});
await page.locator('#sidebar').evaluate(node=>node.classList.remove('open'));
await page.screenshot({path:`${output}/six-domains-390x844.png`});
const mobileWidth=await page.evaluate(()=>({body:document.body.scrollWidth,viewport:innerWidth}));

await page.goto(`${base}/#journal`);await page.locator('[data-dialog="reflection-dialog"]').click();
if(await page.locator('.goal-reflection').count()!==6)throw new Error('Structured reflection does not expose six linked Today goals');
await page.screenshot({path:`${output}/structured-reflection-390x844.png`});
await page.locator('#reflection-dialog header button').click();

await page.setViewportSize({width:1440,height:900});
await page.route('**/api/briefs/generate',async route=>{await new Promise(resolve=>setTimeout(resolve,3300));await route.continue()});
await page.goto(`${base}/#brief`);
const click=page.locator('#generate-brief').click();
await page.locator('#workflow-loader:not([hidden])').waitFor();
for(const [name,delay] of [['enso-1-early.png',300],['enso-2-mid.png',900],['enso-3-complete.png',1200]]){await page.waitForTimeout(delay);await page.screenshot({path:`${output}/${name}`})}
await click;
await page.goto(`${base}/#trace`);const catalogue=await page.locator('#tool-inspector .tool-row').count();
if(catalogue!==12)throw new Error(`Expected 12 WebMCP contracts, found ${catalogue}`);
const desktopWidth=await page.evaluate(()=>({body:document.body.scrollWidth,viewport:innerWidth}));
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.route('**/api/briefs/generate',async route=>{await new Promise(resolve=>setTimeout(resolve,500));await route.continue()});await reduced.goto(`${base}/#brief`);const reducedClick=reduced.locator('#generate-brief').click();await reduced.locator('#workflow-loader:not([hidden])').waitFor();const reducedContract=await reduced.locator('.enso img').evaluate(node=>({animation:getComputedStyle(node).animationName,mask:getComputedStyle(node).maskImage,ledger:[...document.querySelectorAll('.stage-list>div')].every(row=>row.classList.contains('complete'))}));await reduced.screenshot({path:`${output}/enso-reduced-motion-390x844.png`});await reducedClick;await reduced.close();
await browser.close();
if(errors.length||mobileWidth.body>mobileWidth.viewport||desktopWidth.body>desktopWidth.viewport||reducedContract.animation!=='none'||!reducedContract.ledger)throw new Error(JSON.stringify({errors,mobileWidth,desktopWidth,reducedContract}));
console.log(JSON.stringify({domains,reflectionGoals:6,catalogue,errors,mobileWidth,desktopWidth,ensoFrames:3,reducedContract}));
