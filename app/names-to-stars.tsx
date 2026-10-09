"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FullscreenView from "./fullscreen-view";
import { Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import { memorialRecords as records } from "@/lib/units";
import { formatNumber, formatText, type Locale } from "@/lib/i18n";
import { arrivedNames, NAME_INTERVAL, NAME_JOURNEY, starTranslations } from "@/lib/names-to-stars";
import { personDisplay } from "@/lib/person-display";

const TAU = Math.PI * 2;
function seed(value:string) {
 let hash=2166136261;
 for(const char of value)hash=Math.imul(hash^char.charCodeAt(0),16777619);
 hash=Math.imul(hash^(hash>>>16),0x85ebca6b);
 hash=Math.imul(hash^(hash>>>13),0xc2b2ae35);
 return ((hash^(hash>>>16))>>>0)/4294967296;
}
// A stable shuffle gives every source record one turn without alphabetic ordering.
const sky = [...records].sort((a,b)=>seed(`procession:${a.id}`)-seed(`procession:${b.id}`)).map((person, index) => {
 const angle = seed(person.id)*TAU;
 const radius = Math.pow(seed(`${person.id}:radius`),.7);
 return {person, x:Math.cos(angle)*radius, y:Math.sin(angle)*radius, size:.65 + (index % 9)/9, phase:angle};
});

type Person = typeof records[number];
type NameLayout={x:number;y:number;width:number;height:number;fontSize:number;lineHeight:number;alpha:number;lines:string[]};
function placeName(button:HTMLButtonElement,layout:NameLayout) {
 Object.assign(button.style,{transform:`translate3d(${layout.x}px,${layout.y}px,0) translate(-50%,-50%)`,width:`${layout.width}px`,height:`${layout.height}px`,fontSize:`${layout.fontSize}px`,lineHeight:`${layout.lineHeight}px`,opacity:String(layout.alpha),visibility:layout.alpha>.07?"visible":"hidden"});
 const text=layout.lines.join("\n");
 if(button.textContent!==text)button.textContent=text;
}

export default function NamesToStars({locale,onReadPerson,detailsOpen}:{locale:Locale;onReadPerson:(person:Person)=>void;detailsOpen:boolean}) {
 const t = starTranslations[locale];
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const elapsed = useRef(0);
 const buttons = useRef(new Map<number,HTMLButtonElement>());
 const nameLayouts = useRef(new Map<number,NameLayout>());
 const activeRange=useRef("");
 const [activeNames,setActiveNames]=useState<number[]>([]);
 const [hovered,setHovered]=useState(false);
 const [focused,setFocused]=useState(false);
 const [paused,setPaused] = useState(false);
 const [staticSky,setStaticSky] = useState(false);
 const [count,setCount] = useState(0);
 const [restart,setRestart] = useState(0);
 const [canvasAvailable,setCanvasAvailable] = useState(true);
 const motion = useRef({paused,staticSky,hovered,focused,detailsOpen});
 const renderer = useRef<{refresh:()=>void;reset:()=>void}|null>(null);

 useLayoutEffect(()=>{
  motion.current={paused,staticSky,hovered,focused,detailsOpen};
  renderer.current?.refresh();
 },[paused,staticSky,hovered,focused,detailsOpen,restart]);

 useLayoutEffect(()=>{
  buttons.current.forEach((button,index)=>{const layout=nameLayouts.current.get(index);if(layout)placeName(button,layout);});
 },[activeNames,locale]);

 useEffect(()=> {
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const respectMotion = () => {if(preference.matches) setStaticSky(true);};
  respectMotion();
  preference.addEventListener("change",respectMotion);
  return ()=>preference.removeEventListener("change",respectMotion);
 },[]);

 useEffect(()=> {
  const canvas=canvasRef.current;
  const ctx=canvas?.getContext("2d");
  if(!canvas || !ctx) {setCanvasAvailable(false);return;}
  let width=0,height=0,frame=0,visible=false,previous=0,lastCount=-1;
  const preference=matchMedia("(prefers-reduced-motion: reduce)");
  const finish=(records.length-1)*NAME_INTERVAL+NAME_JOURNEY;
  const geometry=new Map<number,{x:number;y:number;width:number;height:number;fontSize:number;lineHeight:number;lines:string[]}>();
  let paintedTime=-1,paintedStatic:boolean|undefined;

  function draw(force=false) {
   if(!ctx || !width || !height) return;
   const time=elapsed.current;
   const {staticSky}=motion.current;
   if(!force&&time===paintedTime&&staticSky===paintedStatic)return;
   const reducedMotion=preference.matches;
   const total=staticSky ? records.length : arrivedNames(time,records.length);
   if(lastCount!==total) {lastCount=total;setCount(total);}
   canvas!.dataset.starCount=String(total);
   canvas!.dataset.elapsed=String(Math.round(time));
   const cx=width*.5, cy=height*.48;
   ctx.clearRect(0,0,width,height);
   const field=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(width,height)*.66);
   field.addColorStop(0,"#294b54");field.addColorStop(.27,"#173740");field.addColorStop(1,"#0b222a");
   ctx.fillStyle=field;ctx.fillRect(0,0,width,height);

   const spreadX=Math.min(width*.24,230),spreadY=Math.min(height*.21,115);
   // Set a name's lane once. Its x coordinate is shared with its final star.
   const layoutFor=(index:number)=>{
    const cached=geometry.get(index);if(cached)return cached;
    const star=sky[index],fontSize=width<600?16:20,lineHeight=fontSize+4;
    ctx.font=`${fontSize}px Georgia, "Times New Roman", serif`;
    let lines=[personDisplay(star.person).name];
    if(ctx.measureText(lines[0]).width>width*.4&&lines[0].includes(",")){
     const comma=lines[0].indexOf(",");lines=[lines[0].slice(0,comma+1),lines[0].slice(comma+1).trim()];
    }
    const textWidth=Math.min(width-28,Math.max(...lines.map(line=>ctx.measureText(line).width)));
    const layout={x:Math.max(textWidth/2+14,Math.min(width-textWidth/2-14,cx+star.x*spreadX)),y:cy+star.y*spreadY,width:textWidth+14,height:Math.max(44,lineHeight*lines.length+8),fontSize,lineHeight,lines};
    geometry.set(index,layout);return layout;
   };
   if(total) {
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,spreadX*1.3);
    glow.addColorStop(0,`rgba(204,194,151,${.025+total/records.length*.07})`);glow.addColorStop(1,"rgba(204,194,151,0)");
    ctx.fillStyle=glow;ctx.fillRect(cx-spreadX*1.3,cy-spreadX*1.3,spreadX*2.6,spreadX*2.6);
   }
   for(let index=0;index<total;index++) {
    const star=sky[index],{x,y}=layoutFor(index);
    const age=staticSky?1:Math.min(1,(time-index*NAME_INTERVAL-NAME_JOURNEY)/800);
    const shimmer=staticSky || reducedMotion ? .8 : .74+.12*Math.sin(time/2800+star.phase);
    ctx.globalAlpha=(.55+age*.45)*shimmer;
    ctx.fillStyle=index%4===0?"#dcc49c":"#e7eee7";
    const radius=star.size*2.1;
    const alpha=ctx.globalAlpha;
    ctx.globalAlpha=alpha*.12;ctx.beginPath();ctx.arc(x,y,radius*2.3,0,TAU);ctx.fill();
    ctx.globalAlpha=alpha;ctx.beginPath();ctx.arc(x,y,radius,0,TAU);ctx.fill();
    if(index%23===0) {
     ctx.globalAlpha*=.3;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(x+6,y);ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.strokeStyle="#d9c5a3";ctx.lineWidth=.6;ctx.stroke();
    }
   }
   ctx.globalAlpha=1;

   const last=staticSky ? -1 : Math.min(records.length-1,Math.floor(time/NAME_INTERVAL));
   const range=`${total}:${last}`;
   if(range!==activeRange.current) {
    activeRange.current=range;
    setActiveNames(Array.from({length:Math.max(0,last-total+1)},(_,index)=>index+total));
   }
   nameLayouts.current.clear();
   if(!staticSky) {
    // A shorter visible journey on narrow screens keeps names readable, while the
    // record order, arrival time and final 817-star count remain unchanged.
    const journey=width<600?Math.min(1600,height*6):Math.min(2800,NAME_JOURNEY);
    for(let index=total;index<=last;index++) {
     const p=(time-index*NAME_INTERVAL-(NAME_JOURNEY-journey))/journey;
     if(p<0||p>=1){const button=buttons.current.get(index);if(button)button.style.visibility="hidden";continue;}
     const fixed=layoutFor(index);
     const progress=p*p*(3-2*p);
     const originY=-fixed.height/2;
     const y=originY+(fixed.y-originY)*progress;
     // Fade in only after the complete name has entered the canvas.
     const entryAlpha=Math.min(1,Math.max(0,(y-fixed.height/2)/18));
     const alpha=entryAlpha*Math.min(1,p/.15)*Math.min(1,(1-p)/.22);
     const trailProgress=Math.max(0,p-.07),trail=trailProgress*trailProgress*(3-2*trailProgress);
     ctx.globalAlpha=alpha*.16;ctx.strokeStyle="#d2bc92";ctx.lineWidth=1;
     ctx.beginPath();ctx.moveTo(fixed.x,originY+(fixed.y-originY)*trail);ctx.lineTo(fixed.x,y);ctx.stroke();
     const layout={...fixed,y,alpha};
     nameLayouts.current.set(index,layout);
     const button=buttons.current.get(index);if(button)placeName(button,layout);
     ctx.globalAlpha=alpha*.6;ctx.beginPath();ctx.arc(fixed.x,y,2.2,0,TAU);ctx.fillStyle="#dcc095";ctx.fill();
     ctx.globalAlpha=1;
    }
   }
   paintedTime=time;paintedStatic=staticSky;
  }

  function tick(now:number) {
   if(previous) elapsed.current=Math.min(finish,elapsed.current+Math.min(100,now-previous));
   previous=now;draw();
   if(elapsed.current<finish)frame=requestAnimationFrame(tick);else previous=0;
  }
  function sync() {
   cancelAnimationFrame(frame);previous=0;
   draw();
   const {paused,staticSky,hovered,focused,detailsOpen}=motion.current;
   if(visible&&!document.hidden&&!paused&&!staticSky&&!hovered&&!focused&&!detailsOpen&&elapsed.current<finish) frame=requestAnimationFrame(tick);
  }
  renderer.current={refresh:sync,reset:()=>{geometry.clear();paintedTime=-1;activeRange.current="";}};
  const size=new ResizeObserver(entries=> {
   const rect=entries[0].contentRect;
   if(width!==rect.width||height!==rect.height){geometry.clear();}
   width=rect.width;height=rect.height;
   const dpr=Math.min(devicePixelRatio||1,2);
   const pixelsX=Math.round(width*dpr),pixelsY=Math.round(height*dpr);
   if(canvas.width!==pixelsX)canvas.width=pixelsX;
   if(canvas.height!==pixelsY)canvas.height=pixelsY;
   ctx.setTransform(dpr,0,0,dpr,0,0);draw(true);
  });
  size.observe(canvas);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.12});
  intersection.observe(canvas);
  document.addEventListener("visibilitychange",sync);
  return ()=> {cancelAnimationFrame(frame);renderer.current=null;size.disconnect();intersection.disconnect();document.removeEventListener("visibilitychange",sync);};
 },[]);

 function replay() {elapsed.current=0;renderer.current?.reset();setCount(0);setStaticSky(false);setPaused(false);setRestart(value=>value+1);}
 const completed=count===records.length;
 const total=formatNumber(records.length,locale);
 return <section className="names-stars-section" id="names-to-stars" aria-labelledby="names-stars-title">
  <div className="names-stars-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="names-stars-title">{t.title}</h2><p>{t.intro} {t.interaction}</p></div>
  <div className="names-stars-panel">
   <FullscreenView locale={locale} title={t.title} kind="stars">
   <div className="names-stars-stage">
    <canvas ref={canvasRef} className="names-stars-canvas" role="img" aria-label={t.description}/>
    <div className="names-stars-name-layer" onPointerLeave={()=>setHovered(false)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}>
     {activeNames.map(index=>{const person=sky[index].person,name=personDisplay(person).name;return <button type="button" key={person.id} className="names-stars-name" data-person-id={person.id} data-name={name} aria-label={formatText(t.read,{name})} ref={button=>{if(button)buttons.current.set(index,button);else buttons.current.delete(index);}} onPointerEnter={()=>setHovered(true)} onPointerLeave={()=>setHovered(false)} onFocus={event=>setFocused(event.currentTarget.matches(":focus-visible"))} onClick={event=>{event.currentTarget.focus({preventScroll:true});onReadPerson(person);}}>{name}</button>;})}
    </div>
   </div>
   {!canvasAvailable&&<p className="names-stars-fallback">{t.description}</p>}
   <div className="names-stars-footer">
    <p className="names-stars-progress">{formatText(completed?t.complete:t.progress,{count:formatNumber(count,locale),total})}</p>
    <div className="names-stars-controls">
     {!staticSky&&<button type="button" onClick={completed?replay:()=>setPaused(value=>!value)} data-action="play">{completed?<RotateCcw size={16}/>:paused?<Play size={16}/>:<Pause size={16}/>} {completed?t.replay:paused?t.play:t.pause}</button>}
     <button type="button" onClick={()=>setStaticSky(value=>!value)} aria-pressed={staticSky} data-action="sky"><Sparkles size={16}/>{staticSky?t.animate:t.static}</button>
     {!staticSky&&!completed&&<button type="button" onClick={replay} data-action="replay"><RotateCcw size={16}/>{t.replay}</button>}
    </div>
   </div>
   </FullscreenView>
  </div>
  <p className="names-stars-note">{formatText(t.note,{total})}</p>
  <div className="sr-only"><h3>{t.list}</h3><ul>{records.map(person=><li key={person.id}>{personDisplay(person).name}</li>)}</ul></div>
 </section>;
}
