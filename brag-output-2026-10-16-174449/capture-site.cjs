const {chromium}=require('C:/Users/picar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');
const root=__dirname;
(async()=>{const browser=await chromium.launch({executablePath:'C:/Users/picar/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,reducedMotion:'reduce',timezoneId:'Asia/Manila'});
await context.route(/posthog|i\.posthog|bigdatacloud/,r=>r.abort());
await context.addInitScript(()=>localStorage.setItem('cosmicgaze-location-prompt-seen','true'));
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function open(route){await page.goto('http://127.0.0.1:5173'+route,{waitUntil:'networkidle',timeout:60000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);await page.locator('.wordmark').waitFor();}
async function shot(name){await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});await page.screenshot({path:path.join(root,'composition/assets/screens',name+'.png')});console.log(name);}
await open('/');await page.locator('.galaxy-scene img').evaluate(i=>i.decode());await shot('home');
await open('/moon-match');await page.getByRole('button',{name:'Combine our Moons'}).waitFor();await page.waitForFunction(()=>!document.querySelector('.match-actions .primary-button').disabled);await shot('match-before');await page.getByRole('button',{name:'Combine our Moons'}).click();await page.waitForTimeout(1200);await shot('match-after');
await open('/cosmic-age');await page.waitForFunction(()=>!document.querySelector('.age-download button')?.disabled);await shot('age-jupiter');await page.getByRole('button',{name:'Saturn',exact:true}).click();await page.waitForTimeout(2000);await shot('age-saturn');
await open('/solar-system');await page.waitForSelector('.planet-stage canvas');await page.waitForTimeout(1800);await shot('saturn');await page.getByRole('button',{name:'Earth',exact:true}).click();await page.waitForTimeout(1800);await shot('earth');
await open('/build-your-planet');await page.waitForTimeout(2000);await shot('builder');
await page.setViewportSize({width:390,height:844});await open('/moon-match');await page.waitForFunction(()=>!document.querySelector('.match-actions .primary-button').disabled);await shot('phone-match');await open('/');await shot('phone-home');
const ui={errors,header:await page.locator('.wordmark').innerText(),footer:await page.locator('.site-footer').innerText(),overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)};
fs.writeFileSync(path.join(root,'site-verification.json'),JSON.stringify(ui,null,2));console.log(ui);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
