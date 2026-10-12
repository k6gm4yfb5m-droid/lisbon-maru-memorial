"use client";
import { useEffect, useRef } from "react";

const seaLines=Array.from({length:13},(_,i)=>({
 y:320+i*21,start:40-i*16,end:760+i*16,opacity:.2-i*.01,
 d:`M${40-i*16} ${320+i*21} Q230 ${298+i*21} 400 ${320+i*21} T${760+i*16} ${320+i*21}`,
}));
type WavePulse={x:number;y:number;strength:number;started:number};

/** A quiet field of light, with sea lines that respond without capturing page gestures. */
export default function RitualLight() {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const layer=ref.current,section=layer?.closest("section"),svg=layer?.querySelector("svg");
  if(!layer||!section||!svg)return;
  const paths=Array.from(svg.querySelectorAll<SVGPathElement>(".ritual-sea path"));
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let pulses:WavePulse[]=[],frame=0,inView=true,lastPulse=-Infinity;
  let previous:{x:number;y:number;time:number;id:number}|null=null;
  const restore=()=>{
   paths.forEach((path,i)=>{path.setAttribute("d",seaLines[i].d);path.setAttribute("opacity",String(seaLines[i].opacity));});
  };
  const stop=()=>{cancelAnimationFrame(frame);frame=0;pulses=[];previous=null;restore();};
  const draw=(now:number)=>{
   frame=0;
   if(motion.matches||!inView||document.hidden){stop();return;}
   pulses=pulses.filter(pulse=>now-pulse.started<3200);
   if(!pulses.length){restore();return;}
   paths.forEach((path,i)=>{
    const line=seaLines[i];let energy=0;
    const points=Array.from({length:65},(_,j)=>{
     const second=j>32,t=second?(j-32)/32:j/32,u=1-t;
     const x=second?u*u*400+2*u*t*570+t*t*line.end:u*u*line.start+2*u*t*230+t*t*400;
     const baseY=line.y+(second?44:-44)*u*t;
     let displacement=0;
     for(const pulse of pulses){
      const age=(now-pulse.started)/1000,front=Math.abs(x-pulse.x)-age*245;
      const proximity=Math.exp(-Math.pow((line.y-pulse.y)/145,2));
      const envelope=Math.exp(-age*1.05)*Math.exp(-Math.pow(front/100,2))*proximity;
      displacement+=Math.sin(front/27)*pulse.strength*envelope;
      energy=Math.max(energy,envelope);
     }
     return `${j===0?"M":"L"}${x.toFixed(2)} ${(baseY+Math.max(-22,Math.min(22,displacement))).toFixed(2)}`;
    });
    path.setAttribute("d",points.join(" "));
    path.setAttribute("opacity",String(line.opacity+energy*.16));
   });
   frame=requestAnimationFrame(draw);
  };
  const disturb=(clientX:number,clientY:number,strength:number)=>{
   if(motion.matches||!inView||document.hidden)return;
   const now=performance.now();if(now-lastPulse<65)return;
   const matrix=svg.getScreenCTM();if(!matrix)return;
   const point=new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());
   pulses.push({x:Math.max(0,Math.min(800,point.x)),y:Math.max(320,Math.min(572,point.y)),strength,started:now});
   pulses=pulses.slice(-6);lastPulse=now;
   if(!frame)frame=requestAnimationFrame(draw);
  };
  const pointer=(event:PointerEvent)=>{
   const now=performance.now(),distance=previous&&previous.id===event.pointerId&&now-previous.time<160
    ?Math.hypot(event.clientX-previous.x,event.clientY-previous.y):10;
   previous={x:event.clientX,y:event.clientY,time:now,id:event.pointerId};
   disturb(event.clientX,event.clientY,8+Math.min(12,distance*.3));
  };
  const wheel=(event:WheelEvent)=>disturb(event.clientX,event.clientY,8+Math.min(10,Math.abs(event.deltaY)*.08));
  const leave=()=>{previous=null;};
  const visibility=()=>{if(document.hidden)stop();};
  const observer=typeof IntersectionObserver==="undefined"?null:new IntersectionObserver(([entry])=>{
   inView=entry.isIntersecting;if(!inView)stop();
  });
  observer?.observe(section);
  section.addEventListener("pointermove",pointer,{passive:true});
  section.addEventListener("pointerdown",pointer,{passive:true});
  section.addEventListener("pointerleave",leave,{passive:true});
  section.addEventListener("pointercancel",leave,{passive:true});
  section.addEventListener("wheel",wheel,{passive:true});
  motion.addEventListener("change",stop);
  document.addEventListener("visibilitychange",visibility);
  return()=>{
   stop();observer?.disconnect();
   section.removeEventListener("pointermove",pointer);section.removeEventListener("pointerdown",pointer);
   section.removeEventListener("pointerleave",leave);section.removeEventListener("pointercancel",leave);
   section.removeEventListener("wheel",wheel);motion.removeEventListener("change",stop);
   document.removeEventListener("visibilitychange",visibility);
  };
 },[]);
 return <div ref={ref} className="ritual-light" aria-hidden="true"><svg viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice">
  <defs>
   <radialGradient id="ritual-glow"><stop stopColor="#e9dfbf" stopOpacity=".48"/><stop offset=".28" stopColor="#b9d8cd" stopOpacity=".1"/><stop offset="1" stopColor="#b9d8cd" stopOpacity="0"/></radialGradient>
   <linearGradient id="ritual-reflection" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ede2bf" stopOpacity=".45"/><stop offset="1" stopColor="#ede2bf" stopOpacity="0"/></linearGradient>
  </defs>
  <circle className="ritual-aura" cx="400" cy="215" r="200" fill="url(#ritual-glow)"/>
  <g className="ritual-orbits" fill="none" stroke="#c6d6ce" strokeWidth=".65">
   <circle cx="400" cy="215" r="92" opacity=".17"/><circle cx="400" cy="215" r="151" opacity=".12"/><circle cx="400" cy="215" r="212" opacity=".07"/>
  </g>
  <path d="M400 190 L400 242 M374 215 L426 215" stroke="#efdfba" strokeWidth=".7" opacity=".65"/>
  <circle cx="400" cy="215" r="3" fill="#fff2d5"/>
  {Array.from({length:38},(_,i)=>{const angle=i*2.39996,r=60+((i*43)%183);return <circle key={i} className="ritual-spark" cx={(400+Math.cos(angle)*r).toFixed(4)} cy={(215+Math.sin(angle)*r*.78).toFixed(4)} r={i%4===0?1.6:.9} fill={i%3===0?"#e0c79b":"#c0d6d2"} style={{animationDelay:`${-i*.37}s`}}/>;})}
  <path d="M399 292 L371 590 L429 590 L401 292 Z" fill="url(#ritual-reflection)" opacity=".18"/>
  <g className="ritual-sea" fill="none" stroke="#bad4cf" strokeWidth=".7">
   {seaLines.map((line,i)=><path key={i} d={line.d} opacity={line.opacity}/>)}
  </g>
 </svg></div>;
}
