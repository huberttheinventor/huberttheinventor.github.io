import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const puppeteer=require('C:/Users/julia/projects/professor_hubert_j_farnsworth/node_modules/puppeteer-core');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'quantum/.qa');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.png':'image/png','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(url.endsWith('/'))url+='index.html';const file=path.resolve(root,'.'+url);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await puppeteer.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const report={date:new Date().toISOString(),reference:'shadow.html',source:'Chromium computed styles and actual interactions',cases:[]};
const styles=()=>{
 const get=s=>{const e=document.querySelector(s),c=getComputedStyle(e);return {font:c.fontFamily,size:c.fontSize,color:c.color,background:c.backgroundColor};};
 return {h1:get('h1'),lead:get('.lead'),prose:get('.journalArticle__article > p:not([class])'),meta:get('.journalArticle__documentCell'),plate:get('.section__lightgrey'),footer:get('.section__blue'),header:get('header'),fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),viewport:innerWidth,scroll:document.documentElement.scrollWidth};
};
try {
 for(const width of [320,390,1440]){
  const page=await browser.newPage();await page.setViewport({width,height:900,deviceScaleFactor:1});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setRequestInterception(true);
  page.on('request',req=>req.url().startsWith(base)||req.url().startsWith('data:')?req.continue():req.abort());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/shadow.html',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  await page.$eval('button[data-reading="paper"]',e=>e.click());
  const reference=await page.evaluate(styles);
  await page.screenshot({path:path.join(out,`reference-${width}.png`)});
  await page.goto(base+'/quantum/',{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  const paper=await page.evaluate(styles);
  assert.equal(paper.plate.background,'rgb(213, 214, 219)');
  for(const key of ['h1','lead','prose','meta','plate','footer','header'])assert.deepEqual(paper[key],reference[key],`${width}px ${key} must inherit Shadow's actual style`);
  assert.equal(paper.scroll,width,'No root horizontal overflow');
  for(const font of ['SemiSqueezed','Graphik','Mono'])assert.ok(paper.fonts.includes(font),'Loaded canonical font '+font);
  assert.equal(await page.$eval('header .rec',e=>getComputedStyle(e).color), 'rgb(0, 255, 0)');
  await page.screenshot({path:path.join(out,`quantum-${width}-paper-top.png`)});
  await (await page.$('#map')).screenshot({path:path.join(out,`quantum-${width}-paper-map.png`)});
  await page.$eval('[data-chance="80"]',e=>e.click());
  assert.equal(await page.$eval('#chance-output',e=>e.value),'Upper 80% / lower 20%');
  await page.$eval('[data-chance="100"]',e=>e.click());
  assert.equal(await page.$$eval('#odds-dots circle',es=>es.every(e=>e.getAttribute('cy')==='60')),true);
  await page.$eval('#chance',e=>{e.value='0';e.dispatchEvent(new Event('input',{bubbles:true}));});
  assert.equal(await page.$$eval('#odds-dots circle',es=>es.every(e=>e.getAttribute('cy')==='240')),true);
  await page.$eval('[data-chance="50"]',e=>e.click());
  const geometry=await page.$$eval('#odds-dots circle',es=>es.map(e=>({x:e.getAttribute('cx'),y:e.getAttribute('cy')})));
  assert.equal(geometry.length,20);assert.ok(geometry.every(e=>['60','240'].includes(e.y)));
  await page.$eval('button[data-reading="panel"]',e=>e.click());
  const panel=await page.evaluate(styles);assert.equal(panel.plate.background,'rgb(34, 36, 43)');
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:path.join(out,`quantum-${width}-panel-top.png`)});
  const equation=await page.$('figure[aria-labelledby="equation-caption"]');
  await equation.screenshot({path:path.join(out,`quantum-${width}-equation.png`)});
  await page.reload({waitUntil:'networkidle0'});
  assert.equal(await page.$eval('html',e=>e.dataset.reading),'panel','Reading preference persists');
  if(width===390){await page.click('button.menu');assert.equal(await page.$eval('button.menu',e=>e.getAttribute('aria-expanded')),'true');await page.click('button.menu');}
  const localLinks=await page.$$eval('a[href]',es=>[...new Set(es.map(e=>e.getAttribute('href')).filter(x=>x.startsWith('/')||x.startsWith('#')))]);
  for(const link of localLinks){if(link.startsWith('#'))assert.ok(await page.$(link),'Local anchor '+link);else{const r=await fetch(base+link);assert.equal(r.status,200,'Local route '+link);}}
  assert.deepEqual(errors,[],'No page JavaScript exceptions');
  report.cases.push({width,paper,panel,probabilityControls:'pass 0/50/80/100',readingToggle:'pass including persistence',localLinks:'pass',errors});
  await page.close();
 }
 const nojs=await browser.newPage();await nojs.setViewport({width:390,height:844});await nojs.setJavaScriptEnabled(false);await nojs.goto(base+'/quantum/');await nojs.evaluate(()=>document.fonts.ready);
 assert.equal(await nojs.$eval('.quantumControls',e=>getComputedStyle(e).display),'none');
 for(const selector of ['h1','#map','a[download]'])assert.ok(await nojs.$eval(selector,e=>{if(!e.getBoundingClientRect().height)return false;for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p);if(Number(c.opacity)===0||c.visibility==='hidden'||c.display==='none')return false;}return true;}),'No-JS visible element and ancestors: '+selector);
 assert.equal(await nojs.$$eval('#odds-dots circle',es=>es.length),20,'No-JS static dot records');
 await nojs.screenshot({path:path.join(out,'quantum-nojs.png')});
 await (await nojs.$('#map')).screenshot({path:path.join(out,'quantum-nojs-map.png')});await nojs.close();
 report.noJavaScript='Readable article, static map, download; nonfunctional controls hidden';report.ok=true;
 fs.writeFileSync(path.join(root,'quantum/design-verification.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
} finally {await browser.close();server.close();}
