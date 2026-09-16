import test from 'node:test';
import assert from 'node:assert/strict';
import {dayKey,nextMidnight} from '../dist/calendar.js';
import {makePuzzle,statistics} from '../dist/engine.js';
import {DAILY_PUZZLES} from '../dist/puzzles.js';

test('all players switch on Eastern midnight, not UTC or their local midnight',()=>{
 assert.equal(dayKey(new Date('2026-09-17T03:59:59.999Z')),'2026-09-16');
 assert.equal(dayKey(new Date('2026-09-17T04:00:00Z')),'2026-09-17');
 for(const instant of ['2026-09-17T04:00:00Z','2026-09-16T21:00:00-07:00','2026-09-17T13:00:00+09:00'])assert.equal(dayKey(new Date(instant)),'2026-09-17');
 assert.equal(dayKey(new Date('2026-01-17T04:59:59Z')),'2026-01-16');
 assert.equal(dayKey(new Date('2026-01-17T05:00:00Z')),'2026-01-17');
});

test('countdown follows 23-hour and 25-hour days and year boundaries',()=>{
 for(const [start,end,hours] of [
  ['2026-03-08T05:00:00Z','2026-03-09T04:00:00Z',23],
  ['2026-11-01T04:00:00Z','2026-11-02T05:00:00Z',25],
  ['2026-09-16T04:00:00Z','2026-09-17T04:00:00Z',24],
  ['2026-12-31T05:00:00Z','2027-01-01T05:00:00Z',24]
 ]){assert.equal(nextMidnight(new Date(start)),Date.parse(end));assert.equal(nextMidnight(new Date(start))-Date.parse(start),hours*3600000);}
 const last=new Date('2026-09-17T03:59:59.999Z');assert.equal(nextMidnight(last)-last.getTime(),1);
});

test('each of the 15 scheduled puzzles covers its full Eastern calendar day',()=>{
 for(let day=16;day<=30;day++){
  const date=`2026-09-${day}`,start=new Date(date+'T00:00:00-04:00'),end=new Date(nextMidnight(start)-1);
  for(const instant of [start,end]){
   const key=dayKey(instant);assert.equal(key,date);
   assert.deepEqual(new Set(makePuzzle('daily:'+key).map(e=>e.id)),new Set(DAILY_PUZZLES[date].map(e=>e.id)));
  }
 }
});

test('streaks count calendar dates across daylight-saving changes',()=>{
 for(const days of [['2026-03-07','2026-03-08','2026-03-09'],['2026-10-31','2026-11-01','2026-11-02']]){
  const stats=statistics(Object.fromEntries(days.map(d=>[d,6])),days.at(-1));assert.equal(stats.current,3);assert.equal(stats.best,3);
 }
});
