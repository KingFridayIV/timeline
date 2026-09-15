// Pointer Events give mouse, pen, and touch the same placement behavior.
// No HTML drag-and-drop dependency: iPhone Safari uses the same controller.
export function bindTileDragging(root, {resolveTile, revision, onDrop, announce}, env = {}) {
  const doc=env.document||document,win=env.window||window;
  const raf=env.raf||(fn=>requestAnimationFrame(fn));
  const caf=env.caf||(id=>cancelAnimationFrame(id));
  let active=null,ignoreClick=false,frame=null;

  function clearTarget(){active?.target?.classList.remove('drop-ready');}
  function targetAt(x,y){
    const target=doc.elementFromPoint(x,y)?.closest('[data-slot]');
    return target&&root.contains(target)?target:null;
  }
  function updateTarget(){
    if(!active?.lifted)return;
    const next=targetAt(active.x,active.y);
    if(next===active.target)return;
    clearTarget();active.target=next;
    if(next){next.classList.add('drop-ready');announce(`Release in space ${Number(next.dataset.slot)+1}.`);}
  }
  function moveGhost(){
    if(!active?.ghost)return;
    active.ghost.style.left=`${active.x-active.offsetX}px`;
    active.ghost.style.top=`${active.y-active.offsetY-(active.touch?18:0)}px`;
  }
  function scrollFrame(){
    if(!active?.lifted)return;
    const edge=48,height=win.innerHeight;
    const speed=active.y<edge?-Math.ceil((edge-active.y)/5):active.y>height-edge?Math.ceil((active.y-height+edge)/5):0;
    if(speed){win.scrollBy(0,Math.max(-12,Math.min(12,speed)));updateTarget();}
    frame=raf(scrollFrame);
  }
  function lift(){
    active.lifted=true;ignoreClick=true;
    const ghost=active.source.cloneNode(true);
    ghost.removeAttribute('id');ghost.removeAttribute('data-tile');ghost.removeAttribute('data-slot');
    ghost.removeAttribute('aria-pressed');ghost.setAttribute('aria-hidden','true');ghost.setAttribute('tabindex','-1');
    ghost.classList.remove('selected','placed');ghost.classList.add('drag-ghost');
    ghost.style.width=`${active.rect.width}px`;ghost.style.height=`${active.rect.height}px`;
    doc.body.append(ghost);active.ghost=ghost;active.source.classList.add('is-lifted');
    root.classList.add('dragging-tablet');moveGhost();updateTarget();
    announce('Tablet lifted. Drag to a timeline space.');frame=raf(scrollFrame);
  }
  function cleanup(){
    const old=active;if(!old)return null;
    clearTarget();active=null;
    if(frame!==null)caf(frame);frame=null;
    old.source.classList.remove('is-lifted');old.ghost?.remove();root.classList.remove('dragging-tablet');
    try{if(old.source.hasPointerCapture(old.pointerId))old.source.releasePointerCapture(old.pointerId);}catch{}
    return old;
  }
  function cancel(){const old=cleanup();if(old?.lifted)announce('Tablet returned. Your arrangement is unchanged.');}

  root.addEventListener('pointerdown',e=>{
    if(active||e.isPrimary===false||(e.button!==undefined&&e.button!==0))return;
    ignoreClick=false;
    const source=e.target.closest('[data-tile], .slot.occupied');
    if(!source||!root.contains(source))return;
    const id=resolveTile(source);if(!id)return;
    const rect=source.getBoundingClientRect();
    active={source,id,rect,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,
      offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,touch:e.pointerType==='touch',lifted:false,target:null,key:revision()};
    try{source.setPointerCapture(e.pointerId);}catch{}
  });
  root.addEventListener('pointermove',e=>{
    if(!active||e.pointerId!==active.pointerId)return;
    active.x=e.clientX;active.y=e.clientY;
    if(!active.lifted&&Math.hypot(active.x-active.startX,active.y-active.startY)>=6)lift();
    if(active.lifted){if(e.cancelable)e.preventDefault();moveGhost();updateTarget();}
  });
  root.addEventListener('pointerup',e=>{
    if(!active||e.pointerId!==active.pointerId)return;
    active.x=e.clientX;active.y=e.clientY;
    if(active.lifted)updateTarget();
    const old=cleanup();if(!old.lifted)return;
    if(e.cancelable)e.preventDefault();
    if(old.key!==revision()){announce('The puzzle changed. Please place the tablet again.');return;}
    if(old.target){
      try{onDrop(old.id,Number(old.target.dataset.slot));}catch(error){announce(error.message);}
    }else announce('Tablet returned. Drop inside a timeline space.');
  });
  root.addEventListener('pointercancel',e=>{if(active?.pointerId===e.pointerId)cancel();});
  root.addEventListener('lostpointercapture',e=>{if(active?.pointerId===e.pointerId)cancel();});
  root.addEventListener('contextmenu',e=>{if(e.target.closest('[data-tile], .slot.occupied'))e.preventDefault();});
  doc.addEventListener('keydown',e=>{if(e.key==='Escape')cancel();});
  win.addEventListener('blur',cancel);
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cancel();});
  return {cancel,consumeClick(e){if(ignoreClick&&e.detail!==0){ignoreClick=false;return true;}return false;}};
}
