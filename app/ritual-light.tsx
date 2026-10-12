"use client";
import { useEffect, useRef } from "react";

const seaLines=Array.from({length:13},(_,i)=>({
 y:320+i*21,start:40-i*16,end:760+i*16,opacity:.2-i*.01,
 d:`M${40-i*16} ${320+i*21} Q230 ${298+i*21} 400 ${320+i*21} T${760+i*16} ${320+i*21}`,
}));
/** Slow ocean swells in the cover's existing blue lines, without capturing gestures. */
export default function RitualLight() {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const layer=ref.current,section=layer?.closest("section"),svg=layer?.querySelector("svg");
  if(!layer||!section||!svg)return;
  const paths=Array.from(svg.querySelectorAll<SVGPathElement>(".ritual-sea path"));
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0,inView=false,lastFrame=0,energy=0,center=400,targetCenter=400;
  const restore=()=>paths.forEach((path,i)=>path.setAttribute("d",seaLines[i].d));
  const stop=()=>{cancelAnimationFrame(frame);frame=0;lastFrame=0;energy=0;restore();};
  const draw=(now:number)=>{
   frame=0;if(motion.matches||!inView||document.hidden){stop();return;}
   if(now-lastFrame>=32){
    const elapsed=lastFrame?Math.min((now-lastFrame)/1000,.1):.032;
    lastFrame=now;energy*=Math.exp(-elapsed*.8);center+=(targetCenter-center)*(1-Math.exp(-elapsed*2));
    const time=now/1000;
    paths.forEach((path,i)=>{
     const line=seaLines[i];
     const points=Array.from({length:65},(_,j)=>{
      const second=j>32,t=second?(j-32)/32:j/32,u=1-t;
      const x=second?u*u*400+2*u*t*570+t*t*line.end:u*u*line.start+2*u*t*230+t*t*400;
      const baseY=line.y+(second?44:-44)*u*t;
      const swell=Math.sin(x/175-time*.65+i*.19)*5+Math.sin(x/280+time*.38+i*.12)*3;
      const response=Math.sin((x-center)/180-time*.9+i*.16)*energy*Math.exp(-Math.pow((x-center)/360,2));
      return `${j===0?"M":"L"}${x.toFixed(2)} ${(baseY+swell+response).toFixed(2)}`;
     });
     path.setAttribute("d",points.join(" "));
    });
   }
   frame=requestAnimationFrame(draw);
  };
  const start=()=>{if(!frame&&inView&&!motion.matches&&!document.hidden)frame=requestAnimationFrame(draw);};
  const disturb=(event:PointerEvent|WheelEvent)=>{
   if(motion.matches||!inView||document.hidden)return;
   const matrix=svg.getScreenCTM();if(!matrix)return;
   const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
   targetCenter=Math.max(0,Math.min(800,point.x));energy=Math.min(10,energy+1.4);start();
  };
  const visibility=()=>{if(document.hidden)stop();else start();};
  const preference=()=>{if(motion.matches)stop();else start();};
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView)start();else stop();});
  observer.observe(section);
  section.addEventListener("pointermove",disturb,{passive:true});
  section.addEventListener("pointerdown",disturb,{passive:true});
  section.addEventListener("wheel",disturb,{passive:true});
  motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);
  return()=>{stop();observer.disconnect();section.removeEventListener("pointermove",disturb);section.removeEventListener("pointerdown",disturb);section.removeEventListener("wheel",disturb);motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);};
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
  <g className="ritual-sea" fill="none" stroke="#69879b" strokeWidth=".7">
   {seaLines.map((line,i)=><path key={i} d={line.d} opacity={line.opacity}/>)}
  </g>
 </svg></div>;
}
