import test from 'node:test';
import assert from 'node:assert/strict';
import {EVENTS} from '../dist/events.js';
import {makePuzzle,newGame,derive,arrange,submit,scoreOrder,validGame,statistics,dayKey,puzzleNumber} from '../dist/engine.js';
function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];}
test('all 120 arrangements receive correct relative-order credit',()=>{
 const cards=makePuzzle('scoring').sort((a,b)=>a.year-b.year);const outcomes=[];
 for(const order of permutations(cards)){
  const result=scoreOrder(order);const inversions=order.reduce((n,a,i)=>n+order.slice(i+1).filter(b=>a.year>b.year).length,0);
  assert.equal(result.correctPairs,10-inversions);assert.equal(result.percent,(10-inversions)*10);outcomes.push(result.percent);
 }
 assert.equal(outcomes.filter(n=>n===100).length,1);assert.equal(outcomes.filter(n=>n===0).length,1);
 assert.equal(scoreOrder([cards[4],...cards.slice(0,4)]).percent,60);
 assert.equal(scoreOrder([cards[1],cards[0],...cards.slice(2)]).percent,90);
});
test('365 shared puzzles have five unique years and an unsolved tray',()=>{
 for(let i=0;i<365;i++){const seed='daily:'+dayKey(new Date(Date.UTC(2026,8,12+i))),cards=makePuzzle(seed);assert.deepEqual(cards,makePuzzle(seed));assert.equal(cards.length,5);assert.equal(new Set(cards.map(c=>c.year)).size,5);assert.notDeepEqual(cards,[...cards].sort((a,b)=>a.year-b.year));}
 assert.notDeepEqual(makePuzzle('daily:2026-09-12'),makePuzzle('daily:2026-09-13'));
});
test('place, move, swap, displace, return and submit are atomic',()=>{
 let g=newGame('moves');const [a,b,c,d,e]=makePuzzle(g.seed).map(c=>c.id);
 assert.equal(derive(g).result,null);assert.throws(()=>submit(g));
 g=arrange(g,a,0);g=arrange(g,b,1);g=arrange(g,a,1);assert.deepEqual(g.slots,[b,a,null,null,null]);
 g=arrange(g,c,1);assert.deepEqual(g.slots,[b,c,null,null,null]);
 g=arrange(g,b,4);assert.deepEqual(g.slots,[null,c,null,null,b]);
 g=arrange(g,b,null);assert.deepEqual(g.slots,[null,c,null,null,null]);
 g=arrange(g,a,0);g=arrange(g,b,2);g=arrange(g,d,3);g=arrange(g,e,4);
 assert.equal(derive(g).result,null);assert.equal(derive(g).complete,true);
 const saved=JSON.parse(JSON.stringify(g));assert.ok(validGame(saved,g.seed));assert.deepEqual(saved,g);
 g=submit(g);assert.equal(derive(g).result.totalPairs,10);assert.ok(validGame(g,g.seed));
 assert.throws(()=>arrange(g,a,2));assert.throws(()=>submit(g));
});
test('reject corrupt saves and invalid move inputs without mutations',()=>{
 const g=newGame('invalid'),id=makePuzzle(g.seed)[0].id;
 for(const slot of [-1,5,1.5,undefined,'1'])assert.throws(()=>arrange(g,id,slot));
 assert.throws(()=>arrange(g,'unknown',0));assert.ok(g.slots.every(x=>x===null));
 for(const save of [null,{}, {...g,slots:[id,id,null,null,null]}, {...g,slots:['bad',null,null,null,null]}, {...g,submitted:true},{...g,submitted:'true'},{...g,seed:'other'},{...g,slots:[null]}])assert.equal(validGame(save,g.seed),false);
});
test('UTC rollover and new percentage statistics',()=>{
 assert.equal(dayKey(new Date('2026-09-12T20:00:00-04:00')),'2026-09-13');assert.equal(puzzleNumber('2026-09-12'),1);
 const h={'2026-09-10':10,'2026-09-11':0,'2026-09-12':6};
 assert.deepEqual(statistics(h,'2026-09-12'),{played:3,perfect:1,average:53,current:3,best:3});
 assert.equal(statistics(h,'2026-09-13').current,3);assert.equal(statistics(h,'2026-09-14').current,0);
 assert.equal(statistics({...h,'2026-09-14':5},'2026-09-14').current,1);
 assert.equal(statistics({x:5,'2026-09-15':11},'2026-09-15').played,0);
});
test('all content has unique IDs, years, and HTTPS source links',()=>{
 assert.equal(new Set(EVENTS.map(e=>e.id)).size,EVENTS.length);assert.equal(new Set(EVENTS.map(e=>e.year)).size,EVENTS.length);
 for(const e of EVENTS){assert.ok(e.title&&e.fact&&e.category);assert.equal(new URL(e.source).protocol,'https:');}
});
