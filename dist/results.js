import {derive,puzzleNumber} from './engine.js';

// Each row follows the submitted timeline. Within a row, compare against the
// other four submitted positions, top to bottom, skipping the row itself.
// This exact ordering is used in both the screen result and the share text.
export function resultRows(game){
  const s=derive(game);
  if(!s.submitted)throw new Error('Submit the timeline before viewing results.');
  return game.slots.map((id,index)=>({id,position:index+1,comparisons:game.slots.flatMap((otherId,otherIndex)=>{
    if(id===otherId)return [];
    const pair=s.result.pairs.find(p=>(p.earlier===id&&p.later===otherId)||(p.earlier===otherId&&p.later===id));
    return [{otherId,otherPosition:otherIndex+1,correct:pair.correct}];
  })}));
}

export function shareResult(game,{mode,date,url}){
  const rows=resultRows(game),score=derive(game).result.percent;
  return `Timeline — Daily history puzzle\n${mode==='daily'?`#${puzzleNumber(date)} · ${date}`:'Practice'} · ${score}%\n\n${rows.map(row=>row.comparisons.map(c=>c.correct?'🟩':'🟧').join('')).join('\n')}\n\n${url}`;
}
