"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type CSSProperties } from "react";
import { geoArea, geoDistance, geoGraticule, geoMercator, geoOrthographic, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry, Polygon } from "geojson";
import { Pause, Play, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Locale } from "@/lib/i18n";
import { geographyTranslations } from "@/lib/geography";
import { rescuePlaces, rescueTranslations, type RescuePlaceId } from "@/lib/rescue";
import coastlineData from "@/lib/rescue-islands.json";

export type RescueEntry = RescuePlaceId | "overview";
type Camera = {longitude:number;latitude:number;scale:number;x:number};
type World = FeatureCollection<Geometry,{code:string;name:string}>;
const centre = [122.718,30.216] as const;
const localProjection=geoMercator().center([...centre]).scale(300000).translate([360,240]);
const finalScale=300000/Math.cos(centre[1]*Math.PI/180);
const wrap=(v:number)=>((v+180)%360+360)%360-180;
// D3's spherical polygons use clockwise exterior rings.
const islands=coastlineData.features.map(feature=>{
  const geometry:Polygon={type:"Polygon",coordinates:feature.geometry.coordinates};
  if(geoArea(geometry)>2*Math.PI)geometry.coordinates=geometry.coordinates.map(ring=>[...ring].reverse());
  return geometry;
});

export default function RescueGlobe({locale,request,autoEnter,onReveal,onFinish}:{locale:Locale;request:RescueEntry|null;autoEnter:boolean;onReveal:(target:RescueEntry)=>void;onFinish:()=>void}){
  const t=rescueTranslations[locale],uid=useId().replace(/[^a-zA-Z0-9_-]/g,"");
  const container=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null);
  const sphere=useRef<SVGPathElement>(null),land=useRef<SVGPathElement>(null),grid=useRef<SVGPathElement>(null);
  const coast=useRef<(SVGPathElement|null)[]>([]),markers=useRef<(SVGGElement|null)[]>([]);
  const [world,setWorld]=useState<World|null>(null),[error,setError]=useState(false);
  const [active,setActive]=useState(false),[visible,setVisible]=useState(true),[reduced,setReduced]=useState(false),[paused,setPaused]=useState(false);
  const [phase,setPhase]=useState<"globe"|"zooming"|"handoff">("globe"),[revision,setRevision]=useState(0);
  const phaseRef=useRef(phase),time=useRef(0),zoomTime=useRef(0),fadeTime=useRef(0);
  const viewport=useRef({units:720,pixelsPerUnit:1}),camera=useRef<Camera>({longitude:94,latitude:20,scale:190,x:360});
  const from=useRef<Camera>({...camera.current}),target=useRef<RescueEntry>("overview"),done=useRef(false);
  const callbacks=useRef({onReveal,onFinish});callbacks.current={onReveal,onFinish};
  const startRef=useRef<(entry:RescueEntry)=>void>(()=>{});
  function start(entry:RescueEntry){
    if(phaseRef.current==="handoff")return;
    target.current=entry;
    if(reduced || !world){callbacks.current.onReveal(entry);callbacks.current.onFinish();return;}
    if(phaseRef.current!=="zooming"){from.current={...camera.current};zoomTime.current=0;phaseRef.current="zooming";setPhase("zooming");setPaused(false);setRevision(v=>v+1);}
  }
  startRef.current=start;
  function activate(event:KeyboardEvent,entry:RescueEntry){if(event.key==="Enter"||event.key===" "){event.preventDefault();start(entry);}}
  useEffect(()=>{
    const observer=new IntersectionObserver(([entry])=>setActive(entry.isIntersecting),{threshold:.25});
    if(container.current)observer.observe(container.current);
    const visibility=()=>setVisible(!document.hidden);document.addEventListener("visibilitychange",visibility);visibility();
    const media=matchMedia("(prefers-reduced-motion: reduce)"),motion=()=>{setReduced(media.matches);if(media.matches)setPaused(true);};motion();media.addEventListener("change",motion);
    const measure=()=>{if(!container.current||!svg.current)return;const matrix=svg.current.getScreenCTM(),fitScale=Number(document.documentElement.style.getPropertyValue("--screen-fit-scale")) || 1,width=(matrix ? 720*Math.hypot(matrix.a,matrix.b) : svg.current.getBoundingClientRect().width)/fitScale;viewport.current={units:Math.min(720,720*container.current.clientWidth/width),pixelsPerUnit:width/720};setRevision(v=>v+1);};
    const resize=new ResizeObserver(measure);if(container.current)resize.observe(container.current);measure();
    return()=>{observer.disconnect();resize.disconnect();media.removeEventListener("change",motion);document.removeEventListener("visibilitychange",visibility);};
  },[]);
  useEffect(()=>{
    if(!active || world || error)return;
    const controller=new AbortController();
    fetch("/maps/world.geojson",{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error("map");const data=await response.json() as World;if(data.type!=="FeatureCollection"||!data.features?.length)throw new Error("map");setWorld(data);}).catch(e=>{if(e.name!=="AbortError")setError(true);});
    return()=>controller.abort();
  },[active,world,error]);
  useEffect(()=>{if(request)startRef.current(request);},[request]);
  useEffect(()=>{if(reduced&&phaseRef.current==="zooming")startRef.current(target.current);},[reduced]);
  useEffect(()=>{
    if(!active || !visible)return;
    const projection=geoOrthographic().translate([360,240]).clipAngle(90).clipExtent([[0,0],[720,480]]).precision(.5),path=geoPath(projection),graticule=geoGraticule().step([20,20])();
    let frame=0,previous=0;
    function draw(now:number){
      if(previous && now-previous<33){frame=requestAnimationFrame(draw);return;}
      const delta=previous ? Math.min(now-previous,100) : 0;previous=now;
      const size=viewport.current,c=camera.current;
      if(phaseRef.current==="globe"){
        if(!paused&&!reduced&&world)time.current+=delta;
        c.longitude=wrap(94+time.current*.006);c.latitude=20;c.scale=Math.min(190,size.units*.43);c.x=size.units/2;
        if(autoEnter&&world&&!paused&&!reduced&&time.current>=6500)startRef.current("overview");
      }
      if(phaseRef.current==="zooming"){
        if(!paused)zoomTime.current+=delta;
        const progress=Math.min(1,zoomTime.current/3400),ease=progress*progress*(3-2*progress);
        // Orient towards Dongji before increasing the scale, keeping its points in view.
        const angle=Math.min(1,progress/.35),angleEase=angle*angle*(3-2*angle);
        const zoom=Math.max(0,(progress-.2)/.8),zoomEase=zoom*zoom*(3-2*zoom);
        const chosen=target.current==="overview" ? null : rescuePlaces.find(p=>p.id===target.current)!;
        const localX=chosen ? localProjection([chosen.longitude,chosen.latitude])![0] : size.units/2;
        const scroll=Math.max(0,Math.min(720-size.units,localX-size.units/2));
        c.longitude=from.current.longitude+wrap(centre[0]-from.current.longitude)*angleEase;c.latitude=from.current.latitude+(centre[1]-from.current.latitude)*angleEase;
        c.scale=Math.exp(Math.log(from.current.scale)+(Math.log(finalScale)-Math.log(from.current.scale))*zoomEase);c.x=from.current.x+(360-scroll-from.current.x)*ease;
        if(progress===1){phaseRef.current="handoff";setPhase("handoff");fadeTime.current=0;callbacks.current.onReveal(target.current);}
      }else if(phaseRef.current==="handoff"){
        fadeTime.current+=delta;if(fadeTime.current>=600&&!done.current){done.current=true;callbacks.current.onFinish();return;}
      }
      projection.rotate([-c.longitude,-c.latitude,0]).scale(c.scale).translate([c.x,240]);
      sphere.current?.setAttribute("d",path({type:"Sphere"})||"");land.current?.setAttribute("d",world ? path(world)||"" : "");grid.current?.setAttribute("d",path(graticule)||"");
      islands.forEach((geometry,i)=>coast.current[i]?.setAttribute("d",path(geometry)||""));
      rescuePlaces.forEach((place,i)=>{
        const xy=projection([place.longitude,place.latitude]),marker=markers.current[i];if(!marker||!xy)return;
        marker.setAttribute("transform",`translate(${xy[0]} ${xy[1]})`);
        marker.style.visibility=world&&geoDistance([c.longitude,c.latitude],[place.longitude,place.latitude])<Math.PI/2 ? "visible" : "hidden";
        marker.querySelector(".rescue-globe-pin-core")?.setAttribute("r",phaseRef.current==="globe" ? "4" : "8");
      });
      if(!done.current && ((!paused&&!reduced&&world) || (phaseRef.current==="zooming"&&!paused) || phaseRef.current==="handoff"))frame=requestAnimationFrame(draw);
    }
    frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
  },[active,visible,world,paused,reduced,revision,autoEnter]);

  return <div ref={container} className="rescue-globe-shell" data-phase={phase} data-paused={paused||reduced||!active||!visible} data-loaded={!!world}>
    <svg ref={svg} viewBox="0 0 720 480" className="rescue-globe-svg" role="group" aria-label={t.globeLabel}>
      <defs><radialGradient id={`${uid}-ocean`}><stop offset="0%" stopColor="#31515a"/><stop offset="100%" stopColor="#122b33"/></radialGradient><filter id={`${uid}-glow`} x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3"/></filter></defs>
      <rect width={720} height={480} fill="#122b33"/>
      <g className="rescue-globe-earth" role="button" tabIndex={phase==="globe" ? 0 : -1} aria-label={t.globeEnter} onClick={()=>start("overview")} onKeyDown={e=>activate(e,"overview")}><path ref={sphere} className="rescue-globe-ocean" fill={`url(#${uid}-ocean)`}/><path ref={land} className="rescue-globe-land"/><path ref={grid} className="rescue-globe-grid"/>{islands.map((_,i)=><path key={i} ref={el=>{coast.current[i]=el;}} className="rescue-globe-island" stroke={rescuePlaces[i].color}/>)}</g>
      {rescuePlaces.map((place,i)=><g key={place.id} ref={el=>{markers.current[i]=el;}} className="rescue-globe-pin" data-globe-place={place.id} role="button" tabIndex={phase==="globe" ? 0 : -1} aria-label={`${t.placeLabels[place.id]} · ${t.globeEnter}`} onClick={()=>start(place.id)} onKeyDown={e=>activate(e,place.id)} style={{color:place.color,"--beacon-delay":`${-i*.8}s`} as CSSProperties}>
        <circle r={17} fill="currentColor" opacity={.2} filter={`url(#${uid}-glow)`}/><circle className="rescue-globe-beacon" r={12} fill="none" stroke="currentColor" strokeWidth={1.5}/><circle r={22} fill="transparent"/><circle className="rescue-globe-pin-core" r={4} fill="currentColor" stroke="#f3f3ee" strokeWidth={1.4}/>
      </g>)}
    </svg>
    <div className="rescue-globe-caption">{phase==="globe" ? t.globeOverview : t.globeZooming}</div>
    {!world&&<p className="rescue-globe-loading" role="status">{error ? geographyTranslations[locale].loadError : geographyTranslations[locale].loading}</p>}
    <div className="rescue-globe-controls"><Button variant="outline" onClick={()=>start("overview")} disabled={phase!=="globe"}><ZoomIn size={16}/>{phase==="globe" ? t.globeEnter : t.globeZooming}</Button><Button variant="ghost" onClick={()=>setPaused(v=>!v)} disabled={phase!=="globe"||reduced} aria-label={paused ? t.globePlay : t.globePause}>{paused ? <Play size={17}/> : <Pause size={17}/>}</Button></div>
  </div>;
}
