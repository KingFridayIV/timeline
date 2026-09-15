import test from 'node:test';
import assert from 'node:assert/strict';
import {dayKey,makePuzzle} from '../dist/engine.js';
import {resultRows} from '../dist/results.js';
// A small DOM adapter checks the actual UI event handlers without browser automation.
test('UI: all tiles/spaces, staged changes, undo, final-only years, and persisted score',async()=>{
 const nodes=new Map(),registered=new Map(),stored=new Map();let copied='';
 const node=key=>{if(!nodes.has(key))nodes.set(key,{innerHTML:'',textContent:'',handlers:{},classList:{add(){},remove(){}},addEventListener(event,fn){this.handlers[event]=fn;},focus(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(key);};
 globalThis.document={querySelector:node,addEventListener(){},modelContext:{registerTool(tool){registered.set(tool.name,tool);}}};
 globalThis.window={addEventListener(){},scrollTo(){}};
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
 assert.throws(()=>registered.get('submit_timeline').execute());
 await click({dataset:{view:'correct'}});assert.ok(html().includes('Your position: 5'));
 await click({dataset:{mode:'practice'}});assert.equal(read().submitted,false);assert.ok(read().slots.every(x=>x===null));
 await click({dataset:{mode:'daily'}});assert.equal(read().result.percent,60);
 assert.equal(registered.size,3);assert.equal(registered.get('read_timeline_game').annotations.readOnlyHint,true);
});
