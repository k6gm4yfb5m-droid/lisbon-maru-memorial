"use client";
import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import { geoDistance, geoGraticule, geoOrthographic, geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import FullscreenView from "./fullscreen-view";
import { Button } from "@/components/ui/button";
import { formatText, type Locale } from "@/lib/i18n";
import { geographyStops, geographyTranslations, geographySources, wreckCoordinateLabel, voyageLine, plannedLine } from "@/lib/geography";

type World = FeatureCollection<Geometry, {code:string; name:string}>;
type Camera = {longitude:number; latitude:number; scale:number};
type Country = "china" | "japan" | "hongkong";
type LegendItem = Country | "wreck";
const cameraFor = (index:number):Camera => ({longitude:geographyStops[index].longitude,latitude:geographyStops[index].latitude,scale:geographyStops[index].scale});
const wrap = (angle:number) => ((angle + 180) % 360 + 360) % 360 - 180;

export default function Geography({locale}: {locale:Locale}) {
  const t = geographyTranslations[locale];
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const section = useRef<HTMLElement>(null);
  const globe = useRef<SVGSVGElement>(null);
  const [mapWindow,setMapWindow]=useState({x:0,width:720});
  const windowBounds=useRef({x:0,width:720});
  const [inView,setInView] = useState(false);
  const [tabVisible,setTabVisible] = useState(true);
  const [reducedMotion,setReducedMotion] = useState(false);
  const [world,setWorld] = useState<World | null>(null);
  const [loadError,setLoadError] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const [phase,setPhase] = useState(0);
  const [playing,setPlaying] = useState(true);
  const [finished,setFinished] = useState(false);
  const [revision,setRevision] = useState(0);
  const country:Country | null = phase===1 ? "hongkong" : phase===4 ? "japan" : phase===2 || phase===3 ? "china" : null;
  const emphasis = (region:Country) => country===null ? "default" : country===region ? "selected" : "muted";
  const wreckEmphasis = phase===0 ? "default" : phase===2 ? "selected" : "muted";
  const phaseRef = useRef(0);
  const elapsed = useRef(0);
  const current = useRef<Camera>(cameraFor(0));
  const target = useRef<Camera>(cameraFor(0));
  const drawNow = useRef<() => void>(()=>{});
  const drag = useRef<{id:number; x:number; y:number; width:number; height:number; camera:Camera} | null>(null);
  const dragged = useRef(false);
  const sphere = useRef<SVGPathElement>(null);
  const land = useRef<SVGPathElement>(null);
  const china = useRef<SVGPathElement>(null);
  const japan = useRef<SVGPathElement>(null);
  const grid = useRef<SVGPathElement>(null);
  const voyage = useRef<SVGPathElement>(null);
  const planned = useRef<SVGPathElement>(null);
  const markers = useRef<(SVGGElement | null)[]>([]);
  const labelBounds = useRef<({x:number;y:number;width:number;height:number} | null)[]>([]);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(()=>{
    const svg=globe.current;if(!svg)return;
    const resize=new ResizeObserver(()=>{
      const width=svg.clientHeight>0 ? 620*svg.clientWidth/svg.clientHeight : 720;
      const next={x:(720-width)/2,width};
      if(Math.abs(next.width-windowBounds.current.width)<.5)return;
      windowBounds.current=next;setMapWindow(next);drawNow.current();
    });
    resize.observe(svg);return ()=>resize.disconnect();
  },[]);

  useEffect(()=>{
    const observer = new IntersectionObserver(([entry])=>setInView(entry.isIntersecting),{threshold:.15});
    if(globe.current)observer.observe(globe.current);
    const visibility = ()=>setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange",visibility);visibility();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = ()=>{setReducedMotion(media.matches);if(media.matches)setPlaying(false);};
    motion();media.addEventListener("change",motion);
    return ()=>{observer.disconnect();document.removeEventListener("visibilitychange",visibility);media.removeEventListener("change",motion);};
  },[]);
  useEffect(()=>{
    if(!inView || world)return;
    const controller = new AbortController();
    fetch("/maps/world.geojson",{signal:controller.signal}).then(async response=>{
      if(!response.ok)throw new Error("map");
      const data = await response.json() as World;
      if(data.type!=="FeatureCollection" || !data.features?.length)throw new Error("map");
      setWorld(data);setLoadError(false);
    }).catch(error=>{if(error.name!=="AbortError")setLoadError(true);});
    return ()=>controller.abort();
  },[inView,world,attempt]);

  useEffect(()=>{
    function measure(){
      const matrix=globe.current?.getScreenCTM();
      const fitScale=Number(document.documentElement.style.getPropertyValue("--screen-fit-scale")) || 1;
      const width=(matrix ? 720*Math.hypot(matrix.a,matrix.b) : globe.current?.getBoundingClientRect().width || 720)/fitScale;
      markers.current.forEach((marker,index)=>{
        const text=marker?.querySelector("text"), background=marker?.querySelector(".globe-label-background");
        if(!text || !background)return;
        text.style.fontSize=`${Math.max(17,14*720/width)}px`;
        const box=text.getBBox();const bounds={x:box.x-7,y:box.y-5,width:box.width+14,height:box.height+10};
        labelBounds.current[index]=bounds;
        for(const [key,value] of Object.entries(bounds))background.setAttribute(key,String(value));
      });
      drawNow.current();
    }
    measure();const observer=new ResizeObserver(measure);if(globe.current)observer.observe(globe.current);
    let disposed=false;document.fonts.ready.then(()=>{if(!disposed)measure();});
    return ()=>{disposed=true;observer.disconnect();};
  },[locale,phase]);

  useEffect(()=>{
    if(!inView || !tabVisible)return;
    const projection = geoOrthographic().translate([360,310]).clipAngle(90).precision(.4);
    const path = geoPath(projection);
    const graticule = geoGraticule().step([20,20])();
    const base:World = {type:"FeatureCollection",features:world?.features.filter(f=>!["CHN","JPN"].includes(f.properties.code)) || []};
    const chinaFeature = world?.features.find(f=>f.properties.code==="CHN");
    const japanFeature = world?.features.find(f=>f.properties.code==="JPN");
    function draw(){
      const camera = current.current;
      projection.rotate([-camera.longitude,-camera.latitude,0]).scale(camera.scale);
      sphere.current?.setAttribute("d",path({type:"Sphere"}) || "");
      land.current?.setAttribute("d",path(base) || "");
      china.current?.setAttribute("d",chinaFeature ? path(chinaFeature) || "" : "");
      japan.current?.setAttribute("d",japanFeature ? path(japanFeature) || "" : "");
      grid.current?.setAttribute("d",path(graticule) || "");
      voyage.current?.setAttribute("d",path({type:"LineString",coordinates:voyageLine}) || "");
      planned.current?.setAttribute("d",path({type:"LineString",coordinates:plannedLine}) || "");
      const placed:{x:number;y:number;width:number;height:number}[]=[];
      const projected=geographyStops.map(place=>projection([place.longitude,place.latitude]));
      const visible=geographyStops.map((place,index)=>{
        const xy=projected[index];
        return index>0 && !!world && !!xy && xy[0]>=windowBounds.current.x && xy[0]<=windowBounds.current.x+windowBounds.current.width && xy[1]>=0 && xy[1]<=620 && geoDistance([camera.longitude,camera.latitude],[place.longitude,place.latitude])<Math.PI/2 && (index!==3 || phaseRef.current===3) && !(index===2 && phaseRef.current===3);
      });
      // Keep the active place closest to its marker; the wreck has priority in the world view.
      const priority=phaseRef.current || 2;
      [priority,...geographyStops.map((_,index)=>index).filter(index=>index!==priority)].forEach(index=>{
        const marker = markers.current[index];if(!marker || index===0)return;
        const xy = projected[index];
        const shown = visible[index];
        marker.style.visibility = shown ? "visible" : "hidden";
        if(xy)marker.setAttribute("transform",`translate(${xy[0]},${xy[1]})`);
        const bounds=labelBounds.current[index],label=marker.querySelector(".globe-marker-label");
        if(shown && xy && bounds && label){
          const {width,height}=bounds;
          const viewport=windowBounds.current;
          const clampBox=(x:number,y:number)=>({x:Math.max(viewport.x+8,Math.min(viewport.x+viewport.width-8-width,x)),y:Math.max(8,Math.min(612-height,y)),width,height});
          const distance=(box:typeof bounds,point:readonly number[])=>Math.hypot(Math.max(box.x-point[0],0,point[0]-box.x-box.width),Math.max(box.y-point[1],0,point[1]-box.y-box.height));
          const overlaps=(a:typeof bounds,b:typeof bounds)=>a.x<b.x+b.width+6 && a.x+a.width+6>b.x && a.y<b.y+b.height+6 && a.y+a.height+6>b.y;
          const candidates=[
            clampBox(xy[0]+bounds.x,xy[1]+bounds.y),
            clampBox(xy[0]+16,xy[1]-height/2),clampBox(xy[0]-width-16,xy[1]-height/2),
            clampBox(xy[0]-width/2,xy[1]-height-16),clampBox(xy[0]-width/2,xy[1]+16),
            clampBox(xy[0]+16,xy[1]-height-14),clampBox(xy[0]-width-16,xy[1]-height-14),
            clampBox(xy[0]+16,xy[1]+14),clampBox(xy[0]-width-16,xy[1]+14),
          ];
          // Search both axes rather than cascading labels down the globe.
          for(const radius of [40,70,100,140,180])for(let angle=0;angle<8;angle++){
            const radians=angle*Math.PI/4;
            candidates.push(clampBox(xy[0]+Math.cos(radians)*(width/2+radius)-width/2,xy[1]+Math.sin(radians)*(height/2+radius)-height/2));
          }
          const ranked=candidates.map((box,order)=>({box,score:distance(box,xy)+order*.15,
            collisions:placed.filter(other=>overlaps(box,other)).length+projected.filter((point,i)=>point && visible[i] && distance(box,point)<12).length}));
          ranked.sort((a,b)=>a.collisions-b.collisions || a.score-b.score);
          const box=ranked[0].box;
          label.setAttribute("transform",`translate(${box.x-xy[0]-bounds.x},${box.y-xy[1]-bounds.y})`);
          const leader=marker.querySelector(".globe-label-leader");
          if(leader){
            const end=[Math.max(box.x,Math.min(box.x+width,xy[0])),Math.max(box.y,Math.min(box.y+height,xy[1]))];
            const dx=end[0]-xy[0],dy=end[1]-xy[1],length=Math.hypot(dx,dy);
            leader.setAttribute("d",length>8 ? `M${dx*7/length} ${dy*7/length} L${dx} ${dy}` : "");
          }
          placed.push(box);
        }
      });
      if(progress.current)progress.current.style.transform=`scaleX(${Math.min(1,elapsed.current/geographyStops[phaseRef.current].duration)})`;
    }
    drawNow.current = draw;
    let animation = 0, previous = 0;
    function tick(now:number){
      if(previous && now-previous<40){animation=requestAnimationFrame(tick);return;}
      const delta = previous ? Math.min(now-previous,150) : 0;previous=now;
      if(playing && world){
        elapsed.current+=delta;
        if(phaseRef.current===0 && !reducedMotion)target.current.longitude=wrap(target.current.longitude+delta*.006);
        if(!finished && elapsed.current>=geographyStops[phaseRef.current].duration){
          if(phaseRef.current<geographyStops.length-1){phaseRef.current++;elapsed.current=0;target.current=cameraFor(phaseRef.current);setPhase(phaseRef.current);}
          else {phaseRef.current=0;elapsed.current=0;target.current=cameraFor(0);setPhase(0);setFinished(true);}
        }
      }
      const camera=current.current, goal=target.current;
      const longitudeDelta=wrap(goal.longitude-camera.longitude);
      const unsettled=Math.abs(longitudeDelta)>.01 || Math.abs(goal.latitude-camera.latitude)>.01 || Math.abs(goal.scale-camera.scale)>.1;
      const amount=reducedMotion || drag.current ? 1 : .11;
      camera.longitude=wrap(camera.longitude+longitudeDelta*amount);
      camera.latitude+=(goal.latitude-camera.latitude)*amount;
      camera.scale+=(goal.scale-camera.scale)*amount;
      draw();
      if((playing && world) || unsettled)animation=requestAnimationFrame(tick);
    }
    animation=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(animation);
  },[world,inView,tabVisible,playing,reducedMotion,phase,revision,finished]);

  function choose(index:number,autoplay=false){
    phaseRef.current=index;elapsed.current=0;target.current=cameraFor(index);
    setPhase(index);setFinished(false);setPlaying(autoplay);setRevision(value=>value+1);
  }
  function chooseCountry(region:Country){choose(region==="japan" ? 4 : region==="hongkong" ? 1 : phase===3 ? 3 : 2);}
  function chooseLegend(item:LegendItem){if(item==="wreck")choose(2);else chooseCountry(item);}
  function locateWreck(){
    choose(2);
    globe.current?.closest(".fullscreen-view")?.scrollIntoView({block:"start",behavior:reducedMotion ? "instant" : "smooth"});
    globe.current?.focus({preventScroll:true});
  }
  function togglePlayback(){
    target.current=playing ? {...current.current} : cameraFor(phaseRef.current);
    setPlaying(value=>!value);
  }
  function zoom(factor:number){setPlaying(false);target.current={...current.current,scale:Math.max(220,Math.min(2200,current.current.scale*factor))};setRevision(value=>value+1);}
  function beginDrag(event:PointerEvent<SVGSVGElement>){
    if(event.button!==0 || (event.target as Element).closest("[data-place]"))return;
    const box=event.currentTarget.getBoundingClientRect(),matrix=event.currentTarget.getScreenCTM();
    dragged.current=false;
    drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,width:matrix ? 720*Math.hypot(matrix.a,matrix.b) : box.width,height:matrix ? 620*Math.hypot(matrix.c,matrix.d) : box.height,camera:{...current.current}};
    target.current={...current.current};setPlaying(false);
  }
  function moveDrag(event:PointerEvent<SVGSVGElement>){
    const start=drag.current;if(!start || start.id!==event.pointerId)return;
    if(!dragged.current){
      if(Math.hypot(event.clientX-start.x,event.clientY-start.y)<6)return;
      dragged.current=true;event.currentTarget.setPointerCapture(event.pointerId);
    }
    const longitude=wrap(start.camera.longitude-(event.clientX-start.x)*720/start.width/start.camera.scale*180/Math.PI);
    const latitude=Math.max(-75,Math.min(75,start.camera.latitude+(event.clientY-start.y)*620/start.height/start.camera.scale*180/Math.PI));
    current.current={...start.camera,longitude,latitude};target.current={...current.current};drawNow.current();
  }
  function endDrag(){drag.current=null;}

  return <section ref={section} className="geography-section" id="geography" aria-labelledby="geography-title">
    <div className="geography-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="geography-title"><button type="button" className="geography-coordinate-link" aria-label={`${wreckCoordinateLabel} · ${t.wreck}`} aria-controls={`${uid}-map`} title={t.wreck} onClick={locateWreck}>{wreckCoordinateLabel}</button></h2><p className="geography-subtitle">{t.subtitle}</p><p>{t.introduction}</p></div>
    <FullscreenView locale={locale} title={t.subtitle} kind="voyage">
    <div className="geography-layout">
      <div className="globe-stage" data-selection={country || "none"}>
        <svg ref={globe} id={`${uid}-map`} className="geography-globe" viewBox={`${mapWindow.x} 0 ${mapWindow.width} 620`} data-playing={playing} data-phase={phase} role="group" aria-label={t.globeLabel} aria-describedby={`${uid}-hint`} tabIndex={0} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={event=>{
          const directions:Record<string,[number,number]>={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,8],ArrowDown:[0,-8]};
          if(event.target!==event.currentTarget || !directions[event.key])return;
          event.preventDefault();setPlaying(false);const [dx,dy]=directions[event.key];target.current={...current.current,longitude:wrap(current.current.longitude+dx),latitude:Math.max(-75,Math.min(75,current.current.latitude+dy))};setRevision(value=>value+1);
        }}>
          <defs><radialGradient id={`${uid}-ocean`} cx="36%" cy="28%"><stop offset="0%" stopColor="#31515a"/><stop offset="75%" stopColor="#16323b"/><stop offset="100%" stopColor="#0a2028"/></radialGradient><clipPath id={`${uid}-window`}><rect x={mapWindow.x} width={mapWindow.width} height="620"/></clipPath></defs>
          <g clipPath={`url(#${uid}-window)`}>
            <path ref={sphere} className="globe-sphere" fill={`url(#${uid}-ocean)`}/>
            <path ref={grid} className="globe-graticule"/>
            <path ref={land} className="globe-land"/>
            <path ref={china} className="globe-china globe-country" data-country="china" data-emphasis={emphasis("china")} role="button" tabIndex={0} aria-label={t.china} aria-pressed={country==="china"} onClick={()=>{if(!dragged.current)chooseCountry("china");}} onKeyDown={event=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();chooseCountry("china");}}}/>
            <path ref={japan} className="globe-japan globe-country" data-country="japan" data-emphasis={emphasis("japan")} role="button" tabIndex={0} aria-label={t.japan} aria-pressed={country==="japan"} onClick={()=>{if(!dragged.current)chooseCountry("japan");}} onKeyDown={event=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();chooseCountry("japan");}}}/>
            <path ref={voyage} className="globe-voyage"/>
            <path ref={planned} className="globe-planned"/>
            {geographyStops.map((place,index)=>index>0 && <g key={place.id} ref={element=>{markers.current[index]=element;}} data-place={place.id} data-emphasis={index===2 ? wreckEmphasis : emphasis(index===1 ? "hongkong" : index===4 ? "japan" : "china")} className={`globe-marker marker-${place.id}`} role="button" aria-label={t.names[index]} aria-pressed={phase===index} tabIndex={0} style={{visibility:"hidden"}} onClick={()=>choose(index)} onKeyDown={event=>{if(event.key==="Enter" || event.key===" "){event.preventDefault();choose(index);}}}>
              <circle className="globe-marker-hit" r="22"/><circle className="globe-marker-halo" r="13"/><circle className="globe-marker-dot" r="5"/>
              <path className="globe-label-leader" fill="none" stroke="#b3c5c2" strokeWidth="1" pointerEvents="none"/><g className="globe-marker-label"><rect className="globe-label-background" fill="#102a33" stroke="none"/><text fill="#ffffff" stroke="none" style={{fill:"#ffffff",stroke:"none"}} x={index===3 ? -18 : 16} y={phase===0 && index===4 ? -30 : phase===0 && index===2 ? 24 : index===2 ? -19 : index===3 ? 28 : 20} textAnchor={index===3 ? "end" : "start"}>{t.names[index]}</text></g>
            </g>)}
          </g>
        </svg>
        {!world && <div className="globe-load-message" role="status">{loadError ? <>{t.loadError}<Button variant="outline" onClick={()=>{setLoadError(false);setAttempt(value=>value+1);}}>{t.retry}</Button></> : t.loading}</div>}
        <div className="globe-zoom-controls"><Button variant="outline" size="icon" aria-label={t.zoomOut} onClick={()=>zoom(1/1.3)}><Minus size={17}/></Button><Button variant="outline" size="icon" aria-label={t.zoomIn} onClick={()=>zoom(1.3)}><Plus size={17}/></Button></div>
        <p className="globe-hint" id={`${uid}-hint`}>{t.globeHint}</p>
        <div className="globe-legend" role="group" aria-label={t.countriesLabel}>{(["china","japan","hongkong","wreck"] as LegendItem[]).map(item=><Button key={item} variant="ghost" data-country={item} aria-pressed={item==="wreck" ? phase===2 : country===item} onClick={()=>chooseLegend(item)}><i className={`legend-${item}`} aria-hidden="true"/>{item==="china" ? t.china : item==="japan" ? t.japan : item==="hongkong" ? t.hk : t.wreck}</Button>)}</div>
      </div>
      <div className="geography-story" role="region" aria-label={t.storyLabel}>
        <div className="geography-story-top"><span>{formatText(t.step,{current:phase+1,total:geographyStops.length})}</span><span>{playing ? t.auto : finished ? t.finished : t.manual}</span></div>
        <div className="geography-story-progress" aria-hidden="true"><span ref={progress}/></div>
        <div className="geography-story-copy" key={`${locale}-${phase}`}><span className="geography-role">{t.roles[phase]}</span><h3>{t.names[phase]}</h3><time>{t.dates[phase]}</time><p>{t.stories[phase]}</p>{phase===2 && <div className="wreck-coordinate">{wreckCoordinateLabel}</div>}</div>
        <div className="geography-playback"><Button variant="outline" size="icon" disabled={phase===0} aria-label={t.previous} onClick={()=>choose(phase-1)}><ChevronLeft size={18}/></Button><Button variant="outline" className="geography-play-button" onClick={togglePlayback}>{playing ? <Pause size={16}/> : <Play size={16}/>} {playing ? t.pause : t.play}</Button><Button variant="outline" size="icon" disabled={phase===geographyStops.length-1} aria-label={t.next} onClick={()=>choose(phase+1)}><ChevronRight size={18}/></Button></div>
        <Button variant="ghost" className="geography-replay" onClick={()=>choose(0,!reducedMotion)}><RotateCcw size={15}/>{t.replay}</Button>
      </div>
    </div>
    <div className="geography-place-list" role="group" aria-label={t.placesLabel}>{geographyStops.map((place,index)=><button type="button" key={place.id} data-stop={place.id} aria-pressed={phase===index} onClick={()=>choose(index)}><span>{String(index+1).padStart(2,"0")}</span><strong>{t.names[index]}</strong><small>{t.roles[index]}</small></button>)}</div>
    </FullscreenView>
    <div className="geography-route-key"><span><i/>{t.voyage}</span><span><i className="route-dashed"/>{t.planned}</span></div>
    <div className="geography-notes"><p>{t.mapNote}</p><div><a href={geographySources.coordinate} target="_blank" rel="noreferrer">{t.coordinateSource} ↗</a><a href={geographySources.history} target="_blank" rel="noreferrer">{t.historySource} ↗</a><a href={geographySources.destination} target="_blank" rel="noreferrer">{t.destinationSource} ↗</a><a href={geographySources.map} target="_blank" rel="noreferrer">{t.mapSource} ↗</a></div></div>
  </section>;
}
