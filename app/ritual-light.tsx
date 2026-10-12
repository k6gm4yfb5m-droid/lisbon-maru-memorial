"use client";
import { useEffect, useRef } from "react";

const seaLines=Array.from({length:13},(_,i)=>({
 y:320+i*21,start:40-i*16,end:760+i*16,opacity:.2-i*.01,
 d:`M${40-i*16} ${320+i*21} Q230 ${298+i*21} 400 ${320+i*21} T${760+i*16} ${320+i*21}`,
}));
/** A still blue sea that responds only to movement across the cover. */
export default function RitualLight() {
 const ref=useRef<HTMLDivElement>(null),waterRef=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const layer=ref.current,section=layer?.closest("section"),svg=layer?.querySelector("svg"),canvas=waterRef.current;
  const context=canvas?.getContext("2d");
  if(!layer||!section||!svg||!canvas||!context)return;
  const paths=Array.from(svg.querySelectorAll<SVGPathElement>(".ritual-sea path"));
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0,lastFrame=0,inView=true,width=0,height=0;
  let current=new Float32Array(0),previous=new Float32Array(0),image:ImageData;
  let pointer:{x:number;y:number;time:number}|null=null;
  const restore=()=>paths.forEach((path,i)=>path.setAttribute("d",seaLines[i].d));
  const stop=()=>{
   cancelAnimationFrame(frame);frame=0;lastFrame=0;pointer=null;
   current.fill(0);previous.fill(0);context.clearRect(0,0,width,height);
   canvas.dataset.active="false";restore();
  };
  const resize=()=>{
   stop();const bounds=section.getBoundingClientRect();
   width=Math.max(40,Math.min(240,Math.ceil(bounds.width/6)));
   height=Math.max(30,Math.ceil(width*bounds.height/Math.max(1,bounds.width)));
   canvas.width=width;canvas.height=height;
   current=new Float32Array(width*height);previous=new Float32Array(width*height);
   image=context.createImageData(width,height);
  };
  const draw=(now:number)=>{
   frame=0;if(motion.matches||!inView||document.hidden){stop();return;}
   if(now-lastFrame>=30){
    lastFrame=now;let amplitude=0;
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
     const i=y*width+x;
     const value=((current[i-1]+current[i+1]+current[i-width]+current[i+width])*.5-previous[i])*.96;
     previous[i]=value;amplitude=Math.max(amplitude,Math.abs(value));
    }
    const swap=current;current=previous;previous=swap;
    if(amplitude<.005){stop();return;}
    image.data.fill(0);
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
     const i=y*width+x,pixel=i*4;
     const slope=(current[i-1]-current[i+1])*.65+(current[i-width]-current[i+width])*.9;
     // Reflections change only the lightness of the existing blue water.
     const light=slope>0;
     image.data[pixel]=light?105:5;image.data[pixel+1]=light?145:18;image.data[pixel+2]=light?180:31;
     image.data[pixel+3]=Math.min(70,Math.abs(slope)*125);
    }
    context.putImageData(image,0,0);
    const bounds=section.getBoundingClientRect(),matrix=svg.getScreenCTM();
    if(matrix)paths.forEach((path,i)=>{
     const line=seaLines[i];
     const points=Array.from({length:65},(_,j)=>{
      const second=j>32,t=second?(j-32)/32:j/32,u=1-t;
      const x=second?u*u*400+2*u*t*570+t*t*line.end:u*u*line.start+2*u*t*230+t*t*400;
      const baseY=line.y+(second?44:-44)*u*t;
      const gx=Math.round((matrix.a*x+matrix.c*baseY+matrix.e-bounds.left)/bounds.width*(width-1));
      const gy=Math.round((matrix.b*x+matrix.d*baseY+matrix.f-bounds.top)/bounds.height*(height-1));
      const displacement=gx>0&&gx<width-1&&gy>0&&gy<height-1?current[gy*width+gx]*7:0;
      return `${j===0?"M":"L"}${x.toFixed(2)} ${(baseY+displacement).toFixed(2)}`;
     });path.setAttribute("d",points.join(" "));
    });
   }
   frame=requestAnimationFrame(draw);
  };
  const disturb=(event:PointerEvent)=>{
   if(motion.matches||!inView||document.hidden)return;
   const now=performance.now(),bounds=section.getBoundingClientRect();
   const x=(event.clientX-bounds.left)/bounds.width*(width-1),y=(event.clientY-bounds.top)/bounds.height*(height-1);
   const last=pointer&&now-pointer.time<180?pointer:null;
   const distance=last?Math.hypot(x-last.x,y-last.y):1;
   pointer={x,y,time:now};if(distance<.15)return;
   const steps=Math.max(1,Math.min(12,Math.ceil(distance/2))),radius=3.5,strength=Math.min(1.2,.32+distance*.055);
   for(let step=1;step<=steps;step++){
    const px=last?last.x+(x-last.x)*step/steps:x,py=last?last.y+(y-last.y)*step/steps:y;
    for(let gy=Math.max(1,Math.floor(py-radius*2));gy<Math.min(height-1,py+radius*2);gy++)
     for(let gx=Math.max(1,Math.floor(px-radius*2));gx<Math.min(width-1,px+radius*2);gx++){
      const impulse=strength*Math.exp(-((gx-px)**2+(gy-py)**2)/(radius*radius));
      const i=gy*width+gx;current[i]+=impulse;previous[i]+=impulse;
     }
   }
   canvas.dataset.active="true";if(!frame)frame=requestAnimationFrame(draw);
  };
  const leave=()=>{pointer=null;};
  const visibility=()=>{if(document.hidden)stop();};
  const preference=()=>{if(motion.matches)stop();};
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(!inView)stop();});
  const sizeObserver=new ResizeObserver(resize);
  resize();observer.observe(section);sizeObserver.observe(section);
  section.addEventListener("pointermove",disturb,{passive:true});
  section.addEventListener("pointerleave",leave,{passive:true});
  section.addEventListener("pointercancel",leave,{passive:true});
  motion.addEventListener("change",preference);document.addEventListener("visibilitychange",visibility);
  return()=>{stop();observer.disconnect();sizeObserver.disconnect();section.removeEventListener("pointermove",disturb);section.removeEventListener("pointerleave",leave);section.removeEventListener("pointercancel",leave);motion.removeEventListener("change",preference);document.removeEventListener("visibilitychange",visibility);};
 },[]);
 return <><canvas ref={waterRef} className="cover-water" data-active="false" aria-hidden="true"/><div ref={ref} className="ritual-light" aria-hidden="true"><svg viewBox="0 0 800 620" preserveAspectRatio="xMidYMid slice">
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
 </svg></div></>;
}
