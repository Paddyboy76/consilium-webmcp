import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base=process.env.CONSILIUM_CAPTURE_URL??'http://127.0.0.1:8790',output='artifacts/pass7';
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true}),errors=[];
const desktop=await browser.newPage({viewport:{width:1440,height:900}});
desktop.on('console',message=>{if(message.type()==='error')errors.push(`desktop console: ${message.text()}`)});
desktop.on('pageerror',error=>errors.push(`desktop page: ${error.message}`));
await desktop.goto(`${base}/#today`,{waitUntil:'networkidle'});
await desktop.evaluate(()=>fetch('/api/reset',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}));
await desktop.reload({waitUntil:'networkidle'});
const desktopText=await desktop.locator('body').innerText();
for(const phrase of ['six goals for today and six longer-term projects','6 RECENT UPDATES','YOUR COUNCIL FOR THIS DEMO','Cancel one subscription I don’t use'])if(!desktopText.includes(phrase))throw new Error(`missing desktop phrase: ${phrase}`);
await desktop.screenshot({path:`${output}/01-desktop-natural-goals-history.png`,fullPage:true});

const mobile=await browser.newPage({viewport:{width:390,height:844}});
mobile.on('console',message=>{if(message.type()==='error')errors.push(`mobile console: ${message.text()}`)});
mobile.on('pageerror',error=>errors.push(`mobile page: ${error.message}`));
await mobile.goto(`${base}/#journal`,{waitUntil:'networkidle'});
const mobileText=await mobile.locator('body').innerText();
for(const phrase of ['I kept finding tidy little jobs','Ask one potential client if they’d try my accessibility audit','I did not send it'])if(!mobileText.includes(phrase))throw new Error(`missing mobile phrase: ${phrase}`);
await mobile.screenshot({path:`${output}/02-mobile-natural-journal-history.png`,fullPage:true});
const widths=await Promise.all([desktop,mobile].map(page=>page.evaluate(()=>({body:document.documentElement.scrollWidth,viewport:innerWidth}))));
await browser.close();
if(errors.length||widths.some(width=>width.body>width.viewport))throw new Error(JSON.stringify({errors,widths}));
console.log(JSON.stringify({errors,widths,screenshots:2}));
