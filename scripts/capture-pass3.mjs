import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const base=process.env.CONSILIUM_CAPTURE_URL??'http://127.0.0.1:8790',output='artifacts/pass3';
await mkdir(output,{recursive:true});const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
await page.goto(`${base}/#journal`,{waitUntil:'networkidle'});await page.locator('[data-dialog="reflection-dialog"]').click();await page.screenshot({path:`${output}/reflection-desktop-1440x900.png`});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${output}/reflection-mobile-390x844.png`});
await page.setViewportSize({width:1440,height:900});await page.route('**/api/briefs/generate',async route=>{await new Promise(resolve=>setTimeout(resolve,1800));await route.continue()});await page.locator('#reflection-dialog header button').click();await page.goto(`${base}/#brief`);const click=page.locator('#generate-brief').click();await page.locator('#workflow-loader:not([hidden])').waitFor();await page.screenshot({path:`${output}/enso-stage-1.png`});await page.waitForTimeout(600);await page.screenshot({path:`${output}/enso-stage-2.png`});await click;
await page.screenshot({path:`${output}/morning-brief-1440x900.png`,fullPage:true});await page.goto(`${base}/#trace`);await page.screenshot({path:`${output}/transparency-1440x900.png`,fullPage:true});const width=await page.evaluate(()=>({body:document.body.scrollWidth,viewport:innerWidth}));await browser.close();if(errors.length||width.body>width.viewport)throw new Error(JSON.stringify({errors,width}));console.log(JSON.stringify({errors,width,frames:2}));
