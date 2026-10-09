"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { numberLocales, type Locale } from "@/lib/i18n";

const labels: Record<Locale, {nav:string;previous:string;next:string;current:string}> = {
  zh:{nav:"板块翻页导航",previous:"上一页",next:"下一页",current:"当前板块"},
  en:{nav:"Section navigation",previous:"Previous page",next:"Next page",current:"Current section"},
  ja:{nav:"セクションのページ案内",previous:"前のページ",next:"次のページ",current:"現在のセクション"},
  fr:{nav:"Navigation par section",previous:"Page précédente",next:"Page suivante",current:"Section actuelle"},
  ko:{nav:"섹션 페이지 탐색",previous:"이전 페이지",next:"다음 페이지",current:"현재 섹션"},
  es:{nav:"Navegación por secciones",previous:"Página anterior",next:"Página siguiente",current:"Sección actual"},
  ar:{nav:"التنقل بين الأقسام",previous:"الصفحة السابقة",next:"الصفحة التالية",current:"القسم الحالي"},
};
type Page = {id:string;title:string};
type MeasuredPage = Page & {element:HTMLElement;start:number;end:number};

/** Keep document scrolling, sticky scenes and existing reading interactions intact. */
export default function SectionPages({locale}:{locale:Locale}) {
  const [pages,setPages]=useState<Page[]>([]),[current,setCurrent]=useState(0);
  const refresh=useRef<()=>void>(()=>{}),navigate=useRef<(index:number)=>void>(()=>{});
  const buttons=useRef<(HTMLButtonElement|null)[]>([]),turn=useRef<(sign:number)=>void>(()=>{});
  const t=labels[locale];
  useEffect(()=>{
    const main=document.getElementById("memorial-main"),header=document.querySelector<HTMLElement>(".site-header");
    if(!main || !header)return;
    const root=document.documentElement;
    const elements=Array.from(main.children).filter((element):element is HTMLElement=>element instanceof HTMLElement && element.tagName==="SECTION");
    let measured:MeasuredPage[]=[],active=0,scrollFrame=0,measureFrame=0,animationFrame=0,settleTimer=0;
    let paging=false,locked=false,lastWheel=0,lastWheelDelta=0,wheelTotal=0,direction=1,naturalScroll=false,pointerHeld=false;
    let wheelJourney:{from:number;to:number}|null=null;
    let arrival:{index:number;end:boolean;until:number}|null=null;
    let touch:{x:number;y:number;index:number;from:number;forward:boolean;backward:boolean;ignored:boolean;locked:boolean}|null=null;
    let headingMotion:Animation|null=null;
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const viewport=()=>({top:window.visualViewport?.offsetTop??0,height:window.visualViewport?.height??innerHeight});
    const suspended=()=>document.body.style.overflow==="hidden" || !!document.querySelector('.fullscreen-view[data-fullscreen="true"],[data-slot="sheet-overlay"][data-state="open"]') || ((window.visualViewport?.scale??1)>1.001 && !matchMedia("(hover:hover) and (pointer:fine)").matches);
    function pulse(index:number){
      if(reduced.matches)return;
      const heading=measured[index]?.element.querySelector<HTMLElement>('h1,h2');
      headingMotion?.cancel();
      headingMotion=heading?.animate([{opacity:.7,transform:"translateY(12px)"},{opacity:1,transform:"translateY(0)"}],{duration:480,easing:"cubic-bezier(.22,.61,.36,1)"})??null;
    }
    function update(){
      scrollFrame=0;
      const v=viewport(),line=scrollY+v.top+v.height*.24;
      let next=0;
      measured.forEach((page,index)=>{if(page.start<=line)next=index;});
      if(next!==active){active=next;setCurrent(next);pulse(next);
        header!.querySelectorAll<HTMLAnchorElement>("nav a").forEach(link=>{const selected=link.hash===`#${measured[next]?.id}`;link.classList.toggle("nav-active",selected);if(selected)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");});
      }
    }
    function schedule(){if(!scrollFrame)scrollFrame=requestAnimationFrame(update);}
    function measure(){
      measureFrame=0;
      const fit=parseFloat(getComputedStyle(document.body).zoom)||1;
      const v=viewport(),touchZoom=(window.visualViewport?.scale??1)>1.001 && !matchMedia("(hover:hover) and (pointer:fine)").matches;
      const height=(touchZoom?innerHeight:v.height)/fit;
      const properties={"--section-page-height":`${height}px`,"--section-header-height":`${header!.getBoundingClientRect().height/fit}px`};
      for(const [name,value] of Object.entries(properties))if(root.style.getPropertyValue(name)!==value)root.style.setProperty(name,value);
      root.dataset.sectionPages="true";
      // Size the primary visual from the space its actual heading and controls leave.
      // Notes stay in the document, rather than hiding them or shrinking all typography.
      if(!suspended()){
        const stars=main!.querySelector<HTMLElement>('.names-stars-section'),canvas=stars?.querySelector<HTMLElement>('.names-stars-canvas');
        if(stars && canvas){
          const style=getComputedStyle(stars);
          const chrome=Array.from(stars.children).reduce((sum,child)=>{const s=getComputedStyle(child);return sum+child.getBoundingClientRect().height/fit+parseFloat(s.marginTop)+parseFloat(s.marginBottom);},parseFloat(style.paddingTop)+parseFloat(style.paddingBottom))-canvas.getBoundingClientRect().height/fit;
          const value=`${Math.max(220,Math.min(570,height-chrome))}px`;
          if(stars.style.getPropertyValue('--page-star-height')!==value)stars.style.setProperty('--page-star-height',value);
        }
        const poppies=main!.querySelector<HTMLElement>('.poppy-ritual'),field=poppies?.querySelector<HTMLElement>('.poppy-field'),poppyFooter=poppies?.querySelector<HTMLElement>('.poppy-field-footer');
        if(poppies && field && poppyFooter && innerWidth>700){
          // Use the lower reading-page space for the flowers, reserving the complete footer.
          const panel=field.parentElement!,bottom=parseFloat(getComputedStyle(panel).paddingBottom)+parseFloat(getComputedStyle(poppies).paddingBottom);
          const space=height-(field.getBoundingClientRect().top-poppies.getBoundingClientRect().top+poppyFooter.getBoundingClientRect().height)/fit-bottom-24;
          const value=`${Math.max(180,Math.min(560,space))}px`;
          if(poppies.style.getPropertyValue('--page-poppy-height')!==value)poppies.style.setProperty('--page-poppy-height',value);
        }
        const history=main!.querySelector<HTMLElement>('.historical-data-section'),charts=history?.querySelector<HTMLElement>('.historical-charts');
        if(history && charts && innerWidth>700){
          const overhead=Math.max(...Array.from(charts.querySelectorAll<HTMLElement>('.historical-chart')).map(figure=>{const graphic=figure.querySelector('.waffle-svg,.donut-wrap');return (figure.getBoundingClientRect().height-(graphic?.getBoundingClientRect().height??0))/fit;}));
          const style=getComputedStyle(charts),bottom=parseFloat(getComputedStyle(history).paddingBottom);
          const space=height-(charts.getBoundingClientRect().top-history.getBoundingClientRect().top)/fit-bottom;
          const value=`${Math.max(120,Math.min(310,space-overhead-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)))}px`;
          if(history.style.getPropertyValue('--page-chart-size')!==value)history.style.setProperty('--page-chart-size',value);
        }
        const topology=main!.querySelector<HTMLElement>('.topology-section'),graph=topology?.querySelector<HTMLElement>('.topology-canvas');
        if(topology && graph){
          const workspace=topology.querySelector<HTMLElement>('.fullscreen-topology'),notes=topology.querySelector<HTMLElement>('.topology-notes');
          if(innerWidth>700 && workspace && notes){
            // Reserve the actual footnote and source links before sizing the entire workspace.
            // The graph and its tools share this budget, including selected-node reading.
            const notesStyle=getComputedStyle(notes);
            const chrome=(workspace.getBoundingClientRect().top-topology.getBoundingClientRect().top+notes.getBoundingClientRect().height)/fit+parseFloat(notesStyle.marginTop)+parseFloat(getComputedStyle(topology).paddingBottom)+8;
            const value=`${Math.max(220,Math.min(900,height-chrome))}px`;
            if(topology.style.getPropertyValue('--page-topology-workspace-height')!==value)topology.style.setProperty('--page-topology-workspace-height',value);
          }else{
            const value=`${Math.max(280,height-(graph.getBoundingClientRect().top-topology.getBoundingClientRect().top)/fit-parseFloat(getComputedStyle(topology).paddingBottom))}px`;
            if(topology.style.getPropertyValue('--page-topology-height')!==value)topology.style.setProperty('--page-topology-height',value);
          }
        }
        const setHeight=(section:HTMLElement,surface:HTMLElement,property:string,minimum:number,maximum:number,ownPage=false)=>{
          const anchor=ownPage?section.querySelector<HTMLElement>('.rescue-map-heading'):section;
          const space=height-(surface.getBoundingClientRect().top-(anchor??section).getBoundingClientRect().top)/fit-24;
          const value=`${Math.max(minimum,Math.min(maximum,space))}px`;
          if(section.style.getPropertyValue(property)!==value)section.style.setProperty(property,value);
        };
        // These workspaces must fit the space below their real headings, not their width.
        if(innerWidth>700){
          const holds=main!.querySelector<HTMLElement>('.ship-holds-section'),layout=holds?.querySelector<HTMLElement>('.ship-holds-layout'),sources=holds?.querySelector<HTMLElement>('.ship-holds-source');
          if(holds && layout && sources){
            const sourceStyle=getComputedStyle(sources);
            const chrome=(layout.getBoundingClientRect().top-holds.getBoundingClientRect().top+sources.getBoundingClientRect().height)/fit+parseFloat(sourceStyle.marginTop)+parseFloat(getComputedStyle(holds).paddingBottom)+8;
            const value=`${Math.max(300,Math.min(760,height-chrome))}px`;
            if(holds.style.getPropertyValue('--page-holds-height')!==value)holds.style.setProperty('--page-holds-height',value);
          }
          const geography=main!.querySelector<HTMLElement>('.geography-section'),voyage=geography?.querySelector<HTMLElement>('.fullscreen-voyage');
          if(geography && voyage)setHeight(geography,voyage,'--page-voyage-height',360,760);
        }
        if(innerWidth>800){
          const timeline=main!.querySelector<HTMLElement>('.sinking-timeline-section'),stage=timeline?.querySelector<HTMLElement>('.timeline-stage');
          if(timeline && stage){
            const layout=timeline.querySelector<HTMLElement>('.timeline-layout')!;
            setHeight(timeline,layout,'--page-timeline-height',300,650);
          }
        }
        if(innerWidth>700){
          const archive=main!.querySelector<HTMLElement>('.memory-archive'),workspace=archive?.querySelector<HTMLElement>('.fullscreen-archive');
          if(archive && workspace)setHeight(archive,workspace,'--page-archive-height',370,800);
          const rescue=main!.querySelector<HTMLElement>('.rescue-section'),map=rescue?.querySelector<HTMLElement>('.fullscreen-rescue');
          if(rescue && map){
            const panel=map.querySelector<HTMLElement>('.rescue-map-panel'),stage=map.querySelector<HTMLElement>('.rescue-map-stage'),bar=map.querySelector<HTMLElement>('.fullscreen-bar');
            const natural=panel && stage ? (panel.getBoundingClientRect().width*2/3+panel.getBoundingClientRect().height-stage.getBoundingClientRect().height+(bar?.getBoundingClientRect().height??0))/fit : 850;
            setHeight(rescue,map,'--page-rescue-height',480,Math.min(850,natural),true);
          }
        }
      }
      measured=elements.map((element,index)=>{
        element.dataset.sectionPage="true";
        const rect=element.getBoundingClientRect();
        return {element,id:index===0?"top":element.id,title:element.querySelector<HTMLElement>('h1,h2')?.innerText?.replace(/\s+/g," ").trim()??element.id,start:index===0?0:scrollY+rect.top,end:scrollY+rect.bottom};
      });
      setPages(old=>old.length===measured.length && old.every((page,i)=>page.id===measured[i].id && page.title===measured[i].title)?old:measured.map(({id,title})=>({id,title})));
      // Keep an arrival aligned while record pagination and responsive panels settle.
      if(arrival && performance.now()<arrival.until && !paging && !pointerHeld && !suspended()){
        const page=measured[arrival.index],v=viewport();
        if(page)window.scrollTo({top:arrival.index===0 && !arrival.end?0:Math.max(0,(arrival.end?Math.max(page.start,page.end-v.height):page.start)-v.top),behavior:"instant"});
      }
      update();
    }
    function scheduleMeasure(){if(!measureFrame)measureFrame=requestAnimationFrame(measure);}
    function stop(){cancelAnimationFrame(animationFrame);animationFrame=0;paging=false;delete root.dataset.sectionTurning;}
    function go(index:number,end=false,historyMode:"replace"|"push"|"none"="replace",readingTarget?:number){
      if(suspended())return;
      const page=measured[index];if(!page)return;
      stop();clearTimeout(settleTimer);naturalScroll=false;
      arrival=readingTarget===undefined?{index,end,until:performance.now()+1600}:null;
      // Camera panning and asynchronous content can move a section without resizing it.
      const rect=page.element.getBoundingClientRect();page.start=index===0?0:scrollY+rect.top;page.end=scrollY+rect.bottom;
      const v=viewport(),from=scrollY;
      const target=Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,readingTarget??(end?Math.max(page.start,page.end-v.height)-v.top:index===0?0:page.start-v.top)));
      if(historyMode!=="none"){
        const url=new URL(location.href);url.hash=page.id;
        if(historyMode==="push" && location.hash!==url.hash)history.pushState(null,"",url);else history.replaceState(null,"",url);
      }
      // Far-away chapter links arrive directly; adjacent pages gently accelerate and settle.
      if(reduced.matches || Math.abs(target-from)>v.height*2.5 || Math.abs(target-from)<1){window.scrollTo({top:target,behavior:"instant"});update();pulse(index);return;}
      paging=true;root.dataset.sectionTurning="true";
      window.scrollTo({top:from,behavior:"instant"});
      const start=performance.now(),duration=Math.min(500,Math.max(280,Math.abs(target-from)/v.height*440));
      const tick=(now:number)=>{
        const progress=Math.min(1,(now-start)/duration),ease=progress*progress*(3-2*progress);
        window.scrollTo({top:from+(target-from)*ease,behavior:"instant"});
        if(progress<1)animationFrame=requestAnimationFrame(tick);else{
          stop();
          if(readingTarget===undefined){
            const bounds=page.element.getBoundingClientRect(),visible=viewport();
            // The first reading page includes the header: its start is the document top,
            // not the hero's top. Keep the final alignment consistent with the destination.
            page.start=index===0?0:scrollY+bounds.top;
            page.end=scrollY+bounds.bottom;
            window.scrollTo({top:Math.max(0,(end?Math.max(page.start,page.end-visible.height):page.start)-visible.top),behavior:"instant"});
          }
          update();
        }
      };
      animationFrame=requestAnimationFrame(tick);
    }
    navigate.current=index=>go(index);
    turn.current=sign=>{
      const index=inputPage(),page=measured[index];if(!page || suspended())return;
      const v=viewport(),rect=page.element.getBoundingClientRect(),start=index===0?0:scrollY+rect.top-v.top,end=Math.max(start,scrollY+rect.bottom-v.top-v.height);
      // A map is a reading stop of its own inside the longer rescue section.
      const stops=Array.from(page.element.querySelectorAll<HTMLElement>('.rescue-map-heading,.rescue-care,.geography-story,.geography-place-list,.archive-reader')).map(element=>scrollY+element.getBoundingClientRect().top-v.top).filter(position=>position>start+4 && position<=end+4);
      const nextStop=sign>0?stops.find(position=>position>scrollY+4):stops.reverse().find(position=>position<scrollY-4);
      if(sign>0 && scrollY<end-4)go(index,false,"replace",Math.min(end,nextStop??Infinity,scrollY+v.height*.9));
      else if(sign<0 && scrollY>start+4)go(index,false,"replace",Math.max(start,nextStop??-Infinity,scrollY-v.height*.9));
      else go(index+sign,sign<0);
    };
    refresh.current=scheduleMeasure;
    function boundary(index:number,sign:number){
      const page=measured[index];if(!page)return false;
      const v=viewport(),top=scrollY+v.top;
      return page.end-page.start<=v.height+4 || (sign>0?top+v.height>=page.end-4:top<=page.start+4);
    }
    function inputPage(){
      const top=scrollY+viewport().top+4;
      let index=0;measured.forEach((page,i)=>{if(page.start<=top)index=i;});
      return index;
    }
    function scrollable(target:EventTarget|null,delta:number){
      let element=target instanceof Element?target:null;
      while(element && element!==document.body){
        if(element instanceof HTMLElement && element.scrollHeight>element.clientHeight+2 && /auto|scroll/.test(getComputedStyle(element).overflowY) && (delta>0?element.scrollTop+element.clientHeight<element.scrollHeight-2:element.scrollTop>2))return true;
        element=element.parentElement;
      }
      return false;
    }
    function settle(){
      if(!naturalScroll || paging || pointerHeld || suspended())return;
      naturalScroll=false;
      const v=viewport(),position=scrollY+v.top,threshold=Math.min(v.height*.2,180);
      // Snap only in the direction being read: never pull a reader back into a long section.
      const candidates=measured.map((page,index)=>({index,distance:page.start-position})).filter(p=>direction>0?p.distance>=1 && p.distance<=threshold:p.distance<=-1 && p.distance>=-threshold);
      const nearest=candidates.sort((a,b)=>Math.abs(a.distance)-Math.abs(b.distance))[0];
      if(nearest)go(nearest.index,false,"none");
    }
    function onScroll(){schedule();if(naturalScroll && !paging){clearTimeout(settleTimer);settleTimer=window.setTimeout(settle,180);}}
    function wheel(event:WheelEvent){
      if(event.defaultPrevented || event.ctrlKey || suspended() || Math.abs(event.deltaY)<=Math.abs(event.deltaX)*1.2 || scrollable(event.target,event.deltaY))return;
      arrival=null;
      const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport().height:1),sign=Math.sign(delta);
      if(!sign)return;
      const now=performance.now(),gap=now-lastWheel,reversed=direction!==sign;
      if(locked){
        if(reversed && paging && wheelJourney){
          event.preventDefault();const journey=wheelJourney;wheelJourney={from:journey.to,to:journey.from};
          direction=sign;lastWheel=now;lastWheelDelta=Math.abs(delta);go(journey.from);return;
        }
        // Swallow decaying momentum, but respond immediately to a reversed or renewed gesture.
        const renewed=!paging && (gap>90 || Math.abs(delta)>Math.max(24,lastWheelDelta*1.6));
        if(!reversed && !renewed){event.preventDefault();lastWheel=now;lastWheelDelta=Math.abs(delta);return;}
        locked=false;wheelTotal=0;wheelJourney=null;
      }
      if(paging)stop();
      if(now-lastWheel>180 || direction!==sign)wheelTotal=0;
      lastWheel=now;lastWheelDelta=Math.abs(delta);direction=sign;
      const index=inputPage();
      if(boundary(index,sign)){
        const next=index+sign;
        if(next>=0 && next<measured.length){event.preventDefault();wheelTotal+=delta;if(Math.abs(wheelTotal)>=45){locked=true;wheelJourney={from:index,to:next};go(next,sign<0);}return;}
      }
      naturalScroll=true;
    }
    function touchStart(event:TouchEvent){
      if(event.touches.length!==1){touch=null;return;}
      const p=event.touches[0],target=event.target instanceof Element?event.target:null,index=inputPage();
      touch={x:p.clientX,y:p.clientY,index,from:scrollY,forward:boundary(index,1),backward:boundary(index,-1),locked:false,ignored:!!target?.closest('input,textarea,select,[role="slider"],svg,canvas,.archive-fold-paper')};
    }
    function touchMove(event:TouchEvent){
      const start=touch;
      if(!start || start.ignored || event.defaultPrevented || suspended() || event.touches.length!==1)return;
      const p=event.touches[0],x=p.clientX-start.x,y=p.clientY-start.y,sign=y<0?1:-1;
      if(!start.locked){
        if(Math.abs(y)<8 || Math.abs(y)<Math.abs(x)*1.3 || scrollable(event.target,-y))return;
        const next=start.index+sign;
        if(!(sign>0?start.forward:start.backward) || next<0 || next>=measured.length)return;
        start.locked=true;
      }
      // Follow the finger directly and suppress native fling only for a page turn.
      event.preventDefault();naturalScroll=false;clearTimeout(settleTimer);
      window.scrollTo({top:Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,start.from-y)),behavior:"instant"});
    }
    function touchEnd(event:TouchEvent){
      const start=touch;touch=null;
      if(!start || start.ignored || event.defaultPrevented || suspended() || !event.changedTouches.length)return;
      const p=event.changedTouches[0],x=p.clientX-start.x,y=p.clientY-start.y;
      if(start.locked && (Math.abs(y)<45 || Math.abs(y)<Math.abs(x)*1.3)){
        window.scrollTo({top:start.from,behavior:reduced.matches?"instant":"smooth"});return;
      }
      if(Math.abs(y)<45 || Math.abs(y)<Math.abs(x)*1.3)return;
      direction=y<0?1:-1;
      const next=start.index+direction;
      if(start.locked && (direction>0?start.forward:start.backward) && next>=0 && next<measured.length){go(next,direction<0);}
      else{naturalScroll=true;clearTimeout(settleTimer);settleTimer=window.setTimeout(settle,220);}
    }
    function touchCancel(){if(touch?.locked)window.scrollTo({top:touch.from,behavior:"instant"});touch=null;pointerHeld=false;}
    function pointerDown(){pointerHeld=true;naturalScroll=false;arrival=null;if(paging)stop();}
    function pointerUp(){pointerHeld=false;}
    function click(event:MouseEvent){
      const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('.site-header a[href^="#"],.site-footer a[href^="#"],.skip-link[href^="#"]'):null;
      if(!anchor || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
      const index=measured.findIndex(page=>`#${page.id}`===anchor.getAttribute("href"));
      if(index>=0){event.preventDefault();go(index,false,"push");}
    }
    function historyChange(){const index=measured.findIndex(page=>`#${page.id}`===location.hash);if(index>=0)go(index,false,"none");}
    let viewportOffset=`${window.visualViewport?.offsetLeft}:${window.visualViewport?.offsetTop}`;
    function viewportScroll(){const offset=`${window.visualViewport?.offsetLeft}:${window.visualViewport?.offsetTop}`;if(offset!==viewportOffset){viewportOffset=offset;scheduleMeasure();}}
    const resize=new ResizeObserver(scheduleMeasure);resize.observe(main);resize.observe(header);elements.forEach(element=>resize.observe(element));
    measure();
    const initialHash=location.hash;
    const initialFrame=requestAnimationFrame(()=>{if(initialHash && !suspended())historyChange();});
    window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("wheel",wheel,{passive:false});
    window.addEventListener("resize",scheduleMeasure);window.visualViewport?.addEventListener("resize",scheduleMeasure);window.visualViewport?.addEventListener("scroll",viewportScroll);
    window.addEventListener("touchstart",touchStart,{passive:true});window.addEventListener("touchmove",touchMove,{passive:false});window.addEventListener("touchend",touchEnd,{passive:true});window.addEventListener("touchcancel",touchCancel,{passive:true});
    window.addEventListener("pointerdown",pointerDown,{passive:true});window.addEventListener("pointerup",pointerUp,{passive:true});window.addEventListener("pointercancel",pointerUp,{passive:true});
    document.addEventListener("click",click);window.addEventListener("hashchange",historyChange);window.addEventListener("popstate",historyChange);
    return()=>{
      stop();headingMotion?.cancel();resize.disconnect();cancelAnimationFrame(initialFrame);cancelAnimationFrame(scrollFrame);cancelAnimationFrame(measureFrame);clearTimeout(settleTimer);
      window.removeEventListener("scroll",onScroll);window.removeEventListener("wheel",wheel);window.removeEventListener("resize",scheduleMeasure);window.visualViewport?.removeEventListener("resize",scheduleMeasure);window.visualViewport?.removeEventListener("scroll",viewportScroll);
      window.removeEventListener("touchstart",touchStart);window.removeEventListener("touchmove",touchMove);window.removeEventListener("touchend",touchEnd);window.removeEventListener("touchcancel",touchCancel);window.removeEventListener("pointerdown",pointerDown);window.removeEventListener("pointerup",pointerUp);window.removeEventListener("pointercancel",pointerUp);
      document.removeEventListener("click",click);window.removeEventListener("hashchange",historyChange);window.removeEventListener("popstate",historyChange);
      delete root.dataset.sectionPages;root.style.removeProperty("--section-page-height");root.style.removeProperty("--section-header-height");elements.forEach(element=>{delete element.dataset.sectionPage;['--page-poppy-height','--page-star-height','--page-chart-size','--page-topology-height','--page-topology-workspace-height','--page-holds-height','--page-voyage-height','--page-rescue-height','--page-timeline-height','--page-archive-height'].forEach(property=>element.style.removeProperty(property));});
    };
  },[]);
  useEffect(()=>{refresh.current();},[locale]);
  if(!pages.length)return null;
  const count=new Intl.NumberFormat(numberLocales[locale],{minimumIntegerDigits:2});
  return <nav className="section-pagination" aria-label={t.nav} data-current-page={pages[current]?.id}>
    <button type="button" className="section-page-arrow" aria-label={t.previous} title={t.previous} disabled={current===0} onClick={()=>turn.current(-1)}><ChevronUp size={16}/></button>
    <div className="section-page-dots" onKeyDown={event=>{const focused=buttons.current.findIndex(button=>button===document.activeElement),base=focused<0?current:focused;let index=base;if(event.key==="ArrowDown")index=Math.min(pages.length-1,base+1);else if(event.key==="ArrowUp")index=Math.max(0,base-1);else if(event.key==="Home")index=0;else if(event.key==="End")index=pages.length-1;else return;event.preventDefault();navigate.current(index);buttons.current[index]?.focus({preventScroll:true});}}>
      {pages.map((page,index)=><button ref={button=>{buttons.current[index]=button;}} type="button" key={page.id} className="section-page-dot" aria-label={`${count.format(index+1)} · ${page.title}`} aria-current={current===index?"step":undefined} onClick={()=>navigate.current(index)}><i aria-hidden="true"/><span className="section-page-title" dir={locale==="ar"?"rtl":"ltr"} aria-hidden="true">{page.title}</span></button>)}
    </div>
    <span className="section-page-count" dir="ltr" aria-label={`${t.current}: ${pages[current]?.title}`}>{count.format(current+1)} / {count.format(pages.length)}</span>
    <button type="button" className="section-page-arrow" aria-label={t.next} title={t.next} disabled={current===pages.length-1} onClick={()=>turn.current(1)}><ChevronDown size={16}/></button>
  </nav>;
}
