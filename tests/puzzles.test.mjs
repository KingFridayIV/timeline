import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadSchedule,validateBatches,renderSchedule} from '../scripts/build-puzzles.mjs';
import {DAILY_PUZZLES} from '../dist/puzzles.js';
import {EVENTS} from '../dist/events.js';
import {makePuzzle,newGame,arrange,submit,derive,validGame} from '../dist/engine.js';
import {resultRows,shareResult} from '../dist/results.js';

test('15 consecutive pilot days contain 75 distinct referenced events and match the website build',async()=>{
 const schedule=await loadSchedule();
 for(let day=16;day<=30;day++)assert.ok(schedule[`2026-09-${day}`]);
 const pilot=Object.entries(schedule).filter(([date])=>date>='2026-09-16'&&date<='2026-09-30');
 assert.equal(pilot.length,15);assert.equal(new Set(pilot.flatMap(([,events])=>events.map(e=>e.id))).size,75);
 assert.deepEqual(schedule,DAILY_PUZZLES);
 assert.equal(await readFile(new URL('../dist/puzzles.js',import.meta.url),'utf8'),renderSchedule(schedule));
});

test('every scheduled puzzle survives save/reload and scores partial credit with the matching share grid',()=>{
 for(const [date,events] of Object.entries(DAILY_PUZZLES)){
  const seed='daily:'+date,cards=makePuzzle(seed),sorted=[...cards].sort((a,b)=>a.year-b.year);
  assert.deepEqual(new Set(cards.map(c=>c.id)),new Set(events.map(c=>c.id)));
  assert.deepEqual(cards,makePuzzle(seed));assert.notDeepEqual(cards,sorted);
  let g=newGame(seed);for(const [i,c] of [sorted[4],...sorted.slice(0,4)].entries())g=arrange(g,c.id,i);
  assert.equal(derive(g).result,null);assert.ok(validGame(JSON.parse(JSON.stringify(g)),seed));
  g=submit(g);assert.equal(derive(g).result.percent,60);assert.ok(validGame(JSON.parse(JSON.stringify(g)),seed));
  const grid=resultRows(g).map(r=>r.comparisons.map(c=>c.correct?'🟩':'🟧').join('')).join('\n');
  assert.ok(shareResult(g,{mode:'daily',date,url:'https://example.com/timeline/'}).includes(grid));
 }
});

test('unlisted dates and practice retain the original bank; returned curated cards cannot mutate it',()=>{
 for(const seed of ['daily:2026-09-12','daily:2026-09-15','daily:2026-10-01','practice:pilot'])assert.ok(makePuzzle(seed).every(c=>EVENTS.some(e=>e.id===c.id)));
 const seed='daily:2026-09-16',cards=makePuzzle(seed),title=cards[0].title;
 cards[0].title='changed';assert.equal(makePuzzle(seed)[0].title,title);
});

test('batch validation blocks duplicate dates, impossible dates, tied years, missing links and unsafe text',()=>{
 const base={schemaVersion:1,puzzles:[{date:'2026-10-01',events:structuredClone(DAILY_PUZZLES['2026-09-16'])}]};
 const check=data=>validateBatches([{name:'test.json',data}]);
 assert.ok(check(base));assert.throws(()=>validateBatches([{name:'one',data:base},{name:'two',data:base}]),/duplicate date/);
 for(const mutate of [
  b=>b.puzzles[0].date='2026-02-30',b=>b.schemaVersion=2,b=>b.puzzles[0].events.pop(),
  b=>b.puzzles[0].events[1].year=b.puzzles[0].events[0].year,
  b=>b.puzzles[0].events[1].id=b.puzzles[0].events[0].id,
  b=>b.puzzles[0].events[0].source='https://example.com/wiki/Fake',
  b=>b.puzzles[0].events[0].source='https://en.wikipedia.org/wiki/',
  b=>b.puzzles[0].events[0].label='x'.repeat(39),
  b=>b.puzzles[0].events[0].title='<script>alert(1)</script>',
  b=>b.puzzles[0].events[0].year=3000
 ]){const data=structuredClone(base);mutate(data);assert.throws(()=>check(data));}
});
