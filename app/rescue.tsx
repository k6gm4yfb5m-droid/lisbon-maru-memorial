"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { geoMercator } from "d3-geo";
import { Users, Ship, Repeat2, LifeBuoy, RotateCcw, Globe2 } from "lucide-react";
import FullscreenView from "./fullscreen-view";
import { Button } from "@/components/ui/button";
import { formatNumber, type Locale } from "@/lib/i18n";
import { rescueMetrics, rescuePlaces, rescueTranslations, rescueSources, type RescueMetricId, type RescuePlaceId } from "@/lib/rescue";
import islandCoastlines from "@/lib/rescue-islands.json";
import { geographySources } from "@/lib/geography";
import RescueGlobe, { type RescueEntry } from "./rescue-globe";

const metricIcons={fishermen:Users,boats:Ship,sorties:Repeat2,rescued:LifeBuoy};
const projection=geoMercator().center([122.718,30.216]).scale(300000).translate([360,240]);
const mapPlaces=rescuePlaces.map(place=>({...place,point:projection([place.longitude,place.latitude])!}));
// Project the actual coastline vertices with the same projection as the island markers.
const islandOutlines=islandCoastlines.features.map(feature=>{
  const id=feature.properties.id as "miaozihu"|"qingbang";
  const points=feature.geometry.coordinates[0].map(coordinate=>projection([coordinate[0],coordinate[1]])!);
  return {id,color:rescuePlaces.find(p=>p.id===id)!.color,d:points.map(([x,y],i)=>`${i===0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ")+" Z"};
});
const wreck=mapPlaces[2].point;
const routes=mapPlaces.slice(0,2).map(place=>{
  const [x,y]=place.point;
  return {id:place.id,color:place.color,d:place.id==="miaozihu" ? `M${x+8} ${y-6} C${x+40} ${y-140} ${wreck[0]-180} ${wreck[1]+30} ${wreck[0]-9} ${wreck[1]-2}` : `M${x+9} ${y} C${x+150} ${y+15} ${wreck[0]+50} ${wreck[1]+90} ${wreck[0]+3} ${wreck[1]+9}`};
});
function RescueDotChart({count,color,label,run}:{count:number;color:string;label:string;run:number}){
  const ref=useRef<SVGSVGElement>(null);
  const [visible,setVisible]=useState(false);
  const [animationRun,setAnimationRun]=useState<number|null>(null);
  useEffect(()=>{
    const svg=ref.current;if(!svg)return;
    if(typeof IntersectionObserver==="undefined"){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting&&entry.intersectionRatio>=.2),{threshold:.2});
    observer.observe(svg);return()=>observer.disconnect();
  },[]);
  // Queue an off-screen selection until its chart is visible; scrolling alone never replays it.
  useEffect(()=>{if(visible)setAnimationRun(run);},[visible,run]);
  const rows=Math.ceil(count/24),top=(168-rows*9)/2+4.5;
  return <svg ref={ref} viewBox="0 0 320 168" className="rescue-dot-chart" role="img" aria-label={label} data-animation={animationRun===null ? "waiting" : "started"} data-animation-run={animationRun}>
    <g key={animationRun??"waiting"} className="rescue-dot-appearance">{Array.from({length:count},(_,i)=><circle key={i} cx={22+(i%24)*12} cy={top+Math.floor(i/24)*9} r={3.3} fill={color} style={{animationDelay:`${i/Math.max(1,count-1)*260}ms`}}/>)}</g>
  </svg>;
}
export default function FishermenRescue({locale}:{locale:Locale}){
  const t=rescueTranslations[locale],uid=useId().replace(/[^a-zA-Z0-9_-]/g,"");
  const [metric,setMetric]=useState<RescueMetricId|null>(null),[place,setPlace]=useState<RescuePlaceId|null>(null);
  const [metricRuns,setMetricRuns]=useState<Record<RescueMetricId,number>>({fishermen:0,boats:0,sorties:0,rescued:0});
  const [mapOpen,setMapOpen]=useState(false),[globeVisible,setGlobeVisible]=useState(true),[autoEnter,setAutoEnter]=useState(true),[entryTarget,setEntryTarget]=useState<RescueEntry|null>(null);
  const mapScroll=useRef<HTMLDivElement>(null);
  const mapStage=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!mapOpen || !place || !mapScroll.current)return;
    const scroll=mapScroll.current,svg=scroll.querySelector("svg");if(!svg)return;
    const point=mapPlaces.find(p=>p.id===place)!.point;
    const x=point[0]*svg.clientWidth/720;
    scroll.scrollTo({left:Math.max(0,x-scroll.clientWidth/2),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  },[place,mapOpen]);
  const toggleMetric=(id:RescueMetricId)=>{setMetric(current=>current===id ? null : id);setMetricRuns(current=>({...current,[id]:current[id]+1}));};
  const togglePlace=(id:RescuePlaceId)=>{if(!mapOpen)setEntryTarget(id);else setPlace(current=>current===id ? null : id);};
  function revealMap(target:RescueEntry){
    const selected=target==="overview" ? null : target;
    if(mapScroll.current){const scroll=mapScroll.current,svg=scroll.querySelector("svg"),point=selected ? mapPlaces.find(p=>p.id===selected)!.point : null;if(svg)scroll.scrollLeft=point ? Math.max(0,point[0]*svg.clientWidth/720-scroll.clientWidth/2) : 0;}
    setPlace(selected);setMapOpen(true);setEntryTarget(null);
  }
  function finishEntry(){const focused=mapStage.current?.querySelector(".rescue-globe-shell")?.contains(document.activeElement);setGlobeVisible(false);if(focused)requestAnimationFrame(()=>mapScroll.current?.focus({preventScroll:true}));}
  function showAllRescue(){
    // This overview action also works before entry and while the globe is approaching.
    revealMap("overview");setGlobeVisible(false);
    requestAnimationFrame(()=>{
      const stage=mapStage.current;if(!stage)return;const box=stage.getBoundingClientRect();
      if(box.bottom<80 || box.top>innerHeight-80)stage.scrollIntoView({block:"center",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
    });
  }
  function returnToGlobe(){setMapOpen(false);setGlobeVisible(true);setAutoEnter(false);setPlace(null);setEntryTarget(null);requestAnimationFrame(()=>mapStage.current?.querySelector<HTMLButtonElement>(".rescue-globe-controls button")?.focus({preventScroll:true}));}
  function keyActivate(event:KeyboardEvent,id:RescuePlaceId){if(event.key==="Enter"||event.key===" "){event.preventDefault();togglePlace(id);}}
  const routeSelected=(id:RescuePlaceId)=>place===null || place==="wreck" || place===id;
  return <section id="fishermen-rescue" className="rescue-section" aria-labelledby="rescue-title" onKeyDown={e=>{if(e.key==="Escape"){setMetric(null);setPlace(null);}}}>
    <div className="rescue-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="rescue-title">{t.title}</h2><p>{t.intro}</p></div>
    <div className="rescue-chart-heading"><h3>{t.chartTitle}</h3><p>{t.chartHint}</p></div>
    <div className="rescue-charts">{rescueMetrics.map(item=>{
      const Icon=metricIcons[item.id];
      return <figure key={item.id} className="rescue-chart" data-metric={item.id} data-emphasis={!metric ? "default" : metric===item.id ? "selected" : "muted"}>
        <button type="button" className="rescue-chart-button" aria-label={`${t.metricLabels[item.id]} · ${formatNumber(item.count,locale)}`} aria-pressed={metric===item.id} onClick={()=>toggleMetric(item.id)}>
          <div className="rescue-chart-value"><Icon size={24} strokeWidth={1.2} aria-hidden="true"/><strong>{formatNumber(item.count,locale)}</strong></div><h4>{t.metricLabels[item.id]}</h4>
          <RescueDotChart count={item.count} color={item.color} run={metricRuns[item.id]} label={`${t.metricLabels[item.id]} · ${formatNumber(item.count,locale)} · ${t.dotKeys[item.id]}`}/><span className="rescue-dot-key">{t.dotKeys[item.id]}</span>
        </button>
      </figure>;
    })}</div>
    <div className="rescue-stat-legend" role="group" aria-label={t.chartTitle}>{rescueMetrics.map(item=><Button key={item.id} variant="ghost" data-metric={item.id} aria-pressed={metric===item.id} onClick={()=>toggleMetric(item.id)}><i style={{background:item.color}} aria-hidden="true"/>{t.metricLabels[item.id]}</Button>)}</div>
    <div className="rescue-stat-detail" role="status"><p>{metric ? t.metricBodies[metric] : t.overview}</p></div><p className="rescue-chart-note">{t.chartNote}</p>
    <div className="rescue-map-heading"><div><h3>{t.mapTitle}</h3><p>{t.mapRegion}</p></div><p>{mapOpen ? t.mapHint : t.globeHint}</p></div>
    <FullscreenView locale={locale} title={t.mapTitle} kind="rescue">
    <div className="rescue-geography">
      <div className="rescue-map-panel">
        <div ref={mapStage} className="rescue-map-stage" data-view={mapOpen ? "map" : "globe"}>
        <div ref={mapScroll} className="rescue-map-scroll" role="region" tabIndex={mapOpen ? 0 : -1} aria-label={t.mapLabel} aria-hidden={!mapOpen} inert={!mapOpen}>
          <svg viewBox="0 0 720 480" className="rescue-map-svg" role="group" aria-label={t.mapLabel}>
            <defs><radialGradient id={`${uid}-sea`}><stop offset="0%" stopColor="#31515a"/><stop offset="100%" stopColor="#122b33"/></radialGradient></defs>
            <rect width="720" height="480" fill={`url(#${uid}-sea)`}/>
            {[122.68,122.70,122.72,122.74,122.76].map(lon=>{const x=projection([lon,30.216])![0];return <g key={lon} className="rescue-map-grid"><line x1={x} x2={x} y1={35} y2={440}/><text x={x} y={463} textAnchor="middle">{lon.toFixed(2)}°E</text></g>;})}
            {[30.19,30.20,30.21,30.22,30.23,30.24].map(lat=>{const y=projection([122.718,lat])![1];return <g key={lat} className="rescue-map-grid"><line x1={55} x2={680} y1={y} y2={y}/><text x={9} y={y+6}>{lat.toFixed(2)}°N</text></g>;})}
            <g className="rescue-compass" transform="translate(664 60)"><text textAnchor="middle" y={-22}>{t.north}</text><path d="M0 -12 L-6 8 L0 4 L6 8 Z" fill="#cfb98e"/><line y1={4} y2={30}/></g>
            <text className="rescue-sea-name" x={570} y={394} textAnchor="middle">{t.sea}</text>
            {islandOutlines.map(island=><g key={island.id} className="rescue-island" data-island={island.id} data-emphasis={place===null ? "default" : routeSelected(island.id) ? "selected" : "muted"} role="button" tabIndex={0} aria-label={t.placeLabels[island.id]} aria-pressed={place===island.id} onClick={()=>togglePlace(island.id)} onKeyDown={e=>keyActivate(e,island.id)}><path className="rescue-island-outline" d={island.d} fill={island.color} stroke={island.color} vectorEffect="non-scaling-stroke"/></g>)}
            {routes.map(route=><g key={route.id} className="rescue-route" data-route={route.id} data-emphasis={routeSelected(route.id) ? "selected" : "muted"} role="button" tabIndex={0} aria-label={`${t.placeLabels[route.id]} · ${t.routeLabel}`} aria-pressed={place===route.id} onClick={()=>togglePlace(route.id)} onKeyDown={e=>keyActivate(e,route.id)}><path className="rescue-route-line" d={route.d} fill="none" stroke={route.color} strokeWidth={2.5} strokeDasharray="9 7"/><path d={route.d} fill="none" stroke="transparent" strokeWidth={20}/></g>)}
            {mapPlaces.map(p=>{
              const selected=place===p.id || (p.id==="wreck" && place!==null),labelY=p.id==="miaozihu" ? 52 : -26;
              return <g key={p.id} className="rescue-place" data-place={p.id} data-emphasis={place===null || selected ? "selected" : "muted"} transform={`translate(${p.point[0]} ${p.point[1]})`} role="button" tabIndex={0} aria-label={`${t.placeLabels[p.id]} · ${t.placeRoles[p.id]}`} aria-pressed={place===p.id} onClick={()=>togglePlace(p.id)} onKeyDown={e=>keyActivate(e,p.id)}>
                <circle className="rescue-place-hit" r={23} fill="transparent"/><circle className="rescue-place-halo" r={17} fill="none" stroke={p.color}/><circle r={8} fill={p.color} stroke="#f3f3ee" strokeWidth={1.5}/><line x1={0} x2={0} y1={p.id==="miaozihu" ? 18 : -18} y2={p.id==="miaozihu" ? 33 : -23} stroke={p.color}/><text className="rescue-map-label" textAnchor="middle" y={labelY}>{t.placeLabels[p.id]}</text>
              </g>;
            })}
          </svg>
        </div>
        {globeVisible&&<RescueGlobe locale={locale} request={entryTarget} autoEnter={autoEnter} onReveal={revealMap} onFinish={finishEntry}/>}
        </div>
        <div className="rescue-map-view-controls" aria-hidden={!mapOpen}><Button variant="ghost" disabled={!mapOpen} onClick={returnToGlobe}><Globe2 size={16}/>{t.globeBack}</Button></div>
        <p className="rescue-map-scroll-hint">{mapOpen ? t.mapScroll : t.globeHint}</p>
        <div className="rescue-place-legend" role="group" aria-label={t.mapLabel}>{rescuePlaces.map(p=><Button key={p.id} variant="ghost" data-place={p.id} aria-pressed={mapOpen ? place===p.id : entryTarget===p.id} onClick={()=>togglePlace(p.id)}><i style={{background:p.color}} aria-hidden="true"/>{t.placeLabels[p.id]}</Button>)}</div>
        <a className="rescue-map-attribution" href={geographySources.map} target="_blank" rel="noreferrer">{t.globeSource}</a>
        <a className="rescue-map-attribution" href={islandCoastlines.license} target="_blank" rel="noreferrer">{t.coastlineSource}</a>
      </div>
      <aside className="rescue-map-story" aria-live="polite"><span className="eyebrow">{place ? t.placeRoles[place] : t.mapRegion}</span><h4>{place ? t.placeLabels[place] : t.mapTitle}</h4><p>{place ? t.placeBodies[place] : t.mapOverview}</p>{place && <div className="rescue-coordinate">{rescuePlaces.find(p=>p.id===place)!.label}</div>}<div className="rescue-direction-key"><i/>{t.routeLabel}</div><Button className="rescue-map-reset" variant="outline" onClick={showAllRescue}><RotateCcw size={16}/>{t.reset}</Button></aside>
    </div>
    </FullscreenView>
    <p className="rescue-map-note">{t.mapNote}</p>
    <div className="rescue-care"><h3>{t.storyTitle}</h3><ol>{t.steps.map((step,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><div><h4>{step.title}</h4><p>{step.body}</p></div></li>)}</ol><a href="#historical-data">{t.aftermath}</a></div>
    <div className="rescue-sources"><span>{t.sourcesTitle}</span><a href={rescueSources.figures} target="_blank" rel="noreferrer">{t.figuresSource}</a><a href={rescueSources.history} target="_blank" rel="noreferrer">{t.historySource}</a><a href={rescueSources.care} target="_blank" rel="noreferrer">{t.careSource}</a><a href={rescueSources.islands} target="_blank" rel="noreferrer">{t.islandSource}</a><a href={rescueSources.wreck} target="_blank" rel="noreferrer">{t.wreckSource}</a></div>
  </section>;
}
