import test from 'node:test';
import assert from 'node:assert/strict';
import {dayKey,makePuzzle} from '../dist/engine.js';
import {resultRows} from '../dist/results.js';
// A small DOM adapter checks the actual UI event handlers without browser automation.
test('UI: curated daily, all tiles/spaces, undo, final-only years, persistence, and mobile sharing',async t=>{
 const RealDate=Date;let now=RealDate.parse('2026-09-16T12:00:00Z');globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
 t.after(()=>{globalThis.Date=RealDate;});
 const nodes=new Map(),registered=new Map(),stored=new Map();let copied='';
 const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',handlers:{},classList:{add(){},remove(){}},addEventListener(event,fn){this.handlers[event]=fn;},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(key);};
 const windowEvents={},documentEvents={};
 const listen=(events,name,handler)=>{const previous=events[name];events[name]=event=>{previous?.(event);handler(event);};};
 globalThis.document={querySelector:node,addEventListener(name,handler){listen(documentEvents,name,handler);},modelContext:{registerTool(tool){registered.set(tool.name,tool);}}};
 globalThis.window={addEventListener(name,handler){listen(windowEvents,name,handler);},scrollTo(){}};
 globalThis.localStorage={getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async text=>{copied=text;}}}});
 globalThis.location={origin:'https://example.com',pathname:'/timeline/'};
 const interval=globalThis.setInterval;globalThis.setInterval=()=>0;
 try{await import('../dist/app.js');}finally{globalThis.setInterval=interval;}
 const html=()=>node('#game').innerHTML;
 const click=async props=>node('#game').handlers.click({target:{closest:()=>({dataset:{},...props})}});
 const read=()=>registered.get('read_timeline_game').execute();
 const seed='daily:'+dayKey(),cards=makePuzzle(seed),correct=[...cards].sort((a,b)=>a.year-b.year);
 assert.equal((html().match(/data-slot=/g)||[]).length,5);assert.equal((html().match(/data-tile=/g)||[]).length,5);
 assert.equal(read().slots.filter(Boolean).length,0);assert.ok(!('result' in read()));assert.ok(!('year' in read().tiles[0]));
 for(const c of cards)assert.ok(!html().includes(String(c.year)));
 await click({dataset:{tile:cards[0].id}});await click({dataset:{slot:'0'}});assert.equal(read().slots[0],cards[0].id);
 await click({id:'undo'});assert.equal(read().slots[0],null);
 const order=[correct[4],...correct.slice(0,4)];
 for(let i=0;i<5;i++){await click({dataset:{tile:order[i].id}});await click({dataset:{slot:String(i)}});}
 for(const c of cards)assert.ok(!html().includes(String(c.year)));
 assert.ok(!('result' in read()));assert.equal((html().match(/data-tile=/g)||[]).length,5);
 const saved=JSON.parse(stored.get('timeline-v2:'+dayKey()));assert.equal(saved.submitted,false);assert.deepEqual(saved.slots,order.map(c=>c.id));
 await click({id:'submit'});assert.equal(read().result.percent,60);for(const c of cards)assert.ok(html().includes(String(c.year)));
 assert.equal((html().match(/class="tablet-record broken"/g)||[]).length,1);
 assert.equal((html().match(/class="tablet-record fractured"/g)||[]).length,4);
 assert.ok(!html().includes('status-stamp'));
 assert.equal((html().match(/class="relationship-square /g)||[]).length,20);
 assert.equal((html().match(/class="relationship-square hit"/g)||[]).length,12);
 assert.ok(!html().includes('3/4'));
 assert.ok(html().includes('Partly correct'));
 assert.equal(JSON.parse(stored.get('timeline-v2-history'))[dayKey()],6);
 await click({id:'share'});
 const submitted=JSON.parse(stored.get('timeline-v2:'+dayKey()));
 const emojiGrid=resultRows(submitted).map(row=>row.comparisons.map(c=>c.correct?'🟩':'🟧').join('')).join('\n');
 assert.ok(copied.includes('Daily history puzzle'));
 assert.ok(copied.includes(emojiGrid));assert.ok(copied.endsWith('https://example.com/timeline/'));
 const expectedShare=copied;let shared;
 navigator.share=async data=>{shared=data;};copied='';await click({id:'share'});
 assert.equal(shared.text,expectedShare);assert.equal(shared.title,'Timeline — Daily history puzzle');assert.equal(copied,'');
 navigator.share=async()=>{throw Object.assign(new Error('Cancelled'),{name:'AbortError'});};await click({id:'share'});assert.equal(copied,'');
 navigator.share=async()=>{throw new Error('Unavailable');};await click({id:'share'});assert.equal(copied,expectedShare);
 navigator.clipboard.writeText=async()=>{throw new Error('Denied');};node('#share-text').select=()=>{};await click({id:'share'});
 assert.equal(node('#share-text').value,expectedShare);assert.equal(node('#modal').open,true);delete navigator.share;
 assert.throws(()=>registered.get('submit_timeline').execute());
 await click({dataset:{view:'correct'}});assert.ok(html().includes('Your position: 5'));
 await click({dataset:{mode:'practice'}});assert.equal(read().submitted,false);assert.ok(read().slots.every(x=>x===null));
 await click({dataset:{mode:'daily'}});assert.equal(read().result.percent,60);
 assert.equal(registered.size,3);assert.equal(registered.get('read_timeline_game').annotations.readOnlyHint,true);
 // A background tab remains on the same dated puzzle until Eastern midnight.
 now=RealDate.parse('2026-09-17T03:59:59Z');windowEvents.pageshow();
 assert.equal(read().date,'2026-09-16');assert.equal(read().submitted,true);assert.equal(node('#countdown').textContent,'00:00:01');
 now=RealDate.parse('2026-09-17T04:00:00Z');windowEvents.focus();
 assert.equal(read().date,'2026-09-17');assert.equal(read().submitted,false);assert.ok(read().slots.every(x=>x===null));
 assert.equal(node('#countdown').textContent,'24:00:00');
 assert.deepEqual(JSON.parse(stored.get('timeline-v2:2026-09-16')),submitted);
 // Full reload selects the same date and recovers that day's staged placement.
 const nextId=read().tiles[0].id;registered.get('arrange_timeline_tile').execute({id:nextId,space:0});
 for(const events of [documentEvents,windowEvents])for(const key of Object.keys(events))delete events[key];
 globalThis.setInterval=()=>0;try{await import('../dist/app.js?reload-eastern');}finally{globalThis.setInterval=interval;}
 assert.equal(read().date,'2026-09-17');assert.equal(read().slots[0],nextId);
 // A stale submit cannot be applied to the newly arrived puzzle.
 now=RealDate.parse('2026-09-18T04:00:00Z');await click({id:'submit'});
 assert.equal(read().date,'2026-09-18');assert.equal(read().submitted,false);assert.ok(read().slots.every(x=>x===null));
 now=RealDate.parse('2026-09-19T04:00:00Z');documentEvents.visibilitychange();assert.equal(read().date,'2026-09-19');
});
