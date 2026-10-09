"use client";
import { memo, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import FullscreenView from './fullscreen-view';
import { numberLocales, type Locale } from '@/lib/i18n';
import { poppyTranslations } from '@/lib/poppy-ritual';
const total=828, duration=3400, cellWidth=32, cellHeight=40;
type Phase='ready'|'lighting'|'complete';
// Keep the two rounded red petals, black centre and green stem of the supplied drawing.
function Flower(){return <><path d="M43 74h14v43a7 7 0 0 1-14 0Z" fill="var(--poppy-stem,#73bc6a)"/><ellipse cx="50" cy="30" rx="29" ry="25" fill="var(--poppy-petal,#ed1027)"/><ellipse cx="50" cy="54" rx="29" ry="28" fill="var(--poppy-petal,#ed1027)"/><circle cx="50" cy="44" r="11" fill="var(--poppy-centre,#080b0e)"/></>;}
function Poppy({className}:{className?:string}){return <svg className={className} viewBox="0 0 100 124" aria-hidden="true" focusable="false"><Flower/></svg>;}
function delay(index:number,columns:number){const rows=Math.ceil(total/columns);return ((index%columns)/(columns-1)*.72+Math.abs(Math.floor(index/columns)-(rows-1)/2)/((rows-1)/2)*.28)*2400;}
const PoppyField=memo(function PoppyField({phase,label,onColumns}:{phase:Phase;label:string;onColumns:(columns:number)=>void}){
 const ref=useRef<HTMLDivElement>(null),id=useId().replaceAll(':',''),[columns,setColumns]=useState(46);
 useEffect(()=>{const element=ref.current;if(!element)return;const resize=new ResizeObserver(([entry])=>{const ratio=entry.contentRect.width/Math.max(1,entry.contentRect.height);const next=[23,36,46,69].reduce((best,value)=>Math.abs(Math.log(value*cellWidth/(total/value*cellHeight)/ratio))<Math.abs(Math.log(best*cellWidth/(total/best*cellHeight)/ratio))?value:best,46);setColumns(next);onColumns(next);});resize.observe(element);return()=>resize.disconnect();},[onColumns]);
 const flowers=useMemo(()=>Array.from({length:total},(_,i)=><use key={i} className="poppy-field-flower" href={`#poppy-${id}`} x={(i%columns)*cellWidth+5} y={Math.floor(i/columns)*cellHeight+6} width="22" height="28" style={{'--poppy-delay':`${delay(i,columns)}ms`} as CSSProperties}/>),[columns,id]);
 return <div ref={ref} className="poppy-field" data-phase={phase}><svg viewBox={`0 0 ${columns*cellWidth} ${Math.ceil(total/columns)*cellHeight}`} role="img" aria-label={label}><defs><symbol id={`poppy-${id}`} viewBox="15 0 70 126"><Flower/></symbol></defs>{flowers}</svg></div>;
});
export default function PoppyRitual({locale}:{locale:Locale}){
 const t=poppyTranslations[locale],drop=useRef<HTMLDivElement>(null),columns=useRef(46),[phase,setPhase]=useState<Phase>('ready'),[count,setCount]=useState(0),[dragging,setDragging]=useState(false),[over,setOver]=useState(false),[offset,setOffset]=useState({x:0,y:0});
 const gesture=useRef<{id:number;x:number;y:number;moved:boolean}|null>(null),ignoreClick=useRef(false);
 const onColumns=useRef((value:number)=>{columns.current=value;}).current;
 const offer=()=>{if(phase!=='ready')return;setPhase('lighting');setOver(false);setOffset({x:0,y:0});};
 useEffect(()=>{
  if(phase!=='lighting')return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){setCount(total);setPhase('complete');return;}
  let frame=0;const start=performance.now();const thresholds=Array.from({length:total},(_,i)=>delay(i,columns.current)+700).sort((a,b)=>a-b);
  const tick=(now:number)=>{const elapsed=now-start;let lit=0;while(lit<total&&thresholds[lit]<=elapsed)lit++;setCount(lit);if(elapsed>=duration){setCount(total);setPhase('complete');}else frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[phase]);
 useEffect(()=>{const reset=()=>{ignoreClick.current=!!gesture.current;gesture.current=null;setDragging(false);setOver(false);setOffset({x:0,y:0});};window.addEventListener('blur',reset);return()=>window.removeEventListener('blur',reset);},[]);
 function inside(x:number,y:number){const r=drop.current?.getBoundingClientRect();return !!r&&x>=r.left+r.width*.18&&x<=r.right-r.width*.18&&y>=r.top&&y<=r.top+r.height*.92;}
 function down(event:PointerEvent<HTMLButtonElement>){if(phase!=='ready'||!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};ignoreClick.current=false;event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);}
 function move(event:PointerEvent<HTMLButtonElement>){const start=gesture.current;if(!start||start.id!==event.pointerId)return;const x=event.clientX-start.x,y=event.clientY-start.y;start.moved||=Math.hypot(x,y)>6;setOffset({x,y});setOver(inside(event.clientX,event.clientY));}
 function end(event:PointerEvent<HTMLButtonElement>,cancel=false){const start=gesture.current;if(!start||start.id!==event.pointerId)return;gesture.current=null;ignoreClick.current=start.moved||cancel;setDragging(false);setOffset({x:0,y:0});setOver(false);if(!cancel&&start.moved&&inside(event.clientX,event.clientY))offer();}
 return <section id="poppy-ritual" className="poppy-ritual" aria-labelledby="poppy-ritual-title">
  <div className="poppy-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="poppy-ritual-title">{t.title}</h2><p>{t.intro}</p></div>
  <FullscreenView locale={locale} title={t.nav} kind="poppy">
  <div className="poppy-workspace" data-phase={phase}>
   <div className="poppy-offering"><p className="poppy-instruction" id="poppy-instruction">{t.instruction}</p>
    <div className="poppy-drag-scene" dir="ltr" data-dragging={dragging}>
     <div ref={drop} className="poppy-drop-target" data-over={over} data-filled={phase!=='ready'}><Poppy/><span>{phase==='ready'?t.drop:''}</span></div>
     <button type="button" className="poppy-drag-flower" aria-label={t.offer} aria-describedby="poppy-instruction" disabled={phase!=='ready'} style={{transform:`translate(${offset.x}px,${offset.y}px)`}} onPointerDown={down} onPointerMove={move} onPointerUp={event=>end(event)} onPointerCancel={event=>end(event,true)} onLostPointerCapture={event=>{if(gesture.current)end(event,true);}} onTouchStart={event=>event.stopPropagation()} onClick={()=>{if(ignoreClick.current){ignoreClick.current=false;return;}offer();}} onKeyDown={event=>{if(event.key==='Escape'&&gesture.current){gesture.current=null;ignoreClick.current=true;setDragging(false);setOffset({x:0,y:0});setOver(false);}}}><Poppy/></button>
    </div>
   </div>
   <div className="poppy-remembrance"><PoppyField phase={phase} label={t.field} onColumns={onColumns}/></div><div className="poppy-field-footer"><div className="poppy-count" aria-hidden="true"><strong>{count.toLocaleString(numberLocales[locale])}<span> / {total.toLocaleString(numberLocales[locale])}</span></strong><small>{t.count}</small></div><p className="poppy-status" role="status">{phase==='complete'?t.complete:phase==='lighting'?t.lighting:'\u00a0'}</p><button className="poppy-replay" type="button" disabled={phase!=='complete'} onClick={()=>{setPhase('ready');setCount(0);ignoreClick.current=false;}}><RotateCcw size={15}/>{t.again}</button></div>
  </div>
  </FullscreenView>
 </section>;
}
