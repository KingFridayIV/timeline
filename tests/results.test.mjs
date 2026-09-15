import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makePuzzle,newGame,derive} from '../dist/engine.js';
import {resultRows,shareResult} from '../dist/results.js';

const seed='results-grid';
const sorted=makePuzzle(seed).sort((a,b)=>a.year-b.year);
const gameFor=cards=>({seed,submitted:true,slots:cards.map(c=>c.id)});
const options={mode:'daily',date:'2026-09-14',url:'https://example.com/timeline/'};
function permutations(a){return a.length?a.flatMap((v,i)=>permutations(a.filter((_,j)=>i!==j)).map(p=>[v,...p])):[[]];}
test('all permutations preserve score and exact four-column comparison identity',()=>{
 for(const order of permutations(sorted)){
  const game=gameFor(order),rows=resultRows(game),r=derive(game).result;
  assert.equal(rows.length,5);
  for(const [index,row] of rows.entries()){
   assert.equal(row.id,order[index].id);assert.equal(row.position,index+1);assert.equal(row.comparisons.length,4);
   assert.deepEqual(row.comparisons.map(c=>c.otherId),game.slots.filter(id=>id!==row.id));
   for(const c of row.comparisons){
    const otherIndex=c.otherPosition-1;
    assert.equal(c.correct,(index<otherIndex)===(order[index].year<order[otherIndex].year));
   }
  }
  assert.equal(rows.flatMap(row=>row.comparisons).filter(c=>c.correct).length,r.correctPairs*2);
  const shared=shareResult(game,options).split('\n').filter(line=>line.startsWith('🟩')||line.startsWith('🟧'));
  assert.deepEqual(shared,rows.map(row=>row.comparisons.map(c=>c.correct?'🟩':'🟧').join('')));
 }
});
test('misplaced last tile produces the expected 60% grid without answer spoilers',()=>{
 const game=gameFor([sorted[4],...sorted.slice(0,4)]),text=shareResult(game,options);
 assert.ok(text.includes('Daily history puzzle'));assert.ok(text.includes('60%'));
 assert.ok(text.includes('🟧🟧🟧🟧\n🟧🟩🟩🟩\n🟧🟩🟩🟩\n🟧🟩🟩🟩\n🟧🟩🟩🟩'));
 for(const c of sorted){assert.ok(!text.includes(c.title));assert.ok(!text.includes(String(c.year)));}
 assert.ok(text.endsWith(options.url));
 assert.ok(shareResult(game,{...options,mode:'practice'}).includes('Practice · 60%'));
 assert.throws(()=>shareResult(newGame(seed),options));
});
test('page and shared-link metadata describe the history puzzle immediately',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(html,/<title>Timeline — Daily history puzzle<\/title>/);
 for(const field of ['description','og:description','twitter:description'])
  assert.ok(html.includes(`="${field}" content="A daily history puzzle.`));
});
