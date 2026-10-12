"use client";
import { useEffect, useRef } from "react";

const surfaces=[".intro",".historical-charts",".timeline-stage",".names-stars-stage",".names-stars-footer",".globe-stage",".rescue-map-panel",".topology-canvas",".archive-workspace",".archive-index",".reflection-figure",".sheet-top",".ship-hold-information",".ship-hold-placeholder",".poppy-workspace",".fullscreen-bar",".site-footer"].join(",");
type Ripple={surface:Element;x:number;y:number;started:number;strength:number};

/** Decorative water only: never changes the layout or captures an interaction. */
export default function WaterRipples(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current,context=canvas?.getContext("2d");
  if(!canvas||!context)return;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let ripples:Ripple[]=[],frame=0,lastTime=-Infinity,lastX=-Infinity,lastY=-Infinity;
  const clear=()=>{cancelAnimationFrame(frame);frame=0;ripples=[];context.clearRect(0,0,canvas.width,canvas.height);};
  const resize=()=>{
   const zoom=parseFloat(getComputedStyle(document.body).zoom)||1;
   canvas.style.width=`${innerWidth/zoom}px`;canvas.style.height=`${innerHeight/zoom}px`;
   const ratio=Math.min(devicePixelRatio||1,2),width=Math.round(innerWidth*ratio),height=Math.round(innerHeight*ratio);
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
   context.setTransform(ratio,0,0,ratio,0,0);
  };
  const draw=(now:number)=>{
   frame=0;if(motion.matches||document.hidden){clear();return;}
   resize();context.clearRect(0,0,innerWidth,innerHeight);
   ripples=ripples.filter(ripple=>now-ripple.started<2300&&ripple.surface.isConnected);
   for(const ripple of ripples){
    const bounds=ripple.surface.getBoundingClientRect();
    if(bounds.bottom<0||bounds.top>innerHeight)continue;
    context.save();
    // Clip at every containing panel so rounded corners and nested views stay intact.
    let parent:Element|null=ripple.surface;
    while(parent&&parent!==document.body){
     const style=getComputedStyle(parent);
     if(parent===ripple.surface||/(hidden|clip|auto|scroll)/.test(style.overflow)){
      const r=parent.getBoundingClientRect(),radius=(parseFloat(style.borderTopLeftRadius)||0)*(r.width/Math.max(1,(parent as HTMLElement).offsetWidth||r.width));
      context.beginPath();context.roundRect(r.left,r.top,r.width,r.height,radius);context.clip();
     }
     parent=parent.parentElement;
    }
    // Keep the light paper and flag illustrations clear of the water treatment.
    context.beginPath();context.rect(0,0,innerWidth,innerHeight);
    ripple.surface.querySelectorAll(".reflection-flag,.archive-original,.archive-closed").forEach(element=>{const r=element.getBoundingClientRect();context.rect(r.left,r.top,r.width,r.height);});
    context.clip("evenodd");
    const age=(now-ripple.started)/1000,fade=Math.pow(Math.max(0,1-age/2.3),1.7)*ripple.strength;
    for(let i=0;i<3;i++){
     const radius=8+age*105-i*26;if(radius<=0)continue;
     const alpha=fade*(.2-i*.045)*Math.min(1,radius/22);
     context.beginPath();context.ellipse(ripple.x,ripple.y,radius,radius*.55,0,0,Math.PI*2);
     context.strokeStyle=`rgba(163,210,222,${alpha})`;context.lineWidth=1.3;context.stroke();
     context.beginPath();context.ellipse(ripple.x,ripple.y,radius+3,radius*.55+2,0,0,Math.PI*2);
     context.strokeStyle=`rgba(5,22,39,${alpha*.65})`;context.lineWidth=2;context.stroke();
    }
    context.restore();
   }
   if(ripples.length)frame=requestAnimationFrame(draw);
  };
  const disturb=(event:PointerEvent|WheelEvent)=>{
   if(motion.matches||document.hidden||!(event.target instanceof Element))return;
   const surface=event.target.closest(surfaces);if(!surface)return;
   const now=performance.now(),direct=event.type==="pointerdown";
   if(!direct&&(now-lastTime<95||Math.hypot(event.clientX-lastX,event.clientY-lastY)<9))return;
   lastTime=now;lastX=event.clientX;lastY=event.clientY;
   ripples.push({surface,x:event.clientX,y:event.clientY,started:now,strength:direct?1:.72});
   ripples=ripples.slice(-8);if(!frame)frame=requestAnimationFrame(draw);
  };
  const visibility=()=>{if(document.hidden)clear();};
  const resized=()=>{clear();resize();};
  resize();
  document.addEventListener("pointermove",disturb,{passive:true,capture:true});
  document.addEventListener("pointerdown",disturb,{passive:true,capture:true});
  document.addEventListener("wheel",disturb,{passive:true,capture:true});
  document.addEventListener("scroll",clear,{passive:true,capture:true});
  document.addEventListener("visibilitychange",visibility);
  window.addEventListener("resize",resized);motion.addEventListener("change",clear);
  return()=>{clear();document.removeEventListener("pointermove",disturb,true);document.removeEventListener("pointerdown",disturb,true);document.removeEventListener("wheel",disturb,true);document.removeEventListener("scroll",clear,true);document.removeEventListener("visibilitychange",visibility);window.removeEventListener("resize",resized);motion.removeEventListener("change",clear);};
 },[]);
 return <canvas ref={ref} className="water-ripple-layer" aria-hidden="true"/>;
}
