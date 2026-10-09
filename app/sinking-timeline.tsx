"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { timelineEvents, timelineSources, timelineTranslations, timelineRailHints } from "@/lib/sinking-timeline";

// One hull-local scar follows the ship through each subsequent tilt and sinking phase.
const hullImpact = { x: 145.4, y: 467.9 };
const hullBreach = "M-36 -15 L-21 -26 L-9 -20 L4 -29 L16 -17 L31 -13 L24 0 L38 12 L21 18 L16 35 L0 26 L-14 33 L-21 20 L-36 15 L-28 2 Z";
// Match the phase-05 rotation around (365,190), including its four-unit descent.
const hitAngle = 3 * Math.PI / 180;
const hullPoint = { x: 252 + hullImpact.x * .227, y: 111 + hullImpact.y * .173828125 };
const hitPoint = {
  x: 365 + (hullPoint.x-365)*Math.cos(hitAngle) - (hullPoint.y-190)*Math.sin(hitAngle),
  y: 194 + (hullPoint.x-365)*Math.sin(hitAngle) + (hullPoint.y-190)*Math.cos(hitAngle),
};
const hitPath = `M181 269 Q237 251 ${hitPoint.x} ${hitPoint.y}`;

// Trace the supplied silhouettes in the existing scene's bounding boxes and palette.
function ShipSilhouette({phase}:{phase:number}) {
  const damaged = phase >= 3;
  return <g className="timeline-ship-shape" transform="translate(252 111) scale(.227 .173828125)">
    <defs><mask id="timeline-ship-cutouts" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="512">
      <rect width="1000" height="512" fill="white"/>
      <g fill="none" stroke="black" strokeWidth="5">
        <path d="M205 309 H501 M205 318 H501 M513 281 H853 M724 139 H784 M724 148 H784 M255 72 H319 M266 89 H309 M280 72 V89 M302 72 V89 M416 161 H496"/>
        { [260,308,356,404,452].map(x=><circle key={x} cx={x} cy="265" r="15" fill="black" stroke="none"/>) }
      </g>
      {damaged && <g className="timeline-hull-breach" data-fresh={phase===3} transform={`translate(${hullImpact.x} ${hullImpact.y})`}><path d={hullBreach} fill="black"/></g>}
    </mask></defs>
    <g mask="url(#timeline-ship-cutouts)">
      <g fill="#bacabd">
        <path d="M0 327 H1000 L990 356 H5 Z M5 365 H990 Q988 425 940 460 L970 477 Q982 485 973 492 H34 Q23 486 33 478 L61 460 Q9 427 5 365 Z"/>
        <path d="M91 0 H97 V327 H91 Z M80 74 H108 V85 H80 Z M77 88 H111 V99 H77 Z M873 91 H878 V327 H873 Z M863 146 H888 V156 H863 Z M860 159 H891 V169 H860 Z"/>
        { [260,308,356,404,452].map(x=><circle key={x} cx={x} cy="265" r="21"/>) }
      </g>
      <g fill="#9bafa4"><path d="M198 203 H508 V223 H495 V316 H210 V223 H198 Z M416 155 H496 V202 H416 Z M513 241 H852 V316 H513 Z M938 270 H988 V286 H938 Z M923 293 H988 V317 H923 Z"/></g>
      <g fill="#c5a06a"><path d="M265 88 H309 V202 H265 Z M252 65 H322 V94 H252 Z M727 126 H784 V306 H727 Z"/></g>
      <g fill="none" stroke="#bacabd"><path d="M38 327 L94 96 L154 327 M837 327 L876 166 L919 327" strokeWidth="5"/><path d="M34 496 H966 A8 8 0 0 1 966 512 H34 A8 8 0 0 1 34 496 Z" fill="#bacabd" stroke="none"/>
        { [260,308,356,404,452].map(x=><circle key={x} cx={x} cy="265" r="19" strokeWidth="6"/>) }
      </g>
    </g>
    {damaged && <g className="timeline-hull-scar" data-fresh={phase===3} transform={`translate(${hullImpact.x} ${hullImpact.y})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={hullBreach} stroke="#778a80" strokeWidth="7"/>
      <path d="M-21 -26 L-25 -43 L-39 -49 M4 -29 L8 -48 L2 -58 M31 -13 L47 -23 L57 -21 M-36 15 L-48 20 M21 18 L40 29" stroke="#61786e" strokeWidth="5"/>
    </g>}
  </g>;
}

function SubmarineSilhouette() {
  return <g className="timeline-submarine-shape" transform="translate(39 242) scale(.138 .09156626506)" fill="#7499a1">
    <defs><mask id="timeline-submarine-cutouts" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="415">
      <rect width="1000" height="415" fill="white"/>
      <g fill="black"><circle cx="365" cy="23" r="14"/><rect x="503" y="142" width="86" height="23" rx="11.5"/></g>
      <g fill="none" stroke="black" strokeWidth="9"><path d="M278 211 H604 M217 229 Q274 317 217 407"/></g>
      <path d="M253 320 H740" stroke="black" strokeWidth="23" strokeLinecap="round"/>
    </mask></defs>
    <g mask="url(#timeline-submarine-cutouts)">
      <path d="M85 229 H723 L942 285 V225 H976 V291 Q1000 296 1000 316 Q1000 332 976 337 V415 H942 V348 L723 407 H85 C-28 407-28 229 85 229 Z"/>
      <path d="M278 127 Q292 87 333 87 H546 Q604 87 604 140 V225 H278 V173 H360 V128 Z"/>
      <path d="M493 87 V33 Q493 26 501 26 Q509 26 509 33 V87 M526 87 V33 Q526 26 534 26 Q542 26 542 33 V87"/>
      <path d="M385 23 H432 V87" fill="none" stroke="#7499a1" strokeWidth="9"/>
      <circle cx="365" cy="23" r="23"/>
    </g>
  </g>;
}

// Keep the rescue symbols compact enough to read within the timeline scene.
function FishingBoatIcon() {
  return <g className="timeline-fishing-boat" strokeLinecap="round" strokeLinejoin="round">
    <path d="M-1 -25 Q8 -24 14 -7 L-1 -5 Z" fill="#c5a06a" fillOpacity=".88" stroke="#d7bc8e" strokeWidth=".65"/>
    <path d="M-4 -18 Q-10 -14 -12 -5 L-4 -4 Z" fill="#c5a06a" fillOpacity=".5" stroke="#c5a06a" strokeWidth=".6"/>
    <g fill="none" stroke="#16323b" strokeOpacity=".5" strokeWidth=".7">
      <path d="M-1 -20 L5 -19 M-1 -15 L9 -14 M-1 -10 L12 -9 M-4 -12 L-8 -10 M-4 -7 L-11 -6"/>
    </g>
    <path d="M-2 -27 V1 M-13 -3 L-2 -25 M-2 -25 L17 0" fill="none" stroke="#c5a06a" strokeWidth=".8"/>
    <path d="M5 -3 H11 L13 1 H4 Z" fill="#ac8956" stroke="#d7bc8e" strokeWidth=".55"/>
    <path d="M-18 -1 Q-2 2 18 -1 L12 7 Q0 11 -12 7 Z" fill="#c5a06a"/>
    <path d="M-18 -1 Q-2 2 18 -1" fill="none" stroke="#e1c99f" strokeWidth="1"/>
    <path d="M-12 4 Q0 7 12 4" fill="none" stroke="#806640" strokeWidth=".75"/>
  </g>;
}

// The supplied rounded nose and split tail face along the direction of travel.
function TravellingTorpedo({ path, delay = 0, impact = false }: { path: string; delay?: number; impact?: boolean }) {
  return <g className="timeline-torpedo" style={{offsetPath:`path("${path}")`,animationDelay:`${delay}s`}} fill={impact ? "#b45463" : "#c5a06a"}>
    <g transform="scale(.8)">
      <path d="M-14 -3.3 H15 C20 -3.3 20 3.3 15 3.3 H-14 Z"/>
      <path d="M-20 -3.75 H-15 V3.75 H-20 Q-20 1.1 -17.5 1.1 V-1.1 Q-20 -1.1 -20 -3.75 Z"/>
    </g>
  </g>;
}

function TimelineScene({ index, locale }: { index: number; locale: Locale }) {
  const t = timelineTranslations[locale];
  const phase = timelineEvents[index].phase;
  return <svg className="timeline-scene" viewBox={phase >= 7 ? "205 175 370 165" : "0 0 600 340"} aria-hidden="true" data-phase={phase}>
    <defs>
      <linearGradient id="timeline-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#41636a" stopOpacity=".2"/><stop offset="1" stopColor="#132e36" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <g className="timeline-night">
      <circle cx="492" cy="40" r="15" fill="#d7c299"/>
      {[[52,42],[133,24],[256,61],[375,18],[550,82],[201,87]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="1.4" fill="#c5d4cc"/>) }
    </g>
    <path className="timeline-horizon" d="M18 204 H582"/>
    <path d="M18 205 H582 V338 H18 Z" fill="url(#timeline-sea)"/>
    <g className="timeline-ship" style={{transform: phase < 3 ? "translate(0px, 0px) rotate(0deg)" : phase < 4 ? "translate(0px, 4px) rotate(3deg)" : phase < 6 ? "translate(0px, 15px) rotate(8deg)" : "translate(0px, 82px) rotate(24deg)"}}>
      <ShipSilhouette phase={phase}/>
      <text x="360" y="102" textAnchor="middle" className="timeline-scene-label">{t.ship}</text>
    </g>
    <g className="timeline-submarine">
      <SubmarineSilhouette/>
      <text x="108" y="311" textAnchor="middle" className="timeline-scene-label">{t.submarine}</text>
    </g>
    {phase === 1 && <path key="approach" className="timeline-approach" d="M194 284 Q260 277 260 252" fill="none" stroke="#c5a06a" strokeDasharray="4 8"/>}
    {phase === 2 && <g key="salvo" className="timeline-salvo">{[0,1,2].map(i => {
      const path = `M181 ${264+i*7} Q245 ${266+i*7} 290 ${250+i*7} T507 ${248+i*7}`;
      return <g key={i}><path pathLength="1" style={{animationDelay:`${i * .22}s`}} d={path} fill="none" stroke="#c5a06a" strokeOpacity=".35" strokeWidth="1.2"/><TravellingTorpedo path={path} delay={i * .22}/></g>;
    })}</g>}
    {phase === 3 && <g key="hit"><path className="timeline-hit-path" pathLength="1" d={hitPath} fill="none" stroke="#b45463" strokeOpacity=".4" strokeWidth="1.5"/><TravellingTorpedo path={hitPath} impact/><circle className="timeline-impact" cx={hitPoint.x} cy={hitPoint.y} r="13" fill="none" stroke="#b45463" strokeWidth="2"/></g>}
    <g className="timeline-island">
      <g fill="none" stroke="#c5a06a" strokeLinecap="round" strokeLinejoin="round">
        <path d="M430 239 Q437 235 442 230 L448 220 Q454 218 461 216 L469 206 Q473 212 479 219 L492 223 Q497 231 504 237 L516 241" strokeWidth="1.5"/>
        <path d="M449 227 Q457 224 462 219 M470 213 L468 223 L474 226 M488 230 L495 236" strokeWidth=".7" strokeOpacity=".6"/>
        <path d="M435 243 Q474 248 511 244" strokeWidth=".7" strokeOpacity=".35"/>
      </g>
      <text x="461" y="309" textAnchor="middle" className="timeline-scene-label">{t.islands}</text>
    </g>
    <g className="timeline-boats">
      {[[330,249],[378,282],[278,304]].map(([x,y],i) => <g key={x} transform={`translate(${x} ${y})`} style={{transitionDelay:`${i * .08}s`}}><FishingBoatIcon/></g>)}
    </g>
    {phase >= 7 && <path key={index} className="timeline-rescue-path" pathLength="1" d="M448 244 Q397 238 359 259 Q319 281 293 299" fill="none" stroke="#9dbbaf" strokeWidth="1.5" strokeDasharray="5 8"/>}
    <g className="timeline-water" fill="none" stroke="#78999c" strokeOpacity=".38" strokeWidth="1">
      <path d="M28 216 Q64 211 100 216 T244 216 T388 216 T568 216"/>
      <path d="M36 235 Q74 230 113 235 T267 235 T421 235 T574 235"/>
      <path d="M181 306 Q221 301 261 306 M430 315 Q481 310 532 315"/>
    </g>
  </svg>;
}

export default function SinkingTimeline({ locale }: { locale: Locale }) {
  const t = timelineTranslations[locale];
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLElement>(null);
  const steps = useRef<(HTMLElement | null)[]>([]);
  const frame = useRef(0);
  const scrollTarget = useRef(0);
  const scrollTargetTop = useRef(0);
  const gesture = useRef<{pointerId:number;x:number;y:number;locked:boolean} | null>(null);
  const rail = useRef<HTMLOListElement>(null);
  const railMarker = useRef<HTMLLIElement>(null);
  // Measure once at gesture start; pointer frames only update transforms and scroll.
  const railDrag = useRef<{id:number;y:number;startY:number;scroll:number;position:number;centers:number[];scale:number;gain:number;index:number;moved:boolean;edgeDistance:number;velocity:number;lastPosition:number;lastY:number;height:number;low:number;high:number;edgeTop:number;edgeBottom:number;edge:number} | null>(null);
  const railFrame = useRef(0);
  const railTick = useRef<((now:number)=>void) | null>(null);
  const skipRailClick = useRef(false);
  const horizontalWheel = useRef({last:0,total:0,advanced:false});

  function pointerDown(event: PointerEvent<HTMLElement>) {
    if (!event.isPrimary || event.button !== 0 || (event.target as Element).closest("button,a")) return;
    gesture.current = {pointerId:event.pointerId,x:event.clientX,y:event.clientY,locked:false};
  }
  function pointerMove(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const x = Math.abs(event.clientX-start.x), y = Math.abs(event.clientY-start.y);
    if (!start.locked && y > 12 && y > x) {gesture.current = null;return;}
    if (!start.locked && x > 12 && x > y * 1.3) {
      start.locked = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (start.locked) event.preventDefault();
  }
  function pointerUp(event: PointerEvent<HTMLElement>) {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const x = event.clientX-start.x, y = event.clientY-start.y;
    const threshold = Math.min(60, Math.max(30, event.currentTarget.clientWidth * .1));
    if (Math.abs(x) >= threshold && Math.abs(x) > Math.abs(y) * 1.3) goTo(Math.max(0,Math.min(timelineEvents.length-1, active+(x < 0 ? 1 : -1))));
  }

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      if (railDrag.current?.moved || performance.now()<scrollTarget.current) return;
      const bounds = root.current?.getBoundingClientRect();
      if (!bounds || bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const compact = window.matchMedia("(max-width: 800px)").matches;
      const viewportTop = window.visualViewport?.offsetTop ?? 0;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const stageBottom = stage.current?.getBoundingClientRect().bottom ?? 0;
      const readingLine = compact ? Math.max(stageBottom + 70, viewportTop + viewportHeight * .6) : viewportTop + Math.min(viewportHeight * .48, 540);
      let next = 0;
      steps.current.forEach((step, i) => {if (step && step.getBoundingClientRect().top <= readingLine) next = i;});
      setActive(current => current === next ? current : next);
    };
    const schedule = () => {if (!frame.current) frame.current = requestAnimationFrame(update);};
    const releaseScrollTarget=()=>{if(Math.abs(window.scrollY-scrollTargetTop.current)<2){scrollTarget.current=0;schedule();}};
    const interruptScroll=()=>{scrollTarget.current=0;};
    window.addEventListener("scrollend",releaseScrollTarget);
    window.addEventListener("wheel",interruptScroll,{passive:true,capture:true});
    window.addEventListener("pointerdown",interruptScroll,{passive:true,capture:true});
    window.addEventListener("scroll", schedule, {passive: true});
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    if (root.current) resize.observe(root.current);
    schedule();
    return () => {window.removeEventListener("scrollend",releaseScrollTarget);window.removeEventListener("wheel",interruptScroll,true);window.removeEventListener("pointerdown",interruptScroll,true);window.removeEventListener("scroll", schedule);window.removeEventListener("resize", schedule);resize.disconnect();cancelAnimationFrame(frame.current);frame.current = 0;};
  }, []);

  const goTo = useCallback((index: number, instant = false) => {
    const step = steps.current[index];
    if (!step) return;
    scrollTarget.current=performance.now()+1300;
    setActive(index);
    const compact = window.matchMedia("(max-width: 800px)").matches;
    const viewportTop = window.visualViewport?.offsetTop ?? 0;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const stageHeight = stage.current?.getBoundingClientRect().height ?? 220;
    const offset = viewportTop + (compact ? stageHeight + 32 : Math.min(viewportHeight * .32, 400));
    const firstTop = steps.current[0]?.getBoundingClientRect().top ?? 0;
    const minimum = window.scrollY + firstTop - viewportTop - (compact ? stageHeight : 24);
    scrollTargetTop.current=Math.max(minimum, window.scrollY + step.getBoundingClientRect().top - offset);
    window.scrollTo({top:scrollTargetTop.current, behavior:instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"});
  }, []);


  function dragRail(event:PointerEvent<HTMLElement>,index?:number) {
    if(!event.isPrimary || event.button!==0 || !rail.current)return;
    event.preventDefault();
    event.currentTarget.focus({preventScroll:true});
    event.currentTarget.setPointerCapture(event.pointerId);
    skipRailClick.current=false;
    window.scrollTo({top:window.scrollY,behavior:"instant"});
    const bounds=rail.current.getBoundingClientRect();
    const scale=bounds.height/Math.max(1,rail.current.offsetHeight);
    const centers=steps.current.map(step=>{
      const dot=step?.querySelector(".timeline-dot")?.getBoundingClientRect();
      return dot ? dot.top+dot.height/2-bounds.top : 0;
    });
    const position=Math.max(0,Math.min(bounds.height,event.clientY-bounds.top));
    const nearest=centers.reduce((best,y,i)=>Math.abs(y-position)<Math.abs(centers[best]-position)?i:best,0);
    const spacing=(centers.at(-1)!-centers[0])/(centers.length-1);
    const viewport=window.visualViewport;
    const viewportTop=viewport?.offsetTop ?? 0,height=viewport?.height ?? window.innerHeight;
    const compact=window.matchMedia("(max-width: 800px)").matches;
    const stageBounds=stage.current?.getBoundingClientRect();
    const edgeTop=compact ? Math.max(viewportTop,stageBounds?.bottom ?? viewportTop) : viewportTop;
    const low=Math.min(window.scrollY,Math.max(0,window.scrollY+(steps.current[0]?.getBoundingClientRect().top ?? bounds.top)-viewportTop-(compact ? stageBounds?.height ?? 220 : 24)));
    const high=Math.max(window.scrollY,low,window.scrollY+(steps.current.at(-1)?.getBoundingClientRect().top ?? bounds.bottom)-viewportTop-(compact ? (stageBounds?.height ?? 220)+32 : Math.min(height*.32,400)));
    railDrag.current={height:bounds.height,low,high,edgeTop,edgeBottom:viewportTop+height,edge:Math.min(120,(viewportTop+height-edgeTop)*.2),id:event.pointerId,y:event.clientY,startY:event.clientY,scroll:window.scrollY,position,centers,scale,gain:Math.max(1,spacing/110),index:index??nearest,moved:false,edgeDistance:0,velocity:0,lastPosition:position,lastY:event.clientY};
    setActive(index??nearest);
    let last=performance.now();
    const tick=(now:number)=>{
      const drag=railDrag.current;
      if(!drag)return;
      const dt=Math.min(32,now-last);last=now;
      if(drag.moved){
        const amount=drag.y<drag.edgeTop+drag.edge ? -Math.min(1,(drag.edgeTop+drag.edge-drag.y)/drag.edge) : drag.y>drag.edgeBottom-drag.edge ? Math.min(1,(drag.y-drag.edgeBottom+drag.edge)/drag.edge) : 0;
        // Ease edge acceleration, while direct hand movement stays immediate.
        const targetVelocity=amount*Math.abs(amount)*1.7;
        drag.velocity+=(targetVelocity-drag.velocity)*(1-Math.exp(-dt/85));
        drag.edgeDistance+=drag.velocity*dt;
        const delta=drag.y-drag.startY;
        const position=Math.max(0,Math.min(drag.height,drag.position+delta*drag.gain+drag.edgeDistance));
        if(Math.abs(position-drag.lastPosition)>.05 || Math.abs(drag.y-drag.lastY)>.05){
          drag.lastPosition=position;drag.lastY=drag.y;
          const nearest=drag.centers.reduce((best,y,i)=>Math.abs(y-position)<Math.abs(drag.centers[best]-position)?i:best,drag.index);
          if(nearest!==drag.index){drag.index=nearest;setActive(nearest);}
          const targetScroll=drag.scroll+position-drag.position-delta;
          window.scrollTo({top:Math.max(drag.low,Math.min(drag.high,targetScroll)),behavior:"instant"});
          const markerPosition=Math.max(0,Math.min(drag.height,position+window.scrollY-targetScroll));
          if(railMarker.current)railMarker.current.style.transform=`translate3d(0,${markerPosition/drag.scale}px,0) translateY(-50%)`;
        }
      }
      railFrame.current=requestAnimationFrame(tick);
    };
    railTick.current=tick;
    railFrame.current=requestAnimationFrame(tick);
  }
  function moveRail(event:PointerEvent<HTMLElement>) {
    const drag=railDrag.current;
    if(!drag || drag.id!==event.pointerId)return;
    drag.y=event.clientY;
    if(!drag.moved && Math.abs(drag.y-drag.startY)>2){
      drag.moved=true;
      if(rail.current)rail.current.dataset.dragging="true";
      if(railMarker.current)railMarker.current.style.transform=`translate3d(0,${drag.position/drag.scale}px,0) translateY(-50%)`;
    }
    if(drag.moved){event.preventDefault();skipRailClick.current=true;}
  }
  function finishRail(event:PointerEvent<HTMLElement>,cancelled=false) {
    const drag=railDrag.current;
    if(!drag || drag.id!==event.pointerId)return;
    cancelAnimationFrame(railFrame.current);
    if(drag.moved && !cancelled){drag.y=event.clientY;railTick.current?.(performance.now());}
    railDrag.current=null;railTick.current=null;cancelAnimationFrame(railFrame.current);
    if(rail.current)rail.current.dataset.dragging="false";
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    skipRailClick.current=false;
    if(!cancelled){skipRailClick.current=event.currentTarget.classList.contains("timeline-dot");setActive(drag.index);goTo(drag.index);}
  }
  useEffect(()=>()=>cancelAnimationFrame(railFrame.current),[]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) < 1 || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.3) return;
      event.preventDefault();
      const now = performance.now(), input = horizontalWheel.current;
      if (now-input.last > 180) {input.total = 0;input.advanced = false;}
      input.last = now;
      if (input.advanced) return;
      input.total += event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1);
      if (Math.abs(input.total) >= 45) {
        input.advanced = true;
        goTo(Math.max(0,Math.min(timelineEvents.length-1,active+(input.total > 0 ? 1 : -1))));
      }
    };
    element.addEventListener("wheel", wheel, {passive:false});
    return () => element.removeEventListener("wheel", wheel);
  }, [active, goTo]);

  return <section ref={root} id="sinking-timeline" className="sinking-timeline-section" aria-labelledby="sinking-timeline-title">
    <div className="timeline-heading"><div className="eyebrow">{t.eyebrow}</div><h2 id="sinking-timeline-title">{t.title}</h2><p>{t.intro}</p><p id="timeline-gesture-hint" className="timeline-scroll-hint"><ArrowDown size={17} aria-hidden="true"/>{t.hint} {timelineRailHints[locale]}</p></div>
    <div className="timeline-layout">
      <figure ref={stage} id="timeline-stage" className="timeline-stage" data-active={timelineEvents[active].id} aria-label={t.sceneLabel} aria-describedby="timeline-gesture-hint" tabIndex={0} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{gesture.current=null;}} onKeyDown={event=>{if(event.key === "ArrowLeft" || event.key === "ArrowRight"){event.preventDefault();goTo(Math.max(0,Math.min(timelineEvents.length-1,active+(event.key === "ArrowRight" ? 1 : -1))));}}}>
        <div className="timeline-stage-top"><span>{t.events[active].date}</span><span className="timeline-count">{String(active+1).padStart(2,"0")} / {String(timelineEvents.length).padStart(2,"0")}</span></div>
        <div className="timeline-stage-time">{t.events[active].time}</div>
        <TimelineScene index={active} locale={locale}/>
        <figcaption>{t.events[active].title}</figcaption>
        <div className="timeline-chapter-nav" style={{gridTemplateColumns:`repeat(${timelineEvents.length}, minmax(0, 1fr))`}} role="group" aria-label={t.chapters}>{timelineEvents.map((event,i) => <button type="button" key={event.id} aria-current={active === i ? "step" : undefined} aria-label={`${String(i+1).padStart(2,"0")} · ${t.events[i].date} · ${t.events[i].title}`} onClick={() => goTo(i)}>{String(i+1).padStart(2,"0")}</button>)}</div>
      </figure>
      <ol ref={rail} className="timeline-chapters" onPointerDownCapture={event=>{event.currentTarget.dataset.input="pointer";}} onKeyDownCapture={event=>{event.currentTarget.dataset.input="keyboard";}} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))delete event.currentTarget.dataset.input;}}>
        <li className="timeline-rail-control" role="presentation"><button type="button" className="timeline-rail-hit" role="slider" aria-label={t.chapters} aria-controls="timeline-stage" aria-valuemin={1} aria-valuemax={timelineEvents.length} aria-valuenow={active+1} aria-valuetext={t.events[active].title} aria-orientation="vertical" onPointerDown={event=>dragRail(event)} onPointerMove={moveRail} onPointerUp={event=>finishRail(event)} onPointerCancel={event=>finishRail(event,true)} onLostPointerCapture={event=>finishRail(event,true)} onKeyDown={event=>{let index=active;if(event.key==="ArrowDown"||event.key==="ArrowRight")index=Math.min(timelineEvents.length-1,active+1);else if(event.key==="ArrowUp"||event.key==="ArrowLeft")index=Math.max(0,active-1);else if(event.key==="Home")index=0;else if(event.key==="End")index=timelineEvents.length-1;else return;event.preventDefault();goTo(index);}}/></li>
        <li ref={railMarker} className="timeline-drag-marker" aria-hidden="true"/>{timelineEvents.map((event,i) => <li key={event.id} ref={element => {steps.current[i] = element;}} id={`timeline-${event.id}`} className="timeline-chapter" data-active={active === i}>
        <button type="button" className="timeline-dot" aria-label={`${t.events[i].date} · ${t.events[i].title}`} aria-controls="timeline-stage" aria-current={active === i ? "step" : undefined} onPointerDown={event=>dragRail(event,i)} onPointerMove={moveRail} onPointerUp={event=>finishRail(event)} onPointerCancel={event=>finishRail(event,true)} onLostPointerCapture={event=>finishRail(event,true)} onClick={() => {if(skipRailClick.current){skipRailClick.current=false;return;}goTo(i);}} onKeyDown={event=>{let index=i;if(event.key==="ArrowDown")index=Math.min(timelineEvents.length-1,i+1);else if(event.key==="ArrowUp")index=Math.max(0,i-1);else if(event.key==="Home")index=0;else if(event.key==="End")index=timelineEvents.length-1;else return;event.preventDefault();goTo(index);steps.current[index]?.querySelector<HTMLButtonElement>(".timeline-dot")?.focus({preventScroll:true});}}/>
        <div className="timeline-chapter-content"><span className="timeline-step-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span><time dateTime={event.date}>{t.events[i].date}</time><div className="timeline-chapter-time">{t.events[i].time}</div><h3>{t.events[i].title}</h3><p>{t.events[i].body}</p>{t.events[i].note && <p className="timeline-editorial-note">{t.events[i].note}</p>}<a className="timeline-source-link" href={timelineSources[event.source]} target="_blank" rel="noreferrer">{t.sourceLink}<span aria-hidden="true"> ↗</span></a>{event.id === "departure" && <a className="timeline-source-link" href={timelineSources.destination} target="_blank" rel="noreferrer">{t.destinationSourceLink}<span aria-hidden="true"> ↗</span></a>}</div>
      </li>)}</ol>
    </div>
    <p className="timeline-illustration-note">{t.illustrationNote}</p>
    <div className="timeline-aftermath"><h3>{t.afterTitle}</h3><p>{t.afterBody}</p><a className="timeline-source-link" href={timelineSources.return} target="_blank" rel="noreferrer">{t.returnLink}<span aria-hidden="true"> ↗</span></a></div>
  </section>;
}
