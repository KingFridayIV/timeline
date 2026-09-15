// Online editorial check, intentionally separate from offline tests and deployment.
import {loadSchedule} from './build-puzzles.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const events=[...new Map(Object.values(await loadSchedule()).flat().map(e=>[e.source,e])).values()];
const results=[];
for(let i=0;i<events.length;i+=3){
 await Promise.all(events.slice(i,i+3).map(async e=>{
  try{
   const response=await fetch(e.source,{headers:{'User-Agent':'TimelinePilotSourceCheck/1.0 (educational game reference validation)'},signal:AbortSignal.timeout(30000)});
   const html=await response.text();
   const plain=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<(?:"[^"]*"|'[^']*'|[^'">])*>/g,' ').replace(/&#160;|&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ');
   const at=plain.indexOf(String(e.year));
   const excerpts=[...plain.matchAll(new RegExp(`.{0,100}\\b${e.year}\\b.{0,180}`,'g'))].slice(0,3).map(m=>m[0]);
   const ok=response.ok&&!/Wikipedia does not have an article with this exact name|class="noarticletext"/.test(html)&&at!==-1;
   results.push({id:e.id,year:e.year,source:e.source,resolvedURL:response.url,status:response.status,ok,title:(html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1],excerpts});
   console.log(`${ok?'OK':'REVIEW'} ${e.id} (${e.year}) — HTTP ${response.status}`);
  }catch(error){results.push({id:e.id,source:e.source,ok:false,error:error.message});console.log(`FAILED ${e.id}: ${error.message}`);}
 }));
}
results.sort((a,b)=>a.id.localeCompare(b.id));
await mkdir(new URL('../content/reports/',import.meta.url),{recursive:true});
await writeFile(new URL('../content/reports/wikipedia-check.json',import.meta.url),JSON.stringify({checkedAt:new Date().toISOString(),note:'HTTP success and year presence are automated checks, not proof of historical accuracy. Review excerpts against the specific milestone before publishing.',results},null,2)+'\n');
if(results.some(r=>!r.ok))process.exitCode=1;
