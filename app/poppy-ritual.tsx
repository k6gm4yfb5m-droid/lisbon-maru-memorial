"use client";
import { memo, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import FullscreenView from './fullscreen-view';
import { numberLocales, type Locale } from '@/lib/i18n';
import { poppyTranslations } from '@/lib/poppy-ritual';
const total=828, duration=3400, resetDelay=6000, cellWidth=32, cellHeight=40;
type Phase='ready'|'lighting'|'complete';
// Keep the two rounded red petals, black centre and green stem of the supplied drawing.
function Flower(){return <><path d="M43 74h14v43a7 7 0 0 1-14 0Z" fill="var(--poppy-stem,#73bc6a)"/><ellipse cx="50" cy="30" rx="29" ry="25" fill="var(--poppy-petal,#ed1027)"/><ellipse cx="50" cy="54" rx="29" ry="28" fill="var(--poppy-petal,#ed1027)"/><circle cx="50" cy="44" r="11" fill="var(--poppy-centre,#080b0e)"/></>;}
function Poppy({className}:{className?:string}){return <svg className={className} viewBox="0 0 100 124" aria-hidden="true" focusable="false"><Flower/></svg>;}
function delay(index:number,columns:number){const rows=Math.ceil(total/columns);return ((index%columns)/(columns-1)*.72+Math.abs(Math.floor(index/columns)-(rows-1)/2)/((rows-1)/2)*.28)*2400;}
const PoppyField=memo(function PoppyField({phase,cycle,label,onColumns}:{phase:Phase;cycle:number;label:string;onColumns:(columns:number)=>void}){
 const ref=useRef<HTMLDivElement>(null),id=useId().replaceAll(':',''),[columns,setColumns]=useState(46);
 useEffect(()=>{const element=ref.current;if(!element)return;const resize=new ResizeObserver(([entry])=>{const ratio=entry.contentRect.width/Math.max(1,entry.contentRect.height);const next=[23,36,46,69].reduce((best,value)=>Math.abs(Math.log(value*cellWidth/(total/value*cellHeight)/ratio))<Math.abs(Math.log(best*cellWidth/(total/best*cellHeight)/ratio))?value:best,46);setColumns(next);onColumns(next);});resize.observe(element);return()=>resize.disconnect();},[onColumns]);
 const flowers=useMemo(()=>Array.from({length:total},(_,i)=><use key={i} className="poppy-field-flower" href={`#poppy-${id}`} x={(i%columns)*cellWidth+5} y={Math.floor(i/columns)*cellHeight+6} width="22" height="28" style={{'--poppy-delay':`${delay(i,columns)}ms`} as CSSProperties}/>),[columns,id]);
 return <div ref={ref} className="poppy-field" data-phase={phase}><svg key={cycle} viewBox={`0 0 ${columns*cellWidth} ${Math.ceil(total/columns)*cellHeight}`} role="img" aria-label={label}><defs><symbol id={`poppy-${id}`} viewBox="15 0 70 126"><Flower/></symbol></defs>{flowers}</svg></div>;
});
export default function PoppyRitual({locale}:{locale:Locale}){
 const t=poppyTranslations[locale],drop=useRef<HTMLDivElement>(null),columns=useRef(46),[phase,setPhase]=useState<Phase>('ready'),[cycle,setCycle]=useState(0),[count,setCount]=useState(0),[dragging,setDragging]=useState(false),[over,setOver]=useState(false),[offset,setOffset]=useState({x:0,y:0}),[remaining,setRemaining]=useState(resetDelay/1000);
 const gesture=useRef<{id:number;x:number;y:number;cx:number;cy:number;halfWidth:number;halfHeight:number;scale:number;moved:boolean;placed:boolean;withdrawn:boolean;left:number;top:number}|null>(null),ignoreClick=useRef(false);
 const phaseRef=useRef<Phase>('ready');
 const changePhase=(next:Phase)=>{phaseRef.current=next;setPhase(next);};
 const onColumns=useRef((value:number)=>{columns.current=value;}).current;
 const reset=(keepPosition=false)=>{changePhase('ready');setCount(0);setRemaining(resetDelay/1000);setOver(false);if(!keepPosition)setOffset({x:0,y:0});};
 const offer=(keepPosition=false)=>{if(phaseRef.current!=='ready')return;setCount(0);setCycle(value=>value+1);changePhase('lighting');setOver(false);if(!keepPosition)setOffset({x:0,y:0});};
 useEffect(()=>{
  if(phase!=='lighting')return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setCount(total);changePhase('complete');return;}
  let frame=0;const start=performance.now();const thresholds=Array.from({length:total},(_,i)=>delay(i,columns.current)+700).sort((a,b)=>a-b);
  const tick=(now:number)=>{if(phaseRef.current!=='lighting')return;const elapsed=now-start;let lit=0;while(lit<total&&thresholds[lit]<=elapsed)lit++;setCount(lit);if(elapsed>=duration){setCount(total);changePhase('complete');}else frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[phase,cycle]);
 useEffect(()=>{const reset=()=>{ignoreClick.current=!!gesture.current;gesture.current=null;setDragging(false);setOver(false);setOffset({x:0,y:0});};window.addEventListener('blur',reset);return()=>window.removeEventListener('blur',reset);},[]);
 // Start the next offering six seconds after the full field has lit up.
 // A deadline also catches up correctly after the tab has been in the background.
 useEffect(()=>{
  if(phase!=='complete')return;
  const deadline=Date.now()+resetDelay;
  setRemaining(resetDelay/1000);
  const tick=()=>{const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));setRemaining(seconds);if(!seconds&&!gesture.current){changePhase('ready');setCount(0);setOffset({x:0,y:0});}};
  const interval=window.setInterval(tick,250),timeout=window.setTimeout(tick,resetDelay);
  document.addEventListener('visibilitychange',tick);
  return()=>{clearInterval(interval);clearTimeout(timeout);document.removeEventListener('visibilitychange',tick);};
 },[phase]);
 function inside(cx:number,cy:number,halfWidth:number,halfHeight:number){
  const r=drop.current?.getBoundingClientRect();
  // Compare the flower itself with the whole target, rather than a tiny pointer hotspot.
  const padding=12;
  return !!r&&cx+halfWidth*.55>=r.left-padding&&cx-halfWidth*.55<=r.right+padding&&cy+halfHeight*.55>=r.top-padding&&cy-halfHeight*.55<=r.bottom+padding;
 }
 function down(event:PointerEvent<HTMLButtonElement>){
  if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
  const r=event.currentTarget.getBoundingClientRect();
  gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,cx:r.left+r.width/2,cy:r.top+r.height/2,halfWidth:r.width/2,halfHeight:r.height/2,scale:r.width/event.currentTarget.offsetWidth||1,moved:false,placed:phaseRef.current!=='ready',withdrawn:false,left:event.currentTarget.offsetLeft,top:event.currentTarget.offsetTop};
  ignoreClick.current=false;event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);
 }
 function withinPlacement(cx:number,cy:number){
  const r=drop.current?.getBoundingClientRect();
  // Insertion is forgiving; withdrawal only needs to leave the centre of the silhouette.
  return !!r&&Math.abs(cx-(r.left+r.width/2))<=r.width*.18&&Math.abs(cy-(r.top+r.height/2))<=r.height*.18;
 }
 function move(event:PointerEvent<HTMLButtonElement>){
  const start=gesture.current;if(!start||start.id!==event.pointerId)return;
  const x=event.clientX-start.x,y=event.clientY-start.y;
  start.moved||=Math.hypot(x,y)>3;
  const placed=withinPlacement(start.cx+x,start.cy+y);
  // Change the offering during the gesture, without waiting for pointer release.
  if(start.moved&&start.placed&&!placed){start.placed=false;start.withdrawn=true;reset(true);}
  else if(start.moved&&!start.placed&&placed){start.placed=true;offer(true);}
  setOffset({x:x/start.scale,y:y/start.scale});
  setOver(placed);
 }
 function end(event:PointerEvent<HTMLButtonElement>,cancel=false){
  const start=gesture.current;if(!start||start.id!==event.pointerId)return;
  gesture.current=null;ignoreClick.current=start.moved||cancel;setDragging(false);setOffset({x:0,y:0});setOver(false);
  if(cancel||!start.moved)return;
  const cx=start.cx+event.clientX-start.x,cy=start.cy+event.clientY-start.y;
  if(phaseRef.current==='ready'){if(start.withdrawn?withinPlacement(cx,cy):inside(cx,cy,start.halfWidth,start.halfHeight))offer();}
  else if(!withinPlacement(cx,cy))reset();
 }
 return <section id="poppy-ritual" className="poppy-ritual" aria-labelledby="poppy-ritual-title">
  <div className="poppy-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="poppy-ritual-title">{t.title}</h2><p>{t.intro}</p></div>
  <FullscreenView locale={locale} title={t.nav} kind="poppy">
  <div className="poppy-workspace" data-phase={phase}>
   <div className="poppy-offering"><p className="poppy-instruction" id="poppy-instruction">{t.instruction}</p>
    <div className="poppy-drag-scene" dir="ltr" data-dragging={dragging} data-filled={phase!=='ready'}>
     <div ref={drop} className="poppy-drop-target" data-over={over} data-filled={phase!=='ready'}><Poppy/><span>{phase==='ready'?t.drop:''}</span></div>
     <button type="button" className="poppy-drag-flower" aria-label={phase==='ready'?t.offer:t.withdraw} aria-describedby="poppy-instruction" style={{transform:`translate(${offset.x}px,${offset.y}px)`,...(dragging&&gesture.current?{left:gesture.current.left,top:gesture.current.top}:{})}} onPointerDown={down} onPointerMove={move} onPointerUp={event=>end(event)} onPointerCancel={event=>end(event,true)} onLostPointerCapture={event=>{if(gesture.current)end(event,true);}} onTouchStart={event=>event.stopPropagation()} onClick={()=>{if(ignoreClick.current){ignoreClick.current=false;return;}if(phase==='ready')offer();else reset();}} onKeyDown={event=>{if(event.key==='Escape'&&gesture.current){gesture.current=null;ignoreClick.current=true;setDragging(false);setOffset({x:0,y:0});setOver(false);}}}><Poppy/></button>
    </div>
   </div>
   <div className="poppy-remembrance"><PoppyField phase={phase} cycle={cycle} label={t.field} onColumns={onColumns}/></div><div className="poppy-field-footer"><div className="poppy-count" aria-hidden="true"><strong>{count.toLocaleString(numberLocales[locale])}<span> / {total.toLocaleString(numberLocales[locale])}</span></strong><small>{t.count}</small></div><p className="poppy-status" role="status">{phase==='complete'?t.complete:phase==='lighting'?t.lighting:'\u00a0'}</p><p className="poppy-reset-note" aria-hidden="true">{phase==='complete'?t.resetIn.replace('{seconds}',remaining.toLocaleString(numberLocales[locale])):'\u00a0'}</p></div>
  </div>
  </FullscreenView>
 </section>;
}
