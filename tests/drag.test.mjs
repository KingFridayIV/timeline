import test from 'node:test';
import assert from 'node:assert/strict';
import {bindTileDragging} from '../dist/drag.js';

function harness(){
  const elements=[];
  function element(dataset={}){
    const classes=new Set();
    const e={dataset,handlers:{},style:{},capture:null,removed:false,
      classList:{add(...values){values.forEach(v=>classes.add(v));},remove(...values){values.forEach(v=>classes.delete(v));},contains:v=>classes.has(v)},
      addEventListener(name,fn){this.handlers[name]=fn;},
      closest(selector){return selector==='[data-slot]'?(this.dataset.slot!==undefined?this:null):this;},
      getBoundingClientRect:()=>({left:180,top:200,width:150,height:90}),
      cloneNode(){return element({...this.dataset});},removeAttribute(){},setAttribute(){},
      setPointerCapture(id){this.capture=id;},hasPointerCapture(id){return this.capture===id;},releasePointerCapture(){this.capture=null;},
      remove(){this.removed=true;}
    };elements.push(e);return e;
  }
  const root=element(),source=element({tile:'a'}),target=element({slot:'2'}),body=[];
  root.contains=e=>e===source||e===target;
  const doc={handlers:{},hidden:false,body:{append:e=>body.push(e)},elementFromPoint:(x,y)=>x<150&&y>150?target:null,addEventListener(name,fn){this.handlers[name]=fn;}};
  const win={innerHeight:700,scrolls:[],addEventListener(){},scrollBy(x,y){this.scrolls.push([x,y]);}};
  let rev='board1';const drops=[],messages=[],frames=new Map();let nextFrame=0;
  const controller=bindTileDragging(root,{resolveTile:e=>e.dataset.tile,revision:()=>rev,onDrop:(...args)=>drops.push(args),announce:m=>messages.push(m)},
    {document:doc,window:win,raf:fn=>{frames.set(++nextFrame,fn);return nextFrame;},caf:id=>frames.delete(id)});
  function pointer(type,props={}){const e={target:source,pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:240,clientY:240,cancelable:true,preventDefault(){this.prevented=true;},...props};root.handlers[type](e);return e;}
  return {root,source,target,body,doc,win,controller,drops,messages,frames,pointer,setRevision:value=>{rev=value;}};
}

test('touch lift, target highlight, drop, ghost cleanup and synthetic-click suppression',()=>{
  const h=harness();h.pointer('pointerdown');h.pointer('pointermove',{clientX:100});
  assert.equal(h.body.length,1);assert.ok(h.source.classList.contains('is-lifted'));assert.ok(h.target.classList.contains('drop-ready'));
  assert.equal(h.body[0].style.top,'182px');
  h.pointer('pointerup',{clientX:100});assert.deepEqual(h.drops,[['a',2]]);
  assert.ok(h.body[0].removed);assert.equal(h.frames.size,0);assert.equal(h.source.capture,null);
  assert.ok(!h.target.classList.contains('drop-ready'));assert.ok(h.controller.consumeClick({detail:1}));assert.ok(!h.controller.consumeClick({detail:1}));
});
test('a tap or small pointer motion stays available to the tap interface',()=>{
  const h=harness();h.pointer('pointerdown');h.pointer('pointermove',{clientX:242});h.pointer('pointerup',{clientX:242});
  assert.equal(h.body.length,0);assert.deepEqual(h.drops,[]);assert.equal(h.controller.consumeClick({detail:1}),false);
});
test('outside drops, cancellation, Escape, and changed puzzles never commit',()=>{
  for(const exit of ['outside','pointercancel','lostpointercapture','escape','revision']){
    const h=harness();h.pointer('pointerdown');h.pointer('pointermove',{clientX:100});
    if(exit==='outside')h.pointer('pointerup',{clientX:200,clientY:80});
    else if(exit==='escape')h.doc.handlers.keydown({key:'Escape'});
    else if(exit==='revision'){h.setRevision('board2');h.pointer('pointerup',{clientX:100});}
    else h.pointer(exit);
    assert.deepEqual(h.drops,[],exit);assert.ok(h.body[0].removed,exit);assert.equal(h.frames.size,0,exit);
  }
});
test('edge dragging scrolls, extra pointers are ignored, keyboard activation is preserved',()=>{
  const h=harness();h.pointer('pointerdown');h.pointer('pointermove',{clientX:100,clientY:690});
  const [key,frame]=[...h.frames][0];h.frames.delete(key);frame();assert.ok(h.win.scrolls[0][1]>0);
  h.pointer('pointerup',{pointerId:2,clientX:100});assert.equal(h.drops.length,0);
  h.pointer('pointerup',{clientX:100});assert.equal(h.drops.length,1);
  assert.equal(h.controller.consumeClick({detail:0}),false);
  h.pointer('pointerdown');h.pointer('pointerup');assert.equal(h.controller.consumeClick({detail:1}),false);
});
